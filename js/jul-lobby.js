// =============================================================
//  🎄 JULETEMA I LOBBYEN (18/11-2026)
//
//  - 24 nye julemøbler i vinrød, guld, creme og grangrønt (4 retninger, 3D-tegnet):
//    juletræer, gaver, kranse, girlander, lyskæder, julestrømper, julepejs, nisser,
//    rensdyr, kane, snemand, stjerner, adventskrans, lysestage, julebord m.m.
//    De kan købes i Shoppen under fanen 🎄 Jul og stilles med 🔨 Byggetilstand.
//    Ejeren har dem gratis i Byggetilstand (som alle andre møbler).
//  - Velkomsthallen får en fyldig juleindretning (142 møbler) med julemøblerne
//    og indretningsmøblerne (iv-*). Gangene, elevatoren og indgangen er holdt fri.
//  - Ejerpanel → ⚙️ System → 🎄 Juletema: tænd og sluk juletemaet.
//    Tænd: lobbyen, som den er nu, gemmes på denne computer, og juleindretningen
//    stilles op for alle. Sluk: den gemte lobby sættes tilbage (ellers hotellets
//    almindelige lobby). Man kan stadig flytte alt med 🔨 Byggetilstand.
//  - Første gang ejeren åbner hotellet med denne fil, tændes juletemaet af sig selv (én gang).
//  - Billederne: billeder/moebler/<id>/<id>-0..3.png (skala 0.5).
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.)
// =============================================================
(function () {
  const JUL_MOEBLER = [
    {"id": "jul-trae-stort", "navn": "Stort juletræ med gaver", "felter": [2, 2], "ankre": [[222, 662], [222, 662], [222, 662], [222, 662]], "pris": 600},
    {"id": "jul-trae", "navn": "Juletræ i guldkrukke", "ankre": [[126, 436], [126, 436], [126, 436], [126, 436]], "pris": 220},
    {"id": "jul-trae-sne", "navn": "Snedækket gran med lys", "ankre": [[126, 436], [126, 436], [126, 436], [126, 436]], "pris": 200},
    {"id": "jul-gaver", "navn": "Bunke julegaver", "ankre": [[126, 245], [126, 245], [126, 245], [126, 245]], "pris": 120},
    {"id": "jul-gave-stor", "navn": "Kæmpe julegave", "ankre": [[126, 260], [126, 260], [126, 260], [126, 260]], "pris": 150},
    {"id": "jul-krans", "navn": "Julekrans (væg)", "ankre": [[126, 421], [126, 421], [126, 421], [126, 421]], "pris": 90},
    {"id": "jul-guirlande", "navn": "Grangirlande med lys (væg)", "felter": [2, 1], "ankre": [[222, 514], [126, 514], [222, 514], [126, 514]], "pris": 110},
    {"id": "jul-lyskaede", "navn": "Lyskæde (væg)", "felter": [2, 1], "ankre": [[222, 514], [126, 514], [222, 514], [126, 514]], "pris": 90},
    {"id": "jul-stroemper", "navn": "Julestrømper (væg)", "ankre": [[126, 360], [126, 360], [126, 360], [126, 360]], "pris": 80},
    {"id": "jul-pejs", "navn": "Julepejs med strømper", "felter": [2, 1], "ankre": [[222, 484], [126, 484], [222, 484], [126, 484]], "pris": 450},
    {"id": "jul-nisse", "navn": "Nisse", "ankre": [[126, 321], [126, 321], [126, 321], [126, 321]], "pris": 160},
    {"id": "jul-rensdyr", "navn": "Rensdyr", "felter": [2, 1], "ankre": [[222, 461], [126, 461], [222, 461], [126, 461]], "pris": 350},
    {"id": "jul-kane", "navn": "Julekane med gaver", "felter": [2, 1], "ankre": [[222, 369], [126, 369], [222, 369], [126, 369]], "pris": 500},
    {"id": "jul-snemand", "navn": "Snemand", "ankre": [[126, 360], [126, 360], [126, 360], [126, 360]], "pris": 180},
    {"id": "jul-stjerne", "navn": "Julestjerne på stander", "ankre": [[126, 405], [126, 405], [126, 405], [126, 405]], "pris": 140},
    {"id": "jul-stjerne-vaeg", "navn": "Lysende stjerne (væg)", "ankre": [[126, 436], [126, 436], [126, 436], [126, 436]], "pris": 100},
    {"id": "jul-adventskrans", "navn": "Adventskrans på bord", "ankre": [[126, 291], [126, 291], [126, 291], [126, 291]], "pris": 130},
    {"id": "jul-lysestage", "navn": "Lysestage i guld", "ankre": [[126, 382], [126, 382], [126, 382], [126, 382]], "pris": 150},
    {"id": "jul-julebord", "navn": "Dækket julebord", "felter": [2, 1], "ankre": [[222, 362], [126, 362], [222, 362], [126, 362]], "pris": 380},
    {"id": "jul-slikstokke", "navn": "Slikstok-bue", "ankre": [[126, 352], [126, 352], [126, 352], [126, 352]], "pris": 110},
    {"id": "jul-julestjerne", "navn": "Julestjerne-plante", "ankre": [[126, 230], [126, 230], [126, 230], [126, 230]], "pris": 60},
    {"id": "jul-lanterne", "navn": "Julelanterne", "ankre": [[126, 276], [126, 276], [126, 276], [126, 276]], "pris": 90},
    {"id": "jul-taeppe", "navn": "Juletæppe", "felter": [3, 2], "ankre": [[318, 282], [222, 282], [318, 282], [222, 282]], "gaa": 1, "pris": 180},
    {"id": "jul-snedrive", "navn": "Sne på gulvet", "felter": [2, 2], "ankre": [[222, 234], [222, 234], [222, 234], [222, 234]], "gaa": 1, "pris": 40}
  ];

  // Juleindretningen af velkomsthallen (24 x 24 felter). retning 0-3 som i Byggetilstand.
  const JUL_HAL = [
    {"type": "jul-trae-sne", "x": 0, "y": 0, "retning": 0},
    {"type": "jul-guirlande", "x": 1, "y": 0, "retning": 0},
    {"type": "jul-pejs", "x": 3, "y": 0, "retning": 0},
    {"type": "jul-lysestage", "x": 5, "y": 0, "retning": 0},
    {"type": "jul-lyskaede", "x": 6, "y": 0, "retning": 0},
    {"type": "jul-krans", "x": 8, "y": 0, "retning": 0},
    {"type": "jul-trae", "x": 9, "y": 0, "retning": 0},
    {"type": "jul-trae", "x": 13, "y": 0, "retning": 0},
    {"type": "jul-stjerne-vaeg", "x": 14, "y": 0, "retning": 0},
    {"type": "iv-noeglebraet", "x": 15, "y": 0, "retning": 0},
    {"type": "jul-krans", "x": 16, "y": 0, "retning": 0},
    {"type": "iv-vaegur", "x": 17, "y": 0, "retning": 0},
    {"type": "jul-trae", "x": 18, "y": 0, "retning": 0},
    {"type": "jul-lyskaede", "x": 19, "y": 0, "retning": 0},
    {"type": "jul-stroemper", "x": 21, "y": 0, "retning": 0},
    {"type": "jul-trae-sne", "x": 22, "y": 0, "retning": 0},
    {"type": "jul-nisse", "x": 23, "y": 0, "retning": 0},
    {"type": "jul-taeppe", "x": 2, "y": 1, "retning": 0},
    {"type": "iv-laenestol", "x": 2, "y": 3, "retning": 2},
    {"type": "iv-sidebord", "x": 3, "y": 3, "retning": 0},
    {"type": "iv-laenestol", "x": 4, "y": 3, "retning": 2},
    {"type": "iv-puf", "x": 5, "y": 2, "retning": 0},
    {"type": "jul-gaver", "x": 6, "y": 2, "retning": 0},
    {"type": "jul-julestjerne", "x": 5, "y": 1, "retning": 0},
    {"type": "iv-loeber", "x": 11, "y": 1, "retning": 0},
    {"type": "iv-loeber", "x": 11, "y": 4, "retning": 0},
    {"type": "jul-stjerne", "x": 9, "y": 2, "retning": 0},
    {"type": "jul-stjerne", "x": 13, "y": 2, "retning": 0},
    {"type": "jul-gave-stor", "x": 9, "y": 1, "retning": 0},
    {"type": "jul-gaver", "x": 13, "y": 1, "retning": 0},
    {"type": "real-reception", "x": 15, "y": 3, "retning": 0},
    {"type": "jul-gaver", "x": 14, "y": 3, "retning": 0},
    {"type": "jul-julestjerne", "x": 18, "y": 3, "retning": 0},
    {"type": "real-kuffertvogn", "x": 19, "y": 4, "retning": 0},
    {"type": "iv-infoskilt", "x": 14, "y": 4, "retning": 0},
    {"type": "iv-kontorstol", "x": 16, "y": 2, "retning": 0},
    {"type": "jul-nisse", "x": 0, "y": 1, "retning": 1},
    {"type": "jul-stroemper", "x": 0, "y": 2, "retning": 1},
    {"type": "iv-bogreol", "x": 0, "y": 3, "retning": 1},
    {"type": "jul-julestjerne", "x": 0, "y": 4, "retning": 1},
    {"type": "jul-guirlande", "x": 0, "y": 10, "retning": 1},
    {"type": "real-reol", "x": 0, "y": 12, "retning": 1},
    {"type": "real-reol", "x": 0, "y": 13, "retning": 1},
    {"type": "iv-standerlampe", "x": 0, "y": 14, "retning": 1},
    {"type": "real-plante", "x": 0, "y": 15, "retning": 1},
    {"type": "iv-bogreol-bred", "x": 0, "y": 16, "retning": 1},
    {"type": "jul-trae", "x": 0, "y": 18, "retning": 1},
    {"type": "jul-lyskaede", "x": 0, "y": 19, "retning": 1},
    {"type": "jul-stroemper", "x": 0, "y": 21, "retning": 1},
    {"type": "jul-trae-sne", "x": 0, "y": 22, "retning": 1},
    {"type": "jul-nisse", "x": 0, "y": 23, "retning": 1},
    {"type": "iv-taeppe-rundt", "x": 1, "y": 12, "retning": 0},
    {"type": "real-laenestol", "x": 2, "y": 12, "retning": 1},
    {"type": "real-laenestol", "x": 2, "y": 14, "retning": 1},
    {"type": "real-sofabord", "x": 3, "y": 13, "retning": 0},
    {"type": "jul-lanterne", "x": 3, "y": 12, "retning": 0},
    {"type": "iv-flise-stjerne", "x": 11, "y": 8, "retning": 0},
    {"type": "jul-snedrive", "x": 9, "y": 7, "retning": 0},
    {"type": "jul-snedrive", "x": 13, "y": 8, "retning": 0},
    {"type": "jul-trae-stort", "x": 11, "y": 8, "retning": 0},
    {"type": "jul-gaver", "x": 10, "y": 9, "retning": 0},
    {"type": "jul-gaver", "x": 13, "y": 8, "retning": 0},
    {"type": "jul-gave-stor", "x": 13, "y": 9, "retning": 0},
    {"type": "jul-gaver", "x": 11, "y": 10, "retning": 0},
    {"type": "iv-rebstolpe", "x": 9, "y": 8, "retning": 0},
    {"type": "iv-rebstolpe", "x": 14, "y": 10, "retning": 0},
    {"type": "iv-rebstolpe", "x": 9, "y": 10, "retning": 0},
    {"type": "iv-rebstolpe", "x": 14, "y": 7, "retning": 0},
    {"type": "jul-stjerne", "x": 10, "y": 6, "retning": 0},
    {"type": "jul-stjerne", "x": 13, "y": 6, "retning": 0},
    {"type": "iv-taeppe-orient", "x": 5, "y": 11, "retning": 0},
    {"type": "iv-chesterfield", "x": 5, "y": 10, "retning": 0},
    {"type": "iv-sofabord", "x": 5, "y": 12, "retning": 0},
    {"type": "iv-chesterfield", "x": 5, "y": 13, "retning": 2},
    {"type": "iv-laenestol-creme", "x": 7, "y": 12, "retning": 3},
    {"type": "iv-gulvlampe", "x": 4, "y": 10, "retning": 0},
    {"type": "jul-adventskrans", "x": 7, "y": 11, "retning": 0},
    {"type": "jul-trae", "x": 4, "y": 14, "retning": 0},
    {"type": "real-taeppe", "x": 10, "y": 13, "retning": 0},
    {"type": "real-sofa", "x": 10, "y": 12, "retning": 0},
    {"type": "real-sofa", "x": 11, "y": 15, "retning": 2},
    {"type": "real-laenestol", "x": 9, "y": 13, "retning": 1},
    {"type": "real-laenestol", "x": 13, "y": 14, "retning": 3},
    {"type": "jul-adventskrans", "x": 11, "y": 13, "retning": 0},
    {"type": "real-gulvlampe", "x": 9, "y": 12, "retning": 0},
    {"type": "real-gulvlampe", "x": 13, "y": 15, "retning": 0},
    {"type": "real-flygel", "x": 20, "y": 8, "retning": 0},
    {"type": "jul-lysestage", "x": 22, "y": 8, "retning": 0},
    {"type": "iv-spisestol-guld", "x": 19, "y": 9, "retning": 1},
    {"type": "jul-trae", "x": 22, "y": 10, "retning": 0},
    {"type": "jul-julestjerne", "x": 20, "y": 10, "retning": 0},
    {"type": "iv-sofa3", "x": 16, "y": 11, "retning": 0},
    {"type": "iv-sofabord", "x": 16, "y": 12, "retning": 0},
    {"type": "iv-sidebord", "x": 18, "y": 12, "retning": 0},
    {"type": "jul-gaver", "x": 15, "y": 11, "retning": 0},
    {"type": "iv-taeppe-orient", "x": 17, "y": 15, "retning": 0},
    {"type": "real-sofa", "x": 18, "y": 14, "retning": 0},
    {"type": "real-sofabord", "x": 18, "y": 16, "retning": 0},
    {"type": "real-sofabord", "x": 19, "y": 16, "retning": 0},
    {"type": "real-laenestol", "x": 20, "y": 16, "retning": 3},
    {"type": "real-laenestol", "x": 17, "y": 16, "retning": 1},
    {"type": "real-gulvlampe", "x": 20, "y": 14, "retning": 0},
    {"type": "jul-trae", "x": 21, "y": 14, "retning": 0},
    {"type": "jul-julestjerne", "x": 17, "y": 14, "retning": 0},
    {"type": "iv-bardisk", "x": 21, "y": 18, "retning": 0},
    {"type": "iv-barstol", "x": 21, "y": 19, "retning": 0},
    {"type": "iv-barstol", "x": 22, "y": 19, "retning": 0},
    {"type": "jul-lanterne", "x": 23, "y": 18, "retning": 0},
    {"type": "real-springvand", "x": 11, "y": 18, "retning": 0},
    {"type": "jul-snedrive", "x": 10, "y": 17, "retning": 0},
    {"type": "real-baenk", "x": 9, "y": 18, "retning": 1},
    {"type": "real-baenk", "x": 13, "y": 18, "retning": 3},
    {"type": "jul-snemand", "x": 10, "y": 20, "retning": 0},
    {"type": "jul-snemand", "x": 13, "y": 20, "retning": 0},
    {"type": "jul-julebord", "x": 4, "y": 19, "retning": 0},
    {"type": "iv-spisestol", "x": 4, "y": 18, "retning": 0},
    {"type": "iv-spisestol", "x": 5, "y": 18, "retning": 0},
    {"type": "iv-spisestol", "x": 4, "y": 20, "retning": 2},
    {"type": "iv-spisestol", "x": 5, "y": 20, "retning": 2},
    {"type": "jul-julebord", "x": 6, "y": 22, "retning": 0},
    {"type": "iv-spisestol", "x": 6, "y": 21, "retning": 0},
    {"type": "iv-spisestol", "x": 7, "y": 21, "retning": 0},
    {"type": "iv-spisestol", "x": 6, "y": 23, "retning": 2},
    {"type": "iv-spisestol", "x": 7, "y": 23, "retning": 2},
    {"type": "jul-lysestage", "x": 3, "y": 18, "retning": 0},
    {"type": "jul-julestjerne", "x": 8, "y": 22, "retning": 0},
    {"type": "jul-snedrive", "x": 15, "y": 20, "retning": 0},
    {"type": "jul-snedrive", "x": 18, "y": 21, "retning": 0},
    {"type": "jul-kane", "x": 15, "y": 21, "retning": 0},
    {"type": "jul-rensdyr", "x": 17, "y": 21, "retning": 0},
    {"type": "jul-rensdyr", "x": 19, "y": 21, "retning": 0},
    {"type": "jul-gaver", "x": 15, "y": 22, "retning": 0},
    {"type": "jul-gave-stor", "x": 21, "y": 22, "retning": 0},
    {"type": "jul-slikstokke", "x": 14, "y": 21, "retning": 0},
    {"type": "jul-nisse", "x": 17, "y": 23, "retning": 0},
    {"type": "jul-trae-sne", "x": 23, "y": 23, "retning": 0},
    {"type": "jul-slikstokke", "x": 23, "y": 13, "retning": 0},
    {"type": "jul-lanterne", "x": 8, "y": 16, "retning": 0},
    {"type": "jul-lanterne", "x": 15, "y": 16, "retning": 0},
    {"type": "jul-trae", "x": 3, "y": 8, "retning": 0},
    {"type": "jul-nisse", "x": 8, "y": 14, "retning": 0},
    {"type": "jul-gaver", "x": 3, "y": 16, "retning": 0}
  ];

  const NOEGLE_BACKUP = "mit-hotel-jul-hal-foer";        // lobbyen fra før juletemaet blev tændt
  const NOEGLE_AUTO = "mit-hotel-jul-lobby-auto-1";       // juletemaet er tændt af sig selv én gang
  const NOEGLE_LOKAL = "mit-hotel-jul-lobby";             // "til"/"fra" når der ikke er en server
  const FANE = "juletema";

  function vent(klar, goer, n) {
    n = n || 0;
    let ok = false;
    try { ok = klar(); } catch (e) { ok = false; }
    if (ok) { goer(); return; }
    if (n > 600) return;
    setTimeout(function () { vent(klar, goer, n + 1); }, 100);
  }
  function hentL(n) { try { return localStorage.getItem(n); } catch (e) { return null; } }
  function gemL(n, v) { try { localStorage.setItem(n, v); } catch (e) {} }
  function erEjer() { return typeof EJERE !== "undefined" && typeof FIGUR !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }
  function medServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function julData() { return JUL_HAL.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning || 0 }; }); }
  function halData() {
    const liste = (typeof HAL_MOEBLER !== "undefined" ? HAL_MOEBLER : []).concat((typeof VENTENDE_MOEBLER !== "undefined" && VENTENDE_MOEBLER.hal) || []);
    return liste.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: !!m.spejlet, retning: m.retning || 0 }; });
  }
  function antalJul(liste) { return liste.filter(function (m) { return String(m.type).indexOf("jul-") === 0; }).length; }
  function juletemaTaendt() { return antalJul(halData()) >= 10; }

  // ----- julemøblerne ind i kataloget -----
  const typer = [];
  vent(function () {
    return typeof MOEBEL_TYPER !== "undefined" && typeof MOEBLER !== "undefined" && typeof forberedRetninger === "function";
  }, function () {
    JUL_MOEBLER.forEach(function (d) {
      if (MOEBEL_TYPER[d.id]) { typer.push(MOEBEL_TYPER[d.id]); return; }
      const t = {
        id: d.id, navn: d.navn, kategori: "Jul", skala: 0.5, ankre: d.ankre, jul: true,
        retninger: [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + d.id + "/" + d.id + "-" + i + ".png?r=1"; }),
      };
      if (d.felter) t.felter = d.felter;
      if (d.gaa) t.kanGaaPaa = true;
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
      typer.push(t);
    });
    priser();
    vent(function () { return typeof SHOP_KAT !== "undefined" && typeof KAT_IKON !== "undefined"; }, iShoppen);
  });

  function priser() {
    vent(function () { return typeof pris === "function"; }, function () {
      if (typeof HOTEL_MOEBEL_PRISER !== "undefined") {
        JUL_MOEBLER.forEach(function (d) { HOTEL_MOEBEL_PRISER[d.id] = d.pris; });
        return;
      }
      const prisFoerJul = pris;
      const p = {};
      JUL_MOEBLER.forEach(function (d) { p[d.id] = d.pris; });
      pris = function (type) {
        if (type && p[type.id]) return { stella: false, beloeb: p[type.id] };
        return prisFoerJul(type);
      };
    });
  }

  function iShoppen() {
    KAT_IKON["Jul"] = "🎄";
    let kat = SHOP_KAT.find(function (k) { return k.navn === "Jul"; });
    if (!kat) {
      kat = { navn: "Jul", ikon: "🎄", ting: [] };
      const nytI = SHOP_KAT.findIndex(function (k) { return k.navn === "Nyt"; });
      SHOP_KAT.splice(nytI >= 0 ? nytI + 1 : 0, 0, kat);
    }
    typer.forEach(function (t) { if (kat.ting.indexOf(t) < 0) kat.ting.push(t); });
    const nyt = SHOP_KAT.find(function (k) { return k.navn === "Nyt"; });
    if (nyt) ["jul-trae", "jul-nisse", "jul-gaver"].reverse().forEach(function (id) {
      const t = MOEBEL_TYPER[id];
      if (t && nyt.ting.indexOf(t) < 0) nyt.ting.unshift(t);
    });
    if (typeof shopVindue !== "undefined" && !shopVindue.hidden && typeof visShop === "function") visShop();
  }

  // -----------------------------------------------------------
  //  Stil møbler op i hallen (for alle, når der er en server)
  // -----------------------------------------------------------
  function brug(data) {
    if (typeof brugMoebler === "function") brugMoebler("hal", data);
    else {
      HAL_MOEBLER.length = 0;
      data.filter(function (d) { return MOEBEL_TYPER[d.type]; }).forEach(function (d) { HAL_MOEBLER.push(d); });
    }
    if (typeof sendRum === "function" && medServer() && typeof kanBygge === "function" && kanBygge() && typeof byggeHentet !== "undefined" && byggeHentet) {
      sendRum("hal", HAL_MOEBLER);
    }
  }
  function taend() {
    if (!juletemaTaendt()) gemL(NOEGLE_BACKUP, JSON.stringify(halData()));
    brug(julData());
    gemL(NOEGLE_LOKAL, "til");
    if (typeof besked !== "undefined" && besked) besked.textContent = "🎄 Juletemaet er tændt i velkomsthallen!";
  }
  function sluk() {
    let foer = null;
    try { foer = JSON.parse(hentL(NOEGLE_BACKUP) || "null"); } catch (e) { foer = null; }
    if (!Array.isArray(foer) || !foer.length || antalJul(foer) >= 10) {
      foer = typeof realHalData === "function" ? realHalData() : [];
    }
    brug(foer);
    gemL(NOEGLE_LOKAL, "fra");
    if (typeof besked !== "undefined" && besked) besked.textContent = "☀️ Juletemaet er slukket. Lobbyen er sat tilbage.";
  }
  window.julLobbyTaend = taend;
  window.julLobbySluk = sluk;

  // Typerne skal være kendt, før lobbyen stilles op (ellers venter møblerne lidt i VENTENDE_MOEBLER)
  function typerKlar() {
    return typeof MOEBEL_TYPER !== "undefined" && !!MOEBEL_TYPER["jul-trae"] && !!MOEBEL_TYPER["iv-chesterfield"] && !!MOEBEL_TYPER["real-sofa"];
  }
  const start = Date.now();
  vent(function () {
    if (!typerKlar() || typeof HAL_MOEBLER === "undefined") return false;
    if (medServer()) return (typeof byggeHentet !== "undefined" && byggeHentet) || Date.now() - start > 12000;
    return true;
  }, function () {
    const hentetFraServer = medServer() && typeof byggeHentet !== "undefined" && byggeHentet;
    if (hentetFraServer) {
      // ejeren: tænd juletemaet af sig selv første gang (kun i november og december)
      const md = new Date().getMonth();
      if (erEjer() && !hentL(NOEGLE_AUTO) && (md === 10 || md === 11)) {
        gemL(NOEGLE_AUTO, "1");
        if (!juletemaTaendt()) taend();
      }
    } else if (hentL(NOEGLE_LOKAL) !== "fra") {
      // ingen server: alle ser juleindretningen (kan slukkes i Ejerpanelet)
      brug(julData());
    }
  });

  // -----------------------------------------------------------
  //  Ejerpanel → ⚙️ System → 🎄 Juletema
  // -----------------------------------------------------------
  vent(function () { return document.getElementById("ejer-faner") && typeof visFane === "function" && typeof ejerIndhold !== "undefined"; }, function () {
    const fane = document.createElement("button");
    fane.type = "button";
    fane.dataset.fane = FANE;
    fane.textContent = "🎄 Juletema";
    fane.addEventListener("click", function () { ejerFane = FANE; visFane(); });
    document.getElementById("ejer-faner").appendChild(fane);
    fane.hidden = !erEjer();
    setInterval(function () { fane.hidden = !erEjer(); }, 1000);

    const visFaneFoerJul = visFane;
    visFane = function () {
      const min = ejerFane === FANE;
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerJul();
      if (!min || ejerVindue.hidden || !erEjer()) return;
      visJul();
    };
  });

  function visJul() {
    const taendt = juletemaTaendt();
    let backup = null;
    try { backup = JSON.parse(hentL(NOEGLE_BACKUP) || "null"); } catch (e) {}
    const boks = document.createElement("div");
    boks.className = "jul-panel";
    boks.innerHTML =
      "<h3>🎄 Juletema i velkomsthallen</h3>" +
      "<div class='jul-kort'><p class='jul-status'>" + (taendt
        ? "Juletemaet er <b>tændt</b> 🎄 (" + antalJul(halData()) + " julemøbler i lobbyen)."
        : "Juletemaet er <b>slukket</b>.") + "</p>" +
      "<div class='jul-knapper'>" +
      "<button type='button' class='jul-taend'>🎄 " + (taendt ? "Stil juleindretningen op igen" : "Tænd juletema") + "</button>" +
      "<button type='button' class='jul-sluk'" + (taendt ? "" : " disabled") + ">☀️ Sluk juletema</button>" +
      "</div></div>" +
      "<div class='jul-kort'><p>Når du tænder, bliver lobbyen, som den er nu, gemt på denne computer" +
      (backup && backup.length ? " (" + backup.length + " møbler gemt)" : "") +
      ". Når du slukker, kommer den gemte lobby tilbage. Er der ikke gemt noget, kommer hotellets almindelige lobby.</p>" +
      "<p>Alle i hotellet ser det samme. Du kan stadig flytte, dreje og fjerne alle møbler med 🔨 Byggetilstand.</p>" +
      "<p>Julemøblerne (" + JUL_MOEBLER.length + " slags) kan alle købe i 🛍 Shoppen under fanen <b>🎄 Jul</b>. " +
      "Du har dem gratis i 🔨 Byggetilstand.</p></div>";
    ejerIndhold.appendChild(boks);
    boks.querySelector(".jul-taend").addEventListener("click", function () {
      if (taendt && !confirmJul("Stil juleindretningen op igen? Ændringer du har lavet i julelobbyen forsvinder.")) return;
      taend(); visFane();
    });
    boks.querySelector(".jul-sluk").addEventListener("click", function () { sluk(); visFane(); });
  }
  // et lille "er du sikker?" uden browserens confirm-boks
  let sikkerTid = 0;
  function confirmJul(tekst) {
    if (Date.now() - sikkerTid < 5000) { sikkerTid = 0; return true; }
    sikkerTid = Date.now();
    if (typeof besked !== "undefined" && besked) besked.textContent = tekst + " Klik igen for at gøre det.";
    return false;
  }

  const stil = document.createElement("style");
  stil.textContent = [
    ".jul-panel { font-family: Verdana, sans-serif; color: #4a1320; }",
    ".jul-panel h3 { margin: 4px 0 10px; }",
    ".jul-kort { background: #fbf3df; border: 1px solid #d9b45a; border-radius: 10px; padding: 8px 12px; margin: 0 0 10px; font-size: 12px; }",
    ".jul-kort p { margin: 4px 0; }",
    ".jul-status { font-size: 14px; }",
    ".jul-knapper { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }",
    ".jul-knapper button { font: bold 13px Verdana, sans-serif; padding: 7px 14px; border-radius: 8px; cursor: pointer;",
    "  border: 2px solid #b8862e; background: linear-gradient(#8a1f33, #5e0f20); color: #ffe9b8; }",
    ".jul-knapper button.jul-sluk { background: linear-gradient(#fff4d6, #ecd8a4); color: #5e0f20; }",
    ".jul-knapper button:disabled { opacity: 0.45; cursor: default; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
