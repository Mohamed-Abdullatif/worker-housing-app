// src/utils/userUtils.js - FIXED VERSION

/**
 * Extracts user data from different response structures
 * Handles cases where user data might be nested under 'data' property
 */
export const getUserData = (currentUser) => {
    if (!currentUser) return null;

    // If currentUser has a 'data' property with user info, use that
    if (currentUser.data && (currentUser.data.name || currentUser.data.username)) {
        return currentUser.data;
    }

    // Otherwise, use currentUser directly
    return currentUser;
};

/**
 * Calculates the number of days a user has stayed
 * @param {Object} user - User object
 * @returns {number} Number of days stayed
 */
export const getDaysStayed = (user) => {
    if (!user) return 0;

    // First try to use the 'days' field from database
    if (user.days && typeof user.days === 'number') {
        return user.days;
    }

    const checkInDate = user.checkInDate || user.startDate || user.createdAt;
    if (!checkInDate) return 0;

    try {
        const checkIn = new Date(checkInDate);
        const today = new Date();

        // Validate dates
        if (isNaN(checkIn.getTime())) return 0;

        const diffTime = Math.abs(today - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch (error) {
        console.error('Error calculating days stayed:', error);
        return 0;
    }
};

/**
 * Checks if user is admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
    const userData = getUserData(user);
    return userData?.type === 'admin';
};

/**
 * Checks if user is staff (includes both 'staff' and 'worker' types)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isStaff = (user) => {
    const userData = getUserData(user);
    return userData?.type === 'staff' || userData?.type === 'worker';
};

/**
 * Checks if user is worker (alias for isStaff)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isWorker = (user) => {
    const userData = getUserData(user);
    return userData?.type === 'worker';
};

/**
 * Checks if user is resident
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isResident = (user) => {
    const userData = getUserData(user);
    return userData?.type === 'resident';
};

/**
 * Gets user's display name
 * @param {Object} user - User object
 * @returns {string}
 */
export const getUserDisplayName = (user) => {
    const userData = getUserData(user);
    return userData?.name || userData?.username || 'Unknown User';
};

/**
 * Gets user's room number
 * @param {Object} user - User object
 * @returns {string}
 */
export const getUserRoomNumber = (user) => {
    const userData = getUserData(user);
    return userData?.roomNumber || 'N/A';
};

/**
 * Gets user's contact number
 * @param {Object} user - User object
 * @returns {string}
 */
export const getUserContactNumber = (user) => {
    const userData = getUserData(user);
    return userData?.contactNumber || 'N/A';
};

/**
 * Gets user's ID (handles both 'id' and '_id' fields)
 * @param {Object} user - User object
 * @returns {string}
 */
export const getUserId = (user) => {
    const userData = getUserData(user);
    return userData?.id || userData?._id || null;
};

/**
 * Checks if user has permission for a specific action
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
    const userData = getUserData(user);
    const userType = userData?.type;

    switch (permission) {
        case 'view_management':
            return userType === 'admin' || userType === 'staff' || userType === 'worker';
        case 'view_all_invoices':
            return userType === 'admin' || userType === 'staff' || userType === 'worker';
        case 'view_all_maintenance':
            return userType === 'admin' || userType === 'staff' || userType === 'worker';
        case 'manage_users':
            return userType === 'admin';
        case 'grocery_orders':
            return userType === 'resident';
        default:
            return false;
    }
};

/**
 * Formats user data for display
 * @param {Object} user - User object
 * @returns {Object} Formatted user data
 */
export const formatUserForDisplay = (user) => {
    const userData = getUserData(user);
    if (!userData) return null;

    return {
        id: getUserId(user),
        name: getUserDisplayName(user),
        roomNumber: getUserRoomNumber(user),
        contactNumber: getUserContactNumber(user),
        type: userData.type,
        daysStayed: getDaysStayed(userData),
        isAdmin: isAdmin(user),
        isStaff: isStaff(user),
        isWorker: isWorker(user),
        isResident: isResident(user),
        checkInDate: userData.checkInDate || userData.startDate || userData.createdAt,
        username: userData.username
    };
};