import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Settings, FileText, Menu, X, HelpCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/settings', label: 'Einstellungen', icon: Settings },
    { path: '/logs', label: 'Logs', icon: FileText },
    { path: '/help', label: 'Hilfe', icon: HelpCircle },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          padding: '0.5rem',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: isMobile ? 'block' : 'none'
        }}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        style={{
          width: '250px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-glass)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          transform: (!isMobile || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🐬 Delfin Bot
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Automatisierter Trading
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-glass)' : 'transparent',
                border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-glass)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Version 1.0.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: isMobile ? 0 : '250px', 
        padding: isMobile ? '1rem' : '2rem',
        paddingTop: isMobile ? '4rem' : '2rem'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
