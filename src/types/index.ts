// Network configuration interface
export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  blockExplorerApi: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Compiled contract interface
export interface CompiledContract {
  abi: any[];
  bytecode: string;
  contractName: string;
}

// Compilation error interface
export interface CompilationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

// Deployed contract interface
export interface DeployedContract {
  address: string;
  contractName: string;
  network: Network;
  transactionHash: string;
  deployedAt: Date;
  abi: any[];
}

// Contract file interface
export interface ContractFile {
  name: string;
  content: string;
  path: string;
}

// Verification status interface
export interface VerificationStatus {
  status: 'pending' | 'verified' | 'failed';
  message: string;
  explorerUrl?: string;
}
