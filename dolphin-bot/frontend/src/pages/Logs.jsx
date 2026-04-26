import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { FileText, AlertCircle, Info, CheckCircle, Filter, Terminal, Clock, Activity, Trash2 } from 'lucide-react';

const Logs = () => {
  const { logs, isConnected } = useWebSocket();
  const [filter, setFilter] = useState('all');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={14} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={14} className="text-orange-400" />;
      case 'success':
        return <CheckCircle size={14} className="text-teal" />;
      default:
        return <Info size={14} className="text-blue" />;
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      case 'success':
        return 'text-teal';
      default:
        return 'text-dim';
    }
  };

  return (
    <div className="flex flex-col gap-xl">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-xs uppercase">SYSTEM_RUNTIME_LOGS</h2>
          <div className="flex items-center gap-md font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal shadow-[0_0_8px_rgba(125,211,192,0.5)]' : 'bg-red-400'}`} />
              {isConnected ? 'WEBSOCKET_CONNECTED' : 'CONNECTION_LOST'}
            </span>
            <span>•</span>
            <span className="text-blue">BUFFER_SIZE: {logs.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Trash2 size={16} />
            CLEAR_BUFFER
          </button>
        </div>
      </section>

      {/* Filter and Status Controls */}
      <div className="terminal-box" data-title="LOG_STREAMS" style={{ padding: '12px' }}>
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            {['all', 'info', 'success', 'warning', 'error'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`
                  px-md py-xs rounded-lg font-mono text-[10px] font-bold uppercase transition-all
                  ${filter === level 
                    ? 'bg-blue/20 text-blue border border-blue/30' 
                    : 'text-faint hover:text-main hover:bg-white/5 border border-transparent'}
                `}
                style={{
                  background: filter === level ? 'rgba(91, 155, 213, 0.15)' : 'transparent',
                  borderColor: filter === level ? 'rgba(91, 155, 213, 0.3)' : 'transparent',
                  color: filter === level ? 'var(--blue)' : 'var(--text-faint)',
                  cursor: 'pointer'
                }}
              >
                {level === 'all' ? 'STREAM_ALL' : `LVL_${level.toUpperCase()}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-md px-md">
            <div className="flex items-center gap-xs text-faint font-mono text-[10px]">
              <Clock size={12} />
              SYNC_DELAY: 14MS
            </div>
            <div className="flex items-center gap-xs text-faint font-mono text-[10px]">
              <Activity size={12} />
              BPS: 124
            </div>
          </div>
        </div>
      </div>

      {/* Logs Console */}
      <div 
        className="terminal-box h-[650px] overflow-hidden flex flex-col" 
        data-title="VIRTUAL_TERMINAL_01"
      >
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-md font-mono text-xs custom-scrollbar"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          {filteredLogs.length > 0 ? (
            <div className="flex flex-col gap-xs">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-md group hover:bg-white/5 py-1 px-2 rounded-md transition-colors"
                >
                  <span className="text-faint shrink-0 tabular-nums select-none opacity-40 group-hover:opacity-100 transition-opacity">
                    [{new Date().toLocaleTimeString('de-DE', { hour12: false })}]
                  </span>
                  <div className="shrink-0 pt-1">
                    {getLogIcon(log.level)}
                  </div>
                  <span className={`flex-1 break-words leading-relaxed ${getLogColor(log.level)}`}>
                    <span className="font-bold opacity-70">[{log.level.toUpperCase()}]</span> {log.message}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30 select-none">
              <Terminal size={64} className="mb-md" />
              <p className="font-mono text-xs uppercase tracking-widest">AWAITING_SYSTEM_BROADCAST...</p>
              <p className="font-mono text-[10px] mt-xs uppercase">NO_ACTIVE_LOGS_IN_CURRENT_BUFFER</p>
            </div>
          )}
        </div>

        {/* Console Footer */}
        <div className="px-md py-xs border-t border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-md text-[9px] font-mono text-faint uppercase">
            <span>TTY: PTS/0</span>
            <span>ENCODING: UTF-8</span>
          </div>
          <div className="flex items-center gap-xs text-[9px] font-mono text-faint uppercase">
            <span>SCROLL_LOCK: OFF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
