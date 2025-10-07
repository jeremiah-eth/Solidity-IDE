import React, { useState } from 'react';
import { File, Plus, Trash2, FileCode, Download, ChevronDown } from 'lucide-react';
import type { ContractFile } from '../types';
import { 
  SIMPLE_STORAGE, 
  ERC20_TOKEN, 
  ERC721_NFT, 
  MULTISIG_WALLET,
  HELLO_WORLD,
  COUNTER,
  VOTING
} from '../utils/sampleContracts';

// File explorer props interface
interface FileExplorerProps {
  files: ContractFile[];
  selectedFile: string | null;
  onSelectFile: (fileName: string) => void;
  onAddFile: () => void;
  onDeleteFile: (fileName: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  onLoadSample: (sampleName: string) => void;
}

// Sample contract interface
interface SampleContract {
  name: string;
  description: string;
  content: string;
}

// Sample contracts data
const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    name: 'SimpleStorage',
    description: 'Basic storage contract with set/get functions',
    content: SIMPLE_STORAGE
  },
  {
    name: 'ERC20 Token',
    description: 'Standard ERC20 token implementation',
    content: ERC20_TOKEN
  },
  {
    name: 'ERC721 NFT',
    description: 'Non-fungible token implementation',
    content: ERC721_NFT
  },
  {
    name: 'MultiSig Wallet',
    description: 'Multi-signature wallet for secure transactions',
    content: MULTISIG_WALLET
  },
  {
    name: 'Hello World',
    description: 'Simple greeting contract',
    content: HELLO_WORLD
  },
  {
    name: 'Counter',
    description: 'Counter contract with increment/decrement',
    content: COUNTER
  },
  {
    name: 'Voting',
    description: 'Voting contract with candidates and votes',
    content: VOTING
  }
];

// File explorer component
export function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onLoadSample
}: FileExplorerProps) {
  const [isSampleDropdownOpen, setIsSampleDropdownOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Handle file double-click for renaming
  const handleFileDoubleClick = (fileName: string) => {
    setRenamingFile(fileName);
    setNewFileName(fileName);
  };

  // Handle rename completion
  const handleRenameComplete = () => {
    if (renamingFile && newFileName && newFileName !== renamingFile) {
      onRenameFile(renamingFile, newFileName);
    }
    setRenamingFile(null);
    setNewFileName('');
  };

  // Handle rename cancel
  const handleRenameCancel = () => {
    setRenamingFile(null);
    setNewFileName('');
  };

  // Handle sample selection
  const handleSampleSelect = (sampleName: string) => {
    onLoadSample(sampleName);
    setIsSampleDropdownOpen(false);
  };

  // Get file icon based on file extension
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.sol')) {
      return <FileCode className="h-4 w-4 text-blue-400" />;
    }
    return <File className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Files</h2>
          <button
            onClick={onAddFile}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Add new file"
          >
            <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Load Sample Dropdown */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <button
            onClick={() => setIsSampleDropdownOpen(!isSampleDropdownOpen)}
            className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Load Sample</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isSampleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {SAMPLE_CONTRACTS.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSampleSelect(sample.name)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">{sample.name}</span>
                      <span className="text-gray-400 text-xs">{sample.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-4 text-center">
            <FileCode className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No files yet</p>
            <p className="text-gray-500 text-xs">Add a file or load a sample</p>
          </div>
        ) : (
          <div className="p-2">
            {files.map((file) => (
              <div
                key={file.name}
                className={`group relative flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  selectedFile === file.name
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                {/* File Icon and Name */}
                <div
                  className="flex-1 flex items-center space-x-2 cursor-pointer"
                  onClick={() => onSelectFile(file.name)}
                  onDoubleClick={() => handleFileDoubleClick(file.name)}
                >
                  {getFileIcon(file.name)}
                  {renamingFile === file.name ? (
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onBlur={handleRenameComplete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameComplete();
                        } else if (e.key === 'Escape') {
                          handleRenameCancel();
                        }
                      }}
                      className="bg-transparent border-none outline-none text-sm flex-1"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm truncate">{file.name}</span>
                  )}
                </div>

                {/* Delete Button (visible on hover) */}
                <button
                  onClick={() => onDeleteFile(file.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                  title="Delete file"
                >
                  <Trash2 className="h-3 w-3 text-red-400 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isSampleDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSampleDropdownOpen(false)}
        />
      )}
    </div>
  );
}

// Standalone file item component
export function FileItem({
  file,
  isSelected,
  onSelect,
  onDelete,
  onRename
}: {
  file: ContractFile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleRename = () => {
    if (newName && newName !== file.name) {
      onRename(newName);
    }
    setIsRenaming(false);
  };

  const handleCancel = () => {
    setNewName(file.name);
    setIsRenaming(false);
  };

  return (
    <div
      className={`group relative flex items-center space-x-2 p-2 rounded-lg transition-colors ${
        isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
      }`}
    >
      <div
        className="flex-1 flex items-center space-x-2 cursor-pointer"
        onClick={onSelect}
        onDoubleClick={() => setIsRenaming(true)}
      >
        <FileCode className="h-4 w-4 text-blue-400" />
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRename();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            className="bg-transparent border-none outline-none text-sm flex-1"
            autoFocus
          />
        ) : (
          <span className="text-sm truncate">{file.name}</span>
        )}
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
        title="Delete file"
      >
        <Trash2 className="h-3 w-3 text-red-400 hover:text-white" />
      </button>
    </div>
  );
}

// Sample contracts data export
export { SAMPLE_CONTRACTS };
