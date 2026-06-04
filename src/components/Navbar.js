import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['HOME', 'SCHEDULE', 'STANDINGS', 'PADDOCK', 'TEAMS'];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-logo">
          <span className="logo-flag">⬛🟥</span>
          <span className="logo-text">PIT<span className="logo-accent">WALL</span></span>
          <span className="logo-edition">PERSONAL EDITION · 2026</span>
        </div>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <button
              key={link}
              className={`nav-link ${activeSection === link ? 'active' : ''}`}
              onClick={() => { setActiveSection(link); setMenuOpen(false); document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              {link}
            </button>
          ))}
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
