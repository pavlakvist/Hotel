// 📦 Mine ting bliver åben, når man trykker "Sæt i mit værelse"
// 🔄 Shift drejer møbler:
//    - klik på et møbel, og tryk på Shift
//    - hold Shift nede og klik på et møbel
//    - mens man stiller et nyt møbel, drejer Shift det, før man klikker det ned
// (hentes frisk fra js/panel-forklaring.js, så den gamle kode i browserens hukommelse ikke driller)
(function () {
  const saet = document.getElementById("lager-saet");
  if (saet) saet.addEventListener("click", function () {
    setTimeout(function () {
      if (valgtType) {
        lagerVindue.hidden = false;
        if (typeof visLager === "function") visLager();
      }
    }, 0);
  });

  // retningen på det møbel, man er ved at stille
  let stilRetning = 0;
  let stilType = null;
  function naesteRetning(t, r) {
    for (let i = 0; i < 4; i++) {
      r = (r + 1) % 4;
      if (!t.klipper || t.klipper[r]) break;
    }
    return r;
  }

  function drej() {
    if (valgtType && MOEBEL_TYPER[valgtType]) {
      const t = MOEBEL_TYPER[valgtType];
      if (stilType !== valgtType) { stilType = valgtType; stilRetning = 0; }
      if (t.klipper) stilRetning = naesteRetning(t, stilRetning);
      return;
    }
    if (!valgtMoebel) return;
    drejValgt();
    if (typeof visMoebelInfo === "function") visMoebelInfo();
  }

  // et kort tryk på Shift alene (store bogstaver i chatten drejer ikke noget)
  let shiftAlene = false;
  window.addEventListener("keydown", function (e) {
    shiftAlene = e.key === "Shift" && !e.repeat;
  }, true);
  window.addEventListener("mousedown", function () { shiftAlene = false; }, true);
  window.addEventListener("keyup", function (e) {
    if (e.key !== "Shift" || !shiftAlene) return;
    shiftAlene = false;
    drej();
  }, true);

  // Shift + klik på et møbel = drej det (man går ikke derhen)
  laerred.addEventListener("click", function (e) {
    if (!e.shiftKey || valgtType || rumValg === "hal") return;
    const f = musTilFelt(e);
    const m = moebelPaa(f.x, f.y);
    if (!m) return;
    e.stopImmediatePropagation();
    valgtMoebel = m;
    drejValgt();
    opdaterPanel();
    if (typeof visMoebelInfo === "function") visMoebelInfo();
  }, true);

  // det nye møbel får den retning, man har drejet det til
  let foerAntal = 0, foerType = null;
  laerred.addEventListener("click", function () { foerAntal = moeblerIRummet.length; foerType = valgtType; }, true);
  laerred.addEventListener("click", function () {
    if (!foerType || moeblerIRummet.length <= foerAntal) return;
    const m = moeblerIRummet[moeblerIRummet.length - 1];
    const t = MOEBEL_TYPER[m.type] || {};
    if (stilType === foerType && stilRetning && t.klipper &&
        pladsTil(t, m.x, m.y, stilRetning % 2 === 1, m)) {
      m.retning = stilRetning;
      gem();
    }
    if (valgtType !== foerType) { stilType = null; stilRetning = 0; }
  });

  // "spøgelset" af møblet, man er ved at stille, vises drejet
  const tegnMoebelFoerShift = tegnMoebel;
  tegnMoebel = function (c, type, cx, cy, spejlet, retning) {
    if (retning === undefined && valgtType && stilType === valgtType && stilRetning &&
        type === MOEBEL_TYPER[valgtType] && c.canvas === laerred && Math.abs(c.globalAlpha - 0.55) < 0.01) {
      return tegnMoebelFoerShift.call(this, c, type, cx, cy, spejlet, stilRetning);
    }
    return tegnMoebelFoerShift.apply(this, arguments);
  };
})();
