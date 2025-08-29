// src/utils/formatUtils.js

/**
 * Formats currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: 'ريال')
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'ريال', locale = 'ar') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return `0 ${currency}`;
    }

    try {
        const numAmount = Number(amount);

        if (locale === 'ar') {
            return `${numAmount.toLocaleString('ar-SA')} ${currency}`;
        } else {
            return `${currency} ${numAmount.toLocaleString('en-US')}`;
        }
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `${amount} ${currency}`;
    }
};

/**
 * Formats large numbers with K, M suffixes
 * @param {number} num - Number to format
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted number
 */
export const formatLargeNumber = (num, locale = 'ar') => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }

    const absNum = Math.abs(num);

    if (absNum >= 1000000) {
        const formatted = (num / 1000000).toFixed(1);
        return locale === 'ar' ? `${formatted}م` : `${formatted}M`;
    } else if (absNum >= 1000) {
        const formatted = (num / 1000).toFixed(1);
        return locale === 'ar' ? `${formatted}ك` : `${formatted}K`;
    }

    return num.toString();
};

/**
 * Formats phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format Saudi numbers
    if (cleaned.length === 10 && cleaned.startsWith('05')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    // Format international numbers
    if (cleaned.length === 12 && cleaned.startsWith('966')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }

    // Return as-is if doesn't match known patterns
    return phone;
};

/**
 * Formats room number for display
 * @param {string} roomNumber - Room number to format
 * @returns {string} Formatted room number
 */
export const formatRoomNumber = (roomNumber) => {
    if (!roomNumber) return 'N/A';
    return roomNumber.toUpperCase();
};

/**
 * Formats username for display
 * @param {string} username - Username to format
 * @returns {string} Formatted username
 */
export const formatUsername = (username) => {
    if (!username) return 'N/A';
    return `@${username}`;
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text) return '';

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, locale = 'ar') => {
    if (bytes === 0) return locale === 'ar' ? '0 بايت' : '0 Bytes';

    const k = 1024;
    const sizes = locale === 'ar'
        ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
        : ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats percentage
 * @param {number} value - Value to format as percentage
 * @param {number} total - Total value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
    if (!total || total === 0) return '0%';

    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formats maintenance priority for display
 * @param {string} priority - Priority level
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted priority
 */
export const formatMaintenancePriority = (priority, locale = 'ar') => {
    const priorities = {
        ar: {
            low: 'منخفضة',
            medium: 'متوسطة',
            high: 'عالية',
            urgent: 'عاجلة'
        },
        en: {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent'
        }
    };

    return priorities[locale]?.[priority] || priority;
};

/**
 * Formats status for display
 * @param {string} status - Status to format
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted status
 */
export const formatStatus = (status, locale = 'ar') => {
    const statuses = {
        ar: {
            pending: 'قيد الانتظار',
            in_progress: 'قيد التنفيذ',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            paid: 'مدفوعة',
            unpaid: 'غير مدفوعة',
            overdue: 'متأخرة',
            delivered: 'تم التوصيل',
            processing: 'قيد المعالجة'
        },
        en: {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
            paid: 'Paid',
            unpaid: 'Unpaid',
            overdue: 'Overdue',
            delivered: 'Delivered',
            processing: 'Processing'
        }
    };

    return statuses[locale]?.[status] || status;
};

/**
 * Formats array of items into a readable list
 * @param {Array} items - Array of items to format
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted list
 */
export const formatList = (items, locale = 'ar') => {
    if (!items || items.length === 0) return '';

    if (items.length === 1) return items[0];

    const separator = locale === 'ar' ? '، ' : ', ';
    const lastSeparator = locale === 'ar' ? ' و ' : ' and ';

    if (items.length === 2) {
        return items.join(lastSeparator);
    }

    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];

    return allButLast.join(separator) + lastSeparator + last;
};

/**
 * Formats invoice items for display
 * @param {Array} items - Array of invoice items
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted invoice items
 */
export const formatInvoiceItems = (items, locale = 'ar') => {
    if (!items || items.length === 0) return '';

    const itemNames = {
        ar: {
            monthlyRent: 'إيجار شهري',
            electricity: 'كهرباء',
            water: 'مياه',
            internet: 'إنترنت',
            maintenance: 'صيانة',
            cleaning: 'نظافة',
            parking: 'موقف',
            laundry: 'غسيل'
        },
        en: {
            monthlyRent: 'Monthly Rent',
            electricity: 'Electricity',
            water: 'Water',
            internet: 'Internet',
            maintenance: 'Maintenance',
            cleaning: 'Cleaning',
            parking: 'Parking',
            laundry: 'Laundry'
        }
    };

    const translatedItems = items.map(item => {
        if (typeof item === 'string') {
            return itemNames[locale]?.[item] || item;
        }
        return item.name || item;
    });

    return formatList(translatedItems, locale);
};

/**
 * Removes Arabic diacritics for search/comparison
 * @param {string} text - Arabic text with diacritics
 * @returns {string} Text without diacritics
 */
export const removeArabicDiacritics = (text) => {
    if (!text) return '';

    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
};

/**
 * Formats search query for better matching
 * @param {string} query - Search query
 * @returns {string} Formatted query
 */
export const formatSearchQuery = (query) => {
    if (!query) return '';

    return removeArabicDiacritics(query.toLowerCase().trim());
};

/**
 * Generates initials from a name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials
 */
export const getInitials = (name, maxInitials = 2) => {
    if (!name) return '';

    const words = name.trim().split(' ');
    const initials = words
        .slice(0, maxInitials)
        .map(word => word.charAt(0).toUpperCase())
        .join('');

    return initials;
};