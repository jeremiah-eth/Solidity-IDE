import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Edit, 
  Eye, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2,
  Hash,
  ExternalLink,
  Copy,
  Activity,
  List,
  Code
} from 'lucide-react';
import type { DeployedContract, Network } from '../types';

// Contract interaction props interface
interface ContractInteractionProps {
  deployedContracts: DeployedContract[];
  selectedContract: DeployedContract | null;
  chainId: number | null;
  signer: any;
  onSelectContract: (contract: DeployedContract) => void;
}

// Function parameter interface
interface FunctionParameter {
  name: string;
  type: string;
  value: string;
}

// Function call result interface
interface FunctionCallResult {
  functionName: string;
  result: any;
  error?: string;
}

// Transaction status interface
interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
}

// Event log interface
interface EventLog {
  eventName: string;
  parameters: any;
  blockNumber: number;
  transactionHash: string;
  blockHash: string;
}

// Contract interaction component
export function ContractInteraction({
  deployedContracts,
  selectedContract,
  chainId,
  signer,
  onSelectContract
}: ContractInteractionProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read');
  const [functionParams, setFunctionParams] = useState<Record<string, FunctionParameter[]>>({});
  const [callResults, setCallResults] = useState<Record<string, FunctionCallResult>>({});
  const [transactionStatus, setTransactionStatus] = useState<Record<string, TransactionStatus>>({});
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Filter contracts by current network
  const networkContracts = deployedContracts.filter(contract => 
    contract.network.chainId === chainId
  );

  // Get contract functions
  const getContractFunctions = (contract: DeployedContract) => {
    if (!contract.abi) return { readFunctions: [], writeFunctions: [] };
    
    const readFunctions = contract.abi.filter(item => 
      item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
    );
    
    const writeFunctions = contract.abi.filter(item => 
      item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
    );
    
    return { readFunctions, writeFunctions };
  };

  // Initialize function parameters
  useEffect(() => {
    if (selectedContract) {
      const { readFunctions, writeFunctions } = getContractFunctions(selectedContract);
      const allFunctions = [...readFunctions, ...writeFunctions];
      
      const params: Record<string, FunctionParameter[]> = {};
      allFunctions.forEach(func => {
        if (func.inputs) {
          params[func.name] = func.inputs.map((input: any) => ({
            name: input.name || `arg${func.inputs.indexOf(input)}`,
            type: input.type,
            value: ''
          }));
        }
      });
      setFunctionParams(params);
    }
  }, [selectedContract]);

  // Handle parameter change
  const handleParamChange = (functionName: string, paramIndex: number, value: string) => {
    setFunctionParams(prev => ({
      ...prev,
      [functionName]: prev[functionName]?.map((param, index) => 
        index === paramIndex ? { ...param, value } : param
      ) || []
    }));
  };

  // Parse parameter value
  const parseParamValue = (value: string, type: string): any => {
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

  // Call read function
  const callReadFunction = async (functionName: string) => {
    if (!selectedContract || !signer) return;

    try {
      const contract = new (await import('ethers')).Contract(
        selectedContract.address,
        selectedContract.abi,
        signer
      );
      
      const params = functionParams[functionName] || [];
      const args = params.map(param => parseParamValue(param.value, param.type));
      
      const result = await contract?.[functionName]?.(...args);
      
      setCallResults(prev => ({
        ...prev,
        [functionName]: {
          functionName,
          result: result.toString ? result.toString() : result
        }
      }));
    } catch (error) {
      setCallResults(prev => ({
        ...prev,
        [functionName]: {
          functionName,
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  // Call write function
  const callWriteFunction = async (functionName: string) => {
    if (!selectedContract || !signer) return;

    try {
      const contract = new (await import('ethers')).Contract(
        selectedContract.address,
        selectedContract.abi,
        signer
      );
      
      const params = functionParams[functionName] || [];
      const args = params.map(param => parseParamValue(param.value, param.type));
      
      // Set transaction status to pending
      setTransactionStatus(prev => ({
        ...prev,
        [functionName]: {
          hash: '',
          status: 'pending'
        }
      }));
      
      const tx = await contract?.[functionName]?.(...args);
      
      // Set transaction hash
      setTransactionStatus(prev => ({
        ...prev,
        [functionName]: {
          hash: tx.hash,
          status: 'pending'
        }
      }));
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Update transaction status
      setTransactionStatus(prev => ({
        ...prev,
        [functionName]: {
          hash: tx.hash,
          status: 'success',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      }));
    } catch (error) {
      setTransactionStatus(prev => ({
        ...prev,
        [functionName]: {
          hash: '',
          status: 'failed'
        }
      }));
    }
  };

  // Start listening for events
  const startEventListening = async () => {
    if (!selectedContract || !signer || isListening) return;

    try {
      setIsListening(true);
      const contract = new (await import('ethers')).Contract(
        selectedContract.address,
        selectedContract.abi,
        signer
      );
      
      // Listen for all events
      contract.on('*', (event) => {
        const eventLog: EventLog = {
          eventName: event.event || 'Unknown',
          parameters: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          blockHash: event.blockHash
        };
        
        setEventLogs(prev => [eventLog, ...prev]);
      });
    } catch (error) {
      console.error('Failed to start event listening:', error);
      setIsListening(false);
    }
  };

  // Stop listening for events
  const stopEventListening = async () => {
    if (!selectedContract || !signer) return;

    try {
      const contract = new (await import('ethers')).Contract(
        selectedContract.address,
        selectedContract.abi,
        signer
      );
      
      contract.removeAllListeners();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop event listening:', error);
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

  // Get input type for parameter
  const getInputType = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return 'number';
    } else if (type === 'bool') {
      return 'checkbox';
    } else {
      return 'text';
    }
  };

  // Get placeholder for parameter
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

  const { readFunctions, writeFunctions } = selectedContract ? getContractFunctions(selectedContract) : { readFunctions: [], writeFunctions: [] };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Code className="h-5 w-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Contract Interaction</h2>
      </div>

      {/* Contract Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-300 mb-2">Select Contract</label>
        <select
          value={selectedContract?.address || ''}
          onChange={(e) => {
            const contract = networkContracts.find(c => c.address === e.target.value);
            if (contract) onSelectContract(contract);
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select a contract...</option>
          {networkContracts.map((contract) => (
            <option key={contract.address} value={contract.address}>
              {contract.contractName} - {contract.address.slice(0, 10)}...
            </option>
          ))}
        </select>
      </div>

      {selectedContract && (
        <>
          {/* Function Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('read')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'read'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Read Functions</span>
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'write'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Edit className="h-4 w-4" />
              <span>Write Functions</span>
            </button>
          </div>

          {/* Function Content */}
          <div className="space-y-4">
            {activeTab === 'read' && (
              <div>
                {readFunctions.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No read functions available</p>
                  </div>
                ) : (
                  readFunctions.map((func) => (
                    <div key={func.name} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">{func.name}</h3>
                        <button
                          onClick={() => callReadFunction(func.name)}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          <span className="text-sm">Call</span>
                        </button>
                      </div>

                      {/* Parameters */}
                      {functionParams[func.name] && (functionParams[func.name]?.length ?? 0) > 0 && (
                        <div className="space-y-2 mb-3">
                          {functionParams[func.name]?.map((param, index) => (
                            <div key={index}>
                              <label className="block text-sm text-gray-300 mb-1">
                                {param?.name} <span className="text-gray-500">({param?.type})</span>
                              </label>
                              {param.type === 'bool' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={param.value === 'true'}
                                    onChange={(e) => handleParamChange(func.name, index, e.target.checked.toString())}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-300">
                                    {param.value === 'true' ? 'true' : 'false'}
                                  </span>
                                </div>
                              ) : (
                                <input
                                  type={getInputType(param.type)}
                                  value={param.value}
                                  onChange={(e) => handleParamChange(func.name, index, e.target.value)}
                                  placeholder={getPlaceholder(param.type)}
                                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Result */}
                      {callResults[func.name] && (
                        <div className="bg-gray-600 rounded p-3">
                          <div className="text-sm text-gray-300 mb-1">Result:</div>
                          <div className="text-white font-mono text-sm">
                            {callResults[func.name]?.error || callResults[func.name]?.result}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'write' && (
              <div>
                {writeFunctions.length === 0 ? (
                  <div className="text-center py-8">
                    <Edit className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No write functions available</p>
                  </div>
                ) : (
                  writeFunctions.map((func) => (
                    <div key={func.name} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">{func.name}</h3>
                        <button
                          onClick={() => callWriteFunction(func.name)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm">Send Transaction</span>
                        </button>
                      </div>

                      {/* Parameters */}
                      {functionParams[func.name] && (functionParams[func.name]?.length ?? 0) > 0 && (
                        <div className="space-y-2 mb-3">
                          {functionParams[func.name]?.map((param, index) => (
                            <div key={index}>
                              <label className="block text-sm text-gray-300 mb-1">
                                {param?.name} <span className="text-gray-500">({param?.type})</span>
                              </label>
                              {param.type === 'bool' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={param.value === 'true'}
                                    onChange={(e) => handleParamChange(func.name, index, e.target.checked.toString())}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-300">
                                    {param.value === 'true' ? 'true' : 'false'}
                                  </span>
                                </div>
                              ) : (
                                <input
                                  type={getInputType(param.type)}
                                  value={param.value}
                                  onChange={(e) => handleParamChange(func.name, index, e.target.value)}
                                  placeholder={getPlaceholder(param.type)}
                                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Transaction Status */}
                      {transactionStatus[func.name] && (
                        <div className="bg-gray-600 rounded p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            {transactionStatus[func.name]?.status === 'pending' && (
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                            )}
                            {transactionStatus[func.name]?.status === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                            {transactionStatus[func.name]?.status === 'failed' && (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-sm text-gray-300">
                              {transactionStatus[func.name]?.status === 'pending' && 'Transaction Pending...'}
                              {transactionStatus[func.name]?.status === 'success' && 'Transaction Successful'}
                              {transactionStatus[func.name]?.status === 'failed' && 'Transaction Failed'}
                            </span>
                          </div>
                          {transactionStatus[func.name]?.hash && (
                            <div className="text-sm text-white font-mono">
                              Hash: {transactionStatus[func.name]?.hash}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <h3 className="text-white font-medium">Event Logs</h3>
              </div>
              <button
                onClick={isListening ? stopEventListening : startEventListening}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isListening ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </span>
              </button>
            </div>

            {eventLogs.length === 0 ? (
              <div className="text-center py-4">
                <Activity className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No events captured</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {eventLogs.map((event, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{event.eventName}</span>
                      <span className="text-gray-400 text-sm">Block {event.blockNumber}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>Transaction: {event.transactionHash.slice(0, 10)}...</div>
                      <div>Parameters: {JSON.stringify(event.parameters)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Standalone function call component
export function FunctionCall({
  functionName,
  parameters,
  onCall,
  result,
  isLoading
}: {
  functionName: string;
  parameters: FunctionParameter[];
  onCall: (args: any[]) => void;
  result?: any;
  isLoading: boolean;
}) {
  const [args, setArgs] = useState<string[]>([]);

  const handleArgChange = (index: number, value: string) => {
    setArgs(prev => prev.map((arg, i) => i === index ? value : arg));
  };

  const handleCall = () => {
    const parsedArgs = args.map((arg, index) => {
      const param = parameters[index];
      if (param?.type.startsWith('uint') || param?.type.startsWith('int')) {
        return arg;
      } else if (param?.type === 'bool') {
        return arg === 'true';
      } else {
        return arg;
      }
    });
    onCall(parsedArgs);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">{functionName}</h3>
        <button
          onClick={handleCall}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="text-sm">Call</span>
        </button>
      </div>

      {parameters.length > 0 && (
        <div className="space-y-2 mb-3">
          {parameters.map((param, index) => (
            <div key={index}>
              <label className="block text-sm text-gray-300 mb-1">
                {param.name} <span className="text-gray-500">({param.type})</span>
              </label>
              <input
                type="text"
                value={args[index] || ''}
                onChange={(e) => handleArgChange(index, e.target.value)}
                placeholder={`Enter ${param.type}`}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="bg-gray-600 rounded p-3">
          <div className="text-sm text-gray-300 mb-1">Result:</div>
          <div className="text-white font-mono text-sm">{result}</div>
        </div>
      )}
    </div>
  );
}

// Standalone event log component
export function EventLog({
  event,
  onCopy
}: {
  event: EventLog;
  onCopy?: (text: string) => void;
}) {
  const handleCopy = (text: string) => {
    if (onCopy) {
      onCopy(text);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="bg-gray-700 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{event.eventName}</span>
        <span className="text-gray-400 text-sm">Block {event.blockNumber}</span>
      </div>
      <div className="text-sm text-gray-300 space-y-1">
        <div className="flex items-center space-x-2">
          <span>Transaction:</span>
          <span className="font-mono">{event.transactionHash.slice(0, 10)}...</span>
          <button
            onClick={() => handleCopy(event.transactionHash)}
            className="p-1 hover:bg-gray-600 rounded"
          >
            <Copy className="h-3 w-3 text-gray-400" />
          </button>
        </div>
        <div>
          <span>Parameters: </span>
          <span className="font-mono">{JSON.stringify(event.parameters)}</span>
        </div>
      </div>
    </div>
  );
}
