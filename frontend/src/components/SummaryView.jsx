import React, { useState } from 'react';
import LanguageToggle from './LanguageToggle';

export default function SummaryView({ summaryEn, summaryHi, initialLang = 'en' }) {
  const [lang, setLang] = useState(initialLang);
  const activeContent = lang === 'hi' ? (summaryHi || summaryEn) : (summaryEn || summaryHi);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          AI Generated Summary
        </h3>
        <LanguageToggle currentLang={lang} onChange={setLang} />
      </div>

      <div 
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          fontSize: '1rem'
        }}
      >
        {activeContent}
      </div>
    </div>
  );
}
