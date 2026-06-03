import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import MoodCheckIn from './components/MoodCheckIn';
import AIAnalysis from './components/AIAnalysis';
import Journal from './components/Journal';
import Reports from './components/Reports';
import Notifications from './components/Notifications';
import Settings from './components/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          displayName: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
          streak: 9
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          displayName: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
          streak: 9
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--primary)'}}>Loading MindPath...</div>;

  return (
    <Router>
      <div className="min-h-screen">
        <div className="global-cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={!user ? <AuthScreen setUser={setUser} /> : <Navigate to="/app/dashboard" />} />
          
          <Route path="/app" element={user ? <DashboardLayout user={user} setUser={setUser} theme={theme} setTheme={setTheme} /> : <Navigate to="/auth" />}>
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="mood" element={<MoodCheckIn user={user} />} />
            {/* Change this line inside the Routes block in App.jsx */}
            <Route path="analysis" element={<AIAnalysis user={user} />} />
            <Route path="journal" element={<Journal user={user} />} />
            <Route path="reports" element={<Reports user={user} />} />
            <Route path="notifications" element={<Notifications user={user} />} />
            <Route path="settings" element={<Settings user={user} />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;