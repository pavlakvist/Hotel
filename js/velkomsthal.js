// =============================================================
//  VELKOMSTHALLEN — det første rum, man kommer ind i, når man tjekker ind.
//  Her står møblerne fast, og andre gæster går rundt.
//  Gå gennem døren (eller tryk på knappen) for at komme til dit eget værelse.
// =============================================================

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

// Hvor stor velkomsthallen er (dit værelse har sin egen størrelse i indstillinger.js)
const HAL_STOERRELSE = { bredde: 24, dybde: 24, vaegHoejde: 240 };

// Felter, man ikke kan gå på, selvom der ikke står et møbel (fx hvis et stort møbel fylder flere felter)
const HAL_BLOKERET = [];

// Døren til værelserne (på højre væg) og feltet foran den
const HAL_DOER = { fra: 11.1, til: 11.9, hoejde: 100, felt: { x: 11, y: 0 } };

// Farver i velkomsthallen
const HAL_FARVER = {
  tapet: "#7b3328",
  tapetStribe: "#6c2a21",
  panel: "#4a2615",
  guld: "#e0a73c",
  gulv1: "#b98153",
  gulv2: "#a7713f",
};

// De andre gæster
const HAL_GAESTER = [
  { navn: "Ida", valg: { type: "pige" }, x: 4, y: 12 },
  { navn: "Noah", valg: { type: "dreng" }, x: 13, y: 4 },
  { navn: "Freja", valg: { type: "pige" }, x: 13, y: 15 },
  { navn: "Oliver", valg: { type: "dreng" }, x: 17, y: 9 },
];
HAL_GAESTER.forEach(function (g) {
  g.rute = [];
  g.retning = "ned";
  g.trin = 0;
  g.vent = 1 + Math.random() * 2;
  g.saede = null;
  g.sidder = false;
});

let mitVaerelse = [];          // møblerne i dit eget værelse
let halVilGaaUd = false;       // figuren er på vej hen til døren
let halMus = null;             // hvor musen er på lærredet (i spillets punkter)
const RUM_FARVER = { vaeg: RUM.vaegFarve, gulv1: RUM.gulvFarve1, gulv2: RUM.gulvFarve2, bredde: RUM.bredde, dybde: RUM.dybde };
// dit værelses gulvplan fra :floor (js/gulvplan.js)
try { Object.assign(RUM_FARVER, JSON.parse(localStorage.getItem("mit-hotel-rum-plan") || "{}")); } catch (e) {}


// =============================================================
//  Mine rum: dit eget værelse ("mit") + de rum du selv opretter
//  (oprettes i navigatøren under "Mine rum", js/navigator.js)
// =============================================================
const MINE_RUM_NOEGLE = "mit-hotel-mine-rum";
let mineRum = [];               // [{ id, navn, bredde, dybde, vaeg, gulv1, gulv2, oprettet }]
try { mineRum = JSON.parse(localStorage.getItem(MINE_RUM_NOEGLE) || "[]"); } catch (e) {}
function gemMineRum() {
  try { localStorage.setItem(MINE_RUM_NOEGLE, JSON.stringify(mineRum)); } catch (e) {}
}
let aktivtVaerelse = "mit";     // hvilket af dine rum du er i
let naesteVaerelse = null;      // sættes af gaaTilVaerelse()
const andreVaerelser = {};      // møblerne i de rum du har oprettet

// Rummenes former. Hver form siger, om der er gulv på feltet (x, y) i et rum på b × d felter.
const RUM_FORMER = [
  { id: "firkant", navn: "Firkant", felt: function () { return true; } },
  { id: "aflang", navn: "Aflang", felt: function () { return true; }, maal: function (s) { return [s + 4, Math.max(4, Math.round(s * 0.55))]; } },
  { id: "dyb", navn: "Lang gang", felt: function () { return true; }, maal: function (s) { return [Math.max(4, Math.round(s * 0.55)), s + 4]; } },
  { id: "l", navn: "L-form", felt: function (x, y, b, d) { return !(x >= Math.ceil(b / 2) && y >= Math.ceil(d / 2)); } },
  { id: "omvendt-l", navn: "Omvendt L", felt: function (x, y, b, d) { return !(x < Math.floor(b / 2) && y >= Math.ceil(d / 2)); } },
  { id: "t", navn: "T-form", felt: function (x, y, b, d) { return y < Math.ceil(d / 2) || (x >= Math.floor(b / 3) && x < Math.ceil(b * 2 / 3)); } },
  { id: "u", navn: "U-form", felt: function (x, y, b, d) { return !(x >= Math.floor(b / 3) && x < Math.ceil(b * 2 / 3) && y >= Math.ceil(d / 2)); } },
  { id: "kors", navn: "Kors", felt: function (x, y, b, d) { return (x >= Math.floor(b / 3) && x < Math.ceil(b * 2 / 3)) || (y >= Math.floor(d / 3) && y < Math.ceil(d * 2 / 3)); } },
  { id: "trappe", navn: "Trappe", felt: function (x, y, b, d) { return x + y < Math.round((b + d) * 0.72); } },
  { id: "ring", navn: "Med gårdhave", felt: function (x, y, b, d) { return !(x >= Math.floor(b / 3) && x < Math.ceil(b * 2 / 3) && y >= Math.floor(d / 3) && y < Math.ceil(d * 2 / 3)); } },
];
// 50 rummodeller: 10 former i 5 størrelser
const RUM_MODELLER = [];
[["Lille", 6], ["Mellem", 8], ["Stor", 10], ["Kæmpe", 12], ["Gigant", 14]].forEach(function (str) {
  RUM_FORMER.forEach(function (f) {
    const maal = f.maal ? f.maal(str[1]) : [str[1], str[1]];
    RUM_MODELLER.push({ id: f.id + "-" + str[1], form: f.id, navn: str[0] + " " + (/^[A-ZÆØÅ][a-zæøå]/.test(f.navn) ? f.navn[0].toLowerCase() + f.navn.slice(1) : f.navn), bredde: maal[0], dybde: maal[1] });
  });
});
RUM_MODELLER.forEach(function (m, i) { m.nr = i + 1; });
// Et rum tegnet i gulvplanen (:floor) har sine felter som tekst: "x" = gulv, "." = intet
function feltForm(felter) {
  return function (x, y) { return !!felter[y] && felter[y][x] === "x"; };
}
function lavForm(formId, b, d) {
  const f = RUM_FORMER.find(function (x) { return x.id === formId; });
  if (!f || formId === "firkant" || formId === "aflang" || formId === "dyb") return null;
  return function (x, y) { return f.felt(x, y, b, d); };
}

// Den hemmelige etage (elevatoren, js/elevator.js). Kræver en nøgle fra events – ejeren kommer altid ind.
const HEMMELIG_RUM = { id: "hemmelig", navn: "Den hemmelige etage", ejer: EJER_NAVNE[0], form: "ring", bredde: 12, dybde: 12,
  vaeg: "#3f2d5c", gulv1: "#5a4680", gulv2: "#4b3a6e", vaegHoejde: 170, doer: null };
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
const INDBYGGEDE_RUM = { hemmelig: HEMMELIG_RUM };
EVENT_RUM.forEach(function (r) { INDBYGGEDE_RUM[r.id] = r; });

function vaerelseInfo(id) {
  if (id === "mit") return RUM_FARVER;
  if (INDBYGGEDE_RUM[id]) return INDBYGGEDE_RUM[id];
  return mineRum.find(function (r) { return r.id === id; }) || RUM_FARVER;
}
function vaerelseMoebler(id) {
  if (id === "mit") return mitVaerelse;
  if (!andreVaerelser[id]) {
    try { andreVaerelser[id] = JSON.parse(localStorage.getItem("mit-hotel-rum-" + id) || "null"); } catch (e) { andreVaerelser[id] = null; }
    if (!Array.isArray(andreVaerelser[id])) {
      andreVaerelser[id] = INDBYGGEDE_RUM[id] ? (id === "hemmelig" ? HEMMELIG_MOEBLER : EVENT_MOEBLER).map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; }) : [];
    }
  }
  return andreVaerelser[id];
}
function vaerelseNavn(id) {
  return id === "mit" ? "Dit værelse" : vaerelseInfo(id).navn;
}
// Gå ind i et af dine rum
function gaaTilVaerelse(id) {
  naesteVaerelse = id;
  skiftRum("vaerelse");
}


// =============================================================
//  Skift mellem velkomsthallen og dine rum
// =============================================================
function skiftRum(navn) {
  if (rumValg === "vaerelse") {
    // husk møblerne og farverne i det rum, du går ud af
    const info = vaerelseInfo(aktivtVaerelse);
    info.vaeg = RUM.vaegFarve; info.gulv1 = RUM.gulvFarve1; info.gulv2 = RUM.gulvFarve2;
    if (aktivtVaerelse === "mit") mitVaerelse = moeblerIRummet;
    else { andreVaerelser[aktivtVaerelse] = moeblerIRummet; gemMineRum(); }
  }
  if (navn === "vaerelse") {
    aktivtVaerelse = naesteVaerelse || (rumValg === "hal" ? "mit" : aktivtVaerelse);
    if (aktivtVaerelse !== "mit" && !INDBYGGEDE_RUM[aktivtVaerelse] && !mineRum.some(function (r) { return r.id === aktivtVaerelse; })) aktivtVaerelse = "mit";
  }
  naesteVaerelse = null;
  const v = vaerelseInfo(aktivtVaerelse);
  rumValg = navn;
  moeblerIRummet = navn === "hal" ? HAL_MOEBLER : vaerelseMoebler(aktivtVaerelse);
  RUM.vaegFarve = navn === "hal" ? HAL_FARVER.tapet : v.vaeg;
  RUM.gulvFarve1 = navn === "hal" ? HAL_FARVER.gulv1 : v.gulv1;
  RUM.gulvFarve2 = navn === "hal" ? HAL_FARVER.gulv2 : v.gulv2;
  RUM.bredde = navn === "hal" ? HAL_STOERRELSE.bredde : v.bredde;
  RUM.dybde = navn === "hal" ? HAL_STOERRELSE.dybde : v.dybde;
  RUM.form = navn === "hal" ? null : v.felter ? feltForm(v.felter) : v.form ? lavForm(v.form, v.bredde, v.dybde) : null;
  RUM.vaegHoejde = navn === "hal" ? HAL_STOERRELSE.vaegHoejde : v.vaegHoejde || null;
  RUM.doer = navn === "hal" ? null : v.doer || null;
  document.body.classList.toggle("i-hallen", navn === "hal");

  // figuren kommer ind gennem døren
  figur.x = navn === "hal" ? HAL_DOER.felt.x : 2;
  figur.y = navn === "hal" ? HAL_DOER.felt.y + 1 : 2;
  if (navn !== "hal" && v.doer) { figur.x = v.doer.x; figur.y = v.doer.y; }   // man kommer ind ad døren
  // i rum med en særlig form: stil figuren på det nærmeste gulv
  if (!erIRummet(figur.x, figur.y)) {
    let bedst = null;
    for (let x = 0; x < RUM.bredde; x++) for (let y = 0; y < RUM.dybde; y++) {
      if (erIRummet(x, y) && (!bedst || Math.hypot(x - 2, y - 2) < Math.hypot(bedst.x - 2, bedst.y - 2))) bedst = { x: x, y: y };
    }
    if (bedst) { figur.x = bedst.x; figur.y = bedst.y; }
  }
  figur.rute = [];
  figur.sidde = null;
  figur.skalSidde = null;
  figur.retning = "ned";
  halVilGaaUd = false;
  KAMERA.x = 0;
  KAMERA.y = 0;
  valgtType = null;
  valgtMoebel = null;

  document.getElementById("moebel-sektion").hidden = navn === "hal";
  document.getElementById("hal-sektion").hidden = navn !== "hal";
  document.getElementById("rum-navn").textContent = navn === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse);
  opdaterPanel();
  besked.textContent = navn === "hal"
    ? "Velkommen til Hotelven! Gå gennem døren for at komme til dit værelse."
    : aktivtVaerelse === "mit" ? "Velkommen hjem! Klik på gulvet for at gå, og stil møbler fra panelet."
    : "Velkommen til " + vaerelseNavn(aktivtVaerelse) + "! Stil møbler fra panelet eller dit lager.";
}

function halBlokeret(x, y) {
  return HAL_BLOKERET.indexOf(x + "," + y) >= 0;
}

document.getElementById("knap-til-vaerelse").addEventListener("click", function () { skiftRum("vaerelse"); });
document.getElementById("knap-til-hal").addEventListener("click", function () { skiftRum("hal"); });


// =============================================================
//  Væggene i velkomsthallen
// =============================================================
function halVaegStykke(a, b, h1, h2, farve) {
  polygon(ctx, [
    { x: a.x, y: a.y - h1 }, { x: b.x, y: b.y - h1 },
    { x: b.x, y: b.y - h2 }, { x: a.x, y: a.y - h2 },
  ], farve);
}

function halVaeg(a, b, laengde, moerk) {
  const VAEG_HOEJDE = RUM.vaegHoejde || 110;   // hallens vægge er højere (HAL_STOERRELSE)
  halVaegStykke(a, b, 0, VAEG_HOEJDE, HAL_FARVER.tapet);
  for (let i = 0; i < laengde * 2; i += 2) {
    const t1 = i / (laengde * 2), t2 = (i + 1) / (laengde * 2);
    halVaegStykke(
      { x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1 },
      { x: a.x + (b.x - a.x) * t2, y: a.y + (b.y - a.y) * t2 },
      34, VAEG_HOEJDE, HAL_FARVER.tapetStribe);
  }
  halVaegStykke(a, b, 0, 34, HAL_FARVER.panel);
  halVaegStykke(a, b, 32, 36, HAL_FARVER.guld);
  halVaegStykke(a, b, VAEG_HOEJDE - 6, VAEG_HOEJDE, HAL_FARVER.guld);
  if (moerk) halVaegStykke(a, b, 0, VAEG_HOEJDE, "rgba(0,0,0,0.18)");
}

function halOverDoer() {
  if (!halMus) return false;
  const a = punkt(HAL_DOER.fra, 0), b = punkt(HAL_DOER.til, 0);
  return halMus.x >= a.x && halMus.x <= b.x && halMus.y <= b.y && halMus.y >= a.y - HAL_DOER.hoejde;
}

function tegnHalVaegge() {
  halVaeg(punkt(0, RUM.dybde), punkt(0, 0), RUM.dybde, true);
  halVaeg(punkt(0, 0), punkt(RUM.bredde, 0), RUM.bredde, false);

  // døren
  const a = punkt(HAL_DOER.fra, 0), b = punkt(HAL_DOER.til, 0);
  const lys = halOverDoer() || (musFelt && musFelt.x === HAL_DOER.felt.x && musFelt.y === HAL_DOER.felt.y);
  halVaegStykke({ x: a.x - 4, y: a.y - 2 }, { x: b.x + 4, y: b.y + 2 }, 0, HAL_DOER.hoejde + 5, HAL_FARVER.guld);
  halVaegStykke(a, b, 0, HAL_DOER.hoejde, lys ? "#7a4a25" : "#5a3218");
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  halVaegStykke({ x: m.x - 1, y: m.y - 0.5 }, { x: m.x + 1, y: m.y + 0.5 }, 0, HAL_DOER.hoejde, "#3a1d0e");
  ctx.fillStyle = HAL_FARVER.guld;
  ctx.beginPath();
  ctx.arc(m.x - 5, m.y - 2.5 - 38, 2.2, 0, Math.PI * 2);
  ctx.arc(m.x + 5, m.y + 2.5 - 38, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // skiltet over døren
  const s = punkt((HAL_DOER.fra + HAL_DOER.til) / 2, 0);
  ctx.save();
  ctx.translate(s.x, s.y - 128);
  ctx.transform(1, 0.5, 0, 1, 0, 0);
  ctx.fillStyle = "#3a1d0e";
  ctx.fillRect(-62, -13, 124, 24);
  ctx.strokeStyle = HAL_FARVER.guld;
  ctx.lineWidth = 2;
  ctx.strokeRect(-60, -11, 120, 20);
  ctx.font = "bold 14px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f7c65a";
  ctx.fillText("VELKOMMEN", 0, 0);
  ctx.restore();
  ctx.lineWidth = 1;

  if (lys) {
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    const t = "Til dit værelse";
    const w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(m.x - w / 2, m.y - HAL_DOER.hoejde - 34, w, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, m.x, m.y - HAL_DOER.hoejde - 20);
  }
}

// Klik på døren = gå hen til den og ind på dit værelse
laerred.addEventListener("mousemove", function (e) {
  const r = laerred.getBoundingClientRect();
  halMus = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (rumValg === "hal") laerred.style.cursor = halOverDoer() ? "pointer" : "";
});
laerred.addEventListener("mouseleave", function () { halMus = null; });

laerred.addEventListener("click", function (e) {
  if (rumValg !== "hal") return;
  const f = musTilFelt(e);
  if (halOverDoer() || (f.x === HAL_DOER.felt.x && f.y === HAL_DOER.felt.y)) {
    e.stopImmediatePropagation();
    gaaTil(HAL_DOER.felt.x, HAL_DOER.felt.y);
    halVilGaaUd = true;
    const fig = figurFelt();
    if (fig.x === HAL_DOER.felt.x && fig.y === HAL_DOER.felt.y) skiftRum("vaerelse");
  } else {
    halVilGaaUd = false;
  }
}, true);


// =============================================================
//  De andre gæster går rundt
// =============================================================
function halFrieSaeder(g) {
  return HAL_MOEBLER.filter(function (m) {
    if (!MOEBEL_TYPER[m.type] || !MOEBEL_TYPER[m.type].saede) return false;
    return ledigPlads(m, g) >= 0;
  });
}

function halNytMaal(g) {
  const fx = Math.round(g.x), fy = Math.round(g.y);
  const frie = halFrieSaeder(g);
  if (frie.length && Math.random() < 0.35) {
    const m = frie[Math.floor(Math.random() * frie.length)];
    const rute = findRute(fx, fy, m.x, m.y, true);
    if (rute.length) {
      g.saede = m;
      g.plads = ledigPlads(m, g);
      g.rute = rute.slice(1);
      return;
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * RUM.bredde), y = 1 + Math.floor(Math.random() * (RUM.dybde - 1));
    if (!kanGaa(x, y)) continue;
    const rute = findRute(fx, fy, x, y, false);
    if (rute.length) {
      g.rute = rute.slice(1);
      return;
    }
  }
}

function opdaterHal(dt) {
  if (halVilGaaUd && figur.rute.length === 0) {
    const fig = figurFelt();
    halVilGaaUd = false;
    if (fig.x === HAL_DOER.felt.x && fig.y === HAL_DOER.felt.y) skiftRum("vaerelse");
    return;
  }
  HAL_GAESTER.forEach(function (g) {
    if (g.sidder) {
      g.vent -= dt;
      if (g.vent <= 0) {
        g.sidder = false;
        g.saede = null;
        g.vent = 0.5;
      }
      return;
    }
    if (!g.rute.length) {
      if (g.saede && Math.round(g.x) === g.saede.x && Math.round(g.y) === g.saede.y) {
        // har en anden taget pladsen imens, så find en ny (eller bliv stående)
        if (tagnePladser(g.saede, g).indexOf(g.plads) >= 0) g.plads = ledigPlads(g.saede, g);
        if (g.plads < 0) {
          g.saede = null;
          return;
        }
        g.sidder = true;
        g.retning = venderHoejre(g.saede) ? "ned-hoejre" : "ned-venstre";
        g.vent = 5 + Math.random() * 6;
        return;
      }
      g.vent -= dt;
      if (g.vent <= 0) {
        halNytMaal(g);
        g.vent = 1 + Math.random() * 3;
      }
      return;
    }
    const maal = g.rute[0];
    const dx = maal.x - g.x, dy = maal.y - g.y;
    const afstand = Math.hypot(dx, dy);
    const skridt = 2.2 * dt;
    const lodret = dx + dy > 0.01 ? "ned" : dx + dy < -0.01 ? "op" : "";
    const vandret = dx - dy > 0.01 ? "hoejre" : dx - dy < -0.01 ? "venstre" : "";
    g.retning = lodret && vandret ? lodret + "-" + vandret : lodret || vandret || g.retning;
    if (afstand <= skridt) {
      g.x = maal.x;
      g.y = maal.y;
      g.rute.shift();
    } else {
      g.x += dx / afstand * skridt;
      g.y += dy / afstand * skridt;
    }
    g.trin += dt * 8;
  });
}

// Hvor gæsten er rykket hen på sin plads i sofaen
function gaestPlads(g) {
  if (!g.sidder) return 0;
  return saedePladser(g.saede)[g.plads] || 0;
}

function tegnHalGaest(g) {
  const p = punkt(g.x + 0.5, g.y + 0.5);
  p.x += gaestPlads(g);
  let sidde = null, bagud = 0;
  if (g.sidder) {
    sidde = { hoejde: MOEBEL_TYPER[g.saede.type].saede };
    bagud = (venderHoejre(g.saede) ? -1 : 1) * SIDDE_BAGUD;
  } else {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
  }
  tegnMenneske(ctx, p.x + bagud, p.y - Math.abs(bagud) / 2, g.valg, g.retning, g.rute.length ? g.trin : null, sidde);

  // navneskilt
  const hoejde = figurHoejde(g.valg) - 10 + (sidde ? -sidde.hoejde + 10 : 0);
  ctx.font = "bold 11px Verdana, sans-serif";
  ctx.textAlign = "center";
  const w = ctx.measureText(g.navn).width + 10;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(p.x - w / 2, p.y - hoejde - 22, w, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(g.navn, p.x, p.y - hoejde - 10);
}

// Kaldes fra tegnAlt(): læg gæsterne i listen over ting, der skal tegnes
function halTing(ting) {
  HAL_GAESTER.forEach(function (g) {
    ting.push({ dybde: g.x + g.y + 0.1 + gaestPlads(g) / 1000, tegn: function () { tegnHalGaest(g); } });
  });
}


// =============================================================
//  Start i velkomsthallen
// =============================================================
mitVaerelse = moeblerIRummet;
skiftRum("hal");

// Panelet til højre kan klappes ind, så rummet får hele skærmen
document.getElementById("panel-knap").addEventListener("click", function () {
  const panel = document.getElementById("panel");
  panel.classList.toggle("lukket");
  this.textContent = panel.classList.contains("lukket") ? "☰ Panel" : "✕";
});
