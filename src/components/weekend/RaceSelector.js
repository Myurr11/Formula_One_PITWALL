import React, { useState } from 'react';
import './RaceSelector.css';

const flagMap = {
  Australia:'🇦🇺', China:'🇨🇳', Japan:'🇯🇵', Bahrain:'🇧🇭',
  'Saudi Arabia':'🇸🇦', 'United States':'🇺🇸', USA:'🇺🇸',
  Monaco:'🇲🇨', Spain:'🇪🇸', Canada:'🇨🇦', Austria:'🇦🇹',
  'United Kingdom':'🇬🇧', Belgium:'🇧🇪', Hungary:'🇭🇺',
  Netherlands:'🇳🇱', Italy:'🇮🇹', Azerbaijan:'🇦🇿',
  Singapore:'🇸🇬', Mexico:'🇲🇽', Brazil:'🇧🇷', Qatar:'🇶🇦',
  'Abu Dhabi':'🇦🇪', 'United Arab Emirates':'🇦🇪',
};
const getFlag = (loc='') => {
  const country = loc.split(', ').pop();
  return flagMap[country] || '🏁';
};

const RaceSelector = ({ races, selectedRound, onSelect }) => {
  const [open, setOpen] = useState(false);

  if (!races?.length) return null;

  const current = selectedRound
    ? races.find(r => r.round === selectedRound)
    : races.filter(r => r.done).slice(-1)[0]; // last completed

  const past     = races.filter(r => r.done);
  const upcoming = races.filter(r => !r.done);

  return (
    <div className="race-selector">
      <div className="rs-row">
        <div className="rs-label">VIEWING</div>

        <button className="rs-current" onClick={() => setOpen(o => !o)}>
          <span className="rs-flag">{current ? getFlag(current.location) : '🏁'}</span>
          <span className="rs-name">{current?.name || 'Select race…'}</span>
          <span className="rs-round">R{current?.round}</span>
          <span className={`rs-chevron ${open ? 'open' : ''}`}>▾</span>
        </button>

        {selectedRound !== null && (
          <button className="rs-reset" onClick={() => onSelect(null)}>
            ↩ CURRENT WEEKEND
          </button>
        )}
      </div>

      {open && (
        <div className="rs-dropdown">
          {past.length > 0 && (
            <div className="rs-group">
              <div className="rs-group-label">COMPLETED RACES — {past.length}</div>
              <div className="rs-list">
                {past.map(r => (
                  <button
                    key={r.round}
                    className={`rs-item rs-done ${selectedRound === r.round || (!selectedRound && r === current) ? 'active' : ''}`}
                    onClick={() => { onSelect(r.round); setOpen(false); }}
                  >
                    <span className="rs-item-flag">{getFlag(r.location)}</span>
                    <span className="rs-item-round">R{String(r.round).padStart(2,'0')}</span>
                    <span className="rs-item-name">{r.name.replace(' Grand Prix', ' GP')}</span>
                    <span className="rs-item-date">{r.date}</span>
                    <span className="rs-item-done">✓</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="rs-group">
              <div className="rs-group-label">UPCOMING</div>
              <div className="rs-list">
                {upcoming.slice(0, 4).map(r => (
                  <button
                    key={r.round}
                    className="rs-item rs-upcoming"
                    onClick={() => { onSelect(r.round); setOpen(false); }}
                  >
                    <span className="rs-item-flag">{getFlag(r.location)}</span>
                    <span className="rs-item-round">R{String(r.round).padStart(2,'0')}</span>
                    <span className="rs-item-name">{r.name.replace(' Grand Prix', ' GP')}</span>
                    <span className="rs-item-date">{r.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RaceSelector;
