import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { connectWallet, switchNetwork as switchNetworkUtil } from '../utils/contractDeployment';
import { getNetworkByChainId } from '../utils/networks';
import type { Network } from '../types';

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

// MetaMask provider interface
interface MetaMaskProvider extends ethers.Eip1193Provider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

// Get MetaMask provider
function getMetaMaskProvider(): MetaMaskProvider | null {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }
  return (window as any).ethereum as MetaMaskProvider;
}

// Check if MetaMask is installed
function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         typeof (window as any).ethereum !== 'undefined' && 
         (window as any).ethereum.isMetaMask;
}

// Custom hook for wallet management
export function useWallet(): UseWalletReturn {
  // State
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const connection = await connectWallet();
      setAddress(connection.address);
      setIsConnected(true);
      setSigner(connection.signer);
      
      // Get current chain ID
      const provider = getMetaMaskProvider();
      if (provider) {
        const currentChainId = await provider.request({ method: 'eth_chainId' });
        setChainId(parseInt(currentChainId, 16));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setChainId(null);
    setSigner(null);
    setError(null);
    
    // Clear any stored connection state
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_address');
  }, []);

  // Switch network function
  const switchNetwork = useCallback(async (newChainId: number) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await switchNetworkUtil(newChainId);
      setChainId(newChainId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch network';
      setError(errorMessage);
      console.error('Network switch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnect();
    } else {
      // User switched accounts
      setAddress(accounts[0] || null);
    }
  }, [disconnect]);

  // Handle chain changes
  const handleChainChanged = useCallback((newChainId: string) => {
    const chainIdNumber = parseInt(newChainId, 16);
    setChainId(chainIdNumber);
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const autoReconnect = async () => {
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      const savedAddress = localStorage.getItem('wallet_address');
      
      if (wasConnected && savedAddress && isMetaMaskInstalled()) {
        try {
          const provider = getMetaMaskProvider();
          if (provider) {
            // Check if still connected
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
              
              // Get current chain ID
              const currentChainId = await provider.request({ method: 'eth_chainId' });
              setChainId(parseInt(currentChainId, 16));
              
              // Recreate signer
              const ethersProvider = new ethers.BrowserProvider(provider);
              const newSigner = await ethersProvider.getSigner();
              setSigner(newSigner);
            } else {
              // Clear stored state if not connected
              localStorage.removeItem('wallet_connected');
              localStorage.removeItem('wallet_address');
            }
          }
        } catch (err) {
          console.error('Auto-reconnect failed:', err);
          // Clear stored state on error
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('wallet_address');
        }
      }
    };

    autoReconnect();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    // Add event listeners
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    // Cleanup function
    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  // Update localStorage when connection state changes
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_address', address);
    }
  }, [isConnected, address]);

  // Get current network info
  const getCurrentNetwork = useCallback((): Network | null => {
    if (!chainId) return null;
    return getNetworkByChainId(chainId) || null;
  }, [chainId]);

  // Check if current network is supported
  const isNetworkSupported = useCallback((): boolean => {
    return getCurrentNetwork() !== null;
  }, [getCurrentNetwork]);

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
    switchNetwork,
    
    // Additional utilities (not in interface but useful)
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
    isMetaMaskInstalled: isMetaMaskInstalled()
  };
}
