// Solidity compiler using the new compiler utility
import { compileContract as compileContractUtil, type CompilationResult as CompilerResult } from './compiler';

// Load solc version 0.8.30
const SOLC_VERSION = '0.8.30';

// Sample contract for testing
export const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 indexed data);
    
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`;

// Compilation result interface
interface CompilationResult {
  abi: any[];
  bytecode: string;
  errors: string[];
  warnings: string[];
}

// Import resolver for Solidity imports
function findImports(path: string): { contents?: string; error?: string } {
  // For now, return error for all imports
  // This can be extended to handle actual file imports later
  return { error: 'Import not found' };
}

// Compile contract using the new compiler utility
export async function compileContract(sourceCode: string, contractName: string): Promise<CompilationResult> {
  try {
    console.log('Compiling contract using new compiler utility:', contractName);
    
    // Use the new compiler utility
    const result: CompilerResult = await compileContractUtil(sourceCode, contractName, SOLC_VERSION);
    
    // Convert the result to the expected format
    return {
      abi: result.abi,
      bytecode: result.bytecode,
      errors: result.errors.map(e => e.message),
      warnings: result.warnings.map(w => w.message)
    };
  } catch (error) {
    console.error('Compilation failed:', error);
    return {
      abi: [],
      bytecode: '',
      errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

// Test compiler function
export async function testCompiler(): Promise<CompilationResult> {
  return await compileContract(SAMPLE_CONTRACT, 'SimpleStorage');
}

// Export the import resolver function
export { findImports };

// Utility function to get solc version
export function getSolcVersion(): string {
  return SOLC_VERSION;
}

// Utility function to validate Solidity syntax (basic check)
export async function validateSoliditySyntax(sourceCode: string): Promise<{ isValid: boolean; errors: string[] }> {
  try {
    const result = await compileContract(sourceCode, 'TestContract');
    return {
      isValid: result.errors.length === 0,
      errors: result.errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Syntax validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

