import React, { useState } from 'react';
import KPICard from '../components/common/KPICard';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Play,
  Loader2,
  BarChart3,
  Database,
  AlertCircle,
  Shield,
  Layers
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Backtest = () => {
  const [config, setConfig] = useState({
    symbol: 'BTCUSDT',
    timeframe: '5m',
    days: 30,
    initial_capital: 10000,
    risk_per_trade: 0.02,
    leverage: 1,
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'BACKTEST_EXECUTION_FAILURE');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-1">
            STRATEGY <span className="gradient-text">BACKTEST LAB</span>
          </h2>
          <div className="flex items-center gap-3 font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue" />
              HISTORICAL_DATA_READY
            </span>
            <span>•</span>
            <span className="text-teal">DATA_SOURCE: BITUNIX K-LINES</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ minWidth: '220px' }}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SIMULATING_HISTORICAL_DATA...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                EXECUTE_BACKTEST_RUN
              </>
            )}
          </button>
        </div>
      </section>

      {/* Configuration Grid Panel */}
      <div className="terminal-box" data-title="SIMULATION_PARAMETERS">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }} className="pt-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">ASSET_IDENTIFIER</label>
            <input
              type="text"
              value={config.symbol}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
              className="glass-input font-mono"
              placeholder="BTCUSDT"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">TIMEFRAME_WINDOW</label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
              className="glass-input font-mono"
              disabled={isRunning}
            >
              <option value="5m">5 MINUTEN (5M)</option>
              <option value="15m">15 MINUTEN (15M)</option>
              <option value="1h">1 STUNDE (1H)</option>
              <option value="4h">4 STUNDEN (4H)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">LOOKBACK_WINDOW</label>
            <select
              value={config.days}
              onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
              className="glass-input font-mono"
              disabled={isRunning}
            >
              <option value={7}>07 TAGE</option>
              <option value={30}>30 TAGE</option>
              <option value={90}>90 TAGE</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">STARTKAPITAL (USD)</label>
            <input
              type="number"
              value={config.initial_capital}
              onChange={(e) => setConfig({ ...config, initial_capital: parseFloat(e.target.value) })}
              className="glass-input font-mono"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">RISIKO PRO TRADE (%)</label>
            <input
              type="number"
              value={config.risk_per_trade * 100}
              onChange={(e) => setConfig({ ...config, risk_per_trade: parseFloat(e.target.value) / 100 })}
              className="glass-input font-mono"
              step="0.5"
              min="0.5"
              max="10"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-faint uppercase">HEBEL (LEVERAGE)</label>
            <input
              type="number"
              value={config.leverage}
              onChange={(e) => setConfig({ ...config, leverage: parseFloat(e.target.value) })}
              className="glass-input font-mono"
              min="1"
              max="10"
              disabled={isRunning}
            />
          </div>
        </div>

        {error && (
          <div 
            className="mt-3 p-3 rounded-xl flex items-center gap-3 font-mono text-xs"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>FEHLER BEI SIMULATION: {error}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Institutional KPI Cards Grid (AutoFund Style) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <KPICard
              label="TOTAL_RETURN"
              value={formatPercent(result.metrics.total_return)}
              tone={result.metrics.total_return > 0 ? 'positive' : 'negative'}
              delta={`${result.metrics.total_trades} TRADES`}
              icon={DollarSign}
              badge={result.metrics.total_return > 0 ? 'PROFIT' : 'LOSS'}
            />

            <KPICard
              label="MAX_DRAWDOWN"
              value={formatPercent(result.metrics.max_drawdown)}
              tone="negative"
              hint="PEAK-TO-VALLEY DROP"
              icon={TrendingDown}
              badge="RISK"
            />

            <KPICard
              label="WIN_RATE"
              value={formatPercent(result.metrics.win_rate)}
              tone={result.metrics.win_rate >= 50 ? 'positive' : 'warn'}
              hint="PROFITABLE TRADES"
              icon={CheckCircle}
              badge="ACCURACY"
            />

            <KPICard
              label="PROFIT_FACTOR"
              value={result.metrics.profit_factor ? result.metrics.profit_factor.toFixed(2) : '0.00'}
              tone={result.metrics.profit_factor > 1.2 ? 'positive' : 'warn'}
              hint="GROSS WIN / LOSS"
              icon={BarChart3}
            />

            <KPICard
              label="SHARPE_RATIO"
              value={result.metrics.sharpe_ratio ? result.metrics.sharpe_ratio.toFixed(2) : '0.00'}
              tone={result.metrics.sharpe_ratio > 1 ? 'positive' : 'neutral'}
              hint="RISK-ADJUSTED RETURN"
              icon={Activity}
            />

            <KPICard
              label="TOTAL_EXECUTIONS"
              value={String(result.metrics.total_trades || 0)}
              tone="neutral"
              hint={`${config.days} TAGE SIMULATION`}
              icon={Database}
            />
          </div>

          {/* Equity Performance Curve Chart */}
          <div className="terminal-box" data-title="EQUITY_PERFORMANCE_CURVE">
            <div style={{ height: '380px', width: '100%' }} className="pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equity_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="backtestEquityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="var(--text-faint)"
                    tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-faint)"
                    tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 22, 37, 0.95)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '10px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                    labelStyle={{ color: 'var(--blue)', marginBottom: '4px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--teal)' }}
                    formatter={(val) => [formatCurrency(val), 'EQUITY']}
                    labelFormatter={(label) => `SIM_DATE: ${new Date(label).toLocaleString('de-DE')}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="var(--teal)" 
                    fillOpacity={1} 
                    fill="url(#backtestEquityGradient)" 
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Ledger Table */}
          <div className="terminal-box" data-title="SIMULATED_TRADE_LEDGER">
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr className="font-mono text-[10px] text-faint uppercase">
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>EXECUTION_TIME</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>RICHTUNG</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>ENTRY_PRC</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>EXIT_PRC</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>PNL_DELTA</th>
                    <th style={{ textAlign: 'center', padding: '10px 14px' }}>TRIGGER</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-white/5 transition-colors"
                      style={{ backgroundColor: 'rgba(20, 28, 46, 0.4)' }}
                    >
                      <td style={{ padding: '10px 14px' }} className="font-mono text-xs text-dim whitespace-nowrap">
                        {new Date(trade.entry_time).toLocaleString('de-DE', { 
                          month: 'short', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${trade.direction === 'LONG' ? 'badge-teal' : 'badge-danger'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }} className="font-mono text-xs text-dim">
                        ${trade.entry_price ? trade.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }} className="font-mono text-xs text-dim">
                        ${trade.exit_price ? trade.exit_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }} className={`font-mono text-xs font-bold ${trade.pnl > 0 ? 'text-teal' : 'text-red-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span className={`badge ${trade.exit_reason === 'TP' || trade.exit_reason === 'TAKE_PROFIT' ? 'badge-teal' : 'badge-purple'}`} style={{ fontSize: '9px' }}>
                          {trade.exit_reason || 'MANUAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Backtest;
