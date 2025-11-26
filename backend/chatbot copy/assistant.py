import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
USE_OPENAI = bool(OPENAI_API_KEY)
CHAT_SESSION_DB = os.getenv('CHAT_SESSION_DB', 'chat_sessions.db')

from .templates import TEMPLATES
from .sessions_store import SessionStore

CHAT_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), CHAT_SESSION_DB))
STORE = SessionStore(db_path=CHAT_DB_PATH)


def polish_text_with_openai(text: str) -> str:
    if not USE_OPENAI:
        return text
    try:
        import openai
        openai.api_key = OPENAI_API_KEY
        prompt = f"""You are a calm, clear assistant for non-technical users. Rewrite the following message into 2 short sentences and 1 reassurance line:\n\n{text}"""
        resp = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.2
        )
        out = resp.choices[0].message.content.strip()
        return out
    except Exception as exc:
        print('OpenAI error', exc)
        return text


def initial_message_for_alert(alert_info: dict) -> dict:
    template_func = TEMPLATES.get(alert_info.get('type')) or TEMPLATES.get('default')
    message = template_func(alert_info)
    message['polished_text'] = polish_text_with_openai(message.get('text', ''))
    return message


def build_bot_response_text(text: str) -> dict:
    low = text.lower()
    if 'connected' in low or 'i connected' in low or 'disconnect' in low:
        return {
            'text': 'Which device are you using? Android / iPhone / Windows / Mac',
            'buttons': ['Android', 'iPhone', 'Windows', 'Mac']
        }
    if low in ['android', 'iphone', 'windows', 'mac']:
        key = f'help_disconnect_{low}'
        tpl = TEMPLATES.get(key)
        if tpl:
            msg = tpl({})
            msg['polished_text'] = polish_text_with_openai(msg.get('text', ''))
            return msg
    if 'password' in low or 'change' in low or 'wifi password' in low:
        tpl = TEMPLATES.get('change_password')
        msg = tpl({})
        msg['polished_text'] = polish_text_with_openai(msg.get('text', ''))
        return msg
    if low in ['yes', 'done', 'i did it', 'done.']:
        return {
            'text': 'Good — would you like to change your router password now or check the device for further suspicious behavior?',
            'buttons': ['Change password', 'Check device', 'Contact support']
        }
    return {
        'text': "Sorry, I didn't understand that. Choose a button or type 'disconnect' or 'change password'.",
        'buttons': ['disconnect', 'change password', 'contact support']
    }

