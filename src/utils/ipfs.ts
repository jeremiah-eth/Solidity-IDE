import PinataSDK from '@pinata/sdk';

// Pinata SDK instance
let pinata: PinataSDK | null = null;

// Initialize Pinata client
export function initPinata(): void {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not found. Please check your environment variables.');
  }
  
  pinata = new PinataSDK({
    pinataApiKey: apiKey,
    pinataSecretApiKey: secretKey
  });
}

// Contract metadata interface
interface ContractMetadata {
  contractName: string;
  compilerVersion: string;
  sourceCode: string;
  abi: any[];
  networks: {
    chainId: number;
    address: string;
    transactionHash: string;
    deployedAt: string;
  }[];
  createdAt: string;
  description?: string;
}

// Upload contract metadata to IPFS
export async function uploadMetadata(metadata: ContractMetadata): Promise<string> {
  if (!pinata) {
    initPinata();
  }
  
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    // Create metadata JSON
    const metadataJson = JSON.stringify(metadata, null, 2);
    
    // Upload to Pinata
    const response = await pinata.pinJSONToIPFS(metadata);
    
    return response.IpfsHash;
  } catch (error) {
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get metadata URL from CID
export function getMetadataUrl(cid: string): string {
  // Use Pinata's public gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

// Alternative gateway URLs (for redundancy)
export function getMetadataUrlAlternative(cid: string): string {
  // Use public IPFS gateway as fallback
  return `https://ipfs.io/ipfs/${cid}`;
}

// Create contract metadata object
export function createContractMetadata(
  contractName: string,
  compilerVersion: string,
  sourceCode: string,
  abi: any[],
  networks: { chainId: number; address: string; transactionHash: string; deployedAt: string }[],
  description?: string
): ContractMetadata {
  return {
    contractName,
    compilerVersion,
    sourceCode,
    abi,
    networks,
    createdAt: new Date().toISOString(),
    description
  };
}

// Upload source code file to IPFS
export async function uploadSourceCode(sourceCode: string, filename: string): Promise<string> {
  if (!pinata) {
    initPinata();
  }
  
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    // Create a file-like object
    const file = new File([sourceCode], filename, { type: 'text/plain' });
    
    // Upload to Pinata
    const response = await pinata.pinFileToIPFS(file, {
      pinataMetadata: {
        name: filename
      }
    });
    
    return response.IpfsHash;
  } catch (error) {
    throw new Error(`Failed to upload source code to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get file URL from CID
export function getFileUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

// Test Pinata connection
export async function testPinataConnection(): Promise<boolean> {
  try {
    if (!pinata) {
      initPinata();
    }
    
    if (!pinata) {
      return false;
    }
    
    // Test with a simple JSON upload
    const testData = { test: 'connection', timestamp: new Date().toISOString() };
    await pinata.pinJSONToIPFS(testData);
    
    return true;
  } catch (error) {
    console.error('Pinata connection test failed:', error);
    return false;
  }
}
