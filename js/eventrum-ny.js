// =============================================================
//  Event-rum: omdøb ✏️, opret nye ➕ og max antal personer 👥
//  • Ejeren og Eventværter kan give event-rummene nye navne,
//    oprette nye event-rum og slette dem, de har oprettet.
//  • Max antal: ejeren og Eventværter i event-rummene, ejeren i
//    hotellets andre offentlige rum, og rummets ejer i egne rum.
//  • Er et rum fyldt, kommer man ikke ind. Ansatte og ejeren
//    kommer altid ind, også når rummet er fyldt.
//  Alt gemmes på serveren (database-29-eventrum.sql), så alle ser det.
//  Filen hentes af js/eventrum.js.
// =============================================================
const RUM_INDST_NOEGLE = "mit-hotel-rum-indstillinger";
const ERUM_MAKS_VALG = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200];
// farver til nye event-rum (væg, gulv1, gulv2) — skiftes på skift
const ERUM_NYE_FARVER = [
  ["#7d62a8", "#d9cdea", "#c9badf"], ["#b8483f", "#d8b47a", "#c9a46c"], ["#3f4d72", "#e9e6e1", "#d6d2cb"],
  ["#4e7d4a", "#ecd7a6", "#e0c992"], ["#8a5a3b", "#f2f0ea", "#e2ded4"], ["#2c2b33", "#b4473d", "#a33f36"],
];

let rumIndst = {};   // { event1: { navn, maks }, event5: { navn, maks, ny: true }, biograf: { maks } }
try { rumIndst = JSON.parse(localStorage.getItem(RUM_INDST_NOEGLE) || "{}") || {}; } catch (e) { rumIndst = {}; }
function gemRumIndstLokalt() {
  try { localStorage.setItem(RUM_INDST_NOEGLE, JSON.stringify(rumIndst)); } catch (e) {}
}

let erumRet = null;          // id på det rum, hvis kort er åbent til at rette
let erumRetNavn = "";        // det man har skrevet i navnefeltet
let erumOpretAaben = false;
let erumOpretNavn = "";
let erumSletSikker = null;

function erumErEjer() { return EJERE.indexOf(FIGUR.navn) >= 0; }
function erumErAnsat() { return typeof erAnsat === "function" ? erAnsat(FIGUR.navn) : erumErEjer(); }
function erumMaaEvent() { return typeof maaLaaseEvent === "function" ? maaLaaseEvent() : erumErEjer(); }
function erumServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && mitToken(); }
function erumRens(t) { return typeof navHtml === "function" ? navHtml(t) : String(t); }
function erumStd(id) { return /^event[1-4]$/.test(id); }   // de fire første event-rum

// Må du rette dette rum i navigatøren?
function erumMaaRette(r) {
  if (!r || !r.rum || r.hemmelig) return false;
  if (r.event) return erumMaaEvent();
  if (r.egetRum) {
    const m = mineRum.find(function (x) { return x.id === r.vaerelse; });
    return !!m && typeof ejerAf === "function" && ejerAf(m) === FIGUR.navn;
  }
  if (r.rum === "hal" || r.vaerelse === "mit") return false;
  return erumErEjer();
}


// -------------------------------------------------------------
//  Læg navne, max antal og nye event-rum ind i hotellet
// -------------------------------------------------------------
function erumLavRum(id, s, nr) {
  const f = ERUM_NYE_FARVER[(nr - 1) % ERUM_NYE_FARVER.length];
  const skabelon = EVENT_RUM[0] || {};
  const r = { id: id, navn: s.navn || ("Event rum " + nr), vaeg: f[0], gulv1: f[1], gulv2: f[2], ejer: EJER_NAVNE[0],
    bredde: skabelon.bredde || 14, dybde: skabelon.dybde || 14, vaegHoejde: skabelon.vaegHoejde || 170,
    doer: skabelon.doer === null ? null : { x: 0, y: 7 }, event: true };
  EVENT_RUM.push(r);
  INDBYGGEDE_RUM[id] = r;
  if (typeof RF_STANDARD !== "undefined") RF_STANDARD[id] = { vaeg: r.vaeg, gulv1: r.gulv1, gulv2: r.gulv2 };
  // kortet i navigatøren: efter det sidste event-rum
  let plads = -1;
  NAV_RUM.forEach(function (x, i) { if (x.event) plads = i; });
  const kort = { id: id, etage: "sal1", navn: r.navn, om: "Fester og events", billede: "billeder/rum/event.png",
    maks: s.maks || 40, rum: "vaerelse", vaerelse: id, event: true, nyEvent: true };
  if (plads >= 0) NAV_RUM.splice(plads + 1, 0, kort); else NAV_RUM.push(kort);
}
function erumFjernRum(id) {
  // står du derinde, så gå ud først (mens rummet stadig findes)
  if (rumValg === "vaerelse" && aktivtVaerelse === id) {
    skiftRum("hal");
    besked.textContent = "🗑 Event-rummet blev slettet, så du er tilbage i Velkomsthallen.";
  }
  const i = EVENT_RUM.findIndex(function (r) { return r.id === id; });
  if (i >= 0) EVENT_RUM.splice(i, 1);
  delete INDBYGGEDE_RUM[id];
  const j = NAV_RUM.findIndex(function (r) { return r.vaerelse === id && r.event; });
  if (j >= 0) NAV_RUM.splice(j, 1);
}

function erumBrug(data) {
  rumIndst = data || {};
  gemRumIndstLokalt();
  // nye event-rum i nummer-rækkefølge
  Object.keys(rumIndst).filter(function (id) { return rumIndst[id].ny; })
    .sort(function (a, b) { return parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10); })
    .forEach(function (id) {
      const s = rumIndst[id];
      if (s.slettet) { if (INDBYGGEDE_RUM[id]) erumFjernRum(id); return; }
      if (!INDBYGGEDE_RUM[id]) erumLavRum(id, s, parseInt(id.slice(5), 10) || EVENT_RUM.length + 1);
    });
  erumAnvend();
}
// navne og max antal (køres igen hver gang, fordi nogle rum først kommer til senere)
function erumAnvend() {
  Object.keys(rumIndst).forEach(function (id) {
    const s = rumIndst[id];
    if (!s || s.slettet) return;
    if (s.navn && INDBYGGEDE_RUM[id] && INDBYGGEDE_RUM[id].event) INDBYGGEDE_RUM[id].navn = s.navn;
    if (s.maks) NAV_RUM.forEach(function (r) { if (r.vaerelse === id && !r.egetRum) r.maks = s.maks; });
  });
  // så elevatoren også viser de nye navne
  NAV_RUM.forEach(function (r) {
    if (r.event && INDBYGGEDE_RUM[r.vaerelse]) r.navn = INDBYGGEDE_RUM[r.vaerelse].navn + (typeof eventLaas !== "undefined" && eventLaas[r.vaerelse] ? " 🔒" : "");
  });
}
erumBrug(rumIndst);   // det, der sidst blev hentet, kommer med det samme

function erumHent() {
  if (typeof SERVER === "undefined" || !SERVER.til) return;
  serverKald("hv_rum_indst_hent", {}).then(function (svar) {
    if (!svar || typeof svar !== "object") return;
    if (JSON.stringify(svar) === JSON.stringify(rumIndst)) return;
    erumBrug(svar);
    if (!navVindue.hidden) visNav();
  }).catch(function () {});   // database-29-eventrum.sql er ikke kørt endnu
}
erumHent();
setInterval(erumHent, 5000);

function erumFejl(e) {
  const t = e && e.message ? e.message : String(e);
  besked.textContent = /hv_rum_indst|hv_event_rum|function|schema cache/i.test(t)
    ? "⚠️ Serveren kender ikke event-rummene endnu. Kør database-29-eventrum.sql i Supabase først."
    : "⚠️ " + t;
}


// -------------------------------------------------------------
//  Gem ændringer (på serveren, eller kun her hvis der ikke er server)
// -------------------------------------------------------------
function erumGem(r, navn, maks) {
  if (r.egetRum) {
    const m = mineRum.find(function (x) { return x.id === r.vaerelse; });
    if (m && maks) { m.maks = maks; gemMineRum(); }
    erumRet = null; visNav();
    return;
  }
  const id = r.vaerelse;
  const nytNavn = r.event && navn ? navn.trim().slice(0, 30) : null;
  function lokalt() {
    const s = Object.assign({}, rumIndst[id] || {});
    if (nytNavn) s.navn = nytNavn;
    if (maks) s.maks = maks;
    const ny = Object.assign({}, rumIndst); ny[id] = s;
    erumBrug(ny);
    if (typeof adminSkriv === "function") adminSkriv(FIGUR.navn + " ændrede rummet " + (nytNavn || id) + (maks ? " (max " + maks + ")" : ""));
    erumRet = null; visNav();
  }
  if (!erumServer()) { lokalt(); return; }
  serverKald("hv_rum_indst_gem", { p_token: mitToken(), p_rum: id, p_navn: nytNavn, p_maks: maks || null })
    .then(function () { lokalt(); besked.textContent = "✅ Rummet er gemt."; })
    .catch(erumFejl);
}

function erumOpret(navn, maks) {
  navn = (navn || "").trim().slice(0, 30);
  if (!navn) { besked.textContent = "Skriv et navn til det nye event-rum."; return; }
  function faerdig(id) {
    const ny = Object.assign({}, rumIndst);
    ny[id] = { navn: navn, maks: maks, ny: true, slettet: false };
    erumBrug(ny);
    erumOpretAaben = false; erumOpretNavn = "";
    visNav();
    besked.textContent = "🎉 " + navn + " er oprettet på 1. sal.";
  }
  if (!erumServer()) {
    let nr = 4;
    EVENT_RUM.forEach(function (r) { nr = Math.max(nr, parseInt(r.id.slice(5), 10) || 0); });
    Object.keys(rumIndst).forEach(function (id) { if (/^event\d+$/.test(id)) nr = Math.max(nr, parseInt(id.slice(5), 10)); });
    faerdig("event" + (nr + 1));
    return;
  }
  serverKald("hv_event_rum_opret", { p_token: mitToken(), p_navn: navn, p_maks: maks }).then(faerdig).catch(erumFejl);
}

function erumSlet(id) {
  function faerdig() {
    const ny = Object.assign({}, rumIndst);
    ny[id] = Object.assign({}, ny[id] || {}, { ny: true, slettet: true });
    erumBrug(ny);
    erumRet = null; erumSletSikker = null;
    visNav();
  }
  if (!erumServer()) { faerdig(); return; }
  serverKald("hv_event_rum_slet", { p_token: mitToken(), p_rum: id }).then(faerdig).catch(erumFejl);
}


// -------------------------------------------------------------
//  Fyldt rum: man kommer ikke ind (ansatte og ejeren gør altid)
// -------------------------------------------------------------
function erumNavKort(id) {
  return NAV_RUM.find(function (r) { return r.vaerelse === id && r.rum === "vaerelse"; });
}
function erumErFyldt(r) {
  if (!r || !r.maks || r.vaerelse === "mit") return false;
  if (rumValg === "vaerelse" && aktivtVaerelse === r.vaerelse) return false;   // du er der allerede
  return antalIRum(r) >= r.maks;
}
const gaaTilVaerelseFoerMaks = gaaTilVaerelse;
gaaTilVaerelse = function (id) {
  erumAnvend();
  const r = erumNavKort(id);
  if (r && erumErFyldt(r) && !erumErAnsat()) {
    besked.textContent = "👥 " + r.navn.replace(/ 🔒$/, "") + " er fyldt (" + antalIRum(r) + " / " + r.maks + "). Prøv igen om lidt.";
    return;
  }
  gaaTilVaerelseFoerMaks(id);
};


// -------------------------------------------------------------
//  Navigatøren: ✏️ Ret, ➕ Opret event-rum og "Fyldt"
// -------------------------------------------------------------
function erumMaksVaelger(valgt) {
  const liste = ERUM_MAKS_VALG.indexOf(valgt) >= 0 || !valgt ? ERUM_MAKS_VALG : ERUM_MAKS_VALG.concat([valgt]).sort(function (a, b) { return a - b; });
  return "<select id='erum-maks'>" + liste.map(function (n) {
    return "<option value='" + n + "'" + (n === valgt ? " selected" : "") + ">" + n + " personer</option>";
  }).join("") + "</select>";
}

const visNavFoerNyEvent = visNav;
visNav = function () {
  // skriver du i et af felterne, så vent med at tegne forfra
  const aktiv = document.activeElement;
  if (aktiv && (aktiv.id === "erum-navn" || aktiv.id === "erum-opret-navn" || aktiv.id === "erum-maks" || aktiv.id === "erum-opret-maks")) return;
  erumAnvend();
  visNavFoerNyEvent();

  const midte = document.getElementById("nav-midte");
  if (!midte) return;

  // fyldte rum
  navVindue.querySelectorAll("#nav-midte [data-besoeg]").forEach(function (k) {
    const r = NAV_RUM.find(function (x) { return x.id === k.dataset.besoeg; });
    if (!r || k.disabled || !erumErFyldt(r)) return;
    if (erumErAnsat()) { k.title = "Rummet er fyldt, men du er ansat og kommer ind alligevel"; k.textContent = "Besøg rum 👥"; }
    else { k.disabled = true; k.textContent = "👥 Fyldt"; k.classList.add("laast"); }
  });

  // ✏️ Ret på de kort, du må rette
  midte.querySelectorAll(".nav-kort").forEach(function (kort) {
    const b = kort.querySelector("[data-fav]");
    const r = b && NAV_RUM.find(function (x) { return x.id === b.dataset.fav; });
    if (!erumMaaRette(r)) return;
    const hoejre = kort.querySelector(".nav-hoejre");
    if (erumRet === r.id) {
      const boks = document.createElement("div");
      boks.className = "erum-ret";
      const navnNu = r.event ? (INDBYGGEDE_RUM[r.vaerelse] || r).navn : "";
      boks.innerHTML = (r.event ? "<label>Navn<input id='erum-navn' type='text' maxlength='30' value='" + erumRens(erumRetNavn || navnNu) + "'></label>" : "") +
        "<label>Max antal" + erumMaksVaelger(r.maks) + "</label>" +
        "<small>Ansatte kommer altid ind, også når rummet er fyldt.</small>" +
        "<div class='erum-ret-knapper'><button type='button' class='nav-slet' id='erum-annuller'>Annuller</button>" +
        "<button type='button' class='nav-besoeg' id='erum-gem'>💾 Gem</button></div>" +
        (r.nyEvent ? "<button type='button' class='nav-slet" + (erumSletSikker === r.vaerelse ? " sikker" : "") + "' id='erum-slet'>" +
          (erumSletSikker === r.vaerelse ? "Er du sikker? Tryk igen" : "🗑 Slet rummet") + "</button>" : "");
      kort.querySelector(".nav-info").appendChild(boks);
      const felt = boks.querySelector("#erum-navn");
      if (felt) {
        felt.addEventListener("input", function () { erumRetNavn = felt.value; });
        felt.addEventListener("keydown", function (e) { if (e.key === "Enter") boks.querySelector("#erum-gem").click(); });
      }
      boks.querySelector("#erum-annuller").addEventListener("click", function () { erumRet = null; erumRetNavn = ""; erumSletSikker = null; visNav(); });
      boks.querySelector("#erum-gem").addEventListener("click", function () {
        const navn = felt ? felt.value : null;
        if (felt && !navn.trim()) { besked.textContent = "Rummet skal have et navn."; return; }
        document.activeElement.blur();
        erumRetNavn = "";
        erumGem(r, navn, +boks.querySelector("#erum-maks").value);
      });
      const slet = boks.querySelector("#erum-slet");
      if (slet) slet.addEventListener("click", function () {
        if (erumSletSikker !== r.vaerelse) { erumSletSikker = r.vaerelse; visNav(); return; }
        erumSlet(r.vaerelse);
      });
    } else if (hoejre) {
      const k = document.createElement("button");
      k.type = "button";
      k.className = "nav-slet erum-ret-knap";
      k.textContent = r.event ? "✏️ Omdøb / max" : "👥 Max antal";
      k.title = r.event ? "Giv rummet et nyt navn eller ret max antal" : "Bestem hvor mange der må være i rummet";
      k.addEventListener("click", function () { erumRet = r.id; erumRetNavn = ""; erumSletSikker = null; visNav(); });
      hoejre.appendChild(k);
    }
  });

  // ➕ Opret event-rum (1. sal)
  if (navEtage === "sal1" && navFilter === "alle" && !navSoeg && erumMaaEvent()) {
    const boks = document.createElement("div");
    const titel = midte.querySelector(".nav-titel");
    if (!erumOpretAaben) {
      boks.innerHTML = "<button type='button' class='nav-opret' id='erum-opret-aabn'>➕ Opret event-rum</button>";
    } else {
      boks.className = "nav-opret-boks erum-opret";
      boks.innerHTML = "<h4>🎉 Nyt event-rum</h4>" +
        "<label>Navn<input id='erum-opret-navn' type='text' maxlength='30' placeholder='Fx Fest-salen' value='" + erumRens(erumOpretNavn) + "'></label>" +
        "<label>Max antal" + erumMaksVaelger(40).replace("id='erum-maks'", "id='erum-opret-maks'") + "</label>" +
        "<small>Rummet kommer på 1. sal og i elevatoren. Ansatte kommer altid ind, også når det er fyldt.</small>" +
        "<div class='erum-ret-knapper'><button type='button' class='nav-slet' id='erum-opret-annuller'>Annuller</button>" +
        "<button type='button' class='nav-besoeg' id='erum-opret-ok'>➕ Opret</button></div>";
    }
    if (titel) titel.after(boks); else midte.prepend(boks);
    const aabn = boks.querySelector("#erum-opret-aabn");
    if (aabn) aabn.addEventListener("click", function () { erumOpretAaben = true; visNav(); const f = document.getElementById("erum-opret-navn"); if (f) f.focus(); });
    const felt = boks.querySelector("#erum-opret-navn");
    if (felt) {
      felt.addEventListener("input", function () { erumOpretNavn = felt.value; });
      felt.addEventListener("keydown", function (e) { if (e.key === "Enter") boks.querySelector("#erum-opret-ok").click(); });
      boks.querySelector("#erum-opret-annuller").addEventListener("click", function () { erumOpretAaben = false; erumOpretNavn = ""; visNav(); });
      boks.querySelector("#erum-opret-ok").addEventListener("click", function () {
        const maks = +boks.querySelector("#erum-opret-maks").value;
        const navn = felt.value;
        document.activeElement.blur();
        erumOpret(navn, maks);
      });
    }
  }
};

// lidt stil til felterne
(function () {
  const s = document.createElement("style");
  s.textContent =
    ".erum-ret { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; max-width: 280px; }" +
    ".erum-ret label, .erum-opret label { display: flex; flex-direction: column; gap: 2px; font-size: 12px; font-weight: bold; color: #5a1626; }" +
    ".erum-ret input, .erum-ret select, .erum-opret input, .erum-opret select { padding: 5px 7px; border: 2px solid #d8c29a; border-radius: 8px; font-size: 14px; background: #fffaf0; }" +
    ".erum-ret small, .erum-opret small { font-size: 11px; opacity: .8; }" +
    ".erum-ret-knapper { display: flex; gap: 6px; align-items: center; }" +
    ".erum-ret-knapper .nav-slet { margin-top: 0; }" +
    ".erum-opret { display: flex; flex-direction: column; gap: 8px; max-width: 360px; }" +
    ".erum-ret-knap { white-space: nowrap; }";
  document.head.appendChild(s);
})();

if (typeof navVindue !== "undefined" && !navVindue.hidden) visNav();
