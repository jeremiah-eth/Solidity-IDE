import { JsonRpcProvider } from 'ethers';

export const LOCAL_NODE_URL = 'http://localhost:8545';

export const checkLocalNodeConnection = async (): Promise<boolean> => {
    try {
        const provider = new JsonRpcProvider(LOCAL_NODE_URL);
        await provider.getNetwork();
        return true;
    } catch (error) {
        return false;
    }
};

export const getLocalProvider = (): JsonRpcProvider => {
    return new JsonRpcProvider(LOCAL_NODE_URL);
};
