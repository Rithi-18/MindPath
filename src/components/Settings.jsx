import React, { useState } from 'react';
import { User, Bell, Shield, Download, Trash2, Smartphone } from 'lucide-react';
import TiltCard from './TiltCard';
import './Settings.css';

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const shortName = user?.displayName || 'Prem Kumar K';

  return (
    <div className="fade-in pb-10">
      <div className="settings-header">
        <h1 className="dash-title">Settings</h1>
        <p className="text-muted">Manage your account, preferences, and data privacy.</p>
      </div>

      <div className="settings-tabs">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={16} className="inline-icon" /> Profile
        </button>
        <button className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
          <Smartphone size={16} className="inline-icon" /> Preferences
        </button>
        <button className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
          <Shield size={16} className="inline-icon" /> AI & Privacy
        </button>
      </div>

      <div className="settings-section">
        {activeTab === 'profile' && (
          <TiltCard className="settings-group">
            <h3>Personal Information</h3>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Display Name</h4>
                <p>How you appear in the dashboard.</p>
              </div>
              <input type="text" className="settings-input" defaultValue={shortName} />
            </div>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Email Address</h4>
                <p>Used for login and critical alerts.</p>
              </div>
              <input type="email" className="settings-input" defaultValue="premkumark@example.com" disabled style={{opacity: 0.6}} />
            </div>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Password</h4>
                <p>Last changed 3 months ago.</p>
              </div>
              <button className="btn-ghost" style={{border: '1px solid var(--border)'}}>Update Password</button>
            </div>
          </TiltCard>
        )}

        {activeTab === 'preferences' && (
          <TiltCard className="settings-group">
            <h3>App Preferences</h3>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Timezone</h4>
                <p>Sets the boundary for your daily check-in streaks.</p>
              </div>
              {/* FIXED: Applied new .settings-select class */}
              <select className="settings-select" defaultValue="Asia/Kolkata (IST)">
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Push Notifications</h4>
                <p>Receive daily check-in reminders on your device.</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-row">
              <div className="settings-info">
                <h4>Gamification & Streaks</h4>
                <p>Display your current journal streak on the dashboard.</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </TiltCard>
        )}

        {activeTab === 'ai' && (
          <>
            <TiltCard className="settings-group">
              <h3>Data & AI Engine</h3>
              <div className="settings-row">
                <div className="settings-info">
                  <h4>Advanced Predictive Modeling</h4>
                  <p>Allow the AI to analyze historical data to predict stress spikes.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-row">
                <div className="settings-info">
                  <h4>Export Personal Data</h4>
                  <p>Download all your journal entries and analytics in JSON or CSV format.</p>
                </div>
                <button className="btn-ghost flex items-center gap-2" style={{border: '1px solid var(--border)'}}>
                  <Download size={16} /> Export Data
                </button>
              </div>
            </TiltCard>

            <TiltCard className="settings-group danger-zone">
              <h3 className="text-rose">Danger Zone</h3>
              <div className="settings-row">
                <div className="settings-info">
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account, journals, and all AI insights. This cannot be undone.</p>
                </div>
                <button className="btn-danger flex items-center gap-2">
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </TiltCard>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;