# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-22

### Added
- **Chrome Extension**: Complete rewrite as a browser extension
- **Modern UI**: Clean popup and options pages with TikTok/Discord branding
- **Real-time Monitoring**: Live progress updates and statistics
- **Automated Scheduling**: Run scraper at configurable intervals
- **Duplicate Detection**: Track posted profiles to avoid reposts
- **History Tracking**: View all previously posted profiles
- **Import/Export**: Backup and restore configuration
- **Webhook Support**: Option to use Discord webhooks instead of bot
- **Advanced Filtering**: Filter by engagement rate and verification status
- **Error Handling**: Robust retry logic with exponential backoff
- **Logging System**: Configurable logging levels for debugging
- **Modular Architecture**: Clean separation of concerns

### Changed
- Migrated from Python to JavaScript for browser extension
- Improved error messages and user feedback
- Enhanced Discord embeds with more profile information
- Better rate limit handling for both TikTok and Discord APIs

### Deprecated
- Python version moved to `python-version/` directory (still functional)

### Fixed
- Rate limiting issues with Discord API
- TikTok scraping reliability
- Memory leaks in long-running processes

## [1.0.0] - 2024-XX-XX

### Added
- Initial Python implementation
- TikTok trending profile scraping
- Discord bot integration
- Basic filtering by follower count
- Modular design for extensibility

---

## Version History

- **2.0.0**: Chrome Extension Release
- **1.0.0**: Initial Python Release
