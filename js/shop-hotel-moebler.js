// =============================================================
//  🛒 Hotellets egne møbler i Shoppen
//  Møblerne fra Biografen 🎬 og Tagterrassen ☀️ kan købes i
//  Shop → Møbler og sættes ind i dit eget værelse.
//  Popcornmaskinen giver popcorn 🍿 og isvognen giver is 🍦,
//  også når de står i dit værelse.
//  Priserne (i Glimt) kan ændres her:
// =============================================================
const HOTEL_MOEBEL_PRISER = {
  "bio-saede": 120,
  "popcorn-maskine": 300,
  "tag-havestol": 90,
  "tag-baenk": 160,
  "tag-loungesofa": 280,
  "tag-bord": 110,
  "tag-parasol": 140,
  "tag-plantekasse": 70,
  "tag-oliventrae": 200,
  "tag-isvogn": 350,
};

// Rækkefølge og ikoner for de to kategorier i Shoppen
const HOTEL_SHOP_KAT = [
  { kategori: "Biograf", ikon: "🎬" },
  { kategori: "Tagterrasse", ikon: "☀️" },
];

const prisFoerHotelMoebler = pris;
pris = function (type) {
  if (type && HOTEL_MOEBEL_PRISER[type.id]) return { stella: false, beloeb: HOTEL_MOEBEL_PRISER[type.id] };
  return prisFoerHotelMoebler(type);
};

// Kategorierne laves, når shop.js indlæses. Er tagterrassens møbler kommet til
// senere (gammelt katalog i browseren), bliver kategorien lavet her.
function hotelMoeblerIShop() {
  if (typeof SHOP_KAT === "undefined") return;
  HOTEL_SHOP_KAT.forEach(function (h) {
    KAT_IKON[h.kategori] = h.ikon;
    const ting = MOEBLER.filter(function (m) { return m.kategori === h.kategori; });
    if (!ting.length) return;
    let kat = SHOP_KAT.find(function (k) { return k.navn === h.kategori; });
    if (!kat) {
      kat = { navn: h.kategori, ikon: h.ikon, ting: ting };
      SHOP_KAT.push(kat);
    }
    kat.ikon = h.ikon;
    kat.ting = ting;
    // med under "Siddepladser", hvis man kan sidde på dem
    const sid = SHOP_KAT.find(function (k) { return k.navn === "Siddepladser"; });
    if (sid) ting.forEach(function (m) { if (m.saede && sid.ting.indexOf(m) < 0) sid.ting.push(m); });
    // og øverst under "Nyt"
    const nyt = SHOP_KAT.find(function (k) { return k.navn === "Nyt"; });
    if (nyt) ting.slice().reverse().forEach(function (m) { if (nyt.ting.indexOf(m) < 0) nyt.ting.unshift(m); });
  });
  if (typeof shopVindue !== "undefined" && !shopVindue.hidden) visShop();
}
hotelMoeblerIShop();
// tagterrasse.js kan blive færdig lidt senere end denne fil
setTimeout(hotelMoeblerIShop, 1500);
