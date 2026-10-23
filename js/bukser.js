// =============================================================
//  BUKSER — bukser der sidder på selve figuren.
//  Bukserne farver figurens egne ben (nederdel/bukser og strømper),
//  så de følger figuren i alle retninger, når den går og sidder.
//  Ikonerne er fra dine tøj-ark, og farven passer til ikonet.
//    moenster: "twill" (cowboystof) eller "prik" (groft stof), ellers ensfarvet
//    shorts:   benene under knæet bliver bare
//  BUKSE_KNAE: hvor knæet er på hvert billede (til shorts). Et tal er knæets højde;
//  når figuren sidder, er knæet { x, mod }: benene peger mod højre (1) eller venstre (-1).
// =============================================================

const BUKSER = [
 {
  "id": "jeans",
  "navn": "Jeans",
  "ikon": "billeder/toej/dreng/underdel-02.png",
  "farve": "#4f72a8",
  "moenster": "twill",
  "shorts": false
 },
 {
  "id": "sorte",
  "navn": "Pæne sorte",
  "ikon": "billeder/toej/dreng/underdel-05.png",
  "farve": "#2e2726",
  "moenster": null,
  "shorts": false
 },
 {
  "id": "chinos",
  "navn": "Chinos",
  "ikon": "billeder/toej/dreng/underdel-04.png",
  "farve": "#d6be96",
  "moenster": null,
  "shorts": false
 },
 {
  "id": "cargo",
  "navn": "Cargo",
  "ikon": "billeder/toej/pige/underdel-31.png",
  "farve": "#62673f",
  "moenster": "prik",
  "shorts": false
 },
 {
  "id": "roede",
  "navn": "Røde",
  "ikon": "billeder/toej/dreng/underdel-14.png",
  "farve": "#962a35",
  "moenster": null,
  "shorts": false
 },
 {
  "id": "lyseroede",
  "navn": "Lyserøde",
  "ikon": "billeder/toej/pige/underdel-32.png",
  "farve": "#ec9fb4",
  "moenster": null,
  "shorts": false
 },
 {
  "id": "shorts",
  "navn": "Cowboyshorts",
  "ikon": "billeder/toej/dreng/underdel-15.png",
  "farve": "#5a86b8",
  "moenster": "twill",
  "shorts": true
 }
];

const BUKSE_KNAE = {"billeder/figurer/kvinde3-gaa-hoejre-1.png": 9999, "billeder/figurer/kvinde3-gaa-hoejre-2.png": 9999, "billeder/figurer/kvinde3-gaa-hoejre-3.png": 9999, "billeder/figurer/kvinde3-gaa-hoejre-4.png": 9999, "billeder/figurer/kvinde3-gaa-ned-1.png": 9999, "billeder/figurer/kvinde3-gaa-ned-2.png": 9999, "billeder/figurer/kvinde3-gaa-ned-3.png": 9999, "billeder/figurer/kvinde3-gaa-ned-4.png": 9999, "billeder/figurer/kvinde3-gaa-ned-hoejre-1.png": 9999, "billeder/figurer/kvinde3-gaa-ned-hoejre-2.png": 9999, "billeder/figurer/kvinde3-gaa-ned-hoejre-3.png": 9999, "billeder/figurer/kvinde3-gaa-ned-hoejre-4.png": 9999, "billeder/figurer/kvinde3-gaa-ned-venstre-1.png": 9999, "billeder/figurer/kvinde3-gaa-ned-venstre-2.png": 9999, "billeder/figurer/kvinde3-gaa-ned-venstre-3.png": 9999, "billeder/figurer/kvinde3-gaa-ned-venstre-4.png": 9999, "billeder/figurer/kvinde3-gaa-op-1.png": 9999, "billeder/figurer/kvinde3-gaa-op-2.png": 9999, "billeder/figurer/kvinde3-gaa-op-3.png": 9999, "billeder/figurer/kvinde3-gaa-op-4.png": 9999, "billeder/figurer/kvinde3-gaa-op-hoejre-1.png": 9999, "billeder/figurer/kvinde3-gaa-op-hoejre-2.png": 9999, "billeder/figurer/kvinde3-gaa-op-hoejre-3.png": 9999, "billeder/figurer/kvinde3-gaa-op-hoejre-4.png": 9999, "billeder/figurer/kvinde3-gaa-op-venstre-1.png": 9999, "billeder/figurer/kvinde3-gaa-op-venstre-2.png": 9999, "billeder/figurer/kvinde3-gaa-op-venstre-3.png": 9999, "billeder/figurer/kvinde3-gaa-op-venstre-4.png": 9999, "billeder/figurer/kvinde3-gaa-venstre-1.png": 9999, "billeder/figurer/kvinde3-gaa-venstre-2.png": 9999, "billeder/figurer/kvinde3-gaa-venstre-3.png": 9999, "billeder/figurer/kvinde3-gaa-venstre-4.png": 9999, "billeder/figurer/kvinde3-stol-ned-hoejre.png": {"x": 63, "mod": 1}, "billeder/figurer/kvinde3-stol-ned-venstre.png": {"x": 24, "mod": -1}, "billeder/figurer/mand3-gaa-hoejre-1.png": 128, "billeder/figurer/mand3-gaa-hoejre-2.png": 128, "billeder/figurer/mand3-gaa-hoejre-3.png": 130, "billeder/figurer/mand3-gaa-hoejre-4.png": 128, "billeder/figurer/mand3-gaa-ned-1.png": 136, "billeder/figurer/mand3-gaa-ned-2.png": 137, "billeder/figurer/mand3-gaa-ned-3.png": 138, "billeder/figurer/mand3-gaa-ned-4.png": 138, "billeder/figurer/mand3-gaa-ned-hoejre-1.png": 132, "billeder/figurer/mand3-gaa-ned-hoejre-2.png": 131, "billeder/figurer/mand3-gaa-ned-hoejre-3.png": 132, "billeder/figurer/mand3-gaa-ned-hoejre-4.png": 130, "billeder/figurer/mand3-gaa-ned-venstre-1.png": 143, "billeder/figurer/mand3-gaa-ned-venstre-2.png": 142, "billeder/figurer/mand3-gaa-ned-venstre-3.png": 141, "billeder/figurer/mand3-gaa-ned-venstre-4.png": 143, "billeder/figurer/mand3-gaa-op-1.png": 131, "billeder/figurer/mand3-gaa-op-2.png": 129, "billeder/figurer/mand3-gaa-op-3.png": 130, "billeder/figurer/mand3-gaa-op-4.png": 131, "billeder/figurer/mand3-gaa-op-hoejre-1.png": 127, "billeder/figurer/mand3-gaa-op-hoejre-2.png": 125, "billeder/figurer/mand3-gaa-op-hoejre-3.png": 127, "billeder/figurer/mand3-gaa-op-hoejre-4.png": 127, "billeder/figurer/mand3-gaa-op-venstre-1.png": 127, "billeder/figurer/mand3-gaa-op-venstre-2.png": 125, "billeder/figurer/mand3-gaa-op-venstre-3.png": 127, "billeder/figurer/mand3-gaa-op-venstre-4.png": 127, "billeder/figurer/mand3-gaa-venstre-1.png": 133, "billeder/figurer/mand3-gaa-venstre-2.png": 135, "billeder/figurer/mand3-gaa-venstre-3.png": 135, "billeder/figurer/mand3-gaa-venstre-4.png": 133, "billeder/figurer/mand3-stol-ned-hoejre.png": {"x": 71, "mod": 1}, "billeder/figurer/mand3-stol-ned-venstre.png": {"x": 29, "mod": -1}};
