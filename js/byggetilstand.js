// =============================================================
//  🔨 Byggetilstand
//  En særlig skærm, hvor man bygger i rummet i stedet for at gå rundt:
//  - værktøjer øverst: vælg, flyt skærmen, pipette, malerrulle, gitter, lag,
//    fortryd/gentag, gem og "Afslut byggeri"
//  - etage til venstre: skift mellem dine egne rum
//  - klik på et møbel: grøn kant på gulvet + en lille menu (flyt, drej, kopiér, læg væk)
//  - panelet forneden: kun de møbler, du HAR (Mine ting). I de fælles rum får
//    Bygmestre hele kataloget gratis (som før), og ejeren kan slå "Alle møbler" til.
//  Åbnes med knappen "🔨 Byggetilstand" øverst eller :byg i chatten.
//  (hentes frisk fra js/panel-forklaring.js)
// =============================================================
(function () {
  if (window.BYG_HENTET) return;
  window.BYG_HENTET = true;

  // ----- små hjælpere -----
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }
  function iFaelles() {
    if (rumValg === "hal") return true;
    return typeof iFaellesRum === "function" && iFaellesRum();
  }
  function iFremmedLejHer() { return typeof iFremmedLej === "function" && iFremmedLej(); }
  // Må jeg bygge i rummet, jeg står i?
  function bygRet() {
    if (rumValg === "hal") return typeof kanBygge === "function" && kanBygge();
    if (rumValg !== "vaerelse") return false;
    if (iFremmedLejHer()) return false;                    // andres lejligheder
    if (iFaelles()) return typeof kanBygge === "function" && kanBygge();
    return typeof maaRetteRum === "function" ? maaRetteRum() : aktivtVaerelse === "mit";
  }
  // Gratis katalog: Bygmestre i de fælles rum, og hotellets ejer altid (alle møbler er gratis for ejeren)
  function gratis() { return iFaelles() || erEjer(); }
  function navnPaa(id) { const t = MOEBEL_TYPER[id]; return t ? t.navn : "Møblet"; }
  function harLager() { return typeof lager !== "undefined" && Array.isArray(lager); }
  function antalILager(id) {
    if (!harLager()) return 0;
    let n = 0;
    lager.forEach(function (t) { if (t.type === id) n++; });
    return n;
  }
  function kanStille(id) { return gratis() || antalILager(id) > 0; }
  function toast(tekst) {
    // lidt efter, så opdaterPanel (js/spil.js) ikke skriver hen over beskeden
    setTimeout(function () { if (typeof besked !== "undefined" && besked) besked.textContent = tekst; }, 0);
  }

  // ----- tæpper: møbler kan stå oven på et tæppe -----
  // moebelPaa giver det møbel, der står på feltet (og først tæppet, hvis der kun er et tæppe),
  // og pladsTil lader møbler stå på tæpper og tæpper ligge under møbler.
  function erTaeppe(m) { const t = MOEBEL_TYPER[m.type]; return !!(t && t.kanGaaPaa); }
  moebelPaa = function (x, y) {
    let taeppe = null;
    for (let i = moeblerIRummet.length - 1; i >= 0; i--) {
      const m = moeblerIRummet[i];
      if (!MOEBEL_TYPER[m.type] || !daekker(m, x, y)) continue;
      if (!erTaeppe(m)) return m;
      if (!taeppe) taeppe = m;
    }
    return taeppe || undefined;
  };
  pladsTil = function (type, x, y, spejlet, uden) {
    const f = moebelFelter(type, spejlet);
    const fig = figurFelt();
    const nyErTaeppe = !!type.kanGaaPaa;
    for (let dx = 0; dx < f[0]; dx++) {
      for (let dy = 0; dy < f[1]; dy++) {
        if (!erIRummet(x + dx, y + dy)) return false;
        for (let i = 0; i < moeblerIRummet.length; i++) {
          const m = moeblerIRummet[i];
          if (m === uden || !MOEBEL_TYPER[m.type] || !daekker(m, x + dx, y + dy)) continue;
          if (erTaeppe(m) === nyErTaeppe) return false;
        }
        const sidderHer = figur.sidde && uden && figur.sidde.moebel === uden;
        if (!nyErTaeppe && !sidderHer && fig.x === x + dx && fig.y === y + dy) return false;
      }
    }
    return true;
  };

  // ----- møblernes grupper i panelet (gættes ud fra navnet) -----
  const UNDER = {
    sofa: { navn: "Sofaer", ikon: "🛋️" }, stol: { navn: "Stole", ikon: "🪑" }, bord: { navn: "Borde", ikon: "🍽️" },
    seng: { navn: "Senge", ikon: "🛏️" }, opbevaring: { navn: "Opbevaring", ikon: "🗄️" }, andet: { navn: "Andet", ikon: "📦" },
    plante: { navn: "Planter", ikon: "🪴" }, taeppe: { navn: "Tæpper", ikon: "🧶" }, billede: { navn: "Billeder og skilte", ikon: "🖼️" },
    pynt: { navn: "Pynt", ikon: "🎈" }, lampe: { navn: "Lamper", ikon: "💡" }, fav: { navn: "Favoritter", ikon: "⭐" },
  };
  const HOVED = [
    { id: "moebler", navn: "Møbler", ikon: "🛋️", under: ["sofa", "stol", "bord", "seng", "opbevaring", "andet", "fav"] },
    { id: "deko", navn: "Dekorationer", ikon: "🪴", under: ["plante", "taeppe", "billede", "pynt", "fav"] },
    { id: "lys", navn: "Belysning", ikon: "💡", under: ["lampe", "fav"] },
    { id: "vaegge", navn: "Vægge", ikon: "🧱" },
    { id: "gulve", navn: "Gulve", ikon: "🪵" },
    { id: "byggeri", navn: "Byggeri", ikon: "🏗️" },
    { id: "alle", navn: "Alle", ikon: "🔲", under: ["sofa", "stol", "bord", "seng", "opbevaring", "plante", "taeppe", "billede", "pynt", "lampe", "andet", "fav"] },
  ];
  function har(tekst, ord) { return ord.some(function (o) { return tekst.indexOf(o) >= 0; }); }
  function gruppe(t) {
    const s = (t.navn + " " + t.id).toLowerCase();
    if (har(s, ["lampe", "lysekrone", "lanterne", "kandelaber", "spotlight", "laser", "diskokugle", "lystraverse", "lyskæde", "neon"])) return "lampe";
    if (t.kanGaaPaa || har(s, ["tæppe", "taeppe", "løber", "loeber"])) return "taeppe";
    if (har(s, ["plante", "palme", "træ ", "trae", "oliventræ", "gummitræ", "kaktus", "blomst", "hortensia", "juletræ"])) return "plante";
    if (har(s, ["billede", "plakat", "maleri", "staffeli", "fotovæg", "fotovaeg", "skilt", "banner", "tavle", "tidslinje"])) return "billede";
    if (har(s, ["seng"])) return "seng";
    if (har(s, ["sofa", "bænk", "baenk"])) return "sofa";
    if (t.saede || har(s, ["stol", "trone", "puf"])) return "stol";
    if (har(s, ["bord", "disk", "skranke", "pult"])) return "bord";
    if (har(s, ["reol", "skab", "hylde", "vitrine", "kommode", "montre", "kasse"])) return "opbevaring";
    if (har(s, ["ballon", "pokal", "globus", "gave", "vase", "statue", "buste", "kuffert", "springvand", "kage", "champagne",
      "græskar", "snemand", "piñata", "pinata", "konfetti", "sokkel", "flag", "kurv", "bue", "medalje", "trofæ"])) return "pynt";
    return "andet";
  }
  function hovedFor(under) {
    if (under === "lampe") return "lys";
    if (["plante", "taeppe", "billede", "pynt"].indexOf(under) >= 0) return "deko";
    return "moebler";
  }
  // samme møbel i flere farver: "Scene", "Scene (grøn)", "Scene (blå)" ...
  function grundNavn(t) { return t.navn.replace(/\s*\([^)]*\)\s*$/, "").trim(); }
  function varianter(t) {
    const g = grundNavn(t);
    return Object.values(MOEBEL_TYPER).filter(function (a) { return grundNavn(a) === g && (a.kategori || "") === (t.kategori || ""); });
  }

  // ----- favoritter -----
  const FAV_NOEGLE = "mit-hotel-byg-favoritter";
  let favoritter = [];
  try { favoritter = JSON.parse(localStorage.getItem(FAV_NOEGLE) || "[]") || []; } catch (e) { favoritter = []; }
  function erFav(id) { return favoritter.indexOf(id) >= 0; }
  function skiftFav(id) {
    if (erFav(id)) favoritter = favoritter.filter(function (f) { return f !== id; });
    else favoritter.push(id);
    try { localStorage.setItem(FAV_NOEGLE, JSON.stringify(favoritter)); } catch (e) {}
  }


  // =============================================================
  //  Udseende (vinrød, guld og creme som resten af hotellet)
  // =============================================================
  const stil = document.createElement("style");
  stil.id = "byg-stil";
  stil.textContent = [
    ":root { --byg-moerk: #4a1420; --byg-vin: #7a2232; --byg-guld: #c99a45; --byg-lysguld: #f3d999; --byg-creme: #fbf3e2; --byg-kant: #2a0d0a; --byg-blaek: #3a2214; --byg-valgt: #e8b4bf; }",
    "#byg-aabn { position: fixed; top: 9px; left: 672px; z-index: 40; padding: 6px 14px; border-radius: 9px; cursor: pointer; font: bold 14px Georgia, 'Times New Roman', serif;" +
      " color: #3a2408; border: 1px solid #5e3f12; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.16)), url(billeder/ui/messing.jpg) center/256px, #d6ae5f;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 4px rgba(0,0,0,.45); text-shadow: 0 1px 0 rgba(255,240,200,.7); }",
    "#byg-aabn:hover { filter: brightness(1.08); }",
    // det man ikke skal bruge, mens man bygger
    "body.bygger header, body.bygger #chat, body.bygger #chatlog, body.bygger #panel, body.bygger #online-tal, body.bygger #hjaelp-knap," +
      " body.bygger #avatar-billede, body.bygger #paamind-fane, body.bygger #vagt-knap, body.bygger #ev-hoejre, body.bygger #moebel-info," +
      " body.bygger #byg-aabn, body.bygger #glimt, body.bygger #lager-vindue { display: none !important; }",
    "body.bygger #besked { top: 78px !important; bottom: auto !important; z-index: 46; }",
    ".byg-del { position: fixed; z-index: 45; font-family: Georgia, 'Times New Roman', serif; color: var(--byg-blaek); }",
    ".byg-del[hidden] { display: none !important; }",
    ".byg-plade { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.28)), url(billeder/ui/trae.jpg) center/512px 256px, var(--byg-moerk);" +
      " border-radius: 14px; box-shadow: 0 0 0 2px var(--byg-kant), 0 0 0 4px var(--byg-guld), 0 0 0 5px var(--byg-kant), 0 8px 20px rgba(0,0,0,.5); }",
    ".byg-papir { background: url(billeder/ui/papir.jpg) repeat, var(--byg-creme); }",
    ".byg-knap { border: 1px solid #5e3f12; border-radius: 9px; cursor: pointer; font: bold 15px Georgia, serif; color: #3a2408; min-width: 42px; height: 42px; padding: 0 10px;" +
      " background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 50%, rgba(0,0,0,.14)), var(--byg-creme); box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 2px 3px rgba(0,0,0,.4); }",
    ".byg-knap:hover { filter: brightness(1.06); }",
    ".byg-knap:disabled { opacity: .45; cursor: default; filter: none; }",
    ".byg-knap.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.16)), url(billeder/ui/messing.jpg) center/256px, #d6ae5f;" +
      " box-shadow: inset 0 2px 4px rgba(0,0,0,.35), 0 0 0 2px var(--byg-lysguld); }",
    ".byg-knap .ik { font-size: 20px; line-height: 1; }",
    // toppen
    "#byg-top { top: 10px; left: 12px; right: 12px; height: 56px; display: flex; align-items: center; gap: 12px; padding: 0 10px; }",
    "#byg-top .byg-titel { color: var(--byg-lysguld); font-size: 20px; font-weight: bold; white-space: nowrap; text-shadow: 0 1px 0 #6b4a17, 0 2px 4px rgba(0,0,0,.6); padding: 0 6px; }",
    "#byg-top .byg-gruppe { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: rgba(0,0,0,.25); box-shadow: inset 0 1px 3px rgba(0,0,0,.5); }",
    "#byg-top .byg-luft { flex: 1; }",
    "#byg-afslut { background: linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0) 50%, rgba(0,0,0,.2)), var(--byg-vin) !important; color: var(--byg-lysguld) !important; text-shadow: 0 1px 2px #000; }",
    "#byg-gem.gemt { background: #d9ecd2; }",
    // lag-menuen
    "#byg-lag-menu { top: 76px; padding: 10px 14px; border-radius: 10px; border: 2px solid var(--byg-guld); box-shadow: 0 6px 16px rgba(0,0,0,.45); font-size: 14px; }",
    "#byg-lag-menu label { display: block; margin: 4px 0; cursor: pointer; }",
    // etage
    "#byg-etage { top: 92px; left: 14px; width: 96px; padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; }",
    "#byg-etage b { color: var(--byg-lysguld); font-size: 15px; text-shadow: 0 1px 2px #000; }",
    "#byg-etage .byg-knap { width: 52px; min-width: 0; height: 34px; padding: 0; }",
    "#byg-etage-tal { width: 52px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; box-shadow: inset 0 2px 4px rgba(0,0,0,.3); }",
    "#byg-etage-navn { color: #f6e3c0; font-size: 12px; text-align: center; line-height: 1.2; max-width: 90px; overflow-wrap: anywhere; }",
    // menuen ved det valgte møbel
    "#byg-menu { display: flex; gap: 6px; padding: 6px; border-radius: 12px; border: 2px solid var(--byg-guld); box-shadow: 0 6px 14px rgba(0,0,0,.45); transform: translateX(-50%); }",
    "#byg-menu .byg-knap { width: 46px; height: 46px; min-width: 0; padding: 0; }",
    "#byg-menu #byg-m-slet .ik { color: #b0302a; }",
    // panelet forneden
    "#byg-panel { left: 12px; right: 12px; bottom: 12px; height: 292px; display: grid; grid-template-columns: 210px 1fr 230px; grid-template-rows: minmax(0, 1fr); gap: 10px; padding: 10px; }",
    "#byg-kat { display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 10px; overflow-y: auto; }",
    "#byg-kat button { display: flex; align-items: center; gap: 10px; border: 0; border-radius: 8px; padding: 2px 10px; min-height: 31px; background: transparent; cursor: pointer; font: bold 15px Georgia, serif; color: var(--byg-blaek); text-align: left; flex: none; }",
    "#byg-kat button span { font-size: 20px; width: 26px; text-align: center; }",
    "#byg-kat button:hover { background: rgba(122,34,50,.1); }",
    "#byg-kat button.valgt { background: var(--byg-valgt); box-shadow: inset 0 0 0 2px var(--byg-vin); }",
    "#byg-midt { display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0; }",
    "#byg-linje { display: flex; gap: 6px; align-items: center; }",
    "#byg-under { display: flex; gap: 4px; flex: 1; overflow-x: auto; padding: 4px; border-radius: 10px; }",
    "#byg-under button { min-width: 50px; height: 40px; border: 0; border-radius: 8px; background: transparent; cursor: pointer; font-size: 20px; }",
    "#byg-under button:hover { background: rgba(122,34,50,.1); }",
    "#byg-under button.valgt { background: var(--byg-valgt); box-shadow: inset 0 0 0 2px var(--byg-vin); }",
    "#byg-soeg { width: 210px; height: 40px; border-radius: 10px; border: 1px solid #5e3f12; padding: 0 12px; font: 15px Georgia, serif; color: var(--byg-blaek); box-shadow: inset 0 2px 4px rgba(60,30,10,.3); }",
    "#byg-alle-k { color: var(--byg-lysguld); font-size: 13px; white-space: nowrap; cursor: pointer; text-shadow: 0 1px 2px #000; }",
    "#byg-gitter { flex: 1; min-height: 0; overflow-y: auto; border-radius: 10px; padding: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; align-content: start; }",
    "#byg-gitter .byg-ting { position: relative; height: 96px; border-radius: 10px; border: 2px solid rgba(94,63,18,.25); background: rgba(255,255,255,.55); cursor: pointer; padding: 0; }",
    "#byg-gitter .byg-ting:hover { border-color: var(--byg-guld); }",
    "#byg-gitter .byg-ting.valgt { border-color: var(--byg-vin); box-shadow: 0 0 0 2px var(--byg-valgt); background: #fff; }",
    "#byg-gitter .byg-ting canvas { width: 84px; height: 84px; }",
    "#byg-gitter .byg-tal { position: absolute; right: 5px; bottom: 4px; font: bold 12px Georgia, serif; background: var(--byg-vin); color: var(--byg-lysguld); border-radius: 8px; padding: 1px 6px; }",
    "#byg-gitter .byg-stjerne { position: absolute; left: 5px; top: 3px; font-size: 13px; }",
    "#byg-gitter .byg-farve { height: 70px; border-radius: 10px; border: 2px solid rgba(94,63,18,.35); cursor: pointer; box-shadow: inset 0 -14px 20px rgba(0,0,0,.12); }",
    "#byg-gitter .byg-farve.valgt { border-color: var(--byg-vin); box-shadow: 0 0 0 3px var(--byg-valgt); }",
    "#byg-gitter h4 { grid-column: 1 / -1; margin: 4px 0 0; font-size: 15px; }",
    "#byg-gitter .byg-tom { grid-column: 1 / -1; text-align: center; margin: 30px 10px; font-size: 15px; line-height: 1.5; }",
    "#byg-gitter .byg-kort { grid-column: span 2; min-height: 84px; border-radius: 10px; border: 2px solid rgba(94,63,18,.3); background: rgba(255,255,255,.6); cursor: pointer; font: bold 15px Georgia, serif; color: var(--byg-blaek); padding: 8px 12px; text-align: left; }",
    "#byg-gitter .byg-kort small { display: block; font-weight: normal; font-size: 12px; margin-top: 4px; }",
    "#byg-gitter .byg-kort.fare { color: #8a1f1a; }",
    "#byg-vis { border-radius: 10px; padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 5px; overflow-y: auto; min-height: 0; }",
    "#byg-vis canvas { width: 170px; height: 110px; flex: none; }",
    "#byg-vis b { font-size: 15px; text-align: center; }",
    "#byg-vis small { font-size: 12px; text-align: center; }",
    "#byg-vis .byg-var { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; }",
    "#byg-vis .byg-var button { width: 40px; height: 40px; border-radius: 8px; border: 2px solid rgba(94,63,18,.3); background: #fff; cursor: pointer; padding: 0; position: relative; }",
    "#byg-vis .byg-var button canvas { width: 36px; height: 36px; }",
    "#byg-vis .byg-var button.valgt { border-color: var(--byg-vin); box-shadow: 0 0 0 2px var(--byg-valgt); }",
    "#byg-vis .byg-var button.mangler { opacity: .45; }",
    "#byg-vis .byg-knap { height: 36px; font-size: 14px; }",
    "#byg-vis .byg-vis-knapper { display: flex; gap: 6px; }",
    "@media (max-width: 1100px) { #byg-panel { grid-template-columns: 150px 1fr 170px; } #byg-kat button { font-size: 13px; } #byg-soeg { width: 140px; } #byg-top .byg-titel { display: none; } }",
  ].join("\n");
  document.head.appendChild(stil);


  // =============================================================
  //  Selve skærmen
  // =============================================================
  function lav(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  const aabnKnap = lav("<button type='button' id='byg-aabn' title='Byg i rummet (eller skriv :byg)' hidden>🔨 Byggetilstand</button>");
  document.body.appendChild(aabnKnap);

  const top = lav(
    "<div id='byg-top' class='byg-del byg-plade' hidden>" +
    "  <span class='byg-titel'>🔨 Byggetilstand</span>" +
    "  <span class='byg-luft'></span>" +
    "  <div class='byg-gruppe' id='byg-vaerktoej'>" +
    "    <button type='button' class='byg-knap valgt' data-v='vaelg' title='Vælg og flyt møbler'><span class='ik'>👆</span></button>" +
    "    <button type='button' class='byg-knap' data-v='haand' title='Flyt skærmen (træk)'><span class='ik'>✋</span></button>" +
    "    <button type='button' class='byg-knap' data-v='pipette' title='Pipette: klik på et møbel for at vælge samme slags'><span class='ik'>💧</span></button>" +
    "    <button type='button' class='byg-knap' data-v='rulle' title='Malerrulle: mal vægge og gulv'><span class='ik'>🖌️</span></button>" +
    "    <button type='button' class='byg-knap' id='byg-gitter-knap' title='Vis gitter på gulvet'><span class='ik'>▦</span></button>" +
    "    <button type='button' class='byg-knap' id='byg-lag-knap' title='Lag: vis og skjul ting'><span class='ik'>🗂️</span></button>" +
    "  </div>" +
    "  <span class='byg-luft'></span>" +
    "  <div class='byg-gruppe'>" +
    "    <button type='button' class='byg-knap' id='byg-fortryd' title='Fortryd (Ctrl+Z)'><span class='ik'>↶</span></button>" +
    "    <button type='button' class='byg-knap' id='byg-gentag' title='Gentag (Ctrl+Y)'><span class='ik'>↷</span></button>" +
    "  </div>" +
    "  <button type='button' class='byg-knap' id='byg-gem' title='Gem rummet'><span class='ik'>💾</span></button>" +
    "  <button type='button' class='byg-knap' id='byg-afslut' title='Tilbage til hotellet'>▶ Afslut byggeri</button>" +
    "</div>");
  document.body.appendChild(top);

  const lagMenu = lav(
    "<div id='byg-lag-menu' class='byg-del byg-papir' hidden>" +
    "  <label><input type='checkbox' id='byg-lag-figurer' checked> 🧍 Vis figurer</label>" +
    "  <label><input type='checkbox' id='byg-lag-gitter'> ▦ Vis gitter</label>" +
    "  <label><input type='checkbox' id='byg-lag-gennem'> 👻 Gennemsigtige møbler</label>" +
    "</div>");
  document.body.appendChild(lagMenu);

  const etage = lav(
    "<div id='byg-etage' class='byg-del byg-plade' hidden>" +
    "  <b>Etage</b>" +
    "  <button type='button' class='byg-knap' id='byg-op' title='Næste rum'>▲</button>" +
    "  <div id='byg-etage-tal' class='byg-papir'>1</div>" +
    "  <button type='button' class='byg-knap' id='byg-ned' title='Forrige rum'>▼</button>" +
    "  <div id='byg-etage-navn'></div>" +
    "  <button type='button' class='byg-knap' id='byg-midte' title='Se hele rummet'>🧊</button>" +
    "</div>");
  document.body.appendChild(etage);

  const menu = lav(
    "<div id='byg-menu' class='byg-del byg-papir' hidden>" +
    "  <button type='button' class='byg-knap' id='byg-m-flyt' title='Flyt'><span class='ik'>✥</span></button>" +
    "  <button type='button' class='byg-knap' id='byg-m-drej' title='Drej (R)'><span class='ik'>🔄</span></button>" +
    "  <button type='button' class='byg-knap' id='byg-m-kopi' title='Kopiér'><span class='ik'>⧉</span></button>" +
    "  <button type='button' class='byg-knap' id='byg-m-slet' title='Læg i Mine ting'><span class='ik'>🗑</span></button>" +
    "</div>");
  document.body.appendChild(menu);

  const panel = lav(
    "<div id='byg-panel' class='byg-del byg-plade' hidden>" +
    "  <div id='byg-kat' class='byg-papir'></div>" +
    "  <div id='byg-midt'>" +
    "    <div id='byg-linje'><div id='byg-under' class='byg-papir'></div>" +
    "      <input id='byg-soeg' type='search' placeholder='Søg efter møbler …'></div>" +
    "    <div id='byg-gitter' class='byg-papir'></div>" +
    "  </div>" +
    "  <div id='byg-vis' class='byg-papir'></div>" +
    "</div>");
  document.body.appendChild(panel);


  // =============================================================
  //  Tilstand
  // =============================================================
  let aktiv = false;
  let vaerktoej = "vaelg";
  let bygType = null;        // møblet man er ved at stille
  let bygRetning = 0;        // ... og dets retning (R drejer)
  let flytter = null;        // møblet man er ved at flytte
  let traekMoebel = null;    // man trækker i et møbel med musen
  let spisKlik = false;      // klikket efter et træk skal ikke gøre noget
  let visGitter = false, visFigurer = true, gennemsigtig = false;
  let hovedKat = "moebler", underKat = null;
  let visType = null;        // møblet der vises til højre i panelet
  let sidsteMaling = {};     // sidste farve valgt til gulv og væg (malerrullen)
  let fortryd = [], gentag = [];
  let kameraFoer = null;


  // ----- fortryd og gentag -----
  function billede() {
    return JSON.stringify({
      m: moeblerIRummet.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: !!m.spejlet, retning: m.retning || 0 }; }),
      l: harLager() && !iFaelles() ? lager : null,
    });
  }
  function medFortryd(fn) {
    if (!aktiv) return fn();
    const foer = billede();
    const svar = fn();
    if (billede() !== foer) {
      fortryd.push(foer);
      if (fortryd.length > 50) fortryd.shift();
      gentag = [];
      opdaterTop();
    }
    return svar;
  }
  function brugBillede(s) {
    const d = JSON.parse(s);
    if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
    // de møbler, der står samme sted, bliver de samme
    const gamle = moeblerIRummet.slice();
    const nye = d.m.filter(function (m) { return MOEBEL_TYPER[m.type]; }).map(function (n) {
      const i = gamle.findIndex(function (m) { return m.type === n.type && m.x === n.x && m.y === n.y; });
      if (i >= 0) { const m = gamle.splice(i, 1)[0]; m.spejlet = n.spejlet; m.retning = n.retning; return m; }
      return n;
    });
    moeblerIRummet.length = 0;
    nye.forEach(function (m) { moeblerIRummet.push(m); });
    if (d.l && harLager()) {
      lager.length = 0;
      d.l.forEach(function (t) { lager.push(t); });
      if (typeof gemLager === "function") gemLager();
    }
    valgtMoebel = null;
    flytter = null;
    gem();
    opdaterPanel();
    visPanel();
  }
  function fortrydEt() {
    if (!fortryd.length) return;
    gentag.push(billede());
    brugBillede(fortryd.pop());
    opdaterTop();
    toast("↶ Fortrudt");
  }
  function gentagEt() {
    if (!gentag.length) return;
    fortryd.push(billede());
    brugBillede(gentag.pop());
    opdaterTop();
    toast("↷ Gentaget");
  }

  // Drej og "læg væk" kan også ske med tastaturet (R, Shift, Delete) og fra andre filer:
  // så kommer de også med i fortryd
  const drejValgtFoerByg = drejValgt;
  drejValgt = function () {
    const args = arguments, self = this;
    return medFortryd(function () { return drejValgtFoerByg.apply(self, args); });
  };
  const samlOpValgtFoerByg = samlOpValgt;
  samlOpValgt = function () {
    const args = arguments, self = this;
    return medFortryd(function () {
      // ejerens møbler er gratis, så de forsvinder bare (de kommer ikke i Mine ting)
      if (aktiv && erEjer() && !iFaelles() && valgtMoebel) {
        if (figur.sidde && figur.sidde.moebel === valgtMoebel) { figur.sidde = null; figur.skalSidde = null; }
        const i = moeblerIRummet.indexOf(valgtMoebel);
        if (i >= 0) moeblerIRummet.splice(i, 1);
        valgtMoebel = null;
        gem();
        opdaterPanel();
        return;
      }
      return samlOpValgtFoerByg.apply(self, args);
    });
  };


  // =============================================================
  //  Tegning i rummet: gitter, grøn kant, spøgelse
  // =============================================================
  function feltKant(c, x, y, farve, kant, bred) {
    const p = diamant(x, y);
    c.beginPath();
    c.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) c.lineTo(p[i].x, p[i].y);
    c.closePath();
    if (farve) { c.fillStyle = farve; c.fill(); }
    if (kant) { c.strokeStyle = kant; c.lineWidth = bred || 1; c.stroke(); }
  }
  function moebelKant(c, type, x, y, tvaers, fyld, kant) {
    const f = moebelFelter(type, tvaers);
    for (let dx = 0; dx < f[0]; dx++) for (let dy = 0; dy < f[1]; dy++) feltKant(c, x + dx, y + dy, fyld, null);
    // en tyk kant rundt om hele møblet
    const a = punkt(x, y), b = punkt(x + f[0], y), d = punkt(x + f[0], y + f[1]), e = punkt(x, y + f[1]);
    c.save();
    c.beginPath();
    c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(d.x, d.y); c.lineTo(e.x, e.y); c.closePath();
    c.shadowColor = kant; c.shadowBlur = 10;
    c.strokeStyle = kant; c.lineWidth = 3;
    c.stroke();
    c.restore();
  }
  function tvaersFor(type, r) { return type.klipper ? r % 2 === 1 : false; }
  function spoegelse(ting) {
    let type = null, r = 0, uden = null;
    if (bygType && MOEBEL_TYPER[bygType]) { type = MOEBEL_TYPER[bygType]; r = bygRetning; }
    else if (flytter) { type = MOEBEL_TYPER[flytter.type]; r = flytter.retning || 0; uden = flytter; }
    if (!type || !musFelt) return;
    const f = musFelt;
    const tv = flytter && !type.klipper ? !!flytter.spejlet : tvaersFor(type, r);
    const ok = pladsTil(type, f.x, f.y, tv, uden);
    const ff = moebelFelter(type, tv);
    ting.push({ dybde: -0.5, tegn: function () { moebelKant(ctx, type, f.x, f.y, tv, ok ? "rgba(120,230,90,.28)" : "rgba(255,60,60,.32)", ok ? "#7be04f" : "#ff4a3a"); } });
    if (!ok) return;
    ting.push({
      dybde: f.x + ff[0] - 1 + f.y + ff[1] - 1 + 0.05,
      tegn: function () {
        const c = moebelSted(type, f.x, f.y, tv);
        ctx.globalAlpha = 0.6;
        tegnMoebelFoerByg(ctx, type, c.x, c.y, flytter ? !!flytter.spejlet : false, r);
        ctx.globalAlpha = 1;
      },
    });
  }
  const andreFoerByg = typeof andreSpillereTing === "function" ? andreSpillereTing : null;
  andreSpillereTing = function (ting) {
    if (andreFoerByg) andreFoerByg.apply(this, arguments);
    if (!aktiv) return;
    if (visGitter) {
      ting.push({ dybde: -2, tegn: function () {
        for (let x = 0; x < RUM.bredde; x++) for (let y = 0; y < RUM.dybde; y++) if (erIRummet(x, y)) feltKant(ctx, x, y, null, "rgba(255,255,255,.55)", 1);
      } });
    }
    if (valgtMoebel && moeblerIRummet.indexOf(valgtMoebel) >= 0 && !flytter) {
      const m = valgtMoebel, t = MOEBEL_TYPER[m.type];
      if (t) ting.push({ dybde: -1, tegn: function () { moebelKant(ctx, t, m.x, m.y, drejetTvaers(m), "rgba(120,230,90,.22)", "#7be04f"); } });
    }
    spoegelse(ting);
  };

  // Lag: skjul figurerne / gennemsigtige møbler
  const tegnMoebelFoerByg = tegnMoebel;
  tegnMoebel = function (c) {
    if (aktiv && gennemsigtig && c && c.canvas === laerred && c.globalAlpha === 1) {
      c.globalAlpha = 0.45;
      const svar = tegnMoebelFoerByg.apply(this, arguments);
      c.globalAlpha = 1;
      return svar;
    }
    return tegnMoebelFoerByg.apply(this, arguments);
  };
  function skjulFigurerHer(c) { return aktiv && !visFigurer && c && c.canvas === laerred; }
  let menneskeVi = null;
  function pakMenneske() {
    if (typeof tegnMenneske !== "function" || tegnMenneske === menneskeVi) return;
    const foer = tegnMenneske;
    menneskeVi = function (c) { if (skjulFigurerHer(c)) return; return foer.apply(this, arguments); };
    tegnMenneske = menneskeVi;
  }
  let skiltVi = null;
  function pakSkilt() {
    if (typeof tegnNavneskilt !== "function" || tegnNavneskilt === skiltVi) return;
    const foer = tegnNavneskilt;
    skiltVi = function (c) { if (skjulFigurerHer(c)) return; return foer.apply(this, arguments); };
    tegnNavneskilt = skiltVi;
  }
  pakMenneske(); pakSkilt();
  setInterval(function () { pakMenneske(); pakSkilt(); }, 1000);   // andre filer kan pakke dem ind senere


  // =============================================================
  //  Ind og ud af byggetilstanden
  // =============================================================
  function ventende() {
    return Object.keys(VENTENDE_MOEBLER).some(function (id) { const l = VENTENDE_MOEBLER[id]; return l && l.length; });
  }
  let venterPaaKatalog = null;
  function aabn(forsoeg) {
    if (!bygRet()) {
      toast(rumValg === "hal" ? "🔨 Kun hotellets ejer og Bygmestre kan bygge i velkomsthallen." : "🔨 Du kan kun bygge i dine egne rum.");
      return;
    }
    // møblerne bliver hentet lidt efter, spillet er startet: vent på dem, så intet bliver glemt
    forsoeg = forsoeg || 0;
    if (ventende() && forsoeg < 50) {
      toast("⏳ Vent et øjeblik, møblerne bliver hentet …");
      clearTimeout(venterPaaKatalog);
      venterPaaKatalog = setTimeout(function () { aabn(forsoeg + 1); }, 300);
      return;
    }
    aktiv = true;
    document.body.classList.add("bygger");
    [top, etage, panel].forEach(function (d) { d.hidden = false; });
    if (typeof figur !== "undefined") { figur.rute = []; }
    valgtType = null;
    bygType = null;
    flytter = null;
    fortryd = []; gentag = [];
    kameraFoer = { x: KAMERA.x, y: KAMERA.y, zoom: brugerZoom };
    brugerZoom = Math.min(brugerZoom, 0.6);   // lidt længere væk, så man kan se rummet
    KAMERA.y -= 130;          // rummet rykker op over panelet
    vaelgVaerktoej("vaelg");
    if (typeof rfLuk === "function" && typeof rfVindue !== "undefined" && !rfVindue.hidden) rfLuk(true);
    visPanel();
    opdaterTop();
    opdaterEtage();
    toast("🔨 Klik på et møbel for at vælge det, eller vælg et møbel forneden og klik på gulvet.");
  }
  function luk() {
    if (!aktiv) return;
    aktiv = false;
    document.body.classList.remove("bygger");
    [top, etage, panel, menu, lagMenu].forEach(function (d) { d.hidden = true; });
    bygType = null;
    flytter = null;
    traekMoebel = null;
    valgtMoebel = null;
    if (kameraFoer) { KAMERA.x = kameraFoer.x; KAMERA.y = kameraFoer.y; brugerZoom = kameraFoer.zoom; }
    laerred.style.cursor = "";
    gem();
    opdaterPanel();
    toast("Byggeriet er gemt ✓ Klik på gulvet for at gå.");
  }
  window.aabnByggetilstand = aabn;
  window.lukByggetilstand = luk;
  aabnKnap.addEventListener("click", function () { aabn(); });
  document.getElementById("byg-afslut").addEventListener("click", luk);

  // :byg i chatten
  document.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    if (!/^[:：]\s*(byg|build|byggetilstand)$/i.test(chatTekst.value.trim())) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    chatTekst.value = "";
    aabn();
  }, true);

  // knappen øverst vises kun, hvor man må bygge
  setInterval(function () {
    aabnKnap.hidden = aktiv || !bygRet();
    if (aktiv && !bygRet()) { luk(); toast("Du kan ikke bygge her."); }
  }, 500);

  // skifter man rum, mens man bygger
  const skiftRumFoerByg = skiftRum;
  skiftRum = function () {
    const var_aktiv = aktiv;
    const svar = skiftRumFoerByg.apply(this, arguments);
    if (var_aktiv) {
      fortryd = []; gentag = [];
      bygType = null; flytter = null;
      if (!bygRet()) luk();
      else { KAMERA.y -= 130; visPanel(); opdaterEtage(); opdaterTop(); }
    }
    return svar;
  };


  // =============================================================
  //  Værktøjerne øverst
  // =============================================================
  function vaelgVaerktoej(v) {
    vaerktoej = v;
    top.querySelectorAll("[data-v]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.v === v); });
    if (v !== "vaelg") { bygType = null; flytter = null; }
    if (v === "haand") toast("✋ Træk i rummet for at flytte skærmen.");
    if (v === "pipette") toast("💧 Klik på et møbel i rummet for at vælge samme slags.");
    if (v === "rulle") {
      toast("🖌️ Vælg en farve forneden. Klik så på gulvet eller væggen for at male.");
      if (hovedKat !== "vaegge" && hovedKat !== "gulve") { hovedKat = "vaegge"; underKat = null; }
      visPanel();
    }
    laerred.style.cursor = v === "haand" ? "grab" : v === "pipette" ? "crosshair" : v === "rulle" ? "cell" : "";
  }
  top.querySelectorAll("[data-v]").forEach(function (k) {
    k.addEventListener("click", function () { vaelgVaerktoej(k.dataset.v); });
  });
  document.getElementById("byg-gitter-knap").addEventListener("click", function () {
    visGitter = !visGitter;
    document.getElementById("byg-lag-gitter").checked = visGitter;
    opdaterTop();
  });
  document.getElementById("byg-lag-knap").addEventListener("click", function () {
    lagMenu.hidden = !lagMenu.hidden;
    const r = this.getBoundingClientRect();
    lagMenu.style.left = Math.round(r.left - 40) + "px";
    opdaterTop();
  });
  document.getElementById("byg-lag-figurer").addEventListener("change", function () { visFigurer = this.checked; });
  document.getElementById("byg-lag-gitter").addEventListener("change", function () { visGitter = this.checked; opdaterTop(); });
  document.getElementById("byg-lag-gennem").addEventListener("change", function () { gennemsigtig = this.checked; });
  document.getElementById("byg-fortryd").addEventListener("click", fortrydEt);
  document.getElementById("byg-gentag").addEventListener("click", gentagEt);
  document.getElementById("byg-gem").addEventListener("click", function () {
    if (ventende()) { toast("⏳ Vent et øjeblik, møblerne bliver hentet …"); return; }
    gem();
    if (typeof gemLager === "function") gemLager();
    const k = this;
    k.classList.add("gemt");
    k.querySelector(".ik").textContent = "✓";
    setTimeout(function () { k.classList.remove("gemt"); k.querySelector(".ik").textContent = "💾"; }, 1400);
    toast("💾 Rummet er gemt!");
  });
  function opdaterTop() {
    document.getElementById("byg-fortryd").disabled = !fortryd.length;
    document.getElementById("byg-gentag").disabled = !gentag.length;
    document.getElementById("byg-gitter-knap").classList.toggle("valgt", visGitter);
    document.getElementById("byg-lag-knap").classList.toggle("valgt", !lagMenu.hidden);
  }


  // =============================================================
  //  Etage: dine egne rum
  // =============================================================
  function mineRumListe() {
    const liste = ["mit"];
    if (typeof mineRum !== "undefined") mineRum.forEach(function (r) { if (!r.ejer || r.ejer === FIGUR.navn) liste.push(r.id); });
    return liste;
  }
  function opdaterEtage() {
    const liste = mineRumListe();
    const her = rumValg === "hal" ? -1 : liste.indexOf(aktivtVaerelse);
    document.getElementById("byg-etage-tal").textContent = her >= 0 ? her + 1 : "★";
    document.getElementById("byg-etage-navn").textContent = rumValg === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse);
    document.getElementById("byg-op").disabled = her < 0 || liste.length < 2;
    document.getElementById("byg-ned").disabled = her < 0 || liste.length < 2;
  }
  function skiftEtage(ret) {
    const liste = mineRumListe();
    const her = liste.indexOf(aktivtVaerelse);
    if (her < 0 || liste.length < 2) return;
    if (ventende()) { toast("⏳ Vent et øjeblik, møblerne bliver hentet …"); return; }
    gem();
    gaaTilVaerelse(liste[(her + ret + liste.length) % liste.length]);
  }
  document.getElementById("byg-op").addEventListener("click", function () { skiftEtage(1); });
  document.getElementById("byg-ned").addEventListener("click", function () { skiftEtage(-1); });
  document.getElementById("byg-midte").addEventListener("click", function () {
    brugerZoom = 0.8;
    KAMERA.x = 0;
    KAMERA.y = -110;
  });


  // =============================================================
  //  Panelet forneden
  // =============================================================
  const katBoks = document.getElementById("byg-kat");
  const underBoks = document.getElementById("byg-under");
  const gitter = document.getElementById("byg-gitter");
  const visBoks = document.getElementById("byg-vis");
  const soeg = document.getElementById("byg-soeg");

  function tingIPanelet() {
    // hvilke møbler kan man vælge imellem?
    const liste = [];
    if (gratis()) {
      Object.values(MOEBEL_TYPER).forEach(function (t) {
        if (t.kategori === "Staff" && typeof erStaff === "function" && !erStaff()) return;
        liste.push({ type: t, antal: null });
      });
    } else if (harLager()) {
      const tal = {};
      lager.forEach(function (t) { tal[t.type] = (tal[t.type] || 0) + 1; });
      Object.keys(tal).forEach(function (id) { if (MOEBEL_TYPER[id]) liste.push({ type: MOEBEL_TYPER[id], antal: tal[id] }); });
    }
    return liste;
  }
  function filtrer(liste) {
    const h = HOVED.find(function (k) { return k.id === hovedKat; });
    const s = soeg.value.trim().toLowerCase();
    return liste.filter(function (g) {
      const u = gruppe(g.type);
      if (s) return (g.type.navn + " " + (g.type.kategori || "")).toLowerCase().indexOf(s) >= 0;
      if (underKat === "fav") return erFav(g.type.id);
      if (hovedKat !== "alle" && hovedFor(u) !== hovedKat) return false;
      if (underKat && underKat !== u) return false;
      return !h || !h.under || true;
    });
  }

  function visKat() {
    katBoks.innerHTML = "";
    HOVED.forEach(function (k) {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = "<span>" + k.ikon + "</span>" + k.navn;
      if (k.id === hovedKat) b.className = "valgt";
      b.addEventListener("click", function () {
        hovedKat = k.id; underKat = null; soeg.value = "";
        if ((k.id === "vaegge" || k.id === "gulve") && vaerktoej !== "rulle") vaelgVaerktoej("rulle");
        else if (k.id !== "vaegge" && k.id !== "gulve" && vaerktoej === "rulle") vaelgVaerktoej("vaelg");
        visPanel();
      });
      katBoks.appendChild(b);
    });
  }

  function visUnder() {
    underBoks.innerHTML = "";
    const h = HOVED.find(function (k) { return k.id === hovedKat; });
    let faner = [];
    if (h.under) faner = [{ id: null, ikon: "🔲", navn: "Alle " + h.navn.toLowerCase() }].concat(h.under.map(function (u) { return { id: u, ikon: UNDER[u].ikon, navn: UNDER[u].navn }; }));
    if (h.id === "gulve") faner = [{ id: "trae", ikon: "🪵", navn: "Træplanker" }, { id: "fliser", ikon: "⬜", navn: "Fliser" }];
    if (h.id === "vaegge") faner = [{ id: "tapet", ikon: "🧱", navn: "Tapet" }, { id: "panel", ikon: "🪚", navn: "Træpanel" }];
    faner.forEach(function (f) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = f.ikon;
      b.title = f.navn;
      if (f.id === underKat) b.className = "valgt";
      b.addEventListener("click", function () { underKat = f.id; visPanel(); });
      underBoks.appendChild(b);
    });
    const moebelKat = !!h.under;
    soeg.hidden = !moebelKat;
  }

  function tomTekst() {
    if (soeg.value.trim()) return "Ingen møbler hedder sådan.";
    if (underKat === "fav") return "⭐ Du har ingen favoritter her endnu.<br><small>Vælg et møbel, og tryk på stjernen til højre.</small>";
    if (gratis()) return "Ingen møbler i denne gruppe.";
    return "Du har ingen møbler her i Mine ting 📦<br><small>Køb møbler i Shoppen 🛒, så kommer de her.</small>";
  }

  function visMoebelGitter() {
    gitter.innerHTML = "";
    const liste = filtrer(tingIPanelet());
    liste.sort(function (a, b) { return a.type.navn.localeCompare(b.type.navn, "da", { numeric: true }); });
    if (!liste.length) {
      gitter.innerHTML = "<p class='byg-tom'>" + tomTekst() + "</p>";
      if (!gratis()) {
        const k = document.createElement("button");
        k.type = "button"; k.className = "byg-knap"; k.style.gridColumn = "1 / -1"; k.style.justifySelf = "center";
        k.textContent = "🛒 Åbn Shoppen";
        k.addEventListener("click", function () { if (typeof aabnShop === "function") aabnShop(); });
        gitter.appendChild(k);
      }
      return;
    }
    liste.forEach(function (g) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "byg-ting" + (visType === g.type.id ? " valgt" : "");
      b.title = g.type.navn;
      b.appendChild(lavTingBillede(g.type, 84));
      if (g.antal !== null) {
        const tal = document.createElement("span");
        tal.className = "byg-tal";
        tal.textContent = "×" + g.antal;
        b.appendChild(tal);
      }
      if (erFav(g.type.id)) {
        const s = document.createElement("span");
        s.className = "byg-stjerne";
        s.textContent = "⭐";
        b.appendChild(s);
      }
      b.addEventListener("click", function () { vaelgType(g.type.id); });
      gitter.appendChild(b);
    });
  }

  // ----- farver til vægge og gulv (fra js/rum-farver.js) -----
  function farverHer() {
    return typeof rfAktuelle === "function" && typeof rfTilValg === "function" ? rfTilValg(rfAktuelle()) : null;
  }
  function gemFarver(aendr) {
    if (typeof rfMaaRette !== "function" || !rfMaaRette()) {
      toast(rumValg === "hal" ? "🎨 Kun hotellets ejer kan ændre farverne i velkomsthallen." : "🎨 Du kan kun ændre farverne i dine egne rum.");
      return;
    }
    // samme gemning som "💾 Gem" i vinduet Gulv & vægge
    rfFoer = rfAktuelle();
    rfNu = rfTilValg(rfFoer);
    aendr(rfNu);
    document.getElementById("rf-gem").click();
    visPanel();
  }
  function farveKnapper(liste, valgt, klik) {
    liste.forEach(function (f) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "byg-farve" + (String(valgt).toLowerCase() === f[1].toLowerCase() ? " valgt" : "");
      b.title = f[0];
      b.style.background = f[1] === "natur" ? "linear-gradient(135deg,#8a5a34,#5b3a22 45%,#9a6a40)" : f[1] === (typeof TRAE_NATUR !== "undefined" ? TRAE_NATUR : "") ? "linear-gradient(135deg,#b4844f,#8a6038 45%,#c0905c)" : f[1];
      b.addEventListener("click", function () { klik(f[1]); });
      gitter.appendChild(b);
    });
  }
  function visFarveGitter() {
    const n = farverHer();
    if (!n || typeof RF_TAPET === "undefined") { gitter.innerHTML = "<p class='byg-tom'>Farverne er ikke hentet endnu …</p>"; return; }
    if (hovedKat === "vaegge") {
      const panelValgt = underKat === "panel";
      gitter.innerHTML = "<h4>" + (panelValgt ? "🪚 Træpanel forneden på væggen" : "🧱 Tapet") + "</h4>";
      if (panelValgt) farveKnapper(RF_PANEL, n.panel, function (f) { sidsteMaling.panel = f; gemFarver(function (v) { v.panel = f; }); toast("🖌️ Træpanelet er malet."); });
      else farveKnapper(RF_TAPET, n.vaeg, function (f) { sidsteMaling.vaeg = f; gemFarver(function (v) { v.vaeg = f; }); toast("🖌️ Væggene er malet. Klik på væggen med malerrullen for at male igen."); });
    } else {
      const slags = underKat || n.gulvType;
      if (!underKat) underKat = slags;
      gitter.innerHTML = "<h4>" + (slags === "trae" ? "🪵 Træplanker" : "⬜ Fliser") + "</h4>";
      farveKnapper(slags === "trae" ? RF_TRAE : RF_FLISER, n.gulvType === slags ? n.gulv1 : "", function (f) {
        sidsteMaling.gulv = { farve: f, slags: slags };
        gemFarver(function (v) { v.gulvType = slags; v.gulv1 = f; v.gulv2 = rfNuance(f, 0.93); });
        toast("🖌️ Gulvet er malet.");
      });
    }
  }
  function maalMedRulle(paaGulvet) {
    if (paaGulvet) {
      const g = sidsteMaling.gulv;
      if (!g) { hovedKat = "gulve"; underKat = null; visPanel(); toast("🖌️ Vælg en farve til gulvet forneden."); return; }
      gemFarver(function (v) { v.gulvType = g.slags; v.gulv1 = g.farve; v.gulv2 = rfNuance(g.farve, 0.93); });
      toast("🖌️ Gulvet er malet.");
    } else {
      if (!sidsteMaling.vaeg) { hovedKat = "vaegge"; underKat = "tapet"; visPanel(); toast("🖌️ Vælg en farve til væggen forneden."); return; }
      gemFarver(function (v) { v.vaeg = sidsteMaling.vaeg; });
      toast("🖌️ Væggene er malet.");
    }
  }

  // ----- byggeri: rummets form og størrelse -----
  let rydKlik = 0;
  function visByggeri() {
    gitter.innerHTML = "";
    function kort(tekst, lille, klik, fare) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "byg-kort" + (fare ? " fare" : "");
      b.innerHTML = tekst + "<small>" + lille + "</small>";
      b.addEventListener("click", klik);
      gitter.appendChild(b);
      return b;
    }
    kort("🧱 Gulvplan", "Rummets form, størrelse, væggens højde og døren", function () {
      if (typeof maaRetteRum === "function" && maaRetteRum() && typeof aabnGulvplan === "function") aabnGulvplan();
      else toast("🧱 Gulvplanen virker kun i dine egne rum.");
    });
    kort("🎨 Flere farver", "Vælg din helt egen farve til gulv, tapet og panel", function () { if (typeof rfAabn === "function") rfAabn(); });
    kort("🧊 Se hele rummet", "Zoom ud og centrér rummet", function () { document.getElementById("byg-midte").click(); });
    if (!iFaelles()) {
      const k = kort("📦 Ryd rummet", erEjer() ? "Alle møbler bliver fjernet (kan fortrydes)" : "Alle møbler bliver lagt i Mine ting (kan fortrydes)", function () {
        if (Date.now() - rydKlik > 3000) { rydKlik = Date.now(); k.innerHTML = "⚠ Er du sikker?<small>Tryk igen for at rydde rummet</small>"; return; }
        rydKlik = 0;
        medFortryd(function () {
          if (typeof tilLager === "function" && !erEjer()) moeblerIRummet.forEach(function (m) { tilLager(m.type); });
          moeblerIRummet.length = 0;
          figur.sidde = null;
          valgtMoebel = null;
          gem();
          opdaterPanel();
        });
        visPanel();
        toast(erEjer() ? "📦 Rummet er ryddet." : "📦 Rummet er ryddet. Møblerne ligger i Mine ting.");
      }, true);
    }
  }

  // ----- billedet til højre -----
  function visValgt() {
    visBoks.innerHTML = "";
    const t = visType && MOEBEL_TYPER[visType];
    if (!t || hovedKat === "vaegge" || hovedKat === "gulve" || hovedKat === "byggeri") {
      visBoks.innerHTML = hovedKat === "vaegge" || hovedKat === "gulve"
        ? "<b>🖌️ Malerrulle</b><small>Klik på en farve for at male rummet med det samme. Med malerrullen kan du også klikke på gulvet eller væggen i rummet.</small>"
        : hovedKat === "byggeri" ? "<b>🏗️ Byggeri</b><small>Gør rummet større, giv det en ny form eller flyt døren.</small>"
        : "<b>Vælg et møbel</b><small>" + (erEjer() ? "👑 Du er ejer: alle møbler er gratis for dig." : gratis() ? "🔨 Her er alle møbler gratis." : "Her er de møbler, du har i Mine ting 📦") + "</small>";
      return;
    }
    const c = document.createElement("canvas");
    c.width = 170; c.height = 110;
    visBoks.appendChild(c);
    tegnTing(c, t);
    butikBilleder.push({ c: c, type: t });
    const navn = document.createElement("b");
    navn.textContent = t.navn;
    visBoks.appendChild(navn);
    const om = document.createElement("small");
    const antal = antalILager(t.id);
    om.textContent = erEjer() ? "👑 Gratis for dig · " + (t.kategori || "Møbel") : gratis() ? "🔨 Gratis her" : "Du har " + antal + " · " + (t.kategori || "Møbel");
    visBoks.appendChild(om);
    // samme møbel i andre farver
    const v = varianter(t);
    if (v.length > 1) {
      const boks = document.createElement("div");
      boks.className = "byg-var";
      v.forEach(function (a) {
        const b = document.createElement("button");
        b.type = "button";
        const mangler = !gratis() && !antalILager(a.id);
        b.className = (a.id === t.id ? "valgt" : "") + (mangler ? " mangler" : "");
        b.title = a.navn + (mangler ? " (har du ikke)" : "");
        b.appendChild(lavTingBillede(a, 36));
        b.addEventListener("click", function () { vaelgType(a.id); });
        boks.appendChild(b);
      });
      visBoks.appendChild(boks);
    }
    const knapper = document.createElement("div");
    knapper.className = "byg-vis-knapper";
    const stil = document.createElement("button");
    stil.type = "button"; stil.className = "byg-knap";
    stil.textContent = bygType === t.id ? "✋ Klik på gulvet" : "➕ Stil i rummet";
    stil.disabled = !kanStille(t.id);
    stil.addEventListener("click", function () { startStil(t.id); });
    const fav = document.createElement("button");
    fav.type = "button"; fav.className = "byg-knap";
    fav.textContent = erFav(t.id) ? "⭐" : "☆";
    fav.title = erFav(t.id) ? "Fjern fra favoritter" : "Gør til favorit";
    fav.addEventListener("click", function () { skiftFav(t.id); visPanel(); });
    knapper.append(stil, fav);
    visBoks.appendChild(knapper);
    if (!kanStille(t.id)) {
      const k = document.createElement("small");
      k.innerHTML = "Køb den i Shoppen 🛒";
      visBoks.appendChild(k);
    }
  }

  function visPanel() {
    if (!aktiv) return;
    visKat();
    visUnder();
    if (hovedKat === "vaegge" || hovedKat === "gulve") visFarveGitter();
    else if (hovedKat === "byggeri") visByggeri();
    else visMoebelGitter();
    visValgt();
  }
  soeg.addEventListener("input", visPanel);
  // kommer der flere møbeltyper (de hentes lidt efter start), tegnes panelet igen
  let typeTal = Object.keys(MOEBEL_TYPER).length, lagerTal = -1;
  setInterval(function () {
    if (!aktiv) return;
    const n = Object.keys(MOEBEL_TYPER).length, l = harLager() ? lager.length : 0;
    if (n !== typeTal || l !== lagerTal) { typeTal = n; lagerTal = l; visPanel(); }
  }, 1000);

  function vaelgType(id) {
    visType = id;
    if (kanStille(id)) startStil(id);
    else { bygType = null; visPanel(); toast("Du har ikke " + navnPaa(id) + " i Mine ting. Køb den i Shoppen 🛒"); }
  }
  function startStil(id) {
    if (!kanStille(id)) return;
    if (vaerktoej !== "vaelg") vaelgVaerktoej("vaelg");
    if (bygType !== id) bygRetning = 0;
    bygType = id;
    visType = id;
    flytter = null;
    valgtMoebel = null;
    opdaterPanel();
    visPanel();
    toast("Klik på et ledigt felt for at stille " + navnPaa(id) + ". R drejer. Esc stopper.");
  }


  // =============================================================
  //  Stil, flyt, kopiér og læg væk
  // =============================================================
  function naesteRetning(t, r) {
    for (let i = 0; i < 4; i++) { r = (r + 1) % 4; if (!t.klipper || t.klipper[r]) break; }
    return r;
  }
  function stilHer(f) {
    const type = MOEBEL_TYPER[bygType];
    if (!type) { bygType = null; return; }
    const tv = tvaersFor(type, bygRetning);
    if (!pladsTil(type, f.x, f.y, tv)) { toast("Der er optaget. Prøv et andet felt."); return; }
    if (!kanStille(bygType)) { toast("Du har ikke flere af dem i Mine ting."); bygType = null; visPanel(); return; }
    const id = bygType;
    medFortryd(function () {
      moeblerIRummet.push({ type: id, x: f.x, y: f.y, spejlet: false, retning: type.klipper ? bygRetning : 0 });
      if (!gratis() && typeof fraLager === "function") fraLager(id);
      gem();
    });
    valgtMoebel = null;
    if (!kanStille(id)) { bygType = null; toast(navnPaa(id) + " er stillet. Du har ikke flere i Mine ting."); }
    else toast(navnPaa(id) + " er stillet ✓ Klik igen for at stille én til, eller tryk Esc.");
    opdaterPanel();
    visPanel();
  }
  function flytHer(m, f) {
    const type = MOEBEL_TYPER[m.type];
    if (!type) return false;
    if (m.x === f.x && m.y === f.y) return true;
    if (!pladsTil(type, f.x, f.y, drejetTvaers(m), m)) { toast("Der er optaget. Prøv et andet felt."); return false; }
    medFortryd(function () {
      if (figur.sidde && figur.sidde.moebel === m) { figur.sidde = null; figur.skalSidde = null; }
      m.x = f.x;
      m.y = f.y;
      gem();
    });
    toast(type.navn + " er flyttet ✥");
    return true;
  }
  function kopier() {
    const m = valgtMoebel;
    if (!m) return;
    const type = MOEBEL_TYPER[m.type];
    if (!kanStille(m.type)) { toast("Du har ikke flere " + type.navn + " i Mine ting. Køb en til i Shoppen 🛒"); return; }
    // find det nærmeste ledige felt
    const tv = drejetTvaers(m);
    let bedst = null;
    for (let r = 1; r < 8 && !bedst; r++) {
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = m.x + dx, y = m.y + dy;
        if (!pladsTil(type, x, y, tv)) continue;
        const a = Math.abs(dx) + Math.abs(dy);
        if (!bedst || a < bedst.a) bedst = { x: x, y: y, a: a };
      }
    }
    if (!bedst) { toast("Der er ikke plads til en kopi tæt på."); return; }
    let ny = null;
    medFortryd(function () {
      ny = { type: m.type, x: bedst.x, y: bedst.y, spejlet: !!m.spejlet, retning: m.retning || 0 };
      moeblerIRummet.push(ny);
      if (!gratis() && typeof fraLager === "function") fraLager(m.type);
      gem();
    });
    valgtMoebel = ny;
    opdaterPanel();
    visPanel();
    toast("⧉ " + type.navn + " er kopieret" + (gratis() ? "." : " (taget fra Mine ting)."));
  }
  document.getElementById("byg-m-flyt").addEventListener("click", function () {
    if (!valgtMoebel) return;
    flytter = flytter ? null : valgtMoebel;
    bygType = null;
    toast(flytter ? "Klik på et ledigt felt for at flytte " + navnPaa(flytter.type) + ". (Esc fortryder)" : "");
  });
  document.getElementById("byg-m-drej").addEventListener("click", function () { if (valgtMoebel) drejValgt(); });
  document.getElementById("byg-m-kopi").addEventListener("click", kopier);
  document.getElementById("byg-m-slet").addEventListener("click", function () {
    if (!valgtMoebel) return;
    const navn = navnPaa(valgtMoebel.type);
    const faelles = iFaelles();
    samlOpValgt();
    flytter = null;
    visPanel();
    toast(faelles || erEjer() ? navn + " er fjernet fra rummet 🗑" : navn + " er lagt i Mine ting 📦");
  });

  // menuen følger møblet rundt på skærmen
  function placerMenu() {
    if (!aktiv || !valgtMoebel || moeblerIRummet.indexOf(valgtMoebel) < 0 || flytter || bygType || traekMoebel) { menu.hidden = true; return; }
    const m = valgtMoebel, t = MOEBEL_TYPER[m.type];
    if (!t) { menu.hidden = true; return; }
    const f = moebelFelter(t, drejetTvaers(m));
    const p = punkt(m.x + f[0], m.y + f[1]);
    const r = laerred.getBoundingClientRect();
    const sx = r.width / BREDDE, sy = r.height / HOEJDE;
    const x = r.left + p.x * sx, y = r.top + p.y * sy + 18;
    const iPanel = window.innerHeight - 304;
    menu.style.left = Math.round(Math.max(130, Math.min(window.innerWidth - 130, x))) + "px";
    menu.style.top = Math.round(Math.max(80, Math.min(iPanel - 64, y))) + "px";
    menu.hidden = false;
    const faelles = iFaelles();
    const slet = document.getElementById("byg-m-slet");
    slet.title = faelles || erEjer() ? "Fjern fra rummet" : "Læg i Mine ting";
    document.getElementById("byg-m-kopi").disabled = !kanStille(m.type);
    document.getElementById("byg-m-kopi").title = kanStille(m.type) ? "Kopiér" + (gratis() ? "" : " (tager en fra Mine ting)") : "Kopiér: du har ikke flere i Mine ting";
  }
  (function loop() { placerMenu(); requestAnimationFrame(loop); })();


  // =============================================================
  //  Mus og tastatur i byggetilstanden
  // =============================================================
  function iRummetsKlik(e) { return aktiv && e.target === laerred; }

  // træk i et møbel = flyt det
  window.addEventListener("mousedown", function (e) {
    if (!iRummetsKlik(e) || e.button !== 0 || vaerktoej !== "vaelg" || bygType || flytter) return;
    const f = musTilFelt(e);
    const m = moebelPaa(f.x, f.y);
    if (!m) return;
    e.stopPropagation();          // skærmen skal ikke flytte sig
    traekMoebel = { m: m, fra: f, flyttet: false };
  }, true);
  window.addEventListener("mousemove", function (e) {
    if (!traekMoebel) return;
    const f = musTilFelt(e);
    if (!traekMoebel.flyttet && (f.x !== traekMoebel.fra.x || f.y !== traekMoebel.fra.y)) {
      traekMoebel.flyttet = true;
      valgtMoebel = traekMoebel.m;
      flytter = traekMoebel.m;
      laerred.style.cursor = "grabbing";
    }
  }, true);
  window.addEventListener("mouseup", function (e) {
    if (!traekMoebel) return;
    const t = traekMoebel;
    traekMoebel = null;
    if (!t.flyttet) return;
    spisKlik = true;
    laerred.style.cursor = "";
    flytter = null;
    if (e.target === laerred) flytHer(t.m, musTilFelt(e));
    valgtMoebel = t.m;
    opdaterPanel();
  }, true);

  window.addEventListener("click", function (e) {
    if (!iRummetsKlik(e)) return;
    if (typeof traek !== "undefined" && traek.flyttet) return;   // skærmen er blevet trukket (js/spil.js tager sig af det)
    e.stopImmediatePropagation();
    e.preventDefault();
    if (spisKlik) { spisKlik = false; return; }
    lagMenu.hidden = true; opdaterTop();
    const f = musTilFelt(e);
    if (vaerktoej === "haand") return;
    if (vaerktoej === "rulle") { maalMedRulle(erIRummet(f.x, f.y)); return; }
    if (flytter) {
      const m = flytter;
      if (!erIRummet(f.x, f.y)) { flytter = null; return; }
      if (flytHer(m, f)) { flytter = null; valgtMoebel = m; opdaterPanel(); }
      return;
    }
    if (bygType) {
      if (!erIRummet(f.x, f.y)) { bygType = null; visPanel(); toast(""); return; }
      stilHer(f);
      return;
    }
    const m = erIRummet(f.x, f.y) ? moebelPaa(f.x, f.y) : null;
    if (vaerktoej === "pipette") {
      if (!m) { toast("💧 Klik på et møbel."); return; }
      const g = gruppe(MOEBEL_TYPER[m.type]);
      hovedKat = hovedFor(g); underKat = g; soeg.value = "";
      vaelgVaerktoej("vaelg");
      vaelgType(m.type);
      return;
    }
    valgtMoebel = m || null;
    if (m) { visType = m.type; }
    opdaterPanel();
    visPanel();
    if (m) toast(navnPaa(m.type) + ": træk for at flytte, eller brug knapperne under møblet.");
  }, true);

  // højreklik stopper det, man er i gang med
  window.addEventListener("contextmenu", function (e) {
    if (!iRummetsKlik(e)) return;
    if (bygType || flytter) { e.preventDefault(); bygType = null; flytter = null; visPanel(); toast(""); }
  }, true);

  window.addEventListener("keydown", function (e) {
    if (!aktiv) return;
    const skriver = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
    if ((e.ctrlKey || e.metaKey) && !skriver && (e.key === "z" || e.key === "Z")) { e.preventDefault(); e.stopImmediatePropagation(); if (e.shiftKey) gentagEt(); else fortrydEt(); return; }
    if ((e.ctrlKey || e.metaKey) && !skriver && (e.key === "y" || e.key === "Y")) { e.preventDefault(); e.stopImmediatePropagation(); gentagEt(); return; }
    if (skriver) return;
    if (e.key === "Escape") {
      e.stopImmediatePropagation();
      if (bygType || flytter) { bygType = null; flytter = null; visPanel(); toast(""); }
      else if (!lagMenu.hidden) { lagMenu.hidden = true; opdaterTop(); }
      else if (valgtMoebel) { valgtMoebel = null; opdaterPanel(); visPanel(); }
      return;
    }
    if ((e.key === "r" || e.key === "R") && bygType) {
      e.stopImmediatePropagation();
      const t = MOEBEL_TYPER[bygType];
      if (t && t.klipper) bygRetning = naesteRetning(t, bygRetning);
      return;
    }
    if ((e.key === "c" || e.key === "C") && valgtMoebel) { e.stopImmediatePropagation(); kopier(); return; }
    if ((e.key === "m" || e.key === "M") && valgtMoebel) { e.stopImmediatePropagation(); document.getElementById("byg-m-flyt").click(); return; }
  }, true);
})();
