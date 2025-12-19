/**
 * Time Utilities for ReWear App
 * Provides consistent date/time formatting across the application
 */

/**
 * Converts a date string to relative time format
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "2 mins ago", "Yesterday", "Dec 18")
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        // Just now (< 1 minute)
        if (diffInSeconds < 60) {
            return 'Just now';
        }

        // Minutes ago (< 1 hour)
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        }

        // Hours ago (< 24 hours)
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        // Days ago (< 7 days)
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Formatted date for older items
        return formatTimestamp(dateString);
    } catch (error) {
        console.error('Error parsing date:', error);
        return 'Recently';
    }
};

/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Dec 18, 2024")
 */
export const formatTimestamp = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Gets a short relative time for compact displays
 * @param {string} dateString - ISO date string
 * @returns {string} Short relative time (e.g., "2m", "5h", "3d")
 */
export const getShortRelativeTime = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

        const weeks = Math.floor(diffInSeconds / 604800);
        if (weeks < 4) return `${weeks}w`;

        return formatTimestamp(dateString);
    } catch (error) {
        return '';
    }
};
