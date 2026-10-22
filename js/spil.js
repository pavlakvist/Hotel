// =============================================================
//  SPILLETS MOTOR — her sker alt det, der får hotellet til at køre.
//  Vil du bare skifte grafik eller farver, så kig i indstillinger.js.
// =============================================================

const laerred = document.getElementById("spil");
const ctx = laerred.getContext("2d");

// Et felt på gulvet er en "rude" (diamant), 64 pixels bred og 32 høj.
const FLISE_B = 64;
const FLISE_H = 32;
const VAEG_HOEJDE = 110;
const START = { x: laerred.width / 2, y: 170 };   // hvor det bagerste hjørne af gulvet står

// Slå møbeltyper op på deres id, fx MOEBEL_TYPER["stol"]
const MOEBEL_TYPER = {};
MOEBLER.forEach(function (m) { MOEBEL_TYPER[m.id] = m; });


// ----- Spillets tilstand -----
let moeblerIRummet = [];   // hvert møbel: { type: "stol", x: 3, y: 4, spejlet: false }
let valgtType = null;      // møbeltypen man er ved at stille (fra panelet)
let valgtMoebel = null;    // møblet man har klikket på i rummet
let musFelt = null;        // feltet musen står over lige nu

const figur = {
  x: 2, y: 2,              // hvor figuren står (kan være et kommatal, mens den går)
  rute: [],                // de felter figuren skal gå igennem
  vendt: 1,                // 1 = kigger mod højre, -1 = mod venstre
  forfra: true,            // true = kigger mod os, false = vender ryggen til
  sidde: null,             // når figuren sidder: { moebel, grad (0 = står, 1 = sidder helt ned) }
  skalSidde: null,         // det møbel, figuren er på vej hen for at sidde på
  trin: 0,                 // bruges til at få benene til at bevæge sig
};


// =============================================================
//  Billeder
// =============================================================
const billeder = {};

function hentBillede(sti) {
  if (!sti) return null;
  if (billeder[sti]) return billeder[sti];
  const b = new Image();
  b.onload = tegnIkoner;
  b.onerror = function () {
    console.warn("Kunne ikke finde billedet: " + sti + " (tjek navnet, og at filen ligger i mappen)");
  };
  b.src = sti;
  billeder[sti] = b;
  return b;
}

function billedeKlar(b) {
  return b && b.complete && b.naturalWidth > 0;
}


// =============================================================
//  Omregning mellem felter og skærm
// =============================================================

// Fra et sted i rummet (felt-koordinater) til en pixel på skærmen
function punkt(fx, fy) {
  return {
    x: START.x + (fx - fy) * FLISE_B / 2,
    y: START.y + (fx + fy) * FLISE_H / 2,
  };
}

// Midten af feltet (x, y) på skærmen
function feltMidte(x, y) {
  return punkt(x + 0.5, y + 0.5);
}

// Fra en pixel på skærmen til det felt, der ligger der
function skaermTilFelt(sx, sy) {
  const dx = (sx - START.x) / (FLISE_B / 2);
  const dy = (sy - START.y) / (FLISE_H / 2);
  return {
    x: Math.floor((dx + dy) / 2),
    y: Math.floor((dy - dx) / 2),
  };
}

function erIRummet(x, y) {
  return x >= 0 && y >= 0 && x < RUM.bredde && y < RUM.dybde;
}

function moebelPaa(x, y) {
  return moeblerIRummet.find(function (m) { return m.x === x && m.y === y; });
}

// Kan figuren gå på feltet?
function kanGaa(x, y) {
  if (!erIRummet(x, y)) return false;
  const m = moebelPaa(x, y);
  return !m || MOEBEL_TYPER[m.type].kanGaaPaa === true;
}

function figurFelt() {
  return { x: Math.round(figur.x), y: Math.round(figur.y) };
}


// =============================================================
//  Find vej (så figuren går uden om møblerne)
// =============================================================
// maalErSaede: true = man må gå ind på det sidste felt, selvom der står en stol
function findRute(fraX, fraY, tilX, tilY, maalErSaede) {
  const maaGaa = function (x, y) {
    return kanGaa(x, y) || (maalErSaede && x === tilX && y === tilY);
  };
  if (!maaGaa(tilX, tilY)) return [];
  const noegle = function (x, y) { return x + "," + y; };
  const forrige = new Map();
  forrige.set(noegle(fraX, fraY), null);
  const koe = [[fraX, fraY]];
  const retninger = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  while (koe.length > 0) {
    const [x, y] = koe.shift();
    if (x === tilX && y === tilY) {
      const rute = [];
      let n = noegle(x, y);
      while (n) {
        const dele = n.split(",").map(Number);
        rute.unshift({ x: dele[0], y: dele[1] });
        n = forrige.get(n);
      }
      return rute;
    }
    for (const [dx, dy] of retninger) {
      const nx = x + dx;
      const ny = y + dy;
      if (!maaGaa(nx, ny) || forrige.has(noegle(nx, ny))) continue;
      // Gå ikke skråt hen over et hjørne af et møbel
      if (dx !== 0 && dy !== 0 && (!kanGaa(x + dx, y) || !kanGaa(x, y + dy))) continue;
      forrige.set(noegle(nx, ny), noegle(x, y));
      koe.push([nx, ny]);
    }
  }
  return [];
}

// saede: møblet, figuren skal sætte sig på, når den kommer frem (eller null)
function gaaTil(x, y, saede) {
  const fra = figurFelt();
  figur.rute = findRute(fra.x, fra.y, x, y, !!saede);
  figur.skalSidde = figur.rute.length > 0 ? saede || null : null;
}

// Sæt sig ned på et møbel (figuren står allerede på feltet)
function saetDig(m) {
  figur.sidde = { moebel: m, grad: 0 };
  // kig væk fra ryglænet
  figur.forfra = true;
  figur.vendt = m.spejlet ? 1 : -1;
}


// =============================================================
//  Tegne-hjælpere
// =============================================================

// Gør en farve lysere (tal over 1) eller mørkere (tal under 1)
function nuance(hex, faktor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * faktor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * faktor));
  const b = Math.min(255, Math.round((n & 255) * faktor));
  return "rgb(" + r + "," + g + "," + b + ")";
}

function polygon(c, punkter, farve, kant) {
  c.beginPath();
  c.moveTo(punkter[0].x, punkter[0].y);
  for (let i = 1; i < punkter.length; i++) c.lineTo(punkter[i].x, punkter[i].y);
  c.closePath();
  c.fillStyle = farve;
  c.fill();
  if (kant) {
    c.strokeStyle = kant;
    c.stroke();
  }
}

// Tegner en 3D-kasse på et felt. Alle reserve-møbler er bygget af kasser.
//   cx, cy: feltets midte på skærmen
//   bx, by: hvor på feltet kassen står (0 = midten, -0.5 til 0.5)
//   sx, sy: hvor stor kassen er (1 = hele feltet)
//   z: hvor højt over gulvet den starter,  h: hvor høj den er
function kasse(c, cx, cy, k, farve, spejlet) {
  let bx = k.bx || 0, by = k.by || 0, sx = k.sx, sy = k.sy;
  if (spejlet) {
    [bx, by] = [by, bx];
    [sx, sy] = [sy, sx];
  }
  const z = k.z || 0;
  const h = k.h;
  const p = function (u, v, hoejde) {
    return { x: cx + (u - v) * FLISE_B / 2, y: cy + (u + v) * FLISE_H / 2 - hoejde };
  };
  const u0 = bx - sx / 2, u1 = bx + sx / 2, v0 = by - sy / 2, v1 = by + sy / 2;

  // venstre side, højre side og toppen
  polygon(c, [p(u0, v1, z), p(u1, v1, z), p(u1, v1, z + h), p(u0, v1, z + h)], nuance(farve, 0.8));
  polygon(c, [p(u1, v1, z), p(u1, v0, z), p(u1, v0, z + h), p(u1, v1, z + h)], nuance(farve, 0.62));
  polygon(c, [p(u0, v0, z + h), p(u1, v0, z + h), p(u1, v1, z + h), p(u0, v1, z + h)], nuance(farve, 1.12));
}


// =============================================================
//  Reserve-tegninger af møblerne
//  (bruges kun, når møblet ikke har sit eget billede)
// =============================================================
const TEGNINGER = {
  stol: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { by: -0.2, sx: 0.5, sy: 0.08, z: 18, h: 24 }, f, s);   // ryglæn
    for (const [u, v] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      kasse(c, cx, cy, { bx: u, by: v, sx: 0.06, sy: 0.06, h: 14 }, "#5b3a1e", s);   // ben
    }
    kasse(c, cx, cy, { sx: 0.5, sy: 0.5, z: 14, h: 5 }, f, s);   // sæde
  },

  bord: function (c, cx, cy, f, s) {
    for (const [u, v] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) {
      kasse(c, cx, cy, { bx: u, by: v, sx: 0.07, sy: 0.07, h: 22 }, f, s);   // ben
    }
    kasse(c, cx, cy, { sx: 0.8, sy: 0.8, z: 22, h: 5 }, f, s);   // bordplade
  },

  sofa: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { by: -0.3, sx: 0.9, sy: 0.18, h: 34 }, f, s);              // ryglæn
    kasse(c, cx, cy, { by: 0.08, sx: 0.9, sy: 0.6, h: 14 }, f, s);              // sæde
    kasse(c, cx, cy, { bx: -0.4, by: 0.05, sx: 0.12, sy: 0.65, h: 22 }, f, s);  // armlæn
    kasse(c, cx, cy, { bx: 0.4, by: 0.05, sx: 0.12, sy: 0.65, h: 22 }, f, s);   // armlæn
  },

  lampe: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.3, sy: 0.3, h: 4 }, "#555555", s);           // fod
    kasse(c, cx, cy, { sx: 0.05, sy: 0.05, z: 4, h: 48 }, "#777777", s);  // stang
    kasse(c, cx, cy, { sx: 0.4, sy: 0.4, z: 50, h: 18 }, f, s);           // skærm
  },

  plante: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.36, sy: 0.36, h: 16 }, "#b5651d", s);   // potte
    const blade = [[0, -40, 13], [-9, -30, 10], [9, -30, 10], [-5, -50, 9], [6, -49, 9]];
    for (const [dx, dy, r] of blade) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
      c.fillStyle = dx < 0 ? nuance(f, 0.8) : f;
      c.fill();
    }
  },

  taeppe: function (c, cx, cy, f, s) {
    kasse(c, cx, cy, { sx: 0.92, sy: 0.92, h: 1 }, f, s);
    kasse(c, cx, cy, { sx: 0.6, sy: 0.6, z: 1, h: 0.5 }, "#fdcb6e", s);
  },
};

// Tegner et møbel med midten af feltet i (cx, cy)
function tegnMoebel(c, type, cx, cy, spejlet) {
  const b = hentBillede(type.billede);
  if (billedeKlar(b)) {
    // Dit eget billede: bunden af billedet står på feltets nederste spids
    c.save();
    c.translate(cx, cy + FLISE_H / 2);
    if (spejlet) c.scale(-1, 1);
    c.drawImage(b, -b.naturalWidth / 2, -b.naturalHeight);
    c.restore();
    return;
  }
  const tegning = TEGNINGER[type.tegning] || TEGNINGER.stol;
  tegning(c, cx, cy, type.farve || "#999999", spejlet);
}


// =============================================================
//  Figuren
// =============================================================
function tegnFigur(c) {
  const p = punkt(figur.x + 0.5, figur.y + 0.5);   // fødderne
  const gaar = figur.rute.length > 0;
  const sving = gaar ? Math.sin(figur.trin) * 4 : 0;

  // skygge
  c.beginPath();
  c.ellipse(p.x, p.y, 16, 7, 0, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fill();

  const b = hentBillede(FIGUR.billede);
  let hoejde = figurHoejde(garderobe);
  if (billedeKlar(b)) {
    // Dit eget billede af figuren
    c.save();
    c.translate(p.x, p.y);
    if (figur.vendt < 0) c.scale(-1, 1);
    c.drawImage(b, -b.naturalWidth / 2, -b.naturalHeight - Math.abs(sving) / 2);
    c.restore();
    hoejde = b.naturalHeight;
  } else {
    // Figuren fra figur.js
    let sidde = null;
    if (figur.sidde) {
      sidde = { grad: figur.sidde.grad, hoejde: MOEBEL_TYPER[figur.sidde.moebel.type].saede };
      hoejde -= 18 * figur.sidde.grad;   // navneskiltet følger med ned
    }
    tegnMenneske(c, p.x, p.y, garderobe, figur.forfra, figur.vendt, gaar && !figur.sidde ? figur.trin : null, sidde);
  }

  // navneskilt
  c.font = "bold 12px Verdana, sans-serif";
  c.textAlign = "center";
  const tekstB = c.measureText(FIGUR.navn).width + 12;
  c.fillStyle = "rgba(0,0,0,0.55)";
  c.fillRect(p.x - tekstB / 2, p.y - hoejde - 26, tekstB, 18);
  c.fillStyle = "#ffffff";
  c.fillText(FIGUR.navn, p.x, p.y - hoejde - 13);
}

function flytFigur(dt) {
  // ----- Sidder figuren? -----
  if (figur.sidde) {
    const vaek = moeblerIRummet.indexOf(figur.sidde.moebel) < 0;
    if (figur.rute.length > 0 || vaek) {
      // rejs dig op, før du går
      figur.sidde.grad -= dt / 0.5;
      if (figur.sidde.grad <= 0) figur.sidde = null;
    } else {
      // sæt dig langsomt ned
      figur.sidde.grad = Math.min(1, figur.sidde.grad + dt / 0.9);
      figur.vendt = figur.sidde.moebel.spejlet ? 1 : -1;
    }
    return;
  }

  if (figur.rute.length === 0) {
    // fremme ved stolen? Så sæt dig
    if (figur.skalSidde) {
      const m = figur.skalSidde;
      figur.skalSidde = null;
      const fig = figurFelt();
      if (moeblerIRummet.indexOf(m) >= 0 && fig.x === m.x && fig.y === m.y) saetDig(m);
    }
    return;
  }
  const maal = figur.rute[0];
  const dx = maal.x - figur.x;
  const dy = maal.y - figur.y;
  const afstand = Math.hypot(dx, dy);
  const skridt = FIGUR.fart * dt;

  // Hvilken vej kigger figuren på skærmen?
  // (dx - dy) er højre/venstre, og (dx + dy) er ned mod os/op væk fra os
  if (dx - dy > 0.01) figur.vendt = 1;
  if (dx - dy < -0.01) figur.vendt = -1;
  if (dx + dy > 0.01) figur.forfra = true;
  if (dx + dy < -0.01) figur.forfra = false;

  if (afstand <= skridt) {
    figur.x = maal.x;
    figur.y = maal.y;
    figur.rute.shift();
  } else {
    figur.x += (dx / afstand) * skridt;
    figur.y += (dy / afstand) * skridt;
  }
  figur.trin += dt * 8;   // hvor hurtigt benene skifter
}


// =============================================================
//  Tegn hele rummet
// =============================================================
function diamant(x, y) {
  return [punkt(x, y), punkt(x + 1, y), punkt(x + 1, y + 1), punkt(x, y + 1)];
}

function tegnVaegge() {
  const op = function (p) { return { x: p.x, y: p.y - VAEG_HOEJDE }; };
  const hjoerne = punkt(0, 0);
  const venstre = punkt(0, RUM.dybde);
  const hoejre = punkt(RUM.bredde, 0);
  polygon(ctx, [venstre, hjoerne, op(hjoerne), op(venstre)], nuance(RUM.vaegFarve, 0.85));
  polygon(ctx, [hjoerne, hoejre, op(hoejre), op(hjoerne)], RUM.vaegFarve);
  // en lys kant øverst på væggene
  ctx.strokeStyle = nuance(RUM.vaegFarve, 1.25);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(op(venstre).x, op(venstre).y);
  ctx.lineTo(op(hjoerne).x, op(hjoerne).y);
  ctx.lineTo(op(hoejre).x, op(hoejre).y);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function tegnGulv() {
  const gulvBillede = hentBillede(RUM.gulvBillede);
  for (let x = 0; x < RUM.bredde; x++) {
    for (let y = 0; y < RUM.dybde; y++) {
      if (billedeKlar(gulvBillede)) {
        const p = punkt(x, y);
        ctx.drawImage(gulvBillede, p.x - FLISE_B / 2, p.y, FLISE_B, FLISE_H);
      } else {
        const farve = (x + y) % 2 === 0 ? RUM.gulvFarve1 : RUM.gulvFarve2;
        polygon(ctx, diamant(x, y), farve, "rgba(0,0,0,0.08)");
      }
    }
  }
  // gulvets kant forrest
  const v = punkt(0, RUM.dybde), b = punkt(RUM.bredde, RUM.dybde), h = punkt(RUM.bredde, 0);
  polygon(ctx, [v, b, { x: b.x, y: b.y + 8 }, { x: v.x, y: v.y + 8 }], nuance(RUM.gulvFarve2, 0.7));
  polygon(ctx, [b, h, { x: h.x, y: h.y + 8 }, { x: b.x, y: b.y + 8 }], nuance(RUM.gulvFarve2, 0.55));
}

function tegnMarkering() {
  if (musFelt && erIRummet(musFelt.x, musFelt.y)) {
    let farve = "rgba(255,255,255,0.35)";
    if (valgtType) farve = moebelPaa(musFelt.x, musFelt.y) ? "rgba(255,60,60,0.45)" : "rgba(80,255,120,0.4)";
    polygon(ctx, diamant(musFelt.x, musFelt.y), farve);
  }
  if (valgtMoebel) {
    ctx.lineWidth = 2;
    polygon(ctx, diamant(valgtMoebel.x, valgtMoebel.y), "rgba(242,177,52,0.25)", "#f2b134");
    ctx.lineWidth = 1;
  }
}

function tegnAlt() {
  ctx.clearRect(0, 0, laerred.width, laerred.height);
  tegnVaegge();
  tegnGulv();

  // Tæpper o.l. ligger fladt på gulvet og tegnes først
  moeblerIRummet.forEach(function (m) {
    const type = MOEBEL_TYPER[m.type];
    if (type.kanGaaPaa) {
      const c = feltMidte(m.x, m.y);
      tegnMoebel(ctx, type, c.x, c.y, m.spejlet);
    }
  });
  tegnMarkering();

  // Alt det, der står op, tegnes bagfra og frem, så de forreste dækker de bagerste
  const ting = [];
  moeblerIRummet.forEach(function (m) {
    const type = MOEBEL_TYPER[m.type];
    if (type.kanGaaPaa) return;
    ting.push({
      dybde: m.x + m.y,
      tegn: function () {
        const c = feltMidte(m.x, m.y);
        tegnMoebel(ctx, type, c.x, c.y, m.spejlet);
      },
    });
  });
  ting.push({ dybde: figur.x + figur.y + 0.1, tegn: function () { tegnFigur(ctx); } });

  // Et "spøgelse" af møblet, man er ved at stille
  if (valgtType && musFelt && erIRummet(musFelt.x, musFelt.y) && !moebelPaa(musFelt.x, musFelt.y)) {
    const f = musFelt;
    ting.push({
      dybde: f.x + f.y + 0.05,
      tegn: function () {
        const c = feltMidte(f.x, f.y);
        ctx.globalAlpha = 0.55;
        tegnMoebel(ctx, MOEBEL_TYPER[valgtType], c.x, c.y, false);
        ctx.globalAlpha = 1;
      },
    });
  }

  ting.sort(function (a, b) { return a.dybde - b.dybde; });
  ting.forEach(function (t) { t.tegn(); });
}


// =============================================================
//  Panelet med møbler
// =============================================================
const knapBoks = document.getElementById("moebel-knapper");
const ikoner = [];

MOEBLER.forEach(function (type) {
  const knap = document.createElement("button");
  knap.className = "moebel-knap";
  knap.dataset.id = type.id;
  const ikon = document.createElement("canvas");
  ikon.width = 64;
  ikon.height = 70;
  ikoner.push({ ikon: ikon, type: type });
  const navn = document.createElement("span");
  navn.textContent = type.navn;
  knap.append(ikon, navn);
  knap.addEventListener("click", function () {
    valgtType = valgtType === type.id ? null : type.id;
    valgtMoebel = null;
    opdaterPanel();
  });
  knapBoks.appendChild(knap);
});

function tegnIkoner() {
  ikoner.forEach(function (i) {
    const c = i.ikon.getContext("2d");
    c.clearRect(0, 0, i.ikon.width, i.ikon.height);
    const b = hentBillede(i.type.billede);
    if (billedeKlar(b)) {
      const skala = Math.min(1, 60 / b.naturalWidth, 66 / b.naturalHeight);
      const w = b.naturalWidth * skala, h = b.naturalHeight * skala;
      c.drawImage(b, 32 - w / 2, 68 - h, w, h);
    } else {
      // Reserve-tegningen gøres lidt mindre, så den kan være på knappen
      c.save();
      c.translate(32, 60);
      c.scale(0.75, 0.75);
      tegnMoebel(c, i.type, 0, 0, false);
      c.restore();
    }
  });
}

const valgtBoks = document.getElementById("valgt-boks");
const besked = document.getElementById("besked");

function opdaterPanel() {
  document.querySelectorAll(".moebel-knap").forEach(function (k) {
    k.classList.toggle("aktiv", k.dataset.id === valgtType);
  });
  if (valgtMoebel) {
    valgtBoks.hidden = false;
    document.getElementById("valgt-navn").textContent = MOEBEL_TYPER[valgtMoebel.type].navn;
  } else {
    valgtBoks.hidden = true;
  }
  if (valgtType) {
    besked.textContent = "Klik på et ledigt felt for at stille: " + MOEBEL_TYPER[valgtType].navn + ". (Esc fortryder)";
  } else if (valgtMoebel) {
    besked.textContent = "Du har valgt et møbel. Du kan dreje det eller samle det op.";
  } else {
    besked.textContent = "Klik på gulvet for at gå. Klik på et møbel for at vælge det.";
  }
}

function drejValgt() {
  if (!valgtMoebel) return;
  valgtMoebel.spejlet = !valgtMoebel.spejlet;
  gem();
}

function samlOpValgt() {
  if (!valgtMoebel) return;
  moeblerIRummet = moeblerIRummet.filter(function (m) { return m !== valgtMoebel; });
  valgtMoebel = null;
  gem();
  opdaterPanel();
}

document.getElementById("knap-drej").addEventListener("click", drejValgt);
document.getElementById("knap-saml").addEventListener("click", samlOpValgt);
document.getElementById("knap-ryd").addEventListener("click", function () {
  moeblerIRummet = [];
  valgtMoebel = null;
  gem();
  opdaterPanel();
});


// =============================================================
//  Mus og tastatur
// =============================================================
function musTilFelt(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (laerred.width / r.width);
  const sy = (e.clientY - r.top) * (laerred.height / r.height);
  return skaermTilFelt(sx, sy);
}

laerred.addEventListener("mousemove", function (e) {
  musFelt = musTilFelt(e);
});

laerred.addEventListener("mouseleave", function () {
  musFelt = null;
});

laerred.addEventListener("click", function (e) {
  const f = musTilFelt(e);
  if (!erIRummet(f.x, f.y)) {
    valgtMoebel = null;
    opdaterPanel();
    return;
  }

  // Stil et nyt møbel
  if (valgtType) {
    const type = MOEBEL_TYPER[valgtType];
    const fig = figurFelt();
    const staarDer = fig.x === f.x && fig.y === f.y;
    if (moebelPaa(f.x, f.y) || (staarDer && !type.kanGaaPaa)) {
      besked.textContent = "Der er optaget. Prøv et andet felt.";
      return;
    }
    moeblerIRummet.push({ type: valgtType, x: f.x, y: f.y, spejlet: false });
    valgtType = null;
    // Hvis møblet står i vejen for figuren, finder den en ny vej
    if (figur.rute.length > 0) {
      const maal = figur.rute[figur.rute.length - 1];
      gaaTil(maal.x, maal.y, figur.skalSidde);
    }
    gem();
    opdaterPanel();
    return;
  }

  // Klik på et møbel = vælg det. Klik på gulvet = gå derhen.
  // Klik på en stol eller sofa = gå derhen og sæt dig.
  const m = moebelPaa(f.x, f.y);
  valgtMoebel = m || null;
  if (m && MOEBEL_TYPER[m.type].saede) {
    if (!figur.sidde || figur.sidde.moebel !== m) {
      const fig = figurFelt();
      if (fig.x === m.x && fig.y === m.y && !figur.sidde) saetDig(m);
      else gaaTil(f.x, f.y, m);
    }
  } else if (!m || MOEBEL_TYPER[m.type].kanGaaPaa) {
    gaaTil(f.x, f.y);
  }
  opdaterPanel();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    valgtType = null;
    valgtMoebel = null;
    opdaterPanel();
  }
  if (e.key === "r" || e.key === "R") drejValgt();
  if (e.key === "Delete" || e.key === "Backspace") samlOpValgt();
});


// =============================================================
//  Garderobe — vælg figur
// =============================================================
const GARDEROBE_NOEGLE = "mit-hotel-figur-5";
const garderobe = { type: FIGUR.type };

try {
  const gemt = JSON.parse(localStorage.getItem(GARDEROBE_NOEGLE));
  if (gemt && alleFigurer()[gemt.type]) garderobe.type = gemt.type;
} catch (fejl) {
  // ingen gemt figur endnu
}

function gemGarderobe() {
  try {
    localStorage.setItem(GARDEROBE_NOEGLE, JSON.stringify(garderobe));
  } catch (fejl) {
    // kan ikke gemme, men valget virker stadig nu
  }
}

const forhaandsvisning = document.getElementById("figur-forhaandsvisning");

function tegnForhaandsvisning() {
  const c = forhaandsvisning.getContext("2d");
  c.clearRect(0, 0, forhaandsvisning.width, forhaandsvisning.height);
  tegnMenneske(c, 34, forhaandsvisning.height - 4, garderobe, true, 1, null);
  tegnMenneske(c, 98, forhaandsvisning.height - 4, garderobe, false, 1, null);
}

function lavFigurKnapper() {
  const boks = document.getElementById("figur-typer");
  boks.innerHTML = "";
  const figurer = alleFigurer();
  for (const id in figurer) {
    const knap = document.createElement("button");
    knap.textContent = figurer[id];
    knap.classList.toggle("aktiv", garderobe.type === id);
    knap.addEventListener("click", function () {
      garderobe.type = id;
      lavFigurKnapper();
      tegnForhaandsvisning();
      gemGarderobe();
    });
    boks.appendChild(knap);
  }
}

lavFigurKnapper();


// =============================================================
//  Gem rummet i browseren, så det er der næste gang
// =============================================================
const GEMME_NOEGLE = "mit-hotel-rum";

function gem() {
  try {
    localStorage.setItem(GEMME_NOEGLE, JSON.stringify(moeblerIRummet));
  } catch (fejl) {
    // Nogle browsere tillader ikke at gemme. Så virker spillet bare uden.
  }
}

function hent() {
  try {
    const data = JSON.parse(localStorage.getItem(GEMME_NOEGLE));
    if (Array.isArray(data)) {
      moeblerIRummet = data.filter(function (m) {
        return MOEBEL_TYPER[m.type] && erIRummet(m.x, m.y);
      });
      return;
    }
  } catch (fejl) {
    // ignorér, og start med et nyt rum
  }
  // Første gang: stil et par møbler, så rummet ikke er tomt
  moeblerIRummet = [
    { type: "taeppe", x: 4, y: 4, spejlet: false },
    { type: "plante", x: 0, y: 0, spejlet: false },
    { type: "sofa", x: 3, y: 0, spejlet: false },
    { type: "bord", x: 4, y: 2, spejlet: false },
  ].filter(function (m) { return MOEBEL_TYPER[m.type]; });
}


// =============================================================
//  Start spillet
// =============================================================
hent();
tegnIkoner();
tegnForhaandsvisning();
opdaterPanel();

let sidsteTid = performance.now();
function loop(nu) {
  const dt = Math.min(0.05, (nu - sidsteTid) / 1000);
  sidsteTid = nu;
  flytFigur(dt);
  tegnAlt();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
