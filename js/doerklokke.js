// =============================================================
//  🔔 Dørklokke
//  Klik på en lejlighedsdør ude i gangen → "🔔 Ring på" eller "🚪 Gå ind".
//  Den der bor der, hører ding-dong og ser hvem der ringer, og kan trykke
//  "🚪 Luk op" (så kommer gæsten ind, også hvis døren er låst) eller "Ikke nu".
//  Bruger database-17-doerklokke.sql.
// =============================================================
const klokkeMenu = document.createElement("div");
klokkeMenu.id = "klokke-menu";
klokkeMenu.hidden = true;
document.body.appendChild(klokkeMenu);

const klokkePop = document.createElement("div");
klokkePop.id = "klokke-pop";
klokkePop.hidden = true;
document.body.appendChild(klokkePop);

let klokkeLyd = null;
function spilDingDong() {
  try {
    klokkeLyd = klokkeLyd || new (window.AudioContext || window.webkitAudioContext)();
    const start = klokkeLyd.currentTime;
    [[784, 0], [622, 0.45]].forEach(function (n) {
      const tone = klokkeLyd.createOscillator(), styrke = klokkeLyd.createGain();
      tone.type = "sine";
      tone.frequency.value = n[0];
      const t = start + n[1];
      styrke.gain.setValueAtTime(0.0001, t);
      styrke.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      styrke.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      tone.connect(styrke).connect(klokkeLyd.destination);
      tone.start(t);
      tone.stop(t + 0.95);
    });
  } catch (e) {}
}

// -------------------------------------------------------------
//  Ude i gangen: klik på en dør → lille menu
// -------------------------------------------------------------
let klokkeRinger = {};      // ring-id → lejlighed, mens vi venter på svar
document.addEventListener("click", function (e) {
  if (e.target !== laerred || !iGang()) return;
  const nr = doerUnderMus();
  if (!nr) { klokkeMenu.hidden = true; return; }
  const l = lejPaa(gangSal(aktivtVaerelse), nr);
  if (!l || l.id === hjemId()) return;          // ledig dør eller min egen: som før
  e.stopImmediatePropagation();
  visKlokkeMenu(l, e.clientX, e.clientY);
}, true);

function visKlokkeMenu(l, x, y) {
  klokkeMenu.innerHTML = "<b>🚪 Nr. " + husnummer(l) + " · " + l.ejer + "</b>" +
    "<button type='button' id='klokke-ring'>🔔 Ring på</button>" +
    "<button type='button' id='klokke-ind'>" + (l.adgang === "laast" && !erHotelEjerLej() ? "🔒 Låst" : l.adgang === "kode" && !erHotelEjerLej() ? "🔑 Skriv kode" : "🚪 Gå ind") + "</button>" +
    "<button type='button' id='klokke-luk'>Annuller</button>";
  klokkeMenu.style.left = Math.min(x + 8, innerWidth - 190) + "px";
  klokkeMenu.style.top = Math.max(8, Math.min(y - 20, innerHeight - 160)) + "px";
  klokkeMenu.hidden = false;
  document.getElementById("klokke-ring").onclick = function () { klokkeMenu.hidden = true; ringPaa(l); };
  document.getElementById("klokke-ind").onclick = function () {
    klokkeMenu.hidden = true;
    gaaTil(doerX(l.nr), 0);
    lejVenter = { ind: l, tid: Date.now() };
  };
  document.getElementById("klokke-luk").onclick = function () { klokkeMenu.hidden = true; };
}

function ringPaa(l) {
  gaaTil(doerX(l.nr), 0);
  spilDingDong();
  serverKald("hv_lej_ring", { p_token: mitToken(), p_id: l.id }).then(function (id) {
    klokkeRinger[id] = { lej: l, tid: Date.now() };
    besked.textContent = "🔔 Ding dong! Du ringede på hos " + l.ejer + ". Vent og se, om der bliver lukket op …";
    setTimeout(function () {
      if (!klokkeRinger[id]) return;
      delete klokkeRinger[id];
      if (iGang()) besked.textContent = "🔕 Ingen lukkede op hos " + l.ejer + ". Måske er de ikke hjemme.";
    }, 45000);
  }).catch(function (e) { besked.textContent = e.message; });
}

// -------------------------------------------------------------
//  Hjemme: det ringer på!
// -------------------------------------------------------------
const klokkeSet = {};       // ringninger vi allerede har vist
let klokkeKoe = [];
function visNaesteRing() {
  if (!klokkePop.hidden || !klokkeKoe.length) return;
  const r = klokkeKoe.shift(), l = minLej();
  klokkePop.innerHTML = "<div class='kp-klokke'>🔔</div><b>Det ringer på!</b>" +
    "<p><b class='kp-navn'></b> står uden for din dør" + (l ? " (nr. " + husnummer(l) + ")" : "") + ".</p>" +
    "<div><button type='button' id='kp-ja'>🚪 Luk op</button><button type='button' id='kp-nej'>Ikke nu</button></div>";
  klokkePop.querySelector(".kp-navn").textContent = r.fra;
  klokkePop.hidden = false;
  spilDingDong();
  const svar = function (ja) {
    klokkePop.hidden = true;
    serverKald("hv_lej_ring_svar", { p_token: mitToken(), p_ring: r.id, p_ja: ja }).catch(function () {});
    besked.textContent = ja ? "🚪 Du lukkede op for " + r.fra + "." : "Du lukkede ikke op for " + r.fra + ".";
    setTimeout(visNaesteRing, 300);
  };
  document.getElementById("kp-ja").onclick = function () { svar(true); };
  document.getElementById("kp-nej").onclick = function () { svar(false); };
}

function tjekKlokke() {
  const token = typeof mitToken === "function" && mitToken();
  if (!token) return;
  serverKald("hv_lej_klokke", { p_token: token }).then(function (d) {
    if (!d) return;
    (d.ringer || []).forEach(function (r) {
      if (klokkeSet[r.id]) return;
      klokkeSet[r.id] = true;
      klokkeKoe.push(r);
    });
    visNaesteRing();
    (d.svar || []).forEach(function (s) {
      const v = klokkeRinger[s.id];
      if (!v) return;
      delete klokkeRinger[s.id];
      if (s.svar === "ja") {
        besked.textContent = "🚪 " + v.lej.ejer + " lukker op for dig!";
        if (iGang()) gaaIndFremmed(v.lej);       // også selvom døren er låst
      } else {
        besked.textContent = "🔕 " + v.lej.ejer + " kan ikke lukke op lige nu.";
      }
    });
  }).catch(function () {});     // database-17-doerklokke.sql er ikke kørt endnu
}
setInterval(tjekKlokke, 3000);

const klokkeStil = document.createElement("style");
klokkeStil.textContent =
  "#klokke-menu[hidden], #klokke-pop[hidden] { display: none; }" +
  "#klokke-menu { position: fixed; z-index: 62; width: 180px; padding: 10px; background: #fbf6ea; border: 3px solid #4e7d4a; border-radius: 12px;" +
  " box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; display: flex; flex-direction: column; gap: 6px; }" +
  "#klokke-menu button { padding: 6px; border: 2px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#klokke-menu #klokke-ring { background: #f2c94c; border-color: #c99a1e; color: #4a3500; }" +
  "#klokke-menu button:hover { filter: brightness(1.06); }" +
  "#klokke-pop { position: fixed; top: 22%; left: calc(50% - 150px); z-index: 70; width: 300px; padding: 14px; background: #fbf6ea; border: 3px solid #c99a1e;" +
  " border-radius: 14px; box-shadow: 0 8px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; text-align: center; }" +
  "#klokke-pop > b { font-size: 17px; color: #4e7d4a; }" +
  "#klokke-pop p { margin: 8px 0 12px; }" +
  "#klokke-pop .kp-navn { color: #2f4a2b; font-size: 15px; }" +
  "#klokke-pop div:last-child { display: flex; gap: 8px; }" +
  "#klokke-pop button { flex: 1; padding: 8px; border: 2px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 13px Verdana, sans-serif; cursor: pointer; }" +
  "#klokke-pop #kp-ja { background: #4e7d4a; border-color: #3b6338; color: #fff; }" +
  ".kp-klokke { font-size: 40px; animation: kp-sving 0.5s ease-in-out 4; transform-origin: 50% 10%; }" +
  "@keyframes kp-sving { 0%,100% { transform: rotate(0); } 25% { transform: rotate(18deg); } 75% { transform: rotate(-18deg); } }";
document.head.appendChild(klokkeStil);
