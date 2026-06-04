import React from 'react';
import './Footer.css';

const Footer = ({ lastUpdated, status }) => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-logo">
        <span className="logo-text">PIT<span className="logo-accent">WALL</span></span>
        <span className="footer-tagline">Personal Edition · 2026 Season</span>
      </div>
      <div className="footer-links">
        <span onClick={() => document.getElementById('home')?.scrollIntoView({behavior:'smooth'})}>Home</span>
        <span onClick={() => document.getElementById('schedule')?.scrollIntoView({behavior:'smooth'})}>Schedule</span>
        <span onClick={() => document.getElementById('standings')?.scrollIntoView({behavior:'smooth'})}>Standings</span>
        <span onClick={() => document.getElementById('paddock')?.scrollIntoView({behavior:'smooth'})}>Paddock</span>
        <span onClick={() => document.getElementById('teams')?.scrollIntoView({behavior:'smooth'})}>Teams</span>
      </div>
      <div className="footer-data-info">
        <span className={`footer-status-dot ${status === 'live' ? 'green' : 'grey'}`} />
        <span className="footer-data-text">
          {status === 'live'
            ? `Data live · Last updated ${lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}`
            : 'Server offline — showing cached data · Run f1-pitwall-server for live updates'
          }
        </span>
      </div>
      <p className="footer-disclaimer">
        Fan-made project. Data auto-updated via AI web search after each race.
        Not affiliated with Formula 1, FIA, or any team.
        F1, FORMULA ONE and related marks are trademarks of Formula One Licensing BV.
      </p>
    </div>
    <div className="footer-bar" />
  </footer>
);

export default Footer;
