import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react'; // using lucide icons already in dependencies

export const DarkModeToggle: React.FC = () => {
    const { isDark, toggle } = useDarkMode();

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: 'var(--color-text)',
            }}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};
