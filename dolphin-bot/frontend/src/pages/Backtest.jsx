import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Play,
  Loader2,
  BarChart3,
  PieChart,
  Calendar,
  Cpu,
  Database,
  ArrowRight
} from 'lucide-react';
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
  BarChart,
  Bar
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
    <div className="flex flex-col gap-xl animate-fade-in">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-xs uppercase">STRATEGY_BACKTEST_ENGINE</h2>
          <div className="flex items-center gap-md font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-blue" />
              HISTORICAL_MODE_ENABLED
            </span>
            <span>•</span>
            <span className="text-teal">DATA_SOURCE: BINANCE_SPOT</span>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ minWidth: '200px' }}
          >
            {isRunning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                SIMULATING...
              </>
            ) : (
              <>
                <Play size={18} />
                EXECUTE_SIMULATION
              </>
            )}
          </button>
        </div>
      </section>

      {/* Configuration Grid */}
      <div className="terminal-box" data-title="SIMULATION_PARAMETERS">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-md py-md">
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">ASSET_IDENTIFIER</label>
            <input
              type="text"
              value={config.symbol}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
              className="glass-input font-mono text-sm"
              placeholder="BTCUSDT"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">INTERVAL</label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
              className="glass-input font-mono text-sm"
              disabled={isRunning}
            >
              <option value="5m">5_MINUTES</option>
              <option value="15m">15_MINUTES</option>
              <option value="1h">1_HOUR</option>
              <option value="4h">4_HOURS</option>
            </select>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">LOOKBACK_WINDOW</label>
            <select
              value={config.days}
              onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
              className="glass-input font-mono text-sm"
              disabled={isRunning}
            >
              <option value={7}>07_DAYS</option>
              <option value={30}>30_DAYS</option>
              <option value={90}>90_DAYS</option>
            </select>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">INITIAL_EQUITY</label>
            <input
              type="number"
              value={config.initial_capital}
              onChange={(e) => setConfig({ ...config, initial_capital: parseFloat(e.target.value) })}
              className="glass-input font-mono text-sm"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">RISK_PER_UNIT</label>
            <input
              type="number"
              value={config.risk_per_trade * 100}
              onChange={(e) => setConfig({ ...config, risk_per_trade: parseFloat(e.target.value) / 100 })}
              className="glass-input font-mono text-sm"
              step="0.5"
              min="0.5"
              max="5"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-faint uppercase px-xs">MARGIN_LEVERAGE</label>
            <input
              type="number"
              value={config.leverage}
              onChange={(e) => setConfig({ ...config, leverage: parseFloat(e.target.value) })}
              className="glass-input font-mono text-sm"
              min="1"
              max="10"
              disabled={isRunning}
            />
          </div>
        </div>

        {error && (
          <div className="mt-md p-md rounded-2xl bg-red-400/5 border border-red-400/20 flex items-center gap-md">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span className="font-mono text-xs text-red-400 uppercase tracking-tighter">ERROR: {error}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
            {[
              { label: 'TOTAL_RETURN', val: formatPercent(result.metrics.total_return), icon: DollarSign, color: result.metrics.total_return > 0 ? 'text-teal' : 'text-red-400' },
              { label: 'MAX_DRAWDOWN', val: formatPercent(result.metrics.max_drawdown), icon: TrendingDown, color: 'text-red-400' },
              { label: 'WIN_RATE', val: formatPercent(result.metrics.win_rate), icon: CheckCircle, color: 'text-blue' },
              { label: 'PROFIT_FACTOR', val: result.metrics.profit_factor.toFixed(2), icon: BarChart3, color: 'text-purple' },
              { label: 'SHARPE_RATIO', val: result.metrics.sharpe_ratio.toFixed(2), icon: Activity, color: 'text-teal' },
              { label: 'TOTAL_TRADES', val: result.metrics.total_trades, icon: Database, color: 'text-blue' }
            ].map((m, i) => (
              <div key={i} className="terminal-box group hover:border-white/20 transition-all duration-300" style={{ padding: '16px' }}>
                <div className="flex items-center justify-between mb-sm">
                  <span className="font-mono text-[9px] text-faint uppercase tracking-widest">{m.label}</span>
                  <m.icon size={14} className={`${m.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div className={`text-2xl font-bold tracking-tight ${m.color}`}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Visualization Section */}
          <div className="terminal-box" data-title="EQUITY_PERFORMANCE_CURVE">
            <div className="h-[400px] w-full py-md">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equity_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                    labelStyle={{ color: 'var(--blue)', marginBottom: '8px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--teal)' }}
                    formatter={(value) => [formatCurrency(value), 'EQUITY_VAL']}
                    labelFormatter={(label) => `SIM_TIME: ${new Date(label).toLocaleString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="var(--teal)" 
                    fillOpacity={1} 
                    fill="url(#equityGradient)" 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Manifest Table */}
          <div className="terminal-box" data-title="SIMULATED_TRADE_LEDGER">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
                  <tr className="border-b border-white/5 text-faint uppercase">
                    <th className="py-md px-md text-left font-bold tracking-wider">EXECUTION_TIME</th>
                    <th className="py-md px-md text-left font-bold tracking-wider">DIRECTION</th>
                    <th className="py-md px-md text-right font-bold tracking-wider">ENTRY_PRC</th>
                    <th className="py-md px-md text-right font-bold tracking-wider">EXIT_PRC</th>
                    <th className="py-md px-md text-right font-bold tracking-wider">PNL_DELTA</th>
                    <th className="py-md px-md text-center font-bold tracking-wider">TRIGGER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.trades.map((trade, index) => (
                    <tr key={index} className="group hover:bg-white/5 transition-colors">
                      <td className="py-md px-md text-dim whitespace-nowrap">
                        {new Date(trade.entry_time).toLocaleString('en-US', { 
                          month: 'short', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-md px-md">
                        <span className={`
                          px-sm py-xs rounded-lg text-[9px] font-bold tracking-widest
                          ${trade.direction === 'LONG' ? 'bg-teal/10 text-teal' : 'bg-red-400/10 text-red-400'}
                        `}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="py-md px-md text-right text-dim">${trade.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-md px-md text-right text-dim">${trade.exit_price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}</td>
                      <td className={`py-md px-md text-right font-bold ${trade.pnl > 0 ? 'text-teal' : 'text-red-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </td>
                      <td className="py-md px-md text-center">
                        <span className={`
                          px-sm py-xs rounded-md text-[8px] font-bold border
                          ${trade.exit_reason === 'TP' ? 'border-teal/20 text-teal bg-teal/5' : 'border-red-400/20 text-red-400 bg-red-400/5'}
                        `}>
                          {trade.exit_reason}
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
