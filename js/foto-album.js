// =============================================================
//  📸 Kameraet kan pynte billeder + 🖼️ det fælles album
//  - Når man tager et billede, kan man sætte filtre, tekst og smileys på,
//    før det gemmes. Der kommer altid en kopi i Mine ting → Billeder.
//  - "🌍 Gem + læg i album" lægger også billedet i hotellets fælles album.
//  - 🖼️-knappen i chatbaren åbner albummet, som alle kan se. Derfra kan man også
//    lægge et af sine egne billeder op. I Mine ting er der knappen 🌍 Album.
//  - Man kan slette sine egne billeder fra albummet. Ejeren og MOD kan slette alle.
//  Albummet kræver database-19-album.sql.
// =============================================================
const KR_FILTRE = [
  { id: "ingen", navn: "Ingen" }, { id: "sh", navn: "Sort/hvid" }, { id: "sepia", navn: "Gammel" },
  { id: "varm", navn: "Varm" }, { id: "kold", navn: "Kold" }, { id: "lys", navn: "Lys" },
  { id: "neon", navn: "Neon" }, { id: "drom", navn: "Drøm" }, { id: "retro", navn: "Retro" },
];
const KR_SMILEYS = ["😀", "😍", "😎", "🥳", "😂", "😴", "❤️", "⭐", "✨", "🎉", "🌸", "🔥", "👑", "🐶", "🍕", "🎈"];
const KR_FARVER = ["#ffffff", "#1b1b1b", "#ff5a7a", "#ffd23f", "#4fc3f7", "#7bd389", "#b388ff"];

// Lav et filter om på pixelniveau (så det virker i alle browsere)
function krFilter(c, id) {
  if (id === "ingen") return;
  const g = c.getContext("2d");
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  const w = c.width, h = c.height;
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i], gr = p[i + 1], b = p[i + 2];
    const graa = 0.3 * r + 0.59 * gr + 0.11 * b;
    if (id === "sh") { r = gr = b = graa; }
    else if (id === "sepia") { r = graa * 1.07 + 30; gr = graa * 0.9 + 14; b = graa * 0.7; }
    else if (id === "varm") { r = r * 1.1 + 14; gr = gr * 1.02 + 4; b = b * 0.85; }
    else if (id === "kold") { r = r * 0.86; gr = gr * 1.0 + 4; b = b * 1.12 + 18; }
    else if (id === "lys") { r = r * 1.15 + 22; gr = gr * 1.15 + 22; b = b * 1.15 + 22; }
    else if (id === "neon") { r = graa + (r - graa) * 2.1; gr = graa + (gr - graa) * 2.1; b = graa + (b - graa) * 2.1; }
    else if (id === "drom") { r = r * 0.85 + 60; gr = gr * 0.82 + 40; b = b * 0.85 + 70; }
    else if (id === "retro") { r = (r - 128) * 1.15 + 140; gr = (gr - 128) * 1.1 + 128; b = (b - 128) * 0.9 + 105; }
    if (id === "retro" || id === "drom") {      // mørkere hjørner
      const x = (i / 4) % w, y = Math.floor(i / 4 / w);
      const dx = x / w - 0.5, dy = y / h - 0.5, v = 1 - Math.min(0.45, (dx * dx + dy * dy) * 1.3);
      r *= v; gr *= v; b *= v;
    }
    p[i] = r; p[i + 1] = gr; p[i + 2] = b;
  }
  g.putImageData(d, 0, 0);
}

// -------------------------------------------------------------
//  Redigering i kameraet
// -------------------------------------------------------------
const kr = { grund: null, filter: "ingen", ting: [], traek: null, farve: KR_FARVER[0] };
const krBoks = document.createElement("div");
krBoks.id = "kam-rediger";
krBoks.hidden = true;
krBoks.innerHTML =
  "<div class='kr-venstre'><canvas id='kr-billede' width='" + FOTO_B * 2 + "' height='" + FOTO_H * 2 + "'></canvas>" +
  "<p class='kr-hjaelp'>Træk i tekst og smileys for at flytte dem.</p>" +
  "<input id='kr-album-tekst' type='text' maxlength='120' placeholder='Billedtekst til albummet (valgfri)'>" +
  "<div class='kr-knapper'><button type='button' id='kr-gem' class='kr-gem'>💾 Gem i Mine ting</button><button type='button' id='kr-album' class='kr-gem'>🌍 Gem + læg i album</button></div></div>" +
  "<div class='kr-hoejre'><b class='kr-titel'>🎨 Filter</b><div class='kr-filtre'>" + KR_FILTRE.map(function (f) {
    return "<button type='button' data-kr-filter='" + f.id + "'>" + f.navn + "</button>";
  }).join("") + "</div>" +
  "<b class='kr-titel'>🔤 Tekst</b><div class='kr-tekst'><input id='kr-tekst' type='text' maxlength='40' placeholder='Skriv noget …'>" +
  "<button type='button' id='kr-tekst-paa'>Sæt på</button></div><div class='kr-farver'>" + KR_FARVER.map(function (f) {
    return "<button type='button' data-kr-farve='" + f + "' style='background:" + f + "'></button>";
  }).join("") + "</div>" +
  "<b class='kr-titel'>😀 Smileys</b><div class='kr-smileys'>" + KR_SMILEYS.map(function (s) {
    return "<button type='button' data-kr-smiley='" + s + "'>" + s + "</button>";
  }).join("") + "</div>" +
  "<div class='kr-knapper'><button type='button' id='kr-fortryd'>↩ Fortryd</button><button type='button' id='kr-kasser'>✕ Kassér</button></div></div>";
kameraVindue.querySelector(".kam-krop").appendChild(krBoks);
const krCanvas = document.getElementById("kr-billede");

function krTegn(c, medRamme) {
  const g = c.getContext("2d");
  const s = c.width / krCanvas.width;
  g.drawImage(kr.grund, 0, 0, c.width, c.height);
  krFilter(c, kr.filter);
  kr.ting.forEach(function (t, i) {
    g.save();
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (t.slags === "tekst") {
      g.font = "bold " + Math.round(34 * s) + "px Verdana, sans-serif";
      g.lineWidth = 6 * s;
      g.strokeStyle = t.farve === "#1b1b1b" ? "#ffffff" : "#1b1b1b";
      g.strokeText(t.tekst, t.x * s, t.y * s);
      g.fillStyle = t.farve;
      g.fillText(t.tekst, t.x * s, t.y * s);
    } else {
      g.font = Math.round(56 * s) + "px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
      g.fillText(t.tekst, t.x * s, t.y * s);
    }
    if (medRamme && kr.traek && kr.traek.i === i) {
      const m = krMaal(t);
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.setLineDash([6, 4]); g.lineWidth = 2;
      g.strokeRect(t.x - m.w / 2, t.y - m.h / 2, m.w, m.h);
    }
    g.restore();
  });
}
function krMaal(t) {
  const g = krCanvas.getContext("2d");
  if (t.slags === "tekst") { g.font = "bold 34px Verdana, sans-serif"; return { w: g.measureText(t.tekst).width + 16, h: 46 }; }
  return { w: 66, h: 66 };
}
function krVis() {
  krTegn(krCanvas, true);
  krBoks.querySelectorAll("[data-kr-filter]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.krFilter === kr.filter); });
  krBoks.querySelectorAll("[data-kr-farve]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.krFarve === kr.farve); });
}
function krStart(grund) {
  kr.grund = grund; kr.filter = "ingen"; kr.ting = []; kr.traek = null;
  document.getElementById("kr-tekst").value = "";
  document.getElementById("kr-album-tekst").value = "";
  kameraVindue.classList.add("redigerer");
  krBoks.hidden = false;
  kamTekst.textContent = "📸 Klik! Pynt billedet, og gem det bagefter.";
  krVis();
}
function krSlut() {
  krBoks.hidden = true;
  kameraVindue.classList.remove("redigerer");
  requestAnimationFrame(soegerLoop);
}

// Kan browseren gemme pixels? (ikke når hotellet er åbnet som fil)
function kanGemmePixels() {
  try { const c = document.createElement("canvas"); c.width = c.height = 2; c.getContext("2d").drawImage(laerred, 0, 0, 2, 2); c.toDataURL(); return true; }
  catch (e) { return false; }
}
// "Tag billede" åbner redigeringen i stedet for at gemme med det samme
document.addEventListener("click", function (e) {
  if (!e.target.closest || !e.target.closest("#kam-tag") || !kanGemmePixels()) return;
  e.stopImmediatePropagation();
  e.preventDefault();
  const c = document.createElement("canvas");
  c.width = FOTO_B * 2; c.height = FOTO_H * 2;
  kopierUdsnit(c, kameraMidte());
  const blitz = document.getElementById("kam-blitz");
  blitz.classList.remove("blink"); void blitz.offsetWidth; blitz.classList.add("blink");
  krStart(c);
}, true);

krBoks.querySelectorAll("[data-kr-filter]").forEach(function (k) {
  k.addEventListener("click", function () { kr.filter = k.dataset.krFilter; krVis(); });
});
krBoks.querySelectorAll("[data-kr-farve]").forEach(function (k) {
  k.addEventListener("click", function () {
    kr.farve = k.dataset.krFarve;
    const sidste = kr.ting[kr.ting.length - 1];
    if (sidste && sidste.slags === "tekst") sidste.farve = kr.farve;
    krVis();
  });
});
function krTilfoej(t) {
  const n = kr.ting.length % 5;
  t.x = krCanvas.width / 2 + (n - 2) * 40;
  t.y = t.slags === "tekst" ? krCanvas.height - 50 - n * 10 : krCanvas.height / 2 + (n - 2) * 30;
  kr.ting.push(t);
  krVis();
}
document.getElementById("kr-tekst-paa").addEventListener("click", function () {
  const felt = document.getElementById("kr-tekst");
  const tekst = felt.value.trim();
  if (!tekst) { felt.focus(); return; }
  krTilfoej({ slags: "tekst", tekst: typeof rensTekst === "function" ? rensTekst(tekst) : tekst, farve: kr.farve });
  felt.value = "";
});
document.getElementById("kr-tekst").addEventListener("keydown", function (e) {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById("kr-tekst-paa").click(); }
});
krBoks.querySelectorAll("[data-kr-smiley]").forEach(function (k) {
  k.addEventListener("click", function () { krTilfoej({ slags: "smiley", tekst: k.dataset.krSmiley }); });
});
document.getElementById("kr-fortryd").addEventListener("click", function () {
  if (kr.ting.length) kr.ting.pop(); else kr.filter = "ingen";
  krVis();
});
document.getElementById("kr-kasser").addEventListener("click", function () {
  krSlut();
  kamTekst.textContent = "Billedet blev kasseret.";
});

// træk i tekst og smileys
function krPunkt(e) {
  const r = krCanvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * krCanvas.width / r.width, y: (e.clientY - r.top) * krCanvas.height / r.height };
}
krCanvas.addEventListener("mousedown", function (e) {
  const p = krPunkt(e);
  for (let i = kr.ting.length - 1; i >= 0; i--) {
    const t = kr.ting[i], m = krMaal(t);
    if (Math.abs(p.x - t.x) <= m.w / 2 && Math.abs(p.y - t.y) <= m.h / 2) {
      e.preventDefault();
      kr.ting.push(kr.ting.splice(i, 1)[0]);       // øverst
      kr.traek = { i: kr.ting.length - 1, dx: p.x - t.x, dy: p.y - t.y };
      krVis();
      return;
    }
  }
});
window.addEventListener("mousemove", function (e) {
  if (!kr.traek) return;
  const p = krPunkt(e), t = kr.ting[kr.traek.i];
  t.x = Math.max(0, Math.min(krCanvas.width, p.x - kr.traek.dx));
  t.y = Math.max(0, Math.min(krCanvas.height, p.y - kr.traek.dy));
  krVis();
});
window.addEventListener("mouseup", function () { if (kr.traek) { kr.traek = null; krVis(); } });

// Gem: altid en kopi i Mine ting
function krGem() {
  const c = document.createElement("canvas");
  c.width = krCanvas.width; c.height = krCanvas.height;
  krTegn(c, false);
  const foto = { id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tid: Date.now(), rumNavn: rumNavnNu(), data: c.toDataURL("image/jpeg", 0.85) };
  fotoCache[foto.id] = c;
  fotos.push(foto);
  if (!gemFotos()) {
    fotos.pop();
    kamTekst.textContent = "Der er ikke plads til flere billeder. Slet nogle i Mine ting 📦.";
    return null;
  }
  visLager();
  return { foto: foto, c: c };
}
document.getElementById("kr-gem").addEventListener("click", function () {
  if (!krGem()) return;
  krSlut();
  kamTekst.textContent = "💾 Gemt! Billedet ligger i Mine ting under 📷 Billeder.";
});
document.getElementById("kr-album").addEventListener("click", function () {
  const tekst = document.getElementById("kr-album-tekst").value;
  const gemt = krGem();
  if (!gemt) return;
  krSlut();
  kamTekst.textContent = "💾 Gemt i Mine ting. Lægger det i albummet …";
  sendTilAlbum(gemt.c, tekst, gemt.foto.rumNavn).then(function () {
    kamTekst.textContent = "🌍 Billedet ligger nu i albummet, og en kopi i Mine ting.";
  }).catch(function (e) { kamTekst.textContent = "💾 Gemt i Mine ting, men ikke i albummet: " + e.message; });
});


// -------------------------------------------------------------
//  🖼️ Det fælles album
// -------------------------------------------------------------
function albumData(kilde) {
  const c = document.createElement("canvas");
  c.width = 480; c.height = 360;
  const g = c.getContext("2d");
  g.fillStyle = "#1b2536";
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(kilde, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}
function sendTilAlbum(kilde, tekst, rum) {
  if (!SERVER.til || !mitToken()) return Promise.reject(new Error("Albummet kræver, at du er logget ind på hotellet."));
  return serverKald("hv_album_send", { p_token: mitToken(), p_billede: albumData(kilde), p_tekst: (typeof rensTekst === "function" ? rensTekst(tekst || "") : tekst) || null, p_rum: rum || null })
    .then(function () { albumBilleder = null; if (!albumVindue.hidden) hentAlbum(); })
    .catch(function (e) {
      throw new Error(/hv_album/.test(e.message) ? "kør database-19-album.sql i Supabase først." : e.message);
    });
}

const albumKnap = document.createElement("button");
albumKnap.type = "button";
albumKnap.id = "chat-album-knap";
albumKnap.className = "chat-lille";
albumKnap.title = "Hotellets fotoalbum";
albumKnap.textContent = "🖼️";
kameraKnap.after(albumKnap);

const albumVindue = document.createElement("div");
albumVindue.id = "album-vindue";
albumVindue.hidden = true;
albumVindue.innerHTML =
  "<div class='al-top'><b>🖼️ Hotellets album</b><span><button type='button' id='al-op' title='Læg et af dine billeder i albummet'>➕ Læg op</button>" +
  "<button type='button' id='al-luk' title='Luk'>✕</button></span></div><div id='al-krop'></div>";
document.body.appendChild(albumVindue);
goerFlytbar(albumVindue, albumVindue.querySelector(".al-top"), "mit-hotel-flyt-album");

let albumBilleder = null;      // null = ikke hentet
let albumFejl = "";
let albumFlere = true;
let albumVist = null;          // billedet, der er åbent stort
let albumVaelger = false;      // viser mine egne billeder, så jeg kan vælge et
let albumSletSikker = false;

function hentAlbum(flere) {
  if (!SERVER.til || !mitToken()) { albumFejl = "Albummet kræver, at du er logget ind på hotellet."; visAlbum(); return; }
  const foer = flere && albumBilleder && albumBilleder.length ? albumBilleder[albumBilleder.length - 1].id : null;
  serverKald("hv_album_hent", { p_token: mitToken(), p_foer: foer }).then(function (liste) {
    liste = liste || [];
    albumFejl = "";
    albumFlere = liste.length >= 24;
    if (flere) albumBilleder = (albumBilleder || []).concat(liste);
    else {
      const gamle = albumBilleder || [];
      albumBilleder = liste.concat(gamle.filter(function (a) { return liste.length && a.id < liste[liste.length - 1].id; }));
    }
    visAlbum();
  }).catch(function (e) {
    albumFejl = /hv_album/.test(e.message) ? "Albummet virker, når database-19-album.sql er kørt i Supabase." : e.message;
    visAlbum();
  });
}
function albumDato(t) {
  const d = new Date(t);
  return d.getDate() + "/" + (d.getMonth() + 1) + " kl. " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
}
function maaSletteAlbum(a) {
  return a.navn === FIGUR.navn || EJERE.indexOf(FIGUR.navn) >= 0 || (typeof ansatte !== "undefined" && ansatte[FIGUR.navn] === "mod");
}

function visAlbum() {
  if (albumVindue.hidden) return;
  const krop = document.getElementById("al-krop");
  document.getElementById("al-op").classList.toggle("valgt", albumVaelger);
  if (albumVaelger) {
    const mine = fotos.slice().sort(function (a, b) { return b.tid - a.tid; });
    krop.innerHTML = "<p class='al-info'>Vælg et af dine billeder fra Mine ting. Skriv evt. en billedtekst først.</p>" +
      "<input id='al-tekst' type='text' maxlength='120' placeholder='Billedtekst (valgfri)'>" +
      (mine.length ? "<div class='al-gitter'></div>" : "<p class='al-tom'>Du har ingen billeder endnu. Tag et med kameraet 📷.</p>") +
      "<p id='al-status' class='al-info'></p><button type='button' id='al-tilbage' class='al-tilbage'>← Tilbage til albummet</button>";
    const gitter = krop.querySelector(".al-gitter");
    mine.forEach(function (f) {
      const k = document.createElement("button");
      k.className = "al-billede";
      const c = document.createElement("canvas");
      c.width = 160; c.height = 120;
      tegnFotoI(c, f);
      k.appendChild(c);
      k.insertAdjacentHTML("beforeend", "<small>" + rens(f.rumNavn) + " · " + fotoDato(f) + "</small>");
      k.addEventListener("click", function () {
        const b = fotoBillede(f);
        const status = document.getElementById("al-status");
        if (!b) { status.textContent = "Billedet er ikke klar endnu. Prøv igen om lidt."; return; }
        status.textContent = "Lægger billedet op …";
        sendTilAlbum(b, document.getElementById("al-tekst").value, f.rumNavn).then(function () {
          albumVaelger = false;
          visAlbum();
        }).catch(function (e) { status.textContent = "⚠ " + e.message; });
      });
      gitter.appendChild(k);
    });
    document.getElementById("al-tilbage").onclick = function () { albumVaelger = false; visAlbum(); };
    return;
  }
  if (albumVist) {
    const a = albumVist;
    krop.innerHTML = "<div class='al-stor'><img src='" + a.billede + "' alt=''>" +
      (a.tekst ? "<p class='al-billedtekst'>" + rens(a.tekst) + "</p>" : "") +
      "<p class='al-hvem'>📷 <b>" + rens(a.navn) + "</b>" + (a.rum ? " i " + rens(a.rum) : "") + " · " + albumDato(a.tid) + "</p>" +
      "<div class='al-knapper'><button type='button' id='al-kopi'>💾 Gem kopi i Mine ting</button>" +
      (maaSletteAlbum(a) ? "<button type='button' id='al-slet' class='" + (albumSletSikker ? "sikker" : "") + "'>" + (albumSletSikker ? "Er du sikker? Tryk igen" : "🗑 Slet") + "</button>" : "") +
      "</div><button type='button' id='al-tilbage' class='al-tilbage'>← Tilbage til albummet</button></div>";
    document.getElementById("al-tilbage").onclick = function () { albumVist = null; albumSletSikker = false; visAlbum(); };
    document.getElementById("al-kopi").onclick = function () {
      const foto = { id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tid: Date.now(), rumNavn: (a.rum || "albummet") + " (fra " + a.navn + ")", data: a.billede };
      fotos.push(foto);
      if (!gemFotos()) { fotos.pop(); besked.textContent = "Der er ikke plads til flere billeder i Mine ting."; return; }
      visLager();
      this.textContent = "✅ Gemt i Mine ting";
      this.disabled = true;
    };
    const slet = document.getElementById("al-slet");
    if (slet) slet.onclick = function () {
      if (!albumSletSikker) { albumSletSikker = true; visAlbum(); return; }
      albumSletSikker = false;
      serverKald("hv_album_slet", { p_token: mitToken(), p_id: a.id }).then(function () {
        albumBilleder = (albumBilleder || []).filter(function (x) { return x.id !== a.id; });
        albumVist = null;
        visAlbum();
      }).catch(function (e) { besked.textContent = e.message; });
    };
    return;
  }
  if (albumBilleder === null) { krop.innerHTML = "<p class='al-tom'>" + rens(albumFejl || "Henter albummet …") + "</p>"; return; }
  krop.innerHTML = (albumFejl ? "<p class='al-info'>" + rens(albumFejl) + "</p>" : "") +
    (albumBilleder.length ? "<div class='al-gitter'></div>" : "<p class='al-tom'>Albummet er tomt.<br><small>Tag et billede med kameraet 📷, og tryk 🌍 Gem + læg i album.</small></p>") +
    (albumFlere && albumBilleder.length ? "<button type='button' id='al-flere' class='al-tilbage'>Hent flere billeder</button>" : "");
  const gitter = krop.querySelector(".al-gitter");
  albumBilleder.forEach(function (a) {
    const k = document.createElement("button");
    k.className = "al-billede";
    k.innerHTML = "<img src='" + a.billede + "' alt='' loading='lazy'><small><b>" + rens(a.navn) + "</b> · " + albumDato(a.tid) + "</small>" +
      (a.tekst ? "<i>" + rens(a.tekst) + "</i>" : "");
    k.addEventListener("click", function () { albumVist = a; albumSletSikker = false; visAlbum(); krop.scrollTop = 0; });
    gitter.appendChild(k);
  });
  const flere = document.getElementById("al-flere");
  if (flere) flere.onclick = function () { hentAlbum(true); };
}

albumKnap.addEventListener("click", function () {
  albumVindue.hidden = !albumVindue.hidden;
  if (!albumVindue.hidden) { albumVist = null; albumVaelger = false; visAlbum(); hentAlbum(); }
});
document.getElementById("al-luk").addEventListener("click", function () { albumVindue.hidden = true; });
document.getElementById("al-op").addEventListener("click", function () { albumVaelger = !albumVaelger; albumVist = null; visAlbum(); });
setInterval(function () { if (!albumVindue.hidden && !albumVist && !albumVaelger) hentAlbum(); }, 20000);

// I Mine ting: 🌍 Album ud for det valgte billede
const lagAlbumKnap = document.createElement("button");
lagAlbumKnap.type = "button";
lagAlbumKnap.id = "lager-album";
lagAlbumKnap.textContent = "🌍 Album";
lagAlbumKnap.title = "Læg billedet i hotellets album";
lagAlbumKnap.hidden = true;
haengKnap.after(lagAlbumKnap);
lagAlbumKnap.className = haengKnap.className;
const visLagerFotosFoerAlbum = visLagerFotos;
visLagerFotos = function () {
  visLagerFotosFoerAlbum();
  lagAlbumKnap.hidden = haengKnap.hidden;
  lagAlbumKnap.textContent = "🌍 Album";
  lagAlbumKnap.disabled = false;
};
lagAlbumKnap.addEventListener("click", function () {
  const f = fotoValgt && fotoMedId(fotoValgt);
  const b = f && fotoBillede(f);
  if (!b) return;
  lagAlbumKnap.disabled = true;
  lagAlbumKnap.textContent = "Lægger op …";
  sendTilAlbum(b, "", f.rumNavn).then(function () {
    lagAlbumKnap.textContent = "✅ I albummet";
    besked.textContent = "🌍 Billedet ligger nu i hotellets album 🖼️";
  }).catch(function (e) {
    lagAlbumKnap.disabled = false;
    lagAlbumKnap.textContent = "🌍 Album";
    besked.textContent = e.message;
  });
});


// -------------------------------------------------------------
//  Udseendet (grøn/creme)
// -------------------------------------------------------------
const fotoAlbumStil = document.createElement("style");
fotoAlbumStil.textContent =
  "#kamera.redigerer { width: min(700px, calc(100vw - 20px)); left: max(10px, calc(50% - 350px)); }" +
  "#kamera.redigerer .kam-soeger, #kamera.redigerer .kam-knapper { display: none; }" +
  "#kam-rediger[hidden] { display: none; }" +
  "#kam-rediger { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 12px; max-height: calc(100vh - 140px); overflow-y: auto; }" +
  "#kam-rediger .kr-venstre, #kam-rediger .kr-hoejre { display: flex; flex-direction: column; gap: 6px; min-width: 0; }" +
  "@media (max-width: 620px) { #kam-rediger { grid-template-columns: 1fr; } }" +
  "#kr-billede { width: 100%; border: 5px solid #2b2b2b; border-radius: 8px; cursor: move; background: #1b2536; }" +
  "#kam-rediger .kr-hjaelp { margin: 0; font-size: 11px; color: #5c6b56; }" +
  "#kam-rediger .kr-titel { font-size: 12px; color: #3b6338; margin-top: 2px; }" +
  "#kam-rediger .kr-filtre, #kam-rediger .kr-smileys { display: flex; flex-wrap: wrap; gap: 4px; }" +
  "#kam-rediger .kr-filtre button { padding: 4px 8px; border: 2px solid #9ccc8f; border-radius: 12px; background: #fff; color: #2f4a2b; font: bold 11px Verdana, sans-serif; cursor: pointer; }" +
  "#kam-rediger .kr-filtre button.valgt { background: #4e7d4a; border-color: #4e7d4a; color: #fff; }" +
  "#kam-rediger .kr-smileys button { width: 32px; height: 32px; border: 1px solid #d6e8c8; border-radius: 8px; background: #fff; font-size: 18px; cursor: pointer;" +
  " font-family: 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif; }" +
  "#kam-rediger .kr-smileys button:hover { background: #eef7e6; }" +
  "#kam-rediger .kr-tekst { display: flex; gap: 4px; }" +
  "#kam-rediger input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid #9ccc8f; border-radius: 8px; font: 12px Verdana, sans-serif; }" +
  "#kamera #kam-rediger #kr-tekst-paa { padding: 0 10px; font: bold 12px Verdana, sans-serif; border: 2px solid #3b6338; border-radius: 8px; background: #4e7d4a; color: #fff; font-weight: bold; cursor: pointer; }" +
  "#kam-rediger .kr-farver { display: flex; gap: 5px; }" +
  "#kam-rediger .kr-farver button { width: 24px; height: 24px; border: 2px solid #c9d8bf; border-radius: 50%; cursor: pointer; }" +
  "#kam-rediger .kr-farver button.valgt { border-color: #2f4a2b; box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4e7d4a; }" +
  "#kam-rediger .kr-knapper { display: flex; gap: 6px; }" +
  "#kam-rediger .kr-knapper button { flex: 1; padding: 7px 8px; border: 2px solid #9ccc8f; border-radius: 9px; background: #fff; color: #3d6b39; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#kam-rediger .kr-knapper .kr-gem { background: #4e7d4a; border-color: #33562f; color: #fff; }" +
  "#album-vindue[hidden] { display: none; }" +
  "#album-vindue { position: fixed; z-index: 14; left: max(10px, calc(50% - 280px)); top: max(10px, calc(50% - 260px)); width: min(560px, calc(100vw - 20px));" +
  " background: #fbf6ea; border: 3px solid #4e7d4a; border-radius: 14px; box-shadow: 0 6px 0 #33562f, 0 14px 30px rgba(0,0,0,0.35); font: 13px Verdana, sans-serif; color: #33402c; }" +
  "#album-vindue .al-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #4e7d4a; color: #fff; border-radius: 10px 10px 0 0; }" +
  "#album-vindue .al-top span { display: flex; gap: 6px; }" +
  "#album-vindue .al-top button { padding: 3px 8px; border: 2px solid #9ccc8f; border-radius: 7px; background: #fbf6ea; color: #3d6b39; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#album-vindue .al-top button.valgt { background: #ffd23f; border-color: #c99a1e; }" +
  "#al-krop { padding: 10px 12px 12px; max-height: 65vh; overflow-y: auto; }" +
  "#album-vindue .al-gitter { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }" +
  "#album-vindue .al-billede { display: flex; flex-direction: column; gap: 3px; padding: 5px; background: #fff; border: 2px solid #d6e8c8; border-radius: 8px;" +
  " cursor: pointer; text-align: left; font: 11px Verdana, sans-serif; color: #33402c; box-shadow: 0 2px 0 rgba(0,0,0,0.08); }" +
  "#album-vindue .al-billede:hover { border-color: #9ccc8f; transform: rotate(-1deg); }" +
  "#album-vindue .al-billede img, #album-vindue .al-billede canvas { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 4px; background: #1b2536; }" +
  "#album-vindue .al-billede i { color: #4d5a48; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  "#album-vindue .al-stor img { width: 100%; border: 6px solid #fff; border-radius: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.25); }" +
  "#album-vindue .al-billedtekst { margin: 8px 0 2px; font-size: 14px; font-style: italic; }" +
  "#album-vindue .al-hvem { margin: 4px 0 8px; font-size: 12px; color: #4d5a48; }" +
  "#album-vindue .al-knapper { display: flex; gap: 6px; margin-bottom: 8px; }" +
  "#album-vindue .al-knapper button { flex: 1; padding: 7px; border: 2px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#album-vindue #al-slet { border-color: #e0b4b4; background: #fff; color: #b23b3b; }" +
  "#album-vindue #al-slet.sikker { background: #d64545; border-color: #a83232; color: #fff; }" +
  "#album-vindue .al-tilbage { width: 100%; margin-top: 8px; padding: 7px; border: 2px solid #9ccc8f; border-radius: 8px; background: #fff; color: #3d6b39; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#album-vindue .al-info { margin: 0 0 8px; font-size: 12px; color: #4d5a48; }" +
  "#album-vindue #al-tekst { width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 6px 8px; border: 1px solid #9ccc8f; border-radius: 8px; font: 12px Verdana, sans-serif; }" +
  "#album-vindue .al-tom { text-align: center; padding: 30px 10px; color: #4d5a48; }";
document.head.appendChild(fotoAlbumStil);
