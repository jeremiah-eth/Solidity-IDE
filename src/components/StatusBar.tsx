import React from 'react';
import { Terminal, Keyboard, HelpCircle, Wifi, Activity } from 'lucide-react';

interface StatusBarProps {
    isConsoleOpen: boolean;
    onToggleConsole: () => void;
    onShowShortcuts: () => void;
    eventsCount: number;
    networkName?: string;
    blockNumber?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    isConsoleOpen,
    onToggleConsole,
    onShowShortcuts,
    eventsCount,
    networkName,
    blockNumber
}) => {
    return (
        <div className="h-8 bg-blue-900/90 border-t border-blue-800 flex items-center justify-between px-3 text-xs select-none z-50">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleConsole}
                    className={`flex items-center space-x-2 px-2 py-0.5 rounded transition-colors ${isConsoleOpen
                            ? 'bg-blue-800 text-white'
                            : 'text-blue-300 hover:bg-blue-800/50 hover:text-white'
                        }`}
                >
                    <Terminal size={12} />
                    <span className="font-medium">TERMINAL</span>
                    {eventsCount > 0 && (
                        <span className="bg-blue-600 text-white px-1.5 rounded-full text-[10px]">
                            {eventsCount}
                        </span>
                    )}
                </button>

                <div className="h-4 w-[1px] bg-blue-800"></div>

                <div className="flex items-center space-x-2 text-blue-300">
                    <Wifi size={12} />
                    <span>{networkName || 'Not Connected'}</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {blockNumber && (
                    <div className="flex items-center space-x-2 text-blue-300">
                        <Activity size={12} />
                        <span>Block: {blockNumber}</span>
                    </div>
                )}

                <div className="h-4 w-[1px] bg-blue-800"></div>

                <button
                    onClick={onShowShortcuts}
                    className="flex items-center space-x-1 text-blue-300 hover:text-white transition-colors"
                >
                    <Keyboard size={12} />
                    <span>Shortcuts</span>
                </button>

                <button
                    className="flex items-center space-x-1 text-blue-300 hover:text-white transition-colors"
                >
                    <HelpCircle size={12} />
                </button>
            </div>
        </div>
    );
};
