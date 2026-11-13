// =============================================================
//  👑 VIP-medlemskab
//  - Bliv VIP for 1000 Glimt (eller 200 kr med rigtige penge, når det er slået til).
//    Man er VIP FOR EVIGT. Ejeren er altid VIP og har alt det, VIP har.
//  - VIP får: 👑 mærke og flot navn (ikon, farve, kant, effekt), velkomstgave,
//    ugens gave hver mandag og sjove VIP-kommandoer i chatten (fx :hjerter).
//  - Ejerpanel → Økonomi → 👑 VIP: se alle VIP'er, giv eller fjern VIP, se køb og gaver.
//  - Alt tjekkes på serveren (database-52-vip.sql), så ingen kan snyde sig til VIP.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.VIP_KLAR || !document.getElementById("glimt")) return;
  window.VIP_KLAR = true;

  const GLIMT_IKON = "<img class='vip-mini' src='billeder/glimt.png' alt=''>";
  const STELLA_IKON = "<img class='vip-mini' src='billeder/krystal.png' alt=''>";

  // Det man kan vælge til sit navn (serveren kender de samme effekter)
  const IKONER = ["👑", "💎", "⭐", "🌸", "🌹", "🦋", "🔥", "🌙", "☀️", "🍀", "🎀", "🐾", "🎵", "⚡", "❄️", "🍓", "🦄", "🐱", "🐶", "💖"];
  const FARVER = ["#7a1f2e", "#b0282e", "#c2185b", "#8e24aa", "#5e35b1", "#1e5aa8", "#00838f", "#2e7d32", "#b8860b", "#e65100", "#4e342e", "#222222"];
  const KANTER = ["#d9a441", "#ffd700", "#c0c0c0", "#e91e63", "#9c27b0", "#2196f3", "#26a69a", "#4caf50", "#ff7043", "#7a1f2e", "#000000", "#ffffff"];
  const EFFEKTER = [
    { id: "ingen", navn: "Ingen" },
    { id: "glimmer", navn: "✨ Glimmer" },
    { id: "regnbue", navn: "🌈 Regnbue" },
    { id: "hjerter", navn: "💕 Hjerter" },
    { id: "stjerner", navn: "⭐ Stjerner" },
  ];

  // Sjove VIP-kommandoer. Skriv fx :hjerter i chatten. Alle i rummet ser det.
  const KOMMANDOER = {
    hjerter: { tegn: ["❤️", "💖", "💕", "💗"], antal: 7, tekst: "Hjerter flyver op" },
    kys: { tegn: ["💋", "😘", "💋"], antal: 5, tekst: "Send kys ud i rummet" },
    fyrvaerkeri: { tegn: ["🎆", "🎇", "✨", "💥"], antal: 10, tekst: "Fyrværkeri over hovedet" },
    konfetti: { tegn: ["🎉", "🎊", "✨"], antal: 9, tekst: "Konfetti-fest" },
    stjerner: { tegn: ["⭐", "🌟", "✨"], antal: 7, tekst: "Stjerneregn" },
    dans: { tegn: ["💃", "🕺", "🎶", "🎵"], antal: 8, tekst: "Dansefest" },
    musik: { tegn: ["🎵", "🎶", "🎼"], antal: 6, tekst: "Musik-noder" },
    blomster: { tegn: ["🌸", "🌷", "🌹", "🌼"], antal: 7, tekst: "Blomster-regn" },
    sne: { tegn: ["❄️", "☃️", "❄️"], antal: 7, tekst: "Det sner!" },
    regnbue: { tegn: ["🌈", "☁️", "🌈"], antal: 5, tekst: "Regnbuer" },
    penge: { tegn: ["💰", "⭐", "💸"], antal: 7, tekst: "Vis at du er rig 😎" },
    krone: { tegn: ["👑", "✨", "👑"], antal: 6, tekst: "Kroner over hovedet" },
    sur: { tegn: ["😤", "💢", "⛈️"], antal: 5, tekst: "Sur sky" },
    sov: { tegn: ["💤", "😴", "🌙"], antal: 5, tekst: "Godnat" },
    spoegelse: { tegn: ["👻", "🎃", "🦇"], antal: 6, tekst: "Uhyggeligt!" },
  };
  const KOMMANDO_REGEL = /^[:：]\s*([a-zæøå]+)$/i;

  function glimtNavn() { return (typeof system !== "undefined" && system.valutaNavn) || "Glimt"; }
  function tal(n) { return Number(n || 0).toLocaleString("da-DK"); }
  function r(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function token() { return typeof mitToken === "function" ? mitToken() : null; }
  function kanServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" && !!token(); }
  function mitNavn() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function erEjerNavn(n) { return typeof EJERE !== "undefined" && EJERE.indexOf(n) >= 0; }
  function erEjer() { return erEjerNavn(mitNavn()); }
  function skriv(t) { if (typeof besked !== "undefined" && besked) besked.textContent = t; }
  function nyNoegle() {
    if (window.crypto && crypto.randomUUID) { try { return crypto.randomUUID(); } catch (e) {} }
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = Array.from(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  function serverFejl(e) {
    const m = (e && e.message) || "";
    if (/hv_vip|Could not find the function/i.test(m)) return "VIP virker, når database-52-vip.sql er kørt i Supabase.";
    return m || "Serveren svarede ikke. Prøv igen.";
  }
  function dato(ms) { return new Date(ms).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }); }
  function tid(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  }
  function nyePenge(svar) {
    if (!svar || svar.glimt == null) return;
    if (typeof saetPenge === "function") saetPenge({ glimt: svar.glimt, stella: svar.stella }, false);
    else { glimt = svar.glimt; krystaller = svar.stella; if (typeof visGlimt === "function") visGlimt(); }
  }
  // Mens serveren ændrer pengene, må den almindelige penge-opdatering vente (ellers "🎁 Du har fået …" to gange)
  function pause(til) {
    try {
      if (typeof pengeSender === "undefined") return;
      pengeSender = til;
      if (!til && typeof sendPenge === "function") sendPenge();
    } catch (e) {}
  }

  // -----------------------------------------------------------
  //  Hvem er VIP? (hentes fra serveren, så alle ser de samme navne)
  // -----------------------------------------------------------
  let mig = null;            // svaret fra hv_vip_mig
  let migFejl = "";
  const STILE = {};          // navn med små bogstaver → { navn, ikon, farve, kant, effekt }
  const STANDARD = { ikon: "👑", farve: "#7a1f2e", kant: "#d9a441", effekt: "glimmer" };

  function jegErVip() { return erEjer() || !!(mig && mig.vip); }
  function erVip(navn) {
    if (!navn) return false;
    if (navn === mitNavn()) return jegErVip();
    return erEjerNavn(navn) || !!STILE[String(navn).toLowerCase()];
  }
  // Stilen for et navn (null = almindeligt navneskilt)
  function stilFor(navn) {
    if (!erVip(navn)) return null;
    if (navn === mitNavn() && mig && mig.stil) return mig.stil;
    return STILE[String(navn).toLowerCase()] || STANDARD;
  }

  function hentAlle() {
    if (!kanServer()) return;
    serverKald("hv_vip_alle", { p_token: token() }).then(function (liste) {
      Object.keys(STILE).forEach(function (k) { delete STILE[k]; });
      (liste || []).forEach(function (s) { STILE[String(s.navn).toLowerCase()] = s; });
    }).catch(function () {});
  }
  function hentMig(derefter) {
    if (!kanServer()) { migFejl = "Du skal være logget ind på hotellets server."; if (derefter) derefter(); return; }
    serverKald("hv_vip_mig", { p_token: token() }).then(function (svar) {
      const varKlar = mig && mig.gave_klar;
      mig = svar; migFejl = "";
      opdaterKnap();
      if (svar.gave_klar && !varKlar && !gaveSagt) { gaveSagt = true; skriv("🎁 Din VIP-gave for denne uge er klar! Klik på 👑 ved dine penge."); }
    }).catch(function (e) { migFejl = serverFejl(e); }).then(function () { if (derefter) derefter(); });
  }
  let gaveSagt = false;
  hentAlle(); hentMig();
  setInterval(hentAlle, 15000);
  setInterval(function () { hentMig(function () { if (!vindue.hidden && !travl) visVindue(); }); }, 60000);


  // -----------------------------------------------------------
  //  Det flotte VIP-navneskilt over figuren
  // -----------------------------------------------------------
  function tegnVipSkilt(c, x, top, navn, minEgen, st) {
    const nu = performance.now() / 1000;
    c.save();
    c.font = "bold 11px Verdana, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    const tekst = (st.ikon || "👑") + " " + navn;
    const b = Math.round(c.measureText(tekst).width + 18), h = 18;
    const v = Math.round(x - b / 2), t = Math.round(top) - 1;
    function form() {
      c.beginPath();
      if (c.roundRect) c.roundRect(v, t, b, h, 9); else c.rect(v, t, b, h);
      c.moveTo(x - 4, t + h); c.lineTo(x, t + h + 4); c.lineTo(x + 4, t + h);
    }
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.translate(0, 2); form(); c.fill(); c.translate(0, -2);
    form();
    c.fillStyle = minEgen ? "#fdf0d0" : "#fff8e8";
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = st.kant || STANDARD.kant;
    c.stroke();
    c.fillStyle = st.effekt === "regnbue" ? "hsl(" + Math.round((nu * 90) % 360) + ",75%,40%)" : (st.farve || STANDARD.farve);
    c.fillText(tekst, x, t + h / 2 + 0.5);
    // effekten rundt om skiltet
    const tegn = st.effekt === "glimmer" ? "✦" : st.effekt === "hjerter" ? "♥" : st.effekt === "stjerner" ? "★" : null;
    if (tegn) {
      c.font = "bold 9px Verdana, sans-serif";
      const pladser = [[v - 4, t + 3], [v + b + 4, t + h - 3], [v + b * 0.3, t - 4], [v + b * 0.75, t + h + 3]];
      pladser.forEach(function (p, i) {
        const lys = (Math.sin(nu * 3 + i * 1.7) + 1) / 2;
        c.globalAlpha = 0.25 + lys * 0.75;
        c.fillStyle = st.effekt === "hjerter" ? "#e91e63" : st.effekt === "stjerner" ? "#f5b400" : (st.kant || "#d9a441");
        c.fillText(tegn, p[0], p[1] - (st.effekt === "hjerter" ? lys * 2 : 0));
      });
    }
    c.restore();
    return b;
  }
  if (typeof tegnNavneskilt === "function") {
    const tegnNavneskiltFoerVip = tegnNavneskilt;
    tegnNavneskilt = function (c, x, top, navn, minEgen) {
      const st = stilFor(navn);
      if (!st) return tegnNavneskiltFoerVip(c, x, top, navn, minEgen);
      try { return tegnVipSkilt(c, x, top, navn, minEgen, st); }
      catch (e) { return tegnNavneskiltFoerVip(c, x, top, navn, minEgen); }
    };
  }


  // -----------------------------------------------------------
  //  Chatten: VIP-kommandoer og VIP-navne i chatloggen
  // -----------------------------------------------------------
  function visEffekt(navn, hvem) {
    const k = KOMMANDOER[navn];
    if (!k || typeof svaev !== "function") return;
    for (let i = 0; i < k.antal; i++) {
      setTimeout(function () { try { svaev(k.tegn[i % k.tegn.length], hvem); } catch (e) {} }, i * 180);
    }
  }
  function kommandoFra(tekst) {
    const m = String(tekst || "").trim().match(KOMMANDO_REGEL);
    if (!m) return null;
    const navn = m[1].toLowerCase().replace("æ", "ae").replace("ø", "oe").replace("å", "aa");
    return KOMMANDOER[navn] ? navn : null;
  }

  if (typeof sig === "function") {
    const sigFoerVip = sig;
    sig = function (hvem, navn, tekst) {
      // en anden VIP har skrevet en VIP-kommando: vis effekten i stedet for en boble
      const k = kommandoFra(tekst);
      if (k && hvem !== (typeof figur !== "undefined" ? figur : null) && erVip(navn)) { visEffekt(k, hvem); return; }
      sigFoerVip(hvem, navn, tekst);
      // VIP-navnet i chatloggen får ikon og farve
      try {
        const st = stilFor(navn);
        const li = typeof chatlogListe !== "undefined" ? chatlogListe.lastElementChild : null;
        if (!st || !li || !String(tekst).trim()) return;
        const b = li.querySelector("b");
        if (!b || b.dataset.vip) return;
        b.dataset.vip = "1";
        b.style.color = st.farve || STANDARD.farve;
        b.textContent = (st.ikon || "👑") + " " + b.textContent;
        b.title = "VIP 👑";
      } catch (e) {}
    };
  }

  function kommandoListeHtml() {
    return "<ul class='vip-kom'>" + Object.keys(KOMMANDOER).map(function (k) {
      return "<li><button type='button' data-vip-kom='" + k + "'><b>:" + k + "</b> " + KOMMANDOER[k].tegn[0] + "</button><small>" + r(KOMMANDOER[k].tekst) + "</small></li>";
    }).join("") + "</ul>";
  }

  function brugKommando(k) {
    if (!jegErVip()) { skriv("👑 Den kommando er kun for VIP. Klik på 👑 ved dine penge for at blive VIP."); return; }
    if (typeof harTimeout === "function" && harTimeout(mitNavn())) { skriv("🔇 Du er mutet og kan ikke bruge kommandoer lige nu."); return; }
    if (typeof figur !== "undefined") visEffekt(k, figur);
    if (kanServer() && typeof mitRumId === "function") {
      serverKald("hv_chat_send", { p_token: token(), p_rum: mitRumId(), p_tekst: ":" + k, p_boble: typeof minBoble !== "undefined" ? minBoble : null }).catch(function () {});
    }
  }

  // Skriver man en VIP-kommando i chatten, bliver den ikke sagt højt, men vist som effekt
  document.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    const tekst = chatTekst.value.trim();
    if (/^[:：]\s*vip$/i.test(tekst)) {
      e.preventDefault(); e.stopImmediatePropagation(); chatTekst.value = "";
      aabn(jegErVip() ? "kommandoer" : "bliv");
      return;
    }
    const k = kommandoFra(tekst);
    if (!k) return;
    e.preventDefault(); e.stopImmediatePropagation();
    chatTekst.value = "";
    brugKommando(k);
  }, true);


  // -----------------------------------------------------------
  //  👑-knappen ved pengene og VIP-vinduet
  // -----------------------------------------------------------
  const knap = document.createElement("button");
  knap.type = "button";
  knap.id = "vip-knap";
  knap.textContent = "👑";
  knap.title = "👑 VIP";
  knap.addEventListener("click", function (e) { e.stopPropagation(); if (vindue.hidden) aabn(); else luk(); });
  document.getElementById("glimt").appendChild(knap);
  function opdaterKnap() {
    knap.classList.toggle("er-vip", jegErVip());
    knap.classList.toggle("gave", !!(mig && mig.gave_klar));
    knap.title = jegErVip() ? (mig && mig.gave_klar ? "👑 VIP: din gave er klar! 🎁" : "👑 Mit VIP") : "👑 Bliv VIP";
  }
  setInterval(opdaterKnap, 2000);

  const vindue = document.createElement("div");
  vindue.id = "vip-vindue";
  vindue.hidden = true;
  vindue.innerHTML = "<div class='vip-top'><span>👑 VIP</span><button type='button' class='vip-luk' title='Luk'>✕</button></div>" +
    "<nav class='vip-faner'></nav><div class='vip-krop'></div>";
  document.body.appendChild(vindue);
  if (typeof goerFlytbar === "function") goerFlytbar(vindue, vindue.querySelector(".vip-top"), "mit-hotel-vip-plads");
  vindue.querySelector(".vip-luk").addEventListener("click", luk);
  vindue.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Escape") luk(); });

  const krop = vindue.querySelector(".vip-krop");
  let side = "bliv";
  let travl = false;
  let fejl = "";
  let ok = "";
  let koebNoegle = null;      // sat mens man bekræfter et køb
  let kladde = null;          // navnet man er ved at lave (før man gemmer)
  let forhaandTimer = null;

  function aabn(tilSide) {
    vindue.hidden = false;
    fejl = ""; ok = ""; koebNoegle = null; kladde = null;
    side = tilSide || (jegErVip() ? "mit" : "bliv");
    visVindue();
    hentMig(function () { if (!vindue.hidden && !travl) visVindue(); });
  }
  function luk() { if (travl) return; vindue.hidden = true; stopForhaand(); EKSTRA.forEach(function (x) { if (x.forlad) x.forlad(); }); }
  window.aabnVip = aabn;
  // Andre filer (fx js/vip-kort.js) kan lægge flere sider i VIP-vinduet og bruge VIP-tjekket
  const EKSTRA = [];
  window.VIP = {
    erVip: erVip, stilFor: stilFor, jegErVip: jegErVip, erEjer: erEjer, kanServer: kanServer, token: token,
    serverFejl: serverFejl, r: r, tal: tal, aabn: aabn, vindue: vindue, tegnVipSkilt: tegnVipSkilt,
    nySide: function (side) { EKSTRA.push(side); if (!vindue.hidden) visVindue(); },
    erAaben: function (id) { return !vindue.hidden && side === id; },
  };

  function visVindue() {
    const vip = jegErVip();
    if (!vip && side !== "bliv" && side !== "kommandoer") side = "bliv";
    if (vip && side === "bliv") side = "mit";
    const faner = vip
      ? [["mit", "👑 Mit VIP"], ["navn", "✨ Mit navn"]].concat(EKSTRA.map(function (x) { return [x.id, x.navn]; }), [["kommandoer", "🎉 Kommandoer"]])
      : [["bliv", "👑 Bliv VIP"], ["kommandoer", "🎉 Kommandoer"]];
    vindue.querySelector(".vip-faner").innerHTML = faner.map(function (f) {
      return "<button type='button' data-vip-side='" + f[0] + "'" + (f[0] === side ? " class='valgt'" : "") + ">" + f[1] + "</button>";
    }).join("");
    vindue.querySelectorAll("[data-vip-side]").forEach(function (k) {
      k.addEventListener("click", function () { if (travl) return; side = k.dataset.vipSide; fejl = ""; ok = ""; koebNoegle = null; visVindue(); });
    });
    stopForhaand();
    EKSTRA.forEach(function (x) { if (x.id !== side && x.forlad) x.forlad(); });
    const ekstra = EKSTRA.find(function (x) { return x.id === side; });
    if (ekstra && vip) { krop.innerHTML = beskeder(); ekstra.vis(krop); }
    else if (side === "bliv") visBliv();
    else if (side === "mit") visMit();
    else if (side === "navn") visNavn();
    else visKommandoer();
  }

  function fordeleHtml() {
    return "<ul class='vip-fordele'>" +
      "<li><span>👑</span><div><b>VIP-mærke og flot navn</b><small>Vælg et ikon foran dit navn, din egen navnefarve, kantfarve og en glimmer-effekt. Alle kan se det.</small></div></li>" +
      "<li><span>🎁</span><div><b>Velkomstgave</b><small>" + (mig && mig.velkomst_stella ? tal(mig.velkomst_stella) + " Stella " : "") + (mig && mig.velkomst_glimt ? "og " + tal(mig.velkomst_glimt) + " " + r(glimtNavn()) + " " : "") + "med det samme, når du bliver VIP.</small></div></li>" +
      "<li><span>📅</span><div><b>Ugens VIP-gave</b><small>En overraskelse med " + r(glimtNavn()) + " eller Stella hver mandag.</small></div></li>" +
      "<li><span>🎉</span><div><b>Sjove kommandoer</b><small>Skriv fx :hjerter, :fyrvaerkeri eller :dans i chatten, og alle i rummet ser det.</small></div></li>" +
      "<li class='snart'><span>🪙</span><div><b>Dobbelt så mange " + r(glimtNavn()) + "</b><small>Kommer snart</small></div></li>" +
      "<li class='snart'><span>🛋️</span><div><b>VIP-katalog med eksklusive møbler</b><small>Kommer snart</small></div></li>" +
      "<li class='snart'><span>🚪</span><div><b>Æresgæst: kom ind i fyldte rum</b><small>Kommer snart</small></div></li>" +
      "<li class='snart'><span>👏</span><div><b>Flere klap om dagen og flere profilbannere</b><small>Kommer snart</small></div></li>" +
      "</ul>";
  }

  function beskeder() {
    return (fejl ? "<p class='vip-fejl' role='alert'>⚠️ " + r(fejl) + "</p>" : "") + (ok ? "<p class='vip-ok'>" + ok + "</p>" : "");
  }

  // --- Bliv VIP ---
  function visBliv() {
    const pris = mig ? mig.pris_glimt : 1000;
    const kr = mig ? mig.pris_kroner : 200;
    const har = typeof glimt === "number" ? glimt : 0;
    let html = "<div class='vip-hero'><div class='vip-krone'>👑</div><h3>Bliv VIP på HELLO VERA</h3><p>Betal én gang, og du er VIP <b>for evigt</b>.</p></div>" +
      fordeleHtml() + "<h4>Sådan bliver du VIP</h4>" + beskeder();
    if (migFejl) html += "<p class='vip-fejl'>⚠️ " + r(migFejl) + "</p>";
    html += "<div class='vip-betal'>" +
      "<div class='vip-pris'>" + GLIMT_IKON + " <b>" + tal(pris) + " " + r(glimtNavn()) + "</b><small>Du har " + tal(har) + "</small></div>";
    if (koebNoegle) {
      html += "<div class='vip-bekraeft'><p>Er du sikker? Du betaler <b>" + tal(pris) + " " + r(glimtNavn()) + "</b> og bliver VIP for evigt.</p>" +
        "<div><button type='button' id='vip-fortryd'>Fortryd</button><button type='button' id='vip-ja'>" + (travl ? "⏳ Køber …" : "✔ Ja, gør mig til VIP") + "</button></div></div>";
    } else {
      html += "<button type='button' class='vip-hoved' id='vip-koeb'" + (har < pris || !kanServer() ? " disabled" : "") + ">👑 Køb VIP for " + tal(pris) + " " + r(glimtNavn()) + "</button>" +
        (har < pris ? "<p class='vip-note'>Du mangler " + tal(pris - har) + " " + r(glimtNavn()) + ". Du kan veksle Stella til " + r(glimtNavn()) + " i 💱 Vekselbørsen.</p>" : "");
    }
    html += "<div class='vip-eller'>eller</div>" +
      "<div class='vip-pris'>💳 <b>" + tal(kr) + " kr</b><small>med rigtige penge</small></div>" +
      "<button type='button' class='vip-penge' id='vip-penge'>💳 Betal " + tal(kr) + " kr</button>" +
      (mig && mig.betaling_til ? "" : "<p class='vip-note'>Betaling med rigtige penge åbner snart. Indtil da kan du købe VIP for " + r(glimtNavn()) + ".</p>") +
      "<p class='vip-note'>Er du under 18, skal en voksen sige ja, før du betaler med rigtige penge.</p></div>";
    krop.innerHTML = html;

    const koeb = krop.querySelector("#vip-koeb");
    if (koeb) koeb.addEventListener("click", function () { fejl = ""; ok = ""; koebNoegle = nyNoegle(); visVindue(); });
    const fortryd = krop.querySelector("#vip-fortryd");
    if (fortryd) fortryd.addEventListener("click", function () { if (travl) return; koebNoegle = null; visVindue(); });
    const ja = krop.querySelector("#vip-ja");
    if (ja) ja.addEventListener("click", koebForGlimt);
    krop.querySelector("#vip-penge").addEventListener("click", betalMedPenge);
  }

  function koebForGlimt() {
    if (travl || !koebNoegle) return;
    travl = true; visVindue();
    pause(true);
    serverKald("hv_vip_koeb_glimt", { p_token: token(), p_noegle: koebNoegle }).then(function (svar) {
      nyePenge(svar);
      koebNoegle = null;
      mig = Object.assign({}, mig || {}, { vip: true, siden: Date.now(), hvordan: "glimt" });
      ok = "🎉 Tillykke! Du er nu VIP for evigt 👑" + (svar.velkomst_stella ? " Din velkomstgave på " + tal(svar.velkomst_stella) + " Stella er lagt i din pung." : "");
      skriv("👑 Du er nu VIP på HELLO VERA!");
      if (typeof figur !== "undefined") visEffekt("konfetti", figur);
      if (typeof blink === "function") { const b = document.querySelector("#glimt .krystal"); if (b) blink(b); }
      side = "mit";
      hentAlle();
      hentMig(function () { if (!vindue.hidden && !travl) visVindue(); });
    }).catch(function (e) {
      fejl = serverFejl(e); koebNoegle = null;
      if (typeof hentPenge === "function") hentPenge();
    }).then(function () { travl = false; pause(false); visVindue(); });
  }

  function betalMedPenge() {
    fejl = ""; ok = "";
    if (!kanServer()) { fejl = "Du skal være logget ind på hotellets server."; visVindue(); return; }
    if (!mig || !mig.betaling_til) { fejl = "Betaling med rigtige penge er ikke åbnet endnu. Køb VIP for " + glimtNavn() + " i stedet ⭐"; visVindue(); return; }
    // Når betalingsfirmaet er valgt, sendes man herfra videre til deres betalingsside.
    serverKald("hv_vip_betaling_start", { p_token: token(), p_udbyder: VIP_BETALING.udbyder }).then(function (svar) {
      if (VIP_BETALING.side) location.href = VIP_BETALING.side + "?reference=" + encodeURIComponent(svar.reference);
      else { fejl = "Betalingssiden er ikke sat op endnu."; visVindue(); }
    }).catch(function (e) { fejl = serverFejl(e); visVindue(); });
  }
  // Udfyldes, når du har valgt betalingsfirma (fx Stripe). Indtil da er betaling med penge lukket.
  const VIP_BETALING = { udbyder: "stripe", side: "" };

  // --- Mit VIP ---
  function visMit() {
    let html = beskeder();
    if (erEjer()) html += "<p class='vip-ejer'>👑 Som hotellets ejer er du altid VIP og har alle VIP-fordele.</p>";
    if (mig && mig.siden && !erEjer()) html += "<p class='vip-status'>👑 Du har været VIP siden <b>" + dato(mig.siden) + "</b>. Det varer for evigt 💖</p>";
    html += "<div class='vip-gave'>";
    if (!mig) html += "<p>⏳ Henter …</p>";
    else if (mig.gave_klar) html += "<div class='vip-gave-ikon'>🎁</div><b>Ugens VIP-gave er klar!</b><button type='button' class='vip-hoved' id='vip-hent-gave'>" + (travl ? "⏳ Åbner …" : "🎁 Åbn gaven") + "</button>";
    else html += "<div class='vip-gave-ikon'>📅</div><b>Ugens gave er hentet</b><small>Næste gave kommer på mandag.</small>";
    html += "</div>";
    if (migFejl) html += "<p class='vip-fejl'>⚠️ " + r(migFejl) + "</p>";
    html += "<h4>Dine VIP-fordele</h4>" + fordeleHtml();
    krop.innerHTML = html;
    const gave = krop.querySelector("#vip-hent-gave");
    if (gave) gave.addEventListener("click", hentGave);
  }

  function hentGave() {
    if (travl) return;
    travl = true; fejl = ""; ok = ""; visVindue();
    pause(true);
    serverKald("hv_vip_ugegave", { p_token: token() }).then(function (svar) {
      nyePenge(svar);
      const hvad = svar.glimt_fik ? GLIMT_IKON + " " + tal(svar.glimt_fik) + " " + r(glimtNavn()) : STELLA_IKON + " " + tal(svar.stella_fik) + " Stella";
      ok = "🎁 Du fik " + hvad + "! Næste gave kommer på mandag.";
      skriv("🎁 Ugens VIP-gave: " + (svar.glimt_fik ? tal(svar.glimt_fik) + " " + glimtNavn() : tal(svar.stella_fik) + " Stella") + "!");
      if (typeof figur !== "undefined") visEffekt(svar.glimt_fik ? "penge" : "stjerner", figur);
      if (typeof blink === "function") { const b = document.querySelector(svar.glimt_fik ? "#glimt .penge" : "#glimt .krystal"); if (b) blink(b); }
      if (mig) mig.gave_klar = false;
      opdaterKnap();
    }).catch(function (e) { fejl = serverFejl(e); if (mig) mig.gave_klar = false; })
      .then(function () { travl = false; pause(false); visVindue(); });
  }

  // --- Mit navn ---
  function visNavn() {
    if (!kladde) kladde = Object.assign({}, STANDARD, (mig && mig.stil) || {});
    const k = kladde;
    function prikker(liste, felt) {
      return liste.map(function (f) {
        return "<button type='button' class='vip-prik" + (k[felt] === f ? " valgt" : "") + "' data-vip-" + felt + "='" + f + "' style='background:" + f + "' title='" + f + "'></button>";
      }).join("");
    }
    krop.innerHTML = beskeder() +
      "<p class='vip-note'>Sådan ser dit navn ud over figuren og i chatten. Alle på hotellet kan se det.</p>" +
      "<div class='vip-forhaand'><canvas id='vip-laerred' width='300' height='46'></canvas></div>" +
      "<h4>Ikon foran navnet</h4><div class='vip-ikoner'>" + IKONER.map(function (i) {
        return "<button type='button' data-vip-ikon='" + i + "'" + (k.ikon === i ? " class='valgt'" : "") + ">" + i + "</button>";
      }).join("") + "</div>" +
      "<h4>Navnets farve</h4><div class='vip-prikker'>" + prikker(FARVER, "farve") + "</div>" +
      "<h4>Kantfarve</h4><div class='vip-prikker'>" + prikker(KANTER, "kant") + "</div>" +
      "<h4>Effekt</h4><div class='vip-effekter'>" + EFFEKTER.map(function (e) {
        return "<button type='button' data-vip-effekt='" + e.id + "'" + (k.effekt === e.id ? " class='valgt'" : "") + ">" + e.navn + "</button>";
      }).join("") + "</div>" +
      "<button type='button' class='vip-hoved' id='vip-gem-navn'>" + (travl ? "⏳ Gemmer …" : "💾 Gem mit navn") + "</button>";

    ["ikon", "farve", "kant", "effekt"].forEach(function (felt) {
      krop.querySelectorAll("[data-vip-" + felt + "]").forEach(function (b) {
        b.addEventListener("click", function () { kladde[felt] = b.getAttribute("data-vip-" + felt); ok = ""; visVindue(); });
      });
    });
    krop.querySelector("#vip-gem-navn").addEventListener("click", function () {
      if (travl) return;
      travl = true; fejl = ""; ok = ""; visVindue();
      serverKald("hv_vip_stil", { p_token: token(), p_ikon: kladde.ikon, p_farve: kladde.farve, p_kant: kladde.kant, p_effekt: kladde.effekt })
        .then(function (svar) {
          mig = Object.assign({}, mig || {}, { stil: svar });
          STILE[String(svar.navn).toLowerCase()] = svar;
          ok = "✅ Dit navn er gemt. Nu kan alle se det!";
        }).catch(function (e) { fejl = serverFejl(e); })
        .then(function () { travl = false; visVindue(); });
    });
    startForhaand();
  }
  function startForhaand() {
    const lae = krop.querySelector("#vip-laerred");
    if (!lae) return;
    const skala = window.devicePixelRatio || 1;
    lae.width = 300 * skala; lae.height = 46 * skala;
    const c = lae.getContext("2d");
    function tegn() {
      if (!document.body.contains(lae)) return stopForhaand();
      c.setTransform(skala, 0, 0, skala, 0, 0);
      c.clearRect(0, 0, 300, 46);
      tegnVipSkilt(c, 150, 12, mitNavn() || "Dit navn", true, kladde || STANDARD);
      forhaandTimer = requestAnimationFrame(tegn);
    }
    tegn();
  }
  function stopForhaand() { if (forhaandTimer) cancelAnimationFrame(forhaandTimer); forhaandTimer = null; }

  // --- Kommandoer ---
  function visKommandoer() {
    krop.innerHTML = beskeder() + (jegErVip()
      ? "<p class='vip-note'>Skriv kommandoen i chatten (fx <b>:hjerter</b>) eller klik på den her. Alle i rummet ser effekten.</p>"
      : "<p class='vip-note'>👑 Kommandoerne er kun for VIP. Her kan du se, hvad du får.</p>") +
      kommandoListeHtml() + "<p class='vip-note'>Skriv <b>:vip</b> i chatten for at åbne dette vindue.</p>";
    krop.querySelectorAll("[data-vip-kom]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!jegErVip()) { side = "bliv"; visVindue(); return; }
        brugKommando(b.dataset.vipKom);
      });
    });
  }


  // -----------------------------------------------------------
  //  Ejerpanel → Økonomi → 👑 VIP (kun ejeren)
  // -----------------------------------------------------------
  const FANE = "vip";
  let ej = null, ejFejl = "", ejHenter = false, ejBesked = "", ejSoeg = "";

  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP[FANE] = { titel: "👑 VIP",
    tekst: "Alle hotellets VIP-medlemmer. VIP koster 1000 Glimt (eller 200 kr, når betaling med rigtige penge er slået til) og varer for evigt.",
    punkter: ["Du kan selv give VIP gratis til en spiller, og du kan fjerne det igen.",
      "Får man VIP første gang, får man også velkomstgaven.",
      "Ugens VIP-gave kan hentes én gang om ugen fra mandag.",
      "Som ejer er du altid VIP og har alle fordelene."] };

  const fane = document.createElement("button");
  fane.type = "button";
  fane.dataset.fane = FANE;
  fane.textContent = "👑 VIP";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); hentEj(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (!faner) return;
    const efter = faner.querySelector('[data-fane="veksel"]') || faner.querySelector('[data-fane="valuta"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
  })();
  fane.hidden = !erEjer();
  setInterval(function () { fane.hidden = !erEjer(); }, 1000);

  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === FANE && erEjer(); }
  function skriverHer() { return document.activeElement && document.activeElement.id === "vipe-navn"; }

  function hentEj() {
    if (ejHenter || !erEjer()) return;
    if (!kanServer()) { ejFejl = "Kræver, at du er logget ind på hotellets server."; if (paaFanen()) visFane(); return; }
    ejHenter = true;
    serverKald("hv_vip_ejer", { p_token: token() }).then(function (svar) {
      const foer = JSON.stringify(ej);
      ej = svar; ejFejl = "";
      if (JSON.stringify(ej) !== foer && paaFanen() && !skriverHer()) visFane();
    }).catch(function (e) { ejFejl = serverFejl(e); if (paaFanen() && !skriverHer()) visFane(); })
      .then(function () { ejHenter = false; });
  }
  setInterval(function () { if (paaFanen()) hentEj(); }, 8000);

  const HVAD = { koeb_glimt: "👑 Købte VIP", koeb_penge: "💳 Købte VIP", givet: "🎁 Fik VIP af ejeren", fjernet: "✖ VIP fjernet",
    velkomstgave: "🎁 Velkomstgave", ugegave: "📅 Ugens gave" };
  const HVORDAN = { glimt: "købt for Glimt", penge: "købt for kr", ejer: "givet af ejeren" };

  function givFjern(navn, giv) {
    navn = String(navn || "").trim();
    if (!navn) return;
    ejBesked = "⏳ …"; visFane();
    serverKald("hv_vip_giv", { p_token: token(), p_navn: navn, p_giv: giv }).then(function (svar) {
      ejBesked = giv ? "👑 " + svar.navn + " er nu VIP." : "✖ " + svar.navn + " er ikke VIP længere.";
      if (typeof adminSkriv === "function") adminSkriv((giv ? "Gav VIP til " : "Fjernede VIP fra ") + svar.navn);
      hentAlle();
    }).catch(function (e) { ejBesked = "⚠️ " + serverFejl(e); })
      .then(function () { ejHenter = false; hentEj(); if (paaFanen()) visFane(); });
  }

  function visEjer() {
    const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
    ejerIndhold.innerHTML = "";
    if (hjaelp) ejerIndhold.appendChild(hjaelp);
    const sek = document.createElement("div");
    sek.className = "vipe-panel";
    let html = "<div class='vipe-top'><h3>👑 VIP-medlemmer</h3><button type='button' id='vipe-opdater'>🔄 Opdater</button></div>";
    if (ejFejl) html += "<p class='ejer-info'>⚠️ " + r(ejFejl) + "</p>";
    if (!ej && !ejFejl) html += "<p class='ejer-info'>⏳ Henter …</p>";
    if (ej) {
      const ind = ej.indstilling || {};
      html += "<div class='oek-kort-raekke'>" +
        "<div class='oek-kort'><span class='oek-kort-titel'>👑 VIP lige nu</span><b>" + tal(ej.antal) + "</b><small>ejerne er ikke talt med</small></div>" +
        "<div class='oek-kort'><span class='oek-kort-titel'>" + GLIMT_IKON + " Betalt i " + r(glimtNavn()) + "</span><b>" + tal(ej.glimt_ind) + "</b><small>pris: " + tal(ind.pris_glimt) + "</small></div>" +
        "<div class='oek-kort'><span class='oek-kort-titel'>💳 Betalt i kr</span><b>" + tal(ej.kroner_ind) + " kr</b><small>" + (ind.betaling_til ? "betaling er slået til" : "betaling er ikke slået til endnu") + "</small></div>" +
        "<div class='oek-kort'><span class='oek-kort-titel'>🎁 Ugens gaver hentet</span><b>" + tal(ej.gaver) + "</b><small>velkomstgave: " + tal(ind.velkomst_stella) + " Stella</small></div>" +
        "</div>";
    }
    html += "<h4>🎁 Giv eller fjern VIP</h4><div class='oek-soeg'><input id='vipe-navn' type='text' list='vipe-navne' placeholder='Skriv et navn …' value='" + r(ejSoeg) + "'>" +
      "<button type='button' id='vipe-giv'>👑 Giv VIP</button><button type='button' id='vipe-fjern'>✖ Fjern VIP</button></div>" +
      "<datalist id='vipe-navne'>" + (typeof alleSpillere === "function" ? alleSpillere().filter(function (s) {
        return typeof erComputerGaest !== "function" || !erComputerGaest(s.navn);
      }).map(function (s) { return "<option value='" + r(s.navn) + "'>"; }).join("") : "") + "</datalist>" +
      (ejBesked ? "<p class='ejer-info'>" + r(ejBesked) + "</p>" : "");
    if (ej) {
      const liste = (ej.vip || []);
      html += "<h4>📋 Alle VIP</h4>" + (liste.length ? "<div class='oek-tabel-boks'><table class='oek-tabel'><thead><tr><th>Navn</th><th>Status</th><th>Siden</th><th>Hvordan</th><th></th></tr></thead><tbody>" +
        liste.map(function (v) {
          return "<tr" + (v.aktiv ? "" : " class='vipe-gammel'") + "><td><span style='color:" + r(v.farve) + ";font-weight:bold'>" + r(v.ikon) + " " + r(v.navn) + "</span></td>" +
            "<td>" + (v.ejer ? "👑 Ejer" : v.aktiv ? "✅ VIP" : "✖ Ikke VIP") + "</td><td>" + dato(v.siden) + "</td>" +
            "<td>" + r(HVORDAN[v.hvordan] || v.hvordan) + (v.givet_af && v.hvordan === "ejer" && !v.ejer ? " (" + r(v.givet_af) + ")" : "") + "</td>" +
            "<td>" + (v.ejer ? "" : v.aktiv ? "<button type='button' data-vipe-fjern='" + r(v.navn) + "'>✖ Fjern</button>" : "<button type='button' data-vipe-giv='" + r(v.navn) + "'>👑 Giv igen</button>") + "</td></tr>";
        }).join("") + "</tbody></table></div>" : "<p class='ejer-info'>Ingen VIP endnu.</p>");
      html += "<h4>🕒 Seneste</h4>" + ((ej.log || []).length ? "<div class='oek-tabel-boks'><table class='oek-tabel'><thead><tr><th>Tid</th><th>Spiller</th><th>Hvad</th><th>Beløb</th></tr></thead><tbody>" +
        ej.log.map(function (l) {
          const beloeb = [];
          if (l.glimt) beloeb.push(GLIMT_IKON + " " + (l.glimt > 0 ? "+" : "") + tal(l.glimt));
          if (l.stella) beloeb.push(STELLA_IKON + " +" + tal(l.stella));
          if (l.kroner) beloeb.push("💳 " + tal(l.kroner) + " kr");
          return "<tr><td>" + tid(l.tid) + "</td><td>" + r(l.navn) + "</td><td>" + r(HVAD[l.hvad] || l.hvad) +
            (l.af && l.af !== l.navn ? " <small>af " + r(l.af) + "</small>" : "") + "</td><td>" + beloeb.join(" · ") + "</td></tr>";
        }).join("") + "</tbody></table></div>" : "<p class='ejer-info'>Intet endnu.</p>");
    }
    sek.innerHTML = html;
    ejerIndhold.appendChild(sek);

    sek.querySelector("#vipe-opdater").addEventListener("click", function () { ej = null; ejBesked = ""; visFane(); hentEj(); hentAlle(); });
    const inp = sek.querySelector("#vipe-navn");
    inp.addEventListener("keydown", function (e) { e.stopPropagation(); });
    inp.addEventListener("input", function () { ejSoeg = inp.value; });
    sek.querySelector("#vipe-giv").addEventListener("click", function () { givFjern(inp.value, true); });
    sek.querySelector("#vipe-fjern").addEventListener("click", function () { givFjern(inp.value, false); });
    sek.querySelectorAll("[data-vipe-fjern]").forEach(function (b) { b.addEventListener("click", function () { givFjern(b.dataset.vipeFjern, false); }); });
    sek.querySelectorAll("[data-vipe-giv]").forEach(function (b) { b.addEventListener("click", function () { givFjern(b.dataset.vipeGiv, true); }); });
  }

  if (typeof visFane === "function") {
    const visFaneFoerVip = visFane;
    visFane = function () {
      const min = ejerFane === FANE;
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerVip();
      if (!min || ejerVindue.hidden || !erEjer()) return;
      visEjer();
    };
  }


  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#vip-knap { margin-left: 6px; padding: 0 6px; height: 22px; border-radius: 6px; border: 1px solid #d9a441; background: #7a1f2e; color: #f6dfa0;",
    "  font-size: 13px; line-height: 20px; cursor: pointer; pointer-events: auto; filter: grayscale(.6); }",
    "#vip-knap:hover { background: #962a3c; }",
    "#vip-knap.er-vip { filter: none; background: linear-gradient(#a8323f, #7a1f2e); box-shadow: 0 0 0 1px #ffd700 inset; }",
    "#vip-knap.gave { animation: vip-puls 1.2s ease-in-out infinite; }",
    "@keyframes vip-puls { 50% { box-shadow: 0 0 0 3px rgba(255,215,0,.7); transform: scale(1.1); } }",
    "#vip-vindue { position: fixed; left: 50%; top: 80px; margin-left: -190px; width: 380px; max-width: calc(100vw - 24px); max-height: calc(100vh - 100px);",
    "  display: flex; flex-direction: column; z-index: 61; font-family: Verdana, sans-serif; color: #3a1a14; background: #fbf3e4;",
    "  border: 3px solid #d9a441; border-radius: 12px; box-shadow: 0 8px 22px rgba(60,10,20,.35); overflow: hidden; box-sizing: border-box; }",
    "#vip-vindue[hidden], #vip-vindue [hidden] { display: none !important; }",
    "#vip-vindue .vip-top { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: #7a1f2e; color: #f6dfa0;",
    "  font: bold 15px Georgia, serif; cursor: move; }",
    "#vip-vindue .vip-luk { background: rgba(0,0,0,.2); color: #f6dfa0; border: 1px solid rgba(246,223,160,.5); border-radius: 6px; width: 26px; height: 24px; cursor: pointer; padding: 0; }",
    "#vip-vindue .vip-faner { display: flex; gap: 4px; padding: 6px 8px 0; background: #f3e2bd; border-bottom: 2px solid #d9a441; }",
    "#vip-vindue .vip-faner button { flex: 1; padding: 6px 4px; border: 1px solid #e2c88e; border-bottom: 0; border-radius: 8px 8px 0 0; background: #fff7e6;",
    "  color: #3a1a14; font: 12px Verdana, sans-serif; cursor: pointer; }",
    "#vip-vindue .vip-faner button.valgt { background: #7a1f2e; color: #f6dfa0; border-color: #7a1f2e; font-weight: bold; }",
    "#vip-vindue .vip-krop { padding: 10px 12px 12px; overflow-y: auto; font-size: 13px; }",
    "#vip-vindue h4 { margin: 12px 0 6px; color: #7a1f2e; font: bold 13px Georgia, serif; }",
    ".vip-mini { width: 14px; height: 14px; vertical-align: -2px; image-rendering: pixelated; }",
    "#vip-vindue .vip-hero { text-align: center; padding: 10px; background: linear-gradient(#7a1f2e, #5a1520); color: #f6dfa0; border-radius: 10px; border: 2px solid #d9a441; }",
    "#vip-vindue .vip-hero h3 { margin: 2px 0 4px; font: bold 17px Georgia, serif; }",
    "#vip-vindue .vip-hero p { margin: 0; font-size: 12px; }",
    "#vip-vindue .vip-krone { font-size: 32px; line-height: 1; }",
    "#vip-vindue .vip-fordele { list-style: none; margin: 8px 0 0; padding: 0; }",
    "#vip-vindue .vip-fordele li { display: flex; gap: 8px; align-items: flex-start; padding: 6px 4px; border-bottom: 1px solid #f0e2c4; }",
    "#vip-vindue .vip-fordele li > span { font-size: 20px; width: 26px; text-align: center; }",
    "#vip-vindue .vip-fordele b { display: block; } #vip-vindue .vip-fordele small { color: #6b4a3a; font-size: 11px; }",
    "#vip-vindue .vip-fordele li.snart { opacity: .55; }",
    "#vip-vindue .vip-betal { padding: 10px; background: #fff; border: 1px dashed #d9a441; border-radius: 10px; }",
    "#vip-vindue .vip-pris { display: flex; align-items: baseline; gap: 6px; font-size: 15px; } #vip-vindue .vip-pris small { margin-left: auto; color: #8a6a4a; font-size: 11px; }",
    "#vip-vindue .vip-hoved, #vip-vindue .vip-penge, #vip-vindue #vip-ja { width: 100%; margin-top: 6px; padding: 9px; border: 0; border-radius: 8px; background: #7a1f2e;",
    "  color: #f6dfa0; font: bold 14px Verdana, sans-serif; cursor: pointer; }",
    "#vip-vindue .vip-hoved:disabled { opacity: .45; cursor: default; }",
    "#vip-vindue .vip-penge { background: #fff; color: #7a1f2e; border: 2px solid #7a1f2e; }",
    "#vip-vindue .vip-eller { text-align: center; margin: 10px 0 6px; color: #8a6a4a; font-size: 11px; }",
    "#vip-vindue .vip-note { margin: 6px 0 0; font-size: 11px; color: #8a6a4a; }",
    "#vip-vindue .vip-fejl { margin: 6px 0; padding: 6px 8px; color: #b0282e; background: #fde8e8; border-radius: 8px; font-size: 12px; }",
    "#vip-vindue .vip-ok { margin: 6px 0; padding: 8px; background: #e6f3dc; border: 1px solid #9ccc8f; border-radius: 8px; color: #24481f; }",
    "#vip-vindue .vip-bekraeft { margin-top: 6px; padding: 8px; background: #fff3d6; border: 2px solid #d9a441; border-radius: 8px; }",
    "#vip-vindue .vip-bekraeft p { margin: 0 0 6px; }",
    "#vip-vindue .vip-bekraeft div { display: grid; grid-template-columns: 1fr 1.6fr; gap: 6px; }",
    "#vip-vindue #vip-ja { margin: 0; background: #2f6b2a; color: #fff; }",
    "#vip-vindue #vip-fortryd { border: 1px solid #c9b48a; background: #fff; border-radius: 8px; cursor: pointer; color: #3a1a14; }",
    "#vip-vindue .vip-ejer, #vip-vindue .vip-status { margin: 0 0 8px; padding: 8px; background: #f3e2bd; border: 1px solid #e2c88e; border-radius: 8px; }",
    "#vip-vindue .vip-gave { text-align: center; padding: 12px; background: #fff; border: 2px solid #d9a441; border-radius: 10px; }",
    "#vip-vindue .vip-gave b, #vip-vindue .vip-gave small { display: block; } #vip-vindue .vip-gave small { color: #8a6a4a; margin-top: 2px; }",
    "#vip-vindue .vip-gave-ikon { font-size: 34px; line-height: 1.1; }",
    "#vip-vindue .vip-forhaand { display: flex; justify-content: center; padding: 8px; background: linear-gradient(#cdb89a, #a68c6c); border-radius: 10px; }",
    "#vip-vindue .vip-forhaand canvas { width: 300px; height: 46px; max-width: 100%; }",
    "#vip-vindue .vip-ikoner { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }",
    "#vip-vindue .vip-ikoner button { padding: 4px 0; font-size: 16px; background: #fff; border: 2px solid #f0e2c4; border-radius: 6px; cursor: pointer; }",
    "#vip-vindue .vip-ikoner button.valgt, #vip-vindue .vip-effekter button.valgt { border-color: #7a1f2e; background: #fff3d6; }",
    "#vip-vindue .vip-prikker { display: flex; flex-wrap: wrap; gap: 6px; }",
    "#vip-vindue .vip-prik { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e2c88e; cursor: pointer; padding: 0; }",
    "#vip-vindue .vip-prik.valgt { outline: 3px solid #7a1f2e; outline-offset: 1px; }",
    "#vip-vindue .vip-effekter { display: flex; flex-wrap: wrap; gap: 4px; }",
    "#vip-vindue .vip-effekter button { padding: 5px 8px; background: #fff; border: 2px solid #f0e2c4; border-radius: 8px; cursor: pointer; color: #3a1a14; font-size: 12px; }",
    "#vip-vindue .vip-kom { list-style: none; margin: 6px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }",
    "#vip-vindue .vip-kom li { padding: 0; }",
    "#vip-vindue .vip-kom button { width: 100%; padding: 6px; background: #fff; border: 1px solid #e2c88e; border-radius: 8px; cursor: pointer; text-align: left; color: #7a1f2e; font-size: 12px; }",
    "#vip-vindue .vip-kom small { display: block; font-size: 10px; color: #8a6a4a; padding: 1px 4px 0; }",
    "@media (max-width: 420px) { #vip-vindue { left: 12px; margin-left: 0; width: calc(100vw - 24px); } }",
    ".vipe-panel { color: #3a1a14; }",
    ".vipe-panel .vipe-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; } .vipe-panel .vipe-top h3 { margin: 0; }",
    ".vipe-panel .oek-soeg button { white-space: nowrap; }",
    ".vipe-panel tr.vipe-gammel td { opacity: .55; }",
    ".vipe-panel .oek-tabel button { padding: 2px 6px; font-size: 11px; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
