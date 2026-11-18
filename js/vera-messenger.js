// =============================================================
//  💜 Vera-Messenger — skriv med ALLE på hotellet (også dem, man ikke er venner med)
//  Hentes i App Butik på telefonen for 5 Glimt (betaler man én gang, kan man
//  altid hente den igen gratis). Ejeren får den gratis.
//  - 💬 Chats: alle mine samtaler, ulæste står med fed + lavendel prik
//  - 🌍 Hele hotellet: fælles chat for alle gæster og ansatte
//  - ✏️ Ny besked: søg efter hvem som helst og skriv til dem
//  - Tryk på en boble: kopiér, slet (egne – ejer/MOD alle) eller 🚩 rapportér
//  - Mutet/frosset/bannet = man kan ikke skrive (samme straffe som chatten)
//  - Grimme ord bliver til *** (samme chatfilter som i rummene)
//  - 👑 Alle samtaler: ejeren (og ansatte med adgang til private beskeder)
//    kan læse alle private samtaler, også slettede beskeder
//  Kræver database-64-vera-messenger.sql. Hentes fra js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.veraMessengerKlar) return;
  window.veraMessengerKlar = true;

  const PRIS = 5;
  const ID = "messenger";

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
  function mig() { return typeof FIGUR !== "undefined" && FIGUR.navn ? FIGUR.navn : ""; }
  function ejerNavne() { return typeof EJER_NAVNE !== "undefined" ? EJER_NAVNE : (typeof EJERE !== "undefined" ? EJERE : []); }
  function erEjerLokal(n) { return ejerNavne().indexOf(n || mig()) >= 0; }
  function online() { return typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function kald(fn, data) { return serverKald(fn, Object.assign({ p_token: mitToken() }, data || {})); }
  function manglerDb(e) { return /function|schema cache|does not exist|Could not find/i.test(e && e.message || ""); }
  const DB_FEJL = "Vera-Messenger virker, når database-64-vera-messenger.sql er kørt i Supabase.";
  function kl(t) { const d = new Date(t); return ("0" + d.getHours()).slice(-2) + "." + ("0" + d.getMinutes()).slice(-2); }
  function naar(t) {
    if (!t) return "";
    const d = new Date(t), nu = new Date();
    if (d.toDateString() === nu.toDateString()) return kl(t);
    const g = new Date(nu); g.setDate(nu.getDate() - 1);
    if (d.toDateString() === g.toDateString()) return "I går";
    if (nu - d < 6 * 864e5) return ["søn", "man", "tir", "ons", "tor", "fre", "lør"][d.getDay()];
    return d.getDate() + "/" + (d.getMonth() + 1);
  }
  function aktivTekst(t) {
    if (!t) return "";
    const m = Math.floor((Date.now() - t) / 60000);
    if (m < 3) return "Aktiv nu";
    if (m < 60) return "Aktiv for " + m + " min. siden";
    const h = Math.floor(m / 60);
    if (h < 24) return "Aktiv for " + h + " t. siden";
    return "Aktiv for " + Math.floor(h / 24) + " d. siden";
  }
  function erOnline(t) { return t && Date.now() - t < 3 * 60000; }
  const SKILT_NAVN = { mod: "Mod", staff: "Staff", hjaelper: "Hjælper", eventvaert: "Eventvært", eventfolk: "Eventfolk", bygmester: "Bygmester",
    support: "Support", "content-creator": "Content creator", radiovaert: "Radiovært", biografhjaelper: "Biograf medhjælper", festivalvagt: "Festivalvagt", vip: "VIP" };
  function maerke(skilt, ejer) {
    if (ejer) return "<span class='vmsg-maerke ejer'>👑 Ejer</span>";
    if (skilt && skilt !== "gaest" && SKILT_NAVN[skilt]) return "<span class='vmsg-maerke'>" + esc(SKILT_NAVN[skilt]) + "</span>";
    return "";
  }
  // runde profilbilleder med forbogstav i en farve, der passer til navnet
  const AV_FARVER = ["#9b6bff", "#c46bff", "#6b7bff", "#ff6bb5", "#6bc4ff", "#b58cff", "#ff8fa3", "#7fd1b9", "#ffb36b", "#8a6bff"];
  function avFarve(n) { let h = 0; String(n).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return AV_FARVER[h % AV_FARVER.length]; }
  function av(navn, str, prik) {
    str = str || 44;
    if (navn === "alle") return "<span class='vmsg-av alle' style='width:" + str + "px;height:" + str + "px;font-size:" + Math.round(str * .48) + "px'>🏨</span>";
    return "<span class='vmsg-av' style='width:" + str + "px;height:" + str + "px;font-size:" + Math.round(str * .42) + "px;background:" + avFarve(navn) + "'>" +
      esc(String(navn || "?").charAt(0).toUpperCase()) + (prik ? "<i class='vmsg-online'></i>" : "") + "</span>";
  }
  function rens(t) { try { return typeof rensTekst === "function" ? rensTekst(t) : t; } catch (e) { return t; } }
  function smil(t) { try { return typeof lavSmileyer === "function" ? lavSmileyer(t) : t; } catch (e) { return t; } }
  function lokalStraf() {
    try {
      if (erEjerLokal()) return "";
      if (typeof erBannet === "function" && erBannet(mig())) return "Du er bannet og kan ikke skrive.";
      if (typeof erFrosset === "function" && erFrosset(mig())) return "🧊 Du er frosset og kan ikke skrive lige nu.";
      if (typeof harTimeout === "function" && harTimeout(mig())) return "🔇 Du er mutet og kan ikke skrive lige nu.";
    } catch (e) {}
    return "";
  }

  // ---------------------------------------------------------------
  //  Tilstand
  // ---------------------------------------------------------------
  let api = null, appEl = null;
  let status = null;             // { koebt, ejer, se_alle, mod, straf }
  let statusFejl = "";
  let samtaler = [];             // fra hv_messenger_samtaler
  let straf = "";
  let skaerm = "liste";          // liste | ny | samtale | ejer | ejerlaes
  let fane = "chats";            // chats | ejer
  let med = null;                // navnet i den åbne samtale (eller "alle")
  let samtale = null;            // svaret fra hv_messenger_samtale
  let soegTekst = "", soegRes = null, aktiveNu = [];
  let ejerListe = null, ejerSoeg = "", ejerLaes = null, ejerSamtale = "", ejerPar = [];
  let udkast = {};               // ikke-sendt tekst pr. samtale
  let fejl = "";
  let sidsteSete = +(gemt("sete") || 0);   // højeste besked-id, der er vist notifikation for
  let menuFor = null;            // id på boblen med menu
  let rapportFor = null;
  let sender = false;

  function gemt(k) { try { return localStorage.getItem("mit-hotel-vera-messenger-" + k + "-" + mig()); } catch (e) { return null; } }
  function gem(k, v) { try { localStorage.setItem("mit-hotel-vera-messenger-" + k + "-" + mig(), v); } catch (e) {} }

  function ulaesteIalt() { return samtaler.reduce(function (s, x) { return s + (x.samtale === "alle" ? 0 : +x.ulaeste || 0); }, 0); }
  function harKoebt() { return !!(status && status.koebt) || erEjerLokal(); }

  // ---------------------------------------------------------------
  //  Server
  // ---------------------------------------------------------------
  function hentStatus() {
    if (!online()) { statusFejl = "Vera-Messenger virker, når du er logget ind på hotellets server."; return Promise.resolve(null); }
    return kald("hv_messenger_status").then(function (s) { status = s; statusFejl = ""; straf = s.straf || ""; maerkKnapper(); return s; })
      .catch(function (e) { statusFejl = manglerDb(e) ? DB_FEJL : e.message; return null; });
  }
  function hentSamtaler(stille) {
    if (!online() || !harKoebt()) return Promise.resolve();
    return kald("hv_messenger_samtaler").then(function (r) {
      const gamle = {};
      samtaler.forEach(function (x) { gamle[x.samtale] = x.sidst_id; });
      samtaler = r.samtaler || [];
      straf = r.straf || "";
      // notifikationer om nye beskeder
      const nyeste = +r.nyeste || 0;
      if (sidsteSete && !stille) {
        samtaler.forEach(function (x) {
          if (x.sidst_id > sidsteSete && x.fra !== mig() && x.samtale !== "alle" && !(skaerm === "samtale" && samtale && samtale.samtale === x.samtale && appEl)) {
            if (typeof window.tlfNotis === "function") window.tlfNotis(ID, x.fra, x.tekst);
          }
        });
      }
      if (nyeste > sidsteSete) { sidsteSete = nyeste; gem("sete", String(nyeste)); }
      if (typeof window.tlfOpdaterHjem === "function") window.tlfOpdaterHjem();
      if (appEl && skaerm === "liste") tegnListe();
    }).catch(function (e) { if (manglerDb(e)) statusFejl = DB_FEJL; });
  }
  function hentSamtale(navn, beholdScroll) {
    return kald("hv_messenger_samtale", { p_med: navn, p_foer: 0 }).then(function (r) {
      if (med !== navn) return;
      const nyt = !samtale || samtale.samtale !== r.samtale || (samtale.beskeder.length && r.beskeder.length && samtale.beskeder[samtale.beskeder.length - 1].id !== r.beskeder[r.beskeder.length - 1].id) || samtale.beskeder.length !== r.beskeder.length;
      const aendret = nyt || JSON.stringify(samtale.beskeder) !== JSON.stringify(r.beskeder) || samtale.deres_laest !== r.deres_laest;
      samtale = r;
      fejl = "";
      if (aendret && appEl && skaerm === "samtale") tegnSamtale(!nyt && beholdScroll);
      // læst nu – tallet skal opdateres
      const x = samtaler.find(function (s) { return s.samtale === r.samtale; });
      if (x && x.ulaeste) { x.ulaeste = 0; if (typeof window.tlfOpdaterHjem === "function") window.tlfOpdaterHjem(); }
    }).catch(function (e) { fejl = manglerDb(e) ? DB_FEJL : e.message; if (appEl && skaerm === "samtale") tegnSamtale(true); });
  }
  function soeg(q) {
    return kald("hv_messenger_soeg", { p_soeg: q || "" }).then(function (l) { return Array.isArray(l) ? l : []; }).catch(function () { return []; });
  }

  // tjek nye beskeder: hurtigt når appen er åben, roligere ellers
  let pollT = 0;
  function poll() {
    clearTimeout(pollT);
    const p = !status ? hentStatus() : harKoebt() ? hentSamtaler() : Promise.resolve();
    p.then(function () {
      if (appEl && skaerm === "samtale" && med) return hentSamtale(med, true);
    }).finally(function () { pollT = setTimeout(poll, appEl ? 3500 : 8000); });
  }

  // ---------------------------------------------------------------
  //  🛒 Køb: HENT-knappen i App Butik koster 5 Glimt
  // ---------------------------------------------------------------
  let tilladHent = false;
  function maerkKnapper() {
    const tlf = document.getElementById("telefon");
    if (!tlf) return;
    tlf.querySelectorAll("[data-abhent='" + ID + "']").forEach(function (b) {
      const t = harKoebt() ? "HENT" : PRIS + " ⭐";
      if (b.textContent !== t) b.textContent = t;
      b.classList.toggle("vmsg-pris", !harKoebt());
      b.title = harKoebt() ? (erEjerLokal() ? "Gratis for ejeren 👑" : "Du har allerede købt appen – hent den gratis") : "Koster " + PRIS + " Glimt";
    });
  }
  vent(function () { return !!document.getElementById("telefon"); }, function () {
    new MutationObserver(function () { maerkKnapper(); }).observe(document.getElementById("telefon"), { childList: true, subtree: true });
  });
  document.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest("[data-abhent='" + ID + "']");
    if (!b || tilladHent) return;
    if (harKoebt()) return;               // købt før (eller ejer) = gratis
    e.stopPropagation();
    e.preventDefault();
    visKoebBoks(b);
  }, true);
  function visKoebBoks(knap) {
    const app = knap.closest(".tlf-app") || document.getElementById("telefon");
    if (!app || app.querySelector(".vmsg-koeb-bag")) return;
    const g = typeof glimt !== "undefined" ? glimt : null;
    const boks = document.createElement("div");
    boks.className = "vmsg-koeb-bag";
    let fejlTekst = statusFejl;
    boks.innerHTML = "<div class='vmsg-koeb'>" + "<span class='vmsg-koeb-ik'>" + IKON_STOR + "</span><b>Vera-Messenger</b>" +
      "<p>Skriv med alle på hotellet – også dem, du ikke er venner med. Fælles chat med gæster og ansatte.</p>" +
      "<div class='vmsg-koeb-pris'>" + PRIS + " ⭐ Glimt</div>" +
      (g !== null ? "<small>Du har " + g + " Glimt</small>" : "") +
      "<div class='vmsg-koeb-fejl'>" + esc(fejlTekst) + "</div>" +
      "<div class='vmsg-koeb-knapper'><button class='nej'>Annullér</button><button class='ja'" + (fejlTekst ? " disabled" : "") + ">Køb</button></div></div>";
    app.appendChild(boks);
    boks.querySelector(".nej").addEventListener("click", function (ev) { ev.stopPropagation(); boks.remove(); });
    boks.addEventListener("click", function (ev) { ev.stopPropagation(); if (ev.target === boks) boks.remove(); });
    boks.querySelector(".ja").addEventListener("click", function (ev) {
      ev.stopPropagation();
      const ja = ev.currentTarget;
      ja.disabled = true; ja.textContent = "Køber …";
      kald("hv_messenger_koeb_app").then(function (r) {
        if (typeof saetPenge === "function") { try { saetPenge({ glimt: r.glimt, stella: r.stella }, false); } catch (x) {} }
        status = Object.assign({}, status || {}, { koebt: true });
        boks.remove();
        if (api && api.lille) api.lille(r.betalt ? "💜 Købt for " + PRIS + " Glimt – appen hentes nu" : "💜 Du havde allerede købt appen");
        tilladHent = true;
        const k = document.querySelector("#telefon [data-abhent='" + ID + "']") || knap;
        try { k.click(); } finally { tilladHent = false; }
        hentSamtaler(true);
      }).catch(function (er) {
        ja.disabled = false; ja.textContent = "Køb";
        boks.querySelector(".vmsg-koeb-fejl").textContent = manglerDb(er) ? DB_FEJL : er.message;
      });
    });
  }

  // ---------------------------------------------------------------
  //  Ikon
  // ---------------------------------------------------------------
  const IKON = "<path d='M12 3.2c-5 0-8.8 3.6-8.8 8.2 0 2.5 1.1 4.6 3 6.1v3.3l3.1-1.7c.9.3 1.8.4 2.7.4 5 0 8.8-3.6 8.8-8.1S17 3.2 12 3.2z' fill='#fff'/>" +
    "<path d='M12 15.6s-3.6-2.2-3.6-4.6c0-1.2.9-2.1 2-2.1.7 0 1.3.4 1.6.9.3-.5.9-.9 1.6-.9 1.1 0 2 .9 2 2.1 0 2.4-3.6 4.6-3.6 4.6z' fill='#8b4dff'/>";
  const IKON_STOR = "<svg viewBox='0 0 24 24' width='54' height='54'>" + IKON + "</svg>";

  const APP = {
    navn: "Vera-Messenger", ikSvg: IKON, bg: "linear-gradient(135deg, #c39bff, #7b3cf0 55%, #4a1aa8)", butik: true,
    tekst: "💜 Skriv med ALLE på hotellet – også dem, du ikke er venner med. Fælles chat for gæster og ansatte. Koster " + PRIS + " Glimt (kun én gang).",
    tal: function () { return ulaesteIalt(); },
    tegn: function (el, a) {
      api = a; appEl = el;
      el.classList.add("vmsg-app");
      morkStatus(false);
      skaerm = "liste"; menuFor = null; rapportFor = null;
      tegn();
      hentStatus().then(function () { tegn(); return hentSamtaler(true); }).then(function () { tegn(); poll(); });
      soeg("").then(function (l) { aktiveNu = l.filter(function (x) { return erOnline(x.aktiv); }).slice(0, 12); if (appEl && skaerm === "liste") tegnListe(); });
    },
    luk: function () { gemUdkast(); api = null; appEl = null; med = null; samtale = null; },
  };
  // statuslinjen (ur/batteri) skal være lys på den mørke lilla baggrund
  function morkStatus(moerk) {
    const s = document.querySelector("#telefon .tlf-status");
    if (s) s.classList.toggle("moerk", moerk);
    const h = document.querySelector("#telefon .tlf-hjemlinje, #telefon .tlf-hjem-linje");
    if (h) h.classList.toggle("moerk", moerk);
  }
  function lille(t) { if (api && api.lille) api.lille(t); }
  function gemUdkast() {
    const i = appEl && appEl.querySelector(".vmsg-input");
    if (i && samtale) udkast[samtale.samtale] = i.value;
  }

  // ---------------------------------------------------------------
  //  Tegning
  // ---------------------------------------------------------------
  function tegn() {
    if (!appEl) return;
    morkStatus(false);
    if (statusFejl && !status) { tegnFejl(statusFejl); return; }
    if (!status) { appEl.innerHTML = topHtml("Vera-Messenger") + "<div class='vmsg-krop vmsg-midt'><div class='vmsg-spinner'></div></div>"; return; }
    if (!harKoebt()) { tegnKoebIApp(); return; }
    if (skaerm === "samtale") tegnSamtale();
    else if (skaerm === "ny") tegnNy();
    else if (skaerm === "ejerlaes") tegnEjerLaes();
    else tegnListe();
  }
  function topHtml(titel, hoejre) {
    return "<div class='vmsg-top'><button class='vmsg-tb' data-vmsg='hjem' title='Hjem'>‹</button><h3>" + titel + "</h3>" + (hoejre || "<span class='vmsg-tb'></span>") + "</div>";
  }
  function tegnFejl(t) {
    appEl.innerHTML = topHtml("Vera-Messenger") + "<div class='vmsg-krop vmsg-midt'><span class='vmsg-stor-ik'>" + IKON_STOR + "</span><p class='vmsg-fejl'>⚠️ " + esc(t) + "</p></div>";
  }
  function tegnKoebIApp() {
    appEl.innerHTML = topHtml("Vera-Messenger") + "<div class='vmsg-krop vmsg-midt'><span class='vmsg-stor-ik'>" + IKON_STOR + "</span>" +
      "<h2>Vera-Messenger</h2><p>Køb appen i App Butik for " + PRIS + " ⭐ Glimt for at skrive med alle på hotellet.</p>" +
      "<button class='vmsg-knap' data-vmsg='butik'>Gå til App Butik</button></div>";
  }

  // ----- 💬 Listen over samtaler -----
  function tegnListe() {
    if (!appEl) return;
    const rul = appEl.querySelector(".vmsg-krop");
    const scroll = rul ? rul.scrollTop : 0;
    const fokus = document.activeElement && document.activeElement.classList.contains("vmsg-soeg-felt");
    const seAlle = status && status.se_alle;
    let h = "<div class='vmsg-hoved'><span class='vmsg-mig'>" + av(mig(), 34) + "</span><h2" + (fane === "ejer" && seAlle ? " class='lille'" : "") + ">" + (fane === "ejer" && seAlle ? "👑 Alle samtaler" : "Chats") + "</h2>" +
      "<button class='vmsg-rund' data-vmsg='ny' title='Ny besked'>✏️</button><button class='vmsg-rund' data-vmsg='hjem' title='Luk'>✕</button></div>";
    if (seAlle) h += "<div class='vmsg-faner'><button data-vmsgfane='chats'" + (fane === "chats" ? " class='valgt'" : "") + ">💬 Mine chats</button><button data-vmsgfane='ejer'" + (fane === "ejer" ? " class='valgt'" : "") + ">👑 Alle samtaler</button></div>";
    if (fane === "ejer" && seAlle) { appEl.innerHTML = h + "<div class='vmsg-krop'>" + ejerListeHtml() + "</div>"; kobEjerSoeg(); return; }
    h += "<div class='vmsg-krop'>";
    h += "<label class='vmsg-soeg'>🔍<input class='vmsg-soeg-felt' placeholder='Søg efter alle på hotellet' value='" + esc(soegTekst) + "'></label>";
    if (soegTekst) {
      h += "<div class='vmsg-afsnit'>Personer</div>" + (soegRes === null ? "<div class='vmsg-lille'>Søger …</div>" : soegRes.length ? soegRes.map(personRaekke).join("") : "<div class='vmsg-lille'>Ingen hedder noget med \"" + esc(soegTekst) + "\".</div>");
    } else {
      if (aktiveNu.length) h += "<div class='vmsg-aktive'>" + aktiveNu.map(function (p) {
        return "<button data-vmsgmed='" + esc(p.navn) + "'>" + av(p.navn, 50, true) + "<span>" + esc(p.navn) + "</span></button>";
      }).join("") + "</div>";
      if (straf) h += "<div class='vmsg-straf'>" + esc(straf) + "</div>";
      // den fælles chat står altid øverst
      const alle = samtaler.find(function (x) { return x.samtale === "alle"; }) || { samtale: "alle", med: "alle", fra: "", tekst: "Skriv til alle gæster og ansatte på hotellet", tid: 0, ulaeste: 0 };
      h += samtaleRaekke(alle);
      const priv = samtaler.filter(function (x) { return x.samtale !== "alle"; });
      h += priv.length ? priv.map(samtaleRaekke).join("") :
        "<div class='vmsg-tom'><b>Ingen samtaler endnu</b><span>Tryk på ✏️ eller søg efter en gæst for at skrive – I behøver ikke være venner.</span></div>";
    }
    h += "</div>";
    appEl.innerHTML = h;
    const r2 = appEl.querySelector(".vmsg-krop");
    if (r2) r2.scrollTop = scroll;
    const f = appEl.querySelector(".vmsg-soeg-felt");
    f.addEventListener("input", function () {
      soegTekst = f.value.trim(); soegRes = null;
      clearTimeout(f.t);
      f.t = setTimeout(function () {
        const q = soegTekst;
        if (!q) { tegnListe(); return; }
        soeg(q).then(function (l) { if (q === soegTekst) { soegRes = l; tegnListe(); } });
      }, 250);
      if (!soegTekst) tegnListe();
    });
    if (fokus) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }
  function samtaleRaekke(x) {
    const ul = +x.ulaeste || 0;
    const navn = x.samtale === "alle" ? "🌍 Hele hotellet" : esc(x.med);
    const fra = x.samtale === "alle" && x.fra ? (x.fra === mig() ? "Dig" : esc(x.fra)) + ": " : x.fra === mig() ? "Dig: " : "";
    const tekst = x.slettet ? "<i>Besked slettet</i>" : fra + esc(smil(x.tekst || ""));
    return "<button class='vmsg-raekke" + (ul ? " ulaest" : "") + "' data-vmsgmed='" + esc(x.med) + "'>" + av(x.med, 52, x.samtale !== "alle" && erOnline(x.aktiv)) +
      "<span class='vmsg-r-tekst'><b>" + navn + " " + (x.samtale === "alle" ? "<span class='vmsg-maerke alle'>Gæster + ansatte</span>" : maerke(x.skilt, x.ejer)) + "</b>" +
      "<span>" + tekst + (x.tid ? " · " + naar(x.tid) : "") + "</span></span>" + (ul ? "<i class='vmsg-prik'>" + (ul > 9 ? "9+" : ul) + "</i>" : "") + "</button>";
  }
  function personRaekke(p) {
    return "<button class='vmsg-raekke' data-vmsgmed='" + esc(p.navn) + "'>" + av(p.navn, 44, erOnline(p.aktiv)) +
      "<span class='vmsg-r-tekst'><b>" + esc(p.navn) + " " + maerke(p.skilt, p.ejer) + "</b><span>" + (aktivTekst(p.aktiv) || "Gæst på hotellet") + (p.har ? "" : " · har ikke appen endnu") + "</span></span></button>";
  }

  // ----- ✏️ Ny besked -----
  function tegnNy() {
    let h = "<div class='vmsg-top'><button class='vmsg-tb' data-vmsg='liste'>‹</button><h3>Ny besked</h3><span class='vmsg-tb'></span></div>" +
      "<div class='vmsg-til'>Til: <input class='vmsg-til-felt' placeholder='Skriv et navn …' value='" + esc(soegTekst) + "'></div><div class='vmsg-krop'>";
    h += "<button class='vmsg-raekke' data-vmsgmed='alle'>" + av("alle", 44) + "<span class='vmsg-r-tekst'><b>🌍 Hele hotellet</b><span>Fælles chat for alle gæster og ansatte</span></span></button>";
    h += "<div class='vmsg-afsnit'>" + (soegTekst ? "Personer" : "Foreslået") + "</div>";
    h += soegRes === null ? "<div class='vmsg-lille'>Henter …</div>" : soegRes.length ? soegRes.map(personRaekke).join("") : "<div class='vmsg-lille'>Ingen fundet.</div>";
    appEl.innerHTML = h + "</div>";
    const f = appEl.querySelector(".vmsg-til-felt");
    f.focus(); f.setSelectionRange(f.value.length, f.value.length);
    f.addEventListener("input", function () {
      soegTekst = f.value.trim();
      clearTimeout(f.t);
      f.t = setTimeout(function () { const q = soegTekst; soeg(q).then(function (l) { if (q === soegTekst && skaerm === "ny") { soegRes = l; tegnNy(); } }); }, 250);
    });
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" && soegRes && soegRes[0]) aabnSamtale(soegRes[0].navn); });
  }

  // ----- 💬 Én samtale -----
  function aabnSamtale(navn) {
    gemUdkast();
    med = navn; samtale = null; skaerm = "samtale"; menuFor = null; rapportFor = null; fejl = "";
    soegTekst = ""; soegRes = null;
    tegnSamtale();
    hentSamtale(navn, false);
  }
  function tegnSamtale(beholdScroll) {
    if (!appEl) return;
    const gl = appEl.querySelector(".vmsg-beskeder");
    const fraBund = gl ? gl.scrollHeight - gl.scrollTop - gl.clientHeight : 0;
    const gScroll = gl ? gl.scrollTop : 0;
    const gInput = appEl.querySelector(".vmsg-input");
    const harFokus = gInput && document.activeElement === gInput;
    if (gInput && samtale) udkast[samtale.samtale] = gInput.value;
    const alle = med === "alle";
    const s = samtale;
    let h = "<div class='vmsg-top samtale'><button class='vmsg-tb' data-vmsg='liste'>‹</button>" + av(med, 36, !alle && s && erOnline(s.aktiv)) +
      "<span class='vmsg-top-navn'><b>" + (alle ? "🌍 Hele hotellet" : esc(med) + " " + (s ? maerke(s.skilt, erEjerLokal(med)) : "")) + "</b><small>" +
      (alle ? "Gæster og ansatte" : s ? aktivTekst(s.aktiv) : "") + "</small></span>" +
      (alle ? "<span class='vmsg-tb'></span>" : "<button class='vmsg-tb' data-vmsg='mere' title='Mere'>ⓘ</button>") + "</div>";
    h += "<div class='vmsg-beskeder'>";
    if (!s) h += fejl ? "<p class='vmsg-fejl'>⚠️ " + esc(fejl) + "</p>" : "<div class='vmsg-midt'><div class='vmsg-spinner'></div></div>";
    else {
      h += "<div class='vmsg-samtale-start'>" + av(med, 64) + "<b>" + (alle ? "Hele hotellet" : esc(med)) + "</b><small>" +
        (alle ? "Her kan alle gæster og ansatte skrive sammen. Vær søde ved hinanden 💜" : "I behøver ikke være venner for at skrive på Vera-Messenger.") + "</small></div>";
      let forrige = null;
      s.beskeder.forEach(function (b, i) {
        const min = b.fra === mig();
        const naeste = s.beskeder[i + 1];
        if (!forrige || b.tid - forrige.tid > 30 * 60000) h += "<div class='vmsg-tid'>" + naar(b.tid) + (new Date(b.tid).toDateString() === new Date().toDateString() ? "" : " " + kl(b.tid)) + "</div>";
        const foerst = !forrige || forrige.fra !== b.fra || b.tid - forrige.tid > 30 * 60000;
        const sidst = !naeste || naeste.fra !== b.fra || naeste.tid - b.tid > 30 * 60000;
        h += "<div class='vmsg-linje" + (min ? " min" : "") + (sidst ? " sidst" : "") + "'>";
        if (!min) h += "<span class='vmsg-av-plads'>" + (sidst ? av(b.fra, 26) : "") + "</span>";
        h += "<span class='vmsg-boble-kol'>";
        if (alle && !min && foerst) h += "<small class='vmsg-fra'>" + esc(b.fra) + " " + maerke(b.skilt, b.ejer) + "</small>";
        h += "<span class='vmsg-boble" + (b.slettet ? " slettet" : "") + "' data-vmsgb='" + b.id + "' title='" + kl(b.tid) + "'>" + (b.slettet ? "Besked slettet" : esc(smil(b.tekst))) + "</span>";
        if (menuFor === b.id && !b.slettet) {
          const maaSlette = min || (status && (status.mod || status.ejer));
          h += "<span class='vmsg-menu'><button data-vmsg='kopier' data-id='" + b.id + "'>📋 Kopiér</button>" +
            (maaSlette ? "<button data-vmsg='slet' data-id='" + b.id + "'>🗑 Slet</button>" : "") +
            (!min ? "<button data-vmsg='rapport' data-id='" + b.id + "'>🚩 Rapportér</button>" : "") + "</span>";
        }
        if (rapportFor === b.id) h += rapportHtml(b);
        h += "</span></div>";
        forrige = b;
      });
      // "Set" under min sidste besked, når den anden har læst den
      const minSidste = s.beskeder.filter(function (b) { return b.fra === mig(); }).pop();
      if (!alle && minSidste && s.beskeder[s.beskeder.length - 1] === minSidste) {
        h += "<div class='vmsg-set'>" + (s.deres_laest >= minSidste.id ? av(med, 14) + " Set" : "Sendt") + "</div>";
      }
    }
    h += "</div>";
    const strafNu = straf || lokalStraf();
    if (s && s.blokeret) h += "<div class='vmsg-bund-info'>Du har blokeret " + esc(med) + ". <button data-vmsg='fjernblok'>Fjern blokering</button></div>";
    else if (strafNu) h += "<div class='vmsg-bund-info straf'>" + esc(strafNu) + "</div>";
    else h += "<div class='vmsg-skriv'><input class='vmsg-input' maxlength='500' placeholder='" + (alle ? "Skriv til hele hotellet …" : "Aa") + "'><button class='vmsg-send' data-vmsg='send' title='Send'>➤</button><button class='vmsg-hjerte' data-vmsg='hjerte' title='Send et hjerte'>💜</button></div>";
    if (fejl && s) h += "<div class='vmsg-fejl-bund'>⚠️ " + esc(fejl) + "</div>";
    appEl.innerHTML = h;
    const bs = appEl.querySelector(".vmsg-beskeder");
    if (beholdScroll && fraBund > 40) bs.scrollTop = gScroll; else bs.scrollTop = bs.scrollHeight;
    const inp = appEl.querySelector(".vmsg-input");
    if (inp) {
      inp.value = (s && udkast[s.samtale]) || "";
      opdSendKnap();
      inp.addEventListener("input", opdSendKnap);
      inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); send(); } });
      if (harFokus || !beholdScroll) inp.focus();
    }
  }
  function opdSendKnap() {
    const inp = appEl && appEl.querySelector(".vmsg-input");
    if (!inp) return;
    const tom = !inp.value.trim();
    appEl.querySelector(".vmsg-send").style.display = tom ? "none" : "";
    appEl.querySelector(".vmsg-hjerte").style.display = tom ? "" : "none";
  }
  const GRUNDE = ["Grimt sprog", "Mobning", "Spam", "Snyd eller svindel", "Upassende indhold", "Andet"];
  function rapportHtml(b) {
    return "<span class='vmsg-rapport'><b>🚩 Rapportér besked fra " + esc(b.fra) + "</b><small>Hvorfor?</small>" +
      GRUNDE.map(function (g) { return "<button data-vmsg='rapgrund' data-id='" + b.id + "' data-grund='" + esc(g) + "'>" + esc(g) + "</button>"; }).join("") +
      "<button class='nej' data-vmsg='rapluk'>Annullér</button></span>";
  }
  function send(tekst) {
    if (sender || !samtale) return;
    const inp = appEl.querySelector(".vmsg-input");
    tekst = (tekst || (inp ? inp.value : "")).trim();
    if (!tekst) return;
    const strafNu = lokalStraf();
    if (strafNu) { lille(strafNu); return; }
    tekst = rens(tekst).slice(0, 500);
    sender = true;
    const navn = med;
    // vis den med det samme
    samtale.beskeder.push({ id: 9e15, fra: mig(), tekst: tekst, tid: Date.now(), ejer: erEjerLokal() });
    udkast[samtale.samtale] = "";
    if (inp) inp.value = "";
    tegnSamtale(false);
    kald("hv_messenger_send", { p_til: navn, p_tekst: tekst }).then(function () {
      fejl = "";
      return Promise.all([hentSamtale(navn, false), hentSamtaler(true)]);
    }).catch(function (e) {
      fejl = manglerDb(e) ? DB_FEJL : e.message;
      if (samtale) samtale.beskeder = samtale.beskeder.filter(function (b) { return b.id !== 9e15; });
      if (samtale) udkast[samtale.samtale] = tekst;
      tegnSamtale(true);
    }).finally(function () { sender = false; });
  }

  // ----- 👑 Ejeren: alle private samtaler -----
  function ejerListeHtml() {
    if (ejerListe === null) { hentEjerListe(); return "<div class='vmsg-midt'><div class='vmsg-spinner'></div></div>"; }
    return "<label class='vmsg-soeg'>🔍<input class='vmsg-ejer-soeg' placeholder='Søg på et navn' value='" + esc(ejerSoeg) + "'></label>" +
      "<p class='vmsg-lille'>👑 Kun ejeren (og ansatte, der har fået adgang til private beskeder) kan se denne liste. Slettede beskeder kan stadig læses her.</p>" +
      (ejerListe.length ? ejerListe.map(function (x) {
        const navne = [x.a || x.samtale.split("|")[0], x.b || x.samtale.split("|")[1]];
        return "<button class='vmsg-raekke' data-vmsgejer='" + esc(x.samtale) + "' data-navne='" + esc(navne.join("|")) + "'><span class='vmsg-to-av'>" + av(navne[0], 34) + av(navne[1], 34) + "</span>" +
          "<span class='vmsg-r-tekst'><b>" + esc(navne[0]) + " ↔ " + esc(navne[1]) + "</b><span>" + esc(x.fra) + ": " + (x.slettet ? "<i>(slettet)</i> " : "") + esc(x.tekst) + " · " + naar(x.tid) + "</span></span><i class='vmsg-antal'>" + x.antal + "</i></button>";
      }).join("") : "<div class='vmsg-tom'><b>Ingen private samtaler endnu</b></div>");
  }
  function hentEjerListe() {
    kald("hv_messenger_ejer_samtaler", { p_soeg: ejerSoeg }).then(function (l) { ejerListe = l || []; })
      .catch(function (e) { ejerListe = []; lille("⚠️ " + e.message); })
      .finally(function () { if (appEl && skaerm === "liste" && fane === "ejer") tegnListe(); });
  }
  function kobEjerSoeg() {
    const f = appEl.querySelector(".vmsg-ejer-soeg");
    if (!f) return;
    f.addEventListener("keydown", function (e) { e.stopPropagation(); });
    f.addEventListener("input", function () {
      ejerSoeg = f.value.trim().toLowerCase();
      clearTimeout(f.t);
      f.t = setTimeout(function () { hentEjerListe(); }, 300);
    });
    if (ejerSoeg) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }
  function tegnEjerLaes() {
    const navne = ejerPar.length === 2 ? ejerPar : ejerSamtale.split("|");
    let h = "<div class='vmsg-top samtale'><button class='vmsg-tb' data-vmsg='ejerliste'>‹</button><span class='vmsg-to-av'>" + av(navne[0], 30) + av(navne[1], 30) + "</span>" +
      "<span class='vmsg-top-navn'><b>" + esc(navne[0]) + " ↔ " + esc(navne[1]) + "</b><small>👑 Kun ejeren kan se dette</small></span><span class='vmsg-tb'></span></div><div class='vmsg-beskeder'>";
    if (!ejerLaes) h += "<div class='vmsg-midt'><div class='vmsg-spinner'></div></div>";
    else ejerLaes.forEach(function (b) {
      const venstre = b.fra.toLowerCase() === navne[0].toLowerCase();
      h += "<div class='vmsg-linje" + (venstre ? "" : " min") + " sidst'>" + (venstre ? "<span class='vmsg-av-plads'>" + av(b.fra, 26) + "</span>" : "") +
        "<span class='vmsg-boble-kol'><small class='vmsg-fra'>" + esc(b.fra) + " · " + naar(b.tid) + (new Date(b.tid).toDateString() === new Date().toDateString() ? "" : " " + kl(b.tid)) + "</small><span class='vmsg-boble" + (venstre ? "" : " ejerse") + (b.slettet ? " var-slettet" : "") + "'>" + esc(b.tekst) + "</span>" +
        (b.slettet ? "<small class='vmsg-fra'>🗑 Slettet af " + esc(b.slettet_af || "?") + "</small>" : "") + "</span></div>";
    });
    appEl.innerHTML = h + "</div>";
    const bs = appEl.querySelector(".vmsg-beskeder"); bs.scrollTop = bs.scrollHeight;
  }

  // ---------------------------------------------------------------
  //  Klik
  // ---------------------------------------------------------------
  document.addEventListener("click", function (e) {
    if (!appEl || !appEl.contains(e.target)) return;
    const t = e.target;
    const medK = t.closest("[data-vmsgmed]");
    if (medK) { aabnSamtale(medK.dataset.vmsgmed); return; }
    const fk = t.closest("[data-vmsgfane]");
    if (fk) { fane = fk.dataset.vmsgfane; if (fane === "ejer") ejerListe = null; tegnListe(); return; }
    const ej = t.closest("[data-vmsgejer]");
    if (ej) {
      ejerSamtale = ej.dataset.vmsgejer; ejerPar = (ej.dataset.navne || ejerSamtale).split("|"); ejerLaes = null; skaerm = "ejerlaes"; tegnEjerLaes();
      kald("hv_messenger_ejer_laes", { p_samtale: ejerSamtale }).then(function (l) { ejerLaes = l || []; if (appEl && skaerm === "ejerlaes") tegnEjerLaes(); }).catch(function (er) { lille("⚠️ " + er.message); });
      return;
    }
    const bob = t.closest("[data-vmsgb]");
    if (bob) { const id = +bob.dataset.vmsgb; menuFor = menuFor === id ? null : id; rapportFor = null; tegnSamtale(true); return; }
    const k = t.closest("[data-vmsg]");
    if (!k) { if (menuFor || rapportFor) { menuFor = null; rapportFor = null; if (skaerm === "samtale") tegnSamtale(true); } return; }
    const hvad = k.dataset.vmsg, id = +k.dataset.id;
    const b = samtale && samtale.beskeder.find(function (x) { return x.id === id; });
    if (hvad === "hjem") { if (api) api.luk(); }
    else if (hvad === "butik") { if (api) api.aabn("butik"); }
    else if (hvad === "liste") { gemUdkast(); skaerm = "liste"; med = null; samtale = null; soegTekst = ""; soegRes = null; tegnListe(); hentSamtaler(true); }
    else if (hvad === "ejerliste") { skaerm = "liste"; fane = "ejer"; tegnListe(); }
    else if (hvad === "ny") { skaerm = "ny"; soegTekst = ""; soegRes = null; tegnNy(); soeg("").then(function (l) { if (skaerm === "ny" && !soegTekst) { soegRes = l; tegnNy(); } }); }
    else if (hvad === "send") send();
    else if (hvad === "hjerte") send("💜");
    else if (hvad === "kopier" && b) { try { navigator.clipboard.writeText(b.tekst); lille("📋 Kopieret"); } catch (x) {} menuFor = null; tegnSamtale(true); }
    else if (hvad === "slet" && b) {
      if (!k.classList.contains("sikker")) { k.classList.add("sikker"); k.textContent = "Er du sikker?"; return; }
      kald("hv_messenger_slet", { p_id: id }).then(function () { menuFor = null; b.slettet = true; tegnSamtale(true); hentSamtaler(true); }).catch(function (er) { lille("⚠️ " + er.message); });
    }
    else if (hvad === "rapport" && b) { menuFor = null; rapportFor = id; tegnSamtale(true); }
    else if (hvad === "rapluk") { rapportFor = null; tegnSamtale(true); }
    else if (hvad === "rapgrund" && b) {
      const d = new Date(b.tid);
      kald("hv_rapport_send", { p_hvem: b.fra, p_grund: "💜 Vera-Messenger: " + k.dataset.grund,
        p_tekst: (med === "alle" ? "[Hele hotellet] " : "[Privat til " + mig() + "] ") + b.tekst, p_tid: d.getDate() + "/" + (d.getMonth() + 1) + " " + kl(b.tid) })
        .then(function () { lille("🚩 Tak! Beskeden er sendt til hotellets personale"); }).catch(function (er) { lille("⚠️ " + er.message); });
      rapportFor = null; tegnSamtale(true);
    }
    else if (hvad === "mere") visMere();
    else if (hvad === "blok") {
      if (!k.classList.contains("sikker")) { k.classList.add("sikker"); k.textContent = "Er du sikker? Tryk igen"; return; }
      kald("hv_messenger_blokker", { p_navn: med, p_blok: true }).then(function () { lille("🚫 " + med + " er blokeret"); lukMere(); hentSamtale(med, true); }).catch(function (er) { lille("⚠️ " + er.message); });
    }
    else if (hvad === "fjernblok") {
      kald("hv_messenger_blokker", { p_navn: med, p_blok: false }).then(function () { lille("✅ Blokeringen er fjernet"); lukMere(); samtale.blokeret = false; tegnSamtale(true); }).catch(function (er) { lille("⚠️ " + er.message); });
    }
    else if (hvad === "rapportperson") {
      kald("hv_rapport_send", { p_hvem: med, p_grund: "💜 Vera-Messenger: " + (k.dataset.grund || "Andet"), p_tekst: "Rapporteret fra Vera-Messenger", p_tid: naar(Date.now()) + " " + kl(Date.now()) })
        .then(function () { lille("🚩 Tak! " + med + " er rapporteret"); lukMere(); }).catch(function (er) { lille("⚠️ " + er.message); });
    }
    else if (hvad === "lukmere") lukMere();
  });
  function visMere() {
    lukMere();
    const s = samtale;
    const ark = document.createElement("div");
    ark.className = "vmsg-ark-bag";
    ark.innerHTML = "<div class='vmsg-ark'>" + av(med, 72, s && erOnline(s.aktiv)) + "<b>" + esc(med) + "</b>" + (s ? maerke(s.skilt, erEjerLokal(med)) : "") +
      "<small>" + (s ? aktivTekst(s.aktiv) : "") + "</small>" +
      (s && s.blokeret ? "<button data-vmsg='fjernblok'>✅ Fjern blokering</button>" : (s && s.skilt) || erEjerLokal(med) ? "" : "<button data-vmsg='blok' class='roed'>🚫 Blokér " + esc(med) + "</button>") +
      "<div class='vmsg-ark-afsnit'>🚩 Rapportér " + esc(med) + "</div>" +
      GRUNDE.map(function (g) { return "<button data-vmsg='rapportperson' data-grund='" + esc(g) + "'>" + esc(g) + "</button>"; }).join("") +
      "<button data-vmsg='lukmere' class='nej'>Luk</button></div>";
    appEl.appendChild(ark);
    ark.addEventListener("click", function (e) { if (e.target === ark) lukMere(); });
  }
  function lukMere() { const a = appEl && appEl.querySelector(".vmsg-ark-bag"); if (a) a.remove(); }

  // ---------------------------------------------------------------
  //  CSS (alt starter med #telefon, så hotellets egne knap-regler ikke vinder)
  // ---------------------------------------------------------------
  const css = [
    ":root { --vmsg-bg: #1b0f33; --vmsg-bg2: #24143f; --vmsg-kort: #2c1a4d; --vmsg-lilla: #8b4dff; --vmsg-lilla2: #a875ff; --vmsg-lav: #c9b3ff; --vmsg-graa: #3a3644; --vmsg-tekst: #f3ecff; --vmsg-svag: #a99bc4; }",
    "#telefon .tlf-app.vmsg-app { background: radial-gradient(120% 60% at 50% 0%, #2d1755 0%, var(--vmsg-bg) 55%) !important; color: var(--vmsg-tekst) !important; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }",
    "#telefon .vmsg-app button { font-family: inherit; cursor: pointer; }",
    "#telefon .vmsg-app .vmsg-top { flex: none; display: flex; align-items: center; gap: 8px; padding: 48px 10px 8px; background: rgba(27,15,51,.86); border-bottom: 1px solid rgba(201,179,255,.12); }",
    "#telefon .vmsg-app .vmsg-top h3 { flex: 1; margin: 0; font-size: 16px; font-weight: 700; text-align: center; color: var(--vmsg-tekst); }",
    "#telefon .vmsg-app .vmsg-tb { flex: none; width: 30px; height: 30px; border: 0; padding: 0; background: none; color: var(--vmsg-lav); font-size: 26px; line-height: 26px; border-radius: 50%; }",
    "#telefon .vmsg-app .vmsg-tb[data-vmsg='mere'] { font-size: 19px; }",
    "#telefon .vmsg-app .vmsg-top-navn { flex: 1; min-width: 0; display: flex; flex-direction: column; } #telefon .vmsg-app .vmsg-top-navn b { font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } #telefon .vmsg-app .vmsg-top-navn small { font-size: 11px; color: var(--vmsg-svag); }",
    "#telefon .vmsg-app .vmsg-krop { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0 10px 26px; scrollbar-width: none; }",
    "#telefon .vmsg-app .vmsg-midt { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; gap: 8px; flex: 1; }",
    "#telefon .vmsg-app .vmsg-midt h2 { margin: 6px 0 0; font-size: 20px; } #telefon .vmsg-app .vmsg-midt p { margin: 0; color: var(--vmsg-svag); font-size: 13px; line-height: 1.4; }",
    "#telefon .vmsg-app .vmsg-stor-ik { width: 86px; height: 86px; border-radius: 22px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #c39bff, #7b3cf0 55%, #4a1aa8); box-shadow: 0 10px 30px rgba(139,77,255,.45); }",
    "#telefon .vmsg-app .vmsg-knap { margin-top: 8px; border: 0; border-radius: 20px; padding: 9px 18px; background: var(--vmsg-lilla); color: #fff; font-weight: 700; font-size: 14px; }",
    "#telefon .vmsg-app .vmsg-fejl { color: #ffb3c7 !important; font-size: 13px; padding: 10px; text-align: center; }",
    "#telefon .vmsg-app .vmsg-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid rgba(201,179,255,.25); border-top-color: var(--vmsg-lav); animation: vmSpin .8s linear infinite; }",
    "@keyframes vmSpin { to { transform: rotate(360deg); } }",
    // listen
    "#telefon .vmsg-app .vmsg-hoved { flex: none; display: flex; align-items: center; gap: 8px; padding: 50px 12px 6px; }",
    "#telefon .vmsg-app .vmsg-hoved h2 { flex: 1; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -.3px; color: var(--vmsg-tekst); }",
    "#telefon .vmsg-app .vmsg-hoved h2.lille { font-size: 18px; }",
    "#telefon .vmsg-app .vmsg-rund { width: 32px; height: 32px; border-radius: 50%; border: 0; padding: 0; background: var(--vmsg-kort); color: var(--vmsg-lav); font-size: 14px; }",
    "#telefon .vmsg-app .vmsg-faner { flex: none; display: flex; gap: 6px; padding: 0 12px 6px; } #telefon .vmsg-app .vmsg-faner button { flex: 1; border: 0; border-radius: 14px; padding: 6px 4px; background: var(--vmsg-kort); color: var(--vmsg-svag); font-size: 12px; font-weight: 600; } #telefon .vmsg-app .vmsg-faner button.valgt { background: var(--vmsg-lilla); color: #fff; }",
    "#telefon .vmsg-app .vmsg-soeg { display: flex; align-items: center; gap: 6px; margin: 4px 2px 10px; padding: 0 12px; height: 34px; border-radius: 17px; background: var(--vmsg-kort); font-size: 12px; }",
    "#telefon .vmsg-app .vmsg-soeg input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: var(--vmsg-tekst); font: inherit; font-size: 14px; } #telefon .vmsg-app input::placeholder { color: var(--vmsg-svag); }",
    "#telefon .vmsg-app .vmsg-aktive { display: flex; gap: 10px; overflow-x: auto; padding: 2px 2px 10px; scrollbar-width: none; }",
    "#telefon .vmsg-app .vmsg-aktive button { flex: none; width: 56px; border: 0; padding: 0; background: none; color: var(--vmsg-tekst); display: flex; flex-direction: column; align-items: center; gap: 4px; } #telefon .vmsg-app .vmsg-aktive span:not(.vmsg-av) { font-size: 11px; max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--vmsg-svag); }",
    "#telefon .vmsg-app .vmsg-av { position: relative; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-weight: 700; box-shadow: inset 0 -3px 8px rgba(0,0,0,.18); }",
    "#telefon .vmsg-app .vmsg-av.alle { background: linear-gradient(135deg, #e7c66b, #8b4dff); }",
    "#telefon .vmsg-app .vmsg-online { position: absolute; right: 0; bottom: 0; width: 28%; height: 28%; min-width: 9px; min-height: 9px; border-radius: 50%; background: #3ee07a; border: 2.5px solid var(--vmsg-bg); box-sizing: border-box; }",
    "#telefon .vmsg-app .vmsg-raekke { width: 100%; font-weight: 400; display: flex; align-items: center; gap: 11px; border: 0; padding: 7px 4px; background: none; color: var(--vmsg-tekst); text-align: left; border-radius: 12px; }",
    "#telefon .vmsg-app .vmsg-raekke:hover { background: rgba(201,179,255,.07); }",
    "#telefon .vmsg-app .vmsg-r-tekst { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; } #telefon .vmsg-app .vmsg-r-tekst b { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } #telefon .vmsg-app .vmsg-r-tekst > span { font-size: 12.5px; color: var(--vmsg-svag); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    "#telefon .vmsg-app .vmsg-raekke.ulaest b, #telefon .vmsg-app .vmsg-raekke.ulaest .vmsg-r-tekst > span { font-weight: 800; color: var(--vmsg-tekst); }",
    "#telefon .vmsg-app .vmsg-prik { flex: none; min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 9px; background: var(--vmsg-lav); color: #2a1450; font-size: 11px; font-weight: 800; font-style: normal; line-height: 18px; text-align: center; box-shadow: 0 0 10px rgba(201,179,255,.6); }",
    "#telefon .vmsg-app .vmsg-antal { flex: none; font-style: normal; font-size: 11px; color: var(--vmsg-svag); }",
    "#telefon .vmsg-app .vmsg-maerke { display: inline-block; vertical-align: 1px; margin-left: 2px; padding: 1px 6px; border-radius: 8px; background: rgba(201,179,255,.18); color: var(--vmsg-lav); font-size: 9.5px; font-weight: 700; letter-spacing: .2px; }",
    "#telefon .vmsg-app .vmsg-maerke.ejer { background: linear-gradient(#f5d77e, #c79a2e); color: #3b2300; } #telefon .vmsg-app .vmsg-maerke.alle { background: rgba(139,77,255,.35); color: #fff; }",
    "#telefon .vmsg-app .vmsg-afsnit { margin: 10px 4px 4px; font-size: 11px; font-weight: 700; color: var(--vmsg-svag); text-transform: uppercase; letter-spacing: .5px; }",
    "#telefon .vmsg-app .vmsg-lille { font-size: 12px; color: var(--vmsg-svag); padding: 6px 4px; line-height: 1.4; }",
    "#telefon .vmsg-app .vmsg-tom { display: flex; flex-direction: column; gap: 4px; text-align: center; padding: 26px 16px; color: var(--vmsg-svag); font-size: 12.5px; } #telefon .vmsg-app .vmsg-tom b { color: var(--vmsg-tekst); font-size: 14px; }",
    "#telefon .vmsg-app .vmsg-straf, #telefon .vmsg-app .vmsg-bund-info.straf { background: rgba(255,120,150,.14); color: #ffc2d1; border-radius: 12px; padding: 8px 10px; font-size: 12.5px; margin: 0 2px 8px; text-align: center; }",
    "#telefon .vmsg-app .vmsg-to-av { flex: none; display: inline-flex; } #telefon .vmsg-app .vmsg-to-av .vmsg-av + .vmsg-av { margin-left: -12px; box-shadow: 0 0 0 2px var(--vmsg-bg); }",
    // ny besked
    "#telefon .vmsg-app .vmsg-til { flex: none; display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-bottom: 1px solid rgba(201,179,255,.12); color: var(--vmsg-svag); font-size: 14px; } #telefon .vmsg-app .vmsg-til input { flex: 1; border: 0; outline: 0; background: none; color: var(--vmsg-tekst); font: inherit; }",
    // samtalen
    "#telefon .vmsg-app .vmsg-top.samtale { gap: 8px; }",
    "#telefon .vmsg-app .vmsg-beskeder { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 6px 8px 10px; scrollbar-width: none; display: flex; flex-direction: column; }",
    "#telefon .vmsg-app .vmsg-samtale-start { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; padding: 14px 18px 12px; } #telefon .vmsg-app .vmsg-samtale-start b { font-size: 16px; } #telefon .vmsg-app .vmsg-samtale-start small { font-size: 11.5px; color: var(--vmsg-svag); line-height: 1.35; }",
    "#telefon .vmsg-app .vmsg-tid { align-self: center; font-size: 10.5px; color: var(--vmsg-svag); margin: 10px 0 4px; font-weight: 600; }",
    "#telefon .vmsg-app .vmsg-linje { display: flex; align-items: flex-end; gap: 6px; margin-top: 2px; } #telefon .vmsg-app .vmsg-linje.sidst { margin-bottom: 6px; } #telefon .vmsg-app .vmsg-linje.min { justify-content: flex-end; }",
    "#telefon .vmsg-app .vmsg-av-plads { flex: none; width: 26px; }",
    "#telefon .vmsg-app .vmsg-boble-kol { display: flex; flex-direction: column; align-items: flex-start; max-width: 76%; min-width: 0; } #telefon .vmsg-app .vmsg-linje.min .vmsg-boble-kol { align-items: flex-end; }",
    "#telefon .vmsg-app .vmsg-fra { font-size: 10.5px; color: var(--vmsg-svag); margin: 4px 10px 2px; }",
    "#telefon .vmsg-app .vmsg-boble { display: inline-block; padding: 7px 12px; border-radius: 18px; background: var(--vmsg-graa); color: #f1eef6; font-size: 14px; line-height: 1.32; word-wrap: break-word; overflow-wrap: anywhere; white-space: pre-wrap; cursor: pointer; }",
    "#telefon .vmsg-app .vmsg-linje.min .vmsg-boble { background: linear-gradient(160deg, #a46bff, #7b3cf0); color: #fff; box-shadow: 0 2px 10px rgba(139,77,255,.35); }",
    "#telefon .vmsg-app .vmsg-linje:not(.min) .vmsg-boble { border-bottom-left-radius: 6px; } #telefon .vmsg-app .vmsg-linje.min .vmsg-boble { border-bottom-right-radius: 6px; }",
    "#telefon .vmsg-app .vmsg-boble.slettet { background: none !important; border: 1px solid rgba(201,179,255,.25); color: var(--vmsg-svag) !important; font-style: italic; box-shadow: none !important; }",
    "#telefon .vmsg-app .vmsg-boble.var-slettet { outline: 1.5px dashed #ff8fa3; }",
    "#telefon .vmsg-app .vmsg-boble.ejerse { background: linear-gradient(160deg, #a46bff, #7b3cf0); color: #fff; }",
    "#telefon .vmsg-app .vmsg-set { align-self: flex-end; display: flex; align-items: center; gap: 4px; font-size: 10.5px; color: var(--vmsg-svag); margin: 0 4px 4px; }",
    "#telefon .vmsg-app .vmsg-menu, #telefon .vmsg-app .vmsg-rapport { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0 4px; } #telefon .vmsg-app .vmsg-menu button, #telefon .vmsg-app .vmsg-rapport button { border: 0; border-radius: 12px; padding: 5px 9px; background: var(--vmsg-kort); color: var(--vmsg-lav); font-size: 11.5px; font-weight: 600; } #telefon .vmsg-app .vmsg-menu button.sikker { background: #c0304f; color: #fff; }",
    "#telefon .vmsg-app .vmsg-rapport { flex-direction: column; align-items: stretch; background: var(--vmsg-bg2); border: 1px solid rgba(201,179,255,.2); border-radius: 14px; padding: 8px; width: 190px; } #telefon .vmsg-app .vmsg-rapport b { font-size: 12px; } #telefon .vmsg-app .vmsg-rapport small { font-size: 11px; color: var(--vmsg-svag); } #telefon .vmsg-app .vmsg-rapport .nej { background: none; color: var(--vmsg-svag); }",
    "#telefon .vmsg-app .vmsg-skriv { flex: none; display: flex; align-items: center; gap: 6px; padding: 8px 10px 26px; background: rgba(27,15,51,.9); border-top: 1px solid rgba(201,179,255,.1); }",
    "#telefon .vmsg-app .vmsg-input { flex: 1; min-width: 0; height: 34px; border: 0; outline: 0; border-radius: 17px; padding: 0 14px; background: var(--vmsg-kort); color: var(--vmsg-tekst); font: inherit; font-size: 14px; }",
    "#telefon .vmsg-app .vmsg-send { flex: none; width: 34px; height: 34px; border: 0; border-radius: 50%; padding: 0; background: var(--vmsg-lav); color: #3a1680; font-size: 15px; font-weight: 900; }",
    "#telefon .vmsg-app .vmsg-hjerte { flex: none; width: 34px; height: 34px; border: 0; border-radius: 50%; padding: 0; background: none; font-size: 22px; }",
    "#telefon .vmsg-app .vmsg-bund-info { flex: none; padding: 10px 12px 28px; font-size: 12.5px; text-align: center; color: var(--vmsg-svag); } #telefon .vmsg-app .vmsg-bund-info button { border: 0; background: none; color: var(--vmsg-lav); font-weight: 700; }",
    "#telefon .vmsg-app .vmsg-bund-info.straf { margin: 0; border-radius: 0; padding-bottom: 28px; }",
    "#telefon .vmsg-app .vmsg-fejl-bund { position: absolute; left: 10px; right: 10px; bottom: 76px; background: #5a1a33; color: #ffd5e0; font-size: 12px; border-radius: 12px; padding: 7px 10px; text-align: center; }",
    // ark (ⓘ)
    "#telefon .vmsg-app .vmsg-ark-bag { position: absolute; inset: 0; z-index: 5; background: rgba(10,4,24,.55); display: flex; align-items: flex-end; }",
    "#telefon .vmsg-app .vmsg-ark { width: 100%; max-height: 82%; overflow-y: auto; box-sizing: border-box; background: var(--vmsg-bg2); border-radius: 22px 22px 0 0; padding: 18px 16px 28px; display: flex; flex-direction: column; align-items: center; gap: 5px; animation: vmOp .25s ease-out; }",
    "@keyframes vmOp { from { transform: translateY(40%); opacity: 0; } }",
    "#telefon .vmsg-app .vmsg-ark > b { font-size: 18px; margin-top: 4px; } #telefon .vmsg-app .vmsg-ark small { color: var(--vmsg-svag); font-size: 12px; }",
    "#telefon .vmsg-app .vmsg-ark button { width: 100%; border: 0; border-radius: 12px; padding: 9px; background: var(--vmsg-kort); color: var(--vmsg-tekst); font-size: 13.5px; font-weight: 600; } #telefon .vmsg-app .vmsg-ark button.roed, #telefon .vmsg-app .vmsg-ark button.sikker { color: #ff9fb4; } #telefon .vmsg-app .vmsg-ark button.nej { background: none; color: var(--vmsg-lav); }",
    "#telefon .vmsg-app .vmsg-ark-afsnit { align-self: flex-start; margin-top: 10px; font-size: 11px; font-weight: 700; color: var(--vmsg-svag); text-transform: uppercase; letter-spacing: .5px; }",
    // købe-boksen i App Butik
    "#telefon .vmsg-koeb-bag { position: absolute; inset: 0; z-index: 90; background: rgba(12,6,30,.5); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }",
    "#telefon .vmsg-koeb { width: 236px; border-radius: 20px; background: linear-gradient(#2d1755, #1b0f33); color: #f3ecff; text-align: center; padding: 18px 16px 14px; box-shadow: 0 18px 40px rgba(0,0,0,.45); display: flex; flex-direction: column; align-items: center; gap: 6px; font: 14px -apple-system, 'Segoe UI', Roboto, sans-serif; }",
    "#telefon .vmsg-koeb-ik { width: 70px; height: 70px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #c39bff, #7b3cf0 55%, #4a1aa8); box-shadow: 0 8px 22px rgba(139,77,255,.5); }",
    "#telefon .vmsg-koeb b { font-size: 17px; } #telefon .vmsg-koeb p { margin: 0; font-size: 12.5px; color: #c7b8e6; line-height: 1.4; } #telefon .vmsg-koeb small { font-size: 11.5px; color: #a99bc4; }",
    "#telefon .vmsg-koeb-pris { margin-top: 4px; font-size: 20px; font-weight: 800; color: #f5d77e; }",
    "#telefon .vmsg-koeb-fejl { font-size: 12px; color: #ffb3c7; min-height: 0; }",
    "#telefon .vmsg-koeb-knapper { display: flex; gap: 8px; width: 100%; margin-top: 6px; } #telefon .vmsg-koeb-knapper button { flex: 1; border: 0; border-radius: 14px; padding: 9px; font: inherit; font-weight: 700; cursor: pointer; } #telefon .vmsg-koeb-knapper .nej { background: #3a2a5c; color: #c9b3ff; } #telefon .vmsg-koeb-knapper .ja { background: #8b4dff; color: #fff; } #telefon .vmsg-koeb-knapper .ja:disabled { opacity: .5; }",
    "#telefon button.vmsg-pris { background: linear-gradient(#a875ff, #7b3cf0) !important; color: #fff !important; }",
  ].join("\n");
  const st = document.createElement("style");
  st.id = "vera-messenger-css";
  st.textContent = css;
  document.head.appendChild(st);

  // ---------------------------------------------------------------
  //  Start
  // ---------------------------------------------------------------
  vent(function () { return typeof window.tlfTilfoejApp === "function" && !!mig(); }, function () {
    window.tlfTilfoejApp(ID, APP);
    hentStatus().then(function () { return hentSamtaler(true); }).then(poll);
  });
})();
