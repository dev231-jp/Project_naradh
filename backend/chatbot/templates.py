def _tpl(text, buttons=None):
    return {'text': text, 'buttons': buttons or []}

TEMPLATES = {
    'evil_twin': lambda alert: _tpl(
        f"We detected a suspicious Wi-Fi hotspot named '{alert.get('ssid', 'unknown')}'. This could be a fake hotspot that steals data.",
        ["I haven't connected", "I connected — help me disconnect", "Tell me more"]
    ),
    'iot_high_upload': lambda alert: _tpl(
        f"Device {alert.get('src', 'unknown')} is sending an unusually large amount of data. It may be compromised.",
        ["Quarantine device", "Show steps to inspect", "Contact support"]
    ),
    'help_disconnect_android': lambda a: _tpl(
        "Android: Open Settings → Wi-Fi → tap the network name → Forget. Then reconnect only to your known network.",
        ["Done", "Show again"]
    ),
    'help_disconnect_iphone': lambda a: _tpl(
        "iPhone: Settings → Wi-Fi → tap the (i) next to the network → Forget This Network. Then reconnect to the correct one.",
        ["Done", "Show again"]
    ),
    'help_disconnect_windows': lambda a: _tpl(
        "Windows: Settings → Network & Internet → Wi-Fi → Manage known networks → Select the network → Forget.",
        ["Done", "Show again"]
    ),
    'help_disconnect_mac': lambda a: _tpl(
        "Mac: System Settings → Network → Wi-Fi → Advanced → Remove the suspicious network from Preferred Networks.",
        ["Done", "Show again"]
    ),
    'change_password': lambda a: _tpl(
        "To change your Wi-Fi password: log into your router admin page (often 192.168.1.1), sign in, and update the Wi-Fi password. I can guide you step-by-step.",
        ["Guide me", "Later"]
    ),
    'default': lambda a: _tpl("We detected an issue. I can help — tell me what device you're using.", ["I connected", "I didn't connect"])
}


