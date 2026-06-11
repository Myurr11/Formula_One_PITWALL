import React from 'react';
import './Standings.css';

const DriverRow = ({ driver, maxPts }) => (
  <div className="driver-row" style={{ '--team-color': driver.color }}>
    <span className="pos-num">{String(driver.pos).padStart(2,'0')}</span>
    <div className="driver-info">
      <span className="driver-name">{driver.name}</span>
      <span className="driver-team" style={{ color: driver.color }}>{driver.team}</span>
    </div>
    <div className="pts-bar-wrap">
      <div className="pts-bar" style={{ width:`${(driver.pts/maxPts)*100}%`, background: driver.color }} />
    </div>
    <span className="driver-pts">{driver.pts}</span>
    {driver.diff !== null && driver.diff !== undefined && (
      <span className="driver-diff">{driver.diff}</span>
    )}
  </div>
);

const ConstructorRow = ({ team, maxPts }) => (
  <div className="constructor-row" style={{ '--team-color': team.color }}>
    <span className="pos-num">{String(team.pos).padStart(2,'0')}</span>
    <div className="team-color-bar" style={{ background: team.color }} />
    <div className="team-info">
      <span className="team-name">{team.name}</span>
    </div>
    <div className="pts-bar-wrap">
      <div className="pts-bar" style={{ width:`${(team.pts/maxPts)*100}%`, background: team.color }} />
    </div>
    <span className="team-pts">{team.pts}</span>
  </div>
);

const Standings = ({ standings }) => {
  const drivers      = standings?.drivers || [];
  const constructors = standings?.constructors || [];
  const rounds       = standings?.roundsComplete || 0;
  const maxDriverPts = drivers[0]?.pts || 1;
  const maxTeamPts   = constructors[0]?.pts || 1;

  // Show top 10 drivers, all constructors
  const topDrivers = drivers.slice(0, 10);

  return (
    <section className="standings-section" id="standings">
      <div className="section-inner">

        {/* Header */}
        <div className="standings-header">
          <div>
            <h2 className="section-title">Championship <span>Standings</span></h2>
            <p className="standings-sub">AFTER {rounds} ROUND{rounds !== 1 ? 'S' : ''} · 2026 SEASON</p>
          </div>
        </div>

        {/* Side-by-side layout */}
        <div className="standings-split">

          {/* ── DRIVERS ── */}
          <div className="standings-col">
            <div className="standings-col-header">
              <span className="standings-col-title">Drivers' <span>Championship</span></span>
              <span className="standings-col-meta">TOP 10</span>
            </div>
            <div className="standings-list">
              {topDrivers.map(d => (
                <DriverRow key={d.pos} driver={d} maxPts={maxDriverPts} />
              ))}
              {drivers.length > 10 && (
                <div className="standings-more">
                  +{drivers.length - 10} more drivers
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="standings-divider" />

          {/* ── CONSTRUCTORS ── */}
          <div className="standings-col">
            <div className="standings-col-header">
              <span className="standings-col-title">Constructors' <span>Cup</span></span>
              <span className="standings-col-meta">ALL {constructors.length} TEAMS</span>
            </div>
            <div className="standings-list constructors-list">
              {constructors.map(t => (
                <ConstructorRow key={t.pos} team={t} maxPts={maxTeamPts} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Standings;
