// =============================================================
//  🧍‍♀️ Vera – 3D-figuren (version 4 fra Blender, 13/11)
//  Figuren er en rigtig 3D-model, som er renderet til billeder i 8 retninger:
//  står stille, går (8 billeder pr. retning) og sidder.
//  NYT i version 4:
//   - 8 forskellige ansigter (Vera, Amara, Mei, Freja, Zoe, Lina, Nora, Sofia).
//     Vælges under "Krop" i garderoben, når Vera er valgt.
//     Billederne: billeder/figurer/vera/ansigt-<navn>/ (Vera selv ligger direkte i vera/).
//   - 10 frisurer, hver et lag for sig (billeder/figurer/vera/haar-<frisure>/).
//     Vælges under "Hår", og håret kan få en anden farve.
//  Ansigt og frisure passer sammen i alle kombinationer (samme hoved og skelet).
//  Billederne hentes først, når nogen bruger dem, så spillet ikke bliver tungt.
//  Blender-filen og scripts: projektmappen vera-avatar/version-4.
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke røres.)
// =============================================================
(function () {
  if (typeof FIGURER === "undefined" || FIGURER.vera) return;
  const M = "billeder/figurer/vera/";

  FIGURER.vera = {
    navn: "Vera",
    skala: 0.531,
    raekke: "alle",                 // alle 8 gå-billeder vises efter hinanden
    omraader: ["haar"],             // kun håret kan få en anden farve (tøjet er en del af 3D-modellen)
    omraadeNavne: { haar: "Hårfarve" },
    ingenBukser: true,
    haarstile: [
      { id: "knold", navn: "Knold", mappe: M + "haar-knold/", pad: 0, ikon: M + "ikon-knold.png" },
      { id: "langt", navn: "Langt glat hår", mappe: M + "haar-langt/", pad: 0, ikon: M + "ikon-langt.png" },
      { id: "langt_boelget", navn: "Langt bølget hår", mappe: M + "haar-langt_boelget/", pad: 0, ikon: M + "ikon-langt_boelget.png" },
      { id: "page", navn: "Kort page", mappe: M + "haar-page/", pad: 0, ikon: M + "ikon-page.png" },
      { id: "hestehale", navn: "Hestehale", mappe: M + "haar-hestehale/", pad: 0, ikon: M + "ikon-hestehale.png" },
      { id: "to_fletninger", navn: "To fletninger", mappe: M + "haar-to_fletninger/", pad: 0, ikon: M + "ikon-to_fletninger.png" },
      { id: "enkelt_fletning", navn: "Enkelt fletning", mappe: M + "haar-enkelt_fletning/", pad: 0, ikon: M + "ikon-enkelt_fletning.png" },
      { id: "kort_moderne", navn: "Kort moderne", mappe: M + "haar-kort_moderne/", pad: 0, ikon: M + "ikon-kort_moderne.png" },
      { id: "skulderlangt", navn: "Skulderlangt hår", mappe: M + "haar-skulderlangt/", pad: 0, ikon: M + "ikon-skulderlangt.png" },
      { id: "opsat", navn: "Opsat hår", mappe: M + "haar-opsat/", pad: 0, ikon: M + "ikon-opsat.png" }
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

  // De 8 ansigter (samme krop og skelet – kun ansigt, hudfarve og makeup er forskellige)
  const ANSIGTER = [
    { id: "vera", navn: "Vera", tekst: "Den originale fra version 3: venlig og stilfuld", mappe: M, ikon: M + "ikon-ansigt-vera.png" },
    { id: "amara", navn: "Amara", tekst: "Glad og varm, griner meget", mappe: M + "ansigt-amara/", ikon: M + "ikon-ansigt-amara.png" },
    { id: "mei", navn: "Mei", tekst: "Rolig og skarp, lidt kølig", mappe: M + "ansigt-mei/", ikon: M + "ikon-ansigt-mei.png" },
    { id: "freja", navn: "Freja", tekst: "Drømmende og blid", mappe: M + "ansigt-freja/", ikon: M + "ikon-ansigt-freja.png" },
    { id: "zoe", navn: "Zoe", tekst: "Selvsikker og frisk i replikken", mappe: M + "ansigt-zoe/", ikon: M + "ikon-ansigt-zoe.png" },
    { id: "lina", navn: "Lina", tekst: "Sød og nysgerrig", mappe: M + "ansigt-lina/", ikon: M + "ikon-ansigt-lina.png" },
    { id: "nora", navn: "Nora", tekst: "Elegant og eftertænksom", mappe: M + "ansigt-nora/", ikon: M + "ikon-ansigt-nora.png" },
    { id: "sofia", navn: "Sofia", tekst: "Varm, sjov og snakkesalig", mappe: M + "ansigt-sofia/", ikon: M + "ikon-ansigt-sofia.png" }
  ];
  FIGURER.vera.ansigter = ANSIGTER;

  const f = FIGURER.vera;
  const alleFiler = [];
  for (const r in f.staa) alleFiler.push(f.staa[r].fil);
  for (const r in f.gaa) f.gaa[r].forEach(function (b) { alleFiler.push(b.fil); });
  for (const r in f.sidder) alleFiler.push(f.sidder[r].fil);
  const navne = alleFiler.map(function (fil) { return fil.split("/").pop(); });

  // hent alle billeder i en mappe (et ansigt eller en frisure) første gang, den bruges
  const hentet = {};
  function hentMappe(mappe) {
    if (hentet[mappe]) return;
    hentet[mappe] = true;
    navne.forEach(function (n) { figurBillede(mappe + n); });
  }

  function valgtAnsigt(valg) {
    const t = valg && valg.ting && valg.ting.vera;
    const id = t && t.ansigt;
    return ANSIGTER.find(function (a) { return a.id === id; }) || ANSIGTER[0];
  }

  // Vera selv hentes med det samme (som før)
  hentMappe(M);

  // Kroppen tegnes med det valgte ansigt: samme billednavn, bare fra ansigtets mappe
  const figurDelFoer = figurDel;
  figurDel = function (valg, del) {
    if (valg && valg.type === "vera" && del && del.fil) {
      const a = valgtAnsigt(valg);
      if (a.mappe !== M) {
        hentMappe(a.mappe);
        const ny = Object.assign({}, del, { fil: a.mappe + del.fil.split("/").pop() });
        const d = figurDelFoer(valg, ny);
        if (d) return d;                 // ellers Vera, indtil ansigtet er hentet
      }
    }
    return figurDelFoer(valg, del);
  };

  // Hent hele frisuren første gang den bruges
  const valgtHaarstilFoer = valgtHaarstil;
  valgtHaarstil = function (fig, valg) {
    const st = valgtHaarstilFoer(fig, valg);
    if (st && fig === f) hentMappe(st.mappe);
    return st;
  };

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

  // Garderoben: under "Krop" kan man vælge Veras ansigt, når Vera er valgt
  if (typeof tegnSuTing === "function") {
    const tegnSuTingFoer = tegnSuTing;
    tegnSuTing = function () {
      const r = tegnSuTingFoer.apply(this, arguments);
      try {
        if (suFane === "krop" && kladde && kladde.type === "vera") {
          const boks = document.getElementById("su-ting");
          const nu = valgtAnsigt(kladde);
          const tekst = document.createElement("p");
          tekst.className = "su-tekst";
          tekst.style.cssText = "width:100%;grid-column:1 / -1;margin:10px 0 4px;font-weight:bold";
          tekst.textContent = "Veras ansigt: " + nu.navn + " – " + nu.tekst;
          boks.appendChild(tekst);
          ANSIGTER.forEach(function (a) {
            const knap = lavBilledKnap(boks, a.ikon, a === nu, function () {
              foerAendring();
              mineTing().ansigt = a.id;
              hentMappe(a.mappe);
              tegnSkift();
            });
            knap.title = a.navn + " – " + a.tekst;
          });
        }
      } catch (e) { console.warn("Vera-ansigter:", e); }
      return r;
    };
  }

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
