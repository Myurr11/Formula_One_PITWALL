import React, { useState } from 'react';
import './Teams.css';

// ─── IMAGE URLs ────────────────────────────────────────────────────────────────
// To update: replace the URL string with any public image link.
// Right-click any photo online → "Copy image address" → paste here.

const F1  = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers';
const TM  = 'https://media.formula1.com/content/dam/fom-website/teams/2026';

const IMGS = {
  drivers: {
    'K. Antonelli':  `${F1}/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/2col/image.png`,
    'G. Russell':    `${F1}/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png`,
    'C. Leclerc':    `${F1}/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png`,
    'L. Hamilton':   `${F1}/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png`,
    'L. Norris':     `${F1}/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png`,
    'O. Piastri':    `${F1}/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png`,
    'M. Verstappen': `${F1}/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png`,
    'I. Hadjar':     `${F1}/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/2col/image.png`,
    'P. Gasly':      `${F1}/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png`,
    'F. Colapinto':  `${F1}/F/FRNCOL01_Franco_Colapinto/frncol01.png.transform/2col/image.png`,
    'O. Bearman':    `${F1}/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col/image.png`,
    'E. Ocon':       `${F1}/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png`,
    'L. Lawson':     `${F1}/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/2col/image.png`,
    'A. Lindblad':   `${F1}/A/ARVLIN01_Arvid_Lindblad/arvlin01.png.transform/2col/image.png`,
    'C. Sainz':      `${F1}/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png`,
    'A. Albon':      `${F1}/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col/image.png`,
    'G. Bortoleto':  `${F1}/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/2col/image.png`,
    'N. Hülkenberg': `${F1}/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png`,
    'F. Alonso':     `${F1}/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png`,
    'L. Stroll':     `${F1}/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col/image.png`,
    'V. Bottas':     `${F1}/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/2col/image.png`,
    'S. Perez':      `${F1}/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png`,
  },
  logos: {
    'Mercedes':     `${TM}/mercedes.png.transform/2col/image.png`,
    'Ferrari':      `${TM}/ferrari.png.transform/2col/image.png`,
    'McLaren':      `${TM}/mclaren.png.transform/2col/image.png`,
    'Red Bull':     `${TM}/red-bull-racing.png.transform/2col/image.png`,
    'Alpine':       `${TM}/alpine.png.transform/2col/image.png`,
    'Haas':         `${TM}/haas.png.transform/2col/image.png`,
    'Racing Bulls': `${TM}/racing-bulls.png.transform/2col/image.png`,
    'Williams':     `${TM}/williams.png.transform/2col/image.png`,
    'Aston Martin': `${TM}/aston-martin.png.transform/2col/image.png`,
    'Audi':         `${TM}/audi.png.transform/2col/image.png`,
    'Cadillac':     `${TM}/cadillac.png.transform/2col/image.png`,
  },
};

const TEAMS = [
  { name:'Mercedes-AMG Petronas', short:'Mercedes', color:'#00D2BE', pos:1, engine:'Mercedes PU', base:'Brackley, UK', chassis:'W17', titles:8, pts:219, drivers:[{name:'K. Antonelli',num:'12',pts:131,nat:'ITA'},{name:'G. Russell',num:'63',pts:88,nat:'GBR'}], desc:'Dominant in 2026 with four consecutive wins from rookie Antonelli. The Silver Arrows lead both championships by a wide margin despite Russell\'s Canada engine failure.' },
  { name:'Scuderia Ferrari', short:'Ferrari', color:'#E8002D', pos:2, engine:'Ferrari PU', base:'Maranello, Italy', chassis:'SF-26', titles:16, pts:187, drivers:[{name:'L. Hamilton',num:'44',pts:102,nat:'GBR'},{name:'C. Leclerc',num:'16',pts:85,nat:'MON'}], desc:'Hamilton\'s Monaco P2 vaulted him above Leclerc in the championship. The Ferrari duo are closing in on Mercedes in the constructors\' fight.' },
  { name:'McLaren F1 Team', short:'McLaren', color:'#FF8000', pos:3, engine:'Mercedes PU', base:'Woking, UK', chassis:'MCL39', titles:8, pts:158, drivers:[{name:'L. Norris',num:'4',pts:98,nat:'GBR'},{name:'O. Piastri',num:'81',pts:60,nat:'AUS'}], desc:'Norris took a composed Monaco victory to move to P3 in the championship. The reigning constructors\' champions are firmly in the title fight.' },
  { name:'Red Bull Racing', short:'Red Bull', color:'#3671C6', pos:4, engine:'Red Bull Ford', base:'Milton Keynes, UK', chassis:'RB21', titles:6, pts:63, drivers:[{name:'M. Verstappen',num:'1',pts:49,nat:'NED'},{name:'I. Hadjar',num:'6',pts:14,nat:'FRA'}], desc:'Four-time champions fighting a power unit deficit in 2026. Verstappen is still searching for his first win of the season after six rounds.' },
  { name:'Alpine F1 Team', short:'Alpine', color:'#0093CC', pos:5, engine:'Mercedes PU', base:'Enstone, UK', chassis:'A526', titles:2, pts:35, drivers:[{name:'P. Gasly',num:'10',pts:20,nat:'FRA'},{name:'F. Colapinto',num:'43',pts:15,nat:'ARG'}], desc:'Best-of-the-rest through six rounds. Colapinto on loan from Williams has impressed with consistent points finishes alongside Gasly.' },
  { name:'Racing Bulls', short:'Racing Bulls', color:'#6692FF', pos:6, engine:'Red Bull Ford', base:'Faenza, Italy', chassis:'VCARB02', titles:0, pts:21, drivers:[{name:'L. Lawson',num:'30',pts:16,nat:'NZL'},{name:'A. Lindblad',num:'7',pts:5,nat:'GBR'}], desc:'An all-new lineup for 2026. Lawson leads the points charge while rookie Lindblad continues to develop round by round.' },
  { name:'Haas F1 Team', short:'Haas', color:'#B6BABD', pos:7, engine:'Ferrari PU', base:'Kannapolis, USA', chassis:'VF-26', titles:0, pts:19, drivers:[{name:'O. Bearman',num:'87',pts:18,nat:'GBR'},{name:'E. Ocon',num:'31',pts:1,nat:'FRA'}], desc:'Bearman continues his impressive sophomore campaign. Ocon joined from Alpine and is still finding his feet with the American squad.' },
  { name:'Williams Racing', short:'Williams', color:'#00A3E0', pos:8, engine:'Mercedes PU', base:'Grove, UK', chassis:'FW47', titles:7, pts:6, drivers:[{name:'C. Sainz',num:'55',pts:6,nat:'ESP'},{name:'A. Albon',num:'23',pts:0,nat:'THA'}], desc:'Sainz brings Ferrari pedigree to Williams. Colapinto was loaned to Alpine making way for the Spaniard alongside Albon.' },
  { name:'Audi F1 Team', short:'Audi', color:'#C0C0C0', pos:9, engine:'Audi PU', base:'Hinwil, Switzerland', chassis:'A24', titles:0, pts:2, drivers:[{name:'G. Bortoleto',num:'5',pts:2,nat:'BRA'},{name:'N. Hülkenberg',num:'27',pts:0,nat:'GER'}], desc:'Audi\'s works F1 entry is a long-term project. Bortoleto has shown raw speed; the power unit needs continued development.' },
  { name:'Aston Martin', short:'Aston Martin', color:'#006F62', pos:10, engine:'Honda PU', base:'Silverstone, UK', chassis:'AMR26', titles:0, pts:0, drivers:[{name:'F. Alonso',num:'14',pts:0,nat:'ESP'},{name:'L. Stroll',num:'18',pts:0,nat:'CAN'}], desc:'A difficult season with the 2026 regs. Yet to score in six races — Alonso is fighting the car as much as the competition.' },
  { name:'Cadillac F1 Team', short:'Cadillac', color:'#D4AF37', pos:11, engine:'Ferrari PU', base:'Concord, USA', chassis:'CADI001', titles:0, pts:0, drivers:[{name:'V. Bottas',num:'77',pts:0,nat:'FIN'},{name:'S. Perez',num:'11',pts:0,nat:'MEX'}], desc:'GM\'s grand return to F1 as the 11th constructor. Running customer Ferrari power while their in-house Cadillac engine is readied.' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const DriverPhoto = ({ name, color, cls = '' }) => {
  const [failed, setFailed] = useState(false);
  const src = IMGS.drivers[name];
  if (src && !failed) {
    return <img src={src} alt={name} className={`t-photo ${cls}`} onError={() => setFailed(true)} />;
  }
  return (
    <div className={`t-photo t-photo-fb ${cls}`} style={{ color }}>
      {name.split(' ').pop()?.slice(0, 3).toUpperCase()}
    </div>
  );
};

const Logo = ({ short, color, big = false }) => {
  const [failed, setFailed] = useState(false);
  const src = IMGS.logos[short];
  if (src && !failed) {
    return <img src={src} alt={short} className={big ? 't-logo-big' : 't-logo'} onError={() => setFailed(true)} />;
  }
  return <span className="t-logo-text" style={{ color }}>{short.slice(0, 3).toUpperCase()}</span>;
};

// ─── COLLAPSED TEAM CARD ─────────────────────────────────────────────────────
const TeamCard = ({ team, isOpen, onToggle }) => (
  <div
    className={`t-card ${isOpen ? 't-open' : ''}`}
    style={{ '--tc': team.color }}
    onClick={onToggle}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onToggle()}
  >
    <div className="t-top-bar" style={{ background: team.color }} />

    <div className="t-card-inner">
      {/* Left: info */}
      <div className="t-info">
        <div className="t-info-head">
          <span className="t-pos">P{team.pos}</span>
          <Logo short={team.short} color={team.color} />
        </div>
        <h3 className="t-team-name">{team.name}</h3>
        <p className="t-chassis-line">{team.chassis} · {team.base}</p>
        <div className="t-pts-row">
          <span className="t-pts" style={{ color: team.color }}>{team.pts}</span>
          <span className="t-pts-lbl">PTS</span>
        </div>
        <div className="t-driver-list">
          {team.drivers.map(d => (
            <div key={d.num} className="t-driver-item">
              <span className="t-driver-num" style={{ color: team.color }}>#{d.num}</span>
              <span className="t-driver-name-sm">{d.name}</span>
              <span className="t-driver-pts-sm">{d.pts} pts</span>
            </div>
          ))}
        </div>
        <div className="t-cta">{isOpen ? '▲ CLOSE' : '▼ FULL PROFILE'}</div>
      </div>

      {/* Right: two driver photos side by side */}
      <div className="t-photos">
        {team.drivers.map((d, i) => (
          <div key={i} className="t-photo-slot">
            <DriverPhoto name={d.name} color={team.color} />
            <div className="t-photo-overlay">
              <span className="t-photo-num" style={{ color: team.color }}>#{d.num}</span>
              <span className="t-photo-surname">{d.name.split('. ')[1] || d.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── FULL-WIDTH EXPANDED PANEL ────────────────────────────────────────────────
const ExpandedPanel = ({ team }) => {
  const maxPts = team.drivers[0]?.pts || 1;
  return (
    <div className="t-panel" style={{ '--tc': team.color }}>
      <div className="t-panel-accent" style={{ background: team.color }} />
      <div className="t-panel-inner">

        {/* Left: logo + description + stats */}
        <div className="t-panel-info">
          <div className="t-panel-logo">
            <Logo short={team.short} color={team.color} big />
          </div>
          <p className="t-panel-desc">{team.desc}</p>
          <div className="t-panel-stats">
            {[
              { l:'WCC TITLES', v: team.titles },
              { l:'CHASSIS',    v: team.chassis },
              { l:'ENGINE',     v: team.engine  },
              { l:'BASE',       v: team.base    },
            ].map(s => (
              <div key={s.l} className="t-panel-stat">
                <span className="t-panel-stat-l">{s.l}</span>
                <span className="t-panel-stat-v">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: two driver portrait cards */}
        <div className="t-panel-drivers">
          {team.drivers.map((d, i) => (
            <div key={i} className="t-panel-driver">
              {/* Full portrait — center 20% shows face+chest not just scalp */}
              <div className="t-panel-photo-wrap">
                <DriverPhoto name={d.name} color={team.color} cls="t-panel-photo" />
                <div className="t-panel-photo-fade" />
              </div>
              <div className="t-panel-driver-meta">
                <div className="t-panel-driver-top">
                  <span className="t-panel-driver-num" style={{ color: team.color }}>#{d.num}</span>
                  <span className="t-panel-driver-nat">{d.nat}</span>
                </div>
                <span className="t-panel-driver-name">{d.name}</span>
                <div className="t-panel-bar-row">
                  <div className="t-panel-bar-bg">
                    <div className="t-panel-bar-fill"
                      style={{ width:`${(d.pts/maxPts)*100}%`, background: team.color }} />
                  </div>
                  <span className="t-panel-driver-pts">{d.pts} <span>PTS</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
const Teams = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = i => setOpenIdx(prev => prev === i ? null : i);

  // Build rows of 2 cards
  const rows = [];
  for (let i = 0; i < TEAMS.length; i += 2) {
    rows.push(TEAMS.slice(i, i + 2));
  }

  return (
    <section className="teams-section" id="teams">
      <div className="section-inner">
        <div className="section-header" style={{ marginBottom:'3rem', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:'1.5rem' }}>
          <h2 className="section-title">Team <span>Profiles</span></h2>
          <span className="section-meta">2026 GRID · {TEAMS.length} CONSTRUCTORS</span>
        </div>

        <div className="t-rows">
          {rows.map((rowTeams, rowIdx) => {
            const rowStart = rowIdx * 2;
            // Which (if any) card in this row is open?
            const openInRow = openIdx !== null && openIdx >= rowStart && openIdx < rowStart + 2
              ? TEAMS[openIdx] : null;

            return (
              <div key={rowIdx} className="t-row-wrap">
                {/* 2-card row */}
                <div className="t-row">
                  {rowTeams.map((team, i) => (
                    <TeamCard
                      key={team.short}
                      team={team}
                      isOpen={openIdx === rowStart + i}
                      onToggle={() => toggle(rowStart + i)}
                    />
                  ))}
                  {/* Filler if odd number of teams */}
                  {rowTeams.length < 2 && <div className="t-card-filler" />}
                </div>

                {/* Full-width expanded panel — appears below the row that contains the open card */}
                {openInRow && (
                  <div className="t-panel-row">
                    <ExpandedPanel team={openInRow} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Teams;
