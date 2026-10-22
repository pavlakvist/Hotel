// =============================================================
//  PIXEL-FIGURERNE — her er figurerne tegnet, pixel for pixel.
// =============================================================
//
//  Hvert bogstav er én pixel. Du kan rette i tegningerne længere nede
//  og se resultatet, når du gemmer og trykker F5 i browseren.
//
//    .  = gennemsigtig (ingen pixel)
//    O  = kant. Kanten får automatisk en mørk udgave af farven ved siden af,
//         så den ikke er helt sort. Det er det, der får figuren til at se moderne ud.
//    H  = hår       h = mørkt hår      L = lyst hår (glans)
//    S  = hud       s = mørk hud       R = røde kinder
//    E  = øjne      e = brun i øjnene  W = hvidt glimt i øjnene
//    M  = mund      m = lys mund
//    G  = guld      g = mørkt guld (knapper, spænde, øreringe, navneskilt)
//    V  = vest      v = mørk vest      U = lys vest
//    C  = skjorte   c = mørk skjorte
//    D  = nederdel/bukser  d = mørk  F = lys
//    P  = strømpebukser    p = mørke strømpebukser
//    K  = sko       k = lys sko (glans)
//
//  Farverne til H, S, V, D og K vælger du i "Garderobe" i spillet.
//  De mørke og lyse udgaver regnes automatisk ud fra dem.
//  Alle linjer i en tegning skal være lige lange (26 tegn).
//
//  Hver figur har 6 tegninger: forfra og bagfra, og for hver af dem
//  én hvor den står, og to skridt. Mod venstre spejlvendes figuren.

const PIXEL_STOERRELSE = 2;   // hvor mange skærm-pixels én tegne-pixel fylder

const FASTE_FARVER = {
  E: "#3b2016",
  e: "#7a4a2a",
  W: "#ffffff",
  M: "#c0504a",
  m: "#e7837a",
  R: "#f29b8f",
  G: "#f0c14b",
  g: "#b9862a",
  C: "#f7f3ea",
  c: "#d8cfbf",
  P: "#4b3228",
  p: "#3a261e",
};

// Mørke og lyse udgaver af Garderobe-farverne: [bogstav, hvor meget lysere/mørkere]
const AFLEDTE_FARVER = {
  h: ["H", 0.72], L: ["H", 1.35],
  s: ["S", 0.85],
  v: ["V", 0.72], U: ["V", 1.25],
  d: ["D", 0.75], F: ["D", 1.3],
  k: ["K", 2.2],
};

// =============================================================
//  Tegningerne
// =============================================================

const KVINDE = {
  navn: "Kvinde",

  forfraStaar: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHssSSSSSSSSSSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "OHHhHsSEEEESSSSEEEEsshhhhO",
    "OhHHHSSSWEeSSSSWEeSsshhhhO",
    "OhhHHSSSeEeSSSSeEeSsshhhhO",
    "OhhhHHSSeeeSSSSeeeSsshhhhO",
    "OhhhhGSRRSSSSSSSSRRssGhhhO",
    "OhhhhgOSSSSSMMMSSSSshghhhO",
    ".OhhhhOOSSSSSmSSSSSOhhhhO.",
    ".OhhhO..OSSSSSSSSSO.OhhhO.",
    "OhhhhO.OOOOSSSSSOOOOOhhhhO",
    ".OhhhOOCCCCWCcCWCCCCOhhhO.",
    ".OhhhOOUVVCCCcCCCvvvOhhhO.",
    "..OOcCCUVVVCCcCCVvvvCCcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcccUVVVVVGVVVvvvcccO..",
    "...OSSSUVVVVVVVVVvvvSSSO..",
    "...OSSsOVVVVVvVVVVVOSSsO..",
    "....OOOODDDDDDDDDdddOOO...",
    ".......OFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    ".......OKKkKKOKkKKKO......",
    ".......OKKKKKOKKKKKO......",
    "........OOOOO.OOOOO.......",
  ],
  forfraSkridt1: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHssSSSSSSSSSSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "OHHhHsSEEEESSSSEEEEsshhhhO",
    "OhHHHSSSWEeSSSSWEeSsshhhhO",
    "OhhHHSSSeEeSSSSeEeSsshhhhO",
    "OhhhHHSSeeeSSSSeeeSsshhhhO",
    "OhhhhGSRRSSSSSSSSRRssGhhhO",
    "OhhhhgOSSSSSMMMSSSSshghhhO",
    ".OhhhhOOSSSSSmSSSSSOhhhhO.",
    ".OhhhO..OSSSSSSSSSO.OhhhO.",
    "OhhhhO.OOOOSSSSSOOOOOhhhhO",
    ".OhhhOOCCCCWCcCWCCCCOhhhO.",
    ".OhhhOOUVVCCCcCCCvvvOhhhO.",
    "..OOcCCUVVVCCcCCVvvvCOcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvcccO..",
    "...OcCCUVVVVVGVVVvvvSSSO..",
    "...OcccUVVVVVVVVVvvvSSsO..",
    "...OSSSOVVVVVvVVVVVOOOO...",
    "...OSSsODDDDDDDDDdddO.....",
    "....OOOOFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    ".......OOPPPpOPPPpO.......",
    "......OKKkKKOOPPPpO.......",
    "......OKKKKKOOPPPpO.......",
    ".......OOOOO.OKkKKKO......",
    ".............OKKKKKO......",
    "..............OOOOO.......",
  ],
  forfraSkridt2: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHssSSSSSSSSSSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "OHHhHsSEEEESSSSEEEEsshhhhO",
    "OhHHHSSSWEeSSSSWEeSsshhhhO",
    "OhhHHSSSeEeSSSSeEeSsshhhhO",
    "OhhhHHSSeeeSSSSeeeSsshhhhO",
    "OhhhhGSRRSSSSSSSSRRssGhhhO",
    "OhhhhgOSSSSSMMMSSSSshghhhO",
    ".OhhhhOOSSSSSmSSSSSOhhhhO.",
    ".OhhhO..OSSSSSSSSSO.OhhhO.",
    "OhhhhO.OOOOSSSSSOOOOOhhhhO",
    ".OhhhOOCCCCWCcCWCCCCOhhhO.",
    ".OhhhOOUVVCCCcCCCvvvOhhhO.",
    "..OOcOCUVVVCCcCCVvvvCCcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcccUVVVVVVVVVvvvCCcO..",
    "...OSSSUVVVVVGVVVvvvCCcO..",
    "...OSSsUVVVVVVVVVvvvcccO..",
    "....OOOOVVVVVvVVVVVOSSSO..",
    ".......ODDDDDDDDDdddSSsO..",
    ".......OFDDDDDDDDdddOOO...",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpOO......",
    "........OPPPpOOKkKKKO.....",
    "........OPPPpOOKKKKKO.....",
    ".......OKKkKKO.OOOOO......",
    ".......OKKKKKO............",
    "........OOOOO.............",
  ],
  bagfraStaar: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "OhhhhhhhLLLLHHHHHhhhhhhhhO",
    "OhhhhhhhHHHHHHHHhhhhhhhhhO",
    "OhhhhhhhHHHHHHHhhhhhhhhhhO",
    "OhhhhhhhHHHHHHhhhhhhhhhhhO",
    "OhhhhGhhHHHhhhhhhhhhhGhhhO",
    "OhhhhhOhhhhhhhhhhhhOhhhhhO",
    ".OhhhhOOOhhhhhhhhOOOhhhhO.",
    ".OhhhO...OOOOOOOO...OhhhO.",
    "OhhhhO.OOOOsssssOOOOOhhhhO",
    ".OhhhOOCCCCCCCCCCCCCOhhhO.",
    ".OhhhOOUVVVVVVVVVvvvOhhhO.",
    "..OOcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVvvGvvVvvvCCcO..",
    "...OcccUVVVVVvVVVvvvcccO..",
    "...OSSSUVVVVVvVVVvvvSSSO..",
    "...OSSsOVVVVVVVVVVVOSSsO..",
    "....OOOODDDDDDDDDdddOOO...",
    ".......OFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    ".......OKKkKKOKkKKKO......",
    ".......OKKKKKOKKKKKO......",
    "........OOOOO.OOOOO.......",
  ],
  bagfraSkridt1: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "OhhhhhhhLLLLHHHHHhhhhhhhhO",
    "OhhhhhhhHHHHHHHHhhhhhhhhhO",
    "OhhhhhhhHHHHHHHhhhhhhhhhhO",
    "OhhhhhhhHHHHHHhhhhhhhhhhhO",
    "OhhhhGhhHHHhhhhhhhhhhGhhhO",
    "OhhhhhOhhhhhhhhhhhhOhhhhhO",
    ".OhhhhOOOhhhhhhhhOOOhhhhO.",
    ".OhhhO...OOOOOOOO...OhhhO.",
    "OhhhhO.OOOOsssssOOOOOhhhhO",
    ".OhhhOOCCCCCCCCCCCCCOhhhO.",
    ".OhhhOOUVVVVVVVVVvvvOhhhO.",
    "..OOcCCUVVVVVvVVVvvvCOcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVvvGvvVvvvcccO..",
    "...OcCCUVVVVVvVVVvvvSSSO..",
    "...OcccUVVVVVvVVVvvvSSsO..",
    "...OSSSOVVVVVVVVVVVOOOO...",
    "...OSSsODDDDDDDDDdddO.....",
    "....OOOOFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    ".......OOPPPpOPPPpO.......",
    "......OKKkKKOOPPPpO.......",
    "......OKKKKKOOPPPpO.......",
    ".......OOOOO.OKkKKKO......",
    ".............OKKKKKO......",
    "..............OOOOO.......",
  ],
  bagfraSkridt2: [
    "...........OOOO...........",
    ".........OOHHHHOO.........",
    "........OHHLLHHhhO........",
    "........OHLLLLHhhO........",
    "........OHHHHHHhhO........",
    "........OHHHHHHhhO........",
    ".........OHHHHHhO.........",
    ".......OOHGGGGGggOO.......",
    ".....OOHHHHHHHHHHHHOO.....",
    "....OHHHHHHHHHHHHHHHhO....",
    "....OHHLLLLHHHHHHHHHhO....",
    "...OHHLLLLLLHHHHHHHHhhO...",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    "..OHHHHHHHHHHHHHHHHhhhhO..",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "OhhhhhhhLLLLHHHHHhhhhhhhhO",
    "OhhhhhhhHHHHHHHHhhhhhhhhhO",
    "OhhhhhhhHHHHHHHhhhhhhhhhhO",
    "OhhhhhhhHHHHHHhhhhhhhhhhhO",
    "OhhhhGhhHHHhhhhhhhhhhGhhhO",
    "OhhhhhOhhhhhhhhhhhhOhhhhhO",
    ".OhhhhOOOhhhhhhhhOOOhhhhO.",
    ".OhhhO...OOOOOOOO...OhhhO.",
    "OhhhhO.OOOOsssssOOOOOhhhhO",
    ".OhhhOOCCCCCCCCCCCCCOhhhO.",
    ".OhhhOOUVVVVVVVVVvvvOhhhO.",
    "..OOcOCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcccUVVVvvGvvVvvvCCcO..",
    "...OSSSUVVVVVvVVVvvvCCcO..",
    "...OSSsUVVVVVvVVVvvvcccO..",
    "....OOOOVVVVVVVVVVVOSSSO..",
    ".......ODDDDDDDDDdddSSsO..",
    ".......OFDDDDDDDDdddOOO...",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......ODFDDDDDDDDdddO.....",
    "......OdddddddddddddO.....",
    ".......OOPPPpOPPPpOO......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpO.......",
    "........OPPPpOPPPpOO......",
    "........OPPPpOOKkKKKO.....",
    "........OPPPpOOKKKKKO.....",
    ".......OKKkKKO.OOOOO......",
    ".......OKKKKKO............",
    "........OOOOO.............",
  ],
};

const MAND = {
  navn: "Mand",

  forfraStaar: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHshhhSSSShhhSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "..OHHsSSEEESSSSEEESsshhO..",
    "..OHHSSSWEeSSSSWEeSsshhO..",
    "...OHSSSeEeSSSSeEeSsshO...",
    "....OHSSeeeSSSSeeeSssO....",
    "....OhSRRSSSSSSSSRRssO....",
    ".....OOSSSSSMMMSSSSsO.....",
    ".......OSSSSSmSSSSSO......",
    "........OSSSSSSSSSO.......",
    ".......OOOOSSSSSOOOO......",
    "......OCCCCWCcCWCCCCO.....",
    "....OOOUVVCCCcCCCvvvOOO...",
    "...OcCCUVVVCCcCCVvvvCCcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcccUVVVVVGVVVvvvcccO..",
    "...OSSSUVVVVVVVVVvvvSSSO..",
    "...OSSsOVVVVVvVVVVVOSSsO..",
    "....OOOOkkkkkGkkkkkOOOO...",
    ".......ODDDDDDDDDDDO......",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    ".......OKKkKKOKkKKKO......",
    ".......OKKKKKOKKKKKO......",
    "........OOOOO.OOOOO.......",
  ],
  forfraSkridt1: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHshhhSSSShhhSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "..OHHsSSEEESSSSEEESsshhO..",
    "..OHHSSSWEeSSSSWEeSsshhO..",
    "...OHSSSeEeSSSSeEeSsshO...",
    "....OHSSeeeSSSSeeeSssO....",
    "....OhSRRSSSSSSSSRRssO....",
    ".....OOSSSSSMMMSSSSsO.....",
    ".......OSSSSSmSSSSSO......",
    "........OSSSSSSSSSO.......",
    ".......OOOOSSSSSOOOO......",
    "......OCCCCWCcCWCCCCO.....",
    "....OOOUVVCCCcCCCvvvO.O...",
    "...OcCCUVVVCCcCCVvvvCOcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvcccO..",
    "...OcCCUVVVVVGVVVvvvSSSO..",
    "...OcccUVVVVVVVVVvvvSSsO..",
    "...OSSSOVVVVVvVVVVVOOOO...",
    "...OSSsOkkkkkGkkkkkO......",
    "....OOOODDDDDDDDDDDO......",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    ".......OODDDdODDDdO.......",
    "......OKKkKKOODDDdO.......",
    "......OKKKKKOODDDdO.......",
    ".......OOOOO.OKkKKKO......",
    ".............OKKKKKO......",
    "..............OOOOO.......",
  ],
  forfraSkridt2: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHHLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHssssssssssshhhhO.",
    ".OHHHHHshhhSSSShhhSsshhhO.",
    ".OHHHHsSSSSSSSSSSSSsshhhO.",
    "..OHHsSSEEESSSSEEESsshhO..",
    "..OHHSSSWEeSSSSWEeSsshhO..",
    "...OHSSSeEeSSSSeEeSsshO...",
    "....OHSSeeeSSSSeeeSssO....",
    "....OhSRRSSSSSSSSRRssO....",
    ".....OOSSSSSMMMSSSSsO.....",
    ".......OSSSSSmSSSSSO......",
    "........OSSSSSSSSSO.......",
    ".......OOOOSSSSSOOOO......",
    "......OCCCCWCcCWCCCCO.....",
    "....O.OUVVCCCcCCCvvvOOO...",
    "...OcOCUVVVCCcCCVvvvCCcO..",
    "...OcCCUVVVVCcCGGgvvCCcO..",
    "...OcCCUVVVVVcVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcCCUVVVVVVVVVvvvCCcO..",
    "...OcCCUVVVVVGVVVvvvCCcO..",
    "...OcccUVVVVVVVVVvvvCCcO..",
    "...OSSSUVVVVVGVVVvvvCCcO..",
    "...OSSsUVVVVVVVVVvvvcccO..",
    "....OOOOVVVVVvVVVVVOSSSO..",
    ".......OkkkkkGkkkkkOSSsO..",
    ".......ODDDDDDDDDDDOOOO...",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdOO......",
    "........ODDDdOOKkKKKO.....",
    "........ODDDdOOKKKKKO.....",
    ".......OKKkKKO.OOOOO......",
    ".......OKKKKKO............",
    "........OOOOO.............",
  ],
  bagfraStaar: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "..OhhhhhLLLLHHHHHhhhhhhO..",
    "..OShhhhHHHHHHHHhhhhhhhSO.",
    "...OhhhhHHHHHHHhhhhhhhOO..",
    "....OhhhHHHHHHhhhhhhhO....",
    "....OhhhHHHhhhhhhhhhhO....",
    ".....OOhhhhhhhhhhhhOO.....",
    ".......OOhhhhhhhhOO.......",
    ".........OOOOOOOO.........",
    ".......OOOOsssssOOOO......",
    "......OCCCCCCCCCCCCCO.....",
    "....OOOUVVVVVVVVVvvvOOO...",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVvvGvvVvvvCCcO..",
    "...OcccUVVVVVvVVVvvvcccO..",
    "...OSSSUVVVVVvVVVvvvSSSO..",
    "...OSSsOVVVVVVVVVVVOSSsO..",
    "....OOOOkkkkkGkkkkkOOOO...",
    ".......ODDDDDDDDDDDO......",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    ".......OKKkKKOKkKKKO......",
    ".......OKKKKKOKKKKKO......",
    "........OOOOO.OOOOO.......",
  ],
  bagfraSkridt1: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "..OhhhhhLLLLHHHHHhhhhhhO..",
    "..OShhhhHHHHHHHHhhhhhhhSO.",
    "...OhhhhHHHHHHHhhhhhhhOO..",
    "....OhhhHHHHHHhhhhhhhO....",
    "....OhhhHHHhhhhhhhhhhO....",
    ".....OOhhhhhhhhhhhhOO.....",
    ".......OOhhhhhhhhOO.......",
    ".........OOOOOOOO.........",
    ".......OOOOsssssOOOO......",
    "......OCCCCCCCCCCCCCO.....",
    "....OOOUVVVVVVVVVvvvO.O...",
    "...OcCCUVVVVVvVVVvvvCOcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVvvGvvVvvvcccO..",
    "...OcCCUVVVVVvVVVvvvSSSO..",
    "...OcccUVVVVVvVVVvvvSSsO..",
    "...OSSSOVVVVVVVVVVVOOOO...",
    "...OSSsOkkkkkGkkkkkO......",
    "....OOOODDDDDDDDDDDO......",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    ".......OODDDdODDDdO.......",
    "......OKKkKKOODDDdO.......",
    "......OKKKKKOODDDdO.......",
    ".......OOOOO.OKkKKKO......",
    ".............OKKKKKO......",
    "..............OOOOO.......",
  ],
  bagfraSkridt2: [
    ".....OOOOOOOO.............",
    "...OOHHHHHHHHOOOO.........",
    "..OHHHLLLLLHHHHHHOOO......",
    "..OHHHLLLLLHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHhO....",
    "...OHHHLLLLHHHHHHHHHhhO...",
    "..OHHHLLLLLLHHHHHHHHhhhO..",
    "..OHHHHLLLLHHHHLLLHhhhhO..",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OHHHHHHHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHHhhhhhO.",
    ".OhhhhhhHHHHHHHHHHhhhhhhO.",
    ".OhhhhhhLLLLHHHHHHhhhhhhO.",
    "..OhhhhhLLLLHHHHHhhhhhhO..",
    "..OShhhhHHHHHHHHhhhhhhhSO.",
    "...OhhhhHHHHHHHhhhhhhhOO..",
    "....OhhhHHHHHHhhhhhhhO....",
    "....OhhhHHHhhhhhhhhhhO....",
    ".....OOhhhhhhhhhhhhOO.....",
    ".......OOhhhhhhhhOO.......",
    ".........OOOOOOOO.........",
    ".......OOOOsssssOOOO......",
    "......OCCCCCCCCCCCCCO.....",
    "....O.OUVVVVVVVVVvvvOOO...",
    "...OcOCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcCCUVVVVVvVVVvvvCCcO..",
    "...OcccUVVVvvGvvVvvvCCcO..",
    "...OSSSUVVVVVvVVVvvvCCcO..",
    "...OSSsUVVVVVvVVVvvvcccO..",
    "....OOOOVVVVVVVVVVVOSSSO..",
    ".......OkkkkkGkkkkkOSSsO..",
    ".......ODDDDDDDDDDDOOOO...",
    ".......ODDDDDDDDDDDO......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdO.......",
    "........ODDDdODDDdOO......",
    "........ODDDdOOKkKKKO.....",
    "........ODDDdOOKKKKKO.....",
    ".......OKKkKKO.OOOOO......",
    ".......OKKKKKO............",
    "........OOOOO.............",
  ],
};


// =============================================================
//  Alle figurer samlet. Navnet bruges på knappen i Garderoben.
// =============================================================
const FIGURER = {
  kvinde: KVINDE,
  mand: MAND,
};


// =============================================================
//  Sådan bliver bogstaverne til et billede
// =============================================================

// Lav om fra "#rrggbb" til [r, g, b], gjort lysere/mørkere med faktor
function farveTal(hex, faktor) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
    return Math.min(255, Math.round(v * faktor));
  });
}

// Lukkede øjne: alt i øjnene bliver til hud, undtagen nederste linje
function blinkendeTegning(tegning) {
  let nederst = -1;
  tegning.forEach(function (linje, i) { if (linje.indexOf("e") >= 0) nederst = i; });
  return tegning.map(function (linje, i) {
    if (i > nederst) return linje;
    return linje.replace(/[EeW]/g, i === nederst ? "E" : "S");
  });
}

// Tegner bogstaverne ind på et lille lærred (kun når noget har ændret sig)
const figurLager = new Map();

function lavFigurBillede(tegning, farver) {
  const noegle = tegning.join("") + JSON.stringify(farver);
  if (figurLager.has(noegle)) return figurLager.get(noegle);

  const basis = { H: farver.haar, S: farver.hud, V: farver.troeje, D: farver.bukser, K: farver.sko };
  function rgb(tegn) {
    if (basis[tegn]) return farveTal(basis[tegn], 1);
    if (FASTE_FARVER[tegn]) return farveTal(FASTE_FARVER[tegn], 1);
    if (AFLEDTE_FARVER[tegn]) {
      const [fra, faktor] = AFLEDTE_FARVER[tegn];
      return farveTal(basis[fra], faktor);
    }
    return null;
  }

  const hoejde = tegning.length;
  const bredde = tegning[0].length;
  const laer = document.createElement("canvas");
  laer.width = bredde;
  laer.height = hoejde;
  const c = laer.getContext("2d");

  for (let y = 0; y < hoejde; y++) {
    for (let x = 0; x < bredde; x++) {
      const tegn = tegning[y][x];
      if (tegn === ".") continue;
      let farve;
      if (tegn === "O") {
        // Kanten: en mørk udgave af farven ved siden af
        farve = [42, 26, 26];
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
          const nabo = (tegning[y + dy] || "")[x + dx];
          const naboFarve = nabo && nabo !== "." && nabo !== "O" ? rgb(nabo) : null;
          if (naboFarve) {
            farve = naboFarve.map(function (v) { return Math.round(v * 0.45); });
            break;
          }
        }
      } else {
        farve = rgb(tegn);
      }
      if (!farve) continue;
      c.fillStyle = "rgb(" + farve.join(",") + ")";
      c.fillRect(x, y, 1, 1);
    }
  }
  figurLager.set(noegle, laer);
  return laer;
}


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
  const tid = performance.now();
  let tegning;
  let hop = 0;

  if (gaarTrin === null) {
    tegning = forfra ? f.forfraStaar : f.bagfraStaar;
    // Vejrtrækning: figuren løfter sig en lille smule op og ned
    hop = Math.floor(tid / 800) % 2;
  } else {
    const skridt = forfra
      ? [f.forfraSkridt1, f.forfraStaar, f.forfraSkridt2, f.forfraStaar]
      : [f.bagfraSkridt1, f.bagfraStaar, f.bagfraSkridt2, f.bagfraStaar];
    const nr = Math.floor(gaarTrin) % 4;
    tegning = skridt[nr];
    hop = nr % 2 === 1 ? PIXEL_STOERRELSE : 0;
  }

  // Blink med øjnene ca. hvert 3. sekund
  if (forfra && tid % 3200 < 140) tegning = blinkendeTegning(tegning);

  const billede = lavFigurBillede(tegning, farver);
  const p = PIXEL_STOERRELSE;
  const b = billede.width * p;
  const h = billede.height * p;

  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(x), Math.round(y - hop));
  if (vendt < 0) c.scale(-1, 1);
  c.drawImage(billede, -Math.round(b / 2), -h, b, h);
  c.restore();
}

// Hvor høj en figur er på skærmen (bruges til navneskiltet)
function figurHoejde(type) {
  const f = FIGURER[type] || FIGURER.kvinde;
  return f.forfraStaar.length * PIXEL_STOERRELSE;
}
