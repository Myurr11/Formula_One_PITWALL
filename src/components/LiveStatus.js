import React, { useState } from 'react';
import './LiveStatus.css';

const LiveStatus = ({ status, lastUpdated, sources, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 2500);
  };

  const formatAge = (date) => {
    if (!date) return null;
    const secs = Math.floor((new Date() - date) / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const cfg = {
    loading: { dot: 'yellow', label: 'FETCHING DATA…', pulse: true  },
    live:    { dot: 'green',  label: 'LIVE',           pulse: true  },
    offline: { dot: 'red',    label: 'OFFLINE',        pulse: false },
    error:   { dot: 'red',    label: 'ERROR',          pulse: false },
  }[status] || { dot: 'grey', label: 'CONNECTING', pulse: false };

  const sourceStr = sources
    ? [...new Set(Object.values(sources).filter(Boolean))].join(' · ')
    : null;

  return (
    <div className={`live-status ls-${cfg.dot}`} title={sourceStr ? `Sources: ${sourceStr}` : ''}>
      <span className={`ls-dot ${cfg.pulse ? 'ls-pulse' : ''}`} />
      <span className="ls-label">{cfg.label}</span>
      {status === 'live' && lastUpdated && (
        <span className="ls-time">{formatAge(lastUpdated)}</span>
      )}
      {status === 'live' && (
        <span className="ls-free-badge">FREE API</span>
      )}
      {status === 'offline' && (
        <span className="ls-time">showing cached data</span>
      )}
      <button
        className={`ls-refresh ${refreshing ? 'spinning' : ''}`}
        onClick={handleRefresh}
        title="Refresh now"
        disabled={refreshing}
      >↻</button>
    </div>
  );
};

export default LiveStatus;
