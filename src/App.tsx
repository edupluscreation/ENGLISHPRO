import React from 'react';
import { AppProvider } from './context/AppContext';
import { AdminPanel } from './components/AdminPanel';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
        <AdminPanel />
      </div>
    </AppProvider>
  );
};

export default App;
