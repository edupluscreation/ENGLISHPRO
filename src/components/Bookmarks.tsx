import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getQuestionById } from '../data/questions';
import type { Question } from '../types/quiz';
import { Bookmark, Play, Trash2, HelpCircle, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const Bookmarks: React.FC = () => {
  const { bookmarkedQuestionIds, toggleBookmark, startCustomQuiz, setCurrentView } = useApp();

  const savedQuestions = useMemo(() => {
    return bookmarkedQuestionIds.map(id => getQuestionById(id)).filter(Boolean) as Question[];
  }, [bookmarkedQuestionIds]);

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '14px 12px 36px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      
      {/* Top Header with Back Button */}
      <div style={{ marginBottom: '4px' }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          style={{
            marginBottom: '8px',
            padding: '5px 10px',
            borderRadius: '7px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={13} />
          <span>Back to Home</span>
        </button>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <Bookmark size={13} color="var(--accent)" fill="var(--accent)" />
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                SAVED QUESTIONS LIBRARY
              </span>
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
              Bookmarked Questions
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '11px', margin: 0 }}>
              {savedQuestions.length} questions saved for targeted practice & revision.
            </p>
          </div>

          {savedQuestions.length > 0 && (
            <button 
              onClick={() => startCustomQuiz('Bookmarked Questions Test', savedQuestions, Math.max(5, Math.ceil(savedQuestions.length * 0.8)))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Play size={12} fill="#ffffff" />
              <span>Practice All</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions List or Empty State */}
      {savedQuestions.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '30px 16px',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Bookmark size={28} color="var(--accent)" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            No Saved Bookmarks Yet
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 14px auto' }}>
            While taking quizzes or viewing PYQs, tap the bookmark icon to save tricky questions here.
          </p>
          <button
            onClick={() => setCurrentView('topic_sets')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Explore PYQ Sets
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
          {savedQuestions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {q.topic.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {q.examTag || 'SSC PYQ'}
                  </span>
                </div>

                <button 
                  onClick={() => toggleBookmark(q.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                  title="Remove bookmark"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4, fontWeight: 600, wordBreak: 'break-word' }}>
                {idx + 1}. {q.questionText}
              </p>

              {/* Solution Pill */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '11.5px'
              }}>
                <div style={{ fontWeight: 800, color: 'var(--success)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} color="var(--success)" />
                  <span>Ans: ({String.fromCharCode(97 + q.correctAnswer)}) {q.options[q.correctAnswer]}</span>
                </div>
                {q.explanation && (
                  <div style={{ color: 'var(--text-dim)', lineHeight: 1.4, marginTop: '2px' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Bookmarks;
