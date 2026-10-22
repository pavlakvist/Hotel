// =============================================================
//  SKIFT UDSEENDE — vælg figur, tøj og farver.
//  Når du vælger en ting fra dine tøj-ark, får figuren tingens farve
//  (håret, vesten, skjorten, bukserne/nederdelen, strømperne og skoene).
//  Du kan også vælge en farve direkte i paletten.
//  Ændringerne kommer først på figuren i rummet, når du trykker "Gem ændringer".
// =============================================================

const GEMTE_NOEGLE = "mit-hotel-gemte-udseender";
const MAKS_GEMTE = 10;

// Fanerne øverst i vinduet. "omraader" er de dele af figuren, man kan farve,
// og "slots" er hvilke ting fra tøj-arkene der vises for den del.
const SU_FANER = [
  { id: "krop", navn: "Krop", omraader: [{ omr: "hud", navn: "Hudfarve", slots: [] }] },
  { id: "haar", navn: "Hår", ikon: "frisure", omraader: [{ omr: "haar", navn: "Hår", slots: ["frisure"] }] },
  { id: "overdel", navn: "Overdel", ikon: "top", omraader: [
    { omr: "vest", navn: "Vest", slots: ["jakke", "top", "kjole"] },
    { omr: "skjorte", navn: "Skjorte", slots: ["top"] },
  ] },
  { id: "underdel", navn: "Underdel", ikon: "underdel", omraader: [
    { omr: "underdel", navn: "Nederdel", drengNavn: "Bukser", slots: ["underdel", "kjole"] },
    { omr: "stroemper", navn: "Strømper", kunPige: true, slots: ["stroemper"] },
    { omr: "sko", navn: "Sko", slots: ["sko"] },
  ] },
  { id: "gemte", navn: "Gemte" },
];

// Farverne i paletten
const PALET = [
  "#fbe3cf", "#f2cfae", "#e8b98f", "#d9a274", "#c68a5a", "#a96d42", "#8a5232", "#6b3c22", "#4e2a17", "#33190c", "#f4ede1", "#d8cfc2", "#9a948c", "#2b2827",
  "#f6d26b", "#e8b13c", "#d98f2b", "#c46a1e", "#a8471a", "#8c2f17", "#c0392b", "#9b1d2a", "#6e1423", "#e8a0a8", "#d96a84", "#b83d6a", "#8a2b5a", "#5a1c3e",
  "#f4e3a1", "#d9d27a", "#a9b85a", "#6f9a4a", "#3f7a3c", "#2a5a34", "#1f4030", "#9ed3c6", "#4ea8a0", "#2a7a80", "#1d5566", "#a8c8e8", "#5f8fcf", "#2f5fa8",
  "#1e3a78", "#151f45", "#c8b4e0", "#9a78c8", "#6a4a9a", "#46306e", "#ffffff", "#e6e6e6", "#b3b3b3", "#7a7a7a", "#4a4a4a", "#1a1a1a", "#f0c8a0", "#7a4a2a",
];

const DREJ = ["ned", "ned-venstre", "venstre", "op-venstre", "op", "op-hoejre", "hoejre", "ned-hoejre"];

let kladde = null;          // det man er ved at lave, før man gemmer
let fortrydListe = [];
let suFane = "haar";
let suOmr = "haar";
let suDrej = 0;

if (!garderobe.ting) garderobe.ting = { kvinde: {}, mand: {} };

function kopi(x) {
  return JSON.parse(JSON.stringify(x));
}

// pige eller dreng (tøj-mapperne), efter hvilken figur der er valgt
function hvem(type) {
  return (type || (kladde ? kladde.type : garderobe.type)) === "mand" ? "dreng" : "pige";
}

function toejSti(fil, type) {
  return "billeder/toej/" + hvem(type) + "/" + fil;
}

// ----- Profilbilledet ved navnet i rummet (den valgte frisure) -----
const profilBilleder = {};
function profilBillede() {
  const fil = (garderobe.ting[garderobe.type] || {}).haar;
  if (!fil) return null;
  const sti = toejSti(fil, garderobe.type);
  if (!profilBilleder[sti]) {
    profilBilleder[sti] = new Image();
    profilBilleder[sti].src = sti;
  }
  return profilBilleder[sti];
}

// ----- Gemte udseender -----
let gemte = [];
try {
  const g = JSON.parse(localStorage.getItem(GEMTE_NOEGLE));
  if (Array.isArray(g)) gemte = g;
} catch (fejl) {
  // intet gemt endnu
}
function gemGemte() {
  try {
    localStorage.setItem(GEMTE_NOEGLE, JSON.stringify(gemte));
  } catch (fejl) {
    // kan ikke gemme
  }
}


// =============================================================
//  Vinduet
// =============================================================
const vindue = document.getElementById("garderobe-vindue");
const suFigur = document.getElementById("su-figur");

function aabnGarderobe() {
  kladde = { type: garderobe.type, farver: kopi(garderobe.farver), ting: kopi(garderobe.ting) };
  fortrydListe = [];
  suDrej = 0;
  vindue.hidden = false;
  tegnSkift();
}

function lukGarderobe() {
  vindue.hidden = true;
  kladde = null;
}

function gemAendringer() {
  garderobe.type = kladde.type;
  garderobe.farver = kopi(kladde.farver);
  garderobe.ting = kopi(kladde.ting);
  gemGarderobe();
  tegnForhaandsvisning();
  lukGarderobe();
}

// Husk hvordan det så ud, så man kan fortryde
function foerAendring() {
  fortrydListe.push(kopi(kladde));
  if (fortrydListe.length > 50) fortrydListe.shift();
}

function mineFarver() {
  return kladde.farver[kladde.type];
}

function mineTing() {
  return kladde.ting[kladde.type];
}

function faneMedId(id) {
  return SU_FANER.find(function (f) { return f.id === id; });
}

// De dele af figuren, der kan farves under en fane (strømper kun for pigen)
function omraaderI(fane) {
  return (fane.omraader || []).filter(function (o) { return !(o.kunPige && kladde.type === "mand"); });
}

function tegnSkift() {
  const fane = faneMedId(suFane);
  const omr = omraaderI(fane);
  if (omr.length && !omr.some(function (o) { return o.omr === suOmr; })) suOmr = omr[0].omr;
  tegnSuFaner();
  tegnSuUnder();
  tegnSuTing();
  tegnSuPalet();
  tegnSuFigur();
}

function tegnSuFaner() {
  const boks = document.getElementById("su-faner");
  boks.innerHTML = "";
  SU_FANER.forEach(function (fane) {
    const knap = document.createElement("button");
    knap.classList.toggle("aktiv", fane.id === suFane);
    const liste = fane.ikon && TOEJ[hvem()][fane.ikon];
    if (liste && liste.length) {
      const b = document.createElement("img");
      b.src = toejSti(liste[0]);
      b.alt = "";
      knap.appendChild(b);
    }
    const t = document.createElement("span");
    t.textContent = fane.navn;
    knap.appendChild(t);
    knap.addEventListener("click", function () {
      suFane = fane.id;
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}

// Lille række under fanerne: vælg hvilken del af figuren man farver
function tegnSuUnder() {
  const boks = document.getElementById("su-under");
  boks.innerHTML = "";
  const fane = faneMedId(suFane);
  if (fane.id === "krop") {
    lavFigurValg(boks);
    return;
  }
  if (fane.id === "gemte") {
    const knap = document.createElement("button");
    knap.className = "su-chip aktiv";
    knap.textContent = "Gem det, du har på nu";
    knap.addEventListener("click", function () {
      gemte.unshift(kopi({ type: kladde.type, farver: kladde.farver, ting: kladde.ting }));
      gemte = gemte.slice(0, MAKS_GEMTE);
      gemGemte();
      tegnSkift();
    });
    boks.appendChild(knap);
    return;
  }
  omraaderI(fane).forEach(function (o) {
    const knap = document.createElement("button");
    knap.className = "su-chip";
    knap.classList.toggle("aktiv", o.omr === suOmr);
    knap.textContent = kladde.type === "mand" && o.drengNavn ? o.drengNavn : o.navn;
    knap.addEventListener("click", function () {
      suOmr = o.omr;
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}

// Krop-fanen: vælg kvinde eller mand
function lavFigurValg(boks) {
  const figurer = alleFigurer();
  for (const id in figurer) {
    const knap = document.createElement("button");
    knap.className = "su-chip";
    knap.classList.toggle("aktiv", kladde.type === id);
    knap.textContent = figurer[id];
    knap.addEventListener("click", function () {
      if (kladde.type === id) return;
      foerAendring();
      kladde.type = id;
      tegnSkift();
    });
    boks.appendChild(knap);
  }
}

function tegnSuTing() {
  const boks = document.getElementById("su-ting");
  boks.innerHTML = "";
  const fane = faneMedId(suFane);

  if (fane.id === "gemte") {
    if (gemte.length === 0) {
      const t = document.createElement("p");
      t.className = "su-tom";
      t.textContent = "Du har ikke gemt noget endnu. Tryk på knappen ovenover for at gemme dit udseende.";
      boks.appendChild(t);
    }
    gemte.forEach(function (g, nr) {
      const knap = document.createElement("button");
      knap.className = "su-ting-knap su-gemt";
      const c = document.createElement("canvas");
      c.width = 72; c.height = 84;
      tegnLilleFigur(c, g);
      knap.appendChild(c);
      const slet = document.createElement("span");
      slet.className = "su-slet";
      slet.textContent = "✕";
      slet.title = "Slet";
      slet.addEventListener("click", function (e) {
        e.stopPropagation();
        gemte.splice(nr, 1);
        gemGemte();
        tegnSkift();
      });
      knap.appendChild(slet);
      knap.addEventListener("click", function () {
        foerAendring();
        kladde.type = g.type;
        kladde.farver = kopi(g.farver);
        kladde.ting = kopi(g.ting);
        tegnSkift();
      });
      boks.appendChild(knap);
    });
    return;
  }

  const o = omraaderI(fane).find(function (x) { return x.omr === suOmr; });
  if (!o || o.slots.length === 0) {
    if (fane.id === "krop") {
      const t = document.createElement("p");
      t.className = "su-tom";
      t.textContent = "Vælg figur ovenover og hudfarve nedenunder.";
      boks.appendChild(t);
    }
    return;
  }
  const alle = TOEJ[hvem()];
  o.slots.forEach(function (slot) {
    (alle[slot] || []).forEach(function (fil) {
      const knap = document.createElement("button");
      knap.className = "su-ting-knap";
      knap.classList.toggle("aktiv", mineTing()[suOmr] === fil);
      const b = document.createElement("img");
      b.src = toejSti(fil);
      b.alt = "";
      b.loading = "lazy";
      knap.appendChild(b);
      knap.addEventListener("click", function () {
        foerAendring();
        mineTing()[suOmr] = fil;
        const farve = TOEJ_FARVER[hvem() + "/" + fil];
        if (farve) mineFarver()[suOmr] = farve;
        tegnSkift();
      });
      boks.appendChild(knap);
    });
  });
}

function tegnSuPalet() {
  const boks = document.getElementById("su-palet");
  boks.innerHTML = "";
  if (suFane === "gemte") return;
  const nu = (mineFarver()[suOmr] || "").toLowerCase();
  PALET.forEach(function (farve) {
    const knap = document.createElement("button");
    knap.className = "su-farve";
    knap.style.background = farve;
    knap.title = farve;
    knap.classList.toggle("aktiv", nu === farve);
    knap.addEventListener("click", function () {
      foerAendring();
      mineFarver()[suOmr] = farve;
      delete mineTing()[suOmr];
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}

// ----- Figuren på scenen til højre -----
function tegnSuFigur() {
  if (!kladde) return;
  const dpr = window.devicePixelRatio || 1;
  const B = 220, H = 300;
  if (suFigur.width !== Math.round(B * dpr)) {
    suFigur.width = Math.round(B * dpr);
    suFigur.height = Math.round(H * dpr);
  }
  const c = suFigur.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, B, H);
  c.imageSmoothingQuality = "high";
  // skygge
  c.beginPath();
  c.ellipse(B / 2, 262, 46, 12, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(60, 30, 10, 0.25)";
  c.fill();
  const skala = 1.75;
  c.save();
  c.translate(B / 2, 262);
  c.scale(skala, skala);
  tegnMenneske(c, 0, 0, kladde, DREJ[suDrej], null, null);
  c.restore();
}

function tegnLilleFigur(c, udseende) {
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  g.save();
  g.translate(c.width / 2, c.height - 4);
  g.scale(0.62, 0.62);
  tegnMenneske(g, 0, 0, udseende, "ned", null, null);
  g.restore();
}

// Et tilfældigt udseende: tilfældige ting fra dine tøj-ark
function tilfaeldigtUdseende() {
  foerAendring();
  const alle = TOEJ[hvem()];
  const farver = {}, ting = {};
  SU_FANER.forEach(function (fane) {
    omraaderI(fane).forEach(function (o) {
      const liste = [];
      o.slots.forEach(function (slot) { (alle[slot] || []).forEach(function (f) { liste.push(f); }); });
      if (liste.length === 0) return;
      const fil = liste[Math.floor(Math.random() * liste.length)];
      ting[o.omr] = fil;
      if (TOEJ_FARVER[hvem() + "/" + fil]) farver[o.omr] = TOEJ_FARVER[hvem() + "/" + fil];
    });
  });
  if (mineFarver().hud) farver.hud = mineFarver().hud;   // hudfarven bliver, som den er
  kladde.farver[kladde.type] = farver;
  kladde.ting[kladde.type] = ting;
  tegnSkift();
}

// Når figur-billederne er hentet, tegnes scenen igen
const gamleForhaandsvisning = tegnForhaandsvisning;
tegnForhaandsvisning = function () {
  gamleForhaandsvisning();
  if (kladde) tegnSuFigur();
};

document.getElementById("knap-garderobe").addEventListener("click", aabnGarderobe);
document.getElementById("gv-luk").addEventListener("click", lukGarderobe);
document.getElementById("gv-tilfaeldig").addEventListener("click", tilfaeldigtUdseende);
document.getElementById("su-gem").addEventListener("click", gemAendringer);
document.getElementById("su-fortryd").addEventListener("click", function () {
  if (fortrydListe.length) {
    kladde = fortrydListe.pop();
    tegnSkift();
  }
});
document.getElementById("su-fjern").addEventListener("click", function () {
  if (suFane === "gemte") return;
  foerAendring();
  delete mineFarver()[suOmr];
  delete mineTing()[suOmr];
  tegnSkift();
});
document.getElementById("su-drej-venstre").addEventListener("click", function () {
  suDrej = (suDrej + DREJ.length - 1) % DREJ.length;
  tegnSuFigur();
});
document.getElementById("su-drej-hoejre").addEventListener("click", function () {
  suDrej = (suDrej + 1) % DREJ.length;
  tegnSuFigur();
});
vindue.addEventListener("click", function (e) {
  if (e.target === vindue) lukGarderobe();   // klik udenfor lukker
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !vindue.hidden) lukGarderobe();
});
