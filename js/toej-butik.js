// =============================================================
//  Tøj i Shoppen 👕 (fra dine tøj-ark)
//  Tøjet købes for Glimt og ligger bagefter i "Mine ting" under Tøj.
//  Trykker man "Tag på", får "Pige (tøj)" tøjets farve på t-shirt,
//  shorts eller sko. Formen på tøjet ændrer sig ikke, kun farven,
//  fordi tøjet på arket kun er tegnet forfra.
// =============================================================
const TOEJ_VARER = [
  { id: "pige-overdel-01", navn: "Hvid top", hvem: "pige", slot: "overdel", farve: "#e1d8cd", pris: 120 },
  { id: "pige-overdel-02", navn: "Sort top", hvem: "pige", slot: "overdel", farve: "#3e352f", pris: 120 },
  { id: "pige-overdel-03", navn: "Sort top 2", hvem: "pige", slot: "overdel", farve: "#3b3935", pris: 120 },
  { id: "pige-overdel-04", navn: "Grå top", hvem: "pige", slot: "overdel", farve: "#bcbacb", pris: 120 },
  { id: "pige-overdel-05", navn: "Vinrød top", hvem: "pige", slot: "overdel", farve: "#8d3028", pris: 120 },
  { id: "pige-overdel-06", navn: "Lyserød top", hvem: "pige", slot: "overdel", farve: "#e3adb3", pris: 120 },
  { id: "pige-overdel-07", navn: "Rød top", hvem: "pige", slot: "overdel", farve: "#c04f5c", pris: 120 },
  { id: "pige-overdel-08", navn: "Beige top", hvem: "pige", slot: "overdel", farve: "#5a563d", pris: 120 },
  { id: "pige-overdel-09", navn: "Brun top", hvem: "pige", slot: "overdel", farve: "#725940", pris: 120 },
  { id: "pige-overdel-10", navn: "Brun top 2", hvem: "pige", slot: "overdel", farve: "#7f583b", pris: 120 },
  { id: "pige-overdel-11", navn: "Lysebrun top", hvem: "pige", slot: "overdel", farve: "#b6a091", pris: 120 },
  { id: "pige-overdel-12", navn: "Brun top 3", hvem: "pige", slot: "overdel", farve: "#6c4635", pris: 120 },
  { id: "pige-overdel-13", navn: "Mørkegrå top", hvem: "pige", slot: "overdel", farve: "#545250", pris: 120 },
  { id: "pige-overdel-14", navn: "Lyseblå top", hvem: "pige", slot: "overdel", farve: "#9fb4ce", pris: 120 },
  { id: "pige-overdel-15", navn: "Lyserød top 2", hvem: "pige", slot: "overdel", farve: "#e7c7c0", pris: 120 },
  { id: "pige-overdel-16", navn: "Hvid top 2", hvem: "pige", slot: "overdel", farve: "#b7c1d1", pris: 120 },
  { id: "pige-overdel-17", navn: "Hvid trøje", hvem: "pige", slot: "overdel", farve: "#e7e3e0", pris: 180 },
  { id: "pige-overdel-18", navn: "Sort trøje", hvem: "pige", slot: "overdel", farve: "#3b3733", pris: 180 },
  { id: "pige-overdel-19", navn: "Sort trøje 2", hvem: "pige", slot: "overdel", farve: "#393733", pris: 180 },
  { id: "pige-overdel-20", navn: "Brun trøje", hvem: "pige", slot: "overdel", farve: "#75685b", pris: 180 },
  { id: "pige-overdel-21", navn: "Vinrød trøje", hvem: "pige", slot: "overdel", farve: "#8e2e27", pris: 180 },
  { id: "pige-overdel-22", navn: "Lyserød trøje", hvem: "pige", slot: "overdel", farve: "#e8abb1", pris: 180 },
  { id: "pige-overdel-23", navn: "Lyserød trøje 2", hvem: "pige", slot: "overdel", farve: "#c69299", pris: 180 },
  { id: "pige-overdel-24", navn: "Beige trøje", hvem: "pige", slot: "overdel", farve: "#5c5940", pris: 180 },
  { id: "pige-overdel-25", navn: "Brun trøje 2", hvem: "pige", slot: "overdel", farve: "#776c50", pris: 180 },
  { id: "pige-overdel-26", navn: "Vinrød trøje 2", hvem: "pige", slot: "overdel", farve: "#8c2824", pris: 180 },
  { id: "pige-overdel-27", navn: "Mørkegrå trøje", hvem: "pige", slot: "overdel", farve: "#615c59", pris: 180 },
  { id: "pige-overdel-28", navn: "Sort trøje 3", hvem: "pige", slot: "overdel", farve: "#3c3731", pris: 180 },
  { id: "pige-overdel-29", navn: "Sort trøje 4", hvem: "pige", slot: "overdel", farve: "#3d3b38", pris: 180 },
  { id: "pige-overdel-30", navn: "Lyserød trøje 3", hvem: "pige", slot: "overdel", farve: "#eca5ac", pris: 180 },
  { id: "pige-overdel-31", navn: "Lyserød trøje 4", hvem: "pige", slot: "overdel", farve: "#eac9c3", pris: 180 },
  { id: "pige-overdel-32", navn: "Lyseblå trøje", hvem: "pige", slot: "overdel", farve: "#aec2d7", pris: 180 },
  { id: "pige-underdel-01", navn: "Lyseblå bukser", hvem: "pige", slot: "underdel", farve: "#7a9fbc", pris: 150 },
  { id: "pige-underdel-02", navn: "Grå bukser", hvem: "pige", slot: "underdel", farve: "#a1a3a4", pris: 150 },
  { id: "pige-underdel-03", navn: "Sort bukser", hvem: "pige", slot: "underdel", farve: "#343332", pris: 150 },
  { id: "pige-underdel-04", navn: "Blå bukser", hvem: "pige", slot: "underdel", farve: "#6d95b4", pris: 150 },
  { id: "pige-underdel-05", navn: "Hvid bukser", hvem: "pige", slot: "underdel", farve: "#e4dbd2", pris: 150 },
  { id: "pige-underdel-06", navn: "Brun shorts", hvem: "pige", slot: "underdel", farve: "#6c4a2f", pris: 150 },
  { id: "pige-underdel-07", navn: "Grå shorts 2", hvem: "pige", slot: "underdel", farve: "#928580", pris: 150 },
  { id: "pige-underdel-08", navn: "Lyserød bukser", hvem: "pige", slot: "underdel", farve: "#ea97a7", pris: 150 },
  { id: "pige-underdel-09", navn: "Blå bukser 2", hvem: "pige", slot: "underdel", farve: "#7999b4", pris: 150 },
  { id: "pige-underdel-10", navn: "Vinrød bukser", hvem: "pige", slot: "underdel", farve: "#812821", pris: 150 },
  { id: "pige-underdel-11", navn: "Beige bukser", hvem: "pige", slot: "underdel", farve: "#e2d0b3", pris: 150 },
  { id: "pige-underdel-12", navn: "Brun shorts 2", hvem: "pige", slot: "underdel", farve: "#6d5a46", pris: 150 },
  { id: "pige-underdel-13", navn: "Brun nederdel 3", hvem: "pige", slot: "underdel", farve: "#675140", pris: 150 },
  { id: "pige-underdel-14", navn: "Lyserød bukser 2", hvem: "pige", slot: "underdel", farve: "#eb8fac", pris: 150 },
  { id: "pige-underdel-15", navn: "Brun shorts 4", hvem: "pige", slot: "underdel", farve: "#6c4c3e", pris: 150 },
  { id: "pige-sko-01", navn: "Grå sko", hvem: "pige", slot: "sko", farve: "#bcb7b0", pris: 100 },
  { id: "pige-sko-02", navn: "Brun sko", hvem: "pige", slot: "sko", farve: "#744a2d", pris: 100 },
  { id: "pige-sko-03", navn: "Brun sko 2", hvem: "pige", slot: "sko", farve: "#56392d", pris: 100 },
  { id: "pige-sko-04", navn: "Lyserød sko", hvem: "pige", slot: "sko", farve: "#b6929c", pris: 100 },
  { id: "pige-sko-05", navn: "Grå sko 2", hvem: "pige", slot: "sko", farve: "#bdbcb5", pris: 100 },
  { id: "pige-sko-06", navn: "Lyserød sko 2", hvem: "pige", slot: "sko", farve: "#c8adaa", pris: 100 },
  { id: "pige-sko-07", navn: "Lyserød sko 3", hvem: "pige", slot: "sko", farve: "#c77c8e", pris: 100 },
  { id: "pige-sko-08", navn: "Grå sko 3", hvem: "pige", slot: "sko", farve: "#aea39d", pris: 100 },
  { id: "pige-sko-09", navn: "Brun sko 3", hvem: "pige", slot: "sko", farve: "#5d3c26", pris: 100 },
  { id: "pige-sko-10", navn: "Brun sko 4", hvem: "pige", slot: "sko", farve: "#623e28", pris: 100 },
  { id: "pige-sko-11", navn: "Vinrød sko", hvem: "pige", slot: "sko", farve: "#7c3429", pris: 100 },
  { id: "pige-sko-12", navn: "Lysebrun sko", hvem: "pige", slot: "sko", farve: "#a07c66", pris: 100 },
  { id: "pige-sko-13", navn: "Lyserød sko 4", hvem: "pige", slot: "sko", farve: "#b67266", pris: 100 },
  { id: "pige-sko-14", navn: "Sort sko", hvem: "pige", slot: "sko", farve: "#3d332b", pris: 100 },
  { id: "pige-sko-15", navn: "Sort sko 2", hvem: "pige", slot: "sko", farve: "#35322e", pris: 100 },
  { id: "dreng-overdel-01", navn: "Sort t-shirt", hvem: "dreng", slot: "overdel", farve: "#33312f", pris: 120 },
  { id: "dreng-overdel-02", navn: "Sort t-shirt 2", hvem: "dreng", slot: "overdel", farve: "#353432", pris: 120 },
  { id: "dreng-overdel-03", navn: "Mørkeblå t-shirt", hvem: "dreng", slot: "overdel", farve: "#323e52", pris: 120 },
  { id: "dreng-overdel-04", navn: "Vinrød t-shirt", hvem: "dreng", slot: "overdel", farve: "#96302c", pris: 120 },
  { id: "dreng-overdel-05", navn: "Beige t-shirt", hvem: "dreng", slot: "overdel", farve: "#464434", pris: 120 },
  { id: "dreng-overdel-06", navn: "Lysebrun t-shirt", hvem: "dreng", slot: "overdel", farve: "#8d6b5b", pris: 120 },
  { id: "dreng-overdel-07", navn: "Brun t-shirt", hvem: "dreng", slot: "overdel", farve: "#483e37", pris: 120 },
  { id: "dreng-overdel-08", navn: "Vinrød t-shirt 2", hvem: "dreng", slot: "overdel", farve: "#7d2c23", pris: 120 },
  { id: "dreng-overdel-09", navn: "Sort t-shirt 3", hvem: "dreng", slot: "overdel", farve: "#35332f", pris: 120 },
  { id: "dreng-overdel-10", navn: "Sort t-shirt 4", hvem: "dreng", slot: "overdel", farve: "#3b3834", pris: 120 },
  { id: "dreng-overdel-11", navn: "Sort t-shirt 5", hvem: "dreng", slot: "overdel", farve: "#32312e", pris: 120 },
  { id: "dreng-overdel-12", navn: "Sort t-shirt 6", hvem: "dreng", slot: "overdel", farve: "#34322e", pris: 120 },
  { id: "dreng-overdel-13", navn: "Hvid t-shirt", hvem: "dreng", slot: "overdel", farve: "#efe6d8", pris: 120 },
  { id: "dreng-overdel-14", navn: "Brun t-shirt 2", hvem: "dreng", slot: "overdel", farve: "#4d4137", pris: 120 },
  { id: "dreng-overdel-15", navn: "Lysebrun jakke", hvem: "dreng", slot: "overdel", farve: "#917962", pris: 180 },
  { id: "dreng-overdel-16", navn: "Blå jakke", hvem: "dreng", slot: "overdel", farve: "#56708a", pris: 180 },
  { id: "dreng-overdel-17", navn: "Mørkegrå jakke", hvem: "dreng", slot: "overdel", farve: "#706c66", pris: 180 },
  { id: "dreng-overdel-18", navn: "Hvid jakke", hvem: "dreng", slot: "overdel", farve: "#dedcd7", pris: 180 },
  { id: "dreng-overdel-19", navn: "Sort jakke", hvem: "dreng", slot: "overdel", farve: "#393532", pris: 180 },
  { id: "dreng-overdel-20", navn: "Grå jakke", hvem: "dreng", slot: "overdel", farve: "#7e8179", pris: 180 },
  { id: "dreng-overdel-21", navn: "Grå jakke 2", hvem: "dreng", slot: "overdel", farve: "#aeafaf", pris: 180 },
  { id: "dreng-overdel-22", navn: "Lysebrun jakke 2", hvem: "dreng", slot: "overdel", farve: "#82563a", pris: 180 },
  { id: "dreng-overdel-23", navn: "Vinrød jakke", hvem: "dreng", slot: "overdel", farve: "#782a23", pris: 180 },
  { id: "dreng-overdel-24", navn: "Hvid jakke 2", hvem: "dreng", slot: "overdel", farve: "#eaebec", pris: 180 },
  { id: "dreng-overdel-25", navn: "Beige jakke", hvem: "dreng", slot: "overdel", farve: "#dbcab3", pris: 180 },
  { id: "dreng-overdel-26", navn: "Sort jakke 2", hvem: "dreng", slot: "overdel", farve: "#35322e", pris: 180 },
  { id: "dreng-overdel-27", navn: "Sort jakke 3", hvem: "dreng", slot: "overdel", farve: "#363431", pris: 180 },
  { id: "dreng-overdel-28", navn: "Mørkegrå jakke 2", hvem: "dreng", slot: "overdel", farve: "#6d6966", pris: 180 },
  { id: "dreng-overdel-29", navn: "Blå jakke 2", hvem: "dreng", slot: "overdel", farve: "#46596c", pris: 180 },
  { id: "dreng-underdel-01", navn: "Brun bukser", hvem: "dreng", slot: "underdel", farve: "#463f39", pris: 150 },
  { id: "dreng-underdel-02", navn: "Grå bukser", hvem: "dreng", slot: "underdel", farve: "#b1b2ab", pris: 150 },
  { id: "dreng-underdel-03", navn: "Sort bukser", hvem: "dreng", slot: "underdel", farve: "#31302d", pris: 150 },
  { id: "dreng-underdel-04", navn: "Grå bukser 2", hvem: "dreng", slot: "underdel", farve: "#ccc6bf", pris: 150 },
  { id: "dreng-underdel-05", navn: "Blå bukser", hvem: "dreng", slot: "underdel", farve: "#728e9e", pris: 150 },
  { id: "dreng-underdel-06", navn: "Brun bukser 2", hvem: "dreng", slot: "underdel", farve: "#494333", pris: 150 },
  { id: "dreng-underdel-07", navn: "Beige bukser", hvem: "dreng", slot: "underdel", farve: "#59563e", pris: 150 },
  { id: "dreng-underdel-08", navn: "Beige bukser 2", hvem: "dreng", slot: "underdel", farve: "#d5c5b3", pris: 150 },
  { id: "dreng-underdel-09", navn: "Sort bukser 2", hvem: "dreng", slot: "underdel", farve: "#313337", pris: 150 },
  { id: "dreng-underdel-10", navn: "Blå bukser 2", hvem: "dreng", slot: "underdel", farve: "#7d909b", pris: 150 },
  { id: "dreng-underdel-11", navn: "Lysebrun shorts", hvem: "dreng", slot: "underdel", farve: "#a0928a", pris: 150 },
  { id: "dreng-underdel-12", navn: "Sort bukser 3", hvem: "dreng", slot: "underdel", farve: "#32312e", pris: 150 },
  { id: "dreng-underdel-13", navn: "Mørkegrå bukser", hvem: "dreng", slot: "underdel", farve: "#605d5c", pris: 150 },
  { id: "dreng-underdel-14", navn: "Brun bukser 3", hvem: "dreng", slot: "underdel", farve: "#4e4237", pris: 150 },
  { id: "dreng-underdel-15", navn: "Mørkegrå shorts 2", hvem: "dreng", slot: "underdel", farve: "#544b51", pris: 150 },
  { id: "dreng-sko-01", navn: "Grå sko", hvem: "dreng", slot: "sko", farve: "#bab8b9", pris: 100 },
  { id: "dreng-sko-02", navn: "Brun sko", hvem: "dreng", slot: "sko", farve: "#4f4a42", pris: 100 },
  { id: "dreng-sko-03", navn: "Sort sko", hvem: "dreng", slot: "sko", farve: "#43413d", pris: 100 },
  { id: "dreng-sko-04", navn: "Vinrød sko", hvem: "dreng", slot: "sko", farve: "#95493d", pris: 100 },
  { id: "dreng-sko-05", navn: "Brun sko 2", hvem: "dreng", slot: "sko", farve: "#7f6257", pris: 100 },
  { id: "dreng-sko-06", navn: "Lysebrun sko", hvem: "dreng", slot: "sko", farve: "#ac9e8e", pris: 100 },
  { id: "dreng-sko-07", navn: "Beige sko", hvem: "dreng", slot: "sko", farve: "#767465", pris: 100 },
  { id: "dreng-sko-08", navn: "Sort sko 2", hvem: "dreng", slot: "sko", farve: "#393a3b", pris: 100 },
  { id: "dreng-sko-09", navn: "Lyserød sko", hvem: "dreng", slot: "sko", farve: "#a0635f", pris: 100 },
  { id: "dreng-sko-10", navn: "Brun sko 3", hvem: "dreng", slot: "sko", farve: "#66452b", pris: 100 },
  { id: "dreng-sko-11", navn: "Brun sko 4", hvem: "dreng", slot: "sko", farve: "#5a4f43", pris: 100 },
  { id: "dreng-sko-12", navn: "Beige sko 2", hvem: "dreng", slot: "sko", farve: "#4e4c43", pris: 100 },
  { id: "dreng-sko-13", navn: "Sort sko 3", hvem: "dreng", slot: "sko", farve: "#3f3933", pris: 100 },
  { id: "dreng-sko-14", navn: "Brun sko 5", hvem: "dreng", slot: "sko", farve: "#4e3522", pris: 100 },
  { id: "dreng-sko-15", navn: "Brun sko 6", hvem: "dreng", slot: "sko", farve: "#46403a", pris: 100 },
];
const TOEJ_NOEGLE = "mit-hotel-toej";
const TOEJ_FIGUR = "pigetoej";                       // figuren der kan få tøjets farver
const TOEJ_OMR = { overdel: "skjorte", underdel: "underdel", sko: "sko" };
const TOEJ_KAT = [
  { id: "overdel", navn: "Overdele", ikon: "👚" },
  { id: "underdel", navn: "Underdele", ikon: "👖" },
  { id: "sko", navn: "Sko", ikon: "👟" },
];

// tøj man ejer: ["pige-overdel-01", ...]
let mitToej = [];
try { mitToej = JSON.parse(localStorage.getItem(TOEJ_NOEGLE) || "[]"); } catch (e) {}
function gemMitToej() {
  try { localStorage.setItem(TOEJ_NOEGLE, JSON.stringify(mitToej)); } catch (e) {}
}
function harToej(id) { return mitToej.indexOf(id) >= 0; }
function toejVare(id) { return TOEJ_VARER.find(function (v) { return v.id === id; }); }
function toejFil(v) { return "billeder/toej/butik/" + v.id + ".png"; }

let toejHvem = "pige";
let toejKat = "overdel";
let toejValgt = null;

function toejKnap(v, aktiv, ekstra) {
  const knap = document.createElement("button");
  knap.className = "butik-ting" + (aktiv ? " aktiv" : "");
  knap.title = v.navn;
  const b = document.createElement("img");
  b.className = "toej-ikon";
  b.src = toejFil(v);
  b.alt = "";
  knap.appendChild(b);
  if (ekstra) knap.appendChild(ekstra);
  return knap;
}

function tegnToejBillede(c, v) {
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  const b = new Image();
  b.onload = function () {
    const s = Math.min((c.width - 6) / b.width, (c.height - 6) / b.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(b, (c.width - b.width * s) / 2, (c.height - b.height * s) / 2, b.width * s, b.height * s);
  };
  b.src = toejFil(v);
}

// Tag tøjet på: farven kommer på Pige (tøj)
function tagToejPaa(v) {
  if (garderobe.type !== TOEJ_FIGUR) {
    garderobe.type = TOEJ_FIGUR;
    besked.textContent = "Du har fået Pige (tøj) på, så du kan se tøjet ✨";
  } else {
    besked.textContent = "Du har " + v.navn.toLowerCase() + " på 👕";
  }
  if (!garderobe.farver) garderobe.farver = {};
  if (!garderobe.farver[TOEJ_FIGUR]) garderobe.farver[TOEJ_FIGUR] = {};
  garderobe.farver[TOEJ_FIGUR][TOEJ_OMR[v.slot]] = v.farve;
  if (!garderobe.ting) garderobe.ting = {};
  if (!garderobe.ting[TOEJ_FIGUR]) garderobe.ting[TOEJ_FIGUR] = {};
  garderobe.ting[TOEJ_FIGUR]["butik-" + v.slot] = v.id;
  gemGarderobe();
  tegnForhaandsvisning();
  svaev("👕");
}
function harToejPaa(v) {
  const t = garderobe.ting && garderobe.ting[TOEJ_FIGUR];
  return garderobe.type === TOEJ_FIGUR && t && t["butik-" + v.slot] === v.id;
}


// -------------------------------------------------------------
//  Shoppens Tøj-fane
// -------------------------------------------------------------
function visToejShop() {
  const kat = document.getElementById("shop-kat");
  const gitter = document.getElementById("shop-gitter");
  kat.hidden = false;
  kat.innerHTML = "";
  gitter.innerHTML = "";
  [{ id: "pige", navn: "Pige", ikon: "👧" }, { id: "dreng", navn: "Dreng", ikon: "👦" }].forEach(function (h) {
    const knap = document.createElement("button");
    knap.innerHTML = "<span>" + h.ikon + "</span>" + h.navn;
    if (h.id === toejHvem) knap.className = "aktiv";
    knap.addEventListener("click", function () { toejHvem = h.id; visShop(); gitter.scrollTop = 0; });
    kat.appendChild(knap);
  });
  TOEJ_KAT.forEach(function (k) {
    const knap = document.createElement("button");
    knap.innerHTML = "<span>" + k.ikon + "</span>" + k.navn;
    if (k.id === toejKat) knap.className = "aktiv";
    knap.addEventListener("click", function () { toejKat = k.id; visShop(); gitter.scrollTop = 0; });
    kat.appendChild(knap);
  });
  TOEJ_VARER.filter(function (v) { return v.hvem === toejHvem && v.slot === toejKat; }).forEach(function (v) {
    const pr = document.createElement("span");
    pr.className = "butik-pris";
    pr.innerHTML = harToej(v.id) ? "✔ Din" : prisHtml({ stella: false, beloeb: v.pris });
    const knap = toejKnap(v, v === toejValgt, pr);
    knap.addEventListener("click", function () { toejValgt = v; visShop(); });
    gitter.appendChild(knap);
  });

  const boks = document.getElementById("shop-valgt");
  const koeb = document.getElementById("shop-koeb");
  if (!toejValgt) { boks.hidden = true; return; }
  boks.hidden = false;
  tegnToejBillede(document.getElementById("shop-valgt-billede"), toejValgt);
  document.getElementById("shop-valgt-navn").textContent = toejValgt.navn;
  if (harToej(toejValgt.id)) {
    document.getElementById("shop-valgt-pris").textContent = harToejPaa(toejValgt) ? "Du har den på" : "Du ejer den";
    koeb.disabled = false;
    koeb.textContent = "Tag på";
  } else {
    document.getElementById("shop-valgt-pris").innerHTML = prisHtml({ stella: false, beloeb: toejValgt.pris });
    koeb.disabled = glimt < toejValgt.pris;
    koeb.textContent = koeb.disabled ? "Ikke nok Glimt" : "Køb";
  }
}

const visShopToej = visShop;
visShop = function () {
  if (shopFane !== "toej" || shopVindue.hidden) {
    if (shopFane !== "toej") toejValgt = null;
    visShopToej();
    return;
  }
  shopValgt = null;                                  // så knappen ikke køber et møbel
  visShopToej();                                     // penge og faner
  visToejShop();
};

// Køb / Tag på (kører før møbel-købet, som ikke gør noget, når intet møbel er valgt)
document.getElementById("shop-koeb").addEventListener("click", function () {
  if (shopFane !== "toej" || !toejValgt) return;
  const v = toejValgt;
  if (harToej(v.id)) { tagToejPaa(v); visShop(); visLager(); return; }
  if (!brugGlimt(v.pris)) return;
  mitToej.push(v.id);
  gemMitToej();
  svaev("🛍️");
  besked.textContent = "Du købte " + v.navn + "! Den ligger i Mine ting under Tøj 📦";
  visShop();
  visLager();
}, true);


// -------------------------------------------------------------
//  Mine ting: Tøj
// -------------------------------------------------------------
const lagerAntalToej = lagerAntal;
lagerAntal = function (kat) {
  if (kat === "toej") return mitToej.length;
  if (kat === "alle") return lagerAntalToej(kat) + mitToej.length;
  return lagerAntalToej(kat);
};

let lagerToejValgt = null;
const visLagerToej = visLager;
visLager = function () {
  visLagerToej();
  if (lagerVindue.hidden) return;
  const saet = document.getElementById("lager-saet");
  if (lagerKat !== "toej" && lagerKat !== "alle") { saet.textContent = "Sæt i mit værelse"; return; }
  const gitter = document.getElementById("lager-gitter");
  const soeg = lagerSoeg.value.trim().toLowerCase();
  const liste = mitToej.map(toejVare).filter(function (v) {
    return v && (!soeg || v.navn.toLowerCase().indexOf(soeg) >= 0);
  });
  if (lagerSorter.value === "navn") liste.sort(function (a, b) { return a.navn.localeCompare(b.navn, "da", { numeric: true }); });
  else if (lagerSorter.value !== "aeldste") liste.reverse();
  if (lagerKat === "toej") gitter.innerHTML = liste.length ? "" :
    "<p class='butik-tom'>Du har intet tøj endnu.<br><small>Køb noget under Tøj i shoppen 🛒</small></p>";
  else if (liste.length) gitter.querySelectorAll(".butik-tom").forEach(function (p) { p.remove(); });
  liste.forEach(function (v) {
    const knap = toejKnap(v, v === lagerToejValgt);
    if (harToejPaa(v)) {
      const paa = document.createElement("span");
      paa.className = "lager-tal";
      paa.textContent = "på";
      knap.appendChild(paa);
    }
    knap.addEventListener("click", function () { lagerToejValgt = v; lagerValgt = null; visLager(); });
    gitter.appendChild(knap);
  });

  const boks = document.getElementById("lager-valgt");
  if (lagerToejValgt && !lagerValgt && liste.indexOf(lagerToejValgt) >= 0) {
    boks.hidden = false;
    tegnToejBillede(document.getElementById("lager-valgt-billede"), lagerToejValgt);
    document.getElementById("lager-valgt-navn").textContent = lagerToejValgt.navn;
    document.getElementById("lager-valgt-antal").textContent = harToejPaa(lagerToejValgt) ? "Du har den på" : "Tøj · " + (lagerToejValgt.hvem === "pige" ? "pige" : "dreng");
    saet.textContent = "Tag på";
  } else {
    saet.textContent = "Sæt i mit værelse";
  }
};

document.getElementById("lager-saet").addEventListener("click", function (e) {
  if (!lagerToejValgt || lagerValgt) return;
  e.stopImmediatePropagation();
  tagToejPaa(lagerToejValgt);
  visLager();
}, true);

// vælger man et møbel i lageret, er tøjet ikke valgt længere
document.getElementById("lager-gitter").addEventListener("click", function () {
  if (lagerValgt) lagerToejValgt = null;
});
