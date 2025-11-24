import React, { useState } from 'react';
import './ChatModal.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ChatWidget({ alert }) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  async function startChat() {
    try {
      const body = { alert_id: alert?.alert_id || alert?.id, alert };
      const res = await fetch(`${API_BASE}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Could not start chat session');
      }
      setSessionId(payload.session_id);
      setMessages([{ from: 'bot', ...payload.message }]);
      setOpen(true);
    } catch (err) {
      console.error('Chat start error', err);
    }
  }

  async function sendText(text) {
    if (!sessionId || !text) {
      return;
    }
    setMessages(prev => [...prev, { from: 'user', text }]);
    try {
      const res = await fetch(`${API_BASE}/api/chat/${sessionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { from: 'bot', ...data }]);
      }
    } catch (err) {
      console.error('Failed to send chat text', err);
    }
  }

  function onButtonClick(label) {
    sendText(label);
  }

  return (
    <div className="chat-widget">
      <button onClick={startChat} className="ask-btn">Ask Assistant</button>
      {open && (
        <div className="chat-modal" role="dialog" aria-label="Security assistant">
          <div className="chat-header">
            <strong>EdgeGuard Assistant</strong>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`msg ${m.from === 'bot' ? 'bot' : 'user'}`}>
                {m.from === 'bot' ? (
                  <>
                    <div className="bot-text">{m.polished_text || m.text}</div>
                    {m.buttons && m.buttons.length > 0 && (
                      <div className="btn-row">
                        {m.buttons.map((b, i) => (
                          <button key={i} className="quick-btn" onClick={() => onButtonClick(b)}>
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="user-text">{m.text}</div>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              placeholder="Type a message..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  sendText(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const el = document.querySelector('.chat-input input');
                if (el && el.value.trim()) {
                  sendText(el.value);
                  el.value = '';
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


