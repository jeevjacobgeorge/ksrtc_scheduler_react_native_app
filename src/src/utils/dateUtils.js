/**
 * Format a date to a readable string showing how long ago it was
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string (e.g., '2 hours ago', 'just now')
 */
export const formatTimeAgo = (date) => {
    const now = new Date();
    const dateObj = new Date(date);
    const seconds = Math.floor((now - dateObj) / 1000);
    
    // Handle invalid dates
    if (isNaN(dateObj)) {
      return 'Unknown date';
    }
    
    // Less than a minute
    if (seconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Less than a month
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Less than a year
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // More than a year
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };
  
  /**
   * Format a date to standard format (e.g., January 1, 2023)
   * @param {string|Date} date - The date to format
   * @returns {string} Formatted date string
   */
  export const formatDate = (date) => {
    const dateObj = new Date(date);
    
    // Handle invalid dates
    if (isNaN(dateObj)) {
      return 'Unknown date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Format a date to time format (e.g., 1:30 PM)
   * @param {string|Date} date - The date to format
   * @returns {string} Formatted time string
   */
  export const formatTime = (date) => {
    const dateObj = new Date(date);
    
    // Handle invalid dates
    if (isNaN(dateObj)) {
      return 'Unknown time';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  /**
   * Format a date for display in messages (today, yesterday, or date)
   * @param {string|Date} date - The date to format
   * @returns {string} Formatted date string
   */
  export const formatMessageDate = (date) => {
    const dateObj = new Date(date);
    const now = new Date();
    
    // Handle invalid dates
    if (isNaN(dateObj)) {
      return '';
    }
    
    // Check if it's today
    if (dateObj.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
      return formatTime(date);
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateObj.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
      return 'Yesterday';
    }
    
    // Otherwise return date
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };