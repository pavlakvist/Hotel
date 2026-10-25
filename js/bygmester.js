// =============================================================
//  Bygmester 🔨
//  Spillere med Bygmester-skiltet (og ejeren) kan bygge i de fælles rum:
//  Velkomsthallen, event-rummene og den hemmelige etage.
//  - Hele møbelkataloget er gratis, men kun i de fælles rum (ikke i deres egne).
//  - Møblerne i de fælles rum ligger på serveren, så alle ser det samme.
//  - Bliver de fyret, forsvinder kataloget med det samme.
//  (Kræver database-7-bygmester.sql. Indtil da virker det som før.)
// =============================================================
function erFaellesRumId(id) {
  return id === "hal" || (typeof INDBYGGEDE_RUM !== "undefined" && !!INDBYGGEDE_RUM[id]);
}
function iFaellesRum() { return erFaellesRumId(mitRumId()); }
function kanBygge() { return EJERE.indexOf(FIGUR.navn) >= 0 || ansatte[FIGUR.navn] === "bygmester"; }

function rumMoebler(id) {
  if (mitRumId() === id) return moeblerIRummet;
  return id === "hal" ? HAL_MOEBLER : vaerelseMoebler(id);
}
function somData(liste) {
  return liste.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: !!m.spejlet }; });
}


// -------------------------------------------------------------
//  Møblerne i de fælles rum hentes fra serveren
// -------------------------------------------------------------
let byggeHentet = false;
const byggeServer = {};      // rum → sidst kendte møbler fra serveren
const byggeSender = {};      // rum der er ved at blive gemt

function hentByggeri() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_rum_moebler_hent", { p_token: token }).then(function (svar) {
    svar = svar || {};
    const foersteGang = !byggeHentet;
    byggeHentet = true;
    if (foersteGang) {
      Object.keys(INDBYGGEDE_RUM).forEach(function (id) {
        if (svar[id]) return;
        let lokal = null;
        try { lokal = JSON.parse(localStorage.getItem("mit-hotel-rum-" + id) || "null"); } catch (e) {}
        if (EJERE.indexOf(FIGUR.navn) >= 0 && Array.isArray(lokal)) {
          // ejeren har pyntet rummet på sin egen computer: det kommer op på serveren
          sendRum(id, rumMoebler(id));
        } else {
          // alle andre ser hotellets eget udseende, indtil nogen bygger noget
          const standard = (id === "hemmelig" ? HEMMELIG_MOEBLER : EVENT_MOEBLER).filter(function (m) { return MOEBEL_TYPER[m.type]; });
          brugMoebler(id, somData(standard));
        }
      });
    }
    Object.keys(svar).forEach(function (id) {
      if (!erFaellesRumId(id) || byggeSender[id]) return;
      const s = stabil(svar[id]);
      if (byggeServer[id] === s) return;
      byggeServer[id] = s;
      brugMoebler(id, svar[id]);
    });
  }).catch(function () {});    // database-7-bygmester.sql er ikke kørt endnu
}
hentByggeri();
setInterval(hentByggeri, 3000);

// Sæt møblerne ind i rummet (de møbler, der ikke er flyttet, bliver de samme, så ingen rejser sig)
function brugMoebler(id, data) {
  const liste = rumMoebler(id);
  const gamle = liste.slice();
  const nye = (data || []).filter(function (d) { return MOEBEL_TYPER[d.type]; }).map(function (d) {
    const i = gamle.findIndex(function (m) { return m.type === d.type && m.x === d.x && m.y === d.y; });
    if (i >= 0) {
      const m = gamle.splice(i, 1)[0];
      m.spejlet = !!d.spejlet;
      return m;
    }
    return { type: d.type, x: d.x, y: d.y, spejlet: !!d.spejlet };
  });
  liste.length = 0;
  nye.forEach(function (m) { liste.push(m); });
  if (id !== "hal") andreVaerelser[id] = liste;
  if (mitRumId() === id) {
    if (valgtMoebel && liste.indexOf(valgtMoebel) < 0) { valgtMoebel = null; opdaterPanel(); }
    if (typeof flytter !== "undefined" && flytter && liste.indexOf(flytter) < 0) { flytter = null; opdaterPanel(); }
  }
}

function sendRum(id, liste) {
  const data = somData(liste);
  byggeSender[id] = true;
  serverKald("hv_rum_moebler_gem", { p_token: mitToken(), p_rum: id, p_moebler: data }).then(function () {
    byggeServer[id] = stabil(data);
    delete byggeSender[id];
  }).catch(function (e) {
    delete byggeSender[id];
    delete byggeServer[id];       // hent serverens udgave igen
    besked.textContent = e.message;
  });
}

// Når en Bygmester stiller, flytter, drejer eller fjerner et møbel i et fælles rum, gemmes det på serveren
const gemFoerByg = gem;
gem = function () {
  gemFoerByg();
  if (!iFaellesRum() || !kanBygge() || !byggeHentet) return;
  sendRum(mitRumId(), moeblerIRummet);
};


// -------------------------------------------------------------
//  Drej og fjern i de fælles rum (møblerne kommer ikke i Mine ting, de er jo gratis)
// -------------------------------------------------------------
const drejValgtFoerByg = drejValgt;
drejValgt = function () {
  if (!iFaellesRum()) { drejValgtFoerByg(); return; }
  if (!valgtMoebel || !kanBygge()) return;
  valgtMoebel.spejlet = !valgtMoebel.spejlet;
  gem();
};

const samlOpValgtFoerByg = samlOpValgt;
samlOpValgt = function () {
  if (!iFaellesRum()) { samlOpValgtFoerByg(); return; }
  if (!valgtMoebel || !kanBygge()) return;
  const navn = MOEBEL_TYPER[valgtMoebel.type].navn;
  if (figur.sidde && figur.sidde.moebel === valgtMoebel) { figur.sidde = null; figur.skalSidde = null; }
  const i = moeblerIRummet.indexOf(valgtMoebel);
  if (i >= 0) moeblerIRummet.splice(i, 1);
  valgtMoebel = null;
  gem();
  opdaterPanel();
  setTimeout(function () { besked.textContent = navn + " er fjernet fra rummet 🗑"; }, 0);
};

// Knapperne i panelet og i møbel-boksen bruger de nye udgaver i de fælles rum
window.addEventListener("click", function (e) {
  if (!iFaellesRum() || !e.target.closest) return;
  const k = e.target.closest("#knap-drej, #knap-saml, #knap-ryd, #mi-flyt");
  if (!k) return;
  if (k.id === "mi-flyt") {
    if (rumValg !== "hal") return;            // i event-rummene virker Flyt som altid
    e.stopImmediatePropagation();
    if (!valgtMoebel || !kanBygge()) return;
    flytter = flytter ? null : valgtMoebel;
    opdaterPanel();
    return;
  }
  e.stopImmediatePropagation();
  e.preventDefault();
  if (k.id === "knap-drej") drejValgt();
  if (k.id === "knap-saml") samlOpValgt();
}, true);

// Møbel-boksen viser Flyt, Fjern og Drej for Bygmestre i de fælles rum
const visMoebelInfoFoerByg = visMoebelInfo;
visMoebelInfo = function () {
  visMoebelInfoFoerByg();
  if (!valgtMoebel || !iFaellesRum()) return;
  const bygger = kanBygge();
  document.getElementById("mi-knapper").hidden = !bygger;
  document.getElementById("mi-tag").textContent = bygger ? "🗑 Fjern" : "📦 Tag op";
  if (!flytter) document.getElementById("mi-om").textContent = bygger ? "🔨 Du kan bygge her" : "Hotellets møbel";
};


// -------------------------------------------------------------
//  Kataloget kommer og går med det samme
// -------------------------------------------------------------
const moebelSektion = document.getElementById("moebel-sektion");
const bygNote = document.createElement("p");
bygNote.className = "lille byg-note";
bygNote.textContent = "🔨 Bygmester: hele kataloget er gratis her, og alle kan se det, du bygger.";
bygNote.hidden = true;
moebelSektion.querySelector("h2").after(bygNote);

let varFaelles = null, kunneBygge = null;
function tjekByggeri() {
  const faelles = iFaellesRum(), bygger = kanBygge();
  if (faelles) {
    moebelSektion.hidden = !bygger;
    if (!bygger) {
      if (valgtType) { valgtType = null; opdaterPanel(); besked.textContent = "Du kan kun stille møbler i dine egne rum."; }
      if (typeof flytter !== "undefined" && flytter) { flytter = null; opdaterPanel(); }
    }
  }
  if (faelles !== varFaelles || bygger !== kunneBygge) {
    if (kunneBygge && !bygger && faelles) besked.textContent = "Du er ikke længere Bygmester.";
    if (!faelles && varFaelles) moebelSektion.hidden = rumValg === "hal";
    varFaelles = faelles;
    kunneBygge = bygger;
    bygNote.hidden = !(faelles && bygger);
    document.getElementById("knap-ryd").hidden = faelles;
    document.getElementById("knap-til-hal").hidden = rumValg === "hal";
    if (valgtMoebel) visMoebelInfo();
  }
}
tjekByggeri();
setInterval(tjekByggeri, 300);

// I de fælles rum kommer møbler ikke i Mine ting
const tilLagerFoerByg = tilLager;
tilLager = function (type) {
  if (iFaellesRum()) return;
  tilLagerFoerByg(type);
};


// -------------------------------------------------------------
//  Tomt katalog: sig det i Shoppen og i møbelpanelet
// -------------------------------------------------------------
function tomtKatalogTekst(hvor) {
  const p = document.createElement("p");
  p.className = "butik-tom";
  p.innerHTML = "🛋️ Ingen møbler endnu<br><small>Nye møbler kommer snart …</small>";
  hvor.appendChild(p);
}
if (!MOEBLER.length) tomtKatalogTekst(document.getElementById("moebel-knapper"));
const visShopFoerTom = visShop;
visShop = function () {
  visShopFoerTom();
  const gitter = document.getElementById("shop-gitter");
  if (!shopVindue.hidden && shopFane === "moebler" && !MOEBLER.length && gitter && !gitter.children.length) tomtKatalogTekst(gitter);
};
