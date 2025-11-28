import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ContractEvent } from '../components/EventConsole';

export function useContractEvents(
    provider: ethers.Provider | null,
    address: string | null,
    abi: any[] | null
) {
    const [events, setEvents] = useState<ContractEvent[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!provider || !address || !abi || isPaused) return;

        let contract: ethers.Contract;

        const setupListener = async () => {
            try {
                contract = new ethers.Contract(address, abi, provider);

                // Listen to all events
                contract.on('*', (event: any) => {
                    // The event object structure depends on ethers version and provider
                    // For ethers v6, the wildcard listener receives the event payload directly or as the last arg

                    // We need to parse the event safely
                    const timestamp = Date.now();

                    // Extract event details
                    // Note: In ethers v6, 'event' might be a ContractEventPayload
                    const eventName = event.eventName || event.fragment?.name || 'UnknownEvent';
                    const args = event.args ? Object.fromEntries(
                        Object.entries(event.args).filter(([key]) => isNaN(Number(key))) // Remove array index keys
                    ) : {};

                    const blockNumber = event.blockNumber || 0;
                    const transactionHash = event.log?.transactionHash || event.transactionHash || '';

                    const newEvent: ContractEvent = {
                        id: `${transactionHash}-${event.index || Date.now()}`,
                        name: eventName,
                        args,
                        blockNumber,
                        timestamp,
                        transactionHash
                    };

                    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
                });
            } catch (error) {
                console.error('Failed to setup event listener:', error);
            }
        };

        setupListener();

        return () => {
            if (contract) {
                contract.removeAllListeners();
            }
        };
    }, [provider, address, abi, isPaused]);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    return {
        events,
        clearEvents,
        isPaused,
        togglePause
    };
}
