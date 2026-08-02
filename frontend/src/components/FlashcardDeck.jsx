import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, HelpCircle } from 'lucide-react';

export default function FlashcardDeck({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());

  if (!cards || cards.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No flashcards generated for this material.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isKnown = knownCards.has(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleKnown = () => {
    const updated = new Set(knownCards);
    if (updated.has(currentIndex)) {
      updated.delete(currentIndex);
    } else {
      updated.add(currentIndex);
    }
    setKnownCards(updated);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="badge badge-success">
          Known: {knownCards.size} / {cards.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: '1000px',
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            textAlign: 'center',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div className="card" style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
              <RotateCw size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              QUESTION / TERM
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentCard.front}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              (Click to flip answer)
            </p>
          </div>

          {/* Back */}
          <div className="card" style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: 'var(--primary-light)',
            borderColor: 'var(--primary)'
          }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              ANSWER / DEFINITION
            </span>
            <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)' }}>
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handlePrev} className="btn btn-secondary">
          <ChevronLeft size={20} />
          <span>Previous</span>
        </button>

        <button
          onClick={toggleKnown}
          className={`btn ${isKnown ? 'btn-accent' : 'btn-outline'}`}
        >
          <CheckCircle size={18} />
          <span>{isKnown ? 'Marked as Known' : 'Mark as Known'}</span>
        </button>

        <button onClick={handleNext} className="btn btn-primary">
          <span>Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
