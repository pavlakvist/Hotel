// =============================================================
//  ✨ Realistisk hotel (4/11)
//  Gulv af rigtige egeplanker (eller fliser), vægge med tapet foroven
//  og træpanel med guldliste forneden, bløde skygger hvor gulv møder væg,
//  og en rød fløjlslænestol, der er bygget i 3D.
//  Billederne ligger i billeder/realistisk/ og billeder/moebler/real-laenestol/.
//  Hentes fra slutningen af js/panel-forklaring.js.
//
//  Vil du se det gamle pixel-gulv igen, så skriv i konsollen:
//    localStorage.setItem("mit-hotel-realistisk", "fra")
// =============================================================

const REALISTISK = {
  til: (function () { try { return localStorage.getItem("mit-hotel-realistisk") !== "fra"; } catch (e) { return true; } })(),
  gulvTrae: "billeder/realistisk/gulv-eg.jpg", // 4 x 4 felter, gentager sig sømløst
  gulvFliser: "billeder/realistisk/gulv-fliser.jpg", // gråt, farves med rummets gulvfarve
  tapet: "billeder/realistisk/tapet.png", // lyst, farves med rummets vægfarve
  panel: "billeder/realistisk/panel.png", // træpanel nederst på væggen
  panelHoejde: 50, // panelets højde i spil-pixels
};

// et billede, der er farvet med en farve (gemmes, så det kun laves én gang)
const REAL_FARVET = {};
function realFarvet(sti, farve) {
  const noegle = sti + farve;
  if (REAL_FARVET[noegle]) return REAL_FARVET[noegle];
  const b = hentBillede(sti);
  if (!billedeKlar(b)) return null;
  const c = document.createElement("canvas");
  c.width = b.naturalWidth; c.height = b.naturalHeight;
  const g = c.getContext("2d");
  g.drawImage(b, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = farve;
  g.fillRect(0, 0, c.width, c.height);
  REAL_FARVET[noegle] = c;
  return c;
}

// ----- gulvet -----
const REAL_TOM = document.createElement("canvas");
REAL_TOM.width = REAL_TOM.height = 1;
function realGulvBillede() {
  if (erTrae(RUM.gulvFarve1)) {
    const b = hentBillede(REALISTISK.gulvTrae);
    return billedeKlar(b) ? b : null;
  }
  // fliser i rummets farve (lidt lysere, da fliserne gør farven mørkere)
  return realFarvet(REALISTISK.gulvFliser, nuance(RUM.gulvFarve1, 1.08));
}

function realGulvSti() {
  ctx.beginPath();
  for (let x = 0; x < RUM.bredde; x++) for (let y = 0; y < RUM.dybde; y++) {
    if (!erIRummet(x, y)) continue;
    const d = diamant(x, y);
    ctx.moveTo(d[0].x, d[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(d[i].x, d[i].y);
    ctx.closePath();
  }
}

// blød skygge på gulvet langs en væg (p0-p1 er væggens fod, ind = et punkt inde på gulvet)
function realVaegSkygge(p0, p1, ind, styrke) {
  const vx = p1.x - p0.x, vy = p1.y - p0.y, L = Math.hypot(vx, vy);
  if (!L) return;
  const nx = -vy / L, ny = vx / L;
  const dd = (ind.x - p0.x) * nx + (ind.y - p0.y) * ny;
  const g = ctx.createLinearGradient(p0.x, p0.y, p0.x + nx * dd, p0.y + ny * dd);
  g.addColorStop(0, "rgba(20,8,0," + styrke + ")");
  g.addColorStop(0.35, "rgba(20,8,0," + styrke * 0.35 + ")");
  g.addColorStop(1, "rgba(20,8,0,0)");
  polygon(ctx, [p0, p1, { x: p1.x + nx * dd, y: p1.y + ny * dd }, { x: p0.x + nx * dd, y: p0.y + ny * dd }], g);
}

(function () {
  const gammelGulv = tegnGulv;
  tegnGulv = function () {
    const bil = REALISTISK.til && !RUM.gulvBillede ? realGulvBillede() : null;
    if (!bil) return gammelGulv();
    // først det gamle gulv uden pixel-mønster (så kanterne forrest og særlige
    // rum-former bliver tegnet, men ingen pixel-takker stikker op ad væggen)
    const gammeltMoenster = gulvMoenster;
    gulvMoenster = function () { return REAL_TOM; };
    try { gammelGulv(); } finally { gulvMoenster = gammeltMoenster; }
    const F = bil.width / 4, o = punkt(0, 0);
    const moenster = ctx.createPattern(bil, "repeat");
    // det firkantede billede lægges ned på skrå: én felt-bredde = (48, 24), én felt-dybde = (-48, 24)
    moenster.setTransform(new DOMMatrix([FLISE_B / 2 / F, FLISE_H / 2 / F, -FLISE_B / 2 / F, FLISE_H / 2 / F, o.x, o.y]));
    ctx.save();
    realGulvSti();
    ctx.clip();
    ctx.fillStyle = moenster;
    ctx.fill();
    // skygger hvor gulvet møder væggene (felt for felt, så det også virker i L-, T- og U-rum)
    const venstre = {}, bag = {};
    for (let y = 0; y < RUM.dybde; y++) for (let x = 0; x < RUM.bredde; x++) if (erIRummet(x, y)) { venstre[x + "," + y] = 1; break; }
    for (let x = 0; x < RUM.bredde; x++) for (let y = 0; y < RUM.dybde; y++) if (erIRummet(x, y)) { bag[x + "," + y] = 1; break; }
    function skygge(x, y, side) {
      const hjoerne = venstre[x + "," + y] && bag[x + "," + y];
      const c = punkt(x, y);
      if (hjoerne) {
        // i hjørnet deler de to skygger sig ved en lodret linje, så de ikke lægges oven i hinanden
        ctx.save(); ctx.beginPath();
        if (side === "v") ctx.rect(c.x - 9999, c.y - 9999, 9999, 19998); else ctx.rect(c.x, c.y - 9999, 9999, 19998);
        ctx.clip();
      }
      if (side === "v") realVaegSkygge(punkt(x, y + 1), c, punkt(x + 0.6, y), 0.55);
      else realVaegSkygge(c, punkt(x + 1, y), punkt(x, y + 0.6), 0.45);
      if (hjoerne) ctx.restore();
    }
    Object.keys(venstre).forEach(function (k) { const a = k.split(","); skygge(+a[0], +a[1], "v"); });
    Object.keys(bag).forEach(function (k) { const a = k.split(","); skygge(+a[0], +a[1], "b"); });
    // varmt lys midt i rummet, lidt mørkere ude i hjørnerne
    const m = punkt(RUM.bredde * 0.45, RUM.dybde * 0.4);
    const r = (RUM.bredde + RUM.dybde) * FLISE_B * 0.4;
    const lys = ctx.createRadialGradient(m.x, m.y - 40, 30, m.x, m.y, r);
    lys.addColorStop(0, "rgba(255,215,150,0.14)");
    lys.addColorStop(0.55, "rgba(255,215,150,0.03)");
    lys.addColorStop(1, "rgba(20,5,0,0.22)");
    ctx.fillStyle = lys;
    realGulvSti();
    ctx.fill();
    ctx.restore();
  };
})();

// ----- væggene -----
const REAL_VAEGGE = {};
function realVaegBillede(farve, vh, moerk) {
  const noegle = farve + "|" + vh + "|" + moerk;
  if (REAL_VAEGGE[noegle]) return REAL_VAEGGE[noegle];
  const tapet = realFarvet(REALISTISK.tapet, farve);
  const panel = hentBillede(REALISTISK.panel);
  if (!tapet || !billedeKlar(panel)) return null;
  const S = 2;                                   // tegnes i dobbelt opløsning, så det er skarpt
  const B = FLISE_B / 2 * S, H = Math.round(vh * S);
  const c = document.createElement("canvas");
  c.width = B; c.height = H;
  const g = c.getContext("2d");
  // tapet (gentages opad)
  for (let y = H; y > -tapet.height; y -= tapet.height) g.drawImage(tapet, 0, y - tapet.height, B, tapet.height);
  // kronelist foroven
  const kl = 5 * S;
  const kg = g.createLinearGradient(0, 0, 0, kl);
  kg.addColorStop(0, nuance(farve, 0.6)); kg.addColorStop(0.25, nuance(farve, 1.12)); kg.addColorStop(1, nuance(farve, 0.86));
  g.fillStyle = kg; g.fillRect(0, 0, B, kl);
  const sk = g.createLinearGradient(0, kl, 0, kl + 14 * S);
  sk.addColorStop(0, "rgba(40,20,5,0.18)"); sk.addColorStop(1, "rgba(40,20,5,0)");
  g.fillStyle = sk; g.fillRect(0, kl, B, 14 * S);
  // træpanel forneden (lavere vægge får et lavere panel)
  const ph = Math.min(REALISTISK.panelHoejde, vh * 0.45) * S;
  g.drawImage(panel, 0, H - ph, B, ph);
  // samling mellem væg-stykkerne
  g.fillStyle = "rgba(30,15,5,0.10)"; g.fillRect(0, 0, 1, H - ph);
  // venstre væg er lidt mørkere (lyset kommer fra højre)
  if (moerk) { g.fillStyle = "rgba(30,15,5,0.16)"; g.fillRect(0, 0, B, H); }
  REAL_VAEGGE[noegle] = c;
  return c;
}

(function () {
  const gammelVaeg = pixelVaeg;
  pixelVaeg = function (a, b, vh, venstreVaeg) {
    if (typeof tagIngenTapet !== "undefined" && tagIngenTapet) return;   // tagterrassen har himmel i stedet for tapet
    const bil = REALISTISK.til ? realVaegBillede(RUM.vaegFarve, Math.round(vh), venstreVaeg) : null;
    if (!bil) return gammelVaeg(a, b, vh, venstreVaeg);
    const B = bil.width, S = bil.height / vh;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.transform((b.x - a.x) / B, (b.y - a.y) / B, 0, 1 / S, a.x, a.y - vh);
    ctx.drawImage(bil, 0, 0, B + 0.8, bil.height);
    ctx.restore();
    ctx.strokeStyle = "rgba(40,24,14,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - vh);
    ctx.lineTo(b.x, b.y - vh);
    ctx.stroke();
  };
})();

// billederne hentes med det samme, så de er klar, når rummet tegnes
[REALISTISK.gulvTrae, REALISTISK.gulvFliser, REALISTISK.tapet, REALISTISK.panel].forEach(hentBillede);

// ----- møbler -----
// Billederne er i dobbelt størrelse (skala 0.5), så de er skarpe, når man zoomer.
// "anker" = det sted i billedet, der står på møblets forreste hjørne.
const REAL_TYPER = [
  { id: "real-laenestol", navn: "Rød fløjlslænestol", saede: 32, centrer: true, skala: 0.5, anker: [190, 322] },
  { id: "real-sofa", navn: "Rød fløjlssofa", felter: [2, 1], saede: 30, centrer: true, skala: 0.5, ankre: [[308, 366], [212, 366], [308, 366], [212, 366]] },
  { id: "real-sofabord", navn: "Sofabord med marmor", skala: 0.5, ankre: [[160, 244], [160, 244], [160, 244], [160, 244]] },
  { id: "real-gulvlampe", navn: "Gulvlampe i messing", skala: 0.5, ankre: [[150, 398], [150, 398], [150, 398], [150, 398]] },
  { id: "real-plante", navn: "Gummitræ i krukke", skala: 0.5, ankre: [[160, 357], [160, 357], [160, 357], [160, 357]] },
  { id: "real-reception", navn: "Reception med marmor", felter: [3, 1], skala: 0.5, ankre: [[416, 418], [224, 418], [416, 418], [224, 418]] },
  { id: "real-taeppe", navn: "Rødt hoteltæppe", felter: [3, 2], kanGaaPaa: true, skala: 0.5, ankre: [[408, 330], [312, 330], [408, 330], [312, 330]] },
  { id: "real-rosa-sofa", navn: "Lyserød fløjlssofa", felter: [2, 1], saede: 30, centrer: true, skala: 0.5, ankre: [[308, 366], [212, 366], [308, 366], [212, 366]] },
  { id: "real-rosa-laenestol", navn: "Lyserød lænestol", saede: 32, centrer: true, skala: 0.5, ankre: [[190, 322], [190, 322], [190, 322], [190, 322]] },
  { id: "real-rosa-seng", navn: "Lyserød dobbeltseng", felter: [2, 2], skala: 0.5, ankre: [[280, 385], [280, 385], [280, 385], [280, 385]] },
  { id: "real-rosa-natbord", navn: "Hvidt natbord med lampe", skala: 0.5, ankre: [[150, 279], [150, 279], [150, 279], [150, 279]] },
  { id: "real-rosa-toiletbord", navn: "Toiletbord med spejl", skala: 0.5, ankre: [[160, 403], [160, 403], [160, 403], [160, 403]] },
  { id: "real-rosa-taeppe", navn: "Rundt lyserødt tæppe", felter: [2, 2], kanGaaPaa: true, skala: 0.5, ankre: [[240, 246], [240, 246], [240, 246], [240, 246]] },
  { id: "real-reol", navn: "Reol med bøger", skala: 0.5, ankre: [[160, 420], [160, 420], [160, 420], [160, 420]] },
];
REAL_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
  t.kategori = "Realistisk";
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});

// Shoppen
const REAL_PRISER = { "real-laenestol": 250, "real-sofa": 400, "real-sofabord": 180, "real-gulvlampe": 150, "real-plante": 90, "real-reol": 220,
  "real-reception": 900, "real-taeppe": 300, "real-rosa-sofa": 400, "real-rosa-laenestol": 250, "real-rosa-seng": 500,
  "real-rosa-natbord": 120, "real-rosa-toiletbord": 200, "real-rosa-taeppe": 150 };
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  Object.assign(HOTEL_MOEBEL_PRISER, REAL_PRISER);
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === "Realistisk"; })) HOTEL_SHOP_KAT.push({ kategori: "Realistisk", ikon: "✨" });
  hotelMoeblerIShop();
})(0);


// =============================================================
//  🛎 Velkomsthallen får realistiske møbler
//  (kun hvis ingen har bygget noget i hallen endnu; byggeren kan stadig ændre det)
// =============================================================
const REAL_HAL = [
  // receptionen til højre for døren
  { type: "real-reception", x: 15, y: 3, retning: 0 },
  { type: "real-plante", x: 14, y: 3, retning: 0 }, { type: "real-plante", x: 18, y: 3, retning: 0 },
  // stor hyggekrog midt i hallen
  { type: "real-taeppe", x: 10, y: 10, retning: 0 },
  { type: "real-sofa", x: 10, y: 8, retning: 0 }, { type: "real-sofa", x: 11, y: 13, retning: 2 },
  { type: "real-laenestol", x: 9, y: 10, retning: 1 }, { type: "real-laenestol", x: 13, y: 11, retning: 3 },
  { type: "real-gulvlampe", x: 9, y: 8, retning: 0 }, { type: "real-gulvlampe", x: 13, y: 13, retning: 0 },
  // læsekrog til venstre
  { type: "real-reol", x: 0, y: 12, retning: 1 }, { type: "real-reol", x: 0, y: 13, retning: 1 },
  { type: "real-laenestol", x: 2, y: 12, retning: 1 }, { type: "real-laenestol", x: 2, y: 14, retning: 1 },
  { type: "real-sofabord", x: 3, y: 13, retning: 0 }, { type: "real-plante", x: 0, y: 15, retning: 1 },
  // sofagruppe til højre
  { type: "real-sofa", x: 18, y: 14, retning: 0 }, { type: "real-sofabord", x: 18, y: 16, retning: 0 },
  { type: "real-sofabord", x: 19, y: 16, retning: 0 }, { type: "real-laenestol", x: 20, y: 16, retning: 3 },
  { type: "real-laenestol", x: 17, y: 16, retning: 1 }, { type: "real-gulvlampe", x: 20, y: 14, retning: 0 },
  // planter i hjørnerne og ved døren
  { type: "real-plante", x: 9, y: 0, retning: 0 }, { type: "real-plante", x: 13, y: 0, retning: 0 },
  { type: "real-plante", x: 0, y: 1, retning: 1 }, { type: "real-plante", x: 22, y: 0, retning: 0 },
  { type: "real-plante", x: 0, y: 22, retning: 1 }, { type: "real-plante", x: 22, y: 22, retning: 0 },
];
function realHalData() { return REAL_HAL.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; }); }
if (typeof HAL_MOEBLER !== "undefined" && HAL_MOEBLER.length === 0) {
  realHalData().forEach(function (m) { HAL_MOEBLER.push(m); });
}
// Har ingen bygget noget i hallen på serveren, ser alle de nye møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerReal = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerReal(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar.hal) && svar.hal.length)) svar.hal = realHalData();
    return svar;
  };
}

// =============================================================
//  🌸 Lyserøde møbler til dit værelse (én gang)
//  Er dit værelse tomt, bliver møblerne stillet op. Står der allerede
//  noget, kommer de lyserøde møbler i Mine ting, så du selv kan stille dem.
// =============================================================
const REAL_ROSA_NOEGLE = "mit-hotel-lyseroedt-saet-1";
const REAL_ROSA = [
  { type: "real-rosa-seng", x: 1, y: 0, retning: 0 },
  { type: "real-rosa-natbord", x: 0, y: 0, retning: 0 }, { type: "real-rosa-natbord", x: 3, y: 0, retning: 0 },
  { type: "real-rosa-toiletbord", x: 6, y: 0, retning: 0 },
  { type: "real-rosa-taeppe", x: 4, y: 4, retning: 0 },
  { type: "real-rosa-sofa", x: 4, y: 7, retning: 2 }, { type: "real-rosa-laenestol", x: 7, y: 4, retning: 3 },
  { type: "real-sofabord", x: 6, y: 6, retning: 0 },
  { type: "real-plante", x: 0, y: 4, retning: 1 }, { type: "real-gulvlampe", x: 8, y: 0, retning: 0 },
];
function realRosaSaet() {
  try { if (localStorage.getItem(REAL_ROSA_NOEGLE)) return; } catch (e) { return; }
  if (rumValg !== "vaerelse" || aktivtVaerelse !== "mit") return;
  if (typeof iFremmedLej === "function" && iFremmedLej()) return;
  if (typeof lejHentet !== "undefined" && SERVER.til && mitToken() && !lejHentet) return;   // vent på møblerne fra serveren
  const tomt = moeblerIRummet.length === 0;
  REAL_ROSA.forEach(function (m) {
    const t = MOEBEL_TYPER[m.type];
    if (!t) return;
    const tvaers = m.retning % 2 === 1;
    let plads = tomt;
    if (plads) {
      const f = moebelFelter(t, tvaers);
      for (let dx = 0; dx < f[0] && plads; dx++) for (let dy = 0; dy < f[1] && plads; dy++) {
        if (!erIRummet(m.x + dx, m.y + dy) || moebelPaa(m.x + dx, m.y + dy)) plads = false;
      }
      const d = RUM.doer;
      if (d && daekker({ type: m.type, x: m.x, y: m.y, retning: m.retning }, d.x, d.y)) plads = false;
    }
    if (plads) moeblerIRummet.push({ type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning });
    else if (typeof laegILager === "function") laegILager(m.type);
  });
  try { localStorage.setItem(REAL_ROSA_NOEGLE, "1"); } catch (e) {}
  if (typeof gem === "function") gem();
  if (typeof besked !== "undefined" && besked) besked.textContent = tomt
    ? "🌸 Dit værelse har fået lyserøde møbler!"
    : "🌸 Du har fået lyserøde møbler i Mine ting. Stil dem, hvor du vil.";
}
let realRosaVent = 0;
setInterval(function () {
  if (rumValg === "vaerelse" && aktivtVaerelse === "mit") { ++realRosaVent; }
  else realRosaVent = 0;
}, 1000);


// =============================================================
//  ✨ Flere realistiske møbler (lobby + lyserødt værelse)
// =============================================================
const REAL_TYPER_2 = [
  { id: "real-flygel", navn: "Sort flygel", felter: [2, 2], skala: 0.5, ankre: [[310,  448],  [310,  448],  [310,  448],  [310,  448]] },
  { id: "real-springvand", navn: "Springvand af marmor", felter: [2, 2], skala: 0.5, ankre: [[280,  402],  [280,  402],  [280,  402],  [280,  402]] },
  { id: "real-kuffertvogn", navn: "Bagagevogn med kufferter", skala: 0.5, ankre: [[160,  400],  [160,  400],  [160,  400],  [160,  400]] },
  { id: "real-baenk", navn: "Polstret bænk", felter: [2, 1], saede: 30, centrer: true, skala: 0.5, ankre: [[288,  275],  [192,  275],  [288,  275],  [192,  275]] },
  { id: "real-palme", navn: "Palme i guldkrukke", skala: 0.5, ankre: [[220,  423],  [220,  423],  [220,  423],  [220,  423]] },
  { id: "real-rosa-klaedeskab", navn: "Hvidt klædeskab", felter: [2, 1], skala: 0.5, ankre: [[288,  525],  [192,  525],  [288,  525],  [192,  525]] },
  { id: "real-rosa-skrivebord", navn: "Hvidt skrivebord", felter: [2, 1], skala: 0.5, ankre: [[288,  374],  [192,  374],  [288,  374],  [192,  374]] },
  { id: "real-rosa-stol", navn: "Lyserød stol", saede: 31, centrer: true, skala: 0.5, ankre: [[150,  297],  [150,  297],  [150,  297],  [150,  297]] },
  { id: "real-rosa-puf", navn: "Lyserød puf", saede: 29, centrer: true, skala: 0.5, ankre: [[150,  234],  [150,  234],  [150,  234],  [150,  234]] },
  { id: "real-rosa-reol", navn: "Hvid reol med bøger", skala: 0.5, ankre: [[160,  420],  [160,  420],  [160,  420],  [160,  420]] },
  { id: "real-rosa-gulvlampe", navn: "Lyserød gulvlampe", skala: 0.5, ankre: [[150,  398],  [150,  398],  [150,  398],  [150,  398]] },
  { id: "real-rosa-plante", navn: "Lyserød hortensia", skala: 0.5, ankre: [[150,  261],  [150,  261],  [150,  261],  [150,  261]] },
];
REAL_TYPER_2.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
  t.kategori = "Realistisk";
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});
Object.assign(REAL_PRISER, { "real-flygel": 1200, "real-springvand": 1000, "real-kuffertvogn": 260, "real-baenk": 240, "real-palme": 160,
  "real-rosa-klaedeskab": 380, "real-rosa-skrivebord": 300, "real-rosa-stol": 140, "real-rosa-puf": 90, "real-rosa-reol": 220,
  "real-rosa-gulvlampe": 150, "real-rosa-plante": 80 });
if (typeof HOTEL_MOEBEL_PRISER !== "undefined") {
  Object.assign(HOTEL_MOEBEL_PRISER, REAL_PRISER);
  if (typeof hotelMoeblerIShop === "function") hotelMoeblerIShop();
}

// Flere møbler i lobbyen
REAL_HAL.push(
  // springvand foran hyggekrogen, bænke på hver side
  { type: "real-springvand", x: 11, y: 18, retning: 0 },
  { type: "real-baenk", x: 8, y: 18, retning: 1 }, { type: "real-baenk", x: 14, y: 18, retning: 3 },
  // flygel ved højre side
  { type: "real-flygel", x: 20, y: 8, retning: 0 }, { type: "real-palme", x: 22, y: 8, retning: 0 },
  // bagagevogn ved receptionen
  { type: "real-kuffertvogn", x: 19, y: 4, retning: 0 },
  // lille café-hjørne foran til venstre
  { type: "cafe-bord", x: 4, y: 19, retning: 0 }, { type: "cafe-stol", x: 3, y: 19, retning: 1 }, { type: "cafe-stol", x: 4, y: 18, retning: 0 },
  { type: "cafe-bord", x: 7, y: 21, retning: 0 }, { type: "cafe-stol", x: 6, y: 21, retning: 1 }, { type: "cafe-stol", x: 7, y: 20, retning: 0 },
  // palmer
  { type: "real-palme", x: 5, y: 0, retning: 0 }, { type: "real-palme", x: 17, y: 0, retning: 0 },
  { type: "real-palme", x: 0, y: 18, retning: 1 }, { type: "real-palme", x: 22, y: 18, retning: 0 }
);
if (typeof HAL_MOEBLER !== "undefined" && HAL_MOEBLER.length && HAL_MOEBLER.every(function (m) { return String(m.type).indexOf("real-") === 0; })) {
  HAL_MOEBLER.length = 0; realHalData().forEach(function (m) { HAL_MOEBLER.push(m); });
}

// Flere lyserøde møbler (én gang). Kun hvis der er plads, ellers i Mine ting.
const REAL_ROSA_2_NOEGLE = "mit-hotel-lyseroedt-saet-2";
const REAL_ROSA_2 = [
  { type: "real-rosa-klaedeskab", x: 0, y: 6, retning: 1 },
  { type: "real-rosa-reol", x: 5, y: 0, retning: 0 }, { type: "real-rosa-plante", x: 4, y: 0, retning: 0 },
  { type: "real-rosa-skrivebord", x: 9, y: 6, retning: 3 }, { type: "real-rosa-stol", x: 8, y: 6, retning: 1 },
  { type: "real-rosa-puf", x: 6, y: 5, retning: 0 },
  { type: "real-rosa-gulvlampe", x: 3, y: 7, retning: 0 },
  { type: "real-rosa-plante", x: 0, y: 8, retning: 1 },
];
function realRosaSaet2() {
  try { if (localStorage.getItem(REAL_ROSA_2_NOEGLE) || !localStorage.getItem(REAL_ROSA_NOEGLE)) return; } catch (e) { return; }
  if (rumValg !== "vaerelse" || aktivtVaerelse !== "mit") return;
  if (typeof iFremmedLej === "function" && iFremmedLej()) return;
  if (typeof lejHentet !== "undefined" && SERVER.til && mitToken() && !lejHentet) return;
  let stillet = 0, iLager = 0;
  REAL_ROSA_2.forEach(function (m) {
    const t = MOEBEL_TYPER[m.type];
    if (!t) return;
    const f = moebelFelter(t, m.retning % 2 === 1);
    let plads = true;
    for (let dx = 0; dx < f[0] && plads; dx++) for (let dy = 0; dy < f[1] && plads; dy++) {
      if (!erIRummet(m.x + dx, m.y + dy) || moebelPaa(m.x + dx, m.y + dy)) plads = false;
    }
    const d = RUM.doer;
    if (plads && d && daekker({ type: m.type, x: m.x, y: m.y, retning: m.retning }, d.x, d.y)) plads = false;
    if (plads) { moeblerIRummet.push({ type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }); stillet++; }
    else if (typeof laegILager === "function") { laegILager(m.type); iLager++; }
  });
  try { localStorage.setItem(REAL_ROSA_2_NOEGLE, "1"); } catch (e) {}
  if (typeof gem === "function") gem();
  if (typeof besked !== "undefined" && besked) besked.textContent = iLager
    ? "🌸 " + stillet + " nye lyserøde møbler er stillet op, og " + iLager + " ligger i Mine ting."
    : "🌸 Dit værelse har fået flere lyserøde møbler!";
}
setInterval(function () {
}, 1000);

// =============================================================
//  ☕ Caféens møbler bliver realistiske (samme navne, så opstillingen bliver)
// =============================================================
const REAL_CAFE = {
  "cafe-stol": { saede: 32, centrer: true, ankre: [[150,  307],  [150,  307],  [150,  307],  [150,  307]] },
  "cafe-bord": { ankre: [[150,  287],  [150,  287],  [150,  287],  [150,  287]] },
  "cafe-sofa": { saede: 30, centrer: true, ankre: [[308,  376],  [212,  376],  [308,  376],  [212,  376]] },
  "cafe-disk": { ankre: [[308,  439],  [212,  439],  [308,  439],  [212,  439]] },
  "cafe-lampe": { ankre: [[150,  408],  [150,  408],  [150,  408],  [150,  408]] },
  "cafe-plante": { ankre: [[220,  423],  [220,  423],  [220,  423],  [220,  423]] },
  "cafe-tavle": { ankre: [[150,  314],  [150,  314],  [150,  314],  [150,  314]] },
};
function realOmbyt(liste, mappe) {
  let mangler = 0;
  Object.keys(liste).forEach(function (id) {
    const t = MOEBEL_TYPER[id];
    if (!t) { mangler++; return; }
    if (t.realistisk) return;
    Object.assign(t, liste[id]);
    t.skala = 0.5; t.realistisk = true; delete t.anker;
    t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + mappe + "/" + id + "-" + i + ".png"; });
    t.billede = null; t.klip = null;
    forberedRetninger(t);
  });
  return mangler;
}
// Tagterrassen, hjørnerne og biografen (deres møbler kommer, når rummene er hentet)
const REAL_TAG = {
  "tag-havestol": { ankre: [[160,  307],  [160,  307],  [160,  307],  [160,  307]], saede: 31, centrer: true },
  "tag-baenk": { ankre: [[298,  341],  [202,  341],  [298,  341],  [202,  341]], saede: 31, centrer: true },
  "tag-loungesofa": { ankre: [[308,  348],  [212,  348],  [308,  348],  [212,  348]], saede: 31, centrer: true },
  "tag-bord": { ankre: [[160,  297],  [160,  297],  [160,  297],  [160,  297]] },
  "tag-parasol": { ankre: [[310,  526],  [310,  526],  [310,  526],  [310,  526]] },
  "tag-plantekasse": { ankre: [[160,  271],  [160,  271],  [160,  271],  [160,  271]] },
  "tag-oliventrae": { ankre: [[220,  465],  [220,  465],  [220,  465],  [220,  465]] },
  "tag-isvogn": { ankre: [[190,  438],  [190,  438],  [190,  438],  [190,  438]] },
};
const REAL_HJOERNE = {
  "spil-arkade": { ankre: [[160,  445],  [160,  445],  [160,  445],  [160,  445]] },
  "spil-billard": { ankre: [[308,  338],  [212,  338],  [308,  338],  [212,  338]] },
  "spil-bordfodbold": { ankre: [[288,  338],  [192,  338],  [288,  338],  [192,  338]] },
  "spil-skakbord": { ankre: [[150,  269],  [150,  269],  [150,  269],  [150,  269]] },
  "spil-saekkestol": { ankre: [[160,  254],  [160,  254],  [160,  254],  [160,  254]], saede: 22, centrer: true },
  "spil-hylde": { ankre: [[160,  393],  [160,  393],  [160,  393],  [160,  393]] },
  "laese-reol": { ankre: [[160,  420],  [160,  420],  [160,  420],  [160,  420]] },
  "laese-laenestol": { ankre: [[170,  342],  [170,  342],  [170,  342],  [170,  342]], saede: 33, centrer: true },
  "laese-sofa": { ankre: [[308,  366],  [212,  366],  [308,  366],  [212,  366]], saede: 32, centrer: true },
  "laese-lampe": { ankre: [[150,  390],  [150,  390],  [150,  390],  [150,  390]] },
  "laese-bord": { ankre: [[150,  261],  [150,  261],  [150,  261],  [150,  261]] },
  "laese-kamin": { ankre: [[298,  394],  [202,  394],  [298,  394],  [202,  394]] },
  "laese-globus": { ankre: [[150,  324],  [150,  324],  [150,  324],  [150,  324]] },
};
const REAL_BIO = {
  "bio-saede": { ankre: [[160,  324],  [160,  324],  [160,  324],  [160,  324]], saede: 32, centrer: true },
  "popcorn-maskine": { ankre: [[160,  410],  [160,  410],  [160,  410],  [160,  410]] },
};
let realOmbytFaerdig = false;
const realOmbytTimer = setInterval(function () {
  const mangler = realOmbyt(REAL_CAFE, "real-cafe") + realOmbyt(REAL_TAG, "real-tag") + realOmbyt(REAL_HJOERNE, "real-hjoerner") + realOmbyt(REAL_BIO, "real-biograf");
  if (!mangler) { realOmbytFaerdig = true; clearInterval(realOmbytTimer); }
}, 500);
realOmbyt(REAL_CAFE, "real-cafe");

// =============================================================
//  🌸 Indret dit værelse helt med de lyserøde møbler (én gang)
//  Dine gamle møbler lægges i Mine ting, så du kan stille dem igen.
// =============================================================
const REAL_ROSA_3_NOEGLE = "mit-hotel-lyseroedt-saet-3";
function realRosaIndret() {
  try { if (localStorage.getItem(REAL_ROSA_3_NOEGLE)) return; } catch (e) { return; }
  if (rumValg !== "vaerelse" || aktivtVaerelse !== "mit") return;
  if (typeof iFremmedLej === "function" && iFremmedLej()) return;
  if (typeof lejHentet !== "undefined" && SERVER.til && mitToken() && !lejHentet) return;
  if (typeof laegILager !== "function" || typeof lager === "undefined") return;
  const alle = REAL_ROSA.concat(REAL_ROSA_2);
  const staar = moeblerIRummet.filter(function (m) { return alle.some(function (a) { return a.type === m.type && a.x === m.x && a.y === m.y; }); }).length;
  if (staar < alle.length - 2) {
    // de gamle møbler i Mine ting
    moeblerIRummet.slice().forEach(function (m) { laegILager(m.type); });
    moeblerIRummet.length = 0;
    alle.forEach(function (m) {
      const t = MOEBEL_TYPER[m.type];
      if (!t) return;
      const f = moebelFelter(t, m.retning % 2 === 1);
      let plads = true;
      for (let dx = 0; dx < f[0] && plads; dx++) for (let dy = 0; dy < f[1] && plads; dy++) {
        if (!erIRummet(m.x + dx, m.y + dy) || moebelPaa(m.x + dx, m.y + dy)) plads = false;
      }
      const d = RUM.doer;
      if (plads && d && daekker({ type: m.type, x: m.x, y: m.y, retning: m.retning }, d.x, d.y)) plads = false;
      const iLager = lager.some(function (l) { return l.type === m.type; });
      if (plads) {
        moeblerIRummet.push({ type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning });
        if (iLager && typeof fraLager === "function") fraLager(m.type);     // så du ikke får den to gange
      } else if (!iLager) laegILager(m.type);
    });
    if (typeof gem === "function") gem();
    if (typeof besked !== "undefined" && besked) besked.textContent = "🌸 Dit værelse er indrettet med lyserøde møbler! Dine gamle møbler ligger i Mine ting.";
  }
  try {
    localStorage.setItem(REAL_ROSA_NOEGLE, "1"); localStorage.setItem(REAL_ROSA_2_NOEGLE, "1"); localStorage.setItem(REAL_ROSA_3_NOEGLE, "1");
  } catch (e) {}
}
setInterval(function () {
  if (rumValg === "vaerelse" && aktivtVaerelse === "mit" && realRosaVent >= 3) realRosaIndret();
}, 1000);
