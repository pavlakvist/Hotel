// =============================================================
//  👁 Skånsom visning — rarere for øjnene
//  Knap øverst ved siden af 🚪 Log ud. Den skifter mellem tre trin:
//    ☀️ Normal   = som før
//    🌿 Skånsom  = lidt dæmpet og varmere lys, roligere gulv og vægge,
//                  mindre blink (det er standard)
//    🌙 Aften    = som Skånsom, men mørkere (godt om aftenen)
//  Valget huskes på computeren (mit-hotel-skaansom).
// =============================================================
const SKAANSOM_NOEGLE = "mit-hotel-skaansom";
const SKAANSOM_TRIN = [
  { id: "normal", tekst: "☀️ Normal", titel: "Normal visning. Klik for Skånsom." },
  { id: "skaansom", tekst: "🌿 Skånsom", titel: "Skånsom visning (dæmpet og roligere). Klik for Aften." },
  { id: "aften", tekst: "🌙 Aften", titel: "Aften-visning (mørkere). Klik for Normal." },
];

function skaansomTrin() {
  try {
    const v = localStorage.getItem(SKAANSOM_NOEGLE);
    if (v === "normal" || v === "aften") return v;
  } catch (e) {}
  return "skaansom";
}
function skaansomTil() { return skaansomTrin() !== "normal"; }

// ----- Roligere gulv og vægge -----
// Mønstrene fra spil.js (planker, fuger, striber) får mindre kontrast,
// så de ikke "flimrer" for øjnene. Farverne er de samme.
const SKAANSOM_KOPIER = new Map();
function roligereMoenster(c, styrke) {
  if (!skaansomTil()) return c;
  let kopi = SKAANSOM_KOPIER.get(c);
  if (kopi) return kopi;
  kopi = document.createElement("canvas");
  kopi.width = c.width; kopi.height = c.height;
  const g = kopi.getContext("2d");
  g.drawImage(c, 0, 0);
  const data = g.getImageData(0, 0, c.width, c.height), d = data.data;
  // gennemsnitsfarven
  let r = 0, gr = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++;
  }
  if (n) { r /= n; gr /= n; b /= n; }
  // hver pixel trækkes et stykke hen mod gennemsnittet
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    d[i] = r + (d[i] - r) * styrke;
    d[i + 1] = gr + (d[i + 1] - gr) * styrke;
    d[i + 2] = b + (d[i + 2] - b) * styrke;
  }
  g.putImageData(data, 0, 0);
  SKAANSOM_KOPIER.set(c, kopi);
  return kopi;
}
if (typeof gulvMoenster === "function") {
  const gammelGulv = gulvMoenster;
  gulvMoenster = function (farve1, farve2, variant) {
    return roligereMoenster(gammelGulv(farve1, farve2, variant), 0.45);
  };
}
if (typeof vaegMoenster === "function") {
  const gammelVaeg = vaegMoenster;
  vaegMoenster = function (farve, hoejde, moerk) {
    return roligereMoenster(gammelVaeg(farve, hoejde, moerk), 0.6);
  };
}

// ----- Knappen -----
const skaansomKnap = document.createElement("button");
skaansomKnap.type = "button";
skaansomKnap.id = "skaansom-knap";
(document.getElementById("log-ud-knap") || document.getElementById("mention-knap") || document.querySelector("header h1")).after(skaansomKnap);

function visSkaansom() {
  const trin = skaansomTrin();
  const t = SKAANSOM_TRIN.find(function (x) { return x.id === trin; });
  skaansomKnap.textContent = t.tekst;
  skaansomKnap.title = t.titel;
  document.body.classList.toggle("skaansom", trin !== "normal");
  document.body.classList.toggle("skaansom-aften", trin === "aften");
}
skaansomKnap.addEventListener("click", function () {
  const nu = SKAANSOM_TRIN.findIndex(function (x) { return x.id === skaansomTrin(); });
  const naeste = SKAANSOM_TRIN[(nu + 1) % SKAANSOM_TRIN.length].id;
  try { localStorage.setItem(SKAANSOM_NOEGLE, naeste); } catch (e) {}
  visSkaansom();
});
visSkaansom();

// ----- Udseendet -----
const skaansomStil = document.createElement("style");
skaansomStil.textContent =
  "#skaansom-knap { margin-left: 8px; padding: 4px 10px; border: 2px solid #9ccc8f; border-radius: 8px;" +
  " background: #fbf6ea; color: #4e7d4a; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#skaansom-knap:hover { background: #eef7e6; }" +
  // Et varmt, svagt filter over hele skærmen: mindre skarpt hvidt og mindre blåt lys.
  // pointer-events: none = man kan stadig klikke på alt igennem det.
  "body.skaansom::after { content: ''; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;" +
  " background: rgb(242, 230, 212); mix-blend-mode: multiply; }" +
  "body.skaansom-aften::after { background: rgb(196, 182, 165); }" +
  // Spillet: lidt mindre mættede farver (de røde vægge og det orange gulv)
  "body.skaansom #spil { filter: saturate(0.85); }" +
  // Den knaldrøde 🚨-knap bliver en roligere rød
  "body.skaansom #hjaelp-knap { background: linear-gradient(#c96a5f, #a84a42); border-color: #7d3a33;" +
  " box-shadow: 0 3px 0 #6b2f29; }" +
  // Blink, der går hurtigt eller hele tiden, bliver langsommere eller stopper
  "body.skaansom .banner-stjerne, body.skaansom #online-tal *, body.skaansom #paamind-fane.har-idag," +
  " body.skaansom .ev-gave, body.skaansom .nav-gnist { animation: none !important; }" +
  "body.skaansom #et-pil { animation-duration: 1.8s !important; animation-timing-function: ease-in-out !important; }" +
  "body.skaansom #hjaelp-knap.tilkaldt, body.skaansom #hjaelp-kant, body.skaansom .hjaelp-boks { animation-duration: 2.4s !important; }" +
  "body.skaansom .hjaelp-ikon { animation-duration: 1.2s !important; }" +
  "body.skaansom #hjaelp-kant { box-shadow: inset 0 0 0 4px rgba(200, 60, 50, 0.7), inset 0 0 40px rgba(200, 50, 40, 0.35); }" +
  // Folk, der selv har bedt computeren om færre bevægelser, får det altid
  "@media (prefers-reduced-motion: reduce) { body.skaansom * { animation-iteration-count: 1 !important; } }";
document.head.appendChild(skaansomStil);
