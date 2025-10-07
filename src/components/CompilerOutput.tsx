import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Download, 
  Clock,
  FileText,
  Code,
  Hash
} from 'lucide-react';

// Compilation result interface
interface CompilationResult {
  abi: any[];
  bytecode: string;
  errors: string[];
  warnings: string[];
}

// Compiler output props interface
interface CompilerOutputProps {
  compilationResult: CompilationResult | null;
  errors: string[];
  warnings: string[];
  compilationTime: number | null;
  onJumpToLine?: (line: number) => void;
}

// Tab type
type TabType = 'results' | 'abi' | 'bytecode';

// Compiler output component
export function CompilerOutput({
  compilationResult,
  errors,
  warnings,
  compilationTime,
  onJumpToLine
}: CompilerOutputProps) {
  const [activeTab, setActiveTab] = useState<TabType>('results');
  const [showFullBytecode, setShowFullBytecode] = useState(false);

  // Utility functions
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse error line numbers
  const parseErrorLine = (error: string): { line: number | null; message: string } => {
    const lineMatch = error.match(/\((\d+):(\d+)\)/);
    if (lineMatch && lineMatch[1]) {
      return {
        line: parseInt(lineMatch[1]),
        message: error
      };
    }
    return { line: null, message: error };
  };



  // Get compilation status
  const getCompilationStatus = () => {
    if (!compilationResult) return 'idle';
    if (compilationResult.errors.length > 0) return 'failed';
    return 'success';
  };

  // Get status icon and color
  const getStatusDisplay = () => {
    const status = getCompilationStatus();
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
          text: 'Compilation Successful',
          color: 'text-green-400'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-400" />,
          text: 'Compilation Failed',
          color: 'text-red-400'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-400" />,
          text: 'Ready to Compile',
          color: 'text-gray-400'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="h-full bg-gray-900 border-t border-gray-700 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Compilation Results</span>
          {errors.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {errors.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('abi')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'abi'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Code className="h-4 w-4" />
          <span>ABI</span>
        </button>
        
        <button
          onClick={() => setActiveTab('bytecode')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'bytecode'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>Bytecode</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'results' && (
          <div className="p-4">
            {/* Status */}
            <div className="flex items-center space-x-3 mb-4">
              {statusDisplay.icon}
              <span className={`text-lg font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </span>
              {compilationTime && (
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{compilationTime}ms</span>
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center space-x-2 text-red-400 font-medium mb-3">
                  <XCircle className="h-4 w-4" />
                  <span>Errors ({errors.length})</span>
                </h3>
                <div className="space-y-2">
                  {errors.map((error, index) => {
                    const { line, message } = parseErrorLine(error);
                    return (
                      <div
                        key={index}
                        className="bg-red-900/20 border border-red-500/30 rounded-lg p-3"
                      >
                        <div className="flex items-start space-x-2">
                          <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-red-400 text-sm font-medium">
                              {line ? `Line ${line}` : 'Error'}
                            </div>
                            <div className="text-gray-300 text-sm mt-1">
                              {message}
                            </div>
                            {line && onJumpToLine && (
                              <button
                                onClick={() => onJumpToLine(line)}
                                className="text-blue-400 hover:text-blue-300 text-xs mt-2 underline"
                              >
                                Jump to line {line}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center space-x-2 text-yellow-400 font-medium mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Warnings ({warnings.length})</span>
                </h3>
                <div className="space-y-2">
                  {warnings.map((warning, index) => {
                    const { line, message } = parseErrorLine(warning);
                    return (
                      <div
                        key={index}
                        className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3"
                      >
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-yellow-400 text-sm font-medium">
                              {line ? `Line ${line}` : 'Warning'}
                            </div>
                            <div className="text-gray-300 text-sm mt-1">
                              {message}
                            </div>
                            {line && onJumpToLine && (
                              <button
                                onClick={() => onJumpToLine(line)}
                                className="text-blue-400 hover:text-blue-300 text-xs mt-2 underline"
                              >
                                Jump to line {line}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success Message */}
            {getCompilationStatus() === 'success' && errors.length === 0 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Contract compiled successfully!
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  Your contract is ready for deployment. Check the ABI and Bytecode tabs for details.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'abi' && (
          <div className="p-4">
            {compilationResult?.abi ? (
              <div>
                {/* ABI Actions */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Contract ABI</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(compilationResult.abi, null, 2), 'ABI')}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </button>
                    <button
                      onClick={() => downloadFile(
                        JSON.stringify(compilationResult.abi, null, 2),
                        'contract-abi.json',
                        'application/json'
                      )}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>

                {/* ABI Display */}
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(compilationResult.abi, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No ABI available</p>
                <p className="text-gray-500 text-sm">Compile a contract to see the ABI</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bytecode' && (
          <div className="p-4">
            {compilationResult?.bytecode ? (
              <div>
                {/* Bytecode Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-white font-medium">Contract Bytecode</h3>
                    <span className="text-sm text-gray-400">
                      {compilationResult.bytecode.length} characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(compilationResult.bytecode, 'Bytecode')}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </button>
                    <button
                      onClick={() => downloadFile(
                        compilationResult.bytecode,
                        'contract-bytecode.txt',
                        'text/plain'
                      )}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>

                {/* Bytecode Display */}
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {showFullBytecode 
                      ? compilationResult.bytecode
                      : `${compilationResult.bytecode.substring(0, 200)}...`
                    }
                  </pre>
                  {compilationResult.bytecode.length > 200 && (
                    <button
                      onClick={() => setShowFullBytecode(!showFullBytecode)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      {showFullBytecode ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No bytecode available</p>
                <p className="text-gray-500 text-sm">Compile a contract to see the bytecode</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Standalone ABI viewer component
export function ABIViewer({
  abi,
  onCopy,
  onDownload
}: {
  abi: any[];
  onCopy?: (abi: any[]) => void;
  onDownload?: (abi: any[]) => void;
}) {
  // Utility functions
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(abi);
    } else {
      copyToClipboard(JSON.stringify(abi, null, 2), 'ABI');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(abi);
    } else {
      downloadFile(
        JSON.stringify(abi, null, 2),
        'contract-abi.json',
        'application/json'
      );
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Contract ABI</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm">Copy</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>
      <pre className="text-sm text-gray-300 overflow-x-auto">
        {JSON.stringify(abi, null, 2)}
      </pre>
    </div>
  );
}

// Standalone bytecode viewer component
export function BytecodeViewer({
  bytecode,
  onCopy,
  onDownload
}: {
  bytecode: string;
  onCopy?: (bytecode: string) => void;
  onDownload?: (bytecode: string) => void;
}) {
  const [showFull, setShowFull] = useState(false);

  // Utility functions
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(bytecode);
    } else {
      copyToClipboard(bytecode, 'Bytecode');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(bytecode);
    } else {
      downloadFile(bytecode, 'contract-bytecode.txt', 'text/plain');
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-medium">Contract Bytecode</h3>
          <span className="text-sm text-gray-400">
            {bytecode.length} characters
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm">Copy</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>
      <pre className="text-sm text-gray-300 overflow-x-auto">
        {showFull ? bytecode : `${bytecode.substring(0, 200)}...`}
      </pre>
      {bytecode.length > 200 && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
        >
          {showFull ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}
