#!/bin/bash
# Coolify Deployment Monitor
# Usage: ./check-deployment.sh [command]
# Commands:
#   (none)     - Run single health check
#   loop       - Monitor continuously
#   redeploy   - Trigger redeployment
#   status     - Check deployment status

cd "$(dirname "$0")"
python3 monitor_coolify.py "$@"