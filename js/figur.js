// =============================================================
//  FIGURERNE
// =============================================================
//
//  Figurerne er dine egne tegninger, klippet ud af dit ark med 8 retninger.
//  Billederne ligger i mappen "billeder/figurer".
//
//  Retningerne er, som figuren ser ud på skærmen:
//    ned, ned-hoejre, hoejre, op-hoejre, op, op-venstre, venstre, ned-venstre
//
//  gaa:    fire billeder pr. retning, som vises efter hinanden, når figuren går.
//          Det første billede bruges også, når figuren står stille.
//  sidder: ét billede pr. retning af figuren, der sidder.
//  anker:  det punkt på billedet (i pixels), der skal stå på gulvet.
//          For "sidder" er det numsen, som skal ramme sædet.
//  skala:  hvor store billederne tegnes. Alle billeder af samme figur har
//          samme skala, så figuren ikke skifter størrelse, når den går.

const FIGURER = {
  kvinde: {
    navn: "Kvinde",
    skala: 0.87,
    raekke: "alle",                   // alle hendes gå-billeder vises efter hinanden
    gaa: {
      "ned": [{ fil: "billeder/figurer/kvinde3-gaa-ned-1.png", anker: [37.5, 137] }, { fil: "billeder/figurer/kvinde3-gaa-ned-2.png", anker: [38.5, 137] }, { fil: "billeder/figurer/kvinde3-gaa-ned-3.png", anker: [38.5, 137] }, { fil: "billeder/figurer/kvinde3-gaa-ned-4.png", anker: [37.5, 135] }],
      "ned-hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-1.png", anker: [38.5, 130] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-2.png", anker: [39.5, 130] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-3.png", anker: [38.5, 130] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-4.png", anker: [40.5, 130] }],
      "hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-hoejre-1.png", anker: [38.0, 127] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-2.png", anker: [39.0, 127] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-3.png", anker: [39.0, 128] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-4.png", anker: [39.5, 128] }],
      "op-hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-op-hoejre-1.png", anker: [38.0, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-2.png", anker: [38.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-3.png", anker: [37.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-4.png", anker: [38.0, 134] }],
      "op": [{ fil: "billeder/figurer/kvinde3-gaa-op-1.png", anker: [38.0, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-2.png", anker: [38.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-3.png", anker: [37.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-4.png", anker: [38.0, 134] }],
      "op-venstre": [{ fil: "billeder/figurer/kvinde3-gaa-op-venstre-1.png", anker: [38.0, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-2.png", anker: [38.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-3.png", anker: [37.5, 134] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-4.png", anker: [38.0, 134] }],
      "venstre": [{ fil: "billeder/figurer/kvinde3-gaa-venstre-1.png", anker: [36.5, 131] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-2.png", anker: [37.0, 131] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-3.png", anker: [37.5, 131] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-4.png", anker: [36.5, 131] }],
      "ned-venstre": [{ fil: "billeder/figurer/kvinde3-gaa-ned-venstre-1.png", anker: [39.0, 138] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-2.png", anker: [38.5, 138] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-3.png", anker: [38.5, 138] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-4.png", anker: [38.0, 138] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/kvinde-sidder-0.png", anker: [33.0, 122.1] },
      "ned-hoejre": { fil: "billeder/figurer/kvinde3-stol-ned-hoejre.png", anker: [39.4, 104.5] },
      "hoejre": { fil: "billeder/figurer/kvinde-sidder-2.png", anker: [38.0, 122.1] },
      "op-hoejre": { fil: "billeder/figurer/kvinde-sidder-3.png", anker: [37.0, 122.1] },
      "op": { fil: "billeder/figurer/kvinde-sidder-4.png", anker: [33.0, 104.9] },
      "op-venstre": { fil: "billeder/figurer/kvinde-sidder-5.png", anker: [38.5, 122.1] },
      "venstre": { fil: "billeder/figurer/kvinde-sidder-6.png", anker: [39.5, 121.3] },
      "ned-venstre": { fil: "billeder/figurer/kvinde3-stol-ned-venstre.png", anker: [48.6, 104.5] },
    },
  },
  mand: {
    navn: "Mand",
    skala: 0.79,
    raekke: "alle",                   // alle hans gå-billeder vises efter hinanden
    gaa: {
      "ned": [{ fil: "billeder/figurer/mand3-gaa-ned-1.png", anker: [46.5, 146] }, { fil: "billeder/figurer/mand3-gaa-ned-2.png", anker: [48.0, 148] }, { fil: "billeder/figurer/mand3-gaa-ned-3.png", anker: [48.0, 148] }, { fil: "billeder/figurer/mand3-gaa-ned-4.png", anker: [46.5, 146] }],
      "ned-hoejre": [{ fil: "billeder/figurer/mand3-gaa-ned-hoejre-1.png", anker: [45.5, 140] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-2.png", anker: [45.0, 140] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-3.png", anker: [47.5, 140] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-4.png", anker: [46.5, 138] }],
      "hoejre": [{ fil: "billeder/figurer/mand3-gaa-hoejre-1.png", anker: [45.5, 138] }, { fil: "billeder/figurer/mand3-gaa-hoejre-2.png", anker: [46.0, 138] }, { fil: "billeder/figurer/mand3-gaa-hoejre-3.png", anker: [46.5, 138] }, { fil: "billeder/figurer/mand3-gaa-hoejre-4.png", anker: [46.5, 137] }],
      "op-hoejre": [{ fil: "billeder/figurer/mand3-gaa-op-hoejre-1.png", anker: [45.5, 137] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-2.png", anker: [46.0, 135] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-3.png", anker: [46.5, 137] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-4.png", anker: [45.5, 137] }],
      "op": [{ fil: "billeder/figurer/mand3-gaa-op-1.png", anker: [46.0, 141] }, { fil: "billeder/figurer/mand3-gaa-op-2.png", anker: [45.0, 140] }, { fil: "billeder/figurer/mand3-gaa-op-3.png", anker: [45.0, 140] }, { fil: "billeder/figurer/mand3-gaa-op-4.png", anker: [44.0, 141] }],
      "op-venstre": [{ fil: "billeder/figurer/mand3-gaa-op-venstre-1.png", anker: [45.5, 137] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-2.png", anker: [45.0, 135] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-3.png", anker: [46.5, 137] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-4.png", anker: [45.5, 137] }],
      "venstre": [{ fil: "billeder/figurer/mand3-gaa-venstre-1.png", anker: [46.5, 141] }, { fil: "billeder/figurer/mand3-gaa-venstre-2.png", anker: [47.0, 143] }, { fil: "billeder/figurer/mand3-gaa-venstre-3.png", anker: [48.5, 143] }, { fil: "billeder/figurer/mand3-gaa-venstre-4.png", anker: [46.5, 141] }],
      "ned-venstre": [{ fil: "billeder/figurer/mand3-gaa-ned-venstre-1.png", anker: [47.0, 152] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-2.png", anker: [48.0, 151] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-3.png", anker: [47.0, 152] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-4.png", anker: [47.0, 154] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/mand-sidder-0.png", anker: [41.0, 134.2] },
      "ned-hoejre": { fil: "billeder/figurer/mand3-stol-ned-hoejre.png", anker: [45.4, 120.0] },
      "hoejre": { fil: "billeder/figurer/mand-sidder-2.png", anker: [43.5, 131.6] },
      "op-hoejre": { fil: "billeder/figurer/mand-sidder-3.png", anker: [44.5, 130.7] },
      "op": { fil: "billeder/figurer/mand-sidder-4.png", anker: [40.0, 114.4] },
      "op-venstre": { fil: "billeder/figurer/mand-sidder-5.png", anker: [47.0, 130.7] },
      "venstre": { fil: "billeder/figurer/mand-sidder-6.png", anker: [47.0, 128.1] },
      "ned-venstre": { fil: "billeder/figurer/mand3-stol-ned-venstre.png", anker: [55.6, 120.0] },
    },
  },
};

// Rækkefølgen af gå-billederne: 1, 2, 3, 2, 1, 2, 3 ...
// (står der raekke: "alle" ved en figur, vises alle dens billeder efter hinanden)
const GAA_RAEKKE = [0, 1, 2, 1];


// =============================================================
//  Hent billeder
// =============================================================
const figurBilleder = {};

function figurBillede(sti) {
  if (!sti) return null;
  if (!figurBilleder[sti]) {
    const b = new Image();
    b.onload = function () { if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning(); };
    b.onerror = function () { console.warn("Kunne ikke finde billedet: " + sti); };
    b.src = sti;
    figurBilleder[sti] = b;
  }
  return figurBilleder[sti];
}

function klar(b) {
  return b && b.complete && b.naturalWidth > 0;
}

// Hent alle billederne med det samme, så de er klar, når figuren begynder at gå
for (const id in FIGURER) {
  const f = FIGURER[id];
  for (const r in f.gaa) f.gaa[r].forEach(function (b) { figurBillede(b.fil); });
  for (const r in f.sidder) figurBillede(f.sidder[r].fil);
}


// =============================================================
//  Tegn en figur
//    x, y:      hvor fødderne står på skærmen
//    valg:      { type: "kvinde" eller "mand" }
//    retning:   fx "ned-hoejre" (se listen øverst)
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
//    sidde:     null, eller { hoejde: sædets højde i pixels }
// =============================================================
function tegnMenneske(c, x, y, valg, retning, gaarTrin, sidde) {
  const f = FIGURER[valg.type] || FIGURER.kvinde;
  let del;
  if (sidde) {
    del = f.sidder[retning] || f.sidder.ned;
    y -= sidde.hoejde;   // numsen sidder på sædet
  } else {
    const billeder = f.gaa[retning] || f.gaa.ned;
    if (gaarTrin === null) {
      del = billeder[0];
    } else if (f.raekke === "alle") {
      del = billeder[Math.floor(gaarTrin) % billeder.length];
    } else {
      del = billeder[GAA_RAEKKE[Math.floor(gaarTrin) % GAA_RAEKKE.length]];
    }
  }
  const b = figurBillede(del.fil);
  if (!klar(b)) return;
  const s = f.skala;
  c.drawImage(b, Math.round(x - del.anker[0] * s), Math.round(y - del.anker[1] * s),
    b.naturalWidth * s, b.naturalHeight * s);
}

// Hvor høj figuren er på skærmen (bruges til navneskiltet)
function figurHoejde(valg) {
  const f = FIGURER[valg.type] || FIGURER.kvinde;
  return f.gaa.ned[0].anker[1] * f.skala;
}

// Alle figurer, man kan vælge i Garderoben: { id: "navn" }
function alleFigurer() {
  const liste = {};
  for (const id in FIGURER) liste[id] = FIGURER[id].navn;
  return liste;
}
