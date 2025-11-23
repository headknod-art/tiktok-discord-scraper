# TikTok to Discord Scraper - Python Version

This is the original Python implementation of the TikTok to Discord scraper. It has been preserved for users who prefer command-line tools or need to run the scraper on servers.

## Features

- Scrapes trending TikTok profiles using the unofficial TikTokApi
- Filters profiles based on minimum follower count
- Posts profiles to Discord as threaded messages with rich embeds
- Modular design for easy extension to other platforms

## Prerequisites

- Python 3.9 or higher
- A Discord Bot Token and Channel ID
- A TikTok `ms_token` (highly recommended)

## Installation

1. **Navigate to the python-version directory**
   ```bash
   cd python-version
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers**
   ```bash
   python -m playwright install
   ```

## Configuration

Set the following environment variables:

```bash
export TIKTOK_MS_TOKEN="your_ms_token_here"
export DISCORD_BOT_TOKEN="your_bot_token_here"
export DISCORD_CHANNEL_ID="your_channel_id_here"
export MIN_FOLLOWERS="100000"
```

Or create a `.env` file in the python-version directory:

```env
TIKTOK_MS_TOKEN=your_ms_token_here
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
MIN_FOLLOWERS=100000
```

## Usage

Run the scraper:

```bash
python main.py
```

The script will:
1. Scrape the top 50 trending videos from TikTok
2. Extract unique profile data
3. Filter profiles based on MIN_FOLLOWERS
4. Post each profile to Discord as a new thread

## Project Structure

```
python-version/
├── main.py                 # Main application runner
├── tiktok_scraper.py       # TikTok scraping module
├── discord_poster.py       # Discord posting module
├── data_processor.py       # Data filtering module
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Migrating to Extension

The Chrome extension version offers several advantages:

- **User-friendly UI**: No command-line knowledge required
- **Automated scheduling**: Run automatically at intervals
- **Better state management**: Track posted profiles across runs
- **Real-time monitoring**: See progress and statistics
- **Easy configuration**: Visual settings interface

To migrate your data:
1. Export your posted profiles list (if you've been tracking them)
2. Install the Chrome extension
3. Configure it with the same credentials
4. Import your data if needed

## Troubleshooting

See the main [README](../README.md) for troubleshooting tips.

## License

MIT License - see [LICENSE](../LICENSE) for details.
