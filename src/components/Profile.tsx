import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getQuestionById } from '../data/questions';
import type { Question } from '../types/quiz';
import { 
  Flame, 
  Bookmark, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Edit2, 
  Check, 
  ChevronRight, 
  Trophy, 
  Play, 
  Clock, 
  LogOut, 
  Smartphone, 
  Target, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const {
    streakDays,
    xpPoints,
    quizAttempts,
    mistakeQuestionIds,
    bookmarkedQuestionIds,
    startCustomQuiz,
    isProUser,
    openPricingModal,
    proExpiryDate,
    userPhone,
    verifyAndLoginPhone,
    logoutPhone,
    userName,
    setUserName,
    setCurrentView
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Phone Auth State
  const [inputPhone, setInputPhone] = useState('');
  const [inputName, setInputName] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Tab State: Clean 3 Tabs only
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks' | 'history'>('mistakes');

  const handleSaveName = () => {
    const trimmed = tempName.trim() || 'SSC Aspirant';
    setUserName(trimmed);
    setIsEditingName(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone || inputPhone.trim().length < 10) {
      setPhoneMessage({ text: 'Kripya 10-digit ka valid mobile number dalein.', type: 'error' });
      return;
    }

    setIsVerifyingPhone(true);
    setPhoneMessage(null);

    try {
      const loginName = inputName.trim() || undefined;
      const res = await verifyAndLoginPhone(inputPhone, loginName);
      setPhoneMessage({
        text: res.message,
        type: res.isPro ? 'success' : 'info'
      });
      if (res.success) {
        setInputPhone('');
        setInputName('');
      }
    } catch (err) {
      setPhoneMessage({ text: 'Verification error. Kripya dobara try karein.', type: 'error' });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // Performance calculations
  const totalQuestionsAttempted = quizAttempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
  const totalCorrect = quizAttempts.reduce((acc, a) => acc + (a.correctCount || 0), 0);
  const totalWrong = quizAttempts.reduce((acc, a) => acc + (a.wrongCount || 0), 0);
  const attemptedAnswered = totalCorrect + totalWrong;
  const overallAccuracy = attemptedAnswered > 0 
    ? Math.round((totalCorrect / attemptedAnswered) * 100) 
    : (totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0);

  // Mistakes & Bookmarks questions list (O(1) lookups)
  const mistakeQuestions = useMemo(() => {
    return mistakeQuestionIds.map(id => getQuestionById(id)).filter(Boolean) as Question[];
  }, [mistakeQuestionIds]);

  const bookmarkedQuestions = useMemo(() => {
    return bookmarkedQuestionIds.map(id => getQuestionById(id)).filter(Boolean) as Question[];
  }, [bookmarkedQuestionIds]);

  const handlePracticeMistakes = () => {
    if (mistakeQuestions.length === 0) return;
    startCustomQuiz('Mistake Revision Test', mistakeQuestions, Math.max(5, Math.ceil(mistakeQuestions.length * 0.8)));
  };

  const handleReviseBookmarks = () => {
    if (bookmarkedQuestions.length === 0) return;
    startCustomQuiz('Bookmark Revision Test', bookmarkedQuestions, Math.max(5, Math.ceil(bookmarkedQuestions.length * 0.8)));
  };

  const remainingDays = typeof window !== 'undefined' && localStorage.getItem('ssc_pro_expiry_timestamp')
    ? Math.max(0, Math.ceil((parseInt(localStorage.getItem('ssc_pro_expiry_timestamp')!, 10) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 60;

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
      
      {/* ─── 1. USER PROFILE HEADER CARD (WITH PHONE NUMBER & STATUS) ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-xs)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          width: '100%'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 auto' }}>
            {/* Avatar Ring */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* User Details */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '100%' }}>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1.5px solid var(--primary)',
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        fontWeight: 700,
                        outline: 'none',
                        maxWidth: '120px'
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveName}
                      style={{
                        background: 'var(--primary)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                    <h2 style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userName}
                    </h2>
                    <button 
                      onClick={() => { setTempName(userName); setIsEditingName(true); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                      title="Edit Name"
                    >
                      <Edit2 size={11} />
                    </button>
                  </div>
                )}

                {isProUser ? (
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '1px 6px',
                    borderRadius: '5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={10} />
                    PRO PASS
                  </span>
                ) : (
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: 'var(--text-dim)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '1px 5px',
                    borderRadius: '5px',
                    flexShrink: 0
                  }}>
                    Free Pass
                  </span>
                )}
              </div>

              {/* Linked Phone Number or Target Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                {userPhone ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', background: 'var(--bg-surface-elevated)', padding: '1px 7px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                    <Smartphone size={11} color="var(--primary)" />
                    <span>+91 {userPhone}</span>
                    <CheckCircle2 size={10} color="#10b981" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-dim)', fontSize: '11px', fontWeight: 500 }}>
                    <Target size={11} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span>Target: SSC CGL • CHSL 2026</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: Pro CTA / Days Left or Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {!isProUser ? (
              <button
                onClick={openPricingModal}
                style={{
                  padding: '6px 11px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={12} />
                <span>Get Pro ₹29</span>
              </button>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '7px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '10.5px',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                <Clock size={11} />
                <span>{remainingDays}d Left</span>
              </div>
            )}

            {userPhone && (
              <button
                onClick={logoutPhone}
                title="Logout phone"
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--error)',
                  borderRadius: '7px',
                  padding: '5px 7px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={11} />
                <span>Logout</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ─── 2. PROMINENT MOBILE LOGIN & PASS RESTORE CARD (WHEN NOT LOGGED IN) ─── */}
      {!userPhone && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--primary-border)',
          borderRadius: '14px',
          padding: '14px 16px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Smartphone size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Mobile Number Login
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>
                Enter your 10-digit number to sync progress or restore your Pro Pass
              </p>
            </div>
          </div>

          <form onSubmit={handlePhoneLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
            {/* Phone Number Input with +91 Prefix */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0 12px',
              gap: '6px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', userSelect: 'none', flexShrink: 0 }}>+91</span>
              <input
                type="tel"
                maxLength={10}
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 10-digit Mobile Number"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  padding: '10px 0',
                  boxSizing: 'border-box',
                  letterSpacing: '0.04em'
                }}
              />
            </div>

            {/* Optional Aspirant Name */}
            <input
              type="text"
              maxLength={30}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Your Full Name (Optional)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Login & Restore Button */}
            <button
              type="submit"
              disabled={isVerifyingPhone || inputPhone.trim().length < 10}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: inputPhone.trim().length >= 10 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                  : 'var(--bg-surface-elevated)',
                color: inputPhone.trim().length >= 10 ? '#ffffff' : 'var(--text-dim)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: inputPhone.trim().length >= 10 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: inputPhone.trim().length >= 10 ? '0 3px 10px rgba(79, 70, 229, 0.3)' : 'none',
                boxSizing: 'border-box'
              }}
            >
              <Smartphone size={14} />
            </button>

            {phoneMessage && (
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: phoneMessage.type === 'success' ? '#10b981' : phoneMessage.type === 'error' ? 'var(--error)' : 'var(--text-dim)',
                background: 'var(--bg-surface-elevated)',
                padding: '6px 10px',
                borderRadius: '7px',
                borderLeft: `3px solid ${phoneMessage.type === 'success' ? '#10b981' : 'var(--primary)'}`
              }}>
                {phoneMessage.text}
              </div>
            )}
          </form>
        </div>
      )}

      {/* ─── 3. PERFORMANCE STATS 4-PILLARS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '6px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {[
          { label: 'STREAK', value: `${streakDays}d`, icon: <Flame size={12} color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'XP', value: `${xpPoints}`, icon: <Trophy size={12} color="#6366f1" />, bg: 'rgba(99, 102, 241, 0.1)' },
          { label: 'ACCURACY', value: `${overallAccuracy}%`, icon: <BarChart3 size={12} color="#10b981" />, bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'SOLVED', value: `${totalQuestionsAttempted}`, icon: <CheckCircle2 size={12} color="#06b6d4" />, bg: 'rgba(6, 182, 212, 0.1)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px 4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '5px',
              background: s.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'center'
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '8.5px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'center'
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── 4. PRO MEMBERSHIP PASS BANNER (IF NOT PRO) ─── */}
      {!isProUser && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '12px',
          padding: '12px 14px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.2)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Sparkles size={13} color="#fbbf24" />
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                SSC PRO PASS • ₹29
              </span>
            </div>
            <p style={{ fontSize: '10.5px', color: '#c7d2fe', margin: 0, lineHeight: 1.3 }}>
              18k+ Official PYQs • 120 Golden Rules • AI Scanner
            </p>
          </div>

          <button
            onClick={openPricingModal}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f59e0b',
              color: '#000000',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <span>Unlock Now</span>
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ─── 5. SEGMENTED TAB CONTROLS (MISTAKES, BOOKMARKS, HISTORY) ─── */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface-elevated)',
        padding: '2px',
        borderRadius: '9px',
        border: '1px solid var(--border-color)',
        gap: '2px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {[
          { id: 'mistakes', label: 'Mistakes', count: mistakeQuestionIds.length },
          { id: 'bookmarks', label: 'Bookmarks', count: bookmarkedQuestionIds.length },
          { id: 'history', label: 'History', count: quizAttempts.length }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '6px 2px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                overflow: 'hidden'
              }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 700,
                padding: '1px 4px',
                borderRadius: '8px',
                background: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                flexShrink: 0
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT: MISTAKES VAULT ─── */}
      {activeTab === 'mistakes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
          {mistakeQuestions.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px 14px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <CheckCircle2 size={24} color="var(--success)" style={{ margin: '0 auto 6px auto' }} />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                Zero Active Mistakes!
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
                Questions you answer incorrectly will automatically appear here for revision.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {mistakeQuestions.length} questions to revise
                </span>
                <button
                  onClick={handlePracticeMistakes}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--error)',
                    color: '#ffffff',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={11} fill="#ffffff" />
                  <span>Start Revision</span>
                </button>
              </div>

              {mistakeQuestions.slice(0, 15).map((q, idx) => (
                <div key={q.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '9px',
                  padding: '9px 11px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--error)', background: 'var(--error-bg)', padding: '1px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {q.topic.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {q.examTag || 'SSC PYQ'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4, fontWeight: 500, wordBreak: 'break-word' }}>
                    {idx + 1}. {q.questionText}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT: BOOKMARKS VAULT ─── */}
      {activeTab === 'bookmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
          {bookmarkedQuestions.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px 14px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Bookmark size={24} color="var(--accent)" style={{ margin: '0 auto 6px auto' }} />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                No Saved Bookmarks
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
                Bookmark important questions during practice tests to review them here.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {bookmarkedQuestions.length} saved questions
                </span>
                <button
                  onClick={handleReviseBookmarks}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={11} fill="#ffffff" />
                  <span>Practice Starred</span>
                </button>
              </div>

              {bookmarkedQuestions.slice(0, 15).map((q, idx) => (
                <div key={q.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '9px',
                  padding: '9px 11px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {q.topic.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {q.examTag || 'SSC PYQ'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4, fontWeight: 500, wordBreak: 'break-word' }}>
                    {idx + 1}. {q.questionText}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT: QUIZ HISTORY ─── */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%', boxSizing: 'border-box' }}>
          {quizAttempts.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px 14px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Clock size={24} color="var(--text-dim)" style={{ margin: '0 auto 6px auto' }} />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                No Test Attempts Yet
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
                Complete topic sets and daily mocks to build your exam history.
              </p>
            </div>
          ) : (
            quizAttempts.slice().reverse().map((attempt, aIdx) => {
              const accuracy = attempt.totalQuestions > 0 ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100) : 0;
              const isGood = accuracy >= 70;
              return (
                <div key={aIdx} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '9px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attempt.title || 'Quiz Test'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={10} />
                      <span>{attempt.date ? new Date(attempt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                      <span>•</span>
                      <span>{attempt.totalQuestions} Qs</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: isGood ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isGood ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}`,
                    color: isGood ? '#10b981' : 'var(--text-main)',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    flexShrink: 0,
                    textAlign: 'right'
                  }}>
                    {attempt.correctCount}/{attempt.totalQuestions} ({accuracy}%)
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* LEGAL & SUPPORT HELPLINE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        marginTop: '20px',
        padding: '14px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          EduPlus Creation • Legal & Support
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '11px' }}>
          <a href="https://sscenglishproo.blogspot.com/p/privacy-policy-ssc-english-pro-root.html-ssc-english-pro-root.html" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color, #6366f1)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <a href="https://sscenglishproo.blogspot.com/p/terms-conditions.html" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color, #6366f1)', textDecoration: 'none', fontWeight: 600 }}>Terms & Conditions</a>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <a href="https://sscenglishproo.blogspot.com/p/contact-us-support.html" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color, #6366f1)', textDecoration: 'none', fontWeight: 600 }}>Support (+91 7296821670)</a>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <a href="https://sscenglishproo.blogspot.com/p/data-account-deletion.html" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Data Deletion</a>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
          Helpline: <a href="mailto:edupluscreation@gmail.com" style={{ color: 'var(--text-dim)' }}>edupluscreation@gmail.com</a> • v1.0.0 Pro
        </div>
      </div>

    </div>
  );
};

export default Profile;
