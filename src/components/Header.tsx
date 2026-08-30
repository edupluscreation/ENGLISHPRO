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
  User,
  HelpCircle
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
    openPricingModal,
    openOnboarding
  } = useApp();

  const mobileNavItems: { view: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'dashboard', label: 'Home', icon: <Home size={19} /> },
    { view: 'topic_sets', label: 'PYQs', icon: <Layers size={19} /> },
    { view: 'grammar', label: 'Rules', icon: <BookMarked size={19} /> },
    { view: 'grammar_checker', label: 'AI Scan', icon: <Sparkles size={19} /> },
    { view: 'profile', label: 'Profile', icon: <User size={19} /> },
  ];

  return (
    <>
      {/* ─── NATIVE ANDROID TOP APP BAR (ALWAYS FIXED AT TOP) ─── */}
      <header className="android-app-header">
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          overflow: 'hidden'
        }}>
          
          {/* App Logo & Title */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer', 
              flexShrink: 0
            }}
          >
            <img
              src="/app_icon_mobile.jpg"
              alt="SSC English Pro"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', lineHeight: 1 }}>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: 900, 
                  color: 'var(--text-main)', 
                  margin: 0, 
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  SSC English
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  fontWeight: 900,
                  borderRadius: '4px',
                  background: '#f59e0b',
                  color: '#000000',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  wordBreak: 'keep-all',
                  letterSpacing: '0.04em'
                }}>
                  PRO
                </span>
              </div>
              <p style={{ 
                fontSize: '10.5px', 
                color: 'var(--text-dim)', 
                margin: 0, 
                marginTop: '2px', 
                fontWeight: 600, 
                whiteSpace: 'nowrap'
              }}>
                18k PYQs • 120 Rules • AI
              </p>
            </div>
          </div>

          {/* Right Action Icons (Pro Upgrade & Theme Switcher) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            {/* Pro Upgrade / Active Badge */}
            {!isProUser ? (
              <button
                onClick={openPricingModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)'
                }}
              >
                <Sparkles size={11} />
                <span>₹29</span>
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={10} />
                <span>PRO</span>
              </div>
            )}

            {/* App Features Tour */}
            <button
              onClick={openOnboarding}
              title="Features Tour"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={15} />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
            </button>
          </div>

        </div>
      </header>

      {/* ─── NATIVE ANDROID BOTTOM NAVIGATION BAR (GOOGLE M3 PILL) ─── */}
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
              <div className="mobile-nav-icon-container">
                {item.icon}
              </div>
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
