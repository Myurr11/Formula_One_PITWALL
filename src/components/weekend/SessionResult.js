import React, { useState } from 'react';
import './SessionResult.css';

const TYRE_COLORS = {
  SOFT: '#E8002D', MEDIUM: '#FFC906', HARD: '#EBEBEB',
  INTERMEDIATE: '#39B54A', WET: '#0067FF',
  UNKNOWN: '#888', HYPERSOFT: '#FF80C7', ULTRASOFT: '#9B26AF',
  SUPERSOFT: '#FF3333', SUPERHARD: '#FF6600',
};

const TyreDot = ({ compound }) => (
  <span
    className="tyre-dot"
    style={{ background: TYRE_COLORS[compound?.toUpperCase()] || '#555' }}
    title={compound}
  />
);

const formatLapTime = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
};

const formatGap = (gap) => {
  if (gap === null || gap === undefined || gap === 0) return '—';
  if (typeof gap === 'string') return gap.startsWith('+') ? gap : `+${gap}`;
  return `+${gap.toFixed(3)}s`;
};

const UPCOMING_MSGS = {
  'Practice 1':        'Free Practice 1 has not started yet.',
  'Practice 2':        'Free Practice 2 has not started yet.',
  'Practice 3':        'Free Practice 3 has not started yet.',
  'Sprint Qualifying': 'Sprint Qualifying has not started yet.',
  'Sprint':            'Sprint Race has not started yet.',
  'Qualifying':        'Qualifying has not started yet.',
  'Race':              'The Grand Prix has not started yet.',
};

const SessionResult = ({ session, result }) => {
  const [sortBy, setSortBy] = useState('position'); // position | laptime | gap

  if (!session) return null;

  const isUpcoming  = session.status === 'upcoming';
  const isLive      = session.status === 'live';
  const isCompleted = session.status === 'completed';
  const isPractice  = session.type?.startsWith('Practice');
  const isQuali     = session.type === 'Qualifying' || session.type === 'Sprint Qualifying';
  const isRaceType  = session.type === 'Race' || session.type === 'Sprint';

  const startTime = new Date(session.dateStart);
  const endTime   = new Date(session.dateEnd);
  const duration  = Math.round((endTime - startTime) / 60000);

  // Sort results
  const sorted = result?.results ? [...result.results].sort((a, b) => {
    if (sortBy === 'laptime') {
      const aT = a.bestLap?.duration || 9999;
      const bT = b.bestLap?.duration || 9999;
      return aT - bT;
    }
    if (sortBy === 'gap') {
      const aG = typeof a.gap === 'number' ? a.gap : (a.position === 1 ? 0 : 9999);
      const bG = typeof b.gap === 'number' ? b.gap : (b.position === 1 ? 0 : 9999);
      return aG - bG;
    }
    return a.position - b.position;
  }) : [];

  const fastestLapTime = sorted.length > 0
    ? Math.min(...sorted.map(r => r.bestLap?.duration || Infinity))
    : null;

  return (
    <div className="session-result">
      {/* Session banner */}
      <div className={`sr-banner ${isLive ? 'sr-live' : ''}`}>
        <div className="sr-banner-left">
          <span className="sr-icon">{session.config.icon}</span>
          <div>
            <h2 className="sr-title">{session.config.label}</h2>
            <p className="sr-subtitle">
              {startTime.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
              {' · '}
              {startTime.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
              {' – '}
              {endTime.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
              {' · '}
              {duration} min
            </p>
          </div>
        </div>
        <div className="sr-banner-right">
          {isLive && (
            <div className="sr-live-badge">
              <span className="sr-live-dot" />
              LIVE
            </div>
          )}
          {isCompleted && <span className="sr-done-badge">COMPLETED</span>}
          {isUpcoming  && <span className="sr-soon-badge">UPCOMING</span>}
          {result?.totalLaps > 0 && (
            <span className="sr-laps">{result.totalLaps} LAPS RECORDED</span>
          )}
        </div>
      </div>

      {/* Upcoming state */}
      {isUpcoming && (
        <div className="sr-upcoming">
          <span className="sr-upcoming-icon">⏳</span>
          <p>{UPCOMING_MSGS[session.type] || 'This session has not started yet.'}</p>
          <p className="sr-upcoming-time">
            Starts {startTime.toLocaleDateString('en-GB', {weekday:'long'})} at{' '}
            {startTime.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})} local time
          </p>
        </div>
      )}

      {/* No data yet for live/completed */}
      {!isUpcoming && !result && (
        <div className="sr-upcoming">
          <span className="sr-upcoming-icon">📡</span>
          <p>{isLive ? 'Waiting for live timing data…' : 'Session data not available yet.'}</p>
        </div>
      )}

      {/* Results table */}
      {result && sorted.length > 0 && (
        <>
          {/* Sort controls (practice / quali — position makes less sense) */}
          {(isPractice || isQuali) && (
            <div className="sr-sort-bar">
              <span className="sr-sort-label">SORT BY</span>
              {['position', 'laptime'].map(opt => (
                <button
                  key={opt}
                  className={`sr-sort-btn ${sortBy === opt ? 'active' : ''}`}
                  onClick={() => setSortBy(opt)}
                >
                  {opt === 'position' ? 'Classification' : 'Best Lap'}
                </button>
              ))}
            </div>
          )}

          <div className="sr-table">
            <div className="sr-table-head">
              <span className="sr-col-pos">POS</span>
              <span className="sr-col-num">#</span>
              <span className="sr-col-driver">DRIVER</span>
              <span className="sr-col-team">TEAM</span>
              <span className="sr-col-best">BEST LAP</span>
              {!isPractice && <span className="sr-col-gap">GAP</span>}
              {(isPractice || isRaceType) && <span className="sr-col-tyre">TYRE</span>}
              {isRaceType && <span className="sr-col-pits">PITS</span>}
            </div>

            {sorted.map((driver, idx) => {
              const isFastest = driver.bestLap?.duration === fastestLapTime && fastestLapTime;
              const isLeader  = driver.position === 1;
              return (
                <div
                  key={driver.number}
                  className={`sr-row ${isLeader ? 'sr-leader' : ''} ${isFastest ? 'sr-fastest' : ''}`}
                  style={{ '--team-color': driver.color }}
                >
                  <span className="sr-col-pos sr-pos-num">
                    {driver.position < 99 ? driver.position : '—'}
                  </span>

                  <span className="sr-col-num sr-driver-num" style={{ color: driver.color }}>
                    {driver.number}
                  </span>

                  <div className="sr-col-driver sr-driver-info">
                    <span className="sr-driver-code">{driver.code}</span>
                    <span className="sr-driver-name">{driver.name}</span>
                  </div>

                  <div className="sr-col-team sr-team-info">
                    <span className="sr-team-bar" style={{ background: driver.color }} />
                    <span className="sr-team-name">{driver.team}</span>
                  </div>

                  <div className="sr-col-best sr-best-lap">
                    <span className={`sr-lap-time ${isFastest ? 'sr-fastest-time' : ''}`}>
                      {formatLapTime(driver.bestLap?.duration)}
                    </span>
                    {isFastest && <span className="sr-fl-badge">FL</span>}
                  </div>

                  {!isPractice && (
                    <span className="sr-col-gap sr-gap">
                      {isLeader ? 'LEADER' : formatGap(driver.gap)}
                    </span>
                  )}

                  {(isPractice || isRaceType) && (
                    <span className="sr-col-tyre">
                      <TyreDot compound={driver.bestLap?.compound} />
                      <span className="sr-compound-label">
                        {driver.bestLap?.compound?.slice(0,1) || '?'}
                      </span>
                    </span>
                  )}

                  {isRaceType && (
                    <span className="sr-col-pits sr-pits">
                      {driver.pitStops || 0}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="sr-source">
            Data: OpenF1 · Auto-refreshes every {isLive ? '30s' : '5 min'}
          </p>
        </>
      )}
    </div>
  );
};

export default SessionResult;
