import React, { useState } from 'react';
import { X, Droplets, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { requestFunds } from '../utils/faucets';
import { Network } from '../types';

interface FaucetModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: string | null;
    network: Network | null;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose, address, network }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [targetAddress, setTargetAddress] = useState(address || '');

    if (!isOpen) return null;

    const handleRequest = async () => {
        if (!network || !targetAddress) return;

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const result = await requestFunds(targetAddress, network);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md bg-gray-900 border border-gray-700 p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                        <Droplets size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Testnet Faucet</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Network</label>
                        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-white">
                            {network?.name || 'No Network Selected'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Wallet Address</label>
                        <input
                            type="text"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0x..."
                        />
                    </div>

                    {status === 'success' && (
                        <div className="p-3 bg-green-900/30 border border-green-900/50 rounded-lg flex items-start space-x-2">
                            <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-green-200">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start space-x-2">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-200">{message}</p>
                        </div>
                    )}

                    <button
                        onClick={handleRequest}
                        disabled={isLoading || !network}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Requesting...</span>
                            </>
                        ) : (
                            <>
                                <Droplets size={18} />
                                <span>Get Funds</span>
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
