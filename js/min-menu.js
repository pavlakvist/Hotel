// =============================================================
//  Klik på dig selv: en lille menu ligesom i Habbo
//  Min profil · Handlinger · Rapportere · Skift outfit
// =============================================================
const minMenu = document.getElementById("min-menu");
const minMenuKnapper = document.getElementById("min-menu-knapper");
let menuHvem = figur;     // hvem menuen står over (dig eller en anden gæst, se js/gaest-menu.js)
const profilVindue = document.getElementById("profil-vindue");
const rapportVindue = document.getElementById("rapport-vindue");

const MOTTO_NOEGLE = "mit-hotel-motto";
const MEDLEM_NOEGLE = "mit-hotel-medlem-siden";
const RAPPORT_NOEGLE = "mit-hotel-rapporter";

// Hvornår blev du medlem? Første gang du åbner hotellet.
let medlemSiden = null;
try {
  medlemSiden = localStorage.getItem(MEDLEM_NOEGLE);
  if (!medlemSiden) {
    medlemSiden = new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
    localStorage.setItem(MEDLEM_NOEGLE, medlemSiden);
  }
} catch (e) { medlemSiden = "i dag"; }

// Små tegn, der svæver op over hovedet (fx 👋 når man vinker)
const svaevere = [];

function svaev(tegn, hvem) {
  const hoved = hovedPaa(hvem || figur);
  svaevere.push({ tegn: tegn, x: hoved.x + (Math.random() - 0.5) * 30, y: hoved.y + 20, alder: 0 });
}


// -------------------------------------------------------------
//  Klikkede man på sig selv?
// -------------------------------------------------------------
function musPaaMig(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width);
  const sy = (e.clientY - r.top) * (HOEJDE / r.height);
  const p = punkt(figur.x + 0.5, figur.y + 0.5);
  p.x += figurPlads();
  return Math.abs(sx - p.x) < 18 && sy < p.y + 4 && sy > p.y - figurHoejde(garderobe) - 4;
}

// Den kører før klikket, der får figuren til at gå
laerred.addEventListener("click", function (e) {
  if (musPaaMig(e)) {
    e.stopImmediatePropagation();
    if (minMenu.hidden) aabnMinMenu(); else lukMinMenu();
  } else {
    lukMinMenu();
  }
}, true);


// -------------------------------------------------------------
//  Selve menuen
// -------------------------------------------------------------
function knap(tekst, naar) {
  const k = document.createElement("button");
  k.type = "button";
  k.innerHTML = tekst;
  k.addEventListener("click", function (e) { e.stopPropagation(); naar(); });
  minMenuKnapper.appendChild(k);
}

function visHovedmenu() {
  minMenuKnapper.innerHTML = "";
  knap("Min profil", function () { lukMinMenu(); aabnProfil(); });
  knap("Handlinger", visHandlinger);
  knap("Rapportere", function () { lukMinMenu(); aabnRapport(); });
  knap("Skift outfit", function () { lukMinMenu(); aabnGarderobe(); });
}

function visHandlinger() {
  minMenuKnapper.innerHTML = "";
  knap("👋 Vink", function () {
    lukMinMenu();
    figurDanser = false;
    for (let i = 0; i < 3; i++) setTimeout(function () { svaev("👋"); }, i * 350);
    if (typeof visUdtryk === "function") visUdtryk("vink", 2.5);
  });
  knap(figurDanser ? "🛑 Stop dansen" : "💃 Dans", function () {
    lukMinMenu();
    figurDanser = !figurDanser;
    danseTid = 0;
  });
  knap("❤️ Send et hjerte", function () {
    lukMinMenu();
    for (let i = 0; i < 4; i++) setTimeout(function () { svaev("❤️"); }, i * 250);
  });
  if (typeof harUdtryk === "function" && harUdtryk()) knap("🙂 Ansigt", visAnsigter);
  if (figur.sidde) {
    knap("🧍 Rejs dig op", function () {
      lukMinMenu();
      // gå et skridt væk fra møblet, så rejser figuren sig
      const f = figurFelt();
      const naboer = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
      for (const [dx, dy] of naboer) {
        gaaTil(f.x + dx, f.y + dy);
        if (figur.rute.length > 0) break;
      }
    });
  } else {
    knap("🪑 Sæt dig", function () { lukMinMenu(); findPlads(); });
  }
  knap("&larr; Tilbage", visHovedmenu);
}

// Gå hen til den nærmeste ledige stol eller sofa
function findPlads() {
  let bedst = null, bedstAfstand = Infinity;
  moeblerIRummet.forEach(function (m) {
    const t = MOEBEL_TYPER[m.type];
    if (!t || !t.saede || ledigPlads(m, figur) < 0) return;
    const a = Math.hypot(m.x - figur.x, m.y - figur.y);
    if (a < bedstAfstand) { bedst = m; bedstAfstand = a; }
  });
  if (!bedst) {
    besked.textContent = "Der er ingen ledige pladser i rummet.";
    return;
  }
  figurDanser = false;
  gaaTil(bedst.x, bedst.y, bedst);
}

function aabnMinMenu() {
  menuHvem = figur;
  visHovedmenu();
  minMenu.hidden = false;
  placerMinMenu();
}

function lukMinMenu() {
  minMenu.hidden = true;
}

// Menuen står lige over hovedet og følger med, hvis man trækker i skærmen
function placerMinMenu() {
  if (minMenu.hidden) return;
  const r = laerred.getBoundingClientRect();
  const hoved = hovedPaa(menuHvem);
  const x = r.left + hoved.x * ZOOM;
  const y = r.top + (hoved.y + 22) * ZOOM;
  minMenu.style.left = Math.max(80, Math.min(window.innerWidth - 80, x)) + "px";
  minMenu.style.top = Math.max(minMenu.offsetHeight + 10, y) + "px";
}


// -------------------------------------------------------------
//  Min profil
// -------------------------------------------------------------
const profilMotto = document.getElementById("profil-motto");
try { profilMotto.value = localStorage.getItem(MOTTO_NOEGLE) || ""; } catch (e) {}
profilMotto.addEventListener("input", function () {
  try { localStorage.setItem(MOTTO_NOEGLE, profilMotto.value); } catch (e) {}
});

function aabnProfil() {
  document.getElementById("profil-navn").textContent = FIGUR.navn;
  document.getElementById("profil-medlem").textContent = medlemSiden;
  document.getElementById("profil-rum").textContent = rumValg === "hal" ? "Velkomsthallen" : "Mit værelse";
  const antal = (rumValg === "vaerelse" ? moeblerIRummet : mitVaerelse).length;
  document.getElementById("profil-moebler").textContent = antal + (antal === 1 ? " møbel" : " møbler");
  profilVindue.hidden = false;

  // tegn dig selv i profilen
  const lille = document.getElementById("profil-figur");
  const c = lille.getContext("2d");
  c.clearRect(0, 0, lille.width, lille.height);
  const skala = Math.min(1.6, (lille.height - 16) / figurHoejde(garderobe));
  c.save();
  c.translate(lille.width / 2, lille.height - 8);
  c.scale(skala, skala);
  c.beginPath();
  c.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fill();
  tegnMenneske(c, 0, 0, garderobe, "ned", null, null);
  c.restore();
}

document.getElementById("profil-luk").addEventListener("click", function () { profilVindue.hidden = true; });
document.getElementById("profil-outfit").addEventListener("click", function () {
  profilVindue.hidden = true;
  aabnGarderobe();
});


// -------------------------------------------------------------
//  Rapportere
// -------------------------------------------------------------
const rapportHvem = document.getElementById("rapport-hvem");
const rapportTekst = document.getElementById("rapport-tekst");
const rapportTak = document.getElementById("rapport-tak");

// Valgene under "Hvad vil du fortælle os om?" – tilføj gerne flere her
// (værdien er det, personalet ser i Ejerpanelet)
const RAPPORT_GRUNDE = [
  ["Mobning", "Nogen er grim eller mobber"],
  ["Grimme ord", "Grimme ord i chatten"],
  ["Spam", "Spam i chatten"],
  ["Snyd ved bytte", "Snyd ved bytte"],
  ["Tigger", "Tigger om Glimt/Stella"],
  ["Upassende navn/motto", "Upassende navn/motto"],
  ["Upassende rum", "Upassende rum"],
  ["Falsk ansat", "Lader som om de er ansat"],
  ["Personlige oplysninger", "Spørger om private ting"],
  ["Trusler", "Trusler, jeg er utryg"],
  ["Fejl", "Fejl i spillet"],
  ["Andet", "Andet"]
];

// Byg valgene i vinduet (i to kolonner, så vinduet ikke bliver for højt)
(function lavRapportGrunde() {
  const form = document.getElementById("rapport-form");
  const gamle = form.querySelectorAll("input[name='rapport-grund']");
  if (!gamle.length) return;
  const foerste = gamle[0].closest("label");
  const boks = document.createElement("div");
  boks.id = "rapport-grunde";
  boks.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-bottom:6px;font-size:0.92em";
  RAPPORT_GRUNDE.forEach(function (g, i) {
    const label = document.createElement("label");
    label.style.cssText = "display:flex;align-items:center;gap:5px;white-space:nowrap";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "rapport-grund";
    radio.value = g[0];
    if (i === 0) radio.checked = true;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(g[1]));
    boks.appendChild(label);
  });
  form.insertBefore(boks, foerste);
  gamle.forEach(function (r) { r.closest("label").remove(); });
})();

function aabnRapport() {
  rapportHvem.innerHTML = "<option value=''>Ingen bestemt</option>";
  if (rumValg === "hal") {
    HAL_GAESTER.forEach(function (g) {
      const o = document.createElement("option");
      o.textContent = g.navn;
      rapportHvem.appendChild(o);
    });
  }
  rapportTekst.value = "";
  const foersteGrund = document.querySelector("input[name='rapport-grund']");
  if (foersteGrund) foersteGrund.checked = true;
  rapportTak.hidden = true;
  document.getElementById("rapport-form").hidden = false;
  rapportVindue.hidden = false;
}

document.getElementById("rapport-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const valgt = document.querySelector("input[name='rapport-grund']:checked");
  const rapport = {
    tid: new Date().toISOString(),
    grund: valgt ? valgt.value : "Andet",
    hvem: rapportHvem.value,
    tekst: rapportTekst.value.trim()
  };
  // indtil hotellet får en server, bliver rapporten gemt på din egen computer
  try {
    const alle = JSON.parse(localStorage.getItem(RAPPORT_NOEGLE) || "[]");
    alle.push(rapport);
    localStorage.setItem(RAPPORT_NOEGLE, JSON.stringify(alle));
  } catch (err) {}
  document.getElementById("rapport-form").hidden = true;
  rapportTak.hidden = false;
});

document.getElementById("rapport-luk").addEventListener("click", function () { rapportVindue.hidden = true; });
document.getElementById("rapport-ok").addEventListener("click", function () { rapportVindue.hidden = true; });

// Esc lukker det hele
window.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  lukMinMenu();
  profilVindue.hidden = true;
  rapportVindue.hidden = true;
});


// -------------------------------------------------------------
//  Hver gang skærmen tegnes: dans, svævende tegn og menuen
// -------------------------------------------------------------
let menuSidsteTid = performance.now();
const tegnBoblerFoer = tegnBobler;
tegnBobler = function () {
  const nu = performance.now();
  const dt = Math.min(0.05, (nu - menuSidsteTid) / 1000);
  menuSidsteTid = nu;

  // dansen stopper, hvis man går eller sætter sig
  if (figurDanser && (figur.rute.length > 0 || figur.sidde)) figurDanser = false;
  if (figurDanser) {
    const foer = Math.floor(danseTid / 0.45);
    danseTid += dt;
    if (Math.floor(danseTid / 0.45) !== foer) {
      const r = ["ned-venstre", "ned", "ned-hoejre", "ned"];
      figur.retning = r[Math.floor(danseTid / 0.45) % r.length];
      figur.vendt = figur.retning === "ned-hoejre" ? 1 : -1;
      if (Math.random() < 0.5) svaev(Math.random() < 0.5 ? "🎵" : "🎶");
    }
  }

  tegnBoblerFoer();

  ctx.save();
  ctx.font = "18px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
  ctx.textAlign = "center";
  for (let i = svaevere.length - 1; i >= 0; i--) {
    const s = svaevere[i];
    s.alder += dt;
    if (s.alder > 1.6) { svaevere.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, (1.6 - s.alder) * 2);
    ctx.fillText(s.tegn, s.x + Math.sin(s.alder * 5) * 4, s.y - s.alder * 40);
  }
  ctx.restore();

  placerMinMenu();
};
