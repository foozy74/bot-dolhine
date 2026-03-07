#!/usr/bin/env python3
"""
🔍 Delfin Bot Diagnostic Tool
"""

import os
import sys
import requests
import subprocess
from datetime import datetime

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

print(f"\n{Colors.BOLD}{'🐬 DELFIN BOT DIAGNOSTIC':^60}{Colors.RESET}")
print(f"{Colors.BOLD}{datetime.now().strftime('%Y-%m-%d %H:%M:%S'):^60}{Colors.RESET}\n")

# Check 1: Environment Variables
print_header("1️⃣  Environment Variables")

api_key = os.getenv('BITUNIX_API_KEY', '')
api_secret = os.getenv('BITUNIX_SECRET_KEY', '')

if not api_key or api_key in ['', 'dein_api_key_hier']:
    print_error("BITUNIX_API_KEY not set or is placeholder!")
    print_info(f"Current value: '{api_key}'")
else:
    masked = api_key[:4] + '****' if len(api_key) > 4 else '****'
    print_success(f"BITUNIX_API_KEY: {masked}")

if not api_secret or api_secret in ['', 'dein_secret_key_hier']:
    print_error("BITUNIX_SECRET_KEY not set or is placeholder!")
else:
    print_success("BITUNIX_SECRET_KEY is set")

# Check 2: Backend API
print_header("2️⃣  Backend API Health")

try:
    response = requests.get('http://localhost:8000/api/health', timeout=5)
    if response.status_code == 200:
        print_success("Backend API is healthy")
    else:
        print_error(f"Backend returned status {response.status_code}")
except Exception as e:
    print_error(f"Cannot connect to backend: {e}")

# Check 3: Bot Status
print_header("3️⃣  Bot Status")

try:
    response = requests.get('http://localhost:8000/api/status', timeout=5)
    if response.status_code == 200:
        status = response.json()
        running = status.get('running', False)
        print_info(f"Status: {'🟢 RUNNING' if running else '🔴 STOPPED'}")
        print_info(f"Symbol: {status.get('symbol', 'N/A')}")
        print_info(f"Current Price: {status.get('current_price', 'N/A')}")
        print_info(f"Position: {status.get('position', 'None')}")
        print_info(f"Dry Run: {status.get('dry_run', 'N/A')}")
        
        if running and status.get('current_price', 0) == 0:
            print_warning("Bot running but price is 0 - API not working")
    else:
        print_error(f"Status endpoint returned {response.status_code}")
except Exception as e:
    print_error(f"Cannot get bot status: {e}")

# Check 4: Container Logs
print_header("4️⃣  Recent Container Logs")

try:
    result = subprocess.run(
        ['docker', 'logs', '--tail=10', 'dolphin-bot'],
        capture_output=True,
        text=True,
        timeout=10
    )
    if result.returncode == 0 and result.stdout:
        print_info("Last 10 log lines:")
        for line in result.stdout.strip().split('\n')[-10:]:
            if 'error' in line.lower():
                print_error(f"  {line}")
            else:
                print(f"  {line}")
    else:
        print_warning("Could not retrieve logs")
except Exception as e:
    print_warning(f"Could not get logs: {e}")

# Summary
print_header("📊 SUMMARY")

if not api_key or api_key in ['', 'dein_api_key_hier']:
    print_error("❌ CRITICAL: API Keys not configured!")
    print_info("Set BITUNIX_API_KEY and BITUNIX_SECRET_KEY environment variables")
    print_info("Then restart the container")
else:
    print_success("✅ Configuration looks good")
    print_info("If bot still doesn't start, check:")
    print_info("  1. Are the API keys valid (not expired)?")
    print_info("  2. Is Bitunix API accessible from your server?")
    print_info("  3. Check browser console for frontend errors")

print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}\n")
