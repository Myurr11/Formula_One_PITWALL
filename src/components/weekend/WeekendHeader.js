import React from 'react';
import './WeekendHeader.css';

const flagMap = {
  Australia:'🇦🇺', China:'🇨🇳', Japan:'🇯🇵', Bahrain:'🇧🇭',
  'Saudi Arabia':'🇸🇦', 'United States':'🇺🇸', USA:'🇺🇸',
  Monaco:'🇲🇨', Spain:'🇪🇸', Canada:'🇨🇦', Austria:'🇦🇹',
  'United Kingdom':'🇬🇧', Belgium:'🇧🇪', Hungary:'🇭🇺',
  Netherlands:'🇳🇱', Italy:'🇮🇹', Azerbaijan:'🇦🇿',
  Singapore:'🇸🇬', Mexico:'🇲🇽', Brazil:'🇧🇷', Qatar:'🇶🇦',
  'Abu Dhabi':'🇦🇪', 'United Arab Emirates':'🇦🇪',
};

const getFlag = (location = '') => {
  const country = location.split(', ').pop();
  return flagMap[country] || '🏁';
};

const WeekendHeader = ({ weekend, sessions, status }) => {
  const now       = new Date();
  const liveSession   = sessions.find(s => s.status === 'live');
  const doneCount     = sessions.filter(s => s.status === 'completed').length;
  const totalSessions = sessions.length;

  const raceSession = sessions.find(s => s.type === 'Race');
  const raceDate    = raceSession ? new Date(raceSession.dateStart) : null;
  const daysToRace  = raceDate
    ? Math.ceil((raceDate - now) / 86400000)
    : null;

  return (
    <div className="weekend-header">
      <div className="wh-top">
        <div className="wh-identity">
          <div className="wh-flag">{weekend ? getFlag(weekend.location) : '🏁'}</div>
          <div className="wh-text">
            <div className="wh-eyebrow">
              {weekend?.round ? `ROUND ${weekend.round} · 2026 SEASON` : '2026 SEASON'}
            </div>
            <h1 className="wh-title">
              {weekend
                ? <>{weekend.name.replace(' Grand Prix', '')} <span>Grand Prix</span></>
                : <span className="wh-loading">Loading weekend…</span>
              }
            </h1>
            {weekend?.circuit && (
              <p className="wh-circuit">{weekend.circuit} · {weekend.location}</p>
            )}
          </div>
        </div>

        <div className="wh-stats">
          {liveSession ? (
            <div className="wh-live-pill">
              <span className="wh-live-dot" />
              <span>{liveSession.config.short} LIVE NOW</span>
            </div>
          ) : daysToRace !== null && daysToRace > 0 ? (
            <div className="wh-countdown-pill">
              <span className="wh-cd-num">{daysToRace}</span>
              <span className="wh-cd-label">DAYS TO RACE</span>
            </div>
          ) : null}

          {totalSessions > 0 && (
            <div className="wh-progress">
              <div className="wh-progress-label">
                <span>{doneCount} of {totalSessions} sessions complete</span>
              </div>
              <div className="wh-progress-bar">
                <div
                  className="wh-progress-fill"
                  style={{ width: `${(doneCount / totalSessions) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekendHeader;
