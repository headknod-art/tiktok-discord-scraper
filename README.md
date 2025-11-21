# TikTok to Discord Trending Profile Scraper

This is a modular Python application designed to scrape trending TikTok profiles and automatically post them as new threads in a specified Discord channel.

## Features

*   **TikTok Scraping:** Uses the unofficial `TikTokApi` to fetch data on trending videos and extract associated profile information.
*   **Data Filtering:** Filters profiles based on a configurable minimum follower count.
*   **Discord Integration:** Creates a new thread for each trending profile in a target Discord channel, complete with a rich embed containing profile details, stats, and a link.
*   **Modular Design:** Separate modules for scraping, data processing, and Discord posting for easy maintenance and future expansion to other social media platforms.

## Prerequisites

*   Python 3.9+
*   A Discord Bot Token and the ID of the channel where threads should be created.
*   A TikTok `ms_token` for reliable scraping (highly recommended).

## Setup

1.  **Clone the repository (or create the files):**
    \`\`\`bash
    # Assuming you have the files in a directory named 'tiktok_discord_scraper'
    cd tiktok_discord_scraper
    \`\`\`

2.  **Install Dependencies:**
    The project uses `TikTokApi` for scraping and `discord.py` for posting.

    \`\`\`bash
    pip install -r requirements.txt
    \`\`\`

3.  **Install Playwright Browsers:**
    The `TikTokApi` uses Playwright for browser automation to bypass some of TikTok's anti-scraping measures.

    \`\`\`bash
    python -m playwright install
    \`\`\`

## Configuration

The application is configured entirely through environment variables. You **MUST** set the following variables before running the script.

| Variable Name | Description | Required | Example Value |
| :--- | :--- | :--- | :--- |
| \`TIKTOK_MS_TOKEN\` | A valid \`ms_token\` cookie value from a logged-in TikTok session. This is crucial for reliable scraping. | Recommended | \`ms_token=abcdefg1234567890\` |
| \`DISCORD_BOT_TOKEN\` | The secret token for your Discord bot. The bot must have the necessary permissions (read messages, send messages, manage threads). | Yes | \`MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.ABCDEF.abcdefghijklmnop\` |
| \`DISCORD_CHANNEL_ID\` | The ID of the Discord channel where the new threads will be created. | Yes | \`123456789012345678\` |
| \`MIN_FOLLOWERS\` | The minimum number of followers a profile must have to be posted to Discord. | No (Default: 100000) | \`50000\` |

**How to set environment variables (Linux/macOS):**

\`\`\`bash
export TIKTOK_MS_TOKEN="your_ms_token_here"
export DISCORD_BOT_TOKEN="your_bot_token_here"
export DISCORD_CHANNEL_ID="your_channel_id_here"
export MIN_FOLLOWERS="100000"
\`\`\`

## Usage

Run the main script using Python:

\`\`\`bash
python main.py
\`\`\`

The script will execute the following steps:
1.  Scrape the top 50 trending videos from TikTok.
2.  Extract unique profile data from the video authors.
3.  Filter the profiles based on the \`MIN_FOLLOWERS\` setting.
4.  For each filtered profile, it will log into Discord, create a new thread in the specified channel, and post a rich embed with the profile details.

## Project Structure

\`\`\`
tiktok_discord_scraper/
├── main.py                 # Main application runner and orchestrator
├── tiktok_scraper.py       # Module for fetching data from TikTok
├── discord_poster.py       # Module for posting data to Discord
├── data_processor.py       # Module for filtering and transforming data
├── requirements.txt        # Project dependencies
└── README.md               # This documentation file
\`\`\`

## Extending to Other Platforms

The modular design makes it easy to extend this to other social media platforms (e.g., X/Twitter, Instagram, YouTube).

1.  Create a new scraper module (e.g., \`twitter_scraper.py\`) that returns a list of profile dictionaries in the same format as \`tiktok_scraper.py\`.
2.  Update \`main.py\` to call the new scraper module.
3.  Update \`data_processor.py\` if platform-specific filtering is needed.
4.  The \`discord_poster.py\` module should work without changes, as it relies on the standardized profile dictionary format.
\`\`\`
