// =============================================================
//  🎡 Vera Festival — et stort udendørs festivalområde (Udenfor i elevatoren/navigatøren)
//  Fire områder på én stor plads (36 x 30 felter, plads til rigtig mange gæster):
//    1) 🎤 Hovedscenen   — stor scene med truss, tag, LED-skærme, højttalere, lys og afspærring
//    2) 🎯 Spil-strøget  — boder med festivalspil (højre side)
//    3) 🍔 Festival-gaden — madboder, borde med parasoller, springvand, lygtepæle og lyskæder (forrest)
//    4) ✨ Oplevelsesområdet — VIP-lounge, blomsterbue, fotovæg og lykkehjul på græsset (venstre side)
//  Man kommer ind gennem porten "VERA FESTIVAL" (elevatoren står i porten).
//  - Ansatte (ejer, Eventværter og Eventfolk) styrer ALT fra appen 🎡 Festival på telefonen:
//    scenelys, lys på hver bod, lyskæder, lygtepæle, springvandet, himlen, effekter, skærme, skilt og program.
//  - Alle gæster får appen 🎟 Vera Festival med programmet (arrangementer med dato og tid) og områderne.
//  - Møblerne er realistiske 3D (Blender), billeder i billeder/moebler/fe-*/. Kulisserne (scenen, porten,
//    hækken og træerne bag pladsen) ligger i billeder/festival/.
//  Kræver database-61-vera-festival.sql. Hentes fra slutningen af js/panel-forklaring.js (hotel.html ikke rørt).
//  Alt her hedder "fe…", "fest…" eller "FE…", så det ikke støder ind i andre filer.
// =============================================================
(function () {
  if (window.veraFestivalKlar) return;
  window.veraFestivalKlar = true;

  const FE_ID = "festival";
  const FP_ID = "festivalpark";        // 🎡 Festivalparken (madboder, spil og forlystelser), man går derover fra festivalen
  const FE_MANGLER = "⚠️ Serveren kender ikke Vera Festival endnu. Kør database-61-vera-festival.sql i Supabase → SQL Editor.";
  const FE_FRA_FIL = location.protocol === "file:";
  let FE_B = 36, FE_D = 30;          // skifter, når man går mellem festivalen og parken
  let FR = null;                      // det rum, vi er i (FE_RUM.festival eller FE_RUM.festivalpark)
  const PX_M = 76.35;           // pixels pr. meter i højden (spillets skala)
  const F_M = 1 / 0.77;         // felter pr. meter (1 felt = 0,77 m)
  const FE_STI = "billeder/moebler/";
  const FE_KUL = "billeder/festival/";

  // ----- områderne (felter) -----
  const FE_SCENE = { x0: 11, y0: 0, b: 14, d: 5 };            // scenegulvet
  const FE_OMRAADER = [
    { id: "scene", navn: "Hovedscenen", ikon: "🎤", om: "Den store scene med LED-skærme, lys og plads til hele publikummet.", x: 18, y: 9 },
    { id: "oplevelse", navn: "Oplevelsesområdet", ikon: "✨", om: "VIP-lounge, blomsterbue, fotovæg og lykkehjul på græsset.", x: 4, y: 10 },
    { id: "gaden", navn: "Madgaden", ikon: "🍔", om: "I Festivalparken: mad & drikke, drinks, is & slik, borde med parasoller og springvandet.", x: 14, y: 20, rum: FP_ID },
    { id: "spil", navn: "Spil-strøget", ikon: "🎯", om: "I Festivalparken: spilboder, lykkehjul, piñata og gong.", x: 31, y: 21, rum: FP_ID },
    { id: "forlystelser", navn: "Forlystelserne", ikon: "🎡", om: "I Festivalparken: det store pariserhjul og karrusellen.", x: 29, y: 4, rum: FP_ID },
  ];
  function feltType(x, y) { return FR ? FR.felt(x, y) : feltFest(x, y); }
  function feltFest(x, y) {
    if (x >= 30 && x <= 31 && y <= 13) return "grus";                 // stien op til Festivalparken
    if (x >= FE_SCENE.x0 && x < FE_SCENE.x0 + FE_SCENE.b && y < FE_SCENE.y0 + FE_SCENE.d) return "scene";
    if (x <= 9 && (y === 24 || y === 25)) return "taeppe";          // rød løber fra porten
    if (x <= 8 && y <= 21 && !(y === 10 || y === 11) && !(x === 8)) return "graes";
    if (y === 29 || x === 35) return "graes";                        // græskant forrest
    if (x >= 9 && x <= 10 && y >= 15 && y <= 21) return "bed";
    if (x >= 25 && x <= 26 && y >= 18 && y <= 21) return "bed";
    return "sten";
  }

  // ----- lys og effekter (det samme sæt som i Vera arena) -----
  const FE_SCENELYS = { slukket: "⚫ Slukket", varm: "🟡 Varmt lys", show: "🌈 Show", spots: "🔦 Søgelys", disko: "🪩 Disko",
    puls: "💓 Puls", regnbue: "🌈 Farveskift", strobe: "⚡ Stroboskop" };
  const FE_EFFEKTER = { roeg: "🌫 Røg", konfetti: "🎊 Konfetti", bobler: "🫧 Sæbebobler", ild: "🔥 Flammer", fyrvaerkeri: "🎆 Fyrværkeri",
    sne: "❄️ Snefald", hjerter: "💖 Hjerter", glitter: "✨ Glitter" };
  const FE_LYSFARVER = { slukket: "⚫ Slukket", varm: "🟡 Varmt", rosa: "🩷 Rosa", guld: "✨ Guld", regnbue: "🌈 Farveskift", blink: "💫 Blink" };
  const FE_HIMMEL = { dag: "☀️ Dag", solnedgang: "🌅 Solnedgang", aften: "🌆 Aften", nat: "🌙 Nat" };
  const FE_BODER = [
    { id: "fe-bod-mad", navn: "Mad & Drikke", ikon: "🍔" },
    { id: "fe-bod-drinks", navn: "Drinks", ikon: "🍹" },
    { id: "fe-bod-slik", navn: "Is & Slik", ikon: "🍦" },
    { id: "fe-bod-spil", navn: "Festival Spil", ikon: "🎯" },
    { id: "fp-pariserhjul", navn: "Pariserhjulet", ikon: "🎡" },
    { id: "fp-karrusel", navn: "Karrusellen", ikon: "🎠" },
  ];
  const FE_STEDER = { scene: "🎤 Hovedscenen", oplevelse: "✨ Oplevelsesområdet", gaden: "🍔 Madgaden", spil: "🎯 Spil-strøget",
    forlystelser: "🎡 Forlystelserne", hele: "👑 Hele festivalen" };

  // =============================================================
  //  Små hjælpere
  // =============================================================
  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 200) { try { gør(); } catch (e) { console.error(e); } return; }
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // iFest = på festivalen eller i parken · iPlads = på selve festivalpladsen (scenen) · iPark = i Festivalparken
  function iFest() { try { return rumValg === "vaerelse" && (aktivtVaerelse === FE_ID || aktivtVaerelse === FP_ID); } catch (e) { return false; } }
  function iPlads() { try { return rumValg === "vaerelse" && aktivtVaerelse === FE_ID; } catch (e) { return false; } }
  function iPark() { try { return rumValg === "vaerelse" && aktivtVaerelse === FP_ID; } catch (e) { return false; } }
  function feToken() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function feOnline() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function"; }
  function feMangler(e) { return /function|schema cache|does not exist|hv_festival/i.test((e && e.message) || ""); }
  function feMig() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function feErEjer() { try { return typeof EJERE !== "undefined" && EJERE.indexOf(feMig()) >= 0; } catch (e) { return false; } }
  // Ejeren, Eventværter og Eventfolk styrer festivalen (ejeren må altid alt)
  function feMaa() {
    try {
      if (feErEjer()) return true;
      if (window.eventApp && window.eventApp.maaBruge) return !!window.eventApp.maaBruge();
      return typeof ansatte !== "undefined" && ["eventvaert", "eventfolk"].indexOf(ansatte[feMig()]) >= 0;
    } catch (e) { return false; }
  }
  function feBesked(t) { try { if (typeof besked !== "undefined" && besked) besked.textContent = t; } catch (e) {} }
  function ytId(link) {
    const t = String(link || "").trim();
    const m = t.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(t) ? t : null;
  }
  function erLink(t) { return /https?:\/\/|www\.|youtu\.?be|\.com\b|\.dk\b/i.test(String(t || "")); }
  function lilleNavn(t) {
    return String(t || "").toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa").replace(/[^a-z0-9]/g, "");
  }
  // et punkt i 3D: felt (gx, gy) og z meter over jorden → skærmen
  function p3(gx, gy, z) { const p = punkt(gx, gy); return { x: p.x, y: p.y - (z || 0) * PX_M }; }
  function hsl(h) {
    const f = function (n) { const k = (n + h / 30) % 12; return Math.round(255 * (0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return f(0) + "," + f(8) + "," + f(4);
  }

  // =============================================================
  //  Festivalens tilstand (fra serveren) og serverens ur
  // =============================================================
  const FE_START = { scene: "varm", effekter: {}, himmel: "solnedgang", kaeder: "varm", lamper: true, springvand: "rosa", boder: {}, skaerme: {} };
  let fe = JSON.parse(JSON.stringify(FE_START));
  let feUr = 0, feFejl = "";
  function feNu() { return Date.now() + feUr; }
  function brugSvar(svar, sendt) {
    if (!svar) return;
    if (svar.nu) feUr = svar.nu + (sendt ? (Date.now() - sendt) / 2 : 0) - Date.now();
    if (svar.tilstand && typeof svar.tilstand === "object") {
      const t = svar.tilstand;
      fe = { scene: t.scene || "varm", effekter: t.effekter || {}, himmel: t.himmel || "solnedgang", kaeder: t.kaeder || "varm",
        lamper: t.lamper !== false, springvand: t.springvand || "rosa", boder: t.boder || {}, skaerme: t.skaerme || {},
        skilt: t.skilt || null, nedtael: t.nedtael || 0 };
    }
    feFejl = "";
    opdaterSkaerme();
  }
  let henter = false, sidstHent = 0, feSidstLokal = 0, feVenter = 0, feSaetNr = 0;
  function hentFest() {
    if (!feOnline() || henter) return Promise.resolve();
    henter = true;
    const sendt = Date.now();
    return serverKald("hv_festival_hent", { p_rum: FE_ID })
      .then(function (s) { if (feVenter === 0 && sendt > feSidstLokal) brugSvar(s, sendt); })
      .catch(function (e) { feFejl = feMangler(e) ? FE_MANGLER : (e.message || "Kunne ikke hente festivalen."); })
      .finally(function () { henter = false; });
  }
  // Sæt noget: { scene } · { effekter } · { himmel } · { kaeder } · { lamper } · { springvand } · { boder: { id: lys } }
  //            { skilt } · { nedtael } · { skaerm: { id, v, tekst } }
  function saetFest(del) {
    const nu = feNu();
    feSidstLokal = Date.now();
    ["scene", "himmel", "kaeder", "springvand"].forEach(function (k) { if (del[k]) fe[k] = del[k]; });
    if ("lamper" in del) fe.lamper = !!del.lamper;
    if (del.effekter) fe.effekter = del.effekter;
    if (del.boder) fe.boder = Object.assign({}, fe.boder, del.boder);
    if ("skilt" in del) fe.skilt = del.skilt ? { tekst: del.skilt, tid: nu } : null;
    if ("nedtael" in del) fe.nedtael = del.nedtael ? nu + del.nedtael * 1000 : 0;
    if (del.skaerm) {
      const ids = del.skaerm.id === "alle" ? FE_SKAERME.map(function (s) { return s.id; }) : [del.skaerm.id];
      fe.skaerme = Object.assign({}, fe.skaerme);
      ids.forEach(function (id) {
        const g = fe.skaerme[id] || {};
        fe.skaerme[id] = { v: del.skaerm.v || null, tekst: del.skaerm.tekst || "", t: nu, n: (g.n || 0) + 1, af: feMig() };
      });
    }
    opdaterSkaerme();
    if (!feOnline() || !feToken()) { feFejl = "Du er ikke på serveren, så kun du kan se det."; return Promise.resolve(); }
    const sendt = Date.now(), nr = ++feSaetNr;
    feVenter++;
    return serverKald("hv_festival_saet", { p_token: feToken(), p_rum: FE_ID, p_del: del })
      .then(function (s) { if (nr === feSaetNr) brugSvar(s, sendt); })
      .finally(function () { feVenter--; sidstHent = 0; })
      .catch(function (e) {
        feFejl = feMangler(e) ? FE_MANGLER : "Serveren svarede ikke, så det ses kun hos dig lige nu. (" + (e.message || "fejl") + ")";
        if (/logget ind|Kun ejeren/i.test(e.message || "")) feFejl = e.message;
      });
  }
  // ⏻ Sluk alt: effekterne væk, og alt lys tilbage til normalt (varmt)
  function slukAlt() {
    const b = {}; FE_BODER.forEach(function (x) { b[x.id] = "varm"; });
    return saetFest({ effekter: {}, scene: "varm", kaeder: "varm", springvand: "rosa", lamper: true, boder: b });
  }
  function alleBoder(lys) {
    const b = {}; FE_BODER.forEach(function (x) { b[x.id] = lys; });
    return saetFest({ boder: b });
  }

  // =============================================================
  //  Møblerne (realistiske 3D, skala 0.5). De findes også under Staff, så Bygmestre kan flytte dem.
  // =============================================================
  const FE_TYPER = [
    { id: "fe-afspaerring", navn: "Afspærring (scene)", ankre: [[126, 306], [126, 306], [126, 306], [126, 306]] },
    { id: "fe-gadelampe", navn: "Lygtepæl", ankre: [[226, 734], [226, 734], [226, 734], [226, 734]] },
    { id: "fe-lyspael", navn: "Pæl til lyskæde", ankre: [[226, 727], [226, 727], [226, 727], [226, 727]] },
    { id: "fe-bod-mad", navn: "Bod: Mad & Drikke", felter: [3, 2], ankre: [[333, 854], [237, 854], [333, 854], [237, 854]] },
    { id: "fe-bod-drinks", navn: "Bod: Drinks", felter: [3, 2], ankre: [[333, 854], [237, 854], [333, 854], [237, 854]] },
    { id: "fe-bod-slik", navn: "Bod: Is & Slik", felter: [3, 2], ankre: [[333, 854], [237, 854], [333, 854], [237, 854]] },
    { id: "fe-bod-spil", navn: "Bod: Festival Spil", felter: [3, 2], ankre: [[333, 854], [237, 854], [333, 854], [237, 854]] },
    { id: "fe-parasolbord", navn: "Festivalbord med parasol", felter: [2, 1], ankre: [[432, 770], [336, 770], [432, 770], [336, 770]] },
    { id: "fe-traestol", navn: "Træstol", saede: 34, ankre: [[126, 276], [126, 276], [126, 276], [126, 276]] },
    { id: "fe-baenk", navn: "Parkbænk", felter: [2, 1], saede: 34, centrer: true, ankre: [[222, 316], [126, 316], [222, 316], [126, 316]] },
    { id: "fe-springvand", navn: "Springvand", felter: [2, 2], ankre: [[222, 517], [222, 517], [222, 517], [222, 517]] },
    { id: "fe-trae-rosa", navn: "Blomstrende kirsebærtræ", ankre: [[276, 891], null, null, null], kunEn: true },
    { id: "fe-trae", navn: "Træ", ankre: [[286, 1008], null, null, null], kunEn: true },
    { id: "fe-blomsterkasse", navn: "Blomsterkasse", ankre: [[126, 260], [126, 260], [126, 260], [126, 260]] },
    { id: "fe-haek", navn: "Hæk med lys", ankre: [[126, 283], [126, 283], null, null], kunEn: true },
    { id: "fe-skraldespand", navn: "Skraldespand", ankre: [[126, 280], [126, 280], [126, 280], [126, 280]] },
    { id: "fe-vejskilt", navn: "Vejskilt", ankre: [[196, 620], [196, 620], [196, 620], [196, 620]] },
    { id: "fp-karrusel", navn: "Karrusel", felter: [4, 4], ankre: [[494, 1094], [494, 1094], [494, 1094], [494, 1094]] },
    { id: "fp-raekvaerk", navn: "Rækværk til broen", ankre: [[186, 381], [186, 381], [186, 381], [186, 381]] },
  ];
  FE_TYPER.forEach(function (t) {
    t.skala = 0.5;
    t.retninger = [0, 1, 2, 3].map(function (r) { return t.ankre[r] ? FE_STI + t.id + "/" + t.id + "-" + r + ".png?r=2" : null; });
    t.ankre = t.ankre.map(function (a) { return a || t.ankre[0]; });
  });
  function lavMoebler() {
    if (MOEBEL_TYPER["fe-afspaerring"]) return;
    const kat = typeof STAFF_KAT !== "undefined" ? STAFF_KAT : "Staff";
    FE_TYPER.forEach(function (t) {
      t.kategori = kat; t.staff = true;
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
      if (typeof STAFF_SHOP_KAT !== "undefined" && STAFF_SHOP_KAT.ting.indexOf(t) < 0) STAFF_SHOP_KAT.ting.push(t);
    });
    if (typeof knapBoks !== "undefined" && typeof ikoner !== "undefined") {
      const knapper = [];
      FE_TYPER.forEach(function (type) {
        const knap = document.createElement("button");
        knap.className = "moebel-knap"; knap.dataset.id = type.id; knap.dataset.kategori = type.kategori; knap.hidden = true;
        const ikon = document.createElement("canvas"); ikon.width = 64; ikon.height = 70;
        ikoner.push({ ikon: ikon, type: type });
        const navn = document.createElement("span"); navn.textContent = type.navn;
        knap.append(ikon, navn);
        knap.addEventListener("click", function () {
          if (typeof erStaff === "function" && !erStaff()) return;
          valgtType = valgtType === type.id ? null : type.id; valgtMoebel = null; opdaterPanel();
        });
        knapBoks.appendChild(knap); knapper.push(knap);
      });
      if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 1500);
      setInterval(function () {
        const vis = typeof valgtKategori !== "undefined" && valgtKategori === FE_TYPER[0].kategori && (typeof erStaff !== "function" || erStaff());
        knapper.forEach(function (k) { k.hidden = !vis; });
      }, 300);
    }
  }

  // =============================================================
  //  Pladsens møbler (retning 0 = forsiden mod forreste venstre (+y), 1 = mod højre (+x), 2 = mod -y, 3 = mod -x)
  // =============================================================
  const FE_MOEBLER = (function () {
    const l = [];
    const s = function (type, x, y, r) { l.push({ type: type, x: x, y: y, retning: r || 0 }); };
    // 🎤 Hovedscenen: højttalere, spots og mikrofon på scenen, afspærring foran
    s("ev-hoejtaler", 11, 0); s("ev-hoejtaler", 24, 0); s("ev-roegmaskine", 12, 0); s("ev-roegmaskine", 23, 0);
    s("ev-spotlight", 11, 4); s("ev-spotlight", 24, 4); s("ev-mikrofon", 18, 3); s("ev-mikrofon", 16, 2); s("ev-mikrofon", 20, 2);
    for (let x = 11; x <= 24; x++) s("fe-afspaerring", x, 6);
    s("fe-lyspael", 9, 6); s("fe-lyspael", 9, 12); s("fe-lyspael", 26, 6); s("fe-lyspael", 26, 12);
    s("fe-lyspael", 14, 13); s("fe-lyspael", 18, 13); s("fe-lyspael", 22, 13);
    s("fe-gadelampe", 8, 4); s("fe-gadelampe", 27, 4);
    // ✨ Oplevelsesområdet (græsset til venstre)
    s("ev-vip-skilt", 1, 0); s("ev-vip-sofa", 0, 2, 1); s("ev-vip-sofa", 0, 5, 1); s("ev-rundtbord", 2, 3);
    s("ev-vip-sofa", 4, 1, 0); s("ev-champagnetaarn", 6, 1); s("ev-lanterne", 3, 6); s("ev-lanterne", 6, 4);
    s("fe-trae-rosa", 7, 0); s("fe-trae-rosa", 0, 8); s("ev-blomsterbue", 3, 13); s("ev-fotovaeg", 0, 14, 1);
    s("ev-lykkehjul", 5, 17); s("ev-candyfloss", 2, 19); s("fe-trae-rosa", 7, 20); s("fe-baenk", 0, 17, 1);
    s("fe-blomsterkasse", 1, 9); s("fe-blomsterkasse", 6, 9); s("fe-blomsterkasse", 1, 12); s("fe-blomsterkasse", 6, 12);
    s("fe-gadelampe", 7, 9); s("fe-gadelampe", 7, 12);
    // 🎡 Vejen til Festivalparken (højre bagerst): porten, vejskiltet, lygter og bænke
    s("fe-gadelampe", 29, 1); s("fe-gadelampe", 32, 1); s("fe-vejskilt", 33, 4);
    s("fe-blomsterkasse", 29, 5); s("fe-blomsterkasse", 32, 5); s("fe-blomsterkasse", 29, 9); s("fe-blomsterkasse", 32, 9);
    s("fe-baenk", 27, 7, 0); s("fe-baenk", 33, 8, 0); s("fe-trae-rosa", 35, 1); s("fe-trae", 27, 2);
    s("fe-gadelampe", 27, 11); s("fe-gadelampe", 34, 11); s("fe-skraldespand", 33, 12);
    s("fe-lyspael", 28, 4); s("fe-lyspael", 34, 6);
    // 🍽 Pladsen forrest: springvand, borde og lys (madboderne står nu i Festivalparken)
    s("fe-springvand", 17, 19);
    s("fe-baenk", 17, 17, 0); s("fe-baenk", 17, 22, 2); s("fe-baenk", 15, 19, 1); s("fe-baenk", 20, 19, 3);
    [[11, 17], [11, 23], [23, 23], [15, 26], [21, 26], [28, 15], [32, 15], [29, 19], [29, 24], [33, 19], [33, 24]].forEach(function (b) {
      s("fe-parasolbord", b[0], b[1], 0);
      s("fe-traestol", b[0], b[1] - 1, 0); s("fe-traestol", b[0] + 1, b[1] - 1, 0);
      s("fe-traestol", b[0], b[1] + 1, 2); s("fe-traestol", b[0] + 1, b[1] + 1, 2);
    });
    s("fe-gadelampe", 14, 17); s("fe-gadelampe", 21, 17); s("fe-gadelampe", 14, 22); s("fe-gadelampe", 21, 22);
    s("fe-gadelampe", 10, 26); s("fe-gadelampe", 26, 26); s("fe-gadelampe", 31, 17);
    s("fe-lyspael", 9, 14); s("fe-lyspael", 14, 15); s("fe-lyspael", 21, 15); s("fe-lyspael", 26, 14);
    s("fe-lyspael", 11, 28); s("fe-lyspael", 16, 28); s("fe-lyspael", 21, 28); s("fe-lyspael", 26, 28); s("fe-lyspael", 31, 28);
    s("fe-trae-rosa", 9, 18); s("fe-trae-rosa", 25, 19); s("fe-trae", 10, 21);
    s("fe-blomsterkasse", 2, 23); s("fe-blomsterkasse", 5, 23); s("fe-blomsterkasse", 8, 23);
    s("fe-blomsterkasse", 2, 26); s("fe-blomsterkasse", 5, 26); s("fe-blomsterkasse", 8, 26);
    s("ev-lanterne", 3, 23); s("ev-lanterne", 6, 26); s("ev-lanterne", 13, 20); s("ev-lanterne", 22, 20);
    s("fe-skraldespand", 13, 15); s("fe-skraldespand", 26, 23); s("fe-skraldespand", 9, 26); s("fe-skraldespand", 32, 27);
    return l;
  })();
  function feSomData(liste) {
    return (liste || FE_MOEBLER).filter(function (m) { return MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning || 0 }; });
  }

  // =============================================================
  //  Kulisserne bag pladsen: scenen, porten om elevatoren, hækken og træerne (tegnes som "væggene")
  //  felt = fodaftrykket (x, y, bredde, dybde) uden for pladsen, anker = billedets forreste hjørne
  // =============================================================
  let ELEV_FRA = 24, ELEV_TIL = 26;
  const FE_FORAN = ["fe-port", "fe-scene-kulisse", "fp-port-0", "fp-port-1", "fp-pariserhjul"];     // tegnes oven på gulvet
  const FE_KULISSER = (function () {
    const l = [];
    const k = function (navn, x, y, w, d, anker, r) { l.push({ navn: navn, src: FE_KUL + navn + ".png?r=2", x: x, y: y, w: w, d: d, anker: anker }); };
    // pariserhjulet i Festivalparken kan ses langt bagved
    l.push({ navn: "fp-pariserhjul-langt", src: FE_KUL + "fp-pariserhjul.png?r=1", x: 23, y: -10, w: 14, d: 4, anker: [1434, 2821] });
    // træer langt bagved
    [1, 5, 27.5, 31, 34.5].forEach(function (x, i) { k(i % 2 ? "fe-trae" : "fe-trae-rosa", x, -2.4, 1, 1, i % 2 ? [286, 1008] : [276, 891]); });
    [3, 7, 11, 15, 19, 29].forEach(function (y, i) { k(i % 2 ? "fe-trae-rosa-v" : "fe-trae-v", -2.4, y, 1, 1, i % 2 ? [276, 891] : [286, 1008]); });
    // hækken langs begge bagkanter (ikke bag scenen og ikke ved porten)
    for (let x = 0; x < FE_B; x++) if (x < 10 || (x >= 26 && (x < 29 || x > 32))) k("fe-haek-0", x, -1, 1, 1, [126, 283]);
    for (let y = 0; y < FE_D; y++) if (y < ELEV_FRA - 1 || y > ELEV_TIL) k("fe-haek-1", -1, y, 1, 1, [126, 283]);
    // hovedscenen (16 felter bred) og porten (4 felter)
    k("fe-scene-kulisse", 10, -1.6, 16, 1.6, [1566, 2131]);
    k("fe-port", -1, ELEV_FRA - 1, 1, 4, [126, 1023]);
    // porten til Festivalparken (højre bagerst)
    l.push({ navn: "fp-port-0", src: FE_KUL + "fp-port-0.png?r=1", x: 29, y: -1, w: 4, d: 1, anker: [414, 1023] });
    // tegnes bagfra og frem
    l.sort(function (a, b) { return (a.x + a.w + a.y + a.d) - (b.x + b.w + b.y + b.d); });
    return l;
  })();

  // =============================================================
  //  🎡 FESTIVALPARKEN — et rum for sig selv, som en rigtig forlystelsespark
  //  Man kommer fra festivalen gennem porten (venstre bagkant), over broen ved åen og ind i parken.
  //  Madgaden til venstre, spil-strøget til højre og forlystelserne (pariserhjul + karrusel) bagerst.
  // =============================================================
  const FP_B = 40, FP_D = 32;
  const FP_AA = [4, 6];                 // åen løber langs y (x 4-6)
  const FP_BRO = [15, 16];              // broen og stien ind fra porten (y 15-16)
  const FP_ELEV = [24, 26];
  function feltPark(x, y) {
    if (x >= FP_AA[0] && x <= FP_AA[1]) return y >= FP_BRO[0] && y <= FP_BRO[1] ? "bro" : "vand";
    if (x < FP_AA[0]) return (y >= FP_BRO[0] && y <= FP_BRO[1]) || (x <= 2 && y >= FP_ELEV[0] && y <= FP_ELEV[1]) || (x === 2 && y > FP_BRO[1] && y < FP_ELEV[0]) ? "grus" : "graes";
    if (y >= FP_BRO[0] && y <= FP_BRO[1]) return "grus";              // hovedstien
    if (x >= 22 && x <= 23) return "grus";                            // tværstien
    if (y >= 11 && y <= 14) return "sten";                            // foran boderne
    if (y <= 10) return x < 22 ? "graes" : "sten";                    // plænen og forlystelsespladsen
    if (x < 22) return (x === 7 || y === FP_D - 1) ? "graes" : "sten"; // madgaden
    return (x === FP_B - 1 || y === FP_D - 1) ? "graes" : (x >= 25 && x <= 26 && y >= 27 && y <= 29) ? "bed" : "sten";
  }
  const FP_MOEBLER = (function () {
    const l = [];
    const s = function (type, x, y, r) { l.push({ type: type, x: x, y: y, retning: r || 0 }); };
    // 🌉 broen over åen: rækværk på begge sider og lygter ved enderne
    for (let x = FP_AA[0]; x <= FP_AA[1]; x++) { s("fp-raekvaerk", x, FP_BRO[0] - 1, 0); s("fp-raekvaerk", x, FP_BRO[1] + 1, 2); }
    s("fe-gadelampe", 3, 14); s("fe-gadelampe", 7, 14); s("fe-gadelampe", 3, 17); s("fe-gadelampe", 7, 17);
    // græsset ved porten (før åen)
    s("fe-vejskilt", 1, 13); s("fe-trae-rosa", 1, 3); s("fe-trae", 2, 8); s("fe-trae-rosa", 0, 20); s("fe-trae", 3, 29);
    s("fe-blomsterkasse", 0, 11); s("fe-blomsterkasse", 3, 11); s("fe-baenk", 0, 6, 1); s("ev-lanterne", 3, 21); s("ev-lanterne", 1, 18);
    // 🍔 Madgaden: boderne vender ud mod stien, borde og springvand foran
    s("fe-bod-mad", 8, 11); s("fe-bod-drinks", 12, 11); s("fe-bod-slik", 16, 11); s("fe-bod-mad", 19, 11, 0);
    s("fe-springvand", 13, 23);
    s("fe-baenk", 13, 21, 0); s("fe-baenk", 13, 26, 2);
    [[8, 19], [17, 19], [8, 23], [18, 24], [8, 28], [12, 29], [17, 28]].forEach(function (b) {
      s("fe-parasolbord", b[0], b[1], 0);
      s("fe-traestol", b[0], b[1] - 1, 0); s("fe-traestol", b[0] + 1, b[1] - 1, 0);
      s("fe-traestol", b[0], b[1] + 1, 2); s("fe-traestol", b[0] + 1, b[1] + 1, 2);
    });
    s("fe-skraldespand", 11, 14); s("fe-skraldespand", 21, 21); s("ev-lanterne", 11, 25); s("ev-lanterne", 16, 25);
    s("fe-gadelampe", 21, 18); s("fe-gadelampe", 21, 27);
    // 🎯 Spil-strøget: spilboder ud mod stien og spil på pladsen foran
    s("fe-bod-spil", 25, 11); s("fe-bod-spil", 29, 11); s("fe-bod-spil", 33, 11); s("fe-bod-spil", 37, 11);
    s("ev-lykkehjul", 26, 20); s("ev-pinata", 30, 20); s("ev-gong", 34, 20); s("ev-konfettikanon", 37, 21);
    s("ev-lykkehjul", 29, 26); s("ev-candyfloss", 34, 26); s("fe-baenk", 31, 29, 0); s("fe-baenk", 36, 29, 0);
    s("fe-trae-rosa", 38, 30); s("fe-trae-rosa", 25, 28); s("fe-skraldespand", 24, 22); s("fe-skraldespand", 38, 24);
    s("fe-gadelampe", 24, 18); s("fe-gadelampe", 38, 18); s("fe-gadelampe", 24, 30);
    // lyskæder langs hovedstien
    [8, 14, 20, 26, 32, 38].forEach(function (x) { s("fe-lyspael", x, 17); });
    [10, 16, 25, 31, 37].forEach(function (x) { s("fe-lyspael", x, 14); });
    // 🎡 Forlystelserne bagerst: pariserhjulet (kulisse bag kanten) og karrusellen
    s("fp-karrusel", 31, 4);
    s("fe-gadelampe", 25, 2); s("fe-gadelampe", 38, 2); s("fe-gadelampe", 29, 9); s("fe-gadelampe", 36, 9);
    s("fe-baenk", 25, 7, 0); s("fe-baenk", 37, 6, 0); s("ev-lanterne", 30, 3); s("ev-lanterne", 35, 3); s("fe-skraldespand", 24, 9);
    s("fe-vejskilt", 24, 13);
    // 🌸 plænen bag madgaden
    s("fe-trae-rosa", 9, 1); s("fe-trae-rosa", 18, 2); s("fe-trae", 13, 6); s("fe-trae-rosa", 20, 8);
    s("fe-baenk", 10, 5, 0); s("fe-baenk", 15, 3, 0); s("ev-candyfloss", 16, 8); s("ev-blomsterbue", 9, 8);
    s("ev-lanterne", 12, 3); s("ev-lanterne", 18, 6); s("fe-blomsterkasse", 8, 10); s("fe-blomsterkasse", 21, 5);
    return l;
  })();
  const FP_KULISSER = (function () {
    const l = [];
    const k = function (navn, x, y, w, d, anker) { l.push({ navn: navn, src: FE_KUL + navn + ".png?r=2", x: x, y: y, w: w, d: d, anker: anker }); };
    [9.5, 14, 18.5, 1].forEach(function (x, i) { k(i % 2 ? "fe-trae" : "fe-trae-rosa", x, -2.4, 1, 1, i % 2 ? [286, 1008] : [276, 891]); });
    [2, 7, 11, 20, 29].forEach(function (y, i) { k(i % 2 ? "fe-trae-rosa-v" : "fe-trae-v", -2.4, y, 1, 1, i % 2 ? [276, 891] : [286, 1008]); });
    for (let x = 0; x < FP_B; x++) if ((x < FP_AA[0] || x > FP_AA[1]) && x < 23) k("fe-haek-0", x, -1, 1, 1, [126, 283]);
    for (let y = 0; y < FP_D; y++) if ((y < FP_BRO[0] - 1 || y > FP_BRO[1] + 1) && (y < FP_ELEV[0] - 1 || y > FP_ELEV[1])) k("fe-haek-1", -1, y, 1, 1, [126, 283]);
    l.push({ navn: "fp-pariserhjul", src: FE_KUL + "fp-pariserhjul.png?r=1", x: 24, y: -4, w: 14, d: 4, anker: [1434, 2821] });
    l.push({ navn: "fp-port-1", src: FE_KUL + "fp-port-1.png?r=1", x: -1, y: FP_BRO[0] - 1, w: 1, d: 4, anker: [126, 1023] });
    k("fe-port", -1, FP_ELEV[0] - 1, 1, 4, [126, 1023]);
    l.sort(function (a, b) { return (a.x + a.w + a.y + a.d) - (b.x + b.w + b.y + b.d); });
    return l;
  })();
  function gulvPark(g) {
    // broens planker får en mørk kant mod vandet
    const a = punkt(FP_AA[0], FP_BRO[0]), b = punkt(FP_AA[1] + 1, FP_BRO[0]), c = punkt(FP_AA[1] + 1, FP_BRO[1] + 1), d = punkt(FP_AA[0], FP_BRO[1] + 1);
    polygon(g, [d, c, { x: c.x, y: c.y + 7 }, { x: d.x, y: d.y + 7 }], "#3a2414");
    g.strokeStyle = "rgba(30,18,10,.8)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.moveTo(d.x, d.y); g.lineTo(c.x, c.y); g.stroke();
  }
  // felterne uden for pladsen, hvor stierne og åen fortsætter
  function udeFelter(x0, x1, y0, y1) { const l = []; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) l.push([x, y]); return l; }
  const FE_RUM = {};
  FE_RUM[FE_ID] = { id: FE_ID, b: 36, d: 30, felt: feltFest, kul: FE_KULISSER, elev: [24, 26], gulvEkstra: gulvFestival, bag: 13, top: 13,
    ude: [["grus", udeFelter(30, 31, -3, -1)]], moebler: FE_MOEBLER };
  FE_RUM[FP_ID] = { id: FP_ID, b: FP_B, d: FP_D, felt: feltPark, kul: FP_KULISSER, elev: FP_ELEV, gulvEkstra: gulvPark, bag: 6, top: 13,
    ude: [["grus", udeFelter(-3, -1, FP_BRO[0], FP_BRO[1])], ["vand", udeFelter(FP_AA[0], FP_AA[1], -3, -1)]], moebler: FP_MOEBLER };
  FR = FE_RUM[FE_ID];
  function brugRum(id) {
    const n = FE_RUM[id] || FE_RUM[FE_ID];
    if (FR === n) return;
    FR = n; FE_B = n.b; FE_D = n.d; ELEV_FRA = n.elev[0]; ELEV_TIL = n.elev[1];
    FE_CACHE = null; feKaedeNoegle = "";
  }
  // kan man gå her? (i parken kan man ikke gå i åen, kun over broen)
  function parkKanGaa(x, y) { return feltPark(Math.round(x), Math.round(y)) !== "vand"; }

  // =============================================================
  //  Gulvet og kulisserne tegnes én gang ind i et billede (meget hurtigere), ligesom js/realistisk.js
  // =============================================================
  const FE_TEKSTURER = { sten: FE_KUL + "fe-brosten.jpg", graes: FE_KUL + "fe-graes.jpg", scene: FE_KUL + "fe-scenegulv.jpg",
    bed: FE_KUL + "fe-bed.jpg", taeppe: FE_KUL + "fe-taeppe.jpg", grus: FE_KUL + "fp-grus.jpg", vand: FE_KUL + "fp-vand.jpg", bro: FE_KUL + "fp-broplanker.jpg" };
  const FE_FARVER = { sten: "#9c8682", graes: "#3c6a2c", scene: "#3a2118", bed: "#4a3020", taeppe: "#8a1838", grus: "#97806a", vand: "#2a6a80", bro: "#7a5236" };
  function billede(src) { return typeof hentBillede === "function" ? hentBillede(src) : null; }
  function klar(b) { return !!b && (typeof billedeKlar === "function" ? billedeKlar(b) : b.complete && b.naturalWidth > 0); }
  function feltSti(g, test, felter) {
    g.beginPath();
    const et = function (x, y) {
      const d = diamant(x, y);
      g.moveTo(d[0].x, d[0].y); for (let i = 1; i < 4; i++) g.lineTo(d[i].x, d[i].y); g.closePath();
    };
    if (felter) { felter.forEach(function (f) { et(f[0], f[1]); }); return; }
    for (let x = 0; x < FE_B; x++) for (let y = 0; y < FE_D; y++) if (test(x, y)) et(x, y);
  }
  // fyld felterne med en tekstur (felter = en liste [x, y] uden for pladsen, ellers alle felter af den type)
  function fyldTekstur(g, type, felter) {
    const o = punkt(0, 0), bil = billede(FE_TEKSTURER[type]);
    g.save();
    feltSti(g, function (x, y) { return feltType(x, y) === type; }, felter);
    if (klar(bil)) {
      const F = bil.width / 4;
      const mo = g.createPattern(bil, "repeat");
      mo.setTransform(new DOMMatrix([FLISE_B / 2 / F, FLISE_H / 2 / F, -FLISE_B / 2 / F, FLISE_H / 2 / F, o.x, o.y]));
      g.fillStyle = mo;
    } else g.fillStyle = FE_FARVER[type];
    g.fill();
    g.restore();
  }
  function tegnGulvLag(g) {
    const brugt = {};
    for (let x = 0; x < FE_B; x++) for (let y = 0; y < FE_D; y++) brugt[feltType(x, y)] = 1;
    Object.keys(FE_TEKSTURER).forEach(function (type) { if (brugt[type]) fyldTekstur(g, type); });
    // kantsten mellem brosten og græs/bede
    g.save();
    g.lineCap = "round";
    for (let x = 0; x < FE_B; x++) for (let y = 0; y < FE_D; y++) {
      const t = feltType(x, y);
      if (t !== "graes" && t !== "bed" && t !== "vand") continue;
      [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (r) {
        const nx = x + r[0], ny = y + r[1];
        if (nx < 0 || ny < 0 || nx >= FE_B || ny >= FE_D) return;
        const n = feltType(nx, ny);
        if (t === "vand" ? (n === "vand" || n === "bro") : (n === "graes" || n === "bed" || n === "vand")) return;
        let a, b;
        if (r[0] === 1) { a = punkt(x + 1, y); b = punkt(x + 1, y + 1); }
        else if (r[0] === -1) { a = punkt(x, y); b = punkt(x, y + 1); }
        else if (r[1] === 1) { a = punkt(x, y + 1); b = punkt(x + 1, y + 1); }
        else { a = punkt(x, y); b = punkt(x + 1, y); }
        if (t === "vand") {
          // åbredden: mørk jord og runde sten langs vandet
          g.strokeStyle = "rgba(40,30,20,0.75)"; g.lineWidth = 7;
          g.beginPath(); g.moveTo(a.x, a.y + 1); g.lineTo(b.x, b.y + 1); g.stroke();
          for (let i = 0; i < 4; i++) {
            const t2 = (i + 0.5) / 4, sx = a.x + (b.x - a.x) * t2, sy = a.y + (b.y - a.y) * t2;
            g.fillStyle = ["#a89a8e", "#8c7f74", "#b7aba0"][(x + y + i) % 3];
            g.beginPath(); g.ellipse(sx, sy, 4.2, 2.6, 0, 0, Math.PI * 2); g.fill();
          }
          return;
        }
        g.strokeStyle = "rgba(60,40,35,0.55)"; g.lineWidth = 4.5;
        g.beginPath(); g.moveTo(a.x, a.y + 1); g.lineTo(b.x, b.y + 1); g.stroke();
        g.strokeStyle = "#cdbcb2"; g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      });
    }
    g.restore();
    if (FR && FR.gulvEkstra) FR.gulvEkstra(g);
    // jordkanten forrest (pladsen "står" på jorden). Hvor åen løber ud, er kanten blå
    for (let x = 0; x < FE_B; x++) {
      const v = punkt(x, FE_D), m = punkt(x + 1, FE_D), vd = feltType(x, FE_D - 1) === "vand";
      polygon(g, [v, m, { x: m.x, y: m.y + 14 }, { x: v.x, y: v.y + 14 }], vd ? "#1d4a5a" : "#2c3a22");
    }
    for (let y = 0; y < FE_D; y++) {
      const m = punkt(FE_B, y + 1), h = punkt(FE_B, y), vd = feltType(FE_B - 1, y) === "vand";
      polygon(g, [m, h, { x: h.x, y: h.y + 14 }, { x: m.x, y: m.y + 14 }], vd ? "#163a48" : "#1f2a18");
    }
  }
  function gulvFestival(g) {
    // scenegulvet: guldkant og en sort forkant, så det ser ud som en rigtig scene
    const s = FE_SCENE;
    const fv = punkt(s.x0, s.y0 + s.d), fh = punkt(s.x0 + s.b, s.y0 + s.d), bh = punkt(s.x0 + s.b, s.y0);
    polygon(g, [fv, fh, { x: fh.x, y: fh.y + 9 }, { x: fv.x, y: fv.y + 9 }], "#160a0c");
    polygon(g, [fh, bh, { x: bh.x, y: bh.y + 9 }, { x: fh.x, y: fh.y + 9 }], "#0e0607");
    g.strokeStyle = "#d9a441"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(punkt(s.x0, s.y0).x, punkt(s.x0, s.y0).y); g.lineTo(fv.x, fv.y); g.lineTo(fh.x, fh.y); g.lineTo(bh.x, bh.y); g.stroke();
    // røde løber: guldkant
    g.strokeStyle = "rgba(217,164,65,0.9)"; g.lineWidth = 2;
    [[punkt(0, 24), punkt(10, 24)], [punkt(0, 26), punkt(10, 26)]].forEach(function (l) { g.beginPath(); g.moveTo(l[0].x, l[0].y); g.lineTo(l[1].x, l[1].y); g.stroke(); });
  }
  function tegnKulisse(g, k) {
    const b = billede(k.src);
    if (!klar(b)) return;
    const a = punkt(k.x + k.w, k.y + k.d);   // forreste hjørne af fodaftrykket
    g.drawImage(b, a.x - k.anker[0] * 0.5, a.y - k.anker[1] * 0.5, b.width * 0.5, b.height * 0.5);
  }
  function tegnStatiskLag(g) {
    // mørkt panel bag elevatoren (i porten)
    const pa = p3(-0.05, ELEV_FRA - 0.3, 0), pb = p3(-0.05, ELEV_TIL + 0.3, 0);
    polygon(g, [pa, pb, { x: pb.x, y: pb.y - 3.3 * PX_M }, { x: pa.x, y: pa.y - 3.3 * PX_M }], "#2a0b14");
    // stierne og åen fortsætter lidt ud bag pladsen
    (FR.ude || []).forEach(function (u) { fyldTekstur(g, u[0], u[1]); });
    FR.kul.forEach(function (k) { if (FE_FORAN.indexOf(k.navn) < 0) tegnKulisse(g, k); });
    tegnGulvLag(g);
    FR.kul.forEach(function (k) { if (FE_FORAN.indexOf(k.navn) >= 0) tegnKulisse(g, k); });
  }
  let FE_CACHE = null;
  function antalKlar() {
    let n = 0;
    Object.keys(FE_TEKSTURER).forEach(function (k) { if (klar(billede(FE_TEKSTURER[k]))) n++; });
    FR.kul.forEach(function (k) { if (klar(billede(k.src))) n++; });
    return n;
  }
  function feCache() {
    const T = ctx.getTransform();
    if (T.b || T.c) return null;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const o = punkt(0, 0);
    const ox = T.a * o.x + T.e, oy = T.d * o.y + T.f;
    // hele pladsen med kulisser (målt fra hjørnet 0,0 i skærm-pixels)
    const v = punkt(-3, FE_D), h = punkt(FE_B, -FR.bag), b = punkt(FE_B, FE_D);
    const gx1 = Math.floor(T.a * (v.x - 260) + T.e - ox), gx2 = Math.ceil(T.a * (h.x + 260) + T.e - ox);
    const gy1 = Math.floor(T.d * (o.y - FR.top * PX_M) + T.f - oy), gy2 = Math.ceil(T.d * (b.y + 30) + T.f - oy);
    const sx1 = Math.max(gx1, Math.floor(-ox)), sy1 = Math.max(gy1, Math.floor(-oy));
    const sx2 = Math.min(gx2, Math.ceil(W - ox)), sy2 = Math.min(gy2, Math.ceil(H - oy));
    if (sx2 <= sx1 || sy2 <= sy1) return null;
    const noegle = [FR.id, T.a.toFixed(4), T.d.toFixed(4), W, H, antalKlar()].join("|");
    const k = FE_CACHE;
    if (k && k.noegle === noegle && sx1 >= k.x1 && sy1 >= k.y1 && sx2 <= k.x2 && sy2 <= k.y2) {
      return { c: k.c, x: Math.round(ox + k.x1), y: Math.round(oy + k.y1) };
    }
    const kantX = Math.round(W / 3), kantY = Math.round(H / 3);
    const x1 = Math.max(gx1, sx1 - kantX), y1 = Math.max(gy1, sy1 - kantY);
    const x2 = Math.min(gx2, sx2 + kantX), y2 = Math.min(gy2, sy2 + kantY);
    const c = k && k.c || document.createElement("canvas");
    c.width = x2 - x1; c.height = y2 - y1;
    const g = c.getContext("2d");
    const px = Math.round(ox + x1), py = Math.round(oy + y1);
    g.setTransform(T.a, 0, 0, T.d, T.e - px, T.f - py);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    tegnStatiskLag(g);
    FE_CACHE = { noegle: noegle, c: c, x1: x1, y1: y1, x2: x2, y2: y2 };
    return { c: c, x: px, y: py };
  }

  // =============================================================
  //  Himlen (bag det hele): solnedgang, aften, nat eller dag, med stjerner og træer i horisonten
  // =============================================================
  const FE_STJERNER = Array.from({ length: 90 }, function (_, i) { return { x: (i * 137.5) % 1, y: ((i * 61.8) % 100) / 100, s: 0.6 + (i % 3) * 0.5, f: i }; });
  function himmelFarver() {
    return { dag: ["#5aa6e6", "#9fd0f2", "#e6f2f8"], solnedgang: ["#3a1f5c", "#b4497a", "#f7a46b"], aften: ["#1d1240", "#5a2a6e", "#c0607e"], nat: ["#05060f", "#141633", "#2c2350"] }[fe.himmel] ||
      ["#3a1f5c", "#b4497a", "#f7a46b"];
  }
  function tegnHimmel() {
    const f = himmelFarver();
    const hy = punkt(0, 0).y - 2.4 * PX_M;
    // himlen ned til horisonten, og mørk jord under pladsen (så der aldrig er en lys stribe forneden)
    const H = Math.max(HOEJDE, 20), r = Math.max(0.02, Math.min(0.9, hy / H));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, f[0]); g.addColorStop(r * 0.65, f[1]); g.addColorStop(r, f[2]);
    g.addColorStop(Math.min(1, r + 0.1), "#1c0f18"); g.addColorStop(1, "#140a11");
    ctx.fillStyle = g; ctx.fillRect(-10, -10, BREDDE + 20, HOEJDE + 20);
    const t = performance.now() / 1000;
    if (fe.himmel === "aften" || fe.himmel === "nat") {
      FE_STJERNER.forEach(function (s) {
        const a = 0.4 + 0.4 * Math.sin(t * 1.5 + s.f);
        ctx.fillStyle = "rgba(255,240,220," + a + ")";
        ctx.fillRect(s.x * BREDDE, s.y * hy * 0.8, s.s, s.s);
      });
      // månen
      ctx.fillStyle = "rgba(255,240,215,0.9)"; ctx.beginPath(); ctx.arc(BREDDE * 0.18, Math.max(50, hy * 0.18), 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = f[0]; ctx.beginPath(); ctx.arc(BREDDE * 0.18 + 8, Math.max(50, hy * 0.18) - 4, 16, 0, Math.PI * 2); ctx.fill();
    } else {
      // solen lavt over træerne
      const sx = BREDDE * 0.8, sy = hy - (fe.himmel === "dag" ? 260 : 60);
      const gl = ctx.createRadialGradient(sx, sy, 6, sx, sy, 160);
      gl.addColorStop(0, fe.himmel === "dag" ? "rgba(255,250,210,0.95)" : "rgba(255,210,150,0.9)");
      gl.addColorStop(0.25, "rgba(255,190,140,0.35)"); gl.addColorStop(1, "rgba(255,190,140,0)");
      ctx.fillStyle = gl; ctx.fillRect(sx - 160, sy - 160, 320, 320);
    }
    // en mørk trærække i horisonten (langt væk, bevæger sig lidt med kameraet)
    const forsk = KAMERA.x / ZOOM * 0.25;
    ctx.fillStyle = fe.himmel === "dag" ? "rgba(48,84,52,0.85)" : "rgba(30,18,40,0.88)";
    ctx.beginPath(); ctx.moveTo(-10, hy + 200);
    for (let x = -10; x <= BREDDE + 30; x += 18) {
      const n = Math.sin((x - forsk) * 0.021) * 18 + Math.sin((x - forsk) * 0.057) * 10 + Math.sin((x - forsk) * 0.13) * 5;
      ctx.lineTo(x, hy - 40 - n);
    }
    ctx.lineTo(BREDDE + 30, hy + 200); ctx.closePath(); ctx.fill();
    ctx.fillStyle = fe.himmel === "dag" ? "#3f6a3c" : "#1d1424";
    ctx.fillRect(-10, hy + 20, BREDDE + 20, HOEJDE);
  }

  // =============================================================
  //  LED-skærmene på scenen (YouTube, tekst eller logo). Hjørnerne passer på 3D-kulissen.
  // =============================================================
  const FE_SKAERME = [
    { id: "midt", navn: "Storskærmen", y0: -3.08, y1: 3.08, z0: 1.2, z1: 4.4, x: -0.19, lyd: true },
    { id: "venstre", navn: "Venstre skærm", y0: -6.45, y1: -5.05, z0: 2.6, z1: 4.6, x: 0.13 },
    { id: "hoejre", navn: "Højre skærm", y0: 5.05, y1: 6.45, z0: 2.6, z1: 4.6, x: 0.13 },
  ];
  // kulissens midte: x = 18, y = -0.8. Blender y → spillets x, Blender x → spillets y
  function kulP(bx, by, z) { return p3(18 + by * F_M, -0.8 + bx * F_M, z); }
  function skaermHjoerner(s) { return [kulP(s.x, s.y0, s.z1), kulP(s.x, s.y1, s.z1), kulP(s.x, s.y1, s.z0), kulP(s.x, s.y0, s.z0)]; }
  function skaermData(id) { return (fe.skaerme && fe.skaerme[id]) || {}; }
  function viserVideo(s) { return !!skaermData(s.id).v && !FE_FRA_FIL; }
  function tegnSkaerm(s) {
    const h = skaermHjoerner(s), d = skaermData(s.id);
    if (viserVideo(s)) {
      ctx.save(); ctx.globalCompositeOperation = "destination-out"; polygon(ctx, h, "#000"); ctx.restore();
      return;
    }
    const W = 640, H = 360, nu = feNu();
    ctx.save();
    ctx.transform((h[1].x - h[0].x) / W, (h[1].y - h[0].y) / W, (h[3].x - h[0].x) / H, (h[3].y - h[0].y) / H, h[0].x, h[0].y);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#3a0a2a"); g.addColorStop(0.5, "#7a1450"); g.addColorStop(1, "#2a0620");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    // bevægelige lysstriber i baggrunden
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const x = ((nu / 20 + i * 160) % (W + 200)) - 100;
      const gg = ctx.createLinearGradient(x - 60, 0, x + 60, 0);
      gg.addColorStop(0, "rgba(255,80,170,0)"); gg.addColorStop(0.5, "rgba(255,80,170,0.18)"); gg.addColorStop(1, "rgba(255,80,170,0)");
      ctx.fillStyle = gg; ctx.fillRect(x - 60, 0, 120, H);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (d.v && FE_FRA_FIL) {
      ctx.fillStyle = "#ffd6ea"; ctx.font = "bold 40px Georgia, serif"; ctx.fillText("📺 VERA FESTIVAL", W / 2, H / 2 - 30);
      ctx.font = "22px Verdana, sans-serif"; ctx.fillText("Videoen kan kun vises på hotellet på nettet", W / 2, H / 2 + 30);
    } else if (d.tekst && !erLink(d.tekst)) {
      ctx.fillStyle = "#fff0f8"; ctx.shadowColor = "#ff4fa8"; ctx.shadowBlur = 22;
      const ord = String(d.tekst).split(/\s+/), linjer = [];
      const st = d.tekst.length <= 10 ? 110 : d.tekst.length <= 24 ? 72 : 50;
      ctx.font = "bold " + st + "px Georgia, serif";
      let l = "";
      ord.forEach(function (o) { const p = l ? l + " " + o : o; if (ctx.measureText(p).width > W - 60 && l) { linjer.push(l); l = o; } else l = p; });
      if (l) linjer.push(l);
      linjer.slice(0, 4).forEach(function (t, i, a) { ctx.fillText(t, W / 2, H / 2 + (i - (a.length - 1) / 2) * st * 1.1, W - 40); });
    } else {
      // logoet: krone + VERA FESTIVAL i neon
      ctx.shadowColor = "#ff4fa8"; ctx.shadowBlur = 18 + 8 * Math.sin(nu / 400);
      ctx.fillStyle = "#ffd98a"; ctx.font = (s.id === "midt" ? 80 : 120) + "px serif"; ctx.fillText("👑", W / 2, H / 2 - (s.id === "midt" ? 95 : 70));
      ctx.fillStyle = "#ffe3f1"; ctx.font = "bold " + (s.id === "midt" ? 104 : 120) + "px Georgia, serif";
      ctx.fillText("VERA", W / 2, H / 2 + (s.id === "midt" ? 10 : 50));
      if (s.id === "midt") { ctx.fillStyle = "#ff8fc6"; ctx.font = "bold 58px Georgia, serif"; ctx.fillText("F E S T I V A L", W / 2, H / 2 + 100); }
    }
    ctx.restore();
  }
  // YouTube bag lærredet (som i biografen og arenaen)
  const feIframes = {};
  FE_SKAERME.forEach(function (s) {
    const f = document.createElement("iframe");
    f.className = "fe-skaerm"; f.title = "Vera Festival: " + s.navn;
    f.allow = "autoplay; encrypted-media"; f.referrerPolicy = "strict-origin-when-cross-origin";
    f.style.cssText = "position: fixed; left: 0; top: 0; width: 640px; height: 360px; border: 0; transform-origin: 0 0; pointer-events: none; background: #000;";
    f.hidden = true;
    feIframes[s.id] = { el: f, n: -1, v: null };
  });
  let iframesSat = false;
  function saetIframesInd() {
    if (iframesSat || typeof laerred === "undefined") return;
    FE_SKAERME.forEach(function (s) { laerred.parentNode.insertBefore(feIframes[s.id].el, laerred); });
    iframesSat = true;
  }
  function lydSkaerm() {
    let bedst = null;
    FE_SKAERME.forEach(function (s) { const d = skaermData(s.id); if (d.v && (!bedst || (d.t || 0) > (skaermData(bedst.id).t || 0))) bedst = s; });
    return bedst ? bedst.id : null;
  }
  function ytKommando(f, func, args) { try { f.el.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: args || [] }), "*"); } catch (e) {} }
  // 🔄 YouTube-synk: alle ser videoen det SAMME sted, også dem der kommer ind senere.
  // Bruger den delte hjælper window.veraYtSync fra js/vera-arena.js (lyt + synk hvert 2. sek).
  function ytPos(d) { return Math.max(0, (feNu() - (d.t || feNu())) / 1000); }
  setInterval(function () {
    const Y = window.veraYtSync;
    if (!Y || !iframesSat) return;
    let nyLyt = false;
    FE_SKAERME.forEach(function (s) { const f = feIframes[s.id]; if (!f.lytter) { Y.lyt(f.el); f.lytter = true; if (f.v) nyLyt = true; } });
    if (nyLyt) opdaterSkaerme(true);   // genindlæs én gang, så afspilleren begynder at fortælle, hvor langt den er
    if (!iPlads()) return;
    FE_SKAERME.forEach(function (s) {
      const f = feIframes[s.id], d = skaermData(s.id);
      if (f.v && d.v === f.v && d.t) Y.synk(f.el, d.t, feNu());
    });
  }, 2000);
  function opdaterSkaerme(tving) {
    if (!iframesSat) return;
    const lyd = lydSkaerm();
    FE_SKAERME.forEach(function (s) {
      const f = feIframes[s.id], d = skaermData(s.id);
      if (!(iPlads() && viserVideo(s))) { if (f.v) { f.el.removeAttribute("src"); f.v = null; f.n = -1; } return; }
      if (!tving && f.v === d.v && f.n === d.n) {
        if (f.lyd !== (s.id === lyd)) { f.lyd = s.id === lyd; ytKommando(f, f.lyd ? "unMute" : "mute"); }
        return;
      }
      f.v = d.v; f.n = d.n; f.lyd = s.id === lyd;
      const start = Math.floor(ytPos(d));
      f.el.src = "https://www.youtube-nocookie.com/embed/" + d.v + "?autoplay=1&controls=0&rel=0&playsinline=1&enablejsapi=1&start=" + start +
        (f.lyd ? "" : "&mute=1") + "&origin=" + encodeURIComponent(location.origin);
    });
  }
  const lydKnap = document.createElement("button");
  lydKnap.id = "fe-lyd"; lydKnap.type = "button"; lydKnap.hidden = true; lydKnap.textContent = "🔊 Tænd for lyden";
  const lydTrykket = {};
  lydKnap.addEventListener("click", function () {
    const lyd = lydSkaerm(); if (!lyd) return;
    const d = skaermData(lyd);
    if (d.t) ytKommando(feIframes[lyd], "seekTo", [ytPos(d), true]);   // hop hen hvor de andre er
    ytKommando(feIframes[lyd], "unMute"); ytKommando(feIframes[lyd], "playVideo");
    lydTrykket[lyd + skaermData(lyd).n] = true; lydKnap.hidden = true;
  });
  document.body.appendChild(lydKnap);
  function placerSkaerme() {
    if (iframesSat) {
      const r = laerred.getBoundingClientRect();
      const sx = r.width / BREDDE, sy = r.height / HOEJDE;
      FE_SKAERME.forEach(function (s) {
        const f = feIframes[s.id];
        const vis = iPlads() && viserVideo(s) && !!f.v;
        if (f.el.hidden === vis) f.el.hidden = !vis;
        if (!vis) return;
        const h = skaermHjoerner(s);
        const A = { x: r.left + h[0].x * sx, y: r.top + h[0].y * sy }, B = { x: r.left + h[1].x * sx, y: r.top + h[1].y * sy }, D = { x: r.left + h[3].x * sx, y: r.top + h[3].y * sy };
        f.el.style.transform = "matrix(" + [(B.x - A.x) / 640, (B.y - A.y) / 640, (D.x - A.x) / 360, (D.y - A.y) / 360, A.x, A.y].join(",") + ")";
      });
      const lyd = lydSkaerm();
      const vis = iPlads() && !!lyd && !FE_FRA_FIL && !lydTrykket[lyd + skaermData(lyd).n];
      if (lydKnap.hidden === vis) lydKnap.hidden = !vis;
    }
    requestAnimationFrame(placerSkaerme);
  }

  // =============================================================
  //  💡 Lyset: lygtepæle, lyskæder, boderne, springvandet og scenen
  // =============================================================
  function sprite(farve, r) {
    const c = document.createElement("canvas"); c.width = c.height = r * 2;
    const g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, farve.replace("A", "1")); gr.addColorStop(0.35, farve.replace("A", "0.35")); gr.addColorStop(1, farve.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  const GLOED = {};
  function gloed(rgb) { return GLOED[rgb] || (GLOED[rgb] = sprite("rgba(" + rgb + ",A)", 64)); }
  // farven på et lys lige nu (lys = varm/rosa/guld/regnbue/blink/slukket); i = nummer, så regnbuen bølger
  function lysFarve(lys, i, nu) {
    if (lys === "slukket") return null;
    if (lys === "rosa") return "255,110,190";
    if (lys === "guld") return "255,200,90";
    if (lys === "regnbue") return hsl((nu / 18 + i * 30) % 360);
    if (lys === "blink") return (Math.floor(nu / 380) + i) % 2 ? "255,225,160" : "255,120,200";
    return "255,214,150";
  }
  // midten af et møbels fodaftryk (i felter)
  function midte(m) {
    const t = MOEBEL_TYPER[m.type] || {}, f = moebelFelter(t, drejetTvaers(m));
    return { x: m.x + f[0] / 2, y: m.y + f[1] / 2 };
  }
  // et punkt på et møbel, målt i meter fra midten i møblets egne retninger (bx = fremad, by = til siden)
  function paaMoebel(m, bx, by, z) {
    const c = midte(m), r = (m.retning || 0) % 4;
    const cs = [1, 0, -1, 0][r], sn = [0, 1, 0, -1][r];
    const rx = bx * cs - by * sn, ry = bx * sn + by * cs;
    return p3(c.x + ry * F_M, c.y + rx * F_M, z);
  }
  let feKaeder = [], feKaedeNoegle = "";
  function findKaeder() {
    const pæle = moeblerIRummet.filter(function (m) { return m.type === "fe-lyspael"; });
    const n = pæle.map(function (m) { return m.x + "," + m.y; }).join("|");
    if (n === feKaedeNoegle) return feKaeder;
    feKaedeNoegle = n;
    const set = {}, l = [];
    pæle.forEach(function (a, i) {
      const naer = pæle.map(function (b, j) { return { j: j, d: Math.hypot(a.x - b.x, a.y - b.y) }; })
        .filter(function (o) { return o.j !== i && o.d <= 7.5; }).sort(function (p, q) { return p.d - q.d; }).slice(0, 2);
      naer.forEach(function (o) { const k = Math.min(i, o.j) + "-" + Math.max(i, o.j); if (!set[k]) { set[k] = 1; l.push([a, pæle[o.j]]); } });
    });
    feKaeder = l;
    return l;
  }
  function tegnLys(nu) {
    const lighter = function (c, x, y, s, a) { ctx.globalAlpha = a; ctx.drawImage(c, x - s / 2, y - s / 2, s, s); };
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // lyskæder mellem pælene (en snor med små pærer, der hænger lidt ned)
    const kaede = fe.kaeder || "varm";
    findKaeder().forEach(function (par, k) {
      const a = midte(par[0]), b = midte(par[1]);
      const n = Math.max(6, Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 2.2));
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 0.7;
      ctx.strokeStyle = "#2a1a14"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const t = i / n, z = 3.1 - 0.55 * 4 * t * (1 - t);
        const p = p3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, z);
        if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 1; i < n; i++) {
        const t = i / n, z = 3.1 - 0.55 * 4 * t * (1 - t) - 0.06;
        const p = p3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, z);
        const f = lysFarve(kaede, i + k * 3, nu);
        if (!f) { ctx.globalAlpha = 0.6; ctx.fillStyle = "#6a5a50"; ctx.fillRect(p.x - 1, p.y - 1, 2.4, 2.6); continue; }
        lighter(gloed(f), p.x, p.y, 22, 0.9);
        ctx.globalAlpha = 1; ctx.fillStyle = "rgb(" + f + ")"; ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.6, 2.8);
      }
    });
    moeblerIRummet.forEach(function (m, i) {
      if (m.type === "fe-gadelampe" && fe.lamper !== false) {
        const p = paaMoebel(m, 0, 0, 2.86);
        lighter(gloed("255,205,130"), p.x, p.y, 90, 0.85);
        const g = paaMoebel(m, 0, 0, 0);
        ctx.save(); ctx.translate(g.x, g.y); ctx.scale(1, 0.5);
        lighter(gloed("255,190,120"), 0, 0, 260, 0.35);
        ctx.restore();
      } else if (m.type.indexOf("fe-bod-") === 0) {
        const lys = (fe.boder && fe.boder[m.type]) || "varm";
        // pærerne langs markisens kant + lys ud på jorden foran boden
        for (let j = 0; j < 13; j++) {
          const by = -1.125 + 2.25 * (j + 0.5) / 13;
          const p = paaMoebel(m, 1.08, by, 2.12 - 0.06 * 4 * ((j + 0.5) / 13) * (1 - (j + 0.5) / 13));
          const f = lysFarve(lys, j, nu);
          if (!f) continue;
          lighter(gloed(f), p.x, p.y, 26, 0.95);
          ctx.globalAlpha = 1; ctx.fillStyle = "rgba(" + f + ",1)"; ctx.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8);
        }
        const f0 = lysFarve(lys, 3, nu);
        if (f0) {
          const g = paaMoebel(m, 1.3, 0, 0), sk = paaMoebel(m, 0.3, 0, 2.9);
          ctx.save(); ctx.translate(g.x, g.y); ctx.scale(1.4, 0.55); lighter(gloed(f0), 0, 0, 240, 0.4); ctx.restore();
          lighter(gloed(lys === "varm" ? "255,90,170" : f0), sk.x, sk.y, 150, 0.35);      // skiltet lyser
        }
      } else if (m.type === "fe-springvand") {
        const sv = fe.springvand || "rosa";
        if (sv === "slukket") return;
        for (let j = 0; j < 12; j++) {
          const a = j / 12 * Math.PI * 2;
          const p = paaMoebel(m, Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0.4);
          const f = sv === "regnbue" ? hsl((nu / 15 + j * 30) % 360) : sv === "guld" ? "255,200,90" : "255,90,180";
          lighter(gloed(f), p.x, p.y, 34, 0.9);
        }
        const top = paaMoebel(m, 0, 0, 1.2);
        lighter(gloed(sv === "regnbue" ? hsl((nu / 15) % 360) : "255,120,200"), top.x, top.y, 170, 0.35);
        // glimt i vandet
        for (let j = 0; j < 6; j++) {
          const a = (nu / 700 + j) % (Math.PI * 2), rr = 0.3 + (j % 3) * 0.15;
          const p = paaMoebel(m, Math.cos(a * 3 + j) * rr, Math.sin(a * 2 + j) * rr, 0.43 + (j % 2) * 0.75);
          lighter(gloed("230,245,255"), p.x, p.y, 10, 0.8);
        }
      } else if (m.type === "fp-karrusel") {
        const lys = (fe.boder && fe.boder["fp-karrusel"]) || "varm";
        for (let j = 0; j < 32; j++) {
          const a = j / 32 * Math.PI * 2 + nu / 4000;
          const p = paaMoebel(m, Math.cos(a) * 1.7, Math.sin(a) * 1.7, 2.56);
          const f = lysFarve(lys, j, nu);
          if (!f) continue;
          lighter(gloed(f), p.x, p.y, 22, 0.9);
          ctx.globalAlpha = 1; ctx.fillStyle = "rgb(" + f + ")"; ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.6, 2.6);
        }
        const f0 = lysFarve(lys, 2, nu);
        if (f0) {
          const g = paaMoebel(m, 0, 0, 0.3);
          ctx.save(); ctx.translate(g.x, g.y); ctx.scale(1, 0.5); lighter(gloed(f0), 0, 0, 330, 0.35); ctx.restore();
        }
      } else if (m.type === "ev-lanterne" && fe.lamper !== false) {
        const p = paaMoebel(m, 0, 0, 0.22);
        lighter(gloed("255,190,110"), p.x, p.y, 54, 0.7);
      }
    });
    if (iPark()) tegnHjulLys(nu, lighter);
    ctx.restore();
  }
  // 🎡 pærerne på pariserhjulet (kulissen bag parken): et lysbånd, der løber rundt
  function tegnHjulLys(nu, lighter) {
    const lys = (fe.boder && fe.boder["fp-pariserhjul"]) || "varm";
    const k = FP_KULISSER.find(function (x) { return x.navn === "fp-pariserhjul"; });
    if (!k || lys === "slukket") return;
    const cx = k.x + k.w / 2, cy = k.y + k.d / 2 + 0.5 * F_M, HZ = 6.55, R = 5.02;
    const N = 64;
    for (let j = 0; j < N; j++) {
      const a = j / N * Math.PI * 2;
      const p = p3(cx + Math.cos(a) * R * F_M, cy, HZ + Math.sin(a) * R);
      const f = lysFarve(lys, j, nu);
      if (!f) continue;
      const loeb = 0.55 + 0.45 * Math.sin(a * 4 - nu / 260);
      lighter(gloed(f), p.x, p.y, 20, 0.5 + 0.45 * loeb);
      ctx.globalAlpha = 0.6 + 0.4 * loeb; ctx.fillStyle = "rgb(" + f + ")"; ctx.fillRect(p.x - 1.3, p.y - 1.3, 2.6, 2.6);
    }
    // egerne lyser i takt
    for (let e = 0; e < 16; e++) {
      const a = e / 16 * Math.PI * 2, f = lysFarve(lys, e * 4, nu);
      if (!f || (Math.floor(nu / 400) + e) % 4) continue;
      for (let t = 0.25; t < 1; t += 0.25) {
        const p = p3(cx + Math.cos(a) * R * t * F_M, cy, HZ + Math.sin(a) * R * t);
        lighter(gloed(f), p.x, p.y, 16, 0.6);
      }
    }
    const nav = p3(cx, cy, HZ);
    lighter(gloed(lys === "varm" ? "255,90,170" : (lysFarve(lys, 0, nu) || "255,90,170")), nav.x, nav.y, 120, 0.45);
  }
  // 💧 små glimt, der flyder med strømmen i åen
  function tegnAaGlimt(nu) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 70; i++) {
      const x = FP_AA[0] + 0.15 + ((i * 0.618) % 1) * (FP_AA[1] - FP_AA[0] + 0.7);
      const y = ((i * 2.37 + nu / 1400) % (FP_D + 2)) - 1;
      if (y < 0 || y > FP_D || (y > FP_BRO[0] - 0.2 && y < FP_BRO[1] + 1.2)) continue;
      const p = punkt(x, y), a = 0.25 + 0.3 * Math.sin(nu / 300 + i * 1.7);
      if (a <= 0.05) continue;
      ctx.globalAlpha = a; ctx.drawImage(gloed("200,235,255"), p.x - 6, p.y - 2.5, 12, 5);
    }
    ctx.restore();
  }
  // 🎤 lys fra scenens lyskanoner: kegler af lys ned på scenen og publikum
  function tegnSceneLys(nu) {
    const lys = fe.scene || "varm";
    if (lys === "slukket") return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const by = -4 + i;
      const kilde = kulP(0.56, by, 5.62);
      let mx = 18 + by * F_M * 0.9, my = 2.5, f = "255,205,130", st = 0.16, br = 0.9;
      if (lys === "show") { const v = nu / 900 + i * 0.9; mx += Math.sin(v) * 3; my = 3 + Math.cos(v * 1.3) * 2.5; f = ["255,60,150", "120,160,255", "255,210,90"][i % 3]; st = 0.2; }
      else if (lys === "spots") { const v = nu / 1500 + i * 1.7; mx = 18 + Math.sin(v) * 10; my = 9 + Math.cos(v * 0.8) * 4; f = "255,245,225"; st = 0.18; br = 1.3; }
      else if (lys === "disko") { const v = nu / 300 + i; mx += Math.sin(v) * 4; my = 6 + Math.cos(v * 1.7) * 4; f = hsl((i * 47 + nu / 10) % 360); st = 0.22; br = 0.6; }
      else if (lys === "puls") { st = 0.08 + 0.25 * Math.pow(0.5 + 0.5 * Math.sin(nu / 230), 3); f = "255,60,140"; my = 4; }
      else if (lys === "regnbue") { f = hsl((nu / 20 + i * 40) % 360); st = 0.18; my = 4 + Math.sin(nu / 800 + i) * 1.5; }
      else if (lys === "strobe") { st = nu % 250 < 55 ? 0.45 : 0.0; f = "255,255,255"; my = 6; br = 1.4; }
      if (st <= 0.001) continue;
      const maal = p3(mx, my, 0);
      // keglen: en trekant fra lampen ned til en ellipse på jorden
      const w = 0.9 * br * PX_M;
      const g = ctx.createLinearGradient(kilde.x, kilde.y, maal.x, maal.y);
      g.addColorStop(0, "rgba(" + f + "," + Math.min(0.55, st * 2.2) + ")"); g.addColorStop(1, "rgba(" + f + "," + st * 0.6 + ")");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(kilde.x - 3, kilde.y); ctx.lineTo(kilde.x + 3, kilde.y); ctx.lineTo(maal.x + w, maal.y); ctx.lineTo(maal.x - w, maal.y); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(maal.x, maal.y); ctx.scale(1, 0.5);
      ctx.globalAlpha = Math.min(1, st * 3.5); ctx.drawImage(gloed(f), -w * 1.4, -w * 1.4, w * 2.8, w * 2.8);
      ctx.restore(); ctx.globalAlpha = 1;
      ctx.drawImage(gloed(f), kilde.x - 12, kilde.y - 12, 24, 24);
    }
    ctx.restore();
  }
  // mørket om aftenen og natten (skærmene og lysene undtages)
  function tegnMoerke() {
    const a = { dag: 0, solnedgang: 0.12, aften: 0.32, nat: 0.5 }[fe.himmel] || 0;
    if (!a) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(-20, -20, BREDDE + 40, HOEJDE + 40);
    if (iPlads()) FE_SKAERME.forEach(function (s) {
      const h = skaermHjoerner(s);
      ctx.moveTo(h[3].x, h[3].y); ctx.lineTo(h[2].x, h[2].y); ctx.lineTo(h[1].x, h[1].y); ctx.lineTo(h[0].x, h[0].y); ctx.closePath();
    });
    ctx.clip("evenodd");
    ctx.fillStyle = fe.himmel === "solnedgang" ? "rgba(60,10,50," + a + ")" : "rgba(8,4,24," + a + ")";
    ctx.fillRect(-20, -20, BREDDE + 40, HOEJDE + 40);
    ctx.restore();
  }

  // =============================================================
  //  ✨ Effekterne (som i Vera arena) — de vises der, hvor man kigger hen på den store plads
  // =============================================================
  const fx = {};
  let fxTid = 0;
  const KONFETTI_FARVER = ["#ffd27a", "#e8445a", "#ffffff", "#ff7ac0", "#7ac8ff", "#9be38a", "#c79bff"];
  const RØG = sprite("rgba(225,215,225,A)", 64), GLØD = sprite("rgba(255,170,60,A)", 24), GNIST = sprite("rgba(255,255,255,A)", 12);
  function tilf(a, b) { return a + Math.random() * (b - a); }
  function gulvPunktSynligt() {
    for (let i = 0; i < 8; i++) {
      const x = tilf(0, FE_B), y = tilf(0, FE_D), p = punkt(x, y);
      if (p.x > 0 && p.x < BREDDE && p.y > 0 && p.y < HOEJDE) return p;
    }
    return punkt(tilf(0, FE_B), tilf(0, FE_D));
  }
  function tegnEffekter() {
    const ef = fe.effekter || {};
    const nu = performance.now();
    const dt = Math.min(0.05, (nu - (fxTid || nu)) / 1000);
    fxTid = nu;
    const K = { x0: 0, x1: BREDDE, y0: 0, y1: HOEJDE }, W = BREDDE, H = HOEJDE;
    Object.keys(FE_EFFEKTER).forEach(function (id) {
      const liste = fx[id] || (fx[id] = []);
      const til = !!ef[id];
      if (!til && !liste.length) return;
      ctx.save();
      if (id === "konfetti") {
        while (til && liste.length < 170) liste.push({ x: tilf(K.x0, K.x1), y: tilf(-H * 0.3, 0), vx: tilf(-15, 15), vy: tilf(40, 90), r: tilf(0, 6), vr: tilf(-6, 6), f: KONFETTI_FARVER[liste.length % 7] });
        liste.forEach(function (p) { p.x += (p.vx + Math.sin(nu / 400 + p.r) * 20) * dt; p.y += p.vy * dt; p.r += p.vr * dt; ctx.fillStyle = p.f; ctx.fillRect(p.x, p.y, 6 * Math.cos(p.r), 4); });
      } else if (id === "sne") {
        while (til && liste.length < 150) liste.push({ x: tilf(K.x0, K.x1), y: tilf(-H * 0.3, 0), vy: tilf(20, 45), s: tilf(1.2, 3), f: tilf(0, 6) });
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        liste.forEach(function (p) { p.y += p.vy * dt; p.x += Math.sin(nu / 900 + p.f) * 12 * dt; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); });
      } else if (id === "glitter") {
        while (til && liste.length < 90) liste.push({ x: tilf(K.x0, K.x1), y: tilf(K.y0, K.y1), t: 0, l: tilf(0.6, 1.6) });
        ctx.globalCompositeOperation = "lighter";
        liste.forEach(function (p) {
          p.t += dt; const a = Math.sin(Math.PI * Math.min(1, p.t / p.l));
          ctx.globalAlpha = a; ctx.drawImage(GNIST, p.x - 6, p.y - 6);
          ctx.fillStyle = "#ffe9a8"; ctx.fillRect(p.x - 5 * a, p.y - 0.6, 10 * a, 1.2); ctx.fillRect(p.x - 0.6, p.y - 5 * a, 1.2, 10 * a);
        });
      } else if (id === "hjerter") {
        while (til && liste.length < 32) { const q = gulvPunktSynligt(); liste.push({ x: q.x, y: q.y, vy: tilf(25, 50), t: 0, l: tilf(2.5, 4.5), s: tilf(12, 22), f: tilf(0, 6) }); }
        ctx.textAlign = "center";
        liste.forEach(function (p) {
          p.t += dt; p.y -= p.vy * dt;
          ctx.globalAlpha = Math.max(0, 1 - p.t / p.l); ctx.font = Math.round(p.s) + "px serif";
          ctx.fillText(p.f > 3 ? "💖" : "❤️", p.x + Math.sin(nu / 500 + p.f) * 8, p.y);
        });
      } else if (id === "bobler") {
        while (til && liste.length < 50) { const q = gulvPunktSynligt(); liste.push({ x: q.x, y: q.y, vy: tilf(20, 45), t: 0, l: tilf(3, 6), r: tilf(5, 12), f: tilf(0, 6) }); }
        ctx.lineWidth = 1.2;
        liste.forEach(function (p) {
          p.t += dt; p.y -= p.vy * dt;
          const x = p.x + Math.sin(nu / 600 + p.f) * 10;
          ctx.globalAlpha = Math.max(0, 1 - p.t / p.l);
          ctx.strokeStyle = "hsla(" + ((nu / 20 + p.f * 60) % 360) + ",80%,85%,0.85)";
          ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.arc(x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.2, 0, Math.PI * 2); ctx.fill();
        });
      } else if (id === "roeg") {
        while (til && liste.length < 40) { const q = punkt(tilf(FE_SCENE.x0 - 2, FE_SCENE.x0 + FE_SCENE.b + 2), tilf(0, 12)); liste.push({ x: q.x, y: q.y, vx: tilf(-12, 12), vy: tilf(-6, -2), t: 0, l: tilf(5, 9), s: tilf(1.4, 2.6) }); }
        liste.forEach(function (p) {
          p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; const k = p.t / p.l;
          ctx.globalAlpha = 0.22 * Math.sin(Math.PI * Math.min(1, k));
          const w = 128 * p.s * (0.8 + k * 0.6);
          ctx.drawImage(RØG, p.x - w / 2, p.y - w * 0.3, w, w * 0.6);
        });
      } else if (id === "ild") {
        while (til && liste.length < 120) {
          const a = punkt(FE_SCENE.x0 + Math.random() * FE_SCENE.b, FE_SCENE.y0 + FE_SCENE.d);
          liste.push({ x: a.x + tilf(-3, 3), y: a.y, vy: tilf(50, 110), t: 0, l: tilf(0.4, 0.9), s: tilf(0.6, 1.3) });
        }
        ctx.globalCompositeOperation = "lighter";
        liste.forEach(function (p) {
          p.t += dt; p.y -= p.vy * dt; const k = p.t / p.l;
          ctx.globalAlpha = Math.max(0, 1 - k) * 0.8;
          const w = 34 * p.s * (1 - k * 0.6);
          ctx.drawImage(GLØD, p.x - w / 2, p.y - w / 2, w, w);
        });
      } else if (id === "fyrvaerkeri") {
        if (til && Math.random() < dt * 1.8) {
          const q = gulvPunktSynligt();
          liste.push({ raket: true, x: q.x, y: q.y, vy: tilf(300, 380), top: tilf(H * 0.05, H * 0.35), h: Math.floor(tilf(0, 360)) });
        }
        ctx.globalCompositeOperation = "lighter";
        const nye = [];
        liste.forEach(function (p) {
          if (p.raket) {
            p.y -= p.vy * dt;
            ctx.fillStyle = "#fff2c0"; ctx.fillRect(p.x - 1, p.y, 2, 8);
            if (p.y <= p.top) {
              p.t = 99;
              for (let i = 0; i < 52; i++) { const a = i / 52 * Math.PI * 2, v = tilf(70, 160); nye.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: tilf(1, 1.7), h: p.h }); }
            }
            return;
          }
          p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 70 * dt; p.vx *= 0.985;
          ctx.globalAlpha = Math.max(0, 1 - p.t / p.l);
          ctx.fillStyle = "hsl(" + p.h + ",100%,70%)"; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        });
        nye.forEach(function (n) { liste.push(n); });
      }
      ctx.restore();
      fx[id] = liste.filter(function (p) {
        if (p.raket) return p.t !== 99;
        if (p.l && p.t >= p.l) return false;
        return p.y < K.y1 + 40 && p.y > -H * 0.5 && p.x > K.x0 - 60 && p.x < K.x1 + 60;
      });
    });
  }

  // =============================================================
  //  Rummet
  // =============================================================
  let feZoomFoer = null, feSidstPos = null, feGaarTid = 0;
  function lavRummet() {
    INDBYGGEDE_RUM[FE_ID] = { id: FE_ID, navn: "Vera Festival", ejer: EJER_NAVNE[0], bredde: FE_B, dybde: FE_D,
      vaeg: "#2a0b14", gulv1: "#9c8682", gulv2: "#8e7874", vaegHoejde: 470, doer: null };
    if (typeof RF_STANDARD !== "undefined") RF_STANDARD[FE_ID] = { vaeg: "#2a0b14", gulv1: "#9c8682", gulv2: "#8e7874" };
    // ny etage "Udenfor" i navigatøren og elevatoren
    if (typeof ETAGER !== "undefined" && !ETAGER.some(function (e) { return e.id === "ude"; })) {
      const i = ETAGER.findIndex(function (e) { return e.id === "privat"; });
      ETAGER.splice(i >= 0 ? i : ETAGER.length, 0, { id: "ude", navn: "Udenfor", ikon: "🎡" });
    }
    if (!NAV_RUM.some(function (r) { return r.id === FE_ID; })) {
      NAV_RUM.push({ id: FE_ID, etage: "ude", navn: "🎡 Vera Festival", om: "Det store festivalområde: hovedscene, spil-strøg, festival-gade og oplevelser.",
        billede: "billeder/rum/festival.png", maks: 200, rum: "vaerelse", vaerelse: FE_ID });
    }
    // 🎡 Festivalparken (står ikke i navigatøren — man går derover fra festivalen)
    INDBYGGEDE_RUM[FP_ID] = { id: FP_ID, navn: "Festivalparken", ejer: EJER_NAVNE[0], bredde: FP_B, dybde: FP_D,
      vaeg: "#2a0b14", gulv1: "#9c8682", gulv2: "#8e7874", vaegHoejde: 470, doer: null };
    if (typeof RF_STANDARD !== "undefined") RF_STANDARD[FP_ID] = { vaeg: "#2a0b14", gulv1: "#9c8682", gulv2: "#8e7874" };
    // de gemte møbler bruges, men står boderne stadig på festivalen fra før parken, får festivalen den nye opstilling
    const brugGemt = function (id, liste) {
      if (!Array.isArray(liste) || !liste.length) return false;
      if (id === FE_ID && liste.some(function (m) { return /^fe-bod-/.test(m.type); }) && !liste.some(function (m) { return m.type === "fe-vejskilt"; })) return false;
      return true;
    };
    const vaerelseMoeblerFoer = vaerelseMoebler;
    vaerelseMoebler = function (id) {
      if (FE_RUM[id] && !andreVaerelser[id]) {
        let gemt = null;
        try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + id) || "null"); } catch (e) {}
        andreVaerelser[id] = (brugGemt(id, gemt) ? gemt : feSomData(FE_RUM[id].moebler))
          .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
      }
      return vaerelseMoeblerFoer(id);
    };
    if (typeof serverKald === "function") {
      const serverKaldFoer = serverKald;
      serverKald = async function (funktion, data) {
        const svar = await serverKaldFoer(funktion, data);
        if (funktion === "hv_rum_moebler_hent" && svar) {
          [FE_ID, FP_ID].forEach(function (id) { if (!brugGemt(id, svar[id])) svar[id] = feSomData(FE_RUM[id].moebler); });
        }
        return svar;
      };
    }
    // elevatoren står altid i porten
    if (typeof placerElevator === "function") {
      const placerFoer = placerElevator;
      placerElevator = function () {
        if (iFest() && typeof ELEVATOR !== "undefined") {
          ELEVATOR.fra = ELEV_FRA; ELEVATOR.til = ELEV_TIL; ELEVATOR.felt = { x: 0, y: (ELEV_FRA + ELEV_TIL) / 2 }; ELEVATOR.skala = 1;
          return;
        }
        return placerFoer.apply(this, arguments);
      };
    }
    const skiftRumFoer = skiftRum;
    skiftRum = function (navn) {
      const varHer = iFest(), fra = varHer ? aktivtVaerelse : null;
      skiftRumFoer.apply(this, arguments);
      if (iFest()) {
        brugRum(aktivtVaerelse);
        if (typeof placerElevator === "function") placerElevator();
        if ((fra !== aktivtVaerelse || navn === "vaerelse") && typeof figur !== "undefined") {
          figur.rute = [];
          if (iPark()) {
            // over fra festivalen: man står lige inden for parkens port, ved broen over åen
            figur.x = 1; figur.y = FP_BRO[0]; figur.retning = "ned-hoejre";
            feBesked("🎡 Velkommen til FESTIVALPARKEN! Gå over broen: Madgaden til venstre, spil-strøget til højre og pariserhjul + karrusel bagerst.");
          } else if (fra === FP_ID) {
            figur.x = 30; figur.y = 1; figur.retning = "ned-venstre";             // tilbage gennem porten til parken
            feBesked("👑 Tilbage på VERA FESTIVAL.");
          } else {
            // man kommer ind gennem porten, lidt tættere på, så figurerne ikke bliver bittesmå på den store plads
            figur.x = 1; figur.y = 25; figur.retning = "ned-hoejre";
            feBesked("🎡 Velkommen til VERA FESTIVAL! Hovedscenen er bagerst, oplevelserne til venstre — og porten bagerst til højre fører over åen til Festivalparken med mad, spil og pariserhjul.");
          }
          if (feZoomFoer === null && typeof brugerZoom !== "undefined") { feZoomFoer = brugerZoom; brugerZoom = Math.max(brugerZoom, 1.75); }
          centrerPaaFigur(true);
        }
        hentFest();
        abHent().then(abVelkommen);
      } else if (varHer) {
        if (feZoomFoer !== null && typeof brugerZoom !== "undefined") { brugerZoom = feZoomFoer; KAMERA.x = 0; KAMERA.y = 0; }
        feZoomFoer = null;
      }
      opdaterSkaerme(true);
    };
    // himlen + kulisserne + gulvet (fra billedet), så elevatoren
    const tegnVaeggeFoer = tegnVaegge;
    tegnVaegge = function () {
      if (!iFest()) return tegnVaeggeFoer.apply(this, arguments);
      brugRum(aktivtVaerelse);
      try {
        tegnHimmel();
        const k = feCache();
        if (k) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(k.c, k.x, k.y); ctx.restore(); }
        else tegnStatiskLag(ctx);
      } catch (e) { console.warn(e); }
      const foer = typeof tagIngenTapet !== "undefined" ? tagIngenTapet : false;
      try { if (typeof tagIngenTapet !== "undefined") tagIngenTapet = true; tegnVaeggeFoer.apply(this, arguments); }
      finally { if (typeof tagIngenTapet !== "undefined") tagIngenTapet = foer; }
    };
    const tegnGulvFoer = tegnGulv;
    tegnGulv = function () {
      if (!iFest()) return tegnGulvFoer.apply(this, arguments);
      // gulvet ligger allerede i billedet. Her kommer kun det, der ændrer sig: skærmene og lyset på scenegulvet
      try {
        if (iPlads()) { FE_SKAERME.forEach(tegnSkaerm); tegnScenegulvLys(feNu()); tegnAbKontrol(false); }
        else tegnAaGlimt(feNu());
      } catch (e) { console.warn(e); }
    };
    if (typeof tegnBobler === "function") {
      const tegnBoblerFoer = tegnBobler;
      tegnBobler = function () {
        if (iFest()) {
          try { const nu = feNu(); tegnMoerke(); if (iPlads()) tegnSceneLys(nu); tegnLys(nu); if (iPlads()) tegnAbKontrol(true); tegnEffekter(); } catch (e) { console.warn(e); }
        }
        return tegnBoblerFoer.apply(this, arguments);
      };
    }
    // møbler uden for skærmen tegnes ikke (der står mange på den store plads)
    if (typeof tegnMoebel === "function") {
      const tegnMoebelFoer = tegnMoebel;
      tegnMoebel = function (c, type, x, y) {
        if (c === ctx && iFest() && (x < -260 || x > BREDDE + 260 || y < -60 || y > HOEJDE + 520)) return;
        return tegnMoebelFoer.apply(this, arguments);
      };
    }
  }
  // 🚪 porten: står man i åbningen (festivalen x 30-31, y 0 · parken x 0, y 15-16), går man over til det andet sted
  function tilPark() {
    if (!abOk() && abKraev() === "hele") { feBesked(abTekst()); return; }
    if (typeof gaaTilVaerelse === "function") gaaTilVaerelse(FP_ID);
  }
  function tilFestival() { if (typeof gaaTilVaerelse === "function") gaaTilVaerelse(FE_ID); }
  let fePortTid = 0;
  setInterval(function () {
    try {
      if (!iFest() || typeof figur === "undefined" || (figur.rute && figur.rute.length) || figur.sidde) return;
      if (Date.now() - fePortTid < 1500) return;
      const x = Math.round(figur.x), y = Math.round(figur.y);
      if (iPlads() && y === 0 && x >= 30 && x <= 31) { fePortTid = Date.now(); tilPark(); }
      else if (iPark() && x === 0 && y >= FP_BRO[0] && y <= FP_BRO[1]) { fePortTid = Date.now(); tilFestival(); }
    } catch (e) {}
  }, 250);
  // lyspletter på scenegulvet (under figurerne)
  function tegnScenegulvLys(nu) {
    const lys = fe.scene || "varm";
    const s = FE_SCENE;
    ctx.save();
    if (lys === "slukket") { polygon(ctx, [punkt(s.x0, 0), punkt(s.x0 + s.b, 0), punkt(s.x0 + s.b, s.d), punkt(s.x0, s.d)], "rgba(0,0,0,0.35)"); ctx.restore(); return; }
    // en række små pærer langs scenens forkant
    for (let i = 0; i <= s.b * 2; i++) {
      const p = punkt(s.x0 + i / 2, s.y0 + s.d);
      const t = lys === "varm" ? 0.9 : 0.5 + 0.5 * Math.sin(nu / (lys === "strobe" ? 60 : 150) + i);
      ctx.fillStyle = "rgba(255,226,150," + t + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // kameraet følger med, når man går (man kan stadig trække i skærmen, når man står stille)
  function centrerPaaFigur(straks) {
    if (typeof figur === "undefined" || typeof KAMERA === "undefined") return;
    const p = punkt(figur.x + 0.5, figur.y + 0.5);
    const dx = BREDDE / 2 - p.x, dy = HOEJDE * 0.58 - p.y;
    if (straks) { KAMERA.x += dx * ZOOM; KAMERA.y += dy * ZOOM; return; }
    // kun når figuren er tæt på kanten af skærmen
    const kx = Math.abs(dx) > BREDDE * 0.28 ? dx - Math.sign(dx) * BREDDE * 0.28 : 0;
    const ky = Math.abs(dy) > HOEJDE * 0.26 ? dy - Math.sign(dy) * HOEJDE * 0.26 : 0;
    KAMERA.x += kx * ZOOM * 0.08; KAMERA.y += ky * ZOOM * 0.08;
  }
  function foelgKamera() {
    try {
      if (iFest() && typeof figur !== "undefined") {
        const pos = figur.x + "," + figur.y;
        if (feSidstPos !== pos) { feSidstPos = pos; feGaarTid = performance.now(); }
        const traekker = typeof traek !== "undefined" && traek.nede;
        if (!traekker && performance.now() - feGaarTid < 400) centrerPaaFigur(false);
      }
    } catch (e) {}
    requestAnimationFrame(foelgKamera);
  }

  // =============================================================
  //  Skiltet øverst (værtens skilt og nedtælling)
  // =============================================================
  const skilt = document.createElement("div");
  skilt.id = "fe-skilt"; skilt.hidden = true;
  document.body.appendChild(skilt);
  function opdaterSkilt() {
    if (!iFest()) { skilt.hidden = true; return; }
    const nu = feNu();
    let html = "";
    if (fe.nedtael && nu < fe.nedtael) html += "<div class='fs-tal'>" + Math.ceil((fe.nedtael - nu) / 1000) + "</div>";
    else if (fe.nedtael && nu - fe.nedtael < 2500) html += "<div class='fs-tal'>🎉 NU! 🎉</div>";
    if (fe.skilt && fe.skilt.tekst) html += "<div class='fs-stor'>" + esc(fe.skilt.tekst) + "</div>";
    const live = programNu();
    if (!html && live) html += "<div class='fs-lille'>" + esc(live.emoji || "🎉") + " Lige nu: " + esc(live.titel) + " · " + esc(FE_STEDER[live.sted] || "") + "</div>";
    if (!html) { skilt.hidden = true; return; }
    html = "<div class='fs-top'>👑 VERA FESTIVAL</div>" + html;
    skilt.hidden = false;
    if (skilt.innerHTML !== html) skilt.innerHTML = html;
  }
  setInterval(opdaterSkilt, 250);
  setInterval(function () {
    if (!iFest() && !styrAaben()) return;
    const hvorTit = fe.nedtael && feNu() < fe.nedtael + 3000 ? 500 : 1500;
    if (Date.now() - sidstHent < hvorTit) return;
    sidstHent = Date.now();
    hentFest().then(function () { if (styrAaben()) tegnStyrIgen(); });
  }, 250);

  // :fest-genveje i chatten (kun ansatte): :festlys disko · :festeffekt konfetti · :festsluk
  window.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    const tekst = String(chatTekst.value || "").trim();
    const m = tekst.match(/^[:：]\s*fest(lys|effekt|sluk|finale)\b\s*(.*)$/i);
    if (!m) return;
    e.preventDefault(); e.stopImmediatePropagation(); chatTekst.value = "";
    if (!feMaa()) { feBesked("🎡 Kun ejeren, Eventværter og Eventfolk kan styre Vera Festival."); return; }
    const hvad = m[1].toLowerCase(), n = lilleNavn(m[2]);
    if (hvad === "sluk") { slukAlt(); feBesked("⏻ Alt er slukket og lyset er normalt igen."); return; }
    if (hvad === "finale") { saetFest({ effekter: Object.assign({}, fe.effekter, { konfetti: true, fyrvaerkeri: true, glitter: true }) }); feBesked("🎉 Finale!"); return; }
    const liste = hvad === "lys" ? FE_SCENELYS : FE_EFFEKTER;
    const k = Object.keys(liste).find(function (x) { return lilleNavn(x) === n || lilleNavn(liste[x]).indexOf(n) >= 0; });
    if (!k) { feBesked("🎡 Prøv: " + Object.keys(liste).map(function (x) { return ":fest" + hvad + " " + x; }).join(" · ")); return; }
    if (hvad === "lys") { saetFest({ scene: k }); feBesked("💡 Scenelyset er nu " + liste[k]); return; }
    const ny = Object.assign({}, fe.effekter || {}); if (ny[k]) delete ny[k]; else ny[k] = true;
    saetFest({ effekter: ny }); feBesked(liste[k] + (ny[k] ? " er tændt." : " er slukket."));
  }, true);

  // =============================================================
  //  📅 Programmet (arrangementer med dato og tid) — fra serveren
  // =============================================================
  let program = [], programHentet = 0, programFejl = "";
  function hentProgram() {
    if (!feOnline()) return Promise.resolve();
    return serverKald("hv_festival_program_hent", {})
      .then(function (s) { program = Array.isArray(s) ? s : (s && s.program) || []; programHentet = Date.now(); programFejl = ""; })
      .catch(function (e) { programFejl = feMangler(e) ? FE_MANGLER : (e.message || "Kunne ikke hente programmet."); });
  }
  function tid(p, k) { return new Date(p[k]).getTime(); }
  function programNu() {
    const nu = Date.now();
    return program.find(function (p) { return !p.aflyst && tid(p, "start") <= nu && nu < (p.slut ? tid(p, "slut") : tid(p, "start") + 3600000); }) || null;
  }
  const DAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MDR = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
  function to(n) { return (n < 10 ? "0" : "") + n; }
  function kl(t) { const d = new Date(t); return to(d.getHours()) + ":" + to(d.getMinutes()); }
  function dagNavn(t) {
    const d = new Date(t), i = new Date(); i.setHours(0, 0, 0, 0);
    const forskel = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - i) / 86400000);
    const navn = DAGE[d.getDay()] + " d. " + d.getDate() + ". " + MDR[d.getMonth()];
    return forskel === 0 ? "I dag · " + navn : forskel === 1 ? "I morgen · " + navn : navn.charAt(0).toUpperCase() + navn.slice(1);
  }
  function programKort(p, styr) {
    const nu = Date.now(), s = tid(p, "start"), sl = p.slut ? tid(p, "slut") : s + 3600000;
    const live = !p.aflyst && s <= nu && nu < sl, slut = nu >= sl;
    const mine = mineStjerner();
    return "<div class='ea-kort" + (live ? " ea-live" : "") + (slut || p.aflyst ? " ea-graa" : "") + "'>" +
      "<span class='ea-emoji'>" + esc(p.emoji || "🎉") + "</span>" +
      "<span class='ea-kort-tekst'><b>" + esc(p.titel) + "</b><small>🕒 " + kl(s) + (p.slut ? "–" + kl(sl) : "") + " · " + esc(FE_STEDER[p.sted] || FE_STEDER.hele) + "</small>" +
      (p.om ? "<small class='ea-tekst'>" + esc(p.om) + "</small>" : "") +
      (p.aflyst ? "<em class='ea-aflyst'>Aflyst</em>" : live ? "<em>🔴 Lige nu</em>" : s - nu < 3600000 && s > nu ? "<em class='ea-snart'>Om " + Math.max(1, Math.round((s - nu) / 60000)) + " min</em>" : "") + "</span>" +
      "<span class='ea-smaa'>" + (styr ? "<button data-fe-ret='" + p.id + "' title='Ret'>✏️</button><button data-fe-slet='" + p.id + "' class='ea-sikker' title='Slet'>🗑</button>"
        : (slut ? "" : "<button data-fp-stjerne='" + p.id + "' title='Påmind mig'>" + (mine[p.id] ? "⭐" : "☆") + "</button>")) + "</span></div>";
  }
  function programListe(styr) {
    const nu = Date.now();
    const kommende = program.filter(function (p) { return (p.slut ? tid(p, "slut") : tid(p, "start") + 3600000) > nu - 3 * 3600000; })
      .sort(function (a, b) { return tid(a, "start") - tid(b, "start"); });
    if (!kommende.length) return "<p class='ea-tom'>Der er ingen arrangementer på programmet endnu." + (styr ? "<br>Tryk ➕ for at lave det første." : "<br>Kig forbi igen snart! 🎡") + "</p>";
    let html = "", dag = "";
    kommende.forEach(function (p) {
      const d = dagNavn(tid(p, "start"));
      if (d !== dag) { dag = d; html += "<h4 class='ea-dag'>" + esc(d) + "</h4>"; }
      html += programKort(p, styr);
    });
    return html;
  }
  // ⭐ påmindelser (gemmes i browseren): en besked 10 min før
  function mineStjerner() { try { return JSON.parse(localStorage.getItem("mit-hotel-festival-stjerner") || "{}"); } catch (e) { return {}; } }
  function gemStjerner(s) { try { localStorage.setItem("mit-hotel-festival-stjerner", JSON.stringify(s)); } catch (e) {} }
  const paamindet = {};
  setInterval(function () {
    const s = mineStjerner(), nu = Date.now();
    program.forEach(function (p) {
      if (!s[p.id] || p.aflyst) return;
      const st = tid(p, "start");
      if (st - nu < 10 * 60000 && st > nu && !paamindet[p.id + "a"]) {
        paamindet[p.id + "a"] = 1;
        if (typeof window.tlfNotis === "function") window.tlfNotis("festival-program", "⏰ Om " + Math.max(1, Math.round((st - nu) / 60000)) + " min: " + p.titel, (FE_STEDER[p.sted] || "") + " · Vera Festival");
        feBesked("⏰ " + p.titel + " begynder snart på Vera Festival (" + (FE_STEDER[p.sted] || "") + ")");
      }
    });
  }, 20000);
  setInterval(function () { if (Date.now() - programHentet > 60000 && (iFest() || gaestAaben() || styrAaben())) hentProgram(); }, 5000);

  // =============================================================
  //  📱 Appen 🎡 Festival (ansatte): styrer hele festivalen
  // =============================================================
  let styrApi = null, styrFane = "styr", styrForm = null, styrSidst = "";
  function styrEl() { return styrApi && styrApi.el(); }
  function styrAaben() { return !!styrApi && typeof window.tlfAppAaben === "function" && window.tlfAppAaben("festival"); }
  function topHtml(api, titel, tilbage) {
    const pil = api && api.ik ? api.ik("tilbage", 20) : "‹";
    return "<div class='tlf-top ea-top'><button class='tlf-tb' " + (tilbage ? "data-fe-tilbage='1'" : "data-tilbage='hjem'") + " title='Tilbage'>" + pil + "</button><h3>" + titel + "</h3><span class='tlf-tb'></span></div>";
  }
  const IKON_STYR = "<circle cx='12' cy='12' r='8.5' fill='none' stroke='#ffd98a' stroke-width='1.6'/><circle cx='12' cy='12' r='1.8' fill='#ffd98a'/>" +
    "<path d='M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18' stroke='#ffd98a' stroke-width='1' opacity='.8'/>" +
    "<circle cx='12' cy='3.5' r='1.4' fill='#ff7ac0'/><circle cx='20.5' cy='12' r='1.4' fill='#fff'/><circle cx='12' cy='20.5' r='1.4' fill='#ff7ac0'/><circle cx='3.5' cy='12' r='1.4' fill='#fff'/>";
  const IKON_GAEST = "<path d='M4 7.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z' fill='#ffd98a'/><path d='M9.5 9.5l1.2 1.6 1.3-2.2 1.3 2.2 1.2-1.6.4 3.5H9.1z' fill='#a8204e'/>" +
    "<path d='M8.5 15.5h7' stroke='#a8204e' stroke-width='1.2'/>";
  const STYR_APP = {
    navn: "Festival", ikSvg: IKON_STYR, bg: "linear-gradient(#e0559a, #4a0d2b)", fast: true, kun: feMaa,
    tegn: function (el, api) { styrApi = api; tegnStyr(); hentFest().then(tegnStyrIgen); hentProgram().then(tegnStyrIgen); },
    luk: function () { styrApi = null; styrForm = null; },
  };
  function tegnStyrIgen() {
    if (!styrAaben() || styrForm) return;
    const n = JSON.stringify([fe, feFejl, program, programFejl, styrFane, abP, abPFejl, iFest(), iPark()]);
    if (n === styrSidst) return;
    const el = styrEl(), aktiv = document.activeElement;
    if (el && aktiv && el.contains(aktiv) && /INPUT|TEXTAREA|SELECT/.test(aktiv.tagName)) return;
    tegnStyr();
  }
  function tegnStyr() {
    const el = styrEl();
    if (!el) return;
    styrSidst = JSON.stringify([fe, feFejl, program, programFejl, styrFane, abP, abPFejl, iFest(), iPark()]);
    if (!feMaa()) { el.innerHTML = topHtml(styrApi, "Festival") + "<div class='tlf-indhold ea-app'><p class='ea-tom'>Festival-appen er kun for ejeren, Eventværter og Eventfolk.</p></div>"; return; }
    if (styrForm) { tegnProgramForm(el); return; }
    const scrollFoer = el.querySelector(".ea-app") ? el.querySelector(".ea-app").scrollTop : 0;
    const faner = [["styr", "⚡ Styr"], ["lys", "💡 Lys"], ["skaerme", "📺 Skærme"], ["program", "📅 Program"], ["armbaand", "🎟 Armbånd"]];
    el.innerHTML = topHtml(styrApi, "Festival") + "<div class='tlf-indhold ea-app fe-app'>" +
      "<div class='ea-logo fe-logo'><b>👑 VERA</b><span>✦ FESTIVAL ✦</span><small>Styring for ansatte · " + esc(feMig()) + "</small></div>" +
      "<div class='ea-faner'>" + faner.map(function (f) { return "<button data-fe-fane='" + f[0] + "'" + (f[0] === styrFane ? " class='valgt'" : "") + ">" + f[1] + "</button>"; }).join("") + "</div>" +
      "<div class='fe-krop'></div></div>";
    const krop = el.querySelector(".fe-krop");
    let html = "";
    if (feFejl) html += "<p class='ea-advarsel'>" + esc(feFejl) + "</p>";
    if (!iFest()) html += "<div class='ea-hj-knapper'><button data-fe='gaa'>🚶 Gå til Vera Festival</button></div>";
    else html += "<div class='ea-hj-knapper'><button data-fe='gaapark'>" + (iPark() ? "👑 Tilbage til festivalpladsen" : "🎡 Gå til Festivalparken") + "</button></div>";
    const ef = fe.effekter || {};
    const ikon = function (t) { return String(t).split(" ")[0]; };
    const rest = function (t) { return String(t).split(" ").slice(1).join(" "); };
    const knapper = function (liste, attr, valgt, ekstra) {
      return Object.keys(liste).map(function (k) {
        return "<button " + attr + "='" + k + "'" + (ekstra || "") + " title='" + esc(rest(liste[k])) + "'" + (valgt(k) ? " class='ar-valgt fe-valgt'" : "") + ">" + ikon(liste[k]) + "</button>";
      }).join("");
    };
    if (styrFane === "styr") {
      html += "<div class='ar-hurtig'><div class='ar-hurtig-top'><small>⚡ Hurtig-skift</small><button data-fe='slukalt' class='ar-sluk'>⏻ Sluk alt</button></div>" +
        "<div class='ar-hr'><span>Scene</span>" + knapper(FE_SCENELYS, "data-fe-scene", function (k) { return k === fe.scene; }) + "</div>" +
        "<div class='ar-hr'><span>Effekt</span>" + knapper(FE_EFFEKTER, "data-fe-effekt", function (k) { return !!ef[k]; }) + "</div>" +
        "<div class='ar-hr'><span>Boder</span>" + knapper(FE_LYSFARVER, "data-fe-alleboder", function (k) { return FE_BODER.every(function (b) { return ((fe.boder || {})[b.id] || "varm") === k; }); }) + "</div>" +
        "<div class='ar-hr'><span>Kæder</span>" + knapper(FE_LYSFARVER, "data-fe-kaeder", function (k) { return k === (fe.kaeder || "varm"); }) + "</div>" +
        "<div class='ar-hr'><span>Himmel</span>" + knapper(FE_HIMMEL, "data-fe-himmel", function (k) { return k === fe.himmel; }) + "</div>" +
        "<div class='ar-hr ar-hr-store'><button data-fe-effekt='finale'>🎉 Finale</button><button data-fe-effekt='stop'>⏹ Stop effekter</button>" +
        "<button data-fe='lamper'>" + (fe.lamper !== false ? "💡 Lygter: TÆNDT" : "🌑 Lygter: SLUKKET") + "</button></div>" +
        "<div class='ar-hr ar-hr-store'><button data-fe-ned='3'>⏱ 3</button><button data-fe-ned='5'>⏱ 5</button><button data-fe-ned='10'>⏱ 10</button><button data-fe='allelogo'>🖥 Logo på alle</button></div></div>";
      html += "<h4 class='ea-dag'>🎤 Lys på hovedscenen</h4><div class='ar-gitter'>" + Object.keys(FE_SCENELYS).map(function (k) {
        return "<button data-fe-scene='" + k + "'" + (k === fe.scene ? " class='ar-valgt'" : "") + ">" + FE_SCENELYS[k] + "</button>";
      }).join("") + "</div>" + (fe.scene === "strobe" ? "<p class='ea-info'>⚡ Stroboskop blinker. Brug det kun kort, og sluk det igen.</p>" : "");
      html += "<h4 class='ea-dag'>✨ Effekter</h4><p class='ea-info'>Tryk for at tænde, tryk igen for at slukke. Flere kan være tændt på én gang.</p><div class='ar-gitter'>" +
        Object.keys(FE_EFFEKTER).map(function (k) { return "<button data-fe-effekt='" + k + "'" + (ef[k] ? " class='ar-valgt'" : "") + ">" + FE_EFFEKTER[k] + (ef[k] ? " ✓" : "") + "</button>"; }).join("") + "</div>";
      html += "<h4 class='ea-dag'>🌅 Himlen</h4><div class='ar-gitter'>" + Object.keys(FE_HIMMEL).map(function (k) {
        return "<button data-fe-himmel='" + k + "'" + (k === fe.himmel ? " class='ar-valgt'" : "") + ">" + FE_HIMMEL[k] + "</button>";
      }).join("") + "</div><p class='ea-info'>Om aftenen og natten bliver pladsen mørkere, så alle lysene står flot frem.</p>";
      html += "<p class='ea-info'>Genveje i chatten: <b>:festlys disko</b>, <b>:festeffekt konfetti</b>, <b>:festfinale</b>, <b>:festsluk</b>.</p>";
    } else if (styrFane === "lys") {
      html += "<div class='ea-hj-knapper'><button data-fe='slukalt' class='ar-sluk'>⏻ Sluk alt (normalt lys)</button></div>";
      html += "<h4 class='ea-dag'>🏪 Lys på boderne og forlystelserne</h4>";
      html += "<div class='fe-bod fe-alle'><b>🎪 Alle boder på én gang</b><div class='ar-hr'>" + knapper(FE_LYSFARVER, "data-fe-alleboder", function () { return false; }) + "</div></div>";
      FE_BODER.forEach(function (b) {
        const nu = (fe.boder || {})[b.id] || "varm";
        html += "<div class='fe-bod'><b>" + b.ikon + " " + esc(b.navn) + " <small>" + FE_LYSFARVER[nu] + "</small></b><div class='ar-hr'>" +
          knapper(FE_LYSFARVER, "data-fe-bod", function (k) { return k === nu; }, " data-fe-bodid='" + b.id + "'") + "</div></div>";
      });
      html += "<h4 class='ea-dag'>🎐 Lyskæderne</h4><div class='fe-bod'><b>Over pladsen <small>" + FE_LYSFARVER[fe.kaeder || "varm"] + "</small></b><div class='ar-hr'>" +
        knapper(FE_LYSFARVER, "data-fe-kaeder", function (k) { return k === (fe.kaeder || "varm"); }) + "</div></div>";
      html += "<h4 class='ea-dag'>⛲ Springvandet</h4><div class='fe-bod'><b>Lys i vandet</b><div class='ar-hr'>" +
        knapper({ slukket: "⚫ Slukket", rosa: "🩷 Rosa", guld: "✨ Guld", regnbue: "🌈 Farveskift" }, "data-fe-springvand", function (k) { return k === (fe.springvand || "rosa"); }) + "</div></div>";
      html += "<h4 class='ea-dag'>🏮 Lygtepæle og lanterner</h4><div class='ea-hj-knapper'><button data-fe='lamper'" + (fe.lamper !== false ? " class='ar-valgt'" : "") + ">" +
        (fe.lamper !== false ? "💡 Tændt — tryk for at slukke" : "🌑 Slukket — tryk for at tænde") + "</button></div>";
    } else if (styrFane === "skaerme") {
      const lyd = lydSkaerm();
      const kort = { midt: "🖥 Storskærm", venstre: "◀ Venstre", hoejre: "Højre ▶", alle: "Alle tre" };
      html += "<h4 class='ea-dag'>📺 Skærmene på scenen</h4><ul class='ar-skaermliste'>" + FE_SKAERME.map(function (s) {
        const d = skaermData(s.id);
        return "<li><span>" + esc(s.navn) + (d.v && s.id === lyd ? " 🔊" : "") + "</span><b>" + (d.v ? "▶ YouTube" : d.tekst && !erLink(d.tekst) ? "🔤 " + esc(d.tekst) : "👑 Logo") + "</b>" +
          (d.v || d.tekst ? "<button type='button' data-fe-logo='" + s.id + "' title='Vis logoet igen'>⏹</button>" : "") + "</li>";
      }).join("") + "</ul>" +
        "<div class='ar-skaermboks'><b>▶ YouTube-video</b><input type='text' data-fe-input='yt' placeholder='Sæt et YouTube-link ind …'>" +
        "<small>Tryk på den skærm, videoen skal vises på:</small><div class='ar-skaermknapper'>" +
        FE_SKAERME.map(function (s) { return "<button type='button' data-fe-vis='yt' data-fe-til='" + s.id + "'>" + kort[s.id] + "</button>"; }).join("") + "</div></div>" +
        "<div class='ar-skaermboks'><b>🔤 Tekst på skærmen</b><input type='text' data-fe-input='tekst' maxlength='60' placeholder='Fx VELKOMMEN eller KONCERT KL 20'>" +
        "<small>Tryk på den skærm, teksten skal vises på:</small><div class='ar-skaermknapper'>" +
        FE_SKAERME.concat([{ id: "alle" }]).map(function (s) { return "<button type='button' data-fe-vis='tekst' data-fe-til='" + s.id + "'>" + kort[s.id] + "</button>"; }).join("") + "</div></div>" +
        (FE_FRA_FIL ? "<p class='ea-info'>YouTube virker kun, når hotellet er åbnet på nettet (pavlakvist.github.io/Hotel), ikke fra en fil på computeren.</p>" :
          "<p class='ea-info'>🔊 Lyden kommer fra den skærm, der sidst fik en video. Gæsterne får en knap \"🔊 Tænd for lyden\".</p>");
      html += "<h4 class='ea-dag'>📢 Skilt og nedtælling</h4>" +
        "<form class='ar-form' data-fe-form='skilt'><input type='text' name='l' maxlength='80' placeholder='Skilt øverst hos alle på festivalen'><button type='submit'>📢 Vis</button></form>" +
        "<div class='ea-hj-knapper'>" + (fe.skilt && fe.skilt.tekst ? "<button data-fe='skiltvaek'>✕ Fjern skiltet</button>" : "") +
        "<button data-fe-ned='3'>⏱ 3</button><button data-fe-ned='5'>⏱ 5</button><button data-fe-ned='10'>⏱ 10</button></div>";
    } else if (styrFane === "program") {
      if (programFejl) html += "<p class='ea-advarsel'>" + esc(programFejl) + "</p>";
      html += "<div class='ea-knapper'><button class='ea-stor ea-guld' data-fe='nyt'>➕ Nyt arrangement</button></div>" +
        "<p class='ea-info'>Programmet kan alle gæster se i appen 🎟 Vera Festival. De kan sætte ⭐ og få en påmindelse 10 min før.</p>" + programListe(true);
    } else if (styrFane === "armbaand") {
      html += abStyrHtml();
    }
    krop.innerHTML = html;
    const ny = el.querySelector(".ea-app"); if (ny) ny.scrollTop = scrollFoer;
    kobl(el);
    if (styrFane === "armbaand") abStyrKobl(el);
  }
  function kobl(el) {
    const igen = function () { tegnStyr(); };
    const besk = function (t) { if (styrApi && styrApi.besked) styrApi.besked(t); else feBesked(t); };
    el.querySelectorAll("[data-fe-fane]").forEach(function (b) { b.addEventListener("click", function () { styrFane = b.dataset.feFane; tegnStyr(); if (styrFane === "program") hentProgram().then(tegnStyrIgen); if (styrFane === "armbaand") abPHent().then(function () { styrSidst = ""; tegnStyrIgen(); }); }); });
    el.querySelectorAll("[data-fe-scene]").forEach(function (k) {
      k.addEventListener("click", function () { const ny = k.dataset.feScene === fe.scene && fe.scene !== "varm" ? "varm" : k.dataset.feScene; saetFest({ scene: ny }).then(tegnStyrIgen); igen(); });
    });
    el.querySelectorAll("[data-fe-effekt]").forEach(function (k) {
      k.addEventListener("click", function () {
        const id = k.dataset.feEffekt;
        let ny = Object.assign({}, fe.effekter || {});
        if (id === "stop") ny = {};
        else if (id === "finale") ny = Object.assign(ny, { konfetti: true, fyrvaerkeri: true, glitter: true });
        else if (ny[id]) delete ny[id]; else ny[id] = true;
        saetFest({ effekter: ny }).then(tegnStyrIgen); igen();
      });
    });
    el.querySelectorAll("[data-fe-himmel]").forEach(function (k) { k.addEventListener("click", function () { saetFest({ himmel: k.dataset.feHimmel }).then(tegnStyrIgen); igen(); }); });
    el.querySelectorAll("[data-fe-kaeder]").forEach(function (k) {
      k.addEventListener("click", function () { const v = k.dataset.feKaeder === fe.kaeder && fe.kaeder !== "varm" ? "varm" : k.dataset.feKaeder; saetFest({ kaeder: v }).then(tegnStyrIgen); igen(); });
    });
    el.querySelectorAll("[data-fe-springvand]").forEach(function (k) { k.addEventListener("click", function () { saetFest({ springvand: k.dataset.feSpringvand }).then(tegnStyrIgen); igen(); }); });
    el.querySelectorAll("[data-fe-alleboder]").forEach(function (k) { k.addEventListener("click", function () { alleBoder(k.dataset.feAlleboder).then(tegnStyrIgen); igen(); besk("🏪 Alle boder: " + FE_LYSFARVER[k.dataset.feAlleboder]); }); });
    el.querySelectorAll("[data-fe-bod]").forEach(function (k) {
      k.addEventListener("click", function () {
        const id = k.dataset.feBodid, nu = (fe.boder || {})[id] || "varm";
        const v = k.dataset.feBod === nu && nu !== "varm" ? "varm" : k.dataset.feBod;
        const d = {}; d[id] = v; saetFest({ boder: d }).then(tegnStyrIgen); igen();
      });
    });
    el.querySelectorAll("[data-fe-ned]").forEach(function (k) { k.addEventListener("click", function () { saetFest({ nedtael: Number(k.dataset.feNed) }).then(tegnStyrIgen); igen(); }); });
    el.querySelectorAll("[data-fe-logo]").forEach(function (k) { k.addEventListener("click", function () { saetFest({ skaerm: { id: k.dataset.feLogo } }).then(tegnStyrIgen); igen(); }); });
    el.querySelectorAll("[data-fe-vis]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.feVis, til = k.dataset.feTil;
        const inp = el.querySelector("[data-fe-input='" + hvad + "']");
        const v = inp ? inp.value.trim() : "";
        const navn = (FE_SKAERME.find(function (s) { return s.id === til; }) || { navn: "alle tre skærme" }).navn;
        if (hvad === "yt" || erLink(v)) {
          const id = ytId(v);
          if (!id) { besk(v ? "Det ligner ikke et YouTube-link. Prøv at kopiere linket igen." : "Sæt først et YouTube-link ind i feltet."); return; }
          saetFest({ skaerm: { id: til === "alle" ? "midt" : til, v: id } }).then(tegnStyrIgen);
          besk("▶ Videoen vises nu på " + (til === "alle" ? "Storskærmen" : navn));
        } else {
          if (!v) { besk("Skriv først en tekst i feltet."); return; }
          saetFest({ skaerm: { id: til, tekst: v } }).then(tegnStyrIgen);
          besk("🔤 Teksten vises nu på " + navn);
        }
        inp.value = ""; igen();
      });
    });
    el.querySelectorAll("[data-fe-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        const v = f.querySelector("input").value.trim();
        if (v) saetFest({ skilt: v }).then(tegnStyrIgen);
        f.querySelector("input").value = ""; igen();
      });
    });
    el.querySelectorAll("[data-fe-ret]").forEach(function (k) {
      k.addEventListener("click", function () { const p = program.find(function (x) { return String(x.id) === k.dataset.feRet; }); if (p) { styrForm = Object.assign({}, p); tegnStyr(); } });
    });
    el.querySelectorAll("[data-fe-slet]").forEach(function (k) {
      k.addEventListener("click", function () {
        if (k.dataset.sikker !== "1") { k.dataset.sikker = "1"; k.textContent = "Slet?"; return; }
        serverKald("hv_festival_program_slet", { p_token: feToken(), p_id: Number(k.dataset.feSlet) })
          .then(function () { besk("🗑 Arrangementet er slettet."); return hentProgram(); })
          .catch(function (e) { programFejl = feMangler(e) ? FE_MANGLER : e.message; })
          .then(function () { styrSidst = ""; tegnStyr(); });
      });
    });
    el.querySelectorAll("[data-fe]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.fe;
        if (hvad === "gaa") { gaaTilFestival(); return; }
        if (hvad === "gaapark") { if (iPark()) tilFestival(); else tilPark(); if (typeof window.lukTelefon === "function") window.lukTelefon(); return; }
        if (hvad === "slukalt") { slukAlt().then(tegnStyrIgen); besk("⏻ Alt er slukket, og lyset er normalt igen."); }
        if (hvad === "lamper") saetFest({ lamper: fe.lamper === false }).then(tegnStyrIgen);
        if (hvad === "allelogo") saetFest({ skaerm: { id: "alle" } }).then(tegnStyrIgen);
        if (hvad === "skiltvaek") saetFest({ skilt: "" }).then(tegnStyrIgen);
        if (hvad === "nyt") {
          const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0);
          styrForm = { titel: "", om: "", emoji: "🎤", sted: "scene", start: d.toISOString(), slut: new Date(d.getTime() + 3600000).toISOString() };
        }
        igen();
      });
    });
  }
  function lokalDato(t) { const d = new Date(t); return d.getFullYear() + "-" + to(d.getMonth() + 1) + "-" + to(d.getDate()); }
  function tegnProgramForm(el) {
    const p = styrForm;
    const emojier = ["🎤", "🎸", "🎧", "💃", "🎭", "🎆", "🎯", "🎡", "🍔", "🏆", "👑", "🎉", "🌟", "🎶", "📸", "✨"];
    el.innerHTML = topHtml(styrApi, p.id ? "Ret arrangement" : "Nyt arrangement", true) + "<div class='tlf-indhold ea-app ea-form fe-app'>" +
      (programFejl ? "<p class='ea-advarsel'>" + esc(programFejl) + "</p>" : "") +
      "<label>Titel<input name='titel' maxlength='60' value='" + esc(p.titel) + "' placeholder='Fx Koncert med DJ Vera'></label>" +
      "<label>Hvad sker der?<textarea name='om' rows='3' maxlength='300' placeholder='Fortæl gæsterne om det'>" + esc(p.om || "") + "</textarea></label>" +
      "<span class='ea-lbl'>Ikon</span><div class='ea-emojier'>" + emojier.map(function (e) { return "<button type='button' data-fe-emoji='" + e + "'" + (e === p.emoji ? " class='valgt'" : "") + ">" + e + "</button>"; }).join("") + "</div>" +
      "<label>Hvor?<select name='sted'>" + Object.keys(FE_STEDER).map(function (k) { return "<option value='" + k + "'" + (k === p.sted ? " selected" : "") + ">" + FE_STEDER[k] + "</option>"; }).join("") + "</select></label>" +
      "<label>Dato<input type='date' name='dato' value='" + lokalDato(p.start) + "'></label>" +
      "<div class='ea-to'><label>Starter kl.<input type='time' name='fra' value='" + kl(p.start) + "'></label><label>Slutter kl.<input type='time' name='til' value='" + (p.slut ? kl(p.slut) : "") + "'></label></div>" +
      "<div class='ea-knapper'><button class='ea-stor' data-fe-annuller='1'>Annullér</button><button class='ea-stor ea-guld' data-fe-gem='1'>💾 Gem</button></div></div>";
    el.querySelectorAll("[data-fe-tilbage], [data-fe-annuller]").forEach(function (k) { k.addEventListener("click", function (e) { e.stopPropagation(); styrForm = null; programFejl = ""; tegnStyr(); }); });
    el.querySelectorAll("[data-fe-emoji]").forEach(function (k) {
      k.addEventListener("click", function () { p.emoji = k.dataset.feEmoji; el.querySelectorAll("[data-fe-emoji]").forEach(function (x) { x.classList.toggle("valgt", x === k); }); });
    });
    el.querySelector("[data-fe-gem]").addEventListener("click", function () {
      const v = function (n) { const f = el.querySelector("[name='" + n + "']"); return f ? f.value.trim() : ""; };
      const titel = v("titel"), dato = v("dato"), fra = v("fra"), til = v("til");
      if (!titel || !dato || !fra) { programFejl = "Skriv en titel, en dato og hvornår det starter."; p.titel = titel; p.om = v("om"); tegnProgramForm(el); return; }
      const start = new Date(dato + "T" + fra);
      let slut = til ? new Date(dato + "T" + til) : null;
      if (slut && slut <= start) slut = new Date(slut.getTime() + 86400000);   // slutter efter midnat
      serverKald("hv_festival_program_gem", { p_token: feToken(), p_id: p.id || null, p_titel: titel, p_om: v("om"), p_emoji: p.emoji || "🎉",
        p_sted: v("sted") || "hele", p_start: start.toISOString(), p_slut: slut ? slut.toISOString() : null })
        .then(function () { styrForm = null; programFejl = ""; if (styrApi && styrApi.besked) styrApi.besked("📅 " + titel + " er på programmet!"); return hentProgram(); })
        .catch(function (e) { programFejl = feMangler(e) ? FE_MANGLER : (e.message || "Kunne ikke gemme."); })
        .then(function () { styrSidst = ""; tegnStyr(); });
    });
  }

  // =============================================================
  //  🎟 Appen Vera Festival (alle gæster): programmet og områderne
  // =============================================================
  let gaestApi = null, gaestFane = "program";
  function gaestAaben() { return !!gaestApi && typeof window.tlfAppAaben === "function" && window.tlfAppAaben("festival-program"); }
  const GAEST_APP = {
    navn: "Vera Festival", ikSvg: IKON_GAEST, bg: "linear-gradient(#ff8fc6, #8a1446)", fast: true,
    tal: function () { return programNu() ? 1 : 0; },
    tegn: function (el, api) { gaestApi = api; tegnGaest(); hentProgram().then(function () { if (gaestAaben()) tegnGaest(); }); abHent().then(function () { if (gaestAaben()) tegnGaest(); }); },
    luk: function () { gaestApi = null; },
  };
  function gaaTilFestival(omr) {
    const o = omr ? FE_OMRAADER.find(function (x) { return x.id === omr; }) : null;
    let rum = (o && o.rum) || FE_ID;
    if (rum === FP_ID && !abOk() && abKraev() === "hele") { rum = FE_ID; feBesked(abTekst()); }
    if (!iFest() || aktivtVaerelse !== rum) gaaTilVaerelse(rum);
    if (o && typeof figur !== "undefined" && rum === (o.rum || FE_ID)) {
      setTimeout(function () {
        if (!iFest() || aktivtVaerelse !== rum) return;
        try {
          if (typeof gaaTil === "function") gaaTil(o.x, o.y);
          else { figur.x = o.x; figur.y = o.y; centrerPaaFigur(true); }
        } catch (e) { figur.x = o.x; figur.y = o.y; centrerPaaFigur(true); }
      }, 200);
    }
    if (typeof window.lukTelefon === "function") window.lukTelefon();
  }
  function tegnGaest() {
    const el = gaestApi && gaestApi.el();
    if (!el) return;
    const live = programNu();
    let html = topHtml(gaestApi, "Vera Festival") + "<div class='tlf-indhold ea-app fe-app'>" +
      "<div class='fe-plakat'><span>👑</span><b>VERA</b><i>F E S T I V A L</i><small>Hotellets store udendørs festival</small></div>" +
      (live ? "<div class='fe-live'>🔴 Lige nu: <b>" + esc(live.titel) + "</b> · " + esc(FE_STEDER[live.sted] || "") + "</div>" : "") +
      "<div class='ea-knapper'><button class='ea-stor ea-guld' data-fg='gaa'>" + (iFest() ? "🎡 Du er på festivalen" : "🚶 Gå til festivalen") + "</button></div>" +
      abGaestHtml() +
      "<div class='ea-faner'>" + [["program", "📅 Program"], ["omraader", "🗺 Områder"], ["mine", "⭐ Mine"]].map(function (f) {
        return "<button data-fg-fane='" + f[0] + "'" + (f[0] === gaestFane ? " class='valgt'" : "") + ">" + f[1] + "</button>";
      }).join("") + "</div>";
    if (programFejl && gaestFane !== "omraader") html += "<p class='ea-advarsel'>" + esc(programFejl) + "</p>";
    if (gaestFane === "program") html += programListe(false);
    else if (gaestFane === "mine") {
      const s = mineStjerner();
      const mine = program.filter(function (p) { return s[p.id]; });
      html += mine.length ? mine.sort(function (a, b) { return tid(a, "start") - tid(b, "start"); }).map(function (p) { return programKort(p, false); }).join("") :
        "<p class='ea-tom'>Tryk ☆ ved et arrangement i programmet, så får du en påmindelse 10 minutter før. ⭐</p>";
    } else {
      html += FE_OMRAADER.map(function (o) {
        return "<button class='ea-kort' data-fg-omr='" + o.id + "'><span class='ea-emoji'>" + o.ikon + "</span><span class='ea-kort-tekst'><b>" + esc(o.navn) + "</b><small class='ea-tekst'>" +
          esc(o.om) + "</small></span><span class='ea-pil'>›</span></button>";
      }).join("") + "<p class='ea-info'>Tryk på et område for at gå derhen.</p>";
    }
    html += "</div>";
    el.innerHTML = html;
    el.querySelectorAll("[data-fg-fane]").forEach(function (b) { b.addEventListener("click", function () { gaestFane = b.dataset.fgFane; tegnGaest(); }); });
    abGaestKobl(el);
    el.querySelectorAll("[data-fg='gaa']").forEach(function (b) { b.addEventListener("click", function () { if (!iFest()) gaaTilFestival(); }); });
    el.querySelectorAll("[data-fg-omr]").forEach(function (b) { b.addEventListener("click", function () { gaaTilFestival(b.dataset.fgOmr); }); });
    el.querySelectorAll("[data-fp-stjerne]").forEach(function (b) {
      b.addEventListener("click", function () {
        const s = mineStjerner(); if (s[b.dataset.fpStjerne]) delete s[b.dataset.fpStjerne]; else s[b.dataset.fpStjerne] = 1;
        gemStjerner(s); tegnGaest();
        if (s[b.dataset.fpStjerne] && gaestApi && gaestApi.besked) gaestApi.besked("⭐ Du får en påmindelse 10 min før.");
      });
    });
  }
  setInterval(function () { if (gaestAaben()) { const n = JSON.stringify([program, gaestFane, iFest(), Math.floor(Date.now() / 30000), ab, abFejl, abBekraeft]); if (n !== tegnGaest.sidst) { tegnGaest.sidst = n; tegnGaest(); } } }, 1000);

  // =============================================================
  //  🎟 Festival-armbånd (database-62-festival-armbaand.sql)
  //  Gæsterne køber et armbånd i appen Vera Festival. En Festival-vagt (eller ejeren/de ansatte) scanner det ved indgangen.
  //  Uden scannet armbånd kommer man ikke længere end indgangen (eller ikke ind foran scenen, hvis ejeren vælger det).
  // =============================================================
  const AB_MANGLER = "⚠️ Serveren kender ikke festival-armbåndene endnu. Kør database-62-festival-armbaand.sql i Supabase → SQL Editor.";
  const AB_KRAEV = { fra: "🚪 Alle må komme ind", hele: "🎟 Armbånd til hele festivalen", scene: "🎤 Kun foran scenen" };
  const AB_INDGANG = { x1: 6, y0: 23, y1: 26 };                 // indgangen ved porten (her må alle stå)
  const AB_SCENE = { x0: 9, x1: 27, y1: 12 };                    // pladsen foran scenen
  let ab = null, abFejl = "", abHentet = 0, abHenter = false, abP = null, abPFejl = "", abBekraeft = false;
  function abMangler(e) { return /function|schema cache|does not exist|hv_festival_(armbaand|salg|scan|personale)/i.test((e && e.message) || ""); }
  function abFejlTekst(e) { return abMangler(e) ? AB_MANGLER : (e && e.message) || "Noget gik galt."; }
  // Ejeren og alle ansatte (fx Festival-vagter) kan scanne og går altid frit
  function feErAnsat() {
    try { return feErEjer() || feMaa() || (typeof erAnsat === "function" && erAnsat(feMig())); } catch (e) { return false; }
  }
  function abPenge(svar) {
    if (!svar || svar.glimt == null) return;
    try { if (typeof saetPenge === "function") saetPenge({ glimt: svar.glimt, stella: svar.stella }, false); } catch (e) {}
  }
  function abHent() {
    if (!feOnline() || abHenter) return Promise.resolve();
    abHenter = true;
    const foer = ab && ab.mit;
    return serverKald("hv_festival_armbaand_hent", { p_token: feToken() })
      .then(function (s) {
        ab = s; abFejl = ""; abHentet = Date.now();
        if (foer && !foer.scannet && s && s.mit && s.mit.scannet) {
          const t = "✅ Dit armbånd er scannet. God festival! 🎡";
          feBesked(t);
          try { if (typeof window.tlfNotis === "function") window.tlfNotis("festival-program", "🎟 Vera Festival", t); } catch (e) {}
        }
      })
      .catch(function (e) { abFejl = abFejlTekst(e); if (abMangler(e)) ab = null; })
      .finally(function () { abHenter = false; });
  }
  function abPHent() {
    if (!feOnline() || !feErAnsat()) return Promise.resolve();
    return serverKald("hv_festival_personale", { p_token: feToken() })
      .then(function (s) { abP = s; abPFejl = ""; if (s && s.salg) { ab = ab || {}; ab.salg = s.salg; } })
      .catch(function (e) { abPFejl = abFejlTekst(e); });
  }
  function abSaet(del) {
    return serverKald("hv_festival_salg_saet", { p_token: feToken(), p_del: del })
      .then(function (s) { abP = s; abPFejl = ""; if (s && s.salg) { ab = ab || {}; ab.salg = s.salg; } })
      .catch(function (e) { abPFejl = abFejlTekst(e); });
  }
  function abKoeb() {
    return serverKald("hv_festival_armbaand_koeb", { p_token: feToken() })
      .then(function (s) { ab = s; abFejl = ""; abPenge(s); feBesked("🎟 Du har købt et festival-armbånd! Vis det til en Festival-vagt ved indgangen."); })
      .catch(function (e) { abFejl = abFejlTekst(e); });
  }
  // Skal man have armbånd, og har man et scannet?
  function abKraev() { return ab && ab.salg ? ab.salg.kraev : "fra"; }
  function abOk() {
    if (!feOnline() || !ab || !ab.salg || abKraev() === "fra" || feErAnsat()) return true;
    return !!(ab.mit && ab.mit.scannet);
  }
  function iIndgang(x, y) { return x <= AB_INDGANG.x1 && y >= AB_INDGANG.y0 && y <= AB_INDGANG.y1; }
  function foranScenen(x, y) { return x >= AB_SCENE.x0 && x <= AB_SCENE.x1 && y <= AB_SCENE.y1; }
  function abSpaerret(x, y) {
    if (abOk()) return false;
    if (iPark()) return abKraev() === "hele";
    return abKraev() === "hele" ? !iIndgang(x, y) : foranScenen(x, y);
  }
  function abTekst() {
    const pris = ab && ab.salg ? ab.salg.pris : 10;
    if (!ab || !ab.mit) return "🎟 Du skal have et festival-armbånd for at komme " + (abKraev() === "scene" ? "ind foran scenen" : "ind på festivalen") +
      ". Køb det i appen Vera Festival på telefonen (" + pris + " ⭐), og vis det til en Festival-vagt ved indgangen.";
    return "📟 Dit armbånd er ikke scannet endnu. Vis det til en Festival-vagt ved indgangen, så kommer du ind.";
  }
  function abVelkommen() { if (iFest() && !abOk() && abKraev() === "hele") feBesked(abTekst()); }
  // man kan ikke gå ind på de spærrede felter
  function pakKanGaa() {
    if (typeof kanGaa !== "function" || kanGaa.feAb) return;
    const foer = kanGaa;
    const ny = function (x, y) {
      if (iFest() && abSpaerret(x, y)) return false;
      if (iPark() && !parkKanGaa(x, y)) return false;                // man kan ikke gå i åen
      return foer.apply(this, arguments);
    };
    ny.feAb = true;
    kanGaa = ny;
  }
  function pakGaaTil() {
    if (typeof gaaTil !== "function" || gaaTil.feAb) return;
    const foer = gaaTil;
    const ny = function (x, y) {
      if (iPlads() && abSpaerret(Math.round(x), Math.round(y))) feBesked(abTekst());
      return foer.apply(this, arguments);
    };
    ny.feAb = true;
    gaaTil = ny;
  }
  // står man et sted, man ikke må (fx fordi kravet lige er slået til), sendes man hen til indgangen
  function abSendUd() {
    if (!iFest() || typeof figur === "undefined" || figur.sidde) return;
    const fx = Math.round(figur.x), fy = Math.round(figur.y);
    if (!abSpaerret(fx, fy)) return;
    if (iPark()) { tilFestival(); return; }            // tilbage til festivalen, så sendes man derfra til indgangen
    const steder = abKraev() === "hele" ? [[2, 25], [3, 24], [1, 24], [4, 25], [1, 25]] : [[18, 15], [17, 15], [19, 15], [16, 16], [20, 16]];
    const sted = steder.find(function (p) { try { return kanGaa(p[0], p[1]); } catch (e) { return true; } }) || steder[0];
    figur.rute = []; figur.x = sted[0]; figur.y = sted[1];
    centrerPaaFigur(true);
    feBesked(abTekst());
  }
  setInterval(function () {
    try { pakKanGaa(); pakGaaTil(); abSendUd(); } catch (e) {}
    // hold armbåndet friskt, mens man er på festivalen (så man kommer ind, lige når det er scannet)
    const ofte = iFest() && ab && ab.mit && !ab.mit.scannet ? 4000 : 20000;
    if ((iFest() || gaestAaben()) && Date.now() - abHentet > ofte) abHent().then(function () { if (gaestAaben()) tegnGaest(); });
  }, 1000);
  // kontrollen ved indgangen (en guldstreg på jorden), når der kræves armbånd
  function tegnAbKontrol(skilt) {
    if (!ab || !ab.salg || abKraev() === "fra") return;
    ctx.save();
    const linje = function (pts) {
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      if (skilt) return;   // stregen ligger på jorden, skiltet tegnes øverst
      ctx.strokeStyle = "rgba(255,217,138,.9)"; ctx.lineWidth = 3 * ZOOM; ctx.setLineDash([10 * ZOOM, 7 * ZOOM]); ctx.stroke();
    };
    let mid;
    if (abKraev() === "hele") {
      const a = punkt(AB_INDGANG.x1 + 1, AB_INDGANG.y0), b = punkt(AB_INDGANG.x1 + 1, AB_INDGANG.y1 + 1);
      linje([a, b]); mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    } else {
      const a = punkt(AB_SCENE.x0, AB_SCENE.y1 + 1), b = punkt(AB_SCENE.x1 + 1, AB_SCENE.y1 + 1);
      linje([a, b]); mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    ctx.setLineDash([]);
    if (!skilt) { ctx.restore(); return; }
    const t = "🎟 ARMBÅND-KONTROL";
    ctx.font = "bold " + Math.round(11 * ZOOM) + "px Georgia, serif";
    const w = ctx.measureText(t).width + 14 * ZOOM, h = 18 * ZOOM;
    ctx.fillStyle = "rgba(74,13,43,.9)"; ctx.strokeStyle = "#e8b65a"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mid.x - w / 2, mid.y - h - 6 * ZOOM, w, h, 6 * ZOOM); else ctx.rect(mid.x - w / 2, mid.y - h - 6 * ZOOM, w, h);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffe6f2"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(t, mid.x, mid.y - h / 2 - 6 * ZOOM);
    ctx.restore();
  }

  // ----- stregkode (Code 39, samme slags som biografbilletterne, så en rigtig håndscanner kan læse den) -----
  const AB_CODE39 = { "0": "101000111011101", "1": "111010001010111", "2": "101110001010111", "3": "111011100010101", "4": "101000111010111",
    "5": "111010001110101", "6": "101110001110101", "7": "101000101110111", "8": "111010001011101", "9": "101110001011101",
    "A": "111010100010111", "B": "101110100010111", "C": "111011101000101", "D": "101011100010111", "E": "111010111000101", "F": "101110111000101" };
  const AB_CODE39_KANT = "100010111011101";
  function abStregkode(kode) {
    const bits = [AB_CODE39_KANT].concat(String(kode).toUpperCase().split("").map(function (c) { return AB_CODE39[c] || ""; })).concat([AB_CODE39_KANT]).join("0");
    let rects = "", i = 0;
    while (i < bits.length) {
      if (bits[i] === "1") { let j = i; while (j < bits.length && bits[j] === "1") j++; rects += "<rect x='" + (i + 10) + "' y='0' width='" + (j - i) + "' height='40'/>"; i = j; } else i++;
    }
    return "<svg class='fe-stregkode' viewBox='0 0 " + (bits.length + 20) + " 40' preserveAspectRatio='none'><rect width='100%' height='40' fill='#fff'/><g fill='#000'>" + rects + "</g></svg>";
  }
  function klTid(t) { return t ? kl(t) : ""; }

  // ----- armbåndet i gæsteappen -----
  function abGaestHtml() {
    if (!feOnline()) return "";
    if (abFejl === AB_MANGLER) return feErAnsat() ? "<p class='ea-advarsel'>" + esc(AB_MANGLER) + "</p>" : "";
    if (!ab || !ab.salg) return "<p class='ea-info'>🎟 Henter armbånd …</p>";
    const s = ab.salg, m = ab.mit;
    let h = "";
    if (abFejl) h += "<p class='ea-advarsel'>" + esc(abFejl) + "</p>";
    if (m) {
      h += "<div class='fe-armbaand" + (m.scannet ? " ok" : "") + "'><div class='fe-ab-baand'><span>👑 VERA FESTIVAL</span><i>" + esc(m.spiller) + "</i></div>" +
        "<div class='fe-ab-kode'>" + abStregkode(m.kode) + "<b>" + esc(m.kode) + "</b></div>" +
        "<small>" + (m.scannet ? "✅ Scannet kl. " + klTid(m.scannet) + (m.scannet_af ? " af " + esc(m.scannet_af) : "") + ". Du kan gå frit rundt på festivalen."
          : "📟 Vis armbåndet til en Festival-vagt ved indgangen. Når det er scannet, kommer du ind.") + "</small></div>";
      return h;
    }
    const udsolgt = s.maks != null && s.solgt >= s.maks;
    h += "<div class='fe-ab-koeb'><b>🎟 Festival-armbånd</b><small>" +
      (s.kraev === "hele" ? "Du skal have et armbånd for at komme ind på festivalen." : s.kraev === "scene" ? "Du skal have et armbånd for at komme ind foran scenen." : "Armbåndet er dit bevis på, at du var med på Vera Festival.") +
      (s.maks != null ? " Der er " + Math.max(0, s.maks - s.solgt) + " tilbage." : "") + "</small>";
    if (udsolgt) h += "<em class='ea-aflyst'>Udsolgt</em>";
    else if (!s.salg) h += "<em class='ea-aflyst'>Ikke til salg lige nu</em>";
    else h += "<button class='ea-stor ea-guld' data-fg-ab='koeb'>" + (abBekraeft ? "✔ Ja, køb for " + s.pris + " ⭐" : "🎟 Køb armbånd · " + s.pris + " ⭐") + "</button>";
    return h + "</div>";
  }
  function abGaestKobl(el) {
    el.querySelectorAll("[data-fg-ab='koeb']").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!abBekraeft) { abBekraeft = true; tegnGaest(); setTimeout(function () { abBekraeft = false; if (gaestAaben()) tegnGaest(); }, 5000); return; }
        abBekraeft = false; b.disabled = true;
        abKoeb().then(function () { if (gaestAaben()) tegnGaest(); });
      });
    });
  }

  // ----- fanen 🎟 Armbånd i Festival-appen (ejeren, Eventværter og Eventfolk) -----
  let abNyFestival = false;
  function abStyrHtml() {
    let h = "";
    if (abPFejl) h += "<p class='ea-advarsel'>" + esc(abPFejl) + "</p>";
    if (!abP || !abP.salg) return h + "<p class='ea-info'>Henter armbånd …</p>";
    const s = abP.salg, liste = abP.armbaand || [];
    const udsolgt = s.maks != null && s.solgt >= s.maks;
    h += "<div class='fe-tal'><div><b>" + s.solgt + (s.maks != null ? "/" + s.maks : "") + "</b><small>solgt</small></div><div><b>" + s.scannet + "</b><small>scannet</small></div>" +
      "<div><b>" + (abP.glimt_ialt || 0) + " ⭐</b><small>tjent</small></div></div>" +
      (udsolgt ? "<p class='ea-advarsel'>🔴 Udsolgt! Sæt et højere antal eller fjern grænsen, hvis flere skal kunne købe.</p>" : "");
    h += "<div class='ea-hj-knapper'><button data-fe-ab='scanner'>📟 Åbn armbåndsscanneren</button></div>";
    h += "<h4 class='ea-dag'>⚙️ Salg</h4><div class='fe-bod'>" +
      "<form class='ar-form' data-fe-abform='pris'><label class='fe-lbl'>Pris pr. armbånd</label><input type='number' min='0' max='10000' name='v' value='" + s.pris + "'><span class='fe-enhed'>⭐</span><button type='submit'>Gem</button></form>" +
      "<form class='ar-form' data-fe-abform='maks'><label class='fe-lbl'>Højst antal</label><input type='number' min='0' name='v' value='" + (s.maks != null ? s.maks : "") + "' placeholder='ingen grænse'><button type='submit'>Gem</button></form>" +
      "<div class='ea-hj-knapper'><button data-fe-ab='salg'" + (s.salg ? " class='ar-valgt'" : "") + ">" + (s.salg ? "🟢 Salget er ÅBENT — tryk for at lukke" : "🔴 Salget er LUKKET — tryk for at åbne") + "</button></div></div>";
    h += "<h4 class='ea-dag'>🚪 Hvor skal man have armbånd?</h4><div class='ar-gitter'>" + Object.keys(AB_KRAEV).map(function (k) {
      return "<button data-fe-abkraev='" + k + "'" + (k === s.kraev ? " class='ar-valgt'" : "") + ">" + AB_KRAEV[k] + "</button>";
    }).join("") + "</div><p class='ea-info'>Ejeren og alle ansatte går altid frit. Gæster uden scannet armbånd bliver ved indgangen" +
      (s.kraev === "scene" ? " (her: kun pladsen foran scenen er spærret)" : "") + ".</p>";
    h += "<h4 class='ea-dag'>🎟 Solgte armbånd</h4>" + (liste.length ? "<ul class='fe-ab-liste'>" + liste.map(function (a) {
      return "<li class='" + (a.scannet ? "ok" : "") + "'><b>" + esc(a.spiller) + "</b><code>" + esc(a.kode) + "</code>" +
        (a.scannet ? "<em>✅ " + klTid(a.scannet) + "</em><button data-fe-abfortryd='" + a.id + "' title='Fortryd scanningen'>↩</button>"
          : "<button data-fe-abscan='" + esc(a.kode) + "' title='Scan'>📟</button>") +
        "<button data-fe-abfjern='" + a.id + "' class='ea-sikker' title='Fjern armbåndet og giv Glimt tilbage'>✕</button></li>";
    }).join("") + "</ul>" : "<p class='ea-tom'>Ingen har købt et armbånd endnu.</p>");
    h += "<h4 class='ea-dag'>🔄 Ny festival</h4><p class='ea-info'>Starter en ny festival: alle skal købe et nyt armbånd. De gamle armbånd virker ikke mere.</p>" +
      "<div class='ea-hj-knapper'><button data-fe-ab='ny' class='ea-sikker'>" + (abNyFestival ? "⚠️ Er du sikker? Tryk igen" : "🔄 Start en ny festival") + "</button></div>";
    return h;
  }
  function abStyrKobl(el) {
    const igen = function () { styrSidst = ""; tegnStyr(); };
    const besk = function (t) { if (styrApi && styrApi.besked) styrApi.besked(t); else feBesked(t); };
    el.querySelectorAll("[data-fe-abform]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        const v = f.querySelector("input").value.trim(), d = {};
        d[f.dataset.feAbform] = f.dataset.feAbform === "maks" ? v : Number(v || 0);
        abSaet(d).then(function () { besk(f.dataset.feAbform === "pris" ? "🎟 Prisen er nu " + abP.salg.pris + " ⭐" : abP.salg.maks != null ? "🎟 Højst " + abP.salg.maks + " armbånd" : "🎟 Ingen grænse for antal armbånd"); igen(); });
      });
    });
    el.querySelectorAll("[data-fe-abkraev]").forEach(function (k) { k.addEventListener("click", function () { abSaet({ kraev: k.dataset.feAbkraev }).then(function () { besk(AB_KRAEV[k.dataset.feAbkraev]); igen(); }); }); });
    el.querySelectorAll("[data-fe-abscan]").forEach(function (k) { k.addEventListener("click", function () { abScan(k.dataset.feAbscan); }); });
    el.querySelectorAll("[data-fe-abfortryd]").forEach(function (k) {
      k.addEventListener("click", function () { serverKald("hv_festival_scan_fortryd", { p_token: feToken(), p_id: Number(k.dataset.feAbfortryd) }).then(abPHent).catch(function (e) { abPFejl = abFejlTekst(e); }).then(igen); });
    });
    el.querySelectorAll("[data-fe-abfjern]").forEach(function (k) {
      k.addEventListener("click", function () {
        if (k.dataset.sikker !== "1") { k.dataset.sikker = "1"; k.textContent = "Fjern?"; return; }
        serverKald("hv_festival_armbaand_fjern", { p_token: feToken(), p_id: Number(k.dataset.feAbfjern) })
          .then(function (s) { abP = s; besk("✕ Armbåndet er fjernet, og Glimt er givet tilbage."); }).catch(function (e) { abPFejl = abFejlTekst(e); }).then(igen);
      });
    });
    el.querySelectorAll("[data-fe-ab]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.feAb;
        if (hvad === "scanner") { abAabnScanner(); return; }
        if (hvad === "salg") abSaet({ salg: !abP.salg.salg }).then(igen);
        if (hvad === "ny") {
          if (!abNyFestival) { abNyFestival = true; igen(); setTimeout(function () { abNyFestival = false; }, 5000); return; }
          abNyFestival = false;
          abSaet({ ny: true }).then(function () { besk("🔄 En ny festival er startet. Alle skal købe et nyt armbånd."); abHent(); igen(); });
        }
      });
    });
  }

  // ----- 📟 Armbåndsscanneren (ejeren og de ansatte, fx Festival-vagter) -----
  let abLyd = null;
  function abBip(ok) {
    try {
      abLyd = abLyd || new (window.AudioContext || window.webkitAudioContext)();
      const t = abLyd.currentTime;
      (ok ? [[1760, 0, 0.09], [2350, 0.1, 0.12]] : [[220, 0, 0.18], [180, 0.2, 0.25]]).forEach(function (n) {
        const o = abLyd.createOscillator(), g = abLyd.createGain();
        o.type = ok ? "square" : "sawtooth"; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.12, t + n[1] + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + n[2]);
        o.connect(g); g.connect(abLyd.destination); o.start(t + n[1]); o.stop(t + n[1] + n[2] + 0.02);
      });
    } catch (e) {}
  }
  const abScanner = document.createElement("div");
  abScanner.id = "fe-scanner";
  abScanner.hidden = true;
  abScanner.innerHTML =
    "<div class='fes-top'><span class='fes-led'></span><b>📟 Armbåndsscanner</b><button type='button' class='fes-luk' title='Luk'>✕</button></div>" +
    "<div class='fes-skaerm'><div class='fes-laser'></div><div class='fes-svar'><b>Klar til at scanne</b><small>Scan stregkoden eller skriv koden fra armbåndet</small></div></div>" +
    "<form class='fes-form'><input type='text' maxlength='20' placeholder='Kode, fx F3A9C1' autocomplete='off' spellcheck='false'><button type='submit'>Scan</button></form>" +
    "<div class='fes-liste'></div>";
  document.body.appendChild(abScanner);
  if (typeof goerFlytbar === "function") try { goerFlytbar(abScanner, abScanner.querySelector(".fes-top"), "mit-hotel-flyt-fe-scanner"); } catch (e) {}
  const abInput = abScanner.querySelector("input");
  abScanner.querySelector(".fes-luk").addEventListener("click", function () { abScanner.hidden = true; });
  abScanner.querySelector(".fes-form").addEventListener("submit", function (e) { e.preventDefault(); const k = abInput.value; abInput.value = ""; abScan(k); });
  function abAabnScanner() {
    if (!feErAnsat()) return;
    abScanner.hidden = false;
    if (typeof window.lukTelefon === "function") try { window.lukTelefon(); } catch (e) {}
    abTegnScanListe();
    setTimeout(function () { abInput.focus(); }, 50);
    abPHent().then(abTegnScanListe);
  }
  function abSvar(type, titel, tekst) {
    const s = abScanner.querySelector(".fes-svar");
    abScanner.querySelector(".fes-skaerm").className = "fes-skaerm " + type;
    s.innerHTML = "<b>" + titel + "</b><small>" + tekst + "</small>";
    clearTimeout(abSvar.t);
    abSvar.t = setTimeout(function () {
      abScanner.querySelector(".fes-skaerm").className = "fes-skaerm";
      s.innerHTML = "<b>Klar til at scanne</b><small>Scan stregkoden eller skriv koden fra armbåndet</small>";
    }, 6000);
  }
  function abScan(kode) {
    if (!feErAnsat()) return;
    abScanner.hidden = false;
    abSvar("", "Scanner …", esc(kode));
    serverKald("hv_festival_scan", { p_token: feToken(), p_kode: kode }).then(function (svar) {
      const a = svar.armbaand || {};
      if (svar.status === "allerede") { abBip(false); abSvar("gul", "⚠️ Allerede scannet", esc(a.spiller) + "<br>Scannet kl. " + klTid(a.scannet) + (a.scannet_af ? " af " + esc(a.scannet_af) : "")); }
      else { abBip(true); abSvar("groen", "✅ Godkendt", "<b>" + esc(a.spiller) + "</b> må komme ind på festivalen 🎡"); }
      return abPHent();
    }).then(function () { abTegnScanListe(); if (styrAaben()) { styrSidst = ""; tegnStyr(); } }).catch(function (e) {
      abBip(false);
      abSvar("roed", "❌ Ikke godkendt", esc(abFejlTekst(e)));
    });
  }
  function abTegnScanListe() {
    const holder = abScanner.querySelector(".fes-liste");
    if (abPFejl) { holder.innerHTML = "<p>" + esc(abPFejl) + "</p>"; return; }
    if (!abP) { holder.innerHTML = "<p>Henter armbånd …</p>"; return; }
    const l = (abP.armbaand || []).slice().sort(function (a, b) { return (a.scannet ? 1 : 0) - (b.scannet ? 1 : 0) || String(a.spiller).localeCompare(String(b.spiller)); });
    holder.innerHTML = "<h4>🎟 Vera Festival · " + esc(AB_KRAEV[abP.salg.kraev] || "") + "</h4><p class='fes-tal'>✅ " + abP.salg.scannet + " af " + abP.salg.solgt + " armbånd scannet</p>" +
      (l.length ? "<ul>" + l.map(function (a) {
        return "<li class='" + (a.scannet ? "ok" : "") + "'><span>" + esc(a.spiller) + "</span>" +
          (a.scannet ? "<em>✅ " + klTid(a.scannet) + "</em>" : "<button type='button' data-fes-scan='" + esc(a.kode) + "' title='Scan " + esc(a.spiller) + "s armbånd'>📟</button>") + "</li>";
      }).join("") + "</ul>" : "<p>Ingen har købt et armbånd endnu.</p>");
    holder.querySelectorAll("[data-fes-scan]").forEach(function (k) { k.addEventListener("click", function () { abScan(k.dataset.fesScan); }); });
  }
  setInterval(function () { if (!abScanner.hidden) { if (!feErAnsat()) { abScanner.hidden = true; return; } abPHent().then(abTegnScanListe); } }, 6000);
  // 📟-knap på festivalen for ejeren og de ansatte
  const abScanKnap = document.createElement("button");
  abScanKnap.id = "fe-scan-knap"; abScanKnap.type = "button"; abScanKnap.innerHTML = "📟 Armbåndsscanner"; abScanKnap.hidden = true;
  abScanKnap.addEventListener("click", function () { if (abScanner.hidden) abAabnScanner(); else abScanner.hidden = true; });
  document.body.appendChild(abScanKnap);
  setInterval(function () {
    const tlf = document.getElementById("telefon");
    const vis = iFest() && feOnline() && feErAnsat() && !(tlf && !tlf.hidden);   // skjules, mens telefonen er åben
    if (abScanKnap.hidden === vis) abScanKnap.hidden = !vis;
  }, 500);

  // ----- 🎟 Det nye job: Festival-vagt (samme opsætning som Biograf medhjælper i js/vera-cinema.js) -----
  const FV_SKILT = "festivalvagt";
  const FV_JOB_KAN = ["📟 Får armbåndsscanneren og scanner gæsternes festival-armbånd ved indgangen",
    "🚪 Går frit rundt på hele Vera Festival", "🎟 Kan se, hvem der har købt armbånd, og hvem der er scannet",
    "💼 Får løn hver mandag som de andre ansatte"];
  vent(function () { return typeof SKILTE !== "undefined" && typeof ANSAT_SKILTE !== "undefined"; }, function () {
    if (!SKILTE.some(function (s) { return s.id === FV_SKILT; })) {
      let efter = SKILTE.findIndex(function (s) { return s.id === "biografhjaelper"; });
      if (efter < 0) efter = SKILTE.findIndex(function (s) { return s.id === "eventfolk"; });
      if (efter < 0) efter = SKILTE.findIndex(function (s) { return s.id === "eventvaert"; });
      SKILTE.splice(efter + 1, 0, { id: FV_SKILT, navn: "Festival-vagt", tekst: "Scanner festival-armbånd ved indgangen til Vera Festival.",
        fil: "billeder/skilte/festival-vagt.png" });
    }
    if (ANSAT_SKILTE.indexOf(FV_SKILT) < 0) ANSAT_SKILTE.push(FV_SKILT);
    if (typeof JOB_KAN !== "undefined") JOB_KAN[FV_SKILT] = FV_JOB_KAN.concat(typeof PERSONALE_KAN !== "undefined" ? PERSONALE_KAN : []);
  });
  vent(function () { return typeof JOB_BESKRIVELSE !== "undefined" && typeof SKILTE !== "undefined"; }, function () {
    JOB_BESKRIVELSE[FV_SKILT] = "Som Festival-vagt står du ved porten til Vera Festival og scanner gæsternes festival-armbånd med armbåndsscanneren 📟. Gæsterne køber armbåndet i appen Vera Festival, og de kommer først længere ind end indgangen, når armbåndet er scannet. Du hjælper gæsterne og holder øje med, at alle har armbånd.";
    SKILTE.forEach(function (sk) { if (sk.id === FV_SKILT) sk.beskrivelse = JOB_BESKRIVELSE[FV_SKILT]; });
  });
  vent(function () { return typeof ROLLE_FANER !== "undefined" && typeof ROLLE_NAVN !== "undefined"; }, function () {
    function giv() {
      const fra = (ROLLE_FANER.staff || ["guide", "mitjob", "staffchat"]).filter(function (f) { return f !== "beskeder"; });
      if (!ROLLE_FANER[FV_SKILT]) ROLLE_FANER[FV_SKILT] = [];
      const l = ROLLE_FANER[FV_SKILT];
      fra.forEach(function (f) { if (l.indexOf(f) < 0) l.push(f); });
      if (l.indexOf("guide") > 0) { l.splice(l.indexOf("guide"), 1); l.unshift("guide"); }
      ROLLE_NAVN[FV_SKILT] = "🛡️ Festival-panel";
    }
    giv();
    setInterval(giv, 2000);
  });
  vent(function () { return typeof ROLLE_GUIDE !== "undefined"; }, function () {
    ROLLE_GUIDE[FV_SKILT] = "Du er Festival-vagt. Gå til Vera Festival og tryk 📟 Armbåndsscanner øverst til højre. Scan gæsternes armbånd ved porten, så kan de komme ind.";
  });
  vent(function () { return typeof STAFF_RANG !== "undefined"; }, function () {
    if (STAFF_RANG.some(function (r) { return r[0] === FV_SKILT; })) return;
    const i = STAFF_RANG.findIndex(function (r) { return r[0] === "andet"; });
    STAFF_RANG.splice(i < 0 ? STAFF_RANG.length : i, 0, [FV_SKILT, "🎟 Festival-vagt"]);
  });
  vent(function () { return typeof VS_KATEGORIER !== "undefined"; }, function () {
    if (!VS_KATEGORIER.some(function (k) { return k[0] === FV_SKILT; })) VS_KATEGORIER.push([FV_SKILT, "🎟", "Festival-vagt"]);
    if (typeof JOB_KAN !== "undefined" && JOB_KAN[FV_SKILT] && JOB_KAN[FV_SKILT].indexOf("📅 Kan skrive sig på vagter i vagtskemaet") < 0) JOB_KAN[FV_SKILT].push("📅 Kan skrive sig på vagter i vagtskemaet");
  });

  // =============================================================
  //  Til andre filer: window.veraFestival
  // =============================================================
  window.veraFestival = { saet: saetFest, hent: function () { return fe; }, program: function () { return program; }, gaaTil: gaaTilFestival, sluk: slukAlt };

  // =============================================================
  //  Stil (vinrød, rosa og guld)
  // =============================================================
  const stil = document.createElement("style");
  stil.textContent =
    "#fe-skilt { position: fixed; left: 50%; top: 70px; transform: translateX(-50%); z-index: 57; pointer-events: none; text-align: center;" +
    " background: linear-gradient(#5a1238, #2e0a1b); color: #ffe6f2; border: 2px solid #e8b65a; border-radius: 14px; padding: 8px 22px;" +
    " box-shadow: 0 8px 30px rgba(0,0,0,.45), 0 0 18px rgba(255,90,170,.35); font-family: Georgia, serif; max-width: 92vw; }" +
    "#fe-skilt[hidden] { display: none !important; }" +
    "#fe-skilt .fs-top { font: bold 13px Georgia, serif; letter-spacing: 3px; color: #ffc6e2; }" +
    "#fe-skilt .fs-stor { font: bold 20px Georgia, serif; margin-top: 4px; }" +
    "#fe-skilt .fs-lille { font-size: 14px; margin-top: 3px; }" +
    "#fe-skilt .fs-tal { font: bold 46px Georgia, serif; color: #ffd27a; text-shadow: 0 0 18px #ff5fae; }" +
    "#fe-lyd { position: fixed; right: 16px; top: 120px; z-index: 58; padding: 8px 14px; border: 2px solid #d9a441; border-radius: 8px;" +
    " background: #8a1446; color: #ffe1ef; font-weight: bold; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.4); }" +
    "#fe-lyd[hidden] { display: none !important; }" +
    "#telefon .fe-app { background: radial-gradient(120% 60% at 50% 0%, #7a1446, #22061a 70%) !important; }" +
    "#telefon .fe-logo b { font: 900 26px/1 Georgia, serif; letter-spacing: 4px; color: #ffd98a; text-shadow: 0 0 14px rgba(255,90,170,.6); }" +
    "#telefon .fe-logo span { color: #ff9cc9; }" +
    "#telefon .fe-bod { margin: 6px 0; padding: 7px 8px; border-radius: 12px; border: 1px solid rgba(255,156,201,.35); background: rgba(0,0,0,.22); }" +
    "#telefon .fe-bod > b { display: block; font-size: 12px; margin-bottom: 3px; color: #fff0f7; } #telefon .fe-bod > b small { font-weight: normal; opacity: .75; float: right; }" +
    "#telefon .fe-alle { border-color: #ffd98a; }" +
    "#telefon .fe-plakat { text-align: center; display: grid; gap: 0; margin: 4px 0 10px; padding: 12px 6px 10px; border-radius: 16px;" +
    " background: linear-gradient(160deg, #a8204e, #3a0820); border: 2px solid #e8b65a; box-shadow: 0 0 18px rgba(255,90,170,.35) inset; }" +
    "#telefon .fe-plakat span { font-size: 28px; line-height: 1; } #telefon .fe-plakat b { font: 900 34px/1 Georgia, serif; color: #ffe3f1; letter-spacing: 6px; text-shadow: 0 0 16px #ff4fa8; }" +
    "#telefon .fe-plakat i { font: bold 12px Georgia, serif; color: #ffd98a; letter-spacing: 2px; font-style: normal; } #telefon .fe-plakat small { opacity: .75; margin-top: 4px; font-size: 10.5px; }" +
    "#telefon .fe-live { margin: 0 0 8px; padding: 8px; border-radius: 10px; background: rgba(255,60,110,.18); border: 1px solid #ff5c8c; font-size: 12px; }" +
    "#telefon .ea-app .ar-hurtig { margin: 0 0 10px; padding: 8px; border: 2px solid #d9a441; border-radius: 12px; background: rgba(0,0,0,.25); }" +
    "#telefon .ea-app .ar-hurtig-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; } #telefon .ea-app .ar-hurtig-top small { font-weight: bold; color: #ffd27a; }" +
    "#telefon .ea-app .ar-sluk { padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; background: #e0283c !important; color: #fff !important; border: 2px solid #ffd27a; }" +
    "#telefon .ea-app .ar-hr { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 4px 0; }" +
    "#telefon .ea-app .ar-hr > span { width: 42px; font-size: 10px; opacity: .85; }" +
    "#telefon .ea-app .ar-hr button { min-width: 32px; height: 32px; padding: 0 5px; border-radius: 8px; cursor: pointer; font-size: 16px; line-height: 1; border: 1px solid rgba(217,164,65,.4); background: rgba(255,255,255,.08); color: #fff; }" +
    "#telefon .ea-app .ar-hr-store button { flex: 1 1 auto; font-size: 11px; font-weight: bold; }" +
    "#telefon .ea-app button.ar-valgt { outline: 2px solid #ffd27a; outline-offset: 1px; background: linear-gradient(#e0559a, #8a1446) !important; color: #fff !important; box-shadow: 0 0 10px #ff7ac0; }" +
    "#telefon .ea-app .ar-gitter { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }" +
    "#telefon .ea-app .ar-gitter button { padding: 9px 4px; border-radius: 9px; cursor: pointer; font-weight: 600; border: 1px solid rgba(217,164,65,.4); background: rgba(255,255,255,.08); color: #fff; }" +
    "#telefon .ea-app .ea-hj-knapper { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; } #telefon .ea-app .ea-hj-knapper button { flex: 1 1 auto; padding: 8px; border-radius: 9px; cursor: pointer; font-weight: bold; border: 1px solid rgba(217,164,65,.5); background: rgba(255,255,255,.08); color: #ffe7b0; }" +
    "#telefon .ea-app .ar-skaermliste { list-style: none; margin: 6px 0; padding: 0; font-size: 12px; }" +
    "#telefon .ea-app .ar-skaermliste li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid rgba(217,164,65,.25); }" +
    "#telefon .ea-app .ar-skaermliste b { color: #d9a441; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55%; }" +
    "#telefon .ea-app .ar-skaermliste li button { padding: 2px 8px; border-radius: 6px; cursor: pointer; }" +
    "#telefon .ea-app .ar-skaermboks { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; padding: 8px; border: 1px solid rgba(217,164,65,.45); border-radius: 10px; }" +
    "#telefon .ea-app .ar-skaermboks input, #telefon .ea-app .ar-form input { padding: 7px; border-radius: 8px; border: 2px solid #d9a441; min-width: 0; }" +
    "#telefon .ea-app .ar-skaermboks small { opacity: .85; font-size: 11px; }" +
    "#telefon .ea-app .ar-skaermknapper { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 6px; }" +
    "#telefon .ea-app .ar-skaermknapper button { padding: 9px 4px; border-radius: 8px; cursor: pointer; font-weight: bold; }" +
    "#telefon .ea-app .ar-form { display: flex; gap: 6px; margin: 6px 0; } #telefon .ea-app .ar-form input { flex: 1; } #telefon .ea-app .ar-form button { padding: 6px 10px; border-radius: 8px; cursor: pointer; }";
  // 🎟 armbånd + armbåndsscanner
  stil.textContent += [
    "#telefon .fe-armbaand { margin: 8px 0; padding: 10px; border-radius: 14px; background: linear-gradient(160deg, #ff8fc6, #b0285f 60%, #5a0d2e); border: 2px solid #ffd98a; box-shadow: 0 6px 18px rgba(0,0,0,.35); color: #fff; }",
    "#telefon .fe-armbaand.ok { border-color: #8fe0a0; box-shadow: 0 0 0 2px rgba(143,224,160,.35), 0 6px 18px rgba(0,0,0,.35); }",
    "#telefon .fe-ab-baand { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-radius: 20px; background: repeating-linear-gradient(90deg, #ffd98a 0 6px, #f3b94b 6px 12px); color: #5a0d2e; font: 900 12px Georgia, serif; letter-spacing: 1px; }",
    "#telefon .fe-ab-baand i { font-style: normal; font-weight: 700; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    "#telefon .fe-ab-kode { margin: 8px 0 6px; padding: 6px; border-radius: 10px; background: #fff; text-align: center; }",
    "#telefon .fe-ab-kode b { display: block; color: #111; font: 700 15px 'Courier New', monospace; letter-spacing: 4px; }",
    "#telefon .fe-stregkode { width: 100%; height: 44px; display: block; }",
    "#telefon .fe-armbaand small { display: block; font-size: 11.5px; line-height: 1.35; }",
    "#telefon .fe-ab-koeb { margin: 8px 0; padding: 10px; border-radius: 14px; border: 2px dashed #ffd98a; background: rgba(0,0,0,.25); display: grid; gap: 6px; }",
    "#telefon .fe-ab-koeb b { color: #ffd98a; } #telefon .fe-ab-koeb small { font-size: 11.5px; opacity: .9; line-height: 1.35; }",
    "#telefon .fe-tal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 6px 0; }",
    "#telefon .fe-tal div { text-align: center; padding: 6px 2px; border-radius: 10px; background: rgba(0,0,0,.25); border: 1px solid rgba(255,217,138,.4); }",
    "#telefon .fe-tal b { display: block; color: #ffd98a; font-size: 16px; } #telefon .fe-tal small { font-size: 10.5px; opacity: .8; }",
    "#telefon .fe-bod .ar-form { display: flex; gap: 6px; align-items: center; margin: 4px 0; }",
    "#telefon .fe-lbl { flex: 1.3; font-size: 11.5px; } #telefon .fe-bod .ar-form input { flex: 1; min-width: 0; width: 60px; padding: 6px; border-radius: 8px; border: 2px solid #d9a441; }",
    "#telefon .fe-enhed { font-size: 12px; }",
    "#telefon .fe-ab-liste { list-style: none; margin: 4px 0; padding: 0; display: grid; gap: 4px; }",
    "#telefon .fe-ab-liste li { display: flex; align-items: center; gap: 6px; padding: 5px 7px; border-radius: 9px; background: rgba(0,0,0,.25); font-size: 12px; }",
    "#telefon .fe-ab-liste li.ok { background: rgba(47,174,92,.22); }",
    "#telefon .fe-ab-liste li b { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    "#telefon .fe-ab-liste li code { font-size: 11px; color: #ffd98a; } #telefon .fe-ab-liste li em { font-style: normal; font-size: 10.5px; color: #9fe0a8; }",
    "#telefon .fe-ab-liste li button { border: 1px solid rgba(255,217,138,.5); border-radius: 7px; background: rgba(0,0,0,.3); color: #fff; cursor: pointer; padding: 1px 6px; }",
    "#fe-scan-knap { position: fixed; right: 16px; top: 166px; z-index: 40; padding: 8px 14px; border-radius: 12px; border: 2px solid #d9a441; background: linear-gradient(#8a1446, #3a0820); color: #ffe7b0; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.4); }",
    "#fe-scan-knap[hidden], #fe-scanner[hidden] { display: none !important; }",
    "#fe-scanner { position: fixed; right: 24px; top: 210px; z-index: 60; width: 300px; max-width: calc(100vw - 32px); background: linear-gradient(#5a1238, #23060f); border-radius: 26px 26px 18px 18px; padding: 10px 12px 14px; box-shadow: 0 14px 34px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.15); color: #f2f2f2; font-size: 12.5px; border: 2px solid #15161a; }",
    "#fe-scanner .fes-top { display: flex; align-items: center; gap: 8px; padding: 2px 4px 8px; cursor: move; } #fe-scanner .fes-top b { flex: 1; color: #ffd98a; letter-spacing: .5px; }",
    "#fe-scanner .fes-led { width: 9px; height: 9px; border-radius: 50%; background: #ff3b9b; box-shadow: 0 0 8px #ff3b9b; animation: fes-blink 1.2s infinite; }",
    "@keyframes fes-blink { 50% { opacity: .3; } } @keyframes fes-laser { from { top: 20%; } to { top: 80%; } }",
    "#fe-scanner .fes-luk { width: 26px; height: 26px; border-radius: 8px; border: 1px solid #777; background: #33363d; color: #fff; cursor: pointer; padding: 0; }",
    "#fe-scanner .fes-skaerm { position: relative; height: 104px; border-radius: 12px; background: radial-gradient(120% 120% at 50% 0%, #20343a, #0b1416); border: 3px solid #111; overflow: hidden; display: grid; place-items: center; text-align: center; transition: background .2s; }",
    "#fe-scanner .fes-skaerm.groen { background: radial-gradient(120% 120% at 50% 0%, #2fae5c, #0d3b1e); } #fe-scanner .fes-skaerm.roed { background: radial-gradient(120% 120% at 50% 0%, #d23a4a, #3b0d14); }",
    "#fe-scanner .fes-skaerm.gul { background: radial-gradient(120% 120% at 50% 0%, #d9a441, #4a3410); }",
    "#fe-scanner .fes-laser { position: absolute; left: 8%; right: 8%; height: 2px; background: #ff2a2a; box-shadow: 0 0 10px 2px rgba(255,40,40,.8); top: 50%; animation: fes-laser 1.6s ease-in-out infinite alternate; }",
    "#fe-scanner .fes-skaerm.groen .fes-laser, #fe-scanner .fes-skaerm.roed .fes-laser, #fe-scanner .fes-skaerm.gul .fes-laser { display: none; }",
    "#fe-scanner .fes-svar { position: relative; display: grid; gap: 4px; padding: 0 10px; } #fe-scanner .fes-svar b { font-size: 15px; } #fe-scanner .fes-svar small { font-size: 11.5px; opacity: .92; line-height: 1.35; }",
    "#fe-scanner .fes-form { display: flex; gap: 6px; margin: 10px 0 8px; }",
    "#fe-scanner .fes-form input { flex: 1; min-width: 0; padding: 8px 10px; border-radius: 10px; border: 2px solid #111; background: #e9efe9; color: #111; font: 700 15px 'Courier New', monospace; letter-spacing: 3px; text-transform: uppercase; }",
    "#fe-scanner .fes-form button { padding: 0 14px; border-radius: 10px; border: 0; background: linear-gradient(#ff5aa8, #c0285f); color: #fff; font-weight: 800; cursor: pointer; box-shadow: 0 3px 0 #6d0f36; }",
    "#fe-scanner .fes-liste { background: rgba(0,0,0,.25); border-radius: 12px; padding: 8px 10px; max-height: 230px; overflow-y: auto; }",
    "#fe-scanner .fes-liste h4 { margin: 0 0 4px; color: #ffd98a; font-size: 12.5px; } #fe-scanner .fes-liste p { margin: 2px 0 6px; } #fe-scanner .fes-tal { color: #9fe0a8; font-weight: 700; }",
    "#fe-scanner .fes-liste ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; }",
    "#fe-scanner .fes-liste li { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 8px; background: rgba(255,255,255,.06); } #fe-scanner .fes-liste li.ok { background: rgba(47,174,92,.18); }",
    "#fe-scanner .fes-liste li span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } #fe-scanner .fes-liste li em { font-style: normal; font-size: 11px; color: #9fe0a8; }",
    "#fe-scanner .fes-liste li button { border: 1px solid #777; border-radius: 7px; background: #33363d; color: #fff; cursor: pointer; padding: 2px 8px; }",
  ].join("");
  document.head.appendChild(stil);

  // =============================================================
  //  Start: vent til spillet, staff-møblerne og telefonen er klar
  // =============================================================
  vent(function () {
    return typeof INDBYGGEDE_RUM !== "undefined" && typeof NAV_RUM !== "undefined" && typeof MOEBEL_TYPER !== "undefined" &&
      typeof tegnGulv === "function" && typeof vaerelseMoebler === "function" && !!MOEBEL_TYPER["ev-vip-sofa"];
  }, function () {
    if (typeof INDBYGGEDE_RUM === "undefined") return;
    lavMoebler();
    lavRummet();
    saetIframesInd();
    requestAnimationFrame(placerSkaerme);
    requestAnimationFrame(foelgKamera);
    if (iFest()) hentFest();
    hentProgram();
  });
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () {
    window.tlfTilfoejApp("festival", STYR_APP);
    window.tlfTilfoejApp("festival-program", GAEST_APP);
  });
})();
