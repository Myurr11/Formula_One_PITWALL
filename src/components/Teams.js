import React, { useState } from 'react';
import './Teams.css';

const F1_CDN = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers';
const TEAM_CDN = 'https://media.formula1.com/content/dam/fom-website/teams/2026';

// Exact URL pattern: {F1_CDN}/{FirstLetter}/{CODE_FirstName_LastName}/{code}.png.transform/1col/image.png
const DRIVER_IMGS = {
  'K. Antonelli':  `${F1_CDN}/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/2col/image.png`,
  'G. Russell':    `${F1_CDN}/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png`,
  'C. Leclerc':    `${F1_CDN}/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png`,
  'L. Hamilton':   `${F1_CDN}/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png`,
  'L. Norris':     `${F1_CDN}/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png`,
  'O. Piastri':    `${F1_CDN}/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png`,
  'M. Verstappen': `${F1_CDN}/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png`,
  'I. Hadjar':     `${F1_CDN}/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/2col/image.png`,
  'P. Gasly':      `${F1_CDN}/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png`,
  'F. Colapinto':  `${F1_CDN}/F/FRNCOL01_Franco_Colapinto/frncol01.png.transform/2col/image.png`,
  'O. Bearman':    `${F1_CDN}/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col/image.png`,
  'E. Ocon':       `${F1_CDN}/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png`,
  'L. Lawson':     `${F1_CDN}/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/2col/image.png`,
  'A. Lindblad':   `${F1_CDN}/A/ARVLIN01_Arvid_Lindblad/arvlin01.png.transform/2col/image.png`,
  'C. Sainz':      `${F1_CDN}/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png`,
  'A. Albon':      `${F1_CDN}/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col/image.png`,
  'G. Bortoleto':  `${F1_CDN}/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/2col/image.png`,
  'N. Hülkenberg': `${F1_CDN}/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png`,
  'F. Alonso':     `${F1_CDN}/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png`,
  'L. Stroll':     `${F1_CDN}/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col/image.png`,
  'V. Bottas':     `${F1_CDN}/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/2col/image.png`,
  'S. Perez':      `${F1_CDN}/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png`,
};

// Team logos from F1 CDN
const TEAM_LOGOS = {
  'Mercedes':      `${TEAM_CDN}/mercedes.png.transform/2col/image.png`,
  'Ferrari':       `${TEAM_CDN}/ferrari.png.transform/2col/image.png`,
  'McLaren':       `${TEAM_CDN}/mclaren.png.transform/2col/image.png`,
  'Red Bull':      `${TEAM_CDN}/red-bull-racing.png.transform/2col/image.png`,
  'Alpine':        `${TEAM_CDN}/alpine.png.transform/2col/image.png`,
  'Haas':          `${TEAM_CDN}/haas.png.transform/2col/image.png`,
  'Racing Bulls':  `${TEAM_CDN}/racing-bulls.png.transform/2col/image.png`,
  'Williams':      `${TEAM_CDN}/williams.png.transform/2col/image.png`,
  'Aston Martin':  `${TEAM_CDN}/aston-martin.png.transform/2col/image.png`,
  'Audi':          `${TEAM_CDN}/audi.png.transform/2col/image.png`,
  'Cadillac':      `${TEAM_CDN}/cadillac.png.transform/2col/image.png`,
};

const DriverCard = ({ driver, teamColor }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const imgUrl = DRIVER_IMGS[driver.name];

  return (
    <div className="td-card" style={{ '--tc': teamColor }}>
      <div className="td-img-wrap">
        {imgUrl && !imgFailed ? (
          <img
            src={imgUrl}
            alt={driver.name}
            className="td-driver-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="td-driver-placeholder">
            <span>{driver.name.split(' ').map(p => p[0]).join('')}</span>
          </div>
        )}
      </div>
      <div className="td-driver-meta">
        <span className="td-num" style={{ color: teamColor }}>#{driver.num}</span>
        <span className="td-name">{driver.name}</span>
        <span className="td-pts">{driver.pts} PTS</span>
      </div>
    </div>
  );
};

const teamsData = [
  {
    name: 'Mercedes-AMG Petronas', short: 'Mercedes', color: '#00D2BE',
    engine: 'Mercedes PU', base: 'Brackley, UK', chassis: 'W17',
    drivers: [
      { name: 'K. Antonelli', num: '12', pts: 131 },
      { name: 'G. Russell',   num: '63', pts: 88 },
    ],
    pts: 219, titles: 8,
    desc: 'Dominant in 2026. Rookie Kimi Antonelli has won four consecutive races — China, Japan, Miami and Canada — while Russell\'s engine failure in Canada cost him the lead. The Silver Arrows lead both championships by a wide margin.',
  },
  {
    name: 'Scuderia Ferrari', short: 'Ferrari', color: '#E8002D',
    engine: 'Ferrari PU', base: 'Maranello, Italy', chassis: 'SF-26',
    drivers: [
      { name: 'C. Leclerc',  num: '16', pts: 75 },
      { name: 'L. Hamilton', num: '44', pts: 72 },
    ],
    pts: 147, titles: 16,
    desc: 'The Prancing Horse are second in both championships. Hamilton delivered his best Ferrari performance yet in Canada (P2), slashing his deficit to Leclerc to just 3 points in their intense intra-team battle.',
  },
  {
    name: 'McLaren F1 Team', short: 'McLaren', color: '#FF8000',
    engine: 'Mercedes PU', base: 'Woking, UK', chassis: 'MCL39',
    drivers: [
      { name: 'L. Norris',  num: '4',  pts: 58 },
      { name: 'O. Piastri', num: '81', pts: 48 },
    ],
    pts: 106, titles: 8,
    desc: 'Reigning constructors champions, McLaren are struggling with the 2026 reg reset. Norris retired in Canada and Piastri was off the pace. Third in the constructors, 113 points off Mercedes.',
  },
  {
    name: 'Red Bull Racing', short: 'Red Bull', color: '#3671C6',
    engine: 'Red Bull Ford', base: 'Milton Keynes, UK', chassis: 'RB21',
    drivers: [
      { name: 'M. Verstappen', num: '1', pts: 43 },
      { name: 'I. Hadjar',     num: '6', pts: 14 },
    ],
    pts: 57, titles: 6,
    desc: 'The four-time champions have suffered with their Red Bull Ford power unit. Verstappen took his first podium of the year in Canada (P3) — a morale-boosting result after a tough start to 2026.',
  },
  {
    name: 'Alpine F1 Team', short: 'Alpine', color: '#0093CC',
    engine: 'Mercedes PU', base: 'Enstone, UK', chassis: 'A526',
    drivers: [
      { name: 'P. Gasly',     num: '10', pts: 20 },
      { name: 'F. Colapinto', num: '43', pts: 15 },
    ],
    pts: 35, titles: 2,
    desc: 'Alpine are punching above their weight in 2026. Colapinto (on loan from Williams) has been a revelation, scoring back-to-back points in Miami and Canada. The team switched to Mercedes power this year.',
  },
  {
    name: 'Haas F1 Team', short: 'Haas', color: '#B6BABD',
    engine: 'Ferrari PU', base: 'Kannapolis, USA', chassis: 'VF-26',
    drivers: [
      { name: 'O. Bearman', num: '87', pts: 18 },
      { name: 'E. Ocon',    num: '31', pts: 1 },
    ],
    pts: 19, titles: 0,
    desc: 'Bearman has been consistently competitive in his sophomore season. Ocon joined from Alpine and is still finding his feet. The American squad sits seventh in the constructors standings.',
  },
  {
    name: 'Racing Bulls', short: 'Racing Bulls', color: '#6692FF',
    engine: 'Red Bull Ford', base: 'Faenza, Italy', chassis: 'VCARB02',
    drivers: [
      { name: 'L. Lawson',   num: '30', pts: 16 },
      { name: 'A. Lindblad', num: '7',  pts: 5 },
    ],
    pts: 21, titles: 0,
    desc: 'The Red Bull junior team features Lawson and rookie Lindblad, who narrowly missed the 2025 F2 title. Lawson has been the stronger performer through the opening five rounds.',
  },
  {
    name: 'Williams Racing', short: 'Williams', color: '#00A3E0',
    engine: 'Mercedes PU', base: 'Grove, UK', chassis: 'FW47',
    drivers: [
      { name: 'C. Sainz', num: '55', pts: 6 },
      { name: 'A. Albon', num: '23', pts: 0 },
    ],
    pts: 6, titles: 7,
    desc: 'Sainz brings Ferrari experience to Williams. Colapinto has been loaned to Alpine for 2026, making room for Sainz alongside Albon. The team is fighting in the midfield.',
  },
  {
    name: 'Audi F1 Team', short: 'Audi', color: '#C0C0C0',
    engine: 'Audi PU', base: 'Hinwil, Switzerland', chassis: 'A24',
    drivers: [
      { name: 'G. Bortoleto',  num: '5',  pts: 2 },
      { name: 'N. Hülkenberg', num: '27', pts: 0 },
    ],
    pts: 2, titles: 0,
    desc: 'Audi entered F1 as a works manufacturer in 2026, taking over Sauber\'s entry. Teething issues with their new PU have hampered both drivers, though Bortoleto has shown genuine promise.',
  },
  {
    name: 'Aston Martin', short: 'Aston Martin', color: '#006F62',
    engine: 'Honda PU', base: 'Silverstone, UK', chassis: 'AMR26',
    drivers: [
      { name: 'F. Alonso', num: '14', pts: 0 },
      { name: 'L. Stroll', num: '18', pts: 0 },
    ],
    pts: 0, titles: 0,
    desc: 'Aston Martin have struggled enormously with the 2026 regs. Despite switching to Honda power, the AMR26 has been off the pace all season. Alonso is fighting hard but is yet to score.',
  },
  {
    name: 'Cadillac F1 Team', short: 'Cadillac', color: '#D4AF37',
    engine: 'Ferrari PU', base: 'Concord, USA', chassis: 'CADI001',
    drivers: [
      { name: 'V. Bottas', num: '77', pts: 0 },
      { name: 'S. Perez',  num: '11', pts: 0 },
    ],
    pts: 0, titles: 0,
    desc: 'GM\'s new Cadillac F1 team made their debut in 2026 as the 11th constructor. Running customer Ferrari PUs while their in-house engine is developed, they are focused on learning and finishing races.',
  },
];

const TeamLogo = ({ short, color }) => {
  const [failed, setFailed] = useState(false);
  const src = TEAM_LOGOS[short];
  if (!src || failed) {
    return (
      <div className="team-logo-fallback" style={{ borderColor: color }}>
        <span style={{ color }}>{short.slice(0, 3).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={short}
      className="team-logo-img"
      onError={() => setFailed(true)}
    />
  );
};

const Teams = () => {
  const [selected, setSelected] = useState(0);
  const team = teamsData[selected];

  return (
    <section className="teams-section" id="teams">
      <div className="section-inner">
        <div className="section-header" style={{ marginBottom:'3rem', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:'1.5rem' }}>
          <h2 className="section-title">Team <span>Profiles</span></h2>
          <span className="section-meta">2026 GRID · 11 CONSTRUCTORS</span>
        </div>

        <div className="teams-layout">
          {/* Sidebar */}
          <div className="team-list">
            {teamsData.map((t, i) => (
              <button key={i} className={`team-btn ${selected===i?'active':''}`}
                onClick={() => setSelected(i)} style={{'--team-color': t.color}}>
                <span className="team-btn-color" style={{background: t.color}} />
                <span className="team-btn-name">{t.short}</span>
                <span className="team-btn-pts">{t.pts} PTS</span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="team-detail" style={{'--team-color': team.color}}>
            {/* Header with logo */}
            <div className="team-detail-header">
              <div className="team-color-stripe" style={{background: team.color}} />
              <div className="team-header-logo">
                <TeamLogo short={team.short} color={team.color} />
              </div>
              <div className="team-header-text">
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

            {/* Driver cards with photos */}
            <div className="team-drivers">
              <span className="td-label">DRIVERS — 2026</span>
              <div className="td-list">
                {team.drivers.map((d, i) => (
                  <DriverCard key={i} driver={d} teamColor={team.color} />
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
