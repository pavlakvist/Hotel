// =============================================================
//  ✨ Det enkle Ejerpanel
//  Gør Ejerpanelet (og MOD-, Eventvært- og staff-panelet) mere overskueligt:
//   • Øverst: HELLO VERA + søgefelt (spillere og faner) + 🎨 farvevalg
//   • Til venstre: 8 grupper (Oversigt, Spillere, Moderation, Events, Rum,
//     Økonomi, Personale, System) + en Hurtigmenu
//   • Over indholdet: de faner, der hører til den valgte gruppe
//   • Oversigt: ⭐ Favoritter, som man selv vælger
//  Alle de gamle faner og knapper er de samme som før – de er bare sorteret.
//
//  🎨 Farvevalg (lige ved siden af månen 🌙): Vinrød, Gul, Blå, Grøn, Lyserød, Sort.
//  Månen skifter stadig mellem lyst og mørkt. Hver person vælger selv,
//  og valget huskes på computeren (mit-hotel-panel-farve-<navn>).
//  Slå det nye panel fra: localStorage mit-hotel-enkelt-panel = "fra".
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.)
// =============================================================
(function () {
  let fra = false;
  try { fra = localStorage.getItem("mit-hotel-enkelt-panel") === "fra"; } catch (e) {}
  const vindue = document.getElementById("ejer-vindue");
  if (fra || !vindue || vindue.classList.contains("ee-ny")) return;
  const boks = vindue.querySelector(".ejer-boks");
  const top = vindue.querySelector(".ejer-top");
  const faner = document.getElementById("ejer-faner");
  const indhold = document.getElementById("ejer-indhold");
  if (!boks || !top || !faner || !indhold) return;

  function rensT(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function hent(n, std) { try { const v = localStorage.getItem(n); return v == null ? std : JSON.parse(v); } catch (e) { return std; } }
  function gem(n, v) { try { localStorage.setItem(n, JSON.stringify(v)); } catch (e) {} }
  function mitNavn() { return String((typeof FIGUR !== "undefined" && FIGUR.navn) || "").toLowerCase(); }

  // -----------------------------------------------------------
  //  Grupperne og hvilke faner der hører til hver
  // -----------------------------------------------------------
  const GRUPPER = [
    { id: "oversigt",   ikon: "🏠", navn: "Oversigt",   faner: ["oversigt", "guide", "mitjob"] },
    { id: "spillere",   ikon: "👥", navn: "Spillere",   faner: ["spillere", "chat", "beskeder", "ip", "sletbruger"] },
    { id: "moderation", ikon: "🛡️", navn: "Moderation", faner: ["rapporter", "strafrapporter", "adminlog"] },
    { id: "events",     ikon: "📅", navn: "Events",     faner: ["events", "eventnoter", "vindere", "biograf", "cinema", "loppe"] },
    { id: "rum",        ikon: "🛋️", navn: "Rum",        faner: ["rum"] },
    { id: "oekonomi",   ikon: "🪙", navn: "Økonomi",    faner: ["valuta", "veksel", "vip", "rares"] },
    { id: "personale",  ikon: "🪪", navn: "Personale",  faner: ["ansaettelse", "loen", "staffchat", "vagtskema", "ansoegninger"] },
    { id: "radio",      ikon: "📻", navn: "Radio",      faner: ["radio"] },
    { id: "system",     ikon: "⚙️", navn: "System",     faner: ["system"] },
  ];
  function gruppeFor(fane) {
    for (let i = 0; i < GRUPPER.length; i++) if (GRUPPER[i].faner.indexOf(fane) >= 0) return GRUPPER[i];
    return GRUPPER[GRUPPER.length - 1];      // nye faner, som ingen gruppe kender, kommer under System
  }
  function knapper() { return Array.from(faner.querySelectorAll(":scope > button[data-fane]")); }
  function synlig(k) { return !k.hidden; }
  function fanensKnap(fane) { return knapper().find(function (k) { return k.dataset.fane === fane; }); }
  function fanensNavn(k) {
    // teksten på knappen uden ikon og uden tal (fx "🚩 Rapporter og moderation 3")
    const kopi = k.cloneNode(true);
    kopi.querySelectorAll("span").forEach(function (s) { s.remove(); });
    return kopi.textContent.trim();
  }
  function aabnFane(fane) {
    const k = fanensKnap(fane);
    if (k && synlig(k)) k.click();
  }

  // -----------------------------------------------------------
  //  Ny opbygning
  // -----------------------------------------------------------
  vindue.classList.add("ee-ny");

  // Toppen: HELLO VERA | titel + søgefelt
  const titel = top.querySelector("h2");
  const maerke = document.createElement("div");
  maerke.className = "ee-maerke";
  maerke.innerHTML = "<span class='ee-krone'>👑</span><b>HELLO VERA</b><i></i>";
  top.insertBefore(maerke, titel);
  const soegBoks = document.createElement("div");
  soegBoks.className = "ee-soeg";
  soegBoks.innerHTML = "<span>🔍</span><input type='text' id='ee-soeg' placeholder='Søg på spiller eller fane …' autocomplete='off'>" +
    "<div id='ee-soeg-liste' hidden></div>";
  titel.after(soegBoks);

  // Siden: grupperne + hurtigmenu
  const side = document.createElement("aside");
  side.id = "ee-side";
  side.innerHTML = "<nav id='ee-grupper'></nav>" +
    "<div id='ee-hurtig'><button type='button' class='ee-hurtig-top'>⚡ Hurtigmenu <span class='ee-pil'>▴</span></button>" +
    "<div class='ee-hurtig-liste'></div></div>";
  boks.insertBefore(side, faner);
  const grupperNav = side.querySelector("#ee-grupper");
  const hurtig = side.querySelector("#ee-hurtig");

  let aktivGruppe = "oversigt";
  const sidsteIGruppe = hent("mit-hotel-panel-sidste-fane", {});

  function tegnGrupper() {
    const valgt = knapper().find(function (k) { return k.classList.contains("valgt"); });
    if (valgt) aktivGruppe = gruppeFor(valgt.dataset.fane).id;
    let html = "";
    GRUPPER.forEach(function (g) {
      const mine = knapper().filter(function (k) { return synlig(k) && gruppeFor(k.dataset.fane) === g; });
      if (!mine.length) return;
      // tal (fx nye rapporter) fra fanerne i gruppen
      let tal = 0;
      mine.forEach(function (k) { k.querySelectorAll("span").forEach(function (s) { const n = parseInt(s.textContent, 10); if (n > 0) tal += n; }); });
      html += "<button type='button' data-gruppe='" + g.id + "'" + (g.id === aktivGruppe ? " class='valgt'" : "") + ">" +
        "<span class='ee-ikon'>" + g.ikon + "</span><span class='ee-navn'>" + g.navn + "</span>" +
        (tal ? "<em class='ee-tal'>" + tal + "</em>" : "") + "</button>";
    });
    if (grupperNav.innerHTML !== html) grupperNav.innerHTML = html;
    // vis kun fanerne i den valgte gruppe ovenover indholdet
    const gruppe = GRUPPER.find(function (g) { return g.id === aktivGruppe; });
    let antal = 0;
    knapper().forEach(function (k) {
      const med = gruppeFor(k.dataset.fane) === gruppe;
      k.classList.toggle("ee-ude", !med);
      if (med && synlig(k)) antal++;
    });
    faner.classList.toggle("ee-en", antal <= 1);
    if (valgt) { sidsteIGruppe[aktivGruppe] = valgt.dataset.fane; }
    tegnHurtig();
  }
  grupperNav.addEventListener("click", function (e) {
    const b = e.target.closest("button[data-gruppe]");
    if (!b) return;
    const g = GRUPPER.find(function (x) { return x.id === b.dataset.gruppe; });
    const mine = knapper().filter(function (k) { return synlig(k) && gruppeFor(k.dataset.fane) === g; });
    if (!mine.length) return;
    // åbn den fane, man sidst brugte i gruppen (ellers den første)
    const sidste = mine.find(function (k) { return k.dataset.fane === sidsteIGruppe[g.id]; });
    aktivGruppe = g.id;
    (sidste || mine[0]).click();
    gem("mit-hotel-panel-sidste-fane", sidsteIGruppe);
    tegnGrupper();
  });

  // Når en fane bliver valgt, eller en fane kommer til / bliver skjult
  let venter = false;
  function snart() {
    if (venter) return;
    venter = true;
    requestAnimationFrame(function () { venter = false; tegnGrupper(); })
  }
  new MutationObserver(snart).observe(faner, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"], characterData: true });

  // -----------------------------------------------------------
  //  ⚡ Hurtigmenu (kun genveje til ting, panelet allerede kan)
  // -----------------------------------------------------------
  const HURTIG = [
    { fane: "events",      tekst: "Send nyhed" },
    { fane: "spillere",    tekst: "Tjek spiller", soeg: true },
    { fane: "rapporter",   tekst: "Se rapporter" },
    { fane: "valuta",      tekst: "Giv Glimt / Stella" },
    { fane: "ansaettelse", tekst: "Ansæt en ansat" },
    { fane: "staffchat",   tekst: "Skriv i staff chat" },
  ];
  let hurtigLukket = hent("mit-hotel-panel-hurtig-lukket", false);
  function tegnHurtig() {
    hurtig.classList.toggle("lukket", !!hurtigLukket);
    const html = HURTIG.filter(function (h) { const k = fanensKnap(h.fane); return k && synlig(k); }).map(function (h) {
      return "<button type='button' data-hurtig='" + h.fane + "'" + (h.soeg ? " data-soeg='1'" : "") + "><b>＋</b>" + rensT(h.tekst) + "</button>";
    }).join("");
    const liste = hurtig.querySelector(".ee-hurtig-liste");
    if (liste.innerHTML !== html) liste.innerHTML = html;
    hurtig.hidden = !html;
  }
  hurtig.addEventListener("click", function (e) {
    if (e.target.closest(".ee-hurtig-top")) {
      hurtigLukket = !hurtigLukket;
      gem("mit-hotel-panel-hurtig-lukket", hurtigLukket);
      tegnHurtig();
      return;
    }
    const b = e.target.closest("button[data-hurtig]");
    if (!b) return;
    aabnFane(b.dataset.hurtig);
    if (b.dataset.soeg) setTimeout(function () { const s = document.getElementById("ee-soeg"); if (s) s.focus(); }, 50);
  });

  // -----------------------------------------------------------
  //  🔍 Søgefelt: spillere og faner
  // -----------------------------------------------------------
  const soeg = soegBoks.querySelector("input");
  const soegListe = soegBoks.querySelector("#ee-soeg-liste");
  let fundne = [];
  function spillerNavne() {
    try {
      if (typeof alleSpillere === "function") return alleSpillere().map(function (s) { return s.navn; });
    } catch (e) {}
    return [];
  }
  function visSoeg() {
    const q = soeg.value.trim().toLowerCase();
    fundne = [];
    if (!q) { soegListe.hidden = true; return; }
    const sp = fanensKnap("spillere");
    if (sp && synlig(sp)) {
      const set = {};
      spillerNavne().forEach(function (n) {
        if (set[n] || String(n).toLowerCase().indexOf(q) < 0) return;
        set[n] = true;
        if (fundne.length < 14) fundne.push({ type: "spiller", navn: n, tekst: "👤 " + n, under: "Spiller" });
      });
    }
    knapper().filter(synlig).forEach(function (k) {
      const navn = fanensNavn(k);
      if (navn.toLowerCase().indexOf(q) >= 0) fundne.push({ type: "fane", fane: k.dataset.fane, tekst: navn, under: gruppeFor(k.dataset.fane).navn });
    });
    soegListe.innerHTML = fundne.length ? fundne.map(function (f, i) {
      return "<button type='button' data-i='" + i + "'" + (i === 0 ? " class='forst'" : "") + "><span>" + rensT(f.tekst) + "</span><small>" + rensT(f.under) + "</small></button>";
    }).join("") : "<p>Ingen spiller eller fane hedder sådan.</p>";
    soegListe.hidden = false;
  }
  function vaelg(f) {
    if (!f) return;
    soeg.value = "";
    soegListe.hidden = true;
    if (f.type === "fane") { aabnFane(f.fane); return; }
    try { valgtSpiller = f.navn; } catch (e) {}
    try { ejerFane = "spillere"; } catch (e) {}
    const k = fanensKnap("spillere");
    if (k) k.click(); else if (typeof visFane === "function") visFane();
  }
  soeg.addEventListener("input", visSoeg);
  soeg.addEventListener("focus", visSoeg);
  soeg.addEventListener("keydown", function (e) {
    e.stopPropagation();                       // så man ikke går rundt / chatter, mens man skriver
    if (e.key === "Enter") { e.preventDefault(); vaelg(fundne[0]); }
    if (e.key === "Escape") { soeg.value = ""; soegListe.hidden = true; soeg.blur(); }
  });
  soegListe.addEventListener("mousedown", function (e) {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    e.preventDefault();
    vaelg(fundne[+b.dataset.i]);
  });
  soeg.addEventListener("blur", function () { setTimeout(function () { soegListe.hidden = true; }, 120); });
  // Ctrl+K hopper ned i søgefeltet, når panelet er åbent
  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K") && !vindue.hidden) { e.preventDefault(); soeg.focus(); soeg.select(); }
  });

  // -----------------------------------------------------------
  //  ⭐ Favoritter øverst i Oversigt
  // -----------------------------------------------------------
  const STD_FAV = ["spillere", "rapporter", "events", "valuta"];
  function favNoegle() { return "mit-hotel-panel-favoritter-" + mitNavn(); }
  function mineFav() { return hent(favNoegle(), STD_FAV); }
  let favVaelger = false;
  function tegnFav() {
    const valgt = knapper().find(function (k) { return k.classList.contains("valgt"); });
    if (!valgt || valgt.dataset.fane !== "oversigt") return;
    let boksEl = indhold.querySelector("#ee-fav");
    if (!boksEl) {
      boksEl = document.createElement("section");
      boksEl.id = "ee-fav";
      indhold.prepend(boksEl);
    }
    const fav = mineFav().filter(function (f) { const k = fanensKnap(f); return k && synlig(k); });
    let html = "<div class='ee-fav-top'><h3>⭐ Favoritter</h3><small>Dine mest brugte faner – klik for at åbne</small>" +
      "<button type='button' class='ee-fav-ret'>" + (favVaelger ? "✓ Færdig" : "✏️ Vælg") + "</button></div>";
    if (favVaelger) {
      html += "<div class='ee-fav-vaelg'>" + knapper().filter(function (k) { return synlig(k) && k.dataset.fane !== "oversigt"; }).map(function (k) {
        const med = fav.indexOf(k.dataset.fane) >= 0;
        return "<label><input type='checkbox' data-fav='" + k.dataset.fane + "'" + (med ? " checked" : "") + "> " + rensT(fanensNavn(k)) + "</label>";
      }).join("") + "</div>";
    } else {
      html += "<div class='ee-fav-raekke'>" + fav.map(function (f) {
        const navn = fanensNavn(fanensKnap(f));
        const ikon = navn.split(" ")[0];
        return "<button type='button' data-aabn='" + f + "' title='" + rensT(navn) + "'><span>" + rensT(ikon) + "</span><small>" +
          rensT(navn.slice(ikon.length).trim()) + "</small></button>";
      }).join("") + "<button type='button' class='ee-fav-plus' title='Tilføj favorit'><span>＋</span><small>Tilføj</small></button></div>";
    }
    if (boksEl.innerHTML !== html) boksEl.innerHTML = html;
  }
  indhold.addEventListener("click", function (e) {
    const fav = e.target.closest("#ee-fav");
    if (!fav) return;
    const aabn = e.target.closest("button[data-aabn]");
    if (aabn) { aabnFane(aabn.dataset.aabn); return; }
    if (e.target.closest(".ee-fav-ret, .ee-fav-plus")) { favVaelger = !favVaelger; tegnFav(); }
  });
  indhold.addEventListener("change", function (e) {
    const t = e.target.closest("input[data-fav]");
    if (!t) return;
    let fav = mineFav().filter(function (f) { return f !== t.dataset.fav; });
    if (t.checked) fav.push(t.dataset.fav);
    gem(favNoegle(), fav.slice(0, 10));
  });
  new MutationObserver(function () {
    if (!indhold.querySelector("#ee-fav")) { favVaelger = false; tegnFav(); }
  }).observe(indhold, { childList: true });

  // -----------------------------------------------------------
  //  🎨 Farvevalg (erstatter 🌙/☀️-knappen)
  // -----------------------------------------------------------
  const FARVER = [
    { id: "vinroed",  navn: "Vinrød",  prik: "#7a1f33" },
    { id: "gul",      navn: "Gul",     prik: "#e0a419" },
    { id: "blaa",     navn: "Blå",     prik: "#2f6aa3" },
    { id: "groen",    navn: "Grøn",    prik: "#3f8a4a" },
    { id: "lyseroed", navn: "Lyserød", prik: "#e07aa0" },
    { id: "sort",     navn: "Sort",    prik: "#1b1c21" },
  ];
  function temaNoegle() { return "mit-hotel-panel-farve-" + mitNavn(); }
  function mitTema() {
    let v = null;
    try { v = localStorage.getItem(temaNoegle()); } catch (e) {}
    return FARVER.some(function (f) { return f.id === v; }) ? v : "vinroed";
  }
  const farveKnap = document.createElement("button");
  farveKnap.type = "button";
  farveKnap.className = "su-luk ee-farve-knap";
  farveKnap.title = "Vælg panelets farve";
  farveKnap.innerHTML = "🎨";
  const farveMenu = document.createElement("div");
  farveMenu.id = "ee-farvevalg";
  farveMenu.hidden = true;
  farveMenu.innerHTML = "<b>Panelets farve</b><small>Kun for dig</small>" + FARVER.map(function (f) {
    return "<button type='button' data-farve='" + f.id + "'><i style='background:" + f.prik + "'></i>" + f.navn + "</button>";
  }).join("");
  // 🎨 kommer lige før månen 🌙
  (top.querySelector(".ejer-tema") || top.querySelector(".ejer-stoer") || document.getElementById("ejer-luk")).before(farveKnap);
  top.appendChild(farveMenu);

  function visTema() {
    const t = mitTema();
    vindue.dataset.eeFarve = t;
    farveMenu.querySelectorAll("button").forEach(function (b) { b.classList.toggle("valgt", b.dataset.farve === t); });
  }
  // når panel-tema.js skifter lyst/mørkt (eller man logger ind som en anden), følger farverne med
  try {
    const gammelVis = visPanelTema;
    visPanelTema = function () { gammelVis(); visTema(); };
  } catch (e) {}
  farveKnap.addEventListener("click", function (e) { e.stopPropagation(); farveMenu.hidden = !farveMenu.hidden; });
  farveMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    const b = e.target.closest("button[data-farve]");
    if (!b) return;
    try { localStorage.setItem(temaNoegle(), b.dataset.farve); } catch (er) {}
    visTema();
    farveMenu.hidden = true;
  });
  document.addEventListener("click", function () { farveMenu.hidden = true; });

  // -----------------------------------------------------------
  //  De realistiske træ/læder-vinduer gælder ikke det nye panel
  // -----------------------------------------------------------
  function udenTrae() {
    const s = document.getElementById("realistisk-ui-stil");
    if (!s || s.dataset.eeEnkel) return;
    s.dataset.eeEnkel = "1";
    s.textContent = s.textContent.split("#ejer-vindue:not(.moerkt)").join("#ejer-vindue:not(.moerkt):not(.ee-ny)");
  }
  udenTrae();
  new MutationObserver(udenTrae).observe(document.head, { childList: true });

  // -----------------------------------------------------------
  //  Udseendet
  // -----------------------------------------------------------
  const E = "#ejer-vindue#ejer-vindue.ee-ny";   // stærk nok til at slå de andre stilark
  const P = {
    //            mørk (top)  mørk 2     guld/kant  side       side-hover  indhold    kort       kant       tekst      overskrift
    vinroed:  ["#7a1f33", "#5a1424", "#e3b65c", "#f7e4e4", "#efd0d2", "#fdf6f1", "#fffaf6", "#ecc9cd", "#4a2028", "#7a1f33"],
    gul:      ["#b9820f", "#8c6008", "#ffe08a", "#fdf0c4", "#f8e29c", "#fffcf0", "#fffef8", "#f0dc9c", "#4d3a0c", "#8c6008"],
    blaa:     ["#2f6aa3", "#21507e", "#ffd27a", "#dde9f6", "#c8dbef", "#f5f9fd", "#ffffff", "#c6d9ec", "#1f3448", "#24598c"],
    groen:    ["#3f7f48", "#2d6035", "#f0d27a", "#dff0dc", "#c9e5c4", "#f6fbf4", "#ffffff", "#c6e0c1", "#22382a", "#2f6b38"],
    lyseroed: ["#d0628d", "#a8466f", "#fff0a8", "#fde1ec", "#f9cbdd", "#fff7fa", "#ffffff", "#f5c4d6", "#5a2440", "#b24a78"],
    sort:     ["#2c2d33", "#141518", "#e3b65c", "#e9e9ed", "#dadbe0", "#f8f8fa", "#ffffff", "#d3d4da", "#24252a", "#24252a"],
  };
  let css =
    // panelet lidt større som standard, så der er plads til siden
    "#ejer-vindue.ee-ny { width: min(860px, 100vw); height: min(700px, 100vh); }" +
    E + " .ejer-boks { grid-template-columns: 178px 1fr !important; grid-template-rows: auto auto 1fr !important;" +
      " background: var(--ee-indhold) !important; border: 3px solid var(--ee-moerk) !important; border-radius: 14px !important;" +
      " color: var(--ee-tekst) !important; font: 14px Verdana, sans-serif; box-shadow: 0 14px 40px rgba(0,0,0,.35) !important; }" +
    // toppen
    E + " .ejer-top { grid-column: 1 / 3 !important; gap: 10px; padding: 8px 10px 8px 14px !important; position: relative;" +
      " background: linear-gradient(180deg, var(--ee-moerk), var(--ee-moerk2)) !important; border: 0 !important; box-shadow: 0 2px 0 var(--ee-guld) !important; }" +
    E + " .ee-maerke { display: flex; align-items: center; gap: 7px; color: #fff; white-space: nowrap; }" +
    E + " .ee-maerke b { font: bold 19px Georgia, 'Times New Roman', serif; letter-spacing: .05em; color: #fff; text-shadow: 0 1px 0 rgba(0,0,0,.35); }" +
    E + " .ee-krone { font-size: 20px; }" +
    E + " .ee-maerke i { display: block; width: 2px; height: 24px; background: rgba(255,255,255,.35); margin-left: 6px; }" +
    E + " .ejer-top h2 { flex: 0 1 auto !important; margin: 0 !important; color: #fff !important; font: bold 17px Verdana, sans-serif !important;" +
      " letter-spacing: 0 !important; text-shadow: none !important; white-space: nowrap; }" +
    E + " .ejer-top .su-luk, " + E + " .ejer-top > button { background: rgba(255,255,255,.16) !important; border: 1.5px solid rgba(255,255,255,.45) !important;" +
      " color: #fff !important; box-shadow: none !important; border-radius: 8px !important; text-shadow: none !important; filter: none; }" +
    E + " .ejer-top > button:hover { background: rgba(255,255,255,.3) !important; }" +
    E + " .ee-soeg { flex: 1; min-width: 120px; max-width: 380px; margin-left: auto; position: relative; display: flex; align-items: center;" +
      " background: #fff; border-radius: 9px; padding: 0 8px; border: 2px solid var(--ee-guld); }" +
    E + " .ee-soeg > span { font-size: 13px; opacity: .7; }" +
    E + " .ee-soeg input { flex: 1; min-width: 0; border: 0 !important; outline: 0; background: transparent !important; padding: 6px !important; margin: 0;" +
      " font: 13px Verdana, sans-serif; color: #333 !important; box-shadow: none !important; }" +
    E + " #ee-soeg-liste { position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 5; background: #fff; border-radius: 9px;" +
      " box-shadow: 0 8px 22px rgba(0,0,0,.28); padding: 5px; max-height: 340px; overflow-y: auto; border: 1.5px solid var(--ee-kant); }" +
    E + " #ee-soeg-liste button { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 8px; border: 0 !important;" +
      " background: transparent !important; color: #333 !important; padding: 7px 9px !important; border-radius: 6px; text-align: left; cursor: pointer;" +
      " font: 13px Verdana, sans-serif; box-shadow: none !important; }" +
    E + " #ee-soeg-liste button:hover, " + E + " #ee-soeg-liste button.forst { background: var(--ee-side) !important; }" +
    E + " #ee-soeg-liste small { color: #888; font-size: 11px; }" +
    E + " #ee-soeg-liste p { margin: 6px; color: #777; font-size: 12px; }" +
    E + " .ee-farve-knap { font-size: 15px; }" +
    E + " #ee-farvevalg { position: absolute; right: 52px; top: calc(100% + 6px); z-index: 6; background: #fff; border-radius: 12px;" +
      " box-shadow: 0 10px 26px rgba(0,0,0,.3); padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; width: 230px; color: #333; }" +
    E + " #ee-farvevalg[hidden] { display: none; }" +
    E + " #ee-farvevalg > b { grid-column: 1 / 3; font: bold 13px Verdana, sans-serif; }" +
    E + " #ee-farvevalg > small { grid-column: 1 / 3; color: #888; font-size: 11px; margin: -4px 0 4px; }" +
    E + " #ee-farvevalg button { display: flex; align-items: center; gap: 7px; padding: 6px 8px !important; border: 2px solid #eee !important; border-radius: 8px;" +
      " background: #fafafa !important; color: #333 !important; cursor: pointer; font: 12px Verdana, sans-serif; box-shadow: none !important; text-shadow: none !important; }" +
    E + " #ee-farvevalg button:hover { border-color: #ccc !important; }" +
    E + " #ee-farvevalg button.valgt { border-color: #333 !important; background: #fff !important; font-weight: bold; }" +
    E + " #ee-farvevalg i { width: 18px; height: 18px; border-radius: 50%; display: block; box-shadow: inset 0 0 0 2px rgba(255,255,255,.5), 0 0 0 1px rgba(0,0,0,.2); }" +
    // siden
    E + " #ee-side { grid-column: 1; grid-row: 2 / 4; display: flex; flex-direction: column; gap: 10px; padding: 10px 8px; overflow-y: auto;" +
      " background: var(--ee-side); border-right: 1.5px solid var(--ee-kant); min-height: 0; }" +
    E + " #ee-grupper { display: flex; flex-direction: column; gap: 4px; }" +
    E + " #ee-grupper button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px !important; border: 0 !important;" +
      " border-radius: 10px; background: transparent !important; color: var(--ee-tekst) !important; cursor: pointer; text-align: left;" +
      " font: bold 14px Verdana, sans-serif; box-shadow: none !important; text-shadow: none !important; position: relative; }" +
    E + " #ee-grupper button:not(.valgt):hover { background: var(--ee-hover) !important; }" +
    E + " #ee-grupper button.valgt { background: linear-gradient(180deg, var(--ee-moerk), var(--ee-moerk2)) !important; color: #fff !important;" +
      " box-shadow: 0 2px 6px rgba(0,0,0,.2) !important; }" +
    E + " .ee-ikon { font-size: 19px; width: 24px; text-align: center; }" +
    E + " .ee-navn { flex: 1; }" +
    E + " .ee-tal { font-style: normal; background: #d9534f; color: #fff; border-radius: 10px; padding: 0 6px; font-size: 11px; line-height: 18px; }" +
    E + " #ee-hurtig { margin-top: auto; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--ee-kant); background: var(--ee-indhold); }" +
    E + " #ee-hurtig[hidden] { display: none; }" +
    E + " .ee-hurtig-top { display: flex; width: 100%; justify-content: space-between; align-items: center; padding: 7px 10px !important; border: 0 !important;" +
      " background: linear-gradient(180deg, var(--ee-moerk), var(--ee-moerk2)) !important; color: #fff !important; cursor: pointer;" +
      " font: bold 13px Verdana, sans-serif; box-shadow: none !important; text-shadow: none !important; border-radius: 0 !important; }" +
    E + " #ee-hurtig.lukket .ee-pil { transform: rotate(180deg); }" +
    E + " #ee-hurtig.lukket .ee-hurtig-liste { display: none; }" +
    E + " .ee-hurtig-liste { display: flex; flex-direction: column; gap: 4px; padding: 6px; }" +
    E + " .ee-hurtig-liste button { display: flex; align-items: center; gap: 7px; padding: 5px 7px !important; border: 1px solid var(--ee-kant) !important;" +
      " border-radius: 7px; background: var(--ee-kort) !important; color: var(--ee-tekst) !important; cursor: pointer; text-align: left;" +
      " font: 12px Verdana, sans-serif; box-shadow: none !important; text-shadow: none !important; }" +
    E + " .ee-hurtig-liste button:hover { background: var(--ee-hover) !important; }" +
    E + " .ee-hurtig-liste b { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--ee-moerk); color: #fff; font-size: 12px; }" +
    // fanerne i den valgte gruppe (vandret over indholdet)
    E + " #ejer-faner { grid-column: 2 !important; grid-row: 2 !important; flex-direction: row !important; flex-wrap: wrap; align-items: flex-end; gap: 4px !important;" +
      " padding: 10px 14px 0 !important; background: var(--ee-indhold) !important; border: 0 !important; border-bottom: 2px solid var(--ee-kant) !important;" +
      " overflow: visible !important; box-shadow: none !important; position: static !important; }" +
    E + " #ejer-faner::before { display: none !important; }" +
    E + " #ejer-faner.ee-en { display: none !important; }" +
    E + " #ejer-faner > button.ee-ude { display: none !important; }" +
    E + " #ejer-faner > button { padding: 7px 12px !important; border: 1.5px solid var(--ee-kant) !important; border-bottom: 0 !important;" +
      " border-radius: 9px 9px 0 0 !important; background: var(--ee-side) !important; color: var(--ee-tekst) !important; margin-bottom: -2px !important;" +
      " font: bold 12px Verdana, sans-serif !important; box-shadow: none !important; text-shadow: none !important; white-space: nowrap; }" +
    E + " #ejer-faner > button:hover { background: var(--ee-hover) !important; }" +
    E + " #ejer-faner > button.valgt { background: var(--ee-indhold) !important; color: var(--ee-overskrift) !important; border-color: var(--ee-kant) !important;" +
      " box-shadow: inset 0 3px 0 var(--ee-moerk) !important; }" +
    // indholdet
    E + " #ejer-indhold { grid-column: 2 !important; grid-row: 3 !important; background: var(--ee-indhold) !important; box-shadow: none !important; min-height: 0; }" +
    E + ":not(.moerkt) #ejer-indhold h3 { color: var(--ee-overskrift) !important; font-family: Verdana, sans-serif !important; }" +
    E + ":not(.moerkt) #ejer-indhold h4 { color: var(--ee-overskrift) !important; opacity: .85; }" +
    E + ":not(.moerkt) #ejer-indhold a { color: var(--ee-overskrift) !important; }" +
    E + ":not(.moerkt) .ejer-kort { background: var(--ee-kort) !important; border: 1.5px solid var(--ee-kant) !important; border-radius: 12px !important;" +
      " box-shadow: 0 2px 6px rgba(0,0,0,.06) !important; }" +
    E + ":not(.moerkt) .ejer-kort b { color: var(--ee-overskrift) !important; font-family: Verdana, sans-serif !important; }" +
    E + ":not(.moerkt) .ejer-kort .ikon { background: var(--ee-side) !important; box-shadow: none !important; }" +
    E + ":not(.moerkt) .ejer-tre section, " + E + ":not(.moerkt) .ejer-to section { background: var(--ee-kort); border: 1.5px solid var(--ee-kant);" +
      " border-radius: 12px; padding: 10px 12px; }" +
    E + ":not(.moerkt) .ejer-tabel th { background: var(--ee-side) !important; color: var(--ee-overskrift) !important; }" +
    E + ":not(.moerkt) .ejer-info { background: var(--ee-side) !important; border: 0 !important; border-left: 4px solid var(--ee-moerk) !important; }" +
    E + ":not(.moerkt) #ejer-indhold li { border-bottom-color: var(--ee-kant) !important; }" +
    // ⭐ Favoritter
    E + " #ee-fav { margin: 0 0 14px; padding: 12px; border-radius: 12px; background: var(--ee-kort); border: 1.5px solid var(--ee-kant); }" +
    E + " .ee-fav-top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }" +
    E + " .ee-fav-top h3 { margin: 0 !important; border: 0 !important; }" +
    E + " .ee-fav-top small { flex: 1; color: #8a7a7a; font-size: 12px; }" +
    E + " #ejer-indhold .ee-fav-top .ee-fav-ret { padding: 3px 9px !important; border-radius: 7px; border: 1px solid var(--ee-kant) !important;" +
      " background: var(--ee-side) !important; color: var(--ee-tekst) !important; font: 12px Verdana, sans-serif; cursor: pointer; box-shadow: none !important; }" +
    E + " .ee-fav-raekke { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }" +
    E + " #ejer-indhold .ee-fav-raekke button { width: 92px; height: 74px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" +
      " border-radius: 12px; border: 1.5px solid var(--ee-kant) !important; background: var(--ee-indhold) !important; color: var(--ee-tekst) !important;" +
      " cursor: pointer; box-shadow: 0 2px 0 var(--ee-kant) !important; text-shadow: none !important; padding: 4px !important; }" +
    E + " #ejer-indhold .ee-fav-raekke button:hover { background: var(--ee-hover) !important; transform: translateY(-1px); }" +
    E + " .ee-fav-raekke button span { font-size: 24px; line-height: 1; }" +
    E + " .ee-fav-raekke button small { font-size: 10.5px; line-height: 1.2; text-align: center; color: var(--ee-tekst); overflow: hidden; max-height: 26px; }" +
    E + " #ejer-indhold .ee-fav-raekke .ee-fav-plus { border-style: dashed !important; background: transparent !important; box-shadow: none !important; }" +
    E + " .ee-fav-vaelg { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 4px 12px; margin-top: 10px; font-size: 13px; }" +
    E + " .ee-fav-vaelg label { display: flex; gap: 6px; align-items: center; cursor: pointer; color: var(--ee-tekst); }" +
    // 🌙 Mørkt (månen): siden og fanerne bliver mørke, den valgte farve ses i markeringerne.
    // Selve indholdet vendes til mørkt af panel-tema.js, ligesom før.
    E + ".moerkt .ejer-boks { border-color: var(--ee-moerk2) !important; background: #1f2126 !important; }" +
    E + ".moerkt #ee-side { background: #23252b; border-right-color: #34363d; }" +
    E + ".moerkt #ee-grupper button { color: #d8d9de !important; }" +
    E + ".moerkt #ee-grupper button:not(.valgt):hover { background: #2f3239 !important; }" +
    E + ".moerkt #ee-hurtig { background: #26282e; border-color: #3a3d46; }" +
    E + ".moerkt .ee-hurtig-liste button { background: #2e3138 !important; color: #e8e8ec !important; border-color: #3a3d46 !important; }" +
    E + ".moerkt .ee-hurtig-liste button:hover { background: #383b43 !important; }" +
    E + ".moerkt #ejer-faner { background: #1f2126 !important; border-bottom-color: #3a3d46 !important; }" +
    E + ".moerkt #ejer-faner > button { background: #2a2c33 !important; color: #cfd0d6 !important; border-color: #3a3d46 !important; }" +
    E + ".moerkt #ejer-faner > button.valgt { background: #3a3d46 !important; color: #fff !important; box-shadow: inset 0 3px 0 var(--ee-moerk) !important; }" +
    E + ".moerkt[data-ee-farve='sort'] #ee-grupper button.valgt { background: #3a3d46 !important; box-shadow: inset 3px 0 0 var(--ee-guld) !important; }" +
    // smal skærm
    "@media (max-width: 640px) {" + E + " .ejer-boks { grid-template-columns: 1fr !important; grid-template-rows: auto auto auto 1fr !important; }" +
      E + " #ee-side { grid-row: 2; grid-column: 1; flex-direction: row; overflow-x: auto; padding: 6px; }" +
      E + " #ee-grupper { flex-direction: row; } " + E + " #ee-grupper .ee-navn { display: none; } " + E + " #ee-hurtig { display: none; }" +
      E + " #ejer-faner { grid-column: 1 !important; grid-row: 3 !important; } " + E + " #ejer-indhold { grid-column: 1 !important; grid-row: 4 !important; }" +
      E + " .ee-maerke b, " + E + " .ee-maerke i { display: none; } }";
  Object.keys(P).forEach(function (t) {
    const p = P[t];
    css += E + "[data-ee-farve='" + t + "'] { --ee-moerk: " + p[0] + "; --ee-moerk2: " + p[1] + "; --ee-guld: " + p[2] + "; --ee-side: " + p[3] +
      "; --ee-hover: " + p[4] + "; --ee-indhold: " + p[5] + "; --ee-kort: " + p[6] + "; --ee-kant: " + p[7] + "; --ee-tekst: " + p[8] +
      "; --ee-overskrift: " + p[9] + "; }";
  });
  const stil = document.createElement("style");
  stil.id = "ejer-enkel-stil";
  stil.textContent = css;
  document.head.appendChild(stil);

  visTema();
  tegnGrupper();
  // navnet kan skifte, når man logger ind (så kommer ens egne farver og favoritter frem)
  let navnFoer = mitNavn();
  setInterval(function () { if (mitNavn() !== navnFoer) { navnFoer = mitNavn(); visTema(); tegnGrupper(); } }, 1000);
})();
