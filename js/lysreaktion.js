// =============================================================
//  💡 Lysreaktion — event-rummet med det lysende gulv (1. sal)
//  - Midt i rummet er et dansegulv af glasfliser, der kan lyse i alle farver.
//  - Lyspaneler på væggene og lyssøjler ved dansegulvet lyser med.
//  - Lyset styres fra Event-appen på telefonen (🎲 Lege → 💡 Lysreaktion):
//      ⏹ Sluk · 🎯 Ét felt ad gangen · 🪩 Disko · 🌈 Bølge · 🏃 Spillet Lysreaktion
//      + tempo (1–5) og farve (alle farver eller én bestemt).
//  - Spillet (udskilning, ligesom stoledans): værten tilmelder spillerne i rummet (ansatte og ejeren er ikke med).
//    Runde 1: 7 felter lyser i én farve (højst én færre end antal spillere). Man skal stille sig på et ledigt felt.
//    Hvert felt kan kun have én spiller (serveren afgør, hvem der kom først). Den, der ikke når et felt, er ude
//    og bliver flyttet ned til tilskuerne. Hver runde er der ét felt mindre (7, 6, 5 … 1). Den sidste tilbage vinder.
//  - Alle i rummet ser præcis det samme lys (serveren holder styr på det, og alle bruger serverens ur).
//  - Møblerne (realistiske 3D): lys-panel (hænger på væggen), lys-soejle, lys-pult. Billeder i billeder/moebler/lys-*/.
//    Panelet og søjlen har en "maske" (lys-*-maske-N.png), som farves med den farve, lyset har lige nu.
//    De findes også under Staff i møbelpanelet og i Shop → 🎪 Staff (gratis for ansatte), og lyser
//    stille i regnbuens farver, hvis man stiller dem i andre rum.
//  Kræver database-57-lysreaktion.sql. Hentes fra slutningen af js/panel-forklaring.js (hotel.html ikke rørt).
//  Alt her hedder "lys…" eller "LYS…", så det ikke støder ind i andre filer.
// =============================================================
(function () {
  if (window.lysreaktionKlar) return;
  window.lysreaktionKlar = true;

  const LYS_RUM_ID = "lysreaktion";
  const LYS_MANGLER = "⚠️ Serveren kender ikke lyset endnu. Kør database-57-lysreaktion.sql i Supabase → SQL Editor.";
  // dansegulvet (felterne der kan lyse): x 3–10, y 3–8
  const LYS_GULV = { x0: 3, y0: 3, b: 8, d: 6 };
  // de 8 lysfarver
  const LYS_FARVER = [
    { navn: "Rød", det: "røde", hex: "#ff2d4a" }, { navn: "Orange", det: "orange", hex: "#ff8a1f" }, { navn: "Gul", det: "gule", hex: "#ffd23a" },
    { navn: "Grøn", det: "grønne", hex: "#3dff6a" }, { navn: "Turkis", det: "turkise", hex: "#2de0ff" }, { navn: "Blå", det: "blå", hex: "#3a7bff" },
    { navn: "Lilla", det: "lilla", hex: "#a64dff" }, { navn: "Pink", det: "pink", hex: "#ff4fc3" },
  ];
  const LYS_TEMPO = [1500, 1000, 700, 450, 280];        // ms pr. skift (tempo 1–5)
  const LYS_SPIL_SEK = [14, 11, 9, 7, 5];               // spillet: sekunder til at finde et felt (samme som serveren)
  // tilskuerne (de udgåede spillere) står forrest i rummet: x 2–11, y 10–11
  const LYS_TILSKUER = { x0: 2, y0: 10, b: 10, d: 2 };
  const LYS_TILSTANDE = {
    sluk: { ikon: "⏹", navn: "Slukket" },
    et: { ikon: "🎯", navn: "Ét felt ad gangen" },
    disko: { ikon: "🪩", navn: "Disko" },
    boelge: { ikon: "🌈", navn: "Bølge" },
    spil: { ikon: "🏃", navn: "Spillet Lysreaktion" },
  };

  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 120) { try { gør(); } catch (e) { console.error(e); } return; }
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function iLysRummet() { try { return rumValg === "vaerelse" && aktivtVaerelse === LYS_RUM_ID; } catch (e) { return false; } }
  function lysToken() { try { return typeof mitToken === "function" ? mitToken() : null; } catch (e) { return null; } }
  function lysOnline() { return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function"; }
  function lysMangler(e) { return /function|schema cache|does not exist|hv_lys/i.test((e && e.message) || ""); }

  // =============================================================
  //  Lysets tilstand (fra serveren) og serverens ur
  // =============================================================
  let lys = { tilstand: "sluk" };   // { tilstand, tempo, farve, seed, start, x0, y0, b, d, (spil:) fase, deltagere, med, ude, ude_nu, runde, antal, felter, optaget, farve, rstart, sek, vinder }
  let lysUrForskel = 0;             // serverens ur minus vores ur (ms)
  let lysFejl = "";
  function lysNu() { return Date.now() + lysUrForskel; }
  function brugSvar(svar, sendt) {
    if (!svar) return;
    if (svar.nu) {
      const rejse = sendt ? (Date.now() - sendt) / 2 : 0;
      lysUrForskel = svar.nu + rejse - Date.now();
    }
    if (svar.tilstand) lys = svar.tilstand && svar.tilstand.tilstand ? svar.tilstand : { tilstand: "sluk" };
    lysFejl = "";
  }
  let henter = false;
  function hentLys() {
    if (!lysOnline() || henter) return Promise.resolve();
    henter = true;
    const sendt = Date.now();
    return serverKald("hv_lys_hent", { p_rum: LYS_RUM_ID })
      .then(function (s) { brugSvar(s, sendt); })
      .catch(function (e) { lysFejl = lysMangler(e) ? LYS_MANGLER : (e.message || "Kunne ikke hente lyset."); })
      .finally(function () { henter = false; });
  }
  // Event-appen sætter lyset. Disko o.l. virker også uden server (kun på din egen skærm); spillet kræver serveren.
  function saetLys(ny) {
    const data = Object.assign({ tempo: lys.tempo || 3, farve: typeof lys.farve === "string" ? lys.farve : "alle" }, LYS_GULV, ny);
    const var_ = lys;
    // lokalt med det samme, så knapperne svarer hurtigt
    if (data.tilstand !== "spil") lys = Object.assign({}, data, { seed: Math.floor(Math.random() * 1e6), start: lysNu() });
    else if (lys.tilstand === "spil" && data.handling === "tempo") lys = Object.assign({}, lys, { tempo: data.tempo, sek: LYS_SPIL_SEK[data.tempo - 1] });
    if (!lysOnline() || !lysToken()) {
      lysFejl = data.tilstand === "spil" ? "Spillet kræver, at du er på serveren." : "Du er ikke på serveren, så kun du kan se lyset.";
      return Promise.resolve();
    }
    const sendt = Date.now();
    return serverKald("hv_lys_saet", { p_token: lysToken(), p_rum: LYS_RUM_ID, p_tilstand: data })
      .then(function (s) { brugSvar(s, sendt); })
      .catch(function (e) {
        lysFejl = lysMangler(e) ? LYS_MANGLER : (e.message || "Noget gik galt.");
        if (data.tilstand === "spil" || /logget ind|Kun ejeren/i.test(e.message || "")) lys = var_;
        else if (!lysMangler(e)) lysFejl = "Serveren svarede ikke, så lyset ses kun hos dig lige nu. (" + (e.message || "fejl") + ")";
      });
  }
  // Hvem kan være med i spillet? Spillerne i rummet, men ikke ejeren, ansatte og computer-gæster
  function erHoldet(n) {
    try {
      if (typeof EJERE !== "undefined" && EJERE.indexOf(n) >= 0) return true;
      if (typeof erAnsat === "function" && erAnsat(n)) return true;
      const sk = typeof ansatte !== "undefined" ? ansatte[n] : null;
      return !!sk && ["eventfolk", "eventvaert", "mod", "staff", "hjaelper", "bygmester", "support"].indexOf(sk) >= 0;
    } catch (e) { return false; }
  }
  function spillereIRummet() {
    const ud = [];
    try {
      Object.values(ANDRE_SPILLERE).forEach(function (g) {
        if (g.rumId !== LYS_RUM_ID || erHoldet(g.navn)) return;
        if (typeof erComputerGaest === "function" && erComputerGaest(g.navn)) return;
        if (ud.indexOf(g.navn) < 0) ud.push(g.navn);
      });
      if (iLysRummet() && typeof FIGUR !== "undefined" && !erHoldet(FIGUR.navn) && ud.indexOf(FIGUR.navn) < 0) ud.push(FIGUR.navn);
    } catch (e) {}
    return ud.sort(function (a, b) { return a.localeCompare(b); });
  }
  function naesteAntal() {
    const med = (lys.med || []).length;
    if (lys.fase === "omgang") return lys.antal || 1;
    return Math.max(1, Math.min(7, med - 1, lys.antal ? lys.antal - 1 : 7));
  }
  window.lysreaktion = { hent: function () { return lys; }, saet: saetLys, nu: lysNu };

  // =============================================================
  //  Hvilke felter lyser lige nu, og med hvilken farve?
  // =============================================================
  function hash(a, b, c, d) {
    let h = (a | 0) * 374761393 + (b | 0) * 668265263 + (c | 0) * 2147483647 + (d | 0) * 1274126177;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return h >>> 0;
  }
  function fastFarve() {
    const f = lys.farve;
    if (typeof f === "string" && f !== "alle") { const i = LYS_FARVER.findIndex(function (x) { return x.hex === f; }); if (i >= 0) return i; }
    return -1;
  }
  function trin() {
    const p = LYS_TEMPO[(lys.tempo || 3) - 1] || 700;
    const t = Math.max(0, lysNu() - (lys.start || 0));
    return { k: Math.floor(t / p), del: (t % p) / p };
  }
  function gulvB() { return { x0: lys.x0 != null ? lys.x0 : LYS_GULV.x0, y0: lys.y0 != null ? lys.y0 : LYS_GULV.y0, b: lys.b || LYS_GULV.b, d: lys.d || LYS_GULV.d }; }
  // Ét felt ad gangen: hvilket felt og hvilken farve i trin k
  function etFelt(k) {
    const g = gulvB(), n = g.b * g.d;
    let i = hash(lys.seed, k, 1) % n;
    if (k > 0 && i === hash(lys.seed, k - 1, 1) % n) i = (i + 1 + (k % (n - 1))) % n;
    const ff = fastFarve();
    let f = ff >= 0 ? ff : hash(lys.seed, k, 2) % 8;
    if (ff < 0 && k > 0 && f === hash(lys.seed, k - 1, 2) % 8) f = (f + 3) % 8;
    return { x: g.x0 + (i % g.b), y: g.y0 + Math.floor(i / g.b), f: f };
  }
  // giver { "x,y": [farveNr, styrke 0–1] }
  function lysFelter() {
    const ud = {};
    const t = lys.tilstand, g = gulvB();
    if (!t || t === "sluk") return ud;
    if (t === "spil") {
      const nu = lysNu(), fase = lys.fase, opt = lys.optaget || {};
      if (fase === "vinder") {
        // fest for vinderen: regnbuebølge over hele gulvet
        const fase2 = nu / 260;
        for (let x = 0; x < g.b; x++) for (let y = 0; y < g.d; y++) ud[(g.x0 + x) + "," + (g.y0 + y)] = [(((Math.floor((x + y) / 1.5 - fase2) % 8) + 8) % 8), 0.9];
        return ud;
      }
      if (fase === "runde" && lys.rstart && nu < lys.rstart) {
        // nedtælling: hele gulvet blinker svagt hvert sekund
        const sek = (lys.rstart - nu) / 1000;
        const styrke = Math.max(0, 1 - (sek % 1) * 2.5) * 0.35;
        if (styrke > 0) for (let x = 0; x < g.b; x++) for (let y = 0; y < g.d; y++) ud[(g.x0 + x) + "," + (g.y0 + y)] = [-1, styrke];
        return ud;
      }
      if (fase === "runde") {
        (lys.felter || []).forEach(function (f) {
          const k = f[0] + "," + f[1];
          ud[k] = opt[k] ? [lys.farve | 0, 1, opt[k]] : [lys.farve | 0, 0.7 + 0.3 * Math.sin(nu / 110)];
        });
        return ud;
      }
      if (fase === "slut_runde" || fase === "omgang") {
        Object.keys(opt).forEach(function (k) { ud[k] = [lys.farve | 0, 0.9, opt[k]]; });
      }
      return ud;
    }
    const tr = trin(), ff = fastFarve();
    if (t === "et") {
      const a = etFelt(tr.k);
      ud[a.x + "," + a.y] = [a.f, 1 - tr.del * 0.25];
      if (tr.k > 0) {
        const b = etFelt(tr.k - 1);
        if (b.x !== a.x || b.y !== a.y) ud[b.x + "," + b.y] = [b.f, 0.45 * (1 - tr.del)];
      }
    } else if (t === "disko") {
      for (let x = 0; x < g.b; x++) for (let y = 0; y < g.d; y++) {
        const h = hash(lys.seed, tr.k, x + 1, y + 1);
        if (h % 100 < 45) ud[(g.x0 + x) + "," + (g.y0 + y)] = [ff >= 0 ? ff : (h >>> 8) % 8, 0.95];
      }
    } else if (t === "boelge") {
      const fase = tr.k + tr.del;
      for (let x = 0; x < g.b; x++) for (let y = 0; y < g.d; y++) {
        const v = (x + y) / 1.6 - fase;
        if (ff >= 0) ud[(g.x0 + x) + "," + (g.y0 + y)] = [ff, 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(v * 1.3))];
        else ud[(g.x0 + x) + "," + (g.y0 + y)] = [(((Math.floor(-v) % 8) + 8) % 8), 0.9];
      }
    }
    return ud;
  }
  // Lyspaneler og lyssøjler: hvilken farve lige nu? (nr = et tal, der gør dem forskellige)
  function moebelFarve(nr) {
    const t = lys.tilstand;
    if (!iLysRummet()) {
      // i andre rum: stille regnbue
      const v = Date.now() / 1400 + nr * 0.7;
      return [Math.floor(v) % 8, 0.75];
    }
    if (!t || t === "sluk") return null;
    if (t === "spil") {
      const nu = lysNu();
      if (lys.fase === "vinder") return [Math.floor(nu / 300 + nr) % 8, 0.95];                                   // fest
      if (lys.fase === "runde" && lys.rstart && nu >= lys.rstart) return [lys.farve | 0, 0.85 + 0.15 * Math.sin(nu / 120)];   // farven man skal finde
      return [-1, 0.5 + 0.4 * Math.sin(nu / 160)];                                                                // guld, mens vi venter
    }
    const tr = trin(), ff = fastFarve();
    if (t === "et") return [etFelt(tr.k).f, 1 - tr.del * 0.3];
    if (t === "disko") return [ff >= 0 ? ff : hash(lys.seed, tr.k, 99, nr) % 8, 0.95];
    return [ff >= 0 ? ff : ((tr.k + nr) % 8), 0.9];
  }
  function farveHex(nr) { return nr < 0 ? "#ffd27a" : LYS_FARVER[nr % 8].hex; }

  // =============================================================
  //  Møblerne (realistiske 3D, skala 0.5 ligesom staff-møblerne)
  // =============================================================
  const LYS_STI = "billeder/moebler/";
  const LYS_TYPER = [
    { id: "lys-panel", navn: "Lyspanel til væggen", paaVaeg: true, kanGaaPaa: true, skala: 0.5,
      ankre: [[126, 413], [126, 413], [126, 413], [126, 413]], retningerNr: [0, 1, 0, 1], maske: true },
    { id: "lys-soejle", navn: "Lyssøjle", skala: 0.5, ankre: [[126, 352], [126, 352], [126, 352], [126, 352]], retningerNr: [0, 1, 2, 3], maske: true },
    { id: "lys-pult", navn: "Lyspult", felter: [2, 1], skala: 0.5, ankre: [[222, 385], [126, 385], [222, 385], [126, 385]], retningerNr: [0, 1, 2, 3] },
  ];
  LYS_TYPER.forEach(function (t) {
    t.retninger = t.retningerNr.map(function (r) { return LYS_STI + t.id + "/" + t.id + "-" + r + ".png?r=1"; });
    if (t.maske) t.masker = t.retningerNr.map(function (r) { return LYS_STI + t.id + "/" + t.id + "-maske-" + r + ".png?r=1"; });
  });

  function lavMoebler() {
    if (MOEBEL_TYPER["lys-panel"]) return;
    const kat = typeof STAFF_KAT !== "undefined" ? STAFF_KAT : "Staff";
    LYS_TYPER.forEach(function (t) {
      t.kategori = kat;
      t.staff = true;
      MOEBLER.push(t);
      MOEBEL_TYPER[t.id] = t;
      forberedRetninger(t);
      if (t.masker) t.masker.forEach(function (s) { hentBillede(s); });
      if (typeof STAFF_SHOP_KAT !== "undefined" && STAFF_SHOP_KAT.ting.indexOf(t) < 0) STAFF_SHOP_KAT.ting.push(t);
    });
    // knapper i møbelpanelets Staff-fane (som de andre staff-møbler)
    if (typeof knapBoks !== "undefined" && typeof ikoner !== "undefined") {
      const knapper = [];
      LYS_TYPER.forEach(function (type) {
        const knap = document.createElement("button");
        knap.className = "moebel-knap";
        knap.dataset.id = type.id;
        knap.dataset.kategori = type.kategori;
        knap.hidden = true;
        const ikon = document.createElement("canvas");
        ikon.width = 64; ikon.height = 70;
        ikoner.push({ ikon: ikon, type: type });
        const navn = document.createElement("span");
        navn.textContent = type.navn;
        knap.append(ikon, navn);
        knap.addEventListener("click", function () {
          if (typeof erStaff === "function" && !erStaff()) return;
          valgtType = valgtType === type.id ? null : type.id;
          valgtMoebel = null;
          opdaterPanel();
        });
        knapBoks.appendChild(knap);
        knapper.push(knap);
      });
      if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 1200);
      setInterval(function () {
        const vis = typeof valgtKategori !== "undefined" && valgtKategori === LYS_TYPER[0].kategori && (typeof erStaff !== "function" || erStaff());
        knapper.forEach(function (k) { k.hidden = !vis; });
      }, 300);
    }
    // lyspanelet skal hænge på en væg (bagvæggen eller venstre væg)
    function vaegSide(x, y) {
      if (!erIRummet(x, y)) return null;
      let bag = true, venstre = true;
      for (let yy = 0; yy < y; yy++) if (erIRummet(x, yy)) bag = false;
      for (let xx = 0; xx < x; xx++) if (erIRummet(xx, y)) venstre = false;
      return bag || venstre;
    }
    const pladsTilFoerLys = pladsTil;
    pladsTil = function (type, x, y) {
      if (type && type.id === "lys-panel" && !vaegSide(x, y)) return false;
      return pladsTilFoerLys.apply(this, arguments);
    };
    laerred.addEventListener("click", function (e) {
      if (valgtType !== "lys-panel") return;
      const f = musTilFelt(e);
      if (erIRummet(f.x, f.y) && !vaegSide(f.x, f.y)) {
        setTimeout(function () { besked.textContent = "💡 Lyspanelet skal hænge på en væg. Klik på et felt helt inde ved væggen (Drej skifter væg i hjørnet)."; }, 0);
      }
    }, true);
  }

  // Farvet maske: tegnes oven på panelet/søjlen i den farve, lyset har nu (gemmes, så det går hurtigt)
  const maskeCache = {};
  function farvetMaske(src, hex) {
    const n = src + "|" + hex;
    if (maskeCache[n]) return maskeCache[n];
    const b = hentBillede(src);
    if (!billedeKlar(b)) return null;
    const c = document.createElement("canvas");
    c.width = b.naturalWidth; c.height = b.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(b, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = hex;
    g.fillRect(0, 0, c.width, c.height);
    // et hvidt "hotspot" i midten, så det ser ud som om det lyser indefra
    g.globalCompositeOperation = "source-atop";
    const gr = g.createLinearGradient(0, 0, c.width, c.height);
    gr.addColorStop(0, "rgba(255,255,255,0.18)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,0.12)");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    if (Object.keys(maskeCache).length > 80) Object.keys(maskeCache).forEach(function (k) { delete maskeCache[k]; });
    return (maskeCache[n] = c);
  }

  // =============================================================
  //  Rummet
  // =============================================================
  const LYS_MOEBLER = [
    // bagvæggen: højttalere, lyspaneler og lyspulten i midten
    { type: "ev-hoejtaler", x: 0, y: 0, retning: 0 },
    { type: "lys-panel", x: 2, y: 0, retning: 0 },
    { type: "lys-panel", x: 4, y: 0, retning: 0 },
    { type: "lys-pult", x: 6, y: 0, retning: 0 },
    { type: "lys-panel", x: 9, y: 0, retning: 0 },
    { type: "lys-panel", x: 11, y: 0, retning: 0 },
    { type: "ev-hoejtaler", x: 13, y: 0, retning: 0 },
    // venstre væg: lyspaneler og sofaer til tilskuerne
    { type: "lys-panel", x: 0, y: 3, retning: 1 },
    { type: "lys-panel", x: 0, y: 6, retning: 1 },
    { type: "lys-panel", x: 0, y: 9, retning: 1 },
    { type: "ev-vip-sofa", x: 1, y: 4, retning: 1 },
    { type: "ev-vip-sofa", x: 1, y: 7, retning: 1 },
    // lyssøjler i dansegulvets hjørner
    { type: "lys-soejle", x: 2, y: 2, retning: 0 },
    { type: "lys-soejle", x: 11, y: 2, retning: 0 },
    { type: "lys-soejle", x: 2, y: 9, retning: 0 },
    { type: "lys-soejle", x: 11, y: 9, retning: 0 },
    // højre side og forrest
    { type: "ev-spotlight", x: 13, y: 3, retning: 3 },
    { type: "ev-spotlight", x: 13, y: 8, retning: 3 },
    { type: "cafe-plante", x: 0, y: 11, retning: 0 },
    { type: "cafe-plante", x: 13, y: 11, retning: 0 },
  ];
  function lysSomData() {
    return LYS_MOEBLER.filter(function (m) { return MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
  }

  function lavRummet() {
    INDBYGGEDE_RUM[LYS_RUM_ID] = { id: LYS_RUM_ID, navn: "Lysreaktion", ejer: EJER_NAVNE[0], bredde: 14, dybde: 12,
      vaeg: "#3a1420", gulv1: "#2e1e24", gulv2: "#291a20", vaegHoejde: 280, doer: null };
    if (typeof RF_STANDARD !== "undefined") RF_STANDARD[LYS_RUM_ID] = { vaeg: "#3a1420", gulv1: "#2e1e24", gulv2: "#291a20" };
    // i navigatøren (og elevatoren) på 1. sal, efter event-rummene
    if (!NAV_RUM.some(function (r) { return r.id === LYS_RUM_ID; })) {
      let efter = -1;
      NAV_RUM.forEach(function (r, i) { if (r.etage === "sal1" && /^event\d+$/.test(r.id)) efter = i; });
      NAV_RUM.splice(efter >= 0 ? efter + 1 : NAV_RUM.length, 0, { id: LYS_RUM_ID, etage: "sal1", navn: "💡 Lysreaktion",
        om: "Det lysende dansegulv. Hvem er hurtigst til lyset?", billede: "billeder/rum/event.png", maks: 40, rum: "vaerelse", vaerelse: LYS_RUM_ID });
    }
    // møblerne: det, der er gemt på denne computer, ellers rummets egne
    const vaerelseMoeblerFoerLys = vaerelseMoebler;
    vaerelseMoebler = function (id) {
      if (id === LYS_RUM_ID && !andreVaerelser[LYS_RUM_ID]) {
        let gemt = null;
        try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-" + LYS_RUM_ID) || "null"); } catch (e) {}
        andreVaerelser[LYS_RUM_ID] = (Array.isArray(gemt) && gemt.length ? gemt : lysSomData())
          .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
      }
      return vaerelseMoeblerFoerLys(id);
    };
    if (typeof serverKald === "function") {
      const serverKaldFoerLys = serverKald;
      serverKald = async function (funktion, data) {
        const svar = await serverKaldFoerLys(funktion, data);
        if (funktion === "hv_rum_moebler_hent" && svar && !(Array.isArray(svar[LYS_RUM_ID]) && svar[LYS_RUM_ID].length)) svar[LYS_RUM_ID] = lysSomData();
        return svar;
      };
    }
    const skiftRumFoerLys = skiftRum;
    skiftRum = function (navn) {
      skiftRumFoerLys.apply(this, arguments);
      if (iLysRummet()) {
        besked.textContent = "💡 Velkommen i Lysreaktion! Når lyset er tændt, så løb hen på det felt, der lyser. Den første får et point.";
        hentLys();
      }
    };

    // ----- dansegulvet tegnes oven på det almindelige gulv -----
    const tegnGulvFoerLys = tegnGulv;
    tegnGulv = function () {
      tegnGulvFoerLys.apply(this, arguments);
      if (!iLysRummet()) return;
      try { tegnTilskuere(); tegnDansegulv(); } catch (e) { console.warn(e); }
    };

    // ----- lyspaneler og lyssøjler lyser -----
    const tegnMoebelFoerLys = tegnMoebel;
    tegnMoebel = function (c, type, cx, cy, spejlet, retning) {
      tegnMoebelFoerLys.apply(this, arguments);
      if (!type || !type.masker || c !== ctx) return;
      try {
        const r = retning || 0;
        const nr = Math.round(cx / 37 + cy / 53);
        const f = moebelFarve(nr);
        if (!f) return;
        const rb = hentBillede(type.retninger[r]);
        const m = farvetMaske(type.masker[r], farveHex(f[0]));
        if (!m || !billedeKlar(rb)) return;
        const s = type.skala || 1;
        const a = moebelAnker(type, rb.naturalWidth, rb.naturalHeight, r);
        const x = cx - a[0] * s, y = cy + FLISE_H / 2 - a[1] * s, w = m.width * s, h = m.height * s;
        c.save();
        c.globalAlpha = 0.55 + 0.4 * f[1];
        c.drawImage(m, x, y, w, h);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.2 * f[1];
        c.shadowColor = farveHex(f[0]);
        c.shadowBlur = 22;
        c.drawImage(m, x, y, w, h);
        c.restore();
      } catch (e) {}
    };
  }

  // Glasfliserne: mørke med guldkant, og de lysende fliser gløder i deres farve
  function tegnDansegulv() {
    const g = gulvB();
    const felter = lysFelter();
    const nu = lysNu();
    ctx.save();
    for (let x = g.x0; x < g.x0 + g.b; x++) for (let y = g.y0; y < g.y0 + g.d; y++) {
      if (!erIRummet(x, y)) continue;
      const d = diamant(x, y);
      polygon(ctx, d, "rgba(18,8,12,0.9)");
      // glas-skær
      const m = feltMidte(x, y);
      const gr = ctx.createLinearGradient(m.x, m.y - FLISE_H / 2, m.x, m.y + FLISE_H / 2);
      gr.addColorStop(0, "rgba(255,255,255,0.10)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      polygon(ctx, indeni(d, 0.86), gr);
    }
    // de lysende felter
    Object.keys(felter).forEach(function (k) {
      const p = k.split(",").map(Number), v = felter[k];
      if (!erIRummet(p[0], p[1])) return;
      const hex = farveHex(v[0]);
      const d = diamant(p[0], p[1]);
      ctx.save();
      ctx.globalAlpha = Math.min(1, v[1]);
      ctx.shadowColor = hex; ctx.shadowBlur = 24 * v[1];
      polygon(ctx, indeni(d, 0.92), hex);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.45 * v[1];
      polygon(ctx, indeni(d, 0.45), "#ffffff");
      ctx.restore();
    });
    // spillet: optagne felter får en guldkant
    Object.keys(felter).forEach(function (k) {
      const v = felter[k];
      if (!v[2]) return;
      const p = k.split(",").map(Number);
      const d = indeni(diamant(p[0], p[1]), 0.92);
      ctx.save();
      ctx.strokeStyle = "#ffe7a3"; ctx.lineWidth = 3; ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(d[0].x, d[0].y); d.slice(1).forEach(function (q) { ctx.lineTo(q.x, q.y); }); ctx.closePath(); ctx.stroke();
      ctx.restore();
    });
    // guldkanter mellem fliserne
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(217,164,65,0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = g.x0; x <= g.x0 + g.b; x++) { const a = punkt(x, g.y0), b = punkt(x, g.y0 + g.d); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    for (let y = g.y0; y <= g.y0 + g.d; y++) { const a = punkt(g.x0, y), b = punkt(g.x0 + g.b, y); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    ctx.stroke();
    ctx.strokeStyle = "#d9a441"; ctx.lineWidth = 2.5;
    const h = [punkt(g.x0, g.y0), punkt(g.x0 + g.b, g.y0), punkt(g.x0 + g.b, g.y0 + g.d), punkt(g.x0, g.y0 + g.d)];
    ctx.beginPath(); ctx.moveTo(h[0].x, h[0].y); h.slice(1).forEach(function (q) { ctx.lineTo(q.x, q.y); }); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  // Tilskuerne: et vinrødt tæppe med guldkant forrest i rummet
  function tegnTilskuere() {
    const z = LYS_TILSKUER;
    const h = [punkt(z.x0, z.y0), punkt(z.x0 + z.b, z.y0), punkt(z.x0 + z.b, z.y0 + z.d), punkt(z.x0, z.y0 + z.d)];
    const m = { x: (h[0].x + h[2].x) / 2, y: (h[0].y + h[2].y) / 2 };
    ctx.save();
    polygon(ctx, h, "#5e1622");
    polygon(ctx, h.map(function (q) { return { x: m.x + (q.x - m.x) * 0.95, y: m.y + (q.y - m.y) * 0.8 }; }), "#7a1f2e");
    ctx.strokeStyle = "#d9a441"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(h[0].x, h[0].y); h.slice(1).forEach(function (q) { ctx.lineTo(q.x, q.y); }); ctx.closePath(); ctx.stroke();
    // TILSKUERE skrevet skråt langs tæppet
    ctx.translate(m.x, m.y);
    ctx.transform(1, 0.5, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(232,207,143,0.8)";
    ctx.font = "bold 20px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("T I L S K U E R E", 0, 0);
    ctx.restore();
  }
  function iZone(z, x, y) { return x >= z.x0 && x < z.x0 + z.b && y >= z.y0 && y < z.y0 + z.d; }
  function indeni(d, f) {
    const cx = (d[0].x + d[2].x) / 2, cy = (d[0].y + d[2].y) / 2;
    return d.map(function (q) { return { x: cx + (q.x - cx) * f, y: cy + (q.y - cy) * f }; });
  }

  // =============================================================
  //  Spillet: står jeg stille på et ledigt felt i farven? Så siger jeg det til serveren
  // =============================================================
  function mitNavn() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  function spilIGang() { return lys.tilstand === "spil" && ["runde", "slut_runde", "omgang"].indexOf(lys.fase) >= 0; }
  let sendtFelt = "", sidstUdeBesked = 0;
  setInterval(function () {
    if (!iLysRummet() || lys.tilstand !== "spil") return;
    const mig = mitNavn();
    tjekTilskuer(mig);
    const nu = lysNu();
    if (lys.fase !== "runde" || !lys.rstart || nu < lys.rstart) return;
    if ((lys.med || []).indexOf(mig) < 0) return;
    const opt = lys.optaget || {};
    if (Object.keys(opt).some(function (k) { return opt[k] === mig; })) return;
    if (figur.rute && figur.rute.length) return;            // man skal stå stille på feltet
    let f;
    try { f = figurFelt(); } catch (e) { return; }
    const k = f.x + "," + f.y;
    if (opt[k] || !(lys.felter || []).some(function (q) { return q[0] === f.x && q[1] === f.y; })) return;
    if (sendtFelt === lys.runde + "|" + k || !lysOnline() || !lysToken()) return;
    sendtFelt = lys.runde + "|" + k;
    const sendt = Date.now();
    serverKald("hv_lys_ramt", { p_token: lysToken(), p_rum: LYS_RUM_ID, p_runde: lys.runde, p_x: f.x, p_y: f.y })
      .then(function (s) {
        if (s && s.tilstand) brugSvar(s, sendt);
        besked.textContent = s && s.ok ? "✅ Du fik et felt! Bliv stående." : "❌ Feltet var allerede taget. Find et andet!";
        opdaterSkilt();
      }).catch(function () { sendtFelt = ""; });
  }, 120);

  // Er jeg ude af spillet og står på dansegulvet? Så bliver jeg flyttet ned til tilskuerne
  function tjekTilskuer(mig) {
    if (!spilIGang() || (lys.ude || []).indexOf(mig) < 0) return;
    let f;
    try { f = figurFelt(); } catch (e) { return; }
    const g = gulvB();
    const paaVej = figur.rute && figur.rute.length && iZone(g, figur.rute[figur.rute.length - 1].x, figur.rute[figur.rute.length - 1].y);
    if (!iZone(g, f.x, f.y) && !paaVej) return;
    const z = LYS_TILSKUER, ledige = [];
    for (let y = z.y0; y < z.y0 + z.d; y++) for (let x = z.x0; x < z.x0 + z.b; x++) {
      if (typeof moebelPaa === "function" && moebelPaa(x, y)) continue;
      const optaget = Object.values(typeof ANDRE_SPILLERE !== "undefined" ? ANDRE_SPILLERE : {})
        .some(function (a) { return a.rumId === LYS_RUM_ID && Math.round(a.x) === x && Math.round(a.y) === y; });
      if (!optaget) ledige.push({ x: x, y: y });
    }
    const m = ledige.length ? ledige[Math.floor(Math.random() * ledige.length)] : { x: z.x0 + Math.floor(Math.random() * z.b), y: z.y0 };
    if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
    figur.rute = [];
    figur.x = m.x; figur.y = m.y;
    if (Date.now() - sidstUdeBesked > 4000) { besked.textContent = "😢 Du er ude af Lysreaktion. Du er tilskuer nu 👀"; sidstUdeBesked = Date.now(); }
  }

  // Hent lyset fra serveren: ofte i spillet, sjældnere ellers
  let sidstHent = 0;
  setInterval(function () {
    if (!iLysRummet() && !lysAppAaben()) return;
    const hvorTit = lys.tilstand === "spil" ? (lys.fase === "runde" ? 600 : 1200) : 3000;
    if (Date.now() - sidstHent < hvorTit) return;
    sidstHent = Date.now();
    hentLys().then(opdaterSkilt);
  }, 200);

  // =============================================================
  //  Skiltet øverst i rummet: "🏆 Pall var hurtigst!" og pointtavlen
  // =============================================================
  const skilt = document.createElement("div");
  skilt.id = "lys-skilt";
  skilt.hidden = true;
  document.body.appendChild(skilt);
  function navneListe(l, max) {
    const mig = mitNavn();
    l = l || [];
    return l.slice(0, max || 12).map(function (n) { return n === mig ? "<b>" + esc(n) + "</b>" : esc(n); }).join(", ") + (l.length > (max || 12) ? " …" : "");
  }
  function opdaterSkilt() {
    if (!iLysRummet() || !lys.tilstand || lys.tilstand === "sluk") { skilt.hidden = true; return; }
    skilt.hidden = false;
    const nu = lysNu(), mig = mitNavn();
    let html = "<div class='ls-top'>💡 LYSREAKTION <small>" + LYS_TILSTANDE[lys.tilstand].ikon + " " + LYS_TILSTANDE[lys.tilstand].navn + "</small></div>";
    if (lys.tilstand === "spil") {
      const med = lys.med || [], fase = lys.fase;
      if (fase === "klar") {
        html += "<div class='ls-stor'>👥 " + med.length + " spillere er med · Værten starter snart</div>";
      } else if (fase === "runde" && lys.rstart && nu < lys.rstart) {
        html += "<div class='ls-stor'>Runde " + lys.runde + ": " + (lys.antal || 0) + (lys.antal === 1 ? " felt" : " felter") + " · Gør jer klar … " + Math.ceil((lys.rstart - nu) / 1000) + "</div>";
      } else if (fase === "runde") {
        const rest = Math.max(0, Math.ceil((lys.rstart + (lys.sek || 9) * 1000 - nu) / 1000));
        const taget = Object.keys(lys.optaget || {}).length;
        html += "<div class='ls-stor'>Stil dig på et <span class='ls-prik' style='background:" + farveHex(lys.farve | 0) + "'></span> " +
          LYS_FARVER[(lys.farve | 0) % 8].det + " felt! <small>" + taget + " af " + lys.antal + " taget · ⏱ " + rest + "</small></div>";
      } else if (fase === "slut_runde") {
        html += "<div class='ls-stor'>❌ Ude: " + navneListe(lys.ude_nu, 8) + "</div>";
      } else if (fase === "omgang") {
        html += "<div class='ls-stor'>Ingen nåede et felt. Runden tages om!</div>";
      } else if (fase === "vinder") {
        html += "<div class='ls-stor ls-vinder'>🏆 " + esc(lys.vinder || "") + " har vundet Lysreaktion! 🎉</div>";
      }
      if (fase !== "vinder" && med.length) html += "<div class='ls-point'><span>✅ Med (" + med.length + "): " + navneListe(med, 12) + "</span></div>";
      if (spilIGang() && (lys.ude || []).indexOf(mig) >= 0) html += "<div class='ls-point'><span>👀 Du er ude og er tilskuer nu</span></div>";
    }
    if (skilt.innerHTML !== html) skilt.innerHTML = html;
  }
  setInterval(opdaterSkilt, 250);

  // =============================================================
  //  📱 Event-appen: 🎲 Lege → 💡 Lysreaktion styrer det hele
  // =============================================================
  let lysAppBoks = null;
  function lysAppAaben() { return !!(lysAppBoks && lysAppBoks.isConnected); }
  function tegnAppStyring(boks, api) {
    lysAppBoks = boks;
    const t = lys.tilstand || "sluk", tempo = lys.tempo || 3, ff = fastFarve();
    const maa = !api || !api.maaBruge || api.maaBruge();
    let html = "";
    if (lysFejl) html += "<p class='ea-advarsel'>" + esc(lysFejl) + "</p>";
    html += "<div class='ea-hj-boks'><small>Lyset i rummet lige nu</small><b>" + LYS_TILSTANDE[t].ikon + " " + LYS_TILSTANDE[t].navn +
      (t !== "sluk" ? " · tempo " + tempo : "") + "</b><canvas class='lys-mini' width='240' height='130'></canvas></div>";
    html += "<div class='ea-hj-knapper'>" + (iLysRummet() ? "" : "<button data-lys='gaa'>🚶 Gå til Lysreaktion</button>") + "</div>";
    html += "<h4 class='ea-dag'>💡 Tænd lyset</h4><div class='ea-hj-knapper lys-valg'>" +
      ["sluk", "et", "disko", "boelge", "spil"].map(function (k) {
        return "<button data-lys-t='" + k + "'" + (k === t ? " class='lys-valgt'" : "") + ">" + LYS_TILSTANDE[k].ikon + " " + LYS_TILSTANDE[k].navn + "</button>";
      }).join("") + "</div>";
    html += "<h4 class='ea-dag'>⏩ Tempo</h4><div class='ea-hj-knapper lys-tempo'><span>🐢</span>" + [1, 2, 3, 4, 5].map(function (n) {
      return "<button data-lys-tempo='" + n + "'" + (n === tempo ? " class='lys-valgt'" : "") + ">" + n + "</button>";
    }).join("") + "<span>🐇</span></div>";
    if (t !== "spil") {
      html += "<h4 class='ea-dag'>🎨 Farve</h4><div class='lys-farver'><button data-lys-farve='alle' class='lys-alle" + (ff < 0 ? " lys-valgt" : "") + "'>🌈 Alle</button>" +
        LYS_FARVER.map(function (f, i) {
          return "<button data-lys-farve='" + f.hex + "' title='" + f.navn + "' class='lys-farve" + (ff === i ? " lys-valgt" : "") + "' style='background:" + f.hex + "'></button>";
        }).join("") + "</div>";
    } else {
      const med = lys.med || [], ude = lys.ude || [], fase = lys.fase, iRum = spillereIRummet();
      const faseTekst = { klar: "👥 Klar. Tryk ▶ for at starte runde 1.", runde: "⏱ Runde " + lys.runde + " er i gang (" + Object.keys(lys.optaget || {}).length + " af " + lys.antal + " felter taget)",
        slut_runde: "Runde " + lys.runde + " er slut. " + med.length + " er stadig med.", omgang: "Ingen nåede et felt. Tag runden om.",
        vinder: "🏆 " + (lys.vinder || "") + " har vundet!" }[fase] || "Tryk på 👥 Tilmeld for at starte.";
      html += "<h4 class='ea-dag'>🏃 Spillet</h4><p class='ea-info'><b>" + esc(faseTekst) + "</b></p><div class='ea-hj-knapper'>" +
        "<button data-lys='tilmeld'>👥 Tilmeld spillerne i rummet (" + iRum.length + ")</button>";
      if (fase && fase !== "vinder" && fase !== "runde" && med.length >= 2)
        html += "<button data-lys='runde' class='lys-valgt'>▶ " + (fase === "omgang" ? "Tag runden om" : "Start runde " + ((lys.runde || 0) + 1)) + " (" + naesteAntal() + (naesteAntal() === 1 ? " felt" : " felter") + ")</button>";
      if (fase && fase !== "klar") html += "<button data-lys='forfra'>🔄 Start forfra</button>";
      html += "<button data-lys='stilling'>📢 Sig hvem der er med</button>" + (fase === "vinder" ? "<button data-lys='vinder'>🏆 Sig vinderen</button>" : "") + "</div>";
      if (med.length || ude.length) {
        html += "<ul class='lys-spillere'>" + med.map(function (n) { return "<li class='med'>✅ " + esc(n) + "</li>"; }).join("") +
          ude.slice().reverse().map(function (n) { return "<li class='ude'>❌ " + esc(n) + "</li>"; }).join("") + "</ul>";
      }
      html += "<p class='ea-info'>Felterne lyser i én farve. Hvert felt kan kun have én spiller. Den, der ikke når et ledigt felt, er ude og bliver flyttet ned til tilskuerne. " +
        "Ét felt mindre hver runde, til der kun er én tilbage. Tempo = tid til at finde et felt (" + LYS_SPIL_SEK.join(", ") + " sek). Ansatte og ejeren er ikke med som spillere.</p>";
    }
    if (!maa) html = "<p class='ea-info'>Kun ejeren, Eventværter og Eventfolk kan styre lyset.</p>";
    boks.innerHTML = html;
    const igen = function () { if (boks.isConnected) tegnAppStyring(boks, api); };
    const sig = function (tekst) { if (api && api.sigIChat) api.sigIChat(tekst); };
    function tilmeld() {
      const sp = spillereIRummet();
      if (sp.length < 2) { lysFejl = "Der skal være mindst 2 spillere i rummet 💡 Lysreaktion (ansatte og ejeren tæller ikke med). Lige nu er der " + sp.length + "."; igen(); return; }
      saetLys({ tilstand: "spil", tempo: tempo, handling: "tilmeld", spillere: sp }).then(function () {
        if (!lysFejl) sig("💡 LYSREAKTION! " + sp.length + " spillere er med. Når felterne lyser, så stil dig på et ledigt felt i farven. Den, der ikke når et felt, er ude! 🏃");
        igen();
      });
    }
    boks.querySelectorAll("[data-lys-t]").forEach(function (k) {
      k.addEventListener("click", function () {
        const ny = k.dataset.lysT;
        if (ny === "spil") { if (t !== "spil") tilmeld(); return; }
        saetLys({ tilstand: ny, tempo: tempo, farve: ff >= 0 ? LYS_FARVER[ff].hex : "alle" }).then(igen);
        igen();
      });
    });
    boks.querySelectorAll("[data-lys-tempo]").forEach(function (k) {
      k.addEventListener("click", function () {
        saetLys({ tilstand: t, tempo: Number(k.dataset.lysTempo), farve: ff >= 0 ? LYS_FARVER[ff].hex : "alle", handling: t === "spil" ? "tempo" : undefined }).then(igen); igen();
      });
    });
    boks.querySelectorAll("[data-lys-farve]").forEach(function (k) {
      k.addEventListener("click", function () {
        saetLys({ tilstand: t === "sluk" ? "et" : t, tempo: tempo, farve: k.dataset.lysFarve }).then(igen); igen();
      });
    });
    boks.querySelectorAll("[data-lys]").forEach(function (k) {
      k.addEventListener("click", function () {
        const hvad = k.dataset.lys;
        if (hvad === "gaa") { if (api && api.gaaTil) api.gaaTil(LYS_RUM_ID); else gaaTilVaerelse(LYS_RUM_ID); return; }
        if (hvad === "tilmeld") { tilmeld(); return; }
        if (hvad === "runde") {
          const n = naesteAntal(), r = lys.fase === "omgang" ? lys.runde : (lys.runde || 0) + 1;
          saetLys({ tilstand: "spil", tempo: tempo, handling: "runde" }).then(function () {
            if (!lysFejl) sig("💡 Runde " + r + ": " + n + (n === 1 ? " felt" : " felter") + " lyser om lidt. Stil dig på et ledigt felt i farven!");
            igen();
          });
          return;
        }
        if (hvad === "forfra") { saetLys({ tilstand: "spil", tempo: tempo, handling: "forfra" }).then(igen); sig("🔄 Lysreaktion starter forfra! Alle er med igen."); return; }
        if (hvad === "stilling") sig((lys.med || []).length ? "✅ Stadig med (" + lys.med.length + "): " + lys.med.join(", ") : "Ingen er med endnu.");
        if (hvad === "vinder") sig(lys.vinder ? "🏆🎉 " + lys.vinder + " har vundet Lysreaktion! Tillykke!" : "Der er ingen vinder endnu.");
      });
    });
    tegnMini(boks.querySelector(".lys-mini"));
  }
  // lille levende billede af gulvet i appen (så værten kan se lyset, også uden for rummet)
  function tegnMini(c) {
    if (!c) return;
    const g = c.getContext("2d");
    function tegn() {
      if (!c.isConnected) return;
      const gb = gulvB(), felter = lysFelter();
      g.clearRect(0, 0, c.width, c.height);
      const s = Math.min((c.width - 8) / gb.b, (c.height - 8) / gb.d);
      const ox = (c.width - s * gb.b) / 2, oy = (c.height - s * gb.d) / 2;
      for (let x = 0; x < gb.b; x++) for (let y = 0; y < gb.d; y++) {
        const v = felter[(gb.x0 + x) + "," + (gb.y0 + y)];
        g.fillStyle = "#1a0c11";
        g.fillRect(ox + x * s + 1, oy + y * s + 1, s - 2, s - 2);
        if (v) {
          g.globalAlpha = Math.min(1, v[1]);
          g.fillStyle = farveHex(v[0]);
          g.shadowColor = farveHex(v[0]); g.shadowBlur = 8;
          g.fillRect(ox + x * s + 2, oy + y * s + 2, s - 4, s - 4);
          g.globalAlpha = 1; g.shadowBlur = 0;
        }
      }
      g.strokeStyle = "#d9a441"; g.lineWidth = 1.5; g.strokeRect(ox, oy, s * gb.b, s * gb.d);
      requestAnimationFrame(tegn);
    }
    tegn();
  }
  // appen opdaterer pointlisten, når der sker noget
  let sidstSet = "";
  setInterval(function () {
    if (!lysAppAaben()) return;
    const n = [lys.tilstand, lys.tempo, lys.farve, lys.runde, lys.fase, (lys.med || []).length, Object.keys(lys.optaget || {}).length, spillereIRummet().length, lysFejl].join("|");
    if (n !== sidstSet) { sidstSet = n; tegnAppStyring(lysAppBoks, window.eventApp); }
  }, 700);

  function iAppen() {
    if (!window.eventApp || !window.eventApp.tilfoejLeg) return;
    window.eventApp.tilfoejLeg({
      id: "lysreaktion", navn: "Lysreaktion", ikon: "💡", tid: "10–20 min", folk: "3+ (helst 8+)", rum: LYS_RUM_ID,
      kort: "Felter på gulvet lyser i én farve. Stil dig på et ledigt felt! Den, der ikke når et, er ude. Ét felt mindre hver runde.",
      regler: ["Alle mødes i rummet 💡 Lysreaktion på 1. sal. Værten tilmelder spillerne her i appen.",
        "Runde 1: op til 7 felter lyser i én farve (lyspanelerne på væggen viser farven).",
        "Stil dig på et ledigt felt. Hvert felt kan kun have én spiller, og rummet finder selv ud af, hvem der kom først.",
        "Den, der ikke når et felt, er ude og bliver flyttet ned til tilskuerne.",
        "Hver runde er der ét felt mindre. I sidste runde er der 2 spillere og 1 felt. Den sidste tilbage vinder!"],
      tegn: function (boks, api) { tegnAppStyring(boks, api); },
    });
  }

  // =============================================================
  //  Stil (vinrød og guld)
  // =============================================================
  const stil = document.createElement("style");
  stil.textContent =
    "#lys-skilt { position: fixed; left: 50%; top: 70px; transform: translateX(-50%); z-index: 57; pointer-events: none; text-align: center;" +
    " background: linear-gradient(#4a1320, #2e0a13); color: #f6e7c1; border: 2px solid #d9b45a; border-radius: 12px; padding: 8px 18px;" +
    " box-shadow: 0 8px 30px rgba(0,0,0,.45); font-family: Georgia, serif; max-width: 92vw; }" +
    "#lys-skilt[hidden] { display: none !important; }" +
    "#lys-skilt .ls-top { font: bold 13px Georgia, serif; letter-spacing: 2px; color: #e8cf8f; }" +
    "#lys-skilt .ls-top small { letter-spacing: 0; font-weight: normal; margin-left: 6px; color: #f6e7c1; }" +
    "#lys-skilt .ls-stor { font: bold 20px Georgia, serif; margin-top: 4px; }" +
    "#lys-skilt .ls-stor small { font-size: 14px; color: #e8cf8f; }" +
    "#lys-skilt .ls-prik { display: inline-block; width: 16px; height: 16px; border-radius: 50%; vertical-align: -2px; box-shadow: 0 0 10px currentColor; border: 1px solid #fff8; }" +
    "#lys-skilt .ls-point { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 6px; font-size: 13px; }" +
    "#lys-skilt .ls-point b { color: #ffd27a; }" +
    ".lys-mini { display: block; margin: 8px auto 0; background: #0f0609; border-radius: 8px; width: 100%; max-width: 240px; }" +
    ".lys-valg button, .lys-tempo button { flex: 1 1 auto; }" +
    ".ea-hj-knapper.lys-tempo { display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; } .lys-tempo button { min-width: 0; flex: 1 1 0; padding-left: 0; padding-right: 0; } .lys-tempo span { font-size: 18px; }" +
    "button.lys-valgt { outline: 2px solid #ffd27a; outline-offset: 1px; background: linear-gradient(#b8862e, #8a5e1c) !important; color: #fff !important; }" +
    ".lys-farver { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }" +
    ".lys-farver .lys-farve { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #f6e7c1; cursor: pointer; box-shadow: 0 0 8px rgba(255,255,255,.25); }" +
    ".lys-farver .lys-farve.lys-valgt { outline: 3px solid #ffd27a; box-shadow: 0 0 14px #ffd27a; }" +
    ".lys-farver .lys-alle { padding: 6px 10px; border-radius: 16px; cursor: pointer; }" +
    ".lys-spillere { list-style: none; margin: 6px 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }" +
    ".lys-spillere li { padding: 3px 9px; border-radius: 12px; background: rgba(217,164,65,.18); font-size: 13px; }" +
    ".lys-spillere li.ude { opacity: .55; text-decoration: line-through; background: rgba(0,0,0,.2); }" +
    "#lys-skilt .ls-vinder { font-size: 24px; color: #ffd27a; text-shadow: 0 0 12px rgba(255,210,122,.6); }" +
    ".lys-pointliste { margin: 4px 0 8px; padding-left: 22px; } .lys-pointliste li span { display: inline-block; min-width: 60%; } .lys-pointliste b { color: #d9a441; }";
  document.head.appendChild(stil);

  // =============================================================
  //  Start: vent til spillet og staff-møblerne er klar
  // =============================================================
  vent(function () {
    return typeof INDBYGGEDE_RUM !== "undefined" && typeof NAV_RUM !== "undefined" && typeof MOEBEL_TYPER !== "undefined" &&
      typeof tegnGulv === "function" && typeof vaerelseMoebler === "function" && !!MOEBEL_TYPER["ev-vip-sofa"];
  }, function () {
    if (typeof INDBYGGEDE_RUM === "undefined") return;
    lavMoebler();
    lavRummet();
    if (iLysRummet()) hentLys();
  });
  if (window.eventApp) iAppen(); else window.addEventListener("eventapp-klar", iAppen);
})();
