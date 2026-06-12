import React from 'react';
import './Paddock.css';

const tagColors = {
  hot:'#E8002D', news:'#0093CC', debut:'#D4AF37',
  official:'#00D2BE', preview:'#FF8000', technical:'#9B59B6',
  championship:'#00D2BE', constructor:'#FF8000', 'race result':'#E8002D',
  'race control':'#E8002D', incidents:'#ffcc00', 'next race':'#FF8000',
  calendar:'#00D2BE', 'fastest lap':'#9B59B6',
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
};

const getTagColor = (tag, type) => {
  return tagColors[tag?.toLowerCase()] || tagColors[type?.toLowerCase()] || '#888';
};

const PaddockIntel = ({ paddock, lastResult }) => {
  const news        = paddock?.news || [];
  const podium      = lastResult?.podium || lastResult?.top10?.slice(0,3) || [];
  const top5        = lastResult?.top10?.slice(0,5) || lastResult?.podium || [];
  const retirements = lastResult?.retirements || lastResult?.dnfs || [];
  const raceName    = lastResult?.raceName || 'Last Race';
  const raceCircuit = lastResult?.circuit || '';
  const raceRound   = lastResult?.round || '';
  const fastest     = lastResult?.fastestLap;
  const sprint      = lastResult?.sprintWinner;
  const pole        = lastResult?.polePosition;

  const p1 = podium.find(p => p.pos === 1) || podium[0];
  const p2 = podium.find(p => p.pos === 2) || podium[1];
  const p3 = podium.find(p => p.pos === 3) || podium[2];

  return (
    <section className="paddock-section" id="paddock">
      <div className="section-inner">
        <div className="paddock-grid">

          {/* ── Intel Feed ── */}
          <div className="intel-feed">
            <div className="section-header" style={{ marginBottom:'2rem', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:'1.5rem' }}>
              <h2 className="section-title">Paddock <span>Intel</span></h2>
              <span className="section-meta">LIVE · RACE DATA</span>
            </div>

            <div className="intel-list">
              {/* Loading skeletons */}
              {news.length === 0 && [1,2,3].map(i => (
                <div className="intel-card intel-skeleton" key={i}>
                  <div className="skeleton-tag" />
                  <div className="skeleton-headline" />
                  <div className="skeleton-body" />
                </div>
              ))}

              {news.map((item, i) => {
                const color = getTagColor(item.tag, item.type);
                return (
                  <div className="intel-card" key={i}>
                    <div className="intel-card-top">
                      <span className="intel-type" style={{ color, borderColor: color }}>
                        {item.type}
                      </span>
                      {item.timestamp && (
                        <span className="intel-time">{timeAgo(item.timestamp)}</span>
                      )}
                    </div>
                    <h3 className="intel-headline">
                      {item.link
                        ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="intel-link">{item.headline}</a>
                        : item.headline
                      }
                    </h3>
                    <p className="intel-body">{item.body}</p>
                    {item.source && (
                      <span className="intel-source">{item.source}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="intel-source-note">
              Live news from Autosport · RaceFans · Motorsport.com RSS feeds · Updates every 5 min
            </p>
          </div>

          {/* ── Last Race Panel ── */}
          <div className="last-race-panel">
            <div className="panel-header">
              <span className="panel-label">LAST RACE — {raceName.toUpperCase()}</span>
              <span className="panel-sub">{raceCircuit}{raceRound ? ` · R${raceRound} of 22` : ''}</span>
            </div>

            {/* Podium */}
            {p1 && p2 && p3 && (
              <div className="podium-display">
                <div className="podium-step p2">
                  <div className="podium-driver">
                    <span className="podium-pos">P2</span>
                    <span className="podium-name">{p2.driver}</span>
                    <span className="podium-team" style={{color:p2.color||'#fff'}}>{p2.team}</span>
                  </div>
                  <div className="podium-block h2" />
                </div>
                <div className="podium-step p1">
                  <div className="podium-driver">
                    <span className="podium-trophy">🏆</span>
                    <span className="podium-pos p1-pos">P1</span>
                    <span className="podium-name">{p1.driver}</span>
                    <span className="podium-team" style={{color:p1.color||'#fff'}}>{p1.team}</span>
                  </div>
                  <div className="podium-block h1" />
                </div>
                <div className="podium-step p3">
                  <div className="podium-driver">
                    <span className="podium-pos">P3</span>
                    <span className="podium-name">{p3.driver}</span>
                    <span className="podium-team" style={{color:p3.color||'#fff'}}>{p3.team}</span>
                  </div>
                  <div className="podium-block h3" />
                </div>
              </div>
            )}

            {/* Top 5 */}
            <div className="results-list">
              {top5.map((r) => (
                <div className="result-row" key={r.pos}>
                  <span className="result-pos">P{r.pos}</span>
                  <span className="result-driver">{r.driver}</span>
                  <span className="result-team-dot" style={{background:r.color||'#888'}} />
                  <span className="result-time">{r.gap ? `+${r.gap}` : (r.pos===1 ? 'WINNER' : r.time||'—')}</span>
                </div>
              ))}
            </div>

            {/* DNF Table */}
            {retirements.length > 0 && (
              <div className="dnf-section">
                <div className="dnf-section-header">
                  <span className="dnf-section-title">RETIREMENTS</span>
                  <span className="dnf-count">{retirements.length} DNF{retirements.length > 1 ? 's' : ''}</span>
                </div>
                <div className="dnf-table">
                  {retirements.map((d, i) => (
                    <div className="dnf-table-row" key={i}>
                      <span className="dnf-dot" style={{background: d.color || '#888'}} />
                      <span className="dnf-driver-name">{d.driver}</span>
                      <span className="dnf-reason">{d.reason}</span>
                      {d.lap && <span className="dnf-lap">L{d.lap}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast facts */}
            <div className="fast-facts">
              {fastest && (
                <div className="fact-item">
                  <span className="fact-label">FASTEST LAP</span>
                  <span className="fact-value" style={{color:'var(--red)'}}>
                    {fastest.driver?.split(' ').pop()}
                  </span>
                  <span className="fact-who">{fastest.time}{fastest.lap ? ` · Lap ${fastest.lap}` : ''}</span>
                </div>
              )}
              {pole && (
                <div className="fact-item">
                  <span className="fact-label">POLE POSITION</span>
                  <span className="fact-value" style={{color:'var(--red)'}}>
                    {pole.split(' ').pop()}
                  </span>
                  <span className="fact-who">Qualifying</span>
                </div>
              )}
              {sprint && (
                <div className="fact-item">
                  <span className="fact-label">SPRINT WINNER</span>
                  <span className="fact-value" style={{color:'#FF8000'}}>
                    {sprint.split(' ').pop()}
                  </span>
                  <span className="fact-who">Sprint Race</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PaddockIntel;
