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
let bobler = [];              // { navn, linjer, x, y, maalY, b, h, alder }
let boblerSidst = performance.now();

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

function tilfaeldig(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}


// =============================================================
//  Lav en ny boble
// =============================================================
function delILinjer(tekst, navn) {
  ctx.font = "13px Verdana, sans-serif";
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
  ctx.font = "13px Verdana, sans-serif";
  const b = Math.min(BOBLE_MAKS_B, Math.max.apply(null, linjer.map(function (l) { return ctx.measureText(l).width; })) + 20);
  const h = linjer.length * 17 + 10;
  const hoved = hovedPaa(hvem);
  bobler.forEach(function (bo) { bo.nyest = false; });
  bobler.push({ navn: navn, linjer: linjer, x: hoved.x, y: hoved.y, maalY: hoved.y, b: b, h: h, alder: 0, egen: hvem === figur, nyest: true });
}


// =============================================================
//  Tegn boblerne (kaldes fra tegnAlt i spil.js)
// =============================================================
function rundRamme(x, y, b, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + b, y, x + b, y + h, r);
  ctx.arcTo(x + b, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + b, y, r);
  ctx.closePath();
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

    // halen peger ned mod den, der taler (kun lige når boblen er ny)
    if (bo.nyest && bo.alder < 4) {
      ctx.beginPath();
      ctx.moveTo(bo.x - 7, bo.y - 1);
      ctx.lineTo(bo.x, bo.y + 9);
      ctx.lineTo(bo.x + 7, bo.y - 1);
      ctx.fillStyle = "#fcf2e9";
      ctx.strokeStyle = "#5b2c16";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }

    rundRamme(x, y, bo.b, bo.h, 9);
    ctx.fillStyle = bo.egen ? "#fff6d8" : "#fcf2e9";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#5b2c16";
    ctx.stroke();

    // navnet står med fed skrift først i boblen
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    bo.linjer.forEach(function (l, i) {
      let tx = x + 10;
      const ty = y + 6 + i * 17;
      if (i === 0) {
        ctx.font = "bold 13px Verdana, sans-serif";
        ctx.fillStyle = "#5b2c16";
        const del = bo.navn + ":";
        ctx.fillText(del, tx, ty);
        tx += ctx.measureText(del + " ").width;
        l = l.slice(del.length + 1);
      }
      ctx.font = "13px Verdana, sans-serif";
      ctx.fillStyle = "#3a1d0e";
      ctx.fillText(l, tx, ty);
    });
    ctx.restore();
  });
}


// =============================================================
//  Skriv i chatten
// =============================================================
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const tekst = chatTekst.value;
  chatTekst.value = "";
  if (!tekst.trim()) return;
  sig(figur, FIGUR.navn, tekst);

  // i velkomsthallen svarer en af gæsterne måske
  if (rumValg === "hal" && Math.random() < 0.75) {
    const g = tilfaeldig(HAL_GAESTER);
    const regel = SVAR.find(function (s) { return s.naar.test(tekst); });
    setTimeout(function () {
      if (rumValg === "hal") sig(g, g.navn, tilfaeldig(regel.svar).replace("{mig}", FIGUR.navn));
    }, 900 + Math.random() * 1600);
  }
});

// Gæsterne snakker også lidt af sig selv
function snakLidt() {
  if (rumValg === "hal" && !document.hidden) {
    const g = tilfaeldig(HAL_GAESTER);
    sig(g, g.navn, tilfaeldig(SNAK));
  }
  setTimeout(snakLidt, 9000 + Math.random() * 14000);
}
setTimeout(snakLidt, 4000);

// Skifter man rum, forsvinder boblerne
const gammelSkiftRum = skiftRum;
skiftRum = function (navn) {
  bobler = [];
  gammelSkiftRum(navn);
};
