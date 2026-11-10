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
    snake: "<path d='M5 18c0-3 3-3.5 6-3.5s6-.5 6-3.5-3-3.5-6-3.5' fill='none' stroke='#fff' stroke-width='3.4' stroke-linecap='round'/><circle cx='9.5' cy='7.5' r='2.6' fill='#fff'/><circle cx='9' cy='7' r='.8' fill='#1f8f5a'/><path d='M7 7.5H4.6' stroke='#ff5a5a' stroke-width='1' stroke-linecap='round'/>",
    byg: "<path d='M13.5 4.5l6 6-2.2 2.2-6-6z' fill='#fff'/><path d='M11.8 8.4 4 16.2a1.6 1.6 0 0 0 2.3 2.3l7.8-7.8z' fill='#7a4a1c'/><path d='M12 3.5c2-1 4.5-.6 6 1l-1.6 1.6-3.4-.4z' fill='#fff'/>",
    chatlog: "<path d='M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z' fill='#fff'/><path d='M9 8.5h6M9 11.5h6M9 14.5h4' stroke='#b08850' stroke-width='1.4'/>",
    smiley: "<circle cx='12' cy='12' r='8.5' fill='#fff'/><circle cx='9' cy='10' r='1.3' fill='#c98a10'/><circle cx='15' cy='10' r='1.3' fill='#c98a10'/><path d='M8.3 13.6a4.2 4.2 0 0 0 7.4 0' fill='none' stroke='#c98a10' stroke-width='1.6' stroke-linecap='round'/>",
    boble: "<path d='M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5a3.5 3.5 0 0 1-3.5 3.5H11l-4.5 4v-4A3.5 3.5 0 0 1 4 11.5z' fill='#fff'/><circle cx='9' cy='9' r='1.6' fill='#ff6f9c'/><circle cx='12.5' cy='9' r='1.6' fill='#ffc23a'/><circle cx='16' cy='9' r='1.6' fill='#4fd06a'/>",
    peep: "<path d='M5 14.5c0-4.6 3.2-8.5 7.6-8.5 3 0 5.4 2 5.4 4.8 0 .5 0 .9-.1 1.3l2.6.9-2.9 1.4c-.9 3.3-4 5.6-7.6 5.6H5.5c-.3 0-.5-.2-.5-.5z' fill='#fff'/><circle cx='14.4' cy='9.6' r='1.2' fill='#3a2a10'/><path d='M7.8 13.6c1.3 1.5 3.4 1.8 5 .9' fill='none' stroke='#ffb03a' stroke-width='1.5' stroke-linecap='round'/>",
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
    byg:       { navn: "Byg",           ik: "byg",     bg: "linear-gradient(#ffcf6b, #e08a1e)", knap: "byg-aabn" },
    chatlog:   { navn: "Chatlog",       ik: "chatlog", bg: "linear-gradient(#f3e3c0, #c9a46a)", knap: "chat-log-knap" },
    smileys:   { navn: "Smileys",       ik: "smiley",  bg: "linear-gradient(#ffe36b, #f5b821)", knap: "chat-smiley-knap" },
    boble:     { navn: "Taleboble",     ik: "boble",   bg: "linear-gradient(#7fd3ff, #3a8fe0)", knap: "chat-farve-knap" },
    peep:      { navn: "Peep",          ik: "peep",    bg: "linear-gradient(#ffc94a, #ff7a3d)" },
    snake:     { navn: "Snake",         ik: "snake",   bg: "linear-gradient(#5fd38d, #1f8f5a)" },
    noter:     { navn: "Noter",         ik: "noter",   bg: "linear-gradient(#ffe57a, #f5c42c)" },
    lager:     { navn: "Mine ting",     ik: "lager",   bg: "linear-gradient(#d9a868, #9c6a32)" },
    indst:     { navn: "Indstillinger", ik: "gear",    bg: "linear-gradient(#a8aeb8, #6b717b)" },
  };
  const GITTER = ["peep", "shop", "lager", "byg", "kamera", "fotos", "chatlog", "smileys", "boble", "events", "noter", "snake"];
  // ----- App Butik: spil man kan hente for sjov (giver ingen Glimt) -----
  function emojiIk(e) { return "<text x='12' y='17.5' font-size='15' text-anchor='middle'>" + e + "</text>"; }
  IK.butik = "<path d='M12 3.5 14.4 9h5.8l-4.7 3.6 1.8 5.7L12 14.8l-5.3 3.5 1.8-5.7L3.8 9h5.8z' fill='#fff'/><path d='M12 9.2v5.2M9.8 12.4 12 14.6l2.2-2.2' stroke='#2f7de1' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/>";
  IK.stjerner = emojiIk("🌟"); IK.flagre = emojiIk("🐤"); IK.huske = emojiIk("🃏"); IK.muldvarp = emojiIk("🐹"); IK.kryds = emojiIk("⭕");
  APPS.butik = { navn: "App Butik", ik: "butik", bg: "linear-gradient(#6cc4ff, #2f6fe0)" };
  APPS.stjerner = { navn: "Stjerneregn", ik: "stjerner", bg: "linear-gradient(#3a3f8f, #151a45)", spil: true, tekst: "Fang de faldende stjerner i kurven, men pas på tordenskyerne!" };
  APPS.flagre = { navn: "Flagre", ik: "flagre", bg: "linear-gradient(#ffb98a, #e0567a)", spil: true, tekst: "Tryk for at flagre den lille fugl forbi hotellets søjler." };
  APPS.huske = { navn: "Huskespil", ik: "huske", bg: "linear-gradient(#b7f0c8, #3fae6a)", spil: true, tekst: "Vend kortene og find alle par med så få træk som muligt." };
  APPS.muldvarp = { navn: "Muldvarpe", ik: "muldvarp", bg: "linear-gradient(#d8b48a, #8a5a2b)", spil: true, tekst: "Slå de små hamstere, når de stikker hovedet op. 30 sekunder!" };
  APPS.kryds = { navn: "Kryds & bolle", ik: "kryds", bg: "linear-gradient(#ffffff, #cfd6e4)", spil: true, tekst: "Spil mod telefonen. Kan du vinde mange gange i træk?" };
  IK.stribe = "<circle cx='7' cy='7' r='3.2' fill='#ff5c8a'/><circle cx='17' cy='7' r='3.2' fill='#ffc93c'/><circle cx='7' cy='17' r='3.2' fill='#ffc93c'/><circle cx='12' cy='12' r='3.2' fill='#ff5c8a'/><circle cx='17' cy='17' r='3.2' fill='#ff5c8a'/>";
  APPS.stribe = { navn: "Stjernestribe", ik: "stribe", bg: "linear-gradient(#3b4aa8, #1c2366)", spil: true, multi: true, tekst: "👫 Spil mod dine venner! Invitér en ven og læg fire på stribe. I skal begge have hentet spillet." };
  const ALLE_SPIL = ["stribe", "stjerner", "flagre", "huske", "muldvarp", "kryds"];
  // 3 apps man kan hente i App Butik (ikke spil)
  IK.net = "<circle cx='12' cy='12' r='8.2' fill='none' stroke='#fff' stroke-width='1.7'/><ellipse cx='12' cy='12' rx='3.6' ry='8.2' fill='none' stroke='#fff' stroke-width='1.5'/><path d='M4 12h16M5.4 7.8h13.2M5.4 16.2h13.2' stroke='#fff' stroke-width='1.4'/>";
  IK.mail = "<rect x='3.5' y='6' width='17' height='12.5' rx='2.4' fill='#fff'/><path d='M4.5 7.5 12 13l7.5-5.5' fill='none' stroke='#e0445a' stroke-width='1.7' stroke-linejoin='round'/>";
  IK.musik = "<path d='M9.5 17V6.5l9-2v10.5' fill='none' stroke='#fff' stroke-width='1.9' stroke-linejoin='round'/><ellipse cx='7.4' cy='17.2' rx='2.6' ry='2.1' fill='#fff'/><ellipse cx='16.4' cy='15.2' rx='2.6' ry='2.1' fill='#fff'/>";
  APPS.net = { navn: "Vera-Net", ik: "net", bg: "linear-gradient(#5fd0ff, #2a5fd6)", spil: true, app: true, tekst: "Hotellets egen browser 🌐 Søg, faner, bogmærker, favoritter, seneste besøg – og design din egen forside." };
  APPS.mail = { navn: "Vera-Mail", ik: "mail", bg: "linear-gradient(#ff9a8a, #e0445a)", spil: true, app: true, tekst: "Send mails til de andre gæster ✉️ Indbakke, sendt, emne, stjerner og svar." };
  APPS.musik = { navn: "Music Box", ik: "musik", bg: "linear-gradient(#ff7ad9, #7a3cff)", spil: true, app: true, tekst: "Hotellets egen musik 🎵 Stemninger, album, favoritter, playlister og kø. Ingen ophavsret." };
  const ALLE_APPS = ["net", "mail", "musik"];
  GITTER.push("butik");
  // 🧮 Lommeregner — fast app, følger med telefonen
  IK.regn = "<rect x='5' y='3' width='14' height='18' rx='2.6' fill='#fff'/><rect x='7.2' y='5.2' width='9.6' height='4' rx='1' fill='#ff9f0a'/><g fill='#4c515a'><circle cx='8.8' cy='12.6' r='1.15'/><circle cx='12' cy='12.6' r='1.15'/><circle cx='15.2' cy='12.6' r='1.15'/><circle cx='8.8' cy='16.2' r='1.15'/><circle cx='12' cy='16.2' r='1.15'/></g><circle cx='15.2' cy='16.2' r='1.15' fill='#ff9f0a'/>";
  APPS.regn = { navn: "Lommeregner", ik: "regn", bg: "linear-gradient(#5a5f69, #1f2126)" };
  GITTER.push("regn");
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
  let ind = { farve: "rosa", baggrund: "solnedgang", lyd: true, laas: true, eget: null, bat: 100, powerbanks: 0 };
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
    // Widgets
    ".tlf-hjem-rul { position: absolute; top: 50px; left: 0; right: 0; bottom: 132px; overflow-y: auto; overflow-x: hidden; padding: 4px 16px 10px; scrollbar-width: none; }",
    ".tlf-hjem-rul::-webkit-scrollbar { display: none; }",
    ".tlf-widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; grid-auto-flow: row dense; }",
    ".tlf-widgets:empty { display: none; }",
    ".tlf-w { position: relative; height: 122px; border-radius: 22px; padding: 12px 14px; box-sizing: border-box; overflow: visible; cursor: pointer; color: var(--t-hvid); background: var(--t-moerkglas); backdrop-filter: blur(18px) saturate(1.5); -webkit-backdrop-filter: blur(18px) saturate(1.5); box-shadow: 0 4px 14px var(--t-skygge3); display: flex; flex-direction: column; transition: transform .15s; }",
    ".tlf-w.bred { grid-column: span 2; }",
    ".tlf-w .w1 { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; opacity: .8; font-weight: 600; }",
    ".tlf-w .w2 { font-size: 30px; font-weight: 600; margin: 2px 0; font-variant-numeric: tabular-nums; line-height: 1.1; }",
    ".tlf-w .w2 small { font-size: 15px; opacity: .7; }",
    ".tlf-w .w3 { font-size: 12px; opacity: .9; display: flex; justify-content: space-between; gap: 6px; margin-top: auto; overflow: hidden; }",
    ".tlf-w .w3.lo { flex-direction: column; gap: 1px; } .tlf-w .w3 span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-w.w-ur, .tlf-w.w-kalender, .tlf-w.w-beskeder { background: var(--t-hvid); color: var(--t-tekst); backdrop-filter: none; }",
    ".tlf-w.w-ur.lille { padding: 8px; align-items: center; justify-content: center; }",
    ".w-ur { width: 100%; height: 100%; color: var(--t-tekst); }",
    ".tlf-w.bred .w-ur { width: 98px; height: 98px; flex: none; }",
    ".w-raekke { display: flex; align-items: center; gap: 14px; height: 100%; min-width: 0; }",
    ".w-raekke .w3 { opacity: .6; }",
    ".w-kal { display: flex; flex-direction: column; flex: none; }",
    ".w-kal i { font-style: normal; color: var(--t-rod); font-weight: 600; font-size: 13px; text-transform: capitalize; }",
    ".w-kal b { font-size: 48px; font-weight: 300; line-height: 1; } .w-kal small { color: var(--t-graa); font-size: 12px; }",
    ".w-ev { flex: 1; min-width: 0; border-left: 3px solid var(--t-acc); padding-left: 10px; }",
    ".w-ev small { color: var(--t-graa); font-size: 11px; text-transform: uppercase; } .w-ev b { display: block; font-size: 14px; } .w-ev span { display: block; font-size: 12px; color: var(--t-graa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-w.w-penge { background: linear-gradient(145deg, #f7dc8a, #c9952f); color: #4a3008; backdrop-filter: none; }",
    ".w-penge { display: flex; flex-direction: column; gap: 4px; margin-top: auto; } .w-penge.bred { flex-direction: row; gap: 18px; }",
    ".w-penge span { display: flex; align-items: center; gap: 6px; } .w-penge img { width: 20px; height: 20px; image-rendering: pixelated; }",
    ".w-penge b { font-size: 20px; font-variant-numeric: tabular-nums; } .w-penge small { font-size: 11px; opacity: .8; }",
    ".w-av { display: flex; gap: 4px; margin-top: auto; align-items: center; } .w-av .tlf-av { box-shadow: 0 0 0 2px var(--t-hvid); }",
    ".w-top { display: flex; align-items: center; gap: 7px; } .w-top svg { width: 26px; height: 26px; padding: 4px; border-radius: 8px; background: linear-gradient(#6ee67e, #22b43c); box-sizing: border-box; } .w-top b { font-size: 14px; }",
    ".w-besked { margin-top: auto; font-size: 12.5px; min-width: 0; } .w-besked b { display: block; } .w-besked span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--t-graa); }",
    ".tlf-w.w-beskeder .w3 { color: var(--t-graa); }",
    ".tlf-w.w-events { background: linear-gradient(145deg, #7a4bd6, #2d1a6b); backdrop-filter: none; }",
    ".w-tit { display: block; font-size: 16px; margin-top: 6px; line-height: 1.2; overflow: hidden; max-height: 40px; }",
    ".tlf-w.w-noter { background: linear-gradient(#fff7c7, #ffe98a); color: #4a3a08; backdrop-filter: none; }",
    ".w-note { margin-top: 6px; font-size: 13px; line-height: 1.35; white-space: pre-wrap; overflow: hidden; flex: 1; } .w-note i { opacity: .55; }",
    // Rediger (vrikke-tilstand)
    ".tlf-hjem.rediger .tlf-w, .tlf-hjem.rediger .tlf-app-ik .fl { animation: tlfVrik .28s ease-in-out infinite alternate; }",
    ".tlf-hjem.rediger .tlf-w:nth-child(2n), .tlf-hjem.rediger .tlf-app-ik:nth-child(2n) .fl { animation-delay: -.14s; }",
    "@keyframes tlfVrik { from { rotate: -1.2deg } to { rotate: 1.2deg } }",
    ".tlf-mappe-ik .fl { background: rgba(255,255,255,.3); backdrop-filter: blur(14px) saturate(1.5); -webkit-backdrop-filter: blur(14px) saturate(1.5); }",
    ".tlf-mappe-ik .mp-mini { display: grid; grid-template-columns: repeat(3, 12px); grid-auto-rows: 12px; gap: 3px; padding: 6px; width: 100%; height: 100%; box-sizing: border-box; align-content: start; }",
    ".tlf-mappe-ik .mp-mini i { border-radius: 3.5px; display: grid; place-items: center; box-shadow: 0 1px 1px rgba(0,0,0,.18); }",
    ".tlf-mappe-ik .mp-mini i svg { width: 8px; height: 8px; filter: none; }",
    ".tlf-app-ik.traekkes { z-index: 6; }",
    ".tlf-gitter .tlf-app-ik.maal-mappe .fl { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(255,255,255,.6), 0 4px 14px rgba(0,0,0,.3); }",
    ".tlf-gitter .tlf-app-ik.maal-foer .fl { box-shadow: -7px 0 0 -2px rgba(255,255,255,.95); }",
    ".tlf-gitter .tlf-app-ik.maal-efter .fl { box-shadow: 7px 0 0 -2px rgba(255,255,255,.95); }",
    ".tlf-mappe-aaben { position: absolute; inset: 0; z-index: 44; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: rgba(20,14,30,.2); backdrop-filter: blur(24px) saturate(1.3); -webkit-backdrop-filter: blur(24px) saturate(1.3); opacity: 0; transition: opacity .25s; }",
    ".tlf-mappe-aaben.vis { opacity: 1; }",
    ".tlf-mappe-aaben .mp-boks { width: 252px; min-height: 120px; padding: 20px 12px; border-radius: 34px; background: rgba(255,255,255,.28); box-sizing: border-box; box-shadow: inset 0 1px 0 rgba(255,255,255,.35); transform: scale(.35); transition: transform .32s cubic-bezier(.2,.9,.3,1.15), background .2s; }",
    ".tlf-mappe-aaben.vis .mp-boks { transform: scale(1); }",
    ".tlf-mappe-aaben .mp-boks.ud-af { background: rgba(255,255,255,.1); }",
    ".tlf-mappe-aaben .mp-gitter { display: grid; grid-template-columns: repeat(3, 1fr); row-gap: 16px; }",
    ".tlf-mappe-aaben .mp-navn input { background: transparent; border: 0; outline: 0; color: var(--t-hvid); font: 700 26px -apple-system, 'Segoe UI', sans-serif; text-align: center; width: 240px; padding: 4px 10px; border-radius: 12px; text-shadow: 0 1px 6px rgba(0,0,0,.35); cursor: text; box-sizing: border-box; }",
    ".tlf-mappe-aaben .mp-navn input:hover { background: rgba(255,255,255,.12); }",
    ".tlf-mappe-aaben .mp-navn input:focus { background: rgba(255,255,255,.25); }",
    ".tlf-mappe-aaben .mp-hjaelp { color: var(--t-hvid); font-size: 11px; opacity: .85; text-align: center; width: 220px; text-shadow: 0 1px 3px rgba(0,0,0,.4); }",
    ".tlf-mappe-aaben.rediger .tlf-app-ik .fl { animation: tlfVrik .28s ease-in-out infinite alternate; }",
    ".tlf-mappe-aaben.rediger .tlf-app-ik:nth-child(2n) .fl { animation-delay: -.14s; }",
    ".tlf-w.traekkes { animation: none !important; z-index: 5; box-shadow: 0 14px 30px var(--t-skygge); opacity: .92; transition: none; }",
    ".tlf-w.maal { outline: 3px dashed var(--t-hvid); outline-offset: 2px; }",
    ".w-fjern { position: absolute; top: -7px; left: -7px; width: 24px; height: 24px; border-radius: 50%; border: 0; padding: 0; background: var(--t-glas2); color: var(--t-tekst); font-size: 20px; line-height: 22px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px var(--t-skygge2); z-index: 3; }",
    ".tlf-redbar { position: absolute; top: 46px; left: 14px; right: 14px; z-index: 5; display: flex; justify-content: space-between; }",
    ".tlf-redbar button { border: 0; border-radius: 16px; padding: 5px 13px; font-family: inherit; font-weight: 600; font-size: 13px; cursor: pointer; background: var(--t-glas2); color: var(--t-tekst); box-shadow: 0 2px 8px var(--t-skygge2); }",
    ".tlf-hjem.rediger .tlf-hjem-rul { top: 80px; }",
    // Galleriet med widgets
    ".tlf-ark { position: absolute; inset: 0; z-index: 45; background: rgba(0,0,0,.0); transition: background .3s; }",
    ".tlf-ark.vis { background: var(--t-moerkglas); }",
    ".ark-inde { position: absolute; left: 0; right: 0; bottom: 0; top: 70px; border-radius: 26px 26px 0 0; background: var(--t-lys); display: flex; flex-direction: column; transform: translateY(100%); transition: transform .32s cubic-bezier(.2,.9,.3,1); }",
    ".tlf-ark.vis .ark-inde { transform: translateY(0); }",
    ".ark-top { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px 8px; } .ark-top b { font-size: 17px; }",
    ".ark-top .lnk { border: 0; background: none; color: var(--t-acc); font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; padding: 0; }",
    ".ark-fuld { margin: 0 18px 6px; font-size: 12px; color: var(--t-rod); }",
    ".ark-liste { flex: 1; overflow-y: auto; padding: 4px 14px 30px; scrollbar-width: none; }",
    ".ark-liste::-webkit-scrollbar { display: none; }",
    ".ark-w { display: flex; gap: 12px; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 16px; background: var(--t-hvid); }",
    ".ark-vis { flex: none; width: 92px; height: 92px; position: relative; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, var(--t-k2), var(--t-k3)); }",
    ".ark-vis .tlf-w { position: absolute; left: 0; top: 0; width: 122px; height: 122px; transform: scale(.754); transform-origin: 0 0; cursor: default; pointer-events: none; }",
    ".ark-vis .tlf-w.bred { width: 256px; transform: scale(.36); top: 24px; }",
    ".ark-info { flex: 1; min-width: 0; } .ark-info b { display: block; font-size: 14px; } .ark-info small { display: block; color: var(--t-graa); font-size: 12px; margin: 2px 0 6px; }",
    ".ark-info span { display: flex; gap: 6px; flex-wrap: wrap; }",
    ".ark-info button { border: 0; border-radius: 13px; padding: 4px 10px; font-family: inherit; font-weight: 600; font-size: 12px; background: var(--t-acc); color: var(--t-hvid); cursor: pointer; }",
    ".ark-info button:disabled { background: var(--t-felt2); cursor: default; }",
    // Batteri og oplader
    ".tlf-status .st-pct { fill: #fff; stroke: rgba(0,0,0,.55); stroke-width: 1.6px; paint-order: stroke; }",
    ".tlf-status.lav .st-bat { fill: var(--t-rod); } .tlf-status.lader .st-bat { fill: var(--t-on); } .tlf-status.spare .st-bat { fill: #ffcc00; }",
    ".tlf-batadv { position: absolute; inset: 0; z-index: 74; background: rgba(0,0,0,.35); display: grid; place-items: center; animation: tlfApp .2s ease-out; }",
    ".tlf-batadv.ud { opacity: 0; transition: opacity .2s; }",
    ".ba-boks { width: 230px; border-radius: 16px; background: rgba(250,250,252,.96); color: #1c1c1e; text-align: center; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.35); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }",
    ".ba-ik { font-size: 30px; padding-top: 14px; } .ba-boks b { display: block; font-size: 16px; margin-top: 2px; } .ba-boks.kritisk b { color: #ff3b30; }",
    ".ba-boks p { margin: 4px 14px 14px; font-size: 12.5px; line-height: 1.4; color: #3a3a3c; }",
    ".ba-boks button { display: block; width: 100%; border: 0; border-top: 1px solid rgba(60,60,67,.18); background: none; padding: 11px; font: inherit; font-size: 15px; color: #0a84ff; cursor: pointer; }",
    ".ba-boks button:hover { background: rgba(0,0,0,.04); } .ba-boks button.luk { font-weight: 700; }",
    ".tlf-laas .lader { margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 14px; background: var(--t-moerkglas); font-size: 13px; font-weight: 600; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }",
    ".tlf-laas .lader[hidden] { display: none; }",
    ".tlf-doed { position: absolute; inset: 0; z-index: 85; background: var(--t-sort); color: var(--t-graa); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px; gap: 6px; cursor: default; }",
    ".tlf-doed[hidden] { display: none; }",
    ".tlf-doed p { margin: 14px 0 0; color: var(--t-hvid); font-size: 15px; font-weight: 600; } .tlf-doed small { font-size: 12px; line-height: 1.4; }",
    ".doed-bat { width: 74px; height: 34px; border: 3px solid var(--t-graa); border-radius: 9px; position: relative; padding: 3px; box-sizing: border-box; animation: tlfPuls 2s ease-in-out infinite; }",
    ".doed-bat::after { content: ''; position: absolute; right: -9px; top: 9px; width: 5px; height: 10px; border-radius: 0 3px 3px 0; background: var(--t-graa); }",
    ".doed-bat i { display: block; width: 8%; height: 100%; border-radius: 4px; background: var(--t-rod); }",
    ".tlf-doed.lader .doed-bat i { background: var(--t-on); }",
    ".doed-pb { margin-top: 14px; border: 0; border-radius: 16px; padding: 7px 14px; background: var(--t-on); color: var(--t-hvid); font-family: inherit; font-weight: 600; cursor: pointer; }",
    ".doed-pb[hidden] { display: none; }",
    ".tlf-kabel { position: absolute; left: 50%; top: 100%; margin-left: -9px; width: 18px; pointer-events: none; z-index: -1; }",
    ".tlf-kabel[hidden] { display: none; }",
    ".tlf-farver button .acc-som { font-size: 13px; }",
    ".ab-faner { display: flex; gap: 4px; padding: 3px; border-radius: 12px; background: var(--t-felt); margin-bottom: 10px; }",
    ".ab-faner button { flex: 1; border: 0; border-radius: 9px; padding: 6px 4px; background: none; color: var(--t-tekst); font: 600 12px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; }",
    ".ab-faner button.valgt { background: var(--t-hvid); box-shadow: 0 1px 3px rgba(0,0,0,.15); }",
    ".ab-lille { font-size: 12px; color: var(--t-graa); margin: 0 2px 6px; }",
    ".ab-fejl { font-size: 12px; background: #fff3d6; color: #7a5600; border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; }",
    ".ab-nr { flex: none; width: 18px; text-align: center; font-weight: 700; color: var(--t-graa); } .ab-nr.top { color: #e0a000; }",
    ".ab-tal { display: flex; justify-content: space-around; background: var(--t-hvid); border-radius: 14px; padding: 10px 6px; text-align: center; font-size: 11px; color: var(--t-graa); }",
    ".ab-tal b { display: block; font-size: 20px; color: var(--t-tekst); }",
    ".ab-laast { font-size: 16px; opacity: .55; }",
    ".ab-ik .tlf-kal { width: 52px; height: 52px; border-radius: 13px; background: #fff; }",
    "#lommelygte-lys { position: fixed; inset: 0; z-index: 3; pointer-events: none; opacity: 0; transition: opacity .35s; }",
    "#lommelygte-lys.til { opacity: 1; }",
    ".tlf-status .st-5g { font-size: 12px; font-weight: 700; letter-spacing: -.2px; line-height: 1; }",
    ".tlf-kode { position: absolute; inset: 0; z-index: 80; display: flex; flex-direction: column; align-items: center; padding-top: 70px; color: #fff; background: rgba(15,12,25,.55); backdrop-filter: blur(26px) saturate(1.2); -webkit-backdrop-filter: blur(26px) saturate(1.2); animation: kdInd .2s ease-out; }",
    "@keyframes kdInd { from { opacity: 0; } to { opacity: 1; } }",
    ".tlf-kode .kd-titel { font-size: 17px; font-weight: 600; }",
    ".tlf-kode .kd-under { min-height: 30px; font-size: 12px; opacity: .85; text-align: center; padding: 4px 24px 0; line-height: 1.3; }",
    ".tlf-kode .kd-prikker { display: flex; gap: 14px; margin: 10px 0 26px; }",
    ".tlf-kode .kd-prikker i { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #fff; box-sizing: border-box; transition: background .1s; }",
    ".tlf-kode .kd-prikker i.fyldt { background: #fff; }",
    ".tlf-kode .kd-prikker.ryst { animation: tlfVib .4s; }",
    ".tlf-kode .kd-tal { display: grid; grid-template-columns: repeat(3, 66px); gap: 14px 20px; }",
    ".tlf-kode .kd-tal button { width: 66px; height: 66px; border-radius: 50%; border: 0; background: rgba(255,255,255,.2); color: #fff; font: 400 28px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; }",
    ".tlf-kode .kd-tal button:hover { background: rgba(255,255,255,.28); } .tlf-kode .kd-tal button:active { background: rgba(255,255,255,.55); }",
    ".tlf-kode .kd-tal button.slet { background: none; font-size: 22px; }",
    ".tlf-kode .kd-bund { display: flex; justify-content: space-between; width: 230px; margin-top: 20px; }",
    ".tlf-kode .kd-bund button { border: 0; background: none; color: #fff; font: 15px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; }",
    ".tlf-kode .kd-bund button[hidden] { visibility: hidden; display: inline; }",
    "#ejer-indhold .tk-tabel { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }",
    "#ejer-indhold .tk-tabel th, #ejer-indhold .tk-tabel td { text-align: left; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.1); }",
    "#ejer-indhold .tk-kode { font-family: monospace; font-size: 16px; letter-spacing: 3px; font-weight: 700; }",
    "#ejer-indhold .lv-knap.sikker { background: #c0392b; color: #fff; }",
    ".sp-stribe .sn-tal { display: none; }",
    ".sp-stribe .sp-braet { width: 100%; }",
    ".st-boks { width: 100%; }",
    ".st-note { font-size: 12px; background: #3a2f12; color: #ffd98a; border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; line-height: 1.4; }",
    ".st-ov { font-size: 13px; font-weight: 700; margin: 12px 2px 6px; color: #fff; }",
    ".st-raekke { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 12px; background: #1b1f2a; margin-bottom: 6px; }",
    ".st-raekke.klik { cursor: pointer; } .st-raekke.klik:hover { background: #242a38; }",
    ".st-raekke.ny { background: #2b2350; box-shadow: 0 0 0 1px #6a5bff; }",
    ".st-raekke.lille { font-size: 12px; color: #9a9aa6; padding: 6px 10px; }",
    ".st-raekke > span:not(.tlf-av) { flex: 1; min-width: 0; font-size: 13px; } .st-raekke .tlf-av { flex: none; } .st-raekke small { display: block; font-size: 11px; color: #9a9aa6; }",
    ".st-raekke button, .st-kamptop button, .st-opgiv { border: 0; border-radius: 14px; padding: 6px 12px; background: #2c3242; color: #e9e9ee; font: 600 12px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; }",
    ".st-raekke button.ja, .st-opgiv.ja { background: #34c759; color: #fff; }",
    ".st-raekke button:disabled { opacity: .35; cursor: default; }",
    ".st-raekke button.sikker, .st-opgiv.sikker { background: #ff3b30; color: #fff; }",
    ".st-tom { font-size: 12px; color: #9a9aa6; padding: 6px 4px; }",
    ".st-kamptop { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 12px; margin-bottom: 8px; }",
    ".st-kamptop span { display: flex; align-items: center; gap: 4px; }",
    ".st-status { text-align: center; font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #c8c8d2; }",
    ".st-status.min { color: #ffd60a; }",
    ".st-net { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; padding: 7px; border-radius: 14px; background: linear-gradient(#3b4aa8, #26307a); box-shadow: 0 6px 18px rgba(0,0,0,.5); }",
    ".st-net.min .st-felt { cursor: pointer; }",
    ".st-felt { aspect-ratio: 1; border: 0; padding: 0; border-radius: 50%; background: #0e1238; display: grid; place-items: center; cursor: default; }",
    ".st-net.min .st-felt:hover { background: #1b2160; }",
    ".st-felt.sidst .st-brik { box-shadow: 0 0 0 2px #fff; }",
    ".st-felt.vind .st-brik { animation: stVind .6s ease-in-out infinite alternate; }",
    "@keyframes stVind { from { transform: scale(1); } to { transform: scale(1.18); } }",
    ".st-brik { display: inline-block; width: 82%; height: 82%; border-radius: 50%; animation: stFald .3s ease-in; }",
    ".st-kamptop .st-brik { width: 12px; height: 12px; animation: none; }",
    ".st-brik.b1 { background: radial-gradient(circle at 35% 35%, #ff9ab6, #ff5c8a 60%, #c92a5c); }",
    ".st-brik.b2 { background: radial-gradient(circle at 35% 35%, #ffe6a0, #ffc93c 60%, #d09412); }",
    "@keyframes stFald { from { transform: translateY(-60px); opacity: .3; } to { transform: translateY(0); opacity: 1; } }",
    ".st-opgiv { display: block; margin: 12px auto 0; }",
    "#spil-popup { position: fixed; z-index: 9000; right: 18px; bottom: 90px; width: 270px; padding: 14px; border-radius: 22px; background: rgba(30,28,40,.94); color: #fff; font: 13px -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,.45); display: none; text-align: center; }",
    "#spil-popup.vis { display: block; animation: spPop .35s cubic-bezier(.2,.9,.3,1.3); }",
    "@keyframes spPop { from { transform: translateY(30px) scale(.8); opacity: 0; } to { transform: none; opacity: 1; } }",
    "#spil-popup .sp-pop-ik { font-size: 30px; }",
    "#spil-popup .sp-pop-tekst { margin: 4px 0 10px; line-height: 1.4; }",
    "#spil-popup .sp-pop-knapper { display: flex; gap: 8px; justify-content: center; }",
    "#spil-popup button { border: 0; border-radius: 16px; padding: 8px 14px; font: 700 13px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; background: #3a3f52; color: #fff; }",
    "#spil-popup button.ja { background: #34c759; }",
    ".tlf-app-ik .slet-x { position: absolute; top: -6px; left: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(120,120,128,.92); color: #fff; font: 700 16px/19px -apple-system, sans-serif; text-align: center; text-shadow: none; z-index: 3; box-shadow: 0 1px 3px rgba(0,0,0,.3); }",
    ".ab-indhold { flex: 1; overflow-y: auto; scrollbar-width: none; background: var(--t-lys); padding: 10px 12px 30px; }",
    ".ab-hero { border-radius: 18px; padding: 14px; color: #fff; background: linear-gradient(135deg, #5b6cff, #b05bff 60%, #ff7aa8); box-shadow: 0 4px 14px rgba(91,108,255,.3); }",
    ".ab-hero b { display: block; font-size: 19px; } .ab-hero span { font-size: 12px; opacity: .92; line-height: 1.4; }",
    ".ab-overskrift { font-size: 18px; font-weight: 700; margin: 14px 2px 6px; }",
    ".ab-kort { display: flex; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--t-linje); }",
    ".ab-ik { flex: none; width: 52px; height: 52px; border-radius: 13px; display: grid; place-items: center; box-shadow: 0 1px 4px rgba(0,0,0,.18); }",
    ".ab-ik svg { width: 32px; height: 32px; }",
    ".ab-info { flex: 1; min-width: 0; } .ab-info b { display: block; font-size: 14px; } .ab-info small { display: block; font-size: 11px; color: var(--t-graa); line-height: 1.3; } .ab-info i { display: block; font-style: normal; font-size: 11px; color: #b07a00; margin-top: 2px; }",
    ".ab-knapper { flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; }",
    ".ab-knapper button { border: 0; border-radius: 14px; padding: 5px 14px; background: rgba(47,111,224,.12); color: #2f6fe0; font: 700 12px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; }",
    ".ab-knapper button.ab-slet { background: none; color: var(--t-rod); font-weight: 500; font-size: 10px; padding: 0; }",
    ".ab-knapper button.ab-slet.sikker { font-weight: 700; }",
    ".ab-ring { position: relative; width: 30px; height: 30px; border-radius: 50%; background: conic-gradient(#2f6fe0 calc(var(--p, 0) * 1%), rgba(47,111,224,.16) 0); display: grid; place-items: center; }",
    ".ab-ring::after { content: ''; width: 9px; height: 9px; border-radius: 2px; background: #2f6fe0; box-shadow: 0 0 0 8px var(--t-lys); }",
    ".ab-pct { font-size: 10px; color: var(--t-graa); font-variant-numeric: tabular-nums; }",
    "@keyframes abSpin { to { transform: rotate(360deg); } }",
    ".ab-note { font-size: 11px; color: var(--t-graa); text-align: center; margin: 14px 6px 0; line-height: 1.4; }",
    ".sp-indhold { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px 10px 26px; overflow-y: auto; scrollbar-width: none; background: #0e1015; color: #e9e9ee; }",
    ".sp-braet { position: relative; display: flex; justify-content: center; touch-action: none; min-height: 250px; }",
    ".sp-braet canvas { border-radius: 12px; box-shadow: 0 0 0 2px #2a2d38, 0 6px 18px rgba(0,0,0,.5); cursor: pointer; }",
    ".sp-hjaelp { font-size: 11px; color: #9a9aa6; text-align: center; margin: 10px 6px 0; line-height: 1.4; }",
    ".hk-net { display: grid; grid-template-columns: repeat(4, 56px); gap: 7px; padding: 6px; }",
    ".hk-kort { position: relative; width: 56px; height: 66px; border: 0; padding: 0; background: none; cursor: pointer; }",
    ".hk-kort span { position: absolute; inset: 0; border-radius: 10px; display: grid; place-items: center; }",
    ".hk-kort .bag { background: linear-gradient(135deg, #5b6cff, #b05bff); color: rgba(255,255,255,.7); font-size: 22px; }",
    ".hk-kort .for { background: #fff; font-size: 30px; display: none; }",
    ".hk-kort.vendt .bag { display: none; } .hk-kort.vendt .for { display: grid; animation: hkVend .25s ease-out; }",
    "@keyframes hkVend { from { transform: scaleX(0); } to { transform: scaleX(1); } }",
    ".hk-kort.par .for { background: #d9ffe3; box-shadow: 0 0 0 2px #34c759; }",
    ".mv-net { display: grid; grid-template-columns: repeat(3, 76px); gap: 10px; padding: 14px; border-radius: 16px; background: linear-gradient(#6fbf5a, #3f8f3a); }",
    ".mv-hul { position: relative; width: 76px; height: 76px; border: 0; padding: 0; border-radius: 50%; background: radial-gradient(ellipse at 50% 65%, #2b1a0e 45%, #5a3b22 47%, #7a5232 70%, transparent 72%); overflow: hidden; cursor: pointer; }",
    ".mv-hul span { position: absolute; left: 0; right: 0; bottom: -40px; font-size: 40px; transition: bottom .12s; pointer-events: none; }",
    ".mv-hul.oppe span { bottom: 14px; } .mv-hul.ramt span { bottom: -40px; }",
    ".mv-hul.ramt { box-shadow: inset 0 0 0 3px #ffd60a; }",
    ".kb-net { display: grid; grid-template-columns: repeat(3, 74px); gap: 6px; padding: 8px; border-radius: 16px; background: #262a35; }",
    ".kb-felt { width: 74px; height: 74px; border: 0; border-radius: 12px; background: #11141b; color: #fff; font-size: 36px; cursor: pointer; }",
    ".kb-felt:hover { background: #1a1e28; } .kb-felt.vind { background: #2f6b3f; }",
    ".nt-liste { flex: 1; overflow-y: auto; scrollbar-width: none; background: var(--t-papir); }",
    ".nt-antal { font-size: 12px; color: var(--t-graa); padding: 10px 16px 4px; }",
    ".nt-liste ul { list-style: none; margin: 0; padding: 0 0 30px; }",
    ".nt-liste li { padding: 10px 16px; border-bottom: 1px solid var(--t-linje); cursor: pointer; }",
    ".nt-liste li:hover { background: var(--t-hover); }",
    ".nt-liste li b { display: block; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .nt-liste li small { display: block; font-size: 12px; color: var(--t-graa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".tlf-tb.nt-tilbage { width: auto; display: flex; align-items: center; gap: 0; color: #d6a21e; font: 500 15px -apple-system, 'Segoe UI', sans-serif; }",
    ".tlf-tb.sikker { color: var(--t-rod); font-size: 12px; font-weight: 700; width: auto; }",
    ".tlf-laas .tlf-pb-knap { font-size: 20px; line-height: 1; }",
    ".tlf-status .st-batsvg { pointer-events: auto; cursor: pointer; }",
    ".tlf-batmenu { position: absolute; z-index: 57; top: 44px; right: 12px; width: 206px; padding: 12px; border-radius: 22px; background: rgba(30,28,34,.82); color: var(--t-hvid); backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5); box-shadow: 0 8px 24px rgba(0,0,0,.35); transform-origin: 90% 0; animation: tlfBatInd .2s ease-out; font-size: 12px; }",
    "@keyframes tlfBatInd { from { transform: scale(.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }",
    ".tlf-batmenu .bm-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }",
    ".tlf-batmenu .bm-top b { font-size: 24px; } .tlf-batmenu .bm-top small { display: block; opacity: .75; font-size: 11px; }",
    ".tlf-batmenu .bm-bar { height: 8px; border-radius: 4px; background: rgba(255,255,255,.2); overflow: hidden; margin-bottom: 10px; } .tlf-batmenu .bm-bar i { display: block; height: 100%; border-radius: 4px; background: var(--t-on); }",
    ".tlf-batmenu .bm-bar.lav i { background: var(--t-rod); }",
    ".tlf-batmenu button { display: block; width: 100%; margin-top: 6px; border: 0; border-radius: 14px; padding: 8px 10px; font: 600 12px -apple-system, 'Segoe UI', sans-serif; cursor: pointer; background: rgba(255,255,255,.16); color: var(--t-hvid); }",
    ".tlf-batmenu button.groen { background: var(--t-on); } .tlf-batmenu button:disabled { opacity: .45; cursor: default; }",
    ".tlf-batmenu .bm-info { opacity: .75; font-size: 11px; margin-top: 2px; }",
    ".tlf-pb { position: absolute; left: 50%; top: 100%; margin-left: -9px; width: 18px; z-index: -1; cursor: pointer; }",
    ".tlf-pb[hidden] { display: none; }",
    ".tlf-pb .stik { display: block; width: 18px; height: 22px; margin-top: -4px; border-radius: 3px 3px 5px 5px; background: linear-gradient(90deg, #d9d9de, #ffffff 45%, #c4c4ca); box-shadow: 0 2px 4px var(--t-skygge2); }",
    ".tlf-pb .pb-ledning { display: block; width: 5px; height: 26px; margin: 0 auto; background: linear-gradient(90deg, #d4d4da, #ffffff 50%, #cfcfd5); }",
    ".tlf-pb .pb-klods { position: absolute; left: 50%; top: 46px; width: 92px; height: 44px; margin-left: -46px; border-radius: 12px; background: linear-gradient(160deg, #3b3a42, #1d1c22); box-shadow: 0 4px 10px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; gap: 7px; color: #fff; }",
    ".tlf-pb .pb-klods b { color: #ffd60a; font-size: 15px; }",
    ".tlf-pb .pb-led { display: flex; gap: 3px; } .tlf-pb .pb-led i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.18); } .tlf-pb .pb-led i.paa { background: #4cd964; box-shadow: 0 0 5px #4cd964; }",
    ".tlf-pb .pb-pct { font-size: 10px; opacity: .8; }",
    ".tlf-kabel .stik { display: block; width: 18px; height: 22px; margin-top: -4px; border-radius: 3px 3px 5px 5px; background: linear-gradient(90deg, #d9d9de, #ffffff 45%, #c4c4ca); box-shadow: 0 2px 4px var(--t-skygge2); }",
    ".tlf-kabel .ledning { display: block; width: 6px; height: 400px; margin: 0 auto; border-radius: 3px; background: linear-gradient(90deg, #d4d4da, #ffffff 50%, #cfcfd5); box-shadow: 0 2px 4px var(--t-skygge3); }",
    ".tlf-w.w-batteri { background: var(--t-hvid); color: var(--t-tekst); backdrop-filter: none; align-items: center; justify-content: center; }",
    ".tlf-w.w-batteri.bred { flex-direction: row; gap: 16px; justify-content: flex-start; }",
    ".w-ring { width: 76px; height: 76px; flex: none; } .w-bat-tekst b { display: block; font-size: 22px; } .w-bat-tekst small { color: var(--t-graa); font-size: 12px; }",
    // Snake
    ".sn-indhold { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px 10px 26px; overflow-y: auto; scrollbar-width: none; background: #0e1015; color: #e9e9ee; }",
    ".sn-indhold > [hidden] { display: none !important; }",
    ".sn-tal { width: 100%; display: flex; justify-content: space-between; font-size: 12px; color: #9a9aa6; padding: 0 4px 6px; }",
    ".sn-tal b { color: #fff; font-size: 16px; margin-left: 4px; font-variant-numeric: tabular-nums; }",
    ".sn-braet { position: relative; width: 100%; display: flex; justify-content: center; touch-action: none; }",
    ".sn-braet canvas { border-radius: 12px; box-shadow: 0 0 0 2px #2a2d38, 0 6px 18px rgba(0,0,0,.5); }",
    ".sn-over { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; background: rgba(10,12,18,.72); border-radius: 12px; margin: 0 auto; }",
    ".sn-over[hidden] { display: none; }",
    ".sn-over b { font-size: 22px; } .sn-over span { font-size: 13px; color: #c8c8d2; line-height: 1.4; }",
    ".sn-over button { margin-top: 4px; border: 0; border-radius: 18px; padding: 8px 22px; background: var(--t-acc); color: #fff; font-family: inherit; font-weight: 700; font-size: 14px; cursor: pointer; }",
    ".sn-pile { margin-top: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; }",
    ".sn-pile div { display: flex; gap: 4px; }",
    ".sn-pile button { width: 54px; height: 40px; border: 0; border-radius: 12px; background: #262a35; color: #e9e9ee; font-size: 16px; cursor: pointer; box-shadow: 0 3px 0 #15171e; touch-action: none; }",
    ".sn-pile button:active { transform: translateY(2px); box-shadow: 0 1px 0 #15171e; background: var(--t-acc); }",
    ".sn-toplisten { width: 100%; padding-top: 6px; }",
    ".sn-toplisten .tlf-liste { border-radius: 12px; overflow: hidden; color: var(--t-tekst); }",
    ".sn-plads { width: 24px; text-align: center; font-weight: 700; } .sn-pt { font-weight: 700; font-variant-numeric: tabular-nums; }",
    ".tlf-liste li.sn-mig { background: var(--t-hover); }",
    ".sn-regel { font-size: 11px; color: #9a9aa6; text-align: center; margin: 10px 6px 0; }",
    // Peep
    ".pp-top { background: var(--t-hvid); }",
    ".pp-logo { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #ff8a2b; }",
    ".pp-logo svg { color: #ffb02e; }",
    ".pp-indhold { flex: 1; overflow-y: auto; overflow-x: hidden; background: #efe9e2; padding-bottom: 8px; scrollbar-width: none; }",
    ".pp-indhold::-webkit-scrollbar { display: none; }",
    ".pp-faner { flex: none; display: flex; background: var(--t-hvid); border-top: 1px solid var(--t-linje); padding: 4px 0 20px; }",
    ".pp-faner button { flex: 1; border: 0; background: none; font-size: 18px; cursor: pointer; display: flex; flex-direction: column; align-items: center; position: relative; opacity: .55; padding: 2px; }",
    ".pp-faner button small { font-size: 9.5px; font-family: inherit; color: var(--t-tekst); }",
    ".pp-faner button.valgt { opacity: 1; } .pp-faner button.valgt small { color: #ff7a2b; font-weight: 700; }",
    ".pp-notis-tal { position: absolute; top: -2px; left: 52%; min-width: 16px; height: 16px; border-radius: 8px; background: var(--t-rod); color: #fff; font: 700 10px/16px sans-serif; font-style: normal; padding: 0 4px; box-sizing: border-box; }",
    ".pp-notis-tal[hidden] { display: none; }",
    ".pp-note { margin: 8px; padding: 8px 10px; border-radius: 10px; background: #fff4cf; color: #6b4e00; font-size: 11.5px; line-height: 1.35; }",
    ".pp-skriv { display: flex; align-items: center; gap: 10px; margin: 8px 0; padding: 10px 12px; background: var(--t-hvid); cursor: pointer; }",
    ".pp-skriv span:last-child { flex: 1; padding: 9px 14px; border-radius: 20px; border: 1px solid var(--t-linje); color: var(--t-graa); font-size: 13px; }",
    ".pp-kort { background: var(--t-hvid); margin-bottom: 8px; padding: 10px 0 0; }",
    ".pp-hoved { display: flex; align-items: center; gap: 9px; padding: 0 12px; }",
    ".pp-hoved .tlf-av { width: 38px; height: 38px; cursor: pointer; }",
    ".pp-hvem { flex: 1; min-width: 0; } .pp-hvem b { display: block; font-size: 14px; cursor: pointer; } .pp-hvem small { color: var(--t-graa); font-size: 11.5px; }",
    ".pp-slet { border: 0; background: none; font-size: 18px; color: var(--t-graa); cursor: pointer; padding: 2px 6px; border-radius: 12px; font-family: inherit; }",
    ".pp-slet.sikker { background: var(--t-rod); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; }",
    ".pp-tekst { padding: 8px 12px 10px; font-size: 14.5px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; user-select: text; -webkit-user-select: text; }",
    ".pp-farvet { margin-top: 8px; min-height: 150px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px; color: #fff; font-size: 20px; font-weight: 700; line-height: 1.3; text-shadow: 0 1px 3px rgba(0,0,0,.25); white-space: pre-wrap; word-wrap: break-word; box-sizing: border-box; }",
    ".pp-stat { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 12px; color: var(--t-graa); }",
    ".pp-stat [data-ppvis] { cursor: pointer; }",
    ".pp-hjerte { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(#ff6b8b, #e0245e); color: #fff; font-size: 9px; font-style: normal; vertical-align: -3px; }",
    ".pp-knapper { display: flex; border-top: 1px solid var(--t-linje); margin: 0 12px; }",
    ".pp-knapper button { flex: 1; border: 0; background: none; padding: 8px 4px; font-family: inherit; font-size: 12.5px; font-weight: 600; color: var(--t-graa); cursor: pointer; border-radius: 6px; }",
    ".pp-knapper button:hover { background: var(--t-felt); } .pp-knapper button.liker { color: #e0245e; }",
    ".pp-kommentarer { padding: 4px 12px 10px; border-top: 1px solid var(--t-linje); }",
    ".pp-flere { border: 0; background: none; color: var(--t-graa); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 0; }",
    ".pp-kom { display: flex; gap: 6px; margin-top: 6px; } .pp-kom > div { min-width: 0; }",
    ".pp-kom .tlf-av, .pp-skriv-kom .tlf-av { width: 28px; height: 28px; font-size: 12px; cursor: pointer; }",
    ".pp-boble { display: inline-block; background: var(--t-felt); border-radius: 14px; padding: 6px 10px; font-size: 13px; line-height: 1.3; word-wrap: break-word; max-width: 100%; box-sizing: border-box; user-select: text; -webkit-user-select: text; }",
    ".pp-boble b { display: block; font-size: 12px; cursor: pointer; }",
    ".pp-kom small { display: block; font-size: 10.5px; color: var(--t-graa); margin: 2px 0 0 10px; }",
    ".pp-kom small button { border: 0; background: none; color: var(--t-graa); font: inherit; font-weight: 700; cursor: pointer; padding: 0; }",
    ".pp-skriv-kom { display: flex; gap: 6px; align-items: center; margin-top: 8px; }",
    ".pp-skriv-kom input { flex: 1; min-width: 0; border: 0; border-radius: 16px; background: var(--t-felt); padding: 7px 12px; font: inherit; font-size: 13px; outline: 0; color: var(--t-tekst); user-select: text; }",
    ".pp-ny { background: var(--t-hvid); margin: 8px 0; padding: 12px; }",
    ".pp-ny-top { display: flex; gap: 9px; align-items: center; } .pp-ny-top b { display: block; } .pp-ny-top small { color: var(--t-graa); font-size: 12px; }",
    ".pp-ny textarea { width: 100%; box-sizing: border-box; min-height: 110px; margin-top: 10px; border: 0; outline: 0; resize: none; font-family: inherit; font-size: 16px; color: var(--t-tekst); background: none; border-radius: 12px; padding: 6px 2px; user-select: text; }",
    ".pp-ny textarea.farvet { color: #fff; font-weight: 700; font-size: 19px; text-align: center; padding: 30px 14px; min-height: 150px; }",
    ".pp-ny textarea.farvet::placeholder { color: rgba(255,255,255,.75); }",
    ".pp-ny-lbl { font-size: 11px; color: var(--t-graa); text-transform: uppercase; letter-spacing: .04em; margin: 10px 0 5px; }",
    ".pp-ny-farver { display: flex; gap: 6px; } .pp-ny-farver button { width: 28px; height: 28px; border-radius: 8px; border: 0; cursor: pointer; background: var(--t-felt); font: 700 11px inherit; font-family: inherit; color: var(--t-tekst); padding: 0; }",
    ".pp-ny-farver button.valgt { box-shadow: 0 0 0 2px var(--t-hvid), 0 0 0 4px #ff8a2b; }",
    ".pp-ny-humoer-valg { display: flex; flex-wrap: wrap; gap: 5px; } .pp-ny-humoer-valg button { border: 1px solid var(--t-linje); background: var(--t-hvid); border-radius: 14px; padding: 4px 9px; font-family: inherit; font-size: 12px; cursor: pointer; color: var(--t-tekst); }",
    ".pp-ny-humoer-valg button.valgt { background: #fff1de; border-color: #ff8a2b; }",
    ".pp-ny-knapper { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }",
    ".pp-ny-knapper button { border: 0; border-radius: 16px; padding: 8px 14px; font-family: inherit; font-weight: 700; font-size: 13px; cursor: pointer; background: var(--t-felt); color: var(--t-tekst); }",
    ".pp-ny-knapper button.send { background: linear-gradient(#ffb03a, #ff7a2b); color: #fff; } .pp-ny-knapper button:disabled { opacity: .5; }",
    ".pp-overskrift { font-size: 20px; font-weight: 800; padding: 12px 14px 6px; }",
    ".pp-notiser li.ny { background: #fff4e4; } .pp-mini { font-size: 11px; color: var(--t-graa); max-width: 60px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".pp-profil { background: var(--t-hvid); text-align: center; padding-bottom: 14px; margin-bottom: 8px; position: relative; }",
    ".pp-cover { height: 84px; background: linear-gradient(135deg, #ffc94a, #ff7a3d 60%, var(--t-acc)); }",
    ".pp-profil > .tlf-av { width: 84px; height: 84px; margin: -44px auto 0; border: 4px solid var(--t-hvid); font-size: 32px; box-sizing: content-box; }",
    ".pp-profil h2 { margin: 6px 0 2px; font-size: 20px; }",
    ".pp-bio { font-size: 13px; color: var(--t-tekst); padding: 2px 20px; cursor: default; } .pp-bio[data-ppbio] { cursor: pointer; } .pp-bio i { color: var(--t-graa); }",
    ".pp-bio-ret { display: flex; gap: 6px; padding: 4px 16px; } .pp-bio-ret input { flex: 1; min-width: 0; border: 1px solid var(--t-linje); border-radius: 12px; padding: 6px 10px; font: inherit; font-size: 13px; outline: 0; user-select: text; }",
    ".pp-bio-ret button, .pp-profil-knapper button { border: 0; border-radius: 14px; padding: 6px 12px; font-family: inherit; font-weight: 700; font-size: 12.5px; cursor: pointer; background: linear-gradient(#ffb03a, #ff7a2b); color: #fff; }",
    ".pp-profil-knapper { display: flex; gap: 6px; justify-content: center; margin-top: 10px; } .pp-profil-knapper button:disabled { background: var(--t-felt); color: var(--t-tekst); }",
    ".pp-tal { display: flex; justify-content: center; gap: 22px; margin-top: 10px; font-size: 11px; color: var(--t-graa); }",
    ".pp-tal b { display: block; font-size: 17px; color: var(--t-tekst); }",
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
    // Knapperne i chatbaren er flyttet ind i telefonen (Ejerpanel 🛡 og EJER-skiltet bliver)
    "#chat-smiley-knap, #chat-farve-knap, #chat-shop-knap, #chat-lager-knap, #chat-kamera-knap, #chat-album-knap, #chat-log-knap { display: none !important; }",
    // Byg-hammeren står i baren for alle — også i rum, hvor man ikke må bygge (så forklarer den hvorfor)
    "#byg-aabn[hidden] { display: inline-block !important; opacity: .55; }",
    "#byg-toast { position: fixed; z-index: 60; left: 50%; bottom: 74px; transform: translateX(-50%); background: rgba(20,16,24,.85); color: #fff; padding: 8px 16px; border-radius: 16px; font: 13px -apple-system, 'Segoe UI', sans-serif; pointer-events: none; opacity: 0; transition: opacity .25s; }",
    "#byg-toast.vis { opacity: 1; }",
  ].map(function (regel) {
    // alle regler får "#telefon" foran, så hotellets egne knap-regler ikke vinder
    if (regel.charAt(0) === "@" || regel.indexOf("#") === 0) return regel;
    // flere regler i én linje får også "#telefon" foran hver
    return regel.split("}").filter(function (r) { return r.trim(); }).map(function (r) {
      const i = r.indexOf("{");
      return r.slice(0, i).split(",").map(function (v) { return "#telefon " + v.trim(); }).join(", ") + " " + r.slice(i) + "}";
    }).join(" ");
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
            "<span class='st-5g'>5G</span>" +
            "<svg class='st-batsvg' width='35' height='13' viewBox='0 0 35 13'><title>Batteri</title><rect x='.5' y='.5' width='24' height='12' rx='3.6' fill='currentColor' opacity='.35'/><rect class='st-bat' x='.5' y='.5' width='24' height='12' rx='3.6' fill='currentColor'/><path d='M26 4.5v4a2 2 0 0 0 0-4z' fill='currentColor' opacity='.45'/><text class='st-pct' x='12.5' y='10' text-anchor='middle' font-size='9.5' font-weight='700' font-family='Arial, sans-serif'></text><path class='st-lyn' d='M32 .8 28.2 7h2.6l-1.1 5.2 4-6.6h-2.7z' fill='currentColor' display='none'/></svg>" +
          "</span></div>" +
          "<div class='tlf-laas'>" +
            "<span class='hl'>" + ik("laas", 22) + "</span>" +
            "<div class='tid'></div><div class='dag'></div><div class='lader' hidden></div>" +
            "<div class='notis'></div>" +
            "<div class='stryg'>Stryg op eller klik for at låse op</div>" +
            "<div class='bund'><button class='tlf-rund' data-l='lygte' title='Lommelygte'>" + ik("lygte", 20) + "</button><button class='tlf-rund tlf-pb-knap' data-l='pb' title='Powerbank'>🔋</button><button class='tlf-rund' data-l='kamera' title='Kamera'>" + ik("kamera", 22) + "</button></div>" +
          "</div>" +
          "<div class='tlf-hjem bag'></div>" +
          "<div class='tlf-banner'></div>" +
          "<div class='tlf-lille-besked'></div>" +
          "<div class='tlf-hjemlinje' title='Hjem'></div>" +
          "<div class='tlf-sluk'></div>" +
          "<div class='tlf-doed' hidden><div class='doed-bat'><i></i></div><p>Telefonen er løbet tør for strøm</p><small>Sæt dig ved en oplader eller i caféen for at lade den op 🔌</small><button class='doed-pb' hidden>🔋 Sæt powerbank til</button></div>" +
        "</div>" +
      "</div>" +
    "<div class='tlf-kabel' hidden><i class='stik'></i><i class='ledning'></i></div>" +
    "<div class='tlf-pb' hidden title='Powerbank – klik for at tage den fra'><i class='stik'></i><i class='pb-ledning'></i><span class='pb-klods'><b>⚡</b><span class='pb-led'><i></i><i></i><i></i><i></i></span><small class='pb-pct'></small></span></div>" +
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
  // Farver man selv kan vælge i Indstillinger
  const KNAP_FARVER = [
    { id: "", navn: "Som telefonen", f: null }, { id: "blaa", navn: "Blå", f: "#2f7de1" }, { id: "lilla", navn: "Lilla", f: "#8a4fff" },
    { id: "pink", navn: "Pink", f: "#ff4f9a" }, { id: "roed", navn: "Rød", f: "#e5383b" }, { id: "orange", navn: "Orange", f: "#ff8a1f" },
    { id: "gul", navn: "Guld", f: "#d9a400" }, { id: "groen", navn: "Grøn", f: "#2fb35a" }, { id: "mint", navn: "Mint", f: "#14b8a6" },
    { id: "brun", navn: "Brun", f: "#9a6a3a" }, { id: "graa", navn: "Grå", f: "#6b7280" }, { id: "sort", navn: "Sort", f: "#1c1c1e" },
  ];
  const APP_BAGGRUNDE = [
    { id: "", navn: "Lys", lys: "#f4f2f5", papir: "#fffdf3", top: "rgba(248,247,250,.88)" },
    { id: "rosa", navn: "Rosa", lys: "#fbeef3", papir: "#fff5f8", top: "rgba(252,240,245,.9)" },
    { id: "lavendel", navn: "Lavendel", lys: "#f0edfb", papir: "#f7f5ff", top: "rgba(242,239,252,.9)" },
    { id: "himmel", navn: "Himmel", lys: "#eaf3fb", papir: "#f4f9ff", top: "rgba(236,244,252,.9)" },
    { id: "mint", navn: "Mint", lys: "#e9f7f1", papir: "#f3fcf8", top: "rgba(235,248,242,.9)" },
    { id: "creme", navn: "Creme", lys: "#f8f1e3", papir: "#fffaf0", top: "rgba(249,243,231,.9)" },
    { id: "fersken", navn: "Fersken", lys: "#fdf0e6", papir: "#fff7f0", top: "rgba(253,242,233,.9)" },
  ];
  function saetFarver() {
    const F = farveNu();
    const s = tlf.style;
    s.setProperty("--t-k1", F.k[0]); s.setProperty("--t-k2", F.k[1]); s.setProperty("--t-k3", F.k[2]);
    const acc = KNAP_FARVER.find(function (k) { return k.id === ind.acc; });
    const accFarve = acc && acc.f ? acc.f : F.a;
    s.setProperty("--t-acc", accFarve);
    const a = hexRgb(accFarve);
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
    const appBg = APP_BAGGRUNDE.find(function (k) { return k.id === ind.appbg; }) || APP_BAGGRUNDE[0];
    fast["--t-lys"] = appBg.lys; fast["--t-papir"] = appBg.papir; fast["--t-topbg"] = appBg.top;
    Object.keys(fast).forEach(function (k) { s.setProperty(k, fast[k]); });
    bgEl.style.backgroundImage = baggrundNu();
    laasEl.querySelector(".hl").style.color = "#fff";
    tegnIkon();
  }


  // ---------------------------------------------------------------
  //  Ikonet i chatbaren: en lille pixel-telefon i telefonens farve
  // ---------------------------------------------------------------
  function tegnIkon() {
    const knap = document.getElementById("chat-venner-knap");
    const img = knap && knap.querySelector(".knap-ikon");
    if (!img) return;
    const F = farveNu();
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const x = c.getContext("2d");
    function px(fx, fy, b, h, farve) { x.fillStyle = farve; x.fillRect(fx, fy, b, h); }
    const kant = "#24161b";
    // sideknapper
    px(7, 8, 1, 3, kant); px(7, 12, 1, 4, kant); px(24, 10, 1, 5, kant);
    // omrids med runde hjørner
    px(10, 1, 12, 1, kant); px(10, 30, 12, 1, kant); px(8, 3, 1, 26, kant); px(23, 3, 1, 26, kant);
    px(9, 2, 1, 1, kant); px(22, 2, 1, 1, kant); px(9, 29, 1, 1, kant); px(22, 29, 1, 1, kant);
    // metalrammen (2 pixels): lys foroven/venstre, mørk forneden/højre
    px(9, 3, 14, 26, F.k[1]); px(10, 2, 12, 28, F.k[1]);
    px(10, 2, 12, 1, F.k[0]); px(9, 3, 1, 26, F.k[0]);
    px(10, 29, 12, 1, F.k[2]); px(22, 3, 1, 26, F.k[2]);
    // sort kant om skærmen
    px(11, 4, 10, 24, "#111");
    // skærmen
    const g = x.createLinearGradient(0, 5, 0, 26);
    g.addColorStop(0, "#3b2a5c"); g.addColorStop(0.55, F.a); g.addColorStop(1, "#ffd39a");
    x.fillStyle = ind.bat > 0 ? g : "#0b0b0d"; x.fillRect(12, 5, 8, 22);
    if (ind.bat <= 0) { px(14, 15, 4, 2, "#ff3b30"); try { img.src = c.toDataURL(); } catch (e) {} return; }
    // ø med kamera
    px(14, 6, 4, 1, "#111"); px(17, 6, 1, 1, "#4a5cff");
    // apps (3 × 2) og dock
    ["#4fd06a", "#a77cf0", "#f59a4a", "#ef6aa0", "#f5cf45", "#c9ced6"].forEach(function (f, i) { px(12 + (i % 3) * 3, 9 + Math.floor(i / 3) * 3, 2, 2, f); });
    px(12, 21, 8, 4, "rgba(255,255,255,.4)");
    px(12, 22, 2, 2, "#4fd06a"); px(15, 22, 2, 2, "#a77cf0"); px(18, 22, 2, 2, "#f59a4a");
    // hjemme-linjen og glans
    px(14, 26, 4, 1, "#fff");
    px(19, 8, 1, 4, "rgba(255,255,255,.3)");
    // ulæste beskeder ser man på det røde tal, som venner.js allerede viser
    try { img.src = c.toDataURL(); img.alt = "Telefon"; } catch (e) {}
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
  // Hvilket rum er en ven i? (samme slags id som mitRumId: "hal", "cafe", "lej:hjem-ida", "Ida:mit" …)
  function rumFor(navn) {
    if (typeof HAL_GAESTER !== "undefined" && HAL_GAESTER.some(function (g) { return g.navn === navn; })) return "hal";
    if (typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[navn] && ANDRE_SPILLERE[navn].rumId) return ANDRE_SPILLERE[navn].rumId;
    if (typeof serverVenner !== "undefined") {
      const v = serverVenner.find(function (s) { return s.navn === navn; });
      if (v && v.rum) return v.rum;
    }
    return null;
  }
  function herNu() { try { return typeof mitRumId === "function" ? mitRumId() : (rumValg === "hal" ? "hal" : aktivtVaerelse); } catch (e) { return null; } }
  function lejMedId(id) {
    try { return typeof lejligheder !== "undefined" && Array.isArray(lejligheder) ? lejligheder.find(function (x) { return x.id === id; }) || null : null; } catch (e) { return null; }
  }
  function rumNavnFor(id) {
    if (!id) return "Online";
    if (id === "hal") return "Velkomsthallen";
    if (/^lej:/.test(id)) { const l = lejMedId(id.slice(4)); return l ? l.ejer + "s lejlighed" : "En lejlighed"; }
    if (typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[id] && INDBYGGEDE_RUM[id].navn) return INDBYGGEDE_RUM[id].navn;
    if (typeof NAV_RUM !== "undefined") {
      const r = NAV_RUM.find(function (x) { return x.vaerelse === id || x.id === id; });
      if (r && r.navn) return String(r.navn).replace(/\s*[🔒🔑🔓]\s*$/u, "");
    }
    if (id.indexOf(":") > 0) return id.split(":")[0] + "s eget rum";
    return "Online";
  }
  function stedFor(navn) { return rumNavnFor(rumFor(navn)); }
  // Kan man gå over til vennen?
  function kanFoelge(navn) {
    if (!onlineOm(navn)) return false;
    const r = rumFor(navn);
    return !!r && r !== herNu();
  }
  function foelgVen(navn) {
    const r = rumFor(navn);
    if (!r) { lille(navn + " er ikke online"); return; }
    if (r === herNu()) { lille("Du er allerede her 🙂"); return; }
    try {
      if (r === "hal") skiftRum("hal");
      else if (/^lej:/.test(r)) {
        const l = lejMedId(r.slice(4));
        if (!l || typeof gaaIndLej !== "function") { lille("Lejligheden kan ikke findes"); return; }
        gaaIndLej(l);
      }
      else if (r.indexOf(":") > 0) { lille(r.split(":")[0] + " er i sit eget rum, som man ikke kan besøge"); return; }
      else if (typeof gaaTilVaerelse === "function") gaaTilVaerelse(r);
    } catch (e) { lille("Det gik ikke at komme derover"); return; }
    lille("🚶 Du går over til " + navn);
    setTimeout(opdaterAlt, 600);
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
    hjemEl.querySelectorAll("[data-w-kl]").forEach(function (w) { w.textContent = kl().replace(".", ":"); });
    const t = nu.getHours() % 12 + nu.getMinutes() / 60, m = nu.getMinutes() + nu.getSeconds() / 60;
    skaerm.querySelectorAll(".w-ur .vt").forEach(function (v) { v.setAttribute("transform", "rotate(" + (t * 30) + " 50 50)"); });
    skaerm.querySelectorAll(".w-ur .vm").forEach(function (v) { v.setAttribute("transform", "rotate(" + (m * 6) + " 50 50)"); });
    const kal = hjemEl.querySelector(".tlf-kal");
    if (kal) kal.innerHTML = "<i>" + DAGE[nu.getDay()].slice(0, 3) + "</i><b>" + nu.getDate() + "</b>";
    visBatteri();
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
    redigerer = false; galleriAabent = false; tegnGalleri();
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
    saetLygte(!lygteTaendt);
    lille(lygteTaendt ? "🔦 Lommelygte tændt" : "Lommelygte slukket");
  });
  laasEl.querySelector("[data-l='kamera']").addEventListener("click", function () { aabnUdeApp("kamera"); });
  laasEl.querySelector("[data-l='pb']").addEventListener("click", function (e) { e.stopPropagation(); tegnBatMenu(true); });
  laasEl.querySelector("[data-l='pb']").addEventListener("pointerdown", function (e) { e.stopPropagation(); });

  // ---------------------------------------------------------------
  //  Hjemmeskærmen
  // ---------------------------------------------------------------
  function appIkon(id) {
    const A = APPS[id];
    let tal = 0;
    if (id === "beskeder") tal = ulaestIalt();
    if (id === "kontakter") tal = anmodningerTilMig().length;
    if (id === "peep" && typeof peepNye === "function") tal = peepNye().length;
    if (id === "stribe") tal = stribeTal();
    if (id === "mail" && typeof mailUlaeste === "function") tal = mailUlaeste();
    const indre = id === "events" ? "<span class='tlf-kal'></span>" : ik(A.ik);
    return "<button class='tlf-app-ik' data-app='" + id + "'><span class='fl' style='background:" + A.bg + "'>" + indre + "</span>" +
      (tal ? "<span class='tal'>" + (tal > 99 ? "99+" : tal) + "</span>" : "") + (redigerer && A.spil ? "<span class='slet-x' data-afinst='" + id + "' title='Afinstallér'>−</span>" : "") + "<span class='nv'>" + A.navn + "</span></button>";
  }
  // ---------------------------------------------------------------
  //  Widgets på hjemmeskærmen — man vælger selv, hvilke og hvor
  //  Hold musen nede på hjemmeskærmen (eller Indstillinger → Widgets)
  //  for at tilføje, fjerne og flytte dem.
  // ---------------------------------------------------------------
  const WIDGETS = {
    hotel:    { navn: "Hotellet",      tekst: "Ur, rum og hvor mange der er online", str: ["bred", "lille"] },
    ur:       { navn: "Ur",            tekst: "Et rigtigt ur med visere",            str: ["lille", "bred"] },
    kalender: { navn: "Kalender",      tekst: "Dagens dato og næste event",          str: ["lille", "bred"], app: "events" },
    penge:    { navn: "Glimt & Stella", tekst: "Hvor mange penge du har",            str: ["lille", "bred"] },
    venner:   { navn: "Venner online", tekst: "Hvem af dine venner er online",       str: ["bred", "lille"], app: "kontakter" },
    beskeder: { navn: "Beskeder",      tekst: "Ulæste beskeder",                     str: ["lille", "bred"], app: "beskeder" },
    events:   { navn: "Events",        tekst: "Den nyeste nyhed fra hotellet",       str: ["bred", "lille"], app: "events" },
    batteri:  { navn: "Batteri",       tekst: "Hvor meget strøm telefonen har",      str: ["lille", "bred"] },
    noter:    { navn: "Noter",         tekst: "Din note på hjemmeskærmen",           str: ["lille", "bred"], app: "noter" },
  };
  const MAKS_WIDGETS = 8;
  function mineWidgets() {
    if (!Array.isArray(ind.widgets)) ind.widgets = [{ id: "hotel", str: "bred" }];
    ind.widgets = ind.widgets.filter(function (w) { return w && WIDGETS[w.id]; });
    return ind.widgets;
  }
  let redigerer = false;      // widgets vrikker og kan flyttes
  let galleriAabent = false;

  function tal(id) { const el = document.getElementById(id); return el ? el.textContent.trim() : "0"; }
  function rumNu() { try { return typeof rumNavnNu === "function" ? rumNavnNu() : ""; } catch (e) { return ""; } }
  function onlineVenner() { return vennerListe().filter(onlineOm); }
  function nyesteNyhed() {
    const l = (typeof nyheder !== "undefined" && Array.isArray(nyheder) ? nyheder : []).filter(function (n) { return n && (n.titel || n.tekst); });
    return l.sort(function (a, b) { return (b.tid || 0) - (a.tid || 0); })[0] || null;
  }
  function viser(nu) {
    // analogt ur som SVG
    const t = nu.getHours() % 12 + nu.getMinutes() / 60, m = nu.getMinutes() + nu.getSeconds() / 60;
    let streger = "";
    for (let i = 0; i < 12; i++) {
      const v = i * 30 * Math.PI / 180, l = i % 3 === 0 ? 9 : 5;
      streger += "<line x1='" + (50 + Math.sin(v) * 44).toFixed(1) + "' y1='" + (50 - Math.cos(v) * 44).toFixed(1) + "' x2='" + (50 + Math.sin(v) * (44 - l)).toFixed(1) + "' y2='" + (50 - Math.cos(v) * (44 - l)).toFixed(1) + "' stroke='currentColor' stroke-width='" + (i % 3 === 0 ? 2.6 : 1.4) + "' stroke-linecap='round'/>";
    }
    [12, 3, 6, 9].forEach(function (n, i) {
      const v = i * 90 * Math.PI / 180;
      streger += "<text x='" + (50 + Math.sin(v) * 27).toFixed(1) + "' y='" + (50 - Math.cos(v) * 27 + 4.5).toFixed(1) + "' font-size='13' font-weight='600' text-anchor='middle' fill='currentColor'>" + n + "</text>";
    });
    return "<svg class='w-ur' viewBox='0 0 100 100'>" + streger +
      "<line class='vt' x1='50' y1='50' x2='50' y2='26' stroke='currentColor' stroke-width='4' stroke-linecap='round' transform='rotate(" + (t * 30) + " 50 50)'/>" +
      "<line class='vm' x1='50' y1='50' x2='50' y2='14' stroke='currentColor' stroke-width='3' stroke-linecap='round' transform='rotate(" + (m * 6) + " 50 50)'/>" +
      "<circle cx='50' cy='50' r='3.6' fill='var(--t-acc)'/></svg>";
  }

  function widgetIndhold(w) {
    const nu = new Date(), bred = w.str === "bred";
    if (w.id === "hotel") {
      return "<div class='w1'>Hello Vera</div><div class='w2' data-w-kl></div>" +
        (bred ? "<div class='w3'><span>📍 " + esc(rumNu() || "Hotellet") + "</span><span>🟢 " + esc(tal("online-tal").replace(/\D+/g, " ").trim().split(" ")[0] || "0") + " online</span></div>"
              : "<div class='w3 lo'><span>📍 " + esc(rumNu() || "Hotellet") + "</span><span>🟢 " + esc(tal("online-tal").replace(/\D+/g, " ").trim().split(" ")[0] || "0") + " online</span></div>");
    }
    if (w.id === "ur") {
      return bred ? "<div class='w-raekke'>" + viser(nu) + "<div><div class='w2' data-w-kl></div><div class='w3'>" + esc(dato(nu)) + "</div></div></div>" : viser(nu);
    }
    if (w.id === "kalender") {
      const n = nyesteNyhed();
      const kort = "<div class='w-kal'><i>" + DAGE[nu.getDay()] + "</i><b>" + nu.getDate() + "</b><small>" + MDR[nu.getMonth()] + "</small></div>";
      return bred ? "<div class='w-raekke'>" + kort + "<div class='w-ev'><small>Næste</small><b>" + esc(n ? n.titel || "Nyhed" : "Ingen events") + "</b>" + (n && n.tekst ? "<span>" + esc(n.tekst) + "</span>" : "") + "</div></div>" : kort;
    }
    if (w.id === "penge") {
      return "<div class='w1'>Min pung</div><div class='w-penge" + (bred ? " bred" : "") + "'><span><img src='billeder/glimt.png' alt=''><b>" + esc(tal("glimt-tal")) + "</b><small>Glimt</small></span>" +
        "<span><img src='billeder/krystal.png' alt=''><b>" + esc(tal("krystal-tal")) + "</b><small>Stella</small></span></div>";
    }
    if (w.id === "venner") {
      const on = onlineVenner();
      return "<div class='w1'>Venner online</div><div class='w2'>" + on.length + "<small> / " + vennerListe().length + "</small></div>" +
        "<div class='w-av'>" + (on.length ? on.slice(0, bred ? 6 : 3).map(function (n) { return avatarHtml(n, true); }).join("") : "<span class='w3'>Ingen lige nu</span>") + "</div>";
    }
    if (w.id === "beskeder") {
      const ul = ulaestIalt(), s = samtaler()[0];
      const l = s ? beskeder[s].linjer[beskeder[s].linjer.length - 1] : null;
      return "<div class='w-top'>" + ik("besked", 20) + "<b>" + (ul ? ul + " ulæst" + (ul === 1 ? "" : "e") : "Beskeder") + "</b></div>" +
        (l ? "<div class='w-besked'><b>" + esc(s) + "</b><span>" + esc(l.tekst) + "</span></div>" : "<div class='w3'>Ingen beskeder endnu</div>");
    }
    if (w.id === "events") {
      const n = nyesteNyhed();
      return "<div class='w1'>🎉 Events</div>" + (n ? "<b class='w-tit'>" + esc(n.titel || "Nyhed") + "</b><div class='w3'>" + esc(n.tekst || "") + "</div>" : "<b class='w-tit'>Ingen events lige nu</b><div class='w3'>Kig forbi senere</div>");
    }
    if (w.id === "batteri") {
      const b = Math.round(ind.bat), r = 30, om = 2 * Math.PI * r;
      const farve = laderNu() || b > 20 ? "var(--t-on)" : "var(--t-rod)";
      const ring = "<svg class='w-ring' viewBox='0 0 76 76'><circle cx='38' cy='38' r='" + r + "' fill='none' stroke='var(--t-felt)' stroke-width='7'/>" +
        "<circle cx='38' cy='38' r='" + r + "' fill='none' stroke='" + farve + "' stroke-width='7' stroke-linecap='round' stroke-dasharray='" + (om * b / 100).toFixed(1) + " " + om.toFixed(1) + "' transform='rotate(-90 38 38)'/>" +
        "<text x='38' y='44' text-anchor='middle' font-size='17' font-weight='700' fill='currentColor'>" + (laderNu() ? "⚡" : "") + b + "</text></svg>";
      return w.str === "bred" ? ring + "<div class='w-bat-tekst'><b>" + b + " %</b><small>" + (laderNu() ? "⚡ Oplader" : ind.pbTil ? "🔋 Powerbank sat til" : b <= 20 ? (harPowerbank() ? "Lavt – tryk her for powerbank" : "Lavt batteri – find en oplader") : harPowerbank() ? "🔋 Du har en powerbank" : "Ingen powerbank") + "</small></div>" : ring;
    }
    if (w.id === "noter") {
      return "<div class='w1'>📝 Note</div><div class='w-note'>" + (noter.trim() ? esc(noter.trim().slice(0, 160)) : "<i>Tryk for at skrive en note …</i>") + "</div>";
    }
    return "";
  }
  function widgetHtml(w, i) {
    return "<div class='tlf-w w-" + w.id + " " + w.str + "' data-wi='" + i + "'>" + widgetIndhold(w) +
      (redigerer && i >= 0 ? "<button class='w-fjern' data-wfjern='" + i + "' title='Fjern'>−</button>" : "") + "</div>";
  }
  function tegnWidgets() {
    const boks = hjemEl.querySelector(".tlf-widgets");
    if (!boks) return;
    boks.innerHTML = mineWidgets().map(widgetHtml).join("");
    tegnAvatarer(boks);
    opdaterUr();
  }

  // Galleriet, hvor man vælger nye widgets
  function tegnGalleri() {
    let ark = skaerm.querySelector(".tlf-ark");
    if (!galleriAabent) { if (ark) { ark.classList.remove("vis"); setTimeout(function () { if (!galleriAabent && ark.isConnected) ark.remove(); }, 300); } return; }
    if (!ark) {
      ark = document.createElement("div");
      ark.className = "tlf-ark";
      skaerm.insertBefore(ark, bannerEl);
      setTimeout(function () { ark.classList.add("vis"); }, 10);
    }
    const fuld = mineWidgets().length >= MAKS_WIDGETS;
    ark.innerHTML = "<div class='ark-inde'><div class='ark-top'><b>Tilføj widget</b><button class='lnk' data-arkluk>Luk</button></div>" +
      (fuld ? "<p class='ark-fuld'>Du har " + MAKS_WIDGETS + " widgets. Fjern en for at tilføje en ny.</p>" : "") +
      "<div class='ark-liste'>" + Object.keys(WIDGETS).map(function (id) {
        const W = WIDGETS[id];
        return "<div class='ark-w'><div class='ark-vis'>" + widgetHtml({ id: id, str: W.str[0] }, -1).replace("data-wi='-1'", "") + "</div>" +
          "<div class='ark-info'><b>" + W.navn + "</b><small>" + W.tekst + "</small><span>" + W.str.map(function (s) {
            return "<button data-wny='" + id + "' data-wstr='" + s + "'" + (fuld ? " disabled" : "") + ">＋ " + (s === "lille" ? "Lille" : "Bred") + "</button>";
          }).join("") + "</span></div></div>";
      }).join("") + "</div></div>";
    tegnAvatarer(ark);
    opdaterUr();
  }

  function startRediger() {
    if (redigerer) return;
    redigerer = true;
    tegnHjem();
  }
  function stopRediger() {
    redigerer = false;
    galleriAabent = false;
    tegnGalleri();
    tegnHjem();
    if (mappeAaben !== null) tegnMappe();
  }

  // ---------------------------------------------------------------
  //  📁 Mapper på hjemmeskærmen — ligesom på en iPhone
  //  Hold musen nede (rediger), træk en app oven på en anden app =
  //  ny mappe. Træk en app ud af en åben mappe for at tage den ud.
  //  Gemmes i ind.layout: app-id'er og { mappe: navn, apps: [...] }
  // ---------------------------------------------------------------
  const MAPPE_SLAGS = { peep: "Socialt", beskeder: "Socialt", kontakter: "Socialt", shop: "Shopping", lager: "Shopping",
    byg: "Kreativitet", kamera: "Kreativitet", fotos: "Kreativitet", chatlog: "Chat", smileys: "Chat", boble: "Chat",
    events: "Hotel", rum: "Hotel", noter: "Værktøjer", indst: "Værktøjer", snake: "Spil", net: "Værktøjer", mail: "Socialt", musik: "Underholdning", regn: "Værktøjer" };
  function mitLayout() {
    let l = Array.isArray(ind.layout) ? ind.layout : GITTER.slice();
    const set = {};
    // ryd op: ukendte apps, dobbelte, tomme mapper
    l = l.map(function (x) {
      if (typeof x === "string") { if (!APPS[x] || set[x] || DOCK.indexOf(x) >= 0 || (APPS[x].spil && !harSpil(x))) return null; set[x] = 1; return x; }
      if (!x || !Array.isArray(x.apps)) return null;
      const apps = x.apps.filter(function (a) { if (!APPS[a] || set[a] || DOCK.indexOf(a) >= 0 || (APPS[a].spil && !harSpil(a))) return false; set[a] = 1; return true; });
      if (!apps.length) return null;
      if (apps.length === 1) return apps[0];
      return { mappe: String(x.mappe || "Mappe").slice(0, 20), apps: apps };
    }).filter(function (x) { return x !== null; });
    // nye apps kommer med til sidst
    GITTER.concat(mineSpil()).forEach(function (a) { if (!set[a]) l.push(a); });
    ind.layout = l;
    return l;
  }
  function appTal(id) {
    if (id === "beskeder") return ulaestIalt();
    if (id === "kontakter") return anmodningerTilMig().length;
    if (id === "peep" && typeof peepNye === "function") return peepNye().length;
    if (id === "stribe" && typeof stribeTal === "function") return stribeTal();
    if (id === "mail" && typeof mailUlaeste === "function") return mailUlaeste();
    return 0;
  }
  function mappeIkon(m, i) {
    const tal = m.apps.reduce(function (s, a) { return s + appTal(a); }, 0);
    const mini = m.apps.slice(0, 9).map(function (a) {
      const A = APPS[a];
      return "<i style='background:" + A.bg + "'>" + (a === "events" ? "" : ik(A.ik)) + "</i>";
    }).join("");
    return "<button class='tlf-app-ik tlf-mappe-ik' data-gi='" + i + "' data-mappe='" + i + "'><span class='fl'><span class='mp-mini'>" + mini + "</span></span>" +
      (tal ? "<span class='tal'>" + (tal > 99 ? "99+" : tal) + "</span>" : "") + "<span class='nv'>" + esc(m.mappe) + "</span></button>";
  }
  function gitterHtml() {
    return mitLayout().map(function (x, i) {
      return typeof x === "string" ? appIkon(x).replace("<button class='tlf-app-ik'", "<button class='tlf-app-ik' data-gi='" + i + "'") : mappeIkon(x, i);
    }).join("");
  }
  function nytMappeNavn(a, b) {
    const s1 = MAPPE_SLAGS[a], s2 = MAPPE_SLAGS[b];
    return s1 && s1 === s2 ? s1 : "Mappe";
  }
  // læg app (eller mappe) nr. fra oven på nr. til
  function slaaSammen(fra, til) {
    const l = mitLayout(), a = l[fra], b = l[til];
    if (typeof a !== "string" || fra === til) return false;
    if (typeof b === "string") l[til] = { mappe: nytMappeNavn(b, a), apps: [b, a] };
    else b.apps.push(a);
    l.splice(fra, 1);
    gemInd();
    return true;
  }
  function flytPlads(fra, til, efter) {
    const l = mitLayout();
    const x = l.splice(fra, 1)[0];
    let ny = til + (efter ? 1 : 0);
    if (fra < ny) ny--;
    l.splice(ny, 0, x);
    gemInd();
  }

  // Den åbne mappe (sløret baggrund, stort navn, apps i gitter)
  let mappeAaben = null;   // plads i layout
  function aabnMappe(i) {
    mappeAaben = i;
    let el = skaerm.querySelector(".tlf-mappe-aaben");
    const ny = !el;
    if (ny) { el = document.createElement("div"); el.className = "tlf-mappe-aaben"; skaerm.insertBefore(el, bannerEl); }
    tegnMappe(ny);
  }
  function tegnMappe(ny) {
    const el = skaerm.querySelector(".tlf-mappe-aaben");
    const m = mitLayout()[mappeAaben];
    if (!el) return;
    if (!m || typeof m === "string") { lukMappe(); return; }
    const navnFelt = el.querySelector(".mp-navn input");
    if (navnFelt && document.activeElement === navnFelt && !ny) {
      // skriver navnet: tegn kun apps om
      el.querySelector(".mp-gitter").innerHTML = m.apps.map(function (a, j) { return appIkon(a).replace("<button class='tlf-app-ik'", "<button class='tlf-app-ik' data-mi='" + j + "'"); }).join("");
      return;
    }
    el.classList.toggle("rediger", redigerer);
    el.innerHTML = "<div class='mp-navn'><input maxlength='20' value='" + esc(m.mappe) + "' title='Klik for at give mappen et nyt navn' spellcheck='false'></div>" +
      "<div class='mp-boks'><div class='mp-gitter'>" + m.apps.map(function (a, j) { return appIkon(a).replace("<button class='tlf-app-ik'", "<button class='tlf-app-ik' data-mi='" + j + "'"); }).join("") + "</div></div>" +
      (redigerer ? "<div class='mp-hjaelp'>Træk en app ud af boksen for at tage den ud af mappen</div>" : "");
    if (ny) setTimeout(function () { el.classList.add("vis"); }, 10); else el.classList.add("vis");
    const inp = el.querySelector(".mp-navn input");
    inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter" || e.key === "Escape") inp.blur(); });
    inp.addEventListener("blur", function () {
      const mm = mitLayout()[mappeAaben];
      if (!mm || typeof mm === "string") return;
      const v = inp.value.replace(/\s+/g, " ").trim().slice(0, 20);
      mm.mappe = v || nytMappeNavn(mm.apps[0], mm.apps[1]);
      inp.value = mm.mappe;
      gemInd();
      if (skaermNu === "hjem") tegnHjem();
    });
  }
  function lukMappe(straks) {
    const el = skaerm.querySelector(".tlf-mappe-aaben");
    mappeAaben = null;
    if (!el) return;
    const inp = el.querySelector(".mp-navn input");
    if (inp && document.activeElement === inp) inp.blur();
    if (straks) { el.remove(); return; }
    el.classList.remove("vis");
    setTimeout(function () { if (el.isConnected && mappeAaben === null) el.remove(); }, 260);
  }
  // klik i den åbne mappe
  skaerm.addEventListener("click", function (e) {
    const el = e.target.closest(".tlf-mappe-aaben");
    if (!el || Date.now() < undgaaKlik) return;
    if (e.target.closest(".mp-navn")) return;
    const ax = e.target.closest("[data-afinst]");
    if (ax) { afinstaller(ax.dataset.afinst); return; }
    const k = e.target.closest("[data-mi]");
    if (k && !redigerer) { const id = k.dataset.app; lukMappe(true); aabnApp(id); return; }
    if (!k && !e.target.closest(".mp-boks")) { lukMappe(); if (redigerer) tegnHjem(); }
  });
  // hold nede i mappen = rediger, træk apps rundt eller ud
  let mTraek = null, mHold = null, mHoldStart = null;
  skaerm.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || !e.target.closest(".tlf-mappe-aaben") || e.target.closest(".mp-navn, [data-afinst]")) return;
    const k = e.target.closest("[data-mi]");
    if (redigerer && k) {
      mTraek = { el: k, fra: +k.dataset.mi, x: e.clientX, y: e.clientY, til: null, flyttet: false, ude: false };
      k.setPointerCapture && k.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    mHoldStart = { x: e.clientX, y: e.clientY };
    clearTimeout(mHold);
    mHold = setTimeout(function () { mHold = null; undgaaKlik = Date.now() + 350; redigerer = true; tegnHjem(); tegnMappe(); }, 550);
  });
  skaerm.addEventListener("pointermove", function (e) {
    if (mHold && mHoldStart && Math.abs(e.clientX - mHoldStart.x) + Math.abs(e.clientY - mHoldStart.y) > 8) { clearTimeout(mHold); mHold = null; }
    if (!mTraek) return;
    const s = skala();
    const dx = (e.clientX - mTraek.x) / s, dy = (e.clientY - mTraek.y) / s;
    if (Math.abs(dx) + Math.abs(dy) > 4) mTraek.flyttet = true;
    mTraek.el.classList.add("traekkes");
    mTraek.el.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.1)";
    mTraek.el.style.pointerEvents = "none";
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const boks = skaerm.querySelector(".mp-boks");
    mTraek.ude = !(under && boks && boks.contains(under));
    if (boks) boks.classList.toggle("ud-af", mTraek.ude);
    const maal = under && under.closest && under.closest("#telefon [data-mi]");
    mTraek.til = maal && maal !== mTraek.el ? +maal.dataset.mi : null;
  });
  function slutMappeTraek() {
    clearTimeout(mHold); mHold = null;
    if (!mTraek) return;
    const t = mTraek; mTraek = null;
    if (t.flyttet) undgaaKlik = Date.now() + 350;
    const l = mitLayout(), m = l[mappeAaben];
    if (t.flyttet && m && typeof m !== "string") {
      if (t.ude) {
        // ud af mappen: appen lægges lige efter mappen
        const id = m.apps.splice(t.fra, 1)[0];
        const plads = mappeAaben;
        l.splice(plads + 1, 0, id);
        if (m.apps.length === 1) l[plads] = m.apps[0];
        gemInd();
        lukMappe(true);
        tegnHjem();
        lille("📤 " + APPS[id].navn + " er taget ud af mappen");
        return;
      }
      if (t.til !== null) { const a = m.apps.splice(t.fra, 1)[0]; m.apps.splice(t.til, 0, a); gemInd(); }
    }
    tegnMappe();
    tegnHjem();
  }
  skaerm.addEventListener("pointerup", slutMappeTraek);
  skaerm.addEventListener("pointercancel", slutMappeTraek);

  function tegnHjem() {
    hjemEl.classList.toggle("rediger", redigerer);
    hjemEl.innerHTML =
      (redigerer ? "<div class='tlf-redbar'><button data-wtilf>＋ Widget</button><button data-wfaerdig>Færdig</button></div>" : "") +
      "<div class='tlf-hjem-rul'><div class='tlf-widgets'></div>" +
      "<div class='tlf-gitter'>" + gitterHtml() + "</div></div>" +
      "<div class='tlf-prikker'><i></i><i></i></div>" +
      "<div class='tlf-dock'>" + DOCK.map(appIkon).join("") + "</div>";
    tegnWidgets();
  }
  let undgaaKlik = 0;     // klikket lige efter et langt tryk eller et træk tæller ikke
  hjemEl.addEventListener("click", function (e) {
    if (Date.now() < undgaaKlik) return;
    const t = e.target;
    if (t.closest("[data-wtilf]")) { galleriAabent = true; tegnGalleri(); return; }
    if (t.closest("[data-wfaerdig]")) { stopRediger(); return; }
    const ax = t.closest("[data-afinst]");
    if (ax) { afinstaller(ax.dataset.afinst); return; }
    const fj = t.closest("[data-wfjern]");
    if (fj) { mineWidgets().splice(+fj.dataset.wfjern, 1); gemInd(); tegnWidgets(); return; }
    const mp = t.closest("[data-mappe]");
    if (mp) { aabnMappe(+mp.dataset.mappe); return; }
    if (redigerer) { if (!t.closest(".tlf-w, .tlf-app-ik")) stopRediger(); return; }
    const k = t.closest("[data-app]");
    if (k) { aabnApp(k.dataset.app); return; }
    const wEl = t.closest("[data-wi]");
    if (wEl) {
      const w = mineWidgets()[+wEl.dataset.wi];
      if (w && w.id === "batteri") tegnBatMenu(true);
      else if (w && WIDGETS[w.id].app) aabnApp(WIDGETS[w.id].app);
      else if (w && w.id === "penge" && typeof aabnShop === "function") aabnUdeApp("shop");
      else if (w && w.id === "hotel") aabnUdeApp("rum");
    }
  });
  // Galleriet: tilføj eller luk
  skaerm.addEventListener("click", function (e) {
    const ny = e.target.closest("[data-wny]");
    if (ny) {
      if (mineWidgets().length < MAKS_WIDGETS) { mineWidgets().push({ id: ny.dataset.wny, str: ny.dataset.wstr }); gemInd(); }
      galleriAabent = false; tegnGalleri(); tegnWidgets();
      lille("Widget tilføjet ✨");
      return;
    }
    if (e.target.closest("[data-arkluk]") || e.target.classList.contains("tlf-ark")) { galleriAabent = false; tegnGalleri(); }
  });

  // Hold musen nede = rediger. I rediger kan widgets trækkes til en ny plads.
  let holdTimer = null, holdStart = null, wTraek = null;
  hjemEl.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || e.target.closest(".tlf-redbar, .w-fjern, [data-afinst]")) return;
    holdStart = { x: e.clientX, y: e.clientY };
    const wEl = e.target.closest("[data-wi]");
    const aEl = e.target.closest(".tlf-gitter [data-gi]");
    if (redigerer && aEl) {
      wTraek = { app: true, el: aEl, fra: +aEl.dataset.gi, x: e.clientX, y: e.clientY, til: null, maade: null, flyttet: false };
      aEl.setPointerCapture && aEl.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    if (redigerer && wEl) {
      wTraek = { el: wEl, fra: +wEl.dataset.wi, x: e.clientX, y: e.clientY, til: null, flyttet: false };
      wEl.setPointerCapture && wEl.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () { holdTimer = null; undgaaKlik = Date.now() + 350; startRediger(); }, 550);
  });
  hjemEl.addEventListener("pointermove", function (e) {
    if (holdTimer && holdStart && Math.abs(e.clientX - holdStart.x) + Math.abs(e.clientY - holdStart.y) > 8) { clearTimeout(holdTimer); holdTimer = null; }
    if (!wTraek) return;
    const s = skala();
    const dx = (e.clientX - wTraek.x) / s, dy = (e.clientY - wTraek.y) / s;
    if (Math.abs(dx) + Math.abs(dy) > 4) wTraek.flyttet = true;
    wTraek.el.classList.add("traekkes");
    wTraek.el.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.05)";
    wTraek.el.style.pointerEvents = "none";
    const under = document.elementFromPoint(e.clientX, e.clientY);
    if (wTraek.app) {
      // app: midt på en anden app = mappe, i kanten = ny plads
      wTraek.el.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.12)";
      hjemEl.querySelectorAll(".maal-mappe, .maal-foer, .maal-efter").forEach(function (m) { m.classList.remove("maal-mappe", "maal-foer", "maal-efter"); });
      const am = under && under.closest && under.closest("#telefon .tlf-gitter [data-gi]");
      wTraek.til = null; wTraek.maade = null;
      if (am && am !== wTraek.el) {
        const r = am.getBoundingClientRect(), rel = (e.clientX - r.left) / r.width;
        const kanMappe = !wTraek.el.dataset.mappe;
        wTraek.til = +am.dataset.gi;
        wTraek.maade = kanMappe && rel > .22 && rel < .78 ? "mappe" : rel < .5 ? "foer" : "efter";
        am.classList.add("maal-" + wTraek.maade);
      }
      return;
    }
    const maal = under && under.closest && under.closest("#telefon [data-wi]");
    hjemEl.querySelectorAll(".tlf-w.maal").forEach(function (m) { m.classList.remove("maal"); });
    wTraek.til = maal && maal !== wTraek.el ? +maal.dataset.wi : null;
    if (maal && maal !== wTraek.el) maal.classList.add("maal");
  });
  function slutHold() {
    clearTimeout(holdTimer); holdTimer = null;
    if (!wTraek) return;
    const t = wTraek; wTraek = null;
    if (t.flyttet) undgaaKlik = Date.now() + 350;
    if (t.app) {
      if (t.til !== null && t.maade === "mappe") {
        if (slaaSammen(t.fra, t.til)) { tegnHjem(); lille("📁 Mappe lavet"); return; }
      } else if (t.til !== null) flytPlads(t.fra, t.til, t.maade === "efter");
      tegnHjem();
      return;
    }
    if (t.til !== null) {
      const liste = mineWidgets();
      const w = liste.splice(t.fra, 1)[0];
      liste.splice(t.til, 0, w);
      gemInd();
    }
    tegnWidgets();
  }
  hjemEl.addEventListener("pointerup", slutHold);
  hjemEl.addEventListener("pointercancel", slutHold);
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
        if (id === "byg") {
          const b = document.getElementById("byg-aabn");
          if (!b) return false;
          if (b.hidden) { lille("🔨 Du kan kun bygge i dine egne rum"); return null; }
          b.click(); return true;
        }
        if (APPS[id] && APPS[id].knap) return klik(APPS[id].knap);
      } catch (e) {}
      return false;
    })();
    if (ok === null) return;
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
    if (mappeAaben !== null) lukMappe(true);
    if (["rum", "shop", "lager", "kamera", "fotos"].indexOf(id) >= 0 || (APPS[id] && APPS[id].knap)) { aabnUdeApp(id); return; }
    if (skaermNu === "laas") { laasOp({ app: id, hvem: hvem }); return; }
    lukApp(true);
    if (redigerer) { redigerer = false; galleriAabent = false; tegnGalleri(); }
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
    if (typeof stopSnake === "function") stopSnake();
    if (typeof stopSpil === "function") stopSpil();
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
      tegnNoter();
    } else if (id === "indst") {
      tegnIndstillinger();
    } else if (id === "snake") {
      tegnSnake();
    } else if (id === "peep") {
      tegnPeep();
    } else if (id === "butik") {
      tegnButik();
    } else if (id === "regn") {
      tegnRegner();
    } else if (id === "net") {
      tegnNet();
    } else if (id === "mail") {
      tegnMail();
    } else if (id === "musik") {
      tegnMusik();
    } else if (APPS[id] && APPS[id].spil) {
      tegnSpil(id);
    }
  }
  // ---------------------------------------------------------------
  //  🛍 App Butik — hent spil for sjov (ingen Glimt). Hentede spil kan
  //  afinstalleres; apps der fulgte med telefonen kan ikke slettes.
  //  Hentede spil gemmes i ind.spil
  // ---------------------------------------------------------------
  function mineSpil() { if (!Array.isArray(ind.spil)) ind.spil = []; ind.spil = ind.spil.filter(function (s) { return ALLE_SPIL.indexOf(s) >= 0 || ALLE_APPS.indexOf(s) >= 0; }); return ind.spil; }
  function harSpil(id) { return mineSpil().indexOf(id) >= 0; }
  let henter = {};
  function hentSpil(id) {
    if (harSpil(id) || henter[id]) return;
    henter[id] = { start: Date.now(), tid: 7000 + Math.random() * 4000 };   // 7–11 sekunder, som en rigtig download
    if (appNu === "butik") tegnButikListe();
    setTimeout(function () {
      delete henter[id];
      if (!harSpil(id)) { mineSpil().push(id); gemInd(); }
      if (APPS[id].multi) stribeInstalleret(true);
      lille("⬇️ " + APPS[id].navn + " er hentet");
      if (!APPS[id].multi && stribeOnline()) serverKald("hv_spil_installeret", { p_token: mitToken(), p_spil: id, p_har: true }).then(function () { if (butikFane === "top") return hentSpilTop(); }).then(function () { if (appNu === "butik") tegnButikListe(); }).catch(function () {});
      if (appNu === "butik") tegnButikListe();
    }, henter[id].tid);
  }
  function hentProcent(id) { const h = henter[id]; return h ? Math.min(100, Math.round((Date.now() - h.start) / h.tid * 100)) : 0; }
  setInterval(function () {
    if (appNu !== "butik" || !appEl) return;
    Object.keys(henter).forEach(function (id) {
      const r = appEl.querySelector("[data-abring='" + id + "']"), t = appEl.querySelector("[data-abpct='" + id + "']");
      if (r) r.style.setProperty("--p", hentProcent(id));
      if (t) t.textContent = hentProcent(id) + " %";
    });
  }, 150);
  function afinstaller(id) {
    if (!APPS[id] || !APPS[id].spil) { lille("Apps der fulgte med telefonen kan ikke slettes"); return; }
    ind.spil = mineSpil().filter(function (s) { return s !== id; });
    if (id === "musik" && typeof mbStop === "function") mbStop();
    if (APPS[id].multi) stribeInstalleret(false);
    else if (stribeOnline()) serverKald("hv_spil_installeret", { p_token: mitToken(), p_spil: id, p_har: false }).catch(function () {});
    gemInd();
    lille("🗑 " + APPS[id].navn + " er afinstalleret");
    if (appNu === "butik") tegnButikListe();
    if (skaermNu === "hjem") { tegnHjem(); if (mappeAaben !== null) tegnMappe(); }
  }
  function tegnButik() {
    butikFane = "spil";
    appEl.innerHTML = top("App Butik") + "<div class='ab-indhold'></div>";
    appEl.addEventListener("click", function (e) {
      const h = e.target.closest("[data-abhent]"), a = e.target.closest("[data-abaabn]"), x = e.target.closest("[data-abslet]");
      const fn = e.target.closest("[data-abfane]");
      if (fn) {
        butikFane = fn.dataset.abfane; tegnButikListe(); appEl.querySelector(".ab-indhold").scrollTop = 0;
        if (butikFane === "top") { meldAlleSpil(); hentSpilTop().then(function () { if (appNu === "butik" && butikFane === "top") tegnButikListe(); }); }
        return;
      }
      if (h) hentSpil(h.dataset.abhent);
      if (a) aabnApp(a.dataset.abaabn);
      if (x) {
        if (x.classList.contains("sikker")) { afinstaller(x.dataset.abslet); return; }
        x.classList.add("sikker"); x.textContent = "Er du sikker?";
        setTimeout(function () { if (x.isConnected) { x.classList.remove("sikker"); x.textContent = "Afinstallér"; } }, 3000);
      }
    });
    tegnButikListe();
  }
  function tegnButikListe() {
    const b = appEl && appEl.querySelector(".ab-indhold");
    if (!b) return;
    if (butikFane === "top") { tegnButikTop(b); return; }
    if (butikFane === "mine") { tegnButikMine(b); return; }
    b.innerHTML = butikFanerHtml() + "<div class='ab-hero'><b>Apps og spil for sjov 🎮</b><span>Hent så mange du vil – de er gratis. De giver ingen Glimt, de er bare for sjov.</span></div>" +
      "<div class='ab-overskrift'>Apps</div>" +
      ALLE_APPS.map(function (id) {
        const A = APPS[id];
        return "<div class='ab-kort'><span class='ab-ik' style='background:" + A.bg + "'>" + ik(A.ik) + "</span><span class='ab-info'><b>" + A.navn + "</b><small>" + A.tekst + "</small></span>" + kortKnapper(id) + "</div>";
      }).join("") +
      "<div class='ab-overskrift'>Spil</div>" +
      ALLE_SPIL.map(function (id) {
        const A = APPS[id], har = harSpil(id), r = spilRekord(id);
        return "<div class='ab-kort'><span class='ab-ik' style='background:" + A.bg + "'>" + ik(A.ik) + "</span>" +
          "<span class='ab-info'><b>" + A.navn + "</b><small>" + A.tekst + "</small>" + (har && r != null ? "<i>🏆 Din rekord: " + r + "</i>" : "") + "</span>" +
          "<span class='ab-knapper'>" + (henter[id] ? "<span class='ab-ring' data-abring='" + id + "' style='--p:" + hentProcent(id) + "'></span><span class='ab-pct' data-abpct='" + id + "'>" + hentProcent(id) + " %</span>" : har ? "<button data-abaabn='" + id + "'>ÅBN</button><button class='ab-slet' data-abslet='" + id + "'>Afinstallér</button>" : "<button data-abhent='" + id + "'>HENT</button>") + "</span></div>";
      }).join("") +
      "<p class='ab-note'>Apps der fulgte med telefonen kan ikke slettes. Hentede apps og spil kan også slettes ved at holde musen nede på forsiden og trykke på −.</p>";
  }

  // ----- App Butik: Top (mest hentede blandt spillerne) og Mine apps -----
  let butikFane = "spil", spilTop = null, spilTopFejl = "";
  function hentSpilTop() {
    if (!stribeOnline()) { spilTopFejl = "Toplisten virker, når du er logget ind på hotellets server."; return Promise.resolve(null); }
    return serverKald("hv_spil_top", {}).then(function (l) { spilTop = Array.isArray(l) ? l : []; spilTopFejl = ""; return spilTop; })
      .catch(function (e) { spilTopFejl = /function|schema cache|does not exist|Could not find/i.test(e.message) ? "Toplisten virker, når database-40-app-top.sql er kørt i Supabase." : e.message; return null; });
  }
  // fortæl serveren, hvilke spil man har (så toplisten passer)
  let spilMeldt = false;
  function meldAlleSpil() {
    if (spilMeldt || !stribeOnline()) return;
    spilMeldt = true;
    mineSpil().forEach(function (id) { serverKald("hv_spil_installeret", { p_token: mitToken(), p_spil: id, p_har: true }).catch(function () {}); });
  }
  setTimeout(meldAlleSpil, 5000);
  function butikFanerHtml() {
    return "<div class='ab-faner'>" + [["spil", "🛍 Butik"], ["top", "🔥 Top"], ["mine", "📱 Mine apps"]].map(function (f) {
      return "<button data-abfane='" + f[0] + "' class='" + (butikFane === f[0] ? "valgt" : "") + "'>" + f[1] + "</button>";
    }).join("") + "</div>";
  }
  function kortKnapper(id) {
    const har = harSpil(id);
    return "<span class='ab-knapper'>" + (henter[id] ? "<span class='ab-ring' data-abring='" + id + "' style='--p:" + hentProcent(id) + "'></span><span class='ab-pct' data-abpct='" + id + "'>" + hentProcent(id) + " %</span>"
      : har ? "<button data-abaabn='" + id + "'>ÅBN</button><button class='ab-slet' data-abslet='" + id + "'>Afinstallér</button>" : "<button data-abhent='" + id + "'>HENT</button>") + "</span>";
  }
  function tegnButikTop(b) {
    let h = butikFanerHtml() + "<div class='ab-overskrift'>🔥 Mest hentede</div><p class='ab-lille'>Hvilke apps og spil hotellets spillere har hentet mest lige nu.</p>";
    if (spilTopFejl) h += "<div class='ab-fejl'>⚠️ " + esc(spilTopFejl) + "</div>";
    if (!spilTop) {
      h += spilTopFejl ? "" : "<div class='ab-lille'>Henter toplisten …</div>";
    } else {
      const tael = {};
      spilTop.forEach(function (x) { tael[x.spil] = x.antal; });
      const liste = ALLE_APPS.concat(ALLE_SPIL).sort(function (a, c) { return (tael[c] || 0) - (tael[a] || 0); });
      h += liste.map(function (id, i) {
        const A = APPS[id], n = tael[id] || 0;
        return "<div class='ab-kort'><span class='ab-nr" + (i < 3 ? " top" : "") + "'>" + (i + 1) + "</span><span class='ab-ik' style='background:" + A.bg + "'>" + ik(A.ik) + "</span>" +
          "<span class='ab-info'><b>" + A.navn + "</b><small>⬇️ Hentet af " + n + " spiller" + (n === 1 ? "" : "e") + "</small></span>" + kortKnapper(id) + "</div>";
      }).join("");
    }
    b.innerHTML = h;
  }
  function tegnButikMine(b) {
    const medfulgt = GITTER.concat(DOCK).filter(function (id) { return APPS[id] && !APPS[id].spil; });
    const hentet = mineSpil();
    const raekke = function (id, hentetApp) {
      const A = APPS[id];
      return "<div class='ab-kort'><span class='ab-ik' style='background:" + A.bg + "'>" + (id === "events" ? "<span class='tlf-kal'></span>" : ik(A.ik)) + "</span>" +
        "<span class='ab-info'><b>" + A.navn + "</b><small>" + (hentetApp ? "Hentet fra App Butik" : "Fulgte med telefonen · kan ikke slettes") + "</small></span>" +
        (hentetApp ? kortKnapper(id) : "<span class='ab-knapper'><span class='ab-laast' title='Kan ikke slettes'>🔒</span></span>") + "</div>";
    };
    b.innerHTML = butikFanerHtml() +
      "<div class='ab-tal'><span><b>" + (medfulgt.length + hentet.length) + "</b>apps i alt</span><span><b>" + hentet.length + "</b>hentet</span><span><b>" + medfulgt.length + "</b>fulgte med</span></div>" +
      "<div class='ab-overskrift'>⬇️ Hentede apps</div>" + (hentet.length ? hentet.map(function (id) { return raekke(id, true); }).join("") : "<p class='ab-lille'>Du har ikke hentet nogen apps eller spil endnu.</p>") +
      "<div class='ab-overskrift'>📱 Fulgte med telefonen</div>" + medfulgt.map(function (id) { return raekke(id, false); }).join("");
    tegnKalendere(b);
  }
  function tegnKalendere(rod) {
    if (typeof opdaterUr === "function") try { opdaterUr(); } catch (e) {}
  }

  // ----- 🔦 Lommelygten lyser rummet op omkring din figur -----
  let lygteTaendt = false, lygteEl = null;
  function figurPaaSkaermen() {
    try {
      if (typeof laerred === "undefined" || typeof figur === "undefined" || typeof punkt !== "function") return null;
      const p = punkt(figur.x + 0.5, figur.y + 0.5);
      const r = laerred.getBoundingClientRect();
      const sx = r.width / (typeof BREDDE !== "undefined" ? BREDDE : laerred.width), sy = r.height / (typeof HOEJDE !== "undefined" ? HOEJDE : laerred.height);
      return { x: r.left + p.x * sx, y: r.top + p.y * sy, s: sx };
    } catch (e) { return null; }
  }
  function saetLygte(til) {
    lygteTaendt = til;
    const k = laasEl.querySelector("[data-l='lygte']");
    if (k) k.classList.toggle("taendt", til);
    if (til && !lygteEl) {
      lygteEl = document.createElement("div");
      lygteEl.id = "lommelygte-lys";
      const lr = typeof laerred !== "undefined" ? laerred : null;
      if (lr && lr.parentNode) lr.parentNode.insertBefore(lygteEl, lr.nextSibling); else document.body.appendChild(lygteEl);
      requestAnimationFrame(lygteLoop);
    }
    if (lygteEl) lygteEl.classList.toggle("til", til);
  }
  function lygteLoop() {
    if (!lygteEl) return;
    if (!lygteTaendt) { lygteEl.remove(); lygteEl = null; return; }
    if (ind.bat <= 0) { saetLygte(false); lille("🔦 Lommelygten slukkede – telefonen er løbet tør"); return; }
    const f = figurPaaSkaermen();
    if (f) {
      const r = Math.max(110, 150 * f.s), y = f.y - 34 * f.s;
      lygteEl.style.background = "radial-gradient(circle " + Math.round(r * 2.4) + "px at " + Math.round(f.x) + "px " + Math.round(y) + "px, rgba(255,246,200,.42) 0, rgba(255,240,180,.22) " + Math.round(r * .55) + "px, rgba(255,235,170,.06) " + Math.round(r) + "px, rgba(5,6,20,.55) " + Math.round(r * 1.6) + "px, rgba(5,6,20,.7) 100%)";
    }
    requestAnimationFrame(lygteLoop);
  }

  // ----- fælles for spillene -----
  function spilNoegle(id) { return "mit-hotel-spil-" + id + "-" + mig(); }
  function spilRekord(id) { try { const v = localStorage.getItem(spilNoegle(id)); return v === null ? null : +v; } catch (e) { return null; } }
  let spilKoerer = false, spilToken = 0, spilTaster = null, spilPauseFn = null;
  function stopSpil() { spilToken++; spilKoerer = false; spilTaster = null; spilPauseFn = null; }
  function tegnSpil(id) {
    stopSpil();
    const A = APPS[id], S = SPIL[id], token = spilToken;
    const r = spilRekord(id);
    appEl.innerHTML = top(A.navn) + "<div class='sp-indhold sp-" + id + "'>" +
      "<div class='sn-tal'><span>" + (S.pointNavn || "Point") + " <b class='sp-point'>0</b></span><span>Rekord <b class='sp-rek'>" + (r == null ? "–" : r) + "</b></span></div>" +
      "<div class='sp-braet'></div><div class='sp-hjaelp'>" + S.hjaelp + "</div></div>";
    const braet = appEl.querySelector(".sp-braet");
    const api = {
      aktiv: function () { return token === spilToken && appEl && appNu === id; },
      point: function (n) { const p = appEl && appEl.querySelector(".sp-point"); if (p) p.textContent = n; },
      hjaelp: function (t) { const h = appEl && appEl.querySelector(".sp-hjaelp"); if (h) h.innerHTML = t; },
      koerer: function (v) { if (token === spilToken) spilKoerer = v; },
      overlay: function (titel, tekst, knap, fn) {
        let o = braet.querySelector(".sn-over");
        if (!titel) { if (o) o.remove(); return; }
        if (!o) { o = document.createElement("div"); o.className = "sn-over"; braet.appendChild(o); }
        o.innerHTML = "<b>" + titel + "</b><span>" + tekst + "</span>" + (knap ? "<button>" + knap + "</button>" : "");
        if (knap) o.querySelector("button").addEventListener("click", function (e) { e.stopPropagation(); o.remove(); fn(); });
      },
      slut: function (point, lavBedst) {
        spilKoerer = false;
        const gl = spilRekord(id);
        const ny = point > 0 && (gl == null || (lavBedst ? point < gl : point > gl));
        if (ny) { try { localStorage.setItem(spilNoegle(id), String(point)); } catch (e) {} const rk = appEl && appEl.querySelector(".sp-rek"); if (rk) rk.textContent = point; }
        return ny;
      },
      // tegne-løkke der stopper, når appen lukkes, og holder pause, når telefonen lægges væk
      loop: function (trin) {
        let sidst = performance.now();
        function f(t) {
          if (token !== spilToken) return;
          if (tlf.hidden || appNu !== id) { spilKoerer = false; if (spilPauseFn) spilPauseFn(); return; }
          const dt = Math.min(3, (t - sidst) / 16.67); sidst = t;
          if (trin(dt) !== false) requestAnimationFrame(f);
        }
        requestAnimationFrame(f);
      },
      taster: function (fn) { spilTaster = fn; },
      pause: function (fn) { spilPauseFn = fn; },
      lerred: function (b, h) {
        const cv = document.createElement("canvas");
        cv.width = b * 2; cv.height = h * 2; cv.style.width = b + "px"; cv.style.height = h + "px";
        braet.appendChild(cv);
        const c = cv.getContext("2d"); c.scale(2, 2);
        return { cv: cv, c: c };
      },
    };
    S.lav(braet, api);
  }
  window.addEventListener("keydown", function (e) {
    if (tlf.hidden || !spilTaster || !APPS[appNu] || !APPS[appNu].spil) return;
    if (e.target && e.target.matches && e.target.matches("input, textarea") && e.target.closest("#telefon")) return;
    if (spilTaster(e.key, true) === true) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  window.addEventListener("keyup", function (e) {
    if (tlf.hidden || !spilTaster || !APPS[appNu] || !APPS[appNu].spil) return;
    if (spilTaster(e.key, false) === true) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  function blanding(l) { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = l[i]; l[i] = l[j]; l[j] = t; } return l; }

  const SPIL = {
    // 👫 Stjernestribe (mod venner over serveren)
    stribe: { hjaelp: "", lav: function (braet, api) { lavStribe(braet, api); } },
    // 🌟 Stjerneregn
    stjerner: {
      hjaelp: "Flyt kurven med musen eller ← →. Fang ⭐ (🌟 = 3 point). ⛈ koster et liv.",
      lav: function (braet, api) {
        const B = 250, H = 320, L = api.lerred(B, H), c = L.c;
        let s, venstre = false, hoejre = false;
        const himmel = []; for (let i = 0; i < 40; i++) himmel.push({ x: Math.random() * B, y: Math.random() * H, r: Math.random() * 1.2 + .3 });
        function nyt() { s = { kurv: B / 2, ting: [], point: 0, liv: 3, tid: 0, naeste: 30, blink: 0, slut: false }; api.point(0); }
        function tegn() {
          const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d1033"); g.addColorStop(1, "#3a2a6b");
          c.fillStyle = g; c.fillRect(0, 0, B, H);
          c.fillStyle = "rgba(255,255,255,.7)"; himmel.forEach(function (p) { c.globalAlpha = .4 + .4 * Math.sin((s.tid + p.x) / 20); c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }); c.globalAlpha = 1;
          c.textAlign = "center"; c.textBaseline = "middle";
          s.ting.forEach(function (t) { c.font = (t.type === "guld" ? 24 : 22) + "px serif"; c.fillText(t.type === "sky" ? "⛈️" : t.type === "guld" ? "🌟" : "⭐", t.x, t.y); });
          c.font = "34px serif"; c.fillText("🧺", s.kurv, H - 24);
          c.font = "14px serif"; c.textAlign = "left"; c.fillText("❤️".repeat(s.liv), 6, 14);
          if (s.blink > 0) { c.fillStyle = "rgba(255,60,60," + (s.blink / 30) + ")"; c.fillRect(0, 0, B, H); }
        }
        function trin(dt) {
          s.tid += dt;
          if (venstre) s.kurv -= 5 * dt; if (hoejre) s.kurv += 5 * dt;
          s.kurv = Math.max(20, Math.min(B - 20, s.kurv));
          s.naeste -= dt;
          if (s.naeste <= 0) {
            const r = Math.random(), skyChance = Math.min(.38, .12 + s.point * .006);
            s.ting.push({ x: 16 + Math.random() * (B - 32), y: -14, v: 1.6 + Math.random() * .8 + s.point * .025, type: r < skyChance ? "sky" : r < skyChance + .1 ? "guld" : "stjerne" });
            s.naeste = Math.max(18, 48 - s.point * .6);
          }
          s.ting = s.ting.filter(function (t) {
            t.y += t.v * dt;
            if (t.y > H - 40 && t.y < H - 10 && Math.abs(t.x - s.kurv) < 28) {
              if (t.type === "sky") { s.liv--; s.blink = 30; } else { s.point += t.type === "guld" ? 3 : 1; api.point(s.point); }
              return false;
            }
            return t.y < H + 20;
          });
          if (s.blink > 0) s.blink -= dt;
          tegn();
          if (s.liv <= 0) { slut(); return false; }
        }
        function slut() {
          const ny = api.slut(s.point);
          api.overlay(ny ? "🏆 Ny rekord!" : "Spillet er slut", "Du fangede " + s.point + " point", "Spil igen", start);
        }
        function start() { nyt(); api.koerer(true); api.loop(trin); }
        L.cv.addEventListener("pointermove", function (e) { const r = L.cv.getBoundingClientRect(); s.kurv = (e.clientX - r.left) / r.width * B; });
        api.taster(function (k, ned) { if (k === "ArrowLeft") { venstre = ned; return true; } if (k === "ArrowRight") { hoejre = ned; return true; } });
        api.pause(function () { api.overlay("⏸ Pause", "Spillet venter på dig", "Fortsæt", function () { api.koerer(true); api.loop(trin); }); });
        nyt(); tegn();
        api.overlay("🌟 Stjerneregn", "Fang stjernerne – undgå tordenskyerne", "Start", start);
      },
    },
    // 🐤 Flagre
    flagre: {
      hjaelp: "Klik på skærmen (eller tryk mellemrum) for at flagre.",
      lav: function (braet, api) {
        const B = 250, H = 320, L = api.lerred(B, H), c = L.c, GAB = 104;
        let s, koerer = false;
        function nyt() { s = { y: H / 2, v: 0, soejler: [], point: 0, tid: 0, naeste: 60, jord: 0 }; api.point(0); }
        function flagre() { if (!koerer) return; s.v = -5.4; }
        function tegn() {
          const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#ffd3a8"); g.addColorStop(.6, "#f59bb0"); g.addColorStop(1, "#8a5ea8");
          c.fillStyle = g; c.fillRect(0, 0, B, H);
          // søjler
          s.soejler.forEach(function (p) {
            [[0, p.y - GAB / 2], [p.y + GAB / 2, H - 20]].forEach(function (d) {
              const top = d[0], bund = d[1];
              c.fillStyle = "#7a2f2f"; c.fillRect(p.x, top, 38, bund - top);
              c.fillStyle = "#9a4040"; c.fillRect(p.x + 4, top, 8, bund - top);
              c.fillStyle = "#e8b64a"; c.fillRect(p.x - 4, top === 0 ? bund - 10 : top, 46, 10);
            });
          });
          c.fillStyle = "#5a3b2a"; c.fillRect(0, H - 20, B, 20);
          c.fillStyle = "#7a5238"; for (let x = -s.jord % 20; x < B; x += 20) c.fillRect(x, H - 20, 10, 4);
          // fuglen
          const vinkel = Math.max(-.5, Math.min(1, s.v / 8));
          c.save(); c.translate(60, s.y); c.rotate(vinkel);
          c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
          c.fillStyle = "#f5a623"; c.beginPath(); c.ellipse(-3, 3, 6, 4 + Math.sin(s.tid / 3) * 2, 0, 0, 7); c.fill();
          c.fillStyle = "#fff"; c.beginPath(); c.arc(4, -4, 4, 0, 7); c.fill();
          c.fillStyle = "#222"; c.beginPath(); c.arc(5, -4, 2, 0, 7); c.fill();
          c.fillStyle = "#ff7a3d"; c.beginPath(); c.moveTo(9, 0); c.lineTo(16, 2); c.lineTo(9, 5); c.fill();
          c.restore();
        }
        function trin(dt) {
          s.tid += dt; s.jord += 2 * dt;
          s.v += .32 * dt; s.y += s.v * dt;
          s.naeste -= dt;
          if (s.naeste <= 0) { s.soejler.push({ x: B + 10, y: 70 + Math.random() * (H - 160), talt: false }); s.naeste = 88; }
          s.soejler.forEach(function (p) {
            p.x -= 2 * dt;
            if (!p.talt && p.x + 38 < 60) { p.talt = true; s.point++; api.point(s.point); }
          });
          s.soejler = s.soejler.filter(function (p) { return p.x > -50; });
          if (s.y < 10) { s.y = 10; s.v = Math.max(0, s.v); }
          const ramt = s.y > H - 31 || s.soejler.some(function (p) { return 60 + 10 > p.x - 4 && 60 - 10 < p.x + 42 && (s.y - 10 < p.y - GAB / 2 || s.y + 10 > p.y + GAB / 2); });
          tegn();
          if (ramt) { koerer = false; const ny = api.slut(s.point); api.overlay(ny ? "🏆 Ny rekord!" : "Av!", "Du kom forbi " + s.point + " søjle" + (s.point === 1 ? "" : "r"), "Prøv igen", start); return false; }
        }
        function start() { nyt(); koerer = true; api.koerer(true); s.v = -5.4; api.loop(trin); }
        L.cv.addEventListener("pointerdown", function (e) { e.preventDefault(); flagre(); });
        api.taster(function (k, ned) { if (k === " " || k === "ArrowUp") { if (ned) flagre(); return true; } });
        api.pause(function () { koerer = false; api.overlay("⏸ Pause", "Spillet venter på dig", "Fortsæt", function () { koerer = true; api.koerer(true); api.loop(trin); }); });
        nyt(); tegn();
        api.overlay("🐤 Flagre", "Hjælp fuglen forbi søjlerne", "Start", start);
      },
    },
    // 🃏 Huskespil
    huske: {
      pointNavn: "Træk",
      hjaelp: "Find alle 8 par. Rekorden er færrest træk.",
      lav: function (braet, api) {
        const BILLEDER = ["🌸", "🍀", "🎈", "⭐", "🍩", "🐱", "🎵", "💎"];
        let kort, vendt, traek, fundet, laast;
        const net = document.createElement("div"); net.className = "hk-net"; braet.appendChild(net);
        function nyt() {
          kort = blanding(BILLEDER.concat(BILLEDER)); vendt = []; traek = 0; fundet = 0; laast = false; api.point(0);
          net.innerHTML = kort.map(function (b, i) { return "<button class='hk-kort' data-hk='" + i + "'><span class='bag'>✦</span><span class='for'>" + b + "</span></button>"; }).join("");
        }
        net.addEventListener("click", function (e) {
          const k = e.target.closest("[data-hk]");
          if (!k || laast || k.classList.contains("vendt")) return;
          k.classList.add("vendt"); vendt.push(k);
          if (vendt.length < 2) return;
          traek++; api.point(traek);
          const a = vendt[0], b = vendt[1]; vendt = [];
          if (kort[+a.dataset.hk] === kort[+b.dataset.hk]) {
            a.classList.add("par"); b.classList.add("par"); fundet++;
            if (fundet === BILLEDER.length) { const ny = api.slut(traek, true); setTimeout(function () { api.overlay(ny ? "🏆 Ny rekord!" : "🎉 Flot!", "Du fandt alle par på " + traek + " træk", "Spil igen", nyt); }, 500); }
          } else {
            laast = true;
            setTimeout(function () { a.classList.remove("vendt"); b.classList.remove("vendt"); laast = false; }, 800);
          }
        });
        nyt();
      },
    },
    // 🐹 Muldvarpe
    muldvarp: {
      hjaelp: "Klik på 🐹 når de dukker op (⭐-hamster = 3 point). Du har 30 sekunder.",
      lav: function (braet, api) {
        const net = document.createElement("div"); net.className = "mv-net"; braet.appendChild(net);
        net.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return "<button class='mv-hul' data-mv='" + i + "'><span></span></button>"; }).join("");
        const huller = net.querySelectorAll(".mv-hul");
        let point = 0, slutTid = 0, timer = null, koerer = false;
        function ryd() { huller.forEach(function (h) { h.classList.remove("oppe", "guld", "ramt"); }); }
        function tik() {
          if (!api.aktiv() || tlf.hidden) { clearInterval(timer); koerer = false; api.koerer(false); if (api.aktiv()) api.overlay("⏸ Pause", "Spillet er stoppet", "Start forfra", start); return; }
          const tilbage = Math.max(0, Math.ceil((slutTid - Date.now()) / 1000));
          api.hjaelp("⏱ " + tilbage + " sekunder tilbage");
          if (tilbage <= 0) {
            clearInterval(timer); koerer = false; ryd();
            const ny = api.slut(point);
            api.hjaelp(APPS.muldvarp && SPIL.muldvarp.hjaelp);
            api.overlay(ny ? "🏆 Ny rekord!" : "⏱ Tiden er gået", "Du ramte " + point + " point", "Spil igen", start);
            return;
          }
          huller.forEach(function (h) { if (h.classList.contains("oppe") && Date.now() > +h.dataset.ned) h.classList.remove("oppe", "guld"); });
          if (Math.random() < .55) {
            const fri = Array.prototype.filter.call(huller, function (h) { return !h.classList.contains("oppe"); });
            if (fri.length) {
              const h = fri[Math.floor(Math.random() * fri.length)];
              const guld = Math.random() < .12;
              h.firstChild.textContent = guld ? "🌟" : "🐹";
              h.classList.remove("ramt"); h.classList.add("oppe"); h.classList.toggle("guld", guld);
              h.dataset.ned = Date.now() + Math.max(550, 1100 - point * 12);
            }
          }
        }
        net.addEventListener("pointerdown", function (e) {
          const h = e.target.closest(".mv-hul");
          if (!h || !koerer || !h.classList.contains("oppe")) return;
          point += h.classList.contains("guld") ? 3 : 1; api.point(point);
          h.classList.remove("oppe", "guld"); h.classList.add("ramt");
          setTimeout(function () { h.classList.remove("ramt"); }, 250);
        });
        function start() { point = 0; api.point(0); ryd(); slutTid = Date.now() + 30000; koerer = true; api.koerer(true); clearInterval(timer); timer = setInterval(tik, 160); }
        api.overlay("🐹 Muldvarpe", "Slå så mange som muligt på 30 sekunder", "Start", start);
      },
    },
    // ⭕ Kryds & bolle
    kryds: {
      pointNavn: "Sejre i træk",
      hjaelp: "Du er ✖, telefonen er ⭕. Rekorden er flest sejre i træk.",
      lav: function (braet, api) {
        const net = document.createElement("div"); net.className = "kb-net"; braet.appendChild(net);
        const LINJER = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        let felt, tur, iTraek = 0, slut;
        function vinder(f) {
          for (let i = 0; i < LINJER.length; i++) { const l = LINJER[i]; if (f[l[0]] && f[l[0]] === f[l[1]] && f[l[0]] === f[l[2]]) return { hvem: f[l[0]], linje: l }; }
          return f.every(Boolean) ? { hvem: "uafgjort" } : null;
        }
        function tegn(v) {
          net.innerHTML = felt.map(function (x, i) {
            return "<button class='kb-felt" + (v && v.linje && v.linje.indexOf(i) >= 0 ? " vind" : "") + "' data-kb='" + i + "'>" + (x === "X" ? "✖" : x === "O" ? "⭕" : "") + "</button>";
          }).join("");
        }
        function nyt() { felt = ["", "", "", "", "", "", "", "", ""]; tur = "X"; slut = false; tegn(); api.hjaelp(SPIL.kryds.hjaelp); }
        function find(hvem) {
          for (let i = 0; i < LINJER.length; i++) {
            const l = LINJER[i], v = l.map(function (j) { return felt[j]; });
            if (v.filter(function (x) { return x === hvem; }).length === 2 && v.indexOf("") >= 0) return l[v.indexOf("")];
          }
          return -1;
        }
        function computer() {
          let i = find("O");
          if (i < 0) i = find("X");
          if (i < 0 && Math.random() < .15) i = -1;                    // nogle gange er telefonen lidt doven
          if (i < 0 && !felt[4]) i = 4;
          if (i < 0) { const fri = []; felt.forEach(function (x, j) { if (!x) fri.push(j); }); i = fri[Math.floor(Math.random() * fri.length)]; }
          felt[i] = "O"; tur = "X"; tjek();
        }
        function tjek() {
          const v = vinder(felt);
          tegn(v);
          if (!v) return;
          slut = true;
          if (v.hvem === "X") { iTraek++; api.point(iTraek); const ny = api.slut(iTraek); api.overlay(ny ? "🏆 Ny rekord!" : "🎉 Du vandt!", iTraek + " sejr" + (iTraek === 1 ? "" : "e") + " i træk", "Næste spil", nyt); }
          else if (v.hvem === "O") { const før = iTraek; iTraek = 0; api.point(0); api.overlay("📱 Telefonen vandt", før ? "Din stime på " + før + " er slut" : "Prøv igen!", "Nyt spil", nyt); }
          else api.overlay("🤝 Uafgjort", "Stimen fortsætter: " + iTraek, "Næste spil", nyt);
        }
        net.addEventListener("click", function (e) {
          const k = e.target.closest("[data-kb]");
          if (!k || slut || tur !== "X" || felt[+k.dataset.kb]) return;
          felt[+k.dataset.kb] = "X"; tur = "O"; tjek();
          if (!slut) { api.hjaelp("📱 Telefonen tænker …"); setTimeout(function () { if (api.aktiv() && !slut) { computer(); if (!slut) api.hjaelp(SPIL.kryds.hjaelp); } }, 450); }
        });
        nyt();
      },
    },
  };

  // ---------------------------------------------------------------
  //  🎮 Stjernestribe — spil mod en ven (database-38-spil-med-venner.sql)
  //  Man inviterer en ven, vennen trykker Bekræft, og så skiftes man til
  //  at lægge brikker. Fire på stribe vinder. Begge skal have hentet spillet.
  // ---------------------------------------------------------------
  let stribeData = { kampe: [], har_spillet: [] }, stribeFejl = "", stribeAabn = null, stribeSidstHentet = 0;
  function stribeOnline() { return typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function stribeHent() {
    if (!stribeOnline()) { stribeFejl = "Spil med venner virker kun, når du er logget ind på hotellets server."; return Promise.resolve(stribeData); }
    return serverKald("hv_kamp_hent", { p_token: mitToken(), p_spil: "stribe" }).then(function (d) {
      stribeData = d && d.kampe ? d : { kampe: [], har_spillet: [] };
      stribeFejl = ""; stribeSidstHentet = Date.now();
      return stribeData;
    }).catch(function (e) {
      stribeFejl = /function|schema cache|does not exist|Could not find/i.test(e.message) ? "Spil med venner virker, når database-38-spil-med-venner.sql er kørt i Supabase." : e.message;
      return stribeData;
    });
  }
  function stribeKald(fn, data) {
    data.p_token = mitToken();
    return serverKald(fn, data).then(stribeHent).catch(function (e) { lille(e.message); return stribeHent(); });
  }
  function migLille() { return mig().toLowerCase(); }
  function erVaert(k) { return k.vaert.toLowerCase() === migLille(); }
  function modstander(k) { return erVaert(k) ? k.gaest : k.vaert; }
  function minTur(k) { return k.status === "igang" && k.tur === (erVaert(k) ? 1 : 2); }
  function stribeTal() {
    return (stribeData.kampe || []).filter(function (k) { return (k.status === "inviteret" && !erVaert(k)) || minTur(k); }).length;
  }
  function stribeInstalleret(har) {
    if (stribeOnline()) serverKald("hv_spil_installeret", { p_token: mitToken(), p_spil: "stribe", p_har: har }).catch(function () {});
  }

  function lavStribe(braet, api) {
    const boks = document.createElement("div"); boks.className = "st-boks"; braet.appendChild(boks);
    let vis = stribeAabn || "lobby";
    stribeAabn = null;
    function tegn() {
      if (!api.aktiv()) return;
      const kampe = stribeData.kampe || [];
      if (vis !== "lobby") {
        const k = kampe.find(function (x) { return x.id === vis; });
        if (!k) { vis = "lobby"; } else { tegnKamp(k); return; }
      }
      api.hjaelp("Inviter en ven og læg fire på stribe – vandret, lodret eller skråt. Spillet giver ingen Glimt.");
      const inv = kampe.filter(function (k) { return k.status === "inviteret" && !erVaert(k); });
      const mine = kampe.filter(function (k) { return k.status === "igang" || (k.status === "inviteret" && erVaert(k)); });
      const faerdige = kampe.filter(function (k) { return ["slut", "afvist", "annulleret"].indexOf(k.status) >= 0; }).slice(0, 5);
      const venner = vennerListe();
      let h = stribeFejl ? "<div class='st-note'>⚠️ " + esc(stribeFejl) + "</div>" : "";
      if (inv.length) h += "<div class='st-ov'>📨 Invitationer</div>" + inv.map(function (k) {
        return "<div class='st-raekke ny'>" + avatarHtml(k.vaert, true) + "<span><b>" + esc(k.vaert) + "</b> inviterer dig</span><button class='ja' data-stja='" + k.id + "'>Bekræft</button><button data-stnej='" + k.id + "'>Nej</button></div>";
      }).join("");
      h += "<div class='st-ov'>🎮 Dine spil</div>" + (mine.length ? mine.map(function (k) {
        const m = modstander(k);
        if (k.status === "inviteret") return "<div class='st-raekke'>" + avatarHtml(m, true) + "<span><b>" + esc(m) + "</b><small>Venter på at " + esc(m) + " bekræfter …</small></span><button data-stopgiv='" + k.id + "'>Annullér</button></div>";
        return "<div class='st-raekke klik' data-stvis='" + k.id + "'>" + avatarHtml(m, true) + "<span><b>mod " + esc(m) + "</b><small>" + (minTur(k) ? "⭐ Din tur!" : "Venter på " + esc(m) + " …") + "</small></span><button>Spil</button></div>";
      }).join("") : "<div class='st-tom'>Ingen spil i gang. Inviter en ven herunder 👇</div>");
      h += "<div class='st-ov'>👫 Inviter en ven</div>" + (venner.length ? venner.map(function (n) {
        const har = (stribeData.har_spillet || []).some(function (x) { return x.toLowerCase() === n.toLowerCase(); });
        return "<div class='st-raekke'>" + avatarHtml(n, true) + "<span><b>" + esc(n) + "</b><small>" + (onlineOm(n) ? "🟢 online" : "⚪ ikke online") + (har ? "" : " · har ikke hentet spillet") + "</small></span>" +
          "<button class='ja' data-stinv='" + esc(n) + "'" + (har && !stribeFejl ? "" : " disabled") + ">Invitér</button></div>";
      }).join("") : "<div class='st-tom'>Du har ingen venner endnu. Tilføj venner i Kontakter.</div>");
      if (faerdige.length) h += "<div class='st-ov'>🏁 Seneste spil</div>" + faerdige.map(function (k) {
        const m = modstander(k), mitNr = erVaert(k) ? 1 : 2;
        const t = k.status === "afvist" ? esc(k.gaest) + " sagde nej tak" : k.status === "annulleret" ? "Annulleret" : k.vinder === 3 ? "Uafgjort mod " + esc(m) : k.vinder === mitNr ? "🏆 Du vandt over " + esc(m) : esc(m) + " vandt";
        return "<div class='st-raekke lille'><span>" + t + "</span></div>";
      }).join("");
      boks.innerHTML = h;
      tegnAvatarer(boks);
    }
    function tegnKamp(k) {
      const m = modstander(k), mitNr = erVaert(k) ? 1 : 2;
      let status;
      if (k.status === "slut") status = k.vinder === 3 ? "🤝 Uafgjort!" : k.vinder === mitNr ? "🎉 Du vandt!" : "😮 " + esc(m) + " vandt";
      else if (k.status !== "igang") status = "Spillet er stoppet";
      else status = minTur(k) ? "⭐ Din tur – klik på en søjle" : "Venter på " + esc(m) + " …";
      const vinderFelter = k.status === "slut" && k.vinder < 3 ? fireFelter(k.braet, k.vinder) : [];
      boks.innerHTML = "<div class='st-kamptop'><button data-sttilbage>‹ Alle spil</button><span>Du <i class='st-brik b" + mitNr + "'></i> mod " + esc(m) + " <i class='st-brik b" + (3 - mitNr) + "'></i></span></div>" +
        "<div class='st-status" + (minTur(k) ? " min" : "") + "'>" + status + "</div>" +
        "<div class='st-net" + (minTur(k) ? " min" : "") + "'>" + k.braet.map(function (v, i) {
          return "<button class='st-felt" + (i === k.sidste ? " sidst" : "") + (vinderFelter.indexOf(i) >= 0 ? " vind" : "") + "' data-stkol='" + (i % 7) + "'>" + (v ? "<i class='st-brik b" + v + "'></i>" : "") + "</button>";
        }).join("") + "</div>" +
        (k.status === "igang" ? "<button class='st-opgiv' data-stopgiv='" + k.id + "'>🏳️ Giv op</button>" : "<button class='st-opgiv ja' data-stny='" + esc(m) + "'>🔁 Spil igen mod " + esc(m) + "</button>");
      api.hjaelp("Fire på stribe vinder – vandret, lodret eller skråt.");
    }
    function fireFelter(b, v) {
      const R = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) for (let i = 0; i < 4; i++) {
        const l = [0, 1, 2, 3].map(function (n) { return [r + R[i][0] * n, c + R[i][1] * n]; });
        if (l.every(function (p) { return p[0] < 6 && p[1] >= 0 && p[1] < 7 && b[p[0] * 7 + p[1]] === v; })) return l.map(function (p) { return p[0] * 7 + p[1]; });
      }
      return [];
    }
    let travl = false;
    boks.addEventListener("click", function (e) {
      const g = function (s) { return e.target.closest(s); };
      let k;
      if (travl) return;
      const gor = function (p) { travl = true; p.then(function () { travl = false; tegn(); }); };
      if ((k = g("[data-stja]"))) { vis = +k.dataset.stja; gor(stribeKald("hv_kamp_svar", { p_id: vis, p_ja: true })); return; }
      if ((k = g("[data-stnej]"))) { gor(stribeKald("hv_kamp_svar", { p_id: +k.dataset.stnej, p_ja: false })); return; }
      if ((k = g("[data-stopgiv]"))) {
        if (!k.classList.contains("sikker")) { k.classList.add("sikker"); k.textContent = "Er du sikker?"; return; }
        gor(stribeKald("hv_kamp_opgiv", { p_id: +k.dataset.stopgiv })); return;
      }
      if ((k = g("[data-stinv]")) || (k = g("[data-stny]"))) {
        const ven = k.dataset.stinv || k.dataset.stny;
        travl = true;
        serverKald("hv_kamp_inviter", { p_token: mitToken(), p_ven: ven, p_spil: "stribe" }).then(function (id) {
          lille("📨 Invitation sendt til " + ven); vis = "lobby"; return stribeHent();
        }).catch(function (er) { lille(er.message); }).then(function () { travl = false; tegn(); });
        return;
      }
      if ((k = g("[data-stvis]"))) { vis = +k.dataset.stvis; tegn(); return; }
      if (g("[data-sttilbage]")) { vis = "lobby"; tegn(); return; }
      if ((k = g("[data-stkol]"))) {
        const kamp = (stribeData.kampe || []).find(function (x) { return x.id === vis; });
        if (!kamp || !minTur(kamp)) { if (kamp && kamp.status === "igang") lille("Vent på din tur ⏳"); return; }
        gor(stribeKald("hv_kamp_traek", { p_id: vis, p_kol: +k.dataset.stkol }));
      }
    });
    tegn();
    stribeHent().then(tegn);
    const t = setInterval(function () {
      if (!api.aktiv()) { clearInterval(t); return; }
      if (tlf.hidden || travl) return;
      stribeHent().then(function () { if (!travl && !boks.querySelector(".sikker")) tegn(); });
    }, 2500);
  }

  // Invitationer og "din tur" dukker op, selvom telefonen ikke er åben
  let stribeSet = {};
  try { stribeSet = JSON.parse(localStorage.getItem("mit-hotel-spil-set-" + mig()) || "{}"); } catch (e) {}
  function stribeGemSet() { try { localStorage.setItem("mit-hotel-spil-set-" + mig(), JSON.stringify(stribeSet)); } catch (e) {} }
  function visSpilPopup(tekst, knap, fn, nej) {
    let p = document.getElementById("spil-popup");
    if (!p) { p = document.createElement("div"); p.id = "spil-popup"; document.body.appendChild(p); }
    p.innerHTML = "<div class='sp-pop-ik'>🎮</div><div class='sp-pop-tekst'>" + tekst + "</div><div class='sp-pop-knapper'><button class='ja'>" + knap + "</button><button class='nej'>" + (nej ? "Nej tak" : "Senere") + "</button></div>";
    p.classList.remove("vis"); void p.offsetWidth; p.classList.add("vis");
    p.querySelector(".ja").addEventListener("click", function () { p.classList.remove("vis"); fn(true); });
    p.querySelector(".nej").addEventListener("click", function () { p.classList.remove("vis"); fn(false); });
    ding();
  }
  function aabnKamp(id) {
    if (tlf.hidden) aabnTelefon();
    stribeAabn = id;
    setTimeout(function () { aabnApp("stribe"); }, tlf.hidden ? 50 : 0);
  }
  setInterval(function () {
    if (!harSpil("stribe") || !stribeOnline() || ind.bat <= 0) return;
    if (appNu === "stribe" && !tlf.hidden) return;                       // appen henter selv
    stribeHent().then(function () {
      let aendret = false;
      (stribeData.kampe || []).forEach(function (k) {
        const noegle = k.id + ":" + k.status + ":" + k.tur;
        if (stribeSet[noegle]) return;
        if (k.status === "inviteret" && !erVaert(k)) {
          stribeSet[noegle] = 1; aendret = true;
          visSpilPopup("<b>" + esc(k.vaert) + "</b> inviterer dig til et spil <b>Stjernestribe</b>", "✅ Bekræft", function (ja) {
            stribeKald("hv_kamp_svar", { p_id: k.id, p_ja: ja }).then(function () { if (ja) aabnKamp(k.id); });
          }, true);
        } else if (minTur(k) && Date.now() - k.opdateret < 120000) {
          stribeSet[noegle] = 1; aendret = true;
          const foerste = k.braet.every(function (v) { return !v; });
          visSpilPopup(foerste ? "<b>" + esc(k.gaest) + "</b> sagde ja! Det er din tur i Stjernestribe" : "Det er din tur mod <b>" + esc(modstander(k)) + "</b> i Stjernestribe", "▶ Spil nu", function (ja) { if (ja) aabnKamp(k.id); });
        }
      });
      if (aendret) stribeGemSet();
      if (!tlf.hidden && skaermNu === "hjem" && !redigerer) tegnHjem();
    });
  }, 7000);
  // hent-status sendes til serveren, så venner kan se, at man har spillet
  setTimeout(function () { if (harSpil("stribe")) stribeInstalleret(true); }, 4000);

  // ---------------------------------------------------------------
  //  📝 Noter — man kan have mange noter (gemt som liste)
  // ---------------------------------------------------------------
  let noteListe = [];
  (function () {
    let raa = "";
    try { raa = localStorage.getItem("mit-hotel-telefon-noter-" + mig()) || ""; } catch (e) {}
    try { const l = JSON.parse(raa); if (Array.isArray(l)) noteListe = l; else throw 0; }
    catch (e) { noteListe = raa.trim() ? [{ id: Date.now(), tekst: raa, tid: Date.now() }] : []; }
    synkNoter();
  })();
  function synkNoter() {
    noteListe.sort(function (a, b) { return b.tid - a.tid; });
    noter = noteListe.length ? noteListe[0].tekst : "";
  }
  function gemNoter() {
    synkNoter();
    try { localStorage.setItem("mit-hotel-telefon-noter-" + mig(), JSON.stringify(noteListe)); } catch (e) {}
  }
  function noteTitel(n) { const l = n.tekst.trim().split("\n")[0]; return l ? l.slice(0, 40) : "Ny note"; }
  function tegnNoter() {
    appEl.innerHTML = top("Noter", "hjem", "<button class='tlf-tb' data-ntny title='Ny note'>" + ik("skriv", 20) + "</button>") + "<div class='nt-liste'></div>";
    appEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-ntny]")) { const n = { id: Date.now(), tekst: "", tid: Date.now() }; noteListe.unshift(n); tegnNote(n.id); return; }
      const li = e.target.closest("[data-nt]");
      if (li) { tegnNote(+li.dataset.nt); return; }
      if (e.target.closest("[data-nttilbage]")) { tilbageTilNoter(); return; }
      const sl = e.target.closest("[data-ntslet]");
      if (sl) {
        if (!sl.classList.contains("sikker")) { sl.classList.add("sikker"); sl.textContent = "Slet?"; setTimeout(function () { if (sl.isConnected) { sl.classList.remove("sikker"); sl.textContent = "🗑"; } }, 3000); return; }
        noteListe = noteListe.filter(function (n) { return n.id !== +sl.dataset.ntslet; }); gemNoter(); lille("🗑 Noten er slettet"); tegnNoteListe(true);
      }
    });
    tegnNoteListe(false);
  }
  function tilbageTilNoter() {
    noteListe = noteListe.filter(function (n) { return n.tekst.trim(); });
    gemNoter();
    tegnNoteListe(true);
  }
  function tegnNoteListe(skiftTop) {
    if (skiftTop) appEl.querySelector(".tlf-top").outerHTML = top("Noter", "hjem", "<button class='tlf-tb' data-ntny title='Ny note'>" + ik("skriv", 20) + "</button>");
    const omr = appEl.querySelector(".nt-liste, .tlf-noter");
    const ny = document.createElement("div"); ny.className = "nt-liste";
    ny.innerHTML = "<div class='nt-antal'>" + noteListe.length + " note" + (noteListe.length === 1 ? "" : "r") + "</div>" +
      (noteListe.length ? "<ul>" + noteListe.map(function (n) {
        const rest = n.tekst.trim().split("\n").slice(1).join(" ").trim();
        return "<li data-nt='" + n.id + "'><b>" + esc(noteTitel(n)) + "</b><small>" + esc(noteDato(n.tid)) + " · " + (rest ? esc(rest.slice(0, 40)) : "Ingen ekstra tekst") + "</small></li>";
      }).join("") + "</ul>" : "<div class='tlf-tom'><span class='st'>📝</span>Ingen noter endnu.<br>Tryk på ✏️ for at skrive en.</div>");
    omr.replaceWith(ny);
  }
  function tegnNote(id) {
    const n = noteListe.find(function (x) { return x.id === id; });
    if (!n) return;
    appEl.querySelector(".tlf-top").outerHTML = "<div class='tlf-top'><button class='tlf-tb nt-tilbage' data-nttilbage title='Alle noter'>" + ik("tilbage", 20) + "<span>Noter</span></button><h3></h3><button class='tlf-tb' data-ntslet='" + n.id + "' title='Slet noten'>🗑</button></div>";
    const omr = appEl.querySelector(".nt-liste, .tlf-noter");
    const t = document.createElement("textarea"); t.className = "tlf-noter"; t.placeholder = "Skriv en note …"; t.value = n.tekst;
    omr.replaceWith(t);
    t.addEventListener("keydown", function (e) { e.stopPropagation(); });
    t.addEventListener("input", function () { n.tekst = t.value; n.tid = Date.now(); gemNoter(); });
    t.focus();
  }
  function noteDato(t) {
    const d = new Date(t), nu = new Date();
    if (d.toDateString() === nu.toDateString()) return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    return d.getDate() + "/" + (d.getMonth() + 1);
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
          const kanGaa = kanFoelge(n);
          return "<li data-chat='" + esc(n) + "'>" + avatarHtml(n) + "<span class='info'><b>" + esc(n) + "</b><span class='" + (on ? "on" : "") + "'>" + esc(sted) + "</span></span>" +
            (kanGaa ? "<button class='tlf-lk' data-gaa title='Følg " + esc(n) + "'>" + ik("gaa", 17) + "</button>" : "") +
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
    if (t.closest("[data-gaa]")) { foelgVen(navn); return; }
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
      "<span class='ti'>" + avatarHtml(navn, true) + "<b>" + (s.advarsel ? "⚠️ " : "") + esc(navn) + "</b><small>" + (on ? "🟢 " + esc(stedFor(navn)) : "Offline") + "</small></span>" +
      (kanFoelge(navn) ? "<button class='tlf-tb' data-foelg title='Følg " + esc(navn) + "'>" + ik("gaa", 20) + "</button>" : "<span class='tlf-tb'></span>") + "</div>" +
      "<div class='tlf-chat'></div>" +
      "<form class='tlf-skriv' autocomplete='off'><input maxlength='200' placeholder='Skriv en besked …'><button type='submit' disabled title='Send'>" + ik("send", 18) + "</button></form>";
    tegnAvatarer(appEl.querySelector(".tlf-top"));
    const fk = appEl.querySelector("[data-foelg]");
    if (fk) fk.addEventListener("click", function () { foelgVen(navn); });
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
  //  🐍 Snake — saml Glimt-stjerner, få Glimt og kom på toplisten
  // ---------------------------------------------------------------
  const SN_B = 15, SN_H = 15;            // felter
  const SN_MAKS_SPIL = 25, SN_MAKS_DAG = 100;
  let snakeKoerer = false, sn = null, snakeVis = "spil", snakeTopFane = "hotel", snakeTop = null;
  const snStjerne = new Image(); snStjerne.src = "billeder/glimt.png";
  function snRekordNoegle() { return "mit-hotel-snake-" + mig(); }
  function snRekord() { try { return JSON.parse(localStorage.getItem(snRekordNoegle()) || "{}"); } catch (e) { return {}; } }
  function snGemRekord(r) { try { localStorage.setItem(snRekordNoegle(), JSON.stringify(r)); } catch (e) {} }
  function snIdag() { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  function tegnSnake() {
    const r = snRekord();
    appEl.innerHTML = top("Snake", "hjem", "<button class='tlf-tb' data-sntop title='Topliste'>🏆</button>") +
      "<div class='sn-indhold'>" +
        "<div class='sn-tal'><span>Point <b class='sn-point'>0</b></span><span>Rekord <b class='sn-rek'>" + (r.bedst || 0) + "</b></span></div>" +
        "<div class='sn-braet'><canvas></canvas><div class='sn-over'></div></div>" +
        "<div class='sn-pile'><button data-sn='op'>▲</button><div><button data-sn='venstre'>◀</button><button data-sn='ned'>▼</button><button data-sn='hoejre'>▶</button></div></div>" +
        "<div class='sn-toplisten' hidden></div>" +
      "</div>";
    const cv = appEl.querySelector("canvas");
    const braet = appEl.querySelector(".sn-braet");
    const stoer = Math.floor(Math.min(braet.clientWidth || 240, 250) / SN_B) * SN_B;
    cv.width = stoer * 2; cv.height = stoer * 2;
    cv.style.width = stoer + "px"; cv.style.height = stoer + "px";
    snakeVis = "spil";
    nytSnakeSpil();
    snOverlay("start");
    appEl.querySelector(".sn-pile").addEventListener("pointerdown", function (e) {
      const k = e.target.closest("[data-sn]");
      if (!k) return;
      e.preventDefault();
      styrSnake(k.dataset.sn);
    });
    // stryg på brættet
    let start = null;
    braet.addEventListener("pointerdown", function (e) { start = { x: e.clientX, y: e.clientY }; });
    braet.addEventListener("pointerup", function (e) {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) + Math.abs(dy) < 14) { if (!snakeKoerer) startSnake(); return; }
      styrSnake(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "hoejre" : "venstre") : (dy > 0 ? "ned" : "op"));
    });
    appEl.querySelector("[data-sntop]").addEventListener("click", function () {
      if (snakeVis === "top") visSnakeSpil(); else visTopliste();
    });
  }
  function nytSnakeSpil() {
    const m = Math.floor(SN_B / 2);
    sn = { krop: [{ x: m - 2, y: m }, { x: m - 3, y: m }, { x: m - 4, y: m }], ret: { x: 1, y: 0 }, naeste: [], mad: null, point: 0, fart: 150, sidst: 0, slut: false };
    nyMad();
    tegnBraet();
    const p = appEl && appEl.querySelector(".sn-point");
    if (p) p.textContent = "0";
  }
  function nyMad() {
    let x, y, n = 0;
    do { x = Math.floor(Math.random() * SN_B); y = Math.floor(Math.random() * SN_H); n++; }
    while (n < 500 && sn.krop.some(function (d) { return d.x === x && d.y === y; }));
    sn.mad = { x: x, y: y, guld: Math.random() < 0.12 };      // en sjælden guldstjerne giver 3 point
  }
  const SN_RET = { op: { x: 0, y: -1 }, ned: { x: 0, y: 1 }, venstre: { x: -1, y: 0 }, hoejre: { x: 1, y: 0 } };
  function styrSnake(hvor) {
    if (!sn) return;
    if (!snakeKoerer) { if (!sn.slut) startSnake(); else return; }
    const r = SN_RET[hvor];
    const sidste = sn.naeste.length ? sn.naeste[sn.naeste.length - 1] : sn.ret;
    if (!r || (r.x === -sidste.x && r.y === -sidste.y) || (r.x === sidste.x && r.y === sidste.y)) return;
    if (sn.naeste.length < 3) sn.naeste.push(r);
  }
  function startSnake() {
    if (snakeKoerer || ind.bat <= 0) return;
    if (!sn || sn.slut) nytSnakeSpil();
    snakeKoerer = true;
    snOverlay(null);
    sn.sidst = performance.now();
    requestAnimationFrame(snakeLoop);
  }
  function stopSnake() { snakeKoerer = false; }
  function snakeLoop(t) {
    if (!snakeKoerer) return;
    if (!appEl || appNu !== "snake" || tlf.hidden) { snakeKoerer = false; return; }
    if (t - sn.sidst >= sn.fart) { sn.sidst = t; snakeTrin(); }
    if (snakeKoerer) requestAnimationFrame(snakeLoop);
  }
  function snakeTrin() {
    if (sn.naeste.length) sn.ret = sn.naeste.shift();
    const h = sn.krop[0], ny = { x: h.x + sn.ret.x, y: h.y + sn.ret.y };
    const spiser = ny.x === sn.mad.x && ny.y === sn.mad.y;
    const krop = spiser ? sn.krop : sn.krop.slice(0, -1);
    if (ny.x < 0 || ny.y < 0 || ny.x >= SN_B || ny.y >= SN_H || krop.some(function (d) { return d.x === ny.x && d.y === ny.y; })) { snakeSlut(); return; }
    sn.krop.unshift(ny);
    if (spiser) {
      sn.point += sn.mad.guld ? 3 : 1;
      sn.fart = Math.max(70, 150 - sn.point * 3);
      appEl.querySelector(".sn-point").textContent = sn.point;
      if (ind.lyd) snLyd(sn.mad.guld ? 1568 : 1046, 0.07);
      nyMad();
    } else sn.krop.pop();
    tegnBraet();
  }
  function snLyd(f, l) {
    try {
      lydKontekst = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
      const o = lydKontekst.createOscillator(), g = lydKontekst.createGain(), nu = lydKontekst.currentTime;
      o.type = "square"; o.frequency.value = f;
      g.gain.setValueAtTime(0.04, nu); g.gain.exponentialRampToValueAtTime(0.0001, nu + l + 0.08);
      o.connect(g); g.connect(lydKontekst.destination); o.start(nu); o.stop(nu + l + 0.1);
    } catch (e) {}
  }
  function snakeSlut() {
    snakeKoerer = false;
    sn.slut = true;
    if (ind.lyd) { snLyd(330, 0.12); setTimeout(function () { snLyd(220, 0.2); }, 140); }
    tegnBraet(true);
    // Glimt: 1 for hvert andet point, højst 25 pr. spil og 100 pr. dag
    const r = snRekord();
    if (r.dag !== snIdag()) { r.dag = snIdag(); r.faaetIdag = 0; }
    let glimtNu = Math.min(SN_MAKS_SPIL, Math.floor(sn.point / 2), SN_MAKS_DAG - (r.faaetIdag || 0));
    glimtNu = Math.max(0, glimtNu);
    if (glimtNu && typeof faaGlimt === "function") { faaGlimt(glimtNu); r.faaetIdag = (r.faaetIdag || 0) + glimtNu; }
    const nyRekord = sn.point > (r.bedst || 0);
    if (nyRekord) r.bedst = sn.point;
    snGemRekord(r);
    appEl.querySelector(".sn-rek").textContent = r.bedst || 0;
    if (sn.point > 0) sendSnakePoint(sn.point);
    snOverlay("slut", { point: sn.point, glimt: glimtNu, rekord: nyRekord, loft: (r.faaetIdag || 0) >= SN_MAKS_DAG });
  }
  function snOverlay(hvad, info) {
    const o = appEl && appEl.querySelector(".sn-over");
    if (!o) return;
    if (!hvad) { o.hidden = true; return; }
    o.hidden = false;
    if (hvad === "start") o.innerHTML = "<b>🐍 Snake</b><span>Saml Glimt-stjerner ⭐<br>Styr med piletasterne,<br>knapperne eller stryg</span><button data-snstart>Start</button>";
    else o.innerHTML = "<b>" + (info.rekord ? "🏆 Ny rekord!" : "Game over") + "</b><span>" + info.point + " point" +
      (info.glimt ? "<br>+" + info.glimt + " Glimt ⭐" : info.loft ? "<br>Du har fået alle dagens Glimt" : "") + "</span><button data-snstart>Spil igen</button>";
    o.querySelector("[data-snstart]").addEventListener("click", function (e) { e.stopPropagation(); startSnake(); });
  }
  function tegnBraet(doed) {
    const cv = appEl && appEl.querySelector(".sn-braet canvas");
    if (!cv || !sn) return;
    const c = cv.getContext("2d"), f = cv.width / SN_B;
    c.fillStyle = "#14161c"; c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = "#1b1e26";
    for (let y = 0; y < SN_H; y++) for (let x = (y % 2); x < SN_B; x += 2) c.fillRect(x * f, y * f, f, f);
    // maden: en Glimt-stjerne
    const m = sn.mad, puls = 1 + Math.sin(performance.now() / 160) * 0.06;
    if (snStjerne.complete && snStjerne.naturalWidth) {
      c.save(); c.imageSmoothingEnabled = false;
      const s = f * 0.92 * puls * (m.guld ? 1.1 : 1);
      if (m.guld) { c.shadowColor = "#ffd34a"; c.shadowBlur = f * 0.8; }
      c.drawImage(snStjerne, m.x * f + (f - s) / 2, m.y * f + (f - s) / 2, s, s);
      c.restore();
    } else { c.fillStyle = m.guld ? "#ffd34a" : "#ffb02e"; c.beginPath(); c.arc(m.x * f + f / 2, m.y * f + f / 2, f * 0.38, 0, 7); c.fill(); }
    // slangen i telefonens accentfarve
    const F = farveNu(), a = hexRgb(F.a);
    sn.krop.forEach(function (d, i) {
      const lys = 1 - (i / Math.max(1, sn.krop.length)) * 0.45;
      c.fillStyle = doed ? "rgb(120,120,128)" : "rgb(" + a.map(function (v) { return Math.round(v * lys + 40 * (1 - lys)); }).join(",") + ")";
      const ind2 = f * 0.08;
      if (c.roundRect) { c.beginPath(); c.roundRect(d.x * f + ind2, d.y * f + ind2, f - ind2 * 2, f - ind2 * 2, f * (i === 0 ? 0.38 : 0.26)); c.fill(); }
      else c.fillRect(d.x * f + ind2, d.y * f + ind2, f - ind2 * 2, f - ind2 * 2);
    });
    // øjne
    const h = sn.krop[0], r = sn.ret;
    [[-1, 1], [1, 1]].forEach(function (o) {
      const ex = h.x * f + f / 2 + (r.x ? r.x * f * 0.18 : o[0] * f * 0.2) + (r.y ? o[0] * f * 0.2 : 0) * 0;
      const ey = h.y * f + f / 2 + (r.y ? r.y * f * 0.18 : o[0] * f * 0.2);
      const ex2 = r.x ? h.x * f + f / 2 + r.x * f * 0.18 : h.x * f + f / 2 + o[0] * f * 0.2;
      c.fillStyle = "#fff"; c.beginPath(); c.arc(ex2, ey, f * 0.13, 0, 7); c.fill();
      c.fillStyle = "#111"; c.beginPath(); c.arc(ex2 + r.x * f * 0.04, ey + r.y * f * 0.04, f * 0.07, 0, 7); c.fill();
    });
  }
  // stjernen blinker, også når spillet står stille
  setInterval(function () { if (!tlf.hidden && appNu === "snake" && !snakeKoerer && snakeVis === "spil" && sn && !sn.slut) tegnBraet(); }, 120);

  // Piletasterne styrer slangen, mens Snake er åben
  window.addEventListener("keydown", function (e) {
    if (tlf.hidden || appNu !== "snake" || snakeVis !== "spil") return;
    if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
    const k = { ArrowUp: "op", ArrowDown: "ned", ArrowLeft: "venstre", ArrowRight: "hoejre", w: "op", s: "ned", a: "venstre", d: "hoejre" }[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); styrSnake(k); return; }
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (!snakeKoerer) startSnake(); }
  }, true);

  // ---- Topliste over hotellets bedste (database-36-snake.sql), ellers kun dine egne ----
  function sendSnakePoint(point) {
    if (typeof serverKald !== "function" || typeof mitToken !== "function" || !mitToken()) return;
    serverKald("hv_snake_gem", { p_token: mitToken(), p_point: point }).then(function () { snakeTop = null; }).catch(function () {});
  }
  function hentSnakeTop() {
    if (typeof serverKald !== "function" || typeof SERVER === "undefined" || !SERVER.til) return Promise.reject(new Error("ingen server"));
    return serverKald("hv_snake_top", {});
  }
  function visSnakeSpil() {
    snakeVis = "spil";
    appEl.querySelector(".sn-toplisten").hidden = true;
    ["sn-tal", "sn-braet", "sn-pile"].forEach(function (k) { appEl.querySelector("." + k).hidden = false; });
  }
  function visTopliste() {
    stopSnake();
    if (sn && !sn.slut) snOverlay("start");
    snakeVis = "top";
    ["sn-tal", "sn-braet", "sn-pile"].forEach(function (k) { appEl.querySelector("." + k).hidden = true; });
    const boks = appEl.querySelector(".sn-toplisten");
    boks.hidden = false;
    const r = snRekord();
    boks.innerHTML = "<div class='tlf-faner'><button data-snf='hotel'>🏨 Hotellet</button><button data-snf='mig'>🙋 Mig</button></div><ul class='tlf-liste'></ul>" +
      "<p class='sn-regel'>Du får 1 Glimt for hvert andet point (højst " + SN_MAKS_SPIL + " pr. spil og " + SN_MAKS_DAG + " om dagen).</p>";
    boks.querySelectorAll("[data-snf]").forEach(function (b) {
      b.classList.toggle("valgt", b.dataset.snf === snakeTopFane);
      b.addEventListener("click", function () { snakeTopFane = b.dataset.snf; visTopliste(); });
    });
    const ul = boks.querySelector("ul");
    if (snakeTopFane === "mig") {
      ul.innerHTML = "<li style='cursor:default'>" + avatarHtml(mig()) + "<span class='info'><b>" + esc(mig()) + "</b><span>Din rekord</span></span><span class='sn-pt'>" + (r.bedst || 0) + "</span></li>" +
        "<li style='cursor:default'><span class='info'><b>Glimt i dag</b><span>Fra Snake</span></span><span class='sn-pt'>" + (r.dag === snIdag() ? r.faaetIdag || 0 : 0) + " / " + SN_MAKS_DAG + "</span></li>";
      tegnAvatarer(ul);
      return;
    }
    ul.innerHTML = "<li class='tlf-tom' style='cursor:default'><span>Henter toplisten …</span></li>";
    hentSnakeTop().then(function (liste) {
      if (snakeVis !== "top" || snakeTopFane !== "hotel" || !appEl) return;
      liste = Array.isArray(liste) ? liste : [];
      ul.innerHTML = liste.length ? liste.map(function (x, i) {
        const medalje = ["🥇", "🥈", "🥉"][i] || (i + 1) + ".";
        return "<li style='cursor:default'" + (x.navn === mig() ? " class='sn-mig'" : "") + "><span class='sn-plads'>" + medalje + "</span>" + avatarHtml(x.navn, true) +
          "<span class='info'><b>" + esc(x.navn) + "</b></span><span class='sn-pt'>" + x.point + "</span></li>";
      }).join("") : "<li class='tlf-tom' style='cursor:default'><span><span class='st'>🏆</span>Ingen har spillet endnu. Bliv den første!</span></li>";
      tegnAvatarer(ul);
    }).catch(function () {
      if (!appEl || snakeVis !== "top") return;
      ul.innerHTML = "<li class='tlf-tom' style='cursor:default'><span><span class='st'>🏆</span>Hotellets topliste virker, når database-36-snake.sql er kørt i Supabase.<br>Din rekord: <b>" + (r.bedst || 0) + "</b></span></li>";
    });
  }

  // ---------------------------------------------------------------
  //  🐤 Peep — hotellets eget sociale netværk (database-37-peep.sql)
  //  Feed med opslag, ❤️ likes, 💬 kommentarer, profiler og notifikationer.
  //  Uden databasen virker Peep kun på denne computer.
  // ---------------------------------------------------------------
  const PEEP_FARVER = {
    solnedgang: "linear-gradient(135deg, #ff9a6b, #c94b7d)", hav: "linear-gradient(135deg, #4fc3f7, #3a5fd6)",
    skov: "linear-gradient(135deg, #7dd87a, #2f8a5a)", lilla: "linear-gradient(135deg, #c79bff, #6a3fd0)",
    guld: "linear-gradient(135deg, #ffe08a, #e0a12c)", nat: "linear-gradient(135deg, #3a3f6b, #12142a)",
  };
  const PEEP_HUMOER = ["😊 glad", "🥳 fejrer", "😍 forelsket", "😎 cool", "😴 træt", "🤩 spændt", "😢 trist", "🏨 på hotellet"];
  let peepData = [], peepLokal = false, peepFane = "feed", peepProfil = null, peepAaben = {}, peepSkriver = null, peepHentet = 0, peepFejl = "";
  let peepProfilInfo = {};
  function peepRens(t) {
    t = String(t || "");
    try { if (typeof lavSmileyer === "function") t = lavSmileyer(t); } catch (e) {}
    try { if (typeof rensTekst === "function") t = rensTekst(t); } catch (e) {}
    return t.trim();
  }
  function peepOnline() { return typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function peepMaaSlette(navn) {
    if (navn === mig() || erEjer()) return true;
    try { return typeof minRolle === "function" && minRolle() === "mod"; } catch (e) { return false; }
  }
  function peepSiden(t) {
    const s = (Date.now() - new Date(t).getTime()) / 1000;
    if (s < 60) return "lige nu";
    if (s < 3600) return Math.floor(s / 60) + " min";
    if (s < 86400) return Math.floor(s / 3600) + " t";
    if (s < 604800) return Math.floor(s / 86400) + " d";
    const d = new Date(t); return d.getDate() + ". " + MDR[d.getMonth()].slice(0, 3);
  }
  // ----- lokal reserve (kun denne computer) -----
  function peepLokalHent() { try { return JSON.parse(localStorage.getItem("mit-hotel-peep") || "[]"); } catch (e) { return []; } }
  function peepLokalGem(l) { try { localStorage.setItem("mit-hotel-peep", JSON.stringify(l.slice(0, 60))); } catch (e) {} }
  function peepMangler(e) { return /function|schema cache|does not exist|Could not find/i.test(e && e.message || ""); }

  function peepKald(fn, data, lokal) {
    if (!peepLokal && peepOnline()) {
      return serverKald(fn, data).catch(function (e) {
        if (peepMangler(e)) { peepLokal = true; return lokal(); }
        throw e;
      });
    }
    peepLokal = true;
    return Promise.resolve().then(lokal);
  }
  function peepHent() {
    return peepKald("hv_peep_hent", { p_navn: null }, function () { return peepLokalHent(); }).then(function (l) {
      peepData = Array.isArray(l) ? l : [];
      peepHentet = Date.now();
      peepFejl = "";
      opdaterPeepTal();
      if (appNu === "peep" && !peepSkriver) tegnPeepIndhold();
    }).catch(function (e) { peepFejl = e.message; if (appNu === "peep") tegnPeepIndhold(); });
  }
  function peepSend(tekst, stil) {
    return peepKald("hv_peep_send", { p_token: mitToken && mitToken(), p_tekst: tekst, p_stil: stil }, function () {
      const l = peepLokalHent();
      l.unshift({ id: Date.now(), navn: mig(), tekst: tekst, stil: stil, tid: new Date().toISOString(), likes: [], kommentarer: [] });
      peepLokalGem(l);
    }).then(peepHent);
  }
  function peepLike(id) {
    const o = peepData.find(function (x) { return x.id === id; });
    if (o) {   // vis det med det samme
      const i = o.likes.indexOf(mig());
      if (i >= 0) o.likes.splice(i, 1); else o.likes.push(mig());
      tegnPeepIndhold();
      if (i < 0 && ind.lyd) snLyd(1318, 0.05);
    }
    return peepKald("hv_peep_like", { p_token: mitToken && mitToken(), p_id: id }, function () {
      const l = peepLokalHent(), x = l.find(function (y) { return y.id === id; });
      if (x) { const i = x.likes.indexOf(mig()); if (i >= 0) x.likes.splice(i, 1); else x.likes.push(mig()); peepLokalGem(l); }
    }).then(peepHent).catch(function (e) { lille(e.message); peepHent(); });
  }
  function peepKommenter(id, tekst) {
    return peepKald("hv_peep_kommenter", { p_token: mitToken && mitToken(), p_id: id, p_tekst: tekst }, function () {
      const l = peepLokalHent(), x = l.find(function (y) { return y.id === id; });
      if (x) { x.kommentarer.push({ id: Date.now(), navn: mig(), tekst: tekst, tid: new Date().toISOString() }); peepLokalGem(l); }
    }).then(peepHent).catch(function (e) { lille(e.message); });
  }
  function peepSlet(id, kommentar, opslagId) {
    return peepKald("hv_peep_slet", { p_token: mitToken && mitToken(), p_id: id, p_kommentar: !!kommentar }, function () {
      let l = peepLokalHent();
      if (kommentar) { const x = l.find(function (y) { return y.id === opslagId; }); if (x) x.kommentarer = x.kommentarer.filter(function (k) { return k.id !== id; }); }
      else l = l.filter(function (y) { return y.id !== id; });
      peepLokalGem(l);
    }).then(peepHent).catch(function (e) { lille(e.message); });
  }
  function peepHentProfil(navn) {
    if (peepLokal || !peepOnline()) {
      let bio = ""; try { bio = localStorage.getItem("mit-hotel-peep-bio-" + navn) || ""; } catch (e) {}
      peepProfilInfo[navn] = { bio: bio }; return Promise.resolve();
    }
    return Promise.all([serverKald("hv_peep_profil_hent", { p_navn: navn }), serverKald("hv_peep_hent", { p_navn: navn })]).then(function (r) {
      peepProfilInfo[navn] = r[0] || {};
      (Array.isArray(r[1]) ? r[1] : []).forEach(function (o) { if (!peepData.some(function (x) { return x.id === o.id; })) peepData.push(o); });
    }).catch(function () { peepProfilInfo[navn] = peepProfilInfo[navn] || { bio: "" }; });
  }
  function peepGemBio(bio) {
    return peepKald("hv_peep_bio", { p_token: mitToken && mitToken(), p_bio: bio }, function () {
      try { localStorage.setItem("mit-hotel-peep-bio-" + mig(), bio); } catch (e) {}
    }).then(function () { peepProfilInfo[mig()] = Object.assign(peepProfilInfo[mig()] || {}, { bio: bio }); });
  }

  // ----- notifikationer: likes og kommentarer fra andre på dine opslag -----
  function peepNotiser() {
    const ud = [];
    peepData.forEach(function (o) {
      if (o.navn !== mig()) return;
      (o.likes || []).forEach(function (n) { if (n !== mig()) ud.push({ noegle: o.id + ":L:" + n, navn: n, hvad: "synes godt om dit opslag", o: o, tid: null }); });
      (o.kommentarer || []).forEach(function (k) { if (k.navn !== mig()) ud.push({ noegle: o.id + ":K:" + k.id, navn: k.navn, hvad: "kommenterede: " + k.tekst, o: o, tid: k.tid }); });
    });
    return ud;
  }
  function peepSete() { try { return JSON.parse(localStorage.getItem("mit-hotel-peep-set-" + mig()) || "[]"); } catch (e) { return []; } }
  function peepNye() { const s = peepSete(); return peepNotiser().filter(function (n) { return s.indexOf(n.noegle) < 0; }); }
  function peepMarkerSet() {
    const alle = peepNotiser().map(function (n) { return n.noegle; });
    try { localStorage.setItem("mit-hotel-peep-set-" + mig(), JSON.stringify(alle.slice(-500))); } catch (e) {}
    opdaterPeepTal();
  }
  let peepSidsteTal = -1;
  function opdaterPeepTal() {
    const n = peepNye().length;
    if (peepSidsteTal >= 0 && n > peepSidsteTal) {
      const ny = peepNye()[0];
      if (ny && !(appNu === "peep" && peepFane === "notis")) {
        ding();
        if (!tlf.hidden && skaermNu !== "laas") {
          bannerEl.innerHTML = "<div class='tlf-notis' data-notis='peep'><span class='ai' style='background:" + APPS.peep.bg + "'>" + ik("peep") + "</span><span class='nt'><b>Peep<small>nu</small></b><span>" +
            esc(ny.navn + " " + ny.hvad) + "</span></span></div>";
          bannerEl.classList.add("vis"); clearTimeout(visBanner.t); visBanner.t = setTimeout(skjulBanner, 4200);
        }
      }
    }
    peepSidsteTal = n;
    if (skaermNu === "hjem" && !tlf.hidden && !redigerer) {
      const k = hjemEl.querySelector("[data-app=peep]");
      if (k) { const gl = k.querySelector(".tal"); if (gl) gl.remove(); if (n) k.insertAdjacentHTML("beforeend", "<span class='tal'>" + n + "</span>"); }
    }
    if (appEl && appNu === "peep") { const t = appEl.querySelector(".pp-notis-tal"); if (t) { t.textContent = n; t.hidden = !n; } }
  }
  setInterval(function () {
    const aaben = !tlf.hidden && appNu === "peep";
    if (aaben || (peepOnline() && Date.now() - peepHentet > 45000)) peepHent();
  }, 8000);
  setTimeout(peepHent, 4000);

  // ----- tegning -----
  function tegnPeep() {
    peepFane = "feed"; peepProfil = null; peepSkriver = null;
    appEl.innerHTML =
      "<div class='tlf-top pp-top'><button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + ik("tilbage", 20) + "</button>" +
      "<span class='pp-logo'>" + ik("peep", 24).replace(/fill='#fff'/g, "fill='currentColor'") + "peep</span>" +
      "<button class='tlf-tb' data-ppny title='Nyt opslag'>" + ik("skriv", 20) + "</button></div>" +
      "<div class='pp-indhold'></div>" +
      "<div class='pp-faner'><button data-ppf='feed'>🏠<small>Feed</small></button><button data-ppf='notis'>🔔<i class='pp-notis-tal' hidden></i><small>Notifikationer</small></button><button data-ppf='mig'>👤<small>Mig</small></button></div>";
    appEl.addEventListener("click", peepKlik);
    appEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.matches(".pp-kom-felt")) { e.preventDefault(); sendKom(e.target); }
    });
    tegnPeepIndhold();
    peepHent();
  }
  function sendKom(felt) {
    const t = peepRens(felt.value);
    if (!t) return;
    felt.value = "";
    peepKommenter(+felt.dataset.ppkom, t);
  }
  function peepKortHtml(o) {
    const st = o.stil || {}, farve = PEEP_FARVER[st.farve];
    const likes = o.likes || [], kom = o.kommentarer || [], liker = likes.indexOf(mig()) >= 0;
    const aaben = !!peepAaben[o.id];
    const visKom = aaben ? kom : kom.slice(-2);
    return "<div class='pp-kort' data-ppid='" + o.id + "'>" +
      "<div class='pp-hoved'>" + avatarHtml(o.navn) + "<span class='pp-hvem'><b data-pprofil='" + esc(o.navn) + "'>" + esc(o.navn) + "</b>" +
        "<small>" + peepSiden(o.tid) + (st.humoer ? " · føler sig " + esc(st.humoer) : "") + "</small></span>" +
        (peepMaaSlette(o.navn) ? "<button class='pp-slet' data-ppslet='" + o.id + "' title='Slet opslag'>⋯</button>" : "") + "</div>" +
      (farve ? "<div class='pp-farvet' style='background:" + farve + "'>" + esc(o.tekst) + "</div>" : "<div class='pp-tekst'>" + esc(o.tekst) + "</div>") +
      ((likes.length || kom.length) ? "<div class='pp-stat'><span>" + (likes.length ? "<i class='pp-hjerte'>❤</i> " + (liker ? (likes.length > 1 ? "Dig og " + (likes.length - 1) + " andre" : "Dig") : likes.length) : "") + "</span>" +
        "<span data-ppvis='" + o.id + "'>" + (kom.length ? kom.length + (kom.length === 1 ? " kommentar" : " kommentarer") : "") + "</span></div>" : "") +
      "<div class='pp-knapper'><button data-pplike='" + o.id + "' class='" + (liker ? "liker" : "") + "'>" + (liker ? "❤️" : "🤍") + " Synes godt om</button>" +
        "<button data-ppkomknap='" + o.id + "'>💬 Kommentér</button></div>" +
      (visKom.length || aaben ? "<div class='pp-kommentarer'>" +
        (kom.length > visKom.length ? "<button class='pp-flere' data-ppvis='" + o.id + "'>Se alle " + kom.length + " kommentarer</button>" : "") +
        visKom.map(function (k) {
          return "<div class='pp-kom'>" + avatarHtml(k.navn, true) + "<div><span class='pp-boble'><b data-pprofil='" + esc(k.navn) + "'>" + esc(k.navn) + "</b>" + esc(k.tekst) + "</span>" +
            "<small>" + peepSiden(k.tid) + (peepMaaSlette(k.navn) ? " · <button data-ppkslet='" + k.id + "' data-ppo='" + o.id + "'>Slet</button>" : "") + "</small></div></div>";
        }).join("") +
        (aaben ? "<div class='pp-skriv-kom'>" + avatarHtml(mig(), true) + "<input class='pp-kom-felt' data-ppkom='" + o.id + "' maxlength='200' placeholder='Skriv en kommentar …'></div>" : "") +
      "</div>" : "") +
    "</div>";
  }
  function peepLokalNote() {
    if (peepFejl) return "<div class='pp-note'>⚠️ " + esc(peepFejl) + "</div>";
    return peepLokal ? "<div class='pp-note'>🐤 Peep virker kun på denne computer, indtil database-37-peep.sql er kørt i Supabase.</div>" : "";
  }
  function tegnPeepIndhold() {
    if (!appEl || appNu !== "peep" || peepSkriver) return;
    const boks = appEl.querySelector(".pp-indhold");
    if (!boks) return;
    // husk hvad man er i gang med at skrive og hvor man er
    const fokus = document.activeElement && document.activeElement.matches && document.activeElement.matches(".pp-kom-felt") ? { id: document.activeElement.dataset.ppkom, v: document.activeElement.value } : null;
    const y = boks.scrollTop;
    appEl.querySelectorAll("[data-ppf]").forEach(function (b) { b.classList.toggle("valgt", b.dataset.ppf === (peepProfil && peepProfil !== mig() ? "" : peepFane)); });
    let html = peepLokalNote();
    if (peepFane === "feed" && !peepProfil) {
      html += "<div class='pp-skriv' data-ppny>" + avatarHtml(mig()) + "<span>Hvad sker der, " + esc(mig()) + "?</span></div>";
      html += peepData.length ? peepData.slice().sort(function (a, b) { return new Date(b.tid) - new Date(a.tid); }).map(peepKortHtml).join("")
        : "<div class='tlf-tom'><span class='st'>🐤</span>Ingen har peepet endnu.<br>Skriv det første opslag!</div>";
    } else if (peepFane === "notis" && !peepProfil) {
      const sete = peepSete(), liste = peepNotiser().reverse();
      html += "<div class='pp-overskrift'>Notifikationer</div>" + (liste.length ? "<ul class='tlf-liste pp-notiser'>" + liste.slice(0, 40).map(function (n) {
        return "<li data-ppgaa='" + n.o.id + "' class='" + (sete.indexOf(n.noegle) < 0 ? "ny" : "") + "'>" + avatarHtml(n.navn) + "<span class='info'><b>" + esc(n.navn) + "</b><span>" + esc(n.hvad) + "</span></span>" +
          "<span class='pp-mini'>" + esc(n.o.tekst.slice(0, 18)) + "</span></li>";
      }).join("") + "</ul>" : "<div class='tlf-tom'><span class='st'>🔔</span>Ingen notifikationer endnu.</div>");
      setTimeout(peepMarkerSet, 1500);
    } else {
      const navn = peepProfil || mig(), info = peepProfilInfo[navn] || {};
      const mine = peepData.filter(function (o) { return o.navn === navn; }).sort(function (a, b) { return new Date(b.tid) - new Date(a.tid); });
      const likes = mine.reduce(function (s, o) { return s + (o.likes || []).length; }, 0);
      const gaest = (typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[navn]) || (typeof HAL_GAESTER !== "undefined" && HAL_GAESTER.find(function (g) { return g.navn === navn; }));
      const ven = vennerListe().indexOf(navn) >= 0;
      html += "<div class='pp-profil'><div class='pp-cover'></div>" + avatarHtml(navn) + "<h2>" + esc(navn) + "</h2>" +
        (navn === mig() ? "<div class='pp-bio' data-ppbio>" + (info.bio ? esc(info.bio) : "<i>✏️ Skriv lidt om dig selv …</i>") + "</div>" : (info.bio ? "<div class='pp-bio'>" + esc(info.bio) + "</div>" : "")) +
        "<div class='pp-tal'><span><b>" + mine.length + "</b>opslag</span><span><b>" + likes + "</b>❤ fået</span>" + (navn === mig() ? "<span><b>" + vennerListe().length + "</b>venner</span>" : "") + "</div>" +
        (navn !== mig() ? "<div class='pp-profil-knapper'>" +
          (ven ? "<button disabled>💚 Venner</button>" : gaest ? "<button data-ppven='" + esc(navn) + "'>➕ Tilføj ven</button>" : "") +
          "<button data-ppbesked='" + esc(navn) + "'>💬 Skriv</button>" + (ven && kanFoelge(navn) ? "<button data-ppfoelg='" + esc(navn) + "'>➡ Følg</button>" : "") + "</div>" : "") +
        "</div>" + (mine.length ? mine.map(peepKortHtml).join("") : "<div class='tlf-tom'>" + (navn === mig() ? "Du har ikke peepet endnu." : esc(navn) + " har ikke peepet endnu.") + "</div>");
    }
    boks.innerHTML = html;
    tegnAvatarer(boks);
    boks.scrollTop = y;
    if (fokus) {
      const f = boks.querySelector(".pp-kom-felt[data-ppkom='" + fokus.id + "']");
      if (f) { f.value = fokus.v; f.focus(); }
    }
  }
  function visPeepProfil(navn) {
    peepProfil = navn === mig() ? null : navn;
    peepFane = navn === mig() ? "mig" : "profil";
    tegnPeepIndhold();
    const b = appEl.querySelector(".pp-indhold"); if (b) b.scrollTop = 0;
    peepHentProfil(navn).then(tegnPeepIndhold);
  }
  function tegnPeepSkriv() {
    peepSkriver = { farve: "", humoer: "" };
    const boks = appEl.querySelector(".pp-indhold");
    boks.innerHTML = "<div class='pp-ny'>" +
      "<div class='pp-ny-top'>" + avatarHtml(mig()) + "<span><b>" + esc(mig()) + "</b><small class='pp-ny-humoer'></small></span></div>" +
      "<textarea maxlength='400' placeholder='Hvad sker der, " + esc(mig()) + "?'></textarea>" +
      "<div class='pp-ny-lbl'>Baggrund</div><div class='pp-ny-farver'><button data-ppfarve='' class='valgt' title='Ingen'>Aa</button>" +
        Object.keys(PEEP_FARVER).map(function (k) { return "<button data-ppfarve='" + k + "' style='background:" + PEEP_FARVER[k] + "'></button>"; }).join("") + "</div>" +
      "<div class='pp-ny-lbl'>Hvordan har du det?</div><div class='pp-ny-humoer-valg'>" +
        PEEP_HUMOER.map(function (h) { return "<button data-pphum='" + h + "'>" + h + "</button>"; }).join("") + "</div>" +
      "<div class='pp-ny-knapper'><button data-ppannuller>Annullér</button><button data-ppsend class='send'>🐤 Peep!</button></div></div>";
    tegnAvatarer(boks);
    const t = boks.querySelector("textarea");
    t.addEventListener("keydown", function (e) { e.stopPropagation(); });
    setTimeout(function () { t.focus(); }, 50);
  }
  function peepKlik(e) {
    const t = e.target;
    const g = function (s) { return t.closest(s); };
    let k;
    if (g("[data-ppny]")) { tegnPeepSkriv(); return; }
    if ((k = g("[data-ppf]"))) { peepSkriver = null; peepProfil = null; peepFane = k.dataset.ppf; if (peepFane === "mig") { visPeepProfil(mig()); return; } tegnPeepIndhold(); appEl.querySelector(".pp-indhold").scrollTop = 0; return; }
    if ((k = g("[data-pplike]"))) { peepLike(+k.dataset.pplike); return; }
    if ((k = g("[data-ppkomknap]"))) {
      peepAaben[k.dataset.ppkomknap] = true; tegnPeepIndhold();
      const f = appEl.querySelector(".pp-kom-felt[data-ppkom='" + k.dataset.ppkomknap + "']"); if (f) f.focus();
      return;
    }
    if ((k = g("[data-ppvis]"))) { peepAaben[k.dataset.ppvis] = !peepAaben[k.dataset.ppvis] || t.classList.contains("pp-flere"); tegnPeepIndhold(); return; }
    if ((k = g("[data-pprofil]"))) { visPeepProfil(k.dataset.pprofil); return; }
    if ((k = g(".pp-hoved [data-av], .pp-kom [data-av]"))) { visPeepProfil(k.dataset.av); return; }
    if ((k = g("[data-ppslet]"))) {
      if (k.classList.contains("sikker")) { peepSlet(+k.dataset.ppslet); return; }
      k.classList.add("sikker"); k.textContent = "Slet?"; setTimeout(function () { if (k.isConnected) { k.classList.remove("sikker"); k.textContent = "⋯"; } }, 3000); return;
    }
    if ((k = g("[data-ppkslet]"))) { peepSlet(+k.dataset.ppkslet, true, +k.dataset.ppo); return; }
    if ((k = g("[data-ppgaa]"))) { peepFane = "feed"; peepAaben[k.dataset.ppgaa] = true; tegnPeepIndhold(); const kort = appEl.querySelector(".pp-kort[data-ppid='" + k.dataset.ppgaa + "']"); if (kort) kort.scrollIntoView({ block: "start" }); return; }
    if ((k = g("[data-ppven]"))) {
      const n = k.dataset.ppven;
      const gaest = (typeof ANDRE_SPILLERE !== "undefined" && ANDRE_SPILLERE[n]) || (typeof HAL_GAESTER !== "undefined" && HAL_GAESTER.find(function (x) { return x.navn === n; }));
      if (gaest && typeof tilfoejVen === "function") { try { tilfoejVen(gaest); } catch (er) {} lille("📨 Venneanmodning sendt"); k.disabled = true; }
      return;
    }
    if ((k = g("[data-ppbesked]"))) { aabnApp("beskeder", k.dataset.ppbesked); return; }
    if ((k = g("[data-ppfoelg]"))) { foelgVen(k.dataset.ppfoelg); return; }
    if (g("[data-ppbio]")) {
      const bioEl = g("[data-ppbio]");
      const gl = (peepProfilInfo[mig()] || {}).bio || "";
      bioEl.outerHTML = "<div class='pp-bio-ret'><input maxlength='150' value='" + esc(gl) + "' placeholder='Skriv lidt om dig selv …'><button data-ppbiogem>Gem</button></div>";
      const inp = appEl.querySelector(".pp-bio-ret input"); inp.focus();
      inp.addEventListener("keydown", function (ev) { ev.stopPropagation(); if (ev.key === "Enter") appEl.querySelector("[data-ppbiogem]").click(); });
      return;
    }
    if (g("[data-ppbiogem]")) { const v = peepRens(appEl.querySelector(".pp-bio-ret input").value); peepGemBio(v).then(tegnPeepIndhold).catch(function (er) { lille(er.message); }); return; }
    // skriv nyt opslag
    if (peepSkriver) {
      if ((k = g("[data-ppfarve]"))) {
        peepSkriver.farve = k.dataset.ppfarve;
        appEl.querySelectorAll("[data-ppfarve]").forEach(function (b) { b.classList.toggle("valgt", b === k); });
        const ta = appEl.querySelector(".pp-ny textarea");
        ta.style.background = PEEP_FARVER[peepSkriver.farve] || ""; ta.classList.toggle("farvet", !!peepSkriver.farve);
        return;
      }
      if ((k = g("[data-pphum]"))) {
        peepSkriver.humoer = peepSkriver.humoer === k.dataset.pphum ? "" : k.dataset.pphum;
        appEl.querySelectorAll("[data-pphum]").forEach(function (b) { b.classList.toggle("valgt", b.dataset.pphum === peepSkriver.humoer); });
        appEl.querySelector(".pp-ny-humoer").textContent = peepSkriver.humoer ? "føler sig " + peepSkriver.humoer : "";
        return;
      }
      if (g("[data-ppannuller]")) { peepSkriver = null; tegnPeepIndhold(); return; }
      if ((k = g("[data-ppsend]"))) {
        const tekst = peepRens(appEl.querySelector(".pp-ny textarea").value);
        if (!tekst) { lille("Skriv noget først"); return; }
        k.disabled = true;
        const stil = { farve: peepSkriver.farve, humoer: peepSkriver.humoer };
        peepSend(tekst, stil).then(function () { peepSkriver = null; peepFane = "feed"; peepProfil = null; tegnPeepIndhold(); appEl.querySelector(".pp-indhold").scrollTop = 0; lille("🐤 Peepet!"); })
          .catch(function (er) { k.disabled = false; lille(er.message); });
        return;
      }
    }
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
      "<div class='tlf-gruppe-navn'>Farve på knapper og menuer</div>" +
      "<div class='tlf-gruppe'><div class='tlf-farver'>" + KNAP_FARVER.map(function (k) {
        return "<button data-acc='" + k.id + "' title='" + k.navn + "' class='" + ((ind.acc || "") === k.id ? "valgt" : "") + "' style='background:" + (k.f || "linear-gradient(135deg," + F.k[0] + "," + F.a + ")") + "'>" + (k.f ? "" : "<small class='acc-som'>📱</small>") + "</button>";
      }).join("") + "</div></div>" +
      "<div class='tlf-gruppe-navn'>Baggrundsfarve i apps</div>" +
      "<div class='tlf-gruppe'><div class='tlf-farver app-bg'>" + APP_BAGGRUNDE.map(function (k) {
        return "<button data-appbg='" + k.id + "' title='" + k.navn + "' class='" + ((ind.appbg || "") === k.id ? "valgt" : "") + "' style='background:" + k.lys + "'></button>";
      }).join("") + "</div></div>" +
      "<div class='tlf-gruppe-navn'>Baggrund</div>" +
      "<div class='tlf-gruppe'><div class='tlf-bgs'>" + BAGGRUNDE.map(function (b) {
        return "<button data-bg='" + b.id + "' class='" + (b.id === ind.baggrund ? "valgt" : "") + "' style='background-image:" + b.b.replace(/'/g, "&#39;") + "'><span>" + b.navn + "</span></button>";
      }).join("") +
      (ind.eget ? "<button data-bg='eget' class='" + (ind.baggrund === "eget" ? "valgt" : "") + "' style='background-image:url(\"" + ind.eget + "\")'><span>Mit billede</span></button>" : "") +
      "<button class='eget' data-upload title='Brug dit eget billede'>＋</button>" +
      "</div></div>" +
      "<div class='tlf-gruppe-navn'>Widgets på hjemmeskærmen</div>" +
      "<div class='tlf-gruppe'>" +
        "<div class='tlf-raekke'><span>Du har " + mineWidgets().length + " widget" + (mineWidgets().length === 1 ? "" : "s") + "</span><button class='lnk' data-wred>Rediger</button></div>" +
        "<div class='tlf-raekke'><small>Tip: hold musen nede på hjemmeskærmen for at tilføje, fjerne og flytte widgets.</small></div>" +
      "</div>" +
      "<div class='tlf-gruppe-navn'>Batteri</div>" +
      "<div class='tlf-gruppe'>" +
        "<div class='tlf-raekke'><span>🔋 Strøm</span><small>" + Math.round(ind.bat) + " %" + (laderNu() ? " · ⚡ oplader" : "") + "</small></div>" +
        (harPowerbank() ? "<div class='tlf-raekke'><span>Powerbank</span><small>" + (ind.pbTil ? "sat til ⚡" : "løber aldrig tør") + "</small><button class='lnk' data-pbbrug>" + (ind.pbTil ? "Tag fra" : "Sæt til") + "</button></div>"
          : "<div class='tlf-raekke'><span>Køb powerbank (løber aldrig tør)</span><button class='lnk' data-pbkoeb>" + PB_PRIS + " Glimt</button></div>") +
        "<div class='tlf-raekke'><small>Lad op: sæt dig ved en 🔌 Ladestation (købes i Shoppen) eller sæt dig i caféen.</small></div>" +
        (erEjer() ? "<div class='tlf-raekke'><span>👑 Fuld opladning</span><button class='lnk' data-fuld>Lad op</button></div>" : "") +
      "</div>" +
      "<div class='tlf-gruppe-navn'>Lyd og lås</div>" +
      "<div class='tlf-gruppe'>" +
        "<div class='tlf-raekke'><span>🔔 Lyd ved nye beskeder</span><button class='tlf-kontakt" + (ind.lyd ? " til" : "") + "' data-slaa='lyd'></button></div>" +
        (harKode() ? "<div class='tlf-raekke'><span>🔒 Låseskærm når den åbnes</span><small>Altid, når du har en kode</small></div>"
          : "<div class='tlf-raekke'><span>🔒 Låseskærm når den åbnes</span><button class='tlf-kontakt" + (ind.laas ? " til" : "") + "' data-slaa='laas'></button></div>") +
        (harKode() ? "<div class='tlf-raekke'><span>🔢 Telefonkode</span><small>●●●●●● · " + (skiftTilbage() === Infinity ? "ejer" : skiftTilbage() + " skift tilbage") + "</small>" +
            (skiftTilbage() > 0 ? "<button class='lnk' data-kodeskift>Skift</button>" : "<small>Spørg ejeren</small>") + "</div>"
          : "<div class='tlf-raekke'><span>🔢 Telefonkode (6 tal)</span><button class='lnk' data-kodeny>Lav kode</button></div>") +
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
      const ac = e.target.closest("[data-acc]");
      if (ac) { ind.acc = ac.dataset.acc; gemInd(); saetFarver(); bevarScroll(tegnIndstillinger); return; }
      const ab = e.target.closest("[data-appbg]");
      if (ab) { ind.appbg = ab.dataset.appbg; gemInd(); saetFarver(); bevarScroll(tegnIndstillinger); return; }
      const b = e.target.closest("[data-bg]");
      if (b) { ind.baggrund = b.dataset.bg; gemInd(); saetFarver(); bevarScroll(tegnIndstillinger); return; }
      if (e.target.closest("[data-upload]")) { inp.click(); return; }
      const s = e.target.closest("[data-slaa]");
      if (s) { ind[s.dataset.slaa] = !ind[s.dataset.slaa]; gemInd(); s.classList.toggle("til", ind[s.dataset.slaa]); return; }
      if (e.target.closest("[data-laasnu]")) sideknap();
      if (e.target.closest("[data-kodeny]")) { visKodeskaerm({ type: "ny", trin: "ny" }); return; }
      if (e.target.closest("[data-kodeskift]")) { hentMinKode().then(function () { if (skiftTilbage() <= 0) { lille("Du har brugt dine 3 skift – spørg ejeren"); bevarScroll(tegnIndstillinger); return; } visKodeskaerm({ type: "skift", trin: "gammel" }); }); return; }
      if (e.target.closest("[data-fuld]")) { saetStroem(100); lille("⚡ Fuldt opladet"); bevarScroll(tegnIndstillinger); }
      if (e.target.closest("[data-pbbrug]")) { brugPowerbank(); bevarScroll(tegnIndstillinger); }
      if (e.target.closest("[data-pbkoeb]")) {
        if (harPowerbank()) lille("Du har allerede en powerbank");
        else if (typeof brugGlimt === "function" && brugGlimt(PB_PRIS)) { ind.powerbanks = 1; gemInd(); lille("🔋 Du har købt en powerbank"); }
        else lille("Du har ikke " + PB_PRIS + " Glimt");
        bevarScroll(tegnIndstillinger);
      }
      if (e.target.closest("[data-wred]")) { lukApp(); redigerer = true; galleriAabent = true; tegnHjem(); tegnGalleri(); }
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
    else if (skaermNu === "hjem" && !wTraek) { if (galleriAabent) return; redigerer ? tegnWidgets() : tegnHjem(); }
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
  // ---------------------------------------------------------------
  //  🔢 Kode til telefonen (database-39-telefonkode.sql)
  //  6 tal, laves i Indstillinger. Kan skiftes højst 3 gange (ejeren
  //  kan give flere skift i Ejerpanelet og se koden, hvis man glemmer den).
  //  Uden databasen gemmes koden kun på denne computer.
  // ---------------------------------------------------------------
  const KODE_MAKS_SKIFT = 3;
  function kodeNoegle() { return "mit-hotel-telefon-kode-" + mig(); }
  let kodeInfo = { har: false, skift: 0 };
  try { kodeInfo = JSON.parse(localStorage.getItem(kodeNoegle()) || "null") || kodeInfo; } catch (e) {}
  let kodeLokal = false;
  function gemKodeInfo(i) { kodeInfo = i; try { localStorage.setItem(kodeNoegle(), JSON.stringify(i)); } catch (e) {} }
  function harKode() { return !!(kodeInfo && kodeInfo.har && kodeInfo.kode); }
  function kodeOnline() { return !kodeLokal && typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function kodeMangler(e) { return /function|schema cache|does not exist|Could not find/i.test(e && e.message || ""); }
  function hentMinKode() {
    if (!kodeOnline()) return Promise.resolve(kodeInfo);
    return serverKald("hv_tlfkode_min", { p_token: mitToken() }).then(function (i) {
      if (i && typeof i.har === "boolean") gemKodeInfo(i);
      return kodeInfo;
    }).catch(function (e) { if (kodeMangler(e)) kodeLokal = true; return kodeInfo; });
  }
  function gemNyKode(gammel, ny) {
    if (kodeOnline()) {
      return serverKald("hv_tlfkode_saet", { p_token: mitToken(), p_gammel: gammel, p_ny: ny }).then(function (i) { gemKodeInfo(i); return i; })
        .catch(function (e) { if (kodeMangler(e)) { kodeLokal = true; return gemNyKode(gammel, ny); } throw e; });
    }
    if (harKode() && gammel !== kodeInfo.kode) return Promise.reject(new Error("Den nuværende kode er forkert."));
    if (harKode() && kodeInfo.skift >= KODE_MAKS_SKIFT && !erEjer()) return Promise.reject(new Error("Du har brugt dine 3 skift. Spørg hotellets ejer om flere."));
    gemKodeInfo({ har: true, kode: ny, skift: harKode() ? kodeInfo.skift + 1 : 0 });
    return Promise.resolve(kodeInfo);
  }
  function skiftTilbage() { return erEjer() ? Infinity : Math.max(0, KODE_MAKS_SKIFT - (kodeInfo.skift || 0)); }
  setTimeout(hentMinKode, 2500);

  // Tastaturet (som på en rigtig telefon)
  let kodeFlow = null;
  function visKodeskaerm(flow) {
    kodeFlow = flow;
    kodeFlow.tal = "";
    let el = skaerm.querySelector(".tlf-kode");
    if (!el) {
      el = document.createElement("div");
      el.className = "tlf-kode";
      el.innerHTML = "<div class='kd-titel'></div><div class='kd-under'></div><div class='kd-prikker'>" + "<i></i>".repeat(6) + "</div>" +
        "<div class='kd-tal'>" + ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(function (t) {
          return t ? "<button data-kd='" + t + "'" + (t === "⌫" ? " class='slet'" : "") + ">" + t + "</button>" : "<span></span>";
        }).join("") + "</div>" +
        "<div class='kd-bund'><button data-kdannuller>Annullér</button><button data-kdglemt>Glemt kode?</button></div>";
      skaerm.insertBefore(el, bannerEl);
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        const k = e.target.closest("[data-kd]");
        if (k) { kodeTast(k.dataset.kd); return; }
        if (e.target.closest("[data-kdannuller]")) { lukKodeskaerm(); return; }
        if (e.target.closest("[data-kdglemt]")) {
          el.querySelector(".kd-under").textContent = "Skriv til hotellets ejer – ejeren kan se din kode i Ejerpanelet.";
        }
      });
      el.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }
    el.querySelector("[data-kdglemt]").hidden = flow.type === "ny";
    kodeTrin();
  }
  function kodeTrin() {
    const el = skaerm.querySelector(".tlf-kode");
    if (!el || !kodeFlow) return;
    const t = { laas: "Skriv kode", gammel: "Skriv din nuværende kode", ny: "Vælg en ny kode med 6 tal", igen: "Skriv den nye kode igen" }[kodeFlow.trin];
    el.querySelector(".kd-titel").textContent = t;
    el.querySelector(".kd-under").textContent = kodeFlow.besked || (kodeFlow.trin === "ny" && kodeFlow.type === "skift" ? (skiftTilbage() === Infinity ? "Du er ejer – du kan skifte så tit du vil" : "Du kan skifte koden " + skiftTilbage() + " gang" + (skiftTilbage() === 1 ? "" : "e") + " mere") : "");
    kodeFlow.besked = "";
    tegnPrikker();
  }
  function tegnPrikker() {
    const el = skaerm.querySelector(".tlf-kode");
    if (!el) return;
    el.querySelectorAll(".kd-prikker i").forEach(function (p, i) { p.classList.toggle("fyldt", i < kodeFlow.tal.length); });
  }
  function kodeForkert(tekst) {
    const el = skaerm.querySelector(".tlf-kode");
    kodeFlow.tal = "";
    kodeFlow.besked = tekst;
    el.querySelector(".kd-prikker").classList.remove("ryst"); void el.offsetWidth; el.querySelector(".kd-prikker").classList.add("ryst");
    kodeTrin();
  }
  function kodeTast(t) {
    if (!kodeFlow || kodeFlow.travl) return;
    if (t === "⌫") { kodeFlow.tal = kodeFlow.tal.slice(0, -1); tegnPrikker(); return; }
    if (kodeFlow.tal.length >= 6) return;
    kodeFlow.tal += t;
    tegnPrikker();
    if (kodeFlow.tal.length < 6) return;
    const tal = kodeFlow.tal;
    setTimeout(function () {
      if (!kodeFlow) return;
      if (kodeFlow.trin === "laas") {
        if (tal === kodeInfo.kode) { const f = kodeFlow; lukKodeskaerm(); f.ok(); }
        else kodeForkert("Forkert kode – prøv igen");
      } else if (kodeFlow.trin === "gammel") {
        if (tal === kodeInfo.kode) { kodeFlow.gammel = tal; kodeFlow.tal = ""; kodeFlow.trin = "ny"; kodeTrin(); }
        else kodeForkert("Forkert kode – prøv igen");
      } else if (kodeFlow.trin === "ny") {
        kodeFlow.ny = tal; kodeFlow.tal = ""; kodeFlow.trin = "igen"; kodeTrin();
      } else if (kodeFlow.trin === "igen") {
        if (tal !== kodeFlow.ny) { kodeFlow.trin = "ny"; kodeForkert("Koderne var ikke ens – prøv igen"); return; }
        kodeFlow.travl = true;
        gemNyKode(kodeFlow.gammel || null, tal).then(function () {
          const f = kodeFlow; lukKodeskaerm();
          lille(f.type === "ny" ? "🔒 Din kode er lavet" : "🔒 Din kode er skiftet");
          ind.laas = true; gemInd();
          if (appNu === "indst") bevarScroll(tegnIndstillinger);
        }).catch(function (e) { kodeFlow.travl = false; kodeFlow.trin = kodeFlow.type === "ny" ? "ny" : "gammel"; kodeForkert(e.message); });
      }
    }, 120);
  }
  function lukKodeskaerm() {
    kodeFlow = null;
    const el = skaerm.querySelector(".tlf-kode");
    if (el) el.remove();
  }
  window.addEventListener("keydown", function (e) {
    if (!kodeFlow || tlf.hidden) return;
    if (/^[0-9]$/.test(e.key)) kodeTast(e.key);
    else if (e.key === "Backspace") kodeTast("⌫");
    else if (e.key === "Escape") lukKodeskaerm();
    else return;
    e.preventDefault(); e.stopPropagation();
  }, true);

  // Låseskærmen kræver koden
  const laasOpUdenKode = laasOp;
  laasOp = function (til) {
    if (!harKode()) { laasOpUdenKode(til); return; }
    if (kodeFlow) return;
    visKodeskaerm({ type: "laas", trin: "laas", ok: function () { laasOpUdenKode(til); } });
  };
  const laasUdenKode = laas;
  laas = function () { if (kodeFlow && kodeFlow.type === "laas") lukKodeskaerm(); laasUdenKode(); };

  // ----- 👑 Fanen i Ejerpanelet: alles telefonkoder -----
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (!faner || typeof visFane !== "function" || !erEjer()) return;
    const knap = document.createElement("button");
    knap.dataset.fane = "tlfkoder";
    knap.textContent = "📱 Telefonkoder";
    faner.appendChild(knap);
    knap.addEventListener("click", function () { ejerFane = "tlfkoder"; visFane(); });
    const visFaneFoerKoder = visFane;
    visFane = function () {
      visFaneFoerKoder.apply(this, arguments);
      if (ejerFane === "tlfkoder") visTelefonkoder();
    };
    let soeg = "";
    function lokaleKoder() {
      const l = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("mit-hotel-telefon-kode-") === 0) {
          try { const v = JSON.parse(localStorage.getItem(k)); if (v && v.har) l.push({ navn: k.slice(23), kode: v.kode, skift: v.skift || 0 }); } catch (e) {}
        }
      }
      return l;
    }
    function visTelefonkoder() {
      const boks = document.getElementById("ejer-indhold");
      boks.innerHTML = "<p class='ejer-info'>Henter telefonkoder …</p>";
      const hent = kodeOnline() ? serverKald("hv_tlfkode_alle", { p_token: mitToken() }).then(function (l) { return { l: l || [] }; })
        .catch(function (e) { return { l: lokaleKoder(), note: kodeMangler(e) ? "Koderne kommer fra alle spillere, når database-39-telefonkode.sql er kørt i Supabase. Lige nu ser du kun koder fra denne computer." : e.message }; })
        : Promise.resolve({ l: lokaleKoder(), note: "Du ser kun koder fra denne computer." });
      hent.then(function (r) {
        if (ejerFane !== "tlfkoder") return;
        const liste = r.l.filter(function (x) { return !soeg || x.navn.toLowerCase().indexOf(soeg) >= 0; });
        boks.innerHTML = "<h3 style='margin:0 0 6px'>📱 Telefonkoder</h3>" +
          "<p class='ejer-info'>Her kan du se alles 6-cifrede telefonkoder, hvis nogen glemmer deres. Hver spiller kan skifte koden " + KODE_MAKS_SKIFT + " gange – giv dem nye skift her.</p>" +
          (r.note ? "<p class='ejer-info'>⚠️ " + esc(r.note) + "</p>" : "") +
          "<label class='ejer-felt'>Søg efter spiller<input id='tk-soeg' type='text' value='" + esc(soeg) + "' placeholder='Navn …'></label>" +
          (liste.length ? "<table class='tk-tabel'><tr><th>Spiller</th><th>Kode</th><th>Skift brugt</th><th></th></tr>" + liste.map(function (x) {
            return "<tr><td><b>" + esc(x.navn) + "</b></td><td class='tk-kode'>" + esc(x.kode) + "</td><td>" + x.skift + " / " + KODE_MAKS_SKIFT + "</td>" +
              "<td><button class='lv-knap' data-tkskift='" + esc(x.navn) + "'>🔁 Giv 3 nye skift</button> <button class='lv-knap' data-tkfjern='" + esc(x.navn) + "'>🗑 Fjern koden</button></td></tr>";
          }).join("") + "</table>" : "<p class='ejer-info'>Ingen har lavet en telefonkode endnu.</p>");
        const s = document.getElementById("tk-soeg");
        s.addEventListener("input", function () { soeg = s.value.trim().toLowerCase(); const pos = s.selectionStart; visTelefonkoder(); setTimeout(function () { const n = document.getElementById("tk-soeg"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 30); });
        s.addEventListener("keydown", function (e) { e.stopPropagation(); });
      });
    }
    document.addEventListener("click", function (e) {
      const sk = e.target.closest && e.target.closest("[data-tkskift], [data-tkfjern]");
      if (!sk || ejerFane !== "tlfkoder") return;
      const navn = sk.dataset.tkskift || sk.dataset.tkfjern, hvad = sk.dataset.tkskift ? "skift" : "fjern";
      if (hvad === "fjern" && !sk.classList.contains("sikker")) { sk.classList.add("sikker"); sk.textContent = "Er du sikker?"; return; }
      const lokalt = function () {
        const k = "mit-hotel-telefon-kode-" + navn;
        try {
          if (hvad === "fjern") localStorage.removeItem(k);
          else { const v = JSON.parse(localStorage.getItem(k)); v.skift = 0; localStorage.setItem(k, JSON.stringify(v)); }
        } catch (er) {}
        if (navn === mig()) try { kodeInfo = JSON.parse(localStorage.getItem(kodeNoegle()) || "null") || { har: false, skift: 0 }; } catch (er) {}
      };
      const p = kodeOnline() ? serverKald("hv_tlfkode_ejer", { p_token: mitToken(), p_navn: navn, p_hvad: hvad }).then(lokalt).catch(function (er) { if (kodeMangler(er)) lokalt(); else throw er; }) : Promise.resolve(lokalt());
      p.then(function () {
        if (typeof adminSkriv === "function") try { adminSkriv("Telefonkode: " + navn + (hvad === "fjern" ? " fik fjernet sin kode" : " fik 3 nye skift")); } catch (er) {}
        if (navn === mig()) hentMinKode();
        visTelefonkoder();
      }).catch(function (er) { alert(er.message); });
    });
  })();

  function aabnTelefon() {
    if (!tlf.hidden) return;
    hentInd();
    saetFarver();
    tlf.hidden = false;
    placer();
    tlf.classList.remove("tlf-ind"); void tlf.offsetWidth; tlf.classList.add("tlf-ind");
    setTimeout(function () { tlf.classList.remove("tlf-ind"); placer(); }, 400);
    opdaterUr();
    if (ind.laas || harKode()) laas();
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
  // Byg-knappen: i rum hvor man ikke må bygge, forklares det i stedet
  document.addEventListener("click", function (e) {
    const k = e.target.closest && e.target.closest("#byg-aabn");
    if (!k || !k.hidden) return;
    e.stopPropagation();
    e.preventDefault();
    let t = document.getElementById("byg-toast");
    if (!t) { t = document.createElement("div"); t.id = "byg-toast"; document.body.appendChild(t); }
    t.textContent = rumValg === "hal" ? "🔨 Her i hallen må kun Bygmestre bygge – byg i dit eget værelse" : "🔨 Du kan kun bygge i dine egne rum";
    t.classList.add("vis");
    clearTimeout(t.timer);
    t.timer = setTimeout(function () { t.classList.remove("vis"); }, 2600);
  }, true);
  const vk = document.getElementById("chat-venner-knap");
  if (vk) vk.title = "Telefon";

  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || tlf.hidden) return;
    if (galleriAabent) { galleriAabent = false; tegnGalleri(); }
    else if (redigerer) stopRediger();
    else if (skaermNu === "app") lukApp(); else lukTelefon();
  });
  // tastatur i telefonens felter må ikke styre spillet
  tlf.addEventListener("keydown", function (e) { if (e.target.matches("input, textarea") && e.key !== "Escape") e.stopPropagation(); });

  // ---------------------------------------------------------------
  //  🔋 Batteri: falder, mens telefonen er tændt (hurtigere med kamera
  //  eller musik), og lader op ved en Ladestation eller i caféen.
  // ---------------------------------------------------------------
  const PB_PRIS = 40;
  function erEjer() {
    const liste = typeof EJER_NAVNE !== "undefined" ? EJER_NAVNE : (typeof EJERE !== "undefined" ? EJERE : []);
    return liste.indexOf(mig()) >= 0;
  }
  function sidder() {
    try { return typeof figur !== "undefined" && !!figur.sidde; } catch (e) { return false; }
  }
  function vedOplader(afstand) {
    try {
      if (typeof moeblerIRummet === "undefined" || typeof figur === "undefined") return false;
      return moeblerIRummet.some(function (m) {
        return m.type === "oplader" && Math.abs(m.x - figur.x) <= afstand && Math.abs(m.y - figur.y) <= afstand;
      });
    } catch (e) { return false; }
  }
  function iCafe() { try { return typeof iCafeen === "function" && iCafeen(); } catch (e) { return false; } }
  // Man lader, når man sidder ved siden af en Ladestation (eller står helt op ad den), eller sidder i caféen
  function laderVedVaeg() { return (sidder() && (vedOplader(2) || iCafe())) || (!sidder() && vedOplader(1) && !(typeof figur !== "undefined" && figur.rute && figur.rute.length)); }
  // Powerbanken sidder i telefonen og lader, uanset hvor man er. Den løber aldrig tør, så man skal kun købe én.
  function laderPB() { return !!ind.pbTil && harPowerbank() && !laderVedVaeg(); }
  function laderNu() { return laderVedVaeg() || laderPB(); }
  function brugerMeget() {
    const k = document.getElementById("kamera"), yt = document.getElementById("youtube-vindue");
    const elev = document.getElementById("elevator"), tur = document.getElementById("elevator-tur");
    return (k && !k.hidden) || (yt && !yt.hidden && yt.offsetParent !== null) || (elev && !elev.hidden) || (tur && !tur.hidden) ||
      (appNu === "snake" && typeof snakeKoerer !== "undefined" && snakeKoerer) || (typeof spilKoerer !== "undefined" && spilKoerer) || (typeof lygteTaendt !== "undefined" && lygteTaendt);
  }
  function saetStroem(v) {
    ind.bat = Math.max(0, Math.min(100, v));
    gemInd();
    tjekTom();
    visBatteri();
  }
  function harPowerbank() { return (ind.powerbanks || 0) > 0 || (ind.pbRest || 0) > 0 || !!ind.pbTil; }
  function brugPowerbank() {
    if (ind.pbTil) { tagPowerbankFra(); return; }
    if (!harPowerbank()) { lille("Du har ingen powerbank – køb en i Indstillinger → Batteri"); return; }
    ind.pbTil = true;
    gemInd();
    visBatteri();
    lille("🔌 Powerbanken er sat til");
    if (appNu === "indst") bevarScroll(tegnIndstillinger);
    tegnBatMenu();
  }
  function tagPowerbankFra() {
    ind.pbTil = false;
    gemInd();
    visBatteri();
    lille("Powerbanken er taget fra");
    if (appNu === "indst") bevarScroll(tegnIndstillinger);
    tegnBatMenu();
  }
  // Lille batteri-menu, når man klikker på batteriet øverst (virker overalt, også på låseskærmen)
  function tegnBatMenu(aabn) {
    let m = skaerm.querySelector(".tlf-batmenu");
    if (!m && !aabn) return;
    if (!m) { m = document.createElement("div"); m.className = "tlf-batmenu"; skaerm.insertBefore(m, bannerEl); }
    const b = Math.round(Math.max(0, Math.min(100, ind.bat)));
    const kilde = laderVedVaeg() ? "⚡ Lader ved en oplader" : laderPB() ? "⚡ Lader fra powerbank" : b <= 20 ? "Lavt batteri" : "Lader ikke";
    m.innerHTML = "<div class='bm-top'><span>🔋</span><span><b>" + b + " %</b><small>" + kilde + "</small></span></div>" +
      "<div class='bm-bar" + (b <= 20 && !laderNu() ? " lav" : "") + "'><i style='width:" + b + "%'></i></div>" +
      (ind.pbTil ? "<div class='bm-info'>Powerbanken er sat til ⚡</div><button data-bmpb>Tag powerbanken fra</button>"
        : harPowerbank() ? "<div class='bm-info'>Din powerbank løber aldrig tør</div><button class='groen' data-bmpb>🔌 Sæt powerbank til</button>"
        : "<div class='bm-info'>Du har ingen powerbank endnu. Den løber aldrig tør, så du skal kun købe én.</div><button class='groen' data-bmkoeb>Køb powerbank · " + PB_PRIS + " Glimt</button>");
  }
  function lukBatMenu() { const m = skaerm.querySelector(".tlf-batmenu"); if (m) m.remove(); }
  tlf.querySelector(".st-batsvg").addEventListener("click", function (e) {
    e.stopPropagation();
    if (skaerm.querySelector(".tlf-batmenu")) lukBatMenu(); else tegnBatMenu(true);
  });
  skaerm.addEventListener("click", function (e) {
    const m = skaerm.querySelector(".tlf-batmenu");
    if (!m) return;
    if (!m.contains(e.target)) { lukBatMenu(); return; }
    e.stopPropagation();
    if (e.target.closest("[data-bmpb]")) brugPowerbank();
    if (e.target.closest("[data-bmkoeb]")) {
      if (harPowerbank()) lille("Du har allerede en powerbank");
      else if (typeof brugGlimt === "function" && brugGlimt(PB_PRIS)) { ind.powerbanks = 1; gemInd(); lille("🔋 Du har købt en powerbank"); }
      else lille("Du har ikke Glimt nok");
      tegnBatMenu();
    }
  }, true);
  tlf.querySelector(".tlf-pb").addEventListener("click", function (e) { e.stopPropagation(); tagPowerbankFra(); });
  let varslet = 100, varTom = ind.bat <= 0, sidstLader = false;
  function tjekTom() {
    const tom = ind.bat <= 0;
    if (tom === varTom) return;
    varTom = tom;
    if (tom) { lukApp(true); skjulBanner(); }
    else if (!tlf.hidden) laas();
    tegnIkon();
  }
  function visBatteri() {
    const b = Math.max(0, Math.min(100, ind.bat)), lader = laderNu();
    tlf.querySelector(".st-bat").setAttribute("width", Math.max(1.5, 24 * b / 100).toFixed(1));
    tlf.querySelector(".st-pct").textContent = Math.round(b) + "%";
    tlf.querySelector(".st-lyn").setAttribute("display", lader ? "inline" : "none");
    statusEl.classList.toggle("lav", b <= 20 && !lader && !ind.spare);
    statusEl.classList.toggle("spare", !!ind.spare && !lader);
    statusEl.classList.toggle("lader", lader);
    const l = laasEl.querySelector(".lader");
    l.hidden = !lader;
    l.textContent = "⚡ Oplader · " + Math.round(b) + " %";
    tlf.querySelector(".tlf-kabel").hidden = !laderVedVaeg();
    const pb = tlf.querySelector(".tlf-pb");
    pb.hidden = !ind.pbTil;
    pb.querySelectorAll(".pb-led i").forEach(function (l) { l.classList.add("paa"); });
    pb.querySelector(".pb-pct").textContent = "";
    const d = tlf.querySelector(".tlf-doed");
    d.hidden = b > 0;
    d.classList.toggle("lader", lader);
    d.querySelector("p").textContent = lader ? "⚡ Lader op …" : "Telefonen er løbet tør for strøm";
    d.querySelector(".doed-pb").hidden = ind.pbTil || !harPowerbank();
    d.querySelector(".doed-pb").textContent = "🔌 Sæt powerbank til";
  }
  tlf.querySelector(".doed-pb").addEventListener("click", function (e) { e.stopPropagation(); brugPowerbank(); });
  let tik = 0;
  setInterval(function () {
    tik++;
    const lader = laderNu();
    const foer = ind.bat;
    if (lader && laderPB()) {
      // powerbanken lader lidt hurtigere end væggen: 1 % hvert 4. sekund
      if (tik % 2 === 0 && ind.bat < 100) {
        ind.bat = Math.min(100, ind.bat + 1);
      }
    }
    else if (lader) { if (tik % 3 === 0) ind.bat = Math.min(100, ind.bat + 1); }              // 1 % hvert 6. sekund = fuld på ca. 10 minutter
    else if (!tlf.hidden && ind.bat > 0 && tik % ((brugerMeget() ? 4 : 12) * (ind.spare ? 2 : 1)) === 0) ind.bat = Math.max(0, ind.bat - 1);   // ca. 40 min (13 min med kamera/musik), dobbelt så længe med strømspare
    else if (tlf.hidden && ind.bat > 0 && brugerMeget() && tik % (ind.spare ? 16 : 8) === 0) ind.bat = Math.max(0, ind.bat - 1);
    if (lader !== sidstLader) {
      sidstLader = lader;
      if (lader) { if (!tlf.hidden) lille("🔌 Telefonen lader op"); else besked && (besked.textContent = "🔌 Din telefon lader op ⚡"); }
      if (appNu === "indst") bevarScroll(tegnIndstillinger);
    }
    if (ind.bat !== foer) {
      gemInd();
      if (!lader && BAT_ADVARSLER.indexOf(ind.bat) >= 0 && varslet !== ind.bat) {
        varslet = ind.bat;
        batVenter = ind.bat;
        if (tlf.hidden) {
          if (typeof besked !== "undefined" && besked) besked.textContent = "🔋 Din telefon har kun " + ind.bat + " % strøm tilbage.";
          const k = document.getElementById("chat-venner-knap");
          if (k) { k.classList.remove("tlf-ring"); void k.offsetWidth; k.classList.add("tlf-ring"); }
          ding();
        }
      }
      if (ind.bat > 15) varslet = 100;
      // strømsparetilstand slukker selv, når telefonen er ladet op til 80 %
      if (ind.spare && lader && ind.bat >= 80) { ind.spare = false; gemInd(); if (!tlf.hidden) lille("🔋 Strømsparetilstand er slået fra – telefonen er ladet op"); }
      tjekTom();
    }
    if (batVenter && !tlf.hidden && ind.bat > 0) visBatAdvarsel(batVenter);
    if (batVenter && laderNu()) batVenter = 0;
    if (!tlf.hidden) { visBatteri(); tegnBatMenu(); }
  }, 2000);
  // 🪫 Advarsel midt på skærmen ved 15 %, 10 % og 5 % – ligesom på en rigtig telefon
  const BAT_ADVARSLER = [15, 10, 5];
  let batVenter = 0;
  function visBatAdvarsel(pct) {
    batVenter = 0;
    const gl = skaerm.querySelector(".tlf-batadv");
    if (gl) gl.remove();
    const el = document.createElement("div");
    el.className = "tlf-batadv";
    const pb = harPowerbank() && !ind.pbTil;
    el.innerHTML = "<div class='ba-boks" + (pct <= 5 ? " kritisk" : "") + "'><div class='ba-ik'>" + (pct <= 5 ? "🪫" : "🔋") + "</div><b>Lavt batteri</b>" +
      "<p>" + pct + " % batteri tilbage." + (pct <= 5 ? " Telefonen slukker snart!" : "") + "<br>" + (pb ? "Sæt din powerbank til, eller find en oplader 🔌" : "Find en oplader 🔌") + "</p>" +
      (pb ? "<button data-baknap='pb'>🔋 Sæt powerbank til</button>" : "") +
      (ind.spare ? "" : "<button data-baknap='spare'>Strømsparetilstand</button>") +
      "<button data-baknap='luk' class='luk'>Luk</button></div>";
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      const k = e.target.closest("[data-baknap]");
      if (!k && e.target !== el) return;
      const h = k ? k.dataset.baknap : "luk";
      if (h === "pb") brugPowerbank();
      if (h === "spare") { ind.spare = true; gemInd(); visBatteri(); lille("🟡 Strømsparetilstand er slået til"); }
      el.classList.add("ud");
      setTimeout(function () { el.remove(); }, 200);
    });
    skaerm.appendChild(el);
    ding();
    tlf.classList.remove("tlf-vib"); void tlf.offsetWidth; tlf.classList.add("tlf-vib");
  }
  function visBatteriBanner() {
    bannerEl.innerHTML = "<div class='tlf-notis'><span class='ai' style='background:linear-gradient(#ff8a80,#ff3b30)'>🔋</span><span class='nt'><b>Lavt batteri<small>nu</small></b><span>" +
      ind.bat + " % tilbage. " + (harPowerbank() && !ind.pbTil ? "Tryk på batteriet øverst og sæt en powerbank til 🔌" : "Find en oplader 🔌") + "</span></span></div>";
    bannerEl.classList.add("vis");
    clearTimeout(visBanner.t);
    visBanner.t = setTimeout(skjulBanner, 4500);
  }

  // 🔌 Ladestationen er et møbel, man kan købe i Shoppen
  (function ladestation(forsoeg) {
    if (typeof MOEBLER === "undefined" || typeof MOEBEL_TYPER === "undefined") { if (forsoeg < 60) setTimeout(function () { ladestation(forsoeg + 1); }, 500); return; }
    if (!MOEBEL_TYPER.oplader) {
      const t = { id: "oplader", navn: "Ladestation til telefonen", kategori: "Elektronik",
        retninger: [0, 1, 2, 3].map(function (i) { return "billeder/moebler/oplader/oplader-" + i + ".png"; }) };
      MOEBLER.push(t);
      MOEBEL_TYPER.oplader = t;
      if (typeof forberedRetninger === "function") try { forberedRetninger(t); } catch (e) {}
    }
    (function iShoppen(n) {
      if (typeof HOTEL_MOEBEL_PRISER === "undefined" || typeof hotelMoeblerIShop !== "function") { if (n < 60) setTimeout(function () { iShoppen(n + 1); }, 500); return; }
      HOTEL_MOEBEL_PRISER.oplader = 150;
      if (typeof HOTEL_SHOP_KAT !== "undefined" && !HOTEL_SHOP_KAT.some(function (k) { return k.kategori === "Elektronik"; })) HOTEL_SHOP_KAT.push({ kategori: "Elektronik", ikon: "🔌" });
      hotelMoeblerIShop();
    })(0);
  })(0);

  // ---------------------------------------------------------------
  //  Fælles for de 3 nye apps: stilark med "#telefon" foran
  // ---------------------------------------------------------------
  function tlfPrefix(regel) {
    if (regel.charAt(0) === "@" || regel.indexOf("#") === 0) return regel;
    return regel.split("}").filter(function (r) { return r.trim(); }).map(function (r) {
      const i = r.indexOf("{");
      return r.slice(0, i).split(",").map(function (v) { return "#telefon " + v.trim(); }).join(", ") + " " + r.slice(i) + "}";
    }).join(" ");
  }
  function nyStil(id, regler) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = regler.map(tlfPrefix).join("\n");
    document.head.appendChild(s);
    if (typeof vinFaerdige !== "undefined" && s.sheet) try { vinFaerdige.add(s.sheet); } catch (e) {}
  }
  function hentGemt(n, standard) { try { const v = JSON.parse(localStorage.getItem(n) || "null"); return v == null ? standard : v; } catch (e) { return standard; } }
  function gemGemt(n, v) { try { localStorage.setItem(n, JSON.stringify(v)); } catch (e) {} }
  // tal der altid bliver de samme for samme "frø" (så vejret i dag er det samme hele dagen)
  function froe(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngFra(s) { let a = froe(s) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function dagNoegle(d) { d = d || new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  // ===============================================================
  //  🌐 Vera-Net — hotellets egen browser
  //  Søgefelt, faner, bogmærker, seneste besøg, favoritter og en
  //  forside man selv designer. Alle siderne virker inde i telefonen.
  //  Gemmes i mit-hotel-telefon-net-<navn>
  // ===============================================================
  function netNoegle() { return "mit-hotel-telefon-net-" + mig(); }
  const NET_STANDARD_FAV = ["hotel.vera", "nyt.vera", "vejr.vera", "wiki.vera", "opskrift.vera", "vits.vera", "quiz.vera", "tegn.vera"];
  let net = null;
  function netData() {
    if (net && net.ejer === mig()) return net;
    net = hentGemt(netNoegle(), null) || {};
    net.ejer = mig();
    if (!Array.isArray(net.faner) || !net.faner.length) net.faner = [{ id: Date.now(), hist: ["vera.net"], pos: 0 }];
    if (!Array.isArray(net.bogm)) net.bogm = [];
    if (!Array.isArray(net.fav)) net.fav = NET_STANDARD_FAV.map(function (u) { return { url: u, titel: netSide(u).titel }; });
    if (!Array.isArray(net.seneste)) net.seneste = [];
    if (!net.forside) net.forside = {};
    net.forside = Object.assign({ titel: "Min forside", emoji: "🌐", bg: "himmel", moerk: false, form: "rund", widgets: ["soeg", "fav", "ur", "vejr", "nyt", "vits"] }, net.forside);
    if (!net.faner.some(function (f) { return f.id === net.aktiv; })) net.aktiv = net.faner[0].id;
    return net;
  }
  function gemNet() { const d = netData(); gemGemt(netNoegle(), { faner: d.faner, aktiv: d.aktiv, bogm: d.bogm, fav: d.fav, seneste: d.seneste.slice(0, 60), forside: d.forside, quiz: d.quiz, vitsLike: d.vitsLike }); }
  function netFane() { const d = netData(); return d.faner.filter(function (f) { return f.id === d.aktiv; })[0] || d.faner[0]; }
  function netUrl(f) { f = f || netFane(); return f.hist[f.pos] || "vera.net"; }

  // ----- adresser: "wiki.vera/glimt?q=…" -----
  function netRens(u) {
    u = String(u || "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
    return u || "vera.net";
  }
  function netDel(u) {
    u = netRens(u);
    const q = u.indexOf("?"), sporg = q >= 0 ? decodeURIComponent(u.slice(q + 1).replace(/^q=/, "").replace(/\+/g, " ")) : "";
    const uden = q >= 0 ? u.slice(0, q) : u;
    const s = uden.indexOf("/");
    return { domaene: s >= 0 ? uden.slice(0, s) : uden, sti: s >= 0 ? uden.slice(s + 1) : "", q: sporg };
  }
  const NET_BG = {
    himmel: "linear-gradient(160deg, #8fd3ff, #4a7fe0)", solnedgang: "linear-gradient(160deg, #ffb37a, #e0567a)",
    skov: "linear-gradient(160deg, #a8e6a1, #2f8a5a)", lilla: "linear-gradient(160deg, #e2c4ff, #7a4ae0)",
    guld: "linear-gradient(160deg, #fff1b8, #e0a12c)", nat: "linear-gradient(160deg, #3a3f7a, #10122a)",
    rosa: "linear-gradient(160deg, #ffd6e6, #ff7aa8)", hav: "linear-gradient(160deg, #7af0e0, #1a7fa0)",
    sky: "radial-gradient(circle at 30% 20%, #fff 0 8%, transparent 9%), radial-gradient(circle at 75% 35%, #fff 0 6%, transparent 7%), linear-gradient(#bfe6ff, #7fb8f0)",
    prikker: "radial-gradient(#ffffff55 2px, transparent 2.5px) 0 0/16px 16px, linear-gradient(160deg, #ff9ad5, #8f6bff)",
    stjerner: "radial-gradient(#fff 1px, transparent 1.5px) 0 0/22px 22px, radial-gradient(#fff9 1px, transparent 1.5px) 11px 11px/22px 22px, linear-gradient(#1d2150, #3b2a6b)",
    hotel: "repeating-linear-gradient(90deg, #f7e7c8 0 14px, #f1dcb4 14px 28px)",
  };
  const NET_EMOJI = ["🌐", "🏨", "⭐", "🌸", "🐱", "🐶", "🦄", "🎮", "🎵", "🍕", "⚽", "🌈", "🔮", "🚀", "🍀", "💎"];
  const NET_WIDGETS = { soeg: "🔎 Søgefelt", fav: "⭐ Favoritter", ur: "🕐 Ur og dato", vejr: "⛅ Vejret", nyt: "📰 Nyheder", vits: "😂 Dagens vits", seneste: "🕘 Seneste besøg", bogm: "🔖 Bogmærker" };

  // ----- indhold til siderne -----
  const NET_WIKI = {
    "hello-vera": { titel: "HELLO VERA", tekst: "HELLO VERA er et online hotel, hvor man har sin egen figur, sit eget værelse og en masse venner. Hotellet er bygget af ejeren [[pall|Pall]].\n\nMan betaler med [[glimt|Glimt]] og den sjældne [[stella|Stella]]. Man kommer rundt med [[navigatoren|Navigatøren]] eller [[elevatoren|elevatoren]]." },
    pall: { titel: "Pall", tekst: "Pall er hotellets ejer. Man kan kende ejeren på det gyldne EJER-skilt over hovedet. Ejeren har Ejerpanelet, hvor hotellet styres." },
    glimt: { titel: "Glimt ⭐", tekst: "Glimt er hotellets almindelige penge. Man bruger Glimt i Shoppen til møbler, tøj og ting. Se også [[stella|Stella]]." },
    stella: { titel: "Stella 🔮", tekst: "Stella er en sjælden, lilla valuta. Særlige møbler koster Stella. Man kan bytte [[glimt|Glimt]] til Stella." },
    telefonen: { titel: "Telefonen 📱", tekst: "Alle gæster har en telefon med Beskeder, Kontakter, [[peep|Peep]], Noter, kamera og meget mere. I [[app-butik|App Butik]] kan man hente flere apps og spil. Telefonen kan låses med en 6-cifret kode, og den skal lades op – fx med en [[powerbank|powerbank]]." },
    peep: { titel: "Peep 🐤", tekst: "Peep er hotellets eget sociale netværk. Man laver opslag, giver likes og skriver kommentarer. Peep findes på [[telefonen|telefonen]]." },
    "app-butik": { titel: "App Butik", tekst: "I App Butik henter man gratis apps og spil til [[telefonen|telefonen]]: fx [[vera-net|Vera-Net]], [[vera-mail|Vera-Mail]], [[music-box|Music Box]] og [[stjernestribe|Stjernestribe]]. Hentede apps kan afinstalleres igen." },
    "vera-net": { titel: "Vera-Net 🌐", tekst: "Vera-Net er hotellets browser. Den har faner, bogmærker, favoritter, seneste besøg og en forside, man selv kan designe. Du bruger den lige nu!" },
    "vera-mail": { titel: "Vera-Mail ✉️", tekst: "Med Vera-Mail sender man mails til andre gæster på hotellet. En mail har et emne og en tekst, og man kan svare, stjernemarkere og slette." },
    "music-box": { titel: "Music Box 🎵", tekst: "Music Box spiller hotellets egen musik. Al musikken bliver lavet af telefonen selv, så der er ingen ophavsret. Man kan lave playlister, vælge favoritter og finde musik til hver stemning." },
    stjernestribe: { titel: "Stjernestribe", tekst: "Stjernestribe er et spil for to venner. Man skiftes til at lægge stjerner, og den første med fire på stribe vinder." },
    navigatoren: { titel: "Navigatøren 🛎", tekst: "Navigatøren viser alle hotellets rum, etage for etage. Man kan også oprette sine egne rum. Se også [[elevatoren|elevatoren]]." },
    elevatoren: { titel: "Elevatoren", tekst: "Elevatoren står i Velkomsthallen. Den kører til alle etager – og der siges at være en hemmelig etage, som kun gæster med en nøgle kommer op på …" },
    powerbank: { titel: "Powerbank 🔋", tekst: "En powerbank sættes til [[telefonen|telefonen]], så den lader, uanset hvor man er. Den løber aldrig tør, så man skal kun købe én." },
    venner: { titel: "Venner 👫", tekst: "Klik på en gæst og vælg Tilføj ven. Venner kan skrive sammen i Beskeder, spille [[stjernestribe|Stjernestribe]] og sende [[vera-mail|mails]]." },
  };
  const NET_OPSKRIFTER = {
    pandekager: { titel: "Pandekager", ik: "🥞", tid: "30 min", til: 4, ingr: [[3, "", "æg"], [3, "dl", "hvedemel"], [5, "dl", "mælk"], [1, "spsk", "sukker"], [0.5, "tsk", "salt"], [25, "g", "smør"]], trin: ["Pisk æg, sukker og salt sammen.", "Pisk melet i lidt ad gangen.", "Rør mælken i, til dejen er glat.", "Smelt smørret og rør det i.", "Bag tynde pandekager på en varm pande – bed en voksen om hjælp."] },
    kakao: { titel: "Varm kakao", ik: "☕", tid: "10 min", til: 2, ingr: [[5, "dl", "mælk"], [2, "spsk", "kakao"], [2, "spsk", "sukker"], [1, "knsp", "salt"]], trin: ["Rør kakao, sukker og salt sammen i en gryde.", "Hæld lidt mælk i og rør det til en glat masse.", "Hæld resten af mælken i og varm op uden at koge.", "Server med flødeskum eller skumfiduser."] },
    boller: { titel: "Hotellets boller", ik: "🥐", tid: "1½ time", til: 12, ingr: [[25, "g", "gær"], [3, "dl", "lunken mælk"], [50, "g", "smør"], [1, "", "æg"], [1, "spsk", "sukker"], [1, "tsk", "salt"], [550, "g", "hvedemel"]], trin: ["Rør gæren ud i den lunkne mælk.", "Tilsæt smeltet smør, æg, sukker og salt.", "Ælt melet i, til dejen slipper skålen.", "Lad dejen hæve i 45 minutter.", "Form boller og lad dem hæve igen i 20 minutter.", "Bag ved 220 grader i ca. 12 minutter."] },
    smoothie: { titel: "Regnbue-smoothie", ik: "🥤", tid: "5 min", til: 2, ingr: [[1, "", "banan"], [2, "dl", "frosne bær"], [2, "dl", "yoghurt"], [1, "dl", "æblejuice"], [1, "tsk", "honning"]], trin: ["Kom det hele i en blender.", "Blend, til den er helt glat.", "Hæld i høje glas og pynt med et bær på kanten."] },
    pizzatoast: { titel: "Pizza-toast", ik: "🍕", tid: "15 min", til: 2, ingr: [[4, "skiver", "toastbrød"], [4, "spsk", "tomatsauce"], [100, "g", "revet ost"], [8, "skiver", "pepperoni"], [1, "tsk", "oregano"]], trin: ["Smør tomatsauce på brødet.", "Læg pepperoni på og drys med ost og oregano.", "Bag i ovnen ved 200 grader i 8 minutter."] },
    krus: { titel: "Kage i et krus", ik: "🧁", tid: "5 min", til: 1, ingr: [[4, "spsk", "hvedemel"], [3, "spsk", "sukker"], [2, "spsk", "kakao"], [3, "spsk", "mælk"], [2, "spsk", "olie"], [1, "knsp", "bagepulver"]], trin: ["Rør det hele sammen i et stort krus.", "Varm kruset i mikroovnen i ca. 1 minut.", "Lad den køle lidt af – den er varm!"] },
    frugtspyd: { titel: "Frugtspyd", ik: "🍓", tid: "10 min", til: 4, ingr: [[10, "", "jordbær"], [2, "", "bananer"], [1, "", "æble"], [20, "", "vindruer"], [8, "", "grillspyd"]], trin: ["Skyl frugten og skær den i stykker.", "Sæt frugten på spyddene i flotte farver.", "Dyp evt. spidsen i smeltet chokolade."] },
  };
  const NET_VITSER = [
    "Hvorfor tog skelettet ikke med til festen?|Det havde ingen at gå med.",
    "Hvad siger den ene væg til den anden?|Vi ses ved hjørnet!",
    "Hvorfor kan elefanter ikke bruge computer?|De er bange for musen.",
    "Hvad kalder man en sovende dinosaur?|En dino-snore.",
    "Hvorfor gik tomaten rød i hovedet?|Den så salatdressingen.",
    "Hvad er det, der går og går, men aldrig kommer frem?|Et ur.",
    "Hvorfor tog kagen til lægen?|Den følte sig lidt smuldrende.",
    "Hvad sagde nul til otte?|Flot bælte!",
    "Hvorfor tager fisk ikke på hotel?|De har allerede en masse skæl.",
    "Hvad får man, hvis man krydser en ko med en trampolin?|Milkshake.",
    "Hvorfor læser spøgelser altid bøger?|De elsker gyser-historier.",
    "Hvorfor tog blyanten på ferie?|Den var helt udtømt for ideer.",
    "Hvad er gult og kan ikke svømme?|En gravko.",
    "Hvorfor var matematikbogen trist?|Den havde for mange problemer.",
    "Hvad siger man til en hest, der er ked af det?|Op med hestehovedet!",
    "Hvorfor tager receptionisten altid en stige med på arbejde?|Fordi hotellet har fem stjerner.",
    "Hvad siger elevatoren, når den er træt?|Jeg er helt nede.",
    "Hvorfor sidder bananen alene?|Den blev skrællet af de andre.",
    "Hvad er en pirats yndlingsbogstav?|Rrrrr!",
    "Hvorfor gik kattetungen på biblioteket?|Den ville læse om mus.",
    "Hvad kalder man en ko uden ben?|Hakket oksekød.",
    "Hvorfor kan man ikke stole på atomer?|De finder på alting.",
  ];
  const NET_QUIZ = [
    ["Hvad hedder hotellets penge?", ["Glimt", "Kroner", "Mønter", "Stjerner"], 0],
    ["Hvad hedder den sjældne, lilla valuta?", ["Rubin", "Stella", "Krystal", "Perle"], 1],
    ["Hvad hedder hotellet?", ["Hotel Sol", "HELLO VERA", "Vera Inn", "Pixel Hotel"], 1],
    ["Hvad hedder hotellets sociale app?", ["Pip", "Peep", "Snak", "Kvidder"], 1],
    ["Hvor mange cifre har koden til telefonen?", ["4", "5", "6", "8"], 2],
    ["Hvor mange ben har en edderkop?", ["6", "8", "10", "4"], 1],
    ["Hvad får man, når man blander blå og gul?", ["Lilla", "Orange", "Grøn", "Brun"], 2],
    ["Hvad er Danmarks hovedstad?", ["Aarhus", "Odense", "Aalborg", "København"], 3],
    ["Hvor mange dage er der i et skudår?", ["365", "366", "364", "360"], 1],
    ["Hvilket dyr er verdens største?", ["Elefant", "Blåhval", "Giraf", "Haj"], 1],
    ["Hvor mange på stribe skal man have i Stjernestribe?", ["3", "4", "5", "6"], 1],
    ["Hvad hedder ejeren af hotellet?", ["Pall", "Ida", "Noah", "Vera"], 0],
    ["Hvilken planet er nærmest solen?", ["Venus", "Mars", "Merkur", "Jorden"], 2],
    ["Hvad bruger man en powerbank til?", ["At lade telefonen op", "At bage kager", "At købe møbler", "At svømme"], 0],
  ];
  const NET_TEGN = [["♈", "Vædderen"], ["♉", "Tyren"], ["♊", "Tvillingerne"], ["♋", "Krebsen"], ["♌", "Løven"], ["♍", "Jomfruen"], ["♎", "Vægten"], ["♏", "Skorpionen"], ["♐", "Skytten"], ["♑", "Stenbukken"], ["♒", "Vandbæreren"], ["♓", "Fiskene"]];
  const NET_NYT_FAST = [
    ["🛗 Elevatoren har fået en ny knap", "Ingen ved helt, hvad den gør. Receptionen siger bare: \"Den er til den hemmelige etage.\""],
    ["☕ Caféens kakao er hotellets mest populære drik", "Kokken afslører opskriften i Hotelkøkkenet på opskrift.vera."],
    ["🎵 Music Box er landet i App Butik", "Nu kan gæsterne høre hotellets helt egen musik – lavet af telefonen selv."],
    ["🐤 Rekord på Peep", "Aldrig har så mange skrevet opslag på én dag. Det mest likede opslag handlede om pandekager."],
    ["🌐 Vera-Net åbner", "Hotellets egen browser er klar. Prøv at designe din egen forside!"],
  ];

  function netSide(u) {
    const p = netDel(u), d = NET_SIDER[p.domaene];
    if (!d) return { titel: "Siden findes ikke", ik: "🤷", farve: "#8a8a8f" };
    let titel = d.titel;
    if (p.domaene === "wiki.vera" && NET_WIKI[p.sti]) titel = NET_WIKI[p.sti].titel + " – Verapedia";
    if (p.domaene === "opskrift.vera" && NET_OPSKRIFTER[p.sti]) titel = NET_OPSKRIFTER[p.sti].titel;
    if (p.domaene === "soeg.vera" && p.q) titel = p.q + " – Vera Søg";
    return { titel: titel, ik: d.ik, farve: d.farve };
  }
  function lnk(url, tekst, kl) { return "<a class='vn-a" + (kl ? " " + kl : "") + "' data-vnlink='" + esc(url) + "'>" + tekst + "</a>"; }
  function wikiTekst(t) {
    return esc(t).split("\n\n").map(function (afs) {
      return "<p>" + afs.replace(/\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g, function (m, id, tx) { return lnk("wiki.vera/" + id, tx); }) + "</p>";
    }).join("");
  }
  function vejrFor(d, sted) {
    const r = rngFra(dagNoegle(d) + (sted || "hotel")), m = d.getMonth();
    const base = [2, 2, 5, 9, 14, 18, 20, 20, 16, 11, 7, 4][m];
    const typer = [["☀️", "Sol"], ["🌤", "Mest sol"], ["⛅", "Halvskyet"], ["☁️", "Overskyet"], ["🌧", "Regn"], ["⛈", "Torden"], [m >= 10 || m <= 2 ? "🌨" : "🌦", m >= 10 || m <= 2 ? "Sne" : "Byger"]];
    const t = typer[Math.floor(r() * typer.length)];
    return { ik: t[0], navn: t[1], temp: Math.round(base + r() * 8 - 3), lav: Math.round(base - 3 - r() * 4), vind: Math.round(2 + r() * 10) };
  }
  function vitsNr(i) { const v = NET_VITSER[(i % NET_VITSER.length + NET_VITSER.length) % NET_VITSER.length].split("|"); return { q: v[0], a: v[1] }; }
  function dagensVits() { return vitsNr(froe(dagNoegle()) % NET_VITSER.length); }
  let netNyheder = null, netNyhedHentet = 0;
  function hentNetNyheder() {
    if (Date.now() - netNyhedHentet < 60000) return Promise.resolve(netNyheder);
    netNyhedHentet = Date.now();
    const lokal = function () { try { return typeof nyheder !== "undefined" && Array.isArray(nyheder) ? nyheder.slice() : []; } catch (e) { return []; } };
    if (typeof serverKald !== "function" || typeof mitToken !== "function" || !mitToken()) { netNyheder = lokal(); return Promise.resolve(netNyheder); }
    return serverKald("hv_nyheder_hent", { p_token: mitToken() }).then(function (l) { netNyheder = Array.isArray(l) ? l : lokal(); return netNyheder; })
      .catch(function () { netNyheder = lokal(); return netNyheder; });
  }
  function nyhedListe() {
    const egne = (netNyheder || []).slice().sort(function (a, b) { return (b.tid || 0) - (a.tid || 0); }).map(function (n) { return { titel: n.titel, tekst: n.tekst || "", tid: n.tid, hotel: true }; });
    return egne.concat(NET_NYT_FAST.map(function (n) { return { titel: n[0], tekst: n[1] }; }));
  }

  // ----- søgning -----
  function netIndeks() {
    const l = [];
    Object.keys(NET_SIDER).forEach(function (dom) { if (dom !== "soeg.vera") l.push({ url: dom, titel: NET_SIDER[dom].titel, tekst: NET_SIDER[dom].om || "", ord: NET_SIDER[dom].ord || "" }); });
    Object.keys(NET_WIKI).forEach(function (id) { l.push({ url: "wiki.vera/" + id, titel: NET_WIKI[id].titel + " – Verapedia", tekst: NET_WIKI[id].tekst.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1"), ord: "wiki" }); });
    Object.keys(NET_OPSKRIFTER).forEach(function (id) { const o = NET_OPSKRIFTER[id]; l.push({ url: "opskrift.vera/" + id, titel: o.ik + " " + o.titel + " – Hotelkøkkenet", tekst: "Opskrift · " + o.tid + " · " + o.ingr.map(function (x) { return x[2]; }).join(", "), ord: "opskrift mad bage" }); });
    netData().bogm.forEach(function (b) { if (!l.some(function (x) { return x.url === b.url; })) l.push({ url: b.url, titel: b.titel, tekst: "Dit bogmærke", ord: "" }); });
    return l;
  }
  function netSoeg(q) {
    const ord = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!ord.length) return [];
    return netIndeks().map(function (x) {
      const hel = (x.titel + " " + x.tekst + " " + x.ord + " " + x.url).toLowerCase(), t = x.titel.toLowerCase();
      let s = 0;
      ord.forEach(function (o) { if (t.indexOf(o) >= 0) s += 5; if (hel.indexOf(o) >= 0) s += 2; if (x.url.indexOf(o) >= 0) s += 3; });
      return { x: x, s: s };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).map(function (r) { return r.x; });
  }

  // ----- siderne -----
  const NET_SIDER = {
    "vera.net": { titel: "Startside", ik: "🏠", farve: "#2a6fd6", om: "Din egen forside", vis: function () { return netForsideHtml(); } },
    "soeg.vera": { titel: "Vera Søg", ik: "🔎", farve: "#2a6fd6", vis: function (p) {
      const res = p.q ? netSoeg(p.q) : [];
      return "<div class='vn-pg vn-soeg'><div class='vn-logo'><b style='color:#2a6fd6'>V</b><b style='color:#e0445a'>e</b><b style='color:#f5b821'>r</b><b style='color:#2a6fd6'>a</b> <span>Søg</span></div>" +
        "<form class='vn-sf' data-vnsoegform><input name='q' value='" + esc(p.q) + "' placeholder='Søg på Vera-Net …' autocomplete='off'><button>🔎</button></form>" +
        (p.q ? "<div class='vn-antal'>Ca. " + res.length + " resultat" + (res.length === 1 ? "" : "er") + "</div>" + (res.length ? res.map(function (r) {
          return "<div class='vn-res'>" + lnk(r.url, "<small>" + esc(r.url) + "</small><b>" + esc(r.titel) + "</b>") + "<p>" + esc(r.tekst.slice(0, 110)) + (r.tekst.length > 110 ? " …" : "") + "</p></div>";
        }).join("") : "<div class='vn-intet'>Ingen sider passer på <b>" + esc(p.q) + "</b>.<br>Prøv fx " + lnk("soeg.vera?q=opskrift", "opskrift") + ", " + lnk("soeg.vera?q=glimt", "glimt") + " eller " + lnk("soeg.vera?q=quiz", "quiz") + ".</div>")
          : "<div class='vn-tips'>Prøv at søge efter <b>pandekager</b>, <b>vejret</b>, <b>Stella</b> eller <b>vits</b>.</div>") + "</div>";
    } },
    "hotel.vera": { titel: "HELLO VERA", ik: "🏨", farve: "#b5652e", om: "Hotellets officielle side", ord: "hotel hello vera officiel velkommen",
      vis: function () {
        return "<div class='vn-pg vn-hotel'><div class='vn-hero' style='background:linear-gradient(135deg,#f7d58a,#c47a32)'><span>🏨</span><b>HELLO VERA</b><small>Velkommen til hotellet!</small></div>" +
          "<p>Her bor du, møder venner, bygger dit eget værelse og hygger dig i caféen. Hotellet er åbent døgnet rundt.</p>" +
          "<h4>Gå på opdagelse</h4><div class='vn-knapgrid'>" +
          lnk("wiki.vera/hello-vera", "📖 Læs om hotellet", "vn-k") + lnk("nyt.vera", "📰 Nyheder", "vn-k") + lnk("vejr.vera", "⛅ Vejret", "vn-k") + lnk("quiz.vera", "❓ Hotel-quiz", "vn-k") + "</div>" +
          "<h4>Telefonen</h4><p>Hent flere apps og spil gratis i App Butik.</p><button class='vn-stor' data-vnapp='butik'>🛍 Åbn App Butik</button>" +
          "<p class='vn-lille'>© HELLO VERA · Lavet af Pall</p></div>";
      } },
    "nyt.vera": { titel: "Vera Nyt", ik: "📰", farve: "#d6453a", om: "Nyheder fra hotellet", ord: "nyheder nyt avis",
      vis: function () {
        const l = nyhedListe();
        return "<div class='vn-pg vn-nyt'><div class='vn-avis'>VERA NYT<small>" + esc(dato()) + "</small></div>" +
          l.map(function (n, i) {
            return "<div class='vn-artikel" + (i === 0 ? " stor" : "") + "'>" + (n.hotel ? "<i>📢 Fra hotellet" + (n.tid ? " · " + esc(naarTekst(n.tid)) : "") + "</i>" : "") + "<b>" + esc(n.titel) + "</b><p>" + esc(n.tekst) + "</p></div>";
          }).join("") + (netNyheder === null ? "<div class='vn-lille'>Henter nyheder …</div>" : "") + "</div>";
      }, efter: function () { if (netNyheder === null || Date.now() - netNyhedHentet > 60000) hentNetNyheder().then(function () { if (netUrl() === "nyt.vera") netTegnSide(); }); } },
    "vejr.vera": { titel: "Vera Vejret", ik: "⛅", farve: "#3a9be0", om: "Vejret på hotellet i dag og de næste dage", ord: "vejr vejret regn sol temperatur",
      vis: function (p) {
        const steder = [["hotel", "Hotellet"], ["tag", "Tagterrassen"], ["strand", "Stranden"]], st = steder.some(function (s) { return s[0] === p.sti; }) ? p.sti : "hotel";
        const nu = vejrFor(new Date(), st);
        let dage = "";
        for (let i = 1; i <= 5; i++) { const d = new Date(); d.setDate(d.getDate() + i); const v = vejrFor(d, st); dage += "<div><span>" + DAGE[d.getDay()].slice(0, 3) + "</span><b>" + v.ik + "</b><span>" + v.temp + "° <i>" + v.lav + "°</i></span></div>"; }
        return "<div class='vn-pg vn-vejr'><div class='vn-steder'>" + steder.map(function (s) { return lnk("vejr.vera/" + s[0], s[1], s[0] === st ? "valgt" : ""); }).join("") + "</div>" +
          "<div class='vn-nu'><span>" + nu.ik + "</span><b>" + nu.temp + "°</b><small>" + nu.navn + " · laveste " + nu.lav + "° · vind " + nu.vind + " m/s</small></div>" +
          "<div class='vn-5'>" + dage + "</div><p class='vn-lille'>Vejret gælder i hotellets verden 😉</p></div>";
      } },
    "wiki.vera": { titel: "Verapedia", ik: "📖", farve: "#555", om: "Opslagsværket om alt på hotellet", ord: "wiki leksikon opslag",
      vis: function (p) {
        const a = NET_WIKI[p.sti];
        if (a) return "<div class='vn-pg vn-wiki'>" + lnk("wiki.vera", "‹ Verapedia", "vn-brod") + "<h2>" + esc(a.titel) + "</h2>" + wikiTekst(a.tekst) +
          "<div class='vn-lille'>Se også: " + Object.keys(NET_WIKI).filter(function (k) { return k !== p.sti; }).slice(0, 4).map(function (k) { return lnk("wiki.vera/" + k, esc(NET_WIKI[k].titel)); }).join(" · ") + "</div></div>";
        return "<div class='vn-pg vn-wiki'><h2>📖 Verapedia</h2><p>Opslagsværket om alt på HELLO VERA.</p>" +
          "<form class='vn-sf' data-vnsoegform><input name='q' placeholder='Søg i Verapedia …' autocomplete='off'><button>🔎</button></form>" +
          "<ul class='vn-liste'>" + Object.keys(NET_WIKI).sort().map(function (k) { return "<li>" + lnk("wiki.vera/" + k, esc(NET_WIKI[k].titel)) + "</li>"; }).join("") + "</ul></div>";
      } },
    "opskrift.vera": { titel: "Hotelkøkkenet", ik: "🍳", farve: "#e08a1e", om: "Opskrifter fra hotellets køkken", ord: "opskrift mad bage kage",
      vis: function (p) {
        const o = NET_OPSKRIFTER[p.sti];
        if (o) {
          const pers = netPortioner[p.sti] || o.til, f = pers / o.til;
          return "<div class='vn-pg vn-ops'>" + lnk("opskrift.vera", "‹ Alle opskrifter", "vn-brod") + "<div class='vn-ops-top'><span>" + o.ik + "</span><b>" + esc(o.titel) + "</b><small>⏱ " + o.tid + "</small></div>" +
            "<div class='vn-pers'><button data-vnpers='-1'>−</button><span>" + pers + " " + (o.til >= 8 ? "stk." : "pers.") + "</span><button data-vnpers='1'>+</button></div>" +
            "<h4>Det skal du bruge <small>(tryk for at krydse af)</small></h4><ul class='vn-ingr'>" + o.ingr.map(function (x, i) {
              let m = x[0] * f; m = !x[1] || x[1] === "skiver" ? Math.max(1, Math.round(m)) : m >= 10 ? Math.round(m) : Math.round(m * 4) / 4;
              return "<li data-vningr='" + i + "' class='" + (netAfkrydset[p.sti + i] ? "af" : "") + "'>" + String(m).replace(".", ",") + " " + x[1] + " " + esc(x[2]) + "</li>";
            }).join("") + "</ul><h4>Sådan gør du</h4><ol>" + o.trin.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></div>";
        }
        return "<div class='vn-pg vn-ops'><h2>🍳 Hotelkøkkenet</h2><p>Kokkens bedste opskrifter.</p><div class='vn-ops-grid'>" + Object.keys(NET_OPSKRIFTER).map(function (k) {
          const x = NET_OPSKRIFTER[k]; return lnk("opskrift.vera/" + k, "<span>" + x.ik + "</span><b>" + esc(x.titel) + "</b><small>⏱ " + x.tid + "</small>", "vn-ops-kort");
        }).join("") + "</div></div>";
      } },
    "vits.vera": { titel: "Grineren", ik: "😂", farve: "#f5b821", om: "Sjove vittigheder", ord: "vits vitser joke sjov grine",
      vis: function () {
        const v = vitsNr(netVitsNr), likes = netData().vitsLike || {};
        return "<div class='vn-pg vn-vits'><h2>😂 Grineren</h2><div class='vn-vitskort'><b>" + esc(v.q) + "</b>" + (netVitsSvar ? "<p>" + esc(v.a) + "</p>" : "<button data-vnvitssvar>Vis svaret 👀</button>") + "</div>" +
          "<div class='vn-vitsknap'><button data-vnvitslike class='" + (likes[netVitsNr] ? "liker" : "") + "'>" + (likes[netVitsNr] ? "❤️ Sjov!" : "🤍 Sjov?") + "</button><button data-vnvitsny>🎲 Ny vits</button></div>" +
          "<p class='vn-lille'>Vits " + (netVitsNr % NET_VITSER.length + 1) + " af " + NET_VITSER.length + " · Du synes " + Object.keys(likes).length + " er sjove</p></div>";
      } },
    "quiz.vera": { titel: "Hotel-quiz", ik: "❓", farve: "#8152e0", om: "Hvor meget ved du om hotellet?", ord: "quiz spørgsmål",
      vis: function () {
        const z = netQuiz, rek = (netData().quiz || 0);
        if (!z) return "<div class='vn-pg vn-quiz'><h2>❓ Hotel-quiz</h2><p>8 spørgsmål om hotellet og verden. Hvor mange kan du?</p><p>🏆 Din rekord: <b>" + rek + " / 8</b></p><button class='vn-stor' data-vnquizstart>Start quizzen</button></div>";
        if (z.nr >= z.sp.length) return "<div class='vn-pg vn-quiz'><h2>" + (z.rigtige >= 7 ? "🏆 Fantastisk!" : z.rigtige >= 4 ? "👏 Godt klaret!" : "🙂 Godt forsøgt!") + "</h2><div class='vn-quizres'>" + z.rigtige + " / " + z.sp.length + "</div><p>🏆 Din rekord: <b>" + rek + " / 8</b></p><button class='vn-stor' data-vnquizstart>Prøv igen</button></div>";
        const s = NET_QUIZ[z.sp[z.nr]];
        return "<div class='vn-pg vn-quiz'><div class='vn-quiztop'><span>Spørgsmål " + (z.nr + 1) + " af " + z.sp.length + "</span><span>✅ " + z.rigtige + "</span></div><h3>" + esc(s[0]) + "</h3><div class='vn-svar'>" +
          s[1].map(function (t, i) { return "<button data-vnsvar='" + i + "' class='" + (z.valgt == null ? "" : i === s[2] ? "rigtig" : i === z.valgt ? "forkert" : "") + "'>" + esc(t) + "</button>"; }).join("") + "</div>" +
          (z.valgt != null ? "<button class='vn-stor' data-vnquiznaeste>" + (z.nr + 1 < z.sp.length ? "Næste ›" : "Se resultatet") + "</button>" : "") + "</div>";
      } },
    "regn.vera": { titel: "Lommeregner", ik: "🧮", farve: "#4c515a", om: "Regn ud", ord: "lommeregner regne matematik plus minus",
      vis: function () {
        return "<div class='vn-pg vn-regn'><div class='vn-display'>" + esc(netRegn.vis) + "</div><div class='vn-taster'>" +
          ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ",", "="].map(function (t) { return "<button data-vnregn='" + t + "' class='" + ("÷×−+=".indexOf(t) >= 0 ? "op" : "C±%".indexOf(t) >= 0 ? "fn" : "") + (t === "0" ? " nul" : "") + "'>" + t + "</button>"; }).join("") + "</div></div>";
      } },
    "ur.vera": { titel: "Ur & stopur", ik: "⏱", farve: "#1f8f5a", om: "Klokken, stopur og nedtælling", ord: "ur tid stopur timer nedtælling",
      vis: function () {
        return "<div class='vn-pg vn-ur'><div class='vn-klok' data-vnklok>" + kl() + "</div><div class='vn-lille' style='text-align:center'>" + esc(dato()) + "</div>" +
          "<h4>⏱ Stopur</h4><div class='vn-stop' data-vnstopvis>" + stopTekst(stopTid()) + "</div><div class='vn-knapper'><button data-vnstop>" + (netStop.koerer ? "Stop" : "Start") + "</button><button data-vnstopnul>Nulstil</button></div>" +
          "<h4>⏲ Nedtælling</h4><div class='vn-stop' data-vnnedvis>" + nedTekst() + "</div><div class='vn-knapper'>" + [1, 3, 5, 10].map(function (m) { return "<button data-vnned='" + m + "'>" + m + " min</button>"; }).join("") + "<button data-vnned='0'>Stop</button></div></div>";
      } },
    "tegn.vera": { titel: "Tegnebræt", ik: "🎨", farve: "#e0447e", om: "Tegn med fingeren eller musen", ord: "tegne tegning male",
      vis: function () {
        return "<div class='vn-pg vn-tegn'><canvas width='520' height='520' data-vncanvas></canvas><div class='vn-farver'>" +
          ["#1c1c1e", "#e0445a", "#f5b821", "#34c759", "#2a6fd6", "#8152e0", "#ff8fb8", "#8a5a2b", "#ffffff"].map(function (c) { return "<button data-vnfarve='" + c + "' style='background:" + c + "' class='" + (netPen.farve === c ? "valgt" : "") + "'></button>"; }).join("") +
          "</div><div class='vn-knapper'>" + [3, 7, 14].map(function (s) { return "<button data-vnpen='" + s + "' class='" + (netPen.str === s ? "valgt" : "") + "'>" + (s === 3 ? "Tynd" : s === 7 ? "Mellem" : "Tyk") + "</button>"; }).join("") + "<button data-vnryd>🗑 Ryd</button></div></div>";
      }, efter: function (el) { bindTegn(el.querySelector("[data-vncanvas]")); } },
    "horoskop.vera": { titel: "Dagens horoskop", ik: "🔮", farve: "#6a3fd0", om: "Hvad siger stjernerne i dag?", ord: "horoskop stjernetegn stjerner",
      vis: function (p) {
        const i = NET_TEGN.findIndex(function (t) { return t[1].toLowerCase() === p.sti; });
        if (i < 0) return "<div class='vn-pg vn-horo'><h2>🔮 Dagens horoskop</h2><p>Vælg dit stjernetegn:</p><div class='vn-tegngrid'>" + NET_TEGN.map(function (t) { return lnk("horoskop.vera/" + t[1].toLowerCase(), "<span>" + t[0] + "</span>" + t[1]); }).join("") + "</div></div>";
        const r = rngFra(dagNoegle() + NET_TEGN[i][1]);
        const a = ["I dag er en god dag til at", "Stjernerne siger, at du skal", "Det er tid til at", "Måske er det i dag, du skal"][Math.floor(r() * 4)];
        const b = ["sige hej til en ny gæst", "bygge noget flot i dit værelse", "drikke en kakao i caféen", "sende en sød mail til en ven", "spille Stjernestribe", "danse i hallen", "skrive en note om dine drømme", "tage et billede med kameraet"][Math.floor(r() * 8)];
        const c = ["En overraskelse venter måske i elevatoren.", "Nogen tænker på dig lige nu.", "Dine Glimt bliver brugt klogt.", "Et grin er på vej.", "Hold øje med Peep i aften."][Math.floor(r() * 5)];
        const farver = ["rød", "blå", "grøn", "lilla", "gul", "lyserød", "orange", "guld"];
        return "<div class='vn-pg vn-horo'>" + lnk("horoskop.vera", "‹ Alle tegn", "vn-brod") + "<div class='vn-horotop'><span>" + NET_TEGN[i][0] + "</span><b>" + NET_TEGN[i][1] + "</b><small>" + esc(dato()) + "</small></div>" +
          "<p>" + a + " " + b + ". " + c + "</p><div class='vn-lykke'><span>🍀 Lykketal <b>" + (1 + Math.floor(r() * 99)) + "</b></span><span>🎨 Farve <b>" + farver[Math.floor(r() * farver.length)] + "</b></span><span>⭐ Humør <b>" + "★★★★★".slice(0, 3 + Math.floor(r() * 3)) + "</b></span></div></div>";
      } },
  };
  let netPortioner = {}, netAfkrydset = {}, netVitsNr = froe(dagNoegle()) % NET_VITSER.length, netVitsSvar = false, netQuiz = null;
  let netRegn = { vis: "0", a: null, op: null, ny: true };
  let netStop = { koerer: false, start: 0, gemt: 0 }, netNed = { slut: 0 }, netPen = { farve: "#1c1c1e", str: 7 }, netTegning = null;
  function stopTid() { return netStop.gemt + (netStop.koerer ? Date.now() - netStop.start : 0); }
  function stopTekst(ms) { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, h = Math.floor(ms / 10) % 100; return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2) + "," + ("0" + h).slice(-2); }
  function nedTekst() { if (!netNed.slut) return "--:--"; const ms = Math.max(0, netNed.slut - Date.now()); return ("0" + Math.floor(ms / 60000)).slice(-2) + ":" + ("0" + Math.ceil(ms / 1000) % 60).slice(-2).replace("60", "00"); }
  setInterval(function () {
    if (netNed.slut && Date.now() >= netNed.slut) { netNed.slut = 0; ding(); setTimeout(ding, 450); lille("⏲ Nedtællingen er slut!"); }
    if (appNu !== "net" || !appEl) return;
    const k = appEl.querySelector("[data-vnklok]"), s = appEl.querySelector("[data-vnstopvis]"), n = appEl.querySelector("[data-vnnedvis]");
    if (k) k.textContent = kl();
    if (s) s.textContent = stopTekst(stopTid());
    if (n) n.textContent = nedTekst();
  }, 60);
  function bindTegn(c) {
    if (!c) return;
    const g = c.getContext("2d");
    if (netTegning) { const b = new Image(); b.onload = function () { g.drawImage(b, 0, 0); }; b.src = netTegning; }
    else { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); }
    let sidst = null;
    function pkt(e) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * c.width, y: (e.clientY - r.top) / r.height * c.height }; }
    c.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); try { c.setPointerCapture(e.pointerId); } catch (x) {} sidst = pkt(e); g.fillStyle = netPen.farve; g.beginPath(); g.arc(sidst.x, sidst.y, netPen.str, 0, Math.PI * 2); g.fill(); });
    c.addEventListener("pointermove", function (e) {
      if (!sidst) return; e.stopPropagation();
      const p = pkt(e); g.strokeStyle = netPen.farve; g.lineWidth = netPen.str * 2; g.lineCap = "round"; g.beginPath(); g.moveTo(sidst.x, sidst.y); g.lineTo(p.x, p.y); g.stroke(); sidst = p;
    });
    const slut = function () { if (sidst) { sidst = null; try { netTegning = c.toDataURL(); } catch (x) {} } };
    c.addEventListener("pointerup", slut); c.addEventListener("pointercancel", slut);
  }
  function regnTryk(t) {
    const R = netRegn, tal = function () { return parseFloat(R.vis.replace(",", ".")) || 0; };
    const regn = function (a, op, b) { return op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : op === "÷" ? (b === 0 ? NaN : a / b) : b; };
    const vis = function (v) { if (!isFinite(v)) return "Fejl"; return String(+v.toPrecision(10)).replace(".", ","); };
    if (/[0-9]/.test(t)) { R.vis = R.ny || R.vis === "0" ? t : (R.vis.length < 12 ? R.vis + t : R.vis); R.ny = false; }
    else if (t === ",") { if (R.ny) { R.vis = "0,"; R.ny = false; } else if (R.vis.indexOf(",") < 0) R.vis += ","; }
    else if (t === "C") { netRegn = { vis: "0", a: null, op: null, ny: true }; }
    else if (t === "±") { R.vis = vis(-tal()); }
    else if (t === "%") { R.vis = vis(tal() / 100); }
    else if (t === "=") { if (R.op) { R.vis = vis(regn(R.a, R.op, tal())); R.a = null; R.op = null; R.ny = true; } }
    else { if (R.op && !R.ny) R.vis = vis(regn(R.a, R.op, tal())); R.a = tal(); R.op = t; R.ny = true; }
  }

  // ----- forsiden man selv designer -----
  let netDesigner = false;
  function favIkon(u) { const s = netSide(u); return "<span class='vn-favik' style='background:" + s.farve + "'>" + s.ik + "</span>"; }
  function netForsideHtml() {
    const d = netData(), F = d.forside;
    const h = new Date().getHours(), hilsen = h < 5 ? "God nat" : h < 10 ? "Godmorgen" : h < 18 ? "Goddag" : "Godaften";
    const w = {
      soeg: function () { return "<form class='vn-sf stor' data-vnsoegform><input name='q' placeholder='Søg eller skriv en adresse' autocomplete='off'><button>🔎</button></form>"; },
      fav: function () {
        return "<div class='vn-w'><div class='vn-wt'>⭐ Favoritter</div><div class='vn-favgrid " + F.form + "'>" + d.fav.map(function (f, i) {
          return "<span class='vn-fav'>" + lnk(f.url, favIkon(f.url) + "<small>" + esc(f.titel) + "</small>") + (netDesigner ? "<button class='vn-favx' data-vnfavslet='" + i + "'>✕</button>" : "") + "</span>";
        }).join("") + (d.fav.length ? "" : "<div class='vn-lille'>Ingen favoritter endnu. Tryk ⋯ → Tilføj til favoritter på en side.</div>") + "</div></div>";
      },
      ur: function () { return "<div class='vn-w vn-wur'><b data-vnklok>" + kl() + "</b><span>" + esc(dato()) + "</span></div>"; },
      vejr: function () { const v = vejrFor(new Date(), "hotel"); return "<div class='vn-w vn-wvejr' data-vnlink='vejr.vera'><span>" + v.ik + "</span><b>" + v.temp + "°</b><small>" + v.navn + "<br>på hotellet</small></div>"; },
      nyt: function () { return "<div class='vn-w'><div class='vn-wt'>📰 Nyheder</div>" + nyhedListe().slice(0, 2).map(function (n) { return "<div class='vn-wnyt' data-vnlink='nyt.vera'>" + esc(n.titel) + "</div>"; }).join("") + "</div>"; },
      vits: function () { const v = dagensVits(); return "<div class='vn-w vn-wvits' data-vnlink='vits.vera'><div class='vn-wt'>😂 Dagens vits</div><b>" + esc(v.q) + "</b><small>" + esc(v.a) + "</small></div>"; },
      seneste: function () { return "<div class='vn-w'><div class='vn-wt'>🕘 Seneste besøg</div>" + (d.seneste.slice(0, 3).map(function (s) { return "<div class='vn-wnyt' data-vnlink='" + esc(s.url) + "'>" + esc(s.titel) + "</div>"; }).join("") || "<div class='vn-lille'>Ingen endnu</div>") + "</div>"; },
      bogm: function () { return "<div class='vn-w'><div class='vn-wt'>🔖 Bogmærker</div>" + (d.bogm.slice(0, 4).map(function (s) { return "<div class='vn-wnyt' data-vnlink='" + esc(s.url) + "'>" + esc(s.titel) + "</div>"; }).join("") || "<div class='vn-lille'>Ingen endnu – tryk ☆ på en side</div>") + "</div>"; },
    };
    if (netNyheder === null) hentNetNyheder().then(function () { if (appNu === "net" && netUrl() === "vera.net" && !netDesigner) netTegnSide(); });
    return "<div class='vn-forside" + (F.moerk ? " moerk" : "") + "' style='background:" + (NET_BG[F.bg] || NET_BG.himmel) + "'>" +
      "<div class='vn-fhoved'><span class='vn-femoji'>" + esc(F.emoji) + "</span><b>" + esc(F.titel) + "</b><small>" + hilsen + ", " + esc(mig()) + "!</small></div>" +
      F.widgets.filter(function (k) { return w[k]; }).map(function (k) { return w[k](); }).join("") +
      (netDesigner ? netDesignHtml() : "<button class='vn-designknap' data-vndesign>✏️ Design din forside</button>") + "</div>";
  }
  function netDesignHtml() {
    const F = netData().forside;
    return "<div class='vn-design'><div class='vn-wt'>✏️ Design din forside</div>" +
      "<label>Navn på forsiden<input data-vnftitel maxlength='24' value='" + esc(F.titel) + "'></label>" +
      "<div class='vn-dt'>Ikon</div><div class='vn-emojier'>" + NET_EMOJI.map(function (e) { return "<button data-vnfemoji='" + e + "' class='" + (F.emoji === e ? "valgt" : "") + "'>" + e + "</button>"; }).join("") + "</div>" +
      "<div class='vn-dt'>Baggrund</div><div class='vn-bgvalg'>" + Object.keys(NET_BG).map(function (k) { return "<button data-vnfbg='" + k + "' style='background:" + NET_BG[k] + "' class='" + (F.bg === k ? "valgt" : "") + "'></button>"; }).join("") + "</div>" +
      "<div class='vn-dt'>Tekst og favoritter</div><div class='vn-knapper'><button data-vnfmoerk='0' class='" + (!F.moerk ? "valgt" : "") + "'>Hvid tekst</button><button data-vnfmoerk='1' class='" + (F.moerk ? "valgt" : "") + "'>Mørk tekst</button></div>" +
      "<div class='vn-knapper'><button data-vnfform='rund' class='" + (F.form === "rund" ? "valgt" : "") + "'>● Runde</button><button data-vnfform='firkant' class='" + (F.form === "firkant" ? "valgt" : "") + "'>■ Firkantede</button></div>" +
      "<div class='vn-dt'>Det skal være på forsiden <small>(↑↓ flytter)</small></div><ul class='vn-wvalg'>" +
      F.widgets.concat(Object.keys(NET_WIDGETS).filter(function (k) { return F.widgets.indexOf(k) < 0; })).map(function (k) {
        const til = F.widgets.indexOf(k) >= 0;
        return "<li class='" + (til ? "til" : "") + "'><button class='vn-tjek' data-vnwtil='" + k + "'>" + (til ? "✓" : "") + "</button><span>" + NET_WIDGETS[k] + "</span>" +
          (til ? "<button data-vnwop='" + k + "'>↑</button><button data-vnwned='" + k + "'>↓</button>" : "") + "</li>";
      }).join("") + "</ul>" +
      "<div class='vn-dt'>Tilføj en favorit</div><form class='vn-sf' data-vnfavform><input name='u' placeholder='fx vits.vera' autocomplete='off'><button>＋</button></form>" +
      "<button class='vn-stor' data-vndesignfaerdig>✓ Færdig</button></div>";
  }

  // ----- browserens skal: adressefelt, faner, menuer -----
  let netPanel = null, netPanelFane = "fav";
  function tegnNet() {
    netData();
    netPanel = null; netDesigner = false;
    appEl.classList.add("vn-app");
    appEl.innerHTML = "<div class='vn-top'><button class='tlf-tb' data-tilbage='hjem' title='Hjem'>" + ik("tilbage", 18) + "</button>" +
      "<form class='vn-adr' data-vnadrform><span class='vn-laas'>🔒</span><input data-vnadr autocomplete='off' spellcheck='false'></form>" +
      "<button class='vn-ikon' data-vnreload title='Genindlæs'>↻</button></div><div class='vn-load'></div><div class='vn-forslag' hidden></div>" +
      "<div class='vn-side'></div><div class='vn-panel' hidden></div>" +
      "<div class='vn-bund'><button data-vntilb title='Tilbage'>‹</button><button data-vnfrem title='Frem'>›</button><button data-vnbogm title='Bogmærke'>☆</button>" +
      "<button data-vnpanel title='Bogmærker, favoritter og seneste'>📚</button><button data-vnfaner title='Faner'><span class='vn-antalfaner'>1</span></button><button data-vnmenu title='Mere'>⋯</button></div>";
    appEl.addEventListener("click", netKlik);
    appEl.addEventListener("submit", netSubmit);
    appEl.addEventListener("input", netInput);
    appEl.addEventListener("focusin", function (e) { if (e.target.matches("[data-vnadr]")) { e.target.value = netUrl(); e.target.select(); visForslag(""); } });
    appEl.addEventListener("focusout", function (e) { if (e.target.matches("[data-vnadr]")) setTimeout(function () { if (!appEl) return; const f = appEl.querySelector(".vn-forslag"); if (f) f.hidden = true; netOpdaterBar(); }, 180); });
    netTegnSide();
  }
  function netOpdaterBar() {
    if (!appEl || appNu !== "net") return;
    const d = netData(), f = netFane(), u = netUrl(f), s = netSide(u);
    const a = appEl.querySelector("[data-vnadr]");
    if (a && document.activeElement !== a) a.value = u === "vera.net" ? "" : u;
    if (a) a.placeholder = "Søg eller skriv en adresse";
    appEl.querySelector("[data-vntilb]").disabled = f.pos <= 0;
    appEl.querySelector("[data-vnfrem]").disabled = f.pos >= f.hist.length - 1;
    const bm = d.bogm.some(function (b) { return b.url === u; });
    const bk = appEl.querySelector("[data-vnbogm]"); bk.textContent = bm ? "★" : "☆"; bk.classList.toggle("til", bm);
    appEl.querySelector(".vn-antalfaner").textContent = d.faner.length;
    appEl.classList.toggle("vn-privat", !!f.privat);
    appEl.querySelector(".vn-laas").textContent = f.privat ? "🕶" : s.ik;
  }
  function netTegnSide(stille) {
    if (!appEl || appNu !== "net") return;
    const el = appEl.querySelector(".vn-side");
    if (!el) return;
    const u = netUrl(), p = netDel(u), S = NET_SIDER[p.domaene];
    el.innerHTML = S ? S.vis(p) : "<div class='vn-pg vn-404'><span>🤷</span><h2>Siden findes ikke</h2><p>Vera-Net kunne ikke finde <b>" + esc(u) + "</b>.</p>" +
      "<button class='vn-stor' data-vnlink='soeg.vera?q=" + esc(encodeURIComponent(p.domaene.replace(/\..*$/, ""))) + "'>🔎 Søg efter den i stedet</button><p class='vn-lille'>Prøv " + lnk("hotel.vera", "hotel.vera") + " eller " + lnk("vera.net", "din forside") + ".</p></div>";
    if (S && S.efter) S.efter(el, p);
    if (!stille) {
      el.scrollTop = 0;
      const ld = appEl.querySelector(".vn-load"); ld.classList.remove("koer"); void ld.offsetWidth; ld.classList.add("koer");
    }
    netOpdaterBar();
  }
  function netGaaTil(u, nyFane) {
    u = netRens(u);
    const d = netData();
    if (nyFane) { const f = { id: Date.now(), hist: [u], pos: 0 }; d.faner.push(f); d.aktiv = f.id; }
    else {
      const f = netFane();
      if (f.hist[f.pos] !== u) { f.hist = f.hist.slice(0, f.pos + 1); f.hist.push(u); if (f.hist.length > 30) f.hist.shift(); f.pos = f.hist.length - 1; }
    }
    if (u.indexOf("soeg.vera") !== 0 || u.indexOf("?") > 0) netSenest(u);
    netDesigner = false; lukNetPanel();
    if (u === "vera.net") netVitsSvar = false;
    gemNet();
    netTegnSide();
  }
  function netSenest(u) {
    if (netFane().privat || u === "vera.net") return;
    const d = netData();
    d.seneste = d.seneste.filter(function (s) { return s.url !== u; });
    d.seneste.unshift({ url: u, titel: netSide(u).titel, tid: Date.now() });
    d.seneste = d.seneste.slice(0, 60);
  }
  function netAdresse(t) {
    t = String(t || "").trim();
    if (!t) return "vera.net";
    const r = netRens(t);
    if (/^[a-zæøå0-9-]+\.[a-z]+(\/.*)?(\?.*)?$/.test(r) && r.indexOf(" ") < 0) return r;
    return "soeg.vera?q=" + encodeURIComponent(t);
  }
  function visForslag(t) {
    const f = appEl.querySelector(".vn-forslag"), d = netData();
    t = t.trim().toLowerCase();
    const set = {}, l = [];
    function add(url, titel, ik2) { if (set[url] || l.length >= 6) return; set[url] = 1; l.push([url, titel, ik2]); }
    if (t) {
      d.bogm.forEach(function (b) { if ((b.url + b.titel).toLowerCase().indexOf(t) >= 0) add(b.url, b.titel, "🔖"); });
      d.seneste.forEach(function (s) { if ((s.url + s.titel).toLowerCase().indexOf(t) >= 0) add(s.url, s.titel, "🕘"); });
      Object.keys(NET_SIDER).forEach(function (k) { if (k !== "soeg.vera" && (k + NET_SIDER[k].titel).toLowerCase().indexOf(t) >= 0) add(k, NET_SIDER[k].titel, NET_SIDER[k].ik); });
      netSoeg(t).slice(0, 4).forEach(function (x) { add(x.url, x.titel, netSide(x.url).ik); });
    } else d.fav.slice(0, 6).forEach(function (x) { add(x.url, x.titel, "⭐"); });
    f.innerHTML = (t ? "<button data-vnlink='" + esc("soeg.vera?q=" + encodeURIComponent(t)) + "'><span>🔎</span><b>Søg efter \"" + esc(t) + "\"</b></button>" : "") +
      l.map(function (x) { return "<button data-vnlink='" + esc(x[0]) + "'><span>" + x[2] + "</span><b>" + esc(x[1]) + "</b><small>" + esc(x[0]) + "</small></button>"; }).join("");
    f.hidden = !f.innerHTML;
  }
  function netInput(e) {
    const t = e.target;
    if (t.matches("[data-vnadr]")) { visForslag(t.value); return; }
    if (t.matches("[data-vnftitel]")) { netData().forside.titel = t.value.slice(0, 24) || "Min forside"; gemNet(); const b = appEl.querySelector(".vn-fhoved b"); if (b) b.textContent = netData().forside.titel; }
  }
  function netSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (f.matches("[data-vnadrform]")) { const a = f.querySelector("input"); a.blur(); netGaaTil(netAdresse(a.value)); return; }
    if (f.matches("[data-vnsoegform]")) {
      const q = f.querySelector("input").value.trim();
      if (!q) return;
      const ad = netAdresse(q);
      netGaaTil(netUrl().indexOf("wiki.vera") === 0 && ad.indexOf("soeg.vera") === 0 ? "soeg.vera?q=" + encodeURIComponent(q + " wiki") : ad);
      return;
    }
    if (f.matches("[data-vnfavform]")) {
      const v = f.querySelector("input").value.trim(); if (!v) return;
      const u = netAdresse(v), d = netData();
      if (!d.fav.some(function (x) { return x.url === u; })) d.fav.push({ url: u, titel: netSide(u).titel });
      gemNet(); netTegnSide(true); lille("⭐ Lagt på forsiden");
    }
  }
  function lukNetPanel() { netPanel = null; if (appEl) { const p = appEl.querySelector(".vn-panel"); if (p) p.hidden = true; } }
  function visNetPanel(slags) {
    netPanel = slags;
    const p = appEl.querySelector(".vn-panel"), d = netData(), u = netUrl();
    p.hidden = false;
    if (slags === "menu") {
      const fav = d.fav.some(function (x) { return x.url === u; }), bm = d.bogm.some(function (x) { return x.url === u; });
      p.innerHTML = "<div class='vn-ark'><div class='vn-arktop'><b>" + esc(netSide(u).titel) + "</b><small>" + esc(u) + "</small></div>" +
        "<button data-vnm='fav'>" + (fav ? "⭐ Fjern fra favoritter" : "⭐ Tilføj til favoritter") + "</button>" +
        "<button data-vnm='bogm'>" + (bm ? "🔖 Fjern bogmærke" : "🔖 Tilføj bogmærke") + "</button>" +
        "<button data-vnm='nyfane'>➕ Ny fane</button><button data-vnm='privat'>🕶 Ny privat fane <small>(huskes ikke)</small></button>" +
        "<button data-vnm='forside'>🏠 Gå til forsiden</button><button data-vnm='design'>✏️ Design din forside</button>" +
        "<button class='luk' data-vnluk>Luk</button></div>";
      return;
    }
    if (slags === "faner") {
      p.innerHTML = "<div class='vn-fanevis'><div class='vn-arktop'><b>" + d.faner.length + " fane" + (d.faner.length === 1 ? "" : "r") + "</b></div><div class='vn-fanegrid'>" +
        d.faner.map(function (f) {
          const fu = netUrl(f), s = netSide(fu);
          return "<div class='vn-fanekort" + (f.id === d.aktiv ? " aktiv" : "") + (f.privat ? " privat" : "") + "' data-vnfane='" + f.id + "'><div class='vn-fkop' style='background:" + s.farve + "'><span>" + (f.privat ? "🕶" : s.ik) + "</span>" + esc(s.titel) + "</div>" +
            "<div class='vn-fkrop'><span>" + s.ik + "</span><small>" + esc(fu) + "</small></div><button class='vn-fx' data-vnfaneluk='" + f.id + "'>✕</button></div>";
        }).join("") + "</div><div class='vn-fanebund'><button data-vnm='lukalle'>Luk alle</button><button class='plus' data-vnm='nyfane'>＋</button><button data-vnluk>Færdig</button></div></div>";
      return;
    }
    // bogmærker / favoritter / seneste
    const faner = [["fav", "⭐ Favoritter"], ["bogm", "🔖 Bogmærker"], ["seneste", "🕘 Seneste"]];
    const liste = netPanelFane === "fav" ? d.fav : netPanelFane === "bogm" ? d.bogm : d.seneste;
    p.innerHTML = "<div class='vn-ark hoej'><div class='ab-faner'>" + faner.map(function (f) { return "<button data-vnpf='" + f[0] + "' class='" + (netPanelFane === f[0] ? "valgt" : "") + "'>" + f[1] + "</button>"; }).join("") + "</div>" +
      "<ul class='vn-plist'>" + (liste.length ? liste.map(function (x, i) {
        return "<li><span class='vn-pl' data-vnlink='" + esc(x.url) + "'>" + favIkon(x.url) + "<span><b>" + esc(x.titel) + "</b><small>" + esc(x.url) + (x.tid ? " · " + esc(naarTekst(x.tid)) : "") + "</small></span></span>" +
          (netPanelFane === "fav" ? "<button data-vnflyt='" + i + "' title='Flyt op'>↑</button>" : "") + "<button data-vnpslet='" + i + "' title='Slet'>✕</button></li>";
      }).join("") : "<li class='vn-tomt'>" + (netPanelFane === "fav" ? "Ingen favoritter. Brug ⋯ → Tilføj til favoritter." : netPanelFane === "bogm" ? "Ingen bogmærker. Tryk ☆ nederst på en side." : "Du har ikke besøgt nogen sider endnu.") + "</li>") + "</ul>" +
      (netPanelFane === "seneste" && liste.length ? "<button class='vn-rod' data-vnrydhist>🗑 Ryd seneste besøg</button>" : "") +
      "<button class='luk' data-vnluk>Luk</button></div>";
  }
  function netToggle(liste, u) {
    const d = netData(), l = d[liste], i = l.findIndex(function (x) { return x.url === u; });
    if (i >= 0) { l.splice(i, 1); lille(liste === "fav" ? "Fjernet fra favoritter" : "Bogmærket er fjernet"); }
    else { l.push({ url: u, titel: netSide(u).titel }); lille(liste === "fav" ? "⭐ Tilføjet til favoritter" : "🔖 Bogmærke gemt"); }
    gemNet();
  }
  function netKlik(e) {
    const t = e.target, d = netData();
    const L = t.closest("[data-vnlink]");
    if (L) { e.preventDefault(); netGaaTil(L.dataset.vnlink); return; }
    const a = t.closest("[data-vnapp]");
    if (a) { aabnApp(a.dataset.vnapp); return; }
    if (t.closest("[data-vntilb]")) { const f = netFane(); if (f.pos > 0) { f.pos--; gemNet(); netTegnSide(); } return; }
    if (t.closest("[data-vnfrem]")) { const f = netFane(); if (f.pos < f.hist.length - 1) { f.pos++; gemNet(); netTegnSide(); } return; }
    if (t.closest("[data-vnreload]")) { netNyhedHentet = 0; if (netUrl() === "nyt.vera") netNyheder = null; netTegnSide(); return; }
    if (t.closest("[data-vnbogm]")) { netToggle("bogm", netUrl()); netOpdaterBar(); if (netUrl() === "vera.net") netTegnSide(true); return; }
    if (t.closest("[data-vnpanel]")) { if (netPanel && netPanel !== "menu" && netPanel !== "faner") lukNetPanel(); else visNetPanel("liste"); return; }
    if (t.closest("[data-vnfaner]")) { if (netPanel === "faner") lukNetPanel(); else visNetPanel("faner"); return; }
    if (t.closest("[data-vnmenu]")) { if (netPanel === "menu") lukNetPanel(); else visNetPanel("menu"); return; }
    if (t.closest("[data-vnluk]") || t.classList.contains("vn-panel")) { lukNetPanel(); return; }
    const pf = t.closest("[data-vnpf]");
    if (pf) { netPanelFane = pf.dataset.vnpf; visNetPanel("liste"); return; }
    const ps = t.closest("[data-vnpslet]");
    if (ps) { const l = netPanelFane === "fav" ? d.fav : netPanelFane === "bogm" ? d.bogm : d.seneste; l.splice(+ps.dataset.vnpslet, 1); gemNet(); visNetPanel("liste"); netOpdaterBar(); if (netUrl() === "vera.net") netTegnSide(true); return; }
    const fl = t.closest("[data-vnflyt]");
    if (fl) { const i = +fl.dataset.vnflyt; if (i > 0) { const x = d.fav.splice(i, 1)[0]; d.fav.splice(i - 1, 0, x); gemNet(); visNetPanel("liste"); if (netUrl() === "vera.net") netTegnSide(true); } return; }
    if (t.closest("[data-vnrydhist]")) { d.seneste = []; gemNet(); visNetPanel("liste"); lille("🗑 Seneste besøg er ryddet"); return; }
    const m = t.closest("[data-vnm]");
    if (m) {
      const h = m.dataset.vnm;
      if (h === "fav" || h === "bogm") { netToggle(h, netUrl()); lukNetPanel(); netOpdaterBar(); if (netUrl() === "vera.net") netTegnSide(true); }
      if (h === "nyfane" || h === "privat") {
        if (d.faner.length >= 10) { lille("Du kan højst have 10 faner"); return; }
        const f = { id: Date.now(), hist: ["vera.net"], pos: 0 }; if (h === "privat") f.privat = true;
        d.faner.push(f); d.aktiv = f.id; gemNet(); lukNetPanel(); netTegnSide();
        if (h === "privat") lille("🕶 Privat fane – den husker ikke, hvor du har været");
      }
      if (h === "forside") netGaaTil("vera.net");
      if (h === "design") { netGaaTil("vera.net"); netDesigner = true; netTegnSide(true); const ds = appEl.querySelector(".vn-design"); if (ds) ds.scrollIntoView({ block: "start" }); }
      if (h === "lukalle") { d.faner = [{ id: Date.now(), hist: ["vera.net"], pos: 0 }]; d.aktiv = d.faner[0].id; gemNet(); lukNetPanel(); netTegnSide(); lille("Alle faner er lukket"); }
      return;
    }
    const fx = t.closest("[data-vnfaneluk]");
    if (fx) {
      d.faner = d.faner.filter(function (f) { return f.id !== +fx.dataset.vnfaneluk; });
      if (!d.faner.length) d.faner = [{ id: Date.now(), hist: ["vera.net"], pos: 0 }];
      if (!d.faner.some(function (f) { return f.id === d.aktiv; })) d.aktiv = d.faner[d.faner.length - 1].id;
      gemNet(); visNetPanel("faner"); netTegnSide(true); return;
    }
    const fk = t.closest("[data-vnfane]");
    if (fk) { d.aktiv = +fk.dataset.vnfane; gemNet(); lukNetPanel(); netDesigner = false; netTegnSide(); return; }
    // forsiden
    if (t.closest("[data-vndesign]")) { netDesigner = true; netTegnSide(true); const ds = appEl.querySelector(".vn-design"); if (ds) ds.scrollIntoView({ block: "start" }); return; }
    if (t.closest("[data-vndesignfaerdig]")) { netDesigner = false; gemNet(); netTegnSide(); lille("✨ Din forside er gemt"); return; }
    const F = d.forside, rediger = function () { gemNet(); const s = appEl.querySelector(".vn-side"), y = s.scrollTop; netTegnSide(true); s.scrollTop = y; };
    const fe = t.closest("[data-vnfemoji]"); if (fe) { F.emoji = fe.dataset.vnfemoji; rediger(); return; }
    const fb = t.closest("[data-vnfbg]"); if (fb) { F.bg = fb.dataset.vnfbg; rediger(); return; }
    const fm = t.closest("[data-vnfmoerk]"); if (fm) { F.moerk = fm.dataset.vnfmoerk === "1"; rediger(); return; }
    const ff = t.closest("[data-vnfform]"); if (ff) { F.form = ff.dataset.vnfform; rediger(); return; }
    const wt = t.closest("[data-vnwtil]");
    if (wt) { const k = wt.dataset.vnwtil, i = F.widgets.indexOf(k); if (i >= 0) F.widgets.splice(i, 1); else F.widgets.push(k); rediger(); return; }
    const wo = t.closest("[data-vnwop]"), wn = t.closest("[data-vnwned]");
    if (wo || wn) { const k = (wo || wn).dataset[wo ? "vnwop" : "vnwned"], i = F.widgets.indexOf(k), j = i + (wo ? -1 : 1); if (j >= 0 && j < F.widgets.length) { F.widgets.splice(i, 1); F.widgets.splice(j, 0, k); } rediger(); return; }
    const fs = t.closest("[data-vnfavslet]"); if (fs) { d.fav.splice(+fs.dataset.vnfavslet, 1); rediger(); return; }
    // sidernes egne knapper
    const pe = t.closest("[data-vnpers]");
    if (pe) { const id = netDel(netUrl()).sti, o = NET_OPSKRIFTER[id]; netPortioner[id] = Math.max(1, Math.min(o.til * 4, (netPortioner[id] || o.til) + (+pe.dataset.vnpers))); netTegnSide(true); return; }
    const ig = t.closest("[data-vningr]"); if (ig) { const k = netDel(netUrl()).sti + ig.dataset.vningr; netAfkrydset[k] = !netAfkrydset[k]; ig.classList.toggle("af", netAfkrydset[k]); return; }
    if (t.closest("[data-vnvitssvar]")) { netVitsSvar = true; netTegnSide(true); return; }
    if (t.closest("[data-vnvitsny]")) { let n; do { n = Math.floor(Math.random() * NET_VITSER.length); } while (n === netVitsNr && NET_VITSER.length > 1); netVitsNr = n; netVitsSvar = false; netTegnSide(true); return; }
    if (t.closest("[data-vnvitslike]")) { d.vitsLike = d.vitsLike || {}; if (d.vitsLike[netVitsNr]) delete d.vitsLike[netVitsNr]; else d.vitsLike[netVitsNr] = 1; gemNet(); netTegnSide(true); return; }
    if (t.closest("[data-vnquizstart]")) {
      const nr = NET_QUIZ.map(function (x, i) { return i; }).sort(function () { return Math.random() - 0.5; }).slice(0, 8);
      netQuiz = { sp: nr, nr: 0, rigtige: 0, valgt: null }; netTegnSide(true); return;
    }
    const sv = t.closest("[data-vnsvar]");
    if (sv && netQuiz && netQuiz.valgt == null) {
      netQuiz.valgt = +sv.dataset.vnsvar;
      if (netQuiz.valgt === NET_QUIZ[netQuiz.sp[netQuiz.nr]][2]) netQuiz.rigtige++;
      netTegnSide(true); return;
    }
    if (t.closest("[data-vnquiznaeste]") && netQuiz) {
      netQuiz.nr++; netQuiz.valgt = null;
      if (netQuiz.nr >= netQuiz.sp.length && netQuiz.rigtige > (d.quiz || 0)) { d.quiz = netQuiz.rigtige; gemNet(); lille("🏆 Ny rekord!"); }
      netTegnSide(true); return;
    }
    const rg = t.closest("[data-vnregn]"); if (rg) { regnTryk(rg.dataset.vnregn); const dv = appEl.querySelector(".vn-display"); if (dv) dv.textContent = netRegn.vis; return; }
    if (t.closest("[data-vnstop]")) { if (netStop.koerer) { netStop.gemt = stopTid(); netStop.koerer = false; } else { netStop.koerer = true; netStop.start = Date.now(); } netTegnSide(true); return; }
    if (t.closest("[data-vnstopnul]")) { netStop = { koerer: false, start: 0, gemt: 0 }; netTegnSide(true); return; }
    const nd = t.closest("[data-vnned]"); if (nd) { const m2 = +nd.dataset.vnned; netNed.slut = m2 ? Date.now() + m2 * 60000 : 0; if (m2) lille("⏲ Nedtælling: " + m2 + " min"); netTegnSide(true); return; }
    const pf2 = t.closest("[data-vnfarve]"); if (pf2) { netPen.farve = pf2.dataset.vnfarve; appEl.querySelectorAll("[data-vnfarve]").forEach(function (b) { b.classList.toggle("valgt", b === pf2); }); return; }
    const pn = t.closest("[data-vnpen]"); if (pn) { netPen.str = +pn.dataset.vnpen; appEl.querySelectorAll("[data-vnpen]").forEach(function (b) { b.classList.toggle("valgt", b === pn); }); return; }
    if (t.closest("[data-vnryd]")) { netTegning = null; netTegnSide(true); return; }
  }

  nyStil("telefon-stil-net", [
    ".tlf-app.vn-app { background: var(--t-hvid); }",
    ".vn-top { flex: none; display: flex; align-items: center; gap: 4px; padding: 44px 8px 7px; background: var(--t-topbg); border-bottom: 1px solid var(--t-linje); }",
    ".vn-app.vn-privat .vn-top, .vn-app.vn-privat .vn-bund { background: #2b2b33; color: #fff; } .vn-app.vn-privat .vn-adr { background: #444450; } .vn-app.vn-privat .vn-adr input { color: #fff; }",
    ".vn-app.vn-privat .vn-bund button { color: #b9c4ff; }",
    ".vn-adr { flex: 1; min-width: 0; display: flex; align-items: center; gap: 5px; background: var(--t-felt); border-radius: 11px; padding: 0 9px; height: 32px; }",
    ".vn-adr input { flex: 1; min-width: 0; border: 0; background: none; outline: 0; font: inherit; font-size: 13px; color: var(--t-tekst); text-align: center; user-select: text; -webkit-user-select: text; }",
    ".vn-adr input:focus { text-align: left; }",
    ".vn-laas { font-size: 12px; }",
    ".vn-ikon { border: 0; background: none; font-size: 18px; color: var(--t-acc); cursor: pointer; width: 28px; padding: 0; }",
    ".vn-load { flex: none; height: 2px; background: transparent; position: relative; overflow: hidden; }",
    ".vn-load.koer::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; background: var(--t-acc); animation: vnLoad .45s ease-out forwards; }",
    "@keyframes vnLoad { from { width: 0; opacity: 1 } 80% { width: 100%; opacity: 1 } to { width: 100%; opacity: 0 } }",
    ".vn-forslag { position: absolute; z-index: 6; left: 8px; right: 8px; top: 86px; background: var(--t-hvid); border-radius: 12px; box-shadow: 0 8px 24px var(--t-skygge2); overflow: hidden; }",
    ".vn-forslag button { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: none; padding: 8px 10px; text-align: left; font: inherit; color: var(--t-tekst); cursor: pointer; border-bottom: 1px solid var(--t-linje); }",
    ".vn-forslag button:hover { background: var(--t-felt); } .vn-forslag b { font-size: 13px; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .vn-forslag small { color: var(--t-graa); font-size: 10.5px; max-width: 42%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".vn-side { flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; position: relative; }",
    ".vn-side::-webkit-scrollbar { display: none; }",
    ".vn-bund { flex: none; display: flex; justify-content: space-around; align-items: center; padding: 6px 4px 22px; background: var(--t-topbg); border-top: 1px solid var(--t-linje); }",
    ".vn-bund button { border: 0; background: none; font-size: 22px; line-height: 1; color: var(--t-acc); cursor: pointer; width: 40px; height: 32px; padding: 0; font-family: inherit; }",
    ".vn-bund button:disabled { opacity: .3; cursor: default; } .vn-bund button.til { color: #f5b821; }",
    ".vn-bund [data-vnpanel] { font-size: 18px; }",
    ".vn-antalfaner { display: inline-grid; place-items: center; min-width: 18px; height: 18px; border: 2px solid currentColor; border-radius: 5px; font-size: 11px; font-weight: 700; }",
    ".vn-panel { position: absolute; z-index: 8; inset: 0; background: rgba(0,0,0,.28); display: flex; align-items: flex-end; }",
    ".vn-panel[hidden] { display: none; }",
    ".vn-ark { width: 100%; background: var(--t-lys); border-radius: 16px 16px 0 0; padding: 10px 10px 26px; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; animation: vnOp .25s ease-out; max-height: 78%; }",
    ".vn-ark.hoej { height: 72%; }",
    "@keyframes vnOp { from { transform: translateY(40%); opacity: 0 } to { transform: none; opacity: 1 } }",
    ".vn-arktop { text-align: center; padding: 2px 0 4px; } .vn-arktop b { display: block; font-size: 14px; } .vn-arktop small { color: var(--t-graa); font-size: 11px; }",
    ".vn-ark > button { border: 0; background: var(--t-hvid); border-radius: 11px; padding: 10px 12px; text-align: left; font: inherit; font-size: 14px; color: var(--t-tekst); cursor: pointer; }",
    ".vn-ark > button small { color: var(--t-graa); } .vn-ark > button:hover { background: var(--t-felt); }",
    ".vn-ark > button.luk { text-align: center; font-weight: 600; color: var(--t-acc); margin-top: 4px; }",
    ".vn-ark .ab-faner { margin: 0 0 4px; } .vn-ark .ab-faner button { font-size: 11px; white-space: nowrap; padding-left: 2px; padding-right: 2px; }",
    ".vn-plist { list-style: none; margin: 0; padding: 0; flex: 1; overflow-y: auto; background: var(--t-hvid); border-radius: 12px; scrollbar-width: none; }",
    ".vn-plist li { display: flex; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--t-linje); }",
    ".vn-plist .vn-pl { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; cursor: pointer; }",
    ".vn-plist .vn-pl > span:last-child { min-width: 0; } .vn-plist b { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .vn-plist small { display: block; color: var(--t-graa); font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".vn-plist li > button { border: 0; background: var(--t-felt); border-radius: 50%; width: 24px; height: 24px; flex: none; cursor: pointer; color: var(--t-graa); font-size: 11px; padding: 0; }",
    ".vn-plist .vn-tomt { color: var(--t-graa); font-size: 13px; padding: 20px 14px; text-align: center; display: block; }",
    ".vn-plist .vn-favik { width: 28px; height: 28px; font-size: 15px; }",
    ".vn-rod { border: 0; background: none; color: var(--t-rod); font: inherit; font-weight: 600; cursor: pointer; padding: 6px; }",
    ".vn-favik { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 23px; flex: none; box-shadow: 0 2px 5px rgba(0,0,0,.18); }",
    ".vn-favgrid.firkant .vn-favik { border-radius: 12px; }",
    // faneoversigt
    ".vn-fanevis { width: 100%; height: 100%; background: #2b2b33; display: flex; flex-direction: column; padding: 46px 10px 22px; box-sizing: border-box; animation: vnOp .25s ease-out; }",
    ".vn-fanevis .vn-arktop b { color: #fff; }",
    ".vn-fanegrid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-content: start; padding: 4px 2px; scrollbar-width: none; }",
    ".vn-fanekort { position: relative; background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; height: 150px; display: flex; flex-direction: column; box-shadow: 0 4px 10px rgba(0,0,0,.35); }",
    ".vn-fanekort.aktiv { outline: 3px solid #6aa8ff; } .vn-fanekort.privat .vn-fkrop { background: #3a3a44; color: #fff; }",
    ".vn-fkop { color: #fff; font-size: 10.5px; font-weight: 600; padding: 6px 24px 6px 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; gap: 4px; }",
    ".vn-fkrop { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #555; } .vn-fkrop span { font-size: 34px; } .vn-fkrop small { font-size: 10px; }",
    ".vn-fx { position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; border: 0; background: rgba(0,0,0,.35); color: #fff; font-size: 10px; cursor: pointer; padding: 0; }",
    ".vn-fanebund { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; }",
    ".vn-fanebund button { border: 0; background: none; color: #b9c4ff; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; } .vn-fanebund .plus { font-size: 26px; font-weight: 400; }",
    // sider generelt
    ".vn-pg { padding: 14px 14px 30px; font-size: 13.5px; line-height: 1.45; user-select: text; -webkit-user-select: text; }",
    ".vn-pg h2 { font-size: 20px; margin: 4px 0 8px; } .vn-pg h3 { font-size: 16px; margin: 10px 0; } .vn-pg h4 { font-size: 14px; margin: 14px 0 6px; } .vn-pg p { margin: 0 0 9px; }",
    ".vn-a { color: #1a5fd0; cursor: pointer; text-decoration: none; } .vn-a:hover { text-decoration: underline; }",
    ".vn-brod { display: inline-block; font-size: 12px; margin-bottom: 4px; }",
    ".vn-lille { font-size: 11.5px; color: var(--t-graa); margin-top: 10px; }",
    ".vn-stor { display: block; width: 100%; border: 0; border-radius: 12px; padding: 11px; background: var(--t-acc); color: var(--t-hvid); font: inherit; font-weight: 600; cursor: pointer; margin: 10px 0 6px; }",
    ".vn-knapper { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0; }",
    ".vn-knapper button { flex: 1; border: 0; border-radius: 10px; padding: 8px 6px; background: var(--t-felt); color: var(--t-tekst); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }",
    ".vn-knapper button.valgt { background: var(--t-acc); color: var(--t-hvid); }",
    ".vn-sf { display: flex; gap: 6px; margin: 8px 0 12px; } .vn-sf input { flex: 1; min-width: 0; border: 1px solid var(--t-linje); border-radius: 20px; padding: 8px 13px; font: inherit; outline: 0; background: var(--t-hvid); color: var(--t-tekst); user-select: text; }",
    ".vn-sf input:focus { border-color: var(--t-acc); } .vn-sf button { border: 0; border-radius: 50%; width: 34px; height: 34px; flex: none; background: var(--t-acc); color: #fff; cursor: pointer; font-size: 14px; padding: 0; }",
    ".vn-sf.stor input { padding: 11px 15px; font-size: 14px; box-shadow: 0 3px 10px rgba(0,0,0,.15); border: 0; } .vn-sf.stor button { width: 40px; height: 40px; }",
    // søgning
    ".vn-logo { text-align: center; font-size: 30px; font-weight: 800; letter-spacing: -1px; margin: 10px 0 4px; } .vn-logo span { color: var(--t-graa); font-weight: 400; font-size: 20px; letter-spacing: 0; }",
    ".vn-antal { color: var(--t-graa); font-size: 11.5px; margin-bottom: 6px; }",
    ".vn-res { padding: 8px 0 10px; border-bottom: 1px solid var(--t-linje); } .vn-res .vn-a { display: block; } .vn-res small { display: block; color: #1f8f5a; font-size: 11px; } .vn-res b { font-size: 15px; font-weight: 500; } .vn-res p { margin: 3px 0 0; font-size: 12.5px; color: #4a4a50; }",
    ".vn-intet, .vn-tips { text-align: center; color: var(--t-graa); padding: 18px 6px; font-size: 13px; }",
    // hotel.vera
    ".vn-hero { border-radius: 16px; color: #fff; text-align: center; padding: 18px 10px; margin-bottom: 12px; text-shadow: 0 1px 3px rgba(0,0,0,.3); } .vn-hero span { font-size: 40px; display: block; } .vn-hero b { font-size: 22px; display: block; letter-spacing: 1px; } .vn-hero small { font-size: 12px; }",
    ".vn-knapgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; } .vn-a.vn-k { display: block; background: var(--t-felt); border-radius: 10px; padding: 9px 8px; color: var(--t-tekst); font-weight: 600; font-size: 12.5px; text-align: center; }",
    // nyt
    ".vn-avis { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 900; text-align: center; border-bottom: 3px double #222; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px; } .vn-avis small { display: block; font: 11px -apple-system, 'Segoe UI', sans-serif; color: var(--t-graa); letter-spacing: 0; }",
    ".vn-artikel { padding: 8px 0 10px; border-bottom: 1px solid var(--t-linje); } .vn-artikel b { display: block; font-family: Georgia, serif; font-size: 15px; } .vn-artikel.stor b { font-size: 19px; } .vn-artikel p { margin: 3px 0 0; color: #444; font-size: 12.5px; white-space: pre-wrap; } .vn-artikel i { display: block; font-style: normal; font-size: 10.5px; color: #d6453a; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }",
    // vejr
    ".vn-vejr { background: linear-gradient(#6cbcff, #3a7fd6 70%); min-height: 100%; color: #fff; box-sizing: border-box; } .vn-vejr .vn-lille { color: #e6f1ff; }",
    ".vn-steder { display: flex; gap: 5px; justify-content: center; } .vn-steder .vn-a { color: #fff; background: rgba(255,255,255,.18); padding: 4px 10px; border-radius: 14px; font-size: 12px; } .vn-steder .vn-a.valgt { background: #fff; color: #2a6fd6; font-weight: 700; }",
    ".vn-nu { text-align: center; margin: 14px 0; } .vn-nu span { font-size: 60px; display: block; line-height: 1.1; } .vn-nu b { font-size: 50px; font-weight: 300; display: block; } .vn-nu small { font-size: 12.5px; }",
    ".vn-5 { display: grid; grid-template-columns: repeat(5, 1fr); background: rgba(255,255,255,.18); border-radius: 14px; padding: 8px 2px; text-align: center; font-size: 11.5px; }",
    ".vn-5 div { display: flex; flex-direction: column; gap: 3px; } .vn-5 b { font-size: 22px; font-weight: 400; } .vn-5 i { opacity: .7; font-style: normal; }",
    // wiki
    ".vn-wiki h2 { font-family: Georgia, serif; font-weight: 400; border-bottom: 1px solid var(--t-linje); padding-bottom: 4px; }",
    ".vn-liste { padding-left: 18px; margin: 0; } .vn-liste li { margin: 5px 0; }",
    // opskrift
    ".vn-ops-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }",
    ".vn-a.vn-ops-kort { display: flex; flex-direction: column; align-items: center; background: #fff4e3; border-radius: 14px; padding: 12px 6px; color: var(--t-tekst); text-align: center; } .vn-ops-kort span { font-size: 34px; } .vn-ops-kort b { font-size: 13px; } .vn-ops-kort small { color: var(--t-graa); font-size: 11px; }",
    ".vn-ops-top { text-align: center; background: #fff4e3; border-radius: 16px; padding: 12px; } .vn-ops-top span { font-size: 44px; display: block; } .vn-ops-top b { font-size: 19px; display: block; } .vn-ops-top small { color: var(--t-graa); }",
    ".vn-pers { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 10px 0 0; } .vn-pers button { width: 30px; height: 30px; border-radius: 50%; border: 0; background: #e08a1e; color: #fff; font-size: 18px; cursor: pointer; padding: 0; } .vn-pers span { font-weight: 700; min-width: 70px; text-align: center; }",
    ".vn-ingr { list-style: none; padding: 0; margin: 0; } .vn-ingr li { padding: 6px 8px 6px 30px; border-bottom: 1px dashed var(--t-linje); cursor: pointer; position: relative; }",
    ".vn-ingr li::before { content: ''; position: absolute; left: 6px; top: 7px; width: 14px; height: 14px; border-radius: 4px; border: 2px solid #e08a1e; } .vn-ingr li.af { text-decoration: line-through; color: var(--t-graa); } .vn-ingr li.af::before { background: #e08a1e; }",
    ".vn-ops ol { padding-left: 20px; margin: 0; } .vn-ops ol li { margin-bottom: 6px; } .vn-ops h4 small { color: var(--t-graa); font-weight: 400; font-size: 11px; }",
    // vits
    ".vn-vits { background: linear-gradient(#fff6c8, #ffe27a); min-height: 100%; box-sizing: border-box; text-align: center; }",
    ".vn-vitskort { background: #fff; border-radius: 18px; padding: 18px 14px; box-shadow: 0 4px 14px rgba(160,120,0,.25); margin: 10px 0; } .vn-vitskort b { font-size: 16px; display: block; } .vn-vitskort p { margin: 12px 0 0; font-size: 17px; color: #e0445a; font-weight: 700; animation: vnOp .3s; }",
    ".vn-vitskort button, .vn-vitsknap button { border: 0; border-radius: 20px; padding: 9px 16px; background: #f5b821; color: #3a2a00; font: inherit; font-weight: 700; cursor: pointer; margin-top: 12px; }",
    ".vn-vitsknap { display: flex; gap: 8px; justify-content: center; } .vn-vitsknap button { background: #fff; margin-top: 0; } .vn-vitsknap button.liker { background: #ffd6dd; }",
    // quiz
    ".vn-quiz { text-align: center; } .vn-quiztop { display: flex; justify-content: space-between; color: var(--t-graa); font-size: 12px; }",
    ".vn-svar { display: flex; flex-direction: column; gap: 7px; } .vn-svar button { border: 2px solid var(--t-linje); background: var(--t-hvid); border-radius: 12px; padding: 10px; font: inherit; font-weight: 600; cursor: pointer; color: var(--t-tekst); }",
    ".vn-svar button.rigtig { background: #d8f7df; border-color: #34c759; } .vn-svar button.forkert { background: #ffdcd9; border-color: #ff3b30; }",
    ".vn-quizres { font-size: 46px; font-weight: 800; color: #8152e0; margin: 10px 0; }",
    // lommeregner
    ".vn-regn { background: #1c1c1e; min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; }",
    ".vn-display { color: #fff; font-size: 44px; font-weight: 300; text-align: right; padding: 10px 6px; overflow: hidden; white-space: nowrap; }",
    ".vn-taster { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }",
    ".vn-taster button { aspect-ratio: 1; border-radius: 50%; border: 0; background: #333336; color: #fff; font: inherit; font-size: 22px; cursor: pointer; padding: 0; }",
    ".vn-taster button.op { background: #ff9f0a; } .vn-taster button.fn { background: #a5a5a5; color: #000; } .vn-taster button.nul { grid-column: span 2; aspect-ratio: auto; border-radius: 30px; text-align: left; padding-left: 22px; }",
    ".vn-taster button:active { filter: brightness(1.3); }",
    // ur
    ".vn-klok { font-size: 54px; font-weight: 200; text-align: center; letter-spacing: 1px; } .vn-stop { font-size: 30px; font-variant-numeric: tabular-nums; text-align: center; font-weight: 300; }",
    // tegn
    ".vn-tegn canvas { width: 100%; aspect-ratio: 1; border-radius: 14px; box-shadow: inset 0 0 0 1px var(--t-linje), 0 2px 8px rgba(0,0,0,.1); touch-action: none; cursor: crosshair; background: #fff; display: block; }",
    ".vn-farver { display: flex; gap: 6px; justify-content: center; margin: 10px 0 4px; } .vn-farver button { width: 24px; height: 24px; border-radius: 50%; border: 0; cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,.2); } .vn-farver button.valgt { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--t-acc); }",
    // horoskop
    ".vn-horo { background: linear-gradient(#2a1f5a, #6a3fd0); min-height: 100%; box-sizing: border-box; color: #fff; } .vn-horo .vn-a { color: #e2d4ff; }",
    ".vn-tegngrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; } .vn-tegngrid .vn-a { display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,.12); border-radius: 12px; padding: 8px 2px; font-size: 11px; color: #fff; } .vn-tegngrid span { font-size: 24px; }",
    ".vn-horotop { text-align: center; margin: 6px 0 12px; } .vn-horotop span { font-size: 52px; display: block; } .vn-horotop b { font-size: 20px; display: block; } .vn-horotop small { opacity: .75; }",
    ".vn-lykke { display: flex; flex-direction: column; gap: 6px; } .vn-lykke span { background: rgba(255,255,255,.14); border-radius: 10px; padding: 7px 10px; display: flex; justify-content: space-between; }",
    // 404
    ".vn-404 { text-align: center; padding-top: 40px; } .vn-404 > span { font-size: 60px; }",
    // forsiden
    ".vn-forside { min-height: 100%; padding: 16px 12px 24px; box-sizing: border-box; color: #fff; display: flex; flex-direction: column; gap: 10px; }",
    ".vn-forside.moerk { color: #1c1c1e; }",
    ".vn-fhoved { text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,.25); } .vn-forside.moerk .vn-fhoved { text-shadow: none; }",
    ".vn-femoji { font-size: 40px; display: block; line-height: 1.1; } .vn-fhoved b { display: block; font-size: 21px; } .vn-fhoved small { font-size: 12px; opacity: .9; }",
    ".vn-forside .vn-sf { margin: 0; }",
    ".vn-w { background: rgba(255,255,255,.22); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }",
    ".vn-forside.moerk .vn-w { background: rgba(255,255,255,.6); }",
    ".vn-wt { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; opacity: .85; margin-bottom: 6px; }",
    ".vn-favgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 4px; }",
    ".vn-fav { position: relative; } .vn-fav .vn-a { display: flex; flex-direction: column; align-items: center; gap: 4px; color: inherit; text-decoration: none; }",
    ".vn-fav small { font-size: 10px; text-align: center; line-height: 1.15; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".vn-favx { position: absolute; top: -4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; border: 0; background: #ff3b30; color: #fff; font-size: 10px; cursor: pointer; padding: 0; animation: tlfVrik .3s infinite alternate; }",
    ".vn-wur { display: flex; align-items: baseline; justify-content: space-between; } .vn-wur b { font-size: 30px; font-weight: 300; } .vn-wur span { font-size: 12px; }",
    ".vn-wvejr { display: flex; align-items: center; gap: 10px; cursor: pointer; } .vn-wvejr span { font-size: 34px; } .vn-wvejr b { font-size: 28px; font-weight: 300; } .vn-wvejr small { font-size: 11.5px; line-height: 1.3; }",
    ".vn-wnyt { font-size: 12.5px; font-weight: 600; padding: 4px 0; border-top: 1px solid rgba(255,255,255,.3); cursor: pointer; } .vn-wnyt:first-of-type { border-top: 0; }",
    ".vn-wvits { cursor: pointer; } .vn-wvits b { display: block; font-size: 13px; } .vn-wvits small { display: block; font-size: 12px; margin-top: 3px; opacity: .85; }",
    ".vn-designknap { align-self: center; border: 0; border-radius: 18px; padding: 8px 16px; background: rgba(255,255,255,.3); color: inherit; font: inherit; font-weight: 600; cursor: pointer; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }",
    ".vn-design { background: var(--t-hvid); color: var(--t-tekst); border-radius: 16px; padding: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.2); }",
    ".vn-design label { display: block; font-size: 12px; font-weight: 600; } .vn-design label input { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; border: 1px solid var(--t-linje); border-radius: 9px; padding: 7px 9px; font: inherit; outline: 0; user-select: text; }",
    ".vn-dt { font-size: 12px; font-weight: 600; margin: 10px 0 5px; } .vn-dt small { color: var(--t-graa); font-weight: 400; }",
    ".vn-emojier { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; } .vn-emojier button { border: 0; background: var(--t-felt); border-radius: 8px; font-size: 17px; padding: 3px 0; cursor: pointer; } .vn-emojier button.valgt { background: var(--t-acc); }",
    ".vn-bgvalg { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; } .vn-bgvalg button { aspect-ratio: 1; border-radius: 10px; border: 0; cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); } .vn-bgvalg button.valgt { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--t-acc); }",
    ".vn-wvalg { list-style: none; margin: 0; padding: 0; } .vn-wvalg li { display: flex; align-items: center; gap: 6px; padding: 4px 0; font-size: 12.5px; color: var(--t-graa); } .vn-wvalg li.til { color: var(--t-tekst); } .vn-wvalg li span { flex: 1; }",
    ".vn-wvalg button { border: 0; background: var(--t-felt); border-radius: 7px; width: 26px; height: 24px; cursor: pointer; padding: 0; font-size: 12px; color: var(--t-tekst); }",
    ".vn-wvalg .vn-tjek { border-radius: 50%; width: 20px; height: 20px; border: 2px solid var(--t-linje); background: none; color: #fff; font-size: 11px; font-weight: 800; } .vn-wvalg li.til .vn-tjek { background: var(--t-acc); border-color: var(--t-acc); }",
  ]);

  // ===============================================================
  //  ✉️ Vera-Mail — mails mellem gæsterne (database-41-vera-mail.sql)
  //  Indbakke, Sendt, ⭐ Stjernet, emne, ulæste, svar og slet.
  //  Uden databasen virker mails kun mellem profiler på denne computer.
  // ===============================================================
  const MAIL_LOKAL = "mit-hotel-vera-mail";
  let mailServerRk = [], mailStatus = "ukendt", mailFejl = "", mailHentet = 0, mailSet = null;
  let mailFane = "ind", mailAaben = null, mailSkriv = null, mailSoeg = "";
  function mailMig() { return hentGemt("mit-hotel-telefon-mail-" + mig(), { stjerne: {} }); }
  function gemMailMig(v) { gemGemt("mit-hotel-telefon-mail-" + mig(), v); }
  function mailOnline() { return typeof serverKald === "function" && typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function mailLokalListe() { const l = hentGemt(MAIL_LOKAL, []); return Array.isArray(l) ? l : []; }
  function gemMailLokal(l) { gemGemt(MAIL_LOKAL, l.slice(-400)); }
  function mailVelkommen() {
    const n = "mit-hotel-vera-mail-velkommen-" + mig();
    try { if (localStorage.getItem(n)) return; localStorage.setItem(n, "1"); } catch (e) { return; }
    const l = mailLokalListe();
    l.push({ id: "v" + Date.now(), fra: "Vera 🏨", til: mig(), emne: "Velkommen til Vera-Mail!", tekst: "Hej " + mig() + "!\n\nNu har du din egen mail på hotellet. Tryk på ✏️ for at skrive til en ven – skriv deres navn ud for Til.\n\nDu kan svare på mails, give dem en ⭐ og slette dem, du ikke vil gemme.\n\nKærlig hilsen\nVera fra receptionen", laest: false, tid: Date.now() });
    gemMailLokal(l);
  }
  function mailAlle() {
    const jeg = mig().toLowerCase();
    const lok = mailLokalListe().filter(function (m) {
      return (m.til.toLowerCase() === jeg && !m.sletTil) || (m.fra.toLowerCase() === jeg && !m.sletFra);
    }).map(function (m) { return { id: "l" + m.id, fra: m.fra, til: m.til, emne: m.emne, tekst: m.tekst, laest: m.laest, tid: m.tid, ind: m.til.toLowerCase() === jeg, lokal: true }; });
    return mailServerRk.concat(lok).sort(function (a, b) { return b.tid - a.tid; });
  }
  function mailInd() { return mailAlle().filter(function (m) { return m.ind; }); }
  function mailUlaeste() { if (!harSpil("mail")) return 0; return mailInd().filter(function (m) { return !m.laest; }).length; }
  function hentMails(stille) {
    if (!mailOnline() || mailStatus === "lokal") { mailStatus = mailOnline() ? "lokal" : "offline"; return Promise.resolve(); }
    return serverKald("hv_mail_hent", { p_token: mitToken() }).then(function (d) {
      mailStatus = "server"; mailFejl = ""; mailHentet = Date.now();
      const r = [];
      ((d && d.ind) || []).forEach(function (m) { r.push({ id: "s" + m.id, fra: m.fra, til: mig(), emne: m.emne, tekst: m.tekst, laest: m.laest, tid: +m.tid, ind: true }); });
      ((d && d.sendt) || []).forEach(function (m) { r.push({ id: "s" + m.id, fra: mig(), til: m.til, emne: m.emne, tekst: m.tekst, laest: m.laest, tid: +m.tid, ind: false }); });
      mailServerRk = r;
    }).catch(function (e) {
      if (/function|schema cache|does not exist|Could not find/i.test(e.message)) { mailStatus = "lokal"; mailFejl = "Mails til rigtige spillere virker, når database-41-vera-mail.sql er kørt i Supabase. Indtil da virker Vera-Mail kun på denne computer."; }
      else mailFejl = e.message;
    });
  }
  function tjekNyeMails() {
    if (!harSpil("mail")) return;
    hentMails().then(function () {
      const ul = mailInd().filter(function (m) { return !m.laest; });
      if (mailSet === null) { mailSet = {}; ul.forEach(function (m) { mailSet[m.id] = 1; }); opdaterMailTal(); return; }
      const nye = ul.filter(function (m) { return !mailSet[m.id]; });
      nye.forEach(function (m) { mailSet[m.id] = 1; });
      if (nye.length) {
        ding();
        if (!tlf.hidden) {
          bannerEl.innerHTML = notisHtml("mail", nye[0].fra, nye[0].emne || "(intet emne)", "nu");
          bannerEl.classList.add("vis"); clearTimeout(visBanner.t); visBanner.t = setTimeout(skjulBanner, 4200);
        } else lilleUde("✉️ Ny mail fra " + nye[0].fra);
      }
      opdaterMailTal();
    });
  }
  function lilleUde(t) { try { if (typeof visToast === "function") visToast(t); } catch (e) {} }
  function opdaterMailTal() {
    if (appNu === "mail" && appEl && !mailAaben && !mailSkriv) tegnMailListe();
    if (skaermNu === "hjem" && !tlf.hidden && !redigerer && mappeAaben === null) tegnHjem();
  }
  setTimeout(tjekNyeMails, 6000);
  setInterval(tjekNyeMails, 20000);

  function mailTid(t) { return naarTekst(t); }
  function tegnMail() {
    mailVelkommen();
    mailAaben = null; mailSkriv = null; mailSoeg = ""; mailFane = "ind";
    appEl.innerHTML = "<div class='vm-hoved'></div><div class='tlf-indhold vm-indhold'></div>";
    appEl.addEventListener("click", mailKlik);
    appEl.addEventListener("input", function (e) { if (e.target.matches("[data-vmsoeg]")) { mailSoeg = e.target.value; tegnMailListe(true); } });
    tegnMailListe();
    hentMails().then(function () { if (appNu === "mail" && !mailAaben && !mailSkriv) tegnMailListe(true); });
  }
  function mailTop(titel, venstre, hoejre) {
    return "<div class='tlf-top'>" + (venstre || "<button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + ik("tilbage", 20) + "</button>") + "<h3>" + titel + "</h3>" + (hoejre || "<span class='tlf-tb'></span>") + "</div>";
  }
  function tegnMailListe(kunListe) {
    if (!appEl || appNu !== "mail") return;
    const alle = mailAlle(), st = mailMig().stjerne || {};
    const ul = alle.filter(function (m) { return m.ind && !m.laest; }).length;
    let l = mailFane === "ind" ? alle.filter(function (m) { return m.ind; }) : mailFane === "sendt" ? alle.filter(function (m) { return !m.ind; }) : alle.filter(function (m) { return st[m.id]; });
    const q = mailSoeg.trim().toLowerCase();
    if (q) l = l.filter(function (m) { return (m.fra + " " + m.til + " " + m.emne + " " + m.tekst).toLowerCase().indexOf(q) >= 0; });
    const listeHtml = l.length ? l.map(function (m) {
      const hvem = m.ind ? m.fra : "Til: " + m.til;
      return "<li class='vm-r" + (m.ind && !m.laest ? " ny" : "") + "' data-vmaabn='" + esc(m.id) + "'>" + (m.ind && !m.laest ? "<i class='vm-prik'></i>" : "") + avatarHtml(m.ind ? m.fra : m.til, true) +
        "<span class='vm-t'><span class='vm-l1'><b>" + esc(hvem) + "</b><small>" + esc(mailTid(m.tid)) + "</small></span><span class='vm-emne'>" + esc(m.emne || "(intet emne)") + "</span>" +
        "<span class='vm-uddrag'>" + esc(m.tekst.replace(/\s+/g, " ").slice(0, 70)) + "</span></span>" + (st[m.id] ? "<span class='vm-st'>⭐</span>" : "") + "</li>";
    }).join("") : "<li class='tlf-tom' style='cursor:default'><span><span class='st'>" + (mailFane === "ind" ? "📭" : mailFane === "sendt" ? "📤" : "⭐") + "</span>" +
      (q ? "Ingen mails passer." : mailFane === "ind" ? "Ingen mails endnu." : mailFane === "sendt" ? "Du har ikke sendt nogen mails endnu.<br>Tryk på ✏️ for at skrive en." : "Ingen stjernede mails.<br>Åbn en mail og tryk ⭐.") + "</span></li>";
    if (!kunListe) {
      appEl.querySelector(".vm-hoved").innerHTML = mailTop("Vera-Mail", null, "<button class='tlf-tb' data-vmskriv title='Ny mail'>" + ik("skriv", 20) + "</button>");
      appEl.querySelector(".vm-indhold").innerHTML = "<div class='tlf-faner vm-faner'>" + [["ind", "Indbakke" + (ul ? "<i>" + ul + "</i>" : "")], ["sendt", "Sendt"], ["stjerne", "⭐ Stjernet"]].map(function (f) {
        return "<button data-vmfane='" + f[0] + "' class='" + (mailFane === f[0] ? "valgt" : "") + "'>" + f[1] + "</button>";
      }).join("") + "</div><div class='tlf-soeg'>" + ik("soeg", 16) + "<input data-vmsoeg placeholder='Søg i mails …' value='" + esc(mailSoeg) + "'></div>" +
        (mailFejl ? "<div class='vm-fejl'>⚠️ " + esc(mailFejl) + "</div>" : "") + "<ul class='tlf-liste vm-liste'></ul>";
    }
    const u = appEl.querySelector(".vm-liste");
    if (!u) return;
    u.innerHTML = listeHtml;
    tegnAvatarer(u);
  }
  function findMail(id) { return mailAlle().filter(function (m) { return m.id === id; })[0]; }
  function markerLaest(m) {
    if (!m || !m.ind || m.laest) return;
    m.laest = true;
    if (m.lokal) { const l = mailLokalListe(); l.forEach(function (x) { if ("l" + x.id === m.id) x.laest = true; }); gemMailLokal(l); }
    else {
      mailServerRk.forEach(function (x) { if (x.id === m.id) x.laest = true; });
      serverKald("hv_mail_laest", { p_token: mitToken(), p_id: +m.id.slice(1) }).catch(function () {});
    }
  }
  function tegnMailVis(id) {
    const m = findMail(id);
    if (!m) { mailAaben = null; tegnMailListe(); return; }
    mailAaben = id;
    markerLaest(m);
    const st = (mailMig().stjerne || {})[id];
    appEl.querySelector(".vm-hoved").innerHTML = mailTop("", "<button class='tlf-tb vm-tb' data-vmtilbage title='Tilbage'>" + ik("tilbage", 20) + "<span>" + (mailFane === "ind" ? "Indbakke" : mailFane === "sendt" ? "Sendt" : "Stjernet") + "</span></button>",
      "<button class='tlf-tb' data-vmstjerne title='Stjerne'>" + (st ? "⭐" : "☆") + "</button>");
    const d = new Date(m.tid);
    appEl.querySelector(".vm-indhold").innerHTML = "<div class='vm-mail'><h2>" + esc(m.emne || "(intet emne)") + "</h2>" +
      "<div class='vm-fra'>" + avatarHtml(m.ind ? m.fra : m.til) + "<span><b>" + esc(m.ind ? m.fra : mig()) + "</b><small>Til: " + esc(m.ind ? mig() : m.til) + "</small><small>" + esc(dato(d)) + " kl. " + kl(m.tid) + "</small></span></div>" +
      "<div class='vm-tekst'>" + esc(m.tekst) + "</div>" +
      "<div class='vm-handl'>" + (m.ind && !/^Vera /.test(m.fra) ? "<button data-vmsvar>↩️ Svar</button>" : "") + "<button data-vmvidere>➡️ Videresend</button><button class='vm-slet' data-vmslet>🗑 Slet</button></div></div>";
    tegnAvatarer(appEl.querySelector(".vm-mail"));
    if (skaermNu === "hjem") tegnHjem();
  }
  function mailNavne() {
    const s = {}, l = [];
    vennerListe().forEach(function (n) { if (!s[n]) { s[n] = 1; l.push(n); } });
    if (typeof HAL_GAESTER !== "undefined") HAL_GAESTER.forEach(function (g) { if (g.navn && !s[g.navn]) { s[g.navn] = 1; l.push(g.navn); } });
    return l;
  }
  function tegnMailSkriv(forud) {
    mailSkriv = forud || {};
    mailAaben = null;
    appEl.querySelector(".vm-hoved").innerHTML = mailTop("Ny mail", "<button class='tlf-tb vm-tb' data-vmannuller><span>Annullér</span></button>", "<button class='tlf-tb vm-send' data-vmsend title='Send'>" + ik("send", 18) + "</button>");
    appEl.querySelector(".vm-indhold").innerHTML = "<div class='vm-form'>" +
      "<label><span>Til:</span><input data-vmtil list='vm-navne' autocomplete='off' value='" + esc(mailSkriv.til || "") + "' placeholder='Navnet på en gæst'></label>" +
      "<datalist id='vm-navne'>" + mailNavne().map(function (n) { return "<option value='" + esc(n) + "'>"; }).join("") + (erEjer() ? "<option value='alle'>" : "") + "</datalist>" +
      "<label><span>Emne:</span><input data-vmemne maxlength='80' autocomplete='off' value='" + esc(mailSkriv.emne || "") + "'></label>" +
      "<textarea data-vmtekst maxlength='3000' placeholder='Skriv din mail her …'>" + esc(mailSkriv.tekst || "") + "</textarea>" +
      (mailNavne().length ? "<div class='vm-hurtig'>" + mailNavne().slice(0, 8).map(function (n) { return "<button data-vmtilnavn='" + esc(n) + "'>" + esc(n) + "</button>"; }).join("") + "</div>" : "") +
      (erEjer() ? "<div class='vm-ejer'>👑 Som ejer kan du skrive <b>alle</b> ud for Til og sende mailen til alle på hotellet.</div>" : "") +
      "<div class='vm-status'></div></div>";
    const f = appEl.querySelector(mailSkriv.til ? (mailSkriv.emne ? "[data-vmtekst]" : "[data-vmemne]") : "[data-vmtil]");
    if (f) { f.focus(); if (f.matches("textarea")) f.setSelectionRange(0, 0); }
  }
  function sendMail() {
    const til = appEl.querySelector("[data-vmtil]").value.trim(), emne = appEl.querySelector("[data-vmemne]").value.trim(), tekst = appEl.querySelector("[data-vmtekst]").value;
    const st = appEl.querySelector(".vm-status"), knap = appEl.querySelector("[data-vmsend]");
    const fejl = function (t) { st.textContent = "⚠️ " + t; st.className = "vm-status fejl"; };
    if (!til) return fejl("Skriv hvem mailen skal til.");
    if (til.toLowerCase() === mig().toLowerCase()) return fejl("Du kan ikke sende en mail til dig selv.");
    if (!tekst.trim()) return fejl("Mailen er tom.");
    knap.disabled = true; st.textContent = "Sender …"; st.className = "vm-status";
    const faerdig = function (hvem) {
      lille("✉️ Mailen er sendt til " + hvem);
      mailFane = "sendt"; mailSkriv = null; tegnMailListe();
    };
    if (mailOnline() && mailStatus !== "lokal") {
      serverKald("hv_mail_send", { p_token: mitToken(), p_til: til, p_emne: emne, p_tekst: tekst }).then(function () {
        return hentMails();
      }).then(function () { faerdig(til.toLowerCase() === "alle" ? "alle på hotellet" : til); }).catch(function (e) {
        knap.disabled = false;
        if (/function|schema cache|does not exist|Could not find/i.test(e.message)) { mailStatus = "lokal"; mailFejl = "Mails til rigtige spillere virker, når database-41-vera-mail.sql er kørt i Supabase."; sendLokal(til, emne, tekst); faerdig(til); }
        else fejl(e.message);
      });
      return;
    }
    if (til.toLowerCase() === "alle") { knap.disabled = false; return fejl("Mail til alle virker kun, når du er på hotellets server."); }
    sendLokal(til, emne, tekst);
    faerdig(til);
  }
  function sendLokal(til, emne, tekst) {
    const l = mailLokalListe(), id = Date.now();
    l.push({ id: id, fra: mig(), til: til, emne: emne, tekst: tekst, laest: false, tid: Date.now() });
    gemMailLokal(l);
    // computer-gæsterne i hallen svarer selv
    if (typeof HAL_GAESTER !== "undefined" && HAL_GAESTER.some(function (g) { return g.navn && g.navn.toLowerCase() === til.toLowerCase(); })) {
      const svar = ["Tak for din mail! 😊 Vi ses i hallen.", "Hej! Hvor er det sødt, at du skriver. Kom forbi caféen senere ☕", "Haha, den var god! Skriv snart igen 💌", "Tak! Jeg har lige læst den. Hav en dejlig dag på hotellet 🌟"];
      setTimeout(function () {
        const l2 = mailLokalListe();
        l2.push({ id: Date.now(), fra: til, til: mig(), emne: "Sv: " + (emne || "(intet emne)"), tekst: svar[Math.floor(Math.random() * svar.length)] + "\n\nHilsen " + til, laest: false, tid: Date.now() });
        gemMailLokal(l2);
        tjekNyeMails();
      }, 6000 + Math.random() * 6000);
    }
  }
  function sletMail(m) {
    if (m.lokal) {
      const l = mailLokalListe().map(function (x) {
        if ("l" + x.id !== m.id) return x;
        if (m.ind) x.sletTil = true; else x.sletFra = true;
        return x;
      }).filter(function (x) { return !(x.sletTil && x.sletFra) && !(x.sletTil && /^Vera /.test(x.fra)); });
      gemMailLokal(l);
    } else {
      mailServerRk = mailServerRk.filter(function (x) { return x.id !== m.id; });
      serverKald("hv_mail_slet", { p_token: mitToken(), p_id: +m.id.slice(1) }).catch(function (e) { lille("⚠️ " + e.message); });
    }
    const s = mailMig(); if (s.stjerne) delete s.stjerne[m.id]; gemMailMig(s);
  }
  function mailKlik(e) {
    const t = e.target;
    const fa = t.closest("[data-vmfane]");
    if (fa) { mailFane = fa.dataset.vmfane; tegnMailListe(); return; }
    if (t.closest("[data-vmskriv]")) { tegnMailSkriv(); return; }
    const a = t.closest("[data-vmaabn]");
    if (a) { tegnMailVis(a.dataset.vmaabn); return; }
    if (t.closest("[data-vmtilbage]") || t.closest("[data-vmannuller]")) { mailAaben = null; mailSkriv = null; tegnMailListe(); return; }
    if (t.closest("[data-vmsend]")) { sendMail(); return; }
    const tn = t.closest("[data-vmtilnavn]");
    if (tn) { appEl.querySelector("[data-vmtil]").value = tn.dataset.vmtilnavn; appEl.querySelector("[data-vmemne]").focus(); return; }
    const m = mailAaben && findMail(mailAaben);
    if (!m) return;
    if (t.closest("[data-vmstjerne]")) {
      const s = mailMig(); s.stjerne = s.stjerne || {};
      if (s.stjerne[m.id]) delete s.stjerne[m.id]; else s.stjerne[m.id] = 1;
      gemMailMig(s); tegnMailVis(m.id); lille(s.stjerne[m.id] ? "⭐ Stjernemarkeret" : "Stjernen er fjernet"); return;
    }
    const citat = "\n\n— " + (m.ind ? m.fra : mig()) + " skrev " + naarTekst(m.tid) + ":\n" + m.tekst.split("\n").map(function (l) { return "> " + l; }).join("\n");
    if (t.closest("[data-vmsvar]")) { tegnMailSkriv({ til: m.fra, emne: /^Sv:/i.test(m.emne) ? m.emne : "Sv: " + (m.emne || ""), tekst: citat }); return; }
    if (t.closest("[data-vmvidere]")) { tegnMailSkriv({ til: "", emne: "Vs: " + (m.emne || ""), tekst: citat }); return; }
    const sl = t.closest("[data-vmslet]");
    if (sl) {
      if (!sl.classList.contains("sikker")) { sl.classList.add("sikker"); sl.textContent = "Er du sikker?"; setTimeout(function () { if (sl.isConnected) { sl.classList.remove("sikker"); sl.textContent = "🗑 Slet"; } }, 3000); return; }
      sletMail(m); mailAaben = null; lille("🗑 Mailen er slettet"); tegnMailListe();
    }
  }
  nyStil("telefon-stil-mail", [
    ".vm-hoved { flex: none; } .vm-indhold { display: flex; flex-direction: column; }",
    ".vm-faner { margin: 8px 12px 0; } .vm-faner button { font-size: 12px; white-space: nowrap; }",
    ".vm-fejl { margin: 6px 12px; padding: 7px 10px; border-radius: 10px; background: #fff3d6; color: #7a5200; font-size: 11.5px; line-height: 1.35; }",
    ".vm-liste { flex: 1; } .vm-r { position: relative; align-items: flex-start !important; padding-left: 18px !important; }",
    ".vm-prik { position: absolute; left: 6px; top: 22px; width: 8px; height: 8px; border-radius: 50%; background: var(--t-acc); }",
    ".vm-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }",
    ".vm-l1 { display: flex; justify-content: space-between; gap: 6px; } .vm-l1 b { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .vm-l1 small { color: var(--t-graa); font-size: 11px; flex: none; }",
    ".vm-emne { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--t-tekst); } .vm-r.ny .vm-emne { font-weight: 700; }",
    ".vm-uddrag { font-size: 12px; color: var(--t-graa); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }",
    ".vm-st { font-size: 11px; flex: none; }",
    ".vm-tb { width: auto !important; display: flex; align-items: center; gap: 0; color: var(--t-acc); font: inherit; font-size: 14px; } .vm-tb span { font-size: 14px; }",
    ".vm-mail { padding: 12px 14px 30px; background: var(--t-hvid); min-height: 100%; box-sizing: border-box; user-select: text; -webkit-user-select: text; }",
    ".vm-mail h2 { font-size: 19px; margin: 0 0 10px; line-height: 1.25; word-wrap: break-word; }",
    ".vm-fra { display: flex; gap: 9px; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--t-linje); } .vm-fra b { display: block; font-size: 14px; } .vm-fra small { display: block; color: var(--t-graa); font-size: 11.5px; }",
    ".vm-tekst { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; line-height: 1.5; padding: 12px 0; }",
    ".vm-handl { display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--t-linje); padding-top: 10px; }",
    ".vm-handl button { flex: 1; border: 0; border-radius: 10px; padding: 9px 4px; background: var(--t-felt); color: var(--t-acc); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; }",
    ".vm-handl .vm-slet { color: var(--t-rod); } .vm-handl .vm-slet.sikker { background: var(--t-rod); color: #fff; }",
    ".vm-send { background: var(--t-acc) !important; border-radius: 50% !important; width: 30px !important; height: 30px !important; } .vm-send:disabled { opacity: .5; }",
    ".vm-form { display: flex; flex-direction: column; background: var(--t-hvid); min-height: 100%; }",
    ".vm-form label { display: flex; align-items: center; gap: 6px; padding: 9px 14px; border-bottom: 1px solid var(--t-linje); } .vm-form label span { color: var(--t-graa); font-size: 13px; }",
    ".vm-form input { flex: 1; min-width: 0; border: 0; outline: 0; font: inherit; font-size: 14px; background: none; color: var(--t-tekst); user-select: text; }",
    ".vm-form textarea { min-height: 200px; border: 0; outline: 0; resize: none; padding: 12px 14px; font: inherit; font-size: 14px; line-height: 1.45; background: none; color: var(--t-tekst); user-select: text; }",
    ".vm-hurtig { display: flex; flex-wrap: wrap; gap: 5px; padding: 6px 14px; } .vm-hurtig button { border: 0; border-radius: 13px; padding: 4px 10px; background: var(--t-felt); color: var(--t-tekst); font: inherit; font-size: 11.5px; cursor: pointer; }",
    ".vm-ejer { margin: 6px 14px; padding: 7px 10px; border-radius: 10px; background: #fff4d6; font-size: 11.5px; color: #6a4a00; }",
    ".vm-status { padding: 6px 14px; font-size: 12px; color: var(--t-graa); } .vm-status.fejl { color: var(--t-rod); }",
  ]);

  // ===============================================================
  //  🎵 Music Box — hotellets egen musik
  //  Al musikken bliver lavet af telefonen selv (Web Audio), så der er
  //  ingen ophavsret. Stemninger, album med covers, favoritter,
  //  playlister, afspilningskø, gentag og bland.
  //  Gemmes i mit-hotel-telefon-musik-<navn>
  // ===============================================================
  const MB_ST = {
    glad:    { navn: "Glad", ik: "☀️", farver: ["#ffd36b", "#ff8a3d"], bpm: [112, 126], skala: "dur", trommer: "pop", bas: "to", mel: "square", pad: "triangle", arp: false, form: "sol" },
    rolig:   { navn: "Rolig", ik: "🌙", farver: ["#7fb8ff", "#2c3a8f"], bpm: [66, 76], skala: "dur", trommer: null, bas: "en", mel: "sine", pad: "sine", arp: true, ekko: true, form: "maane" },
    fest:    { navn: "Fest", ik: "🎉", farver: ["#ff5cc8", "#6a2cff"], bpm: [120, 128], skala: "moll", trommer: "disko", bas: "otte", mel: "sawtooth", pad: "triangle", arp: true, form: "prikker" },
    hygge:   { navn: "Hygge", ik: "☕", farver: ["#f3cfa0", "#9c6a32"], bpm: [84, 94], skala: "dur", trommer: "blid", bas: "to", mel: "triangle", pad: "sine", arp: false, form: "boelger" },
    eventyr: { navn: "Eventyr", ik: "🗺", farver: ["#9be08a", "#1f5f5a"], bpm: [100, 112], skala: "moll", trommer: "march", bas: "hop", mel: "square", pad: "triangle", arp: true, form: "bjerge" },
    droem:   { navn: "Drømmende", ik: "✨", farver: ["#f0d4ff", "#6a7bff"], bpm: [68, 80], skala: "dur", trommer: null, bas: "en", mel: "sine", pad: "triangle", arp: true, ekko: true, form: "stjerner" },
    fokus:   { navn: "Lektier", ik: "📚", farver: ["#c7f0d0", "#2f7a7a"], bpm: [80, 88], skala: "dorisk", trommer: "lofi", bas: "to", mel: "triangle", pad: "sine", arp: false, ekko: true, form: "striber" },
    regn:    { navn: "Regnvejr", ik: "🌧", farver: ["#b4c0d4", "#3c4a60"], bpm: [66, 74], skala: "moll", trommer: "lofi", bas: "en", mel: "sine", pad: "sine", arp: true, ekko: true, regn: true, form: "regn" },
    spil:    { navn: "Gaming", ik: "👾", farver: ["#5fd38d", "#1f2f8f"], bpm: [132, 146], skala: "moll", trommer: "pop", bas: "otte", mel: "square", pad: "square", arp: true, form: "pixel" },
  };
  const MB_ALBUM = [
    { id: "glad", titel: "Solskin i Lobbyen", kunstner: "Vera Band", sange: ["Godmorgen, Hotel", "Elevator-boogie", "Kakao med skum", "Hop i poolen"] },
    { id: "fest", titel: "Fest i Hallen", kunstner: "DJ Glimt", sange: ["Diskokuglen", "Dans på bordene", "Stella Party", "Sidste dans"] },
    { id: "rolig", titel: "Månelys på Værelset", kunstner: "Natportieren", sange: ["Stille gang", "Dyner og drømme", "Måneskin", "Godnat, Vera"] },
    { id: "hygge", titel: "Caféhygge", kunstner: "Kaffekoppen", sange: ["Kanelsnegl", "Varme sokker", "Bogreolen", "Stearinlys"] },
    { id: "eventyr", titel: "Den Hemmelige Etage", kunstner: "Nøglebærerne", sange: ["Nøglen", "Mod tårnet", "Skattekortet", "Hjem igen"] },
    { id: "droem", titel: "Skyer af Stella", kunstner: "Drømmefabrikken", sange: ["Lilla himmel", "Svævende", "Stjernestøv", "Ved vinduet"] },
    { id: "fokus", titel: "Lektier & Lo-fi", kunstner: "Receptionen", sange: ["Blyant og papir", "Rolig hjerne", "Tusch", "Sidste opgave"] },
    { id: "regn", titel: "Regnvejrsdag", kunstner: "Paraplyerne", sange: ["Gråvejr", "Pytter", "Tæppe og te", "Solen kommer"] },
    { id: "spil", titel: "8-bit Hotel", kunstner: "Pixel Portier", sange: ["Level 1: Lobby", "Snake-jagt", "Boss i kælderen", "High score"] },
  ];
  const MB_SANGE = {};
  MB_ALBUM.forEach(function (a) { a.sange.forEach(function (t, i) { MB_SANGE[a.id + i] = { id: a.id + i, titel: t, album: a.id, nr: i + 1, kunstner: a.kunstner }; }); });
  // ----- 🎤 Rigtige sange: lydfiler i mappen musik/ (listen står i musik/sange.js) -----
  // Kun musik der er lovlig at bruge: Public Domain eller CC0. Licens og kilde står ved hver sang.
  MB_ST.rigtige = { navn: "Rigtige sange", ik: "🎤", farver: ["#ffd36b", "#e0447e"], form: "prikker", skala: "dur", bpm: [100, 100], mel: "sine", pad: "sine" };
  const mbVarighed = {};
  let mbRigtigeHentet = false;
  function mbHentRigtige() {
    if (mbRigtigeHentet) return;
    mbRigtigeHentet = true;
    const sc = document.createElement("script");
    sc.src = "musik/sange.js?v=" + Math.floor(Date.now() / 60000);
    sc.onload = function () {
      const l = Array.isArray(window.MUSIK_SANGE) ? window.MUSIK_SANGE.filter(function (x) { return x && x.fil && x.titel; }) : [];
      if (!l.length) return;
      const a = { id: "rigtige", titel: "Rigtige sange", kunstner: "Fri musik", sange: [] };
      l.forEach(function (x, i) {
        a.sange.push(x.titel);
        MB_SANGE["rigtige" + i] = { id: "rigtige" + i, titel: String(x.titel), album: "rigtige", nr: i + 1, kunstner: String(x.kunstner || "Ukendt"), fil: "musik/" + String(x.fil).replace(/^musik\//, ""), licens: x.licens || "", kilde: x.kilde || "" };
        const au = new Audio(); au.preload = "metadata";
        au.onloadedmetadata = function () { mbVarighed["rigtige" + i] = au.duration; };
        au.src = MB_SANGE["rigtige" + i].fil;
      });
      MB_ALBUM.unshift(a);
      if (appNu === "musik" && appEl) mbTegnSide();
    };
    sc.onerror = function () {};
    document.head.appendChild(sc);
  }
  setTimeout(mbHentRigtige, 3000);
  function mbSpilEkte(id) {
    const x = MB_SANGE[id], a = new Audio(x.fil);
    a.volume = mbIndst().vol;
    a.onloadedmetadata = function () { mbVarighed[id] = a.duration; };
    a.onended = function () { if (mb.ekte === a) mbNaeste(true); };
    a.onerror = function () { if (mb.ekte === a) { lille("⚠️ Sangen " + x.titel + " kunne ikke findes"); mb.spiller = false; mbOpdater(); } };
    if (mb.master && mb.ctx) try { mb.master.gain.setTargetAtTime(0, mb.ctx.currentTime, 0.03); } catch (e) {}
    mb.data = null; mb.sang = id; mb.ekte = a; mb.spiller = true;
    a.play().catch(function () { if (mb.ekte === a) { mb.spiller = false; mbOpdater(); } });
  }
  function mbStopEkte() { if (mb.ekte) { const a = mb.ekte; mb.ekte = null; try { a.pause(); a.src = ""; } catch (e) {} } }
  function mbAlbum(id) { return MB_ALBUM.filter(function (a) { return a.id === id; })[0]; }
  function mbAlbumSange(id) { return mbAlbum(id).sange.map(function (t, i) { return id + i; }); }

  // ----- musikken bliver komponeret her (altid den samme for hver sang) -----
  const MB_SKALA = { dur: [0, 2, 4, 5, 7, 9, 11], moll: [0, 2, 3, 5, 7, 8, 10], dorisk: [0, 2, 3, 5, 7, 9, 10] };
  const MB_PROG = { dur: [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 0], [5, 3, 0, 4], [0, 2, 3, 4], [3, 4, 0, 5]], moll: [[0, 5, 2, 6], [0, 3, 4, 0], [0, 6, 5, 6], [0, 5, 3, 4], [5, 6, 0, 0]], dorisk: [[0, 3, 0, 3], [0, 6, 3, 0], [0, 3, 6, 4]] };
  const MB_RYTME = [
    [[0, 4], [4, 4], [8, 4], [12, 4]], [[0, 2], [2, 2], [4, 4], [8, 6], [14, 2]], [[0, 6], [6, 2], [8, 8]], [[0, 3], [3, 3], [6, 2], [8, 4], [12, 4]],
    [[0, 2], [2, 2], [4, 2], [6, 2], [8, 8]], [[2, 2], [4, 4], [8, 2], [10, 2], [12, 4]], [[0, 8], [8, 8]], [[0, 4], [6, 2], [8, 4], [12, 2], [14, 2]],
  ];
  const MB_TROMMER = {
    pop: { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
    disko: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [0, 4, 8, 12], ohat: [2, 6, 10, 14] },
    blid: { kick: [0, 10], snare: [4, 12], hat: [0, 4, 8, 12], blid: true },
    march: { kick: [0, 8], snare: [4, 12, 14, 15], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
    lofi: { kick: [0, 7, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], blid: true },
  };
  const mbCache = {};
  function mbByg(id) {
    if (mbCache[id]) return mbCache[id];
    const s = MB_SANGE[id], st = MB_ST[s.album], r = rngFra("musicbox-" + id);
    const bpm = st.bpm[0] + Math.floor(r() * (st.bpm[1] - st.bpm[0] + 1)), stepDur = 60 / bpm / 4;
    const skala = MB_SKALA[st.skala], rod = 52 + Math.floor(r() * 8);
    const progA = MB_PROG[st.skala][Math.floor(r() * MB_PROG[st.skala].length)], progB = MB_PROG[st.skala][Math.floor(r() * MB_PROG[st.skala].length)];
    const lang = bpm < 90 ? 2 : 1;
    const tone = function (deg, okt) { const L = skala.length, o = Math.floor(deg / L); return rod + 12 * (okt + o) + skala[((deg % L) + L) % L]; };
    const akkord = function (prog, bar) { return prog[Math.floor(bar / lang) % prog.length]; };
    const rytmer = bpm < 90 ? [0, 2, 6, 3, 7] : [0, 1, 3, 4, 5, 7];
    function melodi(prog, loeft) {
      const takter = [];
      let cur = 7 + loeft;
      for (let b = 0; b < 4; b++) {
        const rt = MB_RYTME[rytmer[Math.floor(r() * rytmer.length)]], c = akkord(prog, b), noder = [];
        rt.forEach(function (n) {
          if (n[0] === 0 || n[0] === 8) {
            const kand = [c, c + 2, c + 4, c + 7, c + 9, c + 11].filter(function (d) { return d >= 2 + loeft && d <= 11 + loeft; });
            kand.sort(function (a, b2) { return Math.abs(a - cur) - Math.abs(b2 - cur); });
            cur = kand[Math.floor(r() * Math.min(2, kand.length))];
          } else {
            const t = r();
            cur += t < 0.35 ? 1 : t < 0.7 ? -1 : t < 0.82 ? 2 : t < 0.94 ? -2 : 0;
            cur = Math.max(1 + loeft, Math.min(11 + loeft, cur));
          }
          noder.push([n[0], n[1], cur]);
        });
        takter.push(noder);
      }
      // sidste takt i frasen ender på grundtonen
      const slut = [[0, 4, takter[0][0][2]], [4, 4, 9 + loeft > 11 + loeft ? 7 : 4 + loeft], [8, 8, 7 + loeft]];
      return takter.concat([takter[0], takter[1], takter[2], slut]);
    }
    const melA = melodi(progA, 0), melB = melodi(progB, 2);
    const dele = bpm > 110 ? [["intro", 2], ["A", 8], ["A2", 8], ["B", 8], ["A", 8], ["outro", 2]] : [["intro", 2], ["A", 8], ["B", 8], ["A", 8], ["outro", 2]];
    const steps = [];
    const tr = st.trommer && MB_TROMMER[st.trommer];
    dele.forEach(function (del) {
      const navn = del[0], prog = navn === "B" ? progB : progA;
      for (let b = 0; b < del[1]; b++) {
        const takt = [];
        for (let i = 0; i < 16; i++) takt.push([]);
        const c = navn === "outro" ? 0 : akkord(prog, b);
        // pad: akkorden
        if (navn === "outro" ? b === 0 : b % lang === 0) [c, c + 2, c + 4].forEach(function (d) { takt[0].push({ i: "pad", f: tone(d, 0), d: navn === "outro" ? 32 : 16 * lang }); });
        if (navn === "outro") { if (b === 0) { takt[0].push({ i: "bas", f: tone(0, -1), d: 24 }); takt[0].push({ i: "mel", f: tone(7, 1), d: 24 }); if (tr) takt[0].push({ i: "kick" }); } steps.push.apply(steps, takt); continue; }
        // bas
        const br = tone(c, -1), b5 = tone(c + 4, -1);
        if (navn !== "intro") {
          if (st.bas === "en") takt[0].push({ i: "bas", f: br, d: 16 });
          if (st.bas === "to") { takt[0].push({ i: "bas", f: br, d: 7 }); takt[8].push({ i: "bas", f: r() < 0.5 ? br : b5, d: 7 }); }
          if (st.bas === "otte") for (let k = 0; k < 16; k += 2) takt[k].push({ i: "bas", f: k % 4 === 2 ? br + 12 : br, d: 2 });
          if (st.bas === "hop") { takt[0].push({ i: "bas", f: br, d: 5 }); takt[6].push({ i: "bas", f: br, d: 2 }); takt[8].push({ i: "bas", f: b5, d: 5 }); takt[14].push({ i: "bas", f: br, d: 2 }); }
        }
        // arpeggio
        if (st.arp) {
          const trin = bpm < 90 ? 4 : 2, toner = [c, c + 2, c + 4, c + 7];
          for (let k = 0; k < 16; k += trin) takt[k].push({ i: "arp", f: tone(toner[(k / trin) % 4], 1), d: trin });
        }
        // melodi
        if (navn === "A" || navn === "A2" || navn === "B") {
          const mel = navn === "B" ? melB : melA;
          mel[b % 8].forEach(function (n) {
            let d = n[2];
            if (navn === "A2" && n[0] >= 8 && r() < 0.3) d += r() < 0.5 ? 1 : -1;
            takt[n[0]].push({ i: "mel", f: tone(d, 1), d: n[1] });
          });
        }
        // trommer
        if (tr && navn !== "intro") {
          ["kick", "snare", "hat", "ohat"].forEach(function (k) { (tr[k] || []).forEach(function (p) { takt[p].push({ i: k, blid: tr.blid }); }); });
          if (b === del[1] - 1 && st.trommer !== "blid") [12, 13, 14, 15].forEach(function (p) { takt[p].push({ i: "snare", blid: true }); });
        }
        if (st.regn && b % 2 === 0) takt[0].push({ i: "regn", d: 32 });
        steps.push.apply(steps, takt);
      }
    });
    return (mbCache[id] = { stepDur: stepDur, total: steps.length, steps: steps, bpm: bpm, st: st });
  }

  // ----- afspilleren -----
  let mb = { ctx: null, master: null, an: null, ekko: null, stoej: null, sang: null, data: null, step: 0, startCtx: 0, startStep: 0, naesteTid: 0, spiller: false };
  let mbKoe = { bruger: [], liste: [], kildeListe: [], kilde: "" }, mbHist = [];
  function mbGemt() { return hentGemt("mit-hotel-telefon-musik-" + mig(), {}); }
  let mbS = null;
  function mbIndst() {
    if (mbS && mbS.ejer === mig()) return mbS;
    mbS = Object.assign({ fav: [], pl: [], vol: 0.8, gentag: "fra", bland: false, senest: [] }, mbGemt());
    mbS.ejer = mig();
    return mbS;
  }
  function gemMb() { const s = mbIndst(); gemGemt("mit-hotel-telefon-musik-" + mig(), { fav: s.fav, pl: s.pl, vol: s.vol, gentag: s.gentag, bland: s.bland, senest: s.senest.slice(0, 12) }); }
  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function mbLydOk() {
    try {
      if (!mb.ctx) {
        mb.ctx = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
        lydKontekst = mb.ctx;
        mb.an = mb.ctx.createAnalyser(); mb.an.fftSize = 64; mb.an.smoothingTimeConstant = 0.75;
        mb.an.connect(mb.ctx.destination);
        const n = mb.ctx.sampleRate, buf = mb.ctx.createBuffer(1, n, n), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        mb.stoej = buf;
      }
      if (mb.ctx.state === "suspended") mb.ctx.resume();
      return true;
    } catch (e) { return false; }
  }
  function mbNyMaster() {
    const c = mb.ctx;
    if (mb.master) { const gl = mb.master; try { gl.gain.cancelScheduledValues(c.currentTime); gl.gain.setTargetAtTime(0, c.currentTime, 0.03); } catch (e) {} setTimeout(function () { try { gl.disconnect(); } catch (e) {} }, 500); }
    mb.master = c.createGain();
    mb.master.gain.value = mbIndst().vol * 0.9;
    mb.master.connect(mb.an);
    mb.ekko = null;
    if (mb.data && mb.data.st.ekko) {
      const dl = c.createDelay(1), fb = c.createGain(), ud = c.createGain();
      dl.delayTime.value = mb.data.stepDur * 3; fb.gain.value = 0.32; ud.gain.value = 0.35;
      dl.connect(fb); fb.connect(dl); dl.connect(ud); ud.connect(mb.master);
      mb.ekko = dl;
    }
  }
  function mbTone(f, t, dur, type, gain, att, rel, ekko, filter) {
    const c = mb.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + att);
    g.gain.setValueAtTime(gain, Math.max(t + att, t + dur - rel * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
    let ud = g;
    if (filter) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = filter; g.connect(fl); ud = fl; }
    o.connect(g); ud.connect(mb.master);
    if (ekko && mb.ekko) ud.connect(mb.ekko);
    o.start(t); o.stop(t + dur + rel + 0.05);
  }
  function mbStoej(t, dur, gain, hp, lp) {
    const c = mb.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = mb.stoej;
    let sidst = s;
    if (hp) { const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; sidst.connect(f); sidst = f; }
    if (lp) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; sidst.connect(f); sidst = f; }
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sidst.connect(g); g.connect(mb.master);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function mbSpilEvent(e, t) {
    const D = mb.data, sd = D.stepDur, st = D.st;
    if (e.i === "pad") mbTone(midiHz(e.f), t, e.d * sd, st.pad, st.pad === "square" ? 0.018 : 0.04, 0.25, 0.6, true, st.pad === "square" ? 1400 : 0);
    else if (e.i === "bas") mbTone(midiHz(e.f), t, e.d * sd * 0.95, st.mel === "square" && st.bas === "otte" ? "square" : "triangle", st.bas === "otte" ? 0.12 : 0.16, 0.01, 0.08, false, 700);
    else if (e.i === "mel") mbTone(midiHz(e.f), t, e.d * sd * 0.9, st.mel, st.mel === "sawtooth" ? 0.035 : st.mel === "square" ? 0.04 : 0.09, 0.012, 0.12, true, st.mel === "sawtooth" ? 2400 : st.mel === "square" ? 3200 : 0);
    else if (e.i === "arp") mbTone(midiHz(e.f), t, e.d * sd * 0.8, st.mel === "square" ? "square" : "sine", st.mel === "square" ? 0.014 : 0.035, 0.005, 0.15, true, 0);
    else if (e.i === "kick") {
      const c = mb.ctx, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      g.gain.setValueAtTime(e.blid ? 0.35 : 0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(mb.master); o.start(t); o.stop(t + 0.3);
    }
    else if (e.i === "snare") { mbStoej(t, e.blid ? 0.09 : 0.16, e.blid ? 0.07 : 0.18, 1400, 0); if (!e.blid) mbTone(190, t, 0.04, "triangle", 0.08, 0.002, 0.06, false, 0); }
    else if (e.i === "hat") mbStoej(t, 0.035, e.blid ? 0.025 : 0.045, 7000, 0);
    else if (e.i === "ohat") mbStoej(t, 0.14, 0.04, 6500, 0);
    else if (e.i === "regn") mbStoej(t, e.d * sd, 0.022, 400, 2200);
  }
  function mbTick() {
    if (mb.ekte && mb.spiller && ind.bat <= 0) { mbPause(); lille("🎵 Musikken stoppede – telefonen er løbet tør"); return; }
    if (!mb.spiller || !mb.ctx || !mb.data) return;
    if (ind.bat <= 0) { mbPause(); lille("🎵 Musikken stoppede – telefonen er løbet tør"); return; }
    const frem = document.hidden ? 2.5 : 0.35, c = mb.ctx;
    while (mb.naesteTid < c.currentTime + frem && mb.step < mb.data.total) {
      if (mb.naesteTid >= c.currentTime - 0.02) mb.data.steps[mb.step].forEach(function (e) { try { mbSpilEvent(e, mb.naesteTid); } catch (x) {} });
      mb.step++; mb.naesteTid += mb.data.stepDur;
    }
    if (mb.step >= mb.data.total && c.currentTime > mb.naesteTid + 0.6) mbNaeste(true);
  }
  setInterval(mbTick, 40);
  function mbPos() {
    if (mb.ekte) return mb.ekte.currentTime || 0;
    if (!mb.data) return 0;
    if (!mb.spiller || !mb.ctx) return mb.step * mb.data.stepDur;
    return Math.max(0, Math.min(mb.data.total, (mb.ctx.currentTime - mb.startCtx) / mb.data.stepDur + mb.startStep)) * mb.data.stepDur;
  }
  function mbLaengde(id) { if (MB_SANGE[id] && MB_SANGE[id].fil) return mbVarighed[id] || 0; const d = mbByg(id); return d.total * d.stepDur; }
  function mbStart(fraStep) {
    if (!mbLydOk()) { lille("Telefonen kan ikke spille lyd lige nu"); return; }
    mb.step = fraStep || 0;
    mbNyMaster();
    mb.naesteTid = mb.ctx.currentTime + 0.06;
    mb.startCtx = mb.naesteTid; mb.startStep = mb.step;
    mb.spiller = true;
    mbTick();
  }
  function mbSpil(id) {
    const s = mbIndst();
    s.senest = [id].concat(s.senest.filter(function (x) { return x !== id; })).slice(0, 12); gemMb();
    mbStopEkte();
    if (MB_SANGE[id].fil) { mbSpilEkte(id); mbOpdater(true); return; }
    mb.sang = id; mb.data = mbByg(id);
    mbStart(0);
    mbOpdater(true);
  }
  function mbPause() {
    if (!mb.spiller) return;
    if (mb.ekte) { mb.ekte.pause(); mb.spiller = false; mbOpdater(); return; }
    mb.step = Math.floor(mbPos() / mb.data.stepDur);
    mb.spiller = false;
    if (mb.master) { try { mb.master.gain.setTargetAtTime(0, mb.ctx.currentTime, 0.04); } catch (e) {} }
    mbOpdater();
  }
  function mbFortsaet() { if (!mb.sang) return; if (mb.ekte) { mb.ekte.play().catch(function () {}); mb.spiller = true; mbOpdater(); return; } if (mb.step >= mb.data.total) mb.step = 0; mbStart(mb.step); mbOpdater(); }
  function mbSpolTil(frac) {
    if (mb.ekte) { if (mb.ekte.duration) mb.ekte.currentTime = Math.max(0, Math.min(0.999, frac)) * mb.ekte.duration; mbOpdater(); return; }
    if (!mb.data) return;
    const st = Math.max(0, Math.min(mb.data.total - 1, Math.floor(frac * mb.data.total)));
    if (mb.spiller) mbStart(st); else mb.step = st;
    mbOpdater();
  }
  function mbStop() { mbStopEkte(); mb.spiller = false; if (mb.master) try { mb.master.gain.setTargetAtTime(0, mb.ctx.currentTime, 0.03); } catch (e) {} mb.sang = null; mb.data = null; mbKoe = { bruger: [], liste: [], kildeListe: [], kilde: "" }; mbOpdater(); }
  function mbBlandet(l) { l = l.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }
  function mbAfspilListe(ids, start, kilde, bland) {
    if (!ids.length) return;
    const s = mbIndst();
    if (bland != null) { s.bland = bland; gemMb(); }
    let l = ids.slice();
    if (s.bland) { l = mbBlandet(l); if (start) { l = l.filter(function (x) { return x !== start; }); l.unshift(start); } }
    const i = start ? Math.max(0, l.indexOf(start)) : 0;
    mbKoe.kildeListe = ids.slice(); mbKoe.kilde = kilde;
    mbKoe.liste = l.slice(i + 1);
    mbHist = [];
    mbSpil(l[i]);
  }
  function mbNaeste(auto) {
    const s = mbIndst();
    if (auto && s.gentag === "en" && mb.sang) { mbSpil(mb.sang); return; }
    let n = mbKoe.bruger.shift() || mbKoe.liste.shift();
    if (!n && s.gentag === "alle" && mbKoe.kildeListe.length) { mbKoe.liste = s.bland ? mbBlandet(mbKoe.kildeListe) : mbKoe.kildeListe.slice(); n = mbKoe.liste.shift(); }
    if (n) { if (mb.sang) mbHist.push(mb.sang); mbSpil(n); return; }
    if (auto) { mb.spiller = false; mb.step = 0; mbOpdater(); }
    else lille("Der er ikke flere sange i køen");
  }
  function mbForrige() {
    if (mbPos() > 3 || !mbHist.length) { mbSpolTil(0); if (!mb.spiller) mbFortsaet(); return; }
    mbKoe.liste.unshift(mb.sang);
    mbSpil(mbHist.pop());
  }
  function mbSaetBland(til) {
    const s = mbIndst(); s.bland = til; gemMb();
    if (!mbKoe.kildeListe.length) return;
    if (til) mbKoe.liste = mbBlandet(mbKoe.liste);
    else { const i = mbKoe.kildeListe.indexOf(mb.sang); mbKoe.liste = i >= 0 ? mbKoe.kildeListe.slice(i + 1) : mbKoe.liste; }
  }
  function erFav(id) { return mbIndst().fav.indexOf(id) >= 0; }
  function skiftFav(id) {
    const s = mbIndst(), i = s.fav.indexOf(id);
    if (i >= 0) s.fav.splice(i, 1); else s.fav.unshift(id);
    gemMb(); lille(i >= 0 ? "Fjernet fra favoritter" : "❤️ Lagt i favoritter");
  }
  function mbTidTekst(sek) { sek = Math.max(0, Math.round(sek)); return Math.floor(sek / 60) + ":" + ("0" + sek % 60).slice(-2); }

  // ----- covers (tegnet af koden ud fra stemningen) -----
  function mbCover(albumId, kl2) {
    const st = MB_ST[albumId], a = mbAlbum(albumId), r = rngFra("cover-" + albumId), id = "mbg" + albumId;
    let fig = "";
    if (st.form === "sol") fig = "<circle cx='70' cy='34' r='18' fill='#fff6' /><circle cx='70' cy='34' r='12' fill='#fff9'/>";
    if (st.form === "maane") fig = "<circle cx='68' cy='30' r='14' fill='#fff8e0'/><circle cx='74' cy='26' r='12' fill='" + st.farver[1] + "'/>" + [1, 2, 3, 4, 5, 6].map(function () { return "<circle cx='" + Math.round(r() * 100) + "' cy='" + Math.round(r() * 55) + "' r='1' fill='#fff'/>"; }).join("");
    if (st.form === "prikker") for (let i = 0; i < 14; i++) fig += "<circle cx='" + Math.round(r() * 100) + "' cy='" + Math.round(r() * 100) + "' r='" + (2 + Math.round(r() * 7)) + "' fill='#fff' opacity='" + (0.15 + r() * 0.4).toFixed(2) + "'/>";
    if (st.form === "boelger") for (let i = 0; i < 4; i++) fig += "<path d='M0 " + (55 + i * 12) + " Q25 " + (45 + i * 12) + " 50 " + (55 + i * 12) + " T100 " + (55 + i * 12) + "' stroke='#fff' stroke-opacity='.35' stroke-width='4' fill='none'/>";
    if (st.form === "bjerge") fig = "<path d='M0 80 L28 42 L46 64 L66 30 L100 80Z' fill='#0003'/><path d='M60 38 L66 30 L72 38Z' fill='#fff8'/><circle cx='22' cy='24' r='7' fill='#fff6'/>";
    if (st.form === "stjerner") for (let i = 0; i < 12; i++) { const x = Math.round(r() * 100), y = Math.round(r() * 70), s = 1 + r() * 2.5; fig += "<path d='M" + x + " " + (y - s * 2) + " L" + (x + s / 2) + " " + (y - s / 2) + " L" + (x + s * 2) + " " + y + " L" + (x + s / 2) + " " + (y + s / 2) + " L" + x + " " + (y + s * 2) + " L" + (x - s / 2) + " " + (y + s / 2) + " L" + (x - s * 2) + " " + y + " L" + (x - s / 2) + " " + (y - s / 2) + "Z' fill='#fff' opacity='.8'/>"; }
    if (st.form === "striber") for (let i = 0; i < 6; i++) fig += "<rect x='" + (i * 18 - 4) + "' y='0' width='8' height='100' fill='#fff' opacity='.12' transform='rotate(20 50 50)'/>";
    if (st.form === "regn") for (let i = 0; i < 22; i++) { const x = Math.round(r() * 110), y = Math.round(r() * 100); fig += "<line x1='" + x + "' y1='" + y + "' x2='" + (x - 4) + "' y2='" + (y + 10) + "' stroke='#fff' stroke-opacity='.45' stroke-width='1.5'/>"; }
    if (st.form === "pixel") for (let i = 0; i < 18; i++) fig += "<rect x='" + Math.floor(r() * 10) * 10 + "' y='" + Math.floor(r() * 10) * 10 + "' width='10' height='10' fill='#fff' opacity='" + (0.1 + r() * 0.3).toFixed(2) + "'/>";
    return "<span class='mb-cover " + (kl2 || "") + "'><svg viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='" + id + "' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='" + st.farver[0] + "'/><stop offset='1' stop-color='" + st.farver[1] + "'/></linearGradient></defs>" +
      "<rect width='100' height='100' fill='url(#" + id + ")'/>" + fig + "<text x='50' y='70' font-size='30' text-anchor='middle'>" + st.ik + "</text>" +
      "<text x='50' y='92' font-size='8.5' font-weight='700' text-anchor='middle' fill='#fff' style='font-family:-apple-system,Segoe UI,sans-serif'>" + esc(a.titel.toUpperCase()).slice(0, 26) + "</text></svg></span>";
  }
  function mbPlCover(p) {
    const alb = []; p.sange.forEach(function (id) { const a = MB_SANGE[id] && MB_SANGE[id].album; if (a && alb.indexOf(a) < 0) alb.push(a); });
    if (alb.length < 2) return alb.length ? mbCover(alb[0]) : "<span class='mb-cover mb-tomcover'>📃</span>";
    return "<span class='mb-cover mb-mosaik'>" + [0, 1, 2, 3].map(function (i) { return mbCover(alb[i % alb.length]); }).join("") + "</span>";
  }

  // ----- appen -----
  let mbFane = "hjem", mbUnder = null, mbFuld = false, mbKoeVis = false, mbArk = null;
  function tegnMusik() {
    mbIndst();
    mbHentRigtige();
    mbUnder = null; mbFuld = false; mbArk = null; mbKoeVis = false;
    appEl.classList.add("mb-app");
    appEl.innerHTML = "<div class='mb-hoved'></div><div class='mb-side'></div><div class='mb-mini'></div>" +
      "<div class='mb-faner'>" + [["hjem", "🏠", "Hjem"], ["album", "💿", "Album"], ["fav", "❤️", "Favoritter"], ["pl", "📃", "Playlister"]].map(function (f) {
        return "<button data-mbfane='" + f[0] + "'><span>" + f[1] + "</span>" + f[2] + "</button>";
      }).join("") + "</div><div class='mb-fuld' hidden></div><div class='mb-arkbg' hidden></div>";
    appEl.addEventListener("click", mbKlik);
    appEl.addEventListener("input", function (e) {
      if (e.target.matches("[data-mbvol]")) { mbIndst().vol = +e.target.value / 100; gemMb(); if (mb.master && mb.spiller && !mb.ekte) mb.master.gain.setTargetAtTime(mbIndst().vol * 0.9, mb.ctx.currentTime, 0.02); if (mb.ekte) mb.ekte.volume = mbIndst().vol; }
    });
    appEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const f = e.target;
      if (f.matches("[data-mbnypl]")) {
        const navn = f.querySelector("input").value.trim(); if (!navn) return;
        const s = mbIndst(), p = { id: "p" + Date.now(), navn: navn.slice(0, 30), sange: [] };
        if (f.dataset.mbnypl) p.sange.push(f.dataset.mbnypl);
        s.pl.push(p); gemMb();
        lukMbArk();
        lille(f.dataset.mbnypl ? "📃 Lagt i " + p.navn : "📃 Playlisten " + p.navn + " er lavet");
        mbTegnSide();
      }
      if (f.matches("[data-mbomdoeb]")) {
        const p = mbPl(f.dataset.mbomdoeb), navn = f.querySelector("input").value.trim();
        if (p && navn) { p.navn = navn.slice(0, 30); gemMb(); }
        lukMbArk(); mbTegnSide();
      }
    });
    mbTegnSide();
    mbOpdater(true);
  }
  function mbPl(id) { return mbIndst().pl.filter(function (p) { return p.id === id; })[0]; }
  function mbRaekke(id, kilde, nr, iPl) {
    const s = MB_SANGE[id], a = mbAlbum(s.album), spiller = mb.sang === id;
    return "<li class='mb-r" + (spiller ? " nu" : "") + "' data-mbspil='" + id + "' data-mbkilde='" + kilde + "'>" + (nr ? "<span class='mb-nr'>" + (spiller ? mbBolger() : nr) + "</span>" : mbCover(s.album, "lille")) +
      "<span class='mb-rt'><b>" + esc(s.titel) + "</b><small>" + esc(s.kunstner) + " · " + (mbLaengde(id) ? mbTidTekst(mbLaengde(id)) : "🎤") + "</small></span>" +
      "<button class='mb-hj" + (erFav(id) ? " til" : "") + "' data-mbfav='" + id + "'>" + (erFav(id) ? "❤️" : "🤍") + "</button><button class='mb-mere' data-mbmere='" + id + "'" + (iPl ? " data-mbipl='" + iPl + "'" : "") + ">⋯</button></li>";
  }
  function mbBolger() { return "<span class='mb-boelger" + (mb.spiller ? " koer" : "") + "'><i></i><i></i><i></i></span>"; }
  function mbKildeIds(k) {
    if (!k) return [];
    if (k === "fav") return mbIndst().fav.slice();
    if (k === "alle") return Object.keys(MB_SANGE);
    if (k.indexOf("a:") === 0) return mbAlbumSange(k.slice(2));
    if (k.indexOf("p:") === 0) { const p = mbPl(k.slice(2)); return p ? p.sange.slice() : []; }
    if (k === "senest") return mbIndst().senest.slice();
    return [];
  }
  function mbKildeNavn(k) {
    if (k === "fav") return "Favoritter"; if (k === "alle") return "Alle sange"; if (k === "senest") return "Senest spillet";
    if (k.indexOf("a:") === 0) return mbAlbum(k.slice(2)).titel;
    if (k.indexOf("p:") === 0) { const p = mbPl(k.slice(2)); return p ? p.navn : "Playliste"; }
    return "";
  }
  function mbTegnSide() {
    if (!appEl || appNu !== "musik") return;
    const side = appEl.querySelector(".mb-side"), hoved = appEl.querySelector(".mb-hoved"), s = mbIndst();
    appEl.querySelectorAll("[data-mbfane]").forEach(function (b) { b.classList.toggle("valgt", b.dataset.mbfane === mbFane); });
    const tilb = "<button class='tlf-tb' data-mbtilb title='Tilbage'>" + ik("tilbage", 20) + "</button>";
    const hjem = "<button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + ik("tilbage", 20) + "</button>";
    let h = "";
    if (mbUnder && mbUnder.indexOf("a:") === 0) {
      const a = mbAlbum(mbUnder.slice(2)), st = MB_ST[a.id], ids = mbAlbumSange(a.id);
      hoved.innerHTML = "<div class='tlf-top'>" + tilb + "<h3></h3><span class='tlf-tb'></span></div>";
      h = "<div class='mb-albumtop'>" + mbCover(a.id, "stor") + "<b>" + esc(a.titel) + "</b><small>" + esc(a.kunstner) + " · " + st.ik + " " + st.navn + " · " + ids.length + (ids.length === 1 ? " sang" : " sange") + "</small>" +
        "<div class='mb-spilknap'><button data-mbspilalle='" + mbUnder + "'>▶ Afspil</button><button data-mbblandalle='" + mbUnder + "'>🔀 Bland</button></div></div>" +
        "<ul class='mb-liste'>" + ids.map(function (id, i) { return mbRaekke(id, mbUnder, i + 1); }).join("") + "</ul>";
    } else if (mbUnder && mbUnder.indexOf("p:") === 0) {
      const p = mbPl(mbUnder.slice(2));
      if (!p) { mbUnder = null; mbTegnSide(); return; }
      hoved.innerHTML = "<div class='tlf-top'>" + tilb + "<h3></h3><button class='tlf-tb' data-mbplmenu='" + p.id + "' title='Mere'>⋯</button></div>";
      const sek = p.sange.reduce(function (t, id) { return t + (MB_SANGE[id] ? mbLaengde(id) : 0); }, 0);
      h = "<div class='mb-albumtop'>" + mbPlCover(p).replace("mb-cover", "mb-cover stor") + "<b>" + esc(p.navn) + "</b><small>Playliste · " + p.sange.length + (p.sange.length === 1 ? " sang" : " sange") + " · " + Math.round(sek / 60) + " min</small>" +
        (p.sange.length ? "<div class='mb-spilknap'><button data-mbspilalle='" + mbUnder + "'>▶ Afspil</button><button data-mbblandalle='" + mbUnder + "'>🔀 Bland</button></div>" : "") + "</div>" +
        (p.sange.length ? "<ul class='mb-liste'>" + p.sange.filter(function (id) { return MB_SANGE[id]; }).map(function (id) { return mbRaekke(id, mbUnder, 0, p.id); }).join("") + "</ul>"
          : "<div class='mb-tom'>Playlisten er tom.<br>Tryk ⋯ ud for en sang og vælg <b>Tilføj til playliste</b>.</div>") +
        "<div class='mb-overskrift'>Forslag</div><ul class='mb-liste'>" + Object.keys(MB_SANGE).filter(function (id) { return p.sange.indexOf(id) < 0; }).sort(function () { return 0; }).slice(0, 5).map(function (id) {
          const x = MB_SANGE[id]; return "<li class='mb-r'>" + mbCover(x.album, "lille") + "<span class='mb-rt'><b>" + esc(x.titel) + "</b><small>" + esc(x.kunstner) + "</small></span><button class='mb-plus' data-mbtilpl='" + p.id + "' data-mbsang='" + id + "'>＋</button></li>";
        }).join("") + "</ul>";
    } else if (mbFane === "hjem") {
      hoved.innerHTML = "<div class='tlf-top'>" + hjem + "<h3>Music Box</h3><span class='tlf-tb'></span></div>";
      const t = new Date().getHours(), forslag = t < 9 ? "glad" : t < 15 ? "fokus" : t < 19 ? "hygge" : t < 22 ? "fest" : "rolig";
      h = "<div class='mb-velkommen'><b>" + (t < 10 ? "Godmorgen" : t < 18 ? "Hej" : "Godaften") + ", " + esc(mig()) + " 🎧</b><small>Al musikken er lavet af hotellet selv – helt uden ophavsret.</small></div>" +
        "<div class='mb-overskrift'>Hvordan har du det?</div><div class='mb-stemninger'>" + Object.keys(MB_ST).filter(function (k) { return k !== "rigtige"; }).map(function (k) {
          const st = MB_ST[k];
          return "<button data-mbstemning='" + k + "' style='background:linear-gradient(135deg," + st.farver[0] + "," + st.farver[1] + ")'><span>" + st.ik + "</span>" + st.navn + (k === forslag ? "<i>Forslag</i>" : "") + "</button>";
        }).join("") + "</div>" +
        "<div class='mb-overskrift'>Album</div><div class='mb-karrusel'>" + MB_ALBUM.map(function (a) { return "<button data-mbalbum='" + a.id + "'>" + mbCover(a.id) + "<b>" + esc(a.titel) + "</b><small>" + esc(a.kunstner) + "</small></button>"; }).join("") + "</div>" +
        (s.senest.length ? "<div class='mb-overskrift'>Senest spillet</div><ul class='mb-liste'>" + s.senest.slice(0, 4).filter(function (id) { return MB_SANGE[id]; }).map(function (id) { return mbRaekke(id, "senest"); }).join("") + "</ul>" : "") +
        "<button class='mb-allesange' data-mbspilalle='alle' data-mbbland='1'>🔀 Bland alle " + Object.keys(MB_SANGE).length + " sange</button>";
    } else if (mbFane === "album") {
      hoved.innerHTML = "<div class='tlf-top'>" + hjem + "<h3>Album</h3><span class='tlf-tb'></span></div>";
      h = "<div class='mb-albumgrid'>" + MB_ALBUM.map(function (a) { return "<button data-mbalbum='" + a.id + "'>" + mbCover(a.id) + "<b>" + esc(a.titel) + "</b><small>" + MB_ST[a.id].ik + " " + MB_ST[a.id].navn + "</small></button>"; }).join("") + "</div>";
    } else if (mbFane === "fav") {
      hoved.innerHTML = "<div class='tlf-top'>" + hjem + "<h3>Favoritter</h3><span class='tlf-tb'></span></div>";
      h = s.fav.length ? "<div class='mb-favtop'><span>❤️</span><b>" + s.fav.length + " favorit" + (s.fav.length === 1 ? "" : "ter") + "</b><div class='mb-spilknap'><button data-mbspilalle='fav'>▶ Afspil</button><button data-mbblandalle='fav'>🔀 Bland</button></div></div>" +
        "<ul class='mb-liste'>" + s.fav.filter(function (id) { return MB_SANGE[id]; }).map(function (id) { return mbRaekke(id, "fav"); }).join("") + "</ul>"
        : "<div class='mb-tom'><span>🤍</span>Ingen favoritter endnu.<br>Tryk på hjertet ud for en sang.</div>";
    } else if (mbFane === "pl") {
      hoved.innerHTML = "<div class='tlf-top'>" + hjem + "<h3>Playlister</h3><button class='tlf-tb' data-mbnyplknap title='Ny playliste'>＋</button></div>";
      h = "<ul class='mb-pllist'><li data-mbnyplknap class='mb-nypl'><span class='mb-cover mb-tomcover'>＋</span><b>Ny playliste …</b></li>" + s.pl.map(function (p) {
        return "<li data-mbpl='" + p.id + "'>" + mbPlCover(p) + "<span><b>" + esc(p.navn) + "</b><small>" + p.sange.length + (p.sange.length === 1 ? " sang" : " sange") + "</small></span></li>";
      }).join("") + "</ul>" + (s.pl.length ? "" : "<div class='mb-tom'>Lav din første playliste med ＋.</div>");
    }
    side.innerHTML = h;
  }
  function mbOpdater(helt) {
    if (!appEl || appNu !== "musik") return;
    const mini = appEl.querySelector(".mb-mini");
    if (mini) {
      if (!mb.sang) mini.innerHTML = "<div class='mb-minitom'>🎵 Vælg en sang eller en stemning</div>";
      else {
        const s = MB_SANGE[mb.sang];
        if (helt || !mini.querySelector("[data-mbminiinfo='" + mb.sang + "']")) mini.innerHTML = "<div class='mb-miniind' data-mbaabnfuld data-mbminiinfo='" + mb.sang + "'>" + mbCover(s.album, "lille") + "<span class='mb-rt'><b>" + esc(s.titel) + "</b><small>" + esc(s.kunstner) + "</small></span>" +
          "<button data-mbpp class='mb-pp'></button><button data-mbnaeste class='mb-nx'>⏭</button></div><div class='mb-minibar'><i></i></div>";
        mini.querySelector("[data-mbpp]").textContent = mb.spiller ? "⏸" : "▶";
        mini.querySelector(".mb-minibar i").style.width = (mbPos() / mbLaengde(mb.sang) * 100) + "%";
      }
    }
    if (helt) { appEl.querySelectorAll(".mb-r").forEach(function (li) { li.classList.toggle("nu", li.dataset.mbspil === mb.sang); const n = li.querySelector(".mb-nr"); if (n) n.innerHTML = li.dataset.mbspil === mb.sang ? mbBolger() : (Array.prototype.indexOf.call(li.parentNode.children, li) + 1); }); }
    appEl.querySelectorAll(".mb-boelger").forEach(function (b) { b.classList.toggle("koer", mb.spiller); });
    if (mbFuld) mbTegnFuld(helt);
  }
  setInterval(function () { if (appNu === "musik" && appEl && mb.sang) mbOpdater(); }, 250);
  function mbTegnFuld(helt) {
    const f = appEl.querySelector(".mb-fuld"), s = mbIndst();
    if (!mb.sang) { mbFuld = false; f.hidden = true; return; }
    f.hidden = false;
    const x = MB_SANGE[mb.sang], a = mbAlbum(x.album), st = MB_ST[x.album], L = mbLaengde(mb.sang), p = mbPos();
    if (helt || !f.querySelector("[data-mbfuldsang='" + mb.sang + "']") || f.dataset.koe !== String(mbKoeVis)) {
      f.dataset.koe = String(mbKoeVis);
      f.style.background = "linear-gradient(170deg," + st.farver[0] + "," + st.farver[1] + " 70%)";
      f.innerHTML = "<div class='mb-fuldtop' data-mbfuldsang='" + mb.sang + "'><button data-mbluk>⌄</button><span>" + (mbKoe.kilde ? "Spiller fra<b>" + esc(mbKildeNavn(mbKoe.kilde)) + "</b>" : "Spiller nu") + "</span><button data-mbkoe class='" + (mbKoeVis ? "til" : "") + "'>☰</button></div>" +
        (mbKoeVis ? mbKoeHtml() : "<div class='mb-fuldcover" + (mb.spiller ? " spiller" : "") + "'>" + mbCover(x.album, "kaempe") + "</div><canvas class='mb-viz' width='240' height='40'></canvas>") +
        "<div class='mb-fuldinfo'><span><b>" + esc(x.titel) + "</b><small>" + esc(x.kunstner) + " · " + esc(x.fil ? (x.licens || "Fri musik") : a.titel) + "</small></span><button data-mbfav='" + mb.sang + "' class='mb-hj'>" + (erFav(mb.sang) ? "❤️" : "🤍") + "</button></div>" +
        "<div class='mb-spol' data-mbspol><i></i><b></b></div><div class='mb-tider'><span class='t1'></span><span class='t2'></span></div>" +
        "<div class='mb-kontrol'><button data-mbbland class='" + (s.bland ? "til" : "") + "' title='Bland'>🔀</button><button data-mbforrige>⏮</button><button data-mbpp class='stor'></button><button data-mbnaeste>⏭</button>" +
        "<button data-mbgentag class='" + (s.gentag !== "fra" ? "til" : "") + "' title='Gentag'>" + (s.gentag === "en" ? "🔂" : "🔁") + "</button></div>" +
        "<div class='mb-vol'><span>🔈</span><input type='range' min='0' max='100' data-mbvol value='" + Math.round(s.vol * 100) + "'><span>🔊</span></div>";
    }
    f.querySelector(".mb-spol i").style.width = (p / L * 100) + "%";
    f.querySelector(".mb-spol b").style.left = (p / L * 100) + "%";
    f.querySelector(".t1").textContent = mbTidTekst(p);
    f.querySelector(".t2").textContent = "-" + mbTidTekst(L - p);
    f.querySelector(".mb-kontrol [data-mbpp]").textContent = mb.spiller ? "⏸" : "▶";
    const c = f.querySelector(".mb-fuldcover"); if (c) c.classList.toggle("spiller", mb.spiller);
  }
  // lille lyd-visualisering
  (function viz() {
    requestAnimationFrame(viz);
    if (!mbFuld || !appEl || appNu !== "musik") return;
    const c = appEl.querySelector(".mb-viz");
    if (!c) return;
    if (mb.ekte) {   // rigtige sange: blødt hoppende søjler
      const g2 = c.getContext("2d"), tt = performance.now() / 1000;
      g2.clearRect(0, 0, c.width, c.height); g2.fillStyle = "rgba(255,255,255,.75)";
      for (let i = 0; i < 24; i++) { const v = mb.spiller ? 0.25 + 0.6 * Math.abs(Math.sin(tt * (2 + (i % 5) * 0.7) + i * 1.3)) * (1 - Math.abs(i - 11.5) / 16) : 0, h = Math.max(2, v * c.height); g2.fillRect(i * 10 + 2, (c.height - h) / 2, 6, h); }
      return;
    }
    if (!mb.an) return;
    const g = c.getContext("2d"), d = new Uint8Array(mb.an.frequencyBinCount);
    mb.an.getByteFrequencyData(d);
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = "rgba(255,255,255,.75)";
    const n = 24, w = c.width / n;
    for (let i = 0; i < n; i++) { const v = mb.spiller ? d[i + 1] / 255 : 0, h = Math.max(2, v * c.height); g.fillRect(i * w + 2, (c.height - h) / 2, w - 4, h); }
  })();
  function mbKoeHtml() {
    const x = MB_SANGE[mb.sang], r = function (id, i, slags) {
      const s = MB_SANGE[id]; if (!s) return "";
      return "<li>" + mbCover(s.album, "lille") + "<span class='mb-rt'><b>" + esc(s.titel) + "</b><small>" + esc(s.kunstner) + "</small></span><button data-mbkoeslet='" + slags + ":" + i + "'>✕</button></li>";
    };
    return "<div class='mb-koe'><div class='mb-kt'>Spiller nu</div><ul><li class='nu'>" + mbCover(x.album, "lille") + "<span class='mb-rt'><b>" + esc(x.titel) + "</b><small>" + esc(x.kunstner) + "</small></span>" + mbBolger() + "</li></ul>" +
      (mbKoe.bruger.length ? "<div class='mb-kt'>Næste i køen <button data-mbrydkoe>Ryd</button></div><ul>" + mbKoe.bruger.map(function (id, i) { return r(id, i, "b"); }).join("") + "</ul>" : "") +
      "<div class='mb-kt'>" + (mbKoe.kilde ? "Næste fra " + esc(mbKildeNavn(mbKoe.kilde)) : "Næste") + (mbIndst().gentag === "alle" ? " · 🔁" : "") + "</div>" +
      (mbKoe.liste.length ? "<ul>" + mbKoe.liste.slice(0, 30).map(function (id, i) { return r(id, i, "l"); }).join("") + "</ul>" : "<div class='mb-ktom'>Ikke flere sange. Tryk ⋯ ud for en sang → Tilføj til kø.</div>") + "</div>";
  }
  function visMbArk(html) {
    const b = appEl.querySelector(".mb-arkbg");
    b.innerHTML = "<div class='mb-ark'>" + html + "<button class='luk' data-mbarkluk>Annullér</button></div>";
    b.hidden = false;
    mbArk = true;
  }
  function lukMbArk() { const b = appEl && appEl.querySelector(".mb-arkbg"); if (b) b.hidden = true; mbArk = null; }
  function mbSangMenu(id, iPl) {
    const s = MB_SANGE[id], pl = mbIndst().pl;
    visMbArk("<div class='mb-arktop'>" + mbCover(s.album, "lille") + "<span><b>" + esc(s.titel) + "</b><small>" + esc(s.kunstner) + "</small></span></div>" +
      (s.fil ? "<div class='mb-licens'>ℹ️ Lovlig at bruge: <b>" + esc(s.licens || "Fri musik") + "</b>" + (s.kilde ? " · " + esc(s.kilde) : "") + "</div>" : "") +
      "<button data-mbak='spil' data-id='" + id + "'>▶ Spil nu</button><button data-mbak='naeste' data-id='" + id + "'>⏭ Spil som det næste</button>" +
      "<button data-mbak='koe' data-id='" + id + "'>➕ Tilføj til køen</button><button data-mbak='fav' data-id='" + id + "'>" + (erFav(id) ? "💔 Fjern fra favoritter" : "❤️ Læg i favoritter") + "</button>" +
      "<div class='mb-arkt'>Tilføj til playliste</div>" + pl.map(function (p) { return "<button data-mbak='pl' data-id='" + id + "' data-pl='" + p.id + "'>📃 " + esc(p.navn) + (p.sange.indexOf(id) >= 0 ? " ✓" : "") + "</button>"; }).join("") +
      "<form class='mb-nyform' data-mbnypl='" + id + "'><input placeholder='＋ Ny playliste …' maxlength='30'><button>Lav</button></form>" +
      (iPl ? "<button class='rod' data-mbak='fjernpl' data-id='" + id + "' data-pl='" + iPl + "'>➖ Fjern fra denne playliste</button>" : "") +
      "<button data-mbak='album' data-id='" + id + "'>💿 Gå til albummet</button>");
  }
  function mbKlik(e) {
    const t = e.target, s = mbIndst();
    const fn = t.closest("[data-mbfane]");
    if (fn) { mbFane = fn.dataset.mbfane; mbUnder = null; mbTegnSide(); appEl.querySelector(".mb-side").scrollTop = 0; return; }
    if (t.closest("[data-mbtilb]")) { mbUnder = null; mbTegnSide(); return; }
    if (t.closest("[data-mbarkluk]") || t.classList.contains("mb-arkbg")) { lukMbArk(); return; }
    const ak = t.closest("[data-mbak]");
    if (ak) {
      const h = ak.dataset.mbak, id = ak.dataset.id;
      if (h === "spil") { mbAfspilListe([id], id, mbKoe.kilde || "", null); }
      if (h === "naeste") { if (!mb.sang) mbAfspilListe([id], id, "", null); else { mbKoe.bruger.unshift(id); lille("⏭ Spilles som det næste"); } }
      if (h === "koe") { if (!mb.sang) mbAfspilListe([id], id, "", null); else { mbKoe.bruger.push(id); lille("➕ Lagt i køen"); } }
      if (h === "fav") skiftFav(id);
      if (h === "pl") { const p = mbPl(ak.dataset.pl); if (p) { if (p.sange.indexOf(id) < 0) { p.sange.push(id); lille("📃 Lagt i " + p.navn); } else lille("Den er allerede i " + p.navn); gemMb(); } }
      if (h === "fjernpl") { const p = mbPl(ak.dataset.pl); if (p) { p.sange = p.sange.filter(function (x) { return x !== id; }); gemMb(); lille("➖ Fjernet fra " + p.navn); } }
      if (h === "album") { mbUnder = "a:" + MB_SANGE[id].album; mbFuld = false; appEl.querySelector(".mb-fuld").hidden = true; }
      if (h === "omdoeb") {
        const p = mbPl(ak.dataset.pl);
        visMbArk("<div class='mb-arkt'>Omdøb playlisten</div><form class='mb-nyform' data-mbomdoeb='" + p.id + "'><input value='" + esc(p.navn) + "' maxlength='30'><button>Gem</button></form>");
        appEl.querySelector("[data-mbomdoeb] input").select(); return;
      }
      if (h === "spilpl") { const ids = mbKildeIds("p:" + ak.dataset.pl); mbAfspilListe(ids, null, "p:" + ak.dataset.pl, false); }
      if (h === "sletpl") {
        if (!ak.classList.contains("sikker")) { ak.classList.add("sikker"); ak.textContent = "Er du sikker? Tryk igen"; return; }
        s.pl = s.pl.filter(function (p) { return p.id !== ak.dataset.pl; }); gemMb(); mbUnder = null; lille("🗑 Playlisten er slettet");
      }
      lukMbArk(); mbTegnSide(); mbOpdater(true); return;
    }
    const pm = t.closest("[data-mbplmenu]");
    if (pm) {
      const p = mbPl(pm.dataset.mbplmenu);
      visMbArk("<div class='mb-arkt'>" + esc(p.navn) + "</div><button data-mbak='spilpl' data-pl='" + p.id + "'>▶ Afspil playlisten</button><button data-mbak='omdoeb' data-pl='" + p.id + "'>✏️ Omdøb</button><button class='rod' data-mbak='sletpl' data-pl='" + p.id + "'>🗑 Slet playlisten</button>");
      return;
    }
    const fv = t.closest("[data-mbfav]");
    if (fv) { skiftFav(fv.dataset.mbfav); if (mbFane === "fav" && !mbUnder) mbTegnSide(); else { const ny = erFav(fv.dataset.mbfav); appEl.querySelectorAll("[data-mbfav='" + fv.dataset.mbfav + "']").forEach(function (b) { b.textContent = ny ? "❤️" : "🤍"; b.classList.toggle("til", ny); }); } return; }
    const me = t.closest("[data-mbmere]");
    if (me) { mbSangMenu(me.dataset.mbmere, me.dataset.mbipl); return; }
    const tp = t.closest("[data-mbtilpl]");
    if (tp) { const p = mbPl(tp.dataset.mbtilpl); if (p) { p.sange.push(tp.dataset.mbsang); gemMb(); lille("📃 Lagt i " + p.navn); mbTegnSide(); } return; }
    if (t.closest("[data-mbnyplknap]")) { visMbArk("<div class='mb-arkt'>Ny playliste</div><form class='mb-nyform' data-mbnypl=''><input placeholder='Navn, fx Mine yndlings' maxlength='30'><button>Lav</button></form>"); appEl.querySelector("[data-mbnypl] input").focus(); return; }
    const pl = t.closest("[data-mbpl]");
    if (pl) { mbUnder = "p:" + pl.dataset.mbpl; mbTegnSide(); appEl.querySelector(".mb-side").scrollTop = 0; return; }
    const al = t.closest("[data-mbalbum]");
    if (al) { mbUnder = "a:" + al.dataset.mbalbum; mbTegnSide(); appEl.querySelector(".mb-side").scrollTop = 0; return; }
    const sm = t.closest("[data-mbstemning]");
    if (sm) { const k = sm.dataset.mbstemning; mbAfspilListe(mbAlbumSange(k), null, "a:" + k, true); lille(MB_ST[k].ik + " Spiller " + MB_ST[k].navn.toLowerCase() + " musik"); mbTegnSide(); return; }
    const sa = t.closest("[data-mbspilalle]"), ba = t.closest("[data-mbblandalle]");
    if (sa || ba) { const k = (sa || ba).dataset[sa ? "mbspilalle" : "mbblandalle"]; mbAfspilListe(mbKildeIds(k), null, k, !!ba || (sa && sa.dataset.mbbland === "1")); mbTegnSide(); return; }
    const r = t.closest("[data-mbspil]");
    if (r) { if (mb.sang === r.dataset.mbspil) { mbFuld = true; mbTegnFuld(true); return; } mbAfspilListe(mbKildeIds(r.dataset.mbkilde), r.dataset.mbspil, r.dataset.mbkilde, null); return; }
    if (t.closest("[data-mbpp]")) { if (mb.spiller) mbPause(); else mbFortsaet(); return; }
    if (t.closest("[data-mbnaeste]")) { mbNaeste(false); return; }
    if (t.closest("[data-mbforrige]")) { mbForrige(); return; }
    if (t.closest("[data-mbaabnfuld]")) { mbFuld = true; mbKoeVis = false; mbTegnFuld(true); return; }
    if (t.closest("[data-mbluk]")) { mbFuld = false; mbKoeVis = false; appEl.querySelector(".mb-fuld").hidden = true; mbTegnSide(); return; }
    if (t.closest("[data-mbkoe]")) { mbKoeVis = !mbKoeVis; mbTegnFuld(true); return; }
    if (t.closest("[data-mbbland]")) { mbSaetBland(!s.bland); lille(s.bland ? "🔀 Bland er slået til" : "Bland er slået fra"); mbTegnFuld(true); return; }
    if (t.closest("[data-mbgentag]")) { s.gentag = s.gentag === "fra" ? "alle" : s.gentag === "alle" ? "en" : "fra"; gemMb(); lille(s.gentag === "alle" ? "🔁 Gentag alle" : s.gentag === "en" ? "🔂 Gentag denne sang" : "Gentag er slået fra"); mbTegnFuld(true); return; }
    const ks = t.closest("[data-mbkoeslet]");
    if (ks) { const p = ks.dataset.mbkoeslet.split(":"); (p[0] === "b" ? mbKoe.bruger : mbKoe.liste).splice(+p[1], 1); mbTegnFuld(true); return; }
    if (t.closest("[data-mbrydkoe]")) { mbKoe.bruger = []; mbTegnFuld(true); return; }
    const sp = t.closest("[data-mbspol]");
    if (sp) { const rc = sp.getBoundingClientRect(); mbSpolTil((e.clientX - rc.left) / rc.width); return; }
  }
  nyStil("telefon-stil-musik", [
    ".tlf-app.mb-app { background: var(--t-hvid); }",
    ".mb-hoved { flex: none; } .mb-side { flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; padding-bottom: 10px; } .mb-side::-webkit-scrollbar { display: none; }",
    ".mb-velkommen { margin: 10px 12px 4px; padding: 12px; border-radius: 16px; background: linear-gradient(135deg, #ff7ad9, #7a3cff); color: #fff; } .mb-velkommen b { display: block; font-size: 16px; } .mb-velkommen small { font-size: 11.5px; opacity: .9; }",
    ".mb-overskrift { font-size: 17px; font-weight: 800; margin: 14px 12px 7px; }",
    ".mb-stemninger { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; padding: 0 12px; }",
    ".mb-stemninger button { position: relative; border: 0; border-radius: 13px; height: 62px; color: #fff; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-shadow: 0 1px 2px rgba(0,0,0,.3); box-shadow: 0 2px 6px rgba(0,0,0,.15); }",
    ".mb-stemninger button span { font-size: 22px; } .mb-stemninger button i { position: absolute; top: 4px; right: 5px; font-style: normal; font-size: 8.5px; background: rgba(255,255,255,.9); color: #7a3cff; border-radius: 6px; padding: 1px 4px; text-shadow: none; }",
    ".mb-stemninger button:active { transform: scale(.96); }",
    ".mb-karrusel { display: flex; gap: 10px; overflow-x: auto; padding: 0 12px 4px; scrollbar-width: none; } .mb-karrusel::-webkit-scrollbar { display: none; }",
    ".mb-karrusel button, .mb-albumgrid button { border: 0; background: none; padding: 0; text-align: left; cursor: pointer; font: inherit; color: var(--t-tekst); flex: none; width: 110px; }",
    ".mb-karrusel b, .mb-albumgrid b { display: block; font-size: 12px; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .mb-karrusel small, .mb-albumgrid small { display: block; font-size: 11px; color: var(--t-graa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".mb-albumgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 10px; padding: 12px; } .mb-albumgrid button { width: auto; min-width: 0; }",
    ".mb-cover { display: block; width: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,.2); flex: none; } .mb-cover svg { display: block; width: 100%; height: 100%; }",
    ".mb-cover.lille { width: 42px; height: 42px; border-radius: 7px; box-shadow: 0 1px 4px rgba(0,0,0,.18); }",
    ".mb-cover.stor { width: 170px; margin: 0 auto; border-radius: 14px; box-shadow: 0 10px 26px rgba(0,0,0,.28); }",
    ".mb-cover.kaempe { width: 100%; border-radius: 16px; box-shadow: 0 16px 36px rgba(0,0,0,.35); }",
    ".mb-mosaik { display: grid; grid-template-columns: 1fr 1fr; } .mb-mosaik .mb-cover { border-radius: 0; box-shadow: none; width: 100%; height: 100%; }",
    ".mb-tomcover { display: grid; place-items: center; background: var(--t-felt); font-size: 22px; color: var(--t-graa); box-shadow: none; }",
    ".mb-liste { list-style: none; margin: 0; padding: 0 0 0 12px; }",
    ".mb-r, .mb-koe li { display: flex; align-items: center; gap: 10px; padding: 6px 8px 6px 0; border-bottom: 1px solid var(--t-linje); cursor: pointer; }",
    ".mb-r:hover { background: var(--t-hover); } .mb-r.nu .mb-rt b { color: #c0399c; }",
    ".mb-rt { flex: 1; min-width: 0; } .mb-rt b { display: block; font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .mb-rt small { display: block; font-size: 11.5px; color: var(--t-graa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".mb-nr { width: 22px; text-align: center; color: var(--t-graa); font-size: 13px; flex: none; }",
    ".mb-hj, .mb-mere, .mb-plus { border: 0; background: none; cursor: pointer; font-size: 15px; padding: 4px; flex: none; color: var(--t-graa); font-family: inherit; } .mb-mere { font-size: 18px; font-weight: 700; } .mb-plus { font-size: 20px; color: #c0399c; }",
    ".mb-boelger { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; } .mb-boelger i { width: 3px; height: 4px; background: #c0399c; border-radius: 1px; }",
    ".mb-boelger.koer i { animation: mbBoelge .8s ease-in-out infinite alternate; } .mb-boelger.koer i:nth-child(2) { animation-delay: .25s } .mb-boelger.koer i:nth-child(3) { animation-delay: .5s }",
    "@keyframes mbBoelge { from { height: 3px } to { height: 14px } }",
    ".mb-allesange { display: block; margin: 16px auto 8px; border: 0; border-radius: 20px; padding: 10px 18px; background: var(--t-felt); color: #c0399c; font: inherit; font-weight: 700; cursor: pointer; }",
    ".mb-albumtop { text-align: center; padding: 6px 12px 10px; } .mb-albumtop b { display: block; font-size: 18px; margin-top: 10px; } .mb-albumtop small { color: var(--t-graa); font-size: 12px; }",
    ".mb-spilknap { display: flex; gap: 8px; margin-top: 10px; } .mb-spilknap button { flex: 1; border: 0; border-radius: 11px; padding: 9px; background: var(--t-felt); color: #c0399c; font: inherit; font-weight: 700; cursor: pointer; }",
    ".mb-favtop { text-align: center; padding: 14px 12px 6px; } .mb-favtop > span { font-size: 40px; display: block; } .mb-favtop b { font-size: 17px; }",
    ".mb-tom { text-align: center; color: var(--t-graa); padding: 40px 20px; font-size: 13px; line-height: 1.5; } .mb-tom span { display: block; font-size: 40px; }",
    ".mb-pllist { list-style: none; margin: 0; padding: 8px 12px; } .mb-pllist li { display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--t-linje); cursor: pointer; }",
    ".mb-pllist .mb-cover { width: 56px; height: 56px; } .mb-pllist b { display: block; font-size: 14px; } .mb-pllist small { color: var(--t-graa); font-size: 12px; } .mb-nypl b { color: #c0399c; }",
    // mini-afspiller og faner
    ".mb-mini { flex: none; background: var(--t-topbg); border-top: 1px solid var(--t-linje); }",
    ".mb-minitom { padding: 10px; text-align: center; font-size: 12px; color: var(--t-graa); }",
    ".mb-miniind { display: flex; align-items: center; gap: 9px; padding: 6px 10px; cursor: pointer; } .mb-miniind .mb-cover.lille { width: 38px; height: 38px; }",
    ".mb-pp, .mb-nx { border: 0; background: none; font-size: 22px; cursor: pointer; width: 34px; height: 34px; padding: 0; color: var(--t-tekst); flex: none; }",
    ".mb-minibar { height: 2px; background: var(--t-linje); } .mb-minibar i { display: block; height: 100%; background: #c0399c; }",
    ".mb-faner { flex: none; display: flex; padding: 4px 4px 20px; background: var(--t-topbg); }",
    ".mb-faner button { flex: 1; border: 0; background: none; font: inherit; font-size: 10px; color: var(--t-graa); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px; filter: grayscale(1); opacity: .75; }",
    ".mb-faner button span { font-size: 18px; } .mb-faner button.valgt { color: #c0399c; filter: none; opacity: 1; font-weight: 700; }",
    // fuld afspiller
    ".mb-fuld { position: absolute; inset: 0; z-index: 9; display: flex; flex-direction: column; padding: 42px 22px 26px; color: #fff; animation: vnOp .3s ease-out; }",
    ".mb-fuld[hidden] { display: none; }",
    ".mb-fuldtop { display: flex; align-items: center; justify-content: space-between; } .mb-fuldtop span { text-align: center; font-size: 10.5px; text-transform: uppercase; letter-spacing: .5px; opacity: .85; } .mb-fuldtop span b { display: block; font-size: 12.5px; text-transform: none; letter-spacing: 0; }",
    ".mb-fuldtop button { border: 0; background: rgba(255,255,255,.2); color: #fff; width: 30px; height: 30px; border-radius: 50%; font-size: 17px; cursor: pointer; padding: 0; line-height: 1; } .mb-fuldtop button.til { background: #fff; color: #333; }",
    ".mb-fuldcover { margin: 18px 8px 8px; transition: transform .4s; transform: scale(.86); } .mb-fuldcover.spiller { transform: scale(1); }",
    ".mb-viz { width: 100%; height: 30px; display: block; margin: 2px 0 4px; }",
    ".mb-fuldinfo { display: flex; align-items: center; gap: 8px; margin-top: auto; } .mb-fuldinfo span { flex: 1; min-width: 0; } .mb-fuldinfo b { display: block; font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .mb-fuldinfo small { display: block; font-size: 12px; opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".mb-fuldinfo .mb-hj { font-size: 22px; }",
    ".mb-spol { position: relative; height: 5px; border-radius: 3px; background: rgba(255,255,255,.3); margin: 12px 0 4px; cursor: pointer; } .mb-spol::before { content: ''; position: absolute; left: 0; right: 0; top: -8px; bottom: -8px; }",
    ".mb-spol i { display: block; height: 100%; border-radius: 3px; background: #fff; } .mb-spol b { position: absolute; top: 50%; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); }",
    ".mb-tider { display: flex; justify-content: space-between; font-size: 10.5px; opacity: .85; font-variant-numeric: tabular-nums; }",
    ".mb-kontrol { display: flex; align-items: center; justify-content: space-between; margin: 10px 0; }",
    ".mb-kontrol button { border: 0; background: none; color: #fff; font-size: 24px; cursor: pointer; width: 42px; height: 42px; padding: 0; border-radius: 50%; opacity: .95; } .mb-kontrol button.stor { width: 60px; height: 60px; font-size: 30px; background: rgba(255,255,255,.25); }",
    ".mb-kontrol [data-mbbland], .mb-kontrol [data-mbgentag] { font-size: 17px; opacity: .5; } .mb-kontrol button.til { opacity: 1; background: rgba(255,255,255,.28); }",
    ".mb-vol { display: flex; align-items: center; gap: 8px; font-size: 13px; } .mb-vol input { flex: 1; accent-color: #fff; }",
    ".mb-koe { flex: 1; overflow-y: auto; margin: 10px -8px 6px; background: rgba(0,0,0,.18); border-radius: 14px; padding: 4px 10px 10px; scrollbar-width: none; }",
    ".mb-koe ul { list-style: none; margin: 0; padding: 0; } .mb-koe li { border-bottom-color: rgba(255,255,255,.15); cursor: default; } .mb-koe .mb-rt small { color: rgba(255,255,255,.75); }",
    ".mb-koe li button { border: 0; background: rgba(255,255,255,.2); color: #fff; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 10px; padding: 0; flex: none; }",
    ".mb-koe .mb-boelger i { background: #fff; }",
    ".mb-kt { font-size: 12px; font-weight: 800; margin: 10px 0 2px; display: flex; justify-content: space-between; } .mb-kt button { border: 0; background: none; color: #fff; text-decoration: underline; cursor: pointer; font: inherit; font-size: 11px; }",
    ".mb-ktom { font-size: 11.5px; opacity: .8; padding: 8px 0; }",
    // ark med valg
    ".mb-arkbg { position: absolute; inset: 0; z-index: 12; background: rgba(0,0,0,.3); display: flex; align-items: flex-end; } .mb-arkbg[hidden] { display: none; }",
    ".mb-ark { width: 100%; max-height: 82%; overflow-y: auto; background: var(--t-lys); border-radius: 16px 16px 0 0; padding: 10px 10px 26px; box-sizing: border-box; display: flex; flex-direction: column; gap: 5px; animation: vnOp .25s ease-out; scrollbar-width: none; }",
    ".mb-arktop { display: flex; align-items: center; gap: 10px; padding: 2px 4px 6px; } .mb-arktop b { display: block; font-size: 14px; } .mb-arktop small { color: var(--t-graa); font-size: 12px; }",
    ".mb-ark > button { border: 0; background: var(--t-hvid); border-radius: 11px; padding: 10px 12px; text-align: left; font: inherit; font-size: 14px; color: var(--t-tekst); cursor: pointer; flex: none; }",
    ".mb-ark > button.rod { color: var(--t-rod); } .mb-ark > button.sikker { background: var(--t-rod); color: #fff; } .mb-ark > button.luk { text-align: center; font-weight: 700; color: #c0399c; margin-top: 4px; }",
    ".mb-licens { font-size: 11.5px; color: var(--t-graa); background: var(--t-hvid); border-radius: 10px; padding: 7px 10px; }",
    ".mb-arkt { font-size: 11.5px; font-weight: 700; color: var(--t-graa); text-transform: uppercase; margin: 6px 4px 0; }",
    ".mb-nyform { display: flex; gap: 6px; flex: none; } .mb-nyform input { flex: 1; min-width: 0; border: 1px solid var(--t-linje); border-radius: 11px; padding: 9px 11px; font: inherit; outline: 0; background: var(--t-hvid); color: var(--t-tekst); user-select: text; }",
    ".mb-nyform button { border: 0; border-radius: 11px; padding: 0 14px; background: #c0399c; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }",
  ]);

  // ===============================================================
  //  🧮 Lommeregner (fast app). Bruger samme regne-motor som regn.vera.
  //  Man kan også skrive med tastaturet: tal, + - * / , Enter og Esc.
  // ===============================================================
  let regnSidst = "";
  function tegnRegner() {
    appEl.classList.add("lr-app");
    statusEl.classList.remove("moerk");
    appEl.innerHTML = "<div class='lr-top'><button class='tlf-tb' data-tilbage='hjem' title='Tilbage'>" + ik("tilbage", 20) + "</button><span class='lr-sidst'></span></div>" +
      "<div class='vn-regn lr-regn'><div class='vn-display'></div><div class='vn-taster'>" +
      ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ",", "="].map(function (t) {
        return "<button data-lr='" + t + "' class='" + ("÷×−+=".indexOf(t) >= 0 ? "op" : "C±%".indexOf(t) >= 0 ? "fn" : "") + (t === "0" ? " nul" : "") + "'>" + t + "</button>";
      }).join("") + "</div></div>";
    appEl.addEventListener("click", function (e) { const b = e.target.closest("[data-lr]"); if (b) lrTryk(b.dataset.lr); });
    lrVis();
  }
  function lrTryk(t) {
    if (t === "=" && netRegn.op) regnSidst = String(netRegn.a).replace(".", ",") + " " + netRegn.op + " " + netRegn.vis + " =";
    if (t === "C") regnSidst = "";
    regnTryk(t);
    lrVis(t);
  }
  function lrVis(t) {
    if (!appEl || appNu !== "regn") return;
    const d = appEl.querySelector(".vn-display"), R = netRegn;
    d.textContent = R.vis;
    d.style.fontSize = R.vis.length > 9 ? Math.max(24, 44 - (R.vis.length - 9) * 4) + "px" : "";
    appEl.querySelector(".lr-sidst").textContent = regnSidst;
    appEl.querySelectorAll("[data-lr]").forEach(function (b) {
      const o = b.dataset.lr;
      b.classList.toggle("valgt", "÷×−+".indexOf(o) >= 0 && R.op === o && R.ny);
      if (o === "C") b.textContent = R.vis !== "0" || R.op ? "C" : "AC";
    });
  }
  document.addEventListener("keydown", function (e) {
    if (appNu !== "regn" || tlf.hidden || !appEl) return;
    const a = document.activeElement;
    if (a && a.matches && a.matches("input, textarea, [contenteditable]")) return;
    const k = { "*": "×", "x": "×", "/": "÷", "-": "−", "+": "+", "Enter": "=", "=": "=", ",": ",", ".": ",", "%": "%", "Escape": "C", "Delete": "C" }[e.key] || (/^[0-9]$/.test(e.key) ? e.key : null);
    if (e.key === "Backspace") {
      e.preventDefault();
      if (!netRegn.ny && netRegn.vis.length > 1) netRegn.vis = netRegn.vis.slice(0, -1); else { netRegn.vis = "0"; netRegn.ny = true; }
      lrVis(); return;
    }
    if (!k) return;
    e.preventDefault(); e.stopPropagation();
    lrTryk(k);
    const b = appEl.querySelector("[data-lr='" + k + "']");
    if (b) { b.classList.add("tryk"); setTimeout(function () { b.classList.remove("tryk"); }, 120); }
  }, true);
  nyStil("telefon-stil-regn", [
    ".tlf-app.lr-app { background: #000; }",
    ".lr-top { flex: none; display: flex; align-items: center; padding: 44px 10px 0; color: #8e8e93; } .lr-top .tlf-tb { color: #ff9f0a; }",
    ".lr-sidst { flex: 1; text-align: right; font-size: 15px; padding-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".lr-regn { flex: 1; min-height: 0; background: #000; padding: 4px 16px 34px; }",
    ".lr-regn .vn-display { font-size: 56px; padding: 4px 4px 12px; transition: font-size .1s; }",
    ".lr-regn .vn-taster { gap: 10px; }",
    ".lr-regn .vn-taster button { font-size: 26px; transition: filter .1s, background .15s, color .15s; }",
    ".lr-regn .vn-taster button.op.valgt { background: #fff; color: #ff9f0a; }",
    ".lr-regn .vn-taster button.tryk { filter: brightness(1.45); }",
  ]);
  setInterval(function () { if (!tlf.hidden) opdaterUr(); }, 10000);
  setInterval(function () { if (!tlf.hidden && skaermNu === "hjem" && !wTraek && !galleriAabent) tegnWidgets(); }, 5000);
  saetFarver();
  opdaterUr();
})();
