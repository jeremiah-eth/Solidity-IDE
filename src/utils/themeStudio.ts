/**
 * Theme Studio
 * Customizable themes for the IDE
 */

export interface Theme {
    id: string;
    name: string;
    description: string;
    colors: ThemeColors;
    isCustom: boolean;
}

export interface ThemeColors {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Accent colors
    primary: string;
    secondary: string;
    accent: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Border colors
    border: string;
    borderLight: string;
    borderDark: string;

    // Editor colors
    editorBackground: string;
    editorText: string;
    editorSelection: string;
    editorLineNumber: string;
}

/**
 * Built-in themes
 */
export const builtInThemes: Theme[] = [
    {
        id: 'dark-default',
        name: 'Dark (Default)',
        description: 'Classic dark theme with blue accents',
        isCustom: false,
        colors: {
            background: '#0f172a',
            backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
            textPrimary: '#f1f5f9',
            textSecondary: '#cbd5e1',
            textMuted: '#94a3b8',
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            border: '#475569',
            borderLight: '#64748b',
            borderDark: '#334155',
            editorBackground: '#1e293b',
            editorText: '#e2e8f0',
            editorSelection: '#3b82f620',
            editorLineNumber: '#64748b'
        }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon-inspired theme with vibrant colors',
        isCustom: false,
        colors: {
            background: '#0a0e27',
            backgroundSecondary: '#141937',
            backgroundTertiary: '#1e2749',
            textPrimary: '#00ff9f',
            textSecondary: '#00d4ff',
            textMuted: '#7c8db5',
            primary: '#ff006e',
            secondary: '#8338ec',
            accent: '#00f5ff',
            success: '#00ff9f',
            warning: '#ffbe0b',
            error: '#ff006e',
            info: '#00d4ff',
            border: '#3a4d8f',
            borderLight: '#4a5d9f',
            borderDark: '#2a3d7f',
            editorBackground: '#0f1429',
            editorText: '#00ff9f',
            editorSelection: '#ff006e20',
            editorLineNumber: '#4a5d9f'
        }
    },
    {
        id: 'forest',
        name: 'Forest',
        description: 'Nature-inspired green theme',
        isCustom: false,
        colors: {
            background: '#0d1b0f',
            backgroundSecondary: '#1a2e1f',
            backgroundTertiary: '#2d4a35',
            textPrimary: '#e8f5e9',
            textSecondary: '#c8e6c9',
            textMuted: '#81c784',
            primary: '#4caf50',
            secondary: '#66bb6a',
            accent: '#8bc34a',
            success: '#4caf50',
            warning: '#ffc107',
            error: '#f44336',
            info: '#2196f3',
            border: '#388e3c',
            borderLight: '#4caf50',
            borderDark: '#2e7d32',
            editorBackground: '#1a2e1f',
            editorText: '#c8e6c9',
            editorSelection: '#4caf5020',
            editorLineNumber: '#66bb6a'
        }
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Deep blue ocean-inspired theme',
        isCustom: false,
        colors: {
            background: '#0a1929',
            backgroundSecondary: '#132f4c',
            backgroundTertiary: '#1e4976',
            textPrimary: '#e3f2fd',
            textSecondary: '#bbdefb',
            textMuted: '#90caf9',
            primary: '#2196f3',
            secondary: '#03a9f4',
            accent: '#00bcd4',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3',
            border: '#1976d2',
            borderLight: '#2196f3',
            borderDark: '#1565c0',
            editorBackground: '#0d2137',
            editorText: '#bbdefb',
            editorSelection: '#2196f320',
            editorLineNumber: '#42a5f5'
        }
    }
];

/**
 * Get all themes (built-in + custom)
 */
export function getAllThemes(): Theme[] {
    const customThemes = loadCustomThemes();
    return [...builtInThemes, ...customThemes];
}

/**
 * Get theme by ID
 */
export function getTheme(id: string): Theme | undefined {
    return getAllThemes().find(t => t.id === id);
}

/**
 * Save custom theme
 */
export function saveCustomTheme(theme: Theme): void {
    const customThemes = loadCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);

    if (existingIndex >= 0) {
        customThemes[existingIndex] = theme;
    } else {
        customThemes.push(theme);
    }

    localStorage.setItem('custom_themes', JSON.stringify(customThemes));
}

/**
 * Load custom themes from localStorage
 */
export function loadCustomThemes(): Theme[] {
    const data = localStorage.getItem('custom_themes');
    return data ? JSON.parse(data) : [];
}

/**
 * Delete custom theme
 */
export function deleteCustomTheme(id: string): void {
    const customThemes = loadCustomThemes();
    const filtered = customThemes.filter(t => t.id !== id);
    localStorage.setItem('custom_themes', JSON.stringify(filtered));
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.backgroundTertiary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-border-dark', theme.colors.borderDark);

    // Save current theme
    localStorage.setItem('current_theme', theme.id);
}

/**
 * Get current theme ID
 */
export function getCurrentThemeId(): string {
    return localStorage.getItem('current_theme') || 'dark-default';
}
id: 'dark-default',
    name: 'Dark (Default)',
        description: 'Classic dark theme with blue accents',
            isCustom: false,
                colors: {
    background: '#0f172a',
        backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
                textPrimary: '#f1f5f9',
                    textSecondary: '#cbd5e1',
                        textMuted: '#94a3b8',
                            primary: '#3b82f6',
                                secondary: '#8b5cf6',
                                    accent: '#06b6d4',
                                        success: '#10b981',
                                            warning: '#f59e0b',
                                                error: '#ef4444',
                                                    info: '#3b82f6',
                                                        border: '#475569',
                                                            borderLight: '#64748b',
                                                                borderDark: '#334155',
                                                                    editorBackground: '#1e293b',
                                                                        editorText: '#e2e8f0',
                                                                            editorSelection: '#3b82f620',
                                                                                editorLineNumber: '#64748b'
}
    },
{
    id: 'cyberpunk',
        name: 'Cyberpunk',
            description: 'Neon-inspired theme with vibrant colors',
                isCustom: false,
                    colors: {
        background: '#0a0e27',
            backgroundSecondary: '#141937',
                backgroundTertiary: '#1e2749',
                    textPrimary: '#00ff9f',
                        textSecondary: '#00d4ff',
                            textMuted: '#7c8db5',
                                primary: '#ff006e',
                                    secondary: '#8338ec',
                                        accent: '#00f5ff',
                                            success: '#00ff9f',
                                                warning: '#ffbe0b',
                                                    error: '#ff006e',
                                                        info: '#00d4ff',
                                                            border: '#3a4d8f',
                                                                borderLight: '#4a5d9f',
                                                                    borderDark: '#2a3d7f',
                                                                        editorBackground: '#0f1429',
                                                                            editorText: '#00ff9f',
                                                                                editorSelection: '#ff006e20',
                                                                                    editorLineNumber: '#4a5d9f'
    }
},
{
    id: 'forest',
        name: 'Forest',
            description: 'Nature-inspired green theme',
                isCustom: false,
                    colors: {
        background: '#0d1b0f',
            backgroundSecondary: '#1a2e1f',
                backgroundTertiary: '#2d4a35',
                    textPrimary: '#e8f5e9',
                        textSecondary: '#c8e6c9',
                            textMuted: '#81c784',
                                primary: '#4caf50',
                                    secondary: '#66bb6a',
                                        accent: '#8bc34a',
                                            success: '#4caf50',
                                                warning: '#ffc107',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#388e3c',
                                                                borderLight: '#4caf50',
                                                                    borderDark: '#2e7d32',
                                                                        editorBackground: '#1a2e1f',
                                                                            editorText: '#c8e6c9',
                                                                                editorSelection: '#4caf5020',
                                                                                    editorLineNumber: '#66bb6a'
    }
},
{
    id: 'ocean',
        name: 'Ocean',
            description: 'Deep blue ocean-inspired theme',
                isCustom: false,
                    colors: {
        background: '#0a1929',
            backgroundSecondary: '#132f4c',
                backgroundTertiary: '#1e4976',
                    textPrimary: '#e3f2fd',
                        textSecondary: '#bbdefb',
                            textMuted: '#90caf9',
                                primary: '#2196f3',
                                    secondary: '#03a9f4',
                                        accent: '#00bcd4',
                                            success: '#4caf50',
                                                warning: '#ff9800',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#1976d2',
                                                                borderLight: '#2196f3',
                                                                    borderDark: '#1565c0',
                                                                        editorBackground: '#0d2137',
                                                                            editorText: '#bbdefb',
                                                                                editorSelection: '#2196f320',
                                                                                    editorLineNumber: '#42a5f5'
    }
}
];

/**
 * Get all themes (built-in + custom)
 */
export function getAllThemes(): Theme[] {
    const customThemes = loadCustomThemes();
    return [...builtInThemes, ...customThemes];
}

/**
 * Get theme by ID
 */
export function getTheme(id: string): Theme | undefined {
    return getAllThemes().find(t => t.id === id);
}

/**
 * Save custom theme
 */
export function saveCustomTheme(theme: Theme): void {
    const customThemes = loadCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);

    if (existingIndex >= 0) {
        customThemes[existingIndex] = theme;
    } else {
        customThemes.push(theme);
    }

    localStorage.setItem('custom_themes', JSON.stringify(customThemes));
}

/**
 * Load custom themes from localStorage
 */
export function loadCustomThemes(): Theme[] {
    const data = localStorage.getItem('custom_themes');
    return data ? JSON.parse(data) : [];
}

/**
 * Delete custom theme
 */
export function deleteCustomTheme(id: string): void {
    const customThemes = loadCustomThemes();
    const filtered = customThemes.filter(t => t.id !== id);
    localStorage.setItem('custom_themes', JSON.stringify(filtered));
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.backgroundTertiary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-border-dark', theme.colors.borderDark);

    // Save current theme
    localStorage.setItem('current_theme', theme.id);
}

/**
 * Get current theme ID
 */
export function getCurrentThemeId(): string {
    return localStorage.getItem('current_theme') || 'dark-default';
}
id: 'dark-default',
    name: 'Dark (Default)',
        description: 'Classic dark theme with blue accents',
            isCustom: false,
                colors: {
    background: '#0f172a',
        backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
                textPrimary: '#f1f5f9',
                    textSecondary: '#cbd5e1',
                        textMuted: '#94a3b8',
                            primary: '#3b82f6',
                                secondary: '#8b5cf6',
                                    accent: '#06b6d4',
                                        success: '#10b981',
                                            warning: '#f59e0b',
                                                error: '#ef4444',
                                                    info: '#3b82f6',
                                                        border: '#475569',
                                                            borderLight: '#64748b',
                                                                borderDark: '#334155',
                                                                    editorBackground: '#1e293b',
                                                                        editorText: '#e2e8f0',
                                                                            editorSelection: '#3b82f620',
                                                                                editorLineNumber: '#64748b'
}
    },
{
    id: 'cyberpunk',
        name: 'Cyberpunk',
            description: 'Neon-inspired theme with vibrant colors',
                isCustom: false,
                    colors: {
        background: '#0a0e27',
            backgroundSecondary: '#141937',
                backgroundTertiary: '#1e2749',
                    textPrimary: '#00ff9f',
                        textSecondary: '#00d4ff',
                            textMuted: '#7c8db5',
                                primary: '#ff006e',
                                    secondary: '#8338ec',
                                        accent: '#00f5ff',
                                            success: '#00ff9f',
                                                warning: '#ffbe0b',
                                                    error: '#ff006e',
                                                        info: '#00d4ff',
                                                            border: '#3a4d8f',
                                                                borderLight: '#4a5d9f',
                                                                    borderDark: '#2a3d7f',
                                                                        editorBackground: '#0f1429',
                                                                            editorText: '#00ff9f',
                                                                                editorSelection: '#ff006e20',
                                                                                    editorLineNumber: '#4a5d9f'
    }
},
{
    id: 'forest',
        name: 'Forest',
            description: 'Nature-inspired green theme',
                isCustom: false,
                    colors: {
        background: '#0d1b0f',
            backgroundSecondary: '#1a2e1f',
                backgroundTertiary: '#2d4a35',
                    textPrimary: '#e8f5e9',
                        textSecondary: '#c8e6c9',
                            textMuted: '#81c784',
                                primary: '#4caf50',
                                    secondary: '#66bb6a',
                                        accent: '#8bc34a',
                                            success: '#4caf50',
                                                warning: '#ffc107',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#388e3c',
                                                                borderLight: '#4caf50',
                                                                    borderDark: '#2e7d32',
                                                                        editorBackground: '#1a2e1f',
                                                                            editorText: '#c8e6c9',
                                                                                editorSelection: '#4caf5020',
                                                                                    editorLineNumber: '#66bb6a'
    }
},
{
    id: 'ocean',
        name: 'Ocean',
            description: 'Deep blue ocean-inspired theme',
                isCustom: false,
                    colors: {
        background: '#0a1929',
            backgroundSecondary: '#132f4c',
                backgroundTertiary: '#1e4976',
                    textPrimary: '#e3f2fd',
                        textSecondary: '#bbdefb',
                            textMuted: '#90caf9',
                                primary: '#2196f3',
                                    secondary: '#03a9f4',
                                        accent: '#00bcd4',
                                            success: '#4caf50',
                                                warning: '#ff9800',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#1976d2',
                                                                borderLight: '#2196f3',
                                                                    borderDark: '#1565c0',
                                                                        editorBackground: '#0d2137',
                                                                            editorText: '#bbdefb',
                                                                                editorSelection: '#2196f320',
                                                                                    editorLineNumber: '#42a5f5'
    }
}
];

/**
 * Get all themes (built-in + custom)
 */
export function getAllThemes(): Theme[] {
    const customThemes = loadCustomThemes();
    return [...builtInThemes, ...customThemes];
}

/**
 * Get theme by ID
 */
export function getTheme(id: string): Theme | undefined {
    return getAllThemes().find(t => t.id === id);
}

/**
 * Save custom theme
 */
export function saveCustomTheme(theme: Theme): void {
    const customThemes = loadCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);

    if (existingIndex >= 0) {
        customThemes[existingIndex] = theme;
    } else {
        customThemes.push(theme);
    }

    localStorage.setItem('custom_themes', JSON.stringify(customThemes));
}

/**
 * Load custom themes from localStorage
 */
export function loadCustomThemes(): Theme[] {
    const data = localStorage.getItem('custom_themes');
    return data ? JSON.parse(data) : [];
}

/**
 * Delete custom theme
 */
export function deleteCustomTheme(id: string): void {
    const customThemes = loadCustomThemes();
    const filtered = customThemes.filter(t => t.id !== id);
    localStorage.setItem('custom_themes', JSON.stringify(filtered));
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.backgroundTertiary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-border-dark', theme.colors.borderDark);

    // Save current theme
    localStorage.setItem('current_theme', theme.id);
}

/**
 * Get current theme ID
 */
export function getCurrentThemeId(): string {
    return localStorage.getItem('current_theme') || 'dark-default';
}
id: 'dark-default',
    name: 'Dark (Default)',
        description: 'Classic dark theme with blue accents',
            isCustom: false,
                colors: {
    background: '#0f172a',
        backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
                textPrimary: '#f1f5f9',
                    textSecondary: '#cbd5e1',
                        textMuted: '#94a3b8',
                            primary: '#3b82f6',
                                secondary: '#8b5cf6',
                                    accent: '#06b6d4',
                                        success: '#10b981',
                                            warning: '#f59e0b',
                                                error: '#ef4444',
                                                    info: '#3b82f6',
                                                        border: '#475569',
                                                            borderLight: '#64748b',
                                                                borderDark: '#334155',
                                                                    editorBackground: '#1e293b',
                                                                        editorText: '#e2e8f0',
                                                                            editorSelection: '#3b82f620',
                                                                                editorLineNumber: '#64748b'
}
    },
{
    id: 'cyberpunk',
        name: 'Cyberpunk',
            description: 'Neon-inspired theme with vibrant colors',
                isCustom: false,
                    colors: {
        background: '#0a0e27',
            backgroundSecondary: '#141937',
                backgroundTertiary: '#1e2749',
                    textPrimary: '#00ff9f',
                        textSecondary: '#00d4ff',
                            textMuted: '#7c8db5',
                                primary: '#ff006e',
                                    secondary: '#8338ec',
                                        accent: '#00f5ff',
                                            success: '#00ff9f',
                                                warning: '#ffbe0b',
                                                    error: '#ff006e',
                                                        info: '#00d4ff',
                                                            border: '#3a4d8f',
                                                                borderLight: '#4a5d9f',
                                                                    borderDark: '#2a3d7f',
                                                                        editorBackground: '#0f1429',
                                                                            editorText: '#00ff9f',
                                                                                editorSelection: '#ff006e20',
                                                                                    editorLineNumber: '#4a5d9f'
    }
},
{
    id: 'forest',
        name: 'Forest',
            description: 'Nature-inspired green theme',
                isCustom: false,
                    colors: {
        background: '#0d1b0f',
            backgroundSecondary: '#1a2e1f',
                backgroundTertiary: '#2d4a35',
                    textPrimary: '#e8f5e9',
                        textSecondary: '#c8e6c9',
                            textMuted: '#81c784',
                                primary: '#4caf50',
                                    secondary: '#66bb6a',
                                        accent: '#8bc34a',
                                            success: '#4caf50',
                                                warning: '#ffc107',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#388e3c',
                                                                borderLight: '#4caf50',
                                                                    borderDark: '#2e7d32',
                                                                        editorBackground: '#1a2e1f',
                                                                            editorText: '#c8e6c9',
                                                                                editorSelection: '#4caf5020',
                                                                                    editorLineNumber: '#66bb6a'
    }
},
{
    id: 'ocean',
        name: 'Ocean',
            description: 'Deep blue ocean-inspired theme',
                isCustom: false,
                    colors: {
        background: '#0a1929',
            backgroundSecondary: '#132f4c',
                backgroundTertiary: '#1e4976',
                    textPrimary: '#e3f2fd',
                        textSecondary: '#bbdefb',
                            textMuted: '#90caf9',
                                primary: '#2196f3',
                                    secondary: '#03a9f4',
                                        accent: '#00bcd4',
                                            success: '#4caf50',
                                                warning: '#ff9800',
                                                    error: '#f44336',
                                                        info: '#2196f3',
                                                            border: '#1976d2',
                                                                borderLight: '#2196f3',
                                                                    borderDark: '#1565c0',
                                                                        editorBackground: '#0d2137',
                                                                            editorText: '#bbdefb',
                                                                                editorSelection: '#2196f320',
                                                                                    editorLineNumber: '#42a5f5'
    }
}
];

/**
 * Get all themes (built-in + custom)
 */
export function getAllThemes(): Theme[] {
    const customThemes = loadCustomThemes();
    return [...builtInThemes, ...customThemes];
}

/**
 * Get theme by ID
 */
export function getTheme(id: string): Theme | undefined {
    return getAllThemes().find(t => t.id === id);
}

/**
 * Save custom theme
 */
export function saveCustomTheme(theme: Theme): void {
    const customThemes = loadCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);

    if (existingIndex >= 0) {
        customThemes[existingIndex] = theme;
    } else {
        customThemes.push(theme);
    }

    localStorage.setItem('custom_themes', JSON.stringify(customThemes));
}

/**
 * Load custom themes from localStorage
 */
export function loadCustomThemes(): Theme[] {
    const data = localStorage.getItem('custom_themes');
    return data ? JSON.parse(data) : [];
}

/**
 * Delete custom theme
 */
export function deleteCustomTheme(id: string): void {
    const customThemes = loadCustomThemes();
    const filtered = customThemes.filter(t => t.id !== id);
    localStorage.setItem('custom_themes', JSON.stringify(filtered));
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.backgroundTertiary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-border-dark', theme.colors.borderDark);

    // Save current theme
    localStorage.setItem('current_theme', theme.id);
}

/**
 * Get current theme ID
 */
export function getCurrentThemeId(): string {
    return localStorage.getItem('current_theme') || 'dark-default';
}

/**
 * Create custom theme from base
 */
export function createCustomTheme(name: string, baseThemeId: string): Theme {
    const baseTheme = getTheme(baseThemeId) ?? builtInThemes[0];

    return {
        id: `custom-${Date.now()}`,
        name,
        description: `Custom theme based on ${baseTheme.name}`,
        isCustom: true,
        colors: { ...baseTheme.colors }
    };
}
