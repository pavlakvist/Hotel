// =============================================================
//  Køleskabet 🧊 — klik på det, så åbner døren, og du får
//  en gulerod 🥕, en sodavand 🥤 eller en is 🍦 i hånden.
//  Man spiser/drikker den lidt ad gangen (en bid hvert 5. sekund),
//  og man kan give den videre: klik på en anden og vælg "🎁 Giv".
//  Rigtige spillere ser det hele via serveren (p_sidder i hv_puls),
//  så der skal ikke køres noget nyt i databasen.
// =============================================================

// Maden. "raekke" er rækken i billeder/mad/mad.png (4 billeder à 48x64: hel, 1 bid, 2 bid, 3 bid)
const MAD = {
  gulerod:  { navn: "gulerod",  hvad: "en gulerod",  tegn: "🥕", raekke: 0, lyd: "Nam!",   goer: "spiser", greb: 0.5 },
  sodavand: { navn: "sodavand", hvad: "en sodavand", tegn: "🥤", raekke: 1, lyd: "Slurp!", goer: "drikker", greb: 0.55 },
  is:       { navn: "is",       hvad: "en is",       tegn: "🍦", raekke: 2, lyd: "Mmm!",   goer: "spiser", greb: 0.72 },
};
const MAD_BILLEDE = "billeder/mad/mad.png";
const MAD_BIDDER = 4;           // så mange bidder, så er den væk
const MAD_BID_TID = 5000;       // et bid hvert 5. sekund
const MAD_NOEGLE = "mit-hotel-haand";
const GAVER_NOEGLE = "mit-hotel-gaver-faaet";

// Køleskabene med åben dør (samme rækkefølge som klipper: de 4 retninger)
const KOELESKAB_AABEN = {
  "ny-koeleskab": { billede: "billeder/moebler/koeleskab-aaben.png",
    klipper: [[0, 0, 206, 294], [210, 0, 206, 294], [420, 0, 206, 284], [630, 0, 170, 284]] },
};
function erKoeleskab(type) { return !!(type && KOELESKAB_AABEN[type.id]); }

// Det, du har i hånden: { ting: "is", bid: 0, sidstBid: tid }
let minHaand = null;
try {
  const h = JSON.parse(localStorage.getItem(MAD_NOEGLE) || "null");
  if (h && MAD[h.ting]) minHaand = { ting: h.ting, bid: h.bid || 0, sidstBid: performance.now(), loeft: 0 };
} catch (e) {}
function gemHaand() {
  try { localStorage.setItem(MAD_NOEGLE, JSON.stringify(minHaand ? { ting: minHaand.ting, bid: minHaand.bid } : null)); } catch (e) {}
}

// Computer-gæsternes hænder (Ida, Noah …): navn -> samme slags som minHaand
const GAEST_HAAND = {};

function giHaand(ting, bid) {
  return { ting: ting, bid: bid || 0, sidstBid: performance.now(), loeft: 0 };
}


// -------------------------------------------------------------
//  Køleskabsdøren: åben i 1,6 sekund
// -------------------------------------------------------------
const AABNE_KOELESKABE = [];    // { x, y, til }
function aabnDoer(x, y) {
  AABNE_KOELESKABE.push({ x: x, y: y, til: performance.now() + 1600 });
}

const tegnMoebelFoerKoel = tegnMoebel;
tegnMoebel = function (c, type, cx, cy, spejlet, retning) {
  const aaben = erKoeleskab(type) && AABNE_KOELESKABE.some(function (a) {
    if (a.til < performance.now()) return false;
    const m = moeblerIRummet.find(function (mm) { return mm.x === a.x && mm.y === a.y && MOEBEL_TYPER[mm.type] === type; });
    if (!m) return false;
    const s = moebelSted(type, m.x, m.y, drejetTvaers(m));
    return Math.abs(s.x - cx) < 1 && Math.abs(s.y - cy) < 1;
  });
  const b = aaben && hentBillede(KOELESKAB_AABEN[type.id].billede);
  if (!aaben || !billedeKlar(b)) return tegnMoebelFoerKoel(c, type, cx, cy, spejlet, retning);
  const k = KOELESKAB_AABEN[type.id].klipper[retning || 0], s = type.skala || 1;
  c.drawImage(b, k[0], k[1], k[2], k[3], cx - k[2] * s / 2, cy + FLISE_H / 2 - k[3] * s, k[2] * s, k[3] * s);
};
// gamle åbne døre ryddes væk
setInterval(function () {
  for (let i = AABNE_KOELESKABE.length - 1; i >= 0; i--) if (AABNE_KOELESKABE[i].til < performance.now()) AABNE_KOELESKABE.splice(i, 1);
}, 2000);


// -------------------------------------------------------------
//  Klik på køleskabet: gå hen foran døren, og åbn den
// -------------------------------------------------------------
let gaarTilKoeleskab = null;   // { m, x, y }
let sidstAabnet = null;        // { x, y, id } sendes til de andre i rummet

// Feltet foran døren (døren sidder på forskellige sider, når køleskabet er drejet)
function foranKoeleskab(m) {
  const r = m.retning || 0;
  const foran = [[0, 1], [1, 0], [0, -1], [-1, 0]][r];
  const resten = [[0, 1], [1, 0], [0, -1], [-1, 0]].filter(function (d) { return d !== foran; });
  return [foran].concat(resten).map(function (d) { return { x: m.x + d[0], y: m.y + d[1] }; });
}

// Hvilket køleskab er musen over? Man kan klikke på hele billedet af køleskabet,
// ikke kun på feltet nederst (ellers går man hen bag det, når man klikker på toppen).
const koelPixels = {};   // billede -> lærred, så vi kan se, om man rammer en gennemsigtig pixel
function koelRammer(type, m, sx, sy) {
  const b = hentBillede(type.billede);
  if (!billedeKlar(b)) return false;
  const k = (type.klipper && type.klipper[m.retning || 0]) || type.klip;
  const s = type.skala || 1;
  const sted = moebelSted(type, m.x, m.y, drejetTvaers(m));
  const venstre = sted.x - k[2] * s / 2, top = sted.y + FLISE_H / 2 - k[3] * s;
  const px = (sx - venstre) / s, py = (sy - top) / s;
  if (px < 0 || py < 0 || px >= k[2] || py >= k[3]) return false;
  try {
    let c = koelPixels[type.billede];
    if (!c) {
      c = koelPixels[type.billede] = document.createElement("canvas");
      c.width = b.naturalWidth; c.height = b.naturalHeight;
      c.getContext("2d").drawImage(b, 0, 0);
    }
    return c.getContext("2d").getImageData(Math.floor(k[0] + px), Math.floor(k[1] + py), 1, 1).data[3] > 40;
  } catch (e) {
    return true;   // (åbnet direkte fra computeren må man ikke læse pixels; så tæller hele firkanten)
  }
}
function koeleskabUnderMus(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width);
  const sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  moeblerIRummet.forEach(function (m) {
    const type = MOEBEL_TYPER[m.type];
    if (!erKoeleskab(type) || !koelRammer(type, m, sx, sy)) return;
    if (!fundet || moebelDybde(m) > moebelDybde(fundet)) fundet = m;   // det forreste vinder
  });
  if (!fundet) {
    const f = musTilFelt(e);
    const m = moebelPaa(f.x, f.y);
    if (m && erKoeleskab(MOEBEL_TYPER[m.type])) fundet = m;
  }
  return fundet;
}

laerred.addEventListener("click", function (e) {
  // er man ved at stille eller flytte et møbel, skal køleskabet ikke åbne
  if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
  const m = koeleskabUnderMus(e);
  if (!m) return;
  e.stopImmediatePropagation();
  valgtMoebel = m;       // møbel-boksen nederst til højre (Flyt, Tag op, Drej)
  opdaterPanel();
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  const fig = figurFelt();
  const pladser = foranKoeleskab(m);
  if (pladser.some(function (p) { return p.x === fig.x && p.y === fig.y; })) { aabnKoeleskab(m); return; }
  for (const p of pladser) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0) { gaarTilKoeleskab = { m: m, x: p.x, y: p.y }; return; }
  }
  besked.textContent = "Du kan ikke komme hen til køleskabet. Der står noget i vejen.";
}, true);

// fremme ved køleskabet?
setInterval(function () {
  const g = gaarTilKoeleskab;
  if (!g || figur.rute.length > 0) return;
  gaarTilKoeleskab = null;
  const fig = figurFelt();
  if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0) aabnKoeleskab(g.m);
}, 100);

function aabnKoeleskab(m) {
  // kig på køleskabet
  const dx = m.x - figur.x, dy = m.y - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  figur.forfra = dx + dy >= 0;
  aabnDoer(m.x, m.y);
  sidstAabnet = { x: m.x, y: m.y, id: Date.now() + "-" + Math.floor(Math.random() * 1000), tid: Date.now() };
  setTimeout(function () {
    const valg = Object.keys(MAD);
    const ting = valg[Math.floor(Math.random() * valg.length)];
    minHaand = giHaand(ting);
    gemHaand();
    svaev(MAD[ting].tegn);
    besked.textContent = "Du fik " + MAD[ting].hvad + " " + MAD[ting].tegn + " fra køleskabet! Klik på en anden for at give den videre.";
  }, 650);
}


// -------------------------------------------------------------
//  Spis lidt ad gangen
// -------------------------------------------------------------
// Små ord ("Nam!") der svæver op fra munden
const MAD_ORD = [];
function madOrd(tekst, x, y) { MAD_ORD.push({ tekst: tekst, x: x, y: y, alder: 0 }); }

// tag en bid, hvis det er tid. Giver true, når maden er spist op.
function spis(h, hvem, regnSelv) {
  const nu = performance.now();
  if (regnSelv && nu - h.sidstBid > MAD_BID_TID) {
    h.sidstBid = nu;
    h.loeft = nu;
    h.bid++;
    if (hvem === figur) gemHaand();
  }
  return h.bid >= MAD_BIDDER;
}

// Hvor hånden er (i forhold til figurens højde), og hvor stor maden tegnes
const MAD_HAAND = { x: 0.13, y: 0.36, mund: 0.76, sidY: 0.22, sidMund: 0.5, b: 15, h: 20 };
const MAD_CELLE = [48, 64];   // størrelsen på hvert billede i mad.png

// En lille knyttet hånd om maden (billeder/mad/haand.png, tegnet med kode).
// Ét billede pr. hudfarve: pige, dreng, Pige (tøj) og en lys, der farves, hvis man selv har valgt hudfarve.
const HAAND_BILLEDE = "billeder/mad/haand.png";
const HAAND_CELLER = { pige: 0, dreng: 1, pigetoej: 2, lys: 3 };
const HAAND_FARVET = {};   // hudfarve -> lærred med hånden i den farve
function haandKilde(valg) {
  const b = hentBillede(HAAND_BILLEDE);
  if (!billedeKlar(b)) return null;
  const egen = valg && valg.farver && valg.farver[valg.type] && valg.farver[valg.type].hud;
  if (!egen) {
    const n = HAAND_CELLER[valg && valg.type];
    return { b: b, sx: (n === undefined ? 3 : n) * 24 };
  }
  // man har selv valgt hudfarve: farv den lyse hånd
  if (!HAAND_FARVET[egen]) {
    const c = document.createElement("canvas");
    c.width = 24; c.height = 24;
    const g = c.getContext("2d");
    g.drawImage(b, 72, 0, 24, 24, 0, 0, 24, 24);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = egen;
    g.fillRect(0, 0, 24, 24);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(b, 72, 0, 24, 24, 0, 0, 24, 24);
    HAAND_FARVET[egen] = c;
  }
  return { b: HAAND_FARVET[egen], sx: 0 };
}
// tommelen skal vende væk fra kroppen, så billedet spejles, når hånden er i venstre side
function tegnNaeve(x, y, side, valg) {
  const k = haandKilde(valg);
  if (!k) return;
  const s = 10;   // hvor stor hånden tegnes
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(x, y);
  if (side < 0) ctx.scale(-1, 1);
  ctx.drawImage(k.b, k.sx, 0, 24, 24, -s * 11.5 / 24, -s * 12 / 24, s, s);
  ctx.restore();
}

// Tegn tingen i hånden. p = fødderne, hoejde = figurens højde, side = 1 (højre) / -1 (venstre)
function tegnMad(h, p, hoejde, side, sidder, valg) {
  const b = hentBillede(MAD_BILLEDE);
  if (!billedeKlar(b)) return;
  const mad = MAD[h.ting];
  // et bid: hånden går op til munden og ned igen (0,9 sekund)
  const t = h.loeft ? (performance.now() - h.loeft) / 900 : 1;
  const op = t < 1 ? Math.sin(Math.min(1, t) * Math.PI) : 0;
  // hånden hænger ned ved siden af kroppen; maden holdes, så hånden er midt på den
  const haandY = p.y - hoejde * (sidder ? MAD_HAAND.sidY : MAD_HAAND.y);
  const mundY = p.y - hoejde * (sidder ? MAD_HAAND.sidMund : MAD_HAAND.mund);
  const x = p.x + side * hoejde * (MAD_HAAND.x - op * (MAD_HAAND.x - 0.05));
  const y = haandY + (mundY - haandY) * op;
  const stadie = Math.min(3, h.bid);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(b, stadie * MAD_CELLE[0], mad.raekke * MAD_CELLE[1], MAD_CELLE[0], MAD_CELLE[1], Math.round(x - MAD_HAAND.b / 2), Math.round(y - MAD_HAAND.h * mad.greb), MAD_HAAND.b, MAD_HAAND.h);
  ctx.restore();
  tegnNaeve(x, y, side, valg);
  // "Nam!" når biddet bliver taget
  if (h.loeft && t > 0.45 && h.ordSagt !== h.loeft) { h.ordSagt = h.loeft; madOrd(mad.lyd, x, mundY - 12); }
}

function tegnMadOrd() {
  for (let i = MAD_ORD.length - 1; i >= 0; i--) {
    const o = MAD_ORD[i];
    o.alder += 1 / 60;
    if (o.alder > 1.2) { MAD_ORD.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1.2 - o.alder) * 2);
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#5a3a1a";
    ctx.fillStyle = "#fff7e0";
    ctx.strokeText(o.tekst, o.x, o.y - o.alder * 22);
    ctx.fillText(o.tekst, o.x, o.y - o.alder * 22);
    ctx.restore();
  }
}

// hvilken side holder figuren maden i? (den side, den kigger mod)
function madSide(retning, vendt) {
  if (/hoejre/.test(retning)) return 1;
  if (/venstre/.test(retning)) return -1;
  return -1;   // lige forfra: højre hånd, som er til venstre på skærmen
}

// Hvor står figuren? (samme regning som tegnFigur / tegnHalGaest)
function madFod(hvem, valg, sidde) {
  const erMig = hvem === figur;
  const p = punkt(hvem.x + 0.5, hvem.y + 0.5);
  p.x += erMig ? figurPlads() : gaestPlads(hvem);
  if (sidde && MOEBEL_TYPER[sidde.type] && MOEBEL_TYPER[sidde.type].klipper) {
    const fod = fodJustering(sidde, valg, hvem.retning);
    p.x += fod.x; p.y += fod.y;
  }
  return p;
}

// dig selv
const tegnFigurFoerMad = tegnFigur;
tegnFigur = function (c) {
  tegnFigurFoerMad(c);
  if (!minHaand) return;
  if (spis(minHaand, figur, true)) {
    const mad = MAD[minHaand.ting];
    minHaand = null;
    gemHaand();
    svaev("✨");
    besked.textContent = "Mmm, du har " + (mad.goer === "drikker" ? "drukket" : "spist") + " din " + mad.navn + ". Klik på køleskabet for mere.";
    return;
  }
  const sidde = figur.sidde && figur.sidde.grad > 0.4 ? figur.sidde.moebel : null;
  const p = madFod(figur, garderobe, sidde);
  tegnMad(minHaand, p, figurHoejde(garderobe), madSide(figur.retning, figur.vendt), !!sidde, garderobe);
};

// de andre: computer-gæsterne og de rigtige spillere
const tegnHalGaestFoerMad = tegnHalGaest;
tegnHalGaest = function (g) {
  tegnHalGaestFoerMad(g);
  let h = null;
  if (typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[g.navn] === g) {
    // en rigtig spiller: serveren fortæller, hvad de har i hånden
    const s = g.sidderPaa && g.sidderPaa.haand;
    if (s && MAD[s.ting]) {
      if (!g.madHaand || g.madHaand.ting !== s.ting) g.madHaand = giHaand(s.ting, s.bid);
      if (s.bid > g.madHaand.bid) { g.madHaand.bid = s.bid; g.madHaand.loeft = performance.now(); }
      h = g.madHaand;
    } else g.madHaand = null;
  } else {
    h = GAEST_HAAND[g.navn] || null;
    if (h && spis(h, g, true)) { delete GAEST_HAAND[g.navn]; h = null; }
  }
  if (!h) return;
  const p = madFod(g, g.valg, g.sidder ? g.saede : null);
  tegnMad(h, p, figurHoejde(g.valg), madSide(g.retning, 1), !!g.sidder, g.valg);
};

const tegnBoblerFoerMad = tegnBobler;
tegnBobler = function () {
  tegnMadOrd();
  tegnBoblerFoerMad();
};


// -------------------------------------------------------------
//  Giv maden videre: "🎁 Giv" i menuen, når man klikker på en anden
// -------------------------------------------------------------
let minGave = null;   // { id, til, ting, bid, tid } sendes til serveren i 15 sekunder

function erRigtig(g) {
  return typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[g.navn] === g;
}

function givMad(g) {
  if (!minHaand) return;
  const mad = MAD[minHaand.ting];
  if (erRigtig(g)) {
    minGave = { id: FIGUR.navn + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000), til: g.navn, ting: minHaand.ting, bid: minHaand.bid, tid: Date.now() };
  } else {
    GAEST_HAAND[g.navn] = giHaand(minHaand.ting, minHaand.bid);
    if (typeof gaestSkriver === "function") gaestSkriver(g, "Tak for " + mad.hvad.replace(/^en /, "den ") + ", " + FIGUR.navn + "! " + mad.tegn);
  }
  minHaand = null;
  gemHaand();
  svaev("🎁");
  besked.textContent = "Du gav " + mad.hvad + " " + mad.tegn + " til " + g.navn + ".";
}

const aabnGaestMenuFoerMad = aabnGaestMenu;
aabnGaestMenu = function (g) {
  aabnGaestMenuFoerMad(g);
  if (!minHaand) return;
  const mad = MAD[minHaand.ting];
  knap("🎁 Giv din " + mad.navn + " " + mad.tegn, function () { lukMinMenu(); givMad(g); });
  // Giv-knappen øverst, så den er nem at finde
  const k = minMenuKnapper.lastElementChild;
  minMenuKnapper.insertBefore(k, minMenuKnapper.firstChild);
  placerMinMenu();
};

// Klik på dig selv: tag en bid nu, eller smid den væk
const visHovedmenuFoerMad = visHovedmenu;
visHovedmenu = function () {
  visHovedmenuFoerMad();
  if (!minHaand) return;
  const mad = MAD[minHaand.ting];
  knap((mad.goer === "drikker" ? "🥤 Tag en tår" : "😋 Tag en bid") + " af din " + mad.navn, function () {
    lukMinMenu();
    if (minHaand) minHaand.sidstBid = performance.now() - MAD_BID_TID - 1;
  });
  knap("🗑 Smid din " + mad.navn + " væk", function () {
    lukMinMenu();
    minHaand = null;
    gemHaand();
    besked.textContent = "Du smed din " + mad.navn + " væk.";
  });
};


// -------------------------------------------------------------
//  Serveren: send hvad jeg har i hånden, og tag imod gaver
//  (det ligger i p_sidder sammen med, hvor man sidder)
// -------------------------------------------------------------
function hentFaaedeGaver() {
  try { return JSON.parse(localStorage.getItem(GAVER_NOEGLE) || "[]"); } catch (e) { return []; }
}

if (typeof serverKald === "function") {
  const serverKaldFoerMad = serverKald;
  serverKald = async function (funktion, data) {
    if (funktion !== "hv_puls") return serverKaldFoerMad(funktion, data);
    const ekstra = {};
    if (minHaand) ekstra.haand = { ting: minHaand.ting, bid: minHaand.bid };
    if (minGave && Date.now() - minGave.tid < 15000) ekstra.giv = minGave;
    if (sidstAabnet && Date.now() - sidstAabnet.tid < 4000) ekstra.aabnet = { x: sidstAabnet.x, y: sidstAabnet.y, id: sidstAabnet.id };
    if (Object.keys(ekstra).length) data = Object.assign({}, data, { p_sidder: Object.assign({}, data.p_sidder || {}, ekstra) });
    const svar = await serverKaldFoerMad(funktion, data);
    try { madFraServer(svar); } catch (e) { console.warn(e); }
    return svar;
  };
}

function madFraServer(svar) {
  if (!svar || !Array.isArray(svar.spillere)) return;
  const faaet = hentFaaedeGaver();
  let nyt = false;
  svar.spillere.forEach(function (s) {
    const x = s.sidder || {};
    // en gave til mig?
    if (x.giv && x.giv.til === FIGUR.navn && MAD[x.giv.ting] && faaet.indexOf(x.giv.id) < 0) {
      faaet.push(x.giv.id);
      nyt = true;
      const mad = MAD[x.giv.ting];
      minHaand = giHaand(x.giv.ting, x.giv.bid);
      gemHaand();
      setTimeout(function () { svaev("🎁"); svaev(mad.tegn); }, 50);
      besked.textContent = s.navn + " gav dig " + mad.hvad + " " + mad.tegn + "!";
      visMadBesked(s.navn + " gav dig " + mad.hvad + " " + mad.tegn);
    }
    // har de lige åbnet et køleskab i mit rum?
    const g = typeof ANDRE_SPILLERE !== "undefined" ? ANDRE_SPILLERE[s.navn] : null;
    if (x.aabnet && g && g.aabnetId !== x.aabnet.id) {
      g.aabnetId = x.aabnet.id;
      if (s.rum === mitRumId()) aabnDoer(x.aabnet.x, x.aabnet.y);
    }
  });
  if (nyt) {
    try { localStorage.setItem(GAVER_NOEGLE, JSON.stringify(faaet.slice(-40))); } catch (e) {}
  }
}

// Lille boks midt på skærmen, når man får noget
function visMadBesked(tekst) {
  let boks = document.getElementById("mad-besked");
  if (!boks) {
    boks = document.createElement("div");
    boks.id = "mad-besked";
    boks.style.cssText = "position:fixed;left:50%;top:90px;transform:translateX(-50%);z-index:60;padding:10px 18px;" +
      "background:#fbf6ea;border:3px solid #4e7d4a;border-radius:12px;color:#1f3a1c;font:bold 14px Verdana,sans-serif;" +
      "box-shadow:0 4px 12px rgba(0,0,0,.3);pointer-events:none;transition:opacity .4s";
    document.body.appendChild(boks);
  }
  boks.textContent = "🎁 " + tekst;
  boks.style.opacity = "1";
  clearTimeout(visMadBesked.t);
  visMadBesked.t = setTimeout(function () { boks.style.opacity = "0"; }, 3500);
}
