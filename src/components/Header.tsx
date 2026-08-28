import React from 'react';
import { useApp } from '../context/AppContext';
import type { AppView } from '../types/quiz';
import { 
  Moon, 
  Sun, 
  AlertTriangle, 
  BookMarked, 
  Home, 
  Grid, 
  Layers, 
  Sparkles,
  User
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    openTopicSets, 
    isDarkMode, 
    toggleTheme, 
    mistakeQuestionIds,
    isProUser,
    openPricingModal
  } = useApp();

  const mobileNavItems: { view: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'dashboard', label: 'Home', icon: <Home size={20} /> },
    { view: 'topic_sets', label: 'PYQs', icon: <Layers size={20} /> },
    { view: 'grammar', label: '120 Rules', icon: <BookMarked size={20} /> },
    { view: 'grammar_checker', label: 'AI Checker', icon: <Sparkles size={20} /> },
    { view: 'mistakes', label: 'Mistakes', icon: <AlertTriangle size={20} />, badge: mistakeQuestionIds.length },
    { view: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* ─── NATIVE ANDROID TOP APP BAR (ALWAYS FIXED AT TOP) ─── */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 999,
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s ease, border-color 0.2s ease'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          
          {/* App Logo & Title */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Grid size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
                  SSC English
                </h1>
                <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 700 }}>
                  PRO
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px', fontWeight: 500 }}>
                18,000+ Questions • 120 Golden Rules
              </p>
            </div>
          </div>

          {/* Right Action Icons (Pro Upgrade & Theme Switcher) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Pro Upgrade / Active Badge */}
            {!isProUser ? (
              <button
                onClick={openPricingModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={13} />
                <span>Pro ₹29</span>
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={12} />
                <span>PRO</span>
              </div>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
            </button>
          </div>

        </div>
      </header>

      {/* ─── NATIVE ANDROID BOTTOM NAVIGATION BAR (FIXED) ─── */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map(item => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                if (item.view === 'topic_sets') {
                  openTopicSets(null);
                } else {
                  setCurrentView(item.view);
                }
              }}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
