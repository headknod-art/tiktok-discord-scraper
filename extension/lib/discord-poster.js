/**
 * Discord Poster Module
 * Handles posting profile data to Discord via bot or webhook
 */

import { createLogger } from './logger.js';
import { retryWithBackoff } from './utils.js';

const logger = createLogger('DiscordPoster');

export class DiscordPoster {
  constructor(config) {
    this.config = config;
    this.useWebhook = config.useWebhook;
    this.botToken = config.botToken;
    this.channelId = config.channelId;
    this.webhookUrl = config.webhookUrl;
  }

  /**
   * Post a profile to Discord
   * @param {Object} profile - Profile data
   * @returns {Promise<boolean>} Success status
   */
  async postProfile(profile) {
    logger.info(`Posting profile @${profile.username} to Discord`);
    
    try {
      if (this.useWebhook) {
        return await this.postViaWebhook(profile);
      } else {
        return await this.postViaBot(profile);
      }
    } catch (error) {
      logger.error(`Failed to post profile @${profile.username}:`, error);
      throw error;
    }
  }

  /**
   * Post via Discord webhook
   * @param {Object} profile - Profile data
   * @returns {Promise<boolean>} Success status
   */
  async postViaWebhook(profile) {
    const embed = this.createEmbed(profile);
    
    const payload = {
      embeds: [embed],
      username: 'TikTok Trending Tracker',
      avatar_url: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png'
    };
    
    const response = await retryWithBackoff(async () => {
      return await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook error: ${response.status} - ${errorText}`);
    }
    
    logger.info(`Successfully posted @${profile.username} via webhook`);
    return true;
  }

  /**
   * Post via Discord bot
   * @param {Object} profile - Profile data
   * @returns {Promise<boolean>} Success status
   */
  async postViaBot(profile) {
    // Create a thread in the channel
    const threadName = `@${profile.username} - ${this.formatNumber(profile.follower_count)} Followers`;
    
    // Create thread
    const thread = await this.createThread(threadName);
    
    if (!thread) {
      throw new Error('Failed to create thread');
    }
    
    // Send message to thread
    const embed = this.createEmbed(profile);
    await this.sendMessage(thread.id, { embeds: [embed] });
    
    logger.info(`Successfully posted @${profile.username} via bot`);
    return true;
  }

  /**
   * Create a thread in the channel
   * @param {string} name - Thread name
   * @returns {Promise<Object>} Thread object
   */
  async createThread(name) {
    const url = `https://discord.com/api/v10/channels/${this.channelId}/threads`;
    
    const payload = {
      name: name.substring(0, 100), // Discord limit
      auto_archive_duration: 60,
      type: 11, // Public thread
      reason: 'New trending TikTok profile detected'
    };
    
    const response = await retryWithBackoff(async () => {
      return await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create thread: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Send a message to a channel or thread
   * @param {string} channelId - Channel/thread ID
   * @param {Object} payload - Message payload
   * @returns {Promise<Object>} Message object
   */
  async sendMessage(channelId, payload) {
    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    
    const response = await retryWithBackoff(async () => {
      return await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Create a Discord embed from profile data
   * @param {Object} profile - Profile data
   * @returns {Object} Discord embed object
   */
  createEmbed(profile) {
    return {
      title: `New Trending Profile: @${profile.username}`,
      url: profile.profile_url,
      description: profile.bio || 'No bio provided.',
      color: 0xFE2C55, // TikTok pink
      thumbnail: {
        url: profile.avatar_url
      },
      fields: [
        {
          name: 'Followers',
          value: this.formatNumber(profile.follower_count),
          inline: true
        },
        {
          name: 'Total Likes',
          value: this.formatNumber(profile.heart_count),
          inline: true
        },
        {
          name: 'Total Videos',
          value: this.formatNumber(profile.video_count),
          inline: true
        },
        {
          name: 'Following',
          value: this.formatNumber(profile.following_count),
          inline: true
        },
        {
          name: 'Verified',
          value: profile.verified ? '✓ Yes' : '✗ No',
          inline: true
        },
        {
          name: 'Engagement Rate',
          value: this.calculateEngagementRate(profile.heart_count, profile.follower_count) + '%',
          inline: true
        }
      ],
      footer: {
        text: `Nickname: ${profile.nickname}`
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  }

  /**
   * Calculate engagement rate
   * @param {number} hearts - Total hearts/likes
   * @param {number} followers - Follower count
   * @returns {string} Engagement rate percentage
   */
  calculateEngagementRate(hearts, followers) {
    if (!followers || followers === 0) return '0.00';
    return ((hearts / followers) * 100).toFixed(2);
  }

  /**
   * Test connection to Discord
   * @returns {Promise<boolean>} Success status
   */
  async testConnection() {
    logger.info('Testing Discord connection...');
    
    try {
      if (this.useWebhook) {
        // Test webhook by sending a test message
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: '✅ Test message from TikTok Discord Scraper',
            username: 'TikTok Trending Tracker'
          })
        });
        
        return response.ok;
      } else {
        // Test bot by getting channel info
        const url = `https://discord.com/api/v10/channels/${this.channelId}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bot ${this.botToken}`
          }
        });
        
        return response.ok;
      }
    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Create a Discord poster instance
 * @param {Object} config - Configuration object
 * @returns {DiscordPoster} Poster instance
 */
export function createPoster(config) {
  return new DiscordPoster(config);
}
