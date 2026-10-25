// =============================================================
//  Spillerkortet 🪪 — klik på dig selv eller en anden spiller
//  Et lille grønt/creme kort med navn, figur, skilt, motto, likes
//  og hvem der har sat ❤ hjerte og 🙂 smiley på spilleren.
//  I klikmenuen kan man sætte ❤ og 🙂 på andre og fjerne dem igen med ✕.
//  (Kræver database-11-spillerkort.sql. Computer-gæsterne gemmes kun på computeren.)
// =============================================================
const FORHOLD = {
  hjerte: { tegn: "❤️", navn: "Hjerte" },
  smiley: { tegn: "🙂", navn: "Smiley" },
};
const FORHOLD_NOEGLE = "mit-hotel-forhold";     // computer-gæsterne: { navn: { hjerte: true, smiley: true } }

// Computer-gæsterne har lidt fra hinanden i forvejen, så kortet ikke er tomt
const GAEST_FORHOLD = {
  Ida: { hjerte: ["Freja"], smiley: ["Noah", "Oliver"] },
  Noah: { hjerte: ["Ida"], smiley: ["Oliver"] },
  Freja: { hjerte: ["Ida", "Oliver"], smiley: [] },
  Oliver: { hjerte: [], smiley: ["Noah", "Freja", "Ida"] },
};
const GAEST_MOTTO = {
  Ida: "Elsker hyggelige sofaer 🛋️",
  Noah: "Altid klar til en snak",
  Freja: "Dans er livet 💃",
  Oliver: "Bygger det flotteste rum en dag",
};

let mineGaestForhold = {};
try { mineGaestForhold = JSON.parse(localStorage.getItem(FORHOLD_NOEGLE) || "{}"); } catch (e) {}
function gemGaestForhold() {
  try { localStorage.setItem(FORHOLD_NOEGLE, JSON.stringify(mineGaestForhold)); } catch (e) {}
}

const kortSvar = {};          // navn → svar fra serveren (null = ingen profil, false = database-11 mangler)
const kortLikes = {};         // navn → antal likes


// -------------------------------------------------------------
//  Hvem har sat hvad?
// -------------------------------------------------------------
function forholdListe(navn, slags) {
  if (erComputerGaest(navn)) {
    const liste = ((GAEST_FORHOLD[navn] || {})[slags] || []).slice();
    if (mineGaestForhold[navn] && mineGaestForhold[navn][slags]) liste.unshift(FIGUR.navn);
    return liste;
  }
  const s = kortSvar[navn];
  return s ? (s[slags] || []).slice() : [];
}
function harSat(navn, slags) {
  return forholdListe(navn, slags).indexOf(FIGUR.navn) >= 0;
}

// "Ida", "Ida og Noah", "Ida og 2 andre" (dig selv står først som "Du")
function navneTekst(liste) {
  const navne = liste.slice();
  const i = navne.indexOf(FIGUR.navn);
  if (i >= 0) { navne.splice(i, 1); navne.unshift("Du"); }
  if (!navne.length) return "";
  if (navne.length === 1) return navne[0];
  if (navne.length === 2) return navne[0] + " og " + navne[1];
  return navne[0] + " og " + (navne.length - 1) + " andre";
}

function hentKort(navn) {
  if (erComputerGaest(navn)) {
    kortLikes[navn] = likes.antal[navn] || 0;
    visKort();
    return;
  }
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_spillerkort", { p_token: token, p_navn: navn }).then(function (svar) {
    kortSvar[navn] = svar;
    if (navn === FIGUR.navn && svar && svar.motto && !profilMotto.value) profilMotto.value = svar.motto;
    if (kortNavn === navn) visKort();
  }).catch(function () {
    kortSvar[navn] = false;      // database-11-spillerkort.sql er ikke kørt endnu
    if (kortNavn === navn) visKort();
  });
  serverKald("hv_like_info", { p_token: token, p_navn: navn }).then(function (svar) {
    kortLikes[navn] = svar.antal;
    if (kortNavn === navn) visKort();
  }).catch(function () {});
}

function saetForhold(navn, slags, til) {
  if (navn === FIGUR.navn) return;
  if (erComputerGaest(navn)) {
    mineGaestForhold[navn] = mineGaestForhold[navn] || {};
    if (til) mineGaestForhold[navn][slags] = true; else delete mineGaestForhold[navn][slags];
    gemGaestForhold();
    efterForhold(navn, slags, til);
    return;
  }
  const s = kortSvar[navn];
  serverKald("hv_forhold_saet", { p_token: mitToken(), p_navn: navn, p_slags: slags, p_til: til }).then(function () {
    if (s) {
      s[slags] = (s[slags] || []).filter(function (n) { return n !== FIGUR.navn; });
      if (til) s[slags].unshift(FIGUR.navn);
    }
    efterForhold(navn, slags, til);
    hentKort(navn);
  }).catch(function (e) {
    besked.textContent = /hv_forhold/.test(e.message) ? "❤️ og 🙂 virker, når database-11-spillerkort.sql er kørt i Supabase." : e.message;
  });
}

function efterForhold(navn, slags, til) {
  const f = FORHOLD[slags];
  const g = ANDRE_SPILLERE[navn] || HAL_GAESTER.find(function (x) { return x.navn === navn; });
  if (til && g) svaev(f.tegn, g);
  besked.textContent = til ? "Du har sat " + f.tegn + " på " + navn + "." : "Du har fjernet dit " + f.tegn + " fra " + navn + ".";
  if (kortNavn === navn) visKort();
  if (!minMenu.hidden && menuHvem && menuHvem.navn === navn) visForholdKnapper(menuHvem);
}


// -------------------------------------------------------------
//  Selve kortet
// -------------------------------------------------------------
const spKort = document.createElement("div");
spKort.id = "spillerkort";
spKort.hidden = true;
spKort.innerHTML =
  "<div class='sk-top'><span class='sk-navn'></span><button type='button' class='sk-luk' title='Luk'>✕</button></div>" +
  "<div class='sk-midt'><canvas class='sk-figur' width='110' height='150'></canvas><div class='sk-skilte'></div></div>" +
  "<div class='sk-raekker'></div>";
document.body.appendChild(spKort);
goerFlytbar(spKort, spKort.querySelector(".sk-top"), "mit-hotel-flyt-spillerkort");

let kortNavn = null;          // hvis spKort der vises
let kortValg = null;          // figurens udseende

function aabnKort(navn, valg) {
  kortNavn = navn;
  kortValg = valg;
  spKort.hidden = false;
  visKort();
  hentKort(navn);
}
function lukKort() {
  spKort.hidden = true;
  kortNavn = null;
}
spKort.querySelector(".sk-luk").addEventListener("click", lukKort);
window.addEventListener("keydown", function (e) { if (e.key === "Escape") lukKort(); });

function tegnKortFigur() {
  if (spKort.hidden || !kortValg) return;
  const lille = spKort.querySelector(".sk-figur");
  const c = lille.getContext("2d");
  c.clearRect(0, 0, lille.width, lille.height);
  const skala = Math.min(1.5, (lille.height - 16) / figurHoejde(kortValg));
  c.save();
  c.translate(lille.width / 2, lille.height - 10);
  c.scale(skala, skala);
  c.beginPath();
  c.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.2)";
  c.fill();
  try { tegnMenneske(c, 0, 0, kortValg, "ned", null, null); } catch (e) {}
  c.restore();
}
setInterval(tegnKortFigur, 700);     // billederne kan komme lidt efter, og udseendet kan skifte

function visKort() {
  if (spKort.hidden || !kortNavn) return;
  const navn = kortNavn;
  const mig = navn === FIGUR.navn;
  if (mig) kortValg = garderobe;
  spKort.querySelector(".sk-navn").textContent = "🪪 " + navn;

  // skilte: EJER, eller det skilt spilleren er ansat med
  let skilte = "";
  if (EJERE.indexOf(navn) >= 0) skilte += "<img src='billeder/skilt-ejer.png' alt='EJER' title='Ejer af hotellet'>";
  const sk = typeof rolleSkilt === "function" ? rolleSkilt(navn) : null;
  if (sk) {
    const kan = typeof jobKan === "function" ? jobKan(sk.id) : [];
    skilte += "<img src='" + sk.fil + "' alt='" + rens(sk.navn) + "' title='" + rens(sk.navn + (kan.length ? "\n" + kan.join("\n") : "")) + "'>" +
      "<span class='sk-job' title='" + rens(kan.join("\n")) + "'><b>" + rens(sk.navn) + "</b>" + rens(sk.tekst) + "</span>";
  }
  spKort.querySelector(".sk-skilte").innerHTML = skilte;

  const svar = kortSvar[navn];
  const motto = mig ? profilMotto.value.trim() : erComputerGaest(navn) ? GAEST_MOTTO[navn] || "" : svar ? svar.motto : "";
  let html = "<p class='sk-motto'>✏️ " + (motto ? rens(motto) : "<i>Intet motto endnu</i>") + "</p>";
  if (kortLikes[navn] !== undefined) html += "<p class='sk-baand sk-likes'>👍 Likes: " + kortLikes[navn].toLocaleString("da-DK") + "</p>";
  if (svar && svar.foedselsdag && typeof datoTekst === "function") html += "<p class='sk-baand sk-fd'>🎂 " + datoTekst(svar.foedselsdag) + "</p>";

  const mangler = !erComputerGaest(navn) && svar === false;
  Object.keys(FORHOLD).forEach(function (slags) {
    const f = FORHOLD[slags];
    const liste = forholdListe(navn, slags);
    const tekst = navneTekst(liste);
    const sat = !mig && harSat(navn, slags);
    html += "<div class='sk-forhold sk-" + slags + "' title='" + rens(liste.join(", ")) + "'>" +
      "<span class='sk-tegn'>" + f.tegn + "</span>" +
      "<span class='sk-hvem'>" + (mangler ? "<i>Virker, når database-11 er kørt</i>" : tekst ? rens(tekst) : "<i>Ingen endnu</i>") + "</span>" +
      (sat ? "<button type='button' class='sk-x' data-fjern='" + slags + "' title='Fjern dit " + f.navn.toLowerCase() + "'>✕</button>" : "") +
      (!mig && !sat && !mangler ? "<button type='button' class='sk-plus' data-saet='" + slags + "' title='Sæt " + f.navn.toLowerCase() + "'>+</button>" : "") +
      "</div>";
  });
  const raekker = spKort.querySelector(".sk-raekker");
  raekker.innerHTML = html;
  raekker.querySelectorAll("[data-fjern]").forEach(function (k) {
    k.addEventListener("click", function () { saetForhold(navn, k.dataset.fjern, false); });
  });
  raekker.querySelectorAll("[data-saet]").forEach(function (k) {
    k.addEventListener("click", function () { saetForhold(navn, k.dataset.saet, true); });
  });
  tegnKortFigur();
}

// Kortet opdateres, mens det er åbent (andre kan jo sætte hjerter imens)
setInterval(function () { if (!spKort.hidden && kortNavn) hentKort(kortNavn); }, 4000);


// -------------------------------------------------------------
//  Klik på dig selv eller en anden: kortet kommer frem
// -------------------------------------------------------------
const aabnMinMenuKort = aabnMinMenu;
aabnMinMenu = function () {
  aabnMinMenuKort();
  aabnKort(FIGUR.navn, garderobe);
};

const aabnGaestMenuKort = aabnGaestMenu;
aabnGaestMenu = function (g) {
  aabnGaestMenuKort(g);
  visForholdKnapper(g);
  aabnKort(g.navn, g.valg);
};

// ❤ Hjerte og 🙂 Smiley i klikmenuen, med et lille ✕ ude i siden, når de er sat
function visForholdKnapper(g) {
  minMenuKnapper.querySelectorAll(".sk-menu").forEach(function (r) { r.remove(); });
  Object.keys(FORHOLD).forEach(function (slags) {
    const f = FORHOLD[slags];
    const sat = harSat(g.navn, slags);
    const raekke = document.createElement("div");
    raekke.className = "sk-menu" + (sat ? " sat sk-" + slags : "");
    const k = document.createElement("button");
    k.type = "button";
    k.textContent = f.tegn + " " + f.navn + (sat ? " ✓" : "");
    k.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!sat) saetForhold(g.navn, slags, true);
    });
    raekke.appendChild(k);
    if (sat) {
      const x = document.createElement("button");
      x.type = "button";
      x.className = "sk-menu-x";
      x.textContent = "✕";
      x.title = "Fjern dit " + f.navn.toLowerCase();
      x.addEventListener("click", function (e) { e.stopPropagation(); saetForhold(g.navn, slags, false); });
      raekke.appendChild(x);
    }
    minMenuKnapper.appendChild(raekke);
  });
  placerMinMenu();
}


// -------------------------------------------------------------
//  Dit motto kommer op på serveren, så de andre kan se det på dit kort
// -------------------------------------------------------------
let mottoTimer = null;
function sendMotto() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_motto_saet", { p_token: token, p_motto: profilMotto.value }).catch(function () {});
}
profilMotto.addEventListener("input", function () {
  clearTimeout(mottoTimer);
  mottoTimer = setTimeout(sendMotto, 800);
  if (kortNavn === FIGUR.navn) visKort();
});
if (profilMotto.value.trim()) sendMotto(); else hentKort(FIGUR.navn);


// -------------------------------------------------------------
//  Udseendet (grøn/creme som resten af hotellet)
// -------------------------------------------------------------
const kortStil = document.createElement("style");
kortStil.textContent =
  "#spillerkort { position: fixed; right: 16px; bottom: 96px; z-index: 9; width: 240px; background: #fbf6ea; color: #33402c;" +
  " border: 2px solid #4e7d4a; border-radius: 10px; box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; overflow: hidden; }" +
  "#spillerkort[hidden] { display: none; }" +
  "#spillerkort .sk-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 6px 8px; background: #4e7d4a; color: #fbf6ea; font-weight: bold; }" +
  "#spillerkort .sk-navn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  "#spillerkort .sk-luk { background: none; border: 0; color: #fbf6ea; font-size: 16px; cursor: pointer; padding: 0 2px; }" +
  "#spillerkort .sk-midt { display: flex; gap: 8px; align-items: flex-start; padding: 8px; }" +
  "#spillerkort .sk-figur { width: 110px; height: 150px; background: linear-gradient(#e8f2dc, #cfe4bf); border: 1px solid #9ccc8f; border-radius: 8px; image-rendering: pixelated; }" +
  "#spillerkort .sk-skilte { display: flex; flex-direction: column; gap: 6px; align-items: center; flex: 1; padding-top: 6px; }" +
  "#spillerkort .sk-skilte img { max-width: 100px; max-height: 44px; image-rendering: pixelated; }" +
  "#spillerkort .sk-job { font-size: 10px; line-height: 1.3; color: #55624f; text-align: center; cursor: help; }" +
  "#spillerkort .sk-job b { display: block; font-size: 11px; color: #1f3a1c; }" +
  "#spillerkort .sk-raekker { padding: 0 8px 8px; }" +
  "#spillerkort .sk-raekker p { margin: 0 0 6px; }" +
  "#spillerkort .sk-motto { padding: 6px 8px; background: #fff; border: 1px solid #d6e8c8; border-radius: 6px; word-wrap: break-word; }" +
  "#spillerkort .sk-baand { padding: 5px 8px; background: #9ccc8f; color: #1f3a1c; border-radius: 6px; font-weight: bold; text-align: center; }" +
  "#spillerkort .sk-fd { background: #f3dfa6; color: #5a4313; }" +
  "#spillerkort .sk-forhold { display: flex; align-items: center; gap: 6px; margin-top: 5px; padding: 5px 6px; border-radius: 6px; }" +
  "#spillerkort .sk-hjerte { background: #f6d3df; border: 1px solid #e3a2ba; }" +
  "#spillerkort .sk-smiley { background: #f8eab4; border: 1px solid #e3c86a; }" +
  "#spillerkort .sk-hvem { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  "#spillerkort .sk-hvem i { color: #8a8a7a; }" +
  "#spillerkort .sk-x, #spillerkort .sk-plus { width: 20px; height: 20px; padding: 0; border-radius: 50%; border: 1px solid #b07a8a; background: #fff;" +
  " color: #8a3a52; font: bold 11px Verdana, sans-serif; cursor: pointer; line-height: 18px; }" +
  "#spillerkort .sk-plus { border-color: #7fb56f; color: #2f5a2b; font-size: 14px; }" +
  "#min-menu-knapper .sk-menu { display: flex; gap: 4px; margin: 0 0 4px; }" +
  "#min-menu-knapper .sk-menu button { margin: 0; }" +
  "#min-menu-knapper .sk-menu.sat.sk-hjerte button { background: #c9668b; border-color: #e3a2ba; }" +
  "#min-menu-knapper .sk-menu.sat.sk-smiley button { background: #c9a12f; border-color: #e3c86a; }" +
  "#min-menu-knapper .sk-menu .sk-menu-x { flex: 0 0 28px; width: 28px; padding: 0; text-align: center; font-size: 12px; }";
document.head.appendChild(kortStil);
