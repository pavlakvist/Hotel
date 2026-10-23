// =============================================================
//  VELKOMSTHALLEN — det første rum, man kommer ind i, når man tjekker ind.
//  Her står møblerne fast, og andre gæster går rundt.
//  Gå gennem døren (eller tryk på knappen) for at komme til dit eget værelse.
// =============================================================

// Møblerne i velkomsthallen.  spejlet: true = møblet vender mod højre
const HAL_MOEBLER = [
  // langs højre væg (bagerst til højre)
  { type: "reception-17", x: 1, y: 0 },
  { type: "lobby-11", x: 2, y: 0 },
  { type: "reception-16", x: 3, y: 0 },
  { type: "lobby-11", x: 10, y: 0 },
  { type: "reception-12", x: 11, y: 0 },
  { type: "reception-07", x: 12, y: 0 },
  { type: "lobby-16", x: 13, y: 0 },
  // langs venstre væg
  { type: "lobby-16", x: 0, y: 1, spejlet: true },
  { type: "lobby-02", x: 0, y: 3, spejlet: true },
  { type: "lobby-31", x: 1, y: 4 },
  { type: "lobby-07", x: 0, y: 5, spejlet: true },
  { type: "lobby-05", x: 0, y: 7, spejlet: true },
  { type: "lobby-11", x: 0, y: 9, spejlet: true },
  { type: "reception-07", x: 0, y: 10, spejlet: true },
  // sofagruppen i midten
  { type: "taepper-08", x: 6, y: 6 },
  { type: "lobby-12", x: 6, y: 4 },
  { type: "lobby-15", x: 6, y: 5 },
  { type: "lobby-03", x: 5, y: 5 },
  { type: "lobby-20", x: 7, y: 4 },
  // hyggekrog til højre
  { type: "taepper-03", x: 10, y: 3 },
  { type: "lobby-23", x: 10, y: 7 },
  { type: "lobby-26", x: 12, y: 5 },
  { type: "lobby-24", x: 13, y: 7 },
  { type: "lobby-30", x: 12, y: 9 },
  { type: "lobby-01", x: 13, y: 10 },
  // forrest til venstre
  { type: "lobby-08", x: 3, y: 9 },
  { type: "lobby-32", x: 2, y: 8 },
  { type: "lobby-29", x: 8, y: 10 },
];

// Hvor stor velkomsthallen er (dit værelse har sin egen størrelse i indstillinger.js)
const HAL_STOERRELSE = { bredde: 14, dybde: 11 };

// Felter, man ikke kan gå på, selvom der ikke står et møbel (fx hvis et stort møbel fylder flere felter)
const HAL_BLOKERET = [];

// Døren til værelserne (på højre væg) og feltet foran den
const HAL_DOER = { fra: 6.1, til: 6.9, hoejde: 80, felt: { x: 6, y: 0 } };

// Farver i velkomsthallen
const HAL_FARVER = {
  tapet: "#7b3328",
  tapetStribe: "#6c2a21",
  panel: "#4a2615",
  guld: "#e0a73c",
  gulv1: "#b98153",
  gulv2: "#a7713f",
};

// De andre gæster
const HAL_GAESTER = [
  { navn: "Ida", valg: { type: "pige" }, x: 2, y: 6 },
  { navn: "Noah", valg: { type: "dreng" }, x: 7, y: 2 },
  { navn: "Freja", valg: { type: "pige" }, x: 7, y: 8 },
  { navn: "Oliver", valg: { type: "dreng" }, x: 11, y: 5 },
];
HAL_GAESTER.forEach(function (g) {
  g.rute = [];
  g.retning = "ned";
  g.trin = 0;
  g.vent = 1 + Math.random() * 2;
  g.saede = null;
  g.sidder = false;
});

let mitVaerelse = [];          // møblerne i dit eget værelse
let halVilGaaUd = false;       // figuren er på vej hen til døren
let halMus = null;             // hvor musen er på lærredet (i spillets punkter)
const RUM_FARVER = { vaeg: RUM.vaegFarve, gulv1: RUM.gulvFarve1, gulv2: RUM.gulvFarve2, bredde: RUM.bredde, dybde: RUM.dybde };


// =============================================================
//  Skift mellem velkomsthallen og dit værelse
// =============================================================
function skiftRum(navn) {
  if (rumValg === "vaerelse") mitVaerelse = moeblerIRummet;
  rumValg = navn;
  moeblerIRummet = navn === "hal" ? HAL_MOEBLER : mitVaerelse;
  RUM.vaegFarve = navn === "hal" ? HAL_FARVER.tapet : RUM_FARVER.vaeg;
  RUM.gulvFarve1 = navn === "hal" ? HAL_FARVER.gulv1 : RUM_FARVER.gulv1;
  RUM.gulvFarve2 = navn === "hal" ? HAL_FARVER.gulv2 : RUM_FARVER.gulv2;
  RUM.bredde = navn === "hal" ? HAL_STOERRELSE.bredde : RUM_FARVER.bredde;
  RUM.dybde = navn === "hal" ? HAL_STOERRELSE.dybde : RUM_FARVER.dybde;
  document.body.classList.toggle("i-hallen", navn === "hal");

  // figuren kommer ind gennem døren
  figur.x = navn === "hal" ? HAL_DOER.felt.x : 2;
  figur.y = navn === "hal" ? HAL_DOER.felt.y + 1 : 2;
  figur.rute = [];
  figur.sidde = null;
  figur.skalSidde = null;
  figur.retning = "ned";
  halVilGaaUd = false;
  KAMERA.x = 0;
  KAMERA.y = 0;
  valgtType = null;
  valgtMoebel = null;

  document.getElementById("moebel-sektion").hidden = navn === "hal";
  document.getElementById("hal-sektion").hidden = navn !== "hal";
  document.getElementById("rum-navn").textContent = navn === "hal" ? "Velkomsthallen" : "Dit værelse";
  opdaterPanel();
  besked.textContent = navn === "hal"
    ? "Velkommen til Hotelven! Gå gennem døren for at komme til dit værelse."
    : "Velkommen hjem! Klik på gulvet for at gå, og stil møbler fra panelet.";
}

function halBlokeret(x, y) {
  return HAL_BLOKERET.indexOf(x + "," + y) >= 0;
}

document.getElementById("knap-til-vaerelse").addEventListener("click", function () { skiftRum("vaerelse"); });
document.getElementById("knap-til-hal").addEventListener("click", function () { skiftRum("hal"); });


// =============================================================
//  Væggene i velkomsthallen
// =============================================================
function halVaegStykke(a, b, h1, h2, farve) {
  polygon(ctx, [
    { x: a.x, y: a.y - h1 }, { x: b.x, y: b.y - h1 },
    { x: b.x, y: b.y - h2 }, { x: a.x, y: a.y - h2 },
  ], farve);
}

function halVaeg(a, b, laengde, moerk) {
  halVaegStykke(a, b, 0, VAEG_HOEJDE, HAL_FARVER.tapet);
  for (let i = 0; i < laengde * 2; i += 2) {
    const t1 = i / (laengde * 2), t2 = (i + 1) / (laengde * 2);
    halVaegStykke(
      { x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1 },
      { x: a.x + (b.x - a.x) * t2, y: a.y + (b.y - a.y) * t2 },
      34, VAEG_HOEJDE, HAL_FARVER.tapetStribe);
  }
  halVaegStykke(a, b, 0, 34, HAL_FARVER.panel);
  halVaegStykke(a, b, 32, 36, HAL_FARVER.guld);
  halVaegStykke(a, b, VAEG_HOEJDE - 6, VAEG_HOEJDE, HAL_FARVER.guld);
  if (moerk) halVaegStykke(a, b, 0, VAEG_HOEJDE, "rgba(0,0,0,0.18)");
}

function halOverDoer() {
  if (!halMus) return false;
  const a = punkt(HAL_DOER.fra, 0), b = punkt(HAL_DOER.til, 0);
  return halMus.x >= a.x && halMus.x <= b.x && halMus.y <= b.y && halMus.y >= a.y - HAL_DOER.hoejde;
}

function tegnHalVaegge() {
  halVaeg(punkt(0, RUM.dybde), punkt(0, 0), RUM.dybde, true);
  halVaeg(punkt(0, 0), punkt(RUM.bredde, 0), RUM.bredde, false);

  // døren
  const a = punkt(HAL_DOER.fra, 0), b = punkt(HAL_DOER.til, 0);
  const lys = halOverDoer() || (musFelt && musFelt.x === HAL_DOER.felt.x && musFelt.y === HAL_DOER.felt.y);
  halVaegStykke({ x: a.x - 4, y: a.y - 2 }, { x: b.x + 4, y: b.y + 2 }, 0, HAL_DOER.hoejde + 5, HAL_FARVER.guld);
  halVaegStykke(a, b, 0, HAL_DOER.hoejde, lys ? "#7a4a25" : "#5a3218");
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  halVaegStykke({ x: m.x - 1, y: m.y - 0.5 }, { x: m.x + 1, y: m.y + 0.5 }, 0, HAL_DOER.hoejde, "#3a1d0e");
  ctx.fillStyle = HAL_FARVER.guld;
  ctx.beginPath();
  ctx.arc(m.x - 5, m.y - 2.5 - 38, 2.2, 0, Math.PI * 2);
  ctx.arc(m.x + 5, m.y + 2.5 - 38, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // skiltet over døren
  const s = punkt((HAL_DOER.fra + HAL_DOER.til) / 2, 0);
  ctx.save();
  ctx.translate(s.x, s.y - 96);
  ctx.transform(1, 0.5, 0, 1, 0, 0);
  ctx.fillStyle = "#3a1d0e";
  ctx.fillRect(-62, -13, 124, 24);
  ctx.strokeStyle = HAL_FARVER.guld;
  ctx.lineWidth = 2;
  ctx.strokeRect(-60, -11, 120, 20);
  ctx.font = "bold 14px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f7c65a";
  ctx.fillText("VELKOMMEN", 0, 0);
  ctx.restore();
  ctx.lineWidth = 1;

  if (lys) {
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    const t = "Til dit værelse";
    const w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(m.x - w / 2, m.y - HAL_DOER.hoejde - 34, w, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, m.x, m.y - HAL_DOER.hoejde - 20);
  }
}

// Klik på døren = gå hen til den og ind på dit værelse
laerred.addEventListener("mousemove", function (e) {
  const r = laerred.getBoundingClientRect();
  halMus = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (rumValg === "hal") laerred.style.cursor = halOverDoer() ? "pointer" : "";
});
laerred.addEventListener("mouseleave", function () { halMus = null; });

laerred.addEventListener("click", function (e) {
  if (rumValg !== "hal") return;
  const f = musTilFelt(e);
  if (halOverDoer() || (f.x === HAL_DOER.felt.x && f.y === HAL_DOER.felt.y)) {
    e.stopImmediatePropagation();
    gaaTil(HAL_DOER.felt.x, HAL_DOER.felt.y);
    halVilGaaUd = true;
    const fig = figurFelt();
    if (fig.x === HAL_DOER.felt.x && fig.y === HAL_DOER.felt.y) skiftRum("vaerelse");
  } else {
    halVilGaaUd = false;
  }
}, true);


// =============================================================
//  De andre gæster går rundt
// =============================================================
function halFrieSaeder(g) {
  return HAL_MOEBLER.filter(function (m) {
    if (!MOEBEL_TYPER[m.type] || !MOEBEL_TYPER[m.type].saede) return false;
    return ledigPlads(m, g) >= 0;
  });
}

function halNytMaal(g) {
  const fx = Math.round(g.x), fy = Math.round(g.y);
  const frie = halFrieSaeder(g);
  if (frie.length && Math.random() < 0.35) {
    const m = frie[Math.floor(Math.random() * frie.length)];
    const rute = findRute(fx, fy, m.x, m.y, true);
    if (rute.length) {
      g.saede = m;
      g.plads = ledigPlads(m, g);
      g.rute = rute.slice(1);
      return;
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * RUM.bredde), y = 1 + Math.floor(Math.random() * (RUM.dybde - 1));
    if (!kanGaa(x, y)) continue;
    const rute = findRute(fx, fy, x, y, false);
    if (rute.length) {
      g.rute = rute.slice(1);
      return;
    }
  }
}

function opdaterHal(dt) {
  if (halVilGaaUd && figur.rute.length === 0) {
    const fig = figurFelt();
    halVilGaaUd = false;
    if (fig.x === HAL_DOER.felt.x && fig.y === HAL_DOER.felt.y) skiftRum("vaerelse");
    return;
  }
  HAL_GAESTER.forEach(function (g) {
    if (g.sidder) {
      g.vent -= dt;
      if (g.vent <= 0) {
        g.sidder = false;
        g.saede = null;
        g.vent = 0.5;
      }
      return;
    }
    if (!g.rute.length) {
      if (g.saede && Math.round(g.x) === g.saede.x && Math.round(g.y) === g.saede.y) {
        // har en anden taget pladsen imens, så find en ny (eller bliv stående)
        if (tagnePladser(g.saede, g).indexOf(g.plads) >= 0) g.plads = ledigPlads(g.saede, g);
        if (g.plads < 0) {
          g.saede = null;
          return;
        }
        g.sidder = true;
        g.retning = venderHoejre(g.saede) ? "ned-hoejre" : "ned-venstre";
        g.vent = 5 + Math.random() * 6;
        return;
      }
      g.vent -= dt;
      if (g.vent <= 0) {
        halNytMaal(g);
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
  });
}

// Hvor gæsten er rykket hen på sin plads i sofaen
function gaestPlads(g) {
  if (!g.sidder) return 0;
  return saedePladser(g.saede)[g.plads] || 0;
}

function tegnHalGaest(g) {
  const p = punkt(g.x + 0.5, g.y + 0.5);
  p.x += gaestPlads(g);
  let sidde = null, bagud = 0;
  if (g.sidder) {
    sidde = { hoejde: MOEBEL_TYPER[g.saede.type].saede };
    bagud = (venderHoejre(g.saede) ? -1 : 1) * SIDDE_BAGUD;
  } else {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
  }
  tegnMenneske(ctx, p.x + bagud, p.y - Math.abs(bagud) / 2, g.valg, g.retning, g.rute.length ? g.trin : null, sidde);

  // navneskilt
  const hoejde = figurHoejde(g.valg) - 10 + (sidde ? -sidde.hoejde + 10 : 0);
  ctx.font = "bold 11px Verdana, sans-serif";
  ctx.textAlign = "center";
  const w = ctx.measureText(g.navn).width + 10;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(p.x - w / 2, p.y - hoejde - 22, w, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(g.navn, p.x, p.y - hoejde - 10);
}

// Kaldes fra tegnAlt(): læg gæsterne i listen over ting, der skal tegnes
function halTing(ting) {
  HAL_GAESTER.forEach(function (g) {
    ting.push({ dybde: g.x + g.y + 0.1 + gaestPlads(g) / 1000, tegn: function () { tegnHalGaest(g); } });
  });
}


// =============================================================
//  Start i velkomsthallen
// =============================================================
mitVaerelse = moeblerIRummet;
skiftRum("hal");

// Panelet til højre kan klappes ind, så rummet får hele skærmen
document.getElementById("panel-knap").addEventListener("click", function () {
  const panel = document.getElementById("panel");
  panel.classList.toggle("lukket");
  this.textContent = panel.classList.contains("lukket") ? "☰ Panel" : "✕";
});
