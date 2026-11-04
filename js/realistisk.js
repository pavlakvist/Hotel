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
  gulvTrae: "billeder/realistisk/gulv-eg.jpg",       // 4 x 4 felter, gentager sig sømløst
  gulvFliser: "billeder/realistisk/gulv-fliser.jpg", // gråt, farves med rummets gulvfarve
  tapet: "billeder/realistisk/tapet.png",            // lyst, farves med rummets vægfarve
  panel: "billeder/realistisk/panel.png",            // træpanel nederst på væggen
  panelHoejde: 50,                                   // panelets højde i spil-pixels
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
const REAL_PRISER = { "real-laenestol": 250 };
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  Object.assign(HOTEL_MOEBEL_PRISER, REAL_PRISER);
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === "Realistisk"; })) HOTEL_SHOP_KAT.push({ kategori: "Realistisk", ikon: "✨" });
  hotelMoeblerIShop();
})(0);
