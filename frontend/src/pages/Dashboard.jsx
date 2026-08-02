import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import UpgradeModal from '../components/UpgradeModal';

export default function Dashboard({ user, onRefreshUser }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;

    try {
      await api.delete(`/api/documents/${docId}`);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            My Study Library
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            All your uploaded materials, summaries, and practice quiz scores
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {user && user.subscription_tier === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="btn btn-accent"
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <Sparkles size={18} />
              <span>Upgrade to Pro</span>
            </button>
          )}

          <Link to="/upload" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
            <Plus size={20} />
            <span>Upload New Material</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="animate-pulse" color="var(--primary)" />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Loading your study library...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <BookOpen size={40} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Upload your first study material
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Drag and drop a PDF, photograph of your class notes, or paste text to generate instant bilingual summaries and practice MCQs.
          </p>

          <Link to="/upload" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
            <Plus size={20} />
            <span>Upload Material Now</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onDelete={handleDeleteDocument} />
          ))}
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={() => {
          onRefreshUser();
          alert('Congratulations! Your account is now upgraded to StudyMate Pro.');
        }}
      />
    </div>
  );
}
