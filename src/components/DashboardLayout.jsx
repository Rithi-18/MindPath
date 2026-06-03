import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Smile, BrainCircuit, BookOpen, BarChart2, Bell, Settings as SettingsIcon, LogOut, Moon, Sun } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './DashboardLayout.css';

const DashboardLayout = ({ user, setUser, theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(
    parseInt(localStorage.getItem('mindpath_unread_notifications') || '2')
  );

  useEffect(() => {
    const handleNotificationUpdate = (e) => {
      setUnreadCount(e.detail.count);
    };

    window.addEventListener('notification_update', handleNotificationUpdate);
    return () => window.removeEventListener('notification_update', handleNotificationUpdate);
  }, []);

  // THE FIX: Securely destroy the Supabase session in the browser memory
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };
  
  const shortName = user?.displayName || 'Prem Kumar K';
  const initials = shortName.substring(0, 2).toUpperCase();

  const navItems = [
    { id: 'dashboard', path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'mood', path: '/app/mood', icon: Smile, label: 'Mood Check-in' },
    { id: 'analysis', path: '/app/analysis', icon: BrainCircuit, label: 'AI Analysis' },
    { id: 'journal', path: '/app/journal', icon: BookOpen, label: 'Journal' },
    { id: 'reports', path: '/app/reports', icon: BarChart2, label: 'Reports' }
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Brain size={20} color="white" /></div>
          <span>MindPath</span>
        </div>

        <div className="user-profile">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <h4 className="user-name-truncate">{shortName}</h4>
            <p>Journaling active</p>
          </div>
        </div>

        <p className="nav-label">NAVIGATION</p>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`} 
              onClick={() => navigate(item.path)}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="bottom-nav">
          <button 
            className="nav-btn theme-toggle-btn" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} 
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          
          <button 
            className={`nav-btn ${location.pathname === '/app/notifications' ? 'active' : ''}`}
            onClick={() => navigate('/app/notifications')}
          >
            <Bell size={18} /> Notifications
            {unreadCount > 0 && (
              <span className="badge-notification">{unreadCount}</span>
            )}
          </button>
          
          <button 
            className={`nav-btn ${location.pathname === '/app/settings' ? 'active' : ''}`}
            onClick={() => navigate('/app/settings')}
          >
            <SettingsIcon size={18} /> Settings
          </button>
          
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;