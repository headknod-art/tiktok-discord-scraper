# TikTok to Discord Trending Profile Scraper

A powerful Chrome browser extension that automatically scrapes trending TikTok profiles and posts them to Discord channels. Features a clean, modern UI with comprehensive configuration options and automated scheduling.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-orange)

## Features

### Core Functionality
- **Automated TikTok Scraping**: Fetches trending videos and extracts profile information
- **Smart Filtering**: Filter profiles by followers, engagement rate, verification status
- **Discord Integration**: Post to Discord via bot or webhook with rich embeds
- **Duplicate Detection**: Tracks posted profiles to avoid duplicates
- **Scheduled Runs**: Automatically run at configurable intervals

### User Interface
- **Clean Modern Design**: Intuitive popup and options pages with TikTok/Discord branding
- **Real-time Status**: Live updates on scraping progress and statistics
- **Comprehensive Settings**: Full control over scraping, filtering, and posting behavior
- **History Tracking**: View all previously posted profiles
- **Import/Export**: Backup and restore your configuration

### Technical Features
- **Manifest V3**: Built with the latest Chrome extension standards
- **Modular Architecture**: Clean separation of concerns for maintainability
- **Error Handling**: Robust retry logic with exponential backoff
- **Logging System**: Configurable logging levels for debugging
- **Type Safety**: Well-documented code with clear interfaces

## Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/headknod-art/tiktok-discord-scraper.git
   cd tiktok-discord-scraper
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `extension` folder from this repository

3. **Configure the extension**
   - Click the extension icon in your toolbar
   - Click "Quick Setup" or "Settings"
   - Enter your TikTok ms_token and Discord credentials
   - Configure filtering and scheduling options
   - Click "Save Changes"

## Configuration

### Getting Your TikTok ms_token

The `ms_token` is required for reliable TikTok scraping:

1. Log into [TikTok](https://www.tiktok.com) in your browser
2. Open Developer Tools (F12)
3. Go to the "Application" tab
4. Navigate to "Cookies" → "https://www.tiktok.com"
5. Find the cookie named `msToken`
6. Copy its value and paste it into the extension settings

**Note**: The ms_token may expire periodically. If scraping fails, try updating it.

### Discord Setup

You have two options for Discord integration:

#### Option 1: Discord Bot (Recommended)

**Advantages**: Can create threads, more control, better formatting

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under "Token", click "Copy" to get your bot token
5. Enable these Privileged Gateway Intents:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`
8. Select bot permissions: `Send Messages`, `Create Public Threads`, `Send Messages in Threads`
9. Copy the generated URL and open it to invite the bot to your server
10. Get your channel ID:
    - Enable Developer Mode in Discord (User Settings → Advanced)
    - Right-click the channel and select "Copy ID"

#### Option 2: Discord Webhook (Simpler)

**Advantages**: Easier setup, no bot required

**Limitations**: Cannot create threads, posts directly to channel

1. Go to your Discord server
2. Right-click the channel → "Edit Channel"
3. Go to "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Give it a name and copy the webhook URL
6. Paste the URL into the extension settings

### Filtering Options

Configure which profiles get posted to Discord:

| Setting | Description | Default |
|---------|-------------|---------|
| **Minimum Followers** | Only post profiles with at least this many followers | 100,000 |
| **Minimum Engagement Rate** | Minimum likes/followers ratio (percentage) | 0 (disabled) |
| **Verified Only** | Only post verified (blue checkmark) accounts | Off |
| **Exclude Posted** | Skip profiles that have already been posted | On |

### Scheduling

Enable automatic scraping at regular intervals:

1. Go to Settings → Schedule
2. Toggle "Enable Auto-Run"
3. Set the interval (15-1440 minutes)
4. Click "Save Changes"

The extension will run in the background at the specified interval.

## Usage

### Manual Run

1. Click the extension icon in your toolbar
2. Click the "Run Now" button
3. Monitor progress in the popup

### Viewing History

1. Click the extension icon
2. Click "View History"
3. Browse all previously posted profiles

### Exporting Data

1. Go to Settings → General
2. Click "Export Data"
3. Save the JSON file as a backup

### Importing Data

1. Go to Settings → General
2. Click "Import Data"
3. Select your previously exported JSON file

## Project Structure

```
tiktok-discord-scraper/
├── extension/                  # Chrome extension files
│   ├── manifest.json          # Extension manifest (Manifest V3)
│   ├── background/            # Background service worker
│   │   └── service-worker.js # Main scraping orchestration
│   ├── popup/                 # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── options/               # Settings page
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── lib/                   # Core modules
│   │   ├── storage.js         # Chrome storage management
│   │   ├── logger.js          # Logging utility
│   │   ├── utils.js           # Helper functions
│   │   ├── tiktok-scraper.js  # TikTok API integration
│   │   ├── discord-poster.js  # Discord API integration
│   │   └── data-processor.js  # Profile filtering/processing
│   ├── styles/                # Shared styles
│   │   └── shared.css
│   └── icons/                 # Extension icons
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── python-version/            # Original Python implementation
│   ├── main.py
│   ├── tiktok_scraper.py
│   ├── discord_poster.py
│   └── data_processor.py
├── README.md                  # This file
├── .env.example              # Environment variables template
└── .gitignore                # Git ignore rules
```

## Python Version

The original Python implementation is preserved in the `python-version/` directory. See [Python README](python-version/README.md) for usage instructions.

## Troubleshooting

### Scraping Issues

**Problem**: "Failed to fetch trending profiles"

**Solutions**:
- Verify your TikTok ms_token is valid and up-to-date
- Check if TikTok is accessible in your region
- Try using a different browser engine in settings
- Check the console for detailed error messages (F12 → Console)

### Discord Posting Issues

**Problem**: "Failed to post to Discord"

**Solutions**:
- **Bot**: Verify the bot token is correct and the bot is in your server
- **Bot**: Ensure the bot has proper permissions (Send Messages, Create Threads)
- **Bot**: Verify the channel ID is correct
- **Webhook**: Check if the webhook URL is valid and not deleted
- Check Discord API status at [Discord Status](https://discordstatus.com)

### Extension Not Running

**Problem**: Scheduled runs not executing

**Solutions**:
- Ensure Chrome is running (extensions don't run when browser is closed)
- Check if the schedule is enabled in settings
- Verify the interval is set correctly (15-1440 minutes)
- Check the console logs for errors

### Performance Issues

**Problem**: Extension is slow or unresponsive

**Solutions**:
- Reduce the trending count (try 30 instead of 50)
- Increase the schedule interval
- Clear posted profiles history if it's very large
- Check if other extensions are conflicting

## Development

### Prerequisites

- Chrome 88+ (for Manifest V3 support)
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of Chrome Extension APIs

### Building from Source

No build step required! The extension uses vanilla JavaScript modules.

### Testing

1. Load the extension in developer mode
2. Open the popup and options pages
3. Check the console for any errors
4. Test manual runs with valid credentials
5. Verify Discord posts are created correctly

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Support for Instagram scraping
- [ ] Support for Twitter/X scraping
- [ ] Advanced analytics dashboard
- [ ] Custom profile templates
- [ ] Multi-channel posting
- [ ] Profile comparison tools
- [ ] Export to CSV/Excel
- [ ] Firefox extension support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational and research purposes only. Please respect TikTok's Terms of Service and rate limits. Use responsibly and at your own risk.

## Support

- **Issues**: [GitHub Issues](https://github.com/headknod-art/tiktok-discord-scraper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/headknod-art/tiktok-discord-scraper/discussions)
- **Email**: support@headknod.art

## Acknowledgments

- TikTok for providing public trending data
- Discord for their excellent API
- The Chrome Extensions team for Manifest V3

---

**Made with ❤️ by [headknod-art](https://github.com/headknod-art)**
