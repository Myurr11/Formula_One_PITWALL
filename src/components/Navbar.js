import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const isWeekend = location.pathname === '/weekend';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const homeLinks = [
    { label: 'HOME',      id: 'home' },
    { label: 'SCHEDULE',  id: 'schedule' },
    { label: 'STANDINGS', id: 'standings' },
    { label: 'PADDOCK',   id: 'paddock' },
    { label: 'TEAMS',     id: 'teams' },
  ];

  const scrollTo = (id) => {
    if (isWeekend) {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-flag">⬛🟥</span>
          <span className="logo-text">PIT<span className="logo-accent">WALL</span></span>
          <span className="logo-edition">PERSONAL EDITION · 2026</span>
        </div>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {homeLinks.map(link => (
            <button
              key={link.label}
              className={`nav-link ${!isWeekend && activeSection === link.label ? 'active' : ''}`}
              onClick={() => { setActiveSection?.(link.label); scrollTo(link.id); }}
            >
              {link.label}
            </button>
          ))}

          {/* Weekend page link */}
          <button
            className={`nav-link nav-link-weekend ${isWeekend ? 'active' : ''}`}
            onClick={() => { navigate('/weekend'); setMenuOpen(false); }}
          >
            WEEKEND
            <span className="weekend-nav-dot" />
          </button>
        </div>

        <div className="nav-right">
          <span className="live-badge">● LIVE EDITION</span>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
