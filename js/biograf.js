// =============================================================
//  Biografen 🎬 — et fælles rum med et stort lærred, røde
//  biografsæder og en popcornmaskine.
//  - Hotellets ansatte og ejeren klikker på lærredet (eller skriver :youtube <link>) for at sætte en film på.
//    Filmen vises på lærredet for alle, der er i biografen.
//  - Sæderne vender ryggen til, mod lærredet. Man kan godt sidde i dem:
//    så ser man hovedet over ryglænet, ligesom i en rigtig biograf.
//  - Klik på popcornmaskinen for at få et bæger popcorn 🍿 i hånden
//    (spises lidt ad gangen, ligesom maden fra køleskabet i js/koeleskab.js).
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================

// -------------------------------------------------------------
//  Rummet
// -------------------------------------------------------------
const BIOGRAF_RUM = { id: "biograf", navn: "Biografen", ejer: EJER_NAVNE[0], bredde: 12, dybde: 14,
  vaeg: "#4a1a22", gulv1: "#7c1f2c", gulv2: "#6e1a26", vaegHoejde: 260, doer: { x: 0, y: 12 } };
INDBYGGEDE_RUM.biograf = BIOGRAF_RUM;

// Lærredet hænger på bagvæggen (den højre væg øverst) fra felt "fra" til "til", i "bund"-"top" pixels over gulvet
const LAERRED = { fra: 2.5, til: 9.5, bund: 40, top: 215 };

// Hotellets egne møbler i biografen: 4 rækker sæder, der vender mod lærredet (retning 2), og to popcornmaskiner
const BIOGRAF_MOEBLER = [];
[4, 6, 8, 10].forEach(function (y) {
  for (let x = 2; x <= 9; x++) BIOGRAF_MOEBLER.push({ type: "bio-saede", x: x, y: y, spejlet: false, retning: 2 });
});
BIOGRAF_MOEBLER.push({ type: "popcorn-maskine", x: 0, y: 2, spejlet: false, retning: 1 });
BIOGRAF_MOEBLER.push({ type: "popcorn-maskine", x: 11, y: 2, spejlet: false, retning: 0 });
if (!MOEBEL_TYPER["bio-saede"]) console.warn("Biografen: bio-saede mangler i js/moebel-katalog.js (gammel udgave i browseren? Tryk Ctrl+F5)");

function iBiografen() { return rumValg === "vaerelse" && aktivtVaerelse === "biograf"; }
// YouTube vil ikke afspille i filer åbnet direkte fra computeren (fejl 153), kun på hotellet på nettet
const BIO_FRA_FIL = location.protocol === "file:";
// Kun hotellets ansatte (skilte i ANSAT_SKILTE, js/eventrum.js) og ejeren kan sætte film på og stoppe dem
function maaStyreBio(navn) {
  navn = navn || FIGUR.navn;
  return typeof erAnsat === "function" ? erAnsat(navn) : EJERE.indexOf(navn) >= 0;
}

// Møblerne: det, der er gemt på denne computer, ellers hotellets egne
const vaerelseMoeblerFoerBio = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === "biograf" && !andreVaerelser.biograf) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-biograf") || "null"); } catch (e) {}
    andreVaerelser.biograf = (Array.isArray(gemt) && gemt.length ? gemt : BIOGRAF_MOEBLER)
      .map(function (m) { return Object.assign({}, m); }).filter(function (m) { return MOEBEL_TYPER[m.type]; });
  }
  return vaerelseMoeblerFoerBio(id);
};

// Navigatøren (stueetagen) og dermed også elevatoren
NAV_RUM.splice(1, 0, { id: "biograf", etage: "stue", navn: "Biografen", om: "Film på det store lærred 🍿",
  billede: "billeder/rum/biograf.png", maks: 40, rum: "vaerelse", vaerelse: "biograf" });


// -------------------------------------------------------------
//  Serveren: har ingen bygget noget i biografen endnu, ser alle hotellets egne møbler
//  (js/bygmester.js henter møblerne i de fælles rum)
// -------------------------------------------------------------
function biografSomData() {
  return BIOGRAF_MOEBLER.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: false, retning: m.retning }; });
}
let bioFilm = { v: null, t: 0, af: "" };      // filmen på lærredet: YouTube-id, hvornår den startede, hvem
if (typeof serverKald === "function") {
  const serverKaldFoerBio = serverKald;
  serverKald = async function (funktion, data) {
    if (funktion === "hv_puls" && iBiografen() && bioFilm.t) {
      // filmen sendes med til de andre i biografen (ligger i p_sidder, så databasen skal ikke ændres)
      data = Object.assign({}, data, { p_sidder: Object.assign({}, data.p_sidder || {}, { bio: bioFilm }) });
    }
    const svar = await serverKaldFoerBio(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar && !svar.biograf) svar.biograf = biografSomData();
    if (funktion === "hv_puls") { try { bioFraServer(svar); } catch (e) { console.warn(e); } }
    return svar;
  };
}

// En anden i biografen har sat en nyere film på (eller stoppet den)
function bioFraServer(svar) {
  if (!svar || !Array.isArray(svar.spillere) || !iBiografen()) return;
  svar.spillere.forEach(function (s) {
    const b = s.rum === "biograf" && s.sidder && s.sidder.bio;
    if (b && b.t > bioFilm.t && maaStyreBio(b.af)) saetFilm(b.v, b.t, b.af);
  });
}


// -------------------------------------------------------------
//  Lærredet på væggen (tegnes med kode)
// -------------------------------------------------------------
// Et punkt på bagvæggen: x = felt langs væggen, h = pixels over gulvet
function vaegPunkt(x, h) {
  const p = punkt(x, 0);
  return { x: p.x, y: p.y - h };
}
function laerredHjoerner() {
  return [vaegPunkt(LAERRED.fra, LAERRED.top), vaegPunkt(LAERRED.til, LAERRED.top),
    vaegPunkt(LAERRED.til, LAERRED.bund), vaegPunkt(LAERRED.fra, LAERRED.bund)];
}
function vaegFirkant(x1, x2, h1, h2, farve) {
  polygon(ctx, [vaegPunkt(x1, h2), vaegPunkt(x2, h2), vaegPunkt(x2, h1), vaegPunkt(x1, h1)], farve);
}

// Gardinerne: 1 = trukket for, 0 = trukket fra. Det tager BIO_GARDIN_TID sekunder.
let bioGardin = 1, bioGardinTid = performance.now();
const BIO_GARDIN_TID = 1.8;
const BIO_MOERKE = 0.62;   // hvor mørkt der bliver i salen, når filmen kører (0 = lyst, 1 = helt sort)

const tegnVaeggeFoerBio = tegnVaegge;
tegnVaegge = function () {
  tegnVaeggeFoerBio();
  if (!iBiografen()) return;
  const L = LAERRED;
  // guldramme og lærred
  vaegFirkant(L.fra - 0.12, L.til + 0.12, L.bund - 8, L.top + 8, "#d9a441");
  vaegFirkant(L.fra - 0.06, L.til + 0.06, L.bund - 4, L.top + 4, "#5a2a12");
  vaegFirkant(L.fra, L.til, L.bund, L.top, bioFilm.v && !BIO_FRA_FIL ? "#000000" : "#1c1418");
  if (bioFilm.v && BIO_FRA_FIL) {
    // tekst på lærredet, når filmen ikke kan vises
    const m = vaegPunkt((L.fra + L.til) / 2, (L.bund + L.top) / 2);
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.transform(1, 0.5, 0, 1, 0, 0);
    ctx.textAlign = "center";
    ctx.fillStyle = "#e9c46a";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText("🎬 HELLO VERA BIO", 0, -10);
    ctx.fillStyle = "#f3e6cc";
    ctx.font = "13px Verdana, sans-serif";
    ctx.fillText("Filmen kan kun vises, når hotellet er åbnet på nettet", 0, 18);
    ctx.restore();
  } else if (bioFilm.v) {
    // hul i lærredet, så filmen (bag ved spillet) kan ses. Figurer foran tegnes oven på.
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    polygon(ctx, laerredHjoerner(), "#000000");
    ctx.restore();
  }
  // røde fløjlsgardiner: trukket for, når der ingen film er, og de glider til siden, når filmen starter
  const nu = performance.now();
  const dt = Math.min(0.1, (nu - bioGardinTid) / 1000);
  bioGardinTid = nu;
  const maal = bioFilm.v ? 0 : 1;
  if (bioGardin < maal) bioGardin = Math.min(maal, bioGardin + dt / BIO_GARDIN_TID);
  if (bioGardin > maal) bioGardin = Math.max(maal, bioGardin - dt / BIO_GARDIN_TID);
  const g = bioGardin * bioGardin * (3 - 2 * bioGardin);   // blødt i starten og slutningen
  const midt = (L.fra + L.til) / 2;
  [[L.fra - 1.1, L.fra - 0.1 + (midt - L.fra + 0.1) * g], [L.til + 0.1 - (L.til + 0.1 - midt) * g, L.til + 1.1]].forEach(function (side) {
    const folder = 6 + Math.round(g * 10);                    // flere folder, når gardinet er trukket ud
    for (let i = 0; i < folder; i++) {
      const a = side[0] + (side[1] - side[0]) * i / folder, b = side[0] + (side[1] - side[0]) * (i + 1) / folder;
      vaegFirkant(a, b, 0, L.top + 22, i % 2 ? "#8e1622" : "#b0202e");
    }
  });
  if (g > 0.85) {
    // guldskrift på de lukkede gardiner
    const m = vaegPunkt(midt, (L.bund + L.top) / 2);
    ctx.save();
    ctx.globalAlpha = (g - 0.85) / 0.15;
    ctx.translate(m.x, m.y);
    ctx.transform(1, 0.5, 0, 1, 0, 0);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f2c35a";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText("🎬 HELLO VERA BIO", 0, -10);
    ctx.fillStyle = "#fbe7c0";
    ctx.font = "13px Verdana, sans-serif";
    ctx.fillText(maaStyreBio() ? "Klik på lærredet for at sætte en film på" : "Filmen starter, når en ansat sætter den på", 0, 18);
    ctx.restore();
  }
  vaegFirkant(L.fra - 1.2, L.til + 1.2, L.top + 12, L.top + 30, "#9a1a27");   // kappen foroven
  vaegFirkant(L.fra - 1.2, L.til + 1.2, L.top + 10, L.top + 13, "#d9a441");
  // små guldlamper på væggen
  [0.8, L.til + 1.8].forEach(function (x) {
    const p = vaegPunkt(x, 150);
    ctx.fillStyle = "rgba(255, 210, 120, 0.25)";
    ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f2c35a";
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
  });
};

// Når filmen kører, bliver der mørkt i salen (lærredet lyser stadig)
const tegnBoblerFoerBio = tegnBobler;
tegnBobler = function () {
  if (iBiografen() && bioGardin < 1) {
    // lyset går ned, mens gardinerne glider fra (og op igen, når de lukker)
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";    // kun hvor der er tegnet noget, ikke i hullet til filmen
    ctx.fillStyle = "rgba(8, 0, 4, " + (BIO_MOERKE * (1 - bioGardin)) + ")";
    ctx.fillRect(0, 0, BREDDE, HOEJDE);
    ctx.restore();
  }
  tegnBoblerFoerBio();
};


// -------------------------------------------------------------
//  Filmen: YouTube ligger BAG spillet og ses gennem hullet i lærredet
// -------------------------------------------------------------
const bioSkaerm = document.createElement("iframe");
bioSkaerm.id = "bio-skaerm";
bioSkaerm.title = "Biografens lærred";
bioSkaerm.allow = "autoplay; encrypted-media";
bioSkaerm.referrerPolicy = "strict-origin-when-cross-origin";
bioSkaerm.style.cssText = "position: fixed; left: 0; top: 0; width: 750px; height: 375px; border: 0; transform-origin: 0 0; pointer-events: none; background: #000;";
bioSkaerm.hidden = true;
laerred.parentNode.insertBefore(bioSkaerm, laerred);   // før lærredet = bag ved det

// Læg filmen præcis over lærredet på væggen (følger med, når man trækker og zoomer)
function placerBioSkaerm() {
  const vis = iBiografen() && !!bioFilm.v && !BIO_FRA_FIL;
  if (bioSkaerm.hidden === vis) bioSkaerm.hidden = !vis;
  if (vis) {
    const r = laerred.getBoundingClientRect();
    const sx = r.width / BREDDE, sy = r.height / HOEJDE;
    const h = laerredHjoerner();
    const A = { x: r.left + h[0].x * sx, y: r.top + h[0].y * sy };
    const B = { x: r.left + h[1].x * sx, y: r.top + h[1].y * sy };
    const D = { x: r.left + h[3].x * sx, y: r.top + h[3].y * sy };
    bioSkaerm.style.transform = "matrix(" + [(B.x - A.x) / 750, (B.y - A.y) / 750, (D.x - A.x) / 375, (D.y - A.y) / 375, A.x, A.y].join(",") + ")";
  }
  requestAnimationFrame(placerBioSkaerm);
}
requestAnimationFrame(placerBioSkaerm);

// Send en kommando til YouTube-afspilleren (pause, afspil, lyd)
function bioKommando(func) {
  try { bioSkaerm.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: [] }), "*"); } catch (e) {}
}

// Sæt en film på lærredet (v = YouTube-id eller null for at stoppe). t = hvornår den startede.
function saetFilm(v, t, af) {
  const nyFilm = v !== bioFilm.v || t !== bioFilm.t;
  bioFilm = { v: v || null, t: t, af: af || "" };
  if (!nyFilm) return;
  if (bioFilm.v) {
    const start = Math.max(0, Math.floor((Date.now() - t) / 1000));
    // origin: YouTube vil vide, hvilken side der viser filmen (ellers fejl 153)
    if (!BIO_FRA_FIL) bioSkaerm.src = "https://www.youtube-nocookie.com/embed/" + v + "?autoplay=1&controls=0&rel=0&playsinline=1&enablejsapi=1&start=" + start +
      "&origin=" + encodeURIComponent(location.origin);
    document.getElementById("bio-aaben").href = "https://www.youtube.com/watch?v=" + v + (start ? "&t=" + start + "s" : "");
    if (af && af !== FIGUR.navn) besked.textContent = "🎬 " + af + " satte en film på lærredet.";
  } else {
    bioSkaerm.removeAttribute("src");
    if (af && af !== FIGUR.navn) besked.textContent = "🎬 " + af + " stoppede filmen.";
  }
  visBioVindue(false);
}

function visFilm(link) {
  if (!maaStyreBio()) { besked.textContent = "🎬 Kun hotellets ansatte kan sætte film på i biografen."; return; }
  const id = youtubeId(link);
  if (!id) { bioTekst("Det ligner ikke et YouTube-link. Prøv at kopiere linket igen.", true); return; }
  saetFilm(id, Date.now(), FIGUR.navn);
  besked.textContent = "🎬 Filmen kører på lærredet. Find et sæde, og hent popcorn 🍿";
  svaev("🎬");
}
function stopFilm() {
  if (!maaStyreBio()) return;
  saetFilm(null, Date.now(), FIGUR.navn);
  besked.textContent = "⏹ Du stoppede filmen.";
}

// :youtube virker for de ansatte i biografen og viser filmen på lærredet (i stedet for tv-vinduet)
if (typeof maaViseYoutube === "function") {
  const maaViseYoutubeFoerBio = maaViseYoutube;
  maaViseYoutube = function () { return iBiografen() || maaViseYoutubeFoerBio(); };
  const spilYoutubeFoerBio = spilYoutube;
  spilYoutube = function (link) {
    if (!iBiografen()) { spilYoutubeFoerBio(link); return; }
    if (typeof stopYoutube === "function") stopYoutube();
    visFilm(link);
  };
}


// -------------------------------------------------------------
//  Vinduet "🎬 Biografen": sæt en film på, pause, lyd, stop
// -------------------------------------------------------------
const bioStil = document.createElement("style");
bioStil.textContent =
  "#bio-vindue { position: fixed; left: 50%; bottom: 90px; transform: translateX(-50%); z-index: 30; width: 340px; max-width: calc(100vw - 32px);" +
  "  background: #fbf3e4; color: #4a1a22; border: 3px solid #d9a441; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.45); font-size: 13px; }" +
  "#bio-vindue[hidden] { display: none; }" +
  "#bio-vindue .bio-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #7a1b2b; color: #f7dfa0; border-radius: 8px 8px 0 0; cursor: move; }" +
  "#bio-vindue .bio-top button { width: 26px; height: 26px; border: 2px solid #d9a441; border-radius: 7px; background: #fbf3e4; color: #7a1b2b; cursor: pointer; }" +
  "#bio-vindue .bio-krop { padding: 10px 12px 12px; }" +
  "#bio-vindue form { display: flex; gap: 6px; }" +
  "#bio-vindue input { flex: 1; min-width: 0; padding: 7px 8px; border: 2px solid #d9a441; border-radius: 8px; background: #fff; color: #4a1a22; }" +
  "#bio-vindue .bio-knapper { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }" +
  "#bio-vindue button.bio-k { padding: 6px 10px; border: 2px solid #b3202f; border-radius: 8px; background: #7a1b2b; color: #fff6e0; font-weight: bold; cursor: pointer; }" +
  "#bio-vindue .bio-k.lys { background: #fbf3e4; color: #7a1b2b; }" +
  "#bio-vindue a.bio-k { padding: 6px 10px; border: 2px solid #b3202f; border-radius: 8px; font-weight: bold; text-decoration: none; }" +
  "#bio-vindue p { margin: 8px 0 0; line-height: 1.35; }" +
  "#bio-vindue p.fejl { color: #b3202f; font-weight: bold; }";
document.head.appendChild(bioStil);

const bioVindue = document.createElement("div");
bioVindue.id = "bio-vindue";
bioVindue.hidden = true;
bioVindue.innerHTML =
  '<div class="bio-top"><b>🎬 Biografen</b><button type="button" id="bio-luk" title="Luk">✕</button></div>' +
  '<div class="bio-krop">' +
  '  <form id="bio-form"><input id="bio-link" type="text" placeholder="Sæt et YouTube-link ind …"><button class="bio-k" type="submit">▶ Vis film</button></form>' +
  '  <div class="bio-knapper" id="bio-knapper">' +
  '    <button class="bio-k lys" type="button" id="bio-pause">⏸ Pause</button>' +
  '    <button class="bio-k lys" type="button" id="bio-spil">▶ Fortsæt</button>' +
  '    <button class="bio-k lys" type="button" id="bio-lyd">🔊 Lyd på</button>' +
  '    <button class="bio-k" type="button" id="bio-stop">⏹ Stop filmen</button>' +
  '    <a class="bio-k lys" id="bio-aaben" target="_blank" rel="noopener">↗ Åbn på YouTube</a>' +
  '  </div>' +
  '  <p id="bio-tekst"></p>' +
  '</div>';
document.body.appendChild(bioVindue);
if (typeof goerFlytbar === "function") goerFlytbar(bioVindue, bioVindue.querySelector(".bio-top"), "mit-hotel-flyt-biograf");

function bioTekst(tekst, fejl) {
  const p = document.getElementById("bio-tekst");
  p.textContent = tekst;
  p.classList.toggle("fejl", !!fejl);
}
function visBioVindue(aaben) {
  if (aaben) bioVindue.hidden = false;
  const styrer = maaStyreBio();
  document.getElementById("bio-knapper").hidden = !bioFilm.v;
  document.getElementById("bio-form").hidden = !styrer;            // andre kan kun se med (og selv sætte på pause / skrue op)
  document.getElementById("bio-stop").hidden = !styrer;
  if (bioFilm.v && BIO_FRA_FIL) bioTekst("Du har åbnet hotellet direkte fra computeren, og så vil YouTube ikke vise filmen (fejl 153). " +
    "Åbn hotellet på nettet (pavlakvist.github.io/Hotel), eller tryk ↗ Åbn på YouTube.", true);
  else if (bioFilm.v) bioTekst("🎞 Filmen kører" + (bioFilm.af ? " (sat på af " + bioFilm.af + ")" : "") + ". Alle i biografen ser den samme film.");
  else if (styrer) bioTekst("Sæt et link ind fra YouTube, og tryk ▶ Vis film. Alle i biografen ser filmen på lærredet.");
  else bioTekst("Der kører ingen film lige nu. Kun hotellets ansatte kan sætte film på. Find et sæde, og hent popcorn 🍿");
}

document.getElementById("bio-luk").addEventListener("click", function () { bioVindue.hidden = true; });
document.getElementById("bio-form").addEventListener("submit", function (e) {
  e.preventDefault();
  visFilm(document.getElementById("bio-link").value);
  document.getElementById("bio-link").value = "";
});
document.getElementById("bio-pause").addEventListener("click", function () { bioKommando("pauseVideo"); });
document.getElementById("bio-spil").addEventListener("click", function () { bioKommando("playVideo"); });
document.getElementById("bio-lyd").addEventListener("click", function () { bioKommando("unMute"); bioKommando("setVolume"); bioKommando("playVideo"); });
document.getElementById("bio-stop").addEventListener("click", stopFilm);

// Klik på lærredet åbner vinduet
function overLaerredet(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
  const h = laerredHjoerner();
  // lærredet er et skævt parallelogram: tjek højden ud fra, hvor langt henne ad væggen man er
  const t = (sx - h[0].x) / (h[1].x - h[0].x);
  if (t < 0 || t > 1) return false;
  const top = h[0].y + (h[1].y - h[0].y) * t, bund = h[3].y + (h[2].y - h[3].y) * t;
  return sy >= top && sy <= bund;
}
laerred.addEventListener("click", function (e) {
  if (!iBiografen() || valgtType || !overLaerredet(e)) return;
  e.stopImmediatePropagation();
  visBioVindue(true);
}, true);
laerred.addEventListener("mousemove", function (e) {
  if (iBiografen() && overLaerredet(e)) laerred.style.cursor = "pointer";
});

// Ind i biografen: vinduet vises; ud af biografen: filmen stopper for dig
const skiftRumFoerBio = skiftRum;
skiftRum = function (navn) {
  const varHer = iBiografen();
  skiftRumFoerBio(navn);
  if (iBiografen() && !varHer) {
    besked.textContent = maaStyreBio() ? "Velkommen i Biografen 🎬 Klik på lærredet for at vælge en film, og hent popcorn 🍿"
      : "Velkommen i Biografen 🎬 Find et sæde, og hent popcorn 🍿";
    visBioVindue(maaStyreBio());
  }
  if (!iBiografen() && varHer) {
    bioFilm = { v: null, t: 0, af: "" };
    bioSkaerm.removeAttribute("src");
    bioVindue.hidden = true;
  }
};


// -------------------------------------------------------------
//  Sæder med ryggen til: man sidder og kigger på lærredet
// -------------------------------------------------------------
// Sædet vender ryggen til (retning 2 og 3), og man må sidde i det bagfra ("bagfra" i kataloget)
function erBagfraSaede(m) {
  const t = m && MOEBEL_TYPER[m.type];
  return !!(t && t.bagfra && (m.retning || 0) >= 2);
}
// Hvilken vej figuren kigger: retning 2 = op mod højre, 3 = op mod venstre
function bagfraRetning(m) { return m.retning === 2 ? "op-hoejre" : "op-venstre"; }

// Toppen af ryglænet (to punkter på skærmen): alt under den linje er skjult bag ryglænet
const BIO_RYG = { fra: 0.18, til: 0.82, dybde: 0.69, hoejde: 58 };
function rygLinje(m) {
  const r = BIO_RYG;
  const a = m.retning === 2 ? punkt(m.x + r.fra, m.y + r.dybde) : punkt(m.x + r.dybde, m.y + r.fra);
  const b = m.retning === 2 ? punkt(m.x + r.til, m.y + r.dybde) : punkt(m.x + r.dybde, m.y + r.til);
  return [{ x: a.x, y: a.y - r.hoejde }, { x: b.x, y: b.y - r.hoejde }];
}

const saetDigFoerBio = saetDig;
saetDig = function (m) {
  if (!erBagfraSaede(m)) { saetDigFoerBio(m); return; }
  const plads = ledigPlads(m, figur);
  if (plads < 0) { besked.textContent = "Der sidder allerede nogen her. Prøv et andet sæde."; return; }
  figur.sidde = { moebel: m, grad: 0, plads: plads };
  vendFraRyglaenet(m);
};

const vendFraRyglaenetFoerBio = vendFraRyglaenet;
vendFraRyglaenet = function (m) {
  if (!erBagfraSaede(m)) { vendFraRyglaenetFoerBio(m); return; }
  figur.retning = bagfraRetning(m);
  figur.vendt = m.retning === 2 ? 1 : -1;
  figur.forfra = false;
};

// (spil.js rejser figuren op fra møbler, der vender ryggen til; det skal den ikke her)
const tjekSaedeFoerBio = tjekSaede;
tjekSaede = function () {
  const m = figur.sidde && figur.sidde.moebel;
  if (!erBagfraSaede(m) || moeblerIRummet.indexOf(m) < 0) { tjekSaedeFoerBio(); return; }
  figur.x = m.x;
  figur.y = m.y;
  figur.retning = bagfraRetning(m);
};

const fodJusteringFoerBio = fodJustering;
fodJustering = function (m, valg, retning) {
  if (erBagfraSaede(m)) return { x: 0, y: 0 };
  return fodJusteringFoerBio(m, valg, retning);
};

// Hvem tegnes lige nu? (sat af tegnFigur og tegnHalGaest herunder)
let bioTegnerSaede = null;     // sædet, hvis den der tegnes, sidder med ryggen til
let bioSidstBagfra = false;    // sad den sidste, der blev tegnet, med ryggen til? (så skjules maden)

const tegnFigurFoerBio = tegnFigur;
tegnFigur = function (c) {
  const m = figur.sidde && figur.sidde.grad > 0.4 ? figur.sidde.moebel : null;
  bioTegnerSaede = erBagfraSaede(m) ? m : null;
  bioSidstBagfra = !!bioTegnerSaede;
  try { tegnFigurFoerBio(c); } finally { bioTegnerSaede = null; }
};
const tegnHalGaestFoerBio = tegnHalGaest;
tegnHalGaest = function (g) {
  bioTegnerSaede = g.sidder && erBagfraSaede(g.saede) && /^op/.test(g.retning) ? g.saede : null;
  bioSidstBagfra = !!bioTegnerSaede;
  try { tegnHalGaestFoerBio(g); } finally { bioTegnerSaede = null; }
};

// Navneskiltet skal sidde lige over hovedet, som stikker op over ryglænet
const figurHoejdeFoerBio = figurHoejde;
figurHoejde = function (valg) {
  const h = figurHoejdeFoerBio(valg);
  if (!bioTegnerSaede) return h;
  return h * 0.5 + MOEBEL_TYPER[bioTegnerSaede.type].saede;
};

// Figuren bagfra (stå-billedet, der kigger op mod lærredet), sænket ned i sædet
// og skåret af ved toppen af ryglænet, så kun hoved og skuldre kan ses
const tegnMenneskeFoerBio = tegnMenneske;
tegnMenneske = function (c, x, y, valg, retning, gaarTrin, sidde) {
  const m = bioTegnerSaede;
  if (!m || !sidde) { tegnMenneskeFoerBio(c, x, y, valg, retning, gaarTrin, sidde); return; }
  const ned = figurHoejdeFoerBio(valg) * 0.5 - sidde.hoejde;   // så numsen er nede på sædet
  const l = rygLinje(m);
  const dx = l[1].x - l[0].x, dy = l[1].y - l[0].y, n = Math.hypot(dx, dy) || 1;
  const a = { x: l[0].x - dx / n * 400, y: l[0].y - dy / n * 400 };
  const b = { x: l[1].x + dx / n * 400, y: l[1].y + dy / n * 400 };
  c.save();
  c.beginPath();
  c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(b.x, b.y - 2000); c.lineTo(a.x, a.y - 2000);
  c.closePath();
  c.clip();
  tegnMenneskeFoerBio(c, x, y + ned, valg, retning, null, null);
  c.restore();
};


// -------------------------------------------------------------
//  Popcorn 🍿 (bruger hånden fra køleskabet, js/koeleskab.js)
// -------------------------------------------------------------
const POPCORN_BILLEDE = "billeder/mad/popcorn.png";   // 4 billeder à 48x64: fuldt bæger, 1, 2 og 3 bid
let gaarTilPopcorn = null;    // { m, x, y }

function erPopcornMaskine(m) { return !!m && m.type === "popcorn-maskine"; }

// Er musen over et billede af en popcornmaskine? (hele billedet tæller, ikke kun feltet)
function popcornUnderMus(e) {
  const r = laerred.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
  let fundet = null;
  moeblerIRummet.forEach(function (m) {
    if (!erPopcornMaskine(m)) return;
    const t = MOEBEL_TYPER[m.type];
    const b = hentBillede(t.retninger[m.retning || 0]);
    if (!billedeKlar(b)) return;
    const sted = moebelSted(t, m.x, m.y, drejetTvaers(m));
    const venstre = sted.x - b.naturalWidth / 2, top = sted.y + FLISE_H / 2 - b.naturalHeight;
    const inde = sx >= venstre + 8 && sx <= venstre + b.naturalWidth - 8 && sy >= top && sy <= top + b.naturalHeight;
    if (inde && (!fundet || moebelDybde(m) > moebelDybde(fundet))) fundet = m;
  });
  if (!fundet) {
    const f = musTilFelt(e);
    const m = moebelPaa(f.x, f.y);
    if (erPopcornMaskine(m)) fundet = m;
  }
  return fundet;
}

function bioPopcornKlar() { return typeof MAD !== "undefined" && typeof giHaand === "function"; }

laerred.addEventListener("click", function (e) {
  if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey) return;
  const m = popcornUnderMus(e);
  if (!m || !bioPopcornKlar()) return;
  e.stopImmediatePropagation();
  valgtMoebel = m;
  opdaterPanel();
  if (figur.sidde) { figur.sidde = null; figur.skalSidde = null; }
  const fig = figurFelt();
  // feltet foran maskinen først, ellers ved siden af
  const r = m.retning || 0;
  const sider = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const pladser = [sider[r]].concat(sider.filter(function (d, i) { return i !== r; })).map(function (d) { return { x: m.x + d[0], y: m.y + d[1] }; });
  if (pladser.some(function (p) { return p.x === fig.x && p.y === fig.y; })) { faaPopcorn(m); return; }
  for (const p of pladser) {
    if (!kanGaa(p.x, p.y)) continue;
    gaaTil(p.x, p.y);
    if (figur.rute.length > 0) { gaarTilPopcorn = { m: m, x: p.x, y: p.y }; return; }
  }
  besked.textContent = "Du kan ikke komme hen til popcornmaskinen. Der står noget i vejen.";
}, true);

// fremme ved maskinen?
setInterval(function () {
  const g = gaarTilPopcorn;
  if (!g || figur.rute.length > 0) return;
  gaarTilPopcorn = null;
  const fig = figurFelt();
  if (fig.x === g.x && fig.y === g.y && moeblerIRummet.indexOf(g.m) >= 0) faaPopcorn(g.m);
}, 100);

function faaPopcorn(m) {
  // kig på maskinen
  const dx = m.x - figur.x, dy = m.y - figur.y;
  figur.vendt = dx - dy >= 0 ? 1 : -1;
  figur.retning = dx + dy >= 0 ? (figur.vendt > 0 ? "ned-hoejre" : "ned-venstre") : (figur.vendt > 0 ? "op-hoejre" : "op-venstre");
  figur.forfra = dx + dy >= 0;
  svaev("🍿");
  setTimeout(function () {
    minHaand = giHaand("popcorn");
    gemHaand();
    besked.textContent = "Du fik et bæger popcorn 🍿 Find et sæde, og nyd filmen! Klik på en anden for at give det videre.";
  }, 600);
}

// Popcorn kommer ind i køleskabets mad, når js/koeleskab.js er hentet.
// Det er "usynligt" i listen, så køleskabet ikke giver popcorn.
(function vent() {
  if (!bioPopcornKlar()) { setTimeout(vent, 300); return; }
  Object.defineProperty(MAD, "popcorn", { enumerable: false,
    value: { navn: "popcorn", hvad: "et bæger popcorn", tegn: "🍿", raekke: 0, lyd: "Knas!", goer: "spiser", greb: 0.72 } });
  // var maden gemt i hånden, før popcorn fandtes? (koeleskab.js kendte det ikke, da den hentede hånden)
  try {
    const h = JSON.parse(localStorage.getItem(MAD_NOEGLE) || "null");
    if (!minHaand && h && h.ting === "popcorn") minHaand = giHaand("popcorn", h.bid);
  } catch (e) {}
  // popcorn tegnes fra sit eget billede; maden skjules, når man sidder med ryggen til
  const tegnMadFoerBio = tegnMad;
  tegnMad = function (h, p, hoejde, side, sidder, valg) {
    if (sidder && bioSidstBagfra) return;
    if (h.ting !== "popcorn") { tegnMadFoerBio(h, p, hoejde, side, sidder, valg); return; }
    // (tegnMad henter altid mad.png, så popcorn-billedet lånes ind på dens plads, mens den tegner)
    const madBillede = billeder[MAD_BILLEDE];
    billeder[MAD_BILLEDE] = hentBillede(POPCORN_BILLEDE);
    try { tegnMadFoerBio(h, p, hoejde, side, sidder, valg); } finally { if (madBillede) billeder[MAD_BILLEDE] = madBillede; else delete billeder[MAD_BILLEDE]; }
  };
})();
