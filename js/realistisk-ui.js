// =============================================================
//  🪵 Realistiske vinduer: Ejerpanel/Mod-/Staff-panel, toppen, chatbaren
//     og alle de andre vinduer (shop, navigatør, venner, profil, post …)
//  Rigtige materialer i stedet for flade farver:
//   - toppen er poleret mahognitræ med guldliste og graveret titel
//   - fanerne til venstre er vinrødt læder med syninger
//   - den valgte fane er en messingplade
//   - indholdet er cremet papir, og kortene er elfenbenskort med guldkant
//  Billederne ligger i billeder/ui/ (lavet med kode, kan skiftes ud).
//  Det mørke tema (🌙) bliver som før.
//  Slå fra: localStorage "mit-hotel-realistisk-ui" = "fra"
// =============================================================
(function () {
  let fra = false;
  try { fra = localStorage.getItem("mit-hotel-realistisk-ui") === "fra"; } catch (e) {}
  if (fra || document.getElementById("realistisk-ui-stil")) return;

  const V = "#ejer-vindue:not(.moerkt) ";
  const TRAE = "url('billeder/ui/trae.jpg')", LYS_TRAE = "url('billeder/ui/trae-lys.jpg')",
    LAEDER = "url('billeder/ui/laeder.jpg')", PAPIR = "url('billeder/ui/papir.jpg')", MESSING = "url('billeder/ui/messing.jpg')";
  const SERIF = "Georgia, 'Times New Roman', serif";
  const GULD = "#d8b46a", MOERK_GULD = "#9c7430", BLAEK = "#3a1d14";


  // Toppen af alle de andre vinduer (navnene fra stil.css og scripts)
  const TOP_KLASSER = ["mj-top", "lv-top", "kam-top", "elev-top", "butik-top", "al-top", "venner-top", "post-top", "nav-top", "chatlog-top",
    "besked-top", "ao-top", "su-top", "mi-top", "mention-hoved", "mention-top", "lej-top", "jv-top", "gp-top", "ev-note-top", "bio-top",
    "sk-top", "rap-top", "pm-top", "hj-top", "cb-top"];
  const TOPPE = TOP_KLASSER.map(function (k) { return "." + k; }).join(", ");
  const TITLER = TOP_KLASSER.map(function (k) { return "." + k + " h2, ." + k + " h3, ." + k + " > span"; }).join(", ");
  const TOP_KNAPPER = TOP_KLASSER.map(function (k) { return "." + k + " button"; }).join(", ");
  const MESSING_KNAPPER = "#mention-knap, #log-ud-knap, #skaansom-knap, #online-tal, #paamind-fane";

  const css = [
    // Rammen: mørkt træ med en tynd guldliste indenfor
    V + ".ejer-boks { background: " + PAPIR + " repeat, #f3e6cc !important; border: 0 !important; border-radius: 10px !important;" +
      " box-shadow: 0 0 0 2px #2a0d0a, 0 0 0 5px " + MOERK_GULD + ", 0 0 0 7px #2a0d0a, 0 18px 40px rgba(0,0,0,.55), inset 0 0 40px rgba(120,80,30,.18) !important;" +
      " color: " + BLAEK + " !important; }",

    // Toppen: poleret mahogni med lys glans, guldliste forneden og graveret titel
    V + ".ejer-top { background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 45%, rgba(0,0,0,.25)), " + TRAE + " center/512px 256px !important;" +
      " border-bottom: 3px solid " + MOERK_GULD + " !important; box-shadow: inset 0 -1px 0 #f3d999, inset 0 1px 0 rgba(255,255,255,.25), 0 3px 6px rgba(0,0,0,.35) !important; position: relative; z-index: 1; }",
    V + ".ejer-top h2 { font-family: " + SERIF + " !important; font-weight: bold !important; letter-spacing: .04em;" +
      " color: #f3d999 !important; text-shadow: 0 1px 0 #6b4a17, 0 -1px 0 rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.5) !important; }",
    // Knapperne i toppen: messingknapper
    V + ".ejer-top button { background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 50%, rgba(0,0,0,.18)), " + MESSING + " !important;" +
      " border: 1px solid #5e3f12 !important; border-radius: 6px !important; color: #3a2408 !important;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 3px rgba(0,0,0,.45) !important; text-shadow: 0 1px 0 rgba(255,240,200,.7); }",
    V + ".ejer-top button:hover { filter: brightness(1.08); }",
    V + ".ejer-top button:active { box-shadow: inset 0 2px 4px rgba(0,0,0,.45) !important; }",

    // Fanerne: vinrødt læder med en syning langs kanten
    V + "#ejer-faner { background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.10), rgba(0,0,0,.25) 90%), " + LAEDER + " !important;" +
      " border-right: 3px solid #2a0d0a !important; box-shadow: inset -1px 0 0 " + MOERK_GULD + ", inset 0 6px 10px rgba(0,0,0,.35) !important; position: relative; padding: 12px 10px !important; }",
    V + "#ejer-faner::before { content: ''; position: absolute; inset: 5px; border: 1px dashed rgba(230,190,120,.45); border-radius: 6px; pointer-events: none; }",
    V + "#ejer-faner button { color: #f6e3c0 !important; background: transparent !important; position: relative; z-index: 1;" +
      " text-shadow: 0 1px 1px rgba(0,0,0,.7); font-family: " + SERIF + " !important; font-size: 14px !important; letter-spacing: .01em; }",
    V + "#ejer-faner button:hover { background: rgba(0,0,0,.22) !important; box-shadow: inset 0 1px 3px rgba(0,0,0,.5) !important; }",
    V + "#ejer-faner button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%, rgba(0,0,0,.15)), " + MESSING + " !important;" +
      " color: #3a2408 !important; text-shadow: 0 1px 0 rgba(255,240,200,.8) !important;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), inset 0 -1px 0 rgba(0,0,0,.25), 0 2px 4px rgba(0,0,0,.55) !important; border: 1px solid #5e3f12 !important; }",

    // Indholdet: papir, overskrifter med serif og en tynd guldstreg
    V + "#ejer-indhold { background: transparent !important; box-shadow: inset 6px 0 10px -6px rgba(0,0,0,.35); }",
    V + "#ejer-indhold h3 { font-family: " + SERIF + " !important; color: #6d1a28 !important; font-size: 17px !important;" +
      " padding-bottom: 4px; border-bottom: 1px solid " + GULD + "; box-shadow: 0 1px 0 rgba(255,255,255,.6); }",
    V + "#ejer-indhold h4 { font-family: " + SERIF + " !important; color: " + MOERK_GULD + " !important; letter-spacing: .08em; }",
    V + "#ejer-indhold li { border-bottom: 1px solid rgba(156,116,48,.35) !important; }",
    V + "#ejer-indhold li b { font-family: " + SERIF + "; color: " + BLAEK + "; }",
    V + "#ejer-indhold li span, " + V + "#ejer-indhold td small { color: #7a5a40 !important; font-style: italic; }",
    V + "#ejer-indhold a { color: #7a1d2e !important; }",

    // Kortene: elfenbenskort med guldkant og præget tal
    V + ".ejer-kort { background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,250,238,.35)), " + PAPIR + " !important;" +
      " border: 1px solid " + MOERK_GULD + " !important; border-radius: 6px !important; position: relative;" +
      " box-shadow: inset 0 0 0 3px #fbf3e2, inset 0 0 0 4px rgba(216,180,106,.8), 0 2px 0 rgba(120,80,30,.25), 0 6px 12px rgba(70,35,10,.18) !important; padding: 12px 16px !important; }",
    V + ".ejer-kort b { font-family: " + SERIF + " !important; font-size: 32px !important; color: #6d1a28 !important;" +
      " text-shadow: 0 1px 0 #fff, 0 -1px 0 rgba(90,20,30,.25); }",
    V + ".ejer-kort > span:not(.ikon) { font-family: " + SERIF + "; font-size: 15px; color: " + BLAEK + "; }",
    V + ".ejer-kort small { color: #8a6a4a !important; font-style: italic; }",
    V + ".ejer-kort .ikon { width: 34px; height: 34px; display: grid !important; place-items: center; margin-bottom: -34px !important; border-radius: 50%;" +
      " background: radial-gradient(circle at 35% 30%, #fff6d8, #e2bf72 45%, #8a6326 100%); box-shadow: 0 1px 2px rgba(0,0,0,.4), inset 0 -1px 2px rgba(0,0,0,.3); font-size: 17px !important; }",

    // Infoboks og faneforklaring: lille kort med papirclips-farve
    V + ".ejer-info { background: rgba(255,248,230,.75) !important; border: 1px solid rgba(156,116,48,.5); border-left: 4px solid #8a2a3e; border-radius: 4px !important;" +
      " box-shadow: 0 2px 5px rgba(70,35,10,.15); color: #4a2a1a !important; font-style: italic; }",

    // Felter og knapper inde i panelet
    V + "#ejer-indhold input[type=text], " + V + "#ejer-indhold input[type=number], " + V + "#ejer-indhold input[type=date], " +
      V + "#ejer-indhold input:not([type]), " + V + "#ejer-indhold select, " + V + "#ejer-indhold textarea { background: #fffaf0 !important;" +
      " border: 1px solid #b89458 !important; border-radius: 4px !important; box-shadow: inset 0 2px 3px rgba(80,45,15,.18) !important; color: " + BLAEK + " !important; }",
    V + "#ejer-indhold button:not(.sc-nat):not([class*='farve']) { background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(0,0,0,.12)), " + LYS_TRAE + " center/256px !important;" +
      " color: #fff4dc !important; border: 1px solid #4a2410 !important; border-radius: 5px !important; text-shadow: 0 1px 1px rgba(0,0,0,.6);" +
      " box-shadow: inset 0 1px 0 rgba(255,230,180,.45), 0 2px 3px rgba(0,0,0,.3) !important; }",
    V + "#ejer-indhold button:not(.sc-nat):not([class*='farve']):hover { filter: brightness(1.1); }",
    V + "#ejer-indhold button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(0,0,0,.12)), " + MESSING + " !important; color: #3a2408 !important; text-shadow: none; }",

    // Spillerlisten: som kort i et kartotek (ikke træknapper)
    V + "#ejer-indhold #sp-liste button, " + V + "#ejer-indhold #pb-liste button { background: linear-gradient(180deg, #fffaf0, #f4e6c8) !important; color: " + BLAEK + " !important;" +
      " border: 1px solid rgba(156,116,48,.55) !important; text-shadow: none !important; font-family: " + SERIF + " !important;" +
      " box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 2px 3px rgba(70,35,10,.15) !important; }",
    V + "#ejer-indhold #sp-liste button.valgt, " + V + "#ejer-indhold #pb-liste button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(0,0,0,.1)), " + MESSING + " !important; color: #3a2408 !important; }",
    V + ".sp-fakta span { background: rgba(255,250,238,.7) !important; border: 1px solid rgba(156,116,48,.45) !important; }",
    V + ".sp-fakta b { color: " + MOERK_GULD + " !important; font-family: " + SERIF + "; letter-spacing: .06em; }",

    // Tabeller som en gæstebog
    V + ".ejer-tabel th { background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(0,0,0,.2)), " + LAEDER + " !important; color: #f6e3c0 !important; font-family: " + SERIF + "; }",
    V + ".ejer-tabel td { border-bottom: 1px solid rgba(156,116,48,.35) !important; }",


    // ===================== Resten af spillet =====================
    // Toppen af skærmen: mahognibjælke med guldliste og graveret HELLO VERA
    "header { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 40%, rgba(0,0,0,.28)), " + TRAE + " center/512px 256px !important;" +
      " border: 0 !important; border-bottom: 3px solid " + MOERK_GULD + " !important; box-shadow: inset 0 -1px 0 #f3d999, 0 4px 10px rgba(0,0,0,.45) !important; }",
    "header h1 { font-family: " + SERIF + " !important; color: #f3d999 !important; letter-spacing: .08em;" +
      " text-shadow: 0 1px 0 #6b4a17, 0 -1px 0 rgba(0,0,0,.6), 0 2px 5px rgba(0,0,0,.55) !important; }",
    "header .tilbage { color: #f6e3c0 !important; font-family: " + SERIF + "; text-shadow: 0 1px 1px rgba(0,0,0,.7); }",

    // Små knapper og skilte (Mentions, Log ud, Skånsom, online, Påmindelser …): messingplader
    MESSING_KNAPPER + " { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.16)), " + MESSING + " !important;" +
      " border: 1px solid #5e3f12 !important; color: #3a2408 !important; text-shadow: 0 1px 0 rgba(255,240,200,.7) !important; font-family: " + SERIF + " !important;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 4px rgba(0,0,0,.45) !important; }",
    "#hjaelp-knap { background: linear-gradient(180deg, rgba(255,255,255,.25), rgba(0,0,0,.2)), " + LAEDER + " !important; color: #fbe3c4 !important;" +
      " border: 1px solid " + MOERK_GULD + " !important; text-shadow: 0 1px 1px rgba(0,0,0,.7) !important; font-family: " + SERIF + " !important; box-shadow: 0 2px 4px rgba(0,0,0,.45) !important; }",

    // Chatbaren: mahognibord med messingknapper og et elfenbensfelt at skrive i
    "#chat { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.28)), " + TRAE + " center/512px 256px !important;" +
      " border: 0 !important; box-shadow: 0 0 0 2px #2a0d0a, 0 0 0 4px " + MOERK_GULD + ", 0 0 0 5px #2a0d0a, 0 10px 24px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.2) !important; }",
    "#chat > button:not(#chat-farve-knap) { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.18)), " + MESSING + " !important;" +
      " border: 1px solid #5e3f12 !important; color: #3a2408 !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 3px rgba(0,0,0,.5) !important; text-shadow: 0 1px 0 rgba(255,240,200,.7); }",
    "#chat > button:hover { filter: brightness(1.08); }",
    "#chat > button:active { box-shadow: inset 0 2px 4px rgba(0,0,0,.5) !important; }",
    "#chat > button[type=submit] { font-family: " + SERIF + " !important; font-weight: bold; }",
    "#chat input { background: linear-gradient(180deg, rgba(0,0,0,.06), rgba(255,255,255,0) 30%), " + PAPIR + " !important; border: 1px solid #5e3f12 !important;" +
      " box-shadow: inset 0 2px 4px rgba(60,30,10,.35) !important; color: " + BLAEK + " !important; font-family: " + SERIF + "; }",

    // Alle vinduer: papir indeni, mørkt træ og guldliste udenom
    ".rui-vindue { background: " + PAPIR + " repeat, #f3e6cc !important; border-color: #2a0d0a !important; color: " + BLAEK + ";" +
      " box-shadow: 0 0 0 2px " + MOERK_GULD + ", 0 0 0 4px #2a0d0a, 0 16px 36px rgba(0,0,0,.5), inset 0 0 30px rgba(120,80,30,.15) !important; }",
    // ... og deres top: poleret mahogni med guldtitel
    TOPPE + " { background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 45%, rgba(0,0,0,.25)), " + TRAE + " center/512px 256px !important;" +
      " border-bottom: 2px solid " + MOERK_GULD + " !important; box-shadow: inset 0 -1px 0 #f3d999, 0 2px 5px rgba(0,0,0,.3) !important;" +
      " color: #f3d999 !important; font-family: " + SERIF + " !important; text-shadow: 0 1px 0 #6b4a17, 0 -1px 0 rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.5) !important; }",
    TITLER + " { color: #f3d999 !important; font-family: " + SERIF + " !important; text-shadow: 0 1px 0 #6b4a17, 0 -1px 0 rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.5) !important; }",
    TOP_KNAPPER + " { background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 50%, rgba(0,0,0,.18)), " + MESSING + " !important;" +
      " border: 1px solid #5e3f12 !important; color: #3a2408 !important; text-shadow: 0 1px 0 rgba(255,240,200,.7) !important;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 3px rgba(0,0,0,.45) !important; }",
    // overskrifter inde i vinduerne
    ".rui-vindue h3, .rui-vindue h4 { font-family: " + SERIF + "; }",

    // Dit lille portræt øverst til venstre: i en forgyldt ramme
    "#avatar-billede { border: 3px solid " + MOERK_GULD + " !important; box-shadow: 0 0 0 2px #2a0d0a, inset 0 0 0 1px #f3d999, 0 4px 10px rgba(0,0,0,.45) !important;" +
      " background: " + PAPIR + " !important; }",

    // Butikkerne (Shop, Mine ting): læder-sidebjælke, faneblade og elfenbenskort
    ".butik-kat { background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.10), rgba(0,0,0,.25) 90%), " + LAEDER + " !important; border-right: 3px solid #2a0d0a !important; }",
    ".butik-kat button { color: #f6e3c0 !important; background: transparent !important; border-color: transparent !important; text-shadow: 0 1px 1px rgba(0,0,0,.7); font-family: " + SERIF + " !important; }",
    ".butik-kat button:hover { background: rgba(0,0,0,.22) !important; }",
    ".butik-kat button.aktiv, .butik-kat button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%, rgba(0,0,0,.15)), " + MESSING + " !important;" +
      " color: #3a2408 !important; text-shadow: 0 1px 0 rgba(255,240,200,.8) !important; border: 1px solid #5e3f12 !important; box-shadow: 0 2px 4px rgba(0,0,0,.5) !important; }",
    ".butik-faner { background: transparent !important; }",
    ".butik-faner button { background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(0,0,0,.2)), " + LAEDER + " !important; color: #f6e3c0 !important;" +
      " border: 1px solid #2a0d0a !important; font-family: " + SERIF + " !important; text-shadow: 0 1px 1px rgba(0,0,0,.7); }",
    ".butik-faner button.aktiv, .butik-faner button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%, rgba(0,0,0,.15)), " + MESSING + " !important;" +
      " color: #3a2408 !important; text-shadow: 0 1px 0 rgba(255,240,200,.8); }",
    ".butik-gitter > *, .butik-valgt { background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,250,238,.5)), " + PAPIR + " !important;" +
      " border: 1px solid " + MOERK_GULD + " !important; box-shadow: inset 0 0 0 2px #fbf3e2, inset 0 0 0 3px rgba(216,180,106,.6), 0 3px 6px rgba(70,35,10,.18) !important; }",
    ".butik-krop, .butik-gitter { background: transparent !important; }",

    // Chatloggen nederst til højre: et ark papir i en træramme
    "#chatlog { background: " + PAPIR + " repeat, #f3e6cc !important; border-color: #2a0d0a !important;" +
      " box-shadow: 0 0 0 2px " + MOERK_GULD + ", 0 0 0 4px #2a0d0a, 0 10px 24px rgba(0,0,0,.45) !important; }",
    "#chatlog, #chatlog * { color: " + BLAEK + "; }",

    // Panelet til højre (☰ Panel)
    "#panel { background: " + PAPIR + " repeat, #f3e6cc !important; }",
    "#panel .panel-knap, #panel .stor-knap { background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(0,0,0,.14)), " + LYS_TRAE + " center/256px !important;" +
      " color: #fff4dc !important; border: 1px solid #4a2410 !important; text-shadow: 0 1px 1px rgba(0,0,0,.6) !important; font-family: " + SERIF + "; }",

    // Rullebjælker i messing/træ
    V + "#ejer-indhold::-webkit-scrollbar, " + V + "#ejer-faner::-webkit-scrollbar { width: 10px; }",
    V + "#ejer-indhold::-webkit-scrollbar-thumb { background: #b08a4a; border-radius: 5px; border: 2px solid #f3e6cc; }",
    V + "#ejer-faner::-webkit-scrollbar-thumb { background: #c9a35a; border-radius: 5px; border: 2px solid #4a1020; }",
    V + "#ejer-indhold { scrollbar-color: #b08a4a transparent; }",
    V + "#ejer-faner { scrollbar-color: #c9a35a #4a1020; }",
  ].join("\n");

  const stil = document.createElement("style");
  stil.id = "realistisk-ui-stil";
  stil.textContent = css;
  document.head.appendChild(stil);

  // Find vinduerne (også dem, andre scripts laver senere): forælderen til en top-bjælke
  function find(rod) {
    if (!rod.querySelectorAll) return;
    rod.querySelectorAll(TOPPE).forEach(function (top) {
      const v = top.parentElement;
      if (v && v !== document.body && !v.closest("#ejer-vindue")) v.classList.add("rui-vindue");
    });
  }
  find(document);
  new MutationObserver(function (liste) {
    liste.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) find(n.parentElement || n); }); });
  }).observe(document.body, { childList: true, subtree: true });

  // Firefox + file:///: vinrødt-temaet har måske allerede farvet elementerne ét for ét.
  // Farv dem igen nu, så træ, læder og papir kommer frem.
  window.ruiOpfrisk = function () {
    if (typeof vinElementerTil !== "undefined" && vinElementerTil && typeof vinKoeEl === "function")
      document.querySelectorAll("body *").forEach(vinKoeEl);
  };
  setTimeout(window.ruiOpfrisk, 50);
  setTimeout(window.ruiOpfrisk, 1500);
})();
