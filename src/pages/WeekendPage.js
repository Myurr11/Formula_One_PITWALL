import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveStatus from '../components/LiveStatus';
import SessionTabs from '../components/weekend/SessionTabs';
import SessionResult from '../components/weekend/SessionResult';
import WeekendHeader from '../components/weekend/WeekendHeader';
import { useWeekendData } from '../hooks/useWeekendData';
import './WeekendPage.css';

const WeekendPage = () => {
  const [activeSection, setActiveSection] = useState('WEEKEND');
  const {
    weekend, sessions, results, activeKey, setActiveKey,
    status, error, lastUpdated, forceRefresh,
  } = useWeekendData();

  const activeSession = sessions.find(s => s.key === activeKey);
  const activeResult  = activeKey ? results[activeKey] : null;
  const isLoading     = status === 'loading' && sessions.length === 0;

  return (
    <div className="app">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="status-bar">
        <LiveStatus
          status={status === 'no-openf1' ? 'offline' : status}
          lastUpdated={lastUpdated}
          sources={{ data: 'openf1 + ergast' }}
          onRefresh={forceRefresh}
        />
      </div>

      <div className="weekend-page">
        <WeekendHeader weekend={weekend} sessions={sessions} status={status} />

        {isLoading && (
          <div className="weekend-loading">
            <div className="loading-spinner" />
            <p>Fetching race weekend sessions…</p>
          </div>
        )}

        {/* No-OpenF1 banner — sessions still show, just no results */}
        {status === 'no-openf1' && (
          <div className="weekend-notice">
            <span>📡</span>
            <span>
              Live session data unavailable — OpenF1 only streams data during active sessions.
              Session schedule shown from Ergast. Results will appear automatically once sessions begin.
            </span>
          </div>
        )}

        {sessions.length > 0 && (
          <SessionTabs sessions={sessions} activeKey={activeKey} onSelect={setActiveKey} />
        )}

        <div className="weekend-content">
          {activeSession && (
            <SessionResult session={activeSession} result={activeResult} />
          )}
          {!isLoading && !activeSession && status === 'offline' && (
            <div className="weekend-offline">
              <span className="offline-icon">📡</span>
              <h3>Unable to reach data sources</h3>
              <p>Check your internet connection and try refreshing.</p>
              {error && <p className="error-detail">{error}</p>}
            </div>
          )}
        </div>
      </div>

      <Footer lastUpdated={lastUpdated} status={status} />
    </div>
  );
};

export default WeekendPage;
