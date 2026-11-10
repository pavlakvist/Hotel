// =============================================================
//  ⏰ Loppemarkedets åbningstider + 🧺 banner "Loppemarkedet har åbent nu"
//  - Ejerpanel → Events → 🧺 Loppemarked: ny knap "⏰ Efter tidspunkter" og en boks,
//    hvor man skriver tidspunkter (fx Hver dag 12:00–18:00, eller Lørdag 14:00–16:00).
//    Markedet åbner og lukker så af sig selv (dansk tid). Tiderne kan altid ændres.
//  - Når markedet er åbent, kommer der et banner øverst på hotellet for alle.
//    ✕ lukker det for i dag; næste gang markedet åbner, kommer det igen.
//  - Serveren: database-43-loen-og-loppetider.sql (hv_lop_tider_saet / hv_lop_tider_hent).
//  Hentes fra slutningen af js/panel-forklaring.js og venter selv på js/loppemarked.js.
// =============================================================
(function start(forsoeg) {
  if (window.LOPPE_TIDER_KLAR) return;
  const klar = typeof lopHent === "function" && typeof lopKald === "function" && typeof LOP !== "undefined" &&
    typeof visFane === "function" && typeof ejerIndhold !== "undefined";
  if (!klar) { if (forsoeg < 120) setTimeout(function () { start(forsoeg + 1); }, 500); return; }
  window.LOPPE_TIDER_KLAR = true;

  const DAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const DAG_VALG = [[-1, "Hver dag"], [1, "Mandag"], [2, "Tirsdag"], [3, "Onsdag"], [4, "Torsdag"], [5, "Fredag"], [6, "Lørdag"], [0, "Søndag"]];
  const LUKKET_NOEGLE = "mit-hotel-loppe-banner-lukket";

  let TIDER = [];              // gemt på serveren
  let udkast = null;           // det, man er ved at rette i panelet (null = samme som serveren)
  let tiderFejl = "";
  let tiderStatus = "";

  function r(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function kanServer() { return typeof lopServer === "function" && lopServer(); }
  function laesLager(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function skrivLager(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  // Klokken lige nu i Danmark (uanset hvad computerens ur er sat til)
  function nuDK() {
    try {
      const dele = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Copenhagen", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (p) { dele[p.type] = p.value; });
      const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dele.weekday);
      return { dow: dow, min: (+dele.hour % 24) * 60 + (+dele.minute), dato: dele.year + "-" + dele.month + "-" + dele.day };
    } catch (e) {
      const d = new Date();
      return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes(), dato: d.toISOString().slice(0, 10) };
    }
  }
  function tilMin(t) { if (t === "24:00") return 1440; const d = String(t || "").split(":"); return (+d[0]) * 60 + (+d[1] || 0); }
  function visKl(t) { return t === "24:00" ? "midnat" : "kl. " + t; }

  // Hvilket tidspunkt er markedet åbent i lige nu? (eller null)
  function aktivTid() {
    const n = nuDK();
    return TIDER.find(function (t) { return (t.dag === -1 || t.dag === n.dow) && n.min >= tilMin(t.fra) && n.min < tilMin(t.til); }) || null;
  }
  // Hvornår åbner markedet næste gang? Svarer med tekst som "i dag kl. 12:00" eller "lørdag kl. 14:00".
  function naesteAabning() {
    if (!TIDER.length) return "";
    const n = nuDK();
    for (let dag = 0; dag <= 7; dag++) {
      const dow = (n.dow + dag) % 7;
      const muligt = TIDER.filter(function (t) { return (t.dag === -1 || t.dag === dow) && (dag > 0 || tilMin(t.fra) > n.min); })
        .sort(function (a, b) { return tilMin(a.fra) - tilMin(b.fra); });
      if (muligt.length) return (dag === 0 ? "i dag" : dag === 1 ? "i morgen" : DAGE[dow]) + " kl. " + muligt[0].fra;
    }
    return "";
  }

  // -----------------------------------------------------------
  //  Hent tiderne fra serveren
  // -----------------------------------------------------------
  let henter = false;
  function hentTider() {
    if (henter || !kanServer()) return;
    henter = true;
    lopKald("hv_lop_tider_hent").then(function (svar) {
      henter = false;
      tiderFejl = "";
      const nye = Array.isArray(svar && svar.tider) ? svar.tider.map(function (t) { return { dag: +t.dag, fra: t.fra, til: t.til }; }) : [];
      const aendret = JSON.stringify(nye) !== JSON.stringify(TIDER);
      TIDER = nye;
      if (svar && svar.tilstand) LOP.tilstand = svar.tilstand;
      if (svar && typeof svar.aaben === "boolean" && svar.aaben !== LOP.aaben) { LOP.aaben = svar.aaben; if (typeof lopSidst !== "undefined") lopSidst = ""; lopHent(); }
      if (aendret) { if (typeof lopTjekLaas === "function") lopTjekLaas(); if (paaFanen() && !skriver()) visFane(); }
      visBanner();
    }).catch(function (e) {
      henter = false;
      tiderFejl = /function|schema cache|does not exist|hv_lop_tider/i.test(e && e.message || "")
        ? "Åbningstider kræver, at database-43-loen-og-loppetider.sql er kørt i Supabase." : (e && e.message) || "Fejl";
      if (paaFanen() && !skriver()) visFane();
    });
  }
  setTimeout(hentTider, 1500);
  setInterval(function () { if (paaFanen() || (typeof iLop === "function" && iLop())) hentTider(); }, 5000);
  setInterval(hentTider, 20000);

  // -----------------------------------------------------------
  //  Navigatøren: "Åbner lørdag kl. 14:00" / "Åbent til kl. 18:00"
  // -----------------------------------------------------------
  if (typeof lopTjekLaas === "function") {
    const tjekFoerTider = lopTjekLaas;
    lopTjekLaas = function () {
      tjekFoerTider.apply(this, arguments);
      if (LOP.tilstand !== "tider" || typeof NAV_RUM === "undefined") return;
      const nav = NAV_RUM.find(function (x) { return x.id === LOP_ID; });
      if (!nav) return;
      const nu = aktivTid(), naeste = naesteAabning();
      nav.om = LOP.aaben ? "🟢 Åbent nu" + (nu ? " til " + visKl(nu.til) : "") + " · " + LOP.boder.length + " boder"
        : naeste ? "⏰ Åbner " + naeste : "🔒 Lukket";
    };
  }

  // -----------------------------------------------------------
  //  🧺 Banneret øverst på hotellet
  // -----------------------------------------------------------
  const banner = document.createElement("div");
  banner.id = "loppe-banner";
  banner.hidden = true;
  banner.innerHTML = "<span class='lb-ikon'>🧺</span><div class='lb-tekst'><b>Loppemarkedet har åbent nu!</b><small id='lb-under'></small></div>" +
    "<button type='button' id='lb-gaa'>Gå derind</button><button type='button' id='lb-luk' title='Luk'>✕</button>";
  document.body.appendChild(banner);
  let varAaben = null;
  function aabningsNoegle() {
    const n = nuDK(), t = aktivTid();
    return n.dato + "|" + LOP.tilstand + (LOP.tilstand === "tider" && t ? "|" + t.fra : "");
  }
  function visBanner() {
    const aaben = !!(LOP.hentet && LOP.aaben);
    if (varAaben === false && aaben) skrivLager(LUKKET_NOEGLE, null);    // lige åbnet: vis det igen
    varAaben = aaben;
    const iMarkedet = typeof iLop === "function" && iLop();
    const panelAabent = typeof ejerVindue !== "undefined" && !ejerVindue.hidden;
    const vis = aaben && !iMarkedet && !panelAabent && laesLager(LUKKET_NOEGLE) !== aabningsNoegle();
    if (vis) {
      const t = LOP.tilstand === "tider" ? aktivTid() : null;
      banner.querySelector("#lb-under").textContent = (t ? "Åbent til " + visKl(t.til) + " · " : "") + "Kom og køb, sælg og byt møbler 🛋️";
      // stå under det almindelige nyhedsbanner, hvis det er der
      let top = 10;
      const andet = document.getElementById("banner");
      if (andet && !andet.hidden && andet.offsetParent !== null) {
        const b = andet.getBoundingClientRect();
        if (b.height > 0 && b.top < 200) top = Math.round(b.bottom + 8);
      }
      banner.style.top = top + "px";
    }
    banner.hidden = !vis;
  }
  banner.querySelector("#lb-luk").addEventListener("click", function () { skrivLager(LUKKET_NOEGLE, aabningsNoegle()); banner.hidden = true; });
  banner.querySelector("#lb-gaa").addEventListener("click", function () {
    banner.hidden = true;
    if (typeof gaaTilVaerelse === "function") gaaTilVaerelse(LOP_ID);
  });
  setInterval(visBanner, 1000);

  // -----------------------------------------------------------
  //  Ejerpanel → 🧺 Loppemarked: ⏰ Åbningstider
  // -----------------------------------------------------------
  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === "loppe"; }
  function skriver() { const a = document.activeElement; return !!(a && a.closest && a.closest("#lt-tider") && /INPUT|SELECT/.test(a.tagName)); }
  function liste() { return udkast || TIDER; }

  if (typeof PANEL_HJAELP !== "undefined" && PANEL_HJAELP.loppe && PANEL_HJAELP.loppe.punkter.join("").indexOf("⏰") < 0) {
    PANEL_HJAELP.loppe.punkter.splice(3, 0, "⏰ Efter tidspunkter: skriv fx Hver dag 12:00–18:00. Markedet åbner og lukker selv (dansk tid), og der kommer et banner på hotellet, når det åbner.");
  }

  function tegnTider(sek) {
    const knapper = sek.querySelector(".sp-handlinger");
    if (!knapper) return;
    // knappen "⏰ Efter tidspunkter" ved siden af Åben nu / Lås / Hver søndag
    const k = document.createElement("button");
    k.type = "button";
    k.textContent = "⏰ Efter tidspunkter";
    if (LOP.tilstand === "tider") { k.className = "valgt"; sek.querySelectorAll("[data-lop-tilstand]").forEach(function (b) { b.classList.remove("valgt"); }); }
    const gaa = knapper.querySelector("[data-lop-gaa]");
    if (gaa) knapper.insertBefore(k, gaa); else knapper.appendChild(k);
    k.addEventListener("click", function () {
      if (!TIDER.length) { tiderStatus = "Skriv mindst ét tidspunkt herunder og tryk 💾 Gem tider."; if (!udkast) udkast = [{ dag: -1, fra: "12:00", til: "18:00" }]; visFane(); return; }
      lopKald("hv_lop_status_saet", { p_tilstand: "tider", p_maks: null }).then(function () {
        besked.textContent = "⏰ Loppemarkedet åbner og lukker nu efter tidspunkterne.";
        if (typeof lopSidst !== "undefined") lopSidst = "";
        lopHent(); hentTider();
      }).catch(function (e) { besked.textContent = "⚠️ " + e.message; });
    });

    // status-linjen
    const st = sek.querySelector(".lop-panel-status");
    if (st && LOP.tilstand === "tider") {
      const nu = aktivTid(), naeste = naesteAabning();
      st.textContent = (LOP.aaben ? "🟢 Åbent for alle lige nu" + (nu ? " · lukker " + visKl(nu.til) : "") :
        "🔒 Lukket lige nu" + (naeste ? " · ⏰ åbner " + naeste : "")) ;
    }

    // boksen med tiderne
    const boks = document.createElement("div");
    boks.id = "lt-tider";
    const l = liste();
    boks.innerHTML = "<h3>⏰ Åbningstider</h3>" +
      (tiderFejl ? "<p class='ejer-info'>⚠️ " + r(tiderFejl) + "</p>" : "") +
      "<p class='ejer-info'>Markedet åbner og lukker selv på disse tider (dansk tid), når <b>⏰ Efter tidspunkter</b> er valgt. " +
      "Når det åbner, kommer der et banner på hele hotellet: <i>Loppemarkedet har åbent nu</i>.</p>" +
      (l.length ? l.map(function (t, i) {
        return "<div class='lt-raekke'><select data-lt-dag='" + i + "'>" + DAG_VALG.map(function (d) {
          return "<option value='" + d[0] + "'" + (d[0] === t.dag ? " selected" : "") + ">" + d[1] + "</option>";
        }).join("") + "</select><span>fra</span><input type='time' data-lt-fra='" + i + "' value='" + r(t.fra) + "'>" +
          "<span>til</span><input type='time' data-lt-til='" + i + "' value='" + r(t.til === "24:00" ? "00:00" : t.til) + "'>" +
          "<button type='button' data-lt-slet='" + i + "' title='Fjern'>🗑</button></div>";
      }).join("") : "<p class='ejer-info'>Ingen tider endnu. Tryk ➕ for at tilføje et.</p>") +
      "<div class='sp-handlinger'><button type='button' data-lt-ny>➕ Tilføj tidspunkt</button>" +
      "<button type='button' data-lt-gem" + (udkast ? " class='lt-vigtig'" : "") + ">💾 Gem tider</button>" +
      (udkast ? "<button type='button' data-lt-fortryd>Fortryd</button>" : "") + "</div>" +
      "<p class='lt-status'>" + r(tiderStatus) + "</p>";
    knapper.after(boks);

    function ret() { if (!udkast) udkast = TIDER.map(function (t) { return { dag: t.dag, fra: t.fra, til: t.til }; }); tiderStatus = ""; }
    boks.querySelectorAll("[data-lt-dag]").forEach(function (s) {
      s.addEventListener("change", function () { ret(); udkast[+s.dataset.ltDag].dag = +s.value; visFane(); });
    });
    boks.querySelectorAll("[data-lt-fra], [data-lt-til]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        ret();
        const fra = inp.dataset.ltFra !== undefined;
        const t = udkast[+(fra ? inp.dataset.ltFra : inp.dataset.ltTil)];
        if (fra) t.fra = inp.value; else t.til = inp.value === "00:00" ? "24:00" : inp.value;
        const g = boks.querySelector("[data-lt-gem]"); if (g) g.className = "lt-vigtig";
      });
    });
    boks.querySelectorAll("[data-lt-slet]").forEach(function (b) {
      b.addEventListener("click", function () { ret(); udkast.splice(+b.dataset.ltSlet, 1); visFane(); });
    });
    boks.querySelector("[data-lt-ny]").addEventListener("click", function () {
      ret();
      if (udkast.length >= 21) { tiderStatus = "Højst 21 tidspunkter."; visFane(); return; }
      udkast.push({ dag: -1, fra: "12:00", til: "18:00" });
      visFane();
    });
    const fortryd = boks.querySelector("[data-lt-fortryd]");
    if (fortryd) fortryd.addEventListener("click", function () { udkast = null; tiderStatus = ""; visFane(); });
    boks.querySelector("[data-lt-gem]").addEventListener("click", function () {
      const nye = liste().map(function (t) { return { dag: t.dag, fra: t.fra, til: t.til }; });
      for (let i = 0; i < nye.length; i++) {
        if (!/^\d\d:\d\d$/.test(nye[i].fra) || !/^\d\d:\d\d$/.test(nye[i].til)) { tiderStatus = "⚠️ Skriv et klokkeslæt i både fra og til."; visFane(); return; }
        if (tilMin(nye[i].til) <= tilMin(nye[i].fra)) { tiderStatus = "⚠️ Lukketiden skal være efter åbningstiden (" + nye[i].fra + "–" + (nye[i].til === "24:00" ? "00:00" : nye[i].til) + ")."; visFane(); return; }
      }
      tiderStatus = "⏳ Gemmer …"; visFane();
      lopKald("hv_lop_tider_saet", { p_tider: nye }).then(function () {
        TIDER = nye; udkast = null; LOP.tilstand = "tider";
        const naeste = naesteAabning();
        tiderStatus = "✅ Gemt! " + (nye.length ? (aktivTid() ? "Markedet er åbent nu." : naeste ? "Markedet åbner " + naeste + "." : "") : "Uden tider er markedet lukket.");
        besked.textContent = "⏰ Loppemarkedets åbningstider er gemt.";
        if (typeof lopSidst !== "undefined") lopSidst = "";
        lopHent(); hentTider();
        visFane();
      }).catch(function (e) {
        tiderStatus = /function|schema cache|does not exist|hv_lop_tider/i.test(e && e.message || "")
          ? "⚠️ Kør først database-43-loen-og-loppetider.sql i Supabase." : "⚠️ " + e.message;
        visFane();
      });
    });
  }

  const visFaneFoerTider = visFane;
  visFane = function () {
    visFaneFoerTider.apply(this, arguments);
    if (!paaFanen()) return;
    const sek = ejerIndhold.querySelector(".lop-panel");
    if (sek && !sek.querySelector("#lt-tider")) tegnTider(sek);
  };

  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#loppe-banner { position: fixed; left: 50%; top: 10px; transform: translateX(-50%); z-index: 46; display: flex; align-items: center; gap: 10px;",
    "  max-width: calc(100vw - 24px); box-sizing: border-box; padding: 8px 10px 8px 14px; font-family: Verdana, sans-serif;",
    "  background: linear-gradient(180deg, #8e2536, #6e1b29); color: #fbeacb; border: 3px solid #d9a441; border-radius: 14px;",
    "  box-shadow: 0 6px 18px rgba(60,10,20,.4); animation: lb-ind .5s ease-out; }",
    "#loppe-banner[hidden] { display: none !important; }",
    "@keyframes lb-ind { from { opacity: 0; transform: translate(-50%, -14px); } to { opacity: 1; transform: translate(-50%, 0); } }",
    "#loppe-banner .lb-ikon { font-size: 26px; animation: lb-vip 1.6s ease-in-out infinite; }",
    "@keyframes lb-vip { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }",
    "#loppe-banner .lb-tekst { display: flex; flex-direction: column; min-width: 0; }",
    "#loppe-banner .lb-tekst b { font: bold 16px Georgia, serif; color: #f6dfa0; }",
    "#loppe-banner .lb-tekst small { font-size: 11px; color: #f3dcc0; }",
    "#loppe-banner button { cursor: pointer; font: bold 12px Verdana, sans-serif; border-radius: 8px; }",
    "#lb-gaa { background: #d9a441 !important; color: #4a1a10 !important; border: 1px solid #f6dfa0 !important; padding: 6px 10px !important; white-space: nowrap; }",
    "#lb-luk { background: rgba(0,0,0,.2) !important; color: #f6dfa0 !important; border: 1px solid rgba(246,223,160,.5) !important; width: 26px; height: 26px; padding: 0 !important; }",
    "#lt-tider { margin: 10px 0 6px; padding: 8px 10px; background: #fbf3e4; border: 2px solid #d9a441; border-radius: 10px; color: #3a1a14; }",
    "#lt-tider h3 { margin: 0 0 4px; }",
    "#lt-tider .lt-raekke { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 5px 0; }",
    "#lt-tider .lt-raekke span { font-size: 12px; color: #6a5a4a; }",
    "#lt-tider select, #lt-tider input { border: 1px solid #d9a441; border-radius: 6px; padding: 4px 6px; font: 12px Verdana, sans-serif; background: #fff; color: #3a1a14; }",
    "#lt-tider .lt-raekke button { padding: 3px 7px !important; }",
    "#lt-tider button.lt-vigtig { outline: 2px solid #d9a441; font-weight: bold; }",
    "#lt-tider .lt-status { font-size: 12px; color: #7a1f2e; min-height: 1em; margin: 4px 0 0; }",
  ].join("\n");
  document.head.appendChild(stil);
})(0);
