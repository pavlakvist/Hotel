// =============================================================
//  🛗 Realistisk elevator (hallen og tagterrassen)
//  Messingramme, mahognipanel, en art deco-krone foroven, dør i bronze
//  med en graveret sol, og et oplyst rum indeni med spejl og håndliste.
//  Dørene glider ind bag rammen, når de åbner.
//  Billederne: billeder/realistisk/elevator-ramme.png, elevator-doer-v.png, elevator-doer-h.png
//  Slå fra: localStorage "mit-hotel-realistisk" = "fra" (samme som rummene)
// =============================================================
(function () {
  let fra = false;
  try { fra = localStorage.getItem("mit-hotel-realistisk") === "fra"; } catch (e) {}
  if (fra || typeof tegnElevator !== "function") return;

  function billede(fil) { const b = new Image(); b.src = "billeder/realistisk/" + fil; return b; }
  const RAMME = billede("elevator-ramme.png"), DV = billede("elevator-doer-v.png"), DH = billede("elevator-doer-h.png");
  const klar = function (b) { return b.complete && b.naturalWidth > 0; };

  const gammelElevator = tegnElevator;
  let sidst = performance.now();

  tegnElevator = function () {
    if (!klar(RAMME) || !klar(DV) || !klar(DH)) { gammelElevator(); return; }
    const nu = performance.now();
    const dt = Math.min(0.1, (nu - sidst) / 1000);
    sidst = nu;
    elevAaben += Math.max(-dt * 1.6, Math.min(dt * 1.6, elevMaal - elevAaben));
    // blød start og stop på dørene
    const aaben = elevAaben * elevAaben * (3 - 2 * elevAaben);

    const h = elevHjoerner();
    const B = 64;
    ctx.save();
    ctx.transform((h.b.x - h.a.x) / B, (h.b.y - h.a.y) / B, 0, ELEVATOR.skala, h.a.x, h.a.y);
    const glat = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    try { ctx.imageSmoothingQuality = "high"; } catch (e) {}

    // skygge på væggen bag elevatoren
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(-5, -160, 74, 160);
    ctx.drawImage(RAMME, -3, -174, 70, 174);

    // dørene: glider ind bag karmen (klippes til åbningen)
    const skub = 23 * aaben;
    ctx.save();
    ctx.beginPath();
    ctx.rect(9, -123, 46, 121);
    ctx.clip();
    ctx.drawImage(DV, 9 - skub, -123, 23, 121);
    ctx.drawImage(DH, 32 + skub, -123, 23, 121);
    // lyset fra elevatoren falder ud på dørkanten, når den er åben
    if (aaben > 0.02) {
      const g = ctx.createLinearGradient(0, -123, 0, -2);
      g.addColorStop(0, "rgba(255,226,160," + (0.25 * aaben) + ")");
      g.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = g;
      ctx.fillRect(9, -123, 46, 121);
    }
    ctx.restore();

    // etage-skærmen: ravgule bogstaver der gløder
    const tekst = herEtage() === "stue" ? "▲ S ▼" : aktivtVaerelse === "hemmelig" ? "▲ ? ▼" : "▲ 1 ▼";
    ctx.font = "bold 9px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = elevKoerer ? "rgba(255,210,90,0.95)" : "rgba(255,170,60,0.8)";
    ctx.shadowBlur = elevKoerer ? 6 : 4;
    ctx.fillStyle = elevKoerer ? "#ffe08a" : "#f6b445";
    ctx.fillText(tekst, 32, -136.5);
    ctx.shadowBlur = 0;

    // kalde-knapperne på messingpladen (den øverste lyser, når du har kaldt)
    function knap(y, taendt) {
      const g = ctx.createRadialGradient(60.4, y - 0.4, 0.2, 60.7, y, 1.6);
      if (taendt) { g.addColorStop(0, "#fff4d0"); g.addColorStop(0.5, "#ff8a4d"); g.addColorStop(1, "#7a2210"); }
      else { g.addColorStop(0, "#fff8e8"); g.addColorStop(0.6, "#e8d6b0"); g.addColorStop(1, "#6b4a1c"); }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(60.7, y, 1.5, 0, Math.PI * 2); ctx.fill();
      if (taendt) { ctx.shadowColor = "rgba(255,120,60,0.9)"; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0; }
    }
    knap(-71, !!elevMaal);
    knap(-64, false);

    ctx.imageSmoothingEnabled = glat;
    ctx.restore();
  };
})();
