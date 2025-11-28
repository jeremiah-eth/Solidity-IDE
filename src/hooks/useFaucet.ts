import { useState } from 'react';
import { requestFunds, FaucetResponse } from '../utils/faucets';
import { Network } from '../types';

interface UseFaucetReturn {
    isLoading: boolean;
    requestFunds: (address: string, network: Network) => Promise<FaucetResponse>;
}

export function useFaucet(): UseFaucetReturn {
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestFunds = async (address: string, network: Network): Promise<FaucetResponse> => {
        setIsLoading(true);
        try {
            const response = await requestFunds(address, network);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        requestFunds: handleRequestFunds
    };
}
