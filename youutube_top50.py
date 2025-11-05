import time
from bs4 import BeautifulSoup
import requests

while True:
    # Scrape the website
    page = requests.get("https://socialblade.com/youtube/top/50")
    soup = BeautifulSoup(page.content, "html.parser")
    channels = soup.find_all("span", class_="channel-name")
    
    # Print out the channel names
    for channel in channels:
        print(channel.text)
    
    # Wait 10 minutes before updating the list again
    time.sleep(600)
