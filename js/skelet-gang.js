// =============================================================
//  🦴 Fælles "skelet" for gangen (pigen og drengen) – 6/11
//
//  Begge figurer går nu efter de SAMME regler. Hver figur får kun nogle få mål
//  (hvor knæet sidder, hvor lange skridt den tager), resten er fælles:
//
//   • Figuren tegnes ud fra sit eget STÅ-billede i den retning, den går.
//   • Underbenene (fra knæet og ned) svinger: det ene ben frem, mens det andet
//     går tilbage, og så skifter de. Det er altså skiftevis venstre og højre ben.
//   • Benet, der er på vej frem, løfter foden en lille smule.
//   • Fra siden er det fjerneste ben lidt mørkere, så man kan se, at der er to ben.
//   • Skridtene er små (gang, ikke løb), og overkroppen vipper 1 pixel op og ned.
//
//  Alt tøj, alle farver, mønstre, shorts og frisurer virker som før, fordi
//  figuren først tegnes helt færdig (som når den står), og derefter
//  "klippes" benene og flyttes.
//
//  egneBilleder: retninger, hvor figuren stadig bruger sine egne gå-billeder
//  (pigen forfra og bagfra, fordi Pavla synes, de ser godt ud).
//  Fjern en retning fra listen, så bruger den også skelettet.
//
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
const SKELET = {
  // knae:   hvor mange pixels over fødderne knæet sidder (i figurens eget billede)
  // skridt: hvor langt foden svinger frem/tilbage fra siden (pixels i billedet)
  // loeft:  hvor meget foden løftes, når benet går frem
  pige:  { knae: 46, skridt: 7, loeft: 3, egneBilleder: ["ned", "op"] },
  dreng: { knae: 40, skridt: 6, loeft: 3, egneBilleder: [] },
};
// fælles for alle: hvor hurtigt benene skifter (1 = ét skridt pr. "trin" i spillet)
const SKELET_TAKT = 0.75;
// hvor meget mørkere det fjerneste ben er fra siden (1 = ikke mørkere)
const SKELET_FJERNT_BEN = 0.72;

(function () {
  const SIDE = { hoejre: 1, venstre: -1 };
  const SKRAA = { "ned-hoejre": 1, "op-hoejre": 1, "ned-venstre": -1, "op-venstre": -1 };
  const FOR_BAG = { ned: 1, op: 1 };
  const laerred = document.createElement("canvas");
  const lc = laerred.getContext("2d");
  // plads omkring fødderne i det lille laerred (i spillets pixels)
  const PL = { b: 200, h: 260, fx: 100, fy: 230 };

  function skalBruges(valg, retning, gaarTrin, sidde) {
    if (sidde || gaarTrin === null || gaarTrin === undefined) return null;
    const sk = SKELET[valg && valg.type];
    if (!sk || sk.egneBilleder.indexOf(retning) >= 0) return null;
    if (typeof REAL_PAUSE !== "undefined" && !REAL_PAUSE) return null;   // realistiske figurer har deres egen gang
    const f = FIGURER[valg.type];
    if (!f || !f.staa || !f.staa[retning]) return null;
    return { sk: sk, f: f };
  }

  function installer() {
    const tegnFoer = tegnMenneske;
    if (tegnFoer.skelet) return;
    const ny = function (c, x, y, valg, retning, gaarTrin, sidde) {
      const brug = skalBruges(valg, retning, gaarTrin, sidde);
      if (!brug) return tegnFoer.apply(this, arguments);
      tegnMedSkelet(tegnFoer, c, x, y, valg, retning, gaarTrin, brug.sk, brug.f);
    };
    ny.skelet = true;
    tegnMenneske = ny;
    // drengens gå-billeder blev tegnet mindre (gaaSkala), men skelettet bruger stå-billedet
    Object.keys(SKELET).forEach(function (h) {
      if (FIGURER[h] && SKELET[h].egneBilleder.length === 0) FIGURER[h].gaaSkala = 1;
    });
  }

  function tegnMedSkelet(tegnFoer, c, x, y, valg, retning, trin, sk, f) {
    // hvor skarpt skal der tegnes? (laerredet er forstørret med zoom og skærmens opløsning)
    const t = c.getTransform ? c.getTransform() : { a: 1 };
    const k = Math.max(1, Math.abs(t.a) || 1);
    const bw = Math.ceil(PL.b * k), bh = Math.ceil(PL.h * k);
    if (laerred.width !== bw || laerred.height !== bh) { laerred.width = bw; laerred.height = bh; }
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.clearRect(0, 0, bw, bh);
    lc.setTransform(k, 0, 0, k, 0, 0);
    lc.imageSmoothingEnabled = false;
    // tegn figuren, som når den står (uden ansigtsudtryk)
    const staaende = Object.assign({}, valg, { pose: null });
    tegnFoer.call(null, lc, PL.fx, PL.fy, staaende, retning, null, null);

    const s = f.skala;                 // 1 pixel i figurens billede = s pixels i spillet
    const knaeY = PL.fy - sk.knae * s; // knæet (i spillets pixels i det lille laerred)
    const fase = trin * SKELET_TAKT * Math.PI / 2;
    const pos = Math.sin(fase), fart = Math.cos(fase);
    const bob = Math.abs(pos) < 0.5 ? -1 : 0;   // overkroppen løftes lidt, når benene passerer hinanden

    const side = SIDE[retning], skraa = SKRAA[retning], forbag = FOR_BAG[retning];
    const vend = side || skraa || 0;
    const ox = x - PL.fx, oy = y - PL.fy;   // fra det lille laerred til spillet

    // ét ben: stykket fra (x0..x1) under knæet, svinget "frem" (-1..1) og løftet
    function ben(x0, x1, frem, paaVejFrem, moerk) {
      const top = knaeY - 2 * s;                  // lidt over knæet, så der ikke kommer en sprække
      const raekker = Math.ceil((PL.fy + 2 - top) / s);
      const svingX = forbag ? 0 : vend * sk.skridt * s * frem * (side ? 1 : 0.3);
      const loeft = sk.loeft * s * Math.max(0, paaVejFrem) * (forbag ? 1.3 : 1);
      if (moerk) c.filter = "brightness(" + SKELET_FJERNT_BEN + ")";
      for (let r = 0; r < raekker; r++) {
        const yy = top + r * s;
        const del = Math.max(0, Math.min(1, (yy - knaeY) / (PL.fy - knaeY)));   // 0 ved knæet, 1 ved foden
        const dx = Math.round(svingX * del / s) * s;
        const dy = Math.round(loeft * del * del / s) * s;
        const sx0 = Math.max(0, x0), sx1 = Math.min(PL.b, x1);
        c.drawImage(laerred, sx0 * k, yy * k, (sx1 - sx0) * k, s * k + 1,
          ox + sx0 + dx, oy + yy - dy, sx1 - sx0, s + 1 / k);
      }
      if (moerk) c.filter = "none";
    }

    if (side) {
      // fra siden: begge ben er hele benstykket; det fjerne (mørkt) bagved
      ben(0, PL.b, -pos, -fart, true);
      ben(0, PL.b, pos, fart, false);
    } else {
      // forfra/bagfra/skråt: venstre og højre ben hver for sig (delt ved fødderne)
      const midt = PL.fx - s;
      const venstre = [0, midt + 2 * s], hoejre = [midt, PL.b];
      if (vend >= 0) { ben(venstre[0], venstre[1], pos, fart, false); ben(hoejre[0], hoejre[1], -pos, -fart, false); }
      else { ben(hoejre[0], hoejre[1], -pos, -fart, false); ben(venstre[0], venstre[1], pos, fart, false); }
    }
    // overkroppen (alt over knæet) ovenpå
    c.drawImage(laerred, 0, 0, bw, Math.round(knaeY * k), ox, oy + bob * s, PL.b, Math.round(knaeY * k) / k);
  }

  // vent til de andre gang-filer (gang-rettet.js, sidde-nye.js m.fl.) er hentet
  let forsoeg = 0;
  (function vent() {
    const klar = FIGURER.pige && FIGURER.pige.gaa && FIGURER.pige.gaa.hoejre &&
      String(FIGURER.pige.gaa.hoejre[1] && FIGURER.pige.gaa.hoejre[1].fil).indexOf("-s1") >= 0;
    if (klar || forsoeg++ > 40) installer();
    else setTimeout(vent, 100);
  })();
})();
