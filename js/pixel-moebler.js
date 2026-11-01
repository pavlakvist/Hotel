// =============================================================
//  🛋 Hyggestue-møbler i ren pixel-stil (31/10)
//  Lænestol, sofa, kaktus og reol: ét billede pr. retning i billeder/moebler/px-*/.
//  Tegnet med /mnt/project-files/pixel-moebler/scripts (pixel.py + proever.py).
//  Hentes fra slutningen af js/panel-forklaring.js.
//
//  "centrer": true betyder, at den, der sidder, bliver flyttet, så kroppen
//  sidder midt på sin plads (midt i stolen / midt på sin egen sofahynde).
// =============================================================

const PX_TYPER = [
  { id: "px-laenestol", navn: "Sennepsgul lænestol", saede: 28, centrer: true },
  { id: "px-sofa", navn: "Rosa sofa", felter: [2, 1], saede: 26, centrer: true },
  { id: "px-kaktus", navn: "Kaktus i lerpotte" },
  { id: "px-reol", navn: "Reol med bøger" },
];
PX_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
  t.kategori = "Hyggestue";
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});

// Hvor kroppen er (vandret, i pixels) i hvert sidde-billede. Ankeret (numsen) ligger
// ikke midt i kroppen, især ikke hos drengen, så uden dette sidder de skævt.
const KROP_MIDT = {
  "billeder/figurer/pige-sidder-ned-venstre.png": 34.4,
  "billeder/figurer/pige-sidder-ned-hoejre.png": 33.6,
  "billeder/figurer/dreng-sidder-ned-venstre.png": 51.1,
  "billeder/figurer/dreng-sidder-ned-hoejre.png": 31.9,
};
(function () {
  const gammel = fodJustering;
  fodJustering = function (m, valg, retning) {
    const r = gammel(m, valg, retning);
    const t = MOEBEL_TYPER[m.type] || {};
    if (!t.centrer) return r;
    const f = FIGURER[valg.type] || FIGURER.kvinde;
    const del = f.sidder && (f.sidder[retning] || f.sidder.ned);
    const k = del && KROP_MIDT[del.fil];
    if (k === undefined || k === null) return r;
    // kroppen lige over midten af feltet (sofaens hynder ligger midt på hvert sit felt)
    return { x: -(k - del.anker[0]) * f.skala, y: r.y };
  };
})();

// Shoppen
const PX_PRISER = { "px-laenestol": 120, "px-sofa": 220, "px-kaktus": 60, "px-reol": 150 };
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  Object.assign(HOTEL_MOEBEL_PRISER, PX_PRISER);
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === "Hyggestue"; })) HOTEL_SHOP_KAT.push({ kategori: "Hyggestue", ikon: "🛋" });
  hotelMoeblerIShop();
})(0);
