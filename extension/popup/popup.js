/**
 * Popup UI Controller
 */

import { StorageManager } from '../lib/storage.js';
import { formatNumber, formatRelativeTime, sanitizeHTML } from '../lib/utils.js';

// DOM Elements
const elements = {
  // Status
  statusBadge: document.getElementById('statusBadge'),
  statusIndicator: document.querySelector('.status-indicator'),
  statusText: document.querySelector('.status-text'),
  
  // Stats
  statScraped: document.getElementById('statScraped'),
  statPosted: document.getElementById('statPosted'),
  statErrors: document.getElementById('statErrors'),
  
  // Info
  lastRun: document.getElementById('lastRun'),
  lastSuccess: document.getElementById('lastSuccess'),
  autoRunBadge: document.getElementById('autoRunBadge'),
  
  // Activity
  activityCard: document.getElementById('activityCard'),
  activityPhase: document.getElementById('activityPhase'),
  progressFill: document.getElementById('progressFill'),
  
  // Error
  errorCard: document.getElementById('errorCard'),
  errorMessage: document.getElementById('errorMessage'),
  dismissErrorBtn: document.getElementById('dismissErrorBtn'),
  
  // Buttons
  runNowBtn: document.getElementById('runNowBtn'),
  viewHistoryBtn: document.getElementById('viewHistoryBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  quickSetupBtn: document.getElementById('quickSetupBtn'),
  
  // Config Status
  tiktokTokenStatus: document.getElementById('tiktokTokenStatus'),
  discordTokenStatus: document.getElementById('discordTokenStatus'),
  channelIdStatus: document.getElementById('channelIdStatus'),
  
  // Links
  docsLink: document.getElementById('docsLink'),
  githubLink: document.getElementById('githubLink'),
  supportLink: document.getElementById('supportLink')
};

/**
 * Initialize popup
 */
async function init() {
  await loadData();
  setupEventListeners();
  setupMessageListener();
  
  // Refresh data every 2 seconds when popup is open
  setInterval(loadData, 2000);
}

/**
 * Load and display data
 */
async function loadData() {
  try {
    // Load statistics
    const stats = await StorageManager.getStatistics();
    elements.statScraped.textContent = formatNumber(stats.totalScraped);
    elements.statPosted.textContent = formatNumber(stats.totalPosted);
    elements.statErrors.textContent = formatNumber(stats.totalErrors);
    elements.lastRun.textContent = formatRelativeTime(stats.lastRun);
    elements.lastSuccess.textContent = formatRelativeTime(stats.lastSuccess);
    
    // Load configuration
    const config = await StorageManager.getConfig();
    updateConfigStatus(config);
    
    // Update auto-run badge
    if (config.schedule.enabled) {
      elements.autoRunBadge.textContent = `Every ${config.schedule.intervalMinutes}m`;
      elements.autoRunBadge.className = 'badge badge-success';
    } else {
      elements.autoRunBadge.textContent = 'Disabled';
      elements.autoRunBadge.className = 'badge badge-secondary';
    }
    
    // Load state
    const state = await StorageManager.getState();
    updateStatus(state);
    
    // Show/hide error card
    if (state.lastError) {
      elements.errorCard.style.display = 'block';
      elements.errorMessage.textContent = state.lastError;
    } else {
      elements.errorCard.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Update configuration status badges
 */
function updateConfigStatus(config) {
  // TikTok Token
  if (config.tiktok.msToken) {
    elements.tiktokTokenStatus.textContent = '✓ Set';
    elements.tiktokTokenStatus.className = 'badge badge-success';
  } else {
    elements.tiktokTokenStatus.textContent = 'Not Set';
    elements.tiktokTokenStatus.className = 'badge badge-error';
  }
  
  // Discord Token
  if (config.discord.botToken || config.discord.webhookUrl) {
    elements.discordTokenStatus.textContent = '✓ Set';
    elements.discordTokenStatus.className = 'badge badge-success';
  } else {
    elements.discordTokenStatus.textContent = 'Not Set';
    elements.discordTokenStatus.className = 'badge badge-error';
  }
  
  // Channel ID
  if (config.discord.channelId) {
    elements.channelIdStatus.textContent = '✓ Set';
    elements.channelIdStatus.className = 'badge badge-success';
  } else {
    elements.channelIdStatus.textContent = 'Not Set';
    elements.channelIdStatus.className = 'badge badge-error';
  }
}

/**
 * Update status display
 */
function updateStatus(state) {
  if (state.isRunning) {
    elements.statusIndicator.className = 'status-indicator status-running';
    elements.statusText.textContent = 'Running';
    elements.activityCard.style.display = 'block';
    elements.activityPhase.textContent = state.currentPhase || 'Processing...';
    elements.runNowBtn.disabled = true;
    
    // Update progress (mock progress for now)
    const progress = state.progress || 0;
    elements.progressFill.style.width = `${progress}%`;
  } else if (state.lastError) {
    elements.statusIndicator.className = 'status-indicator status-error';
    elements.statusText.textContent = 'Error';
    elements.activityCard.style.display = 'none';
    elements.runNowBtn.disabled = false;
  } else {
    elements.statusIndicator.className = 'status-indicator status-idle';
    elements.statusText.textContent = 'Idle';
    elements.activityCard.style.display = 'none';
    elements.runNowBtn.disabled = false;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Run Now button
  elements.runNowBtn.addEventListener('click', async () => {
    try {
      // Send message to background script to start scraping
      await chrome.runtime.sendMessage({ action: 'runNow' });
      
      // Update UI immediately
      await StorageManager.updateState({
        isRunning: true,
        currentPhase: 'Starting...',
        lastError: null
      });
      
      await loadData();
    } catch (error) {
      console.error('Error starting scraper:', error);
      alert('Failed to start scraper. Please check your configuration.');
    }
  });
  
  // View History button
  elements.viewHistoryBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#history') });
  });
  
  // Settings button
  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Quick Setup button
  elements.quickSetupBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Dismiss Error button
  elements.dismissErrorBtn.addEventListener('click', async () => {
    await StorageManager.updateState({ lastError: null });
    elements.errorCard.style.display = 'none';
  });
  
  // External links
  elements.docsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/headknod-art/tiktok-discord-scraper#readme' });
  });
  
  elements.githubLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/headknod-art/tiktok-discord-scraper' });
  });
  
  elements.supportLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/headknod-art/tiktok-discord-scraper/issues' });
  });
}

/**
 * Setup message listener for updates from background script
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'stateUpdate') {
      loadData();
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
