import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Hyperliquid from './pages/Hyperliquid';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Help from './pages/Help';
import Backtest from './pages/Backtest';
import { WebSocketProvider } from './hooks/useWebSocket';
import { WalletProvider } from './hooks/useWallet';

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
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
        <div className="text-center">
          <div className="animate-pulse" style={{ fontSize: '3rem' }}>🐬</div>
          <p className="font-mono text-xs text-dim mt-4">INITIALIZING DELFIN ENGINE...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <WebSocketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hyperliquid" element={<Hyperliquid />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
      </WebSocketProvider>
    </WalletProvider>
  );
}

export default App;
