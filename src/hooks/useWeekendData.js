import { useState, useEffect, useCallback, useRef } from 'react';

const OPENF1 = 'https://api.openf1.org/v1';
const ERGAST  = 'https://api.jolpi.ca/ergast/f1';

async function safeGet(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    const text = await r.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  } catch { return null; }
}

const TEAM_COLORS = {
  mercedes:'#00D2BE', ferrari:'#E8002D', mclaren:'#FF8000',
  'red bull':'#3671C6','red bull racing':'#3671C6', alpine:'#0093CC',
  'racing bulls':'#6692FF', haas:'#B6BABD', williams:'#00A3E0',
  'aston martin':'#006F62', audi:'#C0C0C0', cadillac:'#D4AF37',
};
const getColor = (team = '') =>
  TEAM_COLORS[team?.toLowerCase()] ||
  Object.entries(TEAM_COLORS).find(([k]) => team?.toLowerCase().includes(k))?.[1] ||
  '#888';

// ─── Map raw OpenF1 session_type → display config ────────────────────────────
// OpenF1 uses: "Practice 1","Practice 2","Practice 3","Qualifying",
//              "Sprint","Sprint Qualifying","Race"
// But sometimes session_name = "Practice" (not numbered) — we number them ourselves
export const SESSION_CONFIG = {
  'Practice 1':        { short:'FP1', label:'Free Practice 1',   order:1, icon:'🔧' },
  'Practice 2':        { short:'FP2', label:'Free Practice 2',   order:2, icon:'🔧' },
  'Practice 3':        { short:'FP3', label:'Free Practice 3',   order:3, icon:'🔧' },
  'Sprint Qualifying': { short:'SQ',  label:'Sprint Qualifying', order:4, icon:'⚡' },
  'Sprint':            { short:'SPR', label:'Sprint Race',       order:5, icon:'🏎' },
  'Qualifying':        { short:'Q',   label:'Qualifying',        order:6, icon:'⏱' },
  'Race':              { short:'R',   label:'Grand Prix',        order:7, icon:'🏆' },
};

// Fix sessions where OpenF1 returns "Practice" without a number
function fixSessionType(sessions) {
  let practiceCount = 0;
  return sessions
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
    .map(s => {
      let type = s.session_type;
      // OpenF1 sometimes sends session_name only as "Practice"
      if (type === 'Practice' || (s.session_name === 'Practice' && !type?.includes(' '))) {
        practiceCount++;
        type = `Practice ${practiceCount}`;
      }
      return { ...s, session_type: type };
    });
}

function getSessionStatus(dateStart, dateEnd) {
  const now   = new Date();
  const start = new Date(dateStart);
  const end   = new Date(dateEnd);
  if (now < start)            return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'completed';
}

export function formatLapTime(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

export function formatGap(gap) {
  if (gap === null || gap === undefined) return '—';
  if (gap === 0) return 'LEADER';
  if (typeof gap === 'string') return gap.startsWith('+') ? gap : `+${gap}`;
  return `+${Number(gap).toFixed(3)}s`;
}

// ─── Fetch session result data ────────────────────────────────────────────────
async function fetchSessionResult(sessionKey) {
  const [drivers, positions, laps, intervals, pits] = await Promise.all([
    safeGet(`${OPENF1}/drivers?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/position?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/laps?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/intervals?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/pit?session_key=${sessionKey}`),
  ]);

  if (!drivers || !Array.isArray(drivers) || drivers.length === 0) return null;

  // Driver map
  const driverMap = {};
  drivers.forEach(d => {
    driverMap[d.driver_number] = {
      number:  d.driver_number,
      code:    d.name_acronym || String(d.driver_number),
      name:    d.full_name || d.name_acronym || `#${d.driver_number}`,
      team:    d.team_name || 'Unknown',
      color:   d.team_colour ? `#${d.team_colour}` : getColor(d.team_name || ''),
    };
  });

  // Latest position per driver
  const latestPos = {};
  if (positions && Array.isArray(positions)) {
    positions.forEach(p => {
      const k = p.driver_number;
      if (!latestPos[k] || new Date(p.date) > new Date(latestPos[k].date)) {
        latestPos[k] = p;
      }
    });
  }

  // Best lap per driver
  const bestLaps = {};
  let maxLap = 0;
  if (laps && Array.isArray(laps)) {
    laps.forEach(l => {
      if (l.lap_number > maxLap) maxLap = l.lap_number;
      if (!l.lap_duration || l.lap_duration <= 0) return;
      const k = l.driver_number;
      if (!bestLaps[k] || l.lap_duration < bestLaps[k].duration) {
        bestLaps[k] = {
          duration:  l.lap_duration,
          formatted: formatLapTime(l.lap_duration),
          lapNumber: l.lap_number,
          compound:  l.compound || 'UNKNOWN',
        };
      }
    });
  }

  // Latest interval per driver
  const latestInterval = {};
  if (intervals && Array.isArray(intervals)) {
    intervals.forEach(i => {
      const k = i.driver_number;
      if (!latestInterval[k] || new Date(i.date) > new Date(latestInterval[k].date)) {
        latestInterval[k] = i;
      }
    });
  }

  // Pit counts
  const pitCounts = {};
  if (pits && Array.isArray(pits)) {
    pits.forEach(p => { pitCounts[p.driver_number] = (pitCounts[p.driver_number] || 0) + 1; });
  }

  // Build sorted results
  const results = Object.values(driverMap).map(d => ({
    ...d,
    position: latestPos[d.number]?.position ?? 99,
    bestLap:  bestLaps[d.number] || null,
    gap:      latestInterval[d.number]?.gap_to_leader ?? null,
    interval: latestInterval[d.number]?.interval ?? null,
    pitStops: pitCounts[d.number] || 0,
  })).sort((a, b) => a.position - b.position);

  return { results, totalLaps: maxLap };
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useWeekendData() {
  const [weekend,     setWeekend]     = useState(null);
  const [sessions,    setSessions]    = useState([]);
  const [results,     setResults]     = useState({});
  const [activeKey,   setActiveKey]   = useState(null);
  const [status,      setStatus]      = useState('loading');
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef     = useRef(null);
  const liveTimer    = useRef(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      // Step 1: Get current/next race from Ergast
      const [nextData, lastData] = await Promise.all([
        safeGet(`${ERGAST}/current/next.json`),
        safeGet(`${ERGAST}/current/last/results.json`),
      ]);

      const nextRace = nextData?.MRData?.RaceTable?.Races?.[0];
      const lastRace = lastData?.MRData?.RaceTable?.Races?.[0];
      const now      = new Date();

      // Decide which race weekend to show
      let targetRace = nextRace;
      if (nextRace) {
        const raceDate     = new Date(`${nextRace.date}T${nextRace.time || '14:00:00Z'}`);
        const weekendStart = new Date(raceDate);
        weekendStart.setDate(weekendStart.getDate() - 4);
        if (now < weekendStart) {
          // Not yet this weekend — show last race if it finished within 24h
          if (lastRace) {
            const lastDate = new Date(`${lastRace.date}T${lastRace.time || '14:00:00Z'}`);
            const elapsed  = (now - lastDate) / 3600000;
            if (elapsed < 24) targetRace = lastRace;
          }
        }
      } else if (lastRace) {
        targetRace = lastRace;
      }

      if (!targetRace) {
        setStatus('offline');
        setError('No race data available from Ergast');
        return;
      }

      const raceDate = new Date(`${targetRace.date}T${targetRace.time || '14:00:00Z'}`);
      setWeekend({
        name:     targetRace.raceName,
        circuit:  targetRace.Circuit?.circuitName || '',
        date:     targetRace.date,
        round:    Number(targetRace.round),
        location: `${targetRace.Circuit?.Location?.locality || ''}, ${targetRace.Circuit?.Location?.country || ''}`,
        raceDate,
      });

      // Step 2: Find meeting in OpenF1 by year
      const year     = raceDate.getFullYear();
      const meetings = await safeGet(`${OPENF1}/meetings?year=${year}`);

      let meetingKey = null;
      if (meetings && Array.isArray(meetings) && meetings.length > 0) {
        const locality = targetRace.Circuit?.Location?.locality?.toLowerCase() || '';
        const country  = targetRace.Circuit?.Location?.country?.toLowerCase() || '';
        const raceName = targetRace.raceName?.toLowerCase() || '';

        // Try multiple matching strategies
        const matched = meetings.find(m => {
          const mLoc     = (m.location || '').toLowerCase();
          const mCountry = (m.country_name || '').toLowerCase();
          const mName    = (m.meeting_name || '').toLowerCase();
          return (
            mLoc.includes(locality)     || locality.includes(mLoc)  ||
            mCountry.includes(country)  || country.includes(mCountry) ||
            mName.includes(country)     ||
            raceName.includes(mLoc)     || mName.includes(locality)
          );
        }) || meetings.find(m => {
          // fallback: match by race date being within the meeting window
          const mStart = new Date(m.date_start);
          const diff   = Math.abs(raceDate - mStart) / 86400000;
          return diff < 8;
        });

        if (matched) meetingKey = matched.meeting_key;
      }

      if (!meetingKey) {
        // Try fetching sessions directly by date range as last resort
        const dateFrom = new Date(raceDate);
        dateFrom.setDate(dateFrom.getDate() - 5);
        const dateTo   = new Date(raceDate);
        dateTo.setDate(dateTo.getDate() + 1);
        const directSessions = await safeGet(
          `${OPENF1}/sessions?date_start>=${dateFrom.toISOString().slice(0,10)}&date_start<=${dateTo.toISOString().slice(0,10)}`
        );
        if (directSessions && Array.isArray(directSessions) && directSessions.length > 0) {
          meetingKey = directSessions[0].meeting_key;
        }
      }

      if (!meetingKey) {
        setStatus('no-openf1');
        setError(`Could not find OpenF1 meeting for ${targetRace.raceName}. Sessions shown from static data.`);
        // Build static sessions from Ergast data so tabs still render
        buildStaticSessions(targetRace, setSessions, setActiveKey, setLastUpdated, setStatus);
        return;
      }

      // Step 3: Fetch sessions for this meeting
      const rawSessions = await safeGet(`${OPENF1}/sessions?meeting_key=${meetingKey}&year=${year}`);
      if (!rawSessions || !Array.isArray(rawSessions) || rawSessions.length === 0) {
        setStatus('no-openf1');
        buildStaticSessions(targetRace, setSessions, setActiveKey, setLastUpdated, setStatus);
        return;
      }

      // Fix session types (OpenF1 sometimes omits numbers)
      const fixed = fixSessionType(rawSessions);
      const enriched = fixed.map(s => ({
        key:       s.session_key,
        meetingKey,
        type:      s.session_type,
        name:      s.session_name,
        dateStart: s.date_start,
        dateEnd:   s.date_end,
        status:    getSessionStatus(s.date_start, s.date_end),
        config:    SESSION_CONFIG[s.session_type] || {
          short:  s.session_type?.slice(0, 3).toUpperCase() || '?',
          label:  s.session_type || s.session_name || 'Session',
          order:  99,
          icon:   '📋',
        },
      })).sort((a, b) => (a.config.order - b.config.order) || new Date(a.dateStart) - new Date(b.dateStart));

      setSessions(enriched);

      // Auto-select best session
      const live      = enriched.find(s => s.status === 'live');
      const completed = [...enriched].reverse().find(s => s.status === 'completed');
      const upcoming  = enriched.find(s => s.status === 'upcoming');
      const toSelect  = live || completed || upcoming;
      setActiveKey(prev => prev || toSelect?.key || null);

      // Step 4: Fetch results for completed + live sessions in parallel
      const toFetch = enriched.filter(s => s.status !== 'upcoming');
      if (toFetch.length > 0) {
        const entries = await Promise.all(
          toFetch.map(async s => [s.key, await fetchSessionResult(s.key)])
        );
        setResults(Object.fromEntries(entries.filter(([, v]) => v !== null)));
      }

      setStatus('live');
      setLastUpdated(new Date());

    } catch (err) {
      console.error('[useWeekendData]', err);
      setStatus('offline');
      setError(err.message);
    }
  }, []);

  // Build static sessions from Ergast schedule when OpenF1 not available
  function buildStaticSessions(race, setSessions, setActiveKey, setLastUpdated, setStatus) {
    const raceDate = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
    const fp1 = new Date(raceDate); fp1.setDate(fp1.getDate() - 2); fp1.setHours(11, 30, 0);
    const fp2 = new Date(raceDate); fp2.setDate(fp2.getDate() - 2); fp2.setHours(15, 0, 0);
    const fp3 = new Date(raceDate); fp3.setDate(fp3.getDate() - 1); fp3.setHours(11, 30, 0);
    const q   = new Date(raceDate); q.setDate(q.getDate() - 1);   q.setHours(15, 0, 0);
    const staticSessions = [
      { type: 'Practice 1',  start: fp1, dur: 60 },
      { type: 'Practice 2',  start: fp2, dur: 60 },
      { type: 'Practice 3',  start: fp3, dur: 60 },
      { type: 'Qualifying',  start: q,   dur: 60 },
      { type: 'Race',        start: raceDate, dur: 120 },
    ].map((s, i) => {
      const end = new Date(s.start.getTime() + s.dur * 60000);
      return {
        key:       `static-${i}`,
        meetingKey: null,
        type:      s.type,
        dateStart: s.start.toISOString(),
        dateEnd:   end.toISOString(),
        status:    getSessionStatus(s.start.toISOString(), end.toISOString()),
        config:    SESSION_CONFIG[s.type],
      };
    });
    setSessions(staticSessions);
    const latest = [...staticSessions].reverse().find(s => s.status === 'completed');
    setActiveKey(latest?.key || staticSessions[0]?.key);
    setLastUpdated(new Date());
    setStatus('no-openf1');
  }

  // Poll every 5 min normally, every 30s when live
  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 5 * 60 * 1000);
    return () => { clearInterval(timerRef.current); clearInterval(liveTimer.current); };
  }, [refresh]);

  useEffect(() => {
    clearInterval(liveTimer.current);
    if (sessions.some(s => s.status === 'live')) {
      liveTimer.current = setInterval(refresh, 30 * 1000);
    }
  }, [sessions, refresh]);

  return { weekend, sessions, results, activeKey, setActiveKey, status, error, lastUpdated, forceRefresh: refresh, formatGap, formatLapTime };
}
