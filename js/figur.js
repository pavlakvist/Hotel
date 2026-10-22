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
//  gaa:    tre billeder pr. retning, som vises efter hinanden, når figuren går.
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
    gaa: {
      "ned": [{ fil: "billeder/figurer/kvinde-gaa-0-1.png", anker: [32.0, 139] }, { fil: "billeder/figurer/kvinde-gaa-0-2.png", anker: [32.0, 142] }, { fil: "billeder/figurer/kvinde-gaa-0-3.png", anker: [31.5, 141] }],
      "ned-venstre": [{ fil: "billeder/figurer/kvinde-gaa-7-1.png", anker: [36.0, 137] }, { fil: "billeder/figurer/kvinde-gaa-7-2.png", anker: [35.0, 141] }, { fil: "billeder/figurer/kvinde-gaa-7-3.png", anker: [35.5, 137] }],
      "venstre": [{ fil: "billeder/figurer/kvinde-gaa-6-1.png", anker: [36.5, 138] }, { fil: "billeder/figurer/kvinde-gaa-6-2.png", anker: [35.0, 142] }, { fil: "billeder/figurer/kvinde-gaa-6-3.png", anker: [38.0, 141] }],
      "op-venstre": [{ fil: "billeder/figurer/kvinde-gaa-5-1.png", anker: [36.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-5-2.png", anker: [36.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-5-3.png", anker: [36.0, 139] }],
      "op": [{ fil: "billeder/figurer/kvinde-gaa-4-1.png", anker: [31.5, 137] }, { fil: "billeder/figurer/kvinde-gaa-4-2.png", anker: [31.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-4-3.png", anker: [31.5, 134] }],
      "op-hoejre": [{ fil: "billeder/figurer/kvinde-gaa-3-1.png", anker: [35.5, 138] }, { fil: "billeder/figurer/kvinde-gaa-3-2.png", anker: [36.0, 137] }, { fil: "billeder/figurer/kvinde-gaa-3-3.png", anker: [35.5, 137] }],
      "hoejre": [{ fil: "billeder/figurer/kvinde-gaa-2-1.png", anker: [34.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-2-2.png", anker: [34.5, 137] }, { fil: "billeder/figurer/kvinde-gaa-2-3.png", anker: [37.0, 138] }],
      "ned-hoejre": [{ fil: "billeder/figurer/kvinde-gaa-1-1.png", anker: [32.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-1-2.png", anker: [32.0, 138] }, { fil: "billeder/figurer/kvinde-gaa-1-3.png", anker: [31.5, 142] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/kvinde-sidder-0.png", anker: [33.0, 122.1] },
      "ned-hoejre": { fil: "billeder/figurer/kvinde-sidder-1.png", anker: [23.4, 121.3] },
      "hoejre": { fil: "billeder/figurer/kvinde-sidder-2.png", anker: [38.0, 122.1] },
      "op-hoejre": { fil: "billeder/figurer/kvinde-sidder-3.png", anker: [37.0, 122.1] },
      "op": { fil: "billeder/figurer/kvinde-sidder-4.png", anker: [33.0, 104.9] },
      "op-venstre": { fil: "billeder/figurer/kvinde-sidder-5.png", anker: [38.5, 122.1] },
      "venstre": { fil: "billeder/figurer/kvinde-sidder-6.png", anker: [39.5, 121.3] },
      "ned-venstre": { fil: "billeder/figurer/kvinde-sidder-7.png", anker: [56.7, 121.3] },
    },
  },
  mand: {
    navn: "Mand",
    skala: 0.831,
    gaa: {
      "ned": [{ fil: "billeder/figurer/mand-gaa-0-1.png", anker: [40.5, 144] }, { fil: "billeder/figurer/mand-gaa-0-2.png", anker: [39.5, 146] }, { fil: "billeder/figurer/mand-gaa-0-3.png", anker: [41.5, 142] }],
      "ned-venstre": [{ fil: "billeder/figurer/mand-gaa-7-1.png", anker: [41.5, 144] }, { fil: "billeder/figurer/mand-gaa-7-2.png", anker: [40.0, 142] }, { fil: "billeder/figurer/mand-gaa-7-3.png", anker: [42.5, 142] }],
      "venstre": [{ fil: "billeder/figurer/mand-gaa-6-1.png", anker: [40.0, 143] }, { fil: "billeder/figurer/mand-gaa-6-2.png", anker: [39.5, 142] }, { fil: "billeder/figurer/mand-gaa-6-3.png", anker: [42.5, 141] }],
      "op-venstre": [{ fil: "billeder/figurer/mand-gaa-5-1.png", anker: [39.5, 142] }, { fil: "billeder/figurer/mand-gaa-5-2.png", anker: [39.5, 140] }, { fil: "billeder/figurer/mand-gaa-5-3.png", anker: [41.5, 140] }],
      "op": [{ fil: "billeder/figurer/mand-gaa-4-1.png", anker: [39.0, 142] }, { fil: "billeder/figurer/mand-gaa-4-2.png", anker: [38.5, 142] }, { fil: "billeder/figurer/mand-gaa-4-3.png", anker: [42.0, 144] }],
      "op-hoejre": [{ fil: "billeder/figurer/mand-gaa-3-1.png", anker: [38.5, 142] }, { fil: "billeder/figurer/mand-gaa-3-2.png", anker: [38.5, 137] }, { fil: "billeder/figurer/mand-gaa-3-3.png", anker: [41.0, 145] }],
      "hoejre": [{ fil: "billeder/figurer/mand-gaa-2-1.png", anker: [40.5, 141] }, { fil: "billeder/figurer/mand-gaa-2-2.png", anker: [39.0, 141] }, { fil: "billeder/figurer/mand-gaa-2-3.png", anker: [41.5, 142] }],
      "ned-hoejre": [{ fil: "billeder/figurer/mand-gaa-1-1.png", anker: [39.5, 145] }, { fil: "billeder/figurer/mand-gaa-1-2.png", anker: [40.0, 143] }, { fil: "billeder/figurer/mand-gaa-1-3.png", anker: [42.0, 140] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/mand-sidder-0.png", anker: [41.0, 134.2] },
      "ned-hoejre": { fil: "billeder/figurer/mand-sidder-1.png", anker: [23.5, 135.5] },
      "hoejre": { fil: "billeder/figurer/mand-sidder-2.png", anker: [43.5, 131.6] },
      "op-hoejre": { fil: "billeder/figurer/mand-sidder-3.png", anker: [44.5, 130.7] },
      "op": { fil: "billeder/figurer/mand-sidder-4.png", anker: [40.0, 114.4] },
      "op-venstre": { fil: "billeder/figurer/mand-sidder-5.png", anker: [47.0, 130.7] },
      "venstre": { fil: "billeder/figurer/mand-sidder-6.png", anker: [47.0, 128.1] },
      "ned-venstre": { fil: "billeder/figurer/mand-sidder-7.png", anker: [77.4, 130.2] },
    },
  },
};

// Rækkefølgen af gå-billederne: 1, 2, 3, 2, 1, 2, 3 ...
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
    del = billeder[gaarTrin === null ? 0 : GAA_RAEKKE[Math.floor(gaarTrin) % GAA_RAEKKE.length]];
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
