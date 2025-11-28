/**
 * Contract Graph Generator
 * Analyzes Solidity source code and generates Mermaid diagram syntax
 */

export interface ContractNode {
    name: string;
    type: 'contract' | 'interface' | 'library';
    functions: FunctionNode[];
    stateVariables: StateVariable[];
    events: EventNode[];
    modifiers: ModifierNode[];
    inherits: string[];
}

export interface FunctionNode {
    name: string;
    visibility: 'public' | 'private' | 'internal' | 'external';
    stateMutability: 'pure' | 'view' | 'payable' | 'nonpayable';
    parameters: string[];
    returns: string[];
}

export interface StateVariable {
    name: string;
    type: string;
    visibility: 'public' | 'private' | 'internal';
}

export interface EventNode {
    name: string;
    parameters: string[];
}

export interface ModifierNode {
    name: string;
    parameters: string[];
}

/**
 * Parse Solidity source code and extract contract structure
 */
export function parseContract(sourceCode: string): ContractNode[] {
    const contracts: ContractNode[] = [];

    // Simple regex-based parser (can be enhanced with proper AST parsing)
    const contractRegex = /(contract|interface|library)\s+(\w+)(?:\s+is\s+([\w\s,]+))?\s*\{/g;
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*(public|private|internal|external)?\s*(pure|view|payable)?\s*(?:returns\s*\([^)]*\))?/g;
    const stateVarRegex = /(uint256|uint|int|address|bool|string|bytes\d*)\s+(public|private|internal)?\s+(\w+)/g;
    const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;
    const modifierRegex = /modifier\s+(\w+)\s*\(([^)]*)\)/g;

    let match;
    while ((match = contractRegex.exec(sourceCode)) !== null) {
        const type = match[1] as 'contract' | 'interface' | 'library';
        const name = match[2];
        const inherits = match[3] ? match[3].split(',').map(s => s.trim()) : [];

        const contract: ContractNode = {
            name,
            type,
            functions: [],
            stateVariables: [],
            events: [],
            modifiers: [],
            inherits
        };

        // Extract contract body
        const startIndex = match.index + match[0].length;
        let braceCount = 1;
        let endIndex = startIndex;

        for (let i = startIndex; i < sourceCode.length && braceCount > 0; i++) {
            if (sourceCode[i] === '{') braceCount++;
            if (sourceCode[i] === '}') braceCount--;
            endIndex = i;
        }

        const contractBody = sourceCode.substring(startIndex, endIndex);

        // Parse functions
        let funcMatch;
        while ((funcMatch = functionRegex.exec(contractBody)) !== null) {
            contract.functions.push({
                name: funcMatch[1],
                visibility: (funcMatch[2] as any) || 'public',
                stateMutability: (funcMatch[3] as any) || 'nonpayable',
                parameters: [],
                returns: []
            });
        }

        // Parse state variables
        let varMatch;
        while ((varMatch = stateVarRegex.exec(contractBody)) !== null) {
            contract.stateVariables.push({
                name: varMatch[3],
                type: varMatch[1],
                visibility: (varMatch[2] as any) || 'internal'
            });
        }

        // Parse events
        let eventMatch;
        while ((eventMatch = eventRegex.exec(contractBody)) !== null) {
            contract.events.push({
                name: eventMatch[1],
                parameters: eventMatch[2] ? eventMatch[2].split(',').map(s => s.trim()) : []
            });
        }

        // Parse modifiers
        let modMatch;
        while ((modMatch = modifierRegex.exec(contractBody)) !== null) {
            contract.modifiers.push({
                name: modMatch[1],
                parameters: modMatch[2] ? modMatch[2].split(',').map(s => s.trim()) : []
            });
        }

        contracts.push(contract);
    }

    return contracts;
}

/**
 * Generate Mermaid class diagram from contract nodes
 */
export function generateMermaidDiagram(contracts: ContractNode[]): string {
    let diagram = 'classDiagram\n';

    // Define classes
    contracts.forEach(contract => {
        diagram += `  class ${contract.name} {\n`;

        // Add state variables
        contract.stateVariables.forEach(v => {
            const visibility = v.visibility === 'public' ? '+' : v.visibility === 'private' ? '-' : '#';
            diagram += `    ${visibility}${v.type} ${v.name}\n`;
        });

        // Add functions
        contract.functions.forEach(f => {
            const visibility = f.visibility === 'public' ? '+' : f.visibility === 'private' ? '-' : f.visibility === 'external' ? '+' : '#';
            diagram += `    ${visibility}${f.name}()\n`;
        });

        diagram += `  }\n`;

        // Add inheritance relationships
        contract.inherits.forEach(parent => {
            diagram += `  ${parent} <|-- ${contract.name}\n`;
        });
    });

    return diagram;
}

/**
 * Generate contract dependency graph
 */
export function generateDependencyGraph(sourceCode: string): string {
    const contracts = parseContract(sourceCode);
    return generateMermaidDiagram(contracts);
}
