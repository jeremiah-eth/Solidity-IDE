import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { EditorComponent } from './components/Editor';
import { CompilerOutput } from './components/CompilerOutput';
import { Deployer } from './components/Deployer';
import { ContractInteraction } from './components/ContractInteraction';
import { DeployedContracts } from './components/DeployedContracts';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { SAMPLE_CONTRACT } from './utils/solidityCompiler';
import { SAMPLE_CONTRACTS } from './components/FileExplorer';
import { testCompilation } from './utils/testCompiler';
import { getAllNetworks } from './utils/networks';
import { deployContract, estimateGas } from './utils/contractDeployment';
import { verifyContract, checkVerificationStatus } from './utils/contractVerification';
import { uploadMetadata, createContractMetadata } from './utils/ipfs-mock';
import { HelpCircle, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { ContractFile, DeployedContract, Network, CompiledContract } from './types';

// Toast interface
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

// App component
export function App() {
  // Wallet state
  const {
    address,
    isConnected,
    chainId,
    signer,
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchNetwork
  } = useWallet();

  // Contract state
  const {
    compiledContracts,
    deployedContracts,
    compilationErrors,
    isLoading: isCompiling,
    error: compilationError,
    compileContract,
    deployContract: deployContractHandler,
    verifyContract: verifyContractHandler,
    uploadMetadata: uploadMetadataHandler,
    saveDeployedContract,
    getDeployedContracts,
    clearErrors
  } = useContract();

  // App state
  const [selectedChainId, setSelectedChainId] = useState<number>(1);
  const [currentFile, setCurrentFile] = useState<string>('SimpleStorage.sol');
  const [files, setFiles] = useState<ContractFile[]>([
    {
      name: 'SimpleStorage.sol',
      content: SAMPLE_CONTRACT,
      path: '/SimpleStorage.sol'
    }
  ]);
  const [activeView, setActiveView] = useState<'editor' | 'deployed'>('editor');
  const [selectedContract, setSelectedContract] = useState<DeployedContract | null>(null);
  const [compilationStatus, setCompilationStatus] = useState<'idle' | 'compiling' | 'success' | 'failed'>('idle');
  const [compilationTime, setCompilationTime] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load deployed contracts from localStorage on mount
  useEffect(() => {
    const savedContracts = localStorage.getItem('deployed_contracts');
    if (savedContracts) {
      try {
        const contracts = JSON.parse(savedContracts);
        contracts.forEach((contract: DeployedContract) => {
          saveDeployedContract(contract);
        });
      } catch (error) {
        console.error('Failed to load deployed contracts:', error);
      }
    }
  }, [saveDeployedContract]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add test function to window for easy testing
  useEffect(() => {
    (window as any).testCompiler = testCompilation;
    console.log('🧪 Test function available: window.testCompiler()');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowKeyboardShortcuts(true);
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get current file content
  const getCurrentFileContent = useCallback(() => {
    const file = files.find(f => f.name === currentFile);
    return file?.content || '';
  }, [files, currentFile]);

  // Convert CompiledContract to CompilationResult
  const convertToCompilationResult = useCallback((contract: CompiledContract | null) => {
    if (!contract) return null;
    return {
      abi: contract.abi,
      bytecode: contract.bytecode,
      errors: compilationErrors.map(e => e.message),
      warnings: []
    };
  }, [compilationErrors]);

  // Update file content
  const updateFileContent = useCallback((content: string) => {
    setFiles(prev => prev.map(file => 
      file.name === currentFile ? { ...file, content } : file
    ));
  }, [currentFile]);

  // Add new file
  const addNewFile = useCallback(() => {
    const fileName = `Contract${files.length + 1}.sol`;
    const newFile: ContractFile = {
      name: fileName,
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ncontract NewContract {\n    \n}',
      path: `/${fileName}`
    };
    setFiles(prev => [...prev, newFile]);
    setCurrentFile(fileName);
  }, [files.length]);

  // Delete file
  const deleteFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    if (currentFile === fileName) {
      const remainingFiles = files.filter(file => file.name !== fileName);
      setCurrentFile(remainingFiles[0]?.name || '');
    }
  }, [currentFile, files]);

  // Rename file
  const renameFile = useCallback((oldName: string, newName: string) => {
    setFiles(prev => prev.map(file => 
      file.name === oldName ? { ...file, name: newName } : file
    ));
    if (currentFile === oldName) {
      setCurrentFile(newName);
    }
  }, [currentFile]);

  // Load sample contract
  const loadSample = useCallback((sampleName: string) => {
    const sample = SAMPLE_CONTRACTS.find(s => s.name === sampleName);
    if (sample) {
      const fileName = `${sampleName}.sol`;
      const newFile: ContractFile = {
        name: fileName,
        content: sample.content,
        path: `/${fileName}`
      };
      setFiles(prev => [...prev, newFile]);
      setCurrentFile(fileName);
    }
  }, []);

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!currentFile) return;

    setCompilationStatus('compiling');
    const startTime = Date.now();

    try {
      const sourceCode = getCurrentFileContent();
      const contractName = currentFile.replace('.sol', '');
      const result = await compileContract(sourceCode, contractName);
      
      setCompilationStatus('success');
      setCompilationTime(Date.now() - startTime);
      showToast('success', 'Contract compiled successfully!');
    } catch (error) {
      setCompilationStatus('failed');
      setCompilationTime(Date.now() - startTime);
      showToast('error', `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentFile, getCurrentFileContent, compileContract]);

  // Handle deployment
  const handleDeploy = useCallback(async (contract: any, constructorArgs: any[], signer: any) => {
    try {
      const result = await deployContract(contract.bytecode, contract.abi, constructorArgs, signer);
      
      // Get current network
      const network = getAllNetworks().find(n => n.chainId === selectedChainId);
      if (!network) throw new Error('Network not found');

      // Create deployed contract object
      const deployedContract: DeployedContract = {
        address: result.contractAddress,
        contractName: contract.contractName,
        network: network,
        transactionHash: result.transactionHash,
        deployedAt: new Date(),
        abi: contract.abi
      };

      saveDeployedContract(deployedContract);
      showToast('success', `Contract deployed at ${result.contractAddress}`);
      
      return result;
    } catch (error) {
      showToast('error', `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [selectedChainId, saveDeployedContract]);

  // Handle verification
  const handleVerify = useCallback(async (address: string, sourceCode: string, contractName: string, chainId: number) => {
    try {
      await verifyContract({
        contractAddress: address,
        sourceCode: sourceCode,
        contractName: contractName,
        compilerVersion: '0.8.24',
        constructorArgs: '',
        chainId: chainId
      });
      showToast('success', 'Contract verification submitted successfully!');
    } catch (error) {
      showToast('error', `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Handle metadata upload
  const handleUploadMetadata = useCallback(async (contract: DeployedContract, chainId: number) => {
    try {
      const metadata = createContractMetadata(
        contract.contractName,
        getCurrentFileContent(),
        contract.abi,
        {
          [contract.network.chainId.toString()]: {
            address: contract.address,
            transactionHash: contract.transactionHash
          }
        }
      );

      const cid = await uploadMetadata(metadata);
      showToast('success', `Metadata uploaded to IPFS: ${cid}`);
    } catch (error) {
      showToast('error', `Metadata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [getCurrentFileContent]);

  // Handle network change
  const handleNetworkChange = useCallback(async (newChainId: number) => {
    setSelectedChainId(newChainId);
    if (isConnected && signer) {
      try {
        await switchNetwork(newChainId);
        showToast('success', `Switched to ${getAllNetworks().find(n => n.chainId === newChainId)?.name}`);
      } catch (error) {
        showToast('error', `Failed to switch network: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [isConnected, signer, switchNetwork]);

  // Handle contract selection
  const handleSelectContract = useCallback((contract: DeployedContract) => {
    setSelectedContract(contract);
    setActiveView('deployed');
  }, []);

  // Handle contract deletion
  const handleDeleteContract = useCallback((contract: DeployedContract) => {
    // This would be handled by the useContract hook
    showToast('info', `Contract ${contract.contractName} deleted`);
  }, []);

  // Show toast
  const showToast = useCallback((type: Toast['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Get current network
  const currentNetwork = getAllNetworks().find(n => n.chainId === selectedChainId);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header
        selectedChainId={selectedChainId}
        onNetworkChange={handleNetworkChange}
        wallet={{ address, isConnected }}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {isMobile ? (
          /* Mobile Layout */
          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveView('editor')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeView === 'editor'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveView('deployed')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeView === 'deployed'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Contracts
              </button>
            </div>
            
            {activeView === 'editor' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1">
                  <EditorComponent
                    fileName={currentFile}
                    value={getCurrentFileContent()}
                    onChange={updateFileContent}
                    onCompile={handleCompile}
                    isCompiling={isCompiling}
                    compilationStatus={compilationStatus}
                  />
                </div>
                <div className="h-1/2 border-t border-gray-700">
                  <CompilerOutput
                    compilationResult={convertToCompilationResult(compiledContracts.get(currentFile.replace('.sol', '')) || null)}
                    errors={compilationErrors.map(e => e.message)}
                    warnings={[]}
                    compilationTime={compilationTime}
                  />
                </div>
              </div>
            )}
            
            {activeView === 'deployed' && (
              <div className="flex-1 p-4">
                <DeployedContracts
                  contracts={getDeployedContracts()}
                  selectedChainId={selectedChainId}
                  onSelectContract={handleSelectContract}
                  onDeleteContract={handleDeleteContract}
                />
              </div>
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <>
            {/* Left Panel - File Explorer */}
            <div className="w-1/5 border-r border-gray-700">
              <FileExplorer
                files={files}
                selectedFile={currentFile}
                onSelectFile={setCurrentFile}
                onAddFile={addNewFile}
                onDeleteFile={deleteFile}
                onRenameFile={renameFile}
                onLoadSample={loadSample}
              />
            </div>

            {/* Center Panel - Editor */}
            <div className="w-1/2 border-r border-gray-700">
              <EditorComponent
                fileName={currentFile}
                value={getCurrentFileContent()}
                onChange={updateFileContent}
                onCompile={handleCompile}
                isCompiling={isCompiling}
                compilationStatus={compilationStatus}
              />
            </div>

            {/* Right Panel - Compiler Output + Deployer */}
            <div className="w-1/5 flex flex-col">
              <div className="flex-1 border-b border-gray-700">
                <CompilerOutput
                  compilationResult={convertToCompilationResult(compiledContracts.get(currentFile.replace('.sol', '')) || null)}
                  errors={compilationErrors.map(e => e.message)}
                  warnings={[]}
                  compilationTime={compilationTime}
                />
              </div>
              <div className="flex-1">
                <Deployer
                  compiledContract={compiledContracts.get(currentFile.replace('.sol', '')) || null}
                  network={currentNetwork || null}
                  chainId={selectedChainId}
                  signer={signer}
                  onDeploy={handleDeploy}
                  onVerify={handleVerify}
                  onUploadMetadata={handleUploadMetadata}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Panel - Contract Interaction (Desktop only) */}
      {!isMobile && selectedContract && (
        <div className="fixed bottom-0 left-0 right-0 h-1/3 border-t border-gray-700 bg-gray-800">
          <div className="h-full overflow-auto">
            <ContractInteraction
              deployedContracts={getDeployedContracts()}
              selectedContract={selectedContract}
              chainId={selectedChainId}
              signer={signer}
              onSelectContract={handleSelectContract}
            />
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-2 p-3 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {toast.type === 'info' && <AlertCircle className="h-5 w-5" />}
            <span className="text-white text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Compile</span>
                <span className="text-gray-400">Ctrl/Cmd + S</span>
              </div>
              <div className="flex justify-between">
                <span>Format Code</span>
                <span className="text-gray-400">Shift + Alt + F</span>
              </div>
              <div className="flex justify-between">
                <span>Show Shortcuts</span>
                <span className="text-gray-400">?</span>
              </div>
              <div className="flex justify-between">
                <span>Close Modal</span>
                <span className="text-gray-400">Esc</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed bottom-4 right-4 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Keyboard Shortcuts"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

export default App;
