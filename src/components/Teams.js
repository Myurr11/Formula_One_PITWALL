import React, { useState } from 'react';
import './Teams.css';

const teamsData = [
  {
    name: 'Mercedes-AMG Petronas',
    short: 'Mercedes',
    color: '#00D2BE',
    engine: 'Mercedes PU',
    base: 'Brackley, UK',
    chassis: 'W17',
    drivers: [
      { name: 'K. Antonelli', num: '12', pts: 131 },
      { name: 'G. Russell',   num: '63', pts: 88 },
    ],
    pts: 219,
    titles: 8,
    desc: 'Dominant in 2026. Rookie Kimi Antonelli has won four consecutive races, while George Russell\'s engine failure in Canada cost him dearly. The Silver Arrows lead both championships by a wide margin.',
  },
  {
    name: 'Scuderia Ferrari',
    short: 'Ferrari',
    color: '#E8002D',
    engine: 'Ferrari PU',
    base: 'Maranello, Italy',
    chassis: 'SF-26',
    drivers: [
      { name: 'C. Leclerc',  num: '16', pts: 75 },
      { name: 'L. Hamilton', num: '44', pts: 72 },
    ],
    pts: 147,
    titles: 16,
    desc: 'The Prancing Horse are second in both championships. Hamilton delivered his best Ferrari performance yet in Canada (P2), slashing his deficit to Leclerc to just 3 points in their intra-team battle.',
  },
  {
    name: 'McLaren F1 Team',
    short: 'McLaren',
    color: '#FF8000',
    engine: 'Mercedes PU',
    base: 'Woking, UK',
    chassis: 'MCL39',
    drivers: [
      { name: 'L. Norris',  num: '4',  pts: 58 },
      { name: 'O. Piastri', num: '81', pts: 48 },
    ],
    pts: 106,
    titles: 8,
    desc: 'Reigning constructors champions, McLaren are struggling with the 2026 reg reset. Norris retired in Canada and Piastri was off the pace. Third in the constructors, 113 points off Mercedes.',
  },
  {
    name: 'Red Bull Racing',
    short: 'Red Bull',
    color: '#3671C6',
    engine: 'Red Bull Ford',
    base: 'Milton Keynes, UK',
    chassis: 'RB21',
    drivers: [
      { name: 'M. Verstappen', num: '1',  pts: 43 },
      { name: 'I. Hadjar',     num: '6',  pts: 14 },
    ],
    pts: 57,
    titles: 6,
    desc: 'The four-time champions have suffered with their Red Bull Ford power unit in 2026. Verstappen took his first podium of the year in Canada (P3), a morale-boosting result after a tough start.',
  },
  {
    name: 'Alpine F1 Team',
    short: 'Alpine',
    color: '#0093CC',
    engine: 'Mercedes PU',
    base: 'Enstone, UK',
    chassis: 'A526',
    drivers: [
      { name: 'P. Gasly',      num: '10', pts: 20 },
      { name: 'F. Colapinto',  num: '43', pts: 15 },
    ],
    pts: 35,
    titles: 2,
    desc: 'Alpine are punching above their weight in 2026. Colapinto (on loan from Williams) has been a revelation, scoring back-to-back points in Miami and Canada. The team switches to Mercedes power this year.',
  },
  {
    name: 'Haas F1 Team',
    short: 'Haas',
    color: '#B6BABD',
    engine: 'Ferrari PU',
    base: 'Kannapolis, USA',
    chassis: 'VF-26',
    drivers: [
      { name: 'O. Bearman', num: '87', pts: 18 },
      { name: 'E. Ocon',    num: '31', pts: 1 },
    ],
    pts: 19,
    titles: 0,
    desc: 'Bearman has been consistently competitive in his sophomore season. Ocon joined from Alpine and is still finding his feet. The American squad sits seventh in the constructors standings.',
  },
  {
    name: 'Racing Bulls',
    short: 'Racing Bulls',
    color: '#6692FF',
    engine: 'Red Bull Ford',
    base: 'Faenza, Italy',
    chassis: 'VCARB02',
    drivers: [
      { name: 'L. Lawson',    num: '30', pts: 16 },
      { name: 'A. Lindblad',  num: '7',  pts: 5 },
    ],
    pts: 21,
    titles: 0,
    desc: 'The Red Bull junior team features Lawson (promoted from last year) and rookie Lindblad, who narrowly missed out on the 2025 F2 title. Lawson has been the stronger performer so far.',
  },
  {
    name: 'Williams Racing',
    short: 'Williams',
    color: '#00A3E0',
    engine: 'Mercedes PU',
    base: 'Grove, UK',
    chassis: 'FW47',
    drivers: [
      { name: 'C. Sainz', num: '55', pts: 6 },
      { name: 'A. Albon', num: '23', pts: 0 },
    ],
    pts: 6,
    titles: 7,
    desc: 'Sainz brought his experience from Ferrari and is extracting the maximum from the Williams. Colapinto has been loaned to Alpine for 2026, making way for Sainz to join Albon at Grove.',
  },
  {
    name: 'Audi F1 Team',
    short: 'Audi',
    color: '#C0C0C0',
    engine: 'Audi PU',
    base: 'Hinwil, Switzerland',
    chassis: 'A24',
    drivers: [
      { name: 'G. Bortoleto',  num: '5',  pts: 2 },
      { name: 'N. Hülkenberg', num: '27', pts: 0 },
    ],
    pts: 2,
    titles: 0,
    desc: 'Audi entered F1 as a works manufacturer in 2026, taking over Sauber\'s entry. Teething issues with their new PU have hampered both drivers, though Bortoleto has shown flashes of promise.',
  },
  {
    name: 'Aston Martin',
    short: 'Aston Martin',
    color: '#006F62',
    engine: 'Honda PU',
    base: 'Silverstone, UK',
    chassis: 'AMR26',
    drivers: [
      { name: 'F. Alonso', num: '14', pts: 0 },
      { name: 'L. Stroll', num: '18', pts: 0 },
    ],
    pts: 0,
    titles: 0,
    desc: 'Aston Martin have struggled enormously with the 2026 regs. Despite switching to Honda power, the AMR26 has been off the pace all season. Alonso is fighting hard but has yet to score in 2026.',
  },
  {
    name: 'Cadillac F1 Team',
    short: 'Cadillac',
    color: '#D4AF37',
    engine: 'Ferrari PU (customer)',
    base: 'Concord, USA',
    chassis: 'CADI001',
    drivers: [
      { name: 'V. Bottas',  num: '77', pts: 0 },
      { name: 'S. Perez',   num: '11', pts: 0 },
    ],
    pts: 0,
    titles: 0,
    desc: 'GM\'s new Cadillac F1 team made their debut in 2026, becoming the 11th constructor. Running customer Ferrari PUs while their in-house engine is developed, they are focused on finishing races and learning.',
  },
];

const Teams = () => {
  const [selected, setSelected] = useState(0);
  const team = teamsData[selected];

  return (
    <section className="teams-section" id="teams">
      <div className="section-inner">
        <div className="section-header" style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.5rem' }}>
          <h2 className="section-title">Team <span>Profiles</span></h2>
          <span className="section-meta">2026 GRID · 11 CONSTRUCTORS</span>
        </div>

        <div className="teams-layout">
          <div className="team-list">
            {teamsData.map((t, i) => (
              <button
                key={i}
                className={`team-btn ${selected === i ? 'active' : ''}`}
                onClick={() => setSelected(i)}
                style={{ '--team-color': t.color }}
              >
                <span className="team-btn-color" style={{ background: t.color }} />
                <span className="team-btn-name">{t.short}</span>
                <span className="team-btn-pts">{t.pts} PTS</span>
              </button>
            ))}
          </div>

          <div className="team-detail" style={{ '--team-color': team.color }}>
            <div className="team-detail-header">
              <div className="team-color-stripe" style={{ background: team.color }} />
              <div>
                <h3 className="team-full-name">{team.name}</h3>
                <p className="team-chassis">{team.chassis} · {team.engine} · {team.base}</p>
              </div>
              <div className="team-pts-badge">
                <span className="tpb-pts">{team.pts}</span>
                <span className="tpb-label">PTS</span>
              </div>
            </div>

            <p className="team-desc">{team.desc}</p>

            <div className="team-stats-row">
              <div className="team-stat">
                <span className="ts-label">WCC TITLES</span>
                <span className="ts-value">{team.titles}</span>
              </div>
              <div className="team-stat">
                <span className="ts-label">CHASSIS</span>
                <span className="ts-value">{team.chassis}</span>
              </div>
              <div className="team-stat">
                <span className="ts-label">ENGINE</span>
                <span className="ts-value">{team.engine}</span>
              </div>
              <div className="team-stat">
                <span className="ts-label">BASE</span>
                <span className="ts-value">{team.base}</span>
              </div>
            </div>

            <div className="team-drivers">
              <span className="td-label">DRIVERS — 2026</span>
              <div className="td-list">
                {team.drivers.map((d, i) => (
                  <div className="td-card" key={i} style={{ borderTopColor: team.color }}>
                    <span className="td-num">#{d.num}</span>
                    <span className="td-name">{d.name}</span>
                    <span className="td-pts">{d.pts} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Teams;
