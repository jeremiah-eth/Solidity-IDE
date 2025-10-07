// Solidity compiler loader - Remix's exact approach
// Uses Remix's own CDN with browser-specific builds

interface SolcCompiler {
  compile: (input: string) => string;
  version: () => string;
  lowlevel: any;
}

let cachedCompiler: SolcCompiler | null = null;
let loadingPromise: Promise<SolcCompiler> | null = null;

export async function loadSolc(version: string = '0.8.24'): Promise<SolcCompiler> {
  // Return cached compiler if available
  if (cachedCompiler) {
    console.log('✅ Using cached compiler');
    return cachedCompiler;
  }

  // If already loading, wait for the existing promise
  if (loadingPromise) {
    console.log('⏳ Compiler already loading, waiting...');
    return loadingPromise;
  }

  console.log(`📦 Loading Solidity compiler v${version} from Remix CDN...`);

  // Create loading promise
  loadingPromise = loadCompilerFromRemixCDN(version);
  
  try {
    const compiler = await loadingPromise;
    cachedCompiler = compiler;
    loadingPromise = null; // Clear loading promise
    return compiler;
  } catch (error) {
    loadingPromise = null; // Clear loading promise on error
    throw error;
  }
}

async function loadCompilerFromRemixCDN(version: string): Promise<SolcCompiler> {
  // Polyfill for Node.js environment that Solidity compiler expects
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
      on: () => {},
      env: {},
      version: 'v16.0.0',
      versions: { node: '16.0.0' },
      platform: 'browser',
      nextTick: (fn: Function) => setTimeout(fn, 0)
    };
  }

  // Multiple CDN fallbacks for better reliability
  const cdnUrls = [
    // Official Solidity binaries
    `https://binaries.soliditylang.org/wasm/soljson-v${version}+commit.e11b9ed9.js`,
    // jsDelivr CDN
    `https://cdn.jsdelivr.net/npm/solc@${version}/soljson.js`,
    // unpkg CDN
    `https://unpkg.com/solc@${version}/soljson.js`,
    // Remix CDN (fallback)
    `https://remix-cdn.netlify.app/solc/soljson-v${version}+commit.e11b9ed9.js`
  ];

  let lastError: Error | null = null;

  for (const url of cdnUrls) {
    try {
      console.log(`📦 Trying to load compiler from: ${url}`);
      
      // Load script dynamically
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          console.log('✅ Script loaded successfully from:', url);
          resolve();
        };
        script.onerror = (error) => {
          console.warn('❌ Script loading failed from:', url, error);
          reject(new Error(`Failed to load from ${url}`));
        };
        document.head.appendChild(script);
      });
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for modern Solidity compiler API
      const hasSolidityAPI = (window as any)._solidity_compile && 
                            (window as any)._solidity_version && 
                            (window as any)._solidity_license;
      
      if (hasSolidityAPI) {
        console.log('✅ Found modern Solidity API');
        
        // Create a wrapper that matches the expected interface
        const compiler = {
          compile: (input: string) => {
            console.log('Using _solidity_compile API');
            return (window as any)._solidity_compile(input);
          },
          version: () => {
            console.log('Using _solidity_version API');
            return (window as any)._solidity_version();
          },
          license: () => {
            console.log('Using _solidity_license API');
            return (window as any)._solidity_license();
          },
          lowlevel: {
            compile: (input: string) => {
              return (window as any)._solidity_compile(input);
            }
          }
        };
        
        console.log('✅ Successfully loaded compiler from:', url);
        console.log('Compiler version:', compiler.version());
        return compiler;
      }
      
      // Fallback to traditional API
      const compiler = (window as any).solc || (window as any).Module || (window as any).soljson;
      console.log('Compiler object:', compiler);
      console.log('Compiler keys:', Object.keys(compiler || {}));
      
      if (!compiler || typeof compiler.compile !== 'function') {
        console.error('Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('sol')));
        throw new Error('Compiler not loaded correctly - no compile function found');
      }
      
      console.log('✅ Successfully loaded compiler from:', url);
      console.log('Compiler version:', compiler.version());
      return compiler;
      
    } catch (error) {
      console.warn(`❌ Failed to load from ${url}:`, error);
      lastError = error as Error;
      
      // Remove the failed script
      const scripts = document.querySelectorAll(`script[src="${url}"]`);
      scripts.forEach(script => script.remove());
      
      // Continue to next CDN
      continue;
    }
  }

  // If all CDNs failed
  console.error('❌ All CDN sources failed to load the compiler');
  throw new Error(`Failed to load Solidity compiler from any CDN. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Export the interface for use in other files
export type { SolcCompiler };