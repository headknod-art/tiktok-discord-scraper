import os
import discord
from discord.ext import commands

# Define the bot's intents
intents = discord.Intents.default()
intents.message_content = True # Required to read message content if needed, though not for this task
intents.members = True # Good practice for bot development

bot = commands.Bot(command_prefix='!', intents=intents)

def create_profile_embed(profile_data):
    """Creates a rich Discord Embed from the profile data."""
    embed = discord.Embed(
        title=f"New Trending Profile: @{profile_data['username']}",
        url=profile_data['profile_url'],
        description=profile_data['bio'] if profile_data['bio'] else "No bio provided.",
        color=discord.Color.red() # TikTok red
    )
    
    embed.set_thumbnail(url=profile_data['avatar_url'])
    embed.add_field(name="Followers", value=f"{profile_data['follower_count']:,}", inline=True)
    embed.add_field(name="Total Likes", value=f"{profile_data['heart_count']:,}", inline=True)
    embed.add_field(name="Total Videos", value=f"{profile_data['video_count']:,}", inline=True)
    embed.set_footer(text=f"Nickname: {profile_data['nickname']}")
    
    return embed

async def post_profile_to_discord(profile_data, channel_id):
    """
    Connects to Discord and posts the profile data as a new thread.
    
    :param profile_data: Dictionary containing the profile information.
    :param channel_id: The ID of the channel to create the thread in.
    :return: True if successful, False otherwise.
    """
    token = os.environ.get("DISCORD_BOT_TOKEN")
    if not token:
        print("Error: DISCORD_BOT_TOKEN environment variable not set.")
        return False

    @bot.event
    async def on_ready():
        print(f'Logged in as {bot.user}')
        
        try:
            # 1. Get the target channel
            channel = bot.get_channel(int(channel_id))
            if not channel:
                print(f"Error: Could not find channel with ID {channel_id}. Check if the bot is in the server and has permissions.")
                await bot.close()
                return

            # 2. Create the embed
            embed = create_profile_embed(profile_data)
            
            # 3. Create the thread
            # The thread name should be concise
            thread_name = f"@{profile_data['username']} - {profile_data['follower_count']:,} Followers"
            
            # Create a public thread in the channel
            thread = await channel.create_thread(
                name=thread_name,
                auto_archive_duration=60, # Archive after 60 minutes of inactivity
                reason="New trending TikTok profile detected."
            )
            
            # 4. Send the initial message with the embed to the thread
            await thread.send(embed=embed)
            print(f"Successfully posted profile @{profile_data['username']} to thread: {thread.name}")

        except discord.Forbidden:
            print("Error: Bot does not have permission to create threads or send messages in this channel.")
        except discord.HTTPException as e:
            print(f"Error: Discord API request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        finally:
            # Close the bot connection after the operation is complete
            await bot.close()

    try:
        # Start the bot and run the on_ready event
        await bot.start(token)
        return True
    except discord.LoginFailure:
        print("Error: Invalid DISCORD_BOT_TOKEN.")
        return False
    except Exception as e:
        print(f"Error starting bot: {e}")
        return False

if __name__ == '__main__':
    # Example usage for testing the poster module
    # NOTE: This requires DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID to be set
    # and for the bot to have the necessary permissions.
    
    # Dummy profile data for testing
    test_profile = {
        "id": "12345",
        "username": "test_creator_manus",
        "nickname": "Manus Test Account",
        "bio": "This is a test bio for the trending profile scraper. It's a simple description of the account's content.",
        "follower_count": 1234567,
        "heart_count": 98765432,
        "video_count": 450,
        "profile_url": "https://www.tiktok.com/@test_creator_manus",
        "avatar_url": "https://example.com/avatar.png" # Replace with a real URL for a proper test
    }
    
    # You would need to set these environment variables before running this:
    # os.environ["DISCORD_BOT_TOKEN"] = "YOUR_BOT_TOKEN"
    # os.environ["DISCORD_CHANNEL_ID"] = "YOUR_CHANNEL_ID"
    
    # print("Running Discord poster test...")
    # asyncio.run(post_profile_to_discord(test_profile, os.environ.get("DISCORD_CHANNEL_ID", "0")))
    # print("Test finished.")
    pass # Do not run the test here as it requires user-provided tokens and a running Discord bot.
