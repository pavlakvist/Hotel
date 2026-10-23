// =============================================================
//  Klik på en anden gæst: Byt · Like · Kram
//  Bruger den samme lille blå menu som når man klikker på sig selv.
//  Gæsterne er computer-gæster, indtil hotellet får en server.
// =============================================================
const LIKE_NOEGLE = "mit-hotel-likes";

// Hvor mange likes hver gæst har, og hvem du selv har liket
const likes = { antal: { Ida: 4, Noah: 7, Freja: 2, Oliver: 5 }, mine: [] };
try { Object.assign(likes, JSON.parse(localStorage.getItem(LIKE_NOEGLE) || "{}")); } catch (e) {}
function gemLikes() {
  try { localStorage.setItem(LIKE_NOEGLE, JSON.stringify(likes)); } catch (e) {}
}

function gaestUnderMus(e) {
  if (rumValg !== "hal") return null;
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width);
  const sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  HAL_GAESTER.forEach(function (g) {
    if (typeof erBannet === "function" && erBannet(g.navn)) return;
    const p = punkt(g.x + 0.5, g.y + 0.5);
    p.x += gaestPlads(g);
    if (Math.abs(sx - p.x) < 18 && sy < p.y + 4 && sy > p.y - figurHoejde(g.valg) - 4) {
      // den forreste gæst vinder, hvis to står bag hinanden
      if (!fundet || g.x + g.y > fundet.x + fundet.y) fundet = g;
    }
  });
  return fundet;
}

laerred.addEventListener("click", function (e) {
  const g = gaestUnderMus(e);
  if (!g) return;
  e.stopImmediatePropagation();
  aabnGaestMenu(g);
}, true);

function aabnGaestMenu(g) {
  menuHvem = g;
  minMenuKnapper.innerHTML = "";
  knap("🔄 Byt", function () { lukMinMenu(); aabnByt(g); });
  const liket = likes.mine.indexOf(g.navn) >= 0;
  knap((liket ? "💙 Liket" : "👍 Like") + " (" + (likes.antal[g.navn] || 0) + ")", function () {
    lukMinMenu();
    if (liket) {
      likes.mine.splice(likes.mine.indexOf(g.navn), 1);
      likes.antal[g.navn] = Math.max(0, (likes.antal[g.navn] || 0) - 1);
    } else {
      likes.mine.push(g.navn);
      likes.antal[g.navn] = (likes.antal[g.navn] || 0) + 1;
      svaev("👍", g);
      gaestSkriver(g, "Tak for like'et, " + FIGUR.navn + "! 😊");
    }
    gemLikes();
  });
  knap("🤗 Kram", function () { lukMinMenu(); kram(g); });
  minMenu.hidden = false;
  placerMinMenu();
}


// -------------------------------------------------------------
//  Kram: gå hen til gæsten, og så kommer der hjerter
// -------------------------------------------------------------
let kramMed = null;

function kram(g) {
  // gæsten bliver stående og venter på dig
  if (!g.sidder) { g.rute = []; g.vent = 10; }
  const gx = Math.round(g.x), gy = Math.round(g.y);
  const fig = figurFelt();
  if (Math.abs(fig.x - gx) <= 1 && Math.abs(fig.y - gy) <= 1) { kramNu(g); return; }
  const naboer = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]
    .sort(function (a, b) {
      return Math.hypot(gx + a[0] - fig.x, gy + a[1] - fig.y) - Math.hypot(gx + b[0] - fig.x, gy + b[1] - fig.y);
    });
  for (const [dx, dy] of naboer) {
    gaaTil(gx + dx, gy + dy);
    if (figur.rute.length > 0) { kramMed = g; return; }
  }
  besked.textContent = "Du kan ikke komme hen til " + g.navn + " lige nu.";
}

function kramNu(g) {
  kramMed = null;
  // kig på hinanden
  const dx = g.x - figur.x, dy = g.y - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  if (!g.sidder) g.retning = dx + dy >= 0 ? (dx - dy >= 0 ? "op-venstre" : "op-hoejre") : (dx - dy >= 0 ? "ned-venstre" : "ned-hoejre");
  for (let i = 0; i < 5; i++) {
    setTimeout(function () { svaev("❤️", figur); svaev("💕", g); }, i * 220);
  }
  gaestSkriver(g, "Aww, tak for krammet! 🤗");
}

// fremme ved gæsten? Så kram
const tegnBoblerKram = tegnBobler;
tegnBobler = function () {
  if (kramMed && figur.rute.length === 0) {
    const g = kramMed;
    if (Math.abs(figur.x - g.x) <= 1.6 && Math.abs(figur.y - g.y) <= 1.6) kramNu(g);
    else kramMed = null;
  }
  tegnBoblerKram();
};


// -------------------------------------------------------------
//  Byt: giv Glimt eller Stella, og få noget igen
// -------------------------------------------------------------
const bytVindue = document.getElementById("byt-vindue");
let bytMed = null;
const KURS = 50;    // 50 Glimt er det samme værd som 1 Stella

function aabnByt(g) {
  bytMed = g;
  document.getElementById("byt-titel").textContent = "Byt med " + g.navn;
  document.getElementById("byt-hende").textContent = g.navn + " giver";
  document.getElementById("byt-glimt").value = 0;
  document.getElementById("byt-krystal").value = 0;
  document.getElementById("byt-svar").textContent = "";
  opdaterByt();
  bytVindue.hidden = false;
}

// Hvad gæsten vil give for det, du tilbyder
function bytTilbud() {
  const gl = Math.max(0, parseInt(document.getElementById("byt-glimt").value, 10) || 0);
  const kr = Math.max(0, parseInt(document.getElementById("byt-krystal").value, 10) || 0);
  return { gl: gl, kr: kr, faarKr: Math.floor(gl / KURS), faarGl: kr * KURS };
}

function opdaterByt() {
  const t = bytTilbud();
  const linjer = [];
  if (t.faarKr) linjer.push("<img src='billeder/krystal.png' alt=''> " + t.faarKr + " Stella");
  if (t.faarGl) linjer.push("<img src='billeder/glimt.png' alt=''> " + t.faarGl + " " + system.valutaNavn);
  document.getElementById("byt-faar").innerHTML = linjer.length ? linjer.join("<br>") : "<span class='tom'>Tilbyd noget først</span>";
}

document.getElementById("byt-glimt").addEventListener("input", opdaterByt);
document.getElementById("byt-krystal").addEventListener("input", opdaterByt);
document.getElementById("byt-luk").addEventListener("click", function () { bytVindue.hidden = true; });
document.getElementById("byt-annuller").addEventListener("click", function () { bytVindue.hidden = true; });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") bytVindue.hidden = true; });

document.getElementById("byt-ok").addEventListener("click", function () {
  const t = bytTilbud();
  const svar = document.getElementById("byt-svar");
  if (!t.faarKr && !t.faarGl) { svar.textContent = "Du skal tilbyde mindst " + KURS + " " + system.valutaNavn + " eller 1 Stella."; return; }
  if (t.gl > glimt || t.kr > krystaller) { svar.textContent = "Du har ikke nok til det bytte."; return; }
  // man bytter kun hele Stella, så resten af Glimt bliver hos dig
  faaGlimt(-(t.faarKr * KURS) + t.faarGl);
  faaKrystaller(t.faarKr - t.kr);
  bytVindue.hidden = true;
  svaev("🔄", figur);
  gaestSkriver(bytMed, "Godt byttet! 🤝");
});
