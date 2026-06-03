import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Shield, TrendingUp, Activity, PenTool, Lock, CheckCircle, Database } from 'lucide-react';
import TiltCard from './TiltCard'; // <-- IMPORING THE 3D GLOW CARD
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fade-in">
      <nav className="landing-nav flex-between">
        <div className="nav-brand" onClick={() => scrollToSection('home')}>
          <Brain size={28} /> MindPath
        </div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('features')}>Features</span>
          <span className="nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</span>
          <span className="nav-link" onClick={() => scrollToSection('privacy')}>Privacy</span>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate('/auth')}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/auth')}>Get started</button>
        </div>
      </nav>

      <div id="home" className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">
            <Sparkles size={14} className="inline-icon" /> AI-POWERED EMOTIONAL WELLNESS
          </span>
          <h1 className="hero-title">
            Know your mind.<br />
            <span className="text-purple">Grow your wellbeing.</span>
          </h1>
          <p className="hero-subtitle">
            MindPath uses clinical-grade AI to track your emotional patterns, detect stress before it builds, and guide you toward genuine, lasting mental health.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/auth')}>Open the tracker &rarr;</button>
            <button className="btn-ghost border-btn" onClick={() => scrollToSection('how-it-works')}>How it works</button>
          </div>
          <div className="hero-stats">
            <div><h2>94.7%</h2><p className="text-sm text-muted">Report improved mood</p></div>
            <div><h2>2,381</h2><p className="text-sm text-muted">Active this week</p></div>
            <div><h2>18 days</h2><p className="text-sm text-muted">Avg journal streak</p></div>
          </div>
        </div>

        <div className="solar-system">
          <div className="center-brain"><Brain size={45} color="white" /></div>
          <div className="orbit orbit-1"><div className="planet planet-1"><div className="dot dot-teal"></div> Calm</div></div>
          <div className="orbit orbit-2">
            <div className="planet planet-2"><div className="dot dot-amber"></div> Focus</div>
            <div className="planet planet-3"><div className="dot dot-rose"></div> Stress</div>
          </div>
          <div className="orbit orbit-3">
            <div className="planet planet-4 planet-card">
              <p className="text-sm text-muted m-0">Mood today</p>
              <h3 className="text-purple font-bold mood-score">7.4 / 10</h3>
              <p className="text-green text-sm m-0">&uarr; 0.6 from yesterday</p>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="section-container">
        <h2 className="section-title">Designed for genuine <span className="text-purple">mental clarity</span></h2>
        <p className="text-muted section-subtitle">Every feature is grounded in evidence-based psychology and compassionate design.</p>
        
        <div className="features-grid">
          {/* WRAPPED ALL FEATURES IN TILTCARDS */}
          <TiltCard className="feature-card feature-main">
            <Brain size={40} className="mb-20" />
            <h3 className="feature-main-title">AI Sentiment Analysis</h3>
            <p className="feature-main-desc">Our advanced language model reads between the lines of your daily journal entries. It detects distinct emotional states and tracks subtle psychological shifts across weeks and months that you might not notice yourself.</p>
            <div className="tag-container">
              <span className="feature-tag">Anxiety detection</span>
              <span className="feature-tag">Joy scoring</span>
              <span className="feature-tag">Stress patterns</span>
              <span className="feature-tag">Trend analysis</span>
            </div>
          </TiltCard>
          <TiltCard className="feature-card">
            <Shield className="text-teal mb-15" size={32} />
            <h3 className="feature-title">Private by design</h3>
            <p className="text-muted feature-desc">Your emotional data is entirely yours. End-to-end encrypted and completely shielded. Your data never trains our models without explicit consent.</p>
          </TiltCard>
          <TiltCard className="feature-card">
            <TrendingUp className="text-amber mb-15" size={32} />
            <h3 className="feature-title">Progress over time</h3>
            <p className="text-muted feature-desc">Longitudinal trend analysis and beautiful data visualizations show exactly how your baseline emotional state evolves over time.</p>
          </TiltCard>
          <TiltCard className="feature-card">
            <Activity className="text-rose mb-15" size={32} />
            <h3 className="feature-title">Stress prediction</h3>
            <p className="text-muted feature-desc">Detects early, subtle stress signals and psychological fatigue before they compound, giving you crucial time to act and decompress.</p>
          </TiltCard>
          <TiltCard className="feature-card">
            <PenTool className="text-purple mb-15" size={32} />
            <h3 className="feature-title">Guided reflection</h3>
            <p className="text-muted feature-desc">Receive highly personalized, evidence-based wellness suggestions and prompts adapted exactly to your current emotional state.</p>
          </TiltCard>
        </div>
      </div>

      <div id="how-it-works" className="section-container">
        <div className="how-it-works-box">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Three steps to <br/>emotional clarity</h2>
            <p className="text-muted section-subtitle" style={{ marginBottom: 0 }}>MindPath is designed to slip seamlessly into your daily routine. It takes less than two minutes a day to start seeing results.</p>
          </div>

          {/* BULLETPROOF 3-COLUMN GRID */}
          <div className="how-it-works-grid">
            <TiltCard className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Check in daily</h3>
              <p className="text-muted feature-desc">Log into your dashboard, select your primary mood, and write a few unstructured sentences in your journal about what influenced your day. No formatting required.</p>
            </TiltCard>
            <TiltCard className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">AI analyzes patterns</h3>
              <p className="text-muted feature-desc">The moment you hit save, our sentiment engine goes to work. It identifies hidden emotion clusters, evaluates stress markers, and maps your behavioral correlations.</p>
            </TiltCard>
            <TiltCard className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Receive guidance</h3>
              <p className="text-muted feature-desc">Immediately receive personalized, clinical-grade suggestions—like a 4-7-8 breathing exercise when anxiety spikes, or sleep hygiene tips when fatigue sets in.</p>
            </TiltCard>
          </div>
        </div>
      </div>

      <div id="privacy" className="section-container privacy-grid">
        <div>
          <div className="icon-wrapper-large">
            <Shield size={40} className="text-teal" />
          </div>
          <h2 className="section-title" style={{ textAlign: 'left' }}>Your mind is your <br/>own business.</h2>
          <p className="text-muted privacy-desc">We believe mental health data is the most sensitive information on earth. That is why MindPath is built on a foundation of absolute, uncompromising privacy.</p>
          <p className="text-muted privacy-desc">Your journals are yours. Your AI insights are yours. We do not sell data to advertisers, and we do not use your personal struggles to train global AI models.</p>
        </div>
        <div className="privacy-cards">
          <TiltCard className="privacy-card">
            <Lock className="text-purple privacy-icon" size={24} />
            <div>
              <h4 className="privacy-card-title">End-to-End Encryption</h4>
              <p className="text-muted text-sm m-0" style={{ lineHeight: 1.6 }}>Your data is scrambled before it ever leaves your device. Only you hold the key to read your journal entries.</p>
            </div>
          </TiltCard>
          <TiltCard className="privacy-card">
            <Database className="text-amber privacy-icon" size={24} />
            <div>
              <h4 className="privacy-card-title">Zero-Knowledge Architecture</h4>
              <p className="text-muted text-sm m-0" style={{ lineHeight: 1.6 }}>Our database engineers and staff physically cannot read the contents of your mental health check-ins.</p>
            </div>
          </TiltCard>
          <TiltCard className="privacy-card">
            <CheckCircle className="text-green privacy-icon" size={24} />
            <div>
              <h4 className="privacy-card-title">Data Portability</h4>
              <p className="text-muted text-sm m-0" style={{ lineHeight: 1.6 }}>You have the absolute right to export all your data in a readable format, or completely delete your account forever with one click.</p>
            </div>
          </TiltCard>
        </div>
      </div>

      <div className="dark-section">
        <h2 className="footer-title">Your mind deserves the<br/>same care as your body</h2>
        <p className="footer-subtitle">Begin tracking your emotional patterns today. No subscription required to start.</p>
        <button className="btn-primary footer-btn" onClick={() => navigate('/auth')}>Open MindPath free &rarr;</button>
        <p className="text-muted" style={{ marginTop: '60px', fontSize: '0.9rem' }}>Not a medical device. For clinical support, please consult a licensed professional.</p>
      </div>
    </div>
  );
};

export default LandingPage;