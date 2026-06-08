import { useState, useEffect, useCallback, useRef } from 'react';
import {
  driversChampionship as fbDrivers,
  constructorsChampionship as fbConstructors,
  seasonCalendar as fbCalendar,
  nextRace as fbNextRace,
  lastRaceResults as fbLastResult,
} from '../data/f1Data';
import { OPENF1_BASE as OPENF1, ERGAST_BASE as ERGAST, F1API_BASE as F1API, safeGet } from './apiConfig';

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

function fmt(d) {
  return `${d.Driver.givenName[0]}. ${d.Driver.familyName}`;
}

// ─── STANDINGS — tries multiple sources, picks most up-to-date ────────────────
async function fetchStandings() {
  const year = new Date().getFullYear();

  // Run all three in parallel
  const [f1api, ergastD, ergastC] = await Promise.all([
    safeGet(`${F1API}/${year}/drivers-championship`),
    safeGet(`${ERGAST}/current/driverStandings.json`),
    safeGet(`${ERGAST}/current/constructorStandings.json`),
  ]);

  // Parse f1api.dev
  let f1apiResult = null;
  if (f1api?.drivers_championship?.length) {
    try {
      const drivers = f1api.drivers_championship.map((d, i) => ({
        pos:   i + 1,
        name:  `${(d.driver?.name||'').split(' ')[0]?.[0]||''}. ${d.driver?.surname||d.driver?.name||''}`.trim(),
        short: (d.driver?.surname||'').slice(0,3).toUpperCase(),
        team:  d.team?.teamName || d.team?.name || '',
        nat:   NAT_MAP[d.driver?.nationality] || (d.driver?.nationality||'').slice(0,3).toUpperCase() || '—',
        pts:   Number(d.points)||0,
        diff:  i===0 ? null : -(Number(f1api.drivers_championship[0].points)-Number(d.points)),
        color: getColor(d.team?.teamName||d.team?.name||''),
      }));
      f1apiResult = { drivers, roundsComplete: Number(f1api.round)||0, source:'f1api.dev' };
    } catch(e) { /* ignore parse error */ }
  }

  // Parse Ergast drivers
  const sl = ergastD?.MRData?.StandingsTable?.StandingsLists?.[0];
  const cl = ergastC?.MRData?.StandingsTable?.StandingsLists?.[0];
  let ergastResult = null;
  if (sl?.DriverStandings?.length) {
    const drivers = sl.DriverStandings.map((d, i) => {
      const team = d.Constructors?.[0]?.name || '';
      return {
        pos:   Number(d.position),
        name:  `${d.Driver.givenName[0]}. ${d.Driver.familyName}`,
        short: d.Driver.code || d.Driver.familyName.slice(0,3).toUpperCase(),
        team,
        nat:   NAT_MAP[d.Driver.nationality] || d.Driver.nationality?.slice(0,3).toUpperCase() || '—',
        pts:   Number(d.points),
        diff:  i===0 ? null : -(Number(sl.DriverStandings[0].points)-Number(d.points)),
        color: getColor(team),
      };
    });
    const constructors = (cl?.ConstructorStandings||[]).map(t => ({
      pos:    Number(t.position),
      name:   t.Constructor.name,
      pts:    Number(t.points),
      color:  getColor(t.Constructor.name),
      engine: '',
    }));
    ergastResult = { drivers, constructors, roundsComplete: Number(sl.round)||0, source:'ergast' };
  }

  // Pick whichever has the most rounds completed
  const best = [f1apiResult, ergastResult]
    .filter(Boolean)
    .sort((a,b) => b.roundsComplete - a.roundsComplete)[0];

  if (!best) return null;

  // Add constructors from ergast if f1api won but has no constructors
  if (best.source === 'f1api.dev' && !best.constructors && ergastResult?.constructors) {
    best.constructors = ergastResult.constructors;
  }

  console.log(`[Standings] Using ${best.source}, round ${best.roundsComplete}`);
  return best;
}

// ─── NEXT RACE ────────────────────────────────────────────────────────────────
async function fetchNextRace() {
  const eg   = await safeGet(`${ERGAST}/current/next.json`);
  const race  = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const raceDateStr = `${race.date}T${race.time || '14:00:00Z'}`;
  return {
    name:          race.raceName,
    circuit:       race.Circuit?.circuitName || '',
    location:      `${race.Circuit?.Location?.locality||''}, ${race.Circuit?.Location?.country||''}`,
    round:         Number(race.round),
    totalRounds:   22,
    raceDate:      raceDateStr,
    date:          raceDateStr,
    sessionDates:  { race: raceDateStr },
    isSprint:      false,
    source:        'ergast',
  };
}

// ─── LAST RESULT ──────────────────────────────────────────────────────────────
async function fetchLastResult() {
  const eg   = await safeGet(`${ERGAST}/current/last/results.json`);
  const race  = eg?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const results = race.Results || [];
  const top10 = results.slice(0,10).map(r => ({
    pos:    Number(r.position),
    driver: fmt(r),
    team:   r.Constructor.name,
    time:   r.Time?.time || r.status || '—',
    gap:    Number(r.position)===1 ? null : (r.Time?.time ? `+${r.Time.time}` : null),
    color:  getColor(r.Constructor.name),
    points: Number(r.points),
    laps:   Number(r.laps),
    status: r.status,
  }));

  const flResult = results.find(r => r.FastestLap?.rank==='1');
  const fastestLap = flResult ? {
    driver: fmt(flResult),
    time:   flResult.FastestLap?.Time?.time || '—',
    lap:    Number(flResult.FastestLap?.lap) || null,
  } : null;

  const retirements = results
    .filter(r => r.status!=='Finished' && !r.status.startsWith('+') && !r.status.toLowerCase().startsWith('lapped') && r.status!=='Did not start')
    .map(r => ({ driver:fmt(r), team:r.Constructor.name, reason:r.status, lap:Number(r.laps)||null, color:getColor(r.Constructor.name) }));

  const poleDriver = results.find(r => r.grid==='1');

  return {
    raceName:    race.raceName,
    circuit:     race.Circuit?.circuitName || '',
    date:        race.date,
    round:       Number(race.round),
    podium:      top10.slice(0,3),
    top10,
    retirements,
    fastestLap,
    polePosition: poleDriver ? fmt(poleDriver) : null,
    sprintWinner: null,
    source:      'ergast',
  };
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
async function fetchCalendar() {
  const [schedule, winners] = await Promise.all([
    safeGet(`${ERGAST}/current.json`),
    safeGet(`${ERGAST}/current/results/1.json`),
  ]);

  const races = schedule?.MRData?.RaceTable?.Races;
  if (!races) return null;

  const winnerMap = {};
  (winners?.MRData?.RaceTable?.Races||[]).forEach(r => {
    const w = r.Results?.[0];
    if (w) winnerMap[Number(r.round)] = {
      name:  fmt(w), team: w.Constructor.name, color: getColor(w.Constructor.name),
    };
  });

  return races.map(r => {
    const roundNum = Number(r.round);
    const winner   = winnerMap[roundNum];
    const raceDateStr = `${r.date}T${r.time||'13:00:00Z'}`;
    return {
      round:       roundNum,
      name:        r.raceName,
      shortName:   r.raceName.replace(' Grand Prix',' GP'),
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

// ─── PADDOCK INTEL — built from real live data, no static stories ─────────────
async function fetchPaddockIntel(lastResult) {
  const news = [];

  // Story 1: last race winner
  if (lastResult?.raceName && lastResult?.podium?.[0]) {
    const p1 = lastResult.podium[0];
    const p2 = lastResult.podium[1];
    const p3 = lastResult.podium[2];
    news.push({
      type: 'RACE RESULT',
      tag:  'hot',
      headline: `${p1?.driver?.split(' ').pop()} wins the ${lastResult.raceName}`,
      body: `${p1?.driver} (${p1?.team}) takes victory at the ${lastResult.raceName}.`
        + (p2 ? ` ${p2.driver} finishes P2` : '')
        + (p3 ? `, ${p3.driver} completes the podium.` : '.'),
      timestamp: new Date(`${lastResult.date}T16:00:00Z`).toISOString(),
    });
  }

  // Story 2: fastest lap
  if (lastResult?.fastestLap) {
    const fl = lastResult.fastestLap;
    news.push({
      type: 'FASTEST LAP',
      tag:  'news',
      headline: `${fl.driver?.split(' ').pop()} sets fastest lap at ${lastResult.raceName}`,
      body: `${fl.driver} recorded the fastest lap of the race with a ${fl.time} on lap ${fl.lap}.`,
      timestamp: new Date(`${lastResult.date}T16:30:00Z`).toISOString(),
    });
  }

  // Story 3: retirements
  if (lastResult?.retirements?.length > 0) {
    const dnfs = lastResult.retirements;
    news.push({
      type: 'INCIDENTS',
      tag:  'news',
      headline: `${dnfs.length} retirement${dnfs.length>1?'s':''} at the ${lastResult?.raceName||'last race'}`,
      body: dnfs.map(d=>`${d.driver} (${d.reason}${d.lap?', L'+d.lap:''})`).join(' · '),
      timestamp: new Date(`${lastResult.date}T17:00:00Z`).toISOString(),
    });
  }

  // Story 4: standings leader after last race
  const standings = await safeGet(`${ERGAST}/current/driverStandings.json`);
  const sl = standings?.MRData?.StandingsTable?.StandingsLists?.[0];
  if (sl?.DriverStandings?.length >= 2) {
    const p1 = sl.DriverStandings[0];
    const p2 = sl.DriverStandings[1];
    const gap = Number(p1.points) - Number(p2.points);
    news.push({
      type: 'CHAMPIONSHIP',
      tag:  'official',
      headline: `${p1.Driver.familyName} leads championship by ${gap} point${gap!==1?'s':''} after R${sl.round}`,
      body: `${fmt(p1)} (${p1.Constructors?.[0]?.name}) tops the standings with ${p1.points} pts. `
        + `${fmt(p2)} is ${gap} points behind in P2 with ${p2.points} pts.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Story 5: next race preview from Ergast
  const nextData = await safeGet(`${ERGAST}/current/next.json`);
  const nextRace = nextData?.MRData?.RaceTable?.Races?.[0];
  if (nextRace) {
    const raceDate = new Date(`${nextRace.date}T${nextRace.time||'14:00:00Z'}`);
    const daysAway = Math.ceil((raceDate - new Date()) / 86400000);
    news.push({
      type: 'NEXT RACE',
      tag:  'preview',
      headline: `Round ${nextRace.round}: ${nextRace.raceName} in ${daysAway > 0 ? daysAway+' days' : 'progress'}`,
      body: `${nextRace.raceName} takes place at ${nextRace.Circuit?.circuitName||''} in ${nextRace.Circuit?.Location?.locality||''}, ${nextRace.Circuit?.Location?.country||''}.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Story 6: live race control messages from OpenF1 (if race weekend active)
  try {
    const year = new Date().getFullYear();
    const meetings = await safeGet(`${OPENF1}/meetings?year=${year}`);
    if (meetings?.length) {
      const now = new Date();
      const activeMeeting = meetings.find(m => {
        const start = new Date(m.date_start);
        const end   = new Date(start.getTime() + 5 * 24 * 3600000);
        return now >= start && now <= end;
      });
      if (activeMeeting) {
        const sessions = await safeGet(`${OPENF1}/sessions?meeting_key=${activeMeeting.meeting_key}&year=${year}`);
        const recentSession = sessions?.filter(s => new Date(s.date_start) <= now)
                                       .sort((a,b) => new Date(b.date_start)-new Date(a.date_start))[0];
        if (recentSession) {
          const raceControl = await safeGet(`${OPENF1}/race_control?session_key=${recentSession.session_key}`);
          const interesting = raceControl?.filter(m =>
            ['RED FLAG','SAFETY CAR','VIRTUAL SAFETY CAR','DRS','PENALTY','BLACK AND WHITE','STOP AND GO'].some(k => m.message?.toUpperCase().includes(k))
          ).slice(-3);
          if (interesting?.length) {
            news.unshift({
              type: 'RACE CONTROL',
              tag:  'hot',
              headline: `Race control: ${interesting[interesting.length-1].message}`,
              body: interesting.map(m => `[${m.message}]`).join(' · '),
              timestamp: new Date(interesting[interesting.length-1].date || now).toISOString(),
            });
          }
        }
      }
    }
  } catch(e) { /* OpenF1 race control is bonus, don't fail on it */ }

  return { news: news.slice(0,6) };
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
const FALLBACK_STANDINGS = { drivers: fbDrivers, constructors: fbConstructors, roundsComplete: 5 };

export function useF1Data() {
  const [data,        setData]        = useState({
    standings:  FALLBACK_STANDINGS,
    nextRace:   { ...fbNextRace, raceDate: fbNextRace.date },
    calendar:   { races: fbCalendar },
    lastResult: {
      raceName:'Canadian Grand Prix', circuit:'Circuit Gilles Villeneuve', round:5,
      podium:fbLastResult.slice(0,3), top10:fbLastResult,
      retirements:[
        { driver:'G. Russell', team:'Mercedes', reason:'Power unit', lap:29, color:'#00D2BE' },
        { driver:'L. Norris',  team:'McLaren',  reason:'Retired',   lap:38, color:'#FF8000' },
      ],
      fastestLap:{ driver:'K. Antonelli', time:'1:14.210', lap:68 },
      polePosition:'G. Russell', sprintWinner:'G. Russell',
    },
    paddock:    { news:[] },
  });
  const [status,      setStatus]      = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sources,     setSources]     = useState({});
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      // Step 1: fetch everything except paddock
      const [standings, nextRace, lastResult, calendar] = await Promise.all([
        fetchStandings(),
        fetchNextRace(),
        fetchLastResult(),
        fetchCalendar(),
      ]);

      // Step 2: build paddock intel from live data
      const paddock = await fetchPaddockIntel(lastResult);

      setData(prev => ({
        standings:  standings  || prev.standings,
        nextRace:   nextRace   || prev.nextRace,
        lastResult: lastResult || prev.lastResult,
        calendar:   calendar ? { races: calendar } : prev.calendar,
        paddock:    paddock || prev.paddock,
      }));
      setStatus('live');
      setLastUpdated(new Date());
      setSources({
        standings:  standings?.source  || 'fallback',
        nextRace:   nextRace?.source   || 'fallback',
        lastResult: lastResult?.source || 'fallback',
      });
    } catch(err) {
      console.warn('[useF1Data] fetch error:', err.message);
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  return { data, status, lastUpdated, sources, forceRefresh: refresh };
}
