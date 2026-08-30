import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { QuestionTopic } from '../types/quiz';
import { TOPIC_DETAILS, getTopicCount, getQuestionsByTopic } from '../data/questions';
import { 
  Play, 
  AlertCircle, 
  ChevronRight,
  Bookmark, 
  Flame, 
  Zap,
  Layers
} from 'lucide-react';
import {
  FlatIconSpotError,
  FlatIconSentenceImprovement,
  FlatIconFillBlanks,
  FlatIconClozeTest,
  FlatIconOneWord,
  FlatIconIdioms,
  FlatIconSynonyms,
  FlatIconAntonyms,
  FlatIconMisspelled,
  FlatIcon120Rules,
  FlatIconAIChecker,
  FlatIconVocabBank
} from './FlatIcons';

const TOPIC_ICONS: Record<QuestionTopic, { icon: React.ReactNode; color: string; bg: string }> = {
  spot_error: { icon: <FlatIconSpotError size={20} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  sentence_improvement: { icon: <FlatIconSentenceImprovement size={20} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  fill_blanks: { icon: <FlatIconFillBlanks size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  one_word: { icon: <FlatIconOneWord size={20} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  idioms_phrases: { icon: <FlatIconIdioms size={20} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  synonyms: { icon: <FlatIconSynonyms size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  antonyms: { icon: <FlatIconAntonyms size={20} />, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
  misspelled: { icon: <FlatIconMisspelled size={20} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  cloze_test: { icon: <FlatIconClozeTest size={20} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' }
};

export const Dashboard: React.FC = () => {
  const { 
    openTopicSets,
    startCustomQuiz, 
    setCurrentView, 
    mistakeQuestionIds,
    bookmarkedQuestionIds,
    streakDays,
    xpPoints,
    userName,
    isProUser,
    openPricingModal
  } = useApp();

  const [activeExamFilter, setActiveExamFilter] = useState<string>('ALL');
  const topicsList = Object.keys(TOPIC_DETAILS) as QuestionTopic[];
  const examTagsList = ['ALL', 'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC CPO'];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 14px 40px 14px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* ─── 1. CLEAN USER GREETING & STREAK BAR ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
            {userName && userName !== 'SSC Aspirant' ? `Namaste, ${userName} 👋` : 'SSC English PRO 🎯'}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
            18,000+ PYQs • 120 Rules • AI Scanner
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#f59e0b'
          }}>
            <Flame size={14} fill="#f59e0b" />
            <span>{streakDays} Day Streak</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            <Zap size={14} fill="var(--primary)" />
            <span>{xpPoints} XP</span>
          </div>
        </div>
      </div>

      {/* ─── 2. HERO DAILY SPEED MOCK CARD ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '16px',
        padding: '18px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)',
        cursor: 'pointer'
      }}
      onClick={() => startCustomQuiz('Daily Mock Speed Test', getQuestionsByTopic('spot_error').slice(0, 10), 5)}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800, marginBottom: '6px' }}>
            <span>⚡ DAILY SPEED MOCK</span>
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
            10 Mixed Exam PYQs (5 Mins)
          </h2>
          <p style={{ fontSize: '12px', margin: 0, opacity: 0.9, lineHeight: 1.3 }}>
            Spot error, improvement, vocab & idioms speed booster
          </p>
        </div>

        <button style={{
          background: '#ffffff',
          color: '#4f46e5',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '10px',
          fontWeight: 800,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <Play size={14} fill="#4f46e5" />
          <span>Start</span>
        </button>
      </div>

      {/* ─── 3. 4-TILE PRO LEARNING HUB (2x2 GRID) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        
        {/* Tile 1: AI Grammar Scanner */}
        <div 
          onClick={() => setCurrentView('grammar_checker')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7'
          }}>
            <FlatIconAIChecker size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              AI Scanner
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
              Spot traps & auto-fix sentences
            </div>
          </div>
        </div>

        {/* Tile 2: 120 Golden Rules */}
        <div 
          onClick={() => setCurrentView('grammar')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <FlatIcon120Rules size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              120 Golden Rules
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
              Grammar theory & formulas
            </div>
          </div>
        </div>

        {/* Tile 3: Vocab Bank */}
        <div 
          onClick={() => setCurrentView('vocab')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <FlatIconVocabBank size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              Vocab Bank
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
              6,400+ words with Hindi & tricks
            </div>
          </div>
        </div>

        {/* Tile 4: Full PYQ Chapters */}
        <div 
          onClick={() => openTopicSets(null)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              PYQ Chapters
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
              18,000+ topic-wise questions
            </div>
          </div>
        </div>

      </div>

      {/* ─── 4. SMART REVISION STRIP ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div 
          onClick={() => setCurrentView('mistakes')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '10px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={17} color="var(--error)" />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>Mistake Vault</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>{mistakeQuestionIds.length} to fix</div>
            </div>
          </div>
          <ChevronRight size={14} color="var(--text-dim)" />
        </div>

        <div 
          onClick={() => setCurrentView('bookmarks')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '10px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={17} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>Saved Notes</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>{bookmarkedQuestionIds.length} bookmarks</div>
            </div>
          </div>
          <ChevronRight size={14} color="var(--text-dim)" />
        </div>
      </div>

      {/* ─── 5. OFFICIAL SSC PYQ TOPIC LIST ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Practice Chapters
          </h2>

          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {examTagsList.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveExamFilter(tag)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: activeExamFilter === tag ? 'var(--primary)' : 'var(--bg-surface)',
                  color: activeExamFilter === tag ? '#ffffff' : 'var(--text-dim)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {topicsList.map((topicKey) => {
            const topic = TOPIC_DETAILS[topicKey];
            const topicIconObj = TOPIC_ICONS[topicKey];
            const topicCount = getTopicCount(topicKey);

            return (
              <div
                key={topicKey}
                onClick={() => openTopicSets(topicKey)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { 
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-elevated)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => { 
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: topicIconObj?.bg || 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {topicIconObj?.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {topic.title}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '5px', background: 'var(--bg-surface-elevated)', color: 'var(--text-dim)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        {topicCount} Qs
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topic.desc}
                    </div>
                  </div>
                </div>

                {/* Action arrow */}
                <ChevronRight size={15} color="var(--text-dim)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
