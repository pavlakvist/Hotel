// =============================================================
//  🛗 Kun elevator i de fælles rum (5/11)
//  Velkomsthallen og event-rummene har ingen døre mere.
//  Man kommer og går med elevatoren (dit værelse ligger under
//  "🏢 Lejlighederne" i elevatoren, eller tryk på knappen i panelet).
//  Dørene ved lejlighederne på gangene er der stadig.
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function () {
  // event-rummene: ingen dør
  if (typeof EVENT_RUM !== "undefined") EVENT_RUM.forEach(function (r) { r.doer = null; });
  if (typeof INDBYGGEDE_RUM !== "undefined" && rumValg === "vaerelse" && INDBYGGEDE_RUM[aktivtVaerelse] && INDBYGGEDE_RUM[aktivtVaerelse].event) RUM.doer = null;

  // hallen: døren kan ikke klikkes, og man går ikke ud ad den
  halOverDoer = function () { return false; };
  HAL_DOER.felt = { x: -99, y: -99 };

  // hallens vægge tegnes uden døren og skiltet over den (elevatoren tegnes stadig)
  tegnHalVaegge = function () {
    halVaeg(punkt(0, RUM.dybde), punkt(0, 0), RUM.dybde, true);
    halVaeg(punkt(0, 0), punkt(RUM.bredde, 0), RUM.bredde, false);
    if (typeof tegnElevator === "function") tegnElevator();
  };

  // man kommer ind foran elevatoren
  function vedElevatoren() {
    if (typeof ELEVATOR === "undefined" || typeof elevatorRum !== "function" || !elevatorRum()) return;
    const offentlig = rumValg === "hal" || (INDBYGGEDE_RUM[aktivtVaerelse] && INDBYGGEDE_RUM[aktivtVaerelse].event);
    if (!offentlig) return;
    const x = ELEVATOR.felt.x + 1, y = ELEVATOR.felt.y;
    if (erIRummet(x, y)) { figur.x = x; figur.y = y; figur.retning = "ned-hoejre"; }
  }
  function nyVelkomst() {
    if (rumValg === "hal" && typeof besked !== "undefined" && besked && /døren/.test(besked.textContent)) {
      besked.textContent = "Velkommen til HELLO VERA! Tag elevatoren 🛗 for at komme rundt i hotellet.";
    }
  }
  const skiftRumFoerKunElev = skiftRum;
  skiftRum = function (navn) {
    skiftRumFoerKunElev(navn);
    vedElevatoren();
    nyVelkomst();
  };
  if (rumValg === "hal" && typeof figur !== "undefined" && figur.x === 11 && figur.y === 1) vedElevatoren();
  nyVelkomst();
})();
