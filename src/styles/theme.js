// src/styles/theme.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2563eb',
        secondary: '#16a34a',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280',
        placeholder: '#9ca3af',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        card: {
            blue: '#dbeafe',
            green: '#dcfce7',
            yellow: '#fef3c7',
            red: '#fee2e2',
        },
        icon: {
            blue: '#2563eb',
            green: '#16a34a',
            yellow: '#ca8a04',
            red: '#dc2626',
        },
        button: {
            primary: '#2563eb',
            maintenance: '#ca8a04',
            invoice: '#16a34a',
            management: '#7c3aed',
        }
    },
    fonts: {
        regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300',
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100',
        },
    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#60a5fa',
        secondary: '#4ade80',
        background: '#1f2937',
        surface: '#111827',
        text: '#f3f4f6',
        textSecondary: '#d1d5db',
        placeholder: '#9ca3af',
        backdrop: 'rgba(0, 0, 0, 0.7)',
        card: {
            blue: '#1e3a8a',
            green: '#14532d',
            yellow: '#713f12',
            red: '#7f1d1d',
        },
        icon: {
            blue: '#60a5fa',
            green: '#4ade80',
            yellow: '#fcd34d',
            red: '#f87171',
        },
        button: {
            primary: '#3b82f6',
            maintenance: '#eab308',
            invoice: '#22c55e',
            management: '#8b5cf6',
        }
    },
    fonts: {
        regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300',
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100',
        },
    },
};