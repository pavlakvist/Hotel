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
// -------------------------------------------------------------
//  STANDARD FOR NYE MØBLER (28/10): ét PNG-billede pr. retning
//
//  - Hvert billede er ÉN PNG-fil med ÉT møbel og ægte gennemsigtig baggrund
//    (ingen ark, ingen collage, ingen hvid eller ternet baggrund).
//  - Billederne tegnes 1:1: ét gulvfelt er 96 x 48 pixels, så billedet skal
//    være i den størrelse, møblet skal have i spillet (skala 1, ingen "skala").
//    Bredden er ca. (bredde + dybde i felter) x 48 px, fx stol 1x1 = ca. 96-104 px,
//    sofa 2x1 = ca. 144-150 px. Pigen er ca. 128 px høj.
//  - Bunden af billedet er møblets forreste hjørne på gulvet (benene står på gulvet).
//    Hvis det ikke passer, skriv "anker": [x, y] = den pixel i billedet, der skal stå
//    på det forreste hjørne (eller "ankre": én [x, y] pr. retning).
//  - Lige så lidt tom kant som muligt, men plads til en lille skygge.
//  - Filerne ligger i billeder/moebler/<id>/<id>-0.png ... <id>-3.png:
//      0 = vender ned mod venstre (set skråt forfra fra højre)
//      1 = vender ned mod højre   (set skråt forfra fra venstre)
//      2 = ryggen til, op mod højre
//      3 = ryggen til, op mod venstre
//    Mangler en retning, skriv null, så springer "Drej" den over.
//  - felter: [bredde, dybde] i felter. saede: hvor højt sædet er, i pixels.
// -------------------------------------------------------------
MOEBLER.push(
  {"id": "test-laenestol", "navn": "Orange lænestol (test)", "retninger": ["billeder/moebler/laenestol/laenestol-0.png", "billeder/moebler/laenestol/laenestol-1.png", "billeder/moebler/laenestol/laenestol-2.png", "billeder/moebler/laenestol/laenestol-3.png"], "kategori": "Nye møbler", "saede": 19},
);

// Biografen 🎬 (js/biograf.js). "bagfra": man kan også sidde i sædet, når det vender ryggen til
// (så ser man hovedet over ryglænet, ligesom i en rigtig biograf).
MOEBLER.push(
  {"id": "bio-saede", "navn": "Biografsæde", "retninger": ["billeder/moebler/bio-saede/bio-saede-0.png", "billeder/moebler/bio-saede/bio-saede-1.png", "billeder/moebler/bio-saede/bio-saede-2.png", "billeder/moebler/bio-saede/bio-saede-3.png"], "kategori": "Biograf", "saede": 20, "bagfra": true},
  {"id": "popcorn-maskine", "navn": "Popcornmaskine", "retninger": ["billeder/moebler/popcorn-maskine/popcorn-maskine-0.png", "billeder/moebler/popcorn-maskine/popcorn-maskine-1.png", "billeder/moebler/popcorn-maskine/popcorn-maskine-2.png", "billeder/moebler/popcorn-maskine/popcorn-maskine-3.png"], "kategori": "Biograf"},
);

// Tagterrassen ☀️ (js/tagterrasse.js): udendørs møbler. Man kan sidde på havestol, bænk og loungesofa.
// Klik på isvognen for at få en is 🍦
MOEBLER.push(
  {"id": "tag-havestol", "navn": "Havestol", "retninger": ["billeder/moebler/tag-havestol/tag-havestol-0.png", "billeder/moebler/tag-havestol/tag-havestol-1.png", "billeder/moebler/tag-havestol/tag-havestol-2.png", "billeder/moebler/tag-havestol/tag-havestol-3.png"], "kategori": "Tagterrasse", "saede": 20},
  {"id": "tag-baenk", "navn": "Havebænk", "retninger": ["billeder/moebler/tag-baenk/tag-baenk-0.png", "billeder/moebler/tag-baenk/tag-baenk-1.png", "billeder/moebler/tag-baenk/tag-baenk-2.png", "billeder/moebler/tag-baenk/tag-baenk-3.png"], "kategori": "Tagterrasse", "felter": [2, 1], "saede": 19},
  {"id": "tag-loungesofa", "navn": "Loungesofa", "retninger": ["billeder/moebler/tag-loungesofa/tag-loungesofa-0.png", "billeder/moebler/tag-loungesofa/tag-loungesofa-1.png", "billeder/moebler/tag-loungesofa/tag-loungesofa-2.png", "billeder/moebler/tag-loungesofa/tag-loungesofa-3.png"], "kategori": "Tagterrasse", "felter": [2, 1], "saede": 22},
  {"id": "tag-bord", "navn": "Havebord", "retninger": ["billeder/moebler/tag-bord/tag-bord-0.png", "billeder/moebler/tag-bord/tag-bord-1.png", "billeder/moebler/tag-bord/tag-bord-2.png", "billeder/moebler/tag-bord/tag-bord-3.png"], "kategori": "Tagterrasse"},
  {"id": "tag-parasol", "navn": "Parasol", "retninger": ["billeder/moebler/tag-parasol/tag-parasol-0.png", null, null, null], "kategori": "Tagterrasse"},
  {"id": "tag-plantekasse", "navn": "Plantekasse med blomster", "retninger": ["billeder/moebler/tag-plantekasse/tag-plantekasse-0.png", "billeder/moebler/tag-plantekasse/tag-plantekasse-1.png", "billeder/moebler/tag-plantekasse/tag-plantekasse-2.png", "billeder/moebler/tag-plantekasse/tag-plantekasse-3.png"], "kategori": "Tagterrasse"},
  {"id": "tag-oliventrae", "navn": "Oliventræ", "retninger": ["billeder/moebler/tag-oliventrae/tag-oliventrae-0.png", "billeder/moebler/tag-oliventrae/tag-oliventrae-1.png", "billeder/moebler/tag-oliventrae/tag-oliventrae-2.png", "billeder/moebler/tag-oliventrae/tag-oliventrae-3.png"], "kategori": "Tagterrasse"},
  {"id": "tag-isvogn", "navn": "Isvogn", "retninger": ["billeder/moebler/tag-isvogn/tag-isvogn-0.png", "billeder/moebler/tag-isvogn/tag-isvogn-1.png", "billeder/moebler/tag-isvogn/tag-isvogn-2.png", "billeder/moebler/tag-isvogn/tag-isvogn-3.png"], "kategori": "Tagterrasse"},
);

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
