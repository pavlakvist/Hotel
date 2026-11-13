// =============================================================
//  👑🪪 VIP: design dit eget spillerkort
//  VIP (og ejeren) kan i VIP-vinduet → "🪪 Mit kort" vælge:
//   baggrund og farveovergang, mønster, farve og form på boksene,
//   ramme om kortet og om figuren, baggrund bag figuren, skrifttype,
//   titel og status-tekst, ekstra bokse (Om mig, Yndlings-ting, Bedste venner,
//   Mine mærker), rækkefølgen af boksene, klistermærker man selv flytter rundt,
//   effekter (glimmer, hjerter, sne …) og kortets størrelse.
//  Alle andre spillere ser designet, når de åbner kortet.
//  Gemmes på serveren (database-53-vip-kort.sql). Kræver js/vip.js og js/spillerkort.js.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.VIP_KORT_KLAR) return;
  // vent på at vip.js og spillerkortet er klar
  if (!window.VIP || typeof visKort !== "function" || typeof spKort === "undefined") {
    if ((window.VIP_KORT_FORSOEG = (window.VIP_KORT_FORSOEG || 0) + 1) < 60) setTimeout(arguments.callee, 250);
    return;
  }
  window.VIP_KORT_KLAR = true;
  const V = window.VIP;
  const r = V.r;

  // -----------------------------------------------------------
  //  Valgmulighederne
  // -----------------------------------------------------------
  const BAGGRUNDE = [
    { id: "vinroed", navn: "Vinrød", a: "#7a1f2e", b: "#3d0f17" },
    { id: "guld", navn: "Guld", a: "#f6dfa0", b: "#c9962e" },
    { id: "creme", navn: "Creme", a: "#fbf3e4", b: "#efdcb8" },
    { id: "rose", navn: "Rosé", a: "#ffd6e4", b: "#e88aab" },
    { id: "lilla", navn: "Lilla", a: "#d9c2f0", b: "#7b4fb0" },
    { id: "nat", navn: "Nat", a: "#2a2f5e", b: "#0d1030" },
    { id: "hav", navn: "Hav", a: "#bfe9f2", b: "#2f7fa8" },
    { id: "skov", navn: "Skov", a: "#cfe8c0", b: "#3f6e3a" },
    { id: "solnedgang", navn: "Solnedgang", a: "#ffd27a", b: "#e0507a" },
    { id: "slik", navn: "Slik", a: "#ffe1f0", b: "#a8e6ff" },
    { id: "sort", navn: "Sort", a: "#3a3a3a", b: "#0e0e0e" },
    { id: "egen", navn: "Egne farver" },
  ];
  const RETNINGER = [
    { id: "ned", navn: "⬇ Op-ned", css: "180deg" }, { id: "skraa", navn: "↘ Skråt", css: "135deg" },
    { id: "side", navn: "➡ Side", css: "90deg" }, { id: "rund", navn: "◎ Rund", css: "rund" },
  ];
  const MOENSTRE = [
    { id: "ingen", navn: "Ingen" }, { id: "prikker", navn: "• Prikker" }, { id: "striber", navn: "▨ Striber" },
    { id: "stjerner", navn: "★ Stjerner" }, { id: "hjerter", navn: "♥ Hjerter" }, { id: "blomster", navn: "✿ Blomster" },
    { id: "glimmer", navn: "✦ Glimmer" }, { id: "tern", navn: "▦ Tern" }, { id: "marmor", navn: "◌ Marmor" },
  ];
  const BOKS_FORMER = [{ id: "rund", navn: "Afrundet", px: 8 }, { id: "pille", navn: "Pille", px: 18 }, { id: "firkant", navn: "Firkantet", px: 0 }];
  const RAMMER = [
    { id: "ingen", navn: "Ingen" }, { id: "guld", navn: "🟨 Guld" }, { id: "soelv", navn: "⬜ Sølv" }, { id: "rose", navn: "🌸 Rosé" },
    { id: "perler", navn: "⚪ Perler" }, { id: "ranke", navn: "🌿 Ranke" }, { id: "neon", navn: "💡 Neon" }, { id: "dobbelt", navn: "🔲 Dobbelt" },
  ];
  const FIGUR_BAGGRUNDE = [
    { id: "standard", navn: "Standard" }, { id: "scene", navn: "🎭 Scene" }, { id: "stjernehimmel", navn: "🌌 Stjernehimmel" },
    { id: "solnedgang", navn: "🌅 Solnedgang" }, { id: "hav", navn: "🌊 Hav" }, { id: "lyseroed", navn: "💗 Lyserød" },
    { id: "skov", navn: "🌳 Skov" }, { id: "guld", navn: "✨ Guld" },
  ];
  const SKRIFTER = [
    { id: "standard", navn: "Standard", familie: "Verdana, sans-serif" },
    { id: "haand", navn: "Håndskrift", familie: "'Caveat', cursive", str: 16 },
    { id: "skrive", navn: "Skråskrift", familie: "'Dancing Script', cursive", str: 15 },
    { id: "elegant", navn: "Elegant", familie: "'Playfair Display', Georgia, serif" },
    { id: "rund", navn: "Rund", familie: "'Fredoka', sans-serif", str: 14 },
    { id: "pacifico", navn: "Sommer", familie: "'Pacifico', cursive" },
    { id: "lobster", navn: "Fed og flot", familie: "'Lobster', cursive", str: 14 },
    { id: "maskine", navn: "Skrivemaskine", familie: "'Special Elite', monospace" },
    { id: "pixel", navn: "Pixel", familie: "'Press Start 2P', monospace", str: 8 },
  ];
  const EFFEKTER = [
    { id: "ingen", navn: "Ingen" }, { id: "glimmer", navn: "✨ Glimmer", tegn: ["✨", "✦"] }, { id: "hjerter", navn: "💕 Hjerter", tegn: ["💕", "💗", "❤️"] },
    { id: "sne", navn: "❄️ Sne", tegn: ["❄️", "❅"] }, { id: "stjerner", navn: "⭐ Stjerner", tegn: ["⭐", "🌟"] },
    { id: "blomster", navn: "🌸 Blomster", tegn: ["🌸", "🌷"] }, { id: "bobler", navn: "🫧 Bobler", tegn: ["🫧", "○"] },
    { id: "skin", navn: "💫 Skinnende kort" },
  ];
  const STOERRELSER = [{ id: "normal", navn: "Normal", px: 240 }, { id: "bred", navn: "Bred", px: 290 }, { id: "ekstra", navn: "Ekstra bred", px: 330 }];
  const KLISTER = ["🌸", "🌹", "🌷", "🌻", "🍀", "🦋", "🐝", "🐱", "🐶", "🐰", "🦄", "🐻", "⭐", "🌟", "✨", "🌙", "☀️", "🌈",
    "❤️", "💖", "💕", "💎", "👑", "🎀", "🎁", "🎈", "🎉", "🎵", "🎮", "📸", "🍓", "🍰", "🍦", "🧁", "🍭", "☕", "🔥", "💋", "😎", "🥰"];
  const MAERKER = ["⭐", "🏆", "🎀", "💎", "🌸", "🦋", "🎮", "🎨", "🎵", "📸", "🐱", "🐶", "🍓", "🌈", "🔥", "💃", "⚽", "📚", "🎬", "🏰"];
  // Boksene på kortet. "klasse" er det, spillerkort.js kalder boksen.
  const BOKSE = [
    { id: "titel", navn: "🏷 Titel", ny: true },
    { id: "motto", navn: "✏️ Status", klasse: "sk-motto" },
    { id: "om", navn: "💬 Om mig", ny: true },
    { id: "likes", navn: "👍 Likes", klasse: "sk-likes" },
    { id: "medlem", navn: "📅 Medlem siden", klasse: "sk-medlem" },
    { id: "online", navn: "🟢 Online", klasse: "sk-online,sk-offline" },
    { id: "fd", navn: "🎂 Fødselsdag", klasse: "sk-fd" },
    { id: "yndling", navn: "💝 Yndlings-ting", ny: true },
    { id: "venner", navn: "👯 Bedste venner", ny: true },
    { id: "maerker", navn: "🏅 Mine mærker", ny: true },
    { id: "hjerte", navn: "❤️ Mine hjerter", klasse: "sk-hjerte" },
    { id: "smiley", navn: "🙂 Mine smileyer", klasse: "sk-smiley" },
  ];
  const YNDLING = [["rum", "🛋️ Rum"], ["farve", "🎨 Farve"], ["moebel", "🪑 Møbel"], ["mad", "🍕 Mad"], ["musik", "🎵 Musik"], ["dyr", "🐾 Dyr"]];

  function find(liste, id, std) { return liste.find(function (x) { return x.id === id; }) || liste.find(function (x) { return x.id === std; }) || liste[0]; }
  function farve(f, std) { return /^#[0-9a-fA-F]{6}$/.test(f || "") ? f : std; }
  function tekst(t, maks) { return String(t == null ? "" : t).slice(0, maks); }
  function tal01(n, std) { n = Number(n); return isFinite(n) ? Math.max(0, Math.min(100, n)) : std; }

  function standardDesign() {
    return { bg: "vinroed", bg1: "#7a1f2e", bg2: "#3d0f17", retning: "ned", moenster: "ingen", boks: "#fff8ec", boksTekst: "#3a1a14",
      boksForm: "rund", boksTaet: 92, ramme: "guld", figurRamme: "guld", figurBg: "standard", skrift: "standard",
      titel: "", status: "", statusFarve: "#7a1f2e", om: "", yndling: {}, venner: [], maerker: [],
      raekke: BOKSE.map(function (b) { return b.id; }), skjult: [], klister: [], effekt: "glimmer", stoerrelse: "normal" };
  }
  // Gør et design (fra serveren, måske fra en anden) sikkert og helt
  function rens(d) {
    const s = standardDesign();
    d = d && typeof d === "object" ? d : {};
    const ud = {
      bg: find(BAGGRUNDE, d.bg, s.bg).id, bg1: farve(d.bg1, s.bg1), bg2: farve(d.bg2, s.bg2), retning: find(RETNINGER, d.retning, s.retning).id,
      moenster: find(MOENSTRE, d.moenster, s.moenster).id, boks: farve(d.boks, s.boks), boksTekst: farve(d.boksTekst, s.boksTekst),
      boksForm: find(BOKS_FORMER, d.boksForm, s.boksForm).id, boksTaet: tal01(d.boksTaet, s.boksTaet),
      ramme: find(RAMMER, d.ramme, s.ramme).id, figurRamme: find(RAMMER, d.figurRamme, s.figurRamme).id,
      figurBg: find(FIGUR_BAGGRUNDE, d.figurBg, s.figurBg).id, skrift: find(SKRIFTER, d.skrift, s.skrift).id,
      titel: tekst(d.titel, 40), status: tekst(d.status, 200), statusFarve: farve(d.statusFarve, s.statusFarve), om: tekst(d.om, 300),
      yndling: {}, venner: [], maerker: [], raekke: [], skjult: [], klister: [],
      effekt: find(EFFEKTER, d.effekt, s.effekt).id, stoerrelse: find(STOERRELSER, d.stoerrelse, s.stoerrelse).id,
    };
    YNDLING.forEach(function (y) { if (d.yndling && d.yndling[y[0]]) ud.yndling[y[0]] = tekst(d.yndling[y[0]], 40); });
    if (Array.isArray(d.venner)) ud.venner = d.venner.slice(0, 5).map(function (n) { return tekst(n, 30); }).filter(Boolean);
    if (Array.isArray(d.maerker)) ud.maerker = d.maerker.filter(function (m) { return MAERKER.indexOf(m) >= 0; }).slice(0, 8);
    const ider = BOKSE.map(function (b) { return b.id; });
    if (Array.isArray(d.raekke)) d.raekke.forEach(function (id) { if (ider.indexOf(id) >= 0 && ud.raekke.indexOf(id) < 0) ud.raekke.push(id); });
    ider.forEach(function (id) { if (ud.raekke.indexOf(id) < 0) ud.raekke.push(id); });
    if (Array.isArray(d.skjult)) ud.skjult = d.skjult.filter(function (id) { return ider.indexOf(id) >= 0; });
    if (Array.isArray(d.klister)) ud.klister = d.klister.slice(0, 15).filter(function (k) { return k && KLISTER.indexOf(k.e) >= 0; })
      .map(function (k) { return { e: k.e, x: tal01(k.x, 50), y: tal01(k.y, 50), s: Math.max(14, Math.min(48, Number(k.s) || 24)) }; });
    return ud;
  }

  // -----------------------------------------------------------
  //  Skrifttyper (hentes først, når nogen bruger dem)
  // -----------------------------------------------------------
  let skrifterHentet = false;
  function hentSkrifter() {
    if (skrifterHentet) return;
    skrifterHentet = true;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Fredoka:wght@500&family=Lobster" +
      "&family=Pacifico&family=Playfair+Display:wght@600&family=Press+Start+2P&family=Special+Elite&display=swap";
    document.head.appendChild(l);
  }

  // -----------------------------------------------------------
  //  Mønstre og baggrunde som CSS
  // -----------------------------------------------------------
  function svg(indhold, str) {
    return "url(\"data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + str + "' height='" + str + "'>" + indhold + "</svg>") + "\")";
  }
  function moensterCss(id, lys) {
    const f = lys ? "rgba(255,255,255,.28)" : "rgba(60,10,20,.16)";
    switch (id) {
      case "prikker": return svg("<circle cx='6' cy='6' r='2.5' fill='" + f + "'/><circle cx='18' cy='18' r='2.5' fill='" + f + "'/>", 24);
      case "striber": return "repeating-linear-gradient(45deg, " + f + " 0 6px, transparent 6px 16px)";
      case "stjerner": return svg("<polygon points='14,3 17,11 25,11 19,16 21,24 14,19 7,24 9,16 3,11 11,11' fill='" + f + "'/>", 30);
      case "hjerter": return svg("<path d='M15 25 C3 16 4 7 10 7 C13 7 15 10 15 10 C15 10 17 7 20 7 C26 7 27 16 15 25Z' fill='" + f + "'/>", 30);
      case "blomster": return svg("<g fill='" + f + "'><circle cx='15' cy='9' r='4'/><circle cx='21' cy='14' r='4'/><circle cx='18' cy='21' r='4'/><circle cx='11' cy='21' r='4'/><circle cx='9' cy='14' r='4'/></g>", 32);
      case "glimmer": return svg("<path d='M8 2 L9.5 7 L14 8 L9.5 9.5 L8 14 L6.5 9.5 L2 8 L6.5 7Z' fill='" + f + "'/><path d='M26 18 L27 21 L30 22 L27 23 L26 26 L25 23 L22 22 L25 21Z' fill='" + f + "'/>", 34);
      case "tern": return "repeating-conic-gradient(" + f + " 0 25%, transparent 0 50%) 0 0 / 20px 20px";
      case "marmor": return "radial-gradient(ellipse at 20% 30%, " + f + ", transparent 40%), radial-gradient(ellipse at 80% 70%, " + f + ", transparent 45%), radial-gradient(ellipse at 60% 10%, " + f + ", transparent 30%)";
      default: return "";
    }
  }
  function baggrundCss(d) {
    const bg = find(BAGGRUNDE, d.bg);
    const a = bg.id === "egen" ? d.bg1 : bg.a, b = bg.id === "egen" ? d.bg2 : bg.b;
    const ret = find(RETNINGER, d.retning);
    const grad = ret.css === "rund" ? "radial-gradient(circle at 50% 35%, " + a + ", " + b + ")" : "linear-gradient(" + ret.css + ", " + a + ", " + b + ")";
    const m = moensterCss(d.moenster, erMoerk(b));
    return (m ? m + ", " : "") + grad;
  }
  function erMoerk(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 < 128;
  }
  function figurBgCss(id) {
    switch (id) {
      case "scene": return "radial-gradient(ellipse at 50% 100%, #f6dfa0 0, transparent 45%), repeating-linear-gradient(90deg, #8e1b2a 0 8px, #6d1320 8px 14px)";
      case "stjernehimmel": return svg("<circle cx='5' cy='7' r='1' fill='#fff'/><circle cx='22' cy='3' r='.8' fill='#fff'/><circle cx='15' cy='18' r='1.2' fill='#fff8c0'/><circle cx='28' cy='25' r='.7' fill='#fff'/>", 32) + ", linear-gradient(#0d1030, #3a3f7a)";
      case "solnedgang": return "linear-gradient(#ffb347, #ff6f91 55%, #6a3a8a)";
      case "hav": return "linear-gradient(#bfe9f2, #4fa3c8 60%, #f3e2bd 60%)";
      case "lyseroed": return "radial-gradient(circle, #fff0f6, #f5b3cc)";
      case "skov": return "linear-gradient(#cfe8ff, #cfe8ff 55%, #7cbf6a 55%, #3f6e3a)";
      case "guld": return "radial-gradient(circle at 50% 40%, #fff6d0, #d9a441)";
      default: return "";
    }
  }

  // -----------------------------------------------------------
  //  Hent designet for den spiller, hvis kort er åbent
  // -----------------------------------------------------------
  const DESIGN = {};          // navn → { kort, hentet }
  let kladde = null;          // mit design, mens jeg redigerer (vises med det samme på mit kort)
  let redigerer = false;

  function hentDesign(navn, tvang) {
    if (!navn || !V.kanServer()) return;
    const d = DESIGN[navn];
    if (!tvang && d && (d.henter || Date.now() - d.hentet < 10000)) return;
    DESIGN[navn] = Object.assign(d || { kort: null, hentet: 0 }, { henter: true });
    serverKald("hv_vip_kort", { p_token: V.token(), p_navn: navn }).then(function (svar) {
      DESIGN[navn] = { kort: svar && svar.vip && svar.kort ? rens(svar.kort) : null, hentet: Date.now() };
      if (kortNavn === navn) visKort();
    }).catch(function () { DESIGN[navn] = { kort: null, hentet: Date.now() }; });
  }

  function designFor(navn) {
    if (!navn || !V.erVip(navn)) return null;
    if (navn === FIGUR.navn && kladde) return kladde;
    const d = DESIGN[navn];
    return d && d.kort ? d.kort : null;
  }

  // -----------------------------------------------------------
  //  Læg designet på kortet (efter at spillerkort.js har tegnet det)
  // -----------------------------------------------------------
  const lag = document.createElement("div");          // klistermærker og effekter ligger ovenpå
  lag.className = "vk-lag";
  spKort.appendChild(lag);
  let lagNoegle = "";

  function nulstilKort() {
    spKort.classList.remove("vk-design", "vk-redig");
    spKort.removeAttribute("data-vk-ramme");
    spKort.removeAttribute("data-vk-figurramme");
    spKort.style.cssText = spKort.style.cssText.replace(/--vk-[^;]+;?/g, "");
    ["background", "width", "fontFamily"].forEach(function (p) { spKort.style[p] = ""; });
    const fig = spKort.querySelector(".sk-figur");
    if (fig) fig.style.background = "";
    spKort.querySelectorAll(".vk-ny, .vk-titel").forEach(function (e) { e.remove(); });
    lag.innerHTML = ""; lagNoegle = "";
  }

  function anvend() {
    const navn = kortNavn;
    if (spKort.hidden || !navn) return;
    if (V.erVip(navn) && !(navn === FIGUR.navn && kladde)) hentDesign(navn);
    const d = designFor(navn);
    // VIP-navnet øverst (også uden design)
    const st = V.stilFor ? V.stilFor(navn) : null;
    const navnEl = spKort.querySelector(".sk-navn");
    if (navnEl && st) { navnEl.textContent = (st.ikon || "👑") + " " + navn; navnEl.title = "VIP 👑"; }
    if (!d) { nulstilKort(); return; }

    const skrift = find(SKRIFTER, d.skrift);
    if (skrift.id !== "standard") hentSkrifter();
    spKort.classList.add("vk-design");
    spKort.classList.toggle("vk-redig", redigerer && navn === FIGUR.navn);
    spKort.setAttribute("data-vk-ramme", d.ramme);
    spKort.setAttribute("data-vk-figurramme", d.figurRamme);
    spKort.style.background = baggrundCss(d);
    spKort.style.width = find(STOERRELSER, d.stoerrelse).px + "px";
    const taet = Math.round(d.boksTaet / 100 * 255).toString(16).padStart(2, "0");
    spKort.style.setProperty("--vk-boks", d.boks + taet);
    spKort.style.setProperty("--vk-boks-tekst", d.boksTekst);
    spKort.style.setProperty("--vk-radius", find(BOKS_FORMER, d.boksForm).px + "px");
    spKort.style.setProperty("--vk-skrift", skrift.familie);
    spKort.style.setProperty("--vk-str", (skrift.str || 13) + "px");
    spKort.style.setProperty("--vk-top", find(BAGGRUNDE, d.bg).id === "egen" ? d.bg1 : find(BAGGRUNDE, d.bg).b);
    spKort.style.setProperty("--vk-status", d.statusFarve);
    const fig = spKort.querySelector(".sk-figur");
    if (fig) fig.style.background = figurBgCss(d.figurBg);

    // titel under navnet
    spKort.querySelectorAll(".vk-titel").forEach(function (e) { e.remove(); });
    if (d.titel && d.skjult.indexOf("titel") < 0) {
      const t = document.createElement("p");
      t.className = "vk-titel";
      t.textContent = d.titel;
      spKort.querySelector(".sk-midt").before(t);
    }

    const raekker = spKort.querySelector(".sk-raekker");
    raekker.querySelectorAll(".vk-ny").forEach(function (e) { e.remove(); });
    // status i stedet for motto
    const motto = raekker.querySelector(".sk-motto");
    if (motto && d.status) motto.innerHTML = "✏️ <span class='vk-statustekst'>" + r(d.status) + "</span>";

    // de nye bokse
    function ny(id, html) {
      const el = document.createElement("div");
      el.className = "vk-ny vk-" + id;
      el.dataset.vkBoks = id;
      el.innerHTML = html;
      raekker.appendChild(el);
    }
    if (d.om) ny("om", "<b>💬 Om mig</b><p>" + r(d.om).replace(/\n/g, "<br>") + "</p>");
    const yn = YNDLING.filter(function (y) { return d.yndling[y[0]]; });
    if (yn.length) ny("yndling", "<b>💝 Yndlings-ting</b>" + yn.map(function (y) { return "<div class='vk-linje'><span>" + y[1] + "</span><span>" + r(d.yndling[y[0]]) + "</span></div>"; }).join(""));
    if (d.venner.length) ny("venner", "<b>👯 Bedste venner</b><div class='vk-chips'>" + d.venner.map(function (n) { return "<span>" + r(n) + "</span>"; }).join("") + "</div>");
    const maerker = (V.erVip(navn) ? ["👑"] : []).concat(d.maerker);
    if (maerker.length) ny("maerker", "<b>🏅 Mine mærker</b><div class='vk-maerker'>" + maerker.map(function (m, i) {
      return "<span title='" + (i === 0 && m === "👑" ? "VIP" : "") + "'>" + m + "</span>";
    }).join("") + "</div>");

    // rækkefølge og skjulte bokse ("sk-dine" med knapperne bliver nederst)
    const dine = raekker.querySelector(".sk-dine");
    d.raekke.forEach(function (id) {
      const b = BOKSE.find(function (x) { return x.id === id; });
      if (!b || id === "titel") return;
      const el = b.ny ? raekker.querySelector("[data-vk-boks='" + id + "']")
        : raekker.querySelector(b.klasse.split(",").map(function (k) { return ":scope > ." + k; }).join(","));
      if (!el) return;
      el.style.display = d.skjult.indexOf(id) >= 0 ? "none" : "";
      raekker.appendChild(el);
    });
    if (dine) raekker.appendChild(dine);

    tegnLag(d);
  }

  // klistermærker + effekt
  function tegnLag(d) {
    const noegle = JSON.stringify([d.klister, d.effekt, d.ramme, redigerer && kortNavn === FIGUR.navn]);
    if (noegle === lagNoegle) return;
    lagNoegle = noegle;
    let html = "";
    const eff = find(EFFEKTER, d.effekt);
    if (eff.tegn) {
      for (let i = 0; i < 12; i++) {
        html += "<i class='vk-fald' style='left:" + ((i * 37) % 100) + "%;animation-delay:" + (-(i * 0.83) % 6).toFixed(2) + "s;animation-duration:" +
          (5 + (i % 4)) + "s;font-size:" + (10 + (i % 3) * 4) + "px'>" + eff.tegn[i % eff.tegn.length] + "</i>";
      }
    }
    if (eff.id === "skin") html += "<i class='vk-skin'></i>";
    if (d.ramme === "ranke") html += "<i class='vk-hjoerne' style='left:-6px;top:-8px'>🌿</i><i class='vk-hjoerne' style='right:-6px;top:-8px;transform:scaleX(-1)'>🌿</i>" +
      "<i class='vk-hjoerne' style='left:-6px;bottom:-8px;transform:scaleY(-1)'>🌿</i><i class='vk-hjoerne' style='right:-6px;bottom:-8px;transform:scale(-1)'>🌿</i>";
    d.klister.forEach(function (k, i) {
      html += "<b class='vk-klister' data-vk-k='" + i + "' style='left:" + k.x + "%;top:" + k.y + "%;font-size:" + k.s + "px'>" + k.e + "</b>";
    });
    lag.innerHTML = html;
  }

  const visKortFoerVip = visKort;
  visKort = function () {
    visKortFoerVip();
    try { anvend(); } catch (e) { console.warn("VIP-kort:", e); }
  };
  const lukKortFoerVip = typeof lukKort === "function" ? lukKort : null;
  if (lukKortFoerVip) lukKort = function () { lukKortFoerVip(); nulstilKort(); };
  setInterval(function () { if (!spKort.hidden && kortNavn && V.erVip(kortNavn) && !(kortNavn === FIGUR.navn && kladde)) hentDesign(kortNavn); }, 4000);

  // Flyt klistermærker med musen (kun på dit eget kort, mens du redigerer). Dobbeltklik fjerner.
  let traek = null;
  lag.addEventListener("pointerdown", function (e) {
    const k = e.target.closest(".vk-klister");
    if (!k || !redigerer || !kladde || kortNavn !== FIGUR.navn) return;
    e.preventDefault(); e.stopPropagation();
    traek = { i: +k.dataset.vkK, el: k };
    try { k.setPointerCapture(e.pointerId); } catch (x) {}
  });
  lag.addEventListener("pointermove", function (e) {
    if (!traek) return;
    const box = spKort.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (e.clientX - box.left) / box.width * 100));
    const y = Math.max(0, Math.min(100, (e.clientY - box.top) / box.height * 100));
    kladde.klister[traek.i].x = Math.round(x * 10) / 10;
    kladde.klister[traek.i].y = Math.round(y * 10) / 10;
    traek.el.style.left = x + "%"; traek.el.style.top = y + "%";
  });
  lag.addEventListener("pointerup", function () { if (traek) { traek = null; lagNoegle = ""; aendret(); } });
  lag.addEventListener("dblclick", function (e) {
    const k = e.target.closest(".vk-klister");
    if (!k || !redigerer || !kladde) return;
    kladde.klister.splice(+k.dataset.vkK, 1);
    lagNoegle = ""; aendret(); visSide();
  });


  // -----------------------------------------------------------
  //  🪪 Mit kort: design-siden i VIP-vinduet
  // -----------------------------------------------------------
  let krop = null;
  let gemt = null;            // det der sidst blev gemt (til "Fortryd")
  let aaben = "baggrund";     // hvilken sektion er foldet ud
  let fejl = "", ok = "", gemmer = false, harAendringer = false;

  function aendret() { harAendringer = true; ok = ""; if (kortNavn === FIGUR.navn) visKort(); }

  function startRedigering() {
    redigerer = true;
    if (!kladde) {
      const mit = DESIGN[FIGUR.navn];
      kladde = rens(mit && mit.kort ? mit.kort : standardDesign());
      gemt = JSON.stringify(kladde);
      harAendringer = false;
      if (!mit || !mit.hentet) {
        // hent det gemte design først
        serverKald("hv_vip_kort", { p_token: V.token(), p_navn: FIGUR.navn }).then(function (svar) {
          if (harAendringer) return;
          kladde = rens(svar && svar.kort ? svar.kort : standardDesign());
          gemt = JSON.stringify(kladde);
          DESIGN[FIGUR.navn] = { kort: svar && svar.kort ? rens(svar.kort) : null, hentet: Date.now() };
          visKort(); if (krop) visSide();
        }).catch(function (e) { fejl = V.serverFejl(e); if (krop) visSide(); });
      }
    }
    if (kortNavn !== FIGUR.navn) aabnKort(FIGUR.navn, garderobe);
    else visKort();
  }

  function sektion(id, titel, html) {
    return "<details class='vk-sek' data-vk-sek='" + id + "'" + (aaben === id ? " open" : "") + "><summary>" + titel + "</summary><div>" + html + "</div></details>";
  }
  function knapper(liste, felt, ekstra) {
    return "<div class='vk-valg'>" + liste.map(function (x) {
      return "<button type='button' data-vk-felt='" + felt + "' data-vk-v='" + x.id + "'" + (kladde[felt] === x.id ? " class='valgt'" : "") +
        (ekstra ? ekstra(x) : "") + ">" + x.navn + "</button>";
    }).join("") + "</div>";
  }
  function farveFelt(felt, navn) {
    return "<label class='vk-farve'><input type='color' data-vk-farve='" + felt + "' value='" + kladde[felt] + "'> " + navn + "</label>";
  }

  function visSide() {
    if (!krop || !kladde) return;
    const d = kladde;
    const beskeder = (fejl ? "<p class='vip-fejl'>⚠️ " + r(fejl) + "</p>" : "") + (ok ? "<p class='vip-ok'>" + ok + "</p>" : "");
    let html = beskeder + "<p class='vip-note'>Dit kort står åbent, så du kan se ændringerne med det samme. Husk at trykke <b>💾 Gem kort</b>.</p>";

    html += sektion("baggrund", "🎨 Baggrund", "<div class='vk-swatches'>" + BAGGRUNDE.map(function (b) {
      const st = b.id === "egen" ? "background:linear-gradient(135deg," + d.bg1 + "," + d.bg2 + ")" : "background:linear-gradient(135deg," + b.a + "," + b.b + ")";
      return "<button type='button' class='vk-swatch" + (d.bg === b.id ? " valgt" : "") + "' data-vk-felt='bg' data-vk-v='" + b.id + "' style='" + st + "' title='" + b.navn + "'>" +
        (b.id === "egen" ? "🎨" : "") + "</button>";
    }).join("") + "</div>" + (d.bg === "egen" ? "<div class='vk-raekke'>" + farveFelt("bg1", "Farve 1") + farveFelt("bg2", "Farve 2") + "</div>" : "") +
      "<h5>Retning</h5>" + knapper(RETNINGER, "retning") + "<h5>Mønster</h5>" + knapper(MOENSTRE, "moenster") +
      "<h5>Kortets størrelse</h5>" + knapper(STOERRELSER, "stoerrelse"));

    html += sektion("bokse-farve", "📦 Boksenes farve og form", "<div class='vk-raekke'>" + farveFelt("boks", "Boks") + farveFelt("boksTekst", "Tekst") + "</div>" +
      "<h5>Form</h5>" + knapper(BOKS_FORMER, "boksForm") +
      "<h5>Hvor gennemsigtige</h5><input type='range' min='20' max='100' data-vk-tal='boksTaet' value='" + d.boksTaet + "'>");

    html += sektion("ramme", "🖼️ Rammer og figur", "<h5>Ramme om kortet</h5>" + knapper(RAMMER, "ramme") +
      "<h5>Ramme om figuren</h5>" + knapper(RAMMER, "figurRamme") + "<h5>Baggrund bag figuren</h5>" + knapper(FIGUR_BAGGRUNDE, "figurBg"));

    html += sektion("tekst", "✍️ Skrift og tekst", "<h5>Skrifttype</h5>" + knapper(SKRIFTER, "skrift", function (x) {
      return " style=\"font-family:" + x.familie.replace(/"/g, "'") + "\"";
    }) +
      "<h5>Titel under navnet</h5><input type='text' maxlength='40' data-vk-tekst='titel' placeholder='fx Hotellets prinsesse 👑' value='" + r(d.titel) + "'>" +
      "<h5>Status</h5><textarea maxlength='200' rows='2' data-vk-tekst='status' placeholder='Skriv hvad du laver eller tænker … 💭'>" + r(d.status) + "</textarea>" +
      "<div class='vk-raekke'>" + farveFelt("statusFarve", "Statusfarve") + "</div>");

    html += sektion("ekstra", "💬 Ekstra bokse", "<h5>💬 Om mig</h5><textarea maxlength='300' rows='3' data-vk-tekst='om' placeholder='Fortæl lidt om dig selv …'>" + r(d.om) + "</textarea>" +
      "<h5>💝 Yndlings-ting</h5><div class='vk-yndling'>" + YNDLING.map(function (y) {
        return "<label>" + y[1] + "<input type='text' maxlength='40' data-vk-yndling='" + y[0] + "' value='" + r(d.yndling[y[0]] || "") + "'></label>";
      }).join("") + "</div>" +
      "<h5>👯 Bedste venner (op til 5)</h5><div class='vk-chips vk-ret'>" + d.venner.map(function (n, i) {
        return "<span>" + r(n) + " <button type='button' data-vk-ven-x='" + i + "' title='Fjern'>✕</button></span>";
      }).join("") + "</div>" + (d.venner.length < 5 ? "<div class='vk-raekke'><input type='text' list='vk-navne' id='vk-ven' placeholder='Skriv et navn …'>" +
        "<button type='button' id='vk-ven-plus'>➕ Tilføj</button></div><datalist id='vk-navne'>" + (typeof alleSpillere === "function" ? alleSpillere().filter(function (s) {
          return s.navn !== FIGUR.navn;
        }).map(function (s) { return "<option value='" + r(s.navn) + "'>"; }).join("") : "") + "</datalist>" : "") +
      "<h5>🏅 Mine mærker (vælg op til 8)</h5><div class='vk-emoji'>" + MAERKER.map(function (m) {
        return "<button type='button' data-vk-maerke='" + m + "'" + (d.maerker.indexOf(m) >= 0 ? " class='valgt'" : "") + ">" + m + "</button>";
      }).join("") + "</div>");

    html += sektion("raekke", "📋 Bokse: rækkefølge og vis/skjul", "<ul class='vk-liste'>" + d.raekke.map(function (id, i) {
      const b = BOKSE.find(function (x) { return x.id === id; });
      return "<li><label><input type='checkbox' data-vk-vis='" + id + "'" + (d.skjult.indexOf(id) < 0 ? " checked" : "") + "> " + b.navn + "</label>" +
        "<span><button type='button' data-vk-op='" + i + "'" + (i ? "" : " disabled") + ">⬆</button><button type='button' data-vk-ned='" + i + "'" +
        (i < d.raekke.length - 1 ? "" : " disabled") + ">⬇</button></span></li>";
    }).join("") + "</ul>");

    html += sektion("klister", "🌟 Klistermærker", "<p class='vip-note'>Klik for at sætte et klistermærke på dit kort (højst 15). Træk dem rundt på kortet med musen. " +
      "Dobbeltklik på et klistermærke for at fjerne det.</p><div class='vk-emoji'>" + KLISTER.map(function (k) {
        return "<button type='button' data-vk-klister='" + k + "'>" + k + "</button>";
      }).join("") + "</div><div class='vk-raekke'><span>Størrelse på nye:</span>" + [18, 24, 32, 42].map(function (s) {
        return "<button type='button' data-vk-kstr='" + s + "'" + (nyStr === s ? " class='valgt'" : "") + ">" + (s === 18 ? "S" : s === 24 ? "M" : s === 32 ? "L" : "XL") + "</button>";
      }).join("") + "<button type='button' id='vk-klister-ryd'" + (d.klister.length ? "" : " disabled") + ">🧹 Fjern alle (" + d.klister.length + ")</button></div>");

    html += sektion("effekt", "✨ Effekt", knapper(EFFEKTER, "effekt"));

    html += "<div class='vk-gem'><button type='button' class='vip-hoved' id='vk-gem'" + (gemmer ? " disabled" : "") + ">" + (gemmer ? "⏳ Gemmer …" : "💾 Gem kort") + "</button>" +
      "<div class='vk-raekke'><button type='button' id='vk-fortryd'" + (harAendringer ? "" : " disabled") + ">↩ Fortryd ændringer</button>" +
      "<button type='button' id='vk-nulstil'>🧹 Start forfra</button><button type='button' id='vk-vis'>🪪 Vis mit kort</button></div></div>";

    const top = krop.scrollTop;
    krop.innerHTML = html;
    krop.scrollTop = top;
    forbind();
  }
  let nyStr = 24;

  function forbind() {
    krop.querySelectorAll("details.vk-sek").forEach(function (det) {
      det.addEventListener("toggle", function () {
        if (det.open) { aaben = det.dataset.vkSek; krop.querySelectorAll("details.vk-sek").forEach(function (o) { if (o !== det) o.open = false; }); }
      });
    });
    krop.querySelectorAll("[data-vk-felt]").forEach(function (b) {
      b.addEventListener("click", function () { kladde[b.dataset.vkFelt] = b.dataset.vkV; aendret(); visSide(); });
    });
    krop.querySelectorAll("[data-vk-farve]").forEach(function (inp) {
      inp.addEventListener("input", function () { kladde[inp.dataset.vkFarve] = inp.value; aendret(); });
      inp.addEventListener("change", function () { visSide(); });
    });
    krop.querySelectorAll("[data-vk-tal]").forEach(function (inp) {
      inp.addEventListener("input", function () { kladde[inp.dataset.vkTal] = +inp.value; aendret(); });
    });
    krop.querySelectorAll("[data-vk-tekst]").forEach(function (inp) {
      inp.addEventListener("input", function () { kladde[inp.dataset.vkTekst] = inp.value.slice(0, +inp.maxLength || 300); aendret(); });
    });
    krop.querySelectorAll("[data-vk-yndling]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        if (inp.value.trim()) kladde.yndling[inp.dataset.vkYndling] = inp.value.slice(0, 40); else delete kladde.yndling[inp.dataset.vkYndling];
        aendret();
      });
    });
    krop.querySelectorAll("[data-vk-ven-x]").forEach(function (b) {
      b.addEventListener("click", function () { kladde.venner.splice(+b.dataset.vkVenX, 1); aendret(); visSide(); });
    });
    const venPlus = krop.querySelector("#vk-ven-plus"), ven = krop.querySelector("#vk-ven");
    function tilfoejVen() {
      const n = ven.value.trim().slice(0, 30);
      if (!n || kladde.venner.length >= 5 || kladde.venner.indexOf(n) >= 0) return;
      kladde.venner.push(n); aendret(); visSide();
    }
    if (venPlus) venPlus.addEventListener("click", tilfoejVen);
    if (ven) ven.addEventListener("keydown", function (e) { if (e.key === "Enter") tilfoejVen(); });
    krop.querySelectorAll("[data-vk-maerke]").forEach(function (b) {
      b.addEventListener("click", function () {
        const m = b.dataset.vkMaerke, i = kladde.maerker.indexOf(m);
        if (i >= 0) kladde.maerker.splice(i, 1);
        else if (kladde.maerker.length < 8) kladde.maerker.push(m);
        else { fejl = "Du kan højst vælge 8 mærker."; }
        aendret(); visSide(); fejl = "";
      });
    });
    krop.querySelectorAll("[data-vk-vis]").forEach(function (c) {
      c.addEventListener("change", function () {
        const id = c.dataset.vkVis;
        kladde.skjult = kladde.skjult.filter(function (x) { return x !== id; });
        if (!c.checked) kladde.skjult.push(id);
        aendret();
      });
    });
    function flyt(i, til) {
      const l = kladde.raekke;
      if (til < 0 || til >= l.length) return;
      const x = l.splice(i, 1)[0]; l.splice(til, 0, x);
      aendret(); visSide();
    }
    krop.querySelectorAll("[data-vk-op]").forEach(function (b) { b.addEventListener("click", function () { flyt(+b.dataset.vkOp, +b.dataset.vkOp - 1); }); });
    krop.querySelectorAll("[data-vk-ned]").forEach(function (b) { b.addEventListener("click", function () { flyt(+b.dataset.vkNed, +b.dataset.vkNed + 1); }); });
    krop.querySelectorAll("[data-vk-klister]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (kladde.klister.length >= 15) { fejl = "Der kan højst være 15 klistermærker på kortet."; visSide(); fejl = ""; return; }
        kladde.klister.push({ e: b.dataset.vkKlister, x: 15 + Math.random() * 70, y: 10 + Math.random() * 70, s: nyStr });
        aendret(); visSide();
      });
    });
    krop.querySelectorAll("[data-vk-kstr]").forEach(function (b) { b.addEventListener("click", function () { nyStr = +b.dataset.vkKstr; visSide(); }); });
    const ryd = krop.querySelector("#vk-klister-ryd");
    if (ryd) ryd.addEventListener("click", function () { kladde.klister = []; aendret(); visSide(); });
    krop.querySelector("#vk-gem").addEventListener("click", gem);
    krop.querySelector("#vk-fortryd").addEventListener("click", function () { kladde = rens(JSON.parse(gemt)); harAendringer = false; ok = ""; aendret(); harAendringer = false; visSide(); });
    krop.querySelector("#vk-nulstil").addEventListener("click", function () { kladde = standardDesign(); aendret(); visSide(); });
    krop.querySelector("#vk-vis").addEventListener("click", function () { aabnKort(FIGUR.navn, garderobe); });
    // så figuren ikke går, mens man skriver
    krop.querySelectorAll("input, textarea").forEach(function (inp) { inp.addEventListener("keydown", function (e) { e.stopPropagation(); }); });
  }

  function gem() {
    if (gemmer || !kladde) return;
    gemmer = true; fejl = ""; ok = ""; visSide();
    const d = rens(kladde);
    serverKald("hv_vip_kort_saet", { p_token: V.token(), p_kort: d }).then(function () {
      gemt = JSON.stringify(d);
      DESIGN[FIGUR.navn] = { kort: d, hentet: Date.now() };
      harAendringer = false;
      ok = "✅ Dit kort er gemt. Nu kan alle se det!";
      if (typeof besked !== "undefined" && besked) besked.textContent = "🪪 Dit nye spillerkort er gemt 👑";
    }).catch(function (e) { fejl = V.serverFejl(e).replace("database-52-vip.sql", "database-53-vip-kort.sql"); })
      .then(function () { gemmer = false; visSide(); });
  }

  V.nySide({
    id: "kort",
    navn: "🪪 Mit kort",
    vis: function (k) {
      krop = k;
      startRedigering();
      visSide();
    },
    forlad: function () {
      if (!redigerer) return;
      redigerer = false;
      // ikke gemte ændringer vises ikke længere på kortet
      kladde = null;
      harAendringer = false;
      krop = null;
      if (!spKort.hidden && kortNavn === FIGUR.navn) visKort();
    },
  });


  // -----------------------------------------------------------
  //  Udseendet
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#spillerkort.vk-design { color: var(--vk-boks-tekst); font-family: var(--vk-skrift); font-size: var(--vk-str); overflow: visible; position: fixed; }",
    "#spillerkort.vk-design .sk-top { background: rgba(0,0,0,.35); color: #fff4d6; border-radius: 8px 8px 0 0; font-family: var(--vk-skrift); }",
    "#spillerkort.vk-design .sk-luk { color: #fff4d6; }",
    "#spillerkort.vk-design .sk-raekker > p, #spillerkort.vk-design .sk-forhold, #spillerkort.vk-design .vk-ny {",
    "  background: var(--vk-boks) !important; color: var(--vk-boks-tekst) !important; border: 1px solid rgba(255,255,255,.35) !important;",
    "  border-radius: var(--vk-radius) !important; font-family: var(--vk-skrift); }",
    "#spillerkort.vk-design .sk-forhold b, #spillerkort.vk-design .sk-person span, #spillerkort.vk-design .sk-tom { color: var(--vk-boks-tekst) !important; font-family: var(--vk-skrift); }",
    "#spillerkort.vk-design .sk-job, #spillerkort.vk-design .sk-job b { color: #fff4d6; text-shadow: 0 1px 2px rgba(0,0,0,.6); }",
    "#spillerkort.vk-design .vk-statustekst { color: var(--vk-status); font-weight: bold; }",
    "#spillerkort .vk-titel { margin: 6px 8px 0; padding: 3px 8px; text-align: center; font-weight: bold; color: #fff4d6; background: rgba(0,0,0,.25);",
    "  border-radius: 999px; text-shadow: 0 1px 2px rgba(0,0,0,.6); word-wrap: break-word; }",
    "#spillerkort .vk-ny { margin: 0 0 6px; padding: 6px 8px; word-wrap: break-word; }",
    "#spillerkort .vk-ny > b { display: block; margin-bottom: 3px; }",
    "#spillerkort .vk-ny p { margin: 0; padding: 0; background: none !important; border: 0 !important; text-align: left; font-weight: normal; color: inherit !important; }",
    "#spillerkort .vk-linje { display: flex; justify-content: space-between; gap: 6px; padding: 1px 0; } #spillerkort .vk-linje span:last-child { font-weight: bold; text-align: right; }",
    "#spillerkort .vk-chips, #vip-vindue .vk-chips { display: flex; flex-wrap: wrap; gap: 4px; }",
    "#spillerkort .vk-chips span, #vip-vindue .vk-chips span { padding: 2px 8px; background: rgba(255,255,255,.55); border: 1px solid rgba(0,0,0,.12); border-radius: 999px; font-size: 12px; }",
    "#spillerkort .vk-maerker { display: flex; flex-wrap: wrap; gap: 4px; font-size: 18px; }",
    "#spillerkort .vk-maerker span { display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; background: rgba(255,255,255,.6);",
    "  border: 2px solid #d9a441; border-radius: 50%; }",
    // rammer om kortet
    "#spillerkort[data-vk-ramme='guld'] { border: 3px solid #d9a441 !important; box-shadow: 0 0 0 2px #7a1f2e, 0 0 14px rgba(255,200,80,.7), 0 6px 0 rgba(0,0,0,.25) !important; }",
    "#spillerkort[data-vk-ramme='soelv'] { border: 3px solid #d8d8d8 !important; box-shadow: 0 0 0 2px #8a8a8a, 0 0 12px rgba(255,255,255,.7) !important; }",
    "#spillerkort[data-vk-ramme='rose'] { border: 3px solid #f2a7c0 !important; box-shadow: 0 0 0 2px #c2185b, 0 0 12px rgba(255,150,190,.7) !important; }",
    "#spillerkort[data-vk-ramme='perler'] { border: 6px dotted #fffaf0 !important; box-shadow: 0 0 0 2px #d9c3a5, 0 6px 0 rgba(0,0,0,.2) !important; }",
    "#spillerkort[data-vk-ramme='ranke'] { border: 4px double #4f9a46 !important; }",
    "#spillerkort[data-vk-ramme='neon'] { border: 2px solid #ff4fd8 !important; animation: vk-neon 1.6s ease-in-out infinite alternate; }",
    "#spillerkort[data-vk-ramme='dobbelt'] { border: 6px double #d9a441 !important; }",
    "#spillerkort[data-vk-ramme='ingen'] { border-color: transparent !important; }",
    "@keyframes vk-neon { from { box-shadow: 0 0 4px #ff4fd8, 0 0 10px #ff4fd8; } to { box-shadow: 0 0 10px #ff4fd8, 0 0 24px #b04fff; } }",
    // rammer om figuren
    "#spillerkort[data-vk-figurramme] .sk-figur { border-radius: 10px; }",
    "#spillerkort[data-vk-figurramme='guld'] .sk-figur { border: 3px solid #d9a441; box-shadow: 0 0 0 1px #7a1f2e; }",
    "#spillerkort[data-vk-figurramme='soelv'] .sk-figur { border: 3px solid #d8d8d8; box-shadow: 0 0 0 1px #8a8a8a; }",
    "#spillerkort[data-vk-figurramme='rose'] .sk-figur { border: 3px solid #f2a7c0; }",
    "#spillerkort[data-vk-figurramme='perler'] .sk-figur { border: 4px dotted #fffaf0; }",
    "#spillerkort[data-vk-figurramme='ranke'] .sk-figur { border: 3px double #4f9a46; }",
    "#spillerkort[data-vk-figurramme='neon'] .sk-figur { border: 2px solid #ff4fd8; box-shadow: 0 0 10px #ff4fd8; }",
    "#spillerkort[data-vk-figurramme='dobbelt'] .sk-figur { border: 5px double #d9a441; }",
    "#spillerkort[data-vk-figurramme='ingen'] .sk-figur { border-color: transparent; }",
    // laget med klistermærker og effekter
    "#spillerkort .vk-lag { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: inherit; z-index: 2; }",
    "#spillerkort[data-vk-ramme='ranke'] .vk-lag { overflow: visible; }",
    "#spillerkort .vk-klister { position: absolute; transform: translate(-50%, -50%); line-height: 1; user-select: none; filter: drop-shadow(0 1px 1px rgba(0,0,0,.35)); }",
    "#spillerkort.vk-redig .vk-klister { pointer-events: auto; cursor: grab; outline: 1px dashed rgba(255,255,255,.7); border-radius: 4px; }",
    "#spillerkort .vk-hjoerne { position: absolute; font-size: 22px; font-style: normal; }",
    "#spillerkort .vk-fald { position: absolute; top: -20px; font-style: normal; opacity: .85; animation: vk-fald linear infinite; }",
    "@keyframes vk-fald { from { transform: translateY(-20px) rotate(0); } to { transform: translateY(720px) rotate(360deg); } }",
    "#spillerkort .vk-skin { position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent);",
    "  animation: vk-skin 3.5s ease-in-out infinite; }",
    "@keyframes vk-skin { 0% { left: -60%; } 60%, 100% { left: 130%; } }",
    // design-siden i VIP-vinduet
    "#vip-vindue .vk-sek { margin: 6px 0; background: #fff; border: 1px solid #e2c88e; border-radius: 10px; }",
    "#vip-vindue .vk-sek summary { padding: 8px 10px; cursor: pointer; font-weight: bold; color: #7a1f2e; }",
    "#vip-vindue .vk-sek[open] summary { border-bottom: 1px solid #f0e2c4; }",
    "#vip-vindue .vk-sek > div { padding: 6px 10px 10px; }",
    "#vip-vindue .vk-sek h5 { margin: 10px 0 4px; font-size: 12px; color: #6b4a3a; }",
    "#vip-vindue .vk-valg { display: flex; flex-wrap: wrap; gap: 4px; }",
    "#vip-vindue .vk-valg button, #vip-vindue .vk-raekke button { padding: 5px 8px; background: #fff7e6; border: 2px solid #f0e2c4; border-radius: 8px; cursor: pointer; color: #3a1a14; font-size: 12px; }",
    "#vip-vindue .vk-valg button.valgt, #vip-vindue .vk-raekke button.valgt, #vip-vindue .vk-emoji button.valgt { border-color: #7a1f2e; background: #fff3d6; font-weight: bold; }",
    "#vip-vindue .vk-swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }",
    "#vip-vindue .vk-swatch { height: 34px; border-radius: 8px; border: 2px solid #e2c88e; cursor: pointer; font-size: 16px; }",
    "#vip-vindue .vk-swatch.valgt { outline: 3px solid #7a1f2e; outline-offset: 1px; }",
    "#vip-vindue .vk-raekke { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 6px; font-size: 12px; }",
    "#vip-vindue .vk-raekke input[type=text] { flex: 1; min-width: 0; }",
    "#vip-vindue .vk-farve { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }",
    "#vip-vindue .vk-farve input { width: 34px; height: 26px; padding: 0; border: 1px solid #e2c88e; border-radius: 6px; background: #fff; cursor: pointer; }",
    "#vip-vindue .vk-sek input[type=text], #vip-vindue .vk-sek textarea { width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #e2c88e; border-radius: 6px;",
    "  font: 13px Verdana, sans-serif; color: #3a1a14; background: #fffdf8; resize: vertical; }",
    "#vip-vindue .vk-sek input[type=range] { width: 100%; accent-color: #7a1f2e; }",
    "#vip-vindue .vk-yndling { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; } #vip-vindue .vk-yndling label { font-size: 11px; color: #6b4a3a; }",
    "#vip-vindue .vk-chips.vk-ret span button { border: 0; background: none; color: #b0282e; cursor: pointer; padding: 0 0 0 2px; }",
    "#vip-vindue .vk-emoji { display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; }",
    "#vip-vindue .vk-emoji button { padding: 3px 0; font-size: 16px; background: #fff; border: 2px solid #f0e2c4; border-radius: 6px; cursor: pointer; }",
    "#vip-vindue .vk-liste { list-style: none; margin: 0; padding: 0; }",
    "#vip-vindue .vk-liste li { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid #f6ead0; font-size: 12px; }",
    "#vip-vindue .vk-liste button { padding: 1px 6px; margin-left: 2px; border: 1px solid #e2c88e; background: #fff7e6; border-radius: 5px; cursor: pointer; }",
    "#vip-vindue .vk-liste button:disabled { opacity: .3; cursor: default; }",
    "#vip-vindue .vk-gem { position: sticky; bottom: -12px; margin: 10px -12px -12px; padding: 8px 12px 10px; background: #fbf3e4; border-top: 2px solid #d9a441; }",
    "#vip-vindue .vk-gem .vk-raekke button { flex: 1; }",
  ].join("\n");
  document.head.appendChild(stil);
})();
