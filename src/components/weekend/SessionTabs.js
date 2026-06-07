import React from 'react';
import './SessionTabs.css';

const SessionTabs = ({ sessions, activeKey, onSelect }) => {
  return (
    <div className="session-tabs-wrap">
      <div className="session-tabs">
        {sessions.map(session => {
          const cfg    = session.config || {};
          const isLive = session.status === 'live';
          const isDone = session.status === 'completed';
          const isNext = session.status === 'upcoming';

          return (
            <button
              key={session.key}
              className={`session-tab st-${session.status} ${activeKey === session.key ? 'active' : ''}`}
              onClick={() => onSelect(session.key)}
            >
              {/* Status badge — top right */}
              {isLive && <span className="st-badge st-live">LIVE</span>}
              {isDone && <span className="st-badge st-done">✓</span>}
              {isNext && <span className="st-badge st-soon">SOON</span>}

              <span className="st-icon">{cfg.icon || '📋'}</span>

              <div className="st-text">
                {/* SHORT = FP1 / FP2 / Q / SPR / R — always shown large */}
                <span className="st-short">{cfg.short || session.type}</span>
                {/* FULL LABEL below */}
                <span className="st-label">{cfg.label || session.type}</span>
              </div>

              <div className="st-meta">
                <span className="st-date">
                  {new Date(session.dateStart).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short',
                  })}
                </span>
                <span className="st-time">
                  {new Date(session.dateStart).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SessionTabs;
