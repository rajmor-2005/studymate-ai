import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ChatPanel({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/api/documents/${documentId}/chat/history`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    // Add user message locally
    const userMsg = { role: 'user', content: userText, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.post(`/api/documents/${documentId}/chat/message`, { message: userText });
      const assistantMsg = {
        role: 'assistant',
        content: res.data.assistant_message,
        is_grounded: res.data.is_grounded,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: 'Maaf kijiye, error aaya message process karne mein. Kripya 30 seconds baad wapas try karein.',
        is_grounded: false
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0 }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bot size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Chat with Your Notes</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scoped to this uploaded document only</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface-subtle)'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '400px' }}>
            <Bot size={40} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Poochho koi bhi question!</p>
            <p style={{ fontSize: '0.85rem' }}>Example: "Iss topic ka real-life example do" or "Summary points explain karo"</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem'
                }}
              >
                {msg.content}
              </div>

              {msg.role === 'assistant' && (
                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  {msg.is_grounded !== false ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                      <CheckCircle2 size={12} style={{ marginRight: '0.2rem' }} /> Grounded in your notes
                    </span>
                  ) : (
                    <span className="badge badge-accent" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                      <AlertCircle size={12} style={{ marginRight: '0.2rem' }} /> General Knowledge Answer
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Loader2 size={16} className="animate-pulse" />
            <span>Thinking grounded in your notes...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <input
          type="text"
          placeholder="Ask a question about this material..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)'
          }}
        />
        <button type="submit" disabled={!inputMessage.trim() || isLoading} className="btn btn-primary">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
