import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, FileText, Brain, Sparkles, HelpCircle } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Extracting text from material (PDF/OCR)', icon: FileText },
  { id: 2, label: 'Understanding content & indexing RAG collection', icon: Brain },
  { id: 3, label: 'Generating bilingual summary (EN / Hinglish)', icon: Sparkles },
  { id: 4, label: 'Creating 10-MCQ quiz & flashcard deck', icon: HelpCircle },
];

export default function ProcessingIndicator() {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(2), 2000);
    const timer2 = setTimeout(() => setCurrentStage(3), 4500);
    const timer3 = setTimeout(() => setCurrentStage(4), 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Processing Your Material...
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Please wait while StudyMate AI prepares your summary, quiz, and chat companion.
      </p>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{
          height: '100%',
          width: `${(currentStage / 4) * 100}%`,
          backgroundColor: 'var(--primary)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        {STAGES.map((st) => {
          const Icon = st.icon;
          const isDone = st.id < currentStage;
          const isCurrent = st.id === currentStage;

          return (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCurrent ? 'var(--primary-light)' : 'transparent',
                color: isCurrent ? 'var(--primary)' : isDone ? 'var(--success)' : 'var(--text-muted)'
              }}
            >
              {isDone ? (
                <CheckCircle2 size={20} color="var(--success)" />
              ) : isCurrent ? (
                <Loader2 size={20} className="animate-pulse" color="var(--primary)" />
              ) : (
                <Icon size={20} color="var(--text-muted)" />
              )}
              <span style={{ fontWeight: isCurrent ? 600 : 400, fontSize: '0.95rem' }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
