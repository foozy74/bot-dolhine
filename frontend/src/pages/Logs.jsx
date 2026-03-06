import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { FileText, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react';

const Logs = () => {
  const { logs, isConnected } = useWebSocket();
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={16} style={{ color: 'var(--accent-danger)' }} />;
      case 'warning':
        return <AlertCircle size={16} style={{ color: 'var(--accent-warning)' }} />;
      case 'success':
        return <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} />;
      default:
        return <Info size={16} style={{ color: 'var(--accent-info)' }} />;
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'var(--accent-danger)';
      case 'warning':
        return 'var(--accent-warning)';
      case 'success':
        return 'var(--accent-success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📋 Logs</h1>
        <p className="text-secondary">System-Logs und Ereignisse</p>
      </div>

      {/* Filter */}
      <div className="glass-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'info', 'success', 'warning', 'error'].map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className="glass-button"
              style={{
                background: filter === level ? 'var(--bg-glass)' : 'transparent',
                borderColor: filter === level ? 'var(--border-glass)' : 'transparent',
                textTransform: 'capitalize',
              }}
            >
              {level === 'all' ? 'Alle' : level}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div 
            style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: isConnected ? 'var(--accent-success)' : 'var(--accent-danger)' 
            }} 
          />
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Logs List */}
      <div className="glass-card" style={{ maxHeight: '600px', overflow: 'auto' }}>
        {filteredLogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div style={{ marginTop: '0.125rem' }}>
                  {getLogIcon(log.level)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: getLogColor(log.level),
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}>
                    {log.message}
                  </p>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {new Date().toLocaleString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Keine Logs verfügbar</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Logs werden hier angezeigt, sobald der Bot läuft
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
