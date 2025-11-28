import React from 'react';
import { GlassCard } from './GlassCard';
import { Shield, AlertTriangle, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import type { AuditReport, SecurityIssue } from '../utils/securityAuditor';

interface SecurityAuditPanelProps {
    report: AuditReport | null;
}

export const SecurityAuditPanel: React.FC<SecurityAuditPanelProps> = ({ report }) => {
    if (!report) {
        return (
            <GlassCard className="flex flex-col h-full bg-gray-900">
                <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                    <Shield size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Security Audit</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-500 italic text-sm text-center">
                        Compile a contract to see security audit results
                    </p>
                </div>
            </GlassCard>
        );
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <XCircle size={14} className="text-red-500" />;
            case 'high': return <AlertTriangle size={14} className="text-orange-500" />;
            case 'medium': return <AlertCircle size={14} className="text-yellow-500" />;
            case 'low': return <Info size={14} className="text-blue-400" />;
            case 'info': return <Info size={14} className="text-gray-400" />;
            default: return <Info size={14} />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-900/20 border-red-800';
            case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-800';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
            case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-800';
            case 'info': return 'text-gray-400 bg-gray-800/20 border-gray-700';
            default: return 'text-gray-400 bg-gray-800/20 border-gray-700';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        if (score >= 50) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Poor';
    };

    return (
        <GlassCard className="flex flex-col h-full bg-gray-900">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Security Audit</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Score:</span>
                    <span className={`text-sm font-bold ${getScoreColor(report.score)}`}>
                        {report.score}/100
                    </span>
                    <span className={`text-xs ${getScoreColor(report.score)}`}>
                        ({getScoreLabel(report.score)})
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Summary */}
                <div className="bg-gray-800/30 p-3 rounded border border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-200 mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Critical:</span>
                            <span className={report.summary.critical > 0 ? 'text-red-400 font-bold' : 'text-gray-500'}>
                                {report.summary.critical}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">High:</span>
                            <span className={report.summary.high > 0 ? 'text-orange-400 font-bold' : 'text-gray-500'}>
                                {report.summary.high}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Medium:</span>
                            <span className={report.summary.medium > 0 ? 'text-yellow-400' : 'text-gray-500'}>
                                {report.summary.medium}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Low:</span>
                            <span className={report.summary.low > 0 ? 'text-blue-400' : 'text-gray-500'}>
                                {report.summary.low}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Issues */}
                {report.issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-green-900/10 border border-green-800 rounded">
                        <CheckCircle size={32} className="text-green-400 mb-2" />
                        <p className="text-green-400 font-semibold">No security issues found!</p>
                        <p className="text-xs text-gray-400 mt-1">Your contract follows security best practices</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
                            <AlertTriangle size={14} className="text-yellow-400" />
                            <span>Issues Found ({report.issues.length})</span>
                        </h3>

                        {report.issues.map((issue, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded border ${getSeverityColor(issue.severity)}`}
                            >
                                <div className="flex items-start space-x-2 mb-2">
                                    {getSeverityIcon(issue.severity)}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold">{issue.title}</h4>
                                            <span className="text-xs px-2 py-0.5 rounded bg-black/20 uppercase">
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-90">{issue.description}</p>
                                    </div>
                                </div>

                                <div className="mt-2 pl-6 space-y-1">
                                    <div className="text-xs">
                                        <span className="font-semibold text-gray-300">Category:</span>{' '}
                                        <span className="text-gray-400">{issue.category}</span>
                                    </div>

                                    <div className="text-xs">
                                        <span className="font-semibold text-gray-300">Recommendation:</span>{' '}
                                        <span className="text-gray-400">{issue.recommendation}</span>
                                    </div>

                                    {issue.references && issue.references.length > 0 && (
                                        <div className="text-xs">
                                            <span className="font-semibold text-gray-300">Learn more:</span>{' '}
                                            {issue.references.map((ref, i) => (
                                                <a
                                                    key={i}
                                                    href={ref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                >
                                                    Link {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
