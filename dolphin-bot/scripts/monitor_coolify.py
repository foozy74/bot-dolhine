#!/usr/bin/env python3
"""
Coolify Deployment Monitor & Health Check
Monitors deployment status on Coolify automatically
"""

import requests
import time
import sys
from datetime import datetime

# Configuration
COOLIFY_URL = "http://130.61.110.122:8000"
API_KEY = "1|vqqCK0xvVTTFrlVPLSVcrH0tFzGsWYnlZq69M8nma74a05bb"
PROJECT_UUID = "mg0ooc84g0ocogk0gkwo04ck"
WEBSITE_URL = "https://bot.thesolution.at"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class CoolifyMonitor:
    def __init__(self):
        self.base_url = COOLIFY_URL
        self.headers = HEADERS
        
    def check_coolify_api(self):
        """Check if Coolify API is reachable"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/version",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                version = response.json().get('version', 'unknown')
                print(f"✅ Coolify API v{version} is healthy")
                return True
            else:
                print(f"⚠️  Coolify API returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Coolify API unreachable: {e}")
            return False
    
    def get_deployment_status(self):
        """Get current deployment status"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/applications/{PROJECT_UUID}/status",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                status = response.json()
                container_status = status.get('status', 'unknown')
                
                if container_status == 'running':
                    print(f"✅ Container is running")
                    return True
                elif container_status == 'restarting':
                    print(f"🔄 Container is restarting...")
                    return False
                else:
                    print(f"⚠️  Container status: {container_status}")
                    return False
            else:
                print(f"❌ Failed to get status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error checking deployment: {e}")
            return False
    
    def redeploy(self):
        """Trigger redeployment"""
        try:
            print("🚀 Triggering redeployment...")
            response = requests.post(
                f"{self.base_url}/api/v1/applications/{PROJECT_UUID}/deploy",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Redeployment started successfully")
                return True
            else:
                print(f"❌ Failed to redeploy: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error triggering redeploy: {e}")
            return False
    
    def check_website(self):
        """Check if website is accessible"""
        try:
            response = requests.get(
                WEBSITE_URL,
                timeout=10,
                allow_redirects=True
            )
            
            print(f"🌐 Website Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Website is accessible!")
                return True
            elif response.status_code == 503:
                print("⚠️  Website returning 503 - Container may be down")
                return False
            elif response.status_code == 403:
                print("⚠️  Website returning 403 - Check Cloudflare/Auth")
                return False
            else:
                print(f"⚠️  Website returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Website check failed: {e}")
            return False
    
    def run_health_check(self):
        """Run complete health check"""
        print("\n" + "="*60)
        print(f"🔍 Coolify Deployment Check - {datetime.now()}")
        print("="*60 + "\n")
        
        # Check 1: Coolify API
        api_ok = self.check_coolify_api()
        
        print()
        
        # Check 2: Deployment Status
        deploy_ok = self.get_deployment_status()
        
        print()
        
        # Check 3: Website
        web_ok = self.check_website()
        
        print()
        
        # Summary
        print("="*60)
        if api_ok and deploy_ok and web_ok:
            print("✅ All checks passed! Deployment is healthy.")
            print("="*60 + "\n")
            return True
        else:
            print("⚠️  Issues detected!")
            if not web_ok and deploy_ok:
                print("   Container running but website not accessible")
                print("   Possible: Cloudflare, Nginx config, Port mapping")
            elif not deploy_ok:
                print("   Container not running properly")
            print("="*60 + "\n")
            return False

def main():
    monitor = CoolifyMonitor()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--loop":
            # Run in loop mode
            while True:
                monitor.run_health_check()
                print("\n⏱️  Next check in 60 seconds... (Ctrl+C to stop)\n")
                time.sleep(60)
        elif sys.argv[1] == "--redeploy":
            # Just redeploy
            monitor.redeploy()
        elif sys.argv[1] == "--status":
            # Just check status
            monitor.get_deployment_status()
        else:
            print("Usage:")
            print("  python3 monitor_coolify.py           # Full health check")
            print("  python3 monitor_coolify.py --loop    # Monitor continuously")
            print("  python3 monitor_coolify.py --redeploy # Trigger redeploy")
            print("  python3 monitor_coolify.py --status   # Check deployment status")
    else:
        # Single check
        success = monitor.run_health_check()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()