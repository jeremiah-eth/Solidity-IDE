import axios from 'axios';
import { getExplorerApiUrl, getExplorerUrl, getExplorerApiKey } from './networks';

// Verification parameters interface
interface VerificationParams {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  constructorArgs: string;
  chainId: number;
}

// Verification result interface
interface VerificationResult {
  guid: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  explorerUrl?: string;
}

// Verification status response interface
interface VerificationStatusResponse {
  status: string;
  result: string;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate exponential backoff delay
function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// Verify contract on the appropriate block explorer
export async function verifyContract(params: VerificationParams): Promise<VerificationResult> {
  const { contractAddress, sourceCode, contractName, compilerVersion, constructorArgs, chainId } = params;
  
  // Get the correct API URL and key
  const apiUrl = getExplorerApiUrl(chainId);
  const apiKey = getExplorerApiKey();
  
  if (!apiUrl || !apiKey) {
    throw new Error(`No API configuration found for chain ID ${chainId}`);
  }
  
  // Prepare verification data
  const verificationData = {
    apikey: apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourcecode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: contractName,
    compilerversion: `v${compilerVersion}`,
    constructorArguements: constructorArgs,
    evmversion: 'default',
    optimizationUsed: 1,
    runs: 200
  };
  
  let lastError: Error | null = null;
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await axios.post(apiUrl, verificationData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000 // 30 second timeout
      });
      
      const result = response.data;
      
      if (result.status === '1') {
        return {
          guid: result.result,
          status: 'pending',
          message: 'Verification submitted successfully',
          explorerUrl: undefined
        };
      } else {
        throw new Error(result.result || 'Verification submission failed');
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on certain errors
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new Error(`Verification failed: ${error.response.data?.result || error.message}`);
      }
      
      // If this is the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries - 1) {
        throw new Error(`Verification failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError.message}`);
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.warn(`Verification attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Verification failed after all retry attempts');
}

// Check verification status
export async function checkVerificationStatus(guid: string, chainId: number): Promise<VerificationResult> {
  const apiUrl = getExplorerApiUrl(chainId);
  const apiKey = getExplorerApiKey();
  
  if (!apiUrl || !apiKey) {
    throw new Error(`No API configuration found for chain ID ${chainId}`);
  }
  
  let lastError: Error | null = null;
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await axios.get(apiUrl, {
        params: {
          apikey: apiKey,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        },
        timeout: 10000 // 10 second timeout
      });
      
      const result: VerificationStatusResponse = response.data;
      
      if (result.status === '1') {
        if (result.result === 'Pending in queue') {
          return {
            guid,
            status: 'pending',
            message: 'Verification is pending',
            explorerUrl: undefined
          };
        } else if (result.result === 'Pass - Verified') {
          return {
            guid,
            status: 'success',
            message: 'Contract verified successfully',
            explorerUrl: getExplorerContractUrl(guid, chainId)
          };
        } else {
          return {
            guid,
            status: 'failed',
            message: result.result,
            explorerUrl: undefined
          };
        }
      } else {
        throw new Error(result.result || 'Status check failed');
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries - 1) {
        throw new Error(`Status check failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError.message}`);
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.warn(`Status check attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Status check failed after all retry attempts');
}

// Get explorer contract URL
export function getExplorerContractUrl(address: string, chainId: number): string {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/address/${address}`;
}

// Poll verification status until completion
export async function pollVerificationStatus(
  guid: string, 
  chainId: number, 
  maxAttempts: number = 30,
  pollInterval: number = 10000
): Promise<VerificationResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkVerificationStatus(guid, chainId);
    
    if (result.status !== 'pending') {
      return result;
    }
    
    // Wait before next poll
    if (attempt < maxAttempts - 1) {
      await sleep(pollInterval);
    }
  }
  
  return {
    guid,
    status: 'failed',
    message: 'Verification polling timeout',
    explorerUrl: undefined
  };
}

// Get supported chain IDs for verification
export function getSupportedVerificationChains(): number[] {
  return [1, 11155111, 8453, 84532, 42220, 44787]; // Ethereum, Sepolia, Base, Base Sepolia, Celo, Alfajores
}

// Validate verification parameters
export function validateVerificationParams(params: VerificationParams): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!params.contractAddress || !params.contractAddress.startsWith('0x')) {
    errors.push('Invalid contract address');
  }
  
  if (!params.sourceCode || params.sourceCode.trim().length === 0) {
    errors.push('Source code is required');
  }
  
  if (!params.contractName || params.contractName.trim().length === 0) {
    errors.push('Contract name is required');
  }
  
  if (!params.compilerVersion || params.compilerVersion.trim().length === 0) {
    errors.push('Compiler version is required');
  }
  
  if (!getSupportedVerificationChains().includes(params.chainId)) {
    errors.push(`Chain ID ${params.chainId} is not supported for verification`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
