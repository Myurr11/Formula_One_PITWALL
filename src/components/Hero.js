import React, { useState, useEffect } from 'react';
import './Hero.css';

const useCountdown = (targetDate) => {
  const toDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const calc = () => {
    const diff = toDate - new Date();
    if (!toDate || isNaN(toDate) || diff <= 0) return { days:0,hours:0,mins:0,secs:0 };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000) / 60000),
      secs:  Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => { const t = setInterval(() => setTime(calc()), 1000); return () => clearInterval(t); });
  return time;
};

const FlipUnit = ({ value, label }) => (
  <div className="flip-unit">
    <div className="flip-card">
      <span className="flip-value">{String(value).padStart(2,'0')}</span>
    </div>
    <span className="flip-label">{label}</span>
  </div>
);

// Circuit SVG map — from julesr0y/f1-circuits-svg (white-outline, verified layout IDs)
const BASE = 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/white-outline';
const CIRCUIT_MAPS = {
  'Australian Grand Prix':    `${BASE}/melbourne-2.svg`,
  'Chinese Grand Prix':       `${BASE}/shanghai-1.svg`,
  'Japanese Grand Prix':      `${BASE}/suzuka-2.svg`,
  'Miami Grand Prix':         `${BASE}/miami-1.svg`,
  'Canadian Grand Prix':      `${BASE}/montreal-6.svg`,
  'Monaco Grand Prix':        `${BASE}/monaco-6.svg`,
  'Spanish Grand Prix':       `${BASE}/catalunya-6.svg`,
  'Austrian Grand Prix':      `${BASE}/spielberg-3.svg`,
  'British Grand Prix':       `${BASE}/silverstone-8.svg`,
  'Belgian Grand Prix':       `${BASE}/spa-francorchamps-4.svg`,
  'Hungarian Grand Prix':     `${BASE}/hungaroring-3.svg`,
  'Dutch Grand Prix':         `${BASE}/zandvoort-5.svg`,
  'Italian Grand Prix':       `${BASE}/monza-7.svg`,
  'Madrid Grand Prix':        `${BASE}/madring-1.svg`,
  'Azerbaijan Grand Prix':    `${BASE}/baku-1.svg`,
  'Singapore Grand Prix':     `${BASE}/marina-bay-4.svg`,
  'United States Grand Prix': `${BASE}/austin-1.svg`,
  'Mexico City Grand Prix':   `${BASE}/mexico-city-3.svg`,
  'Brazilian Grand Prix':     `${BASE}/interlagos-2.svg`,
  'Las Vegas Grand Prix':     `${BASE}/las-vegas-1.svg`,
  'Qatar Grand Prix':         `${BASE}/lusail-1.svg`,
  'Abu Dhabi Grand Prix':     `${BASE}/yas-marina-2.svg`,
};

const getCircuitMap = (raceName = '') => {
  return CIRCUIT_MAPS[raceName] ||
    Object.entries(CIRCUIT_MAPS).find(([k]) => raceName.includes(k.split(' ').slice(0,-2).join(' ')))?.[1] ||
    null;
};

// Session schedule display
const SESSION_LABELS = {
  fp1:        { short: 'FP1', label: 'Free Practice 1' },
  fp2:        { short: 'FP2', label: 'Free Practice 2' },
  fp3:        { short: 'FP3', label: 'Free Practice 3' },
  qualifying: { short: 'Q',   label: 'Qualifying' },
  sprint:     { short: 'SPR', label: 'Sprint Race' },
  sprintQuali:{ short: 'SQ',  label: 'Sprint Qualifying' },
  race:       { short: 'R',   label: 'Race' },
};

const SESSION_ORDER = ['fp1','fp2','sprintQuali','fp3','sprint','qualifying','race'];

const formatSessionTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    day:  d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }),
    time: d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }),
    ts:   d,
  };
};

const SessionSchedule = ({ sessionDates, isSprint }) => {
  const now = new Date();
  const sessions = SESSION_ORDER
    .filter(k => sessionDates?.[k])
    .map(k => {
      const formatted = formatSessionTime(sessionDates[k]);
      const isPast   = formatted?.ts < now;
      const isNext   = !isPast && SESSION_ORDER
        .filter(s => sessionDates?.[s])
        .find(s => new Date(sessionDates[s]) > now) === k;
      return { key: k, ...SESSION_LABELS[k], formatted, isPast, isNext };
    });

  if (!sessions.length) return null;

  return (
    <div className="session-schedule">
      <span className="ss-title">WEEKEND SCHEDULE</span>
      <div className="ss-sessions">
        {sessions.map(s => (
          <div key={s.key} className={`ss-item ${s.isPast ? 'ss-past' : ''} ${s.isNext ? 'ss-next' : ''}`}>
            <div className="ss-left">
              <span className="ss-short">{s.short}</span>
              <span className="ss-label">{s.label}</span>
            </div>
            <div className="ss-right">
              <span className="ss-day">{s.formatted?.day}</span>
              <span className="ss-time">{s.formatted?.time}</span>
            </div>
            {s.isPast && <span className="ss-done">✓</span>}
            {s.isNext && <span className="ss-next-badge">NEXT</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Hero = ({ nextRace, standings }) => {
  const [mapFailed, setMapFailed] = useState(false);
  const raceDate  = nextRace?.raceDate || nextRace?.date;
  const time      = useCountdown(raceDate);
  const leader    = standings?.drivers?.[0];
  const p2        = standings?.drivers?.[1];
  const gap       = leader && p2 ? Math.abs(p2.diff || 0) : null;
  const circuitMap = getCircuitMap(nextRace?.name || '');

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <div className="hero-content">
        {/* ── LEFT COLUMN ── */}
        <div className="hero-left">
          <div className="hero-meta">
            <span className="round-badge">ROUND {nextRace?.round || '—'} of {nextRace?.totalRounds || 22}</span>
            <span className="up-next-badge">▶ UP NEXT</span>
            <span className="country-tag">{nextRace?.location || ''}</span>
          </div>

          <h1 className="race-title">
            {nextRace?.name
              ? <>{nextRace.name.replace(' Grand Prix','')} <span className="race-title-accent">Grand Prix</span></>
              : <span className="race-title-accent">Loading…</span>
            }
          </h1>

          <p className="race-circuit">
            {nextRace?.circuit || ''}
            {nextRace?.laps && <span className="circuit-detail"> · {nextRace.laps} laps · {nextRace.circuitLength}</span>}
          </p>

          {/* Countdown */}
          <div className="countdown-block">
            <span className="countdown-label">LIGHTS OUT IN</span>
            <div className="countdown-units">
              <FlipUnit value={time.days}  label="DAYS" />
              <div className="colon">:</div>
              <FlipUnit value={time.hours} label="HRS" />
              <div className="colon">:</div>
              <FlipUnit value={time.mins}  label="MIN" />
              <div className="colon">:</div>
              <FlipUnit value={time.secs}  label="SEC" />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="race-stats">
            {nextRace?.lapRecord && (
              <>
                <div className="stat-item">
                  <span className="stat-label">LAP RECORD</span>
                  <span className="stat-value">{nextRace.lapRecord.time}</span>
                  <span className="stat-sub">{nextRace.lapRecord.holder} · {nextRace.lapRecord.year}</span>
                </div>
                <div className="stat-divider" />
              </>
            )}
            {leader && (
              <>
                <div className="stat-item">
                  <span className="stat-label">CHAMPIONSHIP LEAD</span>
                  <span className="stat-value">{gap !== null ? `+${gap} PTS` : '—'}</span>
                  <span className="stat-sub">{leader.name} over {p2?.name || '—'}</span>
                </div>
                <div className="stat-divider" />
              </>
            )}
            <div className="stat-item">
              <span className="stat-label">ROUND</span>
              <span className="stat-value">{nextRace?.round || '—'} / {nextRace?.totalRounds || 22}</span>
              <span className="stat-sub">2026 SEASON</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — circuit map + session schedule ── */}
        <div className="hero-right">
          {/* Circuit SVG map */}
          <div className="circuit-map-wrap">
            {circuitMap && !mapFailed ? (
              <img
                src={circuitMap}
                alt={nextRace?.circuit || 'Circuit'}
                className="circuit-map-img"
                onError={() => setMapFailed(true)}
              />
            ) : (
              <div className="circuit-map-placeholder">
                <span>🏎</span>
                <span>{nextRace?.circuit || 'Circuit map'}</span>
              </div>
            )}
            <div className="circuit-map-label">
              {nextRace?.circuit || ''}
            </div>
          </div>

          {/* Session schedule */}
          <SessionSchedule
            sessionDates={nextRace?.sessionDates}
            isSprint={nextRace?.isSprint}
          />
        </div>
      </div>

      <div className="hero-title-bg">The<br /><span>Pit Wall.</span></div>
    </section>
  );
};

export default Hero;
