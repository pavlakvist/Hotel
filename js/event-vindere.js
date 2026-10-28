// =============================================================
//  📝 Eventnoter, 🏆 vindere og 🎁 én gratis ting
//  - Ejerpanel → "📝 Eventnoter": ejeren og Eventværter skriver, hvordan et event gik,
//    og hvem der var træls. Ejeren og alle ansatte kan læse noterne.
//  - Ejerpanel → "🏆 Vindere": ejeren og Eventværter skriver vinderne ind efter et event.
//    Så står de i en boks i højre side for alle (✕ lukker den).
//  - Vinderne, og den der har fødselsdag i dag, får en "Tillykke"-boks med en knap,
//    der åbner shoppen. Der må de vælge PRÆCIS én gratis ting (også rares).
//  - Ejerpanel → "💎 Rares" (kun ejeren): hvem der har købt og vundet rares.
//  - Nyt skilt 🎪 Eventfolk (i Ansættelse): kan skrive eventnoter og vindere,
//    men ikke sende nyheder eller låse rum. Har også Mit job og Staff chat.
//  (Kræver database-21-eventnoter-vindere.sql.)
// =============================================================
const EV_LUKKET_NOEGLE = "mit-hotel-vindere-lukket";      // vinder-bokse man har lukket med ✕
const EV_GAVE_LUKKET_NOEGLE = "mit-hotel-gave-lukket";    // tillykke-bokse man har lukket med ✕
const EV_MANGLER = "⚠️ Serveren kender ikke eventnoter endnu. Kør database-21-eventnoter-vindere.sql i Supabase → SQL Editor.";

function evHent(noegle) { try { return JSON.parse(localStorage.getItem(noegle) || "[]"); } catch (e) { return []; } }
function evGem(noegle, v) { try { localStorage.setItem(noegle, JSON.stringify(v)); } catch (e) {} }
function evMaaSkrive() { const r = minRolle(); return r === "ejer" || r === "eventvaert" || r === "eventfolk"; }


// -------------------------------------------------------------
//  🎪 Det nye skilt: Eventfolk
// -------------------------------------------------------------
if (!SKILTE.some(function (s) { return s.id === "eventfolk"; })) {
  const efter = SKILTE.findIndex(function (s) { return s.id === "eventvaert"; });
  SKILTE.splice(efter + 1, 0, { id: "eventfolk", navn: "Eventfolk", tekst: "Hjælper med events og skriver noter og vindere.",
    fil: "billeder/skilte/eventfolk.png" });
}
ROLLE_FANER.eventfolk = ["guide", "eventnoter", "vindere", "mitjob", "staffchat"];
ROLLE_NAVN.eventfolk = "🛡️ Eventfolk-panel";
if (ANSAT_SKILTE.indexOf("eventfolk") < 0) ANSAT_SKILTE.push("eventfolk");
if (typeof STAFF_RANG !== "undefined" && !STAFF_RANG.some(function (r) { return r[0] === "eventfolk"; })) {
  STAFF_RANG.splice(STAFF_RANG.findIndex(function (r) { return r[0] === "eventvaert"; }) + 1, 0, ["eventfolk", "🎪 Eventfolk"]);
}
if (typeof JOB_KAN !== "undefined") JOB_KAN.eventfolk = ["🛡 Får mod-knappen med fanerne Eventnoter og Vindere",
  "📝 Skriver eventnoter: hvordan eventet gik, og hvem der var træls",
  "🏆 Skriver vinderne ind efter et event, så de står i højre side for alle",
  "🎁 Vinderne får én gratis ting i shoppen (også rares)"].concat(typeof PERSONALE_KAN !== "undefined" ? PERSONALE_KAN : []);
if (typeof JOB_BESKRIVELSE !== "undefined") {
  JOB_BESKRIVELSE.eventfolk = "Som eventfolk hjælper du eventværterne med at holde events. Efter hvert event skriver du en eventnote om, hvordan det gik, og hvem der var træls, og du skriver vinderne ind, så de kan vælge én gratis ting i shoppen.";
  SKILTE.forEach(function (sk) { if (sk.id === "eventfolk") sk.beskrivelse = JOB_BESKRIVELSE.eventfolk; });
}
if (typeof ROLLE_GUIDE !== "undefined") ROLLE_GUIDE.eventfolk = "Du er eventfolk. Du hjælper med events, og efter hvert event skriver du en eventnote (hvordan det gik, og hvem der var træls) og skriver vinderne ind. Vinderne kan så vælge én gratis ting i shoppen.";
function evErEjer() { return EJERE.indexOf(FIGUR.navn) >= 0; }
function evTid(t) { return tidTekst(new Date(t).getTime()); }
function evFejl(e) { return /function|schema cache|does not exist/i.test(e.message) ? EV_MANGLER : e.message; }

// To klik: første gang står der "Er du sikker?"
function evToKlik(knap, tekst, gør) {
  knap.addEventListener("click", function () {
    if (!knap.classList.contains("sikker")) {
      knap.classList.add("sikker");
      knap.textContent = tekst;
      setTimeout(function () { if (knap.isConnected) { knap.classList.remove("sikker"); knap.textContent = knap.dataset.tekst; } }, 3000);
      return;
    }
    gør();
  });
  knap.dataset.tekst = knap.textContent;
}


// -------------------------------------------------------------
//  Fanerne i panelet
// -------------------------------------------------------------
// Eventnoter: alle med et panel kan læse dem. Vindere: ejeren og Eventværter. Rares: kun ejeren.
Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("eventnoter") < 0) ROLLE_FANER[r].push("eventnoter"); });
if (ROLLE_FANER.eventvaert.indexOf("vindere") < 0) ROLLE_FANER.eventvaert.push("vindere");

const evFaner = [["eventnoter", "📝 Eventnoter"], ["vindere", "🏆 Vindere"], ["rares", "💎 Rares"]].map(function (f) {
  const k = document.createElement("button");
  k.dataset.fane = f[0];
  k.textContent = f[1];
  k.addEventListener("click", function () { ejerFane = f[0]; visFane(); });
  return k;
});
(function () {
  const efter = document.querySelector('#ejer-faner [data-fane="events"]');
  if (efter) efter.after.apply(efter, evFaner);
  else evFaner.forEach(function (k) { document.getElementById("ejer-faner").appendChild(k); });
})();
function evFanerSkjul() { evFaner.forEach(function (k) { k.hidden = !rolleMaa(k.dataset.fane); }); }
evFanerSkjul();
setInterval(evFanerSkjul, 1000);

PANEL_HJAELP.eventnoter = { titel: "📝 Eventnoter", tekst: "Noter efter hvert event: hvordan det gik, og hvem der var træls.",
  punkter: ["Ejeren, Eventværter og Eventfolk skriver noterne. Alle ansatte kan læse dem.",
    "Skriv navnet på eventet, hvordan det forløb, og hvem der lavede ballade.", "🗑 sletter en note (tryk to gange)."] };
PANEL_HJAELP.vindere = { titel: "🏆 Vindere", tekst: "Skriv vinderne ind efter et event. De står i en boks i højre side for alle. Ejeren, Eventværter og Eventfolk kan bruge fanen.",
  punkter: ["Skriv flere vindere med komma imellem, fx <b>Ida, Noah</b>.",
    "Hver vinder får en 🎉 Tillykke-boks og kan vælge <b>én</b> gratis ting i shoppen (også rares).",
    "Spillere med fødselsdag får også én gratis ting på dagen.", "🗑 Fjern tager boksen væk igen."] };
PANEL_HJAELP.rares = { titel: "💎 Rares", tekst: "Hvem har købt en rare i shoppen, og hvem har vundet en.",
  punkter: ["Kun for ejeren.", "Nederst står alle gratis ting fra events og fødselsdage, og om de er valgt."] };

// Det nye står også i Guide-fanen, i "Mit job" og i jobbeskrivelserne
(function () {
  const evKan = ["📝 Skriver eventnoter: hvordan eventet gik, og hvem der var træls",
    "🏆 Skriver vinderne ind efter et event, så de står i højre side for alle",
    "🎁 Vinderne får én gratis ting i shoppen (også rares)"];
  if (typeof JOB_KAN !== "undefined") {
    JOB_KAN.eventvaert = JOB_KAN.eventvaert || [];
    evKan.slice().reverse().forEach(function (k) { if (JOB_KAN.eventvaert.indexOf(k) < 0) JOB_KAN.eventvaert.splice(1, 0, k); });
    ["mod", "staff", "hjaelper", "bygmester", "support", "content-creator"].forEach(function (id) {
      const l = JOB_KAN[id];
      if (l && l.indexOf("📝 Kan læse eventnoterne i panelet") < 0) l.push("📝 Kan læse eventnoterne i panelet");
    });
  }
  if (typeof EJER_KAN !== "undefined") EJER_KAN.push("📝 Skriver eventnoter og 🏆 vindere, og ser 💎 hvem der har købt og vundet rares");
  if (typeof ROLLE_GUIDE !== "undefined") ROLLE_GUIDE.eventvaert += " Efter hvert event skriver du en eventnote (hvordan det gik, og hvem der var træls) og skriver vinderne ind. Vinderne kan så vælge én gratis ting i shoppen.";
  const ekstra = " Efter hvert event skriver du en eventnote om, hvordan det gik, og skriver vinderne ind, så de kan vælge én gratis ting i shoppen.";
  if (typeof JOB_BESKRIVELSE !== "undefined" && JOB_BESKRIVELSE.eventvaert && JOB_BESKRIVELSE.eventvaert.indexOf("eventnote") < 0) {
    JOB_BESKRIVELSE.eventvaert += ekstra;
    if (typeof SKILTE !== "undefined") SKILTE.forEach(function (sk) { if (sk.id === "eventvaert") sk.beskrivelse = JOB_BESKRIVELSE.eventvaert; });
  }
  if (PANEL_HJAELP.events) PANEL_HJAELP.events.punkter.push("📝 Efter eventet: skriv en note under <b>Eventnoter</b>, og skriv vinderne ind under <b>Vindere</b>.");
})();

let evNoter = null;           // null = ikke hentet endnu
let evNoterFejl = "";
let evVindere = [];
let evMine = [];              // mine gratis ting, der ikke er valgt endnu
let evFoedselsdag = false;
let evVindereFejl = "";
let evRares = null;
let evRaresFejl = "";
let evRaresFilter = "alle";
let evRaresSoeg = "";

function evHentNoter() {
  const token = mitToken();
  if (!SERVER.til || !token || !minRolle()) return;
  serverKald("hv_eventnoter_hent", { p_token: token }).then(function (svar) {
    const foer = JSON.stringify(evNoter);
    evNoter = svar || [];
    evNoterFejl = "";
    if (JSON.stringify(evNoter) !== foer) tegnPanelIgen(["eventnoter"]);
  }).catch(function (e) { evNoterFejl = evFejl(e); evNoter = evNoter || []; tegnPanelIgen(["eventnoter"]); });
}
function evHentRares() {
  const token = mitToken();
  if (!SERVER.til || !token || !evErEjer()) return;
  serverKald("hv_rares_oversigt", { p_token: token }).then(function (svar) {
    const foer = JSON.stringify(evRares);
    evRares = svar || { rares: [], gevinster: [] };
    evRaresFejl = "";
    if (JSON.stringify(evRares) !== foer) tegnPanelIgen(["rares"]);
  }).catch(function (e) { evRaresFejl = evFejl(e); evRares = evRares || { rares: [], gevinster: [] }; tegnPanelIgen(["rares"]); });
}
setInterval(function () {
  if (ejerVindue.hidden) return;
  if (ejerFane === "eventnoter") evHentNoter();
  if (ejerFane === "rares") evHentRares();
}, 5000);

const visFaneFoerEvent = visFane;
visFane = function () {
  const minFane = ["eventnoter", "vindere", "rares"].indexOf(ejerFane) >= 0;
  if (minFane) ejerIndhold.innerHTML = "";      // så den rigtige ❓-boks kommer øverst
  visFaneFoerEvent();
  if (ejerVindue.hidden || !minFane || !rolleMaa(ejerFane)) return;
  const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
  ejerIndhold.innerHTML = "";
  const sek = document.createElement("div");
  sek.className = "ev-fane";
  ejerIndhold.appendChild(sek);
  if (ejerFane === "eventnoter") visEventnoter(sek);
  if (ejerFane === "vindere") visVinderFane(sek);
  if (ejerFane === "rares") visRares(sek);
  if (hjaelp) ejerIndhold.prepend(hjaelp);
};

// ----- 📝 Eventnoter -----
function visEventnoter(sek) {
  if (evNoter === null) evHentNoter();
  let html = "";
  if (evMaaSkrive()) {
    html += "<section class='ev-skriv'><h3>📝 Skriv en note om eventet</h3>" +
      "<label class='ejer-felt'>Hvilket event?<input id='en-event' type='text' maxlength='80' placeholder='Fx Quiz i Event rum 1'></label>" +
      "<label class='ejer-felt'>Hvordan gik det?<textarea id='en-forloeb' rows='4' maxlength='3000' placeholder='Hvor mange kom, hvad skete der, hvad gik godt og skidt …'></textarea></label>" +
      "<label class='ejer-felt'>Hvem var træls? 😤<input id='en-traels' type='text' maxlength='1000' placeholder='Fx Noah spammede chatten'></label>" +
      "<button id='en-gem'>📝 Gem noten</button><p class='ejer-info' id='en-svar'></p></section>";
  } else {
    html += "<p class='ejer-info'>📖 Her kan du læse noterne fra eventene.</p>";
  }
  html += "<h3>Noter fra eventene</h3>";
  if (evNoterFejl) html += "<p class='ev-fejl'>" + rens(evNoterFejl) + "</p>";
  if (evNoter === null) html += "<p class='tom'>Henter noterne …</p>";
  else if (!evNoter.length) html += "<p class='tom'>Der er ingen noter endnu.</p>";
  else html += "<ul class='ev-noter'>" + evNoter.map(function (n) {
    const maaSlette = evErEjer() || n.hvem.toLowerCase() === FIGUR.navn.toLowerCase();
    return "<li><div class='ev-note-top'><b>🎪 " + rens(n.event || "Event") + "</b><small>" + rens(n.hvem) + " · " + evTid(n.tid) + "</small>" +
      (maaSlette ? "<button class='ev-slet' data-en-slet='" + n.id + "'>🗑</button>" : "") + "</div>" +
      (n.forloeb ? "<p>" + rens(n.forloeb).replace(/\n/g, "<br>") + "</p>" : "") +
      (n.traels ? "<p class='ev-traels'>😤 <b>Træls:</b> " + rens(n.traels) + "</p>" : "") + "</li>";
  }).join("") + "</ul>";
  sek.innerHTML = html;

  const gem = document.getElementById("en-gem");
  if (gem) gem.addEventListener("click", function () {
    const svar = document.getElementById("en-svar");
    const event = document.getElementById("en-event").value, forloeb = document.getElementById("en-forloeb").value,
      traels = document.getElementById("en-traels").value;
    gem.disabled = true;
    serverKald("hv_eventnote_skriv", { p_token: mitToken(), p_event: event, p_forloeb: forloeb, p_traels: traels }).then(function () {
      adminSkriv("Skrev en eventnote" + (event.trim() ? " om " + event.trim() : ""));
      besked.textContent = "📝 Noten er gemt.";
      evNoter = null;
      visFane();
    }).catch(function (e) { gem.disabled = false; svar.textContent = evFejl(e); });
  });
  sek.querySelectorAll("[data-en-slet]").forEach(function (k) {
    evToKlik(k, "Er du sikker?", function () {
      serverKald("hv_eventnote_slet", { p_token: mitToken(), p_id: +k.dataset.enSlet }).then(function () {
        evNoter = evNoter.filter(function (n) { return n.id !== +k.dataset.enSlet; });
        visFane();
      }).catch(function (e) { besked.textContent = evFejl(e); });
    });
  });
}

// ----- 🏆 Vindere -----
function visVinderFane(sek) {
  const navne = alleSpillere().map(function (s) { return s.navn; }).filter(function (n) { return !erComputerGaest(n); });
  let html = "<section class='ev-skriv'><h3>🏆 Skriv vinderne ind</h3>" +
    "<label class='ejer-felt'>Hvilket event?<input id='vi-event' type='text' maxlength='80' placeholder='Fx Quiz i Event rum 1'></label>" +
    "<label class='ejer-felt'>Vindere (komma imellem)<input id='vi-navne' type='text' list='vi-forslag' autocomplete='off' placeholder='Fx Ida, Noah'></label>" +
    "<datalist id='vi-forslag'>" + navne.map(function (n) { return "<option value='" + rens(n) + "'>"; }).join("") + "</datalist>" +
    "<label class='ejer-felt'>Hvad har de vundet?<input id='vi-gevinst' type='text' maxlength='200' value='1 gratis ting i shoppen 🎁'></label>" +
    "<p class='ejer-info'>🎁 Hver vinder kan vælge <b>én</b> gratis ting i shoppen (også rares).</p>" +
    "<div class='bs-raekke'><span class='bs-lbl'>🎨 Farve</span><div class='bs-farver'>" + Object.keys(EV_FARVER).map(function (id) {
      return "<button type='button' data-vi-farve='" + id + "' title='" + rens(EV_FARVER[id].navn) + "' style='background:" + (id === "nat" ? "#1d2638" : EV_FARVER[id].kant) + "'" + (id === evValg.farve ? " class='valgt'" : "") + "></button>";
    }).join("") + "</div></div>" +
    "<div class='bs-raekke'><span class='bs-lbl'>✨ Effekt</span><div class='bs-pynt'>" + Object.keys(EV_EFFEKTER).map(function (id) {
      return "<button type='button' data-vi-effekt='" + id + "'" + (id === evValg.effekt ? " class='valgt'" : "") + ">" + EV_EFFEKTER[id].ikon + " " + EV_EFFEKTER[id].navn + "</button>";
    }).join("") + "</div></div>" +
    "<div class='bs-lbl'>👀 Sådan kommer boksen til at se ud</div><div id='vi-proeve'></div>" +
    "<button id='vi-gem'>🏆 Vis vinderne for alle</button><p class='ejer-info' id='vi-svar'></p></section>" +
    "<h3>Vindere de sidste 7 dage</h3>";
  if (evVindereFejl) html += "<p class='ev-fejl'>" + rens(evVindereFejl) + "</p>";
  html += evVindere.length ? "<ul class='ev-noter'>" + evVindere.map(function (v) {
    return "<li><div class='ev-note-top'><b>🏆 " + rens(v.event || "Event") + "</b><small>" + rens(v.hvem) + " · " + evTid(v.tid) + "</small>" +
      "<button class='ev-slet' data-vi-slet='" + v.id + "'>🗑 Fjern</button></div>" +
      "<p>👑 " + v.navne.map(rens).join(", ") + (v.gevinst ? " · " + rens(v.gevinst) : "") + "</p></li>";
  }).join("") + "</ul>" : "<p class='tom'>Ingen vindere endnu.</p>";
  sek.innerHTML = html;

  function proeve() {
    const navne = document.getElementById("vi-navne").value.split(/\s*[,;]\s*/).filter(Boolean);
    document.getElementById("vi-proeve").innerHTML = vinderBoksHtml({ event: document.getElementById("vi-event").value.trim(),
      navne: navne.length ? navne : ["Navn"], gevinst: document.getElementById("vi-gevinst").value, hvem: FIGUR.navn, tid: Date.now(),
      stil: evValg }, true, false);
  }
  function vaelg(hvad, id) {
    evValg[hvad] = id;
    try { localStorage.setItem(EV_VALG_NOEGLE, JSON.stringify(evValg)); } catch (e) {}
    sek.querySelectorAll("[data-vi-" + hvad + "]").forEach(function (k) { k.classList.toggle("valgt", k.getAttribute("data-vi-" + hvad) === id); });
    proeve();
  }
  sek.querySelectorAll("[data-vi-farve]").forEach(function (k) { k.addEventListener("click", function () { vaelg("farve", k.dataset.viFarve); }); });
  sek.querySelectorAll("[data-vi-effekt]").forEach(function (k) { k.addEventListener("click", function () { vaelg("effekt", k.dataset.viEffekt); }); });
  ["vi-event", "vi-navne", "vi-gevinst"].forEach(function (id) { document.getElementById(id).addEventListener("input", proeve); });
  proeve();

  document.getElementById("vi-gem").addEventListener("click", function () {
    const knap = this, svar = document.getElementById("vi-svar");
    const event = document.getElementById("vi-event").value, liste = document.getElementById("vi-navne").value,
      gevinst = document.getElementById("vi-gevinst").value;
    knap.disabled = true;
    const data = { p_token: mitToken(), p_event: event, p_navne: liste, p_gevinst: gevinst };
    serverKald("hv_vindere_saet", Object.assign({ p_stil: { farve: evValg.farve, effekt: evValg.effekt } }, data)).catch(function (e) {
      // er database-21 ikke kørt igen endnu, gemmes vinderne uden farve og effekt
      if (/function|schema cache/i.test(e.message)) return serverKald("hv_vindere_saet", data);
      throw e;
    }).then(function (r) {
      adminSkriv("Skrev vindere ind" + (event.trim() ? " for " + event.trim() : "") + ": " + r.navne.join(", "));
      besked.textContent = "🏆 Vinderne står nu i højre side for alle.";
      evHentVindere();
      setTimeout(visFane, 400);
    }).catch(function (e) { knap.disabled = false; svar.textContent = evFejl(e); });
  });
  sek.querySelectorAll("[data-vi-slet]").forEach(function (k) {
    evToKlik(k, "Er du sikker?", function () {
      serverKald("hv_vinder_slet", { p_token: mitToken(), p_id: +k.dataset.viSlet }).then(function () {
        evVindere = evVindere.filter(function (v) { return v.id !== +k.dataset.viSlet; });
        visFane();
        visHoejre();
      }).catch(function (e) { besked.textContent = evFejl(e); });
    });
  });
}

// ----- 💎 Rares (kun ejeren) -----
function visRares(sek) {
  if (evRares === null) { evHentRares(); sek.innerHTML = "<p class='tom'>Henter …</p>"; return; }
  const alle = evRares.rares || [], gaver = evRares.gevinster || [];
  const q = evRaresSoeg.trim().toLowerCase();
  const vist = alle.filter(function (r) {
    return (evRaresFilter === "alle" || r.hvordan === evRaresFilter) &&
      (!q || r.navn.toLowerCase().indexOf(q) >= 0 || (r.moebel_navn || "").toLowerCase().indexOf(q) >= 0);
  });
  const koebt = alle.filter(function (r) { return r.hvordan === "koebt"; }).length;
  let html = (evRaresFejl ? "<p class='ev-fejl'>" + rens(evRaresFejl) + "</p>" : "") +
    "<h3>💎 Hvem har rares?</h3><p class='ejer-info'>💎 " + koebt + " købt · 🏆 " + (alle.length - koebt) + " vundet</p>" +
    "<div class='ev-filter'>" + [["alle", "Alle"], ["koebt", "🛒 Købt"], ["vundet", "🏆 Vundet"]].map(function (f) {
      return "<button data-ra-filter='" + f[0] + "'" + (f[0] === evRaresFilter ? " class='valgt'" : "") + ">" + f[1] + "</button>";
    }).join("") + "<input id='ra-soeg' type='text' placeholder='🔍 Søg efter navn eller møbel …' value='" + rens(evRaresSoeg) + "'></div>";
  html += vist.length ? "<table class='ev-tabel'><tr><th>Hvem</th><th>Rare</th><th>Hvordan</th><th>Hvornår</th></tr>" + vist.map(function (r) {
    return "<tr><td><b>" + rens(r.navn) + "</b></td><td>" + rens(r.moebel_navn || r.moebel) + "</td><td>" +
      (r.hvordan === "koebt" ? "🛒 Købt" + (r.pris ? " (🔮 " + r.pris + ")" : "") : "🏆 Vundet") + "</td><td>" + evTid(r.tid) + "</td></tr>";
  }).join("") + "</table>" : "<p class='tom'>" + (alle.length ? "Ingen passer til søgningen." : "Ingen har købt eller vundet en rare endnu.") + "</p>";
  html += "<h3>🎁 Gratis ting fra events og fødselsdage</h3>" + (gaver.length ? "<table class='ev-tabel'><tr><th>Hvem</th><th>Hvorfor</th><th>Valgt</th></tr>" + gaver.map(function (g) {
    return "<tr><td><b>" + rens(g.navn) + "</b></td><td>" + (g.grund === "foedselsdag" ? "🎂 Fødselsdag" : "🏆 " + rens(g.event || "Event")) +
      "<br><small>" + evTid(g.oprettet) + "</small></td><td>" + (g.brugt ? "✅ " + rens(g.moebel_navn || "") + "<br><small>" + evTid(g.brugt) + "</small>" : "⏳ Ikke valgt endnu") + "</td></tr>";
  }).join("") + "</table>" : "<p class='tom'>Ingen gratis ting endnu.</p>");
  sek.innerHTML = html;

  sek.querySelectorAll("[data-ra-filter]").forEach(function (k) {
    k.addEventListener("click", function () { evRaresFilter = k.dataset.raFilter; visFane(); });
  });
  const soeg = document.getElementById("ra-soeg");
  soeg.addEventListener("input", function () {
    evRaresSoeg = soeg.value;
    const pos = soeg.selectionStart;
    visFane();
    const ny = document.getElementById("ra-soeg");
    ny.focus();
    ny.setSelectionRange(pos, pos);
  });
}


// -------------------------------------------------------------
//  Boksene i højre side: 🎉 Tillykke og 🏆 Vindere
// -------------------------------------------------------------
const evHoejre = document.createElement("div");
evHoejre.id = "ev-hoejre";
document.body.appendChild(evHoejre);
let evHoejreFoer = "";

function evHentVindere() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_vindere_hent", { p_token: token }).then(function (svar) {
    evVindere = svar.vindere || [];
    evMine = svar.gevinster || [];
    evFoedselsdag = !!svar.foedselsdag;
    evVindereFejl = "";
    if (gaveId && !evMine.some(function (g) { return g.id === gaveId; })) slutGave();
    visHoejre();
    if (!shopVindue.hidden) visShop();
  }).catch(function (e) { evVindereFejl = evFejl(e); });
}
evHentVindere();
setInterval(evHentVindere, 6000);

// Farver (de samme som bannerne) og effekter på vinderboksen
const EV_FARVER = typeof BANNER_FARVER !== "undefined" ? BANNER_FARVER : {
  groen: { navn: "Grøn", bg: "#fbf6ea", kant: "#4e7d4a", ring: "#9ccc8f", titel: "#1f3a1c", under: "#7a8a76" } };
const EV_EFFEKTER = {
  ingen: { navn: "Ingen", ikon: "🚫" },
  gloed: { navn: "Glød", ikon: "🌟" },
  glimmer: { navn: "Glimmer", ikon: "✨" },
  konfetti: { navn: "Konfetti", ikon: "🎊" },
  hjerter: { navn: "Hjerter", ikon: "💖" },
  regnbue: { navn: "Regnbue", ikon: "🌈" },
  hop: { navn: "Hop", ikon: "🦘" },
  blink: { navn: "Blink", ikon: "💡" },
};
const EV_VALG_NOEGLE = "mit-hotel-vinder-stil";
let evValg = { farve: "guld", effekt: "glimmer" };
try { Object.assign(evValg, JSON.parse(localStorage.getItem(EV_VALG_NOEGLE) || "{}")); } catch (e) {}

// Små ting, der flyver rundt i boksen (glimmer, konfetti, hjerter)
function evFxHtml(effekt) {
  const tegn = { glimmer: ["✨", "⭐", "✦"], konfetti: ["▮", "▮", "▮", "▮"], hjerter: ["💖", "💕", "💗"] }[effekt];
  if (!tegn) return "";
  const farver = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#ff7eb6"];
  let html = "<span class='ev-fx-lag'>";
  for (let i = 0; i < 9; i++) {
    html += "<span class='ev-fx ev-fx-" + effekt + "' style='left:" + (6 + i * 11) + "%;animation-delay:" + (i * 0.37 % 2.2).toFixed(2) + "s;" +
      (effekt === "konfetti" ? "color:" + farver[i % farver.length] + ";" : "") + "'>" + tegn[i % tegn.length] + "</span>";
  }
  return html + "</span>";
}

// Én vinderboks. fuld = vis gevinsten og hvem der skrev det.
function vinderBoksHtml(v, fuld, lukKnap) {
  const st = v.stil || {};
  const f = EV_FARVER[st.farve] || EV_FARVER.groen || EV_FARVER[Object.keys(EV_FARVER)[0]];
  const eff = EV_EFFEKTER[st.effekt] ? st.effekt : "ingen";
  return "<div class='ev-boks ev-vinder ev-eff-" + eff + "' style='background:linear-gradient(160deg, " + f.ring + ", transparent 85%), " + f.bg + ";border-width:3px;border-color:" + f.kant + ";--ev-ring:" + f.ring + ";--ev-kant:" + f.kant + "'>" +
    evFxHtml(eff) + (lukKnap ? "<button class='ev-luk' data-ev-luk='" + v.id + "' title='Luk'>✕</button>" : "") +
    "<h4 style='color:" + f.titel + "'>🏆 Vinderne" + (v.event ? " af " + rens(v.event) : "") + "</h4><ul style='color:" + f.titel + "'>" + v.navne.map(function (n) {
      return "<li" + (n === FIGUR.navn ? " class='mig'" : "") + ">👑 " + rens(n) + (n === FIGUR.navn ? " (dig!)" : "") + "</li>";
    }).join("") + "</ul>" +
    // gevinsten og hvem der skrev det, ser kun vinderne selv (og ejeren). De andre ser bare spillet og navnene.
    (fuld ? (v.gevinst ? "<p style='color:" + f.under + "'>" + rens(v.gevinst) + "</p>" : "") +
      "<small style='color:" + f.under + "'>" + rens(v.hvem) + " · " + evTid(v.tid) + "</small>" : "") + "</div>";
}

function visHoejre() {
  const lukket = evHent(EV_LUKKET_NOEGLE), gaveLukket = evHent(EV_GAVE_LUKKET_NOEGLE);
  const vindere = evVindere.filter(function (v) { return lukket.indexOf(v.id) < 0; }).slice(0, 3);
  const gaveNoegle = evMine.map(function (g) { return g.id; }).join(",") + (evFoedselsdag ? "|fd" + new Date().getFullYear() : "");
  const visGave = gaveNoegle && gaveLukket.indexOf(gaveNoegle) < 0;
  const noegle = JSON.stringify([vindere, visGave, gaveNoegle, evMine.length, !!gaveId]);
  if (noegle === evHoejreFoer) return;
  evHoejreFoer = noegle;

  let html = "";
  if (visGave) {
    const vandt = evMine.filter(function (g) { return g.grund === "vinder"; });
    const titel = vandt.length ? "🎉 Tillykke med gevinsten, " + rens(FIGUR.navn) + "!" : "🎂 Tillykke med fødselsdagen, " + rens(FIGUR.navn) + "!";
    const tekst = evFoedselsdag && vandt.length ? "Og tillykke med fødselsdagen 🎂 " : "";
    html += "<div class='ev-boks ev-gave'><button class='ev-luk' data-ev-gave-luk title='Luk'>✕</button><h4>" + titel + "</h4>" +
      (evMine.length
        ? "<p>" + tekst + (vandt.length && vandt[0].event ? "Du vandt <b>" + rens(vandt[0].event) + "</b>. " : "") +
          "Du må vælge <b>én</b> gratis ting i shoppen 🎁" + (evMine.length > 1 ? " (du har " + evMine.length + ")" : "") + "</p>" +
          "<button class='ev-gave-knap' data-ev-vaelg>" + (gaveId ? "🛒 Shoppen er åben" : "🎁 Vælg din gratis ting") + "</button>"
        : "<p>Hav en dejlig dag på HELLO VERA 🎉</p>") + "</div>";
  }
  vindere.forEach(function (v) {
    html += vinderBoksHtml(v, v.navne.indexOf(FIGUR.navn) >= 0 || evErEjer(), true);
  });
  evHoejre.innerHTML = html;
  evHoejre.hidden = !html;

  evHoejre.querySelectorAll("[data-ev-luk]").forEach(function (k) {
    k.addEventListener("click", function () {
      const l = evHent(EV_LUKKET_NOEGLE);
      l.push(+k.dataset.evLuk);
      evGem(EV_LUKKET_NOEGLE, l.slice(-50));
      visHoejre();
    });
  });
  const gl = evHoejre.querySelector("[data-ev-gave-luk]");
  if (gl) gl.addEventListener("click", function () {
    const l = evHent(EV_GAVE_LUKKET_NOEGLE);
    l.push(gaveNoegle);
    evGem(EV_GAVE_LUKKET_NOEGLE, l.slice(-20));
    visHoejre();
  });
  const vk = evHoejre.querySelector("[data-ev-vaelg]");
  if (vk) vk.addEventListener("click", startGave);
}


// -------------------------------------------------------------
//  🎁 Shoppen: vælg præcis én gratis ting
// -------------------------------------------------------------
let gaveId = null;          // den gevinst, man er ved at bruge
let gaveSender = false;

const gaveBaand = document.createElement("div");
gaveBaand.id = "gave-baand";
gaveBaand.hidden = true;
document.getElementById("shop-faner").after(gaveBaand);

function startGave() {
  if (!evMine.length) return;
  gaveId = evMine[0].id;
  shopFane = "moebler";
  shopValgt = null;
  if (typeof RARES_KAT !== "undefined" && RARES_KAT.ting.length) shopKat = RARES_KAT;
  evHoejreFoer = "";
  visHoejre();
  aabnShop();
}
function slutGave() {
  gaveId = null;
  evHoejreFoer = "";
  visHoejre();
  if (!shopVindue.hidden) visShop();
}

const visShopFoerGave = visShop;
visShop = function () {
  visShopFoerGave();
  if (shopVindue.hidden) return;
  if (gaveId) {
    gaveBaand.hidden = false;
    gaveBaand.className = "aktiv";
    gaveBaand.innerHTML = "<span>🎁 <b>Vælg PRÆCIS én gratis ting.</b> Alt er gratis, også 💎 rares. Klik på en ting og tryk <b>Tag den gratis</b>.</span>" +
      "<button id='gave-senere'>Senere</button>";
    document.getElementById("gave-senere").addEventListener("click", slutGave);
    document.querySelectorAll("#shop-gitter .butik-pris").forEach(function (p) { p.textContent = "🎁 Gratis"; });
  } else if (evMine.length) {
    gaveBaand.hidden = false;
    gaveBaand.className = "";
    gaveBaand.innerHTML = "<span>🎁 Du har " + (evMine.length > 1 ? evMine.length + " gratis ting" : "en gratis ting") + " til gode!</span><button id='gave-start'>Vælg nu</button>";
    document.getElementById("gave-start").addEventListener("click", startGave);
  } else {
    gaveBaand.hidden = true;
  }
};

const visShopValgtFoerGave = visShopValgt;
visShopValgt = function () {
  visShopValgtFoerGave();
  if (!gaveId || !shopValgt || shopFane !== "moebler") return;
  document.getElementById("shop-valgt-pris").innerHTML = "🎁 Gratis" + (erRare(shopValgt) ? " · 💎 Rare" : "");
  const koeb = document.getElementById("shop-koeb");
  koeb.disabled = gaveSender;
  koeb.classList.remove("sikker");
  koeb.textContent = "🎁 Tag den gratis";
};

// Klik på Køb: i gave-tilstand tages tingen gratis (to klik), ellers huskes det, hvis det var en rare
shopVindue.addEventListener("click", function (e) {
  const koeb = e.target.closest("#shop-koeb");
  if (!koeb || !shopValgt) return;
  if (!gaveId) {
    const type = shopValgt, foer = lager.length;
    setTimeout(function () {
      if (lager.length > foer && erRare(type)) {
        serverKald("hv_rare_koebt", { p_token: mitToken(), p_moebel: type.id, p_moebel_navn: type.navn, p_pris: pris(type).beloeb }).catch(function () {});
      }
    }, 0);
    return;
  }
  e.stopImmediatePropagation();
  e.preventDefault();
  if (gaveSender) return;
  if (!koeb.classList.contains("sikker")) {
    koeb.classList.add("sikker");
    koeb.textContent = "Er du sikker? Du får kun én";
    return;
  }
  const type = shopValgt, id = gaveId;
  gaveSender = true;
  koeb.disabled = true;
  serverKald("hv_gevinst_brug", { p_token: mitToken(), p_id: id, p_moebel: type.id, p_moebel_navn: type.navn, p_rare: erRare(type) }).then(function () {
    gaveSender = false;
    laegILager(type.id);
    evMine = evMine.filter(function (g) { return g.id !== id; });
    svaev("🎁");
    besked.textContent = "🎁 Du fik " + type.navn + " gratis! Den ligger i Mine ting 📦";
    slutGave();
  }).catch(function (e2) {
    gaveSender = false;
    besked.textContent = evFejl(e2);
    slutGave();
    evHentVindere();
  });
}, true);


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const evStil = document.createElement("style");
evStil.textContent =
  "#ev-hoejre { position: fixed; right: 12px; top: 120px; z-index: 7; width: 230px; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }" +
  "#ev-hoejre[hidden] { display: none; }" +
  ".ev-boks { position: relative; pointer-events: auto; padding: 10px 12px; background: #fbf6ea; border: 2px solid #4e7d4a; border-radius: 10px;" +
  " box-shadow: 0 4px 12px rgba(0,0,0,.25); font: 12px Verdana, sans-serif; color: #33402c; }" +
  ".ev-boks h4 { margin: 0 18px 6px 0; font-size: 13px; color: #1f3a1c; }" +
  ".ev-boks p { margin: 4px 0; } .ev-boks small { color: #7a8a76; font-size: 10px; }" +
  ".ev-boks ul { list-style: none; margin: 0; padding: 0; } .ev-boks li { padding: 2px 0; font-weight: bold; }" +
  ".ev-boks li.mig { color: #b07a00; }" +
  ".ev-luk { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px;" +
  " background: #e8f2dc; color: #3d6b39; font-size: 12px; cursor: pointer; } .ev-luk:hover { background: #9ccc8f; }" +
  ".ev-gave { background: linear-gradient(#fff6d6, #ffe9a8); border-color: #c99a2e; animation: ev-glimt 2s ease-in-out infinite; }" +
  ".ev-gave h4 { color: #6b4500; }" +
  "@keyframes ev-glimt { 50% { box-shadow: 0 0 16px rgba(255, 200, 60, .9); } }" +
  ".ev-gave-knap { width: 100%; margin-top: 6px; padding: 7px; border: 2px solid #a87a1c; border-radius: 8px; background: #f2c14e;" +
  " color: #4a2e00; font: bold 12px Verdana, sans-serif; cursor: pointer; } .ev-gave-knap:hover { background: #ffd56a; }" +
  ".ev-vinder { overflow: hidden; }" +
  ".ev-vinder > :not(.ev-fx-lag) { position: relative; }" +
  ".ev-vinder > .ev-luk { position: absolute; z-index: 2; }" +
  ".ev-fx-lag { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 8px; }" +
  ".ev-fx { position: absolute; top: -14px; font-size: 11px; opacity: 0; animation: ev-fald 2.6s linear infinite; }" +
  ".ev-fx-glimmer { top: auto; font-size: 12px; animation: ev-blinke 2.2s ease-in-out infinite; }" +
  ".ev-fx-glimmer:nth-child(3n) { bottom: 8px; } .ev-fx-glimmer:nth-child(3n+1) { top: 30%; } .ev-fx-glimmer:nth-child(3n+2) { top: 4px; }" +
  ".ev-fx-konfetti { font-size: 8px; }" +
  ".ev-fx-hjerter { top: auto; bottom: -14px; animation-name: ev-stig; }" +
  "@keyframes ev-fald { 0% { transform: translateY(0) rotate(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(150px) rotate(320deg); opacity: 0; } }" +
  "@keyframes ev-stig { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-150px); opacity: 0; } }" +
  "@keyframes ev-blinke { 0%, 100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1.1); } }" +
  ".ev-eff-gloed { animation: ev-gloed 1.8s ease-in-out infinite; }" +
  "@keyframes ev-gloed { 50% { box-shadow: 0 0 18px 4px var(--ev-ring); } }" +
  ".ev-eff-regnbue { animation: ev-regnbue 3s linear infinite; }" +
  "@keyframes ev-regnbue { 0% { border-color: #e74c3c; } 20% { border-color: #f1c40f; } 40% { border-color: #2ecc71; } 60% { border-color: #3498db; } 80% { border-color: #9b59b6; } 100% { border-color: #e74c3c; } }" +
  ".ev-eff-hop { animation: ev-hop 1.6s ease-in-out infinite; }" +
  "@keyframes ev-hop { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }" +
  ".ev-eff-blink { animation: ev-blink 1s steps(2, start) infinite; }" +
  "@keyframes ev-blink { 50% { border-color: var(--ev-ring); box-shadow: 0 0 0 3px var(--ev-ring); } }" +
  "#vi-proeve { width: 230px; margin: 6px 0 10px; font: 12px Verdana, sans-serif; }" +
  "#vi-proeve .ev-boks { pointer-events: auto; }" +
  "#ejer-indhold #vi-proeve h4 { margin: 0 18px 6px 0; padding: 0; border: 0; font-size: 13px; text-transform: none; letter-spacing: normal; }" +
  "#ejer-indhold #vi-proeve p { margin: 4px 0; padding: 0; border: 0; background: none; }" +
  "#ejer-indhold #vi-proeve ul { margin: 0; padding: 0; } #ejer-indhold #vi-proeve li { display: block; padding: 2px 0; border: 0; background: none; }" +
  "#ejer-indhold .ev-skriv .bs-farver button, #ejer-indhold .ev-skriv .bs-pynt button { width: auto; }" +
  "#ejer-indhold .ev-skriv .bs-farver button { width: 26px; }" +
  "#gave-baand { display: flex; align-items: center; gap: 8px; margin: 0 8px 6px; padding: 7px 10px; background: #fff6d6; border: 2px solid #c99a2e;" +
  " border-radius: 8px; color: #4a2e00; font-size: 12px; }" +
  "#gave-baand[hidden] { display: none; }" +
  "#gave-baand.aktiv { background: linear-gradient(#fff6d6, #ffe9a8); }" +
  "#gave-baand button { margin-left: auto; padding: 4px 10px; border: 1px solid #a87a1c; border-radius: 6px; background: #f2c14e; color: #4a2e00; cursor: pointer; flex: none; }" +
  "#shop-koeb.sikker { background: #f2c14e; color: #4a2e00; }" +
  "#ejer-indhold .ev-skriv { padding: 10px 12px; margin-bottom: 12px; background: #e8f2dc; border: 2px solid #9ccc8f; border-radius: 10px; }" +
  "#ejer-indhold .ev-skriv h3 { margin-top: 0; }" +
  "#ejer-indhold .ev-skriv input, #ejer-indhold .ev-skriv textarea { width: 100%; box-sizing: border-box; font: 13px Verdana, sans-serif; }" +
  "#ejer-indhold ul.ev-noter { list-style: none; margin: 0; padding: 0; }" +
  "#ejer-indhold ul.ev-noter li { display: block; margin: 0 0 8px; padding: 8px 10px; background: #fff; border: 1px solid #d6e8c8; border-radius: 8px; }" +
  "#ejer-indhold .ev-note-top { display: flex; align-items: center; gap: 8px; } #ejer-indhold .ev-note-top small { color: #7a8a76; }" +
  "#ejer-indhold .ev-note-top .ev-slet { margin-left: auto; }" +
  "#ejer-indhold .ev-noter p { margin: 6px 0 0; word-break: break-word; }" +
  "#ejer-indhold .ev-traels { color: #8a2d1c; }" +
  "#ejer-indhold .ev-slet.sikker { background: #c0392b; color: #fff; }" +
  "#ejer-indhold .ev-fejl { padding: 8px 10px; background: #fde8e4; border: 1px solid #e3a99c; border-radius: 8px; color: #8a2d1c; }" +
  "#ejer-indhold .ev-filter { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 10px; }" +
  "#ejer-indhold .ev-filter button.valgt { background: #9ccc8f; color: #1f3a1c; }" +
  "#ejer-indhold .ev-filter input { flex: 1; min-width: 140px; }" +
  "#ejer-indhold table.ev-tabel { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }" +
  "#ejer-indhold table.ev-tabel th { text-align: left; padding: 6px; background: #e8f2dc; color: #1f3a1c; }" +
  "#ejer-indhold table.ev-tabel td { padding: 6px; border-bottom: 1px solid #e0ecd6; vertical-align: top; }" +
  "#ejer-indhold table.ev-tabel small { color: #7a8a76; }";
document.head.appendChild(evStil);
