import React from 'react';
import { LogOut, X, Flame, Zap } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays?: number;
  xpPoints?: number;
}

export const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose, streakDays = 1, xpPoints = 450 }) => {
  if (!isOpen) return null;

  const handleExitApp = () => {
    try {
      CapacitorApp.exitApp();
    } catch {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        maxWidth: '360px',
        width: '100%',
        padding: '24px 20px',
        boxSizing: 'border-box',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }}>
        
        {/* Close cross */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-dim)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={15} />
        </button>

        {/* Icon & Title */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}>
          <LogOut size={26} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
          Exit SSC English PRO?
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.45, margin: '0 0 16px 0' }}>
          Are you sure you want to exit? Your daily streak, test progress, and points are safely saved.
        </p>

        {/* Streak / XP Saved Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px 12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 800, color: '#f59e0b' }}>
            <Flame size={14} fill="#f59e0b" />
            <span>{streakDays} Day Streak</span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)' }}>
            <Zap size={14} fill="var(--primary)" />
            <span>{xpPoints} XP Saved</span>
          </div>
        </div>

        {/* Action Buttons (Cancel / Exit) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '10px',
              justifyContent: 'center'
            }}
          >
            Keep Learning
          </button>

          <button
            onClick={handleExitApp}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            <LogOut size={14} />
            <span>Exit App</span>
          </button>
        </div>

      </div>
    </div>
  );
};
