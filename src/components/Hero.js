import React, { useState, useEffect } from 'react';
import './Hero.css';

const useCountdown = (targetDate) => {
  const toDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const calc = () => {
    const diff = toDate - new Date();
    if (!toDate || isNaN(toDate) || diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000) / 60000),
      secs:  Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  });
  return time;
};

const FlipUnit = ({ value, label }) => (
  <div className="flip-unit">
    <div className="flip-card">
      <span className="flip-value">{String(value).padStart(2, '0')}</span>
    </div>
    <span className="flip-label">{label}</span>
  </div>
);

const Hero = ({ nextRace, standings }) => {
  const raceDate = nextRace?.raceDate || nextRace?.date;
  const time = useCountdown(raceDate);
  const leader = standings?.drivers?.[0];
  const p2 = standings?.drivers?.[1];
  const gap = leader && p2 ? Math.abs(p2.diff || 0) : null;

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <div className="hero-content">
        <div className="hero-header">
          <div className="hero-meta">
            <span className="round-badge">ROUND {nextRace?.round || '—'} of {nextRace?.totalRounds || 22}</span>
            <span className="up-next-badge">▶ UP NEXT</span>
            <span className="country-tag">{nextRace?.location || ''}</span>
          </div>
          <h1 className="race-title">
            {nextRace?.name
              ? <>
                  {nextRace.name.replace(' Grand Prix', '')} <span className="race-title-accent">Grand Prix</span>
                </>
              : <span className="race-title-accent">Loading…</span>
            }
          </h1>
          <p className="race-circuit">
            {nextRace?.circuit || ''}
            {nextRace?.laps && <span className="circuit-detail"> · {nextRace.laps} laps · {nextRace.circuitLength}</span>}
          </p>
          {nextRace?.sessionDates?.race && (
            <p className="race-date-line">
              Race: {new Date(nextRace.sessionDates.race).toUTCString().replace(' GMT', ' UTC')}
            </p>
          )}
        </div>

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
          {nextRace?.poleRecord && (
            <>
              <div className="stat-item">
                <span className="stat-label">POLE RECORD</span>
                <span className="stat-value">{nextRace.poleRecord.time}</span>
                <span className="stat-sub">{nextRace.poleRecord.holder} · {nextRace.poleRecord.year}</span>
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

      <div className="hero-title-bg">The<br /><span>Pit Wall.</span></div>
    </section>
  );
};

export default Hero;
