// =============================================================
//  SKIFT UDSEENDE — vælg figur, frisure, tøj og farver.
//
//  Tøjet fra dine tøj-ark er tegnet forfra. Derfor vises det på figuren
//  her i vinduet, når den kigger frem. Inde i rummet får figuren tøjets
//  farver (på vesten, bukserne/nederdelen, strømperne og skoene).
//  Frisurerne fra dit lag-ark kommer på figuren i alle retninger.
//  Ændringerne kommer først på figuren i rummet, når du trykker "Gem ændringer".
// =============================================================

const GEMTE_NOEGLE = "mit-hotel-gemte-udseender";
const MAKS_GEMTE = 10;

// Fanerne øverst i vinduet. Hver fane har nogle "dele", man kan vælge imellem:
//   slags "toej":    ting fra tøj-arket (slot = hvilken slags ting).
//                    "omr" er den del af figuren i rummet, der får tingens farve.
//   slags "farve":   en farve til en del af figuren (omr)
//   slags "frisure": frisurerne fra lag-arket
//   slags "bukser":  bukser der sidder på selve figuren (js/bukser.js)
const SU_FANER = [
  { id: "krop", navn: "Krop", dele: [{ slags: "farve", omr: "hud", navn: "Hudfarve" }] },
  { id: "haar", navn: "Hår", ikon: "frisure", dele: [
    { slags: "frisure", navn: "Frisurer" },
    { slags: "farve", omr: "haar", navn: "Hårfarve" },
  ] },
  { id: "overdel", navn: "Overdel", ikon: "top", dele: [
    { slags: "toej", slot: "top", omr: "vest", navn: "Toppe" },
    { slags: "toej", slot: "jakke", omr: "vest", navn: "Jakker" },
    { slags: "toej", slot: "kjole", omr: "vest", navn: "Kjoler" },
    { slags: "farve", omr: "vest", navn: "Farve på vest" },
    { slags: "farve", omr: "skjorte", navn: "Farve på skjorte" },
  ] },
  { id: "underdel", navn: "Underdel", ikon: "underdel", dele: [
    { slags: "bukser", navn: "Bukser" },
    { slags: "toej", slot: "underdel", omr: "underdel", navn: "Nederdele", kunPige: true },
    { slags: "toej", slot: "stroemper", omr: "stroemper", navn: "Strømper" },
    { slags: "toej", slot: "sko", omr: "sko", navn: "Sko" },
    { slags: "farve", omr: "underdel", navn: "Farve på nederdel", drengNavn: "Farve på bukser" },
    { slags: "farve", omr: "stroemper", navn: "Farve på strømper", kunPige: true },
    { slags: "farve", omr: "sko", navn: "Farve på sko" },
  ] },
  { id: "gemte", navn: "Gemte" },
];

// Rækkefølgen tøjet lægges på figuren i (det sidste ligger øverst)
const TOEJ_LAG = ["stroemper", "underdel", "sko", "kjole", "top", "jakke"];

// Farverne i paletten
const PALET = [
  "#fbe3cf", "#f2cfae", "#e8b98f", "#d9a274", "#c68a5a", "#a96d42", "#8a5232", "#6b3c22", "#4e2a17", "#33190c", "#f4ede1", "#d8cfc2", "#9a948c", "#2b2827",
  "#f6d26b", "#e8b13c", "#d98f2b", "#c46a1e", "#a8471a", "#8c2f17", "#c0392b", "#9b1d2a", "#6e1423", "#e8a0a8", "#d96a84", "#b83d6a", "#8a2b5a", "#5a1c3e",
  "#f4e3a1", "#d9d27a", "#a9b85a", "#6f9a4a", "#3f7a3c", "#2a5a34", "#1f4030", "#9ed3c6", "#4ea8a0", "#2a7a80", "#1d5566", "#a8c8e8", "#5f8fcf", "#2f5fa8",
  "#1e3a78", "#151f45", "#c8b4e0", "#9a78c8", "#6a4a9a", "#46306e", "#ffffff", "#e6e6e6", "#b3b3b3", "#7a7a7a", "#4a4a4a", "#1a1a1a", "#f0c8a0", "#7a4a2a", "#e8cfa0", "#3a5a4a", "#c87850",
];

const DREJ = ["ned", "ned-venstre", "venstre", "op-venstre", "op", "op-hoejre", "hoejre", "ned-hoejre"];

let kladde = null;          // det man er ved at lave, før man gemmer
let fortrydListe = [];
let suFane = "haar";
let suDel = 0;              // hvilken del under fanen der er valgt
let suDrej = 0;

if (!garderobe.ting) garderobe.ting = {};
if (!garderobe.frisure) garderobe.frisure = {};

function kopi(x) {
  return JSON.parse(JSON.stringify(x || {}));
}

// pige eller dreng (tøj-mapperne), efter hvilken figur der er valgt
function hvem(type) {
  const t = type || (kladde ? kladde.type : garderobe.type);
  return t.indexOf("mand") === 0 ? "dreng" : "pige";
}

function toejSti(fil, type) {
  return "billeder/toej/" + hvem(type) + "/" + fil;
}

// ----- Profilbilledet ved navnet i rummet (den valgte frisure) -----
const profilBilleder = {};
function profilBillede() {
  const fr = valgtFrisure(garderobe);
  if (!fr || !fr.ikon) return null;
  if (!profilBilleder[fr.ikon]) {
    profilBilleder[fr.ikon] = new Image();
    profilBilleder[fr.ikon].src = fr.ikon;
  }
  return profilBilleder[fr.ikon];
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
  kladde = { type: garderobe.type, farver: kopi(garderobe.farver), ting: kopi(garderobe.ting), frisure: kopi(garderobe.frisure) };
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
  garderobe.frisure = kopi(kladde.frisure);
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
  if (!kladde.farver[kladde.type]) kladde.farver[kladde.type] = {};
  return kladde.farver[kladde.type];
}

function mineTing() {
  if (!kladde.ting[kladde.type]) kladde.ting[kladde.type] = {};
  return kladde.ting[kladde.type];
}

function faneMedId(id) {
  return SU_FANER.find(function (f) { return f.id === id; });
}

// De dele, der kan vælges under en fane (kun dem der findes for figuren)
function deleI(fane) {
  const alle = TOEJ[hvem()];
  return (fane.dele || []).filter(function (d) {
    if (d.kunPige && hvem() === "dreng") return false;
    if (d.slags === "toej") return alle[d.slot] && alle[d.slot].length > 0;
    if (d.slags === "bukser") return typeof BUKSER !== "undefined";
    if (d.slags === "frisure") return typeof FRISURER !== "undefined" && FRISURER[kladde.type] && FRISURER[kladde.type].stile.length > 0;
    return true;
  });
}

function delNavn(d) {
  return hvem() === "dreng" && d.drengNavn ? d.drengNavn : d.navn;
}

function valgtDel() {
  const dele = deleI(faneMedId(suFane));
  if (suDel >= dele.length) suDel = 0;
  return dele[suDel] || null;
}

function tegnSkift() {
  tegnSuFaner();
  tegnSuUnder();
  tegnSuTing();
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
      suDel = 0;
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}

// Række under fanerne: vælg figur (Krop), eller hvilken del man ændrer
function tegnSuUnder() {
  const boks = document.getElementById("su-under");
  boks.innerHTML = "";
  if (suFane === "krop") {
    const figurer = alleFigurer();
    for (const id in figurer) {
      lavChip(boks, figurer[id], kladde.type === id, function () {
        if (kladde.type === id) return;
        foerAendring();
        kladde.type = id;
        tegnSkift();
      });
    }
    return;
  }
  if (suFane === "gemte") {
    lavChip(boks, "Gem det, du har på nu", true, function () {
      gemte.unshift(kopi({ type: kladde.type, farver: kladde.farver, ting: kladde.ting, frisure: kladde.frisure }));
      gemte = gemte.slice(0, MAKS_GEMTE);
      gemGemte();
      tegnSkift();
    });
    return;
  }
  deleI(faneMedId(suFane)).forEach(function (d, nr) {
    lavChip(boks, delNavn(d), nr === suDel, function () {
      suDel = nr;
      tegnSkift();
    });
  });
}

function lavChip(boks, tekst, aktiv, klik) {
  const knap = document.createElement("button");
  knap.className = "su-chip";
  knap.classList.toggle("aktiv", aktiv);
  knap.textContent = tekst;
  knap.addEventListener("click", klik);
  boks.appendChild(knap);
}

function lavTekst(boks, tekst) {
  const t = document.createElement("p");
  t.className = "su-tom";
  t.textContent = tekst;
  boks.appendChild(t);
}

// En knap i gitteret med et billede
function lavBilledKnap(boks, sti, aktiv, klik) {
  const knap = document.createElement("button");
  knap.className = "su-ting-knap";
  knap.classList.toggle("aktiv", aktiv);
  if (sti) {
    const b = document.createElement("img");
    b.src = sti;
    b.alt = "";
    b.loading = "lazy";
    knap.appendChild(b);
  }
  knap.addEventListener("click", klik);
  boks.appendChild(knap);
  return knap;
}

// "Ingen" / "Din egen" – første knap i gitteret
function lavIngenKnap(boks, tekst, aktiv, klik) {
  const knap = lavBilledKnap(boks, null, aktiv, klik);
  knap.classList.add("su-ingen");
  knap.textContent = tekst;
}

function tegnSuTing() {
  const boks = document.getElementById("su-ting");
  boks.innerHTML = "";

  if (suFane === "gemte") {
    tegnGemte(boks);
    return;
  }
  if (suFane === "krop") {
    lavTekst(boks, "Vælg figur ovenover og hudfarve herunder.");
    tegnPalet(boks, "hud");
    return;
  }
  const d = valgtDel();
  if (!d) return;

  if (d.slags === "farve") {
    lavTekst(boks, "Vælg en farve. Den kommer på figuren, både når den står, går og sidder.");
    tegnPalet(boks, d.omr);
    return;
  }

  if (d.slags === "frisure") {
    lavTekst(boks, "Frisurerne fra dit lag-ark. De kommer på figuren i alle retninger.");
    lavIngenKnap(boks, "Din egen", !kladde.frisure[kladde.type], function () {
      foerAendring();
      delete kladde.frisure[kladde.type];
      tegnSkift();
    });
    FRISURER[kladde.type].stile.forEach(function (st) {
      const knap = lavBilledKnap(boks, st.ikon, kladde.frisure[kladde.type] === st.id, function () {
        foerAendring();
        kladde.frisure[kladde.type] = st.id;
        delete mineFarver().haar;           // frisurens egen hårfarve
        tegnSkift();
      });
      knap.title = st.navn;
    });
    return;
  }

  if (d.slags === "bukser") {
    lavTekst(boks, "Bukserne sidder på selve figuren og følger med, når den går og sidder.");
    lavIngenKnap(boks, "Ingen", !mineFarver().bukser, function () {
      foerAendring();
      delete mineFarver().bukser;
      tegnSkift();
    });
    BUKSER.forEach(function (b) {
      const knap = lavBilledKnap(boks, b.ikon, mineFarver().bukser === b.id, function () {
        foerAendring();
        mineFarver().bukser = b.id;
        delete mineTing().underdel;          // ikke også en nederdel ovenpå
        delete mineTing().kjole;
        tegnSkift();
      });
      knap.title = b.navn;
    });
    return;
  }

  // tøj fra tøj-arket
  lavTekst(boks, "Tøjet vises på figuren forfra her. Inde i rummet får figuren tøjets farver.");
  lavIngenKnap(boks, "Ingen", !mineTing()[d.slot], function () {
    foerAendring();
    delete mineTing()[d.slot];
    tegnSkift();
  });
  TOEJ[hvem()][d.slot].forEach(function (fil) {
    lavBilledKnap(boks, toejSti(fil), mineTing()[d.slot] === fil, function () {
      foerAendring();
      vaelgToej(d, fil);
      tegnSkift();
    });
  });
}

// Tag en ting på: den får sin plads, og figuren i rummet får tingens farve
function vaelgToej(d, fil) {
  const ting = mineTing();
  ting[d.slot] = fil;
  // en kjole erstatter top og nederdel/bukser, og omvendt
  if (d.slot === "kjole") { delete ting.top; delete ting.underdel; }
  if (d.slot === "top" || d.slot === "underdel") delete ting.kjole;
  if (d.slot === "underdel" || d.slot === "kjole") delete mineFarver().bukser;
  const farve = TOEJ_FARVER[hvem() + "/" + fil];
  if (farve) {
    mineFarver()[d.omr] = farve;
    if (d.slot === "kjole") mineFarver().underdel = farve;
  }
}

function tegnPalet(boks, omr) {
  const nu = (mineFarver()[omr] || "").toLowerCase();
  // første knap: den oprindelige farve fra din tegning
  const orig = document.createElement("button");
  orig.className = "su-farve su-original";
  orig.title = "Original farve";
  orig.textContent = "↺";
  orig.classList.toggle("aktiv", !nu);
  orig.addEventListener("click", function () {
    foerAendring();
    delete mineFarver()[omr];
    tegnSkift();
  });
  boks.appendChild(orig);
  PALET.forEach(function (farve) {
    const knap = document.createElement("button");
    knap.className = "su-farve";
    knap.style.background = farve;
    knap.title = farve;
    knap.classList.toggle("aktiv", nu === farve);
    knap.addEventListener("click", function () {
      foerAendring();
      mineFarver()[omr] = farve;
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}

function tegnGemte(boks) {
  if (gemte.length === 0) {
    lavTekst(boks, "Du har ikke gemt noget endnu. Tryk på knappen ovenover for at gemme dit udseende.");
  }
  gemte.forEach(function (g, nr) {
    const knap = document.createElement("button");
    knap.className = "su-ting-knap su-gemt";
    const c = document.createElement("canvas");
    c.width = 72; c.height = 96;
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
      kladde.frisure = kopi(g.frisure);
      tegnSkift();
    });
    boks.appendChild(knap);
  });
}


// ----- Figuren på scenen til højre -----
// Figuren tegnes i hele pixels (2, 3, 4 ... skærm-pixels pr. billed-pixel),
// så den bliver skarp og ikke sløret.
const SCENE_B = 220, SCENE_H = 340, SCENE_FOEDDER = 330;
const SCENE_MAKS = 2;   // højst 2 gange billedets størrelse, så figuren kan være der

function tegnSuFigur() {
  if (!kladde) return;
  const dpr = window.devicePixelRatio || 1;
  if (suFigur.width !== Math.round(SCENE_B * dpr)) {
    suFigur.width = Math.round(SCENE_B * dpr);
    suFigur.height = Math.round(SCENE_H * dpr);
  }
  const c = suFigur.getContext("2d");
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, suFigur.width, suFigur.height);
  // skygge
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.beginPath();
  c.ellipse(SCENE_B / 2, SCENE_FOEDDER, 50, 13, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(60, 30, 10, 0.25)";
  c.fill();
  // figuren: et helt antal skærm-pixels pr. billed-pixel
  const f = FIGURER[kladde.type] || FIGURER.kvinde;
  const pr = Math.max(1, Math.floor(SCENE_MAKS * dpr + 0.01));
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(SCENE_B / 2 * dpr), Math.round(SCENE_FOEDDER * dpr));
  c.scale(pr / f.skala, pr / f.skala);
  tegnMenneske(c, 0, 0, kladde, DREJ[suDrej], null, null);
  if (DREJ[suDrej] === "ned") tegnToejForfra(c, kladde);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// Læg tøjet fra garderoben på figuren, når den kigger frem.
// (c er flyttet hen til figurens fødder og skaleret som tegnMenneske gør det)
const toejBilleder = {};
function tegnToejForfra(c, udseende) {
  const f = FIGURER[udseende.type] || FIGURER.kvinde;
  const kasser = TOEJ_KASSER[hvem(udseende.type) === "dreng" ? "mand" : "kvinde"];
  const del = f.gaa.ned[0];
  if (!kasser || kasser.fil !== del.fil) return;      // kun figurer med kendte kasser
  const ting = udseende.ting[udseende.type] || {};
  const s = f.skala;
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  TOEJ_LAG.forEach(function (slot) {
    if (!ting[slot] || !kasser[slot]) return;
    const sti = toejSti(ting[slot], udseende.type);
    if (!toejBilleder[sti]) {
      toejBilleder[sti] = new Image();
      toejBilleder[sti].onload = function () { if (kladde) tegnSkift(); };
      toejBilleder[sti].src = sti;
    }
    const b = toejBilleder[sti];
    if (!klar(b)) return;
    const k = kasser[slot];
    c.drawImage(b, (k[0] - del.anker[0]) * s, (k[1] - del.anker[1]) * s, (k[2] - k[0]) * s, (k[3] - k[1]) * s);
  });
  c.restore();
}

function tegnLilleFigur(c, udseende) {
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  g.save();
  g.translate(c.width / 2, c.height - 4);
  g.scale(0.58, 0.58);
  const u = { type: udseende.type, farver: udseende.farver || {}, ting: udseende.ting || {}, frisure: udseende.frisure || {} };
  tegnMenneske(g, 0, 0, u, "ned", null, null);
  tegnToejForfra(g, u);
  g.restore();
}

// Et tilfældigt udseende: tilfældig frisure, tilfældigt tøj og tøjets farver
function tilfaeldigtUdseende() {
  foerAendring();
  const valg = function (liste) { return liste[Math.floor(Math.random() * liste.length)]; };
  const hud = mineFarver().hud;
  kladde.farver[kladde.type] = hud ? { hud: hud } : {};
  kladde.ting[kladde.type] = {};
  if (typeof FRISURER !== "undefined" && FRISURER[kladde.type] && FRISURER[kladde.type].stile.length) {
    kladde.frisure[kladde.type] = valg(FRISURER[kladde.type].stile).id;
  }
  const alle = TOEJ[hvem()];
  const dele = deleI(faneMedId("overdel")).concat(deleI(faneMedId("underdel")));
  const brugKjole = alle.kjole && Math.random() < 0.3;
  const brugBukser = !brugKjole && typeof BUKSER !== "undefined" && (hvem() === "dreng" || Math.random() < 0.5);
  if (brugBukser) mineFarver().bukser = valg(BUKSER).id;
  dele.forEach(function (d) {
    if (d.slags !== "toej") return;
    if (brugKjole && (d.slot === "top" || d.slot === "underdel")) return;
    if (brugBukser && d.slot === "underdel") return;
    if (!brugKjole && d.slot === "kjole") return;
    if (d.slot === "jakke" && Math.random() < 0.5) return;
    vaelgToej(d, valg(alle[d.slot]));
  });
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
// skraldespanden: fjern det, der er valgt under den del, man står på
document.getElementById("su-fjern").addEventListener("click", function () {
  if (suFane === "gemte") return;
  foerAendring();
  if (suFane === "krop") { delete mineFarver().hud; tegnSkift(); return; }
  const d = valgtDel();
  if (!d) return;
  if (d.slags === "farve") delete mineFarver()[d.omr];
  if (d.slags === "frisure") delete kladde.frisure[kladde.type];
  if (d.slags === "bukser") delete mineFarver().bukser;
  if (d.slags === "toej") { delete mineTing()[d.slot]; delete mineFarver()[d.omr]; }
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
