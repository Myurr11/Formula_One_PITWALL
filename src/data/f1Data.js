// Fallback static data — used when live APIs are unreachable.
// Updated after Round 6: Monaco GP (June 7, 2026)
// Winner: L. Norris | P2: L. Hamilton | P3: C. Leclerc

export const nextRace = {
  name: "Spanish Grand Prix",
  circuit: "Circuit de Barcelona-Catalunya",
  location: "Barcelona, Spain",
  round: 7,
  totalRounds: 22,
  date: new Date("2026-06-14T13:00:00Z"),
  raceDate: new Date("2026-06-14T13:00:00Z"),
  laps: 66,
  circuitLength: "4.657 km",
  lapRecord: { time: "1:18.149", holder: "M. Verstappen", year: 2021 },
  poleRecord: { time: "1:15.406", holder: "L. Hamilton", year: 2021 },
};

// Standings after Round 6: Monaco GP (June 7, 2026)
export const driversChampionship = [
  { pos: 1,  name: "K. Antonelli",  short: "ANT", team: "Mercedes",      nat: "ITA", pts: 131, diff: null, color: "#00D2BE" },
  { pos: 2,  name: "L. Hamilton",   short: "HAM", team: "Ferrari",       nat: "GBR", pts: 102, diff: -29,  color: "#E8002D" },
  { pos: 3,  name: "L. Norris",     short: "NOR", team: "McLaren",       nat: "GBR", pts: 98,  diff: -33,  color: "#FF8000" },
  { pos: 4,  name: "G. Russell",    short: "RUS", team: "Mercedes",      nat: "GBR", pts: 88,  diff: -43,  color: "#00D2BE" },
  { pos: 5,  name: "C. Leclerc",    short: "LEC", team: "Ferrari",       nat: "MON", pts: 85,  diff: -46,  color: "#E8002D" },
  { pos: 6,  name: "O. Piastri",    short: "PIA", team: "McLaren",       nat: "AUS", pts: 60,  diff: -71,  color: "#FF8000" },
  { pos: 7,  name: "M. Verstappen", short: "VER", team: "Red Bull",      nat: "NED", pts: 49,  diff: -82,  color: "#3671C6" },
  { pos: 8,  name: "P. Gasly",      short: "GAS", team: "Alpine",        nat: "FRA", pts: 20,  diff: -111, color: "#0093CC" },
  { pos: 9,  name: "O. Bearman",    short: "BEA", team: "Haas",          nat: "GBR", pts: 18,  diff: -113, color: "#B6BABD" },
  { pos: 10, name: "L. Lawson",     short: "LAW", team: "Racing Bulls",  nat: "NZL", pts: 16,  diff: -115, color: "#6692FF" },
  { pos: 11, name: "F. Colapinto",  short: "COL", team: "Alpine",        nat: "ARG", pts: 15,  diff: -116, color: "#0093CC" },
  { pos: 12, name: "I. Hadjar",     short: "HAD", team: "Red Bull",      nat: "FRA", pts: 14,  diff: -117, color: "#3671C6" },
  { pos: 13, name: "C. Sainz",      short: "SAI", team: "Williams",      nat: "ESP", pts: 6,   diff: -125, color: "#00A3E0" },
  { pos: 14, name: "A. Lindblad",   short: "LIN", team: "Racing Bulls",  nat: "GBR", pts: 5,   diff: -126, color: "#6692FF" },
  { pos: 15, name: "G. Bortoleto",  short: "BOR", team: "Audi",          nat: "BRA", pts: 2,   diff: -129, color: "#C0C0C0" },
  { pos: 16, name: "E. Ocon",       short: "OCO", team: "Haas",          nat: "FRA", pts: 1,   diff: -130, color: "#B6BABD" },
  { pos: 17, name: "A. Albon",      short: "ALB", team: "Williams",      nat: "THA", pts: 0,   diff: -131, color: "#00A3E0" },
  { pos: 18, name: "N. Hülkenberg", short: "HUL", team: "Audi",          nat: "GER", pts: 0,   diff: -131, color: "#C0C0C0" },
  { pos: 19, name: "L. Stroll",     short: "STR", team: "Aston Martin",  nat: "CAN", pts: 0,   diff: -131, color: "#006F62" },
  { pos: 20, name: "F. Alonso",     short: "ALO", team: "Aston Martin",  nat: "ESP", pts: 0,   diff: -131, color: "#006F62" },
];

// Constructors after Round 6: Monaco GP
export const constructorsChampionship = [
  { pos: 1,  name: "Mercedes-AMG",    pts: 219, color: "#00D2BE", engine: "Mercedes PU · GBR" },
  { pos: 2,  name: "Scuderia Ferrari", pts: 187, color: "#E8002D", engine: "Ferrari PU · ITA" },
  { pos: 3,  name: "McLaren",          pts: 158, color: "#FF8000", engine: "Mercedes PU · GBR" },
  { pos: 4,  name: "Red Bull Racing",  pts: 63,  color: "#3671C6", engine: "Red Bull Ford · AUT" },
  { pos: 5,  name: "Alpine",           pts: 35,  color: "#0093CC", engine: "Mercedes PU · FRA" },
  { pos: 6,  name: "Racing Bulls",     pts: 21,  color: "#6692FF", engine: "Red Bull Ford · ITA" },
  { pos: 7,  name: "Haas F1",          pts: 19,  color: "#B6BABD", engine: "Ferrari PU · USA" },
  { pos: 8,  name: "Williams",         pts: 6,   color: "#00A3E0", engine: "Mercedes PU · GBR" },
  { pos: 9,  name: "Audi",             pts: 2,   color: "#C0C0C0", engine: "Audi PU · DEU" },
  { pos: 10, name: "Aston Martin",     pts: 0,   color: "#006F62", engine: "Honda PU · GBR" },
  { pos: 11, name: "Cadillac",         pts: 0,   color: "#D4AF37", engine: "Ferrari PU · USA" },
];

// Real 2026 calendar — 22 rounds. raceDate ISO strings allow Calendar.js to
// correctly derive status from actual dates (never rely on stored status strings).
export const seasonCalendar = [
  { round: 1,  name: "Australian Grand Prix",    shortName: "Australian GP",    circuit: "Albert Park Grand Prix Circuit",    country: "AU", date: "Mar 6–8",      raceDate: "2026-03-08T05:00:00Z", winner: "G. Russell",   winnerColor: "#00D2BE" },
  { round: 2,  name: "Chinese Grand Prix",       shortName: "Chinese GP",       circuit: "Shanghai International Circuit",    country: "CN", date: "Mar 13–15",    raceDate: "2026-03-15T07:00:00Z", winner: "K. Antonelli", winnerColor: "#00D2BE", isSprint: true },
  { round: 3,  name: "Japanese Grand Prix",      shortName: "Japanese GP",      circuit: "Suzuka Circuit",                    country: "JP", date: "Mar 27–29",    raceDate: "2026-03-29T05:00:00Z", winner: "K. Antonelli", winnerColor: "#00D2BE" },
  { round: 4,  name: "Miami Grand Prix",         shortName: "Miami GP",         circuit: "Miami International Autodrome",     country: "US", date: "May 1–3",      raceDate: "2026-05-03T19:00:00Z", winner: "K. Antonelli", winnerColor: "#00D2BE", isSprint: true },
  { round: 5,  name: "Canadian Grand Prix",      shortName: "Canadian GP",      circuit: "Circuit Gilles Villeneuve",         country: "CA", date: "May 22–24",    raceDate: "2026-05-24T18:00:00Z", winner: "K. Antonelli", winnerColor: "#00D2BE", isSprint: true },
  { round: 6,  name: "Monaco Grand Prix",        shortName: "Monaco GP",        circuit: "Circuit de Monaco",                 country: "MC", date: "Jun 5–7",      raceDate: "2026-06-07T13:00:00Z", winner: "L. Norris",    winnerColor: "#FF8000" },
  { round: 7,  name: "Spanish Grand Prix",       shortName: "Spanish GP",       circuit: "Circuit de Barcelona-Catalunya",    country: "ES", date: "Jun 12–14",    raceDate: "2026-06-14T13:00:00Z", winner: null },
  { round: 8,  name: "Austrian Grand Prix",      shortName: "Austrian GP",      circuit: "Red Bull Ring",                     country: "AT", date: "Jun 26–28",    raceDate: "2026-06-28T13:00:00Z", winner: null },
  { round: 9,  name: "British Grand Prix",       shortName: "British GP",       circuit: "Silverstone Circuit",               country: "GB", date: "Jul 3–5",      raceDate: "2026-07-05T13:00:00Z", winner: null, isSprint: true },
  { round: 10, name: "Belgian Grand Prix",       shortName: "Belgian GP",       circuit: "Circuit de Spa-Francorchamps",      country: "BE", date: "Jul 17–19",    raceDate: "2026-07-19T13:00:00Z", winner: null },
  { round: 11, name: "Hungarian Grand Prix",     shortName: "Hungarian GP",     circuit: "Hungaroring",                       country: "HU", date: "Jul 24–26",    raceDate: "2026-07-26T13:00:00Z", winner: null },
  { round: 12, name: "Dutch Grand Prix",         shortName: "Dutch GP",         circuit: "Circuit Zandvoort",                 country: "NL", date: "Aug 21–23",    raceDate: "2026-08-23T13:00:00Z", winner: null, isSprint: true },
  { round: 13, name: "Italian Grand Prix",       shortName: "Italian GP",       circuit: "Autodromo Nazionale Monza",         country: "IT", date: "Sep 4–6",      raceDate: "2026-09-06T13:00:00Z", winner: null },
  { round: 14, name: "Madrid Grand Prix",        shortName: "Madrid GP",        circuit: "Madring",                           country: "ES", date: "Sep 11–13",    raceDate: "2026-09-13T13:00:00Z", winner: null },
  { round: 15, name: "Azerbaijan Grand Prix",    shortName: "Azerbaijan GP",    circuit: "Baku City Circuit",                 country: "AZ", date: "Sep 25–27",    raceDate: "2026-09-27T11:00:00Z", winner: null },
  { round: 16, name: "Singapore Grand Prix",     shortName: "Singapore GP",     circuit: "Marina Bay Street Circuit",         country: "SG", date: "Oct 9–11",     raceDate: "2026-10-11T09:00:00Z", winner: null, isSprint: true },
  { round: 17, name: "United States Grand Prix", shortName: "United States GP", circuit: "Circuit of the Americas",           country: "US", date: "Oct 23–25",    raceDate: "2026-10-25T19:00:00Z", winner: null },
  { round: 18, name: "Mexico City Grand Prix",   shortName: "Mexico GP",        circuit: "Autódromo Hermanos Rodríguez",      country: "MX", date: "Oct 30–Nov 1", raceDate: "2026-11-01T20:00:00Z", winner: null },
  { round: 19, name: "Brazilian Grand Prix",     shortName: "Brazilian GP",     circuit: "Autódromo José Carlos Pace",        country: "BR", date: "Nov 6–8",      raceDate: "2026-11-08T17:00:00Z", winner: null },
  { round: 20, name: "Las Vegas Grand Prix",     shortName: "Las Vegas GP",     circuit: "Las Vegas Strip Circuit",           country: "US", date: "Nov 19–21",    raceDate: "2026-11-22T06:00:00Z", winner: null },
  { round: 21, name: "Qatar Grand Prix",         shortName: "Qatar GP",         circuit: "Lusail International Circuit",      country: "QA", date: "Nov 27–29",    raceDate: "2026-11-29T15:00:00Z", winner: null },
  { round: 22, name: "Abu Dhabi Grand Prix",     shortName: "Abu Dhabi GP",     circuit: "Yas Marina Circuit",                country: "AE", date: "Dec 4–6",      raceDate: "2026-12-06T13:00:00Z", winner: null },
];

// Paddock intel — fallback stories shown when APIs are unreachable
// Updated after Monaco GP (Round 6, June 7 2026)
export const paddockIntel = [
  {
    type: "RACE RESULT",
    tag: "hot",
    headline: "Norris wins Monaco — Hamilton surges to P2 in the championship",
    body: "Lando Norris took a measured victory at Monaco GP, with Lewis Hamilton finishing P2 on track to vault to second in the drivers' standings. Leclerc completed the podium on home soil.",
    timestamp: "2026-06-07T16:00:00Z",
  },
  {
    type: "CHAMPIONSHIP",
    tag: "official",
    headline: "Antonelli leads by 29 pts over Hamilton after Monaco",
    body: "Kimi Antonelli's championship lead was cut from 43 to 29 points after Monaco. Hamilton's podium has shaken up the standings — three different teams split the top 5 in the drivers' championship.",
    timestamp: "2026-06-07T17:00:00Z",
  },
  {
    type: "CONSTRUCTOR",
    tag: "news",
    headline: "McLaren close gap on Ferrari in constructors fight",
    body: "McLaren's Monaco 1-5 haul has slashed Ferrari's advantage in the constructors' championship. Norris now sits P3 in the drivers' standings — McLaren's title defence is firmly alive.",
    timestamp: "2026-06-07T17:30:00Z",
  },
  {
    type: "NEXT RACE",
    tag: "preview",
    headline: "Barcelona next — can Mercedes bounce back on a power circuit?",
    body: "Spanish GP, Circuit de Barcelona-Catalunya, June 14. After struggling at Monaco, the Mercedes W17 should be far more competitive on the high-speed Spanish layout.",
    timestamp: "2026-06-08T08:00:00Z",
  },
  {
    type: "CALENDAR",
    tag: "official",
    headline: "22-round season confirmed — Bahrain & Saudi Arabia removed",
    body: "The 2026 season runs to 22 rounds following cancellations of the Bahrain and Saudi Arabian GPs due to regional instability. Abu Dhabi remains the season finale on December 6.",
    timestamp: "2026-03-01T08:00:00Z",
  },
];


// Monaco GP top 5 results (Round 6, June 7 2026)
export const lastRaceResults = [
  { pos: 1, driver: "L. Norris",     team: "McLaren",  time: "Race Win", gap: null,       color: "#FF8000" },
  { pos: 2, driver: "L. Hamilton",   team: "Ferrari",  time: "+3.1s",    gap: "+3.1s",    color: "#E8002D" },
  { pos: 3, driver: "C. Leclerc",    team: "Ferrari",  time: "+5.8s",    gap: "+5.8s",    color: "#E8002D" },
  { pos: 4, driver: "M. Verstappen", team: "Red Bull", time: "+12.4s",   gap: "+12.4s",   color: "#3671C6" },
  { pos: 5, driver: "O. Piastri",    team: "McLaren",  time: "+18.9s",   gap: "+18.9s",   color: "#FF8000" },
];

// Per-round winner history
export const raceWinners = [
  { round: 1, gp: "Australia", winner: "G. Russell",   team: "Mercedes", color: "#00D2BE" },
  { round: 2, gp: "China",     winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 3, gp: "Japan",     winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 4, gp: "Miami",     winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 5, gp: "Canada",    winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 6, gp: "Monaco",    winner: "L. Norris",    team: "McLaren",  color: "#FF8000" },
];
