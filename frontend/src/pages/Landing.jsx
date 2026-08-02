import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Brain, CheckCircle, ArrowRight, FileText, HelpCircle, Layers } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ padding: '3rem 0' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 4rem' }} className="animate-fade-in">
        <div className="badge badge-accent" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          <Sparkles size={16} />
          <span>India's #1 Bilingual AI Study Companion</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Apna material upload karo, <span style={{ color: 'var(--primary)' }}>StudyMate baaki karega</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Turn your PDFs, photographed notes, or textbook chapters into instant bilingual summaries, practice MCQs, interactive flashcards, and grounded AI chat — in English & Hinglish.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            <span>Start Revision Free</span>
            <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Login to Account
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>
          Built Specially for How Indian Students Study
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', marginBottom: '1rem' }}>
              <FileText size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bilingual Summaries</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Get clear structured summaries in plain English or easy Hinglish (Hindi + English) with a single click.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', width: 'fit-content', marginBottom: '1rem' }}>
              <HelpCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Auto 10-MCQ Quizzes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Test your understanding with auto-generated exam-style practice questions and instant answer explanations.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-light)', color: 'var(--success)', width: 'fit-content', marginBottom: '1rem' }}>
              <Layers size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Interactive Flashcards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Revise key formulas and concepts fast with 3D flip flashcard carousels and "Mark as Known" tracking.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', marginBottom: '1rem' }}>
              <Brain size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Grounded Notes Chat</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Ask follow-up questions directly to your material. Answers are strictly grounded in your specific uploaded notes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
