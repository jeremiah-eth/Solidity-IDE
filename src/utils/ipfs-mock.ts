// Mock IPFS utility to avoid Pinata SDK browser compatibility issues
// TODO: Replace with proper Pinata SDK integration once browser compatibility is resolved

// Mock Pinata client
let pinata: any = null;

// Initialize Pinata client (mock)
export function initPinata(): void {
  console.log('IPFS functionality temporarily disabled for browser compatibility');
  pinata = { mock: true };
}

// Contract metadata interface
export interface ContractMetadata {
  name: string;
  description: string;
  compiler: {
    version: string;
  };
  source: string;
  abi: any[];
  networks: Record<string, {
    address: string;
    transactionHash: string;
  }>;
}

// Upload metadata to IPFS (mock)
export async function uploadMetadata(metadata: ContractMetadata): Promise<string> {
  console.log('Mock IPFS upload:', metadata);
  
  // Return a mock IPFS hash
  return 'QmMockHash' + Math.random().toString(36).substring(2, 15);
}

// Upload source code to IPFS (mock)
export async function uploadSourceCode(sourceCode: string, filename: string): Promise<string> {
  console.log('Mock IPFS source upload:', filename);
  
  // Return a mock IPFS hash
  return 'QmMockSourceHash' + Math.random().toString(36).substring(2, 15);
}

// Get IPFS gateway URL (mock)
export function getIpfsUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

// Create contract metadata (mock)
export function createContractMetadata(
  contractName: string,
  sourceCode: string,
  abi: any[],
  networks: Record<string, { address: string; transactionHash: string }>
): ContractMetadata {
  return {
    name: contractName,
    description: `Smart contract ${contractName}`,
    compiler: {
      version: '0.8.24'
    },
    source: sourceCode,
    abi,
    networks
  };
}

// Check if Pinata is initialized (mock)
export function isPinataInitialized(): boolean {
  return pinata !== null;
}

// Note: uploadSourceCode is already defined above as a function
