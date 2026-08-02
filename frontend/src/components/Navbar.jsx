import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, Sparkles, Sun, Moon, BarChart2 } from 'lucide-react';

export default function Navbar({ user, setUser, theme, toggleTheme, dailyUploadsLeft }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>StudyMate <span style={{ color: 'var(--accent)' }}>AI</span></span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Apna material upload karo, StudyMate baaki karega</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleTheme}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)'
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              {user.subscription_tier === 'free' ? (
                <div className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={14} />
                  <span>{dailyUploadsLeft !== undefined ? `${dailyUploadsLeft}/3 uploads left` : 'Free Tier'}</span>
                </div>
              ) : (
                <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={14} />
                  <span>PRO Plan</span>
                </div>
              )}

              <Link to="/progress" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <BarChart2 size={16} />
                <span>Progress</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger)' }} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
