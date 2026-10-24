// =============================================================
//  Hotellets navigatør 🛎️ — find og besøg rum
//  Åbnes med klokke-knappen i chatbaren.
//  Rum med  rum: "hal"  eller  rum: "vaerelse"  kan man besøge nu.
//  De andre er låst, indtil de bliver bygget.
// =============================================================
const NAV_FAV_NOEGLE = "mit-hotel-favoritter";
const NAV_SENEST_NOEGLE = "mit-hotel-senest-besoegte";

const ETAGER = [
  { id: "stue", navn: "Stueetagen", ikon: "🏠" },
  { id: "sal1", navn: "1. sal", ikon: "☕" },
  { id: "sal2", navn: "2. sal", ikon: "🎵" },
  { id: "tag", navn: "Taghaven", ikon: "🌳" },
  { id: "privat", navn: "Mine rum", ikon: "🔑" },
  { id: "hemmelig", navn: "Hemmelige rum", ikon: "🔮" },
];

// Alle rummene. Skriv flere ind her, når de bliver bygget.
const NAV_RUM = [
  { id: "velkomsthallen", etage: "stue", navn: "Velkomsthallen", om: "Hotellets ejer", billede: "billeder/rum/velkomsthallen.png", maks: 50, rum: "hal" },
  { id: "cafe", etage: "stue", navn: "Den lille café", om: "Café og hygge", billede: "billeder/rum/cafe.png", maks: 40 },
  { id: "spil", etage: "stue", navn: "Spillehjørnet", om: "Spil og underholdning", billede: "billeder/rum/spillehjoernet.png", maks: 30 },
  { id: "laese", etage: "stue", navn: "Læsehjørnet", om: "Rolig zone", billede: "billeder/rum/laesehjoernet.png", maks: 20 },
  { id: "event1", etage: "sal1", navn: "Event rum 1", om: "Fester og events", billede: "billeder/rum/event.png", maks: 40, rum: "vaerelse", vaerelse: "event1", event: true },
  { id: "event2", etage: "sal1", navn: "Event rum 2", om: "Fester og events", billede: "billeder/rum/event.png", maks: 40, rum: "vaerelse", vaerelse: "event2", event: true },
  { id: "event3", etage: "sal1", navn: "Event rum 3", om: "Fester og events", billede: "billeder/rum/event.png", maks: 40, rum: "vaerelse", vaerelse: "event3", event: true },
  { id: "event4", etage: "sal1", navn: "Event rum 4", om: "Fester og events", billede: "billeder/rum/event.png", maks: 40, rum: "vaerelse", vaerelse: "event4", event: true },
  { id: "mit", etage: "privat", navn: FIGUR.navn + "s værelse", om: "Dit eget værelse", billede: "billeder/rum/vaerelse.png", maks: 25, rum: "vaerelse", vaerelse: "mit" },
  { id: "hemmelig1", etage: "hemmelig", navn: "???", om: "Ingen ved, hvad der er derinde …", maks: 0, hemmelig: true },
  { id: "hemmelig2", etage: "hemmelig", navn: "???", om: "Man siger, der er en nøgle et sted …", maks: 0, hemmelig: true },
];

const navVindue = document.getElementById("nav-vindue");
let navEtage = "stue";
let navFilter = "alle";
let navSoeg = "";

let favoritter = [], senest = [];
try { favoritter = JSON.parse(localStorage.getItem(NAV_FAV_NOEGLE) || "[]"); } catch (e) {}
try { senest = JSON.parse(localStorage.getItem(NAV_SENEST_NOEGLE) || "[]"); } catch (e) {}
function gemNav() {
  try {
    localStorage.setItem(NAV_FAV_NOEGLE, JSON.stringify(favoritter));
    localStorage.setItem(NAV_SENEST_NOEGLE, JSON.stringify(senest));
  } catch (e) {}
}

// Hvor mange er der i rummet lige nu?
function antalIRum(r) {
  if (r.rum === "hal") {
    const gaester = HAL_GAESTER.filter(function (g) { return !(typeof erBannet === "function" && erBannet(g.navn)); }).length;
    return gaester + (rumValg === "hal" ? 1 : 0);
  }
  if (r.rum === "vaerelse") return rumValg === "vaerelse" && aktivtVaerelse === r.vaerelse ? 1 : 0;
  return 0;
}

function navHtml(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Husk hvilke rum man har været i
const skiftRumNav = skiftRum;
skiftRum = function (navn) {
  skiftRumNav(navn);
  const r = NAV_RUM.find(function (x) { return x.rum === navn; });
  if (r) {
    senest = [r.id].concat(senest.filter(function (id) { return id !== r.id; })).slice(0, 8);
    gemNav();
  }
  if (!navVindue.hidden) visNav();
};


// rummet man starter i, tæller også
(function () {
  const r = NAV_RUM.find(function (x) { return x.rum === rumValg; });
  if (r && senest[0] !== r.id) {
    senest = [r.id].concat(senest.filter(function (id) { return id !== r.id; })).slice(0, 8);
    gemNav();
  }
})();


// -------------------------------------------------------------
//  Tegn navigatøren
// -------------------------------------------------------------
function rumKort(r) {
  const fav = favoritter.indexOf(r.id) >= 0;
  const her = r.rum && r.rum === rumValg && (r.rum !== "vaerelse" || r.vaerelse === aktivtVaerelse);
  const billede = r.hemmelig
    ? "<div class='nav-billede hemmelig'><span>?</span></div>"
    : "<div class='nav-billede" + (r.rum ? "" : " laast") + "'><img src='" + r.billede + "' alt=''>" + (r.rum ? "" : "<span>🔒</span>") + "</div>";
  let knap;
  const m = r.egetRum ? mineRum.find(function (x) { return x.id === r.vaerelse; }) : null;
  if (m && !her && !kanGaaInd(m)) {
    if (adgangAf(m) === "laast") knap = "<button class='nav-besoeg laast' disabled>🔒 Låst</button>";
    else if (kodeAaben === m.id) knap = "<div class='nav-kode'><input id='nk-kode' type='password' maxlength='30' placeholder='Adgangskode'>" +
      "<button class='nav-besoeg' data-kode-ind='" + m.id + "'>Gå ind</button><small id='nk-fejl'></small></div>";
    else knap = "<button class='nav-besoeg' data-kode='" + m.id + "'>🔑 Skriv kode</button>";
  } else if (her) knap = "<button class='nav-besoeg' disabled>Du er her</button>";
  else if (r.rum) knap = "<button class='nav-besoeg' data-besoeg='" + r.id + "'>Besøg rum</button>";
  else knap = "<button class='nav-besoeg laast' disabled>🔒 Låst</button>";
  return "<div class='nav-kort" + (r.hemmelig ? " hemmelig" : "") + "'>" + billede +
    "<div class='nav-info'><h4>" + navHtml(r.navn) + "</h4><p>" + navHtml(r.om) + "</p>" +
    (r.hemmelig ? "<span class='nav-antal'>👤 ? / ?</span>" : "<span class='nav-antal'>👤 " + antalIRum(r) + " / " + r.maks + "</span>") + "</div>" +
    "<div class='nav-hoejre'>" + (r.hemmelig ? "<span class='nav-hjerte tom'>✧</span>" :
      "<button class='nav-hjerte" + (fav ? " valgt" : "") + "' data-fav='" + r.id + "' title='Favorit'>" + (fav ? "♥" : "♡") + "</button>") +
    knap + (m && ejerAf(m) === FIGUR.navn ? adgangVaelger(m) + "<button class='nav-slet' data-slet-rum='" + r.vaerelse + "' title='Slet rummet'>🗑</button>" : "") + "</div></div>";
}

function visNav() {
  // etagerne til venstre
  document.getElementById("nav-etager").innerHTML = ETAGER.map(function (e) {
    return "<button data-etage='" + e.id + "' class='" + (e.id === navEtage && navFilter === "alle" && !navSoeg ? "valgt" : "") +
      (e.id === "hemmelig" ? " hemmelig" : "") + "'><span>" + e.ikon + "</span> " + e.navn + "</button>";
  }).join("");

  // hvilke rum skal vises?
  let rum, titel, ikon;
  const q = navSoeg.toLowerCase();
  if (q) {
    rum = NAV_RUM.filter(function (r) { return !r.hemmelig && (r.navn + " " + r.om).toLowerCase().indexOf(q) >= 0; });
    titel = "Søgning: " + navSoeg; ikon = "🔍";
  } else if (navFilter === "populaere") {
    rum = NAV_RUM.filter(function (r) { return r.rum; }).sort(function (a, b) { return antalIRum(b) - antalIRum(a); });
    titel = "Populære"; ikon = "🔥";
  } else if (navFilter === "venner") {
    // rum hvor dine venner er lige nu
    rum = NAV_RUM.filter(function (r) { return r.rum === "hal" && venner.some(venOnline); });
    titel = "Venner"; ikon = "👥";
  } else if (navFilter === "favoritter") {
    rum = NAV_RUM.filter(function (r) { return favoritter.indexOf(r.id) >= 0; });
    titel = "Favoritter"; ikon = "♥";
  } else if (navFilter === "senest") {
    rum = senest.map(function (id) { return NAV_RUM.find(function (r) { return r.id === id; }); }).filter(Boolean);
    titel = "Senest besøgte"; ikon = "🕒";
  } else {
    lavMineRumKort();
    const e = ETAGER.find(function (x) { return x.id === navEtage; });
    rum = NAV_RUM.filter(function (r) { return r.etage === navEtage; });
    titel = e.navn; ikon = e.ikon;
  }
  const tom = { venner: "Ingen af dine venner er online. Klik på en gæst og vælg ➕ Tilføj ven.", favoritter: "Tryk på ♡ ved et rum for at gøre det til favorit.", senest: "Du har ikke besøgt nogen rum endnu." }[navFilter];
  document.getElementById("nav-midte").innerHTML =
    "<div class='nav-titel'><span>" + ikon + "</span><div><h3>" + navHtml(titel) + "</h3><small>" + rum.length + (rum.length === 1 ? " rum" : " rum") + "</small></div></div>" +
    (navEtage === "privat" && navFilter === "alle" && !q ? opretRumHtml() : "") +
    (rum.length ? rum.map(rumKort).join("") : "<p class='nav-tom'>" + (tom || (navEtage === "hemmelig" ? "…" : "Her er stille … Der er ingen rum endnu.")) + "</p>");

  // filtre
  document.querySelectorAll("#nav-filtre button").forEach(function (k) {
    k.classList.toggle("valgt", k.dataset.filter === navFilter && !navSoeg);
  });

  // populære lige nu
  const pop = NAV_RUM.filter(function (r) { return r.rum; }).sort(function (a, b) { return antalIRum(b) - antalIRum(a); }).slice(0, 3);
  const popBoks = document.getElementById("nav-populaere");
  if (popBoks) popBoks.innerHTML = pop.map(function (r) {
    return "<button data-besoeg='" + r.id + "'><img src='" + r.billede + "' alt=''><span><b>" + navHtml(r.navn) + "</b><small>👤 " + antalIRum(r) + " / " + r.maks + "</small></span><i>›</i></button>";
  }).join("");

  // klik
  navVindue.querySelectorAll("[data-etage]").forEach(function (k) {
    k.addEventListener("click", function () { navEtage = k.dataset.etage; navFilter = "alle"; navSoeg = ""; const soegFelt = document.getElementById("nav-soeg"); if (soegFelt) soegFelt.value = ""; visNav(); });
  });
  navVindue.querySelectorAll("[data-besoeg]").forEach(function (k) {
    k.addEventListener("click", function () {
      const r = NAV_RUM.find(function (x) { return x.id === k.dataset.besoeg; });
      if (r && r.vaerelse) { if (!(rumValg === "vaerelse" && aktivtVaerelse === r.vaerelse)) gaaTilVaerelse(r.vaerelse); }
      else if (r && r.rum && r.rum !== rumValg) skiftRum(r.rum);
    });
  });
  lytOpretRum();
  navVindue.querySelectorAll("[data-fav]").forEach(function (k) {
    k.addEventListener("click", function () {
      const id = k.dataset.fav;
      if (favoritter.indexOf(id) >= 0) favoritter.splice(favoritter.indexOf(id), 1); else favoritter.push(id);
      gemNav();
      visNav();
    });
  });
}

// -------------------------------------------------------------
//  Mine rum: opret dine egne rum 🔑
// -------------------------------------------------------------
// Farver til væggen og gulvet, når man opretter et rum
const VAEG_FARVER = [
  ["Himmelblå", "#86b3dd"], ["Rosa", "#e3a9c0"], ["Mint", "#8fc9a6"], ["Natblå", "#3f4d72"], ["Træ", "#8a5a3b"], ["Lilla", "#7d62a8"],
  ["Creme", "#efe2c4"], ["Fersken", "#f2b48c"], ["Rød", "#b8483f"], ["Skovgrøn", "#4e7d4a"], ["Grå", "#9aa3ab"], ["Sort", "#2c2b33"],
];
const GULVE = [
  ["Lyst træ", "#d8b47a", "#c9a46c"], ["Mørkt træ", "#9b6a43", "#8a5c38"], ["Hvide fliser", "#f2f0ea", "#e2ded4"], ["Skakbræt", "#f3f3f3", "#3a3a3a"],
  ["Lyserød", "#f4dde6", "#ebcbd8"], ["Mint", "#e4f2e7", "#d1e8d6"], ["Græs", "#8fc46f", "#7fb560"], ["Sand", "#ecd7a6", "#e0c992"],
  ["Lilla", "#d9cdea", "#c9badf"], ["Nat", "#6b7593", "#5c6684"], ["Marmor", "#e9e6e1", "#d6d2cb"], ["Rødt tæppe", "#b4473d", "#a33f36"],
];
let opretModel = "firkant-8";
let opretVaeg = "#86b3dd";
let opretGulv = 0;

// En lille tegning af rummets form, så man kan se den, før man opretter rummet
function tegnModelForhaand() {
  const c = document.getElementById("or-forhaand");
  if (!c) return;
  const g = c.getContext("2d");
  const m = RUM_MODELLER.find(function (x) { return x.id === opretModel; });
  const form = lavForm(m.form, m.bredde, m.dybde);
  const felt = function (x, y) { return x >= 0 && y >= 0 && x < m.bredde && y < m.dybde && (!form || form(x, y)); };
  g.clearRect(0, 0, c.width, c.height);
  const fb = Math.min(150 / (m.bredde + m.dybde), 16) * 2, fh = fb / 2;
  const ox = c.width / 2 + (m.dybde - m.bredde) * fb / 4, oy = 28;
  const p = function (x, y) { return { x: ox + (x - y) * fb / 2, y: oy + (x + y) * fh / 2 }; };
  const poly = function (pt, farve) { g.beginPath(); g.moveTo(pt[0].x, pt[0].y); pt.forEach(function (q) { g.lineTo(q.x, q.y); }); g.closePath(); g.fillStyle = farve; g.fill(); };
  const vh = 18;
  for (let y = 0; y < m.dybde; y++) for (let x = 0; x < m.bredde; x++) if (felt(x, y)) {
    const a = p(x, y + 1), b = p(x, y); poly([a, b, { x: b.x, y: b.y - vh }, { x: a.x, y: a.y - vh }], nuance(opretVaeg, 0.85)); break;
  }
  for (let x = 0; x < m.bredde; x++) for (let y = 0; y < m.dybde; y++) if (felt(x, y)) {
    const a = p(x, y), b = p(x + 1, y); poly([a, b, { x: b.x, y: b.y - vh }, { x: a.x, y: a.y - vh }], opretVaeg); break;
  }
  const gulv = GULVE[opretGulv];
  for (let x = 0; x < m.bredde; x++) for (let y = 0; y < m.dybde; y++) if (felt(x, y)) {
    poly([p(x, y), p(x + 1, y), p(x + 1, y + 1), p(x, y + 1)], (x + y) % 2 ? gulv[2] : gulv[1]);
  }
}

let opretAaben = false;
let kodeAaben = null;        // rummet man er ved at skrive adgangskode til
let kodeRedigerer = null;    // dit eget rum, som du er ved at give en ny adgangskode

// Adgang til rummene: "aaben", "laast" (kun ejeren) eller "kode" (adgangskode)
const ADGANGE = [["aaben", "🔓 Åben"], ["laast", "🔒 Låst"], ["kode", "🔑 Adgangskode"]];
function ejerAf(m) { return m.ejer || FIGUR.navn; }
function adgangAf(m) { return m.adgang || "aaben"; }
function kanGaaInd(m) {
  if (ejerAf(m) === FIGUR.navn) return true;
  if (typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0) return true;   // hotellets ejer kommer altid ind
  return adgangAf(m) === "aaben";
}
async function saetKode(m, kode) {
  m.kodeSalt = nytSalt();
  m.kodeHash = await hashKode(m.kodeSalt, kode);
}
function adgangVaelger(m) {
  let html = "<select class='nav-adgang' data-adgang='" + m.id + "' title='Hvem må komme ind?'>" + ADGANGE.map(function (a) {
    return "<option value='" + a[0] + "'" + (a[0] === adgangAf(m) ? " selected" : "") + ">" + a[1] + "</option>";
  }).join("") + "</select>";
  if (kodeRedigerer === m.id) html += "<div class='nav-kode'><input id='nk-ny' type='password' maxlength='30' placeholder='Ny adgangskode'>" +
    "<button class='nav-besoeg' data-ny-kode='" + m.id + "'>Gem</button></div>";
  return html;
}
let sletSikker = null;

// dine oprettede rum som kort i navigatøren
function lavMineRumKort() {
  for (let i = NAV_RUM.length - 1; i >= 0; i--) if (NAV_RUM[i].egetRum) NAV_RUM.splice(i, 1);
  const plads = NAV_RUM.findIndex(function (r) { return r.id === "mit"; }) + 1;
  mineRum.forEach(function (m, i) {
    if (!m.ejer) m.ejer = FIGUR.navn;
    const mit = ejerAf(m) === FIGUR.navn;
    const laas = { aaben: "", laast: " 🔒", kode: " 🔑" }[adgangAf(m)];
    NAV_RUM.splice(plads + i, 0, { id: "eget-" + m.id, etage: mit ? "privat" : "sal1", navn: m.navn + laas,   // andres rum står på 1. sal
      om: (mit ? "Dit rum" : "Ejer: " + ejerAf(m)) + " · " + (m.model ? m.model + ", " : "") + m.bredde + " × " + m.dybde,
      billede: "billeder/rum/vaerelse.png", maks: 25, rum: "vaerelse", vaerelse: m.id, egetRum: true });
  });
}
lavMineRumKort();

function opretRumHtml() {
  if (!opretAaben) return "<button id='nav-opret-rum' class='nav-opret'>➕ Opret rum</button>";
  return "<div class='nav-opret-boks'><h4>➕ Opret et nyt rum</h4>" +
    "<label>Navn<input id='or-navn' type='text' maxlength='24' placeholder='fx Min hule'></label>" +
    "<div class='or-model'><label>Rummodel (" + RUM_MODELLER.length + " at vælge imellem)<select id='or-model'>" + RUM_MODELLER.map(function (m) {
      return "<option value='" + m.id + "'" + (m.id === opretModel ? " selected" : "") + ">" + m.nr + ". " + m.navn + " (" + m.bredde + " × " + m.dybde + ")</option>";
    }).join("") + "</select></label><canvas id='or-forhaand' width='190' height='130'></canvas></div>" +
    "<b class='or-titel'>Væg</b><div class='or-farver'>" + VAEG_FARVER.map(function (v) {
      return "<button type='button' data-vaeg='" + v[1] + "' class='" + (v[1] === opretVaeg ? "valgt" : "") + "' title='" + v[0] + "' style='background:" + v[1] + "'></button>";
    }).join("") + "</div>" +
    "<b class='or-titel'>Gulv</b><div class='or-farver'>" + GULVE.map(function (gv, i) {
      return "<button type='button' data-gulv='" + i + "' class='" + (i === opretGulv ? "valgt" : "") + "' title='" + gv[0] + "' style='background:linear-gradient(135deg," + gv[1] + " 50%," + gv[2] + " 50%)'></button>";
    }).join("") + "</div>" +
    "<div class='or-adgang'><b>Hvem må komme ind?</b>" + ADGANGE.map(function (a, i) {
      return "<label><input type='radio' name='or-adgang' value='" + a[0] + "'" + (i === 0 ? " checked" : "") + "> " + a[1] + "</label>";
    }).join("") + "</div>" +
    "<label id='or-kode-felt' hidden>Adgangskode<input id='or-kode' type='password' maxlength='30' placeholder='Den skal gæsterne skrive'></label>" +
    "<p id='or-fejl' class='or-fejl'></p>" +
    "<div class='or-knapper'><button id='or-annuller' type='button'>Annuller</button><button id='or-opret' type='button' class='or-gem'>Opret rum</button></div></div>";
}

function lytOpretRum() {
  const aabn = document.getElementById("nav-opret-rum");
  if (aabn) aabn.addEventListener("click", function () { opretAaben = true; visNav(); document.getElementById("or-navn").focus(); });
  const annuller = document.getElementById("or-annuller");
  if (annuller) annuller.addEventListener("click", function () { opretAaben = false; visNav(); });
  const modelValg = document.getElementById("or-model");
  if (modelValg) {
    modelValg.addEventListener("change", function () { opretModel = modelValg.value; tegnModelForhaand(); });
    tegnModelForhaand();
  }
  navVindue.querySelectorAll("[data-vaeg]").forEach(function (k) {
    k.addEventListener("click", function () {
      opretVaeg = k.dataset.vaeg;
      navVindue.querySelectorAll("[data-vaeg]").forEach(function (x) { x.classList.toggle("valgt", x === k); });
      tegnModelForhaand();
    });
  });
  navVindue.querySelectorAll("[data-gulv]").forEach(function (k) {
    k.addEventListener("click", function () {
      opretGulv = +k.dataset.gulv;
      navVindue.querySelectorAll("[data-gulv]").forEach(function (x) { x.classList.toggle("valgt", x === k); });
      tegnModelForhaand();
    });
  });
  navVindue.querySelectorAll("[name='or-adgang']").forEach(function (k) {
    k.addEventListener("change", function () { document.getElementById("or-kode-felt").hidden = k.value !== "kode" || !k.checked; });
  });
  const opret = document.getElementById("or-opret");
  if (opret) opret.addEventListener("click", async function () {
    const navn = document.getElementById("or-navn").value.trim().replace(/[<>]/g, "");
    if (!navn) { document.getElementById("or-fejl").textContent = "Giv dit rum et navn."; return; }
    const adgang = (navVindue.querySelector("[name='or-adgang']:checked") || {}).value || "aaben";
    const kode = document.getElementById("or-kode").value;
    if (adgang === "kode" && kode.length < 3) { document.getElementById("or-fejl").textContent = "Adgangskoden skal være mindst 3 tegn."; return; }
    const mdl = RUM_MODELLER.find(function (x) { return x.id === opretModel; });
    const gulv = GULVE[opretGulv];
    const id = "r" + Date.now().toString(36);
    const nyt = { id: id, navn: navn, ejer: FIGUR.navn, adgang: adgang, form: mdl.form, model: mdl.navn, bredde: mdl.bredde, dybde: mdl.dybde,
      vaeg: opretVaeg, gulv1: gulv[1], gulv2: gulv[2], oprettet: Date.now() };
    if (adgang === "kode") await saetKode(nyt, kode);
    mineRum.push(nyt);
    gemMineRum();
    opretAaben = false;
    gaaTilVaerelse(id);
    besked.textContent = "Dit nye rum \"" + navn + "\" er klar! 🔑 Stil møbler fra panelet eller dit lager.";
    visNav();
  });
  const navnFelt = document.getElementById("or-navn");
  if (navnFelt) navnFelt.addEventListener("keydown", function (e) { if (e.key === "Enter") opret.click(); });
  // låste rum og adgangskode
  navVindue.querySelectorAll("[data-kode]").forEach(function (k) {
    k.addEventListener("click", function () { kodeAaben = k.dataset.kode; visNav(); document.getElementById("nk-kode").focus(); });
  });
  navVindue.querySelectorAll("[data-kode-ind]").forEach(function (k) {
    async function proev() {
      const m = mineRum.find(function (x) { return x.id === k.dataset.kodeInd; });
      const kode = document.getElementById("nk-kode").value;
      if (m && m.kodeHash && (await hashKode(m.kodeSalt, kode)) === m.kodeHash) {
        kodeAaben = null;
        gaaTilVaerelse(m.id);
        visNav();
      } else {
        document.getElementById("nk-fejl").textContent = "Forkert kode";
      }
    }
    k.addEventListener("click", proev);
    document.getElementById("nk-kode").addEventListener("keydown", function (e) { if (e.key === "Enter") proev(); });
  });
  navVindue.querySelectorAll("[data-adgang]").forEach(function (k) {
    k.addEventListener("change", function () {
      const m = mineRum.find(function (x) { return x.id === k.dataset.adgang; });
      if (k.value === "kode" && !m.kodeHash) { kodeRedigerer = m.id; m.adgang = "kode"; visNav(); document.getElementById("nk-ny").focus(); return; }
      m.adgang = k.value;
      kodeRedigerer = k.value === "kode" ? m.id : null;
      gemMineRum();
      visNav();
    });
  });
  navVindue.querySelectorAll("[data-ny-kode]").forEach(function (k) {
    k.addEventListener("click", async function () {
      const m = mineRum.find(function (x) { return x.id === k.dataset.nyKode; });
      const kode = document.getElementById("nk-ny").value;
      if (kode.length < 3) { document.getElementById("nk-ny").placeholder = "Mindst 3 tegn"; document.getElementById("nk-ny").value = ""; return; }
      await saetKode(m, kode);
      m.adgang = "kode";
      kodeRedigerer = null;
      gemMineRum();
      besked.textContent = "Adgangskoden til " + m.navn + " er gemt 🔑";
      visNav();
    });
  });

  navVindue.querySelectorAll("[data-slet-rum]").forEach(function (k) {
    if (sletSikker === k.dataset.sletRum) { k.textContent = "Er du sikker? Tryk igen"; k.classList.add("sikker"); }
    k.addEventListener("click", function () {
      const id = k.dataset.sletRum;
      if (sletSikker !== id) { sletSikker = id; visNav(); return; }
      sletSikker = null;
      if (rumValg === "vaerelse" && aktivtVaerelse === id) gaaTilVaerelse("mit");
      // møblerne i rummet kommer tilbage i dit lager
      const moebler = vaerelseMoebler(id);
      if (typeof tilLager === "function") moebler.forEach(function (m) { tilLager(m.type); });
      mineRum = mineRum.filter(function (r) { return r.id !== id; });
      delete andreVaerelser[id];
      try { localStorage.removeItem("mit-hotel-rum-" + id); } catch (e) {}
      gemMineRum();
      visNav();
    });
  });
}

document.querySelectorAll("#nav-filtre button, #nav-genveje button").forEach(function (k) {
  k.addEventListener("click", function () {
    navFilter = k.dataset.filter;
    navSoeg = "";
    const soegFelt = document.getElementById("nav-soeg"); if (soegFelt) soegFelt.value = "";
    visNav();
  });
});
const navSoegFelt = document.getElementById("nav-soeg");
if (navSoegFelt) navSoegFelt.addEventListener("input", function () { navSoeg = this.value.trim(); visNav(); });

document.getElementById("chat-nav-knap").addEventListener("click", function () {
  navVindue.hidden = !navVindue.hidden;
  if (!navVindue.hidden) visNav();
});
document.getElementById("nav-luk").addEventListener("click", function () { navVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") navVindue.hidden = true; });

// antallet i rummene ændrer sig, mens navigatøren er åben
setInterval(function () { if (!navVindue.hidden && !opretAaben && !kodeAaben && !kodeRedigerer && document.activeElement.id !== "nav-soeg") visNav(); }, 3000);
