import React from 'react';
import { AdminPanel } from './components/AdminPanel';

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#ffffff' }}>
      <AdminPanel />
    </div>
  );
};

export default App;
