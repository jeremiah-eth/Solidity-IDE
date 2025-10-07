// Solidity compiler utility - Web Worker approach (mirrors Remix IDE)
import { compileContract as webWorkerCompile, getCompilerVersion as webWorkerGetVersion } from './webWorkerCompiler';

// Compilation result interface
export interface CompilationResult {
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  contractName: string;
  errors: CompilationError[];
  warnings: CompilationError[];
  metadata?: string;
}

// Compilation error interface
export interface CompilationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

// Compilation input interface (Remix-style)
interface CompilationInput {
  language: 'Solidity';
  sources: {
    [fileName: string]: {
      content: string;
    };
  };
  settings: {
    outputSelection: {
      '*': {
        '*': string[];
      };
    };
    optimizer: {
      enabled: boolean;
      runs: number;
    };
    evmVersion?: string;
    viaIR?: boolean;
  };
}

// Import resolver for Solidity imports
function findImports(path: string): { contents?: string; error?: string } {
  // For now, return error for all imports
  // This can be extended to handle actual file imports later
  return { error: `Import not found: ${path}` };
}

/**
 * Compile a Solidity contract using Web Worker approach (mirrors Remix IDE)
 * @param sourceCode - The Solidity source code
 * @param contractName - The name of the contract
 * @param version - Optional compiler version (defaults to 0.8.30)
 * @returns Promise<CompilationResult> - The compilation result
 */
export async function compileContract(
  sourceCode: string,
  contractName: string,
  version: string = '0.8.30'
): Promise<CompilationResult> {
  try {
    console.log(`🔨 Compiling contract: ${contractName}`);
    console.log(`📝 Source code length: ${sourceCode.length}`);
    console.log(`⚙️ Using compiler version: ${version}`);

    // Use Web Worker for compilation
    const result = await webWorkerCompile(sourceCode, contractName, version);
    
    console.log('✅ Web Worker compilation completed!');
    console.log('📊 Results:');
    console.log('  - Contract Name:', result.contractName);
    console.log('  - ABI Length:', result.abi?.length || 0);
    console.log('  - Bytecode Length:', result.bytecode?.length || 0);
    console.log('  - Errors:', result.errors?.length || 0);
    console.log('  - Warnings:', result.warnings?.length || 0);

    return result;

  } catch (error) {
    console.error('❌ Compilation failed:', error);
    
    // Return error result
    return {
      abi: [],
      bytecode: '',
      deployedBytecode: '',
      contractName,
      errors: [{
        type: 'error',
        message: `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      }],
      warnings: [],
      metadata: ''
    };
  }
}

/**
 * Validate Solidity syntax without full compilation
 * @param sourceCode - The Solidity source code
 * @param version - Optional compiler version
 * @returns Promise<{ isValid: boolean; errors: CompilationError[] }>
 */
export async function validateSoliditySyntax(
  sourceCode: string,
  version: string = '0.8.24'
): Promise<{ isValid: boolean; errors: CompilationError[] }> {
  try {
    const result = await compileContract(sourceCode, 'ValidationContract', version);
    return {
      isValid: result.errors.length === 0,
      errors: result.errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        type: 'error',
        message: `Syntax validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      }]
    };
  }
}

/**
 * Get compiler version information
 * @param version - The compiler version (unused, kept for compatibility)
 * @returns Promise<string> - The compiler version string
 */
export async function getCompilerVersion(version: string = '0.8.30'): Promise<string> {
  try {
    return await webWorkerGetVersion();
  } catch (error) {
    console.error('Failed to get compiler version:', error);
    return version;
  }
}

/**
 * Get compiler license information
 * @param version - The compiler version (unused, kept for compatibility)
 * @returns Promise<string> - The compiler license
 */
export async function getCompilerLicense(version: string = '0.8.30'): Promise<string> {
  try {
    // Web Worker approach - return default license
    return 'MIT';
  } catch (error) {
    console.error('Failed to get compiler license:', error);
    return 'MIT';
  }
}

/**
 * Test the compiler with a simple contract
 * @param version - Optional compiler version
 * @returns Promise<CompilationResult> - Test compilation result
 */
export async function testCompiler(version: string = '0.8.30'): Promise<CompilationResult> {
  const testContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract TestContract {
    uint256 public value;
    
    constructor(uint256 _value) {
        value = _value;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`;

  return await compileContract(testContract, 'TestContract', version);
}
