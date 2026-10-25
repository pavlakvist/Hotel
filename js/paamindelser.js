// =============================================================
//  🎂 Påmindelser — fødselsdage de næste 10 dage
//  En fane i venstre hjørne, kun for ejeren og Eventværter.
//  Den dukker op med det samme, når nogen får Eventvært-jobbet, og forsvinder ved fyring.
//  Boksen kan lukkes med ✕ og kommer først igen, når der er en ny fødselsdag på listen
//  (eller man trykker på fanen).
//  Bruger fødselsdagene fra js/foedselsdage.js (database-10-foedselsdage.sql).
// =============================================================
const PAAMIND_DAGE = 10;
const PAAMIND_NOEGLE = "mit-hotel-paamind-lukket";

const paamindFane = document.createElement("button");
paamindFane.type = "button";
paamindFane.id = "paamind-fane";
paamindFane.hidden = true;
document.body.appendChild(paamindFane);

const paamindBoks = document.createElement("div");
paamindBoks.id = "paamind-boks";
paamindBoks.hidden = true;
document.body.appendChild(paamindBoks);

function snareFoedselsdage() {
  return (foedselsdage || []).map(function (f) { return { navn: f.navn, dato: f.dato, dage: dageTil(f.dato) }; })
    .filter(function (f) { return f.dage <= PAAMIND_DAGE; })
    .sort(function (a, b) { return a.dage - b.dage || a.navn.localeCompare(b.navn); });
}
// Listen som tekst, så vi kan se, om der er kommet noget nyt siden man lukkede
function paamindNoegle(liste) {
  return FIGUR.navn + "|" + liste.map(function (f) { return f.navn + ":" + f.dato; }).join(",");
}
function lukketNoegle() { try { return localStorage.getItem(PAAMIND_NOEGLE) || ""; } catch (e) { return ""; } }

let paamindSidst = "";
let paamindAaben = false;

function visPaamind() {
  const maa = maaSeKalender();
  const liste = maa ? snareFoedselsdage() : [];
  paamindFane.hidden = !maa;
  if (!maa) { paamindBoks.hidden = true; paamindSidst = ""; return; }
  const iDag = liste.filter(function (f) { return f.dage === 0; }).length;
  paamindFane.innerHTML = "🎂 Påmindelser" + (liste.length ? " <span class='" + (iDag ? "idag" : "") + "'>" + liste.length + "</span>" : "");
  paamindFane.classList.toggle("har-idag", iDag > 0);

  const noegle = paamindNoegle(liste);
  // åbner af sig selv, når der er fødselsdage, man ikke har lukket for
  if (noegle !== paamindSidst) {
    paamindSidst = noegle;
    if (liste.length && lukketNoegle() !== noegle) paamindAaben = true;
  }
  paamindBoks.hidden = !paamindAaben;
  if (!paamindAaben) return;
  const html = "<div class='pm-top'><b>🎂 Fødselsdage de næste " + PAAMIND_DAGE + " dage</b>" +
    "<button type='button' class='pm-luk' title='Luk'>✕</button></div>" +
    (foedselsdage === null ? "<p class='pm-tom'>Henter fødselsdage …</p>" :
      liste.length ? "<ul>" + liste.map(function (f) {
        return "<li class='" + (f.dage === 0 ? "idag" : "") + "'><span class='pm-navn'>" + (f.dage === 0 ? "🎉 " : "🎂 ") + rens(f.navn) + "</span>" +
          "<small>" + datoTekst(f.dato) + " · " + (f.dage === 0 ? "I DAG!" : f.dage === 1 ? "i morgen" : "om " + f.dage + " dage") + "</small>" +
          "<button type='button' data-pm-banner='" + rens(f.navn) + "' title='Lav et fødselsdagsbanner'>📢 Banner</button></li>";
      }).join("") + "</ul>" : "<p class='pm-tom'>Ingen fødselsdage de næste " + PAAMIND_DAGE + " dage.</p>");
  if (paamindBoks.dataset.html !== html) {
    paamindBoks.dataset.html = html;
    paamindBoks.innerHTML = html;
    paamindBoks.querySelector(".pm-luk").addEventListener("click", function () {
      paamindAaben = false;
      try { localStorage.setItem(PAAMIND_NOEGLE, paamindSidst); } catch (e) {}
      visPaamind();
    });
    paamindBoks.querySelectorAll("[data-pm-banner]").forEach(function (k) {
      k.addEventListener("click", function () {
        ejerVindue.hidden = false;
        ejerFane = "events";
        visFane();
        lavFoedselsdagsBanner(k.dataset.pmBanner);
      });
    });
  }
}

paamindFane.addEventListener("click", function () {
  paamindAaben = !paamindAaben;
  if (!paamindAaben) { try { localStorage.setItem(PAAMIND_NOEGLE, paamindSidst); } catch (e) {} }
  if (paamindAaben && foedselsdage === null) hentFoedselsdage();
  visPaamind();
});

// Tjek ofte (så fanen kommer med det samme ved et nyt job), og hent fødselsdagene af og til
let paamindVarMaa = false;
setInterval(function () {
  const maa = maaSeKalender();
  if (maa && !paamindVarMaa) hentFoedselsdage();
  paamindVarMaa = maa;
  visPaamind();
}, 500);
setInterval(function () { if (maaSeKalender()) hentFoedselsdage(); }, 5000);       // nye fødselsdage kommer frem med det samme


// -------------------------------------------------------------
//  Udseendet (grøn/creme), lige under 🚨 Tilkald hjælp
// -------------------------------------------------------------
const paamindStil = document.createElement("style");
paamindStil.textContent =
  "#paamind-fane { position: fixed; top: 130px; left: 12px; z-index: 5; padding: 6px 12px; border: 2px solid #4e7d4a; border-radius: 12px;" +
  " background: #fbf6ea; color: #2f4a2b; font: bold 13px Verdana, sans-serif; cursor: pointer; box-shadow: 0 3px 0 #3a5e37; }" +
  "#paamind-fane:hover { transform: translateY(-1px); }" +
  "#paamind-fane[hidden], #paamind-boks[hidden] { display: none; }" +
  "#paamind-fane span { display: inline-block; min-width: 18px; margin-left: 4px; padding: 0 5px; border-radius: 9px; background: #4e7d4a; color: #fff; font-size: 11px; text-align: center; }" +
  "#paamind-fane span.idag { background: #d9534f; }" +
  "#paamind-fane.har-idag { animation: paamind-puls 1.6s ease-in-out infinite; }" +
  "@keyframes paamind-puls { 50% { box-shadow: 0 3px 0 #3a5e37, 0 0 12px rgba(240, 170, 60, 0.9); } }" +
  "#paamind-boks { position: fixed; top: 168px; left: 12px; z-index: 6; width: 290px; max-height: 50vh; overflow-y: auto; background: #fbf6ea;" +
  " border: 2px solid #4e7d4a; border-radius: 10px; box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; }" +
  "#paamind-boks .pm-top { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 7px 8px 7px 10px; background: #4e7d4a; color: #fbf6ea; }" +
  "#paamind-boks .pm-luk { background: none; border: 0; color: #fbf6ea; font-size: 15px; cursor: pointer; padding: 0 2px; }" +
  "#paamind-boks ul { list-style: none; margin: 0; padding: 6px; }" +
  "#paamind-boks li { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 6px; margin: 0 0 5px; padding: 6px 8px; background: #fff; border: 1px solid #d6e8c8; border-radius: 8px; }" +
  "#paamind-boks li.idag { background: #fff3cf; border-color: #e3c86a; }" +
  "#paamind-boks .pm-navn { font-weight: bold; }" +
  "#paamind-boks li small { grid-column: 1; color: #7a8a76; font-size: 11px; }" +
  "#paamind-boks li.idag small { color: #a0521a; font-weight: bold; }" +
  "#paamind-boks li button { grid-column: 2; grid-row: 1 / 3; padding: 5px 8px; border: 1px solid #9ccc8f; border-radius: 6px; background: #e8f2dc; color: #2f4a2b; font: bold 11px Verdana, sans-serif; cursor: pointer; }" +
  "#paamind-boks .pm-tom { margin: 10px; color: #7a8a76; }";
document.head.appendChild(paamindStil);
