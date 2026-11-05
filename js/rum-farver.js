// =============================================================
//  🎨 Gulv & vægge (5/11)
//  Skift farve på gulvet, tapetet og træpanelet i dit rum.
//  - Gulv: rigtige træplanker i mange træfarver, eller fliser i alle farver.
//  - Vægge: tapetets farve + farven på træpanelet forneden.
//  Virker i dine egne rum. Hotellets ejer må i alle rum (også hallen).
//  Åbnes med knappen "🎨 Gulv & vægge" i panellet, eller skriv :farver i chatten.
//  Farverne gemmes i localStorage (mit-hotel-rum-farver). Din lejlighed sendes
//  også til serveren, så gæster ser dine farver.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================

const RF_NOEGLE = "mit-hotel-rum-farver";
const RF_KOMMANDO = /^[:：]\s*(farver?|colou?rs?)$/i;
const TRAE_NATUR = "#9a724b";      // = egeplankernes egen farve (billedet bruges som det er)
const PANEL_NATUR = "natur";

const RF_TRAE = [
  ["Naturlig eg", TRAE_NATUR], ["Lys eg", "#c9a273"], ["Birk", "#dcc39b"], ["Hvidmalet", "#ece6dc"],
  ["Askegrå", "#a7a29a"], ["Valnød", "#6b4a32"], ["Mahogni", "#7a3b28"], ["Mørk eg", "#4a3424"],
  ["Sort", "#2c2622"], ["Rosa træ", "#d9a3a8"], ["Mint træ", "#9cc2ad"], ["Blå træ", "#7f9bb8"],
];
const RF_FLISER = [
  ["Hvid", "#f4f1ea"], ["Creme", "#eadfc8"], ["Sand", "#d8c3a0"], ["Grå", "#b9b6b0"],
  ["Mørkegrå", "#6f6c68"], ["Sort", "#34312e"], ["Lyserød", "#f3c9d4"], ["Rosa", "#e39aae"],
  ["Rød", "#b8483f"], ["Vinrød", "#7a2232"], ["Fersken", "#f0b48c"], ["Gul", "#f1d77a"],
  ["Mint", "#b8dcc4"], ["Grøn", "#6f9a63"], ["Lyseblå", "#b9d3ea"], ["Blå", "#4f78a8"],
  ["Lilla", "#b6a3d6"], ["Mørkelilla", "#5a4680"],
];
const RF_TAPET = [
  ["Creme", "#f1e6cf"], ["Hvid", "#f7f5f0"], ["Grå", "#c2bfba"], ["Mørkegrå", "#6e6a66"],
  ["Lyserød", "#f2b6c9"], ["Rosa", "#d77f99"], ["Rød", "#b8483f"], ["Vinrød", "#7a2232"],
  ["Fersken", "#f1b993"], ["Gul", "#ecd27a"], ["Mint", "#b5d8c1"], ["Grøn", "#5f8a55"],
  ["Mørkegrøn", "#2f5a3e"], ["Lyseblå", "#b4cfe8"], ["Blå", "#3f5f92"], ["Marine", "#24324f"],
  ["Lilla", "#a993cf"], ["Mørkelilla", "#4a3466"], ["Brun", "#7b5338"], ["Sort", "#2b2725"],
];
const RF_PANEL = [
  ["Naturligt træ", PANEL_NATUR], ["Hvid", "#f2eee6"], ["Creme", "#e6d7b8"], ["Grå", "#9a968f"],
  ["Sort", "#2a2523"], ["Mørkt træ", "#4a3020"], ["Lyst træ", "#b78b5c"], ["Rosa", "#d796a6"],
  ["Vinrød", "#6e1f2d"], ["Grøn", "#3f6a4a"], ["Blå", "#3c567f"], ["Guld", "#c99a45"],
];

// ----- små hjælpere -----
function rfHex(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rfTilHex(r, g, b) {
  return "#" + [r, g, b].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"); }).join("");
}
function rfNuance(hex, f) { const c = rfHex(hex); return rfTilHex(c[0] * f, c[1] * f, c[2] * f); }
function rfLys(hex) { const c = rfHex(hex); return (0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 255; }

// ----- gemte farver -----
let rfGemt = {};
try { rfGemt = JSON.parse(localStorage.getItem(RF_NOEGLE) || "{}") || {}; } catch (e) { rfGemt = {}; }
function rfGem() { try { localStorage.setItem(RF_NOEGLE, JSON.stringify(rfGemt)); } catch (e) {} }

// Hvilket rum er vi i? ("hal" = velkomsthallen)
function rfRumId() { return rumValg === "hal" ? "hal" : rumValg === "vaerelse" ? aktivtVaerelse : null; }
function rfErEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }
function rfFremmedLej() { return typeof iFremmedLej === "function" && iFremmedLej(); }
function rfMaaRette() {
  const id = rfRumId();
  if (!id) return false;
  if (rfErEjer()) return true;
  if (id === "hal" || rfFremmedLej()) return false;
  if (id === "mit") return true;
  const info = vaerelseInfo(id);
  return !info.ejer || info.ejer === FIGUR.navn;
}

// Læg et rums farver over i RUM (det rum, der tegnes nu)
function rfSaetIRum(f) {
  if (!f) return;
  if (f.vaeg) RUM.vaegFarve = f.vaeg;
  if (f.gulv1) { RUM.gulvFarve1 = f.gulv1; RUM.gulvFarve2 = f.gulv2 || rfNuance(f.gulv1, 0.93); }
  RUM.gulvType = f.gulvType || null;
  RUM.panelFarve = f.panel || null;
  if (rumValg === "hal") {
    if (f.vaeg) { HAL_FARVER.tapet = f.vaeg; HAL_FARVER.tapetStribe = rfNuance(f.vaeg, 0.88); }
    if (f.gulv1) { HAL_FARVER.gulv1 = RUM.gulvFarve1; HAL_FARVER.gulv2 = RUM.gulvFarve2; }
    HAL_FARVER.panel = !f.panel || f.panel === PANEL_NATUR ? RF_HAL_STANDARD.panel : f.panel;
  }
  if (typeof REAL_GULV_CACHE !== "undefined") REAL_GULV_CACHE = null;
}
const RF_HAL_STANDARD = Object.assign({}, HAL_FARVER);

// Farver fra serveren for andres lejligheder (gulvtype og panel)
const RF_LEJ_DATA = {};

// Hver gang man går ind i et rum, bruges rummets egne farver
(function () {
  const skiftRumFoerFarver = skiftRum;
  skiftRum = function (navn) {
    skiftRumFoerFarver.apply(this, arguments);
    RUM.gulvType = null;
    RUM.panelFarve = null;
    if (navn === "hal") Object.assign(HAL_FARVER, RF_HAL_STANDARD);
    const id = rfRumId();
    const f = id === "hal" ? rfGemt.hal : rfFremmedLej() ? (RF_LEJ_DATA[id] || rfGemt[id]) : rfGemt[id];
    if (f) rfSaetIRum(f);
    else if (typeof REAL_GULV_CACHE !== "undefined") REAL_GULV_CACHE = null;
    rfOpdaterKnapper();
    if (!rfVindue.hidden) { if (rfMaaRette()) rfVisVindue(); else rfLuk(true); }
  };
})();

// Din lejlighed: gulvtype og panel sendes med til serveren
if (typeof minLejData === "function") {
  const minLejDataFoerFarver = minLejData;
  minLejData = function () {
    const d = minLejDataFoerFarver();
    const f = rfGemt.mit || {};
    if (f.gulvType) d.gulvType = f.gulvType;
    if (f.panel) d.panel = f.panel;
    return d;
  };
}
if (typeof serverKald === "function") {
  const serverKaldFoerFarver = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerFarver.apply(this, arguments);
    if (funktion === "hv_lej_hent" && svar && svar.id && svar.data) {
      const d = svar.data;
      RF_LEJ_DATA[svar.id] = { vaeg: d.vaeg, gulv1: d.gulv1, gulv2: d.gulv2, gulvType: d.gulvType || null, panel: d.panel || null };
    }
    return svar;
  };
}


// =============================================================
//  Tegning: farvede træplanker og farvet træpanel
// =============================================================
// Farver et træbillede, men beholder årerne: først får billedet farvens
// kulør ("color"), derefter gøres det lysere eller mørkere, så det passer.
// (Virker også fra file:// i Firefox, fordi pixels ikke læses.)
const RF_TONET = {};
function rfTonet(sti, farve, lysIBilledet) {
  const noegle = sti + "|" + farve;
  if (RF_TONET[noegle]) return RF_TONET[noegle];
  const b = hentBillede(sti);
  if (!billedeKlar(b)) return null;
  const c = document.createElement("canvas");
  c.width = b.naturalWidth; c.height = b.naturalHeight;
  const g = c.getContext("2d");
  g.drawImage(b, 0, 0);
  g.globalCompositeOperation = "color";
  g.fillStyle = farve;
  g.fillRect(0, 0, c.width, c.height);
  const maal = rfLys(farve);
  if (maal < lysIBilledet) {
    const k = Math.round(255 * maal / lysIBilledet);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = "rgb(" + k + "," + k + "," + k + ")";
    g.fillRect(0, 0, c.width, c.height);
  } else if (maal > lysIBilledet) {
    const s = Math.round(255 * (1 - (1 - maal) / (1 - lysIBilledet)));
    g.globalCompositeOperation = "screen";
    g.fillStyle = "rgb(" + s + "," + s + "," + s + ")";
    g.fillRect(0, 0, c.width, c.height);
  }
  // gennemsigtige pixels (panelets kanter) skal blive gennemsigtige
  g.globalCompositeOperation = "destination-in";
  g.drawImage(b, 0, 0);
  RF_TONET[noegle] = c;
  return c;
}

function rfStartTegning() {
  if (typeof realGulvBillede !== "function" || typeof realVaegBillede !== "function") {
    setTimeout(rfStartTegning, 200);   // venter på js/realistisk.js
    return;
  }
  // ----- gulvet -----
  const realGulvFoerFarver = realGulvBillede;
  realGulvBillede = function () {
    if (RUM.gulvType === "trae") {
      if (RUM.gulvFarve1 === TRAE_NATUR) { const b = hentBillede(REALISTISK.gulvTrae); return billedeKlar(b) ? b : null; }
      return rfTonet(REALISTISK.gulvTrae, RUM.gulvFarve1, 0.477);
    }
    if (RUM.gulvType === "fliser") return realFarvet(REALISTISK.gulvFliser, nuance(RUM.gulvFarve1, 1.08));
    return realGulvFoerFarver();
  };

  // ----- væggene (samme som i realistisk.js, men panelet kan have en farve) -----
  const RF_VAEGGE = {};
  realVaegBillede = function (farve, vh, moerk) {
    const pf = RUM.panelFarve && RUM.panelFarve !== PANEL_NATUR ? RUM.panelFarve : "";
    const noegle = farve + "|" + vh + "|" + moerk + "|" + pf;
    if (RF_VAEGGE[noegle]) return RF_VAEGGE[noegle];
    const tapet = realFarvet(REALISTISK.tapet, farve);
    const panel = pf ? rfTonet(REALISTISK.panel, pf, 0.344) : hentBillede(REALISTISK.panel);
    if (!tapet || !panel || (!pf && !billedeKlar(panel))) return null;
    const S = 2;
    const B = FLISE_B / 2 * S, H = Math.round(vh * S);
    const c = document.createElement("canvas");
    c.width = B; c.height = H;
    const g = c.getContext("2d");
    for (let y = H; y > -tapet.height; y -= tapet.height) g.drawImage(tapet, 0, y - tapet.height, B, tapet.height);
    const kl = 5 * S;
    const kg = g.createLinearGradient(0, 0, 0, kl);
    kg.addColorStop(0, nuance(farve, 0.6)); kg.addColorStop(0.25, nuance(farve, 1.12)); kg.addColorStop(1, nuance(farve, 0.86));
    g.fillStyle = kg; g.fillRect(0, 0, B, kl);
    const sk = g.createLinearGradient(0, kl, 0, kl + 14 * S);
    sk.addColorStop(0, "rgba(40,20,5,0.18)"); sk.addColorStop(1, "rgba(40,20,5,0)");
    g.fillStyle = sk; g.fillRect(0, kl, B, 14 * S);
    const ph = Math.min(REALISTISK.panelHoejde, vh * 0.45) * S;
    g.drawImage(panel, 0, H - ph, B, ph);
    g.fillStyle = "rgba(30,15,5,0.10)"; g.fillRect(0, 0, 1, H - ph);
    if (moerk) { g.fillStyle = "rgba(30,15,5,0.16)"; g.fillRect(0, 0, B, H); }
    RF_VAEGGE[noegle] = c;
    return c;
  };
  if (typeof REAL_GULV_CACHE !== "undefined") REAL_GULV_CACHE = null;
}
rfStartTegning();


// =============================================================
//  Vinduet 🎨 Gulv & vægge
// =============================================================
const rfStil = document.createElement("style");
rfStil.textContent =
  "#rum-farver{position:fixed;z-index:15;left:max(10px,calc(50% - 230px));top:max(10px,calc(50% - 290px));width:min(460px,calc(100vw - 20px));max-height:calc(100vh - 20px);display:flex;flex-direction:column;" +
  "background:#fbf4e4 url(billeder/ui/papir.jpg);border:3px solid #c99a45;border-radius:14px;box-shadow:0 6px 0 #4a1420,0 14px 30px rgba(0,0,0,.4);font:13px Verdana,sans-serif;color:#3b2417}" +
  "#rum-farver[hidden]{display:none}" +
  ".rf-top{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;background:#6e1f2d linear-gradient(#8a2a3a,#5c1824);color:#fbe7b0;border-radius:10px 10px 0 0;cursor:move;border-bottom:2px solid #c99a45}" +
  ".rf-top b{font-size:14px;text-shadow:0 1px 0 #2a0a10}" +
  ".rf-top button{width:26px;height:26px;border:2px solid #c99a45;border-radius:7px;background:#fbf4e4;color:#6e1f2d;cursor:pointer;font-weight:bold}" +
  ".rf-krop{padding:10px 12px 12px;overflow:auto;display:flex;flex-direction:column;gap:10px}" +
  ".rf-del{background:rgba(255,250,238,.85);border:1px solid #dcc39b;border-radius:10px;padding:8px 10px}" +
  ".rf-del h3{margin:0 0 6px;font-size:13px;color:#6e1f2d}" +
  ".rf-type{display:flex;gap:6px;margin-bottom:8px}" +
  ".rf-type button{flex:1;padding:6px;border:2px solid #dcc39b;border-radius:8px;background:#fffaf0;color:#3b2417;cursor:pointer;font:bold 12px Verdana,sans-serif}" +
  ".rf-type button.valgt{border-color:#6e1f2d;background:#f6e2c4}" +
  ".rf-farver{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:6px}" +
  ".rf-farver button{height:34px;border:2px solid rgba(0,0,0,.18);border-radius:8px;cursor:pointer;padding:0;box-shadow:inset 0 -6px 8px rgba(0,0,0,.12)}" +
  ".rf-farver button.valgt{outline:3px solid #6e1f2d;outline-offset:1px}" +
  ".rf-egen{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px}" +
  ".rf-egen input{width:42px;height:28px;border:2px solid #dcc39b;border-radius:6px;padding:0;background:none;cursor:pointer}" +
  ".rf-knapper{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}" +
  ".rf-knapper button{padding:7px 12px;border:2px solid #c99a45;border-radius:8px;background:#fffaf0;color:#3b2417;cursor:pointer;font:bold 12px Verdana,sans-serif}" +
  ".rf-knapper .rf-gem{background:#6e1f2d;color:#fbe7b0}" +
  ".rf-knapper .rf-luft{flex:1}" +
  ".rf-note{font-size:11px;color:#7a5a40;margin:0}" +
  ".rf-aabn{display:block;width:100%;margin:6px 0;padding:8px;border:2px solid #c99a45;border-radius:9px;background:#fbf4e4;color:#6e1f2d;font:bold 13px Verdana,sans-serif;cursor:pointer}" +
  ".rf-aabn[hidden]{display:none}";
document.head.appendChild(rfStil);

const rfVindue = document.createElement("div");
rfVindue.id = "rum-farver";
rfVindue.hidden = true;
rfVindue.innerHTML =
  '<div class="rf-top"><b>🎨 Gulv &amp; vægge <span id="rf-rum"></span></b><button type="button" id="rf-luk" title="Luk">✕</button></div>' +
  '<div class="rf-krop">' +
  '  <div class="rf-del"><h3>🪵 Gulv</h3>' +
  '    <div class="rf-type"><button type="button" data-type="trae">🪵 Træplanker</button><button type="button" data-type="fliser">⬜ Fliser</button></div>' +
  '    <div class="rf-farver" id="rf-gulv"></div>' +
  '    <label class="rf-egen"><input type="color" id="rf-gulv-egen"> Vælg din egen farve</label></div>' +
  '  <div class="rf-del"><h3>🧱 Vægge (tapet)</h3>' +
  '    <div class="rf-farver" id="rf-vaeg"></div>' +
  '    <label class="rf-egen"><input type="color" id="rf-vaeg-egen"> Vælg din egen farve</label></div>' +
  '  <div class="rf-del"><h3>🪚 Træpanel forneden på væggen</h3>' +
  '    <div class="rf-farver" id="rf-panel"></div>' +
  '    <label class="rf-egen"><input type="color" id="rf-panel-egen"> Vælg din egen farve</label></div>' +
  '  <p class="rf-note" id="rf-note"></p>' +
  '  <div class="rf-knapper"><button type="button" id="rf-standard" title="Rummets oprindelige farver">↩ Standard</button><span class="rf-luft"></span>' +
  '    <button type="button" id="rf-annuller">Annuller</button><button type="button" id="rf-gem" class="rf-gem">💾 Gem</button></div>' +
  '</div>';
document.body.appendChild(rfVindue);
if (typeof goerFlytbar === "function") goerFlytbar(rfVindue, rfVindue.querySelector(".rf-top"), "mit-hotel-flyt-rum-farver");

let rfFoer = null;     // farverne da vinduet blev åbnet (til Annuller)
let rfNu = null;       // de farver, man er ved at vælge

// rummets farver lige nu (præcis som de er, så Annuller kan sætte dem tilbage)
function rfAktuelle() {
  return { vaeg: RUM.vaegFarve, gulv1: RUM.gulvFarve1, gulv2: RUM.gulvFarve2, gulvType: RUM.gulvType || null, panel: RUM.panelFarve || null };
}
// ... og som de vises i vinduet
function rfTilValg(a) {
  const n = Object.assign({}, a);
  if (!n.gulvType) {
    n.gulvType = erTrae(n.gulv1) ? "trae" : "fliser";
    if (n.gulvType === "trae") { n.gulv1 = TRAE_NATUR; n.gulv2 = rfNuance(TRAE_NATUR, 0.93); }   // det gamle brune gulv = naturlig eg
  }
  if (!n.panel) n.panel = PANEL_NATUR;
  return n;
}

function rfLavFarver(boks, liste, valgt, klik) {
  boks.innerHTML = "";
  liste.forEach(function (f) {
    const b = document.createElement("button");
    b.type = "button";
    b.title = f[0];
    b.style.background = f[1] === PANEL_NATUR ? "linear-gradient(135deg,#8a5a34,#5b3a22 45%,#9a6a40)" : f[1] === TRAE_NATUR ? "linear-gradient(135deg,#b4844f,#8a6038 45%,#c0905c)" : f[1];
    if (String(valgt).toLowerCase() === f[1].toLowerCase()) b.classList.add("valgt");
    b.addEventListener("click", function () { klik(f[1]); });
    boks.appendChild(b);
  });
}

function rfVisVindue() {
  const id = rfRumId();
  document.getElementById("rf-rum").textContent = "· " + (id === "hal" ? "Velkomsthallen" : vaerelseNavn(id));
  const n = rfNu;
  rfVindue.querySelectorAll(".rf-type button").forEach(function (b) { b.classList.toggle("valgt", b.dataset.type === n.gulvType); });
  rfLavFarver(document.getElementById("rf-gulv"), n.gulvType === "trae" ? RF_TRAE : RF_FLISER, n.gulv1, function (f) { rfNu.gulv1 = f; rfNu.gulv2 = rfNuance(f, 0.93); rfProev(); });
  rfLavFarver(document.getElementById("rf-vaeg"), RF_TAPET, n.vaeg, function (f) { rfNu.vaeg = f; rfProev(); });
  rfLavFarver(document.getElementById("rf-panel"), RF_PANEL, n.panel, function (f) { rfNu.panel = f; rfProev(); });
  const hex = function (v, ellers) { return /^#[0-9a-f]{6}$/i.test(v) ? v : ellers; };
  document.getElementById("rf-gulv-egen").value = hex(n.gulv1, "#c9a273");
  document.getElementById("rf-vaeg-egen").value = hex(n.vaeg, "#f1e6cf");
  document.getElementById("rf-panel-egen").value = hex(n.panel, "#6b4a32");
  const lokal = id === "hal" || (id !== "mit" && (INDBYGGEDE_RUM[id] || rfFremmedLej()));
  document.getElementById("rf-note").textContent = id === "tagterrasse" ? "☀️ Tagterrassen har himmel i stedet for vægge, så kun gulvet kan ses."
    : lokal ? "🛈 Farverne i hotellets fælles rum gemmes kun på denne computer indtil videre."
    : "Du ser farverne i rummet med det samme. Tryk 💾 Gem for at beholde dem.";
}

// prøv farverne i rummet med det samme
function rfProev() {
  rfSaetIRum(rfNu);
  rfVisVindue();
}

function rfAabn() {
  if (!rfMaaRette()) {
    besked.textContent = rumValg === "hal" ? "🎨 Kun hotellets ejer kan ændre farverne i velkomsthallen." : "🎨 Du kan kun ændre farverne i dine egne rum.";
    return;
  }
  rfFoer = rfAktuelle();
  rfNu = rfTilValg(rfFoer);
  rfVindue.hidden = false;
  rfVisVindue();
}
function rfLuk(fortryd) {
  if (fortryd && rfFoer) rfSaetIRum(rfFoer);
  rfVindue.hidden = true;
  rfFoer = rfNu = null;
}

rfVindue.querySelectorAll(".rf-type button").forEach(function (b) {
  b.addEventListener("click", function () {
    if (rfNu.gulvType === b.dataset.type) return;
    rfNu.gulvType = b.dataset.type;
    // vælg en passende første farve til den nye slags gulv
    rfNu.gulv1 = b.dataset.type === "trae" ? TRAE_NATUR : (erTrae(rfNu.gulv1) ? RF_FLISER[1][1] : rfNu.gulv1);
    rfNu.gulv2 = rfNuance(rfNu.gulv1, 0.93);
    rfProev();
  });
});
document.getElementById("rf-gulv-egen").addEventListener("input", function (e) { rfNu.gulv1 = e.target.value; rfNu.gulv2 = rfNuance(e.target.value, 0.93); rfProev(); });
document.getElementById("rf-vaeg-egen").addEventListener("input", function (e) { rfNu.vaeg = e.target.value; rfProev(); });
document.getElementById("rf-panel-egen").addEventListener("input", function (e) { rfNu.panel = e.target.value; rfProev(); });
document.getElementById("rf-luk").addEventListener("click", function () { rfLuk(true); });
document.getElementById("rf-annuller").addEventListener("click", function () { rfLuk(true); });

// ↩ Standard: rummets oprindelige farver
document.getElementById("rf-standard").addEventListener("click", function () {
  const id = rfRumId();
  if (id === "hal") {
    rfNu = { vaeg: RF_HAL_STANDARD.tapet, gulv1: RF_HAL_STANDARD.gulv1, gulv2: RF_HAL_STANDARD.gulv2, gulvType: erTrae(RF_HAL_STANDARD.gulv1) ? "trae" : "fliser", panel: PANEL_NATUR };
  } else {
    const s = id === "mit" ? RF_MIT_STANDARD : (RF_STANDARD[id] || vaerelseInfo(id));
    rfNu = { vaeg: s.vaeg, gulv1: s.gulv1, gulv2: s.gulv2, gulvType: erTrae(s.gulv1) ? "trae" : "fliser", panel: PANEL_NATUR };
  }
  rfProev();
});
const RF_MIT_STANDARD = { vaeg: RUM_FARVER.vaeg, gulv1: RUM_FARVER.gulv1, gulv2: RUM_FARVER.gulv2 };
const RF_STANDARD = {};
Object.keys(INDBYGGEDE_RUM).forEach(function (id) { const r = INDBYGGEDE_RUM[id]; RF_STANDARD[id] = { vaeg: r.vaeg, gulv1: r.gulv1, gulv2: r.gulv2 }; });

// 💾 Gem
document.getElementById("rf-gem").addEventListener("click", function () {
  const id = rfRumId();
  if (!id || !rfNu) return;
  const f = { vaeg: rfNu.vaeg, gulv1: rfNu.gulv1, gulv2: rfNu.gulv2, gulvType: rfNu.gulvType, panel: rfNu.panel };
  rfGemt[id] = f;
  rfGem();
  rfSaetIRum(f);
  if (id !== "hal") {
    // rummet selv husker også farverne (navigatørens kort, lejligheden på serveren)
    const info = vaerelseInfo(id);
    info.vaeg = f.vaeg; info.gulv1 = f.gulv1; info.gulv2 = f.gulv2; info.gulvType = f.gulvType; info.panel = f.panel;
    if (id !== "mit" && mineRum.some(function (r) { return r.id === id; })) gemMineRum();
    if (typeof gem === "function") gem();
  }
  rfLuk(false);
  besked.textContent = "🎨 Farverne er gemt!";
});

// Farverne gemt på computeren lægges ind i rummene med det samme
Object.keys(rfGemt).forEach(function (id) {
  if (id === "hal") return;
  const f = rfGemt[id];
  const info = id === "mit" ? RUM_FARVER : INDBYGGEDE_RUM[id] || mineRum.find(function (r) { return r.id === id; });
  if (!info || !f) return;
  info.vaeg = f.vaeg; info.gulv1 = f.gulv1; info.gulv2 = f.gulv2; info.gulvType = f.gulvType; info.panel = f.panel;
});
// Er vi allerede inde i et rum, når filen hentes, så brug farverne nu
(function () {
  const id = rfRumId();
  const f = id && rfGemt[id];
  if (f && !rfFremmedLej()) rfSaetIRum(f);
})();


// -------------------------------------------------------------
//  Knapper i panellet + kommandoen :farver i chatten
// -------------------------------------------------------------
function rfLavKnap(sektionId) {
  const sek = document.getElementById(sektionId);
  if (!sek || sek.querySelector(".rf-aabn")) return null;
  const k = document.createElement("button");
  k.type = "button";
  k.className = "rf-aabn";
  k.textContent = "🎨 Gulv & vægge";
  k.title = "Skift farve på gulvet og væggene";
  k.addEventListener("click", rfAabn);
  const efter = sek.querySelector("#knap-til-hal, #knap-til-vaerelse");
  if (efter && efter.nextSibling) sek.insertBefore(k, efter.nextSibling); else sek.appendChild(k);
  return k;
}
const rfKnapRum = rfLavKnap("moebel-sektion");
const rfKnapHal = rfLavKnap("hal-sektion");
function rfOpdaterKnapper() {
  const maa = rfMaaRette();
  if (rfKnapRum) rfKnapRum.hidden = !(maa && rumValg === "vaerelse");
  if (rfKnapHal) rfKnapHal.hidden = !(maa && rumValg === "hal");
}
rfOpdaterKnapper();
setInterval(rfOpdaterKnapper, 1500);

document.addEventListener("submit", function (e) {
  if (typeof chatForm === "undefined" || e.target !== chatForm) return;
  if (!RF_KOMMANDO.test(chatTekst.value.trim())) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  chatTekst.value = "";
  rfAabn();
}, true);
