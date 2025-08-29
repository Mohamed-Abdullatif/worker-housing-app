// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2563eb',
        secondary: '#16a34a',
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceVariant: '#f3f4f6',
        text: '#1f2937',
        textSecondary: '#6b7280',
        placeholder: '#9ca3af',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        border: '#e5e7eb',
        card: {
            blue: '#dbeafe',
            green: '#dcfce7',
            yellow: '#fef3c7',
            red: '#fee2e2',
            default: '#ffffff',
        },
        icon: {
            blue: '#2563eb',
            green: '#16a34a',
            yellow: '#ca8a04',
            red: '#dc2626',
            default: '#6b7280',
            orange: '#ea580c',
        },
        button: {
            primary: '#2563eb',
            maintenance: '#ca8a04',
            invoice: '#16a34a',
            management: '#7c3aed',
            default: '#f3f4f6',
        },
        chip: {
            background: '#f3f4f6',
            text: '#1f2937',
            selected: '#2563eb',
        }
    },
};

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#60a5fa',
        secondary: '#4ade80',
        background: '#18191A',
        surface: '#242526',
        surfaceVariant: '#3A3B3C',
        text: '#E4E6EB',
        textSecondary: '#B0B3B8',
        placeholder: '#8A8D91',
        backdrop: 'rgba(0, 0, 0, 0.7)',
        border: '#3E4042',
        card: {
            blue: '#1e3a8a',
            green: '#14532d',
            yellow: '#713f12',
            red: '#7f1d1d',
            default: '#242526',
        },
        icon: {
            blue: '#60a5fa',
            green: '#4ade80',
            yellow: '#fcd34d',
            red: '#f87171',
            default: '#B0B3B8',
            orange: '#fb923c',
        },
        button: {
            primary: '#2374E1',
            maintenance: '#eab308',
            invoice: '#22c55e',
            management: '#8b5cf6',
            default: '#3A3B3C',
        },
        chip: {
            background: '#3A3B3C',
            text: '#E4E6EB',
            selected: '#2374E1',
        }
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [themeType, setThemeType] = useState('system'); // 'system', 'light', or 'dark'

    const theme = useMemo(() => {
        const baseTheme = isDarkMode ? darkTheme : lightTheme;
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                card: { ...baseTheme.colors.card },
                icon: { ...baseTheme.colors.icon },
                button: { ...baseTheme.colors.button }
            }
        };
    }, [isDarkMode]);

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (themeType === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
        }
    }, [systemColorScheme, themeType]);

    const loadThemePreference = async () => {
        try {
            const savedThemeType = await AsyncStorage.getItem('themeType');
            if (savedThemeType) {
                setThemeType(savedThemeType);
                setIsDarkMode(
                    savedThemeType === 'dark' ||
                    (savedThemeType === 'system' && systemColorScheme === 'dark')
                );
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = useCallback(async () => {
        const newIsDark = !isDarkMode;
        setIsDarkMode(newIsDark);
        setThemeType(newIsDark ? 'dark' : 'light');
        await AsyncStorage.setItem('themeType', newIsDark ? 'dark' : 'light');
    }, [isDarkMode]);

    const value = useMemo(() => ({
        theme,
        isDarkMode,
        toggleTheme,
        themeType
    }), [theme, isDarkMode, toggleTheme, themeType]);

    return (
        <ThemeContext.Provider value={value}>
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};
