// =============================================================
//  Forsiden: knapperne "Log ind" og "Opret mig" og vinduet til dem
// =============================================================
const kontoVindue = document.getElementById("konto-vindue");
const kontoForm = document.getElementById("konto-form");
const kontoNavn = document.getElementById("konto-navn");
const kontoKode = document.getElementById("konto-kode");
const kontoKode2 = document.getElementById("konto-kode2");
const kontoFejl = document.getElementById("konto-fejl");
let kontoMaade = "ind";       // "ind" = log ind, "opret" = opret mig

function aabnKonto(maade) {
  kontoMaade = maade;
  const opret = maade === "opret";
  document.getElementById("konto-titel").textContent = opret ? "Opret mig" : "Log ind";
  document.getElementById("konto-undertekst").textContent = opret ? "Vælg et brugernavn og en adgangskode." : "Velkommen tilbage til Hotelven!";
  document.getElementById("konto-kode2-felt").hidden = !opret;
  document.getElementById("konto-send").textContent = opret ? "Opret mig" : "Log ind";
  document.getElementById("konto-skift").innerHTML = opret
    ? "Har du allerede en profil? <button type='button' data-maade='ind'>Log ind</button>"
    : "Ny på hotellet? <button type='button' data-maade='opret'>Opret mig</button>";
  document.querySelector("#konto-skift button").addEventListener("click", function () { aabnKonto(this.dataset.maade); });
  kontoKode.autocomplete = opret ? "new-password" : "current-password";
  kontoFejl.textContent = "";
  visProfiler();
  kontoKode.value = "";
  kontoKode2.value = "";
  kontoVindue.hidden = false;
  kontoNavn.focus();
}

// Profilerne på denne computer vises som små knapper, så man kan se sit navn
function visProfiler() {
  const boks = document.getElementById("konto-profiler");
  const navne = Object.values(hentKonti()).map(function (k) { return k.navn; });
  boks.innerHTML = "";
  if (kontoMaade !== "ind" || !navne.length) { boks.hidden = true; return; }
  boks.hidden = false;
  boks.appendChild(document.createTextNode("Profiler her: "));
  navne.forEach(function (n) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = n;
    b.addEventListener("click", function () { kontoNavn.value = n; kontoKode.focus(); });
    boks.appendChild(b);
  });
}

function lukKonto() {
  kontoVindue.hidden = true;
}

kontoForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const navn = kontoNavn.value.trim();
  const kode = kontoKode.value;
  let fejl;
  try {
    if (kontoMaade === "opret") {
      fejl = kode !== kontoKode2.value ? "De to adgangskoder er ikke ens." : await opretKonto(navn, kode);
    } else {
      fejl = await logInd(navn, kode);
    }
  } catch (fejlen) {
    fejl = "Noget gik galt: " + fejlen.message;
  }
  if (fejl) {
    kontoFejl.textContent = fejl;
    // Findes profilen ikke, kan man oprette den med det samme
    if (kontoMaade === "ind" && navn && !hentKonti()[navn.toLowerCase()]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "konto-opret-nu";
      b.textContent = "Opret profilen " + navn + " nu";
      b.addEventListener("click", function () { aabnKonto("opret"); kontoNavn.value = navn; kontoKode.focus(); });
      kontoFejl.textContent = "Der er ingen profil med navnet " + navn + " på denne computer endnu. ";
      kontoFejl.appendChild(b);
    }
    return;
  }
  window.location.href = hotelAdresse();
});

document.getElementById("konto-luk").addEventListener("click", lukKonto);
kontoVindue.addEventListener("click", function (e) { if (e.target === kontoVindue) lukKonto(); });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") lukKonto(); });

// Knapperne på forsiden skifter, alt efter om man er logget ind
function visKontoKnapper() {
  const navn = aktivKonto();
  if (navn && EJER_NAVNE.includes(navn)) huskEjerGenvej(navn);
  document.getElementById("ud-knapper").hidden = !!navn;
  document.getElementById("ind-knapper").hidden = !navn;
  if (navn) document.getElementById("konto-hvem").textContent = navn;
  // Tjek ind-knapperne tager navnet med ind i hotellet
  document.querySelectorAll("#menu-tjek-ind, #knap-tjek-ind").forEach(function (a) { a.href = hotelAdresse(); });
  // Ejer-knappen vises kun, hvis ejeren har været logget ind på denne computer
  const ejer = ejerGenvej();
  document.getElementById("ejer-genvej").hidden = !ejer;
  if (ejer) document.getElementById("ejer-navn").textContent = ejer;
}
document.getElementById("knap-ejer").addEventListener("click", function () {
  if (ejerGenvejLogInd()) window.location.href = hotelAdresse();
});
document.getElementById("knap-ejer-glem").addEventListener("click", function () {
  glemEjerGenvej();
  visKontoKnapper();
});
document.getElementById("knap-log-ind").addEventListener("click", function () { aabnKonto("ind"); });
document.getElementById("knap-opret").addEventListener("click", function () { aabnKonto("opret"); });
document.getElementById("knap-log-ud").addEventListener("click", function () { logUd(); visKontoKnapper(); });
document.getElementById("menu-tjek-ind").addEventListener("click", function (e) {
  if (!aktivKonto()) { e.preventDefault(); aabnKonto("ind"); }
});
visKontoKnapper();

// Kommer man fra spillet uden at være logget ind, åbner vinduet med det samme
if (location.search.indexOf("login") >= 0 && !aktivKonto()) aabnKonto("ind");
