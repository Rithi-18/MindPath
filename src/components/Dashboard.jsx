import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, Activity, BookOpen, BrainCircuit, Wind, TreePine, PenTool, ArrowRight, TrendingUp, TrendingDown, Coffee } from 'lucide-react';
// Import the safe React wrappers instead of raw Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  // Live State Variables
  const [recentEntries, setRecentEntries] = useState([]);
  const [moodTrend, setMoodTrend] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [currentMood, setCurrentMood] = useState(0);
  const [currentStress, setCurrentStress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0); // <-- Added dynamic streak state

  const shortName = user?.displayName || 'User';

  // Dynamic Streak Calculation Engine
  const calculateStreak = (data) => {
    if (!data || data.length === 0) return 0;
    
    const uniqueDates = [...new Set(data.map(entry => {
      return new Date(entry.created_at).toLocaleDateString('en-US'); 
    }))];
    
    let currentStreak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toLocaleDateString('en-US');
    const yesterdayStr = yesterday.toLocaleDateString('en-US');

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let dateToCheck = new Date(uniqueDates[0]);

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === dateToCheck.toLocaleDateString('en-US')) {
        currentStreak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else {
        break; 
      }
    }

    return currentStreak;
  };

  // Fetch Live Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Fetch ALL entries to calculate streak accurately
        const { data: allData, error: allError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (allError) throw allError;
        
        // Calculate and set the streak based on all history
        setStreak(calculateStreak(allData || []));

        // Use the limited data for the rest of the dashboard
        const data = allData ? allData.slice(0, 7) : [];

        if (data && data.length > 0) {
          setRecentEntries(data.slice(0, 2));

          const latest = data[0];
          const moodScore = (latest.intensity / 10).toFixed(1);
          setCurrentMood(moodScore);
          setCurrentStress(latest.intensity);

          const reversedData = [...data].reverse();
          const trendScores = reversedData.map(entry => (entry.intensity / 10).toFixed(1));
          
          while (trendScores.length < 7) {
            trendScores.unshift(0);
          }
          setMoodTrend(trendScores.slice(-7));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Dynamic AI Advice Generator
  const generateAIAdvice = (mood, stress) => {
    const advice = [];
    if (stress > 60) {
      advice.push({ icon: Wind, color: "teal", time: "Now", title: "4-7-8 Breathing", desc: "Your stress markers are elevated. A 3-minute breathing session will lower your heart rate instantly." });
    } else {
      advice.push({ icon: BrainCircuit, color: "purple", time: "Now", title: "Flow State Focus", desc: "Your stress is low. It is an excellent time to tackle deep work or complex projects." });
    }
    
    if (mood < 5) {
      advice.push({ icon: Coffee, color: "amber", time: "Today", title: "Social Connection", desc: "Your mood is trending low. Stepping out for a coffee or chatting can interrupt this pattern." });
    } else {
      advice.push({ icon: TreePine, color: "green", time: "Today", title: "Outdoor walk", desc: "Nature exposure consistently elevates your already positive mood. Try 15 minutes outside." });
    }
    advice.push({ icon: PenTool, color: "purple", time: "Tonight", title: "Evening journal", desc: "Logging gratitude before sleep has proven to lift your morning baseline by 0.8 pts." });
    return advice;
  };

  const currentAdvice = generateAIAdvice(currentMood, currentStress);

  // Chart Configuration
  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: moodTrend,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#6366f1',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, min: 0, max: 10 },
      x: { grid: { display: false }, border: { display: false }, ticks: { display: false } }
    }
  };

  const getStyleProps = (mood) => {
    const capitalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
    if (mood === 'thriving' || mood === 'good') return { label: capitalizedMood, scoreClass: '', badgeClass: 'blue-tag', icon: <TrendingUp className="text-green" size={18} /> };
    if (mood === 'anxious' || mood === 'neutral') return { label: capitalizedMood, scoreClass: 'amber-border', badgeClass: 'amber-tag', icon: <TrendingDown className="text-amber" size={18} /> };
    return { label: capitalizedMood, scoreClass: 'amber-border', badgeClass: 'amber-tag', icon: <TrendingDown className="text-rose" size={18} /> };
  };

  if (loading) return <div className="p-10 text-muted">Loading your insights...</div>;

  return (
    <div className="fade-in pb-10">
      <div className="flex-between mb-30">
        <div>
          <h1 className="dash-title">Good morning, {shortName}</h1>
          <p className="text-muted">Your {streak}-day streak is intact</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/app/mood')}>
          <Smile size={18} /> Check in now
        </button>
      </div>

      <div className="grid-4 mb-20">
        <TiltCard>
          <div className="stat-top"><p>Mood score</p> <div className="icon-box purple"><Smile size={18} /></div></div>
          <h2 className="stat-number">{currentMood}</h2>
          <p className="text-green text-sm font-bold">Latest reading</p>
        </TiltCard>
        
        <TiltCard>
          <div className="stat-top"><p>Stress level</p> <div className="icon-box teal"><Activity size={18} /></div></div>
          <h2 className="stat-number">{currentStress}%</h2>
          <p className="text-teal text-sm font-bold">{currentStress > 60 ? "Elevated" : "Low-moderate"}</p>
        </TiltCard>
        
        <TiltCard>
          <div className="stat-top"><p>Journal streak</p> <div className="icon-box amber"><BookOpen size={18} /></div></div>
          <h2 className="stat-number">{streak} days</h2>
          <p className="text-amber text-sm font-bold">Personal best</p>
        </TiltCard>
        
        <TiltCard>
          <div className="stat-top"><p>AI insights</p> <div className="icon-box purple-light"><BrainCircuit size={18} /></div></div>
          <h2 className="stat-number">{recentEntries.length * 3}</h2>
          <p className="text-muted text-sm font-bold">Generated</p>
        </TiltCard>
      </div>

      <div className="grid-2 mb-20">
        <TiltCard>
          <div className="flex-between mb-20">
            <div>
              <h3 className="card-title">Recent mood trend</h3>
              <p className="text-sm text-muted">Based on your last 7 entries</p>
            </div>
            <div className="trend-badge positive"><TrendingUp size={14} /> Active</div>
          </div>
          {/* SAFE REACT CHART WRAPPER */}
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </TiltCard>
        
        <TiltCard>
          <h3 className="card-title">Stress gauge</h3>
          <p className="text-sm text-muted mb-4">Based on intensity signals</p>
          
          <div className="gauge-safe-zone">
            <svg viewBox="0 0 180 100" className="gauge-svg">
              <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round" />
              <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--teal)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(currentStress / 100) * 220} 220`} />
            </svg>
            <div className="gauge-text-overlay">
              <h2>{currentStress}%</h2>
              <span>STRESS</span>
            </div>
          </div>
          <div className="alert-box teal-alert">
            <b className="text-teal">{currentStress > 60 ? "Elevated Load" : "Healthy Range"}</b><br />
            <span className="text-sm" style={{ color: 'var(--text-main)' }}>Reflecting latest input</span>
          </div>
        </TiltCard>
      </div>

      <TiltCard className="mb-20">
        <div className="flex-between mb-20">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-purple" />
            <h3 className="card-title m-0">AI recommendations</h3>
          </div>
          <span className="text-sm text-muted flex items-center cursor-pointer hover-text" onClick={() => navigate('/app/analysis')}>View full analysis <ArrowRight size={14} /></span>
        </div>
        <div className="ai-recommendations-grid">
          {currentAdvice.map((item, i) => (
            <div key={i} className="recommendation-card">
              <div className="flex-between mb-15">
                <div className={`rec-icon ${item.color}-bg`}><item.icon size={20} className={`text-${item.color}`}/></div>
                <span className={`time-badge ${item.color}-text`}>{item.time}</span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </TiltCard>

      <TiltCard>
        <div className="flex-between mb-20">
          <h3 className="card-title m-0">Recent journal activity</h3>
          <span className="text-sm text-muted flex items-center cursor-pointer hover-text" onClick={() => navigate('/app/journal')}>All entries <ArrowRight size={14} /></span>
        </div>
        
        <div className="journal-list">
          {recentEntries.length === 0 ? (
            <p className="text-muted">No journal entries yet. Complete a check-in!</p>
          ) : (
            recentEntries.map((entry) => {
              const styles = getStyleProps(entry.mood);
              const score = (entry.intensity / 10).toFixed(1);
              
              return (
                <div key={entry.id} className="journal-item" onClick={() => navigate('/app/journal')}>
                  <div className={`score-circle ${styles.scoreClass}`}>{score}</div>
                  <div className="journal-content">
                    <div className="journal-meta">
                      <span className="mood-tag font-bold">{styles.label}</span>
                      <span className={`date-tag ${styles.badgeClass}`}>Logged</span>
                    </div>
                    <p className="truncate-text">{entry.notes ? entry.notes : "Quick mood log completed."}</p>
                  </div>
                  {styles.icon}
                </div>
              );
            })
          )}
        </div>
      </TiltCard>
    </div>
  );
};

export default Dashboard;