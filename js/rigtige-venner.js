// =============================================================
//  Rigtige venner 💚 — klik på andre spillere, bliv venner og skriv sammen
//  Venner og private beskeder med rigtige spillere gemmes på serveren.
//  Computer-gæsterne (Ida, Noah, ...) virker som før, kun på denne computer.
// =============================================================
function erComputerGaest(navn) {
  return HAL_GAESTER.some(function (g) { return g.navn === navn; });
}
function erRigtigSpiller(g) {
  return !!g && ANDRE_SPILLERE[g.navn] === g;
}
let serverVenner = [];          // [{ navn, rum, online }] fra serveren

// Hvor langt vi er nået i de private beskeder (så de ikke kommer to gange)
function beskedEfterNoegle() { return "mit-hotel-besked-efter-" + FIGUR.navn; }
function beskedEfterId() {
  try { return parseInt(localStorage.getItem(beskedEfterNoegle()), 10) || 0; } catch (e) { return 0; }
}


// -------------------------------------------------------------
//  Klik på en rigtig spiller åbner den samme menu som for gæsterne
// -------------------------------------------------------------
const gaestUnderMusFoer = gaestUnderMus;
gaestUnderMus = function (e) {
  let fundet = gaestUnderMusFoer(e);
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width);
  const sy = (e.clientY - r.top) * (HOEJDE / r.height);
  const rum = mitRumId();
  Object.values(ANDRE_SPILLERE).forEach(function (g) {
    if (g.rumId !== rum) return;
    const p = punkt(g.x + 0.5, g.y + 0.5);
    p.x += gaestPlads(g);
    if (Math.abs(sx - p.x) < 18 && sy < p.y + 4 && sy > p.y - figurHoejde(g.valg) - 4) {
      if (!fundet || g.x + g.y > fundet.x + fundet.y) fundet = g;
    }
  });
  return fundet;
};

// Byt virker kun med computer-gæsterne indtil videre.
// "Tilføj ven" viser, hvis en anmodning allerede er sendt eller venter på dit svar.
const aabnGaestMenuRigtig = aabnGaestMenu;
aabnGaestMenu = function (g) {
  aabnGaestMenuRigtig(g);
  if (!erRigtigSpiller(g)) return;
  minMenuKnapper.querySelectorAll("button").forEach(function (k) {
    if (k.textContent.indexOf("🔄") === 0) k.remove();
    if (k.textContent.indexOf("➕ Tilføj ven") === 0) {
      if (anmodninger.tilMig.indexOf(g.navn) >= 0) k.textContent = "✅ Sig ja til ven";
      else if (anmodninger.fraMig.indexOf(g.navn) >= 0) { k.textContent = "⏳ Anmodning sendt"; k.disabled = true; }
    }
  });
  placerMinMenu();
};

// Rigtige spillere svarer selv, så computeren må ikke svare for dem
const gaestSkriverRigtig = gaestSkriver;
gaestSkriver = function (g, tekst) {
  if (erRigtigSpiller(g)) return;
  gaestSkriverRigtig(g, tekst);
};
const venSvarerRigtig = venSvarer;
venSvarer = function (navn, tekst) {
  if (!erComputerGaest(navn)) return;
  venSvarerRigtig(navn, tekst);
};


// -------------------------------------------------------------
//  Venner
// -------------------------------------------------------------
// Kun computer-gæsterne gemmes på computeren; resten kommer fra serveren
gemVenner = function () {
  try { localStorage.setItem(VENNER_NOEGLE, JSON.stringify(venner.filter(erComputerGaest))); } catch (e) {}
};

const venOnlineRigtig = venOnline;
venOnline = function (navn) {
  if (erComputerGaest(navn)) return venOnlineRigtig(navn);
  return !!ANDRE_SPILLERE[navn] || serverVenner.some(function (v) { return v.navn === navn && v.online; });
};

const tilfoejVenRigtig = tilfoejVen;
tilfoejVen = function (g) {
  if (erComputerGaest(g.navn)) { tilfoejVenRigtig(g); return; }
  if (erVen(g.navn)) return;
  if (!serverHarVenner) {
    besked.textContent = "Venner med rigtige spillere virker, når database-2-venner.sql er kørt i Supabase.";
    return;
  }
  serverKald("hv_ven_tilfoej", { p_token: mitToken(), p_navn: g.navn }).then(function (svar) {
    if (svar && svar.status === "sendt") {
      // den anden skal sige ja først
      if (anmodninger.fraMig.indexOf(g.navn) < 0) anmodninger.fraMig.push(g.navn);
      svaev("📨", g);
      besked.textContent = "📨 Venneanmodning sendt til " + g.navn + ". Når " + g.navn + " siger ja, bliver I venner.";
      return;
    }
    anmodninger.tilMig = anmodninger.tilMig.filter(function (n) { return n !== g.navn; });
    if (!erVen(g.navn)) venner.push(g.navn);
    svaev("💚", g);
    besked.textContent = "Du og " + g.navn + " er nu venner! 💚";
    visVenner();
    visUlaest();
  }).catch(function (e) { besked.textContent = e.message; });
};

const fjernVenRigtig = fjernVen;
fjernVen = function (navn) {
  if (erComputerGaest(navn)) { fjernVenRigtig(navn); return; }
  serverKald("hv_ven_fjern", { p_token: mitToken(), p_navn: navn }).then(function () {
    serverVenner = serverVenner.filter(function (v) { return v.navn !== navn; });
    fjernVenRigtig(navn);
  }).catch(function (e) { besked.textContent = e.message; });
};


// -------------------------------------------------------------
//  Private beskeder til rigtige venner sendes via serveren
// -------------------------------------------------------------
const tilfoejBeskedRigtig = tilfoejBesked;
tilfoejBesked = function (navn, fra, tekst, ekstra) {
  tilfoejBeskedRigtig(navn, fra, tekst, ekstra);
  if (fra !== FIGUR.navn || erComputerGaest(navn) || !serverHarVenner || !mitToken()) return;
  serverKald("hv_besked_send", { p_token: mitToken(), p_til: navn, p_tekst: tekst })
    .catch(function (e) { tilfoejBeskedRigtig(navn, "⚠️", "Beskeden kom ikke frem: " + e.message); });
};


// -------------------------------------------------------------
//  Hvert sekund (fra js/rigtige-spillere.js): venner og nye beskeder
// -------------------------------------------------------------
let sidsteVenneliste = "";
function venPuls(svar) {
  if (!svar.venner) return;
  serverVenner = svar.venner;
  const navne = venner.filter(erComputerGaest);
  serverVenner.forEach(function (v) { if (navne.indexOf(v.navn) < 0) navne.push(v.navn); });
  const tekst = JSON.stringify(serverVenner) + navne.join(",");
  if (tekst !== sidsteVenneliste) {
    sidsteVenneliste = tekst;
    venner = navne;
    visVenner();
    visUlaest();
  }
  let sidste = beskedEfterId();
  (svar.beskeder || []).forEach(function (m) {
    if (m.id <= sidste) return;
    tilfoejBesked(m.fra, m.fra, m.tekst);   // fra en anden, så den sendes ikke videre
    sidste = m.id;
  });
  try { localStorage.setItem(beskedEfterNoegle(), sidste); } catch (e) {}
}


// -------------------------------------------------------------
//  Venneanmodninger 📨 — den anden skal sige ja, før I bliver venner
// -------------------------------------------------------------
let anmodninger = { tilMig: [], fraMig: [] };

function hentAnmodninger() {
  const token = mitToken();
  if (!SERVER.til || !token || !serverHarVenner) return;
  serverKald("hv_anmodninger_hent", { p_token: token }).then(function (svar) {
    const nye = svar.tilMig.filter(function (n) { return anmodninger.tilMig.indexOf(n) < 0; });
    const foer = JSON.stringify(anmodninger);
    anmodninger = svar;
    if (nye.length) besked.textContent = "📨 " + nye.join(", ") + " vil gerne være din ven! Åbn vennelisten 👫 for at svare.";
    if (JSON.stringify(anmodninger) !== foer) { visVenner(); visUlaest(); }
  }).catch(function () {});   // database-3-anmodninger-og-mentions.sql er ikke kørt endnu
}
hentAnmodninger();
setInterval(hentAnmodninger, 4000);

function svarAnmodning(navn, ja) {
  serverKald("hv_ven_svar", { p_token: mitToken(), p_navn: navn, p_ja: ja }).then(function () {
    anmodninger.tilMig = anmodninger.tilMig.filter(function (n) { return n !== navn; });
    if (ja && !erVen(navn)) venner.push(navn);
    besked.textContent = ja ? "Du og " + navn + " er nu venner! 💚" : "Du sagde nej tak til " + navn + ".";
    visVenner();
    visUlaest();
  }).catch(function (e) { besked.textContent = e.message; });
}

// Anmodningerne står øverst i vennelisten med Ja / Nej
const visVennerAnmod = visVenner;
visVenner = function () {
  visVennerAnmod();
  if (vennerVindue.hidden || !anmodninger.tilMig.length) return;
  const liste = document.getElementById("venner-liste");
  const tom = liste.querySelector(".venner-tom");
  if (tom) tom.remove();
  anmodninger.tilMig.slice().reverse().forEach(function (navn) {
    const li = document.createElement("li");
    li.className = "ven-anmodning";
    li.innerHTML = "<span class='ven-prik on'></span><span class='ven-navn'><b>" + tegnTilHtml(navn) + "</b><small>📨 Vil gerne være din ven</small></span>" +
      "<button class='ja'>✓ Ja</button><button class='fjern'>✕ Nej</button>";
    li.querySelector(".ja").addEventListener("click", function () { svarAnmodning(navn, true); });
    li.querySelector(".fjern").addEventListener("click", function () { svarAnmodning(navn, false); });
    liste.prepend(li);
  });
};

// Det røde tal på 👫-knappen tæller også anmodninger
const visUlaestAnmod = visUlaest;
visUlaest = function () {
  visUlaestAnmod();
  const n = anmodninger.tilMig.length;
  if (!n) return;
  const tal = document.getElementById("venner-ulaest");
  const foer = parseInt(tal.textContent, 10) || 0;
  const alle = (tal.hidden ? 0 : foer) + n;
  tal.textContent = alle > 9 ? "9+" : alle;
  tal.hidden = false;
};
