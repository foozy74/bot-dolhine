import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSettings } from '../hooks/useSettings';
import KPICard from '../components/common/KPICard';
import StatusDot from '../components/common/StatusDot';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  Scatter,
  ComposedChart
} from 'recharts';
import { 
  Play, 
  Square, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  BarChart2,
  Shield,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const { status, trades, isConnected } = useWebSocket();
  const { settings } = useSettings();
  const [priceHistory, setPriceHistory] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
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
        
        const newHistory = [...prev, newPoint].slice(-60);
        return newHistory;
      });
    }
  }, [status]);

  const handleStart = async () => {
    setIsStarting(true);
    setFeedbackMsg(null);
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
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      setFeedbackMsg({ type: 'success', text: 'Algo Engine erfolgreich gestartet' });
    } catch (error) {
      console.error('Fehler beim Starten:', error);
      setFeedbackMsg({ type: 'error', text: `Start fehlgeschlagen: ${error.message}` });
    } finally {
      setIsStarting(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    setFeedbackMsg(null);
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      if (!response.ok) throw new Error(await response.text());
      setFeedbackMsg({ type: 'info', text: 'Algo Engine gestoppt' });
    } catch (error) {
      console.error('Fehler beim Stoppen:', error);
      setFeedbackMsg({ type: 'error', text: `Stoppen fehlgeschlagen: ${error.message}` });
    } finally {
      setIsStopping(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const lastUpdateTime = status?.last_update 
    ? new Date(status.last_update).toLocaleTimeString('de-DE') 
    : 'STANDBY';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Dashboard Institutional Header */}
      <section 
        className="relative rounded-2xl p-5 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
                Algo Control Center
              </span>
              <span className="text-white/20">•</span>
              <StatusDot 
                status={isConnected ? 'live' : 'error'} 
                label={isConnected ? 'STREAM_ONLINE' : 'OFFLINE'} 
              />
              <span className="text-white/20">•</span>
              <StatusDot 
                status={status?.running ? 'live' : 'stale'} 
                label={status?.running ? 'ENGINE_EXECUTING' : 'ENGINE_STANDBY'} 
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              DELFIN <span className="gradient-text">TRADING TERMINAL</span>
            </h2>
            <p className="text-xs text-dim font-mono mt-1">
              Bitunix Momentum & Volatility Engine · {config.symbol} ({config.timeframe})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!status?.running ? (
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 20px' }}
              >
                <Play size={15} fill="currentColor" />
                {isStarting ? 'INITIALIZING...' : 'START_ENGINE'}
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={isStopping}
                className="btn btn-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444', height: '42px', padding: '0 20px' }}
              >
                <Square size={15} fill="currentColor" />
                {isStopping ? 'STOPPING...' : 'STOP_ENGINE'}
              </button>
            )}
          </div>
        </div>

        {feedbackMsg && (
          <div 
            className="mt-3 p-3 rounded-lg font-mono text-xs flex items-center gap-2"
            style={{
              backgroundColor: feedbackMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(125, 211, 192, 0.15)',
              border: `1px solid ${feedbackMsg.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(125, 211, 192, 0.3)'}`,
              color: feedbackMsg.type === 'error' ? '#ef4444' : 'var(--teal)',
            }}
          >
            <CheckCircle size={14} />
            {feedbackMsg.text}
          </div>
        )}
      </section>

      {/* AutoFund-Style KPICards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <KPICard
          label="MARKET_PRICE"
          value={status?.current_price ? formatCurrency(status.current_price) : '$0.00'}
          delta={status?.current_price ? `${config.symbol} SPOT` : undefined}
          tone="neutral"
          hint={`SYNC: ${lastUpdateTime}`}
          icon={DollarSign}
        />

        <KPICard
          label="ACTIVE_POSITION"
          value={status?.position || 'FLAT'}
          delta={
            status?.position 
              ? `ENTRY: ${formatCurrency(status.entry_price || 0)}` 
              : 'KEINE OFFENE POSITION'
          }
          tone={
            status?.position === 'LONG' ? 'positive' : 
            status?.position === 'SHORT' ? 'negative' : 'neutral'
          }
          hint={
            status?.position 
              ? `UNREALIZED: ${formatPercent(status.pnl || 0)}` 
              : 'WARTET AUF SIGNAL'
          }
          icon={
            status?.position === 'LONG' ? TrendingUp : 
            status?.position === 'SHORT' ? TrendingDown : Activity
          }
          badge={status?.position ? status.position : undefined}
        />

        <KPICard
          label="TOTAL_PNL_PERFORMANCE"
          value={status?.total_pnl !== undefined ? `${status.total_pnl > 0 ? '+' : ''}${status.total_pnl.toFixed(2)}%` : '0.00%'}
          delta={`${trades.length} EXECUTIONS`}
          tone={status?.total_pnl > 0 ? 'positive' : status?.total_pnl < 0 ? 'negative' : 'neutral'}
          hint={config.dry_run ? 'SIMULATION_MODE' : 'LIVE_CAPITAL'}
          icon={BarChart2}
          badge={config.dry_run ? 'PAPER' : 'LIVE'}
        />

        <KPICard
          label="RISK_GATE_STATUS"
          value={formatPercent(config.risk_pct)}
          delta={`${config.timeframe} KERZEN INTERVALL`}
          tone="neutral"
          hint="DRAWDOWN GUARD AKTIV"
          icon={Shield}
          badge="GUARD"
        />
      </div>

      {/* Main Grid: Chart & Engine Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Real-time Recharts Market Chart */}
        <div 
          className="terminal-box" 
          data-title="REALTIME_MARKET_STREAM" 
          style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex items-center justify-between px-1" style={{ marginTop: '16px', marginBottom: '14px' }}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white font-bold">{config.symbol}</span>
              <span className="badge badge-teal" style={{ fontSize: '9px' }}>{config.timeframe}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
                <span className="font-mono text-[9px] text-faint">LONG_ENTRY</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span className="font-mono text-[9px] text-faint">SHORT_ENTRY</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-faint)"
                  tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  stroke="var(--text-faint)"
                  tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 22, 37, 0.95)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(16px)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: 'var(--teal)' }}
                  labelStyle={{ color: 'var(--text-faint)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--teal)" 
                  fillOpacity={1} 
                  fill="url(#marketGradient)" 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Scatter
                  data={priceHistory.filter(point => point.position && point.entry_price)}
                  dataKey="entry_price"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const isLong = payload.position === 'LONG';
                    return (
                      <g transform={`translate(${cx-6},${cy-6})`}>
                        <circle cx="6" cy="6" r="6" fill={isLong ? 'var(--teal)' : '#ef4444'} />
                        <circle cx="6" cy="6" r="8" fill="none" stroke={isLong ? 'var(--teal)' : '#ef4444'} strokeOpacity="0.4" strokeWidth="2" />
                      </g>
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Parameters & System Health */}
        <div className="flex flex-col gap-4">
          <div className="terminal-box" data-title="ENGINE_PARAMETERS">
            <div className="flex flex-col gap-4" style={{ paddingTop: '16px' }}>
              <div>
                <label className="font-mono text-[11px] text-faint uppercase block" style={{ letterSpacing: '0.08em', marginBottom: '6px' }}>
                  HANDELSPAAR (SYMBOL)
                </label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                  className="glass-input font-mono"
                  placeholder="Z.B. BTCUSDT"
                  disabled={status?.running}
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-faint uppercase block" style={{ letterSpacing: '0.08em', marginBottom: '6px' }}>
                  ZEITFENSTER (TIMEFRAME)
                </label>
                <select
                  value={config.timeframe}
                  onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                  disabled={status?.running}
                  className="glass-input font-mono"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="1m">1 MINUTE (1M)</option>
                  <option value="5m">5 MINUTEN (5M)</option>
                  <option value="15m">15 MINUTEN (15M)</option>
                  <option value="1h">1 STUNDE (1H)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                  <label className="font-mono text-[11px] text-faint uppercase" style={{ letterSpacing: '0.08em' }}>
                    RISIKO-ALLOKATION PRO TRADE
                  </label>
                  <span className="font-mono text-xs text-teal font-bold">
                    {formatPercent(config.risk_pct)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.1"
                  step="0.01"
                  value={config.risk_pct}
                  onChange={(e) => setConfig({ ...config, risk_pct: parseFloat(e.target.value) })}
                  disabled={status?.running}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Simulation Mode Switch */}
              <div 
                className="flex items-center justify-between rounded-xl"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 14px',
                  marginTop: '4px',
                }}
              >
                <div>
                  <div className="font-mono text-xs text-white font-bold uppercase" style={{ letterSpacing: '0.04em' }}>
                    SIMULATION / DRY RUN
                  </div>
                  <div className="font-mono text-[10px] text-faint" style={{ marginTop: '2px' }}>
                    Trades ohne echtes Kapital ausführen
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.dry_run}
                    onChange={(e) => setConfig({ ...config, dry_run: e.target.checked })}
                    disabled={status?.running}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="terminal-box" data-title="SYSTEM_DIAGNOSTICS">
            <div className="flex flex-col gap-3" style={{ paddingTop: '16px' }}>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-faint uppercase" style={{ letterSpacing: '0.08em' }}>WEBSOCKET_STREAM</span>
                <span className={`font-mono text-[11px] font-bold ${isConnected ? 'text-teal' : 'text-red-400'}`}>
                  {isConnected ? '100% OPERATIONAL' : 'DISCONNECTED'}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: isConnected ? '100%' : '0%', height: '100%', backgroundColor: isConnected ? 'var(--teal)' : '#ef4444', borderRadius: '999px', transition: 'width 0.3s ease' }} />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '6px' }}>
                <span className="font-mono text-[11px] text-faint uppercase" style={{ letterSpacing: '0.08em' }}>ENGINE_STATUS</span>
                <span className="font-mono text-[11px] text-blue font-bold">
                  {status?.running ? 'ACTIVE_LOOP' : 'IDLE'}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: status?.running ? '100%' : '20%', height: '100%', backgroundColor: 'var(--blue)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Log Table Section */}
      <section className="terminal-box" data-title="TRADE_EXECUTION_MANIFEST">
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {trades.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr className="font-mono text-[10px] text-faint uppercase">
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>ZEITPUNKT</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>AKTION</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>KURS (PRICE)</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px' }}>GEWINN/VERLUST</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px' }}>VERIFIKATION</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice().reverse().map((trade, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-white/5 transition-colors"
                    style={{ backgroundColor: 'rgba(20, 28, 46, 0.4)' }}
                  >
                    <td style={{ padding: '10px 14px' }} className="font-mono text-xs text-dim">
                      {new Date(trade.timestamp || trade.time).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${trade.action?.includes('BUY') || trade.action?.includes('LONG') ? 'badge-teal' : 'badge-purple'}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }} className="font-mono text-xs font-bold text-white">
                      {formatCurrency(trade.price || 0)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }} className={`font-mono text-xs font-bold ${trade.pnl > 0 ? 'text-teal' : trade.pnl < 0 ? 'text-red-400' : 'text-dim'}`}>
                      {trade.pnl !== undefined ? (trade.pnl > 0 ? '+' : '') + `${trade.pnl.toFixed(2)}%` : '--'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <CheckCircle size={14} className="text-teal opacity-60 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-faint">
              <Zap size={32} className="mb-3 opacity-30 text-teal" />
              <p className="font-mono text-xs tracking-wider">AWAITING_FIRST_TRADE_SIGNAL</p>
              <p className="font-mono text-[10px] text-faint mt-1">Keine abgeschlossenen Trades in der aktuellen Session</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
