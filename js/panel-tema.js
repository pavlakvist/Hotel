// =============================================================
//  🌙 Mørkt tema i panelet
//  Knappen 🌙 / ☀️ i toppen af Ejerpanelet (og MOD-, Eventvært- og staff-panelet)
//  skifter mellem det almindelige grøn/creme tema og et roligt mørkt tema.
//  Hver person vælger selv, og valget huskes på computeren.
//  Staff chatten har sit eget mørke tema og ser ens ud i begge.
// =============================================================
const PANEL_TEMA_NOEGLE = "mit-hotel-panel-tema";

function panelTemaNoegle() { return PANEL_TEMA_NOEGLE + "-" + String(FIGUR.navn || "").toLowerCase(); }
function panelErMoerkt() { try { return localStorage.getItem(panelTemaNoegle()) === "moerkt"; } catch (e) { return false; } }

// 🌙-knappen ved siden af ⤢ og ✕
const temaKnap = document.createElement("button");
temaKnap.type = "button";
temaKnap.className = "su-luk ejer-tema";
(document.querySelector("#ejer-vindue .ejer-stoer") || document.getElementById("ejer-luk")).before(temaKnap);

function visPanelTema() {
  const moerkt = panelErMoerkt();
  ejerVindue.classList.toggle("moerkt", moerkt);
  temaKnap.textContent = moerkt ? "☀️" : "🌙";
  temaKnap.title = moerkt ? "Skift til lyst tema" : "Skift til mørkt tema";
  if (moerkt) farvBlaa(ejerIndhold); else nulstilFarver();
}
temaKnap.addEventListener("click", function () {
  try { localStorage.setItem(panelTemaNoegle(), panelErMoerkt() ? "lyst" : "moerkt"); } catch (e) {}
  visPanelTema();
});

// -------------------------------------------------------------
//  Det grønne bliver blåt i det mørke tema
//  Alle grønne farver (tekst, kanter, baggrunde, knapper) drejes over til en
//  blød blå, der passer til den blågrå ramme. Det lyse tema er helt uændret.
// -------------------------------------------------------------
const panelOrigStil = new Map();     // element → den stil, det havde før
const FARVE_EGENSKABER = ["color", "background-color", "border-top-color", "border-right-color",
  "border-bottom-color", "border-left-color", "outline-color"];

function drejGroen(tekst) {
  return tekst.replace(/rgba?\(([^)]+)\)/g, function (hel, tal) {
    const d = tal.split(",").map(function (x) { return parseFloat(x); });
    const r = d[0] / 255, g = d[1] / 255, b = d[2] / 255;
    const maks = Math.max(r, g, b), min = Math.min(r, g, b), l = (maks + min) / 2, f = maks - min;
    if (f < 0.04) return hel;
    const s = f / (1 - Math.abs(2 * l - 1));
    let h = maks === r ? ((g - b) / f) % 6 : maks === g ? (b - r) / f + 2 : (r - g) / f + 4;
    h = (h * 60 + 360) % 360;
    if (h < 70 || h > 175 || s < 0.12) return hel;           // ikke grøn
    h = 212;                                                   // grøn → blød blå
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const rgb = h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : [x, 0, c];
    const ud = rgb.map(function (v) { return Math.round((v + m) * 255); });
    return (d.length > 3 ? "rgba(" : "rgb(") + ud.join(", ") + (d.length > 3 ? ", " + d[3] : "") + ")";
  });
}
function farvEt(el) {
  if (panelOrigStil.has(el)) el.style.cssText = panelOrigStil.get(el);
  if (el.closest(".bs-farver, .bs-forhaand")) return;          // bannerets rigtige farver bliver, som de er
  const cs = getComputedStyle(el);
  const nye = [];
  FARVE_EGENSKABER.concat(["background-image", "box-shadow"]).forEach(function (eg) {
    const v = cs.getPropertyValue(eg);
    if (!v || v === "none" || v.indexOf("rgb") < 0 || v.indexOf("url(") >= 0) return;
    const ny = drejGroen(v);
    if (ny !== v) nye.push([eg, ny]);
  });
  if (!nye.length) { panelOrigStil.delete(el); return; }
  if (!panelOrigStil.has(el)) panelOrigStil.set(el, el.style.cssText);
  nye.forEach(function (n) { el.style.setProperty(n[0], n[1]); });
}
function farvBlaa(rod) {
  if (!ejerVindue.classList.contains("moerkt")) return;
  farvEt(rod);
  rod.querySelectorAll("*").forEach(farvEt);
}
function nulstilFarver() {
  panelOrigStil.forEach(function (orig, el) { el.style.cssText = orig; });
  panelOrigStil.clear();
}
// Når panelet tegner noget nyt (eller en knap bliver valgt), farves det med det samme
let farvVenter = false;
new MutationObserver(function () {
  if (farvVenter || !ejerVindue.classList.contains("moerkt")) return;
  farvVenter = true;
  requestAnimationFrame(function () {
    farvVenter = false;
    panelOrigStil.forEach(function (o, el) { if (!el.isConnected) panelOrigStil.delete(el); });
    farvBlaa(ejerIndhold);
  });
}).observe(ejerIndhold, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"], characterData: true });
visPanelTema();

// navnet kan skifte, når man logger ind (så kommer ens eget valg frem)
let panelTemaNavn = FIGUR.navn;
setInterval(function () { if (FIGUR.navn !== panelTemaNavn) { panelTemaNavn = FIGUR.navn; visPanelTema(); } }, 1000);


// -------------------------------------------------------------
//  Udseendet: samme rolige blågrå som Staff chatten
// -------------------------------------------------------------
const M = "#ejer-vindue.moerkt ";
const panelTemaStil = document.createElement("style");
panelTemaStil.textContent =
  M + ".ejer-boks { background: #262f3b; border-color: #3f5a6e; color: #d5dde8; }" +
  M + ".ejer-top { background: #2f3a48; border-bottom: 1px solid #3a4757; }" +
  M + ".ejer-top h2 { color: #e3eaf2; }" +
  M + ".ejer-top .su-luk { background: #3f5a6e; border-color: #5f8199; color: #eef3f8; }" +
  M + "#ejer-faner { background: #2b3542; border-right-color: #3a4757; }" +
  M + "#ejer-faner button { color: #c3cedb; }" +
  M + "#ejer-faner button:hover { background: #364353; }" +
  M + "#ejer-faner button.valgt { background: #3f5a6e; color: #f2f6fa; }" +
  M + "#ejer-faner::-webkit-scrollbar-thumb, " + M + "#ejer-indhold::-webkit-scrollbar-thumb { background: #46556a; }" +
  // Indholdet: alle farver vendes til mørke (billeder vendes tilbage, så de ser rigtige ud)
  M + "#ejer-indhold:not(.sc-nat) { filter: invert(1) hue-rotate(180deg) contrast(0.82); }" +
  M + "#ejer-indhold:not(.sc-nat) img, " + M + "#ejer-indhold:not(.sc-nat) canvas { filter: contrast(1.22) hue-rotate(180deg) invert(1); }" +
  M + "#ejer-indhold.sc-nat { background: #262f3b; }" +
  M + ".ejer-greb-hjoerne { filter: invert(0.8); }";
document.head.appendChild(panelTemaStil);
