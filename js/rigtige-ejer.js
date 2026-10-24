// =============================================================
//  Ejerpanelet kender de rigtige spillere 🛡️
//  Alle profiler på serveren kommer med i Spillere og konti og i Ansættelse,
//  og Ansættelse får et søgefelt til navnene.
// =============================================================
let serverAlle = [];            // [{ navn, oprettet, sidst, online }]

function hentAlleSpillere() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_alle_spillere", { p_token: token }).then(function (liste) {
    const foer = JSON.stringify(serverAlle);
    serverAlle = liste || [];
    // panelet tegnes igen, hvis listen har ændret sig (men ikke mens man skriver)
    const aktiv = document.activeElement;
    const skriver = aktiv && aktiv.tagName === "INPUT" && ejerVindue.contains(aktiv);
    if (JSON.stringify(serverAlle) !== foer && !ejerVindue.hidden && !skriver &&
        (ejerFane === "spillere" || ejerFane === "ansaettelse")) visFane();
  }).catch(function () {});   // databasen har ikke listen endnu (database-2-venner.sql)
}
hentAlleSpillere();
setInterval(hentAlleSpillere, 30000);

const alleSpillereFoerServer = alleSpillere;
alleSpillere = function () {
  // "profiler på denne computer" er nu bare dem, der er logget ind herfra, så de springes over
  const liste = alleSpillereFoerServer().filter(function (s) { return s.hvad !== "Profil på denne computer"; });
  serverAlle.forEach(function (s) {
    if (liste.some(function (x) { return x.navn.toLowerCase() === s.navn.toLowerCase(); })) return;
    liste.push({ navn: s.navn, hvad: EJERE.indexOf(s.navn) >= 0 ? "Ejer" : "Spiller" });
  });
  return liste;
};

const erOnlineFoerServer = erOnline;
erOnline = function (navn) {
  if (ANDRE_SPILLERE[navn]) return true;
  if (serverAlle.some(function (s) { return s.navn === navn; })) return serverAlle.some(function (s) { return s.navn === navn && s.online; });
  return erOnlineFoerServer(navn);
};

// Senest set kommer fra serveren for rigtige spillere
const senestSetFoerServer = senestSet;
senestSet = function (navn) {
  const s = serverAlle.find(function (x) { return x.navn === navn; });
  const t = s && s.sidst ? new Date(s.sidst).getTime() : 0;
  return Math.max(t, senestSetFoerServer(navn));
};


// -------------------------------------------------------------
//  Søgefelt i Ansættelse
// -------------------------------------------------------------
let ansatSoeg = "";
function filtrerAnsatListe() {
  const q = ansatSoeg.trim().toLowerCase();
  let vist = 0;
  ejerIndhold.querySelectorAll(".an-spillere [data-an-spiller]").forEach(function (k) {
    const med = !q || k.dataset.anSpiller.toLowerCase().indexOf(q) >= 0;
    k.hidden = !med;
    if (med) vist++;
  });
  const ingen = ejerIndhold.querySelector(".an-ingen");
  if (ingen) ingen.hidden = vist > 0;
}
const visAnsaettelseFoerSoeg = visAnsaettelse;
visAnsaettelse = function () {
  visAnsaettelseFoerSoeg();
  const overskrift = ejerIndhold.querySelector(".an-spillere h3");
  if (!overskrift) return;
  const felt = document.createElement("input");
  felt.type = "text";
  felt.className = "an-soeg";
  felt.placeholder = "🔍 Søg efter navn …";
  felt.value = ansatSoeg;
  felt.addEventListener("input", function () { ansatSoeg = felt.value; filtrerAnsatListe(); });
  overskrift.after(felt);
  const ingen = document.createElement("p");
  ingen.className = "ejer-info an-ingen";
  ingen.textContent = "Ingen spillere med det navn.";
  ingen.hidden = true;
  felt.after(ingen);
  filtrerAnsatListe();
};
