// =============================================================
//  🧍 De nye realistiske figurer (Pavlas grønne ChatGPT-ark 4/11)
//  Pigen og drengen er klippet ud af arkene (kilde: billeder/figurer/kilde/real-*.jpg)
//  og ligger i billeder/figurer/real/.
//  Gå forfra er fra de store ark (skarpe). De andre retninger er fra det store
//  fælles ark, hvor figurerne er små, så de er lidt slørede.
//  Når der kommer et stort ark for en retning, byttes billederne bare ud.
//
//  Vil du have de gamle pixel-figurer tilbage: slet blokken
//  "🧍 Realistiske figurer" i js/panel-forklaring.js.
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
const FIGURER_REAL = {
  pige: {
    staa: {
      "ned": { fil: "billeder/figurer/real/pigereal-staa-ned.png", anker: [32.2, 236], ingenLag: true },
      "op": { fil: "billeder/figurer/real/pigereal-staa-op.png", anker: [39.8, 234], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/real/pigereal-staa-hoejre.png", anker: [60.2, 235], ingenLag: true },
      "venstre": { fil: "billeder/figurer/real/pigereal-staa-venstre.png", anker: [55.4, 236], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/real/pigereal-staa-ned-hoejre.png", anker: [33.8, 243], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/real/pigereal-staa-ned-venstre.png", anker: [36.8, 234], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/real/pigereal-staa-op-hoejre.png", anker: [40.6, 236], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/real/pigereal-staa-op-venstre.png", anker: [30.1, 233], ingenLag: true },
    },
    sidder: {
      "ned": { fil: "billeder/figurer/real/pigereal-sidde-ned.png", anker: [26.8, 102], ingenLag: true },
      "op": { fil: "billeder/figurer/real/pigereal-sidde-op.png", anker: [29.7, 102], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/real/pigereal-sidde-hoejre.png", anker: [20.7, 102], ingenLag: true },
      "venstre": { fil: "billeder/figurer/real/pigereal-sidde-venstre.png", anker: [63.5, 102], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/real/pigereal-sidde-hoejre.png", anker: [20.7, 102], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/real/pigereal-sidde-venstre.png", anker: [63.5, 102], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/real/pigereal-sidde-op.png", anker: [29.7, 102], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/real/pigereal-sidde-op.png", anker: [29.7, 102], ingenLag: true },
    },
    gaa: {
      "ned": [{ fil: "billeder/figurer/real/pigereal-gaa-ned-1.png", anker: [39.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-2.png", anker: [35.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-3.png", anker: [33.5, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-4.png", anker: [32.3, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-5.png", anker: [32.2, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-6.png", anker: [31.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-7.png", anker: [34.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-8.png", anker: [38.8, 236], ingenLag: true }],
      "op": [{ fil: "billeder/figurer/real/pigereal-gaa-op-1.png", anker: [37.8, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-2.png", anker: [40.0, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-3.png", anker: [40.4, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-4.png", anker: [37.4, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-5.png", anker: [37.0, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-6.png", anker: [38.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-7.png", anker: [37.6, 231], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-8.png", anker: [39.8, 234], ingenLag: true }],
      "hoejre": [{ fil: "billeder/figurer/real/pigereal-gaa-hoejre-1.png", anker: [58.5, 254], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-2.png", anker: [60.6, 250], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-3.png", anker: [60.2, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-4.png", anker: [58.5, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-5.png", anker: [59.3, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-6.png", anker: [58.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-7.png", anker: [59.3, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-hoejre-8.png", anker: [58.1, 238], ingenLag: true }],
      "venstre": [{ fil: "billeder/figurer/real/pigereal-gaa-venstre-1.png", anker: [54.5, 254], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-2.png", anker: [55.5, 254], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-3.png", anker: [56.8, 257], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-4.png", anker: [57.0, 233], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-5.png", anker: [59.4, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-6.png", anker: [55.4, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-7.png", anker: [58.2, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-venstre-8.png", anker: [58.5, 234], ingenLag: true }],
      "ned-hoejre": [{ fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-1.png", anker: [33.8, 243], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-2.png", anker: [35.6, 237], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-3.png", anker: [34.6, 240], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-4.png", anker: [36.7, 240], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-5.png", anker: [34.5, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-6.png", anker: [34.4, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-7.png", anker: [35.1, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-hoejre-8.png", anker: [34.3, 235], ingenLag: true }],
      "ned-venstre": [{ fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-1.png", anker: [36.0, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-2.png", anker: [37.3, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-3.png", anker: [38.8, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-4.png", anker: [37.1, 239], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-5.png", anker: [38.9, 226], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-6.png", anker: [36.8, 234], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-7.png", anker: [37.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-ned-venstre-8.png", anker: [37.6, 230], ingenLag: true }],
      "op-hoejre": [{ fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-1.png", anker: [44.2, 239], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-2.png", anker: [44.2, 241], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-3.png", anker: [43.9, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-4.png", anker: [42.5, 250], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-5.png", anker: [40.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-6.png", anker: [43.2, 233], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-7.png", anker: [43.9, 229], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-hoejre-8.png", anker: [42.9, 236], ingenLag: true }],
      "op-venstre": [{ fil: "billeder/figurer/real/pigereal-gaa-op-venstre-1.png", anker: [37.1, 238], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-2.png", anker: [35.8, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-3.png", anker: [30.1, 233], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-4.png", anker: [33.8, 249], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-5.png", anker: [33.1, 239], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-6.png", anker: [30.3, 234], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-7.png", anker: [31.8, 235], ingenLag: true }, { fil: "billeder/figurer/real/pigereal-gaa-op-venstre-8.png", anker: [32.7, 237], ingenLag: true }],
    },
  },
  dreng: {
    staa: {
      "ned": { fil: "billeder/figurer/real/drengreal-staa-ned.png", anker: [38.1, 236], ingenLag: true },
      "op": { fil: "billeder/figurer/real/drengreal-staa-op.png", anker: [39.9, 235], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/real/drengreal-staa-hoejre.png", anker: [27.5, 230], ingenLag: true },
      "venstre": { fil: "billeder/figurer/real/drengreal-staa-venstre.png", anker: [42.4, 235], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/real/drengreal-staa-ned-hoejre.png", anker: [33.5, 212], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/real/drengreal-staa-ned-venstre.png", anker: [40.7, 234], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/real/drengreal-staa-op-hoejre.png", anker: [35.3, 235], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/real/drengreal-staa-op-venstre.png", anker: [33.5, 236], ingenLag: true },
    },
    sidder: {
      "ned": { fil: "billeder/figurer/real/drengreal-sidde-ned.png", anker: [32.3, 102], ingenLag: true },
      "op": { fil: "billeder/figurer/real/drengreal-sidde-op.png", anker: [33.7, 102], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/real/drengreal-sidde-hoejre.png", anker: [24.8, 102], ingenLag: true },
      "venstre": { fil: "billeder/figurer/real/drengreal-sidde-venstre.png", anker: [61.9, 102], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/real/drengreal-sidde-hoejre.png", anker: [24.8, 102], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/real/drengreal-sidde-venstre.png", anker: [61.9, 102], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/real/drengreal-sidde-op.png", anker: [33.7, 102], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/real/drengreal-sidde-op.png", anker: [33.7, 102], ingenLag: true },
    },
    gaa: {
      "ned": [{ fil: "billeder/figurer/real/drengreal-gaa-ned-1.png", anker: [41.2, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-2.png", anker: [38.7, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-3.png", anker: [38.1, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-4.png", anker: [38.3, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-5.png", anker: [39.0, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-6.png", anker: [39.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-7.png", anker: [40.4, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-8.png", anker: [40.9, 236], ingenLag: true }],
      "op": [{ fil: "billeder/figurer/real/drengreal-gaa-op-1.png", anker: [42.3, 246], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-2.png", anker: [41.8, 245], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-3.png", anker: [39.9, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-4.png", anker: [38.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-5.png", anker: [40.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-6.png", anker: [40.9, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-7.png", anker: [42.3, 234], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-8.png", anker: [42.4, 237], ingenLag: true }],
      "hoejre": [{ fil: "billeder/figurer/real/drengreal-gaa-hoejre-1.png", anker: [61.3, 246], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-2.png", anker: [52.2, 253], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-3.png", anker: [62.1, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-4.png", anker: [27.5, 230], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-5.png", anker: [50.6, 237], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-6.png", anker: [50.1, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-7.png", anker: [37.6, 230], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-hoejre-8.png", anker: [40.8, 235], ingenLag: true }],
      "venstre": [{ fil: "billeder/figurer/real/drengreal-gaa-venstre-1.png", anker: [58.3, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-2.png", anker: [43.0, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-3.png", anker: [61.0, 251], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-4.png", anker: [59.8, 231], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-5.png", anker: [46.7, 237], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-6.png", anker: [42.4, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-7.png", anker: [60.4, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-venstre-8.png", anker: [55.6, 234], ingenLag: true }],
      "ned-hoejre": [{ fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-1.png", anker: [42.4, 239], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-2.png", anker: [37.6, 248], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-3.png", anker: [38.2, 241], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-4.png", anker: [33.5, 212], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-5.png", anker: [37.6, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-6.png", anker: [38.2, 233], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-7.png", anker: [40.3, 211], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-hoejre-8.png", anker: [37.7, 236], ingenLag: true }],
      "ned-venstre": [{ fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-1.png", anker: [42.3, 237], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-2.png", anker: [42.1, 239], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-3.png", anker: [43.9, 239], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-4.png", anker: [42.4, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-5.png", anker: [40.7, 234], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-6.png", anker: [40.2, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-7.png", anker: [41.1, 232], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-ned-venstre-8.png", anker: [46.0, 230], ingenLag: true }],
      "op-hoejre": [{ fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-1.png", anker: [45.5, 237], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-2.png", anker: [39.2, 245], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-3.png", anker: [37.8, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-4.png", anker: [33.9, 240], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-5.png", anker: [33.8, 235], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-6.png", anker: [37.8, 232], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-7.png", anker: [34.3, 229], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-hoejre-8.png", anker: [35.3, 235], ingenLag: true }],
      "op-venstre": [{ fil: "billeder/figurer/real/drengreal-gaa-op-venstre-1.png", anker: [35.4, 241], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-2.png", anker: [35.4, 244], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-3.png", anker: [35.3, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-4.png", anker: [33.2, 244], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-5.png", anker: [34.3, 227], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-6.png", anker: [33.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-7.png", anker: [37.5, 236], ingenLag: true }, { fil: "billeder/figurer/real/drengreal-gaa-op-venstre-8.png", anker: [36.9, 236], ingenLag: true }],
    },
  },
};
const REAL_SKALA = 130 / 236;   // billederne er 236 px høje, figuren skal være 130 px som før
const REAL_BEN_FART = 1.5;      // 8 billeder pr. skridt-cyklus, så benene skal skifte lidt hurtigere

function saetRealFigurer() {
  ["pige", "dreng"].forEach(function (hvem) {
    const f = FIGURER[hvem], n = FIGURER_REAL[hvem];
    if (!f || !n) return;
    f.staa = n.staa;
    f.gaa = n.gaa;
    f.sidder = n.sidder;
    f.poser = {};             // ingen ansigtsudtryk på arket endnu
    f.skala = REAL_SKALA;
    f.raekke = "alle";
    f.siddeMidt = 0;          // ankeret ligger allerede midt under kroppen
    f.sidderBagfra = true;    // biografen tegner bagfra-billedet
    f.erReal = true;
    delete f.gaaSkala;        // (fra js/gang-rettet.js, kun til de gamle billeder)
    delete f.siddeSkala;      // (fra js/sidde-nye.js, kun til de gamle billeder)
    delete f.omraader;        // farvelagene passer ikke til de nye billeder
    delete f.omraadeNavne;
    delete f.haarstile;
  });
}
saetRealFigurer();
// js/gang-rettet.js og js/sidde-nye.js hentes måske efter denne fil og sætter de gamle
// billeder igen, så de nye sættes på plads et par gange mere, mens hotellet starter.
[300, 1000, 2500, 5000, 10000, 20000].forEach(function (ms) { setTimeout(saetRealFigurer, ms); });

// Hent alle billederne med det samme, så figuren ikke blinker første gang den går
["pige", "dreng"].forEach(function (hvem) {
  const n = FIGURER_REAL[hvem];
  ["staa", "sidder"].forEach(function (k) { for (const r in n[k]) figurBillede(n[k][r].fil); });
  for (const r in n.gaa) n.gaa[r].forEach(function (b) { figurBillede(b.fil); });
});

// Benene skifter lidt hurtigere, så de ikke glider hen over gulvet.
// Skalaen sættes fast, også hvis andre filer prøver at gøre figuren mindre.
(function () {
  const foer = tegnMenneske;
  tegnMenneske = function (c, x, y, valg, retning, gaarTrin, sidde) {
    const f = FIGURER[valg && valg.type];
    if (!f || !f.erReal) return foer.apply(this, arguments);
    const args = Array.prototype.slice.call(arguments);
    if (gaarTrin !== null && gaarTrin !== undefined) args[5] = gaarTrin * REAL_BEN_FART;
    delete f.gaaSkala; delete f.siddeSkala;
    f.skala = REAL_SKALA;
    return foer.apply(this, args);
  };
})();
