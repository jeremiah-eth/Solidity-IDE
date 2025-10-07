import { ethers, BrowserProvider, ContractFactory, Contract, JsonRpcProvider } from 'ethers';
import { getRpcUrl, getNetworkByChainId, getAllNetworks } from './networks';
import type { Network, DeployedContract } from '../types';

// Wallet connection result interface
interface WalletConnection {
  signer: ethers.Signer;
  address: string;
  provider: BrowserProvider;
}

// Deployment result interface
interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  deployedContract: DeployedContract;
}

// Gas estimation result interface
interface GasEstimation {
  gasLimit: bigint;
  gasPrice: bigint;
  estimatedCost: string; // in ETH
}

// MetaMask provider interface
interface MetaMaskProvider extends ethers.Eip1193Provider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

// Check if MetaMask is installed
function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         typeof (window as any).ethereum !== 'undefined' && 
         (window as any).ethereum.isMetaMask;
}

// Get MetaMask provider
function getMetaMaskProvider(): MetaMaskProvider {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  return (window as any).ethereum as MetaMaskProvider;
}

// Connect to MetaMask wallet
export async function connectWallet(): Promise<WalletConnection> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  const provider = getMetaMaskProvider();
  
  try {
    // Request account access
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    // Create ethers provider and signer
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    return {
      signer,
      address,
      provider: ethersProvider
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('User rejected')) {
      throw new Error('User rejected the connection request.');
    }
    throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Switch to specified network
export async function switchNetwork(chainId: number): Promise<void> {
  const provider = getMetaMaskProvider();
  const network = getNetworkByChainId(chainId);
  
  if (!network) {
    throw new Error(`Network with chain ID ${chainId} is not supported.`);
  }

  try {
    // Try to switch to the network
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
  } catch (error: any) {
    // If network doesn't exist, add it
    if (error.code === 4902 || error.code === -32603) {
      await addNetwork(network);
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
}

// Add network to MetaMask
async function addNetwork(network: Network): Promise<void> {
  const provider = getMetaMaskProvider();
  
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.chainId.toString(16)}`,
        chainName: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : []
      }]
    });
  } catch (error: any) {
    throw new Error(`Failed to add network: ${error.message}`);
  }
}

// Deploy contract
export async function deployContract(
  bytecode: string,
  abi: any[],
  constructorArgs: any[],
  signer: ethers.Signer
): Promise<DeploymentResult> {
  try {
    // Create contract factory
    const factory = new ContractFactory(abi, bytecode, signer);
    
    // Deploy contract
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    // Get deployment details
    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    
    if (!deploymentTx) {
      throw new Error('Deployment transaction not found');
    }
    
    // Get transaction receipt
    const receipt = await deploymentTx.wait();
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    // Get network info
    const provider = signer.provider;
    const network = await provider?.getNetwork();
    const networkConfig = network ? getNetworkByChainId(Number(network.chainId)) : null;
    
    if (!networkConfig) {
      throw new Error('Network configuration not found');
    }
    
    // Create deployed contract object
    const deployedContract: DeployedContract = {
      address: contractAddress,
      contractName: 'DeployedContract', // This should be passed as parameter
      network: networkConfig,
      transactionHash: deploymentTx.hash,
      deployedAt: new Date(),
      abi: abi
    };
    
    return {
      contractAddress,
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      deployedContract
    };
  } catch (error) {
    throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Estimate gas for deployment
export async function estimateGas(
  bytecode: string,
  abi: any[],
  constructorArgs: any[],
  signer: ethers.Signer
): Promise<GasEstimation> {
  try {
    // Create contract factory
    const factory = new ContractFactory(abi, bytecode, signer);
    
    // Get gas price from provider
    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Estimate gas limit
    const gasLimit = await factory.getDeployTransaction(...constructorArgs).then(tx => {
      return signer.estimateGas(tx);
    });
    
    // Calculate estimated cost
    const estimatedCost = ethers.formatEther(gasLimit * gasPrice);
    
    return {
      gasLimit,
      gasPrice,
      estimatedCost
    };
  } catch (error) {
    throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get transaction receipt
export async function getTransactionReceipt(
  txHash: string,
  provider: ethers.Provider
): Promise<ethers.TransactionReceipt | null> {
  try {
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    throw new Error(`Failed to get transaction receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get current network
export async function getCurrentNetwork(): Promise<Network | null> {
  try {
    const provider = getMetaMaskProvider();
    const chainId = await provider.request({ method: 'eth_chainId' });
    const networkId = parseInt(chainId, 16);
    return getNetworkByChainId(networkId) || null;
  } catch (error) {
    console.error('Failed to get current network:', error);
    return null;
  }
}

// Get account balance
export async function getAccountBalance(address: string, provider: ethers.Provider): Promise<string> {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if network is supported
export function isNetworkSupported(chainId: number): boolean {
  return getNetworkByChainId(chainId) !== undefined;
}

// Get all supported networks
export function getSupportedNetworks(): Network[] {
  return getAllNetworks();
}

// Wait for transaction confirmation
export async function waitForTransaction(
  txHash: string,
  provider: ethers.Provider,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  try {
    return await provider.waitForTransaction(txHash, confirmations);
  } catch (error) {
    throw new Error(`Failed to wait for transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced deployment with gas estimation
export async function deployContractWithEstimation(
  bytecode: string,
  abi: any[],
  constructorArgs: any[],
  signer: ethers.Signer,
  maxGasPrice?: bigint
): Promise<DeploymentResult> {
  try {
    // Estimate gas first
    const gasEstimation = await estimateGas(bytecode, abi, constructorArgs, signer);
    
    // Check if gas price is acceptable
    if (maxGasPrice && gasEstimation.gasPrice > maxGasPrice) {
      throw new Error(`Gas price ${ethers.formatUnits(gasEstimation.gasPrice, 'gwei')} gwei exceeds maximum ${ethers.formatUnits(maxGasPrice, 'gwei')} gwei`);
    }
    
    // Deploy with estimated gas
    const factory = new ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constructorArgs, {
      gasLimit: gasEstimation.gasLimit,
      gasPrice: gasEstimation.gasPrice
    });
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    // Get deployment details
    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    
    if (!deploymentTx) {
      throw new Error('Deployment transaction not found');
    }
    
    // Get transaction receipt
    const receipt = await deploymentTx.wait();
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    // Get network info
    const provider = signer.provider;
    const network = await provider?.getNetwork();
    const networkConfig = network ? getNetworkByChainId(Number(network.chainId)) : null;
    
    if (!networkConfig) {
      throw new Error('Network configuration not found');
    }
    
    // Create deployed contract object
    const deployedContract: DeployedContract = {
      address: contractAddress,
      contractName: 'DeployedContract',
      network: networkConfig,
      transactionHash: deploymentTx.hash,
      deployedAt: new Date(),
      abi: abi
    };
    
    return {
      contractAddress,
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      deployedContract
    };
  } catch (error) {
    throw new Error(`Enhanced deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
