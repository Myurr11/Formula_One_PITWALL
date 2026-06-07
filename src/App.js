import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Calendar from './components/Calendar';
import Standings from './components/Standings';
import PaddockIntel from './components/Paddock';
import Teams from './components/Teams';
import Footer from './components/Footer';
import LiveStatus from './components/LiveStatus';
import WeekendPage from './pages/WeekendPage';
import { useF1Data } from './hooks/useF1Data';
import './App.css';

function HomePage() {
  const [activeSection, setActiveSection] = useState('HOME');
  const { data, status, lastUpdated, sources, forceRefresh } = useF1Data();

  return (
    <div className="app">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="status-bar">
        <LiveStatus status={status} lastUpdated={lastUpdated} sources={sources} onRefresh={forceRefresh} />
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/weekend" element={<WeekendPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
