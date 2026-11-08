// =============================================================
//  🎪 Event-reklame med Følg-knap
//  - I Ejerpanel → Events og nyheder kan ejeren, Eventværter og Eventfolk trykke
//    "Hold et event". Så kommer et stort skilt midt på skærmen hos alle:
//    "Pall holder Quiz!" med en ➡ Følg-knap, der tager spilleren hen til rummet.
//  - Man vælger farve, emoji og effekt (glød, konfetti, fyrværkeri …) og ser skiltet først.
//  - Skiltet forsvinder af sig selv, når tiden er gået, eller med "⏹ Stop eventet".
//  - Spillerne kan trykke "Ikke nu". Så står der en lille knap nederst, så de kan komme med senere.
//  - "🏆 Skriv vinderne ind" ligger nu også inde i Events og nyheder.
//  (Kræver database-35-event-reklame.sql. Hentes fra slutningen af js/panel-forklaring.js.)
//  Alt her hedder "rek…", så det ikke støder ind i andre filer.
// =============================================================
(function () {
  if (window.rekIgang) return;      // filen må kun køre én gang
  window.rekIgang = true;

  const REK_LUKKET_NOEGLE = "mit-hotel-reklame-lukket";
  const REK_VALG_NOEGLE = "mit-hotel-reklame-stil";
  const REK_LOKAL_NOEGLE = "mit-hotel-reklamer";      // bruges kun, hvis hotellet ikke er online
  const REK_MANGLER = "Kør database-35-event-reklame.sql i Supabase først, så alle kan se skiltet.";

  const REK_EMOJIER = ["🎉", "🎪", "🎤", "🎶", "💃", "🕺", "🏆", "🎮", "🧩", "❓", "🎨", "👗", "📸", "🎬", "🍿", "🎂",
    "🎁", "💖", "🌟", "🔥", "👑", "🦄", "👻", "🎃", "🎄", "❄️", "🌸", "☀️", "🏊", "⚽", "🎲", "🏃"];
  const REK_FARVER = typeof BANNER_FARVER !== "undefined" ? BANNER_FARVER : {
    groen: { navn: "Grøn", bg: "#fbf6ea", kant: "#4e7d4a", ring: "#9ccc8f", skygge: "#33562f", titel: "#1f3a1c", under: "#55704f" },
    guld: { navn: "Guld", bg: "linear-gradient(#fffbea, #f8e6a8)", kant: "#b8901c", ring: "#f0d77a", skygge: "#7a5d0c", titel: "#8a6a10", under: "#7f6a32" } };
  const REK_EFFEKTER = {
    ingen: { navn: "Ingen", ikon: "🚫" },
    gloed: { navn: "Glød", ikon: "🌟" },
    glimmer: { navn: "Glimmer", ikon: "✨" },
    konfetti: { navn: "Konfetti", ikon: "🎊" },
    fyrvaerkeri: { navn: "Fyrværkeri", ikon: "🎆" },
    hjerter: { navn: "Hjerter", ikon: "💖" },
    regnbue: { navn: "Regnbue", ikon: "🌈" },
    hop: { navn: "Hop", ikon: "🦘" },
    ryst: { navn: "Ryst", ikon: "📳" },
    blink: { navn: "Blink", ikon: "💡" },
  };
  const REK_TIDER = [[5, "5 minutter"], [10, "10 minutter"], [15, "15 minutter"], [30, "30 minutter"], [60, "1 time"], [120, "2 timer"], [240, "4 timer"]];

  let rekValg = { farve: "guld", emoji: "🎉", effekt: "konfetti", minutter: 30 };
  try { Object.assign(rekValg, JSON.parse(localStorage.getItem(REK_VALG_NOEGLE) || "{}")); } catch (e) {}

  let rekListe = [];          // events i gang lige nu
  let rekFejl = "";
  let rekSkiltFoer = "";
  let rekVistId = null;

  function rekHent(noegle) { try { return JSON.parse(localStorage.getItem(noegle) || "[]"); } catch (e) { return []; } }
  function rekGem(noegle, v) { try { localStorage.setItem(noegle, JSON.stringify(v)); } catch (e) {} }
  function rekRens(t) { return typeof rens === "function" ? rens(t == null ? "" : String(t)) : String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function rekRolle() { return typeof minRolle === "function" ? minRolle() : (EJERE.indexOf(FIGUR.navn) >= 0 ? "ejer" : null); }
  function rekMaa() { const r = rekRolle(); return r === "ejer" || r === "eventvaert" || r === "eventfolk"; }
  function rekOnline() { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function rekFejltekst(e) { return /function|schema cache|does not exist/i.test(e.message) ? REK_MANGLER : e.message; }
  function rekKl(t) { const d = new Date(t); return ("0" + d.getHours()).slice(-2) + "." + ("0" + d.getMinutes()).slice(-2); }

  // ----- Rummene man kan holde event i -----
  function rekRumListe() {
    const ud = [{ id: "hal", navn: "Velkomsthallen" }];
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
    return ud;
  }
  function rekHerNu() { return rumValg === "hal" ? "hal" : aktivtVaerelse; }
  function rekErHer(r) { return (r.rum || "hal") === rekHerNu(); }
  function rekFoelg(r) {
    if (rekErHer(r)) return;
    if (!r.rum || r.rum === "hal") skiftRum("hal");
    else gaaTilVaerelse(r.rum);
  }

  // ----- Effekterne (små ting der flyver rundt på skiltet) -----
  function rekFxHtml(effekt) {
    const tegn = { glimmer: ["✨", "⭐", "✦"], konfetti: ["▮", "▮", "●", "▮"], hjerter: ["💖", "💕", "💗"], fyrvaerkeri: ["🎆", "🎇", "✨"] }[effekt];
    if (!tegn) return "";
    const farver = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#ff7eb6"];
    let html = "<span class='rek-fx-lag'>";
    for (let i = 0; i < 14; i++) {
      const ven = (3 + i * 7) % 96, ned = (10 + i * 23) % 80;
      html += "<span class='rek-fx rek-fx-" + effekt + "' style='left:" + ven + "%;" + (effekt === "glimmer" || effekt === "fyrvaerkeri" ? "top:" + ned + "%;" : "") +
        "animation-delay:" + (i * 0.29 % 2.4).toFixed(2) + "s;" + (effekt === "konfetti" ? "color:" + farver[i % farver.length] + ";" : "") + "'>" + tegn[i % tegn.length] + "</span>";
    }
    return html + "</span>";
  }

  // ----- Selve skiltet -----
  function rekSkiltHtml(r, proeve) {
    const st = r.stil || {};
    const fid = REK_FARVER[st.farve] ? st.farve : (REK_FARVER.guld ? "guld" : Object.keys(REK_FARVER)[0]);
    const f = REK_FARVER[fid];
    const eff = REK_EFFEKTER[st.effekt] ? st.effekt : "ingen";
    const her = !proeve && rekErHer(r);
    const knapTekst = fid === "nat" ? "#1d2638" : "#fff";
    return "<div class='rek-skilt rek-eff-" + eff + "' style='background:" + f.bg + ";border-color:" + f.kant + ";--rek-ring:" + f.ring + ";--rek-kant:" + f.kant + "'>" +
      rekFxHtml(eff) +
      (proeve ? "" : "<button class='rek-luk' data-rek-luk='" + r.id + "' title='Luk'>✕</button>") +
      "<div class='rek-top' style='color:" + f.under + "'>📣 Event lige nu</div>" +
      "<div class='rek-emoji'>" + rekRens(st.emoji || "🎉") + "</div>" +
      "<h2 style='color:" + f.titel + "'><b>" + rekRens(r.hvem) + "</b> holder <span style='color:" + (f.skygge || f.kant) + "'>" + rekRens(r.event || "et event") + "</span>!</h2>" +
      (r.tekst ? "<p class='rek-tekst' style='color:" + f.under + "'>" + rekRens(r.tekst) + "</p>" : "") +
      "<p class='rek-hvor' style='color:" + f.under + "'>📍 " + rekRens(r.rum_navn || "Velkomsthallen") + (r.slut ? " · til kl. " + rekKl(r.slut) : "") + "</p>" +
      "<div class='rek-knapper'>" +
        "<button class='rek-foelg' data-rek-foelg='" + r.id + "' style='background:" + f.kant + ";color:" + knapTekst + ";box-shadow:0 3px 0 " + (f.skygge || f.kant) + "'" + (her ? " disabled" : "") + ">" + (her ? "✓ Du er her" : "➡ Følg") + "</button>" +
        (proeve ? "" : "<button class='rek-ikke' data-rek-luk='" + r.id + "'>Ikke nu</button>") +
      "</div></div>";
  }

  const rekLag = document.createElement("div");
  rekLag.id = "rek-lag";
  rekLag.hidden = true;
  document.body.appendChild(rekLag);

  const rekPille = document.createElement("button");
  rekPille.id = "rek-pille";
  rekPille.hidden = true;
  document.body.appendChild(rekPille);

  function rekSynlige() {
    const lukket = rekHent(REK_LUKKET_NOEGLE);
    return rekListe.filter(function (r) { return lukket.indexOf(r.id) < 0; });
  }
  function rekLuk(id) {
    const l = rekHent(REK_LUKKET_NOEGLE);
    if (l.indexOf(id) < 0) l.push(id);
    rekGem(REK_LUKKET_NOEGLE, l.slice(-60));
    rekTegnSkilt();
  }
  function rekTegnSkilt() {
    const synlige = rekSynlige();
    const r = synlige[0];
    const lukkede = rekListe.filter(function (x) { return synlige.indexOf(x) < 0; });
    const noegle = JSON.stringify([r || null, r ? rekErHer(r) : 0, lukkede.map(function (x) { return x.id; }), lukkede[0] ? rekErHer(lukkede[0]) : 0]);
    if (noegle === rekSkiltFoer) return;
    const nyt = !!r && r.id !== rekVistId;
    rekVistId = r ? r.id : null;
    rekSkiltFoer = noegle;

    rekLag.innerHTML = r ? "<div class='rek-ramme" + (nyt ? " rek-ind" : "") + "'>" + rekSkiltHtml(r, false) +
      (synlige.length > 1 ? "<div class='rek-flere'>+" + (synlige.length - 1) + " event mere</div>" : "") + "</div>" : "";
    rekLag.hidden = !r;
    rekLag.querySelectorAll("[data-rek-luk]").forEach(function (k) {
      k.addEventListener("click", function () { rekLuk(+k.dataset.rekLuk); });
    });
    rekLag.querySelectorAll("[data-rek-foelg]").forEach(function (k) {
      k.addEventListener("click", function () {
        const ev = rekListe.find(function (x) { return x.id === +k.dataset.rekFoelg; });
        if (!ev) return;
        rekLuk(ev.id);
        rekFoelg(ev);
      });
    });

    // Lukkede events står som en lille knap nederst, så man kan følge med senere
    const p = lukkede[0];
    rekPille.hidden = !p || !!r || rekErHer(p);     // ikke når man allerede er der
    if (p) {
      rekPille.textContent = ((p.stil && p.stil.emoji) || "🎪") + " " + p.hvem + " holder " + p.event + " · ➡ Følg";
      rekPille.dataset.id = p.id;
    }
  }
  rekPille.addEventListener("click", function () {
    const id = +rekPille.dataset.id;
    rekGem(REK_LUKKET_NOEGLE, rekHent(REK_LUKKET_NOEGLE).filter(function (x) { return x !== id; }));
    rekTegnSkilt();
  });

  // ----- Hent events fra serveren -----
  function rekNyListe(liste) {
    const nu = Date.now();
    rekListe = (liste || []).filter(function (r) { return new Date(r.slut).getTime() > nu; })
      .map(function (r) { return Object.assign({}, r, { id: +r.id }); });
    rekTegnSkilt();
    rekTegnIGang();
  }
  function rekHentAlle() {
    if (!(typeof SERVER !== "undefined" && SERVER.til)) { rekNyListe(rekHent(REK_LOKAL_NOEGLE)); return; }
    serverKald("hv_reklamer_hent", {}).then(function (svar) { rekFejl = ""; rekNyListe(svar); })
      .catch(function (e) { rekFejl = rekFejltekst(e); rekNyListe([]); });
  }
  rekHentAlle();
  setInterval(rekHentAlle, 4000);
  setInterval(rekTegnSkilt, 1000);      // så "Du er her" skifter, når man går ind i rummet

  function rekSend(data) {
    if (!(typeof SERVER !== "undefined" && SERVER.til)) {
      const l = rekHent(REK_LOKAL_NOEGLE);
      const id = Date.now();
      l.unshift({ id: id, hvem: FIGUR.navn, event: data.p_event.trim(), tekst: data.p_tekst.trim(), rum: data.p_rum, rum_navn: data.p_rum_navn,
        stil: data.p_stil, tid: new Date().toISOString(), slut: new Date(Date.now() + data.p_minutter * 60000).toISOString() });
      rekGem(REK_LOKAL_NOEGLE, l.slice(0, 20));
      return Promise.resolve({ id: id });
    }
    return serverKald("hv_reklame_send", Object.assign({ p_token: mitToken() }, data));
  }
  function rekStop(id) {
    if (!(typeof SERVER !== "undefined" && SERVER.til)) {
      rekGem(REK_LOKAL_NOEGLE, rekHent(REK_LOKAL_NOEGLE).filter(function (r) { return +r.id !== id; }));
      return Promise.resolve();
    }
    return serverKald("hv_reklame_stop", { p_token: mitToken(), p_id: id });
  }

  // -------------------------------------------------------------
  //  I panelet: Events og nyheder
  // -------------------------------------------------------------
  function rekToKlik(knap, gør) {
    knap.addEventListener("click", function () {
      if (!knap.classList.contains("sikker")) {
        knap.classList.add("sikker");
        knap.dataset.tekst = knap.textContent;
        knap.textContent = "Er du sikker? Tryk igen";
        setTimeout(function () { if (knap.isConnected) { knap.classList.remove("sikker"); knap.textContent = knap.dataset.tekst; } }, 3000);
        return;
      }
      gør();
    });
  }

  function rekTegnIGang() {
    const boks = document.getElementById("rek-i-gang");
    if (!boks) return;
    let html = rekFejl ? "<p class='ev-fejl rek-fejl'>" + rekRens(rekFejl) + "</p>" : "";
    html += rekListe.length ? "<ul class='rek-liste'>" + rekListe.map(function (r) {
      return "<li><span class='rek-l-emoji'>" + rekRens((r.stil && r.stil.emoji) || "🎪") + "</span><div><b>" + rekRens(r.hvem) + " holder " + rekRens(r.event) + "</b>" +
        "<small>📍 " + rekRens(r.rum_navn || "Velkomsthallen") + " · til kl. " + rekKl(r.slut) + "</small></div>" +
        "<button class='lille rek-stop' data-rek-stop='" + r.id + "'>⏹ Stop eventet</button></li>";
    }).join("") + "</ul>" : "<p class='tom'>Der er ingen events i gang lige nu.</p>";
    const foer = boks.dataset.html;
    if (foer === html) return;
    boks.dataset.html = html;
    boks.innerHTML = html;
    boks.querySelectorAll("[data-rek-stop]").forEach(function (k) {
      rekToKlik(k, function () {
        k.disabled = true;
        const ev = rekListe.find(function (x) { return x.id === +k.dataset.rekStop; });
        rekStop(+k.dataset.rekStop).then(function () {
          if (ev && typeof adminSkriv === "function") adminSkriv("Stoppede eventet: " + ev.event);
          rekHentAlle();
        }).catch(function (e) { k.disabled = false; besked.textContent = rekFejltekst(e); });
      });
    });
  }

  function rekSektion() {
    const sek = document.createElement("section");
    sek.className = "ev-skriv rek-skriv";
    const rum = rekRumListe(), her = rekHerNu();
    sek.innerHTML = "<h3>🎪 Hold et event</h3>" +
      "<p class='ejer-info'>Et stort skilt kommer midt på skærmen hos <b>alle</b>, med en <b>➡ Følg</b>-knap, der tager dem hen til rummet.</p>" +
      "<label class='ejer-felt'>Hvad holder du?<input id='rek-event' type='text' maxlength='60' placeholder='Fx Quiz, Modeshow, Gemmeleg'></label>" +
      "<label class='ejer-felt'>Lidt mere tekst (kan udelades)<input id='rek-tekst' type='text' maxlength='160' placeholder='Fx Vinderen får 50 Glimt! Kom og vær med 🎉'></label>" +
      "<label class='ejer-felt'>Hvor er eventet?<select id='rek-rum'>" + rum.map(function (r) {
        return "<option value='" + rekRens(r.id) + "'" + (r.id === her ? " selected" : "") + ">" + rekRens(r.navn) + (r.id === her ? " (her er du nu)" : "") + "</option>";
      }).join("") + "</select></label>" +
      "<label class='ejer-felt'>Hvor længe skal skiltet vises?<select id='rek-tid'>" + REK_TIDER.map(function (t) {
        return "<option value='" + t[0] + "'" + (t[0] === +rekValg.minutter ? " selected" : "") + ">" + t[1] + "</option>";
      }).join("") + "</select></label>" +
      "<div class='bs-raekke'><span class='bs-lbl'>😀 Emoji</span><div class='bs-pynt rek-emojier'>" + REK_EMOJIER.map(function (e) {
        return "<button type='button' data-rek-emoji='" + e + "'" + (e === rekValg.emoji ? " class='valgt'" : "") + ">" + e + "</button>";
      }).join("") + "</div></div>" +
      "<div class='bs-raekke'><span class='bs-lbl'>🎨 Farve</span><div class='bs-farver'>" + Object.keys(REK_FARVER).map(function (id) {
        return "<button type='button' data-rek-farve='" + id + "' title='" + rekRens(REK_FARVER[id].navn) + "' style='background:" + (id === "nat" ? "#1d2638" : REK_FARVER[id].kant) + "'" + (id === rekValg.farve ? " class='valgt'" : "") + "></button>";
      }).join("") + "</div></div>" +
      "<div class='bs-raekke'><span class='bs-lbl'>✨ Effekt</span><div class='bs-pynt'>" + Object.keys(REK_EFFEKTER).map(function (id) {
        return "<button type='button' data-rek-effekt='" + id + "'" + (id === rekValg.effekt ? " class='valgt'" : "") + ">" + REK_EFFEKTER[id].ikon + " " + REK_EFFEKTER[id].navn + "</button>";
      }).join("") + "</div></div>" +
      "<div class='bs-lbl'>👀 Sådan kommer skiltet til at se ud</div><div id='rek-proeve'></div>" +
      "<button id='rek-send'>📣 Send skiltet ud til alle</button><p class='ejer-info' id='rek-svar'></p>" +
      "<h4>🎪 Events i gang lige nu</h4><div id='rek-i-gang'></div>";

    function felt(id) { return sek.querySelector("#" + id); }
    function proeve() {
      const valgt = felt("rek-rum").selectedOptions[0];
      felt("rek-proeve").innerHTML = rekSkiltHtml({ id: 0, hvem: FIGUR.navn, event: felt("rek-event").value.trim() || "…", tekst: felt("rek-tekst").value.trim(),
        rum_navn: valgt ? valgt.textContent.replace(" (her er du nu)", "") : "", slut: Date.now() + (+felt("rek-tid").value) * 60000, stil: rekValg }, true);
    }
    function vaelg(hvad, v) {
      rekValg[hvad] = v;
      rekGem(REK_VALG_NOEGLE, rekValg);
      sek.querySelectorAll("[data-rek-" + hvad + "]").forEach(function (k) { k.classList.toggle("valgt", k.getAttribute("data-rek-" + hvad) === v); });
      proeve();
    }
    ["emoji", "farve", "effekt"].forEach(function (hvad) {
      sek.querySelectorAll("[data-rek-" + hvad + "]").forEach(function (k) {
        k.addEventListener("click", function () { vaelg(hvad, k.getAttribute("data-rek-" + hvad)); });
      });
    });
    ["rek-event", "rek-tekst"].forEach(function (id) { felt(id).addEventListener("input", proeve); });
    felt("rek-rum").addEventListener("change", proeve);
    felt("rek-tid").addEventListener("change", function () { rekValg.minutter = +this.value; rekGem(REK_VALG_NOEGLE, rekValg); proeve(); });

    felt("rek-send").addEventListener("click", function () {
      const knap = this, svar = felt("rek-svar");
      const event = felt("rek-event").value.trim();
      if (!event) { svar.textContent = "Skriv hvad du holder først 🙂"; felt("rek-event").focus(); return; }
      const valgt = felt("rek-rum").selectedOptions[0];
      knap.disabled = true;
      rekSend({ p_event: event, p_tekst: felt("rek-tekst").value, p_rum: felt("rek-rum").value === "hal" ? "" : felt("rek-rum").value,
        p_rum_navn: valgt ? valgt.textContent.replace(" (her er du nu)", "") : "", p_stil: { farve: rekValg.farve, emoji: rekValg.emoji, effekt: rekValg.effekt },
        p_minutter: +felt("rek-tid").value }).then(function () {
        if (typeof adminSkriv === "function") adminSkriv("Holder et event: " + event);
        besked.textContent = "📣 Skiltet er sendt ud til alle.";
        knap.disabled = false;
        felt("rek-event").value = ""; felt("rek-tekst").value = "";
        svar.textContent = "📣 Skiltet er sendt ud til alle!";
        proeve();
        rekHentAlle();
      }).catch(function (e) { knap.disabled = false; svar.textContent = rekFejltekst(e); });
    });
    setTimeout(function () { proeve(); rekTegnIGang(); }, 0);
    return sek;
  }

  // Vinder-boksen fra fanen 🏆 Vindere står nu også her
  function rekVinderSektion() {
    if (typeof visVinderFane !== "function") return null;
    const sek = document.createElement("div");
    sek.className = "ev-fane rek-vindere";
    ejerIndhold.appendChild(sek);      // skal stå i panelet, før felterne kan findes
    visVinderFane(sek);
    return sek;
  }

  function rekKobl() {
    if (typeof visEvents !== "function" || typeof ROLLE_FANER === "undefined") { setTimeout(rekKobl, 300); return; }
    // Eventfolk får også fanen Events og nyheder (men kun med events og vindere)
    function eventfolkFane() {
      if (ROLLE_FANER.eventfolk && ROLLE_FANER.eventfolk.indexOf("events") < 0) ROLLE_FANER.eventfolk.push("events");
      const k = document.querySelector('#ejer-faner [data-fane="events"]');
      if (k && rekRolle()) k.hidden = !rolleMaa("events");
    }
    eventfolkFane();
    setInterval(eventfolkFane, 1000);

    const visEventsFoerReklame = visEvents;
    visEvents = function () {
      visEventsFoerReklame();
      if (!rekMaa()) return;
      if (rekRolle() === "eventfolk") ejerIndhold.innerHTML = "";     // Eventfolk sender ikke nyheder
      ejerIndhold.prepend(rekSektion());
      rekVinderSektion();
    };
    if (typeof PANEL_HJAELP !== "undefined" && PANEL_HJAELP.events && PANEL_HJAELP.events.punkter) {
      PANEL_HJAELP.events.punkter.unshift("🎪 <b>Hold et event</b>: skriv hvad du holder, vælg rum, emoji, farve og effekt, og tryk <b>Send skiltet ud til alle</b>. Alle får et stort skilt midt på skærmen med en <b>➡ Følg</b>-knap.");
      PANEL_HJAELP.events.punkter.push("🏆 <b>Skriv vinderne ind</b> står nederst: vinderne kommer i en boks i højre side for alle.");
    }
    if (typeof tegnPanelIgen === "function") tegnPanelIgen(["events"]);
  }
  rekKobl();

  // -------------------------------------------------------------
  //  Udseendet
  // -------------------------------------------------------------
  const st = document.createElement("style");
  st.textContent =
    "#rek-lag { position: fixed; inset: 0; z-index: 58; display: flex; align-items: center; justify-content: center; pointer-events: none; }" +
    "#rek-lag[hidden] { display: none; }" +
    ".rek-ramme { pointer-events: auto; display: flex; flex-direction: column; align-items: center; gap: 6px; }" +
    ".rek-ind { animation: rek-ind .6s cubic-bezier(.2, 1.6, .4, 1); }" +
    "@keyframes rek-ind { 0% { transform: scale(.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }" +
    ".rek-skilt { position: relative; overflow: hidden; box-sizing: border-box; width: min(440px, 92vw); padding: 16px 20px 18px; text-align: center;" +
    " border: 4px solid; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 0 0 3px var(--rek-ring); font: 13px Verdana, sans-serif; }" +
    ".rek-skilt > :not(.rek-fx-lag) { position: relative; }" +
    ".rek-skilt > .rek-luk { position: absolute; z-index: 2; top: 8px; right: 8px; width: 26px; height: 26px; padding: 0; border: 0; border-radius: 8px;" +
    " background: rgba(255,255,255,.6); color: #333; font-size: 13px; cursor: pointer; } .rek-luk:hover { background: #fff; }" +
    ".rek-top { font-weight: bold; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }" +
    ".rek-emoji { font-size: 46px; line-height: 1.15; margin: 2px 0; animation: rek-emoji 1.4s ease-in-out infinite; }" +
    "@keyframes rek-emoji { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-6px) rotate(6deg); } }" +
    ".rek-skilt h2 { margin: 2px 0 6px; font: bold 22px Georgia, 'Times New Roman', serif; line-height: 1.25; word-break: break-word; }" +
    ".rek-skilt h2 span { text-decoration: underline wavy; text-underline-offset: 4px; text-decoration-thickness: 1px; }" +
    ".rek-tekst { margin: 0 0 6px; font-size: 13px; word-break: break-word; } .rek-hvor { margin: 0 0 12px; font-size: 12px; font-weight: bold; }" +
    ".rek-knapper { display: flex; gap: 8px; justify-content: center; }" +
    ".rek-foelg { padding: 9px 26px; border: 0; border-radius: 10px; font: bold 16px Verdana, sans-serif; cursor: pointer; animation: rek-puls 1.6s ease-in-out infinite; }" +
    ".rek-foelg:hover { filter: brightness(1.12); } .rek-foelg:disabled { animation: none; opacity: .75; cursor: default; }" +
    "@keyframes rek-puls { 50% { transform: scale(1.06); } }" +
    ".rek-ikke { padding: 9px 14px; border: 1px solid rgba(0,0,0,.2); border-radius: 10px; background: rgba(255,255,255,.7); color: #444; font: 13px Verdana, sans-serif; cursor: pointer; }" +
    ".rek-flere { padding: 3px 10px; border-radius: 10px; background: rgba(0,0,0,.55); color: #fff; font: 11px Verdana, sans-serif; }" +
    "#rek-pille { position: fixed; z-index: 44; left: 50%; bottom: 84px; transform: translateX(-50%); max-width: 90vw; padding: 7px 14px; border: 2px solid #b8901c;" +
    " border-radius: 20px; background: linear-gradient(#fffbea, #f8e6a8); color: #5a4300; font: bold 12px Verdana, sans-serif; cursor: pointer;" +
    " white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 3px 10px rgba(0,0,0,.3); animation: rek-puls 2s ease-in-out infinite; }" +
    "#rek-pille[hidden] { display: none; }" +
    // effekter
    ".rek-fx-lag { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 12px; }" +
    ".rek-fx { position: absolute; top: -16px; font-size: 14px; opacity: 0; animation: rek-fald 3s linear infinite; }" +
    ".rek-fx-konfetti { font-size: 10px; }" +
    ".rek-fx-hjerter { top: auto; bottom: -18px; animation-name: rek-stig; }" +
    ".rek-fx-glimmer { animation: rek-blinke 2.2s ease-in-out infinite; }" +
    ".rek-fx-fyrvaerkeri { font-size: 22px; animation: rek-bang 2.4s ease-out infinite; }" +
    "@keyframes rek-fald { 0% { transform: translateY(0) rotate(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(300px) rotate(360deg); opacity: 0; } }" +
    "@keyframes rek-stig { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-300px); opacity: 0; } }" +
    "@keyframes rek-blinke { 0%, 100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1.2); } }" +
    "@keyframes rek-bang { 0% { opacity: 0; transform: scale(.1); } 25% { opacity: 1; transform: scale(1.3); } 60%, 100% { opacity: 0; transform: scale(1.8); } }" +
    ".rek-eff-gloed { animation: rek-gloed 1.8s ease-in-out infinite; }" +
    "@keyframes rek-gloed { 50% { box-shadow: 0 0 34px 10px var(--rek-ring), inset 0 0 0 3px var(--rek-ring); } }" +
    ".rek-eff-regnbue { animation: rek-regnbue 3s linear infinite; }" +
    "@keyframes rek-regnbue { 0% { border-color: #e74c3c; } 20% { border-color: #f1c40f; } 40% { border-color: #2ecc71; } 60% { border-color: #3498db; } 80% { border-color: #9b59b6; } 100% { border-color: #e74c3c; } }" +
    ".rek-eff-hop { animation: rek-hop 1.6s ease-in-out infinite; }" +
    "@keyframes rek-hop { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-12px); } }" +
    ".rek-eff-ryst { animation: rek-ryst 2.5s ease-in-out infinite; }" +
    "@keyframes rek-ryst { 0%, 80%, 100% { transform: rotate(0); } 84% { transform: rotate(-3deg); } 88% { transform: rotate(3deg); } 92% { transform: rotate(-2deg); } 96% { transform: rotate(2deg); } }" +
    ".rek-eff-blink { animation: rek-blink 1s steps(2, start) infinite; }" +
    "@keyframes rek-blink { 50% { border-color: var(--rek-ring); box-shadow: 0 0 0 6px var(--rek-ring), 0 10px 30px rgba(0,0,0,.45); } }" +
    // i panelet
    "#ejer-indhold #rek-proeve { margin: 6px 0 10px; }" +
    "#ejer-indhold #rek-proeve .rek-skilt { width: 100%; max-width: 440px; }" +
    "#ejer-indhold #rek-proeve h2 { margin: 2px 0 6px; padding: 0; border: 0; background: none; font: bold 20px Georgia, serif; text-transform: none; letter-spacing: normal; }" +
    "#ejer-indhold #rek-proeve p { margin: 0 0 6px; padding: 0; border: 0; background: none; }" +
    "#ejer-indhold #rek-proeve .rek-foelg { width: auto; }" +
    "#ejer-indhold .rek-skriv select { width: 100%; box-sizing: border-box; font: 13px Verdana, sans-serif; }" +
    "#ejer-indhold .rek-emojier button { width: 34px; padding: 2px 0; font-size: 18px; }" +
    "#ejer-indhold ul.rek-liste { list-style: none; margin: 0; padding: 0; }" +
    "#ejer-indhold ul.rek-liste li { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; padding: 8px 10px; background: #fff; border: 1px solid #d6e8c8; border-radius: 8px; }" +
    "#ejer-indhold ul.rek-liste li > div { flex: 1; display: flex; flex-direction: column; gap: 2px; } #ejer-indhold ul.rek-liste small { color: #7a8a76; }" +
    "#ejer-indhold .rek-l-emoji { font-size: 24px; }" +
    "#ejer-indhold .rek-stop.sikker { background: #c0392b; color: #fff; }" +
    "#ejer-indhold .rek-vindere { margin-top: 14px; }";
  document.head.appendChild(st);
})();
