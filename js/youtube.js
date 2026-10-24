// =============================================================
//  YouTube 📺  — skriv :youtube <link> i chatten
//  Videoen vises i et lille tv-vindue. Virker i dine egne rum;
//  ejeren af hotellet må i alle rum (også velkomsthallen).
//
//  OBS: YouTube vil ofte ikke afspille, når hotellet er åbnet
//  som fil (file://). Så er der en knap, der åbner videoen på YouTube.
// =============================================================
const YOUTUBE_KOMMANDO = /^[:：]\s*youtube\b\s*(.*)$/i;

// Find videoens id i et link (youtube.com/watch?v=…, youtu.be/…, shorts/…, embed/…)
function youtubeId(link) {
  const m = String(link).trim().match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(String(link).trim()) ? String(link).trim() : null;
}

const ytVindue = document.createElement("div");
ytVindue.id = "youtube-vindue";
ytVindue.hidden = true;
ytVindue.innerHTML =
  '<div class="kam-top"><b>📺 YouTube</b><button type="button" id="yt-luk" title="Luk og stop videoen">✕</button></div>' +
  '<div class="kam-krop">' +
  '  <div class="yt-skaerm"><iframe id="yt-afspiller" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
  '  <form id="yt-form" class="yt-form"><input id="yt-link" type="text" placeholder="Sæt et YouTube-link ind …"><button type="submit">▶ Afspil</button></form>' +
  '  <p id="yt-tekst" class="kam-tekst"></p>' +
  '  <div class="kam-knapper"><a id="yt-aaben" class="yt-aaben" target="_blank" rel="noopener">↗ Åbn på YouTube</a></div>' +
  '</div>';
document.body.appendChild(ytVindue);
goerFlytbar(ytVindue, ytVindue.querySelector(".kam-top"), "mit-hotel-flyt-youtube");

const ytAfspiller = document.getElementById("yt-afspiller");
const ytTekst = document.getElementById("yt-tekst");
const ytAaben = document.getElementById("yt-aaben");

function maaViseYoutube() {
  if (EJERE.indexOf(FIGUR.navn) >= 0) return true;   // ejeren må i alle rum
  return rumValg === "vaerelse" && maaRetteRum();     // andre kun i deres egne rum
}

function spilYoutube(link) {
  const id = youtubeId(link);
  ytVindue.hidden = false;
  if (!id) {
    ytTekst.textContent = link ? "Det ligner ikke et YouTube-link. Prøv at kopiere linket igen." : "Sæt et link ind fra YouTube, og tryk Afspil.";
    ytTekst.classList.toggle("fejl", !!link);
    return;
  }
  ytTekst.classList.remove("fejl");
  ytAfspiller.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
  ytAaben.href = "https://www.youtube.com/watch?v=" + id;
  ytAaben.hidden = false;
  ytTekst.textContent = location.protocol === "file:"
    ? "Viser videoen en fejl? YouTube vil ikke afspille i filer åbnet direkte fra computeren. Tryk ↗ Åbn på YouTube."
    : "📺 Videoen spiller i " + (rumValg === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse)) + ".";
  besked.textContent = "📺 Du satte en video på.";
}

function stopYoutube() {
  ytAfspiller.removeAttribute("src");
  ytVindue.hidden = true;
}

document.getElementById("yt-luk").addEventListener("click", stopYoutube);
document.getElementById("yt-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!maaViseYoutube()) { ytTekst.textContent = "YouTube virker kun i dine egne rum."; return; }
  spilYoutube(document.getElementById("yt-link").value);
});
ytAaben.hidden = true;

// videoen stopper, når man går ud af rummet
const skiftRumFoerYoutube = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerYoutube(navn);
  if (!ytVindue.hidden) stopYoutube();
};

// kommandoen :youtube i chatten
document.addEventListener("submit", function (e) {
  if (e.target !== chatForm) return;
  const m = chatTekst.value.trim().match(YOUTUBE_KOMMANDO);
  if (!m) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  chatTekst.value = "";
  if (!maaViseYoutube()) {
    besked.textContent = rumValg === "hal" ? "YouTube virker kun i dine egne rum, ikke i velkomsthallen." : "YouTube virker kun i dine egne rum.";
    return;
  }
  document.getElementById("yt-link").value = m[1];
  spilYoutube(m[1]);
}, true);
