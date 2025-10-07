// Web Worker-based Solidity Compiler
// Mirrors Remix IDE's approach for reliable browser compilation

export interface CompilationResult {
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  contractName: string;
  errors: CompilationError[];
  warnings: CompilationError[];
  metadata?: string;
}

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

class WebWorkerCompiler {
  private worker: Worker | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      // Create Web Worker
      this.worker = new Worker('/solc-worker.js');
      
      // Set up message handling
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
      
      console.log('✅ Web Worker created for Solidity compilation');
    } catch (error) {
      console.error('❌ Failed to create Web Worker:', error);
      throw new Error('Failed to create Web Worker for compilation');
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, success, data, error, version } = event.data;
    
    switch (type) {
      case 'INIT_RESPONSE':
        if (success) {
          console.log('✅ Solidity compiler initialized in Web Worker');
          this.isInitialized = true;
        } else {
          console.error('❌ Failed to initialize compiler:', error);
        }
        break;
        
      case 'COMPILE_RESPONSE':
        // Handle compilation response
        if (success) {
          console.log('✅ Compilation completed in Web Worker');
        } else {
          console.error('❌ Compilation failed in Web Worker:', data?.error);
        }
        break;
        
      case 'VERSION_RESPONSE':
        console.log('📦 Compiler version:', version);
        break;
        
      case 'ERROR':
        console.error('❌ Web Worker error:', error);
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    console.error('❌ Web Worker error:', error);
  }

  private async waitForInitialization(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      const checkInit = () => {
        if (this.isInitialized) {
          resolve(true);
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });

    return this.initPromise;
  }

  async initialize(): Promise<boolean> {
    if (!this.worker) {
      throw new Error('Web Worker not created');
    }

    // Send initialization message
    this.worker.postMessage({ type: 'INIT' });
    
    // Wait for initialization
    return await this.waitForInitialization();
  }

  async compileContract(
    sourceCode: string,
    contractName: string,
    version: string = '0.8.30'
  ): Promise<CompilationResult> {
    if (!this.worker) {
      throw new Error('Web Worker not available');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    // Create Remix-style input JSON
    const input: CompilationInput = {
      language: 'Solidity',
      sources: {
        [`${contractName}.sol`]: {
          content: sourceCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'metadata']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: 'london',
        viaIR: false
      }
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Compilation timeout'));
      }, 30000); // 30 second timeout

      const handleMessage = (event: MessageEvent) => {
        const { type, success, data } = event.data;
        
        if (type === 'COMPILE_RESPONSE') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handleMessage);
          
          if (success) {
            const result = this.processCompilationResult(data.output, contractName);
            resolve(result);
          } else {
            reject(new Error(data.error || 'Compilation failed'));
          }
        }
      };

      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({ 
        type: 'COMPILE', 
        data: { input: JSON.stringify(input) } 
      });
    });
  }

  private processCompilationResult(output: any, contractName: string): CompilationResult {
    // Process the compilation output similar to the original compiler
    const errors: CompilationError[] = [];
    const warnings: CompilationError[] = [];

    if (output.errors) {
      output.errors.forEach((error: any) => {
        const compilationError: CompilationError = {
          type: error.severity === 'error' ? 'error' : 'warning',
          message: error.formattedMessage || error.message,
          line: error.sourceLocation?.start?.line,
          column: error.sourceLocation?.start?.column,
          severity: error.severity,
          sourceLocation: error.sourceLocation
        };

        if (error.severity === 'error') {
          errors.push(compilationError);
        } else if (error.severity === 'warning') {
          warnings.push(compilationError);
        }
      });
    }

    // Extract contract compilation results
    const contracts = output.contracts?.[`${contractName}.sol`];
    const contract = contracts?.[contractName];

    if (!contract) {
      throw new Error(`Contract "${contractName}" not found in compiled output`);
    }

    const abi = contract.abi || [];
    const bytecode = contract.evm?.bytecode?.object || '';
    const deployedBytecode = contract.evm?.deployedBytecode?.object || '';
    const metadata = contract.metadata || '';

    return {
      abi,
      bytecode,
      deployedBytecode,
      contractName,
      errors,
      warnings,
      metadata
    };
  }

  async getVersion(): Promise<string> {
    if (!this.worker) {
      throw new Error('Web Worker not available');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Version request timeout'));
      }, 5000);

      const handleMessage = (event: MessageEvent) => {
        const { type, version } = event.data;
        
        if (type === 'VERSION_RESPONSE') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handleMessage);
          resolve(version);
        }
      };

      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({ type: 'GET_VERSION' });
    });
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Singleton instance
let compilerInstance: WebWorkerCompiler | null = null;

export function getWebWorkerCompiler(): WebWorkerCompiler {
  if (!compilerInstance) {
    compilerInstance = new WebWorkerCompiler();
  }
  return compilerInstance;
}

// Export the main compilation function
export async function compileContract(
  sourceCode: string,
  contractName: string,
  version: string = '0.8.30'
): Promise<CompilationResult> {
  const compiler = getWebWorkerCompiler();
  return await compiler.compileContract(sourceCode, contractName, version);
}

// Export version function
export async function getCompilerVersion(): Promise<string> {
  const compiler = getWebWorkerCompiler();
  return await compiler.getVersion();
}
