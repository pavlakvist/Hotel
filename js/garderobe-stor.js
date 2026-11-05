// =============================================================
//  👗 Stor garderobe (5/11): former på tøjet og mange frisurer
//  til pigen og drengen.
//   Underdel → Form: lange bukser, shorts, nederdel eller kjole.
//   Hår → Frisure: ekstra langt, mellemlangt, skulderlangt, bob,
//         hestehale, fletninger (pigen) og halvlangt/langt (drengen).
//   Hårfarve: også ombre (to farver) og striber i håret.
//   Drengens hår kan nu også få farve.
//  Rettelserne ligger i billeder/figurer/stil/<figur>-<form>.png:
//  én række pr. figur-billede: [hvad der ændres, billedet, de 7 farvelag].
//  (Hentes fra js/toej-rigtigt.js.)
// =============================================================
(function () {
  if (typeof FIGURER === "undefined" || !FIGURER.pige || !FIGURER.dreng) return;
  const STIL_KORT = {"pige-shorts":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-5":1540,"pige-gaa-op-2":1697,"pige-gaa-op-4":1854,"pige-gaa-venstre-1":2011,"pige-gaa-venstre-2":2165,"pige-gaa-venstre-3":2319,"pige-gaa-venstre-4":2469,"pige-gaa-venstre-s3":2624,"pige-sidder-hoejre":2774,"pige-sidder-ned":2917,"pige-sidder-ned-hoejre":3061,"pige-sidder-ned-venstre":3205,"pige-sidder-venstre":3349,"pige-staa-hoejre":3492,"pige-staa-ned":3646,"pige-staa-ned-hoejre":3803,"pige-staa-ned-venstre":3960,"pige-staa-op":4117,"pige-staa-op-hoejre":4272,"pige-staa-op-venstre":4426,"pige-staa-venstre":4580,"pige-udtryk-blink":4734,"pige-udtryk-flirt":4892,"pige-udtryk-glad":5050,"pige-udtryk-grin":5208,"pige-udtryk-ked":5366,"pige-udtryk-neutral":5524,"pige-udtryk-overrasket":5682,"pige-udtryk-smil":5840,"pige-udtryk-traet":5998,"pige-udtryk-vred":6156,"pige-vink":6314},"pige-nederdel":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-5":1540,"pige-gaa-op-2":1697,"pige-gaa-op-4":1854,"pige-gaa-venstre-1":2011,"pige-gaa-venstre-2":2165,"pige-gaa-venstre-3":2319,"pige-gaa-venstre-4":2469,"pige-gaa-venstre-s3":2624,"pige-sidder-hoejre":2774,"pige-sidder-ned":2917,"pige-sidder-ned-hoejre":3061,"pige-sidder-ned-venstre":3205,"pige-sidder-venstre":3349,"pige-staa-hoejre":3492,"pige-staa-ned":3646,"pige-staa-ned-hoejre":3803,"pige-staa-ned-venstre":3960,"pige-staa-op":4117,"pige-staa-op-hoejre":4272,"pige-staa-op-venstre":4426,"pige-staa-venstre":4580,"pige-udtryk-blink":4734,"pige-udtryk-flirt":4892,"pige-udtryk-glad":5050,"pige-udtryk-grin":5208,"pige-udtryk-ked":5366,"pige-udtryk-neutral":5524,"pige-udtryk-overrasket":5682,"pige-udtryk-smil":5840,"pige-udtryk-traet":5998,"pige-udtryk-vred":6156,"pige-vink":6314},"pige-kjole":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-5":1540,"pige-gaa-op-2":1697,"pige-gaa-op-4":1854,"pige-gaa-venstre-1":2011,"pige-gaa-venstre-2":2165,"pige-gaa-venstre-3":2319,"pige-gaa-venstre-4":2469,"pige-gaa-venstre-s3":2624,"pige-sidder-hoejre":2774,"pige-sidder-ned":2917,"pige-sidder-ned-hoejre":3061,"pige-sidder-ned-venstre":3205,"pige-sidder-venstre":3349,"pige-staa-hoejre":3492,"pige-staa-ned":3646,"pige-staa-ned-hoejre":3803,"pige-staa-ned-venstre":3960,"pige-staa-op":4117,"pige-staa-op-hoejre":4272,"pige-staa-op-venstre":4426,"pige-staa-venstre":4580,"pige-udtryk-blink":4734,"pige-udtryk-flirt":4892,"pige-udtryk-glad":5050,"pige-udtryk-grin":5208,"pige-udtryk-ked":5366,"pige-udtryk-neutral":5524,"pige-udtryk-overrasket":5682,"pige-udtryk-smil":5840,"pige-udtryk-traet":5998,"pige-udtryk-vred":6156,"pige-vink":6314},"pige-ekstralangt":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"pige-mellem":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"pige-skulder":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"pige-bob":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"pige-hestehale":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"pige-fletninger":{"pige-gaa-hoejre-1":0,"pige-gaa-hoejre-2":156,"pige-gaa-hoejre-3":309,"pige-gaa-hoejre-4":459,"pige-gaa-hoejre-5":613,"pige-gaa-hoejre-s1":764,"pige-gaa-hoejre-s3":918,"pige-gaa-ned-1":1068,"pige-gaa-ned-2":1225,"pige-gaa-ned-3":1382,"pige-gaa-ned-4":1540,"pige-gaa-ned-5":1697,"pige-gaa-op-1":1854,"pige-gaa-op-2":2011,"pige-gaa-op-3":2168,"pige-gaa-op-4":2325,"pige-gaa-venstre-1":2482,"pige-gaa-venstre-2":2636,"pige-gaa-venstre-3":2790,"pige-gaa-venstre-4":2940,"pige-gaa-venstre-s3":3095,"pige-sidder-hoejre":3245,"pige-sidder-ned":3388,"pige-sidder-ned-hoejre":3532,"pige-sidder-ned-venstre":3676,"pige-sidder-venstre":3820,"pige-staa-hoejre":3963,"pige-staa-ned":4117,"pige-staa-ned-hoejre":4274,"pige-staa-ned-venstre":4431,"pige-staa-op":4588,"pige-staa-op-hoejre":4743,"pige-staa-op-venstre":4897,"pige-staa-venstre":5051,"pige-udtryk-blink":5205,"pige-udtryk-flirt":5363,"pige-udtryk-glad":5521,"pige-udtryk-grin":5679,"pige-udtryk-ked":5837,"pige-udtryk-neutral":5995,"pige-udtryk-overrasket":6153,"pige-udtryk-smil":6311,"pige-udtryk-traet":6469,"pige-udtryk-vred":6627,"pige-vink":6785},"dreng-haar":{"dreng-gaa-hoejre-1":0,"dreng-gaa-hoejre-2":131,"dreng-gaa-hoejre-3":262,"dreng-gaa-hoejre-4":392,"dreng-gaa-hoejre-5":522,"dreng-gaa-hoejre-s1":652,"dreng-gaa-hoejre-s2":783,"dreng-gaa-ned-1":913,"dreng-gaa-ned-2":1048,"dreng-gaa-ned-3":1183,"dreng-gaa-ned-4":1318,"dreng-gaa-ned-5":1453,"dreng-gaa-op-1":1588,"dreng-gaa-op-2":1722,"dreng-gaa-op-3":1856,"dreng-gaa-op-4":1988,"dreng-gaa-op-5":2122,"dreng-gaa-op-s4":2256,"dreng-gaa-venstre-1":2390,"dreng-gaa-venstre-2":2521,"dreng-gaa-venstre-3":2651,"dreng-gaa-venstre-4":2781,"dreng-gaa-venstre-s2":2911,"dreng-sidder-ned-hoejre":3042,"dreng-sidder-ned-venstre":3181,"dreng-staa-hoejre":3320,"dreng-staa-ned":3452,"dreng-staa-ned-hoejre":3587,"dreng-staa-ned-venstre":3721,"dreng-staa-op":3856,"dreng-staa-op-hoejre":3989,"dreng-staa-op-venstre":4122,"dreng-staa-venstre":4255,"dreng-udtryk-blink":4388,"dreng-udtryk-flirt":4522,"dreng-udtryk-glad":4656,"dreng-udtryk-grin":4790,"dreng-udtryk-ked":4924,"dreng-udtryk-neutral":5058,"dreng-udtryk-overrasket":5192,"dreng-udtryk-smil":5326,"dreng-udtryk-traet":5460,"dreng-udtryk-vred":5594},"dreng-shorts":{"dreng-gaa-hoejre-1":0,"dreng-gaa-hoejre-2":131,"dreng-gaa-hoejre-3":262,"dreng-gaa-hoejre-4":392,"dreng-gaa-hoejre-s1":522,"dreng-gaa-hoejre-s2":653,"dreng-gaa-ned-1":783,"dreng-gaa-ned-2":918,"dreng-gaa-ned-3":1053,"dreng-gaa-ned-4":1188,"dreng-gaa-ned-5":1323,"dreng-gaa-op-1":1458,"dreng-gaa-op-2":1592,"dreng-gaa-op-3":1726,"dreng-gaa-op-4":1858,"dreng-gaa-op-5":1992,"dreng-gaa-op-s4":2126,"dreng-gaa-venstre-1":2260,"dreng-gaa-venstre-2":2391,"dreng-gaa-venstre-3":2521,"dreng-gaa-venstre-4":2651,"dreng-gaa-venstre-s2":2781,"dreng-sidder-ned-hoejre":2912,"dreng-sidder-ned-venstre":3051,"dreng-staa-hoejre":3190,"dreng-staa-ned":3322,"dreng-staa-ned-hoejre":3457,"dreng-staa-ned-venstre":3591,"dreng-staa-op":3726,"dreng-staa-op-hoejre":3859,"dreng-staa-op-venstre":3992,"dreng-staa-venstre":4125,"dreng-udtryk-blink":4258,"dreng-udtryk-flirt":4392,"dreng-udtryk-glad":4526,"dreng-udtryk-grin":4660,"dreng-udtryk-ked":4794,"dreng-udtryk-neutral":4928,"dreng-udtryk-overrasket":5062,"dreng-udtryk-smil":5196,"dreng-udtryk-traet":5330,"dreng-udtryk-vred":5464},"dreng-halvlangt":{"dreng-staa-ned":0,"dreng-staa-ned-hoejre":135,"dreng-staa-ned-venstre":269,"dreng-udtryk-blink":404,"dreng-udtryk-flirt":538,"dreng-udtryk-glad":672,"dreng-udtryk-grin":806,"dreng-udtryk-ked":940,"dreng-udtryk-neutral":1074,"dreng-udtryk-overrasket":1208,"dreng-udtryk-smil":1342,"dreng-udtryk-traet":1476,"dreng-udtryk-vred":1610},"dreng-langt":{"dreng-gaa-hoejre-1":0,"dreng-gaa-hoejre-2":131,"dreng-gaa-hoejre-3":262,"dreng-gaa-hoejre-4":392,"dreng-gaa-hoejre-5":522,"dreng-gaa-hoejre-s1":652,"dreng-gaa-hoejre-s2":783,"dreng-gaa-ned-1":913,"dreng-gaa-ned-2":1048,"dreng-gaa-ned-3":1183,"dreng-gaa-ned-4":1318,"dreng-gaa-ned-5":1453,"dreng-gaa-op-1":1588,"dreng-gaa-op-2":1722,"dreng-gaa-op-3":1856,"dreng-gaa-op-4":1988,"dreng-gaa-op-5":2122,"dreng-gaa-op-s4":2256,"dreng-gaa-venstre-1":2390,"dreng-gaa-venstre-2":2521,"dreng-gaa-venstre-3":2651,"dreng-gaa-venstre-4":2781,"dreng-gaa-venstre-s2":2911,"dreng-sidder-ned-hoejre":3042,"dreng-sidder-ned-venstre":3181,"dreng-staa-hoejre":3320,"dreng-staa-ned":3452,"dreng-staa-ned-hoejre":3587,"dreng-staa-ned-venstre":3721,"dreng-staa-op":3856,"dreng-staa-op-hoejre":3989,"dreng-staa-op-venstre":4122,"dreng-staa-venstre":4255,"dreng-udtryk-blink":4388,"dreng-udtryk-flirt":4522,"dreng-udtryk-glad":4656,"dreng-udtryk-grin":4790,"dreng-udtryk-ked":4924,"dreng-udtryk-neutral":5058,"dreng-udtryk-overrasket":5192,"dreng-udtryk-smil":5326,"dreng-udtryk-traet":5460,"dreng-udtryk-vred":5594}};
  const STIL_V = "2";

  const FORMER = {
    pige: [
      { id: "", navn: "👖 Lange bukser" }, { id: "shorts", navn: "🩳 Shorts" },
      { id: "nederdel", navn: "Nederdel" }, { id: "kjole", navn: "👗 Kjole" },
    ],
    dreng: [{ id: "", navn: "👖 Lange bukser" }, { id: "shorts", navn: "🩳 Shorts" }],
  };
  const FRISURER_NYE = {
    pige: [
      { id: "", navn: "Langt (dit eget)" }, { id: "ekstralangt", navn: "Ekstra langt" },
      { id: "mellem", navn: "Mellemlangt" }, { id: "skulder", navn: "Skulderlangt" },
      { id: "bob", navn: "Kort bob" }, { id: "hestehale", navn: "Hestehale" },
      { id: "fletninger", navn: "Fletninger" },
    ],
    dreng: [{ id: "", navn: "Kort (dit eget)" }, { id: "halvlangt", navn: "Halvlangt" }, { id: "langt", navn: "Langt" }],
  };
  window.TOEJ_FORMER = FORMER;
  window.NYE_FRISURER = FRISURER_NYE;

  // drengens hår kan få farve (hår-laget ligger i stil/dreng-haar.png)
  if (FIGURER.dreng.omraader.indexOf("haar") < 0) FIGURER.dreng.omraader.unshift("haar");
  FIGURER.dreng.omraadeNavne = Object.assign({}, FIGURER.dreng.omraadeNavne, { haar: "Hårfarve" });

  function ark(id) { return figurBillede("billeder/figurer/stil/" + id + ".png?v=" + STIL_V); }
  Object.keys(STIL_KORT).forEach(ark);   // hent dem med det samme

  // et lærred (canvas) er altid klar
  const klarFoer = klar;
  klar = function (b) {
    if (b && typeof HTMLCanvasElement !== "undefined" && b instanceof HTMLCanvasElement) return true;
    return klarFoer(b);
  };

  // hvilke rettelser skal på dette billede (i den rækkefølge)
  function rettelser(valg, del) {
    const type = valg.type;
    if (type !== "pige" && type !== "dreng") return [];
    const f = valg.farver && valg.farver[type] || {};
    const navn = del.fil.split("/").pop().replace(".png", "");
    const ud = [];
    if (type === "dreng") ud.push("dreng-haar");
    if (f.underdelForm) ud.push(type + "-" + f.underdelForm);
    if (f.haarStil) ud.push(type + "-" + f.haarStil);
    return ud.filter(function (id) { return STIL_KORT[id] && STIL_KORT[id][navn] !== undefined; })
      .map(function (id) { return { id: id, y: STIL_KORT[id][navn] }; });
  }

  let stilGemmer = {}, stilAntal = 0;
  const figurDelFoer = figurDel;
  figurDel = function (valg, del) {
    const d = figurDelFoer(valg, del);
    if (!d || !d.lag || d.lagX !== 0 || !klarFoer(d.lag) || !klar(d.img)) return d;
    const liste = rettelser(valg, del);
    if (!liste.length) return d;
    for (let i = 0; i < liste.length; i++) if (!klarFoer(ark(liste[i].id))) return d;
    const noegle = d.noegle + "|" + liste.map(function (r) { return r.id; }).join("+");
    let ny = stilGemmer[noegle];
    if (!ny) {
      if (stilAntal > 300) { stilGemmer = {}; stilAntal = 0; }
      const w = d.w, h = d.h;
      const img = document.createElement("canvas");
      img.width = w; img.height = h;
      const ic = img.getContext("2d");
      ic.drawImage(d.img, d.x, d.y, w, h, 0, 0, w, h);
      const lag = document.createElement("canvas");
      lag.width = w * 7; lag.height = h;
      const lc = lag.getContext("2d");
      lc.drawImage(d.lag, d.lagX, d.lagY, w * 7, h, 0, 0, w * 7, h);
      liste.forEach(function (r) {
        const a = ark(r.id);
        // først væk med det, der ændres (kolonne 0), så det nye ovenpå
        ic.globalCompositeOperation = "destination-out";
        ic.drawImage(a, 0, r.y, w, h, 0, 0, w, h);
        ic.globalCompositeOperation = "source-over";
        ic.drawImage(a, w, r.y, w, h, 0, 0, w, h);
        for (let k = 0; k < 7; k++) {
          lc.globalCompositeOperation = "destination-out";
          lc.drawImage(a, 0, r.y, w, h, k * w, 0, w, h);
          lc.globalCompositeOperation = "source-over";
          lc.drawImage(a, (k + 2) * w, r.y, w, h, k * w, 0, w, h);
        }
      });
      ic.globalCompositeOperation = "source-over";
      lc.globalCompositeOperation = "source-over";
      ny = { img: img, lag: lag };
      stilGemmer[noegle] = ny;
      stilAntal++;
    }
    return Object.assign({}, d, { img: ny.img, x: 0, y: 0, lag: ny.lag, lagX: 0, lagY: 0, noegle: noegle });
  };

  // ----- Skift udseende -----
  if (typeof SU_FANER === "undefined") return;
  const haarFane = SU_FANER.find(function (f) { return f.id === "haar"; });
  const underFane = SU_FANER.find(function (f) { return f.id === "underdel"; });
  if (haarFane) haarFane.dele.unshift({ slags: "nyfrisure", navn: "Frisurer" });
  if (underFane) underFane.dele.unshift({ slags: "form", navn: "Form" });

  function figurNu() { return kladde && (kladde.type === "pige" || kladde.type === "dreng") ? kladde.type : null; }

  const deleIFoerStor = deleI;
  deleI = function (fane) {
    return deleIFoerStor(fane).filter(function (d) {
      if (d.slags === "nyfrisure" || d.slags === "form") return !!figurNu();
      return true;
    });
  };

  // en lille figur som billede på knappen
  function figurKnap(boks, navn, aktiv, aendr, klik, udsnit) {
    const knap = document.createElement("button");
    knap.className = "su-ting-knap su-stil-knap";
    knap.classList.toggle("aktiv", aktiv);
    knap.title = navn;
    const c = document.createElement("canvas");
    c.width = 60; c.height = 92;
    const u = JSON.parse(JSON.stringify({ type: kladde.type, farver: kladde.farver || {}, ting: kladde.ting || {}, frisure: kladde.frisure || {} }));
    if (!u.farver[u.type]) u.farver[u.type] = {};
    aendr(u.farver[u.type]);
    function tegn() {
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      g.save();
      // frisurer: hoved og skuldre tæt på. Former: hele figuren
      if (udsnit === "hoved") { g.translate(c.width / 2, 138); g.scale(1, 1); }
      else { g.translate(c.width / 2, c.height - 2); g.scale(0.56, 0.56); }
      tegnMenneske(g, 0, 0, u, "ned", null, null);
      g.restore();
    }
    tegn();
    setTimeout(tegn, 400);   // igen, når billederne er hentet
    setTimeout(tegn, 1500);
    knap.appendChild(c);
    const t = document.createElement("span");
    t.className = "su-stil-navn";
    t.textContent = navn;
    knap.appendChild(t);
    knap.addEventListener("click", klik);
    boks.appendChild(knap);
    return knap;
  }

  const tegnSuTingFoerStor = tegnSuTing;
  tegnSuTing = function () {
    const d = suFane !== "gemte" && suFane !== "krop" ? valgtDel() : null;
    if (!d || (d.slags !== "nyfrisure" && d.slags !== "form")) return tegnSuTingFoerStor.apply(this, arguments);
    const boks = document.getElementById("su-ting");
    boks.innerHTML = "";
    const type = figurNu();
    const felt = d.slags === "form" ? "underdelForm" : "haarStil";
    const liste = d.slags === "form" ? FORMER[type] : FRISURER_NYE[type];
    lavTekst(boks, d.slags === "form" ?
      "Vælg om du vil have bukser, shorts, nederdel eller kjole. Farve og mønster vælger du længere nede. Kjolen får samme farve som din overdel." :
      "Vælg en frisure. Den kommer på i alle retninger, også når du går og sidder. Farven vælger du under Hårfarve.");
    const nu = mineFarver()[felt] || "";
    liste.forEach(function (st) {
      figurKnap(boks, st.navn, nu === st.id, function (f) {
        if (st.id) f[felt] = st.id; else delete f[felt];
      }, function () {
        foerAendring();
        if (st.id) mineFarver()[felt] = st.id; else delete mineFarver()[felt];
        tegnSkift();
      }, d.slags === "nyfrisure" ? "hoved" : "hel");
    });
  };

  // under hårfarven: ombre og striber med en farve mere
  const HAAR_EFFEKTER = [{ id: "", navn: "Én farve" }, { id: "ombre", navn: "Ombre (to farver)" }, { id: "striber", navn: "Striber i håret" }];
  const ANDEN_FARVE = ["#fbf3d0", "#f6d26b", "#e8b13c", "#c46a1e", "#8c2f17", "#e8a0a8", "#d96a84", "#b83d6a",
    "#9a78c8", "#5f8fcf", "#4ea8a0", "#6f9a4a", "#ffffff", "#b3b3b3", "#1a1a1a", "#c0392b"];
  const tegnPaletFoerStor = tegnPalet;
  tegnPalet = function (boks, omr) {
    tegnPaletFoerStor.apply(this, arguments);
    if (omr !== "haar" || !figurNu()) return;
    const f = mineFarver();
    const r = document.createElement("div");
    r.className = "su-moenstre";
    const t = document.createElement("span");
    t.textContent = "Effekt:";
    r.appendChild(t);
    HAAR_EFFEKTER.forEach(function (e) {
      const knap = document.createElement("button");
      knap.className = "su-chip" + ((f.haarEffekt || "") === e.id ? " aktiv" : "");
      knap.textContent = e.navn;
      knap.addEventListener("click", function () {
        foerAendring();
        if (e.id) {
          mineFarver().haarEffekt = e.id;
          if (!mineFarver().haar) mineFarver().haar = "#6b3c22";
          if (!mineFarver().haar2) mineFarver().haar2 = "#f6d26b";
        } else delete mineFarver().haarEffekt;
        tegnSkift();
      });
      r.appendChild(knap);
    });
    const foerste = boks.querySelector(".su-farve");
    if (foerste) boks.insertBefore(r, foerste); else boks.appendChild(r);
    if (!f.haarEffekt) return;
    const r2 = document.createElement("div");
    r2.className = "su-moenstre";
    const t2 = document.createElement("span");
    t2.textContent = f.haarEffekt === "ombre" ? "Farve forneden:" : "Farve på striberne:";
    r2.appendChild(t2);
    ANDEN_FARVE.forEach(function (farve) {
      const knap = document.createElement("button");
      knap.className = "su-farve su-farve-lille" + ((f.haar2 || "").toLowerCase() === farve ? " aktiv" : "");
      knap.style.background = farve;
      knap.title = farve;
      knap.addEventListener("click", function () {
        foerAendring();
        mineFarver().haar2 = farve;
        tegnSkift();
      });
      r2.appendChild(knap);
    });
    r.insertAdjacentElement("afterend", r2);
  };

  const stil = document.createElement("style");
  stil.textContent =
    ".su-stil-knap{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:2px;min-height:112px}" +
    ".su-stil-knap canvas{width:60px;height:92px;image-rendering:pixelated}" +
    ".su-stil-navn{font-size:10px;line-height:1.1;text-align:center}" +
    ".su-farve-lille{width:18px!important;height:18px!important;min-width:18px}";
  document.head.appendChild(stil);

  if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning();
})();
