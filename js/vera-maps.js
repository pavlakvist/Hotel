// =============================================================
//  🗺 Vera-maps — hotellets eget kort på telefonen
//  Hentes i App Butik på telefonen (gratis). Som et kort-program på en
//  rigtig telefon, bare for HELLO VERA:
//  - 🗺 Kort over hver etage med rummene, "Du er her" og hvor personalet er.
//  - 🏢 Etageoversigt, 🛏 Værelser (også lejlighederne med husnummer),
//    🛍 Butikker, 🏛 Offentlige rum og 👔 Medarbejdere.
//  - 🔍 Søg efter rum, butikker, husnumre (fx 304) og personer, der er online.
//  - 🧭 Rute: trin for trin, hvordan du kommer derhen – og "Start" kører dig derhen
//    med elevatoren.
//  - ⭐ Gem dine yndlingssteder.
//  Alt læses fra hotellets egne lister (etager og rum fra navigatøren, lejligheder,
//  ansatte og spillere online), så nye rum kommer automatisk med på kortet.
//  Ingen database nødvendig. Hentes fra js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.veraMapsKlar) return;
  window.veraMapsKlar = true;

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
  function erEjerNavn(n) { return typeof EJERE !== "undefined" && EJERE.indexOf(n) >= 0; }
  function g(navn) { try { return window[navn] !== undefined ? window[navn] : eval(navn); } catch (e) { return undefined; } }
  function liste(navn) { const l = g(navn); return Array.isArray(l) ? l : []; }
  function rens(t) { return String(t || "").replace(/\s*[🔒🔑]\s*$/, ""); }

  // Gemt for hver spiller: favoritter og seneste søgninger
  function noegle() { return "mit-hotel-vera-maps-" + mig(); }
  let gemt = { fav: [], senest: [] };
  function hentGemt() {
    try { const d = JSON.parse(localStorage.getItem(noegle()) || "{}"); gemt = { fav: d.fav || [], senest: d.senest || [] }; } catch (e) {}
  }
  function gem() { try { localStorage.setItem(noegle(), JSON.stringify(gemt)); } catch (e) {} }

  // ---------------------------------------------------------------
  //  Hotellets steder (læses friskt hver gang, så nye rum kommer med)
  // ---------------------------------------------------------------
  const BUTIK_IDS = ["cafe", "loppemarked"];
  const IKONER = {
    velkomsthallen: "🛎", biograf: "🎬", cafe: "☕", postkontor: "✉️", tagterrasse: "☀️", spillehjoernet: "🕹",
    laesehjoernet: "📚", loppemarked: "🧺", museum: "🏛", radio: "📻", mit: "🏠",
  };
  const FARVER = { offentlig: "#3f8fd2", butik: "#e0742c", vaerelse: "#8a5bd6", personale: "#c23a4c", lej: "#2f9e6e" };
  const TYPE_NAVN = { offentlig: "Offentligt rum", butik: "Butik", vaerelse: "Værelse", personale: "Kun for personale", lej: "Lejlighed" };

  function etager() {
    return liste("ETAGER").filter(function (e) { return e.id !== "hemmelig"; });
  }
  function etageAf(id) { return etager().find(function (e) { return e.id === id; }) || null; }
  function etageNavn(id) { const e = etageAf(id); return e ? e.navn : id === "hemmelig" ? "Den hemmelige etage" : ""; }
  function etageKort(e) {
    if (e.id === "stue") return "S";
    if (e.id === "sal1") return "1";
    if (e.id === "lej") return "🏢";
    if (e.id === "tag") return "T";
    if (e.id === "privat") return "🔑";
    return e.ikon || "•";
  }

  // Alle rum fra navigatøren som "steder" på kortet
  function rumSteder() {
    const ud = [];
    liste("NAV_RUM").forEach(function (r) {
      if (r.hemmelig || !r.etage) return;
      let etage = r.etage;
      if (r.id === "tagterrasse" && etageAf("tag")) etage = "tag";
      let type = "offentlig";
      if (r.id === "mit" || r.egetRum || etage === "privat") type = "vaerelse";
      else if (r.gang) type = "lej";
      else if (BUTIK_IDS.indexOf(r.id) >= 0 || /butik|shop|marked/i.test(r.id)) type = "butik";
      else if (r.id === "radio" || /kun for (radio|personale|ansatte)/i.test(r.om || "")) type = "personale";
      ud.push({ id: "rum:" + r.id, rumId: r.id, navn: rens(r.navn), om: r.om || "", etage: etage, type: type,
        ikon: IKONER[r.id] || (r.event ? "🎉" : r.gang ? "🚪" : type === "vaerelse" ? "🛏" : "📍"),
        billede: r.billede, maks: r.maks, nav: r });
    });
    return ud;
  }
  // Butikker, der ikke er et rum, men åbnes fra telefonen eller bjælken
  function onlineButikker() {
    const ud = [];
    if (document.getElementById("chat-shop-knap")) ud.push({ id: "btk:shop", navn: "Hotellets Shop", om: "Møbler, tøj og kæledyr 🛋", type: "butik", ikon: "🛍", online: true,
      aabn: function () { klik("chat-shop-knap"); } });
    if (document.getElementById("veksel-knap")) ud.push({ id: "btk:veksel", navn: "Vekselbørsen", om: "Byt Glimt og Stella 💱", type: "butik", ikon: "💱", online: true,
      aabn: function () { klik("veksel-knap"); } });
    return ud;
  }
  function klik(id) { const k = document.getElementById(id); if (k) k.click(); }

  // Lejlighederne (fra serveren via js/lejligheder.js)
  function lejSteder() {
    return liste("lejligheder").map(function (l) {
      const nr = l.sal * 100 + l.nr;
      return { id: "lej:" + l.id, navn: l.ejer + "s lejlighed", om: "🏠 Nr. " + nr + " · " + l.sal + ". sal, dør " + l.nr + (l.navn && l.navn !== l.ejer + "s lejlighed" ? " · " + l.navn : ""),
        etage: "lej", type: "lej", ikon: l.adgang === "laast" ? "🔒" : l.adgang === "kode" ? "🔑" : "🏠", lej: l, husnr: nr };
    });
  }
  function alleSteder() { return rumSteder().concat(onlineButikker(), lejSteder()); }
  function findSted(id) { return alleSteder().find(function (s) { return s.id === id; }) || null; }

  // ---------------------------------------------------------------
  //  Hvor er folk? (dig selv, spillere online og personalet)
  // ---------------------------------------------------------------
  // Et rum-id fra serveren (fx "hal", "cafe", "gang3", "Mia:mit", "lej:hjem-mia") → et sted
  function stedForRumId(rumId) {
    if (!rumId) return null;
    const rum = rumSteder();
    if (rumId === "hal") return rum.find(function (s) { return s.nav.rum === "hal"; }) || null;
    const direkte = rum.find(function (s) { return s.nav.vaerelse === rumId && !s.nav.egetRum && s.rumId !== "mit"; });
    if (direkte) return direkte;
    let ejer = null;
    let m = String(rumId).match(/^lej:hjem-(.+)$/);
    if (m) ejer = m[1];
    m = String(rumId).match(/^(.+):mit$/);
    if (m) ejer = m[1];
    if (ejer) {
      const l = lejSteder().find(function (s) { return s.lej.ejer.toLowerCase() === ejer.toLowerCase(); });
      if (l) return l;
    }
    return { id: "privat", navn: "Et privat værelse", om: "", etage: "privat", type: "vaerelse", ikon: "🛏", privat: true };
  }
  function mitRum() {
    try { if (typeof mitRumId === "function") return mitRumId(); } catch (e) {}
    try { return rumValg === "hal" ? "hal" : aktivtVaerelse; } catch (e) { return null; }
  }
  function mitSted() {
    try {
      if (rumValg === "vaerelse") {
        const r = rumSteder().find(function (s) { return s.nav.vaerelse === aktivtVaerelse; });
        if (r) return r;
      }
    } catch (e) {}
    return stedForRumId(mitRum());
  }
  // Spillere online: { navn, rumId, sover }
  function online() {
    const ud = [];
    const andre = g("ANDRE_SPILLERE") || {};
    Object.keys(andre).forEach(function (n) { ud.push({ navn: n, rumId: andre[n].rumId, sover: !!andre[n].sover }); });
    if (mig()) ud.push({ navn: mig(), rumId: mitRum(), mig: true });
    return ud;
  }
  function personerI(sted) {
    if (!sted) return [];
    return online().filter(function (p) { const s = p.mig ? mitSted() : stedForRumId(p.rumId); return s && s.id === sted.id; });
  }

  // Personalet: ejere + alle med et ansat-skilt
  const RANG = [["ejer", "👑 Ejer"], ["mod", "🛡️ MOD"], ["staff", "⭐ Staff"], ["eventvaert", "🎉 Eventvært"], ["radiovaert", "🎙 Radiovært"],
    ["bygmester", "🔨 Bygmester"], ["support", "🛠 Support"], ["hjaelper", "🙋 Hjælper"], ["content-creator", "🎥 Content creator"]];
  function rangAf(navn) {
    if (erEjerNavn(navn)) return "ejer";
    const a = g("ansatte") || {};
    return a[navn] || "";
  }
  function rangNavn(id) { const r = RANG.find(function (x) { return x[0] === id; }); return r ? r[1] : id; }
  function personale() {
    const a = g("ansatte") || {};
    const navne = {};
    (typeof EJER_NAVNE !== "undefined" ? EJER_NAVNE.slice(0, 1) : []).forEach(function (n) { navne[n] = 1; });
    Object.keys(a).forEach(function (n) {
      let ansat = false;
      try { ansat = typeof erAnsat === "function" ? erAnsat(n) : RANG.some(function (r) { return r[0] === a[n]; }); } catch (e) {}
      if (ansat || RANG.some(function (r) { return r[0] === a[n] && r[0] !== "ejer"; })) navne[n] = 1;
    });
    const on = {};
    online().forEach(function (p) { on[p.navn.toLowerCase()] = p; });
    return Object.keys(navne).map(function (n) {
      const p = on[n.toLowerCase()] || (erEjerNavn(mig()) && erEjerNavn(n) ? on[mig().toLowerCase()] : null);
      return { navn: p ? p.navn : n, rang: rangAf(n), online: !!p, sover: p && p.sover, sted: p ? (p.mig ? mitSted() : stedForRumId(p.rumId)) : null };
    }).sort(function (x, y) {
      const rx = RANG.findIndex(function (r) { return r[0] === x.rang; }), ry = RANG.findIndex(function (r) { return r[0] === y.rang; });
      return (y.online - x.online) || (rx - ry) || x.navn.localeCompare(y.navn);
    });
  }
  function skiltBillede(rang) {
    if (rang === "ejer") return "billeder/skilt-ejer.png";
    return "billeder/skilte/" + rang + ".png";
  }

  // ---------------------------------------------------------------
  //  Rute og "Start" (kør derhen)
  // ---------------------------------------------------------------
  function laastFor(s) {
    if (!s) return "";
    if (s.type === "personale" && !erEjerNavn(mig())) {
      const a = g("ansatte") || {};
      if (s.rumId === "radio" && a[mig()] !== "radiovaert") return "🔒 Kun for radioværter og ejeren";
    }
    try { if (s.nav && s.nav.vaerelse && typeof eventLaastFor === "function" && eventLaastFor(s.nav.vaerelse)) return "🔒 Låst lige nu – kun for personalet"; } catch (e) {}
    if (s.lej && !erEjerNavn(mig()) && s.lej.ejer !== mig()) {
      if (s.lej.adgang === "laast") return "🔒 Lejligheden er låst";
    }
    return "";
  }
  function rute(til) {
    const fra = mitSted();
    const trin = [];
    if (!til) return trin;
    if (fra && fra.id === til.id) { trin.push(["📍", "Du er her allerede"]); return trin; }
    if (til.online) { trin.push(["📱", "Åbnes direkte – du behøver ikke gå nogen steder"]); return trin; }
    trin.push(["🔵", "Start: " + (fra ? fra.navn + (fra.etage ? " · " + etageNavn(fra.etage) : "") : "Hvor du er")]);
    const samme = fra && fra.etage === til.etage && til.etage !== "privat";
    if (!samme) {
      trin.push(["🛗", "Gå hen til elevatoren"]);
      if (til.lej) trin.push(["⬆️", "Tryk 🏢 Lejlighederne og vælg " + til.lej.sal + ". sal"]);
      else trin.push(["⬆️", "Kør til " + (etageNavn(til.etage) || "etagen") + " (" + (etageAf(til.etage) ? etageKort(etageAf(til.etage)) : "?") + ")"]);
    } else {
      trin.push(["🚶", "Det er på samme etage – gå lige derhen"]);
    }
    if (til.lej) {
      trin.push(["🚪", "Find dør " + til.lej.nr + " på gangen (nr. " + til.husnr + ")"]);
      if (til.lej.adgang === "kode") trin.push(["🔑", "Skriv koden på døren"]);
      if (til.lej.adgang === "laast") trin.push(["🔔", "Lejligheden er låst – ring på dørklokken"]);
    } else {
      trin.push(["🏁", "Gå ind i " + til.navn]);
    }
    return trin;
  }
  function minutter(til) {
    const fra = mitSted();
    if (!fra || !til || fra.id === til.id || til.online) return "";
    return fra.etage === til.etage ? "ca. ½ min" : "ca. 1 min";
  }
  function gaaDerhen(s) {
    if (!s) return;
    if (s.online && s.aabn) { s.aabn(); return; }
    const l = laastFor(s);
    if (l && !(s.lej && s.lej.adgang === "laast")) { lille(l); return; }
    if (s.lej) {
      if (s.lej.adgang === "laast" && !erEjerNavn(mig()) && s.lej.ejer !== mig()) {
        lille("🔔 Låst – kør til gangen og ring på");
        koer(s.lej.sal ? { etage: "lej", navn: s.lej.sal + ". sal", nav: { rum: "vaerelse", vaerelse: "gang" + s.lej.sal } } : null);
        return;
      }
      if (typeof gaaIndLej === "function") { gaaIndLej(s.lej); lille("🚶 På vej til " + s.navn); }
      return;
    }
    if (s.privat) { lille("Det er et privat værelse"); return; }
    koer(s);
  }
  function koer(s) {
    if (!s || !s.nav) return;
    const r = s.nav;
    const fra = mitSted();
    const her = (r.rum === "hal" && rumValg === "hal") || (rumValg === "vaerelse" && aktivtVaerelse === r.vaerelse);
    if (her) { lille("📍 Du er her allerede"); return; }
    // Andre etage: kør med elevatoren (samme tur som i elevatoren) – ellers gå direkte
    if (fra && fra.etage !== s.etage && typeof koerTil === "function" && typeof elevEtager === "function") {
      try {
        const e = elevEtager().find(function (x) { return x.id === s.etage; }) || { id: s.etage, navn: etageNavn(s.etage), knap: "•" };
        koerTil(e, { navn: s.navn, rum: r.rum, vaerelse: r.vaerelse });
        lille("🛗 Elevatoren kører dig til " + s.navn);
        return;
      } catch (e) {}
    }
    if (r.vaerelse) gaaTilVaerelse(r.vaerelse);
    else if (r.rum && typeof skiftRum === "function") skiftRum(r.rum);
    lille("🚶 Du går til " + s.navn);
  }

  // ---------------------------------------------------------------
  //  Appen
  // ---------------------------------------------------------------
  const IKON = "<rect x='3' y='3' width='18' height='18' rx='4' fill='#e8f3e4'/>" +
    "<path d='M3 15.5 21 8.5' stroke='#fff' stroke-width='3.2'/><path d='M9 3v18' stroke='#fff' stroke-width='2.6'/>" +
    "<path d='M3 15.5 21 8.5' stroke='#f2c14e' stroke-width='1.3'/>" +
    "<path d='M15.5 4.2c-2.4 0-4.2 1.8-4.2 4.1 0 3 4.2 7.4 4.2 7.4s4.2-4.4 4.2-7.4c0-2.3-1.8-4.1-4.2-4.1z' fill='#e0445a' stroke='#fff' stroke-width='.9'/>" +
    "<circle cx='15.5' cy='8.3' r='1.5' fill='#fff'/>";
  let api = null, appEl = null;
  let fane = "kort";          // kort | etager | vaerelser | butikker | offentlig | personale | gemt
  let kortEtage = null;      // valgt etage på kortet
  let valgt = null;          // id på det valgte sted (kortet i bunden)
  let visRute = false;
  let soeg = "";
  let tick = null;
  let tilToppen = false;     // næste tegning starter øverst (fx når man trykker Find)
  let arkSidst = null;       // så kortet i bunden kun glider op, når det er nyt

  const APP = {
    navn: "Vera-maps", ikSvg: IKON, bg: "linear-gradient(#5cc98a, #1f8a6a)", butik: true,
    tekst: "Hotellets eget kort 🗺 Find etager, værelser, butikker, offentlige rum og personalet – og få rute derhen.",
    tegn: function (el, a) {
      api = a; appEl = el; hentGemt();
      if (!kortEtage) { const m = mitSted(); kortEtage = m && etageAf(m.etage) ? m.etage : "stue"; }
      tegn();
      clearInterval(tick);
      tick = setInterval(function () { if (api && api.appNu() === "maps") opdaterLevende(); else { clearInterval(tick); tick = null; } }, 3000);
    },
    luk: function () { clearInterval(tick); tick = null; api = null; appEl = null; },
  };
  function lille(t) { if (api && api.lille) api.lille(t); else if (typeof besked !== "undefined" && besked) besked.textContent = t; }

  function tegn() {
    if (!appEl || !api) return;
    const sc = appEl.querySelector(".tlf-indhold");
    const scroll = tilToppen ? 0 : sc ? sc.scrollTop : 0;
    tilToppen = false;
    appEl.innerHTML = api.top("Vera-maps") +
      "<div class='tlf-indhold vm-app'>" +
        "<div class='vm-soeg'><span>🔍</span><input id='vm-soeg' type='text' maxlength='40' placeholder='Søg rum, butik, nr. eller person' value='" + esc(soeg) + "'>" +
          (soeg ? "<button data-vm-ryd title='Ryd'>✕</button>" : "<b title='Det er dig'>" + esc((mig() || "?").charAt(0).toUpperCase()) + "</b>") + "</div>" +
        "<div class='vm-chips'>" + [["kort", "🗺 Kort"], ["etager", "🏢 Etager"], ["vaerelser", "🛏 Værelser"], ["butikker", "🛍 Butikker"],
          ["offentlig", "🏛 Offentlige rum"], ["personale", "👔 Medarbejdere"], ["gemt", "⭐ Gemt"]].map(function (c) {
          return "<button data-vm-fane='" + c[0] + "'" + (fane === c[0] && !soeg ? " class='valgt'" : "") + ">" + c[1] + "</button>";
        }).join("") + "</div>" +
        "<div class='vm-krop'></div>" +
      "</div>";
    const krop = appEl.querySelector(".vm-krop");
    if (soeg) tegnSoeg(krop);
    else if (fane === "kort") tegnKort(krop);
    else if (fane === "etager") tegnEtager(krop);
    else if (fane === "vaerelser") tegnVaerelser(krop);
    else if (fane === "butikker") tegnListe(krop, "🛍 Butikker", "Her kan du handle og hygge dig.", alleSteder().filter(function (s) { return s.type === "butik"; }));
    else if (fane === "offentlig") tegnListe(krop, "🏛 Offentlige rum", "Rum, hvor alle gæster er velkomne.", alleSteder().filter(function (s) { return s.type === "offentlig" || s.type === "personale"; }));
    else if (fane === "personale") tegnPersonale(krop);
    else if (fane === "gemt") tegnGemte(krop);
    if (valgt) tegnArk();
    lyt();
    const sc2 = appEl.querySelector(".tlf-indhold");
    if (sc2) sc2.scrollTop = scroll;
  }

  // ----- 🗺 Kortet over en etage -----
  function tegnKort(krop) {
    const ets = etager();
    if (!etageAf(kortEtage)) kortEtage = ets.length ? ets[0].id : "stue";
    const e = etageAf(kortEtage);
    const m = mitSted();
    krop.innerHTML = "<div class='vm-kort'>" + kortSvg(kortEtage) +
      "<div class='vm-etagevaelger'>" + ets.slice().reverse().map(function (x) {
        return "<button data-vm-etage='" + x.id + "' class='" + (x.id === kortEtage ? "valgt" : "") + (m && m.etage === x.id ? " her" : "") + "' title='" + esc(x.navn) + "'>" + etageKort(x) + "</button>";
      }).join("") + "</div>" +
      "<div class='vm-etikette'>" + (e ? (e.ikon || "") + " " + esc(e.navn) : "") + "</div>" +
      "<button class='vm-mig' data-vm-mig title='Vis hvor jeg er'>◎</button></div>" +
      "<div class='vm-forklaring'>" + ["offentlig", "butik", "vaerelse", "lej", "personale"].map(function (t) {
        return "<span><i style='background:" + FARVER[t] + "'></i>" + TYPE_NAVN[t] + "</span>";
      }).join("") + "<span><i class='mig'></i>Dig</span><span><i class='ansat'></i>Personale</span></div>" +
      "<div class='vm-overskrift'>På " + esc(e ? e.navn : "etagen") + "</div>" +
      stederPaaEtage(kortEtage).map(stedRaekke).join("");
    if (!stederPaaEtage(kortEtage).length) krop.innerHTML += "<p class='vm-tom'>Der er ingen rum på denne etage endnu.</p>";
  }
  function stederPaaEtage(id) {
    if (id === "lej") return lejSteder().sort(function (a, b) { return a.husnr - b.husnr; });
    return rumSteder().filter(function (s) { return s.etage === id; }).concat(id === "stue" ? onlineButikker() : []);
  }
  // Tegn etagen som et kort: gange, elevator og rum som blokke med nåle
  function kortSvg(id) {
    const W = 268, H = 210;
    let h = "<svg class='vm-svg' viewBox='0 0 " + W + " " + H + "' width='100%' preserveAspectRatio='xMidYMid meet'>" +
      "<defs><pattern id='vm-græs' width='8' height='8' patternUnits='userSpaceOnUse'><rect width='8' height='8' fill='#dcebd5'/><circle cx='2' cy='2' r='.7' fill='#c8dfbf'/><circle cx='6' cy='6' r='.7' fill='#c8dfbf'/></pattern>" +
      "<filter id='vm-skygge' x='-20%' y='-20%' width='140%' height='140%'><feDropShadow dx='0' dy='1.2' stdDeviation='1.2' flood-opacity='.25'/></filter></defs>" +
      "<rect width='" + W + "' height='" + H + "' fill='url(#vm-græs)'/>";
    const m = mitSted();
    const folk = online();
    const ansatte = {};
    personale().forEach(function (p) { if (p.online) ansatte[p.navn.toLowerCase()] = p; });
    if (id === "lej") return h + lejKortSvg(W, H, m) + "</svg>";
    if (id === "tag") h += "<rect x='0' y='0' width='" + W + "' height='" + H + "' fill='#bfe3f7'/><circle cx='230' cy='30' r='16' fill='#ffd65a'/>";
    // bygningen
    h += "<rect x='8' y='8' width='" + (W - 16) + "' height='" + (H - 16) + "' rx='10' fill='#f5efe2' stroke='#d6cbb3' stroke-width='1.5'/>";
    // gangen midt igennem + elevator
    h += "<rect x='8' y='" + (H / 2 - 9) + "' width='" + (W - 16) + "' height='18' fill='#ffffff'/>" +
      "<path d='M8 " + (H / 2) + "H" + (W - 8) + "' stroke='#f2c14e' stroke-width='1.4' stroke-dasharray='5 5'/>" +
      "<g filter='url(#vm-skygge)'><rect x='" + (W / 2 - 14) + "' y='" + (H / 2 - 13) + "' width='28' height='26' rx='5' fill='#7a1f2e'/></g>" +
      "<text x='" + (W / 2) + "' y='" + (H / 2 + 5) + "' text-anchor='middle' font-size='13'>🛗</text>";
    const steder = stederPaaEtage(id);
    const n = steder.length;
    if (!n) return h + "<text x='" + (W / 2) + "' y='50' text-anchor='middle' font-size='11' fill='#8a7f6a'>Ingen rum her endnu</text></svg>";
    // rummene fordeles over og under gangen
    const top = Math.ceil(n / 2), bund = n - top;
    steder.forEach(function (s, i) {
      const oppe = i < top, k = oppe ? i : i - top, ialt = oppe ? top : bund;
      const bw = (W - 24 - (ialt - 1) * 6) / ialt, bh = H / 2 - 24;
      const x = 12 + k * (bw + 6), y = oppe ? 12 : H / 2 + 12;
      const valgtHer = valgt === s.id;
      const farve = FARVER[s.type] || "#888";
      h += "<g class='vm-blok' data-vm-sted='" + esc(s.id) + "'>" +
        "<rect x='" + x + "' y='" + y + "' width='" + bw + "' height='" + bh + "' rx='6' fill='" + farve + "' fill-opacity='" + (valgtHer ? ".32" : ".16") + "' stroke='" + farve + "' stroke-width='" + (valgtHer ? 2.4 : 1.2) + "'/>" +
        // døren ud til gangen
        "<rect x='" + (x + bw / 2 - 6) + "' y='" + (oppe ? y + bh - 2 : y - 1) + "' width='12' height='3' rx='1' fill='#fff' stroke='" + farve + "' stroke-width='.8'/>" +
        "<text x='" + (x + bw / 2) + "' y='" + (y + bh / 2 + 1) + "' text-anchor='middle' font-size='" + (bw < 40 ? 13 : 16) + "'>" + s.ikon + "</text>" +
        "<text x='" + (x + bw / 2) + "' y='" + (y + bh - 8) + "' text-anchor='middle' font-size='" + (bw < 50 ? 6.5 : 8) + "' font-weight='600' fill='#3a3326'>" + esc(kortNavn(s.navn, bw)) + "</text>";
      // nål
      h += "<g transform='translate(" + (x + bw - 9) + "," + (y + 4) + ")'><path d='M0 9C-3 5-5 3.6-5 1.4-5-1.5-2.7-3.6 0-3.6S5-1.5 5 1.4C5 3.6 3 5 0 9z' transform='translate(0,3)' fill='" + farve + "' stroke='#fff' stroke-width='.8'/><circle cx='0' cy='4.3' r='1.6' fill='#fff'/></g>";
      // folk i rummet: Du er her + personale
      const her = folk.filter(function (p) { const st = p.mig ? m : stedForRumId(p.rumId); return st && st.id === s.id; });
      let dx = 0;
      her.forEach(function (p) {
        const px = x + 9 + dx, py = y + 9;
        if (p.mig) { h += "<circle class='vm-puls' cx='" + px + "' cy='" + py + "' r='7' fill='#3d8bfd' fill-opacity='.3'/><circle cx='" + px + "' cy='" + py + "' r='4.3' fill='#3d8bfd' stroke='#fff' stroke-width='1.6'/>"; dx += 11; }
        else if (ansatte[p.navn.toLowerCase()]) { h += "<circle cx='" + px + "' cy='" + py + "' r='5' fill='#c23a4c' stroke='#fff' stroke-width='1.3'/><text x='" + px + "' y='" + (py + 2.4) + "' text-anchor='middle' font-size='6' fill='#fff' font-weight='700'>" + esc(p.navn.charAt(0).toUpperCase()) + "</text>"; dx += 11; }
      });
      const andre = her.filter(function (p) { return !p.mig && !ansatte[p.navn.toLowerCase()]; }).length;
      if (andre) h += "<text x='" + (x + 6) + "' y='" + (y + bh - 18) + "' font-size='7' fill='#3a3326'>👤" + andre + "</text>";
      h += "</g>";
    });
    return h + "</svg>";
  }
  function kortNavn(t, bw) {
    const max = Math.max(5, Math.floor(bw / 5));
    t = t.replace(/^Hotellets /, "").replace(/^Den lille /, "");
    return t.length > max ? t.slice(0, max - 1) + "…" : t;
  }
  // Lejlighederne: sal 2–11, dør 1–10, som et højhus set forfra
  function lejKortSvg(W, H, m) {
    const sale = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const lej = lejSteder();
    const mitHus = lej.find(function (s) { return s.lej.ejer === mig(); });
    let h = "<rect x='20' y='6' width='" + (W - 40) + "' height='" + (H - 10) + "' rx='4' fill='#e9e1d0' stroke='#b9a98a' stroke-width='1.4'/>";
    const rh = (H - 22) / sale.length, dw = (W - 74) / 10;
    sale.forEach(function (sal, i) {
      const y = 12 + i * rh;
      h += "<text x='34' y='" + (y + rh / 2 + 3) + "' text-anchor='middle' font-size='7.5' font-weight='700' fill='#6b5a3e'>" + sal + "</text>";
      for (let nr = 1; nr <= 10; nr++) {
        const s = lej.find(function (x) { return x.lej.sal === sal && x.lej.nr === nr; });
        const x = 44 + (nr - 1) * dw;
        const minDoer = mitHus && s === mitHus, valgtHer = s && valgt === s.id;
        const fyld = !s ? "#fbf7ee" : minDoer ? "#3d8bfd" : s.lej.adgang === "laast" ? "#c9a0a6" : FARVER.lej;
        h += "<rect " + (s ? "class='vm-blok' data-vm-sted='" + esc(s.id) + "' " : "") + "x='" + (x + 1) + "' y='" + (y + 1.5) + "' width='" + (dw - 2) + "' height='" + (rh - 3) + "' rx='2' fill='" + fyld + "' stroke='" + (valgtHer ? "#1c1c1e" : "#cdbf9f") + "' stroke-width='" + (valgtHer ? 1.6 : .6) + "'><title>" + (s ? esc(s.navn + " · nr. " + s.husnr) : sal * 100 + nr + " · ledig") + "</title></rect>";
      }
    });
    h += "<text x='" + (W / 2) + "' y='" + (H - 0.5) + "' text-anchor='middle' font-size='6.5' fill='#6b5a3e'>dør 1 → 10 · tryk på en lejlighed</text>";
    return h;
  }

  // ----- Rækker og lister -----
  function stedRaekke(s) {
    const folk = personerI(s).length;
    const er = mitSted();
    const l = laastFor(s);
    const fav = gemt.fav.indexOf(s.id) >= 0;
    return "<button class='vm-raekke' data-vm-sted='" + esc(s.id) + "'><span class='vm-ik' style='background:" + (FARVER[s.type] || "#888") + "'>" + s.ikon + "</span>" +
      "<span class='vm-tekst'><b>" + esc(s.navn) + (fav ? " ⭐" : "") + "</b><small>" + esc(TYPE_NAVN[s.type] || "") + (s.online ? " · åbnes fra telefonen" : s.etage ? " · " + esc(etageNavn(s.etage)) : "") + "</small>" +
      (l ? "<em class='laast'>" + esc(l) + "</em>" : s.om ? "<em>" + esc(s.om) + "</em>" : "") + "</span>" +
      "<span class='vm-hoejre'>" + (er && er.id === s.id ? "<i class='vm-her'>Du er her</i>" : folk ? "<i>👤 " + folk + "</i>" : "") + "›</span></button>";
  }
  function tegnListe(krop, titel, under, steder) {
    krop.innerHTML = "<div class='vm-overskrift'>" + titel + "</div><p class='vm-under'>" + under + "</p>" +
      (steder.length ? steder.map(stedRaekke).join("") : "<p class='vm-tom'>Ingen endnu.</p>");
  }
  function tegnEtager(krop) {
    const m = mitSted();
    krop.innerHTML = "<div class='vm-overskrift'>🏢 Etageoversigt</div><p class='vm-under'>Tryk på en etage for at se den på kortet.</p>" +
      "<div class='vm-hus'>" + etager().slice().reverse().map(function (e) {
        const steder = stederPaaEtage(e.id).filter(function (s) { return !s.online; });
        const folk = online().filter(function (p) { const s = p.mig ? m : stedForRumId(p.rumId); return s && s.etage === e.id; }).length;
        return "<button class='vm-etage' data-vm-etage-vis='" + e.id + "'><span class='vm-nr'>" + etageKort(e) + "</span>" +
          "<span class='vm-tekst'><b>" + (e.ikon || "") + " " + esc(e.navn) + (m && m.etage === e.id ? " <i class='vm-her'>Du er her</i>" : "") + "</b>" +
          "<small>" + (e.id === "lej" ? steder.length + " lejlighed" + (steder.length === 1 ? "" : "er") + " · sal 2–11" : steder.map(function (s) { return s.navn; }).slice(0, 4).join(" · ") + (steder.length > 4 ? " …" : "") || "Ingen rum endnu") + "</small></span>" +
          "<span class='vm-hoejre'>" + (folk ? "<i>👤 " + folk + "</i>" : "") + "›</span></button>";
      }).join("") + "<div class='vm-kaelder'>🛗 Elevatoren kører til alle etager</div></div>";
  }
  function tegnVaerelser(krop) {
    const mine = rumSteder().filter(function (s) { return s.type === "vaerelse"; });
    const lej = lejSteder().sort(function (a, b) { return a.husnr - b.husnr; });
    krop.innerHTML = "<div class='vm-overskrift'>🔑 Mine rum</div>" + (mine.length ? mine.map(stedRaekke).join("") : "<p class='vm-tom'>Du har ingen rum endnu.</p>") +
      "<div class='vm-overskrift'>🏢 Lejlighederne</div><p class='vm-under'>Søg på et navn eller husnummer (fx 304) i søgefeltet.</p>" +
      (lej.length ? lej.map(stedRaekke).join("") : "<p class='vm-tom'>Lejlighederne vises, når du er logget ind på hotellets server.</p>");
  }
  function personRaekke(p) {
    return "<button class='vm-raekke vm-person' data-vm-person='" + esc(p.navn) + "'>" +
      "<span class='vm-skilt'><img src='" + skiltBillede(p.rang) + "' alt='' onerror=\"this.replaceWith(document.createTextNode('👔'))\"></span>" +
      "<span class='vm-tekst'><b>" + esc(p.navn) + (p.navn === mig() ? " (dig)" : "") + "</b><small>" + esc(rangNavn(p.rang)) + "</small>" +
      "<em>" + (p.online ? (p.sover ? "💤 Væk lige nu · " : "🟢 ") + (p.sted ? "📍 " + esc(p.sted.navn) + (p.sted.etage ? " · " + esc(etageNavn(p.sted.etage)) : "") : "Online") : "⚪ Offline") + "</em></span>" +
      "<span class='vm-hoejre'>" + (p.online && p.sted && !p.sted.privat ? "<i class='vm-find'>Find</i>" : "") + "›</span></button>";
  }
  function tegnPersonale(krop) {
    const alle = personale();
    const on = alle.filter(function (p) { return p.online; }).length;
    krop.innerHTML = "<div class='vm-overskrift'>👔 Medarbejdere</div><p class='vm-under'>" + on + " af " + alle.length + " er på hotellet lige nu. Tryk Find for at se, hvor de er.</p>" +
      RANG.map(function (r) {
        const l = alle.filter(function (p) { return p.rang === r[0]; });
        if (!l.length) return "";
        return "<div class='vm-gruppe'>" + r[1] + "</div>" + l.map(personRaekke).join("");
      }).join("") + (alle.length ? "" : "<p class='vm-tom'>Der er ingen ansatte endnu.</p>");
  }
  function tegnGemte(krop) {
    const s = gemt.fav.map(findSted).filter(Boolean);
    krop.innerHTML = "<div class='vm-overskrift'>⭐ Gemte steder</div><p class='vm-under'>Tryk ☆ Gem på et sted for at gemme det her.</p>" +
      (s.length ? s.map(stedRaekke).join("") : "<p class='vm-tom'>Du har ikke gemt nogen steder endnu.</p>");
  }
  function tegnSoeg(krop) {
    const q = soeg.trim().toLowerCase();
    const steder = alleSteder().filter(function (s) {
      return (s.navn + " " + s.om + " " + (TYPE_NAVN[s.type] || "") + " " + etageNavn(s.etage) + " " + (s.husnr || "")).toLowerCase().indexOf(q) >= 0;
    });
    const folk = online().filter(function (p) { return p.navn.toLowerCase().indexOf(q) >= 0; });
    const pers = personale();
    let h = "";
    if (folk.length) {
      h += "<div class='vm-overskrift'>👤 Personer online</div>" + folk.map(function (p) {
        const pe = pers.find(function (x) { return x.navn.toLowerCase() === p.navn.toLowerCase(); });
        if (pe) return personRaekke(pe);
        const st = p.mig ? mitSted() : stedForRumId(p.rumId);
        return "<button class='vm-raekke vm-person' data-vm-person='" + esc(p.navn) + "'><span class='vm-ik' style='background:#3d8bfd'>" + esc(p.navn.charAt(0).toUpperCase()) + "</span>" +
          "<span class='vm-tekst'><b>" + esc(p.navn) + (p.mig ? " (dig)" : "") + "</b><em>" + (p.sover ? "💤 " : "🟢 ") + (st ? "📍 " + esc(st.navn) : "Online") + "</em></span><span class='vm-hoejre'>" + (st && !st.privat ? "<i class='vm-find'>Find</i>" : "") + "›</span></button>";
      }).join("");
    }
    const offlinePers = pers.filter(function (p) { return !p.online && p.navn.toLowerCase().indexOf(q) >= 0; });
    if (offlinePers.length) h += "<div class='vm-overskrift'>👔 Personale</div>" + offlinePers.map(personRaekke).join("");
    if (steder.length) h += "<div class='vm-overskrift'>📍 Steder</div>" + steder.map(stedRaekke).join("");
    krop.innerHTML = h || "<p class='vm-tom'>Ingen resultater for “" + esc(soeg) + "”.</p>";
  }

  // ----- Kortet i bunden (som når man trykker på et sted) -----
  function tegnArk() {
    const s = findSted(valgt);
    const gl = appEl.querySelector(".vm-ark");
    if (gl) gl.remove();
    if (!s) { valgt = null; arkSidst = null; return; }
    const folk = personerI(s);
    const fav = gemt.fav.indexOf(s.id) >= 0;
    const l = laastFor(s);
    const er = mitSted(), her = er && er.id === s.id;
    const ark = document.createElement("div");
    ark.className = "vm-ark" + (arkSidst !== s.id ? " ny" : "");
    arkSidst = s.id;
    ark.innerHTML = "<div class='vm-greb'></div><button class='vm-luk' data-vm-luk title='Luk'>✕</button>" +
      "<div class='vm-ark-top'><span class='vm-ik stor' style='background:" + (FARVER[s.type] || "#888") + "'>" + s.ikon + "</span>" +
      "<span><b>" + esc(s.navn) + "</b><small>" + esc(TYPE_NAVN[s.type] || "") + (s.online ? " · åbnes fra telefonen" : s.etage ? " · " + esc(etageNavn(s.etage)) : "") + "</small></span></div>" +
      (s.om ? "<p class='vm-om'>" + esc(s.om) + "</p>" : "") +
      (l ? "<p class='vm-laast'>" + esc(l) + "</p>" : "") +
      (!s.online ? "<p class='vm-info'>" + (her ? "📍 <b>Du er her</b>" : "🧭 " + esc(minutter(s) || "")) + (s.maks ? " · 👤 " + folk.length + " / " + s.maks : folk.length ? " · 👤 " + folk.length + " her" : "") + "</p>" : "") +
      "<div class='vm-knapper'>" +
        (s.online ? "<button class='hoved' data-vm-gaa>🛍 Åbn</button>" : !her && !s.privat ? "<button data-vm-rute class='" + (visRute ? "valgt" : "") + "'>🧭 Rute</button><button class='hoved' data-vm-gaa>▶ Start</button>" : "") +
        "<button data-vm-fav>" + (fav ? "⭐ Gemt" : "☆ Gem") + "</button>" +
        (s.etage && !s.online ? "<button data-vm-vis-kort>🗺 Vis</button>" : "") +
      "</div>" +
      (visRute && !her && !s.online ? "<ol class='vm-rute'>" + rute(s).map(function (t) { return "<li><span>" + t[0] + "</span>" + esc(t[1]) + "</li>"; }).join("") + "</ol>" : "") +
      (folk.length ? "<div class='vm-folk'><small>Her lige nu</small>" + folk.map(function (p) {
        const r = rangAf(p.navn);
        return "<span class='" + (p.mig ? "mig" : RANG.some(function (x) { return x[0] === r; }) ? "ansat" : "") + "'>" + (p.mig ? "🔵 " : RANG.some(function (x) { return x[0] === r; }) ? "👔 " : "") + esc(p.navn) + "</span>";
      }).join("") + "</div>" : "");
    appEl.querySelector(".vm-app").appendChild(ark);
    ark.addEventListener("click", function (e) {
      if (e.target.closest("[data-vm-luk]")) { valgt = null; arkSidst = null; visRute = false; ark.remove(); if (fane === "kort") tegn(); return; }
      if (e.target.closest("[data-vm-rute]")) { visRute = !visRute; tegnArk(); return; }
      if (e.target.closest("[data-vm-gaa]")) { gaaDerhen(s); setTimeout(function () { if (appEl) tegn(); }, 600); return; }
      if (e.target.closest("[data-vm-fav]")) {
        const i = gemt.fav.indexOf(s.id);
        if (i >= 0) gemt.fav.splice(i, 1); else { gemt.fav.unshift(s.id); lille("⭐ " + s.navn + " er gemt"); }
        gem(); tegnArk(); return;
      }
      if (e.target.closest("[data-vm-vis-kort]")) { fane = "kort"; soeg = ""; kortEtage = s.etage; tegn(); return; }
    });
  }
  function vaelg(id) {
    if (valgt !== id) visRute = false;
    valgt = id;
    const s = findSted(id);
    if (fane === "kort" && s && s.etage && s.etage !== kortEtage && !s.online) kortEtage = s.etage;
    tegn();
  }

  // Opdater kortet hvert 3. sekund (folk flytter sig)
  function opdaterLevende() {
    if (!appEl) return;
    const felt = appEl.querySelector("#vm-soeg");
    if (felt && document.activeElement === felt) return;   // forstyr ikke, mens man skriver
    tegn();
  }

  function lyt() {
    const felt = appEl.querySelector("#vm-soeg");
    if (felt) {
      felt.addEventListener("input", function () {
        soeg = felt.value;
        const krop = appEl.querySelector(".vm-krop");
        appEl.querySelectorAll("[data-vm-fane]").forEach(function (b) { b.classList.toggle("valgt", !soeg && b.dataset.vmFane === fane); });
        const ryd = appEl.querySelector(".vm-soeg b, .vm-soeg button");
        if (soeg) tegnSoeg(krop); else tegn();
        if (!soeg) { const f2 = appEl.querySelector("#vm-soeg"); if (f2) f2.focus(); }
        void ryd;
      });
      felt.addEventListener("keydown", function (e) {
        e.stopPropagation();   // så figuren ikke går, mens man skriver
        if (e.key === "Enter" && soeg.trim()) {
          gemt.senest = [soeg.trim()].concat(gemt.senest.filter(function (x) { return x !== soeg.trim(); })).slice(0, 6);
          gem();
          const første = appEl.querySelector(".vm-krop [data-vm-sted], .vm-krop [data-vm-person]");
          if (første) første.click();
        }
      });
    }
    appEl.querySelector(".vm-app").addEventListener("click", function (e) {
      if (e.target.closest(".vm-ark")) return;
      const ryd = e.target.closest("[data-vm-ryd]");
      if (ryd) { soeg = ""; tegn(); return; }
      const f = e.target.closest("[data-vm-fane]");
      if (f) { fane = f.dataset.vmFane; soeg = ""; valgt = null; visRute = false; tegn(); return; }
      const et = e.target.closest("[data-vm-etage]");
      if (et) { kortEtage = et.dataset.vmEtage; valgt = null; tegn(); return; }
      const ev = e.target.closest("[data-vm-etage-vis]");
      if (ev) { fane = "kort"; kortEtage = ev.dataset.vmEtageVis; valgt = null; tegn(); return; }
      if (e.target.closest("[data-vm-mig]")) {
        const m = mitSted();
        fane = "kort"; soeg = "";
        if (m && etageAf(m.etage)) { kortEtage = m.etage; valgt = m.privat ? null : m.id; }
        tilToppen = true;
        tegn(); lille("📍 " + (m ? "Du er i " + m.navn : "Du er på hotellet"));
        return;
      }
      const st = e.target.closest("[data-vm-sted]");
      if (st) {
        if (soeg) { gemt.senest = [soeg.trim()].concat(gemt.senest.filter(function (x) { return x !== soeg.trim(); })).slice(0, 6); gem(); }
        if (soeg) { tilToppen = true; soeg = ""; fane = "kort"; }
        vaelg(st.dataset.vmSted); return;
      }
      const p = e.target.closest("[data-vm-person]");
      if (p) {
        const navn = p.dataset.vmPerson;
        const o = online().find(function (x) { return x.navn === navn; });
        const s = o ? (o.mig ? mitSted() : stedForRumId(o.rumId)) : null;
        if (!s) { lille("⚪ " + navn + " er ikke på hotellet lige nu"); return; }
        if (s.privat) { lille("🛏 " + navn + " er i et privat værelse"); return; }
        soeg = ""; fane = "kort";
        if (s.etage && etageAf(s.etage)) kortEtage = s.etage;
        lille("📍 " + navn + " er i " + s.navn);
        tilToppen = true;
        vaelg(s.id);
      }
    });
  }

  // ---------------------------------------------------------------
  //  Udseende
  // ---------------------------------------------------------------
  const stil = document.createElement("style");
  stil.id = "vera-maps-stil";
  stil.textContent = [
    "#telefon .vm-app { position: relative; background: #f4f6f2; color: #1c1c1e; padding: 8px 10px 16px; min-height: 100%; box-sizing: border-box; }",
    "#telefon .vm-soeg { display: flex; align-items: center; gap: 6px; background: #fff; border-radius: 22px; padding: 6px 6px 6px 12px; box-shadow: 0 2px 8px rgba(0,0,0,.14); }",
    "#telefon .vm-soeg span { font-size: 13px; }",
    "#telefon .vm-soeg input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 13px; color: #1c1c1e; padding: 3px 0; }",
    "#telefon .vm-soeg b { width: 24px; height: 24px; border-radius: 50%; background: #1f8a6a; color: #fff; display: grid; place-items: center; font-size: 12px; }",
    "#telefon .vm-soeg button { width: 24px; height: 24px; border-radius: 50%; border: 0; background: #e8e8ed; color: #555; cursor: pointer; font-size: 11px; padding: 0; }",
    "#telefon .vm-chips { display: flex; gap: 6px; overflow-x: auto; padding: 9px 1px 7px; scrollbar-width: none; }",
    "#telefon .vm-chips::-webkit-scrollbar { display: none; }",
    "#telefon .vm-chips button { flex: none; border: 1px solid #dadce0; background: #fff; color: #3c4043; border-radius: 16px; padding: 5px 10px; font-size: 11.5px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.06); }",
    "#telefon .vm-chips button.valgt { background: #d6f0e3; border-color: #1f8a6a; color: #135c46; font-weight: 600; }",
    "#telefon .vm-kort { position: relative; border-radius: 14px; overflow: hidden; background: #dcebd5; box-shadow: 0 1px 4px rgba(0,0,0,.15); }",
    "#telefon .vm-svg { display: block; }",
    "#telefon .vm-blok { cursor: pointer; }",
    "#telefon .vm-blok:hover rect:first-child { fill-opacity: .3; }",
    "#telefon .vm-puls { animation: vmPuls 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }",
    "@keyframes vmPuls { 0% { transform: scale(.6); opacity: .9 } 100% { transform: scale(1.8); opacity: 0 } }",
    "#telefon .vm-etagevaelger { position: absolute; right: 6px; top: 6px; display: flex; flex-direction: column; background: #fff; border-radius: 9px; box-shadow: 0 1px 5px rgba(0,0,0,.25); overflow: hidden; }",
    "#telefon .vm-etagevaelger button { width: 26px; height: 22px; border: 0; border-bottom: 1px solid #eee; background: #fff; font-size: 10.5px; font-weight: 700; color: #444; cursor: pointer; padding: 0; position: relative; }",
    "#telefon .vm-etagevaelger button.valgt { background: #1f8a6a; color: #fff; }",
    "#telefon .vm-etagevaelger button.her::after { content: ''; position: absolute; left: 2px; top: 50%; width: 4px; height: 4px; margin-top: -2px; border-radius: 50%; background: #3d8bfd; }",
    "#telefon .vm-etikette { position: absolute; left: 8px; bottom: 7px; background: rgba(255,255,255,.92); border-radius: 8px; padding: 2px 8px; font-size: 11px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.2); }",
    "#telefon .vm-mig { position: absolute; right: 6px; bottom: 6px; width: 28px; height: 28px; border-radius: 50%; border: 0; background: #fff; color: #3d8bfd; font-size: 16px; cursor: pointer; box-shadow: 0 1px 5px rgba(0,0,0,.25); padding: 0; }",
    "#telefon .vm-forklaring { display: flex; flex-wrap: wrap; gap: 3px 9px; margin: 7px 2px 2px; font-size: 9.5px; color: #555; }",
    "#telefon .vm-forklaring i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 3px; vertical-align: -1px; }",
    "#telefon .vm-forklaring i.mig { border-radius: 50%; background: #3d8bfd; } #telefon .vm-forklaring i.ansat { border-radius: 50%; background: #c23a4c; }",
    "#telefon .vm-overskrift { font-size: 13px; font-weight: 700; margin: 12px 2px 4px; }",
    "#telefon .vm-under { font-size: 11px; color: #6b6b70; margin: 0 2px 6px; }",
    "#telefon .vm-gruppe { font-size: 11px; font-weight: 700; color: #6b6b70; margin: 9px 2px 3px; text-transform: uppercase; letter-spacing: .3px; }",
    "#telefon .vm-tom { font-size: 12px; color: #8a8a8f; text-align: center; padding: 14px 6px; }",
    "#telefon .vm-raekke { display: flex; align-items: center; gap: 9px; width: 100%; text-align: left; background: #fff; border: 0; border-radius: 12px; padding: 8px 9px; margin: 0 0 5px; cursor: pointer; font: inherit; color: inherit; box-shadow: 0 1px 2px rgba(0,0,0,.06); }",
    "#telefon .vm-raekke:hover { background: #f0f7f3; }",
    "#telefon .vm-ik { flex: none; width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; font-size: 16px; color: #fff; font-weight: 700; }",
    "#telefon .vm-ik.stor { width: 42px; height: 42px; font-size: 21px; border-radius: 12px; }",
    "#telefon .vm-skilt { flex: none; width: 40px; height: 32px; display: grid; place-items: center; }",
    "#telefon .vm-skilt img { max-width: 40px; max-height: 30px; image-rendering: pixelated; }",
    "#telefon .vm-tekst { flex: 1; min-width: 0; display: flex; flex-direction: column; }",
    "#telefon .vm-tekst b { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    "#telefon .vm-tekst small { font-size: 10.5px; color: #6b6b70; }",
    "#telefon .vm-tekst em { font-style: normal; font-size: 10.5px; color: #3c4043; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    "#telefon .vm-tekst em.laast { color: #c23a4c; }",
    "#telefon .vm-hoejre { flex: none; color: #b0b0b5; font-size: 15px; display: flex; align-items: center; gap: 5px; }",
    "#telefon .vm-hoejre i { font-style: normal; font-size: 10px; color: #3c4043; background: #eef0f3; border-radius: 8px; padding: 1px 6px; }",
    "#telefon i.vm-her { font-style: normal; font-size: 9.5px; color: #fff; background: #3d8bfd; border-radius: 8px; padding: 1px 6px; font-weight: 600; }",
    "#telefon .vm-hoejre i.vm-find { background: #1f8a6a; color: #fff; font-weight: 600; }",
    "#telefon .vm-hus { background: #e9e1d0; border-radius: 14px; padding: 8px 7px 6px; border: 1.5px solid #cdbf9f; }",
    "#telefon .vm-etage { display: flex; align-items: center; gap: 9px; width: 100%; text-align: left; background: #fbf7ee; border: 1px solid #ddd0b4; border-radius: 9px; padding: 7px 8px; margin: 0 0 5px; cursor: pointer; font: inherit; color: inherit; }",
    "#telefon .vm-etage:hover { background: #fff; }",
    "#telefon .vm-nr { flex: none; width: 28px; height: 28px; border-radius: 50%; background: #7a1f2e; color: #f6dfa0; display: grid; place-items: center; font-weight: 700; font-size: 12px; box-shadow: inset 0 0 0 2px #d9a441; }",
    "#telefon .vm-kaelder { text-align: center; font-size: 10.5px; color: #6b5a3e; padding: 2px 0 1px; }",
    "#telefon .vm-ark { position: sticky; bottom: -16px; margin: 10px -10px -16px; background: #fff; border-radius: 18px 18px 0 0; padding: 6px 12px 14px; box-shadow: 0 -4px 18px rgba(0,0,0,.18); z-index: 3; padding-bottom: 30px; }",
    "#telefon .vm-ark.ny { animation: vmArk .25s cubic-bezier(.2,.9,.3,1); }",
    "@keyframes vmArk { from { transform: translateY(40px); opacity: 0 } to { transform: none; opacity: 1 } }",
    "#telefon .vm-greb { width: 34px; height: 4px; border-radius: 2px; background: #d0d0d5; margin: 0 auto 6px; }",
    "#telefon .vm-luk { position: absolute; right: 10px; top: 10px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: #eef0f3; color: #555; cursor: pointer; font-size: 11px; padding: 0; }",
    "#telefon .vm-ark-top { display: flex; align-items: center; gap: 10px; padding-right: 28px; }",
    "#telefon .vm-ark-top > span:last-child { display: flex; flex-direction: column; min-width: 0; }",
    "#telefon .vm-ark-top b { font-size: 15px; } #telefon .vm-ark-top small { font-size: 11px; color: #6b6b70; }",
    "#telefon .vm-om { font-size: 12px; margin: 7px 0 0; color: #3c4043; }",
    "#telefon .vm-info { font-size: 11.5px; margin: 4px 0 0; color: #1f8a6a; }",
    "#telefon .vm-laast { font-size: 11.5px; margin: 5px 0 0; color: #c23a4c; font-weight: 600; }",
    "#telefon .vm-knapper { display: flex; gap: 5px; margin-top: 9px; flex-wrap: wrap; }",
    "#telefon .vm-knapper button { flex: 1 0 auto; border: 1px solid #dadce0; background: #fff; color: #1f8a6a; border-radius: 16px; padding: 6px 8px; font-size: 11.5px; font-weight: 600; cursor: pointer; }",
    "#telefon .vm-knapper button.hoved { background: #1f8a6a; border-color: #1f8a6a; color: #fff; }",
    "#telefon .vm-knapper button.valgt { background: #d6f0e3; }",
    "#telefon .vm-rute { list-style: none; margin: 9px 0 0; padding: 0 0 0 6px; border-left: 3px dotted #3d8bfd; }",
    "#telefon .vm-rute li { font-size: 11.5px; padding: 3px 0 3px 4px; display: flex; gap: 6px; align-items: baseline; }",
    "#telefon .vm-rute li span { flex: none; width: 18px; text-align: center; }",
    "#telefon .vm-folk { margin-top: 9px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }",
    "#telefon .vm-folk small { width: 100%; font-size: 10px; color: #6b6b70; text-transform: uppercase; letter-spacing: .3px; }",
    "#telefon .vm-folk span { font-size: 11px; background: #eef0f3; border-radius: 10px; padding: 2px 8px; }",
    "#telefon .vm-folk span.mig { background: #dbe8ff; } #telefon .vm-folk span.ansat { background: #f6dde1; }",
  ].join("\n");
  document.head.appendChild(stil);

  // Læg appen i App Butik på telefonen
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () { window.tlfTilfoejApp("maps", APP); });
})();
