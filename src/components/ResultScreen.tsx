import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SmartExplanation } from './SmartExplanation';
import { getQuestionsByTopic } from '../data/questions';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Home, 
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Layers,
  BookOpen
} from 'lucide-react';
import { getPYQImportanceBadge } from '../utils/pyqImportance';

export const ResultScreen: React.FC = () => {
  const { lastAttempt, activeQuiz, setCurrentView, startTopicQuiz, openTopicSets, startSetQuiz } = useApp();

  useEffect(() => {
    if (lastAttempt && (lastAttempt.score / (lastAttempt.totalQuestions * 2)) >= 0.6) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [lastAttempt]);

  if (!lastAttempt || !activeQuiz) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>No Result Found</h2>
        <button onClick={() => setCurrentView('dashboard')} className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const maxScore = lastAttempt.totalQuestions * 2;
  const accuracy = Math.round((lastAttempt.correctCount / Math.max(lastAttempt.totalQuestions - lastAttempt.skippedCount, 1)) * 100);

  // Determine current set number and prepare next set if this was a set quiz
  const match = activeQuiz.quizTitle.match(/Set\s+(\d+)/i);
  const currentSetNum = match ? parseInt(match[1], 10) : 1;
  const nextSetNum = currentSetNum + 1;
  
  const allTopicQuestions = activeQuiz.topic ? getQuestionsByTopic(activeQuiz.topic) : [];
  const SET_SIZE = 30;
  const nextSetStart = (nextSetNum - 1) * SET_SIZE;
  const nextSetQuestions = allTopicQuestions.slice(nextSetStart, nextSetStart + SET_SIZE);
  const hasNextSet = Boolean(activeQuiz.topic && nextSetQuestions.length > 0);

  return (
    <div style={{ padding: '16px 12px 32px 12px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Result Hero Header */}
      <div className="card" style={{ padding: '24px 16px', textAlign: 'center', marginBottom: '20px', borderRadius: '16px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
        }}>
          <Trophy size={26} />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>Test Completed!</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '18px' }}>{lastAttempt.title}</p>

        {/* Score & Key Performance Indicators (Clean 2x2 Grid) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>Total Marks</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
              {lastAttempt.score} <span style={{ fontSize: '12px', fontWeight: 500 }}>/ {maxScore}</span>
            </div>
          </div>

          <div style={{ background: 'var(--success-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--success-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>Accuracy Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{accuracy}%</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>Correct / Wrong</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              <span style={{ color: 'var(--success)' }}>{lastAttempt.correctCount}</span> / <span style={{ color: 'var(--error)' }}>{lastAttempt.wrongCount}</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>Time Taken</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Clock size={16} />
              <span>{Math.floor(lastAttempt.timeSpentSeconds / 60)}m {lastAttempt.timeSpentSeconds % 60}s</span>
            </div>
          </div>
        </div>

        {/* Navigation & Next Test Action Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          
          {/* Primary Action Row */}
          <div style={{ display: 'grid', gridTemplateColumns: hasNextSet ? '1fr 1fr' : '1fr', gap: '10px' }}>
            {hasNextSet && (
              <button
                onClick={() => startSetQuiz(activeQuiz.topic!, nextSetNum, nextSetQuestions)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span>Start Set {nextSetNum}</span>
                <ArrowRight size={16} />
              </button>
            )}

            {activeQuiz.topic && (
              <button
                onClick={() => openTopicSets(activeQuiz.topic ?? null)}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)'
                }}
              >
                <Layers size={16} />
                <span>All {activeQuiz.topic.replace('_', ' ').toUpperCase()} Sets</span>
              </button>
            )}
          </div>

          {/* Secondary Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {activeQuiz.topic && (
              <button
                onClick={() => startSetQuiz(activeQuiz.topic!, currentSetNum, activeQuiz.questions)}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
              >
                <RotateCcw size={14} />
                <span>Re-attempt Set {currentSetNum}</span>
              </button>
            )}

            <button
              onClick={() => openTopicSets(null)}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <BookOpen size={14} />
              <span>All PYQ Chapters</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <Home size={14} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Review Wrong Answers Pill */}
          {lastAttempt.wrongCount > 0 && (
            <button
              onClick={() => setCurrentView('mistakes')}
              style={{
                background: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                color: 'var(--error)',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={14} />
              <span>Review {lastAttempt.wrongCount} Mistakes in Mistake Vault</span>
            </button>
          )}

        </div>
      </div>

      {/* Answer Key & Detailed Solution Breakdown */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Answer Key & Detailed Analysis
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
            {activeQuiz.questions.length} Questions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeQuiz.questions.map((q, idx) => {
            const userChoice = lastAttempt.userAnswers[q.id];
            const isCorrect = userChoice === q.correctAnswer;
            const isSkipped = userChoice === undefined;

            return (
              <div 
                key={q.id} 
                style={{ 
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px 16px', 
                  borderLeft: `4px solid ${isCorrect ? '#10b981' : isSkipped ? '#94a3b8' : 'var(--error)'}`,
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '11.5px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Q{idx + 1}. {q.topic.replace('_', ' ').toUpperCase()}
                    </span>
                    {(() => {
                      const pyqBadge = getPYQImportanceBadge(q);
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '9.5px',
                            fontWeight: 800,
                            background: pyqBadge.bg,
                            color: pyqBadge.color,
                            border: `1px solid ${pyqBadge.borderColor}`,
                            padding: '1px 6px',
                            borderRadius: '5px'
                          }}
                        >
                          <span>{pyqBadge.icon}</span>
                          <span>{pyqBadge.tag}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: isCorrect ? 'var(--success-bg)' : isSkipped ? 'var(--bg-surface-elevated)' : 'var(--error-bg)',
                    color: isCorrect ? 'var(--success)' : isSkipped ? 'var(--text-dim)' : 'var(--error)',
                    border: `1px solid ${isCorrect ? 'var(--success-border)' : isSkipped ? 'var(--border-color)' : 'var(--error-border)'}`
                  }}>
                    {isCorrect ? 'CORRECT (+2.0)' : isSkipped ? 'SKIPPED (0.0)' : 'INCORRECT (-0.5)'}
                  </span>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                  {q.questionText}
                </h4>

                {/* Option comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', marginBottom: '10px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isRightOption = oIdx === q.correctAnswer;
                    const isSelectedBySelf = oIdx === userChoice;

                    let bg = 'var(--bg-surface-elevated)';
                    let color = 'var(--text-main)';
                    let border = '1px solid var(--border-color)';

                    if (isRightOption) {
                      bg = 'var(--success-bg)';
                      color = 'var(--success)';
                      border = '1px solid var(--success-border)';
                    } else if (isSelectedBySelf && !isRightOption) {
                      bg = 'var(--error-bg)';
                      color = 'var(--error)';
                      border = '1px solid var(--error-border)';
                    }

                    return (
                      <div key={oIdx} style={{ padding: '8px 10px', borderRadius: '7px', background: bg, color: color, border, fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 800 }}>{String.fromCharCode(65 + oIdx)}.</span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isRightOption && <CheckCircle size={13} />}
                        {isSelectedBySelf && !isRightOption && <XCircle size={13} />}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                    <HelpCircle size={12} />
                    <span>Solution Explanation:</span>
                  </div>
                  <SmartExplanation text={q.explanation} />
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
