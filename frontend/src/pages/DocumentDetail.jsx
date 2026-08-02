import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, HelpCircle, Layers, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import SummaryView from '../components/SummaryView';
import QuizPlayer from '../components/QuizPlayer';
import FlashcardDeck from '../components/FlashcardDeck';
import ChatPanel from '../components/ChatPanel';

export default function DocumentDetail() {
  const { id } = useParams();
  const [docDetail, setDocDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'quiz' | 'flashcards' | 'chat'

  useEffect(() => {
    fetchDocumentDetail();
  }, [id]);

  const fetchDocumentDetail = async () => {
    try {
      const res = await api.get(`/api/documents/${id}`);
      setDocDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch document detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAttemptSubmit = async (answersArray) => {
    try {
      const res = await api.post(`/api/documents/${id}/quiz/attempt`, { answers: answersArray });
      return res.data;
    } catch (err) {
      alert('Failed to submit quiz attempt');
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Loader2 size={32} className="animate-pulse" color="var(--primary)" />
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Loading study material...</p>
      </div>
    );
  }

  if (!docDetail) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Material not found</h3>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Back button & Title */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </Link>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {docDetail.title}
        </h2>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'summary', label: 'Summary', icon: FileText },
          { id: 'quiz', label: 'MCQ Quiz', icon: HelpCircle },
          { id: 'flashcards', label: 'Flashcards', icon: Layers },
          { id: 'chat', label: 'Chat with Notes', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'summary' && (
        <SummaryView
          summaryEn={docDetail.summary?.content_en}
          summaryHi={docDetail.summary?.content_hi}
          initialLang={docDetail.language_detected === 'hi' || docDetail.language_detected === 'mixed' ? 'hi' : 'en'}
        />
      )}

      {activeTab === 'quiz' && (
        <QuizPlayer
          questions={docDetail.quiz?.questions}
          onSubmitAttempt={handleQuizAttemptSubmit}
        />
      )}

      {activeTab === 'flashcards' && (
        <FlashcardDeck cards={docDetail.flashcards?.cards} />
      )}

      {activeTab === 'chat' && (
        <ChatPanel documentId={docDetail.id} />
      )}
    </div>
  );
}
