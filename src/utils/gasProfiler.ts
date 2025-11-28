/**
 * Gas Profiler & Optimizer
 * Analyzes Solidity contracts for gas usage and provides optimization suggestions
 */

export interface GasAnalysis {
    totalGas: number;
    functionGasEstimates: FunctionGasEstimate[];
    optimizationSuggestions: OptimizationSuggestion[];
    storageAnalysis: StorageAnalysis;
}

export interface FunctionGasEstimate {
    name: string;
    estimatedGas: number;
    complexity: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
    type: 'storage' | 'computation' | 'memory' | 'pattern';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    lineNumber?: number;
    suggestion: string;
    potentialSavings: string;
}

export interface StorageAnalysis {
    totalSlots: number;
    wastedSlots: number;
    packingOpportunities: string[];
}

/**
 * Analyze contract for gas optimization opportunities
 */
export function analyzeGasUsage(sourceCode: string, abi: any[], bytecode: string): GasAnalysis {
    const functionGasEstimates = estimateFunctionGas(abi, bytecode);
    const optimizationSuggestions = generateOptimizationSuggestions(sourceCode);
    const storageAnalysis = analyzeStorage(sourceCode);

    const totalGas = functionGasEstimates.reduce((sum, f) => sum + f.estimatedGas, 0);

    return {
        totalGas,
        functionGasEstimates,
        optimizationSuggestions,
        storageAnalysis
    };
}

/**
 * Estimate gas usage for each function
 */
function estimateFunctionGas(abi: any[], bytecode: string): FunctionGasEstimate[] {
    const estimates: FunctionGasEstimate[] = [];

    abi.forEach(item => {
        if (item.type === 'function') {
            // Simple heuristic based on function signature and bytecode length
            const baseGas = 21000; // Base transaction cost
            const bytecodeLength = bytecode.length / 2; // Convert hex to bytes
            const estimatedGas = baseGas + (bytecodeLength * 10); // Rough estimate

            let complexity: 'low' | 'medium' | 'high' = 'low';
            if (estimatedGas > 100000) complexity = 'high';
            else if (estimatedGas > 50000) complexity = 'medium';

            estimates.push({
                name: item.name,
                estimatedGas,
                complexity
            });
        }
    });

    return estimates;
}

/**
 * Generate optimization suggestions based on source code analysis
 */
function generateOptimizationSuggestions(sourceCode: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for uint256 vs smaller uints
    if (sourceCode.includes('uint256') && !sourceCode.includes('pragma solidity ^0.8')) {
        suggestions.push({
            type: 'storage',
            severity: 'medium',
            title: 'Use smaller uint types when possible',
            description: 'uint256 uses more gas than smaller types like uint128 or uint64',
            suggestion: 'Consider using smaller uint types (uint128, uint64, uint32) when values fit within their range. Pack multiple smaller uints into a single storage slot.',
            potentialSavings: '~20,000 gas per storage slot saved'
        });
    }

    // Check for public vs external
    const publicFunctions = (sourceCode.match(/function\s+\w+\s*\([^)]*\)\s+public/g) || []).length;
    if (publicFunctions > 0) {
        suggestions.push({
            type: 'computation',
            severity: 'low',
            title: 'Use external instead of public for functions',
            description: 'External functions are cheaper than public functions when called externally',
            suggestion: 'Change public functions to external if they are not called internally. External functions save gas by not copying calldata to memory.',
            potentialSavings: '~200-500 gas per function call'
        });
    }

    // Check for storage reads in loops
    if (sourceCode.match(/for\s*\([^)]*\)\s*\{[^}]*\.\w+/)) {
        suggestions.push({
            type: 'storage',
            severity: 'high',
            title: 'Cache storage variables in loops',
            description: 'Reading from storage in loops is expensive',
            suggestion: 'Cache storage variables in memory before the loop to avoid repeated SLOAD operations.',
            potentialSavings: '~2,100 gas per SLOAD avoided'
        });
    }

    // Check for string usage
    if (sourceCode.includes('string')) {
        suggestions.push({
            type: 'storage',
            severity: 'medium',
            title: 'Consider using bytes32 instead of string',
            description: 'bytes32 is more gas-efficient than string for fixed-length data',
            suggestion: 'If your strings are short and fixed-length, use bytes32 instead. For variable-length strings, consider using bytes.',
            potentialSavings: '~5,000-10,000 gas per string operation'
        });
    }

    // Check for unchecked arithmetic
    if (!sourceCode.includes('unchecked') && sourceCode.match(/\+\+|\-\-|[\+\-\*\/]/)) {
        suggestions.push({
            type: 'computation',
            severity: 'medium',
            title: 'Use unchecked for safe arithmetic',
            description: 'Solidity 0.8+ adds overflow checks by default',
            suggestion: 'Wrap safe arithmetic operations in unchecked {} blocks to save gas. Only do this when overflow is impossible (e.g., loop counters).',
            potentialSavings: '~20-40 gas per operation'
        });
    }

    // Check for constant/immutable
    const stateVars = sourceCode.match(/\n\s*(uint|int|address|bool)\s+\w+\s*=/g) || [];
    if (stateVars.length > 0 && !sourceCode.includes('constant') && !sourceCode.includes('immutable')) {
        suggestions.push({
            type: 'storage',
            severity: 'high',
            title: 'Use constant or immutable for unchanging variables',
            description: 'Variables that never change should be marked as constant or immutable',
            suggestion: 'Mark variables that are set once and never change as constant (for compile-time values) or immutable (for constructor-set values).',
            potentialSavings: '~20,000 gas per variable'
        });
    }

    return suggestions;
}

/**
 * Analyze storage layout for optimization opportunities
 */
function analyzeStorage(sourceCode: string): StorageAnalysis {
    // Simple analysis - count state variables
    const stateVars = sourceCode.match(/\n\s*(uint\d*|int\d*|address|bool|bytes\d*)\s+\w+/g) || [];
    const totalSlots = stateVars.length; // Simplified - actual packing is more complex

    // Check for packing opportunities
    const packingOpportunities: string[] = [];
    const uint256Count = (sourceCode.match(/uint256/g) || []).length;
    const smallerUintCount = (sourceCode.match(/uint(8|16|32|64|128)/g) || []).length;

    if (smallerUintCount >= 2) {
        packingOpportunities.push('Multiple smaller uint types can be packed into single storage slots');
    }

    if (sourceCode.includes('bool') && sourceCode.includes('address')) {
        packingOpportunities.push('bool and address can be packed together (address uses 20 bytes, bool uses 1 byte)');
    }

    const wastedSlots = Math.max(0, Math.floor(smallerUintCount / 2)); // Rough estimate

    return {
        totalSlots,
        wastedSlots,
        packingOpportunities
    };
}

/**
 * Calculate potential gas savings from implementing all suggestions
 */
export function calculatePotentialSavings(analysis: GasAnalysis): number {
    // This is a simplified calculation
    const savingsMap: Record<string, number> = {
        storage: 20000,
        computation: 500,
        memory: 1000,
        pattern: 5000
    };

    return analysis.optimizationSuggestions.reduce((total, suggestion) => {
        return total + (savingsMap[suggestion.type] || 0);
    }, 0);
}
