import { useState, useEffect, useCallback, useRef } from 'react';

const OPENF1 = 'https://api.openf1.org/v1';
const ERGAST  = 'https://api.jolpi.ca/ergast/f1';

async function safeGet(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) { console.warn(`[F1] ${r.status} ${url}`); return null; }
    const t = await r.text();
    if (!t || t.trim() === '' || t.trim() === 'null') return null;
    return JSON.parse(t);
  } catch(e) { console.warn(`[F1] fetch failed ${url}:`, e.message); return null; }
}

const TEAM_COLORS = {
  mercedes:'#00D2BE', ferrari:'#E8002D', mclaren:'#FF8000',
  'red bull':'#3671C6','red bull racing':'#3671C6', alpine:'#0093CC',
  'racing bulls':'#6692FF', rb:'#6692FF', haas:'#B6BABD', williams:'#00A3E0',
  'aston martin':'#006F62', audi:'#C0C0C0', cadillac:'#D4AF37',
};
const getColor = (t='') =>
  TEAM_COLORS[t.toLowerCase()] ||
  Object.entries(TEAM_COLORS).find(([k])=>t.toLowerCase().includes(k))?.[1] || '#888';

export const SESSION_CONFIG = {
  'Practice 1':        { short:'FP1', label:'Free Practice 1',   order:1, icon:'🔧' },
  'Practice 2':        { short:'FP2', label:'Free Practice 2',   order:2, icon:'🔧' },
  'Practice 3':        { short:'FP3', label:'Free Practice 3',   order:3, icon:'🔧' },
  'Sprint Qualifying': { short:'SQ',  label:'Sprint Qualifying', order:4, icon:'⚡' },
  'Sprint':            { short:'SPR', label:'Sprint Race',       order:5, icon:'🏎' },
  'Qualifying':        { short:'Q',   label:'Qualifying',        order:6, icon:'⏱' },
  'Race':              { short:'R',   label:'Grand Prix',        order:7, icon:'🏆' },
};

function fixSessionTypes(sessions) {
  const sorted = [...sessions].sort((a,b)=>new Date(a.date_start)-new Date(b.date_start));
  let fp = 0;
  return sorted.map(s => {
    let type = s.session_type;
    if (!type || type === 'Practice') { fp++; type = `Practice ${fp}`; }
    return { ...s, session_type: type };
  });
}

function sessionStatus(start, end) {
  const now = new Date(), s = new Date(start), e = new Date(end);
  if (now < s) return 'upcoming';
  if (now >= s && now <= e) return 'live';
  return 'completed';
}

export function formatLapTime(sec) {
  if (!sec || sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(3).padStart(6,'0');
  return `${m}:${s}`;
}

export function formatGap(gap) {
  if (gap === null || gap === undefined) return '—';
  if (gap === 0) return 'LEADER';
  if (typeof gap === 'string') return gap.startsWith('+') ? gap : `+${gap}`;
  return `+${Number(gap).toFixed(3)}s`;
}

// ─── Fetch one session's classification ───────────────────────────────────────
async function fetchSessionResult(sessionKey, sessionType) {
  const isPractice = sessionType?.startsWith('Practice');
  const isRace     = sessionType === 'Race' || sessionType === 'Sprint';

  const [drivers, laps] = await Promise.all([
    safeGet(`${OPENF1}/drivers?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/laps?session_key=${sessionKey}`),
  ]);

  if (!drivers?.length) return null;

  const driverMap = {};
  drivers.forEach(d => {
    driverMap[d.driver_number] = {
      number: d.driver_number,
      code:   d.name_acronym || `#${d.driver_number}`,
      name:   d.full_name || d.name_acronym || `#${d.driver_number}`,
      team:   d.team_name || '',
      color:  d.team_colour ? `#${d.team_colour}` : getColor(d.team_name || ''),
    };
  });

  // Best lap per driver
  const bestLaps = {};
  let totalLaps = 0;
  if (laps?.length) {
    laps.forEach(l => {
      if (l.lap_number > totalLaps) totalLaps = l.lap_number;
      if (!l.lap_duration || l.lap_duration <= 0 || l.is_pit_out_lap) return;
      const k = l.driver_number;
      if (!bestLaps[k] || l.lap_duration < bestLaps[k].duration) {
        bestLaps[k] = {
          duration: l.lap_duration,
          formatted: formatLapTime(l.lap_duration),
          lapNumber: l.lap_number,
          compound: l.compound || null,
        };
      }
    });
  }

  // ── PRACTICE: rank purely by best lap time ──────────────────────────────
  if (isPractice) {
    const list = Object.values(driverMap).map(d => ({
      ...d, bestLap: bestLaps[d.number] || null, pitStops: 0,
    })).sort((a,b) => (a.bestLap?.duration ?? Infinity) - (b.bestLap?.duration ?? Infinity));

    const leaderT = list[0]?.bestLap?.duration ?? null;
    list.forEach((d,i) => {
      d.position = i + 1;
      d.gap = i === 0 ? 0 : (d.bestLap && leaderT ? d.bestLap.duration - leaderT : null);
    });
    return { results: list, totalLaps, sessionType };
  }

  // ── QUALI / RACE: use position + intervals ──────────────────────────────
  const [positions, intervals, pits] = await Promise.all([
    safeGet(`${OPENF1}/position?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/intervals?session_key=${sessionKey}`),
    isRace ? safeGet(`${OPENF1}/pit?session_key=${sessionKey}`) : Promise.resolve(null),
  ]);

  const latestPos = {}, latestInt = {}, pitCounts = {};
  positions?.forEach(p => {
    const k = p.driver_number;
    if (!latestPos[k] || new Date(p.date) > new Date(latestPos[k].date)) latestPos[k] = p;
  });
  intervals?.forEach(i => {
    const k = i.driver_number;
    if (!latestInt[k] || new Date(i.date) > new Date(latestInt[k].date)) latestInt[k] = i;
  });
  pits?.forEach(p => { pitCounts[p.driver_number] = (pitCounts[p.driver_number]||0)+1; });

  const results = Object.values(driverMap).map(d => ({
    ...d,
    position: latestPos[d.number]?.position ?? 99,
    bestLap:  bestLaps[d.number] || null,
    gap:      latestInt[d.number]?.gap_to_leader ?? null,
    interval: latestInt[d.number]?.interval ?? null,
    pitStops: pitCounts[d.number] || 0,
  })).sort((a,b) => a.position - b.position);

  return { results, totalLaps, sessionType };
}

// ─── Core: find the current weekend's OpenF1 sessions ─────────────────────────
// Strategy: always query OpenF1 sessions by date range around TODAY.
// This works regardless of what Ergast says is "next" or "last".
async function findCurrentWeekendSessions() {
  const now   = new Date();
  const year  = now.getFullYear();

  // Query OpenF1 sessions for a ±7 day window around today
  const from = new Date(now); from.setDate(from.getDate() - 6);
  const to   = new Date(now); to.setDate(to.getDate() + 7);

  const fromStr = from.toISOString().slice(0,10);
  const toStr   = to.toISOString().slice(0,10);

  // Fetch sessions in date window — use year param too as safety
  const url = `${OPENF1}/sessions?year=${year}&date_start>=${fromStr}&date_start<=${toStr}`;
  console.log('[WeekendData] Fetching sessions:', url);
  const sessions = await safeGet(url);

  if (!sessions?.length) {
    // Try without date filter as fallback — get most recent session
    const all = await safeGet(`${OPENF1}/sessions?year=${year}`);
    if (!all?.length) return null;
    // Find the meeting whose sessions are closest to today
    const byMeeting = {};
    all.forEach(s => {
      if (!byMeeting[s.meeting_key]) byMeeting[s.meeting_key] = [];
      byMeeting[s.meeting_key].push(s);
    });
    // Pick the meeting whose race session is closest to today
    let bestMeeting = null, bestDiff = Infinity;
    Object.entries(byMeeting).forEach(([key, ss]) => {
      const race = ss.find(s => s.session_type === 'Race');
      if (!race) return;
      const diff = Math.abs(new Date(race.date_start) - now) / 86400000;
      if (diff < bestDiff) { bestDiff = diff; bestMeeting = key; }
    });
    if (!bestMeeting) return null;
    return all.filter(s => String(s.meeting_key) === String(bestMeeting));
  }

  return sessions;
}

// ─── Get race identity from Ergast to show the race name/circuit ──────────────
async function getRaceIdentity(raceDate) {
  // Try to match by year + approximate round
  const all   = await safeGet(`${ERGAST}/current.json`);
  const races  = all?.MRData?.RaceTable?.Races || [];

  // Find the race whose date is closest to our raceDate
  let best = null, bestDiff = Infinity;
  races.forEach(r => {
    const rd   = new Date(`${r.date}T${r.time || '14:00:00Z'}`);
    const diff = Math.abs(rd - raceDate) / 86400000;
    if (diff < bestDiff) { bestDiff = diff; best = r; }
  });
  return best;
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useWeekendData() {
  const [weekend,     setWeekend]     = useState(null);
  const [sessions,    setSessions]    = useState([]);
  const [results,     setResults]     = useState({});
  const [activeKey,   setActiveKey]   = useState(null);
  const [status,      setStatus]      = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef  = useRef(null);
  const liveTimer = useRef(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      // ── Step 1: Get sessions directly from OpenF1 by date (most reliable) ──
      const rawSessions = await findCurrentWeekendSessions();

      if (!rawSessions?.length) {
        // Complete fallback: show next race schedule from Ergast with no data
        console.warn('[WeekendData] No OpenF1 sessions found at all');
        const nextData = await safeGet(`${ERGAST}/current/next.json`);
        const nextRace = nextData?.MRData?.RaceTable?.Races?.[0];
        if (nextRace) {
          const rd = new Date(`${nextRace.date}T${nextRace.time||'14:00:00Z'}`);
          setWeekend({
            name: nextRace.raceName,
            circuit: nextRace.Circuit?.circuitName || '',
            date: nextRace.date,
            round: Number(nextRace.round),
            location: `${nextRace.Circuit?.Location?.locality||''}, ${nextRace.Circuit?.Location?.country||''}`,
            raceDate: rd,
          });
          setSessions(buildStaticSessions(nextRace));
        }
        setStatus('no-openf1');
        setLastUpdated(new Date());
        return;
      }

      // ── Step 2: Identify the meeting's race session to get timing ──────────
      const raceSession = rawSessions.find(s => s.session_type === 'Race')
                        || rawSessions[rawSessions.length - 1];
      const raceDate    = new Date(raceSession.date_start);
      const meetingKey  = raceSession.meeting_key;

      console.log(`[WeekendData] Meeting key: ${meetingKey}, race: ${raceDate.toISOString()}`);

      // ── Step 3: Get race name from Ergast ─────────────────────────────────
      const ergastRace = await getRaceIdentity(raceDate);
      if (ergastRace) {
        setWeekend({
          name:     ergastRace.raceName,
          circuit:  ergastRace.Circuit?.circuitName || raceSession.circuit_short_name || '',
          date:     ergastRace.date,
          round:    Number(ergastRace.round),
          location: `${ergastRace.Circuit?.Location?.locality||''}, ${ergastRace.Circuit?.Location?.country||''}`,
          raceDate,
        });
      } else {
        // Fallback: use OpenF1 meeting name directly
        setWeekend({
          name:     `${raceSession.location || ''} Grand Prix`,
          circuit:  raceSession.circuit_short_name || '',
          date:     raceSession.date_start?.slice(0,10) || '',
          round:    raceSession.meeting_key,
          location: `${raceSession.location||''}, ${raceSession.country_name||''}`,
          raceDate,
        });
      }

      // ── Step 4: Build enriched sessions list ──────────────────────────────
      const fixed = fixSessionTypes(rawSessions);
      const enriched = fixed.map(s => ({
        key:       s.session_key,
        isStatic:  false,
        meetingKey,
        type:      s.session_type,
        dateStart: s.date_start,
        dateEnd:   s.date_end,
        status:    sessionStatus(s.date_start, s.date_end),
        config:    SESSION_CONFIG[s.session_type] || {
          short: (s.session_type||'').slice(0,3).toUpperCase() || '?',
          label: s.session_type || 'Session',
          order: 99, icon: '📋',
        },
      })).sort((a,b) => a.config.order - b.config.order || new Date(a.dateStart) - new Date(b.dateStart));

      setSessions(enriched);

      // Auto-select: live → latest completed → first upcoming
      const live = enriched.find(s => s.status === 'live');
      const done = [...enriched].reverse().find(s => s.status === 'completed');
      const next = enriched.find(s => s.status === 'upcoming');
      const pick = live || done || next;
      setActiveKey(prev => prev || pick?.key || null);

      // ── Step 5: Fetch results for completed + live sessions ────────────────
      const toFetch = enriched.filter(s => s.status !== 'upcoming');
      if (toFetch.length > 0) {
        const newResults = {};
        for (const s of toFetch) {
          console.log(`[WeekendData] Fetching result for ${s.type} (key=${s.key})`);
          const res = await fetchSessionResult(s.key, s.type);
          if (res) {
            newResults[s.key] = res;
            console.log(`[WeekendData] ✓ ${s.type}: ${res.results.length} drivers`);
          } else {
            console.warn(`[WeekendData] ✗ No result for ${s.type} (key=${s.key})`);
          }
          await new Promise(r => setTimeout(r, 300));
        }
        setResults(newResults);
      }

      setStatus('live');
      setLastUpdated(new Date());

    } catch(err) {
      console.error('[useWeekendData] Error:', err);
      setStatus('offline');
    }
  }, []);

  function buildStaticSessions(race) {
    const rd = new Date(`${race.date}T${race.time||'14:00:00Z'}`);
    return [
      { type:'Practice 1', offsetDays:-2, h:11, m:30, dur:60 },
      { type:'Practice 2', offsetDays:-2, h:15, m:0,  dur:60 },
      { type:'Practice 3', offsetDays:-1, h:11, m:30, dur:60 },
      { type:'Qualifying', offsetDays:-1, h:15, m:0,  dur:60 },
      { type:'Race',       offsetDays:0,  h:rd.getUTCHours(), m:rd.getUTCMinutes(), dur:120 },
    ].map((e,i) => {
      const s = new Date(rd); s.setDate(s.getDate()+e.offsetDays); s.setUTCHours(e.h,e.m,0,0);
      const end = new Date(s.getTime()+e.dur*60000);
      return {
        key:`static-${i}`, isStatic:true, meetingKey:null, type:e.type,
        dateStart:s.toISOString(), dateEnd:end.toISOString(),
        status:sessionStatus(s.toISOString(),end.toISOString()),
        config:SESSION_CONFIG[e.type],
      };
    });
  }

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 5*60*1000);
    return () => { clearInterval(timerRef.current); clearInterval(liveTimer.current); };
  }, [refresh]);

  useEffect(() => {
    clearInterval(liveTimer.current);
    if (sessions.some(s => s.status === 'live')) {
      liveTimer.current = setInterval(refresh, 30*1000);
    }
  }, [sessions, refresh]);

  return { weekend, sessions, results, activeKey, setActiveKey, status, lastUpdated, forceRefresh: refresh, formatGap, formatLapTime };
}
