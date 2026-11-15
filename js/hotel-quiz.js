// =============================================================
//  ❓ Hotel-quiz
//  Hver 10. minut kommer et spørgsmål op på HELE hotellet (et regnestykke eller et quiz-spørgsmål).
//  Man svarer ved at skrive  :S  og svaret i chatten, fx  :S 56
//  Den første med det rigtige svar vinder 2 Glimt ⭐. Alle ser, hvem der vandt.
//
//  • Serveren bestemmer alt (hvornår, hvilket spørgsmål og hvem der var først), så man ikke kan snyde.
//  • Svaret bliver IKKE sagt højt i rummet, så de andre ikke kan kopiere det.
//  • Man har 5 forsøg pr. spørgsmål.
//  • Mutede, frosne og bannede spillere ser ikke spørgsmålene og kan ikke svare.
//  • Ejerpanel → 🎉 Events → ❓ Hotel-quiz: slå til/fra, hvor tit, svartid, præmie, stil et spørgsmål nu.
//  • Spørgsmålene står i js/hotel-quiz-spoergsmaal.js (nem at udvide).
//
//  Kræver database-56-hotel-quiz.sql. Hentes fra js/panel-forklaring.js, så hotel.html ikke ændres.
// =============================================================
(function () {
  if (window.HOTEL_QUIZ_KOERER) return;
  window.HOTEL_QUIZ_KOERER = true;

  // Hent spørgsmålslisten
  if (!document.querySelector("script[src^='js/hotel-quiz-spoergsmaal.js']")) {
    const s = document.createElement("script");
    s.src = "js/hotel-quiz-spoergsmaal.js?t=" + Date.now();
    s.onload = function () { synkSpoergsmaal(); };
    document.body.appendChild(s);
  }

  // -----------------------------------------------------------
  //  Små hjælpere
  // -----------------------------------------------------------
  function r(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function token() { return typeof mitToken === "function" ? mitToken() : null; }
  function kanServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" && !!token(); }
  function mitNavn() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(mitNavn()) >= 0; }
  function glimtNavn() { return (typeof system !== "undefined" && system.valutaNavn) || "Glimt"; }
  function skriv(t) { if (typeof besked !== "undefined" && besked) besked.textContent = t; }
  function log(html) { if (typeof chatlogLinje === "function") chatlogLinje(html, "cl-quiz"); }
  function pling() { try { if (typeof spilPling === "function") spilPling(); } catch (e) {} }
  function serverFejl(e) {
    const m = (e && e.message) || "";
    if (/hv_quiz|Could not find the function/i.test(m)) return "Hotel-quizzen virker, når database-56-hotel-quiz.sql er kørt i Supabase.";
    return m || "Serveren svarede ikke. Prøv igen.";
  }
  function tidTekst(ms) {
    const sek = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(sek / 60), s = sek % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function klok(ms) { return new Date(ms).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }); }
  function dag(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" }) + " " + klok(ms);
  }
  // Mens serveren giver præmien, må den almindelige penge-opdatering vente (ellers "🎁 Du har fået …" to gange)
  function pausePenge(til) {
    try {
      if (typeof pengeSender === "undefined") return;
      pengeSender = til;
      if (!til && typeof sendPenge === "function") sendPenge();
    } catch (e) {}
  }

  // -----------------------------------------------------------
  //  Spørg serveren hvert 4. sekund
  // -----------------------------------------------------------
  let data = null;          // svaret fra hv_quiz_hent
  let forskel = 0;          // serverens ur minus mit ur
  let fejl = "";
  let henter = false;
  const sete = {};          // runde-id → "spm" / "slut", så chatloggen kun får hver linje én gang
  let lukketRunde = null;   // runde, som jeg har lukket boksen for
  let foersteHent = true;

  function nu() { return Date.now() + forskel; }

  function hent() {
    if (henter || !kanServer()) return;
    henter = true;
    serverKald("hv_quiz_hent", { p_token: token() }).then(function (svar) {
      fejl = "";
      if (svar && svar.nu) forskel = svar.nu - Date.now();
      data = svar;
      nyt();
    }).catch(function (e) { fejl = serverFejl(e); }).then(function () { henter = false; foersteHent = false; tegn(); });
  }
  setTimeout(hent, 1500);
  setInterval(hent, 4000);

  // Skriv i chatloggen, når der kommer et nyt spørgsmål, og når det er slut
  function nyt() {
    const ru = data && data.runde;
    if (!ru) return;
    const aaben = !ru.vinder && nu() < ru.slut;
    const frisk = nu() - ru.start < 60000;
    if (!sete[ru.id] && aaben) {
      sete[ru.id] = "spm";
      log("❓ <b>Hotel-quiz:</b> " + r(ru.spoergsmaal) + " <i>Skriv :S og dit svar. Præmie " + ru.praemie + " " + r(glimtNavn()) + "</i>");
      if (!foersteHent || frisk) pling();
      lukketRunde = null;
    } else if (!sete[ru.id]) {
      sete[ru.id] = "slut";        // var allerede slut, da jeg kom ind
    } else if (sete[ru.id] === "spm" && !aaben) {
      sete[ru.id] = "slut";
      if (ru.vinder) log("🏆 <b>" + r(ru.vinder) + "</b> svarede rigtigt (<b>" + r(ru.svar) + "</b>) og vinder " + ru.praemie + " " + r(glimtNavn()) + "!");
      else log("⌛ Ingen svarede rigtigt. Svaret var <b>" + r(ru.svar) + "</b>.");
      lukketRunde = null;
    }
  }

  // -----------------------------------------------------------
  //  Den store boks øverst på skærmen
  // -----------------------------------------------------------
  const boks = document.createElement("div");
  boks.id = "hq-boks";
  boks.hidden = true;
  document.body.appendChild(boks);
  boks.addEventListener("click", function (e) {
    if (e.target.closest(".hq-luk")) {
      lukketRunde = data && data.runde ? data.runde.id + ":" + (data.runde.vinder || (nu() < data.runde.slut ? "a" : "s")) : null;
      tegn();
      return;
    }
    if (e.target.closest(".hq-svar-knap")) {
      if (typeof chatTekst !== "undefined" && chatTekst) {
        chatTekst.value = ":S ";
        chatTekst.focus();
      }
    }
  });
  const pille = document.createElement("button");
  pille.type = "button";
  pille.id = "hq-pille";
  pille.hidden = true;
  document.body.appendChild(pille);
  pille.addEventListener("click", function () { lukketRunde = null; tegn(); });

  let sidstHtml = "";
  function tegn() {
    const ru = data && !data.straf ? data.runde : null;
    let html = "", vis = false, tilstand = "";
    if (ru) {
      const t = nu();
      if (!ru.vinder && t < ru.slut) {
        tilstand = "a";
        vis = true;
        html = "<button type='button' class='hq-luk' title='Skjul'>✕</button>" +
          "<div class='hq-titel'>❓ HOTEL-QUIZ <span>· præmie " + ru.praemie + " " + r(glimtNavn()) + " ⭐</span></div>" +
          "<div class='hq-spm'>" + r(ru.spoergsmaal) + "</div>" +
          "<div class='hq-bund'><button type='button' class='hq-svar-knap'>Skriv <b>:S</b> og dit svar i chatten</button>" +
          "<span class='hq-tid'>⏳ " + tidTekst(ru.slut - t) + "</span></div>";
      } else if (ru.vinder && t - ru.vundet < 20000) {
        tilstand = ru.vinder;
        vis = true;
        html = "<button type='button' class='hq-luk' title='Skjul'>✕</button>" +
          "<div class='hq-titel'>🏆 HOTEL-QUIZ</div>" +
          "<div class='hq-spm'><b>" + r(ru.vinder) + "</b> svarede rigtigt og vinder " + ru.praemie + " " + r(glimtNavn()) + " ⭐</div>" +
          "<div class='hq-bund'><span>" + r(ru.spoergsmaal) + " → <b>" + r(ru.svar) + "</b></span></div>";
      } else if (!ru.vinder && t >= ru.slut && t - ru.slut < 15000) {
        tilstand = "s";
        vis = true;
        html = "<button type='button' class='hq-luk' title='Skjul'>✕</button>" +
          "<div class='hq-titel'>⌛ HOTEL-QUIZ</div>" +
          "<div class='hq-spm'>Ingen svarede rigtigt i tide.</div>" +
          "<div class='hq-bund'><span>" + r(ru.spoergsmaal) + " → <b>" + r(ru.svar) + "</b></span></div>";
      }
    }
    const lukket = vis && lukketRunde === ru.id + ":" + tilstand;
    boks.hidden = !vis || lukket;
    pille.hidden = !(lukket && tilstand === "a");
    if (lukket && tilstand === "a") pille.textContent = "❓ Quiz · " + tidTekst(ru.slut - nu());
    boks.classList.toggle("hq-vinder", tilstand !== "a" && tilstand !== "s");
    if (html !== sidstHtml) { boks.innerHTML = html; sidstHtml = html; }
  }
  setInterval(tegn, 500);

  // -----------------------------------------------------------
  //  :S svar   (fx  :S 56   eller  :S Paris)
  //  Fanges før alle andre chat-kommandoer, og bliver aldrig sagt højt i rummet.
  // -----------------------------------------------------------
  const SVAR_REGEL = /^[:：]\s*s(?:\s+([\s\S]*)|(\d[\s\S]*))?$/i;
  let sender = false;

  window.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    const tekst = chatTekst.value.trim();
    const m = tekst.match(SVAR_REGEL);
    if (!m) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const svar = String(m[1] || m[2] || "").trim();
    if (!svar) { skriv("❓ Skriv dit svar efter :S, fx  :S 56"); return; }
    chatTekst.value = "";
    sendSvar(svar);
  }, true);

  function sendSvar(svar) {
    if (!kanServer()) { skriv("❓ Hotel-quizzen kræver, at du er logget ind på hotellets server."); return; }
    if (data && data.straf) { skriv("🔇 Du kan ikke være med i hotel-quizzen, mens du er mutet, frosset eller bannet."); return; }
    const ru = data && data.runde;
    if (!ru || ru.vinder || nu() >= ru.slut) {
      skriv("❓ Der er ikke noget quiz-spørgsmål lige nu." + (data && data.til && data.naeste ? " Det næste kommer kl. " + klok(data.naeste - forskel) + "." : ""));
      return;
    }
    if (sender) return;
    sender = true;
    pausePenge(true);
    serverKald("hv_quiz_svar", { p_token: token(), p_runde: ru.id, p_svar: svar }).then(function (s) {
      if (s && s.ok) {
        if (typeof saetPenge === "function") saetPenge({ glimt: s.glimt, stella: s.stella }, false);
        if (typeof blink === "function" && typeof glimtBoks !== "undefined") { try { blink(glimtBoks.querySelector(".penge")); } catch (e) {} }
        skriv("🏆 Rigtigt! Du vandt " + s.praemie + " " + glimtNavn() + "!");
        log("✅ Du svarede <b>" + r(svar) + "</b> – rigtigt! Du vandt " + s.praemie + " " + r(glimtNavn()) + " ⭐");
        pling();
        hent();
        return;
      }
      const h = s && s.hvorfor;
      if (h === "forkert") {
        skriv("❌ " + svar + " er forkert. " + (s.tilbage > 0 ? "Du har " + s.tilbage + " forsøg tilbage." : "Du har ikke flere forsøg på dette spørgsmål."));
        log("❌ Du svarede <b>" + r(svar) + "</b> – forkert." + (s.tilbage > 0 ? " " + s.tilbage + " forsøg tilbage." : ""));
      } else if (h === "for_sent") {
        skriv("😅 For sent! " + (s.vinder || "En anden") + " svarede rigtigt først.");
      } else if (h === "for_mange") {
        skriv("✋ Du har brugt alle 5 forsøg på dette spørgsmål. Vent på det næste.");
      } else {
        skriv("❓ Der er ikke noget quiz-spørgsmål lige nu.");
      }
    }).catch(function (e) { skriv("⚠️ " + serverFejl(e)); })
      .then(function () { sender = false; pausePenge(false); });
  }

  // -----------------------------------------------------------
  //  Ejeren sender spørgsmålslisten til serveren (af sig selv, én gang hver gang man kommer ind)
  // -----------------------------------------------------------
  let synket = false, synkSvar = "";
  function synkSpoergsmaal(tving) {
    if ((synket && !tving) || !erEjer() || !kanServer() || !Array.isArray(window.HOTEL_QUIZ)) return Promise.resolve();
    synket = true;
    return serverKald("hv_quiz_spm_saet", { p_token: token(), p_liste: window.HOTEL_QUIZ }).then(function (s) {
      synkSvar = "✅ " + (s && s.antal) + " spørgsmål er sendt til serveren.";
    }).catch(function (e) { synket = false; synkSvar = "⚠️ " + serverFejl(e); });
  }
  setInterval(function () { if (!synket) synkSpoergsmaal(); }, 10000);

  // -----------------------------------------------------------
  //  Ejerpanel → ❓ Hotel-quiz (kun ejeren)
  // -----------------------------------------------------------
  const FANE = "quiz";
  let ejer = null, ejerFejl = "", ejerHenter = false, gemTekst = "";

  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP[FANE] = { titel: "❓ Hotel-quiz",
    tekst: "Et spørgsmål på hele hotellet med jævne mellemrum. Den første, der skriver det rigtige svar med :S, vinder Glimt.",
    punkter: ["Spillerne svarer ved at skrive <b>:S</b> og svaret i chatten, fx <b>:S 56</b>. Svaret bliver ikke vist for de andre.",
      "Serveren bestemmer, hvem der var først, så kun én kan vinde hvert spørgsmål. Man har 5 forsøg.",
      "Mutede, frosne og bannede spillere ser ikke spørgsmålene og kan ikke svare.",
      "Flere spørgsmål: skriv dem ind i <b>js/hotel-quiz-spoergsmaal.js</b>. Regnestykkerne laver serveren selv."] };

  const fane = document.createElement("button");
  fane.type = "button";
  fane.dataset.fane = FANE;
  fane.textContent = "❓ Hotel-quiz";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); hentEjer(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (!faner) return;
    const efter = faner.querySelector('[data-fane="events"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
  })();
  fane.hidden = !erEjer();
  setInterval(function () { fane.hidden = !erEjer(); }, 1000);

  function paaFanen() { return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === FANE && erEjer(); }
  function skriverIPanelet() { return ejerIndhold.contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName); }

  function hentEjer() {
    if (ejerHenter || !erEjer()) return;
    if (!kanServer()) { ejerFejl = "Kræver, at du er logget ind på hotellets server."; if (paaFanen()) visFane(); return; }
    ejerHenter = true;
    serverKald("hv_quiz_ejer", { p_token: token() }).then(function (s) {
      const foer = JSON.stringify(ejer);
      ejer = s; ejerFejl = "";
      if (JSON.stringify(ejer) !== foer && paaFanen() && !skriverIPanelet()) visFane();
    }).catch(function (e) {
      ejerFejl = serverFejl(e);
      if (paaFanen() && !skriverIPanelet()) visFane();
    }).then(function () { ejerHenter = false; });
  }
  setInterval(function () { if (paaFanen()) hentEjer(); }, 6000);

  const INTERVALLER = [2, 5, 10, 15, 20, 30, 45, 60, 120];
  const SVARTIDER = [1, 2, 3, 5, 10];

  function vaelg(id, liste, valgt, enhed) {
    if (liste.indexOf(valgt) < 0) liste = liste.concat([valgt]).sort(function (a, b) { return a - b; });
    return "<select id='" + id + "'>" + liste.map(function (v) {
      return "<option value='" + v + "'" + (v === valgt ? " selected" : "") + ">" + v + " " + enhed + "</option>";
    }).join("") + "</select>";
  }

  function visQuiz() {
    const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
    ejerIndhold.innerHTML = "";
    if (hjaelp) ejerIndhold.appendChild(hjaelp);
    const sek = document.createElement("div");
    sek.className = "hq-panel";
    const o = ejer;
    let html = "<div class='hq-p-top'><h3>❓ Hotel-quiz</h3><button type='button' id='hq-opdater'>🔄 Opdater</button></div>";
    if (ejerFejl) html += "<p class='ejer-info'>⚠️ " + r(ejerFejl) + "</p>";
    if (!o && !ejerFejl) html += "<p class='ejer-info'>⏳ Henter …</p>";
    if (o) {
      const ru = data && data.runde;
      let lige = "Intet spørgsmål lige nu.";
      if (ru && !ru.vinder && nu() < ru.slut) lige = "❓ <b>" + r(ru.spoergsmaal) + "</b> · " + tidTekst(ru.slut - nu()) + " tilbage";
      else if (o.til && data && data.naeste) lige += " Det næste kommer kl. " + klok(data.naeste - forskel) + ".";
      html += "<div class='hq-p-kort'>" +
        "<label class='hq-p-til'><input type='checkbox' id='hq-til'" + (o.til ? " checked" : "") + "> <b>Quizzen er slået " + (o.til ? "TIL ✅" : "FRA ⛔") + "</b></label>" +
        "<div class='hq-p-felter'>" +
        "<label>Et spørgsmål hver " + vaelg("hq-min", INTERVALLER, o.minutter, "min.") + "</label>" +
        "<label>Tid til at svare " + vaelg("hq-aaben", SVARTIDER, o.aaben, "min.") + "</label>" +
        "<label>Præmie <input type='number' id='hq-praemie' min='0' max='100' value='" + o.praemie + "'> " + r(glimtNavn()) + "</label>" +
        "<label>Regnestykker <input type='number' id='hq-regne' min='0' max='100' value='" + o.regne + "'> %</label>" +
        "</div>" +
        "<div class='hq-p-knapper'><button type='button' id='hq-gem'>💾 Gem</button>" +
        "<button type='button' id='hq-nu'>❓ Stil et spørgsmål nu</button>" +
        "<button type='button' id='hq-synk'>📤 Send spørgsmålene igen</button></div>" +
        (gemTekst ? "<p class='hq-p-gemt'>" + r(gemTekst) + "</p>" : "") +
        "<p class='hq-p-nu'>" + lige + "</p></div>";
      html += "<div class='hq-p-tal'>" +
        "<div><b>" + o.spm + "</b><small>spørgsmål på listen (" + o.brugt + " brugt i denne omgang)</small></div>" +
        "<div><b>" + o.stillet + "</b><small>stillet i alt</small></div>" +
        "<div><b>" + o.vundet + "</b><small>vundet</small></div>" +
        "<div><b>" + o.glimt_ud + "</b><small>" + r(glimtNavn()) + " givet ud</small></div></div>";
      if (synkSvar) html += "<p class='ejer-info'>" + r(synkSvar) + "</p>";
      html += "<h4>🏆 Flest sejre</h4>" + (o.top && o.top.length ? "<ol class='hq-p-top10'>" + o.top.map(function (t) {
        return "<li><b>" + r(t.navn) + "</b> · " + t.antal + " sejre · " + t.glimt + " " + r(glimtNavn()) + "</li>";
      }).join("") + "</ol>" : "<p class='ejer-info'>Ingen har vundet endnu.</p>");
      html += "<h4>🕒 Seneste spørgsmål</h4>" + (o.seneste && o.seneste.length ? "<div class='hq-p-tabel-boks'><table class='hq-p-tabel'><thead><tr><th>Tid</th><th>Spørgsmål</th><th>Svar</th><th>Vinder</th></tr></thead><tbody>" +
        o.seneste.map(function (x) {
          return "<tr><td>" + dag(x.start) + "</td><td>" + r(x.spoergsmaal) + "</td><td>" + r(x.svar) + "</td><td>" +
            (x.vinder ? "🏆 " + r(x.vinder) + " <small>+" + x.praemie + "</small>" : x.slut > nu() ? "<small>⏳ i gang</small>" : "<small>ingen</small>") + "</td></tr>";
        }).join("") + "</tbody></table></div>" : "<p class='ejer-info'>Ingen spørgsmål endnu.</p>");
    }
    sek.innerHTML = html;
    ejerIndhold.appendChild(sek);

    sek.querySelector("#hq-opdater").addEventListener("click", function () { ejer = null; visFane(); hentEjer(); });
    if (!o) return;
    function gem(til) {
      gemTekst = "⏳ Gemmer …"; visFane();
      serverKald("hv_quiz_indstil", {
        p_token: token(),
        p_til: til,
        p_minutter: parseInt(sek.querySelector("#hq-min").value, 10),
        p_aaben: parseInt(sek.querySelector("#hq-aaben").value, 10),
        p_praemie: parseInt(sek.querySelector("#hq-praemie").value, 10) || 0,
        p_regne: parseInt(sek.querySelector("#hq-regne").value, 10) || 0,
      }).then(function () {
        gemTekst = "✅ Gemt.";
        if (typeof adminSkriv === "function") adminSkriv("Hotel-quiz: " + (til ? "til" : "fra") + ", hver " + sek.querySelector("#hq-min").value + " min.");
      }).catch(function (e) { gemTekst = "⚠️ " + serverFejl(e); })
        .then(function () { ejer = null; hentEjer(); hent(); });
    }
    sek.querySelector("#hq-til").addEventListener("change", function (e) { gem(e.target.checked); });
    sek.querySelector("#hq-gem").addEventListener("click", function () { gem(sek.querySelector("#hq-til").checked); });
    sek.querySelector("#hq-nu").addEventListener("click", function () {
      const k = this;
      if (!k.dataset.sikker) { k.dataset.sikker = "1"; k.textContent = "Er du sikker? Klik igen"; return; }
      gemTekst = "⏳ Stiller et spørgsmål …"; visFane();
      serverKald("hv_quiz_nu", { p_token: token() }).then(function () { gemTekst = "✅ Nyt spørgsmål er sendt ud på hele hotellet."; })
        .catch(function (e) { gemTekst = "⚠️ " + serverFejl(e); })
        .then(function () { ejer = null; hent(); hentEjer(); });
    });
    sek.querySelector("#hq-synk").addEventListener("click", function () {
      synkSvar = "⏳ Sender …"; visFane();
      synkSpoergsmaal(true).then(function () { ejer = null; hentEjer(); });
    });
    sek.querySelectorAll("input[type=number]").forEach(function (i) {
      i.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") gem(sek.querySelector("#hq-til").checked); });
    });
  }

  if (typeof visFane === "function") {
    const visFaneFoerQuiz = visFane;
    visFane = function () {
      const min = ejerFane === FANE;
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerQuiz();
      if (!min || ejerVindue.hidden || !erEjer()) return;
      visQuiz();
    };
  }

  // -----------------------------------------------------------
  //  Udseendet (vinrød, guld og creme)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#hq-boks { position: fixed; left: 50%; top: 58px; transform: translateX(-50%); z-index: 57; width: 460px; max-width: calc(100vw - 24px); box-sizing: border-box;",
    "  padding: 10px 14px 10px; background: linear-gradient(#5a1726, #3a0d18); color: #f6e7c1; border: 2px solid #d9b45a; border-radius: 14px;",
    "  box-shadow: 0 8px 26px rgba(0,0,0,.45); font-family: Verdana, sans-serif; text-align: center; animation: hq-ind .35s ease-out; }",
    "#hq-boks[hidden], #hq-pille[hidden] { display: none !important; }",
    "#hq-boks.hq-vinder { background: linear-gradient(#7a5a12, #4a3208); }",
    "@keyframes hq-ind { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }",
    "#hq-boks .hq-luk { position: absolute; right: 6px; top: 5px; width: 24px; height: 22px; padding: 0; border-radius: 6px; cursor: pointer;",
    "  background: rgba(0,0,0,.25); color: #f6dfa0; border: 1px solid rgba(246,223,160,.45); font-size: 12px; }",
    "#hq-boks .hq-titel { font: bold 12px Verdana, sans-serif; letter-spacing: 2px; color: #e8c766; }",
    "#hq-boks .hq-titel span { letter-spacing: 0; font-weight: normal; color: #f2dca6; }",
    "#hq-boks .hq-spm { margin: 6px 4px 8px; font: bold 19px Georgia, serif; line-height: 1.25; overflow-wrap: anywhere; }",
    "#hq-boks .hq-bund { display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 12px; color: #f2dca6; }",
    "#hq-boks .hq-svar-knap { padding: 4px 10px; border-radius: 8px; border: 1px solid #d9b45a; background: #f6e7c1; color: #4a1320; cursor: pointer; font: 12px Verdana, sans-serif; }",
    "#hq-boks .hq-svar-knap:hover { background: #fff3d6; }",
    "#hq-boks .hq-tid { font-weight: bold; color: #fff; font-variant-numeric: tabular-nums; }",
    "#hq-pille { position: fixed; left: 50%; top: 58px; transform: translateX(-50%); z-index: 57; padding: 5px 12px; border-radius: 16px; cursor: pointer;",
    "  background: #5a1726; color: #f6e7c1; border: 2px solid #d9b45a; font: bold 12px Verdana, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,.35); }",
    "#chatlog li.cl-quiz { background: #f6e7c1; border-left: 3px solid #b8901c; color: #4a1320; padding-left: 4px; }",
    ".hq-panel h3 { margin: 0; } .hq-panel h4 { margin: 14px 0 6px; }",
    ".hq-panel .hq-p-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }",
    ".hq-panel button { cursor: pointer; padding: 5px 10px; border-radius: 8px; border: 1px solid #d9a441; background: #7a1f2e; color: #f6dfa0; font: 12px Verdana, sans-serif; }",
    ".hq-panel button:hover { background: #962a3c; }",
    ".hq-panel .hq-p-kort { padding: 10px 12px; background: #fff7e6; border: 1px solid #e2c88e; border-radius: 10px; color: #3a1a14; }",
    ".hq-panel .hq-p-til { display: block; margin-bottom: 8px; font-size: 14px; cursor: pointer; }",
    ".hq-panel .hq-p-til input { width: 18px; height: 18px; vertical-align: -3px; }",
    ".hq-panel .hq-p-felter { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px 12px; font-size: 12px; }",
    ".hq-panel .hq-p-felter select, .hq-panel .hq-p-felter input { margin-left: 4px; padding: 3px 4px; font: 12px Verdana, sans-serif; }",
    ".hq-panel .hq-p-felter input { width: 56px; }",
    ".hq-panel .hq-p-knapper { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }",
    ".hq-panel .hq-p-gemt, .hq-panel .hq-p-nu { margin: 8px 0 0; font-size: 12px; }",
    ".hq-panel .hq-p-tal { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; margin-top: 10px; }",
    ".hq-panel .hq-p-tal div { padding: 8px; background: #fff; border: 1px solid #e2c88e; border-radius: 8px; text-align: center; color: #3a1a14; }",
    ".hq-panel .hq-p-tal b { display: block; font-size: 20px; color: #7a1f2e; } .hq-panel .hq-p-tal small { font-size: 11px; }",
    ".hq-panel .hq-p-top10 { margin: 0; padding-left: 22px; font-size: 13px; }",
    ".hq-panel .hq-p-tabel-boks { max-height: 320px; overflow: auto; border: 1px solid #e2c88e; border-radius: 8px; }",
    ".hq-panel .hq-p-tabel { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; color: #3a1a14; }",
    ".hq-panel .hq-p-tabel th { position: sticky; top: 0; background: #7a1f2e; color: #f6dfa0; text-align: left; padding: 5px 6px; }",
    ".hq-panel .hq-p-tabel td { padding: 4px 6px; border-top: 1px solid #f0e2c4; vertical-align: top; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
