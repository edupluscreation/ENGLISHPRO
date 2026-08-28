import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TopicSets } from './components/TopicSets';
import { QuizEngine } from './components/QuizEngine';
import { ResultScreen } from './components/ResultScreen';
import { VocabBank } from './components/VocabBank';
import { MistakeVault } from './components/MistakeVault';
import { GrammarRules } from './components/GrammarRules';
import { Bookmarks } from './components/Bookmarks';
import { GrammarChecker } from './components/GrammarChecker';
import { Profile } from './components/Profile';
import { PricingModal } from './components/PricingModal';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [currentView]);

  return (
    <main style={{ minHeight: '100vh', paddingTop: '64px', paddingBottom: '85px' }}>
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
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <MainContent />
        <PricingModal />
      </div>
    </AppProvider>
  );
};

export default App;
