// =============================================================
//  🎪 Staff-møbler til events (5/11)
//  En kategori i kataloget, som kun ansatte (alle med et staff-skilt)
//  og hotellets ejer kan se. Møblerne er gratis for dem.
//  - Shop → Møbler → "🎪 Staff": Gratis, kommer i Mine ting.
//    Står du i et fælles rum (fx et event-rum) og må bygge der,
//    kan du også trykke "🔨 Stil her" og sætte møblet direkte i rummet.
//  - Møbelpanellet får fanen "Staff" (kun for staff og ejeren).
//  Billederne: billeder/moebler/ev-*/ev-*-0..3.png
//  (3D-renderet som de realistiske møbler: /mnt/project-files/staff-moebler/real/event_real.py)
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
const STAFF_KAT = "Staff";
const STAFF_TYPER = [
  { id: "ev-scene", navn: "Scene", felter: [2, 2], skala: 0.5, ankre: [[242,  323],  [242,  323],  [242,  323],  [242,  323]] },
  { id: "ev-mikrofon", navn: "Mikrofon", skala: 0.5, ankre: [[126,  367],  [126,  367],  [126,  367],  [126,  367]] },
  { id: "ev-hoejtaler", navn: "Højttaler", skala: 0.5, ankre: [[126,  298],  [126,  298],  [126,  298],  [126,  298]] },
  { id: "ev-dj-pult", navn: "DJ-pult", felter: [2, 1], skala: 0.5, ankre: [[222,  369],  [126,  369],  [222,  369],  [126,  369]] },
  { id: "ev-spotlight", navn: "Spotlight", skala: 0.5, ankre: [[126,  375],  [126,  375],  [126,  375],  [126,  375]] },
  { id: "ev-podie", navn: "Vinderpodie 1-2-3", felter: [3, 1], skala: 0.5, ankre: [[318,  341],  [126,  341],  [318,  341],  [126,  341]] },
  { id: "ev-loeber", navn: "Rød løber", felter: [1, 3], kanGaaPaa: true, skala: 0.5, ankre: [[126,  222],  [318,  222],  [126,  222],  [318,  222]] },
  { id: "ev-afspaerring", navn: "Afspærring med rødt reb", felter: [2, 1], skala: 0.5, ankre: [[222,  346],  [126,  346],  [222,  346],  [126,  346]] },
  { id: "ev-balloner", navn: "Balloner", skala: 0.5, ankre: [[141,  443],  [141,  443],  [141,  443],  [141,  443]] },
  { id: "ev-ballonbue", navn: "Ballonbue", felter: [2, 1], skala: 0.5, ankre: [[242,  512],  [146,  512],  [242,  512],  [146,  512]] },
  { id: "ev-pokal", navn: "Pokal på marmorsokkel", skala: 0.5, ankre: [[126,  329],  [126,  329],  [126,  329],  [126,  329]] },
  { id: "ev-stol", navn: "Guldstol", saede: 35, centrer: true, skala: 0.5, ankre: [[126,  283],  [126,  283],  [126,  283],  [126,  283]] },
  { id: "ev-gaver", navn: "Præmiegaver", skala: 0.5, ankre: [[126,  237],  [126,  237],  [126,  237],  [126,  237]] },
  { id: "ev-skilt", navn: "EVENT-skilt", skala: 0.5, ankre: [[126,  360],  [126,  360],  [126,  360],  [126,  360]] },
  { id: "ev-talerstol", navn: "Talerstol", skala: 0.5, ankre: [[126,  352],  [126,  352],  [126,  352],  [126,  352]] },
  { id: "ev-diskokugle", navn: "Diskokugle", skala: 0.5, ankre: [[126,  405],  [126,  405],  [126,  405],  [126,  405]] },
  { id: "ev-konfettikanon", navn: "Konfettikanon", skala: 0.5, ankre: [[126,  344],  [126,  344],  [126,  344],  [126,  344]] },
  { id: "ev-buffetbord", navn: "Buffetbord med kage", felter: [2, 1], skala: 0.5, ankre: [[222,  339],  [126,  339],  [222,  339],  [126,  339]] },
  { id: "ev-cocktailbord", navn: "Ståbord", skala: 0.5, ankre: [[126,  329],  [126,  329],  [126,  329],  [126,  329]] },
  { id: "ev-vip-sofa", navn: "VIP-sofa i guld", felter: [2, 1], saede: 33, centrer: true, skala: 0.5, ankre: [[222,  339],  [126,  339],  [222,  339],  [126,  339]] },
  { id: "ev-vip-skilt", navn: "VIP-skilt", skala: 0.5, ankre: [[126,  306],  [126,  306],  [126,  306],  [126,  306]] },
  { id: "ev-trommer", navn: "Trommesæt", skala: 0.5, ankre: [[141,  321],  [141,  321],  [141,  321],  [141,  321]] },
  { id: "ev-guitar", navn: "Guitar på stativ", skala: 0.5, ankre: [[126,  344],  [126,  344],  [126,  344],  [126,  344]] },
  { id: "ev-forstaerker", navn: "Forstærker", skala: 0.5, ankre: [[126,  245],  [126,  245],  [126,  245],  [126,  245]] },
  { id: "ev-scoretavle", navn: "Pointtavle", felter: [2, 1], skala: 0.5, ankre: [[222,  446],  [126,  446],  [222,  446],  [126,  446]] },
  { id: "ev-kamera", navn: "Videokamera", skala: 0.5, ankre: [[126,  329],  [126,  329],  [126,  329],  [126,  329]] },
  { id: "ev-blomster", navn: "Blomster i guldurne", skala: 0.5, ankre: [[126,  283],  [126,  283],  [126,  283],  [126,  283]] },
  { id: "ev-fotovaeg", navn: "Fotovæg HELLO VERA", felter: [2, 1], skala: 0.5, ankre: [[222,  484],  [126,  484],  [222,  484],  [126,  484]] },
  { id: "ev-medaljebord", navn: "Bord med medaljer", skala: 0.5, ankre: [[126,  222],  [126,  222],  [126,  222],  [126,  222]] },
  // runde 2 (5/11 aften)
  { id: "ev-tronstol", navn: "Guldtrone", saede: 35, centrer: true, skala: 0.5, ankre: [[126, 398], [126, 398], [126, 398], [126, 398]] },
  { id: "ev-loungestol", navn: "Hvid loungestol", saede: 28, centrer: true, skala: 0.5, ankre: [[126, 276], [126, 276], [126, 276], [126, 276]] },
  { id: "ev-barstol", navn: "Barstol", saede: 52, centrer: true, skala: 0.5, ankre: [[126, 306], [126, 306], [126, 306], [126, 306]] },
  { id: "ev-bar", navn: "Bar med flasker", felter: [2, 1], skala: 0.5, ankre: [[222, 400], [126, 400], [222, 400], [126, 400]] },
  { id: "ev-champagnetaarn", navn: "Champagnetårn", skala: 0.5, ankre: [[126, 344], [126, 344], [126, 344], [126, 344]] },
  { id: "ev-bryllupskage", navn: "Bryllupskage", skala: 0.5, ankre: [[126, 337], [126, 337], [126, 337], [126, 337]] },
  { id: "ev-lysstander", navn: "Lyskæde på stænger", skala: 0.5, ankre: [[126, 405], [126, 405], [126, 405], [126, 405]] },
  { id: "ev-roegmaskine", navn: "Røgmaskine", skala: 0.5, ankre: [[156, 252], [156, 252], [156, 252], [156, 252]] },
  { id: "ev-laser", navn: "Laserlys", skala: 0.5, ankre: [[156, 390], [156, 390], [156, 390], [156, 390]] },
  { id: "ev-keyboard", navn: "Keyboard", skala: 0.5, ankre: [[141, 298], [141, 298], [141, 298], [141, 298]] },
  { id: "ev-harpe", navn: "Harpe", skala: 0.5, ankre: [[126, 360], [126, 360], [126, 360], [126, 360]] },
  { id: "ev-lystraverse", navn: "Lystraverse med lamper", felter: [2, 1], skala: 0.5, ankre: [[237, 507], [141, 507], [237, 507], [141, 507]] },
  { id: "ev-ledskaerm", navn: "Stor LED-skærm", felter: [2, 1], skala: 0.5, ankre: [[222, 446], [126, 446], [222, 446], [126, 446]] },
  { id: "ev-billetskranke", navn: "Billetskranke", skala: 0.5, ankre: [[126, 421], [126, 421], [126, 421], [126, 421]] },
  { id: "ev-garderobe", navn: "Garderobestativ med frakker", skala: 0.5, ankre: [[126, 390], [126, 390], [126, 390], [126, 390]] },
  { id: "ev-gaestebog", navn: "Gæstebog på sokkel", skala: 0.5, ankre: [[126, 314], [126, 314], [126, 314], [126, 314]] },
  { id: "ev-kandelaber", navn: "Kandelaber", skala: 0.5, ankre: [[126, 352], [126, 352], [126, 352], [126, 352]] },
  { id: "ev-lanterne", navn: "Lanterne med lys", skala: 0.5, ankre: [[126, 230], [126, 230], [126, 230], [126, 230]] },
  { id: "ev-blomsterbue", navn: "Blomsterbue", felter: [2, 1], skala: 0.5, ankre: [[242, 512], [146, 512], [242, 512], [146, 512]] },
  { id: "ev-neonskilt", navn: "PARTY-neonskilt", skala: 0.5, ankre: [[126, 360], [126, 360], [126, 360], [126, 360]] },
  { id: "ev-folieballoner", navn: "Folieballoner", skala: 0.5, ankre: [[141, 443], [141, 443], [141, 443], [141, 443]] },
  { id: "ev-pinata", navn: "Piñata", skala: 0.5, ankre: [[126, 390], [126, 390], [126, 390], [126, 390]] },
  { id: "ev-lykkehjul", navn: "Lykkehjul", skala: 0.5, ankre: [[126, 375], [126, 375], [126, 375], [126, 375]] },
  { id: "ev-gong", navn: "Gongong", skala: 0.5, ankre: [[126, 360], [126, 360], [126, 360], [126, 360]] },
  { id: "ev-juletrae", navn: "Juletræ med gaver", skala: 0.5, ankre: [[126, 405], [126, 405], [126, 405], [126, 405]] },
  { id: "ev-graeskar", navn: "Græskar", skala: 0.5, ankre: [[126, 192], [126, 192], [126, 192], [126, 192]] },
  { id: "ev-snemand", navn: "Snemand", skala: 0.5, ankre: [[126, 329], [126, 329], [126, 329], [126, 329]] },
  { id: "ev-slikbar", navn: "Slikbar", skala: 0.5, ankre: [[126, 321], [126, 321], [126, 321], [126, 321]] },
  { id: "ev-candyfloss", navn: "Candyfloss-maskine", skala: 0.5, ankre: [[126, 337], [126, 337], [126, 337], [126, 337]] },
  { id: "ev-dommerbord", navn: "Dommerbord", felter: [2, 1], skala: 0.5, ankre: [[222, 331], [126, 331], [222, 331], [126, 331]] },
  { id: "ev-rundtbord", navn: "Rundt festbord", skala: 0.5, ankre: [[126, 283], [126, 283], [126, 283], [126, 283]] },
  { id: "ev-klapstol", navn: "Hvid feststol", saede: 34, centrer: true, skala: 0.5, ankre: [[126, 276], [126, 276], [126, 276], [126, 276]] },
];
STAFF_TYPER.forEach(function (t) {
  if (MOEBEL_TYPER[t.id]) return;
  t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png?r=1"; });
  t.kategori = STAFF_KAT;
  t.staff = true;
  MOEBLER.push(t);
  MOEBEL_TYPER[t.id] = t;
  forberedRetninger(t);
});

// Er du staff? (ejeren altid, ellers alle med et ansat-skilt, se js/eventrum.js)
function erStaff() {
  if (typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0) return true;
  return typeof erAnsat === "function" && erAnsat(FIGUR.navn);
}

// ----- Gratis for staff -----
const prisFoerStaff = pris;
pris = function (type) {
  if (type && type.staff) return { stella: false, beloeb: 0 };
  return prisFoerStaff(type);
};
const prisHtmlFoerStaff = prisHtml;
prisHtml = function (p) {
  if (p && !p.stella && p.beloeb === 0) return "Gratis";
  return prisHtmlFoerStaff(p);
};

// ----- Kategorien i Shoppen (kun for staff) -----
const STAFF_SHOP_KAT = { navn: "Staff", ikon: "🎪", ting: STAFF_TYPER.map(function (t) { return MOEBEL_TYPER[t.id]; }) };
function staffKatIShop() {
  if (typeof SHOP_KAT === "undefined") return;
  const i = SHOP_KAT.indexOf(STAFF_SHOP_KAT);
  if (erStaff()) { if (i < 0) SHOP_KAT.push(STAFF_SHOP_KAT); }
  else {
    if (i >= 0) SHOP_KAT.splice(i, 1);
    if (shopKat === STAFF_SHOP_KAT) shopKat = SHOP_KAT[0];
    if (shopValgt && shopValgt.staff) shopValgt = null;
  }
}
const visShopFoerStaff = visShop;
visShop = function () {
  staffKatIShop();
  visShopFoerStaff();
  visStilHer();
};

// "🔨 Stil her": sæt staff-møblet direkte i det rum, du står i
const stilHerKnap = document.createElement("button");
stilHerKnap.type = "button";
stilHerKnap.id = "shop-stil-her";
stilHerKnap.textContent = "🔨 Stil her";
stilHerKnap.title = "Sæt møblet direkte i det rum, du står i";
stilHerKnap.hidden = true;
stilHerKnap.style.marginTop = "6px";
const koebKnapStaff = document.getElementById("shop-koeb");
if (koebKnapStaff) koebKnapStaff.after(stilHerKnap);
function maaStilleHer() {
  if (typeof iFaellesRum === "function" && iFaellesRum()) return typeof kanBygge === "function" ? kanBygge() : false;
  return rumValg === "vaerelse";      // dine egne rum
}
function visStilHer() {
  stilHerKnap.hidden = !(shopFane === "moebler" && shopValgt && shopValgt.staff && erStaff() && maaStilleHer());
}
stilHerKnap.addEventListener("click", function () {
  if (!shopValgt || !shopValgt.staff || !erStaff() || !maaStilleHer()) return;
  valgtType = shopValgt.id;
  valgtMoebel = null;
  shopVindue.hidden = true;
  opdaterPanel();
});

// ----- Fanen "Staff" i møbelpanelet -----
(function () {
  if (typeof faneBoks === "undefined" || typeof knapBoks === "undefined") return;
  const fane = document.createElement("button");
  fane.textContent = STAFF_KAT;
  fane.hidden = true;
  fane.addEventListener("click", function () { visKategori(STAFF_KAT); });
  faneBoks.appendChild(fane);
  const knapper = [];
  STAFF_TYPER.forEach(function (t) {
    const type = MOEBEL_TYPER[t.id];
    const knap = document.createElement("button");
    knap.className = "moebel-knap";
    knap.dataset.id = type.id;
    knap.dataset.kategori = STAFF_KAT;
    knap.hidden = true;
    const ikon = document.createElement("canvas");
    ikon.width = 64; ikon.height = 70;
    ikoner.push({ ikon: ikon, type: type });
    const navn = document.createElement("span");
    navn.textContent = type.navn;
    knap.append(ikon, navn);
    knap.addEventListener("click", function () {
      if (!erStaff()) return;
      valgtType = valgtType === type.id ? null : type.id;
      valgtMoebel = null;
      opdaterPanel();
    });
    knapBoks.appendChild(knap);
    knapper.push(knap);
  });
  if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 800);
  let var_ = null;
  function tjek() {
    const s = erStaff();
    if (s === var_) return;
    var_ = s;
    fane.hidden = !s;
    if (!s) {
      knapper.forEach(function (k) { k.hidden = true; });
      if (valgtKategori === STAFF_KAT) visKategori(KATEGORIER[0]);
      if (valgtType && MOEBEL_TYPER[valgtType] && MOEBEL_TYPER[valgtType].staff) { valgtType = null; opdaterPanel(); }
    } else if (valgtKategori === STAFF_KAT) visKategori(STAFF_KAT);
  }
  tjek();
  setInterval(tjek, 1000);
})();
