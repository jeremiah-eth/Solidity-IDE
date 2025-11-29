/**
 * Project Bundler
 * Bundles Solidity projects for sharing via IPFS
 */

import type { ContractFile } from '../types';

export interface ProjectBundle {
    name: string;
    version: string;
    description: string;
    files: ContractFile[];
    metadata: ProjectMetadata;
    timestamp: Date;
}

export interface ProjectMetadata {
    author?: string;
    license?: string;
    compiler: string;
    dependencies?: Record<string, string>;
    networks?: Record<string, NetworkDeployment>;
}

export interface NetworkDeployment {
    chainId: number;
    address: string;
    transactionHash: string;
    blockNumber: number;
}

export interface ShareableLink {
    cid: string;
    url: string;
    gateway: string;
}

/**
 * Bundle project files for sharing
 */
export function bundleProject(
    files: ContractFile[],
    name: string,
    metadata?: Partial<ProjectMetadata>
): ProjectBundle {
    return {
        name,
        version: '1.0.0',
        description: `Solidity project: ${name}`,
        files,
        metadata: {
            compiler: '0.8.30',
            license: 'MIT',
            ...metadata
        },
        timestamp: new Date()
    };
}

/**
 * Upload project bundle to IPFS (mock implementation)
 * In production, integrate with Pinata, Infura, or web3.storage
 */
export async function uploadToIPFS(bundle: ProjectBundle): Promise<ShareableLink> {
    // Mock implementation - in production, use actual IPFS service
    const bundleJson = JSON.stringify(bundle, null, 2);

    // Simulate IPFS upload
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    return {
        cid: mockCid,
        url: `ipfs://${mockCid}`,
        gateway: `https://ipfs.io/ipfs/${mockCid}`
    };
}

/**
 * Load project from IPFS CID (mock implementation)
 */
export async function loadFromIPFS(cid: string): Promise<ProjectBundle> {
    // Mock implementation - in production, fetch from IPFS gateway

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock project
    return {
        name: 'Shared Project',
        version: '1.0.0',
        description: 'Project loaded from IPFS',
        files: [
            {
                name: 'Contract.sol',
                content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract SharedContract {\n    // Contract code\n}',
                path: '/Contract.sol'
            }
        ],
        metadata: {
            compiler: '0.8.30',
            license: 'MIT'
        },
        timestamp: new Date()
    };
}

/**
 * Generate shareable link for project
 */
export function generateShareLink(cid: string, gateway: string = 'https://ipfs.io'): string {
    return `${gateway}/ipfs/${cid}`;
}

/**
 * Export project as JSON
 */
export function exportProjectJSON(bundle: ProjectBundle): string {
    return JSON.stringify(bundle, null, 2);
}

/**
 * Import project from JSON
 */
export function importProjectJSON(json: string): ProjectBundle {
    const bundle = JSON.parse(json);

    // Validate bundle structure
    if (!bundle.name || !bundle.files || !Array.isArray(bundle.files)) {
        throw new Error('Invalid project bundle format');
    }

    return bundle;
}

/**
 * Create project archive (ZIP-like structure)
 */
export function createProjectArchive(bundle: ProjectBundle): Blob {
    const archiveData = {
        ...bundle,
        files: bundle.files.map(file => ({
            name: file.name,
            path: file.path,
            content: file.content
        }))
    };

    const json = JSON.stringify(archiveData, null, 2);
    return new Blob([json], { type: 'application/json' });
}

/**
 * Download project bundle as file
 */
export function downloadProjectBundle(bundle: ProjectBundle, filename?: string): void {
    const blob = createProjectArchive(bundle);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${bundle.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
