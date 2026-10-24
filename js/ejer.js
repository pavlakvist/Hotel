// =============================================================
//  Ejerpanel (mod tools) — kun for hotellets ejer
//  Åbnes med 🛡️-knappen nede ved chatten.
//
//  VIGTIGT: Indtil hotellet får en server, bliver alt her gemt på
//  din egen computer (localStorage). Derfor kan panelet kun se dig
//  selv og computer-gæsterne. Rigtige spillere, logins fra andre og
//  IP-adresser kræver en server.
// =============================================================

// Hvem må åbne ejerpanelet? Skriv flere navne for at gøre dem til moderatorer.
const EJERE = typeof EJER_NAVNE !== "undefined" ? EJER_NAVNE.slice() : ["Pall", "Pavla"];   // navnene står i js/konto.js
// Er ejeren logget ind, husker computeren det til ejer-knappen på forsiden
if (typeof aktivKonto === "function" && aktivKonto() && EJERE.includes(aktivKonto())) huskEjerGenvej(aktivKonto());

// Navne, ejeren har ændret i panelet (Spillere → Skift navn): { "Ida": "Isa", "__mig": "Pall" }
const NAVNE_NOEGLE = "mit-hotel-navne";
let nyeNavne = {};
try { nyeNavne = JSON.parse(localStorage.getItem(NAVNE_NOEGLE) || "{}"); } catch (e) {}
HAL_GAESTER.forEach(function (g) {
  g.oprNavn = g.navn;
  if (nyeNavne[g.navn]) g.navn = nyeNavne[g.navn];
});
if (nyeNavne.__mig && !aktivKonto()) {
  if (EJERE.indexOf(FIGUR.navn) >= 0 && EJERE.indexOf(nyeNavne.__mig) < 0) EJERE.push(nyeNavne.__mig);
  FIGUR.navn = nyeNavne.__mig;
}

const LOG_NOEGLE = "mit-hotel-chatlog";
const LOGIN_NOEGLE = "mit-hotel-logins";
const MISTAENKT_NOEGLE = "mit-hotel-mistaenkeligt";
const SANKTION_NOEGLE = "mit-hotel-sanktioner";
const MAKS_LOG = 1000;          // så mange chatbeskeder gemmes højst

function hentListe(noegle) {
  try { return JSON.parse(localStorage.getItem(noegle) || "[]"); } catch (e) { return []; }
}
function gemListe(noegle, liste, maks) {
  if (maks && liste.length > maks) liste.splice(0, liste.length - maks);
  try { localStorage.setItem(noegle, JSON.stringify(liste)); } catch (e) {}
}

let chatLog = hentListe(LOG_NOEGLE);
let logins = hentListe(LOGIN_NOEGLE);
let mistaenkeligt = hentListe(MISTAENKT_NOEGLE);
let sanktioner = {};
try { sanktioner = JSON.parse(localStorage.getItem(SANKTION_NOEGLE) || "{}"); } catch (e) {}
function gemSanktioner() {
  try { localStorage.setItem(SANKTION_NOEGLE, JSON.stringify(sanktioner)); } catch (e) {}
}
function spillerData(navn) {
  if (!sanktioner[navn]) sanktioner[navn] = { bannet: false, timeoutTil: 0, historik: [], note: "" };
  return sanktioner[navn];
}

const ADMINLOG_NOEGLE = "mit-hotel-adminlog";
const NYHED_NOEGLE = "mit-hotel-nyheder";
const SYSTEM_NOEGLE = "mit-hotel-system";

let adminLog = hentListe(ADMINLOG_NOEGLE);
let nyheder = hentListe(NYHED_NOEGLE);
const system = { velkomst: "", filterTil: true, ekstraOrd: "", timeoutMin: 5, valutaNavn: "Glimt", startBeloeb: 100, startKrystaller: 5 };
try { Object.assign(system, JSON.parse(localStorage.getItem(SYSTEM_NOEGLE) || "{}")); } catch (e) {}
if (system.valutaNavn === "Mønter") system.valutaNavn = "Glimt";
function gemSystem() {
  try { localStorage.setItem(SYSTEM_NOEGLE, JSON.stringify(system)); } catch (e) {}
}
// Alt hvad ejeren gør, bliver skrevet ned
function adminSkriv(hvad) {
  adminLog.push({ tid: Date.now(), hvem: FIGUR.navn, hvad: hvad });
  gemListe(ADMINLOG_NOEGLE, adminLog, 500);
}

// Du er lige logget ind
logins.push({ navn: FIGUR.navn, tid: Date.now() });
gemListe(LOGIN_NOEGLE, logins, 200);

function rumNavn(r) { return r === "hal" ? "Velkomsthallen" : "Mit værelse"; }
function tidTekst(t) {
  return new Date(t).toLocaleString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function dagNoegle(t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
// Gør tekst ufarlig, før den sættes ind på siden
function rens(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function nyMistanke(navn, type, tekst) {
  mistaenkeligt.push({ navn: navn, type: type, tekst: tekst, rum: rumValg, tid: Date.now() });
  gemListe(MISTAENKT_NOEGLE, mistaenkeligt, 300);
}


// -------------------------------------------------------------
//  Hold øje med chatten
// -------------------------------------------------------------
let sidsteOriginal = null;

// Grimme ord: husk hvad der egentlig blev skrevet
const rensTekstFoer = rensTekst;
let ekstraMoenstre = [];
function lavEkstraOrd() {
  ekstraMoenstre = system.ekstraOrd.split(",").map(function (o) { return o.trim().toLowerCase(); })
    .filter(Boolean).map(lavOrdMoenster);
}
lavEkstraOrd();
rensTekst = function (tekst) {
  if (!system.filterTil) { sidsteOriginal = null; return tekst; }
  let renset = rensTekstFoer(tekst);
  ekstraMoenstre.forEach(function (m) { renset = renset.replace(m, "***"); });
  sidsteOriginal = renset !== tekst ? tekst : null;
  if (sidsteOriginal) nyMistanke(FIGUR.navn, "Grimme ord", tekst);
  return renset;
};

// Alt hvad der bliver sagt, kommer i chatloggen
const sigFoer = sig;
sig = function (hvem, navn, tekst) {
  if (!String(tekst).trim()) return;
  const linje = { tid: Date.now(), navn: navn, rum: rumValg, tekst: tekst.trim() };
  if (hvem === figur && sidsteOriginal) { linje.original = sidsteOriginal; sidsteOriginal = null; }
  chatLog.push(linje);
  gemListe(LOG_NOEGLE, chatLog, MAKS_LOG);

  // spam: 5 beskeder på 10 sekunder
  const nylige = chatLog.filter(function (l) { return l.navn === navn && linje.tid - l.tid < 10000; });
  if (nylige.length === 5) nyMistanke(navn, "Spam", "5 beskeder på 10 sekunder");

  sigFoer(hvem, navn, tekst);
  if (!ejerVindue.hidden && ejerFane === "chat" && !ejerIndhold.contains(document.activeElement)) visFane();
};

// Bannede gæster er væk fra hallen, og gæster med timeout kan ikke skrive
// Straffe: advarsel, timeout (kan ikke skrive), frys (kan hverken gå eller skrive) og ban.
// Hver straf har et "til"-tidspunkt; ban kan også være for altid (bannet: true).
function erBannet(navn) { const d = sanktioner[navn]; return !!(d && (d.bannet || d.bannetTil > Date.now())); }
function erFrosset(navn) { const d = sanktioner[navn]; return !!(d && d.frysTil > Date.now()); }
function harTimeout(navn) { const d = sanktioner[navn]; return !!(d && (d.timeoutTil > Date.now() || erFrosset(navn))); }
function erAdvaret(navn) { const d = sanktioner[navn]; return !!(d && d.advarselTil > Date.now()); }
// Hvor lang tid der er tilbage, fx "4:05" eller "2 t 15 min"
function tidTilbage(til) {
  const sek = Math.max(0, Math.ceil((til - Date.now()) / 1000));
  if (sek >= 3600) return Math.floor(sek / 3600) + " t " + Math.floor(sek % 3600 / 60) + " min";
  return Math.floor(sek / 60) + ":" + String(sek % 60).padStart(2, "0");
}
// Varighederne man kan vælge (i minutter)
const STRAF_TIDER = [[1, "1 min"], [5, "5 min"], [10, "10 min"], [15, "15 min"], [30, "30 min"], [60, "1 time"],
  [120, "2 timer"], [180, "3 timer"], [360, "6 timer"], [720, "12 timer"], [1440, "24 timer"]];
let valgtStrafTid = system.timeoutMin;

// Frosne gæster står helt stille
const opdaterHalFoer = opdaterHal;
opdaterHal = function (dt) {
  HAL_GAESTER.forEach(function (g) {
    if (erFrosset(g.navn)) { g.rute = []; g.vent = 1; g.frosset = true; }
    else if (g.frosset) { g.frosset = false; g.vent = 0.5; }
  });
  opdaterHalFoer(dt);
  HAL_GAESTER.forEach(function (g) { if (g.frosset && !g.sidder) g.vent = 1; });
};

// Straffe vises over hovedet på gæsterne, så alle kan se det
function strafSkilt(navn) {
  const d = sanktioner[navn];
  if (!d) return null;
  if (erFrosset(navn)) return { tekst: "🧊 Frosset " + tidTilbage(d.frysTil), farve: "#3f7fb0" };
  if (d.timeoutTil > Date.now()) return { tekst: "🔇 Timeout " + tidTilbage(d.timeoutTil), farve: "#c98a1c" };
  if (erAdvaret(navn)) return { tekst: "⚠️ Advaret", farve: "#c0392b" };
  return null;
}
const tegnHalGaestFoer = tegnHalGaest;
tegnHalGaest = function (g) {
  tegnHalGaestFoer(g);
  const skilt = strafSkilt(g.navn);
  if (!skilt) return;
  const p = punkt(g.x + 0.5, g.y + 0.5);
  p.x += gaestPlads(g);
  const sidde = g.sidder ? MOEBEL_TYPER[g.saede.type].saede : 0;
  const hoejde = figurHoejde(g.valg) - 10 + (g.sidder ? -sidde + 10 : 0);
  const y = p.y - hoejde - 30;
  ctx.font = "bold 11px Verdana, sans-serif";
  ctx.textAlign = "center";
  const w = ctx.measureText(skilt.tekst).width + 14;
  ctx.fillStyle = skilt.farve;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(p.x - w / 2, y - 14, w, 18, 9); else ctx.rect(p.x - w / 2, y - 14, w, 18);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(skilt.tekst, p.x, y);
};

const halTingFoer = halTing;
halTing = function (ting) {
  const alle = HAL_GAESTER.slice();
  HAL_GAESTER.length = 0;
  alle.forEach(function (g) { if (!erBannet(g.navn)) HAL_GAESTER.push(g); });
  halTingFoer(ting);
  HAL_GAESTER.length = 0;
  alle.forEach(function (g) { HAL_GAESTER.push(g); });
};

const gaestSkriverFoer = gaestSkriver;
gaestSkriver = function (g, tekst) {
  if (erBannet(g.navn) || harTimeout(g.navn)) return;
  gaestSkriverFoer(g, tekst);
};


// Velkomstbeskeden og den nyeste nyhed står nederst i hallen
function hallensBesked() {
  if (rumValg !== "hal") return;
  const ny = nyheder[nyheder.length - 1];
  if (ny) besked.textContent = "📰 " + ny.titel + (ny.tekst ? ": " + ny.tekst : "");
  else if (system.velkomst) besked.textContent = system.velkomst;
}
const skiftRumEjer = skiftRum;
skiftRum = function (navn) {
  skiftRumEjer(navn);
  hallensBesked();
};
hallensBesked();


// -------------------------------------------------------------
//  Selve panelet
// -------------------------------------------------------------
const ejerKnap = document.getElementById("chat-ejer-knap");
const ejerVindue = document.getElementById("ejer-vindue");
const ejerIndhold = document.getElementById("ejer-indhold");
let ejerFane = "oversigt";
let valgtSpiller = FIGUR.navn;
const chatFilter = { spiller: "", rum: "", dato: "", soeg: "", kunGrimme: false };

if (EJERE.indexOf(FIGUR.navn) < 0) ejerKnap.hidden = true;

ejerKnap.addEventListener("click", function () {
  if (EJERE.indexOf(FIGUR.navn) < 0) return;
  ejerVindue.hidden = !ejerVindue.hidden;
  if (!ejerVindue.hidden) visFane();
});
document.getElementById("ejer-luk").addEventListener("click", function () { ejerVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") ejerVindue.hidden = true; });

document.querySelectorAll("#ejer-faner button").forEach(function (k) {
  k.addEventListener("click", function () { ejerFane = k.dataset.fane; visFane(); });
});

function alleSpillere() {
  // profiler der er oprettet på denne computer (Opret mig på forsiden)
  const profiler = typeof hentKonti === "function" ? Object.values(hentKonti()).map(function (k) { return k.navn; })
    .filter(function (n) { return n !== FIGUR.navn; }) : [];
  return [{ navn: FIGUR.navn, hvad: "Ejer (dig)" }].concat(profiler.map(function (n) {
    return { navn: n, hvad: "Profil på denne computer" };
  }), HAL_GAESTER.map(function (g) {
    return { navn: g.navn, hvad: "Computer-gæst" };
  }));
}
function erOnline(navn) {
  if (navn === FIGUR.navn) return true;
  return rumValg === "hal" && !erBannet(navn);
}
function senestSet(navn) {
  let t = 0;
  chatLog.forEach(function (l) { if (l.navn === navn) t = Math.max(t, l.tid); });
  logins.forEach(function (l) { if (l.navn === navn) t = Math.max(t, l.tid); });
  return t;
}
function rapporter() { return hentListe("mit-hotel-rapporter"); }

function visFane() {
  document.querySelectorAll("#ejer-faner button").forEach(function (k) {
    k.classList.toggle("valgt", k.dataset.fane === ejerFane);
  });
  const nye = rapporter().filter(function (r) { return !r.behandlet; }).length;
  document.getElementById("ejer-rapport-tal").textContent = nye ? nye : "";
  if (ejerFane === "oversigt") visOversigt();
  if (ejerFane === "chat") visChatlog();
  if (ejerFane === "beskeder") visAlleBeskeder();
  if (ejerFane === "spillere") visSpillere();
  if (ejerFane === "rapporter") visRapporter();
  if (ejerFane === "ip") visIp();
  if (ejerFane === "rum") visRum();
  if (ejerFane === "valuta") visValuta();
  if (ejerFane === "events") visEvents();
  if (ejerFane === "adminlog") visAdminlog();
  if (ejerFane === "system") visSystem();
}

// ----- 1. Oversigt -----
function visOversigt() {
  const online = alleSpillere().filter(function (s) { return erOnline(s.navn); }).length;
  const idag = dagNoegle(Date.now());
  const loginsIdag = logins.filter(function (l) { return dagNoegle(l.tid) === idag; }).length;
  const bannede = Object.keys(sanktioner).filter(erBannet);
  const nyeRapporter = rapporter().filter(function (r) { return !r.behandlet; }).length;

  let html = "<div class='ejer-kort-raekke'>" +
    kort("🟢", online, "Spillere online", "du + computer-gæster") +
    kort("🔑", loginsIdag, "Logins i dag", "") +
    kort("⛔", bannede.length, "Bannede spillere", "") +
    kort("⚠️", mistaenkeligt.length, "Mistænkelig aktivitet", nyeRapporter ? nyeRapporter + " nye rapporter" : "") +
    "</div><div class='ejer-tre'>";

  html += "<section><h3>Seneste logins</h3>" + liste(logins.slice(-8).reverse().map(function (l) {
    return "<b>" + rens(l.navn) + "</b><span>" + tidTekst(l.tid) + "</span>";
  }), "Ingen logins endnu") + "</section>";

  html += "<section><h3>Bannede spillere</h3>" + liste(bannede.map(function (n) {
    const h = sanktioner[n].historik.filter(function (x) { return x.handling === "Ban"; }).pop();
    return "<a href='#' data-spiller='" + rens(n) + "'>" + rens(n) + "</a><span>" + (h ? rens(h.grund || "ingen grund") : "") + "</span>";
  }), "Ingen er bannet 🎉") + "</section>";

  html += "<section><h3>Mistænkelig aktivitet</h3>" + liste(mistaenkeligt.slice(-8).reverse().map(function (m) {
    return "<a href='#' data-spiller='" + rens(m.navn) + "'>" + rens(m.navn) + "</a> <em class='maerke'>" + rens(m.type) + "</em>" +
      "<span>" + rens(m.tekst) + " · " + tidTekst(m.tid) + "</span>";
  }), "Intet mistænkeligt") + "</section></div>";

  html += "<p class='ejer-info'>ℹ️ Alt her er gemt på din egen computer. Når hotellet får en server, kan panelet også se rigtige spillere, deres logins og IP-adresser.</p>";
  ejerIndhold.innerHTML = html;
  spillerLinks();
}

function kort(ikon, tal, navn, under) {
  return "<div class='ejer-kort'><span class='ikon'>" + ikon + "</span><b>" + tal + "</b><span>" + navn + "</span>" +
    (under ? "<small>" + rens(under) + "</small>" : "") + "</div>";
}
function liste(linjer, tom) {
  if (!linjer.length) return "<p class='tom'>" + tom + "</p>";
  return "<ul>" + linjer.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>";
}
function spillerLinks() {
  ejerIndhold.querySelectorAll("[data-spiller]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      valgtSpiller = a.dataset.spiller;
      ejerFane = "spillere";
      visFane();
    });
  });
}

// ----- 2. Chatlogs -----
function visChatlog() {
  const navne = alleSpillere().map(function (s) { return s.navn; });
  const f = chatFilter;
  let html = "<div class='ejer-filtre'>" +
    "<label>Spiller<select id='cf-spiller'><option value=''>Alle</option>" + navne.map(function (n) {
      return "<option" + (f.spiller === n ? " selected" : "") + ">" + rens(n) + "</option>";
    }).join("") + "</select></label>" +
    "<label>Rum<select id='cf-rum'><option value=''>Alle</option>" +
      "<option value='hal'" + (f.rum === "hal" ? " selected" : "") + ">Velkomsthallen</option>" +
      "<option value='vaerelse'" + (f.rum === "vaerelse" ? " selected" : "") + ">Mit værelse</option></select></label>" +
    "<label>Dato<input id='cf-dato' type='date' value='" + rens(f.dato) + "'></label>" +
    "<label class='bred'>Søg i beskeder<input id='cf-soeg' type='text' placeholder='fx hej' value='" + rens(f.soeg) + "'></label>" +
    "<label class='tjek'><input id='cf-grimme' type='checkbox'" + (f.kunGrimme ? " checked" : "") + "> Kun grimme ord</label>" +
    "</div>";

  const soeg = f.soeg.toLowerCase();
  const fundet = chatLog.filter(function (l) {
    return (!f.spiller || l.navn === f.spiller) && (!f.rum || l.rum === f.rum) &&
      (!f.dato || dagNoegle(l.tid) === f.dato) && (!f.kunGrimme || l.original) &&
      (!soeg || (l.tekst + " " + (l.original || "")).toLowerCase().indexOf(soeg) >= 0);
  }).slice(-300).reverse();

  html += "<p class='ejer-antal'>" + fundet.length + " beskeder</p><table class='ejer-tabel'><thead><tr><th>Tid</th><th>Rum</th><th>Spiller</th><th>Besked</th></tr></thead><tbody>" +
    fundet.map(function (l) {
      return "<tr" + (l.original ? " class='grim'" : "") + "><td>" + tidTekst(l.tid) + "</td><td>" + rumNavn(l.rum) + "</td>" +
        "<td><a href='#' data-spiller='" + rens(l.navn) + "'>" + rens(l.navn) + "</a></td><td>" + rens(l.tekst) +
        (l.original ? "<small>Skrev egentlig: " + rens(l.original) + "</small>" : "") + "</td></tr>";
    }).join("") + "</tbody></table>" + (fundet.length ? "" : "<p class='tom'>Ingen beskeder passer til søgningen.</p>");

  ejerIndhold.innerHTML = html;
  spillerLinks();
  function lyt(id, felt, hvordan) {
    const el = document.getElementById(id);
    el.addEventListener(hvordan, function () {
      chatFilter[felt] = el.type === "checkbox" ? el.checked : el.value;
      visChatlog();
      if (hvordan === "input") { const ny = document.getElementById(id); ny.focus(); ny.setSelectionRange(ny.value.length, ny.value.length); }
    });
  }
  lyt("cf-spiller", "spiller", "change");
  lyt("cf-rum", "rum", "change");
  lyt("cf-dato", "dato", "change");
  lyt("cf-soeg", "soeg", "input");
  lyt("cf-grimme", "kunGrimme", "change");
}

// ----- 3. Spillere -----
function visSpillere() {
  const spillere = alleSpillere();
  if (!spillere.some(function (s) { return s.navn === valgtSpiller; })) valgtSpiller = FIGUR.navn;
  const s = spillere.find(function (x) { return x.navn === valgtSpiller; });
  const d = spillerData(s.navn);
  const mig = s.navn === FIGUR.navn;
  const status = d.bannet ? "⛔ Bannet for altid" : erBannet(s.navn) ? "⛔ Bannet i " + tidTilbage(d.bannetTil) :
    erFrosset(s.navn) ? "🧊 Frosset i " + tidTilbage(d.frysTil) : harTimeout(s.navn) ? "🔇 Timeout i " + tidTilbage(d.timeoutTil) :
    erAdvaret(s.navn) ? "⚠️ Advaret" : erOnline(s.navn) ? "🟢 Online" : "⚪ Offline";
  const beskeder = chatLog.filter(function (l) { return l.navn === s.navn; });
  const omHam = rapporter().filter(function (r) { return r.hvem === s.navn; });
  const sidst = senestSet(s.navn);

  let html = "<div class='ejer-spillere'><aside><input id='sp-soeg' type='text' placeholder='Slå spiller op …'><ul id='sp-liste'>" +
    spillere.map(function (x) {
      const prik = erBannet(x.navn) ? "⛔" : erFrosset(x.navn) ? "🧊" : harTimeout(x.navn) ? "🔇" : erAdvaret(x.navn) ? "⚠️" : erOnline(x.navn) ? "🟢" : "⚪";
      return "<li><button data-navn='" + rens(x.navn) + "'" + (x.navn === s.navn ? " class='valgt'" : "") + ">" + prik + " " + rens(x.navn) + "</button></li>";
    }).join("") + "</ul></aside><div class='sp-detaljer'>" +
    "<h3>" + rens(s.navn) + " <small>" + s.hvad + "</small></h3>" +
    "<div class='sp-fakta'><span><b>Status</b>" + status + "</span><span><b>Senest set</b>" + (sidst ? tidTekst(sidst) : "aldrig") + "</span>" +
    "<span><b>Beskeder</b>" + beskeder.length + "</span><span><b>Rapporter om</b>" + omHam.length + "</span></div>";

  html += "<div class='sp-handlinger'><input id='sp-nytnavn' type='text' maxlength='16' value='" + rens(s.navn) + "'>" +
    "<button id='sp-omdoeb'>✏️ Skift navn</button></div>";

  if (mig) {
    html += "<p class='tom'>Du kan ikke straffe dig selv 😄</p>";
  } else {
    html += "<h4>Straf " + rens(s.navn) + "</h4><div class='sp-straf'>" +
      "<input id='sp-grund' type='text' maxlength='80' placeholder='Grund (fx grimt sprog)'>" +
      "<label class='sp-tid'>Hvor længe<select id='sp-tid'>" + STRAF_TIDER.map(function (t) {
        return "<option value='" + t[0] + "'" + (t[0] === valgtStrafTid ? " selected" : "") + ">" + t[1] + "</option>";
      }).join("") + "</select></label>" +
      "<label class='sp-altid'><input id='sp-altid' type='checkbox'> Ban for altid</label>" +
      "<div class='sp-straf-knapper'>" +
      "<button data-handling='Advarsel' title='Et ⚠️ over hovedet, så alle kan se det'>⚠️ Advar</button>" +
      "<button data-handling='Timeout' title='Kan ikke skrive i chatten'>🔇 Timeout</button>" +
      "<button data-handling='Frys' title='Punish: kan hverken gå eller skrive'>🧊 Frys</button>" +
      "<button data-handling='Ban' class='roed' title='Bliver smidt ud af hotellet'>⛔ Ban</button>" +
      "</div></div>";
    // de straffe der gælder lige nu, med en knap til at ophæve dem
    const aktive = [];
    if (erAdvaret(s.navn)) aktive.push(["advarselTil", "⚠️ Advarsel", tidTilbage(d.advarselTil)]);
    if (d.timeoutTil > Date.now()) aktive.push(["timeoutTil", "🔇 Timeout", tidTilbage(d.timeoutTil)]);
    if (erFrosset(s.navn)) aktive.push(["frysTil", "🧊 Frosset", tidTilbage(d.frysTil)]);
    if (d.bannet) aktive.push(["bannet", "⛔ Ban", "for altid"]);
    else if (erBannet(s.navn)) aktive.push(["bannetTil", "⛔ Ban", tidTilbage(d.bannetTil)]);
    html += "<h4>Aktive straffe</h4>" + liste(aktive.map(function (a) {
      return "<b>" + a[1] + "</b><span>" + (a[2] === "for altid" ? "for altid" : a[2] + " tilbage") + "</span>" +
        "<button class='lille groen' data-ophaev='" + a[0] + "'>✅ Ophæv</button>";
    }), "Ingen lige nu");
  }

  html += "<h4>Tidligere straffe</h4>" + liste(d.historik.slice().reverse().map(function (h) {
    return "<b>" + rens(h.handling) + "</b><span>" + rens(h.grund || "ingen grund") + " · " + tidTekst(h.tid) + "</span>";
  }), "Ingen endnu") + (d.historik.length ? "<button id='sp-slet-historik' class='lille'>🗑 Slet historik</button>" : "");
  html += "<h4>Rapporter om " + rens(s.navn) + "</h4>" + liste(omHam.map(function (r) {
    return "<b>" + rens(r.grund) + "</b><span>" + rens(r.tekst || "") + " · " + tidTekst(r.tid) + "</span>";
  }), "Ingen rapporter");
  html += "<h4>Seneste beskeder</h4>" + liste(beskeder.slice(-5).reverse().map(function (l) {
    return rens(l.tekst) + "<span>" + rumNavn(l.rum) + " · " + tidTekst(l.tid) + "</span>";
  }), "Har ikke skrevet noget");
  html += "<h4>Moderator-note</h4><textarea id='sp-note' rows='3' placeholder='Kun du kan se den her note …'>" + rens(d.note) + "</textarea></div></div>";

  ejerIndhold.innerHTML = html;

  ejerIndhold.querySelectorAll("#sp-liste button").forEach(function (k) {
    k.addEventListener("click", function () { valgtSpiller = k.dataset.navn; visSpillere(); });
  });
  const soeg = document.getElementById("sp-soeg");
  soeg.addEventListener("input", function () {
    const q = soeg.value.toLowerCase();
    ejerIndhold.querySelectorAll("#sp-liste li").forEach(function (li) {
      li.hidden = li.textContent.toLowerCase().indexOf(q) < 0;
    });
  });
  ejerIndhold.querySelectorAll("[data-handling]").forEach(function (k) {
    k.addEventListener("click", function () {
      valgtStrafTid = +document.getElementById("sp-tid").value;
      const altid = k.dataset.handling === "Ban" && document.getElementById("sp-altid").checked;
      straf(s.navn, k.dataset.handling, document.getElementById("sp-grund").value.trim(), altid ? 0 : valgtStrafTid);
    });
  });
  // Slet historik: første klik spørger "Er du sikker?", andet klik sletter
  const sletHistorik = document.getElementById("sp-slet-historik");
  if (sletHistorik) sletHistorik.addEventListener("click", function () {
    if (!sletHistorik.classList.contains("sikker")) {
      sletHistorik.classList.add("sikker");
      sletHistorik.textContent = "Er du sikker?";
      return;
    }
    d.historik = [];
    gemSanktioner();
    adminSkriv("Slettede straf-historikken for " + s.navn);
    besked.textContent = "Historikken for " + s.navn + " er slettet 🗑";
    visFane();
  });
  ejerIndhold.querySelectorAll("[data-ophaev]").forEach(function (k) {
    k.addEventListener("click", function () { ophaevStraf(s.navn, k.dataset.ophaev); });
  });
  document.getElementById("sp-omdoeb").addEventListener("click", function () {
    omdoeb(s.navn, document.getElementById("sp-nytnavn").value.trim());
  });
  document.getElementById("sp-note").addEventListener("input", function () {
    d.note = this.value;
    gemSanktioner();
  });
}

// Giv en spiller (eller dig selv) et nyt navn
function omdoeb(gammelt, nyt) {
  nyt = nyt.replace(/[<>"']/g, "").slice(0, 16);
  if (!nyt || nyt === gammelt) return;
  if (alleSpillere().some(function (x) { return x.navn.toLowerCase() === nyt.toLowerCase(); })) {
    besked.textContent = "Der er allerede en, der hedder " + nyt + ".";
    return;
  }
  if (gammelt === FIGUR.navn) {
    if (EJERE.indexOf(gammelt) >= 0 && EJERE.indexOf(nyt) < 0) EJERE.push(nyt);   // du er stadig ejer
    if (aktivKonto()) {
      if (!omdoebKonto(gammelt, nyt)) { besked.textContent = "Navnet " + nyt + " er taget af en anden profil."; return; }
    } else {
      nyeNavne.__mig = nyt;
    }
    FIGUR.navn = nyt;
  } else {
    const g = HAL_GAESTER.find(function (x) { return x.navn === gammelt; });
    if (!g) return;
    g.navn = nyt;
    nyeNavne[g.oprNavn] = nyt;
  }
  try { localStorage.setItem(NAVNE_NOEGLE, JSON.stringify(nyeNavne)); } catch (e) {}
  // straffe, noter, venner og beskeder følger med det nye navn
  if (sanktioner[gammelt]) { sanktioner[nyt] = sanktioner[gammelt]; delete sanktioner[gammelt]; gemSanktioner(); }
  if (typeof venner !== "undefined" && venner.indexOf(gammelt) >= 0) { venner[venner.indexOf(gammelt)] = nyt; gemVenner(); }
  if (typeof beskeder !== "undefined" && beskeder[gammelt]) { beskeder[nyt] = beskeder[gammelt]; delete beskeder[gammelt]; gemBeskeder(); }
  valgtSpiller = nyt;
  adminSkriv("Skiftede navn: " + gammelt + " → " + nyt);
  besked.textContent = gammelt + " hedder nu " + nyt + " ✏️";
  visFane();
}

// minutter = 0 betyder "for altid" (kun ban)
function straf(navn, handling, grund, minutter) {
  const d = spillerData(navn);
  const til = Date.now() + minutter * 60000;
  const varighed = minutter ? (STRAF_TIDER.find(function (t) { return t[0] === minutter; }) || [0, minutter + " min"])[1] : "for altid";
  d.historik.push({ handling: handling + " (" + varighed + ")", grund: grund, tid: Date.now() });
  const g = HAL_GAESTER.find(function (x) { return x.navn === navn; });
  if (handling === "Advarsel") {
    d.advarselTil = til;
    if (g) setTimeout(function () { gaestSkriverFoer(g, "Undskyld! Det skal ikke ske igen 😳"); }, 300);
    // advarslen sendes også som privat besked, så I kan skrive sammen om den
    if (typeof sendAdvarsel === "function") sendAdvarsel(navn, grund, varighed);
  }
  if (handling === "Timeout") d.timeoutTil = til;
  if (handling === "Frys") {
    d.frysTil = til;
    if (g) { g.rute = []; g.skriver = false; }
  }
  if (handling === "Ban") {
    if (minutter) d.bannetTil = til; else d.bannet = true;
    if (g) { g.saede = null; g.sidder = false; g.skriver = false; g.rute = []; }
  }
  gemSanktioner();
  adminSkriv(handling + " til " + navn + " (" + varighed + ")" + (grund ? ": " + grund : ""));
  besked.textContent = handling + ": " + navn + " (" + varighed + ")" + (grund ? ": " + grund : "");
  visFane();
}

function ophaevStraf(navn, felt) {
  const d = spillerData(navn);
  d[felt] = felt === "bannet" ? false : 0;
  if (felt === "bannetTil" || felt === "bannet") { d.bannet = false; d.bannetTil = 0; }
  const navne = { advarselTil: "Advarsel", timeoutTil: "Timeout", frysTil: "Frys", bannet: "Ban", bannetTil: "Ban" };
  d.historik.push({ handling: "Ophævet: " + navne[felt], grund: "", tid: Date.now() });
  gemSanktioner();
  adminSkriv("Ophævede " + navne[felt] + " for " + navn);
  besked.textContent = navne[felt] + " ophævet for " + navn + " ✅";
  visFane();
}

// ----- Private beskeder: ejeren kan se alle samtaler -----
let valgtSamtale = null;
function visAlleBeskeder() {
  const navne = typeof beskeder === "undefined" ? [] : Object.keys(beskeder).filter(function (n) { return beskeder[n].linjer.length; })
    .sort(function (a, b) { return sidsteTid(b) - sidsteTid(a); });
  function sidsteTid(n) { const l = beskeder[n].linjer; return l[l.length - 1].tid; }
  if (valgtSamtale && navne.indexOf(valgtSamtale) < 0) valgtSamtale = null;
  if (!valgtSamtale) valgtSamtale = navne[0] || null;
  let html = "<p class='ejer-antal'>Alle private beskeder, også advarsler. Tryk på en samtale for at læse den.</p>" +
    "<div class='ejer-spillere'><aside><ul id='pb-liste'>" + navne.map(function (n) {
      const s = beskeder[n];
      return "<li><button data-samtale='" + rens(n) + "'" + (n === valgtSamtale ? " class='valgt'" : "") + ">" +
        (s.advarsel ? "⚠️ " : "💬 ") + rens(n) + " <small>(" + s.linjer.length + ")</small></button></li>";
    }).join("") + "</ul></aside><div class='sp-detaljer'>";
  if (!valgtSamtale) {
    html += "<p class='tom'>Ingen private beskeder endnu</p>";
  } else {
    html += "<h3>" + rens(valgtSamtale) + (beskeder[valgtSamtale].advarsel ? " <small>har fået en advarsel</small>" : "") + "</h3>" +
      "<ul class='pb-samtale'>" + beskeder[valgtSamtale].linjer.map(function (l) {
        return "<li class='" + (l.advarsel ? "advarsel" : l.fra === FIGUR.navn ? "mig" : "dem") + "'><b>" + rens(l.fra) + "</b> " + rens(l.tekst) +
          "<span>" + tidTekst(l.tid) + "</span></li>";
      }).join("") + "</ul><button id='pb-aabn' class='lv-knap'>✉️ Skriv til " + rens(valgtSamtale) + "</button>";
  }
  ejerIndhold.innerHTML = html + "</div></div>";
  ejerIndhold.querySelectorAll("[data-samtale]").forEach(function (k) {
    k.addEventListener("click", function () { valgtSamtale = k.dataset.samtale; visAlleBeskeder(); });
  });
  const aabn = document.getElementById("pb-aabn");
  if (aabn) aabn.addEventListener("click", function () { aabnBeskeder(valgtSamtale); });
  const liste = ejerIndhold.querySelector(".pb-samtale");
  if (liste) liste.scrollTop = liste.scrollHeight;
}

// ----- 4. Rapporter -----
function visRapporter() {
  const alle = rapporter().map(function (r, i) { return { r: r, i: i }; }).reverse();
  function linje(x) {
    const r = x.r;
    return "<b>" + rens(r.grund) + "</b>" +
      (r.hvem ? " om <a href='#' data-spiller='" + rens(r.hvem) + "'>" + rens(r.hvem) + "</a>" : "") +
      "<span>" + rens(r.tekst || "(ingen tekst)") + " · " + tidTekst(r.tid) + "</span>" +
      (r.behandlet
        ? "<span>Behandlet " + tidTekst(r.behandletTid || r.tid) + "</span><button class='lille' data-aabn='" + x.i + "'>Åbn igen</button>"
        : "<button class='lille' data-behandl='" + x.i + "'>✅ Marker som behandlet</button>");
  }
  const aabne = alle.filter(function (x) { return !x.r.behandlet; });
  const faerdige = alle.filter(function (x) { return x.r.behandlet; });
  ejerIndhold.innerHTML = "<p class='ejer-antal'>Rapporter, som spillerne har sendt med \"Rapportere\".</p>" +
    "<div class='ejer-to'><section><h3>🆕 Åbne (" + aabne.length + ")</h3>" + liste(aabne.map(linje), "Ingen åbne rapporter 🎉") + "</section>" +
    "<section><h3>✅ Behandlet (" + faerdige.length + ")</h3>" + liste(faerdige.map(linje), "Ingen endnu") + "</section></div>";
  spillerLinks();
  function knapper(attr, behandlet) {
    ejerIndhold.querySelectorAll("[" + attr + "]").forEach(function (k) {
      k.addEventListener("click", function () {
        const alleR = rapporter();
        const r = alleR[+k.getAttribute(attr)];
        r.behandlet = behandlet;
        r.behandletTid = behandlet ? Date.now() : null;
        gemListe("mit-hotel-rapporter", alleR);
        adminSkriv((behandlet ? "Rapport behandlet: " : "Rapport åbnet igen: ") + r.grund);
        visFane();
      });
    });
  }
  knapper("data-behandl", true);
  knapper("data-aabn", false);
}

// ----- 5. IP og loginhistorik -----
function visIp() {
  ejerIndhold.innerHTML = "<p class='ejer-info'>🔐 IP-adresser kan først ses, når hotellet får en server.</p>" +
    "<table class='ejer-tabel'><thead><tr><th>Tid</th><th>Spiller</th><th>IP-adresse</th></tr></thead><tbody>" +
    logins.slice(-100).reverse().map(function (l) {
      return "<tr><td>" + tidTekst(l.tid) + "</td><td>" + rens(l.navn) + "</td><td class='graa'>kræver server</td></tr>";
    }).join("") + "</tbody></table>";
}

// ----- 6. Rum og møbler -----
function visRum() {
  const kategorier = {};
  MOEBLER.forEach(function (m) { kategorier[m.kategori || "Andet"] = true; });
  const vaerelse = rumValg === "vaerelse" ? moeblerIRummet : mitVaerelse;
  ejerIndhold.innerHTML = "<table class='ejer-tabel'><thead><tr><th>Rum</th><th>Møbler</th><th>Gæster</th></tr></thead><tbody>" +
    "<tr><td>Velkomsthallen</td><td>" + HAL_MOEBLER.length + "</td><td>" + HAL_GAESTER.filter(function (g) { return !erBannet(g.navn); }).length + "</td></tr>" +
    "<tr><td>Mit værelse</td><td>" + vaerelse.length + "</td><td>1</td></tr></tbody></table>" +
    "<p>Møbelkataloget har <b>" + MOEBLER.length + "</b> møbler i <b>" + Object.keys(kategorier).length + "</b> faner.</p>";
}

// ----- 7. Valuta og økonomi -----
function visValuta() {
  ejerIndhold.innerHTML = "<div class='ejer-kort-raekke'>" +
    "<div class='ejer-kort'><span class='ikon'><img src='billeder/glimt.png' alt='' width='22'></span>" +
    "<b>" + glimt.toLocaleString("da-DK") + "</b><span>Dine " + rens(system.valutaNavn) + "</span></div>" +
    "<div class='ejer-kort'><span class='ikon'><img src='billeder/krystal.png' alt='' width='22'></span>" +
    "<b>" + krystaller.toLocaleString("da-DK") + "</b><span>Dine Stella</span></div></div>" +
    "<label class='ejer-felt'>Giv eller tag (minus tager)<input id='v-antal' type='number' value='100'></label>" +
    "<div class='sp-handlinger'><button id='v-giv'>⭐ Giv " + rens(system.valutaNavn) + "</button><button id='v-giv-k'>🔮 Giv Stella</button></div>" +
    "<h4>Indstillinger</h4>" +
    "<label class='ejer-felt'>Navn på valutaen<input id='v-navn' type='text' maxlength='20' value='" + rens(system.valutaNavn) + "'></label>" +
    "<label class='ejer-felt'>Nye spillere starter med " + rens(system.valutaNavn) + "<input id='v-start' type='number' min='0' max='100000' value='" + system.startBeloeb + "'></label>" +
    "<label class='ejer-felt'>Nye spillere starter med Stella<input id='v-start-k' type='number' min='0' max='100000' value='" + system.startKrystaller + "'></label>" +
    "<button id='v-gem' class='lv-knap'>Gem</button>" +
    "<p class='ejer-info'>⭐ " + rens(system.valutaNavn) + " er hotellets almindelige penge, og 🔮 Stella er de sjældne. Begge kan bruges, når der kommer en shop. At give andre spillere penge kræver en server.</p>";
  function giv(hvad) {
    const antal = parseInt(document.getElementById("v-antal").value, 10) || 0;
    if (!antal) return;
    if (hvad === "Stella") faaKrystaller(antal); else faaGlimt(antal);
    adminSkriv((antal > 0 ? "Gav " : "Tog ") + Math.abs(antal) + " " + hvad + (antal > 0 ? " til " : " fra ") + FIGUR.navn);
    visValuta();
  }
  document.getElementById("v-giv").addEventListener("click", function () { giv(system.valutaNavn); });
  document.getElementById("v-giv-k").addEventListener("click", function () { giv("Stella"); });
  document.getElementById("v-gem").addEventListener("click", function () {
    system.valutaNavn = document.getElementById("v-navn").value.trim() || "Glimt";
    system.startBeloeb = Math.max(0, +document.getElementById("v-start").value || 0);
    system.startKrystaller = Math.max(0, +document.getElementById("v-start-k").value || 0);
    gemSystem();
    visGlimt();
    adminSkriv("Valuta: " + system.valutaNavn + ", start " + system.startBeloeb + " og " + system.startKrystaller + " Stella");
    visValuta();
  });
}

// ----- 8. Events og nyheder -----
function visEvents() {
  ejerIndhold.innerHTML = "<label class='ejer-felt'>Overskrift<input id='n-titel' type='text' maxlength='40' placeholder='fx Fest i hallen i aften!'></label>" +
    "<label class='ejer-felt'>Tekst<input id='n-tekst' type='text' maxlength='100' placeholder='fx Kl. 19, alle er velkomne'></label>" +
    "<label class='ejer-felt ejer-flueben'><input id='n-banner' type='checkbox' checked> Vis som stort banner øverst for alle</label>" +
    "<button id='n-send' class='lv-knap'>📢 Udsend</button>" +
    "<h4>Udsendte nyheder</h4>" + liste(nyheder.map(function (n, i) { return { n: n, i: i }; }).reverse().map(function (x) {
      const erBanner = x.n.banner !== false;
      return "<b>" + (erBanner ? "📢 " : "") + rens(x.n.titel) + "</b><span>" + rens(x.n.tekst) + " · " + tidTekst(x.n.tid) + "</span>" +
        "<button class='lille' data-banner='" + x.i + "'>" + (erBanner ? "Fjern banner for alle" : "Vis som banner") + "</button>" +
        "<button class='lille' data-slet='" + x.i + "'>Slet</button>";
    }), "Ingen nyheder endnu");
  document.getElementById("n-send").addEventListener("click", function () {
    const titel = document.getElementById("n-titel").value.trim();
    if (!titel) return;
    const somBanner = document.getElementById("n-banner").checked;
    nyheder.push({ titel: titel, tekst: document.getElementById("n-tekst").value.trim(), tid: Date.now(), banner: somBanner });
    gemListe(NYHED_NOEGLE, nyheder, 50);
    adminSkriv("Nyhed udsendt: " + titel + (somBanner ? " (banner)" : ""));
    hallensBesked();
    if (typeof visBanner === "function") visBanner();
    visEvents();
  });
  ejerIndhold.querySelectorAll("[data-banner]").forEach(function (k) {
    k.addEventListener("click", function () {
      const n = nyheder[+k.dataset.banner];
      n.banner = n.banner === false;
      gemListe(NYHED_NOEGLE, nyheder);
      adminSkriv((n.banner ? "Banner vist igen: " : "Banner fjernet for alle: ") + n.titel);
      if (typeof visBanner === "function") visBanner();
      visEvents();
    });
  });
  ejerIndhold.querySelectorAll("[data-slet]").forEach(function (k) {
    k.addEventListener("click", function () {
      const n = nyheder.splice(+k.dataset.slet, 1)[0];
      gemListe(NYHED_NOEGLE, nyheder);
      adminSkriv("Nyhed slettet: " + n.titel);
      if (typeof visBanner === "function") visBanner();
      visEvents();
    });
  });
}

// ----- 9. Administratorlog -----
function visAdminlog() {
  ejerIndhold.innerHTML = "<p class='ejer-antal'>Alt hvad der er gjort i ejerpanelet.</p>" +
    liste(adminLog.slice(-200).reverse().map(function (a) {
      return "<b>" + rens(a.hvem) + "</b> " + rens(a.hvad) + "<span>" + tidTekst(a.tid) + "</span>";
    }), "Intet endnu");
}

// ----- 10. Systemindstillinger -----
function visSystem() {
  ejerIndhold.innerHTML = "<label class='ejer-felt'>Velkomstbesked i hallen<input id='s-velkomst' type='text' maxlength='120' placeholder='Velkommen til HELLO VERA! …' value='" + rens(system.velkomst) + "'></label>" +
    "<label class='ejer-tjek'><input id='s-filter' type='checkbox'" + (system.filterTil ? " checked" : "") + "> Chatfilter er slået til</label>" +
    "<label class='ejer-felt'>Ekstra grimme ord (adskil med komma)<input id='s-ord' type='text' value='" + rens(system.ekstraOrd) + "'></label>" +
    "<label class='ejer-felt'>Timeout varer (minutter)<input id='s-timeout' type='number' min='1' max='1440' value='" + system.timeoutMin + "'></label>" +
    "<button id='s-gem' class='lv-knap'>Gem</button>" +
    "<p class='ejer-info'>Ejere: " + rens(EJERE.join(", ")) + " (ændres øverst i js/konto.js)</p>";
  document.getElementById("s-gem").addEventListener("click", function () {
    system.velkomst = document.getElementById("s-velkomst").value.trim();
    system.filterTil = document.getElementById("s-filter").checked;
    system.ekstraOrd = document.getElementById("s-ord").value;
    system.timeoutMin = Math.max(1, +document.getElementById("s-timeout").value || 5);
    gemSystem();
    lavEkstraOrd();
    adminSkriv("Systemindstillinger gemt");
    hallensBesked();
    besked.textContent = "Gemt!";
  });
}
