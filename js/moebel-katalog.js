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
  {"id": "ny-sofa", "navn": "Rød sofa", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 0, 256, 248], [260, 0, 256, 248], [520, 0, 252, 227], [776, 0, 252, 227]], "klip": [0, 0, 256, 248], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.58, "felter": [2, 1], "saede": 31},
  {"id": "ny-laenestol", "navn": "Rød lænestol", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 252, 128, 216], [132, 252, 128, 216], [264, 252, 128, 195], [396, 252, 128, 195]], "klip": [0, 252, 128, 216], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.58, "saede": 31},
  {"id": "ny-sofabord", "navn": "Sofabord", "billede": "billeder/moebler/nye-moebler.png", "klipper": [[0, 472, 234, 147], [238, 472, 234, 147], [476, 472, 234, 147], [714, 472, 234, 147]], "klip": [0, 472, 234, 147], "kategori": "Nye møbler", "vender": "venstre", "skala": 0.5, "felter": [2, 1]},
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
