
/**
 * Formats a date string to a readable format
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted date
 */
export const formatDate = (date, locale = 'ar') => {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        if (locale === 'ar') {
            return dateObj.toLocaleDateString('ar-SA', options);
        } else {
            return dateObj.toLocaleDateString('en-US', options);
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

/**
 * Formats a date string to a short format
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted date
 */
export const formatDateShort = (date, locale = 'ar') => {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (locale === 'ar') {
            return dateObj.toLocaleDateString('ar-SA', options);
        } else {
            return dateObj.toLocaleDateString('en-US', options);
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

/**
 * Gets the relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to compare
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, locale = 'ar') => {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        const now = new Date();
        const diffInMs = now - dateObj;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (locale === 'ar') {
            if (diffInDays > 0) {
                return `منذ ${diffInDays} يوم`;
            } else if (diffInHours > 0) {
                return `منذ ${diffInHours} ساعة`;
            } else if (diffInMinutes > 0) {
                return `منذ ${diffInMinutes} دقيقة`;
            } else {
                return 'الآن';
            }
        } else {
            if (diffInDays > 0) {
                return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
            } else if (diffInHours > 0) {
                return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else if (diffInMinutes > 0) {
                return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            } else {
                return 'Just now';
            }
        }
    } catch (error) {
        console.error('Error getting relative time:', error);
        return 'Invalid Date';
    }
};

/**
 * Checks if a date is overdue
 * @param {string|Date} dueDate - Due date to check
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => {
    if (!dueDate) return false;

    try {
        const due = new Date(dueDate);
        const now = new Date();
        return due < now;
    } catch (error) {
        console.error('Error checking if overdue:', error);
        return false;
    }
};

/**
 * Gets the number of days until a date
 * @param {string|Date} date - Target date
 * @returns {number} Number of days (negative if past)
 */
export const getDaysUntil = (date) => {
    if (!date) return 0;

    try {
        const targetDate = new Date(date);
        const now = new Date();
        const diffInMs = targetDate - now;
        return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    } catch (error) {
        console.error('Error getting days until:', error);
        return 0;
    }
};

/**
 * Formats time to a readable format
 * @param {string|Date} date - Date to format time from
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Formatted time
 */
export const formatTime = (date, locale = 'ar') => {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Time';

        const options = {
            hour: '2-digit',
            minute: '2-digit'
        };

        if (locale === 'ar') {
            return dateObj.toLocaleTimeString('ar-SA', options);
        } else {
            return dateObj.toLocaleTimeString('en-US', options);
        }
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

/**
 * Creates a date range string
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {string} locale - Locale for formatting (default: 'ar')
 * @returns {string} Date range string
 */
export const formatDateRange = (startDate, endDate, locale = 'ar') => {
    const start = formatDateShort(startDate, locale);
    const end = formatDateShort(endDate, locale);

    if (locale === 'ar') {
        return `${start} - ${end}`;
    } else {
        return `${start} - ${end}`;
    }
};