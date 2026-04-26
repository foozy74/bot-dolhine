import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Settings, FileText, Menu, X, HelpCircle, BarChart3, ChevronRight } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setIsSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/', label: 'DASHBOARD', icon: Activity },
    { path: '/backtest', label: 'BACKTESTING', icon: BarChart3 },
    { path: '/settings', label: 'SETTINGS', icon: Settings },
    { path: '/logs', label: 'SYSTEM_LOGS', icon: FileText },
    { path: '/help', label: 'DOCUMENTATION', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-dark flex flex-col" style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', position: 'relative', overflowX: 'hidden' }}>
      <div className="grid-bg" />

      {/* Corporate Header */}
      <header className="app-header">
        <div className="logo" style={{ gap: '24px' }}>
          <div className="relative group">
            <div className="absolute -inset-2 bg-teal/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src="/logo_product.svg" alt="Delfin Bot" className="logo-image" style={{ width: '56px', height: '56px', position: 'relative' }} />
          </div>
          <div className="logo-text" style={{ gap: '4px' }}>
            <span className="logo-main font-display uppercase" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.04em' }}>
              THESOLUTION<span className="text-teal">.AT</span> // DELFIN_BOT
            </span>
            <span className="logo-sub font-mono uppercase" style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.3em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.2 }}>—</span> DER SMARTE WEG ZU DEINEN TRADES
            </span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isMobile && (
            <button 
              className="btn btn-outline" 
              style={{ width: '48px', padding: 0, minWidth: '48px' }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="badge badge-teal">SYSTEM_ONLINE</div>
            <div className="badge badge-blue">V1.2.4-PRO</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar Navigation */}
        <aside
          className="glass"
          style={{ 
            height: isMobile ? 'calc(100vh - 105px)' : 'calc(100vh - 105px)',
            position: isMobile ? 'fixed' : 'sticky',
            top: '105px',
            left: isMobile ? (isSidebarOpen ? '0' : '-300px') : '0',
            width: '280px',
            zIndex: 100,
            borderRight: '1px solid var(--glass-border)',
            background: 'rgba(3, 7, 18, 0.95)',
            backdropFilter: 'blur(32px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '24px'
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
            <div style={{ color: 'var(--text-faint)', fontFamily: 'JetBrains Mono', fontSize: '10px', marginBottom: '16px', padding: '0 12px', letterSpacing: '0.1em' }}>NAVIGATION_CORE</div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(125, 211, 192, 0.08)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(125, 211, 192, 0.2)' : 'transparent',
                  color: isActive ? 'var(--teal)' : 'var(--text-dim)'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <item.icon size={18} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em' }}>{item.label}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </NavLink>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="terminal-box" data-title="STATUS" style={{ padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--teal)' }}>LATENCY: 14ms</span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-faint)' }}>NODE_FRANKFURT_01</div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              backgroundColor: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 90 
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Interface Content */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '24px' : '40px', 
          maxWidth: '1600px', 
          margin: '0 auto', 
          width: '100%',
          minHeight: 'calc(100vh - 105px)'
        }}>
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main { animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media (max-width: 1024px) {
          .app-header { padding: 20px 24px !important; }
          .logo-main { font-size: 16px !important; }
        }
      `}} />
    </div>
  );
};

export default Layout;
