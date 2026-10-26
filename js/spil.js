// =============================================================
//  SPILLETS MOTOR — her sker alt det, der får hotellet til at køre.
//  Vil du bare skifte grafik eller farver, så kig i indstillinger.js.
// =============================================================

const laerred = document.getElementById("spil");
const ctx = laerred.getContext("2d");

// Lærredet fylder hele vinduet. Rummet bliver zoomet, så det fylder skærmen,
// og lærredet får lige så mange pixels, som skærmen viser, så alt bliver skarpt.
//   BREDDE x HOEJDE: hvor mange "spil-punkter" der er plads til på skærmen
//   ZOOM:            hvor mange skærm-pixels et spil-punkt fylder
let BREDDE = laerred.width;
let HOEJDE = laerred.height;
let ZOOM = 1;
const MAKS_ZOOM = 5;
const RUM_ZOOM = 1.6;      // hvor meget større end skærmen rummet er (1 = det passer lige præcis)
let brugerZoom = 1;        // musehjulet zoomer ind og ud
const KAMERA = { x: 0, y: 0 };   // hvor meget man har trukket i skærmen (i skærm-pixels)
let figurDanser = false;         // sættes af "Handlinger" i js/min-menu.js
let danseTid = 0;

function skarptLaerred() {
  const r = laerred.getBoundingClientRect();
  const taethed = window.devicePixelRatio || 1;
  const b = Math.round(r.width * taethed);
  const h = Math.round(r.height * taethed);
  if (b > 0 && h > 0 && (laerred.width !== b || laerred.height !== h)) {
    laerred.width = b;
    laerred.height = h;
  }
  if (r.width > 0 && r.height > 0) {
    // (ligesom i Habbo ligger panelet ovenpå rummet, så rummet bruger hele skærmen)
    const panelB = 0;
    const rumB = (RUM.bredde + RUM.dybde) * FLISE_B / 2 + 60;
    const rumH = (RUM.bredde + RUM.dybde) * FLISE_H / 2 + (RUM.vaegHoejde || VAEG_HOEJDE) + 110;
    // zoomen regnes ud fra de gamle små felter (64x32), så figurerne har samme størrelse
    // på skærmen som før; de større felter gør bare rummet større (træk med musen)
    const passB = (RUM.bredde + RUM.dybde) * 64 / 2 + 60;
    const passH = (RUM.bredde + RUM.dybde) * 32 / 2 + (RUM.vaegHoejde || VAEG_HOEJDE) + 110;
    const passer = Math.min((r.width - panelB) / passB, (r.height - 20) / passH);
    ZOOM = Math.min(MAKS_ZOOM, passer * RUM_ZOOM * brugerZoom);
    BREDDE = r.width / ZOOM;
    HOEJDE = r.height / ZOOM;
    // man må ikke kunne trække rummet helt væk fra skærmen
    const maksX = Math.max(0, rumB * ZOOM - r.width) / 2 + 150;
    const maksY = Math.max(0, rumH * ZOOM - r.height) / 2 + 150;
    KAMERA.x = Math.max(-maksX, Math.min(maksX, KAMERA.x));
    KAMERA.y = Math.max(-maksY, Math.min(maksY, KAMERA.y));
    START.x = (BREDDE - panelB / ZOOM) / 2 + (RUM.dybde - RUM.bredde) * FLISE_B / 4 + KAMERA.x / ZOOM;
    START.y = (HOEJDE - rumH) / 2 + (RUM.vaegHoejde || VAEG_HOEJDE) + 90 + KAMERA.y / ZOOM;
  }
  ctx.setTransform(laerred.width / BREDDE, 0, 0, laerred.height / HOEJDE, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

// Et felt på gulvet er en "rude" (diamant), 96 pixels bred og 48 høj.
const FLISE_B = 96;
const FLISE_H = 48;
const FELT_FART = 64 / FLISE_B;   // farten er i felter pr. sekund; større felter = lidt færre felter pr. sekund
const VAEG_HOEJDE = 110;
const START = { x: BREDDE / 2, y: 170 };   // hvor det bagerste hjørne af gulvet står (regnes ud i skarptLaerred)

// Slå møbeltyper op på deres id, fx MOEBEL_TYPER["stol"]
const MOEBEL_TYPER = {};
MOEBLER.forEach(function (m) { MOEBEL_TYPER[m.id] = m; });


// ----- Spillets tilstand -----
let moeblerIRummet = [];   // hvert møbel: { type: "stol", x: 3, y: 4, spejlet: false }
let valgtType = null;      // møbeltypen man er ved at stille (fra panelet)
let valgtMoebel = null;    // møblet man har klikket på i rummet
let musFelt = null;        // feltet musen står over lige nu
let rumValg = "vaerelse";  // "hal" = velkomsthallen (js/velkomsthal.js), "vaerelse" = dit eget værelse

const figur = {
  x: 2, y: 2,              // hvor figuren står (kan være et kommatal, mens den går)
  rute: [],                // de felter figuren skal gå igennem
  vendt: 1,                // 1 = kigger mod højre, -1 = mod venstre
  forfra: true,            // true = kigger mod os, false = vender ryggen til
  retning: "ned",          // hvilken vej figuren kigger på skærmen (se js/figur.js)
  sidde: null,             // når figuren sidder: { moebel, grad (0 = står, 1 = sidder helt ned) }
  skalSidde: null,         // det møbel, figuren er på vej hen for at sidde på
  trin: 0,                 // bruges til at få benene til at bevæge sig
};


// =============================================================
//  Billeder
// =============================================================
const billeder = {};

function hentBillede(sti) {
  if (!sti) return null;
  if (billeder[sti]) return billeder[sti];
  const b = new Image();
  b.onload = tegnIkoner;
  b.onerror = function () {
    console.warn("Kunne ikke finde billedet: " + sti + " (tjek navnet, og at filen ligger i mappen)");
  };
  b.src = sti;
  billeder[sti] = b;
  return b;
}

function billedeKlar(b) {
  return b && b.complete && b.naturalWidth > 0;
}


// =============================================================
//  Omregning mellem felter og skærm
// =============================================================

// Fra et sted i rummet (felt-koordinater) til en pixel på skærmen
function punkt(fx, fy) {
  return {
    x: START.x + (fx - fy) * FLISE_B / 2,
    y: START.y + (fx + fy) * FLISE_H / 2,
  };
}

// Midten af feltet (x, y) på skærmen
function feltMidte(x, y) {
  return punkt(x + 0.5, y + 0.5);
}

// Fra en pixel på skærmen til det felt, der ligger der
function skaermTilFelt(sx, sy) {
  const dx = (sx - START.x) / (FLISE_B / 2);
  const dy = (sy - START.y) / (FLISE_H / 2);
  return {
    x: Math.floor((dx + dy) / 2),
    y: Math.floor((dy - dx) / 2),
  };
}

function erIRummet(x, y) {
  if (!(x >= 0 && y >= 0 && x < RUM.bredde && y < RUM.dybde)) return false;
  // rum med en særlig form (L, T, U …) har felter uden gulv (js/velkomsthal.js)
  return !RUM.form || RUM.form(x, y);
}

// Hvor mange felter fylder møblet? [bredde, dybde]. Sofaer og senge kan fylde 2 felter.
// "felter" i kataloget gælder, når møblet ikke er drejet. Drejet bytter de to tal plads.
function moebelFelter(type, spejlet) {
  const f = (type && type.felter) || [1, 1];
  return spejlet ? [f[1], f[0]] : [f[0], f[1]];
}

// Ligger møblet på tværs? Møbler med 4 billeder ("klipper") har m.retning 0-3,
// og retning 1 og 3 ligger på tværs. De gamle møbler bruger m.spejlet.
function drejetTvaers(m) {
  const t = MOEBEL_TYPER[m.type] || {};
  return t.klipper ? (m.retning || 0) % 2 === 1 : !!m.spejlet;
}

// Står møblet m på feltet (x, y)? (m.x, m.y er møblets bagerste felt)
function daekker(m, x, y) {
  const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
  return x >= m.x && x < m.x + f[0] && y >= m.y && y < m.y + f[1];
}

function moebelPaa(x, y) {
  return moeblerIRummet.find(function (m) { return daekker(m, x, y); });
}

// Er der plads til møblet med sit bagerste felt på (x, y)?
// "uden" er et møbel, der ikke tæller med (det, man er ved at flytte eller dreje)
function pladsTil(type, x, y, spejlet, uden) {
  const f = moebelFelter(type, spejlet);
  const fig = figurFelt();
  for (let dx = 0; dx < f[0]; dx++) {
    for (let dy = 0; dy < f[1]; dy++) {
      if (!erIRummet(x + dx, y + dy)) return false;
      const andet = moebelPaa(x + dx, y + dy);
      if (andet && andet !== uden) return false;
      const sidderHer = figur.sidde && uden && figur.sidde.moebel === uden;
      if (!type.kanGaaPaa && !sidderHer && fig.x === x + dx && fig.y === y + dy) return false;
    }
  }
  return true;
}

// Hvor på skærmen møblet tegnes: midt mellem dets felter, med bunden på det forreste hjørne
function moebelSted(type, x, y, spejlet) {
  const f = moebelFelter(type, spejlet);
  // de nye møbler (klipper) er tegnet, så billedets bund-midte er møblets forreste hjørne
  if (type && type.klipper) return punkt(x + f[0], y + f[1]);
  return { x: punkt(x + f[0] / 2, y + f[1] / 2).x, y: punkt(x + f[0], y + f[1]).y - FLISE_H / 2 };
}

// Store møbler tegnes, som om de stod på deres forreste felt
function moebelDybde(m) {
  const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
  return m.x + f[0] - 1 + m.y + f[1] - 1;
}

// Kan figuren gå på feltet?
function kanGaa(x, y) {
  if (!erIRummet(x, y)) return false;
  if (rumValg === "hal" && halBlokeret(x, y)) return false;
  const m = moebelPaa(x, y);
  return !m || MOEBEL_TYPER[m.type].kanGaaPaa === true;
}

function figurFelt() {
  return { x: Math.round(figur.x), y: Math.round(figur.y) };
}


// =============================================================
//  Find vej (så figuren går uden om møblerne)
// =============================================================
// maalErSaede: true = man må gå ind på det sidste felt, selvom der står en stol
function findRute(fraX, fraY, tilX, tilY, maalErSaede) {
  const maaGaa = function (x, y) {
    return kanGaa(x, y) || (maalErSaede && x === tilX && y === tilY);
  };
  if (!maaGaa(tilX, tilY)) return [];
  const noegle = function (x, y) { return x + "," + y; };
  const forrige = new Map();
  forrige.set(noegle(fraX, fraY), null);
  const koe = [[fraX, fraY]];
  const retninger = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  while (koe.length > 0) {
    const [x, y] = koe.shift();
    if (x === tilX && y === tilY) {
      const rute = [];
      let n = noegle(x, y);
      while (n) {
        const dele = n.split(",").map(Number);
        rute.unshift({ x: dele[0], y: dele[1] });
        n = forrige.get(n);
      }
      return rute;
    }
    for (const [dx, dy] of retninger) {
      const nx = x + dx;
      const ny = y + dy;
      if (!maaGaa(nx, ny) || forrige.has(noegle(nx, ny))) continue;
      // Gå ikke skråt hen over et hjørne af et møbel
      if (dx !== 0 && dy !== 0 && (!kanGaa(x + dx, y) || !kanGaa(x, y + dy))) continue;
      forrige.set(noegle(nx, ny), noegle(x, y));
      koe.push([nx, ny]);
    }
  }
  return [];
}

// saede: møblet, figuren skal sætte sig på, når den kommer frem (eller null)
function gaaTil(x, y, saede) {
  const fra = figurFelt();
  figur.rute = findRute(fra.x, fra.y, x, y, !!saede);
  figur.skalSidde = figur.rute.length > 0 ? saede || null : null;
}

// Sæt sig ned på et møbel (figuren står allerede på feltet)
function saetDig(m) {
  const t = MOEBEL_TYPER[m.type] || {};
  if (t.klipper && (m.retning || 0) >= 2) {
    // figurerne har endnu ingen billeder af at sidde bagfra
    besked.textContent = "Drej stolen, så den vender ud mod dig, for at sætte dig.";
    return;
  }
  let plads = ledigPlads(m, figur);
  const celle = cellePlads(m, figurFelt());
  if (celle >= 0) plads = tagnePladser(m, figur).indexOf(celle) < 0 ? celle : -1;
  if (plads < 0) {
    besked.textContent = "Der er ikke plads. Prøv et andet sted at sidde.";
    return;
  }
  figur.sidde = { moebel: m, grad: 0, plads: plads };
  // kig væk fra ryglænet
  figur.forfra = true;
  vendFraRyglaenet(m);
}

// Vender møblet mod højre på skærmen? (spejling og "vender" fra kataloget)
function venderHoejre(m) {
  const type = MOEBEL_TYPER[m.type] || {};
  // 4 retninger: 0 = ned mod venstre, 1 = ned mod højre, 2 = op mod højre, 3 = op mod venstre
  if (type.klipper) return m.retning === 1 || m.retning === 2;
  return m.spejlet !== (type.vender === "hoejre");
}

// Hvor kan man sidde på møblet? Store sofaer har to pladser ved siden af hinanden.
// Tallet er, hvor mange pixels pladsen er rykket til siden fra midten af møblet.
function saedePladser(m) {
  const t = MOEBEL_TYPER[m.type] || {};
  if (!t.saede) return [];
  // møbler på flere felter: man sidder på det felt, man står på (én plads pr. felt),
  // og rykker lidt ud mod hver sin ende, så to ikke sidder oven i hinanden
  if (t.felter) {
    const n = t.felter[0] * t.felter[1];
    const vej = drejetTvaers(m) ? -1 : 1;
    // (rykket lidt ind mod midten, så man sidder på puden og ikke på armlænet)
    const ind = 0.02 * FLISE_B;
    return Array.from({ length: n }, function (_, i) { return -(i - (n - 1) / 2) * ind * vej; });
  }
  const bred = t.klip ? t.klip[2] * (t.skala || 1) >= 95 : t.tegning === "sofa";
  if (!bred) return [0];
  return [-22, 22];
}

// Pladserne, som andre end "hvem" sidder på (eller er på vej hen til)
function tagnePladser(m, hvem) {
  const tagne = [];
  if (hvem !== figur && figur.sidde && figur.sidde.moebel === m) tagne.push(figur.sidde.plads);
  if (rumValg === "hal" && typeof HAL_GAESTER !== "undefined") {
    HAL_GAESTER.forEach(function (g) { if (g !== hvem && g.saede === m) tagne.push(g.plads); });
  }
  // rigtige spillere i rummet (js/rigtige-spillere.js)
  if (typeof ANDRE_SPILLERE !== "undefined") {
    Object.values(ANDRE_SPILLERE).forEach(function (g) { if (g !== hvem && g.sidder && g.saede === m) tagne.push(g.plads); });
  }
  return tagne;
}

// Hvilken plads er feltet f på et møbel med flere felter? (-1 = møblet har kun ét felt)
function cellePlads(m, f) {
  const t = MOEBEL_TYPER[m.type] || {};
  if (!t.felter || !daekker(m, f.x, f.y)) return -1;
  const ff = moebelFelter(t, drejetTvaers(m));
  return (f.y - m.y) * ff[0] + (f.x - m.x);
}

// Feltet, hvor plads nr. "plads" er på et møbel med flere felter (det modsatte af cellePlads)
function pladsFelt(m, plads) {
  const t = MOEBEL_TYPER[m.type] || {};
  if (!t.felter) return { x: m.x, y: m.y };
  const ff = moebelFelter(t, drejetTvaers(m));
  return { x: m.x + (plads % ff[0]), y: m.y + Math.floor(plads / ff[0]) };
}

// Første ledige plads på møblet, eller -1 hvis der er fyldt
function ledigPlads(m, hvem) {
  const tagne = tagnePladser(m, hvem);
  const antal = saedePladser(m).length;
  for (let i = 0; i < antal; i++) if (tagne.indexOf(i) < 0) return i;
  return -1;
}

// Hvor meget figuren er rykket hen på sin plads (0, 0 når den står)
function figurPlads() {
  if (!figur.sidde) return 0;
  const g = Math.max(0, Math.min(1, figur.sidde.grad));
  return (saedePladser(figur.sidde.moebel)[figur.sidde.plads] || 0) * g;
}

function vendFraRyglaenet(m) {
  const h = venderHoejre(m);
  figur.vendt = h ? 1 : -1;
  figur.retning = h ? "ned-hoejre" : "ned-venstre";
}


// =============================================================
//  Tegne-hjælpere
// =============================================================

// Gør en farve lysere (tal over 1) eller mørkere (tal under 1)
function nuance(hex, faktor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * faktor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * faktor));
  const b = Math.min(255, Math.round((n & 255) * faktor));
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Navneskiltet over figurerne: lille creme skilt med grøn kant og en spids ned mod hovedet
function tegnNavneskilt(c, x, top, navn, mig) {
  c.save();
  c.font = "bold 11px Verdana, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const b = Math.round(c.measureText(navn).width + 16), h = 17;
  const v = Math.round(x - b / 2), t = Math.round(top);
  function form() {
    c.beginPath();
    if (c.roundRect) c.roundRect(v, t, b, h, 8); else c.rect(v, t, b, h);
    c.moveTo(x - 4, t + h); c.lineTo(x, t + h + 4); c.lineTo(x + 4, t + h);
  }
  c.fillStyle = "rgba(0,0,0,0.22)";
  c.translate(0, 2); form(); c.fill(); c.translate(0, -2);
  form();
  c.fillStyle = mig ? "#e7f3e2" : "#fbf6ea";
  c.fill();
  c.lineWidth = 1.5;
  c.strokeStyle = "#4e7d4a";
  c.stroke();
  c.fillStyle = "#2f4a2b";
  c.fillText(navn, x, t + h / 2 + 0.5);
  c.restore();
  return b;
}

function polygon(c, punkter, farve, kant) {
  c.beginPath();
  c.moveTo(punkter[0].x, punkter[0].y);
  for (let i = 1; i < punkter.length; i++) c.lineTo(punkter[i].x, punkter[i].y);
  c.closePath();
  c.fillStyle = farve;
  c.fill();
  if (kant) {
    c.strokeStyle = kant;
    c.stroke();
  }
}

// Tegner en 3D-kasse på et felt. Alle reserve-møbler er bygget af kasser.
//   cx, cy: feltets midte på skærmen
//   bx, by: hvor på feltet kassen står (0 = midten, -0.5 til 0.5)
//   sx, sy: hvor stor kassen er (1 = hele feltet)
//   z: hvor højt over gulvet den starter,  h: hvor høj den er
function kasse(c, cx, cy, k, farve, spejlet) {
  let bx = k.bx || 0, by = k.by || 0, sx = k.sx, sy = k.sy;
  if (spejlet) {
    [bx, by] = [by, bx];
    [sx, sy] = [sy, sx];
  }
  const z = k.z || 0;
  const h = k.h;
  const p = function (u, v, hoejde) {
    return { x: cx + (u - v) * FLISE_B / 2, y: cy + (u + v) * FLISE_H / 2 - hoejde };
  };
  const u0 = bx - sx / 2, u1 = bx + sx / 2, v0 = by - sy / 2, v1 = by + sy / 2;

  // venstre side, højre side og toppen
  polygon(c, [p(u0, v1, z), p(u1, v1, z), p(u1, v1, z + h), p(u0, v1, z + h)], nuance(farve, 0.8));
  polygon(c, [p(u1, v1, z), p(u1, v0, z), p(u1, v0, z + h), p(u1, v1, z + h)], nuance(farve, 0.62));
  polygon(c, [p(u0, v0, z + h), p(u1, v0, z + h), p(u1, v1, z + h), p(u0, v1, z + h)], nuance(farve, 1.12));
}


// =============================================================
//  Reserve-tegninger af møblerne
//  (bruges kun, når møblet ikke har sit eget billede)
// =============================================================
const TEGNINGER = {
  stol: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { by: -0.2, sx: 0.5, sy: 0.08, z: 18, h: 24 }, f, s);   // ryglæn
    for (const [u, v] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      kasse(c, cx, cy, { bx: u, by: v, sx: 0.06, sy: 0.06, h: 14 }, "#5b3a1e", s);   // ben
    }
    kasse(c, cx, cy, { sx: 0.5, sy: 0.5, z: 14, h: 5 }, f, s);   // sæde
  },

  bord: function (c, cx, cy, f, s) {
    for (const [u, v] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) {
      kasse(c, cx, cy, { bx: u, by: v, sx: 0.07, sy: 0.07, h: 22 }, f, s);   // ben
    }
    kasse(c, cx, cy, { sx: 0.8, sy: 0.8, z: 22, h: 5 }, f, s);   // bordplade
  },

  sofa: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { by: -0.3, sx: 0.9, sy: 0.18, h: 34 }, f, s);              // ryglæn
    kasse(c, cx, cy, { by: 0.08, sx: 0.9, sy: 0.6, h: 14 }, f, s);              // sæde
    kasse(c, cx, cy, { bx: -0.4, by: 0.05, sx: 0.12, sy: 0.65, h: 22 }, f, s);  // armlæn
    kasse(c, cx, cy, { bx: 0.4, by: 0.05, sx: 0.12, sy: 0.65, h: 22 }, f, s);   // armlæn
  },

  lampe: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.3, sy: 0.3, h: 4 }, "#555555", s);           // fod
    kasse(c, cx, cy, { sx: 0.05, sy: 0.05, z: 4, h: 48 }, "#777777", s);  // stang
    kasse(c, cx, cy, { sx: 0.4, sy: 0.4, z: 50, h: 18 }, f, s);           // skærm
  },

  plante: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.36, sy: 0.36, h: 16 }, "#b5651d", s);   // potte
    const blade = [[0, -40, 13], [-9, -30, 10], [9, -30, 10], [-5, -50, 9], [6, -49, 9]];
    for (const [dx, dy, r] of blade) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
      c.fillStyle = dx < 0 ? nuance(f, 0.8) : f;
      c.fill();
    }
  },

  taeppe: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.92, sy: 0.92, h: 1 }, f, s);
    kasse(c, cx, cy, { sx: 0.6, sy: 0.6, z: 1, h: 0.5 }, "#fdcb6e", s);
  },
};

// Tegner et møbel med midten af feltet i (cx, cy)
function tegnMoebel(c, type, cx, cy, spejlet, retning) {
  const b = hentBillede(type.billede);
  if (billedeKlar(b)) {
    // Dit eget billede: bunden af billedet står på feltets nederste spids
    // skala: hvor stort møblet tegnes (så det passer til figurerne)
    // klipDrejet: et rigtigt billede af møblet fra den anden side, så det ikke bare spejles
    const s = type.skala || 1;
    // klipper: ét billede for hver af de 4 retninger (så spejles der aldrig)
    let k = spejlet && type.klipDrejet ? type.klipDrejet : type.klip;
    if (type.klipper) k = type.klipper[retning || 0] || type.klip;
    c.save();
    c.translate(cx, cy + FLISE_H / 2);
    if (spejlet && !type.klipDrejet && !type.klipper) c.scale(-1, 1);
    if (k) {
      // møbler fra kataloget: klip det lille stykke ud af det store billede
      c.drawImage(b, k[0], k[1], k[2], k[3], -k[2] * s / 2, -k[3] * s, k[2] * s, k[3] * s);
    } else {
      c.drawImage(b, -b.naturalWidth * s / 2, -b.naturalHeight * s, b.naturalWidth * s, b.naturalHeight * s);
    }
    c.restore();
    return;
  }
  const tegning = TEGNINGER[type.tegning] || TEGNINGER.stol;
  tegning(c, cx, cy, type.farve || "#999999", spejlet);
}


// =============================================================
//  Figuren
// =============================================================
// hvor mange pixels figuren rykker tilbage mod ryglænet, når den sidder
const SIDDE_BAGUD = 6;
// hvor langt under figurens felt-midte fødderne skal nå for at stå på gulvet foran sofaen
const FODKANT = 16;

// Når figuren sidder i et af de nye møbler, rykkes den lidt frem og ned,
// så fødderne når gulvet. Figurer med korte ben (pigen) rykkes mere end drengen.
function fodJustering(m, valg, retning) {
  const t = MOEBEL_TYPER[m.type] || {};
  const f = FIGURER[valg.type] || FIGURER.kvinde;
  const del = f.sidder && (f.sidder[retning] || f.sidder.ned);
  const d = del && figurDel(valg, del);
  if (!d || !t.saede) return { x: 0, y: 0 };
  const fald = (d.h - d.ay) * f.skala;   // fra numsen ned til fødderne
  const mangler = Math.max(0, FODKANT - (fald - t.saede));
  // numsen sidder midt på puden (lidt foran feltets midte), og figuren synker
  // lidt ned i puden, så fødderne når gulvet
  const frem = 0.14;
  return { x: (venderHoejre(m) ? 1 : -1) * frem * FLISE_B / 2, y: frem * FLISE_H / 2 + mangler };
}

function tegnFigur(c) {
  const p = punkt(figur.x + 0.5, figur.y + 0.5);   // fødderne
  p.x += figurPlads();
  const gaar = figur.rute.length > 0;
  const sving = gaar ? Math.sin(figur.trin) * 4 : 0;

  // skygge
  c.beginPath();
  c.ellipse(p.x, p.y, 16, 7, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fill();

  // når figuren danser, hopper den lidt op og ned
  if (figurDanser) p.y -= Math.abs(Math.sin(danseTid * 8)) * 7;

  const b = hentBillede(FIGUR.billede);
  let hoejde = figurHoejde(garderobe);
  if (billedeKlar(b)) {
    // Dit eget billede af figuren
    c.save();
    c.translate(p.x, p.y);
    if (figur.vendt < 0) c.scale(-1, 1);
    c.drawImage(b, -b.naturalWidth / 2, -b.naturalHeight - Math.abs(sving) / 2);
    c.restore();
    hoejde = b.naturalHeight;
  } else {
    // Figuren fra figur.js
    let sidde = null;
    if (figur.sidde && figur.sidde.grad > 0.4) {
      sidde = { hoejde: MOEBEL_TYPER[figur.sidde.moebel.type].saede };
    }
    // på et sæde rykker figuren lidt tilbage mod ryglænet
    // de nye møbler (med 4 billeder) har sædet tegnet, så fødderne når gulvet uden at rykke figuren
    const nyt = sidde && (MOEBEL_TYPER[figur.sidde.moebel.type] || {}).klipper;
    const bagud = sidde && !nyt ? (venderHoejre(figur.sidde.moebel) ? -1 : 1) * SIDDE_BAGUD : 0;
    const fod = sidde && nyt ? fodJustering(figur.sidde.moebel, garderobe, figur.retning) : { x: 0, y: 0 };
    tegnMenneske(c, p.x + bagud + fod.x, p.y - Math.abs(bagud) / 2 + fod.y, garderobe, figur.retning, gaar && !figur.sidde ? figur.trin : null, sidde);
  }

  // navneskilt
  const tekstB = tegnNavneskilt(c, p.x, p.y - hoejde - 26, FIGUR.navn, true);

  // EJER-skiltet over navnet (kun for ejerne i js/ejer.js)
  const ejerSkilt = hentBillede("billeder/skilt-ejer.png");
  if (typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0 && billedeKlar(ejerSkilt)) {
    const sw = ejerSkilt.naturalWidth * 0.85, sh = ejerSkilt.naturalHeight * 0.85;
    c.drawImage(ejerSkilt, Math.round(p.x - sw / 2), Math.round(p.y - hoejde - 30 - sh), sw, sh);
  } else if (typeof rolleSkilt === "function" && rolleSkilt(FIGUR.navn)) {
    tegnRolleSkilt(rolleSkilt(FIGUR.navn), p.x, p.y - hoejde - 28);   // skilt fra Ansættelse (js/ansaettelse.js)
  }

  // profilbilledet (frisuren fra garderoben) til venstre for navnet
  const profil = typeof profilBillede === "function" ? profilBillede() : null;
  if (billedeKlar(profil)) {
    const px = p.x - tekstB / 2 - 16;
    const py = p.y - hoejde - 17;
    c.save();
    c.beginPath();
    c.arc(px, py, 14, 0, Math.PI * 2);
    c.fillStyle = "#f6ead8";
    c.fill();
    c.clip();
    const s = 30 / Math.max(profil.naturalWidth, profil.naturalHeight);
    c.drawImage(profil, px - profil.naturalWidth * s / 2, py - 13, profil.naturalWidth * s, profil.naturalHeight * s);
    c.restore();
    c.beginPath();
    c.arc(px, py, 14, 0, Math.PI * 2);
    c.strokeStyle = "#f2b134";
    c.lineWidth = 2;
    c.stroke();
    c.lineWidth = 1;
  }
}

function flytFigur(dt) {
  // ----- Sidder figuren? -----
  if (figur.sidde) {
    const vaek = moeblerIRummet.indexOf(figur.sidde.moebel) < 0;
    if (figur.rute.length > 0 || vaek) {
      // rejs dig op, før du går
      figur.sidde.grad -= dt / 0.5;
      if (figur.sidde.grad <= 0) figur.sidde = null;
    } else {
      // sæt dig langsomt ned
      figur.sidde.grad = Math.min(1, figur.sidde.grad + dt / 0.9);
      vendFraRyglaenet(figur.sidde.moebel);
    }
    return;
  }

  if (figur.rute.length === 0) {
    // fremme ved stolen? Så sæt dig
    if (figur.skalSidde) {
      const m = figur.skalSidde;
      figur.skalSidde = null;
      const fig = figurFelt();
      if (moeblerIRummet.indexOf(m) >= 0 && daekker(m, fig.x, fig.y)) saetDig(m);
    }
    return;
  }
  const maal = figur.rute[0];
  const dx = maal.x - figur.x;
  const dy = maal.y - figur.y;
  const afstand = Math.hypot(dx, dy);
  const skridt = FIGUR.fart * FELT_FART * dt;

  // Hvilken vej kigger figuren på skærmen?
  // (dx - dy) er højre/venstre, og (dx + dy) er ned mod os/op væk fra os
  if (dx - dy > 0.01) figur.vendt = 1;
  if (dx - dy < -0.01) figur.vendt = -1;
  if (dx + dy > 0.01) figur.forfra = true;
  if (dx + dy < -0.01) figur.forfra = false;
  const lodret = dx + dy > 0.01 ? "ned" : dx + dy < -0.01 ? "op" : "";
  const vandret = dx - dy > 0.01 ? "hoejre" : dx - dy < -0.01 ? "venstre" : "";
  figur.retning = lodret && vandret ? lodret + "-" + vandret : lodret || vandret || figur.retning;

  if (afstand <= skridt) {
    figur.x = maal.x;
    figur.y = maal.y;
    figur.rute.shift();
  } else {
    figur.x += (dx / afstand) * skridt;
    figur.y += (dy / afstand) * skridt;
  }
  figur.trin += dt * 8;   // hvor hurtigt benene skifter
}


// =============================================================
//  Tegn hele rummet
// =============================================================
function diamant(x, y) {
  return [punkt(x, y), punkt(x + 1, y), punkt(x + 1, y + 1), punkt(x, y + 1)];
}

function tegnVaegge() {
  // væggene tegnes felt for felt med pixel-tapet, så de passer til figurerne
  const vh = RUM.vaegHoejde || VAEG_HOEJDE;   // væggens højde kan ændres med :floor (js/gulvplan.js)
  for (let y = 0; y < RUM.dybde; y++) {
    for (let x = 0; x < RUM.bredde; x++) {
      if (erIRummet(x, y)) { pixelVaeg(punkt(x, y + 1), punkt(x, y), vh, true); break; }
    }
  }
  for (let x = 0; x < RUM.bredde; x++) {
    for (let y = 0; y < RUM.dybde; y++) {
      if (erIRummet(x, y)) { pixelVaeg(punkt(x, y), punkt(x + 1, y), vh, false); break; }
    }
  }
  tegnDoer();
}

// Døren i væggen (sættes med :floor). Den står på venstre væg eller bagvæggen ved dørens felt.
function tegnDoer() {
  const d = RUM.doer;
  if (!d || !erIRummet(d.x, d.y)) return;
  let venstreVaeg = true;
  for (let x = 0; x < d.x; x++) if (erIRummet(x, d.y)) venstreVaeg = false;
  const a = venstreVaeg ? punkt(d.x, d.y + 1) : punkt(d.x, d.y);
  const b = venstreVaeg ? punkt(d.x, d.y) : punkt(d.x + 1, d.y);
  const mellem = function (t, h) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - h }; };
  const dh = Math.min(78, (RUM.vaegHoejde || VAEG_HOEJDE) - 12);
  polygon(ctx, [mellem(0.12, 0), mellem(0.88, 0), mellem(0.88, dh + 6), mellem(0.12, dh + 6)], "#5a3a22");
  polygon(ctx, [mellem(0.2, 0), mellem(0.8, 0), mellem(0.8, dh), mellem(0.2, dh)], "#2a1a10");
  const h = mellem(0.68, dh * 0.45);
  ctx.beginPath();
  ctx.arc(h.x, h.y, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#f2b134";
  ctx.fill();
}

// =============================================================
//  Pixel-gulv og pixel-tapet
//  Gulv og vægge tegnes som små pixel-billeder (1 pixel = 1 spil-punkt,
//  ligesom figurerne), så rummet passer til pixel-figurerne.
//  Billederne laves én gang for hver farve og huskes.
// =============================================================
const PIXEL_MOENSTRE = {};

// et fast "tilfældigt" tal mellem 0 og 1 for hver pixel (samme hver gang)
function pixelStoej(x, y, s) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
  return n - Math.floor(n);
}
function hexRGB(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbTone(rgb, f) {
  return [Math.min(255, rgb[0] * f), Math.min(255, rgb[1] * f), Math.min(255, rgb[2] * f)];
}
// er farven brun/træ-agtig? så bliver gulvet til planker
function erTrae(hex) {
  const c = hexRGB(hex), mx = Math.max.apply(null, c), mn = Math.min.apply(null, c);
  const maetning = mx ? (mx - mn) / mx : 0;
  return c[0] >= c[1] && c[1] >= c[2] && maetning > 0.2 && maetning < 0.6 && c[0] - c[1] < 70;
}

// Et gulvfelt: 64 x 32 pixels, rudeformet
function gulvMoenster(farve1, farve2, variant) {
  const noegle = "g" + farve1 + farve2 + variant;
  if (PIXEL_MOENSTRE[noegle]) return PIXEL_MOENSTRE[noegle];
  const c = document.createElement("canvas");
  c.width = FLISE_B; c.height = FLISE_H;
  const g = c.getContext("2d");
  const data = g.createImageData(c.width, c.height);
  const trae = erTrae(farve1);
  const base = hexRGB(variant % 2 && !trae ? farve2 : farve1);
  const anden = hexRGB(farve2);
  for (let py = 0; py < c.height; py++) {
    for (let px = 0; px < c.width; px++) {
      const sx = (px + 0.5 - FLISE_B / 2) / (FLISE_B / 2), sy = (py + 0.5) / (FLISE_H / 2);
      const fx = (sx + sy) / 2, fy = (sy - sx) / 2;      // hvor på feltet (0–1)
      if (fx < -0.01 || fy < -0.01 || fx > 1.01 || fy > 1.01) continue;
      let rgb, f = 1;
      if (trae) {
        // fire planker pr. felt med fuger og årer
        const nr = Math.min(3, Math.floor(fy * 4));
        const iPlanke = fy * 4 - nr;
        rgb = (nr + variant) % 2 ? anden : base;
        f = 0.95 + pixelStoej(nr, variant, 3) * 0.1;
        f += (pixelStoej(Math.floor(fx * 18), nr + variant * 4, 1) - 0.5) * 0.08;   // årer
        if (iPlanke < 0.1) f *= 0.8;                                             // fuge
        else if (iPlanke < 0.24) f *= 1.06;                                        // lys kant
        const samling = (0.35 + nr * 0.27 + variant * 0.19) % 1;
        if (Math.abs(fx - samling) < 0.025) f *= 0.82;                             // plankens ende
      } else {
        // fliser med en lille 3D-kant
        rgb = base;
        f = 0.97 + (pixelStoej(px, py, variant) - 0.5) * 0.06;
        if (fx < 0.06 || fy < 0.06) f *= 1.08;
        else if (fx > 0.94 || fy > 0.94) f *= 0.84;
      }
      f += (pixelStoej(px, py, 9) - 0.5) * 0.04;
      const t = rgbTone(rgb, f), i = (py * c.width + px) * 4;
      data.data[i] = t[0]; data.data[i + 1] = t[1]; data.data[i + 2] = t[2]; data.data[i + 3] = 255;
    }
  }
  g.putImageData(data, 0, 0);
  PIXEL_MOENSTRE[noegle] = c;
  return c;
}

// Et stykke væg (ét felt bredt): tapet med striber, fodpanel og en kant foroven
function vaegMoenster(farve, hoejde, moerk) {
  const noegle = "v" + farve + hoejde + moerk;
  if (PIXEL_MOENSTRE[noegle]) return PIXEL_MOENSTRE[noegle];
  const B = FLISE_B / 2;
  const c = document.createElement("canvas");
  c.width = B; c.height = hoejde;
  const g = c.getContext("2d");
  const data = g.createImageData(B, hoejde);
  const tapet = rgbTone(hexRGB(farve), moerk ? 0.84 : 1);
  const panel = rgbTone([122, 74, 38], moerk ? 0.85 : 1);
  const panelH = 9, kantH = 4;
  for (let py = 0; py < hoejde; py++) {
    for (let px = 0; px < B; px++) {
      let rgb, f = 1;
      if (py < kantH) {
        rgb = tapet; f = py === 0 ? 0.6 : 1.22;                              // kanten foroven
      } else if (py >= hoejde - panelH) {
        rgb = panel;                                                          // fodpanel af træ
        const r = py - (hoejde - panelH);
        f = r === 0 ? 0.65 : r === 1 ? 1.25 : r === panelH - 1 ? 0.7 : 1;
        f += (pixelStoej(Math.floor(px / 3), r, 4) - 0.5) * 0.08;
      } else {
        rgb = tapet;
        const s = px % 8;
        f = s === 0 ? 0.9 : s === 1 || s === 2 ? 1.05 : 1;                   // striber
        if ((px + py) % 16 === 4 && s > 3 && s < 7 && (py >> 3) % 2) f *= 1.07;   // lille mønster
        f += (pixelStoej(px, py, 7) - 0.5) * 0.035;
        if (py === hoejde - panelH - 1) f *= 0.8;                             // skygge over panelet
      }
      if (px === 0) f *= 0.88;                                                // samling mellem felterne
      const t = rgbTone(rgb, f), i = (py * B + px) * 4;
      data.data[i] = t[0]; data.data[i + 1] = t[1]; data.data[i + 2] = t[2]; data.data[i + 3] = 255;
    }
  }
  g.putImageData(data, 0, 0);
  PIXEL_MOENSTRE[noegle] = c;
  return c;
}

// Tegn ét stykke væg fra a til b (a er det venstre punkt på skærmen)
function pixelVaeg(a, b, vh, venstreVaeg) {
  const bil = vaegMoenster(RUM.vaegFarve, Math.round(vh), venstreVaeg);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.transform((b.x - a.x) / bil.width, (b.y - a.y) / bil.width, 0, 1, a.x, a.y - vh);
  ctx.drawImage(bil, 0, 0, bil.width + 0.4, bil.height);   // + lidt, så der ikke kommer sprækker
  ctx.restore();
  // mørk streg langs toppen, ligesom omridset på figurerne
  ctx.strokeStyle = "rgba(40,24,14,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y - vh);
  ctx.lineTo(b.x, b.y - vh);
  ctx.stroke();
}

function tegnGulv() {
  const gulvBillede = hentBillede(RUM.gulvBillede);
  for (let x = 0; x < RUM.bredde; x++) {
    for (let y = 0; y < RUM.dybde; y++) {
      if (!erIRummet(x, y)) continue;
      if (billedeKlar(gulvBillede)) {
        const p = punkt(x, y);
        ctx.drawImage(gulvBillede, p.x - FLISE_B / 2, p.y, FLISE_B, FLISE_H);
      } else {
        // pixel-gulv (se gulvMoenster). Først en flade i samme farve, så der ikke kommer sprækker.
        polygon(ctx, diamant(x, y), (x + y) % 2 && !erTrae(RUM.gulvFarve1) ? RUM.gulvFarve2 : RUM.gulvFarve1);
        const p = punkt(x, y);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(gulvMoenster(RUM.gulvFarve1, RUM.gulvFarve2, (x * 3 + y * 5) % 4), p.x - FLISE_B / 2, p.y, FLISE_B, FLISE_H);
        ctx.restore();
      }
    }
  }
  // gulvets kant forrest
  if (RUM.form) {
    for (let x = 0; x < RUM.bredde; x++) {
      for (let y = 0; y < RUM.dybde; y++) {
        if (!erIRummet(x, y)) continue;
        if (!erIRummet(x, y + 1)) {
          const a = punkt(x, y + 1), c = punkt(x + 1, y + 1);
          polygon(ctx, [a, c, { x: c.x, y: c.y + 8 }, { x: a.x, y: a.y + 8 }], nuance(RUM.gulvFarve2, 0.7));
        }
        if (!erIRummet(x + 1, y)) {
          const a = punkt(x + 1, y + 1), c = punkt(x + 1, y);
          polygon(ctx, [a, c, { x: c.x, y: c.y + 8 }, { x: a.x, y: a.y + 8 }], nuance(RUM.gulvFarve2, 0.55));
        }
      }
    }
    return;
  }
  const v = punkt(0, RUM.dybde), b = punkt(RUM.bredde, RUM.dybde), h = punkt(RUM.bredde, 0);
  polygon(ctx, [v, b, { x: b.x, y: b.y + 8 }, { x: v.x, y: v.y + 8 }], nuance(RUM.gulvFarve2, 0.7));
  polygon(ctx, [b, h, { x: h.x, y: h.y + 8 }, { x: b.x, y: b.y + 8 }], nuance(RUM.gulvFarve2, 0.55));
}

function tegnMarkering() {
  if (musFelt && erIRummet(musFelt.x, musFelt.y)) {
    let farve = "rgba(255,255,255,0.35)";
    if (valgtType) farve = moebelPaa(musFelt.x, musFelt.y) ? "rgba(255,60,60,0.45)" : "rgba(80,255,120,0.4)";
    polygon(ctx, diamant(musFelt.x, musFelt.y), farve);
  }
  if (valgtMoebel) {
    ctx.lineWidth = 2;
    polygon(ctx, diamant(valgtMoebel.x, valgtMoebel.y), "rgba(242,177,52,0.25)", "#f2b134");
    ctx.lineWidth = 1;
  }
}

// Passer sædet stadig? Er møblet taget op, drejet eller flyttet (måske af en anden),
// så rejser figuren sig eller følger med sin plads i sofaen.
function tjekSaede() {
  if (!figur.sidde) return;
  const m = figur.sidde.moebel;
  const t = MOEBEL_TYPER[m.type] || {};
  if (moeblerIRummet.indexOf(m) < 0 || (t.klipper && (m.retning || 0) >= 2)) { figur.sidde = null; return; }
  if (!t.klipper) return;
  const felt = pladsFelt(m, figur.sidde.plads);
  figur.x = felt.x;
  figur.y = felt.y;
  figur.retning = venderHoejre(m) ? "ned-hoejre" : "ned-venstre";
}

function tegnAlt() {
  skarptLaerred();
  tjekSaede();
  ctx.clearRect(0, 0, BREDDE, HOEJDE);
  if (rumValg === "hal") tegnHalVaegge();
  else tegnVaegge();
  tegnGulv();

  // Tæpper o.l. ligger fladt på gulvet og tegnes først
  moeblerIRummet.forEach(function (m) {
    const type = MOEBEL_TYPER[m.type];
    if (type.kanGaaPaa) {
      const c = moebelSted(type, m.x, m.y, drejetTvaers(m));
      tegnMoebel(ctx, type, c.x, c.y, m.spejlet, m.retning);
    }
  });
  tegnMarkering();

  // Alt det, der står op, tegnes bagfra og frem, så de forreste dækker de bagerste
  const ting = [];
  moeblerIRummet.forEach(function (m) {
    const type = MOEBEL_TYPER[m.type];
    if (type.kanGaaPaa) return;
    ting.push({
      dybde: moebelDybde(m),
      tegn: function () {
        const c = moebelSted(type, m.x, m.y, drejetTvaers(m));
        tegnMoebel(ctx, type, c.x, c.y, m.spejlet, m.retning);
      },
    });
  });
  // når figuren sidder i en sofa på 2 felter, skal den tegnes foran sofaen
  const figurDybde = figur.sidde ? moebelDybde(figur.sidde.moebel) + 0.1 + figur.sidde.plads * 0.01 : figur.x + figur.y + 0.1;
  ting.push({ dybde: figurDybde + figurPlads() / 1000, tegn: function () { tegnFigur(ctx); } });
  if (rumValg === "hal") halTing(ting);
  if (typeof andreSpillereTing === "function") andreSpillereTing(ting);   // rigtige spillere (js/rigtige-spillere.js)

  // Et "spøgelse" af møblet, man er ved at stille
  if (valgtType && musFelt && MOEBEL_TYPER[valgtType] && pladsTil(MOEBEL_TYPER[valgtType], musFelt.x, musFelt.y, false)) {
    const f = musFelt;
    const ff = moebelFelter(MOEBEL_TYPER[valgtType], false);
    ting.push({
      dybde: f.x + ff[0] - 1 + f.y + ff[1] - 1 + 0.05,
      tegn: function () {
        const c = moebelSted(MOEBEL_TYPER[valgtType], f.x, f.y, false);
        ctx.globalAlpha = 0.55;
        tegnMoebel(ctx, MOEBEL_TYPER[valgtType], c.x, c.y, false);
        ctx.globalAlpha = 1;
      },
    });
  }

  ting.sort(function (a, b) { return a.dybde - b.dybde; });
  ting.forEach(function (t) { t.tegn(); });
  if (typeof tegnBobler === "function") tegnBobler();
}


// =============================================================
//  Panelet med møbler
// =============================================================
const knapBoks = document.getElementById("moebel-knapper");
const faneBoks = document.getElementById("moebel-faner");
const ikoner = [];

// Faner: én for hver kategori (de første møbler hører til "Basis")
const KATEGORIER = [];
MOEBLER.forEach(function (type) {
  const k = type.kategori || "Basis";
  if (KATEGORIER.indexOf(k) < 0) KATEGORIER.push(k);
});
let valgtKategori = KATEGORIER[0];

function visKategori(k) {
  valgtKategori = k;
  faneBoks.querySelectorAll("button").forEach(function (f) {
    f.classList.toggle("aktiv", f.textContent === k);
  });
  knapBoks.querySelectorAll(".moebel-knap").forEach(function (knap) {
    knap.hidden = knap.dataset.kategori !== k;
  });
  knapBoks.scrollTop = 0;
}

KATEGORIER.forEach(function (k) {
  const fane = document.createElement("button");
  fane.textContent = k;
  fane.addEventListener("click", function () { visKategori(k); });
  faneBoks.appendChild(fane);
});

MOEBLER.forEach(function (type) {
  const knap = document.createElement("button");
  knap.className = "moebel-knap";
  knap.dataset.id = type.id;
  knap.dataset.kategori = type.kategori || "Basis";
  const ikon = document.createElement("canvas");
  ikon.width = 64;
  ikon.height = 70;
  ikoner.push({ ikon: ikon, type: type });
  const navn = document.createElement("span");
  navn.textContent = type.navn;
  knap.append(ikon, navn);
  knap.addEventListener("click", function () {
    valgtType = valgtType === type.id ? null : type.id;
    valgtMoebel = null;
    opdaterPanel();
  });
  knapBoks.appendChild(knap);
});

function tegnIkoner() {
  ikoner.forEach(function (i) {
    const c = i.ikon.getContext("2d");
    c.clearRect(0, 0, i.ikon.width, i.ikon.height);
    const b = hentBillede(i.type.billede);
    if (billedeKlar(b)) {
      const k = i.type.klip || [0, 0, b.naturalWidth, b.naturalHeight];
      const skala = Math.min(1, 60 / k[2], 66 / k[3]);
      const w = k[2] * skala, h = k[3] * skala;
      c.drawImage(b, k[0], k[1], k[2], k[3], 32 - w / 2, 68 - h, w, h);
    } else {
      // Reserve-tegningen gøres lidt mindre, så den kan være på knappen
      c.save();
      c.translate(32, 60);
      c.scale(0.75, 0.75);
      tegnMoebel(c, i.type, 0, 0, false);
      c.restore();
    }
  });
}

const valgtBoks = document.getElementById("valgt-boks");
const besked = document.getElementById("besked");

function opdaterPanel() {
  document.querySelectorAll(".moebel-knap").forEach(function (k) {
    k.classList.toggle("aktiv", k.dataset.id === valgtType);
  });
  if (valgtMoebel) {
    valgtBoks.hidden = false;
    document.getElementById("valgt-navn").textContent = MOEBEL_TYPER[valgtMoebel.type].navn;
  } else {
    valgtBoks.hidden = true;
  }
  if (valgtType) {
    besked.textContent = "Klik på et ledigt felt for at stille: " + MOEBEL_TYPER[valgtType].navn + ". (Esc fortryder)";
  } else if (valgtMoebel) {
    besked.textContent = "Du har valgt et møbel. Du kan dreje det eller samle det op.";
  } else {
    besked.textContent = "Klik på gulvet for at gå. Klik på et møbel for at vælge det.";
  }
}

function drejValgt() {
  if (!valgtMoebel || rumValg === "hal") return;
  const t = MOEBEL_TYPER[valgtMoebel.type] || {};
  if (t.klipper) {
    // næste retning rundt, som har et billede
    let r = valgtMoebel.retning || 0;
    for (let i = 0; i < 4; i++) { r = (r + 1) % 4; if (t.klipper[r]) break; }
    if (!pladsTil(t, valgtMoebel.x, valgtMoebel.y, r % 2 === 1, valgtMoebel)) {
      besked.textContent = "Der er ikke plads til at dreje møblet her. Flyt det først.";
      return;
    }
    valgtMoebel.retning = r;
    if (figur.sidde && figur.sidde.moebel === valgtMoebel) {
      if (r >= 2) figur.sidde = null;
      else vendFraRyglaenet(valgtMoebel);
    }
    gem();
    return;
  }
  // en sofa på 2 felter skal have plads til at ligge den anden vej
  if (!pladsTil(MOEBEL_TYPER[valgtMoebel.type], valgtMoebel.x, valgtMoebel.y, !valgtMoebel.spejlet, valgtMoebel)) {
    besked.textContent = "Der er ikke plads til at dreje møblet her. Flyt det først.";
    return;
  }
  valgtMoebel.spejlet = !valgtMoebel.spejlet;
  gem();
}

function samlOpValgt() {
  if (!valgtMoebel || rumValg === "hal") return;
  if (figur.sidde && figur.sidde.moebel === valgtMoebel) { figur.sidde = null; figur.skalSidde = null; }   // rejs dig først
  if (typeof tilLager === "function") tilLager(valgtMoebel.type);   // den kommer i "Mine ting"
  moeblerIRummet = moeblerIRummet.filter(function (m) { return m !== valgtMoebel; });
  valgtMoebel = null;
  gem();
  opdaterPanel();
}

// Klik på en, der sidder i et møbel: vælg også møblet, så boksen med Drej og Tag op
// kommer frem (ellers dækker personen møblet, og så kan man ikke vælge det).
// Den kører før klikket på personen (js/min-menu.js og js/gaest-menu.js).
laerred.addEventListener("click", function (e) {
  if (rumValg === "hal" || valgtType) return;
  let m = null;
  if (figur.sidde && typeof musPaaMig === "function" && musPaaMig(e)) m = figur.sidde.moebel;
  else if (typeof gaestUnderMus === "function") {
    const g = gaestUnderMus(e);
    if (g && g.sidder && moeblerIRummet.indexOf(g.saede) >= 0) m = g.saede;
  }
  if (m) { valgtMoebel = m; opdaterPanel(); }
}, true);

document.getElementById("knap-drej").addEventListener("click", drejValgt);
document.getElementById("knap-saml").addEventListener("click", samlOpValgt);
document.getElementById("knap-ryd").addEventListener("click", function () {
  if (typeof tilLager === "function" && rumValg !== "hal") moeblerIRummet.forEach(function (m) { tilLager(m.type); });
  moeblerIRummet = [];
  valgtMoebel = null;
  gem();
  opdaterPanel();
});


// =============================================================
//  Mus og tastatur
// =============================================================
function musTilFelt(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width);
  const sy = (e.clientY - r.top) * (HOEJDE / r.height);
  return skaermTilFelt(sx, sy);
}

// Træk i skærmen med musen for at flytte rundt. Et almindeligt klik går stadig.
const traek = { nede: false, x: 0, y: 0, flyttet: false };

laerred.addEventListener("mousedown", function (e) {
  if (e.button !== 0) return;
  traek.nede = true;
  traek.x = e.clientX;
  traek.y = e.clientY;
  traek.flyttet = false;
});

window.addEventListener("mousemove", function (e) {
  if (!traek.nede) return;
  const dx = e.clientX - traek.x, dy = e.clientY - traek.y;
  if (!traek.flyttet && Math.hypot(dx, dy) < 6) return;   // en lille rystelse er stadig et klik
  traek.flyttet = true;
  KAMERA.x += dx;
  KAMERA.y += dy;
  traek.x = e.clientX;
  traek.y = e.clientY;
  laerred.style.cursor = "grabbing";
});

window.addEventListener("mouseup", function () {
  if (traek.nede && traek.flyttet) laerred.style.cursor = "";
  traek.nede = false;
});

// Efter et træk skal der ikke ske noget, når man slipper musen
laerred.addEventListener("click", function (e) {
  if (traek.flyttet) {
    traek.flyttet = false;
    e.stopImmediatePropagation();
  }
}, true);

// Ctrl + klik på et møbel = saml det op (det kommer i "Mine ting").
// Virker i dine egne rum, ikke i velkomsthallen.
laerred.addEventListener("click", function (e) {
  if (!(e.ctrlKey || e.metaKey) || rumValg === "hal") return;
  const f = musTilFelt(e);
  const m = moebelPaa(f.x, f.y);
  if (!m) return;
  e.stopImmediatePropagation();
  if (figur.sidde && figur.sidde.moebel === m) { figur.sidde = null; figur.skalSidde = null; }
  valgtMoebel = m;
  samlOpValgt();
  besked.textContent = (MOEBEL_TYPER[m.type].navn || "Møblet") + " er lagt i Mine ting 📦";
}, true);
laerred.addEventListener("mousemove", function (e) {
  if (rumValg === "hal" || traek.nede) return;
  const f = musTilFelt(e);
  laerred.style.cursor = (e.ctrlKey || e.metaKey) && moebelPaa(f.x, f.y) ? "copy" : "";
});

// Musehjulet zoomer ind og ud
laerred.addEventListener("wheel", function (e) {
  e.preventDefault();
  const foer = brugerZoom;
  brugerZoom = Math.max(0.6, Math.min(2.2, brugerZoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
  KAMERA.x *= brugerZoom / foer;
  KAMERA.y *= brugerZoom / foer;
}, { passive: false });

laerred.addEventListener("mousemove", function (e) {
  musFelt = musTilFelt(e);
});

laerred.addEventListener("mouseleave", function () {
  musFelt = null;
});

laerred.addEventListener("click", function (e) {
  const f = musTilFelt(e);
  if (!erIRummet(f.x, f.y)) {
    valgtMoebel = null;
    opdaterPanel();
    return;
  }

  // Stil et nyt møbel
  if (valgtType) {
    const type = MOEBEL_TYPER[valgtType];
    if (!pladsTil(type, f.x, f.y, false)) {
      besked.textContent = "Der er optaget. Prøv et andet felt.";
      return;
    }
    moeblerIRummet.push({ type: valgtType, x: f.x, y: f.y, spejlet: false });
    valgtType = null;
    // Hvis møblet står i vejen for figuren, finder den en ny vej
    if (figur.rute.length > 0) {
      const maal = figur.rute[figur.rute.length - 1];
      gaaTil(maal.x, maal.y, figur.skalSidde);
    }
    gem();
    opdaterPanel();
    return;
  }

  // Klik på et møbel = vælg det. Klik på gulvet = gå derhen.
  // Klik på en stol eller sofa = gå derhen og sæt dig.
  const m = moebelPaa(f.x, f.y);
  valgtMoebel = m || null;
  if (m && MOEBEL_TYPER[m.type].saede) {
    if (!figur.sidde || figur.sidde.moebel !== m) {
      const fig = figurFelt();
      if (daekker(m, fig.x, fig.y) && !figur.sidde) saetDig(m);
      else gaaTil(f.x, f.y, m);
    } else {
      // man sidder allerede i sofaen: klik på den anden side = ryk derover, hvis der er ledigt
      const celle = cellePlads(m, f);
      if (celle >= 0 && celle !== figur.sidde.plads && tagnePladser(m, figur).indexOf(celle) < 0) {
        figur.x = f.x;
        figur.y = f.y;
        figur.sidde.plads = celle;
      }
    }
  } else if (!m || MOEBEL_TYPER[m.type].kanGaaPaa) {
    gaaTil(f.x, f.y);
  }
  opdaterPanel();
});

document.addEventListener("keydown", function (e) {
  if (e.target.tagName === "INPUT") return;   // man skriver i chatten
  if (e.key === "Escape") {
    valgtType = null;
    valgtMoebel = null;
    opdaterPanel();
  }
  if (e.key === "r" || e.key === "R") drejValgt();
  if (e.key === "Delete" || e.key === "Backspace") samlOpValgt();
});


// =============================================================
//  Garderobe — vælg figur
// =============================================================
const GARDEROBE_NOEGLE = "mit-hotel-figur-5";
const garderobe = { type: FIGUR.type, farver: { kvinde: {}, mand: {} }, frisure: {} };

try {
  const gemt = JSON.parse(localStorage.getItem(GARDEROBE_NOEGLE));
  if (gemt && alleFigurer()[gemt.type]) garderobe.type = gemt.type;
  // den nye pige (23/10) afløser den gamle én gang
  if (gemt && gemt.type === "kvinde" && !gemt.nyPige) garderobe.type = "pige";
  if (gemt && gemt.type === "mand" && !gemt.nyDreng) garderobe.type = "dreng";
  garderobe.nyDreng = true;
  garderobe.nyPige = true;
  if (gemt && gemt.farver) Object.assign(garderobe.farver, gemt.farver);
  if (gemt && gemt.ting) garderobe.ting = gemt.ting;
  if (gemt && gemt.frisure) garderobe.frisure = gemt.frisure;
} catch (fejl) {
  // ingen gemt figur endnu
}

function gemGarderobe() {
  try {
    localStorage.setItem(GARDEROBE_NOEGLE, JSON.stringify(garderobe));
  } catch (fejl) {
    // kan ikke gemme, men valget virker stadig nu
  }
}

const forhaandsvisning = document.getElementById("figur-forhaandsvisning");

function tegnForhaandsvisning() {
  const c = forhaandsvisning.getContext("2d");
  c.clearRect(0, 0, forhaandsvisning.width, forhaandsvisning.height);
  tegnMenneske(c, 34, forhaandsvisning.height - 4, garderobe, "ned", null, null);
  tegnMenneske(c, 98, forhaandsvisning.height - 4, garderobe, "op", null, null);
}

function lavFigurKnapper() {
  const boks = document.getElementById("figur-typer");
  if (!boks) return;
  boks.innerHTML = "";
  const figurer = alleFigurer();
  for (const id in figurer) {
    const knap = document.createElement("button");
    knap.textContent = figurer[id];
    knap.classList.toggle("aktiv", garderobe.type === id);
    knap.addEventListener("click", function () {
      garderobe.type = id;
      lavFigurKnapper();
      tegnForhaandsvisning();
      gemGarderobe();
    });
    boks.appendChild(knap);
  }
}

lavFigurKnapper();


// =============================================================
//  Gem rummet i browseren, så det er der næste gang
// =============================================================
const GEMME_NOEGLE = "mit-hotel-rum";

function gem() {
  if (rumValg === "hal") return;   // velkomsthallen gemmes ikke
  try {
    // dine egne oprettede rum gemmes hver for sig (js/velkomsthal.js)
    const noegle = typeof aktivtVaerelse !== "undefined" && aktivtVaerelse !== "mit" ? "mit-hotel-rum-" + aktivtVaerelse : GEMME_NOEGLE;
    localStorage.setItem(noegle, JSON.stringify(moeblerIRummet));
  } catch (fejl) {
    // Nogle browsere tillader ikke at gemme. Så virker spillet bare uden.
  }
}

// dit værelse kan være tegnet om med :floor (js/gulvplan.js)
function iGemtPlan(x, y) {
  let plan = {};
  try { plan = JSON.parse(localStorage.getItem("mit-hotel-rum-plan") || "{}"); } catch (e) {}
  if (!plan.felter) return erIRummet(x, y);
  return !!plan.felter[y] && plan.felter[y][x] === "x";
}

function hent() {
  try {
    const data = JSON.parse(localStorage.getItem(GEMME_NOEGLE));
    if (Array.isArray(data)) {
      moeblerIRummet = data.filter(function (m) {
        return MOEBEL_TYPER[m.type] && iGemtPlan(m.x, m.y);
      });
      return;
    }
  } catch (fejl) {
    // ignorér, og start med et nyt rum
  }
  // Første gang: stil et par møbler, så rummet ikke er tomt
  moeblerIRummet = [
    { type: "taeppe", x: 4, y: 4, spejlet: false },
    { type: "plante", x: 0, y: 0, spejlet: false },
    { type: "sofa", x: 3, y: 0, spejlet: false },
    { type: "bord", x: 4, y: 2, spejlet: false },
  ].filter(function (m) { return MOEBEL_TYPER[m.type]; });
}


// =============================================================
//  Start spillet
// =============================================================
hent();
tegnIkoner();
visKategori(valgtKategori);
tegnForhaandsvisning();
opdaterPanel();

let sidsteTid = performance.now();
function loop(nu) {
  const dt = Math.min(0.05, (nu - sidsteTid) / 1000);
  sidsteTid = nu;
  flytFigur(dt);
  if (rumValg === "hal") opdaterHal(dt);
  tegnAlt();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
