import React from 'react';
import { Trash2, Terminal, Pause, Play } from 'lucide-react';
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
}

export const EventConsole: React.FC<EventConsoleProps> = ({
    events,
    onClear,
    isPaused = false,
    onTogglePause
}) => {
    return (
        <GlassCard className="flex flex-col h-full bg-gray-900 border-t border-gray-700 rounded-none">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Terminal size={16} />
                    <span className="text-sm font-medium">Event Console</span>
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-400">
                        {events.length} events
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    {onTogglePause && (
                        <button
                            onClick={onTogglePause}
                            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${isPaused ? 'text-yellow-400' : 'text-gray-400'}`}
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                    )}
                    <button
                        onClick={onClear}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        title="Clear Console"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-2">
                {events.length === 0 ? (
                    <div className="text-gray-500 italic text-center mt-4">
                        No events captured yet. Deploy a contract or interact with one to see events here.
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="group flex flex-col bg-gray-800/30 p-2 rounded border border-gray-700/50 hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-400 font-bold">{event.name}</span>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span>Block: {event.blockNumber}</span>
                                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="pl-4 border-l-2 border-gray-700">
                                {Object.entries(event.args).map(([key, value]) => (
                                    <div key={key} className="flex space-x-2">
                                        <span className="text-gray-400">{key}:</span>
                                        <span className="text-green-300 break-all">
                                            {typeof value === 'object' ? JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v) : String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
};
