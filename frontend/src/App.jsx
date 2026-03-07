import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Help from './pages/Help';
import { WebSocketProvider } from './hooks/useWebSocket';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize settings on startup
    const initSettings = async () => {
      try {
        await fetch('/api/settings/initialize', { method: 'POST' });
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="animate-pulse" style={{ fontSize: '3rem' }}>🐬</div>
          <p className="text-secondary mt-md">Lade Delfin Bot...</p>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Layout>
    </WebSocketProvider>
  );
}

export default App;
