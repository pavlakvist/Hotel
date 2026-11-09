// =============================================================
//  📱 Telefonen — vennelisten og beskederne er nu en mobiltelefon
//  Venne-knappen i chatbaren åbner telefonen:
//    låseskærm → hjemmeskærm med apps (Beskeder, Kontakter, Rum,
//    Shop, Kamera, Fotos, Events, Noter, Mine ting, Indstillinger).
//  I Indstillinger kan du skifte telefonens farve og baggrund.
//  Valgene huskes for hver spiller (mit-hotel-telefon-<navn>).
//  Venner/beskeder bruger den gamle kode (venner.js, beskeder.js,
//  rigtige-venner.js), så rigtige spillere virker som før.
//  Hentes fra js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.telefonKlar) return;
  window.telefonKlar = true;

  // ---------------------------------------------------------------
  //  Farver på telefonen  [lys, mellem, mørk, accent]
  // ---------------------------------------------------------------
  const TLF_FARVER = [
    { id: "rosa",     navn: "Rosa guld",   k: ["#f8dcd3", "#e3b0a2", "#a8746a"], a: "#d4768a" },
    { id: "lyseroed", navn: "Lyserød",     k: ["#ffd6e6", "#f2a4c3", "#b9628a"], a: "#e0538f" },
    { id: "lilla",    navn: "Lilla",       k: ["#e6d6f7", "#b99ae0", "#7552a6"], a: "#8a5cd1" },
    { id: "lavendel", navn: "Lavendel",    k: ["#eef0ff", "#c3c8ee", "#7f86bf"], a: "#6f78d6" },
    { id: "blaa",     navn: "Himmelblå",   k: ["#d9ecff", "#9cc6ee", "#4f7fae"], a: "#3a86d8" },
    { id: "midnat",   navn: "Midnatsblå",  k: ["#6d7c95", "#33405a", "#151c2b"], a: "#4a6fb3" },
    { id: "groen",    navn: "Salviegrøn",  k: ["#e0ecd9", "#a9c49c", "#5f7d54"], a: "#4f9a62" },
    { id: "gul",      navn: "Smørgul",     k: ["#fff6cf", "#f2dc85", "#b39a3c"], a: "#d1a21e" },
    { id: "roed",     navn: "Rød",         k: ["#ff9a9a", "#d83a3a", "#7c1414"], a: "#d23a3a" },
    { id: "vin",      navn: "Vinrød",      k: ["#c97a86", "#8a2a3e", "#43101c"], a: "#a3324a" },
    { id: "guld",     navn: "Guld",        k: ["#fff1c9", "#e2c27a", "#9c7a32"], a: "#c49a3c" },
    { id: "soelv",    navn: "Sølv",        k: ["#ffffff", "#d3d6db", "#8d939c"], a: "#5d8bd6" },
    { id: "hvid",     navn: "Hvid",        k: ["#ffffff", "#f1efec", "#c4c0ba"], a: "#e0538f" },
    { id: "sort",     navn: "Sort titan",  k: ["#7a7a7e", "#3a3a3d", "#151516"], a: "#e0538f" },
  ];

  // ---------------------------------------------------------------
  //  Baggrunde (tegnet med SVG, så de er skarpe i alle størrelser)
  // ---------------------------------------------------------------
  function svg(indhold) {
    return "url(\"data:image/svg+xml," + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 650' preserveAspectRatio='xMidYMid slice'>" + indhold + "</svg>") + "\")";
  }
  function stjerner(antal, frø, maksY) {
    let s = "", x = frø;
    for (let i = 0; i < antal; i++) {
      x = (x * 9301 + 49297) % 233280;
      const px = (x / 233280) * 300;
      x = (x * 9301 + 49297) % 233280;
      const py = (x / 233280) * maksY;
      const r = (i % 7 === 0) ? 1.4 : (i % 3 === 0 ? 0.9 : 0.5);
      s += "<circle cx='" + px.toFixed(1) + "' cy='" + py.toFixed(1) + "' r='" + r + "' fill='#fff' opacity='" + (0.4 + (i % 5) / 8) + "'/>";
    }
    return s;
  }
  function by(farve, y) {
    // en lille by-silhuet med oplyste vinduer
    const huse = [[0, 60, 40], [38, 90, 30], [66, 45, 36], [100, 120, 26], [124, 70, 34], [156, 100, 24], [178, 55, 40], [216, 140, 30], [244, 80, 28], [270, 110, 30]];
    let s = "";
    huse.forEach(function (h, i) {
      s += "<rect x='" + h[0] + "' y='" + (y - h[1]) + "' width='" + h[2] + "' height='" + (h[1] + 2) + "' fill='" + farve + "'/>";
      for (let vy = y - h[1] + 8; vy < y - 8; vy += 12)
        for (let vx = h[0] + 5; vx < h[0] + h[2] - 6; vx += 9)
          if ((vx * 7 + vy * 3 + i) % 5 < 2) s += "<rect x='" + vx + "' y='" + vy + "' width='4' height='5' fill='#ffd88a' opacity='.85'/>";
    });
    return s;
  }
  const BAGGRUNDE = [
    { id: "solnedgang", navn: "Solnedgang", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3b2a5c'/><stop offset='.45' stop-color='#9c5a8f'/><stop offset='.62' stop-color='#f2a07b'/><stop offset='.7' stop-color='#ffd39a'/></linearGradient>" +
      "<linearGradient id='v' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#c7789a'/><stop offset='1' stop-color='#3b2a5c'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" + stjerner(40, 7, 200) +
      "<circle cx='150' cy='455' r='46' fill='#ffe2a8' opacity='.95'/>" + by("#4a2f55", 470) +
      "<rect y='468' width='300' height='182' fill='url(#v)'/>" +
      "<rect x='112' y='480' width='76' height='3' fill='#ffe2a8' opacity='.6'/><rect x='124' y='494' width='52' height='3' fill='#ffe2a8' opacity='.45'/><rect x='136' y='508' width='28' height='2' fill='#ffe2a8' opacity='.3'/>") },
    { id: "nat", navn: "Stjernenat", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#050816'/><stop offset='.7' stop-color='#1b2a5a'/><stop offset='1' stop-color='#2f4a86'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" + stjerner(140, 3, 560) +
      "<circle cx='220' cy='130' r='34' fill='#fdf3d0'/><circle cx='236' cy='120' r='30' fill='#0a1024'/>" +
      "<path d='M0 600 Q80 540 160 580 T300 560 V650 H0z' fill='#0b1230'/>") },
    { id: "hav", navn: "Hav", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9fe0ff'/><stop offset='.45' stop-color='#e8f8ff'/><stop offset='.46' stop-color='#2aa3c9'/><stop offset='1' stop-color='#0a4b78'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" +
      "<path d='M0 360 Q37 350 75 360 T150 360 T225 360 T300 360 V400 H0z' fill='#3bb7d9' opacity='.6'/>" +
      "<path d='M0 430 Q37 418 75 430 T150 430 T225 430 T300 430 V480 H0z' fill='#1e8ab5' opacity='.6'/>" +
      "<path d='M0 520 Q37 505 75 520 T150 520 T225 520 T300 520 V650 H0z' fill='#0d5f8f' opacity='.7'/>" +
      "<circle cx='60' cy='120' r='26' fill='#fff7c2'/>") },
    { id: "skyer", navn: "Rosa skyer", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffc6dd'/><stop offset='1' stop-color='#c9b6ff'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" +
      "<g fill='#fff' opacity='.85'><ellipse cx='70' cy='160' rx='70' ry='26'/><ellipse cx='110' cy='145' rx='45' ry='28'/>" +
      "<ellipse cx='230' cy='320' rx='80' ry='28'/><ellipse cx='200' cy='305' rx='42' ry='26'/>" +
      "<ellipse cx='60' cy='500' rx='90' ry='30'/><ellipse cx='100' cy='482' rx='50' ry='30'/></g>") },
    { id: "skov", navn: "Skov", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#d6f0e0'/><stop offset='1' stop-color='#f6f1d0'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" +
      "<path d='M0 380 Q75 300 150 360 T300 330 V650 H0z' fill='#9cc79a'/>" +
      "<path d='M0 460 Q90 390 190 450 T300 420 V650 H0z' fill='#6fa771'/>" +
      "<path d='M0 540 Q100 480 200 540 T300 520 V650 H0z' fill='#3f7a4a'/>" +
      "<g fill='#2d5c36'><path d='M40 560 l18 -60 18 60z'/><path d='M230 548 l14 -50 14 50z'/><path d='M260 560 l16 -58 16 58z'/></g>") },
    { id: "hotel", navn: "Hotel guld", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#5a1626'/><stop offset='1' stop-color='#2a0a12'/></linearGradient>" +
      "<pattern id='p' width='30' height='30' patternUnits='userSpaceOnUse'><path d='M15 0 L30 15 L15 30 L0 15z' fill='none' stroke='#c9a24a' stroke-width='.6' opacity='.45'/></pattern></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/><rect width='300' height='650' fill='url(#p)'/>" +
      "<circle cx='150' cy='330' r='70' fill='none' stroke='#e0c27a' stroke-width='2'/>" +
      "<text x='150' y='322' font-family='Georgia,serif' font-size='26' fill='#f0d79a' text-anchor='middle'>HELLO</text>" +
      "<text x='150' y='352' font-family='Georgia,serif' font-size='26' fill='#f0d79a' text-anchor='middle'>VERA</text>") },
    { id: "galakse", navn: "Galakse", b: svg(
      "<defs><radialGradient id='g' cx='.4' cy='.45' r='.7'><stop offset='0' stop-color='#ff8ad8'/><stop offset='.3' stop-color='#7a3cc9'/><stop offset='.7' stop-color='#1a1050'/><stop offset='1' stop-color='#05040f'/></radialGradient></defs>" +
      "<rect width='300' height='650' fill='url(#g)'/>" + stjerner(160, 11, 650) +
      "<ellipse cx='130' cy='300' rx='140' ry='30' fill='#ffd1f3' opacity='.18' transform='rotate(-30 130 300)'/>") },
    { id: "blomster", navn: "Blomster", b: svg(
      "<rect width='300' height='650' fill='#ffe9f0'/>" +
      [[50, 90], [200, 160], [110, 290], [250, 380], [40, 470], [170, 560], [270, 620], [120, 40]].map(function (p, i) {
        const f = ["#ff8fb3", "#ffb36b", "#c49bff", "#ff6f8f"][i % 4];
        let s = "<g transform='translate(" + p[0] + " " + p[1] + ")'>";
        for (let k = 0; k < 6; k++) s += "<ellipse rx='10' ry='20' cy='-16' fill='" + f + "' opacity='.85' transform='rotate(" + (k * 60) + ")'/>";
        return s + "<circle r='8' fill='#ffe07a'/></g>";
      }).join("")) },
    { id: "bjerge", navn: "Bjerge", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffb38a'/><stop offset='.5' stop-color='#ffe0b5'/><stop offset='1' stop-color='#ffe0b5'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/><circle cx='150' cy='300' r='40' fill='#fff2d6'/>" +
      "<path d='M-20 420 L70 290 L140 380 L210 270 L320 420 V650 H-20z' fill='#b07a8f'/>" +
      "<path d='M70 290 L90 318 L58 316z M210 270 L232 300 L192 298z' fill='#fff'/>" +
      "<path d='M-20 500 L60 400 L150 480 L240 390 L320 470 V650 H-20z' fill='#7d5470'/>" +
      "<path d='M-20 570 L90 500 L180 560 L320 520 V650 H-20z' fill='#4b3350'/>") },
    { id: "hjerter", navn: "Hjerter", b: svg(
      "<rect width='300' height='650' fill='#ffd1e1'/>" +
      [[40, 60], [160, 120], [260, 70], [90, 220], [220, 260], [40, 380], [150, 420], [260, 480], [80, 560], [200, 610]].map(function (p, i) {
        const st = 0.8 + (i % 3) * 0.35;
        return "<path transform='translate(" + p[0] + " " + p[1] + ") scale(" + st + ")' d='M0 8 C-14 -4 -10 -16 0 -9 C10 -16 14 -4 0 8z' fill='" + (i % 2 ? "#ff6f9c" : "#ff9bbd") + "'/>";
      }).join("")) },
    { id: "nordlys", navn: "Nordlys", b: svg(
      "<defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#04101c'/><stop offset='1' stop-color='#0c2a3a'/></linearGradient>" +
      "<linearGradient id='n' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#7dffc4' stop-opacity='0'/><stop offset='.6' stop-color='#3fe0a0' stop-opacity='.7'/><stop offset='1' stop-color='#3fe0a0' stop-opacity='0'/></linearGradient></defs>" +
      "<rect width='300' height='650' fill='url(#h)'/>" + stjerner(80, 5, 400) +
      "<path d='M-20 260 Q60 140 140 240 T320 200 L320 330 Q220 280 140 350 T-20 360z' fill='url(#n)'/>" +
      "<path d='M-20 320 Q90 230 180 300 T320 280 L320 360 Q200 330 120 390 T-20 400z' fill='url(#n)' opacity='.6'/>" +
      "<path d='M0 600 L50 540 L90 580 L140 520 L200 590 L250 540 L300 590 V650 H0z' fill='#020a12'/>") },
    { id: "sort", navn: "Sort", b: "linear-gradient(160deg, #2a2a2e, #050506)" },
  ];

  // ---------------------------------------------------------------
  //  Små ikoner (tegnet som SVG — ikke Apples)
  // ---------------------------------------------------------------
  const IK = {
    besked: "<path d='M12 3C6.5 3 2 6.6 2 11c0 2.5 1.4 4.7 3.6 6.1L4.6 21l4.3-2.2c1 .3 2 .4 3.1.4 5.5 0 10-3.6 10-8S17.5 3 12 3z' fill='#fff'/>",
    kontakt: "<circle cx='12' cy='8.5' r='4.2' fill='#fff'/><path d='M3.5 20.5c0-4.2 3.8-7 8.5-7s8.5 2.8 8.5 7z' fill='#fff'/>",
    rum: "<path d='M3 11.3 12 4l9 7.3V20a1 1 0 0 1-1 1h-5.3v-5.6H9.3V21H4a1 1 0 0 1-1-1z' fill='#fff'/>",
    shop: "<path d='M5.5 8.5h13l-1.1 12H6.6z' fill='#fff'/><path d='M9 9V6.8a3 3 0 0 1 6 0V9' fill='none' stroke='#fff' stroke-width='1.8'/>",
    kamera: "<rect x='2.5' y='7' width='19' height='13' rx='3' fill='#fff'/><path d='M8 7l1.5-2.5h5L16 7z' fill='#fff'/><circle cx='12' cy='13.5' r='4' fill='#4a4a50'/><circle cx='12' cy='13.5' r='2.4' fill='#8a8f9a'/>",
    fotos: "<rect x='3' y='4.5' width='18' height='15' rx='2.5' fill='#fff'/><path d='M4.5 18l5-6 3.5 4 2.5-3 4 5z' fill='#5aa0e0'/><circle cx='16' cy='9' r='1.8' fill='#ffc24a'/>",
    noter: "<rect x='4.5' y='3' width='15' height='18' rx='2' fill='#fff'/><path d='M7.5 8h9M7.5 11.5h9M7.5 15h6' stroke='#d6b23a' stroke-width='1.4'/>",
    lager: "<path d='M3 9.5 12 5l9 4.5v9.5L12 21.5 3 19z' fill='#fff'/><path d='M3 9.5 12 14l9-4.5M12 14v7.5' stroke='#b7864a' stroke-width='1.3' fill='none'/>",
    gear: "<circle cx='12' cy='12' r='7.6' fill='none' stroke='#fff' stroke-width='3.6' stroke-dasharray='2.6 2.37'/><circle cx='12' cy='12' r='5.6' fill='#fff'/><circle cx='12' cy='12' r='2.4' fill='#7d838d'/>",
    tilbage: "<path d='M15 4 7 12l8 8' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/>",
    send: "<path d='M12 19V6M6.5 11.5 12 6l5.5 5.5' fill='none' stroke='#fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/>",
    laas: "<rect x='5' y='10.5' width='14' height='10.5' rx='2.4' fill='currentColor'/><path d='M8 10.5V7.5a4 4 0 0 1 8 0v3' fill='none' stroke='currentColor' stroke-width='2.2'/>",
    lygte: "<path d='M8 3h8v4l-2 3v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L8 7z' fill='currentColor'/>",
    soeg: "<circle cx='10.5' cy='10.5' r='6' fill='none' stroke='currentColor' stroke-width='2'/><path d='M15 15l5 5' stroke='currentColor' stroke-width='2.2' stroke-linecap='round'/>",
    skriv: "<path d='M4 20h4L19 9l-4-4L4 16z' fill='none' stroke='currentColor' stroke-width='2' stroke-linejoin='round'/>",
    skrald: "<path d='M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linejoin='round'/>",
    gaa: "<path d='M5 12h13M13 6l6 6-6 6' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>",
  };
  function ik(navn, str) { return "<svg viewBox='0 0 24 24' width='" + (str || 24) + "' height='" + (str || 24) + "' aria-hidden='true'>" + IK[navn] + "</svg>"; }

  const APPS = {
    beskeder:  { navn: "Beskeder",      ik: "besked",  bg: "linear-gradient(#6ee67e, #22b43c)" },
    kontakter: { navn: "Kontakter",     ik: "kontakt", bg: "linear-gradient(#c4a2ff, #8152e0)" },
    rum:       { navn: "Rum",           ik: "rum",     bg: "linear-gradient(#ffb36b, #f07a2e)" },
    shop:      { navn: "Shop",          ik: "shop",    bg: "linear-gradient(#ff8fb8, #e0447e)" },
    kamera:    { navn: "Kamera",        ik: "kamera",  bg: "linear-gradient(#9aa0aa, #4c515a)" },
    fotos:     { navn: "Fotos",         ik: "fotos",   bg: "linear-gradient(#ffffff, #e7ebf1)", moerk: true },
    events:    { navn: "Events",        ik: null,      bg: "#fff" },
    noter:     { navn: "Noter",         ik: "noter",   bg: "linear-gradient(#ffe57a, #f5c42c)" },
    lager:     { navn: "Mine ting",     ik: "lager",   bg: "linear-gradient(#d9a868, #9c6a32)" },
    indst:     { navn: "Indstillinger", ik: "gear",    bg: "linear-gradient(#a8aeb8, #6b717b)" },
  };
  const GITTER = ["shop", "kamera", "fotos", "events", "noter", "lager"];
  const DOCK = ["beskeder", "kontakter", "rum", "indst"];

  // ---------------------------------------------------------------
  //  Hjælpere
  // ---------------------------------------------------------------
  function esc(t) {
    return typeof tegnTilHtml === "function" ? tegnTilHtml(t) : String(t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; });
  }
  function mig() { return (typeof FIGUR !== "undefined" && FIGUR.navn) || "gæst"; }
  const DAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MDR = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
  function kl(t) { const d = t ? new Date(t) : new Date(); return ("0" + d.getHours()).slice(-2) + "." + ("0" + d.getMinutes()).slice(-2); }
  function dato(d) { d = d || new Date(); return DAGE[d.getDay()] + " " + d.getDate() + ". " + MDR[d.getMonth()]; }
  function naarTekst(t) {
    const d = new Date(t), nu = new Date();
    if (d.toDateString() === nu.toDateString()) return kl(t);
    const i_gaar = new Date(nu); i_gaar.setDate(nu.getDate() - 1);
    if (d.toDateString() === i_gaar.toDateString()) return "I går";
    return d.getDate() + "/" + (d.getMonth() + 1);
  }

  // Indstillinger gemmes for hver spiller
  function noegle() { return "mit-hotel-telefon-" + mig(); }
  let ind = { farve: "rosa", baggrund: "solnedgang", lyd: true, laas: true, eget: null };
  function hentInd() {
    try {
      const g = JSON.parse(localStorage.getItem(noegle()) || localStorage.getItem("mit-hotel-telefon") || "null");
      if (g) Object.assign(ind, g);
    } catch (e) {}
  }
  function gemInd() {
    try { localStorage.setItem(noegle(), JSON.stringify(ind)); } catch (e) {}
    try { localStorage.setItem("mit-hotel-telefon", JSON.stringify({ farve: ind.farve, baggrund: ind.baggrund })); } catch (e) {}
  }
  hentInd();
  let noter = "";
  try { noter = localStorage.getItem("mit-hotel-telefon-noter-" + mig()) || ""; } catch (e) {}

  // ---------------------------------------------------------------
  //  Stil (alle farver går gennem var(), så hotellets farve-temaer
  //  ikke farver telefonen om)
  // ---------------------------------------------------------------
  const stil = document.createElement("style");
  stil.id = "telefon-stil";
  stil.textContent = [
    "#telefon { --t-sort: #0b0b0d; --t-hvid: #ffffff; --t-lys: #f4f2f5; --t-linje: rgba(60,60,67,.14); --t-graa: #8a8a8f; --t-tekst: #1c1c1e; --t-rod: #ff3b30; --t-on: #34c759;" +
      " position: fixed; z-index: 40; left: 0; top: 0; width: 300px; height: 620px; transform-origin: 0 0; font: 14px -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: var(--t-tekst); user-select: none; -webkit-user-select: none; }",
    "#telefon[hidden] { display: none !important; }",
    "#telefon.tlf-ind { animation: tlfInd .38s cubic-bezier(.2,.9,.3,1.15); }",
    "@keyframes tlfInd { from { transform: translateY(60px) scale(var(--t-s,1)); opacity: 0; } to { transform: translateY(0) scale(var(--t-s,1)); opacity: 1; } }",
    "#telefon.tlf-vib { animation: tlfVib .5s linear; }",
    "@keyframes tlfVib { 0%,100% { margin-left: 0 } 10%,30%,50%,70% { margin-left: -3px } 20%,40%,60%,80% { margin-left: 3px } }",
    // Selve telefonen: metalkant med lys og skygge
    ".tlf-krop { position: absolute; inset: 0; border-radius: 52px; padding: 5px; cursor: grab;" +
      " background: linear-gradient(135deg, var(--t-k1) 0%, var(--t-k2) 38%, var(--t-k3) 62%, var(--t-k2) 82%, var(--t-k1) 100%);" +
      " box-shadow: 0 30px 60px -10px var(--t-skygge), 0 12px 24px -8px var(--t-skygge), inset 0 0 0 1px var(--t-glans), inset 0 2px 3px var(--t-glans), inset 0 -2px 4px var(--t-skygge2); }",
    ".tlf-krop.traek { cursor: grabbing; }",
    ".tlf-kant { position: absolute; inset: 5px; border-radius: 47px; background: var(--t-sort); padding: 7px; box-shadow: inset 0 0 0 1px var(--t-kant), inset 0 0 0 2.5px var(--t-sort); }",
    ".tlf-knap { position: absolute; width: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--t-k3), var(--t-k1), var(--t-k2)); box-shadow: 0 1px 2px var(--t-skygge2); cursor: pointer; }",
    ".tlf-knap.v { left: -3px; } .tlf-knap.h { right: -3px; }",
    ".tlf-knap:active { transform: scaleX(.6); }",
    ".tlf-skaerm { position: absolute; inset: 7px; border-radius: 41px; overflow: hidden; background: var(--t-sort); cursor: default; isolation: isolate; }",
    ".tlf-skaerm::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 50; border-radius: inherit; background: linear-gradient(118deg, var(--t-refl) 0%, transparent 32%, transparent 70%, var(--t-refl2) 100%); }",
    ".tlf-bg { position: absolute; inset: -2px; background-size: cover; background-position: center; transition: filter .35s, transform .35s; }",
    ".tlf-bg.slor { filter: blur(14px) brightness(.8) saturate(1.2); transform: scale(1.1); }",
    // Øen foroven med kameraet
    ".tlf-oe { position: absolute; z-index: 60; top: 10px; left: 50%; width: 92px; height: 27px; margin-left: -46px; border-radius: 20px; background: var(--t-sort); }",
    ".tlf-oe::after { content: ''; position: absolute; right: 12px; top: 8px; width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, var(--t-linse1) 0 18%, var(--t-linse2) 30%, var(--t-sort) 70%); }",
    // Statuslinjen
    ".tlf-status { position: absolute; z-index: 55; top: 0; left: 0; right: 0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 4px 26px 0 30px; font-weight: 600; font-size: 14px; color: var(--t-hvid); pointer-events: none; transition: color .25s; }",
    ".tlf-status.moerk { color: var(--t-tekst); }",
    ".tlf-status .hoejre { display: flex; gap: 5px; align-items: center; }",
    ".tlf-status svg { display: block; }",
    // Låseskærm
    ".tlf-laas { position: absolute; inset: 0; z-index: 20; color: var(--t-hvid); text-align: center; transition: transform .45s cubic-bezier(.3,.8,.3,1), opacity .45s; cursor: pointer; }",
    ".tlf-laas.vaek { transform: translateY(-100%); opacity: 0; pointer-events: none; }",
    ".tlf-laas .hl { margin-top: 56px; display: inline-block; opacity: .95; }",
    ".tlf-laas .tid { font-size: 76px; font-weight: 600; letter-spacing: -2px; line-height: 1; margin-top: 6px; text-shadow: 0 2px 12px var(--t-skygge2); font-variant-numeric: tabular-nums; }",
    ".tlf-laas .dag { font-size: 17px; font-weight: 500; margin-top: 4px; text-shadow: 0 1px 6px var(--t-skygge2); }",
    ".tlf-laas .notis { margin: 26px 12px 0; text-align: left; }",
    ".tlf-notis { display: flex; gap: 9px; align-items: center; padding: 10px 12px; border-radius: 20px; background: var(--t-glas); backdrop-filter: blur(18px) saturate(1.6); -webkit-backdrop-filter: blur(18px) saturate(1.6); color: var(--t-tekst); box-shadow: 0 4px 14px var(--t-skygge2); margin-bottom: 7px; }",
    ".tlf-notis .ai { flex: none; width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; }",
    ".tlf-notis .ai svg { width: 22px; height: 22px; }",
    ".tlf-notis .nt { flex: 1; min-width: 0; font-size: 13px; line-height: 1.25; }",
    ".tlf-notis .nt b { display: flex; justify-content: space-between; font-size: 13px; }",
    ".tlf-notis .nt b small { font-weight: 400; color: var(--t-graa); }",
    ".tlf-notis .nt span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-laas .bund { position: absolute; left: 0; right: 0; bottom: 34px; display: flex; justify-content: space-between; padding: 0 34px; align-items: center; }",
    ".tlf-rund { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--t-moerkglas); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: var(--t-hvid); border: 0; cursor: pointer; }",
    ".tlf-rund.taendt { background: var(--t-hvid); color: var(--t-sort); }",
    ".tlf-laas .stryg { position: absolute; left: 0; right: 0; bottom: 98px; font-size: 13px; opacity: .85; animation: tlfPuls 2.4s ease-in-out infinite; text-shadow: 0 1px 4px var(--t-skygge2); }",
    "@keyframes tlfPuls { 0%,100% { opacity: .45; transform: translateY(0) } 50% { opacity: .95; transform: translateY(-4px) } }",
    // Hjemmeskærm
    ".tlf-hjem { position: absolute; inset: 0; z-index: 10; padding: 54px 16px 0; transition: transform .35s, opacity .35s; }",
    ".tlf-hjem.bag { transform: scale(.9); opacity: 0; pointer-events: none; }",
    ".tlf-widget { margin: 4px 4px 14px; padding: 12px 14px; border-radius: 22px; background: var(--t-moerkglas); backdrop-filter: blur(18px) saturate(1.5); -webkit-backdrop-filter: blur(18px) saturate(1.5); color: var(--t-hvid); }",
    ".tlf-widget .w1 { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .8; }",
    ".tlf-widget .w2 { font-size: 30px; font-weight: 600; margin: 2px 0; font-variant-numeric: tabular-nums; }",
    ".tlf-widget .w3 { font-size: 12px; opacity: .92; display: flex; justify-content: space-between; gap: 6px; }",
    ".tlf-gitter { display: grid; grid-template-columns: repeat(4, 1fr); row-gap: 14px; }",
    ".tlf-app-ik { display: flex; flex-direction: column; align-items: center; gap: 5px; background: none; border: 0; padding: 0; cursor: pointer; color: var(--t-hvid); font: 11px -apple-system, 'Segoe UI', sans-serif; text-shadow: 0 1px 3px var(--t-skygge2); position: relative; }",
    ".tlf-app-ik .fl { width: 54px; height: 54px; border-radius: 14px; display: grid; place-items: center; box-shadow: 0 2px 6px var(--t-skygge3), inset 0 1px 0 var(--t-glans2); transition: transform .12s, filter .12s; }",
    ".tlf-app-ik .fl svg { width: 32px; height: 32px; filter: drop-shadow(0 1px 1px var(--t-skygge3)); }",
    ".tlf-app-ik:active .fl { transform: scale(.88); filter: brightness(.8); }",
    ".tlf-app-ik .tal { position: absolute; top: -5px; right: 2px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: var(--t-rod); color: var(--t-hvid); font-size: 12px; font-weight: 600; line-height: 20px; text-shadow: none; box-sizing: border-box; }",
    ".tlf-kal { display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 14px; overflow: hidden; color: var(--t-tekst); text-shadow: none; }",
    ".tlf-kal i { font-style: normal; font-size: 9px; font-weight: 600; color: var(--t-rod); text-transform: uppercase; padding-top: 5px; }",
    ".tlf-kal b { font-size: 26px; font-weight: 400; line-height: 1; }",
    ".tlf-prikker { display: flex; justify-content: center; gap: 7px; position: absolute; left: 0; right: 0; bottom: 122px; }",
    ".tlf-prikker i { width: 7px; height: 7px; border-radius: 50%; background: var(--t-hvid); opacity: .45; } .tlf-prikker i:first-child { opacity: 1; }",
    ".tlf-dock { position: absolute; left: 10px; right: 10px; bottom: 22px; padding: 12px 8px; border-radius: 32px; background: var(--t-dock); backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6); display: grid; grid-template-columns: repeat(4, 1fr); }",
    ".tlf-dock .tlf-app-ik span.nv { display: none; }",
    // Hjemme-linjen nederst
    ".tlf-hjemlinje { position: absolute; z-index: 58; bottom: 7px; left: 50%; width: 120px; height: 5px; margin-left: -60px; border-radius: 3px; background: var(--t-hvid); cursor: pointer; opacity: .9; }",
    ".tlf-hjemlinje.moerk { background: var(--t-tekst); }",
    ".tlf-hjemlinje::before { content: ''; position: absolute; inset: -10px -10px; }",
    // Apps
    ".tlf-app { position: absolute; inset: 0; z-index: 30; background: var(--t-lys); display: flex; flex-direction: column; animation: tlfApp .3s cubic-bezier(.2,.9,.3,1); }",
    "@keyframes tlfApp { from { transform: scale(.6); opacity: 0; border-radius: 40px; } to { transform: scale(1); opacity: 1; } }",
    ".tlf-app.ud { animation: tlfAppUd .22s ease-in forwards; }",
    "@keyframes tlfAppUd { to { transform: scale(.6); opacity: 0; } }",
    ".tlf-top { flex: none; padding: 48px 12px 8px; display: flex; align-items: center; gap: 6px; background: var(--t-topbg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--t-linje); }",
    ".tlf-top h3 { flex: 1; margin: 0; font-size: 17px; font-weight: 600; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-top .ti { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }",
    ".tlf-top .ti b { font-size: 14px; font-weight: 600; } .tlf-top .ti small { font-size: 11px; color: var(--t-graa); }",
    ".tlf-tb { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border: 0; background: none; color: var(--t-acc); cursor: pointer; border-radius: 50%; padding: 0; }",
    ".tlf-tb:hover { background: var(--t-hover); }",
    ".tlf-stor { padding: 2px 16px 8px; font-size: 30px; font-weight: 700; letter-spacing: -.5px; }",
    ".tlf-indhold { flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: 26px; scrollbar-width: none; }",
    ".tlf-indhold::-webkit-scrollbar { display: none; }",
    ".tlf-soeg { margin: 4px 14px 10px; display: flex; gap: 6px; align-items: center; padding: 7px 10px; border-radius: 11px; background: var(--t-felt); color: var(--t-graa); }",
    ".tlf-soeg input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; color: var(--t-tekst); }",
    ".tlf-faner { display: flex; margin: 0 14px 10px; padding: 2px; border-radius: 9px; background: var(--t-felt); }",
    ".tlf-faner button { flex: 1; border: 0; background: none; padding: 6px; border-radius: 7px; font-family: inherit; font-weight: 600; font-size: 12px; color: var(--t-tekst); cursor: pointer; position: relative; }",
    ".tlf-faner button.valgt { background: var(--t-hvid); box-shadow: 0 1px 3px var(--t-skygge3); }",
    ".tlf-faner button i { font-style: normal; margin-left: 4px; background: var(--t-rod); color: var(--t-hvid); border-radius: 8px; padding: 0 5px; font-size: 10px; }",
    ".tlf-liste { list-style: none; margin: 0; padding: 0; background: var(--t-hvid); }",
    ".tlf-liste li { display: flex; align-items: center; gap: 10px; padding: 9px 14px; position: relative; cursor: pointer; }",
    ".tlf-liste li + li::before { content: ''; position: absolute; top: 0; left: 66px; right: 0; border-top: 1px solid var(--t-linje); }",
    ".tlf-liste li:hover { background: var(--t-hover); }",
    ".tlf-liste .info { flex: 1; min-width: 0; }",
    ".tlf-liste .info b { display: flex; justify-content: space-between; gap: 6px; font-size: 14px; font-weight: 600; }",
    ".tlf-liste .info b small { font-weight: 400; color: var(--t-graa); font-size: 12px; flex: none; }",
    ".tlf-liste .info span { display: block; font-size: 12.5px; color: var(--t-graa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-liste .info span.on::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--t-on); margin-right: 5px; }",
    ".tlf-liste .ul { flex: none; min-width: 18px; height: 18px; border-radius: 9px; background: var(--t-acc); color: var(--t-hvid); font-size: 11px; font-weight: 700; display: grid; place-items: center; padding: 0 4px; box-sizing: border-box; }",
    ".tlf-liste .ul.rod { background: var(--t-rod); }",
    ".tlf-lk { flex: none; width: 32px; height: 32px; border-radius: 50%; border: 0; display: grid; place-items: center; background: var(--t-felt); color: var(--t-acc); cursor: pointer; padding: 0; }",
    ".tlf-lk:hover { filter: brightness(.94); }",
    ".tlf-lk.rod { color: var(--t-rod); } .tlf-lk.sikker { background: var(--t-rod); color: var(--t-hvid); width: auto; border-radius: 16px; padding: 0 10px; font-family: inherit; font-weight: 600; font-size: 11px; }",
    ".tlf-lk.ja { background: var(--t-on); color: var(--t-hvid); width: auto; border-radius: 16px; padding: 0 12px; font-family: inherit; font-weight: 600; font-size: 12px; }",
    ".tlf-lk.nej { width: auto; border-radius: 16px; padding: 0 12px; font-family: inherit; font-weight: 600; font-size: 12px; color: var(--t-tekst); }",
    ".tlf-av { flex: none; width: 42px; height: 42px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; color: var(--t-hvid); font-weight: 600; font-size: 17px; position: relative; }",
    ".tlf-av canvas { width: 100%; height: 100%; image-rendering: pixelated; }",
    ".tlf-av.lille { width: 30px; height: 30px; font-size: 13px; }",
    ".tlf-tom { text-align: center; color: var(--t-graa); padding: 40px 24px; font-size: 13px; line-height: 1.5; }",
    ".tlf-tom .st { font-size: 40px; display: block; margin-bottom: 8px; }",
    ".tlf-gruppe { margin: 14px 14px 0; border-radius: 12px; overflow: hidden; background: var(--t-hvid); }",
    ".tlf-gruppe-navn { margin: 18px 28px 6px; font-size: 12px; color: var(--t-graa); text-transform: uppercase; letter-spacing: .03em; }",
    ".tlf-raekke { display: flex; align-items: center; gap: 10px; padding: 11px 14px; position: relative; }",
    ".tlf-raekke + .tlf-raekke::before { content: ''; position: absolute; top: 0; left: 14px; right: 0; border-top: 1px solid var(--t-linje); }",
    ".tlf-raekke span { flex: 1; }",
    ".tlf-raekke small { color: var(--t-graa); }",
    ".tlf-raekke button.lnk { border: 0; background: none; color: var(--t-acc); font: inherit; cursor: pointer; padding: 0; }",
    ".tlf-raekke button.lnk.rod { color: var(--t-rod); }",
    ".tlf-kontakt { width: 51px; height: 31px; border-radius: 16px; border: 0; background: var(--t-felt2); position: relative; cursor: pointer; transition: background .2s; padding: 0; flex: none; }",
    ".tlf-kontakt::after { content: ''; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 50%; background: var(--t-hvid); box-shadow: 0 2px 4px var(--t-skygge3); transition: left .2s; }",
    ".tlf-kontakt.til { background: var(--t-on); } .tlf-kontakt.til::after { left: 22px; }",
    ".tlf-farver { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 12px 14px; }",
    ".tlf-farver button { aspect-ratio: 1; border-radius: 50%; border: 0; cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px var(--t-linje), 0 1px 2px var(--t-skygge3); }",
    ".tlf-farver button.valgt { box-shadow: 0 0 0 2px var(--t-hvid), 0 0 0 4px var(--t-acc); }",
    ".tlf-bgs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px 14px; }",
    ".tlf-bgs button { aspect-ratio: 9/19; border-radius: 9px; border: 0; cursor: pointer; padding: 0; background-size: cover; background-position: center; box-shadow: inset 0 0 0 1px var(--t-linje); position: relative; overflow: hidden; }",
    ".tlf-bgs button.valgt { box-shadow: 0 0 0 2px var(--t-hvid), 0 0 0 4px var(--t-acc); }",
    ".tlf-bgs button span { position: absolute; left: 0; right: 0; bottom: 0; font-size: 9px; padding: 3px 2px; background: var(--t-moerkglas); color: var(--t-hvid); }",
    ".tlf-bgs button.eget { background: var(--t-felt); color: var(--t-graa); font-size: 22px; display: grid; place-items: center; }",
    ".tlf-forhaand { display: flex; justify-content: center; padding: 14px 0 4px; }",
    ".tlf-mini { width: 92px; height: 190px; border-radius: 18px; padding: 3px; background: linear-gradient(135deg, var(--t-k1), var(--t-k2) 40%, var(--t-k3) 65%, var(--t-k1)); box-shadow: 0 8px 18px var(--t-skygge2); }",
    ".tlf-mini div { width: 100%; height: 100%; border-radius: 15px; border: 2px solid var(--t-sort); box-sizing: border-box; background-size: cover; background-position: center; display: grid; place-items: start center; color: var(--t-hvid); font-size: 18px; font-weight: 600; padding-top: 22px; text-shadow: 0 1px 4px var(--t-skygge2); }",
    // Chat
    ".tlf-chat { flex: 1; overflow-y: auto; padding: 10px 10px 6px; display: flex; flex-direction: column; gap: 3px; background: var(--t-hvid); scrollbar-width: none; }",
    ".tlf-chat::-webkit-scrollbar { display: none; }",
    ".tlf-chat .dag { align-self: center; font-size: 11px; color: var(--t-graa); margin: 8px 0 4px; }",
    ".tlf-b { max-width: 76%; padding: 7px 11px; border-radius: 18px; font-size: 14px; line-height: 1.3; word-wrap: break-word; user-select: text; -webkit-user-select: text; position: relative; }",
    ".tlf-b.dem { align-self: flex-start; background: var(--t-felt); color: var(--t-tekst); border-bottom-left-radius: 5px; }",
    ".tlf-b.mig { align-self: flex-end; background: var(--t-acc); color: var(--t-hvid); border-bottom-right-radius: 5px; }",
    ".tlf-b.adv { background: var(--t-advbg); color: var(--t-advtekst); border: 1px solid var(--t-advkant); }",
    ".tlf-b small { display: block; font-size: 10px; opacity: .65; margin-top: 2px; text-align: right; }",
    ".tlf-b.prik { padding: 10px 14px; display: flex; gap: 4px; }",
    ".tlf-b.prik i { width: 7px; height: 7px; border-radius: 50%; background: var(--t-graa); animation: tlfPrik 1.2s infinite; }",
    ".tlf-b.prik i:nth-child(2) { animation-delay: .2s } .tlf-b.prik i:nth-child(3) { animation-delay: .4s }",
    "@keyframes tlfPrik { 0%,60%,100% { opacity: .3; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-3px) } }",
    ".tlf-skriv { flex: none; display: flex; gap: 7px; align-items: center; padding: 8px 10px 24px; background: var(--t-hvid); border-top: 1px solid var(--t-linje); }",
    ".tlf-skriv input { flex: 1; min-width: 0; border: 1px solid var(--t-linje); border-radius: 18px; padding: 8px 13px; font: inherit; outline: 0; background: var(--t-hvid); color: var(--t-tekst); user-select: text; }",
    ".tlf-skriv input:focus { border-color: var(--t-acc); }",
    ".tlf-skriv button { width: 32px; height: 32px; border-radius: 50%; border: 0; background: var(--t-acc); display: grid; place-items: center; cursor: pointer; padding: 0; flex: none; }",
    ".tlf-skriv button:disabled { background: var(--t-felt2); cursor: default; }",
    // Noter
    ".tlf-noter { flex: 1; border: 0; outline: 0; resize: none; padding: 10px 16px 30px; font-family: inherit; font-size: 15px; line-height: 1.5; background: var(--t-papir); color: var(--t-tekst); user-select: text; }",
    // Events
    ".tlf-event { margin: 10px 14px 0; border-radius: 16px; overflow: hidden; background: var(--t-hvid); box-shadow: 0 2px 8px var(--t-skygge3); }",
    ".tlf-event .eh { height: 64px; display: grid; place-items: center; font-size: 34px; background: linear-gradient(135deg, var(--t-acc), var(--t-k3)); }",
    ".tlf-event .et { padding: 10px 14px 12px; }",
    ".tlf-event .et b { display: block; font-size: 15px; } .tlf-event .et p { margin: 4px 0 6px; font-size: 13px; color: var(--t-tekst); white-space: pre-wrap; user-select: text; } .tlf-event .et small { color: var(--t-graa); }",
    // Notifikation der falder ned
    ".tlf-banner { position: absolute; z-index: 70; top: 8px; left: 8px; right: 8px; transform: translateY(-130%); transition: transform .4s cubic-bezier(.2,.9,.3,1.1); cursor: pointer; }",
    ".tlf-banner.vis { transform: translateY(36px); }",
    ".tlf-banner .tlf-notis { background: var(--t-glas2); }",
    // Sort skærm når der trykkes på sideknappen
    ".tlf-sluk { position: absolute; inset: 0; z-index: 80; background: var(--t-sort); opacity: 0; pointer-events: none; transition: opacity .2s; }",
    ".tlf-sluk.vis { opacity: 1; }",
    ".tlf-lille-besked { position: absolute; z-index: 75; left: 50%; bottom: 40px; transform: translateX(-50%); background: var(--t-moerkglas); color: var(--t-hvid); padding: 7px 14px; border-radius: 16px; font-size: 12px; white-space: nowrap; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); opacity: 0; transition: opacity .25s; pointer-events: none; }",
    ".tlf-lille-besked.vis { opacity: 1; }",
    // Knappen i chatbaren rysteer, når der kommer en besked
    "#chat-venner-knap.tlf-ring { animation: tlfRing .7s ease-in-out 2; }",
    "@keyframes tlfRing { 0%,100% { transform: rotate(0) } 15% { transform: rotate(-14deg) } 30% { transform: rotate(12deg) } 45% { transform: rotate(-9deg) } 60% { transform: rotate(6deg) } 75% { transform: rotate(-3deg) } }",
    // Den gamle venneliste og det gamle beskedvindue bruges ikke mere
    "#venner-vindue, #besked-vindue { display: none !important; }",
  ].map(function (regel) {
    // alle regler får "#telefon" foran, så hotellets egne knap-regler ikke vinder
    if (regel.charAt(0) === "@" || regel.indexOf("#") === 0) return regel;
    const i = regel.indexOf("{");
    return regel.slice(0, i).split(",").map(function (v) { return "#telefon " + v.trim(); }).join(", ") + " " + regel.slice(i);
  }).join("\n");
  document.head.appendChild(stil);
  // vinrødt-temaet og hotel-farven må ikke farve telefonens stilark om
  if (typeof vinFaerdige !== "undefined" && stil.sheet) try { vinFaerdige.add(stil.sheet); } catch (e) {}

  // ---------------------------------------------------------------
  //  Bygningen af telefonen
  // ---------------------------------------------------------------
  const tlf = document.createElement("div");
  tlf.id = "telefon";
  tlf.hidden = true;
  tlf.innerHTML =
    "<div class='tlf-krop'>" +
      "<i class='tlf-knap v' style='top:118px;height:26px' data-k='handling' title='Lydløs'></i>" +
      "<i class='tlf-knap v' style='top:164px;height:50px' data-k='op' title='Lyd op'></i>" +
      "<i class='tlf-knap v' style='top:222px;height:50px' data-k='ned' title='Lyd ned'></i>" +
      "<i class='tlf-knap h' style='top:182px;height:78px' data-k='taend' title='Lås / tænd'></i>" +
      "<div class='tlf-kant'>" +
        "<div class='tlf-skaerm'>" +
          "<div class='tlf-bg'></div>" +
          "<div class='tlf-oe'></div>" +
          "<div class='tlf-status'><span class='st-kl'></span><span class='hoejre'>" +
            "<svg width='17' height='11' viewBox='0 0 17 11'><rect x='0' y='7' width='3' height='4' rx='1' fill='currentColor'/><rect x='4.5' y='5' width='3' height='6' rx='1' fill='currentColor'/><rect x='9' y='2.5' width='3' height='8.5' rx='1' fill='currentColor'/><rect x='13.5' y='0' width='3' height='11' rx='1' fill='currentColor'/></svg>" +
            "<svg width='15' height='11' viewBox='0 0 15 11'><path d='M7.5 2.2c2.2 0 4.2.8 5.7 2.2l1.2-1.3A9.9 9.9 0 0 0 7.5.4 9.9 9.9 0 0 0 .6 3.1l1.2 1.3a8.2 8.2 0 0 1 5.7-2.2zM7.5 5.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3a6.7 6.7 0 0 0-9.2 0l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3zM7.5 8.4l1.9 2-1.9 1-1.9-1z' fill='currentColor'/></svg>" +
            "<svg width='26' height='12' viewBox='0 0 26 12'><rect x='.5' y='.5' width='22' height='11' rx='3.2' fill='none' stroke='currentColor' opacity='.45'/><rect class='st-bat' x='2' y='2' width='17' height='8' rx='2' fill='currentColor'/><path d='M24 4v4a2 2 0 0 0 0-4z' fill='currentColor' opacity='.5'/></svg>" +
          "</span></div>" +
          "<div class='tlf-laas'>" +
            "<span class='hl'>" + ik("laas", 22) + "</span>" +
            "<div class='tid'></div><div class='dag'></div>" +
            "<div class='notis'></div>" +
            "<div class='stryg'>Stryg op eller klik for at låse op</div>" +
            "<div class='bund'><button class='tlf-rund' data-l='lygte' title='Lommelygte'>" + ik("lygte", 20) + "</button><button class='tlf-rund' data-l='kamera' title='Kamera'>" + ik("kamera", 22) + "</button></div>" +
          "</div>" +
          "<div class='tlf-hjem bag'></div>" +
          "<div class='tlf-banner'></div>" +
          "<div class='tlf-lille-besked'></div>" +
          "<div class='tlf-hjemlinje' title='Hjem'></div>" +
          "<div class='tlf-sluk'></div>" +
        "</div>" +
      "</div>" +
    "</div>";
  document.body.appendChild(tlf);

  const krop = tlf.querySelector(".tlf-krop");
  const skaerm = tlf.querySelector(".tlf-skaerm");
  const bgEl = tlf.querySelector(".tlf-bg");
  const statusEl = tlf.querySelector(".tlf-status");
  const laasEl = tlf.querySelector(".tlf-laas");
  const hjemEl = tlf.querySelector(".tlf-hjem");
  const bannerEl = tlf.querySelector(".tlf-banner");
  const hjemLinje = tlf.querySelector(".tlf-hjemlinje");
  const slukEl = tlf.querySelector(".tlf-sluk");
  const lilleEl = tlf.querySelector(".tlf-lille-besked");

  // vinrødt-temaet / realistisk-ui må ikke farve telefonens elementer ét for ét
  if (typeof vinKoeEl === "function") {
    const gammelKoe = vinKoeEl;
    vinKoeEl = function (el) { if (el && el.nodeType === 1 && el.closest && el.closest("#telefon")) return; gammelKoe(el); };
  }

  // ---------------------------------------------------------------
  //  Farver og baggrund
  // ---------------------------------------------------------------
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function farveNu() { return TLF_FARVER.find(function (f) { return f.id === ind.farve; }) || TLF_FARVER[0]; }
  function baggrundNu() {
    if (ind.baggrund === "eget" && ind.eget) return "url(\"" + ind.eget + "\")";
    return (BAGGRUNDE.find(function (b) { return b.id === ind.baggrund; }) || BAGGRUNDE[0]).b;
  }
  function saetFarver() {
    const F = farveNu();
    const s = tlf.style;
    s.setProperty("--t-k1", F.k[0]); s.setProperty("--t-k2", F.k[1]); s.setProperty("--t-k3", F.k[2]);
    s.setProperty("--t-acc", F.a);
    const a = hexRgb(F.a);
    s.setProperty("--t-hover", "rgba(" + a.join(",") + ",.07)");
    s.setProperty("--t-kant", "rgba(" + hexRgb(F.k[2]).join(",") + ",.6)");
    // faste toner (sat her, så intet farve-tema kan ændre dem)
    const fast = {
      "--t-skygge": "rgba(0,0,0,.45)", "--t-skygge2": "rgba(0,0,0,.35)", "--t-skygge3": "rgba(0,0,0,.18)",
      "--t-glans": "rgba(255,255,255,.55)", "--t-glans2": "rgba(255,255,255,.35)",
      "--t-refl": "rgba(255,255,255,.08)", "--t-refl2": "rgba(255,255,255,.04)",
      "--t-linse1": "#5a6cff", "--t-linse2": "#1a1f3a",
      "--t-glas": "rgba(255,255,255,.72)", "--t-glas2": "rgba(250,250,252,.92)",
      "--t-moerkglas": "rgba(30,30,34,.38)", "--t-dock": "rgba(255,255,255,.25)",
      "--t-topbg": "rgba(248,247,250,.88)", "--t-felt": "#ececf0", "--t-felt2": "#d7d7dc",
      "--t-papir": "#fffdf3", "--t-advbg": "#ffe9e7", "--t-advtekst": "#9a1d14", "--t-advkant": "#f3b4ad",
    };
    Object.keys(fast).forEach(function (k) { s.setProperty(k, fast[k]); });
    bgEl.style.backgroundImage = baggrundNu();
    laasEl.querySelector(".hl").style.color = "#fff";
  }

  // ---------------------------------------------------------------
  //  Placering, størrelse og at trække i telefonen
  // ---------------------------------------------------------------
  const POS_NOEGLE = "mit-hotel-telefon-plads";
  let pos = null;
  try { pos = JSON.parse(localStorage.getItem(POS_NOEGLE) || "null"); } catch (e) {}
  function skala() { return Math.min(1, Math.max(0.55, (window.innerHeight - 90) / 620)); }
  function placer() {
    const s = skala();
    tlf.style.setProperty("--t-s", s);
    const b = 300 * s, h = 620 * s;
    let x, y;
    if (pos) { x = pos.x; y = pos.y; }
    else { x = window.innerWidth - b - 28; y = window.innerHeight - h - 74; }
    x = Math.max(4, Math.min(window.innerWidth - b - 4, x));
    y = Math.max(4, Math.min(window.innerHeight - h - 4, y));
    tlf.style.left = x + "px";
    tlf.style.top = y + "px";
    tlf.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", function () { if (!tlf.hidden) placer(); });

  let traek = null;
  function startTraek(e) {
    if (e.button !== 0) return;
    const r = tlf.getBoundingClientRect();
    traek = { dx: e.clientX - r.left, dy: e.clientY - r.top, flyttet: false, sx: e.clientX, sy: e.clientY };
    krop.classList.add("traek");
    e.preventDefault();
  }
  krop.addEventListener("pointerdown", function (e) {
    // man trækker i metalkanten eller statuslinjen
    if (e.target === krop || e.target.classList.contains("tlf-kant") || (e.target.closest(".tlf-skaerm") && e.clientY - skaerm.getBoundingClientRect().top < 40 * skala() && !e.target.closest("button"))) startTraek(e);
  });
  window.addEventListener("pointermove", function (e) {
    if (!traek) return;
    if (Math.abs(e.clientX - traek.sx) + Math.abs(e.clientY - traek.sy) > 3) traek.flyttet = true;
    pos = { x: e.clientX - traek.dx, y: e.clientY - traek.dy };
    placer();
  });
  window.addEventListener("pointerup", function () {
    if (!traek) return;
    krop.classList.remove("traek");
    if (traek.flyttet) try { localStorage.setItem(POS_NOEGLE, JSON.stringify(pos)); } catch (e) {}
    traek = null;
  });
  krop.addEventListener("dblclick", function (e) {
    if (e.target !== krop && !e.target.classList.contains("tlf-kant")) return;
    pos = null;
    try { localStorage.removeItem(POS_NOEGLE); } catch (er) {}
    placer();
  });

  // ---------------------------------------------------------------
  //  Tilstand
  // ---------------------------------------------------------------
  let skaermNu = "laas";     // laas | hjem | app
  let appNu = null;           // navnet på den åbne app
  let chatMed = null;         // hvem man skriver med i Beskeder
  let kontaktFane = "venner";
  let soegTekst = "";
  let appEl = null;

  function lille(tekst) {
    lilleEl.textContent = tekst;
    lilleEl.classList.add("vis");
    clearTimeout(lille.t);
    lille.t = setTimeout(function () { lilleEl.classList.remove("vis"); }, 1800);
  }

  // ---------------------------------------------------------------
  //  Venner og beskeder (fra den gamle kode)
  // ---------------------------------------------------------------
  function vennerListe() { return typeof venner !== "undefined" ? venner : []; }
  function anmodningerTilMig() { return typeof anmodninger !== "undefined" && anmodninger.tilMig ? anmodninger.tilMig : []; }
  function onlineOm(navn) { try { return typeof venOnline === "function" && venOnline(navn); } catch (e) { return false; } }
  function stedFor(navn) {
    if (typeof HAL_GAESTER !== "undefined" && HAL_GAESTER.some(function (g) { return g.navn === navn; })) return "Velkomsthallen";
    if (typeof serverVenner !== "undefined") {
      const v = serverVenner.find(function (s) { return s.navn === navn; });
      if (v && v.rum === "hal") return "Velkomsthallen";
    }
    return "Online";
  }
  function samtaler() {
    const navne = [];
    if (typeof beskeder !== "undefined") Object.keys(beskeder).forEach(function (n) { if (beskeder[n].linjer && beskeder[n].linjer.length) navne.push(n); });
    return navne.sort(function (a, b) {
      const la = beskeder[a].linjer, lb = beskeder[b].linjer;
      return lb[lb.length - 1].tid - la[la.length - 1].tid;
    });
  }
  function ulaestIalt() {
    let n = 0;
    if (typeof beskeder !== "undefined") Object.keys(beskeder).forEach(function (k) { n += beskeder[k].ulaest || 0; });
    return n;
  }

  // Et lille profilbillede: hovedet af figuren, ellers forbogstavet
  function valgFor(navn) {
    if (navn === mig() && typeof garderobe !== "undefined") return garderobe;
    if (typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[navn] && ANDRE_SPILLERE[navn].valg) return ANDRE_SPILLERE[navn].valg;
    if (typeof HAL_GAESTER !== "undefined") {
      const g = HAL_GAESTER.find(function (x) { return x.navn === navn; });
      if (g && g.valg) return g.valg;
    }
    return null;
  }
  function navneFarve(navn) {
    let h = 0;
    for (let i = 0; i < navn.length; i++) h = (h * 31 + navn.charCodeAt(i)) % 360;
    return "linear-gradient(160deg, hsl(" + h + ",55%,68%), hsl(" + ((h + 25) % 360) + ",50%,48%))";
  }
  function avatarHtml(navn, lille) {
    return "<span class='tlf-av" + (lille ? " lille" : "") + "' data-av='" + esc(navn) + "' style='background:" + navneFarve(navn) + "'>" + esc(navn.charAt(0).toUpperCase()) + "</span>";
  }
  function tegnAvatarer(rod) {
    rod.querySelectorAll("[data-av]").forEach(function (el) {
      const valg = valgFor(el.dataset.av);
      if (!valg || typeof tegnMenneske !== "function" || typeof figurHoejde !== "function") return;
      try {
        const c = document.createElement("canvas");
        c.width = 84; c.height = 84;
        const x = c.getContext("2d");
        const h = figurHoejde(valg), s = 2.2;
        x.translate(42, 6 + h * s);
        x.scale(s, s);
        tegnMenneske(x, 0, 0, valg, "ned", null, null);
        el.textContent = "";
        el.appendChild(c);
      } catch (e) {}
    });
  }

  // ---------------------------------------------------------------
  //  Ur, statuslinje og låseskærm
  // ---------------------------------------------------------------
  function opdaterUr() {
    const nu = new Date();
    tlf.querySelector(".st-kl").textContent = kl().replace(".", ":");
    laasEl.querySelector(".tid").textContent = kl().replace(".", ":");
    laasEl.querySelector(".dag").textContent = dato(nu).charAt(0).toUpperCase() + dato(nu).slice(1);
    const w = hjemEl.querySelector(".w2");
    if (w) w.textContent = kl().replace(".", ":");
    const kal = hjemEl.querySelector(".tlf-kal");
    if (kal) kal.innerHTML = "<i>" + DAGE[nu.getDay()].slice(0, 3) + "</i><b>" + nu.getDate() + "</b>";
    // batteriet går langsomt ned i løbet af dagen 🔋
    const bat = 0.25 + 0.75 * (1 - ((nu.getHours() * 60 + nu.getMinutes()) % 1440) / 1440);
    tlf.querySelector(".st-bat").setAttribute("width", Math.round(17 * bat));
  }

  function laasNotiser() {
    const boks = laasEl.querySelector(".notis");
    const ny = [];
    samtaler().forEach(function (n) {
      const s = beskeder[n];
      if (!s.ulaest) return;
      const l = s.linjer[s.linjer.length - 1];
      ny.push(notisHtml("beskeder", n, l.tekst, naarTekst(l.tid), s.ulaest > 1 ? s.ulaest + " nye beskeder" : null));
    });
    anmodningerTilMig().forEach(function (n) { ny.push(notisHtml("kontakter", n, "📨 vil gerne være din ven", "nu")); });
    boks.innerHTML = ny.slice(0, 3).join("");
  }
  function notisHtml(app, titel, tekst, tid, ekstra) {
    const A = APPS[app];
    return "<div class='tlf-notis' data-notis='" + app + "' data-hvem='" + esc(titel) + "'><span class='ai' style='background:" + A.bg + "'>" + ik(A.ik) + "</span>" +
      "<span class='nt'><b>" + esc(titel) + "<small>" + esc(tid) + "</small></b><span>" + esc(ekstra || tekst) + "</span></span></div>";
  }

  function laasOp(til) {
    skaermNu = "hjem";
    laasEl.classList.add("vaek");
    bgEl.classList.remove("slor");
    tegnHjem();
    hjemEl.classList.remove("bag");
    statusEl.classList.remove("moerk");
    hjemLinje.classList.remove("moerk");
    if (til) setTimeout(function () { aabnApp(til.app, til.hvem); }, 180);
  }
  function laas() {
    lukApp(true);
    skaermNu = "laas";
    hjemEl.classList.add("bag");
    laasEl.classList.remove("vaek");
    bgEl.classList.remove("slor");
    statusEl.classList.remove("moerk");
    hjemLinje.classList.remove("moerk");
    laasNotiser();
  }

  // Stryg op (eller klik) på låseskærmen
  let strygStart = null;
  laasEl.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    strygStart = { y: e.clientY, t: Date.now() };
  });
  laasEl.addEventListener("pointermove", function (e) {
    if (!strygStart) return;
    const dy = Math.min(0, e.clientY - strygStart.y);
    laasEl.style.transition = "none";
    laasEl.style.transform = "translateY(" + dy + "px)";
    laasEl.style.opacity = String(1 + dy / 400);
  });
  function slutStryg(e) {
    if (!strygStart) return;
    const dy = e.clientY - strygStart.y;
    laasEl.style.transition = ""; laasEl.style.transform = ""; laasEl.style.opacity = "";
    strygStart = null;
    const notis = e.target.closest && e.target.closest("[data-notis]");
    if (dy < -60 || Math.abs(dy) < 6) laasOp(notis && Math.abs(dy) < 6 ? { app: notis.dataset.notis, hvem: notis.dataset.notis === "beskeder" ? notis.dataset.hvem : null } : null);
  }
  laasEl.addEventListener("pointerup", slutStryg);
  laasEl.addEventListener("pointerleave", function (e) { if (strygStart) slutStryg(e); });
  laasEl.querySelector("[data-l='lygte']").addEventListener("click", function () {
    this.classList.toggle("taendt");
    lille(this.classList.contains("taendt") ? "🔦 Lommelygte tændt" : "Lommelygte slukket");
  });
  laasEl.querySelector("[data-l='kamera']").addEventListener("click", function () { aabnUdeApp("kamera"); });

  // ---------------------------------------------------------------
  //  Hjemmeskærmen
  // ---------------------------------------------------------------
  function appIkon(id) {
    const A = APPS[id];
    let tal = 0;
    if (id === "beskeder") tal = ulaestIalt();
    if (id === "kontakter") tal = anmodningerTilMig().length;
    const indre = id === "events" ? "<span class='tlf-kal'></span>" : ik(A.ik);
    return "<button class='tlf-app-ik' data-app='" + id + "'><span class='fl' style='background:" + A.bg + "'>" + indre + "</span>" +
      (tal ? "<span class='tal'>" + (tal > 99 ? "99+" : tal) + "</span>" : "") + "<span class='nv'>" + A.navn + "</span></button>";
  }
  function tegnHjem() {
    const online = document.getElementById("online-tal");
    const rum = typeof rumNavnNu === "function" ? (function () { try { return rumNavnNu(); } catch (e) { return ""; } })() : "";
    hjemEl.innerHTML =
      "<div class='tlf-widget'><div class='w1'>Hello Vera</div><div class='w2'></div>" +
      "<div class='w3'><span>" + esc(rum ? "📍 " + rum : dato()) + "</span><span>" + esc(online ? online.textContent.trim().slice(0, 18) : "") + "</span></div></div>" +
      "<div class='tlf-gitter'>" + GITTER.map(appIkon).join("") + "</div>" +
      "<div class='tlf-prikker'><i></i><i></i></div>" +
      "<div class='tlf-dock'>" + DOCK.map(appIkon).join("") + "</div>";
    opdaterUr();
  }
  hjemEl.addEventListener("click", function (e) {
    const k = e.target.closest("[data-app]");
    if (k) aabnApp(k.dataset.app);
  });
  hjemLinje.addEventListener("click", function () {
    if (skaermNu === "app") lukApp();
    else if (skaermNu === "laas") laasOp();
  });

  // Apps der åbner et af hotellets egne vinduer
  function aabnUdeApp(id) {
    const ok = (function () {
      try {
        if (id === "rum") {
          const nav = document.getElementById("navigator") || (typeof navVindue !== "undefined" ? navVindue : null);
          if (nav) { nav.hidden = false; if (typeof visNav === "function") visNav(); return true; }
          return klik("chat-nav-knap");
        }
        if (id === "shop") { if (typeof aabnShop === "function") { aabnShop(); return true; } return klik("chat-shop-knap"); }
        if (id === "lager") { if (typeof aabnLager === "function") { aabnLager(); return true; } return klik("chat-lager-knap"); }
        if (id === "kamera") return klik("chat-kamera-knap");
        if (id === "fotos") return klik("chat-album-knap") || klik("chat-lager-knap");
      } catch (e) {}
      return false;
    })();
    lille(ok ? "Åbner " + APPS[id].navn + " …" : APPS[id].navn + " virker ikke lige nu");
  }
  function klik(id) {
    const k = document.getElementById(id);
    if (!k) return false;
    k.click();
    return true;
  }

  // ---------------------------------------------------------------
  //  Apps inde i telefonen
  // ---------------------------------------------------------------
  function aabnApp(id, hvem) {
    if (["rum", "shop", "lager", "kamera", "fotos"].indexOf(id) >= 0) { aabnUdeApp(id); return; }
    if (skaermNu === "laas") { laasOp({ app: id, hvem: hvem }); return; }
    lukApp(true);
    skaermNu = "app";
    appNu = id;
    soegTekst = "";
    appEl = document.createElement("div");
    appEl.className = "tlf-app";
    skaerm.insertBefore(appEl, bannerEl);
    statusEl.classList.add("moerk");
    hjemLinje.classList.add("moerk");
    if (id === "beskeder" && hvem) { chatMed = hvem; tegnChat(); }
    else { chatMed = null; tegnApp(); }
  }
  function lukApp(straks) {
    if (typeof beskedMed !== "undefined" && chatMed) beskedMed = null;
    chatMed = null;
    appNu = null;
    if (appEl) {
      const el = appEl;
      appEl = null;
      if (straks) el.remove();
      else { el.classList.add("ud"); setTimeout(function () { el.remove(); }, 220); }
    }
    if (skaermNu === "app") {
      skaermNu = "hjem";
      statusEl.classList.remove("moerk");
      hjemLinje.classList.remove("moerk");
      tegnHjem();
    }
  }

  function top(titel, tilbage, hoejre) {
    return "<div class='tlf-top'><button class='tlf-tb' data-tilbage='" + (tilbage || "hjem") + "' title='Tilbage'>" + ik("tilbage", 20) + "</button>" +
      "<h3>" + titel + "</h3>" + (hoejre || "<span class='tlf-tb'></span>") + "</div>";
  }

  function tegnApp() {
    if (!appEl) return;
    const id = appNu;
    if (id === "beskeder") {
      appEl.innerHTML = top("Beskeder", "hjem", "<button class='tlf-tb' data-ny title='Ny besked'>" + ik("skriv", 20) + "</button>") +
        "<div class='tlf-indhold'><div class='tlf-soeg'>" + ik("soeg", 16) + "<input placeholder='Søg i samtaler …'></div><ul class='tlf-liste'></ul></div>";
      kobSoeg();
      opdaterListe();
    } else if (id === "kontakter") {
      appEl.innerHTML = top("Kontakter") +
        "<div class='tlf-indhold'><div class='tlf-faner'><button data-fane='venner'>Venner</button><button data-fane='anmod'>Anmodninger</button></div>" +
        "<div class='tlf-soeg'>" + ik("soeg", 16) + "<input placeholder='Søg venner …'></div><ul class='tlf-liste'></ul></div>";
      kobSoeg();
      appEl.querySelectorAll("[data-fane]").forEach(function (b) {
        b.addEventListener("click", function () { kontaktFane = b.dataset.fane; opdaterListe(); });
      });
      opdaterListe();
    } else if (id === "events") {
      tegnEvents();
    } else if (id === "noter") {
      appEl.innerHTML = top("Noter") + "<textarea class='tlf-noter' placeholder='Skriv en note …'></textarea>";
      const t = appEl.querySelector("textarea");
      t.value = noter;
      t.addEventListener("input", function () {
        noter = t.value;
        try { localStorage.setItem("mit-hotel-telefon-noter-" + mig(), noter); } catch (e) {}
      });
      setTimeout(function () { t.focus(); }, 300);
    } else if (id === "indst") {
      tegnIndstillinger();
    }
  }
  function kobSoeg() {
    const inp = appEl.querySelector(".tlf-soeg input");
    if (!inp) return;
    inp.addEventListener("input", function () { soegTekst = inp.value.trim().toLowerCase(); opdaterListe(); });
  }

  // Listerne i Beskeder og Kontakter (tegnes om, når der sker noget)
  function opdaterListe() {
    if (!appEl || chatMed) return;
    const ul = appEl.querySelector(".tlf-liste");
    if (!ul) return;
    const passer = function (n) { return !soegTekst || n.toLowerCase().indexOf(soegTekst) >= 0; };
    if (appNu === "beskeder") {
      const navne = samtaler().filter(passer);
      if (!navne.length) {
        ul.innerHTML = "<li class='tlf-tom' style='cursor:default'><span><span class='st'>💬</span>" +
          (soegTekst ? "Ingen samtaler passer." : "Ingen beskeder endnu.<br>Tryk på ✏️ eller åbn Kontakter for at skrive til en ven.") + "</span></li>";
        return;
      }
      ul.innerHTML = navne.map(function (n) {
        const s = beskeder[n], l = s.linjer[s.linjer.length - 1];
        const tekst = (l.fra === mig() ? "Dig: " : "") + l.tekst;
        return "<li data-chat='" + esc(n) + "'>" + avatarHtml(n) +
          "<span class='info'><b>" + (s.advarsel ? "⚠️ " : "") + esc(n) + "<small>" + naarTekst(l.tid) + "</small></b><span>" + esc(tekst) + "</span></span>" +
          (s.ulaest ? "<span class='ul'>" + s.ulaest + "</span>" : "") + "</li>";
      }).join("");
    } else if (appNu === "kontakter") {
      const anm = anmodningerTilMig();
      appEl.querySelectorAll("[data-fane]").forEach(function (b) {
        b.classList.toggle("valgt", b.dataset.fane === kontaktFane);
        if (b.dataset.fane === "venner") b.textContent = "Venner (" + vennerListe().length + ")";
        else b.innerHTML = "Anmodninger" + (anm.length ? "<i>" + anm.length + "</i>" : "");
      });
      if (kontaktFane === "anmod") {
        const liste = anm.filter(passer);
        ul.innerHTML = liste.length ? liste.map(function (n) {
          return "<li style='cursor:default'>" + avatarHtml(n) + "<span class='info'><b>" + esc(n) + "</b><span>📨 Vil gerne være din ven</span></span>" +
            "<button class='tlf-lk ja' data-ja='" + esc(n) + "'>Ja</button><button class='tlf-lk nej' data-nej='" + esc(n) + "'>Nej</button></li>";
        }).join("") : "<li class='tlf-tom' style='cursor:default'><span><span class='st'>📭</span>Ingen venneanmodninger lige nu.</span></li>";
      } else {
        const liste = vennerListe().filter(passer).slice().sort(function (a, b) { return onlineOm(b) - onlineOm(a) || a.localeCompare(b); });
        ul.innerHTML = liste.length ? liste.map(function (n) {
          const on = onlineOm(n);
          const sted = on ? stedFor(n) : "Offline";
          const kanGaa = on && sted === "Velkomsthallen" && typeof rumValg !== "undefined" && rumValg !== "hal";
          return "<li data-chat='" + esc(n) + "'>" + avatarHtml(n) + "<span class='info'><b>" + esc(n) + "</b><span class='" + (on ? "on" : "") + "'>" + esc(sted) + "</span></span>" +
            (kanGaa ? "<button class='tlf-lk' data-gaa title='Gå derhen'>" + ik("gaa", 17) + "</button>" : "") +
            "<button class='tlf-lk' data-skriv title='Skriv'>" + ik("besked", 17).replace("fill='#fff'", "fill='currentColor'") + "</button>" +
            "<button class='tlf-lk rod' data-fjern title='Fjern ven'>" + ik("skrald", 17) + "</button></li>";
        }).join("") : "<li class='tlf-tom' style='cursor:default'><span><span class='st'>👫</span>" +
          (soegTekst ? "Ingen venner passer." : "Du har ingen venner endnu.<br>Klik på en gæst i hotellet og vælg <b>➕ Tilføj ven</b>.") + "</span></li>";
      }
    }
    tegnAvatarer(ul);
  }

  // Klik i listerne
  skaerm.addEventListener("click", function (e) {
    const t = e.target;
    const tilbage = t.closest("[data-tilbage]");
    if (tilbage) {
      if (tilbage.dataset.tilbage === "beskeder" || tilbage.dataset.tilbage === "kontakter") { const fra = tilbage.dataset.tilbage; aabnApp(fra); }
      else lukApp();
      return;
    }
    if (t.closest("[data-ny]")) { kontaktFane = "venner"; aabnApp("kontakter"); lille("Vælg en ven at skrive til"); return; }
    const ja = t.closest("[data-ja]"), nej = t.closest("[data-nej]");
    if (ja || nej) {
      if (typeof svarAnmodning === "function") svarAnmodning((ja || nej).dataset[ja ? "ja" : "nej"], !!ja);
      return;
    }
    const li = t.closest("li[data-chat]");
    if (!li) {
      const n = t.closest("[data-notis]");
      if (n && skaermNu !== "laas") { skjulBanner(); aabnApp(n.dataset.notis, n.dataset.notis === "beskeder" ? n.dataset.hvem : null); }
      return;
    }
    const navn = li.dataset.chat;
    if (t.closest("[data-gaa]")) { if (typeof skiftRum === "function") skiftRum("hal"); lille("Du går til Velkomsthallen"); return; }
    const fj = t.closest("[data-fjern]");
    if (fj) {
      if (fj.classList.contains("sikker")) { if (typeof fjernVen === "function") fjernVen(navn); return; }
      fj.classList.add("sikker"); fj.textContent = "Fjern?";
      setTimeout(function () { if (fj.isConnected) { fj.classList.remove("sikker"); fj.innerHTML = ik("skrald", 17); } }, 3000);
      return;
    }
    const fra = appNu;
    aabnApp("beskeder", navn);
    if (appEl) appEl.dataset.fra = fra;
  });

  // ---------------------------------------------------------------
  //  En samtale
  // ---------------------------------------------------------------
  function tegnChat() {
    if (!appEl || !chatMed) return;
    const navn = chatMed;
    const s = typeof samtale === "function" ? samtale(navn) : { linjer: [] };
    s.ulaest = 0;
    if (typeof gemBeskeder === "function") gemBeskeder();
    if (typeof beskedMed !== "undefined") beskedMed = navn;
    const on = onlineOm(navn);
    appEl.innerHTML =
      "<div class='tlf-top'><button class='tlf-tb' data-tilbage='beskeder' title='Tilbage'>" + ik("tilbage", 20) + "</button>" +
      "<span class='ti'>" + avatarHtml(navn, true) + "<b>" + (s.advarsel ? "⚠️ " : "") + esc(navn) + "</b><small>" + (on ? "🟢 " + esc(stedFor(navn)) : "Offline") + "</small></span><span class='tlf-tb'></span></div>" +
      "<div class='tlf-chat'></div>" +
      "<form class='tlf-skriv' autocomplete='off'><input maxlength='200' placeholder='Skriv en besked …'><button type='submit' disabled title='Send'>" + ik("send", 18) + "</button></form>";
    tegnAvatarer(appEl.querySelector(".tlf-top"));
    const form = appEl.querySelector("form"), inp = form.querySelector("input"), knap = form.querySelector("button");
    inp.addEventListener("input", function () { knap.disabled = !inp.value.trim(); });
    inp.addEventListener("keydown", function (e) { e.stopPropagation(); });   // så man ikke går rundt i rummet, mens man skriver
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const tekst = inp.value;
      inp.value = ""; knap.disabled = true;
      if (!tekst.trim()) return;
      sendBesked(navn, tekst);
    });
    opdaterChat();
    setTimeout(function () { inp.focus(); }, 320);
    if (typeof visUlaest === "function") visUlaest();
  }
  function sendBesked(navn, tekst) {
    // den gamle beskedformular gør arbejdet (rens, smileyer, server, svar)
    const gForm = document.getElementById("besked-form"), gTekst = document.getElementById("besked-tekst");
    if (!gForm || !gTekst) return;
    if (typeof beskedMed !== "undefined") beskedMed = navn;
    gTekst.value = tekst;
    gForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    opdaterChat();
  }
  function opdaterChat() {
    if (!appEl || !chatMed) return;
    const boks = appEl.querySelector(".tlf-chat");
    if (!boks) return;
    const s = beskeder[chatMed] || { linjer: [] };
    let html = "", sidsteDag = "";
    if (!s.linjer.length) html = "<div class='tlf-tom'><span class='st'>✉️</span>Skriv den første besked til " + esc(chatMed) + "</div>";
    s.linjer.forEach(function (l) {
      const d = new Date(l.tid).toDateString();
      if (d !== sidsteDag) { sidsteDag = d; html += "<div class='dag'>" + (d === new Date().toDateString() ? "I dag" : dato(new Date(l.tid))) + "</div>"; }
      const m = l.fra === mig();
      html += "<div class='tlf-b " + (m ? "mig" : "dem") + (l.advarsel ? " adv" : "") + "'>" + esc(l.tekst) + "<small>" + (m || l.fra === chatMed ? "" : esc(l.fra) + " · ") + kl(l.tid) + "</small></div>";
    });
    const skriver = document.getElementById("besked-skriver");
    if (skriver && !skriver.hidden) html += "<div class='tlf-b dem prik'><i></i><i></i><i></i></div>";
    boks.innerHTML = html;
    boks.scrollTop = boks.scrollHeight;
  }

  // ---------------------------------------------------------------
  //  Events
  // ---------------------------------------------------------------
  function tegnEvents() {
    const liste = (typeof nyheder !== "undefined" && Array.isArray(nyheder) ? nyheder.slice() : []).filter(function (n) { return n && (n.titel || n.tekst); });
    liste.sort(function (a, b) { return (b.tid || 0) - (a.tid || 0); });
    const IKON = ["🏆", "🎉", "🪩", "🎈", "⭐", "🎁"];
    appEl.innerHTML = top("Events") + "<div class='tlf-indhold'>" +
      (liste.length ? liste.slice(0, 20).map(function (n, i) {
        return "<div class='tlf-event'><div class='eh'>" + IKON[i % IKON.length] + "</div><div class='et'><b>" + esc(n.titel || "Nyhed") + "</b>" +
          (n.tekst ? "<p>" + esc(n.tekst) + "</p>" : "") + "<small>📅 " + (n.tid ? dato(new Date(n.tid)) + " kl. " + kl(n.tid) : "") + "</small></div></div>";
      }).join("") : "<div class='tlf-tom'><span class='st'>📅</span>Ingen events eller nyheder lige nu.<br>Kig forbi senere!</div>") + "</div>";
  }

  // ---------------------------------------------------------------
  //  Indstillinger: farve, baggrund, lyd, låseskærm
  // ---------------------------------------------------------------
  function tegnIndstillinger() {
    const F = farveNu();
    appEl.innerHTML = top("Indstillinger") + "<div class='tlf-indhold'>" +
      "<div class='tlf-forhaand'><div class='tlf-mini'><div style='background-image:" + baggrundNu().replace(/'/g, "&#39;") + "'>" + kl().replace(".", ":") + "</div></div></div>" +
      "<div class='tlf-gruppe-navn'>Telefonens farve · " + esc(F.navn) + "</div>" +
      "<div class='tlf-gruppe'><div class='tlf-farver'>" + TLF_FARVER.map(function (f) {
        return "<button data-farve='" + f.id + "' title='" + f.navn + "' class='" + (f.id === ind.farve ? "valgt" : "") + "' style='background:linear-gradient(135deg," + f.k[0] + "," + f.k[1] + " 50%," + f.k[2] + ")'></button>";
      }).join("") + "</div></div>" +
      "<div class='tlf-gruppe-navn'>Baggrund</div>" +
      "<div class='tlf-gruppe'><div class='tlf-bgs'>" + BAGGRUNDE.map(function (b) {
        return "<button data-bg='" + b.id + "' class='" + (b.id === ind.baggrund ? "valgt" : "") + "' style='background-image:" + b.b.replace(/'/g, "&#39;") + "'><span>" + b.navn + "</span></button>";
      }).join("") +
      (ind.eget ? "<button data-bg='eget' class='" + (ind.baggrund === "eget" ? "valgt" : "") + "' style='background-image:url(\"" + ind.eget + "\")'><span>Mit billede</span></button>" : "") +
      "<button class='eget' data-upload title='Brug dit eget billede'>＋</button>" +
      "</div></div>" +
      "<div class='tlf-gruppe-navn'>Lyd og lås</div>" +
      "<div class='tlf-gruppe'>" +
        "<div class='tlf-raekke'><span>🔔 Lyd ved nye beskeder</span><button class='tlf-kontakt" + (ind.lyd ? " til" : "") + "' data-slaa='lyd'></button></div>" +
        "<div class='tlf-raekke'><span>🔒 Låseskærm når den åbnes</span><button class='tlf-kontakt" + (ind.laas ? " til" : "") + "' data-slaa='laas'></button></div>" +
        "<div class='tlf-raekke'><span>Lås telefonen nu</span><button class='lnk' data-laasnu>Lås</button></div>" +
      "</div>" +
      "<div class='tlf-gruppe-navn'>Om telefonen</div>" +
      "<div class='tlf-gruppe'>" +
        "<div class='tlf-raekke'><span>Ejer</span><small>" + esc(mig()) + "</small></div>" +
        "<div class='tlf-raekke'><span>Model</span><small>Vera Phone</small></div>" +
        "<div class='tlf-raekke'><span>Venner</span><small>" + vennerListe().length + "</small></div>" +
        "<div class='tlf-raekke'><span>Flyt telefonen</span><small>Træk i kanten</small></div>" +
      "</div>" +
      "<input type='file' accept='image/*' hidden></div>";
    const inp = appEl.querySelector("input[type=file]");
    appEl.querySelector(".tlf-indhold").addEventListener("click", function (e) {
      const f = e.target.closest("[data-farve]");
      if (f) { ind.farve = f.dataset.farve; gemInd(); saetFarver(); bevarScroll(tegnIndstillinger); return; }
      const b = e.target.closest("[data-bg]");
      if (b) { ind.baggrund = b.dataset.bg; gemInd(); saetFarver(); bevarScroll(tegnIndstillinger); return; }
      if (e.target.closest("[data-upload]")) { inp.click(); return; }
      const s = e.target.closest("[data-slaa]");
      if (s) { ind[s.dataset.slaa] = !ind[s.dataset.slaa]; gemInd(); s.classList.toggle("til", ind[s.dataset.slaa]); return; }
      if (e.target.closest("[data-laasnu]")) sideknap();
    });
    inp.addEventListener("change", function () {
      const fil = inp.files && inp.files[0];
      if (!fil) return;
      const r = new FileReader();
      r.onload = function () {
        const billede = new Image();
        billede.onload = function () {
          // gøres mindre, så det kan gemmes
          const c = document.createElement("canvas");
          const s = Math.min(1, 900 / Math.max(billede.width, billede.height));
          c.width = Math.round(billede.width * s); c.height = Math.round(billede.height * s);
          c.getContext("2d").drawImage(billede, 0, 0, c.width, c.height);
          let data = "";
          try { data = c.toDataURL("image/jpeg", 0.82); } catch (e) { data = ""; }
          if (!data) { lille("Billedet kunne ikke bruges"); return; }
          ind.eget = data; ind.baggrund = "eget";
          try { gemInd(); } catch (e) {}
          try { localStorage.setItem(noegle(), JSON.stringify(ind)); }
          catch (e) { ind.eget = null; ind.baggrund = "solnedgang"; gemInd(); lille("Billedet er for stort"); }
          saetFarver();
          bevarScroll(tegnIndstillinger);
        };
        billede.src = r.result;
      };
      r.readAsDataURL(fil);
    });
  }
  function bevarScroll(fn) {
    const el = appEl && appEl.querySelector(".tlf-indhold");
    const y = el ? el.scrollTop : 0;
    fn();
    appEl.style.animation = "none";
    const ny = appEl.querySelector(".tlf-indhold");
    if (ny) ny.scrollTop = y;
  }

  // ---------------------------------------------------------------
  //  Sideknapper
  // ---------------------------------------------------------------
  function sideknap() {
    slukEl.classList.add("vis");
    setTimeout(function () { laas(); slukEl.classList.remove("vis"); }, 260);
  }
  krop.querySelectorAll(".tlf-knap").forEach(function (k) {
    k.addEventListener("click", function (e) {
      e.stopPropagation();
      const hvad = k.dataset.k;
      if (hvad === "taend") sideknap();
      else if (hvad === "handling") { ind.lyd = !ind.lyd; gemInd(); lille(ind.lyd ? "🔔 Lyd til" : "🔕 Lydløs"); if (appNu === "indst") bevarScroll(tegnIndstillinger); }
      else if (hvad === "op") { ind.lyd = true; gemInd(); lille("🔊 Lyd op"); }
      else if (hvad === "ned") lille("🔉 Lyd ned");
    });
  });

  // ---------------------------------------------------------------
  //  Ny besked: lille lyd, banner og vibration
  // ---------------------------------------------------------------
  let lydKontekst = null;
  function ding() {
    if (!ind.lyd) return;
    try {
      lydKontekst = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
      const nu = lydKontekst.currentTime;
      [[1318.5, 0], [1760, 0.09]].forEach(function (t) {
        const o = lydKontekst.createOscillator(), g = lydKontekst.createGain();
        o.type = "sine"; o.frequency.value = t[0];
        g.gain.setValueAtTime(0, nu + t[1]);
        g.gain.linearRampToValueAtTime(0.08, nu + t[1] + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, nu + t[1] + 0.35);
        o.connect(g); g.connect(lydKontekst.destination);
        o.start(nu + t[1]); o.stop(nu + t[1] + 0.4);
      });
    } catch (e) {}
  }
  function visBanner(navn, tekst) {
    bannerEl.innerHTML = notisHtml("beskeder", navn, tekst, "nu");
    bannerEl.classList.add("vis");
    clearTimeout(visBanner.t);
    visBanner.t = setTimeout(skjulBanner, 4200);
  }
  function skjulBanner() { bannerEl.classList.remove("vis"); }
  function nyBeskedKom(navn, tekst) {
    ding();
    if (tlf.hidden) {
      const k = document.getElementById("chat-venner-knap");
      if (k) { k.classList.remove("tlf-ring"); void k.offsetWidth; k.classList.add("tlf-ring"); }
      return;
    }
    tlf.classList.remove("tlf-vib"); void tlf.offsetWidth; tlf.classList.add("tlf-vib");
    if (skaermNu === "laas") laasNotiser();
    else if (!(appNu === "beskeder" && chatMed === navn)) visBanner(navn, tekst);
  }

  // ---------------------------------------------------------------
  //  Kobling til den gamle venne- og beskedkode
  // ---------------------------------------------------------------
  function opdaterAlt() {
    if (tlf.hidden) return;
    if (skaermNu === "laas") laasNotiser();
    else if (skaermNu === "hjem") tegnHjem();
    else if (chatMed) opdaterChat();
    else if (appNu === "beskeder" || appNu === "kontakter") opdaterListe();
  }

  if (typeof tilfoejBesked === "function") {
    const gammelTilfoej = tilfoejBesked;
    tilfoejBesked = function (navn, fra, tekst, ekstra) {
      gammelTilfoej(navn, fra, tekst, ekstra);
      // læser man samtalen i telefonen, er beskeden ikke ulæst
      if (!tlf.hidden && appNu === "beskeder" && chatMed === navn && typeof beskeder !== "undefined" && beskeder[navn]) {
        beskeder[navn].ulaest = 0;
        if (typeof gemBeskeder === "function") gemBeskeder();
        if (typeof visUlaest === "function") visUlaest();
      }
      if (fra !== mig() && fra !== "⚠️") nyBeskedKom(navn, tekst);
      opdaterAlt();
    };
  }
  if (typeof visVenner === "function") {
    const gammelVis = visVenner;
    visVenner = function () { gammelVis(); opdaterAlt(); };
  }
  if (typeof visBeskeder === "function") {
    const gammelBesk = visBeskeder;
    visBeskeder = function () { gammelBesk(); if (chatMed) opdaterChat(); };
  }
  // "💚 Ven" i gæste-menuen og andre steder åbner telefonens Kontakter
  if (typeof aabnVenner === "function") {
    aabnVenner = function () { aabnTelefon(); aabnApp("kontakter"); };
  }
  // Private beskeder (også advarsler fra ejeren) åbnes i telefonen
  if (typeof aabnBeskeder === "function") {
    aabnBeskeder = function (navn) {
      aabnTelefon();
      if (skaermNu === "laas") laasOp({ app: "beskeder", hvem: navn });
      else aabnApp("beskeder", navn);
    };
  }
  // "skriver …" fra en ven
  const skriverEl = document.getElementById("besked-skriver");
  if (skriverEl) new MutationObserver(function () { if (chatMed) opdaterChat(); }).observe(skriverEl, { attributes: true, attributeFilter: ["hidden"] });

  // ---------------------------------------------------------------
  //  Åbn / luk
  // ---------------------------------------------------------------
  function aabnTelefon() {
    if (!tlf.hidden) return;
    hentInd();
    saetFarver();
    tlf.hidden = false;
    placer();
    tlf.classList.remove("tlf-ind"); void tlf.offsetWidth; tlf.classList.add("tlf-ind");
    setTimeout(function () { tlf.classList.remove("tlf-ind"); placer(); }, 400);
    opdaterUr();
    if (ind.laas) laas();
    else if (skaermNu === "laas") laasOp();
    else opdaterAlt();
    const gl = document.getElementById("venner-vindue");
    if (gl) gl.hidden = true;
  }
  function lukTelefon() {
    if (tlf.hidden) return;
    lukApp(true);
    if (typeof beskedMed !== "undefined") beskedMed = null;
    tlf.hidden = true;
    skjulBanner();
  }
  window.aabnTelefon = aabnTelefon;
  window.lukTelefon = lukTelefon;

  // Venne-knappen i chatbaren åbner telefonen i stedet for vennelisten
  document.addEventListener("click", function (e) {
    const k = e.target.closest && e.target.closest("#chat-venner-knap");
    if (!k) return;
    e.stopPropagation();
    e.preventDefault();
    if (tlf.hidden) aabnTelefon(); else lukTelefon();
  }, true);
  const vk = document.getElementById("chat-venner-knap");
  if (vk) vk.title = "Telefon";

  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || tlf.hidden) return;
    if (skaermNu === "app") lukApp(); else lukTelefon();
  });
  // tastatur i telefonens felter må ikke styre spillet
  tlf.addEventListener("keydown", function (e) { if (e.target.matches("input, textarea") && e.key !== "Escape") e.stopPropagation(); });

  setInterval(function () { if (!tlf.hidden) opdaterUr(); }, 10000);
  saetFarver();
  opdaterUr();
})();
