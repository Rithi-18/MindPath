import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
// IMPORT SAFE REACT WRAPPERS (No more raw canvas elements!)
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import TiltCard from './TiltCard';
import { supabase } from '../supabaseClient';
import './Reports.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const Reports = ({ user }) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Live Stats State
  const [stats, setStats] = useState({
    avgMood: 0,
    avgStress: 0,
    wellnessScore: 0,
    emotionDist: { thriving: 0, good: 0, neutral: 0, low: 0, struggling: 0 }
  });
  const [trendData, setTrendData] = useState([]);
  const [trendLabels, setTrendLabels] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: true }); // Oldest to newest for the chart

        if (error) throw error;

        if (data && data.length > 0) {
          const totalIntensity = data.reduce((sum, entry) => sum + entry.intensity, 0);
          const avgStress = Math.round(totalIntensity / data.length);
          const avgMood = (avgStress / 10).toFixed(1);
          
          const wellness = Math.round(100 - avgStress + (data.length * 2)); 

          const dist = { thriving: 0, good: 0, neutral: 0, low: 0, struggling: 0 };
          data.forEach(entry => {
            if (dist[entry.mood] !== undefined) dist[entry.mood]++;
          });
          
          Object.keys(dist).forEach(key => {
            dist[key] = Math.round((dist[key] / data.length) * 100);
          });

          setStats({ avgMood, avgStress, wellnessScore: wellness > 100 ? 100 : wellness, emotionDist: dist });

          // Map for Chart 
          const chartScores = data.map(entry => (entry.intensity / 10).toFixed(1));
          const labels = data.map((_, i) => `Entry ${i+1}`);
          setTrendData(chartScores);
          setTrendLabels(labels);
        } else {
          // Reset if no data in timeframe
          setStats({ avgMood: 0, avgStress: 0, wellnessScore: 0, emotionDist: { thriving: 0, good: 0, neutral: 0, low: 0, struggling: 0 } });
          setTrendData([]);
          setTrendLabels([]);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user, timeframe]);

  // Chart Configuration mapped safely for React
  const chartDataConfig = {
    labels: trendLabels.length > 0 ? trendLabels : ['No Data'],
    datasets: [{
      data: trendData.length > 0 ? trendData : [0],
      borderColor: '#6366f1', 
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3, 
      tension: 0.4, 
      fill: true,
      pointBackgroundColor: '#ffffff', 
      pointBorderColor: '#6366f1', 
      pointBorderWidth: 2, 
      pointRadius: 4
    }]
  };

  const chartOptionsConfig = {
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: false } }, 
    scales: { 
      y: { display: false, min: 0, max: 10 }, 
      x: { grid: { display: false }, border: { display: false } } 
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Safe fallback values to prevent 0% calculation errors
  const safeThriving = stats.emotionDist.thriving || 0;
  const safeGood = stats.emotionDist.good || 0;
  const safeNeutral = stats.emotionDist.neutral || 0;
  const safeLow = stats.emotionDist.low || 0;
  const safeStruggling = stats.emotionDist.struggling || 0;
  const totalPct = safeThriving + safeGood + safeNeutral + safeLow + safeStruggling;
  
  // Dynamic CSS for the Donut Chart based on real percentages
  const donutGradient = totalPct === 0 
    ? `conic-gradient(var(--border) 0% 100%)` 
    : `conic-gradient(
      var(--primary) 0% ${safeThriving}%, 
      var(--teal) ${safeThriving}% ${safeThriving + safeGood}%, 
      var(--amber) ${safeThriving + safeGood}% ${safeThriving + safeGood + safeNeutral}%, 
      #a855f7 ${safeThriving + safeGood + safeNeutral}% ${safeThriving + safeGood + safeNeutral + safeLow}%,
      var(--rose) ${safeThriving + safeGood + safeNeutral + safeLow}% 100%
    )`;

  if (loading) return <div className="p-10 text-muted">Crunching your data...</div>;

  return (
    <div className="fade-in pb-10">
      <div className="flex-between reports-header">
        <div>
          <h1 className="dash-title">Reports & analytics</h1>
          <div className="reports-header-title"><Calendar size={14} /> Data through {todayDate}</div>
        </div>
        <div className="timeframe-toggle">
          <button className={`timeframe-btn ${timeframe === '7d' ? 'active' : ''}`} onClick={() => setTimeframe('7d')}>7d</button>
          <button className={`timeframe-btn ${timeframe === '30d' ? 'active' : ''}`} onClick={() => setTimeframe('30d')}>30d</button>
          <button className={`timeframe-btn ${timeframe === '90d' ? 'active' : ''}`} onClick={() => setTimeframe('90d')}>90d</button>
        </div>
      </div>

      <div className="reports-top-stats">
        <TiltCard><div className="report-stat-label">AVG MOOD</div><div className="report-stat-value text-purple">{stats.avgMood}<span style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>/10</span></div></TiltCard>
        <TiltCard><div className="report-stat-label">ENTRIES</div><div className="report-stat-change"><TrendingUp size={28} /> {trendData.length}</div></TiltCard>
        <TiltCard><div className="report-stat-label">AVG STRESS</div><div className="report-stat-value text-teal">{stats.avgStress}%</div></TiltCard>
        <TiltCard><div className="report-stat-label">WELLNESS SCORE</div><div className="report-stat-value text-green">{stats.wellnessScore}<span style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>/100</span></div></TiltCard>
      </div>

      <div className="reports-grid-2">
        <TiltCard>
          <h3 className="card-title">Mood trend</h3>
          <p className="text-sm text-muted mb-20">Score out of 10</p>
          <div className="chart-container">
            {/* SAFE REACT CHART WRAPPER */}
            <Line data={chartDataConfig} options={chartOptionsConfig} />
          </div>
        </TiltCard>

        <TiltCard>
          <h3 className="card-title">Emotion distribution</h3>
          <p className="text-sm text-muted">% of logged states ({timeframe})</p>
          <div className="flex items-center emotion-container" style={{ gap: '30px', marginTop: '20px' }}>
            <div className="donut-wrapper m-0">
              <div className="emotion-donut" style={{ background: donutGradient }}>
                <div className="donut-hole">
                  <span className="donut-percentage">{safeGood || safeNeutral || 0}%</span>
                  <span className="donut-label">Primary</span>
                </div>
              </div>
            </div>
            <div className="emotion-legend">
              <div className="legend-item"><div className="legend-color-label"><div className="legend-dot" style={{background: 'var(--primary)'}}></div> Thriving</div><div className="legend-value text-purple">{safeThriving}%</div></div>
              <div className="legend-item"><div className="legend-color-label"><div className="legend-dot" style={{background: 'var(--teal)'}}></div> Good</div><div className="legend-value text-teal">{safeGood}%</div></div>
              <div className="legend-item"><div className="legend-color-label"><div className="legend-dot" style={{background: 'var(--amber)'}}></div> Neutral</div><div className="legend-value text-amber">{safeNeutral}%</div></div>
              <div className="legend-item"><div className="legend-color-label"><div className="legend-dot" style={{background: '#a855f7'}}></div> Low</div><div className="legend-value" style={{color: '#a855f7'}}>{safeLow}%</div></div>
              <div className="legend-item"><div className="legend-color-label"><div className="legend-dot" style={{background: 'var(--rose)'}}></div> Struggling</div><div className="legend-value text-rose">{safeStruggling}%</div></div>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};

export default Reports;
