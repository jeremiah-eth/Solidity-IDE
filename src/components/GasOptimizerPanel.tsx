import React from 'react';
import { GlassCard } from './GlassCard';
import { Zap, AlertTriangle, Info, TrendingDown, Package } from 'lucide-react';
import type { GasAnalysis, OptimizationSuggestion } from '../utils/gasProfiler';

interface GasOptimizerPanelProps {
    analysis: GasAnalysis | null;
}

export const GasOptimizerPanel: React.FC<GasOptimizerPanelProps> = ({ analysis }) => {
    if (!analysis) {
        return (
            <GlassCard className="flex flex-col h-full bg-gray-900">
                <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">Gas Optimizer</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-500 italic text-sm text-center">
                        Compile a contract to see gas analysis and optimization suggestions
                    </p>
                </div>
            </GlassCard>
        );
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-800';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
            case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-800';
            default: return 'text-gray-400 bg-gray-800/20 border-gray-700';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <AlertTriangle size={14} />;
            case 'medium': return <Info size={14} />;
            case 'low': return <TrendingDown size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <GlassCard className="flex flex-col h-full bg-gray-900">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-2">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">Gas Optimizer</span>
                </div>
                <div className="text-xs text-gray-400">
                    {analysis.optimizationSuggestions.length} suggestions
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Storage Analysis */}
                <div className="bg-gray-800/30 p-3 rounded border border-gray-700/50">
                    <div className="flex items-center space-x-2 mb-2">
                        <Package size={14} className="text-purple-400" />
                        <span className="text-sm font-semibold text-gray-200">Storage Analysis</span>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-400">
                            <span>Total Slots:</span>
                            <span className="text-gray-200">{analysis.storageAnalysis.totalSlots}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Wasted Slots:</span>
                            <span className={analysis.storageAnalysis.wastedSlots > 0 ? 'text-red-400' : 'text-green-400'}>
                                {analysis.storageAnalysis.wastedSlots}
                            </span>
                        </div>
                    </div>
                    {analysis.storageAnalysis.packingOpportunities.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">Packing Opportunities:</p>
                            {analysis.storageAnalysis.packingOpportunities.map((opp, idx) => (
                                <p key={idx} className="text-xs text-blue-300 ml-2">• {opp}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Function Gas Estimates */}
                {analysis.functionGasEstimates.length > 0 && (
                    <div className="bg-gray-800/30 p-3 rounded border border-gray-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                            <Zap size={14} className="text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-200">Function Gas Estimates</span>
                        </div>
                        <div className="space-y-2">
                            {analysis.functionGasEstimates.map((func, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300">{func.name}()</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${func.complexity === 'high' ? 'bg-red-900/30 text-red-400' :
                                                func.complexity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-green-900/30 text-green-400'
                                            }`}>
                                            {func.complexity}
                                        </span>
                                        <span className="text-gray-400">{func.estimatedGas.toLocaleString()} gas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Optimization Suggestions */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
                        <TrendingDown size={14} className="text-green-400" />
                        <span>Optimization Suggestions</span>
                    </h3>
                    {analysis.optimizationSuggestions.map((suggestion, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded border ${getSeverityColor(suggestion.severity)}`}
                        >
                            <div className="flex items-start space-x-2 mb-1">
                                {getSeverityIcon(suggestion.severity)}
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold">{suggestion.title}</h4>
                                    <p className="text-xs opacity-90 mt-1">{suggestion.description}</p>
                                </div>
                            </div>
                            <div className="mt-2 pl-6 space-y-1">
                                <p className="text-xs"><strong>Suggestion:</strong> {suggestion.suggestion}</p>
                                <p className="text-xs text-green-300">
                                    <strong>Potential Savings:</strong> {suggestion.potentialSavings}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};
