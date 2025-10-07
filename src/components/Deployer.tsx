import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  Copy, 
  Upload, 
  CheckCircle, 
  Loader2,
  Network as NetworkIcon,
  Settings,
  Zap,
  Hash,
  Clock,
  Shield
} from 'lucide-react';
import type { Network, CompiledContract, DeployedContract } from '../types';

// Deployer props interface
interface DeployerProps {
  compiledContract: CompiledContract | null;
  network: Network | null;
  chainId: number | null;
  signer: any;
  onDeploy: (contract: CompiledContract, constructorArgs: any[], signer: any) => Promise<DeploymentResult>;
  onVerify: (address: string, sourceCode: string, contractName: string, chainId: number) => Promise<void>;
  onUploadMetadata: (contract: DeployedContract, chainId: number) => Promise<void>;
  onEstimateZap?: (contract: CompiledContract, constructorArgs: any[], signer: any) => Promise<ZapEstimation>;
}

// Deployment result interface
interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
  blockNumber: number;
  deployedContract: DeployedContract;
}

// Zap estimation interface
interface ZapEstimation {
  gasLimit: bigint;
  gasPrice: bigint;
  estimatedCost: string;
}

// Constructor argument interface
interface ConstructorArg {
  name: string;
  type: string;
  value: string;
  required: boolean;
}

// Deployer component
export function Deployer({
  compiledContract,
  network,
  chainId,
  signer,
  onDeploy,
  onVerify,
  onUploadMetadata,
  onEstimateZap
}: DeployerProps) {
  const [constructorArgs, setConstructorArgs] = useState<ConstructorArg[]>([]);
  const [gasEstimation, setZapEstimation] = useState<ZapEstimation | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Parse constructor ABI
  useEffect(() => {
    if (compiledContract?.abi) {
      const constructor = compiledContract.abi.find(item => item.type === 'constructor');
      if (constructor && constructor.inputs) {
        const args: ConstructorArg[] = constructor.inputs.map((input: any) => ({
          name: input.name || `arg${constructor.inputs.indexOf(input)}`,
          type: input.type,
          value: '',
          required: true
        }));
        setConstructorArgs(args);
      } else {
        setConstructorArgs([]);
      }
    }
  }, [compiledContract]);

  // Handle constructor argument change
  const handleArgChange = (index: number, value: string) => {
    setConstructorArgs(prev => prev.map((arg, i) => 
      i === index ? { ...arg, value } : arg
    ));
  };

  // Estimate gas
  const handleEstimateZap = async () => {
    if (!compiledContract || !signer || !onEstimateZap) return;

    setIsEstimating(true);
    try {
      const args = constructorArgs.map(arg => parseValue(arg.value, arg.type));
      const estimation = await onEstimateZap(compiledContract, args, signer);
      setZapEstimation(estimation);
    } catch (error) {
      console.error('Zap estimation failed:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  // Parse value based on type
  const parseValue = (value: string, type: string): any => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return value;
    } else if (type === 'bool') {
      return value === 'true';
    } else if (type === 'address') {
      return value;
    } else {
      return value;
    }
  };

  // Deploy contract
  const handleDeploy = async () => {
    if (!compiledContract || !signer) return;

    setIsDeploying(true);
    try {
      const args = constructorArgs.map(arg => parseValue(arg.value, arg.type));
      const result = await onDeploy(compiledContract, args, signer);
      setDeploymentResult(result);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  // Verify contract
  const handleVerify = async () => {
    if (!deploymentResult || !compiledContract || !chainId) return;

    setIsVerifying(true);
    try {
      await onVerify(
        deploymentResult.contractAddress,
        '', // Source code should be passed as prop
        compiledContract.contractName,
        chainId
      );
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Upload metadata
  const handleUploadMetadata = async () => {
    if (!deploymentResult || !chainId) return;

    setIsUploading(true);
    try {
      await onUploadMetadata(deploymentResult.deployedContract, chainId);
    } catch (error) {
      console.error('Metadata upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err);
    }
  };

  // Get input type for constructor argument
  const getInputType = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return 'number';
    } else if (type === 'bool') {
      return 'checkbox';
    } else {
      return 'text';
    }
  };

  // Get placeholder for constructor argument
  const getPlaceholder = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return '0';
    } else if (type === 'bool') {
      return 'true/false';
    } else if (type === 'address') {
      return '0x...';
    } else {
      return 'Enter value';
    }
  };

  // Check if deployment is possible
  const canDeploy = compiledContract && signer && constructorArgs.every(arg => 
    !arg.required || arg.value.trim() !== ''
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Rocket className="h-5 w-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Deploy Contract</h2>
      </div>

      {/* Network Display */}
      {network && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-gray-300 mb-2">
            <NetworkIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{network.name}</div>
                <div className="text-gray-400 text-sm">Chain ID: {network.chainId}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm">Native Currency</div>
                <div className="text-white font-medium">{network.nativeCurrency.symbol}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Constructor Arguments */}
      {constructorArgs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-gray-300 mb-3">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Constructor Arguments</span>
          </div>
          <div className="space-y-3">
            {constructorArgs.map((arg, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <label className="block text-sm text-gray-300 mb-2">
                  {arg.name} <span className="text-gray-500">({arg.type})</span>
                  {arg.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {arg.type === 'bool' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={arg.value === 'true'}
                      onChange={(e) => handleArgChange(index, e.target.checked.toString())}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">
                      {arg.value === 'true' ? 'true' : 'false'}
                    </span>
                  </div>
                ) : (
                  <input
                    type={getInputType(arg.type)}
                    value={arg.value}
                    onChange={(e) => handleArgChange(index, e.target.value)}
                    placeholder={getPlaceholder(arg.type)}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zap Estimation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-gray-300">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Zap Estimation</span>
          </div>
          <button
            onClick={handleEstimateZap}
            disabled={!compiledContract || !signer || isEstimating}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
          >
            {isEstimating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span className="text-sm">Estimate Zap</span>
          </button>
        </div>

        {gasEstimation && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Zap Limit</div>
                <div className="text-white font-medium">
                  {gasEstimation.gasLimit.toString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Estimated Cost</div>
                <div className="text-white font-medium">
                  {gasEstimation.estimatedCost} {network?.nativeCurrency.symbol || 'ETH'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deploy Button */}
      <div className="mb-6">
        <button
          onClick={handleDeploy}
          disabled={!canDeploy || isDeploying}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
        >
          {isDeploying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Rocket className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </span>
        </button>
      </div>

      {/* Deployment Result */}
      {deploymentResult && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-green-400 mb-3">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Deployment Successful</span>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            {/* Transaction Hash */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Transaction Hash</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`${network?.blockExplorer}/tx/${deploymentResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  {deploymentResult.transactionHash.slice(0, 10)}...
                </a>
                <button
                  onClick={() => copyToClipboard(deploymentResult.transactionHash, 'Transaction Hash')}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Copy className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contract Address */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Contract Address</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono text-sm">
                  {deploymentResult.contractAddress.slice(0, 10)}...
                </span>
                <button
                  onClick={() => copyToClipboard(deploymentResult.contractAddress, 'Contract Address')}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Copy className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Block Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Block Number</span>
              </div>
              <span className="text-white text-sm">{deploymentResult.blockNumber}</span>
            </div>

            {/* Zap Used */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Zap Used</span>
              </div>
              <span className="text-white text-sm">{deploymentResult.gasUsed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Post-Deployment Actions */}
      {deploymentResult && (
        <div className="space-y-3">
          <h3 className="text-white font-medium">Post-Deployment Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Verify Contract */}
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span className="text-sm">Verify Contract</span>
            </button>

            {/* Upload Metadata */}
            <button
              onClick={handleUploadMetadata}
              disabled={isUploading}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="text-sm">Upload Metadata</span>
            </button>

            {/* Add to Deployed Contracts */}
            <button
              onClick={() => {
                // This would be handled by the parent component
                console.log('Add to deployed contracts');
              }}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Add to Contracts</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone gas estimation component
export function ZapEstimation({
  gasEstimation,
  network,
  onEstimate,
  isEstimating
}: {
  gasEstimation: ZapEstimation | null;
  network: Network | null;
  onEstimate: () => void;
  isEstimating: boolean;
}) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-gray-300">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Zap Estimation</span>
        </div>
        <button
          onClick={onEstimate}
          disabled={isEstimating}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
        >
          {isEstimating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          <span className="text-sm">Estimate</span>
        </button>
      </div>

      {gasEstimation && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm">Zap Limit</div>
            <div className="text-white font-medium">
              {gasEstimation.gasLimit.toString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Estimated Cost</div>
            <div className="text-white font-medium">
              {gasEstimation.estimatedCost} {network?.nativeCurrency.symbol || 'ETH'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone deployment result component
export function DeploymentResult({
  result,
  network,
  onCopy
}: {
  result: DeploymentResult;
  network: Network | null;
  onCopy?: (text: string, type: string) => void;
}) {
  const handleCopy = (text: string, type: string) => {
    if (onCopy) {
      onCopy(text, type);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 text-green-400 mb-3">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Deployment Successful</span>
      </div>
      
      <div className="space-y-3">
        {/* Transaction Hash */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Transaction Hash</span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={`${network?.blockExplorer}/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              {result.transactionHash.slice(0, 10)}...
            </a>
            <button
              onClick={() => handleCopy(result.transactionHash, 'Transaction Hash')}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Contract Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Contract Address</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono text-sm">
              {result.contractAddress.slice(0, 10)}...
            </span>
            <button
              onClick={() => handleCopy(result.contractAddress, 'Contract Address')}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Block Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Block Number</span>
          </div>
          <span className="text-white text-sm">{result.blockNumber}</span>
        </div>

        {/* Zap Used */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Zap Used</span>
          </div>
          <span className="text-white text-sm">{result.gasUsed}</span>
        </div>
      </div>
    </div>
  );
}
