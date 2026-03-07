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
  Calendar
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
        throw new Error(data.detail || 'Backtest fehlgeschlagen');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📊 Backtest</h1>
        <p className="text-secondary">
          Teste die Trading-Strategie mit historischen Daten
        </p>
      </div>

      {/* Konfiguration */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>⚙️ Konfiguration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Trading Paar
            </label>
            <input
              type="text"
              value={config.symbol}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
              className="glass-input"
              placeholder="BTCUSDT"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Timeframe
            </label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
              className="glass-input"
              disabled={isRunning}
            >
              <option value="5m">5 Minuten</option>
              <option value="15m">15 Minuten</option>
              <option value="1h">1 Stunde</option>
              <option value="4h">4 Stunden</option>
            </select>
          </div>

          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Zeitraum
            </label>
            <select
              value={config.days}
              onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
              className="glass-input"
              disabled={isRunning}
            >
              <option value={7}>7 Tage</option>
              <option value={30}>30 Tage</option>
              <option value={90}>90 Tage</option>
            </select>
          </div>

          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Startkapital ($)
            </label>
            <input
              type="number"
              value={config.initial_capital}
              onChange={(e) => setConfig({ ...config, initial_capital: parseFloat(e.target.value) })}
              className="glass-input"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Risiko pro Trade (%)
            </label>
            <input
              type="number"
              value={config.risk_per_trade * 100}
              onChange={(e) => setConfig({ ...config, risk_per_trade: parseFloat(e.target.value) / 100 })}
              className="glass-input"
              step="0.5"
              min="0.5"
              max="5"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              Hebel
            </label>
            <input
              type="number"
              value={config.leverage}
              onChange={(e) => setConfig({ ...config, leverage: parseFloat(e.target.value) })}
              className="glass-input"
              min="1"
              max="10"
              disabled={isRunning}
            />
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="glass-button primary"
          style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
        >
          {isRunning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Backtest läuft...
            </>
          ) : (
            <>
              <Play size={18} />
              Backtest starten
            </>
          )}
        </button>

        {error && (
          <div 
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-danger)'
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Ergebnisse */}
      {result && (
        <>
          {/* Metriken */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <DollarSign size={20} style={{ color: result.metrics.total_return > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
                <span className="text-secondary">Total Return</span>
              </div>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: 600,
                color: result.metrics.total_return > 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
              }}>
                {formatPercent(result.metrics.total_return)}
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingDown size={20} style={{ color: 'var(--accent-danger)' }} />
                <span className="text-secondary">Max Drawdown</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-danger)' }}>
                {formatPercent(result.metrics.max_drawdown)}
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={20} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-secondary">Win Rate</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {formatPercent(result.metrics.win_rate)}
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BarChart3 size={20} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-secondary">Profit Factor</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {result.metrics.profit_factor.toFixed(2)}
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-secondary">Sharpe Ratio</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {result.metrics.sharpe_ratio.toFixed(2)}
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-secondary">Trades</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {result.metrics.total_trades}
              </p>
            </div>
          </div>

          {/* Equity Curve */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>📈 Equity Curve</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equity_curve}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)'
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('de-DE')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="var(--accent-success)" 
                    fillOpacity={1} 
                    fill="url(#equityGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Tabelle */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>📊 Letzte Trades</h3>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Zeit</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Direction</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Entry</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Exit</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>PnL</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Exit</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(trade.entry_time).toLocaleDateString('de-DE', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: trade.direction === 'LONG' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: trade.direction === 'LONG' ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        ${trade.entry_price.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        ${trade.exit_price?.toFixed(2) || '-'}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.875rem', 
                        fontWeight: 600,
                        textAlign: 'right',
                        color: trade.pnl > 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                      }}>
                        {formatCurrency(trade.pnl)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: trade.exit_reason === 'TP' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: trade.exit_reason === 'TP' ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>
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
