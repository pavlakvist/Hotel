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
    ".tlf-status.lav .st-bat { fill: var(--t-rod); } .tlf-status.lader .st-bat { fill: var(--t-on); }",
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
    this.classList.toggle("taendt");
    lille(this.classList.contains("taendt") ? "🔦 Lommelygte tændt" : "Lommelygte slukket");
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
    const indre = id === "events" ? "<span class='tlf-kal'></span>" : ik(A.ik);
    return "<button class='tlf-app-ik' data-app='" + id + "'><span class='fl' style='background:" + A.bg + "'>" + indre + "</span>" +
      (tal ? "<span class='tal'>" + (tal > 99 ? "99+" : tal) + "</span>" : "") + "<span class='nv'>" + A.navn + "</span></button>";
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
    events: "Hotel", rum: "Hotel", noter: "Værktøjer", indst: "Værktøjer", snake: "Spil" };
  function mitLayout() {
    let l = Array.isArray(ind.layout) ? ind.layout : GITTER.slice();
    const set = {};
    // ryd op: ukendte apps, dobbelte, tomme mapper
    l = l.map(function (x) {
      if (typeof x === "string") { if (!APPS[x] || set[x] || DOCK.indexOf(x) >= 0) return null; set[x] = 1; return x; }
      if (!x || !Array.isArray(x.apps)) return null;
      const apps = x.apps.filter(function (a) { if (!APPS[a] || set[a] || DOCK.indexOf(a) >= 0) return false; set[a] = 1; return true; });
      if (!apps.length) return null;
      if (apps.length === 1) return apps[0];
      return { mappe: String(x.mappe || "Mappe").slice(0, 20), apps: apps };
    }).filter(function (x) { return x !== null; });
    // nye apps kommer med til sidst
    GITTER.forEach(function (a) { if (!set[a]) l.push(a); });
    ind.layout = l;
    return l;
  }
  function appTal(id) {
    if (id === "beskeder") return ulaestIalt();
    if (id === "kontakter") return anmodningerTilMig().length;
    if (id === "peep" && typeof peepNye === "function") return peepNye().length;
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
    const k = e.target.closest("[data-mi]");
    if (k && !redigerer) { const id = k.dataset.app; lukMappe(true); aabnApp(id); return; }
    if (!k && !e.target.closest(".mp-boks")) { lukMappe(); if (redigerer) tegnHjem(); }
  });
  // hold nede i mappen = rediger, træk apps rundt eller ud
  let mTraek = null, mHold = null, mHoldStart = null;
  skaerm.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || !e.target.closest(".tlf-mappe-aaben") || e.target.closest(".mp-navn")) return;
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
    if (e.button !== 0 || e.target.closest(".tlf-redbar, .w-fjern")) return;
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
    } else if (id === "snake") {
      tegnSnake();
    } else if (id === "peep") {
      tegnPeep();
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
      (appNu === "snake" && typeof snakeKoerer !== "undefined" && snakeKoerer);
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
    statusEl.classList.toggle("lav", b <= 20 && !lader);
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
    else if (!tlf.hidden && ind.bat > 0 && tik % (brugerMeget() ? 4 : 12) === 0) ind.bat = Math.max(0, ind.bat - 1);   // ca. 40 min (13 min med kamera/musik)
    else if (tlf.hidden && ind.bat > 0 && brugerMeget() && tik % 8 === 0) ind.bat = Math.max(0, ind.bat - 1);
    if (lader !== sidstLader) {
      sidstLader = lader;
      if (lader) { if (!tlf.hidden) lille("🔌 Telefonen lader op"); else besked && (besked.textContent = "🔌 Din telefon lader op ⚡"); }
      if (appNu === "indst") bevarScroll(tegnIndstillinger);
    }
    if (ind.bat !== foer) {
      gemInd();
      if (!lader && (ind.bat === 20 || ind.bat === 10) && varslet !== ind.bat) {
        varslet = ind.bat;
        if (!tlf.hidden) visBatteriBanner();
        else if (typeof besked !== "undefined" && besked) besked.textContent = "🔋 Din telefon har kun " + ind.bat + " % strøm tilbage.";
      }
      if (ind.bat > 20) varslet = 100;
      tjekTom();
    }
    if (!tlf.hidden) { visBatteri(); tegnBatMenu(); }
  }, 2000);
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

  setInterval(function () { if (!tlf.hidden) opdaterUr(); }, 10000);
  setInterval(function () { if (!tlf.hidden && skaermNu === "hjem" && !wTraek && !galleriAabent) tegnWidgets(); }, 5000);
  saetFarver();
  opdaterUr();
})();
