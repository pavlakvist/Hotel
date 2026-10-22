// =============================================================
//  PIXEL-FIGURERNE — her er figurerne tegnet, pixel for pixel.
// =============================================================
//
//  Hvert bogstav er én pixel. Du kan rette i tegningerne herunder
//  og se resultatet, når du gemmer og trykker F5 i browseren.
//
//    .  = gennemsigtig (ingen pixel)
//    O  = omrids (mørk kant)
//    H  = hår       h = mørkt hår     L = lyst hår (glans)
//    S  = hud       s = mørk hud      R = røde kinder
//    E  = øjne      W = hvid          M = mund
//    G  = guld (knapper, hårspænde, øreringe)
//    V  = vest      v = mørk vest
//    C  = skjorte   c = mørk skjorte
//    D  = nederdel/bukser             d = mørk nederdel/bukser
//    P  = strømpebukser
//    K  = sko
//
//  Farverne til H, S, V, D og K vælger du i "Garderobe" i spillet.
//  Alle linjer i en tegning skal være lige lange (20 tegn).
//  Figurerne er tegnet, så de kigger lidt mod højre. Mod venstre spejlvendes de.

const PIXEL_STOERRELSE = 2;   // hvor mange skærm-pixels én tegne-pixel fylder

const FASTE_FARVER = {
  O: "#2a1a1a",
  E: "#3b2016",
  W: "#ffffff",
  M: "#b03a3a",
  R: "#ee9a8f",
  G: "#e8b23a",
  C: "#f5f0e6",
  c: "#d9d2c3",
  P: "#4b3228",
};


// =============================================================
//  KVINDEN
// =============================================================
const KVINDE_HOVED_FORFRA = [
  ".......OOOOOO.......",
  "......OHHLHHHO......",
  "......OHHHHHhO......",
  ".......OGGGGO.......",
  "....OOOHHHHHHOOO....",
  "...OHHHHHLHHHHHHO...",
  "..OHHLHHHHHHHHLHHO..",
  "..OHHHHHHHHHHHHHHO..",
  ".OHHHHHHHHHHHHHHHhO.",
  ".OHHhSSSSSSSSSSHhHO.",
  ".OHhSSSSSSSSSSSShHO.",
  ".OHhSSSEESSSSEEShHO.",
  ".OHhSSSEWSSSSEWShHO.",
  ".OHhSSSEESSSSEEShHO.",
  ".OHhSRRSSSSSSSSRhHO.",
  ".OHhSSSSSSMMSSSShHO.",
  ".OHGSSSSSSSSSSSSGHO.",
  ".OHHOSSSSSSSSSSOHHO.",
  "..OHHOOSSSSSSOOHHO..",
  "..OHO..OsSSsO..OHO..",
];

const KVINDE_HOVED_BAGFRA = [
  ".......OOOOOO.......",
  "......OHHLHHHO......",
  "......OHHHHHhO......",
  ".......OGGGGO.......",
  "....OOOHHHHHHOOO....",
  "...OHHHHHLHHHHHHO...",
  "..OHHLHHHHHHHHLHHO..",
  "..OHHHHHHHHHHHHHHO..",
  ".OHHHHHHLHHHHHHHHhO.",
  ".OHHhHHHHHHHHHHHhHO.",
  ".OHhHHHHHHHLHHHHhHO.",
  ".OHhHHLHHHHHHHHHhHO.",
  ".OHhHHHHHHHHHHHHhHO.",
  ".OHhhHHHHHHHHHHhhHO.",
  ".OHhHHHHHLHHHHHHhHO.",
  ".OHhhHHHHHHHHHHhhHO.",
  ".OHhHHHHHHHHHHHHGHO.",
  ".OHHOhHHHHHHHHhOHHO.",
  "..OHHOOhhHHhhOOHHO..",
  "..OHO..OsSSsO..OHO..",
];

const KVINDE_KROP_FORFRA = [
  "....OOCCWCCWCCOO....",
  "...OCCOVCWWCVOCCO...",
  "...OCCOVVCCVVOCCO...",
  "...OCCOVVVGVVOCCO...",
  "...OCcOVVVVVvOcCO...",
  "...OCcOVVVGVvOcCO...",
  "...OSSOVVVVVvOSSO...",
  "...OOOOVVVGVvOOOO...",
  "......ODDDDDDO......",
  ".....ODDDDDDDDO.....",
  ".....ODdDDDDdDO.....",
  ".....OOOOOOOOOO.....",
];

const KVINDE_KROP_BAGFRA = [
  "....OOCCCCCCCCOO....",
  "...OCCOVVVVVVOCCO...",
  "...OCCOVVVVVVOCCO...",
  "...OCCOVVVVVVOCCO...",
  "...OCcOVVVVVvOcCO...",
  "...OCcOVvVVvVOcCO...",
  "...OSSOVVVVVvOSSO...",
  "...OOOOVVVVVvOOOO...",
  "......ODDDDDDO......",
  ".....ODDDDDDDDO.....",
  ".....ODdDDDDdDO.....",
  ".....OOOOOOOOOO.....",
];

const KVINDE_BEN_STAAR = [
  "......OPPOOPPO......",
  "......OPPOOPPO......",
  "......OPPOOPPO......",
  "......OKKOOKKO......",
  ".....OKKKOOKKKO.....",
  ".....OOOOOOOOOO.....",
];

const KVINDE_BEN_SKRIDT_1 = [
  "......OPPOOPPO......",
  "......OKKOOPPO......",
  ".....OKKKOOPPO......",
  ".....OOOOOOKKO......",
  "..........OKKKO.....",
  "..........OOOOO.....",
];

const KVINDE_BEN_SKRIDT_2 = [
  "......OPPOOPPO......",
  "......OPPOOKKO......",
  "......OPPOOKKKO.....",
  "......OKKOOOOOO.....",
  ".....OKKKO..........",
  ".....OOOOO..........",
];


// =============================================================
//  MANDEN
// =============================================================
const MAND_HOVED_FORFRA = [
  ".....OOOOOOOOOO.....",
  "....OHHLHHHHHHHO....",
  "...OHHHHHHHLHHHHO...",
  "..OHHHHHHHHHHHHHHO..",
  "..OHHHHHHHHHHHHHhO..",
  ".OHHhSSSSSSHHHHHhHO.",
  ".OHhSSSSSSSSSSSShHO.",
  ".OHhSSSOOSSSSOOShHO.",
  ".OHhSSSSSSSSSSSShHO.",
  ".OHhSSSEESSSSEEShHO.",
  ".OHhSSSEWSSSSEWShHO.",
  ".OOsSSSEESSSSEESsOO.",
  ".OSsSRRSSSSSSSSRsSO.",
  "..OsSSSSSMMSSSSSsO..",
  "..OOsSSSSSSSSSSsOO..",
  "....OOOsSSSSsOOO....",
  ".......OsSSsO.......",
];

const MAND_HOVED_BAGFRA = [
  ".....OOOOOOOOOO.....",
  "....OHHLHHHHHHHO....",
  "...OHHHHHHHLHHHHO...",
  "..OHHHHHHHHHHHHHHO..",
  "..OHHHHHLHHHHHHHhO..",
  ".OHHhHHHHHHHHHHHhHO.",
  ".OHhHHHHHHHHLHHHhHO.",
  ".OHhHHLHHHHHHHHHhHO.",
  ".OHhHHHHHHHHHHHHhHO.",
  ".OHhhHHHHHHHHHHhhHO.",
  ".OHhHHHHHHHHHHHHhHO.",
  ".OOsHHHHHHHHHHHHsOO.",
  ".OSsHHHHHHHHHHHHsSO.",
  "..OhHHHHHHHHHHHHhO..",
  "..OOhhHHHHHHHHhhOO..",
  "....OOOsSSSSsOOO....",
  ".......OsSSsO.......",
];

const MAND_KROP_FORFRA = [
  "....OOCCWCCWCCOO....",
  "...OCCOVCWWCVOCCO...",
  "...OCCOVVCCVVOCCO...",
  "...OCCOVVVGVVOCCO...",
  "...OCcOVVVVVvOcCO...",
  "...OCcOVVVGVvOcCO...",
  "...OSSOVVVVVvOSSO...",
  "...OOOOVVVGVvOOOO...",
  "......ODDDDDDO......",
  "......ODDDDDdO......",
  "......ODDOODdO......",
];

const MAND_KROP_BAGFRA = [
  "....OOCCCCCCCCOO....",
  "...OCCOVVVVVVOCCO...",
  "...OCCOVVVVVVOCCO...",
  "...OCCOVVVVVVOCCO...",
  "...OCcOVVVVVvOcCO...",
  "...OCcOVvVVvVOcCO...",
  "...OSSOVVVVVvOSSO...",
  "...OOOOVVVVVvOOOO...",
  "......ODDDDDDO......",
  "......ODDDDDdO......",
  "......ODDOODdO......",
];

// Manden har samme ben som kvinden, men med bukser (D) i stedet for strømper (P)
function medBukser(tegning) {
  return tegning.map(function (linje) { return linje.replace(/P/g, "D"); });
}


// =============================================================
//  Alle figurer samlet. Navnet bruges på knappen i Garderoben.
// =============================================================
const FIGURER = {
  kvinde: {
    navn: "Kvinde",
    hovedForfra: KVINDE_HOVED_FORFRA,
    hovedBagfra: KVINDE_HOVED_BAGFRA,
    kropForfra: KVINDE_KROP_FORFRA,
    kropBagfra: KVINDE_KROP_BAGFRA,
    benStaar: KVINDE_BEN_STAAR,
    benSkridt1: KVINDE_BEN_SKRIDT_1,
    benSkridt2: KVINDE_BEN_SKRIDT_2,
  },
  mand: {
    navn: "Mand",
    hovedForfra: MAND_HOVED_FORFRA,
    hovedBagfra: MAND_HOVED_BAGFRA,
    kropForfra: MAND_KROP_FORFRA,
    kropBagfra: MAND_KROP_BAGFRA,
    benStaar: medBukser(KVINDE_BEN_STAAR),
    benSkridt1: medBukser(KVINDE_BEN_SKRIDT_1),
    benSkridt2: medBukser(KVINDE_BEN_SKRIDT_2),
  },
};


// =============================================================
//  Tegn en figur
//    x, y:      hvor fødderne står på skærmen
//    farver:    { type, haar, hud, troeje, bukser, sko }
//    forfra:    true = kigger mod os, false = vender ryggen til
//    vendt:     1 = mod højre, -1 = mod venstre
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
// =============================================================
function tegnPixelFigur(c, x, y, farver, forfra, vendt, gaarTrin) {
  const f = FIGURER[farver.type] || FIGURER.kvinde;

  // Når figuren går, skifter benene: skridt, stå, andet skridt, stå
  let ben = f.benStaar;
  if (gaarTrin !== null) {
    ben = [f.benSkridt1, f.benStaar, f.benSkridt2, f.benStaar][Math.floor(gaarTrin) % 4];
  }
  const tegning = forfra
    ? f.hovedForfra.concat(f.kropForfra, ben)
    : f.hovedBagfra.concat(f.kropBagfra, ben);

  const palet = Object.assign({}, FASTE_FARVER, {
    H: farver.haar,   h: nuance(farver.haar, 0.75),  L: nuance(farver.haar, 1.35),
    S: farver.hud,    s: nuance(farver.hud, 0.82),
    V: farver.troeje, v: nuance(farver.troeje, 0.75),
    D: farver.bukser, d: nuance(farver.bukser, 0.75),
    K: farver.sko,
  });

  const p = PIXEL_STOERRELSE;
  const bredde = tegning[0].length;
  // Figuren hopper en lille smule op, mens den går
  const hop = gaarTrin !== null && Math.floor(gaarTrin) % 2 === 1 ? p : 0;
  const venstreKant = Math.round(x - (bredde * p) / 2);
  const topKant = Math.round(y - tegning.length * p - hop);

  for (let raekke = 0; raekke < tegning.length; raekke++) {
    for (let kolonne = 0; kolonne < bredde; kolonne++) {
      const tegn = tegning[raekke][kolonne];
      if (tegn === "." || !palet[tegn]) continue;
      // Spejlvend, hvis figuren kigger mod venstre
      const k = vendt < 0 ? bredde - 1 - kolonne : kolonne;
      c.fillStyle = palet[tegn];
      c.fillRect(venstreKant + k * p, topKant + raekke * p, p, p);
    }
  }
}

// Hvor høj en figur er på skærmen (bruges til navneskiltet)
function figurHoejde(type) {
  const f = FIGURER[type] || FIGURER.kvinde;
  return (f.hovedForfra.length + f.kropForfra.length + f.benStaar.length) * PIXEL_STOERRELSE;
}
