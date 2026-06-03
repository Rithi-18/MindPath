import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AuthScreen.css';

const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ identifier: '', password: '', displayName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOG IN FLOW ---
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.identifier,
          password: formData.password,
        });

        if (authError) throw authError;
        
        // Setup user session (Removed the hardcoded 9 streak!)
        setUser({ 
          id: data.user.id, 
          displayName: data.user.user_metadata?.display_name || data.user.email.split('@')[0], 
          streak: 0 
        });
        navigate('/app/dashboard');

      } else {
        // --- SIGN UP FLOW ---
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.identifier,
          password: formData.password,
          options: {
            data: {
              display_name: formData.displayName,
            }
          }
        });

        if (authError) throw authError;

        // Setup user session automatically after signup
        setUser({ 
          id: data.user.id, 
          displayName: formData.displayName || data.user.email.split('@')[0], 
          streak: 0 
        });
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in auth-container">
      <div className="card auth-card">
        <div className="auth-logo-wrapper">
          <Brain size={40} />
        </div>
        <h2 className="auth-title">MindPath</h2>
        <p className="text-center text-muted text-sm auth-subtitle">
          {isLogin ? 'Welcome back. Please log in to continue.' : 'Create an account to start your journey.'}
        </p>

        <button 
          className="w-full btn-ghost google-btn" 
          type="button" 
          onClick={handleGoogleLogin}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
          Continue with Google
        </button>

        <div className="divider-wrapper">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Display Name (e.g. Prem)" 
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              required={!isLogin}
            />
          )}
          <input 
            type="email" 
            placeholder="Email address" 
            value={formData.identifier}
            onChange={(e) => setFormData({...formData, identifier: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password (min 6 characters)" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center text-sm auth-footer-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="text-purple font-bold auth-toggle" onClick={() => { setIsLogin(!isLogin); setError(null); }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;