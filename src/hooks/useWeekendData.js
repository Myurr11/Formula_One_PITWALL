import { useState, useEffect, useCallback, useRef } from 'react';

import { OPENF1_BASE as OPENF1, ERGAST_BASE as ERGAST, safeGet } from './apiConfig';

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
  const now=new Date(), s=new Date(start), e=new Date(end);
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

// ─── Fetch all 2026 races from Ergast (used for past GP selector) ─────────────
export async function fetchAllRaces() {
  const data = await safeGet(`${ERGAST}/current.json`);
  const races = data?.MRData?.RaceTable?.Races || [];
  return races.map(r => ({
    round:    Number(r.round),
    name:     r.raceName,
    circuit:  r.Circuit?.circuitName || '',
    location: `${r.Circuit?.Location?.locality||''}, ${r.Circuit?.Location?.country||''}`,
    country:  r.Circuit?.Location?.country || '',
    date:     r.date,
    raceDate: new Date(`${r.date}T${r.time||'14:00:00Z'}`),
    done:     new Date(`${r.date}T${r.time||'14:00:00Z'}`) < new Date(),
  }));
}

// ─── Find the OpenF1 meeting key for a given race date ───────────────────────
async function findMeetingKey(raceDate, year) {
  // Strategy 1: date-range query scoped tightly to that race weekend
  const from = new Date(raceDate); from.setDate(from.getDate()-5);
  const to   = new Date(raceDate); to.setDate(to.getDate()+1);
  const fromStr = from.toISOString().slice(0,10);
  const toStr   = to.toISOString().slice(0,10);

  const byDate = await safeGet(`${OPENF1}/sessions?year=${year}&date_start>=${fromStr}&date_start<=${toStr}`);
  if (byDate?.length) {
    // Make sure all returned sessions belong to the SAME meeting (the one closest to raceDate)
    const race = byDate.find(s=>s.session_type==='Race') || byDate[byDate.length-1];
    return { meetingKey: race.meeting_key, sessions: byDate.filter(s=>s.meeting_key===race.meeting_key) };
  }

  // Strategy 2: get all year sessions, match by meeting with race date nearest raceDate
  const all = await safeGet(`${OPENF1}/sessions?year=${year}`);
  if (!all?.length) return null;

  const byMeeting = {};
  all.forEach(s => {
    if (!byMeeting[s.meeting_key]) byMeeting[s.meeting_key] = [];
    byMeeting[s.meeting_key].push(s);
  });

  let bestKey=null, bestDiff=Infinity;
  Object.entries(byMeeting).forEach(([key,ss]) => {
    const race = ss.find(s=>s.session_type==='Race');
    if (!race) return;
    const diff = Math.abs(new Date(race.date_start)-raceDate)/86400000;
    if (diff<bestDiff && diff<3) { bestDiff=diff; bestKey=key; }
  });
  if (!bestKey) return null;
  const sessions = all.filter(s=>String(s.meeting_key)===String(bestKey));
  return { meetingKey: bestKey, sessions };
}

// ─── Fetch session result ─────────────────────────────────────────────────────
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
      color:  d.team_colour ? `#${d.team_colour}` : getColor(d.team_name||''),
    };
  });

  const bestLaps = {}; let totalLaps = 0;
  laps?.forEach(l => {
    if (l.lap_number > totalLaps) totalLaps = l.lap_number;
    if (!l.lap_duration || l.lap_duration<=0 || l.is_pit_out_lap) return;
    const k = l.driver_number;
    if (!bestLaps[k] || l.lap_duration<bestLaps[k].duration) {
      bestLaps[k] = { duration:l.lap_duration, formatted:formatLapTime(l.lap_duration), lapNumber:l.lap_number, compound:l.compound||null };
    }
  });

  if (isPractice) {
    const list = Object.values(driverMap)
      .map(d=>({...d, bestLap:bestLaps[d.number]||null, pitStops:0}))
      .sort((a,b)=>(a.bestLap?.duration??Infinity)-(b.bestLap?.duration??Infinity));
    const leaderT = list[0]?.bestLap?.duration??null;
    list.forEach((d,i)=>{ d.position=i+1; d.gap=i===0?0:(d.bestLap&&leaderT?d.bestLap.duration-leaderT:null); });
    return { results:list, totalLaps, sessionType };
  }

  const [positions, intervals, pits] = await Promise.all([
    safeGet(`${OPENF1}/position?session_key=${sessionKey}`),
    safeGet(`${OPENF1}/intervals?session_key=${sessionKey}`),
    isRace ? safeGet(`${OPENF1}/pit?session_key=${sessionKey}`) : Promise.resolve(null),
  ]);

  const latestPos={}, latestInt={}, pitCounts={};
  positions?.forEach(p => { const k=p.driver_number; if (!latestPos[k]||new Date(p.date)>new Date(latestPos[k].date)) latestPos[k]=p; });
  intervals?.forEach(i => { const k=i.driver_number; if (!latestInt[k]||new Date(i.date)>new Date(latestInt[k].date)) latestInt[k]=i; });
  pits?.forEach(p => { pitCounts[p.driver_number]=(pitCounts[p.driver_number]||0)+1; });

  const results = Object.values(driverMap).map(d=>({
    ...d,
    position: latestPos[d.number]?.position??99,
    bestLap:  bestLaps[d.number]||null,
    gap:      latestInt[d.number]?.gap_to_leader??null,
    interval: latestInt[d.number]?.interval??null,
    pitStops: pitCounts[d.number]||0,
  })).sort((a,b)=>a.position-b.position);

  return { results, totalLaps, sessionType };
}

// ─── Load all sessions + results for a given race (by Ergast race object) ─────
async function loadRaceWeekend(ergastRace) {
  const raceDate = new Date(`${ergastRace.date}T${ergastRace.raceTime||ergastRace.time||'14:00:00Z'}`);
  const year     = raceDate.getFullYear();

  const found = await findMeetingKey(raceDate, year);
  if (!found) return null;

  const { meetingKey, sessions: rawSessions } = found;
  const fixed = fixSessionTypes(rawSessions);
  const enriched = fixed.map(s=>({
    key:       s.session_key,
    isStatic:  false,
    meetingKey,
    type:      s.session_type,
    dateStart: s.date_start,
    dateEnd:   s.date_end,
    status:    sessionStatus(s.date_start, s.date_end),
    config:    SESSION_CONFIG[s.session_type]||{ short:(s.session_type||'').slice(0,3).toUpperCase()||'?', label:s.session_type||'Session', order:99, icon:'📋' },
  })).sort((a,b)=>a.config.order-b.config.order||new Date(a.dateStart)-new Date(b.dateStart));

  return enriched;
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useWeekendData(selectedRound = null) {
  const [allRaces,    setAllRaces]    = useState([]);
  const [weekend,     setWeekend]     = useState(null);
  const [sessions,    setSessions]    = useState([]);
  const [results,     setResults]     = useState({});
  const [activeKey,   setActiveKey]   = useState(null);
  const [status,      setStatus]      = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef  = useRef(null);
  const liveTimer = useRef(null);

  // Load all races once on mount
  useEffect(()=>{
    fetchAllRaces().then(r=>{ if(r?.length) setAllRaces(r); });
  },[]);

  const refresh = useCallback(async (round = null) => {
    setStatus('loading');
    setSessions([]);
    setResults({});
    setActiveKey(null);

    try {
      // Get all races from Ergast
      const races = allRaces.length > 0 ? allRaces : await fetchAllRaces();
      if (races.length > 0 && allRaces.length === 0) setAllRaces(races);

      // Determine which race to show
      let targetRace;
      if (round !== null) {
        targetRace = races.find(r=>r.round===round);
      } else {
        // Default: current or most recently completed race weekend
        const now = new Date();
        const completed = races.filter(r=>r.done);
        const upcoming  = races.filter(r=>!r.done);
        // Check if we're within a race weekend window (Thu–Sun)
        const withinWeekend = races.find(r=>{
          const rd = r.raceDate;
          const thu = new Date(rd); thu.setDate(thu.getDate()-3);
          return now >= thu && now <= new Date(rd.getTime()+6*3600000);
        });
        targetRace = withinWeekend || (completed.length > 0 ? completed[completed.length-1] : upcoming[0]);
      }

      if (!targetRace) { setStatus('offline'); return; }

      setWeekend({
        name:     targetRace.name,
        circuit:  targetRace.circuit,
        date:     targetRace.date,
        round:    targetRace.round,
        location: targetRace.location,
        raceDate: targetRace.raceDate,
      });

      // Find sessions from OpenF1 scoped to this exact race weekend
      const raceDate = targetRace.raceDate;
      const year     = raceDate.getFullYear();
      const found    = await findMeetingKey(raceDate, year);

      if (!found?.sessions?.length) {
        console.warn('[WeekendData] No OpenF1 sessions for round', targetRace.round);
        setSessions(buildStaticSessions(targetRace));
        setStatus('no-openf1');
        setLastUpdated(new Date());
        return;
      }

      const { sessions: rawSessions } = found;
      const fixed = fixSessionTypes(rawSessions);
      const enriched = fixed.map(s=>({
        key:       s.session_key,
        isStatic:  false,
        meetingKey: s.meeting_key,
        type:      s.session_type,
        dateStart: s.date_start,
        dateEnd:   s.date_end,
        status:    sessionStatus(s.date_start, s.date_end),
        config:    SESSION_CONFIG[s.session_type]||{ short:(s.session_type||'').slice(0,3).toUpperCase()||'?', label:s.session_type||'Session', order:99, icon:'📋' },
      })).sort((a,b)=>a.config.order-b.config.order||new Date(a.dateStart)-new Date(b.dateStart));

      setSessions(enriched);

      const live = enriched.find(s=>s.status==='live');
      const done = [...enriched].reverse().find(s=>s.status==='completed');
      const next = enriched.find(s=>s.status==='upcoming');
      setActiveKey((live||done||next)?.key||null);

      // Fetch results
      const toFetch = enriched.filter(s=>s.status!=='upcoming');
      if (toFetch.length>0) {
        const newResults={};
        for (const s of toFetch) {
          const res = await fetchSessionResult(s.key, s.type);
          if (res) newResults[s.key]=res;
          await new Promise(r=>setTimeout(r,200));
        }
        setResults(newResults);
      }

      setStatus('live');
      setLastUpdated(new Date());
    } catch(err) {
      console.error('[useWeekendData]', err);
      setStatus('offline');
    }
  // eslint-disable-next-line
  }, [allRaces]);

  function buildStaticSessions(race) {
    const rd = race.raceDate;
    return [
      { type:'Practice 1', od:-2, h:11, m:30, dur:60 },
      { type:'Practice 2', od:-2, h:15, m:0,  dur:60 },
      { type:'Practice 3', od:-1, h:11, m:30, dur:60 },
      { type:'Qualifying', od:-1, h:15, m:0,  dur:60 },
      { type:'Race',       od:0,  h:rd.getUTCHours(), m:rd.getUTCMinutes(), dur:120 },
    ].map((e,i)=>{
      const s=new Date(rd); s.setDate(s.getDate()+e.od); s.setUTCHours(e.h,e.m,0,0);
      const end=new Date(s.getTime()+e.dur*60000);
      return { key:`static-${i}`, isStatic:true, meetingKey:null, type:e.type, dateStart:s.toISOString(), dateEnd:end.toISOString(), status:sessionStatus(s.toISOString(),end.toISOString()), config:SESSION_CONFIG[e.type] };
    });
  }

  // Initial load + poll
  useEffect(()=>{
    if (allRaces.length>0) refresh(selectedRound);
  // eslint-disable-next-line
  },[allRaces, selectedRound]);

  useEffect(()=>{
    if (allRaces.length===0) return;
    timerRef.current=setInterval(()=>refresh(selectedRound), 5*60*1000);
    return ()=>{ clearInterval(timerRef.current); clearInterval(liveTimer.current); };
  // eslint-disable-next-line
  },[allRaces, selectedRound]);

  useEffect(()=>{
    clearInterval(liveTimer.current);
    if (sessions.some(s=>s.status==='live')) liveTimer.current=setInterval(()=>refresh(selectedRound),30*1000);
  // eslint-disable-next-line
  },[sessions]);

  return { allRaces, weekend, sessions, results, activeKey, setActiveKey, status, lastUpdated, forceRefresh:()=>refresh(selectedRound), loadRaceWeekend, formatGap, formatLapTime };
}
