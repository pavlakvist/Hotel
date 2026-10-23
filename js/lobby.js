// =============================================================
//  LOBBYEN PÅ FORSIDEN — en levende lobby, hvor gæsterne går rundt.
//  Møblerne kommer fra dit møbel-katalog, og figurerne fra js/figur.js.
//  Klik på receptionen (eller "Tjek ind") for at komme ind i hotellet.
// =============================================================

const lobbyLaerred = document.getElementById("lobby");
const lc = lobbyLaerred.getContext("2d");
const lobbyTip = document.getElementById("lobby-tip");

// Lobbyen regner altid i 760 x 470 punkter (ligesom spillet regner i 900 x 600)
const L_BREDDE = 760;
const L_HOEJDE = 470;

const L_FLISE_B = 64;
const L_FLISE_H = 32;
const L_VAEG = 118;
const LOBBY = { bredde: 12, dybde: 9 };
const L_START = { x: 380 + (LOBBY.dybde - LOBBY.bredde) * L_FLISE_B / 4, y: 128 };

// Farver på lobbyen
const L_FARVER = {
  tapet: "#7b3328",          // vægbeklædningen
  tapetStribe: "#6c2a21",
  panel: "#4a2615",          // træpanelet forneden på væggen
  guld: "#e0a73c",
  gulv1: "#b98153",
  gulv2: "#a7713f",
  gulvKant: "#5a321a",
};

// Hvor møblerne står.  bredde: hvor mange felter møblet fylder mod højre-ned.
//   spejlet: true = møblet vender mod højre (står op ad venstre væg)
//   dybde:   bruges når et møbel skal tegnes foran noget, det normalt ville stå bag
const LOBBY_MOEBLER = [
  // langs højre væg
  { type: "reception-07", x: 0, y: 0 },
  { type: "reception-16", x: 2, y: 0, bredde: 2 },
  { type: "reception-01", x: 5, y: 1, bredde: 2, dybde: 7.5, reception: true },
  { type: "reception-17", x: 8, y: 0 },
  { type: "reception-12", x: 10, y: 0 },
  { type: "lobby-16",     x: 11, y: 0 },
  { type: "reception-10", x: 9, y: 2 },
  // langs venstre væg
  { type: "lobby-11", x: 0, y: 2, spejlet: true },
  { type: "lobby-14", x: 0, y: 4, spejlet: true },
  { type: "lobby-05", x: 0, y: 6, spejlet: true },
  { type: "reception-07", x: 0, y: 8, spejlet: true },
  // hyggekrogen med sofa og tæppe
  { type: "lobby-09", x: 2, y: 5, flad: true, flyt: [0.5, 0.4] },
  { type: "lobby-02", x: 2, y: 4, bredde: 2, dybde: 6 },
  { type: "lobby-06", x: 2, y: 6, bredde: 2 },
  { type: "lobby-07", x: 1, y: 6, spejlet: true },
  // til højre
  { type: "reception-14", x: 8, y: 4 },
  { type: "lobby-23", x: 9, y: 6, bredde: 2, dybde: 15 },
  { type: "lobby-30", x: 9, y: 8 },
  { type: "lobby-32", x: 6, y: 8 },
  { type: "lobby-01", x: 11, y: 8 },
];

// Gæsterne, der går rundt
const GAESTER = [
  { valg: { type: "kvinde" }, x: 4, y: 3 },
  { valg: { type: "mand" }, x: 7, y: 6 },
  { valg: { type: "kvinde", frisure: { kvinde: "langt-boelget" }, farver: { kvinde: { bukser: "jeans" } } }, x: 5, y: 7 },
  { valg: { type: "mand", farver: { mand: { bukser: "chinos" } } }, x: 10, y: 4 },
];

// Receptionisten står bag disken
const RECEPTIONIST = { valg: { type: "kvinde", frisure: { kvinde: "hoej-bun" } }, x: 5, y: 0, retning: "ned-venstre" };


// =============================================================
//  Hjælpere
// =============================================================
const L_TYPER = {};
MOEBLER.forEach(function (m) { L_TYPER[m.id] = m; });

const lBilleder = {};
function lBillede(sti) {
  if (!lBilleder[sti]) {
    const b = new Image();
    b.src = sti;
    lBilleder[sti] = b;
  }
  return lBilleder[sti];
}

function lPunkt(fx, fy) {
  return {
    x: L_START.x + (fx - fy) * L_FLISE_B / 2,
    y: L_START.y + (fx + fy) * L_FLISE_H / 2,
  };
}

function lPolygon(punkter, farve) {
  lc.beginPath();
  lc.moveTo(punkter[0].x, punkter[0].y);
  for (let i = 1; i < punkter.length; i++) lc.lineTo(punkter[i].x, punkter[i].y);
  lc.closePath();
  lc.fillStyle = farve;
  lc.fill();
}

// Hvilke felter fylder møblerne?
const optaget = {};
LOBBY_MOEBLER.forEach(function (m) {
  if (m.flad) return;
  for (let i = 0; i < (m.bredde || 1); i++) optaget[(m.x + i) + "," + m.y] = m;
});
optaget[RECEPTIONIST.x + "," + RECEPTIONIST.y] = RECEPTIONIST;

// Sæderne: hvert felt på en sofa eller stol er en plads
const SAEDER = [];
LOBBY_MOEBLER.forEach(function (m) {
  const t = L_TYPER[m.type];
  if (!t || !t.saede) return;
  for (let i = 0; i < (m.bredde || 1); i++) {
    const hoejre = !!m.spejlet !== (t.vender === "hoejre");
    SAEDER.push({ x: m.x + i, y: m.y, hoejde: t.saede, retning: hoejre ? "ned-hoejre" : "ned-venstre", optagetAf: null });
  }
});

function iLobbyen(x, y) {
  return x >= 0 && y >= 0 && x < LOBBY.bredde && y < LOBBY.dybde;
}

function lRute(fra, til) {
  const noegle = function (x, y) { return x + "," + y; };
  const kom = {};
  kom[noegle(fra.x, fra.y)] = null;
  const koe = [fra];
  while (koe.length) {
    const f = koe.shift();
    if (f.x === til.x && f.y === til.y) {
      const rute = [];
      let k = noegle(f.x, f.y);
      while (kom[k]) { rute.unshift(kom[k].felt); k = kom[k].fra; }
      return rute;
    }
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(function (r) {
      const nx = f.x + r[0], ny = f.y + r[1];
      const k = noegle(nx, ny);
      if (k in kom || !iLobbyen(nx, ny)) return;
      const erMaal = nx === til.x && ny === til.y;
      if (optaget[k] && !erMaal) return;
      // gå ikke skråt hen over hjørnet af et møbel
      if (r[0] && r[1] && (optaget[noegle(f.x + r[0], f.y)] || optaget[noegle(f.x, f.y + r[1])])) return;
      kom[k] = { fra: noegle(f.x, f.y), felt: { x: nx, y: ny } };
      koe.push({ x: nx, y: ny });
    });
  }
  return [];
}


// =============================================================
//  Gæsterne går rundt af sig selv
// =============================================================
GAESTER.forEach(function (g) {
  g.rute = [];
  g.retning = "ned";
  g.trin = 0;
  g.vent = Math.random() * 2;
  g.saede = null;      // det sæde, gæsten sidder på eller går hen til
  g.sidder = false;
});

function ledigtFelt(g) {
  for (let forsoeg = 0; forsoeg < 40; forsoeg++) {
    const x = Math.floor(Math.random() * LOBBY.bredde);
    const y = 1 + Math.floor(Math.random() * (LOBBY.dybde - 1));
    if (optaget[x + "," + y]) continue;
    const taget = GAESTER.some(function (a) {
      if (a === g) return false;
      const maal = a.rute.length ? a.rute[a.rute.length - 1] : a;
      return Math.round(maal.x) === x && Math.round(maal.y) === y;
    });
    if (!taget) return { x: x, y: y };
  }
  return null;
}

function nytMaal(g) {
  const fra = { x: Math.round(g.x), y: Math.round(g.y) };
  const frie = SAEDER.filter(function (s) { return !s.optagetAf; });
  if (frie.length && Math.random() < 0.35) {
    const s = frie[Math.floor(Math.random() * frie.length)];
    const rute = lRute(fra, s);
    if (rute.length) {
      s.optagetAf = g;
      g.saede = s;
      g.rute = rute;
      return;
    }
  }
  const til = ledigtFelt(g);
  if (til) g.rute = lRute(fra, til);
}

function flytGaest(g, dt) {
  if (g.sidder) {
    g.vent -= dt;
    if (g.vent <= 0) {
      g.sidder = false;
      g.saede.optagetAf = null;
      g.saede = null;
      g.vent = 0.4;
    }
    return;
  }
  if (!g.rute.length) {
    if (g.saede && Math.round(g.x) === g.saede.x && Math.round(g.y) === g.saede.y) {
      g.sidder = true;
      g.retning = g.saede.retning;
      g.vent = 5 + Math.random() * 6;
      return;
    }
    g.vent -= dt;
    if (g.vent <= 0) {
      nytMaal(g);
      g.vent = 1 + Math.random() * 3;
    }
    return;
  }
  const maal = g.rute[0];
  const dx = maal.x - g.x, dy = maal.y - g.y;
  const afstand = Math.hypot(dx, dy);
  const skridt = 2.2 * dt;
  const lodret = dx + dy > 0.01 ? "ned" : dx + dy < -0.01 ? "op" : "";
  const vandret = dx - dy > 0.01 ? "hoejre" : dx - dy < -0.01 ? "venstre" : "";
  g.retning = lodret && vandret ? lodret + "-" + vandret : lodret || vandret || g.retning;
  if (afstand <= skridt) {
    g.x = maal.x;
    g.y = maal.y;
    g.rute.shift();
  } else {
    g.x += dx / afstand * skridt;
    g.y += dy / afstand * skridt;
  }
  g.trin += dt * 8;
}


// =============================================================
//  Tegn lobbyen
// =============================================================
function skarpLobby() {
  const r = lobbyLaerred.getBoundingClientRect();
  const t = window.devicePixelRatio || 1;
  const b = Math.round(r.width * t), h = Math.round(r.height * t);
  if (b > 0 && h > 0 && (lobbyLaerred.width !== b || lobbyLaerred.height !== h)) {
    lobbyLaerred.width = b;
    lobbyLaerred.height = h;
  }
  lc.setTransform(lobbyLaerred.width / L_BREDDE, 0, 0, lobbyLaerred.height / L_HOEJDE, 0, 0);
  lc.imageSmoothingEnabled = true;
  lc.imageSmoothingQuality = "high";
}

// Et stykke væg mellem to punkter på gulvet, fra højde h1 til h2
function vaegStykke(a, b, h1, h2, farve) {
  lPolygon([
    { x: a.x, y: a.y - h1 }, { x: b.x, y: b.y - h1 },
    { x: b.x, y: b.y - h2 }, { x: a.x, y: a.y - h2 },
  ], farve);
}

function tegnVaeg(a, b, laengde, moerk) {
  const skyg = function (farve) { return moerk ? farve : farve; };
  vaegStykke(a, b, 0, L_VAEG, skyg(L_FARVER.tapet));
  // striber i tapetet
  for (let i = 0; i < laengde * 2; i++) {
    if (i % 2) continue;
    const t1 = i / (laengde * 2), t2 = (i + 1) / (laengde * 2);
    const p1 = { x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1 };
    const p2 = { x: a.x + (b.x - a.x) * t2, y: a.y + (b.y - a.y) * t2 };
    vaegStykke(p1, p2, 34, L_VAEG, L_FARVER.tapetStribe);
  }
  // træpanel forneden og guldkanter
  vaegStykke(a, b, 0, 34, L_FARVER.panel);
  vaegStykke(a, b, 32, 36, L_FARVER.guld);
  vaegStykke(a, b, L_VAEG - 6, L_VAEG, L_FARVER.guld);
  if (moerk) vaegStykke(a, b, 0, L_VAEG, "rgba(0,0,0,0.18)");
}

// Et vindue på venstre væg (fra felt t1 til t2 langs væggen)
function tegnVindue(t1, t2) {
  const a = lPunkt(0, t1), b = lPunkt(0, t2);
  const ramme = "#3a1d0e";
  vaegStykke(a, b, 44, 104, ramme);
  const ia = { x: a.x - 3, y: a.y + 1.5 }, ib = { x: b.x + 3, y: b.y - 1.5 };
  const g = lc.createLinearGradient(0, a.y - 100, 0, a.y - 48);
  g.addColorStop(0, "#1c2b4a");
  g.addColorStop(1, "#4a5f86");
  vaegStykke(ia, ib, 48, 100, g);
  // stjerner
  lc.fillStyle = "rgba(255,240,200,0.85)";
  [[0.25, 88], [0.6, 78], [0.8, 94], [0.4, 64]].forEach(function (s) {
    lc.fillRect(ia.x + (ib.x - ia.x) * s[0], ia.y + (ib.y - ia.y) * s[0] - s[1], 1.5, 1.5);
  });
  // sprosser
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  vaegStykke({ x: m.x + 1, y: m.y - 0.5 }, { x: m.x - 1, y: m.y + 0.5 }, 48, 100, ramme);
  vaegStykke(ia, ib, 73, 75, ramme);
  vaegStykke({ x: a.x + 3, y: a.y - 1.5 }, { x: b.x - 3, y: b.y + 1.5 }, 40, 45, L_FARVER.guld);
}

// Det gyldne skilt over receptionen
function tegnSkilt() {
  const p = lPunkt(3.1, 0);
  lc.save();
  lc.translate(p.x, p.y - 100);
  lc.transform(1, 0.5, 0, 1, 0, 0);
  lc.fillStyle = "#3a1d0e";
  lc.fillRect(-58, -15, 116, 28);
  lc.strokeStyle = L_FARVER.guld;
  lc.lineWidth = 2;
  lc.strokeRect(-56, -13, 112, 24);
  lc.font = "bold 15px Poppins, Verdana, sans-serif";
  lc.textAlign = "center";
  lc.textBaseline = "middle";
  lc.fillStyle = "#f7c65a";
  lc.fillText("RECEPTION", 0, 0);
  lc.restore();
}

function tegnRum() {
  const D = LOBBY.dybde, W = LOBBY.bredde;
  tegnVaeg(lPunkt(0, D), lPunkt(0, 0), D, true);
  tegnVaeg(lPunkt(0, 0), lPunkt(W, 0), W, false);
  tegnVindue(3.0, 3.9);
  tegnVindue(6.6, 7.5);
  tegnSkilt();

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < D; y++) {
      lPolygon([lPunkt(x, y), lPunkt(x + 1, y), lPunkt(x + 1, y + 1), lPunkt(x, y + 1)],
        (x + y) % 2 ? L_FARVER.gulv1 : L_FARVER.gulv2);
    }
  }
  // kanten forrest på gulvet
  const v = lPunkt(0, D), b = lPunkt(W, D), h = lPunkt(W, 0);
  lPolygon([v, b, { x: b.x, y: b.y + 8 }, { x: v.x, y: v.y + 8 }], L_FARVER.gulvKant);
  lPolygon([b, h, { x: h.x, y: h.y + 8 }, { x: b.x, y: b.y + 8 }], "#46260f");
}

// Hvor et møbel bliver tegnet (bruges også til at se, om musen er over receptionen)
function moebelKasse(m) {
  const t = L_TYPER[m.type];
  const k = t.klip;
  const bredde = m.bredde || 1;
  const flyt = m.flyt || [0, 0];
  const c = lPunkt(m.x + bredde / 2 + flyt[0], m.y + 0.5 + flyt[1]);
  const fod = m.flad ? c.y + k[3] / 2 : c.y + L_FLISE_H / 2;
  return { x: c.x - k[2] / 2, y: fod - k[3], w: k[2], h: k[3], cx: c.x };
}

function tegnLobbyMoebel(m, lys) {
  const t = L_TYPER[m.type];
  if (!t) return;
  const b = lBillede(t.billede);
  if (!b.complete || !b.naturalWidth) return;
  const k = t.klip;
  const kasse = moebelKasse(m);
  lc.save();
  if (lys) lc.filter = "brightness(1.18) drop-shadow(0 0 6px rgba(255,210,120,0.9))";
  lc.translate(kasse.cx, kasse.y);
  if (m.spejlet) lc.scale(-1, 1);
  lc.drawImage(b, k[0], k[1], k[2], k[3], -k[2] / 2, 0, k[2], k[3]);
  lc.restore();
}

function tegnGaest(g) {
  const p = lPunkt(g.x + 0.5, g.y + 0.5);
  if (!g.sidder) {
    lc.beginPath();
    lc.ellipse(p.x, p.y, 15, 6, 0, 0, Math.PI * 2);
    lc.fillStyle = "rgba(0,0,0,0.22)";
    lc.fill();
  }
  const gaar = g.rute && g.rute.length > 0;
  const sidde = g.sidder ? { hoejde: g.saede.hoejde } : null;
  tegnMenneske(lc, p.x, p.y, g.valg, g.retning, gaar ? g.trin : null, sidde);
}

let overReceptionen = false;

function tegnLobby() {
  skarpLobby();
  lc.fillStyle = "#1e100a";
  lc.fillRect(0, 0, L_BREDDE, L_HOEJDE);
  tegnRum();

  LOBBY_MOEBLER.forEach(function (m) { if (m.flad) tegnLobbyMoebel(m); });

  const ting = [];
  LOBBY_MOEBLER.forEach(function (m) {
    if (m.flad) return;
    const dybde = m.dybde !== undefined ? m.dybde : m.x + m.y;
    ting.push({ dybde: dybde, tegn: function () { tegnLobbyMoebel(m, m.reception && overReceptionen); } });
  });
  GAESTER.concat([RECEPTIONIST]).forEach(function (g) {
    ting.push({ dybde: g.x + g.y + 0.1, tegn: function () { tegnGaest(g); } });
  });
  ting.sort(function (a, b) { return a.dybde - b.dybde; });
  ting.forEach(function (t) { t.tegn(); });

  // varmt lys fra lysekronen
  const lys = lc.createRadialGradient(380, 200, 40, 380, 230, 430);
  lys.addColorStop(0, "rgba(255,200,120,0.12)");
  lys.addColorStop(1, "rgba(20,8,2,0.35)");
  lc.fillStyle = lys;
  lc.fillRect(0, 0, L_BREDDE, L_HOEJDE);
}


// =============================================================
//  Klik på receptionen
// =============================================================
const RECEPTIONEN = LOBBY_MOEBLER.find(function (m) { return m.reception; });

function musILobbyen(e) {
  const r = lobbyLaerred.getBoundingClientRect();
  return { x: (e.clientX - r.left) * L_BREDDE / r.width, y: (e.clientY - r.top) * L_HOEJDE / r.height };
}

function erOverReceptionen(p) {
  const k = moebelKasse(RECEPTIONEN);
  return p.x >= k.x && p.x <= k.x + k.w && p.y >= k.y && p.y <= k.y + k.h;
}

lobbyLaerred.addEventListener("mousemove", function (e) {
  overReceptionen = erOverReceptionen(musILobbyen(e));
  lobbyLaerred.style.cursor = overReceptionen ? "pointer" : "default";
  if (overReceptionen) {
    const k = moebelKasse(RECEPTIONEN);
    const r = lobbyLaerred.getBoundingClientRect();
    lobbyTip.style.left = (k.cx * r.width / L_BREDDE) + "px";
    lobbyTip.style.top = ((k.y + 30) * r.height / L_HOEJDE) + "px";
  }
  lobbyTip.classList.toggle("vis", overReceptionen);
});

lobbyLaerred.addEventListener("mouseleave", function () {
  overReceptionen = false;
  lobbyTip.classList.remove("vis");
});

lobbyLaerred.addEventListener("click", function (e) {
  if (erOverReceptionen(musILobbyen(e))) window.location.href = "hotel.html";
});


// =============================================================
//  Start
// =============================================================
let lSidste = performance.now();
function lobbyLoop(nu) {
  const dt = Math.min(0.05, (nu - lSidste) / 1000);
  lSidste = nu;
  GAESTER.forEach(function (g) { flytGaest(g, dt); });
  tegnLobby();
  requestAnimationFrame(lobbyLoop);
}
requestAnimationFrame(lobbyLoop);
