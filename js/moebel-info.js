// =============================================================
//  Møbel-boksen nederst til højre 🛋️
//  Klik på et møbel i dit eget rum: Flyt, Tag op og Drej.
// =============================================================
const infoBoks = document.createElement("div");
infoBoks.id = "moebel-info";
infoBoks.hidden = true;
infoBoks.innerHTML =
  "<button type='button' id='mi-luk' title='Luk'>✕</button>" +
  "<div class='mi-top'><canvas id='mi-billede' width='90' height='90'></canvas>" +
  "<div><b id='mi-navn'></b><small id='mi-om'></small></div></div>" +
  "<div class='mi-knapper' id='mi-knapper'>" +
  "<button type='button' id='mi-flyt'>✋ Flyt</button>" +
  "<button type='button' id='mi-tag'>📦 Tag op</button>" +
  "<button type='button' id='mi-drej'>🔄 Drej</button>" +
  "</div>";
document.body.appendChild(infoBoks);

let flytter = null;   // møblet man er ved at flytte

function tegnInfoBillede(type) {
  const c = document.getElementById("mi-billede");
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  if (!type.billede) {
    // møbler der er tegnet med kode
    g.save();
    g.scale(0.7, 0.7);
    tegnMoebel(g, type, c.width / 2 / 0.7, c.height * 0.72 / 0.7, false);
    g.restore();
    return;
  }
  const b = hentBillede(type.billede);
  if (!billedeKlar(b)) { setTimeout(function () { if (!infoBoks.hidden) tegnInfoBillede(type); }, 200); return; }
  const k = type.klip || [0, 0, b.naturalWidth, b.naturalHeight];
  const s = Math.min(84 / k[2], 84 / k[3], 1.5);
  g.imageSmoothingEnabled = false;
  g.drawImage(b, k[0], k[1], k[2], k[3], (c.width - k[2] * s) / 2, (c.height - k[3] * s) / 2, k[2] * s, k[3] * s);
}

function visMoebelInfo() {
  if (!valgtMoebel) { infoBoks.hidden = true; return; }
  const type = MOEBEL_TYPER[valgtMoebel.type];
  const egetRum = rumValg !== "hal";
  document.getElementById("mi-navn").textContent = type.navn;
  document.getElementById("mi-om").textContent = flytter ? "Klik på et ledigt felt for at flytte det" :
    egetRum ? (type.kategori || "Møbel") : "Hotellets møbel";
  document.getElementById("mi-knapper").hidden = !egetRum;
  document.getElementById("mi-flyt").classList.toggle("aktiv", !!flytter);
  infoBoks.hidden = false;
  tegnInfoBillede(type);
}

// opdaterPanel bliver kaldt hver gang man vælger noget, så boksen følger med
const opdaterPanelInfo = opdaterPanel;
opdaterPanel = function () {
  opdaterPanelInfo();
  if (flytter && valgtMoebel !== flytter) flytter = null;
  if (flytter) besked.textContent = "Klik på et ledigt felt for at flytte " + MOEBEL_TYPER[flytter.type].navn + ". (Esc fortryder)";
  visMoebelInfo();
};

document.getElementById("mi-luk").addEventListener("click", function () {
  flytter = null;
  valgtMoebel = null;
  opdaterPanel();
});
document.getElementById("mi-drej").addEventListener("click", function () {
  drejValgt();
  visMoebelInfo();
});
document.getElementById("mi-tag").addEventListener("click", function () {
  if (valgtMoebel && figur.sidde && figur.sidde.moebel === valgtMoebel) { figur.sidde = null; figur.skalSidde = null; }
  const navn = valgtMoebel ? MOEBEL_TYPER[valgtMoebel.type].navn : "";
  flytter = null;
  samlOpValgt();
  if (navn) besked.textContent = navn + " er lagt i Mine ting 📦";
});
document.getElementById("mi-flyt").addEventListener("click", function () {
  if (!valgtMoebel || rumValg === "hal") return;
  flytter = flytter ? null : valgtMoebel;
  opdaterPanel();
});

// Næste klik på gulvet flytter møblet derhen
laerred.addEventListener("click", function (e) {
  if (!flytter || e.ctrlKey || e.metaKey) return;
  e.stopImmediatePropagation();
  const f = musTilFelt(e);
  const fig = figurFelt();
  const type = MOEBEL_TYPER[flytter.type];
  const andet = moebelPaa(f.x, f.y);
  if (!erIRummet(f.x, f.y) || (andet && andet !== flytter) || (fig.x === f.x && fig.y === f.y && !type.kanGaaPaa)) {
    besked.textContent = "Der er optaget. Prøv et andet felt.";
    return;
  }
  if (figur.sidde && figur.sidde.moebel === flytter) { figur.sidde = null; figur.skalSidde = null; }
  flytter.x = f.x;
  flytter.y = f.y;
  flytter = null;
  gem();
  opdaterPanel();
  besked.textContent = type.navn + " er flyttet ✋";
}, true);

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && flytter) { flytter = null; opdaterPanel(); }
});

// skifter man rum, lukker boksen
const skiftRumInfo = skiftRum;
skiftRum = function (navn) {
  flytter = null;
  skiftRumInfo(navn);
  visMoebelInfo();
};
