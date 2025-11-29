import React, { useEffect, useRef } from 'react';
import { Trash2, Terminal, Pause, Play, X, Minus, ChevronUp } from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface ContractEvent {
    id: string;
    name: string;
    args: Record<string, any>;
    blockNumber: number;
    timestamp: number;
    transactionHash: string;
}

interface EventConsoleProps {
    events: ContractEvent[];
    onClear: () => void;
    isPaused?: boolean;
    onTogglePause?: () => void;
    isOpen: boolean;
    onToggleOpen: () => void;
    height?: string;
}

export const EventConsole: React.FC<EventConsoleProps> = ({
    events,
    onClear,
    isPaused = false,
    onTogglePause,
    isOpen,
    onToggleOpen,
    height = 'h-64'
}) => {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new events
    useEffect(() => {
        if (isOpen && !isPaused) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [events, isOpen, isPaused]);

    if (!isOpen) return null;

    return (
        <div className={`fixed bottom-8 left-0 right-0 ${height} bg-black/90 border-t border-gray-700 backdrop-blur-md transition-all duration-300 z-40 flex flex-col font-mono text-sm shadow-2xl`}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800/80 border-b border-gray-700 select-none">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Terminal size={14} className="text-green-400" />
                        <span className="font-semibold text-xs tracking-wide">TERMINAL</span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-600"></div>
                    <span className="text-xs text-gray-400">
                        {events.length} events captured
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    {onTogglePause && (
                        <button
                            onClick={onTogglePause}
                            className={`p-1 rounded hover:bg-gray-700 transition-colors ${isPaused ? 'text-yellow-400' : 'text-gray-400'}`}
                            title={isPaused ? "Resume Output" : "Pause Output"}
                        >
                            {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        </button>
                    )}
                    <button
                        onClick={onClear}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        title="Clear Console"
                    >
                        <Trash2 size={12} />
                    </button>
                    <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
                    <button
                        onClick={onToggleOpen}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Minimize"
                    >
                        <Minus size={14} />
                    </button>
                </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 overflow-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {events.length === 0 ? (
                    <div className="text-gray-500 italic px-2 py-1">
                        $ Waiting for contract events...
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="group flex items-start space-x-2 hover:bg-white/5 px-2 py-0.5 rounded text-xs">
                            <span className="text-gray-500 shrink-0">
                                [{new Date(event.timestamp).toLocaleTimeString()}]
                            </span>
                            <span className="text-blue-400 shrink-0">
                                #{event.blockNumber}
                            </span>
                            <span className="text-purple-400 font-bold shrink-0">
                                {event.name}
                            </span>
                            <span className="text-gray-300 break-all">
                                {Object.entries(event.args).map(([key, value], idx, arr) => (
                                    <span key={key}>
                                        <span className="text-gray-500">{key}=</span>
                                        <span className="text-green-300">
                                            {typeof value === 'object'
                                                ? JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v)
                                                : String(value)}
                                        </span>
                                        {idx < arr.length - 1 && <span className="text-gray-600 mr-1">, </span>}
                                    </span>
                                ))}
                            </span>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>
        </div>
    );
};
