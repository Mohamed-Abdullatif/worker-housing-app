import Reactotron, { networking } from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

// Get host IP for Android emulator
let scriptHostname = 'localhost';
if (__DEV__ && NativeModules.SourceCode) {
    const scriptURL = NativeModules.SourceCode.scriptURL || '';
    try {
        scriptHostname = scriptURL.split('://')[1].split(':')[0] || 'localhost';
    } catch (e) {
        console.warn('Failed to get script hostname:', e);
    }
}

const reactotron = Reactotron
    .setAsyncStorageHandler(AsyncStorage)
    .configure({
        name: 'Worker Housing App',
        host: scriptHostname || 'localhost',
    })
    .useReactNative({
        asyncStorage: {
            ignore: ['secret_*', 'private_*']
        },
        networking: {
            ignoreUrls: /symbolicate|logs/,
            ignorePatterns: /auth|password|token/i
        },
        editor: true,
        errors: {
            veto: stackFrame => false,
            skipFrames: 3
        },
        overlay: false
    })
    .use(networking())
    .use(reactotronRedux())
    .connect();

// Add console.tron for convenience
console.tron = reactotron;

// Add custom commands
Reactotron.onCustomCommand({
    command: 'clear_storage',
    handler: () => {
        AsyncStorage.clear();
        console.tron.log('Storage cleared');
    },
    title: 'Clear Storage',
    description: 'Clears AsyncStorage',
});

Reactotron.onCustomCommand({
    command: 'test_api',
    handler: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.tron.log('Current token:', token);

            // Log network status
            console.tron.log('Testing API endpoints...');
            const ENDPOINTS = ['/api/invoices', '/api/users', '/api/maintenance'];

            for (const endpoint of ENDPOINTS) {
                try {
                    const response = await fetch(endpoint);
                    console.tron.log(`${endpoint}: ${response.status}`);
                } catch (error) {
                    console.tron.error(`${endpoint} failed:`, error);
                }
            }
        } catch (error) {
            console.tron.error('API test failed:', error);
        }
    },
    title: 'Test API',
    description: 'Tests API endpoints',
});

export default reactotron;
