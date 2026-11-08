// =============================================================
//  ⏱ Fartmåler — skriv :fart i chatten
//  Viser hvor mange billeder i sekundet hotellet tegner (FPS), og hvor
//  lang tid hver del tager at tegne (gulv, vægge, møbler, figurer ...).
//  Bruges til at finde ud af, hvad der får hotellet til at lagge.
//  Skriv :fart igen for at lukke den.
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
const FART_KOMMANDO = /^:fart$/i;
const FART = { til: false, sat: false, dele: {}, tegn: 0, billeder: 0, start: 0, sidste: 0, vaerst: 0, boks: null };
const FART_DELE = [
  ["tegnGulv", "Gulv"], ["tegnVaegge", "Vægge"], ["tegnHalVaegge", "Vægge (hal)"],
  ["tegnMoebel", "Møbler"], ["tegnMenneske", "Figurer"], ["tegnBobler", "Talebobler"],
  ["flytFigur", "Gå (din figur)"], ["opdaterHal", "Gæster i hallen"],
];

function fartPakInd(navn) {
  let gammel;
  try { gammel = eval(navn); } catch (e) { return; }
  if (typeof gammel !== "function" || gammel.fartMaalt) return;
  let dybde = 0;   // figurer tegner figurer (lag på lag): kun den yderste tælles
  const ny = function () {
    if (!FART.til || dybde) return gammel.apply(this, arguments);
    dybde++;
    const t = performance.now();
    try { return gammel.apply(this, arguments); }
    finally { dybde--; FART.dele[navn] = (FART.dele[navn] || 0) + performance.now() - t; }
  };
  ny.fartMaalt = true;
  try { eval(navn + " = ny"); } catch (e) {}
}

function fartSaetOp() {
  if (FART.sat) return;
  FART.sat = true;
  FART_DELE.forEach(function (d) { fartPakInd(d[0]); });
  // hele tegningen
  const gammelAlt = tegnAlt;
  tegnAlt = function () {
    if (!FART.til) return gammelAlt.apply(this, arguments);
    const t = performance.now();
    try { return gammelAlt.apply(this, arguments); }
    finally {
      const nu = performance.now();
      FART.tegn += nu - t;
      if (FART.sidste) FART.vaerst = Math.max(FART.vaerst, nu - FART.sidste);
      FART.sidste = nu;
      FART.billeder++;
    }
  };
  const b = document.createElement("div");
  b.id = "fart-maaler";
  b.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:99999;" +
    "background:rgba(30,12,8,.88);color:#f6e3c0;font:13px/1.45 monospace;padding:8px 12px;" +
    "border:2px solid #b8863b;border-radius:8px;white-space:pre;pointer-events:none;";
  document.body.appendChild(b);
  FART.boks = b;
  setInterval(fartVis, 1000);
}

function fartVis() {
  if (!FART.til || !FART.boks) return;
  const nu = performance.now(), tid = (nu - FART.start) / 1000, n = Math.max(1, FART.billeder);
  const fps = FART.billeder / tid;
  const linjer = [];
  linjer.push("⏱ FARTMÅLER   (skriv :fart for at lukke)");
  linjer.push("Billeder i sekundet: " + fps.toFixed(0) + (fps < 30 ? "   ⚠ hakker" : fps < 50 ? "   lidt hakkende" : "   ✓ glat"));
  linjer.push("Længste pause:       " + FART.vaerst.toFixed(0) + " ms");
  linjer.push("Tegning i alt:       " + (FART.tegn / n).toFixed(1) + " ms pr. billede");
  FART_DELE.forEach(function (d) {
    const v = FART.dele[d[0]];
    if (v === undefined) return;
    linjer.push("  " + (d[1] + ":                ").slice(0, 18) + (v / n).toFixed(1) + " ms");
  });
  const andet = Math.max(0, 1000 / Math.max(fps, 1) - FART.tegn / n);
  linjer.push("Alt andet:           " + andet.toFixed(1) + " ms pr. billede");
  linjer.push("Lærred: " + laerred.width + " × " + laerred.height + " px   (skærm-zoom " + (window.devicePixelRatio || 1).toFixed(2) + ")");
  const ua = navigator.userAgent;
  linjer.push("Browser: " + (/Firefox\/(\d+)/.test(ua) ? "Firefox " + RegExp.$1 : /Edg\/(\d+)/.test(ua) ? "Edge " + RegExp.$1 : /Chrome\/(\d+)/.test(ua) ? "Chrome " + RegExp.$1 : "anden") +
    "   Rum: " + (rumValg === "hal" ? "hallen" : rumValg));
  FART.boks.textContent = linjer.join("\n");
  // nulstil, så tallene altid er for det sidste sekund
  FART.dele = {}; FART.tegn = 0; FART.billeder = 0; FART.vaerst = 0; FART.start = nu;
}

function fartSkift() {
  fartSaetOp();
  FART.til = !FART.til;
  FART.boks.hidden = !FART.til;
  FART.dele = {}; FART.tegn = 0; FART.billeder = 0; FART.vaerst = 0; FART.sidste = 0; FART.start = performance.now();
  if (FART.til) FART.boks.textContent = "⏱ Måler ... (vent et sekund)";
}

document.addEventListener("submit", function (e) {
  if (typeof chatForm === "undefined" || e.target !== chatForm) return;
  if (!FART_KOMMANDO.test(chatTekst.value.trim())) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  chatTekst.value = "";
  fartSkift();
}, true);
