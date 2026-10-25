// =============================================================
//  🌙 Mørkt tema i panelet
//  Knappen 🌙 / ☀️ i toppen af Ejerpanelet (og MOD-, Eventvært- og staff-panelet)
//  skifter mellem det almindelige grøn/creme tema og et roligt mørkt tema.
//  Hver person vælger selv, og valget huskes på computeren.
//  Staff chatten har sit eget mørke tema og ser ens ud i begge.
// =============================================================
const PANEL_TEMA_NOEGLE = "mit-hotel-panel-tema";

function panelTemaNoegle() { return PANEL_TEMA_NOEGLE + "-" + String(FIGUR.navn || "").toLowerCase(); }
function panelErMoerkt() { try { return localStorage.getItem(panelTemaNoegle()) === "moerkt"; } catch (e) { return false; } }

// 🌙-knappen ved siden af ⤢ og ✕
const temaKnap = document.createElement("button");
temaKnap.type = "button";
temaKnap.className = "su-luk ejer-tema";
(document.querySelector("#ejer-vindue .ejer-stoer") || document.getElementById("ejer-luk")).before(temaKnap);

function visPanelTema() {
  const moerkt = panelErMoerkt();
  ejerVindue.classList.toggle("moerkt", moerkt);
  temaKnap.textContent = moerkt ? "☀️" : "🌙";
  temaKnap.title = moerkt ? "Skift til lyst tema" : "Skift til mørkt tema";
}
temaKnap.addEventListener("click", function () {
  try { localStorage.setItem(panelTemaNoegle(), panelErMoerkt() ? "lyst" : "moerkt"); } catch (e) {}
  visPanelTema();
});
visPanelTema();
// navnet kan skifte, når man logger ind (så kommer ens eget valg frem)
let panelTemaNavn = FIGUR.navn;
setInterval(function () { if (FIGUR.navn !== panelTemaNavn) { panelTemaNavn = FIGUR.navn; visPanelTema(); } }, 1000);


// -------------------------------------------------------------
//  Udseendet: samme rolige blågrå som Staff chatten
// -------------------------------------------------------------
const M = "#ejer-vindue.moerkt ";
const panelTemaStil = document.createElement("style");
panelTemaStil.textContent =
  M + ".ejer-boks { background: #262f3b; border-color: #3f5a6e; color: #d5dde8; }" +
  M + ".ejer-top { background: #2f3a48; border-bottom: 1px solid #3a4757; }" +
  M + ".ejer-top h2 { color: #e3eaf2; }" +
  M + ".ejer-top .su-luk { background: #3f5a6e; border-color: #5f8199; color: #eef3f8; }" +
  M + "#ejer-faner { background: #2b3542; border-right-color: #3a4757; }" +
  M + "#ejer-faner button { color: #c3cedb; }" +
  M + "#ejer-faner button:hover { background: #364353; }" +
  M + "#ejer-faner button.valgt { background: #3f5a6e; color: #f2f6fa; }" +
  M + "#ejer-faner::-webkit-scrollbar-thumb, " + M + "#ejer-indhold::-webkit-scrollbar-thumb { background: #46556a; }" +
  // Indholdet: alle farver vendes til mørke (billeder vendes tilbage, så de ser rigtige ud)
  M + "#ejer-indhold:not(.sc-nat) { filter: invert(1) hue-rotate(180deg) contrast(0.82); }" +
  M + "#ejer-indhold:not(.sc-nat) img, " + M + "#ejer-indhold:not(.sc-nat) canvas { filter: contrast(1.22) hue-rotate(180deg) invert(1); }" +
  M + "#ejer-indhold.sc-nat { background: #262f3b; }" +
  M + ".ejer-greb-hjoerne { filter: invert(0.8); }";
document.head.appendChild(panelTemaStil);
