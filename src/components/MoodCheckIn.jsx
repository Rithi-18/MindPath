import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, Meh, Frown, Sparkles, CloudRain } from 'lucide-react';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient';
import './MoodCheckIn.css';

const MoodCheckIn = ({ user }) => { 
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US', dateOptions);

  const moods = [
    { id: 'thriving', label: 'Thriving', icon: Sparkles, color: 'var(--green)' },
    { id: 'good', label: 'Good', icon: Smile, color: 'var(--teal)' },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'var(--amber)' },
    { id: 'low', label: 'Low', icon: Frown, color: 'var(--rose)' },
    { id: 'struggling', label: 'Struggling', icon: CloudRain, color: '#9f1239' }
  ];

  const influenceOptions = [
    "Work stress", "Poor sleep", "Exercise", "Social time", 
    "Good nutrition", "Outdoors", "Creative work", "Meditation", 
    "Family", "Health concern", "Financial stress", "Achievement"
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (!selectedMood || !user) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([
          { 
            user_id: user.id,
            mood: selectedMood, 
            intensity: parseInt(intensity, 10),
            influences: selectedTags, 
            notes: notes.trim() ? notes.trim() : null
          }
        ]);

      if (error) throw error;
      
      sessionStorage.removeItem("mindmap_insights");
      
      navigate('/app/journal');
    } catch (error) {
      console.error(error);
      alert(`Database Error: ${error.message}`); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in mood-page">
      <div className="mood-header">
        <h1 className="mood-title">Mood check-in</h1>
        <p className="text-muted">{dateString} · How are you feeling right now?</p>
      </div>

      <h3 className="section-label">Select Your Mood</h3>
      <div className="mood-grid">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const Icon = mood.icon;
          return (
            <TiltCard 
              key={mood.id} 
              className={`mood-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <div className="mood-icon" style={{ backgroundColor: isSelected ? mood.color + '20' : 'transparent', color: isSelected ? mood.color : 'inherit' }}>
                <Icon size={32} strokeWidth={isSelected ? 2.5 : 1.5} />
              </div>
              <span className="mood-label">{mood.label}</span>
            </TiltCard>
          )
        })}
      </div>

      <TiltCard className="intensity-container">
        <h3 className="section-label">Intensity</h3>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={intensity} 
          onChange={(e) => setIntensity(e.target.value)}
          style={{ background: `linear-gradient(to right, var(--primary) ${intensity}%, var(--border) ${intensity}%)` }}
        />
        <div className="slider-labels">
          <span>Very mild</span>
          <span>Moderate</span>
          <span>Very strong</span>
        </div>
      </TiltCard>

      <TiltCard className="tags-card">
        <h3 className="section-label">What's Influencing This?</h3>
        <div className="tags-wrapper">
          {influenceOptions.map((tag) => (
            <div 
              key={tag}
              className={`influence-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </TiltCard>

      <TiltCard className="journal-card">
        <h3 className="section-label">Describe Your Feelings</h3>
        <p className="text-sm text-muted">Optional — the more context you share, the better the AI can support you.</p>
        <textarea 
          className="journal-textarea"
          placeholder="I'm feeling this way because..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        ></textarea>
        <div className="char-count">{notes.length} characters</div>
      </TiltCard>

      <div className="action-footer">
        <button 
          className="btn-primary" 
          style={{ opacity: selectedMood && !isSubmitting ? 1 : 0.5, cursor: selectedMood && !isSubmitting ? 'pointer' : 'not-allowed' }}
          onClick={handleSave}
          disabled={!selectedMood || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Analyse emotion'}
        </button>
        <button className="btn-ghost" onClick={() => navigate('/app/dashboard')}>
          Skip for now
        </button>
        {!selectedMood && <span className="validation-text">Please select a mood to continue.</span>}
      </div>
    </div>
  );
};

export default MoodCheckIn;