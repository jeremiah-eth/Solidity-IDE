import React, { useState } from 'react';
import { Wallet, ChevronDown, Network as NetworkIcon, Copy, LogOut, Code2, TestTube } from 'lucide-react';
import { getAllNetworks } from '../utils/networks';
import { testCompilation } from '../utils/testCompiler';
import type { Network } from '../types';

// Header props interface
interface HeaderProps {
  selectedChainId: number;
  onNetworkChange: (chainId: number) => void;
  wallet: {
    address: string | null;
    isConnected: boolean;
  };
  onConnect: () => void;
  onDisconnect: () => void;
}

// Network option interface
interface NetworkOption {
  id: string;
  name: string;
  chainId: number;
  isTestnet: boolean;
}

// Header component
export function Header({
  selectedChainId,
  onNetworkChange,
  wallet,
  onConnect,
  onDisconnect
}: HeaderProps) {
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

  // Get all networks and format them
  const networks = getAllNetworks();
  const networkOptions: NetworkOption[] = networks.map(network => ({
    id: network.id,
    name: network.name,
    chainId: network.chainId,
    isTestnet: network.name.toLowerCase().includes('testnet') || 
               network.name.toLowerCase().includes('sepolia') || 
               network.name.toLowerCase().includes('alfajores')
  }));

  // Get current network
  const currentNetwork = networkOptions.find(network => network.chainId === selectedChainId);

  // Copy address to clipboard
  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        // You could add a toast notification here
        console.log('Address copied to clipboard');
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle test compiler button click with debounce
  const handleTestCompiler = async () => {
    try {
      console.log('🧪 Starting compiler test...');
      const result = await testCompilation();
      if (result) {
        console.log('✅ Compiler test completed successfully!');
      } else {
        console.log('❌ Compiler test failed!');
      }
    } catch (error) {
      console.error('❌ Compiler test error:', error);
    }
  };

  // Get network badge color
  const getNetworkBadgeColor = (isTestnet: boolean) => {
    return isTestnet 
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* App Title and Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-white">Solidity IDE</h1>
          </div>
          
          {/* Test Compiler Button */}
          <button
            onClick={handleTestCompiler}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            title="Test Compiler"
          >
            <TestTube className="h-4 w-4" />
            <span className="text-sm font-medium">Test Compiler</span>
          </button>
        </div>

        {/* Network Selector and Wallet */}
        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <div className="relative">
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors"
            >
              <NetworkIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentNetwork?.name || 'Select Network'}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getNetworkBadgeColor(currentNetwork?.isTestnet || false)}`}>
                {currentNetwork?.chainId || '0'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Network Dropdown */}
            {isNetworkDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {networkOptions.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => {
                        onNetworkChange(network.chainId);
                        setIsNetworkDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                        network.chainId === selectedChainId ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <NetworkIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-white text-sm font-medium">
                              {network.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {network.isTestnet && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              TESTNET
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getNetworkBadgeColor(network.isTestnet)}`}>
                            {network.chainId}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="relative">
            {wallet.isConnected ? (
              /* Connected Wallet */
              <div className="relative">
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatAddress(wallet.address!)}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {currentNetwork?.chainId || '0'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Wallet Dropdown */}
                {isWalletDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          copyAddress();
                          setIsWalletDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">Copy Address</span>
                      </button>
                      <button
                        onClick={() => {
                          onDisconnect();
                          setIsWalletDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Connect Wallet Button */
              <button
                onClick={onConnect}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isNetworkDropdownOpen || isWalletDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNetworkDropdownOpen(false);
            setIsWalletDropdownOpen(false);
          }}
        />
      )}
    </header>
  );
}

// Network selector component (standalone)
export function NetworkSelector({
  selectedChainId,
  onNetworkChange
}: {
  selectedChainId: number;
  onNetworkChange: (chainId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const networks = getAllNetworks();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors"
      >
        <NetworkIcon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {networks.find(n => n.chainId === selectedChainId)?.name || 'Select Network'}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {selectedChainId}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onNetworkChange(network.chainId);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">
                    {network.name}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {network.chainId}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Wallet button component (standalone)
export function WalletButton({
  wallet,
  onConnect,
  onDisconnect
}: {
  wallet: {
    address: string | null;
    isConnected: boolean;
  };
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        console.log('Address copied to clipboard');
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium">
            {formatAddress(wallet.address!)}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
            <div className="py-2">
              <button
                onClick={() => {
                  copyAddress();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Copy className="h-4 w-4 text-gray-400" />
                <span className="text-white text-sm">Copy Address</span>
              </button>
              <button
                onClick={() => {
                  onDisconnect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4 text-gray-400" />
                <span className="text-white text-sm">Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <Wallet className="h-4 w-4" />
      <span className="text-sm font-medium">Connect Wallet</span>
    </button>
  );
}
