// src/utils/validationUtils.js

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates phone number format (supports various formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const isValidPhoneNumber = (phone) => {
    if (!phone) return false;

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid length (8-15 digits)
    return cleaned.length >= 8 && cleaned.length <= 15;
};

/**
 * Validates Saudi phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const isValidSaudiPhoneNumber = (phone) => {
    if (!phone) return false;

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Saudi numbers: 05XXXXXXXX (10 digits) or 9665XXXXXXXX (12 digits with country code)
    return /^(05\d{8}|9665\d{8})$/.test(cleaned);
};

/**
 * Validates room number format
 * @param {string} roomNumber - Room number to validate
 * @returns {boolean}
 */
export const isValidRoomNumber = (roomNumber) => {
    if (!roomNumber) return false;

    // Room number should be alphanumeric, 2-10 characters
    const roomRegex = /^[A-Za-z0-9]{2,10}$/;
    return roomRegex.test(roomNumber.trim());
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
    if (!username) return false;

    // Username: 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (password.length > 50) {
        return { isValid: false, message: 'Password must be less than 50 characters' };
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
        return {
            isValid: false,
            message: 'Password must contain at least one letter and one number'
        };
    }

    return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates required fields
 * @param {Object} fields - Object with field names as keys and values to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateRequiredFields = (fields) => {
    const errors = {};
    let isValid = true;

    Object.entries(fields).forEach(([fieldName, value]) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[fieldName] = `${fieldName} is required`;
            isValid = false;
        }
    });

    return { isValid, errors };
};

/**
 * Validates numeric input
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {Object} Validation result
 */
export const validateNumeric = (value, min = null, max = null) => {
    if (value === '' || value === null || value === undefined) {
        return { isValid: false, message: 'Value is required' };
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
        return { isValid: false, message: 'Value must be a number' };
    }

    if (min !== null && numValue < min) {
        return { isValid: false, message: `Value must be at least ${min}` };
    }

    if (max !== null && numValue > max) {
        return { isValid: false, message: `Value must be at most ${max}` };
    }

    return { isValid: true, message: 'Valid number' };
};

/**
 * Validates maintenance request form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
export const validateMaintenanceRequest = (formData) => {
    const errors = {};
    let isValid = true;

    if (!formData.type || formData.type.trim() === '') {
        errors.type = 'Maintenance type is required';
        isValid = false;
    }

    if (!formData.description || formData.description.trim() === '') {
        errors.description = 'Description is required';
        isValid = false;
    } else if (formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
        isValid = false;
    }

    if (!formData.priority) {
        errors.priority = 'Priority is required';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validates invoice data
 * @param {Object} invoiceData - Invoice data to validate
 * @returns {Object} Validation result
 */
export const validateInvoice = (invoiceData) => {
    const errors = {};
    let isValid = true;

    if (!invoiceData.roomNumber) {
        errors.roomNumber = 'Room number is required';
        isValid = false;
    }

    if (!invoiceData.amount || invoiceData.amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
        isValid = false;
    }

    if (!invoiceData.month) {
        errors.month = 'Month is required';
        isValid = false;
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
        errors.items = 'At least one item is required';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validates user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
export const validateUserRegistration = (userData) => {
    const errors = {};
    let isValid = true;

    if (!userData.name || userData.name.trim() === '') {
        errors.name = 'Name is required';
        isValid = false;
    }

    if (!userData.username) {
        errors.username = 'Username is required';
        isValid = false;
    } else if (!isValidUsername(userData.username)) {
        errors.username = 'Username must be 3-20 characters, alphanumeric and underscore only';
        isValid = false;
    }

    if (!userData.roomNumber) {
        errors.roomNumber = 'Room number is required';
        isValid = false;
    } else if (!isValidRoomNumber(userData.roomNumber)) {
        errors.roomNumber = 'Invalid room number format';
        isValid = false;
    }

    if (userData.contactNumber && !isValidPhoneNumber(userData.contactNumber)) {
        errors.contactNumber = 'Invalid phone number format';
        isValid = false;
    }

    if (userData.password) {
        const passwordValidation = validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.message;
            isValid = false;
        }
    }

    return { isValid, errors };
};