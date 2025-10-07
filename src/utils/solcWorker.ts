// Web Worker for Solidity compilation
// This runs solc in a separate thread to avoid blocking the main UI

import { parentPort } from 'worker_threads';
import { compileContract } from './compiler';

// Note: This worker is currently not used since we're using CDN-based compilation
// The main compilation happens in the main thread using the compiler utility

// Import resolver for Solidity imports
function findImports(path: string): { contents?: string; error?: string } {
  // For now, return error for all imports
  // This can be extended to handle actual file imports later
  return { error: 'Import not found' };
}

// Compile contract function using the new compiler utility
async function compileContractWorker(sourceCode: string, contractName: string) {
  try {
    // Use the new compiler utility
    const result = await compileContract(sourceCode, contractName);
    
    // Convert the result to the expected format
    return {
      abi: result.abi,
      bytecode: result.bytecode,
      errors: result.errors.map(e => e.message),
      warnings: result.warnings.map(w => w.message)
    };
  } catch (error) {
    // Handle compilation errors gracefully
    return {
      abi: [],
      bytecode: '',
      errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

// Handle messages from main thread
if (parentPort) {
  parentPort.on('message', async (message) => {
    try {
      const { type, data } = message;
      
      if (type === 'COMPILE') {
        const { sourceCode, contractName } = data;
        const result = await compileContractWorker(sourceCode, contractName);
        parentPort?.postMessage({ type: 'COMPILE_RESULT', result });
      }
    } catch (error) {
      parentPort?.postMessage({ 
        type: 'ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}
