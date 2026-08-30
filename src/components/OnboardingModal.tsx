import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Zap, 
  Trophy, 
  Flame, 
  ChevronRight, 
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Crown
} from 'lucide-react';

import { useApp } from '../context/AppContext';

interface SlideData {
  id: number;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  highlightText: string;
  description: string;
  themeColor: string;
  renderPreview: () => React.ReactNode;
}

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, setShowOnboarding } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('englishpro_feature_tour_v1', 'true');
    localStorage.setItem('englishpro_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  const SLIDES: SlideData[] = [
    {
      id: 0,
      tag: "18,000+ REAL EXAM PYQS",
      tagColor: "#ea580c",
      tagBg: "rgba(234, 88, 12, 0.08)",
      title: "Real Topic-Wise",
      highlightText: "SSC Exam PYQs",
      description: "Practice authentic questions from CGL, CHSL, CPO & MTS with instant authentic Hindi solutions and exam repetition tags.",
      themeColor: "#ea580c",
      renderPreview: () => (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left'
        }}>
          {/* Question Tag */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              background: 'rgba(234, 88, 12, 0.08)',
              color: '#ea580c',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(234, 88, 12, 0.2)'
            }}>
              🔥 SSC CGL Tier-1 • Repeated 5x
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              Q. 1 / 25
            </span>
          </div>

          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45 }}>
            The students of class 7 gave their teacher a gift, which was to her <span style={{ color: '#ea580c', textDecoration: 'underline' }}>surprising</span>.
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ padding: '6px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
              A. revealing
            </div>
            <div style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', fontSize: '11px', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>D. surprising</span>
              <CheckCircle2 size={12} color="#10b981" />
            </div>
          </div>

          {/* Solution Pill */}
          <div style={{ background: 'rgba(79, 70, 229, 0.06)', borderLeft: '3px solid #4f46e5', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#3730a3' }}>
            💡 <strong>हिन्दी व्याख्या:</strong> 'surprising' का अर्थ सुखद आश्चर्य होता है।
          </div>
        </div>
      )
    },
    {
      id: 1,
      tag: "120 GOLDEN RULES",
      tagColor: "#4f46e5",
      tagBg: "rgba(79, 70, 229, 0.08)",
      title: "120 Golden Rules",
      highlightText: "Master Grammar Blueprint",
      description: "Conquer every tricky SSC rule with structured visual formulas, clear Hindi notes, exam exception tips, and mini quizzes.",
      themeColor: "#4f46e5",
      renderPreview: () => (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              background: 'rgba(79, 70, 229, 0.08)',
              color: '#4f46e5',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              📘 Golden Rule #14 • Subject-Verb
            </span>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>
              ✔ 100% Verified
            </span>
          </div>

          {/* Formula Box */}
          <div style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.18)', padding: '8px 10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#4f46e5', marginBottom: '2px' }}>📐 RULE FORMULA</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b', fontFamily: 'monospace' }}>
              Neither S₁ + Nor S₂ + Verb (Agrees with S₂)
            </div>
          </div>

          {/* Error vs Correct Example */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10.5px', padding: '4px 8px', borderRadius: '5px', background: 'rgba(239, 68, 68, 0.06)', color: '#dc2626', fontWeight: 600 }}>
              ❌ Neither he nor his friends <u>was</u> present (Wrong)
            </div>
            <div style={{ fontSize: '10.5px', padding: '4px 8px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.06)', color: '#059669', fontWeight: 600 }}>
              ✔ Neither he nor his friends <u>were</u> present (Correct)
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      tag: "AI ERROR SCANNER",
      tagColor: "#9333ea",
      tagBg: "rgba(147, 51, 234, 0.08)",
      title: "AI Sentence & Vocab",
      highlightText: "Instant Diagnostic Scanner",
      description: "Type or speak any English sentence to instantly detect multiple grammatical flaws and explore 16,600+ vocabulary roots in Hindi.",
      themeColor: "#9333ea",
      renderPreview: () => (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              background: 'rgba(147, 51, 234, 0.08)',
              color: '#9333ea',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(147, 51, 234, 0.2)'
            }}>
              ⚡ AI Grammar & Vocab Engine
            </span>
            <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 800 }}>
              50 Free Daily Scans
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#334155' }}>
            Input: "She <span style={{ color: '#dc2626', textDecoration: 'line-through', fontWeight: 700 }}>have went</span> to market"
          </div>

          {/* AI Result Card */}
          <div style={{ background: 'rgba(147, 51, 234, 0.06)', borderLeft: '3px solid #9333ea', padding: '6px 10px', borderRadius: '6px', fontSize: '11px' }}>
            <div style={{ color: '#581c87', fontWeight: 800 }}>✔ Corrected: "She <strong>has gone</strong> to the market."</div>
            <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
              💡 Singular Subject 'She' requires 'has + V₃ (gone)'.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      tag: "ELIMINATE NEGATIVE MARKING",
      tagColor: "#059669",
      tagBg: "rgba(5, 150, 105, 0.08)",
      title: "Mistake Vault & Retests",
      highlightText: "Achieve 100% Accuracy",
      description: "Every question you get wrong is automatically saved to your Mistake Vault so you can retest until your weak areas become strengths.",
      themeColor: "#059669",
      renderPreview: () => (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(5, 150, 105, 0.2)'
            }}>
              🛡️ Mistake Vault • Auto-Tracker
            </span>
            <span style={{ fontSize: '10px', color: '#059669', fontWeight: 800 }}>
              Target: 50/50 Marks
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
            <div style={{ padding: '8px 4px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>18,077</div>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>Total PYQs</div>
            </div>
            <div style={{ padding: '8px 4px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>Saved</div>
              <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 600 }}>Weak Areas</div>
            </div>
            <div style={{ padding: '8px 4px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>1-Tap</div>
              <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 600 }}>Instant Retest</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', fontWeight: 600, background: 'rgba(16, 185, 129, 0.06)', padding: '6px 10px', borderRadius: '6px' }}>
            <CheckCircle2 size={13} color="#059669" />
            <span>Never repeat the same grammatical mistake in exam!</span>
          </div>
        </div>
      )
    }
  ];

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      background: '#ffffff',
      backgroundImage: `
        radial-gradient(circle at 50% 8%, rgba(79, 70, 229, 0.06) 0%, transparent 60%),
        radial-gradient(circle at 50% 92%, rgba(234, 88, 12, 0.05) 0%, transparent 60%)
      `,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 18px calc(48px + env(safe-area-inset-bottom, 20px)) 18px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
      color: '#0f172a'
    }}>
      
      {/* ─── TOP BAR ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/app_icon_mobile.jpg"
            alt="SSC English Pro Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '-0.01em', fontFamily: "'Outfit', sans-serif", color: '#0f172a', lineHeight: 1 }}>
                SSC English
              </span>
              <span style={{ 
                fontSize: '9.5px', 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: '#000000', 
                padding: '2px 5px', 
                borderRadius: '4px',
                lineHeight: 1,
                letterSpacing: '0.04em'
              }}>
                PRO
              </span>
            </div>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginTop: '3px' }}>
              MASTER PREPARATION
            </div>
          </div>
        </div>

        {/* Skip Pill */}
        {!isLast && (
          <button
            onClick={handleComplete}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Skip Intro
          </button>
        )}
      </div>

      {/* ─── MIDDLE HERO CONTENT ─── */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
        padding: '12px 0'
      }}>

        {/* Feature Preview Showcase Card */}
        <div>
          {slide.renderPreview()}
        </div>

        {/* Slide Title & Tag */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: slide.tagColor,
            background: slide.tagBg,
            border: `1px solid ${slide.tagColor}30`,
            padding: '3px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {slide.tag}
          </span>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            margin: 0,
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            color: '#0f172a'
          }}>
            {slide.title} <span style={{ color: slide.themeColor }}>{slide.highlightText}</span>
          </h1>

          <p style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: '420px'
          }}>
            {slide.description}
          </p>
        </div>

      </div>

      {/* ─── BOTTOM CONTROLS & PROGRESS ─── */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingBottom: '18px',
        marginTop: '12px'
      }}>
        {/* Progress Capsules */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              style={{
                height: '6px',
                width: idx === currentSlide ? '28px' : '6px',
                borderRadius: '9999px',
                background: idx === currentSlide ? slide.themeColor : '#e2e8f0',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleNext}
          style={{
            background: isLast 
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
              : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '14px',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isLast 
              ? '0 6px 20px rgba(5, 150, 105, 0.3)' 
              : '0 6px 20px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s ease',
            width: '100%',
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            letterSpacing: '0.01em'
          }}
        >
          <span>{isLast ? '🚀 Start Learning (Get Started)' : 'Continue'}</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default OnboardingModal;
