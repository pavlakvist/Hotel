// =============================================================
//  💎 Rares i møbelkataloget (Shop → Møbler → Rares)
//  Sjældne møbler, der koster Stella. Et møbel bliver rare, når det
//  i js/moebel-katalog.js har "rare": true eller "kategori": "Rares", fx:
//    {"id": "trone-01", "navn": "Guldtrone", "billede": "…", "klip": […], "kategori": "Rares", "saede": 30},
//  Prisen kan sættes med "stella": 15. Ellers regnes den ud fra møblets størrelse (5–25 Stella).
// =============================================================
function erRare(type) { return !!type && (type.rare === true || type.kategori === "Rares"); }

const RARES_KAT = { navn: "Rares", ikon: "💎", ting: [] };
function opdaterRares() {
  RARES_KAT.ting = MOEBLER.filter(erRare);
  // Rares har sin egen fane, så de står ikke to gange
  SHOP_KAT.forEach(function (k) {
    if (k !== RARES_KAT && k.navn === "Rares") k.skjult = true;
  });
}
SHOP_KAT.splice(Math.min(2, SHOP_KAT.length), 0, RARES_KAT);
for (let i = SHOP_KAT.length - 1; i >= 0; i--) {
  if (SHOP_KAT[i] !== RARES_KAT && SHOP_KAT[i].navn === "Rares") SHOP_KAT.splice(i, 1);
}
KAT_IKON.Rares = "💎";
opdaterRares();

const prisFoerRares = pris;
pris = function (type) {
  if (!erRare(type)) return prisFoerRares(type);
  if (type.stella) return { stella: true, beloeb: type.stella };
  const k = type.klip || [0, 0, 60, 60];
  return { stella: true, beloeb: Math.max(5, Math.min(25, Math.round(k[2] * k[3] / 1500) + 5)) };
};

// Er der ingen rares endnu, står der en lille tekst i stedet for et tomt felt
const visShopFoerRares = visShop;
visShop = function () {
  opdaterRares();
  visShopFoerRares();
  if (shopFane !== "moebler" || shopKat !== RARES_KAT) return;
  const gitter = document.getElementById("shop-gitter");
  const top = document.createElement("p");
  top.className = "butik-rares";
  top.innerHTML = RARES_KAT.ting.length
    ? "💎 <b>Rares</b> er sjældne møbler. De koster Stella og findes kun her."
    : "💎 <b>Rares</b> er sjældne møbler, der koster Stella.<br><small>Der er ingen rares lige nu. Hold øje, de kommer snart ✨</small>";
  gitter.prepend(top);
};

const raresStil = document.createElement("style");
raresStil.textContent =
  "#shop-gitter .butik-rares { grid-column: 1 / -1; align-self: start; margin: 0 0 6px; padding: 8px 10px; background: linear-gradient(#f3e8ff, #e9dcff);" +
  " border: 2px solid #b89be6; border-radius: 10px; color: #4a2d7a; font-size: 12px; text-align: center; }";
document.head.appendChild(raresStil);
