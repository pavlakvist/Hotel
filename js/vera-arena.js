// =============================================================
//  🏟 Vera arena — det store event-rum i gameshow-look (1. sal)
//  Rummet har tre dele:
//    1) Hovedscenen ved bagvæggen (med værtspult, spotlights og scene-lys)
//    2) Udfordringsbanen midt i rummet (banen kan skifte spil)
//    3) Tilskuerområdet med tribuner i venstre side, højre side og forrest
//  - Tre store skærme på væggene. De kan vise YouTube (kun på nettet, ikke file://) eller en stor tekst.
//  - :skift          → banen skifter til næste spil
//    :skift <navn>   → fx :skift forhindring, :skift rød, :skift quiz, :skift tom
//    :skift liste    → viser alle baner
//    Kun Eventfolk, Eventværter og ejeren må bruge :skift.
//  - Alt kan også styres fra Event-appen på telefonen: fanen 🏟 Arena (bane, scene-lys, skærme, skilt, nedtælling).
//  - NYE BANER: læg en ny bane i ARENA_BANER herunder (eller kald window.veraArena.tilfoejBane({...}) fra en anden fil).
//    En bane er bare et navn og en liste med møbler, der står på udfordringsbanen (x 4–15, y 6–11).
//  - Møblerne (realistiske 3D): ar-tribune, ar-vaertspult, ar-deltagerpult, ar-kegle, ar-haek, ar-start, ar-maal,
//    ar-plade-roed, ar-plade-guld, ar-mysteriekasse. Billeder i billeder/moebler/ar-*/. De findes også under Staff.
//  Kræver database-58-vera-arena.sql. Hentes fra slutningen af js/panel-forklaring.js (hotel.html ikke rørt).
//  Alt her hedder "ar…", "arena…" eller "ARENA…", så det ikke støder ind i andre filer.
// =============================================================
(function () {
  if (window.veraArenaKlar) return;
  window.veraArenaKlar = true;

  const ARENA_ID = "arena";
  const ARENA_MANGLER = "⚠️ Serveren kender ikke Vera arena endnu. Kør database-58-vera-arena.sql i Supabase → SQL Editor.";
  const ARENA_FRA_FIL = location.protocol === "file:";
  // områderne i rummet (felter)
  const AR_SCENE = { x0: 6, y0: 0, b: 8, d: 4 };     // hovedscenen ved bagvæggen
  const AR_BANE = { x0: 4, y0: 6, b: 12, d: 6 };     // udfordringsbanen

  // =============================================================
  //  🔄 BANERNE (spillene på udfordringsbanen). Nemt at udvide: kopiér en bane og ret den.
  //  retning: 0 = forsiden mod forreste venstre (+y), 1 = mod højre (+x), 2 = mod scenen (-y), 3 = mod venstre (-x)
  // =============================================================
  const ARENA_BANER = [
    { id: "tom", navn: "Tom bane", ikon: "⬜", om: "Banen er tom. Godt til dans, præmieoverrækkelse eller jeres egne lege.", moebler: [] },
    { id: "forhindring", navn: "Forhindringsbane", ikon: "🏃", tid: "5–10 min", folk: "2+",
      om: "Løb fra START til MÅL uden om keglerne og hækkene. Den første i mål vinder.",
      regler: ["Alle stiller sig på START.", "Værten tæller ned (Event-appen → 🏟 Arena → Nedtælling).", "Løb uden om keglerne og gennem hullerne i hækkene.", "Den første på MÅL vinder runden."],
      moebler: [
        { type: "ar-start", x: 4, y: 6, retning: 0 }, { type: "ar-start", x: 4, y: 9, retning: 0 },
        { type: "ar-kegle", x: 6, y: 6 }, { type: "ar-kegle", x: 6, y: 8 }, { type: "ar-kegle", x: 6, y: 10 },
        { type: "ar-kegle", x: 8, y: 7 }, { type: "ar-kegle", x: 8, y: 9 }, { type: "ar-kegle", x: 8, y: 11 },
        { type: "ar-haek", x: 10, y: 6, retning: 1 }, { type: "ar-haek", x: 10, y: 7, retning: 1 },
        { type: "ar-haek", x: 10, y: 9, retning: 1 }, { type: "ar-haek", x: 10, y: 10, retning: 1 },
        { type: "ar-kegle", x: 12, y: 6 }, { type: "ar-kegle", x: 12, y: 8 }, { type: "ar-kegle", x: 12, y: 10 },
        { type: "ar-mysteriekasse", x: 13, y: 11 },
        { type: "ar-maal", x: 15, y: 6, retning: 0 }, { type: "ar-maal", x: 15, y: 9, retning: 0 },
      ] },
    { id: "roedguld", navn: "Rød eller Guld", ikon: "🟥", tid: "10–15 min", folk: "3+",
      om: "Værten stiller et spørgsmål med to svar. Stil dig på RØD eller GULD. De, der står forkert, er ude.",
      regler: ["Værten siger et spørgsmål og to svar: ét er rødt og ét er guld.", "Alle har 10 sekunder til at stille sig på en farve (brug nedtællingen).", "De, der står på den forkerte farve, er ude og går op på tribunen.", "Den sidste tilbage vinder."],
      moebler: (function () {
        const l = [];
        for (let x = 5; x <= 8; x++) for (let y = 6; y <= 11; y++) l.push({ type: "ar-plade-roed", x: x, y: y });
        for (let x = 11; x <= 14; x++) for (let y = 6; y <= 11; y++) l.push({ type: "ar-plade-guld", x: x, y: y });
        return l;
      })() },
    { id: "quiz", navn: "Buzzer-quiz", ikon: "🔴", tid: "10–20 min", folk: "2–5",
      om: "Fem deltagere står bag hver sin pult med en buzzer. Værten læser spørgsmål op fra værtspulten på scenen.",
      regler: ["Fem deltagere stiller sig på guldpladerne bag pultene.", "Værten læser et spørgsmål op.", "Den første, der skriver svaret i chatten, får et point (værten holder øje).", "Vinderen må vælge en af mysteriekasserne!"],
      moebler: [
        { type: "ar-plade-guld", x: 5, y: 7 }, { type: "ar-plade-guld", x: 7, y: 7 }, { type: "ar-plade-guld", x: 9, y: 7 },
        { type: "ar-plade-guld", x: 11, y: 7 }, { type: "ar-plade-guld", x: 13, y: 7 },
        { type: "ar-deltagerpult", x: 5, y: 8, retning: 0 }, { type: "ar-deltagerpult", x: 7, y: 8, retning: 0 },
        { type: "ar-deltagerpult", x: 9, y: 8, retning: 0 }, { type: "ar-deltagerpult", x: 11, y: 8, retning: 0 },
        { type: "ar-deltagerpult", x: 13, y: 8, retning: 0 },
        { type: "ar-mysteriekasse", x: 6, y: 11 }, { type: "ar-mysteriekasse", x: 9, y: 11 }, { type: "ar-mysteriekasse", x: 12, y: 11 },
      ] },
  ];

  // =============================================================
  //  📺 De store skærme (på væggene). fra/til = felter langs væggen, bund/top = pixels over gulvet
  // =============================================================
  const AR_SKAERME = [
    { id: "midt", navn: "Storskærmen", vaeg: "bag", fra: 6.4, til: 13.6, bund: 105, top: 290, lyd: true },
    { id: "venstre", navn: "Venstre skærm", vaeg: "venstre", fra: 5.2, til: 10.8, bund: 125, top: 275 },
    { id: "hoejre", navn: "Højre skærm", vaeg: "bag", fra: 15.3, til: 19.7, bund: 140, top: 260 },
  ];
  const AR_SCENELYS = { slukket: "⚫ Slukket", varm: "🟡 Varmt lys", show: "🌈 Show", spots: "🔦 Søgelys", disko: "🪩 Disko",
    puls: "💓 Puls", regnbue: "🌈 Farveskift", strobe: "⚡ Stroboskop" };
  // ✨ Effekterne i arenaen (tændes og slukkes hver for sig fra Event-appen). Alle i rummet ser dem samtidig.
  const AR_EFFEKTER = { roeg: "🌫 Røg", konfetti: "🎊 Konfetti", bobler: "🫧 Sæbebobler", ild: "🔥 Flammer", fyrvaerkeri: "🎆 Fyrværkeri",
    sne: "❄️ Snefald", hjerter: "💖 Hjerter", glitter: "✨ Glitter" };

  // =============================================================
  //  Små hjælpere
  // =============================================================
  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 160) { try { gør(); } catch (e) { console.error(e); } return; }
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function iArena() { try { return rumValg === "vaerelse" && aktivtVaerelse === ARENA_ID; } catch (e) { return false; } }
  function arToken() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function arOnline() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function"; }
  function arMangler(e) { return /function|schema cache|does not exist|hv_arena/i.test((e && e.message) || ""); }
  function arMig() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  // Eventfolk, Eventværter og ejeren (ejeren må altid)
  function arMaa() {
    try {
      if (typeof EJERE !== "undefined" && EJERE.indexOf(arMig()) >= 0) return true;
      if (window.eventApp && window.eventApp.maaBruge) return !!window.eventApp.maaBruge();
      return typeof ansatte !== "undefined" && ["eventvaert", "eventfolk"].indexOf(ansatte[arMig()]) >= 0;
    } catch (e) { return false; }
  }
  function arBesked(t) { try { if (typeof besked !== "undefined" && besked) besked.textContent = t; } catch (e) {} }
  // YouTube-videoens id ud fra et link (youtube.com/watch?v=…, youtu.be/…, shorts/…, embed/…, live/…)
  function arYoutubeId(link) {
    const t = String(link || "").trim();
    const m = t.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(t) ? t : null;
  }
  // ligner teksten et link? (links skal aldrig stå som tekst på skærmene)
  function erLink(t) { return /https?:\/\/|www\.|youtu\.?be|\.com\b|\.dk\b/i.test(String(t || "")); }
  function find(id) { return ARENA_BANER.find(function (b) { return b.id === id; }) || null; }
  function lilleNavn(t) {
    return String(t || "").toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa").replace(/[^a-z0-9]/g, "");
  }
  // find en bane ud fra det, man skrev (id, navn eller begyndelsen af navnet)
  function findBane(tekst) {
    const n = lilleNavn(tekst);
    if (!n) return null;
    return ARENA_BANER.find(function (b) { return lilleNavn(b.id) === n || lilleNavn(b.navn) === n; }) ||
      ARENA_BANER.find(function (b) { return lilleNavn(b.id).indexOf(n) === 0 || lilleNavn(b.navn).indexOf(n) === 0; }) ||
      ARENA_BANER.find(function (b) { return lilleNavn(b.navn).indexOf(n) >= 0; }) || null;
  }

  // =============================================================
  //  Arenaens tilstand (fra serveren) og serverens ur
  // =============================================================
  let ar = { bane: "forhindring", skaerme: {}, scene: "varm" };
  let arUrForskel = 0, arFejl = "", arHentet = false;
  function arNu() { return Date.now() + arUrForskel; }
  function brugSvar(svar, sendt) {
    if (!svar) return;
    if (svar.nu) arUrForskel = svar.nu + (sendt ? (Date.now() - sendt) / 2 : 0) - Date.now();
    if (svar.tilstand && typeof svar.tilstand === "object") {
      const t = svar.tilstand;
      ar = { bane: t.bane || "forhindring", baneTid: t.baneTid, baneAf: t.baneAf, skaerme: t.skaerme || {}, scene: t.scene || "varm",
        skilt: t.skilt || null, nedtael: t.nedtael || 0, effekter: t.effekter || {} };
    }
    arHentet = true;
    arFejl = "";
    opdaterSkaerme();
  }
  let henter = false;
  function hentArena() {
    if (!arOnline() || henter) return Promise.resolve();
    henter = true;
    const sendt = Date.now();
    return serverKald("hv_arena_hent", { p_rum: ARENA_ID })
      .then(function (s) { brugSvar(s, sendt); })
      .catch(function (e) { arFejl = arMangler(e) ? ARENA_MANGLER : (e.message || "Kunne ikke hente arenaen."); })
      .finally(function () { henter = false; });
  }
  // Sæt noget i arenaen: { bane } · { skaerm: { id, v, tekst } } · { scene } · { skilt } · { nedtael }
  function saetArena(del) {
    // lokalt med det samme, så knapperne svarer hurtigt
    const nu = arNu();
    if (del.bane) { ar.bane = del.bane; ar.baneTid = nu; ar.baneAf = arMig(); }
    if (del.scene) ar.scene = del.scene;
    if ("skilt" in del) ar.skilt = del.skilt ? { tekst: del.skilt, tid: nu } : null;
    if (del.effekter) ar.effekter = del.effekter;
    if ("nedtael" in del) ar.nedtael = del.nedtael ? nu + del.nedtael * 1000 : 0;
    if (del.skaerm) {
      const ids = del.skaerm.id === "alle" ? AR_SKAERME.map(function (s) { return s.id; }) : [del.skaerm.id];
      ar.skaerme = Object.assign({}, ar.skaerme);
      ids.forEach(function (id) {
        const g = ar.skaerme[id] || {};
        ar.skaerme[id] = { v: del.skaerm.v || null, tekst: del.skaerm.tekst || "", t: nu, n: (g.n || 0) + 1, af: arMig() };
      });
    }
    opdaterSkaerme();
    if (!arOnline() || !arToken()) { arFejl = "Du er ikke på serveren, så kun du kan se det."; return Promise.resolve(); }
    const sendt = Date.now();
    return serverKald("hv_arena_saet", { p_token: arToken(), p_rum: ARENA_ID, p_del: del })
      .then(function (s) { brugSvar(s, sendt); })
      .catch(function (e) {
        arFejl = arMangler(e) ? ARENA_MANGLER : "Serveren svarede ikke, så det ses kun hos dig lige nu. (" + (e.message || "fejl") + ")";
        if (/logget ind|Kun ejeren/i.test(e.message || "")) arFejl = e.message;
      });
  }

  // =============================================================
  //  :skift — skift spillet på udfordringsbanen
  // =============================================================
  function skiftBane(tekst) {
    if (!arMaa()) { arBesked("🏟 Kun Eventfolk, Eventværter og ejeren kan skifte banen i Vera arena."); return; }
    const t = String(tekst || "").trim();
    if (/^(liste|baner|hjaelp|hjælp|\?)$/i.test(t)) {
      arBesked("🏟 Baner: " + ARENA_BANER.map(function (b) { return b.ikon + " " + b.navn + " (:skift " + b.id + ")"; }).join(" · "));
      return;
    }
    let ny;
    if (!t) {
      const i = ARENA_BANER.findIndex(function (b) { return b.id === ar.bane; });
      ny = ARENA_BANER[(i + 1) % ARENA_BANER.length];
    } else {
      ny = findBane(t);
      if (!ny) { arBesked("🏟 Der er ingen bane, der hedder \"" + t + "\". Skriv :skift liste for at se dem alle."); return; }
    }
    saetArena({ bane: ny.id });
    arBesked("🏟 Udfordringsbanen er nu: " + ny.ikon + " " + ny.navn + (iArena() ? "" : " (i Vera arena)"));
  }
  window.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    const m = String(chatTekst.value || "").trim().match(/^[:：]\s*skift\b\s*(.*)$/i);
    if (!m) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    chatTekst.value = "";
    skiftBane(m[1]);
  }, true);

  // =============================================================
  //  Møblerne (realistiske 3D, skala 0.5 ligesom staff-møblerne)
  // =============================================================
  const AR_STI = "billeder/moebler/";
  const AR_TYPER = [
    { id: "ar-tribune", navn: "Tribune med 2 sæder", felter: [2, 1], saede: 37, centrer: true, ankre: [[222, 362], [126, 362], [222, 362], [126, 362]] },
    { id: "ar-vaertspult", navn: "Værtspult", felter: [2, 1], ankre: [[222, 369], [126, 369], [222, 369], [126, 369]] },
    { id: "ar-deltagerpult", navn: "Deltagerpult med buzzer", ankre: [[126, 306], [126, 306], [126, 306], [126, 306]] },
    { id: "ar-kegle", navn: "Kegle", ankre: [[126, 230], [126, 230], [126, 230], [126, 230]] },
    { id: "ar-haek", navn: "Hæk (forhindring)", ankre: [[126, 237], [126, 237], [126, 237], [126, 237]] },
    { id: "ar-start", navn: "START-måtte", felter: [1, 3], kanGaaPaa: true, ankre: [[126, 222], [318, 222], [126, 222], [318, 222]] },
    { id: "ar-maal", navn: "MÅL-måtte", felter: [1, 3], kanGaaPaa: true, ankre: [[126, 222], [318, 222], [126, 222], [318, 222]] },
    { id: "ar-plade-roed", navn: "Rød glasplade", kanGaaPaa: true, ankre: [[126, 126], [126, 126], [126, 126], [126, 126]] },
    { id: "ar-plade-guld", navn: "Guld glasplade", kanGaaPaa: true, ankre: [[126, 126], [126, 126], [126, 126], [126, 126]] },
    { id: "ar-mysteriekasse", navn: "Mysteriekasse", ankre: [[126, 245], [126, 245], [126, 245], [126, 245]] },
  ];
  AR_TYPER.forEach(function (t) {
    t.skala = 0.5;
    t.retninger = [0, 1, 2, 3].map(function (r) { return AR_STI + t.id + "/" + t.id + "-" + r + ".png?r=1"; });
  });

  function lavMoebler() {
    if (MOEBEL_TYPER["ar-tribune"]) return;
    const kat = typeof STAFF_KAT !== "undefined" ? STAFF_KAT : "Staff";
    AR_TYPER.forEach(function (t) {
      t.kategori = kat;
      t.staff = true;
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
      if (typeof STAFF_SHOP_KAT !== "undefined" && STAFF_SHOP_KAT.ting.indexOf(t) < 0) STAFF_SHOP_KAT.ting.push(t);
    });
    // knapper i møbelpanelets Staff-fane (som de andre staff-møbler)
    if (typeof knapBoks !== "undefined" && typeof ikoner !== "undefined") {
      const knapper = [];
      AR_TYPER.forEach(function (type) {
        const knap = document.createElement("button");
        knap.className = "moebel-knap";
        knap.dataset.id = type.id;
        knap.dataset.kategori = type.kategori;
        knap.hidden = true;
        const ikon = document.createElement("canvas");
        ikon.width = 64; ikon.height = 70;
        ikoner.push({ ikon: ikon, type: type });
        const navn = document.createElement("span");
        navn.textContent = type.navn;
        knap.append(ikon, navn);
        knap.addEventListener("click", function () {
          if (typeof erStaff === "function" && !erStaff()) return;
          valgtType = valgtType === type.id ? null : type.id;
          valgtMoebel = null;
          opdaterPanel();
        });
        knapBoks.appendChild(knap);
        knapper.push(knap);
      });
      if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 1200);
      setInterval(function () {
        const vis = typeof valgtKategori !== "undefined" && valgtKategori === AR_TYPER[0].kategori && (typeof erStaff !== "function" || erStaff());
        knapper.forEach(function (k) { k.hidden = !vis; });
      }, 300);
    }
  }

  // =============================================================
  //  Rummets faste møbler (scene og tilskuere). Banens møbler lægges ovenpå (se arenaBaneMoebler).
  // =============================================================
  const ARENA_MOEBLER = (function () {
    const l = [
      // hovedscenen
      { type: "ar-vaertspult", x: 9, y: 2, retning: 0 },
      { type: "ev-mikrofon", x: 7, y: 2, retning: 0 },
      { type: "ev-mikrofon", x: 12, y: 2, retning: 0 },
      { type: "ev-spotlight", x: 6, y: 0, retning: 0 },
      { type: "ev-spotlight", x: 13, y: 0, retning: 0 },
      { type: "ev-hoejtaler", x: 5, y: 0, retning: 0 },
      { type: "ev-hoejtaler", x: 14, y: 0, retning: 0 },
      // ved siden af scenen
      { type: "ev-kamera", x: 16, y: 3, retning: 2 },
      { type: "ev-kamera", x: 3, y: 4, retning: 1 },
      { type: "cafe-plante", x: 0, y: 0, retning: 0 },
      { type: "cafe-plante", x: 19, y: 0, retning: 0 },
      { type: "ev-pokal", x: 17, y: 0, retning: 0 },
      { type: "ev-podie", x: 1, y: 1, retning: 0 },
    ];
    // tilskuere: to rækker i venstre side (vender mod højre), to rækker i højre side (vender mod venstre),
    // og to rækker forrest (vender mod scenen). Gangene imellem er fri, så man kan komme hen til sæderne.
    [5, 7, 9, 11].forEach(function (y) {
      l.push({ type: "ar-tribune", x: 0, y: y, retning: 1 }, { type: "ar-tribune", x: 2, y: y, retning: 1 });
      l.push({ type: "ar-tribune", x: 17, y: y, retning: 3 }, { type: "ar-tribune", x: 19, y: y, retning: 3 });
    });
    [4, 6, 8, 10, 12, 14].forEach(function (x) {
      l.push({ type: "ar-tribune", x: x, y: 13, retning: 2 }, { type: "ar-tribune", x: x, y: 15, retning: 2 });
    });
    return l;
  })();
  function arenaSomData() {
    return ARENA_MOEBLER.filter(function (m) { return MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning || 0 }; });
  }
  function arenaBaneMoebler(id) {
    const b = find(id) || find("tom");
    return (b ? b.moebler : []).filter(function (m) { return MOEBEL_TYPER[m.type]; });
  }

  // Banens møbler ligger i rummets møbelliste med mærket arenaBane, så de kan sidde på, gå uden om osv.
  // De bliver aldrig gemt som en del af rummet (det klarer arenaUdenBane), og de skiftes, når banen skifter.
  function arenaUdenBane(liste) { return (liste || []).filter(function (m) { return !(m && m.arenaBane); }); }
  let sidstBaneSat = "";
  function arenaListe() { return iArena() ? moeblerIRummet : (andreVaerelser[ARENA_ID] || null); }
  function anvendBane(tving) {
    const liste = arenaListe();
    if (!liste) return;
    const oensket = arenaBaneMoebler(ar.bane);
    const noegle = function (m) { return m.type + "," + m.x + "," + m.y + "," + (m.retning || 0); };
    const har = liste.filter(function (m) { return m.arenaBane; });
    const sig = oensket.map(noegle).sort().join("|");
    if (!tving && sig === har.map(noegle).sort().join("|") && sidstBaneSat === ar.bane) return;
    // behold dem, der allerede står rigtigt (så ingen rejser sig), fjern resten
    const gamle = har.slice();
    for (let i = liste.length - 1; i >= 0; i--) if (liste[i].arenaBane) liste.splice(i, 1);
    oensket.forEach(function (d) {
      const j = gamle.findIndex(function (m) { return noegle(m) === noegle(d); });
      liste.push(j >= 0 ? gamle.splice(j, 1)[0] : { type: d.type, x: d.x, y: d.y, spejlet: false, retning: d.retning || 0, arenaBane: true });
    });
    sidstBaneSat = ar.bane;
    try {
      if (typeof valgtMoebel !== "undefined" && valgtMoebel && liste.indexOf(valgtMoebel) < 0) { valgtMoebel = null; opdaterPanel(); }
    } catch (e) {}
  }
  setInterval(function () { try { anvendBane(false); } catch (e) {} }, 500);

  // =============================================================
  //  Rummet
  // =============================================================
  function lavRummet() {
    INDBYGGEDE_RUM[ARENA_ID] = { id: ARENA_ID, navn: "Vera arena", ejer: EJER_NAVNE[0], bredde: 20, dybde: 16,
      vaeg: "#3a1420", gulv1: "#2b1a1f", gulv2: "#26161b", vaegHoejde: 320, doer: { x: 0, y: 14 } };
    if (typeof RF_STANDARD !== "undefined") RF_STANDARD[ARENA_ID] = { vaeg: "#3a1420", gulv1: "#2b1a1f", gulv2: "#26161b" };
    // i navigatøren (og elevatoren) på 1. sal, efter event-rummene og Lysreaktion
    if (!NAV_RUM.some(function (r) { return r.id === ARENA_ID; })) {
      let efter = -1;
      NAV_RUM.forEach(function (r, i) { if (r.etage === "sal1" && (/^event\d+$/.test(r.id) || r.id === "lysreaktion")) efter = i; });
      NAV_RUM.splice(efter >= 0 ? efter + 1 : NAV_RUM.length, 0, { id: ARENA_ID, etage: "sal1", navn: "🏟 Vera arena",
        om: "Hotellets store gameshow-arena med scene, udfordringsbane og tribuner.", billede: "billeder/rum/event.png", maks: 60, rum: "vaerelse", vaerelse: ARENA_ID });
    }
    // møblerne: det, der er gemt på denne computer, ellers rummets egne
    const vaerelseMoeblerFoerArena = vaerelseMoebler;
    vaerelseMoebler = function (id) {
      if (id === ARENA_ID && !andreVaerelser[ARENA_ID]) {
        let gemt = null;
        try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + ARENA_ID) || "null"); } catch (e) {}
        gemt = Array.isArray(gemt) ? arenaUdenBane(gemt) : null;
        andreVaerelser[ARENA_ID] = (gemt && gemt.length ? gemt : arenaSomData())
          .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
      }
      return vaerelseMoeblerFoerArena(id);
    };
    if (typeof serverKald === "function") {
      const serverKaldFoerArena = serverKald;
      serverKald = async function (funktion, data) {
        // banens møbler sendes aldrig med, når nogen bygger i arenaen
        if (funktion === "hv_rum_moebler_gem" && data && data.p_rum === ARENA_ID && Array.isArray(data.p_moebler)) {
          data = Object.assign({}, data, { p_moebler: arenaUdenBane(data.p_moebler) });
        }
        const svar = await serverKaldFoerArena(funktion, data);
        if (funktion === "hv_rum_moebler_hent" && svar) {
          if (!(Array.isArray(svar[ARENA_ID]) && svar[ARENA_ID].length)) svar[ARENA_ID] = arenaSomData();
          else svar[ARENA_ID] = arenaUdenBane(svar[ARENA_ID]);
        }
        return svar;
      };
    }
    if (typeof somData === "function") {
      const somDataFoerArena = somData;
      somData = function (liste) { return somDataFoerArena(arenaUdenBane(liste)); };
    }
    const skiftRumFoerArena = skiftRum;
    skiftRum = function (navn) {
      skiftRumFoerArena.apply(this, arguments);
      if (iArena()) {
        anvendBane(true);
        arBesked("🏟 Velkommen i Vera arena! Find en plads på tribunen. Showet foregår på scenen og på udfordringsbanen.");
        hentArena();
      }
      opdaterSkaerme(true);
    };

    // ----- scenen og banen tegnes oven på det almindelige gulv -----
    const tegnGulvFoerArena = tegnGulv;
    tegnGulv = function () {
      tegnGulvFoerArena.apply(this, arguments);
      if (!iArena()) return;
      try { tegnScene(); tegnBanen(); } catch (e) { console.warn(e); }
    };
    // ----- effekterne tegnes oven på figurerne (men under talebobler) -----
    if (typeof tegnBobler === "function") {
      const tegnBoblerFoerArena = tegnBobler;
      tegnBobler = function () {
        try { tegnEffekter(); } catch (e) { console.warn(e); }
        return tegnBoblerFoerArena.apply(this, arguments);
      };
    }
    // ----- skærmene på væggene -----
    const tegnVaeggeFoerArena = tegnVaegge;
    tegnVaegge = function () {
      tegnVaeggeFoerArena.apply(this, arguments);
      if (!iArena()) return;
      try { AR_SKAERME.forEach(tegnSkaerm); } catch (e) { console.warn(e); }
    };
  }

  // =============================================================
  //  Tegning: scenen, banen og skærmene
  // =============================================================
  function omraadeHjoerner(o) { return [punkt(o.x0, o.y0), punkt(o.x0 + o.b, o.y0), punkt(o.x0 + o.b, o.y0 + o.d), punkt(o.x0, o.y0 + o.d)]; }
  function kantLinje(h, farve, bredde) {
    ctx.strokeStyle = farve; ctx.lineWidth = bredde;
    ctx.beginPath(); ctx.moveTo(h[0].x, h[0].y); h.slice(1).forEach(function (q) { ctx.lineTo(q.x, q.y); }); ctx.closePath(); ctx.stroke();
  }
  function tegnScene() {
    const s = AR_SCENE, nu = arNu();
    ctx.save();
    // blankt mørkt scenegulv (planker)
    for (let x = s.x0; x < s.x0 + s.b; x++) for (let y = s.y0; y < s.y0 + s.d; y++) {
      if (!erIRummet(x, y)) continue;
      polygon(ctx, diamant(x, y), (x + y) % 2 ? "#3a2118" : "#331c14");
      const a = punkt(x, y + 0.5), b = punkt(x + 1, y + 0.5);
      ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // lyset på scenen
    const lys = ar.scene || "varm";
    if (lys === "slukket") {
      polygon(ctx, omraadeHjoerner(s), "rgba(0,0,0,0.35)");
    } else if (lys !== "varm" && lys !== "show") {
      tegnRumLys(lys, nu);
    } else {
      ctx.globalCompositeOperation = "lighter";
      const pletter = lys === "show"
        ? [0, 1, 2].map(function (i) {
            const v = nu / 900 + i * 2.1;
            return { x: s.x0 + s.b / 2 + Math.sin(v) * (s.b / 2 - 1), y: s.y0 + s.d / 2 + Math.cos(v * 1.3) * (s.d / 2 - 0.8),
              farve: ["255,60,120", "80,160,255", "255,210,90"][i], r: 70 };
          })
        : [[s.x0 + 2, s.y0 + 2], [s.x0 + s.b / 2, s.y0 + 2.4], [s.x0 + s.b - 2, s.y0 + 2]].map(function (p) {
            return { x: p[0], y: p[1], farve: "255,205,120", r: 80 };
          });
      pletter.forEach(function (p) {
        const m = punkt(p.x, p.y);
        ctx.save();
        ctx.translate(m.x, m.y); ctx.scale(1, 0.5);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r);
        g.addColorStop(0, "rgba(" + p.farve + ",0.45)"); g.addColorStop(1, "rgba(" + p.farve + ",0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      ctx.globalCompositeOperation = "source-over";
    }
    // guldkant og en række små pærer langs scenens forkant
    kantLinje(omraadeHjoerner(s), "#d9a441", 2.5);
    for (let i = 0; i <= s.b * 2; i++) {
      const p = punkt(s.x0 + i / 2, s.y0 + s.d);
      const taendt = lys === "slukket" ? 0.25 : lys === "varm" ? 0.9 : 0.5 + 0.5 * Math.sin(nu / (lys === "strobe" ? 60 : 150) + i);
      ctx.fillStyle = "rgba(255,226,150," + taendt + ")";
      ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = 6 * taendt;
      ctx.beginPath(); ctx.arc(p.x, p.y - 2, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // Lyspletter på gulvet (tegnes oven på gulvet, under figurerne)
  function lysplet(x, y, r, farve, styrke) {
    const m = punkt(x, y);
    ctx.save();
    ctx.translate(m.x, m.y); ctx.scale(1, 0.5);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, "rgba(" + farve + "," + styrke + ")"); g.addColorStop(1, "rgba(" + farve + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function hsl(h) {   // farvehjul → "r,g,b"
    const f = function (n) { const k = (n + h / 30) % 12; return Math.round(255 * (0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return f(0) + "," + f(8) + "," + f(4);
  }
  // De store lys-funktioner lyser hele rummet op, ikke kun scenen
  function tegnRumLys(lys, nu) {
    const B = RUM.bredde, D = RUM.dybde, s = AR_SCENE;
    // rummet bliver lidt mørkere, så lyset står tydeligt frem
    polygon(ctx, [punkt(0, 0), punkt(B, 0), punkt(B, D), punkt(0, D)], "rgba(5,0,3,0.35)");
    ctx.globalCompositeOperation = "lighter";
    if (lys === "spots") {
      // fire hvide søgelys, der fejer hen over banen og tribunerne
      for (let i = 0; i < 4; i++) {
        const v = nu / (1400 + i * 300) + i * 1.7;
        lysplet(B / 2 + Math.sin(v) * (B / 2 - 2), D / 2 + 1 + Math.cos(v * 0.8 + i) * (D / 2 - 2), 75, "255,245,220", 0.55);
      }
    } else if (lys === "disko") {
      // mange små farvede prikker, der drejer rundt som fra en diskokugle
      const drej = nu / 2600;
      for (let i = 0; i < 36; i++) {
        const a = i * 2.39996 + drej, rr = 1.5 + (i % 9) * 0.9;
        lysplet(B / 2 + Math.cos(a) * rr, D / 2 + Math.sin(a) * rr * 0.8, 16, hsl((i * 47) % 360), 0.85);
      }
    } else if (lys === "puls") {
      const st = 0.25 + 0.35 * Math.pow(0.5 + 0.5 * Math.sin(nu / 230), 3);
      [[s.x0 + 2, 2], [s.x0 + s.b / 2, 2.4], [s.x0 + s.b - 2, 2], [B / 2 - 3, 9], [B / 2 + 3, 9]].forEach(function (p) { lysplet(p[0], p[1], 95, "255,60,110", st); });
    } else if (lys === "regnbue") {
      const h = (nu / 25) % 360;
      [[s.x0 + 2, 2], [s.x0 + s.b / 2, 2.4], [s.x0 + s.b - 2, 2], [B / 2 - 3, 9], [B / 2 + 3, 9]].forEach(function (p, i) { lysplet(p[0], p[1], 100, hsl((h + i * 40) % 360), 0.45); });
    } else if (lys === "strobe") {
      // hvide blink ca. 4 gange i sekundet (ikke for voldsomt)
      if (nu % 250 < 55) polygon(ctx, [punkt(0, 0), punkt(B, 0), punkt(B, D), punkt(0, D)], "rgba(255,255,255,0.28)");
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // =============================================================
  //  ✨ Effekterne: små partikler, der tegnes oven på det hele (lette for browseren: højst ca. 150 pr. effekt)
  // =============================================================
  const fx = {};          // effekt → liste med partikler
  let fxTid = 0;
  const KONFETTI_FARVER = ["#ffd27a", "#e8445a", "#ffffff", "#ff7ac0", "#7ac8ff", "#9be38a", "#c79bff"];
  function sprite(farve, r) {   // en blød rund plet, tegnet én gang og genbrugt
    const c = document.createElement("canvas"); c.width = c.height = r * 2;
    const g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, farve.replace("A", "1")); gr.addColorStop(1, farve.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  const RØG = sprite("rgba(225,215,225,A)", 64), GLØD = sprite("rgba(255,170,60,A)", 24), GNIST = sprite("rgba(255,255,255,A)", 12);
  function rumKasse() {
    const vh = RUM.vaegHoejde || 300;
    const v = punkt(0, RUM.dybde), h = punkt(RUM.bredde, 0), t = punkt(0, 0), b = punkt(RUM.bredde, RUM.dybde);
    return { x0: v.x, x1: h.x, y0: t.y - vh, y1: b.y };
  }
  function tilf(a, b) { return a + Math.random() * (b - a); }
  function gulvPunkt(o) { return punkt(tilf(o.x0, o.x0 + o.b), tilf(o.y0, o.y0 + o.d)); }
  function tegnEffekter() {
    if (!iArena()) return;
    const ef = ar.effekter || {};
    const nu = performance.now();
    const dt = Math.min(0.05, (nu - (fxTid || nu)) / 1000);
    fxTid = nu;
    const K = rumKasse(), W = K.x1 - K.x0, H = K.y1 - K.y0;
    Object.keys(AR_EFFEKTER).forEach(function (id) {
      const liste = fx[id] || (fx[id] = []);
      const til = !!ef[id];
      if (!til && !liste.length) return;
      ctx.save();
      if (id === "konfetti") {
        while (til && liste.length < 150) liste.push({ x: tilf(K.x0, K.x1), y: tilf(K.y0 - H * 0.3, K.y0), vx: tilf(-15, 15), vy: tilf(40, 90), r: tilf(0, 6), vr: tilf(-6, 6), f: KONFETTI_FARVER[liste.length % 7] });
        liste.forEach(function (p) {
          p.x += (p.vx + Math.sin(nu / 400 + p.r) * 20) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
          ctx.fillStyle = p.f; ctx.fillRect(p.x, p.y, 6 * Math.cos(p.r), 4);
        });
      } else if (id === "sne") {
        while (til && liste.length < 130) liste.push({ x: tilf(K.x0, K.x1), y: tilf(K.y0 - H * 0.3, K.y0), vy: tilf(20, 45), s: tilf(1.2, 3), f: tilf(0, 6) });
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        liste.forEach(function (p) {
          p.y += p.vy * dt; p.x += Math.sin(nu / 900 + p.f) * 12 * dt;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        });
      } else if (id === "glitter") {
        while (til && liste.length < 80) liste.push({ x: tilf(K.x0, K.x1), y: tilf(K.y0, K.y1), t: 0, l: tilf(0.6, 1.6) });
        ctx.globalCompositeOperation = "lighter";
        liste.forEach(function (p) {
          p.t += dt; const a = Math.sin(Math.PI * Math.min(1, p.t / p.l));
          ctx.globalAlpha = a; ctx.drawImage(GNIST, p.x - 6, p.y - 6);
          ctx.fillStyle = "#ffe9a8"; ctx.fillRect(p.x - 5 * a, p.y - 0.6, 10 * a, 1.2); ctx.fillRect(p.x - 0.6, p.y - 5 * a, 1.2, 10 * a);
        });
      } else if (id === "hjerter") {
        while (til && liste.length < 28) { const q = gulvPunkt({ x0: 0, y0: 4, b: RUM.bredde, d: RUM.dybde - 4 }); liste.push({ x: q.x, y: q.y, vy: tilf(25, 50), t: 0, l: tilf(2.5, 4.5), s: tilf(12, 22), f: tilf(0, 6) }); }
        ctx.textAlign = "center";
        liste.forEach(function (p) {
          p.t += dt; p.y -= p.vy * dt;
          ctx.globalAlpha = Math.max(0, 1 - p.t / p.l); ctx.font = Math.round(p.s) + "px serif";
          ctx.fillText(p.f > 3 ? "💖" : "❤️", p.x + Math.sin(nu / 500 + p.f) * 8, p.y);
        });
      } else if (id === "bobler") {
        while (til && liste.length < 45) { const q = gulvPunkt(AR_BANE); liste.push({ x: q.x, y: q.y, vy: tilf(20, 45), t: 0, l: tilf(3, 6), r: tilf(5, 12), f: tilf(0, 6) }); }
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
        while (til && liste.length < 36) { const q = gulvPunkt({ x0: 1, y0: 0, b: RUM.bredde - 2, d: 12 }); liste.push({ x: q.x, y: q.y, vx: tilf(-12, 12), vy: tilf(-6, -2), t: 0, l: tilf(5, 9), s: tilf(1.4, 2.6) }); }
        liste.forEach(function (p) {
          p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; const k = p.t / p.l;
          ctx.globalAlpha = 0.22 * Math.sin(Math.PI * Math.min(1, k));
          const w = 128 * p.s * (0.8 + k * 0.6);
          ctx.drawImage(RØG, p.x - w / 2, p.y - w * 0.3, w, w * 0.6);
        });
      } else if (id === "ild") {
        // flammer langs scenens forkant
        while (til && liste.length < 110) {
          const a = punkt(AR_SCENE.x0 + Math.random() * AR_SCENE.b, AR_SCENE.y0 + AR_SCENE.d);
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
        // raketter fra banen, der springer ud oppe ved væggen
        if (til && Math.random() < dt * 1.3) {
          const q = gulvPunkt(AR_BANE);
          liste.push({ raket: true, x: q.x, y: q.y, vy: tilf(260, 340), top: tilf(K.y0 + 30, K.y0 + H * 0.35), h: Math.floor(tilf(0, 360)) });
        }
        ctx.globalCompositeOperation = "lighter";
        const nye = [];
        liste.forEach(function (p) {
          if (p.raket) {
            p.y -= p.vy * dt;
            ctx.fillStyle = "#fff2c0"; ctx.fillRect(p.x - 1, p.y, 2, 8);
            if (p.y <= p.top) {
              p.t = 99;
              for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2, v = tilf(60, 140); nye.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: tilf(1, 1.6), h: p.h }); }
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
      // fjern dem, der er færdige (eller ude af rummet), og fyld ikke flere på, når effekten er slukket
      fx[id] = liste.filter(function (p) {
        if (p.raket) return p.t !== 99;
        if (p.l && p.t >= p.l) return false;
        return p.y < K.y1 + 40 && p.y > K.y0 - H * 0.5 && p.x > K.x0 - 60 && p.x < K.x1 + 60;
      });
    });
  }

  function tegnBanen() {
    const b = AR_BANE;
    ctx.save();
    for (let x = b.x0; x < b.x0 + b.b; x++) for (let y = b.y0; y < b.y0 + b.d; y++) {
      if (!erIRummet(x, y)) continue;
      polygon(ctx, diamant(x, y), (x + y) % 2 ? "#3d1621" : "#36131d");
    }
    // tynde guldlinjer mellem felterne og en tyk guldkant rundt om banen
    ctx.strokeStyle = "rgba(217,164,65,0.18)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = b.x0; x <= b.x0 + b.b; x++) { const p = punkt(x, b.y0), q = punkt(x, b.y0 + b.d); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    for (let y = b.y0; y <= b.y0 + b.d; y++) { const p = punkt(b.x0, y), q = punkt(b.x0 + b.b, y); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    ctx.stroke();
    kantLinje(omraadeHjoerner(b), "#d9a441", 3);
    const h = omraadeHjoerner(b);
    h.forEach(function (p) {
      ctx.fillStyle = "#ffd27a"; ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  // Skærmens fire hjørner på væggen (øverst venstre, øverst højre, nederst højre, nederst venstre)
  function vaegP(s, f, h) {
    const p = s.vaeg === "venstre" ? punkt(0, f) : punkt(f, 0);
    return { x: p.x, y: p.y - h };
  }
  function skaermHjoerner(s) {
    if (s.vaeg === "venstre") return [vaegP(s, s.til, s.top), vaegP(s, s.fra, s.top), vaegP(s, s.fra, s.bund), vaegP(s, s.til, s.bund)];
    return [vaegP(s, s.fra, s.top), vaegP(s, s.til, s.top), vaegP(s, s.til, s.bund), vaegP(s, s.fra, s.bund)];
  }
  function udvid(h, px) {
    const cx = (h[0].x + h[2].x) / 2, cy = (h[0].y + h[2].y) / 2;
    return h.map(function (q) {
      const dx = q.x - cx, dy = q.y - cy, l = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: q.x + dx / l * px, y: q.y + dy / l * px };
    });
  }
  function skaermData(id) { return (ar.skaerme && ar.skaerme[id]) || {}; }
  function viserVideo(s) { const d = skaermData(s.id); return !!d.v && !ARENA_FRA_FIL; }
  function tegnSkaerm(s) {
    const h = skaermHjoerner(s), d = skaermData(s.id);
    // guldramme og sort kant
    polygon(ctx, udvid(h, 9), "#d9a441");
    polygon(ctx, udvid(h, 6), "#6e4a14");
    polygon(ctx, udvid(h, 4), "#0b0507");
    if (viserVideo(s)) {
      // hul i væggen, så videoen (bag ved spillet) kan ses. Figurer foran tegnes oven på.
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      polygon(ctx, h, "#000000");
      ctx.restore();
      return;
    }
    // ellers: arenaens logo, en tekst fra værten eller en besked
    const W = 640, H = 360;
    ctx.save();
    ctx.transform((h[1].x - h[0].x) / W, (h[1].y - h[0].y) / W, (h[3].x - h[0].x) / H, (h[3].y - h[0].y) / H, h[0].x, h[0].y);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#4a0f1f"); g.addColorStop(1, "#1a0509");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();   // intet tegnes uden for skærmen
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const bane = find(ar.bane);
    if (d.v && ARENA_FRA_FIL) {
      ctx.fillStyle = "#e9c46a"; ctx.font = "bold 46px Georgia, serif"; ctx.fillText("📺 VERA ARENA", W / 2, H / 2 - 30);
      ctx.fillStyle = "#f3e6cc"; ctx.font = "24px Verdana, sans-serif"; ctx.fillText("Videoen kan kun vises på hotellet på nettet", W / 2, H / 2 + 30);
    } else if (d.tekst && !erLink(d.tekst)) {
      ctx.fillStyle = "#ffe6a8"; ctx.shadowColor = "#ffb84a"; ctx.shadowBlur = 18;
      const ord = String(d.tekst).split(/\s+/), linjer = [];
      let st = d.tekst.length <= 10 ? 110 : d.tekst.length <= 24 ? 72 : 50;
      ctx.font = "bold " + st + "px Georgia, serif";
      let l = "";
      ord.forEach(function (o) { const p = l ? l + " " + o : o; if (ctx.measureText(p).width > W - 60 && l) { linjer.push(l); l = o; } else l = p; });
      if (l) linjer.push(l);
      linjer.slice(0, 4).forEach(function (t, i, a) { ctx.fillText(t, W / 2, H / 2 + (i - (a.length - 1) / 2) * st * 1.1, W - 40); });
    } else {
      const nu = arNu();
      ctx.fillStyle = "#e9c46a"; ctx.shadowColor = "#ffb84a"; ctx.shadowBlur = 14 + 6 * Math.sin(nu / 500);
      ctx.font = "bold " + (s.id === "midt" ? 88 : 76) + "px Georgia, serif";
      ctx.fillText("VERA ARENA", W / 2, H / 2 - 30);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#f3e6cc"; ctx.font = "30px Georgia, serif";
      ctx.fillText(bane ? bane.ikon + "  " + bane.navn : "", W / 2, H / 2 + 50);
    }
    ctx.restore();
  }

  // =============================================================
  //  YouTube på skærmene: ligger BAG spillet og ses gennem hullet i væggen (som i biografen)
  // =============================================================
  const arIframes = {};
  AR_SKAERME.forEach(function (s) {
    const f = document.createElement("iframe");
    f.className = "ar-skaerm";
    f.title = "Vera arena: " + s.navn;
    f.allow = "autoplay; encrypted-media";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.style.cssText = "position: fixed; left: 0; top: 0; width: 640px; height: 360px; border: 0; transform-origin: 0 0; pointer-events: none; background: #000;";
    f.hidden = true;
    arIframes[s.id] = { el: f, n: -1, v: null };
  });
  let iframesSat = false;
  function saetIframesInd() {
    if (iframesSat || typeof laerred === "undefined") return;
    AR_SKAERME.forEach(function (s) { laerred.parentNode.insertBefore(arIframes[s.id].el, laerred); });   // før lærredet = bag ved det
    iframesSat = true;
  }
  // Lyden kommer fra den skærm, der sidst fik et YouTube-link (de andre er lydløse, så det ikke larmer i munden på hinanden)
  function lydSkaerm() {
    let bedst = null;
    AR_SKAERME.forEach(function (s) {
      const d = skaermData(s.id);
      if (d.v && (!bedst || (d.t || 0) > (skaermData(bedst.id).t || 0))) bedst = s;
    });
    return bedst ? bedst.id : null;
  }
  function ytKommando(f, func) {
    try { f.el.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: [] }), "*"); } catch (e) {}
  }
  function opdaterSkaerme(tving) {
    if (!iframesSat) return;
    const lyd = lydSkaerm();
    AR_SKAERME.forEach(function (s) {
      const f = arIframes[s.id], d = skaermData(s.id);
      const vis = iArena() && viserVideo(s);
      if (!vis) {
        if (f.v) { f.el.removeAttribute("src"); f.v = null; f.n = -1; }
        return;
      }
      if (!tving && f.v === d.v && f.n === d.n) {
        // samme video, men lyden er flyttet til en anden skærm
        if (f.lyd !== (s.id === lyd)) { f.lyd = s.id === lyd; ytKommando(f, f.lyd ? "unMute" : "mute"); }
        return;
      }
      f.v = d.v; f.n = d.n; f.lyd = s.id === lyd;
      const start = Math.max(0, Math.floor((arNu() - (d.t || arNu())) / 1000));
      f.el.src = "https://www.youtube-nocookie.com/embed/" + d.v + "?autoplay=1&controls=0&rel=0&playsinline=1&enablejsapi=1&start=" + start +
        (f.lyd ? "" : "&mute=1") + "&origin=" + encodeURIComponent(location.origin);
    });
  }
  // læg skærmene præcis over hullerne i væggen (følger med, når man trækker og zoomer)
  function placerSkaerme() {
    if (iframesSat) {
      const r = laerred.getBoundingClientRect();
      const sx = r.width / BREDDE, sy = r.height / HOEJDE;
      AR_SKAERME.forEach(function (s) {
        const f = arIframes[s.id];
        const vis = iArena() && viserVideo(s) && !!f.v;
        if (f.el.hidden === vis) f.el.hidden = !vis;
        if (!vis) return;
        const h = skaermHjoerner(s);
        const A = { x: r.left + h[0].x * sx, y: r.top + h[0].y * sy };
        const B = { x: r.left + h[1].x * sx, y: r.top + h[1].y * sy };
        const D = { x: r.left + h[3].x * sx, y: r.top + h[3].y * sy };
        f.el.style.transform = "matrix(" + [(B.x - A.x) / 640, (B.y - A.y) / 640, (D.x - A.x) / 360, (D.y - A.y) / 360, A.x, A.y].join(",") + ")";
      });
      // lyd-knappen (browseren vil ofte have et klik, før der må komme lyd)
      const lyd = lydSkaerm();
      const vis = iArena() && !!lyd && !ARENA_FRA_FIL && !lydTrykket[lyd + skaermData(lyd).n];
      if (lydKnap.hidden === vis) lydKnap.hidden = !vis;
    }
    requestAnimationFrame(placerSkaerme);
  }
  const lydKnap = document.createElement("button");
  lydKnap.id = "ar-lyd";
  lydKnap.type = "button";
  lydKnap.hidden = true;
  lydKnap.textContent = "🔊 Tænd for lyden";
  const lydTrykket = {};
  lydKnap.addEventListener("click", function () {
    const lyd = lydSkaerm();
    if (!lyd) return;
    ytKommando(arIframes[lyd], "unMute"); ytKommando(arIframes[lyd], "playVideo");
    lydTrykket[lyd + skaermData(lyd).n] = true;
    lydKnap.hidden = true;
  });
  document.body.appendChild(lydKnap);

  // =============================================================
  //  Skiltet øverst i arenaen: ny bane, værtens skilt og nedtælling
  // =============================================================
  const skilt = document.createElement("div");
  skilt.id = "ar-skilt";
  skilt.hidden = true;
  document.body.appendChild(skilt);
  function opdaterSkilt() {
    if (!iArena()) { skilt.hidden = true; return; }
    const nu = arNu();
    let html = "";
    const bane = find(ar.bane);
    if (ar.baneTid && nu - ar.baneTid < 5000 && bane) html += "<div class='as-stor'>🔄 Ny bane: " + bane.ikon + " " + esc(bane.navn) + "</div><div class='as-lille'>" + esc(bane.om || "") + "</div>";
    if (ar.nedtael && nu < ar.nedtael) html += "<div class='as-tal'>" + Math.ceil((ar.nedtael - nu) / 1000) + "</div>";
    else if (ar.nedtael && nu - ar.nedtael < 2500) html += "<div class='as-tal'>GO! 🏁</div>";
    if (ar.skilt && ar.skilt.tekst) html += "<div class='as-stor'>" + esc(ar.skilt.tekst) + "</div>";
    if (!html) { skilt.hidden = true; return; }
    html = "<div class='as-top'>🏟 VERA ARENA</div>" + html;
    skilt.hidden = false;
    if (skilt.innerHTML !== html) skilt.innerHTML = html;
  }
  setInterval(opdaterSkilt, 200);

  // Hent arenaen fra serveren: tit når der tælles ned, ellers hvert 2. sekund (kun i arenaen eller med appen åben)
  let sidstHent = 0;
  setInterval(function () {
    if (!iArena() && !appAaben()) return;
    const hvorTit = ar.nedtael && arNu() < ar.nedtael + 3000 ? 700 : 2000;
    if (Date.now() - sidstHent < hvorTit) return;
    sidstHent = Date.now();
    hentArena().then(function () { if (appAaben()) tegnAppIgen(); });
  }, 250);

  // =============================================================
  //  📱 Event-appen: fanen 🏟 Arena styrer det hele
  // =============================================================
  let appKrop = null, appSidst = "";
  function appAaben() { return !!(appKrop && appKrop.isConnected); }
  function tegnAppIgen() {
    if (!appAaben()) return;
    const n = JSON.stringify([ar, arFejl]);
    if (n === appSidst) return;
    const aktiv = document.activeElement;
    if (aktiv && appKrop.contains(aktiv) && /INPUT|TEXTAREA|SELECT/.test(aktiv.tagName)) return;   // ikke mens man skriver
    tegnApp(appKrop, window.eventApp);
  }
  function tegnApp(krop, api) {
    appKrop = krop;
    appSidst = JSON.stringify([ar, arFejl]);
    if (!arMaa()) { krop.innerHTML = "<p class='ea-info'>Kun ejeren, Eventværter og Eventfolk kan styre Vera arena.</p>"; return; }
    const bane = find(ar.bane);
    let html = "";
    if (arFejl) html += "<p class='ea-advarsel'>" + esc(arFejl) + "</p>";
    html += "<div class='ea-hj-boks'><small>Vera arena lige nu</small><b>" + (bane ? bane.ikon + " " + esc(bane.navn) : "?") +
      " · " + AR_SCENELYS[ar.scene || "varm"] + "</b></div>";
    if (!iArena()) html += "<div class='ea-hj-knapper'><button data-ar='gaa'>🚶 Gå til Vera arena</button></div>";
    // baner
    html += "<h4 class='ea-dag'>🔄 Udfordringsbanen</h4><div class='ar-baner'>" + ARENA_BANER.map(function (b) {
      return "<button data-ar-bane='" + esc(b.id) + "'" + (b.id === ar.bane ? " class='lys-valgt ar-valgt'" : "") + "><b>" + b.ikon + " " + esc(b.navn) + "</b><small>" + esc(b.om || "") + "</small></button>";
    }).join("") + "</div><p class='ea-info'>Du kan også skrive <b>:skift</b> (næste bane) eller fx <b>:skift quiz</b> i chatten.</p>";
    // scenelys
    html += "<h4 class='ea-dag'>💡 Lys på scenen</h4><div class='ar-gitter'>" + Object.keys(AR_SCENELYS).map(function (k) {
      return "<button data-ar-scene='" + k + "'" + (k === (ar.scene || "varm") ? " class='lys-valgt ar-valgt'" : "") + ">" + AR_SCENELYS[k] + "</button>";
    }).join("") + "</div>" + (ar.scene === "strobe" ? "<p class='ea-info'>⚡ Stroboskop blinker. Brug det kun kort, og sluk det igen.</p>" : "");
    const ef = ar.effekter || {};
    const antal = Object.keys(AR_EFFEKTER).filter(function (k) { return ef[k]; }).length;
    html += "<h4 class='ea-dag'>✨ Effekter</h4><p class='ea-info'>Tryk for at tænde, tryk igen for at slukke. Flere kan være tændt på én gang.</p>" +
      "<div class='ar-gitter'>" + Object.keys(AR_EFFEKTER).map(function (k) {
        return "<button data-ar-effekt='" + k + "'" + (ef[k] ? " class='lys-valgt ar-valgt'" : "") + ">" + AR_EFFEKTER[k] + (ef[k] ? " ✓" : "") + "</button>";
      }).join("") + "</div><div class='ea-hj-knapper'><button data-ar-effekt='finale'>🎉 Finale (konfetti, fyrværkeri og glitter)</button>" +
      (antal ? "<button data-ar-effekt='stop'>⏹ Stop alle effekter</button>" : "") + "</div>";
    // skærme
    const lyd = lydSkaerm();
    const kort = { midt: "🖥 Storskærm", venstre: "◀ Venstre", hoejre: "Højre ▶", alle: "Alle tre" };
    html += "<h4 class='ea-dag'>📺 Skærmene</h4>" +
      "<ul class='ar-skaermliste'>" + AR_SKAERME.map(function (s) {
        const d = skaermData(s.id);
        return "<li><span>" + esc(s.navn) + (d.v && s.id === lyd ? " 🔊" : "") + "</span><b>" + (d.v ? "▶ YouTube" : d.tekst && !erLink(d.tekst) ? "🔤 " + esc(d.tekst) : "Logo") + "</b>" +
          (d.v || d.tekst ? "<button type='button' data-ar-logo='" + s.id + "' title='Vis logoet igen'>⏹</button>" : "") + "</li>";
      }).join("") + "</ul>" +
      "<div class='ar-skaermboks'><b>▶ YouTube-video</b><input type='text' data-ar-input='yt' placeholder='Sæt et YouTube-link ind …'>" +
      "<small>Tryk på den skærm, videoen skal vises på:</small><div class='ar-skaermknapper'>" +
      AR_SKAERME.map(function (s) { return "<button type='button' data-ar-vis='yt' data-ar-til='" + s.id + "'>" + kort[s.id] + "</button>"; }).join("") + "</div></div>" +
      "<div class='ar-skaermboks'><b>🔤 Tekst på skærmen</b><input type='text' data-ar-input='tekst' maxlength='60' placeholder='Fx RUNDE 2 eller FINALEN'>" +
      "<small>Tryk på den skærm, teksten skal vises på:</small><div class='ar-skaermknapper'>" +
      AR_SKAERME.concat([{ id: "alle" }]).map(function (s) { return "<button type='button' data-ar-vis='tekst' data-ar-til='" + s.id + "'>" + kort[s.id] + "</button>"; }).join("") + "</div></div>" +
      (ARENA_FRA_FIL ? "<p class='ea-info'>YouTube virker kun, når hotellet er åbnet på nettet (pavlakvist.github.io/Hotel), ikke fra en fil på computeren.</p>" :
        "<p class='ea-info'>🔊 Lyden kommer fra den skærm, der sidst fik en video. Gæsterne får en knap \"🔊 Tænd for lyden\" i arenaen, fordi browseren vil have et klik først.</p>");
    // skilt og nedtælling
    html += "<h4 class='ea-dag'>📢 Skilt og nedtælling</h4>" +
      "<form class='ar-form' data-ar-form='skilt'><input type='text' name='l' maxlength='80' placeholder='Skilt øverst hos alle i arenaen'><button type='submit'>📢 Vis</button></form>" +
      "<div class='ea-hj-knapper'>" + (ar.skilt && ar.skilt.tekst ? "<button data-ar='skiltvaek'>✕ Fjern skiltet</button>" : "") +
      "<button data-ar-ned='3'>⏱ 3</button><button data-ar-ned='5'>⏱ 5</button><button data-ar-ned='10'>⏱ 10</button></div>";
    if (bane && bane.regler && bane.regler.length) {
      html += "<h4 class='ea-dag'>📜 Regler for " + esc(bane.navn) + "</h4><ol class='ar-regler'>" + bane.regler.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ol>" +
        "<div class='ea-hj-knapper'><button data-ar='regler'>💬 Sig reglerne i chatten</button></div>";
    }
    krop.innerHTML = html;

    const igen = function () { if (krop.isConnected) tegnApp(krop, api); };
    const sig = function (t) { if (api && api.sigIChat) api.sigIChat(t); };
    krop.querySelectorAll("[data-ar-bane]").forEach(function (k) {
      k.addEventListener("click", function () {
        const b = find(k.dataset.arBane);
        saetArena({ bane: b.id }).then(igen); igen();
        if (api && api.besked) api.besked("🔄 Banen er nu " + b.navn);
      });
    });
    krop.querySelectorAll("[data-ar-effekt]").forEach(function (k) {
      k.addEventListener("click", function () {
        const id = k.dataset.arEffekt;
        let ny = Object.assign({}, ar.effekter || {});
        if (id === "stop") ny = {};
        else if (id === "finale") ny = Object.assign(ny, { konfetti: true, fyrvaerkeri: true, glitter: true });
        else if (ny[id]) delete ny[id]; else ny[id] = true;
        saetArena({ effekter: ny }).then(igen); igen();
      });
    });
    krop.querySelectorAll("[data-ar-scene]").forEach(function (k) {
      k.addEventListener("click", function () { saetArena({ scene: k.dataset.arScene }).then(igen); igen(); });
    });
    krop.querySelectorAll("[data-ar-vis]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.arVis, til = k.dataset.arTil;
        const inp = krop.querySelector("[data-ar-input='" + hvad + "']");
        const v = inp ? inp.value.trim() : "";
        const navn = (AR_SKAERME.find(function (s) { return s.id === til; }) || { navn: "alle tre skærme" }).navn;
        if (hvad === "yt") {
          const id = arYoutubeId(v);
          if (!id) { if (api && api.besked) api.besked(v ? "Det ligner ikke et YouTube-link. Prøv at kopiere linket igen." : "Sæt først et YouTube-link ind i feltet."); return; }
          saetArena({ skaerm: { id: til, v: id } }).then(igen);
          if (api && api.besked) api.besked("▶ Videoen vises nu på " + navn);
        } else {
          if (!v) { if (api && api.besked) api.besked("Skriv først en tekst i feltet."); return; }
          if (erLink(v)) {
            // et YouTube-link i tekstfeltet: så afspilles videoen i stedet (links vises aldrig som tekst)
            const id = arYoutubeId(v);
            if (!id) { if (api && api.besked) api.besked("Links kan ikke vises som tekst. Skriv en almindelig tekst, eller brug YouTube-feltet ovenover."); return; }
            saetArena({ skaerm: { id: til === "alle" ? "midt" : til, v: id } }).then(igen);
            if (api && api.besked) api.besked("▶ Det var et YouTube-link, så videoen afspilles nu på " + (til === "alle" ? "Storskærmen" : navn));
            inp.value = ""; igen(); return;
          }
          saetArena({ skaerm: { id: til, tekst: v } }).then(igen);
          if (api && api.besked) api.besked("🔤 Teksten vises nu på " + navn);
        }
        inp.value = "";
        igen();
      });
    });
    krop.querySelectorAll("[data-ar-logo]").forEach(function (k) {
      k.addEventListener("click", function () { saetArena({ skaerm: { id: k.dataset.arLogo } }).then(igen); igen(); });
    });
    krop.querySelectorAll("[data-ar-ned]").forEach(function (k) {
      k.addEventListener("click", function () { saetArena({ nedtael: Number(k.dataset.arNed) }).then(igen); igen(); });
    });
    krop.querySelectorAll("[data-ar-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        const v = f.querySelector("input").value.trim();
        const hvad = f.dataset.arForm;
        if (hvad === "skilt") {
          if (!v) return;
          saetArena({ skilt: v }).then(igen);
        }
        f.querySelector("input").value = "";
        igen();
      });
    });
    krop.querySelectorAll("[data-ar]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.ar;
        if (hvad === "gaa") { if (api && api.gaaTil) api.gaaTil(ARENA_ID); else gaaTilVaerelse(ARENA_ID); return; }
        if (hvad === "skiltvaek") saetArena({ skilt: "" }).then(igen);
        if (hvad === "regler" && bane) sig("🏟 " + bane.navn + ": " + bane.regler.map(function (r, i) { return (i + 1) + ") " + r; }).join(" "));
        igen();
      });
    });
  }
  function iAppen() {
    if (!window.eventApp || !window.eventApp.tilfoejFane) return;
    window.eventApp.tilfoejFane({
      id: "arena", navn: "🏟 Arena", kun: arMaa,
      tegn: function (krop, api) { tegnApp(krop, api); hentArena().then(tegnAppIgen); },
    });
    // banerne står også under 🎲 Lege, med regler og en knap der sætter banen op
    ARENA_BANER.filter(function (b) { return b.regler; }).forEach(function (b) {
      window.eventApp.tilfoejLeg({
        id: "arena-" + b.id, navn: b.navn + " (Vera arena)", ikon: b.ikon, tid: b.tid || "", folk: b.folk || "", rum: ARENA_ID,
        kort: b.om, regler: b.regler,
        tegn: function (boks, api) {
          boks.innerHTML = "<div class='ea-hj-knapper'><button data-arl='saet'>🔄 Sæt banen op i Vera arena</button>" +
            (iArena() ? "" : "<button data-arl='gaa'>🚶 Gå til Vera arena</button>") + "<button data-arl='fane'>🏟 Åbn Arena-fanen</button></div>" +
            (ar.bane === b.id ? "<p class='ea-info'>✅ Banen står klar lige nu.</p>" : "");
          boks.querySelectorAll("[data-arl]").forEach(function (k) {
            k.addEventListener("click", function () {
              const h = k.dataset.arl;
              if (h === "saet") saetArena({ bane: b.id }).then(function () { if (boks.isConnected) boks.querySelector(".ea-hj-knapper").insertAdjacentHTML("afterend", "<p class='ea-info'>✅ Banen står klar.</p>"); });
              if (h === "gaa") { if (api && api.gaaTil) api.gaaTil(ARENA_ID); }
              if (h === "fane" && window.eventApp.aabn) window.eventApp.aabn("arena");
            });
          });
        },
      });
    });
  }

  // =============================================================
  //  Til andre filer: window.veraArena
  //    .tilfoejBane({ id, navn, ikon, om, regler: [], moebler: [{ type, x, y, retning }] })   → en ny bane (x 4–15, y 6–11)
  //    .skift(id) · .saet({ ... }) · .hent()
  // =============================================================
  window.veraArena = {
    baner: ARENA_BANER, skaerme: AR_SKAERME, bane: AR_BANE, scene: AR_SCENE,
    tilfoejBane: function (b) {
      if (!b || !b.id || !Array.isArray(b.moebler)) return;
      b.ikon = b.ikon || "🎲"; b.navn = b.navn || b.id;
      const i = ARENA_BANER.findIndex(function (x) { return x.id === b.id; });
      if (i >= 0) ARENA_BANER[i] = b; else ARENA_BANER.push(b);
    },
    skift: function (id) { skiftBane(id); },
    saet: saetArena,
    hent: function () { return ar; },
  };

  // =============================================================
  //  Stil (vinrød og guld)
  // =============================================================
  const stil = document.createElement("style");
  stil.textContent =
    "#ar-skilt { position: fixed; left: 50%; top: 70px; transform: translateX(-50%); z-index: 57; pointer-events: none; text-align: center;" +
    " background: linear-gradient(#4a1320, #2e0a13); color: #f6e7c1; border: 2px solid #d9b45a; border-radius: 12px; padding: 8px 20px;" +
    " box-shadow: 0 8px 30px rgba(0,0,0,.45); font-family: Georgia, serif; max-width: 92vw; }" +
    "#ar-skilt[hidden] { display: none !important; }" +
    "#ar-skilt .as-top { font: bold 13px Georgia, serif; letter-spacing: 2px; color: #e8cf8f; }" +
    "#ar-skilt .as-stor { font: bold 20px Georgia, serif; margin-top: 4px; }" +
    "#ar-skilt .as-lille { font-size: 13px; color: #e8cf8f; margin-top: 2px; }" +
    "#ar-skilt .as-tal { font: bold 46px Georgia, serif; color: #ffd27a; text-shadow: 0 0 18px #ffb84a; }" +
    "#ar-lyd { position: fixed; right: 16px; top: 120px; z-index: 58; padding: 8px 14px; border: 2px solid #d9a441; border-radius: 8px;" +
    " background: #7a1b2b; color: #f7dfa0; font-weight: bold; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.4); }" +
    "#ar-lyd[hidden] { display: none !important; }" +
    ".ar-baner { display: flex; flex-direction: column; gap: 6px; }" +
    ".ar-baner button { text-align: left; padding: 8px 10px; border-radius: 10px; cursor: pointer; }" +
    ".ar-baner button b { display: block; } .ar-baner button small { display: block; opacity: .85; font-size: 11px; margin-top: 2px; }" +
    "button.ar-valgt { outline: 2px solid #ffd27a; outline-offset: 1px; background: linear-gradient(#b8862e, #8a5e1c) !important; color: #fff !important; }" +
    ".ar-skaermliste { list-style: none; margin: 6px 0; padding: 0; font-size: 12px; }" +
    ".ar-skaermliste li { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid rgba(217,164,65,.25); }" +
    ".ar-skaermliste b { color: #d9a441; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }" +
    ".ar-form { display: flex; gap: 6px; margin: 6px 0; } .ar-form input { flex: 1; min-width: 0; padding: 7px; border-radius: 8px; border: 2px solid #d9a441; }" +
    ".ar-form button { padding: 6px 10px; border-radius: 8px; cursor: pointer; }" +
    ".ar-skaermliste li { align-items: center; } .ar-skaermliste li button { padding: 2px 8px; border-radius: 6px; cursor: pointer; }" +
    ".ar-skaermboks { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; padding: 8px; border: 1px solid rgba(217,164,65,.45); border-radius: 10px; }" +
    ".ar-skaermboks input { padding: 7px; border-radius: 8px; border: 2px solid #d9a441; min-width: 0; }" +
    ".ar-skaermboks small { opacity: .85; font-size: 11px; }" +
    ".ar-skaermknapper { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 6px; }" +
    ".ar-skaermknapper button { padding: 9px 4px; border-radius: 8px; cursor: pointer; font-weight: bold; }" +
    // Event-appens fane-bjælke bliver hængende øverst, når man ruller. Med fast baggrund kan man ikke se knapperne igennem den.
    ".ea-faner { background: #2b0c15 !important; box-shadow: 0 6px 12px rgba(0,0,0,.55); }" +
    ".ar-gitter { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }" +
    ".ar-gitter button { padding: 9px 4px; border-radius: 9px; cursor: pointer; font-weight: 600; }" +
    ".ar-regler { margin: 4px 0 8px; padding-left: 22px; font-size: 12px; }";
  document.head.appendChild(stil);

  // =============================================================
  //  Start: vent til spillet og staff-møblerne er klar
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
    if (iArena()) { anvendBane(true); hentArena(); }
  });
  if (window.eventApp) iAppen(); else window.addEventListener("eventapp-klar", iAppen);
})();
