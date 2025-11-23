/**
 * Utility functions
 */

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

/**
 * Format date to relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'Never';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return then.toLocaleDateString();
}

/**
 * Validate TikTok ms_token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export function validateMsToken(token) {
  if (!token) return false;
  // Basic validation - should be a long string
  return token.length > 20 && /^[A-Za-z0-9_-]+$/.test(token);
}

/**
 * Validate Discord bot token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export function validateDiscordToken(token) {
  if (!token) return false;
  // Discord bot tokens have a specific format
  return /^[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}$/.test(token);
}

/**
 * Validate Discord webhook URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function validateWebhookUrl(url) {
  if (!url) return false;
  return url.startsWith('https://discord.com/api/webhooks/') || 
         url.startsWith('https://discordapp.com/api/webhooks/');
}

/**
 * Validate Discord channel ID
 * @param {string} id - Channel ID to validate
 * @returns {boolean} True if valid
 */
export function validateChannelId(id) {
  if (!id) return false;
  return /^\d{17,19}$/.test(id);
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate engagement rate
 * @param {number} hearts - Total hearts/likes
 * @param {number} followers - Follower count
 * @returns {number} Engagement rate percentage
 */
export function calculateEngagementRate(hearts, followers) {
  if (!followers || followers === 0) return 0;
  return ((hearts / followers) * 100).toFixed(2);
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, error)
 */
export async function showNotification(title, message, type = 'info') {
  const iconMap = {
    info: 'icons/icon128.png',
    success: 'icons/icon128.png',
    error: 'icons/icon128.png'
  };
  
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: iconMap[type] || iconMap.info,
    title: title,
    message: message,
    priority: type === 'error' ? 2 : 1
  });
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
