// =============================================================
//  🏨 INDRETNING — 139 møbler i vinrød, guld og creme (18/11-2026)
//  Så du selv kan indrette lobbyen, radiostudiet, værelser og alle andre rum.
//
//  - Alle kan købe møblerne i Shoppen (hver gruppe har sin egen fane) og
//    stille dem med 🔨 Byggetilstand eller fra Mine ting.
//  - Ejeren har alle møblerne gratis i Byggetilstand (som altid).
//  - Billederne hentes først, når et møbel skal vises (hotellet starter ikke langsommere).
//  - Billederne ligger i billeder/moebler/<id>/<id>-0..3.png (4 retninger, 3D-tegnet, skala 0.5).
//
//  Felter i listen:  k = gruppe, felter = [bredde, dybde], saede = man kan sidde,
//  gaa = man kan gå på det (tæpper og gulvfliser), pris = Glimt i Shoppen.
//  Priserne kan rettes her nedenfor.
// =============================================================
(function () {
  const IV_GRUPPER = {
    sofa:    { navn: "Sofaer og stole", ikon: "🛋️" },
    bord:    { navn: "Borde", ikon: "🍽️" },
    seng:    { navn: "Senge", ikon: "🛏️" },
    skab:    { navn: "Reoler og skabe", ikon: "📚" },
    lampe:   { navn: "Lamper", ikon: "💡" },
    plante:  { navn: "Planter", ikon: "🪴" },
    taeppe:  { navn: "Tæpper", ikon: "🧶" },
    flise:   { navn: "Gulvfliser", ikon: "⬜" },
    billede: { navn: "Billeder og spejle", ikon: "🖼️" },
    disk:    { navn: "Reception og diske", ikon: "🛎️" },
    scene:   { navn: "Scene og musik", ikon: "🎤" },
    koekken: { navn: "Køkken og bad", ikon: "🛁" },
    pynt:    { navn: "Dekorationer", ikon: "🏺" },
    vaeg:    { navn: "Vægge og søjler", ikon: "🧱" },
  };

  const IV_MOEBLER = [
    {"id": "iv-chesterfield", "navn": "Chesterfield-sofa", "k": "sofa", "felter": [2, 1], "ankre": [[222, 331], [126, 331], [222, 331], [126, 331]], "saede": 34, "pris": 300},
    {"id": "iv-chesterfield-creme", "navn": "Chesterfield-sofa (creme)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 331], [126, 331], [222, 331], [126, 331]], "saede": 34, "pris": 300},
    {"id": "iv-chesterfield-guld", "navn": "Chesterfield-sofa (guld)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 331], [126, 331], [222, 331], [126, 331]], "saede": 34, "pris": 320},
    {"id": "iv-sofa3", "navn": "Lang lobbysofa", "k": "sofa", "felter": [3, 1], "ankre": [[318, 379], [126, 379], [318, 379], [126, 379]], "saede": 34, "pris": 340},
    {"id": "iv-sofa3-creme", "navn": "Lang lobbysofa (creme)", "k": "sofa", "felter": [3, 1], "ankre": [[318, 379], [126, 379], [318, 379], [126, 379]], "saede": 34, "pris": 340},
    {"id": "iv-sofa3-guld", "navn": "Lang lobbysofa (guld)", "k": "sofa", "felter": [3, 1], "ankre": [[318, 379], [126, 379], [318, 379], [126, 379]], "saede": 34, "pris": 360},
    {"id": "iv-sofa-moderne", "navn": "Moderne sofa", "k": "sofa", "felter": [2, 1], "ankre": [[222, 316], [126, 316], [222, 316], [126, 316]], "saede": 31, "pris": 220},
    {"id": "iv-sofa-moderne-creme", "navn": "Moderne sofa (creme)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 316], [126, 316], [222, 316], [126, 316]], "saede": 31, "pris": 220},
    {"id": "iv-sofa-moderne-guld", "navn": "Moderne sofa (guld)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 316], [126, 316], [222, 316], [126, 316]], "saede": 31, "pris": 240},
    {"id": "iv-laenestol", "navn": "Ørelapsstol", "k": "sofa", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "saede": 34, "pris": 220},
    {"id": "iv-laenestol-creme", "navn": "Ørelapsstol (creme)", "k": "sofa", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "saede": 34, "pris": 220},
    {"id": "iv-laenestol-guld", "navn": "Ørelapsstol (guld)", "k": "sofa", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "saede": 34, "pris": 240},
    {"id": "iv-cocktailstol", "navn": "Cocktailstol", "k": "sofa", "ankre": [[126, 268], [126, 268], [126, 268], [126, 268]], "saede": 31, "pris": 220},
    {"id": "iv-cocktailstol-creme", "navn": "Cocktailstol (creme)", "k": "sofa", "ankre": [[126, 268], [126, 268], [126, 268], [126, 268]], "saede": 31, "pris": 220},
    {"id": "iv-cocktailstol-guld", "navn": "Cocktailstol (guld)", "k": "sofa", "ankre": [[126, 268], [126, 268], [126, 268], [126, 268]], "saede": 31, "pris": 240},
    {"id": "iv-spisestol", "navn": "Spisestol", "k": "sofa", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "saede": 34, "pris": 90},
    {"id": "iv-spisestol-creme", "navn": "Spisestol (creme)", "k": "sofa", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "saede": 34, "pris": 90},
    {"id": "iv-spisestol-guld", "navn": "Spisestol (guld)", "k": "sofa", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "saede": 34, "pris": 110},
    {"id": "iv-puf", "navn": "Fløjlspuf", "k": "sofa", "ankre": [[126, 207], [126, 207], [126, 207], [126, 207]], "saede": 27, "pris": 70},
    {"id": "iv-puf-creme", "navn": "Fløjlspuf (creme)", "k": "sofa", "ankre": [[126, 207], [126, 207], [126, 207], [126, 207]], "saede": 27, "pris": 70},
    {"id": "iv-puf-guld", "navn": "Fløjlspuf (guld)", "k": "sofa", "ankre": [[126, 207], [126, 207], [126, 207], [126, 207]], "saede": 27, "pris": 90},
    {"id": "iv-chaiselong", "navn": "Chaiselong", "k": "sofa", "felter": [2, 1], "ankre": [[222, 324], [126, 324], [222, 324], [126, 324]], "saede": 32, "pris": 220},
    {"id": "iv-chaiselong-creme", "navn": "Chaiselong (creme)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 324], [126, 324], [222, 324], [126, 324]], "saede": 32, "pris": 220},
    {"id": "iv-chaiselong-guld", "navn": "Chaiselong (guld)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 324], [126, 324], [222, 324], [126, 324]], "saede": 32, "pris": 240},
    {"id": "iv-baenk", "navn": "Polstret bænk", "k": "sofa", "felter": [2, 1], "ankre": [[222, 270], [126, 270], [222, 270], [126, 270]], "saede": 33, "pris": 220},
    {"id": "iv-baenk-creme", "navn": "Polstret bænk (creme)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 270], [126, 270], [222, 270], [126, 270]], "saede": 33, "pris": 220},
    {"id": "iv-baenk-guld", "navn": "Polstret bænk (guld)", "k": "sofa", "felter": [2, 1], "ankre": [[222, 270], [126, 270], [222, 270], [126, 270]], "saede": 33, "pris": 240},
    {"id": "iv-barstol", "navn": "Barstol", "k": "sofa", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "saede": 54, "pris": 90},
    {"id": "iv-kontorstol", "navn": "Kontorstol i læder", "k": "sofa", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "saede": 38, "pris": 220},
    {"id": "iv-gyngestol", "navn": "Gyngestol", "k": "sofa", "ankre": [[126, 314], [126, 314], [126, 314], [126, 314]], "saede": 35, "pris": 220},
    {"id": "iv-sofabord", "navn": "Langt marmorbord", "k": "bord", "felter": [2, 1], "ankre": [[222, 278], [126, 278], [222, 278], [126, 278]], "pris": 150},
    {"id": "iv-sidebord", "navn": "Sidebord i marmor", "k": "bord", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "pris": 150},
    {"id": "iv-spisebord", "navn": "Spisebord med lysestage", "k": "bord", "felter": [2, 1], "ankre": [[222, 362], [126, 362], [222, 362], [126, 362]], "pris": 150},
    {"id": "iv-rundt-bord", "navn": "Rundt cafébord", "k": "bord", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "pris": 150},
    {"id": "iv-skrivebord", "navn": "Skrivebord", "k": "bord", "felter": [2, 1], "ankre": [[222, 354], [126, 354], [222, 354], [126, 354]], "pris": 150},
    {"id": "iv-konsolbord", "navn": "Konsolbord ved væggen", "k": "bord", "ankre": [[126, 306], [126, 306], [126, 306], [126, 306]], "pris": 150},
    {"id": "iv-barbord", "navn": "Højt barbord", "k": "bord", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "pris": 150},
    {"id": "iv-glasbord", "navn": "Glasbord", "k": "bord", "ankre": [[126, 222], [126, 222], [126, 222], [126, 222]], "pris": 150},
    {"id": "iv-dobbeltseng", "navn": "Dobbeltseng", "k": "seng", "felter": [2, 2], "ankre": [[222, 433], [222, 433], [222, 433], [222, 433]], "pris": 360},
    {"id": "iv-dobbeltseng-creme", "navn": "Dobbeltseng (creme)", "k": "seng", "felter": [2, 2], "ankre": [[222, 433], [222, 433], [222, 433], [222, 433]], "pris": 360},
    {"id": "iv-dobbeltseng-guld", "navn": "Dobbeltseng (guld)", "k": "seng", "felter": [2, 2], "ankre": [[222, 433], [222, 433], [222, 433], [222, 433]], "pris": 380},
    {"id": "iv-enkeltseng", "navn": "Enkeltseng", "k": "seng", "felter": [1, 2], "ankre": [[126, 331], [222, 331], [126, 331], [222, 331]], "pris": 320},
    {"id": "iv-himmelseng", "navn": "Himmelseng", "k": "seng", "felter": [2, 2], "ankre": [[222, 562], [222, 562], [222, 562], [222, 562]], "pris": 480},
    {"id": "iv-natbord", "navn": "Natbord", "k": "seng", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "pris": 320},
    {"id": "iv-koejeseng", "navn": "Køjeseng", "k": "seng", "felter": [1, 2], "ankre": [[126, 461], [222, 461], [126, 461], [222, 461]], "pris": 320},
    {"id": "iv-bogreol", "navn": "Bogreol", "k": "skab", "ankre": [[126, 436], [126, 436], [126, 436], [126, 436]], "pris": 200},
    {"id": "iv-bogreol-bred", "navn": "Bred bogreol med stige", "k": "skab", "felter": [2, 1], "ankre": [[222, 507], [126, 507], [222, 507], [126, 507]], "pris": 200},
    {"id": "iv-klaedeskab", "navn": "Klædeskab", "k": "skab", "felter": [2, 1], "ankre": [[222, 507], [126, 507], [222, 507], [126, 507]], "pris": 200},
    {"id": "iv-kommode", "navn": "Kommode med spejl", "k": "skab", "ankre": [[126, 390], [126, 390], [126, 390], [126, 390]], "pris": 200},
    {"id": "iv-vitrineskab", "navn": "Vitrineskab", "k": "skab", "ankre": [[126, 428], [126, 428], [126, 428], [126, 428]], "pris": 200},
    {"id": "iv-tvbord", "navn": "TV-bord med fladskærm", "k": "skab", "felter": [2, 1], "ankre": [[222, 385], [126, 385], [222, 385], [126, 385]], "pris": 200},
    {"id": "iv-vaeghylde", "navn": "Hylde (væg)", "k": "skab", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 90},
    {"id": "iv-garderobestativ", "navn": "Stumtjener med frakker", "k": "skab", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 200},
    {"id": "iv-arkivskab", "navn": "Arkivskab", "k": "skab", "ankre": [[126, 344], [126, 344], [126, 344], [126, 344]], "pris": 200},
    {"id": "iv-lysekrone", "navn": "Lysekrone", "k": "lampe", "ankre": [[126, 535], [126, 535], [126, 535], [126, 535]], "pris": 380},
    {"id": "iv-gulvlampe", "navn": "Gulvlampe", "k": "lampe", "ankre": [[126, 413], [126, 413], [126, 413], [126, 413]], "pris": 120},
    {"id": "iv-buelampe", "navn": "Buelampe", "k": "lampe", "ankre": [[146, 456], [146, 456], [146, 456], [146, 456]], "pris": 120},
    {"id": "iv-vaeglampe", "navn": "Væglampe", "k": "lampe", "ankre": [[126, 428], [126, 428], [126, 428], [126, 428]], "pris": 120},
    {"id": "iv-kandelaber", "navn": "Kandelaber", "k": "lampe", "ankre": [[126, 398], [126, 398], [126, 398], [126, 398]], "pris": 120},
    {"id": "iv-lanterne", "navn": "Lanterne", "k": "lampe", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "pris": 120},
    {"id": "iv-globuslampe", "navn": "Kuglelampe", "k": "lampe", "ankre": [[126, 352], [126, 352], [126, 352], [126, 352]], "pris": 120},
    {"id": "iv-neon-hjerte", "navn": "Neonhjerte (væg)", "k": "lampe", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 120},
    {"id": "iv-standerlampe", "navn": "Lampe med kvaster", "k": "lampe", "ankre": [[126, 306], [126, 306], [126, 306], [126, 306]], "pris": 120},
    {"id": "iv-monstera", "navn": "Monstera-plante", "k": "plante", "ankre": [[126, 352], [126, 352], [126, 352], [126, 352]], "pris": 90},
    {"id": "iv-palme", "navn": "Stor palme", "k": "plante", "ankre": [[146, 486], [146, 486], [146, 486], [146, 486]], "pris": 160},
    {"id": "iv-oliventrae", "navn": "Oliventræ i guldkrukke", "k": "plante", "ankre": [[126, 405], [126, 405], [126, 405], [126, 405]], "pris": 150},
    {"id": "iv-roser", "navn": "Roser i blomstervase", "k": "plante", "ankre": [[126, 306], [126, 306], [126, 306], [126, 306]], "pris": 90},
    {"id": "iv-kaktus", "navn": "Kaktus", "k": "plante", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "pris": 45},
    {"id": "iv-plantekasse", "navn": "Lang plantekasse", "k": "plante", "felter": [2, 1], "ankre": [[222, 324], [126, 324], [222, 324], [126, 324]], "pris": 90},
    {"id": "iv-buksbom", "navn": "Buksbom-plante", "k": "plante", "ankre": [[126, 375], [126, 375], [126, 375], [126, 375]], "pris": 90},
    {"id": "iv-orkide", "navn": "Orkidé-plante på søjle", "k": "plante", "ankre": [[126, 390], [126, 390], [126, 390], [126, 390]], "pris": 90},
    {"id": "iv-taeppe-orient", "navn": "Orientalsk tæppe", "k": "taeppe", "felter": [3, 2], "ankre": [[318, 282], [222, 282], [318, 282], [222, 282]], "gaa": 1, "pris": 180},
    {"id": "iv-taeppe-stribet", "navn": "Stribet tæppe", "k": "taeppe", "felter": [2, 2], "ankre": [[222, 234], [222, 234], [222, 234], [222, 234]], "gaa": 1, "pris": 110},
    {"id": "iv-taeppe-rundt", "navn": "Rundt tæppe", "k": "taeppe", "felter": [2, 2], "ankre": [[222, 234], [222, 234], [222, 234], [222, 234]], "gaa": 1, "pris": 110},
    {"id": "iv-loeber", "navn": "Løber-tæppe", "k": "taeppe", "felter": [1, 3], "ankre": [[126, 234], [318, 234], [126, 234], [318, 234]], "gaa": 1, "pris": 110},
    {"id": "iv-doermaatte", "navn": "Dørmåtte-tæppe HELLO", "k": "taeppe", "ankre": [[126, 138], [126, 138], [126, 138], [126, 138]], "gaa": 1, "pris": 40},
    {"id": "iv-flise-marmor", "navn": "Gulvflise hvid marmor", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-vinmarmor", "navn": "Gulvflise vinrød marmor", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-skak", "navn": "Gulvflise skakternet", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-guld", "navn": "Gulvflise guldmosaik", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-parket", "navn": "Gulvflise parket", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-creme", "navn": "Gulvflise creme", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-bad", "navn": "Gulvflise badeværelse", "k": "flise", "ankre": [[126, 135], [126, 135], [126, 135], [126, 135]], "gaa": 1, "pris": 25},
    {"id": "iv-flise-stjerne", "navn": "Gulvflise stjerne (stor)", "k": "flise", "felter": [2, 2], "ankre": [[222, 231], [222, 231], [222, 231], [222, 231]], "gaa": 1, "pris": 90},
    {"id": "iv-maleri-landskab", "navn": "Maleri solnedgang", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 80},
    {"id": "iv-maleri-abstrakt", "navn": "Maleri abstrakt", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 80},
    {"id": "iv-maleri-portraet", "navn": "Maleri portræt", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 80},
    {"id": "iv-plakat-vera", "navn": "Plakat HELLO VERA", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 50},
    {"id": "iv-plakat-film", "navn": "Plakat Vera Cinema", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 50},
    {"id": "iv-plakat-radio", "navn": "Plakat Vera Radio", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 50},
    {"id": "iv-billedvaeg", "navn": "Billedvæg med 4 billeder", "k": "billede", "ankre": [[126, 428], [126, 428], [126, 428], [126, 428]], "pris": 80},
    {"id": "iv-spejl", "navn": "Guldspejl (væg)", "k": "billede", "ankre": [[126, 436], [126, 436], [126, 436], [126, 436]], "pris": 80},
    {"id": "iv-vaegur", "navn": "Vægur", "k": "billede", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 80},
    {"id": "iv-reception", "navn": "Receptionsdisk", "k": "disk", "felter": [2, 1], "ankre": [[222, 400], [126, 400], [222, 400], [126, 400]], "pris": 450},
    {"id": "iv-bardisk", "navn": "Bardisk med flasker", "k": "disk", "felter": [2, 1], "ankre": [[222, 408], [126, 408], [222, 408], [126, 408]], "pris": 420},
    {"id": "iv-kassedisk", "navn": "Butiksdisk med kasse", "k": "disk", "ankre": [[126, 352], [126, 352], [126, 352], [126, 352]], "pris": 300},
    {"id": "iv-vagtpult", "navn": "Vagtpult", "k": "disk", "ankre": [[126, 329], [126, 329], [126, 329], [126, 329]], "pris": 300},
    {"id": "iv-noeglebraet", "navn": "Nøglebræt (væg)", "k": "disk", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 300},
    {"id": "iv-rebstolpe", "navn": "Afspærring med reb", "k": "disk", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "pris": 300},
    {"id": "iv-infoskilt", "navn": "Velkomstskilt", "k": "disk", "ankre": [[126, 367], [126, 367], [126, 367], [126, 367]], "pris": 300},
    {"id": "iv-kufferter", "navn": "Kufferter", "k": "disk", "ankre": [[126, 245], [126, 245], [126, 245], [126, 245]], "pris": 300},
    {"id": "iv-scene", "navn": "Lille scene med forhæng", "k": "scene", "felter": [2, 2], "ankre": [[222, 593], [222, 593], [222, 593], [222, 593]], "pris": 400},
    {"id": "iv-retromikrofon", "navn": "Retro-mikrofon", "k": "scene", "ankre": [[126, 390], [126, 390], [126, 390], [126, 390]], "pris": 260},
    {"id": "iv-hoejttaler", "navn": "Stor højttaler", "k": "scene", "ankre": [[126, 329], [126, 329], [126, 329], [126, 329]], "pris": 260},
    {"id": "iv-dj-pult", "navn": "DJ-pult", "k": "scene", "felter": [2, 1], "ankre": [[222, 377], [126, 377], [222, 377], [126, 377]], "pris": 380},
    {"id": "iv-klaver", "navn": "Klaver", "k": "scene", "felter": [2, 1], "ankre": [[222, 408], [126, 408], [222, 408], [126, 408]], "pris": 450},
    {"id": "iv-jukebox", "navn": "Jukebox", "k": "scene", "ankre": [[126, 375], [126, 375], [126, 375], [126, 375]], "pris": 380},
    {"id": "iv-spotlight", "navn": "Spotlight-lampe", "k": "scene", "ankre": [[126, 375], [126, 375], [126, 375], [126, 375]], "pris": 260},
    {"id": "iv-radio-retro", "navn": "Gammel radio", "k": "scene", "ankre": [[126, 283], [126, 283], [126, 283], [126, 283]], "pris": 260},
    {"id": "iv-grammofon", "navn": "Grammofon", "k": "scene", "ankre": [[126, 375], [126, 375], [126, 375], [126, 375]], "pris": 260},
    {"id": "iv-koekkenbord", "navn": "Køkkenbord med vask", "k": "koekken", "felter": [2, 1], "ankre": [[222, 430], [126, 430], [222, 430], [126, 430]], "pris": 240},
    {"id": "iv-komfur", "navn": "Komfur", "k": "koekken", "ankre": [[126, 375], [126, 375], [126, 375], [126, 375]], "pris": 240},
    {"id": "iv-koeleskab", "navn": "Retro-køleskab", "k": "koekken", "ankre": [[126, 413], [126, 413], [126, 413], [126, 413]], "pris": 240},
    {"id": "iv-badekar", "navn": "Badekar med skum", "k": "koekken", "felter": [2, 1], "ankre": [[222, 331], [126, 331], [222, 331], [126, 331]], "pris": 350},
    {"id": "iv-haandvask", "navn": "Håndvask med spejl", "k": "koekken", "ankre": [[126, 413], [126, 413], [126, 413], [126, 413]], "pris": 240},
    {"id": "iv-toilet", "navn": "Toilet", "k": "koekken", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "saede": 30, "pris": 240},
    {"id": "iv-bruser", "navn": "Brusekabine", "k": "koekken", "ankre": [[126, 444], [126, 444], [126, 444], [126, 444]], "pris": 240},
    {"id": "iv-haandklaeder", "navn": "Håndklædestativ", "k": "koekken", "ankre": [[126, 306], [126, 306], [126, 306], [126, 306]], "pris": 240},
    {"id": "iv-gulvvase", "navn": "Stor gulvvase", "k": "pynt", "ankre": [[126, 382], [126, 382], [126, 382], [126, 382]], "pris": 150},
    {"id": "iv-buste", "navn": "Marmorbuste på sokkel", "k": "pynt", "ankre": [[126, 390], [126, 390], [126, 390], [126, 390]], "pris": 150},
    {"id": "iv-urne", "navn": "Guldurne på søjle", "k": "pynt", "ankre": [[126, 390], [126, 390], [126, 390], [126, 390]], "pris": 150},
    {"id": "iv-pejs", "navn": "Marmorpejs med ild", "k": "pynt", "felter": [2, 1], "ankre": [[222, 476], [126, 476], [222, 476], [126, 476]], "pris": 400},
    {"id": "iv-guldhjerte", "navn": "Guldhjerte på sokkel", "k": "pynt", "ankre": [[126, 329], [126, 329], [126, 329], [126, 329]], "pris": 150},
    {"id": "iv-akvarium", "navn": "Akvarium", "k": "pynt", "felter": [2, 1], "ankre": [[222, 392], [126, 392], [222, 392], [126, 392]], "pris": 350},
    {"id": "iv-fuglebur", "navn": "Fuglebur", "k": "pynt", "ankre": [[126, 398], [126, 398], [126, 398], [126, 398]], "pris": 150},
    {"id": "iv-paraplystativ", "navn": "Paraplystativ", "k": "pynt", "ankre": [[126, 298], [126, 298], [126, 298], [126, 298]], "pris": 150},
    {"id": "iv-standur", "navn": "Standur", "k": "pynt", "ankre": [[126, 466], [126, 466], [126, 466], [126, 466]], "pris": 260},
    {"id": "iv-globus", "navn": "Globus", "k": "pynt", "ankre": [[126, 306], [126, 306], [126, 306], [126, 306]], "pris": 150},
    {"id": "iv-paravent", "navn": "Skillevæg (foldeskærm)", "k": "vaeg", "felter": [2, 1], "ankre": [[222, 461], [126, 461], [222, 461], [126, 461]], "pris": 60},
    {"id": "iv-paravent-creme", "navn": "Skillevæg (foldeskærm) (creme)", "k": "vaeg", "felter": [2, 1], "ankre": [[222, 461], [126, 461], [222, 461], [126, 461]], "pris": 60},
    {"id": "iv-paravent-guld", "navn": "Skillevæg (foldeskærm) (guld)", "k": "vaeg", "felter": [2, 1], "ankre": [[222, 461], [126, 461], [222, 461], [126, 461]], "pris": 80},
    {"id": "iv-vaeg-vin", "navn": "Vægstykke vinrød", "k": "vaeg", "ankre": [[126, 497], [126, 497], [126, 497], [126, 497]], "pris": 60},
    {"id": "iv-vaeg-creme", "navn": "Vægstykke creme", "k": "vaeg", "ankre": [[126, 497], [126, 497], [126, 497], [126, 497]], "pris": 60},
    {"id": "iv-vaeg-vindue", "navn": "Vægstykke med vindue", "k": "vaeg", "ankre": [[126, 497], [126, 497], [126, 497], [126, 497]], "pris": 60},
    {"id": "iv-vaeg-bue", "navn": "Buegang", "k": "vaeg", "ankre": [[126, 497], [126, 497], [126, 497], [126, 497]], "pris": 60},
    {"id": "iv-soejle", "navn": "Marmorsøjle", "k": "vaeg", "ankre": [[126, 489], [126, 489], [126, 489], [126, 489]], "pris": 110},
    {"id": "iv-glasvaeg", "navn": "Glasvæg", "k": "vaeg", "felter": [2, 1], "ankre": [[222, 514], [126, 514], [222, 514], [126, 514]], "pris": 120},
    {"id": "iv-haekvaeg", "navn": "Hækplante i kasse", "k": "vaeg", "felter": [2, 1], "ankre": [[222, 415], [126, 415], [222, 415], [126, 415]], "pris": 60},
    {"id": "iv-gardin", "navn": "Gardiner (væg)", "k": "vaeg", "ankre": [[126, 482], [126, 482], [126, 482], [126, 482]], "pris": 60}
  ];

  function vent(klar, goer, n) {
    n = n || 0;
    if (klar()) { goer(); return; }
    if (n > 400) return;
    setTimeout(function () { vent(klar, goer, n + 1); }, 100);
  }

  // ----- møblerne ind i kataloget -----
  const typer = [];
  vent(function () {
    return typeof MOEBEL_TYPER !== "undefined" && typeof MOEBLER !== "undefined" && typeof forberedRetninger === "function";
  }, function () {
    IV_MOEBLER.forEach(function (d) {
      if (MOEBEL_TYPER[d.id]) { typer.push(MOEBEL_TYPER[d.id]); return; }
      const t = {
        id: d.id, navn: d.navn, kategori: IV_GRUPPER[d.k].navn, skala: 0.5, ankre: d.ankre, indretning: d.k,
        retninger: [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + d.id + "/" + d.id + "-" + i + ".png?r=1"; }),
      };
      if (d.felter) t.felter = d.felter;
      if (d.saede) { t.saede = d.saede; t.centrer = true; }
      if (d.gaa) t.kanGaaPaa = true;
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
      typer.push(t);
    });
    prisIShop();
    vent(function () { return typeof SHOP_KAT !== "undefined" && typeof KAT_IKON !== "undefined"; }, iShoppen);
  });

  // ----- priser (Glimt) -----
  function prisIShop() {
    vent(function () { return typeof pris === "function"; }, function () {
      if (typeof HOTEL_MOEBEL_PRISER !== "undefined") {
        IV_MOEBLER.forEach(function (d) { HOTEL_MOEBEL_PRISER[d.id] = d.pris; });
        return;
      }
      const prisFoerIndretning = pris;
      const p = {};
      IV_MOEBLER.forEach(function (d) { p[d.id] = d.pris; });
      pris = function (type) {
        if (type && p[type.id]) return { stella: false, beloeb: p[type.id] };
        return prisFoerIndretning(type);
      };
    });
  }

  // ----- egne faner i Shoppen -----
  function iShoppen() {
    const efter = SHOP_KAT.findIndex(function (k) { return k.navn === "Siddepladser"; });
    let plads = efter >= 0 ? efter + 1 : SHOP_KAT.length;
    Object.keys(IV_GRUPPER).forEach(function (g) {
      const gr = IV_GRUPPER[g];
      KAT_IKON[gr.navn] = gr.ikon;
      const ting = typer.filter(function (t) { return t.indretning === g; });
      if (!ting.length) return;
      let kat = SHOP_KAT.find(function (k) { return k.navn === gr.navn; });
      if (kat) {
        ting.forEach(function (t) { if (kat.ting.indexOf(t) < 0) kat.ting.push(t); });
      } else {
        kat = { navn: gr.navn, ikon: gr.ikon, ting: ting.slice() };
        SHOP_KAT.splice(plads, 0, kat);
      }
      plads = SHOP_KAT.indexOf(kat) + 1;
    });
    const sid = SHOP_KAT.find(function (k) { return k.navn === "Siddepladser"; });
    if (sid) typer.forEach(function (t) { if (t.saede && sid.ting.indexOf(t) < 0) sid.ting.push(t); });
    // det første møbel fra hver gruppe øverst under "Nyt"
    const nyt = SHOP_KAT.find(function (k) { return k.navn === "Nyt"; });
    if (nyt) {
      Object.keys(IV_GRUPPER).reverse().forEach(function (g) {
        const t = typer.find(function (x) { return x.indretning === g; });
        if (t && nyt.ting.indexOf(t) < 0) nyt.ting.unshift(t);
      });
    }
    if (typeof shopVindue !== "undefined" && !shopVindue.hidden && typeof visShop === "function") visShop();
  }
})();
