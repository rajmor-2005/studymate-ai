import React from 'react';
import { Award, Flame, BookOpen, TrendingUp } from 'lucide-react';

export default function ProgressChart({ progressData }) {
  if (!progressData) return null;

  const { total_materials, total_quizzes_taken, streak_days, materials, quiz_history } = progressData;

  return (
    <div>
      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Materials</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total_materials}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quizzes Completed</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total_quizzes_taken}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Flame size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Streak</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{streak_days} Days</h3>
          </div>
        </div>
      </div>

      {/* Quiz History Chart / List */}
      <div className="card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <span>Quiz Performance History</span>
        </h4>

        {quiz_history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No quiz attempts recorded yet. Upload a document and take a quiz to track your progress!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quiz_history.map((q, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderLeft: `4px solid ${q.percentage >= 70 ? 'var(--success)' : 'var(--accent)'}`
                }}
              >
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{q.document_title}</h5>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.date}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: q.percentage >= 70 ? 'var(--success)' : 'var(--accent)' }}>
                    {q.score} / {q.total}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
