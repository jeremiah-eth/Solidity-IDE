// Solidity Compiler Web Worker
// Runs in a separate thread to avoid blocking the main UI

let solc = null;
let isInitialized = false;

// Load solc from CDN
async function loadSolc(version = '0.8.30') {
    try {
        console.log(`📦 Loading Solidity compiler version ${version}...`);

        // Use the Solidity binaries from the official CDN
        const solcUrl = `https://binaries.soliditylang.org/bin/soljson-v${version}+commit.25a574f.js`;

        // Import the solc compiler
        importScripts(solcUrl);

        // Initialize solc wrapper
        if (typeof self.Module !== 'undefined') {
            solc = self.Module;
            isInitialized = true;
            console.log('✅ Solidity compiler loaded successfully');
            return true;
        } else {
            throw new Error('Solc module not found after loading');
        }
    } catch (error) {
        console.error('❌ Failed to load Solidity compiler:', error);
        throw error;
    }
}

// Compile Solidity source code
function compile(input) {
    if (!isInitialized || !solc) {
        throw new Error('Compiler not initialized');
    }

    try {
        // Use the solc compile function
        const output = solc.cwrap('solidity_compile', 'string', ['string', 'number'])(input, 0);
        return JSON.parse(output);
    } catch (error) {
        console.error('❌ Compilation error:', error);
        throw error;
    }
}

// Get compiler version
function getVersion() {
    if (!isInitialized || !solc) {
        throw new Error('Compiler not initialized');
    }

    try {
        const version = solc.cwrap('solidity_version', 'string', [])();
        return version;
    } catch (error) {
        console.error('❌ Failed to get version:', error);
        throw error;
    }
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    try {
        switch (type) {
            case 'INIT':
                if (!isInitialized) {
                    await loadSolc(data?.version || '0.8.30');
                }
                self.postMessage({
                    type: 'INIT_RESPONSE',
                    success: true,
                    data: { initialized: isInitialized }
                });
                break;

            case 'COMPILE':
                if (!isInitialized) {
                    await loadSolc();
                }

                const output = compile(data.input);
                self.postMessage({
                    type: 'COMPILE_RESPONSE',
                    success: true,
                    data: { output }
                });
                break;

            case 'GET_VERSION':
                if (!isInitialized) {
                    await loadSolc();
                }

                const version = getVersion();
                self.postMessage({
                    type: 'VERSION_RESPONSE',
                    success: true,
                    version
                });
                break;

            default:
                self.postMessage({
                    type: 'ERROR',
                    success: false,
                    error: `Unknown message type: ${type}`
                });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            success: false,
            error: error.message || 'Unknown error'
        });
    }
});

// Signal that the worker is ready
console.log('🚀 Solidity compiler worker initialized');
