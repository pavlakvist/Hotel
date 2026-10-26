// =============================================================
//  Rigtige spillere 👥 — de andre, der er på hotellet lige nu
//  Hvert sekund fortæller vi serveren (js/server.js), hvor vi står,
//  og får de andre spillere og nye chatbeskeder i rummet tilbage.
//  De andre tegnes som gæsterne i hallen (tegnHalGaest i velkomsthal.js).
// =============================================================
const ANDRE_SPILLERE = {};      // navn -> { navn, valg, x, y, retning, rute, trin, sidder, saede, plads, maal, rumId }
let chatEfter = null;           // id på den sidste chatbesked, vi har set
let pulsRum = null;             // rummet ved sidste puls
let sendtFigur = "", sendtBoble = "", sidstFigurTid = 0;
let serverForbindelse = true;
let serverHarVenner = true;     // false hvis databasen ikke har venner endnu

// Hvilket rum er jeg i? Hallen og event-rummene er fælles; dine egne rum er dine.
function mitRumId() {
  if (rumValg === "hal") return "hal";
  if (typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[aktivtVaerelse]) return aktivtVaerelse;
  return FIGUR.navn + ":" + aktivtVaerelse;
}

async function puls() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  const rum = mitRumId();
  if (rum !== pulsRum) { chatEfter = null; pulsRum = rum; }
  // figur og boble sendes kun, når de er ændret (eller hvert 15. sekund)
  const figurTekst = JSON.stringify(garderobe), bobleTekst = JSON.stringify(minBoble);
  const nu = Date.now();
  const sendAlt = nu - sidstFigurTid > 15000;
  const sidde = figur.sidde && figur.sidde.grad > 0.4 ? { type: figur.sidde.moebel.type, x: figur.sidde.moebel.x, y: figur.sidde.moebel.y, plads: figur.sidde.plads } : null;
  const data = {
    p_token: token, p_rum: rum, p_x: figur.x, p_y: figur.y, p_retning: figur.retning, p_sidder: sidde,
    p_figur: sendAlt || figurTekst !== sendtFigur ? garderobe : null,
    p_boble: sendAlt || bobleTekst !== sendtBoble ? minBoble : null,
    p_efter: chatEfter,
  };
  // venner og private beskeder (js/rigtige-venner.js), hvis serveren kan det
  if (typeof beskedEfterId === "function" && serverHarVenner) data.p_besked_efter = beskedEfterId();
  let svar;
  try { svar = await serverKald("hv_puls", data); }
  catch (e) {
    // serveren kender ikke venner endnu (database-2-venner.sql er ikke kørt)
    if (!("p_besked_efter" in data) || /ikke logget ind/.test(e.message)) throw e;
    serverHarVenner = false;
    delete data.p_besked_efter;
    svar = await serverKald("hv_puls", data);
  }
  sendtFigur = figurTekst; sendtBoble = bobleTekst;
  if (sendAlt) sidstFigurTid = nu;

  // de andre spillere
  const navne = {};
  svar.spillere.forEach(function (s) {
    navne[s.navn] = true;
    let g = ANDRE_SPILLERE[s.navn];
    if (!g) {
      g = ANDRE_SPILLERE[s.navn] = { navn: s.navn, valg: { type: "pige" }, x: s.x || 0, y: s.y || 0, retning: "ned",
        rute: [], trin: 0, sidder: false, saede: null, plads: 0, maal: { x: s.x || 0, y: s.y || 0 } };
    }
    if (g.rumId !== s.rum) { g.x = s.x || 0; g.y = s.y || 0; }   // nyt rum: stå med det samme
    g.rumId = s.rum;
    g.maal = { x: s.x || 0, y: s.y || 0 };
    g.retning = s.retning || "ned";
    g.sidderPaa = s.sidder;
    g.sover = !!s.sover;
    if (s.figur && s.figur.type) g.valg = s.figur;
    if (s.boble && typeof GAEST_BOBLER !== "undefined") GAEST_BOBLER[s.navn] = s.boble;
  });
  Object.keys(ANDRE_SPILLERE).forEach(function (n) { if (!navne[n]) delete ANDRE_SPILLERE[n]; });

  // nye chatbeskeder i rummet
  if (chatEfter !== null && rum === mitRumId()) {
    svar.chat.forEach(function (c) {
      const g = ANDRE_SPILLERE[c.navn];
      if (c.boble && typeof GAEST_BOBLER !== "undefined") GAEST_BOBLER[c.navn] = c.boble;
      if (g && g.rumId === rum) sig(g, c.navn, c.tekst);
    });
  }
  let sidste = svar.sidste || 0;
  svar.chat.forEach(function (c) { if (c.id > sidste) sidste = c.id; });
  chatEfter = Math.max(chatEfter || 0, sidste);
  if (typeof venPuls === "function") venPuls(svar);
}

function naestePuls() {
  puls().then(function () {
    serverForbindelse = true;
    setTimeout(naestePuls, 1000);
  }).catch(function (e) {
    if (/ikke logget ind/.test(e.message)) {
      logUd();
      location.replace("index.html?login");
      return;
    }
    serverForbindelse = false;
    console.warn("Serveren: " + e.message);
    setTimeout(naestePuls, 3000);
  });
}
if (SERVER.til) naestePuls();

// Når man lukker fanen, forsvinder man fra "online" med det samme
window.addEventListener("pagehide", function () {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  try {
    fetch(SERVER.adresse + "/rest/v1/rpc/hv_log_ud", {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: SERVER.noegle },
      body: JSON.stringify({ p_token: token }),
    });
  } catch (e) {}
});


// =============================================================
//  Tegn de andre (kaldes fra tegnAlt i spil.js)
// =============================================================
let andreSidst = performance.now();
function andreSpillereTing(ting) {
  const nu = performance.now();
  const dt = Math.min(0.1, (nu - andreSidst) / 1000);
  andreSidst = nu;
  const rum = mitRumId();
  // har jeg selv flyttet mig? (ellers falder jeg i søvn efter 5 minutter)
  if (Math.abs(figur.x - mitSidsteSted.x) > 0.01 || Math.abs(figur.y - mitSidsteSted.y) > 0.01) {
    mitSidsteSted = { x: figur.x, y: figur.y };
    mitAktiv = Date.now();
  }
  Object.values(ANDRE_SPILLERE).forEach(function (g) {
    if (g.rumId !== rum) return;
    // sidder de på et møbel her i rummet?
    const s = g.sidderPaa;
    const m = s && moeblerIRummet.find(function (mm) { return mm.x === s.x && mm.y === s.y && mm.type === s.type; });
    if (m && MOEBEL_TYPER[m.type]) {
      // plads: hvilken plads i en sofa til to (de nye sofaer har en plads pr. felt)
      const felt = typeof pladsFelt === "function" ? pladsFelt(m, s.plads || 0) : m;
      g.sidder = true; g.saede = m; g.plads = s.plads || 0; g.x = felt.x; g.y = felt.y; g.rute = [];
    } else {
      g.sidder = false; g.saede = null;
      // glid blødt hen mod det sted, serveren sagde
      const dx = g.maal.x - g.x, dy = g.maal.y - g.y, afstand = Math.hypot(dx, dy);
      if (afstand > 4) { g.x = g.maal.x; g.y = g.maal.y; g.rute = []; }
      else if (afstand > 0.02) {
        const skridt = Math.min(afstand, Math.max(2.5, afstand * 3) * dt);
        g.x += dx / afstand * skridt; g.y += dy / afstand * skridt;
        g.trin += dt * 8;
        g.rute = [g.maal];
      } else g.rute = [];
    }
    // sidder de i en sofa på 2 felter, tegnes de foran sofaen
    const dybde = g.sidder && typeof moebelDybde === "function" ? moebelDybde(g.saede) + 0.1 + g.plads * 0.01 : g.x + g.y + 0.1;
    ting.push({ dybde: dybde, tegn: function () { tegnAndenSpiller(g); } });
  });
}

function tegnAndenSpiller(g) {
  tegnHalGaest(g);
  if (g.sover) { const h = hovedPaa(g); tegnZzz(h.x, h.y + 22); }
  // EJER-skiltet over hotellets ejere
  const skilt = hentBillede("billeder/skilt-ejer.png");
  if (typeof EJERE !== "undefined" && EJERE.indexOf(g.navn) >= 0 && billedeKlar(skilt)) {
    const p = punkt(g.x + 0.5, g.y + 0.5);
    p.x += gaestPlads(g);
    const hoejde = figurHoejde(g.valg) - 10 + (g.sidder ? -MOEBEL_TYPER[g.saede.type].saede + 10 : 0);
    const sw = skilt.naturalWidth * 0.85, sh = skilt.naturalHeight * 0.85;
    ctx.drawImage(skilt, Math.round(p.x - sw / 2), Math.round(p.y - hoejde - 26 - sh), sw, sh);
  }
}


// =============================================================
//  Chat: det, du siger, sendes til de andre i rummet
// =============================================================
const sigFoerServer = sig;
sig = function (hvem, navn, tekst) {
  sigFoerServer(hvem, navn, tekst);
  if (hvem === figur) mitAktiv = Date.now();
  const token = mitToken();
  if (hvem !== figur || !SERVER.til || !token || !String(tekst).trim()) return;
  serverKald("hv_chat_send", { p_token: token, p_rum: mitRumId(), p_tekst: tekst, p_boble: minBoble })
    .catch(function (e) { console.warn("Chatten nåede ikke serveren: " + e.message); });
};


// =============================================================
//  Online-tallet tæller nu også de rigtige spillere med
// =============================================================
if (typeof hvemErOnline === "function") {
  const hvemErOnlineFoer = hvemErOnline;
  hvemErOnline = function () {
    const navne = hvemErOnlineFoer();
    Object.keys(ANDRE_SPILLERE).forEach(function (n) { if (navne.indexOf(n) < 0) navne.push(n); });
    return navne;
  };
  setInterval(function () {
    const boks = document.getElementById("online-tal");
    if (boks) boks.classList.toggle("ingen-server", !serverForbindelse);
    if (boks && !serverForbindelse) boks.title = "Ingen forbindelse til serveren lige nu. Prøver igen …";
  }, 2000);
}


// =============================================================
//  Hvor mange er der i hvert rum? (navigatøren og elevatoren)
//  Tæller nu også de rigtige spillere med.
// =============================================================
function navRumId(r) {
  if (r.rum === "hal") return "hal";
  if (!r.vaerelse) return null;
  if (typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[r.vaerelse]) return r.vaerelse;
  return FIGUR.navn + ":" + r.vaerelse;
}
if (typeof antalIRum === "function") {
  const antalIRumFoer = antalIRum;
  antalIRum = function (r) {
    const id = navRumId(r);
    if (!id) return antalIRumFoer(r);
    return antalIRumFoer(r) + Object.values(ANDRE_SPILLERE).filter(function (g) { return g.rumId === id; }).length;
  };
}


// =============================================================
//  zzz 💤 over hovedet, når man ikke har flyttet sig eller skrevet i 5 minutter
// =============================================================
const SOVE_TID = 5 * 60 * 1000;
let mitAktiv = Date.now();
let mitSidsteSted = { x: figur.x, y: figur.y };

function tegnZzz(x, y) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.textAlign = "center";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#3b2a5a";
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 3; i++) {
    const f = (t * 0.5 + i / 3) % 1;          // hvert z svæver op og forsvinder
    ctx.globalAlpha = Math.sin(f * Math.PI);
    ctx.font = "bold " + Math.round(10 + f * 9) + "px Verdana, sans-serif";
    const zx = x + 6 + f * 18, zy = y - f * 30;
    ctx.strokeText("z", zx, zy);
    ctx.fillText("z", zx, zy);
  }
  ctx.restore();
}

const tegnFigurFoerZzz = tegnFigur;
tegnFigur = function (c) {
  tegnFigurFoerZzz(c);
  if (Date.now() - mitAktiv > SOVE_TID) { const h = hovedPaa(figur); tegnZzz(h.x, h.y + 22); }
};
