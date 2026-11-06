// =============================================================
//  🪑 Sæder og højder (6/11)
//
//  Gulvet er højde 0. Hvert møbel, man kan sidde på, har en SÆDEHØJDE:
//  hvor højt over gulvet selve puden/sædefladen er (i meter, ligesom i
//  virkeligheden). Møblet selv må gerne være højere (ryglæn, armlæn),
//  men figuren sætter sig altid PÅ sædefladen.
//
//  Højderne er målt direkte fra møblernes 3D-modeller, så de passer præcis
//  til billederne. Når figuren sidder, regnes det ud sådan her:
//   1. Find sædefladen i møblet (pladsen, man sidder på, lidt tilbage mod ryglænet).
//   2. Løft punktet op til sædehøjden (meter × SAEDE_PX_PR_METER).
//   3. Sæt figurens "numse-punkt" præcis der.
//
//  Armlæn: har møblet et armlæn i den side, der vender ud mod skærmen,
//  tegnes armlænet (billeder/moebler/armlaen/) ovenpå den, der sidder.
//
//  Nye møbler: skriv dem ind i SAEDER herunder.
//   hoejde:   sædefladens højde over gulvet i meter (fx 0.45)
//   frem:     hvor puden er frem (+) eller tilbage (−) fra møblets midte, i meter
//   pladser:  hvor pladserne er fra venstre til højre (meter fra midten). Én plads = [0]
//   armlaen:  true, hvis der er et armlæn-billede i billeder/moebler/armlaen/<id>-<retning>.png
//
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
const SAEDER = {
  "real-laenestol":      { hoejde: 0.455, frem: 0.03, pladser: [0], armlaen: true },
  "real-rosa-laenestol": { hoejde: 0.455, frem: 0.03, pladser: [0], armlaen: true },
  "real-sofa":           { hoejde: 0.455, frem: 0.03, pladser: [-0.315, 0.315], armlaen: true },
  "real-rosa-sofa":      { hoejde: 0.455, frem: 0.03, pladser: [-0.315, 0.315], armlaen: true },
  "real-baenk":          { hoejde: 0.46,  frem: 0,    pladser: [-0.35, 0.35] },
  "real-rosa-stol":      { hoejde: 0.485, frem: 0,    pladser: [0] },
  "real-rosa-puf":       { hoejde: 0.425, frem: 0,    pladser: [0] },
  "cafe-stol":           { hoejde: 0.475, frem: 0,    pladser: [0] },
  "cafe-sofa":           { hoejde: 0.48,  frem: 0.04, pladser: [-0.375, 0.375] },
  "tag-havestol":        { hoejde: 0.44,  frem: 0.03, pladser: [0], armlaen: true },
  "tag-baenk":           { hoejde: 0.443, frem: 0,    pladser: [-0.355, 0.355], armlaen: true },
  "tag-loungesofa":      { hoejde: 0.445, frem: 0.04, pladser: [-0.315, 0.315], armlaen: true },
  "laese-laenestol":     { hoejde: 0.49,  frem: 0.05, pladser: [0], armlaen: true },
  "laese-sofa":          { hoejde: 0.48,  frem: 0.04, pladser: [-0.335, 0.335], armlaen: true },
  "spil-saekkestol":     { hoejde: 0.30,  frem: 0.05, pladser: [0] },
};
// 1 meter op = så mange pixels på skærmen (samme kamera som møblernes 3D-billeder)
const SAEDE_PX_PR_METER = 76.35;
// 1 felt på gulvet = 0.77 meter
const FELT_METER = 0.77;
// numsen sidder lidt bag pudens midte (ind mod ryglænet), i meter
const SAEDE_TILBAGE = 0.08;

// Figurernes "numse-punkt" i sidde-billederne: hvor langt fra billedets anker
// (i spillets pixels) numsen er. [til siden, op]. Ankeret er toppen af lårene,
// som ligger længere fremme (tættere på os) end numsen, derfor et minus.
const NUMSE_PUNKT = {
  "billeder/figurer/pige-sidder-ned-venstre.png": [(34.4 - 27.5) * 0.74, -12],
  "billeder/figurer/pige-sidder-ned-hoejre.png": [(33.6 - 41.5) * 0.74, -12],
  "billeder/figurer/dreng-sidder-ned-venstre.png": [(51.1 - 66) * 0.76, -12],
  "billeder/figurer/dreng-sidder-ned-hoejre.png": [(31.9 - 17) * 0.76, -12],
};

(function () {
  // Hvor på skærmen sidder man på pladsen "plads" i møblet m? (null = ukendt møbel)
  function saedePunkt(m, plads) {
    const d = SAEDER[m.type], t = MOEBEL_TYPER[m.type];
    if (!d || !t || !t.retninger) return null;
    const r = (m.retning || 0) % 4;
    const ff = moebelFelter(t, drejetTvaers(m));
    const midt = { x: m.x + ff[0] / 2, y: m.y + ff[1] / 2 };
    // pladsens felt (sofaer har én plads pr. felt)
    const pf = typeof pladsFelt === "function" ? pladsFelt(m, plads || 0) : { x: m.x, y: m.y };
    const cos = [1, 0, -1, 0][r], sin = [0, 1, 0, -1][r];
    let bedst = null;
    d.pladser.forEach(function (by) {
      const bx = d.frem - SAEDE_TILBAGE;
      // drej modellen (x = frem, y = til siden) og læg den i spillets felter
      const rx = bx * cos - by * sin, ry = bx * sin + by * cos;
      const gx = midt.x + ry / FELT_METER, gy = midt.y + rx / FELT_METER;
      const afst = Math.abs(gx - (pf.x + 0.5)) + Math.abs(gy - (pf.y + 0.5));
      if (!bedst || afst < bedst.afst) bedst = { gx: gx, gy: gy, afst: afst };
    });
    const p = punkt(bedst.gx, bedst.gy);
    return { x: p.x, y: p.y - d.hoejde * SAEDE_PX_PR_METER };
  }
  window.saedePunkt = saedePunkt;

  // Armlænet ud mod skærmen, tegnet ovenpå den der sidder
  const armTyper = {};
  function tegnArmlaen(c, m) {
    const d = SAEDER[m.type], t = MOEBEL_TYPER[m.type];
    if (!d || !d.armlaen || !t) return;
    const r = m.retning || 0;
    if (r >= 2) return;
    let a = armTyper[m.type];
    if (!a) {
      a = armTyper[m.type] = Object.assign({}, t, {
        retninger: [0, 1, 2, 3].map(function (i) { return "billeder/moebler/armlaen/" + m.type + "-" + i + ".png"; }),
      });
      a.retninger.forEach(hentBillede);
    }
    a.ankre = t.ankre; a.anker = t.anker; a.skala = t.skala;
    const sted = moebelSted(t, m.x, m.y, drejetTvaers(m));
    tegnMoebel(c, a, sted.x, sted.y, m.spejlet, r);
  }

  let aktiv = null;   // { m, plads } mens en, der sidder, bliver tegnet

  function installer() {
    const tegnFoer = tegnMenneske;
    if (tegnFoer.saeder) return;
    const ny = function (c, x, y, valg, retning, gaarTrin, sidde) {
      if (!sidde || !aktiv) return tegnFoer.apply(this, arguments);
      const sp = saedePunkt(aktiv.m, aktiv.plads);
      if (!sp) return tegnFoer.apply(this, arguments);
      const f = FIGURER[valg.type];
      const del = f && f.sidder && (f.sidder[retning] || f.sidder.ned);
      const np = (del && NUMSE_PUNKT[del.fil]) || [0, -12];
      const m = aktiv.m;
      aktiv = null;   // kun én gang
      tegnFoer.call(this, c, sp.x - np[0], sp.y - np[1], valg, retning, gaarTrin, { hoejde: 0 });
      tegnArmlaen(c, m);
    };
    ny.saeder = true;
    ny.skelet = tegnFoer.skelet;
    tegnMenneske = ny;

    // din egen figur
    const figurFoer = tegnFigur;
    tegnFigur = function (c) {
      aktiv = figur.sidde && figur.sidde.grad > 0.4 && SAEDER[figur.sidde.moebel.type] ? { m: figur.sidde.moebel, plads: figur.sidde.plads } : null;
      try { return figurFoer.apply(this, arguments); } finally { aktiv = null; }
    };
    // gæster og andre spillere (de tegnes med tegnHalGaest)
    if (typeof tegnHalGaest === "function") {
      const gaestFoer = tegnHalGaest;
      tegnHalGaest = function (g) {
        aktiv = g && g.sidder && g.saede && SAEDER[g.saede.type] ? { m: g.saede, plads: g.plads } : null;
        try { return gaestFoer.apply(this, arguments); } finally { aktiv = null; }
      };
    }
  }

  // vent, til de andre figur-filer er hentet (skelet-gang.js m.fl.), så denne ligger yderst
  let forsoeg = 0;
  (function vent() {
    if ((tegnMenneske.skelet && typeof tegnHalGaest === "function") || forsoeg++ > 60) installer();
    else setTimeout(vent, 100);
  })();
})();
