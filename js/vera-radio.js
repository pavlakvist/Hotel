// =============================================================
//  📻 Vera-radio — hotellets egen radio
//  - Nyt job 🎙 Radiovært (skilt, jobbeskrivelse, Staff chat, vagtskema og løn som de andre ansatte).
//  - 🎙 Radiostudiet på 2. sal: kun radioværter og ejeren kan komme ind. Podcastbord med
//    computere og mikrofoner, hvor man sidder overfor hinanden.
//  - Ejerpanel → 📻 Radio (kun radioværter og ejeren): start/slut live, lyttere, musik, playlister,
//    pause/fortsæt, snak (optag med mikrofonen, oplæs tekst eller et live-link), radioprogrammer
//    med dato og tidspunkt, næste emne, gemte udsendelser, beskeder fra lytterne og vagtskema.
//  - 📱 Appen "Vera-radio" ligger fast på alles telefon: lyt live, ⏸/▶, gemte udsendelser,
//    programmet og skriv til værterne, mens de er live. Radioen står også fast i Kontakter.
//  - 📻-knappen i hotellet: lyt med ▶/⏸ og skru op og ned.
//  Hvordan alle hører det samme: radioens "nu spiller" + kø ligger i databasen
//  (database-45-radio.sql). Hver computer spiller selv lydfilen fra det samme sted i sangen.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================
(function () {
  if (window.veraRadioKlar) return;
  window.veraRadioKlar = true;

  const RV_NUMMER = "70 20 10 10";
  const RV_SKILT = "radiovaert";
  const RV_MANGLER = "⚠️ Serveren kender ikke Vera-radio endnu. Kør database-45-radio.sql i Supabase → SQL Editor.";
  const RV_VOL_NOEGLE = "mit-hotel-radio-lydstyrke";

  // ---------------------------------------------------------------
  //  Små hjælpere
  // ---------------------------------------------------------------
  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 240) return;
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function mig() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(mig()) >= 0; }
  function maaStyre() { return erEjer() || (typeof ansatte !== "undefined" && ansatte[mig()] === RV_SKILT); }
  function token() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function online() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function"; }
  function mangler(e) { return /function|schema cache|does not exist|hv_radio/i.test((e && e.message) || ""); }
  function fejlTekst(e) { return mangler(e) ? RV_MANGLER : (e && e.message) || "Noget gik galt."; }
  function kald(fn, data) { return serverKald(fn, data || {}); }
  function toast(t) {
    try { if (typeof visToast === "function") { visToast(t); return; } } catch (e) {}
    try { if (typeof besked !== "undefined" && besked) besked.textContent = t; } catch (e) {}
  }
  function mmss(s) {
    s = Math.max(0, Math.floor(s || 0));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }
  const DAGE = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
  const MDR = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function to(n) { return (n < 10 ? "0" : "") + n; }
  function kl(ms) { const d = new Date(ms); return to(d.getHours()) + ":" + to(d.getMinutes()); }
  function dagTekst(ms) {
    const d = new Date(ms), i = new Date();
    const imorgen = new Date(); imorgen.setDate(i.getDate() + 1);
    if (d.toDateString() === i.toDateString()) return "I dag kl. " + kl(ms);
    if (d.toDateString() === imorgen.toDateString()) return "I morgen kl. " + kl(ms);
    return DAGE[d.getDay()] + " " + d.getDate() + ". " + MDR[d.getMonth()] + " kl. " + kl(ms);
  }
  function sporNavn(s) {
    if (!s) return "Stille";
    if (s.type === "tale") return "🗣 " + (s.titel || "Værten taler");
    if (s.type === "klip") return "🎙 " + (s.titel || "Snak");
    if (s.type === "link") return "📡 " + (s.titel || "Live-link");
    if (s.type === "youtube") return "▶️ " + (s.titel || "YouTube") + (s.kunstner ? " – " + s.kunstner : "");
    return "🎵 " + (s.titel || "Sang") + (s.kunstner ? " – " + s.kunstner : "");
  }
  // To klik: første gang står der "Er du sikker?"
  function toKlik(knap, gør) {
    if (!knap.classList.contains("rv-sikker")) {
      const f = knap.innerHTML;
      knap.classList.add("rv-sikker");
      knap.textContent = "Er du sikker?";
      setTimeout(function () { if (knap.isConnected) { knap.classList.remove("rv-sikker"); knap.innerHTML = f; } }, 3000);
      return;
    }
    gør();
  }


  // ---------------------------------------------------------------
  //  🎙 Det nye job: Radiovært
  // ---------------------------------------------------------------
  const RV_JOB_KAN = ["📻 Får 🛡-knappen med fanen 📻 Radio",
    "🔴 Starter og slutter live-udsendelser på Vera-radio",
    "🎵 Spiller musik, laver playlister og kan sætte på pause og fortsætte",
    "🎙 Snakker i radioen (optager med mikrofonen eller får teksten læst op)",
    "🗓 Planlægger radioprogrammer med dato og tidspunkt og skriver næste emne",
    "✉️ Får beskederne fra lytterne, mens de er live",
    "🎧 Kan gå ind i Radiostudiet på 2. sal (kun radioværter og ejeren)",
    "💼 Får løn hver mandag som de andre ansatte"];
  vent(function () { return typeof SKILTE !== "undefined" && typeof ANSAT_SKILTE !== "undefined"; }, function () {
    if (!SKILTE.some(function (s) { return s.id === RV_SKILT; })) {
      let efter = SKILTE.findIndex(function (s) { return s.id === "eventfolk"; });
      if (efter < 0) efter = SKILTE.findIndex(function (s) { return s.id === "eventvaert"; });
      SKILTE.splice(efter + 1, 0, { id: RV_SKILT, navn: "Radiovært", tekst: "Laver radio på Vera-radio med snak og musik.",
        fil: "billeder/skilte/radiovaert.png" });
    }
    if (ANSAT_SKILTE.indexOf(RV_SKILT) < 0) ANSAT_SKILTE.push(RV_SKILT);
    if (typeof JOB_KAN !== "undefined") JOB_KAN[RV_SKILT] = RV_JOB_KAN.concat(typeof PERSONALE_KAN !== "undefined" ? PERSONALE_KAN : []);
    if (typeof EJER_KAN !== "undefined" && EJER_KAN.indexOf("📻 Kan alt det, radioværterne kan på Vera-radio") < 0) EJER_KAN.push("📻 Kan alt det, radioværterne kan på Vera-radio");
  });
  vent(function () { return typeof JOB_BESKRIVELSE !== "undefined" && typeof SKILTE !== "undefined"; }, function () {
    JOB_BESKRIVELSE[RV_SKILT] = "Som radiovært laver du Vera-radio, som alle på hotellet kan lytte til. Du starter live-udsendelser, snakker, spiller musik og laver playlister. Du planlægger radioprogrammer (fx Søndagsradio) og læser beskederne fra lytterne, mens I er live. Du kan gå ind i Radiostudiet på 2. sal.";
    SKILTE.forEach(function (sk) { if (sk.id === RV_SKILT) sk.beskrivelse = JOB_BESKRIVELSE[RV_SKILT]; });
  });
  vent(function () { return typeof ROLLE_FANER !== "undefined" && typeof ROLLE_NAVN !== "undefined"; }, function () {
    function giv() {
      const fra = (ROLLE_FANER.staff || ["guide", "mitjob", "staffchat"]).filter(function (f) { return f !== "beskeder"; });
      if (!ROLLE_FANER[RV_SKILT]) ROLLE_FANER[RV_SKILT] = [];
      const l = ROLLE_FANER[RV_SKILT];
      fra.concat(["radio"]).forEach(function (f) { if (l.indexOf(f) < 0) l.push(f); });
      if (l.indexOf("guide") > 0) { l.splice(l.indexOf("guide"), 1); l.unshift("guide"); }
      ROLLE_NAVN[RV_SKILT] = "🛡️ Radio-panel";
    }
    giv();
    setInterval(giv, 2000);
  });
  vent(function () { return typeof ROLLE_GUIDE !== "undefined"; }, function () {
    ROLLE_GUIDE[RV_SKILT] = "Du er radiovært på Vera-radio. I fanen 📻 Radio går du live, snakker i mikrofonen, spiller musik (også YouTube-links) og planlægger programmer. Lytterne kan skrive til dig, mens I er live. Se 📻 Radio → 📖 Guide.";
  });
  vent(function () { return typeof STAFF_RANG !== "undefined"; }, function () {
    if (STAFF_RANG.some(function (r) { return r[0] === RV_SKILT; })) return;
    const i = STAFF_RANG.findIndex(function (r) { return r[0] === "andet"; });
    STAFF_RANG.splice(i < 0 ? STAFF_RANG.length : i, 0, [RV_SKILT, "📻 Radiovært"]);
  });
  vent(function () { return typeof VS_KATEGORIER !== "undefined"; }, function () {
    if (!VS_KATEGORIER.some(function (k) { return k[0] === RV_SKILT; })) VS_KATEGORIER.push([RV_SKILT, "📻", "Radiovært"]);
    if (typeof JOB_KAN !== "undefined" && JOB_KAN[RV_SKILT] && JOB_KAN[RV_SKILT].indexOf("📅 Kan skrive sig på vagter i vagtskemaet") < 0) JOB_KAN[RV_SKILT].push("📅 Kan skrive sig på vagter i vagtskemaet");
  });
  vent(function () { return typeof PANEL_HJAELP !== "undefined"; }, function () {
    PANEL_HJAELP.radio = { titel: "📻 Vera-radio",
      tekst: "Her styrer du hotellets radio. Alle på hotellet kan lytte med 📻-knappen eller i appen Vera-radio på telefonen.",
      punkter: ["<b>🔴 Start live</b> når I går i luften, og <b>⏹ Slut</b> når I er færdige. Udsendelsen bliver gemt, så andre kan høre den igen.",
        "Spil musik fra <b>🎵 Musik</b>, eller lav en <b>📋 Playliste</b>. ⏸ sætter radioen på pause for alle.",
        "Snak: optag med mikrofonen 🎙, få en tekst læst op 🗣, eller brug et live-link 📡.",
        "Planlæg programmer under <b>🗓 Programmer</b> og skriv, hvad det næste emne er.",
        "Mens I er live, kan lytterne skrive til jer. Beskederne kommer her og på telefonen."] };
  });


  // ---------------------------------------------------------------
  //  🎙 Radiostudiet (2. sal) — kun radioværter og ejeren
  // ---------------------------------------------------------------
  const RV_TYPER = [
    { id: "radio-bord", navn: "Podcastbord med computere og mikrofoner", felter: [2, 1] },
    { id: "radio-stol", navn: "Radiostol", saede: 22, bagfra: true },
    { id: "radio-onair", navn: "ON AIR-lampe" },
    { id: "radio-hoejttaler", navn: "Studiehøjttaler" },
    { id: "radio-reol", navn: "Pladereol med gammel radio", felter: [2, 1] },
  ];
  // retning 0 vender ned mod venstre, 1 ned mod højre, 2 og 3 vender ryggen til (man sidder bagfra)
  const RV_MOEBLER = [
    { type: "radio-reol", x: 1, y: 0, retning: 0 },
    { type: "radio-onair", x: 4, y: 0, retning: 0 },
    { type: "radio-hoejttaler", x: 3, y: 0, retning: 0 },
    { type: "radio-hoejttaler", x: 7, y: 0, retning: 0 },
    { type: "radio-reol", x: 8, y: 0, retning: 0 },
    // podcastbordene: én sidder bag bordet og kigger frem, én sidder foran med ryggen til os
    { type: "radio-stol", x: 3, y: 2, retning: 0 }, { type: "radio-stol", x: 4, y: 2, retning: 0 },
    { type: "radio-bord", x: 3, y: 3, retning: 0 },
    { type: "radio-stol", x: 3, y: 4, retning: 2 }, { type: "radio-stol", x: 4, y: 4, retning: 2 },
    { type: "radio-stol", x: 6, y: 2, retning: 0 }, { type: "radio-stol", x: 7, y: 2, retning: 0 },
    { type: "radio-bord", x: 6, y: 3, retning: 0 },
    { type: "radio-stol", x: 6, y: 4, retning: 2 }, { type: "radio-stol", x: 7, y: 4, retning: 2 },
    { type: "cafe-sofa", x: 0, y: 3, retning: 1 },
    { type: "cafe-plante", x: 0, y: 0, retning: 0 },
    { type: "cafe-plante", x: 0, y: 7, retning: 0 },
    { type: "cafe-lampe", x: 0, y: 6, retning: 0 },
    { type: "radio-hoejttaler", x: 9, y: 7, retning: 0 },
  ];
  function rvMoeblerData() {
    return RV_MOEBLER.filter(function (m) { return typeof MOEBEL_TYPER === "undefined" || MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
  }
  function iStudiet() { return typeof rumValg !== "undefined" && rumValg === "vaerelse" && typeof aktivtVaerelse !== "undefined" && aktivtVaerelse === "radio"; }

  vent(function () {
    return typeof INDBYGGEDE_RUM !== "undefined" && typeof NAV_RUM !== "undefined" && typeof gaaTilVaerelse === "function" &&
      typeof MOEBEL_TYPER !== "undefined" && typeof vaerelseMoebler === "function" && typeof forberedRetninger === "function" && typeof EJER_NAVNE !== "undefined";
  }, function () {
    RV_TYPER.forEach(function (t) {
      if (MOEBEL_TYPER[t.id]) return;
      t.retninger = [0, 1, 2, 3].map(function (i) { return "billeder/moebler/" + t.id + "/" + t.id + "-" + i + ".png"; });
      t.kategori = "Radio";
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
    });
    INDBYGGEDE_RUM.radio = { id: "radio", navn: "Radiostudiet", ejer: EJER_NAVNE[0], bredde: 10, dybde: 8,
      vaeg: "#4a1824", gulv1: "#3b3036", gulv2: "#352a30", vaegHoejde: 210, doer: null };
    // Radiostudiet får sin egen etage i elevatoren og navigatøren (2. sal blev til Lejlighederne)
    if (typeof ETAGER !== "undefined" && !ETAGER.some(function (e) { return e.id === "radio"; })) {
      const efter = ETAGER.findIndex(function (e) { return e.id === "lej"; });
      const tag = ETAGER.findIndex(function (e) { return e.id === "tag"; });
      const plads = efter >= 0 ? efter + 1 : (tag >= 0 ? tag : ETAGER.length);
      ETAGER.splice(plads, 0, { id: "radio", navn: "Radiostudiet", ikon: "📻" });
    }
    if (!NAV_RUM.some(function (r) { return r.id === "radio"; })) {
      NAV_RUM.push({ id: "radio", etage: "radio", navn: "Radiostudiet", om: "Vera-radio 🎙 Kun for radioværter", billede: "billeder/rum/radio.png",
        maks: 12, rum: "vaerelse", vaerelse: "radio", radio: true });
    }
    // Kun radioværter og ejeren kommer ind
    const gaaFoerRadio = gaaTilVaerelse;
    gaaTilVaerelse = function (id) {
      if (id === "radio" && !maaStyre()) {
        toast("🔒 Radiostudiet er kun for radioværterne og ejeren.");
        try { besked.textContent = "🔒 Radiostudiet er kun for radioværterne og ejeren. Lyt med på 📻-knappen i stedet!"; } catch (e) {}
        return;
      }
      gaaFoerRadio(id);
    };
    // Møblerne: det, der er gemt på denne computer, ellers studiets egne
    const vaerelseMoeblerFoerRadio = vaerelseMoebler;
    vaerelseMoebler = function (id) {
      if (id === "radio" && typeof andreVaerelser !== "undefined" && !andreVaerelser.radio) {
        let gemt = null;
        try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-radio") || "null"); } catch (e) {}
        andreVaerelser.radio = (Array.isArray(gemt) && gemt.length ? gemt : rvMoeblerData())
          .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
      }
      return vaerelseMoeblerFoerRadio(id);
    };
    if (typeof serverKald === "function") {
      const serverKaldFoerRadio = serverKald;
      serverKald = async function (funktion, data) {
        const svar = await serverKaldFoerRadio(funktion, data);
        if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar.radio) && svar.radio.length)) svar.radio = rvMoeblerData();
        return svar;
      };
    }
    if (typeof skiftRum === "function") {
      const skiftRumFoerRadio = skiftRum;
      skiftRum = function (navn) {
        skiftRumFoerRadio(navn);
        if (iStudiet()) try { besked.textContent = "🎙 Velkommen i Radiostudiet! Klik på et podcastbord (eller 🛡 → 📻 Radio) for at styre Vera-radio."; } catch (e) {}
      };
    }
    // Fyret? Så skal man ud af studiet
    setInterval(function () { if (iStudiet() && !maaStyre() && typeof skiftRum === "function") skiftRum("hal"); }, 3000);
    // Navigatøren: 🔒 for alle andre
    if (typeof visNav === "function") {
      const visNavFoerRadio = visNav;
      visNav = function () {
        visNavFoerRadio();
        if (typeof navVindue === "undefined") return;
        navVindue.querySelectorAll("[data-besoeg='radio']").forEach(function (k) {
          if (maaStyre()) return;
          k.disabled = true; k.textContent = "🔒 Kun radioværter"; k.classList.add("laast");
        });
      };
    }
    // Klik på et podcastbord i studiet → åbn radio-fanen
    vent(function () { return typeof laerred !== "undefined" && typeof musTilFelt === "function" && typeof moebelPaa === "function"; }, function () {
      laerred.addEventListener("click", function (e) {
        if (!iStudiet() || !maaStyre() || e.ctrlKey || e.metaKey) return;
        if (typeof valgtType !== "undefined" && valgtType) return;
        const f = musTilFelt(e);
        const m = moebelPaa(f.x, f.y);
        if (m && m.type === "radio-bord") setTimeout(function () { aabnPanel(); }, 250);
      });
    });
  });


  // ---------------------------------------------------------------
  //  📡 Radioens status fra serveren
  // ---------------------------------------------------------------
  let st = null;             // sidste status fra serveren
  let stModtaget = 0;        // Date.now(), da den kom
  let rvFejl = "";
  let rvLytter = false;      // lytter jeg med lige nu?
  let rvVol = 0.8;
  try { const v = parseFloat(localStorage.getItem(RV_VOL_NOEGLE)); if (v >= 0 && v <= 1) rvVol = v; } catch (e) {}
  let rvBeskeder = [];       // beskeder fra lytterne (kun værter)
  let rvSidsteBesked = 0;
  let rvFoersteHent = true;
  let rvUlaest = 0;
  let rvHenter = false;
  let rvGenbrug = null;      // genudsendelse, der afspilles (gemt udsendelse)

  function pos() {
    if (!st || !st.spor) return 0;
    if (st.pauset) return st.pos || 0;
    return (st.pos || 0) + (Date.now() - stModtaget) / 1000;
  }
  function erLive() { return !!(st && st.live); }

  function hent() {
    if (!online()) return Promise.resolve();
    if (rvHenter) return Promise.resolve();
    rvHenter = true;
    return kald("hv_radio_status", { p_token: token(), p_lytter: rvLytter && !document.hidden, p_besked_efter: rvSidsteBesked })
      .then(function (s) { modtag(s); rvFejl = ""; })
      .catch(function (e) { rvFejl = fejlTekst(e); })
      .then(function () { rvHenter = false; opdaterAlt(); });
  }
  function modtag(s) {
    if (!s) return;
    const gammelLive = erLive();
    st = s;
    stModtaget = Date.now();
    if (Array.isArray(s.beskeder) && s.beskeder.length) {
      s.beskeder.forEach(function (b) {
        if (b.id <= rvSidsteBesked) return;
        rvSidsteBesked = Math.max(rvSidsteBesked, b.id);
        if (rvBeskeder.some(function (x) { return x.id === b.id; })) return;
        rvBeskeder.push(b);
        if (!rvFoersteHent && maaStyre()) {
          rvUlaest++;
          if (typeof window.tlfNotis === "function") window.tlfNotis("radio", "📻 " + b.fra + " skriver", b.tekst);
          if (!panelAabent()) toast("📻 " + b.fra + " skrev til radioen: " + b.tekst);
        }
      });
      rvBeskeder = rvBeskeder.slice(-150);
    }
    if (!s.live && gammelLive) { rvBeskeder = []; rvUlaest = 0; }
    if (s.live && !gammelLive && !rvFoersteHent && !maaStyre()) toast("📻 Vera-radio er LIVE nu: " + (s.titel || "") + ". Tryk ▶ på 📻-knappen for at lytte!");
    rvFoersteHent = false;
    spil();
  }
  function hyppig() {
    return rvLytter || panelAabent() || (typeof window.tlfAppAaben === "function" && window.tlfAppAaben("radio"));
  }
  (function loop() {
    hent();
    setTimeout(loop, document.hidden && !rvLytter ? 30000 : hyppig() ? 3000 : (maaStyre() ? 6000 : 15000));
  })();
  function styr(handling, data) {
    return kald("hv_radio_styr", { p_token: token(), p_handling: handling, p_data: data || {} })
      .then(function (s) { modtag(s); opdaterAlt(); return s; })
      .catch(function (e) { toast(fejlTekst(e)); visFejl(fejlTekst(e)); throw e; });
  }


  // ---------------------------------------------------------------
  //  🔊 Afspilleren (det samme sted i sangen hos alle)
  // ---------------------------------------------------------------
  const lyd = new Audio();
  lyd.preload = "auto";
  lyd.volume = rvVol;
  let lydNoegle = null;      // hvad spiller lyden lige nu
  let lydFejl = "";
  let taleNoegle = null;
  const klipCache = {};

  function sporId(s) { return s ? [s.type, s.id || "", s.url || "", s.tekst || "", s.titel || ""].join("|") : ""; }
  function startTid() { return st ? stModtaget - (st.pos || 0) * 1000 : 0; }
  let sidsteStart = 0, sidsteId = "";
  function noegleNu() {
    if (!st || !st.spor) return null;
    const id = sporId(st.spor), t = startTid();
    if (id === sidsteId && Math.abs(t - sidsteStart) < 4000 && !st.pauset) return id + "@" + sidsteStart;
    if (!st.pauset) { sidsteId = id; sidsteStart = t; }
    return id + "@" + sidsteStart;
  }
  function stopLyd() {
    try { lyd.pause(); } catch (e) {}
    lydNoegle = null;
    stopTale();
    ytStop();
  }
  function stopTale() {
    taleNoegle = null;
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  }
  function siOp(tekst) {
    if (!window.speechSynthesis || !tekst) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tekst);
      u.lang = "da-DK";
      const dansk = speechSynthesis.getVoices().find(function (v) { return /^da/i.test(v.lang); });
      if (dansk) u.voice = dansk;
      u.volume = rvVol;
      u.rate = 1;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function hentKlip(id) {
    if (klipCache[id]) return Promise.resolve(klipCache[id]);
    return kald("hv_radio_klip_hent", { p_id: id }).then(function (d) { if (d) klipCache[id] = d; return d; });
  }
  function kilde(s) {
    if (s.type === "klip") return hentKlip(s.id);
    return Promise.resolve(s.url);
  }
  function saetLyd(url, fra, noegle) {
    lydFejl = "";
    lydNoegle = noegle;
    lyd.src = url;
    lyd.volume = rvVol * duk();
    const start = function () {
      if (lydNoegle !== noegle) return;
      try { if (fra > 0 && isFinite(lyd.duration)) lyd.currentTime = Math.min(fra, Math.max(0, lyd.duration - 0.3)); } catch (e) {}
      const p = lyd.play();
      if (p && p.catch) p.catch(function (e) { if (lydNoegle === noegle) { lydFejl = /NotAllowed/i.test(e.name) ? "Tryk ▶ for at lytte" : "Kan ikke afspille lyden"; opdaterAlt(); } });
    };
    if (lyd.readyState >= 1) start(); else lyd.addEventListener("loadedmetadata", start, { once: true });
  }
  lyd.addEventListener("error", function () { if (lydNoegle) { lydFejl = "Lydfilen kunne ikke afspilles"; opdaterAlt(); } });

  // ---------------------------------------------------------------
  //  ▶️ YouTube som musik (ligesom i biografen). Afspilleren er skjult.
  // ---------------------------------------------------------------
  function ytIdFra(link) {
    const t = String(link || "").trim();
    if (!t) return null;
    if (typeof youtubeId === "function") { try { const id = youtubeId(t); if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return id; } catch (e) {} }
    const m = t.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function ytFejlTekst(kode) {
    if (location.protocol === "file:") return "YouTube virker kun, når hotellet er åbnet på nettet (github.io)";
    if (kode === 101 || kode === 150) return "Den YouTube-video må ikke afspilles uden for YouTube. Vælg en anden";
    if (kode === 100) return "YouTube-videoen findes ikke";
    return "YouTube-videoen kunne ikke afspilles";
  }
  let ytApiLoefte = null;
  function ytApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytApiLoefte) return ytApiLoefte;
    ytApiLoefte = new Promise(function (ok, nej) {
      const foer = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (typeof foer === "function") { try { foer(); } catch (e) {} } ok(window.YT); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = function () { ytApiLoefte = null; nej(new Error("YouTube kunne ikke hentes. Er der internet?")); };
      document.head.appendChild(s);
      setTimeout(function () { if (!(window.YT && window.YT.Player)) { ytApiLoefte = null; nej(new Error("YouTube svarer ikke. Prøv igen.")); } }, 20000);
    });
    return ytApiLoefte;
  }
  function ytIndstillinger() {
    const v = { controls: 0, playsinline: 1, rel: 0, disablekb: 1 };
    if (location.origin && location.origin !== "null") v.origin = location.origin;
    return v;
  }
  const ytBoks = document.createElement("div");
  ytBoks.id = "rv-yt";
  ytBoks.setAttribute("aria-hidden", "true");
  ytBoks.innerHTML = "<div id='rv-yt-afspiller'></div>";
  document.body.appendChild(ytBoks);
  let ytP = null, ytLoefte = null, ytNoegle = null, ytSidstStart = 0;
  function ytSpiller() {
    if (ytLoefte) return ytLoefte;
    ytLoefte = ytApi().then(function (YT) {
      return new Promise(function (ok) {
        const p = new YT.Player("rv-yt-afspiller", {
          width: 200, height: 120, host: "https://www.youtube-nocookie.com", playerVars: ytIndstillinger(),
          events: {
            onReady: function () { ytP = p; ok(p); },
            onError: function (e) { if (ytNoegle) { lydFejl = ytFejlTekst(e.data); opdaterAlt(); } }
          }
        });
      });
    });
    ytLoefte.catch(function () { ytLoefte = null; });
    return ytLoefte;
  }
  function ytStart(id, fra, noegle) {
    ytNoegle = noegle;
    lydFejl = location.protocol === "file:" ? ytFejlTekst() : "";
    ytSidstStart = Date.now();
    ytSpiller().then(function (p) {
      if (ytNoegle !== noegle) return;
      const f = typeof fra === "function" ? fra() : fra;
      p.loadVideoById({ videoId: id, startSeconds: Math.max(0, f || 0) });
      try { p.unMute(); p.setVolume(lydstyrke()); } catch (e) {}
    }).catch(function (e) { if (ytNoegle === noegle) { lydFejl = (e && e.message) || ytFejlTekst(); opdaterAlt(); } });
  }
  function ytStop() {
    if (ytNoegle === null) return;
    ytNoegle = null;
    try { if (ytP) ytP.stopVideo(); } catch (e) {}
  }
  function ytPause(til) { try { if (ytP) { if (til) ytP.pauseVideo(); else ytP.playVideo(); } } catch (e) {} }
  // hold YouTube det samme sted som hos de andre lyttere
  function ytHold(p) {
    if (!ytP || !ytNoegle) return;
    try {
      const tilstand = ytP.getPlayerState();
      if (tilstand === 1 && Math.abs(ytP.getCurrentTime() - p) > 4) ytP.seekTo(p, true);
      else if ((tilstand === 2 || tilstand === 5 || tilstand === -1) && Date.now() - ytSidstStart > 2500) ytP.playVideo();
      if (tilstand !== 1 && tilstand !== 3 && Date.now() - ytSidstStart > 8000 && !lydFejl) { lydFejl = "Tryk ▶ for at lytte"; opdaterAlt(); }
      if (tilstand === 1 && lydFejl === "Tryk ▶ for at lytte") { lydFejl = ""; opdaterAlt(); }
      ytP.setVolume(lydstyrke());
    } catch (e) {}
  }
  // Hvor lang er videoen, og hvad hedder den? (en skjult afspiller kigger kort på den)
  const ytMaalCache = {};
  function maalYt(id) {
    if (ytMaalCache[id]) return Promise.resolve(ytMaalCache[id]);
    if (location.protocol === "file:") return Promise.reject(new Error("YouTube virker kun, når hotellet er åbnet på nettet (github.io)."));
    return ytApi().then(function (YT) {
      return new Promise(function (ok, nej) {
        const holder = document.createElement("div"), div = document.createElement("div");
        holder.className = "rv-yt-maal"; holder.appendChild(div); document.body.appendChild(holder);
        let faerdig = false, p = null, forsoeg = 0;
        const slut = function (fejl, svar) {
          if (faerdig) return;
          faerdig = true; clearTimeout(timer);
          setTimeout(function () { try { if (p) p.destroy(); } catch (e) {} holder.remove(); }, 0);
          if (fejl) nej(fejl); else { ytMaalCache[id] = svar; ok(svar); }
        };
        const timer = setTimeout(function () { slut(new Error("YouTube svarer ikke. Prøv igen.")); }, 15000);
        p = new YT.Player(div, {
          width: 200, height: 120, videoId: id, host: "https://www.youtube-nocookie.com", playerVars: ytIndstillinger(),
          events: {
            onReady: function () {
              const tjek = function () {
                if (faerdig) return;
                let sek = 0, titel = "";
                try { sek = p.getDuration() || 0; titel = (p.getVideoData() || {}).title || ""; } catch (e) {}
                if (sek > 0) return slut(null, { sek: sek, titel: titel });
                if (++forsoeg === 3) { try { p.mute(); p.playVideo(); } catch (e) {} }
                if (forsoeg > 20) return slut(null, { sek: 0, titel: titel });
                setTimeout(tjek, 400);
              };
              tjek();
            },
            onError: function (e) { slut(new Error(ytFejlTekst(e.data) + ".")); }
          }
        });
      });
    });
  }
  function ytSpor(link, titel, kunstner) {
    const id = ytIdFra(link);
    if (!id) return Promise.reject(new Error("Det ligner ikke et YouTube-link. Kopiér linket fra YouTube igen."));
    return maalYt(id).then(function (m) {
      const sp = { type: "youtube", yt: id, titel: String(titel || m.titel || "YouTube").slice(0, 120), sek: Math.round(m.sek * 10) / 10 };
      if (kunstner) sp.kunstner = kunstner;
      return sp;
    });
  }

  function spil() {
    if (rvGenbrug) return;                       // en gemt udsendelse spiller
    if (!rvLytter || !st || !st.spor || st.pauset) { stopLyd(); return; }
    const s = st.spor, noegle = noegleNu(), p = pos();
    if (s.type === "youtube") {
      try { lyd.pause(); } catch (e) {}
      lydNoegle = null;
      stopTale();
      if (ytNoegle !== noegle) ytStart(s.yt, function () { return pos(); }, noegle);
      else ytHold(pos());
      return;
    }
    ytStop();
    if (s.type === "tale") {
      try { lyd.pause(); } catch (e) {}
      lydNoegle = null;
      if (taleNoegle !== noegle) {
        taleNoegle = noegle;
        if (p < (s.sek || 3) - 0.5) siOp(s.tekst || s.titel);
      }
      return;
    }
    stopTale();
    if (lydNoegle !== noegle) {
      kilde(s).then(function (url) {
        if (!url) { lydFejl = "Lyden findes ikke længere"; opdaterAlt(); return; }
        if (noegleNu() !== noegle || !rvLytter || rvGenbrug) return;
        saetLyd(url, s.sek > 0 ? pos() : 0, noegle);
      }).catch(function () { lydFejl = "Kunne ikke hente lyden"; opdaterAlt(); });
      return;
    }
    // er vi kommet for langt fra de andre? så hop
    if (s.sek > 0 && !lyd.paused && isFinite(lyd.duration) && Math.abs(lyd.currentTime - p) > 3 && p < lyd.duration) {
      try { lyd.currentTime = p; } catch (e) {}
    }
    if (lyd.paused && lyd.readyState >= 2 && !lydFejl) { const pr = lyd.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }
  setInterval(function () {
    if (rvLytter && !rvGenbrug) spil();
    lytMikTjek();
    const v = rvVol * duk();
    if (Math.abs(lyd.volume - v) > 0.01) lyd.volume = v;
    if (Math.abs(mikLyd.volume - rvVol) > 0.01) mikLyd.volume = rvVol;
    opdaterTider();
  }, 1000);

  function lyt(til) {
    if (til && rvGenbrug) stopGenbrug();
    rvLytter = !!til;
    if (!rvLytter) stopLyd();
    // en tom tale-besked "låser lyden op" i browseren, mens man stadig har trykket
    if (rvLytter) { try { lyd.play().catch(function () {}); lyd.pause(); } catch (e) {} lydNoegle = null; spil(); }
    hent();
    opdaterAlt();
  }
  function saetVol(v) {
    rvVol = Math.max(0, Math.min(1, v));
    lyd.volume = rvVol * duk();
    mikLyd.volume = rvVol;
    try { if (ytP && ytNoegle) ytP.setVolume(lydstyrke()); } catch (e) {}
    try { localStorage.setItem(RV_VOL_NOEGLE, String(rvVol)); } catch (e) {}
  }


  // ---------------------------------------------------------------
  //  📼 Gemte udsendelser: afspil dem igen bid for bid
  // ---------------------------------------------------------------
  let rvUdsendelser = null;
  function hentUdsendelser() {
    if (!online()) return Promise.resolve([]);
    return kald("hv_radio_udsendelser_hent", {}).then(function (l) { rvUdsendelser = Array.isArray(l) ? l : []; opdaterAlt(); return rvUdsendelser; })
      .catch(function (e) { rvUdsendelser = []; rvFejl = fejlTekst(e); opdaterAlt(); return []; });
  }
  function bidder(u) {
    const mus = [], log = (Array.isArray(u.log) ? u.log : []).slice().sort(function (a, b) { return (+a.t || 0) - (+b.t || 0); });
    let aaben = null;
    const total = u.slut && u.start ? (u.slut - u.start) / 1000 : null;
    function luk(t) {
      if (!aaben) return;
      let laengde = t - aaben.t;
      if (aaben.spor.sek > 0) laengde = Math.min(laengde, aaben.spor.sek - aaben.fra);
      if (laengde > 0.5) mus.push({ spor: aaben.spor, fra: aaben.fra, a: aaben.t, laengde: laengde });
      aaben = null;
    }
    log.forEach(function (e) {
      if (e.spor) { luk(+e.t || 0); aaben = { spor: e.spor, fra: +e.fra || 0, t: +e.t || 0 }; }
      else if (e.pause) luk(+e.t || 0);
    });
    if (aaben) luk(total != null ? total : aaben.t + Math.max(1, (aaben.spor.sek || 30) - aaben.fra));
    // mikrofon-snakken: musikken, der spillede imens, springes over
    const mik = log.filter(function (e) { return e.mik && +e.sek > 0.3; }).map(function (e) {
      return { a: +e.t || 0, b: (+e.t || 0) + (+e.sek), fra: 0, laengde: +e.sek,
        spor: { type: "klip", id: e.mik, titel: "Live-snak" + (e.af ? " med " + e.af : ""), sek: +e.sek } };
    });
    const ud = [];
    mus.filter(function (b) { return b.spor.type !== "link"; }).forEach(function (b) {
      let stykker = [{ a: b.a, b: b.a + b.laengde }];
      mik.forEach(function (m) {
        const nye = [];
        stykker.forEach(function (s) {
          if (m.b <= s.a || m.a >= s.b) { nye.push(s); return; }
          if (m.a > s.a) nye.push({ a: s.a, b: m.a });
          if (m.b < s.b) nye.push({ a: m.b, b: s.b });
        });
        stykker = nye;
      });
      stykker.forEach(function (s) { if (s.b - s.a > 0.5) ud.push({ spor: b.spor, fra: b.fra + (s.a - b.a), laengde: s.b - s.a, a: s.a }); });
    });
    mik.forEach(function (m) { ud.push(m); });
    ud.sort(function (x, y) { return x.a - y.a; });
    return ud;
  }
  function startGenbrug(id) {
    kald("hv_radio_udsendelse_hent", { p_id: id }).then(function (u) {
      if (!u) { toast("Udsendelsen findes ikke længere."); return; }
      const b = bidder(u);
      if (!b.length) { toast("Der er ikke noget at afspille i den udsendelse."); return; }
      rvLytter = false;
      stopLyd();
      rvGenbrug = { u: u, bidder: b, i: 0, pauset: false, t0: 0, brugt: 0 };
      spilBid();
      opdaterAlt();
    }).catch(function (e) { toast(fejlTekst(e)); });
  }
  let bidTimer = null;
  function spilBid() {
    const g = rvGenbrug;
    if (!g) return;
    clearTimeout(bidTimer);
    stopTale();
    try { lyd.pause(); } catch (e) {}
    if (g.i >= g.bidder.length) { toast("📼 Udsendelsen er slut."); stopGenbrug(); return; }
    const b = g.bidder[g.i];
    g.t0 = Date.now(); g.brugt = 0; g.pauset = false;
    const videre = function (ms) { bidTimer = setTimeout(function () { if (rvGenbrug === g && !g.pauset) { g.i++; spilBid(); } }, ms); };
    if (b.spor.type === "youtube") { ytStart(b.spor.yt, b.fra, "genbrug@" + g.i + "@" + Date.now()); videre(b.laengde * 1000); opdaterAlt(); return; }
    ytStop();
    if (b.spor.type === "tale") { siOp(b.spor.tekst || b.spor.titel); videre(b.laengde * 1000); opdaterAlt(); return; }
    const noegle = "genbrug@" + g.i + "@" + Date.now();
    kilde(b.spor).then(function (url) {
      if (rvGenbrug !== g) return;
      if (!url) { g.i++; spilBid(); return; }
      saetLyd(url, b.fra, noegle);
      videre(b.laengde * 1000);
    }).catch(function () { if (rvGenbrug === g) { g.i++; spilBid(); } });
    opdaterAlt();
  }
  function genbrugPause() {
    const g = rvGenbrug; if (!g) return;
    if (!g.pauset) {
      g.pauset = true; g.brugt += (Date.now() - g.t0) / 1000; clearTimeout(bidTimer);
      try { lyd.pause(); } catch (e) {} try { if (window.speechSynthesis) speechSynthesis.pause(); } catch (e) {}
      ytPause(true);
    } else {
      g.pauset = false; g.t0 = Date.now();
      const b = g.bidder[g.i], rest = Math.max(0.2, b.laengde - g.brugt);
      if (b.spor.type === "tale") { try { speechSynthesis.resume(); } catch (e) {} }
      else if (b.spor.type === "youtube") ytPause(false);
      else { const p = lyd.play(); if (p && p.catch) p.catch(function () {}); }
      bidTimer = setTimeout(function () { if (rvGenbrug === g && !g.pauset) { g.i++; spilBid(); } }, rest * 1000);
    }
    opdaterAlt();
  }
  function genbrugSpring(ret) {
    const g = rvGenbrug; if (!g) return;
    g.i = Math.max(0, Math.min(g.bidder.length, g.i + ret));
    spilBid();
  }
  function stopGenbrug() {
    clearTimeout(bidTimer);
    rvGenbrug = null;
    stopLyd();
    opdaterAlt();
  }


  // ---------------------------------------------------------------
  //  🎙 Snak live med mikrofonen direkte i Radio-panelet
  //  Lyden går direkte fra værtens browser til hver lytter (WebRTC).
  //  Serveren bruges kun til at præsentere dem for hinanden (signaler).
  // ---------------------------------------------------------------
  const RV_ICE = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }] };
  let mikStroem = null;        // værtens mikrofon
  let mikTil = false;          // værten: er min mikrofon tændt?
  let mikTaender = false;
  let mikFejl = "";
  let mikDempet = false;       // værten: lyden slået fra et øjeblik
  const mikPeers = {};         // værten: én forbindelse pr. lytter
  let peerN = 0;
  let mikSignalEfter = 0;
  let mikOptager = null;       // optagelsen til den gemte udsendelse
  let mikAnalyse = null;
  // lytteren
  const mikLyd = new Audio();
  mikLyd.autoplay = true;
  let lytPc = null, lytMikId = null, lytVilSendt = 0, lytForsoeg = 0, lytStatus = "";   // "" | forbinder | hoerer | fejl
  function mikHoeres() { return lytStatus === "hoerer" && !!lytPc; }
  function duk() { return mikHoeres() ? 0.3 : 1; }          // musikken skrues ned, mens værten snakker
  function lydstyrke() { return Math.round(rvVol * duk() * 100); }
  function kanWebRTC() { return typeof RTCPeerConnection !== "undefined"; }

  function signal(til, slags, data) {
    return kald("hv_radio_signal_send", { p_token: token(), p_til: til, p_slags: slags, p_data: data ? JSON.stringify(data) : "" });
  }
  function hentSignaler() {
    return kald("hv_radio_signal_hent", { p_token: token(), p_efter: mikSignalEfter }).then(function (l) {
      (Array.isArray(l) ? l : []).forEach(function (s) {
        mikSignalEfter = Math.max(mikSignalEfter, s.id);
        let d = null;
        try { d = s.data ? JSON.parse(s.data) : null; } catch (e) {}
        if (mikTil) vaertSignal(s, d); else lytSignal(s, d);
      });
    }).catch(function () {});
  }
  function samlIce(pc) {       // vent, til forbindelsen har fundet sine veje (højst 3 sek)
    return new Promise(function (ok) {
      if (pc.iceGatheringState === "complete") return ok();
      const timer = setTimeout(ok, 3000);
      pc.addEventListener("icegatheringstatechange", function () { if (pc.iceGatheringState === "complete") { clearTimeout(timer); ok(); } });
    });
  }
  (function signalLoop() {
    const m = st && st.live ? st.mik : null;
    const aktiv = online() && token() && (mikTil || (rvLytter && !rvGenbrug && m && m.navn !== mig() && lytStatus !== "hoerer" && kanWebRTC()));
    (aktiv ? hentSignaler() : Promise.resolve()).then(function () { setTimeout(signalLoop, mikTil ? 1200 : 1500); });
  })();

  // ----- værten -----
  function vaertSignal(s, d) {
    if (s.slags === "vil") vaertTilbud(s.fra, s.fra_navn);
    else if (s.slags === "svar") {
      const p = mikPeers[s.fra];
      if (p && d && d.sdp && d.n === p.n) p.pc.setRemoteDescription(d.sdp).catch(function () { lukPeer(s.fra); });
    } else if (s.slags === "farvel") lukPeer(s.fra);
  }
  function vaertTilbud(hvem, navn) {
    if (!mikStroem || !mikTil) return;
    lukPeer(hvem);
    const pc = new RTCPeerConnection(RV_ICE), n = ++peerN;
    mikPeers[hvem] = { pc: pc, n: n, navn: navn || hvem };
    mikStroem.getAudioTracks().forEach(function (tr) { pc.addTrack(tr, mikStroem); });
    pc.addEventListener("connectionstatechange", function () {
      if ((pc.connectionState === "failed" || pc.connectionState === "closed") && mikPeers[hvem] && mikPeers[hvem].pc === pc) delete mikPeers[hvem];
      opdaterAlt();
    });
    pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { return samlIce(pc); })
      .then(function () { if (mikPeers[hvem] && mikPeers[hvem].pc === pc) return signal(hvem, "tilbud", { sdp: pc.localDescription, n: n }); })
      .catch(function () { lukPeer(hvem); });
  }
  function lukPeer(hvem) {
    const p = mikPeers[hvem];
    if (!p) return;
    delete mikPeers[hvem];
    try { p.pc.close(); } catch (e) {}
  }
  function forbundne() { return Object.keys(mikPeers).filter(function (k) { return mikPeers[k].pc.connectionState === "connected"; }); }

  function mikTaend() {
    if (mikTil || mikTaender) return;
    mikFejl = "";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !kanWebRTC()) {
      mikFejl = "Din browser kan ikke sende mikrofonen. Brug Chrome, Edge eller Firefox, og åbn hotellet på nettet (github.io).";
      opdaterAlt(); return;
    }
    mikTaender = true;
    opdaterAlt();
    const gaaLive = erLive() ? Promise.resolve() : styr("start_live", { titel: "Vera-radio live", vaerter: mig() });
    gaaLive.then(function () {
      return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    }).then(function (s) {
      mikStroem = s;
      return kald("hv_radio_mik", { p_token: token(), p_til: true });
    }).then(function () {
      mikTil = true; mikTaender = false; mikDempet = false;
      startMikOptag();
      startNiveau();
      toast("🎙 Mikrofonen er tændt. Alle der lytter, kan høre dig nu!");
      return hent();
    }).catch(function (e) {
      mikTaender = false;
      if (mikStroem) { mikStroem.getTracks().forEach(function (tr) { tr.stop(); }); mikStroem = null; }
      mikFejl = e && e.name === "NotAllowedError" ? "Du skal give lov til at bruge mikrofonen. Tryk Tillad i browseren (eller på 🔒 ved adressen)." :
        e && e.name === "NotFoundError" ? "Der er ingen mikrofon på computeren." : fejlTekst(e);
      opdaterAlt();
    });
  }
  function mikSluk(stille) {
    if (!mikTil && !mikStroem) return Promise.resolve();
    mikTil = false;
    Object.keys(mikPeers).forEach(lukPeer);
    stopNiveau();
    const gemt = stopMikOptag();
    if (mikStroem) { mikStroem.getTracks().forEach(function (tr) { tr.stop(); }); mikStroem = null; }
    opdaterAlt();
    return Promise.all([gemt, kald("hv_radio_mik", { p_token: token(), p_til: false }).catch(function () {})])
      .then(function () { if (!stille) toast("🎙 Mikrofonen er slukket"); return hent(); });
  }
  function mikDaemp(til) {
    mikDempet = !!til;
    if (mikStroem) mikStroem.getAudioTracks().forEach(function (tr) { tr.enabled = !mikDempet; });
    opdaterAlt();
  }
  // hvert 10. sek: "jeg snakker stadig" (ellers slukker serveren selv mikrofonen efter 30 sek)
  setInterval(function () {
    if (!mikTil) return;
    if (st && !st.live) { mikSluk(true); return; }
    kald("hv_radio_mik", { p_token: token(), p_til: true }).catch(function (e) { mikFejl = fejlTekst(e); mikSluk(true); });
  }, 10000);

  // optag snakken i bidder af 1 minut, så udsendelsen kan høres igen bagefter
  function startMikOptag() {
    const udsendelse = st && st.udsendelse;
    if (!mikStroem || typeof MediaRecorder === "undefined" || !udsendelse) return;
    const typer = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"];
    const type = typer.find(function (x) { try { return MediaRecorder.isTypeSupported(x); } catch (e) { return false; } }) || "";
    let rec;
    try { rec = new MediaRecorder(mikStroem, type ? { mimeType: type, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 }); } catch (e) { return; }
    const bidder = [], start = Date.now();
    rec.ondataavailable = function (e) { if (e.data && e.data.size) bidder.push(e.data); };
    const faerdig = new Promise(function (ok) {
      rec.onstop = function () {
        const sek = (Date.now() - start) / 1000;
        if (sek < 1 || !bidder.length) return ok();
        const fr = new FileReader();
        fr.onload = function () {
          const data = String(fr.result).replace(/^data:([^;,]+)(;codecs=[^;,]+)?/, "data:$1");
          kald("hv_radio_mik_gem", { p_token: token(), p_udsendelse: udsendelse, p_data: data, p_sek: Math.round(sek * 10) / 10, p_start: start })
            .then(function (id) { if (id) klipCache[id] = data; }).catch(function () {}).then(ok);
        };
        fr.onerror = function () { ok(); };
        fr.readAsDataURL(new Blob(bidder, { type: rec.mimeType || type || "audio/webm" }));
      };
    });
    mikOptager = { rec: rec, faerdig: faerdig, start: start };
    rec.start(1000);
  }
  function stopMikOptag() {
    const o = mikOptager;
    mikOptager = null;
    if (!o) return Promise.resolve();
    try { if (o.rec.state !== "inactive") o.rec.stop(); } catch (e) {}
    return o.faerdig;
  }
  setInterval(function () { if (mikTil && mikOptager && Date.now() - mikOptager.start > 60000) { stopMikOptag(); startMikOptag(); } }, 2000);

  // lydmåler, så værten kan se, at mikrofonen virker
  function startNiveau() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !mikStroem) return;
      const ctx = new AC(), an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(mikStroem).connect(an);
      const buf = new Uint8Array(an.fftSize);
      mikAnalyse = { ctx: ctx, timer: setInterval(function () {
        an.getByteTimeDomainData(buf);
        let m = 0;
        for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i] - 128));
        const niveau = mikDempet ? 0 : Math.min(1, m / 60);
        const b = document.querySelector("#rv-panel .rv-mik-niveau i");
        if (b) b.style.width = Math.round(niveau * 100) + "%";
      }, 120) };
    } catch (e) {}
  }
  function stopNiveau() {
    if (!mikAnalyse) return;
    clearInterval(mikAnalyse.timer);
    try { mikAnalyse.ctx.close(); } catch (e) {}
    mikAnalyse = null;
  }

  // ----- lytteren -----
  function lytMikTjek() {
    const m = st && st.live ? st.mik : null;
    const skal = rvLytter && !rvGenbrug && m && m.navn !== mig() && online() && token() && kanWebRTC();
    if (!skal) { if (lytPc || lytStatus) lytMikStop(true); return; }
    if (lytMikId !== m.id) { lytMikStop(false); lytMikId = m.id; lytForsoeg = 0; }
    if (lytStatus === "hoerer" || lytStatus === "fejl") return;
    if (Date.now() - lytVilSendt > (lytPc ? 12000 : 6000)) {      // spørg værten (igen)
      if (lytForsoeg >= 4) { lytStatus = "fejl"; opdaterAlt(); return; }
      lytForsoeg++;
      lytVilSendt = Date.now();
      lytStatus = "forbinder";
      if (lytPc) { try { lytPc.close(); } catch (e) {} lytPc = null; }
      signal(m.navn_lille, "vil", { mik: m.id }).catch(function () {});
      opdaterAlt();
    }
  }
  function lytSignal(s, d) {
    if (s.slags !== "tilbud" || !d || !d.sdp) return;
    const m = st && st.mik;
    if (!m || s.fra !== m.navn_lille || !rvLytter) return;
    if (lytPc) { try { lytPc.close(); } catch (e) {} }
    const pc = new RTCPeerConnection(RV_ICE);
    lytPc = pc;
    pc.addEventListener("track", function (e) {
      mikLyd.srcObject = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
      mikLyd.volume = rvVol;
      const pr = mikLyd.play();
      if (pr && pr.catch) pr.catch(function () { lydFejl = "Tryk ▶ for at høre værten"; opdaterAlt(); });
    });
    pc.addEventListener("connectionstatechange", function () {
      if (lytPc !== pc) return;
      if (pc.connectionState === "connected") { lytStatus = "hoerer"; lytForsoeg = 0; if (lydFejl === "Tryk ▶ for at høre værten") lydFejl = ""; }
      else if (pc.connectionState === "failed" || pc.connectionState === "closed") { lytStatus = "forbinder"; lytVilSendt = 0; }
      else if (pc.connectionState === "disconnected" && lytStatus === "hoerer") { lytStatus = "forbinder"; lytVilSendt = Date.now(); }
      opdaterAlt();
    });
    pc.setRemoteDescription(d.sdp).then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); })
      .then(function () { return samlIce(pc); })
      .then(function () { if (lytPc === pc) return signal(s.fra, "svar", { sdp: pc.localDescription, n: d.n }); })
      .catch(function () {});
  }
  function lytMikStop(farvel) {
    if (lytPc) {
      try { lytPc.close(); } catch (e) {}
      if (farvel && st && st.mik) signal(st.mik.navn_lille, "farvel").catch(function () {});
    }
    lytPc = null; lytStatus = ""; lytVilSendt = 0;
    try { mikLyd.pause(); mikLyd.srcObject = null; } catch (e) {}
  }
  function mikTekst() {
    const m = st && st.live ? st.mik : null;
    if (!m) return "";
    if (m.navn === mig()) return mikTil ? "🎙 Du snakker live" : "";
    return "🎙 " + m.navn + " snakker live" + (!rvLytter ? "" : lytStatus === "hoerer" ? " · du hører med" : lytStatus === "fejl" ? " · kan ikke høres herfra" : " · kobler på …");
  }


  // ---------------------------------------------------------------
  //  ✉️ Lytterne skriver til værterne
  // ---------------------------------------------------------------
  let mineBeskeder = [];
  function hentMine() {
    if (!online() || !token()) return;
    kald("hv_radio_mine_beskeder", { p_token: token() }).then(function (l) { mineBeskeder = Array.isArray(l) ? l : []; opdaterApp(); }).catch(function () {});
  }
  function sendTilRadio(tekst) {
    if (!token()) return Promise.reject(new Error("Du skal være logget ind for at skrive til radioen."));
    return kald("hv_radio_besked_send", { p_token: token(), p_tekst: tekst }).then(function () { hentMine(); });
  }


  // ---------------------------------------------------------------
  //  📻-knappen i hotellet: lyt med, pause/play, lydstyrke
  // ---------------------------------------------------------------
  const knap = document.createElement("div");
  knap.id = "radio-knap";
  knap.innerHTML =
    "<button type='button' class='rk-spil' title='Lyt til Vera-radio'>▶</button>" +
    "<button type='button' class='rk-tekst' title='Åbn Vera-radio på telefonen'><b>📻 Vera-radio</b><span class='rk-live' hidden>LIVE</span><small class='rk-nu'>Tryk ▶ for at lytte</small></button>" +
    "<label class='rk-vol' title='Lydstyrke'>🔊<input type='range' min='0' max='100' value='" + Math.round(rvVol * 100) + "'></label>";
  document.body.appendChild(knap);
  knap.querySelector(".rk-spil").addEventListener("click", function () {
    if (rvGenbrug) { genbrugPause(); return; }
    lyt(!rvLytter);
  });
  knap.querySelector(".rk-tekst").addEventListener("click", function () {
    if (typeof window.tlfAabnApp === "function") window.tlfAabnApp("radio");
    else lyt(!rvLytter);
  });
  knap.querySelector(".rk-vol input").addEventListener("input", function (e) { saetVol(e.target.value / 100); });

  function opdaterKnap() {
    const live = erLive();
    knap.classList.toggle("live", live);
    knap.classList.toggle("lytter", rvLytter || !!rvGenbrug);
    knap.querySelector(".rk-live").hidden = !live;
    const spilK = knap.querySelector(".rk-spil");
    const spiller = rvGenbrug ? !rvGenbrug.pauset : rvLytter;
    spilK.textContent = spiller ? "⏸" : "▶";
    spilK.title = spiller ? "Pause (kun hos dig)" : "Lyt med";
    let nu;
    if (rvGenbrug) {
      const b = rvGenbrug.bidder[rvGenbrug.i];
      nu = "📼 " + (rvGenbrug.u.titel || "Udsendelse") + (b ? " · " + sporNavn(b.spor) : "");
    } else if (rvFejl && !st) nu = maaStyre() ? "Mangler database-45-radio.sql" : "Radioen er ikke klar endnu";
    else if (!st || !st.spor) nu = live ? "🔴 " + (st.titel || "Live") + " · stille lige nu" : "Der spilles ikke noget lige nu";
    else if (st.pauset) nu = "⏸ På pause · " + sporNavn(st.spor);
    else nu = (live ? "🔴 " + (st.titel || "Live") + " · " : "") + sporNavn(st.spor);
    if (!rvGenbrug && mikTekst()) nu = mikTekst() + (st && st.spor && !st.pauset ? " · " + sporNavn(st.spor) : "");
    if (rvLytter && lydFejl) nu = "⚠️ " + lydFejl;
    const nuEl = knap.querySelector(".rk-nu");
    if (nuEl.textContent !== nu) nuEl.textContent = nu;
  }


  // ---------------------------------------------------------------
  //  📱 Appen "Vera-radio" (fast på telefonen) + fast kontakt
  // ---------------------------------------------------------------
  const RV_IKON = "<rect x='3.5' y='8' width='17' height='12' rx='2.5' fill='#fff'/><path d='M7 8 16.5 3.6' stroke='#fff' stroke-width='1.6' stroke-linecap='round'/>" +
    "<circle cx='9' cy='14' r='3.4' fill='#7a1f2e'/><circle cx='9' cy='14' r='1.3' fill='#f2c14e'/><rect x='14' y='11' width='4.5' height='1.4' rx='.7' fill='#7a1f2e'/>" +
    "<rect x='14' y='13.6' width='4.5' height='1.4' rx='.7' fill='#7a1f2e'/><rect x='14' y='16.2' width='4.5' height='1.4' rx='.7' fill='#7a1f2e'/>";
  let appFane = "live";      // live | gemte | program | skriv | studie
  let appApi = null;
  const APP = {
    navn: "Vera-radio", ikSvg: RV_IKON, bg: "linear-gradient(#c23a4c, #5e1622)", fast: true,
    tal: function () { return maaStyre() ? rvUlaest : 0; },
    tegn: function (el, api) { appApi = api; tegnApp(el, api); },
    luk: function () { appApi = null; },
  };
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () { window.tlfTilfoejApp("radio", APP); });
  window.tlfFasteKontakter = (window.tlfFasteKontakter || []).filter(function (k) { return k.id !== "radio"; });
  window.tlfFasteKontakter.unshift({ id: "radio", navn: "Vera-radio", nummer: RV_NUMMER, ikon: "📻", bg: "linear-gradient(#c23a4c, #5e1622)",
    tekst: function () { return erLive() ? "🔴 Live nu – skriv til værterne" : "Hotellets radio"; },
    aabn: function (skriv) { appFane = skriv || erLive() ? "skriv" : "live"; if (typeof window.tlfAabnApp === "function") window.tlfAabnApp("radio"); } });

  function tegnApp(el, api) {
    if (!el) return;
    const faner = [["live", "🔴 Live"], ["gemte", "📼 Gemte"], ["program", "🗓 Program"], ["skriv", "✉️ Skriv"]];
    if (maaStyre()) faner.push(["studie", "🎛 Studie"]);
    if (!faner.some(function (f) { return f[0] === appFane; })) appFane = "live";
    el.innerHTML = api.top("Vera-radio") +
      "<div class='tlf-indhold vr-app'><div class='vr-faner'>" + faner.map(function (f) {
        return "<button data-vr-fane='" + f[0] + "'" + (f[0] === appFane ? " class='valgt'" : "") + ">" + f[1] +
          (f[0] === "studie" && rvUlaest ? "<i>" + rvUlaest + "</i>" : "") + "</button>";
      }).join("") + "</div><div class='vr-krop'></div></div>";
    el.querySelectorAll("[data-vr-fane]").forEach(function (b) {
      b.addEventListener("click", function () { appFane = b.dataset.vrFane; tegnApp(el, api); });
    });
    const krop = el.querySelector(".vr-krop");
    if (appFane === "live") tegnAppLive(krop);
    else if (appFane === "gemte") { tegnAppGemte(krop); if (rvUdsendelser === null) hentUdsendelser(); }
    else if (appFane === "program") tegnAppProgram(krop);
    else if (appFane === "skriv") { tegnAppSkriv(krop); hentMine(); }
    else if (appFane === "studie") { rvUlaest = 0; tegnAppStudie(krop); }
    hent();
  }
  function appKrop() { const el = appApi && appApi.el(); return el ? el.querySelector(".vr-krop") : null; }

  function liveHtml() {
    const live = erLive();
    let h = "<div class='vr-skilt" + (live ? " live" : "") + "'><span class='vr-onair'>" + (live ? "● ON AIR" : "○ OFF AIR") + "</span>" +
      "<b>" + esc(live ? st.titel || "Vera-radio live" : "Vera-radio") + "</b>" +
      (live && st.emne ? "<small>Emne: " + esc(st.emne) + "</small>" : "") +
      (live && st.vaerter ? "<small>🎙 " + esc(st.vaerter) + "</small>" : "") +
      (mikTekst() ? "<small class='vr-mik'>" + esc(mikTekst()) + "</small>" : "") + "</div>";
    if (rvGenbrug) {
      const g = rvGenbrug, b = g.bidder[g.i];
      h += "<div class='vr-nu'><small>📼 Gemt udsendelse</small><b>" + esc(g.u.titel || "Udsendelse") + "</b><span>" + esc(b ? sporNavn(b.spor) : "") +
        " · " + (g.i + 1) + "/" + g.bidder.length + "</span></div>";
      return h;
    }
    h += "<div class='vr-nu'><small>Nu spiller</small><b class='vr-nu-titel'>" + esc(st && st.spor ? sporNavn(st.spor) : "Der spilles ikke noget lige nu") + "</b>" +
      "<div class='vr-bar'><i style='width:0%'></i></div><span class='vr-tid'></span></div>";
    return h;
  }
  function tegnAppLive(krop) {
    if (rvFejl && !st) { krop.innerHTML = "<p class='vr-info'>" + esc(maaStyre() ? rvFejl : "Radioen er ikke klar endnu. Prøv igen senere.") + "</p>"; return; }
    const spiller = rvGenbrug ? !rvGenbrug.pauset : rvLytter;
    krop.innerHTML = "<div class='vr-live-boks'>" + liveHtml() + "</div>" +
      "<div class='vr-knapper'>" + (rvGenbrug ? "<button data-vr='forrige' title='Forrige'>⏮</button>" : "") +
      "<button class='vr-stor' data-vr='spil'>" + (spiller ? "⏸" : "▶") + "</button>" +
      (rvGenbrug ? "<button data-vr='naeste' title='Næste'>⏭</button><button data-vr='stopgen' title='Stop og lyt live'>⏹</button>" : "") + "</div>" +
      "<p class='vr-lyttere'>👂 " + (st ? st.lyttere || 0 : 0) + " lytter med</p>" +
      "<label class='vr-vol'>🔈<input type='range' min='0' max='100' value='" + Math.round(rvVol * 100) + "'>🔊</label>" +
      (lydFejl && rvLytter ? "<p class='vr-fejl'>⚠️ " + esc(lydFejl) + "</p>" : "") +
      (erLive() ? "<button class='vr-knap-bred' data-vr='tilskriv'>✉️ Skriv til værterne</button>" : "") +
      "<p class='vr-info'>☎ Radioens nummer: <b>" + RV_NUMMER + "</b></p>";
    krop.querySelector("[data-vr='spil']").addEventListener("click", function () { if (rvGenbrug) genbrugPause(); else lyt(!rvLytter); tegnAppIgen(); });
    const fo = krop.querySelector("[data-vr='forrige']"); if (fo) fo.addEventListener("click", function () { genbrugSpring(-1); tegnAppIgen(); });
    const na = krop.querySelector("[data-vr='naeste']"); if (na) na.addEventListener("click", function () { genbrugSpring(1); tegnAppIgen(); });
    const sg = krop.querySelector("[data-vr='stopgen']"); if (sg) sg.addEventListener("click", function () { stopGenbrug(); lyt(true); tegnAppIgen(); });
    const ts = krop.querySelector("[data-vr='tilskriv']"); if (ts) ts.addEventListener("click", function () { appFane = "skriv"; tegnAppIgen(); });
    krop.querySelector(".vr-vol input").addEventListener("input", function (e) { saetVol(e.target.value / 100); const k = knap.querySelector(".rk-vol input"); if (k) k.value = e.target.value; });
    opdaterTider();
  }
  function tegnAppGemte(krop) {
    if (rvUdsendelser === null) { krop.innerHTML = "<p class='vr-info'>Henter …</p>"; return; }
    if (!rvUdsendelser.length) { krop.innerHTML = "<p class='vr-info'>📼 Der er ingen gemte udsendelser endnu.<br>Når værterne har været live, kan du høre det igen her.</p>"; return; }
    krop.innerHTML = "<ul class='vr-liste'>" + rvUdsendelser.map(function (u) {
      const i = rvGenbrug && rvGenbrug.u.id === u.id;
      return "<li><span class='vr-li-tekst'><b>" + esc(u.titel || "Udsendelse") + "</b><small>" + esc(dagTekst(u.start)) +
        (u.slut ? " · " + mmss((u.slut - u.start) / 1000) : "") + (u.vaerter ? " · 🎙 " + esc(u.vaerter) : "") + "</small>" +
        (u.emne ? "<small>" + esc(u.emne) + "</small>" : "") + "</span>" +
        "<button class='vr-lille' data-vr-hoer='" + u.id + "'>" + (i ? "⏹" : "▶") + "</button></li>";
    }).join("") + "</ul>";
    krop.querySelectorAll("[data-vr-hoer]").forEach(function (b) {
      b.addEventListener("click", function () {
        const id = +b.dataset.vrHoer;
        if (rvGenbrug && rvGenbrug.u.id === id) stopGenbrug(); else startGenbrug(id);
        setTimeout(tegnAppIgen, 400);
      });
    });
  }
  function tegnAppProgram(krop) {
    const l = st && Array.isArray(st.programmer) ? st.programmer : [];
    if (!l.length) { krop.innerHTML = "<p class='vr-info'>🗓 Der er ikke planlagt nogen programmer endnu.</p>"; return; }
    krop.innerHTML = "<ul class='vr-liste'>" + l.map(function (p) {
      const nu = p.start <= Date.now() && (!p.slut || p.slut > Date.now());
      return "<li><span class='vr-li-tekst'><b>" + (nu ? "🔴 " : "") + esc(p.titel) + "</b><small>" + esc(dagTekst(p.start)) + (p.slut ? "–" + kl(p.slut) : "") +
        (p.vaerter ? " · 🎙 " + esc(p.vaerter) : "") + "</small>" + (p.om ? "<small>" + esc(p.om) + "</small>" : "") +
        (p.emne && maaStyre() ? "<small class='vr-emne'>📝 Næste emne: " + esc(p.emne) + "</small>" : "") + "</span></li>";
    }).join("") + "</ul>";
  }
  function tegnAppSkriv(krop) {
    const live = erLive();
    krop.innerHTML = "<div class='vr-kontakt'><span>📻</span><b>Vera-radio</b><small>☎ " + RV_NUMMER + "</small></div>" +
      (live ? "<p class='vr-info'>🔴 Værterne er live nu! Skriv en hilsen, et ønske eller et spørgsmål.</p>" :
        "<p class='vr-info'>Du kan skrive til værterne, når radioen er live. Kig under 🗓 Program for at se, hvornår de er på.</p>") +
      "<ul class='vr-chat'>" + mineBeskeder.map(function (b) {
        return "<li><span>" + esc(b.tekst) + "</span><small>" + kl(b.tid) + "</small></li>";
      }).join("") + "</ul>" +
      "<form class='vr-skriv'><input maxlength='300' placeholder='" + (live ? "Skriv til værterne …" : "Radioen er ikke live") + "'" + (live ? "" : " disabled") + ">" +
      "<button" + (live ? "" : " disabled") + ">Send</button></form><p class='vr-fejl' hidden></p>";
    const form = krop.querySelector(".vr-skriv"), inp = form.querySelector("input"), fejl = krop.querySelector(".vr-fejl");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const t = inp.value.trim();
      if (!t) return;
      inp.disabled = true;
      sendTilRadio(t).then(function () { inp.value = ""; fejl.hidden = true; if (appApi) appApi.lille("📻 Sendt til værterne"); })
        .catch(function (er) { fejl.hidden = false; fejl.textContent = fejlTekst(er); })
        .then(function () { inp.disabled = !erLive(); inp.focus(); });
    });
    const ul = krop.querySelector(".vr-chat"); ul.scrollTop = ul.scrollHeight;
  }
  function tegnAppStudie(krop) {
    const live = erLive();
    krop.innerHTML = "<div class='vr-live-boks'>" + liveHtml() + "</div>" +
      "<div class='vr-knapper'><button data-vr-s='" + (st && st.pauset ? "fortsaet" : "pause") + "'>" + (st && st.pauset ? "▶" : "⏸") + "</button>" +
      "<button data-vr-s='naeste'>⏭</button></div>" +
      "<p class='vr-lyttere'>👂 " + (st ? st.lyttere || 0 : 0) + " lytter med" + (live ? "" : " · ikke live") + "</p>" +
      "<button class='vr-knap-bred' data-vr-panel>🎛 Åbn radiopanelet</button>" +
      "<button class='vr-knap-bred' data-vr-guide>📖 Guide til radioværter</button>" +
      "<h4>✉️ Beskeder fra lytterne</h4><ul class='vr-chat vr-ind'>" + (rvBeskeder.length ? rvBeskeder.slice().reverse().map(function (b) {
        return "<li><b>" + esc(b.fra) + "</b><span>" + esc(b.tekst) + "</span><small>" + kl(b.tid) + "</small></li>";
      }).join("") : "<li class='vr-tom'>" + (live ? "Ingen beskeder endnu." : "Beskederne kommer her, når I er live.") + "</li>") + "</ul>";
    krop.querySelectorAll("[data-vr-s]").forEach(function (b) { b.addEventListener("click", function () { styr(b.dataset.vrS).catch(function () {}); }); });
    krop.querySelector("[data-vr-panel]").addEventListener("click", function () { if (typeof window.lukTelefon === "function") window.lukTelefon(); aabnPanel(); });
    krop.querySelector("[data-vr-guide]").addEventListener("click", function () { if (typeof window.lukTelefon === "function") window.lukTelefon(); aabnPanel("guide"); });
    opdaterTider();
  }
  function tegnAppIgen() {
    const el = appApi && appApi.el();
    if (el && typeof window.tlfAppAaben === "function" && window.tlfAppAaben("radio")) tegnApp(el, appApi);
  }
  // Opdater det, der ændrer sig, uden at ødelægge det man skriver
  let appSidst = "";
  function opdaterApp() {
    if (!appApi || typeof window.tlfAppAaben !== "function" || !window.tlfAppAaben("radio")) return;
    const fp = [appFane, erLive(), st && sporId(st.spor), st && st.pauset, st && st.lyttere, rvLytter, !!rvGenbrug, rvGenbrug && rvGenbrug.i, rvGenbrug && rvGenbrug.pauset,
      rvBeskeder.length, mineBeskeder.length, rvUdsendelser && rvUdsendelser.length, lydFejl, st && JSON.stringify(st.programmer), rvFejl, mikTekst()].join("§");
    if (fp === appSidst) return;
    appSidst = fp;
    const krop = appKrop();
    if (!krop) return;
    const inp = krop.querySelector("input:not([type=range])");
    if (inp && document.activeElement === inp && appFane === "skriv") {
      const ul = krop.querySelector(".vr-chat");
      if (ul) ul.innerHTML = mineBeskeder.map(function (b) { return "<li><span>" + esc(b.tekst) + "</span><small>" + kl(b.tid) + "</small></li>"; }).join("");
      return;
    }
    tegnAppIgen();
  }


  // ---------------------------------------------------------------
  //  🛡 Ejerpanel → 📻 Radio (kun radioværter og ejeren)
  // ---------------------------------------------------------------
  let underFane = "studie";   // studie | musik | playlister | programmer | udsendelser | vagter | guide
  // Første gang en radiovært åbner panelet, vises guiden
  try { if (!localStorage.getItem("mit-hotel-radio-guide-set")) underFane = "guide"; } catch (e) {}
  let musik = null;           // fra serveren
  let playlister = null;
  let klipListe = null;
  let programmer = null;
  let valgtPlayliste = null;
  let musikSoeg = "";
  let maalPlayliste = "";
  let retProgram = null;
  let panelFejl = "";

  function panelAabent() {
    return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && typeof ejerFane !== "undefined" && ejerFane === "radio";
  }
  function aabnPanel(under) {
    if (!maaStyre() || typeof ejerVindue === "undefined") return;
    if (under) underFane = under;
    ejerVindue.hidden = false;
    ejerFane = "radio";
    visFane();
  }
  function visFejl(t) {
    panelFejl = t;
    const el = document.querySelector("#rv-panel .rv-fejl");
    if (el) { el.textContent = t; el.hidden = !t; }
  }

  vent(function () { return typeof visFane === "function" && typeof ejerIndhold !== "undefined" && document.getElementById("ejer-faner") && typeof rolleMaa === "function"; }, function () {
    const fane = document.createElement("button");
    fane.dataset.fane = "radio";
    fane.innerHTML = "📻 Radio";
    fane.addEventListener("click", function () { ejerFane = "radio"; visFane(); });
    const faner = document.getElementById("ejer-faner");
    const efter = faner.querySelector('[data-fane="loppe"]') || faner.querySelector('[data-fane="biograf"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
    function synlig() {
      fane.hidden = !(maaStyre() && rolleMaa("radio"));
      const tal = maaStyre() && rvUlaest ? "<span class='rv-tal'>" + rvUlaest + "</span>" : "";
      const ny = "📻 Radio" + tal;
      if (fane.innerHTML !== ny) fane.innerHTML = ny;
    }
    synlig();
    setInterval(synlig, 1000);

    const visFaneFoerRadio = visFane;
    visFane = function () {
      const min = ejerFane === "radio";
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerRadio();
      ejerIndhold.classList.toggle("rv-aaben", min && !ejerVindue.hidden);
      if (ejerVindue.hidden || !min || !maaStyre()) return;
      const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
      ejerIndhold.innerHTML = "";
      const sek = document.createElement("div");
      sek.id = "rv-panel";
      ejerIndhold.appendChild(sek);
      tegnPanel(sek);
      if (hjaelp) ejerIndhold.prepend(hjaelp);
      rvUlaest = 0;
      hent();
    };
  });

  function tegnPanel(sek) {
    const under = [["studie", "🎙 Studie"], ["musik", "🎵 Musik"], ["playlister", "📋 Playlister"], ["programmer", "🗓 Programmer"],
      ["udsendelser", "💾 Udsendelser"], ["vagter", "📅 Vagtskema"], ["guide", "📖 Guide"]];
    sek.innerHTML = "<div class='rv-top'><div class='rv-titel'><span class='rv-logo'>📻</span><div><b>Vera-radio</b><small>Hotellets radio · ☎ " + RV_NUMMER + "</small></div></div>" +
      "<div class='rv-status'></div></div>" +
      "<div class='rv-under'>" + under.map(function (u) { return "<button data-rv-under='" + u[0] + "'" + (u[0] === underFane ? " class='valgt'" : "") + ">" + u[1] + "</button>"; }).join("") + "</div>" +
      "<p class='rv-fejl'" + (panelFejl ? "" : " hidden") + ">" + esc(panelFejl) + "</p><div class='rv-krop'></div>";
    sek.querySelectorAll("[data-rv-under]").forEach(function (b) {
      b.addEventListener("click", function () { underFane = b.dataset.rvUnder; panelFejl = ""; tegnPanel(sek); });
    });
    const krop = sek.querySelector(".rv-krop");
    if (rvFejl && !st) krop.innerHTML = "<p class='rv-advarsel'>" + esc(rvFejl) + "</p>";
    if (underFane === "studie") tegnStudie(krop);
    else if (underFane === "musik") tegnMusik(krop);
    else if (underFane === "playlister") tegnPlaylister(krop);
    else if (underFane === "programmer") tegnProgrammer(krop);
    else if (underFane === "udsendelser") tegnUdsendelser(krop);
    else if (underFane === "vagter") tegnVagter(krop);
    else if (underFane === "guide") tegnGuide(krop);
    opdaterPanel();
  }
  function panelKrop() { return document.querySelector("#rv-panel .rv-krop"); }
  function tegnPanelIgen() { const s = document.getElementById("rv-panel"); if (s && panelAabent()) tegnPanel(s); }

  // ----- 🎙 Studie -----
  function tegnStudie(krop) {
    const div = document.createElement("div");
    div.className = "rv-studie";
    div.innerHTML =
      "<section class='rv-boks rv-live-boks'></section>" +
      "<section class='rv-boks rv-nu-boks'><h4>🎵 Nu spiller</h4><div class='rv-nu'></div>" +
      "<div class='rv-ctrl'><button data-rv-styr='pause' class='rv-pause'>⏸ Pause</button><button data-rv-styr='naeste'>⏭ Næste</button>" +
      "<button data-rv-styr='stop'>⏹ Stop</button><button data-rv-styr='gentag' class='rv-gentag'>🔁 Gentag playliste</button>" +
      "<button data-rv-lyt class='rv-lyt'>🎧 Lyt med</button></div>" +
      "<div class='rv-yt-hurtig'><input class='rv-yt-link' maxlength='4000' placeholder='▶️ Indsæt YouTube-links (gerne flere)'><button class='rv-yt-nu'>▶ Spil nu</button><button class='rv-yt-koe'>➕ Kø</button></div>" +
      "<p class='rv-lille-tekst rv-yt-vent' hidden></p>" +
      "<h4>⏭ Kø <small class='rv-koe-antal'></small> <button class='rv-lille' data-rv-styr='koe_ryd'>🗑 Ryd køen</button></h4><ol class='rv-koe'></ol></section>" +
      "<section class='rv-boks rv-snak'><h4>🎙 Snak i radioen</h4>" +
      "<div class='rv-snak-faner'><button data-rv-snak='mik' class='valgt'>🔴 Mikrofon live</button><button data-rv-snak='optag'>🎙 Optag klip</button><button data-rv-snak='oplaes'>🗣 Oplæs tekst</button><button data-rv-snak='link'>📡 Live-link</button></div>" +
      "<div class='rv-snak-krop'></div></section>" +
      "<section class='rv-boks rv-lyttere-boks'><h4>👂 Lyttere</h4><div class='rv-lyttere'></div></section>" +
      "<section class='rv-boks rv-besked-boks'><h4>✉️ Beskeder fra lytterne</h4><ul class='rv-beskeder'></ul></section>";
    krop.appendChild(div);
    div.querySelectorAll("[data-rv-styr]").forEach(function (b) {
      b.addEventListener("click", function () {
        let h = b.dataset.rvStyr;
        if (h === "pause" && st && st.pauset) h = "fortsaet";
        const gør = function () { styr(h, h === "gentag" ? { til: !(st && st.gentag) } : {}).catch(function () {}); };
        if (h === "koe_ryd" || h === "stop") toKlik(b, gør); else gør();
      });
    });
    div.querySelector("[data-rv-lyt]").addEventListener("click", function () { lyt(!rvLytter); });
    div.querySelectorAll("[data-rv-snak]").forEach(function (b) {
      b.addEventListener("click", function () {
        div.querySelectorAll("[data-rv-snak]").forEach(function (x) { x.classList.toggle("valgt", x === b); });
        tegnSnak(div.querySelector(".rv-snak-krop"), b.dataset.rvSnak);
      });
    });
    tegnSnak(div.querySelector(".rv-snak-krop"), "mik");
    // YouTube: indsæt så mange links man vil (et ad gangen eller flere på én gang); de lægges i kø i rækkefølge
    const ytKnap = function (b, hvordan) {
      b.addEventListener("click", function () {
        const felt = document.querySelector("#rv-panel .rv-yt-link");
        const links = String(felt ? felt.value : "").split(/[\s,]+/).filter(function (x) { return x; });
        if (!links.length) { visFejl("Indsæt et link fra YouTube først."); return; }
        felt.value = "";
        visFejl("");
        (hvordan === "spil" ? links.slice(0, 1) : links).forEach(function (link, i) {
          ytKoeVent++;
          visYtVent();
          ytKoeKaede = ytKoeKaede.then(function () {
            return ytSpor(link).then(function (sp) {
              return styr(hvordan === "spil" && i === 0 ? "spil" : "koe", { spor: sp }).then(function () {
                toast(hvordan === "spil" ? "▶️ " + sp.titel + " spiller nu" : "➕ " + sp.titel + " er sat i kø");
              });
            }).catch(function (e) { visFejl(link.slice(0, 60) + ": " + fejlTekst(e)); });
          }).then(function () { ytKoeVent--; visYtVent(); });
        });
      });
    };
    ytKnap(div.querySelector(".rv-yt-nu"), "spil");
    ytKnap(div.querySelector(".rv-yt-koe"), "koe");
    div.querySelector(".rv-yt-link").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); div.querySelector(".rv-yt-koe").click(); } });
    visYtVent();
    tegnLiveBoks();
  }
  let ytKoeKaede = Promise.resolve(), ytKoeVent = 0;
  function visYtVent() {
    const el = document.querySelector("#rv-panel .rv-yt-vent");
    if (el) { el.hidden = !ytKoeVent; el.textContent = "⏳ Henter " + ytKoeVent + " YouTube-" + (ytKoeVent === 1 ? "video" : "videoer") + " … du kan godt sætte flere ind imens."; }
  }
  let liveSidst = null;
  function tegnLiveBoks() {
    const boks = document.querySelector("#rv-panel .rv-live-boks");
    if (!boks) return;
    const live = erLive();
    liveSidst = live;
    if (live) {
      boks.className = "rv-boks rv-live-boks er-live";
      boks.innerHTML = "<div class='rv-onair'>● ON AIR</div><h3>" + esc(st.titel || "Vera-radio live") + "</h3>" +
        "<p>🎙 " + esc(st.vaerter || "") + "</p>" +
        "<label>Emne lige nu<input class='rv-emne-felt' maxlength='300' value='" + esc(st.emne || "") + "' placeholder='Hvad snakker I om?'></label>" +
        "<div class='rv-raekke'><button class='rv-gem-emne'>💾 Skift emne</button><button class='rv-slut'>⏹ Slut udsendelsen</button>" +
        "<label class='rv-flueben'><input type='checkbox' class='rv-slut-stop'> stop musikken også</label></div>" +
        "<p class='rv-lille-tekst'>Udsendelsen bliver optaget og gemt under 💾 Udsendelser, når I slutter.</p>";
      boks.querySelector(".rv-gem-emne").addEventListener("click", function () {
        styr("emne", { emne: boks.querySelector(".rv-emne-felt").value }).then(function () { toast("📻 Emnet er skiftet"); }).catch(function () {});
      });
      boks.querySelector(".rv-slut").addEventListener("click", function (e) {
        toKlik(e.currentTarget, function () { const stop = boks.querySelector(".rv-slut-stop").checked; mikSluk(true).then(function () { return styr("slut_live", { stop: stop }); }).then(function () { toast("⏹ Udsendelsen er slut og gemt"); hentUdsendelser(); }).catch(function () {}); });
      });
    } else {
      const progs = st && Array.isArray(st.programmer) ? st.programmer : [];
      boks.className = "rv-boks rv-live-boks";
      boks.innerHTML = "<div class='rv-onair slukket'>○ OFF AIR</div><h3>🔴 Start en live-udsendelse</h3>" +
        (progs.length ? "<label>Program<select class='rv-prog'><option value=''>Ingen (bare live)</option>" + progs.map(function (p) {
          return "<option value='" + p.id + "'>" + esc(p.titel) + " · " + esc(dagTekst(p.start)) + "</option>";
        }).join("") + "</select></label>" : "") +
        "<label>Titel<input class='rv-ny-titel' maxlength='120' placeholder='Fx Søndagsradio'></label>" +
        "<label>Emne<input class='rv-ny-emne' maxlength='300' placeholder='Hvad skal I snakke om?'></label>" +
        "<label>Værter<input class='rv-ny-vaerter' maxlength='200' value='" + esc(mig()) + "'></label>" +
        "<button class='rv-start'>🔴 Gå live</button>";
      const sel = boks.querySelector(".rv-prog");
      if (sel) sel.addEventListener("change", function () {
        const p = progs.find(function (x) { return String(x.id) === sel.value; });
        if (!p) return;
        boks.querySelector(".rv-ny-titel").value = p.titel || "";
        boks.querySelector(".rv-ny-emne").value = p.emne || "";
        if (p.vaerter) boks.querySelector(".rv-ny-vaerter").value = p.vaerter;
      });
      boks.querySelector(".rv-start").addEventListener("click", function () {
        styr("start_live", { titel: boks.querySelector(".rv-ny-titel").value, emne: boks.querySelector(".rv-ny-emne").value,
          vaerter: boks.querySelector(".rv-ny-vaerter").value, program: sel ? sel.value : "" })
          .then(function () { toast("🔴 I er live på Vera-radio!"); if (!rvLytter) lyt(true); }).catch(function () {});
      });
    }
  }
  function koeHtml() {
    const k = st && Array.isArray(st.koe) ? st.koe : [];
    if (!k.length) return "<li class='rv-tom'>Køen er tom. Tilføj sange fra 🎵 Musik eller en 📋 Playliste.</li>";
    return k.map(function (s, i) {
      return "<li><span>" + esc(sporNavn(s)) + (s.sek ? " <small>" + mmss(s.sek) + "</small>" : "") + "</span>" +
        "<button class='rv-lille' data-rv-koe='op' data-i='" + i + "' title='Op'>↑</button>" +
        "<button class='rv-lille' data-rv-koe='ned' data-i='" + i + "' title='Ned'>↓</button>" +
        "<button class='rv-lille' data-rv-koe='spil' data-i='" + i + "' title='Spil nu'>▶</button>" +
        "<button class='rv-lille rv-roed' data-rv-koe='fjern' data-i='" + i + "' title='Fjern'>✕</button></li>";
    }).join("");
  }
  function opdaterStudie() {
    const div = document.querySelector("#rv-panel .rv-studie");
    if (!div) return;
    if (liveSidst !== erLive()) tegnLiveBoks();
    tegnMik();
    const nu = div.querySelector(".rv-nu");
    const s = st && st.spor;
    const nuHtml = "<b>" + esc(s ? sporNavn(s) : "Der spilles ikke noget") + "</b>" + (st && st.pauset ? " <span class='rv-pauset'>⏸ på pause for alle</span>" : "") +
      "<div class='vr-bar'><i style='width:0%'></i></div><span class='vr-tid'></span>";
    if (nu.dataset.fp !== nuHtml) { nu.innerHTML = nuHtml; nu.dataset.fp = nuHtml; }
    const p = div.querySelector(".rv-pause");
    p.textContent = st && st.pauset ? "▶ Fortsæt" : "⏸ Pause";
    p.disabled = !s;
    div.querySelector(".rv-gentag").classList.toggle("til", !!(st && st.gentag));
    const lytK = div.querySelector(".rv-lyt");
    lytK.textContent = rvLytter ? "🎧 Lytter med ✓" : "🎧 Lyt med";
    lytK.classList.toggle("til", rvLytter);
    const kh = koeHtml(), ol = div.querySelector(".rv-koe");
    if (ol.dataset.fp !== kh) {
      ol.innerHTML = kh; ol.dataset.fp = kh;
      ol.querySelectorAll("[data-rv-koe]").forEach(function (b) {
        b.addEventListener("click", function () {
          const i = +b.dataset.i, h = b.dataset.rvKoe;
          if (h === "op") styr("koe_flyt", { i: i, ret: -1 }).catch(function () {});
          else if (h === "ned") styr("koe_flyt", { i: i, ret: 1 }).catch(function () {});
          else if (h === "fjern") styr("koe_fjern", { i: i }).catch(function () {});
          else if (h === "spil") { const sp = st.koe[i]; styr("koe_fjern", { i: i }).then(function () { return styr("spil", { spor: sp }); }).catch(function () {}); }
        });
      });
    }
    div.querySelector(".rv-koe-antal").textContent = st ? "(" + (st.koe_antal || 0) + ")" : "";
    const ly = div.querySelector(".rv-lyttere");
    const navne = st && Array.isArray(st.lytter_navne) ? st.lytter_navne : [];
    const lh = "<b class='rv-stort-tal'>" + (st ? st.lyttere || 0 : 0) + "</b> lytter med lige nu" +
      (navne.length ? "<div class='rv-navne'>" + navne.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + "</div>" : "");
    if (ly.dataset.fp !== lh) { ly.innerHTML = lh; ly.dataset.fp = lh; }
    const ul = div.querySelector(".rv-beskeder");
    const bh = rvBeskeder.length ? rvBeskeder.slice().reverse().map(function (b) {
      return "<li><b>" + esc(b.fra) + "</b><span>" + esc(b.tekst) + "</span><small>" + kl(b.tid) + "</small></li>";
    }).join("") : "<li class='rv-tom'>" + (erLive() ? "Ingen beskeder endnu. Lytterne kan skrive i appen Vera-radio eller ringe/skrive til ☎ " + RV_NUMMER + "." : "Når I er live, kan lytterne skrive til jer her.") + "</li>";
    if (ul.dataset.fp !== bh) { ul.innerHTML = bh; ul.dataset.fp = bh; }
  }

  // ----- Snak: optag / oplæs / live-link -----
  let optager = null, optagStart = 0, optagTimer = null, optagData = null, optagSek = 0;
  function tegnSnak(el, hvad) {
    if (!el) return;
    if (hvad === "mik") { el.innerHTML = "<div class='rv-mik'></div>"; tegnMik(); return; }
    if (hvad === "optag") {
      el.innerHTML = "<p class='rv-lille-tekst'>Optag op til 2 minutter med din mikrofon. Når du sender det, hører alle lytterne det i radioen.</p>" +
        "<div class='rv-raekke'><button class='rv-optag'>🔴 Start optagelse</button><span class='rv-optag-tid'></span></div>" +
        "<div class='rv-optaget' hidden><audio controls></audio><label>Navn<input class='rv-klip-navn' maxlength='120' placeholder='Fx Velkommen til Søndagsradio'></label>" +
        "<div class='rv-raekke'><button class='rv-klip-nu'>📢 Send nu</button><button class='rv-klip-koe'>➕ Sæt i kø</button><button class='rv-klip-gem'>💾 Gem til senere</button></div></div>" +
        "<h5>🎙 Gemte snak-klip</h5><ul class='rv-klip-liste'><li class='rv-tom'>Henter …</li></ul>";
      el.querySelector(".rv-optag").addEventListener("click", function () { if (optager) stopOptag(); else startOptag(el); });
      const gemKlip = function (ogSaa) {
        if (!optagData) return;
        const navn = el.querySelector(".rv-klip-navn").value || "Snak";
        kald("hv_radio_klip_gem", { p_token: token(), p_titel: navn, p_data: optagData, p_sek: optagSek }).then(function (id) {
          klipCache[id] = optagData;
          const sp = { type: "klip", id: id, titel: navn, sek: optagSek };
          optagData = null; el.querySelector(".rv-optaget").hidden = true;
          hentKlipListe(el);
          if (ogSaa === "nu") return styr("spil", { spor: sp }).then(function () { toast("📢 Dit klip spiller nu i radioen"); });
          if (ogSaa === "koe") return styr("koe", { spor: sp }).then(function () { toast("➕ Klippet er sat i kø"); });
          toast("💾 Klippet er gemt");
        }).catch(function (e) { visFejl(fejlTekst(e)); });
      };
      el.querySelector(".rv-klip-nu").addEventListener("click", function () { gemKlip("nu"); });
      el.querySelector(".rv-klip-koe").addEventListener("click", function () { gemKlip("koe"); });
      el.querySelector(".rv-klip-gem").addEventListener("click", function () { gemKlip("gem"); });
      hentKlipListe(el);
    } else if (hvad === "oplaes") {
      el.innerHTML = "<p class='rv-lille-tekst'>Skriv det, du vil sige. Alle lytternes computere læser det højt med en dansk stemme (hvis computeren har en).</p>" +
        "<textarea class='rv-tale' maxlength='600' rows='3' placeholder='Fx Hej allesammen og velkommen til Søndagsradio på Vera-radio!'></textarea>" +
        "<div class='rv-raekke'><button class='rv-tale-nu'>🗣 Læs op nu</button><button class='rv-tale-koe'>➕ Sæt i kø</button><button class='rv-tale-proev'>👂 Prøv selv først</button></div>";
      const spor = function () {
        const t = el.querySelector(".rv-tale").value.trim();
        if (!t) { visFejl("Skriv noget, der skal læses op."); return null; }
        return { type: "tale", tekst: t, titel: t.length > 40 ? t.slice(0, 40) + " …" : t, sek: Math.max(3, Math.round(t.split(/\s+/).length * 0.45 + 1.5)) };
      };
      el.querySelector(".rv-tale-nu").addEventListener("click", function () { const s = spor(); if (s) styr("spil", { spor: s }).then(function () { el.querySelector(".rv-tale").value = ""; }).catch(function () {}); });
      el.querySelector(".rv-tale-koe").addEventListener("click", function () { const s = spor(); if (s) styr("koe", { spor: s }).then(function () { el.querySelector(".rv-tale").value = ""; toast("➕ Sat i kø"); }).catch(function () {}); });
      el.querySelector(".rv-tale-proev").addEventListener("click", function () { const s = spor(); if (s) siOp(s.tekst); });
    } else {
      el.innerHTML = "<p class='rv-lille-tekst'>Det nemmeste er <b>🔴 Mikrofon live</b>. Har I allerede en live-radio hos en anden tjeneste (fx Zeno.fm eller Mixlr), og sæt <b>lyd-linket</b> (som ender på .mp3 eller /stream) ind her. Så hører alle lytterne jer direkte gennem Vera-radio.</p>" +
        "<label>Navn<input class='rv-link-navn' maxlength='120' placeholder='Fx Live fra studiet'></label>" +
        "<label>Lyd-link<input class='rv-link-url' maxlength='600' placeholder='https://…'></label>" +
        "<div class='rv-raekke'><button class='rv-link-nu'>📡 Send live nu</button><button class='rv-link-proev'>👂 Prøv linket</button></div>" +
        "<p class='rv-lille-tekst'>Et live-link kører, til I trykker ⏭ Næste eller ⏹ Stop.</p>";
      el.querySelector(".rv-link-nu").addEventListener("click", function () {
        const url = el.querySelector(".rv-link-url").value.trim();
        if (!/^https?:\/\//i.test(url)) { visFejl("Linket skal starte med https://"); return; }
        styr("spil", { spor: { type: "link", url: url, titel: el.querySelector(".rv-link-navn").value || "Live fra studiet", sek: 0 } }).catch(function () {});
      });
      el.querySelector(".rv-link-proev").addEventListener("click", function (e) {
        const url = el.querySelector(".rv-link-url").value.trim();
        const a = new Audio(url); a.volume = rvVol;
        const k = e.currentTarget;
        a.play().then(function () { k.textContent = "✓ Linket virker"; setTimeout(function () { a.pause(); k.textContent = "👂 Prøv linket"; }, 4000); })
          .catch(function () { k.textContent = "⚠️ Linket virker ikke"; setTimeout(function () { k.textContent = "👂 Prøv linket"; }, 3000); });
      });
    }
  }
  function startOptag(el) {
    visFejl("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      visFejl("Din browser kan ikke optage. Prøv at åbne hotellet på nettet (github.io) i stedet for fra en fil, eller brug 🗣 Oplæs tekst.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (strøm) {
      const typer = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"];
      const type = typer.find(function (t) { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || "";
      const bidder = [];
      optager = new MediaRecorder(strøm, type ? { mimeType: type, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
      optager.ondataavailable = function (e) { if (e.data && e.data.size) bidder.push(e.data); };
      optager.onstop = function () {
        strøm.getTracks().forEach(function (t) { t.stop(); });
        clearInterval(optagTimer);
        optagSek = Math.round((Date.now() - optagStart) / 100) / 10;
        const blob = new Blob(bidder, { type: optager.mimeType || type || "audio/webm" });
        optager = null;
        const knapO = el.querySelector(".rv-optag"); if (knapO) { knapO.textContent = "🔴 Ny optagelse"; knapO.classList.remove("optager"); }
        const fr = new FileReader();
        fr.onload = function () {
          optagData = String(fr.result).replace(/^data:([^;,]+)(;codecs=[^;,]+)?/, "data:$1");
          const boks = el.querySelector(".rv-optaget");
          if (!boks) return;
          boks.hidden = false;
          boks.querySelector("audio").src = optagData;
          el.querySelector(".rv-optag-tid").textContent = "Optaget: " + mmss(optagSek);
        };
        fr.readAsDataURL(blob);
      };
      optager.start(500);
      optagStart = Date.now();
      const k = el.querySelector(".rv-optag"); k.textContent = "⏹ Stop optagelse"; k.classList.add("optager");
      optagTimer = setInterval(function () {
        const s = (Date.now() - optagStart) / 1000;
        const t = el.querySelector(".rv-optag-tid"); if (t) t.textContent = "🔴 " + mmss(s) + " / 2:00";
        if (s >= 120) stopOptag();
      }, 250);
    }).catch(function () { visFejl("Du skal give lov til at bruge mikrofonen (tryk Tillad i browseren)."); });
  }
  function stopOptag() { try { if (optager && optager.state !== "inactive") optager.stop(); } catch (e) {} }
  function hentKlipListe(el) {
    kald("hv_radio_klip_liste", { p_token: token() }).then(function (l) {
      klipListe = Array.isArray(l) ? l : [];
      const ul = el.querySelector(".rv-klip-liste");
      if (!ul) return;
      ul.innerHTML = klipListe.length ? klipListe.map(function (k) {
        return "<li><span>🎙 " + esc(k.titel) + " <small>" + mmss(k.sek) + " · " + esc(k.af || "") + "</small></span>" +
          "<button class='rv-lille' data-k-nu='" + k.id + "'>▶ Spil nu</button><button class='rv-lille' data-k-koe='" + k.id + "'>➕ Kø</button>" +
          "<button class='rv-lille rv-roed' data-k-slet='" + k.id + "'>🗑</button></li>";
      }).join("") : "<li class='rv-tom'>Ingen gemte klip endnu.</li>";
      const spor = function (id) { const k = klipListe.find(function (x) { return x.id === id; }); return { type: "klip", id: id, titel: k.titel, sek: k.sek }; };
      ul.querySelectorAll("[data-k-nu]").forEach(function (b) { b.addEventListener("click", function () { styr("spil", { spor: spor(+b.dataset.kNu) }).catch(function () {}); }); });
      ul.querySelectorAll("[data-k-koe]").forEach(function (b) { b.addEventListener("click", function () { styr("koe", { spor: spor(+b.dataset.kKoe) }).then(function () { toast("➕ Sat i kø"); }).catch(function () {}); }); });
      ul.querySelectorAll("[data-k-slet]").forEach(function (b) {
        b.addEventListener("click", function () { toKlik(b, function () { kald("hv_radio_klip_slet", { p_token: token(), p_id: +b.dataset.kSlet }).then(function () { hentKlipListe(el); }).catch(function (e) { visFejl(fejlTekst(e)); }); }); });
      });
    }).catch(function (e) {
      const ul = el.querySelector(".rv-klip-liste"); if (ul) ul.innerHTML = "<li class='rv-tom'>" + esc(fejlTekst(e)) + "</li>";
    });
  }

  // ----- 🔴 Mikrofon live -----
  function mikHtml() {
    const m = st && st.live ? st.mik : null;
    if (mikTil) {
      const f = forbundne().length, venter = Object.keys(mikPeers).length - f;
      return "<div class='rv-mik-paa'><span class='rv-mik-prik'></span><b>Du er live i mikrofonen" + (mikDempet ? " · lyden er slået fra" : "") + "</b></div>" +
        "<div class='rv-mik-niveau' title='Så højt hører lytterne dig'><i></i></div>" +
        "<p class='rv-lille-tekst'>🎧 <b>" + f + "</b> " + (f === 1 ? "lytter hører" : "lyttere hører") + " din stemme direkte" + (venter > 0 ? " · " + venter + " er ved at koble på" : "") +
        ". Musikken bliver skruet ned hos lytterne, mens mikrofonen er tændt.</p>" +
        "<div class='rv-raekke'><button class='rv-mik-daemp'>" + (mikDempet ? "🔊 Slå lyden til igen" : "🔇 Slå lyden fra et øjeblik") + "</button>" +
        "<button class='rv-mik-sluk rv-roed'>⏹ Sluk mikrofonen</button></div>";
    }
    if (m && m.navn !== mig()) return "<p class='rv-lille-tekst'>🎙 <b>" + esc(m.navn) + "</b> snakker i mikrofonen lige nu. Når " + esc(m.navn) + " slukker, kan du tage over.</p>";
    return "<p class='rv-lille-tekst'>Snak direkte til alle lytterne med din mikrofon, lige her i panelet. Brug gerne høretelefoner, så musikken ikke kommer med i mikrofonen.</p>" +
      "<button class='rv-mik-taend'" + (mikTaender ? " disabled" : "") + ">" + (mikTaender ? "Tænder mikrofonen …" : "🎙 " + (erLive() ? "Tænd mikrofonen" : "Gå live og tænd mikrofonen")) + "</button>" +
      (mikFejl ? "<p class='rv-advarsel'>" + esc(mikFejl) + "</p>" : "") +
      "<p class='rv-lille-tekst'>Første gang spørger browseren, om den må bruge mikrofonen. Tryk <b>Tillad</b>.</p>";
  }
  function tegnMik() {
    const el = document.querySelector("#rv-panel .rv-mik");
    if (!el) return;
    const h = mikHtml();
    if (el.dataset.fp === h) return;
    el.innerHTML = h;
    el.dataset.fp = h;
    const k = function (sel, f) { const b = el.querySelector(sel); if (b) b.addEventListener("click", f); };
    k(".rv-mik-taend", function () { mikTaend(); });
    k(".rv-mik-sluk", function () { mikSluk(); });
    k(".rv-mik-daemp", function () { mikDaemp(!mikDempet); });
  }

  // ----- 📖 Guide til radioværterne -----
  function tegnGuide(krop) {
    try { localStorage.setItem("mit-hotel-radio-guide-set", "1"); } catch (e) {}
    const trin = [
      ["🎖", "Sådan bliver man radiovært", "På forsiden trykker man <b>🎖️ Ansøg om at være staff</b> og vælger <b>Radiovært</b>. Ejeren giver skiltet i Ejerpanelet → Personale → Ansættelse. Radioværter får løn hver mandag ligesom de andre ansatte."],
      ["🛡", "Find Radio-panelet", "Tryk på <b>🛡-knappen</b> nederst i chatbaren og vælg <b>📻 Radio</b>. Du kan også tage elevatoren til <b>📻 Radiostudiet</b> og klikke på et af podcastbordene. Kun radioværter og ejeren kan komme ind i studiet."],
      ["🔴", "Gå live", "Under <b>🎙 Studie</b> skriver du en titel og et emne (eller vælger et program) og trykker <b>🔴 Gå live</b>. Hele hotellet kan se, at radioen er live, og ON AIR lyser."],
      ["🎙", "Snak i mikrofonen", "Under <b>Snak i radioen → 🔴 Mikrofon live</b> trykker du <b>Tænd mikrofonen</b> og så <b>Tillad</b>, når browseren spørger. Nu hører alle lytterne dig med det samme, og musikken bliver skruet ned hos dem. Den gule streg viser, at mikrofonen virker. Brug <b>🔇</b>, hvis du skal hoste, og <b>⏹ Sluk mikrofonen</b>, når du er færdig. Kun én kan snakke ad gangen, så den anden vært tager over, når du slukker. Brug gerne høretelefoner, og åbn hotellet på nettet (github.io) i Chrome, Edge eller Firefox."],
      ["🗣", "Andre måder at snakke på", "<b>🎙 Optag klip</b>: optag op til 2 minutter og send det ud. <b>🗣 Oplæs tekst</b>: skriv noget, og computeren læser det højt. <b>📡 Live-link</b>: hvis I har jeres egen live-radio et andet sted."],
      ["▶️", "Spil musik", "Indsæt et <b>YouTube-link</b> under <b>Nu spiller</b> og tryk <b>▶ Spil nu</b> eller <b>➕ Kø</b>. Under <b>🎵 Musik</b> kan du gemme sange (YouTube-links eller mp3-links) i radioens bibliotek, og under <b>📋 Playlister</b> kan du samle dem. ⏸ Pause, ⏭ Næste og ⏹ Stop gælder for alle, der lytter. Nogle YouTube-videoer må ikke afspilles uden for YouTube. Så kommer der en besked, og du vælger bare en anden."],
      ["✉️", "Når lytterne skriver", "Mens I er live, kan lytterne skrive fra appen <b>Vera-radio</b> på telefonen eller til radioens nummer <b>☎ " + RV_NUMMER + "</b>. Beskederne kommer under <b>✉️ Beskeder fra lytterne</b>, og din telefon dinger. Læs gerne hilsener og ønsker op."],
      ["🗓", "Planlæg programmer", "Under <b>🗓 Programmer</b> laver du et program med dato og tid og skriver <b>næste emne</b>, så I ved, hvad I skal snakke om. Alle kan se de kommende programmer i appen. Når tiden kommer, trykker du <b>🔴 Gå live med det</b>."],
      ["⏹", "Slut udsendelsen", "Tryk <b>⏹ Slut udsendelsen</b> (to gange). Udsendelsen bliver gemt under <b>💾 Udsendelser</b> og i appen under <b>Gemte</b>, så alle kan høre den igen, også det du sagde i mikrofonen."],
      ["📅", "Vagtskema", "Under <b>📅 Vagtskema</b> skriver du dig på radiovagterne, så I ved, hvem der laver radio hvornår."],
      ["💡", "Gode råd", "Sig hej og fortæl, hvem du er, og hvad emnet er. Hold en god tone, for hotellets regler gælder også i radioen. Sluk mikrofonen, når du ikke snakker, og slut altid udsendelsen, når I er færdige."]
    ];
    const div = document.createElement("div");
    div.className = "rv-guide";
    div.innerHTML = "<section class='rv-boks'><h3>📖 Guide til radioværter</h3><p class='rv-lille-tekst'>Sådan laver du radio på Vera-radio, trin for trin.</p><ol>" +
      trin.map(function (x) { return "<li><span class='rv-guide-ikon'>" + x[0] + "</span><div><b>" + x[1] + "</b><p>" + x[2] + "</p></div></li>"; }).join("") +
      "</ol><button class='rv-guide-start'>🎙 Gå til studiet</button></section>";
    krop.appendChild(div);
    div.querySelector(".rv-guide-start").addEventListener("click", function () { underFane = "studie"; tegnPanelIgen(); });
  }

  // ----- 🎵 Musik -----
  function hotelSange() {
    const l = Array.isArray(window.MUSIK_SANGE) ? window.MUSIK_SANGE : [];
    return l.filter(function (s) { return s && s.fil && s.titel; }).map(function (s, i) {
      return { id: "h" + i, titel: s.titel, kunstner: s.kunstner || "", url: "musik/" + encodeURI(s.fil), sek: 0, hotel: true, licens: s.licens };
    });
  }
  if (!Array.isArray(window.MUSIK_SANGE)) {
    const sc = document.createElement("script");
    sc.src = "musik/sange.js?v=" + Math.floor(Date.now() / 60000);
    sc.onload = function () { if (panelAabent() && underFane === "musik") tegnPanelIgen(); };
    document.body.appendChild(sc);
  }
  const varighedCache = {};
  // Hvor lang er sangen? (lydfilen hentes kort)
  function maalSek(url) {
    if (varighedCache[url]) return Promise.resolve(varighedCache[url]);
    return new Promise(function (ok, nej) {
      const a = new Audio();
      a.preload = "metadata";
      const t = setTimeout(function () { a.src = ""; nej(new Error("Lydfilen svarer ikke. Er linket rigtigt?")); }, 12000);
      a.addEventListener("loadedmetadata", function () {
        clearTimeout(t);
        if (isFinite(a.duration) && a.duration > 0) { varighedCache[url] = a.duration; ok(a.duration); }
        else nej(new Error("Det ligner et live-link. Brug 📡 Live-link under Snak i stedet."));
        a.src = "";
      });
      a.addEventListener("error", function () { clearTimeout(t); nej(new Error("Lydfilen kunne ikke åbnes. Linket skal gå direkte til en lydfil (.mp3).")); });
      a.src = url;
    });
  }
  function sangSpor(s) {
    if (ytIdFra(s.url)) return ytSpor(s.url, s.titel, s.kunstner);
    return maalSek(s.url).then(function (sek) { return { type: "sang", id: s.hotel ? null : s.id, titel: s.titel, kunstner: s.kunstner, url: s.url, sek: Math.round(sek * 10) / 10 }; });
  }
  function hentMusik() {
    return kald("hv_radio_musik_hent", {}).then(function (l) { musik = Array.isArray(l) ? l : []; }).catch(function (e) { musik = []; visFejl(fejlTekst(e)); });
  }
  function hentPlaylister() {
    return kald("hv_radio_playlister_hent", { p_token: token() }).then(function (l) { playlister = Array.isArray(l) ? l : []; }).catch(function (e) { playlister = []; visFejl(fejlTekst(e)); });
  }
  function alleSange() { return hotelSange().concat(musik || []); }
  function tegnMusik(krop) {
    if (musik === null) { krop.innerHTML += "<p class='rv-lille-tekst'>Henter musik …</p>"; hentMusik().then(tegnPanelIgen); return; }
    if (playlister === null) { hentPlaylister().then(tegnPanelIgen); }
    const soeg = musikSoeg.toLowerCase();
    const passer = function (s) { return !soeg || (s.titel + " " + (s.kunstner || "")).toLowerCase().indexOf(soeg) >= 0; };
    const raekke = function (s) {
      return "<li><span>" + (ytIdFra(s.url) ? "▶️" : "🎵") + " <b>" + esc(s.titel) + "</b>" + (s.kunstner ? " <small>" + esc(s.kunstner) + "</small>" : "") + (s.sek ? " <small>" + mmss(s.sek) + "</small>" : "") + "</span>" +
        "<button class='rv-lille' data-m-nu='" + s.id + "'>▶ Spil nu</button><button class='rv-lille' data-m-koe='" + s.id + "'>➕ Kø</button>" +
        (maalPlayliste ? "<button class='rv-lille' data-m-pl='" + s.id + "'>📋 Læg i playliste</button>" : "") +
        (s.hotel ? "" : "<button class='rv-lille rv-roed' data-m-slet='" + s.id + "'>🗑</button>") + "</li>";
    };
    const hs = hotelSange().filter(passer), ms = (musik || []).filter(passer);
    const div = document.createElement("div");
    div.innerHTML =
      "<section class='rv-boks'><h4>➕ Tilføj en sang</h4><p class='rv-lille-tekst'>Indsæt et <b>YouTube-link</b> (så finder radioen selv navnet og længden) eller et link direkte til en lydfil (.mp3), som I har lov til at bruge. " +
      "Eller læg mp3-filen i hotellets mappe <b>musik/</b> og skriv den i <b>musik/sange.js</b>, så kommer den under 🏨 Hotellets sange.</p>" +
      "<div class='rv-gitter'><label>Sangens navn<input class='rv-m-titel' maxlength='120'></label><label>Kunstner<input class='rv-m-kunstner' maxlength='120'></label>" +
      "<label class='rv-bred'>YouTube-link eller link til lydfilen<input class='rv-m-url' maxlength='600' placeholder='https://www.youtube.com/watch?v=… eller https://… .mp3'></label></div>" +
      "<button class='rv-m-tilfoej'>➕ Tilføj til biblioteket</button></section>" +
      "<section class='rv-boks'><div class='rv-raekke'><input class='rv-m-soeg' placeholder='🔍 Søg efter sang eller kunstner' value='" + esc(musikSoeg) + "'>" +
      "<label>Læg i playliste: <select class='rv-m-maal'><option value=''>(vælg playliste)</option>" + (playlister || []).map(function (p) {
        return "<option value='" + p.id + "'" + (String(p.id) === String(maalPlayliste) ? " selected" : "") + ">" + esc(p.navn) + "</option>";
      }).join("") + "</select></label></div>" +
      "<h4>🏨 Hotellets sange (" + hs.length + ")</h4><ul class='rv-liste'>" + (hs.map(raekke).join("") || "<li class='rv-tom'>Ingen.</li>") + "</ul>" +
      "<h4>🎵 Radioens bibliotek (" + ms.length + ")</h4><ul class='rv-liste'>" + (ms.map(raekke).join("") || "<li class='rv-tom'>Ingen sange endnu. Tilføj en ovenfor.</li>") + "</ul></section>";
    krop.appendChild(div);
    const find = function (id) { return alleSange().find(function (s) { return String(s.id) === String(id); }); };
    div.querySelector(".rv-m-tilfoej").addEventListener("click", function (e) {
      const k = e.currentTarget;
      const titel = div.querySelector(".rv-m-titel").value.trim(), kunstner = div.querySelector(".rv-m-kunstner").value.trim(), url = div.querySelector(".rv-m-url").value.trim();
      const erYt = !!ytIdFra(url);
      if (!url || (!titel && !erYt)) { visFejl(erYt || url ? "Skriv sangens navn." : "Indsæt et link."); return; }
      k.disabled = true; k.textContent = erYt ? "Tjekker YouTube-videoen …" : "Tjekker lydfilen …";
      (erYt ? ytSpor(url, titel).then(function (sp) { return { sek: sp.sek, titel: sp.titel }; }) : maalSek(url).then(function (sek) { return { sek: sek, titel: titel }; }))
      .then(function (m) {
        return kald("hv_radio_musik_gem", { p_token: token(), p_titel: m.titel, p_kunstner: kunstner, p_url: url, p_sek: Math.round(m.sek * 10) / 10 });
      }).then(function () { visFejl(""); toast("🎵 Sangen er tilføjet"); return hentMusik(); }).then(tegnPanelIgen)
        .catch(function (er) { visFejl(fejlTekst(er)); k.disabled = false; k.textContent = "➕ Tilføj til biblioteket"; });
    });
    const soegF = div.querySelector(".rv-m-soeg");
    soegF.addEventListener("input", function () {
      musikSoeg = soegF.value;
      clearTimeout(soegF.t);
      soegF.t = setTimeout(function () { tegnPanelIgen(); const f = document.querySelector("#rv-panel .rv-m-soeg"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 350);
    });
    div.querySelector(".rv-m-maal").addEventListener("change", function (e) { maalPlayliste = e.target.value; tegnPanelIgen(); });
    const travl = function (b, p) { const f = b.textContent; b.disabled = true; b.textContent = "…"; return p.then(function (x) { b.disabled = false; b.textContent = f; return x; }, function (er) { b.disabled = false; b.textContent = f; visFejl(fejlTekst(er)); }); };
    div.querySelectorAll("[data-m-nu]").forEach(function (b) {
      b.addEventListener("click", function () { travl(b, sangSpor(find(b.dataset.mNu)).then(function (sp) { return styr("spil", { spor: sp }); })); });
    });
    div.querySelectorAll("[data-m-koe]").forEach(function (b) {
      b.addEventListener("click", function () { travl(b, sangSpor(find(b.dataset.mKoe)).then(function (sp) { return styr("koe", { spor: sp }); }).then(function () { toast("➕ Sat i kø"); })); });
    });
    div.querySelectorAll("[data-m-pl]").forEach(function (b) {
      b.addEventListener("click", function () {
        const pl = (playlister || []).find(function (p) { return String(p.id) === String(maalPlayliste); });
        if (!pl) return;
        travl(b, sangSpor(find(b.dataset.mPl)).then(function (sp) {
          return kald("hv_radio_playliste_gem", { p_token: token(), p_id: pl.id, p_navn: pl.navn, p_spor: (pl.spor || []).concat([sp]) });
        }).then(function () { toast("📋 Lagt i " + pl.navn); return hentPlaylister(); }));
      });
    });
    div.querySelectorAll("[data-m-slet]").forEach(function (b) {
      b.addEventListener("click", function () { toKlik(b, function () { kald("hv_radio_musik_slet", { p_token: token(), p_id: +b.dataset.mSlet }).then(hentMusik).then(tegnPanelIgen).catch(function (e) { visFejl(fejlTekst(e)); }); }); });
    });
  }

  // ----- 📋 Playlister -----
  function tegnPlaylister(krop) {
    if (playlister === null) { krop.innerHTML += "<p class='rv-lille-tekst'>Henter playlister …</p>"; hentPlaylister().then(tegnPanelIgen); return; }
    const pl = valgtPlayliste != null ? playlister.find(function (p) { return p.id === valgtPlayliste; }) : null;
    const div = document.createElement("div");
    div.className = "rv-pl";
    div.innerHTML = "<section class='rv-boks rv-pl-liste'><h4>📋 Playlister</h4><div class='rv-raekke'><input class='rv-pl-ny' maxlength='80' placeholder='Navn på ny playliste'><button class='rv-pl-opret'>➕ Opret</button></div>" +
      "<ul class='rv-liste'>" + (playlister.length ? playlister.map(function (p) {
        const sek = (p.spor || []).reduce(function (a, s) { return a + (s.sek || 0); }, 0);
        return "<li class='" + (pl && pl.id === p.id ? "valgt" : "") + "'><button class='rv-pl-vaelg' data-pl='" + p.id + "'><b>" + esc(p.navn) + "</b><small>" + (p.spor || []).length + " numre · " + mmss(sek) + "</small></button>" +
          "<button class='rv-lille' data-pl-spil='" + p.id + "'>▶ Spil</button><button class='rv-lille' data-pl-koe='" + p.id + "'>➕ Kø</button></li>";
      }).join("") : "<li class='rv-tom'>Ingen playlister endnu.</li>") + "</ul>" +
      "<div class='rv-raekke'><label class='rv-flueben'><input type='checkbox' class='rv-pl-bland'> 🔀 Bland</label><label class='rv-flueben'><input type='checkbox' class='rv-pl-gentag' checked> 🔁 Gentag</label></div></section>" +
      "<section class='rv-boks rv-pl-ret'>" + (pl ? "<h4>✏️ " + esc(pl.navn) + "</h4><div class='rv-raekke'><input class='rv-pl-navn' maxlength='80' value='" + esc(pl.navn) + "'><button class='rv-pl-omdoeb'>💾 Omdøb</button>" +
        "<button class='rv-pl-slet rv-roed'>🗑 Slet playlisten</button></div><ol class='rv-koe'>" + ((pl.spor || []).map(function (s, i) {
          return "<li><span>" + esc(sporNavn(s)) + " <small>" + mmss(s.sek) + "</small></span><button class='rv-lille' data-s-op='" + i + "'>↑</button><button class='rv-lille' data-s-ned='" + i + "'>↓</button>" +
            "<button class='rv-lille rv-roed' data-s-fjern='" + i + "'>✕</button></li>";
        }).join("") || "<li class='rv-tom'>Tom. Gå til 🎵 Musik, vælg playlisten under \"Læg i playliste\" og tryk 📋 ved sangene.</li>") + "</ol>" +
        "<button class='rv-pl-tilmusik'>🎵 Tilføj sange</button>" : "<p class='rv-lille-tekst'>Vælg en playliste for at se og ændre numrene.</p>") + "</section>";
    krop.appendChild(div);
    div.querySelector(".rv-pl-opret").addEventListener("click", function () {
      const navn = div.querySelector(".rv-pl-ny").value.trim();
      if (!navn) { visFejl("Giv playlisten et navn."); return; }
      kald("hv_radio_playliste_gem", { p_token: token(), p_id: null, p_navn: navn, p_spor: [] }).then(function (id) { valgtPlayliste = id; maalPlayliste = String(id); return hentPlaylister(); })
        .then(tegnPanelIgen).catch(function (e) { visFejl(fejlTekst(e)); });
    });
    div.querySelectorAll("[data-pl]").forEach(function (b) { b.addEventListener("click", function () { valgtPlayliste = +b.dataset.pl; tegnPanelIgen(); }); });
    div.querySelectorAll("[data-pl-spil]").forEach(function (b) {
      b.addEventListener("click", function () {
        styr("spil_playliste", { id: +b.dataset.plSpil, bland: div.querySelector(".rv-pl-bland").checked, gentag: div.querySelector(".rv-pl-gentag").checked })
          .then(function () { toast("▶ Playlisten spiller nu"); }).catch(function () {});
      });
    });
    div.querySelectorAll("[data-pl-koe]").forEach(function (b) {
      b.addEventListener("click", function () { styr("spil_playliste", { id: +b.dataset.plKoe, tilfoej: true, bland: div.querySelector(".rv-pl-bland").checked }).then(function () { toast("➕ Playlisten er sat i kø"); }).catch(function () {}); });
    });
    if (!pl) return;
    const gem = function (spor, navn) {
      return kald("hv_radio_playliste_gem", { p_token: token(), p_id: pl.id, p_navn: navn || pl.navn, p_spor: spor }).then(hentPlaylister).then(tegnPanelIgen).catch(function (e) { visFejl(fejlTekst(e)); });
    };
    div.querySelector(".rv-pl-omdoeb").addEventListener("click", function () { gem(pl.spor || [], div.querySelector(".rv-pl-navn").value.trim()); });
    div.querySelector(".rv-pl-slet").addEventListener("click", function (e) {
      toKlik(e.currentTarget, function () { kald("hv_radio_playliste_slet", { p_token: token(), p_id: pl.id }).then(function () { valgtPlayliste = null; return hentPlaylister(); }).then(tegnPanelIgen).catch(function (er) { visFejl(fejlTekst(er)); }); });
    });
    div.querySelector(".rv-pl-tilmusik").addEventListener("click", function () { maalPlayliste = String(pl.id); underFane = "musik"; tegnPanelIgen(); });
    const flyt = function (i, ret) { const l = (pl.spor || []).slice(); const j = i + ret; if (j < 0 || j >= l.length) return; const x = l[i]; l[i] = l[j]; l[j] = x; gem(l); };
    div.querySelectorAll("[data-s-op]").forEach(function (b) { b.addEventListener("click", function () { flyt(+b.dataset.sOp, -1); }); });
    div.querySelectorAll("[data-s-ned]").forEach(function (b) { b.addEventListener("click", function () { flyt(+b.dataset.sNed, 1); }); });
    div.querySelectorAll("[data-s-fjern]").forEach(function (b) { b.addEventListener("click", function () { const l = (pl.spor || []).slice(); l.splice(+b.dataset.sFjern, 1); gem(l); }); });
  }

  // ----- 🗓 Programmer -----
  function hentProgrammer() {
    return kald("hv_radio_programmer_hent", { p_token: token() }).then(function (l) { programmer = Array.isArray(l) ? l : []; }).catch(function (e) { programmer = []; visFejl(fejlTekst(e)); });
  }
  function datoFelt(ms) { const d = new Date(ms); return d.getFullYear() + "-" + to(d.getMonth() + 1) + "-" + to(d.getDate()); }
  function tegnProgrammer(krop) {
    if (programmer === null) { krop.innerHTML += "<p class='rv-lille-tekst'>Henter programmer …</p>"; hentProgrammer().then(tegnPanelIgen); return; }
    const r = retProgram ? programmer.find(function (p) { return p.id === retProgram; }) : null;
    const nu = Date.now();
    const kommende = programmer.filter(function (p) { return (p.slut || p.start + 7200000) > nu; }).sort(function (a, b) { return a.start - b.start; });
    const gamle = programmer.filter(function (p) { return (p.slut || p.start + 7200000) <= nu; });
    const naeste = new Date(); naeste.setDate(naeste.getDate() + ((7 - naeste.getDay()) % 7 || 7));   // næste søndag
    const div = document.createElement("div");
    div.innerHTML =
      "<section class='rv-boks'><h4>" + (r ? "✏️ Ret programmet" : "➕ Opret et radioprogram") + "</h4><div class='rv-gitter'>" +
      "<label class='rv-bred'>Navn<input class='rv-p-titel' maxlength='120' placeholder='Fx Søndagsradio' value='" + esc(r ? r.titel : "") + "'></label>" +
      "<label class='rv-bred'>Om programmet<input class='rv-p-om' maxlength='500' placeholder='Fx Hyggemusik og hilsner' value='" + esc(r ? r.om || "" : "") + "'></label>" +
      "<label>Dato<input type='date' class='rv-p-dato' value='" + datoFelt(r ? r.start : naeste.getTime()) + "'></label>" +
      "<label>Fra kl.<input type='time' class='rv-p-fra' value='" + (r ? kl(r.start) : "14:00") + "'></label>" +
      "<label>Til kl.<input type='time' class='rv-p-til' value='" + (r && r.slut ? kl(r.slut) : "15:00") + "'></label>" +
      "<label>Værter<input class='rv-p-vaerter' maxlength='200' value='" + esc(r ? r.vaerter || "" : mig()) + "'></label>" +
      "<label class='rv-bred'>📝 Næste emne / noter<textarea class='rv-p-emne' maxlength='1000' rows='2' placeholder='Hvad skal I snakke om?'>" + esc(r ? r.emne || "" : "") + "</textarea></label></div>" +
      "<div class='rv-raekke'><button class='rv-p-gem'>" + (r ? "💾 Gem ændringer" : "➕ Opret programmet") + "</button>" + (r ? "<button class='rv-p-annuller'>Annullér</button>" : "") + "</div></section>" +
      "<section class='rv-boks'><h4>📅 Kommende udsendelser (" + kommende.length + ")</h4><ul class='rv-prog-liste'>" + (kommende.map(function (p) {
        const igang = p.start <= nu;
        return "<li" + (igang ? " class='igang'" : "") + "><div class='rv-prog-hoved'><b>" + (igang ? "🔴 " : "") + esc(p.titel) + "</b><small>" + esc(dagTekst(p.start)) + (p.slut ? "–" + kl(p.slut) : "") +
          (p.vaerter ? " · 🎙 " + esc(p.vaerter) : "") + "</small>" + (p.om ? "<small>" + esc(p.om) + "</small>" : "") + "</div>" +
          "<label>📝 Næste emne<textarea data-p-emne='" + p.id + "' rows='2' maxlength='1000'>" + esc(p.emne || "") + "</textarea></label>" +
          "<div class='rv-raekke'><button class='rv-lille' data-p-gememne='" + p.id + "'>💾 Gem emne</button><button class='rv-lille' data-p-ret='" + p.id + "'>✏️ Ret</button>" +
          (!erLive() ? "<button class='rv-lille' data-p-live='" + p.id + "'>🔴 Gå live med det</button>" : "") +
          "<button class='rv-lille rv-roed' data-p-slet='" + p.id + "'>🗑</button></div></li>";
      }).join("") || "<li class='rv-tom'>Ingen kommende programmer. Opret et ovenfor.</li>") + "</ul>" +
      (gamle.length ? "<details><summary>Tidligere programmer (" + gamle.length + ")</summary><ul class='rv-liste'>" + gamle.map(function (p) {
        return "<li><span><b>" + esc(p.titel) + "</b> <small>" + esc(dagTekst(p.start)) + "</small></span><button class='rv-lille rv-roed' data-p-slet='" + p.id + "'>🗑</button></li>";
      }).join("") + "</ul></details>" : "") + "</section>";
    krop.appendChild(div);
    const tid = function (dato, k) { if (!dato || !k) return null; const p = dato.split("-"), t = k.split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]); };
    div.querySelector(".rv-p-gem").addEventListener("click", function () {
      const dato = div.querySelector(".rv-p-dato").value;
      const start = tid(dato, div.querySelector(".rv-p-fra").value);
      let slut = tid(dato, div.querySelector(".rv-p-til").value);
      if (start && slut && slut <= start) slut.setDate(slut.getDate() + 1);   // fx 23:00–01:00
      kald("hv_radio_program_gem", { p_token: token(), p_id: r ? r.id : null, p_titel: div.querySelector(".rv-p-titel").value, p_om: div.querySelector(".rv-p-om").value,
        p_start: start ? start.toISOString() : null, p_slut: slut ? slut.toISOString() : null, p_vaerter: div.querySelector(".rv-p-vaerter").value, p_emne: div.querySelector(".rv-p-emne").value })
        .then(function () { retProgram = null; visFejl(""); toast("🗓 Programmet er gemt"); return hentProgrammer(); }).then(function () { hent(); tegnPanelIgen(); })
        .catch(function (e) { visFejl(fejlTekst(e)); });
    });
    const an = div.querySelector(".rv-p-annuller"); if (an) an.addEventListener("click", function () { retProgram = null; tegnPanelIgen(); });
    const finder = function (id) { return programmer.find(function (p) { return p.id === id; }); };
    div.querySelectorAll("[data-p-gememne]").forEach(function (b) {
      b.addEventListener("click", function () {
        const p = finder(+b.dataset.pGememne);
        const emne = div.querySelector("[data-p-emne='" + p.id + "']").value;
        kald("hv_radio_program_gem", { p_token: token(), p_id: p.id, p_titel: p.titel, p_om: p.om, p_start: new Date(p.start).toISOString(),
          p_slut: p.slut ? new Date(p.slut).toISOString() : null, p_vaerter: p.vaerter, p_emne: emne })
          .then(function () { p.emne = emne; b.textContent = "✓ Gemt"; setTimeout(function () { if (b.isConnected) b.textContent = "💾 Gem emne"; }, 1500); hent(); })
          .catch(function (e) { visFejl(fejlTekst(e)); });
      });
    });
    div.querySelectorAll("[data-p-ret]").forEach(function (b) { b.addEventListener("click", function () { retProgram = +b.dataset.pRet; tegnPanelIgen(); const s = document.getElementById("rv-panel"); if (s) s.scrollIntoView(); }); });
    div.querySelectorAll("[data-p-live]").forEach(function (b) {
      b.addEventListener("click", function () {
        const p = finder(+b.dataset.pLive);
        styr("start_live", { titel: p.titel, emne: div.querySelector("[data-p-emne='" + p.id + "']").value || p.emne, vaerter: p.vaerter || mig(), program: p.id })
          .then(function () { underFane = "studie"; tegnPanelIgen(); toast("🔴 I er live med " + p.titel + "!"); if (!rvLytter) lyt(true); }).catch(function () {});
      });
    });
    div.querySelectorAll("[data-p-slet]").forEach(function (b) {
      b.addEventListener("click", function () { toKlik(b, function () { kald("hv_radio_program_slet", { p_token: token(), p_id: +b.dataset.pSlet }).then(hentProgrammer).then(function () { hent(); tegnPanelIgen(); }).catch(function (e) { visFejl(fejlTekst(e)); }); }); });
    });
  }

  // ----- 💾 Udsendelser -----
  function tegnUdsendelser(krop) {
    if (rvUdsendelser === null) { krop.innerHTML += "<p class='rv-lille-tekst'>Henter udsendelser …</p>"; hentUdsendelser().then(tegnPanelIgen); return; }
    const div = document.createElement("section");
    div.className = "rv-boks";
    div.innerHTML = "<h4>💾 Gemte udsendelser</h4><p class='rv-lille-tekst'>Når I slutter en live-udsendelse, bliver den gemt her. Alle kan høre den igen i appen Vera-radio under 📼 Gemte. " +
      "(Live-links bliver ikke gemt, kun sange, snak-klip og oplæst tekst.)</p><ul class='rv-liste'>" + (rvUdsendelser.map(function (u) {
        const i = rvGenbrug && rvGenbrug.u.id === u.id;
        return "<li><span><b>" + esc(u.titel || "Udsendelse") + "</b> <small>" + esc(dagTekst(u.start)) + (u.slut ? " · " + mmss((u.slut - u.start) / 1000) : "") +
          (u.vaerter ? " · 🎙 " + esc(u.vaerter) : "") + " · 👂 " + (u.lyttere || 0) + " lyttere</small>" + (u.emne ? "<br><small>" + esc(u.emne) + "</small>" : "") + "</span>" +
          "<button class='rv-lille' data-u-hoer='" + u.id + "'>" + (i ? "⏹ Stop" : "▶ Hør") + "</button><button class='rv-lille rv-roed' data-u-slet='" + u.id + "'>🗑</button></li>";
      }).join("") || "<li class='rv-tom'>Ingen gemte udsendelser endnu.</li>") + "</ul>";
    krop.appendChild(div);
    div.querySelectorAll("[data-u-hoer]").forEach(function (b) {
      b.addEventListener("click", function () { const id = +b.dataset.uHoer; if (rvGenbrug && rvGenbrug.u.id === id) stopGenbrug(); else startGenbrug(id); setTimeout(tegnPanelIgen, 500); });
    });
    div.querySelectorAll("[data-u-slet]").forEach(function (b) {
      b.addEventListener("click", function () { toKlik(b, function () { kald("hv_radio_udsendelse_slet", { p_token: token(), p_id: +b.dataset.uSlet }).then(hentUdsendelser).then(tegnPanelIgen).catch(function (e) { visFejl(fejlTekst(e)); }); }); });
    });
  }

  // ----- 📅 Vagtskema -----
  function tegnVagter(krop) {
    const div = document.createElement("section");
    div.className = "rv-boks";
    const vagter = typeof vsVagter !== "undefined" && Array.isArray(vsVagter) ? vsVagter.filter(function (v) {
      if (v.rolle !== RV_SKILT || v.syg) return false;
      const d = v.dato.split("-"); return new Date(+d[0], +d[1] - 1, +d[2], [6, 10, 14, 18, 22][v.slot] + 4).getTime() > Date.now();
    }).sort(function (a, b) { return a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : a.slot - b.slot; }) : [];
    const tider = ["06–10", "10–14", "14–18", "18–22", "22–02"];
    div.innerHTML = "<h4>📅 Radioværternes vagtskema</h4><p class='rv-lille-tekst'>Radioværterne har deres helt egen kategori 📻 i vagtskemaet. Skriv jer på de vagter, hvor I laver radio.</p>" +
      "<button class='rv-aabn-vagt'>📅 Åbn radio-vagtskemaet</button>" +
      "<h4>Næste radiovagter</h4><ul class='rv-liste'>" + (vagter.slice(0, 12).map(function (v) {
        const d = v.dato.split("-"), dt = new Date(+d[0], +d[1] - 1, +d[2]);
        return "<li><span><b>" + esc(v.navn) + "</b> <small>" + DAGE[dt.getDay()] + " " + dt.getDate() + ". " + MDR[dt.getMonth()] + " kl. " + tider[v.slot] + "</small></span></li>";
      }).join("") || "<li class='rv-tom'>Ingen radiovagter endnu.</li>") + "</ul>";
    krop.appendChild(div);
    div.querySelector(".rv-aabn-vagt").addEventListener("click", function () {
      try { vsKat = RV_SKILT; } catch (e) {}
      ejerFane = "vagtskema"; visFane();
    });
  }

  function opdaterPanel() {
    if (!panelAabent()) return;
    const s = document.querySelector("#rv-panel .rv-status");
    if (s) {
      const h = (erLive() ? "<span class='rv-onair-lille'>● ON AIR</span>" : "<span class='rv-off'>○ Off air</span>") +
        "<span>👂 " + (st ? st.lyttere || 0 : 0) + "</span>";
      if (s.innerHTML !== h) s.innerHTML = h;
    }
    if (underFane === "studie") opdaterStudie();
    if (rvUlaest) rvUlaest = 0;
  }
  // Tiderne (fx 1:23 / 3:05) tælles op hvert sekund
  function opdaterTider() {
    const s = st && st.spor;
    document.querySelectorAll("#rv-panel .rv-nu, #telefon .vr-nu").forEach(function (el) {
      const bar = el.querySelector(".vr-bar i"), t = el.querySelector(".vr-tid");
      if (!bar || !t) return;
      if (!s) { bar.style.width = "0%"; t.textContent = ""; return; }
      const p = pos();
      if (s.sek > 0) { bar.style.width = Math.min(100, p / s.sek * 100) + "%"; t.textContent = mmss(p) + " / " + mmss(s.sek); }
      else { bar.style.width = "100%"; t.textContent = "📡 Live · " + mmss(p); }
    });
  }
  function opdaterAlt() {
    opdaterKnap();
    opdaterPanel();
    opdaterApp();
    opdaterTider();
    if (typeof window.tlfOpdaterHjem === "function" && maaStyre()) {
      const tal = rvUlaest;
      if (tal !== opdaterAlt.tal) { opdaterAlt.tal = tal; window.tlfOpdaterHjem(); }
    }
  }


  // ---------------------------------------------------------------
  //  Udseende (vinrød, guld og creme)
  // ---------------------------------------------------------------
  const P = "#ejer-vindue #ejer-indhold#ejer-indhold #rv-panel";
  const css = [
    // knappen i hotellet
    "#radio-knap { position: fixed; left: 14px; bottom: 14px; z-index: 60; display: flex; align-items: center; gap: 6px; padding: 5px 10px 5px 5px;" +
    " background: linear-gradient(#8a2436, #5e1622); border: 2px solid #d9a441; border-radius: 999px; box-shadow: 0 4px 14px rgba(40,8,14,.45); color: #fbf1dc; font: 13px/1.2 system-ui, sans-serif; max-width: 380px; }",
    "#radio-knap button { all: unset; cursor: pointer; }",
    "#radio-knap .rk-spil { width: 30px; height: 30px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ffe08a, #d9a441 60%, #a8771f); color: #5e1622; display: grid; place-items: center; font-size: 14px; flex: none; box-shadow: inset 0 -2px 0 rgba(0,0,0,.2); }",
    "#radio-knap .rk-spil:hover { filter: brightness(1.1); }",
    "#radio-knap .rk-tekst { display: grid; grid-template-columns: auto auto; column-gap: 6px; min-width: 0; max-width: 250px; }",
    "#radio-knap .rk-tekst b { font-size: 12.5px; letter-spacing: .3px; color: #ffe7b0; }",
    "#radio-knap .rk-live { background: #e0283c; color: #fff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 6px; align-self: center; animation: rk-blink 1.4s infinite; }",
    "#radio-knap .rk-nu { grid-column: 1 / 3; font-size: 11.5px; opacity: .92; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    "#radio-knap .rk-vol { display: flex; align-items: center; gap: 2px; font-size: 13px; cursor: pointer; }",
    "#radio-knap .rk-vol input { width: 0; opacity: 0; transition: width .2s, opacity .2s; accent-color: #d9a441; }",
    "#radio-knap:hover .rk-vol input, #radio-knap .rk-vol:focus-within input { width: 70px; opacity: 1; }",
    "#radio-knap.lytter { box-shadow: 0 0 0 3px rgba(217,164,65,.35), 0 4px 14px rgba(40,8,14,.45); }",
    "#radio-knap.live { border-color: #ff6b7a; }",
    "@keyframes rk-blink { 50% { opacity: .45; } }",
    // appen på telefonen
    "#telefon .vr-app { background: linear-gradient(#2a0d14, #4a1622 60%, #2a0d14); color: #fbf1dc; padding: 8px 10px 14px; min-height: 100%; box-sizing: border-box; }",
    "#telefon .vr-faner { display: flex; gap: 4px; overflow-x: auto; margin-bottom: 10px; }",
    "#telefon .vr-faner button { flex: 1 0 auto; padding: 6px 8px; border-radius: 10px; border: 1px solid rgba(217,164,65,.5); background: rgba(255,255,255,.06); color: #ffe7b0; font-size: 11.5px; cursor: pointer; position: relative; }",
    "#telefon .vr-faner button.valgt { background: #d9a441; color: #4a1622; font-weight: 700; }",
    "#telefon .vr-faner button i { position: absolute; top: -5px; right: -3px; background: #e0283c; color: #fff; font-style: normal; font-size: 10px; border-radius: 8px; padding: 0 5px; }",
    "#telefon .vr-skilt { text-align: center; padding: 12px 8px; border-radius: 14px; background: rgba(0,0,0,.25); border: 1px solid rgba(217,164,65,.35); display: grid; gap: 3px; }",
    "#telefon .vr-skilt b { font-size: 16px; color: #ffe7b0; }",
    "#telefon .vr-skilt small { font-size: 11.5px; opacity: .85; }",
    "#telefon .vr-onair { justify-self: center; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 2px 9px; border-radius: 7px; background: #3a2a2e; color: #a08a8e; }",
    "#telefon .vr-skilt.live .vr-onair { background: #e0283c; color: #fff; box-shadow: 0 0 12px #e0283c; animation: rk-blink 1.6s infinite; }",
    "#telefon .vr-nu { margin-top: 10px; padding: 10px; border-radius: 12px; background: rgba(255,255,255,.07); display: grid; gap: 4px; }",
    "#telefon .vr-nu small { font-size: 10.5px; text-transform: uppercase; letter-spacing: .8px; opacity: .7; }",
    "#telefon .vr-nu b { font-size: 13.5px; }",
    "#telefon .vr-nu span { font-size: 11.5px; opacity: .85; }",
    ".vr-bar { height: 5px; border-radius: 3px; background: rgba(255,255,255,.15); overflow: hidden; }",
    ".vr-bar i { display: block; height: 100%; background: linear-gradient(90deg, #d9a441, #ffe08a); transition: width .9s linear; }",
    "#telefon .vr-knapper { display: flex; justify-content: center; align-items: center; gap: 14px; margin: 14px 0 6px; }",
    "#telefon .vr-knapper button { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(217,164,65,.6); background: rgba(255,255,255,.08); color: #ffe7b0; font-size: 17px; cursor: pointer; }",
    "#telefon .vr-knapper button.vr-stor { width: 62px; height: 62px; font-size: 24px; background: radial-gradient(circle at 35% 30%, #ffe08a, #d9a441 60%, #a8771f); color: #4a1622; border: none; box-shadow: 0 4px 12px rgba(0,0,0,.35); }",
    "#telefon .vr-lyttere { text-align: center; font-size: 12px; opacity: .85; margin: 4px 0; }",
    "#telefon .vr-vol { display: flex; align-items: center; gap: 6px; justify-content: center; font-size: 13px; margin: 6px 0; }",
    "#telefon .vr-vol input { flex: 1; max-width: 170px; accent-color: #d9a441; }",
    "#telefon .vr-info { font-size: 12px; text-align: center; opacity: .88; margin: 8px 4px; line-height: 1.4; }",
    "#telefon .vr-fejl { font-size: 12px; color: #ffb3bb; text-align: center; }",
    "#telefon .vr-knap-bred { display: block; width: 100%; margin: 8px 0; padding: 9px; border-radius: 12px; border: none; background: #d9a441; color: #4a1622; font-weight: 700; font-size: 13px; cursor: pointer; }",
    "#telefon .vr-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }",
    "#telefon .vr-liste li { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,.07); }",
    "#telefon .vr-li-tekst { flex: 1; display: grid; gap: 2px; min-width: 0; }",
    "#telefon .vr-li-tekst b { font-size: 13px; color: #ffe7b0; }",
    "#telefon .vr-li-tekst small { font-size: 11px; opacity: .8; }",
    "#telefon .vr-emne { color: #ffd98a; opacity: 1 !important; }",
    "#telefon .vr-lille { width: 34px; height: 34px; flex: none; border-radius: 50%; border: none; background: #d9a441; color: #4a1622; font-size: 14px; cursor: pointer; }",
    "#telefon .vr-kontakt { display: grid; justify-items: center; gap: 2px; margin: 4px 0 8px; }",
    "#telefon .vr-kontakt span { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; background: linear-gradient(#c23a4c, #5e1622); border: 2px solid #d9a441; }",
    "#telefon .vr-kontakt b { font-size: 15px; color: #ffe7b0; }",
    "#telefon .vr-kontakt small { font-size: 12px; opacity: .8; }",
    "#telefon .vr-chat { list-style: none; margin: 6px 0; padding: 0; display: grid; gap: 5px; max-height: 210px; overflow-y: auto; }",
    "#telefon .vr-chat li { justify-self: end; max-width: 85%; background: #d9a441; color: #3a1018; padding: 6px 10px; border-radius: 14px 14px 4px 14px; font-size: 12.5px; display: grid; }",
    "#telefon .vr-chat.vr-ind li { justify-self: start; background: rgba(255,255,255,.1); color: #fbf1dc; border-radius: 14px 14px 14px 4px; }",
    "#telefon .vr-chat li b { font-size: 11px; color: #ffd98a; }",
    "#telefon .vr-chat li small { font-size: 9.5px; opacity: .7; justify-self: end; }",
    "#telefon .vr-chat li.vr-tom { justify-self: stretch; background: none; color: #fbf1dc; opacity: .7; text-align: center; }",
    "#telefon .vr-app h4 { margin: 10px 0 4px; font-size: 12.5px; color: #ffe7b0; }",
    "#telefon .vr-skriv { display: flex; gap: 6px; margin-top: 6px; }",
    "#telefon .vr-skriv input { flex: 1; min-width: 0; padding: 8px 12px; border-radius: 18px; border: 1px solid rgba(217,164,65,.6); background: rgba(255,255,255,.95); color: #3a1018; font-size: 13px; }",
    "#telefon .vr-skriv button { padding: 0 14px; border-radius: 18px; border: none; background: #d9a441; color: #4a1622; font-weight: 700; cursor: pointer; }",
    "#telefon .vr-skriv button:disabled, #telefon .vr-skriv input:disabled { opacity: .5; cursor: default; }",
    "#telefon li.tlf-fast .tlf-fast-pin { font-size: 10px; }",
    // panelet
    P + " { color: #3a1018 !important; font-size: 13.5px; }",
    P + " .rv-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 14px; background: linear-gradient(120deg, #5e1622, #8a2436) !important; color: #fbf1dc !important; margin-bottom: 10px; }",
    P + " .rv-titel { display: flex; align-items: center; gap: 10px; }",
    P + " .rv-logo { font-size: 26px; }",
    P + " .rv-titel b { font-size: 17px; color: #ffe7b0 !important; display: block; }",
    P + " .rv-titel small { font-size: 12px; opacity: .85; color: #fbf1dc !important; }",
    P + " .rv-status { display: flex; gap: 10px; align-items: center; font-weight: 700; color: #fbf1dc !important; }",
    P + " .rv-onair-lille { background: #e0283c; color: #fff !important; padding: 3px 9px; border-radius: 7px; animation: rk-blink 1.6s infinite; }",
    P + " .rv-off { opacity: .75; }",
    P + " .rv-under { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }",
    P + " .rv-under button { padding: 6px 12px !important; border-radius: 999px !important; border: 1.5px solid #d9a441 !important; background: #fbf1dc !important; color: #5e1622 !important; font-weight: 600; cursor: pointer; box-shadow: none !important; }",
    P + " .rv-under button.valgt { background: #7a1f2e !important; color: #ffe7b0 !important; }",
    P + " .rv-fejl, " + P + " .rv-advarsel { background: #ffe1e4 !important; color: #8a1a28 !important; border: 1px solid #e0283c; padding: 8px 12px; border-radius: 10px; }",
    P + " .rv-studie { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 10px; }",
    P + " .rv-boks { background: #fbf6ea !important; border: 1.5px solid #e2c27a !important; border-radius: 14px; padding: 10px 14px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(94,22,34,.08); }",
    P + " .rv-studie .rv-boks { margin-bottom: 0; }",
    P + " .rv-boks h3, " + P + " .rv-boks h4, " + P + " .rv-boks h5 { margin: 4px 0 8px; color: #5e1622 !important; }",
    P + " .rv-boks h4 small { font-weight: 400; opacity: .7; }",
    P + " .rv-boks label { display: grid; gap: 3px; font-size: 12px; font-weight: 600; color: #5e1622 !important; margin-bottom: 6px; }",
    P + " .rv-boks label.rv-flueben { display: inline-flex; align-items: center; gap: 5px; font-weight: 500; margin: 0; }",
    P + " .rv-boks input:not([type=checkbox]):not([type=range]), " + P + " .rv-boks textarea, " + P + " .rv-boks select { padding: 6px 9px !important; border: 1.5px solid #d9b98a !important; border-radius: 9px !important; background: #fff !important; color: #3a1018 !important; font: inherit; font-weight: 400; box-sizing: border-box; width: 100%; }",
    P + " button { padding: 6px 12px !important; border-radius: 10px !important; border: none !important; background: #7a1f2e !important; color: #ffe7b0 !important; font-weight: 600 !important; cursor: pointer; box-shadow: none !important; text-shadow: none !important; }",
    P + " button:hover { filter: brightness(1.12); }",
    P + " button:disabled { opacity: .5; cursor: default; }",
    P + " button.rv-lille { padding: 3px 8px !important; font-size: 12px !important; background: #d9a441 !important; color: #4a1622 !important; }",
    P + " button.rv-roed, " + P + " .rv-lille.rv-roed { background: #c0283a !important; color: #fff !important; }",
    P + " button.rv-sikker { background: #e0283c !important; color: #fff !important; }",
    P + " button.til { background: #2f7d4a !important; color: #fff !important; }",
    P + " .rv-under button { font-size: 13px !important; }",
    P + " .rv-raekke { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 6px 0; }",
    P + " .rv-raekke input { flex: 1; min-width: 140px; width: auto !important; }",
    P + " .rv-gitter { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0 10px; }",
    P + " .rv-gitter .rv-bred { grid-column: 1 / -1; }",
    P + " .rv-live-boks.er-live { background: linear-gradient(#fff0f1, #fbf6ea) !important; border-color: #e0283c !important; }",
    P + " .rv-onair { display: inline-block; background: #e0283c; color: #fff !important; font-weight: 800; letter-spacing: 1.5px; padding: 3px 12px; border-radius: 8px; box-shadow: 0 0 14px rgba(224,40,60,.6); animation: rk-blink 1.6s infinite; }",
    P + " .rv-onair.slukket { background: #4a3a3e; box-shadow: none; animation: none; color: #cbb !important; }",
    P + " .rv-start { width: 100%; padding: 10px !important; font-size: 15px !important; background: #e0283c !important; color: #fff !important; }",
    P + " .rv-nu b { font-size: 14px; }",
    P + " .rv-nu .vr-bar { background: #ead8b8; margin: 6px 0 3px; }",
    P + " .rv-nu .vr-tid { font-size: 12px; opacity: .75; }",
    P + " .rv-pauset { background: #d9a441; color: #4a1622 !important; font-size: 11px; padding: 1px 7px; border-radius: 6px; }",
    P + " .rv-ctrl { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }",
    P + " .rv-koe, " + P + " .rv-liste, " + P + " .rv-beskeder, " + P + " .rv-klip-liste, " + P + " .rv-prog-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; max-height: 320px; overflow-y: auto; }",
    P + " .rv-koe li, " + P + " .rv-liste li, " + P + " .rv-klip-liste li { display: flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 9px; background: #fff !important; border: 1px solid #efdfc0; }",
    P + " .rv-koe li > span, " + P + " .rv-liste li > span, " + P + " .rv-klip-liste li > span { flex: 1; min-width: 0; }",
    P + " .rv-liste li.valgt { border-color: #7a1f2e; background: #fff3cf !important; }",
    P + " small { color: #6b4a42 !important; }",
    P + " .rv-tom { opacity: .75; font-style: italic; background: none !important; border: none !important; }",
    P + " .rv-beskeder li { display: grid; padding: 6px 10px; border-radius: 10px; background: #fff !important; border-left: 4px solid #d9a441; }",
    P + " .rv-beskeder li b { color: #7a1f2e !important; font-size: 12px; }",
    P + " .rv-beskeder li small { justify-self: end; font-size: 10.5px; }",
    P + " .rv-stort-tal { font-size: 28px; color: #7a1f2e !important; margin-right: 4px; }",
    P + " .rv-navne { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }",
    P + " .rv-navne span { background: #fff3cf; border: 1px solid #e2c27a; border-radius: 999px; padding: 1px 9px; font-size: 12px; }",
    P + " .rv-snak-faner { display: flex; gap: 5px; margin-bottom: 8px; }",
    P + " .rv-snak-faner button { background: #fbf1dc !important; color: #5e1622 !important; border: 1.5px solid #d9a441 !important; }",
    P + " .rv-snak-faner button.valgt { background: #7a1f2e !important; color: #ffe7b0 !important; }",
    P + " .rv-optag.optager { background: #e0283c !important; color: #fff !important; animation: rk-blink 1.2s infinite; }",
    P + " .rv-optaget audio { width: 100%; margin: 6px 0; }",
    P + " .rv-lille-tekst { font-size: 12px; opacity: .85; margin: 4px 0 8px; line-height: 1.4; }",
    P + " .rv-pl { display: grid; grid-template-columns: minmax(240px, 1fr) minmax(260px, 1.3fr); gap: 10px; }",
    P + " .rv-pl-vaelg { all: unset; cursor: pointer; flex: 1; display: grid; color: #3a1018 !important; background: none !important; padding: 0 !important; }",
    P + " .rv-prog-liste li { display: grid; gap: 4px; padding: 8px 10px; border-radius: 10px; background: #fff !important; border: 1px solid #efdfc0; }",
    P + " .rv-prog-liste li.igang { border-color: #e0283c; }",
    P + " .rv-prog-hoved { display: grid; }",
    P + " .rv-prog-hoved b { color: #5e1622 !important; }",
    P + " details summary { cursor: pointer; margin: 8px 0 4px; font-weight: 600; color: #5e1622; }",
    "#ejer-faner .rv-tal { background: #e0283c; color: #fff; border-radius: 8px; padding: 0 6px; margin-left: 4px; font-size: 11px; }",
    // ▶️ skjult YouTube-afspiller
    "#rv-yt, .rv-yt-maal { position: fixed; left: -10000px; top: 0; width: 200px; height: 120px; overflow: hidden; pointer-events: none; opacity: 0; }",
    "#telefon .vr-skilt small.vr-mik { color: #ffd27a; font-weight: 700; opacity: 1; }",
    // 🔴 mikrofon live
    P + " .rv-yt-hurtig { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }",
    P + " .rv-yt-hurtig input { flex: 1 1 100%; min-width: 0; padding: 6px 9px !important; border: 1.5px solid #d9b98a !important; border-radius: 9px !important; background: #fff !important; color: #3a1018 !important; font: inherit; }",
    P + " .rv-mik-paa { display: flex; align-items: center; gap: 8px; color: #b3142a !important; font-size: 14px; margin-bottom: 6px; }",
    P + " .rv-mik-prik { width: 12px; height: 12px; border-radius: 50%; background: #e0283c; box-shadow: 0 0 10px #e0283c; animation: rk-blink 1.2s infinite; }",
    P + " .rv-mik-niveau { height: 10px; border-radius: 6px; background: #ead9b8; overflow: hidden; margin: 4px 0 8px; }",
    P + " .rv-mik-niveau i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, #d9a441, #e0283c); transition: width .1s; }",
    P + " button.rv-mik-taend { font-size: 15px !important; padding: 10px 16px !important; background: #e0283c !important; color: #fff !important; width: 100%; margin: 4px 0; }",
    // 📖 guide
    P + " .rv-guide ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }",
    P + " .rv-guide li { display: flex; gap: 10px; align-items: flex-start; background: #fff !important; border: 1px solid #ecd6a8; border-radius: 12px; padding: 8px 12px; }",
    P + " .rv-guide-ikon { font-size: 22px; line-height: 1; padding-top: 2px; }",
    P + " .rv-guide li b { color: #7a1f2e !important; font-size: 14px; }",
    P + " .rv-guide li p { margin: 3px 0 0; line-height: 1.45; }",
    P + " .rv-guide-start { margin-top: 10px; }",
  ];
  const stil = document.createElement("style");
  stil.id = "vera-radio-stil";
  stil.textContent = css.join("\n");
  document.head.appendChild(stil);
})();
