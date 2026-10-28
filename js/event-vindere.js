// =============================================================
//  📝 Eventnoter, 🏆 vindere og 🎁 én gratis ting
//  - Ejerpanel → "📝 Eventnoter": ejeren og Eventværter skriver, hvordan et event gik,
//    og hvem der var træls. Ejeren og alle ansatte kan læse noterne.
//  - Ejerpanel → "🏆 Vindere": ejeren og Eventværter skriver vinderne ind efter et event.
//    Så står de i en boks i højre side for alle (✕ lukker den).
//  - Vinderne, og den der har fødselsdag i dag, får en "Tillykke"-boks med en knap,
//    der åbner shoppen. Der må de vælge PRÆCIS én gratis ting (også rares).
//  - Ejerpanel → "💎 Rares" (kun ejeren): hvem der har købt og vundet rares.
//  (Kræver database-21-eventnoter-vindere.sql.)
// =============================================================
const EV_LUKKET_NOEGLE = "mit-hotel-vindere-lukket";      // vinder-bokse man har lukket med ✕
const EV_GAVE_LUKKET_NOEGLE = "mit-hotel-gave-lukket";    // tillykke-bokse man har lukket med ✕
const EV_MANGLER = "⚠️ Serveren kender ikke eventnoter endnu. Kør database-21-eventnoter-vindere.sql i Supabase → SQL Editor.";

function evHent(noegle) { try { return JSON.parse(localStorage.getItem(noegle) || "[]"); } catch (e) { return []; } }
function evGem(noegle, v) { try { localStorage.setItem(noegle, JSON.stringify(v)); } catch (e) {} }
function evMaaSkrive() { const r = minRolle(); return r === "ejer" || r === "eventvaert"; }
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
  punkter: ["Ejeren og Eventværter skriver noterne. Alle ansatte kan læse dem.",
    "Skriv navnet på eventet, hvordan det forløb, og hvem der lavede ballade.", "🗑 sletter en note (tryk to gange)."] };
PANEL_HJAELP.vindere = { titel: "🏆 Vindere", tekst: "Skriv vinderne ind efter et event. De står i en boks i højre side for alle.",
  punkter: ["Skriv flere vindere med komma imellem, fx <b>Ida, Noah</b>.",
    "Hver vinder får en 🎉 Tillykke-boks og kan vælge <b>én</b> gratis ting i shoppen (også rares).",
    "Spillere med fødselsdag får også én gratis ting på dagen.", "🗑 Fjern tager boksen væk igen."] };
PANEL_HJAELP.rares = { titel: "💎 Rares", tekst: "Hvem har købt en rare i shoppen, og hvem har vundet en.",
  punkter: ["Kun for ejeren.", "Nederst står alle gratis ting fra events og fødselsdage, og om de er valgt."] };

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
    html += "<p class='ejer-info'>📖 Her kan du læse ejerens og Eventværternes noter fra eventene.</p>";
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
    "<button id='vi-gem'>🏆 Vis vinderne for alle</button><p class='ejer-info' id='vi-svar'></p></section>" +
    "<h3>Vindere de sidste 7 dage</h3>";
  if (evVindereFejl) html += "<p class='ev-fejl'>" + rens(evVindereFejl) + "</p>";
  html += evVindere.length ? "<ul class='ev-noter'>" + evVindere.map(function (v) {
    return "<li><div class='ev-note-top'><b>🏆 " + rens(v.event || "Event") + "</b><small>" + rens(v.hvem) + " · " + evTid(v.tid) + "</small>" +
      "<button class='ev-slet' data-vi-slet='" + v.id + "'>🗑 Fjern</button></div>" +
      "<p>👑 " + v.navne.map(rens).join(", ") + (v.gevinst ? " · " + rens(v.gevinst) : "") + "</p></li>";
  }).join("") + "</ul>" : "<p class='tom'>Ingen vindere endnu.</p>";
  sek.innerHTML = html;

  document.getElementById("vi-gem").addEventListener("click", function () {
    const knap = this, svar = document.getElementById("vi-svar");
    const event = document.getElementById("vi-event").value, liste = document.getElementById("vi-navne").value,
      gevinst = document.getElementById("vi-gevinst").value;
    knap.disabled = true;
    serverKald("hv_vindere_saet", { p_token: mitToken(), p_event: event, p_navne: liste, p_gevinst: gevinst }).then(function (r) {
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
    html += "<div class='ev-boks ev-vinder'><button class='ev-luk' data-ev-luk='" + v.id + "' title='Luk'>✕</button>" +
      "<h4>🏆 Vinderne" + (v.event ? " af " + rens(v.event) : "") + "</h4><ul>" + v.navne.map(function (n) {
        return "<li" + (n === FIGUR.navn ? " class='mig'" : "") + ">👑 " + rens(n) + (n === FIGUR.navn ? " (dig!)" : "") + "</li>";
      }).join("") + "</ul>" + (v.gevinst ? "<p>" + rens(v.gevinst) + "</p>" : "") +
      "<small>" + rens(v.hvem) + " · " + evTid(v.tid) + "</small></div>";
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
