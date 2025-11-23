import os
import asyncio
from tiktok_scraper import get_trending_profiles
from discord_poster import post_profile_to_discord
from data_processor import filter_profiles

# --- Configuration ---
# The application relies on the following environment variables:
# TIKTOK_MS_TOKEN: TikTok ms_token for scraping
# DISCORD_BOT_TOKEN: Discord bot token
# DISCORD_CHANNEL_ID: ID of the channel to post threads in
# MIN_FOLLOWERS: Minimum follower count for a profile to be considered trending

async def run_scraper_and_poster():
    """
    Orchestrates the entire process: scraping, filtering, and posting.
    """
    print("--- Starting TikTok to Discord Scraper ---")
    
    # 1. Load Configuration
    discord_channel_id = os.environ.get("DISCORD_CHANNEL_ID")
    min_followers_str = os.environ.get("MIN_FOLLOWERS", "100000") # Default to 100k
    
    if not os.environ.get("DISCORD_BOT_TOKEN"):
        print("Error: DISCORD_BOT_TOKEN is not set. Cannot post to Discord.")
        return
    
    if not discord_channel_id:
        print("Error: DISCORD_CHANNEL_ID is not set. Cannot post to Discord.")
        return
        
    # TIKTOK_MS_TOKEN is optional but highly recommended for reliable scraping
    if not os.environ.get("TIKTOK_MS_TOKEN"):
        print("Warning: TIKTOK_MS_TOKEN is not set. Scraping may be unreliable.")

    # 2. Scrape Trending Profiles
    print("Phase 1: Scraping trending profiles from TikTok...")
    raw_profiles = await get_trending_profiles(count=50)
    print(f"Scraping complete. Found {len(raw_profiles)} unique profiles.")

    # 3. Filter Profiles
    print(f"Phase 2: Filtering profiles with minimum followers set to {min_followers_str}...")
    filtered_profiles = filter_profiles(raw_profiles, min_followers_str)
    print(f"Filtering complete. {len(filtered_profiles)} profiles passed the filter.")

    # 4. Post to Discord
    if not filtered_profiles:
        print("No profiles to post. Exiting.")
        return

    print("Phase 3: Posting profiles to Discord...")
    
    # Use a set to track successful posts to avoid re-posting in case of partial failure
    posted_profiles = set()
    
    for profile in filtered_profiles:
        username = profile['username']
        if username in posted_profiles:
            continue
            
        print(f"Attempting to post @{username}...")
        
        # The post_profile_to_discord function runs the bot, which handles the connection and posting
        # We run it in a separate process or ensure the bot fully closes after each post
        # For simplicity and to avoid complex bot management, we will run the bot for each post
        # NOTE: This is inefficient but avoids running a persistent bot process which is complex in a single script.
        # A better long-term solution would be to run the bot persistently and use a queue.
        
        # Since post_profile_to_discord already handles the bot lifecycle, we just call it.
        success = await post_profile_to_discord(profile, discord_channel_id)
        
        if success:
            posted_profiles.add(username)
            print(f"Successfully posted @{username}.")
        else:
            print(f"Failed to post @{username}. Skipping.")
            
        # Add a small delay to respect rate limits and allow the bot to fully close
        await asyncio.sleep(5) 

    print(f"--- Scraper run finished. Posted {len(posted_profiles)} new threads. ---")

if __name__ == '__main__':
    # To run this script, you must set the environment variables:
    # export TIKTOK_MS_TOKEN="your_ms_token"
    # export DISCORD_BOT_TOKEN="your_bot_token"
    # export DISCORD_CHANNEL_ID="your_channel_id"
    # export MIN_FOLLOWERS="100000"
    
    # The main function is async, so we run it with asyncio.run()
    asyncio.run(run_scraper_and_poster())
