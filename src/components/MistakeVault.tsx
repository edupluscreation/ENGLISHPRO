import React from 'react';
import { useApp } from '../context/AppContext';
import { QUESTIONS_DATA } from '../data/questions';
import { AlertTriangle, Play, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

export const MistakeVault: React.FC = () => {
  const { mistakeQuestionIds, removeMistake, startCustomQuiz, setCurrentView } = useApp();

  const mistakeQuestions = QUESTIONS_DATA.filter(q => mistakeQuestionIds.includes(q.id));

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
            <AlertTriangle size={16} />
            <span>PERSONAL MISTAKE REVISION</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Mistake Vault</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Re-test questions you previously answered incorrectly until you achieve 100% accuracy.
          </p>
        </div>

        {mistakeQuestions.length > 0 && (
          <button 
            onClick={() => startCustomQuiz('Mistake Vault Practice Test', mistakeQuestions, 10)}
            className="btn-primary"
            style={{ background: 'var(--error)' }}
          >
            <Play size={18} />
            <span>Practice {mistakeQuestions.length} Mistakes Now</span>
          </button>
        )}
      </div>

      {mistakeQuestions.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-main)' }}>Your Mistake Vault is Empty!</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 20px auto' }}>
            Great job! You haven't made any uncorrected errors in your recent quiz attempts.
          </p>
          <button onClick={() => setCurrentView('dashboard')} className="btn-primary">
            Start a Practice Quiz
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mistakeQuestions.map(q => (
            <div key={q.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--error)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-error" style={{ textTransform: 'uppercase' }}>
                  {q.topic.replace('_', ' ')}
                </span>

                <button 
                  onClick={() => removeMistake(q.id)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  title="Remove from Mistake Vault"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>

              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.4 }}>
                {q.questionText}
              </h4>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>
                  CORRECT ANSWER: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginTop: '8px' }}>
                  <HelpCircle size={14} />
                  <span>Grammar Note:</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '2px' }}>
                  {q.explanation}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
