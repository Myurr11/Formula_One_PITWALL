import React, { useState } from 'react';
import './Calendar.css';

// Verified URLs — layout IDs from circuits.json, path confirmed 200 OK
// Pattern: circuits/minimal/white-outline/{layoutId}.svg
const BASE = 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/white-outline';

const CIRCUIT_SVG = {
  'Australian':    `${BASE}/melbourne-2.svg`,
  'Chinese':       `${BASE}/shanghai-1.svg`,
  'Japanese':      `${BASE}/suzuka-2.svg`,
  'Miami':         `${BASE}/miami-1.svg`,
  'Canadian':      `${BASE}/montreal-6.svg`,
  'Monaco':        `${BASE}/monaco-6.svg`,
  'Spanish':       `${BASE}/catalunya-6.svg`,
  'Austrian':      `${BASE}/spielberg-3.svg`,
  'British':       `${BASE}/silverstone-8.svg`,
  'Belgian':       `${BASE}/spa-francorchamps-4.svg`,
  'Hungarian':     `${BASE}/hungaroring-3.svg`,
  'Dutch':         `${BASE}/zandvoort-5.svg`,
  'Italian':       `${BASE}/monza-7.svg`,
  'Madrid':        `${BASE}/madring-1.svg`,
  'Azerbaijan':    `${BASE}/baku-1.svg`,
  'Singapore':     `${BASE}/marina-bay-4.svg`,
  'United States': `${BASE}/austin-1.svg`,
  'Mexico':        `${BASE}/mexico-city-3.svg`,
  'Brazilian':     `${BASE}/interlagos-2.svg`,
  'Las Vegas':     `${BASE}/las-vegas-1.svg`,
  'Qatar':         `${BASE}/lusail-1.svg`,
  'Abu Dhabi':     `${BASE}/yas-marina-2.svg`,
};

const getSvgUrl = (name = '') => {
  const key = Object.keys(CIRCUIT_SVG).find(k => name.includes(k));
  return key ? CIRCUIT_SVG[key] : null;
};

const flagMap = {
  AU:'🇦🇺', CN:'🇨🇳', JP:'🇯🇵', BH:'🇧🇭', SA:'🇸🇦', US:'🇺🇸',
  MC:'🇲🇨', ES:'🇪🇸', CA:'🇨🇦', AT:'🇦🇹', GB:'🇬🇧', BE:'🇧🇪',
  HU:'🇭🇺', NL:'🇳🇱', IT:'🇮🇹', AZ:'🇦🇿', SG:'🇸🇬', MX:'🇲🇽',
  BR:'🇧🇷', QA:'🇶🇦', AE:'🇦🇪',
};

// Derive status entirely from raceDate vs now — never trust API's status field
const deriveStatus = (races) => {
  const now = new Date();
  let nextAssigned = false;
  return races.map(race => {
    const rd = new Date(race.raceDate || race.date);
    const inPast = rd < now;
    // A race is "done" only if it's in the past AND has a winner OR well past (>2h after race start)
    const isDone = inPast && (race.winner || (now - rd) > 2 * 60 * 60 * 1000);
    if (isDone) return { ...race, status: 'done' };
    if (!nextAssigned) { nextAssigned = true; return { ...race, status: 'next' }; }
    return { ...race, status: 'upcoming' };
  });
};

// Round up to nearest multiple of COLS to avoid orphan gaps
const COLS = 7;
const padToFullRow = (arr) => {
  const rem = arr.length % COLS;
  if (rem === 0) return arr;
  return [...arr, ...Array(COLS - rem).fill(null)];
};

const CircuitImg = ({ name }) => {
  const [failed, setFailed] = React.useState(false);
  const url = getSvgUrl(name);
  if (!url || failed) return null;
  return (
    <div className="circuit-svg-wrap">
      <img
        src={url}
        alt={name}
        className="circuit-svg"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

const Calendar = ({ calendar }) => {
  const [showAll, setShowAll] = useState(false);

  const rawRaces = calendar?.races || [];
  // Re-derive statuses correctly from actual dates
  const races = deriveStatus(rawRaces);
  const total  = races.length;

  // Show enough races to fill complete rows — at minimum the first 2 rows (14 cards)
  const minShow = COLS * 2; // 14
  const baseCount = showAll ? total : minShow;
  // Pad to full grid row so no orphan empty cells
  const displayed = padToFullRow(races.slice(0, baseCount));

  return (
    <section className="calendar-section" id="schedule">
      <div className="section-inner">
        <div className="section-header">
          <h2 className="section-title">Season <span>Calendar</span></h2>
          <span className="section-meta">2026 · {total} ROUNDS</span>
        </div>

        <div className="calendar-grid">
          {displayed.map((race, idx) =>
            race === null ? (
              // Invisible filler — keeps grid alignment without visible gap
              <div key={`filler-${idx}`} className="race-card filler" aria-hidden="true" />
            ) : (
              <div key={race.round} className={`race-card ${race.status}`}>
                {/* Circuit layout background */}
                <CircuitImg name={race.name || race.shortName || ''} />

                <div className="race-card-content">
                  <div className="race-card-top">
                    <span className="race-round">R{String(race.round).padStart(2,'0')}</span>
                    <div className="race-card-badges">
                      {race.isSprint && <span className="sprint-badge">S</span>}
                      <span className="race-flag">{flagMap[race.country] || '🏁'}</span>
                    </div>
                    {race.status === 'next' && <span className="next-indicator">NEXT</span>}
                    {race.status === 'done'  && <span className="done-indicator">✓</span>}
                  </div>

                  <div className="race-card-body">
                    <h3 className="race-name">{race.shortName || race.name}</h3>
                    <p className="race-circuit-name">{race.circuit}</p>
                    <p className="race-date">{race.raceDate ? race.raceDate.slice(0,10) : race.date}</p>
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
              </div>
            )
          )}
        </div>

        {!showAll && total > minShow && (
          <button className="show-more-btn" onClick={() => setShowAll(true)}>
            SHOW ALL {total} RACES ↓
          </button>
        )}
        {showAll && (
          <button className="show-more-btn" onClick={() => setShowAll(false)}>
            SHOW LESS ↑
          </button>
        )}
      </div>
    </section>
  );
};

export default Calendar;
