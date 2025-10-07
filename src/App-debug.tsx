import React, { useState } from 'react';
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
import { getAllNetworks } from './utils/networks';
import { deployContract, estimateGas } from './utils/contractDeployment';
import { verifyContract, checkVerificationStatus } from './utils/contractVerification';
import { uploadMetadata, createContractMetadata } from './utils/ipfs';
import { HelpCircle, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { ContractFile, DeployedContract, Network, CompiledContract } from './types';

export default function App() {
  console.log('App component is rendering with hooks');
  
  try {
    // Test the hooks one by one
    console.log('Testing useWallet hook...');
    const wallet = useWallet();
    console.log('useWallet result:', wallet);
    
    console.log('Testing useContract hook...');
    const contract = useContract();
    console.log('useContract result:', contract);
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold">Solidity IDE - Debug Mode</h1>
        <p className="mt-4">Hooks are working correctly!</p>
        <p className="mt-2 text-gray-400">Check the browser console for hook details.</p>
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <p>Wallet connected: {wallet.isConnected ? 'Yes' : 'No'}</p>
          <p>Address: {wallet.address || 'Not connected'}</p>
          <p>Chain ID: {wallet.chainId || 'Unknown'}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold text-red-500">Error in App Component</h1>
        <p className="mt-4 text-red-300">Check the browser console for details.</p>
        <pre className="mt-4 p-4 bg-gray-800 rounded text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
