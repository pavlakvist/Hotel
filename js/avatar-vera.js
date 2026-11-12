// =============================================================
//  🧍‍♀️ Vera – den nye 3D-figur (version 3 fra Blender, 12/11)
//  Figuren er en rigtig 3D-model, som er renderet til billeder i 8 retninger:
//  står stille, går (8 billeder pr. retning) og sidder.
//  Håret er et lag for sig (billeder/figurer/vera/haar-<frisure>/), så frisuren
//  kan skiftes i garderoben under "Hår", og håret kan få en anden farve.
//  Vælges under "Krop" i garderoben. Alle spillere (og ejeren) kan vælge hende.
//  Billederne: billeder/figurer/vera/. Blender-filen og scripts: projektmappen vera-avatar/version-3.
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke røres.)
// =============================================================
(function () {
  if (typeof FIGURER === "undefined" || FIGURER.vera) return;
  const M = "billeder/figurer/vera/";

  FIGURER.vera = {
    navn: "Vera",
    skala: 0.529,
    raekke: "alle",                 // alle 8 gå-billeder vises efter hinanden
    omraader: ["haar"],             // kun håret kan få en anden farve (tøjet er en del af 3D-modellen)
    omraadeNavne: { haar: "Hårfarve" },
    ingenBukser: true,
    haarstile: [
    { id: "knold", navn: "Knold", mappe: M + "haar-knold/", pad: 0, ikon: M + "ikon-knold.png" },
    { id: "langt", navn: "Langt løst hår", mappe: M + "haar-langt/", pad: 0, ikon: M + "ikon-langt.png" },
    { id: "hestehale", navn: "Hestehale", mappe: M + "haar-hestehale/", pad: 0, ikon: M + "ikon-hestehale.png" }
    ],
    staa: {
    "ned": { fil: M + "vera-staa-ned.png", anker: [87.0, 262.3], ingenLag: true },
    "ned-hoejre": { fil: M + "vera-staa-ned-hoejre.png", anker: [87.0, 262.3], ingenLag: true },
    "hoejre": { fil: M + "vera-staa-hoejre.png", anker: [87.0, 262.3], ingenLag: true },
    "op-hoejre": { fil: M + "vera-staa-op-hoejre.png", anker: [87.0, 262.3], ingenLag: true },
    "op": { fil: M + "vera-staa-op.png", anker: [87.0, 262.3], ingenLag: true },
    "op-venstre": { fil: M + "vera-staa-op-venstre.png", anker: [87.0, 262.3], ingenLag: true },
    "venstre": { fil: M + "vera-staa-venstre.png", anker: [87.0, 262.3], ingenLag: true },
    "ned-venstre": { fil: M + "vera-staa-ned-venstre.png", anker: [87.0, 262.3], ingenLag: true }
    },
    gaa: {
    "ned": [{ fil: M + "vera-gaa-ned-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "ned-hoejre": [{ fil: M + "vera-gaa-ned-hoejre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-hoejre-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "hoejre": [{ fil: M + "vera-gaa-hoejre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-hoejre-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "op-hoejre": [{ fil: M + "vera-gaa-op-hoejre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-hoejre-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "op": [{ fil: M + "vera-gaa-op-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "op-venstre": [{ fil: M + "vera-gaa-op-venstre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-op-venstre-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "venstre": [{ fil: M + "vera-gaa-venstre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-venstre-8.png", anker: [87.0, 262.3], ingenLag: true }],
    "ned-venstre": [{ fil: M + "vera-gaa-ned-venstre-1.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-2.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-3.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-4.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-5.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-6.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-7.png", anker: [87.0, 262.3], ingenLag: true }, { fil: M + "vera-gaa-ned-venstre-8.png", anker: [87.0, 262.3], ingenLag: true }]
    },
    sidder: {
    "ned": { fil: M + "vera-sidder-ned.png", anker: [87.0, 153.4], ingenLag: true },
    "ned-hoejre": { fil: M + "vera-sidder-ned-hoejre.png", anker: [88.8, 153.1], ingenLag: true },
    "hoejre": { fil: M + "vera-sidder-hoejre.png", anker: [89.6, 152.2], ingenLag: true },
    "op-hoejre": { fil: M + "vera-sidder-op-hoejre.png", anker: [88.8, 151.3], ingenLag: true },
    "op": { fil: M + "vera-sidder-op.png", anker: [87.0, 150.9], ingenLag: true },
    "op-venstre": { fil: M + "vera-sidder-op-venstre.png", anker: [85.2, 151.3], ingenLag: true },
    "venstre": { fil: M + "vera-sidder-venstre.png", anker: [84.4, 152.2], ingenLag: true },
    "ned-venstre": { fil: M + "vera-sidder-ned-venstre.png", anker: [85.2, 153.1], ingenLag: true }
    },
  };

  // hent billederne med det samme, så hun er klar, når hun går og sætter sig
  const f = FIGURER.vera;
  const filer = [];
  for (const r in f.staa) filer.push(f.staa[r].fil);
  for (const r in f.gaa) f.gaa[r].forEach(function (b) { filer.push(b.fil); });
  for (const r in f.sidder) filer.push(f.sidder[r].fil);
  filer.forEach(function (fil) {
    figurBillede(fil);
    f.haarstile.forEach(function (st) { figurBillede(st.mappe + fil.split("/").pop()); });
  });

  // 8 gå-billeder er ét helt skridt-par, så benene skal skifte dobbelt så hurtigt som de 4 billeder hos pigen
  const tegnFoer = tegnMenneske;
  tegnMenneske = function (c, x, y, valg, retning, gaarTrin, sidde) {
    if (valg && valg.type === "vera" && gaarTrin !== null && gaarTrin !== undefined) {
      const args = Array.prototype.slice.call(arguments);
      args[5] = gaarTrin * 2;
      return tegnFoer.apply(this, args);
    }
    return tegnFoer.apply(this, arguments);
  };
  tegnMenneske.saeder = tegnFoer.saeder;
  tegnMenneske.skelet = tegnFoer.skelet;

  // Har man gemt Vera som sin figur, så tag hende på igen
  // (spillet læser det gemte udseende, før denne fil er hentet)
  try {
    const gemt = JSON.parse(localStorage.getItem("mit-hotel-figur-5"));
    if (gemt && gemt.type === "vera" && typeof garderobe !== "undefined" && garderobe.type !== "vera") {
      garderobe.type = "vera";
      if (gemt.ting) garderobe.ting = gemt.ting;
      if (gemt.farver) Object.assign(garderobe.farver, gemt.farver);
    }
  } catch (e) {}
  if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning();
})();
