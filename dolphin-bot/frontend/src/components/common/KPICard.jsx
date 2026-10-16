import React from 'react';

const toneClasses = {
  neutral: 'text-white',
  positive: 'text-teal',
  negative: 'text-red-400',
  warn: 'text-amber-400',
};

export default function KPICard({
  label,
  value,
  delta,
  tone = 'neutral',
  hint,
  icon: Icon,
  badge,
}) {
  return (
    <div 
      className="relative transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        backdropFilter: 'var(--blur)',
        padding: '20px 22px',
        minHeight: '124px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* AutoFund Corporate Corner Tech Accents - Aligned to border radius */}
      <span 
        style={{
          position: 'absolute',
          top: '-1px',
          left: '-1px',
          width: '12px',
          height: '12px',
          borderLeft: '2px solid rgba(125, 211, 192, 0.4)',
          borderTop: '2px solid rgba(125, 211, 192, 0.4)',
          borderTopLeftRadius: '16px',
          pointerEvents: 'none',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          top: '-1px',
          right: '-1px',
          width: '12px',
          height: '12px',
          borderRight: '2px solid rgba(125, 211, 192, 0.4)',
          borderTop: '2px solid rgba(125, 211, 192, 0.4)',
          borderTopRightRadius: '16px',
          pointerEvents: 'none',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          bottom: '-1px',
          left: '-1px',
          width: '12px',
          height: '12px',
          borderLeft: '2px solid rgba(125, 211, 192, 0.4)',
          borderBottom: '2px solid rgba(125, 211, 192, 0.4)',
          borderBottomLeftRadius: '16px',
          pointerEvents: 'none',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          bottom: '-1px',
          right: '-1px',
          width: '12px',
          height: '12px',
          borderRight: '2px solid rgba(125, 211, 192, 0.4)',
          borderBottom: '2px solid rgba(125, 211, 192, 0.4)',
          borderBottomRightRadius: '16px',
          pointerEvents: 'none',
        }} 
      />

      {/* Top Header: Label & Badges/Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span 
          style={{ 
            fontFamily: 'JetBrains Mono', 
            fontSize: '11px', 
            fontWeight: 700,
            letterSpacing: '0.14em', 
            textTransform: 'uppercase', 
            color: 'var(--text-faint)' 
          }}
        >
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {badge && <span className="badge badge-teal" style={{ fontSize: '9px', padding: '2px 8px' }}>{badge}</span>}
          {Icon && <Icon size={16} className={tone === 'positive' ? 'text-teal' : tone === 'negative' ? 'text-red-400' : 'text-blue'} />}
        </div>
      </div>

      {/* Main Metric Value */}
      <div 
        style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontSize: '26px', 
          fontWeight: 800, 
          letterSpacing: '-0.02em',
          color: tone === 'positive' ? 'var(--teal)' : tone === 'negative' ? '#ef4444' : '#f8fafc',
          lineHeight: 1.2,
          margin: '4px 0 8px 0',
        }}
      >
        {value}
      </div>

      {/* Bottom Subtext / Delta & Hint */}
      {(delta || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '2px' }}>
          {delta && (
            <span 
              style={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '11px', 
                fontWeight: 600,
                color: tone === 'positive' ? 'var(--teal)' : tone === 'negative' ? '#ef4444' : 'var(--text-dim)' 
              }}
            >
              {delta}
            </span>
          )}
          {hint && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-faint)', marginLeft: 'auto' }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
