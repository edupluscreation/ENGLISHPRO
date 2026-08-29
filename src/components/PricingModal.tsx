import React, { useState } from 'react';
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
  Check,
  Smartphone,
  User,
  ArrowRight,
  Loader2
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PricingModal: React.FC = () => {
  const { isPricingModalOpen, setIsPricingModalOpen, unlockProMembership, userPhone, verifyAndLoginPhone, userName } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalPhone, setModalPhone] = useState(userPhone || '');
  const [modalName, setModalName] = useState(userName || '');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Determine which step to show:
  // Step 1: Login (if no phone linked)
  // Step 2: Payment (if phone is linked)
  const isLoggedIn = !!userPhone;

  if (!isPricingModalOpen) return null;

  // ─── STEP 1: Login Handler ─── //
  const handleLoginStep = async () => {
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
        // Login successful — modal will auto-switch to Step 2 (Payment)
        // because userPhone is now set
        setErrorMsg(null);
      } else {
        setErrorMsg(res.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Login error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── STEP 2: Payment Handler ─── //
  const handleRazorpayPayment = () => {
    const cleanPhone = (userPhone || modalPhone).replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Phone number missing. Please login first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const razorpayKey = (typeof window !== 'undefined' ? localStorage.getItem('ssc_razorpay_key_id') : '') || 'rzp_test_placeholder_key';
    const merchantName = (typeof window !== 'undefined' ? localStorage.getItem('ssc_razorpay_merchant_name') : '') || 'SSC English Pro';

    // If Razorpay SDK is loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: razorpayKey,
        amount: livePrice * 100, // Dynamic Amount in paise
        currency: 'INR',
        name: merchantName,
        description: `${liveDays} Days Full Pro Access (18,000+ PYQs, AI Grammar & 120 Rules)`,
        image: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>',
        handler: function (response: any) {
          setIsProcessing(false);
          const paymentId = response?.razorpay_payment_id || `RZP_${Date.now()}`;
          unlockProMembership(liveDays, cleanPhone, paymentId); // Dynamic Days with Phone linking
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 }
          });
        },
        prefill: {
          name: userName || localStorage.getItem('ssc_user_name') || 'SSC Aspirant',
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
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsProcessing(false);
          setErrorMsg(response.error?.description || 'Payment could not be completed.');
        });
        rzp.open();
      } catch (err) {
        activateProSandbox(cleanPhone);
      }
    } else {
      activateProSandbox(cleanPhone);
    }
  };

  const activateProSandbox = (cleanPhone: string) => {
    setTimeout(() => {
      setIsProcessing(false);
      unlockProMembership(60, cleanPhone);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '24px 22px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsPricingModalOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* ═══════════════════════════════════════════ */}
        {/* STEP 1: LOGIN (shown when user not logged in) */}
        {/* ═══════════════════════════════════════════ */}
        {!isLoggedIn ? (
          <>
            {/* Step Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800
              }}>1</div>
              <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--bg-surface-elevated)', color: 'var(--text-dim)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800
              }}>2</div>
            </div>

            {/* Login Header */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                <Smartphone size={13} />
                <span>Step 1: Login / Register</span>
              </div>

              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.25 }}>
                Login Required Before Payment
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Enter your name and 10-digit mobile number. This number will be linked to your Pro Pass.
              </p>
            </div>

            {/* Login Form */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Name Input */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  👤 Your Name:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', padding: '0 10px', height: '40px',
                    color: 'var(--text-dim)'
                  }}>
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="Enter your name"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '13.5px',
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  📱 Mobile Number:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0 10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-dim)'
                  }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit Mobile Number"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            {/* Login CTA */}
            <button
              onClick={handleLoginStep}
              disabled={isLoggingIn}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '12px',
                justifyContent: 'center',
                cursor: isLoggingIn ? 'wait' : 'pointer'
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={17} />
                  <span>Continue to Payment</span>
                </>
              )}
            </button>

            {/* Info note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <ShieldCheck size={13} color="#10b981" />
              <span>Your data is safe. Payment will proceed after login.</span>
            </div>

            {/* Spin animation for loader */}
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </>
        ) : (
          /* ═══════════════════════════════════════════ */
          /* STEP 2: PAYMENT (shown when user is logged in) */
          /* ═══════════════════════════════════════════ */
          <>
            {/* Step Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#10b981', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800
              }}>✓</div>
              <div style={{ flex: 1, height: '2px', background: '#10b981' }} />
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800
              }}>2</div>
            </div>

            {/* Logged-in user badge */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px'
            }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                Logged in: <span style={{ color: '#10b981' }}>{userName || 'Student'}</span> • +91 {userPhone}
              </span>
            </div>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                <Sparkles size={13} />
                <span>Step 2: Complete Payment</span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.25 }}>
                Unlock 18,000+ Official SSC PYQs & AI Tools
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Unlimited access to all 600+ SSC mock sets, AI grammar checker & 120 golden rules for 60 days.
              </p>
            </div>

            {/* Pricing Plan Card */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '2px solid var(--primary)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                    ₹{parseInt(localStorage.getItem('ssc_admin_pro_price') || '29', 10)}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    ₹{parseInt(localStorage.getItem('ssc_admin_orig_price') || '299', 10)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {Math.round(((parseInt(localStorage.getItem('ssc_admin_orig_price') || '299', 10) - parseInt(localStorage.getItem('ssc_admin_pro_price') || '29', 10)) / parseInt(localStorage.getItem('ssc_admin_orig_price') || '299', 10)) * 100)}% OFF
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px' }}>
                  ⚡ {parseInt(localStorage.getItem('ssc_admin_plan_days') || '60', 10)} Days Unlimited Pass
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
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            {/* Features Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                'Unlock all 18,000+ Official SSC PYQs & 600+ Mock Sets',
                'Full 120 Golden Grammar Rules with practice tests',
                'Unlimited AI Grammar & OCR Image Scanner',
                'Mistake Notebook & Starred Bookmarks revision'
              ].map((feat, fIdx) => (
                <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            {/* Payment CTA Button */}
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
                cursor: isProcessing ? 'wait' : 'pointer'
              }}
            >
              <CreditCard size={17} />
              <span>{isProcessing ? 'Processing...' : `Pay ₹${localStorage.getItem('ssc_admin_pro_price') || '29'} & Unlock Pro Pass`}</span>
            </button>

            {/* Security Trust Note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <ShieldCheck size={13} color="#10b981" />
              <span>100% Safe Payment via UPI, GPay, Paytm & Cards</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
