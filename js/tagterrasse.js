// =============================================================
//  Tagterrassen ☀️ — et fælles rum udenfor, oppe på hotellets tag.
//  - Blå himmel med skyer, der svæver forbi, en sol, der skinner, og små fugle.
//  - Ude i horisonten ligger byen, og under terrassen ses hotellets facade.
//  - Rækværk af glas langs kanten, og elevatoren står i et lille hus på taget.
//  - Udendørs møbler, man kan sidde på (havestole, bænke, loungesofaer),
//    borde, parasoller, plantekasser, oliventræer og en isvogn:
//    klik på isvognen, så får du en is 🍦 i hånden (som fra køleskabet, js/koeleskab.js).
//  Møblerne står i js/moebel-katalog.js (kategori "Tagterrasse"), billederne i billeder/moebler/tag-*/.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
//  database-26-tagterrasse.sql lader Bygmestre flytte møblerne (så alle ser det samme).
// =============================================================

// -------------------------------------------------------------
//  Rummet
// -------------------------------------------------------------
const TAG_RUM = { id: "tagterrasse", navn: "Tagterrassen", ejer: EJER_NAVNE[0], bredde: 14, dybde: 12,
  vaeg: "#9fd3f2", gulv1: "#b07a48", gulv2: "#9c6a3e", vaegHoejde: 200, doer: null };   // træterrasse; ingen dør: man kommer med elevatoren
INDBYGGEDE_RUM.tagterrasse = TAG_RUM;
function iTagterrassen() { return rumValg === "vaerelse" && aktivtVaerelse === "tagterrasse"; }

// Etagen "Taghaven" i navigatøren hedder nu Tagterrassen
(function () {
  const e = ETAGER.find(function (x) { return x.id === "tag"; });
  if (e) { e.navn = "Tagterrassen"; e.ikon = "☀️"; }
})();
NAV_RUM.push({ id: "tagterrasse", etage: "tag", navn: "Tagterrassen", om: "Sol, skyer og is på taget ☀️",
  billede: "billeder/rum/tagterrasse.png", maks: 40, rum: "vaerelse", vaerelse: "tagterrasse" });

// Hotellets egne møbler på terrassen (retning 0 vender ned mod venstre, 1 ned mod højre)
const TAG_MOEBLER = [
  // loungehjørne bagerst til højre
  { type: "tag-loungesofa", x: 8, y: 1, retning: 0 },
  { type: "tag-bord", x: 9, y: 3, retning: 0 },
  { type: "tag-havestol", x: 7, y: 3, retning: 1 },
  { type: "tag-parasol", x: 11, y: 2, retning: 0 },
  // loungehjørne bagerst til venstre
  { type: "tag-loungesofa", x: 3, y: 1, retning: 0 },
  { type: "tag-bord", x: 4, y: 3, retning: 0 },
  { type: "tag-havestol", x: 3, y: 3, retning: 1 },
  // havestole om et bord med parasol
  { type: "tag-bord", x: 10, y: 7, retning: 0 },
  { type: "tag-havestol", x: 9, y: 7, retning: 1 },
  { type: "tag-havestol", x: 10, y: 6, retning: 0 },
  { type: "tag-parasol", x: 11, y: 6, retning: 0 },
  // bænke forrest, med udsigt over byen
  { type: "tag-baenk", x: 3, y: 10, retning: 0 },
  { type: "tag-parasol", x: 5, y: 10, retning: 0 },
  { type: "tag-baenk", x: 6, y: 10, retning: 0 },
  // isvognen
  { type: "tag-isvogn", x: 13, y: 9, retning: 0 },
  // grønt
  { type: "tag-oliventrae", x: 0, y: 0, retning: 0 },
  { type: "tag-oliventrae", x: 13, y: 0, retning: 0 },
  { type: "tag-oliventrae", x: 0, y: 11, retning: 0 },
  { type: "tag-plantekasse", x: 5, y: 0, retning: 0 },
  { type: "tag-plantekasse", x: 6, y: 0, retning: 0 },
  { type: "tag-plantekasse", x: 12, y: 0, retning: 0 },
  { type: "tag-plantekasse", x: 1, y: 11, retning: 0 },
  { type: "tag-plantekasse", x: 13, y: 4, retning: 0 },
  { type: "tag-plantekasse", x: 13, y: 5, retning: 0 },
];
function tagSomData() {
  return TAG_MOEBLER.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
}
// Har browseren en gammel udgave af js/moebel-katalog.js, kommer terrassens møbler med herfra
(function () {
  if (MOEBEL_TYPER["tag-havestol"]) return;
  const r = function (id) { return [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + id + "/" + id + "-" + i + ".png"; }); };
  [
    { id: "tag-havestol", navn: "Havestol", retninger: r("tag-havestol"), saede: 20 },
    { id: "tag-baenk", navn: "Havebænk", retninger: r("tag-baenk"), felter: [2, 1], saede: 19 },
    { id: "tag-loungesofa", navn: "Loungesofa", retninger: r("tag-loungesofa"), felter: [2, 1], saede: 22 },
    { id: "tag-bord", navn: "Havebord", retninger: r("tag-bord") },
    { id: "tag-parasol", navn: "Parasol", retninger: ["billeder/moebler/tag-parasol/tag-parasol-0.png", null, null, null] },
    { id: "tag-plantekasse", navn: "Plantekasse med blomster", retninger: r("tag-plantekasse") },
    { id: "tag-oliventrae", navn: "Oliventræ", retninger: r("tag-oliventrae") },
    { id: "tag-isvogn", navn: "Isvogn", retninger: r("tag-isvogn") },
  ].forEach(function (t) {
    t.kategori = "Tagterrasse";
    MOEBLER.push(t);
    MOEBEL_TYPER[t.id] = t;
    forberedRetninger(t);
  });
})();

// Møblerne: det, der er gemt på denne computer, ellers hotellets egne
const vaerelseMoeblerFoerTag = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === "tagterrasse" && !andreVaerelser.tagterrasse) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-tagterrasse") || "null"); } catch (e) {}
    andreVaerelser.tagterrasse = (Array.isArray(gemt) && gemt.length ? gemt : tagSomData())
      .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
  }
  return vaerelseMoeblerFoerTag(id);
};
// Har ingen bygget noget på terrassen endnu, ser alle hotellets egne møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerTag = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerTag(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar.tagterrasse) && svar.tagterrasse.length)) svar.tagterrasse = tagSomData();
    return svar;
  };
}

// Velkomst
const skiftRumFoerTag = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerTag(navn);
  if (iTagterrassen()) besked.textContent = "Velkommen på Tagterrassen ☀️ Find en solstol, og hent en is ved isvognen 🍦";
};


// -------------------------------------------------------------
//  Himlen: farver, sol, skyer og fugle
// -------------------------------------------------------------
const TAG_SKYER = [];
for (let i = 0; i < 9; i++) {
  TAG_SKYER.push({ x: pixelStoej(i, 1, 2) * 1600, y: 0.04 + pixelStoej(i, 2, 3) * 0.34,
    fart: 5 + pixelStoej(i, 3, 4) * 9, stoer: 2 + Math.floor(pixelStoej(i, 4, 5) * 3), form: i % 4 });
}
const TAG_FUGLE = [0, 1, 2].map(function (i) { return { x: -200 - i * 500, y: 0.12 + i * 0.07, fart: 30 + i * 8 }; });
const TAG_SPRITES = {};

// En sky som lille pixel-billede (tegnes 3 gange større, så den passer til pixel-stilen)
function tagSky(form) {
  if (TAG_SPRITES["sky" + form]) return TAG_SPRITES["sky" + form];
  const B = 64, H = 26;
  const c = document.createElement("canvas");
  c.width = B; c.height = H;
  const g = c.getContext("2d");
  const data = g.createImageData(B, H);
  const bobler = [];
  const n = 4 + form;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    bobler.push({ x: 8 + t * (B - 16), y: H - 9 - Math.sin(t * Math.PI) * (5 + form) - pixelStoej(i, form, 6) * 3, r: 6 + Math.sin(t * Math.PI) * (4 + form) + pixelStoej(i, form, 7) * 2 });
  }
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < B; px++) {
      let inde = false, lys = 0;
      bobler.forEach(function (b) {
        const d = Math.hypot(px + 0.5 - b.x, py + 0.5 - b.y);
        if (d < b.r) { inde = true; lys = Math.max(lys, (b.y - (py + 0.5)) / b.r); }
      });
      if (py > H - 6) inde = inde && px > 5 && px < B - 6;
      if (!inde) continue;
      let rgb = [255, 255, 255];
      if (py > H - 9) rgb = [214, 230, 244];             // skygge forneden
      else if (lys < -0.1) rgb = [236, 244, 251];
      const i = (py * B + px) * 4;
      data.data[i] = rgb[0]; data.data[i + 1] = rgb[1]; data.data[i + 2] = rgb[2]; data.data[i + 3] = 245;
    }
  }
  g.putImageData(data, 0, 0);
  TAG_SPRITES["sky" + form] = c;
  return c;
}

// Solen som pixel-billede
function tagSol() {
  if (TAG_SPRITES.sol) return TAG_SPRITES.sol;
  const S = 24;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const g = c.getContext("2d");
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      const d = Math.hypot(px + 0.5 - S / 2, py + 0.5 - S / 2);
      if (d > S / 2 - 0.5) continue;
      g.fillStyle = d > S / 2 - 2 ? "#ffb52e" : (px + py < S * 0.75 && d < S / 2 - 4) ? "#fff6b8" : "#ffd94a";
      g.fillRect(px, py, 1, 1);
    }
  }
  TAG_SPRITES.sol = c;
  return c;
}

function tegnHimmel(t) {
  const hy = punkt(0, 0).y + 30;                                  // horisonten (lige bag terrassen)
  const himmel = ctx.createLinearGradient(0, 0, 0, hy);
  himmel.addColorStop(0, "#4f9fe0");
  himmel.addColorStop(0.6, "#86c5ef");
  himmel.addColorStop(1, "#d3ecf9");
  ctx.fillStyle = himmel;
  ctx.fillRect(-10, -10, BREDDE + 20, hy + 10);
  const jord = ctx.createLinearGradient(0, hy, 0, HOEJDE);
  jord.addColorStop(0, "#c9e1ea");
  jord.addColorStop(1, "#a8c7b8");
  ctx.fillStyle = jord;
  ctx.fillRect(-10, hy, BREDDE + 20, HOEJDE - hy + 10);

  // solen med glød og stråler, der drejer langsomt
  const sx = BREDDE * 0.82, sy = Math.max(70, Math.min(hy - 160, HOEJDE * 0.16));
  const gloed = ctx.createRadialGradient(sx, sy, 10, sx, sy, 150);
  gloed.addColorStop(0, "rgba(255,243,170,0.85)");
  gloed.addColorStop(0.35, "rgba(255,236,150,0.3)");
  gloed.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = gloed;
  ctx.fillRect(sx - 150, sy - 150, 300, 300);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(t * 0.12);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, l = 58 + (i % 2 ? 0 : 14) + Math.sin(t * 2 + i) * 4;
    ctx.fillStyle = i % 2 ? "rgba(255,214,90,0.75)" : "rgba(255,228,120,0.9)";
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.09) * 40, Math.sin(a - 0.09) * 40);
    ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l);
    ctx.lineTo(Math.cos(a + 0.09) * 40, Math.sin(a + 0.09) * 40);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tagSol(), sx - 36, sy - 36, 72, 72);
  ctx.restore();

  // skyerne svæver langsomt forbi
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  TAG_SKYER.forEach(function (s) {
    const b = tagSky(s.form), w = b.width * s.stoer, h = b.height * s.stoer;
    const spor = BREDDE + w + 200;
    const x = ((s.x + t * s.fart - KAMERA.x / ZOOM * 0.2) % spor + spor) % spor - w - 100;
    const y = 20 + s.y * Math.max(200, hy - 100);
    ctx.drawImage(b, Math.round(x), Math.round(y), w, h);
  });
  ctx.restore();

  // små fugle, der flyver forbi en gang imellem
  TAG_FUGLE.forEach(function (f, i) {
    const spor = BREDDE + 1400;
    const x = ((f.x + t * f.fart) % spor + spor) % spor - 200;
    const y = HOEJDE * f.y + Math.sin(t * 1.3 + i) * 8;
    const vinge = Math.sin(t * 9 + i * 2) * 4;
    ctx.strokeStyle = "#3a4a5c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - 7, y - vinge);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 7, y - vinge);
    ctx.stroke();
  });

  // byen ude i horisonten
  const forskyd = KAMERA.x / ZOOM * 0.35;
  for (let i = -30; i < 60; i++) {
    const x = i * 46 + forskyd;
    if (x < -80 || x > BREDDE + 80) continue;
    const r1 = pixelStoej(i, 7, 1), r2 = pixelStoej(i, 8, 2);
    const w = 30 + r1 * 34, h = 30 + r2 * 120;
    const tone = 0.9 + pixelStoej(i, 9, 3) * 0.12;
    ctx.fillStyle = "rgb(" + Math.round(150 * tone) + "," + Math.round(182 * tone) + "," + Math.round(206 * tone) + ")";
    ctx.fillRect(x, hy - h, w, h);
    if (r1 > 0.7) ctx.fillRect(x + w / 2 - 1, hy - h - 16, 2, 16);           // antenne
    ctx.fillStyle = "rgba(240,248,255,0.55)";                                 // vinduer
    for (let wy = hy - h + 6; wy < hy - 6; wy += 9) {
      for (let wx = x + 4; wx < x + w - 5; wx += 7) if (pixelStoej(wx, wy, 5) > 0.45) ctx.fillRect(wx, wy, 3, 4);
    }
  }
  const dis = ctx.createLinearGradient(0, hy - 150, 0, hy + 10);
  dis.addColorStop(0, "rgba(211,236,249,0)");
  dis.addColorStop(1, "rgba(211,236,249,0.75)");
  ctx.fillStyle = dis;
  ctx.fillRect(-10, hy - 150, BREDDE + 20, 160);
}

// Hotellets facade under terrassen (sandsten med vinduer og en vinrød kant)
function tegnFacade() {
  const v = punkt(0, RUM.dybde), m = punkt(RUM.bredde, RUM.dybde), h = punkt(RUM.bredde, 0);
  const D = 1400;
  polygon(ctx, [v, m, { x: m.x, y: m.y + D }, { x: v.x, y: v.y + D }], "#ead2a8");
  polygon(ctx, [m, h, { x: h.x, y: h.y + D }, { x: m.x, y: m.y + D }], "#cdb088");
  // vinrød gesims med guldkant lige under gulvet
  polygon(ctx, [{ x: v.x, y: v.y + 8 }, { x: m.x, y: m.y + 8 }, { x: m.x, y: m.y + 24 }, { x: v.x, y: v.y + 24 }], "#7a2832");
  polygon(ctx, [{ x: m.x, y: m.y + 8 }, { x: h.x, y: h.y + 8 }, { x: h.x, y: h.y + 24 }, { x: m.x, y: m.y + 24 }], "#63202a");
  polygon(ctx, [{ x: v.x, y: v.y + 24 }, { x: m.x, y: m.y + 24 }, { x: h.x, y: h.y + 24 }, { x: h.x, y: h.y + 27 }, { x: m.x, y: m.y + 27 }, { x: v.x, y: v.y + 27 }], "#d9a441");
  // vinduer: ét pr. felt, i flere etager
  function vindue(a, b, top, farve, ramme) {
    const p = function (t, n) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + n }; };
    polygon(ctx, [p(0.22, top), p(0.78, top), p(0.78, top + 58), p(0.22, top + 58)], ramme);
    polygon(ctx, [p(0.28, top + 5), p(0.72, top + 5), p(0.72, top + 53), p(0.28, top + 53)], farve);
    polygon(ctx, [p(0.28, top + 26), p(0.72, top + 26), p(0.72, top + 29), p(0.28, top + 29)], ramme);
  }
  for (let etage = 0; etage < 8; etage++) {
    const top = 52 + etage * 110;
    for (let x = 0; x < RUM.bredde; x++) vindue(punkt(x, RUM.dybde), punkt(x + 1, RUM.dybde), top, "#7fb0d6", "#fbf6ea");
    for (let y = RUM.dybde; y > 0; y--) vindue(punkt(RUM.bredde, y), punkt(RUM.bredde, y - 1), top, "#6a98bd", "#e6dcc6");
  }
  // længere nede forsvinder facaden i disen
  const ned = Math.min(v.y, h.y);
  const dis = ctx.createLinearGradient(0, ned + 120, 0, ned + 700);
  dis.addColorStop(0, "rgba(201,225,234,0)");
  dis.addColorStop(1, "rgba(201,225,234,0.9)");
  ctx.fillStyle = dis;
  ctx.fillRect(-10, ned + 120, BREDDE + 20, Math.max(0, HOEJDE - ned));
}

// Det lille hus på taget, som elevatoren står i (på venstre kant)
function tagHus() {
  const yA = ELEVATOR.fra - 0.35, yB = ELEVATOR.til + 0.35, d = 0.7, H = 196;
  const op = function (p, n) { return { x: p.x, y: p.y - n }; };
  const fA = punkt(0, yA), fB = punkt(0, yB), bA = punkt(-d, yA), bB = punkt(-d, yB);
  polygon(ctx, [fB, fA, op(fA, H), op(fB, H)], "#efe2c8");                   // væggen ind mod terrassen
  polygon(ctx, [bB, fB, op(fB, H), op(bB, H)], "#d9c6a2");                   // enden
  for (let n = 14; n < H; n += 14) {                                          // pudsede linjer
    ctx.strokeStyle = "rgba(160,130,90,0.18)";
    ctx.beginPath(); ctx.moveTo(fB.x, fB.y - n); ctx.lineTo(fA.x, fA.y - n); ctx.stroke();
  }
  polygon(ctx, [op(bA, H + 8), op(fA, H + 8), op(fB, H + 8), op(bB, H + 8)], "#7a2832");   // fladt tag
  polygon(ctx, [op(fB, H), op(fA, H), op(fA, H + 8), op(fB, H + 8)], "#d9a441");
  polygon(ctx, [op(bB, H), op(fB, H), op(fB, H + 8), op(bB, H + 8)], "#b8862f");
}

// Rækværk af glas med hvide stolper og en håndliste af træ (bagkant og venstre kant)
function tagRaekvaerk() {
  const RH = 46;
  const husFra = ELEVATOR.fra - 0.35, husTil = ELEVATOR.til + 0.35;
  function stykke(a, b) {
    polygon(ctx, [a, b, { x: b.x, y: b.y - RH }, { x: a.x, y: a.y - RH }], "rgba(214,240,255,0.32)");
    ctx.strokeStyle = "rgba(255,255,255,0.7)";                                // glans
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x + (b.x - a.x) * 0.25, a.y + (b.y - a.y) * 0.25 - 8);
    ctx.lineTo(a.x + (b.x - a.x) * 0.42, a.y + (b.y - a.y) * 0.42 - RH + 6);
    ctx.stroke();
  }
  function stolpe(p) {
    ctx.fillStyle = "#f6f1e6"; ctx.fillRect(p.x - 2, p.y - RH - 2, 4, RH + 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(p.x + 1, p.y - RH - 2, 1, RH + 2);
  }
  function liste(a, b) {
    ctx.strokeStyle = "#7a4a26"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y - RH); ctx.lineTo(b.x, b.y - RH); ctx.stroke();
    ctx.strokeStyle = "#b07a48"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(a.x, a.y - RH - 1); ctx.lineTo(b.x, b.y - RH - 1); ctx.stroke();
    ctx.lineWidth = 1;
  }
  // venstre kant (forfra og bagud, uden om elevatorhuset)
  const venstre = [];
  for (let y = RUM.dybde; y > 0; y--) {
    if (y - 1 >= husTil || y <= husFra) { venstre.push([punkt(0, y), punkt(0, y - 1)]); continue; }
    if (y > husTil) venstre.push([punkt(0, y), punkt(0, husTil)]);
    if (y - 1 < husFra) venstre.push([punkt(0, husFra), punkt(0, y - 1)]);
  }
  const bag = [];
  for (let x = 0; x < RUM.bredde; x++) bag.push([punkt(x, 0), punkt(x + 1, 0)]);
  venstre.concat(bag).forEach(function (s) { stykke(s[0], s[1]); });
  venstre.concat(bag).forEach(function (s) { liste(s[0], s[1]); });
  venstre.concat(bag).forEach(function (s) { stolpe(s[0]); stolpe(s[1]); });
}

// Væggene: på terrassen er der himmel og rækværk i stedet for tapet
let tagIngenTapet = false;
const pixelVaegFoerTag = pixelVaeg;
pixelVaeg = function (a, b, vh, venstreVaeg) {
  if (tagIngenTapet) return;
  pixelVaegFoerTag(a, b, vh, venstreVaeg);
};
const tegnVaeggeFoerTag = tegnVaegge;
tegnVaegge = function () {
  if (!iTagterrassen()) { tegnVaeggeFoerTag(); return; }
  const t = performance.now() / 1000;
  ctx.save();
  tegnHimmel(t);
  tegnFacade();
  if (typeof ELEVATOR !== "undefined") tagHus();
  ctx.restore();
  tagIngenTapet = true;
  try { tegnVaeggeFoerTag(); } finally { tagIngenTapet = false; }   // elevatoren o.l. tegnes stadig
  tagRaekvaerk();
};


// -------------------------------------------------------------
//  Isvognen 🍦: klik på den, så går du derhen og får en is i hånden
// -------------------------------------------------------------
let gaarTilIsvogn = null;    // { m, x, y }
function erIsvogn(m) { return !!m && m.type === "tag-isvogn"; }
function isKlar() { return typeof MAD !== "undefined" && MAD.is && typeof giHaand === "function"; }

// Er musen over billedet af en isvogn? (hele billedet tæller, ikke kun feltet)
function isvognUnderMus(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  moeblerIRummet.forEach(function (m) {
    if (!erIsvogn(m)) return;
    const t = MOEBEL_TYPER[m.type];
    const b = hentBillede(t.retninger[m.retning || 0]);
    if (!billedeKlar(b)) return;
    const sted = moebelSted(t, m.x, m.y, drejetTvaers(m));
    const venstre = sted.x - b.naturalWidth / 2, top = sted.y + FLISE_H / 2 - b.naturalHeight;
    const inde = sx >= venstre + 8 && sx <= venstre + b.naturalWidth - 8 && sy >= top && sy <= top + b.naturalHeight;
    if (inde && (!fundet || moebelDybde(m) > moebelDybde(fundet))) fundet = m;
  });
  if (!fundet) {
    const f = musTilFelt(e);
    const m = moebelPaa(f.x, f.y);
    if (erIsvogn(m)) fundet = m;
  }
  return fundet;
}

laerred.addEventListener("click", function (e) {
  if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
  const m = isvognUnderMus(e);
  if (!m || !isKlar()) return;
  e.stopImmediatePropagation();
  valgtMoebel = m;
  opdaterPanel();
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  const fig = figurFelt();
  // feltet foran isvognen først, ellers ved siden af
  const r = m.retning || 0;
  const sider = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const pladser = [sider[r]].concat(sider.filter(function (d, i) { return i !== r; })).map(function (d) { return { x: m.x + d[0], y: m.y + d[1] }; });
  if (pladser.some(function (p) { return p.x === fig.x && p.y === fig.y; })) { faaIs(m); return; }
  for (const p of pladser) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0) { gaarTilIsvogn = { m: m, x: p.x, y: p.y }; return; }
  }
  besked.textContent = "Du kan ikke komme hen til isvognen. Der står noget i vejen.";
}, true);

// fremme ved isvognen?
setInterval(function () {
  const g = gaarTilIsvogn;
  if (!g || figur.rute.length > 0) return;
  gaarTilIsvogn = null;
  const fig = figurFelt();
  if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0) faaIs(g.m);
}, 100);

function faaIs(m) {
  // kig på isvognen
  const dx = m.x - figur.x, dy = m.y - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  figur.forfra = dx + dy >= 0;
  if (typeof svaev === "function") svaev("🍦");
  setTimeout(function () {
    minHaand = giHaand("is");
    gemHaand();
    besked.textContent = "Du fik en is 🍦 Find en solstol, og nyd solen! Klik på en anden for at give den videre.";
  }, 600);
}
