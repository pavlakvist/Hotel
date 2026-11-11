// =============================================================
//  👕 TEST AF T-SHIRT (11/11) – kun til hotel-toejtest.html
//
//  Denne fil hentes KUN af hotel-toejtest.html. Det rigtige hotel
//  (hotel.html) kender den ikke, så den normale avatar påvirkes ikke.
//
//  • T-shirten er slået FRA, når siden åbnes. Så tegnes alt præcis som før.
//  • Slået TIL lægges T-shirt-laget fra prototype-toej/lag/<billednavn>
//    oven på pigens billede, på præcis samme punkt og i samme størrelse,
//    lige før håret. Det virker når hun står, går og sidder.
//  • Kun din egen avatar, og kun når den er "Pige". Andre spillere ser intet.
//  • Intet gemmes (ikke i databasen, ikke i browseren).
//  • Mangler et lag (fx biograf-billederne bagfra), tegnes pigen som normalt.
//
//  Vil du af med testen: slet hotel-toejtest.html og js/toej-test.js.
// =============================================================
(function () {
  if (typeof tegnHaar !== "function" || typeof figurDel !== "function") return;

  const LAG_MAPPE = "prototype-toej/lag/";
  let til = false, blink = false, drej = false;
  const lagBilleder = {}, mangler = {};

  function lagFor(fil) {
    const navn = String(fil).split("/").pop();
    if (navn.indexOf("pige-") !== 0 || mangler[navn]) return null;
    if (!lagBilleder[navn]) {
      const b = new Image();
      b.onerror = function () { mangler[navn] = true; };
      b.src = LAG_MAPPE + navn;
      lagBilleder[navn] = b;
    }
    const b = lagBilleder[navn];
    return b.complete && b.naturalWidth > 0 ? b : null;
  }
  // hent lagene for de billeder, pigen bruger, med det samme (så de ikke "popper" ind)
  try {
    const f = FIGURER.pige;
    [f.staa, f.sidder, f.poser].forEach(function (g) { for (const r in (g || {})) lagFor(g[r].fil); });
    for (const r in f.gaa) f.gaa[r].forEach(function (b) { lagFor(b.fil); });
  } catch (e) {}

  // er det min egen avatar? (gang fra siden laver en kopi af valget, men farverne er de samme)
  function erMig(valg) {
    if (typeof garderobe === "undefined" || !valg) return false;
    return valg === garderobe || (!!valg.farver && valg.farver === garderobe.farver);
  }

  // Kig (uden at ændre noget) på hvilket ankerpunkt billedet blev tegnet med.
  let sidste = null;
  const figurDelFoer = figurDel;
  figurDel = function (valg, del) {
    const d = figurDelFoer.apply(this, arguments);
    sidste = d ? { del: del, ax: d.ax, ay: d.ay } : null;
    return d;
  };

  // tegnHaar kaldes lige efter, at kroppen er tegnet. Her lægges T-shirten på.
  const tegnHaarFoer = tegnHaar;
  tegnHaar = function (c, f, valg, del, fx, fy, s) {
    const vis = til && (!blink || Math.floor(performance.now() / 600) % 2 === 1);
    if (vis && valg && valg.type === "pige" && del && del.fil && erMig(valg)) {
      const b = lagFor(del.fil);
      if (b) {
        const ax = sidste && sidste.del === del ? sidste.ax : del.anker[0];
        const ay = sidste && sidste.del === del ? sidste.ay : del.anker[1];
        c.drawImage(b, fx + (ax - del.anker[0]) * s, fy + (ay - del.anker[1]) * s, b.naturalWidth * s, b.naturalHeight * s);
      }
    }
    return tegnHaarFoer.apply(this, arguments);
  };

  // ----- lille panel -----
  const RETNINGER = ["ned", "ned-hoejre", "hoejre", "op-hoejre", "op", "op-venstre", "venstre", "ned-venstre"];
  const p = document.createElement("div");
  p.id = "toej-test-panel";
  p.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99999;background:#5c1424;color:#f6eedd;" +
    "border:2px solid #c9a24a;border-radius:10px;padding:10px 12px;font:13px Georgia,serif;width:230px;box-shadow:0 4px 14px rgba(0,0,0,.4)";
  p.innerHTML =
    "<div style='font-weight:bold;font-size:15px;margin-bottom:6px'>👕 T-shirt-test</div>" +
    "<button id='tt-til' style='width:100%;margin-bottom:6px'></button>" +
    "<button id='tt-drej' style='width:100%;margin-bottom:6px'></button>" +
    "<button id='tt-blink' style='width:100%;margin-bottom:6px'></button>" +
    "<div id='tt-info' style='font-size:11px;opacity:.9;line-height:1.35'></div>";
  const knapStil = "border:1px solid #c9a24a;border-radius:6px;padding:6px;cursor:pointer;font:bold 13px Georgia,serif;";
  function opdater() {
    const t = p.querySelector("#tt-til"), d = p.querySelector("#tt-drej"), bl = p.querySelector("#tt-blink");
    t.textContent = til ? "T-shirt: TIL" : "T-shirt: FRA";
    t.style.cssText = knapStil + "width:100%;margin-bottom:6px;background:" + (til ? "#c9a24a;color:#3a0a12" : "#f6eedd;color:#5c1424");
    d.textContent = drej ? "Stop drejning" : "Drej rundt (8 retninger)";
    d.style.cssText = knapStil + "width:100%;margin-bottom:6px;background:#f6eedd;color:#5c1424";
    bl.textContent = blink ? "Stop blink" : "Blink før/efter";
    bl.style.cssText = knapStil + "width:100%;margin-bottom:6px;background:#f6eedd;color:#5c1424";
    const type = typeof garderobe !== "undefined" ? garderobe.type : "?";
    p.querySelector("#tt-info").innerHTML = (type === "pige" ? "" :
      "<b style='color:#ffd27a'>Din avatar er ikke \"Pige\" lige nu. Vælg Pige under Skift udseende.</b><br>") +
      "Kun din egen avatar. Intet gemmes. Gå, stå og sæt dig på en stol for at teste.";
  }
  p.querySelector("#tt-til").onclick = function () { til = !til; opdater(); };
  p.querySelector("#tt-blink").onclick = function () { blink = !blink; if (blink) til = true; opdater(); };
  let drejNr = 0, drejTimer = null;
  p.querySelector("#tt-drej").onclick = function () {
    drej = !drej;
    clearInterval(drejTimer);
    if (drej) drejTimer = setInterval(function () {
      if (typeof figur === "undefined" || figur.rute.length) return;   // ikke mens hun går
      drejNr = (drejNr + 1) % RETNINGER.length;
      figur.retning = RETNINGER[drejNr];
    }, 900);
    opdater();
  };
  opdater();
  setInterval(opdater, 3000);
  document.body.appendChild(p);
})();
