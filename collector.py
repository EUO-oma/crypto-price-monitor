#!/usr/bin/env python3
"""
Crypto Price Monitor - Python Collector
Fetches cryptocurrency prices from CoinGecko API and saves to JSON files
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import time

# Try to import requests, provide installation instructions if missing
try:
    import requests
except ImportError:
    print("Error: 'requests' module not found.")
    print("Please install it using: pip install requests")
    sys.exit(1)

# Configuration
COINGECKO_API = "https://api.coingecko.com/api/v3"
COINS = ["bitcoin", "ethereum", "dogecoin", "cardano", "polkadot"]
VS_CURRENCY = "usd"
DATA_DIR = Path("data")
RATE_LIMIT_DELAY = 1.1  # Delay between API calls (seconds)
REQUEST_TIMEOUT = 30  # Request timeout (seconds)
MAX_RETRIES = 3  # Maximum retries for failed requests


class CryptoPriceCollector:
    """Collects cryptocurrency prices and saves them to JSON files"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'CryptoPriceMonitor/1.0'
        })
        self.ensure_data_directory()
    
    def ensure_data_directory(self) -> None:
        """Create data directory if it doesn't exist"""
        DATA_DIR.mkdir(exist_ok=True)
        print(f"Data directory ready: {DATA_DIR.absolute()}")
    
    def fetch_price(self, coin_id: str) -> Dict[str, Any]:
        """
        Fetch current price data for a specific cryptocurrency
        
        Args:
            coin_id: CoinGecko coin ID (e.g., 'bitcoin')
            
        Returns:
            Dictionary with price data or None if failed
        """
        url = f"{COINGECKO_API}/simple/price"
        params = {
            'ids': coin_id,
            'vs_currencies': VS_CURRENCY,
            'include_market_cap': 'true',
            'include_24hr_vol': 'true',
            'include_24hr_change': 'true',
            'include_last_updated_at': 'true'
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(url, params=params, timeout=REQUEST_TIMEOUT)
                response.raise_for_status()
                data = response.json()
                
                if coin_id in data:
                    return self.format_price_data(coin_id, data[coin_id])
                else:
                    print(f"Warning: No data received for {coin_id}")
                    return None
                    
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {coin_id} (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    return None
    
    def format_price_data(self, coin_id: str, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format raw price data into structured format
        
        Args:
            coin_id: Cryptocurrency identifier
            raw_data: Raw data from API
            
        Returns:
            Formatted price data dictionary
        """
        timestamp = datetime.now().isoformat()
        
        return {
            'timestamp': timestamp,
            'coin': coin_id,
            'price_usd': raw_data.get(VS_CURRENCY, 0),
            'market_cap_usd': raw_data.get(f'{VS_CURRENCY}_market_cap', 0),
            'volume_24h_usd': raw_data.get(f'{VS_CURRENCY}_24h_vol', 0),
            'change_24h_percent': raw_data.get(f'{VS_CURRENCY}_24h_change', 0),
            'last_updated': datetime.fromtimestamp(
                raw_data.get('last_updated_at', 0)
            ).isoformat() if raw_data.get('last_updated_at') else timestamp
        }
    
    def save_price_data(self, coin_id: str, price_data: Dict[str, Any]) -> bool:
        """
        Save price data to JSON file
        
        Args:
            coin_id: Cryptocurrency identifier
            price_data: Price data to save
            
        Returns:
            True if successful, False otherwise
        """
        filename = DATA_DIR / f"{coin_id}_prices.json"
        
        try:
            # Load existing data
            if filename.exists():
                with open(filename, 'r') as f:
                    historical_data = json.load(f)
            else:
                historical_data = []
            
            # Append new data
            historical_data.append(price_data)
            
            # Keep only last 1000 entries to prevent files from growing too large
            if len(historical_data) > 1000:
                historical_data = historical_data[-1000:]
            
            # Save updated data
            with open(filename, 'w') as f:
                json.dump(historical_data, f, indent=2)
            
            print(f"✓ Saved {coin_id} price data to {filename}")
            return True
            
        except Exception as e:
            print(f"✗ Error saving {coin_id} data: {e}")
            return False
    
    def collect_all_prices(self) -> Dict[str, bool]:
        """
        Collect prices for all configured cryptocurrencies
        
        Returns:
            Dictionary mapping coin IDs to success status
        """
        print(f"\nStarting price collection at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Collecting prices for: {', '.join(COINS)}")
        print("-" * 50)
        
        results = {}
        
        for coin in COINS:
            print(f"\nFetching {coin}...")
            
            price_data = self.fetch_price(coin)
            if price_data:
                success = self.save_price_data(coin, price_data)
                results[coin] = success
                
                # Display current price
                print(f"  Price: ${price_data['price_usd']:,.2f}")
                print(f"  24h Change: {price_data['change_24h_percent']:.2f}%")
            else:
                results[coin] = False
                print(f"  Failed to fetch data")
            
            # Rate limiting
            if coin != COINS[-1]:  # Don't delay after last coin
                time.sleep(RATE_LIMIT_DELAY)
        
        return results
    
    def generate_summary(self, results: Dict[str, bool]) -> None:
        """Generate and display collection summary"""
        print("\n" + "=" * 50)
        print("COLLECTION SUMMARY")
        print("=" * 50)
        
        successful = sum(1 for success in results.values() if success)
        failed = len(results) - successful
        
        print(f"Total coins: {len(results)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        
        if failed > 0:
            print("\nFailed coins:")
            for coin, success in results.items():
                if not success:
                    print(f"  - {coin}")
        
        print(f"\nCompleted at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def main():
    """Main execution function"""
    try:
        collector = CryptoPriceCollector()
        results = collector.collect_all_prices()
        collector.generate_summary(results)
        
        # Exit with error code if any collections failed
        sys.exit(0 if all(results.values()) else 1)
        
    except KeyboardInterrupt:
        print("\n\nCollection interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()