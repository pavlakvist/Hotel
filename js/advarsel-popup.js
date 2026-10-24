// =============================================================
//  Advarsel på skærmen ⚠️
//  Når ejeren advarer nogen, dukker advarslen op midt på deres skærm.
//  - Er det en profil på denne computer, ser de den, næste gang de logger ind.
//  - Er det en computer-gæst, ser ejeren en forhåndsvisning af, hvordan den ser ud.
//  (Rigtige spillere på andre computere kræver en server.)
// =============================================================
const ADVARSEL_POPUP_NOEGLE = "mit-hotel-advarsler";

function hentAdvarsler() {
  try { return JSON.parse(localStorage.getItem(ADVARSEL_POPUP_NOEGLE) || "[]"); } catch (e) { return []; }
}
function gemAdvarsler(liste) {
  try { localStorage.setItem(ADVARSEL_POPUP_NOEGLE, JSON.stringify(liste.slice(-100))); } catch (e) {}
}

const advarselBoks = document.createElement("div");
advarselBoks.id = "advarsel-popup";
advarselBoks.hidden = true;
advarselBoks.innerHTML =
  "<div class='ap-boks' role='alertdialog' aria-labelledby='ap-titel'>" +
  "<p id='ap-forhaand' class='ap-forhaand' hidden></p>" +
  "<div class='ap-ikon'>⚠️</div>" +
  "<h2 id='ap-titel'>Du har fået en advarsel</h2>" +
  "<p id='ap-grund' class='ap-grund'></p>" +
  "<p id='ap-info' class='ap-info'></p>" +
  "<div class='ap-knapper'><button type='button' id='ap-svar'>💬 Svar</button><button type='button' id='ap-ok'>OK, forstået</button></div>" +
  "</div>";
document.body.appendChild(advarselBoks);

let visesNu = null;

function visAdvarselPopup(a, forhaand) {
  visesNu = a;
  const f = document.getElementById("ap-forhaand");
  f.hidden = !forhaand;
  f.textContent = forhaand ? "👁 Sådan ser " + a.til + " det på sin skærm" : "";
  document.getElementById("ap-titel").textContent = forhaand ? a.til + " har fået en advarsel" : "Du har fået en advarsel";
  document.getElementById("ap-grund").textContent = a.grund ? "Grund: " + a.grund : "Husk hotellets regler.";
  document.getElementById("ap-info").textContent = "Fra " + a.fra + " · gælder i " + a.varighed;
  document.getElementById("ap-svar").hidden = !!forhaand;
  advarselBoks.hidden = false;
  document.getElementById("ap-ok").focus();
}

function lukAdvarselPopup() {
  advarselBoks.hidden = true;
  if (visesNu && visesNu.til === FIGUR.navn) {
    const liste = hentAdvarsler();
    liste.forEach(function (a) { if (a.tid === visesNu.tid && a.til === visesNu.til) a.set = true; });
    gemAdvarsler(liste);
  }
  visesNu = null;
  setTimeout(tjekAdvarsler, 300);
}

// Kaldes fra sendAdvarsel i js/beskeder.js
function nyAdvarselPopup(til, grund, varighed) {
  const a = { til: til, fra: FIGUR.navn, grund: grund, varighed: varighed, tid: Date.now(), set: false };
  const liste = hentAdvarsler();
  liste.push(a);
  gemAdvarsler(liste);
  // ejeren ser, hvordan det ser ud hos den anden
  setTimeout(function () { visAdvarselPopup(a, true); }, 400);
}

// Har den, der er logget ind, en advarsel, som de ikke har set endnu?
function tjekAdvarsler() {
  if (!advarselBoks.hidden) return;
  const ny = hentAdvarsler().find(function (a) { return a.til === FIGUR.navn && !a.set; });
  if (ny) visAdvarselPopup(ny, false);
}

document.getElementById("ap-ok").addEventListener("click", lukAdvarselPopup);
document.getElementById("ap-svar").addEventListener("click", function () {
  const fra = visesNu && visesNu.fra;
  lukAdvarselPopup();
  if (fra && typeof aabnBeskeder === "function") aabnBeskeder(fra);
});

setTimeout(tjekAdvarsler, 1200);
setInterval(tjekAdvarsler, 5000);
