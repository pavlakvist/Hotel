// =============================================================
//  Glimt ⭐ og Stella 🔮 på serveren 💰
//  Pengene ligger på serveren, så ejeren kan give (og tage) penge til alle
//  i Ejerpanel → Valuta og økonomi, og man ser dem med det samme.
//  (Kræver database-6-penge.sql. Indtil da virker det som før.)
// =============================================================
let pengeHentet = false;
let pengeKoe = { glimt: 0, stella: 0 };     // det, der skal sendes til serveren
let pengeTimer = null;
let pengeSender = false;

function saetPenge(svar, fraServer) {
  const fikG = svar.glimt - glimt, fikS = svar.stella - krystaller;
  glimt = svar.glimt;
  krystaller = svar.stella;
  visGlimt();
  // har ejeren givet mig noget?
  if (fraServer && (fikG > 0 || fikS > 0)) {
    if (fikG > 0) blink(glimtBoks.querySelector(".penge"));
    if (fikS > 0) blink(glimtBoks.querySelector(".krystal"));
    const dele = [];
    if (fikG > 0) dele.push(fikG.toLocaleString("da-DK") + " " + system.valutaNavn);
    if (fikS > 0) dele.push(fikS.toLocaleString("da-DK") + " Stella");
    besked.textContent = "🎁 Du har fået " + dele.join(" og ") + "!";
    if (typeof spilPling === "function") spilPling();
  }
}

function hentPenge() {
  const token = mitToken();
  if (!SERVER.til || !token || pengeSender || pengeKoe.glimt || pengeKoe.stella) return;
  serverKald("hv_penge_hent", { p_token: token, p_glimt: glimt, p_stella: krystaller }).then(function (svar) {
    if (pengeSender || pengeKoe.glimt || pengeKoe.stella) return;
    saetPenge(svar, pengeHentet);
    pengeHentet = true;
  }).catch(function () {});     // database-6-penge.sql er ikke kørt endnu
}
hentPenge();
setInterval(hentPenge, 4000);

// Når man bruger eller får penge, sendes det til serveren (lidt samlet, så et bytte er ét kald)
function sendPenge() {
  if (pengeSender || (!pengeKoe.glimt && !pengeKoe.stella)) return;
  const k = pengeKoe;
  pengeKoe = { glimt: 0, stella: 0 };
  pengeSender = true;
  serverKald("hv_penge_aendr", { p_token: mitToken(), p_glimt: k.glimt, p_stella: k.stella }).then(function (svar) {
    pengeSender = false;
    if (!pengeKoe.glimt && !pengeKoe.stella) saetPenge(svar, false); else sendPenge();
  }).catch(function (e) {
    pengeSender = false;
    besked.textContent = e.message;
    hentPenge();               // serveren bestemmer, hvor mange penge man har
  });
}
const faaGlimtFoerServer = faaGlimt;
faaGlimt = function (antal) {
  faaGlimtFoerServer(antal);
  if (!pengeHentet || !antal) return;
  pengeKoe.glimt += antal;
  clearTimeout(pengeTimer);
  pengeTimer = setTimeout(sendPenge, 50);
};
const faaKrystallerFoerServer = faaKrystaller;
faaKrystaller = function (antal) {
  faaKrystallerFoerServer(antal);
  if (!pengeHentet || !antal) return;
  pengeKoe.stella += antal;
  clearTimeout(pengeTimer);
  pengeTimer = setTimeout(sendPenge, 50);
};


// -------------------------------------------------------------
//  Ejerpanel → Valuta og økonomi: giv penge til en spiller
// -------------------------------------------------------------
let pengeAlle = {};           // navn → { glimt, stella }
let pengeValgt = null;
let pengeSoeg = "";

function hentAllesPenge() {
  if (!pengeHentet || EJERE.indexOf(FIGUR.navn) < 0) return;
  serverKald("hv_penge_alle", { p_token: mitToken() }).then(function (svar) {
    const foer = stabil(pengeAlle);
    pengeAlle = svar || {};
    if (stabil(pengeAlle) !== foer && !ejerVindue.hidden && ejerFane === "valuta" && !skriverIPanel()) visValuta();
  }).catch(function () {});
}

const visValutaFoerServer = visValuta;
visValuta = function () {
  visValutaFoerServer();
  if (!pengeHentet || EJERE.indexOf(FIGUR.navn) < 0) return;
  const spillere = alleSpillere().filter(function (s) { return !erComputerGaest(s.navn); })
    .map(function (s) { return s.navn; });
  if (pengeValgt && spillere.indexOf(pengeValgt) < 0) pengeValgt = null;
  const p = pengeValgt ? pengeAlle[pengeValgt] : null;
  const sek = document.createElement("section");
  sek.className = "penge-giv";
  sek.innerHTML = "<h3>🎁 Giv penge til en spiller</h3>" +
    "<div class='penge-krop'><aside><input id='pg-soeg' type='text' placeholder='🔍 Søg efter navn …' value='" + rens(pengeSoeg) + "'>" +
    "<ul id='pg-liste'>" + spillere.map(function (n) {
      const x = pengeAlle[n];
      return "<li><button data-pg='" + rens(n) + "'" + (n === pengeValgt ? " class='valgt'" : "") + ">" + rens(n) +
        (x ? " <small>⭐ " + x.glimt.toLocaleString("da-DK") + " · 🔮 " + x.stella.toLocaleString("da-DK") + "</small>" : "") + "</button></li>";
    }).join("") + "</ul><p class='ejer-info pg-ingen' hidden>Ingen spillere med det navn.</p></aside>" +
    "<div class='pg-detaljer'>" + (pengeValgt
      ? "<h4>" + rens(pengeValgt) + "</h4>" +
        (p ? "<p>Har nu <b>⭐ " + p.glimt.toLocaleString("da-DK") + "</b> " + rens(system.valutaNavn) + " og <b>🔮 " + p.stella.toLocaleString("da-DK") + "</b> Stella</p>" : "") +
        "<label class='ejer-felt'>Antal (minus tager)<input id='pg-antal' type='number' value='100'></label>" +
        "<div class='sp-handlinger'><button id='pg-glimt'>⭐ Giv " + rens(system.valutaNavn) + "</button><button id='pg-stella'>🔮 Giv Stella</button></div>"
      : "<p class='tom'>Vælg en spiller i listen</p>") + "</div></div>";
  // lige efter "Giv eller tag"-knapperne til dig selv
  const egne = ejerIndhold.querySelector("#v-giv-k");
  const efter = egne ? egne.parentNode : null;
  if (efter) efter.after(sek); else ejerIndhold.appendChild(sek);

  const soeg = document.getElementById("pg-soeg");
  function filtrer() {
    const q = pengeSoeg.trim().toLowerCase();
    let vist = 0;
    sek.querySelectorAll("[data-pg]").forEach(function (k) {
      const med = !q || k.dataset.pg.toLowerCase().indexOf(q) >= 0;
      k.parentNode.hidden = !med;
      if (med) vist++;
    });
    sek.querySelector(".pg-ingen").hidden = vist > 0;
  }
  soeg.addEventListener("input", function () { pengeSoeg = soeg.value; filtrer(); });
  filtrer();
  sek.querySelectorAll("[data-pg]").forEach(function (k) {
    k.addEventListener("click", function () { pengeValgt = k.dataset.pg; visValuta(); });
  });
  function giv(hvad) {
    const antal = parseInt(document.getElementById("pg-antal").value, 10) || 0;
    if (!antal || !pengeValgt) return;
    const navn = pengeValgt;
    if (navn === FIGUR.navn) {
      if (hvad === "Stella") faaKrystaller(antal); else faaGlimt(antal);
    }
    const kald = navn === FIGUR.navn ? Promise.resolve(null) :
      serverKald("hv_penge_giv", { p_token: mitToken(), p_navn: navn, p_glimt: hvad === "Stella" ? 0 : antal, p_stella: hvad === "Stella" ? antal : 0 });
    kald.then(function (svar) {
      if (svar) pengeAlle[svar.navn] = { glimt: svar.glimt, stella: svar.stella };
      const navnet = hvad === "Stella" ? "Stella" : system.valutaNavn;
      adminSkriv((antal > 0 ? "Gav " : "Tog ") + Math.abs(antal) + " " + navnet + (antal > 0 ? " til " : " fra ") + navn);
      besked.textContent = (antal > 0 ? "🎁 " + navn + " fik " : "➖ " + navn + " mistede ") + Math.abs(antal) + " " + navnet + ".";
      setTimeout(hentAllesPenge, 400);
      visValuta();
    }).catch(function (e) { besked.textContent = e.message; });
  }
  const g = document.getElementById("pg-glimt"), s = document.getElementById("pg-stella");
  if (g) g.addEventListener("click", function () { giv(system.valutaNavn); });
  if (s) s.addEventListener("click", function () { giv("Stella"); });
};

// Pengene opdateres, mens fanen er åben
const visFaneFoerPenge = visFane;
visFane = function () {
  visFaneFoerPenge();
  if (ejerFane === "valuta") { hentAllesPenge(); if (typeof hentAlleSpillere === "function") hentAlleSpillere(); }
};
setInterval(function () { if (!ejerVindue.hidden && ejerFane === "valuta") hentAllesPenge(); }, 5000);

// Udseendet af "Giv penge til en spiller" (samme stil som spillerlisten)
const pengeStil = document.createElement("style");
pengeStil.textContent =
  ".penge-giv { margin-top: 14px; }" +
  ".penge-krop { display: grid; grid-template-columns: minmax(0, 190px) minmax(0, 1fr); gap: 12px; }" +
  ".pg-detaljer { min-width: 0; } .pg-detaljer input { width: 100%; box-sizing: border-box; } .pg-detaljer h4 { margin-top: 0; }" +
  ".penge-krop aside input { width: 100%; box-sizing: border-box; }" +
  "#pg-liste { list-style: none; margin: 4px 0 0; padding: 0; max-height: 230px; overflow-y: auto; }" +
  "#pg-liste li { padding: 0; border: 0; }" +
  "#pg-liste button { width: 100%; margin: 3px 0 0; padding: 6px 8px; background: #fff; color: #33402c; border: 1px solid #d6e8c8;" +
  " border-radius: 6px; font: 13px Verdana, sans-serif; text-align: left; cursor: pointer; }" +
  "#pg-liste button small { display: block; color: #7a8a76; font-size: 11px; }" +
  "#pg-liste button.valgt { background: #9ccc8f; border-color: #7fb56f; color: #1f3a1c; }" +
  "#pg-liste button.valgt small { color: #2f4a2b; }";
document.head.appendChild(pengeStil);
