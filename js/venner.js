// =============================================================
//  Venner 👫 — tilføj gæster som ven og se din venneliste
//  "Tilføj ven" er i menuen, når man klikker på en anden gæst.
//  Vennelisten åbnes med 👫-knappen i chatbaren.
//  (Venneanmodninger mellem rigtige spillere kræver en server.)
// =============================================================
const VENNER_NOEGLE = "mit-hotel-venner";
const vennerVindue = document.getElementById("venner-vindue");

let venner = [];
try { venner = JSON.parse(localStorage.getItem(VENNER_NOEGLE) || "[]"); } catch (e) {}
function gemVenner() {
  try { localStorage.setItem(VENNER_NOEGLE, JSON.stringify(venner)); } catch (e) {}
}

function erVen(navn) { return venner.indexOf(navn) >= 0; }

// Gæsterne er altid i Velkomsthallen, med mindre de er bannet
function venOnline(navn) {
  return HAL_GAESTER.some(function (g) { return g.navn === navn; }) &&
    !(typeof erBannet === "function" && erBannet(navn));
}

function tilfoejVen(g) {
  if (erVen(g.navn)) return;
  venner.push(g.navn);
  gemVenner();
  svaev("💚", g);
  gaestSkriver(g, "Ja, lad os være venner, " + FIGUR.navn + "! 😊");
  visVenner();
}

function fjernVen(navn) {
  venner = venner.filter(function (v) { return v !== navn; });
  gemVenner();
  visVenner();
}

// "Tilføj ven" kommer med i menuen over de andre gæster
const aabnGaestMenuVenner = aabnGaestMenu;
aabnGaestMenu = function (g) {
  aabnGaestMenuVenner(g);
  if (erVen(g.navn)) {
    knap("💚 Ven", function () { lukMinMenu(); aabnVenner(); });
  } else {
    knap("➕ Tilføj ven", function () { lukMinMenu(); tilfoejVen(g); });
  }
  placerMinMenu();
};

// Antal venner står i "Min profil"
const aabnProfilVenner = aabnProfil;
aabnProfil = function () {
  aabnProfilVenner();
  document.getElementById("profil-venner").textContent = venner.length;
};


// -------------------------------------------------------------
//  Vennelisten
// -------------------------------------------------------------
function visVenner() {
  if (vennerVindue.hidden) return;
  const liste = document.getElementById("venner-liste");
  const online = venner.filter(venOnline).length;
  document.getElementById("venner-antal").textContent = venner.length + (venner.length === 1 ? " ven" : " venner") + " · " + online + " online";
  if (!venner.length) {
    liste.innerHTML = "<li class='venner-tom'>Du har ingen venner endnu.<br>Klik på en gæst og vælg <b>➕ Tilføj ven</b>.</li>";
    return;
  }
  // online venner øverst
  const sorteret = venner.slice().sort(function (a, b) { return venOnline(b) - venOnline(a) || a.localeCompare(b); });
  liste.innerHTML = sorteret.map(function (navn) {
    const on = venOnline(navn);
    const her = on && rumValg === "hal";
    return "<li><span class='ven-prik " + (on ? "on" : "off") + "'></span>" +
      "<span class='ven-navn'><b>" + tegnTilHtml(navn) + "</b><small>" + (on ? "Velkomsthallen" : "Offline") + "</small></span>" +
      (on ? "<button data-gaa='" + tegnTilHtml(navn) + "'" + (her ? " disabled" : "") + ">" + (her ? "Her" : "Gå til") + "</button>" : "") +
      "<button class='fjern' data-fjern='" + tegnTilHtml(navn) + "' title='Fjern ven'>✕</button></li>";
  }).join("");
  liste.querySelectorAll("[data-gaa]").forEach(function (k) {
    k.addEventListener("click", function () { if (rumValg !== "hal") skiftRum("hal"); });
  });
  liste.querySelectorAll("[data-fjern]").forEach(function (k) {
    k.addEventListener("click", function () { fjernVen(k.dataset.fjern); });
  });
}

function aabnVenner() {
  vennerVindue.hidden = false;
  visVenner();
}

document.getElementById("chat-venner-knap").addEventListener("click", function () {
  if (vennerVindue.hidden) aabnVenner(); else vennerVindue.hidden = true;
});
document.getElementById("venner-luk").addEventListener("click", function () { vennerVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") vennerVindue.hidden = true; });

// skifter man rum, kan "Gå til" ændre sig
const skiftRumVenner = skiftRum;
skiftRum = function (navn) {
  skiftRumVenner(navn);
  visVenner();
};
