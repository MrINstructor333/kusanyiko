﻿import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Background Elements */}
      <div className="landing-bg-element landing-bg-element-1"></div>
      <div className="landing-bg-element landing-bg-element-2"></div>
      <div className="landing-bg-element landing-bg-element-3"></div>

      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div className="landing-logo-text">
              <h1>Kusanyiko</h1>
              <p>Efatha Church Annual Gathering</p>
            </div>
          </div>
          <nav className="landing-nav">
            <Link to="/login" className="nav-btn nav-btn-ghost">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="hero-title">
            Join the Annual{' '}
            <span className="hero-title-gradient">
              Kusanyiko
            </span>{' '}
            Gathering
          </h1>
          <p className="hero-description">
            Experience spiritual renewal and transformation at Efatha Church's Annual Gathering. 
            Join believers from across regions for worship, teaching, and ministry at Precious Centre, Kibaha.
          </p>

          {/* Gathering Info Cards */}
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <div className="stat-number">5 Days</div>
              <div className="stat-label">Annual Event</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="stat-number">Kibaha</div>
              <div className="stat-label">Precious Centre</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="stat-number">All</div>
              <div className="stat-label">Believers Welcome</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-hero" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        <div className="landing-hero-content">
          <div className="hero-stats" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', gap: '32px' }}>
            <div className="stat-card" style={{ textAlign: 'left', padding: '24px' }}>
              <h3 style={{ color: '#10b981', fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
                What to Expect
              </h3>
              <p style={{ color: '#d1d5db', lineHeight: '1.6', margin: '0' }}>
                Multiple days of worship, prayer, teaching and ministry sessions. 
                Experience spiritual renewal, healing, and prophetic ministry under 
                the leadership of Apostle and Prophet Josephat Elias Mwingira.
              </p>
            </div>
            <div className="stat-card" style={{ textAlign: 'left', padding: '24px' }}>
              <h3 style={{ color: '#06b6d4', fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
                Registration Info
              </h3>
              <p style={{ color: '#d1d5db', lineHeight: '1.6', margin: '0' }}>
                Join believers from different regions and branches. Registration is required 
                for the full gathering experience. Come expectant for God's transformative word 
                and fresh vision for your spiritual journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
