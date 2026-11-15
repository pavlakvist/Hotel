// =============================================================
//  🎪 Event-app — telefonens app for Eventfolk, Eventværter og ejeren
//  - Appen kommer AF SIG SELV på telefonen, når man bliver ansat som Eventfolk
//    eller Eventvært, og forsvinder igen, når man ikke er ansat mere.
//    Ejeren har den altid (ejeren har aldrig færre ting end de ansatte).
//  - 4 faner:
//     📅 Events      opret, planlæg og se kommende events. ▶ Start sender det store
//                    event-skilt med ➡ Følg-knap ud til alle (samme som i Ejerpanelet).
//     🎲 Lege        hotellets lege med regler og små hjælpere (quiz, bingo, frys-dans …).
//                    Nye lege tilføjes nemt i listen EA_LEGE herunder.
//     🏆 Resultater  skriv vinderne ind (de får vinderboksen og én gratis ting, som i dag)
//                    og se alle tidligere vindere og præmier.
//     👥 Team        se eventkollegaerne (🟢 online / hvor de er) og en chat kun for jer og ejeren.
//  - Sætter også skiltet 🎪 Eventfolk tilbage i Ansættelse (Pavla valgte det 15/11).
//  Kræver database-55-event-app.sql (og database-21 + database-35, som allerede er kørt).
//  Hentes fra slutningen af js/panel-forklaring.js, så hotel.html ikke skal ændres.
//  Alt her hedder "ea…", så det ikke støder ind i andre filer.
// =============================================================
(function () {
  if (window.eventAppKlar) return;
  window.eventAppKlar = true;

  const EA_MANGLER = "⚠️ Serveren kender ikke Event-appen endnu. Kør database-55-event-app.sql i Supabase → SQL Editor.";
  const EA_TEAM_SKILTE = ["eventvaert", "eventfolk"];

  // ---------------------------------------------------------------
  //  🎲 Legene. Vil du have en ny leg med? Kopiér en af dem og ret teksten.
  //  hjaelper: "spoergsmaal" | "tema" | "bingo" | "frys" | "tal" | "ord" | "nedtael" | "terning" | "gaa"
  // ---------------------------------------------------------------
  const EA_LEGE = [
    { id: "quiz", navn: "Quiz", ikon: "❓", tid: "15–30 min", folk: "3+",
      kort: "Værten stiller spørgsmål i chatten. Den første, der skriver det rigtige svar, får et point.",
      regler: ["Sig spørgsmålene ét ad gangen i chatten.", "Den første med det rigtige svar får 1 point.", "Skriv pointene ned. Flest point vinder."],
      hjaelper: "spoergsmaal", liste: [
        ["Hvad hedder hotellet?", "HELLO VERA"], ["Hvad hedder hotellets ene valuta med en stjerne?", "Glimt"],
        ["Hvor mange ben har en edderkop?", "8"], ["Hvad er hovedstaden i Danmark?", "København"],
        ["Hvilken farve får man, når man blander blå og gul?", "Grøn"], ["Hvor mange dage er der i et skudår?", "366"],
        ["Hvad hedder den største planet i vores solsystem?", "Jupiter"], ["Hvilket dyr siger 'muh'?", "En ko"],
        ["Hvor mange minutter er der i en time?", "60"], ["Hvad hedder Danmarks højeste punkt?", "Møllehøj"],
        ["Hvilket land kommer pizza fra?", "Italien"], ["Hvor mange farver er der i en regnbue?", "7"],
        ["Hvad hedder det største hav på Jorden?", "Stillehavet"], ["Hvilken frugt er gul og bøjet?", "Banan"],
        ["Hvor mange spillere er der på et fodboldhold på banen?", "11"], ["Hvad drikker en kat helst?", "Vand (mælk er ikke godt for katte!)"],
        ["Hvad hedder H.C. Andersens eventyr om en grim fugleunge?", "Den grimme ælling"], ["Hvad er 7 × 8?", "56"],
        ["Hvilken årstid kommer efter vinter?", "Forår"], ["Hvad hedder hotellets telefon-app med billetter til biffen?", "Vera-cinema"],
      ] },
    { id: "bingo", navn: "Bingo", ikon: "🎱", tid: "20 min", folk: "4+",
      kort: "Alle skriver 5 tal mellem 1 og 75 i chatten. Værten trækker tal. Den første, der har fået alle sine 5 tal, råber BANKO.",
      regler: ["Alle vælger 5 tal fra 1 til 75 og skriver dem i chatten.", "Værten trækker tal ét ad gangen.", "Når alle ens 5 tal er trukket, skriver man BANKO. Første vinder."],
      hjaelper: "bingo" },
    { id: "frys", navn: "Frys-dans", ikon: "🧊", tid: "10 min", folk: "3+",
      kort: "Alle danser og går rundt. Når værten siger FRYS, må ingen bevæge sig. Den, der bevæger sig, er ude.",
      regler: ["Sæt musik på (fx Vera-radio) og dans rundt i rummet.", "Når værten skriver FRYS, skal alle stå helt stille.", "Den, der går efter FRYS, er ude. Den sidste tilbage vinder."],
      hjaelper: "frys" },
    { id: "terning", navn: "Terningeleg", ikon: "🎲", tid: "15 min", folk: "3+",
      kort: "Man slår på skift med terningen. 1 Kick, 2 Stjæl, 3 Få, 4 Dø, 5 Få og stjæl, 6 Safe.",
      regler: ["Stil en terning fra Staff-møblerne i rummet (gratis for ansatte).", "Alle slår på skift ved at klikke på terningen.", "1 = Kick (ude), 2 = Stjæl, 3 = Få, 4 = Dø, 5 = Få og stjæl, 6 = Safe.", "Den sidste, der er med, vinder."],
      hjaelper: "terning" },
    { id: "gemme", navn: "Gemmeleg", ikon: "🙈", tid: "10 min", folk: "3+",
      kort: "Værten tæller til 20, mens alle gemmer sig i hotellet. Så skal værten finde dem.",
      regler: ["Vælg hvilke rum man må gemme sig i.", "Værten tæller ned. Imens gemmer alle sig.", "Den sidste, der bliver fundet, vinder."],
      hjaelper: "nedtael" },
    { id: "mode", navn: "Modeshow", ikon: "👗", tid: "20 min", folk: "3+",
      kort: "Værten siger et tema. Alle klæder sig ud i garderoben og går på den røde løber. Værten vælger den flotteste.",
      regler: ["Sig temaet i chatten.", "Alle har 3 minutter i garderoben.", "Gå én ad gangen på den røde løber.", "Værten (eller alle) stemmer om vinderen."],
      hjaelper: "tema", liste: ["Strand og sommer ☀️", "Gallafest 👑", "Halloween 🎃", "Jul 🎄", "Alt i rødt ❤️", "Sport ⚽", "Pyjamasfest 😴", "Rockstjerne 🎸", "Prinsesse og prins 👸", "Vinter ❄️", "Hippie 🌸", "Sort og hvid 🖤"] },
    { id: "byg", navn: "Byggekonkurrence", ikon: "🏗", tid: "30 min", folk: "2+",
      kort: "Værten siger et tema, og alle indretter deres eget rum. Bagefter besøger værten rummene og vælger vinderen.",
      regler: ["Sig temaet i chatten.", "Alle har 15 minutter til at indrette deres eget rum.", "Værten besøger rummene og vælger det flotteste."],
      hjaelper: "tema", liste: ["Café ☕", "Hyggeligt soveværelse 🛏", "Diskotek 🪩", "Have og blomster 🌷", "Biograf 🎬", "Juleværksted 🎄", "Strandbar 🏝", "Spøgelseshus 👻", "Bibliotek 📚", "Restaurant 🍝"] },
    { id: "ord", navn: "Hurtigst til at skrive", ikon: "⌨️", tid: "10 min", folk: "2+",
      kort: "Værten siger et ord. Den første, der skriver ordet rigtigt i chatten, får et point.",
      regler: ["Værten siger et ord i chatten.", "Den første, der skriver det helt rigtigt, får 1 point.", "Flest point efter 10 ord vinder."],
      hjaelper: "ord", liste: ["solsikke", "elevator", "popcornmaskine", "regnbue", "chokolade", "vinterjakke", "fødselsdag", "trampolin", "giraf", "rutsjebane", "jordbærkage", "lommelygte", "pyjamas", "hotelreception", "snebold", "guldmønt", "spejlæg", "krokodille", "ballerina", "fyrværkeri"] },
    { id: "gaet", navn: "Gæt et tal", ikon: "🔢", tid: "5 min", folk: "2+",
      kort: "Værten tænker på et tal fra 1 til 100. Alle gætter, og værten siger højere eller lavere.",
      regler: ["Alle gætter på skift i chatten.", "Værten svarer højere eller lavere.", "Den, der gætter tallet, vinder."],
      hjaelper: "tal" },
    { id: "stjerneregn", navn: "Stjerneregn-turnering", ikon: "🕹", tid: "15 min", folk: "2+",
      kort: "Alle spiller Stjerneregn på arkademaskinerne i Spillehjørnet. Højeste point vinder.",
      regler: ["Mød op i Spillehjørnet.", "Alle spiller én runde på en arkademaskine.", "Skriv dine point i chatten. Højeste point vinder."],
      hjaelper: "gaa", rum: "spillehjoernet" },
  ];
  window.EA_LEGE = EA_LEGE;

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
  function skiltAf(n) { return typeof ansatte !== "undefined" ? ansatte[n] : null; }
  function erTeam(n) { return erEjerNavn(n) || EA_TEAM_SKILTE.indexOf(skiltAf(n)) >= 0; }
  function maaBruge() { try { return !!mig() && erTeam(mig()); } catch (e) { return false; } }
  function online() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" && !!token(); }
  function token() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function kald(fn, data) { return serverKald(fn, Object.assign({ p_token: token() }, data || {})); }
  function mangler(e) { return /function|schema cache|does not exist|hv_event(plan|chat|app)/i.test((e && e.message) || ""); }
  function fejlTekst(e) { return mangler(e) ? EA_MANGLER : (e && e.message) || "Noget gik galt."; }
  function to(n) { return (n < 10 ? "0" : "") + n; }
  function kl(t) { const d = new Date(t); return to(d.getHours()) + ":" + to(d.getMinutes()); }
  const DAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MDR = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function dagTekst(t) {
    const d = new Date(t), i = new Date(), m = new Date(); m.setDate(i.getDate() + 1);
    const g = new Date(); g.setDate(i.getDate() - 1);
    if (d.toDateString() === i.toDateString()) return "I dag";
    if (d.toDateString() === m.toDateString()) return "I morgen";
    if (d.toDateString() === g.toDateString()) return "I går";
    return DAGE[d.getDay()] + " " + d.getDate() + ". " + MDR[d.getMonth()];
  }
  function lilleBesked(t) {
    try { if (appApi && appApi.lille) { appApi.lille(t); return; } } catch (e) {}
    try { if (typeof besked !== "undefined" && besked) besked.textContent = t; } catch (e) {}
  }
  function tilf(l) { return l[Math.floor(Math.random() * l.length)]; }
  function leg(id) { return EA_LEGE.find(function (l) { return l.id === id; }) || null; }
  function hent(n, std) { try { const v = JSON.parse(localStorage.getItem(n)); return v == null ? std : v; } catch (e) { return std; } }
  function gem(n, v) { try { localStorage.setItem(n, JSON.stringify(v)); } catch (e) {} }

  // Sig noget i chatten i det rum, man står i (som hvis man selv skrev det)
  function sigIChat(tekst) {
    try {
      if (typeof sig === "function" && typeof figur !== "undefined") { sig(figur, mig(), tekst); lilleBesked("💬 Sagt i chatten"); return true; }
    } catch (e) { console.warn(e); }
    lilleBesked("Chatten er ikke klar endnu.");
    return false;
  }

  // Rummene man kan holde event i (samme liste som "Hold et event")
  function rumListe() {
    const ud = [{ id: "hal", navn: "Velkomsthallen" }];
    try {
      if (typeof NAV_RUM !== "undefined") NAV_RUM.forEach(function (r) {
        if (!r.rum || r.rum === "hal" || r.id === "mit" || r.egetRum || r.hemmelig || !r.vaerelse) return;
        if (ud.some(function (x) { return x.id === r.vaerelse; })) return;
        ud.push({ id: r.vaerelse, navn: String(r.navn).replace(/\s*[🔒🔑🔓]\s*$/u, "") });
      });
      if (typeof INDBYGGEDE_RUM !== "undefined") Object.keys(INDBYGGEDE_RUM).forEach(function (id) {
        if (id === "hemmelig" || ud.some(function (x) { return x.id === id; })) return;
        const info = INDBYGGEDE_RUM[id];
        ud.push({ id: id, navn: (info && info.navn) || id });
      });
    } catch (e) {}
    return ud;
  }
  function rumNavn(id) {
    if (!id) return "";
    const r = rumListe().find(function (x) { return x.id === id; });
    if (r) return r.navn;
    if (id.indexOf(":") > 0) return id.split(":")[0] + "s rum";
    return id;
  }
  function herNu() { try { return rumValg === "hal" ? "hal" : aktivtVaerelse; } catch (e) { return null; } }
  function gaaTil(id) {
    if (!id || id === herNu()) { lilleBesked("Du er her allerede 🙂"); return; }
    try {
      if (id === "hal") skiftRum("hal"); else gaaTilVaerelse(id);
      if (typeof window.lukTelefon === "function") window.lukTelefon();
    } catch (e) { lilleBesked("Kunne ikke gå derhen."); }
  }
  function spillerNavne() {
    try {
      return alleSpillere().map(function (s) { return s.navn; })
        .filter(function (n) { return !(typeof erComputerGaest === "function" && erComputerGaest(n)); });
    } catch (e) { return []; }
  }

  // ---------------------------------------------------------------
  //  🎪 Eventfolk tilbage i Ansættelse (Pavla valgte det 15/11)
  // ---------------------------------------------------------------
  vent(function () { return typeof SKILTE !== "undefined" && typeof JOB_KAN !== "undefined"; }, function () {
    if (!SKILTE.some(function (s) { return s.id === "eventfolk"; })) {
      const efter = SKILTE.findIndex(function (s) { return s.id === "eventvaert"; });
      SKILTE.splice(efter + 1, 0, { id: "eventfolk", navn: "Eventfolk", tekst: "Hjælper eventværterne med events, lege og vindere.",
        fil: "billeder/skilte/eventfolk.png", beskrivelse: typeof JOB_BESKRIVELSE !== "undefined" ? JOB_BESKRIVELSE.eventfolk : undefined });
    }
    const appKan = "📱 Får Event-appen på telefonen: planlæg events, start lege, skriv vindere og chat med eventholdet";
    ["eventfolk", "eventvaert"].forEach(function (id) {
      JOB_KAN[id] = JOB_KAN[id] || [];
      if (JOB_KAN[id].indexOf(appKan) < 0) JOB_KAN[id].splice(1, 0, appKan);
    });
    if (typeof EJER_KAN !== "undefined" && EJER_KAN.indexOf(appKan) < 0) EJER_KAN.push(appKan);
  });

  // ---------------------------------------------------------------
  //  Data fra serveren
  // ---------------------------------------------------------------
  let plan = null, planFejl = "";
  let igang = [];                 // event-skilte der er sendt ud lige nu (hv_reklamer_hent)
  let resultater = null, resFejl = "";
  let chat = [], chatFejl = "", chatHentet = false;
  const LAEST_NOEGLE = function () { return "mit-hotel-eventchat-laest-" + mig(); };

  function hentPlan() {
    if (!online() || !maaBruge()) return Promise.resolve();
    const a = kald("hv_eventplan_hent").then(function (s) { plan = s || []; planFejl = ""; })
      .catch(function (e) { planFejl = fejlTekst(e); plan = plan || []; });
    const b = serverKald("hv_reklamer_hent", {}).then(function (s) { igang = s || []; }).catch(function () { igang = []; });
    return Promise.all([a, b]);
  }
  function hentResultater() {
    if (!online() || !maaBruge()) return Promise.resolve();
    return kald("hv_eventapp_resultater").then(function (s) { resultater = s || []; resFejl = ""; })
      .catch(function (e) { resFejl = fejlTekst(e); resultater = resultater || []; });
  }
  function hentChat() {
    if (!online() || !maaBruge()) return Promise.resolve(false);
    const sidst = chat.length ? chat[chat.length - 1].id : null;
    return kald("hv_eventchat_hent", { p_efter: sidst }).then(function (nye) {
      chatFejl = "";
      const foerst = !chatHentet;
      chatHentet = true;
      if (!nye || !nye.length) return false;
      chat = chat.concat(nye).slice(-200);
      if (!foerst) nye.forEach(function (b) {
        if (b.navn !== mig() && !(appAaben() && fane === "team")) {
          if (typeof window.tlfNotis === "function") window.tlfNotis("event", "🎪 " + b.navn + " (eventholdet)", b.tekst);
        }
      });
      return true;
    }).catch(function (e) { chatFejl = fejlTekst(e); return false; });
  }
  function ulaeste() {
    const laest = hent(LAEST_NOEGLE(), 0);
    return chat.filter(function (b) { return b.id > laest && b.navn !== mig(); }).length;
  }
  function markerLaest() { if (chat.length) gem(LAEST_NOEGLE(), chat[chat.length - 1].id); }

  // ---------------------------------------------------------------
  //  📱 Appen
  // ---------------------------------------------------------------
  const IKON = "<path d='M12 2.5 14.2 7l5 .7-3.6 3.5.9 5L12 13.8 7.5 16.2l.9-5L4.8 7.7l5-.7z' fill='#ffd98a'/>" +
    "<path d='M4 17.5c2.5-1.3 5-1.3 8 0s5.5 1.3 8 0' fill='none' stroke='#fff' stroke-width='1.6' stroke-linecap='round'/>" +
    "<circle cx='5' cy='21' r='1.1' fill='#ffd98a'/><circle cx='12' cy='21' r='1.1' fill='#fff'/><circle cx='19' cy='21' r='1.1' fill='#ffd98a'/>";
  let appApi = null;
  let fane = "events";     // events | lege | resultater | team
  let side = "liste";      // liste | form | leg
  let formData = null;     // det event man er ved at oprette/rette
  let valgtLeg = null;
  let hjaelp = {};         // hjælpernes tilstand pr. leg
  let resSoeg = "";

  const APP = {
    navn: "Event-app", ikSvg: IKON, bg: "linear-gradient(#c23a52, #4a0d1b)", fast: true,
    kun: maaBruge,
    tal: function () { return ulaeste(); },
    tegn: function (el, api) { appApi = api; tegnApp(); hentAlt(); },
    luk: function () { appApi = null; side = "liste"; },
  };
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () { window.tlfTilfoejApp("event", APP); });

  function appEl() { return appApi && appApi.el(); }
  function appAaben() { return !!appApi && typeof window.tlfAppAaben === "function" && window.tlfAppAaben("event"); }
  function hentAlt() {
    Promise.all([hentPlan(), hentChat(), fane === "resultater" ? hentResultater() : null]).then(function () { opdater(); });
  }
  // tegn igen, men ikke mens man skriver i en formular
  function opdater() {
    if (!appAaben()) return;
    if (side !== "liste") return;
    if (fane === "team") { tegnChatListe(); tegnTeamListe(); return; }
    const aktiv = document.activeElement;
    if (aktiv && appEl() && appEl().contains(aktiv) && /INPUT|TEXTAREA|SELECT/.test(aktiv.tagName)) return;
    tegnApp();
  }

  function topHtml(titel, tilbage) {
    const pil = appApi && appApi.ik ? appApi.ik("tilbage", 20) : "‹";
    return "<div class='tlf-top ea-top'>" + (tilbage
      ? "<button class='tlf-tb' data-ea-tilbage='1' title='Tilbage'>" + pil + "</button>"
      : "<button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + pil + "</button>") +
      "<h3>" + titel + "</h3><span class='tlf-tb'></span></div>";
  }

  function tegnApp() {
    const el = appEl();
    if (!el) return;
    if (!maaBruge()) { el.innerHTML = topHtml("Event-app") + "<div class='tlf-indhold ea-app'><p class='ea-tom'>Event-appen er kun for Eventfolk, Eventværter og ejeren.</p></div>"; return; }
    if (side === "form") tegnForm(el);
    else if (side === "leg") tegnLeg(el);
    else tegnListe(el);
    if (side !== "form") el.querySelectorAll("[data-ea-tilbage]").forEach(function (k) {
      k.addEventListener("click", function (e) { e.stopPropagation(); side = "liste"; formData = null; tegnApp(); });
    });
  }

  function tegnListe(el) {
    const ul = ulaeste();
    const faner = [["events", "📅 Events"], ["lege", "🎲 Lege"], ["resultater", "🏆 Vindere"], ["team", "👥 Team"]];
    el.innerHTML = topHtml("Event-app") +
      "<div class='tlf-indhold ea-app'>" +
      "<div class='ea-logo'><b>EVENT</b><span>✦ HELLO VERA ✦</span><small>" + esc(skiltTekst(mig())) + " · " + esc(mig()) + "</small></div>" +
      "<div class='ea-faner'>" + faner.map(function (f) {
        return "<button data-ea-fane='" + f[0] + "'" + (f[0] === fane ? " class='valgt'" : "") + ">" + f[1] +
          (f[0] === "team" && ul ? " <i>" + ul + "</i>" : "") + "</button>";
      }).join("") + "</div><div class='ea-krop'></div></div>";
    el.querySelectorAll("[data-ea-fane]").forEach(function (b) {
      b.addEventListener("click", function () {
        fane = b.dataset.eaFane;
        tegnApp();
        if (fane === "resultater") hentResultater().then(opdater);
        if (fane === "events") hentPlan().then(opdater);
      });
    });
    const krop = el.querySelector(".ea-krop");
    if (!online()) { krop.innerHTML = "<p class='ea-tom'>Event-appen virker kun, når hotellet er på nettet (logget ind på serveren).</p>"; return; }
    if (fane === "events") tegnEvents(krop);
    else if (fane === "lege") tegnLege(krop);
    else if (fane === "resultater") tegnResultater(krop);
    else tegnTeam(krop);
  }
  function skiltTekst(n) {
    if (erEjerNavn(n)) return "👑 Ejer";
    const s = skiltAf(n);
    return s === "eventvaert" ? "🎉 Eventvært" : s === "eventfolk" ? "🎪 Eventfolk" : "Ansat";
  }

  // To klik: første gang står der "Er du sikker?"
  function toKlik(knap, gør) {
    knap.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!knap.classList.contains("ea-sikker")) {
        const f = knap.innerHTML;
        knap.classList.add("ea-sikker");
        knap.textContent = "Er du sikker?";
        setTimeout(function () { if (knap.isConnected) { knap.classList.remove("ea-sikker"); knap.innerHTML = f; } }, 3000);
        return;
      }
      gør();
    });
  }

  // ---------------------------------------------------------------
  //  📅 Events
  // ---------------------------------------------------------------
  function slutTid(p) { return new Date(p.start).getTime() + (p.minutter || 30) * 60000; }
  function tegnEvents(krop) {
    let html = "<div class='ea-knapper'><button class='ea-stor' data-ea-ny='plan'>📅 Planlæg et event</button>" +
      "<button class='ea-stor ea-guld' data-ea-ny='nu'>⚡ Start et event nu</button></div>";
    if (planFejl) html += "<p class='ea-advarsel'>" + esc(planFejl) + "</p>";

    // i gang lige nu (event-skiltet er sendt ud)
    if (igang.length) {
      html += "<h4 class='ea-dag'>🔴 I gang lige nu</h4>" + igang.map(function (r) {
        return "<div class='ea-kort ea-live'><span class='ea-emoji'>" + esc((r.stil && r.stil.emoji) || "🎉") + "</span>" +
          "<div class='ea-kort-tekst'><b>" + esc(r.event) + "</b><small>" + esc(r.hvem) + " · " + esc(r.rum_navn || rumNavn(r.rum) || "Velkomsthallen") +
          " · til kl. " + kl(r.slut) + "</small></div>" +
          "<div class='ea-smaa'><button data-ea-gaa='" + esc(r.rum || "hal") + "' title='Gå derhen'>🚶</button>" +
          "<button data-ea-stop='" + r.id + "' title='Stop eventet'>⏹</button></div></div>";
      }).join("");
    }

    const nu = Date.now();
    const kommende = (plan || []).filter(function (p) { return slutTid(p) > nu; });
    const tidligere = (plan || []).filter(function (p) { return slutTid(p) <= nu; }).reverse();
    if (plan === null) html += "<p class='ea-tom'>Henter events …</p>";
    else if (!kommende.length) html += "<p class='ea-tom'>📅 Der er ingen planlagte events.<br><small>Tryk “Planlæg et event” for at lave et.</small></p>";
    else {
      let sidsteDag = "";
      html += kommende.map(function (p) {
        const dag = dagTekst(p.start);
        const o = dag !== sidsteDag ? "<h4 class='ea-dag'>" + dag + "</h4>" : "";
        sidsteDag = dag;
        return o + planKort(p);
      }).join("");
    }
    if (tidligere.length) {
      html += "<details class='ea-tidligere'><summary>Tidligere events (" + tidligere.length + ")</summary>" + tidligere.map(function (p) { return planKort(p, true); }).join("") + "</details>";
    }
    krop.innerHTML = html;

    krop.querySelectorAll("[data-ea-ny]").forEach(function (k) {
      k.addEventListener("click", function () { aabnForm(null, k.dataset.eaNy === "nu"); });
    });
    krop.querySelectorAll("[data-ea-gaa]").forEach(function (k) {
      k.addEventListener("click", function (e) { e.stopPropagation(); gaaTil(k.dataset.eaGaa); });
    });
    krop.querySelectorAll("[data-ea-stop]").forEach(function (k) {
      toKlik(k, function () {
        serverKald("hv_reklame_stop", { p_token: token(), p_id: +k.dataset.eaStop }).then(function () {
          lilleBesked("⏹ Eventet er stoppet");
          hentPlan().then(opdater);
        }).catch(function (e) { lilleBesked(fejlTekst(e)); });
      });
    });
    krop.querySelectorAll("[data-ea-start]").forEach(function (k) {
      k.addEventListener("click", function (e) {
        e.stopPropagation();
        const p = (plan || []).find(function (x) { return x.id === +k.dataset.eaStart; });
        if (p) startEvent(p, k);
      });
    });
    krop.querySelectorAll("[data-ea-ret]").forEach(function (k) {
      k.addEventListener("click", function (e) {
        e.stopPropagation();
        const p = (plan || []).find(function (x) { return x.id === +k.dataset.eaRet; });
        if (p) aabnForm(p, false);
      });
    });
    krop.querySelectorAll("[data-ea-aflys]").forEach(function (k) {
      toKlik(k, function () {
        const id = +k.dataset.eaAflys, p = (plan || []).find(function (x) { return x.id === id; });
        const genaabn = p && p.aflyst;
        kald("hv_eventplan_aflys", { p_id: id, p_aflys: !genaabn, p_slet: false }).then(function () {
          lilleBesked(genaabn ? "↩ Eventet er tilbage" : "❌ Eventet er aflyst");
          if (!genaabn && p) sendTeam("❌ " + p.titel + " (" + dagTekst(p.start).toLowerCase() + " kl. " + kl(p.start) + ") er aflyst.");
          hentPlan().then(opdater);
        }).catch(function (e) { lilleBesked(fejlTekst(e)); });
      });
    });
    krop.querySelectorAll("[data-ea-slet]").forEach(function (k) {
      toKlik(k, function () {
        kald("hv_eventplan_aflys", { p_id: +k.dataset.eaSlet, p_aflys: true, p_slet: true }).then(function () {
          lilleBesked("🗑 Slettet");
          hentPlan().then(opdater);
        }).catch(function (e) { lilleBesked(fejlTekst(e)); });
      });
    });
  }
  function planKort(p, gammel) {
    const l = leg(p.leg);
    const nu = Date.now(), start = new Date(p.start).getTime();
    const status = p.aflyst ? "<em class='ea-aflyst'>❌ Aflyst</em>"
      : p.startet ? "<em class='ea-startet'>▶ Startet kl. " + kl(p.startet) + "</em>"
      : start - nu < 15 * 60000 && start - nu > -60 * 60000 ? "<em class='ea-snart'>⏰ Snart!</em>" : "";
    return "<div class='ea-kort" + (p.aflyst ? " ea-graa" : "") + "'><span class='ea-emoji'>" + esc(p.emoji || (l && l.ikon) || "🎉") + "</span>" +
      "<div class='ea-kort-tekst'><b>" + esc(p.titel) + "</b>" +
      "<small>kl. " + kl(p.start) + "–" + kl(slutTid(p)) + " · " + esc(p.rum_navn || rumNavn(p.rum) || "Velkomsthallen") + "</small>" +
      "<small>" + (p.ansvarlig ? "👤 " + esc(p.ansvarlig) : "👤 Ingen valgt") + (l ? " · " + l.ikon + " " + esc(l.navn) : "") + "</small>" +
      (p.tekst ? "<small class='ea-tekst'>" + esc(p.tekst) + "</small>" : "") + status + "</div>" +
      "<div class='ea-smaa'>" + (gammel ? "<button data-ea-slet='" + p.id + "' title='Slet'>🗑</button>"
        : (!p.aflyst ? "<button data-ea-start='" + p.id + "' title='Start nu: event-skiltet kommer frem hos alle' class='ea-start'>▶</button>" : "") +
          "<button data-ea-ret='" + p.id + "' title='Ret'>✏️</button>" +
          "<button data-ea-aflys='" + p.id + "' title='" + (p.aflyst ? "Genåbn" : "Aflys") + "'>" + (p.aflyst ? "↩" : "❌") + "</button>") +
      "</div></div>";
  }

  // ▶ Start: send det store event-skilt ud til alle (samme som "Hold et event" i Ejerpanelet)
  function startEvent(p, knap) {
    if (knap) knap.disabled = true;
    const minutter = Math.max(5, Math.min(240, Math.round((slutTid(p) - Math.max(Date.now(), new Date(p.start).getTime())) / 60000)) || p.minutter || 30);
    const stil = Object.assign({ farve: "guld", effekt: "konfetti" }, hent("mit-hotel-reklame-stil", {}), { emoji: p.emoji || "🎉" });
    return serverKald("hv_reklame_send", { p_token: token(), p_event: p.titel, p_tekst: p.tekst || "", p_rum: p.rum || "hal",
      p_rum_navn: p.rum_navn || rumNavn(p.rum) || "Velkomsthallen", p_stil: { farve: stil.farve, emoji: stil.emoji, effekt: stil.effekt }, p_minutter: minutter })
      .then(function (r) {
        if (p.id) return kald("hv_eventplan_startet", { p_id: p.id, p_reklame_id: r && r.id }).catch(function () {});
      }).then(function () {
        try { if (typeof adminSkriv === "function") adminSkriv("Startede eventet " + p.titel + " fra Event-appen"); } catch (e) {}
        sendTeam("▶ " + mig() + " har startet " + p.titel + " i " + (p.rum_navn || rumNavn(p.rum) || "Velkomsthallen") + ".");
        lilleBesked("🎉 Event-skiltet er sendt ud til alle");
        return hentPlan();
      }).then(opdater).catch(function (e) { if (knap) knap.disabled = false; lilleBesked(/hv_reklame/.test(e.message) ? "Kør database-35-event-reklame.sql først." : fejlTekst(e)); });
  }

  // ----- Formularen: planlæg / ret / start nu -----
  const EA_EMOJIER = ["🎉", "🎪", "🎤", "🎶", "💃", "🏆", "🎮", "🧩", "❓", "🎨", "👗", "📸", "🎬", "🎂", "🎁", "💖", "🌟", "🔥", "👑", "👻", "🎃", "🎄", "❄️", "🎲", "🎱", "🧊", "🙈", "🏗", "⌨️", "🕹"];
  const EA_TIDER = [[5, "5 min"], [10, "10 min"], [15, "15 min"], [30, "30 min"], [45, "45 min"], [60, "1 time"], [90, "1½ time"], [120, "2 timer"], [180, "3 timer"], [240, "4 timer"]];
  function datoInput(t) { const d = new Date(t); return d.getFullYear() + "-" + to(d.getMonth() + 1) + "-" + to(d.getDate()); }
  function tidInput(t) { return kl(t); }
  function aabnForm(p, nu, legId) {
    const l = leg(legId || (p && p.leg));
    const om1 = new Date(Date.now() + 60 * 60000); om1.setMinutes(0, 0, 0);
    formData = p ? Object.assign({}, p) : {
      id: null, titel: l ? l.navn : "", tekst: l ? l.kort.slice(0, 160) : "", emoji: l ? l.ikon : "🎉",
      rum: l && l.rum ? l.rum : (herNu() || "hal"), start: nu ? new Date().toISOString() : om1.toISOString(),
      minutter: 30, leg: l ? l.id : "", ansvarlig: mig() };
    formData.nu = !!nu;
    formData.fejl = "";
    side = "form";
    tegnApp();
  }
  function teamNavne() {
    const n = {};
    (typeof EJERE !== "undefined" ? EJERE : []).forEach(function (x) { n[x] = 1; });
    if (typeof ansatte !== "undefined") Object.keys(ansatte).forEach(function (x) { if (EA_TEAM_SKILTE.indexOf(ansatte[x]) >= 0) n[x] = 1; });
    if (mig() && maaBruge()) n[mig()] = 1;
    return Object.keys(n);
  }
  function tegnForm(el) {
    const f = formData;
    const titel = f.nu ? "⚡ Start nu" : f.id ? "✏️ Ret event" : "📅 Planlæg event";
    const rum = rumListe();
    if (f.rum && !rum.some(function (r) { return r.id === f.rum; })) rum.push({ id: f.rum, navn: f.rum_navn || rumNavn(f.rum) });
    el.innerHTML = topHtml(titel, true) + "<div class='tlf-indhold ea-app ea-form'>" +
      "<label>Hvad hedder eventet?<input id='ea-f-titel' maxlength='60' value='" + esc(f.titel) + "' placeholder='Fx Quiz-aften'></label>" +
      "<label>🎲 Leg (valgfri)<select id='ea-f-leg'><option value=''>Ingen bestemt leg</option>" + EA_LEGE.map(function (l) {
        return "<option value='" + l.id + "'" + (l.id === f.leg ? " selected" : "") + ">" + l.ikon + " " + esc(l.navn) + "</option>";
      }).join("") + "</select></label>" +
      "<label>📍 Hvor?<select id='ea-f-rum'>" + rum.map(function (r) {
        return "<option value='" + esc(r.id) + "'" + (r.id === f.rum ? " selected" : "") + ">" + esc(r.navn) + "</option>";
      }).join("") + "</select></label>" +
      (f.nu ? "" : "<div class='ea-to'><label>📆 Dato<input id='ea-f-dato' type='date' value='" + datoInput(f.start) + "'></label>" +
        "<label>🕐 Klokken<input id='ea-f-kl' type='time' value='" + tidInput(f.start) + "'></label></div>") +
      "<div class='ea-to'><label>⏳ Hvor længe?<select id='ea-f-min'>" + EA_TIDER.map(function (t) {
        return "<option value='" + t[0] + "'" + (t[0] === +f.minutter ? " selected" : "") + ">" + t[1] + "</option>";
      }).join("") + "</select></label>" +
      "<label>👤 Står for det<select id='ea-f-ansv'><option value=''>Ingen valgt</option>" + teamNavne().map(function (n) {
        return "<option" + (n === f.ansvarlig ? " selected" : "") + ">" + esc(n) + "</option>";
      }).join("") + "</select></label></div>" +
      "<label>📝 Tekst på skiltet (valgfri)<textarea id='ea-f-tekst' rows='2' maxlength='160' placeholder='Fx Kom og vind en rare!'>" + esc(f.tekst || "") + "</textarea></label>" +
      "<div class='ea-lbl'>😀 Emoji</div><div class='ea-emojier'>" + EA_EMOJIER.map(function (e) {
        return "<button type='button' data-ea-emoji='" + e + "'" + (e === f.emoji ? " class='valgt'" : "") + ">" + e + "</button>";
      }).join("") + "</div>" +
      (f.fejl ? "<p class='ea-advarsel'>" + esc(f.fejl) + "</p>" : "") +
      "<button class='ea-stor ea-guld' id='ea-f-gem'>" + (f.nu ? "🎉 Start eventet nu" : f.id ? "💾 Gem ændringerne" : "📅 Sæt i kalenderen") + "</button>" +
      (f.nu ? "<p class='ea-info'>Event-skiltet med ➡ Følg-knap kommer frem midt på skærmen hos alle.</p>"
        : "<p class='ea-info'>Eventholdet får besked 15 minutter før. Tryk ▶ når det skal starte.</p>") + "</div>";

    function laes() {
      f.titel = el.querySelector("#ea-f-titel").value;
      f.leg = el.querySelector("#ea-f-leg").value;
      f.rum = el.querySelector("#ea-f-rum").value;
      f.rum_navn = rumNavn(f.rum);
      f.minutter = +el.querySelector("#ea-f-min").value;
      f.ansvarlig = el.querySelector("#ea-f-ansv").value;
      f.tekst = el.querySelector("#ea-f-tekst").value;
      if (!f.nu) {
        const d = el.querySelector("#ea-f-dato").value, t = el.querySelector("#ea-f-kl").value;
        if (d && t) f.start = new Date(d + "T" + t).toISOString();
      }
    }
    el.querySelector("#ea-f-leg").addEventListener("change", function () {
      const gl = leg(f.leg);
      laes();
      const l = leg(f.leg);
      if (l) {
        if (!f.titel.trim() || (gl && f.titel === gl.navn)) f.titel = l.navn;
        if (gl ? f.emoji === gl.ikon : f.emoji === "🎉") f.emoji = l.ikon;
        if (l.rum) f.rum = l.rum;
      }
      tegnForm(el);
    });
    el.querySelectorAll("[data-ea-emoji]").forEach(function (k) {
      k.addEventListener("click", function () {
        f.emoji = k.dataset.eaEmoji;
        el.querySelectorAll("[data-ea-emoji]").forEach(function (b) { b.classList.toggle("valgt", b === k); });
      });
    });
    el.querySelectorAll("[data-ea-tilbage]").forEach(function (k) {
      k.addEventListener("click", function (e) { e.stopPropagation(); side = valgtLeg && f.fraLeg ? "leg" : "liste"; formData = null; tegnApp(); });
    });
    el.querySelector("#ea-f-gem").addEventListener("click", function () {
      const knap = this;
      laes();
      if (!f.titel.trim()) { f.fejl = "Skriv hvad eventet hedder."; tegnForm(el); return; }
      knap.disabled = true;
      const start = f.nu ? new Date().toISOString() : f.start;
      kald("hv_eventplan_gem", { p_id: f.id, p_titel: f.titel, p_tekst: f.tekst, p_emoji: f.emoji, p_rum: f.rum, p_rum_navn: f.rum_navn,
        p_start: start, p_minutter: f.minutter, p_leg: f.leg, p_ansvarlig: f.ansvarlig })
        .then(function (r) {
          const p = Object.assign({}, f, { id: r.id, start: start });
          side = "liste"; fane = "events"; formData = null;
          if (f.nu) return startEvent(p);
          if (!f.id) sendTeam("📅 " + mig() + " har planlagt " + f.titel + " " + dagTekst(start).toLowerCase() + " kl. " + kl(start) +
            " i " + f.rum_navn + (f.ansvarlig ? " (👤 " + f.ansvarlig + ")" : "") + ".");
          lilleBesked(f.id ? "💾 Gemt" : "📅 Eventet er sat i kalenderen");
          return hentPlan().then(function () { tegnApp(); });
        }).catch(function (e) { knap.disabled = false; f.fejl = fejlTekst(e); tegnForm(el); });
    });
  }

  // ---------------------------------------------------------------
  //  🎲 Lege
  // ---------------------------------------------------------------
  function tegnLege(krop) {
    krop.innerHTML = "<p class='ea-info'>Hotellets lege. Tryk på en leg for at se reglerne og starte den.</p>" +
      EA_LEGE.map(function (l) {
        return "<button class='ea-kort ea-leg-kort' data-ea-leg='" + l.id + "'><span class='ea-emoji'>" + l.ikon + "</span>" +
          "<div class='ea-kort-tekst'><b>" + esc(l.navn) + "</b><small>⏳ " + esc(l.tid) + " · 👥 " + esc(l.folk) + "</small>" +
          "<small class='ea-tekst'>" + esc(l.kort) + "</small></div><span class='ea-pil'>›</span></button>";
      }).join("");
    krop.querySelectorAll("[data-ea-leg]").forEach(function (k) {
      k.addEventListener("click", function () { valgtLeg = k.dataset.eaLeg; side = "leg"; tegnApp(); });
    });
  }
  function tegnLeg(el) {
    const l = leg(valgtLeg);
    if (!l) { side = "liste"; tegnApp(); return; }
    el.innerHTML = topHtml(l.ikon + " " + esc(l.navn), true) + "<div class='tlf-indhold ea-app'>" +
      "<div class='ea-leg-top'><span>" + l.ikon + "</span><b>" + esc(l.navn) + "</b><small>⏳ " + esc(l.tid) + " · 👥 " + esc(l.folk) + "</small></div>" +
      "<p class='ea-leg-kort-tekst'>" + esc(l.kort) + "</p>" +
      "<h4 class='ea-dag'>📜 Regler</h4><ol class='ea-regler'>" + l.regler.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ol>" +
      "<div class='ea-knapper'><button class='ea-stor ea-guld' data-ea-legstart='nu'>⚡ Start legen nu</button>" +
      "<button class='ea-stor' data-ea-legstart='plan'>📅 Planlæg</button></div>" +
      "<button class='ea-lille' data-ea-regler>💬 Sig legen i chatten</button>" +
      "<h4 class='ea-dag'>🧰 Hjælper til værten</h4><div class='ea-hjaelper'></div></div>";
    el.querySelectorAll("[data-ea-legstart]").forEach(function (k) {
      k.addEventListener("click", function () { aabnForm(null, k.dataset.eaLegstart === "nu", l.id); formData.fraLeg = true; });
    });
    el.querySelector("[data-ea-regler]").addEventListener("click", function () { sigIChat(l.ikon + " " + l.navn + ": " + l.kort); });
    tegnHjaelper(el.querySelector(".ea-hjaelper"), l);
  }

  // De små hjælpere i hver leg (alt, der siges, kommer i chatten i det rum, man står i)
  function tegnHjaelper(boks, l) {
    const h = hjaelp[l.id] = hjaelp[l.id] || {};
    let html = "";
    if (l.hjaelper === "spoergsmaal") {
      if (h.i == null) { h.raekke = l.liste.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; }); h.i = 0; }
      const q = l.liste[h.raekke[h.i % h.raekke.length]];
      html = "<div class='ea-hj-boks'><small>Spørgsmål " + (h.i + 1) + " af " + l.liste.length + "</small><b>" + esc(q[0]) + "</b><em>Svar: " + esc(q[1]) + "</em></div>" +
        "<div class='ea-hj-knapper'><button data-hj='sig'>📢 Sig spørgsmålet</button><button data-hj='svar'>✅ Sig svaret</button><button data-hj='naeste'>⏭ Næste</button></div>";
    } else if (l.hjaelper === "tema" || l.hjaelper === "ord") {
      if (!h.nu) h.nu = tilf(l.liste);
      html = "<div class='ea-hj-boks'><small>" + (l.hjaelper === "ord" ? "Ordet" : "Temaet") + "</small><b>" + esc(h.nu) + "</b></div>" +
        "<div class='ea-hj-knapper'><button data-hj='sig'>📢 Sig det i chatten</button><button data-hj='ny'>🎲 Et andet</button></div>";
    } else if (l.hjaelper === "bingo") {
      h.trukket = h.trukket || [];
      html = "<div class='ea-hj-boks'><small>Sidste tal</small><b class='ea-hj-stor'>" + (h.trukket.length ? h.trukket[h.trukket.length - 1] : "–") + "</b>" +
        "<small>" + h.trukket.length + " af 75 trukket</small></div>" +
        "<div class='ea-bingo'>" + Array.from({ length: 75 }, function (_, i) { return "<i" + (h.trukket.indexOf(i + 1) >= 0 ? " class='ja'" : "") + ">" + (i + 1) + "</i>"; }).join("") + "</div>" +
        "<div class='ea-hj-knapper'><button data-hj='traek'>🎱 Træk et tal</button><button data-hj='forfra'>🔄 Ny runde</button></div>";
    } else if (l.hjaelper === "frys") {
      html = "<div class='ea-hj-boks'><b>" + (h.venter ? "⏳ FRYS kommer om lidt …" : h.sidst || "Klar?") + "</b></div>" +
        "<div class='ea-hj-knapper'><button data-hj='dans'>🎶 Dans!</button><button data-hj='frys'>🧊 FRYS!</button><button data-hj='tilf'>🎲 FRYS om lidt</button></div>";
    } else if (l.hjaelper === "tal") {
      if (!h.tal) { h.tal = 1 + Math.floor(Math.random() * 100); h.gaet = 0; }
      html = "<div class='ea-hj-boks'><small>Dit hemmelige tal (kun du ser det)</small><b class='ea-hj-stor'>" + h.tal + "</b><small>" + h.gaet + " svar givet</small></div>" +
        "<div class='ea-hj-knapper'><button data-hj='op'>⬆ Højere</button><button data-hj='ned'>⬇ Lavere</button><button data-hj='rigtigt'>🎉 Rigtigt!</button><button data-hj='nyt'>🔄 Nyt tal</button></div>";
    } else if (l.hjaelper === "nedtael") {
      html = "<div class='ea-hj-boks'><b class='ea-hj-stor'>" + (h.tael ? h.tael : "🙈") + "</b></div>" +
        "<div class='ea-hj-knapper'><button data-hj='start'" + (h.tael ? " disabled" : "") + ">⏱ Tæl ned fra 20</button></div>";
    } else if (l.hjaelper === "terning") {
      html = "<div class='ea-hj-boks'><small>Terningen findes i Shop → 🎪 Staff (gratis for ansatte)</small><b>1 👢 · 2 🦹 · 3 🎁 · 4 💀 · 5 🎁🦹 · 6 🛡️</b></div>" +
        "<div class='ea-hj-knapper'><button data-hj='forklar'>📢 Forklar terningen</button></div>";
    } else if (l.hjaelper === "gaa") {
      html = "<div class='ea-hj-knapper'><button data-hj='gaa'>🚶 Gå til " + esc(rumNavn(l.rum)) + "</button></div>";
    }
    boks.innerHTML = html;
    boks.querySelectorAll("[data-hj]").forEach(function (k) {
      k.addEventListener("click", function () { hjaelperKlik(l, h, k.dataset.hj, boks); });
    });
  }
  function hjaelperKlik(l, h, hvad, boks) {
    const igen = function () { if (boks.isConnected) tegnHjaelper(boks, l); };
    if (l.hjaelper === "spoergsmaal") {
      const q = l.liste[h.raekke[h.i % h.raekke.length]];
      if (hvad === "sig") sigIChat("❓ Spørgsmål " + (h.i + 1) + ": " + q[0]);
      if (hvad === "svar") sigIChat("✅ Svaret er: " + q[1]);
      if (hvad === "naeste") h.i++;
    } else if (l.hjaelper === "tema" || l.hjaelper === "ord") {
      if (hvad === "sig") sigIChat(l.hjaelper === "ord" ? "⌨️ Første der skriver: " + h.nu.toUpperCase() : l.ikon + " Temaet er: " + h.nu);
      if (hvad === "ny") { let n = h.nu; while (n === h.nu && l.liste.length > 1) n = tilf(l.liste); h.nu = n; }
    } else if (l.hjaelper === "bingo") {
      if (hvad === "traek") {
        const rest = Array.from({ length: 75 }, function (_, i) { return i + 1; }).filter(function (n) { return h.trukket.indexOf(n) < 0; });
        if (!rest.length) { lilleBesked("Alle tal er trukket"); return; }
        const n = tilf(rest);
        h.trukket.push(n);
        sigIChat("🎱 Tallet er " + n + "!");
      }
      if (hvad === "forfra") { h.trukket = []; sigIChat("🎱 Ny runde bingo! Skriv 5 tal fra 1 til 75."); }
    } else if (l.hjaelper === "frys") {
      if (hvad === "dans") { clearTimeout(h.t); h.venter = false; h.sidst = "🎶 Alle danser"; sigIChat("🎶 DANS! Alle bevæger sig 💃🕺"); }
      if (hvad === "frys") { clearTimeout(h.t); h.venter = false; h.sidst = "🧊 Frosset"; sigIChat("🧊 FRYS! Ingen må bevæge sig!"); }
      if (hvad === "tilf") {
        clearTimeout(h.t);
        h.venter = true;
        h.t = setTimeout(function () { h.venter = false; h.sidst = "🧊 Frosset"; sigIChat("🧊 FRYS! Ingen må bevæge sig!"); igen(); }, 5000 + Math.random() * 12000);
      }
    } else if (l.hjaelper === "tal") {
      if (hvad === "op") { h.gaet++; sigIChat("⬆ Højere!"); }
      if (hvad === "ned") { h.gaet++; sigIChat("⬇ Lavere!"); }
      if (hvad === "rigtigt") { sigIChat("🎉 Rigtigt! Tallet var " + h.tal + "!"); h.tal = 0; }
      if (hvad === "nyt") { h.tal = 0; sigIChat("🔢 Jeg tænker på et nyt tal fra 1 til 100. Gæt løs!"); }
    } else if (l.hjaelper === "nedtael") {
      if (hvad === "start" && !h.tael) {
        h.tael = 20;
        sigIChat("🙈 Jeg tæller til 20 … Gem jer!");
        const tik = setInterval(function () {
          h.tael--;
          if (h.tael === 10) sigIChat("🙈 10 …");
          if (h.tael <= 0) { clearInterval(tik); h.tael = 0; sigIChat("👀 Klar eller ej, her kommer jeg!"); }
          igen();
        }, 1000);
      }
    } else if (l.hjaelper === "terning") {
      sigIChat("🎲 Slå med terningen: 1 Kick 👢, 2 Stjæl 🦹, 3 Få 🎁, 4 Dø 💀, 5 Få og stjæl, 6 Safe 🛡️");
    } else if (l.hjaelper === "gaa") {
      gaaTil(l.rum);
      return;
    }
    igen();
  }

  // ---------------------------------------------------------------
  //  🏆 Resultater: skriv vindere ind og se tidligere præmier
  // ---------------------------------------------------------------
  function tegnResultater(krop) {
    const forslag = [];
    (plan || []).forEach(function (p) { if (forslag.indexOf(p.titel) < 0) forslag.push(p.titel); });
    EA_LEGE.forEach(function (l) { if (forslag.indexOf(l.navn) < 0) forslag.push(l.navn); });
    let html = "<details class='ea-vind-ny'" + (resultater && !resultater.length ? " open" : "") + "><summary>🏆 Skriv vinderne ind</summary>" +
      "<div class='ea-form'><label>Hvilket event?<input id='ea-v-event' list='ea-v-ev' maxlength='80' placeholder='Fx Quiz-aften'></label>" +
      "<datalist id='ea-v-ev'>" + forslag.map(function (f) { return "<option value='" + esc(f) + "'>"; }).join("") + "</datalist>" +
      "<label>Vindere (komma imellem)<input id='ea-v-navne' list='ea-v-sp' autocomplete='off' placeholder='Fx Ida, Noah'></label>" +
      "<datalist id='ea-v-sp'>" + spillerNavne().map(function (n) { return "<option value='" + esc(n) + "'>"; }).join("") + "</datalist>" +
      "<label>Hvad har de vundet?<input id='ea-v-gevinst' maxlength='200' value='1 gratis ting i shoppen 🎁'></label>" +
      "<p class='ea-info'>🎁 Hver vinder kan vælge én gratis ting i shoppen, og vinderboksen kommer frem i højre side for alle.</p>" +
      "<button class='ea-stor ea-guld' id='ea-v-gem'>🏆 Vis vinderne for alle</button><p class='ea-advarsel' id='ea-v-svar' hidden></p></div></details>";
    if (resFejl) html += "<p class='ea-advarsel'>" + esc(resFejl) + "</p>";
    if (resultater === null) html += "<p class='ea-tom'>Henter vinderne …</p>";
    else if (!resultater.length) html += "<p class='ea-tom'>🏆 Der er ingen vindere endnu.</p>";
    else {
      // flest sejre
      const sejre = {};
      resultater.forEach(function (r) { (r.navne || []).forEach(function (n) { sejre[n] = (sejre[n] || 0) + 1; }); });
      const top = Object.keys(sejre).sort(function (a, b) { return sejre[b] - sejre[a] || a.localeCompare(b); }).slice(0, 5);
      html += "<h4 class='ea-dag'>🥇 Flest sejre</h4><div class='ea-topliste'>" + top.map(function (n, i) {
        return "<span><b>" + ["🥇", "🥈", "🥉", "4.", "5."][i] + " " + esc(n) + "</b><i>" + sejre[n] + "</i></span>";
      }).join("") + "</div>";
      html += "<input id='ea-v-soeg' class='ea-soeg' placeholder='🔍 Søg efter navn eller event …' value='" + esc(resSoeg) + "'>";
      const q = resSoeg.trim().toLowerCase();
      const vist = resultater.filter(function (r) {
        return !q || (r.event || "").toLowerCase().indexOf(q) >= 0 || (r.navne || []).some(function (n) { return n.toLowerCase().indexOf(q) >= 0; });
      });
      html += "<div class='ea-res-liste'>" + (vist.length ? vist.map(resKort).join("") : "<p class='ea-tom'>Ingen passer til søgningen.</p>") + "</div>";
    }
    krop.innerHTML = html;

    const soeg = krop.querySelector("#ea-v-soeg");
    if (soeg) soeg.addEventListener("input", function () {
      resSoeg = soeg.value;
      const q = resSoeg.trim().toLowerCase();
      krop.querySelector(".ea-res-liste").innerHTML = (resultater || []).filter(function (r) {
        return !q || (r.event || "").toLowerCase().indexOf(q) >= 0 || (r.navne || []).some(function (n) { return n.toLowerCase().indexOf(q) >= 0; });
      }).map(resKort).join("") || "<p class='ea-tom'>Ingen passer til søgningen.</p>";
      kobl(krop);
    });
    krop.querySelector("#ea-v-gem").addEventListener("click", function () {
      const knap = this, svar = krop.querySelector("#ea-v-svar");
      const event = krop.querySelector("#ea-v-event").value, navne = krop.querySelector("#ea-v-navne").value, gevinst = krop.querySelector("#ea-v-gevinst").value;
      const vStil = Object.assign({ farve: "guld", effekt: "glimmer" }, hent("mit-hotel-vinder-stil", {}));
      knap.disabled = true;
      const data = { p_token: token(), p_event: event, p_navne: navne, p_gevinst: gevinst };
      serverKald("hv_vindere_saet", Object.assign({ p_stil: { farve: vStil.farve, effekt: vStil.effekt } }, data)).catch(function (e) {
        if (/function|schema cache/i.test(e.message)) return serverKald("hv_vindere_saet", data);
        throw e;
      }).then(function (r) {
        try { if (typeof adminSkriv === "function") adminSkriv("Skrev vindere ind fra Event-appen" + (event.trim() ? " for " + event.trim() : "") + ": " + r.navne.join(", ")); } catch (e) {}
        try { if (typeof evHentVindere === "function") evHentVindere(); } catch (e) {}
        sendTeam("🏆 Vindere" + (event.trim() ? " af " + event.trim() : "") + ": " + r.navne.join(", "));
        lilleBesked("🏆 Vinderne står nu i højre side for alle");
        return hentResultater();
      }).then(function () { tegnApp(); }).catch(function (e) {
        knap.disabled = false; svar.hidden = false;
        svar.textContent = /hv_vindere/.test(e.message) ? "Kør database-21-eventnoter-vindere.sql først." : e.message;
      });
    });
    kobl(krop);
  }
  function resKort(r) {
    const valgt = {};
    (r.valgt || []).forEach(function (g) { valgt[g.navn] = g; });
    const gammel = Date.now() - new Date(r.tid).getTime() > 7 * 86400000;
    return "<div class='ea-res'><div class='ea-res-top'><b>🏆 " + esc(r.event || "Event") + "</b><small>" + dagTekst(r.tid) + " kl. " + kl(r.tid) + "</small></div>" +
      "<ul>" + (r.navne || []).map(function (n) {
        const g = valgt[n];
        return "<li>👑 <b>" + esc(n) + "</b>" + (g ? (g.brugt ? " <em class='ok'>✅ valgte " + esc(g.moebel_navn || "en ting") + "</em>" : " <em>⏳ har ikke valgt endnu</em>") : "") + "</li>";
      }).join("") + "</ul>" +
      (r.gevinst ? "<p>🎁 " + esc(r.gevinst) + "</p>" : "") +
      "<div class='ea-res-bund'><small>Skrevet af " + esc(r.hvem) + "</small>" +
      (gammel ? "" : "<button data-ea-vslet='" + r.id + "' title='Fjern vinderboksen (gratis ting der ikke er valgt, forsvinder også)'>🗑 Fjern</button>") + "</div></div>";
  }
  function kobl(krop) {
    krop.querySelectorAll("[data-ea-vslet]").forEach(function (k) {
      if (k.eaKoblet) return;
      k.eaKoblet = true;
      toKlik(k, function () {
        serverKald("hv_vinder_slet", { p_token: token(), p_id: +k.dataset.eaVslet }).then(function () {
          try { if (typeof evHentVindere === "function") evHentVindere(); } catch (e) {}
          lilleBesked("🗑 Fjernet");
          return hentResultater();
        }).then(function () { tegnApp(); }).catch(function (e) { lilleBesked(e.message); });
      });
    });
  }

  // ---------------------------------------------------------------
  //  👥 Team: kollegaer + chat kun for eventholdet og ejeren
  // ---------------------------------------------------------------
  function erOnline(n) {
    if (n === mig()) return true;
    try { return hvemErOnline().some(function (x) { return x.toLowerCase() === n.toLowerCase(); }); } catch (e) { return false; }
  }
  function hvorEr(n) {
    if (n === mig()) return herNu();
    try { const g = ANDRE_SPILLERE[n]; return g ? g.rumId : null; } catch (e) { return null; }
  }
  function tegnTeam(krop) {
    krop.innerHTML = "<div class='ea-team'></div><h4 class='ea-dag'>💬 Eventholdets chat</h4>" +
      "<p class='ea-info'>Kun Eventfolk, Eventværter og ejeren kan se chatten.</p>" +
      "<div class='ea-chat'></div><form class='ea-skriv'><input id='ea-c-tekst' maxlength='500' autocomplete='off' placeholder='Skriv til eventholdet …'><button>➤</button></form>";
    tegnTeamListe();
    tegnChatListe();
    const form = krop.querySelector(".ea-skriv"), felt = krop.querySelector("#ea-c-tekst");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const t = felt.value.trim();
      if (!t) return;
      felt.value = "";
      sendTeam(t, true);
    });
  }
  function tegnTeamListe() {
    const boks = appEl() && appEl().querySelector(".ea-team");
    if (!boks) return;
    const navne = teamNavne().sort(function (a, b) {
      return (erOnline(b) - erOnline(a)) || (erEjerNavn(b) - erEjerNavn(a)) || a.localeCompare(b);
    });
    const html = navne.map(function (n) {
      const on = erOnline(n), rum = on ? hvorEr(n) : null;
      const kanGaa = rum && rum !== herNu() && rum.indexOf(":") < 0;
      return "<div class='ea-person'><i class='ea-prik" + (on ? " on" : "") + "'></i><div><b>" + esc(n) + (n === mig() ? " (dig)" : "") + "</b>" +
        "<small>" + esc(skiltTekst(n)) + " · " + (on ? (rum ? "📍 " + esc(rumNavn(rum)) : "🟢 Online") : "Offline") + "</small></div>" +
        (kanGaa ? "<button data-ea-gaa='" + esc(rum) + "' title='Gå derhen'>🚶</button>" : "") + "</div>";
    }).join("");
    if (boks.dataset.html !== html) {
      boks.dataset.html = html;
      boks.innerHTML = "<div class='ea-team-top'>👥 Eventholdet <i>" + navne.filter(erOnline).length + " online</i></div>" + html;
      boks.querySelectorAll("[data-ea-gaa]").forEach(function (k) { k.addEventListener("click", function () { gaaTil(k.dataset.eaGaa); }); });
    }
  }
  function tegnChatListe() {
    const boks = appEl() && appEl().querySelector(".ea-chat");
    if (!boks) return;
    const html = (chatFejl ? "<p class='ea-advarsel'>" + esc(chatFejl) + "</p>" : "") + (chat.length ? chat.map(function (b) {
      const min = b.navn === mig();
      return "<div class='ea-boble" + (min ? " min" : "") + "'>" + (min ? "" : "<b>" + esc(b.navn) + "</b>") + "<span>" + esc(b.tekst) + "</span><small>" + dagTekst(b.tid).replace("I dag", "") + " " + kl(b.tid) + "</small></div>";
    }).join("") : (chatHentet ? "<p class='ea-tom'>Ingen beskeder endnu. Sig hej til eventholdet 👋</p>" : "<p class='ea-tom'>Henter chatten …</p>"));
    if (boks.dataset.html !== html) {
      const bund = boks.scrollHeight - boks.scrollTop - boks.clientHeight < 40;
      boks.dataset.html = html;
      boks.innerHTML = html;
      if (bund || !boks.dataset.rullet) { boks.scrollTop = boks.scrollHeight; boks.dataset.rullet = "1"; }
    }
    if (appAaben() && fane === "team") markerLaest();
  }
  // Skriv i eventholdets chat (også automatiske beskeder som "📅 Ida har planlagt …")
  function sendTeam(tekst, fraFelt) {
    if (!online()) return;
    kald("hv_eventchat_send", { p_tekst: tekst }).then(function () { return hentChat(); }).then(function () { tegnChatListe(); })
      .catch(function (e) { if (fraFelt) { chatFejl = fejlTekst(e); tegnChatListe(); } });
  }

  // ---------------------------------------------------------------
  //  I baggrunden: ny chat, påmindelser og "appen er kommet/væk"
  // ---------------------------------------------------------------
  let sidstChatHent = 0, sidstPlanHent = 0, harAppFoer = null;
  setInterval(function () {
    const har = maaBruge();
    // appen kommer og går af sig selv (telefonen spørger kun() hver gang den tegner)
    if (har !== harAppFoer) {
      const foer = harAppFoer;
      harAppFoer = har;
      if (typeof window.tlfOpdaterHjem === "function") window.tlfOpdaterHjem();
      const noegle = "mit-hotel-eventapp-vist-" + mig();
      if (har && !erEjerNavn(mig()) && !hent(noegle, false) && foer !== null) {
        gem(noegle, true);
        setTimeout(function () { if (typeof window.tlfNotis === "function") window.tlfNotis("event", "🎪 Event-appen", "Du er nu på eventholdet! Event-appen ligger på din telefon."); }, 400);
      }
      if (har && foer === null) gem(noegle, true);
      if (!har) { gem(noegle, false); if (appApi && appApi.luk && appAaben()) appApi.luk(); chat = []; chatHentet = false; plan = null; resultater = null; }
    }
    if (!har || !online()) return;
    const nu = Date.now();
    const aaben = appAaben();
    if (nu - sidstChatHent > (aaben && fane === "team" ? 3000 : 12000)) {
      sidstChatHent = nu;
      hentChat().then(function (nyt) {
        if (nyt && aaben) { if (fane === "team") tegnChatListe(); else if (side === "liste") opdater(); }
        if (nyt && typeof window.tlfOpdaterHjem === "function") window.tlfOpdaterHjem();
      });
    }
    if (nu - sidstPlanHent > (aaben && fane === "events" ? 5000 : 30000)) {
      sidstPlanHent = nu;
      hentPlan().then(function () { if (aaben && fane === "events") opdater(); tjekPaamindelser(); });
    }
    if (aaben && fane === "team") tegnTeamListe();
  }, 1000);

  function tjekPaamindelser() {
    if (!plan) return;
    const sendt = hent("mit-hotel-eventapp-mindet", {});
    const nu = Date.now();
    plan.forEach(function (p) {
      if (p.aflyst || p.startet) return;
      const start = new Date(p.start).getTime(), id = String(p.id);
      const minDig = p.ansvarlig && p.ansvarlig === mig();
      if (start - nu <= 15 * 60000 && start - nu > 0 && !sendt[id + "-15"]) {
        sendt[id + "-15"] = 1;
        if (typeof window.tlfNotis === "function") window.tlfNotis("event", "⏰ Om " + Math.max(1, Math.round((start - nu) / 60000)) + " min: " + p.titel,
          (p.rum_navn || rumNavn(p.rum)) + (minDig ? " · Det er dig, der står for det!" : p.ansvarlig ? " · 👤 " + p.ansvarlig : ""));
      }
      if (start <= nu && nu - start < 10 * 60000 && !sendt[id + "-nu"]) {
        sendt[id + "-nu"] = 1;
        if (typeof window.tlfNotis === "function") window.tlfNotis("event", "🎉 Det er tid: " + p.titel,
          minDig ? "Åbn Event-appen og tryk ▶ for at starte." : "Eventet skal starte nu.");
      }
    });
    Object.keys(sendt).forEach(function (k) { if (!plan.some(function (p) { return k.indexOf(p.id + "-") === 0; })) delete sendt[k]; });
    gem("mit-hotel-eventapp-mindet", sendt);
  }

  // ---------------------------------------------------------------
  //  Udseende (vinrød og guld som hotellet)
  // ---------------------------------------------------------------
  const T = "#telefon ";
  const css = [
    T + ".ea-app { background: radial-gradient(120% 60% at 50% 0%, #5a1426, #1e060c 70%); color: #fbecd0; padding: 6px 12px 18px; min-height: 100%; box-sizing: border-box; font-size: 12px; }",
    T + ".tlf-top.ea-top { background: #1e060c !important; color: #ffd98a; border-bottom: 1px solid rgba(217,164,65,.35); }",
    T + ".tlf-top.ea-top h3 { color: #ffd98a !important; letter-spacing: .5px; }",
    T + ".tlf-top.ea-top .tlf-tb { color: #ffd98a !important; }",
    "#telefon:has(.ea-app) .tlf-status { color: #fbecd0 !important; }",
    "#telefon:has(.ea-app) .tlf-hjemlinje { background: #fbecd0 !important; }",
    T + ".ea-logo { text-align: center; margin: 6px 0 10px; display: grid; gap: 1px; }",
    T + ".ea-logo b { font: 900 28px/1 Georgia, 'Times New Roman', serif; letter-spacing: 7px; color: #ffd98a; text-shadow: 0 0 14px rgba(255,190,90,.5), 0 2px 0 #7a1b2b; }",
    T + ".ea-logo span { font-size: 10px; letter-spacing: 4px; color: #f3b7c2; font-weight: 700; }",
    T + ".ea-logo small { font-size: 10.5px; opacity: .7; margin-top: 3px; }",
    T + ".ea-faner { display: flex; gap: 3px; margin-bottom: 10px; background: rgba(0,0,0,.3); padding: 3px; border-radius: 12px; position: sticky; top: 0; z-index: 2; }",
    T + ".ea-faner button { flex: 1 1 auto; white-space: nowrap; padding: 7px 3px; border-radius: 9px; border: 0; background: transparent; color: #f7dfa0; font-size: 10px; font-weight: 600; cursor: pointer; }",
    T + ".ea-faner button.valgt { background: linear-gradient(#ffd98a, #d9a441); color: #4a1622; }",
    T + ".ea-faner button i { font-style: normal; background: #e0283c; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 9.5px; }",
    T + ".ea-knapper { display: flex; gap: 6px; margin-bottom: 8px; }",
    T + ".ea-stor { flex: 1; padding: 10px 8px; border-radius: 12px; border: 1px solid rgba(217,164,65,.5); background: rgba(255,255,255,.08); color: #ffe7b0; font-weight: 700; font-size: 12px; cursor: pointer; }",
    T + ".ea-stor.ea-guld { background: linear-gradient(#ffd98a, #d9a441); color: #4a1622; border-color: #ffd98a; }",
    T + ".ea-stor:disabled { opacity: .5; }",
    T + ".ea-lille { width: 100%; padding: 7px; border-radius: 10px; border: 1px dashed rgba(217,164,65,.5); background: transparent; color: #ffd98a; font-weight: 600; cursor: pointer; }",
    T + ".ea-dag { margin: 12px 2px 6px; font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #f3b7c2; }",
    T + ".ea-kort { width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px; margin-bottom: 7px; border-radius: 14px; border: 1px solid rgba(217,164,65,.3); background: rgba(255,255,255,.06); color: inherit; text-align: left; box-sizing: border-box; font: inherit; }",
    T + "button.ea-kort { cursor: pointer; } " + T + "button.ea-kort:hover { background: rgba(255,255,255,.11); }",
    T + ".ea-kort.ea-live { border-color: #ff5c6c; box-shadow: 0 0 0 1px rgba(255,92,108,.4) inset; }",
    T + ".ea-kort.ea-graa { opacity: .55; }",
    T + ".ea-emoji { width: 40px; height: 40px; flex: none; display: grid; place-items: center; font-size: 22px; border-radius: 10px; background: linear-gradient(160deg, #a8324a, #3a0a14); border: 1px solid rgba(255,217,138,.5); }",
    T + ".ea-kort-tekst { flex: 1; display: grid; gap: 2px; min-width: 0; }",
    T + ".ea-kort-tekst b { font-size: 13.5px; color: #fff4dc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    T + ".ea-kort-tekst small { font-size: 10.5px; opacity: .78; }",
    T + ".ea-kort-tekst small.ea-tekst { opacity: .62; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    T + ".ea-kort-tekst em { font-style: normal; font-size: 10.5px; font-weight: 700; color: #9fe0a8; }",
    T + ".ea-kort-tekst em.ea-aflyst { color: #ff8a98; } " + T + ".ea-kort-tekst em.ea-snart { color: #ffd98a; }",
    T + ".ea-smaa { display: flex; flex-direction: column; gap: 4px; }",
    T + ".ea-smaa button { min-width: 30px; height: 26px; border-radius: 8px; border: 1px solid rgba(217,164,65,.4); background: rgba(0,0,0,.25); color: #ffe7b0; cursor: pointer; font-size: 12px; padding: 0 5px; }",
    T + ".ea-smaa button.ea-start { background: linear-gradient(#ffd98a, #d9a441); color: #4a1622; font-weight: 800; }",
    T + ".ea-smaa button.ea-sikker, " + T + ".ea-res-bund button.ea-sikker { background: #c0392b; color: #fff; font-size: 10px; }",
    T + ".ea-pil { font-size: 22px; opacity: .5; }",
    T + ".ea-tom { text-align: center; opacity: .75; padding: 18px 8px; line-height: 1.5; }",
    T + ".ea-info { font-size: 10.5px; opacity: .7; margin: 6px 2px; line-height: 1.4; }",
    T + ".ea-advarsel { background: rgba(255,80,100,.15); border: 1px solid rgba(255,120,130,.5); color: #ffd0d5; border-radius: 10px; padding: 8px; font-size: 11px; }",
    T + ".ea-tidligere { margin-top: 10px; } " + T + ".ea-tidligere summary { cursor: pointer; color: #f3b7c2; font-size: 11px; margin-bottom: 6px; }",
    T + ".ea-form { display: grid; gap: 8px; }",
    T + ".ea-form label { display: grid; gap: 3px; font-size: 10.5px; color: #f7dfa0; font-weight: 600; }",
    T + ".ea-form input, " + T + ".ea-form select, " + T + ".ea-form textarea, " + T + ".ea-soeg, " + T + ".ea-skriv input { width: 100%; box-sizing: border-box; padding: 7px 8px; border-radius: 9px; border: 1px solid rgba(217,164,65,.45); background: #fff8ea; color: #3a0f19; font: 12px Verdana, sans-serif; }",
    T + ".ea-to { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }",
    T + ".ea-lbl { font-size: 10.5px; color: #f7dfa0; font-weight: 600; }",
    T + ".ea-emojier { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; }",
    T + ".ea-emojier button { aspect-ratio: 1; border-radius: 8px; border: 1px solid transparent; background: rgba(255,255,255,.07); font-size: 16px; cursor: pointer; padding: 0; }",
    T + ".ea-emojier button.valgt { border-color: #ffd98a; background: rgba(255,217,138,.25); }",
    T + ".ea-leg-top { text-align: center; display: grid; gap: 2px; margin: 8px 0; }",
    T + ".ea-leg-top span { font-size: 46px; } " + T + ".ea-leg-top b { font: 800 19px Georgia, serif; color: #ffd98a; } " + T + ".ea-leg-top small { opacity: .7; }",
    T + ".ea-leg-kort-tekst { text-align: center; line-height: 1.45; margin: 4px 4px 8px; }",
    T + ".ea-regler { margin: 0 0 10px; padding-left: 20px; line-height: 1.5; }",
    T + ".ea-hjaelper { display: grid; gap: 8px; }",
    T + ".ea-hj-boks { display: grid; gap: 4px; text-align: center; padding: 10px; border-radius: 12px; background: rgba(0,0,0,.28); border: 1px solid rgba(217,164,65,.35); }",
    T + ".ea-hj-boks b { font-size: 14px; color: #fff4dc; } " + T + ".ea-hj-boks em { font-style: normal; color: #9fe0a8; font-size: 11px; } " + T + ".ea-hj-boks small { opacity: .7; font-size: 10px; }",
    T + ".ea-hj-stor { font: 900 34px Georgia, serif !important; color: #ffd98a !important; }",
    T + ".ea-hj-knapper { display: flex; flex-wrap: wrap; gap: 5px; }",
    T + ".ea-hj-knapper button { flex: 1 1 40%; padding: 8px 6px; border-radius: 10px; border: 1px solid rgba(217,164,65,.5); background: linear-gradient(#7a1b2b, #4a0d1b); color: #ffe7b0; font-weight: 700; font-size: 11px; cursor: pointer; }",
    T + ".ea-hj-knapper button:disabled { opacity: .5; }",
    T + ".ea-bingo { display: grid; grid-template-columns: repeat(15, 1fr); gap: 2px; }",
    T + ".ea-bingo i { font-style: normal; font-size: 8px; text-align: center; padding: 2px 0; border-radius: 3px; background: rgba(255,255,255,.06); opacity: .55; }",
    T + ".ea-bingo i.ja { background: #d9a441; color: #4a1622; opacity: 1; font-weight: 800; }",
    T + ".ea-vind-ny { margin-bottom: 8px; padding: 8px; border-radius: 12px; background: rgba(255,217,138,.08); border: 1px solid rgba(217,164,65,.4); }",
    T + ".ea-vind-ny summary { cursor: pointer; font-weight: 700; color: #ffd98a; font-size: 12.5px; } " + T + ".ea-vind-ny[open] summary { margin-bottom: 8px; }",
    T + ".ea-topliste { display: grid; gap: 3px; margin-bottom: 8px; }",
    T + ".ea-topliste span { display: flex; justify-content: space-between; padding: 5px 9px; border-radius: 9px; background: rgba(255,255,255,.06); }",
    T + ".ea-topliste span i { font-style: normal; font-weight: 800; color: #ffd98a; }",
    T + ".ea-soeg { margin-bottom: 8px; }",
    T + ".ea-res { padding: 8px 10px; margin-bottom: 7px; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(217,164,65,.3); }",
    T + ".ea-res-top { display: flex; justify-content: space-between; gap: 6px; } " + T + ".ea-res-top b { color: #ffd98a; } " + T + ".ea-res-top small { opacity: .65; font-size: 10px; white-space: nowrap; }",
    T + ".ea-res ul { margin: 5px 0; padding: 0; list-style: none; display: grid; gap: 2px; } " + T + ".ea-res li em { font-style: normal; font-size: 10px; opacity: .7; } " + T + ".ea-res li em.ok { color: #9fe0a8; opacity: 1; }",
    T + ".ea-res p { margin: 2px 0; font-size: 11px; }",
    T + ".ea-res-bund { display: flex; justify-content: space-between; align-items: center; } " + T + ".ea-res-bund small { opacity: .55; font-size: 10px; }",
    T + ".ea-res-bund button { border: 1px solid rgba(217,164,65,.4); background: rgba(0,0,0,.25); color: #ffe7b0; border-radius: 8px; font-size: 10px; padding: 3px 7px; cursor: pointer; }",
    T + ".ea-team { display: grid; gap: 4px; padding: 8px; border-radius: 12px; background: rgba(0,0,0,.25); border: 1px solid rgba(217,164,65,.3); }",
    T + ".ea-team-top { font-weight: 700; color: #ffd98a; display: flex; justify-content: space-between; } " + T + ".ea-team-top i { font-style: normal; font-size: 10px; color: #9fe0a8; }",
    T + ".ea-person { display: flex; align-items: center; gap: 8px; padding: 4px 2px; } " + T + ".ea-person div { flex: 1; display: grid; min-width: 0; } " + T + ".ea-person small { opacity: .7; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    T + ".ea-person button { border: 1px solid rgba(217,164,65,.4); background: rgba(0,0,0,.25); border-radius: 8px; cursor: pointer; padding: 3px 6px; }",
    T + ".ea-prik { width: 9px; height: 9px; border-radius: 50%; background: #6b5a5e; flex: none; } " + T + ".ea-prik.on { background: #4cd964; box-shadow: 0 0 6px #4cd964; }",
    T + ".ea-chat { display: flex; flex-direction: column; gap: 5px; max-height: 260px; min-height: 120px; overflow-y: auto; padding: 8px; border-radius: 12px; background: rgba(0,0,0,.25); }",
    T + ".ea-boble { max-width: 82%; align-self: flex-start; display: grid; gap: 1px; padding: 6px 9px; border-radius: 12px 12px 12px 3px; background: #fff8ea; color: #3a0f19; }",
    T + ".ea-boble.min { align-self: flex-end; border-radius: 12px 12px 3px 12px; background: linear-gradient(#ffd98a, #d9a441); }",
    T + ".ea-boble b { font-size: 10px; color: #7a1b2b; } " + T + ".ea-boble span { white-space: pre-wrap; word-break: break-word; } " + T + ".ea-boble small { font-size: 9px; opacity: .55; justify-self: end; }",
    T + ".ea-skriv { display: flex; gap: 5px; margin-top: 6px; } " + T + ".ea-skriv button { flex: none; width: 38px; border-radius: 10px; border: 0; background: linear-gradient(#ffd98a, #d9a441); color: #4a1622; font-weight: 900; cursor: pointer; }",
  ];
  const stil = document.createElement("style");
  stil.id = "ea-stil";
  stil.textContent = css.join("\n");
  document.head.appendChild(stil);
})();
