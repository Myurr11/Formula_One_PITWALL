import React, { useState } from 'react';
import './Calendar.css';

const flagMap = {
  AU:'🇦🇺', CN:'🇨🇳', JP:'🇯🇵', BH:'🇧🇭', SA:'🇸🇦', US:'🇺🇸',
  MC:'🇲🇨', ES:'🇪🇸', CA:'🇨🇦', AT:'🇦🇹', GB:'🇬🇧', BE:'🇧🇪',
  HU:'🇭🇺', NL:'🇳🇱', IT:'🇮🇹', AZ:'🇦🇿', SG:'🇸🇬', MX:'🇲🇽',
  BR:'🇧🇷', QA:'🇶🇦', AE:'🇦🇪',
};

const Calendar = ({ calendar }) => {
  const [showAll, setShowAll] = useState(false);
  const races = calendar?.races || [];
  const displayed = showAll ? races : races.slice(0, 10);
  const total = races.length;

  return (
    <section className="calendar-section" id="schedule">
      <div className="section-inner">
        <div className="section-header">
          <h2 className="section-title">Season <span>Calendar</span></h2>
          <span className="section-meta">2026 · {total} ROUNDS</span>
        </div>

        <div className="calendar-grid">
          {displayed.map((race) => (
            <div key={race.round} className={`race-card ${race.status}`}>
              <div className="race-card-top">
                <span className="race-round">R{String(race.round).padStart(2,'0')}</span>
                <div className="race-card-badges">
                  {race.isSprint && <span className="sprint-badge">S</span>}
                  <span className="race-flag">{flagMap[race.country] || '🏁'}</span>
                </div>
                {race.status === 'next' && <span className="next-indicator">NEXT</span>}
                {race.status === 'done' && <span className="done-indicator">✓</span>}
              </div>
              <div className="race-card-body">
                <h3 className="race-name">{race.shortName || race.name}</h3>
                <p className="race-circuit-name">{race.circuit}</p>
                <p className="race-date">{race.date}</p>
              </div>
              {race.winner ? (
                <div className="race-winner">
                  <span className="winner-label">WINNER</span>
                  <span className="winner-name" style={{ color: race.winnerColor || '#fff' }}>
                    {race.winner}
                  </span>
                </div>
              ) : race.status === 'next' ? (
                <div className="race-winner next-race-cta">
                  <span className="winner-label">STATUS</span>
                  <span className="winner-name" style={{color:'var(--red)'}}>UPCOMING ▶</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {!showAll && total > 10 && (
          <button className="show-more-btn" onClick={() => setShowAll(true)}>
            SHOW ALL {total} RACES
          </button>
        )}
      </div>
    </section>
  );
};

export default Calendar;
