import React from 'react';
import { Film, Ticket, ShieldCheck, User as UserIcon, LogOut, Sparkles, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenMyBookings, activeView, setActiveView, onSearchClick }) => {
  const { user, isAdmin, logout, openLogin } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 8, 11, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s ease',
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('client')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e50914 0%, #7f0007 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Film size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 30%, #ff4d58 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              CINEVERSE
            </div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              Cinema Reimagined
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
        }}>
          <button
            onClick={() => setActiveView('client')}
            style={{
              background: 'none',
              border: 'none',
              color: activeView === 'client' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeView === 'client' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              transition: 'all 0.2s',
              borderBottom: activeView === 'client' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            <Sparkles size={16} color={activeView === 'client' ? '#e50914' : 'currentColor'} />
            Movies
          </button>

          {/* Admin Tab Switch */}
          <button
            onClick={() => setActiveView('admin')}
            style={{
              background: activeView === 'admin' ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: activeView === 'admin' ? '1px solid rgba(229, 9, 20, 0.5)' : '1px solid var(--border-subtle)',
              color: activeView === 'admin' ? '#ff4d58' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={16} color={activeView === 'admin' ? '#ff4d58' : '#94a3b8'} />
            <span>Admin Portal</span>
            {isAdmin && <span className="badge badge-red" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>PRO</span>}
          </button>
        </nav>

        {/* User / Actions Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          {/* Quick Search */}
          <button
            onClick={onSearchClick}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <Search size={15} />
            <span style={{ display: 'none', md: 'inline' }}>Search movies...</span>
          </button>

          {/* My Tickets Button */}
          {user && (
            <button
              onClick={onOpenMyBookings}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                gap: '8px',
                fontSize: '0.85rem'
              }}
            >
              <Ticket size={16} color="#00f0ff" />
              <span>My Passes</span>
            </button>
          )}

          {/* Auth Status & Profile */}
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '6px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px 12px 4px 6px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ff4d58';
                  e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={openLogin}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '9px 20px',
              }}
            >
              <UserIcon size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
