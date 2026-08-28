import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { QuestionTopic } from '../types/quiz';
import { TOPIC_DETAILS, QUESTIONS_DATA } from '../data/questions';
import { 
  Play, 
  AlertCircle, 
  BookOpen, 
  CheckSquare, 
  ChevronRight,
  ArrowRight,
  Layers, 
  BookMarked, 
  Bookmark, 
  Sparkles, 
  Trophy, 
  Flame, 
  BarChart3,
  Search,
  Zap,
  CheckCircle2,
  XCircle
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

const TOPIC_ICONS: Record<QuestionTopic, { icon: React.ReactNode; color: string }> = {
  spot_error: { icon: <FlatIconSpotError size={20} />, color: '#ef4444' },
  sentence_improvement: { icon: <FlatIconSentenceImprovement size={20} />, color: '#3b82f6' },
  fill_blanks: { icon: <FlatIconFillBlanks size={20} />, color: '#f59e0b' },
  one_word: { icon: <FlatIconOneWord size={20} />, color: '#8b5cf6' },
  idioms_phrases: { icon: <FlatIconIdioms size={20} />, color: '#ec4899' },
  synonyms: { icon: <FlatIconSynonyms size={20} />, color: '#10b981' },
  antonyms: { icon: <FlatIconAntonyms size={20} />, color: '#f43f5e' },
  misspelled: { icon: <FlatIconMisspelled size={20} />, color: '#06b6d4' },
  cloze_test: { icon: <FlatIconClozeTest size={20} />, color: '#6366f1' }
};

export const Dashboard: React.FC = () => {
  const { 
    openTopicSets,
    startCustomQuiz, 
    setCurrentView, 
    quizAttempts, 
    mistakeQuestionIds,
    bookmarkedQuestionIds,
    streakDays,
    xpPoints
  } = useApp();

  const [activeExamFilter, setActiveExamFilter] = useState<string>('ALL');

  const totalAttempted = quizAttempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const totalCorrect = quizAttempts.reduce((acc, curr) => acc + curr.correctCount, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const topicsList = Object.keys(TOPIC_DETAILS) as QuestionTopic[];
  const examTagsList = ['ALL', 'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC CPO'];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ─── 1. HERO SPOTLIGHT CARD (Stitch Style) ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-dim)'
          }}>
            <Zap size={13} color="var(--accent)" />
            <span>SSC English Master • 18,000+ PYQs (2018–2026)</span>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, margin: '0 0 6px 0' }}>
            Master SSC English
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Previous year questions, live AI grammar explanations & 120 golden rules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => startCustomQuiz('Daily Mock Speed Test', QUESTIONS_DATA.slice(0, 10), 5)}
            className="btn-primary"
            style={{ padding: '11px 22px', fontSize: '14px', fontWeight: 800 }}
          >
            <Play size={15} fill="#ffffff" />
            <span>Start Daily Mock</span>
          </button>

          <button
            onClick={() => setCurrentView('grammar_checker')}
            className="btn-secondary"
            style={{ padding: '11px 18px', fontSize: '14px', fontWeight: 700 }}
          >
            <Sparkles size={15} color="var(--primary)" />
            <span>AI Checker</span>
          </button>
        </div>
      </div>

      {/* ─── 2. CORE FEATURES (3 STITCH CARDS) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Feature 1: AI Grammar Scanner */}
        <div 
          onClick={() => setCurrentView('grammar_checker')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              flexShrink: 0
            }}>
              <FlatIconAIChecker size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  AI Grammar Scanner
                </h3>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  AI LIVE
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Instant sentence error scan & 120 golden rules mapping
              </p>
            </div>
          </div>

          <ChevronRight size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        </div>

        {/* Feature 2: 120 Golden Rules */}
        <div 
          onClick={() => setCurrentView('grammar')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <FlatIcon120Rules size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  120 Golden Rules
                </h3>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  1,200 PYQs
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Complete grammar theory, exam traps & formulas
              </p>
            </div>
          </div>

          <ChevronRight size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        </div>

        {/* Feature 3: Smart Vocab Bank */}
        <div 
          onClick={() => setCurrentView('vocab')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              flexShrink: 0
            }}>
              <FlatIconVocabBank size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  AI Vocab Engine
                </h3>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                  1.6k Words
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Hindi meanings, mnemonics tricks & SSC PYQs
              </p>
            </div>
          </div>

          <ChevronRight size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        </div>

      </div>

      {/* ─── 3. REVISION VAULTS (2 TILES) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div 
          onClick={() => setCurrentView('mistakes')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="var(--error)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>Mistake Vault</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{mistakeQuestionIds.length} to revise</div>
            </div>
          </div>
          <ChevronRight size={15} color="var(--text-dim)" />
        </div>

        <div 
          onClick={() => setCurrentView('bookmarks')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={20} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>Bookmarks</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{bookmarkedQuestionIds.length} saved</div>
            </div>
          </div>
          <ChevronRight size={15} color="var(--text-dim)" />
        </div>
      </div>

      {/* ─── 4. OFFICIAL SSC PYQ TOPIC LIST ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            SSC Practice Chapters
          </h2>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {examTagsList.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveExamFilter(tag)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: activeExamFilter === tag ? 'var(--primary)' : 'var(--bg-surface)',
                  color: activeExamFilter === tag ? '#ffffff' : 'var(--text-dim)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {topicsList.map((topicKey, index) => {
            const topic = TOPIC_DETAILS[topicKey];
            const topicIconObj = TOPIC_ICONS[topicKey];
            const isLast = index === topicsList.length - 1;
            const topicCount = QUESTIONS_DATA.filter(q => 
              q.topic === topicKey && 
              (activeExamFilter === 'ALL' || (q.examTag && q.examTag.toUpperCase().includes(activeExamFilter.toUpperCase())))
            ).length;

            return (
              <div
                key={topicKey}
                onClick={() => openTopicSets(topicKey)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-elevated)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${topicIconObj.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {topicIconObj.icon}
                </div>

                {/* Title + Desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {topic.title}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {topicCount} Qs
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topic.desc}
                  </div>
                </div>

                {/* Action arrow */}
                <ChevronRight size={16} color="var(--text-dim)" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
