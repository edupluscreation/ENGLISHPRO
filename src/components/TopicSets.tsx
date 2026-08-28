import React from 'react';
import { useApp } from '../context/AppContext';
import type { QuestionTopic } from '../types/quiz';
import { TOPIC_DETAILS, QUESTIONS_DATA } from '../data/questions';
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Lock,
  Sparkles
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
  FlatIconMisspelled
} from './FlatIcons';

const TOPIC_ICONS: Record<QuestionTopic, { icon: React.ReactNode; color: string; bg: string }> = {
  spot_error: { icon: <FlatIconSpotError size={28} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  sentence_improvement: { icon: <FlatIconSentenceImprovement size={28} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  fill_blanks: { icon: <FlatIconFillBlanks size={28} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  cloze_test: { icon: <FlatIconClozeTest size={28} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  one_word: { icon: <FlatIconOneWord size={28} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  idioms_phrases: { icon: <FlatIconIdioms size={28} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  synonyms: { icon: <FlatIconSynonyms size={28} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  antonyms: { icon: <FlatIconAntonyms size={28} />, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  misspelled: { icon: <FlatIconMisspelled size={28} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' }
};

export const TopicSets: React.FC = () => {
  const { 
    selectedTopic, 
    openTopicSets, 
    startSetQuiz, 
    setCurrentView, 
    quizAttempts,
    isProUser,
    openPricingModal,
    FREE_TESTS_LIMIT 
  } = useApp();

  const allTopics = Object.keys(TOPIC_DETAILS) as QuestionTopic[];

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: TOPIC DIRECTORY (When no specific topic is selected)
  // ══════════════════════════════════════════════════════════════════════════
  if (!selectedTopic) {
    return (
      <div style={{ padding: '36px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-primary">OFFICIAL SSC PYQ HUB</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>18,000+ QUESTIONS AVAILABLE</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            PYQ Practice Topics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '700px' }}>
            Select any topic below to access and attempt full 30-question speed test sets with 15-minute countdown timer and instant explanations.
          </p>
        </div>

        {/* Topics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {allTopics.map(tKey => {
            const detail = TOPIC_DETAILS[tKey];
            const iconConfig = TOPIC_ICONS[tKey];
            const topicQs = QUESTIONS_DATA.filter(q => q.topic === tKey);
            const setSize = tKey === 'cloze_test' ? 25 : 30;
            const setTotal = Math.ceil(topicQs.length / setSize);

            // Count completed attempts for this topic
            const completedAttempts = quizAttempts.filter(a => a.topic === tKey).length;

            return (
              <div
                key={tKey}
                onClick={() => openTopicSets(tKey)}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: iconConfig.bg,
                      color: iconConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${iconConfig.color}30`
                    }}>
                      {iconConfig.icon}
                    </div>

                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                      {detail.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {detail.title}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {detail.desc}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {setTotal} Test Sets
                    </span>

                    {completedAttempts > 0 ? (
                      <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} />
                        {completedAttempts} Attempted
                      </span>
                    ) : (
                      <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Start Practicing
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: TESTS LIST FOR THE SELECTED TOPIC
  // ══════════════════════════════════════════════════════════════════════════
  const topicDetails = TOPIC_DETAILS[selectedTopic];
  const allTopicQuestions = QUESTIONS_DATA.filter(q => q.topic === selectedTopic);
  const totalQuestions = allTopicQuestions.length;

  const SET_SIZE = selectedTopic === 'cloze_test' ? 25 : 30;
  const totalSets = Math.ceil(totalQuestions / SET_SIZE);

  // Group questions into sets
  const sets = Array.from({ length: totalSets }, (_, index) => {
    const startIdx = index * SET_SIZE;
    const endIdx = Math.min(startIdx + SET_SIZE, totalQuestions);
    const questions = allTopicQuestions.slice(startIdx, endIdx);
    return {
      setNumber: index + 1,
      startIdx: startIdx + 1,
      endIdx,
      questions
    };
  });

  return (
    <div style={{ padding: '28px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Navigation & Breadcrumbs */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => openTopicSets(null)}
          className="btn-secondary"
          style={{ marginBottom: '18px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ChevronLeft size={16} />
          <span>Back to All Topics</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary">OFFICIAL SSC PYQ</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              {selectedTopic === 'cloze_test' ? 'Cloze Test & Passage — 5-Passage Sets (25 Questions)' : `${topicDetails.title} — 30-Question Mock Test Sets`}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              {selectedTopic === 'cloze_test' 
                ? 'Each set contains 5 complete reading passages (5 questions per passage = 25 questions total) with live blank highlights.'
                : 'Attempt targeted 30-question speed tests with a 15-minute timer, +2 marks per correct, -0.5 negative marking, and instant solutions.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface-elevated)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <Layers size={22} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available Tests</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalSets} Sets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Sets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {sets.map(s => {
          // Check if user attempted this set title before
          const setQuizTitle = `${topicDetails.title.toUpperCase()} - PYQ Mock ${s.setNumber} (${s.questions.length} Questions)`;
          const attemptMatch = quizAttempts.find(a => a.title.toLowerCase() === setQuizTitle.toLowerCase());
          const isLocked = !isProUser && s.setNumber > FREE_TESTS_LIMIT;

          return (
            <div 
              key={s.setNumber}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: isLocked ? '4px solid #f59e0b' : (attemptMatch ? '4px solid var(--success)' : '1px solid var(--border-color)'),
                opacity: isLocked ? 0.95 : 1
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  {isLocked ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} />
                      PRO (Set {s.setNumber})
                    </span>
                  ) : (
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                      {s.questions.length} PYQ Questions
                    </span>
                  )}

                  {attemptMatch && (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Mock Test Set {s.setNumber}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    15 Mins
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} />
                    {s.questions.length * 2} Marks
                  </span>
                </div>

                {attemptMatch && (
                  <div style={{ background: 'var(--success-bg)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                    Best Score: {attemptMatch.score} / {s.questions.length * 2} ({Math.round((attemptMatch.correctCount / s.questions.length) * 100)}%)
                  </div>
                )}
              </div>

              {isLocked ? (
                <button
                  onClick={openPricingModal}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <Lock size={15} />
                  <span>Unlock with Pro (₹29)</span>
                </button>
              ) : (
                <button
                  onClick={() => startSetQuiz(selectedTopic, s.setNumber, s.questions)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Play size={16} />
                  <span>{attemptMatch ? 'Re-attempt Mock' : 'Start Mock Test'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default TopicSets;
