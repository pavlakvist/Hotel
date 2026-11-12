// =============================================================
//  🎬 Vera-cinema — biografens egen app og billetkontor
//  - 📱 Appen "Vera-cinema" hentes gratis i App Butik på telefonen: biografens program (film),
//    kommende arrangementer og 🎟 Mine billetter.
//  - Køb billet: skriv dit navn, vælg et sæde på salens kort, og betal 1 Glimt ⭐.
//    Kun 1 billet pr. person pr. visning. Når alle 32 sæder er taget, er der udsolgt.
//  - Ejerpanel → 🎟 Vera-cinema (ejeren og de ansatte): læg film og arrangementer i programmet,
//    se hvem der har booket hvilke sæder, fjern en billet, aflys (alle får Glimt tilbage),
//    og start filmen i biografen.
//  - I biografen står der et nummer på hvert sæde (A1–D8), og din egen plads lyser op.
//  - 📟 Billetscanner: ejeren og de ansatte scanner billetten ved indgangen; først derefter kan man sætte sig.
//  - 📼 Kø af YouTube-film i biografen: sæt så mange i kø du vil; den næste starter, når en film slutter.
//  Kræver database-46-cinema.sql. Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================
(function () {
  if (window.veraCinemaKlar) return;
  window.veraCinemaKlar = true;

  const VC_MANGLER = "⚠️ Serveren kender ikke Vera-cinema endnu. Kør database-46-cinema.sql i Supabase → SQL Editor.";
  const RAEKKER = ["A", "B", "C", "D"];        // A er forreste række (tættest på lærredet)
  const PR_RAEKKE = 8;
  const ALLE_SAEDER = RAEKKER.length * PR_RAEKKE;
  const PRIS = 1;
  const PLAKATER = ["🎬", "🍿", "🎞️", "🦁", "👻", "🚀", "💕", "🤠", "🧙", "🐉", "🦸", "🐶", "🎉", "🎤", "🎲", "🎭", "🏆", "🎵", "🎃", "🎄"];
  const FARVER = ["#7a1b2b", "#1f3b6e", "#2c5e3a", "#5b2a7a", "#8a4a12", "#1d1d24", "#a3324f", "#0f5a63"];
  const SET_NOEGLE = "mit-hotel-cinema-set";       // hvor mange billetter personalet har set
  const PAAMIND_NOEGLE = "mit-hotel-cinema-paamindet";

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
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(mig()) >= 0; }
  function maaStyre() {
    try { return erEjer() || (typeof erAnsat === "function" && erAnsat(mig())); } catch (e) { return false; }
  }
  function token() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function online() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function"; }
  function mangler(e) { return /function|schema cache|does not exist|hv_cinema/i.test((e && e.message) || ""); }
  function fejlTekst(e) { return mangler(e) ? VC_MANGLER : (e && e.message) || "Noget gik galt."; }
  function toast(t) {
    try { if (typeof visToast === "function") { visToast(t); return; } } catch (e) {}
    try { if (typeof besked !== "undefined" && besked) besked.textContent = t; } catch (e) {}
  }
  function to(n) { return (n < 10 ? "0" : "") + n; }
  const DAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MDR = ["jan.", "feb.", "marts", "april", "maj", "juni", "juli", "aug.", "sep.", "okt.", "nov.", "dec."];
  function kl(ms) { const d = new Date(ms); return to(d.getHours()) + ":" + to(d.getMinutes()); }
  function dagTekst(ms) {
    const d = new Date(ms), i = new Date(), m = new Date(); m.setDate(i.getDate() + 1);
    if (d.toDateString() === i.toDateString()) return "I dag";
    if (d.toDateString() === m.toDateString()) return "I morgen";
    return DAGE[d.getDay()].charAt(0).toUpperCase() + DAGE[d.getDay()].slice(1) + " " + d.getDate() + ". " + MDR[d.getMonth()];
  }
  function varighedTekst(min) { return min >= 60 ? Math.floor(min / 60) + " t" + (min % 60 ? " " + (min % 60) + " min" : "") : min + " min"; }
  function toKlik(knap, gør) {
    if (!knap.classList.contains("vc-sikker")) {
      const f = knap.innerHTML;
      knap.classList.add("vc-sikker");
      knap.textContent = "Er du sikker?";
      setTimeout(function () { if (knap.isConnected) { knap.classList.remove("vc-sikker"); knap.innerHTML = f; } }, 3000);
      return;
    }
    gør();
  }
  function saedeNavn(s) { return "Række " + s.charAt(0) + ", sæde " + s.slice(1); }
  function opdaterPenge(svar) {
    if (!svar || svar.glimt == null) return;
    try { if (typeof saetPenge === "function") saetPenge({ glimt: svar.glimt, stella: svar.stella }, false); } catch (e) {}
  }

  // ---------------------------------------------------------------
  //  Data fra serveren
  // ---------------------------------------------------------------
  let data = null;            // { program, mine }
  let fejl = "";
  let tidForskel = 0;         // serverens ur minus dette ur
  function nu() { return Date.now() + tidForskel; }
  function visning(id) { return data && data.program.find(function (v) { return v.id === id; }); }
  function minBillet(id) { return data && data.mine.find(function (b) { return b.visning_id === id; }); }
  function erStartet(v) { return v.start <= nu(); }
  function erIGang(v) { return v.start <= nu() && nu() < v.start + v.varighed * 60000; }
  function ledige(v) { return ALLE_SAEDER - (v.optaget || []).length; }

  let henter = false;
  function hent() {
    if (!online() || henter) return Promise.resolve();
    henter = true;
    return serverKald("hv_cinema_hent", { p_token: token() }).then(function (svar) {
      henter = false;
      const foer = data ? data.mine : [];
      data = { program: (svar && svar.program) || [], mine: (svar && svar.mine) || [] };
      data.mine.forEach(function (b) {
        const gl = foer.find(function (x) { return x.id === b.id; });
        if (b.scannet && gl && !gl.scannet) {
          const t = "Din billet er scannet ✅ Find plads " + b.saede + " – den lyser med en guldpil.";
          try { if (typeof besked !== "undefined") besked.textContent = "🎟 " + t; } catch (e) {}
          if (typeof window.tlfNotis === "function") window.tlfNotis("cinema", "📟 Vera-cinema", t);
          try { window.dispatchEvent(new CustomEvent("vc-scannet", { detail: b })); } catch (e) {}
        }
      });
      if (svar && svar.nu) tidForskel = svar.nu - Date.now();
      fejl = "";
      opdaterApp();
      paamind();
    }).catch(function (e) {
      henter = false;
      fejl = fejlTekst(e);
      opdaterApp();
    });
  }
  setTimeout(hent, 2500);
  setInterval(function () {
    // ofte, når appen er åben; ellers sjældent (til biografens "Din plads" og påmindelser)
    // i forhallen hvert 4. sekund (så døren åbner, lige når billetten er scannet)
    const gaa = iForhal() || ((appAaben() || iBio()) && Date.now() - (hent.sidst || 0) > 7500) || Date.now() - (hent.sidst || 0) > 60000;
    if (gaa) { hent.sidst = Date.now(); hent(); }
  }, 4000);

  // Påmindelse 15 minutter før en film, man har billet til
  function paamind() {
    if (!data) return;
    let set = {};
    try { set = JSON.parse(localStorage.getItem(PAAMIND_NOEGLE) || "{}"); } catch (e) {}
    data.mine.forEach(function (b) {
      const om = b.start - nu();
      if (om > 0 && om < 15 * 60000 && !set[b.id]) {
        set[b.id] = 1;
        const t = "Om " + Math.max(1, Math.round(om / 60000)) + " min: " + b.titel + " · din plads er " + b.saede;
        if (typeof window.tlfNotis === "function") window.tlfNotis("cinema", "🎬 Vera-cinema", t); else toast("🎬 " + t);
      }
    });
    try { localStorage.setItem(PAAMIND_NOEGLE, JSON.stringify(set)); } catch (e) {}
  }


  // ---------------------------------------------------------------
  //  📱 Appen Vera-cinema
  // ---------------------------------------------------------------
  const IKON = "<rect x='3' y='6' width='18' height='13' rx='2.2' fill='#fff'/><path d='M3 9.5h18' stroke='#7a1b2b' stroke-width='1.4'/>" +
    "<path d='M5.5 6 8 9.5M10 6l2.5 3.5M14.5 6 17 9.5' stroke='#7a1b2b' stroke-width='1.4'/><path d='M10.3 12v5l4.4-2.5z' fill='#d9a441'/>" +
    "<path d='M3 6 19.6 3.2l.5 2.6' fill='none' stroke='#fff' stroke-width='1.8' stroke-linejoin='round'/>";
  let appApi = null;
  let fane = "film";        // film | event | mine
  let side = "liste";       // liste | visning | koeb | billet
  let valgtId = null;
  let valgtSaede = "";
  let skrevetNavn = "";
  let koebFejl = "";
  let koeber = false;

  const APP = {
    navn: "Vera-cinema", ikSvg: IKON, bg: "linear-gradient(#b8283f, #3a0a14)", butik: true,
    tekst: "Hotellets biograf 🎬 Se programmet og kommende arrangementer, vælg dit sæde og køb billet for 1 Glimt.",
    tal: function () { return 0; },
    tegn: function (el, api) { appApi = api; tegnApp(); hent(); },
    luk: function () { appApi = null; side = "liste"; },
  };
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () { window.tlfTilfoejApp("cinema", APP); });

  function appEl() { return appApi && appApi.el(); }
  function appAaben() { return !!appApi && typeof window.tlfAppAaben === "function" && window.tlfAppAaben("cinema"); }
  function opdaterApp() {
    if (!appAaben()) return;
    if (side === "koeb") { tegnSalKort(); return; }   // rør ikke navnefeltet, mens man skriver
    tegnApp();
  }
  function aabnVisning(id) { valgtId = id; side = "visning"; koebFejl = ""; tegnApp(); }
  window.vcAabn = function (id) {    // fx fra biografen: åbn appen (og evt. en bestemt visning)
    if (typeof window.tlfAabnApp !== "function") return;
    window.tlfAabnApp("cinema");
    if (id) setTimeout(function () { aabnVisning(id); }, 80);
  };

  function topHtml(titel, tilbage) {
    const api = appApi;
    const pil = api && api.ik ? api.ik("tilbage", 20) : "‹";
    return "<div class='tlf-top vc-top'>" + (tilbage
      ? "<button class='tlf-tb' data-vc-tilbage='" + tilbage + "' title='Tilbage'>" + pil + "</button>"
      : "<button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + pil + "</button>") +
      "<h3>" + titel + "</h3><span class='tlf-tb'></span></div>";
  }

  function tegnApp() {
    const el = appEl();
    if (!el) return;
    const v = valgtId ? visning(valgtId) : null;
    if (side !== "liste" && !v && !(side === "billet" && minBillet(valgtId))) side = "liste";
    if (side === "liste") tegnListe(el);
    else if (side === "visning") tegnVisning(el, v);
    else if (side === "koeb") tegnKoeb(el, v);
    else if (side === "billet") tegnBilletSide(el);
    el.querySelectorAll("[data-vc-tilbage]").forEach(function (k) {
      k.addEventListener("click", function (e) {
        e.stopPropagation();
        side = k.dataset.vcTilbage;
        koebFejl = "";
        tegnApp();
      });
    });
  }

  function plakatHtml(v, stor) {
    return "<div class='vc-plakat" + (stor ? " stor" : "") + "' style='--vc-f:" + esc(v.farve || "#7a1b2b") + "'><span>" + esc(v.plakat || "🎬") + "</span>" +
      (stor ? "" : "<i>" + (v.type === "event" ? "EVENT" : "FILM") + "</i>") + "</div>";
  }

  function tegnListe(el) {
    const faner = [["film", "🎬 Program"], ["event", "🎉 Arrangementer"], ["mine", "🎟 Mine"]];
    el.innerHTML = topHtml("Vera-cinema") +
      "<div class='tlf-indhold vc-app'>" +
      "<div class='vc-logo'><b>VERA</b><span>✦ CINEMA ✦</span><small>Hotellets biograf · Stueetagen</small></div>" +
      "<div class='vc-faner'>" + faner.map(function (f) {
        const antal = f[0] === "mine" && data ? data.mine.length : 0;
        return "<button data-vc-fane='" + f[0] + "'" + (f[0] === fane ? " class='valgt'" : "") + ">" + f[1] + (antal ? " <i>" + antal + "</i>" : "") + "</button>";
      }).join("") + "</div><div class='vc-krop'></div></div>";
    el.querySelectorAll("[data-vc-fane]").forEach(function (b) {
      b.addEventListener("click", function () { fane = b.dataset.vcFane; tegnApp(); });
    });
    const krop = el.querySelector(".vc-krop");
    if (fejl && !data) { krop.innerHTML = "<p class='vc-advarsel'>" + esc(fejl) + "</p>"; return; }
    if (!online()) { krop.innerHTML = "<p class='vc-tom'>Vera-cinema virker kun, når hotellet er på nettet.</p>"; return; }
    if (!data) { krop.innerHTML = "<p class='vc-tom'>Henter programmet …</p>"; return; }
    if (fane === "mine") { tegnMine(krop); return; }
    const liste = data.program.filter(function (v) { return v.type === fane; });
    if (!liste.length) {
      krop.innerHTML = "<p class='vc-tom'>" + (fane === "film" ? "🎞️ Der er ingen film på programmet lige nu." : "🎉 Der er ingen arrangementer lige nu.") +
        "<br><small>Kig forbi igen snart!</small></p>";
      return;
    }
    let sidsteDag = "";
    krop.innerHTML = liste.map(function (v) {
      const dag = dagTekst(v.start);
      const overskrift = dag !== sidsteDag ? "<h4 class='vc-dag'>" + dag + "</h4>" : "";
      sidsteDag = dag;
      const mine = minBillet(v.id), l = ledige(v);
      const status = mine ? "<em class='vc-har'>🎟 " + esc(mine.saede) + "</em>"
        : erIGang(v) ? "<em class='vc-igang'>● Vises nu</em>"
        : l <= 0 ? "<em class='vc-udsolgt'>Udsolgt</em>"
        : "<em>" + l + " ledige</em>";
      return overskrift + "<button class='vc-kort' data-vc-vis='" + v.id + "'>" + plakatHtml(v) +
        "<div class='vc-kort-tekst'><b>" + esc(v.titel) + "</b><small>kl. " + kl(v.start) + " · " + varighedTekst(v.varighed) + "</small>" + status + "</div>" +
        "<span class='vc-pil'>›</span></button>";
    }).join("");
    krop.querySelectorAll("[data-vc-vis]").forEach(function (k) {
      k.addEventListener("click", function () { aabnVisning(+k.dataset.vcVis); });
    });
  }

  function tegnMine(krop) {
    if (!data.mine.length) {
      krop.innerHTML = "<p class='vc-tom'>🎟 Du har ingen billetter endnu.<br><small>Vælg en film eller et arrangement og køb en billet for 1 ⭐.</small></p>";
      return;
    }
    krop.innerHTML = data.mine.map(function (b) { return billetHtml(b, true); }).join("");
    krop.querySelectorAll("[data-vc-billet]").forEach(function (k) {
      k.addEventListener("click", function () { valgtId = +k.dataset.vcBillet; side = "billet"; tegnApp(); });
    });
  }

  function billetHtml(b, klikbar) {
    const forbi = b.start + b.varighed * 60000 < nu();
    return "<" + (klikbar ? "button data-vc-billet='" + b.visning_id + "'" : "div") + " class='vc-billet" + (forbi ? " forbi" : "") + "' style='--vc-f:" + esc(b.farve || "#7a1b2b") + "'>" +
      "<div class='vc-billet-top'><span>" + esc(b.plakat || "🎬") + "</span><div><small>VERA CINEMA · " + (b.type === "event" ? "ARRANGEMENT" : "BILLET") + "</small><b>" + esc(b.titel) + "</b></div></div>" +
      "<div class='vc-billet-midt'><div><small>Dato</small><b>" + dagTekst(b.start) + "</b></div><div><small>Kl.</small><b>" + kl(b.start) + "</b></div>" +
      "<div><small>Række</small><b>" + esc(b.saede.charAt(0)) + "</b></div><div><small>Sæde</small><b>" + esc(b.saede.slice(1)) + "</b></div></div>" +
      "<div class='vc-billet-bund'><span>👤 " + esc(b.navn) + "</span>" + (b.kode ? "<span class='vc-kode-lille'>" + esc(b.kode) + "</span>" : "<span class='vc-stregkode'>" + stregkode(b.id) + "</span>") + "</div>" +
      (b.scannet ? "<i class='vc-stempel ok'>SCANNET</i>" : forbi ? "<i class='vc-stempel'>BRUGT</i>" : "") +
      "</" + (klikbar ? "button" : "div") + ">";
  }
  // Rigtig stregkode (Code 39), så en rigtig håndscanner også kan læse den. Koden er 0-9 og A-F.
  const CODE39 = { "0": "101000111011101", "1": "111010001010111", "2": "101110001010111", "3": "111011100010101", "4": "101000111010111",
    "5": "111010001110101", "6": "101110001110101", "7": "101000101110111", "8": "111010001011101", "9": "101110001011101",
    "A": "111010100010111", "B": "101110100010111", "C": "111011101000101", "D": "101011100010111", "E": "111010111000101", "F": "101110111000101" };
  const CODE39_KANT = "100010111011101";   // stjernen * i start og slut
  function stregkodeSvg(kode) {
    const bits = [CODE39_KANT].concat(String(kode).toUpperCase().split("").map(function (c) { return CODE39[c] || ""; })).concat([CODE39_KANT]).join("0");
    let rects = "", i = 0;
    while (i < bits.length) {
      if (bits[i] === "1") { let j = i; while (j < bits.length && bits[j] === "1") j++; rects += "<rect x='" + (i + 10) + "' y='0' width='" + (j - i) + "' height='40'/>"; i = j; } else i++;
    }
    return "<svg class='vc-stregkode-svg' viewBox='0 0 " + (bits.length + 20) + " 40' preserveAspectRatio='none'><rect width='100%' height='40' fill='#fff'/><g fill='#000'>" + rects + "</g></svg>";
  }
  function stregkode(n) {
    let s = "", x = (n || 1) * 7919;
    for (let i = 0; i < 22; i++) { x = (x * 31 + 7) % 997; s += "<i style='width:" + (1 + x % 3) + "px'></i>"; }
    return s;
  }

  function tegnVisning(el, v) {
    const mine = minBillet(v.id), l = ledige(v);
    let knap;
    if (mine) knap = "<button class='vc-stor-knap' data-vc-min>🎟 Se din billet · " + esc(mine.saede) + "</button>";
    else if (erIGang(v)) knap = "<p class='vc-info'>● Vises nu i biografen. Der kan ikke købes billetter mere.</p>";
    else if (erStartet(v)) knap = "<p class='vc-info'>Visningen er slut.</p>";
    else if (l <= 0) knap = "<button class='vc-stor-knap' disabled>Udsolgt · alle pladser er taget</button>";
    else knap = "<button class='vc-stor-knap' data-vc-koeb>🎟 Køb billet · " + PRIS + " ⭐</button>";
    el.innerHTML = topHtml(v.type === "event" ? "Arrangement" : "Film", "liste") +
      "<div class='tlf-indhold vc-app'>" + plakatHtml(v, true) +
      "<h2 class='vc-titel'>" + esc(v.titel) + "</h2>" +
      "<div class='vc-fakta'><span>📅 " + dagTekst(v.start) + "</span><span>🕒 kl. " + kl(v.start) + "</span><span>⏱ " + varighedTekst(v.varighed) + "</span></div>" +
      (v.tekst ? "<p class='vc-tekst'>" + esc(v.tekst).replace(/\n/g, "<br>") + "</p>" : "") +
      "<div class='vc-pladser'><div class='vc-bar'><i style='width:" + Math.round((ALLE_SAEDER - l) / ALLE_SAEDER * 100) + "%'></i></div>" +
      "<small>" + (l > 0 ? l + " af " + ALLE_SAEDER + " pladser ledige" : "Alle " + ALLE_SAEDER + " pladser er taget") + "</small></div>" +
      knap +
      "<button class='vc-lille-knap' data-vc-gaa>🚪 Gå til biografen</button></div>";
    const k = el.querySelector("[data-vc-koeb]");
    if (k) k.addEventListener("click", function () {
      side = "koeb"; valgtSaede = ""; koebFejl = "";
      if (!skrevetNavn) skrevetNavn = mig();
      tegnApp();
    });
    const m = el.querySelector("[data-vc-min]");
    if (m) m.addEventListener("click", function () { side = "billet"; tegnApp(); });
    el.querySelector("[data-vc-gaa]").addEventListener("click", gaaTilBio);
  }
  function gaaTilBio() {
    if (typeof gaaTilVaerelse === "function") gaaTilVaerelse("biograf");
    if (typeof window.lukTelefon === "function") window.lukTelefon();
  }

  function tegnKoeb(el, v) {
    el.innerHTML = topHtml("Vælg din plads", "visning") +
      "<div class='tlf-indhold vc-app'>" +
      "<div class='vc-koeb-titel'>" + plakatHtml(v) + "<div><b>" + esc(v.titel) + "</b><small>" + dagTekst(v.start) + " kl. " + kl(v.start) + "</small></div></div>" +
      "<div class='vc-sal'></div>" +
      "<label class='vc-navn'><small>Navn på billetten</small><input type='text' maxlength='30' placeholder='Skriv dit navn' value='" + esc(skrevetNavn) + "'></label>" +
      "<div class='vc-kurv'></div>" +
      "<p class='vc-fejl'" + (koebFejl ? "" : " hidden") + ">" + esc(koebFejl) + "</p>" +
      "<button class='vc-stor-knap' data-vc-bekraeft>Køb billet · " + PRIS + " ⭐</button>" +
      "<p class='vc-smaat'>Du kan kun købe 1 billet pr. person til hver visning.</p></div>";
    const inp = el.querySelector(".vc-navn input");
    inp.addEventListener("input", function () { skrevetNavn = inp.value; tegnKurv(); });
    el.querySelector("[data-vc-bekraeft]").addEventListener("click", koeb);
    tegnSalKort();
  }

  // Salen set oppefra: lærredet øverst, række A forrest
  function salHtml(optaget, valgt, navne, klik) {
    let h = "<div class='vc-laerred'><span>LÆRRED</span></div><div class='vc-raekker'>";
    RAEKKER.forEach(function (r) {
      h += "<div class='vc-raekke'><b>" + r + "</b>";
      for (let n = 1; n <= PR_RAEKKE; n++) {
        const id = r + n, tag = optaget.indexOf(id) >= 0, er = id === valgt;
        const titel = navne && navne[id] ? navne[id] : (tag ? "Optaget" : id);
        h += "<button type='button' class='vc-saede" + (tag ? " optaget" : "") + (er ? " valgt" : "") + "'" + (klik && !tag ? " data-vc-saede='" + id + "'" : " disabled") +
          " title='" + esc(titel) + "'>" + n + "</button>";
        if (n === PR_RAEKKE / 2) h += "<span class='vc-gang'></span>";
      }
      h += "<b>" + r + "</b></div>";
    });
    return h + "</div><div class='vc-forklaring'><span><i class='vc-saede'></i> Ledig</span><span><i class='vc-saede valgt'></i> Din</span><span><i class='vc-saede optaget'></i> Optaget</span></div>";
  }
  function tegnSalKort() {
    const el = appEl(), v = visning(valgtId);
    if (!el || !v) return;
    const sal = el.querySelector(".vc-sal");
    if (!sal) return;
    if ((v.optaget || []).indexOf(valgtSaede) >= 0) { valgtSaede = ""; koebFejl = "Det sæde blev lige taget af en anden. Vælg et nyt."; visKoebFejl(); }
    sal.innerHTML = salHtml(v.optaget || [], valgtSaede, null, true);
    sal.querySelectorAll("[data-vc-saede]").forEach(function (k) {
      k.addEventListener("click", function () { valgtSaede = k.dataset.vcSaede; koebFejl = ""; visKoebFejl(); tegnSalKort(); });
    });
    tegnKurv();
    if (ledige(v) <= 0) { koebFejl = "Der er udsolgt. Alle pladser er taget."; visKoebFejl(); }
  }
  function tegnKurv() {
    const el = appEl();
    const k = el && el.querySelector(".vc-kurv");
    if (!k) return;
    k.innerHTML = valgtSaede
      ? "<span>🎟 " + saedeNavn(valgtSaede) + "</span><b>" + PRIS + " ⭐</b>"
      : "<span class='vc-hint'>👆 Tryk på et ledigt sæde</span>";
    const b = el.querySelector("[data-vc-bekraeft]");
    if (b) b.disabled = koeber || !valgtSaede || !skrevetNavn.trim();
  }
  function visKoebFejl() {
    const el = appEl();
    const p = el && el.querySelector(".vc-fejl");
    if (p) { p.textContent = koebFejl; p.hidden = !koebFejl; }
  }
  function koeb() {
    const v = visning(valgtId);
    if (!v || koeber) return;
    if (!valgtSaede) { koebFejl = "Vælg et sæde først."; visKoebFejl(); return; }
    if (!skrevetNavn.trim()) { koebFejl = "Skriv dit navn på billetten."; visKoebFejl(); return; }
    if (typeof glimt !== "undefined" && glimt < PRIS) { koebFejl = "Du har ikke nok Glimt. En billet koster " + PRIS + " ⭐."; visKoebFejl(); return; }
    koeber = true;
    tegnKurv();
    try { if (typeof pengeSender !== "undefined") pengeSender = true; } catch (e) {}
    serverKald("hv_cinema_book", { p_token: token(), p_visning: v.id, p_saede: valgtSaede, p_navn: skrevetNavn.trim() }).then(function (svar) {
      koeber = false;
      try { pengeSender = false; } catch (e) {}
      opdaterPenge(svar);
      if (appApi && appApi.ding) try { appApi.ding(); } catch (e) {}
      // vis billetten med det samme, mens vi henter det nye program
      data.mine.push({ id: svar.id, visning_id: v.id, saede: svar.saede, navn: skrevetNavn.trim(), titel: v.titel, type: v.type,
        plakat: v.plakat, farve: v.farve, start: v.start, varighed: v.varighed });
      (v.optaget = v.optaget || []).push(svar.saede);
      side = "billet"; nyBillet = true;
      tegnApp();
      hent();
    }).catch(function (e) {
      koeber = false;
      try { pengeSender = false; } catch (e2) {}
      koebFejl = fejlTekst(e);
      visKoebFejl();
      tegnKurv();
      hent();
    });
  }

  let nyBillet = false;
  function tegnBilletSide(el) {
    const b = minBillet(valgtId), v = visning(valgtId);
    const kanAfbestille = v && !erStartet(v);
    el.innerHTML = topHtml("Din billet", nyBillet ? "liste" : (v ? "visning" : "liste")) +
      "<div class='tlf-indhold vc-app'>" +
      (nyBillet ? "<p class='vc-tak'>🎉 Tak for dit køb! Vi ses i biografen.</p>" : "") +
      billetHtml(b, false) +
      (b.kode ? "<div class='vc-scan-boks" + (b.scannet ? " ok" : "") + "'>" + stregkodeSvg(b.kode) + "<b>" + esc(b.kode) + "</b>" +
        "<small>" + (b.scannet ? "✅ Scannet kl. " + kl(b.scannet) + (b.scannet_af ? " af " + esc(b.scannet_af) : "") + " – du må sætte dig på plads " + esc(b.saede) + "."
          : "📟 Vis billetten til en ansat ved indgangen. Når den er scannet, kan du sætte dig.") + "</small></div>" : "") +
      "<p class='vc-smaat'>Find nummeret <b>" + esc(b.saede) + "</b> på sædet i biografen. Din plads lyser op, når du er derinde.</p>" +
      "<button class='vc-stor-knap' data-vc-gaa>🚪 Gå til biografen</button>" +
      (kanAfbestille ? "<button class='vc-lille-knap' data-vc-afbestil>✕ Afbestil (du får din Glimt tilbage)</button>" : "") +
      "<p class='vc-fejl' hidden></p></div>";
    nyBillet = false;
    el.querySelector("[data-vc-gaa]").addEventListener("click", gaaTilBio);
    const a = el.querySelector("[data-vc-afbestil]");
    if (a) a.addEventListener("click", function () {
      toKlik(a, function () {
        a.disabled = true;
        serverKald("hv_cinema_afbestil", { p_token: token(), p_visning: valgtId }).then(function (svar) {
          opdaterPenge(svar);
          data.mine = data.mine.filter(function (x) { return x.visning_id !== valgtId; });
          if (v) v.optaget = (v.optaget || []).filter(function (s) { return s !== b.saede; });
          side = "visning";
          tegnApp();
          hent();
        }).catch(function (e) {
          a.disabled = false;
          const p = el.querySelector(".vc-fejl");
          if (p) { p.textContent = fejlTekst(e); p.hidden = false; }
        });
      });
    });
  }


  // ---------------------------------------------------------------
  //  🎟 Ejerpanel → Vera-cinema (ejeren og de ansatte)
  // ---------------------------------------------------------------
  let pData = null, pFejl = "", pHenter = false;
  let pUnder = "program";       // program | bookinger
  let pValgt = null;            // visning, der vises bookinger for
  let pRet = null;              // visning, der rettes (eller {} = ny)

  function panelAabent() {
    return typeof ejerVindue !== "undefined" && !ejerVindue.hidden && typeof ejerFane !== "undefined" && ejerFane === "cinema";
  }
  function hentPersonale() {
    if (!online() || !maaStyre() || pHenter) return Promise.resolve();
    pHenter = true;
    return serverKald("hv_cinema_personale", { p_token: token() }).then(function (svar) {
      pHenter = false;
      const foer = pData ? pData.billetter.length : -1;
      pData = svar;
      if (svar.nu) tidForskel = svar.nu - Date.now();
      pFejl = "";
      if (panelAabent()) {
        saetSet();
        if (foer !== svar.billetter.length) opdaterPanel();
      }
    }).catch(function (e) {
      pHenter = false;
      pFejl = fejlTekst(e);
      if (panelAabent()) opdaterPanel();
    });
  }
  // nye bookinger, som personalet ikke har set endnu (rødt tal på fanen)
  function nyeBilletter() {
    if (!pData) return 0;
    let set = 0;
    try { set = +localStorage.getItem(SET_NOEGLE + "-" + mig()) || 0; } catch (e) {}
    return pData.billetter.filter(function (b) { return b.id > set; }).length;
  }
  function saetSet() {
    if (!pData || !pData.billetter.length) return;
    const max = Math.max.apply(null, pData.billetter.map(function (b) { return b.id; }));
    try { localStorage.setItem(SET_NOEGLE + "-" + mig(), String(max)); } catch (e) {}
  }
  setInterval(function () {
    if (!maaStyre()) return;
    if (panelAabent() || Date.now() - (hentPersonale.sidst || 0) > 30000) { hentPersonale.sidst = Date.now(); hentPersonale(); }
  }, 6000);
  setTimeout(function () { if (maaStyre()) hentPersonale(); }, 3500);

  vent(function () { return typeof visFane === "function" && typeof ejerIndhold !== "undefined" && document.getElementById("ejer-faner") && typeof rolleMaa === "function" && typeof ROLLE_FANER !== "undefined"; }, function () {
    function giv() { Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("cinema") < 0) ROLLE_FANER[r].push("cinema"); }); }
    giv();
    setInterval(giv, 3000);
    const knap = document.createElement("button");
    knap.dataset.fane = "cinema";
    knap.innerHTML = "🎟 Vera-cinema";
    knap.addEventListener("click", function () { ejerFane = "cinema"; visFane(); });
    const faner = document.getElementById("ejer-faner");
    const efter = faner.querySelector('[data-fane="biograf"]');
    if (efter) efter.after(knap); else faner.appendChild(knap);
    function synlig() {
      knap.hidden = !(maaStyre() && rolleMaa("cinema"));
      const n = panelAabent() ? 0 : nyeBilletter();
      const ny = "🎟 Vera-cinema" + (n ? "<span class='vc-tal'>" + n + "</span>" : "");
      if (knap.innerHTML !== ny) knap.innerHTML = ny;
    }
    synlig();
    setInterval(synlig, 1500);

    const visFaneFoerCinema = visFane;
    visFane = function () {
      const min = ejerFane === "cinema";
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerCinema();
      knap.classList.toggle("valgt", min);
      if (ejerVindue.hidden || !min || !maaStyre()) return;
      ejerIndhold.innerHTML = "<div id='vc-panel'></div>";
      tegnPanel();
      hentPersonale();
    };
  });

  function opdaterPanel() { if (panelAabent() && document.getElementById("vc-panel")) tegnPanel(); }

  function tegnPanel() {
    const sek = document.getElementById("vc-panel");
    if (!sek) return;
    // rør ikke formularen, mens nogen skriver i den
    if (pRet && sek.querySelector(".vc-form") && sek.contains(document.activeElement)) return;
    const under = [["program", "🗓 Program"], ["bookinger", "🎟 Bookinger"], ["scanner", "📟 Scanner"], ["kiosk", "🍿 Kiosk"]];
    const kommende = pData ? pData.program.filter(function (v) { return v.start + v.varighed * 60000 > nu(); }) : [];
    const solgtNu = kommende.reduce(function (s, v) { return s + (v.optaget || []).length; }, 0);
    sek.innerHTML = "<div class='vc-p-top'><div class='vc-p-logo'><b>VERA</b><span>CINEMA</span></div>" +
      "<div class='vc-p-tal'><div><b>" + kommende.length + "</b><small>på programmet</small></div>" +
      "<div><b>" + solgtNu + "</b><small>billetter solgt</small></div>" +
      "<div><b>" + (pData ? pData.glimt_ialt : 0) + " ⭐</b><small>tjent i alt</small></div></div></div>" +
      "<div class='vc-p-under'>" + under.map(function (u) {
        return "<button type='button' data-vc-under='" + u[0] + "'" + (u[0] === pUnder ? " class='valgt'" : "") + ">" + u[1] + "</button>";
      }).join("") + "</div>" +
      (pFejl ? "<p class='vc-p-fejl'>" + esc(pFejl) + "</p>" : "") +
      "<div class='vc-p-krop'></div>";
    sek.querySelectorAll("[data-vc-under]").forEach(function (b) {
      b.addEventListener("click", function () { pUnder = b.dataset.vcUnder; pRet = null; tegnPanel(); });
    });
    const krop = sek.querySelector(".vc-p-krop");
    if (!pData) { krop.innerHTML = pFejl ? "" : "<p>Henter …</p>"; return; }
    if (pUnder === "scanner") { krop.innerHTML = "<p>Scanneren åbner som en lille håndscanner, du kan flytte rundt. Har du en rigtig stregkodescanner (USB), virker den også: klik i feltet, og scan billetten på gæstens skærm.</p><button type='button' class='lv-knap' data-vc-aabn-scanner>📟 Åbn scanneren</button>"; krop.querySelector("[data-vc-aabn-scanner]").addEventListener("click", function () { aabnScanner(); }); return; }
    if (pUnder === "kiosk") { tegnPKiosk(krop); return; }
    if (pUnder === "program") tegnPProgram(krop);
    else tegnPBookinger(krop);
  }

  // 🍿 Kiosken i Biografens forhal (js/biograf-forhal.js, database-48)
  let kData = null, kFejl = "", kHentet = 0;
  function tegnPKiosk(krop) {
    const vis = function () {
      if (kFejl) { krop.innerHTML = "<p class='vc-p-fejl'>" + esc(kFejl) + "</p>"; return; }
      if (!kData) { krop.innerHTML = "<p>Henter …</p>"; return; }
      const idag = kData.idag || {};
      const tegn = { popcorn: "🍿", sodavand: "🥤", slik: "🍬" };
      krop.innerHTML = "<p>Kiosken står i <b>Biografens forhal</b>. Gæsterne klikker på kiosken, slikvæggen eller sodavandsskabet og betaler 1 Glimt.</p>" +
        "<div class='vc-p-tal'>" + ["popcorn", "sodavand", "slik"].map(function (v) {
          return "<div><b>" + tegn[v] + " " + (idag[v] || 0) + "</b><small>" + v + " i dag</small></div>";
        }).join("") + "<div><b>" + (kData.glimt_ialt || 0) + " ⭐</b><small>tjent i alt</small></div></div>" +
        "<h4 style='margin:12px 0 6px'>Seneste salg</h4>" +
        ((kData.seneste || []).length ? "<table><tr><th>Hvem</th><th>Hvad</th><th>Hvornår</th></tr>" + kData.seneste.map(function (r) {
          const d = new Date(r.tid);
          return "<tr><td>" + esc(r.navn || "") + "</td><td>" + (tegn[r.vare] || "") + " " + esc(r.vare) + "</td><td>" + d.getDate() + "/" + (d.getMonth() + 1) + " kl. " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + "</td></tr>";
        }).join("") + "</table>" : "<p>Der er ikke solgt noget endnu.</p>");
    };
    vis();
    if (Date.now() - kHentet < 5000 || !online()) return;
    kHentet = Date.now();
    serverKald("hv_cinema_kiosk_status", { p_token: token() }).then(function (svar) {
      kData = svar; kFejl = "";
      if (pUnder === "kiosk" && krop.isConnected) vis();
    }).catch(function (e) {
      kFejl = /hv_cinema_kiosk/.test(fejlTekst(e)) ? "Kør database-48-biograf-forhal.sql i Supabase, så kiosken virker." : fejlTekst(e);
      if (pUnder === "kiosk" && krop.isConnected) vis();
    });
  }

  function tegnPProgram(krop) {
    if (pRet) { tegnPForm(krop); return; }
    const liste = pData.program.slice().sort(function (a, b) { return a.start - b.start; });
    const kommende = liste.filter(function (v) { return v.start + v.varighed * 60000 > nu(); });
    const tidligere = liste.filter(function (v) { return v.start + v.varighed * 60000 <= nu(); }).reverse();
    function raekke(v, gammel) {
      const solgt = (v.optaget || []).length;
      return "<li class='vc-p-vis" + (gammel ? " gammel" : "") + "'>" + plakatHtml(v) +
        "<div><b>" + esc(v.titel) + "</b> <span class='vc-p-type'>" + (v.type === "event" ? "🎉 Arrangement" : "🎬 Film") + "</span>" +
        "<small>" + dagTekst(v.start) + " kl. " + kl(v.start) + " · " + varighedTekst(v.varighed) + (erIGang(v) ? " · <b class='vc-p-nu'>● Vises nu</b>" : "") + "</small>" +
        "<div class='vc-bar'><i style='width:" + Math.round(solgt / ALLE_SAEDER * 100) + "%'></i></div><small>" + solgt + " af " + ALLE_SAEDER + " solgt" + (solgt >= ALLE_SAEDER ? " · UDSOLGT" : "") + "</small></div>" +
        "<div class='vc-p-knapper'>" +
        "<button type='button' class='lv-knap' data-vc-se='" + v.id + "'>🎟 Bookinger</button>" +
        (v.youtube ? "<button type='button' class='lv-knap' data-vc-start='" + v.id + "'>▶ Start filmen</button>" : "") +
        (!gammel ? "<button type='button' class='lv-knap' data-vc-ret='" + v.id + "'>✏️ Ret</button>" : "") +
        "<button type='button' class='lv-knap vc-p-slet' data-vc-slet='" + v.id + "'>" + (gammel ? "🗑 Slet" : "✕ Aflys") + "</button></div></li>";
    }
    krop.innerHTML = "<button type='button' class='lv-knap vc-p-ny' data-vc-ny>➕ Læg en film eller et arrangement i programmet</button>" +
      "<h4>Kommende</h4>" + (kommende.length ? "<ul class='vc-p-liste'>" + kommende.map(function (v) { return raekke(v, false); }).join("") + "</ul>"
        : "<p class='vc-p-tom'>Programmet er tomt. Tryk ➕ for at lægge den første film ind.</p>") +
      (tidligere.length ? "<details class='vc-p-tidl'><summary>Tidligere (30 dage) · " + tidligere.length + "</summary><ul class='vc-p-liste'>" +
        tidligere.map(function (v) { return raekke(v, true); }).join("") + "</ul></details>" : "");
    krop.querySelector("[data-vc-ny]").addEventListener("click", function () { pRet = {}; tegnPanel(); });
    krop.querySelectorAll("[data-vc-ret]").forEach(function (k) {
      k.addEventListener("click", function () { pRet = pData.program.find(function (v) { return v.id === +k.dataset.vcRet; }) || null; tegnPanel(); });
    });
    krop.querySelectorAll("[data-vc-se]").forEach(function (k) {
      k.addEventListener("click", function () { pValgt = +k.dataset.vcSe; pUnder = "bookinger"; tegnPanel(); });
    });
    krop.querySelectorAll("[data-vc-start]").forEach(function (k) {
      k.addEventListener("click", function () {
        const v = pData.program.find(function (x) { return x.id === +k.dataset.vcStart; });
        if (!v || typeof visFilm !== "function") return;
        const her = typeof iBiografen === "function" && iBiografen();
        if (!her && typeof gaaTilVaerelse === "function") gaaTilVaerelse("biograf");
        setTimeout(function () { if (typeof iBiografen !== "function" || iBiografen()) visFilm(v.youtube); }, her ? 0 : 500);
        toast("🎬 " + v.titel + " starter i biografen");
      });
    });
    krop.querySelectorAll("[data-vc-slet]").forEach(function (k) {
      k.addEventListener("click", function () {
        toKlik(k, function () {
          k.disabled = true;
          serverKald("hv_cinema_slet", { p_token: token(), p_id: +k.dataset.vcSlet }).then(function (svar) {
            toast(svar && svar.tilbage ? "Aflyst · " + svar.tilbage + " gæster har fået deres Glimt tilbage" : "Fjernet fra programmet");
            return hentPersonale();
          }).then(function () { tegnPanel(); hent(); }).catch(function (e) { pFejl = fejlTekst(e); tegnPanel(); });
        });
      });
    });
  }

  function tegnPForm(krop) {
    const v = pRet || {};
    const ny = !v.id;
    const d = v.start ? new Date(v.start) : (function () { const x = new Date(); x.setHours(x.getHours() + 2, 0, 0, 0); return x; })();
    const datoV = d.getFullYear() + "-" + to(d.getMonth() + 1) + "-" + to(d.getDate());
    const klV = to(d.getHours()) + ":" + to(d.getMinutes());
    const type = v.type || "film", plakat = v.plakat || "🎬", farve = v.farve || FARVER[0];
    krop.innerHTML = "<form class='vc-form'>" +
      "<h4>" + (ny ? "➕ Ny i programmet" : "✏️ Ret " + esc(v.titel)) + "</h4>" +
      "<div class='vc-f-type'><label><input type='radio' name='vc-type' value='film'" + (type === "film" ? " checked" : "") + "> 🎬 Film</label>" +
      "<label><input type='radio' name='vc-type' value='event'" + (type === "event" ? " checked" : "") + "> 🎉 Arrangement</label></div>" +
      "<label>Titel<input name='titel' maxlength='60' required value='" + esc(v.titel || "") + "' placeholder='Fx Løvernes Konge'></label>" +
      "<div class='vc-f-linje'><label>Dato<input type='date' name='dato' required value='" + datoV + "'></label>" +
      "<label>Klokken<input type='time' name='kl' required value='" + klV + "'></label>" +
      "<label>Varighed (min)<input type='number' name='varighed' min='5' max='600' value='" + (v.varighed || 120) + "'></label></div>" +
      "<label>Beskrivelse<textarea name='tekst' maxlength='600' rows='3' placeholder='Hvad handler filmen om? Er der popcorn, quiz eller præmier?'>" + esc(v.tekst || "") + "</textarea></label>" +
      "<label>YouTube-link til filmen (kan udfyldes senere)<input name='youtube' maxlength='300' value='" + esc(v.youtube || "") + "' placeholder='https://www.youtube.com/watch?v=…'></label>" +
      "<div class='vc-f-valg'><span>Plakat</span>" + PLAKATER.map(function (p) {
        return "<button type='button' data-vc-plakat='" + p + "'" + (p === plakat ? " class='valgt'" : "") + ">" + p + "</button>";
      }).join("") + "</div>" +
      "<div class='vc-f-valg'><span>Farve</span>" + FARVER.map(function (f) {
        return "<button type='button' class='vc-f-farve" + (f === farve ? " valgt" : "") + "' data-vc-farve='" + f + "' style='background:" + f + "'></button>";
      }).join("") + "</div>" +
      "<p class='vc-smaat'>En billet koster " + PRIS + " Glimt ⭐. Salen har " + ALLE_SAEDER + " pladser (A1–D8).</p>" +
      "<p class='vc-p-fejl' hidden></p>" +
      "<div class='vc-f-knapper'><button type='submit' class='lv-knap'>" + (ny ? "➕ Læg i programmet" : "💾 Gem") + "</button>" +
      "<button type='button' class='lv-knap' data-vc-annuller>Annullér</button></div></form>";
    const form = krop.querySelector("form");
    let valgtPlakat = plakat, valgtFarve = farve;
    form.querySelectorAll("[data-vc-plakat]").forEach(function (b) {
      b.addEventListener("click", function () {
        valgtPlakat = b.dataset.vcPlakat;
        form.querySelectorAll("[data-vc-plakat]").forEach(function (x) { x.classList.toggle("valgt", x === b); });
      });
    });
    form.querySelectorAll("[data-vc-farve]").forEach(function (b) {
      b.addEventListener("click", function () {
        valgtFarve = b.dataset.vcFarve;
        form.querySelectorAll("[data-vc-farve]").forEach(function (x) { x.classList.toggle("valgt", x === b); });
      });
    });
    form.querySelector("[data-vc-annuller]").addEventListener("click", function () { pRet = null; tegnPanel(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const fejlEl = form.querySelector(".vc-p-fejl");
      const f = new FormData(form);
      const start = new Date(f.get("dato") + "T" + f.get("kl")).getTime();
      if (!f.get("titel").trim()) { fejlEl.textContent = "Skriv en titel."; fejlEl.hidden = false; return; }
      if (!start) { fejlEl.textContent = "Vælg dato og klokkeslæt."; fejlEl.hidden = false; return; }
      if (ny && start < nu()) { fejlEl.textContent = "Tidspunktet er allerede gået. Vælg et tidspunkt frem i tiden."; fejlEl.hidden = false; return; }
      const yt = String(f.get("youtube") || "").trim();
      if (yt && typeof youtubeId === "function" && !youtubeId(yt)) { fejlEl.textContent = "Det ligner ikke et YouTube-link. Prøv at kopiere linket igen."; fejlEl.hidden = false; return; }
      const knap = form.querySelector("[type=submit]");
      knap.disabled = true;
      serverKald("hv_cinema_gem", { p_token: token(), p_id: v.id || null, p_data: {
        type: form.querySelector("[name=vc-type]:checked").value, titel: f.get("titel").trim(), start: start,
        varighed: +f.get("varighed") || 120, tekst: String(f.get("tekst") || "").trim(), youtube: yt,
        plakat: valgtPlakat, farve: valgtFarve, pris: PRIS } }).then(function () {
        pRet = null;
        toast(ny ? "🎬 Lagt i programmet" : "💾 Gemt");
        if (document.activeElement) try { document.activeElement.blur(); } catch (e2) {}
        return hentPersonale();
      }).then(function () { tegnPanel(); hent(); }).catch(function (e2) {
        knap.disabled = false;
        fejlEl.textContent = fejlTekst(e2); fejlEl.hidden = false;
      });
    });
  }

  function tegnPBookinger(krop) {
    const liste = pData.program.slice().sort(function (a, b) {
      const ak = a.start + a.varighed * 60000 > nu(), bk = b.start + b.varighed * 60000 > nu();
      return ak !== bk ? (ak ? -1 : 1) : (ak ? a.start - b.start : b.start - a.start);
    });
    if (!liste.length) { krop.innerHTML = "<p class='vc-p-tom'>Der er ingen visninger endnu. Læg en film i 🗓 Program først.</p>"; return; }
    if (!pValgt || !liste.some(function (v) { return v.id === pValgt; })) pValgt = liste[0].id;
    const v = liste.find(function (x) { return x.id === pValgt; });
    const billetter = pData.billetter.filter(function (b) { return b.visning_id === v.id; }).sort(function (a, b) { return a.saede < b.saede ? -1 : 1; });
    const navne = {};
    billetter.forEach(function (b) { navne[b.saede] = b.saede + ": " + b.navn + (b.navn.toLowerCase() !== b.spiller.toLowerCase() ? " (" + b.spiller + ")" : ""); });
    const nyeFra = (function () { try { return +localStorage.getItem(SET_NOEGLE + "-vist-" + mig()) || 0; } catch (e) { return 0; } })();
    krop.innerHTML = "<label class='vc-p-vaelg'>Visning <select>" + liste.map(function (x) {
      return "<option value='" + x.id + "'" + (x.id === v.id ? " selected" : "") + ">" + esc((x.plakat || "") + " " + x.titel + " · " + dagTekst(x.start) + " kl. " + kl(x.start)) +
        " (" + (x.optaget || []).length + "/" + ALLE_SAEDER + ")</option>";
    }).join("") + "</select></label>" +
      "<div class='vc-p-bk'><div class='vc-p-sal'>" + salHtml(billetter.map(function (b) { return b.saede; }), "", navne, false) + "</div>" +
      "<div class='vc-p-bk-liste'><h4>" + billetter.length + " af " + ALLE_SAEDER + " pladser booket" + (billetter.length >= ALLE_SAEDER ? " · UDSOLGT" : "") + "</h4>" +
      (billetter.length ? "<table><tr><th>Sæde</th><th>Navn på billet</th><th>Spiller</th><th>Købt</th><th>Scannet</th><th></th></tr>" + billetter.map(function (b) {
        return "<tr" + (b.id > nyeFra ? " class='ny'" : "") + "><td><b>" + esc(b.saede) + "</b></td><td>" + esc(b.navn) + "</td><td>" + esc(b.spiller) + "</td>" +
          "<td>" + dagTekst(b.tid) + " " + kl(b.tid) + "</td>" +
          "<td>" + (b.scannet ? "✅ " + kl(b.scannet) + " <button type='button' class='lv-knap' data-vc-fortryd='" + b.id + "' title='Fortryd scanningen'>↩</button>"
            : "<button type='button' class='lv-knap' data-vc-scan='" + esc(b.kode || "") + "'>📟 Scan</button>") + "</td>" +
          "<td><button type='button' class='lv-knap vc-p-slet' data-vc-fjern='" + b.id + "' title='Fjern billetten (gæsten får sin Glimt tilbage)'>✕</button></td></tr>";
      }).join("") + "</table>" : "<p class='vc-p-tom'>Ingen har booket endnu.</p>") + "</div></div>";
    try { const max = Math.max.apply(null, pData.billetter.map(function (b) { return b.id; }).concat([0])); localStorage.setItem(SET_NOEGLE + "-vist-" + mig(), String(max)); } catch (e) {}
    krop.querySelector("select").addEventListener("change", function (e) { pValgt = +e.target.value; tegnPanel(); });
    krop.querySelectorAll("[data-vc-scan]").forEach(function (k) { k.addEventListener("click", function () { scan(k.dataset.vcScan); }); });
    krop.querySelectorAll("[data-vc-fortryd]").forEach(function (k) { k.addEventListener("click", function () { fortrydScan(+k.dataset.vcFortryd); }); });
    krop.querySelectorAll("[data-vc-fjern]").forEach(function (k) {
      k.addEventListener("click", function () {
        toKlik(k, function () {
          k.disabled = true;
          serverKald("hv_cinema_billet_fjern", { p_token: token(), p_billet: +k.dataset.vcFjern }).then(function () {
            toast("Billetten er fjernet, og gæsten har fået sin Glimt tilbage");
            return hentPersonale();
          }).then(function () { tegnPanel(); hent(); }).catch(function (e) { pFejl = fejlTekst(e); tegnPanel(); });
        });
      });
    });
  }

  // Guide-teksten (📘 Guide i panelet)
  vent(function () { return typeof PANEL_HJAELP !== "undefined"; }, function () {
    PANEL_HJAELP.cinema = { titel: "🎟 Vera-cinema",
      tekst: "Biografens billetkontor. Gæsterne ser programmet og køber billetter i appen Vera-cinema på telefonen. Alt, hvad de booker, kommer herind.",
      punkter: ["<b>🗓 Program</b>: tryk ➕ og vælg Film eller Arrangement, titel, dato, klokkeslæt og en plakat. Du kan også sætte filmens YouTube-link ind.",
        "En billet koster 1 Glimt. Hver gæst kan kun købe 1 billet pr. visning, og når alle 32 sæder (A1–D8) er taget, er der udsolgt.",
        "<b>🎟 Bookinger</b>: se hvem der sidder hvor. Hold musen over et sæde for at se navnet. ✕ fjerner en billet, og gæsten får sin Glimt tilbage.",
        "<b>▶ Start filmen</b> tager dig til biografen og sætter filmen på lærredet for alle.",
        "<b>✕ Aflys</b> fjerner visningen, og alle med billet får deres Glimt tilbage.",
        "I biografen står nummeret på hvert sæde, så gæsterne kan finde deres plads."] };
  });


  // ---------------------------------------------------------------
  //  🍿 Det nye job: Biograf medhjælper
  // ---------------------------------------------------------------
  const BM_SKILT = "biografhjaelper";
  const BM_JOB_KAN = ["🎟 Får 🛡-knappen med fanen 🎟 Vera-cinema (program, bookinger og scanner)",
    "📟 Får billetscanneren og scanner gæsternes billetter, når de kommer ind i biografen",
    "🪑 Hjælper gæsterne med at finde deres plads",
    "🗓 Kan lægge film og arrangementer i programmet og starte filmen",
    "💼 Får løn hver mandag som de andre ansatte"];
  vent(function () { return typeof SKILTE !== "undefined" && typeof ANSAT_SKILTE !== "undefined"; }, function () {
    if (!SKILTE.some(function (s) { return s.id === BM_SKILT; })) {
      let efter = SKILTE.findIndex(function (s) { return s.id === "radiovaert"; });
      if (efter < 0) efter = SKILTE.findIndex(function (s) { return s.id === "eventvaert"; });
      SKILTE.splice(efter + 1, 0, { id: BM_SKILT, navn: "Biograf medhjælper", tekst: "Scanner billetter og hjælper gæsterne i biografen.",
        fil: "billeder/skilte/biograf-medhjaelper.png" });
    }
    if (ANSAT_SKILTE.indexOf(BM_SKILT) < 0) ANSAT_SKILTE.push(BM_SKILT);
    if (typeof JOB_KAN !== "undefined") JOB_KAN[BM_SKILT] = BM_JOB_KAN.concat(typeof PERSONALE_KAN !== "undefined" ? PERSONALE_KAN : []);
  });
  vent(function () { return typeof JOB_BESKRIVELSE !== "undefined" && typeof SKILTE !== "undefined"; }, function () {
    JOB_BESKRIVELSE[BM_SKILT] = "Som biograf medhjælper står du ved døren til biografen og scanner gæsternes billetter med billetscanneren 📟. Gæsterne kan først sætte sig, når billetten er scannet. Du hjælper dem med at finde deres plads, holder øje med bookingerne i Vera-cinema og kan starte filmen.";
    SKILTE.forEach(function (sk) { if (sk.id === BM_SKILT) sk.beskrivelse = JOB_BESKRIVELSE[BM_SKILT]; });
  });
  vent(function () { return typeof ROLLE_FANER !== "undefined" && typeof ROLLE_NAVN !== "undefined"; }, function () {
    function giv() {
      const fra = (ROLLE_FANER.staff || ["guide", "mitjob", "staffchat"]).filter(function (f) { return f !== "beskeder"; });
      if (!ROLLE_FANER[BM_SKILT]) ROLLE_FANER[BM_SKILT] = [];
      const l = ROLLE_FANER[BM_SKILT];
      fra.concat(["cinema", "biograf"]).forEach(function (f) { if (l.indexOf(f) < 0) l.push(f); });
      if (l.indexOf("guide") > 0) { l.splice(l.indexOf("guide"), 1); l.unshift("guide"); }
      ROLLE_NAVN[BM_SKILT] = "🛡️ Biograf-panel";
    }
    giv();
    setInterval(giv, 2000);
  });
  vent(function () { return typeof ROLLE_GUIDE !== "undefined"; }, function () {
    ROLLE_GUIDE[BM_SKILT] = "Du er biograf medhjælper. Gå til biografen og tryk 📟 Billetscanner øverst til højre. Scan gæsternes billetter, når de kommer ind. I fanen 🎟 Vera-cinema ser du programmet og hvem der sidder hvor.";
  });
  vent(function () { return typeof STAFF_RANG !== "undefined"; }, function () {
    if (STAFF_RANG.some(function (r) { return r[0] === BM_SKILT; })) return;
    const i = STAFF_RANG.findIndex(function (r) { return r[0] === "andet"; });
    STAFF_RANG.splice(i < 0 ? STAFF_RANG.length : i, 0, [BM_SKILT, "🍿 Biograf medhjælper"]);
  });
  vent(function () { return typeof VS_KATEGORIER !== "undefined"; }, function () {
    if (!VS_KATEGORIER.some(function (k) { return k[0] === BM_SKILT; })) VS_KATEGORIER.push([BM_SKILT, "🍿", "Biograf medhjælper"]);
    if (typeof JOB_KAN !== "undefined" && JOB_KAN[BM_SKILT] && JOB_KAN[BM_SKILT].indexOf("📅 Kan skrive sig på vagter i vagtskemaet") < 0) JOB_KAN[BM_SKILT].push("📅 Kan skrive sig på vagter i vagtskemaet");
  });


  // ---------------------------------------------------------------
  //  🪑 Numre på sæderne i biografen + din egen plads lyser op
  // ---------------------------------------------------------------
  function iBio() { return typeof rumValg !== "undefined" && rumValg === "vaerelse" && typeof aktivtVaerelse !== "undefined" && aktivtVaerelse === "biograf"; }
  // Biografens forhal (js/biograf-forhal.js)
  function iForhal() { return typeof rumValg !== "undefined" && rumValg === "vaerelse" && typeof aktivtVaerelse !== "undefined" && aktivtVaerelse === "bioforhal"; }
  // Må man gå gennem dørene ind i salen? (bruges af js/biograf-forhal.js)
  window.vcDoerTjek = function () {
    if (maaStyre()) return { ok: true, personale: true };
    if (!online() || !data) return { ok: true };
    const v = aktivVisning(data.program);
    if (!v) return { ok: true };
    const b = data.mine.find(function (x) { return x.visning_id === v.id; });
    if (!b) return { ok: false, grund: "billet", tekst: "🎟 Du skal have en billet til " + v.titel + " for at komme ind i salen. Køb den i appen Vera-cinema på telefonen.", visning: v };
    if (!b.scannet) return { ok: false, grund: "scan", tekst: "📟 Vis din billet ved billetpulten. En ansat scanner den, og så åbner dørene ind til salen.", visning: v, billet: b };
    return { ok: true, billet: b, visning: v };
  };
  window.vcHent = function () { hent.sidst = Date.now(); return hent(); };
  // Den billet, der gælder nu: visningen er i dag (eller starter inden for 3 timer), eller kører lige nu
  function billetNu() {
    if (!data) return null;
    const t = nu();
    return data.mine.filter(function (b) { return (b.start - 3 * 3600000 < t || new Date(b.start).toDateString() === new Date(t).toDateString()) && t < b.start + b.varighed * 60000; })
      .sort(function (a, b) { return a.start - b.start; })[0] || null;
  }
  // Sæderne i rummet får numre: rækkerne (forfra) A, B, C, D og sæderne 1-8 fra venstre (set fra den, der sidder)
  let numreNoegle = "", numre = {};
  function saedeNumre() {
    if (typeof moeblerIRummet === "undefined") return {};
    const saeder = moeblerIRummet.filter(function (m) { return m.type === "bio-saede"; });
    const noegle = saeder.map(function (m) { return m.x + "," + m.y; }).join(";");
    if (noegle === numreNoegle) return numre;
    numreNoegle = noegle;
    numre = {};
    const ys = saeder.map(function (m) { return m.y; }).filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return a - b; });
    ys.slice(0, RAEKKER.length).forEach(function (y, ri) {
      saeder.filter(function (m) { return m.y === y; }).sort(function (a, b) { return a.x - b.x; }).slice(0, PR_RAEKKE)
        .forEach(function (m, i) { numre[m.x + "," + m.y] = RAEKKER[ri] + (i + 1); });
    });
    return numre;
  }
  function tegnSkilt(c, cx, cy, tekst, min) {
    c.save();
    c.font = "bold 9px Verdana, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    const w = Math.max(16, c.measureText(tekst).width + 7), h = 11;
    const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    if (min) { c.shadowColor = "#ffd76a"; c.shadowBlur = 10; }
    c.fillStyle = min ? "#ffd76a" : "rgba(35, 6, 12, 0.92)";
    c.strokeStyle = min ? "#fff3c4" : "#d9a441";
    c.lineWidth = 1;
    c.beginPath();
    if (c.roundRect) c.roundRect(x + 0.5, y + 0.5, w, h, 3); else c.rect(x + 0.5, y + 0.5, w, h);
    c.fill();
    c.shadowBlur = 0;
    c.stroke();
    c.fillStyle = min ? "#4a1622" : "#f7dfa0";
    c.fillText(tekst, cx + 0.5, cy + 1);
    c.restore();
  }
  function tegnNummer(c, type, cx, cy) {
    if (!type || type.id !== "bio-saede" || c !== ctx || !iBio()) return;
    try {
      const nr = saedeNumre();
      const m = moeblerIRummet.find(function (x) {
        if (x.type !== "bio-saede") return false;
        const p = moebelSted(type, x.x, x.y, typeof drejetTvaers === "function" ? drejetTvaers(x) : false);
        return Math.abs(p.x - cx) < 1 && Math.abs(p.y - cy) < 1;
      });
      const navn = m && nr[m.x + "," + m.y];
      if (!navn) return;
      const b = billetNu();
      const min = !!b && b.saede === navn;
      tegnSkilt(c, cx - 13, cy - 32, navn, min);
      if (min) {
        // din plads lyser: pulserende guldskær om sædet
        const p = 0.5 + 0.5 * Math.sin(Date.now() / 260);
        c.save();
        c.globalCompositeOperation = "lighter";
        const g = c.createRadialGradient(cx, cy - 16, 2, cx, cy - 16, 44);
        g.addColorStop(0, "rgba(255,215,106," + (0.45 + 0.25 * p) + ")");
        g.addColorStop(1, "rgba(255,215,106,0)");
        c.fillStyle = g;
        c.beginPath(); c.ellipse(cx, cy - 16, 46, 36, 0, 0, Math.PI * 2); c.fill();
        c.restore();
        // en lille guldpil over din plads
        const t = (Date.now() / 300) % (Math.PI * 2);
        const y = cy - 92 + Math.sin(t) * 3;
        c.save();
        c.fillStyle = "#ffd76a"; c.strokeStyle = "#7a1b2b"; c.lineWidth = 1.5;
        const ax = cx - 13;
        c.beginPath(); c.moveTo(ax, y + 9); c.lineTo(ax - 7, y); c.lineTo(ax - 3, y); c.lineTo(ax - 3, y - 7); c.lineTo(ax + 3, y - 7); c.lineTo(ax + 3, y); c.lineTo(ax + 7, y); c.closePath();
        c.fill(); c.stroke();
        c.restore();
      }
    } catch (e) {}
  }
  // Nummeret tegnes lige efter sædet. Andre filer (fx js/realistisk.js) pakker også tegnMoebel ind og
  // tegner sæderne selv, så vi sørger for altid at ligge yderst (tjekkes hvert halve sekund).
  let iNummer = false;
  function pakInd() {
    if (typeof tegnMoebel !== "function" || typeof moebelSted !== "function" || typeof ctx === "undefined") return;
    if (tegnMoebel.vcNummer) return;
    const foer = tegnMoebel;
    const ny = function (c, type, cx, cy) {
      if (iNummer) return foer.apply(this, arguments);      // vi er allerede i gang længere ude
      iNummer = true;
      let svar;
      try { svar = foer.apply(this, arguments); } finally { iNummer = false; }
      tegnNummer(c, type, cx, cy);
      return svar;
    };
    ny.vcNummer = true;
    tegnMoebel = ny;
  }
  pakInd();
  setInterval(pakInd, 500);

  // Når man kommer ind i salen med en billet, flyttes udsnittet, så ens plads kan ses (ellers ligger de bageste rækker uden for skærmen)
  let varIBio = false;
  function panTilPlads() {
    try {
      const b = billetNu();
      if (!b) return;
      const nr = saedeNumre();
      const noegle = Object.keys(nr).find(function (k) { return nr[k] === b.saede; });
      if (!noegle) return;
      const xy = noegle.split(",").map(Number);
      const p = punkt(xy[0] + 0.5, xy[1] + 0.5);
      const maalY = HOEJDE * 0.55;
      KAMERA.y += (maalY - p.y) * ZOOM;
      KAMERA.x += (BREDDE * 0.4 - p.x) * ZOOM;
    } catch (e) {}
  }
  setInterval(function () {
    const nu_ = iBio();
    if (nu_ && !varIBio && data && !maaStyre()) setTimeout(panTilPlads, 600);
    if (nu_ !== varIBio && (nu_ || !iBio())) varIBio = nu_;
  }, 400);

  // Lille skilt øverst på skærmen: "Din plads: D7", så man altid kan se, hvor man skal sidde
  const pladsSkilt = document.createElement("div");
  pladsSkilt.id = "vc-plads";
  pladsSkilt.hidden = true;
  document.body.appendChild(pladsSkilt);
  setInterval(function () {
    let vis = false;
    try {
      if ((iBio() || iForhal()) && !maaStyre()) {
        const b = billetNu();
        if (b) {
          vis = true;
          const tekst = "🎟 Din plads: <b>" + esc(saedeNavn(b.saede)) + "</b>" + (b.scannet ? " <span class='ok'>✓ scannet</span>" : " <span class='ikke'>📟 skal scannes</span>");
          if (pladsSkilt.dataset.t !== tekst) { pladsSkilt.dataset.t = tekst; pladsSkilt.innerHTML = tekst; }
        }
      }
    } catch (e) {}
    if (pladsSkilt.hidden === vis) pladsSkilt.hidden = !vis;
  }, 700);
  // Når man går ind i biografen med en billet: sig hvor man skal sidde
  let sidstIBio = false;
  setInterval(function () {
    const her = iBio();
    if (her && !sidstIBio) {
      const b = billetNu();
      setTimeout(function () {
        try { if (b && iBio() && typeof besked !== "undefined") besked.textContent = "🎟 Velkommen til " + b.titel + "! Din plads er " + saedeNavn(b.saede) + " – den lyser op med en guldpil."; } catch (e) {}
      }, 2500);
    }
    sidstIBio = her;
  }, 1000);


  // ---------------------------------------------------------------
  //  📼 Kø af YouTube-film i biografen (ejeren og de ansatte)
  //  Sæt så mange links i kø, som du vil. Når en film slutter, starter den næste af sig selv.
  //  Køen ligger på den computer, der styrer filmen (den, der satte filmene i kø).
  // ---------------------------------------------------------------
  const KOE_NOEGLE = "mit-hotel-bio-koe";
  let bioKoe = [];
  try { bioKoe = JSON.parse(localStorage.getItem(KOE_NOEGLE) || "[]") || []; } catch (e) { bioKoe = []; }
  function gemKoe() { try { localStorage.setItem(KOE_NOEGLE, JSON.stringify(bioKoe)); } catch (e) {} tegnAlleKoeer(); }
  function maaKoe() { try { return typeof maaStyreBio === "function" ? maaStyreBio() : maaStyre(); } catch (e) { return false; } }
  function filmKoerer() { return typeof bioFilm !== "undefined" && !!bioFilm.v; }
  function hentTitel(punkt) {
    // filmens titel fra YouTube (via noembed.com); virker det ikke, står der bare "YouTube-video"
    fetch("https://noembed.com/embed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + punkt.v)).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.title) { punkt.titel = j.title; gemKoe(); } }).catch(function () {});
  }
  function koeTilfoej(link) {
    const id = typeof youtubeId === "function" ? youtubeId(link) : null;
    if (!id) return "Det ligner ikke et YouTube-link. Prøv at kopiere linket igen.";
    const punkt = { v: id, titel: "", id: Date.now() + Math.random() };
    bioKoe.push(punkt);
    gemKoe();
    hentTitel(punkt);
    // kører der ingen film, og er man i biografen, starter den med det samme
    if (!filmKoerer() && typeof iBiografen === "function" && iBiografen()) afspilNaeste();
    return "";
  }
  function afspilNaeste() {
    if (!maaKoe() || typeof visFilm !== "function") return;
    const n = bioKoe.shift();
    gemKoe();
    if (!n) return;
    const start = function () { visFilm("https://www.youtube.com/watch?v=" + n.v); tegnAlleKoeer(); };
    if (typeof iBiografen === "function" && !iBiografen() && typeof gaaTilVaerelse === "function") { gaaTilVaerelse("biograf"); setTimeout(start, 500); }
    else start();
  }
  // Lyt efter, hvornår YouTube-filmen er slut
  let sidstSlut = -1;
  window.addEventListener("message", function (e) {
    if (!/youtube/.test(e.origin || "")) return;
    let d = null;
    try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d) return;
    const slut = (d.event === "onStateChange" && d.info === 0) || (d.event === "infoDelivery" && d.info && d.info.playerState === 0);
    if (!slut || typeof bioFilm === "undefined" || !bioFilm.v) return;
    if (bioFilm.n === sidstSlut) return;          // kun én gang pr. film
    if (bioFilm.af !== mig() || !bioKoe.length) return;   // den, der satte filmen på, starter den næste
    sidstSlut = bioFilm.n;
    afspilNaeste();
  });
  // Bed YouTube om at fortælle, når filmen skifter tilstand (den sender kun, når man har spurgt)
  vent(function () { return typeof bioSkaerm !== "undefined"; }, function () {
    function lyt() { try { if (bioSkaerm.src) bioSkaerm.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"); } catch (e) {} }
    bioSkaerm.addEventListener("load", function () { lyt(); setTimeout(lyt, 1500); });
    setInterval(function () { if (filmKoerer() && bioKoe.length) lyt(); }, 4000);
  });

  function koeHtml(med) {
    return "<div class='vc-koe'><b>📼 Film i kø" + (bioKoe.length ? " (" + bioKoe.length + ")" : "") + "</b>" +
      (med ? "<form class='vc-koe-form'><input type='text' placeholder='YouTube-link til køen …'><button type='submit' class='bio-k lys lv-knap'>➕ Sæt i kø</button></form>" : "") +
      (bioKoe.length ? "<ol>" + bioKoe.map(function (k, i) {
        return "<li><div><span>" + esc(k.titel || "YouTube-video (" + k.v + ")") + "</span>" +
          (i > 0 ? "<button type='button' data-koe-op='" + i + "' title='Flyt op'>▲</button>" : "") +
          "<button type='button' data-koe-fjern='" + i + "' title='Fjern'>✕</button></div></li>";
      }).join("") + "</ol><div class='vc-koe-knapper'><button type='button' class='bio-k lv-knap' data-koe-naeste>⏭ Næste film nu</button>" +
        "<button type='button' class='bio-k lys lv-knap' data-koe-toem>🗑 Tøm køen</button></div>"
        : "<p>Køen er tom. Sæt så mange film i kø, du vil. Når en film slutter, starter den næste af sig selv.</p>") +
      "<p class='vc-koe-fejl' hidden></p></div>";
  }
  function kobKoe(el) {
    const f = el.querySelector(".vc-koe-form");
    if (f) f.addEventListener("submit", function (e) {
      e.preventDefault();
      const inp = f.querySelector("input");
      const link = inp.value;
      inp.value = "";
      const fejl = koeTilfoej(link);
      const p = el.querySelector(".vc-koe-fejl");
      if (fejl) { inp.value = link; if (p) { p.textContent = fejl; p.hidden = false; } }
    });
    el.querySelectorAll("[data-koe-fjern]").forEach(function (k) { k.addEventListener("click", function () { bioKoe.splice(+k.dataset.koeFjern, 1); gemKoe(); }); });
    el.querySelectorAll("[data-koe-op]").forEach(function (k) {
      k.addEventListener("click", function () { const i = +k.dataset.koeOp; const x = bioKoe.splice(i, 1)[0]; bioKoe.splice(i - 1, 0, x); gemKoe(); });
    });
    const n = el.querySelector("[data-koe-naeste]");
    if (n) n.addEventListener("click", afspilNaeste);
    const t = el.querySelector("[data-koe-toem]");
    if (t) t.addEventListener("click", function () { toKlik(t, function () { bioKoe = []; gemKoe(); }); });
  }
  // Køen i biograf-vinduet (klik på lærredet) og i Ejerpanel → 🎬 Biograf
  function tegnKoeI(holder, med) {
    if (!holder) return;
    if (!maaKoe()) { holder.innerHTML = ""; return; }
    const aktiv = holder.contains(document.activeElement) && document.activeElement.tagName === "INPUT";
    const gammel = aktiv ? document.activeElement.value : "";
    holder.innerHTML = koeHtml(med);
    kobKoe(holder);
    if (aktiv) { const i = holder.querySelector("input"); if (i) { i.value = gammel; i.focus(); } }
  }
  function tegnAlleKoeer() {
    tegnKoeI(document.getElementById("vc-koe-vindue"), true);
    tegnKoeI(document.getElementById("vc-koe-panel"), true);
  }
  vent(function () { return document.getElementById("bio-vindue") && document.getElementById("bio-form"); }, function () {
    const holder = document.createElement("div");
    holder.id = "vc-koe-vindue";
    const tekst = document.getElementById("bio-tekst");
    if (tekst) tekst.after(holder); else document.querySelector("#bio-vindue .bio-krop").appendChild(holder);
    tegnKoeI(holder, true);
    // "Vis film" mens en film kører: spørg ikke, bare vis. Køen har sin egen knap.
  });
  vent(function () { return typeof visFane === "function" && typeof visBioVindue === "function" && typeof ejerIndhold !== "undefined"; }, function () {
    const visFaneFoerKoe = visFane;
    visFane = function () {
      visFaneFoerKoe();
      if (ejerVindue.hidden || ejerFane !== "biograf" || !maaKoe()) return;
      if (document.getElementById("vc-koe-panel")) return;
      const holder = document.createElement("div");
      holder.id = "vc-koe-panel";
      holder.style.marginTop = "14px";
      ejerIndhold.appendChild(holder);
      tegnKoeI(holder, true);
    };
  });

  // ---------------------------------------------------------------
  //  📟 Billetscanneren (ejeren og de ansatte)
  //  Gæsten viser billetten (stregkode + kode) i appen. Den ansatte scanner den her,
  //  eller med en rigtig USB-stregkodescanner (den "skriver" koden og trykker Enter).
  //  Først når billetten er scannet, kan gæsten sætte sig i biografen.
  // ---------------------------------------------------------------
  let lyd = null;
  function bip(ok) {
    try {
      lyd = lyd || new (window.AudioContext || window.webkitAudioContext)();
      const t = lyd.currentTime;
      (ok ? [[1760, 0, 0.09], [2350, 0.1, 0.12]] : [[220, 0, 0.18], [180, 0.2, 0.25]]).forEach(function (n) {
        const o = lyd.createOscillator(), g = lyd.createGain();
        o.type = ok ? "square" : "sawtooth"; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.12, t + n[1] + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + n[2]);
        o.connect(g); g.connect(lyd.destination); o.start(t + n[1]); o.stop(t + n[1] + n[2] + 0.02);
      });
    } catch (e) {}
  }
  // Den visning, der er i gang nu (eller starter inden for en time)
  function aktivVisning(liste) {
    const t = nu();
    return (liste || []).filter(function (v) { return v.start - 3600000 < t && t < v.start + v.varighed * 60000; })
      .sort(function (a, b) { return a.start - b.start; })[0] || null;
  }

  const scanner = document.createElement("div");
  scanner.id = "vc-scanner";
  scanner.hidden = true;
  scanner.innerHTML =
    "<div class='vcs-top'><span class='vcs-led'></span><b>📟 Vera-scanner</b><button type='button' class='vcs-luk' title='Luk'>✕</button></div>" +
    "<div class='vcs-skaerm'><div class='vcs-laser'></div><div class='vcs-svar'><b>Klar til at scanne</b><small>Scan stregkoden eller skriv koden fra billetten</small></div></div>" +
    "<form class='vcs-form'><input type='text' maxlength='20' placeholder='Kode, fx 3F9A1C' autocomplete='off' spellcheck='false'><button type='submit'>Scan</button></form>" +
    "<div class='vcs-liste'></div>";
  document.body.appendChild(scanner);
  if (typeof goerFlytbar === "function") try { goerFlytbar(scanner, scanner.querySelector(".vcs-top"), "mit-hotel-flyt-scanner"); } catch (e) {}
  const scanInput = scanner.querySelector("input");
  scanner.querySelector(".vcs-luk").addEventListener("click", function () { scanner.hidden = true; });
  scanner.querySelector(".vcs-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const k = scanInput.value;
    scanInput.value = "";
    scan(k);
  });
  function aabnScanner() {
    if (!maaStyre()) return;
    scanner.hidden = false;
    tegnScanListe();
    setTimeout(function () { scanInput.focus(); }, 50);
    hentPersonale().then(tegnScanListe);
  }
  window.vcAabnScanner = aabnScanner;
  function visSvar(type, titel, tekst) {
    const s = scanner.querySelector(".vcs-svar");
    scanner.querySelector(".vcs-skaerm").className = "vcs-skaerm " + type;
    s.innerHTML = "<b>" + titel + "</b><small>" + tekst + "</small>";
    clearTimeout(visSvar.t);
    visSvar.t = setTimeout(function () {
      scanner.querySelector(".vcs-skaerm").className = "vcs-skaerm";
      s.innerHTML = "<b>Klar til at scanne</b><small>Scan stregkoden eller skriv koden fra billetten</small>";
    }, 6000);
  }
  function scan(kode) {
    if (!maaStyre()) return;
    if (scanner.hidden) { scanner.hidden = false; }
    visSvar("", "Scanner …", esc(kode));
    serverKald("hv_cinema_scan", { p_token: token(), p_kode: kode }).then(function (svar) {
      const forkertVisning = (function () { const a = pData && aktivVisning(pData.program); return a && a.id !== svar.visning_id; })();
      if (svar.status === "allerede") {
        bip(false);
        visSvar("gul", "⚠️ Allerede scannet", esc(svar.navn) + " · plads " + esc(svar.saede) + "<br>Scannet kl. " + kl(svar.scannet) + (svar.scannet_af ? " af " + esc(svar.scannet_af) : ""));
      } else {
        bip(!forkertVisning);
        visSvar(forkertVisning ? "gul" : "groen", forkertVisning ? "⚠️ Godkendt – men til en anden visning" : "✅ Godkendt",
          esc(svar.navn) + (svar.spiller && svar.spiller !== svar.navn ? " (" + esc(svar.spiller) + ")" : "") + " · <b>plads " + esc(svar.saede) + "</b><br>" +
          esc(svar.titel) + " · " + dagTekst(svar.start) + " kl. " + kl(svar.start));
      }
      return hentPersonale();
    }).then(function () { tegnScanListe(); if (panelAabent()) tegnPanel(); }).catch(function (e) {
      bip(false);
      visSvar("roed", "❌ Ikke godkendt", esc(fejlTekst(e)));
    });
  }
  function fortrydScan(id) {
    serverKald("hv_cinema_scan_fortryd", { p_token: token(), p_billet: id }).then(hentPersonale)
      .then(function () { tegnScanListe(); if (panelAabent()) tegnPanel(); }).catch(function (e) { pFejl = fejlTekst(e); if (panelAabent()) tegnPanel(); });
  }
  function tegnScanListe() {
    const holder = scanner.querySelector(".vcs-liste");
    if (!pData) { holder.innerHTML = "<p>Henter billetter …</p>"; return; }
    const v = aktivVisning(pData.program);
    if (!v) { holder.innerHTML = "<p>Der er ingen visning i gang lige nu (eller inden for en time). Du kan stadig scanne billetter til senere visninger.</p>"; return; }
    const bl = pData.billetter.filter(function (b) { return b.visning_id === v.id; }).sort(function (a, b) { return a.saede < b.saede ? -1 : 1; });
    const scannet = bl.filter(function (b) { return b.scannet; }).length;
    holder.innerHTML = "<h4>" + esc((v.plakat || "") + " " + v.titel) + " · kl. " + kl(v.start) + "</h4><p class='vcs-tal'>✅ " + scannet + " af " + bl.length + " billetter scannet</p>" +
      (bl.length ? "<ul>" + bl.map(function (b) {
        return "<li class='" + (b.scannet ? "ok" : "") + "'><b>" + esc(b.saede) + "</b><span>" + esc(b.navn) + "</span>" +
          (b.scannet ? "<em>✅ " + kl(b.scannet) + "</em>" : "<button type='button' data-vcs-scan='" + esc(b.kode || "") + "' title='Scan " + esc(b.navn) + "s billet'>📟</button>") + "</li>";
      }).join("") + "</ul>" : "<p>Ingen har billet til denne visning endnu.</p>");
    holder.querySelectorAll("[data-vcs-scan]").forEach(function (k) { k.addEventListener("click", function () { scan(k.dataset.vcsScan); }); });
  }
  setInterval(function () { if (!scanner.hidden) { if (!maaStyre()) { scanner.hidden = true; return; } hentPersonale().then(tegnScanListe); } }, 6000);

  // 📟-knap i biografen for ejeren og de ansatte
  const scanKnap = document.createElement("button");
  scanKnap.id = "vc-scan-knap";
  scanKnap.type = "button";
  scanKnap.innerHTML = "📟 Billetscanner";
  scanKnap.hidden = true;
  scanKnap.addEventListener("click", function () { if (scanner.hidden) aabnScanner(); else scanner.hidden = true; });
  document.body.appendChild(scanKnap);
  setInterval(function () { const vis = (iBio() || iForhal()) && maaStyre(); if (scanKnap.hidden === vis) scanKnap.hidden = !vis; }, 1000);

  // 🪑 Man må først sætte sig, når billetten er scannet (når der er en visning i gang eller lige om lidt)
  function maaSidde(m) {
    if (!m || m.type !== "bio-saede" || !iBio() || maaStyre() || !data) return true;
    const v = aktivVisning(data.program);
    if (!v) return true;                         // ingen film i gang: frit valg
    const b = data.mine.find(function (x) { return x.visning_id === v.id; });
    const sig = function (t) { try { besked.textContent = t; } catch (e) {} };
    if (!b) { sig("🎟 Du skal have en billet til " + v.titel + " for at sætte dig. Køb den i appen Vera-cinema på telefonen."); return false; }
    if (!b.scannet) { sig("📟 Din billet er ikke scannet endnu. Vis den til en ansat ved indgangen, så kan du sætte dig."); return false; }
    const nr = saedeNumre()[m.x + "," + m.y];
    if (nr && nr !== b.saede) { sig("🪑 Det er ikke din plads. Din plads er " + saedeNavn(b.saede) + " – den lyser med en guldpil."); return false; }
    return true;
  }
  function pakSaetDigInd() {
    if (typeof saetDig !== "function" || saetDig.vcScan) return;
    const foer = saetDig;
    const ny = function (m) { if (!maaSidde(m)) return; return foer.apply(this, arguments); };
    ny.vcScan = true;
    saetDig = ny;
  }
  pakSaetDigInd();
  setInterval(pakSaetDigInd, 500);

  // ---------------------------------------------------------------
  //  Udseende
  // ---------------------------------------------------------------
  const T = "#telefon ";
  const css = [
    T + ".vc-app { background: radial-gradient(120% 60% at 50% 0%, #4a1020, #1a0509 70%); color: #fbecd0; padding: 6px 12px 18px; min-height: 100%; box-sizing: border-box; }",
    T + ".tlf-top.vc-top { background: #1a0509 !important; color: #ffd98a; border-bottom: 1px solid rgba(217,164,65,.35); }",
    T + ".tlf-top.vc-top h3 { color: #ffd98a !important; letter-spacing: .5px; }",
    T + ".tlf-top.vc-top .tlf-tb { color: #ffd98a !important; }",
    "#telefon:has(.vc-app) .tlf-status { color: #fbecd0 !important; }",
    "#telefon:has(.vc-app) .tlf-hjemlinje { background: #fbecd0 !important; }",
    T + ".vc-logo { text-align: center; margin: 6px 0 12px; display: grid; gap: 1px; }",
    T + ".vc-logo b { font: 900 30px/1 Georgia, 'Times New Roman', serif; letter-spacing: 6px; color: #ffd98a; text-shadow: 0 0 14px rgba(255,190,90,.55), 0 2px 0 #7a1b2b; }",
    T + ".vc-logo span { font-size: 11px; letter-spacing: 5px; color: #f3b7c2; font-weight: 700; }",
    T + ".vc-logo small { font-size: 10.5px; opacity: .65; margin-top: 3px; }",
    T + ".vc-faner { display: flex; gap: 4px; margin-bottom: 12px; background: rgba(0,0,0,.3); padding: 3px; border-radius: 12px; }",
    T + ".vc-faner button { flex: 1 1 auto; white-space: nowrap; padding: 7px 5px; border-radius: 9px; border: 0; background: transparent; color: #f7dfa0; font-size: 10.5px; font-weight: 600; cursor: pointer; }",
    T + ".vc-faner button.valgt { background: linear-gradient(#ffd98a, #d9a441); color: #4a1622; }",
    T + ".vc-faner button i { font-style: normal; background: #e0283c; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 10px; }",
    T + ".vc-dag { margin: 12px 2px 6px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #f3b7c2; }",
    T + ".vc-kort { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px; margin-bottom: 7px; border-radius: 14px; border: 1px solid rgba(217,164,65,.3); background: rgba(255,255,255,.06); color: inherit; text-align: left; cursor: pointer; }",
    T + ".vc-kort:hover { background: rgba(255,255,255,.11); }",
    T + ".vc-kort-tekst { flex: 1; display: grid; gap: 2px; min-width: 0; }",
    T + ".vc-kort-tekst b { font-size: 14px; color: #fff4dc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    T + ".vc-kort-tekst small { font-size: 11px; opacity: .75; }",
    T + ".vc-kort-tekst em { font-style: normal; font-size: 11px; color: #9fe0a8; font-weight: 700; }",
    T + ".vc-kort-tekst em.vc-udsolgt { color: #ff8a98; }",
    T + ".vc-kort-tekst em.vc-har { color: #ffd98a; }",
    T + ".vc-kort-tekst em.vc-igang { color: #ff5c6c; }",
    T + ".vc-pil { font-size: 22px; opacity: .5; }",
    T + ".vc-plakat { width: 46px; height: 62px; flex: none; border-radius: 7px; background: linear-gradient(160deg, color-mix(in srgb, var(--vc-f) 70%, #fff) , var(--vc-f) 45%, #120306); border: 1px solid rgba(255,217,138,.55); display: grid; place-items: center; position: relative; box-shadow: 0 3px 8px rgba(0,0,0,.45); overflow: hidden; }",
    T + ".vc-plakat span { font-size: 25px; filter: drop-shadow(0 2px 2px rgba(0,0,0,.4)); }",
    T + ".vc-plakat i { position: absolute; bottom: 3px; left: 0; right: 0; text-align: center; font: 800 7px/1 Verdana, sans-serif; letter-spacing: 1.5px; color: #ffd98a; font-style: normal; }",
    T + ".vc-plakat.stor { width: 120px; height: 160px; margin: 8px auto 10px; border-radius: 12px; }",
    T + ".vc-plakat.stor span { font-size: 64px; }",
    T + ".vc-titel { text-align: center; margin: 2px 0 6px; font: 800 19px/1.2 Georgia, serif; color: #ffd98a; }",
    T + ".vc-fakta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 10px; }",
    T + ".vc-fakta span { font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(255,255,255,.08); }",
    T + ".vc-tekst { font-size: 12.5px; line-height: 1.45; opacity: .9; background: rgba(0,0,0,.2); padding: 9px 11px; border-radius: 12px; margin: 0 0 10px; }",
    T + ".vc-pladser { margin: 8px 0 12px; display: grid; gap: 4px; }",
    T + ".vc-pladser small { font-size: 11px; opacity: .8; text-align: center; }",
    T + ".vc-bar { height: 7px; border-radius: 4px; background: rgba(255,255,255,.12); overflow: hidden; }",
    T + ".vc-bar i { display: block; height: 100%; background: linear-gradient(90deg, #d9a441, #ff7a5c); }",
    T + ".vc-stor-knap { width: 100%; padding: 12px; border-radius: 14px; border: 0; background: linear-gradient(#ffe08a, #d9a441); color: #4a1622; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.4); margin-top: 4px; }",
    T + ".vc-stor-knap:disabled { background: #5a3a40; color: #c9a9ae; box-shadow: none; cursor: default; }",
    T + ".vc-lille-knap { width: 100%; margin-top: 8px; padding: 9px; border-radius: 12px; border: 1px solid rgba(217,164,65,.45); background: transparent; color: #f7dfa0; font-size: 12px; cursor: pointer; }",
    T + ".vc-lille-knap.vc-sikker, " + T + ".vc-sikker { background: #c0283c !important; color: #fff !important; }",
    T + ".vc-info { text-align: center; font-size: 12.5px; padding: 10px; border-radius: 12px; background: rgba(255,92,108,.15); }",
    T + ".vc-tom { text-align: center; opacity: .85; font-size: 13px; padding: 26px 10px; line-height: 1.6; }",
    T + ".vc-advarsel, " + T + ".vc-fejl { background: rgba(224,40,60,.2); border: 1px solid rgba(255,120,130,.5); color: #ffd0d5; padding: 8px 10px; border-radius: 10px; font-size: 12px; }",
    T + ".vc-smaat { font-size: 10.5px; opacity: .7; text-align: center; margin: 8px 0 0; }",
    T + ".vc-koeb-titel { display: flex; align-items: center; gap: 10px; margin: 4px 0 10px; }",
    T + ".vc-koeb-titel div { display: grid; }",
    T + ".vc-koeb-titel b { color: #ffd98a; }",
    T + ".vc-koeb-titel small { font-size: 11px; opacity: .75; }",
    T + ".vc-sal { background: rgba(0,0,0,.28); border-radius: 14px; padding: 10px 4px 8px; }",
    T + ".vc-laerred, #vc-panel .vc-laerred { margin: 0 14px 14px; height: 18px; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background: linear-gradient(#fff6dc, #d9c9a0); box-shadow: 0 6px 18px rgba(255,240,200,.35); text-align: center; }",
    T + ".vc-laerred span, #vc-panel .vc-laerred span { font: 800 8px/20px Verdana, sans-serif; letter-spacing: 3px; color: #7a5a3a; }",
    T + ".vc-raekker, #vc-panel .vc-raekker { display: grid; gap: 5px; }",
    T + ".vc-raekke, #vc-panel .vc-raekke { display: flex; align-items: center; justify-content: center; gap: 2px; }",
    T + ".vc-raekke b, #vc-panel .vc-raekke b { width: 11px; flex: none; text-align: center; font-size: 10px; color: #f3b7c2; }",
    T + ".vc-gang, #vc-panel .vc-gang { width: 7px; flex: none; }",
    T + ".vc-saede, #vc-panel .vc-saede { width: 19px; height: 20px; flex: none; box-sizing: border-box; min-width: 0; padding: 0; border-radius: 6px 6px 3px 3px; border: 0; border-bottom: 3px solid #5c1020; background: #c0394f; color: #ffe3e8; font: 700 10px/1 Verdana, sans-serif; cursor: pointer; display: inline-block; }",
    T + ".vc-saede:hover:not(:disabled) { background: #e2566c; transform: translateY(-1px); }",
    T + ".vc-saede.optaget, #vc-panel .vc-saede.optaget { background: #4c3a3e; border-bottom-color: #2e2225; color: #8d7a7e; cursor: not-allowed; }",
    T + ".vc-saede.valgt, #vc-panel .vc-saede.valgt { background: #ffd98a; border-bottom-color: #a8771f; color: #4a1622; box-shadow: 0 0 10px #ffd98a; }",
    T + ".vc-forklaring { display: flex; justify-content: center; gap: 12px; margin-top: 10px; font-size: 10.5px; opacity: .85; }",
    T + ".vc-forklaring i { width: 11px; height: 10px; vertical-align: -1px; margin-right: 3px; cursor: default; border-bottom-width: 2px; }",
    T + ".vc-navn { display: grid; gap: 3px; margin: 12px 0 8px; }",
    T + ".vc-navn small { font-size: 11px; opacity: .8; }",
    T + ".vc-navn input { padding: 9px 11px; border-radius: 10px; border: 1px solid rgba(217,164,65,.6); background: #fff8ea; color: #3a1018; font-size: 14px; outline: none; }",
    T + ".vc-kurv { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; border-radius: 12px; background: rgba(255,217,138,.12); border: 1px dashed rgba(255,217,138,.5); margin-bottom: 8px; font-size: 12.5px; }",
    T + ".vc-kurv b { color: #ffd98a; }",
    T + ".vc-hint { opacity: .75; }",
    T + ".vc-tak { text-align: center; font-weight: 700; color: #9fe0a8; margin: 6px 0 10px; }",
    T + ".vc-billet { display: block; width: 100%; text-align: left; position: relative; margin: 0 0 10px; padding: 0; border: 0; border-radius: 14px; overflow: hidden; color: #3a1018; background: #fff4dc; box-shadow: 0 5px 14px rgba(0,0,0,.45); cursor: pointer; font: inherit; }",
    T + "div.vc-billet { cursor: default; }",
    T + ".vc-billet.forbi { opacity: .6; }",
    T + ".vc-billet-top { display: flex; gap: 10px; align-items: center; padding: 10px 12px; background: linear-gradient(120deg, var(--vc-f), #1a0509); color: #ffe7b0; }",
    T + ".vc-billet-top span { font-size: 28px; }",
    T + ".vc-billet-top div { display: grid; }",
    T + ".vc-billet-top small { font-size: 8.5px; letter-spacing: 1.5px; opacity: .8; }",
    T + ".vc-billet-top b { font: 800 15px/1.2 Georgia, serif; }",
    T + ".vc-billet-midt { display: grid; grid-template-columns: 1.4fr 1fr .8fr .8fr; padding: 9px 12px; border-bottom: 2px dashed #d9b78a; position: relative; }",
    T + ".vc-billet-midt div { display: grid; }",
    T + ".vc-billet-midt small { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #9a6a5a; }",
    T + ".vc-billet-midt b { font-size: 15px; color: #7a1b2b; }",
    T + ".vc-billet-bund { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; font-size: 12px; }",
    T + ".vc-stregkode { display: flex; gap: 1px; height: 22px; }",
    T + ".vc-stregkode i { background: #3a1018; display: block; }",
    T + ".vc-stempel { position: absolute; right: 14px; top: 46px; transform: rotate(-14deg); border: 2px solid #c0283c; color: #c0283c; font: 900 15px/1 Verdana, sans-serif; padding: 2px 8px; border-radius: 6px; font-style: normal; letter-spacing: 2px; }",
    // Ejerpanelet
    "#vc-panel { color: #3a1018; }",
    "#vc-panel .vc-p-top { display: flex; align-items: center; gap: 16px; padding: 12px 14px; border-radius: 14px; background: radial-gradient(120% 120% at 0% 0%, #5a1424, #1a0509); color: #fbecd0; margin-bottom: 10px; flex-wrap: wrap; }",
    "#vc-panel .vc-p-logo { display: grid; line-height: 1; }",
    "#vc-panel .vc-p-logo b { font: 900 24px Georgia, serif; letter-spacing: 4px; color: #ffd98a; text-shadow: 0 0 10px rgba(255,190,90,.5); }",
    "#vc-panel .vc-p-logo span { font-size: 10px; letter-spacing: 5px; color: #f3b7c2; font-weight: 700; }",
    "#vc-panel .vc-p-tal { display: flex; gap: 10px; flex: 1; justify-content: flex-end; flex-wrap: wrap; }",
    "#vc-panel .vc-p-tal div { display: grid; text-align: center; padding: 6px 12px; border-radius: 10px; background: rgba(255,255,255,.08); min-width: 80px; }",
    "#vc-panel .vc-p-tal b { font-size: 18px; color: #ffd98a; }",
    "#vc-panel .vc-p-tal small { font-size: 10.5px; opacity: .8; }",
    "#vc-panel .vc-p-under { display: flex; gap: 6px; margin-bottom: 10px; }",
    "#vc-panel .vc-p-under button { padding: 7px 14px; border-radius: 10px; border: 2px solid #d9a441; background: #fff8ea; color: #5a1424; font-weight: 700; cursor: pointer; }",
    "#vc-panel .vc-p-under button.valgt { background: #7a1b2b; color: #ffe7b0; border-color: #7a1b2b; }",
    "#vc-panel .vc-p-fejl { background: #ffe2e5; border: 1px solid #e88; color: #8a1424; padding: 7px 10px; border-radius: 8px; }",
    "#vc-panel .vc-p-tom { opacity: .75; font-style: italic; }",
    "#vc-panel h4 { margin: 12px 0 6px; color: #7a1b2b; }",
    "#vc-panel .vc-p-ny { width: 100%; }",
    "#vc-panel .vc-p-liste { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }",
    "#vc-panel .vc-p-vis { display: flex; gap: 12px; align-items: center; padding: 8px 10px; border-radius: 12px; background: #fff8ea; border: 1px solid #ecd2a0; flex-wrap: wrap; }",
    "#vc-panel .vc-p-vis.gammel { opacity: .65; }",
    "#vc-panel .vc-p-vis > div:nth-child(2) { flex: 1; min-width: 180px; display: grid; gap: 3px; }",
    "#vc-panel .vc-p-vis small { font-size: 11.5px; color: #7a5a4a; }",
    "#vc-panel .vc-p-type { font-size: 11px; color: #9a6a5a; }",
    "#vc-panel .vc-p-nu { color: #c0283c; }",
    "#vc-panel .vc-p-knapper { display: flex; gap: 5px; flex-wrap: wrap; }",
    "#vc-panel .vc-plakat { width: 40px; height: 54px; flex: none; border-radius: 6px; background: linear-gradient(160deg, var(--vc-f), #120306); display: grid; place-items: center; position: relative; border: 1px solid #d9a441; overflow: hidden; }",
    "#vc-panel .vc-plakat span { font-size: 22px; }",
    "#vc-panel .vc-plakat i { position: absolute; bottom: 2px; left: 0; right: 0; text-align: center; font: 800 6px/1 Verdana, sans-serif; letter-spacing: 1px; color: #ffd98a; font-style: normal; }",
    "#vc-panel .vc-bar { height: 6px; border-radius: 3px; background: #ecd9c0; overflow: hidden; max-width: 260px; }",
    "#vc-panel .vc-bar i { display: block; height: 100%; background: linear-gradient(90deg, #d9a441, #c0394f); }",
    "#vc-panel .vc-p-slet.vc-sikker, #vc-panel .vc-sikker { background: #c0283c !important; color: #fff !important; }",
    "#vc-panel .vc-p-tidl { margin-top: 12px; }",
    "#vc-panel .vc-p-tidl summary { cursor: pointer; font-weight: 700; color: #7a1b2b; }",
    "#vc-panel .vc-form { display: grid; gap: 9px; background: #fff8ea; border: 1px solid #ecd2a0; padding: 12px; border-radius: 12px; }",
    "#vc-panel .vc-form h4 { margin: 0; }",
    "#vc-panel .vc-form label { display: grid; gap: 3px; font-size: 12px; font-weight: 700; color: #5a1424; }",
    "#vc-panel .vc-form input, #vc-panel .vc-form textarea, #vc-panel .vc-p-vaelg select { padding: 7px 9px; border-radius: 8px; border: 2px solid #d9a441; font: inherit; font-weight: 400; background: #fff; color: #3a1018; }",
    "#vc-panel .vc-f-type { display: flex; gap: 14px; }",
    "#vc-panel .vc-f-type label { display: flex; align-items: center; gap: 5px; font-size: 13px; }",
    "#vc-panel .vc-f-linje { display: flex; gap: 8px; flex-wrap: wrap; }",
    "#vc-panel .vc-f-linje label { flex: 1; min-width: 110px; }",
    "#vc-panel .vc-f-valg { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }",
    "#vc-panel .vc-f-valg span { font-size: 12px; font-weight: 700; color: #5a1424; width: 52px; }",
    "#vc-panel .vc-f-valg button { width: 30px; height: 30px; border-radius: 8px; border: 2px solid #ecd2a0; background: #fff; font-size: 16px; cursor: pointer; padding: 0; }",
    "#vc-panel .vc-f-valg button.valgt { border-color: #7a1b2b; box-shadow: 0 0 0 2px #ffd98a; }",
    "#vc-panel .vc-f-knapper { display: flex; gap: 8px; }",
    "#vc-panel .vc-smaat { font-size: 11px; color: #7a5a4a; margin: 0; }",
    "#vc-panel .vc-p-vaelg { display: flex; gap: 8px; align-items: center; font-weight: 700; color: #5a1424; margin-bottom: 10px; }",
    "#vc-panel .vc-p-vaelg select { flex: 1; }",
    "#vc-panel .vc-p-bk { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-start; }",
    "#vc-panel .vc-p-sal { background: #1a0509; border-radius: 12px; padding: 12px 8px; }",
    "#vc-panel .vc-p-sal .vc-raekke b { color: #f3b7c2; }",
    "#vc-panel .vc-p-sal .vc-saede { cursor: help; }",
    "#vc-panel .vc-p-sal .vc-saede.optaget { background: #d9a441; border-bottom-color: #8a5a12; color: #4a1622; cursor: help; }",
    "#vc-panel .vc-p-sal .vc-saede:not(.optaget) { background: #4c3a3e; border-bottom-color: #2e2225; color: #8d7a7e; }",
    "#vc-panel .vc-p-sal .vc-forklaring { display: none; }",
    "#vc-panel .vc-p-bk-liste { flex: 1; min-width: 240px; }",
    "#vc-panel .vc-p-bk-liste h4 { margin-top: 0; }",
    "#vc-panel table { width: 100%; border-collapse: collapse; font-size: 12.5px; }",
    "#vc-panel th { text-align: left; font-size: 11px; color: #9a6a5a; border-bottom: 2px solid #ecd2a0; padding: 4px; }",
    "#vc-panel td { padding: 5px 4px; border-bottom: 1px solid #f1e2c6; }",
    "#vc-panel tr.ny td { background: #fff1c4; }",
    "#vc-panel td .lv-knap { padding: 2px 8px; }",
    ".vc-koe { margin-top: 10px; padding: 9px 10px; border: 2px solid #d9a441; border-radius: 10px; background: #fff8ea; color: #4a1a22; font-size: 12.5px; }",
    ".vc-koe > b { display: block; margin-bottom: 6px; color: #7a1b2b; }",
    ".vc-koe-form { display: flex; gap: 6px; margin-bottom: 6px; }",
    ".vc-koe-form input { flex: 1; min-width: 0; padding: 6px 8px; border: 2px solid #d9a441; border-radius: 8px; background: #fff; color: #4a1a22; }",
    ".vc-koe ol { margin: 4px 0 6px; padding-left: 20px; max-height: 160px; overflow-y: auto; }",
    ".vc-koe li { margin: 3px 0; }",
    ".vc-koe li > div { display: flex; align-items: center; gap: 4px; }",
    ".vc-koe li span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".vc-koe li button { flex: none; margin: 0 !important; min-width: 0 !important; width: 22px; height: 22px; padding: 0; border: 1px solid #d9a441; border-radius: 6px; background: #fff; color: #7a1b2b; cursor: pointer; vertical-align: middle; }",
    ".vc-koe-knapper { display: flex; gap: 6px; flex-wrap: wrap; }",
    ".vc-koe p { margin: 4px 0 0; }",
    ".vc-koe .vc-koe-fejl { color: #b3202f; font-weight: bold; }",
    ".vc-koe .vc-sikker { background: #c0283c !important; color: #fff !important; }",
    T + ".vc-stempel.ok { border-color: #1f8f4a; color: #1f8f4a; }",
    T + ".vc-kode-lille { font: 700 12px/1 'Courier New', monospace; letter-spacing: 2px; color: #7a1b2b; }",
    T + ".vc-scan-boks { margin: 0 0 10px; padding: 10px; border-radius: 14px; background: #fff; color: #3a1018; display: grid; justify-items: center; gap: 4px; border: 3px solid #d9a441; }",
    T + ".vc-scan-boks.ok { border-color: #2fae5c; }",
    T + ".vc-scan-boks b { font: 800 18px/1 'Courier New', monospace; letter-spacing: 5px; }",
    T + ".vc-scan-boks small { font-size: 11px; text-align: center; color: #5a3a40; }",
    T + ".vc-stregkode-svg { width: 100%; height: 58px; display: block; }",
    "#vc-scan-knap { position: fixed; right: 16px; top: 120px; z-index: 40; padding: 8px 14px; border-radius: 12px; border: 2px solid #d9a441; background: linear-gradient(#3a3d44, #1c1d22); color: #ffe7b0; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.4); }",
    "#vc-scan-knap[hidden], #vc-scanner[hidden] { display: none !important; }",
    "#vc-plads { position: fixed; left: 50%; top: 64px; transform: translateX(-50%); z-index: 55; background: linear-gradient(#4a1220, #2e0912); border: 2px solid #d4aa5a; color: #f6e7d0; border-radius: 999px; padding: 7px 18px; font: 14px system-ui, sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,.45); white-space: nowrap; }",
    "#vc-plads[hidden] { display: none !important; }",
    "#vc-plads b { color: #ffd76a; font-size: 17px; }",
    "#vc-plads .ok { color: #8fe3a0; } #vc-plads .ikke { color: #ffb38a; }",
    "#vc-scanner { position: fixed; right: 24px; top: 170px; z-index: 60; width: 300px; max-width: calc(100vw - 32px); background: linear-gradient(#4a4e57, #23252b); border-radius: 26px 26px 18px 18px; padding: 10px 12px 14px; box-shadow: 0 14px 34px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.15); color: #f2f2f2; font-size: 12.5px; border: 2px solid #15161a; }",
    "#vc-scanner .vcs-top { display: flex; align-items: center; gap: 8px; padding: 2px 4px 8px; cursor: move; }",
    "#vc-scanner .vcs-top b { flex: 1; color: #ffd98a; letter-spacing: .5px; }",
    "#vc-scanner .vcs-led { width: 9px; height: 9px; border-radius: 50%; background: #ff3b3b; box-shadow: 0 0 8px #ff3b3b; animation: vcs-blink 1.2s infinite; }",
    "@keyframes vcs-blink { 50% { opacity: .35; } }",
    "#vc-scanner .vcs-luk { width: 26px; height: 26px; border-radius: 8px; border: 1px solid #777; background: #33363d; color: #fff; cursor: pointer; padding: 0; }",
    "#vc-scanner .vcs-skaerm { position: relative; height: 104px; border-radius: 12px; background: radial-gradient(120% 120% at 50% 0%, #20343a, #0b1416); border: 3px solid #111; overflow: hidden; display: grid; place-items: center; text-align: center; transition: background .2s; }",
    "#vc-scanner .vcs-skaerm.groen { background: radial-gradient(120% 120% at 50% 0%, #2fae5c, #0d3b1e); }",
    "#vc-scanner .vcs-skaerm.roed { background: radial-gradient(120% 120% at 50% 0%, #d23a4a, #3b0d14); }",
    "#vc-scanner .vcs-skaerm.gul { background: radial-gradient(120% 120% at 50% 0%, #d9a441, #4a3410); }",
    "#vc-scanner .vcs-laser { position: absolute; left: 8%; right: 8%; height: 2px; background: #ff2a2a; box-shadow: 0 0 10px 2px rgba(255,40,40,.8); top: 50%; animation: vcs-laser 1.6s ease-in-out infinite alternate; }",
    "#vc-scanner .vcs-skaerm.groen .vcs-laser, #vc-scanner .vcs-skaerm.roed .vcs-laser, #vc-scanner .vcs-skaerm.gul .vcs-laser { display: none; }",
    "@keyframes vcs-laser { from { top: 14%; } to { top: 86%; } }",
    "#vc-scanner .vcs-svar { position: relative; display: grid; gap: 4px; padding: 0 10px; }",
    "#vc-scanner .vcs-svar b { font-size: 15px; }",
    "#vc-scanner .vcs-svar small { font-size: 11.5px; opacity: .92; line-height: 1.35; }",
    "#vc-scanner .vcs-form { display: flex; gap: 6px; margin: 10px 0 8px; }",
    "#vc-scanner .vcs-form input { flex: 1; min-width: 0; padding: 8px 10px; border-radius: 10px; border: 2px solid #111; background: #e9efe9; color: #111; font: 700 15px 'Courier New', monospace; letter-spacing: 3px; text-transform: uppercase; }",
    "#vc-scanner .vcs-form button { padding: 0 14px; border-radius: 10px; border: 0; background: linear-gradient(#ff5a5a, #c0283c); color: #fff; font-weight: 800; cursor: pointer; box-shadow: 0 3px 0 #6d0f1c; }",
    "#vc-scanner .vcs-liste { background: rgba(0,0,0,.25); border-radius: 12px; padding: 8px 10px; max-height: 230px; overflow-y: auto; }",
    "#vc-scanner .vcs-liste h4 { margin: 0 0 4px; color: #ffd98a; font-size: 12.5px; }",
    "#vc-scanner .vcs-liste p { margin: 2px 0 6px; }",
    "#vc-scanner .vcs-tal { color: #9fe0a8; font-weight: 700; }",
    "#vc-scanner .vcs-liste ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; }",
    "#vc-scanner .vcs-liste li { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 8px; background: rgba(255,255,255,.06); }",
    "#vc-scanner .vcs-liste li.ok { background: rgba(47,174,92,.18); }",
    "#vc-scanner .vcs-liste li b { width: 26px; color: #ffd98a; }",
    "#vc-scanner .vcs-liste li span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    "#vc-scanner .vcs-liste li em { font-style: normal; font-size: 11px; color: #9fe0a8; }",
    "#vc-scanner .vcs-liste li button { border: 1px solid #777; border-radius: 7px; background: #33363d; color: #fff; cursor: pointer; padding: 2px 8px; }",
    "#ejer-faner .vc-tal { background: #e0283c; color: #fff; border-radius: 8px; padding: 0 6px; margin-left: 4px; font-size: 11px; }",
  ];
  const stil = document.createElement("style");
  stil.id = "vera-cinema-stil";
  stil.textContent = css.join("\n");
  document.head.appendChild(stil);
})();
