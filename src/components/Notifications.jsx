import React, { useState, useEffect } from 'react';
import { BrainCircuit, Trophy, ShieldAlert, Sparkles, CheckCheck } from 'lucide-react';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient';
import './Notifications.css';

const Notifications = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch and generate notifications
  useEffect(() => {
    const generateInsights = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        let dynamicNotis = [];
        let idCounter = 1;

        // Insight 1: Acknowledge their latest log
        if (data && data.length > 0) {
          const latest = data[0];
          if (latest.intensity > 70) {
            dynamicNotis.push({ id: idCounter++, type: 'ai', icon: BrainCircuit, color: 'rose', title: 'High Stress Detected', desc: `Your last entry indicated elevated stress (${latest.intensity}%). Remember to take a 5-minute break today.`, time: 'Recently', unread: true });
          } else if (latest.mood === 'thriving' || latest.mood === 'good') {
            dynamicNotis.push({ id: idCounter++, type: 'ai', icon: BrainCircuit, color: 'teal', title: 'Positive Pattern', desc: 'You logged a positive mood recently. Our AI notes that taking time to log good days reinforces positive baselines.', time: 'Recently', unread: true });
          }
        }

        // Insight 2: Activity Milestone
        if (data && data.length >= 3) {
          dynamicNotis.push({ id: idCounter++, type: 'achievement', icon: Trophy, color: 'amber', title: 'Consistency is Key!', desc: `You have logged ${data.length} entries. Keep up the momentum to build a highly accurate emotional baseline.`, time: 'System Update', unread: true });
        }

        // Standard System Notifications
        dynamicNotis.push({ id: idCounter++, type: 'system', icon: Sparkles, color: 'purple', title: 'Welcome to MindPath Analytics', desc: 'Your personalized AI analysis dashboard is now active and learning from your inputs.', time: 'System', unread: false });
        dynamicNotis.push({ id: idCounter++, type: 'security', icon: ShieldAlert, color: 'amber', title: 'Secure Session Started', desc: `New secure login detected for ${user?.displayName || 'User'}.`, time: 'System', unread: false });

        setNotifications(dynamicNotis);
      } catch (err) {
        console.error("Error generating notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [user]);

  // NEW: Broadcast the unread count globally whenever notifications change
  useEffect(() => {
    // Only run this if we have loaded the notifications
    if (!loading) {
      const unreadCount = notifications.filter(n => n.unread).length;
      
      // Save it to localStorage so it persists across page reloads
      localStorage.setItem('mindpath_unread_notifications', unreadCount.toString());
      
      // Fire the event to instantly update the red badge in the sidebar
      window.dispatchEvent(new CustomEvent('notification_update', { 
        detail: { count: unreadCount } 
      }));
    }
  }, [notifications, loading]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // NEW: Allow clicking a single notification to mark it as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const filteredNotis = filter === 'unread' ? notifications.filter(n => n.unread) : notifications;

  if (loading) return <div className="p-10 text-muted">Loading your inbox...</div>;

  return (
    <div className="fade-in pb-10">
      <div className="notifications-header">
        <h1 className="dash-title">Inbox</h1>
        <p className="text-muted">Dynamic AI insights based on your recent journal activity.</p>
      </div>

      <div className="notifications-controls">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Activity</button>
        <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread</button>
        <button className="mark-read-btn flex items-center gap-2" onClick={markAllRead}>
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotis.length === 0 ? (
          <p className="text-muted mt-4">You're all caught up!</p>
        ) : (
          filteredNotis.map((noti) => {
            const Icon = noti.icon;
            return (
              <TiltCard 
                key={noti.id} 
                className={`notification-card ${noti.unread ? 'unread' : ''}`}
                // Trigger markAsRead when clicking the card!
                onClick={() => noti.unread && markAsRead(noti.id)}
                style={{ cursor: noti.unread ? 'pointer' : 'default' }}
              >
                {noti.unread && <div className="unread-dot"></div>}
                <div className={`noti-icon ${noti.color}-bg`}><Icon size={24} className={`text-${noti.color}`} /></div>
                <div className="noti-content">
                  <h4>{noti.title}</h4>
                  <p>{noti.desc}</p>
                  <span className="noti-time">{noti.time}</span>
                </div>
              </TiltCard>
            )
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;