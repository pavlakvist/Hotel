// =============================================================
//  INDSTILLINGER — her bestemmer DU, hvordan hotellet ser ud.
// =============================================================
//
//  Vil du bruge din egen grafik?
//  1. Læg dit billede (helst .png med gennemsigtig baggrund) i mappen "billeder".
//  2. Skriv stien til billedet ved "billede", fx  billede: "billeder/min-stol.png"
//  3. Gem filen og genindlæs siden i browseren (F5).
//
//  Står der  billede: ""  bliver der tegnet en simpel reserve-tegning i stedet.
//  Læs mere i billeder/LAES-MIG.txt


// ----- Rummet -----
const RUM = {
  bredde: 10,              // antal felter fra venstre mod højre
  dybde: 10,               // antal felter bagud
  gulvFarve1: "#d8b47a",   // gulvet skifter mellem to farver, som et skakbræt
  gulvFarve2: "#c9a46c",
  vaegFarve: "#86b3dd",
  gulvBillede: "",         // fx "billeder/gulv.png" (64 x 32 pixels, rudeformet)
};


// ----- Din figur -----
//  Hvilken figur du starter med. I spillet kan du skifte under "Garderobe".
//  Figurerne er lavet af billeder i mappen "billeder" (se js/figur.js).
const FIGUR = {
  navn: "Pavla",
  type: "kvinde",          // "kvinde" eller "mand"
  billede: "",             // et helt andet billede af figuren (bruges i stedet, hvis du skriver et her)
  fart: 3,                 // hvor mange felter figuren går pr. sekund
};


// ----- Møbler -----
//  id:        et kort navn uden mellemrum og æ/ø/å (bruges inde i koden)
//  navn:      det navn, der står på knappen
//  billede:   sti til dit eget billede (eller "" for reserve-tegning)
//  tegning:   hvilken reserve-tegning der bruges: stol, bord, sofa, lampe, plante, taeppe
//  farve:     farven på reserve-tegningen
//  kanGaaPaa: true = figuren kan gå hen over møblet (fx et tæppe)
//
//  Du kan sagtens tilføje flere møbler: kopiér en linje og ret den til.
const MOEBLER = [
  { id: "stol",   navn: "Stol",   billede: "", tegning: "stol",   farve: "#c0392b" },
  { id: "bord",   navn: "Bord",   billede: "", tegning: "bord",   farve: "#a0703c" },
  { id: "sofa",   navn: "Sofa",   billede: "", tegning: "sofa",   farve: "#6c5ce7" },
  { id: "lampe",  navn: "Lampe",  billede: "", tegning: "lampe",  farve: "#f9e076" },
  { id: "plante", navn: "Plante", billede: "", tegning: "plante", farve: "#2ecc71" },
  { id: "taeppe", navn: "Tæppe",  billede: "", tegning: "taeppe", farve: "#e17055", kanGaaPaa: true },
];
