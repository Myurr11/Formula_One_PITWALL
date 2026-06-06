import { useState, useEffect, useCallback, useRef } from 'react';
import {
  driversChampionship as fbDrivers,
  constructorsChampionship as fbConstructors,
  seasonCalendar as fbCalendar,
  nextRace as fbNextRace,
  lastRaceResults as fbLastResult,
  paddockIntel as fbPaddock,
} from '../data/f1Data';

const OPENF1  = 'https://api.openf1.org/v1';
const F1API   = 'https://f1api.dev/api';
const ERGAST  = 'https://api.jolpi.ca/ergast/f1';

const TEAM_COLORS = {
  mercedes:'#00D2BE', ferrari:'#E8002D', mclaren:'#FF8000',
  'red bull':'#3671C6','red bull racing':'#3671C6', alpine:'#0093CC',
  'racing bulls':'#6692FF', haas:'#B6BABD', williams:'#00A3E0',
  'aston martin':'#006F62', audi:'#C0C0C0', cadillac:'#D4AF37', sauber:'#C0C0C0',
};
const getColor = (team='') =>
  TEAM_COLORS[team.toLowerCase()] ||
  Object.entries(TEAM_COLORS).find(([k])=>team.toLowerCase().includes(k))?.[1] || '#888888';

const NAT_MAP = {
  British:'GBR',Italian:'ITA',Dutch:'NED',Monegasque:'MON',Australian:'AUS',
  French:'FRA',Spanish:'ESP',Canadian:'CAN',German:'GER',Thai:'THA',
  Brazilian:'BRA',Argentine:'ARG','New Zealander':'NZL',Finnish:'FIN',
  Mexican:'MEX',American:'USA',Japanese:'JPN',Chinese:'CHN',
};

async function safeGet(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────
async function fetchStandings() {
  const year = new Date().getFullYear();

  let driverData = await safeGet(`${F1API}/${year}/drivers-championship`);
  let ctorData   = await safeGet(`${F1API}/${year}/constructors-championship`);

  if (driverData?.drivers_championship) {
    const drivers = driverData.drivers_championship.map((d, i) => ({
      pos:   i + 1,
      name:  `${d.driver?.name?.split(' ')[0]?.[0] || ''}. ${d.driver?.surname || d.driver?.name || ''}`.trim(),
      short: (d.driver?.surname || '').slice(0, 3).toUpperCase(),
      team:  d.team?.teamName || d.team?.name || '',
      nat:   d.driver?.nationality ? (NAT_MAP[d.driver.nationality] || d.driver.nationality.slice(0,3).toUpperCase()) : '—',
      pts:   Number(d.points) || 0,
      diff:  i === 0 ? null : -(Number(driverData.drivers_championship[0].points) - Number(d.points)),
      color: getColor(d.team?.teamName || d.team?.name || ''),
    }));
    const constructors = ctorData?.constructors_championship
      ? ctorData.constructors_championship.map((t, i) => ({
          pos: i + 1,
          name: t.team?.teamName || t.team?.name || '',
          pts:  Number(t.points) || 0,
          color: getColor(t.team?.teamName || t.team?.name || ''),
          engine: t.team?.engine || '',
        }))
      : null;
    return { drivers, constructors, roundsComplete: driverData.round || null, source: 'f1api.dev' };
  }

  // Ergast fallback
  const eg = await safeGet(`${ERGAST}/current/driverStandings.json`);
  const ec = await safeGet(`${ERGAST}/current/constructorStandings.json`);
  if (!eg) return null;
  const sl = eg.MRData?.StandingsTable?.StandingsLists?.[0];
  const cl = ec?.MRData?.StandingsTable?.StandingsLists?.[0];
  const roundsComplete = Number(sl?.round) || 0;
  const drivers = (sl?.DriverStandings || []).map((d, i) => {
    const team = d.Constructors?.[0]?.name || '';
    return {
      pos:  Number(d.position),
      name: `${d.Driver.givenName[0]}. ${d.Driver.familyName}`,
      short: d.Driver.code || d.Driver.familyName.slice(0,3).toUpperCase(),
      team,
      nat:  NAT_MAP[d.Driver.nationality] || d.Driver.nationality?.slice(0,3).toUpperCase() || '—',
      pts:  Number(d.points),
      diff: i === 0 ? null : -(Number(sl.DriverStandings[0].points) - Number(d.points)),
      color: getColor(team),
    };
  });
  const constructors = (cl?.ConstructorStandings || []).map(t => ({
    pos:   Number(t.position),
    name:  t.Constructor.name,
    pts:   Number(t.points),
    color: getColor(t.Constructor.name),
    engine: '',
  }));
  return { drivers, constructors, roundsComplete, source: 'ergast' };
}

// ─── NEXT RACE — Ergast for round number, OpenF1 for session times ─────────────
async function fetchNextRace() {
  const year = new Date().getFullYear();

  // Ergast /current/next is authoritative for round number & race identity
  const eg   = await safeGet(`${ERGAST}/current/next.json`);
  const race  = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const raceDateStr = `${race.date}T${race.time || '14:00:00Z'}`;
  let sessionDates  = { race: raceDateStr };
  let isSprint      = false;

  // Try to enrich with precise session times from OpenF1
  const meetings = await safeGet(`${OPENF1}/meetings?year=${year}`);
  if (meetings && Array.isArray(meetings)) {
    const loc     = race.Circuit?.Location?.locality?.toLowerCase() || '';
    const country = race.Circuit?.Location?.country?.toLowerCase() || '';
    const matched = meetings.find(m => {
      const mLoc  = (m.location || '').toLowerCase();
      const mName = (m.meeting_name || '').toLowerCase();
      return mLoc.includes(loc) || loc.includes(mLoc) ||
             mName.includes(country) || country.includes(mLoc);
    });
    if (matched) {
      const sessions = await safeGet(`${OPENF1}/sessions?meeting_key=${matched.meeting_key}&year=${year}`);
      if (sessions && Array.isArray(sessions)) {
        const get = (type) => sessions.find(s => s.session_type === type)?.date_start || null;
        isSprint = !!sessions.find(s => s.session_type === 'Sprint');
        sessionDates = {
          fp1:        get('Practice 1'),
          fp2:        get('Practice 2'),
          fp3:        get('Practice 3'),
          qualifying: get('Qualifying'),
          sprint:     get('Sprint'),
          race:       get('Race') || raceDateStr,
        };
      }
    }
  }

  return {
    name:          race.raceName,
    circuit:       race.Circuit?.circuitName || '',
    location:      `${race.Circuit?.Location?.locality || ''}, ${race.Circuit?.Location?.country || ''}`,
    country:       race.Circuit?.Location?.country || '',
    round:         Number(race.round),   // ← always correct — from Ergast, not OpenF1 meeting_key
    totalRounds:   22,
    raceDate:      sessionDates.race || raceDateStr,
    sessionDates,
    isSprint,
    lapRecord:     null,
    poleRecord:    null,
    source:        'ergast+openf1',
  };
}

// ─── LAST RESULT ──────────────────────────────────────────────────────────────
async function fetchLastResult() {
  const eg   = await safeGet(`${ERGAST}/current/last/results.json`);
  const race  = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const results = race.Results || [];
  const top10 = results.slice(0, 10).map(r => ({
    pos:    Number(r.position),
    driver: `${r.Driver.givenName[0]}. ${r.Driver.familyName}`,
    team:   r.Constructor.name,
    time:   r.Time?.time || r.status || '—',
    gap:    Number(r.position) === 1 ? null : (r.Time?.time ? `+${r.Time.time}` : null),
    color:  getColor(r.Constructor.name),
    points: Number(r.points),
    laps:   Number(r.laps),
    status: r.status,
  }));
  const podium = top10.slice(0, 3);

  // Fastest lap
  const flResult = results.find(r => r.FastestLap?.rank === '1');
  const fastestLap = flResult ? {
    driver: `${flResult.Driver.givenName[0]}. ${flResult.Driver.familyName}`,
    time:   flResult.FastestLap?.Time?.time || '—',
    lap:    Number(flResult.FastestLap?.lap) || null,
  } : null;

  // True retirements only (not lapped cars — they finished the race)
  const retirements = results
    .filter(r => r.status !== 'Finished' && !r.status.startsWith('+') && !r.status.toLowerCase().startsWith('lapped') && r.status !== 'Did not start')
    .map(r => ({
      driver: `${r.Driver.givenName[0]}. ${r.Driver.familyName}`,
      team:   r.Constructor.name,
      reason: r.status,
      lap:    Number(r.laps) || null,
      color:  getColor(r.Constructor.name),
    }));

  // Lapped cars — finished but a lap or more down
  const lapped = results
    .filter(r => r.status.startsWith('+') || r.status.toLowerCase().startsWith('lapped'))
    .map(r => ({
      driver: `${r.Driver.givenName[0]}. ${r.Driver.familyName}`,
      team:   r.Constructor.name,
      gap:    r.status,
      color:  getColor(r.Constructor.name),
    }));

  // DNS
  const dns = results
    .filter(r => r.status === 'Did not start')
    .map(r => `${r.Driver.givenName[0]}. ${r.Driver.familyName}`);

  const poleDriver = results.find(r => r.grid === '1');
  const polePosition = poleDriver
    ? `${poleDriver.Driver.givenName[0]}. ${poleDriver.Driver.familyName}` : null;

  return {
    raceName:     race.raceName,
    circuit:      race.Circuit?.circuitName || '',
    date:         race.date,
    round:        Number(race.round),
    podium,
    top10,
    retirements,  // true DNFs only
    lapped,       // classified finishers lapped
    dns,
    fastestLap,
    polePosition,
    sprintWinner: null,
    source:       'ergast',
  };
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
async function fetchCalendar(roundsComplete) { // eslint-disable-line no-unused-vars
  const eg    = await safeGet(`${ERGAST}/current.json`);
  const races  = eg?.MRData?.RaceTable?.Races;
  if (!races) return null;

  const winnerData = await safeGet(`${ERGAST}/current/results/1.json`);
  const winnerMap  = {};
  (winnerData?.MRData?.RaceTable?.Races || []).forEach(r => {
    const w = r.Results?.[0];
    if (w) winnerMap[Number(r.round)] = {
      name:  `${w.Driver.givenName[0]}. ${w.Driver.familyName}`,
      team:  w.Constructor.name,
      color: getColor(w.Constructor.name),
    };
  });

  return races.map(r => {
    const roundNum    = Number(r.round);
    const winner      = winnerMap[roundNum];
    const raceDateStr = `${r.date}T${r.time || '13:00:00Z'}`;
    return {
      round:       roundNum,
      name:        r.raceName,
      shortName:   r.raceName.replace(' Grand Prix', ' GP'),
      circuit:     r.Circuit?.circuitName || '',
      country:     r.Circuit?.Location?.country || '',
      date:        r.date,
      raceDate:    raceDateStr,
      winner:      winner?.name  || null,
      winnerTeam:  winner?.team  || null,
      winnerColor: winner?.color || null,
      isSprint:    !!(r.SprintQualifying || r.Sprint),
    };
  });
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
const FALLBACK = {
  standings:  { drivers: fbDrivers, constructors: fbConstructors, roundsComplete: 5 },
  nextRace:   { ...fbNextRace, raceDate: fbNextRace.date },
  calendar:   { races: fbCalendar },
  lastResult: {
    raceName:'Canadian Grand Prix', circuit:'Circuit Gilles Villeneuve', round:5,
    podium:  fbLastResult.slice(0,3), top10: fbLastResult,
    retirements: [
      { driver:'G. Russell', team:'Mercedes', reason:'Power unit', lap:29, color:'#00D2BE' },
      { driver:'L. Norris',  team:'McLaren',  reason:'Retired',   lap:38, color:'#FF8000' },
      { driver:'F. Alonso',  team:'Aston Martin', reason:'Retired', lap:23, color:'#006F62' },
    ],
    lapped: [],
    dns: [],
    fastestLap:  { driver:'K. Antonelli', time:'1:14.210', lap:68 },
    polePosition:'G. Russell', sprintWinner:'G. Russell',
  },
  paddock: { news: fbPaddock.map(p => ({ ...p, timestamp: new Date().toISOString() })) },
};

const POLL = 5 * 60 * 1000;

export function useF1Data() {
  const [data,        setData]        = useState(FALLBACK);
  const [status,      setStatus]      = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sources,     setSources]     = useState({});
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const [standings, nextRace, lastResult] = await Promise.all([
        fetchStandings(),
        fetchNextRace(),
        fetchLastResult(),
      ]);
      const calendar = await fetchCalendar(standings?.roundsComplete);

      setData(prev => ({
        standings:  standings  || prev.standings,
        nextRace:   nextRace   || prev.nextRace,
        lastResult: lastResult || prev.lastResult,
        calendar:   calendar ? { races: calendar } : prev.calendar,
        paddock:    prev.paddock,
      }));
      setStatus('live');
      setLastUpdated(new Date());
      setSources({
        standings:  standings?.source  || 'fallback',
        nextRace:   nextRace?.source   || 'fallback',
        lastResult: lastResult?.source || 'fallback',
      });
    } catch (err) {
      console.warn('[useF1Data] fetch error:', err.message);
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, POLL);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  return { data, status, lastUpdated, sources, forceRefresh: refresh };
}
