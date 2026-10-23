// =============================================================
//  FIGURERNE
// =============================================================
//
//  Figurerne er dine egne tegninger, klippet ud af dit ark med 8 retninger.
//  Billederne ligger i mappen "billeder/figurer".
//
//  Retningerne er, som figuren ser ud på skærmen:
//    ned, ned-hoejre, hoejre, op-hoejre, op, op-venstre, venstre, ned-venstre
//
//  gaa:    fire billeder pr. retning, som vises efter hinanden, når figuren går.
//          Det første billede bruges også, når figuren står stille.
//  staa:   (kan udelades) ét billede pr. retning af figuren, der står stille.
//  sidder: ét billede pr. retning af figuren, der sidder.
//  anker:  det punkt på billedet (i pixels), der skal stå på gulvet.
//          For "sidder" er det numsen, som skal ramme sædet.
//  skala:  hvor store billederne tegnes. Alle billeder af samme figur har
//          samme skala, så figuren ikke skifter størrelse, når den går.
//
//  OUTFITS: Et outfit er en hel figur mere i listen herunder (fx "kvinde-sommer"),
//  med sine egne gå- og sidde-billeder i samme opstilling som de andre.
//  Alle figurer i listen kan vælges under "Krop" i "Skift udseende".
//  Ligger navnet med "mand" først, bruger outfittet drengens tøj-farver.

const FIGURER = {
  pige: {
    navn: "Pige",
    skala: 0.83,
    raekke: "alle",
    // stående: ét billede pr. retning (fra den øverste række på dit ark)
    staa: {
      "ned": { fil: "billeder/figurer/pige-staa-ned.png", anker: [25.5, 157.0], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/pige-staa-ned-hoejre.png", anker: [25.5, 157.0], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/pige-staa-hoejre.png", anker: [27.0, 154.0], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/pige-staa-op-hoejre.png", anker: [25.0, 154.0], ingenLag: true },
      "op": { fil: "billeder/figurer/pige-staa-op.png", anker: [24.0, 155.0], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/pige-staa-op-venstre.png", anker: [23.0, 154.0], ingenLag: true },
      "venstre": { fil: "billeder/figurer/pige-staa-venstre.png", anker: [23.0, 154.0], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/pige-staa-ned-venstre.png", anker: [24.0, 157.0], ingenLag: true },
    },
    // gå: arket har gang forfra, højre, bagfra og venstre. De skrå retninger låner dem.
    gaa: {
      "ned": [{ fil: "billeder/figurer/pige-gaa-ned-1.png", anker: [29.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-ned-2.png", anker: [31.0, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-ned-3.png", anker: [26.0, 158.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-ned-4.png", anker: [32.0, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-ned-5.png", anker: [30.5, 157.0], ingenLag: true }],
      "ned-hoejre": [{ fil: "billeder/figurer/pige-gaa-hoejre-1.png", anker: [35.5, 156.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-2.png", anker: [34.0, 153.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-3.png", anker: [29.5, 150.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-4.png", anker: [33.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-5.png", anker: [34.5, 151.0], ingenLag: true }],
      "hoejre": [{ fil: "billeder/figurer/pige-gaa-hoejre-1.png", anker: [35.5, 156.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-2.png", anker: [34.0, 153.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-3.png", anker: [29.5, 150.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-4.png", anker: [33.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-hoejre-5.png", anker: [34.5, 151.0], ingenLag: true }],
      "op-hoejre": [{ fil: "billeder/figurer/pige-gaa-op-1.png", anker: [31.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-2.png", anker: [20.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-3.png", anker: [32.0, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-4.png", anker: [25.0, 157.0], ingenLag: true }],
      "op": [{ fil: "billeder/figurer/pige-gaa-op-1.png", anker: [31.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-2.png", anker: [20.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-3.png", anker: [32.0, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-4.png", anker: [25.0, 157.0], ingenLag: true }],
      "op-venstre": [{ fil: "billeder/figurer/pige-gaa-op-1.png", anker: [31.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-2.png", anker: [20.5, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-3.png", anker: [32.0, 157.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-op-4.png", anker: [25.0, 157.0], ingenLag: true }],
      "venstre": [{ fil: "billeder/figurer/pige-gaa-venstre-1.png", anker: [29.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-2.png", anker: [26.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-3.png", anker: [30.0, 150.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-4.png", anker: [25.0, 155.0], ingenLag: true }],
      "ned-venstre": [{ fil: "billeder/figurer/pige-gaa-venstre-1.png", anker: [29.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-2.png", anker: [26.5, 154.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-3.png", anker: [30.0, 150.0], ingenLag: true }, { fil: "billeder/figurer/pige-gaa-venstre-4.png", anker: [25.0, 155.0], ingenLag: true }],
    },
    // udtryk og vink: hun står forfra (sat sammen af dit ark: ansigterne på hendes krop)
    poser: {
      "neutral": { fil: "billeder/figurer/pige-udtryk-neutral.png", anker: [26.0, 158.0], ingenLag: true },
      "smil": { fil: "billeder/figurer/pige-udtryk-smil.png", anker: [26.0, 158.0], ingenLag: true },
      "glad": { fil: "billeder/figurer/pige-udtryk-glad.png", anker: [26.0, 158.0], ingenLag: true },
      "grin": { fil: "billeder/figurer/pige-udtryk-grin.png", anker: [26.0, 158.0], ingenLag: true },
      "vred": { fil: "billeder/figurer/pige-udtryk-vred.png", anker: [26.0, 158.0], ingenLag: true },
      "ked": { fil: "billeder/figurer/pige-udtryk-ked.png", anker: [26.0, 158.0], ingenLag: true },
      "overrasket": { fil: "billeder/figurer/pige-udtryk-overrasket.png", anker: [26.0, 158.0], ingenLag: true },
      "blink": { fil: "billeder/figurer/pige-udtryk-blink.png", anker: [26.0, 158.0], ingenLag: true },
      "flirt": { fil: "billeder/figurer/pige-udtryk-flirt.png", anker: [26.0, 158.0], ingenLag: true },
      "traet": { fil: "billeder/figurer/pige-udtryk-traet.png", anker: [26.0, 158.0], ingenLag: true },
      "vink": { fil: "billeder/figurer/pige-vink.png", anker: [35.0, 163.0], ingenLag: true },
    },
    // sidde: stolene er fjernet; mod venstre er billedet spejlet
    sidder: {
      "ned": { fil: "billeder/figurer/pige-sidder-ned.png", anker: [42.0, 101.0], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/pige-sidder-ned-hoejre.png", anker: [41.5, 104.0], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/pige-sidder-hoejre.png", anker: [41.5, 102.0], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/pige-sidder-ned-hoejre.png", anker: [41.5, 104.0], ingenLag: true },
      "op": { fil: "billeder/figurer/pige-sidder-ned.png", anker: [42.0, 101.0], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/pige-sidder-ned-venstre.png", anker: [27.5, 104.0], ingenLag: true },
      "venstre": { fil: "billeder/figurer/pige-sidder-venstre.png", anker: [26.5, 102.0], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/pige-sidder-ned-venstre.png", anker: [27.5, 104.0], ingenLag: true },
    },
  },
  dreng: {
    navn: "Dreng",
    skala: 0.96,
    raekke: "alle",
    staa: {
      "ned": { fil: "billeder/figurer/dreng-staa-ned.png", anker: [24.0, 135.0], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/dreng-staa-ned-hoejre.png", anker: [23.5, 134.0], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/dreng-staa-hoejre.png", anker: [18.5, 132.0], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/dreng-staa-op-hoejre.png", anker: [22.0, 133.0], ingenLag: true },
      "op": { fil: "billeder/figurer/dreng-staa-op.png", anker: [23.5, 133.0], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/dreng-staa-op-venstre.png", anker: [20.0, 133.0], ingenLag: true },
      "venstre": { fil: "billeder/figurer/dreng-staa-venstre.png", anker: [19.5, 133.0], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/dreng-staa-ned-venstre.png", anker: [20.5, 135.0], ingenLag: true },
    },
    gaa: {
      "ned": [{ fil: "billeder/figurer/dreng-gaa-ned-1.png", anker: [26.5, 135.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-ned-2.png", anker: [28.5, 135.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-ned-3.png", anker: [27.0, 135.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-ned-4.png", anker: [28.5, 135.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-ned-5.png", anker: [32.0, 135.0], ingenLag: true }],
      "ned-hoejre": [{ fil: "billeder/figurer/dreng-gaa-hoejre-1.png", anker: [31.5, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-2.png", anker: [33.0, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-3.png", anker: [34.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-4.png", anker: [31.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-5.png", anker: [30.0, 130.0], ingenLag: true }],
      "hoejre": [{ fil: "billeder/figurer/dreng-gaa-hoejre-1.png", anker: [31.5, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-2.png", anker: [33.0, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-3.png", anker: [34.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-4.png", anker: [31.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-hoejre-5.png", anker: [30.0, 130.0], ingenLag: true }],
      "op-hoejre": [{ fil: "billeder/figurer/dreng-gaa-op-1.png", anker: [28.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-2.png", anker: [26.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-3.png", anker: [25.5, 132.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-4.png", anker: [27.0, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-5.png", anker: [26.5, 134.0], ingenLag: true }],
      "op": [{ fil: "billeder/figurer/dreng-gaa-op-1.png", anker: [28.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-2.png", anker: [26.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-3.png", anker: [25.5, 132.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-4.png", anker: [27.0, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-5.png", anker: [26.5, 134.0], ingenLag: true }],
      "op-venstre": [{ fil: "billeder/figurer/dreng-gaa-op-1.png", anker: [28.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-2.png", anker: [26.5, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-3.png", anker: [25.5, 132.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-4.png", anker: [27.0, 134.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-op-5.png", anker: [26.5, 134.0], ingenLag: true }],
      "venstre": [{ fil: "billeder/figurer/dreng-gaa-venstre-1.png", anker: [27.5, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-2.png", anker: [32.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-3.png", anker: [32.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-4.png", anker: [30.5, 130.0], ingenLag: true }],
      "ned-venstre": [{ fil: "billeder/figurer/dreng-gaa-venstre-1.png", anker: [27.5, 131.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-2.png", anker: [32.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-3.png", anker: [32.5, 130.0], ingenLag: true }, { fil: "billeder/figurer/dreng-gaa-venstre-4.png", anker: [30.5, 130.0], ingenLag: true }],
    },
    poser: {
      "neutral": { fil: "billeder/figurer/dreng-udtryk-neutral.png", anker: [25.0, 134.0], ingenLag: true },
      "smil": { fil: "billeder/figurer/dreng-udtryk-smil.png", anker: [25.0, 134.0], ingenLag: true },
      "glad": { fil: "billeder/figurer/dreng-udtryk-glad.png", anker: [25.0, 134.0], ingenLag: true },
      "grin": { fil: "billeder/figurer/dreng-udtryk-grin.png", anker: [25.0, 134.0], ingenLag: true },
      "vred": { fil: "billeder/figurer/dreng-udtryk-vred.png", anker: [25.0, 134.0], ingenLag: true },
      "ked": { fil: "billeder/figurer/dreng-udtryk-ked.png", anker: [25.0, 134.0], ingenLag: true },
      "overrasket": { fil: "billeder/figurer/dreng-udtryk-overrasket.png", anker: [25.0, 134.0], ingenLag: true },
      "blink": { fil: "billeder/figurer/dreng-udtryk-blink.png", anker: [25.0, 134.0], ingenLag: true },
      "flirt": { fil: "billeder/figurer/dreng-udtryk-flirt.png", anker: [25.0, 134.0], ingenLag: true },
      "traet": { fil: "billeder/figurer/dreng-udtryk-traet.png", anker: [25.0, 134.0], ingenLag: true },
    },
    // sidde: skamlerne er fjernet; mod venstre er billedet spejlet
    sidder: {
      "ned": { fil: "billeder/figurer/dreng-sidder-ned-hoejre.png", anker: [17.0, 91.0], ingenLag: true },
      "ned-hoejre": { fil: "billeder/figurer/dreng-sidder-ned-hoejre.png", anker: [17.0, 91.0], ingenLag: true },
      "hoejre": { fil: "billeder/figurer/dreng-sidder-ned-hoejre.png", anker: [17.0, 91.0], ingenLag: true },
      "op-hoejre": { fil: "billeder/figurer/dreng-sidder-ned-hoejre.png", anker: [17.0, 91.0], ingenLag: true },
      "op": { fil: "billeder/figurer/dreng-sidder-ned-venstre.png", anker: [66.0, 91.0], ingenLag: true },
      "op-venstre": { fil: "billeder/figurer/dreng-sidder-ned-venstre.png", anker: [66.0, 91.0], ingenLag: true },
      "venstre": { fil: "billeder/figurer/dreng-sidder-ned-venstre.png", anker: [66.0, 91.0], ingenLag: true },
      "ned-venstre": { fil: "billeder/figurer/dreng-sidder-ned-venstre.png", anker: [66.0, 91.0], ingenLag: true },
    },
  },
  kvinde: {
    navn: "Pige (gammel)",
    skala: 0.87,
    raekke: "alle",                   // alle hendes gå-billeder vises efter hinanden
    gaa: {
      "ned": [{ fil: "billeder/figurer/kvinde3-gaa-ned-1.png", anker: [37.5, 153.6] }, { fil: "billeder/figurer/kvinde3-gaa-ned-2.png", anker: [38.5, 152.5] }, { fil: "billeder/figurer/kvinde3-gaa-ned-3.png", anker: [38.5, 153.4] }, { fil: "billeder/figurer/kvinde3-gaa-ned-4.png", anker: [37.5, 150.2] }],
      "ned-hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-1.png", anker: [38.5, 144.2] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-2.png", anker: [39.5, 143.9] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-3.png", anker: [38.5, 143.9] }, { fil: "billeder/figurer/kvinde3-gaa-ned-hoejre-4.png", anker: [40.5, 144.8] }],
      "hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-hoejre-1.png", anker: [38.0, 140.5] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-2.png", anker: [39.0, 141.2] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-3.png", anker: [39.0, 142.5] }, { fil: "billeder/figurer/kvinde3-gaa-hoejre-4.png", anker: [39.5, 142.0] }],
      "op-hoejre": [{ fil: "billeder/figurer/kvinde3-gaa-op-hoejre-1.png", anker: [38.0, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-2.png", anker: [38.5, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-3.png", anker: [37.5, 148.9] }, { fil: "billeder/figurer/kvinde3-gaa-op-hoejre-4.png", anker: [38.0, 148.9] }],
      "op": [{ fil: "billeder/figurer/kvinde3-gaa-op-1.png", anker: [38.0, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-2.png", anker: [38.5, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-3.png", anker: [37.5, 148.9] }, { fil: "billeder/figurer/kvinde3-gaa-op-4.png", anker: [38.0, 148.9] }],
      "op-venstre": [{ fil: "billeder/figurer/kvinde3-gaa-op-venstre-1.png", anker: [38.0, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-2.png", anker: [38.5, 148.6] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-3.png", anker: [37.5, 148.9] }, { fil: "billeder/figurer/kvinde3-gaa-op-venstre-4.png", anker: [38.0, 148.9] }],
      "venstre": [{ fil: "billeder/figurer/kvinde3-gaa-venstre-1.png", anker: [36.5, 145.5] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-2.png", anker: [37.0, 145.8] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-3.png", anker: [37.5, 145.8] }, { fil: "billeder/figurer/kvinde3-gaa-venstre-4.png", anker: [36.5, 145.8] }],
      "ned-venstre": [{ fil: "billeder/figurer/kvinde3-gaa-ned-venstre-1.png", anker: [39.0, 153.7] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-2.png", anker: [38.5, 153.4] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-3.png", anker: [38.5, 153.2] }, { fil: "billeder/figurer/kvinde3-gaa-ned-venstre-4.png", anker: [38.0, 153.4] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/kvinde-sidder-0.png", anker: [33.0, 122.1] },
      "ned-hoejre": { fil: "billeder/figurer/kvinde3-stol-ned-hoejre.png", anker: [39.4, 110.0] },
      "hoejre": { fil: "billeder/figurer/kvinde-sidder-2.png", anker: [38.0, 122.1] },
      "op-hoejre": { fil: "billeder/figurer/kvinde-sidder-3.png", anker: [37.0, 122.1] },
      "op": { fil: "billeder/figurer/kvinde-sidder-4.png", anker: [33.0, 104.9] },
      "op-venstre": { fil: "billeder/figurer/kvinde-sidder-5.png", anker: [38.5, 122.1] },
      "venstre": { fil: "billeder/figurer/kvinde-sidder-6.png", anker: [39.5, 121.3] },
      "ned-venstre": { fil: "billeder/figurer/kvinde3-stol-ned-venstre.png", anker: [48.6, 110.0] },
    },
  },
  mand: {
    navn: "Dreng (gammel)",
    skala: 0.79,
    raekke: "alle",                   // alle hans gå-billeder vises efter hinanden
    gaa: {
      "ned": [{ fil: "billeder/figurer/mand3-gaa-ned-1.png", anker: [46.5, 164.2] }, { fil: "billeder/figurer/mand3-gaa-ned-2.png", anker: [48.0, 167.4] }, { fil: "billeder/figurer/mand3-gaa-ned-3.png", anker: [48.0, 167.4] }, { fil: "billeder/figurer/mand3-gaa-ned-4.png", anker: [46.5, 164.1] }],
      "ned-hoejre": [{ fil: "billeder/figurer/mand3-gaa-ned-hoejre-1.png", anker: [45.5, 156.6] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-2.png", anker: [45.0, 157.0] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-3.png", anker: [47.5, 156.6] }, { fil: "billeder/figurer/mand3-gaa-ned-hoejre-4.png", anker: [46.5, 154.6] }],
      "hoejre": [{ fil: "billeder/figurer/mand3-gaa-hoejre-1.png", anker: [45.5, 154.4] }, { fil: "billeder/figurer/mand3-gaa-hoejre-2.png", anker: [46.0, 154.7] }, { fil: "billeder/figurer/mand3-gaa-hoejre-3.png", anker: [46.5, 154.6] }, { fil: "billeder/figurer/mand3-gaa-hoejre-4.png", anker: [46.5, 153.0] }],
      "op-hoejre": [{ fil: "billeder/figurer/mand3-gaa-op-hoejre-1.png", anker: [45.5, 151.7] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-2.png", anker: [46.0, 150.5] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-3.png", anker: [46.5, 152.2] }, { fil: "billeder/figurer/mand3-gaa-op-hoejre-4.png", anker: [45.5, 152.5] }],
      "op": [{ fil: "billeder/figurer/mand3-gaa-op-1.png", anker: [46.0, 157.7] }, { fil: "billeder/figurer/mand3-gaa-op-2.png", anker: [45.0, 156.8] }, { fil: "billeder/figurer/mand3-gaa-op-3.png", anker: [45.0, 156.4] }, { fil: "billeder/figurer/mand3-gaa-op-4.png", anker: [44.0, 157.7] }],
      "op-venstre": [{ fil: "billeder/figurer/mand3-gaa-op-venstre-1.png", anker: [45.5, 151.7] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-2.png", anker: [45.0, 150.5] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-3.png", anker: [46.5, 152.2] }, { fil: "billeder/figurer/mand3-gaa-op-venstre-4.png", anker: [45.5, 152.5] }],
      "venstre": [{ fil: "billeder/figurer/mand3-gaa-venstre-1.png", anker: [46.5, 157.8] }, { fil: "billeder/figurer/mand3-gaa-venstre-2.png", anker: [47.0, 161.0] }, { fil: "billeder/figurer/mand3-gaa-venstre-3.png", anker: [48.5, 161.3] }, { fil: "billeder/figurer/mand3-gaa-venstre-4.png", anker: [46.5, 157.9] }],
      "ned-venstre": [{ fil: "billeder/figurer/mand3-gaa-ned-venstre-1.png", anker: [47.0, 170.7] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-2.png", anker: [48.0, 169.7] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-3.png", anker: [47.0, 170.5] }, { fil: "billeder/figurer/mand3-gaa-ned-venstre-4.png", anker: [47.0, 172.5] }],
    },
    sidder: {
      "ned": { fil: "billeder/figurer/mand-sidder-0.png", anker: [41.0, 134.2] },
      "ned-hoejre": { fil: "billeder/figurer/mand3-stol-ned-hoejre.png", anker: [45.4, 129.5] },
      "hoejre": { fil: "billeder/figurer/mand-sidder-2.png", anker: [43.5, 131.6] },
      "op-hoejre": { fil: "billeder/figurer/mand-sidder-3.png", anker: [44.5, 130.7] },
      "op": { fil: "billeder/figurer/mand-sidder-4.png", anker: [40.0, 114.4] },
      "op-venstre": { fil: "billeder/figurer/mand-sidder-5.png", anker: [47.0, 130.7] },
      "venstre": { fil: "billeder/figurer/mand-sidder-6.png", anker: [47.0, 128.1] },
      "ned-venstre": { fil: "billeder/figurer/mand3-stol-ned-venstre.png", anker: [55.6, 129.5] },
    },
  },
};

// Rækkefølgen af gå-billederne: 1, 2, 3, 2, 1, 2, 3 ...
// (står der raekke: "alle" ved en figur, vises alle dens billeder efter hinanden)
const GAA_RAEKKE = [0, 1, 2, 1];


// =============================================================
//  Hent billeder
// =============================================================
const figurBilleder = {};

function figurBillede(sti) {
  if (!sti) return null;
  if (!figurBilleder[sti]) {
    const b = new Image();
    b.onload = function () { if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning(); };
    b.onerror = function () { console.warn("Kunne ikke finde billedet: " + sti); };
    b.src = sti;
    figurBilleder[sti] = b;
  }
  return figurBilleder[sti];
}

function klar(b) {
  return b && b.complete && b.naturalWidth > 0;
}

// Hent alle billederne med det samme, så de er klar, når figuren begynder at gå
for (const id in FIGURER) {
  const f = FIGURER[id];
  for (const r in f.gaa) f.gaa[r].forEach(function (b) { figurBillede(b.fil); });
  for (const r in f.sidder) figurBillede(f.sidder[r].fil);
}


// =============================================================
//  Tegn en figur
//    x, y:      hvor fødderne står på skærmen
//    valg:      { type: "kvinde" eller "mand" }
//    retning:   fx "ned-hoejre" (se listen øverst)
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
//    sidde:     null, eller { hoejde: sædets højde i pixels }
// =============================================================
function tegnMenneske(c, x, y, valg, retning, gaarTrin, sidde) {
  const f = FIGURER[valg.type] || FIGURER.kvinde;
  let del;
  if (sidde) {
    del = f.sidder[retning] || f.sidder.ned;
    y -= sidde.hoejde;   // numsen sidder på sædet
  } else {
    const billeder = f.gaa[retning] || f.gaa.ned;
    if (gaarTrin === null && valg.pose && f.poser && f.poser[valg.pose]) {
      del = f.poser[valg.pose];          // et ansigtsudtryk eller et vink (js/udtryk.js)
    } else if (gaarTrin === null) {
      del = (f.staa && f.staa[retning]) || billeder[0];
    } else if (f.raekke === "alle") {
      del = billeder[Math.floor(gaarTrin) % billeder.length];
    } else {
      del = billeder[GAA_RAEKKE[Math.floor(gaarTrin) % GAA_RAEKKE.length]];
    }
  }
  const d = figurDel(valg, del);
  if (!d) return;
  const s = f.skala;
  const farvet = farvetFigur(d, valg.farver ? valg.farver[valg.type] : null);
  const fx = Math.round(x - d.ax * s), fy = Math.round(y - d.ay * s);
  if (farvet) c.drawImage(farvet, fx, fy, d.w * s, d.h * s);
  else c.drawImage(d.img, d.x, d.y, d.w, d.h, fx, fy, d.w * s, d.h * s);
}

// Den valgte frisure (fra js/frisurer.js), eller null for den oprindelige
function valgtFrisure(valg) {
  const id = valg.frisure ? valg.frisure[valg.type] : null;
  if (!id || typeof FRISURER === "undefined" || !FRISURER[valg.type]) return null;
  return FRISURER[valg.type].stile.find(function (st) { return st.id === id; }) || null;
}

// Hvor billedet af figuren skal tages fra: det almindelige billede,
// eller (med en ny frisure) det store frisure-billede.
//   img, x, y, w, h: billedet og stykket af det
//   ax, ay:          ankeret (fødderne / numsen) i stykket
//   lag, lagX, lagY: farvelagene (område nr. i ligger ved lagX + i * w)
function figurDel(valg, del) {
  const fr = valgtFrisure(valg);
  if (fr && fr.felter[del.fil] !== undefined) {
    const atlas = figurBillede(fr.fil);
    if (klar(atlas)) {
      const F = FRISURER[valg.type];
      const y = fr.felter[del.fil] * F.ch;
      return { img: atlas, x: 0, y: y, w: F.cw, h: F.ch, ax: del.anker[0] + F.pad[0], ay: del.anker[1] + F.pad[1],
        lag: atlas, lagX: F.cw, lagY: y, noegle: fr.id + del.fil, knae: flytKnae(knaeFor(del.fil), F.pad) };
    }
  }
  const b = figurBillede(del.fil);
  if (!klar(b)) return null;
  return { img: b, x: 0, y: 0, w: b.naturalWidth, h: b.naturalHeight, ax: del.anker[0], ay: del.anker[1],
    lag: del.ingenLag ? null : figurBillede(del.fil.replace("billeder/figurer/", "billeder/figurer/farvelag/")), lagX: 0, lagY: 0, noegle: del.fil,
    knae: knaeFor(del.fil) };
}

// Knæet (til shorts): et tal er knæets højde, { x, mod } er knæet på en figur der sidder
function knaeFor(fil) {
  return typeof BUKSE_KNAE !== "undefined" && BUKSE_KNAE[fil] !== undefined ? BUKSE_KNAE[fil] : 9999;
}

function flytKnae(k, pad) {
  if (typeof k === "number") return k + pad[1];
  return { x: k.x + pad[0], mod: k.mod };
}


// =============================================================
//  Farver på figuren (fra "Skift udseende")
//  Hvert billede af figuren har et farvelag i billeder/figurer/farvelag.
//  Farvelaget er delt op i områder, som ligger ved siden af hinanden:
// =============================================================
const FARVE_OMRAADER = ["hud", "haar", "vest", "skjorte", "underdel", "stroemper", "sko"];
let farveGemmer = {};
let farveAntal = 0;

// Giver et nyt billede, hvor de valgte områder har fået deres farve.
// Er der ingen farver valgt, eller er farvelaget ikke hentet endnu, gives null.
function farvetFigur(d, farver) {
  if (!farver) return null;
  const bukser = farver.bukser && typeof BUKSER !== "undefined" ?
    BUKSER.find(function (b) { return b.id === farver.bukser; }) : null;
  const brugte = FARVE_OMRAADER.filter(function (o) {
    return farver[o] || (bukser && (o === "underdel" || o === "stroemper"));
  });
  if (brugte.length === 0) return null;
  if (!klar(d.lag)) return null;

  const noegle = d.noegle + "|" + (bukser ? bukser.id : "") + "|" + brugte.map(function (o) { return o + farver[o]; }).join();
  if (farveGemmer[noegle]) return farveGemmer[noegle];
  if (farveAntal > 400) { farveGemmer = {}; farveAntal = 0; }

  const w = d.w, h = d.h;
  const ud = document.createElement("canvas");
  ud.width = w; ud.height = h;
  const uc = ud.getContext("2d");
  uc.drawImage(d.img, d.x, d.y, w, h, 0, 0, w, h);
  const hj = document.createElement("canvas");
  hj.width = w; hj.height = h;
  const hc = hj.getContext("2d");
  const hud = farver.hud || "#f2cfae";

  // farv ét område af figuren (evt. kun et stykke af det: firkanten [x, y, bredde, højde])
  function farvOmraade(o, fyld, stykke) {
    stykke = stykke || [0, 0, w, h];
    const lx = d.lagX + FARVE_OMRAADER.indexOf(o) * w;
    hc.save();
    hc.globalCompositeOperation = "source-over";
    hc.clearRect(0, 0, w, h);
    hc.beginPath();
    hc.rect(stykke[0], stykke[1], stykke[2], stykke[3]);
    hc.clip();
    hc.drawImage(d.lag, lx, d.lagY, w, h, 0, 0, w, h);   // skyggerne i gråt
    hc.globalCompositeOperation = "multiply";
    hc.fillStyle = fyld;                                 // gang med farven (eller stoffet)
    hc.fillRect(0, 0, w, h);
    hc.globalCompositeOperation = "destination-in";
    hc.drawImage(d.lag, lx, d.lagY, w, h, 0, 0, w, h);   // kun inden for området
    hc.restore();
    uc.drawImage(hj, 0, 0);
  }

  brugte.forEach(function (o) {
    if (bukser && o === "underdel") {
      const stof = bukseStof(hc, bukser);
      if (bukser.shorts) {
        // shorts: stof over knæet, bare ben under knæet
        const k = d.knae;
        let stofDel, benDel;
        if (typeof k === "number") { stofDel = [0, 0, w, k]; benDel = [0, k, w, h - k]; }
        else if (k.mod > 0) { stofDel = [0, 0, k.x, h]; benDel = [k.x, 0, w - k.x, h]; }
        else { stofDel = [k.x, 0, w - k.x, h]; benDel = [0, 0, k.x, h]; }
        farvOmraade(o, stof, stofDel);
        farvOmraade(o, hud, benDel);
      } else {
        farvOmraade(o, stof);
      }
    } else if (bukser && o === "stroemper") {
      farvOmraade(o, bukser.shorts ? hud : bukseStof(hc, bukser));
    } else {
      farvOmraade(o, farver[o]);
    }
  });
  farveGemmer[noegle] = ud;
  farveAntal++;
  return ud;
}

// Stoffet til bukserne: ensfarvet, eller et lille mønster der gentages
const bukseStoffer = {};
function bukseStof(c, bukser) {
  if (!bukser.moenster) return bukser.farve;
  if (!bukseStoffer[bukser.id]) {
    const t = document.createElement("canvas");
    t.width = 4; t.height = 4;
    const tc = t.getContext("2d");
    tc.fillStyle = bukser.farve;
    tc.fillRect(0, 0, 4, 4);
    tc.fillStyle = "rgba(255, 255, 255, 0.16)";
    if (bukser.moenster === "twill") {
      for (let i = 0; i < 4; i++) tc.fillRect(i, 3 - i, 1, 1);    // skrå striber som cowboystof
    } else {
      tc.fillRect(0, 0, 1, 1);                                     // små prikker: groft stof
      tc.fillStyle = "rgba(0, 0, 0, 0.15)";
      tc.fillRect(2, 2, 1, 1);
    }
    bukseStoffer[bukser.id] = t;
  }
  return c.createPattern(bukseStoffer[bukser.id], "repeat");
}

// Hvor høj figuren er på skærmen (bruges til navneskiltet)
function figurHoejde(valg) {
  const f = FIGURER[valg.type] || FIGURER.kvinde;
  return f.gaa.ned[0].anker[1] * f.skala;
}

// Alle figurer, man kan vælge i Garderoben: { id: "navn" }
function alleFigurer() {
  const liste = {};
  for (const id in FIGURER) liste[id] = FIGURER[id].navn;
  return liste;
}
