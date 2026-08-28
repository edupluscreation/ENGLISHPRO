import React from 'react';
import { AdminPanel } from './components/AdminPanel';

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #000000)', color: 'var(--text-main, #ffffff)' }}>
      <AdminPanel />
    </div>
  );
};

export default App;
