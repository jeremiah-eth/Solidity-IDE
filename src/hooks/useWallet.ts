import { useAppKitWallet } from './useAppKitWallet';
import { getNetworkByChainId } from '../utils/networks';
import type { Network } from '../types';
import { ethers } from 'ethers';

// Wallet state interface
interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  signer: ethers.Signer | null;
  isLoading: boolean;
  error: string | null;
}

// Wallet actions interface
interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  getCurrentNetwork: () => Network | null;
  isNetworkSupported: (chainId: number) => boolean;
}

// Combined hook return type
type UseWalletReturn = WalletState & WalletActions;

// Custom hook for wallet management
export function useWallet(): UseWalletReturn {
  const {
    address,
    isConnected,
    chainId,
    signer,
    connect,
    disconnect,
    switchNetwork: appKitSwitchNetwork
  } = useAppKitWallet();

  // AppKit handles loading state internally, but we can expose a simple one if needed
  // For now we'll assume false as AppKit modal handles UI
  const isLoading = false;
  const error = null;

  // Get current network info
  const getCurrentNetwork = (): Network | null => {
    if (!chainId) return null;
    return getNetworkByChainId(chainId) || null;
  };

  // Check if current network is supported
  const isNetworkSupported = (checkChainId: number): boolean => {
    return getNetworkByChainId(checkChainId) !== undefined;
  };

  const handleSwitchNetwork = async (newChainId: number) => {
    try {
      await appKitSwitchNetwork(newChainId);
    } catch (err) {
      console.error('Failed to switch network:', err);
      if (newChainId === 31337 || newChainId === 1337) {
        throw new Error('Failed to connect to Localhost. Is Hardhat/Anvil running on port 8545?');
      }
      throw err;
    }
  };

  return {
    // State
    address,
    isConnected,
    chainId,
    signer,
    isLoading,
    error,

    // Actions
    connect,
    disconnect,
    switchNetwork: handleSwitchNetwork,

    // Additional utilities
    getCurrentNetwork,
    isNetworkSupported
  };
}

// Hook for getting current network info
export function useCurrentNetwork() {
  const { chainId, getCurrentNetwork, isNetworkSupported } = useWallet();

  return {
    network: getCurrentNetwork(),
    chainId,
    isSupported: chainId ? isNetworkSupported(chainId) : false
  };
}

// Hook for wallet connection status
export function useWalletConnection() {
  const { isConnected, address, chainId, isLoading, error } = useWallet();

  return {
    isConnected,
    address,
    chainId,
    isLoading,
    error,
    isMetaMaskInstalled: true // Deprecated but kept for compatibility
  };
}

