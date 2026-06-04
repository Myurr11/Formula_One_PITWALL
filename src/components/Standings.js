import React, { useState } from 'react';
import './Standings.css';

const DriverRow = ({ driver, maxPts }) => (
  <div className="driver-row">
    <span className="pos-num">{String(driver.pos).padStart(2,'0')}</span>
    <div className="driver-info">
      <span className="driver-name">{driver.name}</span>
      <span className="driver-team" style={{ color: driver.color }}>{driver.team} · {driver.nat}</span>
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
  <div className="constructor-row">
    <span className="pos-num">{String(team.pos).padStart(2,'0')}</span>
    <div className="team-color-bar" style={{ background: team.color }} />
    <div className="team-info">
      <span className="team-name">{team.name}</span>
      <span className="team-engine">{team.engine}</span>
    </div>
    <div className="pts-bar-wrap">
      <div className="pts-bar" style={{ width:`${(team.pts/maxPts)*100}%`, background: team.color }} />
    </div>
    <span className="team-pts">{team.pts}</span>
  </div>
);

const Standings = ({ standings }) => {
  const [tab, setTab] = useState('drivers');
  const drivers      = standings?.drivers || [];
  const constructors = standings?.constructors || [];
  const rounds       = standings?.roundsComplete || 0;
  const maxDriverPts      = drivers[0]?.pts || 1;
  const maxTeamPts        = constructors[0]?.pts || 1;

  return (
    <section className="standings-section" id="standings">
      <div className="section-inner">
        <div className="standings-header">
          <div>
            <h2 className="section-title">Championship <span>Standings</span></h2>
            <p className="standings-sub">AFTER {rounds} ROUND{rounds !== 1 ? 'S' : ''} · 2026 SEASON</p>
          </div>
          <div className="standings-tabs">
            <button className={`tab-btn ${tab==='drivers'?'active':''}`} onClick={()=>setTab('drivers')}>
              Driver's
            </button>
            <button className={`tab-btn ${tab==='constructors'?'active':''}`} onClick={()=>setTab('constructors')}>
              Constructor's
            </button>
          </div>
        </div>

        <div className="standings-content">
          {tab === 'drivers' ? (
            <div className="standings-list">
              {drivers.map(d => <DriverRow key={d.pos} driver={d} maxPts={maxDriverPts} />)}
            </div>
          ) : (
            <div className="standings-list constructors-list">
              {constructors.map(t => <ConstructorRow key={t.pos} team={t} maxPts={maxTeamPts} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Standings;
