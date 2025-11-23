/**
 * Storage utility module for managing Chrome storage
 */

export const StorageManager = {
  /**
   * Get configuration from storage
   * @returns {Promise<Object>} Configuration object
   */
  async getConfig() {
    const result = await chrome.storage.local.get('config');
    return result.config || this.getDefaultConfig();
  },

  /**
   * Save configuration to storage
   * @param {Object} config - Configuration object
   */
  async saveConfig(config) {
    await chrome.storage.local.set({ config });
  },

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfig() {
    return {
      tiktok: {
        msToken: '',
        trendingCount: 50,
        browser: 'chromium'
      },
      discord: {
        botToken: '',
        channelId: '',
        useWebhook: false,
        webhookUrl: ''
      },
      filtering: {
        minFollowers: 100000,
        minEngagementRate: 0,
        verifiedOnly: false,
        excludePosted: true
      },
      schedule: {
        enabled: false,
        intervalMinutes: 60
      },
      advanced: {
        logLevel: 'INFO',
        maxRetries: 3,
        retryDelay: 5000
      }
    };
  },

  /**
   * Get posted profiles from storage
   * @returns {Promise<Object>} Posted profiles object
   */
  async getPostedProfiles() {
    const result = await chrome.storage.local.get('postedProfiles');
    return result.postedProfiles || {};
  },

  /**
   * Add a posted profile to storage
   * @param {string} profileId - Profile ID
   * @param {Object} profileData - Profile data
   */
  async addPostedProfile(profileId, profileData) {
    const postedProfiles = await this.getPostedProfiles();
    postedProfiles[profileId] = {
      ...profileData,
      postedAt: new Date().toISOString()
    };
    await chrome.storage.local.set({ postedProfiles });
  },

  /**
   * Check if a profile has been posted
   * @param {string} profileId - Profile ID
   * @returns {Promise<boolean>} True if posted
   */
  async isProfilePosted(profileId) {
    const postedProfiles = await this.getPostedProfiles();
    return profileId in postedProfiles;
  },

  /**
   * Clear posted profiles
   */
  async clearPostedProfiles() {
    await chrome.storage.local.set({ postedProfiles: {} });
  },

  /**
   * Get statistics from storage
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    const result = await chrome.storage.local.get('statistics');
    return result.statistics || {
      totalScraped: 0,
      totalPosted: 0,
      totalErrors: 0,
      lastRun: null,
      lastSuccess: null
    };
  },

  /**
   * Update statistics
   * @param {Object} updates - Statistics updates
   */
  async updateStatistics(updates) {
    const stats = await this.getStatistics();
    const newStats = { ...stats, ...updates };
    await chrome.storage.local.set({ statistics: newStats });
  },

  /**
   * Increment a statistic counter
   * @param {string} key - Statistic key
   * @param {number} amount - Amount to increment (default: 1)
   */
  async incrementStat(key, amount = 1) {
    const stats = await this.getStatistics();
    stats[key] = (stats[key] || 0) + amount;
    await chrome.storage.local.set({ statistics: stats });
  },

  /**
   * Get current state from storage
   * @returns {Promise<Object>} Current state
   */
  async getState() {
    const result = await chrome.storage.local.get('state');
    return result.state || {
      isRunning: false,
      lastError: null,
      currentPhase: null
    };
  },

  /**
   * Update state
   * @param {Object} updates - State updates
   */
  async updateState(updates) {
    const state = await this.getState();
    const newState = { ...state, ...updates };
    await chrome.storage.local.set({ state: newState });
  },

  /**
   * Export all data
   * @returns {Promise<Object>} All storage data
   */
  async exportData() {
    return await chrome.storage.local.get(null);
  },

  /**
   * Import data
   * @param {Object} data - Data to import
   */
  async importData(data) {
    await chrome.storage.local.set(data);
  },

  /**
   * Clear all data
   */
  async clearAll() {
    await chrome.storage.local.clear();
  }
};
