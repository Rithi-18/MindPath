import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, ArrowRight, Zap, Target, RefreshCw } from 'lucide-react';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient'; // IMPORTED SUPABASE FOR THE DATA CHECK
import './AIAnalysis.css';

const AIAnalysis = ({ user }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysis = async (forceRefresh = false) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    // 1. UNIQUE CACHE KEY: Prevents users from seeing each other's data!
    const cacheKey = `mindmap_insights_${user.id}`;

    try {
      // 2. BULLETPROOF CHECK: Does this specific user have any entries?
      const { count, error: dbError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // If they have no entries, stop here and show the empty state
      if (count === 0) {
        setAnalysis({
          insufficient_data: true,
          recommendation: "You haven't logged any journal entries yet. Complete a few Mood Check-ins so the AI can start analyzing your emotional patterns!"
        });
        setLoading(false);
        return;
      }

      // 3. Check the user-specific cache
      if (!forceRefresh) {
        const cachedInsights = sessionStorage.getItem(cacheKey);
        if (cachedInsights) {
          setAnalysis(JSON.parse(cachedInsights));
          setLoading(false);
          return;
        }
      }

      // 4. Fetch fresh data from the Python AI Engine
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) throw new Error('Failed to connect to the AI Engine.');

      const data = await response.json();
      setAnalysis(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [user]);

  if (loading) {
    return (
      <div className="fade-in pb-10 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <div className="pulse-ring"></div>
          <BrainCircuit size={48} className="text-purple" style={{ position: 'relative', zIndex: 2 }} />
        </div>
        <h2 className="dash-title text-center">AI is analyzing your timeline...</h2>
        <p className="text-muted text-center mt-2 max-w-md">Gemini is reading your recent journal entries, connecting emotional dots, and generating personalized clinical insights.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in pb-10">
        <h1 className="dash-title mb-20">AI Analysis</h1>
        <div className="alert-box rose-alert">
          <AlertCircle size={24} className="text-rose mb-2" />
          <b className="text-rose">Connection Failed</b><br />
          <span className="text-sm" style={{ color: 'var(--text-main)' }}>{error} Make sure your Python Flask backend is currently running on port 5000.</span>
          <button className="btn-primary mt-4 flex items-center gap-2" onClick={() => fetchAnalysis(true)}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Properly handles the "No Data" state we created above
  if (analysis && analysis.insufficient_data) {
    return (
      <div className="fade-in pb-10">
        <h1 className="dash-title mb-20">AI Analysis</h1>
        <TiltCard className="text-center p-10">
          <Sparkles size={32} className="text-amber mb-4 mx-auto" />
          <h3 className="card-title">More Data Needed</h3>
          <p className="text-muted">{analysis.recommendation}</p>
        </TiltCard>
      </div>
    );
  }

  return (
    <div className="fade-in pb-10">
      <div className="flex-between analysis-header">
        <div>
          <h1 className="dash-title flex items-center gap-2">
            <BrainCircuit color="var(--purple)" /> Clinical Insights
          </h1>
          <p className="text-muted">Generated exclusively from your recent journal entries</p>
        </div>
        <button className="btn-ghost flex items-center gap-2" onClick={() => fetchAnalysis(true)}>
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>

      <div className="analysis-grid">
        <div className="analysis-col-left">
          <TiltCard className="mb-20" style={{ borderTop: '4px solid var(--purple)' }}>
            <h3 className="card-title flex items-center gap-2">
              <Sparkles className="text-purple" size={20} /> Primary Observation
            </h3>
            <p className="insight-text" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '15px' }}>
              {analysis.primary_insight}
            </p>
          </TiltCard>

          <TiltCard>
            <h3 className="card-title flex items-center gap-2">
              <Target className="text-amber" size={20} /> Actionable Advice
            </h3>
            <div className="advice-box mt-15">
              <p>{analysis.actionable_advice}</p>
            </div>
          </TiltCard>
        </div>

        <div className="analysis-col-right">
          <TiltCard className="mb-20 text-center">
            <h3 className="card-title mb-4">Wellness Baseline</h3>
            <div className="wellness-score-circle mx-auto">
              {analysis.overall_wellness_score}
            </div>
            <p className="text-sm text-muted mt-4">AI calculated score based on emotional intensity and mood trajectory</p>
          </TiltCard>

          <TiltCard>
            <h3 className="card-title flex items-center gap-2">
              <Zap className="text-teal" size={20} /> Identified Triggers
            </h3>
            <p className="text-sm text-muted mb-15">Patterns noticed in your notes</p>
            <div className="trigger-list">
              {analysis.identified_triggers && analysis.identified_triggers.length > 0 ? (
                analysis.identified_triggers.map((trigger, i) => (
                  <div key={i} className="trigger-item">
                    <span className="trigger-dot"></span>
                    {trigger}
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No distinct triggers identified yet.</p>
              )}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;

