import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSettings } from '../hooks/useSettings';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Scatter,
  ComposedChart
} from 'recharts';
import { 
  Play, 
  Square, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
  const { status, trades, isConnected } = useWebSocket();
  const { settings } = useSettings();
  const [priceHistory, setPriceHistory] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState({
    api_key: '',
    secret_key: '',
    symbol: 'BTCUSDT',
    timeframe: '5m',
    risk_pct: 0.02,
    dry_run: true,
  });

  // Load settings when available
  useEffect(() => {
    if (settings.api?.bitunix_api_key?.value && settings.api?.bitunix_secret_key?.value) {
      setConfig(prev => ({
        ...prev,
        api_key: settings.api.bitunix_api_key.value,
        secret_key: settings.api.bitunix_secret_key.value,
      }));
    }
    if (settings.trading?.symbol?.value) {
      setConfig(prev => ({
        ...prev,
        symbol: settings.trading.symbol.value,
      }));
    }
    if (settings.trading?.timeframe?.value) {
      setConfig(prev => ({
        ...prev,
        timeframe: settings.trading.timeframe.value,
      }));
    }
    if (settings.trading?.risk_pct?.value !== undefined) {
      setConfig(prev => ({
        ...prev,
        risk_pct: settings.trading.risk_pct.value,
      }));
    }
    if (settings.trading?.dry_run?.value !== undefined) {
      setConfig(prev => ({
        ...prev,
        dry_run: settings.trading.dry_run.value,
      }));
    }
  }, [settings]);

  useEffect(() => {
    if (status?.current_price) {
      setPriceHistory((prev) => {
        const timestamp = new Date();
        const newPoint = {
          time: timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: status.current_price,
          pnl: status.pnl || 0,
          entry_price: status.entry_price || null,
          position: status.position || null,
          timestamp: timestamp.getTime(),
        };
        
        const lastPoint = prev[prev.length - 1];
        if (lastPoint && lastPoint.timestamp === newPoint.timestamp) {
          return [...prev.slice(0, -1), newPoint];
        }
        
        const newHistory = [...prev, newPoint].slice(-50);
        return newHistory;
      });
    }
  }, [status]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const configToSend = {
        api_key: '',
        secret_key: '',
        symbol: config.symbol,
        timeframe: config.timeframe,
        risk_pct: config.risk_pct,
        dry_run: config.dry_run,
      };
      
      const response = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSend),
      });
      
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      console.error('Fehler beim Starten:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      console.error('Fehler beim Stoppen:', error);
    } finally {
      setIsStopping(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
    { id: 'backtest', label: 'Backtest', icon: BarChart3 },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header mit Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>🐬 Delfin Bot Dashboard</h1>
            <p className="text-secondary">
              {isConnected ? '✅ Verbunden' : '❌ Nicht verbunden'} • 
              {status?.running ? '🟢 Aktiv' : '🔴 Inaktiv'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id ? 'var(--bg-glass)' : 'transparent',
                border: '1px solid var(--border-glass)',
                borderBottom: activeTab === tab.id ? 'none' : '1px solid var(--border-glass)',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                marginBottom: '-1px',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: activeTab === tab.id ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'var(--bg-glass)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Bot Status Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Activity size={24} style={{ color: status?.running ? 'var(--accent-success)' : 'var(--accent-warning)' }} />
                <h3>Bot Status</h3>
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {status?.running ? 'AKTIV' : 'INAKTIV'}
              </p>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                {status?.symbol || 'Kein Symbol'} • {status?.timeframe || '--'}
              </p>
              {status?.dry_run && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  background: 'var(--accent-warning)', 
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--bg-primary)'
                }}>
                  DRY RUN MODE
                </div>
              )}
            </div>

            {/* Current Price Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <DollarSign size={24} style={{ color: 'var(--accent-primary)' }} />
                <h3>Aktueller Preis</h3>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                {status?.current_price ? formatCurrency(status.current_price) : '--'}
              </p>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {status?.last_update ? `Letztes Update: ${new Date(status.last_update).toLocaleTimeString('de-DE')}` : 'Keine Daten'}
              </p>
            </div>

            {/* Position Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {status?.position === 'LONG' ? (
                  <TrendingUp size={24} style={{ color: 'var(--accent-success)' }} />
                ) : status?.position === 'SHORT' ? (
                  <TrendingDown size={24} style={{ color: 'var(--accent-danger)' }} />
                ) : (
                  <Clock size={24} style={{ color: 'var(--text-muted)' }} />
                )}
                <h3>Position</h3>
              </div>
              {status?.position ? (
                <>
                  <p style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600,
                    color: status.position === 'LONG' ? 'var(--accent-success)' : 'var(--accent-danger)'
                  }}>
                    {status.position}
                  </p>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Entry: {formatCurrency(status.entry_price || 0)}
                  </p>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    SL: {formatCurrency(status.stop_loss || 0)} • TP: {formatCurrency(status.take_profit || 0)}
                  </p>
                </>
              ) : (
                <p className="text-secondary">Keine offene Position</p>
              )}
            </div>

            {/* PnL Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <DollarSign size={24} style={{ color: status?.pnl >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
                <h3>PnL</h3>
              </div>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: 600,
                color: status?.pnl > 0 ? 'var(--accent-success)' : status?.pnl < 0 ? 'var(--accent-danger)' : 'var(--text-primary)'
              }}>
                {status?.pnl !== undefined ? formatPercent(status.pnl) : '--'}
              </p>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Total: {status?.total_pnl !== undefined ? formatPercent(status.total_pnl) : '--'}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {/* Price Chart */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>📈 Preisverlauf</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={priceHistory}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--text-secondary)"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      stroke="var(--text-secondary)"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)'
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="var(--accent-primary)" 
                      fillOpacity={1} 
                      fill="url(#priceGradient)" 
                      strokeWidth={2}
                    />
                    <Scatter
                      data={priceHistory.filter(point => point.position && point.entry_price)}
                      dataKey="entry_price"
                      fill={priceHistory.length > 0 && priceHistory[priceHistory.length - 1]?.position === 'LONG' ? '#22c55e' : '#ef4444'}
                      shape="circle"
                      r={6}
                      name="Entry"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                  <span className="text-secondary">Long Entry</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <span className="text-secondary">Short Entry</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>🎮 Steuerung</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Trading Paar
                </label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                  className="glass-input"
                  placeholder="z.B. BTCUSDT"
                  disabled={status?.running}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Timeframe
                </label>
                <select
                  value={config.timeframe}
                  onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                  className="glass-input"
                  disabled={status?.running}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minuten</option>
                  <option value="15m">15 Minuten</option>
                  <option value="1h">1 Stunde</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Risk %
                </label>
                <input
                  type="number"
                  value={config.risk_pct}
                  onChange={(e) => setConfig({ ...config, risk_pct: parseFloat(e.target.value) })}
                  className="glass-input"
                  step="0.01"
                  min="0.01"
                  max="0.10"
                  disabled={status?.running}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="glass-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.dry_run}
                    onChange={(e) => setConfig({ ...config, dry_run: e.target.checked })}
                    disabled={status?.running}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '44px',
                    height: '24px',
                    background: config.dry_run ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: config.dry_run ? '22px' : '2px',
                      transition: 'left 0.2s ease',
                    }} />
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Dry Run Mode</span>
                </label>
              </div>

              {!status?.running ? (
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="glass-button primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Play size={18} />
                  {isStarting ? 'Starte...' : 'START'}
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  disabled={isStopping}
                  className="glass-button danger"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Square size={18} />
                  {isStopping ? 'Stoppe...' : 'STOP'}
                </button>
              )}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>📜 Letzte Trades</h3>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {trades.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Zeit</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Aktion</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Preis</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(-10).reverse().map((trade, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {new Date(trade.timestamp).toLocaleString('de-DE')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: trade.action === 'BUY' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: trade.action === 'BUY' ? 'var(--accent-success)' : 'var(--accent-danger)'
                          }}>
                            {trade.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                          ${trade.price?.toFixed(2)}
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          textAlign: 'right',
                          color: trade.pnl > 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>
                          {trade.pnl ? formatCurrency(trade.pnl) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-secondary" style={{ padding: '2rem', textAlign: 'center' }}>
                  Keine Trades vorhanden
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Backtest Tab - iframe zur Backtest-Seite */
        <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          <iframe 
            src="/backtest" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              background: 'transparent'
            }}
            title="Backtest"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
