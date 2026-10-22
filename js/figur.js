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
//  SÅDAN BEVÆGER DE SIG
//  Spillet klipper hver tegning op i stykker: overkrop, venstre ben,
//  højre ben og (hvis de hænger frit) armene. Stykkerne bliver så drejet
//  og flyttet, så det ser ud som om figuren går og sætter sig.
//  Tallene herunder fortæller, hvor på tegningen stykkerne sidder:
//    hofte:  hvor benene begynder (0 = toppen af billedet, 1 = bunden)
//    arme:   hvor armene sidder (top, bund, og hvor langt ind fra siderne)
//    spejlBen: true = benene byttes om ved hvert skridt (til tegninger,
//              hvor figuren allerede er midt i et skridt)
//    skridt: hvor benene skilles (bruges, når bukserne er samlet et stykke under hoften)
//    benDeling: hvor på tværs benene skilles (0.5 = midt på billedet)
//    saks:   benene går fra hinanden som en saks, når figuren går (tallet = hvor meget)
//
//  EKSTRA TEGNINGER (valgfrit)
//  Tegner du selv flere billeder, bruger spillet dem automatisk:
//    gaa:    en liste af billeder, der vises efter hinanden, når figuren går
//    sidder: et billede af figuren, der sidder ned
//    gaaVenstre / sidderVenstre: de samme, men tegnet så de kigger mod venstre
//            (står der ingen, bliver gaa og sidder bare spejlvendt)
//  Står der "" eller [], bruges de opklippede stykker i stedet.

const BILLED_FIGURER = {
  kvinde: {
    navn: "Kvinde",
    skala: 0.5,                       // billederne er tegnet dobbelt så store
    forfra: {
      fil: "billeder/kvinde-forfra.png",
      hofte: 0.71,
      arme: null,                     // hendes hænder er foldet foran, så armene svinger ikke
      gaa: ["billeder/kvinde-gaa-hoejre-1.png", "billeder/kvinde-gaa-hoejre-2.png",
            "billeder/kvinde-gaa-hoejre-3.png", "billeder/kvinde-gaa-hoejre-4.png"],
      gaaVenstre: ["billeder/kvinde-gaa-venstre-1.png", "billeder/kvinde-gaa-venstre-2.png",
            "billeder/kvinde-gaa-venstre-3.png", "billeder/kvinde-gaa-venstre-4.png"],
      sidder: "billeder/kvinde-sidder-hoejre.png",
      sidderVenstre: "billeder/kvinde-sidder-venstre.png",
    },
    bagfra: {
      fil: "billeder/kvinde-bagfra.png",
      hofte: 0.66,
      spejlBen: true,
      arme: null,
      gaa: [],
      sidder: "",
    },
  },
  mand: {
    navn: "Mand",
    skala: 0.5,
    forfra: {
      fil: "billeder/mand-forfra.png",
      hofte: 0.58,
      skridt: 0.81,
      benDeling: 0.41,
      arme: null,                     // hans hænder er i lommerne, så armene svinger ikke
      gaa: ["billeder/mand-gaa-hoejre-1.png", "billeder/mand-gaa-hoejre-2.png",
            "billeder/mand-gaa-hoejre-3.png", "billeder/mand-gaa-hoejre-4.png"],
      gaaVenstre: ["billeder/mand-gaa-venstre-1.png", "billeder/mand-gaa-venstre-2.png",
            "billeder/mand-gaa-venstre-3.png", "billeder/mand-gaa-venstre-4.png"],
      sidder: "billeder/mand-sidder-hoejre.png",
      sidderVenstre: "billeder/mand-sidder-venstre.png",
    },
    bagfra: {
      fil: "billeder/mand-bagfra.png",
      hofte: 0.58,
      skridt: 0.81,
      benDeling: 0.55,
      arme: null,
      gaa: [],
      sidder: "",
    },
  },
};


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

// Tegn et stykke af billedet.
//   (u0, v0, u1, v1): hvilket stykke, målt fra 0 til 1 på billedet
//   (pu, pv): det punkt, stykket drejes om
//   drej: hvor meget det drejes, flyt: [x, y] flytning, hoejde: 1 = normal, mindre = kortere
//   spejl: true = stykket spejlvendes
function tegnStykke(c, b, s, u0, v0, u1, v1, pu, pv, drej, flyt, hoejde, spejl) {
  const W = b.naturalWidth, H = b.naturalHeight;
  const sx = u0 * W, sy = v0 * H, sw = (u1 - u0) * W, sh = (v1 - v0) * H;
  if (sw <= 0 || sh <= 0) return;
  // hvor punktet (pu, pv) ligger på skærmen, når fødderne er i (0, 0)
  const px = (pu - 0.5) * W * s;
  const py = (pv - 1) * H * s;
  c.save();
  c.translate(px + flyt[0], py + flyt[1]);
  c.rotate(drej);
  c.scale(spejl ? -1 : 1, hoejde);
  if (spejl) c.translate(-2 * ((u0 + u1) / 2 - pu) * W * s, 0);
  c.drawImage(b, sx, sy, sw, sh, (u0 - pu) * W * s, (v0 - pv) * H * s, sw * s, sh * s);
  c.restore();
}


// =============================================================
//  Tegn en figur
//    x, y:      hvor fødderne står på skærmen
//    valg:      { type: "kvinde" eller "mand" }
//    forfra:    true = kigger mod os, false = vender ryggen til
//    vendt:     1 = mod højre, -1 = mod venstre
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
//    sidde:     null, eller { grad: 0 til 1, hoejde: sædets højde i pixels }
// =============================================================
function tegnMenneske(c, x, y, valg, forfra, vendt, gaarTrin, sidde) {
  const f = BILLED_FIGURER[valg.type] || BILLED_FIGURER.kvinde;
  const del = forfra ? f.forfra : f.bagfra;
  const s = f.skala;
  const tid = performance.now();
  const siddeGrad = sidde ? sidde.grad : 0;

  // Er der tegnet billeder, der kigger mod venstre, bruges de i stedet for at spejlvende
  const venstre = vendt < 0;
  const gaaListe = venstre && del.gaaVenstre && del.gaaVenstre.length > 0 ? del.gaaVenstre : del.gaa;
  const gaaSpejl = gaaListe === del.gaa ? vendt : 1;
  const siddeSti = venstre && del.sidderVenstre ? del.sidderVenstre : del.sidder;
  const siddeSpejl = siddeSti === del.sidder ? vendt : 1;

  // Har du tegnet et siddende billede, bruges det, når figuren sætter sig
  const siddeBillede = figurBillede(siddeSti);
  if (siddeGrad > 0 && klar(siddeBillede)) {
    tegnHeltBillede(c, x, y, siddeBillede, s, siddeSpejl);
    return;
  }
  // Har du tegnet gå-billeder, bruges de, når figuren går
  if (gaarTrin !== null && gaaListe && gaaListe.length > 0) {
    const gb = figurBillede(gaaListe[Math.floor(gaarTrin) % gaaListe.length]);
    if (klar(gb)) {
      tegnHeltBillede(c, x, y, gb, s, gaaSpejl);
      return;
    }
  }

  const b = figurBillede(del.fil);
  if (!klar(b)) return;
  const H = b.naturalHeight * s;
  const benLaengde = (1 - del.hofte) * H;

  // ----- Bevægelsen lige nu -----
  let hop = 0, sving = 0, aande = 0;
  if (gaarTrin !== null) {
    const fase = gaarTrin * Math.PI / 2;
    sving = Math.sin(fase);                 // -1 til 1: hvilket ben der er fremme
    hop = Math.abs(Math.cos(fase)) * 2;     // kroppen løfter sig, når benene passerer hinanden
  } else if (siddeGrad === 0) {
    aande = Math.sin(tid / 700) * 0.6;      // vejrtrækning
  }

  // Når figuren sætter sig, synker hoften ned til sædet
  let synk = 0, laen = 0;
  if (siddeGrad > 0) {
    synk = Math.max(0, benLaengde - sidde.hoejde) * siddeGrad;
    // undervejs læner figuren sig frem og tager fat (som når man griber armlænet)
    laen = Math.sin(siddeGrad * Math.PI) * 0.16;
  }

  c.save();
  c.translate(Math.round(x), Math.round(y - hop));
  if (vendt < 0) c.scale(-1, 1);

  // ----- Benene -----
  const hofteY = -benLaengde;
  if (siddeGrad > 0) {
    // Lårene peger ind mod os og kan ikke ses forfra, så kun underbenene
    // (fra knæet ned til skoene) bliver stående under sædet. Resten gemmes bag kroppen.
    const underben = Math.min(benLaengde, sidde.hoejde + 3) / H;
    const top = del.hofte + (1 - del.hofte - underben) * siddeGrad;
    tegnStykke(c, b, s, 0, top, 1, 1, 0.5, 1, 0, [0, 0], 1, false);
  } else if (del.spejlBen) {
    // tegningen er allerede midt i et skridt: byt om på benene ved hvert skridt
    tegnStykke(c, b, s, 0, del.hofte, 1, 1, 0.5, del.hofte, 0, [0, 0], 1, sving > 0);
  } else if (del.saks) {
    // benene går fra hinanden som en saks (det ene frem og det andet tilbage),
    // mens toppen af benene bliver siddende i bukserne
    const skridt = del.skridt || del.hofte;
    const d = del.benDeling || 0.5;
    const ledY = (skridt - 1) * H;
    if (skridt > del.hofte) {
      tegnStykke(c, b, s, 0, del.hofte, 1, skridt, 0.5, del.hofte, 0, [0, 0], 1, false);
    }
    // benene spredes ved hvert skridt, og det er skiftevis det ene og det andet ben, der løftes
    const spred = Math.abs(sving) * del.saks;
    const ben = [
      { u0: 0, u1: d, skraa: -spred, loeft: Math.max(0, -sving) },
      { u0: d, u1: 1, skraa: spred, loeft: Math.max(0, sving) },
    ];
    // det bagerste ben tegnes først
    if (sving > 0) ben.reverse();
    for (const e of ben) {
      c.save();
      c.translate(0, ledY);
      c.transform(1, 0, e.skraa, 1, 0, 0);
      c.translate(0, -ledY);
      tegnStykke(c, b, s, e.u0, skridt - 0.015, e.u1, 1, (e.u0 + e.u1) / 2, skridt, 0,
        [0, 0], 1 - e.loeft * 0.12, false);
      c.restore();
    }
  } else {
    // bukserne over skridtet følger kroppen, kun selve benene bevæger sig
    const skridt = del.skridt || del.hofte;
    const d = del.benDeling || 0.5;
    if (skridt > del.hofte) {
      tegnStykke(c, b, s, 0, del.hofte, 1, skridt, 0.5, del.hofte, 0, [0, 0], 1, false);
    }
    // det ben, der går frem, løftes (bliver lidt kortere) og flytter sig lidt frem
    // korte ben skal bevæge sig lige så meget som lange, ellers ser det ud som om figuren svæver
    const ekstra = Math.min(2, 35 / ((1 - skridt) * H));
    // benene starter en anelse højere oppe, så der ikke kommer en lys streg i samlingen
    const venstreLoeft = Math.max(0, sving), hoejreLoeft = Math.max(0, -sving);
    tegnStykke(c, b, s, 0, skridt - 0.015, d, 1, d * 0.6, skridt, sving * 0.06 * ekstra,
      [venstreLoeft * 1.5 * ekstra, 0], 1 - venstreLoeft * 0.13 * ekstra, false);
    tegnStykke(c, b, s, d, skridt - 0.015, 1, 1, d + (1 - d) * 0.4, skridt, -sving * 0.06 * ekstra,
      [hoejreLoeft * 1.5 * ekstra, 0], 1 - hoejreLoeft * 0.13 * ekstra, false);
  }

  // ----- Overkroppen (synker ned, når figuren sætter sig) -----
  c.save();
  c.translate(0, synk + aande * 0.3);
  c.translate(0, hofteY);
  c.rotate(laen);
  c.translate(0, -hofteY);
  const a = del.arme;
  if (a) {
    // kroppen uden arme
    tegnStykke(c, b, s, a.ind, 0, 1 - a.ind, del.hofte, 0.5, del.hofte, 0, [0, 0], 1, false);
    tegnStykke(c, b, s, 0, 0, a.ind, a.top, 0.5, del.hofte, 0, [0, 0], 1, false);
    tegnStykke(c, b, s, 1 - a.ind, 0, 1, a.top, 0.5, del.hofte, 0, [0, 0], 1, false);
    tegnStykke(c, b, s, 0, a.bund, a.ind, del.hofte, 0.5, del.hofte, 0, [0, 0], 1, false);
    tegnStykke(c, b, s, 1 - a.ind, a.bund, 1, del.hofte, 0.5, del.hofte, 0, [0, 0], 1, false);
    // armene svinger modsat benene. Når man sætter sig, rækker armene ud efter armlænene.
    const armSving = sving * 0.22;
    const greb = Math.sin(siddeGrad * Math.PI) * 0.35;
    tegnStykke(c, b, s, 0, a.top, a.ind, a.bund, a.ind * 0.75, a.top, -armSving + greb, [0, 0], 1, false);
    tegnStykke(c, b, s, 1 - a.ind, a.top, 1, a.bund, 1 - a.ind * 0.75, a.top, armSving - greb, [0, 0], 1, false);
  } else {
    tegnStykke(c, b, s, 0, 0, 1, del.hofte, 0.5, del.hofte, 0, [0, 0], 1, false);
  }
  c.restore();

  c.restore();
}

function tegnHeltBillede(c, x, y, b, s, vendt) {
  const w = b.naturalWidth * s, h = b.naturalHeight * s;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (vendt < 0) c.scale(-1, 1);
  c.drawImage(b, -w / 2, -h, w, h);
  c.restore();
}

// Hvor høj figuren er på skærmen (bruges til navneskiltet)
function figurHoejde(valg) {
  const f = BILLED_FIGURER[valg.type] || BILLED_FIGURER.kvinde;
  const b = figurBillede(f.forfra.fil);
  return klar(b) ? b.naturalHeight * f.skala : 120;
}

// Alle figurer, man kan vælge i Garderoben: { id: "navn" }
function alleFigurer() {
  const liste = {};
  for (const id in BILLED_FIGURER) liste[id] = BILLED_FIGURER[id].navn;
  return liste;
}

// Hent alle billederne med det samme, så de er klar, når figuren begynder at gå
for (const id in BILLED_FIGURER) {
  for (const side of ["forfra", "bagfra"]) {
    const del = BILLED_FIGURER[id][side];
    [del.fil, del.sidder, del.sidderVenstre].concat(del.gaa || [], del.gaaVenstre || []).forEach(figurBillede);
  }
}
