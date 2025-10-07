import { useState, useCallback, useEffect } from 'react';
import { compileContract, testCompiler } from '../utils/solidityCompiler';
import { deployContract, deployContractWithEstimation } from '../utils/contractDeployment';
import { verifyContract, checkVerificationStatus, pollVerificationStatus } from '../utils/contractVerification';
import { uploadMetadata, createContractMetadata, uploadSourceCode } from '../utils/ipfs-mock';
import { getNetworkByChainId } from '../utils/networks';
import type { Network, CompiledContract, DeployedContract, CompilationError, ContractFile } from '../types';

// Contract compilation result interface
interface CompilationResult {
  abi: any[];
  bytecode: string;
  errors: string[];
  warnings: string[];
}

// Contract deployment result interface
interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  deployedContract: DeployedContract;
}

// Contract verification result interface
interface VerificationResult {
  guid: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  explorerUrl?: string;
}

// Contract metadata upload result interface
interface MetadataUploadResult {
  cid: string;
  url: string;
}

// Contract state interface
interface ContractState {
  compiledContracts: Map<string, CompiledContract>;
  deployedContracts: DeployedContract[];
  compilationErrors: CompilationError[];
  isLoading: boolean;
  error: string | null;
  verificationStatus: Map<string, VerificationResult>;
}

// Contract actions interface
interface ContractActions {
  compileContract: (sourceCode: string, contractName: string) => Promise<CompilationResult>;
  deployContract: (bytecode: string, abi: any[], chainId: number, signer: any) => Promise<DeploymentResult>;
  verifyContract: (address: string, sourceCode: string, contractName: string, chainId: number) => Promise<VerificationResult>;
  uploadMetadata: (contract: DeployedContract, chainId: number) => Promise<MetadataUploadResult>;
  saveDeployedContract: (contract: DeployedContract) => void;
  getDeployedContracts: () => DeployedContract[];
  clearErrors: () => void;
  removeDeployedContract: (address: string) => void;
  updateVerificationStatus: (address: string, status: VerificationResult) => void;
  testCompiler: () => Promise<CompilationResult>;
}

// Combined hook return type
type UseContractReturn = ContractState & ContractActions;

// Local storage keys
const STORAGE_KEYS = {
  DEPLOYED_CONTRACTS: 'deployed_contracts',
  COMPILED_CONTRACTS: 'compiled_contracts'
};

// Custom hook for contract management
export function useContract(): UseContractReturn {
  // State
  const [compiledContracts, setCompiledContracts] = useState<Map<string, CompiledContract>>(new Map());
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [compilationErrors, setCompilationErrors] = useState<CompilationError[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<Map<string, VerificationResult>>(new Map());

  // Load deployed contracts from localStorage on mount
  useEffect(() => {
    const loadDeployedContracts = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.DEPLOYED_CONTRACTS);
        if (stored) {
          const contracts = JSON.parse(stored);
          setDeployedContracts(contracts);
        }
      } catch (err) {
        console.error('Failed to load deployed contracts:', err);
      }
    };

    loadDeployedContracts();
  }, []);

  // Save deployed contracts to localStorage
  const saveDeployedContracts = useCallback((contracts: DeployedContract[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPLOYED_CONTRACTS, JSON.stringify(contracts));
    } catch (err) {
      console.error('Failed to save deployed contracts:', err);
    }
  }, []);

  // Compile contract function
  const compileContractHandler = useCallback(async (sourceCode: string, contractName: string): Promise<CompilationResult> => {
    setIsLoading(true);
    setError(null);
    setCompilationErrors([]);

    try {
      const result = await compileContract(sourceCode, contractName);
      
      if (result.errors.length > 0) {
        const errors: CompilationError[] = result.errors.map((error, index) => ({
          type: 'error' as const,
          message: error,
          line: undefined,
          column: undefined
        }));
        setCompilationErrors(errors);
        throw new Error(`Compilation failed: ${result.errors.join(', ')}`);
      }

      // Store compiled contract
      const compiledContract: CompiledContract = {
        abi: result.abi,
        bytecode: result.bytecode,
        contractName: contractName
      };

      setCompiledContracts(prev => new Map(prev.set(contractName, compiledContract)));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compilation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deploy contract function
  const deployContractHandler = useCallback(async (
    bytecode: string, 
    abi: any[], 
    chainId: number, 
    signer: any
  ): Promise<DeploymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deployContract(bytecode, abi, [], signer);
      
      // Get network info
      const network = getNetworkByChainId(chainId);
      if (!network) {
        throw new Error(`Network with chain ID ${chainId} not found`);
      }

      // Create deployed contract object
      const deployedContract: DeployedContract = {
        address: result.contractAddress,
        contractName: 'DeployedContract', // This should be passed as parameter
        network: network,
        transactionHash: result.transactionHash,
        deployedAt: new Date(),
        abi: abi
      };

      // Update deployed contracts
      setDeployedContracts(prev => {
        const updated = [...prev, deployedContract];
        saveDeployedContracts(updated);
        return updated;
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deployment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveDeployedContracts]);

  // Verify contract function
  const verifyContractHandler = useCallback(async (
    address: string, 
    sourceCode: string, 
    contractName: string, 
    chainId: number
  ): Promise<VerificationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyContract({
        contractAddress: address,
        sourceCode: sourceCode,
        contractName: contractName,
        compilerVersion: '0.8.24',
        constructorArgs: '',
        chainId: chainId
      });

      // Update verification status
      setVerificationStatus(prev => new Map(prev.set(address, result)));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload metadata function
  const uploadMetadataHandler = useCallback(async (
    contract: DeployedContract, 
    chainId: number
  ): Promise<MetadataUploadResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create metadata
      const metadata = createContractMetadata(
        contract.contractName,
        '', // Source code should be passed as parameter
        contract.abi,
        {
          [contract.network.chainId.toString()]: {
            address: contract.address,
            transactionHash: contract.transactionHash
          }
        }
      );

      // Upload to IPFS
      const cid = await uploadMetadata(metadata);
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      return { cid, url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Metadata upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save deployed contract function
  const saveDeployedContract = useCallback((contract: DeployedContract) => {
    setDeployedContracts(prev => {
      const updated = [...prev, contract];
      saveDeployedContracts(updated);
      return updated;
    });
  }, [saveDeployedContracts]);

  // Get deployed contracts function
  const getDeployedContracts = useCallback((): DeployedContract[] => {
    return deployedContracts;
  }, [deployedContracts]);

  // Clear errors function
  const clearErrors = useCallback(() => {
    setError(null);
    setCompilationErrors([]);
  }, []);

  // Remove deployed contract function
  const removeDeployedContract = useCallback((address: string) => {
    setDeployedContracts(prev => {
      const updated = prev.filter(contract => contract.address !== address);
      saveDeployedContracts(updated);
      return updated;
    });
  }, [saveDeployedContracts]);

  // Update verification status function
  const updateVerificationStatus = useCallback((address: string, status: VerificationResult) => {
    setVerificationStatus(prev => new Map(prev.set(address, status)));
  }, []);

  // Test compiler function
  const testCompilerHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await testCompiler();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compiler test failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    compiledContracts,
    deployedContracts,
    compilationErrors,
    isLoading,
    error,
    verificationStatus,
    
    // Actions
    compileContract: compileContractHandler,
    deployContract: deployContractHandler,
    verifyContract: verifyContractHandler,
    uploadMetadata: uploadMetadataHandler,
    saveDeployedContract,
    getDeployedContracts,
    clearErrors,
    removeDeployedContract,
    updateVerificationStatus,
    
    // Additional utilities
    testCompiler: testCompilerHandler
  };
}

// Hook for getting contract compilation status
export function useContractCompilation() {
  const { compiledContracts, compilationErrors, isLoading, error } = useContract();
  
  return {
    compiledContracts: Array.from(compiledContracts.values()),
    compilationErrors,
    isLoading,
    error,
    hasErrors: compilationErrors.length > 0
  };
}

// Hook for getting deployed contracts
export function useDeployedContracts() {
  const { deployedContracts, removeDeployedContract, getDeployedContracts } = useContract();
  
  return {
    deployedContracts,
    removeDeployedContract,
    getDeployedContracts,
    contractCount: deployedContracts.length
  };
}

// Hook for getting verification status
export function useContractVerification() {
  const { verificationStatus, updateVerificationStatus } = useContract();
  
  return {
    verificationStatus: Array.from(verificationStatus.entries()),
    updateVerificationStatus,
    getVerificationStatus: (address: string) => verificationStatus.get(address)
  };
}
