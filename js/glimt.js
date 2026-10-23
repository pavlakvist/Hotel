// =============================================================
//  Glimt ⭐ — hotellets penge
//  Vises øverst til højre ved siden af panelet.
//  Senere kan man bruge dem i en shop: brug  brugGlimt(pris)
//  (giver true, hvis man havde råd) og  faaGlimt(antal).
// =============================================================
const GLIMT_NOEGLE = "mit-hotel-glimt";
const glimtBoks = document.getElementById("glimt");
const glimtTal = document.getElementById("glimt-tal");

let glimt = null;
try { glimt = localStorage.getItem(GLIMT_NOEGLE); } catch (e) {}
// nye spillere starter med det beløb, der står i ejerpanelet
glimt = glimt === null ? system.startBeloeb : Math.max(0, parseInt(glimt, 10) || 0);

function visGlimt() {
  glimtTal.textContent = glimt.toLocaleString("da-DK");
  document.getElementById("glimt-navn").textContent = system.valutaNavn;
  try { localStorage.setItem(GLIMT_NOEGLE, String(glimt)); } catch (e) {}
}

function faaGlimt(antal) {
  glimt = Math.max(0, glimt + antal);
  visGlimt();
  glimtBoks.classList.remove("blink");
  void glimtBoks.offsetWidth;          // så animationen starter forfra
  glimtBoks.classList.add("blink");
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
