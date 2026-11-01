// =============================================================
//  Spillehjørnet 🕹 og Læsehjørnet 📚 — to fælles rum på stueetagen.
//  - Spillehjørnet: arkademaskiner, billardbord, bordfodbold, skakborde,
//    sækkestole og en reol med brætspil. Klik på en arkademaskine for at
//    spille "Stjerneregn" (fang stjernerne, slå din egen rekord).
//  - Læsehjørnet: en rolig stue med bogreoler, kamin, grønne ørelapsstole,
//    en chesterfield-sofa, læselamper og en globus. Klik på en bogreol for
//    at tage en bog og læse lidt.
//  Møblerne ligger i billeder/moebler/spil-*/ og laese-*/ (ét billede pr. retning)
//  og kommer med i kataloget herfra (kategorierne "Spillehjørnet" og "Læsehjørnet").
//  Caféens planter, lamper og stole bruges også.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
//  database-28-hjoerner.sql lader Bygmestre flytte møblerne (så alle ser det samme).
// =============================================================

// -------------------------------------------------------------
//  Rummene
// -------------------------------------------------------------
const SPIL_RUM = { id: "spillehjoernet", navn: "Spillehjørnet", ejer: EJER_NAVNE[0], bredde: 12, dybde: 10,
  vaeg: "#4a2a5a", gulv1: "#e6d9bd", gulv2: "#e6d9bd", vaegHoejde: 200, doer: null };   // lilla vægge og et ensfarvet cremefarvet gulv
const LAESE_RUM = { id: "laesehjoernet", navn: "Læsehjørnet", ejer: EJER_NAVNE[0], bredde: 10, dybde: 10,
  vaeg: "#2f4a3a", gulv1: "#8a5a3a", gulv2: "#7d5134", vaegHoejde: 200, doer: null };   // mørkegrønne vægge og trægulv
INDBYGGEDE_RUM.spillehjoernet = SPIL_RUM;
INDBYGGEDE_RUM.laesehjoernet = LAESE_RUM;
function iRummet(id) { return rumValg === "vaerelse" && aktivtVaerelse === id; }

// De stod allerede (låst) i navigatøren: nu kan man komme ind (også med elevatoren)
[
  { gammel: "spil", id: "spillehjoernet", navn: "Spillehjørnet", om: "Arkadespil, billard og skak 🕹", billede: "billeder/rum/spillehjoernet.png", maks: 30 },
  { gammel: "laese", id: "laesehjoernet", navn: "Læsehjørnet", om: "Rolig zone med bøger og kamin 📚", billede: "billeder/rum/laesehjoernet.png", maks: 20 },
].forEach(function (n) {
  const r = NAV_RUM.find(function (x) { return x.id === n.gammel || x.id === n.id; });
  const ny = { id: n.id, etage: "stue", navn: n.navn, om: n.om, billede: n.billede, maks: n.maks, rum: "vaerelse", vaerelse: n.id };
  if (r) { Object.keys(r).forEach(function (k) { delete r[k]; }); Object.assign(r, ny); } else NAV_RUM.push(ny);
});

// Møblerne (kommer med i kataloget herfra)
const HJOERNE_TYPER = [
  { id: "spil-arkade", navn: "Arkademaskine", kategori: "Spillehjørnet" },
  { id: "spil-billard", navn: "Billardbord", kategori: "Spillehjørnet", felter: [2, 1] },
  { id: "spil-bordfodbold", navn: "Bordfodbold", kategori: "Spillehjørnet", felter: [2, 1] },
  { id: "spil-skakbord", navn: "Skakbord", kategori: "Spillehjørnet" },
  { id: "spil-saekkestol", navn: "Vinrød hyggestol", kategori: "Spillehjørnet", saede: 19 },
  { id: "spil-hylde", navn: "Reol med brætspil", kategori: "Spillehjørnet" },
  { id: "laese-reol", navn: "Bogreol", kategori: "Læsehjørnet" },
  { id: "laese-laenestol", navn: "Grøn ørelapsstol", kategori: "Læsehjørnet", saede: 22 },
  { id: "laese-sofa", navn: "Chesterfield-sofa", kategori: "Læsehjørnet", felter: [2, 1], saede: 20 },
  { id: "laese-lampe", navn: "Læselampe", kategori: "Læsehjørnet" },
  { id: "laese-bord", navn: "Sidebord med bøger", kategori: "Læsehjørnet" },
  { id: "laese-kamin", navn: "Kamin", kategori: "Læsehjørnet", felter: [2, 1] },
  { id: "laese-globus", navn: "Globus", kategori: "Læsehjørnet" },
];
HJOERNE_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});

// Hotellets egne møbler. Retning 0 vender ned mod venstre, 1 ned mod højre (kun dem kan man sidde i)
function hjM(type, x, y, retning) { return { type: type, x: x, y: y, retning: retning || 0 }; }
const SPIL_MOEBLER = [
  // bagvæggen: arkademaskiner og reoler med brætspil
  hjM("cafe-plante", 0, 0), hjM("spil-arkade", 1, 0), hjM("spil-arkade", 2, 0), hjM("spil-arkade", 3, 0),
  hjM("spil-hylde", 5, 0), hjM("cafe-lampe", 6, 0), hjM("spil-hylde", 7, 0),
  hjM("spil-arkade", 8, 0), hjM("spil-arkade", 9, 0), hjM("spil-arkade", 10, 0), hjM("cafe-plante", 11, 0),
  // venstre væg: hyggestole (felterne y 2–4 holdes fri til elevatoren)
  hjM("spil-hylde", 0, 5, 1), hjM("spil-saekkestol", 0, 6, 1), hjM("spil-saekkestol", 0, 7, 1), hjM("cafe-lampe", 0, 8, 1),
  // billard og bordfodbold i midten
  hjM("spil-billard", 3, 3), hjM("spil-bordfodbold", 7, 3),
  // skakborde med en stol på hver side
  hjM("spil-skakbord", 3, 7), hjM("spil-saekkestol", 2, 7, 1), hjM("cafe-stol", 3, 6, 0),
  hjM("spil-skakbord", 7, 7), hjM("spil-saekkestol", 6, 7, 1), hjM("cafe-stol", 7, 6, 0),
  hjM("spil-skakbord", 10, 6), hjM("spil-saekkestol", 9, 6, 1), hjM("cafe-stol", 10, 5, 0),
  // hjørnerne forrest
  hjM("cafe-plante", 0, 9), hjM("cafe-plante", 11, 9),
];
const LAESE_MOEBLER = [
  // bagvæggen: bogreoler og kaminen med en stol på hver side
  hjM("laese-reol", 0, 0), hjM("laese-reol", 1, 0), hjM("laese-lampe", 2, 0),
  hjM("laese-laenestol", 3, 1), hjM("laese-kamin", 4, 0), hjM("laese-laenestol", 6, 1),
  hjM("laese-lampe", 7, 0), hjM("laese-reol", 8, 0), hjM("laese-reol", 9, 0),
  hjM("laese-bord", 2, 1), hjM("laese-bord", 7, 1),
  // venstre væg: en reol og en læsekrog (felterne y 2–4 holdes fri til elevatoren)
  hjM("laese-reol", 0, 1, 1),
  hjM("laese-laenestol", 0, 5, 1), hjM("laese-bord", 0, 6, 1), hjM("laese-laenestol", 0, 7, 1), hjM("laese-lampe", 0, 8, 1),
  // sofaen midt i rummet
  hjM("laese-sofa", 4, 5), hjM("laese-bord", 6, 5), hjM("laese-bord", 3, 5),
  // globus og planter
  hjM("laese-globus", 8, 4), hjM("cafe-plante", 9, 9), hjM("cafe-plante", 0, 9),
];
const HJOERNE_MOEBLER = { spillehjoernet: SPIL_MOEBLER, laesehjoernet: LAESE_MOEBLER };
function hjoerneSomData(id) {
  return HJOERNE_MOEBLER[id].map(function (x) { return { type: x.type, x: x.x, y: x.y, spejlet: false, retning: x.retning }; });
}

// Møblerne: det, der er gemt på denne computer, ellers hotellets egne
const vaerelseMoeblerFoerHjoerner = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (HJOERNE_MOEBLER[id] && !andreVaerelser[id]) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + id) || "null"); } catch (e) {}
    andreVaerelser[id] = (Array.isArray(gemt) && gemt.length ? gemt : hjoerneSomData(id))
      .map(function (x) { return Object.assign({}, x); }).filter(function (x) { return MOEBEL_TYPER[x.type]; });
  }
  return vaerelseMoeblerFoerHjoerner(id);
};
// Har ingen bygget noget i rummene endnu, ser alle hotellets egne møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerHjoerner = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerHjoerner(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar) {
      Object.keys(HJOERNE_MOEBLER).forEach(function (id) {
        if (!(Array.isArray(svar[id]) && svar[id].length)) svar[id] = hjoerneSomData(id);
      });
    }
    return svar;
  };
}

// Velkomst
const skiftRumFoerHjoerner = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerHjoerner(navn);
  if (iRummet("spillehjoernet")) besked.textContent = "Velkommen i Spillehjørnet 🕹 Klik på en arkademaskine for at spille Stjerneregn!";
  if (iRummet("laesehjoernet")) besked.textContent = "Velkommen i Læsehjørnet 📚 Her er rolig zone 🤫 Klik på en bogreol for at tage en bog.";
};


// -------------------------------------------------------------
//  Klik på et møbel → gå hen foran det → gør noget
//  (virker også, hvis man har købt møblet i Shoppen og sat det i sit værelse)
// -------------------------------------------------------------
const HJOERNE_KLIK = {};   // type → function (m) {...}
let gaarTilHjoerne = null; // { m, x, y }

function hjoerneUnderMus(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  moeblerIRummet.forEach(function (x) {
    if (!HJOERNE_KLIK[x.type]) return;
    const t = MOEBEL_TYPER[x.type];
    const b = hentBillede(t.retninger[x.retning || 0]);
    if (!billedeKlar(b)) return;
    const sted = moebelSted(t, x.x, x.y, drejetTvaers(x));
    const venstre = sted.x - b.naturalWidth / 2, top = sted.y + FLISE_H / 2 - b.naturalHeight;
    const inde = sx >= venstre + 8 && sx <= venstre + b.naturalWidth - 8 && sy >= top && sy <= top + b.naturalHeight;
    if (inde && (!fundet || moebelDybde(x) > moebelDybde(fundet))) fundet = x;
  });
  if (!fundet) {
    const f = musTilFelt(e);
    const x = moebelPaa(f.x, f.y);
    if (x && HJOERNE_KLIK[x.type]) fundet = x;
  }
  return fundet;
}

// Felterne rundt om møblet: dem foran først
function hjoernePladser(x) {
  const f = moebelFelter(MOEBEL_TYPER[x.type], drejetTvaers(x));
  const r = x.retning || 0;
  const foran = [], andre = [];
  for (let i = 0; i < f[0]; i++) {
    (r === 0 ? foran : andre).push({ x: x.x + i, y: x.y + f[1] });
    (r === 2 ? foran : andre).push({ x: x.x + i, y: x.y - 1 });
  }
  for (let j = 0; j < f[1]; j++) {
    (r === 1 ? foran : andre).push({ x: x.x + f[0], y: x.y + j });
    (r === 3 ? foran : andre).push({ x: x.x - 1, y: x.y + j });
  }
  return foran.concat(andre);
}
function vedHjoerneMoebel(x) {
  const fig = figurFelt();
  return hjoernePladser(x).some(function (p) { return p.x === fig.x && p.y === fig.y; });
}

laerred.addEventListener("click", function (e) {
  if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
  const x = hjoerneUnderMus(e);
  if (!x) return;
  e.stopImmediatePropagation();
  valgtMoebel = x;
  opdaterPanel();
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  if (vedHjoerneMoebel(x)) { fremmeVed(x); return; }
  for (const p of hjoernePladser(x)) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0) { gaarTilHjoerne = { m: x, x: p.x, y: p.y }; return; }
  }
  besked.textContent = "Du kan ikke komme derhen. Der står noget i vejen.";
}, true);

setInterval(function () {
  const g = gaarTilHjoerne;
  if (!g || figur.rute.length > 0) return;
  gaarTilHjoerne = null;
  const fig = figurFelt();
  if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0) fremmeVed(g.m);
}, 100);

function fremmeVed(x) {
  // kig på møblet
  const f = moebelFelter(MOEBEL_TYPER[x.type], drejetTvaers(x));
  const dx = x.x + (f[0] - 1) / 2 - figur.x, dy = x.y + (f[1] - 1) / 2 - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  figur.forfra = dx + dy >= 0;
  HJOERNE_KLIK[x.type](x);
}

laerred.addEventListener("mousemove", function (e) {
  if (valgtType || !moeblerIRummet.some(function (x) { return HJOERNE_KLIK[x.type]; })) return;
  if (hjoerneUnderMus(e)) laerred.style.cursor = "pointer";
});

// Et lille vindue i vinrød og guld (samme stil som caféens)
function hjoerneVindue(id, titel, indhold) {
  const v = document.createElement("div");
  v.id = id;
  v.className = "hj-vindue";
  v.hidden = true;
  v.innerHTML = "<div class='hj-top'><b>" + titel + "</b><button type='button' class='hj-luk' title='Luk'>✕</button></div>" + indhold;
  document.body.appendChild(v);
  v.querySelector(".hj-luk").addEventListener("click", function () { v.hidden = true; if (v.vedLuk) v.vedLuk(); });
  return v;
}
// vinduerne lukker, hvis man går væk eller skifter rum
function lukNaarManGaar(v) {
  setInterval(function () {
    if (v.hidden || !v.ved) return;
    if (moeblerIRummet.indexOf(v.ved) < 0 || figur.rute.length > 0 || !vedHjoerneMoebel(v.ved)) {
      v.hidden = true; if (v.vedLuk) v.vedLuk();
    }
  }, 300);
}


// -------------------------------------------------------------
//  🕹 Stjerneregn: arkadespillet
//  Fang de gyldne stjerner (1 point) og de lilla krystaller (5 point)
//  med kurven. Undgå de grå sten: tre sten, så er spillet slut.
//  Styr med musen eller ← →. Rekorden gemmes på denne computer.
// -------------------------------------------------------------
const ARKADE_NOEGLE = "mit-hotel-arkade-rekord";
const arkade = hjoerneVindue("arkade-vindue", "🕹 Stjerneregn",
  "<canvas width='300' height='240'></canvas>" +
  "<div class='hj-linje'><span class='ark-info'>Fang stjernerne! Undgå stenene.</span><button type='button' class='hj-knap ark-start'>▶ Start</button></div>");
const arkLaerred = arkade.querySelector("canvas");
const arkTegn = arkLaerred.getContext("2d");
let ark = null;   // spillet, mens det kører
function arkRekord() {
  try { return (JSON.parse(localStorage.getItem(ARKADE_NOEGLE) || "{}") || {})[FIGUR.navn] || 0; } catch (e) { return 0; }
}
function gemArkRekord(p) {
  try {
    const alle = JSON.parse(localStorage.getItem(ARKADE_NOEGLE) || "{}") || {};
    alle[FIGUR.navn] = p;
    localStorage.setItem(ARKADE_NOEGLE, JSON.stringify(alle));
  } catch (e) {}
}
function arkInfo(tekst) { arkade.querySelector(".ark-info").textContent = tekst; }

HJOERNE_KLIK["spil-arkade"] = function (x) {
  arkade.ved = x;
  arkade.hidden = false;
  laesVindue.hidden = true;
  if (!ark) { arkInfo("Din rekord: " + arkRekord() + " ⭐"); arkTegnAlt(); }
  besked.textContent = "🕹 Tryk ▶ Start, og fang stjernerne med kurven (musen eller ← →).";
};
arkade.vedLuk = function () { ark = null; };
lukNaarManGaar(arkade);

arkade.querySelector(".ark-start").addEventListener("click", function () {
  ark = { kurv: 150, ting: [], point: 0, liv: 3, tid: performance.now(), naeste: 0, venstre: false, hoejre: false, slut: false };
  this.textContent = "↻ Forfra";
  arkInfo("⭐ 0   ❤️❤️❤️");
  requestAnimationFrame(arkTrin);
});
arkLaerred.addEventListener("mousemove", function (e) {
  if (!ark) return;
  const r = arkLaerred.getBoundingClientRect();
  ark.kurv = Math.max(22, Math.min(278, (e.clientX - r.left) * (300 / r.width)));
});
document.addEventListener("keydown", function (e) {
  if (!ark || arkade.hidden) return;
  if (e.key === "ArrowLeft") { ark.venstre = true; e.preventDefault(); }
  if (e.key === "ArrowRight") { ark.hoejre = true; e.preventDefault(); }
});
document.addEventListener("keyup", function (e) {
  if (!ark) return;
  if (e.key === "ArrowLeft") ark.venstre = false;
  if (e.key === "ArrowRight") ark.hoejre = false;
});

let arkSidst = 0;
function arkTrin(nu) {
  const s = ark;
  if (!s || s.slut || arkade.hidden) return;
  const dt = Math.min(50, nu - (arkSidst || nu)); arkSidst = nu;
  const gaaet = (nu - s.tid) / 1000;
  const fart = 1 + gaaet / 25;                       // det går hurtigere og hurtigere
  if (s.venstre) s.kurv = Math.max(22, s.kurv - 0.35 * dt);
  if (s.hoejre) s.kurv = Math.min(278, s.kurv + 0.35 * dt);
  if (nu > s.naeste) {
    const t = Math.random();
    s.ting.push({ x: 14 + Math.random() * 272, y: -10, slags: t < 0.08 ? "krystal" : t < 0.32 ? "sten" : "stjerne", v: 0.06 + Math.random() * 0.05 });
    s.naeste = nu + Math.max(260, 700 - gaaet * 12);
  }
  s.ting.forEach(function (o) { o.y += o.v * fart * dt; });
  s.ting = s.ting.filter(function (o) {
    if (o.y > 206 && o.y < 226 && Math.abs(o.x - s.kurv) < 26) {
      if (o.slags === "sten") { s.liv--; if (typeof svaev === "function") svaev("💥"); }
      else s.point += o.slags === "krystal" ? 5 : 1;
      return false;
    }
    return o.y < 250;
  });
  arkInfo("⭐ " + s.point + "   " + "❤️".repeat(Math.max(0, s.liv)));
  arkTegnAlt();
  if (s.liv <= 0) { arkSlut(); return; }
  requestAnimationFrame(arkTrin);
}

function arkSlut() {
  const s = ark;
  s.slut = true;
  arkSidst = 0;
  const gammel = arkRekord();
  if (s.point > gammel) {
    gemArkRekord(s.point);
    arkInfo("🏆 Ny rekord: " + s.point + " ⭐ (før " + gammel + ")");
    besked.textContent = "🏆 Ny rekord i Stjerneregn: " + s.point + " point!";
    if (typeof svaev === "function") svaev("🏆");
  } else {
    arkInfo("Spillet er slut: " + s.point + " ⭐  Rekord: " + gammel);
  }
  arkTegnAlt();
  ark = null;
  arkSlutBillede = s;
}
let arkSlutBillede = null;

function arkStjerne(cx, cy, r, farve) {
  arkTegn.fillStyle = farve;
  arkTegn.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    arkTegn.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  arkTegn.closePath(); arkTegn.fill();
}
function arkTegnAlt() {
  const c = arkTegn, s = ark || arkSlutBillede;
  c.fillStyle = "#161a3c"; c.fillRect(0, 0, 300, 240);
  // små stjerner i baggrunden
  c.fillStyle = "#3a4280";
  for (let i = 0; i < 40; i++) c.fillRect((i * 73) % 300, (i * 47 + i * i) % 200, 2, 2);
  c.fillStyle = "#2b1d44"; c.fillRect(0, 226, 300, 14);
  if (!s) {
    c.fillStyle = "#f6dfa0"; c.font = "bold 22px Verdana"; c.textAlign = "center";
    c.fillText("STJERNEREGN", 150, 100);
    arkStjerne(150, 140, 18, "#f2c14e");
    c.font = "12px Verdana"; c.fillText("Tryk ▶ Start", 150, 190);
    return;
  }
  s.ting.forEach(function (o) {
    if (o.slags === "stjerne") arkStjerne(o.x, o.y, 9, "#f2c14e");
    else if (o.slags === "krystal") {
      c.fillStyle = "#b07ae0";
      c.beginPath(); c.moveTo(o.x, o.y - 11); c.lineTo(o.x + 8, o.y); c.lineTo(o.x, o.y + 11); c.lineTo(o.x - 8, o.y); c.closePath(); c.fill();
      c.fillStyle = "#e6cff8"; c.fillRect(o.x - 2, o.y - 6, 3, 5);
    } else {
      c.fillStyle = "#8a8a94"; c.beginPath(); c.arc(o.x, o.y, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#5c5c66"; c.fillRect(o.x - 3, o.y + 1, 4, 3);
    }
  });
  // kurven
  c.fillStyle = "#9a6a42"; c.fillRect(s.kurv - 24, 210, 48, 14);
  c.fillStyle = "#d9a441"; c.fillRect(s.kurv - 26, 208, 52, 4);
  c.fillStyle = "#6e4029"; for (let i = -18; i <= 18; i += 9) c.fillRect(s.kurv + i, 213, 2, 10);
  if (s.slut) {
    c.fillStyle = "rgba(0,0,0,.55)"; c.fillRect(0, 80, 300, 70);
    c.fillStyle = "#f6dfa0"; c.font = "bold 20px Verdana"; c.textAlign = "center";
    c.fillText("SPILLET ER SLUT", 150, 110);
    c.font = "14px Verdana"; c.fillText(s.point + " point", 150, 134);
  }
}


// -------------------------------------------------------------
//  📚 Bogreolen: tag en bog og læs lidt
// -------------------------------------------------------------
const BOEGER = [
  { titel: "Elevatoren, der ville se havet", tekst: "Hver nat, når hotellet sov, kørte den gamle elevator helt op til tagterrassen. Den kunne ikke se havet, men den kunne høre det. \"I morgen,\" sagde den til sig selv, \"i morgen bygger de mig et vindue.\"" },
  { titel: "Små ting om stjerner", tekst: "Lyset fra de stjerner, du ser om natten, har ofte været mange hundrede år om at nå hertil. Når du kigger op, kigger du altså også tilbage i tiden. ✨" },
  { titel: "Katten i Læsehjørnet", tekst: "Ingen ved, hvem katten tilhører. Den sover altid i den grønne stol tættest på kaminen, og den vågner kun, når nogen vender en side for højt." },
  { titel: "Digt om regn", tekst: "Regnen banker på ruden,\nsom om den vil ind og læse med.\nJeg lader den vente lidt,\njeg er lige nået til det bedste sted." },
  { titel: "Vidste du det?", tekst: "En blæksprutte har tre hjerter og blåt blod. Og nej, den kan ikke spille tre slags musik på én gang, selvom det ville være sejt. 🐙" },
  { titel: "Brevet under døren", tekst: "Der lå et brev under døren til værelse 7. Der stod kun: \"Tak, fordi du smilede til mig i caféen i går.\" Ingen underskrift. Bare en lille tegnet stjerne." },
  { titel: "Opskrift på en god dag", tekst: "1 kop varm kakao. 2 gode venner. 3 sjove historier. Rør det hele sammen i Caféen, og lad det hvile en times tid i en blød sofa. Server med et smil." },
  { titel: "Den forsvundne nøgle", tekst: "Receptionisten ledte i tre dage efter nøglen til den hemmelige etage. Til sidst fandt hun den i sin egen lomme. Den havde ligget der hele tiden og grinet lidt af hende." },
  { titel: "Vidste du det?", tekst: "Den ældste bog, man kender, der er trykt med bogstaver man kan flytte rundt, er mere end 600 år gammel. Før det blev bøger skrevet i hånden, side for side. 📜" },
  { titel: "Hvisken", tekst: "I Læsehjørnet taler man stille. Ikke fordi det er en regel, men fordi bøgerne lytter. Og de bedste historier kommer kun frem, når der er helt roligt." },
  { titel: "Pingvinen på 3. sal", tekst: "Det var ikke meningen, at pingvinen skulle bo på hotellet. Den var bare kommet ind med en kuffert. Nu har den sin egen sofa og drikker isvand fra Tagterrassen hver eftermiddag. 🐧" },
  { titel: "Godnat", tekst: "Sluk lampen, læg bogen fra dig,\nkaminen gløder stadig lidt.\nI morgen er der nye sider,\nog hotellet venter på dig. 🌙" },
];
const laesVindue = hjoerneVindue("laes-vindue", "📚 Læsehjørnet",
  "<div class='lv-bog'><h3></h3><p></p></div>" +
  "<div class='hj-linje'><span class='lv-tal'></span><button type='button' class='hj-knap lv-ny'>📖 Tag en anden bog</button></div>");
let bogNr = -1;
function visBog() {
  let n = bogNr;
  while (n === bogNr) n = Math.floor(Math.random() * BOEGER.length);
  bogNr = n;
  laesVindue.querySelector("h3").textContent = BOEGER[n].titel;
  laesVindue.querySelector(".lv-bog p").textContent = BOEGER[n].tekst;
  laesVindue.querySelector(".lv-tal").textContent = "Bog " + (n + 1) + " af " + BOEGER.length;
}
HJOERNE_KLIK["laese-reol"] = function (x) {
  laesVindue.ved = x;
  visBog();
  laesVindue.hidden = false;
  arkade.hidden = true; ark = null;
  if (typeof svaev === "function") svaev("📖");
  besked.textContent = "📖 Du har taget en bog fra reolen. God fornøjelse!";
};
laesVindue.querySelector(".lv-ny").addEventListener("click", visBog);
lukNaarManGaar(laesVindue);


// -------------------------------------------------------------
//  Shoppen: møblerne kan købes (js/shop-hotel-moebler.js)
// -------------------------------------------------------------
const HJOERNE_PRISER = {
  "spil-arkade": 450, "spil-billard": 500, "spil-bordfodbold": 350, "spil-skakbord": 150, "spil-saekkestol": 120, "spil-hylde": 140,
  "laese-reol": 160, "laese-laenestol": 200, "laese-sofa": 320, "laese-lampe": 110, "laese-bord": 90, "laese-kamin": 600, "laese-globus": 130,
};
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  Object.assign(HOTEL_MOEBEL_PRISER, HJOERNE_PRISER);
  [{ kategori: "Spillehjørnet", ikon: "🕹" }, { kategori: "Læsehjørnet", ikon: "📚" }].forEach(function (k) {
    if (!HOTEL_SHOP_KAT.some(function (x) { return x.kategori === k.kategori; })) HOTEL_SHOP_KAT.push(k);
  });
  hotelMoeblerIShop();
})(0);


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const hjoerneStil = document.createElement("style");
hjoerneStil.textContent =
  ".hj-vindue { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 60; width: 320px;" +
  "  background: #fbf3e4; border: 3px solid #d9a441; border-radius: 12px; box-shadow: 0 6px 18px rgba(60,10,20,.35);" +
  "  font-family: Verdana, sans-serif; color: #4a1420; overflow: hidden; }" +
  ".hj-vindue[hidden] { display: none !important; }" +
  ".hj-vindue .hj-top { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px;" +
  "  background: #7a1f2e; color: #f6dfa0; font-size: 14px; }" +
  ".hj-vindue .hj-luk { background: none; border: 0; color: #f6dfa0; font-size: 15px; cursor: pointer; }" +
  ".hj-vindue canvas { display: block; width: 300px; height: 240px; margin: 10px auto 0; border: 2px solid #5e1622; border-radius: 6px; image-rendering: pixelated; cursor: none; }" +
  ".hj-vindue .hj-linje { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px 10px; font-size: 12px; }" +
  ".hj-vindue .hj-knap { padding: 6px 10px; font-size: 12px; cursor: pointer; border-radius: 8px; white-space: nowrap;" +
  "  background: #fff8ea; color: #5e1622; border: 2px solid #d9a441; font-weight: bold; }" +
  ".hj-vindue .hj-knap:hover { background: #f6dfa0; }" +
  "#laes-vindue .lv-bog { margin: 10px 10px 0; padding: 10px 12px; background: #fffdf6; border: 1px solid #e3cfa2; border-radius: 8px; min-height: 110px; }" +
  "#laes-vindue h3 { margin: 0 0 6px; font-size: 14px; color: #7a1f2e; }" +
  "#laes-vindue .lv-bog p { margin: 0; font-size: 12.5px; line-height: 1.5; white-space: pre-line; font-family: Georgia, serif; }";
document.head.appendChild(hjoerneStil);
