// =============================================================
//  💼 Løn til de ansatte
//  - Hver mandag (dansk tid) får alle med et personale-skilt (Mod, Staff, Hjælper, Eventvært,
//    Eventfolk, Bygmester, Support, Content creator) et beløb Glimt ⭐. Standard: 100.
//  - Lønnen udbetales på serveren (hv_loen_tjek i database-43-loen-og-loppetider.sql), første
//    gang nogen er inde på hotellet i den nye uge. Kun én gang pr. ansat pr. uge.
//  - Bliver man fyret, stopper lønnen med det samme (man har jo ikke skiltet længere).
//  - Den ansatte får en lille besked: "💼 Ugens løn!"
//  - Ejerpanel → Personale → 💼 Løn (kun ejeren): slå til/fra, ændr beløbet, se hvem der får løn.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function start(forsoeg) {
  if (window.ANSAT_LOEN_KLAR) return;
  const klar = typeof serverKald === "function" && typeof visFane === "function" && typeof ejerIndhold !== "undefined" &&
    typeof FIGUR !== "undefined" && document.getElementById("ejer-faner");
  if (!klar) { if (forsoeg < 120) setTimeout(function () { start(forsoeg + 1); }, 500); return; }
  window.ANSAT_LOEN_KLAR = true;

  const FANE = "loen";
  const SKILT_NAVN = { mod: "Mod", staff: "Staff", hjaelper: "Hjælper", eventvaert: "Eventvært", eventfolk: "Eventfolk",
    bygmester: "Bygmester", support: "Support", "content-creator": "Content creator" };

  function r(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function tal(n) { return Number(n || 0).toLocaleString("da-DK"); }
  function token() { return typeof mitToken === "function" ? mitToken() : null; }
  function kanServer() { return typeof SERVER !== "undefined" && SERVER.til && !!token(); }
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }
  function glimtNavn() { return (typeof system !== "undefined" && system.valutaNavn) || "Glimt"; }
  function mangler(e) { return /function|schema cache|does not exist|hv_loen/i.test(e && e.message || ""); }
  function laes(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function skriv(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function dato(d) {
    if (!d) return "";
    const t = new Date(d);
    return isNaN(t) ? String(d) : t.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" }) +
      " kl. " + t.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  }
  function ugeTekst(uge) {
    const t = new Date(uge + "T12:00:00");
    return isNaN(t) ? uge : "mandag " + t.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  }

  // -----------------------------------------------------------
  //  Alle spillere spørger serveren jævnligt. Så bliver lønnen udbetalt
  //  om mandagen, så snart nogen er inde, og den ansatte får besked.
  // -----------------------------------------------------------
  const popup = document.createElement("div");
  popup.id = "loen-popup";
  popup.hidden = true;
  popup.innerHTML = "<div class='lp-ikon'>💼</div><b>Ugens løn!</b><p id='lp-tekst'></p><button type='button' id='lp-ok'>Tak! 🙏</button>";
  document.body.appendChild(popup);
  popup.querySelector("#lp-ok").addEventListener("click", function () { popup.hidden = true; });

  let tjekker = false;
  function tjekLoen() {
    if (tjekker || !kanServer()) return;
    tjekker = true;
    serverKald("hv_loen_tjek", { p_token: token() }).then(function (svar) {
      tjekker = false;
      if (!svar || !(svar.fik > 0)) return;
      const noegle = "mit-hotel-loen-vist-" + String(FIGUR.navn || "").toLowerCase();
      if (laes(noegle) === svar.uge) return;
      skriv(noegle, svar.uge);
      popup.querySelector("#lp-tekst").innerHTML = "Du har fået <b>" + tal(svar.fik) + " " + r(glimtNavn()) + " ⭐</b> for dit arbejde på HELLO VERA i denne uge.<br>Tak fordi du er ansat! 💛";
      popup.hidden = false;
      if (typeof spilPling === "function") { try { spilPling(); } catch (e) {} }
      if (typeof hentPenge === "function") setTimeout(hentPenge, 300);
    }).catch(function () { tjekker = false; });    // database-43 er ikke kørt endnu
  }
  setTimeout(tjekLoen, 4000);
  setInterval(tjekLoen, 60000);

  // -----------------------------------------------------------
  //  Ejerpanel → 💼 Løn
  // -----------------------------------------------------------
  let data = null, fejl = "", henter = false, status = "";

  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP[FANE] = { titel: "💼 Løn til de ansatte",
    tekst: "Hver mandag får alle ansatte automatisk løn i Glimt. Du bestemmer beløbet og kan slå det fra.",
    punkter: ["Lønnen gives til alle med et personale-skilt: Mod, Staff, Hjælper, Eventvært, Eventfolk, Bygmester, Support og Content creator.",
      "Den udbetales om mandagen (dansk tid), så snart nogen er inde på hotellet. Kun én gang pr. uge.",
      "Fyrer du en ansat i 🎖 Ansættelse, får de ingen løn mere fra det øjeblik.",
      "Ejerne får ikke løn (I kan give jer selv penge i Valuta).",
      "Ændrer du beløbet, gælder det fra næste udbetaling."] };

  const fane = document.createElement("button");
  fane.type = "button";
  fane.dataset.fane = FANE;
  fane.textContent = "💼 Løn";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); hent(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    const efter = faner.querySelector('[data-fane="vagtskema"]') || faner.querySelector('[data-fane="ansaettelse"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
  })();
  fane.hidden = !erEjer();
  setInterval(function () { fane.hidden = !erEjer(); }, 1000);

  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === FANE && erEjer(); }
  function skriver() { const a = document.activeElement; return !!(a && a.id === "loen-beloeb"); }

  function hent() {
    if (henter || !erEjer()) return;
    if (!kanServer()) { fejl = "Kræver, at du er logget ind på hotellets server."; if (paaFanen()) visFane(); return; }
    henter = true;
    serverKald("hv_loen_hent", { p_token: token() }).then(function (svar) {
      henter = false; fejl = "";
      const foer = JSON.stringify(data);
      data = svar;
      if (JSON.stringify(data) !== foer && paaFanen() && !skriver()) visFane();
    }).catch(function (e) {
      henter = false;
      fejl = mangler(e) ? "Løn kræver, at database-43-loen-og-loppetider.sql er kørt i Supabase (SQL Editor → Run)." : e.message;
      if (paaFanen() && !skriver()) visFane();
    });
  }
  setInterval(function () { if (paaFanen()) hent(); }, 6000);

  function gem(til, beloeb) {
    status = "⏳ Gemmer …"; visFane();
    serverKald("hv_loen_saet", { p_token: token(), p_til: til, p_beloeb: beloeb }).then(function () {
      status = til === false ? "⏸ Lønnen er slået fra. Ingen får løn, før du slår den til igen." :
        til === true ? "✅ Lønnen er slået til." : "✅ Lønnen er nu " + tal(beloeb) + " " + glimtNavn() + " om ugen.";
      data = null; hent(); tjekLoen();
    }).catch(function (e) { status = "⚠️ " + (mangler(e) ? "Kør først database-43-loen-og-loppetider.sql i Supabase." : e.message); visFane(); });
  }

  function visLoen() {
    const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
    ejerIndhold.innerHTML = "";
    if (hjaelp) ejerIndhold.appendChild(hjaelp);
    const sek = document.createElement("div");
    sek.className = "loen-panel";
    if (fejl) { sek.innerHTML = "<h3>💼 Løn til de ansatte</h3><p class='ejer-info'>⚠️ " + r(fejl) + "</p>"; ejerIndhold.appendChild(sek); return; }
    if (!data) { sek.innerHTML = "<h3>💼 Løn til de ansatte</h3><p class='ejer-info'>⏳ Henter …</p>"; ejerIndhold.appendChild(sek); return; }
    const ansatte = data.ansatte || [], seneste = data.seneste || [];
    const fikNu = ansatte.filter(function (a) { return a.fik; }).length;
    sek.innerHTML = "<h3>💼 Løn til de ansatte</h3>" +
      "<p class='loen-status " + (data.til ? "til" : "fra") + "'>" + (data.til
        ? "🟢 Slået til: hver mandag får alle ansatte <b>" + tal(data.beloeb) + " " + r(glimtNavn()) + " ⭐</b>"
        : "⏸ Slået fra: ingen får løn lige nu") + "</p>" +
      "<div class='sp-handlinger'>" + (data.til ? "<button type='button' data-loen-til='0'>🔴 Slå lønnen fra</button>"
        : "<button type='button' data-loen-til='1'>▶️ Slå lønnen til</button>") + "</div>" +
      "<label class='ejer-felt'>Løn pr. uge (" + r(glimtNavn()) + ")<input id='loen-beloeb' type='number' min='1' max='100000' value='" + (+data.beloeb || 100) + "'></label>" +
      "<div class='sp-handlinger'><button type='button' id='loen-gem'>💾 Gem beløb</button>" +
      [50, 100, 200, 500].map(function (n) { return "<button type='button' class='loen-hurtig' data-loen-hurtig='" + n + "'>" + n + "</button>"; }).join("") + "</div>" +
      "<p class='loen-ok'>" + r(status) + "</p>" +
      "<h3>Ansatte lige nu (" + ansatte.length + ")</h3>" +
      "<p class='ejer-info'>Denne uge (fra " + r(ugeTekst(data.uge)) + "): " + fikNu + " af " + ansatte.length + " har fået løn.</p>" +
      (ansatte.length ? "<ul class='loen-liste'>" + ansatte.map(function (a) {
        return "<li><b>" + r(a.navn) + "</b> <span class='loen-skilt'>" + r(SKILT_NAVN[a.skilt] || a.skilt) + "</span>" +
          "<span class='loen-uge'>" + (a.fik ? "✅ Fået " + tal(a.fik) + " ⭐ denne uge" : data.til ? "⏳ Får den snart" : "⏸ Lønnen er slået fra") + "</span>" +
          "<small>I alt: " + tal(a.ialt) + " ⭐</small></li>";
      }).join("") + "</ul>" : "<p class='ejer-info'>Du har ingen ansatte endnu. Giv et skilt i 🎖 Ansættelse.</p>") +
      "<h3>Seneste udbetalinger</h3>" +
      (seneste.length ? "<ul class='loen-liste'>" + seneste.map(function (u) {
        return "<li><b>" + r(u.navn) + "</b> <span class='loen-skilt'>" + r(SKILT_NAVN[u.skilt] || u.skilt || "") + "</span>" +
          "<span>+" + tal(u.beloeb) + " ⭐</span><small>" + r(dato(u.tid)) + "</small></li>";
      }).join("") + "</ul>" : "<p class='ejer-info'>Der er ikke udbetalt løn endnu.</p>");
    ejerIndhold.appendChild(sek);

    sek.querySelectorAll("[data-loen-til]").forEach(function (k) {
      k.addEventListener("click", function () { gem(k.dataset.loenTil === "1", null); });
    });
    sek.querySelectorAll("[data-loen-hurtig]").forEach(function (k) {
      k.addEventListener("click", function () { sek.querySelector("#loen-beloeb").value = k.dataset.loenHurtig; });
    });
    sek.querySelector("#loen-gem").addEventListener("click", function () {
      const n = parseInt(sek.querySelector("#loen-beloeb").value, 10);
      if (!(n >= 1 && n <= 100000)) { status = "⚠️ Skriv et tal mellem 1 og 100.000."; visFane(); return; }
      gem(null, n);
    });
  }

  const visFaneFoerLoen = visFane;
  visFane = function () {
    const min = ejerFane === FANE;
    if (min) ejerIndhold.innerHTML = "";
    visFaneFoerLoen.apply(this, arguments);
    if (!min || ejerVindue.hidden || !erEjer()) return;
    visLoen();
  };

  // Jobbeskrivelserne fortæller, at man får løn
  if (typeof JOB_KAN !== "undefined") Object.keys(SKILT_NAVN).forEach(function (s) {
    const l = JOB_KAN[s];
    if (l && l.indexOf("💼 Får løn i Glimt hver mandag") < 0) l.push("💼 Får løn i Glimt hver mandag");
  });

  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#loen-popup { position: fixed; left: 50%; top: 30%; transform: translateX(-50%); z-index: 70; width: 290px; max-width: calc(100vw - 24px); box-sizing: border-box;",
    "  text-align: center; padding: 14px 16px; font-family: Verdana, sans-serif; color: #3a1a14; background: #fbf3e4; border: 3px solid #d9a441; border-radius: 14px;",
    "  box-shadow: 0 10px 28px rgba(60,10,20,.45); animation: lp-ind .4s ease-out; }",
    "#loen-popup[hidden] { display: none !important; }",
    "@keyframes lp-ind { from { opacity: 0; transform: translate(-50%, 12px) scale(.95); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }",
    "#loen-popup .lp-ikon { font-size: 34px; }",
    "#loen-popup b { font: bold 18px Georgia, serif; color: #7a1f2e; }",
    "#loen-popup p { font-size: 13px; line-height: 1.45; margin: 8px 0 12px; }",
    "#lp-ok { background: linear-gradient(180deg, #9a2a3a, #7a1f2e); color: #fbeacb; border: 1px solid #5a1420; border-radius: 8px; padding: 6px 16px; font: bold 13px Verdana, sans-serif; cursor: pointer; }",
    ".loen-panel .loen-status { font-weight: bold; padding: 6px 8px; border-radius: 8px; margin: 4px 0 8px; }",
    ".loen-panel .loen-status.til { background: #e3f1dc; color: #2f5a2a; }",
    ".loen-panel .loen-status.fra { background: #f5e0d6; color: #7a1f2e; }",
    ".loen-panel .loen-ok { font-size: 12px; color: #7a1f2e; min-height: 1em; margin: 4px 0; }",
    ".loen-panel .loen-hurtig { min-width: 44px; }",
    ".loen-liste { list-style: none; margin: 4px 0 10px; padding: 0; }",
    ".loen-liste li { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; padding: 6px 4px; border-bottom: 1px solid #eadcbc; font-size: 12px; }",
    ".loen-liste .loen-skilt { background: #7a1f2e !important; color: #f6dfa0 !important; border-radius: 9px; padding: 1px 7px; font-size: 11px; }",
    ".loen-liste small { color: #8a6a4a; margin-left: auto; }",
  ].join("\n");
  document.head.appendChild(stil);
})(0);
