// =============================================================
//  De gamle figurer "Pige (gammel)" og "Dreng (gammel)" kan ikke længere vælges
//  i Skift udseende. Har man en af dem på, skifter man til den nye pige/dreng.
//  (Figurerne findes stadig i js/figur.js, så gamle billeder og andre spillere kan tegnes.)
// =============================================================
function erGammelFigur(id) { return !!FIGURER[id] && /\(gammel\)/i.test(FIGURER[id].navn || ""); }

const alleFigurerMedGamle = alleFigurer;
alleFigurer = function () {
  const liste = alleFigurerMedGamle();
  Object.keys(liste).forEach(function (id) { if (erGammelFigur(id)) delete liste[id]; });
  return liste;
};

// Gemt udseende med en gammel figur skifter til den nye (før spil.js læser det)
(function () {
  try {
    const NOEGLE = "mit-hotel-figur-5";
    const gemt = JSON.parse(localStorage.getItem(NOEGLE));
    if (!gemt || !erGammelFigur(gemt.type)) return;
    gemt.type = gemt.type.indexOf("mand") === 0 ? "dreng" : "pige";
    gemt.nyPige = gemt.nyDreng = true;
    localStorage.setItem(NOEGLE, JSON.stringify(gemt));
  } catch (e) {}
})();
