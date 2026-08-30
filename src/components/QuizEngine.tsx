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
  ChevronsRight,
  ChevronsLeft,
  Send,
  HelpCircle,
  Lightbulb,
  Tag,
  BookOpen
} from 'lucide-react';
import { getPYQImportanceBadge } from '../utils/pyqImportance';

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
    openTopicSets,
    setCurrentView 
  } = useApp();

  const [timeLeft, setTimeLeft] = useState<number>(activeQuiz?.timeRemainingSeconds || 300);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);

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
    <div style={{ padding: '14px 12px 36px 12px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* ─── TOP QUICK BAR: BACK BUTTON & JUMP TO LAST SLIDE/QUESTION ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* Back to Sets Button */}
        <button
          onClick={() => openTopicSets(activeQuiz.topic ?? null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={14} />
          <span>Exit to Sets</span>
        </button>

        {/* Quick Jump Buttons: First & Last Question / Slide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {activeQuiz.currentIndex > 0 && (
            <button
              onClick={() => goToQuestion(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Go to First Question"
            >
              <ChevronsLeft size={13} />
              <span>Q 1</span>
            </button>
          )}

          {activeQuiz.currentIndex < activeQuiz.questions.length - 1 && (
            <button
              onClick={() => goToQuestion(activeQuiz.questions.length - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 9px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Jump to Last Slide/Question"
            >
              <span>Last Question (Q {activeQuiz.questions.length})</span>
              <ChevronsRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Quiz Header Control Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '12px 14px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            padding: '2px 7px',
            borderRadius: '5px',
            display: 'inline-block',
            marginBottom: '3px'
          }}>
            SSC PRACTICE ENGINE
          </span>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
            {activeQuiz.quizTitle}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Countdown Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: timeLeft < 60 ? 'var(--error-bg)' : 'var(--bg-surface-elevated)',
            color: timeLeft < 60 ? 'var(--error)' : 'var(--text-main)',
            padding: '5px 10px',
            borderRadius: '7px',
            fontWeight: 800,
            fontSize: '12px',
            border: `1px solid ${timeLeft < 60 ? 'var(--error-border)' : 'var(--border-color)'}`
          }}>
            <Clock size={13} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => submitQuiz()}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 13px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Send size={12} />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      {/* ─── GOOGLE M3 MULTI-SEGMENT LIVE PROGRESS BAR ─── */}
      {(() => {
        const totalQ = activeQuiz.questions.length;
        const answeredQ = Object.keys(activeQuiz.userAnswers).length;
        const markedQ = Object.keys(activeQuiz.markedForReview).filter(k => activeQuiz.markedForReview[k]).length;
        return (
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              height: '5px',
              width: '100%',
              background: 'var(--bg-surface-elevated)',
              borderRadius: '9999px',
              display: 'flex',
              overflow: 'hidden',
              gap: '2px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ width: `${(answeredQ / totalQ) * 100}%`, background: '#10b981', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${(markedQ / totalQ) * 100}%`, background: '#f59e0b', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ color: '#10b981' }}>✔ {answeredQ} Answered</span>
              <span style={{ color: '#f59e0b' }}>★ {markedQ} Marked</span>
              <span style={{ color: 'var(--text-dim)' }}>Q {activeQuiz.currentIndex + 1} / {totalQ}</span>
            </div>
          </div>
        );
      })()}

      <div className="quiz-container-grid">
        
        {/* Left Column: Question Area */}
        <div>
          <div className="card" style={{ padding: '12px 14px', marginBottom: '10px', borderRadius: '12px' }}>
            
            {/* Question Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--primary)' }}>
                  Q {activeQuiz.currentIndex + 1} / {activeQuiz.questions.length}
                </span>
                {(() => {
                  const pyqBadge = getPYQImportanceBadge(currentQ);
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: pyqBadge.bg,
                        color: pyqBadge.color,
                        border: `1px solid ${pyqBadge.borderColor}`,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        letterSpacing: '0.01em'
                      }}
                    >
                      <span>{pyqBadge.icon}</span>
                      <span>{pyqBadge.tag}</span>
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleMarkReview(currentQ.id)}
                  style={{
                    background: isMarked ? 'var(--warning-bg)' : 'transparent',
                    color: isMarked ? 'var(--warning)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {isMarked ? '★ Marked' : '☆ Mark'}
                </button>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  style={{
                    background: isBookmarked(currentQ.id) ? 'var(--primary-light)' : 'transparent',
                    color: isBookmarked(currentQ.id) ? 'var(--primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <Bookmark size={11} fill={isBookmarked(currentQ.id) ? 'var(--primary)' : 'none'} />
                  <span>{isBookmarked(currentQ.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* CLOZE TEST PASSAGE CONTAINER */}
            {(currentQ.topic === 'cloze_test' || (currentQ as any).passage) && (currentQ as any).passage && (
              <div className="card" style={{
                padding: '10px 12px',
                marginBottom: '10px',
                background: 'var(--bg-surface-elevated)',
                borderLeft: '3px solid var(--primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: 800, fontSize: '11px' }}>
                    <BookOpen size={13} />
                    <span>CLOZE PASSAGE</span>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 800 }}>
                    Blank {(activeQuiz.currentIndex % 5) + 1}
                  </span>
                </div>

                <div style={{
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                  color: 'var(--text-main)',
                  background: 'var(--bg-surface)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  maxHeight: '120px',
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
                              padding: isActive ? '1px 6px' : '1px 4px',
                              margin: '0 2px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '11px',
                              background: isActive ? 'var(--primary)' : 'var(--primary-light)',
                              color: isActive ? '#ffffff' : 'var(--primary)',
                              border: isActive ? '1.5px solid var(--primary)' : '1px dashed var(--primary)',
                              verticalAlign: 'baseline'
                            }}
                          >
                            {isActive ? `👉 (${bNum})` : `(${bNum})`}
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

            {/* Options List (Compact 4-Button Grid) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
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
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: optionBg,
                      border: `1.5px solid ${optionBorder}`,
                      color: optionColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontSize: '13px',
                      minHeight: '38px',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease',
                      wordBreak: 'break-word',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '6px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span style={{ lineHeight: 1.35 }}>{opt}</span>
                    </div>

                    {userChosen !== undefined && showExplanation && isCorrectOption && (
                      <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                    )}
                    {userChosen !== undefined && showExplanation && isSelected && !isCorrectOption && (
                      <XCircle size={16} color="var(--error)" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* View Explanation & Navigation Buttons (Single Compact Row) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  background: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Lightbulb size={13} />
                <span>{showExplanation ? 'Hide' : 'Solution'}</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={prevQuestion}
                  disabled={activeQuiz.currentIndex === 0}
                  className="btn-secondary"
                  style={{ opacity: activeQuiz.currentIndex === 0 ? 0.5 : 1, padding: '6px 13px', fontSize: '12px', borderRadius: '7px' }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                {activeQuiz.currentIndex === activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => submitQuiz()}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Send size={13} />
                    <span>Submit Test</span>
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="btn-primary"
                    style={{ padding: '6px 15px', fontSize: '12px', borderRadius: '7px' }}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Explanation Accordion Card */}
          {showExplanation && (
            <div style={{
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: '10px',
              marginBottom: '10px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 800, marginBottom: '6px', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <HelpCircle size={13} />
                <span>Official Solution & Explanation</span>
              </div>

              <SmartExplanation text={currentQ.explanation} />

              {currentQ.grammarRule && (
                <div style={{ background: 'var(--primary-light)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: 700, marginTop: '8px' }}>
                  📐 <strong>Rule Applied:</strong> {currentQ.grammarRule}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ─── TOGGLEABLE QUESTION PALETTE SECTION ─── */}
        <div style={{ marginTop: '10px' }}>
          {/* Toggle Button for Question Palette */}
          <button
            onClick={() => setShowPalette(!showPalette)}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              marginBottom: showPalette ? '10px' : '0',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800
              }}>
                📑
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                  Question Palette ({activeQuiz.currentIndex + 1} / {activeQuiz.questions.length})
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  {Object.keys(activeQuiz.userAnswers).length} Answered • {Object.keys(activeQuiz.markedForReview).length} Marked
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'var(--primary-light)',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              {showPalette ? 'Hide ▲' : 'Open Palette ▼'}
            </span>
          </button>

          {/* Question Palette Grid (Hidden by default, shown when user clicks) */}
          {showPalette && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '12px 14px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))',
                gap: '6px',
                marginBottom: '12px'
              }}>
                {activeQuiz.questions.map((q, idx) => {
                  const isCurrent = idx === activeQuiz.currentIndex;
                  const isAnswered = activeQuiz.userAnswers[q.id] !== undefined;
                  const isMarkedRev = activeQuiz.markedForReview[q.id];

                  let bg = 'var(--bg-surface-elevated)';
                  let color = 'var(--text-dim)';
                  let border = '1px solid var(--border-color)';

                  if (isAnswered) {
                    bg = '#10b981';
                    color = '#ffffff';
                    border = '1px solid #10b981';
                  }

                  if (isMarkedRev) {
                    bg = '#f59e0b';
                    color = '#ffffff';
                    border = '1px solid #f59e0b';
                  }

                  if (isCurrent) {
                    border = '2px solid var(--primary)';
                    if (!isAnswered && !isMarkedRev) {
                      color = 'var(--primary)';
                      bg = 'var(--primary-light)';
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        goToQuestion(idx);
                        setShowPalette(false);
                      }}
                      style={{
                        height: '34px',
                        borderRadius: '7px',
                        background: bg,
                        color: color,
                        border: border,
                        fontWeight: 800,
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '10px',
                color: 'var(--text-dim)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>Answered ({Object.keys(activeQuiz.userAnswers).length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                  <span>Marked ({Object.keys(activeQuiz.markedForReview).length})</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
