import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Wallet, ChevronDown, Copy, Check, LogOut, ExternalLink, AlertCircle } from 'lucide-react';

function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const { address, chainId, isConnected, isConnecting, walletName, error, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="relative" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={connect}
          disabled={isConnecting}
          className="glow-button btn"
          style={{
            height: '38px',
            padding: '0 14px',
            fontSize: '11px',
            borderRadius: '10px',
            gap: '8px',
          }}
        >
          <Wallet size={14} />
          <span>{isConnecting ? 'VERBINDE…' : 'WALLET VERBINDEN'}</span>
        </button>

        {error && (
          <div 
            className="animate-fade-in"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              zIndex: 150,
              width: '260px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 22, 37, 0.98)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn"
        style={{
          height: '38px',
          padding: '0 12px',
          backgroundColor: 'rgba(125, 211, 192, 0.1)',
          border: '1px solid rgba(125, 211, 192, 0.35)',
          color: '#fff',
          borderRadius: '10px',
          gap: '8px',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        }}
      >
        <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
          <span 
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'var(--teal)',
              opacity: 0.7,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }} 
          />
          <span 
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--teal)',
            }} 
          />
        </span>
        <span style={{ fontWeight: 700 }}>{truncateAddress(address)}</span>
        <ChevronDown 
          size={14} 
          style={{ 
            opacity: 0.6, 
            transform: open ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease' 
          }} 
        />
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            zIndex: 150,
            width: '280px',
            backgroundColor: 'rgba(15, 22, 37, 0.98)',
            border: '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              {walletName || 'Web3 Wallet'}
            </span>
            <span className="badge badge-blue" style={{ fontSize: '9px', padding: '2px 6px' }}>
              Chain {chainId ?? '—'}
            </span>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              VERBUNDENE L1 ADRESSE
            </span>
            <p 
              style={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '11px', 
                color: '#fff', 
                wordBreak: 'break-all', 
                marginTop: '4px',
                padding: '8px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {address}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              onClick={copy}
              className="btn btn-outline"
              style={{ flex: 1, height: '32px', fontSize: '10px', padding: '0 8px' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'KOPIERT' : 'KOPIEREN'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="btn"
              style={{ 
                flex: 1, 
                height: '32px', 
                fontSize: '10px', 
                padding: '0 8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444' 
              }}
            >
              <LogOut size={12} />
              <span>TRENNEN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
