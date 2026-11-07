// =============================================================
//  🧺 Loppemarkedet — udendørs, hver søndag
//  - Findes i navigatøren (Stueetagen) og i elevatoren.
//  - Markedet er låst, indtil en ansat (eller ejeren) åbner det:
//    Ejerpanel → 🧺 Loppemarked, eller knappen på kortet i navigatøren.
//    Man kan også sætte det til at åbne af sig selv hver søndag.
//  - Hver gæst kan oprette én bod på en af de 40 pladser og give den et navn.
//  - Boden indrettes med møbler fra Mine ting (borde, hylder, skilte, pynt …).
//    Nye loppemarkeds-møbler kan købes i Shoppen under 🧺 Loppemarked.
//  - Klik på et af dine møbler i boden → "🏷 Sæt til salg" med en pris i Glimt eller Stella.
//  - Prislisten ude i siden viser alt, der er til salg (man kan søge).
//  - Køber man noget, kommer møblet i Mine ting, og pengene går til sælgeren.
//  - Man kan også byde et bytte. Begge skal sige ja.
//  - 📋 Mit loppemarked: mine annoncer (ret pris, fjern), bytteforslag og mine handler.
//  - Reglerne står på en tavle i rummet.
//  Kræver database-32-loppemarked.sql. Hentes fra slutningen af js/panel-forklaring.js.
//  Møblernes billeder: billeder/moebler/lop-*/ (3D-renderet, samme stil som de realistiske møbler).
// =============================================================
const LOP_ID = "loppemarked";
const LOP_RUM = { id: LOP_ID, navn: "Loppemarkedet", ejer: EJER_NAVNE[0], bredde: 43, dybde: 28,
  vaeg: "#9fd3f2", gulv1: "#d8c7a0", gulv2: "#cdbb92", vaegHoejde: 200, doer: null };
INDBYGGEDE_RUM[LOP_ID] = LOP_RUM;
function iLop() { return rumValg === "vaerelse" && aktivtVaerelse === LOP_ID; }

// I navigatøren på stueetagen (og dermed i elevatoren)
NAV_RUM.push({ id: LOP_ID, etage: "stue", navn: "Loppemarkedet", om: "Hver søndag 🧺", billede: "billeder/rum/loppemarked.png",
  maks: 80, rum: "vaerelse", vaerelse: LOP_ID });

// De 40 pladser (4 x 3 felter hver) i 5 rækker med 8 i hver, med stier imellem
const LOP_PLADSER = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) LOP_PLADSER.push({ nr: r * 8 + c, x: 2 + c * 5, y: 3 + r * 5, b: 4, d: 3 });
function lopPladsVed(x, y) {
  return LOP_PLADSER.find(function (p) { return x >= p.x && x < p.x + p.b && y >= p.y && y < p.y + p.d; }) || null;
}
const LOP_TAVLE = { fra: 37, til: 41, y: 0 };     // regeltavlen står på felterne x 37–40, y 0
function lopErTavle(x, y) { return y === LOP_TAVLE.y && x >= LOP_TAVLE.fra && x < LOP_TAVLE.til; }
const LOP_STRIBER = [["#b3242f", "#f3e6cc"], ["#2f5f9e", "#f4f1e8"], ["#d9a441", "#fbf3e4"], ["#3f7a4a", "#f3e6cc"],
  ["#c25a8a", "#fbeef3"], ["#6a3d8e", "#efe6f6"], ["#d06a2a", "#fbf0e0"], ["#2a8a8a", "#e8f6f4"],
  ["#7a2232", "#f6dfa0"], ["#4a4a4a", "#f0f0f0"], ["#9e7a2a", "#fff6dc"], ["#a33a5a", "#f8e4ea"]];


// -------------------------------------------------------------
//  Møblerne til loppemarkedet (Shoppen → 🧺 Loppemarked)
// -------------------------------------------------------------
const LOP_KAT = "Loppemarked";
const LOP_TYPER = [
  { id: "lop-bod", navn: "Markedsbod med halvtag", felter: [2, 1], ankre: [[237, 545], [141, 545], [237, 545], [141, 545]], pris: 150 },
  { id: "lop-bord", navn: "Bukkebord med dug og kram", felter: [2, 1], ankre: [[222, 346], [126, 346], [222, 346], [126, 346]], pris: 80 },
  { id: "lop-kassehylde", navn: "Hylde af æblekasser", ankre: [[126, 283], [126, 283], [126, 283], [126, 283]], pris: 60 },
  { id: "lop-toejstativ", navn: "Tøjstativ med tøj", felter: [2, 1], ankre: [[222, 446], [126, 446], [222, 446], [126, 446]], pris: 90 },
  { id: "lop-skilt", navn: "LOPPER-skilt", ankre: [[126, 283], [126, 283], [126, 283], [126, 283]], pris: 40 },
  { id: "lop-kurv", navn: "Kurv med bamse og tæppe", ankre: [[126, 268], [126, 268], [126, 268], [126, 268]], pris: 50 },
  { id: "lop-kufferter", navn: "Gamle kufferter", ankre: [[126, 253], [126, 253], [126, 253], [126, 253]], pris: 70 },
  { id: "lop-flagranke", navn: "Flagranke med vimpler", felter: [2, 1], ankre: [[222, 514], [126, 514], [222, 514], [126, 514]], pris: 60 },
];
LOP_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png?r=1"; });
  t.kategori = LOP_KAT;
  t.skala = 0.5;
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  LOP_TYPER.forEach(function (t) { HOTEL_MOEBEL_PRISER[t.id] = t.pris; });
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === LOP_KAT; })) HOTEL_SHOP_KAT.push({ kategori: LOP_KAT, ikon: "🧺" });
  hotelMoeblerIShop();
})(0);

// Hotellets egne ting på markedet (træer, bænke, lygter, isvogn, flagranker). De kan ikke flyttes.
const LOP_FAST_DATA = [
  { type: "tag-oliventrae", x: 0, y: 0 }, { type: "tag-oliventrae", x: 42, y: 0 }, { type: "tag-oliventrae", x: 0, y: 27 }, { type: "tag-oliventrae", x: 42, y: 27 },
  { type: "tag-isvogn", x: 42, y: 14 }, { type: "cafe-lampe", x: 1, y: 13 }, { type: "cafe-lampe", x: 1, y: 23 }, { type: "cafe-lampe", x: 41, y: 8 }, { type: "cafe-lampe", x: 41, y: 20 },
  { type: "lop-flagranke", x: 6, y: 0 }, { type: "lop-flagranke", x: 13, y: 0 }, { type: "lop-flagranke", x: 20, y: 0 }, { type: "lop-flagranke", x: 27, y: 0 },
  { type: "tag-plantekasse", x: 1, y: 27 }, { type: "tag-plantekasse", x: 41, y: 27 },
];
// træer, bænke og blomster på stierne mellem rækkerne af boder
[6, 11, 16, 21].forEach(function (y, i) {
  (i % 2 ? [11, 21, 31] : [6, 16, 26, 36]).forEach(function (x, k) {
    if ((i + k) % 2) LOP_FAST_DATA.push({ type: "tag-baenk", x: x, y: y });
    else LOP_FAST_DATA.push({ type: "tag-oliventrae", x: x, y: y }, { type: "tag-plantekasse", x: x, y: y + 1 });
  });
});
const LOP_LISTE = [];          // det er det her, der står i rummet (moeblerIRummet, når man er på markedet)
const LOP_FAST = [];
function lopLavFaste() {
  if (LOP_FAST.length) return;
  LOP_FAST_DATA.forEach(function (d) {
    if (MOEBEL_TYPER[d.type]) LOP_FAST.push({ type: d.type, x: d.x, y: d.y, spejlet: false, retning: d.retning || 0, lopFast: true });
  });
}

// Rummet får sine møbler herfra (ikke fra Bygmester-systemet, for hver bod hører til sin ejer)
const erFaellesRumIdFoerLop = erFaellesRumId;
erFaellesRumId = function (id) { return id === LOP_ID ? false : erFaellesRumIdFoerLop(id); };
const brugMoeblerFoerLop = brugMoebler;
brugMoebler = function (id, data) { if (id === LOP_ID) return; brugMoeblerFoerLop(id, data); };
const vaerelseMoeblerFoerLop = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === LOP_ID) { lopLavFaste(); if (!LOP_LISTE.length) lopByg(true); andreVaerelser[LOP_ID] = LOP_LISTE; return LOP_LISTE; }
  return vaerelseMoeblerFoerLop(id);
};


// -------------------------------------------------------------
//  Data fra serveren
// -------------------------------------------------------------
const LOP = { hentet: false, fejl: "", aaben: false, tilstand: "lukket", maks: 10, boder: [], annoncer: [], bytteInd: [], bytteUd: [], handler: [], leveringer: 0 };
let lopSidst = "";
let lopSender = false;
const lopObjekter = {};        // møbel-id → objektet i rummet (så ingen rejser sig, når listen bygges igen)
const lopVaek = {};            // møbler, der lige er taget op (vises ikke, til serveren har svaret)

function lopServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
function lopMangler(e) { return /function|schema cache|does not exist|hv_lop/i.test(e && e.message || ""); }
function lopKald(fn, data) {
  return serverKald(fn, Object.assign({ p_token: mitToken() }, data || {})).catch(function (e) {
    if (lopMangler(e)) throw new Error("Loppemarkedet er ikke sat op endnu (database-32-loppemarked.sql mangler).");
    throw e;
  });
}
function lopMig() { return String(FIGUR.navn || "").toLowerCase(); }
function lopMinBod() { return LOP.boder.find(function (b) { return String(b.ejer).toLowerCase() === lopMig(); }) || null; }
function lopBod(id) { return LOP.boder.find(function (b) { return b.id === id; }) || null; }
function lopAnnonceFor(m) { return m && m.lopId ? LOP.annoncer.find(function (a) { return a.moebel === m.lopId && a.bod === m.lopBod; }) || null : null; }
function lopErMin(m) { const b = lopMinBod(); return !!(m && b && m.lopBod === b.id); }
function lopErAnsat() { return EJERE.indexOf(FIGUR.navn) >= 0 || (typeof erAnsat === "function" && erAnsat(FIGUR.navn)); }
function lopLaastFor() { return !LOP.aaben && !lopErAnsat(); }
function lopTypeNavn(id) { const t = MOEBEL_TYPER[id]; return t ? t.navn : id; }
function lopBillede(id) { const t = MOEBEL_TYPER[id]; return t ? (t.billede || "") : ""; }
function lopRens(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
// Vigtige beskeder (solgt, købt, byttet) vises også i en lille boks i 7 sekunder,
// så de ikke forsvinder, når man klikker videre
const lopToast = document.createElement("div");
lopToast.id = "lop-toast";
lopToast.hidden = true;
document.body.appendChild(lopToast);
let lopToastUr = null;
function lopSig(tekst) {
  besked.textContent = tekst;
  lopToast.textContent = tekst;
  lopToast.hidden = false;
  clearTimeout(lopToastUr);
  lopToastUr = setTimeout(function () { lopToast.hidden = true; }, 7000);
}
function lopPris(a) { return a.pris.toLocaleString("da-DK") + (a.valuta === "stella" ? " 🔮" : " ⭐"); }
function lopValutaNavn(v) { return v === "stella" ? "Stella" : (typeof system !== "undefined" && system.valutaNavn) || "Glimt"; }

function lopHent() {
  if (!lopServer()) return;
  lopKald("hv_lop_hent").then(function (svar) {
    LOP.fejl = "";
    const nyt = JSON.stringify(svar);
    LOP.hentet = true;
    if (nyt === lopSidst) { lopTjekLaas(); return; }
    lopSidst = nyt;
    ["aaben", "tilstand", "maks", "boder", "annoncer", "bytteInd", "bytteUd", "handler", "leveringer"].forEach(function (k) { if (svar[k] !== undefined) LOP[k] = svar[k]; });
    lopTjekSolgt();
    if (LOP.leveringer > 0) lopHentLeveringer();
    lopByg();
    lopTjekLaas();
    lopVisAlt();
  }).catch(function (e) {
    LOP.fejl = e.message;
    LOP.aaben = false;
    lopTjekLaas();
    lopVisAlt();
  });
}
let lopTaeller = 0;
setInterval(function () {
  lopTaeller++;
  const travlt = iLop() || !lopOversigt.hidden || (!ejerVindue.hidden && ejerFane === "loppe");
  if (travlt || lopTaeller % 7 === 0) lopHent();
}, 3000);
setTimeout(lopHent, 1200);

// Møbler på vej til Mine ting (købt, byttet, taget hjem)
let lopHenterLev = false;
function lopHentLeveringer() {
  if (lopHenterLev) return;
  lopHenterLev = true;
  lopKald("hv_lop_leveringer_hent").then(function (liste) {
    lopHenterLev = false;
    (liste || []).forEach(function (l) {
      if (!MOEBEL_TYPER[l.type]) return;
      laegILager(l.type);
      lopSig("📦 " + lopTypeNavn(l.type) + " er kommet i Mine ting" + (l.grund ? " (" + l.grund + ")" : "") + ".");
    });
    if (liste && liste.length && typeof spilPling === "function") spilPling();
    LOP.leveringer = 0;
  }).catch(function () { lopHenterLev = false; });
}

// Har nogen købt noget af mig? Så får jeg besked.
function lopTjekSolgt() {
  const noegle = "mit-hotel-lop-set-" + lopMig();
  let set = null;
  try { set = JSON.parse(localStorage.getItem(noegle) || "null"); } catch (e) {}
  const ids = LOP.handler.map(function (h) { return h.id; });
  if (set) {
    LOP.handler.filter(function (h) { return h.hvad === "solgt" && set.indexOf(h.id) < 0; }).forEach(function (h) {
      lopSig(h.status === "byttet"
        ? "🔄 Du byttede " + lopTypeNavn(h.type) + " med " + h.med + " og fik " + lopTypeNavn(h.bytteType) + "!"
        : "🧺 " + h.med + " købte din " + lopTypeNavn(h.type) + " for " + lopPris(h) + "!");
      if (typeof spilPling === "function") spilPling();
    });
  }
  try { localStorage.setItem(noegle, JSON.stringify(ids)); } catch (e) {}
}

// Byg listen over møbler i rummet ud fra boderne
function lopByg(tving) {
  lopLavFaste();
  const min = lopMinBod();
  const nye = LOP_FAST.slice();
  const brugt = {};
  LOP.boder.forEach(function (b) {
    if (lopSender && min && b.id === min.id) {
      // mine egne bliver, som de er, mens de bliver gemt
      LOP_LISTE.forEach(function (m) { if (m.lopBod === b.id) { nye.push(m); brugt[m.lopId] = true; } });
      return;
    }
    (b.moebler || []).forEach(function (d) {
      if (!MOEBEL_TYPER[d.type] || lopVaek[d.id]) return;
      let m = lopObjekter[d.id];
      if (!m) { m = { type: d.type, spejlet: false }; lopObjekter[d.id] = m; }
      m.type = d.type; m.x = d.x; m.y = d.y; m.retning = d.retning || 0; m.lopBod = b.id; m.lopId = d.id;
      nye.push(m);
      brugt[d.id] = true;
    });
  });
  // møbler jeg lige har stillet, men som endnu ikke er sendt
  LOP_LISTE.forEach(function (m) { if (!m.lopFast && !m.lopId && nye.indexOf(m) < 0) nye.push(m); });
  Object.keys(lopObjekter).forEach(function (id) { if (!brugt[id]) delete lopObjekter[id]; });
  LOP_LISTE.length = 0;
  nye.forEach(function (m) { LOP_LISTE.push(m); });
  if (iLop()) {
    moeblerIRummet = LOP_LISTE;
    if (valgtMoebel && LOP_LISTE.indexOf(valgtMoebel) < 0) { valgtMoebel = null; opdaterPanel(); }
    if (typeof flytter !== "undefined" && flytter && LOP_LISTE.indexOf(flytter) < 0) { flytter = null; opdaterPanel(); }
    if (figur.sidde && LOP_LISTE.indexOf(figur.sidde.moebel) < 0) { figur.sidde = null; figur.skalSidde = null; }
    if (valgtMoebel && typeof visMoebelInfo === "function") visMoebelInfo();
  }
}

// Gem min bod på serveren (når jeg stiller, flytter eller drejer)
function lopGemBod() {
  const b = lopMinBod();
  if (!b) return;
  const p = LOP_PLADSER[b.plads];
  // nye møbler: de skal stå helt inde i min plads, ellers kommer de tilbage i Mine ting
  LOP_LISTE.slice().forEach(function (m) {
    if (m.lopFast || (m.lopBod && m.lopBod !== b.id)) return;
    const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
    const inde = p && m.x >= p.x && m.y >= p.y && m.x + f[0] <= p.x + p.b && m.y + f[1] <= p.y + p.d;
    if (!inde) {
      if (!m.lopId) {
        LOP_LISTE.splice(LOP_LISTE.indexOf(m), 1);
        laegILager(m.type);
        besked.textContent = "Møblet skal stå helt inde i din bod. Det er lagt tilbage i Mine ting.";
      }
      return;
    }
    if (!m.lopId) {
      m.lopId = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      m.lopBod = b.id;
      lopObjekter[m.lopId] = m;
    }
  });
  const data = LOP_LISTE.filter(function (m) { return m.lopBod === b.id; })
    .map(function (m) { return { id: m.lopId, type: m.type, x: m.x, y: m.y, retning: m.retning || 0 }; });
  lopSender = true;
  lopKald("hv_lop_bod_gem", { p_moebler: data }).then(function (svar) {
    lopSender = false;
    b.moebler = svar || data;
    lopSidst = "";
    lopHent();
  }).catch(function (e) {
    lopSender = false;
    besked.textContent = "⚠️ " + e.message;
    // det, serveren ikke fik, kommer tilbage i Mine ting
    const paaServer = {};
    (b.moebler || []).forEach(function (d) { paaServer[d.id] = true; });
    LOP_LISTE.slice().forEach(function (m) {
      if (m.lopBod === b.id && !paaServer[m.lopId]) { LOP_LISTE.splice(LOP_LISTE.indexOf(m), 1); laegILager(m.type); }
    });
    lopSidst = "";
    lopByg();
    lopHent();
  });
}


// -------------------------------------------------------------
//  Låst / åben
// -------------------------------------------------------------
const eventLaastForFoerLop = typeof eventLaastFor === "function" ? eventLaastFor : function () { return false; };
eventLaastFor = function (id) { return id === LOP_ID ? lopLaastFor() : eventLaastForFoerLop(id); };
const gaaTilVaerelseFoerLop = gaaTilVaerelse;
gaaTilVaerelse = function (id) {
  if (id === LOP_ID && lopLaastFor()) {
    besked.textContent = LOP.fejl ? "🔒 " + LOP.fejl : "🔒 Loppemarkedet er lukket. Det holder åbent om søndagen, når de ansatte åbner det 🧺";
    return;
  }
  gaaTilVaerelseFoerLop(id);
};
let lopVarAaben = null;
function lopTjekLaas() {
  if (iLop() && lopLaastFor()) {
    skiftRum("hal");
    besked.textContent = "🔒 Loppemarkedet er lukket nu. Tak for i dag! 🧺";
  }
  if (lopVarAaben === false && LOP.aaben && !iLop()) besked.textContent = "🧺 Loppemarkedet er åbent! Find det i navigatøren eller elevatoren.";
  lopVarAaben = LOP.aaben;
  const nav = NAV_RUM.find(function (r) { return r.id === LOP_ID; });
  if (nav) nav.om = LOP.aaben ? "🟢 Åbent nu · " + LOP.boder.length + " boder" : LOP.tilstand === "soendag" ? "Åbner hver søndag 🧺" : "🔒 Lukket · hver søndag";
}
function lopSaetStatus(tilstand, maks) {
  lopKald("hv_lop_status_saet", { p_tilstand: tilstand, p_maks: maks == null ? null : maks }).then(function () {
    besked.textContent = tilstand === "aaben" ? "🔓 Loppemarkedet er åbent for alle." : tilstand === "lukket" ? "🔒 Loppemarkedet er låst." :
      tilstand === "soendag" ? "🗓 Loppemarkedet åbner nu af sig selv hver søndag." : "Gemt.";
    lopSidst = ""; lopHent();
  }).catch(function (e) { besked.textContent = "⚠️ " + e.message; });
}

const skiftRumFoerLop = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerLop(navn);
  if (iLop()) {
    lopByg();
    moeblerIRummet = LOP_LISTE;
    figur.x = 1; figur.y = 9;
    const b = lopMinBod();
    besked.textContent = b ? "Velkommen tilbage til din bod «" + b.navn + "» 🧺 Klik på et møbel i boden for at sætte en pris."
      : "Velkommen på Loppemarkedet 🧺 Kig på boderne, eller opret din egen i prislisten til højre.";
    lopHent();
  }
  lopVisSide();
};


// -------------------------------------------------------------
//  Tegning: himmel, græs, grusstier, pladser af planker, hæk og regeltavle
// -------------------------------------------------------------
// græs under træer, bænke og blomster
const LOP_GRAES = {};
LOP_FAST_DATA.forEach(function (d) {
  if (!/oliventrae|plantekasse|baenk/.test(d.type)) return;
  LOP_GRAES[d.x + "," + d.y] = true;
  if (/baenk/.test(d.type)) LOP_GRAES[(d.x + 1) + "," + d.y] = true;
});
function lopFeltArt(x, y) {
  if (lopPladsVed(x, y)) return "plads";
  if (x === 0 || y === 0 || x === LOP_RUM.bredde - 1 || y === LOP_RUM.dybde - 1) return "graes";
  if (LOP_GRAES[x + "," + y]) return "graes";
  return "sti";
}
const tegnGulvFoerLop = tegnGulv;
tegnGulv = function () {
  if (!iLop()) { tegnGulvFoerLop(); return; }
  for (let x = 0; x < RUM.bredde; x++) for (let y = 0; y < RUM.dybde; y++) {
    const art = lopFeltArt(x, y), s = pixelStoej(x, y, 3);
    let farve;
    if (art === "plads") farve = nuance((x + y) % 2 ? "#c49a63" : "#bb915b", 0.94 + s * 0.1);
    else if (art === "graes") farve = nuance((x + y) % 2 ? "#76a64f" : "#6f9d4a", 0.92 + s * 0.14);
    else farve = nuance((x + y) % 2 ? "#d9c9a3" : "#d2c19a", 0.94 + s * 0.08);
    polygon(ctx, diamant(x, y), farve);
    const p = punkt(x, y);
    if (art === "plads") {           // planker
      ctx.strokeStyle = "rgba(90,55,25,0.35)"; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const a = punkt(x, y + i / 4), b = punkt(x + 1, y + i / 4);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    } else if (art === "graes") {     // små græstotter
      ctx.fillStyle = "rgba(40,80,25,0.45)";
      for (let i = 0; i < 5; i++) {
        const gx = p.x - 30 + pixelStoej(x, y, 10 + i) * 60, gy = p.y + 10 + pixelStoej(x, y, 20 + i) * 28;
        ctx.fillRect(gx, gy - 3, 1.5, 4); ctx.fillRect(gx + 2, gy - 4, 1.5, 5);
      }
    } else {                          // småsten i gruset
      ctx.fillStyle = "rgba(120,100,70,0.35)";
      for (let i = 0; i < 6; i++) {
        const gx = p.x - 32 + pixelStoej(x, y, 30 + i) * 64, gy = p.y + 8 + pixelStoej(x, y, 40 + i) * 32;
        ctx.fillRect(gx, gy, 2, 1.5);
      }
    }
  }
  // en kant af planker rundt om hver plads + pladsens nummer
  LOP_PLADSER.forEach(function (pl) {
    const a = punkt(pl.x, pl.y), b = punkt(pl.x + pl.b, pl.y), c = punkt(pl.x + pl.b, pl.y + pl.d), d = punkt(pl.x, pl.y + pl.d);
    ctx.strokeStyle = "rgba(110,70,30,0.8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 1;
  });
  // kanten forrest
  const v = punkt(0, RUM.dybde), m = punkt(RUM.bredde, RUM.dybde), h = punkt(RUM.bredde, 0);
  polygon(ctx, [v, m, { x: m.x, y: m.y + 10 }, { x: v.x, y: v.y + 10 }], "#5a7d3a");
  polygon(ctx, [m, h, { x: h.x, y: h.y + 10 }, { x: m.x, y: m.y + 10 }], "#4a6a30");
};

function lopHaek(a, b) {
  const H = 34;
  polygon(ctx, [a, b, { x: b.x, y: b.y - H }, { x: a.x, y: a.y - H }], "#4f7f38");
  ctx.fillStyle = "rgba(30,60,20,0.35)";
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - H + 4, 9, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = "rgba(160,210,120,0.35)";
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.3) / 4;
    ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - H - 1, 6, Math.PI, 0); ctx.fill();
  }
}
function lopBaggrund(t) {
  if (typeof tegnHimmel === "function") tegnHimmel(t);
  else { ctx.fillStyle = "#9fd3f2"; ctx.fillRect(-10, -10, BREDDE + 20, HOEJDE + 20); }
  const hy = punkt(0, 0).y + 30;
  // græsmark helt ud til horisonten
  const g = ctx.createLinearGradient(0, hy - 60, 0, HOEJDE);
  g.addColorStop(0, "#9cc47a"); g.addColorStop(0.4, "#7fae5a"); g.addColorStop(1, "#5f8f3e");
  ctx.fillStyle = g;
  ctx.fillRect(-10, hy - 60, BREDDE + 20, HOEJDE - hy + 80);
  // en række træer ude i horisonten
  const forskyd = KAMERA.x / ZOOM * 0.3;
  for (let i = -40; i < 60; i++) {
    const x = i * 38 + forskyd;
    if (x < -60 || x > BREDDE + 60) continue;
    const r = 16 + pixelStoej(i, 3, 1) * 18, y = hy - 58 - pixelStoej(i, 4, 2) * 14;
    ctx.fillStyle = "#6a4a2a"; ctx.fillRect(x - 2, y, 4, 22);
    ctx.fillStyle = pixelStoej(i, 5, 3) > 0.5 ? "#4f8a3c" : "#5e9a45";
    ctx.beginPath(); ctx.arc(x, y - r * 0.4, r, 0, Math.PI * 2); ctx.fill();
  }
}
const tegnVaeggeFoerLop = tegnVaegge;
tegnVaegge = function () {
  if (!iLop()) { tegnVaeggeFoerLop(); return; }
  const t = performance.now() / 1000;
  ctx.save();
  lopBaggrund(t);
  if (typeof ELEVATOR !== "undefined" && typeof tagHus === "function") tagHus();
  ctx.restore();
  const foer = typeof tagIngenTapet !== "undefined" ? tagIngenTapet : false;
  try { tagIngenTapet = true; } catch (e) {}
  try { tegnVaeggeFoerLop(); } finally { try { tagIngenTapet = foer; } catch (e) {} }   // elevatoren tegnes stadig
  // lav hæk langs bagkanten og venstre kant (uden om elevatorhuset)
  for (let x = 0; x < RUM.bredde; x++) lopHaek(punkt(x, 0), punkt(x + 1, 0));
  const fra = typeof ELEVATOR !== "undefined" ? ELEVATOR.fra - 0.35 : -1, til = typeof ELEVATOR !== "undefined" ? ELEVATOR.til + 0.35 : -1;
  for (let y = RUM.dybde; y > 0; y--) {
    if (y - 1 < til && y > fra) continue;
    lopHaek(punkt(0, y), punkt(0, y - 1));
  }
};

// Regeltavlen og navneskiltene ved boderne
function lopRegler() {
  return ["Du kan kun sælge møbler, du selv ejer.", "Møbler er reserveret, mens en handel er i gang.",
    "Begge parter skal godkende et bytte.", "Du kan højst have " + (LOP.maks || 10) + " ting til salg ad gangen.", "Vær sød og fair mod hinanden 🙂"];
}
function lopTegnTavle() {
  const a = punkt(LOP_TAVLE.fra + 0.15, 0.45), b = punkt(LOP_TAVLE.til - 0.15, 0.45);
  const bund = 40, top = 190;
  // stolper
  ctx.fillStyle = "#5a3a1c";
  [a, b].forEach(function (p) { ctx.fillRect(p.x - 3, p.y - top - 6, 6, top + 6); });
  // tavlen
  polygon(ctx, [{ x: a.x, y: a.y - bund }, { x: b.x, y: b.y - bund }, { x: b.x, y: b.y - top }, { x: a.x, y: a.y - top }], "#7a4a24");
  polygon(ctx, [{ x: a.x + 5, y: a.y - bund - 5 }, { x: b.x - 5, y: b.y - bund - 5 }, { x: b.x - 5, y: b.y - top + 5 }, { x: a.x + 5, y: a.y - top + 5 }], "#f4e8cf");
  polygon(ctx, [{ x: a.x - 6, y: a.y - top - 2 }, { x: b.x + 6, y: b.y - top - 2 }, { x: b.x + 6, y: b.y - top - 12 }, { x: a.x - 6, y: a.y - top - 12 }], "#7a2232");
  // teksten følger tavlens skrå linje
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy);
  ctx.save();
  ctx.translate(a.x, a.y - top);
  ctx.transform(dx / l, dy / l, 0, 1, 0, 0);
  ctx.textAlign = "center";
  ctx.fillStyle = "#7a2232";
  ctx.font = "bold 15px Georgia, serif";
  ctx.fillText("📜 REGLER", l / 2, 28);
  ctx.fillStyle = "#3a2410";
  ctx.font = "10.5px Verdana, sans-serif";
  lopRegler().forEach(function (r, i) { ctx.fillText((i + 1) + ". " + r, l / 2, 50 + i * 20); });
  ctx.fillStyle = "#8a6a3a";
  ctx.font = "italic 9px Verdana, sans-serif";
  ctx.fillText("Klik på tavlen for at læse mere", l / 2, top - bund - 10);
  ctx.restore();
}
function lopTegnSkilt(pl) {
  const bod = LOP.boder.find(function (b) { return b.plads === pl.nr; });
  const p = punkt(pl.x + pl.b / 2, pl.y + 0.05);
  const navn = bod ? bod.navn : "Ledig plads " + (pl.nr + 1);
  ctx.save();
  ctx.font = (bod ? "bold 13px" : "italic 11px") + " Georgia, serif";
  const w = Math.max(70, ctx.measureText(navn).width + 22), h = bod ? 38 : 22;
  const y = p.y - (bod ? 238 : 34);
  const s = LOP_STRIBER[pl.nr % LOP_STRIBER.length];
  if (bod) {
    // snore op til skiltet
    ctx.strokeStyle = "rgba(60,40,20,0.7)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p.x - w / 2 + 8, y); ctx.lineTo(p.x - w / 2 + 14, y - 10); ctx.moveTo(p.x + w / 2 - 8, y); ctx.lineTo(p.x + w / 2 - 14, y - 10); ctx.stroke();
    ctx.fillStyle = s[0];
    ctx.fillRect(p.x - w / 2, y, w, h);
    ctx.fillStyle = s[1];
    ctx.fillRect(p.x - w / 2 + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = s[0];
    ctx.textAlign = "center";
    ctx.fillText(navn, p.x, y + 19);
    ctx.font = "9px Verdana, sans-serif";
    ctx.fillStyle = "#5a4a3a";
    const antal = LOP.annoncer.filter(function (a) { return a.bod === bod.id; }).length;
    ctx.fillText(bod.ejer + (antal ? " · " + antal + " til salg" : ""), p.x, y + 31);
  } else {
    ctx.fillStyle = "#6a4a2a"; ctx.fillRect(p.x - 2, y + h, 4, 34 - h);
    ctx.fillStyle = "rgba(251,243,228,0.92)"; ctx.fillRect(p.x - w / 2, y, w, h);
    ctx.strokeStyle = "#8a6a3a"; ctx.strokeRect(p.x - w / 2 + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = "#6a5030"; ctx.textAlign = "center"; ctx.fillText(navn, p.x, y + 15);
  }
  ctx.restore();
}
// tavlen tegnes i den rigtige rækkefølge (bag dem, der står foran den)
const andreSpillereTingFoerLop = typeof andreSpillereTing === "function" ? andreSpillereTing : null;
andreSpillereTing = function (ting) {
  if (andreSpillereTingFoerLop) andreSpillereTingFoerLop(ting);
  if (!iLop()) return;
  ting.push({ dybde: LOP_TAVLE.fra + LOP_TAVLE.y + 0.6, tegn: lopTegnTavle });
};
// navneskiltene hænger højt oppe og tegnes til sidst, så man altid kan læse dem
if (typeof tegnBobler === "function") {
  const tegnBoblerFoerLop = tegnBobler;
  tegnBobler = function () {
    if (iLop()) LOP_PLADSER.forEach(lopTegnSkilt);
    tegnBoblerFoerLop();
  };
}
// man kan ikke gå gennem tavlen
const kanGaaFoerLop = kanGaa;
kanGaa = function (x, y) {
  if (iLop() && lopErTavle(x, y)) return false;
  return kanGaaFoerLop(x, y);
};


// -------------------------------------------------------------
//  Klik i rummet: kun i din egen bod kan du stille, flytte, dreje og tage op
// -------------------------------------------------------------
function lopIMinPlads(type, x, y, tvaers) {
  const b = lopMinBod();
  if (!b) return false;
  const p = LOP_PLADSER[b.plads];
  const f = moebelFelter(type, tvaers);
  return x >= p.x && y >= p.y && x + f[0] <= p.x + p.b && y + f[1] <= p.y + p.d;
}
document.addEventListener("click", function (e) {
  if (e.target !== laerred || !iLop()) return;
  const f = musTilFelt(e);
  const stop = function (tekst) { e.stopImmediatePropagation(); e.preventDefault(); if (tekst) besked.textContent = tekst; };
  if (valgtType) {
    if (!lopMinBod()) return stop("Opret først din egen bod (i prislisten til højre). Så kan du stille møbler i den.");
    if (!LOP.aaben && !lopErAnsat()) return stop("🔒 Markedet er lukket.");
    if (!lopIMinPlads(MOEBEL_TYPER[valgtType], f.x, f.y, false)) return stop("Du kan kun stille møbler inde i din egen bod (plads " + (lopMinBod().plads + 1) + ").");
    return;
  }
  if (typeof flytter !== "undefined" && flytter) {
    if (!lopErMin(flytter)) { flytter = null; opdaterPanel(); return stop("Det er ikke dit møbel."); }
    if (!lopIMinPlads(MOEBEL_TYPER[flytter.type], f.x, f.y, drejetTvaers(flytter))) return stop("Møblet skal blive inde i din bod.");
    return;
  }
  const m = moebelPaa(f.x, f.y);
  if ((e.ctrlKey || e.metaKey || e.shiftKey) && m && !lopErMin(m)) return stop(m.lopFast ? "Det er loppemarkedets eget møbel." : "Det er ikke dit møbel.");
  if (lopErTavle(f.x, f.y)) { stop(); lopVisRegler(); return; }
  // klik på en ledig plads, når man ikke har en bod: tilbyd at oprette en her
  const pl = lopPladsVed(f.x, f.y);
  if (pl && !m && !lopMinBod() && !LOP.boder.some(function (b) { return b.plads === pl.nr; })) lopAabnOpret(pl.nr);
}, true);

// Ryd-knappen (tøm rummet) må ikke bruges her
document.addEventListener("click", function (e) {
  if (!iLop() || !e.target.closest || !e.target.closest("#knap-ryd")) return;
  e.stopImmediatePropagation(); e.preventDefault();
}, true);
setInterval(function () {
  const k = document.getElementById("knap-ryd");
  if (k && iLop()) k.hidden = true;
  // prislisten gemmer sig, mens ejerpanelet er åbent, så den ikke ligger ovenpå
  if (typeof lopSide !== "undefined") lopSide.style.visibility = typeof ejerVindue !== "undefined" && !ejerVindue.hidden ? "hidden" : "";
}, 500);

const drejValgtFoerLop = drejValgt;
drejValgt = function () {
  if (iLop() && valgtMoebel && !lopErMin(valgtMoebel)) return;
  drejValgtFoerLop();
};
const samlOpValgtFoerLop = samlOpValgt;
samlOpValgt = function () {
  if (!iLop()) { samlOpValgtFoerLop(); return; }
  const m = valgtMoebel;
  if (!m) return;
  if (!lopErMin(m)) { besked.textContent = m.lopFast ? "Det er loppemarkedets eget møbel." : "Det er ikke dit møbel."; return; }
  const a = lopAnnonceFor(m);
  if (a && a.optaget) { besked.textContent = "Møblet er reserveret, fordi en handel er i gang."; return; }
  if (figur.sidde && figur.sidde.moebel === m) { figur.sidde = null; figur.skalSidde = null; }
  valgtMoebel = null;
  if (!m.lopId) { LOP_LISTE.splice(LOP_LISTE.indexOf(m), 1); laegILager(m.type); opdaterPanel(); return; }
  lopVaek[m.lopId] = true;
  LOP_LISTE.splice(LOP_LISTE.indexOf(m), 1);
  opdaterPanel();
  lopKald("hv_lop_tag_hjem", { p_moebel: m.lopId }).then(function () {
    lopSidst = ""; lopHent(); lopHentLeveringer();
  }).catch(function (e) {
    delete lopVaek[m.lopId];
    besked.textContent = "⚠️ " + e.message;
    lopSidst = ""; lopHent();
  });
};
const gemFoerLop = gem;
gem = function () {
  if (!iLop()) { gemFoerLop(); return; }
  if (lopMinBod()) lopGemBod();
};


// -------------------------------------------------------------
//  Møbel-boksen: sæt til salg / køb
// -------------------------------------------------------------
const lopMi = document.createElement("div");
lopMi.id = "lop-mi";
lopMi.hidden = true;
(document.getElementById("moebel-info") || document.body).appendChild(lopMi);

const visMoebelInfoFoerLop = visMoebelInfo;
visMoebelInfo = function () {
  visMoebelInfoFoerLop();
  lopMi.hidden = true;
  if (!iLop() || !valgtMoebel) return;
  const m = valgtMoebel, a = lopAnnonceFor(m), knapper = document.getElementById("mi-knapper"), om = document.getElementById("mi-om");
  if (m.lopFast) { knapper.hidden = true; om.textContent = "Loppemarkedets eget møbel"; return; }
  const bod = lopBod(m.lopBod);
  if (lopErMin(m)) {
    knapper.hidden = false;
    if (typeof flytter !== "undefined" && flytter) return;
    om.textContent = "🧺 Din bod: " + (bod ? bod.navn : "");
    lopMi.innerHTML = a
      ? "<p class='lop-mi-pris'>🏷 Til salg: <b>" + lopPris(a) + "</b>" + (a.optaget ? " <span class='lop-optaget'>🔒 Handel i gang</span>" : "") + "</p>" +
        "<div class='lop-mi-raekke'><input id='lop-mi-beloeb' type='number' min='1' max='1000000' value='" + a.pris + "'>" + lopValutaValg("lop-mi-valuta", a.valuta) +
        "<button type='button' id='lop-mi-gem'>💾 Ny pris</button></div><button type='button' id='lop-mi-fjern' class='lop-lys'>🗑 Fjern annonce</button>"
      : "<p class='lop-mi-pris'>Ikke til salg endnu</p>" +
        "<div class='lop-mi-raekke'><input id='lop-mi-beloeb' type='number' min='1' max='1000000' placeholder='Pris' value='" + lopForslag(m.type) + "'>" + lopValutaValg("lop-mi-valuta", "glimt") +
        "<button type='button' id='lop-mi-gem'>🏷 Sæt til salg</button></div>";
    lopMi.hidden = false;
    lopMi.querySelector("#lop-mi-gem").addEventListener("click", function () {
      const beloeb = parseInt(document.getElementById("lop-mi-beloeb").value, 10), valuta = document.getElementById("lop-mi-valuta").value;
      if (!(beloeb > 0)) { besked.textContent = "Skriv en pris (mindst 1)."; return; }
      if (!m.lopId) { besked.textContent = "Vent et øjeblik, møblet bliver gemt …"; return; }
      lopKald("hv_lop_saelg", { p_moebel: m.lopId, p_pris: beloeb, p_valuta: valuta }).then(function () {
        besked.textContent = "🏷 " + lopTypeNavn(m.type) + " er til salg for " + beloeb.toLocaleString("da-DK") + " " + lopValutaNavn(valuta) + ".";
        lopSidst = ""; lopHent();
      }).catch(function (e) { besked.textContent = "⚠️ " + e.message; });
    });
    const fjern = lopMi.querySelector("#lop-mi-fjern");
    if (fjern) fjern.addEventListener("click", function () { lopFjernAnnonce(a.id); });
    return;
  }
  // en andens møbel
  knapper.hidden = true;
  om.textContent = bod ? "Fra boden «" + bod.navn + "» · " + bod.ejer : "";
  lopMi.innerHTML = a
    ? "<p class='lop-mi-pris'>Pris: <b>" + lopPris(a) + "</b></p>" + (a.optaget && !a.mig ? "<p class='lop-optaget'>🔒 En handel er i gang med den</p>" :
      "<div class='lop-mi-raekke'><button type='button' id='lop-mi-koeb'>🛒 Køb</button><button type='button' id='lop-mi-byt' class='lop-lys'>🔄 Byd bytte</button></div>")
    : "<p class='lop-mi-pris'>Ikke til salg</p>";
  lopMi.hidden = false;
  const k = lopMi.querySelector("#lop-mi-koeb"), b = lopMi.querySelector("#lop-mi-byt");
  if (k) k.addEventListener("click", function () { lopAabnKoeb(a.id, false); });
  if (b) b.addEventListener("click", function () { lopAabnKoeb(a.id, true); });
};
function lopValutaValg(id, valgt) {
  return "<select id='" + id + "'><option value='glimt'" + (valgt === "glimt" ? " selected" : "") + ">⭐ Glimt</option>" +
    "<option value='stella'" + (valgt === "stella" ? " selected" : "") + ">🔮 Stella</option></select>";
}
function lopForslag(type) {
  const p = typeof pris === "function" && MOEBEL_TYPER[type] ? pris(MOEBEL_TYPER[type]) : null;
  return p && !p.stella ? Math.max(1, Math.round(p.beloeb * 0.7 / 5) * 5) : 50;
}
function lopFjernAnnonce(id) {
  lopKald("hv_lop_fjern", { p_id: id }).then(function () {
    besked.textContent = "🗑 Annoncen er fjernet. Møblet står stadig i din bod.";
    lopSidst = ""; lopHent();
  }).catch(function (e) { besked.textContent = "⚠️ " + e.message; });
}


// -------------------------------------------------------------
//  Køb og bytte
// -------------------------------------------------------------
const lopKoeb = document.createElement("div");
lopKoeb.id = "lop-koeb";
lopKoeb.className = "lop-vindue";
lopKoeb.hidden = true;
document.body.appendChild(lopKoeb);
let lopKoebId = null, lopKoebUr = null, lopReserveret = false;

function lopLukKoeb() {
  if (lopKoebId && lopReserveret) lopKald("hv_lop_frigiv", { p_id: lopKoebId }).catch(function () {});
  lopKoebId = null; lopReserveret = false;
  clearInterval(lopKoebUr);
  lopKoeb.hidden = true;
}
function lopAabnKoeb(id, bytte) {
  const a = LOP.annoncer.find(function (x) { return x.id === id; });
  if (!a) { besked.textContent = "Den er desværre solgt."; return; }
  if (lopKoebId && lopKoebId !== id) lopLukKoeb();
  lopKoebId = id;
  lopKoeb.hidden = false;
  if (bytte) { lopVisBytte(a); return; }
  const har = a.valuta === "stella" ? krystaller : glimt;
  lopKoeb.innerHTML = "<div class='lop-top'><b>🛒 Køb på loppemarkedet</b><button type='button' class='lop-luk'>✕</button></div>" +
    "<div class='lop-koeb-krop'><img src='" + lopRens(lopBillede(a.type)) + "' alt=''><div><h3>" + lopRens(lopTypeNavn(a.type)) + "</h3>" +
    "<p>Fra boden <b>«" + lopRens(a.bodNavn) + "»</b> · " + lopRens(a.saelger) + "</p>" +
    "<p class='lop-stor-pris'>" + lopPris(a) + "</p><p class='lop-lille'>Du har " + (har || 0).toLocaleString("da-DK") + " " + lopValutaNavn(a.valuta) + "</p></div></div>" +
    "<p class='lop-status' id='lop-koeb-status'>⏳ Reserverer møblet til dig …</p>" +
    "<div class='lop-knapper'><button type='button' class='lop-lys' id='lop-fortryd'>Fortryd</button>" +
    "<button type='button' class='lop-lys' id='lop-til-bytte'>🔄 Byd bytte i stedet</button><button type='button' id='lop-ja' disabled>✔ Ja, køb</button></div>";
  lopKoeb.querySelector(".lop-luk").addEventListener("click", lopLukKoeb);
  lopKoeb.querySelector("#lop-fortryd").addEventListener("click", lopLukKoeb);
  lopKoeb.querySelector("#lop-til-bytte").addEventListener("click", function () { lopVisBytte(a); });
  const status = lopKoeb.querySelector("#lop-koeb-status"), ja = lopKoeb.querySelector("#lop-ja");
  lopKald("hv_lop_reserver", { p_id: id }).then(function () {
    if (lopKoebId !== id) return;
    lopReserveret = true;
    let sek = 90;
    status.textContent = "🔒 Reserveret til dig i " + sek + " sek. Ingen andre kan købe den imens.";
    ja.disabled = false;
    clearInterval(lopKoebUr);
    lopKoebUr = setInterval(function () {
      sek--;
      if (sek <= 0) { lopLukKoeb(); besked.textContent = "⏰ Reservationen løb ud."; return; }
      status.textContent = "🔒 Reserveret til dig i " + sek + " sek. Ingen andre kan købe den imens.";
    }, 1000);
  }).catch(function (e) { status.textContent = "⚠️ " + e.message; });
  ja.addEventListener("click", function () {
    ja.disabled = true;
    status.textContent = "⏳ Køber …";
    lopKald("hv_lop_koeb", { p_id: id }).then(function (svar) {
      lopReserveret = false;
      if (typeof saetPenge === "function") saetPenge({ glimt: svar.glimt, stella: svar.stella }, false);
      else { glimt = svar.glimt; krystaller = svar.stella; if (typeof visGlimt === "function") visGlimt(); }
      lopLukKoeb();
      besked.textContent = "🎉 Du købte " + lopTypeNavn(a.type) + " for " + lopPris(a) + ". Den kommer i Mine ting 📦";
      lopSidst = ""; lopHent(); lopHentLeveringer();
    }).catch(function (e) { status.textContent = "⚠️ " + e.message; ja.disabled = false; });
  });
}
// Byd bytte: vælg et af dine egne møbler fra Mine ting
function lopVisBytte(a) {
  if (lopReserveret) { lopKald("hv_lop_frigiv", { p_id: a.id }).catch(function () {}); lopReserveret = false; }
  clearInterval(lopKoebUr);
  const grupper = {};
  lager.forEach(function (t) { if (MOEBEL_TYPER[t.type]) grupper[t.type] = (grupper[t.type] || 0) + 1; });
  const typer = Object.keys(grupper).sort(function (x, y) { return lopTypeNavn(x).localeCompare(lopTypeNavn(y), "da"); });
  let valgt = null;
  lopKoeb.innerHTML = "<div class='lop-top'><b>🔄 Byd et bytte</b><button type='button' class='lop-luk'>✕</button></div>" +
    "<p>Du vil gerne have <b>" + lopRens(lopTypeNavn(a.type)) + "</b> fra " + lopRens(a.saelger) + ". Vælg et af dine møbler fra Mine ting at bytte med. " +
    lopRens(a.saelger) + " skal sige ja, før byttet sker. Imens passer loppemarkedet på dit møbel.</p>" +
    (typer.length ? "<div class='lop-bytte-gitter'>" + typer.map(function (t) {
      return "<button type='button' data-lop-type='" + lopRens(t) + "'><img src='" + lopRens(lopBillede(t)) + "' alt=''><span>" + lopRens(lopTypeNavn(t)) + "</span>" +
        (grupper[t] > 1 ? "<i>" + grupper[t] + "</i>" : "") + "</button>";
    }).join("") + "</div>" : "<p class='lop-tom'>Du har ingen møbler i Mine ting at bytte med.</p>") +
    "<p class='lop-status' id='lop-bytte-status'></p>" +
    "<div class='lop-knapper'><button type='button' class='lop-lys' id='lop-fortryd'>Fortryd</button><button type='button' id='lop-send-bytte' disabled>📨 Send bytteforslag</button></div>";
  lopKoeb.querySelector(".lop-luk").addEventListener("click", lopLukKoeb);
  lopKoeb.querySelector("#lop-fortryd").addEventListener("click", lopLukKoeb);
  const send = lopKoeb.querySelector("#lop-send-bytte"), status = lopKoeb.querySelector("#lop-bytte-status");
  lopKoeb.querySelectorAll("[data-lop-type]").forEach(function (k) {
    k.addEventListener("click", function () {
      valgt = k.dataset.lopType;
      lopKoeb.querySelectorAll("[data-lop-type]").forEach(function (x) { x.classList.toggle("valgt", x === k); });
      send.disabled = false;
    });
  });
  send.addEventListener("click", function () {
    if (!valgt) return;
    send.disabled = true;
    fraLager(valgt);              // møblet er hos loppemarkedet, til der er svar
    const type = valgt;
    lopKald("hv_lop_byd_bytte", { p_id: a.id, p_type: type }).then(function () {
      lopLukKoeb();
      besked.textContent = "📨 Dit bytteforslag er sendt til " + a.saelger + ". Du kan se det i 📋 Mit loppemarked.";
      lopSidst = ""; lopHent();
    }).catch(function (e) {
      laegILager(type);
      status.textContent = "⚠️ " + e.message;
      send.disabled = false;
    });
  });
}


// -------------------------------------------------------------
//  Prislisten ude i siden (kun på markedet)
// -------------------------------------------------------------
const lopSide = document.createElement("div");
lopSide.id = "lop-side";
lopSide.hidden = true;
lopSide.innerHTML = "<div class='lop-top'><b>🧺 Loppemarkedet</b><button type='button' class='lop-luk' id='lop-side-mini' title='Gør mindre'>–</button></div>" +
  "<div id='lop-side-krop'><p id='lop-side-status'></p><div class='lop-side-knapper' id='lop-side-knapper'></div>" +
  "<div class='lop-soeg'><input id='lop-soeg' type='text' placeholder='🔍 Søg efter møbler …'><select id='lop-sorter'><option value='nyt'>Nyeste</option>" +
  "<option value='billig'>Billigst</option><option value='navn'>Navn</option></select></div>" +
  "<h4>🏷 Prisliste <small id='lop-antal'></small></h4><ul id='lop-liste'></ul></div>";
document.body.appendChild(lopSide);
let lopSideMini = false;
try { lopSideMini = localStorage.getItem("mit-hotel-lop-mini") === "1"; } catch (e) {}
document.getElementById("lop-side-mini").addEventListener("click", function () {
  lopSideMini = !lopSideMini;
  try { localStorage.setItem("mit-hotel-lop-mini", lopSideMini ? "1" : "0"); } catch (e) {}
  lopVisSide();
});
document.getElementById("lop-soeg").addEventListener("input", lopVisListe);
document.getElementById("lop-sorter").addEventListener("change", lopVisListe);

function lopVisSide() {
  lopSide.hidden = !iLop();
  if (lopSide.hidden) return;
  document.getElementById("lop-side-krop").hidden = lopSideMini;
  document.getElementById("lop-side-mini").textContent = lopSideMini ? "+" : "–";
  document.getElementById("lop-side-status").innerHTML = LOP.fejl ? "⚠️ " + lopRens(LOP.fejl) :
    LOP.aaben ? "🟢 Åbent · " + LOP.boder.length + " boder · " + LOP.annoncer.length + " ting til salg" : "🔒 Lukket for gæster (du er ansat)";
  const b = lopMinBod();
  const knapper = document.getElementById("lop-side-knapper");
  knapper.innerHTML = (b ? "<button type='button' id='lop-gaa-bod'>🏷 Min bod: " + lopRens(b.navn) + "</button>" : "<button type='button' id='lop-opret'>➕ Opret min bod</button>") +
    "<button type='button' id='lop-mit'>📋 Mit loppemarked" + (LOP.bytteInd.length ? " <i>" + LOP.bytteInd.length + "</i>" : "") + "</button>" +
    "<button type='button' id='lop-regler-knap' class='lop-lys'>📜 Regler</button>";
  const g = document.getElementById("lop-gaa-bod"), o = document.getElementById("lop-opret");
  if (g) g.addEventListener("click", function () { lopGaaTilPlads(b.plads); besked.textContent = "Stil møbler fra 📦 Mine ting i din bod, og klik på dem for at sætte en pris."; });
  if (o) o.addEventListener("click", function () { lopAabnOpret(null); });
  document.getElementById("lop-mit").addEventListener("click", lopAabnOversigt);
  document.getElementById("lop-regler-knap").addEventListener("click", lopVisRegler);
  lopVisListe();
}
function lopVisListe() {
  if (lopSide.hidden) return;
  const q = document.getElementById("lop-soeg").value.trim().toLowerCase();
  const sort = document.getElementById("lop-sorter").value;
  let liste = LOP.annoncer.filter(function (a) {
    return !q || lopTypeNavn(a.type).toLowerCase().indexOf(q) >= 0 || String(a.bodNavn).toLowerCase().indexOf(q) >= 0 || String(a.saelger).toLowerCase().indexOf(q) >= 0;
  });
  if (sort === "billig") liste.sort(function (a, b) { return (a.valuta === "stella" ? a.pris * 50 : a.pris) - (b.valuta === "stella" ? b.pris * 50 : b.pris); });
  if (sort === "navn") liste.sort(function (a, b) { return lopTypeNavn(a.type).localeCompare(lopTypeNavn(b.type), "da"); });
  document.getElementById("lop-antal").textContent = "(" + liste.length + ")";
  const ul = document.getElementById("lop-liste");
  ul.innerHTML = liste.length ? liste.map(function (a) {
    const min = String(a.saelger).toLowerCase() === lopMig();
    return "<li><img src='" + lopRens(lopBillede(a.type)) + "' alt=''><div><b>" + lopRens(lopTypeNavn(a.type)) + "</b>" +
      "<small>«" + lopRens(a.bodNavn) + "» · " + lopRens(a.saelger) + "</small><span class='lop-pris'>" + lopPris(a) + "</span></div>" +
      "<div class='lop-li-knapper'><button type='button' class='lop-lys' data-lop-vis='" + a.id + "' title='Gå hen til boden'>👀</button>" +
      (min ? "<em>Din</em>" : a.optaget && !a.mig ? "<em title='En handel er i gang'>🔒</em>" : "<button type='button' data-lop-koeb='" + a.id + "'>🛒</button>") + "</div></li>";
  }).join("") : "<li class='lop-tom'>" + (q ? "Ingen møbler passer til din søgning." : "Der er ikke noget til salg endnu. Opret en bod og sæt noget til salg!") + "</li>";
  ul.querySelectorAll("[data-lop-vis]").forEach(function (k) { k.addEventListener("click", function () { lopVisAnnonce(+k.dataset.lopVis); }); });
  ul.querySelectorAll("[data-lop-koeb]").forEach(function (k) { k.addEventListener("click", function () { lopAabnKoeb(+k.dataset.lopKoeb, false); }); });
}
function lopGaaTilPlads(nr) {
  const p = LOP_PLADSER[nr];
  if (!p || !iLop()) return;
  const maal = [{ x: p.x + 2, y: p.y + p.d }, { x: p.x + 1, y: p.y + p.d }, { x: p.x + 3, y: p.y + p.d }, { x: p.x - 1, y: p.y + 1 }];
  for (const f of maal) { if (kanGaa(f.x, f.y)) { gaaTil(f.x, f.y); return; } }
}
function lopVisAnnonce(id) {
  const a = LOP.annoncer.find(function (x) { return x.id === id; });
  const bod = a && lopBod(a.bod);
  if (!bod) return;
  lopGaaTilPlads(bod.plads);
  const m = LOP_LISTE.find(function (x) { return x.lopId === a.moebel; });
  if (m) { valgtMoebel = m; opdaterPanel(); }
}


// -------------------------------------------------------------
//  Opret bod
// -------------------------------------------------------------
const lopOpret = document.createElement("div");
lopOpret.id = "lop-opret-vindue";
lopOpret.className = "lop-vindue";
lopOpret.hidden = true;
document.body.appendChild(lopOpret);
function lopAabnOpret(plads) {
  if (lopMinBod()) return;
  if (!LOP.aaben && !lopErAnsat()) { besked.textContent = "🔒 Loppemarkedet er lukket."; return; }
  let valgt = plads;
  function tegn() {
    lopOpret.innerHTML = "<div class='lop-top'><b>➕ Opret din bod</b><button type='button' class='lop-luk'>✕</button></div>" +
      "<label class='lop-felt'>Hvad skal din bod hedde?<input id='lop-bod-navn' type='text' maxlength='24' placeholder='Fx Idas Lopper'></label>" +
      "<p>Vælg en ledig plads:</p><div class='lop-pladser'>" + LOP_PLADSER.map(function (p) {
        const b = LOP.boder.find(function (x) { return x.plads === p.nr; });
        return "<button type='button' data-lop-plads='" + p.nr + "'" + (b ? " disabled title='" + lopRens(b.navn) + "'" : "") + (valgt === p.nr ? " class='valgt'" : "") + ">" +
          (p.nr + 1) + "<small>" + (b ? lopRens(b.ejer) : "Ledig") + "</small></button>";
      }).join("") + "</div><p class='lop-status' id='lop-opret-status'></p>" +
      "<div class='lop-knapper'><button type='button' class='lop-lys' id='lop-opret-fortryd'>Fortryd</button><button type='button' id='lop-opret-ok'>🧺 Opret bod</button></div>";
    lopOpret.querySelector(".lop-luk").addEventListener("click", function () { lopOpret.hidden = true; });
    lopOpret.querySelector("#lop-opret-fortryd").addEventListener("click", function () { lopOpret.hidden = true; });
    lopOpret.querySelectorAll("[data-lop-plads]").forEach(function (k) {
      k.addEventListener("click", function () {
        const n = document.getElementById("lop-bod-navn").value;
        valgt = +k.dataset.lopPlads; tegn();
        document.getElementById("lop-bod-navn").value = n;
      });
    });
    lopOpret.querySelector("#lop-opret-ok").addEventListener("click", function () {
      const navn = document.getElementById("lop-bod-navn").value.trim(), status = document.getElementById("lop-opret-status");
      if (!navn) { status.textContent = "Giv din bod et navn."; return; }
      if (valgt == null) { status.textContent = "Vælg en plads."; return; }
      lopKald("hv_lop_bod_opret", { p_plads: valgt, p_navn: navn }).then(function () {
        lopOpret.hidden = true;
        besked.textContent = "🎉 Din bod «" + navn + "» er klar! Stil møbler i den fra 📦 Mine ting, og klik på dem for at sætte en pris.";
        const nr = valgt;
        lopSidst = "";
        lopHent();
        setTimeout(function () { lopGaaTilPlads(nr); }, 400);
      }).catch(function (e) { status.textContent = "⚠️ " + e.message; });
    });
  }
  tegn();
  lopOpret.hidden = false;
  setTimeout(function () { const f = document.getElementById("lop-bod-navn"); if (f) f.focus(); }, 50);
}


// -------------------------------------------------------------
//  📋 Mit loppemarked: annoncer, bytte og handler
// -------------------------------------------------------------
const lopOversigt = document.createElement("div");
lopOversigt.id = "lop-oversigt";
lopOversigt.className = "lop-vindue";
lopOversigt.hidden = true;
document.body.appendChild(lopOversigt);
let lopOvFane = "salg";
function lopAabnOversigt() { lopOversigt.hidden = false; lopVisOversigt(); lopHent(); }
function lopSkriverI(el) { const a = document.activeElement; return !!a && el.contains(a) && /INPUT|SELECT/.test(a.tagName); }
function lopVisOversigt() {
  if (lopOversigt.hidden || lopSkriverI(lopOversigt)) return;
  const b = lopMinBod();
  const mine = LOP.annoncer.filter(function (a) { return String(a.saelger).toLowerCase() === lopMig(); });
  const faner = [["salg", "🏷 Til salg", mine.length], ["bytte", "🔄 Bytte", LOP.bytteInd.length + LOP.bytteUd.length], ["handler", "🧾 Mine handler", LOP.handler.length], ["bod", "🧺 Min bod", 0]];
  let html = "<div class='lop-top' id='lop-ov-top'><b>📋 Mit loppemarked</b><button type='button' class='lop-luk'>✕</button></div>" +
    (LOP.fejl ? "<p class='lop-status'>⚠️ " + lopRens(LOP.fejl) + "</p>" : "") +
    "<div class='lop-faner'>" + faner.map(function (f) {
      return "<button type='button' data-lop-fane='" + f[0] + "'" + (lopOvFane === f[0] ? " class='valgt'" : "") + ">" + f[1] + (f[2] ? " <small>" + f[2] + "</small>" : "") + "</button>";
    }).join("") + "</div><div class='lop-ov-krop'>";
  if (lopOvFane === "salg") {
    html += "<p class='lop-lille'>Du har " + mine.length + " af højst " + LOP.maks + " ting til salg.</p>";
    html += mine.length ? "<ul class='lop-ov-liste'>" + mine.map(function (a) {
      return "<li><img src='" + lopRens(lopBillede(a.type)) + "' alt=''><div><b>" + lopRens(lopTypeNavn(a.type)) + "</b><small>Nu: " + lopPris(a) +
        (a.optaget ? " · <span class='lop-optaget'>🔒 Handel i gang</span>" : "") + "</small>" +
        "<div class='lop-mi-raekke'><input type='number' min='1' max='1000000' value='" + a.pris + "' data-lop-pris='" + a.id + "'>" +
        "<select data-lop-valuta='" + a.id + "'><option value='glimt'" + (a.valuta === "glimt" ? " selected" : "") + ">⭐</option><option value='stella'" + (a.valuta === "stella" ? " selected" : "") + ">🔮</option></select>" +
        "<button type='button' data-lop-gem='" + a.id + "'>💾 Ny pris</button><button type='button' class='lop-lys' data-lop-fjern='" + a.id + "'>🗑 Fjern</button></div></div></li>";
    }).join("") + "</ul>" : "<p class='lop-tom'>Du har ikke noget til salg. Gå til din bod på loppemarkedet, og klik på et møbel for at sætte en pris.</p>";
    if (b) {
      const ikke = (b.moebler || []).filter(function (d) { return !mine.some(function (a) { return a.moebel === d.id; }); });
      if (ikke.length) html += "<h4>Står i din bod, men er ikke til salg</h4><ul class='lop-ov-liste'>" + ikke.map(function (d) {
        return "<li><img src='" + lopRens(lopBillede(d.type)) + "' alt=''><div><b>" + lopRens(lopTypeNavn(d.type)) + "</b>" +
          "<div class='lop-mi-raekke'><input type='number' min='1' max='1000000' value='" + lopForslag(d.type) + "' data-lop-ny-pris='" + lopRens(d.id) + "'>" +
          "<select data-lop-ny-valuta='" + lopRens(d.id) + "'><option value='glimt'>⭐</option><option value='stella'>🔮</option></select>" +
          "<button type='button' data-lop-saelg='" + lopRens(d.id) + "'>🏷 Sæt til salg</button><button type='button' class='lop-lys' data-lop-hjem='" + lopRens(d.id) + "'>📦 Tag hjem</button></div></div></li>";
      }).join("") + "</ul>";
    }
  } else if (lopOvFane === "bytte") {
    html += "<h4>Bytteforslag til dig</h4>" + (LOP.bytteInd.length ? "<ul class='lop-ov-liste'>" + LOP.bytteInd.map(function (x) {
      return "<li><img src='" + lopRens(lopBillede(x.type)) + "' alt=''><div><b>" + lopRens(x.fra) + " vil bytte</b><small>Du får <b>" + lopRens(lopTypeNavn(x.type)) +
        "</b> · " + lopRens(x.fra) + " får din <b>" + lopRens(lopTypeNavn(x.minType)) + "</b></small>" +
        "<div class='lop-mi-raekke'><button type='button' data-lop-ja='" + x.id + "'>✔ Godkend bytte</button><button type='button' class='lop-lys' data-lop-nej='" + x.id + "'>✕ Nej tak</button></div></div></li>";
    }).join("") + "</ul>" : "<p class='lop-tom'>Ingen bytteforslag lige nu.</p>") +
      "<h4>Dine bytteforslag (venter på svar)</h4>" + (LOP.bytteUd.length ? "<ul class='lop-ov-liste'>" + LOP.bytteUd.map(function (x) {
        return "<li><img src='" + lopRens(lopBillede(x.deresType)) + "' alt=''><div><b>" + lopRens(lopTypeNavn(x.deresType)) + "</b><small>fra " + lopRens(x.til) +
          " · du byder <b>" + lopRens(lopTypeNavn(x.type)) + "</b></small><div class='lop-mi-raekke'><button type='button' class='lop-lys' data-lop-annuller='" + x.id + "'>↩ Træk tilbage</button></div></div></li>";
      }).join("") + "</ul>" : "<p class='lop-tom'>Du har ikke budt på noget.</p>") +
      "<p class='lop-lille'>Begge skal sige ja: du siger ja, når du sender et forslag, og den anden skal godkende. Svarer de ikke inden 2 døgn, får du dit møbel tilbage.</p>";
  } else if (lopOvFane === "handler") {
    html += LOP.handler.length ? "<ul class='lop-ov-liste'>" + LOP.handler.map(function (h) {
      const tid = h.tid ? new Date(h.tid).toLocaleString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
      const tekst = h.status === "byttet"
        ? (h.hvad === "solgt" ? "🔄 Byttede med " + h.med + " og fik " + lopTypeNavn(h.bytteType) : "🔄 Byttede " + lopTypeNavn(h.bytteType) + " med " + h.med)
        : (h.hvad === "solgt" ? "💰 Solgt til " + h.med + " for " + lopPris(h) : "🛒 Købt af " + h.med + " for " + lopPris(h));
      return "<li><img src='" + lopRens(lopBillede(h.type)) + "' alt=''><div><b>" + lopRens(lopTypeNavn(h.type)) + "</b><small>" + lopRens(tekst) + "</small><small class='lop-tid'>" + tid + "</small></div></li>";
    }).join("") + "</ul>" : "<p class='lop-tom'>Du har ikke handlet endnu.</p>";
  } else {
    html += b ? "<label class='lop-felt'>Bodens navn<input id='lop-ov-navn' type='text' maxlength='24' value='" + lopRens(b.navn) + "'></label>" +
      "<div class='lop-mi-raekke'><button type='button' id='lop-ov-omdoeb'>💾 Gem navn</button>" + (iLop() ? "<button type='button' class='lop-lys' id='lop-ov-gaa'>👀 Gå til min bod</button>" : "") + "</div>" +
      "<p class='lop-lille'>Plads " + (b.plads + 1) + " · " + (b.moebler || []).length + " møbler i boden.</p>" +
      "<h4>Luk boden</h4><p class='lop-lille'>Alle møbler fra boden kommer tilbage i Mine ting, og annoncerne forsvinder.</p>" +
      "<button type='button' class='lop-fare' id='lop-ov-slet'>🗑 Nedlæg min bod</button>"
      : "<p class='lop-tom'>Du har ingen bod endnu." + (LOP.aaben ? " Gå på loppemarkedet, og tryk ➕ Opret min bod." : " Loppemarkedet åbner om søndagen.") + "</p>";
  }
  html += "</div>";
  lopOversigt.innerHTML = html;
  goerFlytbarLop();
  lopOversigt.querySelector(".lop-luk").addEventListener("click", function () { lopOversigt.hidden = true; });
  lopOversigt.querySelectorAll("[data-lop-fane]").forEach(function (k) { k.addEventListener("click", function () { lopOvFane = k.dataset.lopFane; lopVisOversigt(); }); });
  const fejl = function (e) { besked.textContent = "⚠️ " + e.message; lopSidst = ""; lopHent(); };
  const igen = function (tekst) { return function () { if (tekst) besked.textContent = tekst; lopSidst = ""; lopHent(); }; };
  lopOversigt.querySelectorAll("[data-lop-gem]").forEach(function (k) {
    k.addEventListener("click", function () {
      const id = k.dataset.lopGem, p = parseInt(lopOversigt.querySelector("[data-lop-pris='" + id + "']").value, 10), v = lopOversigt.querySelector("[data-lop-valuta='" + id + "']").value;
      if (!(p > 0)) { besked.textContent = "Skriv en pris (mindst 1)."; return; }
      document.activeElement.blur();
      lopKald("hv_lop_pris", { p_id: +id, p_pris: p, p_valuta: v }).then(igen("💾 Prisen er ændret.")).catch(fejl);
    });
  });
  lopOversigt.querySelectorAll("[data-lop-fjern]").forEach(function (k) { k.addEventListener("click", function () { lopFjernAnnonce(+k.dataset.lopFjern); }); });
  lopOversigt.querySelectorAll("[data-lop-saelg]").forEach(function (k) {
    k.addEventListener("click", function () {
      const id = k.dataset.lopSaelg;
      const p = parseInt(lopOversigt.querySelector("[data-lop-ny-pris='" + id + "']").value, 10), v = lopOversigt.querySelector("[data-lop-ny-valuta='" + id + "']").value;
      if (!(p > 0)) { besked.textContent = "Skriv en pris (mindst 1)."; return; }
      document.activeElement.blur();
      lopKald("hv_lop_saelg", { p_moebel: id, p_pris: p, p_valuta: v }).then(igen("🏷 Sat til salg.")).catch(fejl);
    });
  });
  lopOversigt.querySelectorAll("[data-lop-hjem]").forEach(function (k) {
    k.addEventListener("click", function () {
      lopKald("hv_lop_tag_hjem", { p_moebel: k.dataset.lopHjem }).then(function () { lopSidst = ""; lopHent(); lopHentLeveringer(); }).catch(fejl);
    });
  });
  lopOversigt.querySelectorAll("[data-lop-ja]").forEach(function (k) {
    k.addEventListener("click", function () { lopKald("hv_lop_bytte_svar", { p_bytte: +k.dataset.lopJa, p_ja: true }).then(function () { igen("🔄 Byttet er godkendt!")(); lopHentLeveringer(); }).catch(fejl); });
  });
  lopOversigt.querySelectorAll("[data-lop-nej]").forEach(function (k) {
    k.addEventListener("click", function () { lopKald("hv_lop_bytte_svar", { p_bytte: +k.dataset.lopNej, p_ja: false }).then(igen("Du sagde nej tak til byttet.")).catch(fejl); });
  });
  lopOversigt.querySelectorAll("[data-lop-annuller]").forEach(function (k) {
    k.addEventListener("click", function () { lopKald("hv_lop_bytte_annuller", { p_bytte: +k.dataset.lopAnnuller }).then(function () { igen("↩ Dit bytteforslag er trukket tilbage.")(); lopHentLeveringer(); }).catch(fejl); });
  });
  const omd = document.getElementById("lop-ov-omdoeb");
  if (omd) omd.addEventListener("click", function () {
    const n = document.getElementById("lop-ov-navn").value.trim();
    document.activeElement.blur();
    lopKald("hv_lop_bod_navn", { p_navn: n }).then(igen("💾 Din bod hedder nu «" + n + "».")).catch(fejl);
  });
  const gaa = document.getElementById("lop-ov-gaa");
  if (gaa) gaa.addEventListener("click", function () { lopGaaTilPlads(b.plads); });
  const slet = document.getElementById("lop-ov-slet");
  if (slet) slet.addEventListener("click", function () {
    if (!slet.dataset.sikker) { slet.dataset.sikker = "1"; slet.textContent = "Er du sikker? Tryk igen"; return; }
    lopKald("hv_lop_bod_slet", { p_bod: null }).then(function () { igen("🧺 Din bod er nedlagt. Møblerne kommer i Mine ting.")(); lopHentLeveringer(); }).catch(fejl);
  });
}
let lopFlytbar = false;
function goerFlytbarLop() {
  if (lopFlytbar || typeof goerFlytbar !== "function") return;
  lopFlytbar = true;
  goerFlytbar(lopOversigt, lopOversigt, "mit-hotel-lop-oversigt-sted");
}

// Reglerne (fra tavlen eller knappen)
const lopReglerVindue = document.createElement("div");
lopReglerVindue.id = "lop-regler";
lopReglerVindue.className = "lop-vindue";
lopReglerVindue.hidden = true;
document.body.appendChild(lopReglerVindue);
function lopVisRegler() {
  lopReglerVindue.innerHTML = "<div class='lop-top'><b>📜 Loppemarkedets regler</b><button type='button' class='lop-luk'>✕</button></div><ol>" +
    lopRegler().map(function (r) { return "<li>" + lopRens(r) + "</li>"; }).join("") + "</ol>" +
    "<p class='lop-lille'>Sådan gør du: Opret en bod, stil møbler fra Mine ting i den, og klik på et møbel for at sætte en pris i ⭐ Glimt eller 🔮 Stella. " +
    "Når nogen køber det, får du pengene med det samme, og møblet kommer i køberens Mine ting.</p>" +
    "<div class='lop-knapper'><button type='button' id='lop-regler-ok'>OK, forstået</button></div>";
  lopReglerVindue.hidden = false;
  lopReglerVindue.querySelector(".lop-luk").addEventListener("click", function () { lopReglerVindue.hidden = true; });
  lopReglerVindue.querySelector("#lop-regler-ok").addEventListener("click", function () { lopReglerVindue.hidden = true; });
}
window.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if (!lopKoeb.hidden) lopLukKoeb();
  lopOpret.hidden = true; lopReglerVindue.hidden = true;
});

function lopVisAlt() {
  lopVisSide();
  lopVisOversigt();
  if (!ejerVindue.hidden && ejerFane === "loppe" && !(typeof skriverIPanel === "function" && skriverIPanel())) visFane();
  if (typeof navVindue !== "undefined" && !navVindue.hidden && typeof visNav === "function") visNav();
  if (iLop() && valgtMoebel && typeof visMoebelInfo === "function" && !lopSkriverI(lopMi)) visMoebelInfo();
}


// -------------------------------------------------------------
//  Navigatøren: 🔒 når det er lukket, Lås/Åben til de ansatte, og 📋 Mit loppemarked
// -------------------------------------------------------------
const visNavFoerLop = visNav;
visNav = function () {
  visNavFoerLop();
  navVindue.querySelectorAll("[data-besoeg='" + LOP_ID + "']").forEach(function (k) {
    if (!k.classList.contains("nav-besoeg")) return;
    if (lopLaastFor()) { k.disabled = true; k.textContent = "🔒 Lukket"; k.classList.add("laast"); }
    const mit = document.createElement("button");
    mit.className = "nav-slet lop-nav-knap";
    mit.textContent = "📋 Mit loppemarked";
    mit.addEventListener("click", function () { lopAabnOversigt(); });
    k.after(mit);
    if (!lopErAnsat()) return;
    const laas = document.createElement("button");
    laas.className = "nav-slet event-laas";
    laas.textContent = LOP.aaben ? "🔒 Lås" : "🔓 Åben";
    laas.title = LOP.aaben ? "Lås loppemarkedet" : "Åbn loppemarkedet for alle";
    laas.addEventListener("click", function () { lopSaetStatus(LOP.aaben ? "lukket" : "aaben"); });
    mit.after(laas);
  });
};


// -------------------------------------------------------------
//  Ejerpanel → 🧺 Loppemarked (ejeren og alle ansatte)
// -------------------------------------------------------------
function lopGivFane() {
  if (typeof ROLLE_FANER === "undefined") return;
  Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("loppe") < 0) ROLLE_FANER[r].push("loppe"); });
}
lopGivFane();
const lopFane = document.createElement("button");
lopFane.dataset.fane = "loppe";
lopFane.textContent = "🧺 Loppemarked";
lopFane.addEventListener("click", function () { ejerFane = "loppe"; visFane(); lopHent(); });
(function () {
  const faner = document.getElementById("ejer-faner");
  if (!faner) return;
  const efter = faner.querySelector('[data-fane="vagtskema"]') || faner.querySelector('[data-fane="staffchat"]');
  if (efter) efter.after(lopFane); else faner.appendChild(lopFane);
})();
setInterval(function () { lopGivFane(); lopFane.hidden = !lopErAnsat(); }, 1000);
lopFane.hidden = !lopErAnsat();
if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP.loppe = { titel: "🧺 Loppemarked",
  tekst: "Her låser og åbner du loppemarkedet. Når det er låst, kan kun ansatte komme ind.",
  punkter: ["🔓 Åben nu: alle kan komme ind og handle.", "🔒 Lås: kun ansatte kan komme ind.", "🗓 Hver søndag: markedet åbner af sig selv om søndagen (dansk tid).",
    "Du kan nedlægge en bod eller fjerne en annonce, hvis nogen ikke følger reglerne."] };
if (typeof JOB_KAN !== "undefined") ["mod", "staff", "hjaelper", "eventvaert", "bygmester", "support", "content-creator"].forEach(function (s) {
  const l = JOB_KAN[s];
  if (l && l.indexOf("🧺 Kan åbne og låse loppemarkedet") < 0) l.push("🧺 Kan åbne og låse loppemarkedet");
});

const visFaneFoerLop = visFane;
visFane = function () {
  const min = ejerFane === "loppe";
  if (min) ejerIndhold.innerHTML = "";
  visFaneFoerLop();
  if (ejerVindue.hidden || !min || !lopErAnsat()) return;
  const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
  ejerIndhold.innerHTML = "";
  if (hjaelp) ejerIndhold.appendChild(hjaelp);
  const sek = document.createElement("div");
  sek.className = "lop-panel";
  const ejer = EJERE.indexOf(FIGUR.navn) >= 0;
  const t = LOP.tilstand;
  sek.innerHTML = "<h3>🧺 Loppemarkedet</h3>" + (LOP.fejl ? "<p class='ejer-info'>⚠️ " + lopRens(LOP.fejl) + "</p>" : "") +
    "<p class='lop-panel-status " + (LOP.aaben ? "aaben" : "laast") + "'>" + (LOP.aaben ? "🟢 Åbent for alle lige nu" : "🔒 Låst (kun ansatte kan komme ind)") +
    (t === "soendag" ? " · 🗓 åbner selv hver søndag" : "") + "</p>" +
    "<div class='sp-handlinger'><button data-lop-tilstand='aaben'" + (t === "aaben" ? " class='valgt'" : "") + ">🔓 Åben nu</button>" +
    "<button data-lop-tilstand='lukket'" + (t === "lukket" ? " class='valgt'" : "") + ">🔒 Lås</button>" +
    "<button data-lop-tilstand='soendag'" + (t === "soendag" ? " class='valgt'" : "") + ">🗓 Åben hver søndag</button>" +
    "<button data-lop-gaa>Gå derind</button></div>" +
    (ejer ? "<label class='ejer-felt'>Højst antal ting til salg pr. gæst<input id='lop-maks' type='number' min='1' max='100' value='" + LOP.maks + "'></label>" +
      "<div class='sp-handlinger'><button id='lop-maks-gem'>💾 Gem antal</button></div>" : "<p class='ejer-info'>Hver gæst kan højst have " + LOP.maks + " ting til salg.</p>") +
    "<h3>Boder (" + LOP.boder.length + " af " + LOP_PLADSER.length + ")</h3>" + (LOP.boder.length ? "<ul class='lop-panel-liste'>" + LOP.boder.map(function (b) {
      const antal = LOP.annoncer.filter(function (a) { return a.bod === b.id; }).length;
      return "<li><b>" + (b.plads + 1) + ". " + lopRens(b.navn) + "</b> <span>" + lopRens(b.ejer) + " · " + (b.moebler || []).length + " møbler · " + antal + " til salg</span>" +
        "<button data-lop-panel-slet='" + b.id + "'>🗑 Nedlæg</button></li>";
    }).join("") + "</ul>" : "<p class='ejer-info'>Ingen boder endnu.</p>") +
    "<h3>Til salg (" + LOP.annoncer.length + ")</h3>" + (LOP.annoncer.length ? "<ul class='lop-panel-liste'>" + LOP.annoncer.map(function (a) {
      return "<li><b>" + lopRens(lopTypeNavn(a.type)) + "</b> <span>" + lopPris(a) + " · " + lopRens(a.saelger) + " («" + lopRens(a.bodNavn) + "»)</span>" +
        "<button data-lop-panel-fjern='" + a.id + "'>Fjern</button></li>";
    }).join("") + "</ul>" : "<p class='ejer-info'>Der er ikke noget til salg.</p>");
  ejerIndhold.appendChild(sek);
  sek.querySelectorAll("[data-lop-tilstand]").forEach(function (k) { k.addEventListener("click", function () { lopSaetStatus(k.dataset.lopTilstand); }); });
  sek.querySelector("[data-lop-gaa]").addEventListener("click", function () { ejerVindue.hidden = true; gaaTilVaerelse(LOP_ID); });
  const mg = document.getElementById("lop-maks-gem");
  if (mg) mg.addEventListener("click", function () { lopSaetStatus(null, parseInt(document.getElementById("lop-maks").value, 10) || 10); });
  sek.querySelectorAll("[data-lop-panel-slet]").forEach(function (k) {
    k.addEventListener("click", function () {
      if (!k.dataset.sikker) { k.dataset.sikker = "1"; k.textContent = "Er du sikker?"; return; }
      lopKald("hv_lop_bod_slet", { p_bod: +k.dataset.lopPanelSlet }).then(function () { besked.textContent = "🗑 Boden er nedlagt. Møblerne er sendt hjem til ejeren."; lopSidst = ""; lopHent(); })
        .catch(function (e) { besked.textContent = "⚠️ " + e.message; });
    });
  });
  sek.querySelectorAll("[data-lop-panel-fjern]").forEach(function (k) {
    k.addEventListener("click", function () { lopFjernAnnonce(+k.dataset.lopPanelFjern); });
  });
};


// -------------------------------------------------------------
//  Udseendet (vinrød, guld og creme)
// -------------------------------------------------------------
const lopStil = document.createElement("style");
lopStil.textContent = [
  "#lop-side, .lop-vindue { font-family: Verdana, sans-serif; color: #3a1a14; background: #fbf3e4; border: 3px solid #d9a441; border-radius: 12px;",
  "  box-shadow: 0 8px 22px rgba(60,10,20,.35); box-sizing: border-box; }",
  "#lop-side[hidden], .lop-vindue[hidden], #lop-mi[hidden], #lop-side-krop[hidden] { display: none !important; }",
  "#lop-side { position: fixed; right: 12px; top: 64px; width: 290px; max-height: calc(100vh - 190px); display: flex; flex-direction: column; z-index: 45; overflow: hidden; }",
  "#lop-side-krop { display: flex; flex-direction: column; min-height: 0; padding: 8px 10px 10px; }",
  ".lop-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 7px 10px; background: #7a1f2e; color: #f6dfa0; font: bold 14px Georgia, serif; cursor: default; }",
  ".lop-luk { background: rgba(0,0,0,.2) !important; color: #f6dfa0 !important; border: 1px solid rgba(246,223,160,.5) !important; border-radius: 6px; width: 26px; height: 24px; cursor: pointer; padding: 0; font-size: 13px; }",
  "#lop-side-status { margin: 0 0 6px; font-size: 12px; }",
  ".lop-side-knapper { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }",
  "#lop-side button, .lop-vindue button, #lop-mi button { background: linear-gradient(180deg, #9a2a3a, #7a1f2e); color: #fbeacb; border: 1px solid #5a1420; border-radius: 7px;",
  "  padding: 5px 9px; font: 12px Verdana, sans-serif; cursor: pointer; }",
  "#lop-side button:hover, .lop-vindue button:hover, #lop-mi button:hover { filter: brightness(1.1); }",
  "#lop-side button:disabled, .lop-vindue button:disabled, #lop-mi button:disabled { opacity: .5; cursor: default; }",
  "#lop-side button.lop-lys, .lop-vindue button.lop-lys, #lop-mi button.lop-lys { background: #f3e2bf; color: #5a2a18; border-color: #d9a441; }",
  ".lop-vindue button.lop-fare { background: #b3242f; }",
  "#lop-side button i, .lop-faner small { background: #d9a441; color: #3a1a14; border-radius: 9px; padding: 0 6px; font-style: normal; font-size: 11px; margin-left: 3px; }",
  ".lop-soeg { display: flex; gap: 5px; }",
  ".lop-soeg input, .lop-vindue input, #lop-mi input, .lop-soeg select, .lop-vindue select, #lop-mi select { border: 1px solid #d9a441; border-radius: 6px; padding: 5px 6px;",
  "  font: 12px Verdana, sans-serif; background: #fff; color: #3a1a14; min-width: 0; }",
  ".lop-soeg input { flex: 1; }",
  "#lop-side h4, .lop-vindue h4 { margin: 10px 0 4px; font: bold 13px Georgia, serif; color: #7a1f2e; }",
  "#lop-side h4 small { color: #8a6a4a; font-weight: normal; }",
  "#lop-liste { list-style: none; margin: 0; padding: 0; overflow-y: auto; min-height: 0; flex: 1; }",
  "#lop-liste li, .lop-ov-liste li { display: flex; gap: 8px; align-items: center; padding: 6px; border-bottom: 1px solid #eadcbc; }",
  "#lop-liste li img, .lop-ov-liste li img { width: 44px; height: 44px; object-fit: contain; flex: none; background: #f3e8d2; border-radius: 6px; }",
  "#lop-liste li > div:nth-child(2), .lop-ov-liste li > div { flex: 1; min-width: 0; }",
  "#lop-liste b, .lop-ov-liste b { display: block; font-size: 12px; } #lop-liste small, .lop-ov-liste small { display: block; color: #7a6a5a; font-size: 11px; }",
  ".lop-pris { font-weight: bold; color: #7a1f2e; font-size: 12px; }",
  ".lop-li-knapper { display: flex; gap: 4px; align-items: center; } .lop-li-knapper em { font-size: 11px; color: #8a6a4a; }",
  ".lop-tom { color: #8a6a4a; font-size: 12px; font-style: italic; border: 0 !important; }",
  ".lop-lille { font-size: 11px; color: #6a5a4a; } .lop-status { font-size: 12px; color: #7a1f2e; min-height: 1em; margin: 6px 0; }",
  ".lop-optaget { color: #b3242f; font-size: 11px; }",
  ".lop-vindue { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 80; width: min(420px, calc(100vw - 32px)); max-height: calc(100vh - 60px); overflow: auto; }",
  ".lop-vindue > p, .lop-vindue > ol, .lop-vindue > label, .lop-vindue > .lop-pladser, .lop-vindue > .lop-bytte-gitter { margin-left: 12px; margin-right: 12px; font-size: 13px; }",
  ".lop-knapper { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; padding: 4px 12px 12px; }",
  ".lop-koeb-krop { display: flex; gap: 12px; padding: 12px; align-items: center; } .lop-koeb-krop img { width: 110px; height: 110px; object-fit: contain; background: #f3e8d2; border-radius: 10px; }",
  ".lop-koeb-krop h3 { margin: 0 0 4px; font: bold 16px Georgia, serif; color: #7a1f2e; } .lop-koeb-krop p { margin: 2px 0; font-size: 12px; }",
  ".lop-stor-pris { font-size: 20px !important; font-weight: bold; color: #7a1f2e; }",
  ".lop-vindue .lop-status { margin: 0 12px 6px; }",
  ".lop-bytte-gitter { display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 6px; max-height: 240px; overflow: auto; }",
  ".lop-vindue .lop-bytte-gitter button { background: #fff; color: #3a1a14; border: 2px solid #eadcbc; position: relative; padding: 4px; display: flex; flex-direction: column; align-items: center; gap: 2px; }",
  ".lop-bytte-gitter img { width: 60px; height: 60px; object-fit: contain; } .lop-bytte-gitter span { font-size: 10px; line-height: 1.2; }",
  ".lop-bytte-gitter i { position: absolute; top: 2px; right: 4px; background: #7a1f2e; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 10px; font-style: normal; }",
  ".lop-vindue .lop-bytte-gitter button.valgt { border-color: #d9a441; background: #fff3d6; }",
  ".lop-felt { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; font-weight: bold; font-size: 12px; } .lop-felt input { font-weight: normal; }",
  ".lop-pladser { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; max-height: 46vh; overflow-y: auto; }",
  ".lop-vindue .lop-pladser button { background: #f3e2bf; color: #3a1a14; border-color: #d9a441; font-weight: bold; }",
  ".lop-vindue .lop-pladser button small { display: block; font-weight: normal; font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
  ".lop-vindue .lop-pladser button { padding: 4px 2px; min-width: 0; font-size: 12px; }",
  ".lop-vindue .lop-pladser button.valgt { background: #7a1f2e; color: #fbeacb; }",
  "#lop-oversigt { width: min(520px, calc(100vw - 32px)); }",
  ".lop-faner { display: flex; gap: 4px; padding: 8px 10px 0; flex-wrap: wrap; }",
  ".lop-vindue .lop-faner button { background: #f3e2bf; color: #5a2a18; border-color: #d9a441; } .lop-vindue .lop-faner button.valgt { background: #7a1f2e; color: #fbeacb; }",
  ".lop-ov-krop { padding: 4px 12px 12px; } .lop-ov-liste { list-style: none; margin: 0; padding: 0; }",
  ".lop-mi-raekke { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; align-items: center; } .lop-mi-raekke input { width: 80px; }",
  ".lop-tid { color: #a08a6a !important; }",
  "#lop-mi { border-top: 1px solid #d9a441; margin-top: 6px; padding-top: 6px; font-family: Verdana, sans-serif; color: #3a1a14; }",
  "#lop-mi p { margin: 2px 0; font-size: 12px; } #lop-mi .lop-mi-pris b { color: #7a1f2e; }",
  "#lop-mi button#lop-mi-fjern { margin-top: 4px; }",
  ".lop-nav-knap { white-space: nowrap; }",
  "#ejer-vindue #ejer-indhold#ejer-indhold .lop-panel-liste { list-style: none; padding: 0; margin: 4px 0; }",
  "#ejer-vindue #ejer-indhold#ejer-indhold .lop-panel-liste li { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 5px 0; border-bottom: 1px solid rgba(0,0,0,.1); }",
  "#ejer-vindue #ejer-indhold#ejer-indhold .lop-panel-liste li span { flex: 1; font-size: 12px; opacity: .8; }",
  "#ejer-vindue #ejer-indhold#ejer-indhold .lop-panel-status { font-weight: bold; padding: 6px 10px; border-radius: 8px; background: rgba(0,0,0,.06); }",
  "#lop-toast { position: fixed; left: 50%; top: 70px; transform: translateX(-50%); z-index: 90; max-width: min(460px, calc(100vw - 32px)); background: #fbf3e4; color: #4a2a1c; border: 3px solid #7a1f2e; border-radius: 12px; padding: 10px 16px; font: bold 15px/1.35 system-ui, sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,.35); text-align: center; }",
  "#lop-toast[hidden] { display: none; }",
  "@media (max-width: 700px) { #lop-side { width: calc(100vw - 24px); top: auto; bottom: 120px; max-height: 45vh; } }",
].join("\n");
document.head.appendChild(lopStil);

// lyt efter ændringer, når man går ind og ud
lopLavFaste();
lopTjekLaas();
