import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Calendar from './components/Calendar';
import Standings from './components/Standings';
import PaddockIntel from './components/Paddock';
import Teams from './components/Teams';
import Footer from './components/Footer';
import LiveStatus from './components/LiveStatus';
import { useF1Data } from './hooks/useF1Data';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('HOME');
  const { data, status, lastUpdated, sources, forceRefresh } = useF1Data();

  return (
    <div className="app">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="status-bar">
        <LiveStatus
          status={status}
          lastUpdated={lastUpdated}
          sources={sources}
          onRefresh={forceRefresh}
        />
      </div>

      <Hero nextRace={data.nextRace} standings={data.standings} />
      <Calendar calendar={data.calendar} />
      <Standings standings={data.standings} />
      <PaddockIntel paddock={data.paddock} lastResult={data.lastResult} />
      <Teams />
      <Footer lastUpdated={lastUpdated} status={status} />
    </div>
  );
}

export default App;
