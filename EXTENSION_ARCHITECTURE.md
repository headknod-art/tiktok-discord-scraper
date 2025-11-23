# Chrome Extension Architecture Design

## Overview

This document outlines the architecture for transforming the TikTok Discord Scraper into a Chrome browser extension with a clean, integrated UX/UI.

## Extension Components

### 1. Manifest (manifest.json)
Defines extension metadata, permissions, and component files using Manifest V3 (latest standard).

**Required Permissions:**
- `storage` - Save configuration and posted profiles
- `alarms` - Schedule periodic scraping
- `notifications` - Notify users of successful posts or errors
- `activeTab` - Access TikTok pages when user is viewing them

### 2. Background Service Worker (background.js)
Handles the core scraping and posting logic in the background.

**Responsibilities:**
- Execute scheduled scraping tasks
- Manage TikTok API interactions
- Handle Discord posting via webhook or bot token
- Store posted profiles to prevent duplicates
- Send notifications to user
- Manage state and error recovery

### 3. Popup UI (popup.html/popup.js/popup.css)
Main user interface accessed by clicking the extension icon.

**Features:**
- Dashboard showing recent activity
- Quick actions (Run Now, View History, Settings)
- Status indicator (idle, running, error)
- Statistics (profiles scraped, posts made, last run time)
- Clean, modern design with TikTok/Discord branding colors

### 4. Options Page (options.html/options.js/options.css)
Full configuration interface for detailed settings.

**Configuration Sections:**
- **TikTok Settings:** ms_token input, trending count
- **Discord Settings:** Bot token or webhook URL, channel ID
- **Filtering Options:** Min followers, engagement rate, verification status
- **Schedule Settings:** Enable/disable auto-run, interval selection
- **Advanced Options:** Logging level, database management
- **Import/Export:** Backup and restore settings

### 5. Content Script (content.js) - Optional
Injects into TikTok pages to enhance scraping capabilities.

**Potential Features:**
- Extract additional profile data not available via API
- Visual indicators on trending profiles
- Quick-add profiles to posting queue

## Data Flow

```
User Action (Popup/Options)
    ↓
Background Service Worker
    ↓
TikTok Scraping (via API or Content Script)
    ↓
Data Processing & Filtering
    ↓
Duplicate Check (Chrome Storage)
    ↓
Discord Posting (via Bot or Webhook)
    ↓
Update Storage & UI
    ↓
Notify User
```

## Storage Structure

Using `chrome.storage.local` for persistent data:

```javascript
{
  config: {
    tiktok: {
      msToken: "encrypted_token",
      trendingCount: 50
    },
    discord: {
      botToken: "encrypted_token",
      channelId: "123456789",
      useWebhook: false,
      webhookUrl: ""
    },
    filtering: {
      minFollowers: 100000,
      minEngagementRate: 0,
      verifiedOnly: false
    },
    schedule: {
      enabled: true,
      intervalMinutes: 60
    }
  },
  postedProfiles: {
    "profile_id_1": {
      username: "user1",
      postedAt: "2025-11-22T10:00:00Z",
      followerCount: 500000
    }
  },
  statistics: {
    totalScraped: 150,
    totalPosted: 45,
    lastRun: "2025-11-22T10:00:00Z",
    errors: 2
  }
}
```

## UI/UX Design Principles

### Color Scheme
- **Primary:** TikTok pink/red (#FE2C55)
- **Secondary:** Discord purple (#5865F2)
- **Background:** Clean white/light gray (#F8F9FA)
- **Text:** Dark gray (#2C2F33)
- **Success:** Green (#43B581)
- **Error:** Red (#F04747)

### Typography
- **Font Family:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Headings:** 16-20px, bold
- **Body:** 14px, regular
- **Labels:** 12px, medium

### Layout
- **Popup:** 400px width × 600px height
- **Options:** Full page with sidebar navigation
- **Spacing:** 16px grid system
- **Border Radius:** 8px for cards, 4px for inputs
- **Shadows:** Subtle elevation for depth

### Components
- Modern card-based layout
- Toggle switches for boolean options
- Progress indicators for running tasks
- Toast notifications for feedback
- Responsive design principles

## Technical Considerations

### Security
- Encrypt sensitive tokens before storage
- Use HTTPS for all API calls
- Validate all user inputs
- Implement CSP (Content Security Policy)
- Never expose tokens in logs or UI

### Performance
- Lazy load components
- Debounce user inputs
- Cache API responses when appropriate
- Minimize background script activity
- Use alarms instead of setInterval

### Error Handling
- Graceful degradation
- User-friendly error messages
- Automatic retry with exponential backoff
- Error logging for debugging
- Recovery suggestions in UI

### Browser Compatibility
- Target Chrome 88+ (Manifest V3 support)
- Test on Edge (Chromium-based)
- Consider Firefox compatibility (WebExtensions)

## Migration Strategy

### From Python to JavaScript
1. Port TikTok scraping logic to JavaScript
2. Replace discord.py with Discord API calls (fetch)
3. Convert SQLite to chrome.storage
4. Adapt async/await patterns
5. Implement browser-specific features

### Backward Compatibility
- Keep Python version in `/python-version/` directory
- Document differences in README
- Provide migration guide for existing users

## Development Phases

1. **Phase 1:** Create manifest and basic structure
2. **Phase 2:** Build popup UI with static content
3. **Phase 3:** Build options page with form handling
4. **Phase 4:** Implement background service worker
5. **Phase 5:** Port scraping logic to JavaScript
6. **Phase 6:** Implement storage and state management
7. **Phase 7:** Add scheduling and notifications
8. **Phase 8:** Testing and refinement
