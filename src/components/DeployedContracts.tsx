import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Copy, 
  ExternalLink, 
  Trash2,
  Eye,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Network
} from 'lucide-react';
import type { DeployedContract } from '../types';

// Deployed contracts props interface
interface DeployedContractsProps {
  contracts: DeployedContract[];
  selectedChainId: number | null;
  onSelectContract: (contract: DeployedContract) => void;
  onDeleteContract: (contract: DeployedContract) => void;
  onVerifyContract?: (contract: DeployedContract) => void;
  onInteractContract?: (contract: DeployedContract) => void;
}

// Contract card component
function ContractCard({
  contract,
  onSelect,
  onDelete,
  onVerify,
  onInteract
}: {
  contract: DeployedContract;
  onSelect: (contract: DeployedContract) => void;
  onDelete: (contract: DeployedContract) => void;
  onVerify?: (contract: DeployedContract) => void;
  onInteract?: (contract: DeployedContract) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contract.address);
      console.log('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format deployment date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get network badge color
  const getNetworkBadgeColor = (chainId: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      11155111: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      8453: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      84532: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      42220: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      44787: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      31337: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[chainId] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Get verification status (mock - would come from props or state)
  const getVerificationStatus = () => {
    // This would be determined by checking verification status
    // For now, we'll mock it based on contract name
    const isVerified = contract.contractName.includes('Verified') || Math.random() > 0.5;
    return isVerified ? 'verified' : 'unverified';
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div
      className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg">{contract.contractName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-400 text-sm font-mono">{formatAddress(contract.address)}</span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-gray-500 rounded transition-colors"
              title="Copy address"
            >
              <Copy className="h-3 w-3 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
        
        {/* Network Badge */}
        <span className={`px-2 py-1 text-xs rounded-full ${getNetworkBadgeColor(contract.network.chainId)}`}>
          {contract.network.name}
        </span>
      </div>

      {/* Contract Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Network className="h-4 w-4" />
          <span>{contract.network.name}</span>
          <span className="text-gray-500">•</span>
          <span>Chain ID: {contract.network.chainId}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Clock className="h-4 w-4" />
          <span>Deployed {formatDate(contract.deployedAt)}</span>
        </div>

        {/* Verification Status */}
        <div className="flex items-center space-x-2">
          {verificationStatus === 'verified' ? (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Verified</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-yellow-400">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Unverified</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onSelect(contract)}
          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          title="View contract details"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm">View</span>
        </button>

        {onInteract && (
          <button
            onClick={() => onInteract(contract)}
            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
            title="Interact with contract"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm">Interact</span>
          </button>
        )}

        {onVerify && (
          <button
            onClick={() => onVerify(contract)}
            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
            title="Verify contract"
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm">Verify</span>
          </button>
        )}

        <a
          href={`${contract.network.blockExplorer}/address/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
          title="View on explorer"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">Explorer</span>
        </a>

        <button
          onClick={() => onDelete(contract)}
          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
          title="Delete contract"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
}

// Main deployed contracts component
export function DeployedContracts({
  contracts,
  selectedChainId,
  onSelectContract,
  onDeleteContract,
  onVerifyContract,
  onInteractContract
}: DeployedContractsProps) {
  const [filterNetwork, setFilterNetwork] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'network'>('date');

  // Get unique networks from contracts
  const networks = useMemo(() => {
    const uniqueNetworks = new Map<number, string>();
    contracts.forEach(contract => {
      uniqueNetworks.set(contract.network.chainId, contract.network.name);
    });
    return Array.from(uniqueNetworks.entries()).map(([chainId, name]) => ({
      chainId,
      name
    }));
  }, [contracts]);

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    // Filter by network
    if (filterNetwork !== null) {
      filtered = filtered.filter(contract => contract.network.chainId === filterNetwork);
    }

    // Sort contracts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.contractName.localeCompare(b.contractName);
        case 'date':
          return b.deployedAt.getTime() - a.deployedAt.getTime();
        case 'network':
          return a.network.name.localeCompare(b.network.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [contracts, filterNetwork, sortBy]);

  // Get network badge color
  const getNetworkBadgeColor = (chainId: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      11155111: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      8453: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      84532: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      42220: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      44787: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      31337: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[chainId] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Deployed Contracts</h2>
          <span className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded-full">
            {filteredContracts.length}
          </span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Network Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterNetwork || ''}
            onChange={(e) => setFilterNetwork(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Networks</option>
            {networks.map((network) => (
              <option key={network.chainId} value={network.chainId}>
                {network.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'network')}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="date">Deployment Date</option>
            <option value="name">Contract Name</option>
            <option value="network">Network</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {contracts.length === 0 ? 'No Contracts Deployed' : 'No Contracts Found'}
          </h3>
          <p className="text-gray-500 text-sm">
            {contracts.length === 0 
              ? 'Deploy your first contract to get started'
              : 'Try adjusting your filters to see more contracts'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={`${contract.address}-${contract.network.chainId}`}
              contract={contract}
              onSelect={onSelectContract}
              onDelete={onDeleteContract}
              onVerify={onVerifyContract}
              onInteract={onInteractContract}
            />
          ))}
        </div>
      )}

      {/* Network Summary */}
      {contracts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-white font-medium mb-4">Network Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {networks.map((network) => {
              const networkContracts = contracts.filter(c => c.network.chainId === network.chainId);
              return (
                <div key={network.chainId} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-medium text-sm">{network.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Contracts</span>
                    <span className="text-white font-medium">{networkContracts.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone contract card component
export function ContractCardStandalone({
  contract,
  onSelect,
  onDelete,
  onVerify,
  onInteract
}: {
  contract: DeployedContract;
  onSelect: (contract: DeployedContract) => void;
  onDelete: (contract: DeployedContract) => void;
  onVerify?: (contract: DeployedContract) => void;
  onInteract?: (contract: DeployedContract) => void;
}) {
  return (
    <ContractCard
      contract={contract}
      onSelect={onSelect}
      onDelete={onDelete}
      onVerify={onVerify}
      onInteract={onInteract}
    />
  );
}

// Contract list component
export function ContractList({
  contracts,
  onSelectContract,
  onDeleteContract
}: {
  contracts: DeployedContract[];
  onSelectContract: (contract: DeployedContract) => void;
  onDeleteContract: (contract: DeployedContract) => void;
}) {
  return (
    <div className="space-y-3">
      {contracts.map((contract) => (
        <div
          key={`${contract.address}-${contract.network.chainId}`}
          className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
          onClick={() => onSelectContract(contract)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">{contract.contractName}</h3>
              <p className="text-gray-400 text-sm font-mono">{contract.address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getNetworkBadgeColor(contract.network.chainId)}`}>
                {contract.network.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteContract(contract);
                }}
                className="p-1 hover:bg-red-600 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function for network badge color
function getNetworkBadgeColor(chainId: number): string {
  const colors: Record<number, string> = {
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    11155111: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    8453: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    84532: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    42220: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    44787: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    31337: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[chainId] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}
