import { useAppKit, useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import { BrowserProvider } from 'ethers';
import type { Eip1193Provider, Signer } from 'ethers';
import { useState, useEffect, useMemo } from 'react';

export function useAppKitWallet() {
    const { open, close } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');
    const { chainId, switchNetwork } = useAppKitNetwork();

    const [signer, setSigner] = useState<Signer | null>(null);

    useEffect(() => {
        async function updateSigner() {
            if (isConnected && walletProvider) {
                try {
                    const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
                    const newSigner = await ethersProvider.getSigner();
                    setSigner(newSigner);
                } catch (error) {
                    console.error('Failed to create signer:', error);
                    setSigner(null);
                }
            } else {
                setSigner(null);
            }
        }

        updateSigner();
    }, [isConnected, walletProvider, chainId]); // Update signer when chain changes too

    const connect = async () => {
        await open();
    };

    const disconnect = async () => {
        // AppKit handles disconnect via the modal usually, but we can force it if needed
        // There isn't a direct 'disconnect' method exposed by useAppKit, 
        // but opening the modal allows user to disconnect.
        // For programmatic disconnect we might need to use the disconnect button in the modal
        // or check if there is a disconnect method in newer versions.
        // For now, opening the modal is the standard way.
        await open({ view: 'Account' });
    };

    return {
        address: address || null,
        isConnected,
        chainId: chainId ? Number(chainId) : null,
        signer,
        connect,
        disconnect,
        switchNetwork: async (chainId: number) => {
            // AppKit expects chainId as number or string depending on version, usually safe to pass as is
            await switchNetwork(chainId as any);
        },
        open
    };
}
