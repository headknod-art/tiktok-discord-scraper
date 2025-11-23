import os

def filter_profiles(profiles, min_followers_str):
    """
    Filters a list of profile dictionaries based on a minimum follower count.
    
    :param profiles: List of profile dictionaries from the scraper.
    :param min_followers_str: The minimum follower count as a string (from env var).
    :return: A list of filtered profile dictionaries.
    """
    try:
        min_followers = int(min_followers_str)
    except (ValueError, TypeError):
        print(f"Warning: Invalid MIN_FOLLOWERS value '{min_followers_str}'. Using 0 as minimum.")
        min_followers = 0
        
    filtered_profiles = []
    for profile in profiles:
        # Ensure follower_count exists and is an integer
        follower_count = profile.get('follower_count', 0)
        if isinstance(follower_count, str):
            try:
                follower_count = int(follower_count)
            except ValueError:
                follower_count = 0
        
        if follower_count >= min_followers:
            filtered_profiles.append(profile)
            
    return filtered_profiles
