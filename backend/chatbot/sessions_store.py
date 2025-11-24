import sqlite3
import json
import time

class SessionStore:
    def __init__(self, db_path='chat_sessions.db'):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute("""CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                alert_id TEXT,
                session_json TEXT,
                updated_at REAL
            )""")
            conn.commit()

    def save_session(self, session_id: str, session_obj: dict):
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute("""INSERT OR REPLACE INTO sessions(session_id, alert_id, session_json, updated_at)
                VALUES (?, ?, ?, ?)""", (session_id, session_obj.get('alert_id'), json.dumps(session_obj), time.time()))
            conn.commit()

    def load_session(self, session_id: str):
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute("SELECT session_json FROM sessions WHERE session_id = ?", (session_id,))
            row = cur.fetchone()
            if not row:
                return None
            return json.loads(row[0])

    def delete_session(self, session_id: str):
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            conn.commit()


