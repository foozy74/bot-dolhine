import React from 'react';

const colors = {
  live: 'var(--teal)',
  loading: 'var(--blue)',
  stale: 'var(--warning)',
  error: 'var(--danger)',
};

export default function StatusDot({
  status = 'live',
  label,
  source,
  updatedAt,
}) {
  const dotColor = colors[status] || colors.live;

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontFamily: 'JetBrains Mono', 
        fontSize: '10px', 
        letterSpacing: '0.1em', 
        textTransform: 'uppercase', 
        color: 'var(--text-faint)' 
      }}
    >
      <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
        {status === 'live' && (
          <span 
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: dotColor,
              opacity: 0.6,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
        <span 
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
          }}
        />
      </span>

      {label && <span style={{ color: status === 'live' ? 'var(--teal)' : 'var(--text-dim)', fontWeight: 600 }}>{label}</span>}
      {source && <span style={{ opacity: 0.7 }}>• {source}</span>}
      {updatedAt && <span style={{ opacity: 0.6 }}>• {updatedAt}</span>}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
