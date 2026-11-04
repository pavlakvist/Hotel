// =============================================================
//  🚶 Rettet gang og sidning for pigen og drengen (4/11)
//  1) Gå-billederne er sat, så hovedet står stille (før hoppede det fra side til side).
//  2) Til siden og skråt går de nu: skridt, ben samlet, andet ben frem, ben samlet.
//     Billederne med "-s" i navnet er spejlede kopier (fx pige-gaa-hoejre-s1.png).
//  3) Skråt opad bruges også billederne fra siden (før gik de baglæns-agtigt).
//  4) De skifter ikke størrelse, når de sætter sig eller går:
//     sidde- og gå-billederne er tegnet med et andet stort hoved, så de tegnes lidt mindre.
//  Tallene er målt fra billederne (scripts: projektmappen gang-pixel/scripts/).
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
(function () {
  const GANG = {"pige":{"ned":[["pige-gaa-ned-1.png",28.8,157.0],["pige-gaa-ned-2.png",28.7,157.0],["pige-gaa-ned-3.png",29.9,157.0],["pige-gaa-ned-4.png",29.4,157.0],["pige-gaa-ned-5.png",28.3,157.0]],
    "op":[["pige-gaa-op-1.png",26.2,157.0],["pige-gaa-op-2.png",26.1,157.0],["pige-gaa-op-3.png",28.1,157.0],["pige-gaa-op-4.png",27.8,157.0]],
    "hoejre":[["pige-gaa-hoejre-3.png",31.1,150.0],["pige-gaa-hoejre-s1.png",30.9,154.0],["pige-gaa-hoejre-s3.png",30.2,150.0],["pige-gaa-hoejre-s1.png",30.9,154.0]],
    "venstre":[["pige-gaa-venstre-3.png",30.4,150.0],["pige-gaa-venstre-1.png",29.7,154.0],["pige-gaa-venstre-s3.png",29.4,150.0],["pige-gaa-venstre-1.png",29.7,154.0]],
    "ned-hoejre":[["pige-gaa-hoejre-3.png",27.4,150.0],["pige-gaa-hoejre-s1.png",27.2,154.0],["pige-gaa-hoejre-s3.png",26.5,150.0],["pige-gaa-hoejre-s1.png",27.2,154.0]],
    "op-hoejre":[["pige-gaa-hoejre-3.png",26.0,150.0],["pige-gaa-hoejre-s1.png",25.8,154.0],["pige-gaa-hoejre-s3.png",25.1,150.0],["pige-gaa-hoejre-s1.png",25.8,154.0]],
    "ned-venstre":[["pige-gaa-venstre-3.png",31.0,150.0],["pige-gaa-venstre-1.png",30.3,154.0],["pige-gaa-venstre-s3.png",30.1,150.0],["pige-gaa-venstre-1.png",30.3,154.0]],
    "op-venstre":[["pige-gaa-venstre-3.png",30.6,150.0],["pige-gaa-venstre-1.png",29.9,154.0],["pige-gaa-venstre-s3.png",29.6,150.0],["pige-gaa-venstre-1.png",29.9,154.0]]},
  "dreng":{"ned":[["dreng-gaa-ned-1.png",27.3,135.0],["dreng-gaa-ned-2.png",26.9,135.0],["dreng-gaa-ned-3.png",27.1,135.0],["dreng-gaa-ned-4.png",27.6,135.0],["dreng-gaa-ned-5.png",27.4,135.0]],
    "op":[["dreng-gaa-op-1.png",27.3,134.0],["dreng-gaa-op-4.png",25.5,134.0],["dreng-gaa-op-2.png",26.5,133.0],["dreng-gaa-op-s4.png",24.6,134.0]],
    "hoejre":[["dreng-gaa-hoejre-2.png",40.6,131.0],["dreng-gaa-hoejre-s1.png",30.7,131.0],["dreng-gaa-hoejre-s2.png",34.6,130.0],["dreng-gaa-hoejre-s1.png",30.7,131.0]],
    "venstre":[["dreng-gaa-venstre-2.png",31.2,130.0],["dreng-gaa-venstre-1.png",23.0,131.0],["dreng-gaa-venstre-s2.png",26.1,131.0],["dreng-gaa-venstre-1.png",23.0,131.0]],
    "ned-hoejre":[["dreng-gaa-hoejre-2.png",37.6,131.0],["dreng-gaa-hoejre-s1.png",27.7,131.0],["dreng-gaa-hoejre-s2.png",31.5,130.0],["dreng-gaa-hoejre-s1.png",27.7,131.0]],
    "op-hoejre":[["dreng-gaa-hoejre-2.png",37.7,131.0],["dreng-gaa-hoejre-s1.png",27.7,131.0],["dreng-gaa-hoejre-s2.png",31.6,130.0],["dreng-gaa-hoejre-s1.png",27.7,131.0]],
    "ned-venstre":[["dreng-gaa-venstre-2.png",32.7,130.0],["dreng-gaa-venstre-1.png",24.5,131.0],["dreng-gaa-venstre-s2.png",27.6,131.0],["dreng-gaa-venstre-1.png",24.5,131.0]],
    "op-venstre":[["dreng-gaa-venstre-2.png",29.9,130.0],["dreng-gaa-venstre-1.png",21.8,131.0],["dreng-gaa-venstre-s2.png",24.8,131.0],["dreng-gaa-venstre-1.png",21.8,131.0]]}};
  // hvor meget mindre billederne tegnes (1 = som stå-billedet)
  const GAA_SKALA = { pige: 1, dreng: 0.9 };
  const SIDDE_SKALA = { pige: { sidder: 0.74, sid: 0.76 }, dreng: { sidder: 0.76, sid: 0.82 } };

  Object.keys(GANG).forEach(function (hvem) {
    const f = FIGURER[hvem];
    if (!f) return;
    f.gaaSkala = GAA_SKALA[hvem];
    Object.keys(GANG[hvem]).forEach(function (retning) {
      f.gaa[retning] = GANG[hvem][retning].map(function (n) {
        const b = { fil: "billeder/figurer/" + n[0], anker: [n[1], n[2]] };
        if (typeof figurBillede === "function") figurBillede(b.fil);   // hent billedet med det samme
        return b;
      });
    });
  });

  // sidde-skala ud fra billedets navn (gamle "-sidder-" eller nye "-sid-" fra biografen)
  function siddeSkala(hvem, retning) {
    const f = FIGURER[hvem], t = SIDDE_SKALA[hvem];
    if (!f || !t || !f.sidder) return null;
    const del = f.sidder[retning] || f.sidder.ned;
    if (!del) return null;
    return del.fil.indexOf("-sidder-") >= 0 ? t.sidder : del.fil.indexOf("-sid-") >= 0 ? t.sid : null;
  }
  function medSkala(f, k, goer) {
    if (!f || !k) return goer();
    const gammel = f.skala, gammelSid = f.siddeSkala;
    f.skala = k;
    f.siddeSkala = k;
    try { return goer(); } finally { f.skala = gammel; f.siddeSkala = gammelSid; }
  }
  const tegnFoer = tegnMenneske;
  tegnMenneske = function (c, x, y, valg, retning, gaarTrin, sidde) {
    const args = arguments, self = this;
    const f = FIGURER[valg && valg.type];
    let k = null;
    if (f && sidde) k = siddeSkala(valg.type, retning);
    else if (f && gaarTrin !== null && gaarTrin !== undefined && f.gaaSkala && f.gaaSkala !== 1) k = f.skala * f.gaaSkala;
    return medSkala(f, k, function () { return tegnFoer.apply(self, args); });
  };
  if (typeof fodJustering === "function") {
    const fodFoer = fodJustering;
    fodJustering = function (m, valg, retning) {
      const args = arguments, self = this;
      const f = FIGURER[valg && valg.type];
      return medSkala(f, f ? siddeSkala(valg.type, retning) : null, function () { return fodFoer.apply(self, args); });
    };
  }
})();
