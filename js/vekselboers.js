// =============================================================
//  💱 Vekselbørsen og 📈 Hotellets økonomi
//  - Spillerne veksler Glimt ⭐ til Stella 🔮 og tilbage.
//    Fast kurs for alle: 4 Glimt = 1 Stella.
//    Åbnes med 💱-knappen ved pengene øverst (eller klik på pengene).
//  - Alt sker på serveren (hv_veksl i database-42-vekselboers.sql), som
//    tjekker at man har råd, skriver vekslingen ned og aldrig går i minus.
//    Hver veksling har sin egen "nøgle", så et dobbeltklik ikke tæller to gange.
//  - Ejerpanel → Økonomi → 📈 Hotellets økonomi: penge i omløb, vekslinger,
//    udvikling over tid og søg efter en spiller.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.VEKSEL_KLAR || !document.getElementById("glimt")) return;
  window.VEKSEL_KLAR = true;

  const KURS = 4;                                   // 4 Glimt = 1 Stella (serveren bruger samme tal)
  const GLIMT_IKON = "<img class='vk-ikon' src='billeder/glimt.png' alt=''>";
  const STELLA_IKON = "<img class='vk-ikon' src='billeder/krystal.png' alt=''>";

  function glimtNavn() { return (typeof system !== "undefined" && system.valutaNavn) || "Glimt"; }
  function tal(n) { return Number(n || 0).toLocaleString("da-DK"); }
  function r(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function token() { return typeof mitToken === "function" ? mitToken() : null; }
  function kanServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" && !!token(); }
  function erEjer() { return typeof EJERE !== "undefined" && typeof FIGUR !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }
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
    if (/hv_veksl|hv_oekonomi|hv_veksler_spiller|Could not find the function/i.test(m))
      return "Vekselbørsen virker, når database-42-vekselboers.sql er kørt i Supabase.";
    return m || "Serveren svarede ikke. Prøv igen.";
  }
  function tid(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  }
  function valuta(hvad, antal) {
    return hvad === "stella" ? STELLA_IKON + " " + tal(antal) + " Stella" : GLIMT_IKON + " " + tal(antal) + " " + r(glimtNavn());
  }
  // Sæt de nye penge fra serveren med det samme
  // Mens vi veksler, må den almindelige penge-opdatering (rigtige-penge.js) vente,
  // ellers tror den, at man har fået en gave ("🎁 Du har fået …").
  function pauseOpdatering(til) {
    try {
      if (typeof pengeSender === "undefined") return;
      pengeSender = til;
      if (!til && typeof sendPenge === "function") sendPenge();
    } catch (e) {}
  }
  function nyeTal(svar) {
    if (!svar || svar.glimt == null) return;
    if (typeof saetPenge === "function") saetPenge({ glimt: svar.glimt, stella: svar.stella }, false);
    else { glimt = svar.glimt; krystaller = svar.stella; if (typeof visGlimt === "function") visGlimt(); }
  }

  // -----------------------------------------------------------
  //  Vekselbørsen (for alle spillere)
  // -----------------------------------------------------------
  const vindue = document.createElement("div");
  vindue.id = "veksel-vindue";
  vindue.hidden = true;
  vindue.innerHTML =
    "<div class='vk-top'><span>💱 Vekselbørs</span><button type='button' class='vk-luk' title='Luk'>✕</button></div>" +
    "<div class='vk-krop'>" +
    "<p class='vk-kurs'>Fast kurs for alle: <b>4 " + GLIMT_IKON + " <span class='valuta-navn'>Glimt</span> = 1 " + STELLA_IKON + " Stella</b></p>" +
    "<p class='vk-saldo'></p>" +
    "<div class='vk-retning'><button type='button' data-vk-r='glimt'>" + GLIMT_IKON + " ➜ " + STELLA_IKON + "<small><span class='valuta-navn'>Glimt</span> til Stella</small></button>" +
    "<button type='button' data-vk-r='stella'>" + STELLA_IKON + " ➜ " + GLIMT_IKON + "<small>Stella til <span class='valuta-navn'>Glimt</span></small></button></div>" +
    "<label class='vk-felt'><span class='vk-spm'></span><input id='vk-beloeb' type='number' min='0' inputmode='numeric' placeholder='0'></label>" +
    "<div class='vk-hurtig'></div>" +
    "<div class='vk-regn'></div>" +
    "<p class='vk-fejl' role='alert'></p>" +
    "<button type='button' class='vk-hoved' id='vk-veksl'>💱 Veksl</button>" +
    "<div class='vk-bekraeft' hidden><p></p><div><button type='button' class='vk-fortryd'>Fortryd</button>" +
    "<button type='button' class='vk-ja'>✔ Ja, veksl</button></div></div>" +
    "<div class='vk-faerdig' hidden></div>" +
    "<details class='vk-historik'><summary>📜 Mine vekslinger</summary><div class='vk-mine'></div></details>" +
    "</div>";
  document.body.appendChild(vindue);
  if (typeof goerFlytbar === "function") goerFlytbar(vindue, vindue.querySelector(".vk-top"), "mit-hotel-veksel-plads");

  const felt = vindue.querySelector("#vk-beloeb");
  const fejl = vindue.querySelector(".vk-fejl");
  const vekslKnap = vindue.querySelector("#vk-veksl");
  const bekraeft = vindue.querySelector(".vk-bekraeft");
  const faerdig = vindue.querySelector(".vk-faerdig");
  let fra = "glimt";
  let sender = false;
  let ventende = null;     // { fra, giv, faar, noegle } mens man bekræfter / venter på serveren

  function harNu(hvad) { return hvad === "stella" ? (typeof krystaller === "number" ? krystaller : 0) : (typeof glimt === "number" ? glimt : 0); }

  // Hvad giver og får man for det, der står i feltet?
  function regnUd() {
    const skrevet = Math.max(0, Math.floor(Number(felt.value) || 0));
    if (fra === "glimt") {
      const giv = Math.floor(skrevet / KURS) * KURS;
      return { skrevet: skrevet, giv: giv, faar: giv / KURS, rest: skrevet - giv };
    }
    return { skrevet: skrevet, giv: skrevet, faar: skrevet * KURS, rest: 0 };
  }

  function visVeksel() {
    document.querySelectorAll("#veksel-vindue .valuta-navn").forEach(function (el) { el.textContent = glimtNavn(); });
    vindue.querySelector(".vk-saldo").innerHTML = "Du har " + valuta("glimt", harNu("glimt")) + " &nbsp;·&nbsp; " + valuta("stella", harNu("stella"));
    vindue.querySelectorAll("[data-vk-r]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.vkR === fra); });
    vindue.querySelector(".vk-spm").textContent = fra === "glimt"
      ? "Hvor mange " + glimtNavn() + " vil du veksle?" : "Hvor mange Stella vil du veksle?";
    felt.step = fra === "glimt" ? KURS : 1;
    const hurtig = fra === "glimt" ? [20, 40, 100, 200, 1000] : [1, 5, 10, 25, 50];
    vindue.querySelector(".vk-hurtig").innerHTML = hurtig.map(function (n) {
      return "<button type='button' data-vk-n='" + n + "'>" + tal(n) + "</button>";
    }).join("") + "<button type='button' data-vk-n='alt'>Alt</button>";
    opdaterRegn();
  }

  function opdaterRegn() {
    const u = regnUd();
    const til = fra === "glimt" ? "stella" : "glimt";
    let tekst = "";
    let ok = false;
    if (!u.skrevet) tekst = "<span class='vk-tom'>Skriv et beløb, så kan du se, hvad du får.</span>";
    else {
      const efterG = harNu("glimt") + (fra === "glimt" ? -u.giv : u.faar);
      const efterS = harNu("stella") + (fra === "stella" ? -u.giv : u.faar);
      tekst = "<div class='vk-linje'><span>Du giver</span><b>" + valuta(fra, u.giv) + "</b></div>" +
        "<div class='vk-linje vk-faar'><span>Du får</span><b>" + valuta(til, u.faar) + "</b></div>" +
        (u.rest ? "<p class='vk-note'>" + r(glimtNavn()) + " veksles 4 ad gangen, så " + tal(u.rest) + " bliver hos dig.</p>" : "") +
        "<div class='vk-linje vk-efter'><span>Bagefter har du</span><b>" + valuta("glimt", Math.max(0, efterG)) + " · " + valuta("stella", Math.max(0, efterS)) + "</b></div>";
      if (!u.giv) fejl.textContent = "Du skal veksle mindst 4 " + glimtNavn() + " (= 1 Stella).";
      else if (u.giv > harNu(fra)) fejl.textContent = "Du har ikke nok " + (fra === "glimt" ? glimtNavn() : "Stella") + ". Du har " + tal(harNu(fra)) + ".";
      else { fejl.textContent = ""; ok = true; }
    }
    if (!u.skrevet) fejl.textContent = "";
    if (!kanServer()) { fejl.textContent = "Du skal være logget ind på hotellets server for at veksle."; ok = false; }
    vindue.querySelector(".vk-regn").innerHTML = tekst;
    vekslKnap.disabled = !ok || sender || !bekraeft.hidden;
  }

  function aabnVeksel() {
    vindue.hidden = false;
    bekraeft.hidden = true; faerdig.hidden = true; ventende = null;
    vekslKnap.hidden = false;
    visVeksel();
    hentMine();
    setTimeout(function () { try { felt.focus(); } catch (e) {} }, 30);
  }
  function lukVeksel() { if (!sender) vindue.hidden = true; }
  window.aabnVekselboers = aabnVeksel;

  vindue.querySelector(".vk-luk").addEventListener("click", lukVeksel);
  vindue.querySelectorAll("[data-vk-r]").forEach(function (k) {
    k.addEventListener("click", function () {
      if (sender) return;
      fra = k.dataset.vkR; felt.value = ""; bekraeft.hidden = true; faerdig.hidden = true; ventende = null; vekslKnap.hidden = false;
      visVeksel();
    });
  });
  vindue.querySelector(".vk-hurtig").addEventListener("click", function (e) {
    const k = e.target.closest("[data-vk-n]");
    if (!k || sender) return;
    let n = k.dataset.vkN === "alt" ? harNu(fra) : +k.dataset.vkN;
    if (fra === "glimt") n = Math.floor(n / KURS) * KURS;
    felt.value = n;
    bekraeft.hidden = true; faerdig.hidden = true; ventende = null; vekslKnap.hidden = false;
    opdaterRegn();
  });
  felt.addEventListener("input", function () {
    bekraeft.hidden = true; faerdig.hidden = true; ventende = null; vekslKnap.hidden = false;
    opdaterRegn();
  });
  felt.addEventListener("keydown", function (e) {
    e.stopPropagation();                     // så figuren ikke går, mens man skriver
    if (e.key === "Enter" && !vekslKnap.disabled) vekslKnap.click();
    if (e.key === "Escape") lukVeksel();
  });

  // Trin 1: Veksl → vis "Er du sikker?"
  vekslKnap.addEventListener("click", function () {
    if (sender) return;
    if (!kanServer()) { fejl.textContent = "Du skal være logget ind på hotellets server for at veksle."; return; }
    const u = regnUd();
    if (!u.giv || u.giv > harNu(fra)) { opdaterRegn(); return; }
    // nøglen laves én gang her: trykker man flere gange på Ja, er det stadig den samme veksling
    ventende = { fra: fra, giv: u.giv, faar: u.faar, noegle: nyNoegle() };
    bekraeft.querySelector("p").innerHTML = "Er du sikker? Du giver <b>" + valuta(fra, u.giv) + "</b> og får <b>" +
      valuta(fra === "glimt" ? "stella" : "glimt", u.faar) + "</b>.";
    bekraeft.hidden = false;
    vekslKnap.hidden = true;
    bekraeft.querySelector(".vk-ja").focus();
  });
  bekraeft.querySelector(".vk-fortryd").addEventListener("click", function () {
    if (sender) return;
    bekraeft.hidden = true; vekslKnap.hidden = false; ventende = null; opdaterRegn();
  });

  // Trin 2: Ja → serveren veksler
  bekraeft.querySelector(".vk-ja").addEventListener("click", function () {
    if (sender || !ventende) return;
    sender = true;
    const ja = bekraeft.querySelector(".vk-ja");
    ja.disabled = true; ja.textContent = "⏳ Veksler …";
    bekraeft.querySelector(".vk-fortryd").disabled = true;
    const v = ventende;
    pauseOpdatering(true);
    serverKald("hv_veksl", { p_token: token(), p_fra: v.fra, p_beloeb: v.giv, p_noegle: v.noegle }).then(function (svar) {
      nyeTal(svar);
      ventende = null;
      bekraeft.hidden = true;
      felt.value = "";
      faerdig.hidden = false;
      faerdig.innerHTML = "✅ Vekslet! Du gav " + valuta(svar.fra, svar.beloeb) + " og fik " + valuta(svar.til, svar.modtaget) + ".";
      if (typeof besked !== "undefined" && besked) besked.textContent = "💱 Du vekslede " + tal(svar.beloeb) + " " +
        (svar.fra === "stella" ? "Stella" : glimtNavn()) + " til " + tal(svar.modtaget) + " " + (svar.til === "stella" ? "Stella" : glimtNavn()) + ".";
      if (typeof blink === "function") {
        const b = document.querySelector(svar.til === "stella" ? "#glimt .krystal" : "#glimt .penge");
        if (b) blink(b);
      }
      hentMine();
    }).catch(function (e) {
      fejl.textContent = "⚠️ " + serverFejl(e);
      bekraeft.hidden = true;
      ventende = null;
      if (typeof hentPenge === "function") hentPenge();    // serveren bestemmer, hvor mange penge man har
    }).then(function () {
      sender = false;
      pauseOpdatering(false);
      ja.disabled = false; ja.textContent = "✔ Ja, veksl";
      bekraeft.querySelector(".vk-fortryd").disabled = false;
      vekslKnap.hidden = false;
      visVeksel();
    });
  });

  // Mine vekslinger
  function hentMine() {
    const boks = vindue.querySelector(".vk-mine");
    if (!kanServer()) { boks.innerHTML = "<p class='vk-tom'>Kræver, at du er logget ind.</p>"; return; }
    serverKald("hv_veksler_spiller", { p_token: token(), p_navn: null }).then(function (svar) {
      const l = (svar && svar.liste) || [];
      boks.innerHTML = l.length ? "<ul>" + l.slice(0, 30).map(function (v) {
        return "<li><small>" + tid(v.tid) + "</small> " + valuta(v.fra, v.beloeb) + " ➜ " + valuta(v.til, v.modtaget) + "</li>";
      }).join("") + "</ul>" : "<p class='vk-tom'>Du har ikke vekslet endnu.</p>";
    }).catch(function (e) { boks.innerHTML = "<p class='vk-tom'>" + r(serverFejl(e)) + "</p>"; });
  }

  // Pengene ændrer sig (fx efter køb): regn forfra, mens vinduet er åbent
  setInterval(function () { if (!vindue.hidden && !sender) { vindue.querySelector(".vk-saldo").innerHTML = "Du har " + valuta("glimt", harNu("glimt")) + " &nbsp;·&nbsp; " + valuta("stella", harNu("stella")); if (bekraeft.hidden) opdaterRegn(); } }, 1000);

  // 💱-knappen ved pengene øverst. Man kan også klikke på selve pengene.
  const pengeBoks = document.getElementById("glimt");
  const knap = document.createElement("button");
  knap.type = "button";
  knap.id = "veksel-knap";
  knap.title = "💱 Vekselbørs: veksl Glimt og Stella (4 = 1)";
  knap.textContent = "💱";
  pengeBoks.appendChild(knap);
  pengeBoks.style.cursor = "pointer";
  pengeBoks.addEventListener("click", function () { if (vindue.hidden) aabnVeksel(); else lukVeksel(); });

  // Byt med computer-gæsterne bruger nu også 4 Glimt = 1 Stella og går gennem vekselbørsen,
  // så det bliver skrevet ned og tjekket på serveren.
  if (typeof bytTilbud === "function") {
    bytTilbud = function () {
      const gl = Math.max(0, parseInt(document.getElementById("byt-glimt").value, 10) || 0);
      const kr = Math.max(0, parseInt(document.getElementById("byt-krystal").value, 10) || 0);
      return { gl: gl, kr: kr, faarKr: Math.floor(gl / KURS), faarGl: kr * KURS };
    };
    const bg = document.getElementById("byt-glimt");
    if (bg) bg.step = KURS;
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("#byt-ok") || !kanServer()) return;
      e.stopPropagation(); e.preventDefault();
      const t = bytTilbud();
      const svar = document.getElementById("byt-svar");
      if (!t.faarKr && !t.faarGl) { svar.textContent = "Du skal tilbyde mindst " + KURS + " " + glimtNavn() + " eller 1 Stella."; return; }
      if (t.faarKr && t.faarGl) { svar.textContent = "Byt én ting ad gangen: enten " + glimtNavn() + " eller Stella."; return; }
      if (t.gl > harNu("glimt") || t.kr > harNu("stella")) { svar.textContent = "Du har ikke nok til det bytte."; return; }
      if (sender) return;
      sender = true;
      pauseOpdatering(true);
      const hvem = typeof bytMed !== "undefined" ? bytMed : null;
      serverKald("hv_veksl", { p_token: token(), p_fra: t.faarKr ? "glimt" : "stella", p_beloeb: t.faarKr ? t.faarKr * KURS : t.kr, p_noegle: nyNoegle() })
        .then(function (s) {
          nyeTal(s);
          document.getElementById("byt-vindue").hidden = true;
          if (hvem && typeof svaev === "function" && typeof figur !== "undefined") svaev("🔄", figur);
          if (hvem && typeof gaestSkriver === "function") gaestSkriver(hvem, "Godt byttet! 🤝");
        }).catch(function (e2) { svar.textContent = serverFejl(e2); })
        .then(function () { sender = false; pauseOpdatering(false); });
    }, true);
  }


  // -----------------------------------------------------------
  //  Ejerpanel → 📈 Hotellets økonomi (kun ejeren)
  // -----------------------------------------------------------
  const FANE = "veksel";
  let oek = null, oekFejl = "", oekHenter = false;
  let soegNavn = "", soegSvar = null, soegFejl = "";

  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP[FANE] = { titel: "📈 Hotellets økonomi",
    tekst: "Hvor mange penge der er i hotellet, og hvad spillerne har vekslet i 💱 Vekselbørsen (4 Glimt = 1 Stella).",
    punkter: ["<b>I omløb</b> = alle spilleres penge lagt sammen. Ejernes egne penge er talt for sig.",
      "Graferne viser de sidste 30 dage. En dag uden søjle er en dag, hvor ingen vekslede eller kiggede her.",
      "🔍 Søg efter en spiller for at se alle deres vekslinger med saldo før og efter.",
      "Vekslinger gemmes for altid og kan ikke slettes."] };

  const fane = document.createElement("button");
  fane.type = "button";
  fane.dataset.fane = FANE;
  fane.textContent = "📈 Hotellets økonomi";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); hentOek(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (!faner) return;
    const efter = faner.querySelector('[data-fane="valuta"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
  })();
  fane.hidden = !erEjer();
  setInterval(function () { fane.hidden = !erEjer(); }, 1000);

  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === FANE && erEjer(); }
  function skriver() { return document.activeElement && document.activeElement.id === "oek-soeg"; }

  function hentOek() {
    if (oekHenter || !erEjer()) return;
    if (!kanServer()) { oekFejl = "Kræver, at du er logget ind på hotellets server."; if (paaFanen()) visFane(); return; }
    oekHenter = true;
    serverKald("hv_oekonomi", { p_token: token() }).then(function (svar) {
      const foer = JSON.stringify(oek);
      oek = svar; oekFejl = "";
      if (JSON.stringify(oek) !== foer && paaFanen() && !skriver()) visFane();
    }).catch(function (e) {
      oekFejl = serverFejl(e);
      if (paaFanen() && !skriver()) visFane();
    }).then(function () { oekHenter = false; });
  }
  setInterval(function () { if (paaFanen()) hentOek(); }, 6000);

  function soeg(navn) {
    soegNavn = String(navn || "").trim();
    soegSvar = null; soegFejl = "";
    if (!soegNavn) { visFane(); return; }
    soegFejl = "⏳ Henter …";
    visFane();
    serverKald("hv_veksler_spiller", { p_token: token(), p_navn: soegNavn }).then(function (svar) {
      soegSvar = svar; soegFejl = "";
    }).catch(function (e) { soegFejl = serverFejl(e); }).then(function () { if (paaFanen()) visFane(); });
  }

  // Lille søjlediagram (SVG). felt = hvilket tal i dage-listen.
  function graf(titel, dage, felt, farve, ikon) {
    const v = dage.map(function (d) { return d[felt] == null ? null : Number(d[felt]); });
    const maks = Math.max(1, Math.max.apply(null, v.map(function (x) { return x || 0; })));
    const B = 300, H = 70, n = dage.length || 1, bb = B / n;
    const sidste = v.filter(function (x) { return x != null; }).pop();
    let s = "";
    v.forEach(function (x, i) {
      if (x == null) return;
      const h = Math.max(x > 0 ? 2 : 0, Math.round((x / maks) * (H - 4)));
      s += "<rect x='" + (i * bb + 1).toFixed(1) + "' y='" + (H - h) + "' width='" + Math.max(1, bb - 2).toFixed(1) + "' height='" + h +
        "' rx='1.5' fill='" + farve + "'><title>" + r(dage[i].dato) + ": " + tal(x) + "</title></rect>";
    });
    return "<figure class='oek-graf'><figcaption>" + ikon + " " + r(titel) + " <b>" + (sidste == null ? "–" : tal(sidste)) + "</b></figcaption>" +
      "<svg viewBox='0 0 " + B + " " + (H + 1) + "' preserveAspectRatio='none' role='img' aria-label='" + r(titel) + "'>" +
      "<line x1='0' y1='" + H + "' x2='" + B + "' y2='" + H + "' stroke='#d8c4a8' stroke-width='1'/>" + s + "</svg>" +
      "<div class='oek-akse'><span>" + r(kortDato(dage[0])) + "</span><span>højest " + tal(maks) + "</span><span>i dag</span></div></figure>";
  }
  function kortDato(d) {
    if (!d) return "";
    const p = String(d.dato).split("-");
    return p.length === 3 ? (+p[2]) + "/" + (+p[1]) : d.dato;
  }

  function tabel(liste, medNavn) {
    if (!liste || !liste.length) return "<p class='ejer-info'>Ingen vekslinger endnu.</p>";
    return "<div class='oek-tabel-boks'><table class='oek-tabel'><thead><tr><th>Tid</th>" + (medNavn ? "<th>Spiller (ID)</th>" : "") +
      "<th>Vekslede</th><th>Fik</th><th>Saldo før</th><th>Saldo efter</th></tr></thead><tbody>" +
      liste.map(function (v) {
        return "<tr><td>" + tid(v.tid) + "</td>" +
          (medNavn ? "<td><button type='button' class='oek-navn' data-oek-navn='" + r(v.navn) + "'>" + r(v.navn) + "</button> <small>#" + v.spiller_id + "</small></td>" : "") +
          "<td>" + valuta(v.fra, v.beloeb) + "</td><td>" + valuta(v.til, v.modtaget) + "</td>" +
          "<td><small>" + GLIMT_IKON + tal(v.glimt_foer) + " · " + STELLA_IKON + tal(v.stella_foer) + "</small></td>" +
          "<td><small>" + GLIMT_IKON + tal(v.glimt_efter) + " · " + STELLA_IKON + tal(v.stella_efter) + "</small></td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function kort(ikon, titel, stort, lille) {
    return "<div class='oek-kort'><span class='oek-kort-titel'>" + ikon + " " + titel + "</span><b>" + stort + "</b><small>" + lille + "</small></div>";
  }

  function visOekonomi() {
    const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
    ejerIndhold.innerHTML = "";
    if (hjaelp) ejerIndhold.appendChild(hjaelp);
    const sek = document.createElement("div");
    sek.className = "oek-panel";
    const o = oek;
    const gN = r(glimtNavn());
    let html = "<div class='oek-top'><h3>📈 Hotellets økonomi</h3><button type='button' id='oek-opdater'>🔄 Opdater</button></div>" +
      "<p class='oek-kurs'>💱 Fast kurs for alle: <b>4 " + gN + " = 1 Stella</b></p>";
    if (oekFejl) html += "<p class='ejer-info'>⚠️ " + r(oekFejl) + "</p>";
    if (!o && !oekFejl) html += "<p class='ejer-info'>⏳ Henter tallene …</p>";
    if (o) {
      html += "<div class='oek-kort-raekke'>" +
        kort(GLIMT_IKON, gN + " i omløb", tal(o.glimt), "hos " + tal(o.spillere) + " spillere · ejerne har " + tal(o.ejer_glimt)) +
        kort(STELLA_IKON, "Stella i omløb", tal(o.stella), "hos " + tal(o.spillere) + " spillere · ejerne har " + tal(o.ejer_stella)) +
        kort("💱", "Vekslinger", tal(o.antal), tal(o.idag) + " i dag · " + tal(o.vekslere) + " spillere har vekslet") +
        kort(GLIMT_IKON + "➜" + STELLA_IKON, gN + " til Stella", tal(o.g_til_s_glimt) + " " + gN, "blev til " + tal(o.g_til_s_stella) + " Stella") +
        kort(STELLA_IKON + "➜" + GLIMT_IKON, "Stella til " + gN, tal(o.s_til_g_stella) + " Stella", "blev til " + tal(o.s_til_g_glimt) + " " + gN) +
        "</div>" +
        "<h4>📊 Udvikling de sidste 30 dage</h4><div class='oek-grafer'>" +
        graf(glimtNavn() + " i omløb", o.dage || [], "glimt", "#c9962e", GLIMT_IKON) +
        graf("Stella i omløb", o.dage || [], "stella", "#8a5bc4", STELLA_IKON) +
        graf("Vekslinger pr. dag", o.dage || [], "antal", "#7a1f2e", "💱") +
        "</div>";
    }
    html += "<h4>🔍 Søg efter en spiller</h4>" +
      "<div class='oek-soeg'><input id='oek-soeg' type='text' list='oek-navne' placeholder='Skriv et navn …' value='" + r(soegNavn) + "'>" +
      "<button type='button' id='oek-soeg-knap'>Søg</button>" + (soegNavn ? "<button type='button' id='oek-soeg-ryd'>✕</button>" : "") + "</div>" +
      "<datalist id='oek-navne'>" + (typeof alleSpillere === "function" ? alleSpillere().filter(function (s) {
        return typeof erComputerGaest !== "function" || !erComputerGaest(s.navn);
      }).map(function (s) { return "<option value='" + r(s.navn) + "'>"; }).join("") : "") + "</datalist>";
    if (soegFejl) html += "<p class='ejer-info'>" + (/^⏳/.test(soegFejl) ? "" : "⚠️ ") + r(soegFejl) + "</p>";
    if (soegSvar) {
      html += "<div class='oek-spiller'><b>" + r(soegSvar.navn) + "</b> <small>ID #" + soegSvar.id + "</small> · har nu " +
        valuta("glimt", soegSvar.glimt) + " og " + valuta("stella", soegSvar.stella) + " · " + tal(soegSvar.antal) + " vekslinger</div>" +
        tabel(soegSvar.liste, false);
    }
    if (o) html += "<h4>🕒 Seneste vekslinger</h4>" + tabel(o.seneste, true);
    sek.innerHTML = html;
    ejerIndhold.appendChild(sek);

    sek.querySelector("#oek-opdater").addEventListener("click", function () { oek = null; visFane(); hentOek(); if (soegNavn) soeg(soegNavn); });
    const inp = sek.querySelector("#oek-soeg");
    inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") soeg(inp.value); });
    sek.querySelector("#oek-soeg-knap").addEventListener("click", function () { soeg(inp.value); });
    const ryd = sek.querySelector("#oek-soeg-ryd");
    if (ryd) ryd.addEventListener("click", function () { soeg(""); });
    sek.querySelectorAll("[data-oek-navn]").forEach(function (k) {
      k.addEventListener("click", function () { soeg(k.dataset.oekNavn); });
    });
  }

  if (typeof visFane === "function") {
    const visFaneFoerVeksel = visFane;
    visFane = function () {
      const min = ejerFane === FANE;
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerVeksel();
      if (!min || ejerVindue.hidden || !erEjer()) return;
      visOekonomi();
    };
  }


  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme som resten af hotellet)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#veksel-knap { margin-left: 8px; padding: 0 6px; height: 22px; border-radius: 6px; border: 1px solid #d9a441; background: #7a1f2e; color: #f6dfa0;",
    "  font-size: 13px; line-height: 20px; cursor: pointer; pointer-events: auto; }",
    "#veksel-knap:hover { background: #962a3c; }",
    "#veksel-vindue { position: fixed; left: 50%; top: 90px; margin-left: -175px; width: 350px; max-width: calc(100vw - 24px); max-height: calc(100vh - 110px);",
    "  display: flex; flex-direction: column; z-index: 60; font-family: Verdana, sans-serif; color: #3a1a14; background: #fbf3e4;",
    "  border: 3px solid #d9a441; border-radius: 12px; box-shadow: 0 8px 22px rgba(60,10,20,.35); overflow: hidden; box-sizing: border-box; }",
    "#veksel-vindue[hidden], #veksel-vindue [hidden] { display: none !important; }",
    "#veksel-vindue .vk-top { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: #7a1f2e; color: #f6dfa0;",
    "  font: bold 15px Georgia, serif; cursor: move; }",
    "#veksel-vindue .vk-luk { background: rgba(0,0,0,.2); color: #f6dfa0; border: 1px solid rgba(246,223,160,.5); border-radius: 6px; width: 26px; height: 24px; cursor: pointer; padding: 0; }",
    "#veksel-vindue .vk-krop { padding: 10px 12px 12px; overflow-y: auto; font-size: 13px; }",
    "#veksel-vindue .vk-ikon, .oek-panel .vk-ikon { width: 14px; height: 14px; vertical-align: -2px; image-rendering: pixelated; }",
    "#veksel-vindue .vk-kurs { margin: 0 0 6px; padding: 6px 8px; background: #f3e2bd; border: 1px solid #e2c88e; border-radius: 8px; text-align: center; }",
    "#veksel-vindue .vk-saldo { margin: 0 0 8px; text-align: center; font-size: 12px; color: #6b4a3a; }",
    "#veksel-vindue .vk-retning { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }",
    "#veksel-vindue .vk-retning button { padding: 6px 4px; border: 2px solid #e2c88e; background: #fff; border-radius: 8px; cursor: pointer; color: #3a1a14; font: 13px Verdana, sans-serif; }",
    "#veksel-vindue .vk-retning button small { display: block; font-size: 11px; margin-top: 2px; }",
    "#veksel-vindue .vk-retning button.valgt { border-color: #7a1f2e; background: #7a1f2e; color: #f6dfa0; }",
    "#veksel-vindue .vk-felt { display: block; font-size: 12px; margin-bottom: 6px; }",
    "#veksel-vindue .vk-felt input { display: block; width: 100%; box-sizing: border-box; margin-top: 3px; padding: 7px 8px; font: bold 16px Verdana, sans-serif;",
    "  border: 2px solid #d9a441; border-radius: 8px; background: #fff; color: #3a1a14; }",
    "#veksel-vindue .vk-hurtig { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }",
    "#veksel-vindue .vk-hurtig button { flex: 1; padding: 4px 2px; border: 1px solid #e2c88e; background: #fff7e6; border-radius: 6px; cursor: pointer; color: #3a1a14; font-size: 12px; }",
    "#veksel-vindue .vk-regn { padding: 8px; background: #fff; border: 1px dashed #d9a441; border-radius: 8px; min-height: 22px; }",
    "#veksel-vindue .vk-linje { display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; }",
    "#veksel-vindue .vk-faar b { color: #2f6b2a; font-size: 15px; }",
    "#veksel-vindue .vk-efter { margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0e2c4; font-size: 12px; color: #6b4a3a; }",
    "#veksel-vindue .vk-note { margin: 4px 0 0; font-size: 11px; color: #8a6a4a; }",
    "#veksel-vindue .vk-tom { color: #8a6a4a; font-size: 12px; }",
    "#veksel-vindue .vk-fejl { margin: 6px 0 0; min-height: 1em; color: #b0282e; font-size: 12px; }",
    "#veksel-vindue .vk-hoved, #veksel-vindue .vk-ja { width: 100%; margin-top: 6px; padding: 8px; border: 0; border-radius: 8px; background: #7a1f2e; color: #f6dfa0;",
    "  font: bold 14px Verdana, sans-serif; cursor: pointer; }",
    "#veksel-vindue .vk-hoved:disabled { opacity: .45; cursor: default; }",
    "#veksel-vindue .vk-bekraeft { margin-top: 6px; padding: 8px; background: #fff3d6; border: 2px solid #d9a441; border-radius: 8px; }",
    "#veksel-vindue .vk-bekraeft p { margin: 0 0 6px; }",
    "#veksel-vindue .vk-bekraeft div { display: grid; grid-template-columns: 1fr 1.4fr; gap: 6px; }",
    "#veksel-vindue .vk-bekraeft .vk-ja { margin: 0; background: #2f6b2a; color: #fff; }",
    "#veksel-vindue .vk-fortryd { border: 1px solid #c9b48a; background: #fff; border-radius: 8px; cursor: pointer; color: #3a1a14; }",
    "#veksel-vindue .vk-faerdig { margin-top: 6px; padding: 8px; background: #e6f3dc; border: 1px solid #9ccc8f; border-radius: 8px; color: #24481f; }",
    "#veksel-vindue .vk-historik { margin-top: 10px; }",
    "#veksel-vindue .vk-historik summary { cursor: pointer; font-weight: bold; }",
    "#veksel-vindue .vk-mine ul { list-style: none; margin: 6px 0 0; padding: 0; max-height: 160px; overflow-y: auto; }",
    "#veksel-vindue .vk-mine li { padding: 4px 0; border-bottom: 1px solid #f0e2c4; font-size: 12px; }",
    "#veksel-vindue .vk-mine small { color: #8a6a4a; margin-right: 4px; }",
    "@media (max-width: 420px) { #veksel-vindue { left: 12px; margin-left: 0; width: calc(100vw - 24px); } }",
    ".oek-panel { color: #3a1a14; }",
    ".oek-panel .oek-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }",
    ".oek-panel .oek-top h3 { margin: 0; }",
    ".oek-panel .oek-kurs { margin: 6px 0 10px; }",
    ".oek-kort-raekke { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }",
    ".oek-kort { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; background: #fff; border: 1px solid #e2c88e; border-radius: 10px; }",
    ".oek-kort-titel { font-size: 12px; color: #6b4a3a; }",
    ".oek-kort b { font-size: 20px; color: #3a1a14; }",
    ".oek-kort small { font-size: 11px; color: #8a6a4a; }",
    ".oek-grafer { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }",
    ".oek-graf { margin: 0; padding: 8px 10px; background: #fff; border: 1px solid #e2c88e; border-radius: 10px; }",
    ".oek-graf figcaption { font-size: 12px; color: #6b4a3a; margin-bottom: 4px; } .oek-graf figcaption b { color: #3a1a14; float: right; }",
    ".oek-graf svg { display: block; width: 100%; height: 70px; }",
    ".oek-akse { display: flex; justify-content: space-between; font-size: 10px; color: #8a6a4a; margin-top: 2px; }",
    ".oek-soeg { display: flex; gap: 6px; } .oek-soeg input { flex: 1; min-width: 0; padding: 6px 8px; }",
    ".oek-spiller { margin: 8px 0 4px; padding: 6px 8px; background: #fff3d6; border: 1px solid #e2c88e; border-radius: 8px; }",
    ".oek-tabel-boks { overflow-x: auto; margin-top: 6px; }",
    ".oek-tabel { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }",
    ".oek-tabel th, .oek-tabel td { padding: 5px 6px; border-bottom: 1px solid #f0e2c4; text-align: left; white-space: nowrap; color: #3a1a14; }",
    ".oek-tabel th { background: #f3e2bd; font-size: 11px; }",
    ".oek-tabel small { color: #6b4a3a; }",
    ".oek-navn { background: none !important; border: 0 !important; padding: 0 !important; margin: 0 !important; color: #7a1f2e !important; text-decoration: underline; cursor: pointer; font: inherit !important; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
