import React from 'react';
import { useApp } from '../context/AppContext';
import { QUESTIONS_DATA } from '../data/questions';
import { Bookmark, Play, Trash2, HelpCircle } from 'lucide-react';

export const Bookmarks: React.FC = () => {
  const { bookmarkedQuestionIds, toggleBookmark, startCustomQuiz, setCurrentView } = useApp();

  const savedQuestions = QUESTIONS_DATA.filter(q => bookmarkedQuestionIds.includes(q.id));

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
            <Bookmark size={16} fill="var(--primary)" />
            <span>SAVED QUESTIONS LIBRARY</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Bookmarked Questions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review questions you saved for revision later.
          </p>
        </div>

        {savedQuestions.length > 0 && (
          <button 
            onClick={() => startCustomQuiz('Bookmarked Questions Test', savedQuestions, 10)}
            className="btn-primary"
          >
            <Play size={18} />
            <span>Practice {savedQuestions.length} Saved Questions</span>
          </button>
        )}
      </div>

      {savedQuestions.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Bookmark size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-main)' }}>No Saved Questions Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 20px auto' }}>
            While attempting quizzes, click the bookmark icon on any question to save it here for future revision.
          </p>
          <button onClick={() => setCurrentView('dashboard')} className="btn-primary">
            Explore Quizzes
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {savedQuestions.map(q => (
            <div key={q.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                  {q.topic.replace('_', ' ')}
                </span>

                <button 
                  onClick={() => toggleBookmark(q.id)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  title="Remove bookmark"
                >
                  <Trash2 size={14} />
                  <span>Remove Bookmark</span>
                </button>
              </div>

              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.4 }}>
                {q.questionText}
              </h4>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 18px', borderRadius: 'var(--radius-sm)' }}>
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
