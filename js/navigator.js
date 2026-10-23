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
  { id: "privat", navn: "Private rum", ikon: "👥" },
  { id: "hemmelig", navn: "Hemmelige rum", ikon: "🔮" },
];

// Alle rummene. Skriv flere ind her, når de bliver bygget.
const NAV_RUM = [
  { id: "velkomsthallen", etage: "stue", navn: "Velkomsthallen", om: "Hotellets ejer", billede: "billeder/rum/velkomsthallen.png", maks: 50, rum: "hal" },
  { id: "cafe", etage: "stue", navn: "Den lille café", om: "Café og hygge", billede: "billeder/rum/cafe.png", maks: 40 },
  { id: "spil", etage: "stue", navn: "Spillehjørnet", om: "Spil og underholdning", billede: "billeder/rum/spillehjoernet.png", maks: 30 },
  { id: "laese", etage: "stue", navn: "Læsehjørnet", om: "Rolig zone", billede: "billeder/rum/laesehjoernet.png", maks: 20 },
  { id: "event", etage: "sal1", navn: "Event rummet", om: "Fester og events", billede: "billeder/rum/event.png", maks: 40 },
  { id: "mit", etage: "privat", navn: FIGUR.navn + "s værelse", om: "Dit eget værelse", billede: "billeder/rum/vaerelse.png", maks: 25, rum: "vaerelse" },
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
  if (r.rum === "vaerelse") return rumValg === "vaerelse" ? 1 : 0;
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
  const her = r.rum && r.rum === rumValg;
  const billede = r.hemmelig
    ? "<div class='nav-billede hemmelig'><span>?</span></div>"
    : "<div class='nav-billede" + (r.rum ? "" : " laast") + "'><img src='" + r.billede + "' alt=''>" + (r.rum ? "" : "<span>🔒</span>") + "</div>";
  let knap;
  if (her) knap = "<button class='nav-besoeg' disabled>Du er her</button>";
  else if (r.rum) knap = "<button class='nav-besoeg' data-besoeg='" + r.id + "'>Besøg rum</button>";
  else knap = "<button class='nav-besoeg laast' disabled>🔒 Låst</button>";
  return "<div class='nav-kort" + (r.hemmelig ? " hemmelig" : "") + "'>" + billede +
    "<div class='nav-info'><h4>" + navHtml(r.navn) + "</h4><p>" + navHtml(r.om) + "</p>" +
    (r.hemmelig ? "<span class='nav-antal'>👤 ? / ?</span>" : "<span class='nav-antal'>👤 " + antalIRum(r) + " / " + r.maks + "</span>") + "</div>" +
    "<div class='nav-hoejre'>" + (r.hemmelig ? "<span class='nav-hjerte tom'>✧</span>" :
      "<button class='nav-hjerte" + (fav ? " valgt" : "") + "' data-fav='" + r.id + "' title='Favorit'>" + (fav ? "♥" : "♡") + "</button>") +
    knap + "</div></div>";
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
    const e = ETAGER.find(function (x) { return x.id === navEtage; });
    rum = NAV_RUM.filter(function (r) { return r.etage === navEtage; });
    titel = e.navn; ikon = e.ikon;
  }
  const tom = { venner: "Ingen af dine venner er online. Klik på en gæst og vælg ➕ Tilføj ven.", favoritter: "Tryk på ♡ ved et rum for at gøre det til favorit.", senest: "Du har ikke besøgt nogen rum endnu." }[navFilter];
  document.getElementById("nav-midte").innerHTML =
    "<div class='nav-titel'><span>" + ikon + "</span><div><h3>" + navHtml(titel) + "</h3><small>" + rum.length + (rum.length === 1 ? " rum" : " rum") + "</small></div></div>" +
    (rum.length ? rum.map(rumKort).join("") : "<p class='nav-tom'>" + (tom || (navEtage === "hemmelig" ? "…" : "Her er stille … Der er ingen rum endnu.")) + "</p>");

  // filtre
  document.querySelectorAll("#nav-filtre button").forEach(function (k) {
    k.classList.toggle("valgt", k.dataset.filter === navFilter && !navSoeg);
  });

  // populære lige nu
  const pop = NAV_RUM.filter(function (r) { return r.rum; }).sort(function (a, b) { return antalIRum(b) - antalIRum(a); }).slice(0, 3);
  document.getElementById("nav-populaere").innerHTML = pop.map(function (r) {
    return "<button data-besoeg='" + r.id + "'><img src='" + r.billede + "' alt=''><span><b>" + navHtml(r.navn) + "</b><small>👤 " + antalIRum(r) + " / " + r.maks + "</small></span><i>›</i></button>";
  }).join("");

  // klik
  navVindue.querySelectorAll("[data-etage]").forEach(function (k) {
    k.addEventListener("click", function () { navEtage = k.dataset.etage; navFilter = "alle"; navSoeg = ""; document.getElementById("nav-soeg").value = ""; visNav(); });
  });
  navVindue.querySelectorAll("[data-besoeg]").forEach(function (k) {
    k.addEventListener("click", function () {
      const r = NAV_RUM.find(function (x) { return x.id === k.dataset.besoeg; });
      if (r && r.rum && r.rum !== rumValg) skiftRum(r.rum);
    });
  });
  navVindue.querySelectorAll("[data-fav]").forEach(function (k) {
    k.addEventListener("click", function () {
      const id = k.dataset.fav;
      if (favoritter.indexOf(id) >= 0) favoritter.splice(favoritter.indexOf(id), 1); else favoritter.push(id);
      gemNav();
      visNav();
    });
  });
}

document.querySelectorAll("#nav-filtre button, #nav-genveje button").forEach(function (k) {
  k.addEventListener("click", function () {
    navFilter = k.dataset.filter;
    navSoeg = "";
    document.getElementById("nav-soeg").value = "";
    visNav();
  });
});
document.getElementById("nav-soeg").addEventListener("input", function () { navSoeg = this.value.trim(); visNav(); });

document.getElementById("chat-nav-knap").addEventListener("click", function () {
  navVindue.hidden = !navVindue.hidden;
  if (!navVindue.hidden) visNav();
});
document.getElementById("nav-luk").addEventListener("click", function () { navVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") navVindue.hidden = true; });

// antallet i rummene ændrer sig, mens navigatøren er åben
setInterval(function () { if (!navVindue.hidden && document.activeElement.id !== "nav-soeg") visNav(); }, 3000);
