import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { QuestionTopic, Question } from '../types/quiz';
import { getAllTopics, getQuestionsByTopic, getTopicCount, loadTopicQuestions, STATIC_TOPIC_COUNTS } from '../data/questions';
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Lock,
  Sparkles,
  BookOpen,
  Award,
  BarChart2,
  Loader2
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

const TOPIC_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  spot_error: { icon: <FlatIconSpotError size={24} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  sentence_improvement: { icon: <FlatIconSentenceImprovement size={24} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  fill_blanks: { icon: <FlatIconFillBlanks size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  cloze_test: { icon: <FlatIconClozeTest size={24} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  one_word: { icon: <FlatIconOneWord size={24} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  idioms_phrases: { icon: <FlatIconIdioms size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  synonyms: { icon: <FlatIconSynonyms size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  antonyms: { icon: <FlatIconAntonyms size={24} />, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
  misspelled: { icon: <FlatIconMisspelled size={24} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' }
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

  const allTopicsMap = useMemo(() => getAllTopics(), []);
  const allTopics = useMemo(() => Object.keys(allTopicsMap), [allTopicsMap]);

  // Topic questions dynamic state
  const [topicQuestions, setTopicQuestions] = useState<Question[]>(() => {
    return selectedTopic ? getQuestionsByTopic(selectedTopic) : [];
  });
  const [loadingTopic, setLoadingTopic] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedTopic) return;
    let isMounted = true;
    const cached = getQuestionsByTopic(selectedTopic);
    if (cached.length > 2) {
      setTopicQuestions(cached);
    } else {
      setLoadingTopic(true);
    }

    loadTopicQuestions(selectedTopic).then(qs => {
      if (isMounted) {
        setTopicQuestions(qs);
        setLoadingTopic(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingTopic(false);
    });

    return () => { isMounted = false; };
  }, [selectedTopic]);

  // Precalculated topic stats (O(1) lookups)
  const topicStats = useMemo(() => {
    const stats: Record<string, { count: number; setTotal: number; setSize: number }> = {};
    allTopics.forEach(tKey => {
      const count = getTopicCount(tKey);
      const setSize = tKey === 'cloze_test' ? 25 : 30;
      const setTotal = Math.max(1, Math.ceil(count / setSize));
      stats[tKey] = { count, setTotal, setSize };
    });
    return stats;
  }, [allTopics]);

  // Group questions into sets ONLY when a topic is selected (O(1) topic retrieval)
  const topicSetsData = useMemo(() => {
    if (!selectedTopic) return null;
    const allTopicQuestions = topicQuestions.length > 0 ? topicQuestions : getQuestionsByTopic(selectedTopic);
    const totalQuestions = allTopicQuestions.length > 2 ? allTopicQuestions.length : (STATIC_TOPIC_COUNTS[selectedTopic] || 100);
    const SET_SIZE = selectedTopic === 'cloze_test' ? 25 : 30;
    const totalSets = Math.max(1, Math.ceil(totalQuestions / SET_SIZE));

    const sets = Array.from({ length: totalSets }, (_, index) => {
      const startIdx = index * SET_SIZE;
      const endIdx = Math.min(startIdx + SET_SIZE, totalQuestions);
      const questions = allTopicQuestions.slice(startIdx, endIdx);
      return {
        setNumber: index + 1,
        startIdx: startIdx + 1,
        endIdx,
        questions: questions.length > 0 ? questions : allTopicQuestions.slice(0, SET_SIZE)
      };
    });

    return {
      topicDetails: allTopicsMap[selectedTopic] || { title: selectedTopic, desc: 'Practice sets', badge: 'TOPIC' },
      totalQuestions,
      totalSets,
      sets
    };
  }, [selectedTopic, topicQuestions, allTopicsMap]);

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: TOPIC DIRECTORY (When no specific topic is selected)
  // ══════════════════════════════════════════════════════════════════════════
  if (!selectedTopic) {
    return (
      <div style={{ padding: '14px 12px 36px 12px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        
        {/* Header Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              fontSize: '9.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)',
              padding: '2px 7px',
              borderRadius: '5px'
            }}>
              OFFICIAL SSC PYQ BANK
            </span>

            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>
              18,000+ Questions
            </span>
          </div>

          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 3px 0', letterSpacing: '-0.01em' }}>
            PYQ Practice Topics
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '11.5px', margin: 0, lineHeight: 1.4 }}>
            Topic-wise 30-question timed speed sets with official solutions & Hindi explanations.
          </p>
        </div>

        {/* Topics Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {allTopics.map(tKey => {
            const detail = allTopicsMap[tKey] || { title: tKey, desc: 'Practice questions.', badge: 'TOPIC', color: '#8b5cf6' };
            const iconConfig = TOPIC_ICONS[tKey] || { 
              icon: <BookOpen size={20} />, 
              color: detail.color || '#8b5cf6', 
              bg: `${detail.color || '#8b5cf6'}18` 
            };
            const stat = topicStats[tKey] || { count: 0, setTotal: 1, setSize: 30 };

            // Count completed attempts for this topic
            const completedAttempts = quizAttempts.filter(a => a.topic === tKey).length;

            return (
              <div
                key={tKey}
                onClick={() => openTopicSets(tKey as any)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '11px',
                      background: iconConfig.bg,
                      color: iconConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${iconConfig.color}25`
                    }}>
                      {iconConfig.icon}
                    </div>

                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      background: `${iconConfig.color}15`,
                      color: iconConfig.color,
                      border: `1px solid ${iconConfig.color}30`,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em'
                    }}>
                      {detail.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
                    {detail.title}
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                    {detail.desc}
                  </p>
                </div>

                <div>
                  {/* Set and Questions Count */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '11.5px'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {stat.count.toLocaleString()} Questions
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>
                      {stat.setTotal} Sets ({stat.setSize} Qs/Set)
                    </span>
                  </div>

                  {/* Footer Action */}
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: completedAttempts > 0 ? '#10b981' : 'var(--text-dim)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      {completedAttempts > 0 ? (
                        <>
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>{completedAttempts} Completed</span>
                        </>
                      ) : (
                        <span>Not Started</span>
                      )}
                    </span>

                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      color: 'var(--primary)', 
                      fontWeight: 700,
                      fontSize: '12px' 
                    }}>
                      <span>Practice Sets</span>
                      <ArrowRight size={13} />
                    </span>
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
  if (!topicSetsData) return null;
  const { topicDetails, totalQuestions, totalSets, sets } = topicSetsData;

  return (
    <div style={{ padding: '14px 12px 36px 12px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Back Button & Top Navigation */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={() => openTopicSets(null)}
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
          <span>Back to All Topics</span>
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
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                OFFICIAL SSC PYQ
              </span>
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
              {selectedTopic === 'cloze_test' ? 'Cloze Test Sets' : `${topicDetails.title} Sets`}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '11px', margin: 0 }}>
              {selectedTopic === 'cloze_test' 
                ? '5 complete reading passages (25 questions total) with live blank highlights.'
                : '30-question timed speed tests (15 mins) with instant solutions.'}
            </p>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-surface-elevated)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            flexShrink: 0
          }}>
            <Layers size={14} color="var(--primary)" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalSets} Sets ({totalQuestions} Qs)
            </span>
          </div>
        </div>
      </div>

      {/* Test Sets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {sets.map(s => {
          // Check if user attempted this set title before
          const setQuizTitle = `${topicDetails.title.toUpperCase()} - PYQ Mock ${s.setNumber} (${s.questions.length} Questions)`;
          const attemptMatch = quizAttempts.find(a => a.title.toLowerCase() === setQuizTitle.toLowerCase());
          const isLocked = !isProUser && s.setNumber > FREE_TESTS_LIMIT;

          return (
            <div 
              key={s.setNumber}
              style={{
                background: 'var(--bg-surface)',
                border: isLocked 
                  ? '1px solid rgba(245, 158, 11, 0.3)' 
                  : (attemptMatch ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)'),
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div>
                {/* Header Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  {isLocked ? (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Lock size={11} />
                      <span>PRO (Set {s.setNumber})</span>
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-border)',
                      padding: '2px 7px',
                      borderRadius: '6px'
                    }}>
                      {s.questions.length} Questions
                    </span>
                  )}

                  {attemptMatch && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <CheckCircle2 size={11} />
                      <span>Score: {attemptMatch.score}/{s.questions.length * 2}</span>
                    </span>
                  )}
                </div>

                {/* Set Title */}
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  Mock Test Set {s.setNumber}
                </h3>

                {/* Meta Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} />
                    <span>15 Mins</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FileText size={12} />
                    <span>{s.questions.length * 2} Marks</span>
                  </span>
                  <span>•</span>
                  <span>+2 / -0.50</span>
                </div>
              </div>

              {/* Action Button */}
              {isLocked ? (
                <button
                  onClick={openPricingModal}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <Lock size={13} />
                  <span>Unlock with Pro (₹29)</span>
                </button>
              ) : (
                <button
                  onClick={() => startSetQuiz(selectedTopic, s.setNumber, s.questions)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  <Play size={13} fill="#ffffff" />
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
