import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ currentLang, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      backgroundColor: 'var(--bg-surface-subtle)',
      padding: '0.25rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)'
    }}>
      <Languages size={16} style={{ margin: '0 0.25rem', color: 'var(--text-muted)' }} />
      <button
        onClick={() => onChange('en')}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: 600,
          backgroundColor: currentLang === 'en' ? 'var(--bg-surface)' : 'transparent',
          color: currentLang === 'en' ? 'var(--primary)' : 'var(--text-secondary)',
          boxShadow: currentLang === 'en' ? 'var(--shadow-sm)' : 'none'
        }}
      >
        English
      </button>
      <button
        onClick={() => onChange('hi')}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: 600,
          backgroundColor: currentLang === 'hi' ? 'var(--bg-surface)' : 'transparent',
          color: currentLang === 'hi' ? 'var(--primary)' : 'var(--text-secondary)',
          boxShadow: currentLang === 'hi' ? 'var(--shadow-sm)' : 'none'
        }}
      >
        Hinglish (हिंदी)
      </button>
    </div>
  );
}
