/**
 * Options Page Controller
 */

import { StorageManager } from '../lib/storage.js';
import { 
  validateMsToken, 
  validateDiscordToken, 
  validateWebhookUrl, 
  validateChannelId,
  formatNumber,
  formatRelativeTime,
  debounce
} from '../lib/utils.js';

// Current configuration
let currentConfig = null;

// DOM Elements
const elements = {
  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  pageTitle: document.getElementById('pageTitle'),
  
  // Header actions
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  
  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  
  // General tab
  testConnectionBtn: document.getElementById('testConnectionBtn'),
  testDiscordBtn: document.getElementById('testDiscordBtn'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  importDataBtn: document.getElementById('importDataBtn'),
  importFileInput: document.getElementById('importFileInput'),
  
  // TikTok tab
  msToken: document.getElementById('msToken'),
  trendingCount: document.getElementById('trendingCount'),
  browserEngine: document.getElementById('browserEngine'),
  msTokenHelpLink: document.getElementById('msTokenHelpLink'),
  
  // Discord tab
  useWebhook: document.getElementById('useWebhook'),
  botToken: document.getElementById('botToken'),
  channelId: document.getElementById('channelId'),
  webhookUrl: document.getElementById('webhookUrl'),
  botTokenSection: document.getElementById('botTokenSection'),
  webhookSection: document.getElementById('webhookSection'),
  
  // Filtering tab
  minFollowers: document.getElementById('minFollowers'),
  minEngagementRate: document.getElementById('minEngagementRate'),
  verifiedOnly: document.getElementById('verifiedOnly'),
  excludePosted: document.getElementById('excludePosted'),
  
  // Schedule tab
  scheduleEnabled: document.getElementById('scheduleEnabled'),
  intervalMinutes: document.getElementById('intervalMinutes'),
  intervalSection: document.getElementById('intervalSection'),
  
  // History tab
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  
  // Advanced tab
  logLevel: document.getElementById('logLevel'),
  maxRetries: document.getElementById('maxRetries'),
  retryDelay: document.getElementById('retryDelay'),
  viewStorageBtn: document.getElementById('viewStorageBtn'),
  clearAllDataBtn: document.getElementById('clearAllDataBtn')
};

/**
 * Initialize options page
 */
async function init() {
  await loadConfiguration();
  setupNavigation();
  setupEventListeners();
  await loadHistory();
  
  // Handle hash navigation
  if (window.location.hash) {
    const tab = window.location.hash.substring(1);
    switchTab(tab);
  }
}

/**
 * Load configuration from storage
 */
async function loadConfiguration() {
  currentConfig = await StorageManager.getConfig();
  populateForm(currentConfig);
}

/**
 * Populate form with configuration data
 */
function populateForm(config) {
  // TikTok
  elements.msToken.value = config.tiktok.msToken || '';
  elements.trendingCount.value = config.tiktok.trendingCount;
  elements.browserEngine.value = config.tiktok.browser;
  
  // Discord
  elements.useWebhook.checked = config.discord.useWebhook;
  elements.botToken.value = config.discord.botToken || '';
  elements.channelId.value = config.discord.channelId || '';
  elements.webhookUrl.value = config.discord.webhookUrl || '';
  toggleDiscordMode();
  
  // Filtering
  elements.minFollowers.value = config.filtering.minFollowers;
  elements.minEngagementRate.value = config.filtering.minEngagementRate;
  elements.verifiedOnly.checked = config.filtering.verifiedOnly;
  elements.excludePosted.checked = config.filtering.excludePosted;
  
  // Schedule
  elements.scheduleEnabled.checked = config.schedule.enabled;
  elements.intervalMinutes.value = config.schedule.intervalMinutes;
  toggleScheduleSection();
  
  // Advanced
  elements.logLevel.value = config.advanced.logLevel;
  elements.maxRetries.value = config.advanced.maxRetries;
  elements.retryDelay.value = config.advanced.retryDelay;
}

/**
 * Get configuration from form
 */
function getFormConfiguration() {
  return {
    tiktok: {
      msToken: elements.msToken.value.trim(),
      trendingCount: parseInt(elements.trendingCount.value),
      browser: elements.browserEngine.value
    },
    discord: {
      useWebhook: elements.useWebhook.checked,
      botToken: elements.botToken.value.trim(),
      channelId: elements.channelId.value.trim(),
      webhookUrl: elements.webhookUrl.value.trim()
    },
    filtering: {
      minFollowers: parseInt(elements.minFollowers.value),
      minEngagementRate: parseFloat(elements.minEngagementRate.value),
      verifiedOnly: elements.verifiedOnly.checked,
      excludePosted: elements.excludePosted.checked
    },
    schedule: {
      enabled: elements.scheduleEnabled.checked,
      intervalMinutes: parseInt(elements.intervalMinutes.value)
    },
    advanced: {
      logLevel: elements.logLevel.value,
      maxRetries: parseInt(elements.maxRetries.value),
      retryDelay: parseInt(elements.retryDelay.value)
    }
  };
}

/**
 * Validate configuration
 */
function validateConfiguration(config) {
  const errors = [];
  
  // TikTok validation
  if (config.tiktok.msToken && !validateMsToken(config.tiktok.msToken)) {
    errors.push('Invalid TikTok ms_token format');
  }
  
  if (config.tiktok.trendingCount < 10 || config.tiktok.trendingCount > 100) {
    errors.push('Trending count must be between 10 and 100');
  }
  
  // Discord validation
  if (config.discord.useWebhook) {
    if (!config.discord.webhookUrl) {
      errors.push('Discord webhook URL is required');
    } else if (!validateWebhookUrl(config.discord.webhookUrl)) {
      errors.push('Invalid Discord webhook URL format');
    }
  } else {
    if (!config.discord.botToken) {
      errors.push('Discord bot token is required');
    } else if (!validateDiscordToken(config.discord.botToken)) {
      errors.push('Invalid Discord bot token format');
    }
    
    if (!config.discord.channelId) {
      errors.push('Discord channel ID is required');
    } else if (!validateChannelId(config.discord.channelId)) {
      errors.push('Invalid Discord channel ID format');
    }
  }
  
  // Schedule validation
  if (config.schedule.enabled) {
    if (config.schedule.intervalMinutes < 15 || config.schedule.intervalMinutes > 1440) {
      errors.push('Schedule interval must be between 15 and 1440 minutes');
    }
  }
  
  return errors;
}

/**
 * Save configuration
 */
async function saveConfiguration() {
  try {
    const config = getFormConfiguration();
    const errors = validateConfiguration(config);
    
    if (errors.length > 0) {
      showToast(errors.join(', '), 'error');
      return;
    }
    
    await StorageManager.saveConfig(config);
    currentConfig = config;
    
    // Update schedule alarm
    if (config.schedule.enabled) {
      await chrome.alarms.create('scraper', {
        periodInMinutes: config.schedule.intervalMinutes
      });
    } else {
      await chrome.alarms.clear('scraper');
    }
    
    showToast('Settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving configuration:', error);
    showToast('Failed to save settings', 'error');
  }
}

/**
 * Reset to default configuration
 */
async function resetConfiguration() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    return;
  }
  
  const defaultConfig = StorageManager.getDefaultConfig();
  await StorageManager.saveConfig(defaultConfig);
  currentConfig = defaultConfig;
  populateForm(defaultConfig);
  showToast('Settings reset to defaults');
}

/**
 * Load and display history
 */
async function loadHistory() {
  const postedProfiles = await StorageManager.getPostedProfiles();
  const profilesArray = Object.entries(postedProfiles).map(([id, data]) => ({
    id,
    ...data
  }));
  
  // Sort by posted date (newest first)
  profilesArray.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  
  if (profilesArray.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No profiles posted yet</p>
      </div>
    `;
    return;
  }
  
  elements.historyList.innerHTML = profilesArray.map(profile => `
    <div class="history-item">
      <div class="history-profile">
        ${profile.avatar_url ? `<img src="${profile.avatar_url}" alt="${profile.username}" class="history-avatar">` : ''}
        <div class="history-info">
          <span class="history-username">@${profile.username}</span>
          <div class="history-stats">
            ${formatNumber(profile.follower_count || profile.followerCount || 0)} followers
          </div>
        </div>
      </div>
      <div class="history-date">${formatRelativeTime(profile.postedAt)}</div>
    </div>
  `).join('');
}

/**
 * Setup navigation
 */
function setupNavigation() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
}

/**
 * Switch to a specific tab
 */
function switchTab(tabName) {
  // Update navigation
  elements.navItems.forEach(item => {
    if (item.dataset.tab === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update content
  elements.tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  // Update title
  const titles = {
    general: 'General Settings',
    tiktok: 'TikTok Configuration',
    discord: 'Discord Integration',
    filtering: 'Profile Filtering',
    schedule: 'Automatic Scheduling',
    history: 'Posted Profiles History',
    advanced: 'Advanced Settings'
  };
  
  elements.pageTitle.textContent = titles[tabName] || 'Settings';
  
  // Update URL hash
  window.location.hash = tabName;
}

/**
 * Toggle Discord mode (bot vs webhook)
 */
function toggleDiscordMode() {
  if (elements.useWebhook.checked) {
    elements.botTokenSection.style.display = 'none';
    elements.webhookSection.style.display = 'block';
  } else {
    elements.botTokenSection.style.display = 'block';
    elements.webhookSection.style.display = 'none';
  }
}

/**
 * Toggle schedule section
 */
function toggleScheduleSection() {
  elements.intervalSection.style.display = elements.scheduleEnabled.checked ? 'block' : 'none';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  elements.toastMessage.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.style.display = 'block';
  
  setTimeout(() => {
    elements.toast.style.display = 'none';
  }, 3000);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save button
  elements.saveBtn.addEventListener('click', saveConfiguration);
  
  // Reset button
  elements.resetBtn.addEventListener('click', resetConfiguration);
  
  // Discord mode toggle
  elements.useWebhook.addEventListener('change', toggleDiscordMode);
  
  // Schedule toggle
  elements.scheduleEnabled.addEventListener('change', toggleScheduleSection);
  
  // Test connections
  elements.testConnectionBtn.addEventListener('click', testTikTokConnection);
  elements.testDiscordBtn.addEventListener('click', testDiscordConnection);
  
  // Data management
  elements.exportDataBtn.addEventListener('click', exportData);
  elements.importDataBtn.addEventListener('click', () => elements.importFileInput.click());
  elements.importFileInput.addEventListener('change', importData);
  
  // History
  elements.clearHistoryBtn.addEventListener('click', clearHistory);
  
  // Advanced
  elements.viewStorageBtn.addEventListener('click', viewStorageData);
  elements.clearAllDataBtn.addEventListener('click', clearAllData);
  
  // Help links
  elements.msTokenHelpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/headknod-art/tiktok-discord-scraper#getting-ms-token' });
  });
}

/**
 * Test TikTok connection
 */
async function testTikTokConnection() {
  showToast('Testing TikTok connection...', 'info');
  // TODO: Implement actual test
  setTimeout(() => {
    showToast('TikTok connection test not yet implemented');
  }, 1000);
}

/**
 * Test Discord connection
 */
async function testDiscordConnection() {
  showToast('Testing Discord connection...', 'info');
  // TODO: Implement actual test
  setTimeout(() => {
    showToast('Discord connection test not yet implemented');
  }, 1000);
}

/**
 * Export data
 */
async function exportData() {
  try {
    const data = await StorageManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiktok-discord-scraper-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export data', 'error');
  }
}

/**
 * Import data
 */
async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await StorageManager.importData(data);
    await loadConfiguration();
    await loadHistory();
    showToast('Data imported successfully');
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import data', 'error');
  }
}

/**
 * Clear history
 */
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all posted profiles history?')) {
    return;
  }
  
  await StorageManager.clearPostedProfiles();
  await loadHistory();
  showToast('History cleared');
}

/**
 * View storage data
 */
async function viewStorageData() {
  const data = await StorageManager.exportData();
  console.log('Storage Data:', data);
  alert('Storage data has been logged to the console. Press F12 to view.');
}

/**
 * Clear all data
 */
async function clearAllData() {
  if (!confirm('Are you sure you want to clear ALL data? This will remove your configuration, history, and statistics. This cannot be undone.')) {
    return;
  }
  
  if (!confirm('This is your last warning. All data will be permanently deleted. Continue?')) {
    return;
  }
  
  await StorageManager.clearAll();
  await loadConfiguration();
  await loadHistory();
  showToast('All data cleared');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
