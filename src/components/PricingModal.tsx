import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Lock, 
  CreditCard, 
  Smartphone, 
  User, 
  ArrowRight, 
  Loader2,
  Check
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper to ensure Razorpay SDK is loaded
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PricingModal: React.FC = () => {
  const { 
    isPricingModalOpen, 
    setIsPricingModalOpen, 
    unlockProMembership, 
    userPhone, 
    verifyAndLoginPhone, 
    userName 
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalPhone, setModalPhone] = useState(userPhone || '');
  const [modalName, setModalName] = useState(userName || '');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync phone & name if updated in context
  useEffect(() => {
    if (userPhone) setModalPhone(userPhone);
    if (userName) setModalName(userName);
  }, [userPhone, userName]);

  // Determine if user has already linked a phone number
  const isLoggedIn = !!userPhone;

  if (!isPricingModalOpen) return null;

  // ─── STEP 1: Login Handler ─── //
  const handleLoginStep = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPhone = modalPhone.replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    const trimmedName = modalName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your name (minimum 2 characters).');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg(null);

    try {
      const res = await verifyAndLoginPhone(cleanPhone, trimmedName);
      if (res.success) {
        if (res.isPro) {
          setIsPricingModalOpen(false);
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your internet connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── STEP 2: Razorpay Payment Handler ─── //
  const handleRazorpayPayment = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const cleanPhone = (userPhone || modalPhone).replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Phone number missing. Please link your phone first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    // Ensure Razorpay SDK is ready
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      setIsProcessing(false);
      setErrorMsg('Razorpay payment gateway failed to load. Please check your internet connection.');
      return;
    }

    const livePrice = parseInt(localStorage.getItem('ssc_admin_pro_price') || '29', 10);
    const liveDays = parseInt(localStorage.getItem('ssc_admin_plan_days') || '60', 10);
    const razorpayKey = localStorage.getItem('ssc_razorpay_key_id') || 'rzp_test_TW4ruM3KntfeAG';
    const merchantName = localStorage.getItem('ssc_razorpay_merchant_name') || 'SSC English Pro';

    const options = {
      key: razorpayKey,
      amount: livePrice * 100, // Amount in paise (₹29 = 2900 paise)
      currency: 'INR',
      name: merchantName,
      description: `${liveDays} Days Full Pro Access (18,000+ PYQs & AI Grammar)`,
      image: 'https://edupluscreation.github.io/ENGLISHPRO/app_icon_mobile.jpg',
      handler: function (response: any) {
        setIsProcessing(false);
        unlockProMembership(liveDays, cleanPhone);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      },
      prefill: {
        name: userName || modalName || 'SSC Aspirant',
        email: 'aspirant@sscenglish.com',
        contact: cleanPhone
      },
      notes: {
        plan: 'SSC_ENGLISH_PRO_2_MONTHS',
        phone: cleanPhone
      },
      theme: {
        color: '#4f46e5'
      },
      modal: {
        backdropclose: false,
        escape: false,
        confirm_close: true,
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setErrorMsg(response.error?.description || 'Payment was cancelled or failed.');
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg('Could not open payment window: ' + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div 
      onClick={() => setIsPricingModalOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '20px 18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsPricingModalOpen(false)}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={15} />
        </button>

        {/* ═══════════════════════════════════════════ */}
        {/* STEP 1: LINK PHONE & NAME */}
        {/* ═══════════════════════════════════════════ */}
        {!isLoggedIn ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '14px', paddingRight: '20px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(79, 70, 229, 0.1)',
                color: 'var(--primary)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                marginBottom: '8px'
              }}>
                <Smartphone size={12} />
                <span>STEP 1 OF 2: SETUP ACCOUNT</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif" }}>
                Link Mobile Number
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                Save your progress, test scores & active membership.
              </p>
            </div>

            {/* Inputs Container */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Name Field */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '5px' }}>
                  <User size={13} color="var(--primary)" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '5px' }}>
                  <Smartphone size={13} color="var(--primary)" />
                  <span>10-Digit Mobile Number</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '9px', overflow: 'hidden' }}>
                  <div style={{ padding: '9px 10px', background: 'var(--bg-surface-elevated)', borderRight: '1px solid var(--border-color)', fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      flex: 1,
                      padding: '9px 10px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      letterSpacing: '0.04em'
                    }}
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', textAlign: 'center', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={() => handleLoginStep()}
              disabled={isLoggingIn}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '11px',
                justifyContent: 'center',
                cursor: isLoggingIn ? 'wait' : 'pointer'
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <span>Continue to Payment</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* ═══════════════════════════════════════════ */
          /* STEP 2: INSTANT RAZORPAY PAYMENT CARD */
          /* ═══════════════════════════════════════════ */
          <div>
            {/* Header Badge */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                color: 'var(--primary)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                marginBottom: '6px'
              }}>
                <Sparkles size={12} />
                <span>UNLIMITED PRO PASS</span>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 2px 0', fontFamily: "'Outfit', sans-serif" }}>
                Unlock Complete Access
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0 }}>
                Logged in as <b>+91 {userPhone}</b>
              </p>
            </div>

            {/* Price Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: '1.5px solid var(--primary)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                    ₹{localStorage.getItem('ssc_admin_pro_price') || '29'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    ₹299
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#10b981', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                    90% OFF
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600, marginTop: '2px' }}>
                  ⚡ {localStorage.getItem('ssc_admin_plan_days') || '60'} Days Unlimited All-Access
                </div>
              </div>

              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            {/* Features (Compact) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {[
                'All 18,000+ Official SSC PYQs (CGL, CHSL, MTS)',
                '120 Golden Grammar Rules with Hindi Notes',
                'Unlimited AI Grammar & Sentence Scanner',
                '100% Ad-Free & Offline Supported'
              ].map((feat, fIdx) => (
                <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px', textAlign: 'center', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Direct Pay Button */}
            <button
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '12px',
                justifyContent: 'center',
                cursor: isProcessing ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Opening Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Pay ₹{localStorage.getItem('ssc_admin_pro_price') || '29'} & Unlock Pro</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <ShieldCheck size={13} color="#10b981" />
              <span>100% Secure via UPI, GPay, PhonePe, Cards & NetBanking</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
