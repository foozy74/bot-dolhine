import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Globe, BarChart3, Settings, FileText, HelpCircle } from 'lucide-react';

const mobileNavItems = [
  { path: '/', label: 'Bot', icon: Activity },
  { path: '/hyperliquid', label: 'L1 DEX', icon: Globe },
  { path: '/backtest', label: 'Backtest', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/logs', label: 'Logs', icon: FileText },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: 'rgba(15, 22, 37, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--glass-border)',
        padding: '8px 8px 14px 8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: isActive ? 'var(--teal)' : 'var(--text-faint)',
            padding: '4px 6px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <div 
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--teal)',
                      boxShadow: '0 0 6px var(--teal)',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '9px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
