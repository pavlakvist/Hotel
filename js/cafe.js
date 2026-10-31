// =============================================================
//  Caféen ☕ — et fælles rum på stueetagen i vinrød og guld.
//  - Vinrøde vægge, et ternet gulv i creme og vinrød, bistroborde
//    af marmor, caféstole, fløjlssofaer, lamper, palmer og en menutavle.
//  - Klik på cafédisken, så går du derhen og kan vælge en kop kaffe ☕
//    eller et stykke kage 🍰, som du får i hånden (ligesom maden fra køleskabet).
//  Møblerne står i js/moebel-katalog.js (kategori "Café"), billederne i billeder/moebler/cafe-*/.
//  Maden er billeder/mad/cafe-mad.png (række 0 = kaffe, række 1 = kage).
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
//  database-27-cafe.sql lader Bygmestre flytte møblerne (så alle ser det samme).
// =============================================================

// -------------------------------------------------------------
//  Rummet
// -------------------------------------------------------------
const CAFE_RUM = { id: "cafe", navn: "Caféen", ejer: EJER_NAVNE[0], bredde: 12, dybde: 10,
  vaeg: "#7a2232", gulv1: "#eadfc8", gulv2: "#8c2a3a", vaegHoejde: 200, doer: null };   // ternet gulv; ingen dør: man kommer med elevatoren
INDBYGGEDE_RUM.cafe = CAFE_RUM;
function iCafeen() { return rumValg === "vaerelse" && aktivtVaerelse === "cafe"; }

// "Den lille café" stod allerede (låst) i navigatøren: nu kan man komme ind
(function () {
  const r = NAV_RUM.find(function (x) { return x.id === "cafe"; });
  const ny = { id: "cafe", etage: "stue", navn: "Caféen", om: "Kaffe, kage og hygge ☕", billede: "billeder/rum/cafe.png", maks: 40, rum: "vaerelse", vaerelse: "cafe" };
  if (r) Object.assign(r, ny); else NAV_RUM.push(ny);
})();

// Hvis browseren har en gammel udgave af js/moebel-katalog.js, kommer caféens møbler med herfra
const CAFE_TYPER = [
  { id: "cafe-stol", navn: "Caféstol", saede: 21 },
  { id: "cafe-bord", navn: "Bistrobord af marmor" },
  { id: "cafe-sofa", navn: "Vinrød fløjlssofa", felter: [2, 1], saede: 22 },
  { id: "cafe-disk", navn: "Cafédisk med kager", felter: [2, 1] },
  { id: "cafe-lampe", navn: "Standerlampe" },
  { id: "cafe-plante", navn: "Palme i guldkrukke" },
  { id: "cafe-tavle", navn: "Menutavle" },
];
CAFE_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
  t.kategori = "Café";
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});

// Hotellets egne møbler i caféen (retning 0 vender ned mod venstre, 1 ned mod højre)
const CAFE_MOEBLER = [
  // bagvæggen: sofaer, lamper, disken og palmer
  { type: "cafe-plante", x: 0, y: 0, retning: 0 },
  { type: "cafe-sofa", x: 1, y: 0, retning: 0 },
  { type: "cafe-lampe", x: 3, y: 0, retning: 0 },
  { type: "cafe-disk", x: 5, y: 0, retning: 0 },
  { type: "cafe-tavle", x: 7, y: 0, retning: 0 },
  { type: "cafe-sofa", x: 8, y: 0, retning: 0 },
  { type: "cafe-lampe", x: 10, y: 0, retning: 0 },
  { type: "cafe-plante", x: 11, y: 0, retning: 0 },
  // seks bistroborde, hver med to stole
  { type: "cafe-bord", x: 4, y: 4, retning: 0 }, { type: "cafe-stol", x: 3, y: 4, retning: 1 }, { type: "cafe-stol", x: 4, y: 3, retning: 0 },
  { type: "cafe-bord", x: 7, y: 4, retning: 0 }, { type: "cafe-stol", x: 6, y: 4, retning: 1 }, { type: "cafe-stol", x: 7, y: 3, retning: 0 },
  { type: "cafe-bord", x: 10, y: 4, retning: 0 }, { type: "cafe-stol", x: 9, y: 4, retning: 1 }, { type: "cafe-stol", x: 10, y: 3, retning: 0 },
  { type: "cafe-bord", x: 4, y: 7, retning: 0 }, { type: "cafe-stol", x: 3, y: 7, retning: 1 }, { type: "cafe-stol", x: 4, y: 6, retning: 0 },
  { type: "cafe-bord", x: 7, y: 7, retning: 0 }, { type: "cafe-stol", x: 6, y: 7, retning: 1 }, { type: "cafe-stol", x: 7, y: 6, retning: 0 },
  { type: "cafe-bord", x: 10, y: 7, retning: 0 }, { type: "cafe-stol", x: 9, y: 7, retning: 1 }, { type: "cafe-stol", x: 10, y: 6, retning: 0 },
  // hjørnerne forrest
  { type: "cafe-plante", x: 0, y: 9, retning: 0 },
  { type: "cafe-lampe", x: 0, y: 8, retning: 0 },
  { type: "cafe-plante", x: 11, y: 9, retning: 0 },
];
function cafeSomData() {
  return CAFE_MOEBLER.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
}

// Møblerne: det, der er gemt på denne computer, ellers hotellets egne
const vaerelseMoeblerFoerCafe = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === "cafe" && !andreVaerelser.cafe) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-cafe") || "null"); } catch (e) {}
    andreVaerelser.cafe = (Array.isArray(gemt) && gemt.length ? gemt : cafeSomData())
      .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
  }
  return vaerelseMoeblerFoerCafe(id);
};
// Har ingen bygget noget i caféen endnu, ser alle hotellets egne møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerCafe = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerCafe(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar.cafe) && svar.cafe.length)) svar.cafe = cafeSomData();
    return svar;
  };
}

// Velkomst
const skiftRumFoerCafe = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerCafe(navn);
  if (iCafeen()) besked.textContent = "Velkommen i Caféen ☕ Klik på disken for at få kaffe eller kage, og find en plads.";
};


// -------------------------------------------------------------
//  Kaffe ☕ og kage 🍰 i hånden (ligesom maden fra køleskabet, js/koeleskab.js)
// -------------------------------------------------------------
const CAFE_MAD_BILLEDE = "billeder/mad/cafe-mad.png";   // 4 billeder à 48x64 pr. række: helt, 1, 2 og 3 bid
const CAFE_MAD = {
  kaffe: { navn: "kaffe", hvad: "en kop kaffe", tegn: "☕", raekke: 0, lyd: "Slurp!", goer: "drikker", greb: 0.75 },
  kage:  { navn: "kage",  hvad: "et stykke kage", tegn: "🍰", raekke: 1, lyd: "Nam!", goer: "spiser", greb: 0.75 },
};
function cafeMadKlar() { return typeof MAD !== "undefined" && typeof giHaand === "function" && typeof tegnMad === "function"; }

(function vent() {
  if (!cafeMadKlar()) { setTimeout(vent, 300); return; }
  // "usynlig" i listen, så køleskabet ikke giver kaffe og kage
  Object.keys(CAFE_MAD).forEach(function (k) {
    if (!MAD[k]) Object.defineProperty(MAD, k, { enumerable: false, value: CAFE_MAD[k] });
  });
  // havde man kaffe eller kage i hånden, før koeleskab.js kendte dem?
  try {
    const h = JSON.parse(localStorage.getItem(MAD_NOEGLE) || "null");
    if (!minHaand && h && CAFE_MAD[h.ting]) minHaand = giHaand(h.ting, h.bid);
  } catch (e) {}
  // kaffe og kage tegnes fra deres eget billede (lånes ind på mad.png's plads, mens den tegner)
  const tegnMadFoerCafe = tegnMad;
  tegnMad = function (h, p, hoejde, side, sidder, valg) {
    if (!h || !CAFE_MAD[h.ting]) { tegnMadFoerCafe(h, p, hoejde, side, sidder, valg); return; }
    const madBillede = billeder[MAD_BILLEDE];
    billeder[MAD_BILLEDE] = hentBillede(CAFE_MAD_BILLEDE);
    try { tegnMadFoerCafe(h, p, hoejde, side, sidder, valg); } finally { if (madBillede) billeder[MAD_BILLEDE] = madBillede; else delete billeder[MAD_BILLEDE]; }
  };
})();


// -------------------------------------------------------------
//  Cafédisken: klik på den, gå derhen, og vælg kaffe eller kage
//  (virker også, hvis man har købt disken i Shoppen og sat den i sit værelse)
// -------------------------------------------------------------
let gaarTilDisk = null;    // { m, x, y }
function erCafeDisk(m) { return !!m && m.type === "cafe-disk"; }

// Er musen over billedet af en cafédisk? (hele billedet tæller, ikke kun felterne)
function diskUnderMus(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  moeblerIRummet.forEach(function (m) {
    if (!erCafeDisk(m)) return;
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
    if (erCafeDisk(m)) fundet = m;
  }
  return fundet;
}

// Felterne rundt om disken: dem foran (hvor gæsten står) først
function diskPladser(m) {
  const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
  const r = m.retning || 0;
  const foran = [], andre = [];
  for (let i = 0; i < f[0]; i++) {
    (r === 0 ? foran : andre).push({ x: m.x + i, y: m.y + f[1] });
    (r === 2 ? foran : andre).push({ x: m.x + i, y: m.y - 1 });
  }
  for (let j = 0; j < f[1]; j++) {
    (r === 1 ? foran : andre).push({ x: m.x + f[0], y: m.y + j });
    (r === 3 ? foran : andre).push({ x: m.x - 1, y: m.y + j });
  }
  return foran.concat(andre);
}

laerred.addEventListener("click", function (e) {
  if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
  const m = diskUnderMus(e);
  if (!m || !cafeMadKlar()) return;
  e.stopImmediatePropagation();
  valgtMoebel = m;
  opdaterPanel();
  lukCafeBestil();
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  const fig = figurFelt();
  const pladser = diskPladser(m);
  if (pladser.some(function (p) { return p.x === fig.x && p.y === fig.y; })) { vedDisken(m); return; }
  for (const p of pladser) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0) { gaarTilDisk = { m: m, x: p.x, y: p.y }; return; }
  }
  besked.textContent = "Du kan ikke komme hen til disken. Der står noget i vejen.";
}, true);

// fremme ved disken?
setInterval(function () {
  const g = gaarTilDisk;
  if (!g || figur.rute.length > 0) return;
  gaarTilDisk = null;
  const fig = figurFelt();
  if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0) vedDisken(g.m);
}, 100);

function vedDisken(m) {
  // kig på disken (midt på den)
  const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
  const dx = m.x + (f[0] - 1) / 2 - figur.x, dy = m.y + (f[1] - 1) / 2 - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  figur.forfra = dx + dy >= 0;
  visCafeBestil(m);
}

// Den lille bestillings-boks (vinrød og guld)
const cafeBestil = document.createElement("div");
cafeBestil.id = "cafe-bestil";
cafeBestil.hidden = true;
cafeBestil.innerHTML =
  "<div class='cb-top'><b>☕ Caféen</b><button type='button' class='cb-luk' title='Luk'>✕</button></div>" +
  "<p>Hvad må det være?</p>" +
  "<div class='cb-valg'><button type='button' data-ting='kaffe'>☕ En kop kaffe</button><button type='button' data-ting='kage'>🍰 Et stykke kage</button></div>";
document.body.appendChild(cafeBestil);
let cafeBestilVed = null;
function visCafeBestil(m) { cafeBestilVed = m; cafeBestil.hidden = false; }
function lukCafeBestil() { cafeBestil.hidden = true; cafeBestilVed = null; }
cafeBestil.querySelector(".cb-luk").addEventListener("click", lukCafeBestil);
cafeBestil.querySelectorAll("[data-ting]").forEach(function (k) {
  k.addEventListener("click", function () { faaCafe(k.dataset.ting); });
});
// boksen lukker, hvis man går væk fra disken eller skifter rum
setInterval(function () {
  if (cafeBestil.hidden) return;
  const m = cafeBestilVed;
  const fig = figurFelt();
  if (!m || moeblerIRummet.indexOf(m) < 0 || figur.rute.length > 0 ||
      !diskPladser(m).some(function (p) { return p.x === fig.x && p.y === fig.y; })) lukCafeBestil();
}, 300);

function faaCafe(ting) {
  const mad = CAFE_MAD[ting];
  if (!mad || !cafeMadKlar()) return;
  lukCafeBestil();
  if (typeof svaev === "function") svaev(mad.tegn);
  setTimeout(function () {
    minHaand = giHaand(ting);
    gemHaand();
    besked.textContent = "Værsgo, " + mad.hvad + " " + mad.tegn + " Find en plads, og nyd det! Klik på en anden for at give det videre.";
  }, 500);
}

// hånd-markør over disken
laerred.addEventListener("mousemove", function (e) {
  if (valgtType || !moeblerIRummet.some(erCafeDisk)) return;
  if (diskUnderMus(e)) laerred.style.cursor = "pointer";
});


// -------------------------------------------------------------
//  Shoppen: caféens møbler kan købes (js/shop-hotel-moebler.js)
// -------------------------------------------------------------
const CAFE_PRISER = { "cafe-stol": 90, "cafe-bord": 120, "cafe-sofa": 300, "cafe-disk": 400, "cafe-lampe": 110, "cafe-plante": 130, "cafe-tavle": 80 };
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  Object.assign(HOTEL_MOEBEL_PRISER, CAFE_PRISER);
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === "Café"; })) HOTEL_SHOP_KAT.push({ kategori: "Café", ikon: "☕" });
  hotelMoeblerIShop();
})(0);


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const cafeStil = document.createElement("style");
cafeStil.textContent =
  "#cafe-bestil { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 60; min-width: 250px;" +
  "  background: #fbf3e4; border: 3px solid #d9a441; border-radius: 12px; box-shadow: 0 6px 18px rgba(60,10,20,.35);" +
  "  font-family: Verdana, sans-serif; color: #4a1420; overflow: hidden; }" +
  "#cafe-bestil[hidden] { display: none !important; }" +
  "#cafe-bestil .cb-top { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px;" +
  "  background: #7a1f2e; color: #f6dfa0; font-size: 14px; }" +
  "#cafe-bestil .cb-luk { background: none; border: 0; color: #f6dfa0; font-size: 15px; cursor: pointer; }" +
  "#cafe-bestil p { margin: 10px 12px 6px; font-size: 13px; }" +
  "#cafe-bestil .cb-valg { display: flex; gap: 8px; padding: 0 12px 12px; }" +
  "#cafe-bestil .cb-valg button { flex: 1; padding: 8px 10px; font-size: 13px; cursor: pointer; border-radius: 8px;" +
  "  background: #fff8ea; color: #5e1622; border: 2px solid #d9a441; font-weight: bold; }" +
  "#cafe-bestil .cb-valg button:hover { background: #f6dfa0; }";
document.head.appendChild(cafeStil);
