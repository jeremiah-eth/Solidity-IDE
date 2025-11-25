import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('useDarkMode', () => {
    beforeEach(() => {
        // Clear localStorage and reset document attribute before each test
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        jest.clearAllMocks();
    });

    test('should initialize with default light mode', () => {
        const { result } = renderHook(() => useDarkMode());
        expect(result.current.isDark).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('should initialize with dark mode from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        const { result } = renderHook(() => useDarkMode());
        expect(result.current.isDark).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('should toggle theme', () => {
        const { result } = renderHook(() => useDarkMode());

        // Initial state (light)
        expect(result.current.isDark).toBe(false);

        // Toggle to dark
        act(() => {
            result.current.toggle();
        });
        expect(result.current.isDark).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        // Toggle back to light
        act(() => {
            result.current.toggle();
        });
        expect(result.current.isDark).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
});
