import { useState, useEffect, useCallback, useRef } from 'react';
import {
  driversChampionship as fbDrivers,
  constructorsChampionship as fbConstructors,
  seasonCalendar as fbCalendar,
  nextRace as fbNextRace,
  lastRaceResults as fbLastResult,
  paddockIntel as fbPaddock,
} from '../data/f1Data';

// ─── FREE API ENDPOINTS (no keys, no cost) ────────────────────────────────────
const OPENF1   = 'https://api.openf1.org/v1';
const F1API    = 'https://f1api.dev/api';
const ERGAST   = 'https://api.jolpi.ca/ergast/f1';

const TEAM_COLORS = {
  mercedes: '#00D2BE', ferrari: '#E8002D', mclaren: '#FF8000',
  'red bull': '#3671C6', 'red bull racing': '#3671C6', alpine: '#0093CC',
  'racing bulls': '#6692FF', haas: '#B6BABD', williams: '#00A3E0',
  'aston martin': '#006F62', audi: '#C0C0C0', cadillac: '#D4AF37',
  sauber: '#C0C0C0',
};

const getColor = (team = '') =>
  TEAM_COLORS[team.toLowerCase()] ||
  Object.entries(TEAM_COLORS).find(([k]) => team.toLowerCase().includes(k))?.[1] ||
  '#888888';

const NAT_MAP = {
  British:'GBR', Italian:'ITA', Dutch:'NED', Monegasque:'MON', Australian:'AUS',
  French:'FRA', Spanish:'ESP', Canadian:'CAN', German:'GER', Thai:'THA',
  Brazilian:'BRA', Argentine:'ARG', 'New Zealander':'NZL', Finnish:'FIN',
  Mexican:'MEX', American:'USA', Japanese:'JPN', Chinese:'CHN',
};

async function safeGet(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ─── STANDINGS via f1api.dev (primary) + Ergast (fallback) ───────────────────
async function fetchStandings() {
  const year = new Date().getFullYear();

  // Try f1api.dev first
  let driverData = await safeGet(`${F1API}/${year}/drivers-championship`);
  let ctorData   = await safeGet(`${F1API}/${year}/constructors-championship`);

  if (driverData?.drivers_championship) {
    const drivers = driverData.drivers_championship.map((d, i) => ({
      pos:   i + 1,
      name:  `${d.driver?.name?.split(' ')[0]?.[0] || ''}. ${d.driver?.surname || d.driver?.name || ''}`.trim(),
      short: (d.driver?.surname || '').slice(0, 3).toUpperCase(),
      team:  d.team?.teamName || d.team?.name || '',
      nat:   d.driver?.nationality ? (NAT_MAP[d.driver.nationality] || d.driver.nationality.slice(0, 3).toUpperCase()) : '—',
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
      short: d.Driver.code || d.Driver.familyName.slice(0, 3).toUpperCase(),
      team,
      nat:  d.Driver.nationality ? (NAT_MAP[d.Driver.nationality] || d.Driver.nationality.slice(0,3).toUpperCase()) : '—',
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

// ─── NEXT RACE via OpenF1 meetings + Ergast schedule ─────────────────────────
async function fetchNextRace() {
  const year = new Date().getFullYear();
  const now  = new Date();

  // Get all meetings this year from OpenF1
  const meetings = await safeGet(`${OPENF1}/meetings?year=${year}`);
  if (meetings && Array.isArray(meetings)) {
    const upcoming = meetings
      .filter(m => new Date(m.date_start) > now)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    if (upcoming.length > 0) {
      const m = upcoming[0];
      // Get sessions for this meeting
      const sessions = await safeGet(`${OPENF1}/sessions?meeting_key=${m.meeting_key}&year=${year}`);
      const raceSession = sessions?.find(s => s.session_type === 'Race');
      const qualSession = sessions?.find(s => s.session_type === 'Qualifying');
      const fp1Session  = sessions?.find(s => s.session_type === 'Practice 1');
      const sprintSession = sessions?.find(s => s.session_type === 'Sprint');

      return {
        name:         m.meeting_name,
        circuit:      m.circuit_short_name || m.location,
        location:     `${m.location}, ${m.country_name}`,
        country:      m.country_code,
        round:        m.meeting_key,
        totalRounds:  22,
        raceDate:     raceSession?.date_start || m.date_start,
        sessionDates: {
          fp1:        fp1Session?.date_start || null,
          qualifying: qualSession?.date_start || null,
          sprint:     sprintSession?.date_start || null,
          race:       raceSession?.date_start || m.date_start,
        },
        isSprint:     !!sprintSession,
        laps:         null,
        circuitLength: null,
        lapRecord:    null,
        poleRecord:   null,
        source:       'openf1',
      };
    }
  }

  // Ergast fallback
  const eg = await safeGet(`${ERGAST}/current/next.json`);
  const race = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;
  const raceDate = `${race.date}T${race.time || '13:00:00Z'}`;
  return {
    name:         race.raceName,
    circuit:      race.Circuit?.circuitName || '',
    location:     `${race.Circuit?.Location?.locality || ''}, ${race.Circuit?.Location?.country || ''}`,
    country:      null,
    round:        Number(race.round),
    totalRounds:  22,
    raceDate,
    sessionDates: { race: raceDate },
    isSprint:     false,
    source:       'ergast',
  };
}

// ─── LAST RESULT via Ergast (most reliable for results) ──────────────────────
async function fetchLastResult() {
  const eg = await safeGet(`${ERGAST}/current/last/results.json`);
  const race = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const results = race.Results || [];
  const top10 = results.slice(0, 10).map(r => ({
    pos:    Number(r.position),
    driver: `${r.Driver.givenName[0]}. ${r.Driver.familyName}`,
    team:   r.Constructor.name,
    time:   r.Time?.time || r.status || '—',
    gap:    Number(r.position) === 1 ? null : (r.Time?.time ? `+${r.Time.time}` : r.status),
    color:  getColor(r.Constructor.name),
    points: Number(r.points),
  }));
  const podium = top10.slice(0, 3);

  // Fastest lap
  const flResult = results.find(r => r.FastestLap?.rank === '1');
  const fastestLap = flResult ? {
    driver: `${flResult.Driver.givenName[0]}. ${flResult.Driver.familyName}`,
    time:   flResult.FastestLap?.Time?.time || '—',
    lap:    Number(flResult.FastestLap?.lap) || null,
  } : null;

  // DNFs
  const dnfs = results
    .filter(r => r.status !== 'Finished' && !r.status.startsWith('+'))
    .map(r => ({
      driver: `${r.Driver.givenName[0]}. ${r.Driver.familyName}`,
      team:   r.Constructor.name,
      reason: r.status,
      lap:    Number(r.laps) || null,
    }));

  // Pole (from quali, approximate from grid)
  const poleDriver = results.find(r => r.grid === '1');
  const polePosition = poleDriver
    ? `${poleDriver.Driver.givenName[0]}. ${poleDriver.Driver.familyName}`
    : null;

  return {
    raceName:     race.raceName,
    circuit:      race.Circuit?.circuitName || '',
    date:         race.date,
    round:        Number(race.round),
    podium,
    top10,
    dnfs,
    fastestLap,
    polePosition,
    sprintWinner: null,
    source:       'ergast',
  };
}

// ─── CALENDAR via Ergast ──────────────────────────────────────────────────────
async function fetchCalendar(roundsComplete) {
  const year = new Date().getFullYear();
  const eg   = await safeGet(`${ERGAST}/current.json`);
  const races = eg?.MRData?.RaceTable?.Races;
  if (!races) return null;

  const now = new Date();
  const winnerData = await safeGet(`${ERGAST}/current/results/1.json`);
  const winnerMap = {};
  (winnerData?.MRData?.RaceTable?.Races || []).forEach(r => {
    const w = r.Results?.[0];
    if (w) winnerMap[Number(r.round)] = {
      name:  `${w.Driver.givenName[0]}. ${w.Driver.familyName}`,
      team:  w.Constructor.name,
      color: getColor(w.Constructor.name),
    };
  });

  let foundNext = false;
  return races.map(r => {
    const raceDate  = new Date(`${r.date}T${r.time || '13:00:00Z'}`);
    const roundNum  = Number(r.round);
    const isDone    = roundNum <= (roundsComplete || 0);
    const isNext    = !isDone && !foundNext && (foundNext = true);
    const winner    = winnerMap[roundNum];

    return {
      round:      roundNum,
      name:       r.raceName,
      shortName:  r.raceName.replace(' Grand Prix', ' GP'),
      circuit:    r.Circuit?.circuitName || '',
      country:    r.Circuit?.Location?.country || '',
      date:       r.date,
      raceDate:   `${r.date}T${r.time || '13:00:00Z'}`,
      winner:     winner?.name || null,
      winnerTeam: winner?.team || null,
      winnerColor:winner?.color || null,
      status:     isDone ? 'done' : isNext ? 'next' : 'upcoming',
      isSprint:   !!(r.SprintQualifying || r.Sprint),
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
    dnfs:    [{ driver:'G. Russell', team:'Mercedes', reason:'Power unit', lap:30 }],
    fastestLap:{ driver:'K. Antonelli', time:'1:14.892', lap:68 },
    polePosition:'G. Russell', sprintWinner:'G. Russell',
  },
  paddock: { news: fbPaddock.map(p => ({ ...p, timestamp: new Date().toISOString() })) },
};

const POLL = 5 * 60 * 1000; // 5 minutes

export function useF1Data() {
  const [data,        setData]        = useState(FALLBACK);
  const [status,      setStatus]      = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sources,     setSources]     = useState({});
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      // Fetch everything in parallel
      const [standings, nextRace, lastResult] = await Promise.all([
        fetchStandings(),
        fetchNextRace(),
        fetchLastResult(),
      ]);

      // Calendar needs roundsComplete from standings
      const calendar = await fetchCalendar(standings?.roundsComplete);

      const newData = {
        standings:  standings  || FALLBACK.standings,
        nextRace:   nextRace   || FALLBACK.nextRace,
        lastResult: lastResult || FALLBACK.lastResult,
        calendar:   calendar ? { races: calendar } : FALLBACK.calendar,
        paddock:    FALLBACK.paddock, // static news (no free F1 news API exists)
      };

      setData(newData);
      setStatus('live');
      setLastUpdated(new Date());
      setSources({
        standings:  standings?.source  || 'fallback',
        nextRace:   nextRace?.source   || 'fallback',
        lastResult: lastResult?.source || 'fallback',
        calendar:   calendar ? 'ergast' : 'fallback',
      });
    } catch (err) {
      console.warn('[useF1Data] fetch error, keeping current data:', err.message);
      setStatus(prev => prev === 'loading' ? 'offline' : prev);
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, POLL);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  return { data, status, lastUpdated, sources, forceRefresh: refresh };
}
