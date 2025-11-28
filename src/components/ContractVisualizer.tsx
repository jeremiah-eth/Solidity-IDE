import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { GlassCard } from './GlassCard';
import { Network, Maximize2, Minimize2 } from 'lucide-react';

interface ContractVisualizerProps {
    mermaidCode: string;
    title?: string;
}

export const ContractVisualizer: React.FC<ContractVisualizerProps> = ({
    mermaidCode,
    title = 'Contract Structure'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {
                primaryColor: '#6366f1',
                primaryTextColor: '#fff',
                primaryBorderColor: '#4f46e5',
                lineColor: '#8b5cf6',
                secondaryColor: '#7c3aed',
                tertiaryColor: '#5b21b6',
                background: '#1f2937',
                mainBkg: '#111827',
                secondBkg: '#1f2937',
                textColor: '#e5e7eb',
                fontSize: '14px'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }, []);

    useEffect(() => {
        if (!containerRef.current || !mermaidCode) return;

        const renderDiagram = async () => {
            try {
                setError(null);
                const { svg } = await mermaid.render('contract-graph', mermaidCode);
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch (err) {
                console.error('Failed to render mermaid diagram:', err);
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
            }
        };

        renderDiagram();
    }, [mermaidCode]);

    return (
        <GlassCard className={`flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'h-full'}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Network size={16} />
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title={isExpanded ? "Minimize" : "Maximize"}
                >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {error ? (
                    <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded border border-red-800">
                        <p className="font-semibold mb-1">Failed to render diagram</p>
                        <p className="text-xs">{error}</p>
                    </div>
                ) : !mermaidCode ? (
                    <div className="text-gray-500 italic text-center mt-8">
                        Compile a contract to see its structure visualization
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="mermaid-container flex items-center justify-center min-h-full"
                    />
                )}
            </div>
        </GlassCard>
    );
};
