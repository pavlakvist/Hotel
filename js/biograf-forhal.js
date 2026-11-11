// =============================================================
//  🎬 Biografens forhal — her kommer man ind, før man går ind i salen.
//  - En rigtig forhal med kiosk (popcorn 🍿, sodavand 🥤 og slik 🍬 for 1 Glimt),
//    sodavandsskab, bland-selv-slik, plakater, billetpult og dobbeltdøre ind til salen.
//  - Når der er en film (fra 1 time før start), kan gæsterne først gå gennem dørene,
//    når en ansat har scannet billetten (📟 Billetscanner, js/vera-cinema.js).
//  - Gæster, der vælger Biografen i elevatoren eller navigatøren, kommer ind i forhallen først.
//    Ejeren og de ansatte kan stadig gå direkte ind i salen.
//  Møblerne er 3D-tegnet (realistiske), billederne ligger i billeder/moebler/real-forhal/.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
//  database-48-biograf-forhal.sql: kiosken trækker Glimt på serveren.
// =============================================================
(function () {
  "use strict";
  const RUM_ID = "bioforhal";
  const MAPPE = "billeder/moebler/real-forhal/";
  const SLIK_BILLEDE = "billeder/mad/slik.png";   // 4 billeder à 48x64: fuld pose, 1, 2 og 3 bid
  const PRIS = 1;

  function vent(test, gør, gange) {
    gange = gange || 0;
    let ok = false;
    try { ok = test(); } catch (e) { ok = false; }
    if (ok) { gør(); return; }
    if (gange < 240) setTimeout(function () { vent(test, gør, gange + 1); }, 250);
  }
  function mig() { try { return FIGUR.navn; } catch (e) { return ""; } }
  function personale() {
    try { return (typeof erAnsat === "function" && erAnsat(mig())) || (typeof EJERE !== "undefined" && EJERE.indexOf(mig()) >= 0); } catch (e) { return false; }
  }
  function online() { try { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); } catch (e) { return false; } }
  function iForhal() { return typeof rumValg !== "undefined" && rumValg === "vaerelse" && typeof aktivtVaerelse !== "undefined" && aktivtVaerelse === RUM_ID; }
  function sig(t) { try { besked.textContent = t; } catch (e) {} }
  function toastT(t) { try { if (typeof toast === "function") toast(t); } catch (e) {} }


  // ---------------------------------------------------------------
  //  🪑 Møblerne (3D-tegnet i dobbelt størrelse, skala 0.5)
  // ---------------------------------------------------------------
  const FH_TYPER = [
    { id: "bio-kiosk", navn: "Biografkiosk med popcorn og slik", felter: [3, 1] },
    { id: "bio-sodaskab", navn: "Sodavandsskab" },
    { id: "bio-slikvaeg", navn: "Bland-selv-slik", felter: [2, 1] },
    { id: "bio-saldoer", navn: "Dobbeltdøre til salen (SAL 1)", felter: [2, 1] },
    { id: "bio-billetpult", navn: "Billetpult med scanner" },
    { id: "bio-afspaerring", navn: "Afspærring med fløjlsreb", felter: [2, 1] },
    { id: "bio-plakat1", navn: "Filmplakat: Stjernenat" },
    { id: "bio-plakat2", navn: "Filmplakat: Sommer i København" },
  ];
  const FH_ANKRE = /*ANKRE*/{"bio-kiosk": [[476, 553], [284, 553], [476, 553], [284, 553]], "bio-sodaskab": [[160, 481], [160, 481], [160, 481], [160, 481]], "bio-slikvaeg": [[328, 482], [232, 482], [328, 482], [232, 482]], "bio-saldoer": [[308, 651], [212, 651], [308, 651], [212, 651]], "bio-billetpult": [[150, 350], [150, 350], [150, 350], [150, 350]], "bio-afspaerring": [[288, 328], [192, 328], [288, 328], [192, 328]], "bio-plakat1": [[150, 481], [150, 481], [150, 481], [150, 481]], "bio-plakat2": [[150, 481], [150, 481], [150, 481], [150, 481]]}/*SLUT*/;

  // retning 0 vender ned mod venstre, 1 ned mod højre
  const FH_MOEBLER = [
    // bagvæggen
    { type: "real-plante", x: 0, y: 0, retning: 0 },
    { type: "bio-slikvaeg", x: 1, y: 0, retning: 0 },
    { type: "bio-sodaskab", x: 3, y: 0, retning: 0 },
    { type: "bio-plakat1", x: 4, y: 0, retning: 0 },
    { type: "bio-saldoer", x: 5, y: 0, retning: 0 },
    { type: "bio-plakat2", x: 7, y: 0, retning: 0 },
    { type: "bio-billetpult", x: 7, y: 1, retning: 0 },
    { type: "real-gulvlampe", x: 8, y: 0, retning: 0 },
    { type: "real-sofa", x: 9, y: 0, retning: 0 },
    { type: "real-plante", x: 11, y: 0, retning: 0 },
    { type: "real-sofabord", x: 9, y: 2, retning: 0 },
    // kiosken på venstre væg
    { type: "bio-kiosk", x: 0, y: 2, retning: 1 },
    { type: "real-plante", x: 0, y: 9, retning: 0 },
    // køen hen til dørene
    { type: "bio-afspaerring", x: 4, y: 2, retning: 1 },
    { type: "bio-afspaerring", x: 7, y: 2, retning: 1 },
    // hyggekrog
    { type: "real-taeppe", x: 5, y: 6, retning: 0 },
    { type: "real-baenk", x: 9, y: 5, retning: 3 },
    { type: "real-baenk", x: 9, y: 8, retning: 3 },
    { type: "real-palme", x: 11, y: 9, retning: 0 },
  ];
  function fhSomData() {
    return FH_MOEBLER.filter(function (m) { return typeof MOEBEL_TYPER === "undefined" || MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
  }

  vent(function () {
    return typeof INDBYGGEDE_RUM !== "undefined" && typeof NAV_RUM !== "undefined" && typeof gaaTilVaerelse === "function" &&
      typeof MOEBEL_TYPER !== "undefined" && typeof vaerelseMoebler === "function" && typeof forberedRetninger === "function" &&
      typeof EJER_NAVNE !== "undefined" && typeof skiftRum === "function" && MOEBEL_TYPER["real-sofa"];
  }, function () {
    FH_TYPER.forEach(function (t) {
      if (MOEBEL_TYPER[t.id]) return;
      t.retninger = [0, 1, 2, 3].map(function (i) { return MAPPE + t.id + "-" + i + ".png"; });
      t.kategori = "Biograf";
      t.skala = 0.5; t.realistisk = true;
      if (FH_ANKRE[t.id]) t.ankre = FH_ANKRE[t.id];
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
    });

    INDBYGGEDE_RUM[RUM_ID] = { id: RUM_ID, navn: "Biografens forhal", ejer: EJER_NAVNE[0], bredde: 12, dybde: 10,
      vaeg: "#4a1a22", gulv1: "#7c1f2c", gulv2: "#6e1a26", vaegHoejde: 330, doer: null };

    // I navigatøren lige før Biografen
    if (!NAV_RUM.some(function (r) { return r.id === RUM_ID; })) {
      const bio = NAV_RUM.findIndex(function (r) { return r.id === "biograf"; });
      const ind = { id: RUM_ID, etage: "stue", navn: "Biografens forhal", om: "Popcorn, sodavand og slik 🍿 Få scannet din billet", billede: "billeder/rum/biograf.png",
        maks: 40, rum: "vaerelse", vaerelse: RUM_ID };
      NAV_RUM.splice(bio >= 0 ? bio : NAV_RUM.length, 0, ind);
    }

    // Møblerne: det, der er gemt på denne computer, ellers forhallens egne
    const vaerelseMoeblerFoerFh = vaerelseMoebler;
    vaerelseMoebler = function (id) {
      if (id === RUM_ID && typeof andreVaerelser !== "undefined" && !andreVaerelser[RUM_ID]) {
        let gemt = null;
        try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + RUM_ID) || "null"); } catch (e) {}
        andreVaerelser[RUM_ID] = (Array.isArray(gemt) && gemt.length ? gemt : fhSomData())
          .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
      }
      return vaerelseMoeblerFoerFh(id);
    };
    if (typeof serverKald === "function") {
      const serverKaldFoerFh = serverKald;
      serverKald = async function (funktion, data) {
        const svar = await serverKaldFoerFh(funktion, data);
        if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar[RUM_ID]) && svar[RUM_ID].length)) svar[RUM_ID] = fhSomData();
        return svar;
      };
    }

    // Gæster, der vil ind i Biografen, kommer ind i forhallen først
    let gennemDoeren = false;
    const gaaFoerFh = gaaTilVaerelse;
    gaaTilVaerelse = function (id) {
      if (id === "biograf" && !gennemDoeren && !personale() && !iForhal()) {
        gaaFoerFh(RUM_ID);
        setTimeout(function () { sig("🎬 Velkommen i Biografens forhal! Køb popcorn i kiosken, og gå gennem dørene SAL 1 ind i biografen."); }, 50);
        return;
      }
      gaaFoerFh(id);
    };
    window.fhGaaIndISalen = function () {
      gennemDoeren = true;
      try { gaaFoerFh("biograf"); } finally { gennemDoeren = false; }
      // stå lige inden for døren, nederst i salen
      try { if (typeof erIRummet === "function" && erIRummet(5, 13)) { figur.x = 5; figur.y = 13; figur.rute = []; } } catch (e) {}
    };

    // Velkomst
    const skiftRumFoerFh = skiftRum;
    skiftRum = function (navn) {
      skiftRumFoerFh(navn);
      if (iForhal()) {
        try { if (erIRummet(6, 8)) { figur.x = 6; figur.y = 8; } } catch (e) {}
        sig(personale()
          ? "🎬 Biografens forhal. Stil dig ved billetpulten og tryk 📟 Billetscanner for at scanne gæsternes billetter."
          : "🎬 Velkommen i Biografens forhal! Køb popcorn, sodavand eller slik i kiosken, og gå gennem dørene SAL 1 ind i biografen.");
      }
    };
  });


  // ---------------------------------------------------------------
  //  🍬 Slik i hånden (ligesom popcornen fra biografen)
  // ---------------------------------------------------------------
  vent(function () { return typeof MAD !== "undefined" && typeof giHaand === "function" && typeof tegnMad === "function"; }, function () {
    if (!MAD.slik) Object.defineProperty(MAD, "slik", { enumerable: false,
      value: { navn: "slik", hvad: "en pose slik", tegn: "🍬", raekke: 0, lyd: "Mums!", goer: "spiser", greb: 0.72 } });
    try {
      const h = JSON.parse(localStorage.getItem(MAD_NOEGLE) || "null");
      if (!minHaand && h && h.ting === "slik") minHaand = giHaand("slik", h.bid);
    } catch (e) {}
    const tegnMadFoerSlik = tegnMad;
    tegnMad = function (h, p, hoejde, side, sidder, valg) {
      if (!h || h.ting !== "slik") { tegnMadFoerSlik(h, p, hoejde, side, sidder, valg); return; }
      const madBillede = billeder[MAD_BILLEDE];
      billeder[MAD_BILLEDE] = hentBillede(SLIK_BILLEDE);
      try { tegnMadFoerSlik(h, p, hoejde, side, sidder, valg); } finally { if (madBillede) billeder[MAD_BILLEDE] = madBillede; else delete billeder[MAD_BILLEDE]; }
    };
    hentBillede(SLIK_BILLEDE);
  });


  // ---------------------------------------------------------------
  //  Klik på kiosken, slikvæggen, sodavandsskabet eller dørene
  // ---------------------------------------------------------------
  const KIOSK_TYPER = { "bio-kiosk": "alt", "bio-slikvaeg": "slik", "bio-sodaskab": "sodavand" };
  function erFhMoebel(m) { return !!m && (KIOSK_TYPER[m.type] || m.type === "bio-saldoer" || m.type === "bio-billetpult"); }

  function underMus(e) {
    const r = laerred.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
    let fundet = null;
    // først feltet, man klikker på
    try { const f = musTilFelt(e); const m = moebelPaa(f.x, f.y); if (erFhMoebel(m)) return m; } catch (e2) {}
    moeblerIRummet.forEach(function (m) {
      if (!erFhMoebel(m)) return;
      const t = MOEBEL_TYPER[m.type];
      const b = hentBillede(t.retninger[m.retning || 0]);
      if (!billedeKlar(b)) return;
      const s = t.skala || 1;
      const sted = moebelSted(t, m.x, m.y, drejetTvaers(m));
      const w = b.naturalWidth * s, h = b.naturalHeight * s;
      const venstre = sted.x - w / 2, top = sted.y + FLISE_H / 2 - h;
      const inde = sx >= venstre + w * 0.15 && sx <= venstre + w * 0.85 && sy >= top + h * 0.1 && sy <= top + h;
      if (inde && (!fundet || moebelDybde(m) > moebelDybde(fundet))) fundet = m;
    });
    return fundet;
  }
  // felterne foran møblet først, så ved siden af
  function pladser(m) {
    const f = moebelFelter(MOEBEL_TYPER[m.type], drejetTvaers(m));
    const r = m.retning || 0;
    const foran = [], andre = [];
    for (let i = 0; i < f[0]; i++) {
      (r === 0 ? foran : andre).push({ x: m.x + i, y: m.y + f[1] });
      (r === 2 ? foran : andre).push({ x: m.x + i, y: m.y - 1 });
    }
    for (let j = 0; j < f[1]; j++) {
      (r === 1 ? foran : andre).push({ x: m.x + f[0], y: m.y + j });
      (r === 3 ? foran : andre).push({ x: m.x - 1, y: m.y + j });
    }
    return m.type === "bio-saldoer" ? foran : foran.concat(andre);
  }
  let gaarTil = null;   // { m, x, y }
  function kigPaa(m) {
    const dx = m.x - figur.x, dy = m.y - figur.y;
    figur.vendt = dx - dy >= 0 ? 1 : -1;
    figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
    figur.forfra = dx + dy >= 0;
  }
  function fremme(m) {
    kigPaa(m);
    if (m.type === "bio-saldoer") { proevDoeren(); return; }
    if (m.type === "bio-billetpult") {
      if (personale() && typeof window.vcAabnScanner === "function") { window.vcAabnScanner(); return; }
      proevDoeren(true);
      return;
    }
    aabnKiosk(KIOSK_TYPER[m.type]);
  }
  function gaaHen(m) {
    if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
    const fig = figurFelt();
    const pl = pladser(m);
    if (pl.some(function (p) { return p.x === fig.x && p.y === fig.y; })) { fremme(m); return; }
    for (const p of pl) {
      if (!kanGaa(p.x, p.y)) continue;
      gaaTil(p.x, p.y);
      if (figur.rute.length > 0) { gaarTil = { m: m, x: p.x, y: p.y }; return; }
    }
    sig("Du kan ikke komme derhen. Der står noget i vejen.");
  }
  vent(function () { return typeof laerred !== "undefined" && typeof moebelSted === "function" && typeof gaaTil === "function"; }, function () {
    laerred.addEventListener("click", function (e) {
      if (!iForhal() || valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
      if (typeof byggerNu !== "undefined" && byggerNu) return;
      const m = underMus(e);
      if (!m) return;
      e.stopImmediatePropagation();
      valgtMoebel = m;
      try { opdaterPanel(); } catch (e2) {}
      gaaHen(m);
    }, true);
    setInterval(function () {
      const g = gaarTil;
      if (!g || figur.rute.length > 0) return;
      gaarTil = null;
      const fig = figurFelt();
      if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0 && iForhal()) fremme(g.m);
    }, 100);
  });


  // ---------------------------------------------------------------
  //  🚪 Dørene ind til salen
  // ---------------------------------------------------------------
  let venterPaaScan = false;
  function proevDoeren(kunTjek) {
    const t = typeof window.vcDoerTjek === "function" ? window.vcDoerTjek() : { ok: true };
    if (t.ok) {
      if (kunTjek && t.billet) { sig("✅ Din billet er scannet. Gå gennem dørene SAL 1 – din plads er " + t.billet.saede + "."); return; }
      if (kunTjek) { sig("🎟 Her ved billetpulten scanner de ansatte billetterne, når der er film. Lige nu kan du gå direkte ind i salen."); return; }
      sig("🚪 Dørene åbner …");
      if (typeof svaev === "function") try { svaev("🎬"); } catch (e) {}
      setTimeout(function () { if (iForhal()) window.fhGaaIndISalen(); }, 500);
      return;
    }
    sig(t.tekst);
    toastT(t.grund === "scan" ? "📟 Få din billet scannet ved billetpulten" : "🎟 Du skal have en billet");
    if (t.grund === "scan") {
      venterPaaScan = true;
      if (typeof window.vcHent === "function") window.vcHent();
    }
    if (t.grund === "billet" && typeof window.vcAabn === "function") {
      try { window.vcAabn(t.visning && t.visning.id); } catch (e) {}
    }
  }
  // Billetten er scannet: dørene åbner, og man går ind
  window.addEventListener("vc-scannet", function () {
    if (!iForhal()) return;
    sig("✅ Din billet er scannet! Dørene åbner – gå ind i salen.");
    try { if (typeof svaev === "function") svaev("✅"); } catch (e) {}
    if (venterPaaScan) {
      venterPaaScan = false;
      const d = moeblerIRummet.find(function (m) { return m.type === "bio-saldoer"; });
      if (d) setTimeout(function () { if (iForhal()) gaaHen(d); }, 900);
    }
  });


  // ---------------------------------------------------------------
  //  🍿 Kiosken
  // ---------------------------------------------------------------
  const VARER = [
    { id: "popcorn", navn: "Popcorn", tegn: "🍿", om: "Et stort bæger smørpopcorn" },
    { id: "sodavand", navn: "Sodavand", tegn: "🥤", om: "Kold sodavand fra skabet" },
    { id: "slik", navn: "Slik", tegn: "🍬", om: "En pose bland-selv-slik" },
  ];
  const kiosk = document.createElement("div");
  kiosk.id = "fh-kiosk";
  kiosk.hidden = true;
  const stil = document.createElement("style");
  stil.textContent = [
    "#fh-kiosk{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:60;width:min(420px,calc(100vw - 32px));",
    "background:linear-gradient(#3a0d16,#260810);border:2px solid #d4aa5a;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.55);",
    "color:#f6e7d0;font:14px system-ui,sans-serif;padding:12px 14px 14px}",
    "#fh-kiosk h3{margin:0 0 2px;font:700 18px Georgia,serif;color:#f0cd78;display:flex;justify-content:space-between;align-items:center}",
    "#fh-kiosk .fh-luk{background:none;border:0;color:#f0cd78;font-size:20px;cursor:pointer;padding:0 4px}",
    "#fh-kiosk .fh-under{font-size:12px;opacity:.8;margin-bottom:10px}",
    "#fh-kiosk .fh-varer{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}",
    "#fh-kiosk .fh-vare{background:#4a1220;border:1px solid #8a5a2a;border-radius:10px;color:#f6e7d0;padding:10px 6px;cursor:pointer;text-align:center;font:inherit}",
    "#fh-kiosk .fh-vare:hover{border-color:#f0cd78;background:#5a1828}",
    "#fh-kiosk .fh-vare.valgt{outline:2px solid #f0cd78}",
    "#fh-kiosk .fh-vare b{display:block;font-size:30px;line-height:1.1}",
    "#fh-kiosk .fh-vare span{display:block;font-weight:700;margin-top:4px}",
    "#fh-kiosk .fh-vare small{display:block;color:#f0cd78;margin-top:2px}",
    "#fh-kiosk .fh-svar{min-height:18px;margin-top:10px;font-size:13px;text-align:center}",
    "#fh-kiosk .fh-svar.fejl{color:#ff9a9a}",
  ].join("");
  document.head.appendChild(stil);
  document.body.appendChild(kiosk);
  let kioskTravl = false;
  function aabnKiosk(hvad) {
    const vis = VARER.filter(function (v) { return hvad === "alt" || v.id === hvad; });
    kiosk.innerHTML = '<h3>🍿 Kiosken <button class="fh-luk" title="Luk">✕</button></h3>' +
      '<div class="fh-under">Alt koster ' + PRIS + ' Glimt ⭐. Du får det i hånden.</div>' +
      '<div class="fh-varer" style="grid-template-columns:repeat(' + vis.length + ',1fr)">' +
      vis.map(function (v) { return '<button class="fh-vare" data-vare="' + v.id + '" title="' + v.om + '"><b>' + v.tegn + '</b><span>' + v.navn + '</span><small>' + PRIS + ' Glimt</small></button>'; }).join("") +
      '</div><div class="fh-svar"></div>';
    kiosk.hidden = false;
    kiosk.querySelector(".fh-luk").addEventListener("click", function () { kiosk.hidden = true; });
    kiosk.querySelectorAll("[data-vare]").forEach(function (k) {
      k.addEventListener("click", function () { koeb(k.dataset.vare, k); });
    });
  }
  function svar(t, fejl) {
    const el = kiosk.querySelector(".fh-svar");
    if (el) { el.textContent = t; el.classList.toggle("fejl", !!fejl); }
  }
  function giv(vare) {
    const v = VARER.find(function (x) { return x.id === vare; });
    try { if (typeof svaev === "function") svaev(v.tegn); } catch (e) {}
    setTimeout(function () {
      minHaand = giHaand(vare);
      gemHaand();
      sig("Du fik " + (vare === "popcorn" ? "et bæger popcorn 🍿" : vare === "sodavand" ? "en sodavand 🥤" : "en pose slik 🍬") + " Klik på en anden for at give det videre.");
    }, 500);
  }
  function koeb(vare, knap) {
    if (kioskTravl) return;
    if (typeof giHaand !== "function") { svar("Vent et øjeblik …", true); return; }
    if (!online()) {   // uden server (fx på din egen computer): gratis
      giv(vare); svar("Værsgo! " + VARER.find(function (x) { return x.id === vare; }).tegn);
      setTimeout(function () { kiosk.hidden = true; }, 900);
      return;
    }
    kioskTravl = true;
    knap.classList.add("valgt");
    svar("Et øjeblik …");
    try { if (typeof pengeSender !== "undefined") pengeSender = true; } catch (e) {}
    serverKald("hv_cinema_kiosk", { p_token: mitToken(), p_vare: vare }).then(function (s) {
      kioskTravl = false;
      try { pengeSender = false; } catch (e) {}
      try { if (s && typeof saetPenge === "function") saetPenge({ glimt: s.glimt, stella: s.stella }, false); } catch (e) {}
      giv(vare);
      svar("Værsgo! Det kostede " + PRIS + " Glimt ⭐");
      setTimeout(function () { kiosk.hidden = true; }, 1100);
    }).catch(function (e) {
      kioskTravl = false;
      try { pengeSender = false; } catch (e2) {}
      knap.classList.remove("valgt");
      let t = (e && (e.message || e.msg)) || "Det virkede ikke. Prøv igen.";
      if (/hv_cinema_kiosk/.test(t)) t = "Kiosken er ikke åbnet endnu (database-48 mangler).";
      svar(t, true);
    });
  }
  // Luk kiosken, når man går
  setInterval(function () {
    if (kiosk.hidden) return;
    if (!iForhal() || (figur && figur.rute && figur.rute.length > 0)) kiosk.hidden = true;
  }, 400);
})();
