import os
import asyncio
from TikTokApi import TikTokApi

async def get_trending_profiles(count=30):
    """
    Fetches trending videos and extracts unique profile data.

    :param count: The number of trending videos to fetch.
    :return: A list of dictionaries, each containing unique profile data.
    """
    ms_token = os.environ.get("TIKTOK_MS_TOKEN")
    if not ms_token:
        print("Warning: TIKTOK_MS_TOKEN environment variable not set. Scraping may fail.")
        # For testing purposes without a token, we can proceed, but it's not reliable.
        # In a real scenario, we would raise an error.

    unique_profiles = {}
    
    try:
        # The TikTokApi must be used as an async context manager
        async with TikTokApi() as api:
            # Initialize sessions with the ms_token
            await api.create_sessions(
                ms_tokens=[ms_token] if ms_token else None, 
                num_sessions=1, 
                sleep_after=3, 
                browser=os.getenv("TIKTOK_BROWSER", "chromium")
            )
            
            print(f"Fetching {count} trending videos...")
            
            # Iterate over trending videos
            async for video in api.trending.videos(count=count):
                # Extract the author (profile) data
                author = video.author.as_dict
                
                # Use the unique ID (e.g., 'id' or 'uniqueId') as the key for deduplication
                profile_id = author.get('id') or author.get('uniqueId')
                
                if profile_id and profile_id not in unique_profiles:
                    # Extract relevant profile data
                    profile_data = {
                        "id": profile_id,
                        "username": author.get('uniqueId'),
                        "nickname": author.get('nickname'),
                        "bio": author.get('signature'),
                        "follower_count": author.get('followerCount'),
                        "heart_count": author.get('heartCount'),
                        "video_count": author.get('videoCount'),
                        "profile_url": f"https://www.tiktok.com/@{author.get('uniqueId')}",
                        "avatar_url": author.get('avatarLarger')
                    }
                    unique_profiles[profile_id] = profile_data
                    
                if len(unique_profiles) >= count:
                    break

    except Exception as e:
        print(f"An error occurred during TikTok scraping: {e}")
        # In a production environment, you might want more robust error handling
        
    return list(unique_profiles.values())

if __name__ == '__main__':
    # Example usage for testing the scraper module
    # NOTE: This requires TIKTOK_MS_TOKEN to be set in the environment
    # and for the environment to have Playwright dependencies installed.
    
    # Set a dummy token for demonstration, but a real one is needed for success
    # os.environ["TIKTOK_MS_TOKEN"] = "your_ms_token_here" 
    
    print("Running TikTok scraper test...")
    profiles = asyncio.run(get_trending_profiles(count=5))
    
    if profiles:
        print(f"Successfully scraped {len(profiles)} unique profiles.")
        for i, profile in enumerate(profiles):
            print(f"--- Profile {i+1} ---")
            print(f"Username: {profile['username']}")
            print(f"Followers: {profile['follower_count']:,}")
            print(f"Bio: {profile['bio'][:50]}...")
            print(f"URL: {profile['profile_url']}")
    else:
        print("No profiles scraped. Check TIKTOK_MS_TOKEN and network connection.")
