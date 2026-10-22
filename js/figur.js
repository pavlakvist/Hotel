// =============================================================
//  FIGURERNE
// =============================================================
//
//  Figurerne er lavet af dine egne tegninger, klippet ud af de billeder
//  du har sendt. De ligger i mappen "billeder":
//    kvinde-forfra.png  kvinde-bagfra.png
//    mand-forfra.png    mand-bagfra.png
//
//  "forfra" bruges, når figuren går mod dig, og "bagfra", når den går væk.
//  Billederne skal kigge mod højre. Når figuren går mod venstre, bliver de
//  automatisk spejlvendt.
//
//  Vil du lave en ny figur, så læg to billeder i mappen "billeder",
//  kopiér "mand" herunder, og skriv de nye filnavne.

// =============================================================
//  Figurer lavet af billeder
//    forfra / bagfra: billedfilerne
//    skala:  hvor stor billedet tegnes (0.5 = halv størrelse)
//  Billedet tegnes, så bunden af billedet står på gulvet.
// =============================================================
const BILLED_FIGURER = {
  kvinde: {
    navn: "Kvinde",
    forfra: "billeder/kvinde-forfra.png",
    bagfra: "billeder/kvinde-bagfra.png",
    skala: 0.5,
  },
  mand: {
    navn: "Mand",
    forfra: "billeder/mand-forfra.png",
    bagfra: "billeder/mand-bagfra.png",
    skala: 0.5,
  },
};

const figurBilleder = {};

function figurBillede(sti) {
  if (!figurBilleder[sti]) {
    const b = new Image();
    b.onload = function () { if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning(); };
    b.src = sti;
    figurBilleder[sti] = b;
  }
  return figurBilleder[sti];
}

function tegnBilledFigur(c, x, y, f, forfra, vendt, gaarTrin) {
  const b = figurBillede(forfra ? f.forfra : f.bagfra);
  if (!b.complete || b.naturalWidth === 0) return;
  const tid = performance.now();
  const w = b.naturalWidth * f.skala;
  const h = b.naturalHeight * f.skala;
  let hop = 0, vip = 0, aande = 1;
  if (gaarTrin === null) {
    aande = 1 + Math.sin(tid / 700) * 0.012;      // vejrtrækning
  } else {
    const fase = gaarTrin * Math.PI / 2;
    hop = Math.abs(Math.sin(fase)) * 3;           // hopper lidt for hvert skridt
    vip = Math.sin(fase) * 0.05;                  // og vugger fra side til side
  }
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  c.translate(Math.round(x), Math.round(y - hop));
  c.rotate(vip);
  c.scale(vendt < 0 ? -1 : 1, aande);
  c.drawImage(b, -w / 2, -h, w, h);
  c.restore();
}

// =============================================================
//  Tegn en figur
//    x, y:      hvor fødderne står på skærmen
//    valg:      { type: "kvinde" eller "mand" }
//    forfra:    true = kigger mod os, false = vender ryggen til
//    vendt:     1 = mod højre, -1 = mod venstre
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
// =============================================================
function tegnMenneske(c, x, y, valg, forfra, vendt, gaarTrin) {
  const f = BILLED_FIGURER[valg.type] || BILLED_FIGURER.kvinde;
  tegnBilledFigur(c, x, y, f, forfra, vendt, gaarTrin);
}

// Hvor høj figuren er på skærmen (bruges til navneskiltet)
function figurHoejde(valg) {
  const f = BILLED_FIGURER[valg.type] || BILLED_FIGURER.kvinde;
  const b = figurBillede(f.forfra);
  return b.naturalHeight ? b.naturalHeight * f.skala : 120;
}

// Alle figurer, man kan vælge i Garderoben: { id: "navn" }
function alleFigurer() {
  const liste = {};
  for (const id in BILLED_FIGURER) liste[id] = BILLED_FIGURER[id].navn;
  return liste;
}
