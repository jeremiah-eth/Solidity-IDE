import type { Network } from '../types';

// QuickNode Multichain RPC URL (works for all EVM chains)
const QUICKNODE_URL = import.meta.env.VITE_QUICKNODE_URL || '';
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || '';

import { LOCAL_NODE_URL } from './localNode';

// Network configurations
export const networks: Record<string, Network> = {
  // Hardhat Local Network
  hardhat: {
    id: 'hardhat',
    name: 'Hardhat Local',
    chainId: 31337,
    rpcUrl: LOCAL_NODE_URL,
    blockExplorer: '',
    blockExplorerApi: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Generic Localhost
  localhost: {
    id: 'localhost',
    name: 'Localhost',
    chainId: 1337,
    rpcUrl: LOCAL_NODE_URL,
    blockExplorer: '',
    blockExplorerApi: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Ethereum Mainnet
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://etherscan.io',
    blockExplorerApi: 'https://api.etherscan.io/api',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Ethereum Sepolia Testnet
  sepolia: {
    id: 'sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://sepolia.etherscan.io',
    blockExplorerApi: 'https://api-sepolia.etherscan.io/api',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Base Mainnet
  base: {
    id: 'base',
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://basescan.org',
    blockExplorerApi: 'https://api.basescan.org/api',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Base Sepolia Testnet
  baseSepolia: {
    id: 'baseSepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://sepolia.basescan.org',
    blockExplorerApi: 'https://api-sepolia.basescan.org/api',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },

  // Celo Mainnet
  celo: {
    id: 'celo',
    name: 'Celo Mainnet',
    chainId: 42220,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://celoscan.io',
    blockExplorerApi: 'https://api.celoscan.io/api',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18
    }
  },

  // Celo Alfajores Testnet
  alfajores: {
    id: 'alfajores',
    name: 'Celo Alfajores',
    chainId: 44787,
    rpcUrl: QUICKNODE_URL,
    blockExplorer: 'https://alfajores.celoscan.io',
    blockExplorerApi: 'https://api-alfajores.celoscan.io/api',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18
    }
  }
};

// Get RPC URL for a specific chain ID
export function getRpcUrl(chainId: number): string {
  const network = Object.values(networks).find(n => n.chainId === chainId);
  return network?.rpcUrl || '';
}

// Get block explorer API URL for a specific chain ID
export function getExplorerApiUrl(chainId: number): string {
  const network = Object.values(networks).find(n => n.chainId === chainId);
  return network?.blockExplorerApi || '';
}

// Get Etherscan API key (works for all EVM chains)
export function getExplorerApiKey(): string {
  return ETHERSCAN_API_KEY || '';
}

// Get block explorer URL for a specific chain ID
export function getExplorerUrl(chainId: number): string {
  const network = Object.values(networks).find(n => n.chainId === chainId);
  return network?.blockExplorer || '';
}

// Get network by chain ID
export function getNetworkByChainId(chainId: number): Network | undefined {
  return Object.values(networks).find(n => n.chainId === chainId);
}

// Get all networks as array
export function getAllNetworks(): Network[] {
  return Object.values(networks);
}

// Get supported chain IDs
export function getSupportedChainIds(): number[] {
  return Object.values(networks).map(n => n.chainId);
}
