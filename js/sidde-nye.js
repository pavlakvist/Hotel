// =============================================================
//  🪑 Nye billeder af pigen og drengen, der sidder (Pavlas sidde-ark 30/10)
//  Kilde: billeder/figurer/kilde/sidde-ark.jpg
//  Bruges kun bagfra (op mod højre/venstre) til biografsæderne.
//  anker = numsen, der skal ramme sædet. "-hoejre"/"-venstre" er det samme billede spejlet.
//  (Hentes fra js/biograf.js.)
// =============================================================
(function () {
  function sid(hvem, retning, anker) {
    return { fil: "billeder/figurer/" + hvem + "-sid-" + retning + ".png", anker: anker, ingenLag: true };
  }
  const NYE = {
    pige: {
      forV: sid("pige", "ned-venstre", [58, 104]), forH: sid("pige", "ned-hoejre", [21, 104]),
      bagH: sid("pige", "op-hoejre", [35, 112]), bagV: sid("pige", "op-venstre", [49, 112]),
    },
    dreng: {
      forV: sid("dreng", "ned-venstre", [55, 82]), forH: sid("dreng", "ned-hoejre", [17, 82]),
      bagH: sid("dreng", "op-hoejre", [20, 80]), bagV: sid("dreng", "op-venstre", [50, 80]),
    },
  };
  Object.keys(NYE).forEach(function (hvem) {
    const f = FIGURER[hvem], n = NYE[hvem];
    if (!f) return;
    // Skråt forfra (stole og sofaer) bruges de gamle sidde-billeder, fordi de er tegnet
    // som resten af figuren. Arket her er tegnet i en anden stil (større hoved, andet ansigt),
    // så figuren så anderledes ud, når den satte sig. Kun bagfra (biografen) bruges arket,
    // hvor man næsten kun ser håret.
    f.sidder["op-hoejre"] = n.bagH;
    f.sidder["op"] = n.bagH;
    f.sidder["op-venstre"] = n.bagV;
    f.sidderBagfra = true;    // biografen tegner det rigtige bagfra-billede (js/biograf.js)
  });
})();
