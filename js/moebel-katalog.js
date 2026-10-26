// =============================================================
//  MØBEL-KATALOG — tomt, så Pavla kan starte forfra med møblerne (25/10).
//  Det gamle katalog med 327 møbler ligger i moebler-backup/moebel-katalog.js,
//  og billederne ligger stadig i billeder/moebler/katalog/.
//
//  Nye møbler skrives ind sådan her (en linje pr. møbel):
//  MOEBLER.push(
//    {"id": "sofa-01", "navn": "Rød sofa", "billede": "billeder/moebler/katalog/sofaer.png", "klip": [0, 0, 100, 80], "kategori": "Sofaer", "saede": 25},
//  );
//  "klip" er hvor møblet står i billedet: [x, y, bredde, højde].
//  saede:  man kan sidde på møblet (hvor højt sædet er, i pixels)
//  vender: "venstre" eller "hoejre": hvilken vej møblet vender, når det ikke er drejet
// =============================================================

// Ingen møbler endnu (også de 6 første fra js/indstillinger.js er taget ud)
MOEBLER.length = 0;

// -------------------------------------------------------------
//  NYE MØBLER (26/10), tegnet i pixel-stil i 4 retninger
//  klipper:  ét billede for hver retning: ned-venstre, ned-højre, op-højre (ryggen), op-venstre
//  felter:   [bredde, dybde] i felter (sofaen og sofabordet fylder 2)
// -------------------------------------------------------------
MOEBLER.push(
  {"id": "ny-sofa", "navn": "Rød sofa", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 0, 382, 255], [386, 0, 382, 255], [772, 0, 378, 225], [1154, 0, 378, 225]], "klip": [0, 0, 382, 255], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.5, "felter": [2, 1], "saede": 19},
  {"id": "ny-laenestol", "navn": "Rød lænestol", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 259, 190, 207], [194, 259, 190, 207], [388, 259, 190, 177], [582, 259, 190, 177]], "klip": [0, 259, 190, 207], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.5, "saede": 19},
  {"id": "ny-sofabord", "navn": "Sofabord", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 470, 348, 186], [352, 470, 348, 186], [704, 470, 348, 186], [1056, 470, 348, 186]], "klip": [0, 470, 348, 186], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.5, "felter": [2, 1]},
  {"id": "ny-vitrine", "navn": "Vitrineskab", "billede": "billeder/moebler/hjem-moebler.png", "klipper": [[0, 0, 184, 306], [188, 0, 184, 306], [376, 0, 184, 278], [564, 0, 184, 278]], "klip": [0, 0, 184, 306], "vender": "venstre", "skala": 0.5, "kategori": "Hyggeligt hjem"},
  {"id": "ny-koeleskab", "navn": "Køleskab", "billede": "billeder/moebler/hjem-moebler.png", "klipper": [[0, 310, 170, 294], [174, 310, 170, 294], [348, 310, 170, 284], [522, 310, 170, 284]], "klip": [0, 310, 170, 294], "vender": "venstre", "skala": 0.5, "kategori": "Hyggeligt hjem"},
  {"id": "ny-spisebord", "navn": "Spisebord", "billede": "billeder/moebler/hjem-moebler.png", "klipper": [[0, 608, 180, 170], [184, 608, 180, 170], [368, 608, 180, 170], [552, 608, 180, 170]], "klip": [0, 608, 180, 170], "vender": "venstre", "skala": 0.5, "kategori": "Hyggeligt hjem"},
  {"id": "ny-spisestol", "navn": "Spisestol", "billede": "billeder/moebler/hjem-moebler.png", "klipper": [[0, 782, 120, 187], [124, 782, 120, 187], [248, 782, 120, 161], [372, 782, 120, 161]], "klip": [0, 782, 120, 187], "vender": "venstre", "skala": 0.5, "kategori": "Hyggeligt hjem", "saede": 21},
);


// -------------------------------------------------------------
//  Én gang på hver computer: de gamle møbler i rummene, i Mine ting
//  og på fotoene bliver fjernet, så alle starter forfra.
//  (Gulvplanerne, rummene og farverne bliver, hvor de er.)
// -------------------------------------------------------------
(function () {
  const NULSTIL_NOEGLE = "mit-hotel-moebler-forfra-1";
  try {
    if (localStorage.getItem(NULSTIL_NOEGLE)) return;
    const slet = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === "mit-hotel-rum" || (k.indexOf("mit-hotel-rum-") === 0 && k !== "mit-hotel-rum-plan")) slet.push(k);
    }
    slet.forEach(function (k) { localStorage.setItem(k, "[]"); });
    localStorage.setItem("mit-hotel-lager", "[]");
    const fotos = JSON.parse(localStorage.getItem("mit-hotel-fotos") || "[]");
    if (Array.isArray(fotos)) {
      fotos.forEach(function (f) {
        const s = f && f.scene;
        if (!s) return;
        if (Array.isArray(s.moebler)) s.moebler = [];
        if (s.figur) s.figur.sidde = null;
        if (Array.isArray(s.gaester)) s.gaester.forEach(function (g) { g.sidder = false; g.saede = -1; });
      });
      localStorage.setItem("mit-hotel-fotos", JSON.stringify(fotos));
    }
    localStorage.setItem(NULSTIL_NOEGLE, "1");
  } catch (e) {}
})();
