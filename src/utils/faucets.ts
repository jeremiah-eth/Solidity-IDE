import { Network } from '../types';

// Mock faucet delay to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface FaucetResponse {
    success: boolean;
    message: string;
    txHash?: string;
}

export const requestFunds = async (address: string, network: Network): Promise<FaucetResponse> => {
    // In a real app, this would call a backend API that holds the faucet private key
    // or interface with a third-party faucet API (which usually requires captcha).

    // For this demo, we'll simulate a successful request for testnets
    await delay(2000);

    if (!network.name.toLowerCase().includes('testnet') &&
        !network.name.toLowerCase().includes('sepolia') &&
        !network.name.toLowerCase().includes('alfajores') &&
        network.id !== 'hardhat' && network.id !== 'localhost') {
        return {
            success: false,
            message: 'Faucet is only available for testnets and local networks.'
        };
    }

    // Simulate success
    return {
        success: true,
        message: `Successfully sent 0.1 ${network.nativeCurrency.symbol} to ${address}`,
        txHash: '0x' + Array(64).fill('0').map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    };
};
