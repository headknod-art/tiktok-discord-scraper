# TikTok to Discord Scraper Architecture Design

## 1. Goal
To create a modular, flexible, and reliable Python application that scrapes trending profile data from TikTok and posts the information as new threads in a specified Discord channel.

## 2. Architecture Overview
The application will follow a **modular, event-driven architecture** consisting of three main components:
1.  **Scraper Module (`tiktok_scraper.py`):** Responsible for fetching raw data from TikTok.
2.  **Data Processor Module (`data_processor.py`):** Responsible for cleaning, transforming, and filtering the raw data.
3.  **Discord Integration Module (`discord_poster.py`):** Responsible for connecting to Discord and posting the processed data.
4.  **Main Runner (`main.py`):** Orchestrates the flow, handles configuration, and manages the execution schedule.

## 3. Data Flow

1.  **Configuration Loading:** `main.py` loads environment variables (e.g., `DISCORD_BOT_TOKEN`, `TIKTOK_MS_TOKEN`, `DISCORD_CHANNEL_ID`).
2.  **Scraping:** `main.py` calls the `tiktok_scraper.py` module's main function.
    *   `tiktok_scraper.py` uses the `TikTokApi` to fetch a list of trending videos.
    *   It extracts the **profile data** (username, bio, follower count, etc.) from the video objects.
    *   It returns a list of unique profile data dictionaries.
3.  **Processing:** `main.py` passes the raw profile data to `data_processor.py`.
    *   `data_processor.py` performs deduplication (to ensure each profile is only processed once per run).
    *   It filters the profiles based on a defined criteria (e.g., minimum follower count, recent activity - to be defined in configuration).
    *   It formats the data into a structured object suitable for the Discord embed/message.
4.  **Posting:** `main.py` passes the formatted data to `discord_poster.py`.
    *   `discord_poster.py` connects to Discord using `discord.py`.
    *   For each profile, it creates a new thread in the target channel.
    *   The initial message in the thread will contain a rich embed with the profile's details (username, link, stats, bio).

## 4. Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Language** | Python 3.11+ | Application logic and orchestration. |
| **TikTok Scraping** | `TikTokApi` (with `playwright`) | Unofficial API wrapper for fetching trending data. |
| **Discord Integration** | `discord.py` | Official Python library for interacting with the Discord API. |
| **Configuration** | Environment Variables (`os.environ`) | Securely manage sensitive tokens and IDs. |
| **Execution** | `asyncio` | Handle asynchronous operations required by both `TikTokApi` and `discord.py`. |

## 5. Required Configuration (Environment Variables)

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `DISCORD_BOT_TOKEN` | The secret token for the Discord bot. | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.ABCDEF.abcdefghijklmnop` |
| `DISCORD_CHANNEL_ID` | The ID of the Discord channel to post threads in. | `123456789012345678` |
| `TIKTOK_MS_TOKEN` | A valid `ms_token` cookie value from TikTok for scraping. | `ms_token=abcdefg1234567890` |
| `MIN_FOLLOWERS` | Minimum follower count for a profile to be considered "trending". | `10000` |

## 6. Implementation Plan (Phase 3 & 4)

1.  **Setup:** Create project directory and install dependencies (`TikTokApi`, `discord.py`, `playwright`).
2.  **Scraper:** Implement `tiktok_scraper.py` with an async function to get trending videos and extract unique user data.
3.  **Discord:** Implement `discord_poster.py` with an async function to create a thread and post an embed.
4.  **Orchestration:** Implement `main.py` to tie the components together.
