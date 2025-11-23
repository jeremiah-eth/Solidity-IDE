import { ethers, BrowserProvider, ContractFactory, Contract, JsonRpcProvider } from 'ethers';
import { getRpcUrl, getNetworkByChainId, getAllNetworks } from './networks';
import type { Network, DeployedContract } from '../types';

// Deployment result interface
export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  deployedContract: DeployedContract;
}

// Gas estimation result interface
export interface GasEstimation {
  gasLimit: bigint;
  gasPrice: bigint;
  estimatedCost: string; // in ETH
}

// Legacy wallet connection functions removed in favor of AppKit
// See useWallet.ts and useAppKitWallet.ts for new implementation

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

// getCurrentNetwork removed - use useWallet hook instead

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
