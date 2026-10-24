// =============================================================
//  Kamera 📷  (knappen i chatbaren)
//  Kig gennem søgeren og tag et billede af rummet. Billedet
//  kommer i Mine ting under "Billeder", og derfra kan du hænge
//  det op på væggen i dine egne rum.
//
//  Når hotellet åbnes som fil (file://), må browseren ikke gemme
//  pixels fra rummet. Så husker kameraet i stedet, hvordan rummet
//  så ud (møbler, figur, farver), og "fremkalder" billedet igen.
// =============================================================
const FOTO_NOEGLE = "mit-hotel-fotos";
const FOTO_B = 320, FOTO_H = 240;          // billedets størrelse i spil-punkter
const FOTO_BAGGRUND = "#1b2536";

// Hvert billede: { id, tid, rumNavn, data?: "data:image/jpeg…", scene?: {…}, vaeg?: { rum, side: "v"|"b", n } }
let fotos = [];
try { fotos = JSON.parse(localStorage.getItem(FOTO_NOEGLE) || "[]"); } catch (e) {}
function gemFotos() {
  try { localStorage.setItem(FOTO_NOEGLE, JSON.stringify(fotos)); return true; }
  catch (e) { return false; }
}
function fotoMedId(id) {
  return fotos.find(function (f) { return f.id === id; });
}
function fotoDato(f) {
  const d = new Date(f.tid);
  return d.getDate() + "/" + (d.getMonth() + 1) + " kl. " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
}


// -------------------------------------------------------------
//  Knappen og kamera-vinduet
// -------------------------------------------------------------
const kameraKnap = document.createElement("button");
kameraKnap.type = "button";
kameraKnap.id = "chat-kamera-knap";
kameraKnap.className = "chat-lille";
kameraKnap.title = "Kamera";
kameraKnap.innerHTML = '<img class="knap-ikon" src="billeder/ikon-kamera.png" alt="Kamera">';
document.getElementById("chat-lager-knap").after(kameraKnap);

const kameraVindue = document.createElement("div");
kameraVindue.id = "kamera";
kameraVindue.hidden = true;
kameraVindue.innerHTML =
  '<div class="kam-top"><b>📷 Kamera</b><button type="button" id="kam-luk" title="Luk">✕</button></div>' +
  '<div class="kam-krop">' +
  '  <div class="kam-soeger"><canvas id="kam-billede" width="' + FOTO_B + '" height="' + FOTO_H + '"></canvas><i class="kam-hj h1"></i><i class="kam-hj h2"></i><i class="kam-hj h3"></i><i class="kam-hj h4"></i><div id="kam-blitz"></div></div>' +
  '  <p id="kam-tekst" class="kam-tekst">Træk i billedet for at flytte kameraet.</p>' +
  '  <div class="kam-knapper"><button type="button" id="kam-midt">🎯 Find mig</button><button type="button" id="kam-tag" class="kam-tag">📸 Tag billede</button></div>' +
  '</div>';
document.body.appendChild(kameraVindue);
goerFlytbar(kameraVindue, kameraVindue.querySelector(".kam-top"), "mit-hotel-flyt-kamera");

const kamBillede = document.getElementById("kam-billede");
const kamCtx = kamBillede.getContext("2d");
const kamTekst = document.getElementById("kam-tekst");
const kamFlyt = { x: 0, y: 0 };      // hvor meget man har trukket kameraet væk fra figuren

// Midten af billedet, i spil-punkter
function kameraMidte() {
  const p = feltMidte(figur.x, figur.y);
  return { x: p.x + kamFlyt.x, y: p.y - 55 + kamFlyt.y };
}

// Kopiér et udsnit af rummet over i et lille lærred
function kopierUdsnit(til, midte) {
  const c = til.getContext("2d");
  const s = laerred.width / BREDDE;
  c.fillStyle = FOTO_BAGGRUND;
  c.fillRect(0, 0, til.width, til.height);
  c.drawImage(laerred, (midte.x - FOTO_B / 2) * s, (midte.y - FOTO_H / 2) * s, FOTO_B * s, FOTO_H * s, 0, 0, til.width, til.height);
}

function soegerLoop() {
  if (kameraVindue.hidden) return;
  kopierUdsnit(kamBillede, kameraMidte());
  requestAnimationFrame(soegerLoop);
}

kameraKnap.addEventListener("click", function () {
  kameraVindue.hidden = !kameraVindue.hidden;
  if (!kameraVindue.hidden) {
    kamTekst.textContent = "Træk i billedet for at flytte kameraet.";
    requestAnimationFrame(soegerLoop);
  }
});
document.getElementById("kam-luk").addEventListener("click", function () { kameraVindue.hidden = true; });
document.getElementById("kam-midt").addEventListener("click", function () { kamFlyt.x = 0; kamFlyt.y = 0; });

// træk i søgeren for at flytte kameraet
let kamTraek = null;
kamBillede.addEventListener("mousedown", function (e) {
  e.preventDefault();
  kamTraek = { x: e.clientX, y: e.clientY };
});
window.addEventListener("mousemove", function (e) {
  if (!kamTraek) return;
  const f = FOTO_B / kamBillede.getBoundingClientRect().width;
  kamFlyt.x -= (e.clientX - kamTraek.x) * f;
  kamFlyt.y -= (e.clientY - kamTraek.y) * f;
  kamFlyt.x = Math.max(-600, Math.min(600, kamFlyt.x));
  kamFlyt.y = Math.max(-400, Math.min(400, kamFlyt.y));
  kamTraek = { x: e.clientX, y: e.clientY };
});
window.addEventListener("mouseup", function () { kamTraek = null; });


// -------------------------------------------------------------
//  Tag billedet
// -------------------------------------------------------------
function rumNavnNu() {
  return rumValg === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse);
}

// Husk hvordan rummet ser ud lige nu (bruges når pixels ikke må gemmes)
function huskScene(midte) {
  const felter = [];
  for (let y = 0; y < RUM.dybde; y++) {
    let r = "";
    for (let x = 0; x < RUM.bredde; x++) r += erIRummet(x, y) ? "x" : ".";
    felter.push(r);
  }
  const hal = rumValg === "hal";
  return {
    rumValg: rumValg,
    rum: {
      bredde: RUM.bredde, dybde: RUM.dybde, felter: felter,
      vaegFarve: RUM.vaegFarve, gulvFarve1: RUM.gulvFarve1, gulvFarve2: RUM.gulvFarve2,
      vaegHoejde: RUM.vaegHoejde, doer: RUM.doer,
    },
    vaerelse: hal ? null : aktivtVaerelse,
    moebler: hal ? null : JSON.parse(JSON.stringify(moeblerIRummet)),
    figur: {
      x: figur.x, y: figur.y, vendt: figur.vendt, forfra: figur.forfra, retning: figur.retning, trin: figur.trin,
      sidde: figur.sidde ? { m: moeblerIRummet.indexOf(figur.sidde.moebel), grad: figur.sidde.grad, plads: figur.sidde.plads } : null,
    },
    gaester: hal ? HAL_GAESTER.map(function (g) {
      return { x: g.x, y: g.y, retning: g.retning, trin: g.trin, sidder: g.sidder, saede: HAL_MOEBLER.indexOf(g.saede) };
    }) : null,
    d: { x: midte.x - START.x, y: midte.y - START.y },
  };
}

document.getElementById("kam-tag").addEventListener("click", function () {
  const midte = kameraMidte();
  const foto = { id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tid: Date.now(), rumNavn: rumNavnNu() };
  const c = document.createElement("canvas");
  c.width = FOTO_B * 2; c.height = FOTO_H * 2;
  kopierUdsnit(c, midte);
  try {
    foto.data = c.toDataURL("image/jpeg", 0.85);
    fotoCache[foto.id] = c;
  } catch (e) {
    // file:// – browseren må ikke gemme pixels, så husk scenen i stedet
    foto.scene = huskScene(midte);
    fotoCache[foto.id] = c;      // indtil siden genindlæses, har vi billedet her
    fotoCacheTid[foto.id] = performance.now() + 99999;
  }
  fotos.push(foto);
  if (!gemFotos()) {
    fotos.pop();
    kamTekst.textContent = "Der er ikke plads til flere billeder. Slet nogle i Mine ting 📦.";
    return;
  }
  const blitz = document.getElementById("kam-blitz");
  blitz.classList.remove("blink");
  void blitz.offsetWidth;
  blitz.classList.add("blink");
  kamTekst.textContent = "📸 Klik! Billedet ligger nu i Mine ting under 📷 Billeder.";
  visLager();
});


// -------------------------------------------------------------
//  Fremkald et billede (lav det om til noget, der kan tegnes)
// -------------------------------------------------------------
const fotoCache = {};        // id → lærred eller billede
const fotoCacheTid = {};     // hvornår det blev lavet (billeder hentes måske stadig)
const fotoVenter = {};

function fotoBillede(foto) {
  const c = fotoCache[foto.id];
  if (c && (foto.data || fotoCacheTid[foto.id] > 4000)) return c;
  if (foto.data) {
    const b = new Image();
    b.src = foto.data;
    fotoCache[foto.id] = b;
    return b;
  }
  // scenen fremkaldes lige efter denne tegning er færdig
  if (!fotoVenter[foto.id]) {
    fotoVenter[foto.id] = true;
    setTimeout(function () {
      fotoVenter[foto.id] = false;
      fremkald(foto);
      visLagerFotos();
    }, performance.now() < 4000 ? 4000 - performance.now() : 0);
  }
  return c || null;
}

let fremkalder = false;
function fremkald(foto) {
  const s = foto.scene;
  if (!s || fremkalder) return;
  fremkalder = true;
  // gem hvordan alt er nu
  const gemt = {
    rumValg: rumValg, moebler: moeblerIRummet, figur: Object.assign({}, figur),
    rum: { bredde: RUM.bredde, dybde: RUM.dybde, form: RUM.form, vaegFarve: RUM.vaegFarve, gulvFarve1: RUM.gulvFarve1, gulvFarve2: RUM.gulvFarve2, vaegHoejde: RUM.vaegHoejde, doer: RUM.doer },
    gaester: HAL_GAESTER.map(function (g) { return Object.assign({}, g); }),
    kamera: { x: KAMERA.x, y: KAMERA.y },
    valgtType: valgtType, valgtMoebel: valgtMoebel, musFelt: musFelt, bobler: tegnBobler,
    vaerelse: aktivtVaerelse,
  };
  const c = document.createElement("canvas");
  c.width = FOTO_B * 2; c.height = FOTO_H * 2;
  try {
    rumValg = s.rumValg;
    Object.assign(RUM, s.rum);
    RUM.form = feltForm(s.rum.felter);
    if (s.vaerelse) aktivtVaerelse = s.vaerelse;
    moeblerIRummet = s.rumValg === "hal" ? HAL_MOEBLER : s.moebler;
    Object.assign(figur, s.figur);
    figur.sidde = s.figur.sidde && moeblerIRummet[s.figur.sidde.m]
      ? { moebel: moeblerIRummet[s.figur.sidde.m], grad: s.figur.sidde.grad, plads: s.figur.sidde.plads } : null;
    if (s.gaester) s.gaester.forEach(function (sg, i) {
      const g = HAL_GAESTER[i];
      if (!g) return;
      Object.assign(g, { x: sg.x, y: sg.y, retning: sg.retning, trin: sg.trin, sidder: sg.sidder && sg.saede >= 0, saede: HAL_MOEBLER[sg.saede] || null });
    });
    KAMERA.x = 0; KAMERA.y = 0;
    valgtType = null; valgtMoebel = null; musFelt = null; tegnBobler = null;
    tegnAlt();
    kopierUdsnit(c, { x: START.x + s.d.x, y: START.y + s.d.y });
  } catch (e) {
    console.warn("Kunne ikke fremkalde billedet", e);
  }
  // sæt alt tilbage
  rumValg = gemt.rumValg;
  moeblerIRummet = gemt.moebler;
  Object.assign(figur, gemt.figur);
  Object.assign(RUM, gemt.rum);
  gemt.gaester.forEach(function (g, i) { Object.assign(HAL_GAESTER[i], g); });
  KAMERA.x = gemt.kamera.x; KAMERA.y = gemt.kamera.y;
  valgtType = gemt.valgtType; valgtMoebel = gemt.valgtMoebel; musFelt = gemt.musFelt; tegnBobler = gemt.bobler;
  aktivtVaerelse = gemt.vaerelse;
  tegnAlt();
  fotoCache[foto.id] = c;
  fotoCacheTid[foto.id] = performance.now();
  fremkalder = false;
}


// -------------------------------------------------------------
//  Billeder i Mine ting 📦
// -------------------------------------------------------------
LAGER_KAT.splice(2, 0, { id: "fotos", navn: "Billeder", ikon: "📷" });
let fotoValgt = null;
let fotoSletSikker = false;

function rumFindes(id) {
  return id === "mit" || mineRum.some(function (r) { return r.id === id; });
}
// billeder der ikke hænger på en væg
function fotosILager() {
  return fotos.filter(function (f) { return !f.vaeg || !rumFindes(f.vaeg.rum); });
}

const lagerAntalFoer = lagerAntal;
lagerAntal = function (kat) {
  if (kat === "fotos") return fotosILager().length;
  return lagerAntalFoer(kat) + (kat === "alle" ? fotosILager().length : 0);
};

// knapperne til et valgt billede
const lagerValgtBoks = document.getElementById("lager-valgt");
const haengKnap = document.createElement("button");
haengKnap.id = "lager-haeng";
haengKnap.textContent = "🖼 Hæng på væggen";
const fotoSletKnap = document.createElement("button");
fotoSletKnap.id = "lager-foto-slet";
fotoSletKnap.textContent = "🗑";
fotoSletKnap.title = "Slet billedet";
lagerValgtBoks.appendChild(haengKnap);
lagerValgtBoks.appendChild(fotoSletKnap);

function tegnFotoI(canvas, foto) {
  const c = canvas.getContext("2d");
  c.fillStyle = "#fff";
  c.fillRect(0, 0, canvas.width, canvas.height);
  const b = fotoBillede(foto);
  const k = 3;
  if (b) {
    try { c.drawImage(b, k, k, canvas.width - 2 * k, canvas.height - 2 * k); } catch (e) {}
  } else {
    c.fillStyle = "#d6e8c8";
    c.fillRect(k, k, canvas.width - 2 * k, canvas.height - 2 * k);
  }
}

const visLagerFoer = visLager;
visLager = function () {
  visLagerFoer();
  visLagerFotos();
};

function visLagerFotos() {
  if (lagerVindue.hidden) return;
  const gitter = document.getElementById("lager-gitter");
  const saet = document.getElementById("lager-saet");
  if (lagerKat !== "alle" && lagerKat !== "fotos") { fotoValgt = null; haengKnap.hidden = fotoSletKnap.hidden = true; saet.hidden = false; return; }
  const soeg = lagerSoeg.value.trim().toLowerCase();
  let liste = fotosILager().filter(function (f) { return !soeg || "billede foto".indexOf(soeg) >= 0 || f.rumNavn.toLowerCase().indexOf(soeg) >= 0; });
  liste.sort(function (a, b) { return lagerSorter.value === "aeldste" ? a.tid - b.tid : b.tid - a.tid; });
  if (lagerKat === "fotos") {
    gitter.innerHTML = liste.length ? "" : "<p class='butik-tom'>Du har ingen billeder endnu.<br><small>Tag et med kameraet 📷 i chatbaren.</small></p>";
  } else if (liste.length) {
    gitter.querySelectorAll(".butik-tom").forEach(function (p) { p.remove(); });
  }
  liste.forEach(function (f) {
    const knap = document.createElement("button");
    knap.className = "butik-ting foto-ting" + (fotoValgt === f.id ? " aktiv" : "");
    knap.title = "Billede fra " + f.rumNavn;
    const c = document.createElement("canvas");
    c.width = 72; c.height = 56;
    tegnFotoI(c, f);
    knap.appendChild(c);
    knap.addEventListener("click", function () { fotoValgt = f.id; lagerValgt = null; fotoSletSikker = false; visLager(); });
    gitter.appendChild(knap);
  });

  const valgt = fotoValgt && fotoMedId(fotoValgt);
  if (!valgt || liste.indexOf(valgt) < 0) {
    fotoValgt = null;
    haengKnap.hidden = fotoSletKnap.hidden = true;
    saet.hidden = false;
    return;
  }
  lagerValgtBoks.hidden = false;
  saet.hidden = true;
  haengKnap.hidden = fotoSletKnap.hidden = false;
  fotoSletKnap.textContent = fotoSletSikker ? "Er du sikker? Tryk igen" : "🗑";
  fotoSletKnap.classList.toggle("sikker", fotoSletSikker);
  const cv = document.getElementById("lager-valgt-billede");
  tegnFotoI(cv, valgt);
  document.getElementById("lager-valgt-navn").textContent = "📷 Billede fra " + valgt.rumNavn;
  document.getElementById("lager-valgt-antal").textContent = "Taget " + fotoDato(valgt);
}

// klikker man på et møbel i Mine ting, er billedet ikke længere valgt
document.getElementById("lager-gitter").addEventListener("click", function (e) {
  const t = e.target.closest(".butik-ting");
  if (t && !t.classList.contains("foto-ting")) fotoValgt = null;
}, true);

fotoSletKnap.addEventListener("click", function () {
  if (!fotoSletSikker) { fotoSletSikker = true; visLager(); return; }
  fotos = fotos.filter(function (f) { return f.id !== fotoValgt; });
  gemFotos();
  fotoValgt = null;
  fotoSletSikker = false;
  visLager();
});


// -------------------------------------------------------------
//  Hæng billeder på væggen
// -------------------------------------------------------------
let haengFoto = null;        // id på billedet man er ved at hænge op
let vaegMus = null;          // hvor musen er, i spil-punkter

haengKnap.addEventListener("click", function () {
  if (!fotoValgt) return;
  if (!maaRetteRum()) {
    besked.textContent = "Gå ind i et af dine egne rum for at hænge billedet op.";
    return;
  }
  haengFoto = fotoValgt;
  lagerVindue.hidden = true;
  besked.textContent = "🖼 Klik på en væg for at hænge billedet op (Esc fortryder).";
});
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && haengFoto) { haengFoto = null; besked.textContent = "Billedet ligger stadig i Mine ting."; }
});

// Alle de stykker væg, et billede kan hænge på i rummet
function vaegStykker() {
  const vh = RUM.vaegHoejde || VAEG_HOEJDE;
  const liste = [];
  for (let y = 0; y < RUM.dybde; y++) {
    for (let x = 0; x < RUM.bredde; x++) {
      if (erIRummet(x, y)) { liste.push({ side: "v", n: y, a: punkt(x, y + 1), b: punkt(x, y), vh: vh }); break; }
    }
  }
  for (let x = 0; x < RUM.bredde; x++) {
    for (let y = 0; y < RUM.dybde; y++) {
      if (erIRummet(x, y)) { liste.push({ side: "b", n: x, a: punkt(x, y), b: punkt(x + 1, y), vh: vh }); break; }
    }
  }
  return liste;
}

// Hvor på væggen billedet sidder: 4 hjørner (venstre-nede, højre-nede, højre-oppe, venstre-oppe)
function billedPlads(st) {
  const ux = st.b.x - st.a.x, uy = st.b.y - st.a.y;
  const laengde = Math.hypot(ux, uy);
  const h = laengde * 0.72;
  const bund = Math.min(st.vh * 0.32, st.vh - h - 6);
  const t0 = 0.1, t1 = 0.9;
  const p = function (t, op) { return { x: st.a.x + ux * t, y: st.a.y + uy * t - bund - op }; };
  return { hj: [p(t0, 0), p(t1, 0), p(t1, h), p(t0, h)], ux: ux * (t1 - t0), uy: uy * (t1 - t0), h: h };
}

function tegnVaegFoto(foto, st, gennemsigtig) {
  const pl = billedPlads(st);
  ctx.save();
  if (gennemsigtig) ctx.globalAlpha = 0.6;
  polygon(ctx, pl.hj, "#fdfaf2");
  ctx.strokeStyle = "rgba(60,40,20,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  pl.hj.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
  ctx.closePath();
  ctx.stroke();
  const b = fotoBillede(foto);
  if (b) {
    const o = pl.hj[3];     // venstre-oppe
    const k = 0.08;
    ctx.transform(pl.ux, pl.uy, 0, pl.h, o.x, o.y);
    try { ctx.drawImage(b, k, k * 1.2, 1 - 2 * k, 1 - 2.4 * k); } catch (e) {}
  }
  ctx.restore();
}

function iFirkant(p, hj) {
  let inde = false;
  for (let i = 0, j = hj.length - 1; i < hj.length; j = i++) {
    if ((hj[i].y > p.y) !== (hj[j].y > p.y) && p.x < (hj[j].x - hj[i].x) * (p.y - hj[i].y) / (hj[j].y - hj[i].y) + hj[i].x) inde = !inde;
  }
  return inde;
}
function vaegUnderMus(p) {
  return vaegStykker().find(function (st) {
    return iFirkant(p, [st.a, st.b, { x: st.b.x, y: st.b.y - st.vh }, { x: st.a.x, y: st.a.y - st.vh }]);
  });
}
function fotoUnderMus(p) {
  const her = fotosHer();
  for (let i = her.length - 1; i >= 0; i--) {
    if (iFirkant(p, billedPlads(her[i].st).hj)) return her[i].foto;
  }
  return null;
}

// billederne der hænger i det rum, man står i
function fotosHer() {
  if (rumValg !== "vaerelse") return [];
  const stykker = vaegStykker();
  const her = [];
  fotos.forEach(function (f) {
    if (!f.vaeg || f.vaeg.rum !== aktivtVaerelse) return;
    const st = stykker.find(function (s) { return s.side === f.vaeg.side && s.n === f.vaeg.n; });
    if (st) her.push({ foto: f, st: st });
  });
  return her;
}

const tegnVaeggeFoerFoto = tegnVaegge;
tegnVaegge = function () {
  tegnVaeggeFoerFoto();
  if (rumValg !== "vaerelse") return;
  fotosHer().forEach(function (h) { tegnVaegFoto(h.foto, h.st, false); });
  if (haengFoto && vaegMus && !fremkalder) {
    const st = vaegUnderMus(vaegMus);
    const foto = fotoMedId(haengFoto);
    if (st && foto) tegnVaegFoto(foto, st, true);
  }
};

function musISpil(e) {
  const r = laerred.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
}
laerred.addEventListener("mousemove", function (e) { vaegMus = musISpil(e); });

laerred.addEventListener("click", function (e) {
  const p = musISpil(e);
  if (haengFoto) {
    e.stopImmediatePropagation();
    const st = vaegUnderMus(p);
    if (!st) { besked.textContent = "Klik på en væg for at hænge billedet op (Esc fortryder)."; return; }
    const optaget = fotosHer().some(function (h) { return h.st.side === st.side && h.st.n === st.n; });
    if (optaget) { besked.textContent = "Der hænger allerede et billede der. Vælg et andet sted."; return; }
    const foto = fotoMedId(haengFoto);
    foto.vaeg = { rum: aktivtVaerelse, side: st.side, n: st.n };
    gemFotos();
    haengFoto = null;
    fotoValgt = null;
    besked.textContent = "🖼 Billedet hænger nu på væggen. Klik på det for at se det.";
    return;
  }
  const foto = fotoUnderMus(p);
  if (foto) {
    e.stopImmediatePropagation();
    visFoto(foto);
  }
}, true);


// -------------------------------------------------------------
//  Se et billede, der hænger på væggen
// -------------------------------------------------------------
const fotoViser = document.createElement("div");
fotoViser.id = "foto-viser";
fotoViser.hidden = true;
fotoViser.innerHTML =
  '<div class="kam-top"><b id="fv-titel">📷 Billede</b><button type="button" id="fv-luk" title="Luk">✕</button></div>' +
  '<div class="kam-krop"><canvas id="fv-billede" width="' + FOTO_B * 2 + '" height="' + FOTO_H * 2 + '"></canvas>' +
  '<p id="fv-dato" class="kam-tekst"></p><div class="kam-knapper"><button type="button" id="fv-ned">📦 Tag ned</button></div></div>';
document.body.appendChild(fotoViser);
goerFlytbar(fotoViser, fotoViser.querySelector(".kam-top"), "mit-hotel-flyt-foto");
let fotoVises = null;

function visFoto(foto) {
  fotoVises = foto;
  document.getElementById("fv-titel").textContent = "📷 Billede fra " + foto.rumNavn;
  document.getElementById("fv-dato").textContent = "Taget " + fotoDato(foto);
  document.getElementById("fv-ned").hidden = !maaRetteRum();
  tegnFotoI(document.getElementById("fv-billede"), foto);
  fotoViser.hidden = false;
}
document.getElementById("fv-luk").addEventListener("click", function () { fotoViser.hidden = true; });
document.getElementById("fv-ned").addEventListener("click", function () {
  if (!fotoVises) return;
  fotoVises.vaeg = null;
  gemFotos();
  fotoViser.hidden = true;
  besked.textContent = "📦 Billedet ligger nu i Mine ting under 📷 Billeder.";
  visLager();
});
window.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  fotoViser.hidden = true;
  kameraVindue.hidden = true;
});
