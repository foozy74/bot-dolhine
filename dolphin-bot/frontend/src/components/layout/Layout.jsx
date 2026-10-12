import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Globe, Settings, FileText, Menu, X, HelpCircle, BarChart3, ChevronRight } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import ConnectWalletButton from '../common/ConnectWalletButton';

const menuItems = [
  { path: '/', label: 'DASHBOARD', code: '01', icon: Activity },
  { path: '/hyperliquid', label: 'HYPERLIQUID L1', code: '02', icon: Globe },
  { path: '/backtest', label: 'BACKTESTING', code: '03', icon: BarChart3 },
  { path: '/settings', label: 'SETTINGS', code: '04', icon: Settings },
  { path: '/logs', label: 'SYSTEM_LOGS', code: '05', icon: FileText },
  { path: '/help', label: 'DOCUMENTATION', code: '06', icon: HelpCircle },
];

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

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: 'var(--bg-dark)', 
        color: 'var(--text-main)', 
        position: 'relative', 
        overflowX: 'hidden' 
      }}
    >
      <div className="grid-bg" />
      <div className="ambient-glow" />

      {/* Corporate Header */}
      <header className="app-header">
        <div className="logo" style={{ gap: '16px' }}>
          <div className="relative group" style={{ position: 'relative' }}>
            <div 
              style={{
                position: 'absolute',
                inset: '-4px',
                backgroundColor: 'rgba(125, 211, 192, 0.2)',
                borderRadius: '50%',
                filter: 'blur(12px)',
                opacity: 0.8,
              }} 
            />
            <img 
              src="/logo_product.svg" 
              alt="Delfin Bot" 
              className="logo-image" 
              style={{ width: '44px', height: '44px', position: 'relative' }} 
            />
          </div>
          <div className="logo-text" style={{ gap: '2px' }}>
            <span className="logo-main font-display uppercase" style={{ fontSize: '19px', fontWeight: '900', letterSpacing: '-0.03em' }}>
              THESOLUTION<span className="text-teal">.AT</span> <span style={{ opacity: 0.4 }}>//</span> DELFIN_BOT
            </span>
            <span className="logo-sub font-mono uppercase" style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.22em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="text-teal">ALGO ENGINE</span> <span style={{ opacity: 0.3 }}>•</span> BITUNIX & HYPERLIQUID L1
            </span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Web3 Wallet Connect Button */}
          <ConnectWalletButton />

          <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="badge badge-teal" style={{ padding: '5px 10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
              LIVE_SYSTEM
            </div>
            <div className="badge badge-blue" style={{ padding: '5px 10px' }}>V1.3.0-PRO</div>
          </div>

          {isMobile && (
            <button 
              className="btn btn-outline" 
              style={{ width: '38px', height: '38px', padding: 0, minWidth: '38px' }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar Navigation */}
        <aside
          className="glass"
          style={{ 
            height: isMobile ? 'calc(100vh - 95px)' : 'calc(100vh - 95px)',
            position: isMobile ? 'fixed' : 'sticky',
            top: '95px',
            left: isMobile ? (isSidebarOpen ? '0' : '-300px') : '0',
            width: '270px',
            zIndex: 100,
            borderRight: '1px solid var(--glass-border)',
            background: 'rgba(15, 22, 37, 0.95)',
            backdropFilter: 'blur(24px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div style={{ color: 'var(--text-faint)', fontFamily: 'JetBrains Mono', fontSize: '10px', marginBottom: '12px', padding: '0 12px', letterSpacing: '0.15em' }}>
              NAVIGATION_CORE
            </div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(125, 211, 192, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(125, 211, 192, 0.3)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-dim)',
                  boxShadow: isActive ? '0 0 16px rgba(125, 211, 192, 0.1)' : 'none',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span 
                        style={{ 
                          fontFamily: 'JetBrains Mono', 
                          fontSize: '9px', 
                          color: isActive ? 'var(--teal)' : 'var(--text-faint)',
                          fontWeight: 700,
                          letterSpacing: '0.1em'
                        }}
                      >
                        {item.code}
                      </span>
                      <item.icon size={16} className={isActive ? 'text-teal' : ''} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: isActive ? 'bold' : '500', letterSpacing: '0.04em' }}>
                        {item.label}
                      </span>
                    </div>
                    {isActive ? (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal)', boxShadow: '0 0 6px var(--teal)' }} />
                    ) : (
                      <ChevronRight size={14} style={{ opacity: 0.3 }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
              <div 
                className="terminal-box" 
                data-title="EXECUTION_GATEWAYS" 
                style={{ padding: '14px', borderRadius: '14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal)', boxShadow: '0 0 6px var(--teal)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--teal)', fontWeight: 700 }}>
                    HYPERLIQUID L1: ONLINE
                  </span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-faint)' }}>
                  BITUNIX CEX: CONNECTED
                </div>
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
              backgroundColor: 'rgba(0,0,0,0.7)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 90 
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Interface Content */}
        <main 
          style={{ 
            flex: 1, 
            padding: isMobile ? '20px 16px 80px 16px' : '32px 40px', 
            maxWidth: '1600px', 
            margin: '0 auto', 
            width: '100%',
            minHeight: 'calc(100vh - 95px)'
          }}
        >
          {children}
        </main>
      </div>

      {/* Thumb-friendly Mobile Bottom Navigation */}
      <MobileBottomNav />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main { animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media (max-width: 1024px) {
          .app-header { padding: 14px 16px !important; }
          .logo-main { font-size: 15px !important; }
        }
      `}} />
    </div>
  );
};

export default Layout;
