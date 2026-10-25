// =============================================================
//  Bannerets farve, pynt og dato 🎨
//  I Ejerpanel → Events og nyheder kan ejeren og Eventværter vælge:
//  - en farve til banneret
//  - pynt: stjerner, hjerter, balloner, blomster, konfetti, snefnug …
//  - en dato (og et klokkeslæt), og evt. en slutdato, hvis det varer flere dage.
//    Datoen står på banneret, og dagen efter (slut)datoen forsvinder banneret af sig selv.
//  Der kan være flere bannere i gang på én gang: de skifter hver 7. sekund, og prikkerne
//  under banneret viser, hvor mange der er. Spillerne kan lukke hvert banner med ✕.
//  (Kræver database-12-banner.sql for at alle kan se det.)
// =============================================================
const BANNER_FARVER = {
  groen: { navn: "Grøn", bg: "linear-gradient(#fffaf0, #fbf6ea 60%, #f1e9d2)", kant: "#4e7d4a", ring: "#9ccc8f", skygge: "#33562f", titel: "#3d6b39", under: "#55704f" },
  blaa: { navn: "Blå", bg: "linear-gradient(#f4faff, #e3f1fc)", kant: "#3d6f9e", ring: "#a9d1ee", skygge: "#2a4e70", titel: "#2c5a86", under: "#4b6f8f" },
  lilla: { navn: "Lilla", bg: "linear-gradient(#fbf6ff, #efe2fb)", kant: "#7a4fa8", ring: "#c9a8ea", skygge: "#4f2f73", titel: "#6a3d99", under: "#7d5b9e" },
  pink: { navn: "Pink", bg: "linear-gradient(#fff6fa, #fbe0ec)", kant: "#c9668b", ring: "#f2b3cb", skygge: "#8a3a58", titel: "#b24a74", under: "#a05a78" },
  roed: { navn: "Rød", bg: "linear-gradient(#fff5f3, #fbdcd6)", kant: "#c0392b", ring: "#f0a79e", skygge: "#7d231a", titel: "#a8302a", under: "#9a4a42" },
  orange: { navn: "Orange", bg: "linear-gradient(#fff9f0, #fde6c8)", kant: "#d9822b", ring: "#f5c48d", skygge: "#8f4f12", titel: "#b9661a", under: "#9a6a3a" },
  guld: { navn: "Guld", bg: "linear-gradient(#fffbea, #f8e6a8)", kant: "#b8901c", ring: "#f0d77a", skygge: "#7a5d0c", titel: "#8a6a10", under: "#7f6a32" },
  nat: { navn: "Nat", bg: "linear-gradient(#2d3b55, #1d2638)", kant: "#c9a8ea", ring: "#5b6f96", skygge: "#0f1522", titel: "#f4e9ff", under: "#cdd6ea" },
};
const BANNER_PYNT = {
  stjerner: { navn: "Stjerner", tegn: ["✦", "⭐"] },
  hjerter: { navn: "Hjerter", tegn: ["💖", "💕"] },
  balloner: { navn: "Balloner", tegn: ["🎈", "🎈"] },
  blomster: { navn: "Blomster", tegn: ["🌸", "🌼"] },
  konfetti: { navn: "Konfetti", tegn: ["🎉", "🎊"] },
  snefnug: { navn: "Snefnug", tegn: ["❄️", "⛄"] },
  kroner: { navn: "Kroner", tegn: ["👑", "✨"] },
  musik: { navn: "Musik", tegn: ["🎵", "🎶"] },
  kage: { navn: "Kage", tegn: ["🎂", "🧁"] },
  ingen: { navn: "Ingen", tegn: ["", ""] },
};
const UGEDAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

function dagTekst(dato, stort) {
  const d = new Date(dato + "T12:00:00");
  if (isNaN(d)) return "";
  const nu = new Date();
  const idag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate(), 12);
  const forskel = Math.round((d - idag) / 86400000);
  const t = forskel === 0 ? "i dag" : forskel === 1 ? "i morgen" : UGEDAGE[d.getDay()] + " d. " + d.getDate() + ". " + MAANEDER[d.getMonth()];
  return stort ? t[0].toUpperCase() + t.slice(1) : t;
}
function bannerDatoTekst(stil) {
  if (!stil || !stil.dato) return "";
  const fra = dagTekst(stil.dato, true);
  if (!fra) return "";
  const til = stil.til && stil.til > stil.dato ? dagTekst(stil.til, false) : "";
  return "📅 " + (til ? fra + " til " + til : fra) + (stil.kl ? " kl. " + stil.kl.replace(":", ".") : "");
}
// Er (slut)datoen gået? (banneret gælder hele dagen)
function bannerUdloebet(stil) {
  if (!stil || !stil.dato) return false;
  const slut = new Date((stil.til && stil.til > stil.dato ? stil.til : stil.dato) + "T23:59:59");
  return !isNaN(slut) && slut < new Date();
}


// -------------------------------------------------------------
//  Banneret øverst på skærmen
// -------------------------------------------------------------
const bannerDato = document.createElement("span");
bannerDato.id = "banner-dato";
document.getElementById("banner-under").after(bannerDato);

// Alle bannere, der er i gang lige nu (nyeste først). Bannere, hvis dato er gået, er væk.
function aktiveBannere() {
  return nyheder.filter(function (n) { return n.banner !== false && !bannerUdloebet(n.stil); }).reverse();
}
const BANNERE_LUKKET_NOEGLE = "mit-hotel-bannere-lukket";
function lukkedeBannere() {
  try { return JSON.parse(localStorage.getItem(BANNERE_LUKKET_NOEGLE) || "[]"); } catch (e) { return []; }
}
function synligeBannere() {
  const lukket = lukkedeBannere();
  return aktiveBannere().filter(function (n) { return lukket.indexOf(String(n.tid)) < 0; });
}
let bannerNr = 0;                // hvilket af de synlige bannere der vises
let bannerVist = null;           // tid på det banner, der står fremme
aktivtBanner = function () {
  const s = synligeBannere();
  return s.length ? s[Math.min(bannerNr, s.length - 1)] : null;
};

function malBanner(boks, stil, datoFelt) {
  const f = BANNER_FARVER[stil && stil.farve] || BANNER_FARVER.groen;
  const p = BANNER_PYNT[stil && stil.pynt] || BANNER_PYNT.stjerner;
  boks.style.background = f.bg;
  boks.style.borderColor = f.kant;
  boks.style.boxShadow = "0 0 0 3px " + f.ring + ", 0 6px 0 " + f.skygge + ", 0 14px 30px rgba(0, 0, 0, 0.35)";
  boks.style.setProperty("--banner-titel", f.titel);
  boks.style.setProperty("--banner-under", f.under);
  const pynt = boks.querySelectorAll(".banner-stjerne");
  if (pynt[0]) { pynt[0].textContent = p.tegn[0]; pynt[0].hidden = !p.tegn[0]; }
  if (pynt[1]) { pynt[1].textContent = p.tegn[1]; pynt[1].hidden = !p.tegn[1]; }
  if (datoFelt) { datoFelt.textContent = bannerDatoTekst(stil); datoFelt.hidden = !datoFelt.textContent; }
}

// Prikkerne under banneret (én pr. banner)
const bannerPrikker = document.createElement("div");
bannerPrikker.id = "banner-prikker";
bannerBoks.appendChild(bannerPrikker);

visBanner = function () {
  const synlige = synligeBannere();
  const aktive = aktiveBannere();
  if (bannerNr >= synlige.length) bannerNr = 0;
  const b = synlige[bannerNr] || null;
  bannerIgen.hidden = synlige.length === aktive.length;
  bannerIgen.title = bannerIgen.hidden ? "" : "Vis bannerne igen";
  if (!b) { bannerBoks.hidden = true; bannerVist = null; return; }
  document.getElementById("banner-titel").textContent = b.titel;
  document.getElementById("banner-under").textContent = b.tekst || "";
  malBanner(bannerBoks, b.stil, bannerDato);
  bannerPrikker.hidden = synlige.length < 2;
  bannerPrikker.innerHTML = synlige.length < 2 ? "" : synlige.map(function (n, i) {
    return "<button type='button' data-banner-nr='" + i + "'" + (i === bannerNr ? " class='valgt'" : "") + " title='" + rens(n.titel) + "'></button>";
  }).join("");
  bannerPrikker.querySelectorAll("[data-banner-nr]").forEach(function (k) {
    k.addEventListener("click", function () { bannerNr = +k.dataset.bannerNr; bannerSkiftTid = Date.now(); visBanner(); });
  });
  const nyt = bannerBoks.hidden || bannerVist !== b.tid;
  bannerBoks.hidden = false;
  bannerVist = b.tid;
  if (nyt) {
    bannerBoks.classList.remove("hop");
    void bannerBoks.offsetWidth;
    bannerBoks.classList.add("hop");
  }
};

// ✕ lukker kun det banner, man kigger på. 📢 viser dem alle igen.
document.getElementById("banner-luk").addEventListener("click", function (e) {
  e.stopImmediatePropagation();
  const b = aktivtBanner();
  if (b) {
    const lukket = lukkedeBannere().filter(function (t) {
      return nyheder.some(function (n) { return String(n.tid) === t; });     // ryd gamle væk
    });
    lukket.push(String(b.tid));
    try { localStorage.setItem(BANNERE_LUKKET_NOEGLE, JSON.stringify(lukket)); } catch (e2) {}
  }
  visBanner();
}, true);
bannerIgen.addEventListener("click", function (e) {
  e.stopImmediatePropagation();
  try { localStorage.removeItem(BANNERE_LUKKET_NOEGLE); localStorage.removeItem(BANNER_LUKKET_NOEGLE); } catch (e2) {}
  bannerNr = 0;
  visBanner();
}, true);

// Flere bannere skifter hver 7. sekund (men ikke mens musen er over banneret)
let bannerSkiftTid = Date.now();
let musOverBanner = false;
bannerBoks.addEventListener("mouseenter", function () { musOverBanner = true; });
bannerBoks.addEventListener("mouseleave", function () { musOverBanner = false; bannerSkiftTid = Date.now(); });
setInterval(function () {
  const synlige = synligeBannere();
  if (synlige.length > 1 && !musOverBanner && Date.now() - bannerSkiftTid > 7000) {
    bannerNr = (bannerNr + 1) % synlige.length;
    bannerSkiftTid = Date.now();
    visBanner();
  } else {
    // nye eller udløbne bannere
    const b = aktivtBanner();
    if ((b ? b.tid : null) !== bannerVist || bannerPrikker.children.length !== (synlige.length > 1 ? synlige.length : 0)) visBanner();
  }
}, 1000);
visBanner();


// -------------------------------------------------------------
//  Valgene i Events og nyheder
// -------------------------------------------------------------
let bsValg = { farve: "groen", pynt: "stjerner", dato: "", kl: "", til: "" };
let naesteStil = null;

const visEventsFoerStil = visEvents;
visEvents = function () {
  visEventsFoerStil();
  const send = document.getElementById("n-send");
  if (!send) return;
  const sek = document.createElement("div");
  sek.className = "bs-valg";
  sek.innerHTML =
    "<div class='bs-raekke'><span class='bs-lbl'>🎨 Farve</span><div class='bs-farver'>" + Object.keys(BANNER_FARVER).map(function (id) {
      const f = BANNER_FARVER[id];
      return "<button type='button' data-bs-farve='" + id + "' title='" + f.navn + "' style='background:" + f.kant + "'" + (id === bsValg.farve ? " class='valgt'" : "") + "></button>";
    }).join("") + "</div></div>" +
    "<div class='bs-raekke'><span class='bs-lbl'>✨ Pynt</span><div class='bs-pynt'>" + Object.keys(BANNER_PYNT).map(function (id) {
      const p = BANNER_PYNT[id];
      return "<button type='button' data-bs-pynt='" + id + "'" + (id === bsValg.pynt ? " class='valgt'" : "") + ">" + (p.tegn[0] || "🚫") + " " + p.navn + "</button>";
    }).join("") + "</div></div>" +
    "<div class='bs-raekke'><span class='bs-lbl'>📅 Fra</span><input id='bs-dato' type='date' value='" + bsValg.dato + "'>" +
    "<input id='bs-kl' type='time' value='" + bsValg.kl + "'></div>" +
    "<div class='bs-raekke'><span class='bs-lbl'>🏁 Til</span><input id='bs-til' type='date' value='" + bsValg.til + "'>" +
    "<small class='bs-hjaelp'>(kun hvis det varer flere dage)</small><button type='button' id='bs-ingen-dato' class='lille'>Ingen dato</button></div>" +
    "<p class='bs-hjaelp'>Datoen står på banneret, og dagen efter (slut)datoen forsvinder banneret af sig selv. Du kan have flere bannere i gang på én gang: de skifter på skærmen.</p>" +
    "<div class='bs-lbl'>👀 Sådan kommer banneret til at se ud</div>" +
    "<div class='bs-forhaand'><span class='banner-stjerne'></span><div class='banner-tekst'><b class='bs-titel'></b><span class='bs-under'></span><span class='bs-dato'></span></div><span class='banner-stjerne'></span></div>";
  send.before(sek);

  const titel = document.getElementById("n-titel"), tekst = document.getElementById("n-tekst");
  const forhaand = sek.querySelector(".bs-forhaand");
  function opdater() {
    forhaand.querySelector(".bs-titel").textContent = titel.value.trim() || "Din overskrift";
    forhaand.querySelector(".bs-under").textContent = tekst.value.trim();
    malBanner(forhaand, bsValg, forhaand.querySelector(".bs-dato"));
    sek.querySelectorAll("[data-bs-farve]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.bsFarve === bsValg.farve); });
    sek.querySelectorAll("[data-bs-pynt]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.bsPynt === bsValg.pynt); });
  }
  sek.querySelectorAll("[data-bs-farve]").forEach(function (k) {
    k.addEventListener("click", function () { bsValg.farve = k.dataset.bsFarve; opdater(); });
  });
  sek.querySelectorAll("[data-bs-pynt]").forEach(function (k) {
    k.addEventListener("click", function () { bsValg.pynt = k.dataset.bsPynt; opdater(); });
  });
  const dato = document.getElementById("bs-dato"), kl = document.getElementById("bs-kl"), til = document.getElementById("bs-til");
  dato.addEventListener("input", function () { bsValg.dato = dato.value; opdater(); });
  kl.addEventListener("input", function () { bsValg.kl = kl.value; opdater(); });
  til.addEventListener("input", function () { bsValg.til = til.value; opdater(); });
  document.getElementById("bs-ingen-dato").addEventListener("click", function () {
    bsValg.dato = ""; bsValg.kl = ""; bsValg.til = ""; dato.value = ""; kl.value = ""; til.value = ""; opdater();
  });
  titel.addEventListener("input", opdater);
  tekst.addEventListener("input", opdater);
  opdater();

  // Lige før nyheden gemmes, husker vi stilen, så den kommer med
  send.addEventListener("click", function () {
    naesteStil = { farve: bsValg.farve, pynt: bsValg.pynt };
    if (bsValg.dato) {
      naesteStil.dato = bsValg.dato;
      if (bsValg.kl) naesteStil.kl = bsValg.kl;
      if (bsValg.til && bsValg.til > bsValg.dato) naesteStil.til = bsValg.til;
    }
  }, true);

  // Udsendte nyheder: vis farve, pynt og dato ud for hver
  const nyListe = Array.prototype.slice.call(ejerIndhold.querySelectorAll("[data-banner]"));
  nyListe.forEach(function (k) {
    const n = nyheder[+k.dataset.banner];
    if (!n || !n.stil) return;
    const f = BANNER_FARVER[n.stil.farve] || BANNER_FARVER.groen, p = BANNER_PYNT[n.stil.pynt] || BANNER_PYNT.stjerner;
    const m = document.createElement("span");
    m.className = "bs-maerke";
    m.innerHTML = "<i style='background:" + f.kant + "'></i>" + (p.tegn[0] || "") + " " + rens(bannerDatoTekst(n.stil)) +
      (bannerUdloebet(n.stil) ? " <em>(dato gået)</em>" : "");
  });
  // Hvilke bannere er i gang lige nu?
  const aktive = aktiveBannere();
  nyListe.forEach(function (k) {
    const n = nyheder[+k.dataset.banner];
    if (!n) return;
    const m = document.createElement("span");
    const kører = aktive.indexOf(n) >= 0;
    m.className = "bs-status " + (kører ? "aktiv" : n.banner === false ? "slukket" : "slut");
    m.textContent = kører ? "🟢 Vises nu" : n.banner === false ? "⚪ Ikke banner" : "⏹ Slut";
    k.parentNode.insertBefore(m, k.parentNode.firstChild);
    k.parentNode.insertBefore(m, k);
  });
};

// Den nye nyhed får stilen med (før den sendes til serveren)
const gemListeFoerStil = gemListe;
gemListe = function (noegle, liste, maks) {
  if (noegle === NYHED_NOEGLE && naesteStil && liste.length) {
    const n = liste[liste.length - 1];
    if (!n.sid && !n.stil) n.stil = naesteStil;
    naesteStil = null;
  }
  gemListeFoerStil(noegle, liste, maks);
};


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const bsStil = document.createElement("style");
bsStil.textContent =
  "#banner-titel { color: var(--banner-titel, #3d6b39); }" +
  "#banner-under { color: var(--banner-under, #55704f); }" +
  "#banner-dato { font-size: 13px; font-weight: 700; color: var(--banner-under, #55704f); }" +
  "#banner-dato[hidden], .banner-stjerne[hidden], #banner-prikker[hidden] { display: none; }" +
  "#banner { flex-wrap: wrap; justify-content: center; }" +
  "#banner-prikker { flex-basis: 100%; display: flex; justify-content: center; gap: 6px; margin-top: -4px; }" +
  "#banner-prikker button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--banner-under, #55704f); opacity: 0.35; cursor: pointer; }" +
  "#banner-prikker button.valgt { opacity: 1; transform: scale(1.25); }" +
  ".bs-status { display: inline-block !important; margin-right: 6px; padding: 1px 7px; border-radius: 9px; font: bold 11px Verdana, sans-serif; }" +
  ".bs-status.aktiv { background: #9ccc8f; color: #1f3a1c; }" +
  ".bs-status.slut { background: #eee6d2; color: #8a7a5a; }" +
  ".bs-status.slukket { background: #eef1e8; color: #7a8a76; }" +
  ".bs-valg { margin: 4px 0 12px; padding: 10px; background: #fff; border: 2px solid #d6e8c8; border-radius: 10px; }" +
  ".bs-raekke { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 8px; }" +
  ".bs-lbl { font: bold 12px Verdana, sans-serif; color: #3d6b39; min-width: 64px; }" +
  ".bs-farver, .bs-pynt { display: flex; flex-wrap: wrap; gap: 5px; }" +
  ".bs-farver button { width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 1px #c9d6c0; cursor: pointer; padding: 0; }" +
  ".bs-farver button.valgt { box-shadow: 0 0 0 3px #33402c; }" +
  ".bs-pynt button { padding: 4px 8px; border: 1px solid #d6e8c8; border-radius: 14px; background: #fbf6ea; color: #33402c; font: 12px Verdana, sans-serif; cursor: pointer; }" +
  ".bs-pynt button.valgt { background: #4e7d4a; border-color: #4e7d4a; color: #fff; }" +
  ".bs-raekke input[type=date], .bs-raekke input[type=time] { padding: 4px 6px; border: 1px solid #c9d6c0; border-radius: 6px; font: 13px Verdana, sans-serif; }" +
  ".bs-hjaelp { margin: 0 0 8px; color: #7a8a76; font-size: 11px; }" +
  ".bs-forhaand { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 6px; padding: 10px 16px; border: 3px solid #4e7d4a; border-radius: 16px; text-align: center; }" +
  ".bs-forhaand .banner-tekst { display: flex; flex-direction: column; gap: 2px; min-width: 0; }" +
  ".bs-forhaand .bs-titel { font: 800 20px 'Poppins', 'Trebuchet MS', sans-serif; color: var(--banner-titel); overflow-wrap: anywhere; }" +
  ".bs-forhaand .bs-under, .bs-forhaand .bs-dato { font-size: 13px; font-weight: 700; color: var(--banner-under); }" +
  ".bs-forhaand .bs-under:empty, .bs-forhaand .bs-dato[hidden] { display: none; }" +
  ".bs-maerke { display: inline-flex !important; align-items: center; gap: 4px; margin: 2px 6px 2px 0; font-size: 11px; color: #55624f; }" +
  ".bs-maerke i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }" +
  ".bs-maerke em { color: #a0521a; }";
document.head.appendChild(bsStil);
