// Enhanced App.js with Push Notifications and Reactotron
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';

// Initialize Reactotron in development
if (__DEV__) {
  import('./src/config/ReactotronConfig').then(() => {
    console.log('Reactotron Configured');
  });
}

import { ThemeProvider } from './src/context/ThemeContext';
import { LocalizationProvider } from './src/context/LocalizationContext';

export default function App() {
  console.log('App component mounted');

  useEffect(() => {
    console.log('App useEffect triggered');
    // Initialize notifications when app starts
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });

    // Cleanup listeners when app unmounts
    return () => {
      console.log('App cleanup triggered');
      NotificationService.removeListeners();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('Initializing notifications...');
      // Initialize notification service
      await NotificationService.init();
      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }

    // Setup notification listeners
    NotificationService.setupListeners();
  };

  const handleNotificationTap = (data) => {
    switch (data.type) {
      case 'maintenance':
        // Navigate to maintenance screen
        Alert.alert('صيانة', `طلب صيانة من غرفة ${data.roomNumber}`);
        break;

      case 'invoice':
        // Navigate to invoices screen
        Alert.alert('فاتورة', `فاتورة جديدة للغرفة ${data.roomNumber}`);
        break;

      case 'order_confirmed':
        // Navigate to grocery orders
        Alert.alert('طلب', 'تم تأكيد طلبك من البقالة');
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  return (
    <ThemeProvider>
      <LocalizationProvider>
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}