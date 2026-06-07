import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveStatus from '../components/LiveStatus';
import SessionTabs from '../components/weekend/SessionTabs';
import SessionResult from '../components/weekend/SessionResult';
import WeekendHeader from '../components/weekend/WeekendHeader';
import RaceSelector from '../components/weekend/RaceSelector';
import { useWeekendData } from '../hooks/useWeekendData';
import './WeekendPage.css';

const WeekendPage = () => {
  const [activeSection, setActiveSection] = useState('WEEKEND');
  const [selectedRound, setSelectedRound] = useState(null); // null = auto (current)

  const {
    allRaces, weekend, sessions, results,
    activeKey, setActiveKey,
    status, lastUpdated, forceRefresh,
  } = useWeekendData(selectedRound);

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
        {/* Race selector — browse past GPs */}
        <RaceSelector
          races={allRaces}
          selectedRound={selectedRound}
          onSelect={(round) => { setSelectedRound(round); setActiveKey(null); }}
        />

        <WeekendHeader weekend={weekend} sessions={sessions} status={status} />

        {status === 'no-openf1' && (
          <div className="weekend-notice">
            <span>📡</span>
            <span>Live session data not yet available from OpenF1 for this round. Schedule shown from Ergast.</span>
          </div>
        )}

        {isLoading && (
          <div className="weekend-loading">
            <div className="loading-spinner" />
            <p>Loading session data…</p>
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
              <p>Check your connection and try refreshing.</p>
            </div>
          )}
        </div>
      </div>

      <Footer lastUpdated={lastUpdated} status={status} />
    </div>
  );
};

export default WeekendPage;
