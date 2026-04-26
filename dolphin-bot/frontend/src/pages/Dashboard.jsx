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
  Zap,
  Cpu,
  BarChart2
} from 'lucide-react';

const Dashboard = () => {
  const { status, trades, isConnected } = useWebSocket();
  const { settings } = useSettings();
  const [priceHistory, setPriceHistory] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="flex flex-col gap-xl">
      {/* Dashboard Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-xs">OPERATIONAL_DASHBOARD</h2>
          <div className="flex items-center gap-md font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal' : 'bg-red-500'}`} />
              WS_{isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-xs">
              <span className={`w-2 h-2 rounded-full ${status?.running ? 'bg-teal' : 'bg-orange-500'}`} />
              BOT_{status?.running ? 'EXECUTING' : 'STANDBY'}
            </span>
            <span>•</span>
            <span className="text-teal">TRADING_SYST_V4.0</span>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          {!status?.running ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="btn btn-primary"
            >
              <Play size={16} fill="currentColor" />
              {isStarting ? 'INITIALIZING...' : 'START_ENGINE'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={isStopping}
              className="btn btn-outline"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              <Square size={16} fill="currentColor" />
              {isStopping ? 'TERMINATING...' : 'STOP_ENGINE'}
            </button>
          )}
        </div>
      </section>

      {/* Main Grid: Stats & Real-time Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="terminal-box" data-title="CURRENT_PRICE">
          <div className="flex items-center justify-between mb-sm">
            <DollarSign className="text-teal" size={20} />
            <span className="font-mono text-[10px] text-faint">USDT_SPOT</span>
          </div>
          <div className="text-4xl font-bold font-display tracking-tight text-white mb-xs">
            {status?.current_price ? formatCurrency(status.current_price) : '$0.00'}
          </div>
          <div className="font-mono text-[10px] text-faint flex items-center gap-xs">
            <Clock size={12} />
            UPDATED: {status?.last_update ? new Date(status.last_update).toLocaleTimeString('de-DE') : 'WAITING_FOR_DATA'}
          </div>
        </div>

        <div className="terminal-box" data-title="ACTIVE_POSITION">
          <div className="flex items-center justify-between mb-sm">
            {status?.position === 'LONG' ? <TrendingUp className="text-teal" size={20} /> : 
             status?.position === 'SHORT' ? <TrendingDown className="text-red-400" size={20} /> : 
             <Activity className="text-faint" size={20} />}
            <span className="font-mono text-[10px] text-faint">DELTA_EXPOSURE</span>
          </div>
          {status?.position ? (
            <div className="flex flex-col">
              <div className={`text-3xl font-bold font-display ${status.position === 'LONG' ? 'text-teal' : 'text-red-400'}`}>
                {status.position}
              </div>
              <div className="grid grid-cols-2 gap-md mt-sm">
                <div>
                  <div className="font-mono text-[9px] text-faint uppercase">Entry_Px</div>
                  <div className="font-mono text-xs font-bold">{formatCurrency(status.entry_price || 0)}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-faint uppercase">PnL_Unrealized</div>
                  <div className={`font-mono text-xs font-bold ${status.pnl >= 0 ? 'text-teal' : 'text-red-400'}`}>
                    {formatPercent(status.pnl || 0)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[70px] flex items-center justify-center border border-dashed border-white/5 rounded-lg text-faint font-mono text-[10px]">
              NO_ACTIVE_MARKET_ORDERS
            </div>
          )}
        </div>

        <div className="terminal-box" data-title="STRATEGY_PERFORMANCE">
          <div className="flex items-center justify-between mb-sm">
            <BarChart2 className="text-blue" size={20} />
            <span className="font-mono text-[10px] text-faint">SESSION_STATS</span>
          </div>
          <div className="flex flex-col">
            <div className={`text-4xl font-bold font-display ${status?.total_pnl >= 0 ? 'text-teal' : 'text-red-400'}`}>
              {status?.total_pnl !== undefined ? formatPercent(status.total_pnl) : '0.00%'}
            </div>
            <div className="flex items-center gap-sm mt-xs">
              <div className="badge badge-blue">BOT_{status?.running ? 'ACTIVE' : 'IDLE'}</div>
              <div className="badge badge-teal">{status?.dry_run ? 'SIM_MODE' : 'LIVE_EXEC'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Control Panel Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="flex-col lg:grid">
        <div className="terminal-box" data-title="REALTIME_MARKET_FLOW" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-1 mt-md">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceHistory}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
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
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(10, 15, 26, 0.9)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px'
                  }}
                  itemStyle={{ color: 'var(--teal)' }}
                  labelStyle={{ color: 'var(--text-faint)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--teal)" 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  strokeWidth={2}
                  animationDuration={1000}
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
                        <circle cx="6" cy="6" r="8" fill="none" stroke={isLong ? 'var(--teal)' : '#ef4444'} strokeOpacity="0.3" strokeWidth="2" />
                      </g>
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-lg mt-md px-md pb-xs">
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <span className="font-mono text-[9px] text-faint uppercase tracking-wider">Long_Entry_Signals</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-mono text-[9px] text-faint uppercase tracking-wider">Short_Entry_Signals</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="terminal-box" data-title="ENGINE_CONFIGURATION">
            <div className="flex flex-col gap-md py-sm">
              <div>
                <label className="font-mono text-[10px] text-faint uppercase block mb-xs">TRADING_SYMBOL</label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                  className="glass-input font-mono text-sm"
                  placeholder="E.G. BTCUSDT"
                  disabled={status?.running}
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-faint uppercase block mb-xs">TIMEFRAME_WINDOW</label>
                <select
                  value={config.timeframe}
                  onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                  disabled={status?.running}
                  className="glass-input font-mono text-sm"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="1m">01_MINUTE</option>
                  <option value="5m">05_MINUTES</option>
                  <option value="15m">15_MINUTES</option>
                  <option value="1h">01_HOUR</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] text-faint uppercase block mb-xs">RISK_ALLOCATION_PCT</label>
                <div className="flex items-center gap-md">
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.01"
                    value={config.risk_pct}
                    onChange={(e) => setConfig({ ...config, risk_pct: parseFloat(e.target.value) })}
                    disabled={status?.running}
                    className="flex-1 accent-teal"
                  />
                  <span className="font-mono text-xs text-teal w-12 text-right">{formatPercent(config.risk_pct)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-md rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="font-mono text-[10px] text-white font-bold uppercase">Simulation_Mode</div>
                  <div className="font-mono text-[9px] text-faint uppercase">Execute without real capital</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config.dry_run}
                    onChange={(e) => setConfig({ ...config, dry_run: e.target.checked })}
                    disabled={status?.running}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="terminal-box" data-title="SYSTEM_HEALTH">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-faint">CPU_USAGE</span>
                <span className="font-mono text-[10px] text-teal">12.4%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-teal h-full" style={{ width: '12.4%' }} />
              </div>
              <div className="flex justify-between items-center mt-xs">
                <span className="font-mono text-[10px] text-faint">MEMORY_STACK</span>
                <span className="font-mono text-[10px] text-blue">256MB / 1GB</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-blue h-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History Section */}
      <section className="terminal-box" data-title="EXECUTION_LOG_MANIFEST">
        <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
          {trades.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr className="font-mono text-[10px] text-faint uppercase">
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>Timestamp_Ref</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>Action_Type</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>Execution_Px</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>Profit_Loss</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice().reverse().map((trade, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors group">
                    <td style={{ padding: '12px 16px' }} className="font-mono text-xs text-dim">
                      {new Date(trade.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${trade.action === 'BUY' ? 'badge-teal' : 'badge-purple'}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} className="font-mono text-xs font-bold">
                      {formatCurrency(trade.price || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} className={`font-mono text-xs font-bold ${trade.pnl > 0 ? 'text-teal' : trade.pnl < 0 ? 'text-red-400' : 'text-dim'}`}>
                      {trade.pnl !== undefined ? (trade.pnl > 0 ? '+' : '') + formatCurrency(trade.pnl) : '--'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <CheckCircle size={14} className="text-teal opacity-50 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-faint">
              <Zap size={32} className="mb-md opacity-20" />
              <p className="font-mono text-xs tracking-widest">AWAITING_FIRST_EXECUTION_SEQUENCE</p>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(125,211,192,0.2); }
      `}} />
    </div>
  );
};

export default Dashboard;
