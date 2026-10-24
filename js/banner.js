// =============================================================
//  Banner øverst på skærmen 📢
//  Den nyeste nyhed fra ejerpanelet (Events og nyheder) vises
//  stort øverst, så alle kan se den.
//  - Spillere kan lukke den med ✕ og få den tilbage med 📢-knappen.
//  - Ejeren kan fjerne den for alle i ejerpanelet.
//  Gemmes på denne computer, indtil hotellet får en server.
// =============================================================
const BANNER_LUKKET_NOEGLE = "mit-hotel-banner-lukket";   // tidspunktet på det banner man selv har lukket

const bannerBoks = document.createElement("div");
bannerBoks.id = "banner";
bannerBoks.hidden = true;
bannerBoks.innerHTML =
  "<span class='banner-stjerne'>✦</span>" +
  "<div class='banner-tekst'><b id='banner-titel'></b><span id='banner-under'></span></div>" +
  "<span class='banner-stjerne'>✦</span>" +
  "<button type='button' id='banner-luk' title='Skjul banneret'>✕</button>";
document.querySelector("main").appendChild(bannerBoks);

const bannerIgen = document.createElement("button");
bannerIgen.type = "button";
bannerIgen.id = "banner-igen";
bannerIgen.title = "Vis banneret igen";
bannerIgen.textContent = "📢";
bannerIgen.hidden = true;
document.querySelector("main").appendChild(bannerIgen);

// Det banner der gælder lige nu: den nyeste nyhed, som stadig er et banner
function aktivtBanner() {
  for (let i = nyheder.length - 1; i >= 0; i--) {
    if (nyheder[i].banner !== false) return nyheder[i];
  }
  return null;
}

function visBanner() {
  const b = aktivtBanner();
  let lukket = null;
  try { lukket = localStorage.getItem(BANNER_LUKKET_NOEGLE); } catch (e) {}
  if (!b) { bannerBoks.hidden = true; bannerIgen.hidden = true; return; }
  document.getElementById("banner-titel").textContent = b.titel;
  document.getElementById("banner-under").textContent = b.tekst || "";
  const erLukket = lukket === String(b.tid);
  bannerBoks.hidden = erLukket;
  bannerIgen.hidden = !erLukket;
  if (!erLukket) {
    bannerBoks.classList.remove("hop");
    void bannerBoks.offsetWidth;
    bannerBoks.classList.add("hop");
  }
}

document.getElementById("banner-luk").addEventListener("click", function () {
  const b = aktivtBanner();
  if (b) try { localStorage.setItem(BANNER_LUKKET_NOEGLE, String(b.tid)); } catch (e) {}
  visBanner();
});
bannerIgen.addEventListener("click", function () {
  try { localStorage.removeItem(BANNER_LUKKET_NOEGLE); } catch (e) {}
  visBanner();
});

visBanner();
