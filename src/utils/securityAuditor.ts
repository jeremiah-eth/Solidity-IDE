/**
 * Security Audit Engine
 * Analyzes Solidity contracts for common vulnerabilities and security issues
 */

export interface SecurityIssue {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: 'reentrancy' | 'access-control' | 'arithmetic' | 'gas' | 'logic' | 'best-practice';
    title: string;
    description: string;
    line?: number;
    code?: string;
    recommendation: string;
    references?: string[];
}

export interface AuditReport {
    contractName: string;
    timestamp: Date;
    issues: SecurityIssue[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    score: number; // 0-100, higher is better
}

/**
 * Perform security audit on Solidity source code
 */
export function auditContract(sourceCode: string, contractName: string): AuditReport {
    const issues: SecurityIssue[] = [];

    // Check for reentrancy vulnerabilities
    issues.push(...checkReentrancy(sourceCode));

    // Check for access control issues
    issues.push(...checkAccessControl(sourceCode));

    // Check for arithmetic issues
    issues.push(...checkArithmetic(sourceCode));

    // Check for gas optimization issues
    issues.push(...checkGasIssues(sourceCode));

    // Check for best practices
    issues.push(...checkBestPractices(sourceCode));

    // Calculate summary
    const summary = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        info: issues.filter(i => i.severity === 'info').length
    };

    // Calculate security score (100 - weighted penalties)
    const score = Math.max(0, 100 - (
        summary.critical * 20 +
        summary.high * 10 +
        summary.medium * 5 +
        summary.low * 2 +
        summary.info * 0.5
    ));

    return {
        contractName,
        timestamp: new Date(),
        issues,
        summary,
        score: Math.round(score)
    };
}

/**
 * Check for reentrancy vulnerabilities
 */
function checkReentrancy(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for external calls before state changes
    const externalCallPattern = /\.call\{|\.transfer\(|\.send\(/g;
    const stateChangePattern = /\w+\s*=\s*[^;]+;/g;

    if (sourceCode.match(externalCallPattern)) {
        // Simple heuristic: if external call appears before state changes in function
        const functions = sourceCode.match(/function\s+\w+[^}]+\}/gs) || [];

        functions.forEach(func => {
            const hasExternalCall = externalCallPattern.test(func);
            const hasStateChange = stateChangePattern.test(func);

            if (hasExternalCall && hasStateChange) {
                const externalCallIndex = func.search(externalCallPattern);
                const stateChangeIndex = func.search(stateChangePattern);

                if (externalCallIndex < stateChangeIndex) {
                    issues.push({
                        id: 'reentrancy-1',
                        severity: 'critical',
                        category: 'reentrancy',
                        title: 'Potential Reentrancy Vulnerability',
                        description: 'External call made before state changes, which could allow reentrancy attacks',
                        recommendation: 'Follow the Checks-Effects-Interactions pattern: update state before making external calls, or use ReentrancyGuard',
                        references: ['https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/']
                    });
                }
            }
        });
    }

    // Check for missing reentrancy guards
    if (sourceCode.includes('.call{') && !sourceCode.includes('nonReentrant')) {
        issues.push({
            id: 'reentrancy-2',
            severity: 'high',
            category: 'reentrancy',
            title: 'Missing Reentrancy Guard',
            description: 'Contract uses low-level calls without reentrancy protection',
            recommendation: 'Consider using OpenZeppelin\'s ReentrancyGuard modifier for functions with external calls',
            references: ['https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard']
        });
    }

    return issues;
}

/**
 * Check for access control issues
 */
function checkAccessControl(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for missing access control on critical functions
    const criticalFunctions = sourceCode.match(/function\s+(withdraw|transfer|mint|burn|pause|unpause|setOwner|destroy|selfdestruct)\s*\([^)]*\)\s*(public|external)/gi);

    if (criticalFunctions) {
        criticalFunctions.forEach(func => {
            if (!func.includes('onlyOwner') && !func.includes('onlyRole') && !func.includes('require(msg.sender')) {
                issues.push({
                    id: 'access-control-1',
                    severity: 'critical',
                    category: 'access-control',
                    title: 'Missing Access Control',
                    description: `Critical function "${func.match(/function\s+(\w+)/)?.[1]}" lacks access control`,
                    recommendation: 'Add access control modifiers (onlyOwner, onlyRole) or require statements to restrict access',
                    references: ['https://docs.openzeppelin.com/contracts/4.x/access-control']
                });
            }
        });
    }

    // Check for tx.origin usage
    if (sourceCode.includes('tx.origin')) {
        issues.push({
            id: 'access-control-2',
            severity: 'high',
            category: 'access-control',
            title: 'Use of tx.origin for Authorization',
            description: 'tx.origin should not be used for authorization as it can be exploited in phishing attacks',
            recommendation: 'Use msg.sender instead of tx.origin for authorization checks',
            references: ['https://consensys.github.io/smart-contract-best-practices/development-recommendations/solidity-specific/tx-origin/']
        });
    }

    return issues;
}

/**
 * Check for arithmetic issues
 */
function checkArithmetic(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check Solidity version for automatic overflow protection
    const versionMatch = sourceCode.match(/pragma solidity\s+[\^~]?(\d+\.\d+)/);
    const version = versionMatch ? parseFloat(versionMatch[1]) : 0;

    if (version < 0.8) {
        // Check for SafeMath usage
        if (!sourceCode.includes('SafeMath') && sourceCode.match(/[\+\-\*\/]/)) {
            issues.push({
                id: 'arithmetic-1',
                severity: 'high',
                category: 'arithmetic',
                title: 'Integer Overflow/Underflow Risk',
                description: 'Solidity < 0.8 does not have built-in overflow protection',
                recommendation: 'Use SafeMath library or upgrade to Solidity 0.8+',
                references: ['https://docs.openzeppelin.com/contracts/2.x/api/math']
            });
        }
    }

    // Check for division before multiplication
    if (sourceCode.match(/\/[^\/\n]*\*/)) {
        issues.push({
            id: 'arithmetic-2',
            severity: 'medium',
            category: 'arithmetic',
            title: 'Division Before Multiplication',
            description: 'Division before multiplication can lead to precision loss',
            recommendation: 'Perform multiplication before division to maintain precision',
            references: []
        });
    }

    return issues;
}

/**
 * Check for gas-related issues
 */
function checkGasIssues(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for unbounded loops
    if (sourceCode.match(/for\s*\([^)]*\)\s*\{[^}]*\}/g)) {
        const loops = sourceCode.match(/for\s*\([^)]*\.length[^)]*\)/g);
        if (loops) {
            issues.push({
                id: 'gas-1',
                severity: 'medium',
                category: 'gas',
                title: 'Unbounded Loop',
                description: 'Loop iterates over dynamic array which could cause out-of-gas errors',
                recommendation: 'Limit array sizes or use pagination patterns to avoid unbounded loops',
                references: []
            });
        }
    }

    // Check for storage in loops
    if (sourceCode.match(/for\s*\([^)]*\)\s*\{[^}]*\w+\[\w+\]\s*=/)) {
        issues.push({
            id: 'gas-2',
            severity: 'high',
            category: 'gas',
            title: 'Storage Write in Loop',
            description: 'Writing to storage in a loop is extremely gas-inefficient',
            recommendation: 'Use memory variables and write to storage once after the loop',
            references: []
        });
    }

    return issues;
}

/**
 * Check for best practices
 */
function checkBestPractices(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for SPDX license
    if (!sourceCode.includes('SPDX-License-Identifier')) {
        issues.push({
            id: 'best-practice-1',
            severity: 'info',
            category: 'best-practice',
            title: 'Missing SPDX License Identifier',
            description: 'Contract should include an SPDX license identifier',
            recommendation: 'Add "// SPDX-License-Identifier: MIT" at the top of the file',
            references: []
        });
    }

    // Check for NatSpec comments
    const functions = sourceCode.match(/function\s+\w+/g) || [];
    const natspecComments = sourceCode.match(/\/\/\/@|\/\*\*\s*\n\s*\*/g) || [];

    if (functions.length > 3 && natspecComments.length === 0) {
        issues.push({
            id: 'best-practice-2',
            severity: 'info',
            category: 'best-practice',
            title: 'Missing NatSpec Documentation',
            description: 'Functions should be documented using NatSpec format',
            recommendation: 'Add NatSpec comments (///@param, ///@return, ///@notice) to document functions',
            references: ['https://docs.soliditylang.org/en/latest/natspec-format.html']
        });
    }

    // Check for events
    const stateChanges = sourceCode.match(/\w+\s*=\s*[^;]+;/g) || [];
    const events = sourceCode.match(/emit\s+\w+/g) || [];

    if (stateChanges.length > 5 && events.length === 0) {
        issues.push({
            id: 'best-practice-3',
            severity: 'low',
            category: 'best-practice',
            title: 'Missing Events',
            description: 'State-changing functions should emit events for off-chain tracking',
            recommendation: 'Define and emit events for important state changes',
            references: []
        });
    }

    return issues;
}
