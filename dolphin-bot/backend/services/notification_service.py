import requests
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, bot_token: str = None, chat_id: str = None, enabled: bool = False):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.enabled = enabled
        self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else None

    async def send_message(self, message: str):
        if not self.enabled or not self.bot_token or not self.chat_id:
            return

        try:
            url = f"{self.base_url}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": "HTML"
            }
            # Using requests for simplicity as it's already in requirements.txt
            # In a fully async app, httpx would be better, but requests is already there.
            response = requests.post(url, json=payload, timeout=10)
            if not response.ok:
                logger.error(f"Telegram API error: {response.text}")
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {str(e)}")
