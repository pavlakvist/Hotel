// =============================================================
//  🏛 Hotellets Museum (8/11-2026)
//  Et kæmpe fælles rum (30 x 24 felter) på stueetagen med fire afdelinger:
//    1. Begyndelsen          (det allerførste møbel, rum, avatar, valuta …)
//    2. Udviklingen          (billeder af hotellet før, gamle funktioner, før/efter)
//    3. Historiske øjeblikke (første event, vinder, medarbejder, milepæle, sjove øjeblikke)
//    4. Samlerobjekter       (møbler man ikke kan købe mere, rares, eventting, trofæer)
//  - Museumsskilte: hver ting kan have et skilt (lille guldplade i rummet).
//    Klik på pladen eller tingen → museumskortet med historien.
//    Ejeren kan oprette, rette, flytte og slette skiltene (✏️ / 📍 / 🗑).
//  - "🏛 Museets guide" (knap nede til venstre i museet): alle skilte sorteret i
//    afdelinger + en tidslinje. Klik "👣 Gå hen" for at gå hen til tingen.
//  - 53 museumsmøbler (kategori "Museum" 🏛) i Shoppen og møbelpanelet.
//    Billeder: billeder/moebler/mus-*/mus-*-0..3.png (3D-renderet, ét billede pr. retning).
//  Skiltene gemmes på serveren (database-34-museum.sql). Uden den gemmes de kun på
//  denne computer.
//  Hentes fra slutningen af js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================

// -------------------------------------------------------------
//  Rummet
// -------------------------------------------------------------
const MUS_ID = "museum";
const MUS_RUM = { id: MUS_ID, navn: "Hotellets Museum", ejer: EJER_NAVNE[0], bredde: 30, dybde: 24,
  vaeg: "#6e1f2c", gulv1: "#eadfca", gulv2: "#eadfca", vaegHoejde: 260, doer: null };   // vinrøde vægge og et lyst marmorgulv
INDBYGGEDE_RUM[MUS_ID] = MUS_RUM;
if (!NAV_RUM.some(function (r) { return r.id === MUS_ID; })) {
  NAV_RUM.push({ id: MUS_ID, etage: "stue", navn: "Hotellets Museum", om: "Hotellets historie i fire afdelinger 🏛",
    billede: "billeder/rum/museum.png", maks: 60, rum: "vaerelse", vaerelse: MUS_ID });
}
function iMuseet() { return rumValg === "vaerelse" && aktivtVaerelse === MUS_ID; }

// -------------------------------------------------------------
//  Møblerne (kategori "Museum")
// -------------------------------------------------------------
const MUS_KAT = "Museum";
const MUS_TYPER = [
  // montrer (glasmontre på træsokkel)
  { id: "mus-montre", navn: "Tom glasmontre", pris: 150 },
  { id: "mus-montre-stol", navn: "Montre: den første stol", pris: 250 },
  { id: "mus-montre-krone", navn: "Montre: guldkrone", pris: 300 },
  { id: "mus-montre-pokal", navn: "Montre: guldpokal", pris: 250 },
  { id: "mus-montre-glimt", navn: "Montre: Glimt og Stella", pris: 250 },
  { id: "mus-montre-figur", navn: "Montre: den første pige", pris: 250 },
  { id: "mus-montre-figur2", navn: "Montre: den første dreng", pris: 250 },
  { id: "mus-montre-computer", navn: "Montre: gammel computer", pris: 220 },
  { id: "mus-montre-noegle", navn: "Montre: den gyldne nøgle", pris: 260 },
  { id: "mus-montre-diamant", navn: "Montre: sjælden diamant", pris: 350 },
  { id: "mus-montre-and", navn: "Montre: gylden badeand", pris: 220 },
  { id: "mus-montre-medaljer", navn: "Montre: medaljer", pris: 240 },
  { id: "mus-montre-rose", navn: "Montre: gylden rose", pris: 260 },
  { id: "mus-montre-sofa", navn: "Stor montre: den første sofa", felter: [2, 1], pris: 380 },
  { id: "mus-montre-model", navn: "Stor montre: hotellet som model", felter: [2, 1], pris: 420 },
  // sokler
  { id: "mus-sokkel", navn: "Marmorsokkel", pris: 90 },
  { id: "mus-sokkel-buste", navn: "Buste på sokkel", pris: 200 },
  { id: "mus-sokkel-vase", navn: "Vinrød vase på sokkel", pris: 180 },
  { id: "mus-sokkel-statue", navn: "Guldstjerne på sokkel", pris: 220 },
  // afspærring
  { id: "mus-reb", navn: "Afspærring med rødt reb", pris: 60 },
  { id: "mus-reb-lang", navn: "Lang afspærring", felter: [2, 1], pris: 90 },
  { id: "mus-reb-stolpe", navn: "Guldstolpe", pris: 30 },
  // billeder og tavler
  { id: "mus-staffeli", navn: "Staffeli med maleri af hotellet", pris: 160 },
  { id: "mus-billede-lobby", navn: "Billede: den gamle velkomsthal", pris: 140 },
  { id: "mus-billede-rum", navn: "Billede: det første rum", pris: 140 },
  { id: "mus-billede-cafe", navn: "Billede: caféen", pris: 140 },
  { id: "mus-billede-figurer", navn: "Billede: de første figurer", pris: 140 },
  { id: "mus-billede-hotelven", navn: "Stort billede: Hotelven", felter: [2, 1], pris: 260 },
  { id: "mus-foer-efter", navn: "Før og efter-tavle", felter: [2, 1], pris: 260 },
  { id: "mus-tidslinje", navn: "Hotellets tidslinje", felter: [3, 1], pris: 320 },
  { id: "mus-fotovaeg", navn: "Fotovæg: sjove øjeblikke", felter: [2, 1], pris: 240 },
  { id: "mus-plakat", navn: "Plakat: første store event", pris: 120 },
  // skilte
  { id: "mus-afd-1", navn: "Afdelingsskilt: Begyndelsen", felter: [2, 1], pris: 150 },
  { id: "mus-afd-2", navn: "Afdelingsskilt: Udviklingen", felter: [2, 1], pris: 150 },
  { id: "mus-afd-3", navn: "Afdelingsskilt: Historiske øjeblikke", felter: [2, 1], pris: 150 },
  { id: "mus-afd-4", navn: "Afdelingsskilt: Samlerobjekter", felter: [2, 1], pris: 150 },
  { id: "mus-museumsskilt", navn: "Stort skilt: Hotellets Museum", felter: [3, 1], pris: 300 },
  { id: "mus-infoskilt", navn: "Lille messingskilt", pris: 50 },
  { id: "mus-banner", navn: "Vinrødt banner med krone", pris: 110 },
  // store møbler
  { id: "mus-skranke", navn: "Museets informationsskranke", felter: [2, 1], pris: 350 },
  { id: "mus-bogpult", navn: "Læsepult med historiebog", pris: 150 },
  { id: "mus-skillevaeg", navn: "Vinrød skillevæg", felter: [2, 1], pris: 160 },
  { id: "mus-soejle", navn: "Marmorsøjle", pris: 180 },
  { id: "mus-vitrineskab", navn: "Vitrineskab", pris: 260 },
  { id: "mus-trofaehylde", navn: "Hylde med trofæer", felter: [2, 1], pris: 340 },
  { id: "mus-mannequin", navn: "Uniform på dukke", pris: 200 },
  { id: "mus-kamera", navn: "Gammelt kamera på stativ", pris: 180 },
  // hygge
  { id: "mus-baenk", navn: "Fløjlsbænk med guldben", felter: [2, 1], saede: 30, centrer: true, pris: 220 },
  { id: "mus-lampe", navn: "Messinglampe", pris: 120 },
  { id: "mus-blomster", navn: "Lyserøde blomster i guldurne", pris: 90 },
  { id: "mus-palme", navn: "Palme i guldkrukke", pris: 140 },
  { id: "mus-taeppe", navn: "Rødt museumstæppe", felter: [2, 2], kanGaaPaa: true, pris: 120 },
  { id: "mus-loeber", navn: "Rød løber", felter: [2, 1], kanGaaPaa: true, pris: 70 },
];
// billedernes ankre (fra 3D-renderingen): bund-midte → forreste hjørne
const MUS_ANKRE = {
  "mus-afd-1": [[222,499],[126,499],[222,499],[126,499]],
  "mus-afd-2": [[222,499],[126,499],[222,499],[126,499]],
  "mus-afd-3": [[222,499],[126,499],[222,499],[126,499]],
  "mus-afd-4": [[222,499],[126,499],[222,499],[126,499]],
  "mus-baenk": [[288,275],[192,275],[288,275],[192,275]],
  "mus-banner": [[126,497],[126,497],[126,497],[126,497]],
  "mus-billede-cafe": [[126,326],[126,326],[126,326],[126,326]],
  "mus-billede-figurer": [[126,344],[126,344],[126,344],[126,344]],
  "mus-billede-hotelven": [[222,423],[126,423],[222,423],[126,423]],
  "mus-billede-lobby": [[126,326],[126,326],[126,326],[126,326]],
  "mus-billede-rum": [[126,326],[126,326],[126,326],[126,326]],
  "mus-blomster": [[126,268],[126,268],[126,268],[126,268]],
  "mus-bogpult": [[126,329],[126,329],[126,329],[126,329]],
  "mus-foer-efter": [[222,415],[126,415],[222,415],[126,415]],
  "mus-fotovaeg": [[222,423],[126,423],[222,423],[126,423]],
  "mus-infoskilt": [[126,283],[126,283],[126,283],[126,283]],
  "mus-kamera": [[126,344],[126,344],[126,344],[126,344]],
  "mus-lampe": [[126,398],[126,398],[126,398],[126,398]],
  "mus-loeber": [[228,182],[132,182],[228,182],[132,182]],
  "mus-mannequin": [[126,398],[126,398],[126,398],[126,398]],
  "mus-montre": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-and": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-computer": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-diamant": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-figur": [[126,373],[126,373],[126,373],[126,373]],
  "mus-montre-figur2": [[126,373],[126,373],[126,373],[126,373]],
  "mus-montre-glimt": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-krone": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-medaljer": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-model": [[222,412],[126,412],[222,412],[126,412]],
  "mus-montre-noegle": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-pokal": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-rose": [[126,353],[126,353],[126,353],[126,353]],
  "mus-montre-sofa": [[222,401],[126,401],[222,401],[126,401]],
  "mus-montre-stol": [[126,353],[126,353],[126,353],[126,353]],
  "mus-museumsskilt": [[318,585],[126,585],[318,585],[126,585]],
  "mus-palme": [[186,481],[186,481],[186,481],[186,481]],
  "mus-plakat": [[126,360],[126,360],[126,360],[126,360]],
  "mus-reb": [[126,283],[126,283],[126,283],[126,283]],
  "mus-reb-lang": [[222,331],[126,331],[222,331],[126,331]],
  "mus-reb-stolpe": [[126,283],[126,283],[126,283],[126,283]],
  "mus-skillevaeg": [[222,461],[126,461],[222,461],[126,461]],
  "mus-skranke": [[222,408],[126,408],[222,408],[126,408]],
  "mus-soejle": [[126,474],[126,474],[126,474],[126,474]],
  "mus-sokkel": [[126,283],[126,283],[126,283],[126,283]],
  "mus-sokkel-buste": [[126,346],[126,346],[126,346],[126,346]],
  "mus-sokkel-statue": [[126,353],[126,353],[126,353],[126,353]],
  "mus-sokkel-vase": [[126,346],[126,346],[126,346],[126,346]],
  "mus-staffeli": [[126,375],[126,375],[126,375],[126,375]],
  "mus-taeppe": [[220,226],[220,226],[220,226],[220,226]],
  "mus-tidslinje": [[318,463],[126,463],[318,463],[126,463]],
  "mus-trofaehylde": [[222,438],[126,438],[222,438],[126,438]],
  "mus-vitrineskab": [[126,436],[126,436],[126,436],[126,436]],
};
MUS_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png?r=1"; });
  t.kategori = MUS_KAT;
  t.skala = 0.5;
  if (MUS_ANKRE[t.id]) t.ankre = MUS_ANKRE[t.id];
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});
// i Shoppen (🏛 Museum) med egne priser
(function iShoppen(forsoeg) {
  if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") {
    if (forsoeg < 60) setTimeout(function () { iShoppen(forsoeg + 1); }, 500);
    return;
  }
  MUS_TYPER.forEach(function (t) { HOTEL_MOEBEL_PRISER[t.id] = t.pris; });
  if (!HOTEL_SHOP_KAT.some(function (k) { return k.kategori === MUS_KAT; })) HOTEL_SHOP_KAT.push({ kategori: MUS_KAT, ikon: "🏛" });
  hotelMoeblerIShop();
})(0);
// fanen "Museum" i møbelpanelet (bruges af ejeren og Bygmestre til at indrette museet)
(function () {
  if (typeof faneBoks === "undefined" || typeof knapBoks === "undefined") return;
  if (KATEGORIER.indexOf(MUS_KAT) >= 0) return;
  KATEGORIER.push(MUS_KAT);
  const fane = document.createElement("button");
  fane.textContent = MUS_KAT;
  fane.addEventListener("click", function () { visKategori(MUS_KAT); });
  faneBoks.appendChild(fane);
  MUS_TYPER.forEach(function (t) {
    const type = MOEBEL_TYPER[t.id];
    const knap = document.createElement("button");
    knap.className = "moebel-knap";
    knap.dataset.id = type.id;
    knap.dataset.kategori = MUS_KAT;
    knap.hidden = valgtKategori !== MUS_KAT;
    const ikon = document.createElement("canvas");
    ikon.width = 64; ikon.height = 70;
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
  if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 800);
})();

// -------------------------------------------------------------
//  Museets egen opstilling (ejeren og Bygmestre kan flytte rundt på det hele)
//  Retning 0 vender ned mod venstre (mod os), 1 vender ned mod højre.
// -------------------------------------------------------------
function muM(type, x, y, retning) { return { type: type, x: x, y: y, retning: retning || 0 }; }
const MUS_MOEBLER = [
  // --- de røde tæpper: hovedgangen (y 11-12) og gangen på tværs (x 14-15) ---
  muM("mus-taeppe", 2, 11), muM("mus-taeppe", 4, 11), muM("mus-taeppe", 6, 11), muM("mus-taeppe", 8, 11), muM("mus-taeppe", 10, 11),
  muM("mus-taeppe", 12, 11), muM("mus-taeppe", 14, 11), muM("mus-taeppe", 16, 11), muM("mus-taeppe", 18, 11), muM("mus-taeppe", 20, 11),
  muM("mus-taeppe", 22, 11), muM("mus-taeppe", 24, 11), muM("mus-taeppe", 26, 11), muM("mus-taeppe", 28, 11),
  muM("mus-taeppe", 14, 1), muM("mus-taeppe", 14, 3), muM("mus-taeppe", 14, 5), muM("mus-taeppe", 14, 7), muM("mus-taeppe", 14, 9),
  muM("mus-taeppe", 14, 13), muM("mus-taeppe", 14, 15), muM("mus-taeppe", 14, 17), muM("mus-taeppe", 14, 19), muM("mus-taeppe", 14, 21),
  // midten: søjler rundt om krydset + det store skilt for enden af gangen
  muM("mus-soejle", 13, 10), muM("mus-soejle", 16, 10), muM("mus-soejle", 13, 13), muM("mus-soejle", 16, 13),
  muM("mus-museumsskilt", 13, 0),

  // --- AFDELING 1: Begyndelsen (bagerst til venstre) ---
  muM("mus-palme", 0, 0), muM("mus-banner", 1, 0), muM("mus-vitrineskab", 2, 0), muM("mus-lampe", 3, 0),
  muM("mus-billede-figurer", 4, 0), muM("mus-blomster", 5, 0), muM("mus-staffeli", 6, 0), muM("mus-lampe", 7, 0),
  muM("mus-vitrineskab", 8, 0), muM("mus-banner", 9, 0), muM("mus-billede-rum", 10, 0), muM("mus-blomster", 11, 0), muM("mus-palme", 12, 0),
  // det allerførste møbel, med rødt reb hele vejen rundt
  muM("mus-montre-stol", 4, 3), muM("mus-reb", 4, 2), muM("mus-reb", 4, 4), muM("mus-reb", 3, 3, 1), muM("mus-reb", 5, 3, 1),
  muM("mus-reb-stolpe", 3, 2), muM("mus-reb-stolpe", 5, 2), muM("mus-reb-stolpe", 3, 4), muM("mus-reb-stolpe", 5, 4),
  muM("mus-montre-figur", 7, 3), muM("mus-montre-figur2", 8, 3), muM("mus-montre-glimt", 11, 3),
  muM("mus-skranke", 3, 6), muM("mus-montre-sofa", 6, 7), muM("mus-montre-model", 9, 7), muM("mus-bogpult", 12, 7),
  muM("mus-afd-1", 3, 9), muM("mus-baenk", 7, 10), muM("mus-infoskilt", 12, 3),

  // --- AFDELING 2: Udviklingen (bagerst til højre) ---
  muM("mus-blomster", 16, 0), muM("mus-tidslinje", 17, 0), muM("mus-lampe", 20, 0), muM("mus-billede-hotelven", 21, 0),
  muM("mus-palme", 23, 0), muM("mus-foer-efter", 24, 0), muM("mus-lampe", 26, 0), muM("mus-billede-lobby", 27, 0),
  muM("mus-billede-cafe", 28, 0), muM("mus-palme", 29, 0),
  muM("mus-montre-computer", 18, 3), muM("mus-kamera", 21, 3), muM("mus-sokkel-vase", 24, 3), muM("mus-staffeli", 27, 3),
  // nye møbler gennem tiden: hotellets egne møbler på række bag et reb
  muM("px-laenestol", 17, 6), muM("cafe-stol", 19, 6), muM("real-laenestol", 21, 6), muM("spil-arkade", 23, 6),
  muM("laese-globus", 25, 6), muM("mus-sokkel-buste", 27, 6),
  muM("mus-reb-lang", 17, 7), muM("mus-reb-lang", 19, 7), muM("mus-reb-lang", 21, 7), muM("mus-reb-lang", 23, 7),
  muM("mus-reb-lang", 25, 7), muM("mus-reb-lang", 27, 7),
  muM("mus-afd-2", 26, 9), muM("mus-baenk", 19, 10), muM("mus-baenk", 22, 10),

  // --- AFDELING 3: Historiske øjeblikke (forrest til venstre) ---
  muM("mus-afd-3", 2, 13),
  muM("mus-palme", 0, 14), muM("mus-fotovaeg", 0, 15, 1), muM("mus-lampe", 0, 17, 1), muM("mus-plakat", 0, 18, 1),
  muM("mus-mannequin", 0, 19, 1), muM("mus-lampe", 0, 20, 1), muM("mus-banner", 0, 21, 1), muM("mus-blomster", 0, 22, 1), muM("mus-palme", 0, 23),
  muM("mus-montre-pokal", 4, 16), muM("mus-sokkel-statue", 7, 16), muM("mus-montre-and", 10, 16),
  muM("mus-montre-medaljer", 4, 20), muM("mus-sokkel-buste", 7, 20), muM("mus-kamera", 10, 20),
  muM("mus-baenk", 5, 23), muM("mus-blomster", 12, 23),

  // --- AFDELING 4: Samlerobjekter (forrest til højre) ---
  muM("mus-afd-4", 18, 13), muM("mus-palme", 29, 14),
  muM("mus-montre-krone", 18, 16), muM("mus-montre-rose", 21, 16), muM("mus-montre-noegle", 24, 16), muM("mus-montre-diamant", 27, 16),
  muM("mus-reb-lang", 17, 17), muM("mus-reb-lang", 20, 17), muM("mus-reb-lang", 23, 17), muM("mus-reb-lang", 26, 17),
  muM("mus-sokkel-vase", 18, 20), muM("mus-trofaehylde", 20, 20), muM("mus-montre-pokal", 23, 20),
  muM("mus-trofaehylde", 25, 20), muM("mus-vitrineskab", 28, 20),
  muM("mus-baenk", 21, 23), muM("mus-blomster", 17, 23), muM("mus-palme", 29, 23),
];
function museumSomData() {
  return MUS_MOEBLER.map(function (x) { return { type: x.type, x: x.x, y: x.y, spejlet: false, retning: x.retning }; });
}

// Møblerne: det, der er gemt på denne computer, ellers museets egne
const vaerelseMoeblerFoerMuseum = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === MUS_ID && !andreVaerelser[id]) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + id) || "null"); } catch (e) {}
    andreVaerelser[id] = (Array.isArray(gemt) && gemt.length ? gemt : museumSomData())
      .map(function (x) { return Object.assign({}, x); }).filter(function (x) { return MOEBEL_TYPER[x.type]; });
  }
  return vaerelseMoeblerFoerMuseum(id);
};
// Har ingen bygget noget i museet endnu, ser alle museets egne møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerMuseum = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerMuseum(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar[MUS_ID]) && svar[MUS_ID].length)) svar[MUS_ID] = museumSomData();
    return svar;
  };
}

// Velkomst
const skiftRumFoerMuseum = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerMuseum(navn);
  if (iMuseet()) {
    besked.textContent = "Velkommen i Hotellets Museum 🏛 Klik på de små guldskilte for at læse historien, eller tryk på 🏛 Museets guide.";
    musHentSkilte();
  }
  musVisKnap();
};


// -------------------------------------------------------------
//  Museumsskiltene
//  { id, x, y, afd (1-4), nr, titel, dato, tekst }
//  x, y = feltet med tingen (for store ting: tingens første felt)
// -------------------------------------------------------------
const MUS_AFDELINGER = [
  { nr: 1, navn: "Begyndelsen", ikon: "📖" },
  { nr: 2, navn: "Udviklingen", ikon: "📈" },
  { nr: 3, navn: "Historiske øjeblikke", ikon: "⭐" },
  { nr: 4, navn: "Samlerobjekter", ikon: "💎" },
];
function musSk(id, x, y, afd, nr, titel, dato, tekst) { return { id: id, x: x, y: y, afd: afd, nr: nr, titel: titel, dato: dato, tekst: tekst }; }
const MUS_SKILTE_STANDARD = [
  // Afdeling 1
  musSk("s1", 4, 3, 1, "Møbel nr. 001", "Det allerførste møbel", "2026-10-22",
    "Den allerførste stol i hotellet. Den blev lavet samme dag, som hotellet blev født, dengang det hed Hotelven."),
  musSk("s2", 10, 0, 1, "Rum nr. 001", "Det første rum på hotellet", "2026-10-22",
    "Det allerførste værelse: et lille rum på 10 x 10 felter med en figur, der kunne gå rundt og sætte sig."),
  musSk("s3", 7, 3, 1, "Avatar nr. 001", "Den første avatar", "2026-10-22",
    "Hotellets allerførste pige. Hun kunne gå i 8 retninger og sætte sig ned."),
  musSk("s4", 8, 3, 1, "Avatar nr. 002", "Den første dreng", "2026-10-22",
    "Den første dreng i sin vinrøde hotelvest. Han kom samme dag som pigen."),
  musSk("s5", 6, 7, 1, "Salg nr. 001", "Det første møbel der blev solgt", "2026-10-23",
    "Shoppen åbnede, og man kunne købe møbler for sine Glimt. (Ejeren kan rette skiltet og skrive, hvilket møbel det var.)"),
  musSk("s6", 11, 3, 1, "Valuta nr. 001", "Den første valuta", "2026-10-23",
    "Glimt ⭐ var hotellets allerførste penge. Samme dag kom den sjældne Stella 🔮."),
  musSk("s7", 12, 7, 1, "Gæst nr. 001", "Den første spiller med en konto", "2026-10-24",
    "Pall, hotellets ejer, var den første med en rigtig profil, da hotellet kom online."),
  musSk("s8", 9, 7, 1, "Version 1.0", "Hotellets første version", "2026-10-22",
    "Sådan begyndte det hele: almindelig HTML, CSS og JavaScript og en stor drøm om sit eget hotel."),
  // Afdeling 2
  musSk("s9", 21, 0, 2, "Billede nr. 001", "Da hotellet hed Hotelven", "2026-10-22",
    "Den gamle forside. Hotellet hed først KUBLO, så Hotelven og fra 24. oktober HELLO VERA."),
  musSk("s10", 27, 0, 2, "Lobby, version 1", "Den gamle velkomsthal", "2026-10-23",
    "Den første velkomsthal med ur, sofaer og computer-gæsterne Ida, Noah, Freja og Oliver."),
  musSk("s11", 24, 0, 2, "Før og efter", "Før og efter", "2026-10-24",
    "Til venstre: det gamle Hotelven. Til højre: HELLO VERA, som det ser ud i dag."),
  musSk("s12", 18, 3, 2, "Gammel funktion", "Da alt lå på én computer", "2026-10-24",
    "I starten var alt kun gemt på én computer. Den 24. oktober kom serveren, så spillere kunne se hinanden og chatte."),
  musSk("s13", 21, 6, 2, "Møbler gennem tiden", "Nye møbler gennem tiden", "2026-11-04",
    "Fra pixel-møbler til café- og spillemøbler og til sidst rigtige 3D-møbler. Her står de på række."),
  musSk("s14", 17, 0, 2, "Tidslinje", "Hotellets tidslinje", "2026-11-08",
    "Fra den første stol til i dag. Se hele tidslinjen i 🏛 Museets guide."),
  // Afdeling 3
  musSk("s15", 0, 18, 3, "Event nr. 001", "Det første store event", "",
    "Skriv her, hvad det første store event var, og hvem der var med."),
  musSk("s16", 4, 16, 3, "Vinder nr. 001", "Den første konkurrencevinder", "",
    "Skriv vinderens navn og hvad konkurrencen gik ud på."),
  musSk("s17", 0, 19, 3, "Ansat nr. 001", "Den første medarbejder", "",
    "Uniformen fra hotellets første ansatte. Skriv navnet på den første medarbejder her."),
  musSk("s18", 7, 16, 3, "Milepæl", "Hotellet kom online", "2026-10-24",
    "Den dag hotellet kom på nettet, og rigtige spillere kunne mødes i velkomsthallen."),
  musSk("s19", 0, 15, 3, "Sjove øjeblikke", "Sjove øjeblikke fra hotellets historie", "",
    "Fotos fra caféen, biografen, tagterrassen og de første events."),
  musSk("s20", 10, 16, 3, "Fundet", "Den gyldne badeand", "",
    "Ingen ved helt, hvordan den kom hertil … 🦆"),
  // Afdeling 4
  musSk("s21", 18, 16, 4, "Kan ikke købes mere", "Møbler der ikke længere kan købes", "",
    "Den gyldne krone var med i den første shop. Nu kan den kun ses her."),
  musSk("s22", 21, 16, 4, "Første udgave", "Første udgave af særlige møbler", "",
    "Den gyldne rose: den allerførste udgave af et særligt møbel."),
  musSk("s23", 24, 16, 4, "Begrænset", "Den gyldne nøgle", "2026-10-24",
    "Nøglen til den hemmelige etage. Den kunne kun vindes til events."),
  musSk("s24", 27, 16, 4, "Rare", "Sjælden diamant", "",
    "Et af hotellets sjældneste samlerobjekter 💎"),
  musSk("s25", 20, 20, 4, "Trofæer", "Særlige trofæer og præmier", "",
    "Pokaler og præmier fra hotellets konkurrencer."),
];

let MUS_SKILTE = MUS_SKILTE_STANDARD.map(function (s) { return Object.assign({}, s); });
let musPaaServer = false;          // findes database-34 på serveren?
const MUS_LOKAL = "mit-hotel-museum-skilte";
try {
  const lokal = JSON.parse(localStorage.getItem(MUS_LOKAL) || "null");
  if (Array.isArray(lokal)) MUS_SKILTE = lokal;
} catch (e) {}

function musErEjer() {
  return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0;
}
async function musHentSkilte() {
  if (typeof serverKald !== "function") return;
  try {
    const svar = await serverKald("hv_museum_hent", {});
    musPaaServer = true;
    if (Array.isArray(svar)) { MUS_SKILTE = svar; musTegnGuide(); }
  } catch (e) { /* database-34 ikke kørt endnu: brug skiltene på denne computer */ }
}
async function musGemSkilte() {
  try { localStorage.setItem(MUS_LOKAL, JSON.stringify(MUS_SKILTE)); } catch (e) {}
  musTegnGuide();
  if (typeof serverKald !== "function" || typeof mitToken !== "function" || !mitToken()) return;
  try {
    await serverKald("hv_museum_gem", { p_token: mitToken(), p_skilte: MUS_SKILTE });
    musPaaServer = true;
  } catch (e) {
    besked.textContent = "⚠️ Skiltet er kun gemt på denne computer. Kør database-34-museum.sql i Supabase, så alle kan se det. (" + e.message + ")";
  }
}
musHentSkilte();
setInterval(function () { if (iMuseet() && !musRetter) musHentSkilte(); }, 10000);

function musSkiltPaa(x, y) {
  return MUS_SKILTE.find(function (s) { return s.x === x && s.y === y; }) || null;
}
// det møbel, skiltet hører til (står på feltet)
function musMoebelFor(s) {
  return moeblerIRummet.find(function (m) {
    const t = MOEBEL_TYPER[m.type];
    if (!t || t.kanGaaPaa) return false;
    const f = moebelFelter(t, drejetTvaers(m));
    return s.x >= m.x && s.x < m.x + f[0] && s.y >= m.y && s.y < m.y + f[1];
  }) || null;
}
function musDato(d) {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  const mdr = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
  return (+m[3]) + ". " + mdr[+m[2] - 1] + " " + m[1];
}
function musEsc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }


// -------------------------------------------------------------
//  Guldpladerne i rummet (tegnes sammen med møblerne)
// -------------------------------------------------------------
let MUS_PLADER = [];   // { s, x, y, b, h } i tegne-koordinater (til klik)
function musPladeSted(s) {
  const m = musMoebelFor(s);
  if (m) {
    const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
    const p = punkt(m.x + f[0] / 2 + 0.5, m.y + f[1] / 2 + 0.5);   // lidt foran tingens midte
    return { x: p.x, y: p.y - 4, dybde: moebelDybde(m) + 0.2 };
  }
  const p = punkt(s.x + 0.5, s.y + 0.9);
  return { x: p.x, y: p.y - 4, dybde: s.x + s.y + 0.2 };
}
function musTegnPlade(c, s, sted) {
  const tekst = s.titel.length > 26 ? s.titel.slice(0, 25) + "…" : s.titel;
  c.save();
  c.font = "bold 10px Georgia, serif";
  const b = Math.max(70, Math.ceil(c.measureText(tekst).width) + 18), h = 24;
  const x = Math.round(sted.x - b / 2), y = Math.round(sted.y - h);
  // lille skygge + guldkant + creme plade
  c.fillStyle = "rgba(40, 10, 10, 0.35)"; c.fillRect(x + 2, y + 3, b, h);
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#f6d77a"); g.addColorStop(0.5, "#c9962f"); g.addColorStop(1, "#8a6014");
  c.fillStyle = g; c.fillRect(x, y, b, h);
  c.fillStyle = "#fbf3df"; c.fillRect(x + 2, y + 2, b - 4, h - 4);
  c.strokeStyle = "#7a1f2b"; c.lineWidth = 1; c.strokeRect(x + 3.5, y + 3.5, b - 7, h - 7);
  c.fillStyle = "#6e1f2c"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = "8px Georgia, serif"; c.fillText((s.nr || "").slice(0, 24), sted.x, y + 8.5);
  c.font = "bold 9px Georgia, serif"; c.fillText(tekst, sted.x, y + 16.5);
  c.restore();
  MUS_PLADER.push({ s: s, x: x, y: y, b: b, h: h });
}
function musPladeTing(ting) {
  MUS_PLADER = [];
  if (!iMuseet()) return;
  MUS_SKILTE.forEach(function (s) {
    if (!erIRummet(s.x, s.y)) return;
    const sted = musPladeSted(s);
    ting.push({ dybde: sted.dybde, tegn: function () { musTegnPlade(ctx, s, sted); } });
  });
  // ejeren ser, hvor et nyt skilt kommer til at stå
  if (musPlacerer && musSkiltFelt && erIRummet(musSkiltFelt.x, musSkiltFelt.y)) {
    const f = musSkiltFelt, p = punkt(f.x + 0.5, f.y + 0.5);
    ting.push({ dybde: 999, tegn: function () {
      ctx.save(); ctx.globalAlpha = 0.85; ctx.font = "22px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("🏷", p.x, p.y); ctx.restore();
    } });
  }
}
(function hægtPaa(forsoeg) {
  if (typeof andreSpillereTing !== "function") {
    if (forsoeg < 40) { setTimeout(function () { hægtPaa(forsoeg + 1); }, 250); return; }
    window.andreSpillereTing = function () {};
  }
  const foer = andreSpillereTing;
  andreSpillereTing = function (ting) {
    foer(ting);
    musPladeTing(ting);
  };
})(0);


// -------------------------------------------------------------
//  Klik: på en plade eller en ting med skilt → museumskortet
// -------------------------------------------------------------
let musPlacerer = null;   // { skilt } når ejeren vælger, hvor et skilt skal stå
let musRetter = false;
function musSkaerm(e) {
  const r = laerred.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
}
// tingen under musen (billedets område, som i js/hjoerner.js)
function musTingUnderMus(e) {
  const sp = musSkaerm(e);
  let fundet = null;
  moeblerIRummet.forEach(function (x) {
    const t = MOEBEL_TYPER[x.type];
    if (!t || t.kanGaaPaa || !t.retninger) return;
    const b = hentBillede(t.retninger[x.retning || 0]);
    if (!billedeKlar(b)) return;
    const sk = t.skala || 1;
    const sted = moebelSted(t, x.x, x.y, drejetTvaers(x));
    const bw = b.naturalWidth * sk, bh = b.naturalHeight * sk;
    const venstre = sted.x - bw / 2, top = sted.y + FLISE_H / 2 - bh;
    const inde = sp.x >= venstre + bw * 0.2 && sp.x <= venstre + bw * 0.8 && sp.y >= top + bh * 0.1 && sp.y <= top + bh;
    if (inde && (!fundet || moebelDybde(x) > moebelDybde(fundet))) fundet = x;
  });
  return fundet;
}
function musSkiltForMoebel(m) {
  const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
  for (let i = 0; i < f[0]; i++) for (let j = 0; j < f[1]; j++) {
    const s = musSkiltPaa(m.x + i, m.y + j);
    if (s) return s;
  }
  return null;
}
let musSkiltFelt = null;
laerred.addEventListener("mousemove", function (e) {
  if (!iMuseet() || !musPlacerer) return;
  musSkiltFelt = musTilFelt(e);
});
laerred.addEventListener("click", function (e) {
  if (!iMuseet()) return;
  if (musPlacerer) {
    e.stopImmediatePropagation(); e.preventDefault();
    const ting = musTingUnderMus(e);
    const f = ting ? { x: ting.x, y: ting.y } : musTilFelt(e);
    if (!erIRummet(f.x, f.y)) { besked.textContent = "Klik på en ting inde i museet."; return; }
    const andet = musSkiltPaa(f.x, f.y);
    if (andet && andet !== musPlacerer.skilt) { besked.textContent = "Der står allerede et skilt ved den ting (" + andet.titel + ")."; return; }
    const s = musPlacerer.skilt;
    s.x = f.x; s.y = f.y;
    const ny = musPlacerer.ny;
    musPlacerer = null; musSkiltFelt = null;
    laerred.style.cursor = "";
    if (ny) musAabnForm(s, true);
    else { musGemSkilte(); besked.textContent = "📍 Skiltet er flyttet."; musVisKort(s); }
    return;
  }
  if ((typeof valgtType !== "undefined" && valgtType) || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const sp = musSkaerm(e);
  let s = null;
  for (let i = MUS_PLADER.length - 1; i >= 0; i--) {
    const p = MUS_PLADER[i];
    if (sp.x >= p.x && sp.x <= p.x + p.b && sp.y >= p.y && sp.y <= p.y + p.h) { s = p.s; break; }
  }
  if (!s) {
    const ting = musTingUnderMus(e);
    if (ting) s = musSkiltForMoebel(ting);
  }
  if (!s) return;
  musVisKort(s);
  // klik på selve pladen: ikke gå/vælge møblet bagved
  if (MUS_PLADER.some(function (p) { return p.s === s && sp.x >= p.x && sp.x <= p.x + p.b && sp.y >= p.y && sp.y <= p.y + p.h; })) {
    e.stopImmediatePropagation(); e.preventDefault();
  }
}, true);


// -------------------------------------------------------------
//  HTML: kortet, formen, guiden og knappen
// -------------------------------------------------------------
(function () {
  const css = document.createElement("style");
  css.textContent = `
  .mus-boks { position: fixed; z-index: 60; background: #fbf3df; color: #3a1a12; border: 3px solid #c9962f;
    box-shadow: 0 0 0 2px #6e1f2c, 0 10px 30px rgba(0,0,0,.45); border-radius: 10px; font-family: Georgia, serif; }
  .mus-boks[hidden] { display: none !important; }
  .mus-top { background: linear-gradient(#8a2a38, #5e1724); color: #f6d77a; padding: 8px 12px; border-radius: 6px 6px 0 0;
    display: flex; align-items: center; gap: 8px; cursor: move; font-weight: bold; letter-spacing: .5px; }
  .mus-top .mus-luk { margin-left: auto; background: none; border: 1px solid #c9962f; color: #f6d77a; border-radius: 6px; cursor: pointer; padding: 1px 8px; font-size: 14px; }
  .mus-knap { background: linear-gradient(#f6d77a, #c9962f); border: 1px solid #8a6014; color: #4a1018; border-radius: 7px;
    padding: 5px 10px; cursor: pointer; font-family: Georgia, serif; font-weight: bold; font-size: 13px; }
  .mus-knap:hover { filter: brightness(1.08); }
  .mus-knap.roed { background: linear-gradient(#b8424f, #7a1f2b); color: #fbf3df; border-color: #4a1018; }
  #mus-kort { left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(380px, calc(100vw - 32px)); }
  #mus-kort .mus-indhold { padding: 12px 16px 14px; }
  #mus-kort .mus-nr { color: #8a6014; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  #mus-kort h3 { margin: 2px 0 8px; color: #6e1f2c; font-size: 20px; }
  #mus-kort .mus-linje { font-size: 13px; margin: 2px 0; }
  #mus-kort .mus-linje b { color: #6e1f2c; }
  #mus-kort .mus-historie { margin-top: 8px; padding: 8px 10px; background: #f3e6c4; border-left: 3px solid #c9962f; border-radius: 4px; font-size: 14px; line-height: 1.4; white-space: pre-wrap; }
  #mus-kort .mus-knapper { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
  #mus-form { left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(400px, calc(100vw - 32px)); }
  #mus-form .mus-indhold { padding: 12px 16px 14px; display: grid; gap: 8px; }
  #mus-form label { font-size: 12px; color: #6e1f2c; font-weight: bold; display: grid; gap: 3px; }
  #mus-form input, #mus-form select, #mus-form textarea { font-family: Georgia, serif; font-size: 14px; padding: 5px 7px;
    border: 1px solid #c9962f; border-radius: 6px; background: #fffaf0; color: #3a1a12; }
  #mus-form textarea { min-height: 90px; resize: vertical; }
  #mus-guide { left: 16px; top: 120px; width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 200px); display: flex; flex-direction: column; }
  #mus-guide .mus-krop { display: flex; min-height: 0; flex: 1; }
  #mus-guide .mus-faner { width: 160px; flex: none; padding: 10px 8px; display: flex; flex-direction: column; gap: 6px; background: #6e1f2c; border-radius: 0 0 0 7px; }
  #mus-guide .mus-fane { text-align: left; background: #8a2a38; color: #fbf3df; border: 1px solid #c9962f; border-radius: 7px; padding: 7px 8px; cursor: pointer; font-family: Georgia, serif; font-size: 13px; }
  #mus-guide .mus-fane.valgt { background: linear-gradient(#f6d77a, #c9962f); color: #4a1018; font-weight: bold; }
  #mus-guide .mus-liste { flex: 1; overflow-y: auto; padding: 10px 12px; display: grid; gap: 8px; align-content: start; }
  #mus-guide .mus-post { background: #fffaf0; border: 1px solid #e0c78a; border-left: 4px solid #c9962f; border-radius: 6px; padding: 7px 9px; }
  #mus-guide .mus-post .mus-nr { color: #8a6014; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  #mus-guide .mus-post b { color: #6e1f2c; font-size: 15px; }
  #mus-guide .mus-post p { margin: 4px 0 6px; font-size: 13px; line-height: 1.35; }
  #mus-guide .mus-post .mus-knapper { display: flex; gap: 5px; flex-wrap: wrap; }
  #mus-guide .mus-post .mus-knap { padding: 3px 8px; font-size: 12px; }
  #mus-guide .mus-tom { color: #7a5a40; font-style: italic; font-size: 13px; }
  #mus-guide .mus-tid { border-left: 3px solid #c9962f; margin-left: 8px; padding-left: 14px; display: grid; gap: 8px; }
  #mus-guide .mus-tid .mus-post { position: relative; }
  #mus-guide .mus-tid .mus-post::before { content: "★"; position: absolute; left: -24px; top: 6px; color: #c9962f; background: #fbf3df; font-size: 14px; }
  #mus-knap { position: fixed; left: 16px; bottom: 84px; z-index: 30; font-size: 14px; padding: 8px 12px; box-shadow: 0 0 0 2px #6e1f2c, 0 4px 12px rgba(0,0,0,.35); }
  #mus-knap[hidden] { display: none !important; }
  @media (max-width: 600px) {
    #mus-guide { left: 16px; top: 80px; }
    #mus-guide .mus-krop { flex-direction: column; }
    #mus-guide .mus-faner { width: auto; flex-direction: row; flex-wrap: wrap; border-radius: 0; }
  }`;
  document.head.appendChild(css);

  const html = document.createElement("div");
  html.innerHTML = `
  <button id="mus-knap" class="mus-knap" hidden>🏛 Museets guide</button>
  <div id="mus-kort" class="mus-boks" hidden>
    <div class="mus-top"><span>🏛 Museumsskilt</span><button class="mus-luk" data-luk="mus-kort">✕</button></div>
    <div class="mus-indhold"></div>
  </div>
  <div id="mus-form" class="mus-boks" hidden>
    <div class="mus-top"><span id="mus-form-titel">✏️ Ret skiltet</span><button class="mus-luk" data-luk="mus-form">✕</button></div>
    <div class="mus-indhold">
      <label>Afdeling <select id="mus-f-afd"></select></label>
      <label>Lille linje øverst (fx "Møbel nr. 001") <input id="mus-f-nr" maxlength="40"></label>
      <label>Titel <input id="mus-f-titel" maxlength="60"></label>
      <label>Dato (kan være tom) <input id="mus-f-dato" type="date"></label>
      <label>Historien <textarea id="mus-f-tekst" maxlength="1000"></textarea></label>
      <div style="display:flex; gap:6px; flex-wrap:wrap">
        <button class="mus-knap" id="mus-f-gem">💾 Gem skiltet</button>
        <button class="mus-knap roed" id="mus-f-annuller">Annuller</button>
      </div>
    </div>
  </div>
  <div id="mus-guide" class="mus-boks" hidden>
    <div class="mus-top"><span>🏛 Museets guide</span><button class="mus-luk" data-luk="mus-guide">✕</button></div>
    <div class="mus-krop"><div class="mus-faner"></div><div class="mus-liste"></div></div>
  </div>`;
  while (html.firstElementChild) document.body.appendChild(html.firstElementChild);

  document.querySelectorAll("[data-luk]").forEach(function (k) {
    k.addEventListener("click", function () {
      document.getElementById(k.dataset.luk).hidden = true;
      if (k.dataset.luk === "mus-form") musRetter = false;
    });
  });
  document.getElementById("mus-knap").addEventListener("click", function () {
    const g = document.getElementById("mus-guide");
    g.hidden = !g.hidden;
    if (!g.hidden) musTegnGuide();
  });
  const afd = document.getElementById("mus-f-afd");
  MUS_AFDELINGER.forEach(function (a) { const o = document.createElement("option"); o.value = a.nr; o.textContent = a.ikon + " " + a.nr + ". " + a.navn; afd.appendChild(o); });
  document.getElementById("mus-f-annuller").addEventListener("click", function () { document.getElementById("mus-form").hidden = true; musRetter = false; });
  document.getElementById("mus-f-gem").addEventListener("click", musGemForm);
  if (typeof goerFlytbar === "function") {
    ["mus-kort", "mus-form", "mus-guide"].forEach(function (id) {
      const v = document.getElementById(id);
      try { goerFlytbar(v, v.querySelector(".mus-top")); } catch (e) {}
    });
  }
})();

function musVisKnap() {
  const k = document.getElementById("mus-knap");
  if (!k) return;
  k.hidden = !iMuseet();
  if (!iMuseet()) ["mus-kort", "mus-form", "mus-guide"].forEach(function (id) { const v = document.getElementById(id); if (v) v.hidden = true; });
}
setInterval(musVisKnap, 1000);
musVisKnap();

// gå hen foran tingen
function musGaaHen(s) {
  const m = musMoebelFor(s);
  const pladser = [];
  if (m) {
    const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
    for (let i = 0; i < f[0]; i++) pladser.push({ x: m.x + i, y: m.y + f[1] });
    for (let j = 0; j < f[1]; j++) pladser.push({ x: m.x + f[0], y: m.y + j });
    for (let i = 0; i < f[0]; i++) pladser.push({ x: m.x + i, y: m.y - 1 });
    for (let j = 0; j < f[1]; j++) pladser.push({ x: m.x - 1, y: m.y + j });
  } else {
    pladser.push({ x: s.x, y: s.y }, { x: s.x, y: s.y + 1 }, { x: s.x + 1, y: s.y });
  }
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  // står tingen bag et reb, går man så tæt på som muligt
  const cx = m ? m.x : s.x, cy = m ? m.y : s.y;
  for (let d = 2; d <= 4; d++) {
    const ring = [];
    for (let dx = -d; dx <= d; dx++) for (let dy = -d; dy <= d; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === d) ring.push({ x: cx + dx, y: cy + dy, f: dx + dy });
    }
    ring.sort(function (a, b) { return b.f - a.f; });   // helst foran tingen
    ring.forEach(function (p) { pladser.push(p); });
  }
  for (const p of pladser) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0 || (figurFelt().x === p.x && figurFelt().y === p.y)) return true;
  }
  besked.textContent = "Du kan ikke komme helt derhen. Der står noget i vejen.";
  return false;
}

function musVisKort(s) {
  const kort = document.getElementById("mus-kort");
  const a = MUS_AFDELINGER.find(function (x) { return x.nr === +s.afd; }) || MUS_AFDELINGER[0];
  const ejer = musErEjer();
  kort.querySelector(".mus-indhold").innerHTML =
    '<div class="mus-nr">' + musEsc(s.nr) + '</div>' +
    '<h3>' + musEsc(s.titel) + '</h3>' +
    '<div class="mus-linje"><b>Afdeling:</b> ' + a.ikon + " " + musEsc(a.navn) + '</div>' +
    (s.dato ? '<div class="mus-linje"><b>Dato:</b> ' + musEsc(musDato(s.dato)) + '</div>' : "") +
    (s.tekst ? '<div class="mus-historie">' + musEsc(s.tekst) + '</div>' : "") +
    '<div class="mus-knapper">' +
      '<button class="mus-knap" data-g="gaa">👣 Gå hen</button>' +
      (ejer ? '<button class="mus-knap" data-g="ret">✏️ Ret</button><button class="mus-knap" data-g="flyt">📍 Flyt skilt</button><button class="mus-knap roed" data-g="slet">🗑 Slet</button>' : "") +
    '</div>';
  kort.hidden = false;
  kort.querySelectorAll("[data-g]").forEach(function (k) {
    k.addEventListener("click", function () {
      const g = k.dataset.g;
      if (g === "gaa") { musGaaHen(s); kort.hidden = true; }
      if (g === "ret") { kort.hidden = true; musAabnForm(s, false); }
      if (g === "flyt") { kort.hidden = true; musStartPlacering(s, false); }
      if (g === "slet") {
        if (!k.dataset.sikker) { k.dataset.sikker = "1"; k.textContent = "Er du sikker? Tryk igen"; return; }
        MUS_SKILTE = MUS_SKILTE.filter(function (x) { return x !== s; });
        kort.hidden = true;
        musGemSkilte();
        besked.textContent = "🗑 Skiltet \"" + s.titel + "\" er slettet.";
      }
    });
  });
}

function musStartPlacering(s, ny) {
  if (!iMuseet()) return;
  musPlacerer = { skilt: s, ny: ny };
  laerred.style.cursor = "crosshair";
  besked.textContent = "🏷 Klik på den ting i museet, skiltet skal stå ved (eller på et tomt felt).";
}
function musNytSkilt(afd) {
  if (!musErEjer()) return;
  const s = { id: "s" + Date.now().toString(36), x: 0, y: 0, afd: afd || 1, nr: "", titel: "", dato: "", tekst: "" };
  document.getElementById("mus-guide").hidden = true;
  musStartPlacering(s, true);
}

let musFormSkilt = null, musFormNy = false;
function musAabnForm(s, ny) {
  if (!musErEjer()) return;
  musFormSkilt = s; musFormNy = ny; musRetter = true;
  document.getElementById("mus-form-titel").textContent = ny ? "➕ Nyt museumsskilt" : "✏️ Ret skiltet";
  document.getElementById("mus-f-afd").value = s.afd || 1;
  document.getElementById("mus-f-nr").value = s.nr || "";
  document.getElementById("mus-f-titel").value = s.titel || "";
  document.getElementById("mus-f-dato").value = /^\d{4}-\d{2}-\d{2}$/.test(s.dato || "") ? s.dato : "";
  document.getElementById("mus-f-tekst").value = s.tekst || "";
  document.getElementById("mus-form").hidden = false;
  document.getElementById("mus-f-titel").focus();
}
function musGemForm() {
  const s = musFormSkilt;
  if (!s) return;
  const titel = document.getElementById("mus-f-titel").value.trim();
  if (!titel) { besked.textContent = "Skiltet skal have en titel."; document.getElementById("mus-f-titel").focus(); return; }
  s.afd = +document.getElementById("mus-f-afd").value || 1;
  s.nr = document.getElementById("mus-f-nr").value.trim();
  s.titel = titel;
  s.dato = document.getElementById("mus-f-dato").value;
  s.tekst = document.getElementById("mus-f-tekst").value.trim();
  if (musFormNy && MUS_SKILTE.indexOf(s) < 0) MUS_SKILTE.push(s);
  document.getElementById("mus-form").hidden = true;
  musRetter = false;
  musGemSkilte();
  besked.textContent = "💾 Skiltet \"" + s.titel + "\" er gemt.";
  musGuideFane = +s.afd;
}

// ----- guiden -----
let musGuideFane = 1;   // 1-4 = afdeling, 5 = tidslinje
function musTegnGuide() {
  const g = document.getElementById("mus-guide");
  if (!g || g.hidden) return;
  const faner = g.querySelector(".mus-faner"), liste = g.querySelector(".mus-liste");
  faner.innerHTML = "";
  MUS_AFDELINGER.concat([{ nr: 5, navn: "Tidslinje", ikon: "🕰" }]).forEach(function (a) {
    const k = document.createElement("button");
    k.className = "mus-fane" + (musGuideFane === a.nr ? " valgt" : "");
    k.textContent = a.ikon + " " + a.navn;
    k.addEventListener("click", function () { musGuideFane = a.nr; musTegnGuide(); });
    faner.appendChild(k);
  });
  const ejer = musErEjer();
  let skilte;
  if (musGuideFane === 5) {
    skilte = MUS_SKILTE.filter(function (s) { return s.dato; }).sort(function (a, b) { return a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : 0; });
  } else {
    skilte = MUS_SKILTE.filter(function (s) { return +s.afd === musGuideFane; });
  }
  let h = "";
  if (ejer && musGuideFane !== 5) h += '<div><button class="mus-knap" data-ny="1">➕ Nyt skilt i denne afdeling</button></div>';
  if (!skilte.length) h += '<div class="mus-tom">' + (musGuideFane === 5 ? "Ingen skilte med dato endnu." : "Der er ingen skilte i denne afdeling endnu.") + '</div>';
  const poster = skilte.map(function (s) {
    const i = MUS_SKILTE.indexOf(s);
    return '<div class="mus-post"><div class="mus-nr">' + musEsc(s.nr) + (s.dato ? " · " + musEsc(musDato(s.dato)) : "") + '</div>' +
      '<b>' + musEsc(s.titel) + '</b>' + (s.tekst ? '<p>' + musEsc(s.tekst) + '</p>' : "") +
      '<div class="mus-knapper"><button class="mus-knap" data-i="' + i + '" data-g="gaa">👣 Gå hen</button>' +
      '<button class="mus-knap" data-i="' + i + '" data-g="vis">🏷 Vis skiltet</button>' +
      (ejer ? '<button class="mus-knap" data-i="' + i + '" data-g="ret">✏️ Ret</button>' : "") + '</div></div>';
  }).join("");
  h += musGuideFane === 5 ? '<div class="mus-tid">' + poster + '</div>' : poster;
  if (!musPaaServer && ejer) h += '<div class="mus-tom">💡 Skiltene gemmes kun på denne computer, indtil database-34-museum.sql er kørt i Supabase.</div>';
  liste.innerHTML = h;
  liste.querySelectorAll("[data-ny]").forEach(function (k) { k.addEventListener("click", function () { musNytSkilt(musGuideFane); }); });
  liste.querySelectorAll("[data-g]").forEach(function (k) {
    k.addEventListener("click", function () {
      const s = MUS_SKILTE[+k.dataset.i];
      if (!s) return;
      if (k.dataset.g === "gaa") musGaaHen(s);
      if (k.dataset.g === "vis") musVisKort(s);
      if (k.dataset.g === "ret") musAabnForm(s, false);
    });
  });
}
