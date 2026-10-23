// =============================================================
//  Private beskeder 💬 — skriv til dine venner
//  Åbnes med 💬-knappen ud for en ven i vennelisten.
//  Ulæste beskeder vises som et lille tal på 👫-knappen.
//  (Beskeder mellem rigtige spillere kræver en server.)
// =============================================================
const BESKED_NOEGLE = "mit-hotel-beskeder";
const beskedVindue = document.getElementById("besked-vindue");
const beskedListe = document.getElementById("besked-liste");
const beskedSkriver = document.getElementById("besked-skriver");
const beskedTekst = document.getElementById("besked-tekst");

// { "Ida": { linjer: [{ fra, tekst, tid }], ulaest: 0 } }
let beskeder = {};
try { beskeder = JSON.parse(localStorage.getItem(BESKED_NOEGLE) || "{}"); } catch (e) {}
function gemBeskeder() {
  try { localStorage.setItem(BESKED_NOEGLE, JSON.stringify(beskeder)); } catch (e) {}
}

let beskedMed = null;     // hvem man skriver med lige nu

function samtale(navn) {
  if (!beskeder[navn]) beskeder[navn] = { linjer: [], ulaest: 0 };
  return beskeder[navn];
}

function ulaestFra(navn) {
  return beskeder[navn] ? beskeder[navn].ulaest : 0;
}

function visUlaest() {
  let alle = 0;
  venner.forEach(function (v) { alle += ulaestFra(v); });
  const tal = document.getElementById("venner-ulaest");
  tal.textContent = alle > 9 ? "9+" : alle;
  tal.hidden = alle === 0;
}

function klokken(tid) {
  return new Date(tid).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
}

function tilfoejBesked(navn, fra, tekst) {
  const s = samtale(navn);
  s.linjer.push({ fra: fra, tekst: tekst, tid: Date.now() });
  if (s.linjer.length > 100) s.linjer.shift();
  if (fra !== FIGUR.navn && !(beskedMed === navn && !beskedVindue.hidden)) s.ulaest++;
  gemBeskeder();
  visUlaest();
  visBeskeder();
  visVenner();
}


// -------------------------------------------------------------
//  Vinduet
// -------------------------------------------------------------
function visBeskeder() {
  if (beskedVindue.hidden || !beskedMed) return;
  const s = samtale(beskedMed);
  if (!s.linjer.length) {
    beskedListe.innerHTML = "<li class='besked-tom'>Skriv den første besked til " + tegnTilHtml(beskedMed) + " ✉️</li>";
    return;
  }
  beskedListe.innerHTML = s.linjer.map(function (l) {
    const mig = l.fra === FIGUR.navn;
    return "<li class='" + (mig ? "mig" : "dem") + "'><span>" + tegnTilHtml(l.tekst) + "</span><small>" +
      (mig ? "" : tegnTilHtml(l.fra) + " · ") + klokken(l.tid) + "</small></li>";
  }).join("");
  beskedListe.scrollTop = beskedListe.scrollHeight;
}

function aabnBeskeder(navn) {
  beskedMed = navn;
  samtale(navn).ulaest = 0;
  gemBeskeder();
  document.getElementById("besked-hvem").textContent = "💬 " + navn + (venOnline(navn) ? "" : " (offline)");
  beskedSkriver.hidden = true;
  beskedVindue.hidden = false;
  visBeskeder();
  visUlaest();
  visVenner();
  beskedTekst.focus();
}

document.getElementById("besked-luk").addEventListener("click", function () { beskedVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") beskedVindue.hidden = true; });

// Vennen "skriver …" lidt, før svaret kommer
function venSvarer(navn, tekst) {
  setTimeout(function () {
    if (beskedMed === navn) {
      beskedSkriver.textContent = navn + " skriver …";
      beskedSkriver.hidden = false;
    }
    setTimeout(function () {
      if (beskedMed === navn) beskedSkriver.hidden = true;
      if (erVen(navn)) tilfoejBesked(navn, navn, tekst);
    }, 1000 + tekst.length * 50);
  }, 500 + Math.random() * 900);
}

document.getElementById("besked-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const tekst = rensTekst(lavSmileyer(beskedTekst.value)).trim();
  beskedTekst.value = "";
  if (!tekst || !beskedMed) return;
  tilfoejBesked(beskedMed, FIGUR.navn, tekst);
  // computer-gæsterne svarer, hvis de er online
  if (venOnline(beskedMed)) {
    const regel = SVAR.find(function (s) { return s.naar.test(tekst); });
    venSvarer(beskedMed, tilfaeldig(regel.svar).replace("{mig}", FIGUR.navn));
  }
});

// En ny ven sender en lille besked, når I er blevet venner
const tilfoejVenBesked = tilfoejVen;
tilfoejVen = function (g) {
  const ny = !erVen(g.navn);
  tilfoejVenBesked(g);
  if (ny) {
    setTimeout(function () {
      if (erVen(g.navn)) tilfoejBesked(g.navn, g.navn, "Tak fordi du tilføjede mig, " + FIGUR.navn + "! Skriv bare herinde 💌");
    }, 6000);
  }
};

visUlaest();
