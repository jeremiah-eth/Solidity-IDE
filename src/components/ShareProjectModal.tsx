import React, { useState } from 'react';
import { X, Upload, Download, Share2, Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { ContractFile } from '../types';
import { bundleProject, uploadToIPFS, downloadProjectBundle, type ShareableLink } from '../utils/projectBundler';

interface ShareProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: ContractFile[];
    projectName: string;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
    isOpen,
    onClose,
    files,
    projectName
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [shareLink, setShareLink] = useState<ShareableLink | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleUploadToIPFS = async () => {
        setIsUploading(true);
        try {
            const bundle = bundleProject(files, projectName, {
                author: 'Solidity IDE User',
                license: 'MIT'
            });

            const link = await uploadToIPFS(bundle);
            setShareLink(link);
        } catch (error) {
            console.error('Failed to upload to IPFS:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        const bundle = bundleProject(files, projectName);
        downloadProjectBundle(bundle);
    };

    const handleCopyLink = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center space-x-2">
                        <Share2 size={20} className="text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Share Project</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Project Info */}
                    <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-200 mb-2">Project Details</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Name:</span>
                                <span className="text-white font-medium">{projectName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Files:</span>
                                <span className="text-white">{files.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Size:</span>
                                <span className="text-white">
                                    {(files.reduce((sum, f) => sum + f.content.length, 0) / 1024).toFixed(2)} KB
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Share Options */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-200">Share Options</h3>

                        {/* Upload to IPFS */}
                        <button
                            onClick={handleUploadToIPFS}
                            disabled={isUploading || !!shareLink}
                            className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center space-x-3">
                                {isUploading ? (
                                    <Loader2 size={20} className="text-blue-400 animate-spin" />
                                ) : (
                                    <Upload size={20} className="text-blue-400" />
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">Upload to IPFS</p>
                                    <p className="text-xs text-gray-400">
                                        Share your project on the decentralized web
                                    </p>
                                </div>
                            </div>
                            {shareLink && (
                                <CheckCircle size={20} className="text-green-400" />
                            )}
                        </button>

                        {/* Download as JSON */}
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <Download size={20} className="text-green-400" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">Download as JSON</p>
                                    <p className="text-xs text-gray-400">
                                        Save project bundle to your computer
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Share Link */}
                    {shareLink && (
                        <div className="bg-green-900/20 border border-green-800 rounded p-4 space-y-3">
                            <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle size={16} />
                                <span className="text-sm font-semibold">Project uploaded successfully!</span>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">IPFS CID:</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={shareLink.cid}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-black/30 border border-gray-700 rounded text-sm text-white font-mono"
                                        />
                                        <button
                                            onClick={() => handleCopyLink(shareLink.cid)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                            title="Copy CID"
                                        >
                                            {copied ? (
                                                <CheckCircle size={16} className="text-green-400" />
                                            ) : (
                                                <Copy size={16} className="text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Gateway URL:</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={shareLink.gateway}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-black/30 border border-gray-700 rounded text-sm text-white font-mono"
                                        />
                                        <button
                                            onClick={() => handleCopyLink(shareLink.gateway)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                            title="Copy URL"
                                        >
                                            <Copy size={16} className="text-gray-300" />
                                        </button>
                                        <a
                                            href={shareLink.gateway}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                                            title="Open in browser"
                                        >
                                            <ExternalLink size={16} className="text-white" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400">
                                Share this link with others to let them import your project
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
