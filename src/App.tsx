import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PricingModal } from './components/PricingModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ExitModal } from './components/ExitModal';
import { App as CapacitorApp } from '@capacitor/app';

// Lazy load sub-screens for instant 60 FPS performance and low memory footprint
const TopicSets = lazy(() => import('./components/TopicSets').then(m => ({ default: m.TopicSets })));
const QuizEngine = lazy(() => import('./components/QuizEngine').then(m => ({ default: m.QuizEngine })));
const ResultScreen = lazy(() => import('./components/ResultScreen').then(m => ({ default: m.ResultScreen })));
const VocabBank = lazy(() => import('./components/VocabBank').then(m => ({ default: m.VocabBank })));
const MistakeVault = lazy(() => import('./components/MistakeVault').then(m => ({ default: m.MistakeVault })));
const GrammarRules = lazy(() => import('./components/GrammarRules').then(m => ({ default: m.GrammarRules })));
const Bookmarks = lazy(() => import('./components/Bookmarks').then(m => ({ default: m.Bookmarks })));
const GrammarChecker = lazy(() => import('./components/GrammarChecker').then(m => ({ default: m.GrammarChecker })));
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));

const ViewLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '12px'
  }}>
    <div style={{
      width: '28px',
      height: '28px',
      border: '3px solid var(--border-color)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>Loading section...</span>
  </div>
);

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [currentView]);

  React.useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        document.body.classList.add('keyboard-open');
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !(active as HTMLElement).isContentEditable)) {
          document.body.classList.remove('keyboard-open');
        }
      }, 120);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        document.body.classList.toggle('keyboard-open', isKeyboard);
      }
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  return (
    <main style={{ 
      flex: '1 0 auto',
      minHeight: '100%', 
      paddingTop: 'calc(58px + env(safe-area-inset-top, 0px))', 
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', 
      width: '100%', 
      boxSizing: 'border-box'
    }}>
      <Suspense fallback={<ViewLoader />}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'topic_sets' && <TopicSets />}
        {currentView === 'quiz' && <QuizEngine />}
        {currentView === 'result' && <ResultScreen />}
        {currentView === 'vocab' && <VocabBank />}
        {currentView === 'mistakes' && <MistakeVault />}
        {currentView === 'grammar' && <GrammarRules />}
        {currentView === 'grammar_checker' && <GrammarChecker />}
        {currentView === 'bookmarks' && <Bookmarks />}
        {currentView === 'profile' && <Profile />}
      </Suspense>
    </main>
  );
};

const AppContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    isPricingModalOpen, 
    setIsPricingModalOpen, 
    showOnboarding, 
    setShowOnboarding, 
    streakDays, 
    xpPoints 
  } = useApp();

  const [isExitModalOpen, setIsExitModalOpen] = React.useState<boolean>(false);

  // Android Hardware Back Button Listener
  React.useEffect(() => {
    let backListener: any;
    try {
      backListener = CapacitorApp.addListener('backButton', () => {
        // 1. If Exit Modal is open, close it
        if (isExitModalOpen) {
          setIsExitModalOpen(false);
          return;
        }

        // 2. If Pricing Modal or Onboarding Tour is open, close them first
        if (isPricingModalOpen) {
          setIsPricingModalOpen(false);
          return;
        }
        if (showOnboarding) {
          setShowOnboarding(false);
          return;
        }

        // 3. If in any sub-screen, navigate backward toward Home Dashboard
        if (currentView !== 'dashboard') {
          if (currentView === 'quiz') {
            setCurrentView('topic_sets');
          } else {
            setCurrentView('dashboard');
          }
          return;
        }

        // 4. If already on Home Dashboard, show Exit Confirmation Popup
        setIsExitModalOpen(true);
      });
    } catch {
      // Not on native device
    }

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, [currentView, isExitModalOpen, isPricingModalOpen, showOnboarding, setCurrentView, setIsPricingModalOpen, setShowOnboarding]);

  return (
    <div className="app-android-shell">
      <Header />
      <MainContent />
      <PricingModal />
      <OnboardingModal />
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        streakDays={streakDays}
        xpPoints={xpPoints}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
