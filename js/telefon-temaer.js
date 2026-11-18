// =============================================================
//  🎨 Telefon-temaer — køb et tema til Vera-telefonen for 10 Stella
//  Temaerne ligger i App Butik på telefonen (fanen "🎨 Temaer").
//  Når man bruger et tema, skifter HELE telefonen: baggrund, app-ikoner,
//  farver, knapper, menuer, ur og skrifttyper.
//  Man skifter tema i App Butik eller i Indstillinger → Tema.
//  "Standard" er gratis og er telefonen, som du selv har indrettet den
//  (dine egne farver og baggrunde).
//  Ejeren har alle temaer gratis.
//
//  Køb og valgt tema gemmes på serveren (database-65-telefon-temaer.sql).
//  Uden server gemmes det kun på denne computer.
//  Billeder: billeder/telefon-temaer/<tema>-baggrund.jpg og <tema>-ikon.png
//  Hentes fra js/panel-forklaring.js. Rører ikke js/telefon.js.
// =============================================================
(function () {
  if (window.telefonTemaerKlar) return;
  window.telefonTemaerKlar = true;

  const PRIS = 10;           // Stella pr. tema
  const MAPPE = "billeder/telefon-temaer/";

  // ---------------------------------------------------------------
  //  De 6 temaer
  //  v = farver i telefonen, glyf = hvordan app-tegnene farves,
  //  skrift = skrifttype til tekst, ur = skrifttype til uret
  // ---------------------------------------------------------------
  const TEMAER = [
    { id: "grand", navn: "Grand Hotel", emoji: "🏨",
      tekst: "Bordeaux, guld og marmor. Elegante apps og det klassiske HELLO VERA-look.",
      skrift: "'Playfair Display', Georgia, 'Times New Roman', serif", ur: "'Playfair Display', Georgia, serif",
      v: { k1: "#fff0c4", k2: "#d9a84e", k3: "#7a5418", acc: "#8a1f34", tekst: "#3a0d18", graa: "#8f6a5c",
        lys: "#f7eedd", papir: "#fffaf0", top: "linear-gradient(#7a1428, #5a0d1d)", topTekst: "#f6dc9a", felt: "#eadbc0", felt2: "#dcc59c",
        linje: "rgba(122,20,40,.16)", hvid: "#fffaf2", dock: "rgba(70,8,22,.55)", dockKant: "rgba(226,186,104,.7)",
        glas: "rgba(255,248,236,.86)", moerkglas: "rgba(64,8,20,.55)", knapBg: "#7a1428", knapTekst: "#f6dc9a",
        etiket: "#fff4d6", etiketSkygge: "0 1px 3px rgba(40,0,10,.9)", urFarve: "#f6dc9a", urSkygge: "0 2px 0 #7a5418, 0 4px 14px rgba(0,0,0,.6)",
        widget: "rgba(70,8,22,.5)", widgetKant: "rgba(226,186,104,.55)" },
      glyf: "sepia(1) saturate(2.6) hue-rotate(-12deg) brightness(1.15) drop-shadow(0 1px 0 #4a2a06)",
      hero: "linear-gradient(135deg, #5a0d1d, #8a1f34 55%, #b8862e)" },
    { id: "enchanted", navn: "Enchanted", emoji: "🔮",
      tekst: "Mørk lilla, stjerner og marmor med magiske detaljer.",
      skrift: "'Cormorant Garamond', 'Palatino Linotype', 'Book Antiqua', Georgia, serif", ur: "'Cinzel Decorative', 'Cinzel', 'Palatino Linotype', serif",
      v: { k1: "#e9dcff", k2: "#8a66c9", k3: "#2e1656", acc: "#6c3fb8", tekst: "#24123e", graa: "#7d6a9c",
        lys: "#efe8fb", papir: "#f8f4ff", top: "linear-gradient(#2a1150, #170830)", topTekst: "#e3d1ff", felt: "#e0d5f5", felt2: "#cbbbe9",
        linje: "rgba(80,40,140,.16)", hvid: "#fcfaff", dock: "rgba(30,10,60,.55)", dockKant: "rgba(190,160,245,.6)",
        glas: "rgba(245,238,255,.86)", moerkglas: "rgba(30,10,60,.55)", knapBg: "#4b2590", knapTekst: "#f0e6ff",
        etiket: "#f3eaff", etiketSkygge: "0 0 6px rgba(190,140,255,.9), 0 1px 2px #12061f", urFarve: "#f3eaff", urSkygge: "0 0 18px rgba(190,140,255,.9), 0 2px 4px #12061f",
        widget: "rgba(30,10,60,.5)", widgetKant: "rgba(190,160,245,.5)" },
      glyf: "grayscale(1) brightness(1.9) sepia(.35) hue-rotate(220deg) saturate(2.2) drop-shadow(0 0 3px rgba(200,160,255,.95))",
      hero: "linear-gradient(135deg, #170830, #4b2590 55%, #a77be8)" },
    { id: "y2k", navn: "Y2K", emoji: "💿",
      tekst: "Pink, chrome og sølv. Blanke ikoner og futuristisk stil.",
      skrift: "'Quicksand', 'Trebuchet MS', 'Segoe UI', sans-serif", ur: "'Audiowide', 'Bahnschrift', 'Trebuchet MS', sans-serif",
      v: { k1: "#ffffff", k2: "#ffb3dc", k3: "#9c9cb4", acc: "#ff3fa4", tekst: "#3a1030", graa: "#9a7a92",
        lys: "#fdeef8", papir: "#fff6fc", top: "linear-gradient(#ffffff, #ffd3ec 45%, #e6e6f2)", topTekst: "#c21f7a", felt: "#f5dcef", felt2: "#e9c3df",
        linje: "rgba(255,63,164,.18)", hvid: "#ffffff", dock: "rgba(255,255,255,.45)", dockKant: "rgba(255,255,255,.95)",
        glas: "rgba(255,255,255,.8)", moerkglas: "rgba(160,40,110,.45)", knapBg: "linear-gradient(#ff7cc4, #ff3fa4)", knapTekst: "#ffffff",
        etiket: "#ffffff", etiketSkygge: "0 1px 0 #ff3fa4, 0 0 6px rgba(255,63,164,.8)", urFarve: "#ffffff", urSkygge: "0 2px 0 #c0c0d8, 0 4px 0 #ff3fa4, 0 6px 16px rgba(255,63,164,.6)",
        widget: "rgba(255,255,255,.35)", widgetKant: "rgba(255,255,255,.9)" },
      glyf: "grayscale(1) brightness(.5) contrast(1.4) sepia(.5) hue-rotate(280deg) saturate(2.2) drop-shadow(0 1px 0 #fff) drop-shadow(0 0 2px rgba(255,63,164,.7))",
      hero: "linear-gradient(135deg, #ff3fa4, #ffb3dc 50%, #c9c9e0)" },
    { id: "neon", navn: "Neon Night", emoji: "🌃",
      tekst: "Sort, rød og neon. Natklubstemning med lysende ikoner.",
      skrift: "'Exo 2', 'Bahnschrift', 'Segoe UI', sans-serif", ur: "'Monoton', 'Exo 2', 'Bahnschrift', sans-serif",
      v: { k1: "#4a4a4a", k2: "#141414", k3: "#000000", acc: "#ff1e4e", tekst: "#1a0a0e", graa: "#8a6a72",
        lys: "#f3eef0", papir: "#fbf7f8", top: "linear-gradient(#0d0508, #000)", topTekst: "#ff3d64", felt: "#e6dbdf", felt2: "#d4c3c9",
        linje: "rgba(255,30,78,.18)", hvid: "#ffffff", dock: "rgba(0,0,0,.6)", dockKant: "rgba(255,30,78,.85)",
        glas: "rgba(255,255,255,.86)", moerkglas: "rgba(0,0,0,.6)", knapBg: "#0d0508", knapTekst: "#ff3d64",
        etiket: "#ffd6df", etiketSkygge: "0 0 6px #ff1e4e, 0 0 2px #ff1e4e", urFarve: "#ffe5ea", urSkygge: "0 0 6px #ff1e4e, 0 0 16px #ff1e4e, 0 0 32px #ff1e4e",
        widget: "rgba(0,0,0,.55)", widgetKant: "rgba(255,30,78,.8)" },
      glyf: "grayscale(1) brightness(2.4) drop-shadow(0 0 2px #ff1e4e) drop-shadow(0 0 5px #ff1e4e)",
      hero: "linear-gradient(135deg, #000, #3a0610 55%, #ff1e4e)" },
    { id: "vintage", navn: "Vintage", emoji: "🌹",
      tekst: "Creme, beige og blomster. Papir-tekstur og gammeldags charme.",
      skrift: "'Libre Baskerville', Georgia, 'Book Antiqua', serif", ur: "'Dancing Script', 'Segoe Script', 'Brush Script MT', cursive",
      v: { k1: "#fbf3e2", k2: "#d8c19a", k3: "#8a6a44", acc: "#a8545e", tekst: "#4a3424", graa: "#9a8068",
        lys: "#f4ead6", papir: "#fbf5e8", top: "linear-gradient(#efe2c6, #e2cfa8)", topTekst: "#6a4a30", felt: "#e8dabd", felt2: "#d8c39c",
        linje: "rgba(120,80,40,.2)", hvid: "#fffaf0", dock: "rgba(246,236,214,.7)", dockKant: "rgba(160,120,80,.6)",
        glas: "rgba(255,250,238,.9)", moerkglas: "rgba(90,60,36,.5)", knapBg: "#a8545e", knapTekst: "#fff6e6",
        etiket: "#4a3424", etiketSkygge: "0 0 4px #fbf3e2, 0 0 2px #fbf3e2", urFarve: "#7a3a40", urSkygge: "0 1px 0 #fff6e6, 0 2px 8px rgba(255,246,230,.9)",
        widget: "rgba(250,242,226,.72)", widgetKant: "rgba(160,120,80,.55)", widgetTekst: "#4a3424" },
      glyf: "grayscale(1) brightness(.42) sepia(1) saturate(1.6) hue-rotate(-18deg) contrast(1.1) drop-shadow(0 1px 0 rgba(255,250,235,.8))",
      hero: "linear-gradient(135deg, #8a6a44, #c49a7a 55%, #e8d3b0)", papirBillede: true },
    { id: "ice", navn: "Ice Crystal", emoji: "❄️",
      tekst: "Isblå, sølv og frost. Glasagtige ikoner, der glimter som is.",
      skrift: "'Raleway', 'Segoe UI', 'Century Gothic', sans-serif", ur: "'Raleway', 'Segoe UI Light', 'Century Gothic', sans-serif",
      v: { k1: "#ffffff", k2: "#bcdff5", k3: "#6f9cc0", acc: "#2f86c8", tekst: "#123048", graa: "#6f8aa2",
        lys: "#eaf5fd", papir: "#f5fbff", top: "linear-gradient(rgba(255,255,255,.92), rgba(214,236,252,.92))", topTekst: "#1d6aa6", felt: "#d6e9f7", felt2: "#bcd8ee",
        linje: "rgba(47,134,200,.18)", hvid: "#ffffff", dock: "rgba(255,255,255,.35)", dockKant: "rgba(255,255,255,.9)",
        glas: "rgba(250,253,255,.82)", moerkglas: "rgba(40,90,140,.4)", knapBg: "linear-gradient(#7cc4f2, #2f86c8)", knapTekst: "#ffffff",
        etiket: "#ffffff", etiketSkygge: "0 1px 3px rgba(20,60,110,.9)", urFarve: "#ffffff", urSkygge: "0 0 12px rgba(160,220,255,.9), 0 2px 4px rgba(20,60,110,.7)",
        widget: "rgba(255,255,255,.28)", widgetKant: "rgba(255,255,255,.8)" },
      glyf: "grayscale(1) brightness(.55) sepia(1) hue-rotate(165deg) saturate(3) contrast(1.15) drop-shadow(0 1px 0 #fff)",
      hero: "linear-gradient(135deg, #2f86c8, #7cc4f2 55%, #e6f5ff)" },
  ];
  const TEMA = {};
  TEMAER.forEach(function (t) { TEMA[t.id] = t; });

  // ---------------------------------------------------------------
  //  Små hjælpere
  // ---------------------------------------------------------------
  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 480) return;
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function mig() { return typeof FIGUR !== "undefined" && FIGUR ? FIGUR.navn : ""; }
  function erEjer() {
    const n = mig();
    if (!n) return false;
    if (typeof EJERE !== "undefined" && EJERE.indexOf(n) >= 0) return true;
    if (typeof EJER_NAVNE !== "undefined" && EJER_NAVNE.indexOf(n) >= 0) return true;
    return false;
  }
  function online() {
    return typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken();
  }
  function tlf() { return document.getElementById("telefon"); }
  function lille(tekst) {
    const el = tlf() && tlf().querySelector(".tlf-lille-besked");
    if (!el) return;
    el.textContent = tekst;
    el.classList.add("vis");
    clearTimeout(lille.t);
    lille.t = setTimeout(function () { el.classList.remove("vis"); }, 2200);
  }
  function nyNoegle() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }
  function stellaNu() { return typeof krystaller === "number" ? krystaller : 0; }

  // ---------------------------------------------------------------
  //  Hvad ejer jeg, og hvad bruger jeg (huskes også på computeren)
  // ---------------------------------------------------------------
  let ejede = [], valgt = "", provTema = "", provTimer = null;
  function noegle() { return "mit-hotel-tlf-tema-" + mig(); }
  function hentLokalt() {
    try {
      const d = JSON.parse(localStorage.getItem(noegle()) || "{}");
      ejede = Array.isArray(d.ejede) ? d.ejede.filter(function (t) { return TEMA[t]; }) : [];
      valgt = TEMA[d.valgt] ? d.valgt : "";
    } catch (e) { ejede = []; valgt = ""; }
  }
  function gemLokalt() {
    try { localStorage.setItem(noegle(), JSON.stringify({ ejede: ejede, valgt: valgt })); } catch (e) {}
  }
  function ejer(id) { return erEjer() || ejede.indexOf(id) >= 0; }

  let serverFejl = "";
  function hentFraServer() {
    if (!online()) return Promise.resolve();
    return serverKald("hv_tema_mig", { p_token: mitToken() }).then(function (d) {
      if (!d) return;
      serverFejl = "";
      ejede = (d.ejede || []).filter(function (t) { return TEMA[t]; });
      // valgt tema fra serveren (så det følger med til andre computere)
      if (d.valgt !== undefined && d.valgt !== null) valgt = TEMA[d.valgt] && (d.ejer || ejede.indexOf(d.valgt) >= 0) ? d.valgt : "";
      gemLokalt(); anvend(); tegnIgen();
    }).catch(function (e) {
      serverFejl = manglerSql(e) ? "Temaer kan købes, når ejeren har kørt database-65-telefon-temaer.sql i Supabase." : "";
    });
  }
  function manglerSql(e) { return /function|schema cache|does not exist|Could not find/i.test((e && e.message) || ""); }

  // ---------------------------------------------------------------
  //  Sæt temaet på telefonen
  // ---------------------------------------------------------------
  function anvend() {
    const t = tlf();
    if (!t) return;
    const nu = provTema || valgt;
    TEMAER.forEach(function (x) { t.classList.remove("tema-" + x.id); });
    t.classList.toggle("har-tema", !!nu);
    if (nu) { t.classList.add("tema-" + nu); hentSkrifter(); }
  }
  // skrifttyperne hentes først, når et tema bruges (virker uden internet med reserve-skrifter)
  let skrifterHentet = false;
  function hentSkrifter() {
    if (skrifterHentet) return;
    skrifterHentet = true;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Audiowide&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@500;700&family=Dancing+Script:wght@600&family=Exo+2:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Monoton&family=Playfair+Display:wght@500;700&family=Quicksand:wght@500;700&family=Raleway:wght@300;500;700&display=swap";
    document.head.appendChild(l);
  }

  function vaelg(id) {
    if (id && !ejer(id)) return;
    stopProv(true);
    valgt = id || "";
    gemLokalt(); anvend(); tegnIgen();
    lille(id ? TEMA[id].emoji + " " + TEMA[id].navn + " er sat på" : "📱 Standard-telefonen er tilbage");
    if (online()) serverKald("hv_tema_vaelg", { p_token: mitToken(), p_tema: valgt }).catch(function () {});
  }
  function prov(id) {
    stopProv(true);
    provTema = id; anvend(); tegnIgen();
    lille("👀 Du prøver " + TEMA[id].navn + " i 15 sekunder");
    provTimer = setTimeout(function () { stopProv(); }, 15000);
  }
  function stopProv(stille) {
    clearTimeout(provTimer); provTimer = null;
    if (!provTema) return;
    provTema = ""; anvend();
    if (!stille) { tegnIgen(); lille("Prøvetiden er slut"); }
  }

  // ---------------------------------------------------------------
  //  Køb (10 Stella). Ejeren betaler ikke.
  // ---------------------------------------------------------------
  let koeber = "";
  function koeb(id) {
    if (koeber || ejer(id)) return;
    if (online()) {
      koeber = id; tegnIgen();
      serverKald("hv_tema_koeb", { p_token: mitToken(), p_tema: id, p_noegle: nyNoegle() }).then(function (d) {
        koeber = "";
        if (d && Array.isArray(d.ejede)) ejede = d.ejede.filter(function (t) { return TEMA[t]; });
        if (ejede.indexOf(id) < 0) ejede.push(id);
        if (d && typeof d.stella === "number") {
          if (typeof saetPenge === "function") saetPenge({ glimt: d.glimt, stella: d.stella }, false);
          else if (typeof krystaller !== "undefined") { krystaller = d.stella; if (typeof visGlimt === "function") visGlimt(); }
        }
        gemLokalt();
        koebt(id);
      }).catch(function (e) {
        koeber = "";
        if (manglerSql(e)) serverFejl = "Temaer kan købes, når ejeren har kørt database-65-telefon-temaer.sql i Supabase.";
        lille("⚠️ " + (manglerSql(e) ? "Temaerne er ikke åbnet på serveren endnu" : e.message));
        tegnIgen();
      });
      return;
    }
    // uden server: betal med Stella på denne computer
    if (typeof brugKrystaller === "function" && brugKrystaller(PRIS)) {
      ejede.push(id); gemLokalt(); koebt(id);
    } else {
      lille("Du har ikke " + PRIS + " Stella 🔮");
    }
  }
  function koebt(id) {
    lille("🎉 Du har købt " + TEMA[id].navn + "!");
    vaelg(id);
  }

  // ---------------------------------------------------------------
  //  🎨 Fanen "Temaer" i App Butik
  // ---------------------------------------------------------------
  let temaFane = false, bekraeft = "";
  function miniTelefon(t, lille) {
    // en lille telefon, der viser temaet
    const ik = "<i style='background-image:url(" + MAPPE + t.id + "-ikon.png)'></i>";
    return "<span class='tt-mini" + (lille ? " lille" : "") + "' style='--tt-k1:" + t.v.k1 + ";--tt-k2:" + t.v.k2 + ";--tt-k3:" + t.v.k3 + "'>" +
      "<span class='tt-mini-skaerm' style='background-image:url(" + MAPPE + t.id + "-baggrund.jpg)'>" +
      (lille ? "" : "<b style='font-family:" + esc(t.ur) + ";color:" + t.v.urFarve + ";text-shadow:" + t.v.urSkygge + "'>9:41</b>") +
      "<span class='tt-mini-gitter'>" + ik + ik + ik + ik + ik + ik + ik + ik + "</span>" +
      "<span class='tt-mini-dock' style='background:" + t.v.dock + ";border-color:" + t.v.dockKant + "'>" + ik + ik + ik + "</span>" +
      "</span></span>";
  }
  function standardKort() {
    const bruger = !valgt && !provTema;
    return "<div class='tt-kort tt-standard" + (bruger ? " i-brug" : "") + "'>" +
      "<span class='tt-std-ik'>📱</span>" +
      "<span class='tt-info'><b>Standard</b><small>Gratis · telefonen med dine egne farver og baggrunde fra Indstillinger.</small></span>" +
      "<span class='tt-knapper'>" + (bruger ? "<span class='tt-i-brug'>✓ I brug</span>" : "<button data-ttbrug=''>BRUG</button>") + "</span></div>";
  }
  function temaKort(t) {
    const har = ejer(t.id), bruger = valgt === t.id && !provTema, prover = provTema === t.id;
    let knapper;
    if (koeber === t.id) knapper = "<span class='tt-koeber'>Køber …</span>";
    else if (bruger) knapper = "<span class='tt-i-brug'>✓ I brug</span>";
    else if (har) knapper = "<button data-ttbrug='" + t.id + "'>BRUG</button>";
    else if (bekraeft === t.id) knapper = "<button class='tt-koeb sikker' data-ttkoeb='" + t.id + "'>Køb for " + PRIS + " 🔮?</button><button class='tt-fortryd' data-ttfortryd>Fortryd</button>";
    else knapper = "<button class='tt-koeb' data-ttkoeb='" + t.id + "'><img src='billeder/krystal.png' alt=''>" + PRIS + "</button>";
    if (!bruger && !har || (har && !bruger)) knapper += prover ? "<span class='tt-prover'>👀 Prøver …</span>" : "<button class='tt-prov' data-ttprov='" + t.id + "'>Prøv</button>";
    return "<div class='tt-kort" + (bruger ? " i-brug" : "") + "' data-tttema='" + t.id + "'>" + miniTelefon(t) +
      "<span class='tt-info'><b>" + t.emoji + " " + esc(t.navn) + "</b><small>" + esc(t.tekst) + "</small>" +
      "<i>" + (erEjer() ? "👑 Gratis for ejeren" : har ? "✓ Du ejer temaet" : PRIS + " Stella · dit for altid") + "</i>" +
      "<span class='tt-knapper'>" + knapper + "</span></span></div>";
  }
  function temaFaneHtml() {
    return "<div class='tt-hero'><b>🎨 Telefon-temaer</b><span>Giv hele telefonen et nyt look: baggrund, ikoner, farver og skrift. " +
      (erEjer() ? "Du er ejer, så alle temaer er gratis for dig 👑" : "Hvert tema koster " + PRIS + " Stella og er dit for altid.") + "</span>" +
      (erEjer() ? "" : "<span class='tt-saldo'><img src='billeder/krystal.png' alt=''> Du har <b>" + stellaNu().toLocaleString("da-DK") + "</b> Stella</span>") + "</div>" +
      (serverFejl ? "<div class='ab-fejl'>⚠️ " + esc(serverFejl) + "</div>" : "") +
      standardKort() + TEMAER.map(temaKort).join("") +
      "<p class='ab-note'>Tryk <b>Prøv</b> for at se et tema på din telefon i 15 sekunder, før du køber. Du kan altid skifte tilbage i Indstillinger → Tema.</p>";
  }
  // banner i butikkens forside, der fører til temaerne
  function reklameHtml() {
    return "<button class='tt-reklame' data-ttaabn><span class='tt-rek-billeder'>" +
      ["grand", "enchanted", "neon", "ice"].map(function (id) { return "<i style='background-image:url(" + MAPPE + id + "-baggrund.jpg)'></i>"; }).join("") +
      "</span><span class='tt-rek-tekst'><b>🎨 Nye telefon-temaer</b><small>6 looks til hele telefonen · " + (erEjer() ? "gratis for dig 👑" : PRIS + " Stella") + "</small></span><span class='tt-pil'>›</span></button>";
  }

  // App Butik tegnes af telefon.js. Vi lægger vores fane og banner ind bagefter.
  function iButik() {
    const t = tlf();
    if (!t) return null;
    const b = t.querySelector(".tlf-app .ab-indhold");
    return b;
  }
  function pyntButik() {
    const b = iButik();
    if (!b) { temaFane = false; return; }
    const faner = b.querySelector(".ab-faner");
    if (faner && !faner.querySelector("[data-ttfane]")) {
      const k = document.createElement("button");
      k.setAttribute("data-ttfane", "");
      k.textContent = "🎨 Temaer";
      faner.appendChild(k);
    }
    const knap = faner && faner.querySelector("[data-ttfane]");
    if (temaFane) {
      if (!b.querySelector(".tt-fane")) {
        const fanerHtml = faner ? faner.outerHTML : "";
        b.innerHTML = fanerHtml + "<div class='tt-fane'>" + temaFaneHtml() + "</div>";
      }
      b.querySelectorAll(".ab-faner button").forEach(function (x) { x.classList.toggle("valgt", x.hasAttribute("data-ttfane")); });
      return;
    }
    if (knap) knap.classList.remove("valgt");
    // banner øverst i "🛍 Butik"-fanen
    const hero = b.querySelector(".ab-hero");
    if (hero && !b.querySelector(".tt-reklame")) hero.insertAdjacentHTML("afterend", reklameHtml());
  }
  function tegnTemaFane() {
    const b = iButik();
    if (!b) return;
    const sc = b.scrollTop;
    const ff = b.querySelector(".tt-fane");
    if (ff) ff.innerHTML = temaFaneHtml(); else pyntButik();
    b.scrollTop = sc;
  }

  // ---------------------------------------------------------------
  //  🎨 Tema i Indstillinger
  // ---------------------------------------------------------------
  function indstHtml() {
    const nu = valgt;
    return "<div class='tt-indst'><div class='tlf-gruppe-navn'>🎨 Tema · " + (nu ? esc(TEMA[nu].navn) : "Standard") + "</div>" +
      "<div class='tlf-gruppe tt-indst-gruppe'><div class='tt-valg'>" +
      "<button data-ttbrug='' class='" + (!nu ? "valgt" : "") + "' title='Standard'><span class='tt-std'>📱</span><small>Standard</small></button>" +
      TEMAER.map(function (t) {
        const har = ejer(t.id);
        return "<button " + (har ? "data-ttbrug='" + t.id + "'" : "data-ttaabn") + " class='" + (nu === t.id ? "valgt" : "") + (har ? "" : " laast") + "' title='" + esc(t.navn) + "'>" +
          miniTelefon(t, true) + (har ? "" : "<span class='tt-laas'>🔒</span>") + "<small>" + esc(t.navn) + "</small></button>";
      }).join("") + "</div>" +
      "<div class='tlf-raekke tt-indst-raekke'><span>Flere temaer</span><button class='lnk' data-ttaabn>App Butik ›</button></div></div>" +
      (nu ? "<p class='tt-note'>Når et tema er sat på, bruger telefonen temaets farver og baggrund. Vælg <b>Standard</b> for at bruge dine egne farver herunder.</p>" : "") +
      "</div>";
  }
  function pyntIndstillinger() {
    const t = tlf();
    const app = t && t.querySelector(".tlf-app");
    if (!app) return;
    const forh = app.querySelector(".tlf-indhold > .tlf-forhaand");
    if (!forh) return;
    const gl = app.querySelector(".tt-indst");
    if (gl) { if (gl.dataset.v !== valgt + "|" + ejede.join(",")) { gl.outerHTML = indstHtml(); stempel(app); } return; }
    forh.insertAdjacentHTML("afterend", indstHtml());
    stempel(app);
  }
  function stempel(app) { const g = app.querySelector(".tt-indst"); if (g) g.dataset.v = valgt + "|" + ejede.join(","); }

  function tegnIgen() {
    if (temaFane) tegnTemaFane();
    else pyntButik();
    pyntIndstillinger();
  }

  // ---------------------------------------------------------------
  //  Klik (fanges før telefon.js, så vores knapper ikke forstyrrer)
  // ---------------------------------------------------------------
  document.addEventListener("click", function (e) {
    const t = tlf();
    if (!t || !e.target.closest || !t.contains(e.target)) return;
    const el = e.target;
    if (el.closest("[data-abfane]")) { temaFane = false; return; }   // telefon.js skifter selv fane
    const fane = el.closest("[data-ttfane]");
    const aabn = el.closest("[data-ttaabn]");
    if (fane || aabn) {
      e.stopPropagation();
      if (aabn && !iButik()) {
        temaFane = true;
        if (typeof window.tlfAabnApp === "function") window.tlfAabnApp("butik");
        return;
      }
      temaFane = true; bekraeft = "";
      pyntButik();
      const b = iButik(); if (b) b.scrollTop = 0;
      return;
    }
    const brug = el.closest("[data-ttbrug]");
    if (brug) { e.stopPropagation(); vaelg(brug.getAttribute("data-ttbrug")); return; }
    const kb = el.closest("[data-ttkoeb]");
    if (kb) {
      e.stopPropagation();
      const id = kb.getAttribute("data-ttkoeb");
      if (bekraeft === id) { bekraeft = ""; koeb(id); return; }
      if (!erEjer() && !online() && stellaNu() < PRIS) { lille("Du har kun " + stellaNu() + " Stella – du skal bruge " + PRIS + " 🔮"); return; }
      bekraeft = id; tegnIgen();
      clearTimeout(koeb.t);
      koeb.t = setTimeout(function () { if (bekraeft === id) { bekraeft = ""; tegnIgen(); } }, 5000);
      return;
    }
    if (el.closest("[data-ttfortryd]")) { e.stopPropagation(); bekraeft = ""; tegnIgen(); return; }
    const pv = el.closest("[data-ttprov]");
    if (pv) { e.stopPropagation(); prov(pv.getAttribute("data-ttprov")); return; }
  }, true);

  // ---------------------------------------------------------------
  //  Stil
  // ---------------------------------------------------------------
  function temaCss(t) {
    const P = "#telefon.tema-" + t.id;
    const v = t.v;
    const I = " !important";
    const ikon = "url(" + MAPPE + t.id + "-ikon.png) center / cover no-repeat" + I;
    const r = [];
    r.push(P + " { --t-k1: " + v.k1 + I + "; --t-k2: " + v.k2 + I + "; --t-k3: " + v.k3 + I + "; --t-acc: " + v.acc + I + "; --t-tekst: " + v.tekst + I + "; --t-graa: " + v.graa + I +
      "; --t-lys: " + v.lys + I + "; --t-papir: " + v.papir + I + "; --t-topbg: " + v.lys + I + "; --t-felt: " + v.felt + I + "; --t-felt2: " + v.felt2 + I +
      "; --t-linje: " + v.linje + I + "; --t-hvid: " + v.hvid + I + "; --t-dock: " + v.dock + I + "; --t-glas: " + v.glas + I + "; --t-glas2: " + v.glas + I +
      "; --t-moerkglas: " + v.moerkglas + I + "; --t-hover: " + v.linje + I + "; --t-kant: " + v.k3 + I + "; }");
    r.push(P + ", " + P + " *:not(svg):not(svg *) { font-family: " + t.skrift + I + "; }");
    r.push(P + " .tlf-bg { background-image: url(" + MAPPE + t.id + "-baggrund.jpg)" + I + "; background-size: cover" + I + "; background-position: center" + I + "; }");
    // ikoner
    r.push(P + " .tlf-app-ik:not(.tlf-mappe-ik) .fl, " + P + " .ab-ik { background: " + ikon + "; box-shadow: 0 3px 8px rgba(0,0,0,.35)" + I + "; }");
    r.push(P + " .tlf-app-ik:not(.tlf-mappe-ik) .fl svg, " + P + " .ab-ik svg { filter: " + t.glyf + I + "; }");
    r.push(P + " .tlf-app-ik:not(.tlf-mappe-ik) .fl .tlf-kal { filter: " + t.glyf + "; }");
    r.push(P + " .tlf-app-ik { color: " + v.etiket + I + "; text-shadow: " + v.etiketSkygge + I + "; }");
    r.push(P + " .tlf-app-ik span.nv { font-weight: 600; letter-spacing: .01em; }");
    r.push(P + " .tlf-mappe-ik .fl { background: " + v.widget + I + "; border: 1px solid " + v.widgetKant + "; }");
    r.push(P + " .tlf-dock { background: " + v.dock + I + "; box-shadow: inset 0 0 0 1.5px " + v.dockKant + ", 0 6px 18px rgba(0,0,0,.3); }");
    // låseskærm og ur
    r.push(P + " .tlf-laas .tid { font-family: " + t.ur + I + "; color: " + v.urFarve + I + "; text-shadow: " + v.urSkygge + I + "; font-weight: 400; letter-spacing: 0; }");
    r.push(P + " .tlf-laas .dag, " + P + " .tlf-laas .hl { color: " + v.urFarve + I + "; text-shadow: " + v.etiketSkygge + I + "; }");
    r.push(P + " .tlf-rund { background: " + v.moerkglas + I + "; box-shadow: inset 0 0 0 1.5px " + v.dockKant + "; }");
    // widgets
    r.push(P + " .tlf-w, " + P + " .tlf-widget { background: " + v.widget + I + "; box-shadow: inset 0 0 0 1.5px " + v.widgetKant + I + "; " + (v.widgetTekst ? "color: " + v.widgetTekst + I + "; text-shadow: none;" : "") + " }");
    // inde i apps
    r.push(P + " .tlf-app { background: " + v.lys + (t.papirBillede ? " url(" + MAPPE + "vintage-papir.jpg) center / 300px auto" : "") + I + "; }");
    r.push(P + " .tlf-top { background: " + v.top + I + "; border-bottom: 1.5px solid " + v.dockKant + I + "; }");
    r.push(P + " .tlf-top h3, " + P + " .tlf-top .ti, " + P + " .tlf-top .tlf-tb, " + P + " .tlf-top button { color: " + v.topTekst + I + "; }");
    r.push(P + " .tlf-top h3 { font-weight: 700; letter-spacing: .02em; }");
    r.push(P + " .tlf-top svg { color: " + v.topTekst + "; }");
    r.push(P + " .tlf-status.moerk { color: " + v.topTekst + I + "; }");
    r.push(P + " .tlf-mini div { background-image: url(" + MAPPE + t.id + "-baggrund.jpg)" + I + "; color: " + v.urFarve + I + "; font-family: " + t.ur + I + "; text-shadow: " + v.urSkygge + I + "; }");
    r.push(P + " .tlf-mini { background: linear-gradient(135deg, " + v.k1 + ", " + v.k2 + " 45%, " + v.k3 + ")" + I + "; }");
    r.push(P + " .ab-hero, " + P + " .tt-hero { background: " + t.hero + I + "; box-shadow: 0 4px 14px rgba(0,0,0,.25)" + I + "; }");
    r.push(P + " .ab-knapper button:not(.ab-slet), " + P + " .tt-knapper button:not(.tt-fortryd):not(.tt-prov) { background: " + v.knapBg + I + "; color: " + v.knapTekst + I + "; }");
    r.push(P + " .ab-faner button.valgt { background: " + v.knapBg + I + "; color: " + v.knapTekst + I + "; }");
    r.push(P + " .tlf-gruppe { box-shadow: 0 0 0 1px " + v.linje + "; }");
    r.push(P + " .tlf-b.mig { background: " + v.knapBg + I + "; color: " + v.knapTekst + I + "; }");
    return r.join("\n");
  }
  // ekstra pynt for hvert tema
  const EKSTRA = [
    // Grand Hotel: guldkant om skærmen
    "#telefon.tema-grand .tlf-skaerm { box-shadow: inset 0 0 0 2px rgba(226,186,104,.65); }",
    "#telefon.tema-grand .tlf-top h3 { font-variant: small-caps; letter-spacing: .06em; }",
    // Enchanted: glimtende ikoner
    "#telefon.tema-enchanted .tlf-app-ik .fl { animation: ttGnist 3.2s ease-in-out infinite; }",
    "#telefon.tema-enchanted .tlf-app-ik:nth-child(3n) .fl { animation-delay: -1.1s; } #telefon.tema-enchanted .tlf-app-ik:nth-child(3n+1) .fl { animation-delay: -2.2s; }",
    "@keyframes ttGnist { 0%,100% { box-shadow: 0 3px 8px rgba(0,0,0,.35); } 50% { box-shadow: 0 0 12px rgba(190,140,255,.85), 0 3px 8px rgba(0,0,0,.35); } }",
    "#telefon.tema-enchanted .tlf-hjem.rediger .tlf-app-ik .fl { animation: tlfVrik .28s ease-in-out infinite alternate; }",
    // Y2K: chrome-tekst på top og blanke kanter
    "#telefon.tema-y2k .tlf-top h3 { text-transform: uppercase; letter-spacing: .12em; font-size: 15px; }",
    "#telefon.tema-y2k .tlf-dock { border-radius: 40px; }",
    // Neon Night: lysende kanter
    "#telefon.tema-neon .tlf-app-ik:not(.tlf-mappe-ik) .fl { box-shadow: 0 0 0 1.5px #ff1e4e, 0 0 8px #ff1e4e, inset 0 0 6px rgba(255,30,78,.6)" + " !important; }",
    "#telefon.tema-neon .tlf-top h3 { text-shadow: 0 0 6px #ff1e4e, 0 0 14px #ff1e4e; text-transform: uppercase; letter-spacing: .1em; font-size: 15px; }",
    "#telefon.tema-neon .tlf-skaerm { box-shadow: inset 0 0 0 1.5px rgba(255,30,78,.6); }",
    "#telefon.tema-neon .tlf-krop { box-shadow: 0 0 0 1px #ff1e4e, 0 0 18px rgba(255,30,78,.55), 0 30px 60px -10px rgba(0,0,0,.6) !important; }",
    // Vintage: blød papirskygge
    "#telefon.tema-vintage .tlf-top h3 { font-style: italic; }",
    "#telefon.tema-vintage .tlf-gruppe { border: 1px solid rgba(160,120,80,.35); }",
    "#telefon.tema-vintage .tlf-status { color: #4a3424 !important; }",
    "#telefon.tema-vintage .tlf-laas { color: #5a3a28 !important; text-shadow: 0 0 4px #fbf3e2, 0 0 8px #fbf3e2; }",
    // Ice: glas-ikoner (lidt gennemsigtige)
    "#telefon.tema-ice .tlf-app-ik:not(.tlf-mappe-ik) .fl { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }",
    "#telefon.tema-ice .tlf-laas, #telefon.tema-ice .tlf-status { text-shadow: 0 1px 3px rgba(20,60,110,.9), 0 0 8px rgba(20,60,110,.5); }",
    "#telefon.tema-ice .tlf-top { backdrop-filter: blur(14px) saturate(1.4); }",
    "#telefon.tema-ice .tlf-top h3 { font-weight: 500 !important; letter-spacing: .08em; }",
  ];
  const GRUND = [
    // fanen og kortene i App Butik
    "#telefon .tt-hero { display: block; border-radius: 18px; padding: 14px; color: #fff; background: linear-gradient(135deg, #5a0d1d, #8a1f34 50%, #6c3fb8); box-shadow: 0 4px 14px rgba(0,0,0,.2); }",
    "#telefon .tt-hero b { display: block; font-size: 17px; margin-bottom: 4px; } #telefon .tt-hero span { display: block; font-size: 12px; line-height: 1.4; opacity: .95; }",
    "#telefon .tt-hero .tt-saldo { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 3px 10px; border-radius: 12px; background: rgba(0,0,0,.25); font-size: 12px; }",
    "#telefon .tt-saldo img, #telefon .tt-koeb img { width: 14px; height: 14px; image-rendering: pixelated; vertical-align: middle; }",
    "#telefon .tt-kort { display: flex; gap: 12px; align-items: center; padding: 12px 2px; border-bottom: 1px solid var(--t-linje); }",
    "#telefon .tt-kort.i-brug .tt-info b::after { content: ' ✓'; color: var(--t-on); }",
    "#telefon .tt-standard { padding: 12px 2px; }",
    "#telefon .tt-std-ik { flex: none; width: 52px; height: 52px; border-radius: 13px; display: grid; place-items: center; font-size: 28px; background: var(--t-felt); }",
    "#telefon .tt-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }",
    "#telefon .tt-info b { font-size: 14px; } #telefon .tt-info small { font-size: 11px; color: var(--t-graa); line-height: 1.35; }",
    "#telefon .tt-info i { font-style: normal; font-size: 10.5px; font-weight: 600; color: var(--t-acc); }",
    "#telefon .tt-knapper { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 6px; }",
    "#telefon .tt-standard .tt-knapper { margin-top: 0; }",
    "#telefon .tt-knapper button { border: 0; border-radius: 14px; padding: 5px 13px; background: rgba(47,111,224,.12); color: #2f6fe0; font-weight: 700; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }",
    "#telefon .tt-knapper button.tt-koeb { background: linear-gradient(#a77be8, #6c3fb8); color: #fff; }",
    "#telefon .tt-knapper button.tt-koeb.sikker { background: linear-gradient(#ff8a5c, #e5383b); animation: ttPuls 1s ease-in-out infinite; }",
    "@keyframes ttPuls { 50% { transform: scale(1.05); } }",
    "#telefon .tt-knapper button.tt-prov, #telefon .tt-knapper button.tt-fortryd { background: var(--t-felt); color: var(--t-tekst); font-weight: 600; }",
    "#telefon .tt-i-brug { font-size: 12px; font-weight: 700; color: var(--t-on); }",
    "#telefon .tt-koeber, #telefon .tt-prover { font-size: 11.5px; color: var(--t-graa); }",
    // den lille telefon
    "#telefon .tt-mini { flex: none; position: relative; width: 62px; height: 124px; border-radius: 14px; padding: 2.5px; box-sizing: border-box; background: linear-gradient(135deg, var(--tt-k1), var(--tt-k2) 45%, var(--tt-k3)); box-shadow: 0 4px 10px rgba(0,0,0,.28); }",
    "#telefon .tt-mini-skaerm { position: relative; display: block; width: 100%; height: 100%; border-radius: 12px; border: 2px solid #0b0b0d; box-sizing: border-box; background-size: cover; background-position: center; overflow: hidden; }",
    "#telefon .tt-mini-skaerm b { display: block; text-align: center; font-size: 13px; margin-top: 8px; line-height: 1; }",
    "#telefon .tt-mini-gitter { position: absolute; left: 5px; right: 5px; top: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }",
    "#telefon .tt-mini i { display: block; aspect-ratio: 1; border-radius: 3px; background-size: cover; box-shadow: 0 1px 2px rgba(0,0,0,.3); }",
    "#telefon .tt-mini-dock { position: absolute; left: 4px; right: 4px; bottom: 5px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 3px 5px; border-radius: 7px; border: 1px solid; }",
    "#telefon .tt-mini.lille { width: 40px; height: 80px; border-radius: 10px; padding: 2px; }",
    "#telefon .tt-mini.lille .tt-mini-skaerm { border-radius: 8px; border-width: 1.5px; }",
    "#telefon .tt-mini.lille .tt-mini-gitter { top: 10px; left: 3px; right: 3px; gap: 2px; }",
    "#telefon .tt-mini.lille .tt-mini-dock { left: 2px; right: 2px; bottom: 3px; padding: 2px; gap: 2px; border-radius: 4px; }",
    "#telefon .tt-mini.lille i { border-radius: 2px; }",
    // banneret i butikken
    "#telefon .tt-reklame { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 10px; padding: 10px; border: 0; border-radius: 16px; cursor: pointer; text-align: left; color: #fff; background: linear-gradient(135deg, #2a1150, #7a1428 60%, #b8862e); box-shadow: 0 3px 10px rgba(0,0,0,.2); }",
    "#telefon .tt-rek-billeder { flex: none; display: flex; }",
    "#telefon .tt-rek-billeder i { display: block; width: 22px; height: 44px; border-radius: 5px; margin-left: -6px; border: 1.5px solid #fff; background-size: cover; background-position: center; box-shadow: 0 2px 4px rgba(0,0,0,.3); }",
    "#telefon .tt-rek-billeder i:first-child { margin-left: 0; }",
    "#telefon .tt-rek-tekst { flex: 1; display: flex; flex-direction: column; } #telefon .tt-rek-tekst b { font-size: 13.5px; } #telefon .tt-rek-tekst small { font-size: 11px; opacity: .9; }",
    "#telefon .tt-pil { font-size: 26px; line-height: 1; opacity: .85; }",
    // Indstillinger
    "#telefon .tt-valg { display: flex; gap: 8px; overflow-x: auto; padding: 12px 12px 8px; scrollbar-width: none; }",
    "#telefon .tt-valg::-webkit-scrollbar { display: none; }",
    "#telefon .tt-valg button { flex: none; position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 0; background: none; padding: 3px; border-radius: 12px; cursor: pointer; color: var(--t-tekst); }",
    "#telefon .tt-valg button small { font-size: 9.5px; white-space: nowrap; }",
    "#telefon .tt-valg button.valgt { box-shadow: 0 0 0 2px var(--t-acc); }",
    "#telefon .tt-valg button.laast .tt-mini { filter: grayscale(.6) brightness(.8); }",
    "#telefon .tt-valg .tt-std { width: 40px; height: 80px; border-radius: 10px; display: grid; place-items: center; font-size: 22px; background: var(--t-felt); }",
    "#telefon .tt-laas { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); font-size: 16px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.6)); }",
    "#telefon .tt-indst-raekke { border-top: 1px solid var(--t-linje); }",
    "#telefon .tt-indst-raekke span { flex: 1; }",
    "#telefon .tt-indst-raekke .lnk { border: 0; background: none; color: var(--t-acc); font-weight: 600; cursor: pointer; padding: 0; }",
    "#telefon .tt-note { margin: 8px 24px 0; font-size: 11px; color: var(--t-graa); line-height: 1.4; }",
  ];
  const stil = document.createElement("style");
  stil.id = "telefon-temaer-stil";
  stil.textContent = GRUND.concat(TEMAER.map(temaCss), EKSTRA).join("\n");
  document.head.appendChild(stil);

  // ---------------------------------------------------------------
  //  Start: vent på telefonen, og hold øje med, hvornår App Butik
  //  eller Indstillinger tegnes
  // ---------------------------------------------------------------
  vent(function () { return !!tlf() && !!mig(); }, function () {
    hentLokalt();
    anvend();
    hentFraServer();
    let travl = false;
    new MutationObserver(function () {
      if (travl) return;
      travl = true;
      try {
        if (!tlf().querySelector(".tlf-app .ab-indhold")) temaFane = false;
        pyntButik();
        pyntIndstillinger();
      } finally { travl = false; }
    }).observe(tlf(), { childList: true, subtree: true });
    // hvis nogen (fx telefonens egne indstillinger) fjerner klassen, sættes den på igen
    setInterval(function () {
      const t = tlf(), nu = provTema || valgt;
      if (t && nu && !t.classList.contains("tema-" + nu)) anvend();
    }, 2000);
    // hent fra serveren igen af og til (fx hvis ejeren har givet et tema, eller man har købt på en anden computer)
    setInterval(function () { if (!tlf().hidden) hentFraServer(); }, 120000);
  });

  window.telefonTemaer = { TEMAER: TEMAER, vaelg: vaelg, genindlaes: function () { hentLokalt(); anvend(); tegnIgen(); }, valgt: function () { return valgt; }, ejede: function () { return ejede.slice(); } };
})();
