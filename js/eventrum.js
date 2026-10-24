// =============================================================
//  Event rum 1–4 på 1. sal 🎉
//  Rummene er åbne for alle. Ejeren og Eventværter (skiltet fra
//  Ansættelse) kan låse dem, så kun ansatte og ejeren kommer ind.
//  Lås og Åben findes i Ejerpanel → Systemindstillinger og på
//  rummets kort i navigatøren.
// =============================================================
const EVENT_LAAS_NOEGLE = "mit-hotel-event-laas";
// skilte der tæller som ansatte (gæste-skilte som VIP og Ny gæst gør ikke)
const ANSAT_SKILTE = ["mod", "staff", "hjaelper", "eventvaert", "bygmester", "support", "content-creator"];

let eventLaas = {};      // { event1: true } = låst
try { eventLaas = JSON.parse(localStorage.getItem(EVENT_LAAS_NOEGLE) || "{}"); } catch (e) {}
function gemEventLaas() {
  try { localStorage.setItem(EVENT_LAAS_NOEGLE, JSON.stringify(eventLaas)); } catch (e) {}
}

function erEventRum(id) {
  return EVENT_RUM.some(function (r) { return r.id === id; });
}
function erAnsat(navn) {
  if (EJERE.indexOf(navn) >= 0) return true;
  return ANSAT_SKILTE.indexOf(ansatte[navn]) >= 0;
}
// Må du låse event-rummene? (ejeren og Eventværter)
function maaLaaseEvent() {
  return EJERE.indexOf(FIGUR.navn) >= 0 || ansatte[FIGUR.navn] === "eventvaert";
}
// Er rummet låst for dig?
function eventLaastFor(id) {
  return erEventRum(id) && !!eventLaas[id] && !erAnsat(FIGUR.navn);
}
function saetEventLaas(id, laast) {
  eventLaas[id] = laast;
  gemEventLaas();
  const navn = INDBYGGEDE_RUM[id].navn;
  if (typeof adminSkriv === "function") adminSkriv(navn + (laast ? " blev låst (kun ansatte)" : " blev åbnet for alle") + " af " + FIGUR.navn);
  // computer-gæster og andre uden adgang bliver i hallen; står du selv derinde uden adgang, sendes du ud
  if (rumValg === "vaerelse" && aktivtVaerelse === id && eventLaastFor(id)) skiftRum("hal");
}

// Ingen kommer ind i et låst event-rum uden adgang
const gaaTilVaerelseFoerEvent = gaaTilVaerelse;
gaaTilVaerelse = function (id) {
  if (eventLaastFor(id)) {
    besked.textContent = "🔒 " + INDBYGGEDE_RUM[id].navn + " er låst. Kun ansatte kan komme ind lige nu.";
    return;
  }
  gaaTilVaerelseFoerEvent(id);
};


// -------------------------------------------------------------
//  Navigatøren: 🔒 på låste rum + Lås / Åben-knap til ejeren og Eventværter
// -------------------------------------------------------------
const visNavFoerEvent = visNav;
visNav = function () {
  NAV_RUM.forEach(function (r) {
    if (r.event) r.navn = INDBYGGEDE_RUM[r.vaerelse].navn + (eventLaas[r.vaerelse] ? " 🔒" : "");
  });
  visNavFoerEvent();
  navVindue.querySelectorAll("[data-besoeg]").forEach(function (k) {
    const r = NAV_RUM.find(function (x) { return x.id === k.dataset.besoeg; });
    if (!r || !r.event) return;
    if (eventLaastFor(r.vaerelse)) { k.disabled = true; k.textContent = "🔒 Låst"; k.classList.add("laast"); }
    if (!maaLaaseEvent()) return;
    const laas = document.createElement("button");
    laas.className = "nav-slet event-laas";
    laas.textContent = eventLaas[r.vaerelse] ? "🔓 Åben" : "🔒 Lås";
    laas.title = eventLaas[r.vaerelse] ? "Åbn rummet for alle" : "Lås rummet, så kun ansatte kan komme ind";
    laas.addEventListener("click", function () { saetEventLaas(r.vaerelse, !eventLaas[r.vaerelse]); visNav(); });
    k.after(laas);
  });
};


// -------------------------------------------------------------
//  Ejerpanel → Systemindstillinger: Lås og Åben for hvert event-rum
// -------------------------------------------------------------
const visSystemFoerEvent = visSystem;
visSystem = function () {
  visSystemFoerEvent();
  const sek = document.createElement("section");
  sek.className = "event-laase";
  sek.innerHTML = "<h3>🎉 Event-rum</h3><p class='ejer-info'>Låser du et event-rum, kan kun ansatte (Mod, Staff, Hjælper, Eventvært, Bygmester, Support og Content creator) og du komme ind. Eventværter kan også låse og åbne fra navigatøren.</p>" +
    EVENT_RUM.map(function (r) {
      const laast = !!eventLaas[r.id];
      return "<div class='event-raekke'><b>" + rens(r.navn) + "</b><span class='event-status " + (laast ? "laast" : "aaben") + "'>" + (laast ? "🔒 Låst" : "🔓 Åben") + "</span>" +
        "<button data-event-laas='" + r.id + "'" + (laast ? " disabled" : "") + ">🔒 Lås</button>" +
        "<button data-event-aaben='" + r.id + "'" + (laast ? "" : " disabled") + ">🔓 Åben</button>" +
        "<button data-event-gaa='" + r.id + "'>Gå derind</button></div>";
    }).join("");
  ejerIndhold.appendChild(sek);
  sek.querySelectorAll("[data-event-laas]").forEach(function (k) {
    k.addEventListener("click", function () { saetEventLaas(k.dataset.eventLaas, true); visSystem(); });
  });
  sek.querySelectorAll("[data-event-aaben]").forEach(function (k) {
    k.addEventListener("click", function () { saetEventLaas(k.dataset.eventAaben, false); visSystem(); });
  });
  sek.querySelectorAll("[data-event-gaa]").forEach(function (k) {
    k.addEventListener("click", function () { ejerVindue.hidden = true; gaaTilVaerelse(k.dataset.eventGaa); });
  });
};
