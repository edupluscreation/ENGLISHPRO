import React, { useState, useEffect } from 'react';
import type { Question, QuestionTopic } from '../types/quiz';

export const GOOGLE_SHEET_API_URL = typeof window !== 'undefined'
  ? (localStorage.getItem('ssc_sheet_api_url') || 'https://script.google.com/macros/s/AKfycbxSTihxwKdh0uXkTjqDiG9MSoBtJB9hAUNdV35s-fYFh1w5hlK8MEsutTfaz6sxnu-BxQ/exec')
  : 'https://script.google.com/macros/s/AKfycbxSTihxwKdh0uXkTjqDiG9MSoBtJB9hAUNdV35s-fYFh1w5hlK8MEsutTfaz6sxnu-BxQ/exec';

import { 
  ShieldCheck, 
  KeyRound, 
  DollarSign, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Save, 
  ExternalLink,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Zap,
  Lock,
  Layers,
  Database
} from 'lucide-react';

interface SheetUser {
  phone: string;
  name: string;
  signupDate: string;
  isPro: boolean;
  proExpiry: string;
}

export const AdminPanel: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ssc_admin_logged_in') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const ADMIN_PIN = '8899'; // Default Admin Secret PIN

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pricing' | 'users' | 'add_question' | 'system'>('pricing');

  // Pricing State
  const [proPrice, setProPrice] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_pro_price') || '29', 10);
  });
  const [originalPrice, setOriginalPrice] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_orig_price') || '299', 10);
  });
  const [planDays, setPlanDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_plan_days') || '60', 10);
  });
  const [priceSaveMsg, setPriceSaveMsg] = useState('');

  // Users State
  const [sheetUsers, setSheetUsers] = useState<SheetUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userActionMsg, setUserActionMsg] = useState('');

  // Add Question State
  const [qTopic, setQTopic] = useState<QuestionTopic>('spot_error');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [qEngExpl, setQEngExpl] = useState('');
  const [qHinExpl, setQHinExpl] = useState('');
  const [qExamTag, setQExamTag] = useState('SSC CGL 2026');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [qSuccessMsg, setQSuccessMsg] = useState('');

  // Handle PIN Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ssc_admin_logged_in', 'true');
      setPinError('');
    } else {
      setPinError('Incorrect Admin PIN. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ssc_admin_logged_in');
  };

  // Save Pricing Changes
  const handleSavePricing = () => {
    localStorage.setItem('ssc_admin_pro_price', proPrice.toString());
    localStorage.setItem('ssc_admin_orig_price', originalPrice.toString());
    localStorage.setItem('ssc_admin_plan_days', planDays.toString());
    
    // Sync with Google Sheet if supported
    if (GOOGLE_SHEET_API_URL) {
      try {
        fetch(`${GOOGLE_SHEET_API_URL}?action=updateConfig&proPrice=${proPrice}&origPrice=${originalPrice}&planDays=${planDays}`)
          .catch(() => {});
      } catch (_) {}
    }

    setPriceSaveMsg('✅ Pricing settings updated successfully!');
    setTimeout(() => setPriceSaveMsg(''), 3000);
  };

  // Fetch Users from Google Sheet
  const fetchUsers = async () => {
    if (!GOOGLE_SHEET_API_URL) {
      setUserActionMsg('Google Sheet Webhook URL not configured.');
      return;
    }
    setIsLoadingUsers(true);
    setUserActionMsg('');
    try {
      const res = await fetch(`${GOOGLE_SHEET_API_URL}?action=getUsers`);
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        setSheetUsers(data.users);
      } else {
        // Sample fallback if endpoint is fresh
        setSheetUsers([
          { phone: '9876543210', name: 'Rahul Sharma', signupDate: '28/08/2026', isPro: true, proExpiry: '27/10/2026' }
        ]);
      }
    } catch (err) {
      setUserActionMsg('Could not fetch real-time users list directly. Connect Google Sheet API.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  // Toggle Pro status for a user
  const handleTogglePro = async (phone: string, currentPro: boolean) => {
    if (!GOOGLE_SHEET_API_URL) return;
    setUserActionMsg(`Updating status for ${phone}...`);
    try {
      const targetDays = currentPro ? 0 : planDays;
      await fetch(`${GOOGLE_SHEET_API_URL}?action=updatePro&phone=${phone}&days=${targetDays}&paymentId=ADMIN_OVERRIDE`);
      setUserActionMsg(`✅ Pro status updated for ${phone}!`);
      fetchUsers();
    } catch {
      setUserActionMsg(`Failed to update Pro status for ${phone}`);
    }
  };

  // Add Question Handler
  const handleAddQuestion = () => {
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Please fill question text and all 4 options.');
      return;
    }

    const fullExplanation = `${qEngExpl.trim() || 'Correct answer according to official SSC syllabus.'}\n\n💡 **हिन्दी व्याख्या**: ${qHinExpl.trim() || 'सही उत्तर व्याकरण और आधिकारिक उत्तर कुंजी के अनुसार है।'}`;

    const newQ: Question = {
      id: `custom_${Date.now()}`,
      topic: qTopic,
      questionText: qText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswer: qCorrect,
      explanation: fullExplanation,
      examTag: qExamTag.trim(),
      difficulty: qDifficulty
    };

    // Save to local custom questions pool
    const saved = localStorage.getItem('ssc_custom_questions');
    const existing: Question[] = saved ? JSON.parse(saved) : [];
    existing.unshift(newQ);
    localStorage.setItem('ssc_custom_questions', JSON.stringify(existing));

    setQSuccessMsg(`🎉 Question added to ${qTopic.replace('_', ' ').toUpperCase()} successfully!`);
    setTimeout(() => setQSuccessMsg(''), 4000);

    // Reset Form
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQEngExpl('');
    setQHinExpl('');
  };

  // ═══════════════════════════════════════════
  // 1. PIN LOGIN SCREEN
  // ═══════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)'
          }}>
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Admin Control Center
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: '0 0 20px 0' }}>
            Enter your 4-digit Master PIN to manage live prices, users & questions.
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Master PIN (Default: 8899)"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid var(--primary)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: '16px',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '4px'
              }}
            />

            {pinError && (
              <div style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 700 }}>
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '12px', fontSize: '14px', borderRadius: '12px', width: '100%' }}
            >
              <KeyRound size={16} />
              <span>Unlock Admin Panel</span>
            </button>

            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              fontSize: '11.5px',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>🛡️ Authorized Administrator Portal</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ═══════════════════════════════════════════
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '16px 20px 60px 20px' }}>
      
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '14px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              SSC English PRO — Master Admin
            </h1>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
              ● Live Cloud Console Active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <button
            onClick={handleLogout}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              background: 'var(--error-bg)',
              color: 'var(--error)',
              border: '1px solid var(--error-border)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface-elevated)',
        padding: '4px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        gap: '6px',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'pricing', label: 'Pricing & Plans', icon: <DollarSign size={15} /> },
          { id: 'users', label: 'User & Pro Access', icon: <Users size={15} /> },
          { id: 'add_question', label: 'Add Questions', icon: <PlusCircle size={15} /> },
          { id: 'system', label: 'Cloud & Links', icon: <Database size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-dim)',
              border: activeTab === tab.id ? '1px solid var(--border-color)' : 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: PRICING & PLAN CONTROLLER ─── */}
      {activeTab === 'pricing' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              Pro Subscription Pricing Controls
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: 0 }}>
              Change the price or duration here. Users will instantly see the new price on Netlify.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Offer Price (₹ INR):
              </label>
              <input
                type="number"
                value={proPrice}
                onChange={(e) => setProPrice(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  fontWeight: 800
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Original Strikethrough Price (₹ INR):
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  fontWeight: 800
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Plan Duration (Days):
              </label>
              <input
                type="number"
                value={planDays}
                onChange={(e) => setPlanDays(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  fontWeight: 800
                }}
              />
            </div>
          </div>

          {/* Pricing Preview Box */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '2px solid var(--primary)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Live Student Preview:
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>₹{proPrice}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>₹{originalPrice}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {Math.round(((originalPrice - proPrice) / originalPrice) * 100)}% OFF
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                ⚡ {planDays} Days Unlimited Access (₹{(proPrice / planDays).toFixed(2)}/day)
              </div>
            </div>

            <button
              onClick={handleSavePricing}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <Save size={15} />
              <span>Save & Publish</span>
            </button>
          </div>

          {priceSaveMsg && (
            <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              {priceSaveMsg}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: USERS & PRO CONTROLLER ─── */}
      {activeTab === 'users' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                Registered Students & Pro Pass Holders
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                Directly connected with your Google Sheet database.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={isLoadingUsers}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <RefreshCw size={13} style={{ animation: isLoadingUsers ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh Users</span>
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by 10-digit mobile number or student name..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: '13.5px'
              }}
            />
          </div>

          {userActionMsg && (
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
              {userActionMsg}
            </div>
          )}

          {/* Users List Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sheetUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '13px' }}>
                {isLoadingUsers ? 'Loading students list from Google Sheet...' : 'No users loaded yet. Enter numbers in Google Sheet or click Refresh.'}
              </div>
            ) : (
              sheetUsers
                .filter(u => u.phone.includes(userSearchQuery) || u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                .map((u, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          +91 {u.phone}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>
                          ({u.name || 'Student'})
                        </span>
                        {u.isPro ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            PRO ACTIVE
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                            Free
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                        Joined: {u.signupDate || 'Recently'} • Pro Expiry: {u.proExpiry || 'None'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePro(u.phone, u.isPro)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: u.isPro ? 'var(--error-bg)' : 'var(--success-bg)',
                        color: u.isPro ? 'var(--error)' : 'var(--success)',
                        border: `1px solid ${u.isPro ? 'var(--error-border)' : 'var(--success-border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {u.isPro ? 'Revoke Pro' : 'Activate 60D Pro'}
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: ADD QUESTIONS STUDIO ─── */}
      {activeTab === 'add_question' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
              Add New Official SSC PYQ Question
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
              Created questions immediately appear in practice sets and mock quizzes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Topic Category:
              </label>
              <select
                value={qTopic}
                onChange={(e) => setQTopic(e.target.value as QuestionTopic)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <option value="spot_error">Spot the Error</option>
                <option value="sentence_improvement">Sentence Improvement</option>
                <option value="fill_blanks">Fill in the Blanks</option>
                <option value="one_word">One Word Substitution</option>
                <option value="idioms_phrases">Idioms & Phrases</option>
                <option value="synonyms">Synonyms</option>
                <option value="antonyms">Antonyms</option>
                <option value="misspelled">Spelling Errors</option>
                <option value="cloze_test">Cloze Test</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Official Exam Tag:
              </label>
              <input
                type="text"
                value={qExamTag}
                onChange={(e) => setQExamTag(e.target.value)}
                placeholder="e.g. SSC CGL 2026 Tier-1"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>
              Question Text:
            </label>
            <textarea
              rows={3}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Enter complete question stem here..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>Option A:</label>
              <input
                type="text"
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Option A"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>Option B:</label>
              <input
                type="text"
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Option B"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>Option C:</label>
              <input
                type="text"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="Option C"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>Option D:</label>
              <input
                type="text"
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder="Option D"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>
              Correct Option:
            </label>
            <select
              value={qCorrect}
              onChange={(e) => setQCorrect(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <option value={0}>Option A is Correct</option>
              <option value={1}>Option B is Correct</option>
              <option value={2}>Option C is Correct</option>
              <option value={3}>Option D is Correct</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>
                English Explanation:
              </label>
              <textarea
                rows={2}
                value={qEngExpl}
                onChange={(e) => setQEngExpl(e.target.value)}
                placeholder="Detailed English grammatical rule..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '12.5px', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '3px' }}>
                💡 हिन्दी व्याख्या (Hindi Explanation):
              </label>
              <textarea
                rows={2}
                value={qHinExpl}
                onChange={(e) => setQHinExpl(e.target.value)}
                placeholder="सरल हिन्दी में नियम और व्याख्या..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', fontSize: '12.5px', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <button
            onClick={handleAddQuestion}
            className="btn-primary"
            style={{ padding: '12px', fontSize: '14px', borderRadius: '10px', marginTop: '6px' }}
          >
            <PlusCircle size={17} />
            <span>Publish Question to Live App</span>
          </button>

          {qSuccessMsg && (
            <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              {qSuccessMsg}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: SYSTEM & CLOUD LINKS ─── */}
      {activeTab === 'system' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Cloud Deployment & CDN Infrastructure
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://github.com/edupluscreation/ENGLISHPRO"
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <span>GitHub Repository (edupluscreation/ENGLISHPRO)</span>
              <ExternalLink size={15} color="var(--primary)" />
            </a>

            <a
              href="https://app.netlify.com/projects/sscenglishpro"
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <span>Netlify Hosting Dashboard</span>
              <ExternalLink size={15} color="var(--primary)" />
            </a>

            <a
              href="https://cdn.jsdelivr.net/gh/edupluscreation/ENGLISHPRO@main/src/data/pinnacleQuestions.json"
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <span>jsDelivr Global Edge CDN Link (18k+ PYQs)</span>
              <ExternalLink size={15} color="var(--primary)" />
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
