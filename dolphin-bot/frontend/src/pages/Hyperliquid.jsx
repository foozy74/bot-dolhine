import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import KPICard from '../components/common/KPICard';
import StatusDot from '../components/common/StatusDot';
import ConnectWalletButton from '../components/common/ConnectWalletButton';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Wallet, 
  Zap, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Lock,
  Globe
} from 'lucide-react';

const POPULAR_ASSETS = ['BTC', 'ETH', 'SOL', 'HYPE', 'SUI', 'AVAX', 'ARB', 'LINK'];

export default function Hyperliquid() {
  const { address, isConnected, signTypedData } = useWallet();
  const [networkInfo, setNetworkInfo] = useState({ network: 'mainnet', chain_id: 1337 });
  const [mids, setMids] = useState({});
  const [accountState, setAccountState] = useState(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [orderSide, setOrderSide] = useState('BUY'); // BUY or SELL
  const [orderSize, setOrderSize] = useState('0.01');
  const [executionMode, setExecutionMode] = useState('paper'); // 'paper' or 'web3'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  // Fetch Hyperliquid status & live prices
  const fetchMarketData = async () => {
    try {
      const [statusRes, midsRes] = await Promise.all([
        fetch('/api/hyperliquid/status'),
        fetch('/api/hyperliquid/mids')
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setNetworkInfo(sData);
      }

      if (midsRes.ok) {
        const mData = await midsRes.json();
        setMids(mData.mids || {});
      }
    } catch (err) {
      console.error('Failed to fetch Hyperliquid market data:', err);
    }
  };

  // Fetch connected wallet account state
  const fetchAccountState = async () => {
    if (!address) {
      setAccountState(null);
      return;
    }

    setIsLoadingAccount(true);
    try {
      const res = await fetch(`/api/hyperliquid/account/${address}`);
      if (res.ok) {
        const data = await res.json();
        setAccountState(data);
      }
    } catch (err) {
      console.error('Failed to fetch account state:', err);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      fetchAccountState();
      const accInterval = setInterval(fetchAccountState, 10000);
      return () => clearInterval(accInterval);
    } else {
      setAccountState(null);
    }
  }, [isConnected, address]);

  const handleExecuteOrder = async () => {
    setIsSubmitting(true);
    setOrderResult(null);

    const price = mids[selectedCoin] || 0;
    const sizeNum = parseFloat(orderSize);

    if (isNaN(sizeNum) || sizeNum <= 0) {
      setOrderResult({ ok: false, message: 'Ungültige Positionsgröße' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (executionMode === 'paper') {
        // Simulated execution against live Hyperliquid prices
        const res = await fetch('/api/hyperliquid/order/paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coin: selectedCoin,
            is_buy: orderSide === 'BUY',
            size: sizeNum,
            price: price,
            wallet_address: address || '0xPAPER_TRADER'
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Order fehlgeschlagen');

        setOrderResult({
          ok: true,
          message: `Paper Order gefüllt: ${orderSide} ${sizeNum} ${selectedCoin} @ $${price.toLocaleString()}`,
          data: data
        });

        setRecentTrades(prev => [data, ...prev.slice(0, 9)]);
      } else {
        // Web3 L1 Client Signing via browser wallet
        if (!address) {
          throw new Error('Bitte zuerst Web3 Wallet verbinden!');
        }

        const prepRes = await fetch('/api/hyperliquid/order/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coin: selectedCoin,
            is_buy: orderSide === 'BUY',
            size: sizeNum,
            price: price,
            reduce_only: false
          })
        });

        const prepData = await prepRes.json();
        if (!prepRes.ok) throw new Error(prepData.detail || 'Vorbereitung fehlgeschlagen');

        // Request user to sign EIP-712 in MetaMask/Rabby
        const signature = await signTypedData(prepData.typedData);

        setOrderResult({
          ok: true,
          message: `L1 Order erfolgreich signiert! Signatur: ${signature.slice(0, 10)}…${signature.slice(-8)}`,
          data: {
            mode: 'web3_signed',
            signature: signature,
            coin: selectedCoin,
            action: orderSide,
            size: sizeNum,
            price: price,
            status: 'SIGNED_ON_CHAIN'
          }
        });

        setRecentTrades(prev => [{
          mode: 'web3_signed',
          platform: 'Hyperliquid L1',
          coin: selectedCoin,
          action: orderSide,
          size: sizeNum,
          execution_price: price,
          notional_value: roundNum(sizeNum * price),
          status: 'EIP712_SIGNED',
          timestamp: Date.now()
        }, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error('Order error:', err);
      setOrderResult({
        ok: false,
        message: err.message || 'Ausführung fehlgeschlagen'
      });
    } finally {
      setIsSubmitting(false);
      if (isConnected) fetchAccountState();
    }
  };

  const currentPrice = mids[selectedCoin] || 0;
  const notionalValue = parseFloat(orderSize || '0') * currentPrice;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hyperliquid Header */}
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
                Decentralized Perpetual Exchange
              </span>
              <span className="text-white/20">•</span>
              <StatusDot 
                status="live" 
                label={`HYPERLIQUID_${networkInfo.network?.toUpperCase()}`} 
              />
              <span className="text-white/20">•</span>
              <span className="badge badge-blue" style={{ fontSize: '9px' }}>
                Chain ID {networkInfo.chain_id}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              HYPERLIQUID <span className="gradient-text">L1 TERMINAL</span>
            </h2>
            <p className="text-xs text-dim font-mono mt-1">
              Non-Custodial On-Chain Perpetuals · Bis zu 50x Hebel · EIP-712 Client Signing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ConnectWalletButton />
          </div>
        </div>

        {/* Live Mid Quotes Ticker Strip */}
        <div 
          className="mt-4 pt-3 flex items-center gap-4 overflow-x-auto border-t border-white/5"
          style={{ scrollbarWidth: 'none' }}
        >
          {POPULAR_ASSETS.map((coin) => {
            const px = mids[coin];
            const isSelected = selectedCoin === coin;
            return (
              <button
                key={coin}
                type="button"
                onClick={() => setSelectedCoin(coin)}
                className="flex items-center gap-2 p-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isSelected ? 'rgba(125, 211, 192, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--teal)' : 'var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                <span className="font-mono text-xs font-bold text-white">{coin}</span>
                <span className="font-mono text-xs text-teal">
                  {px ? `$${px >= 10 ? px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : px.toFixed(4)}` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Account & Margin Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <KPICard
          label="HYPERLIQUID_EQUITY"
          value={accountState ? `$${accountState.accountValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : (isConnected ? '$0.00' : 'WALLET GETRENNT')}
          delta={isConnected ? 'ON-CHAIN PORTFOLIO' : 'BITTE VERBINDEN'}
          tone={accountState?.accountValue > 0 ? 'positive' : 'neutral'}
          hint={isConnected ? `${networkInfo.network.toUpperCase()} CLEARINGHOUSE` : 'KEINE SIGNATUR ERFORDERLICH'}
          icon={Wallet}
          badge="L1 ASSET"
        />

        <KPICard
          label="MARGIN_AUSLASTUNG"
          value={accountState ? `$${accountState.totalMarginUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
          delta={accountState ? `${((accountState.totalMarginUsed / (accountState.accountValue || 1)) * 100).toFixed(1)}% MARGIN` : '0.0%'}
          tone={accountState?.totalMarginUsed > 0 ? 'warn' : 'neutral'}
          hint="CROSS-MARGIN DEPOSIT"
          icon={Shield}
        />

        <KPICard
          label="VERFÜGBARES_BARGELD"
          value={accountState ? `$${accountState.withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
          delta="SOFORT ABHEBBAR"
          tone="positive"
          hint="USDC COLLATERAL"
          icon={DollarSign}
        />

        <KPICard
          label="OFFENE_L1_POSITIONEN"
          value={accountState ? String(accountState.positions.length) : '0'}
          delta={selectedCoin + ' AKTIV'}
          tone={accountState?.positions?.length > 0 ? 'positive' : 'neutral'}
          hint="ON-CHAIN KONTRAKTE"
          icon={Layers}
          badge={accountState?.positions?.length > 0 ? 'AKTIV' : 'FLAT'}
        />
      </div>

      {/* Main Grid: Trading Terminal & Active Positions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Order Terminal */}
        <div className="terminal-box" data-title="HYPERLIQUID_ORDER_TERMINAL">
          <div className="flex flex-col gap-4 pt-3">
            {/* Asset & Price Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-mono text-[10px] text-faint uppercase block">KONTRAKT</span>
                <span className="font-mono text-base font-bold text-white">{selectedCoin}-PERP</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] text-faint uppercase block">HYPERLIQUID MID</span>
                <span className="font-mono text-base font-bold text-teal">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Buy / Sell Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className="btn"
                style={{
                  backgroundColor: orderSide === 'BUY' ? 'rgba(125, 211, 192, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: orderSide === 'BUY' ? 'var(--teal)' : 'var(--glass-border)',
                  color: orderSide === 'BUY' ? 'var(--teal)' : 'var(--text-dim)',
                  fontWeight: 700
                }}
              >
                <TrendingUp size={16} />
                <span>LONG / BUY</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className="btn"
                style={{
                  backgroundColor: orderSide === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: orderSide === 'SELL' ? '#ef4444' : 'var(--glass-border)',
                  color: orderSide === 'SELL' ? '#ef4444' : 'var(--text-dim)',
                  fontWeight: 700
                }}
              >
                <TrendingDown size={16} />
                <span>SHORT / SELL</span>
              </button>
            </div>

            {/* Size Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-mono text-[10px] text-faint uppercase">
                  POSITIONSGRÖSSE ({selectedCoin})
                </label>
                <span className="font-mono text-xs text-dim">
                  ≈ ${notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                className="glass-input font-mono text-base font-bold"
                placeholder="0.01"
              />
            </div>

            {/* Execution Mode Selector */}
            <div>
              <label className="font-mono text-[10px] text-faint uppercase block mb-1.5">
                AUSFÜHRUNGSMODUS
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExecutionMode('paper')}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: executionMode === 'paper' ? 'rgba(91, 155, 213, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: executionMode === 'paper' ? 'var(--blue)' : 'var(--glass-border)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-blue font-bold font-mono text-xs">
                    <Zap size={14} />
                    <span>PAPER TRADING</span>
                  </div>
                  <span className="text-[10px] text-faint font-mono block mt-1">
                    Sofortige Simulation ohne Wallet-Kosten
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExecutionMode('web3')}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: executionMode === 'web3' ? 'rgba(125, 211, 192, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: executionMode === 'web3' ? 'var(--teal)' : 'var(--glass-border)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-teal font-bold font-mono text-xs">
                    <Lock size={14} />
                    <span>WEB3 L1 SIGNING</span>
                  </div>
                  <span className="text-[10px] text-faint font-mono block mt-1">
                    EIP-712 Signatur im Browser (MetaMask/Rabby)
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleExecuteOrder}
              disabled={isSubmitting}
              className={`btn ${orderSide === 'BUY' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                width: '100%',
                height: '46px',
                borderColor: orderSide === 'SELL' ? '#ef4444' : undefined,
                color: orderSide === 'SELL' ? '#ef4444' : undefined,
                backgroundColor: orderSide === 'SELL' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                fontSize: '13px',
                fontWeight: 800,
                marginTop: '6px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>ÜBERTRAGE ORDER...</span>
                </>
              ) : (
                <>
                  {orderSide === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{orderSide} {selectedCoin} {executionMode === 'web3' ? '(EIP-712)' : '(PAPER)'}</span>
                </>
              )}
            </button>

            {/* Feedback Message */}
            {orderResult && (
              <div 
                className="p-3 rounded-xl font-mono text-xs flex flex-col gap-1 animate-fade-in"
                style={{
                  backgroundColor: orderResult.ok ? 'rgba(125, 211, 192, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${orderResult.ok ? 'rgba(125, 211, 192, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: orderResult.ok ? 'var(--teal)' : '#ef4444',
                }}
              >
                <div className="flex items-center gap-2 font-bold">
                  {orderResult.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  <span>{orderResult.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active On-Chain Positions & Recent Ledger */}
        <div className="flex flex-col gap-4">
          <div className="terminal-box" data-title="ACTIVE_L1_POSITIONS">
            <div className="pt-2">
              {accountState?.positions && accountState.positions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                    <thead>
                      <tr className="font-mono text-[10px] text-faint uppercase">
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>COIN</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px' }}>GRÖSSE</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px' }}>ENTRY</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px' }}>PNL</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px' }}>ROE%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountState.positions.map((pos, idx) => (
                        <tr 
                          key={idx} 
                          style={{ backgroundColor: 'rgba(20, 28, 46, 0.5)' }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td style={{ padding: '8px 12px' }} className="font-mono text-xs font-bold text-white">
                            {pos.coin}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }} className="font-mono text-xs">
                            <span className={pos.size > 0 ? 'text-teal' : 'text-red-400'}>
                              {pos.size > 0 ? `+${pos.size}` : pos.size}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }} className="font-mono text-xs text-dim">
                            ${pos.entryPx.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }} className={`font-mono text-xs font-bold ${pos.unrealizedPnl >= 0 ? 'text-teal' : 'text-red-400'}`}>
                            {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }} className={`font-mono text-xs font-bold ${pos.returnOnEquity >= 0 ? 'text-teal' : 'text-red-400'}`}>
                            {(pos.returnOnEquity * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-faint">
                  <Shield size={28} className="mb-2 opacity-30 text-teal" />
                  <p className="font-mono text-xs uppercase">KEINE OFFENEN L1 POSITIONEN</p>
                  <p className="font-mono text-[10px] mt-1 text-dim">
                    {isConnected ? 'Dein Wallet hat derzeit keine offenen Kontrakte auf Hyperliquid.' : 'Verbinde dein Web3 Wallet für eine Live-Übersicht deiner Hyperliquid Positionen.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hyperliquid Trade Manifest */}
          <div className="terminal-box" data-title="SESSION_EXECUTION_LEDGER">
            <div style={{ maxHeight: '240px', overflowY: 'auto' }} className="pt-2">
              {recentTrades.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recentTrades.map((t, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg font-mono text-xs flex items-center justify-between"
                      style={{ backgroundColor: 'rgba(20, 28, 46, 0.4)', border: '1px solid var(--glass-border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`badge ${t.action === 'BUY' ? 'badge-teal' : 'badge-danger'}`} style={{ fontSize: '9px' }}>
                          {t.action}
                        </span>
                        <span className="font-bold text-white">{t.size} {t.coin}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-dim">${t.execution_price?.toLocaleString()}</span>
                        <span className="badge badge-blue" style={{ fontSize: '8px' }}>{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-faint font-mono text-xs">
                  AWAITING_HYPERLIQUID_ORDERS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundNum(val) {
  return Math.round(val * 100) / 100;
}
