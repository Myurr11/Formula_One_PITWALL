// All data is REAL — sourced from official F1 results after Round 5 (Canadian GP, May 24 2026)
// Next race: Monaco GP, Round 6, June 5–7 2026

export const nextRace = {
  name: "Monaco Grand Prix",
  circuit: "Circuit de Monaco",
  location: "Monte Carlo, Monaco",
  round: 6,
  totalRounds: 22,
  date: new Date("2026-06-07T13:00:00Z"), // Race start: 15:00 local (UTC+2)
  laps: 78,
  circuitLength: "3.337 km",
  lapRecord: { time: "1:12.909", holder: "L. Hamilton", year: 2021 },
  poleRecord: { time: "1:10.166", holder: "C. Leclerc", year: 2022 },
};

// Real standings after Round 5, Canadian GP (May 24, 2026)
export const driversChampionship = [
  { pos: 1, name: "K. Antonelli", short: "ANT", team: "Mercedes", nat: "ITA", pts: 131, diff: null, color: "#00D2BE" },
  { pos: 2, name: "G. Russell", short: "RUS", team: "Mercedes", nat: "GBR", pts: 88, diff: -43, color: "#00D2BE" },
  { pos: 3, name: "C. Leclerc", short: "LEC", team: "Ferrari", nat: "MON", pts: 75, diff: -56, color: "#E8002D" },
  { pos: 4, name: "L. Hamilton", short: "HAM", team: "Ferrari", nat: "GBR", pts: 72, diff: -59, color: "#E8002D" },
  { pos: 5, name: "L. Norris", short: "NOR", team: "McLaren", nat: "GBR", pts: 58, diff: -73, color: "#FF8000" },
  { pos: 6, name: "O. Piastri", short: "PIA", team: "McLaren", nat: "AUS", pts: 48, diff: -83, color: "#FF8000" },
  { pos: 7, name: "M. Verstappen", short: "VER", team: "Red Bull", nat: "NED", pts: 43, diff: -88, color: "#3671C6" },
  { pos: 8, name: "P. Gasly", short: "GAS", team: "Alpine", nat: "FRA", pts: 20, diff: -111, color: "#0093CC" },
  { pos: 9, name: "O. Bearman", short: "BEA", team: "Haas", nat: "GBR", pts: 18, diff: -113, color: "#B6BABD" },
  { pos: 10, name: "L. Lawson", short: "LAW", team: "Racing Bulls", nat: "NZL", pts: 16, diff: -115, color: "#6692FF" },
  { pos: 11, name: "F. Colapinto", short: "COL", team: "Alpine", nat: "ARG", pts: 15, diff: -116, color: "#0093CC" },
  { pos: 12, name: "I. Hadjar", short: "HAD", team: "Red Bull", nat: "FRA", pts: 14, diff: -117, color: "#3671C6" },
  { pos: 13, name: "C. Sainz", short: "SAI", team: "Williams", nat: "ESP", pts: 6, diff: -125, color: "#00A3E0" },
  { pos: 14, name: "A. Lindblad", short: "LIN", team: "Racing Bulls", nat: "GBR", pts: 5, diff: -126, color: "#6692FF" },
  { pos: 15, name: "G. Bortoleto", short: "BOR", team: "Audi", nat: "BRA", pts: 2, diff: -129, color: "#C0C0C0" },
  { pos: 16, name: "E. Ocon", short: "OCO", team: "Haas", nat: "FRA", pts: 1, diff: -130, color: "#B6BABD" },
  { pos: 17, name: "A. Albon", short: "ALB", team: "Williams", nat: "THA", pts: 0, diff: -131, color: "#00A3E0" },
  { pos: 18, name: "N. Hülkenberg", short: "HUL", team: "Audi", nat: "GER", pts: 0, diff: -131, color: "#C0C0C0" },
  { pos: 19, name: "L. Stroll", short: "STR", team: "Aston Martin", nat: "CAN", pts: 0, diff: -131, color: "#006F62" },
  { pos: 20, name: "F. Alonso", short: "ALO", team: "Aston Martin", nat: "ESP", pts: 0, diff: -131, color: "#006F62" },
];

// Real constructors standings after Round 5 (Canadian GP)
export const constructorsChampionship = [
  { pos: 1, name: "Mercedes-AMG",    pts: 219, color: "#00D2BE", engine: "Mercedes PU · GBR" },
  { pos: 2, name: "Scuderia Ferrari", pts: 147, color: "#E8002D", engine: "Ferrari PU · ITA" },
  { pos: 3, name: "McLaren",          pts: 106, color: "#FF8000", engine: "Mercedes PU · GBR" },
  { pos: 4, name: "Red Bull Racing",  pts: 57,  color: "#3671C6", engine: "Red Bull Ford · AUT" },
  { pos: 5, name: "Alpine",           pts: 35,  color: "#0093CC", engine: "Mercedes PU · FRA" },
  { pos: 6, name: "Racing Bulls",     pts: 21,  color: "#6692FF", engine: "Red Bull Ford · ITA" },
  { pos: 7, name: "Haas F1",          pts: 19,  color: "#B6BABD", engine: "Ferrari PU · USA" },
  { pos: 8, name: "Williams",         pts: 6,   color: "#00A3E0", engine: "Mercedes PU · GBR" },
  { pos: 9, name: "Audi",             pts: 2,   color: "#C0C0C0", engine: "Audi PU · DEU" },
  { pos: 10, name: "Aston Martin",    pts: 0,   color: "#006F62", engine: "Honda PU · GBR" },
  { pos: 11, name: "Cadillac",        pts: 0,   color: "#D4AF37", engine: "Ferrari PU · USA" },
];

// Real 2026 calendar — 22 rounds (Bahrain & Saudi Arabia cancelled due to Iran conflict)
export const seasonCalendar = [
  { round: 1,  name: "Australian GP",       circuit: "Albert Park",             country: "AU", date: "Mar 6–8",   winner: "G. Russell",    status: "done" },
  { round: 2,  name: "Chinese GP",          circuit: "Shanghai",                country: "CN", date: "Mar 13–15", winner: "K. Antonelli",  status: "done", sprint: true },
  { round: 3,  name: "Japanese GP",         circuit: "Suzuka",                  country: "JP", date: "Mar 27–29", winner: "K. Antonelli",  status: "done" },
  { round: 4,  name: "Miami GP",            circuit: "Miami International",     country: "US", date: "May 1–3",   winner: "K. Antonelli",  status: "done", sprint: true },
  { round: 5,  name: "Canadian GP",         circuit: "Gilles Villeneuve",       country: "CA", date: "May 22–24", winner: "K. Antonelli",  status: "done", sprint: true },
  { round: 6,  name: "Monaco GP",           circuit: "Circuit de Monaco",       country: "MC", date: "Jun 5–7",   winner: null,            status: "next" },
  { round: 7,  name: "Spanish GP",          circuit: "Circuit de Barcelona",    country: "ES", date: "Jun 12–14", winner: null,            status: "upcoming" },
  { round: 8,  name: "Austrian GP",         circuit: "Red Bull Ring",           country: "AT", date: "Jun 26–28", winner: null,            status: "upcoming" },
  { round: 9,  name: "British GP",          circuit: "Silverstone",             country: "GB", date: "Jul 3–5",   winner: null,            status: "upcoming", sprint: true },
  { round: 10, name: "Belgian GP",          circuit: "Spa-Francorchamps",       country: "BE", date: "Jul 17–19", winner: null,            status: "upcoming" },
  { round: 11, name: "Hungarian GP",        circuit: "Hungaroring",             country: "HU", date: "Jul 24–26", winner: null,            status: "upcoming" },
  { round: 12, name: "Dutch GP",            circuit: "Zandvoort",               country: "NL", date: "Aug 21–23", winner: null,            status: "upcoming", sprint: true },
  { round: 13, name: "Italian GP",          circuit: "Monza",                   country: "IT", date: "Sep 4–6",   winner: null,            status: "upcoming" },
  { round: 14, name: "Madrid GP",           circuit: "Madring (NEW)",           country: "ES", date: "Sep 11–13", winner: null,            status: "upcoming" },
  { round: 15, name: "Azerbaijan GP",       circuit: "Baku City Circuit",       country: "AZ", date: "Sep 25–27", winner: null,            status: "upcoming" },
  { round: 16, name: "Singapore GP",        circuit: "Marina Bay Street",       country: "SG", date: "Oct 9–11",  winner: null,            status: "upcoming", sprint: true },
  { round: 17, name: "United States GP",    circuit: "Circuit of the Americas", country: "US", date: "Oct 23–25", winner: null,            status: "upcoming" },
  { round: 18, name: "Mexico GP",           circuit: "Hermanos Rodríguez",      country: "MX", date: "Oct 30–Nov 1", winner: null,         status: "upcoming" },
  { round: 19, name: "Brazilian GP",        circuit: "Interlagos",              country: "BR", date: "Nov 6–8",   winner: null,            status: "upcoming" },
  { round: 20, name: "Las Vegas GP",        circuit: "Las Vegas Strip",         country: "US", date: "Nov 19–21", winner: null,            status: "upcoming" },
  { round: 21, name: "Qatar GP",            circuit: "Lusail",                  country: "QA", date: "Nov 27–29", winner: null,            status: "upcoming" },
  { round: 22, name: "Abu Dhabi GP",        circuit: "Yas Marina",              country: "AE", date: "Dec 4–6",   winner: null,            status: "upcoming" },
];

export const paddockIntel = [
  {
    type: "THE STORY",
    headline: "Antonelli's 4th straight win puts him 43 pts clear of Russell",
    body: "The 19-year-old Italian inherited victory in Montreal after Russell's engine blew on lap 30 while leading. Antonelli has now won China, Japan, Miami and Canada in succession — the best start for a rookie since Verstappen's 2023 domination.",
    tag: "hot",
  },
  {
    type: "DRIVER NEWS",
    headline: "Russell furious as power unit failure costs him Canada win",
    body: "George Russell took sprint pole, won the sprint, and was leading the grand prix before a sudden Mercedes power unit failure ended his race on lap 30. The Briton is now 43 points behind his rookie team-mate.",
    tag: "news",
  },
  {
    type: "COMEBACK STORY",
    headline: "Hamilton delivers best Ferrari drive yet with P2 in Montreal",
    body: "Lewis Hamilton outduelled Max Verstappen in the closing laps of the Canadian GP to claim P2 — his best result since joining Ferrari. A classic move into Turn 1 on the final stint sealed it.",
    tag: "debut",
  },
  {
    type: "CALENDAR",
    headline: "Bahrain & Saudi Arabia cancelled — season cut to 22 rounds",
    body: "America and Israel's bombing of Iran and subsequent retaliatory strikes forced the FIA to cancel both Middle East rounds. The 2026 championship now runs to 22 races, down from the planned 24.",
    tag: "official",
  },
  {
    type: "MONACO PREVIEW",
    headline: "Mercedes tipped to struggle on Monaco's slow streets",
    body: "The Silver Arrows' long-wheelbase W17 that's dominated high-speed circuits is expected to be less effective around Monte Carlo's tight, twisty layout. Ferrari and McLaren are eyeing an upset.",
    tag: "preview",
  },
];

// Real Canadian GP top 5 results
export const lastRaceResults = [
  { pos: 1, driver: "K. Antonelli", team: "Mercedes",  time: "Race Win",  gap: null,      color: "#00D2BE" },
  { pos: 2, driver: "L. Hamilton",  team: "Ferrari",   time: "+10.7s",    gap: "+10.7s",  color: "#E8002D" },
  { pos: 3, driver: "M. Verstappen",team: "Red Bull",  time: "+11.2s",    gap: "+11.2s",  color: "#3671C6" },
  { pos: 4, driver: "C. Leclerc",   team: "Ferrari",   time: "+44.1s",    gap: "+44.1s",  color: "#E8002D" },
  { pos: 5, driver: "I. Hadjar",    team: "Red Bull",  time: "+1 lap",    gap: "+1 lap",  color: "#3671C6" },
];

// Per-round winner history for season recap
export const raceWinners = [
  { round: 1, gp: "Australia",  winner: "G. Russell",   team: "Mercedes", color: "#00D2BE" },
  { round: 2, gp: "China",      winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 3, gp: "Japan",      winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 4, gp: "Miami",      winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
  { round: 5, gp: "Canada",     winner: "K. Antonelli", team: "Mercedes", color: "#00D2BE" },
];
