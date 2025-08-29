// src/utils/index.js

// Export all user utilities
export {
    getUserData,
    getDaysStayed,
    isAdmin,
    isStaff,
    isResident,
    getUserDisplayName,
    getUserRoomNumber,
    getUserContactNumber,
    getUserId,
    hasPermission,
    formatUserForDisplay
} from './userUtils';

// Export all date utilities
export {
    formatDate,
    formatDateShort,
    getRelativeTime,
    isOverdue,
    getDaysUntil,
    formatTime,
    formatDateRange
} from './dateUtils';

// Export all validation utilities
export {
    isValidEmail,
    isValidPhoneNumber,
    isValidSaudiPhoneNumber,
    isValidRoomNumber,
    isValidUsername,
    validatePassword,
    validateRequiredFields,
    validateNumeric,
    validateMaintenanceRequest,
    validateInvoice,
    validateUserRegistration
} from './validationUtils';

// Export all formatting utilities
export {
    formatCurrency,
    formatLargeNumber,
    formatPhoneNumber,
    formatRoomNumber,
    formatUsername,
    truncateText,
    capitalizeWords,
    formatFileSize,
    formatPercentage,
    formatMaintenancePriority,
    formatStatus,
    formatList,
    formatInvoiceItems,
    removeArabicDiacritics,
    formatSearchQuery,
    getInitials
} from './formatUtils';