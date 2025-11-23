/**
 * Background Service Worker
 * Handles scraping, processing, and posting in the background
 */

import { StorageManager } from '../lib/storage.js';
import { createLogger } from '../lib/logger.js';
import { createScraper } from '../lib/tiktok-scraper.js';
import { createPoster } from '../lib/discord-poster.js';
import { createProcessor } from '../lib/data-processor.js';
import { showNotification } from '../lib/utils.js';

const logger = createLogger('ServiceWorker');

// Track current run state
let isRunning = false;

/**
 * Initialize service worker
 */
async function init() {
  logger.info('Service worker initialized');
  
  // Set up alarm listener for scheduled runs
  chrome.alarms.onAlarm.addListener(handleAlarm);
  
  // Set up message listener for manual runs
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Check if we should set up the alarm
  const config = await StorageManager.getConfig();
  if (config.schedule.enabled) {
    await chrome.alarms.create('scraper', {
      periodInMinutes: config.schedule.intervalMinutes
    });
    logger.info(`Scheduled scraper to run every ${config.schedule.intervalMinutes} minutes`);
  }
}

/**
 * Handle alarm events
 */
async function handleAlarm(alarm) {
  if (alarm.name === 'scraper') {
    logger.info('Alarm triggered: running scraper');
    await runScraper();
  }
}

/**
 * Handle messages from popup/options
 */
function handleMessage(message, sender, sendResponse) {
  logger.debug('Received message:', message);
  
  if (message.action === 'runNow') {
    runScraper().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'getState') {
    StorageManager.getState().then(state => {
      sendResponse(state);
    });
    return true;
  }
}

/**
 * Main scraper function
 */
async function runScraper() {
  // Prevent concurrent runs
  if (isRunning) {
    logger.warning('Scraper is already running, skipping this run');
    return;
  }
  
  isRunning = true;
  
  try {
    await updateState({
      isRunning: true,
      currentPhase: 'Initializing...',
      lastError: null,
      progress: 0
    });
    
    logger.info('=== Starting scraper run ===');
    
    // Load configuration
    const config = await StorageManager.getConfig();
    
    // Validate configuration
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration. Please check your settings.');
    }
    
    // Phase 1: Scrape TikTok
    await updateState({ currentPhase: 'Scraping TikTok...', progress: 10 });
    const scraper = createScraper(config.tiktok);
    const rawProfiles = await scraper.getTrendingProfiles(config.tiktok.trendingCount);
    
    logger.info(`Scraped ${rawProfiles.length} profiles`);
    await StorageManager.incrementStat('totalScraped', rawProfiles.length);
    
    // Phase 2: Process and filter
    await updateState({ currentPhase: 'Processing profiles...', progress: 40 });
    const processor = createProcessor(config.filtering);
    const filteredProfiles = await processor.processProfiles(rawProfiles);
    
    logger.info(`${filteredProfiles.length} profiles passed filters`);
    
    if (filteredProfiles.length === 0) {
      logger.info('No profiles to post');
      await showNotification(
        'Scraper Complete',
        'No new profiles found matching your criteria',
        'info'
      );
      await finishRun(true);
      return;
    }
    
    // Phase 3: Post to Discord
    await updateState({ currentPhase: 'Posting to Discord...', progress: 60 });
    const poster = createPoster(config.discord);
    
    let posted = 0;
    let errors = 0;
    
    for (let i = 0; i < filteredProfiles.length; i++) {
      const profile = filteredProfiles[i];
      const progress = 60 + ((i / filteredProfiles.length) * 30);
      
      await updateState({
        currentPhase: `Posting @${profile.username} (${i + 1}/${filteredProfiles.length})...`,
        progress: Math.round(progress)
      });
      
      try {
        await poster.postProfile(profile);
        
        // Mark as posted
        await StorageManager.addPostedProfile(profile.id, {
          username: profile.username,
          follower_count: profile.follower_count,
          avatar_url: profile.avatar_url
        });
        
        posted++;
        await StorageManager.incrementStat('totalPosted');
        
        logger.info(`Posted @${profile.username} (${posted}/${filteredProfiles.length})`);
        
        // Small delay to avoid rate limits
        await sleep(2000);
        
      } catch (error) {
        logger.error(`Failed to post @${profile.username}:`, error);
        errors++;
        await StorageManager.incrementStat('totalErrors');
      }
    }
    
    // Phase 4: Complete
    await updateState({ currentPhase: 'Finalizing...', progress: 95 });
    
    logger.info(`=== Scraper run complete: ${posted} posted, ${errors} errors ===`);
    
    // Show notification
    await showNotification(
      'Scraper Complete',
      `Posted ${posted} new profile${posted !== 1 ? 's' : ''} to Discord${errors > 0 ? ` (${errors} error${errors !== 1 ? 's' : ''})` : ''}`,
      errors > 0 ? 'warning' : 'success'
    );
    
    await finishRun(true);
    
  } catch (error) {
    logger.error('Scraper run failed:', error);
    
    await updateState({
      isRunning: false,
      currentPhase: null,
      lastError: error.message,
      progress: 0
    });
    
    await StorageManager.incrementStat('totalErrors');
    
    await showNotification(
      'Scraper Failed',
      error.message,
      'error'
    );
    
    await finishRun(false);
    
  } finally {
    isRunning = false;
  }
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  // Check TikTok config
  if (!config.tiktok.msToken) {
    logger.warning('TikTok ms_token not set - scraping may be unreliable');
  }
  
  // Check Discord config
  if (config.discord.useWebhook) {
    if (!config.discord.webhookUrl) {
      logger.error('Discord webhook URL not set');
      return false;
    }
  } else {
    if (!config.discord.botToken || !config.discord.channelId) {
      logger.error('Discord bot token or channel ID not set');
      return false;
    }
  }
  
  return true;
}

/**
 * Update state and notify UI
 */
async function updateState(updates) {
  await StorageManager.updateState(updates);
  
  // Notify popup to refresh
  try {
    await chrome.runtime.sendMessage({ action: 'stateUpdate' });
  } catch (error) {
    // Popup might not be open, ignore error
  }
}

/**
 * Finish run and update statistics
 */
async function finishRun(success) {
  const now = new Date().toISOString();
  
  await StorageManager.updateStatistics({
    lastRun: now,
    ...(success && { lastSuccess: now })
  });
  
  await updateState({
    isRunning: false,
    currentPhase: null,
    progress: 100
  });
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on load
init();
