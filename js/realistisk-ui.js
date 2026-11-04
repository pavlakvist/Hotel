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
  // Lister med spillere/samtaler i panelet: papirkort i stedet for træknapper
  const LISTE_KLASSER = [".an-spillere", "#sp-liste", "#pb-liste", "#pg-liste", "#sb-liste", "#sc-liste", ".ao-liste", ".fd-liste",
    ".pk-liste", ".rap-liste", ".sp-kort-liste", ".sp-chat-liste", ".an-liste", ".an-skilte"];
  const LISTER = LISTE_KLASSER.map(function (k) { return k + " button"; }).join(", " + "#ejer-vindue:not(.moerkt) #ejer-indhold#ejer-indhold ");
  const LISTER_VALGT = LISTE_KLASSER.map(function (k) { return k + " button.valgt"; }).join(", " + "#ejer-vindue:not(.moerkt) #ejer-indhold#ejer-indhold ");
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
    V + "#ejer-indhold button:not(.sc-nat):not([class*='farve']):not([style*='background']) { background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(0,0,0,.12)), " + LYS_TRAE + " center/256px !important;" +
      " color: #fff4dc !important; border: 1px solid #4a2410 !important; border-radius: 5px !important; text-shadow: 0 1px 1px rgba(0,0,0,.6);" +
      " box-shadow: inset 0 1px 0 rgba(255,230,180,.45), 0 2px 3px rgba(0,0,0,.3) !important; }",
    V + "#ejer-indhold button:not(.sc-nat):not([class*='farve']):not([style*='background']):hover { filter: brightness(1.1); }",
    V + "#ejer-indhold button.valgt { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(0,0,0,.12)), " + MESSING + " !important; color: #3a2408 !important; text-shadow: none; }",

    // Spillerlisten: som kort i et kartotek (ikke træknapper)
    V + "#ejer-indhold#ejer-indhold " + LISTER + " { background: linear-gradient(180deg, #fffaf0, #f4e6c8) !important; color: " + BLAEK + " !important;" +
      " border: 1px solid rgba(156,116,48,.55) !important; text-shadow: none !important; font-family: " + SERIF + " !important;" +
      " box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 2px 3px rgba(70,35,10,.15) !important; }",
    V + "#ejer-indhold#ejer-indhold " + LISTER_VALGT + " { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(0,0,0,.1)), " + MESSING + " !important; color: #3a2408 !important; }",
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


    // ----- Lister i panelet: tydelig mørk tekst på papirkort -----
    V + "#ejer-indhold#ejer-indhold " + LISTE_KLASSER.map(function (k) { return k + " button small, " + k + " button span"; }).join(", " + V + "#ejer-indhold#ejer-indhold ") +
      " { color: #6b4a30 !important; text-shadow: none !important; }",

    // ----- Farver, man vælger (banner, boble osv.): vis deres egen farve, ingen træ -----
    ".bs-farver button, .farve-gitter button, .or-farver button, [data-bs-farve] { background-image: none !important; text-shadow: none !important; }",

    // ----- Navigatøren -----
    "#nav-etager { background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.10), rgba(0,0,0,.25) 90%), " + LAEDER + " !important; }",
    "#nav-etager button:not(.hemmelig) { background: linear-gradient(180deg, #fffaf0, #f1e1c0) !important; color: " + BLAEK + " !important; font-family: " + SERIF + " !important;" +
      " border: 1px solid " + MOERK_GULD + " !important; box-shadow: inset 0 1px 0 #fff, 0 2px 4px rgba(0,0,0,.4) !important; }",
    "#nav-etager button.valgt:not(.hemmelig) { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%, rgba(0,0,0,.15)), " + MESSING + " !important; color: #3a2408 !important; }",
    ".nav-kort { background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,250,238,.4)), " + PAPIR + " !important; border: 1px solid " + MOERK_GULD + " !important;" +
      " box-shadow: inset 0 0 0 3px #fbf3e2, inset 0 0 0 4px rgba(216,180,106,.7), 0 3px 8px rgba(70,35,10,.2) !important; }",
    ".nav-kort img { border: 2px solid " + MOERK_GULD + "; box-shadow: 0 0 0 1px #2a0d0a, 0 2px 4px rgba(0,0,0,.35); }",
    ".nav-kort h3, .nav-kort b { font-family: " + SERIF + " !important; color: #5a1626 !important; }",
    ".nav-besoeg { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.18)), " + MESSING + " !important;" +
      " color: #3a2408 !important; border: 1px solid #5e3f12 !important; text-shadow: 0 1px 0 rgba(255,240,200,.7) !important; font-family: " + SERIF + " !important;" +
      " box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 3px rgba(0,0,0,.4) !important; }",
    ".nav-besoeg:disabled, .nav-besoeg.her { background: rgba(255,248,230,.8) !important; color: #7a1d2e !important; box-shadow: inset 0 1px 3px rgba(0,0,0,.2) !important; }",

    // ----- 🚨 Tilkald hjælp: en rød lakeret knap med messingring -----
    "#hjaelp-knap { background: radial-gradient(ellipse at 50% 20%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%), linear-gradient(180deg, #c8202c, #7d0c16) !important;" +
      " color: #fff3e0 !important; border: 2px solid #d8b46a !important; text-shadow: 0 1px 1px rgba(0,0,0,.6) !important; font-family: " + SERIF + " !important;" +
      " box-shadow: 0 0 0 1px #3a1008, inset 0 -2px 3px rgba(0,0,0,.35), 0 3px 6px rgba(0,0,0,.45) !important; }",
    "#hjaelp-knap:active { box-shadow: 0 0 0 1px #3a1008, inset 0 2px 5px rgba(0,0,0,.55) !important; }",

    // ----- ⭐ Glimt og 🔮 Stella: en læderpung med syning og guldtal -----
    "#glimt { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.25)), " + LAEDER + " !important; border: 1px solid #2a0d0a !important;" +
      " box-shadow: inset 0 0 0 2px rgba(0,0,0,.25), 0 0 0 1px " + MOERK_GULD + ", 0 4px 10px rgba(0,0,0,.45) !important; position: fixed; }",
    "#glimt::after { content: ''; position: absolute; inset: 3px; border: 1px dashed rgba(230,190,120,.5); border-radius: inherit; pointer-events: none; }",
    "#glimt .penge, #glimt .penge * { background: transparent !important; }",
    "#glimt b { color: #f3d999 !important; font-family: " + SERIF + " !important; text-shadow: 0 1px 1px rgba(0,0,0,.8) !important; }",
    "#glimt .penge span { color: #f6e3c0 !important; text-shadow: 0 1px 1px rgba(0,0,0,.7) !important; }",

    // ----- Dit portræt: forgyldt billedramme med messing-navneskilt -----
    "#avatar-billede { border: 0 !important; border-radius: 6px !important; padding: 5px !important; width: 84px !important;" +
      " background: linear-gradient(135deg, #f7dc93, #a77a2c 30%, #f3d58a 50%, #8a6020 75%, #e7c27a) !important;" +
      " box-shadow: 0 0 0 1px #3a2408, inset 0 0 0 1px #fff0c0, inset 0 0 0 3px rgba(90,60,15,.6), 0 6px 14px rgba(0,0,0,.5) !important; }",
    "#avatar-billede canvas { background: radial-gradient(ellipse at 50% 35%, #f6ead0, #c9ab7a 85%) !important; border: 1px solid #5e3f12; box-shadow: inset 0 0 10px rgba(60,30,10,.45); border-radius: 2px; }",
    "#avatar-navn { margin-top: 4px; border-radius: 3px; border: 1px solid #5e3f12; font-family: " + SERIF + " !important; color: #3a2408 !important;" +
      " background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.15)), " + MESSING + " !important; text-shadow: 0 1px 0 rgba(255,240,200,.8); }",

    // ----- Spillerkortet / profilen -----
    "#spillerkort .sk-figur { background: radial-gradient(ellipse at 50% 30%, rgba(255,220,170,.35), rgba(0,0,0,.35) 90%), " + LAEDER + " !important;" +
      " border: 2px solid " + MOERK_GULD + " !important; box-shadow: 0 0 0 1px #2a0d0a, inset 0 0 14px rgba(0,0,0,.55) !important; }",
    "#spillerkort .sk-motto { background: #fffaf0 !important; border: 1px solid #b89458 !important; box-shadow: inset 0 2px 3px rgba(80,45,15,.15); font-style: italic; font-family: " + SERIF + "; }",
    "#spillerkort .sk-baand { background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,250,238,.4)), " + PAPIR + " !important; color: " + BLAEK + " !important;" +
      " border: 1px solid " + MOERK_GULD + " !important; border-left-width: 5px !important; font-family: " + SERIF + " !important; box-shadow: 0 2px 4px rgba(70,35,10,.15) !important; }",
    "#spillerkort .sk-likes { border-left-color: #c9a35a !important; }",
    "#spillerkort .sk-medlem { border-left-color: #2f4f73 !important; }",
    "#spillerkort .sk-online { border-left-color: #3f8f3a !important; }",
    "#spillerkort .sk-offline { border-left-color: #8a8070 !important; }",
    "#spillerkort .sk-fd { border-left-color: #c47a2c !important; }",
    "#spillerkort .sk-baand small, #spillerkort .sk-job, #spillerkort .sk-tom, #spillerkort .sk-hvem i { color: #6b4a30 !important; }",
    "#spillerkort .sk-job b { color: #5a1626 !important; }",
    "#spillerkort .sk-forhold { background: rgba(255,250,238,.75) !important; border: 1px solid rgba(156,116,48,.5) !important; border-left: 5px solid #a8324a !important; }",
    "#spillerkort .sk-forhold.sk-smiley, #spillerkort .sk-smiley.sk-forhold { border-left-color: #c9a35a !important; }",
    "#spillerkort .sk-hjerte:not(.sk-forhold), #spillerkort .sk-smiley:not(.sk-forhold) { background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.15)), " + MESSING + " !important; color: #3a2408 !important; border: 1px solid #5e3f12 !important; }",

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

  // ----- Grøn tekst, der er svær at læse, bliver mørkebrun -----
  // (grågrønne farver, som vinrødt-temaet ikke fanger; den klare "online"-grøn bliver)
  function groenGraa(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, f = mx - mn;
    if (f < 0.03) return false;
    const sat = f / (1 - Math.abs(2 * l - 1));
    let hue = mx === r ? ((g - b) / f) % 6 : mx === g ? (b - r) / f + 2 : (r - g) / f + 4;
    hue = (hue * 60 + 360) % 360;
    if (hue < 65 || hue > 180) return false;
    if (sat > 0.45 && l > 0.3 && l < 0.65) return false;     // klar grøn (online-prik o.l.)
    return true;
  }
  const tekstSet = new WeakMap();
  function tjekTekst(el) {
    if (el.nodeType !== 1 || el.closest("canvas, .bs-farver, .farve-gitter, .or-farver")) return;
    let harTekst = false;
    for (let n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { harTekst = true; break; }
    if (!harTekst) return;
    if (tekstSet.get(el) === "sat") el.style.removeProperty("color");
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(el).color);
    if (m && groenGraa(+m[1], +m[2], +m[3])) {
      const lys = (+m[1] + +m[2] + +m[3]) / 3;
      el.style.setProperty("color", lys < 90 ? "#3a1d14" : "#6b4a30", "important");
      tekstSet.set(el, "sat");
    }
  }
  let tekstKoe = new Set(), tekstVenter = false;
  function koeTekst(el) {
    tekstKoe.add(el);
    if (!tekstVenter) { tekstVenter = true; setTimeout(tomTekst, 120); }
  }
  function tomTekst() {
    tekstVenter = false;
    const liste = Array.from(tekstKoe); tekstKoe.clear();
    liste.forEach(function (el) { if (el.isConnected) { tjekTekst(el); el.querySelectorAll("*").forEach(tjekTekst); } });
  }
  koeTekst(document.body);
  new MutationObserver(function (liste) {
    liste.forEach(function (m) {
      if (m.type === "attributes") { if (m.target.nodeType === 1) koeTekst(m.target); return; }
      m.addedNodes.forEach(function (n) { if (n.nodeType === 1) koeTekst(n); else if (n.parentElement) koeTekst(n.parentElement); });
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });

  // ----- Dit portræt bevæger sig: det følger din figur -----
  // Går du, går den også. Står du stille, trækker den vejret, kigger lidt rundt
  // og viser dine ansigtsudtryk og vink.
  (function () {
    const boks = document.getElementById("avatar-billede");
    if (!boks || typeof tegnMenneske !== "function") return;
    const gammel = boks.querySelector("canvas");
    const c = document.createElement("canvas");
    c.width = 140; c.height = 140;
    if (gammel) gammel.replaceWith(c); else boks.prepend(c);    // det gamle billede tegnes nu ingen steder
    const kig = ["ned", "ned", "ned-hoejre", "ned", "ned", "ned-venstre"];
    function tegn() {
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      const nu = performance.now() / 1000;
      const gaar = typeof figur !== "undefined" && figur.rute && figur.rute.length > 0 && !figur.sidde;
      const pose = garderobe && garderobe.pose;
      let retning = "ned", trin = null;
      if (gaar) {
        retning = /^op/.test(figur.retning) ? "ned" + figur.retning.slice(2) : figur.retning;   // ansigtet mod os
        trin = (typeof figur.trin === "number" ? figur.trin : nu * 8);
      } else if (!pose) {
        retning = kig[Math.floor(nu / 2.5) % kig.length];
      }
      const h = figurHoejde(garderobe);
      const sk = 2.6;
      const aande = gaar ? 0 : Math.sin(nu * 2.2) * 0.012;     // vejrtrækning
      const hop = gaar ? Math.abs(Math.sin(nu * 9)) * 3 : 0;    // lille hop, når den går
      g.save();
      g.translate(c.width / 2, 4 + h * sk - hop);
      g.scale(sk, sk * (1 + aande));
      try { tegnMenneske(g, 0, 0, garderobe, retning, trin, null); }
      catch (e) { try { tegnMenneske(g, 0, 0, garderobe, "ned", null, null); } catch (e2) {} }
      g.restore();
      const navn = document.getElementById("avatar-navn");
      if (navn && navn.textContent !== FIGUR.navn) navn.textContent = FIGUR.navn;
    }
    let sidst = 0;
    (function loop(t) {
      if (t - sidst > 70) { sidst = t; tegn(); }       // ca. 14 billeder i sekundet
      requestAnimationFrame(loop);
    })(0);
  })();

  // ----- Talebobler: blød skygge og lidt glans, så de ligner rigtige skilte -----
  if (typeof tegnEnBoble === "function" && typeof rundRamme === "function") {
    const boble = tegnEnBoble;
    tegnEnBoble = function (c, bo, x, y, hale) {
      c.save();
      c.shadowColor = "rgba(40,15,5,0.35)";
      c.shadowBlur = 8;
      c.shadowOffsetY = 3;
      rundRamme(c, x, y, bo.b, bo.h, 9);
      c.fillStyle = bo.stil && bo.stil.farve || "#fcf2e9";
      c.fill();
      c.restore();
      boble(c, bo, x, y, hale);
      c.save();
      rundRamme(c, x + 1, y + 1, bo.b - 2, bo.h - 2, 8);
      c.clip();
      const gl = c.createLinearGradient(0, y, 0, y + bo.h);
      gl.addColorStop(0, "rgba(255,255,255,0.2)");
      gl.addColorStop(0.45, "rgba(255,255,255,0.05)");
      gl.addColorStop(1, "rgba(0,0,0,0.07)");
      c.fillStyle = gl;
      c.fillRect(x, y, bo.b, bo.h);
      c.restore();
    };
  }
})();
