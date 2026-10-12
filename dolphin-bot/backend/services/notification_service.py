import requests
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, bot_token: str = None, chat_id: str = None, enabled: bool = False):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.enabled = enabled
        self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else None

    def update_config(self, bot_token: str = None, chat_id: str = None, enabled: bool = None):
        if bot_token is not None:
            self.bot_token = bot_token
            self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else None
        if chat_id is not None:
            self.chat_id = chat_id
        if enabled is not None:
            self.enabled = enabled

    async def send_message(self, message: str) -> dict:
        if not self.enabled or not self.bot_token or not self.chat_id:
            return {"ok": False, "message": "Telegram nicht aktiviert oder Zugangsdaten unvollständig"}

        return await self._dispatch(self.bot_token, self.chat_id, message)

    async def test_notification(self, token: str = None, chat_id: str = None) -> dict:
        target_token = token or self.bot_token
        target_chat = chat_id or self.chat_id

        if not target_token or not target_chat:
            return {
                "ok": False,
                "message": "Token oder Chat-ID fehlt",
                "details": "Bitte sowohl Telegram Bot Token als auch Chat-ID hinterlegen."
            }

        test_msg = (
            "🐬 <b>Delfin Bot · Test-Benachrichtigung</b>\n\n"
            "✅ Verbindung erfolgreich hergestellt!\n"
            "Signals, Orders und System-Status werden nun an diesen Kanal übertragen.\n\n"
            "<i>TheSolution.at Algo Engine</i>"
        )
        return await self._dispatch(target_token, target_chat, test_msg)

    async def _dispatch(self, token: str, chat_id: str, message: str) -> dict:
        try:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML"
            }
            response = requests.post(url, json=payload, timeout=10)
            data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}

            if response.ok and data.get("ok"):
                return {"ok": True, "message": "Telegram Nachricht erfolgreich zugestellt"}

            # Analyze known Telegram error codes & descriptions
            desc = data.get("description", response.text)
            hint = ""
            if "chat not found" in desc.lower():
                hint = "Bitte öffne deinen Bot in Telegram und klicke zuerst auf 'Start' (bzw. sende /start), damit der Bot dir Nachrichten senden darf."
            elif "unauthorized" in desc.lower():
                hint = "Der Bot Token ist ungültig. Bitte überprüfe den Token von @BotFather."
            elif "chat_id is empty" in desc.lower():
                hint = "Die Chat-ID ist leer oder ungültig."

            full_msg = f"{desc} → {hint}" if hint else desc
            logger.error(f"Telegram API error: {full_msg}")
            return {"ok": False, "message": full_msg, "details": hint or desc}

        except Exception as e:
            err = f"Netzwerkfehler bei Telegram: {str(e)}"
            logger.error(err)
            return {"ok": False, "message": err, "details": str(e)}
