// src/context/LocalizationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform, DevSettings } from 'react-native';
import { translations } from '../localization/translations';


const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
    const [locale, setLocale] = useState('ar');
    const [isRTL, setIsRTL] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSavedLanguage();
    }, []);

    const loadSavedLanguage = async () => {
        try {
            const savedLocale = await AsyncStorage.getItem('locale');
            if (savedLocale) {
                const newIsRTL = savedLocale === 'ar';
                setLocale(savedLocale);
                setIsRTL(newIsRTL);

                if (I18nManager.isRTL !== newIsRTL) {
                    await I18nManager.allowRTL(newIsRTL);
                    await I18nManager.forceRTL(newIsRTL);
                }
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const changeLanguage = useCallback(async (newLocale) => {
        if (newLocale === locale) return; // Don't do anything if the locale hasn't changed

        try {
            setIsLoading(true);
            const newIsRTL = newLocale === 'ar';
            const rtlChanged = I18nManager.isRTL !== newIsRTL;

            // Save the new locale first
            await AsyncStorage.setItem('locale', newLocale);

            // Update state
            setLocale(newLocale);
            setIsRTL(newIsRTL);

            // Update RTL if needed
            if (rtlChanged) {
                await I18nManager.allowRTL(newIsRTL);
                await I18nManager.forceRTL(newIsRTL);
            }

            // Always reload the app after language change
            // Schedule reload after a short delay to ensure state is saved
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state to be saved

            // Hide loading before reload
            setIsLoading(false);

            // Small delay before reload to ensure loading is hidden
            await new Promise(resolve => setTimeout(resolve, 100));

            // Reload the app
            if (__DEV__) {
                DevSettings.reload();
            } else {
                if (Platform.OS === 'ios') {
                    await Updates.reloadAsync();
                } else {
                    RNRestart.Restart();
                }
            }
        } catch (error) {
            console.error('Error changing language:', error);
            setIsLoading(false);
        }
    }, [locale]);

    const t = useCallback((key, params = {}) => {
        try {
            const keys = key.split('.');
            let value = translations[locale];

            for (const k of keys) {
                if (!value || typeof value !== 'object') {
                    console.warn(`Translation key not found: ${key}`);
                    return key;
                }
                value = value[k];
            }

            if (typeof value !== 'string') {
                console.warn(`Translation value is not a string for key: ${key}`);
                return key;
            }

            // Replace any parameters in the string
            return Object.entries(params).reduce((str, [param, val]) =>
                str.replace(`{${param}}`, val), value);
        } catch (error) {
            console.error('Translation error:', error);
            return key;
        }
    }, [locale]);

    const value = useMemo(() => ({
        locale,
        isRTL,
        isLoading,
        changeLanguage,
        t
    }), [locale, isRTL, isLoading, changeLanguage, t]);

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
