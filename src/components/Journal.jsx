import React, { useState, useEffect } from 'react';
import { PenTool, Calendar, ChevronDown, Tag } from 'lucide-react';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient';
import './Journal.css';

const Journal = ({ user }) => {
  const [journalText, setJournalText] = useState('');
  const [pastEntries, setPastEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // We extract this into its own function so we can call it after saving a new note!
  const fetchEntries = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastEntries(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run on initial load
  useEffect(() => {
    fetchEntries();
  }, [user]);

  // FIX: The missing Save Note function
  const handleSaveNote = async () => {
    if (!journalText.trim() || !user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: user.id,
          mood: 'neutral', // Defaulting to neutral for quick logs
          intensity: 50,
          notes: journalText.trim(),
          influences: []
        }]);

      if (error) throw error;
      
      setJournalText(''); // Clear the text box
      fetchEntries(); // Refresh the list instantly!
    } catch (err) {
      console.error("Error saving note:", err);
      alert(`Failed to save note: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getStyleProps = (mood, intensity) => {
    const score = (intensity / 10).toFixed(1);
    const capitalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
    
    if (mood === 'thriving' || mood === 'good') return { score, label: capitalizedMood, scoreClass: 'score-good', badgeClass: 'badge-green' };
    if (mood === 'anxious' || mood === 'neutral') return { score, label: capitalizedMood, scoreClass: 'score-anxious', badgeClass: 'badge-amber' };
    return { score, label: capitalizedMood, scoreClass: 'score-low', badgeClass: 'badge-rose' };
  };

  return (
    <div className="fade-in pb-10">
      <div className="analysis-header">
        <h1 className="dash-title">Journal</h1>
        <p className="text-muted">Your personal timeline</p>
      </div>

      <div className="journal-grid">
        {/* Left Sidebar - Sticky */}
        <div>
          <TiltCard className="journal-sidebar">
            <div className="entry-header">
              <PenTool size={20} color="var(--primary)" /> Quick Log
            </div>
            <div className="timestamp">
              <Calendar size={14} /> NEW ENTRY
            </div>
            
            <textarea 
              className="prompt-textarea"
              placeholder="How was your day?&#10;What's on your mind?&#10;There's no wrong answer here..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            ></textarea>
            
            <div className="flex-between">
              <span className="text-sm text-muted font-bold">{journalText.length} chars</span>
              
              {/* FIX: Attached the onClick handler and dynamic disabled state */}
              <button 
                className="btn-primary" 
                style={{ padding: '10px 20px', fontSize: '0.9rem', opacity: isSaving || !journalText.trim() ? 0.5 : 1 }}
                onClick={handleSaveNote}
                disabled={isSaving || !journalText.trim()}
              >
                <SparklesIcon /> {isSaving ? 'Saving...' : 'Save Note'}
              </button>

            </div>

            <div className="prompt-section">
              <h4>WRITING PROMPTS</h4>
              <p className="prompt-item" onClick={() => setJournalText('Today felt different from yesterday because ')}>+ What made today feel different from yesterday?</p>
              <p className="prompt-item" onClick={() => setJournalText('One thing that challenged me was ')}>+ Name one thing that challenged you and one that energised you.</p>
              <p className="prompt-item" onClick={() => setJournalText('Tomorrow would be an 8/10 if ')}>+ What would make tomorrow a 8 out of 10?</p>
            </div>
          </TiltCard>
        </div>

        {/* Right Content - Past Entries */}
        <div>
          <div className="nav-label" style={{ marginBottom: '20px' }}>PAST ENTRIES</div>
          <div className="past-entries-list">
            {loading ? (
              <p className="text-muted">Loading entries...</p>
            ) : pastEntries.length === 0 ? (
              <p className="text-muted">No journal entries yet. Complete a mood check-in to see it here!</p>
            ) : (
              pastEntries.map((entry) => {
                const styles = getStyleProps(entry.mood, entry.intensity);
                
                return (
                  <TiltCard key={entry.id} className="entry-card">
                    <div className="entry-card-header">
                      <div className={`entry-score ${styles.scoreClass}`}>{styles.score}</div>
                      <div className="entry-details">
                        <div className="entry-mood-title">
                          {styles.label} 
                          <span className={`entry-date-badge ${styles.badgeClass}`}>{formatDate(entry.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted font-bold">{formatTime(entry.created_at)}</p>
                      </div>
                      <ChevronDown size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                    </div>
                    {entry.notes && <p className="entry-text">{entry.notes}</p>}
                    <div className="entry-tags">
                      {entry.influences && entry.influences.map(tag => (
                        <span key={tag} className="entry-tag"><Tag size={12} /> {tag}</span>
                      ))}
                    </div>
                  </TiltCard>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini internal component for the button icon
const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
  </svg>
);

export default Journal;