// =============================================================
//  🤖 Test-botter (kun for hotellets ejer)
//  Ejerpanel → ⚙️ System → 🤖 Test-botter
//
//  • Lav så mange botter, du vil (Bot-1, Bot-2 …). De står i dit rum, rundt om dig.
//  • Alle på hotellet kan se dem, ligesom rigtige spillere (med 🤖 foran navnet).
//  • Botterne kan: stå stille, gå rundt, eller jage lyset i 💡 Lysreaktion.
//    De kan også sige noget i chatten (og svare på quizzen med :S).
//  • 🖱 Flyt med klik: vælg en bot, og klik på et felt i rummet.
//  • 🗑 Slet en bot, eller 🗑 Slet alle botter. Listen viser ALTID alle botter,
//    også dem du laver senere, så du altid kan slette dem igen.
//
//  Sådan virker det: botterne er gemt på serveren, men det er DIN computer, der
//  "styrer" dem. Når du har hotellet åbent, er botterne online. Lukker du hotellet,
//  går de offline efter ca. 20 sekunder, og kommer igen, næste gang du åbner det.
//  Botter kan kun gå rundt / jage lyset, når du selv er i samme rum som dem.
//
//  Botter tæller ikke med som spillere online, i rum-tallet, i spillerlisterne
//  eller i økonomien, og de kan aldrig få Glimt, Stella, VIP eller gevinster
//  (det sørger serveren for).
//
//  Kræver database-59-test-botter.sql. Hentes fra js/panel-forklaring.js, så hotel.html ikke ændres.
// =============================================================
(function () {
  if (window.TEST_BOTTER_KOERER) return;
  window.TEST_BOTTER_KOERER = true;

  // -----------------------------------------------------------
  //  Er det en bot? (navnet Bot-1, Bot-2 … er kun til botter – serveren tjekker det)
  // -----------------------------------------------------------
  function erBot(navn) { return /^bot-\d+$/i.test(String(navn || "")); }
  window.erBot = erBot;

  // =============================================================
  //  1) For ALLE på hotellet: botter tæller ikke som rigtige spillere
  // =============================================================
  // 🟢 "X online" øverst
  if (typeof hvemErOnline === "function") {
    const hvemErOnlineFoerBot = hvemErOnline;
    hvemErOnline = function () { return hvemErOnlineFoerBot().filter(function (n) { return !erBot(n); }); };
  }
  // Tallet ved rummene i navigatøren og elevatoren
  if (typeof antalIRum === "function" && typeof navRumId === "function") {
    const antalIRumFoerBot = antalIRum;
    antalIRum = function (r) {
      const n = antalIRumFoerBot(r);
      const id = navRumId(r);
      if (!id || typeof ANDRE_SPILLERE === "undefined") return n;
      const botter = Object.values(ANDRE_SPILLERE).filter(function (g) { return g.rumId === id && erBot(g.navn); }).length;
      return Math.max(0, n - botter);
    };
  }
  // Spillerlisterne i panelerne (Spillere og konti, Ansættelse, Penge, Oversigt …)
  if (typeof alleSpillere === "function") {
    const alleSpillereFoerBot = alleSpillere;
    alleSpillere = function () { return alleSpillereFoerBot().filter(function (s) { return !erBot(s && s.navn); }); };
  }
  // 🤖 foran navnet i rummet, så ingen tror, det er en rigtig spiller
  if (typeof tegnNavneskilt === "function") {
    const tegnNavneskiltFoerBot = tegnNavneskilt;
    tegnNavneskilt = function (c, x, top, navn, mig) {
      return tegnNavneskiltFoerBot(c, x, top, erBot(navn) ? "🤖 " + navn : navn, mig);
    };
  }

  // =============================================================
  //  2) Kun for ejeren: styr botterne
  // =============================================================
  function r(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function token() { return typeof mitToken === "function" ? mitToken() : null; }
  function kanServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" && !!token(); }
  function mitNavn() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(mitNavn()) >= 0; }
  function mitRum() { try { return typeof mitRumId === "function" ? mitRumId() : null; } catch (e) { return null; } }
  function serverFejl(e) {
    const m = (e && e.message) || "";
    if (/hv_bot|Could not find the function|er_bot/i.test(m)) return "Test-botterne virker, når database-59-test-botter.sql er kørt i Supabase.";
    return m || "Serveren svarede ikke. Prøv igen.";
  }
  function rumNavn(id) {
    if (!id) return "?";
    if (id === "hal") return "Velkomsthallen";
    let navn = "";
    try { if (typeof vaerelseNavn === "function") navn = vaerelseNavn(id); } catch (e) {}
    if (!navn && typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[id]) navn = INDBYGGEDE_RUM[id].navn || "";
    if (!navn) navn = id.indexOf(":") > 0 ? id.split(":")[0] + "s rum" : id;
    return navn;
  }
  function kanGaaHer(x, y) { try { return typeof kanGaa === "function" && kanGaa(x, y); } catch (e) { return false; } }
  function minPlads() { try { return figurFelt(); } catch (e) { return { x: 2, y: 2 }; } }

  const FANE = "botter";
  const LYS_RUM = "lysreaktion";
  const ADFAERD = {
    staa: { ikon: "🧍", navn: "Stå stille" },
    gaa: { ikon: "🚶", navn: "Gå rundt" },
    lys: { ikon: "💡", navn: "Jag lyset" },
  };

  const botter = {};          // navn -> { navn, token, rum, x, y, retning, figur, vis, adfaerd, online, rute }
  let hentet = false, henter = false, fejl = "", besked = "";
  let sidstListe = "";

  function hentBotter() {
    if (henter || !erEjer() || !kanServer()) return Promise.resolve();
    henter = true;
    return serverKald("hv_bot_liste", { p_token: token() }).then(function (liste) {
      const navne = {};
      (liste || []).forEach(function (s) {
        navne[s.navn] = true;
        let b = botter[s.navn];
        const data = s.data || {};
        if (!b) {
          b = botter[s.navn] = { navn: s.navn, rum: s.rum || "hal", x: Math.round(s.x || 0), y: Math.round(s.y || 0),
            retning: s.retning || "ned", rute: [], sendt: 0 };
        }
        b.token = s.token;
        b.figur = s.figur;
        b.vis = data.vis !== false;
        b.adfaerd = ADFAERD[data.adfaerd] ? data.adfaerd : "staa";
        b.online = !!s.online;
      });
      Object.keys(botter).forEach(function (n) { if (!navne[n]) delete botter[n]; });
      hentet = true; fejl = "";
    }).catch(function (e) { fejl = serverFejl(e); })
      .then(function () { henter = false; opdaterFanen(); });
  }

  // -----------------------------------------------------------
  //  Botterne bevæger sig (kun når du er i samme rum som dem)
  // -----------------------------------------------------------
  function retningMod(dx, dy) {
    const lodret = dx + dy > 0.01 ? "ned" : dx + dy < -0.01 ? "op" : "";
    const vandret = dx - dy > 0.01 ? "hoejre" : dx - dy < -0.01 ? "venstre" : "";
    return lodret && vandret ? lodret + "-" + vandret : lodret || vandret || "";
  }
  function tagSkridt(b) {
    if (!b.rute.length) return false;
    const m = b.rute.shift();
    const ret = retningMod(m.x - b.x, m.y - b.y);
    if (ret) b.retning = ret;
    b.x = m.x; b.y = m.y;
    return true;
  }
  function ruteTil(b, x, y) {
    try { b.rute = typeof findRute === "function" ? findRute(b.x, b.y, x, y, false).slice(1) : []; } catch (e) { b.rute = []; }
  }
  function tilfaeldigtFelt(b, radius) {
    for (let i = 0; i < 12; i++) {
      const x = b.x + Math.round((Math.random() * 2 - 1) * radius), y = b.y + Math.round((Math.random() * 2 - 1) * radius);
      if ((x !== b.x || y !== b.y) && kanGaaHer(x, y)) return { x: x, y: y };
    }
    return null;
  }
  function gaaRundt(b, chance) {
    if (b.rute.length) return tagSkridt(b);
    if (Math.random() < chance) {
      const f = tilfaeldigtFelt(b, 4);
      if (f) ruteTil(b, f.x, f.y);
    }
    return tagSkridt(b);
  }
  function jagLyset(b) {
    const L = window.lysreaktion;
    const lys = L && L.hent ? L.hent() : null;
    if (!lys || lys.tilstand !== "spil") return gaaRundt(b, 0.12);
    // Er botten ude? Så går den ned til tilskuerne (ligesom rigtige spillere)
    if ((lys.ude || []).indexOf(b.navn) >= 0) {
      if (b.y >= 10) return tagSkridt(b);
      if (!b.rute.length) {
        const x = 2 + Math.floor(Math.random() * 10), y = 10 + Math.floor(Math.random() * 2);
        ruteTil(b, x, y);
        if (!b.rute.length) b.rute = [{ x: x, y: y }];
      }
      return tagSkridt(b);
    }
    // Spillet: N felter lyser. Den, der ikke når et ledigt felt, er ude.
    if (lys.fase !== "runde" || !lys.rstart || (lys.med || []).indexOf(b.navn) < 0) return b.rute.length ? tagSkridt(b) : false;
    const nu = L.nu ? L.nu() : Date.now();
    if (b.lysRunde !== lys.runde) {
      // ny runde: hver bot "opdager" lyset efter en tilfældig reaktionstid (nogle er for langsomme)
      b.lysRunde = lys.runde; b.lysSendt = ""; b.rute = [];
      b.lysVent = lys.rstart + 300 + Math.random() * 4500;
    }
    if (nu < b.lysVent) return false;
    const opt = lys.optaget || {};
    if (Object.keys(opt).some(function (k) { return opt[k] === b.navn; })) return false;   // har allerede et felt
    const ledige = (lys.felter || []).filter(function (f) { return !opt[f[0] + "," + f[1]]; });
    if (!ledige.length) return false;
    // står den på et ledigt felt? Så sig det til serveren
    const her = b.x + "," + b.y;
    if (!b.rute.length && ledige.some(function (f) { return f[0] === b.x && f[1] === b.y; })) {
      if (b.lysSendt !== lys.runde + "|" + her) {
        b.lysSendt = lys.runde + "|" + her;
        serverKald("hv_lys_ramt", { p_token: b.token, p_rum: LYS_RUM, p_runde: lys.runde, p_x: b.x, p_y: b.y }).catch(function () {});
      }
      return false;
    }
    // ellers: gå hen mod det nærmeste ledige felt
    const sidste = b.rute.length ? b.rute[b.rute.length - 1] : null;
    if (!sidste || opt[sidste.x + "," + sidste.y] || !ledige.some(function (f) { return f[0] === sidste.x && f[1] === sidste.y; })) {
      ledige.sort(function (a, c) { return Math.hypot(a[0] - b.x, a[1] - b.y) - Math.hypot(c[0] - b.x, c[1] - b.y); });
      const m = ledige[0];
      ruteTil(b, m[0], m[1]);
      if (!b.rute.length) b.rute = [{ x: m[0], y: m[1] }];   // ingen vej? så hop derhen (kun til test)
    }
    return tagSkridt(b);
  }

  let sidstPuls = 0, pulser = false;
  function bevaeg() {
    if (!erEjer() || !kanServer() || !hentet) return;
    const her = mitRum();
    let flyttet = false;
    Object.values(botter).forEach(function (b) {
      if (!b.vis || b.rum !== her) return;
      if (b.adfaerd === "gaa") flyttet = gaaRundt(b, 0.25) || flyttet;
      else if (b.adfaerd === "lys" && b.rum === LYS_RUM) flyttet = jagLyset(b) || flyttet;
      else if (b.adfaerd === "lys") flyttet = gaaRundt(b, 0.25) || flyttet;
    });
    const nu = Date.now();
    if ((flyttet || nu - sidstPuls > 4000) && !pulser) pulsNu();
  }
  function pulsNu() {
    const synlige = Object.values(botter).filter(function (b) { return b.vis; });
    sidstPuls = Date.now();
    if (!synlige.length) return Promise.resolve();
    pulser = true;
    return serverKald("hv_bot_puls", { p_token: token(), p_botter: synlige.map(function (b) {
      return { navn: b.navn, rum: b.rum, x: b.x, y: b.y, retning: b.retning };
    }) }).catch(function (e) { fejl = serverFejl(e); })
      .then(function () { pulser = false; });
  }
  setInterval(bevaeg, 600);
  setInterval(function () {
    if (!erEjer() || !kanServer()) return;
    if (fejl && !paaFanen()) return;   // fx hvis databasen ikke kender botter endnu: spørg kun, når fanen er åben
    hentBotter();
  }, 6000);
  setTimeout(hentBotter, 1500);

  // -----------------------------------------------------------
  //  Handlinger
  // -----------------------------------------------------------
  function felterOmkringMig(antal) {
    const mig = minPlads(), frie = [];
    for (let radius = 1; radius <= 6 && frie.length < antal; radius++) {
      for (let dx = -radius; dx <= radius; dx++) for (let dy = -radius; dy <= radius; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const x = mig.x + dx, y = mig.y + dy;
        if (kanGaaHer(x, y)) frie.push({ x: x, y: y });
      }
    }
    if (!frie.length) frie.push(mig);
    // bland dem, så botterne ikke står på række
    for (let i = frie.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = frie[i]; frie[i] = frie[j]; frie[j] = t; }
    const ud = [];
    for (let i = 0; i < antal; i++) ud.push(frie[i % frie.length]);
    return ud;
  }
  function lavFigur(udseende, i) {
    if (udseende === "mig" && typeof garderobe !== "undefined") { try { return JSON.parse(JSON.stringify(garderobe)); } catch (e) {} }
    const type = udseende === "pige" || udseende === "dreng" ? udseende : (i % 2 ? "dreng" : "pige");
    return { type: type, farver: { kvinde: {}, mand: {} }, frisure: {} };
  }

  function gaaIgang(tekst) { besked = tekst; opdaterFanen(true); }
  function faerdig(tekst) { besked = tekst; return hentBotter().then(function () { opdaterFanen(true); }); }

  function opret(antal, udseende) {
    antal = Math.max(1, Math.min(50, antal || 1));
    const rum = mitRum() || "hal";
    const felter = felterOmkringMig(antal);
    const liste = felter.map(function (f, i) { return { rum: rum, x: f.x, y: f.y, retning: "ned", figur: lavFigur(udseende, i) }; });
    gaaIgang("⏳ Laver " + antal + " bot" + (antal === 1 ? "" : "ter") + " …");
    return serverKald("hv_bot_opret", { p_token: token(), p_botter: liste })
      .then(function (n) { return faerdig("✅ " + n + " ny" + (n === 1 ? " bot" : "e botter") + " står nu i " + rumNavn(rum) + "."); })
      .then(pulsNu)
      .catch(function (e) { faerdig("⚠️ " + serverFejl(e)); });
  }
  function ret(navne, data, tekst) {
    gaaIgang("⏳ Gemmer …");
    return serverKald("hv_bot_ret", { p_token: token(), p_navne: navne, p_data: data })
      .then(function () { return faerdig(tekst || "✅ Gemt."); })
      .catch(function (e) { faerdig("⚠️ " + serverFejl(e)); });
  }
  function slet(navn) {
    gaaIgang("⏳ Sletter …");
    return serverKald("hv_bot_slet", { p_token: token(), p_navn: navn || "" }).then(function (n) {
      if (navn) delete botter[navn]; else Object.keys(botter).forEach(function (k) { delete botter[k]; });
      return faerdig(navn ? "🗑 " + navn + " er slettet." : "🗑 Alle botter er slettet (" + n + ").");
    }).catch(function (e) { faerdig("⚠️ " + serverFejl(e)); });
  }
  function hentHertil(navne) {
    const valgte = Object.values(botter).filter(function (b) { return !navne || navne.indexOf(b.navn) >= 0; });
    const rum = mitRum() || "hal";
    const felter = felterOmkringMig(valgte.length);
    valgte.forEach(function (b, i) { b.rum = rum; b.x = felter[i].x; b.y = felter[i].y; b.rute = []; b.lysRunde = null; });
    pulsNu().then(function () { faerdig("📍 " + (navne ? navne.join(", ") : "Alle botter") + " står nu i " + rumNavn(rum) + "."); });
  }
  function sig(navne, tekst) {
    tekst = String(tekst || "").trim();
    if (!tekst) return;
    const valgte = Object.values(botter).filter(function (b) { return b.vis && (!navne || navne.indexOf(b.navn) >= 0); });
    if (!valgte.length) { faerdig("Der er ingen synlige botter, der kan sige noget."); return; }
    const quiz = /^:s\s*/i.test(tekst);
    gaaIgang("⏳ " + valgte.length + " bot" + (valgte.length === 1 ? "" : "ter") + " siger det …");
    Promise.all(valgte.map(function (b, i) {
      return new Promise(function (ok) { setTimeout(ok, i * 150); }).then(function () {
        if (quiz) return serverKald("hv_quiz_svar", { p_token: b.token, p_runde: null, p_svar: tekst.replace(/^:s\s*/i, "") }).catch(function () {});
        return serverKald("hv_chat_send", { p_token: b.token, p_rum: b.rum, p_tekst: tekst, p_boble: null }).catch(function () {});
      });
    })).then(function () { faerdig(quiz ? "❓ Botterne har svaret på quizzen (de kan ikke vinde Glimt)." : "💬 Sagt i chatten."); });
  }

  // 🖱 Flyt en bot med et klik i rummet
  let flytBot = null;
  const flytSkilt = document.createElement("div");
  flytSkilt.id = "tb-flyt-skilt";
  flytSkilt.hidden = true;
  document.body.appendChild(flytSkilt);
  function startFlyt(navn) {
    flytBot = navn;
    flytSkilt.innerHTML = "🤖 Klik på et felt i rummet, hvor <b>" + r(navn) + "</b> skal stå. <button type='button'>Fortryd</button>";
    flytSkilt.hidden = false;
    flytSkilt.querySelector("button").addEventListener("click", stopFlyt);
    if (typeof ejerVindue !== "undefined") ejerVindue.hidden = true;
  }
  function stopFlyt() {
    flytBot = null;
    flytSkilt.hidden = true;
    if (typeof ejerVindue !== "undefined") { ejerVindue.hidden = false; ejerFane = FANE; visFane(); }
  }
  if (typeof laerred !== "undefined") {
    laerred.addEventListener("click", function (e) {
      if (!flytBot) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      let f = null;
      try { f = musTilFelt(e); } catch (x) {}
      const b = botter[flytBot];
      if (!b || !f || !(typeof erIRummet !== "function" || erIRummet(f.x, f.y))) {
        flytSkilt.innerHTML = "Det felt er ikke i rummet. Klik på gulvet. <button type='button'>Fortryd</button>";
        flytSkilt.querySelector("button").addEventListener("click", stopFlyt);
        return;
      }
      b.rum = mitRum() || b.rum; b.x = f.x; b.y = f.y; b.rute = []; b.lysRunde = null;
      const navn = flytBot;
      pulsNu();
      besked = "📍 " + navn + " står nu på feltet " + f.x + ", " + f.y + ".";
      stopFlyt();
    }, true);
  }
  window.addEventListener("keydown", function (e) { if (flytBot && e.key === "Escape") stopFlyt(); });

  // -----------------------------------------------------------
  //  Fanen i Ejerpanelet (lægger sig selv under ⚙️ System)
  // -----------------------------------------------------------
  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP[FANE] = { titel: "🤖 Test-botter",
    tekst: "Lav botter, der står i rummene som spillere, så du kan teste spil (fx Lysreaktion med mange spillere). Kun du kan se denne fane.",
    punkter: ["Stil dig i det rum, hvor botterne skal være, og tryk <b>➕ Lav botter</b>. De kommer rundt om dig.",
      "<b>🚶 Gå rundt</b> og <b>💡 Jag lyset</b> virker kun, når du selv er i samme rum som botterne.",
      "Botterne er online, så længe du har hotellet åbent. Lukker du det, går de offline og kommer igen næste gang.",
      "Botter tæller ikke som spillere og kan aldrig få Glimt, Stella, VIP eller gevinster.",
      "Du kan altid slette en bot med 🗑, eller alle botter med <b>🗑 Slet alle botter</b>."] };

  const fane = document.createElement("button");
  fane.type = "button";
  fane.dataset.fane = FANE;
  fane.textContent = "🤖 Test-botter";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); hentBotter(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (faner) faner.appendChild(fane);
  })();
  fane.hidden = !erEjer();
  setInterval(function () { fane.hidden = !erEjer(); }, 1000);

  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === FANE && erEjer(); }
  function skriverIPanelet() { return ejerIndhold.contains(document.activeElement) && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName); }
  function opdaterFanen(tving) {
    if (!paaFanen()) return;
    if (!tving && skriverIPanelet()) return;
    const nyListe = JSON.stringify(Object.values(botter).map(function (b) { return [b.navn, b.rum, b.vis, b.adfaerd, b.online]; })) + fejl + besked + hentet;
    if (!tving && nyListe === sidstListe) return;
    visFane();
  }
  // Online-prikkerne og rummene opdateres hvert 6. sekund, når listen hentes igen

  const huskAntal = { antal: 5, udseende: "blandet", tekst: "" };

  function visBotter() {
    const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
    ejerIndhold.innerHTML = "";
    if (hjaelp) ejerIndhold.appendChild(hjaelp);
    const sek = document.createElement("div");
    sek.className = "tb-panel";
    const alle = Object.values(botter);
    sidstListe = JSON.stringify(alle.map(function (b) { return [b.navn, b.rum, b.vis, b.adfaerd, b.online]; })) + fejl + besked + hentet;
    const her = mitRum();
    let html = "<div class='tb-top'><h3>🤖 Test-botter <small>kun for dig</small></h3><button type='button' id='tb-opdater'>🔄 Opdater</button></div>";
    if (!kanServer()) html += "<p class='ejer-info'>⚠️ Kræver, at du er logget ind på hotellets server.</p>";
    if (fejl) html += "<p class='ejer-info'>⚠️ " + r(fejl) + "</p>";
    if (besked) html += "<p class='tb-besked'>" + r(besked) + "</p>";

    // ➕ Lav nye
    html += "<div class='tb-kort'><h4>➕ Lav nye botter</h4><div class='tb-raekke'>" +
      "<label>Antal <input type='number' id='tb-antal' min='1' max='50' value='" + huskAntal.antal + "'></label>" +
      "<label>Udseende <select id='tb-udseende'>" +
      [["blandet", "Blandet (pige/dreng)"], ["pige", "Piger"], ["dreng", "Drenge"], ["mig", "Som mig"]].map(function (o) {
        return "<option value='" + o[0] + "'" + (o[0] === huskAntal.udseende ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") + "</select></label>" +
      "<button type='button' id='tb-lav' class='tb-guld'>➕ Lav botter</button></div>" +
      "<p class='tb-lille'>De kommer til at stå rundt om dig i <b>" + r(rumNavn(her)) + "</b>. Navnene bliver Bot-1, Bot-2 …</p></div>";

    // Alle botter på én gang
    if (alle.length) {
      const synlige = alle.filter(function (b) { return b.vis; }).length;
      const iRummet = alle.filter(function (b) { return b.rum === her; }).length;
      html += "<div class='tb-kort'><h4>👥 Alle botter (" + alle.length + ") · " + synlige + " synlige · " + iRummet + " i dit rum</h4><div class='tb-raekke'>" +
        "<button type='button' data-tb-alle='hent'>📍 Hent alle hertil</button>" +
        Object.keys(ADFAERD).map(function (k) { return "<button type='button' data-tb-alle='" + k + "'>" + ADFAERD[k].ikon + " Alle: " + ADFAERD[k].navn + "</button>"; }).join("") +
        "<button type='button' data-tb-alle='vis'>👀 Vis alle</button><button type='button' data-tb-alle='skjul'>🙈 Skjul alle</button></div>" +
        "<div class='tb-raekke'><input type='text' id='tb-tekst' maxlength='300' placeholder='Lad alle synlige botter sige noget … (:S 42 = svar på quizzen)' value='" + r(huskAntal.tekst) + "'>" +
        "<button type='button' id='tb-sig'>💬 Sig det</button></div>" +
        "<div class='tb-raekke tb-slet-alle'><button type='button' id='tb-slet-alle' class='tb-roed'>🗑 Slet alle botter</button></div></div>";

      // Hver bot for sig
      html += "<div class='tb-liste'>" + alle.map(function (b) {
        const status = !b.vis ? "<i class='tb-prik skjult'></i>Skjult" : b.online ? "<i class='tb-prik'></i>Online" : "<i class='tb-prik vent'></i>Kommer om lidt";
        return "<div class='tb-bot" + (b.vis ? "" : " tb-skjult") + "' data-tb-bot='" + r(b.navn) + "'>" +
          "<b class='tb-navn'>🤖 " + r(b.navn) + " <em class='tb-maerke'>BOT</em></b>" +
          "<small>" + status + " · " + r(rumNavn(b.rum)) + (b.rum === her ? " (her)" : "") + "</small>" +
          "<select data-tb='adfaerd'>" + Object.keys(ADFAERD).map(function (k) {
            return "<option value='" + k + "'" + (k === b.adfaerd ? " selected" : "") + ">" + ADFAERD[k].ikon + " " + ADFAERD[k].navn + "</option>";
          }).join("") + "</select>" +
          "<button type='button' data-tb='hent' title='Hent botten hen til dig'>📍 Hertil</button>" +
          "<button type='button' data-tb='flyt' title='Klik på et felt i rummet, hvor botten skal stå'>🖱 Flyt</button>" +
          "<button type='button' data-tb='vis'>" + (b.vis ? "🙈 Skjul" : "👀 Vis") + "</button>" +
          "<button type='button' data-tb='slet' class='tb-roed' title='Slet botten'>🗑</button></div>";
      }).join("") + "</div>";
    } else if (hentet) {
      html += "<p class='ejer-info'>Du har ingen botter lige nu.</p>";
    } else if (!fejl) {
      html += "<p class='ejer-info'>⏳ Henter …</p>";
    }
    sek.innerHTML = html;
    ejerIndhold.appendChild(sek);

    const $ = function (s) { return sek.querySelector(s); };
    $("#tb-opdater").addEventListener("click", function () { besked = ""; hentBotter(); });
    $("#tb-antal").addEventListener("input", function (e) { huskAntal.antal = parseInt(e.target.value, 10) || 1; });
    $("#tb-udseende").addEventListener("change", function (e) { huskAntal.udseende = e.target.value; });
    $("#tb-lav").addEventListener("click", function () {
      if (!kanServer()) return;
      opret(parseInt($("#tb-antal").value, 10) || 1, $("#tb-udseende").value);
    });
    sek.querySelectorAll("input").forEach(function (i) {
      i.addEventListener("keydown", function (e) {
        e.stopPropagation();   // så spillet ikke tror, du skriver i chatten
        if (e.key !== "Enter") return;
        if (i.id === "tb-antal") $("#tb-lav").click();
        if (i.id === "tb-tekst") $("#tb-sig").click();
      });
    });
    if (!alle.length) return;

    sek.querySelectorAll("[data-tb-alle]").forEach(function (k) {
      k.addEventListener("click", function () {
        const h = k.dataset.tbAlle;
        if (h === "hent") hentHertil(null);
        else if (h === "vis") ret(null, { vis: true }, "👀 Alle botter er synlige.");
        else if (h === "skjul") ret(null, { vis: false }, "🙈 Alle botter er skjult (offline). De er ikke slettet.");
        else {
          alle.forEach(function (b) { b.adfaerd = h; b.rute = []; });
          ret(null, { adfaerd: h }, ADFAERD[h].ikon + " Alle botter: " + ADFAERD[h].navn + "." + (h !== "staa" ? " (Virker, når du er i samme rum.)" : ""));
        }
      });
    });
    $("#tb-tekst").addEventListener("input", function (e) { huskAntal.tekst = e.target.value; });
    $("#tb-sig").addEventListener("click", function () { sig(null, $("#tb-tekst").value); huskAntal.tekst = ""; });
    $("#tb-slet-alle").addEventListener("click", function () {
      const k = this;
      if (!k.dataset.sikker) { k.dataset.sikker = "1"; k.textContent = "Er du sikker? Klik igen for at slette alle " + alle.length; return; }
      slet("");
    });
    sek.querySelectorAll("[data-tb-bot]").forEach(function (raekke) {
      const navn = raekke.dataset.tbBot;
      const b = botter[navn];
      raekke.querySelector("[data-tb='adfaerd']").addEventListener("change", function (e) {
        if (b) { b.adfaerd = e.target.value; b.rute = []; }
        ret([navn], { adfaerd: e.target.value }, ADFAERD[e.target.value].ikon + " " + navn + ": " + ADFAERD[e.target.value].navn + ".");
      });
      raekke.querySelector("[data-tb='hent']").addEventListener("click", function () { hentHertil([navn]); });
      raekke.querySelector("[data-tb='flyt']").addEventListener("click", function () { startFlyt(navn); });
      raekke.querySelector("[data-tb='vis']").addEventListener("click", function () {
        const vis = !(b && b.vis);
        if (b) b.vis = vis;
        ret([navn], { vis: vis }, vis ? "👀 " + navn + " er synlig igen." : "🙈 " + navn + " er skjult (offline). Den er ikke slettet.");
      });
      raekke.querySelector("[data-tb='slet']").addEventListener("click", function () {
        const k = this;
        if (!k.dataset.sikker) { k.dataset.sikker = "1"; k.textContent = "Slet?"; return; }
        slet(navn);
      });
    });
  }

  if (typeof visFane === "function") {
    const visFaneFoerBotter = visFane;
    visFane = function () {
      const min = ejerFane === FANE;
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerBotter();
      if (!min || ejerVindue.hidden || !erEjer()) return;
      visBotter();
    };
  }

  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    ".tb-panel { font-family: Verdana, sans-serif; color: #4a1320; }",
    ".tb-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }",
    ".tb-top h3 { margin: 4px 0 8px; } .tb-top h3 small { font-weight: normal; font-size: 11px; color: #8a6a3a; }",
    ".tb-kort { background: #fbf3df; border: 1px solid #d9b45a; border-radius: 10px; padding: 8px 10px; margin: 0 0 10px; }",
    ".tb-kort h4 { margin: 0 0 6px; font-size: 13px; }",
    ".tb-raekke { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 4px 0; }",
    ".tb-raekke label { font-size: 12px; display: flex; align-items: center; gap: 4px; }",
    ".tb-raekke input[type=number] { width: 60px; }",
    ".tb-raekke input[type=text] { flex: 1 1 220px; min-width: 0; padding: 4px 6px; }",
    ".tb-panel button { padding: 4px 9px; border-radius: 7px; border: 1px solid #b8901c; background: #fff8e6; color: #4a1320; cursor: pointer; font: 12px Verdana, sans-serif; }",
    ".tb-panel button:hover { background: #fff1c8; }",
    ".tb-panel button.tb-guld { background: linear-gradient(#e8c766, #c99a2e); font-weight: bold; }",
    ".tb-panel button.tb-roed { background: #fde3e3; border-color: #b33a3a; color: #8a1c1c; }",
    ".tb-panel button.tb-roed:hover { background: #f9caca; }",
    ".tb-slet-alle { justify-content: flex-end; }",
    ".tb-slet-alle button { font-weight: bold; }",
    ".tb-lille { margin: 4px 0 0; font-size: 11px; color: #7a5a3a; }",
    ".tb-besked { margin: 0 0 8px; padding: 6px 9px; border-radius: 8px; background: #f6e7c1; border-left: 3px solid #b8901c; font-size: 12px; }",
    ".tb-liste { display: flex; flex-direction: column; gap: 5px; }",
    ".tb-bot { display: grid; grid-template-columns: minmax(110px, 1fr) minmax(120px, 1.4fr) auto auto auto auto auto; align-items: center; gap: 6px;",
    "  padding: 5px 8px; border-radius: 8px; background: #fffaf0; border: 1px dashed #c9a24a; }",
    ".tb-bot.tb-skjult { opacity: .6; }",
    ".tb-bot small { font-size: 11px; color: #6a4a3a; }",
    ".tb-bot select { font-size: 12px; }",
    ".tb-maerke { font-style: normal; font-size: 9px; padding: 1px 4px; border-radius: 4px; background: #5a1726; color: #f6e7c1; vertical-align: middle; }",
    ".tb-prik { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3cb043; margin-right: 4px; vertical-align: middle; }",
    ".tb-prik.vent { background: #e0b12e; } .tb-prik.skjult { background: #999; }",
    "@media (max-width: 700px) { .tb-bot { grid-template-columns: 1fr 1fr; } }",
    "#ejer-vindue.moerkt .tb-panel { color: #f3e6c8; }",
    "#ejer-vindue.moerkt .tb-kort, #ejer-vindue.moerkt .tb-bot { background: #2a1a1e; border-color: #7a5a2a; }",
    "#ejer-vindue.moerkt .tb-bot small, #ejer-vindue.moerkt .tb-lille { color: #d8c49a; }",
    "#ejer-vindue.moerkt .tb-besked { background: #3a2a1a; color: #f3e6c8; }",
    "#ejer-vindue.moerkt .tb-panel button { background: #3a2228; color: #f3e6c8; border-color: #8a6a2a; }",
    "#tb-flyt-skilt { position: fixed; left: 50%; top: 64px; transform: translateX(-50%); z-index: 80; padding: 8px 14px; border-radius: 12px;",
    "  background: linear-gradient(#5a1726, #3a0d18); color: #f6e7c1; border: 2px solid #d9b45a; font: 13px Verdana, sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,.4); }",
    "#tb-flyt-skilt[hidden] { display: none; }",
    "#tb-flyt-skilt button { margin-left: 8px; padding: 3px 9px; border-radius: 7px; border: 1px solid #d9b45a; background: #f6e7c1; color: #4a1320; cursor: pointer; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
