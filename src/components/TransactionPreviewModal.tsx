import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Zap, TrendingUp, Activity } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { SimulationResult } from '../utils/transactionSimulator';

interface TransactionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    simulation: SimulationResult | null;
    functionName: string;
    args: any[];
}

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    simulation,
    functionName,
    args
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center space-x-2">
                        <Activity size={20} className="text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Transaction Preview</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Function Info */}
                    <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-200 mb-2">Function Call</h3>
                        <div className="font-mono text-sm">
                            <span className="text-purple-400">{functionName}</span>
                            <span className="text-gray-400">(</span>
                            {args.map((arg, idx) => (
                                <span key={idx}>
                                    <span className="text-green-300">{String(arg)}</span>
                                    {idx < args.length - 1 && <span className="text-gray-400">, </span>}
                                </span>
                            ))}
                            <span className="text-gray-400">)</span>
                        </div>
                    </div>

                    {/* Simulation Result */}
                    {simulation ? (
                        <>
                            {/* Status */}
                            <div className={`p-4 rounded border ${simulation.success
                                    ? 'bg-green-900/20 border-green-800'
                                    : 'bg-red-900/20 border-red-800'
                                }`}>
                                <div className="flex items-center space-x-2 mb-2">
                                    {simulation.success ? (
                                        <CheckCircle size={20} className="text-green-400" />
                                    ) : (
                                        <AlertCircle size={20} className="text-red-400" />
                                    )}
                                    <span className={`font-semibold ${simulation.success ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {simulation.success ? 'Transaction will succeed' : 'Transaction will fail'}
                                    </span>
                                </div>
                                {simulation.error && (
                                    <p className="text-sm text-red-300 ml-7">{simulation.error}</p>
                                )}
                                {simulation.revertReason && (
                                    <p className="text-sm text-red-300 ml-7">
                                        <strong>Reason:</strong> {simulation.revertReason}
                                    </p>
                                )}
                            </div>

                            {/* Gas Estimate */}
                            {simulation.success && (
                                <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Zap size={16} className="text-yellow-400" />
                                        <h3 className="text-sm font-semibold text-gray-200">Gas Estimate</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-400">Gas Limit:</span>
                                            <p className="text-white font-mono">{simulation.gasEstimate.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Gas Price:</span>
                                            <p className="text-white font-mono">
                                                {(Number(simulation.gasPrice) / 1e9).toFixed(2)} Gwei
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-400">Estimated Cost:</span>
                                            <p className="text-green-400 font-mono font-bold">
                                                {simulation.totalCost} ETH
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Return Value */}
                            {simulation.success && simulation.returnValue !== undefined && (
                                <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-gray-200 mb-2">Return Value</h3>
                                    <pre className="text-sm text-green-300 font-mono bg-black/30 p-2 rounded overflow-x-auto">
                                        {typeof simulation.returnValue === 'object'
                                            ? JSON.stringify(simulation.returnValue, null, 2)
                                            : String(simulation.returnValue)}
                                    </pre>
                                </div>
                            )}

                            {/* Events */}
                            {simulation.success && simulation.events && simulation.events.length > 0 && (
                                <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <TrendingUp size={16} className="text-purple-400" />
                                        <h3 className="text-sm font-semibold text-gray-200">Expected Events</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {simulation.events.map((event, idx) => (
                                            <div key={idx} className="bg-black/30 p-2 rounded">
                                                <p className="text-sm font-semibold text-purple-300">{event.name}</p>
                                                <pre className="text-xs text-gray-400 font-mono mt-1">
                                                    {JSON.stringify(event.args, null, 2)}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* State Changes */}
                            {simulation.success && simulation.stateChanges && simulation.stateChanges.length > 0 && (
                                <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-gray-200 mb-3">State Changes</h3>
                                    <div className="space-y-2">
                                        {simulation.stateChanges.map((change, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-300 font-mono">{change.variable}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-red-300">{String(change.before)}</span>
                                                    <span className="text-gray-500">→</span>
                                                    <span className="text-green-300">{String(change.after)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Activity size={32} className="mx-auto mb-2 animate-pulse" />
                            <p>Simulating transaction...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!simulation?.success}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${simulation?.success
                                ? 'text-white bg-blue-600 hover:bg-blue-500'
                                : 'text-gray-500 bg-gray-700 cursor-not-allowed'
                            }`}
                    >
                        Confirm Transaction
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
