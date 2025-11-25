import { useEffect, useState } from 'react';

/**
 * Hook to manage dark mode theme.
 * It reads the preferred theme from localStorage (key: 'theme'),
 * falls back to the system preference, and updates the `data-theme`
 * attribute on the <html> element.
 */
export function useDarkMode() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // Check localStorage first
        const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        if (stored) {
            return stored === 'dark';
        }
        // Fallback to system preference
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply the theme to the document root whenever it changes
    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        // Persist the choice
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);

    return { isDark, toggle };
}
