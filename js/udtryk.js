// =============================================================
//  Ansigtsudtryk og vink 🙂👋 (fra dit pixel-ark)
//  Kun den nye pige har dem (FIGURER.pige.poser i js/figur.js).
//  Hun viser et udtryk, når du skriver en smiley i chatten,
//  eller når du vælger det under Handlinger → Ansigt.
//  Udtrykket vises, når hun står stille, og hun vender sig mod dig.
// =============================================================
const UDTRYK = [
  { id: "neutral", navn: "Neutral", tegn: "😐" },
  { id: "smil", navn: "Smil", tegn: "🙂" },
  { id: "glad", navn: "Glad", tegn: "😊" },
  { id: "grin", navn: "Grin", tegn: "😆" },
  { id: "vred", navn: "Vred", tegn: "😠" },
  { id: "ked", navn: "Ked af det", tegn: "😢" },
  { id: "overrasket", navn: "Overrasket", tegn: "😮" },
  { id: "blink", navn: "Blink", tegn: "😄" },
  { id: "flirt", navn: "Flirt", tegn: "😉" },
  { id: "traet", navn: "Træt", tegn: "😴" },
];

// Hvilken smiley i chatten giver hvilket udtryk
const SMILEY_UDTRYK = {
  "😊": "smil", "😎": "smil", "😂": "grin", "😜": "grin", "😍": "glad", "🥳": "glad",
  "😉": "flirt", "😘": "flirt", "😮": "overrasket", "😢": "ked", "😡": "vred",
  "😴": "traet", "🤔": "neutral", "👋": "vink",
};

let udtrykSlut = 0;

function harUdtryk() {
  const f = FIGURER[garderobe.type];
  return !!(f && f.poser);
}

function visUdtryk(id, sekunder) {
  const f = FIGURER[garderobe.type];
  if (!f || !f.poser || !f.poser[id]) return;
  if (figur.sidde || figur.rute.length > 0) return;   // kun når hun står stille
  garderobe.pose = id;
  figur.retning = "ned";
  figur.forfra = true;
  udtrykSlut = performance.now() + (sekunder || 4) * 1000;
}

function stopUdtryk() {
  delete garderobe.pose;
}

// Handlinger → Ansigt
function visAnsigter() {
  minMenuKnapper.innerHTML = "";
  UDTRYK.forEach(function (u) {
    knap(u.tegn + " " + u.navn, function () { lukMinMenu(); visUdtryk(u.id, 6); });
  });
  knap("&larr; Tilbage", visHandlinger);
}

// Smileys i chatten
const sigUdtryk = sig;
sig = function (hvem, navn, tekst) {
  sigUdtryk(hvem, navn, tekst);
  if (hvem !== figur) return;
  for (const tegn in SMILEY_UDTRYK) {
    if (tekst.indexOf(tegn) >= 0) { visUdtryk(SMILEY_UDTRYK[tegn], 4); break; }
  }
};

// Udtrykket forsvinder efter lidt tid, eller når hun går eller sætter sig
const tegnBoblerUdtryk = tegnBobler;
tegnBobler = function () {
  if (garderobe.pose && (performance.now() > udtrykSlut || figur.rute.length > 0 || figur.sidde)) stopUdtryk();
  tegnBoblerUdtryk();
};
