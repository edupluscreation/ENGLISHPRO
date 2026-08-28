import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SmartQuestionCanvas } from './SmartQuestionCanvas';
import { SmartExplanation } from './SmartExplanation';
import { 
  Clock, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  HelpCircle,
  Lightbulb,
  Tag,
  BookOpen
} from 'lucide-react';

export const QuizEngine: React.FC = () => {
  const { 
    activeQuiz, 
    selectOption, 
    toggleMarkReview, 
    nextQuestion, 
    prevQuestion, 
    goToQuestion, 
    submitQuiz, 
    toggleBookmark, 
    isBookmarked,
    setCurrentView 
  } = useApp();

  const [timeLeft, setTimeLeft] = useState<number>(activeQuiz?.timeRemainingSeconds || 300);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  useEffect(() => {
    if (!activeQuiz || activeQuiz.isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, submitQuiz]);

  if (!activeQuiz) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>No Active Quiz Found</h2>
        <button onClick={() => setCurrentView('dashboard')} className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = activeQuiz.questions[activeQuiz.currentIndex];
  const userChosen = activeQuiz.userAnswers[currentQ.id];
  const isMarked = activeQuiz.markedForReview[currentQ.id];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '16px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Quiz Header Control Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '4px' }}>SSC PRACTICE ENGINE</span>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{activeQuiz.quizTitle}</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Countdown Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: timeLeft < 60 ? 'var(--error-bg)' : 'var(--bg-surface-elevated)',
            color: timeLeft < 60 ? 'var(--error)' : 'var(--text-main)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '1px solid var(--border-color)'
          }}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button onClick={() => submitQuiz()} className="btn-primary" style={{ background: 'var(--success)', padding: '6px 16px', fontSize: '0.85rem' }}>
            <Send size={14} />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      <div className="quiz-container-grid">
        
        {/* Left Column: Question Area */}
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            
            {/* Question Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                  Question {activeQuiz.currentIndex + 1} of {activeQuiz.questions.length}
                </span>
                {currentQ.examTag && (
                  <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                    <Tag size={12} />
                    {currentQ.examTag}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleMarkReview(currentQ.id)}
                  style={{
                    background: isMarked ? 'var(--warning-bg)' : 'transparent',
                    color: isMarked ? 'var(--warning)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {isMarked ? '★ Marked' : '☆ Mark Review'}
                </button>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  style={{
                    background: isBookmarked(currentQ.id) ? 'var(--primary-light)' : 'transparent',
                    color: isBookmarked(currentQ.id) ? 'var(--primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  <Bookmark size={13} fill={isBookmarked(currentQ.id) ? 'var(--primary)' : 'none'} />
                  <span>{isBookmarked(currentQ.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* CLOZE TEST PASSAGE CONTAINER */}
            {(currentQ.topic === 'cloze_test' || (currentQ as any).passage) && (currentQ as any).passage && (
              <div className="card" style={{
                padding: '18px 20px',
                marginBottom: '18px',
                background: 'var(--bg-surface-elevated)',
                borderLeft: '4px solid var(--primary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.5px' }}>
                    <BookOpen size={16} />
                    <span>CLOZE TEST PASSAGE</span>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: 800 }}>
                    Active: Blank {(activeQuiz.currentIndex % 5) + 1}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.8,
                  color: 'var(--text-main)',
                  background: 'var(--bg-surface)',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}>
                  {(() => {
                    const pText: string = (currentQ as any).passage;
                    const parts = pText.split(/(\[BLANK_\d+\])/g);

                    return parts.map((part, pIdx) => {
                      const match = part.match(/\[BLANK_(\d+)\]/);
                      if (match) {
                        const bNum = parseInt(match[1], 10);
                        const isActive = bNum === ((activeQuiz.currentIndex % 5) + 1);

                        return (
                          <span
                            key={pIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: isActive ? '3px 12px' : '2px 8px',
                              margin: '0 4px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              background: isActive ? 'var(--primary)' : 'var(--primary-light)',
                              color: isActive ? '#ffffff' : 'var(--primary)',
                              border: isActive ? '2px solid var(--primary)' : '1px dashed var(--primary)',
                              boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.45)' : 'none',
                              verticalAlign: 'baseline'
                            }}
                          >
                            {isActive ? `👉 Blank (${bNum})` : `Blank (${bNum})`}
                          </span>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Smart Question Canvas with Dynamic Topic Formats & Real-time Live Blank Preview */}
            <SmartQuestionCanvas
              question={currentQ}
              selectedOption={userChosen}
              onSelectOption={(idx) => selectOption(currentQ.id, idx)}
              showExplanation={showExplanation}
            />

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = userChosen === idx;
                const isCorrectOption = idx === currentQ.correctAnswer;
                
                let optionBg = 'var(--bg-surface)';
                let optionBorder = 'var(--border-color)';
                let optionColor = 'var(--text-main)';

                if (isSelected) {
                  optionBg = 'var(--primary-light)';
                  optionBorder = 'var(--primary)';
                  optionColor = 'var(--primary)';
                }

                // If user selected option, show instant feedback highlights
                if (userChosen !== undefined && showExplanation) {
                  if (isCorrectOption) {
                    optionBg = 'var(--success-bg)';
                    optionBorder = 'var(--success)';
                    optionColor = 'var(--success)';
                  } else if (isSelected && !isCorrectOption) {
                    optionBg = 'var(--error-bg)';
                    optionBorder = 'var(--error)';
                    optionColor = 'var(--error)';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(currentQ.id, idx)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: optionBg,
                      border: `2px solid ${optionBorder}`,
                      color: optionColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 600 : 500,
                      transition: 'all 0.15s ease',
                      wordBreak: 'break-word'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, paddingRight: '8px' }}>
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {userChosen !== undefined && showExplanation && isCorrectOption && (
                      <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                    )}
                    {userChosen !== undefined && showExplanation && isSelected && !isCorrectOption && (
                      <XCircle size={18} color="var(--error)" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* View Explanation Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  background: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lightbulb size={15} />
                <span>{showExplanation ? 'Hide Solution' : 'Show Solution'}</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={prevQuestion}
                  disabled={activeQuiz.currentIndex === 0}
                  className="btn-secondary"
                  style={{ opacity: activeQuiz.currentIndex === 0 ? 0.5 : 1, padding: '7px 14px', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <button
                  onClick={nextQuestion}
                  disabled={activeQuiz.currentIndex === activeQuiz.questions.length - 1}
                  className="btn-primary"
                  style={{ opacity: activeQuiz.currentIndex === activeQuiz.questions.length - 1 ? 0.5 : 1, padding: '7px 14px', fontSize: '0.85rem' }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Explanation Accordion Card */}
          {showExplanation && (
            <div className="card" style={{ padding: '20px', background: 'var(--bg-surface-elevated)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem' }}>
                <HelpCircle size={16} />
                <span>Detailed Explanation & Grammar Rule</span>
              </div>

              <SmartExplanation text={currentQ.explanation} />

              {currentQ.grammarRule && (
                <div style={{ background: 'var(--primary-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <strong>Rule Applied:</strong> {currentQ.grammarRule}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Question Palette */}
        <div>
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-main)' }}>Question Palette</h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {activeQuiz.questions.map((q, idx) => {
                const isCurrent = idx === activeQuiz.currentIndex;
                const isAnswered = activeQuiz.userAnswers[q.id] !== undefined;
                const isMarkedRev = activeQuiz.markedForReview[q.id];

                let bg = 'var(--bg-surface-elevated)';
                let border = 'var(--border-color)';
                let color = 'var(--text-muted)';

                if (isCurrent) {
                  border = 'var(--primary)';
                }

                if (isAnswered) {
                  bg = 'var(--success-bg)';
                  color = 'var(--success)';
                }
                if (isMarkedRev) {
                  bg = 'var(--warning-bg)';
                  color = 'var(--warning)';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: bg,
                      border: `2px solid ${border}`,
                      color: color,
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }} />
                <span>Marked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)' }} />
                <span>Unattempted</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
