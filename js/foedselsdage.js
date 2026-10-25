// =============================================================
//  Fødselsdage 🎂
//  - Alle kan skrive deres fødselsdag i Min profil (gemt på serveren).
//  - Ejeren og Eventværter ser en fødselsdagskalender i Ejerpanel → Events og nyheder,
//    kan skrive andres fødselsdag ind, og med ét tryk lave et banner, fx
//    "🎂 Tillykke med fødselsdagen, Ida!" + "Fest i hallen kl. 20 🎉".
//  (Kræver database-10-foedselsdage.sql. Indtil da virker det som før.)
// =============================================================
const MAANEDER = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
let foedselsdage = null;       // [{ navn, dato: "MM-DD" }] (kun ejeren og Eventværter)
let minFoedselsdag = null;

function datoTekst(dato) {
  const d = dato.split("-");
  return (+d[1]) + ". " + MAANEDER[+d[0] - 1];
}
// Hvor mange dage til næste fødselsdag (0 = i dag)
function dageTil(dato) {
  const nu = new Date();
  const idag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const d = dato.split("-");
  let naeste = new Date(nu.getFullYear(), +d[0] - 1, +d[1]);
  if (naeste < idag) naeste = new Date(nu.getFullYear() + 1, +d[0] - 1, +d[1]);
  return Math.round((naeste - idag) / 86400000);
}
function maaSeKalender() { const r = minRolle(); return r === "ejer" || r === "eventvaert"; }


// -------------------------------------------------------------
//  Min profil: skriv din fødselsdag
// -------------------------------------------------------------
const fdFelt = document.createElement("div");
fdFelt.className = "fd-felt";
fdFelt.innerHTML = "<label for='fd-dag'>🎂 Fødselsdag</label>" +
  "<div class='fd-valg'><select id='fd-dag'><option value=''>Dag</option>" +
  Array.from({ length: 31 }, function (_, i) { return "<option value='" + String(i + 1).padStart(2, "0") + "'>" + (i + 1) + ".</option>"; }).join("") +
  "</select><select id='fd-maaned'><option value=''>Måned</option>" +
  MAANEDER.map(function (m, i) { return "<option value='" + String(i + 1).padStart(2, "0") + "'>" + m + "</option>"; }).join("") +
  "</select><span id='fd-gemt'></span></div>";
document.getElementById("profil-motto").after(fdFelt);
const fdDag = document.getElementById("fd-dag"), fdMaaned = document.getElementById("fd-maaned"), fdGemt = document.getElementById("fd-gemt");

function visMinFoedselsdag() {
  const d = minFoedselsdag ? minFoedselsdag.split("-") : ["", ""];
  fdMaaned.value = d[0];
  fdDag.value = d[1];
}
function gemMinFoedselsdag() {
  if (!fdDag.value !== !fdMaaned.value) { fdGemt.textContent = "Vælg både dag og måned"; return; }
  const dato = fdDag.value ? fdMaaned.value + "-" + fdDag.value : "";
  serverKald("hv_foedselsdag_saet", { p_token: mitToken(), p_navn: "", p_dato: dato }).then(function () {
    minFoedselsdag = dato || null;
    fdGemt.textContent = "Gemt ✓";
    setTimeout(function () { fdGemt.textContent = ""; }, 2000);
    hentFoedselsdage();
  }).catch(function (e) {
    fdGemt.textContent = /hv_foedselsdag/.test(e.message) ? "Virker, når database-10 er kørt" : e.message;
  });
}
fdDag.addEventListener("change", gemMinFoedselsdag);
fdMaaned.addEventListener("change", gemMinFoedselsdag);

function hentMinFoedselsdag() {
  const token = mitToken();
  if (!SERVER.til || !token) { fdFelt.hidden = true; return; }
  serverKald("hv_foedselsdag_hent", { p_token: token }).then(function (dato) {
    minFoedselsdag = dato || null;
    visMinFoedselsdag();
    // tillykke på dagen
    if (minFoedselsdag && dageTil(minFoedselsdag) === 0) {
      setTimeout(function () { besked.textContent = "🎂 Tillykke med fødselsdagen, " + FIGUR.navn + "! 🎉"; }, 1500);
    }
  }).catch(function () { fdFelt.hidden = true; });    // database-10 er ikke kørt endnu
}
hentMinFoedselsdag();


// -------------------------------------------------------------
//  Kalenderen i Events og nyheder
// -------------------------------------------------------------
function hentFoedselsdage() {
  if (!SERVER.til || !mitToken() || !maaSeKalender()) return;
  serverKald("hv_foedselsdage", { p_token: mitToken() }).then(function (liste) {
    const foer = JSON.stringify(foedselsdage);
    foedselsdage = liste || [];
    if (JSON.stringify(foedselsdage) !== foer && !ejerVindue.hidden && ejerFane === "events" && !skriverIPanel()) visFane();
  }).catch(function () {});
}
setInterval(function () { if (!ejerVindue.hidden && ejerFane === "events") hentFoedselsdage(); }, 15000);

let fdValgtMaaned = new Date().getMonth();

// Udfyld banneret øverst i fanen
function lavFoedselsdagsBanner(navn) {
  const titel = document.getElementById("n-titel"), tekst = document.getElementById("n-tekst");
  if (!titel) return;
  titel.value = ("🎂 Tillykke med fødselsdagen, " + navn + "!").slice(0, 40);
  if (!tekst.value) tekst.value = "Fest i hallen kl. 20 🎉";
  const banner = document.getElementById("n-banner");
  if (banner) banner.checked = true;
  ejerIndhold.scrollTop = 0;
  titel.focus();
  besked.textContent = "🎂 Banneret er klar. Ret teksten, hvis du vil, og tryk 📢 Udsend.";
}

const visEventsFoerFd = visEvents;
visEvents = function () {
  visEventsFoerFd();
  if (!maaSeKalender()) return;
  if (foedselsdage === null) { hentFoedselsdage(); }
  const liste = foedselsdage || [];
  const sek = document.createElement("section");
  sek.className = "fd-kalender";
  let html = "<h3>🎂 Fødselsdagskalender</h3>";
  if (foedselsdage === null) {
    html += "<p class='ejer-info'>Henter fødselsdage … (virker, når database-10-foedselsdage.sql er kørt)</p>";
  } else {
    // i dag og de næste 14 dage
    const snart = liste.map(function (f) { return { navn: f.navn, dato: f.dato, om: dageTil(f.dato) }; })
      .filter(function (f) { return f.om <= 14; }).sort(function (a, b) { return a.om - b.om; });
    html += "<h4>Snart</h4>" + (snart.length ? "<ul class='fd-snart'>" + snart.map(function (f) {
      return "<li" + (f.om === 0 ? " class='idag'" : "") + "><b>" + (f.om === 0 ? "🎉 " : "🎂 ") + rens(f.navn) + "</b>" +
        "<span>" + datoTekst(f.dato) + " · " + (f.om === 0 ? "I DAG!" : f.om === 1 ? "i morgen" : "om " + f.om + " dage") + "</span>" +
        "<button class='lille' data-fd-banner='" + rens(f.navn) + "'>📢 Lav banner</button></li>";
    }).join("") + "</ul>" : "<p class='ejer-tom'>Ingen fødselsdage de næste 14 dage.</p>");
    // månederne
    html += "<div class='fd-maaneder'>" + MAANEDER.map(function (m, i) {
      const her = liste.filter(function (f) { return +f.dato.split("-")[0] === i + 1; }).length;
      return "<button data-fd-maaned='" + i + "' class='" + (i === fdValgtMaaned ? "valgt" : "") + (i === new Date().getMonth() ? " nu" : "") + "'>" +
        m.slice(0, 3) + (her ? " <small>" + her + "</small>" : "") + "</button>";
    }).join("") + "</div>";
    const iMaaned = liste.filter(function (f) { return +f.dato.split("-")[0] === fdValgtMaaned + 1; })
      .sort(function (a, b) { return a.dato < b.dato ? -1 : 1; });
    html += "<h4>" + MAANEDER[fdValgtMaaned][0].toUpperCase() + MAANEDER[fdValgtMaaned].slice(1) + "</h4>" +
      (iMaaned.length ? "<ul class='fd-liste'>" + iMaaned.map(function (f) {
        return "<li><b>" + (+f.dato.split("-")[1]) + ".</b> " + rens(f.navn) +
          "<button class='lille' data-fd-banner='" + rens(f.navn) + "'>📢 Banner</button>" +
          "<button class='lille' data-fd-slet='" + rens(f.navn) + "' title='Fjern fødselsdagen'>✕</button></li>";
      }).join("") + "</ul>" : "<p class='ejer-tom'>Ingen fødselsdage i " + MAANEDER[fdValgtMaaned] + ".</p>");
    // skriv en fødselsdag ind for en spiller
    const spillere = alleSpillere().filter(function (s) { return !erComputerGaest(s.navn); });
    html += "<h4>Skriv en fødselsdag ind</h4><div class='sp-handlinger fd-ny'>" +
      "<select id='fd-hvem'>" + spillere.map(function (s) { return "<option>" + rens(s.navn) + "</option>"; }).join("") + "</select>" +
      "<select id='fd-ny-dag'>" + Array.from({ length: 31 }, function (_, i) { return "<option value='" + String(i + 1).padStart(2, "0") + "'>" + (i + 1) + ".</option>"; }).join("") + "</select>" +
      "<select id='fd-ny-maaned'>" + MAANEDER.map(function (m, i) { return "<option value='" + String(i + 1).padStart(2, "0") + "'" + (i === fdValgtMaaned ? " selected" : "") + ">" + m + "</option>"; }).join("") + "</select>" +
      "<button id='fd-gem'>🎂 Gem</button></div>" +
      "<p class='ejer-info'>Spillerne kan også selv skrive deres fødselsdag i Min profil.</p>";
  }
  sek.innerHTML = html;
  // før event-rummene og nøglerne, lige under nyhederne
  const efter = ejerIndhold.querySelector(".event-laase, .elev-noegler");
  if (efter) ejerIndhold.insertBefore(sek, efter); else ejerIndhold.appendChild(sek);

  sek.querySelectorAll("[data-fd-banner]").forEach(function (k) {
    k.addEventListener("click", function () { lavFoedselsdagsBanner(k.dataset.fdBanner); });
  });
  sek.querySelectorAll("[data-fd-maaned]").forEach(function (k) {
    k.addEventListener("click", function () { fdValgtMaaned = +k.dataset.fdMaaned; visEvents(); });
  });
  sek.querySelectorAll("[data-fd-slet]").forEach(function (k) {
    k.addEventListener("click", function () { gemFoedselsdagFor(k.dataset.fdSlet, ""); });
  });
  const gem = document.getElementById("fd-gem");
  if (gem) gem.addEventListener("click", function () {
    const navn = document.getElementById("fd-hvem").value;
    if (!navn) return;
    gemFoedselsdagFor(navn, document.getElementById("fd-ny-maaned").value + "-" + document.getElementById("fd-ny-dag").value);
  });
};

function gemFoedselsdagFor(navn, dato) {
  serverKald("hv_foedselsdag_saet", { p_token: mitToken(), p_navn: navn, p_dato: dato }).then(function () {
    besked.textContent = dato ? "🎂 " + navn + " har fødselsdag " + datoTekst(dato) + "." : "Fødselsdagen for " + navn + " er fjernet.";
    if (navn === FIGUR.navn) { minFoedselsdag = dato || null; visMinFoedselsdag(); }
    if (dato) fdValgtMaaned = +dato.split("-")[0] - 1;
    foedselsdage = (foedselsdage || []).filter(function (f) { return f.navn !== navn; });
    if (dato) foedselsdage.push({ navn: navn, dato: dato });
    visEvents();
    hentFoedselsdage();
  }).catch(function (e) { besked.textContent = e.message; });
}

// Udseendet
const fdStil = document.createElement("style");
fdStil.textContent =
  ".fd-felt { margin: 6px 0 4px; } .fd-felt label { display: block; }" +
  ".fd-valg { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; } .fd-valg select { font: 12px Verdana, sans-serif; padding: 3px; }" +
  "#fd-gemt { font-size: 11px; color: #4e7d4a; }" +
  ".fd-kalender { margin-top: 16px; }" +
  ".fd-snart { list-style: none; margin: 0; padding: 0; } .fd-snart li { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 6px 8px; margin: 3px 0;" +
  " background: #fff; border: 1px solid #d6e8c8; border-radius: 8px; } .fd-snart li span { color: #7a8a76; font-size: 12px; flex: 1; }" +
  ".fd-snart li.idag { background: #fff3c4; border-color: #e0a73c; }" +
  ".fd-maaneder { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin: 10px 0 4px; }" +
  ".fd-maaneder button { padding: 5px 2px; background: #fff; border: 1px solid #d6e8c8; border-radius: 6px; font: 12px Verdana, sans-serif; cursor: pointer; color: #33402c; }" +
  ".fd-maaneder button.nu { border-color: #e0a73c; } .fd-maaneder button.valgt { background: #9ccc8f; border-color: #7fb56f; color: #1f3a1c; }" +
  ".fd-maaneder small { background: #c0392b; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 10px; }" +
  ".fd-liste { list-style: none; margin: 0; padding: 0; } .fd-liste li { display: flex; gap: 6px; align-items: center; padding: 4px 0; border-bottom: 1px dashed #e4dcc4; }" +
  ".fd-liste li button:first-of-type { margin-left: auto; }" +
  ".fd-ny select { font: 12px Verdana, sans-serif; padding: 4px; }";
document.head.appendChild(fdStil);
