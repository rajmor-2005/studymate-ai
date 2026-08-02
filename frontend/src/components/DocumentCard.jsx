import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Award, Calendar, Trash2, ArrowRight } from 'lucide-react';

export default function DocumentCard({ doc, onDelete }) {
  const formattedDate = doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Recently';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span className={`badge ${doc.source_type === 'pdf' ? 'badge-primary' : doc.source_type === 'image' ? 'badge-accent' : 'badge-success'}`}>
            {doc.source_type.toUpperCase()}
          </span>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(doc.id);
            }} 
            style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
            title="Delete material"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineClamp: 2 }}>
          {doc.title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Award size={16} color="var(--accent)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {doc.best_quiz_score !== null && doc.best_quiz_score !== undefined ? `Best: ${doc.best_quiz_score}/10` : 'Not attempted'}
          </span>
        </div>

        <Link to={`/documents/${doc.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          <span>Study</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
