// src/utils/debugUtils.js
export const debugApiResponse = (endpoint, response) => {
    console.group(`🔍 API Debug: ${endpoint}`);
    console.log('📦 Raw Response:', response);
    console.log('📊 Response Type:', typeof response);
    console.log('📋 Is Array:', Array.isArray(response));

    if (response) {
        console.log('🔑 Response Keys:', Object.keys(response));

        if (response.data) {
            console.log('📦 Response.data:', response.data);
            console.log('📊 Data Type:', typeof response.data);
            console.log('📋 Data Is Array:', Array.isArray(response.data));

            if (Array.isArray(response.data)) {
                console.log('📏 Data Length:', response.data.length);
                if (response.data.length > 0) {
                    console.log('🎯 First Item:', response.data[0]);
                }
            }
        }

        // Check for common data keys
        const commonKeys = ['invoices', 'maintenanceRequests', 'items', 'orders', 'users'];
        commonKeys.forEach(key => {
            if (response[key]) {
                console.log(`🔍 Found ${key}:`, response[key]);
            }
        });
    }

    console.groupEnd();
};

export const debugUserData = (currentUser) => {
    console.group('👤 User Data Debug');
    console.log('📦 Raw User:', currentUser);
    console.log('📊 User Type:', typeof currentUser);

    if (currentUser) {
        console.log('🔑 User Keys:', Object.keys(currentUser));

        if (currentUser.data) {
            console.log('📦 User.data:', currentUser.data);
            console.log('🔑 User.data Keys:', Object.keys(currentUser.data));
        }

        // Check for user properties
        const userProps = ['name', 'username', 'roomNumber', 'type', 'checkInDate', 'startDate', 'createdAt'];
        userProps.forEach(prop => {
            if (currentUser[prop]) {
                console.log(`🎯 Direct ${prop}:`, currentUser[prop]);
            }
            if (currentUser.data && currentUser.data[prop]) {
                console.log(`🎯 Data ${prop}:`, currentUser.data[prop]);
            }
        });
    }

    console.groupEnd();
};