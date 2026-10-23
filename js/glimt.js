// =============================================================
//  Glimt ⭐ og Stella 🔮 — hotellets penge
//  (Stella hed før Krystaller, derfor hedder koden stadig krystal)
//  Vises øverst til højre ved siden af panelet.
//  Glimt er de almindelige penge, Stella er de sjældne.
//  Senere kan man bruge dem i en shop: brugGlimt(pris) og
//  brugKrystaller(pris) giver true, hvis man havde råd.
//  faaGlimt(antal) og faaKrystaller(antal) giver nogle.
// =============================================================
const GLIMT_NOEGLE = "mit-hotel-glimt";
const KRYSTAL_NOEGLE = "mit-hotel-krystaller";
const glimtBoks = document.getElementById("glimt");
const glimtTal = document.getElementById("glimt-tal");

let glimt = null;
try { glimt = localStorage.getItem(GLIMT_NOEGLE); } catch (e) {}
// nye spillere starter med det beløb, der står i ejerpanelet
glimt = glimt === null ? system.startBeloeb : Math.max(0, parseInt(glimt, 10) || 0);

let krystaller = null;
try { krystaller = localStorage.getItem(KRYSTAL_NOEGLE); } catch (e) {}
krystaller = krystaller === null ? system.startKrystaller : Math.max(0, parseInt(krystaller, 10) || 0);

function visGlimt() {
  glimtTal.textContent = glimt.toLocaleString("da-DK");
  document.getElementById("glimt-navn").textContent = system.valutaNavn;
  document.querySelectorAll(".valuta-navn").forEach(function (el) { el.textContent = system.valutaNavn; });
  document.getElementById("krystal-tal").textContent = krystaller.toLocaleString("da-DK");
  try {
    localStorage.setItem(GLIMT_NOEGLE, String(glimt));
    localStorage.setItem(KRYSTAL_NOEGLE, String(krystaller));
  } catch (e) {}
}

function blink(boks) {
  boks.classList.remove("blink");
  void boks.offsetWidth;               // så animationen starter forfra
  boks.classList.add("blink");
}

function faaGlimt(antal) {
  glimt = Math.max(0, glimt + antal);
  visGlimt();
  blink(glimtBoks.querySelector(".penge"));
}

function faaKrystaller(antal) {
  krystaller = Math.max(0, krystaller + antal);
  visGlimt();
  blink(glimtBoks.querySelector(".krystal"));
}

function brugKrystaller(pris) {
  if (krystaller < pris) return false;
  faaKrystaller(-pris);
  return true;
}

function brugGlimt(pris) {
  if (glimt < pris) return false;
  faaGlimt(-pris);
  return true;
}

// Glimt står altid lige til venstre for panelet, også når det åbnes
function placerGlimt() {
  const panel = document.getElementById("panel");
  glimtBoks.style.right = (panel.offsetWidth + 16) + "px";
}
new ResizeObserver(placerGlimt).observe(document.getElementById("panel"));
placerGlimt();
visGlimt();
