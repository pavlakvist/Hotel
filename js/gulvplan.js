// =============================================================
//  Gulvplan 🧱  — skriv :floor i chatten
//  Her kan du tegne dit rum om: gøre det større, give det en
//  ny form, sætte væggene højere og sætte døren hvor du vil.
//  Virker i dine egne rum (ejeren af hotellet må i alle rum).
// =============================================================
const GULVPLAN_KOMMANDO = /^[:：]\s*floor$/i;
const GP_MIN = 4, GP_MAKS = 24;               // rummets mindste og største mål
const GP_VAEG_MIN = 60, GP_VAEG_MAKS = 240;   // væggens højde

const gpVindue = document.createElement("div");
gpVindue.id = "gulvplan";
gpVindue.hidden = true;
gpVindue.innerHTML =
  '<div class="gp-top"><b>🧱 Gulvplan <span id="gp-rum"></span></b><button type="button" id="gp-luk" title="Luk">✕</button></div>' +
  '<div class="gp-krop">' +
  '  <div class="gp-vaerktoej">' +
  '    <button type="button" data-vaerk="tegn" class="valgt">🟩 Tegn gulv</button>' +
  '    <button type="button" data-vaerk="slet">⬜ Slet gulv</button>' +
  '    <button type="button" data-vaerk="doer">🚪 Sæt dør</button>' +
  '  </div>' +
  '  <canvas id="gp-tegning" width="600" height="330"></canvas>' +
  '  <p id="gp-hjaelp" class="gp-hjaelp"></p>' +
  '  <div class="gp-maal">' +
  '    <label>Bredde <input id="gp-bredde" type="number" min="' + GP_MIN + '" max="' + GP_MAKS + '"></label>' +
  '    <label>Dybde <input id="gp-dybde" type="number" min="' + GP_MIN + '" max="' + GP_MAKS + '"></label>' +
  '    <label class="gp-vaeg">Væggens højde <input id="gp-vaeg" type="range" min="' + GP_VAEG_MIN + '" max="' + GP_VAEG_MAKS + '" step="10"> <span id="gp-vaeg-tal"></span></label>' +
  '  </div>' +
  '  <div class="gp-knapper">' +
  '    <button type="button" id="gp-fyld">Fyld alt</button>' +
  '    <button type="button" id="gp-ryd">Ryd alt</button>' +
  '    <span class="gp-luft"></span>' +
  '    <button type="button" id="gp-annuller">Annuller</button>' +
  '    <button type="button" id="gp-gem" class="gp-gem">💾 Gem</button>' +
  '  </div>' +
  '</div>';
document.body.appendChild(gpVindue);
goerFlytbar(gpVindue, gpVindue.querySelector(".gp-top"), "mit-hotel-flyt-gulvplan");

const gpTegning = document.getElementById("gp-tegning");
const gpCtx = gpTegning.getContext("2d");
const gpHjaelp = document.getElementById("gp-hjaelp");
const gpBredde = document.getElementById("gp-bredde");
const gpDybde = document.getElementById("gp-dybde");
const gpVaeg = document.getElementById("gp-vaeg");

// Planen, mens man tegner: felter[y][x] = true når der er gulv
let gp = null;
let gpVaerk = "tegn";
let gpMaler = null;        // true = tegner gulv, false = sletter, mens musen holdes nede

function gpHjaelpTekst(tekst, fejl) {
  gpHjaelp.textContent = tekst;
  gpHjaelp.classList.toggle("fejl", !!fejl);
}

// Må man ændre rummet, man står i?
function maaRetteRum() {
  if (rumValg !== "vaerelse") return false;
  if (EJERE.indexOf(FIGUR.navn) >= 0) return true;
  if (aktivtVaerelse === "mit") return true;
  const info = vaerelseInfo(aktivtVaerelse);
  return !info.ejer || info.ejer === FIGUR.navn;
}

function aabnGulvplan() {
  const felter = [];
  for (let y = 0; y < RUM.dybde; y++) {
    felter.push([]);
    for (let x = 0; x < RUM.bredde; x++) felter[y].push(erIRummet(x, y));
  }
  gp = {
    bredde: RUM.bredde,
    dybde: RUM.dybde,
    felter: felter,
    vaegHoejde: RUM.vaegHoejde || VAEG_HOEJDE,
    doer: RUM.doer ? { x: RUM.doer.x, y: RUM.doer.y } : null,
  };
  document.getElementById("gp-rum").textContent = "– " + vaerelseNavn(aktivtVaerelse);
  gpBredde.value = gp.bredde;
  gpDybde.value = gp.dybde;
  gpVaeg.value = gp.vaegHoejde;
  document.getElementById("gp-vaeg-tal").textContent = gp.vaegHoejde;
  vaelgVaerk("tegn");
  gpVindue.hidden = false;
  tegnGulvplan();
}

function lukGulvplan() {
  gpVindue.hidden = true;
  gp = null;
  gpMaler = null;
}

function vaelgVaerk(vaerk) {
  gpVaerk = vaerk;
  gpVindue.querySelectorAll("[data-vaerk]").forEach(function (k) {
    k.classList.toggle("valgt", k.dataset.vaerk === vaerk);
  });
  gpHjaelpTekst(vaerk === "doer"
    ? "Klik på et gulvfelt ude ved væggen (venstre væg eller bagvæggen) for at sætte døren."
    : vaerk === "slet" ? "Klik eller træk hen over gulvet for at fjerne felter."
    : "Klik eller træk for at tegne gulv. Gør rummet større med Bredde og Dybde.");
}

function gpGulv(x, y) {
  return x >= 0 && y >= 0 && x < gp.bredde && y < gp.dybde && gp.felter[y][x];
}

// Døren skal stå ved en væg: yderst til venstre i sin række eller bagerst i sin kolonne
function vedVaeg(x, y) {
  if (!gpGulv(x, y)) return false;
  let venstre = true, bagerst = true;
  for (let i = 0; i < x; i++) if (gp.felter[y][i]) venstre = false;
  for (let i = 0; i < y; i++) if (gp.felter[i][x]) bagerst = false;
  return venstre || bagerst;
}

// Ændr rummets mål. Nye felter får gulv, så rummet bliver større.
function gpNyeMaal(b, d) {
  b = Math.max(GP_MIN, Math.min(GP_MAKS, b || gp.bredde));
  d = Math.max(GP_MIN, Math.min(GP_MAKS, d || gp.dybde));
  const nye = [];
  for (let y = 0; y < d; y++) {
    nye.push([]);
    for (let x = 0; x < b; x++) nye[y].push(y < gp.dybde && x < gp.bredde ? gp.felter[y][x] : true);
  }
  gp.bredde = b;
  gp.dybde = d;
  gp.felter = nye;
  if (gp.doer && !vedVaeg(gp.doer.x, gp.doer.y)) gp.doer = null;
  gpBredde.value = b;
  gpDybde.value = d;
  tegnGulvplan();
}


// -------------------------------------------------------------
//  Tegn planen skråt ovenfra, ligesom rummet
// -------------------------------------------------------------
function gpMaalestok() {
  const fw = Math.min(44, Math.floor((gpTegning.width - 20) * 2 / (gp.bredde + gp.dybde)));
  const fh = fw / 2;
  const hoejde = (gp.bredde + gp.dybde) * fh / 2;
  return {
    fw: fw, fh: fh,
    ox: gpTegning.width / 2 + (gp.dybde - gp.bredde) * fw / 4,
    oy: (gpTegning.height - hoejde) / 2,
  };
}
function gpPunkt(m, x, y) {
  return { x: m.ox + (x - y) * m.fw / 2, y: m.oy + (x + y) * m.fh / 2 };
}
function gpFelt(e) {
  const r = gpTegning.getBoundingClientRect();
  const sx = (e.clientX - r.left) * gpTegning.width / r.width;
  const sy = (e.clientY - r.top) * gpTegning.height / r.height;
  const m = gpMaalestok();
  const a = (sx - m.ox) / (m.fw / 2);
  const b = (sy - m.oy) / (m.fh / 2);
  const x = Math.floor((a + b) / 2), y = Math.floor((b - a) / 2);
  if (x < 0 || y < 0 || x >= gp.bredde || y >= gp.dybde) return null;
  return { x: x, y: y };
}

function tegnGulvplan() {
  if (!gp) return;
  const m = gpMaalestok();
  gpCtx.clearRect(0, 0, gpTegning.width, gpTegning.height);
  for (let y = 0; y < gp.dybde; y++) {
    for (let x = 0; x < gp.bredde; x++) {
      const p = [gpPunkt(m, x, y), gpPunkt(m, x + 1, y), gpPunkt(m, x + 1, y + 1), gpPunkt(m, x, y + 1)];
      gpCtx.beginPath();
      p.forEach(function (q, i) { if (i) gpCtx.lineTo(q.x, q.y); else gpCtx.moveTo(q.x, q.y); });
      gpCtx.closePath();
      if (gp.felter[y][x]) {
        gpCtx.fillStyle = (x + y) % 2 ? RUM.gulvFarve2 : RUM.gulvFarve1;
        gpCtx.fill();
        gpCtx.strokeStyle = "rgba(0,0,0,0.25)";
      } else {
        gpCtx.strokeStyle = "rgba(78,125,74,0.35)";
      }
      gpCtx.lineWidth = 1;
      gpCtx.stroke();
    }
  }
  // væggene langs venstre side og bagved, så man kan se hvor døren kan stå
  const vh = Math.max(8, gp.vaegHoejde / 10);
  for (let y = 0; y < gp.dybde; y++) for (let x = 0; x < gp.bredde; x++) {
    if (!gp.felter[y][x]) continue;
    let venstre = true, bagerst = true;
    for (let i = 0; i < x; i++) if (gp.felter[y][i]) venstre = false;
    for (let i = 0; i < y; i++) if (gp.felter[i][x]) bagerst = false;
    if (venstre) gpVaegStykke(gpPunkt(m, x, y + 1), gpPunkt(m, x, y), vh);
    if (bagerst) gpVaegStykke(gpPunkt(m, x, y), gpPunkt(m, x + 1, y), vh);
  }
  // døren
  if (gp.doer) {
    const c = gpPunkt(m, gp.doer.x + 0.5, gp.doer.y + 0.5);
    gpCtx.font = Math.round(m.fw * 0.6) + "px sans-serif";
    gpCtx.textAlign = "center";
    gpCtx.textBaseline = "middle";
    gpCtx.fillText("🚪", c.x, c.y);
  }
}
function gpVaegStykke(a, b, vh) {
  gpCtx.beginPath();
  gpCtx.moveTo(a.x, a.y); gpCtx.lineTo(b.x, b.y);
  gpCtx.lineTo(b.x, b.y - vh); gpCtx.lineTo(a.x, a.y - vh);
  gpCtx.closePath();
  gpCtx.fillStyle = RUM.vaegFarve;
  gpCtx.globalAlpha = 0.75;
  gpCtx.fill();
  gpCtx.globalAlpha = 1;
}


// -------------------------------------------------------------
//  Tegn med musen
// -------------------------------------------------------------
function gpMal(f) {
  if (!f || gp.felter[f.y][f.x] === gpMaler) return;
  gp.felter[f.y][f.x] = gpMaler;
  if (gp.doer && !vedVaeg(gp.doer.x, gp.doer.y)) {
    gp.doer = null;
    gpHjaelpTekst("Døren stod ikke længere ved en væg, så den blev fjernet. Sæt den igen med 🚪.", true);
  }
  tegnGulvplan();
}
gpTegning.addEventListener("mousedown", function (e) {
  if (!gp || e.button !== 0) return;
  e.preventDefault();
  const f = gpFelt(e);
  if (gpVaerk === "doer") {
    if (!f) return;
    if (!vedVaeg(f.x, f.y)) { gpHjaelpTekst("Døren skal stå på et gulvfelt helt ude ved væggen (venstre væg eller bagvæggen).", true); return; }
    gp.doer = { x: f.x, y: f.y };
    gpHjaelpTekst("🚪 Døren er sat. Her kommer man ind i rummet.");
    tegnGulvplan();
    return;
  }
  gpMaler = gpVaerk === "tegn";
  gpMal(f);
});
gpTegning.addEventListener("mousemove", function (e) {
  if (gp && gpMaler !== null) gpMal(gpFelt(e));
});
window.addEventListener("mouseup", function () { gpMaler = null; });

gpVindue.querySelectorAll("[data-vaerk]").forEach(function (k) {
  k.addEventListener("click", function () { vaelgVaerk(k.dataset.vaerk); });
});
gpBredde.addEventListener("change", function () { gpNyeMaal(parseInt(gpBredde.value, 10), gp.dybde); });
gpDybde.addEventListener("change", function () { gpNyeMaal(gp.bredde, parseInt(gpDybde.value, 10)); });
gpVaeg.addEventListener("input", function () {
  gp.vaegHoejde = parseInt(gpVaeg.value, 10);
  document.getElementById("gp-vaeg-tal").textContent = gp.vaegHoejde;
  tegnGulvplan();
});
document.getElementById("gp-fyld").addEventListener("click", function () {
  gp.felter.forEach(function (r) { r.fill(true); });
  tegnGulvplan();
});
document.getElementById("gp-ryd").addEventListener("click", function () {
  gp.felter.forEach(function (r) { r.fill(false); });
  gp.doer = null;
  tegnGulvplan();
});
document.getElementById("gp-luk").addEventListener("click", lukGulvplan);
document.getElementById("gp-annuller").addEventListener("click", lukGulvplan);
window.addEventListener("keydown", function (e) { if (e.key === "Escape" && !gpVindue.hidden) lukGulvplan(); });


// -------------------------------------------------------------
//  Gem planen på rummet
// -------------------------------------------------------------
document.getElementById("gp-gem").addEventListener("click", function () {
  if (!gp.felter.some(function (r) { return r.indexOf(true) >= 0; })) {
    gpHjaelpTekst("Rummet skal have mindst ét gulvfelt.", true);
    return;
  }
  const felter = gp.felter.map(function (r) { return r.map(function (f) { return f ? "x" : "."; }).join(""); });
  const form = feltForm(felter);

  // møbler der kommer til at stå uden for gulvet, lægges i Mine ting
  let iLager = 0;
  moeblerIRummet = moeblerIRummet.filter(function (mb) {
    const inde = mb.x < gp.bredde && mb.y < gp.dybde && form(mb.x, mb.y);
    if (!inde) { tilLager(mb.type); iLager++; }
    return inde;
  });
  gem();

  const plan = { felter: felter, bredde: gp.bredde, dybde: gp.dybde, vaegHoejde: gp.vaegHoejde, doer: gp.doer };
  const info = vaerelseInfo(aktivtVaerelse);
  Object.assign(info, plan);
  if (aktivtVaerelse === "mit") {
    try { localStorage.setItem("mit-hotel-rum-plan", JSON.stringify(plan)); } catch (e) {}
  } else {
    gemMineRum();
  }

  lukGulvplan();
  gaaTilVaerelse(aktivtVaerelse);   // gå ind i rummet igen, så det bliver tegnet på ny
  besked.textContent = "🧱 Gulvplanen er gemt!" + (iLager ? " " + iLager + " møbel" + (iLager > 1 ? "er" : "") + " stod uden for gulvet og ligger nu i Mine ting." : "");
});


// -------------------------------------------------------------
//  Kommandoen :floor i chatten
// -------------------------------------------------------------
document.addEventListener("submit", function (e) {
  if (e.target !== chatForm) return;
  if (!GULVPLAN_KOMMANDO.test(chatTekst.value.trim())) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  chatTekst.value = "";
  if (rumValg !== "vaerelse") { besked.textContent = "Gulvplanen virker kun i rum, ikke i velkomsthallen."; return; }
  if (!maaRetteRum()) { besked.textContent = "Gulvplanen virker kun i dine egne rum."; return; }
  aabnGulvplan();
}, true);
