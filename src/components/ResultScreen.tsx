import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SmartExplanation } from './SmartExplanation';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Home, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const { lastAttempt, activeQuiz, setCurrentView, startTopicQuiz } = useApp();

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

  return (
    <div style={{ padding: '32px 24px', maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Result Hero Header */}
      <div className="card" style={{ padding: '36px', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
        }}>
          <Trophy size={36} />
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Quiz Completed!</h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{lastAttempt.title}</p>

        {/* Score & Key Performance Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Total Marks</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              {lastAttempt.score} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ {maxScore}</span>
            </div>
          </div>

          <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Accuracy Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>{accuracy}%</div>
          </div>

          <div style={{ background: 'var(--warning-bg)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>Correct / Wrong</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
              {lastAttempt.correctCount} <span style={{ fontSize: '1rem', color: 'var(--error)' }}>/ {lastAttempt.wrongCount}</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time Taken</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Clock size={20} />
              <span>{Math.floor(lastAttempt.timeSpentSeconds / 60)}m {lastAttempt.timeSpentSeconds % 60}s</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentView('dashboard')} className="btn-secondary">
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          {activeQuiz.topic && (
            <button onClick={() => startTopicQuiz(activeQuiz.topic!)} className="btn-primary">
              <RotateCcw size={18} />
              <span>Re-attempt Topic</span>
            </button>
          )}

          {lastAttempt.wrongCount > 0 && (
            <button onClick={() => setCurrentView('mistakes')} className="btn-primary" style={{ background: 'var(--error)' }}>
              <AlertTriangle size={18} />
              <span>Review {lastAttempt.wrongCount} Wrong Answers</span>
            </button>
          )}
        </div>
      </div>

      {/* Answer Key & Detailed Solution Breakdown */}
      <div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--text-main)' }}>Complete Answer Key & Analysis</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeQuiz.questions.map((q, idx) => {
            const userChoice = lastAttempt.userAnswers[q.id];
            const isCorrect = userChoice === q.correctAnswer;
            const isSkipped = userChoice === undefined;

            return (
              <div 
                key={q.id} 
                className="card" 
                style={{ 
                  padding: '24px', 
                  borderLeft: `5px solid ${isCorrect ? 'var(--success)' : isSkipped ? 'var(--text-muted)' : 'var(--error)'}` 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Q{idx + 1}. {q.topic.replace('_', ' ').toUpperCase()}
                  </span>

                  <span className={`badge ${isCorrect ? 'badge-success' : isSkipped ? 'badge-warning' : 'badge-error'}`}>
                    {isCorrect ? 'CORRECT (+2.0)' : isSkipped ? 'SKIPPED (0.0)' : 'INCORRECT (-0.5)'}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {q.questionText}
                </h4>

                {/* Option comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isRightOption = oIdx === q.correctAnswer;
                    const isSelectedBySelf = oIdx === userChoice;

                    let bg = 'var(--bg-surface-elevated)';
                    let color = 'var(--text-main)';

                    if (isRightOption) {
                      bg = 'var(--success-bg)';
                      color = 'var(--success)';
                    } else if (isSelectedBySelf && !isRightOption) {
                      bg = 'var(--error-bg)';
                      color = 'var(--error)';
                    }

                    return (
                      <div key={oIdx} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: bg, color: color, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {isRightOption && <CheckCircle size={14} />}
                        {isSelectedBySelf && !isRightOption && <XCircle size={14} />}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 18px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
                    <HelpCircle size={14} />
                    <span>SOLUTION EXPLANATION:</span>
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
