// =============================================================
//  Den nye forside: receptionen (Log ind / Opret mig) står altid
//  fremme ved siden af velkomsten, og "X online" hentes fra serveren.
// =============================================================
const reception = document.getElementById("konto-vindue");
const velkommenTilbage = document.getElementById("velkommen-tilbage");

// Receptionen kan ikke lukkes; den står bare fremme
lukKonto = function () {};

// Knapperne skifter mellem Log ind og Opret mig i receptionen
["knap-log-ind", "knap-opret"].forEach(function (id) {
  document.getElementById(id).addEventListener("click", function () {
    reception.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

// Logget ind: vis "Velkommen tilbage" i stedet for Log ind
const visKontoKnapperFoerForside = visKontoKnapper;
visKontoKnapper = function () {
  visKontoKnapperFoerForside();
  const navn = aktivKonto();
  velkommenTilbage.hidden = !navn;
  if (navn) {
    reception.hidden = true;
    document.getElementById("tilbage-navn").textContent = navn;
    document.getElementById("tilbage-tjek-ind").href = hotelAdresse();
  } else if (reception.hidden) {
    aabnKonto(location.search.indexOf("opret") >= 0 ? "opret" : "ind");
  }
};
visKontoKnapper();


// ----- "X online" fra serveren -----
const onlineTekst = document.getElementById("online-tekst");
async function hentOnline() {
  if (typeof SERVER === "undefined" || !SERVER.til) return;
  let antal = null;
  try {
    antal = await serverKald("hv_antal_online", {});      // virker for alle (database-8)
  } catch (e) {
    // findes funktionen ikke endnu, kan en der er logget ind tælle selv
    const token = typeof mitToken === "function" ? mitToken() : null;
    if (token) {
      try {
        const alle = await serverKald("hv_alle_spillere", { p_token: token });
        antal = alle.filter(function (s) { return s.online; }).length;
      } catch (e2) {}
    }
  }
  if (typeof antal === "number") {
    onlineTekst.textContent = "Nu åbent · " + antal + (antal === 1 ? " gæst" : " gæster") + " online";
    document.getElementById("online-pille").classList.add("live");
  }
}
hentOnline();
setInterval(hentOnline, 30000);
