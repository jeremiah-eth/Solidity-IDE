import { compileContract } from './compiler';

// Simple test contract
const TEST_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract SimpleStorage {
    uint256 public storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`;

// Debounce mechanism to prevent multiple simultaneous calls
let isTesting = false;
let testTimeout: NodeJS.Timeout | null = null;

export async function testCompilation() {
    // Prevent multiple simultaneous calls
    if (isTesting) {
        console.log('⏳ Test already running, please wait...');
        return false;
    }

    // Clear any pending timeout
    if (testTimeout) {
        clearTimeout(testTimeout);
    }

    // Set testing flag
    isTesting = true;

    try {
        console.log('🧪 Testing Solidity Compiler...');
        console.log('================================');
        
        console.log('📝 Compiling SimpleStorage contract...');
        
        const result = await compileContract(TEST_CONTRACT, 'SimpleStorage');
        
        console.log('✅ Compilation completed!');
        console.log('📊 Results:');
        console.log('  - Contract Name:', result.contractName);
        console.log('  - ABI Length:', result.abi?.length || 0);
        console.log('  - Bytecode Length:', result.bytecode?.length || 0);
        console.log('  - Errors:', result.errors?.length || 0);
        console.log('  - Warnings:', result.warnings?.length || 0);
        
        if (result.errors && result.errors.length > 0) {
            console.error('❌ Compilation Errors:');
            result.errors.forEach(err => console.error('  -', err.message));
            return false;
        }
        
        if (result.warnings && result.warnings.length > 0) {
            console.warn('⚠️ Compilation Warnings:');
            result.warnings.forEach(warn => console.warn('  -', warn.message));
        }
        
        if (result.abi && result.bytecode) {
            console.log('✅ Compiler test PASSED!');
            console.log('🎉 You can now use the compiler in your app!');
            return true;
        } else {
            console.error('❌ Compiler test FAILED: Missing ABI or bytecode');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Compiler test FAILED with error:', error);
        return false;
    } finally {
        // Reset testing flag after a delay
        testTimeout = setTimeout(() => {
            isTesting = false;
            testTimeout = null;
        }, 1000); // 1 second cooldown
    }
}
