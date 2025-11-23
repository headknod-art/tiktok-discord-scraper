/**
 * Data Processor Module
 * Handles filtering and processing of profile data
 */

import { createLogger } from './logger.js';
import { StorageManager } from './storage.js';

const logger = createLogger('DataProcessor');

export class DataProcessor {
  constructor(config) {
    this.config = config;
  }

  /**
   * Filter profiles based on configuration
   * @param {Array} profiles - Array of profile data
   * @returns {Promise<Array>} Filtered profiles
   */
  async filterProfiles(profiles) {
    logger.info(`Filtering ${profiles.length} profiles...`);
    
    let filtered = [...profiles];
    
    // Filter by minimum followers
    if (this.config.minFollowers > 0) {
      filtered = filtered.filter(p => {
        const followers = p.follower_count || p.followerCount || 0;
        return followers >= this.config.minFollowers;
      });
      logger.debug(`After min followers filter: ${filtered.length} profiles`);
    }
    
    // Filter by minimum engagement rate
    if (this.config.minEngagementRate > 0) {
      filtered = filtered.filter(p => {
        const rate = this.calculateEngagementRate(p);
        return rate >= this.config.minEngagementRate;
      });
      logger.debug(`After engagement rate filter: ${filtered.length} profiles`);
    }
    
    // Filter by verified status
    if (this.config.verifiedOnly) {
      filtered = filtered.filter(p => p.verified === true);
      logger.debug(`After verified filter: ${filtered.length} profiles`);
    }
    
    // Filter out already posted profiles
    if (this.config.excludePosted) {
      const postedProfiles = await StorageManager.getPostedProfiles();
      filtered = filtered.filter(p => {
        const profileId = p.id || p.username;
        return !postedProfiles[profileId];
      });
      logger.debug(`After posted filter: ${filtered.length} profiles`);
    }
    
    logger.info(`Filtering complete: ${filtered.length} profiles passed`);
    return filtered;
  }

  /**
   * Calculate engagement rate for a profile
   * @param {Object} profile - Profile data
   * @returns {number} Engagement rate percentage
   */
  calculateEngagementRate(profile) {
    const hearts = profile.heart_count || profile.heartCount || 0;
    const followers = profile.follower_count || profile.followerCount || 0;
    
    if (followers === 0) return 0;
    return (hearts / followers) * 100;
  }

  /**
   * Sort profiles by a specific metric
   * @param {Array} profiles - Array of profiles
   * @param {string} sortBy - Sort metric (followers, engagement, videos)
   * @param {string} order - Sort order (asc, desc)
   * @returns {Array} Sorted profiles
   */
  sortProfiles(profiles, sortBy = 'followers', order = 'desc') {
    const sorted = [...profiles];
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'followers':
          aValue = a.follower_count || a.followerCount || 0;
          bValue = b.follower_count || b.followerCount || 0;
          break;
        case 'engagement':
          aValue = this.calculateEngagementRate(a);
          bValue = this.calculateEngagementRate(b);
          break;
        case 'videos':
          aValue = a.video_count || a.videoCount || 0;
          bValue = b.video_count || b.videoCount || 0;
          break;
        case 'hearts':
          aValue = a.heart_count || a.heartCount || 0;
          bValue = b.heart_count || b.heartCount || 0;
          break;
        default:
          aValue = a.follower_count || a.followerCount || 0;
          bValue = b.follower_count || b.followerCount || 0;
      }
      
      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return sorted;
  }

  /**
   * Deduplicate profiles
   * @param {Array} profiles - Array of profiles
   * @returns {Array} Deduplicated profiles
   */
  deduplicateProfiles(profiles) {
    const seen = new Set();
    const unique = [];
    
    for (const profile of profiles) {
      const id = profile.id || profile.username;
      
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(profile);
      }
    }
    
    logger.debug(`Deduplicated ${profiles.length} to ${unique.length} profiles`);
    return unique;
  }

  /**
   * Normalize profile data structure
   * @param {Object} profile - Profile data
   * @returns {Object} Normalized profile
   */
  normalizeProfile(profile) {
    return {
      id: profile.id || profile.username,
      username: profile.username || profile.uniqueId,
      nickname: profile.nickname || profile.nickName || profile.username,
      bio: profile.bio || profile.signature || '',
      follower_count: profile.follower_count || profile.followerCount || 0,
      following_count: profile.following_count || profile.followingCount || 0,
      heart_count: profile.heart_count || profile.heartCount || 0,
      video_count: profile.video_count || profile.videoCount || 0,
      verified: profile.verified || false,
      profile_url: profile.profile_url || `https://www.tiktok.com/@${profile.username}`,
      avatar_url: profile.avatar_url || profile.avatarLarger || profile.avatarMedium || ''
    };
  }

  /**
   * Process a batch of profiles
   * @param {Array} profiles - Raw profiles
   * @returns {Promise<Array>} Processed profiles
   */
  async processProfiles(profiles) {
    logger.info(`Processing ${profiles.length} profiles...`);
    
    // Normalize all profiles
    let processed = profiles.map(p => this.normalizeProfile(p));
    
    // Deduplicate
    processed = this.deduplicateProfiles(processed);
    
    // Filter
    processed = await this.filterProfiles(processed);
    
    // Sort by followers (descending)
    processed = this.sortProfiles(processed, 'followers', 'desc');
    
    logger.info(`Processing complete: ${processed.length} profiles ready`);
    return processed;
  }

  /**
   * Generate statistics from profiles
   * @param {Array} profiles - Array of profiles
   * @returns {Object} Statistics object
   */
  generateStatistics(profiles) {
    if (profiles.length === 0) {
      return {
        count: 0,
        totalFollowers: 0,
        avgFollowers: 0,
        totalHearts: 0,
        avgHearts: 0,
        totalVideos: 0,
        avgVideos: 0,
        verifiedCount: 0,
        avgEngagementRate: 0
      };
    }
    
    const stats = {
      count: profiles.length,
      totalFollowers: 0,
      totalHearts: 0,
      totalVideos: 0,
      verifiedCount: 0,
      engagementRates: []
    };
    
    for (const profile of profiles) {
      stats.totalFollowers += profile.follower_count || 0;
      stats.totalHearts += profile.heart_count || 0;
      stats.totalVideos += profile.video_count || 0;
      
      if (profile.verified) {
        stats.verifiedCount++;
      }
      
      stats.engagementRates.push(this.calculateEngagementRate(profile));
    }
    
    stats.avgFollowers = Math.round(stats.totalFollowers / profiles.length);
    stats.avgHearts = Math.round(stats.totalHearts / profiles.length);
    stats.avgVideos = Math.round(stats.totalVideos / profiles.length);
    stats.avgEngagementRate = stats.engagementRates.reduce((a, b) => a + b, 0) / profiles.length;
    
    delete stats.engagementRates; // Remove temporary array
    
    return stats;
  }
}

/**
 * Create a data processor instance
 * @param {Object} config - Configuration object
 * @returns {DataProcessor} Processor instance
 */
export function createProcessor(config) {
  return new DataProcessor(config);
}
