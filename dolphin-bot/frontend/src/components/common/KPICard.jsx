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
      className="relative p-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        backdropFilter: 'var(--blur)',
      }}
    >
      {/* AutoFund Corporate Corner Tech Accents */}
      <span 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderLeft: '2px solid var(--teal)',
          borderTop: '2px solid var(--teal)',
          borderTopLeftRadius: '16px',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '8px',
          height: '8px',
          borderRight: '2px solid var(--teal)',
          borderTop: '2px solid var(--teal)',
          borderTopRightRadius: '16px',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderLeft: '2px solid var(--teal)',
          borderBottom: '2px solid var(--teal)',
          borderBottomLeftRadius: '16px',
        }} 
      />
      <span 
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '8px',
          height: '8px',
          borderRight: '2px solid var(--teal)',
          borderBottom: '2px solid var(--teal)',
          borderBottomRightRadius: '16px',
        }} 
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span 
          style={{ 
            fontFamily: 'JetBrains Mono', 
            fontSize: '10px', 
            letterSpacing: '0.15em', 
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

      <div 
        style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontSize: '24px', 
          fontWeight: 800, 
          letterSpacing: '-0.02em',
          color: tone === 'positive' ? 'var(--teal)' : tone === 'negative' ? '#ef4444' : '#fff',
          lineHeight: 1.2
        }}
      >
        {value}
      </div>

      {(delta || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
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
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-faint)', marginLeft: 'auto' }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
