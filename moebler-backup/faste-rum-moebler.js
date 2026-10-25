// Møblerne, der stod fast i velkomsthallen, event-rummene og på den hemmelige etage før 25/10, kopieret fra js/velkomsthal.js
// Møblerne i velkomsthallen.  spejlet: true = møblet vender mod højre
const HAL_MOEBLER = [
  // langs højre væg (bagerst), på hver side af døren
  { type: "lobby-16", x: 1, y: 0 },
  { type: "reception-17", x: 5, y: 0 },
  { type: "lobby-11", x: 6, y: 0 },
  { type: "reception-16", x: 7, y: 0 },
  { type: "lobby-11", x: 9, y: 0 },
  { type: "lobby-11", x: 14, y: 0 },
  { type: "reception-12", x: 16, y: 0 },
  { type: "reception-07", x: 17, y: 0 },
  { type: "lobby-11", x: 20, y: 0 },
  { type: "lobby-16", x: 23, y: 0 },
  // langs venstre væg
  { type: "lobby-16", x: 0, y: 2, spejlet: true },
  { type: "lobby-02", x: 0, y: 4, spejlet: true },
  { type: "lobby-31", x: 1, y: 5 },
  { type: "lobby-07", x: 0, y: 9, spejlet: true },   // elevatoren står ved y 6–7 (js/elevator.js)
  { type: "lobby-05", x: 0, y: 11, spejlet: true },
  { type: "lobby-11", x: 0, y: 14, spejlet: true },
  { type: "reception-07", x: 0, y: 17, spejlet: true },
  { type: "lobby-02", x: 0, y: 20, spejlet: true },
  { type: "lobby-11", x: 0, y: 23, spejlet: true },
  // den store sofagruppe i midten
  { type: "taepper-08", x: 11, y: 11 },
  { type: "lobby-12", x: 11, y: 9 },
  { type: "lobby-15", x: 11, y: 10 },
  { type: "lobby-03", x: 10, y: 10 },
  { type: "lobby-20", x: 12, y: 9 },
  // sofagruppe nummer to, forrest til venstre
  { type: "taepper-08", x: 6, y: 18 },
  { type: "lobby-12", x: 6, y: 16 },
  { type: "lobby-15", x: 6, y: 17 },
  { type: "lobby-03", x: 5, y: 17 },
  { type: "lobby-20", x: 7, y: 16 },
  // hyggekrog til højre
  { type: "taepper-03", x: 19, y: 6 },
  { type: "lobby-23", x: 19, y: 10 },
  { type: "lobby-26", x: 21, y: 8 },
  { type: "lobby-24", x: 22, y: 10 },
  { type: "lobby-30", x: 21, y: 12 },
  { type: "lobby-01", x: 22, y: 13 },
  // hyggekrog forrest til højre
  { type: "taepper-03", x: 17, y: 18 },
  { type: "lobby-23", x: 17, y: 21 },
  { type: "lobby-26", x: 20, y: 19 },
  { type: "lobby-24", x: 21, y: 21 },
  { type: "lobby-30", x: 19, y: 22 },
  { type: "lobby-01", x: 22, y: 22 },
  // forrest
  { type: "lobby-08", x: 3, y: 21 },
  { type: "lobby-32", x: 2, y: 20 },
  { type: "lobby-29", x: 13, y: 22 },
  { type: "lobby-29", x: 9, y: 23 },
];
const HEMMELIG_MOEBLER = [
  { type: "lobby-16", x: 0, y: 0 }, { type: "lobby-11", x: 3, y: 0 }, { type: "lobby-11", x: 8, y: 0 }, { type: "lobby-16", x: 11, y: 0 },
  { type: "lobby-16", x: 0, y: 11, spejlet: true }, { type: "lobby-11", x: 0, y: 6, spejlet: true },
  { type: "taepper-03", x: 6, y: 2 }, { type: "lobby-26", x: 2, y: 6 }, { type: "lobby-24", x: 10, y: 9 },
];

// Event-rummene på 1. sal (js/eventrum.js). Ejeren og Eventværter kan låse dem.
const EVENT_RUM = [
  { id: "event1", navn: "Event rum 1", vaeg: "#7d62a8", gulv1: "#d9cdea", gulv2: "#c9badf" },
  { id: "event2", navn: "Event rum 2", vaeg: "#b8483f", gulv1: "#d8b47a", gulv2: "#c9a46c" },
  { id: "event3", navn: "Event rum 3", vaeg: "#3f4d72", gulv1: "#e9e6e1", gulv2: "#d6d2cb" },
  { id: "event4", navn: "Event rum 4", vaeg: "#4e7d4a", gulv1: "#ecd7a6", gulv2: "#e0c992" },
].map(function (r) { return Object.assign({ ejer: EJER_NAVNE[0], bredde: 14, dybde: 14, vaegHoejde: 170, doer: { x: 0, y: 7 }, event: true }, r); });
const EVENT_MOEBLER = [
  { type: "taepper-08", x: 7, y: 7 }, { type: "lobby-11", x: 2, y: 0 }, { type: "lobby-11", x: 11, y: 0 },
  { type: "lobby-16", x: 0, y: 0 }, { type: "lobby-16", x: 13, y: 0 }, { type: "lobby-16", x: 0, y: 13, spejlet: true },
  { type: "lobby-12", x: 4, y: 3 }, { type: "lobby-20", x: 5, y: 3 }, { type: "lobby-12", x: 9, y: 3 }, { type: "lobby-20", x: 10, y: 3 },
];
