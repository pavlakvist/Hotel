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
  kontoKode.value = "";
  kontoKode2.value = "";
  kontoVindue.hidden = false;
  kontoNavn.focus();
}

function lukKonto() {
  kontoVindue.hidden = true;
}

kontoForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const navn = kontoNavn.value.trim();
  const kode = kontoKode.value;
  let fejl;
  if (kontoMaade === "opret") {
    fejl = kode !== kontoKode2.value ? "De to adgangskoder er ikke ens." : await opretKonto(navn, kode);
  } else {
    fejl = await logInd(navn, kode);
  }
  if (fejl) { kontoFejl.textContent = fejl; return; }
  window.location.href = "hotel.html";
});

document.getElementById("konto-luk").addEventListener("click", lukKonto);
kontoVindue.addEventListener("click", function (e) { if (e.target === kontoVindue) lukKonto(); });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") lukKonto(); });

// Knapperne på forsiden skifter, alt efter om man er logget ind
function visKontoKnapper() {
  const navn = aktivKonto();
  document.getElementById("ud-knapper").hidden = !!navn;
  document.getElementById("ind-knapper").hidden = !navn;
  if (navn) document.getElementById("konto-hvem").textContent = navn;
}
document.getElementById("knap-log-ind").addEventListener("click", function () { aabnKonto("ind"); });
document.getElementById("knap-opret").addEventListener("click", function () { aabnKonto("opret"); });
document.getElementById("knap-log-ud").addEventListener("click", function () { logUd(); visKontoKnapper(); });
document.getElementById("menu-tjek-ind").addEventListener("click", function (e) {
  if (!aktivKonto()) { e.preventDefault(); aabnKonto("ind"); }
});
visKontoKnapper();

// Kommer man fra spillet uden at være logget ind, åbner vinduet med det samme
if (location.search.indexOf("login") >= 0 && !aktivKonto()) aabnKonto("ind");
