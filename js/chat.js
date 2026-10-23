// =============================================================
//  CHATTEN — skriv noget, så kommer det i en taleboble over din figur.
//  Boblerne stiger op ligesom i Habbo, og de gamle forsvinder efter lidt tid.
//  Gæsterne i velkomsthallen svarer og snakker også selv.
//
//  OBS: Lige nu er de andre gæster "computer-gæster". For at rigtige
//  mennesker kan skrive til hinanden, skal hotellet have en server senere.
// =============================================================

const chatForm = document.getElementById("chat");
const chatTekst = document.getElementById("chat-tekst");

const BOBLE_MAKS_B = 230;     // hvor bred en boble højst må være
const BOBLE_LEVETID = 16;     // sekunder før en boble forsvinder
// emoji-skrifterne gør, at smileyerne bliver farvede (Windows, Mac og Linux)
const SKRIFT = "13px Verdana, Arial, sans-serif, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji'";
let bobler = [];              // { navn, linjer, x, y, maalY, b, h, alder }
let boblerSidst = performance.now();
let sidstTastet = 0;          // hvornår man sidst skrev et bogstav i chatten

// Det gæsterne siger, når man skriver til dem
const SVAR = [
  { naar: /\b(hej|hejsa|hey|hallo|goddag|godmorgen)\b/i, svar: ["Hej {mig}!", "Hejsa! Velkommen til hotellet", "Hej hej!", "Hej {mig}, godt at se dig!"] },
  { naar: /hvordan går|hvad så|går det/i, svar: ["Det går godt, tak! Hvad med dig?", "Fint! Jeg hygger mig bare her", "Super godt!"] },
  { naar: /farvel|vi ses|hej hej|godnat/i, svar: ["Vi ses, {mig}!", "Farvel! Kom snart igen", "Godnat!"] },
  { naar: /\?\s*$/, svar: ["Godt spørgsmål!", "Det ved jeg ikke helt …", "Hmm, måske!", "Ja, helt sikkert!"] },
  { naar: /./, svar: ["Haha, ja!", "Sjovt!", "Fedt!", "Enig!", "Hyggeligt her, ikke?", "Det lyder godt"] },
];

// Det gæsterne siger af sig selv
const SNAK = [
  "Hvor er her hyggeligt!",
  "Har nogen set katten?",
  "Jeg elsker sofaerne her",
  "Er der nogen, der vil med op på værelset?",
  "Hvad laver I i dag?",
  "Hvor har du købt dit tøj?",
  "Jeg har lige fået nye møbler!",
  "Godmorgen alle sammen",
];

// Farverne, man kan give sin taleboble og sit navn (lyse, mellem og mørke)
const FARVER = [
  "#ffffff", "#fcf2e9", "#fff2a8", "#ffe08a", "#ffd2df", "#f7b8c8", "#ffc4a8", "#e3d0ff", "#cdeefc", "#c4f2ec", "#c9f0c0", "#e8f5a8",
  "#d9d9d9", "#f6c08b", "#f7c65a", "#ffb347", "#ff8fab", "#e85d8a", "#ff7a5c", "#b18cff", "#6cb8f0", "#4fd1c5", "#7ed36f", "#b5d94f",
  "#8a8a8a", "#c98a5b", "#c9862a", "#e0522f", "#c2185b", "#962a35", "#d32f2f", "#6a3db8", "#2f6fb5", "#1f8a80", "#3e8e3a", "#7a8f1f",
  "#2b2b2b", "#5b2c16", "#3a1d0e", "#7a4313", "#5c1030", "#4a1020", "#2a1a4a", "#1a2b5c", "#123c4a", "#0f3d2e", "#1f3d12", "#000000",
];

// Pynt, der sidder rundt om boblen
const PYNT = [
  { id: "ingen", navn: "Ingen", tegn: [] },
  { id: "stjerner", navn: "Stjerner", tegn: ["⭐", "✨", "🌟"] },
  { id: "hjerter", navn: "Hjerter", tegn: ["❤️", "💕", "💖"] },
  { id: "doedningehoveder", navn: "Dødningehoveder", tegn: ["💀", "☠️", "💀"] },
  { id: "blomster", navn: "Blomster", tegn: ["🌸", "🌼", "🌷"] },
  { id: "musik", navn: "Musik", tegn: ["🎵", "🎶", "🎵"] },
  { id: "kroner", navn: "Kroner", tegn: ["👑", "💎", "✨"] },
  { id: "ild", navn: "Ild", tegn: ["🔥", "🔥", "🔥"] },
  { id: "sommerfugle", navn: "Sommerfugle", tegn: ["🦋", "🦋", "🌸"] },
  { id: "regnbue", navn: "Regnbue", tegn: ["🌈", "☁️", "✨"] },
  { id: "katte", navn: "Katte", tegn: ["🐱", "🐾", "🐾"] },
  { id: "spoegelser", navn: "Spøgelser", tegn: ["👻", "🦇", "🎃"] },
  { id: "lyn", navn: "Lyn", tegn: ["⚡", "⚡", "💥"] },
  { id: "slik", navn: "Slik", tegn: ["🍭", "🍬", "🧁"] },
  { id: "sne", navn: "Sne", tegn: ["❄️", "⛄", "❄️"] },
  { id: "fest", navn: "Fest", tegn: ["🎉", "🎈", "🎊"] },
];

// Din taleboble: farve, navnets farve (null = af sig selv) og pynt. Huskes til næste gang.
const BOBLE_NOEGLE = "mit-hotel-boble-stil";
const minBoble = { farve: "#fcf2e9", navnFarve: null, pynt: "ingen" };
try {
  const gemt = JSON.parse(localStorage.getItem(BOBLE_NOEGLE));
  if (gemt) Object.assign(minBoble, gemt);
  const gammel = localStorage.getItem("mit-hotel-boble");   // farven fra før
  if (!gemt && gammel) minBoble.farve = gammel;
} catch (fejl) {
  // kan ikke huske boblen, men den virker stadig nu
}

function gemBoble() {
  try { localStorage.setItem(BOBLE_NOEGLE, JSON.stringify(minBoble)); } catch (fejl) { /* husker den bare ikke */ }
}

// Gæsterne har hver deres boble
const GAEST_BOBLER = {
  Ida: { farve: "#ffd2df", navnFarve: "#c2185b", pynt: "hjerter" },
  Noah: { farve: "#cdeefc", navnFarve: "#1a2b5c", pynt: "ingen" },
  Freja: { farve: "#c9f0c0", navnFarve: "#0f3d2e", pynt: "blomster" },
  Oliver: { farve: "#fff2a8", navnFarve: "#7a4313", pynt: "stjerner" },
};

// Smileyerne man kan vælge
const SMILEYER = ["😊", "😂", "😍", "😎", "😉", "😮", "😢", "😡", "🥳", "😴", "🤔", "😘",
  "👋", "👍", "❤️", "💖", "⭐", "🎉", "🌸", "🍕", "☕", "🐱", "🏨", "🔑"];

// Skriver man :) eller <3, bliver det til en smiley
const TEKST_SMILEYER = [[":D", "😂"], [":)", "😊"], [";)", "😉"], [":(", "😢"], [":O", "😮"], [":o", "😮"], ["<3", "❤️"], [":P", "😜"], [":p", "😜"]];

function lavSmileyer(tekst) {
  TEKST_SMILEYER.forEach(function (t) { tekst = tekst.split(t[0]).join(t[1]); });
  return tekst;
}

// Er farven så mørk, at teksten skal være lys?
function erMoerk(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 < 110;
}

function tilfaeldig(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}


// =============================================================
//  Lav en ny boble
// =============================================================
function delILinjer(tekst, navn) {
  ctx.font = SKRIFT;
  const ord = (navn + ": " + tekst).split(" ");
  const linjer = [];
  let linje = "";
  ord.forEach(function (o) {
    const proev = linje ? linje + " " + o : o;
    if (ctx.measureText(proev).width > BOBLE_MAKS_B - 20 && linje) {
      linjer.push(linje);
      linje = o;
    } else {
      linje = proev;
    }
  });
  if (linje) linjer.push(linje);
  return linjer;
}

// Hvor står den, der taler? (toppen af hovedet)
function hovedPaa(hvem) {
  if (hvem === figur) {
    const p = punkt(figur.x + 0.5, figur.y + 0.5);
    return { x: p.x, y: p.y - figurHoejde(garderobe) - 32 };
  }
  const p = punkt(hvem.x + 0.5, hvem.y + 0.5);
  return { x: p.x, y: p.y - figurHoejde(hvem.valg) - 36 };
}

function sig(hvem, navn, tekst) {
  tekst = tekst.trim();
  if (!tekst) return;
  const linjer = delILinjer(tekst, navn);
  ctx.font = SKRIFT;
  const b = Math.min(BOBLE_MAKS_B, Math.max.apply(null, linjer.map(function (l) { return ctx.measureText(l).width; })) + 20);
  const h = linjer.length * 17 + 10;
  const hoved = hovedPaa(hvem);
  bobler.forEach(function (bo) { bo.nyest = false; });
  bobler.push({ navn: navn, linjer: linjer, x: hoved.x, y: hoved.y, maalY: hoved.y, b: b, h: h, alder: 0, nyest: true,
    stil: Object.assign({}, hvem === figur ? minBoble : GAEST_BOBLER[navn] || { farve: "#fcf2e9", pynt: "ingen" }) });
}


// =============================================================
//  Tegn boblerne (kaldes fra tegnAlt i spil.js)
// =============================================================
function rundRamme(c, x, y, b, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + b, y, x + b, y + h, r);
  c.arcTo(x + b, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + b, y, r);
  c.closePath();
}

// Tegner én boble med øverste venstre hjørne i (x, y).
//   hale: hvor halen skal pege ned (x), eller null for ingen hale
function tegnEnBoble(c, bo, x, y, hale) {
  const st = bo.stil;
  const kant = erMoerk(st.farve) ? "#000000" : "#5b2c16";
  if (hale !== null) {
    c.beginPath();
    c.moveTo(hale - 7, y + bo.h - 1);
    c.lineTo(hale, y + bo.h + 9);
    c.lineTo(hale + 7, y + bo.h - 1);
    c.fillStyle = st.farve;
    c.strokeStyle = kant;
    c.lineWidth = 2;
    c.fill();
    c.stroke();
  }

  rundRamme(c, x, y, bo.b, bo.h, 9);
  c.fillStyle = st.farve;
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = kant;
  c.stroke();

  // navnet står med fed skrift først i boblen
  c.textAlign = "left";
  c.textBaseline = "top";
  bo.linjer.forEach(function (l, i) {
    let tx = x + 10;
    const ty = y + 6 + i * 17;
    if (i === 0) {
      c.font = "bold " + SKRIFT;
      c.fillStyle = st.navnFarve || (erMoerk(st.farve) ? "#f7c65a" : "#5b2c16");
      const del = bo.navn + ":";
      c.fillText(del, tx, ty);
      tx += c.measureText(del + " ").width;
      l = l.slice(del.length + 1);
    }
    c.font = SKRIFT;
    c.fillStyle = erMoerk(st.farve) ? "#fcf2e9" : "#3a1d0e";
    c.fillText(l, tx, ty);
  });

  // pynten i hjørnerne vipper lidt frem og tilbage
  const pynt = PYNT.find(function (p) { return p.id === st.pynt; });
  if (pynt && pynt.tegn.length) {
    const t = bo.alder || 0;
    const steder = [
      { x: x - 3, y: y - 2, s: 17, v: -0.35 },
      { x: x + bo.b + 2, y: y + 1, s: 14, v: 0.3 },
      { x: x + bo.b - 4, y: y + bo.h + 2, s: 12, v: 0.15 },
    ];
    c.textAlign = "center";
    c.textBaseline = "middle";
    steder.forEach(function (sted, i) {
      c.save();
      c.translate(sted.x, sted.y + Math.sin(t * 3 + i * 2) * 1.5);
      c.rotate(sted.v + Math.sin(t * 2 + i) * 0.12);
      c.font = sted.s + "px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
      c.fillText(pynt.tegn[i % pynt.tegn.length], 0, 0);
      c.restore();
    });
  }
}

function tegnBobler() {
  const nu = performance.now();
  const dt = Math.min(0.05, (nu - boblerSidst) / 1000);
  boblerSidst = nu;

  bobler.forEach(function (bo) {
    bo.alder += dt;
    bo.maalY -= dt * 4;                  // boblerne driver langsomt opad
    bo.y += (bo.maalY - bo.y) * Math.min(1, dt * 10);
  });
  bobler = bobler.filter(function (bo) { return bo.alder < BOBLE_LEVETID && bo.y + bo.h > -20; });

  // en gammel boble, der står i vejen for en nyere, rykker op over den
  for (let i = bobler.length - 2; i >= 0; i--) {
    const gl = bobler[i];
    for (let j = i + 1; j < bobler.length; j++) {
      const ny = bobler[j];
      const vandret = Math.abs(gl.x - ny.x) < (gl.b + ny.b) / 2 + 4;
      if (vandret && gl.maalY > ny.maalY - ny.h - 6) gl.maalY = ny.maalY - ny.h - 6;
    }
  }

  bobler.forEach(function (bo) {
    const x = Math.max(6, Math.min(BREDDE - bo.b - 6, bo.x - bo.b / 2));
    const y = bo.y - bo.h;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (BOBLE_LEVETID - bo.alder) / 2);

    tegnEnBoble(ctx, bo, x, y, bo.nyest && bo.alder < 4 ? bo.x : null);
    ctx.restore();
  });

  // "skriver …" over hovedet på dem, der er ved at skrive
  const skriver = [];
  if (document.activeElement === chatTekst && chatTekst.value.trim() && nu - sidstTastet < 5000) skriver.push(figur);
  if (rumValg === "hal") HAL_GAESTER.forEach(function (g) { if (g.skriver) skriver.push(g); });
  skriver.forEach(function (hvem) {
    const h = hovedPaa(hvem);
    const stil = hvem === figur ? minBoble : GAEST_BOBLER[hvem.navn] || { farve: "#fcf2e9" };
    const b = 42, hh = 22, x = h.x - b / 2, y = h.y - hh + 4;
    ctx.save();
    rundRamme(ctx, x, y, b, hh, 10);
    ctx.fillStyle = stil.farve;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = erMoerk(stil.farve) ? "#000000" : "#5b2c16";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(h.x - 5, y + hh - 1);
    ctx.lineTo(h.x, y + hh + 6);
    ctx.lineTo(h.x + 5, y + hh - 1);
    ctx.fill();
    ctx.stroke();
    // tre prikker, der hopper efter hinanden
    ctx.fillStyle = erMoerk(stil.farve) ? "#fcf2e9" : "#5b2c16";
    for (let i = 0; i < 3; i++) {
      const hop = Math.max(0, Math.sin(nu / 160 - i * 0.9)) * 3;
      ctx.beginPath();
      ctx.arc(h.x - 10 + i * 10, y + hh / 2 - hop, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}


// =============================================================
//  Skriv i chatten
// =============================================================
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const tekst = lavSmileyer(chatTekst.value);
  chatTekst.value = "";
  lukChatValg();
  if (!tekst.trim()) return;
  sig(figur, FIGUR.navn, tekst);
  sidstTastet = 0;

  // i velkomsthallen svarer en af gæsterne måske
  if (rumValg === "hal" && Math.random() < 0.75) {
    const g = tilfaeldig(HAL_GAESTER);
    const regel = SVAR.find(function (s) { return s.naar.test(tekst); });
    setTimeout(function () {
      gaestSkriver(g, tilfaeldig(regel.svar).replace("{mig}", FIGUR.navn));
    }, 400 + Math.random() * 800);
  }
});

// En gæst "skriver" lidt, før den siger noget
function gaestSkriver(g, tekst) {
  if (rumValg !== "hal" || g.skriver) return;
  g.skriver = true;
  setTimeout(function () {
    g.skriver = false;
    if (rumValg === "hal") sig(g, g.navn, tekst);
  }, 900 + tekst.length * 45);
}

// Gæsterne snakker også lidt af sig selv
function snakLidt() {
  if (rumValg === "hal" && !document.hidden) {
    const g = tilfaeldig(HAL_GAESTER);
    gaestSkriver(g, tilfaeldig(SNAK));
  }
  setTimeout(snakLidt, 9000 + Math.random() * 14000);
}
setTimeout(snakLidt, 4000);

chatTekst.addEventListener("input", function () { sidstTastet = performance.now(); });

// Skifter man rum, forsvinder boblerne
const gammelSkiftRum = skiftRum;
skiftRum = function (navn) {
  bobler = [];
  gammelSkiftRum(navn);
};


// =============================================================
//  Smileyer og boblens farve
// =============================================================
const smileyBoks = document.getElementById("chat-smileyer");
const farveBoks = document.getElementById("chat-farver");
const farveKnap = document.getElementById("chat-farve-knap");

function lukChatValg() {
  smileyBoks.hidden = true;
  farveBoks.hidden = true;
}

SMILEYER.forEach(function (sm) {
  const k = document.createElement("button");
  k.type = "button";
  k.textContent = sm;
  k.addEventListener("click", function () {
    // sæt smileyen ind, hvor man står i teksten
    const start = chatTekst.selectionStart ?? chatTekst.value.length;
    const slut = chatTekst.selectionEnd ?? start;
    chatTekst.value = chatTekst.value.slice(0, start) + sm + chatTekst.value.slice(slut);
    chatTekst.focus();
    chatTekst.selectionStart = chatTekst.selectionEnd = start + sm.length;
  });
  smileyBoks.appendChild(k);
});

// Vinduet "Din taleboble": forhåndsvisning, farver og pynt
const forBoble = document.getElementById("boble-forhaand");
const forC = forBoble.getContext("2d");

function tegnForhaandsBoble() {
  const t = window.devicePixelRatio || 1;
  forBoble.width = Math.round(forBoble.clientWidth * t);
  forBoble.height = Math.round(forBoble.clientHeight * t);
  forC.setTransform(t, 0, 0, t, 0, 0);
  forC.clearRect(0, 0, forBoble.clientWidth, forBoble.clientHeight);
  forC.font = SKRIFT;
  const navn = FIGUR.navn;
  const linje = navn + ": Sådan ser min boble ud!";
  const bo = { navn: navn, linjer: [linje], b: forC.measureText(linje).width + 24, h: 27, stil: minBoble, alder: performance.now() / 1000 };
  tegnEnBoble(forC, bo, (forBoble.clientWidth - bo.b) / 2, 14, null);
}

function visValgt() {
  farveBoks.querySelectorAll("[data-farve]").forEach(function (k) {
    k.classList.toggle("aktiv", k.dataset.farve === minBoble.farve);
  });
  farveBoks.querySelectorAll("[data-navnefarve]").forEach(function (k) {
    k.classList.toggle("aktiv", k.dataset.navnefarve === (minBoble.navnFarve || ""));
  });
  farveBoks.querySelectorAll("[data-pynt]").forEach(function (k) {
    k.classList.toggle("aktiv", k.dataset.pynt === minBoble.pynt);
  });
  farveKnap.style.background = minBoble.farve;
  tegnForhaandsBoble();
}

function lavValg(boks, ting, lav) {
  ting.forEach(function (t) {
    const k = document.createElement("button");
    k.type = "button";
    lav(k, t);
    k.addEventListener("click", function () {
      gemBoble();
      visValgt();
    });
    document.getElementById(boks).appendChild(k);
  });
}

lavValg("boble-farver", FARVER, function (k, f) {
  k.dataset.farve = f;
  k.style.background = f;
  k.title = "Boblens farve";
  k.addEventListener("click", function () { minBoble.farve = f; });
});
lavValg("navne-farver", [""].concat(FARVER), function (k, f) {
  k.dataset.navnefarve = f;
  if (f) k.style.background = f;
  else { k.textContent = "A"; k.className = "af-sig-selv"; }
  k.title = f ? "Navnets farve" : "Navnets farve passer af sig selv";
  k.addEventListener("click", function () { minBoble.navnFarve = f || null; });
});
lavValg("boble-pynt", PYNT, function (k, p) {
  k.dataset.pynt = p.id;
  k.textContent = p.tegn[0] || "✕";
  k.title = p.navn;
  k.addEventListener("click", function () { minBoble.pynt = p.id; });
});

// pynten i forhåndsvisningen vipper også
setInterval(function () { if (!farveBoks.hidden) tegnForhaandsBoble(); }, 60);

document.getElementById("chat-smiley-knap").addEventListener("click", function () {
  farveBoks.hidden = true;
  smileyBoks.hidden = !smileyBoks.hidden;
});
farveKnap.addEventListener("click", function () {
  smileyBoks.hidden = true;
  farveBoks.hidden = !farveBoks.hidden;
  if (!farveBoks.hidden) visValgt();
});
visValgt();
laerred.addEventListener("click", lukChatValg);
