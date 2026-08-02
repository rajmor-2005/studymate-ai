import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';

export default function QuizPlayer({ questions, onSubmitAttempt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [attemptResults, setAttemptResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No MCQ quiz available for this material.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isSelected = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (optionIndex) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // Prevent changing after selected
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const answersArray = questions.map((_, idx) => selectedAnswers[idx] ?? -1);
    const resultData = await onSubmitAttempt(answersArray);
    setAttemptResults(resultData);
    setShowResults(true);
    setIsSubmitting(false);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setAttemptResults(null);
  };

  if (showResults && attemptResults) {
    return (
      <div className="card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: attemptResults.percentage >= 70 ? 'var(--success-light)' : 'var(--accent-light)',
            color: attemptResults.percentage >= 70 ? 'var(--success)' : 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Award size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quiz Completed!</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
            {attemptResults.score} / {attemptResults.total} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({attemptResults.percentage}%)</span>
          </p>
          <button onClick={handleRetake} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <RotateCcw size={18} />
            <span>Retake Quiz</span>
          </button>
        </div>

        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Question Review & Explanations
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {attemptResults.review.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: item.is_correct ? 'var(--success-light)' : 'var(--danger-light)',
                borderLeft: `4px solid ${item.is_correct ? 'var(--success)' : 'var(--danger)'}`
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {idx + 1}. {item.question}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {item.options.map((opt, optIdx) => {
                  const isUserChoice = item.user_choice === optIdx;
                  const isCorrectChoice = item.correct_index === optIdx;
                  return (
                    <div 
                      key={optIdx}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem',
                        backgroundColor: isCorrectChoice ? 'var(--success)' : isUserChoice ? 'var(--danger)' : 'var(--bg-surface)',
                        color: (isCorrectChoice || isUserChoice) ? '#fff' : 'var(--text-primary)',
                        fontWeight: (isCorrectChoice || isUserChoice) ? 600 : 400
                      }}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>

              {item.explanation && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', italic: 'true' }}>
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
          {currentQ.difficulty || 'Medium'}
        </span>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        {currentQ.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {currentQ.options.map((opt, idx) => {
          const userChoice = selectedAnswers[currentIndex];
          const hasSelected = userChoice !== undefined;
          const isThisSelected = userChoice === idx;
          const isCorrect = idx === currentQ.correct_index;

          let bg = 'var(--bg-surface-subtle)';
          let borderColor = 'var(--border-color)';
          let textColor = 'var(--text-primary)';

          if (hasSelected) {
            if (isCorrect) {
              bg = 'var(--success-light)';
              borderColor = 'var(--success)';
              textColor = 'var(--success)';
            } else if (isThisSelected) {
              bg = 'var(--danger-light)';
              borderColor = 'var(--danger)';
              textColor = 'var(--danger)';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                textAlign: 'left',
                fontWeight: isThisSelected || (hasSelected && isCorrect) ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{opt}</span>
              {hasSelected && isCorrect && <CheckCircle size={20} color="var(--success)" />}
              {hasSelected && isThisSelected && !isCorrect && <XCircle size={20} color="var(--danger)" />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {currentIndex < questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={!isSelected}
            className="btn btn-primary"
          >
            <span>Next Question</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={handleFinish} 
            disabled={!isSelected || isSubmitting}
            className="btn btn-accent"
          >
            <span>{isSubmitting ? 'Submitting...' : 'Complete Quiz & View Results'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
