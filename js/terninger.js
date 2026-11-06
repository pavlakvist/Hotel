// =============================================================
//  🎲 Terninger + 👢 :kick (6/11)
//  To realistiske terninger i Staff-kategorien (gratis for staff og ejeren):
//   - "Terning på gulvet" (ev-terning): står på gulvet.
//   - "Terning på væggen" (ev-vaegterning): hænger på bagvæggen eller venstre væg.
//  ALLE kan klikke på en terning. Den triller og lander på 1-6, og alle i rummet
//  ser det samme slag (sendes som en usynlig chatbesked, så der skal ikke køres SQL).
//
//  :kick i chatten sender alle andre i rummet direkte ned i lobbyen (velkomsthallen).
//  Kun ansatte (alle med et staff-skilt), hotellets ejer og rummets ejer kan bruge den.
//  Den, der skriver :kick, bliver selv i rummet. Hotellets ejer bliver aldrig smidt ud.
//
//  Billederne: billeder/moebler/ev-terning/ og billeder/moebler/ev-vaegterning/
//  (3D-renderet: /mnt/project-files/terning/scripts/terning.py)
//  Hentes fra slutningen af js/panel-forklaring.js.
// =============================================================
(function () {
  if (typeof MOEBEL_TYPER === "undefined" || MOEBEL_TYPER["ev-terning"]) return;

  const SKJULT = "⟦HV⟧";          // ⟦HV⟧ = usynlig besked til de andre i rummet
  const RUL_TID = 1100;                       // så længe terningen triller (ms)
  const VIS_TID = 5000;                       // så længe resultatet står over terningen
  const PX_PR_METER = 76.35;
  const GULV = "billeder/moebler/ev-terning/ev-terning-";
  const VAEG = "billeder/moebler/ev-vaegterning/ev-vaegterning-";

  const TERNING_TYPER = [
    { id: "ev-terning", navn: "Terning på gulvet", skala: 0.5, ankre: [[159, 274], [159, 274], [159, 274], [159, 274]],
      retninger: [1, 1, 1, 1].map(function () { return GULV + "1.png?r=1"; }) },
    { id: "ev-vaegterning", navn: "Terning på væggen", skala: 0.5, kanGaaPaa: true, paaVaeg: true,
      ankre: [[165, 445], [165, 445], [165, 445], [165, 445]],
      retninger: [VAEG + "b-1.png?r=1", VAEG + "v-1.png?r=1", VAEG + "b-1.png?r=1", VAEG + "v-1.png?r=1"] },
  ];
  // alle billeder hentes med det samme, så terningen ikke blinker, når den triller
  for (let v = 1; v <= 6; v++) { hentBillede(GULV + v + ".png?r=1"); hentBillede(VAEG + "b-" + v + ".png?r=1"); hentBillede(VAEG + "v-" + v + ".png?r=1"); }
  [0, 1, 2].forEach(function (i) { hentBillede(GULV + "kast" + i + ".png?r=1"); });
  [0, 1].forEach(function (i) { hentBillede(VAEG + "b-kast" + i + ".png?r=1"); hentBillede(VAEG + "v-kast" + i + ".png?r=1"); });

  TERNING_TYPER.forEach(function (t) {
    t.kategori = typeof STAFF_KAT !== "undefined" ? STAFF_KAT : "Staff";
    t.staff = true;
    MOEBLER.push(t);
    MOEBEL_TYPER[t.id] = t;
    forberedRetninger(t);
    if (typeof STAFF_SHOP_KAT !== "undefined") STAFF_SHOP_KAT.ting.push(t);
  });
  function erTerning(m) { return !!m && (m.type === "ev-terning" || m.type === "ev-vaegterning"); }

  // ----- I møbelpanelets Staff-fane (samme slags knap som de andre staff-møbler) -----
  (function () {
    if (typeof knapBoks === "undefined") return;
    const knapper = [];
    TERNING_TYPER.forEach(function (type) {
      const knap = document.createElement("button");
      knap.className = "moebel-knap";
      knap.dataset.id = type.id;
      knap.dataset.kategori = type.kategori;
      knap.hidden = true;
      const ikon = document.createElement("canvas");
      ikon.width = 64; ikon.height = 70;
      ikoner.push({ ikon: ikon, type: type });
      const navn = document.createElement("span");
      navn.textContent = type.navn;
      knap.append(ikon, navn);
      knap.addEventListener("click", function () {
        if (typeof erStaff === "function" && !erStaff()) return;
        valgtType = valgtType === type.id ? null : type.id;
        valgtMoebel = null;
        opdaterPanel();
      });
      knapBoks.appendChild(knap);
      knapper.push(knap);
    });
    if (typeof tegnIkoner === "function") setTimeout(tegnIkoner, 800);
    setInterval(function () {
      const vis = typeof valgtKategori !== "undefined" && valgtKategori === TERNING_TYPER[0].kategori && (typeof erStaff !== "function" || erStaff());
      knapper.forEach(function (k) { k.hidden = !vis; });
    }, 300);
  })();

  // =============================================================
  //  Væggen: terningen hænger på bagvæggen eller venstre væg
  // =============================================================
  function vaegSide(x, y, retning) {
    if (!erIRummet(x, y)) return null;
    let bag = true, venstre = true;
    for (let yy = 0; yy < y; yy++) if (erIRummet(x, yy)) bag = false;
    for (let xx = 0; xx < x; xx++) if (erIRummet(xx, y)) venstre = false;
    if (bag && venstre) return (retning || 0) % 2 === 1 ? "v" : "b";   // i hjørnet: Drej skifter væg
    return bag ? "b" : venstre ? "v" : null;
  }
  const pladsTilFoerTerning = pladsTil;
  pladsTil = function (type, x, y) {
    if (type && type.paaVaeg && !vaegSide(x, y)) return false;
    return pladsTilFoerTerning.apply(this, arguments);
  };
  // forklaring, hvis man prøver at stille den midt på gulvet
  laerred.addEventListener("click", function (e) {
    if (valgtType !== "ev-vaegterning") return;
    const f = musTilFelt(e);
    if (erIRummet(f.x, f.y) && !vaegSide(f.x, f.y)) {
      setTimeout(function () { besked.textContent = "🎲 Terningen skal hænge på en væg. Klik på et felt helt inde ved væggen."; }, 0);
    }
  }, true);

  // =============================================================
  //  Slagene: hvad viser hver terning, og triller den lige nu?
  // =============================================================
  const SLAG = {};          // "rum|x|y" → { vaerdi, start, hvem }
  function noegle(x, y) { return (typeof mitRumId === "function" ? mitRumId() : rumValg) + "|" + x + "|" + y; }
  function startSlag(x, y, vaerdi, hvem) {
    SLAG[noegle(x, y)] = { vaerdi: vaerdi, start: performance.now(), hvem: hvem };
  }
  function trillerNu(m) {
    const s = SLAG[noegle(m.x, m.y)];
    return !!s && performance.now() - s.start < RUL_TID;
  }

  // Hvilket felt tegnes der på? (moebelSted giver feltets forreste hjørne)
  function feltFraSted(cx, cy) { return skaermTilFelt(cx, cy + FLISE_H / 2 - 4); }

  const tegnMoebelFoerTerning = tegnMoebel;
  tegnMoebel = function (c, type, cx, cy, spejlet, retning) {
    if (!type || (type.id !== "ev-terning" && type.id !== "ev-vaegterning")) return tegnMoebelFoerTerning.apply(this, arguments);
    const f = feltFraSted(cx, cy);
    const m = moeblerIRummet.find(function (mm) { return mm.type === type.id && mm.x === f.x && mm.y === f.y; });
    const s = m ? SLAG[noegle(m.x, m.y)] : null;
    const nu = performance.now();
    const t = s ? (nu - s.start) / RUL_TID : 2;
    const gemt = type.retninger;
    let dy = 0, dx = 0, sti;
    if (type.id === "ev-terning") {
      if (t < 1) {
        sti = GULV + "kast" + (Math.floor(nu / 85) % 3) + ".png?r=1";
        dy = -Math.abs(Math.sin(t * Math.PI * 3)) * 26 * (1 - t);   // hopper og bliver lavere
        dx = Math.sin(t * Math.PI * 2) * 5 * (1 - t);
      } else sti = GULV + (s ? s.vaerdi : 1) + ".png?r=1";
      type.retninger = [sti, sti, sti, sti];
    } else {
      const side = vaegSide(f.x, f.y, m ? m.retning : retning) || ((retning || 0) % 2 === 1 ? "v" : "b");
      if (t < 1) {
        const n = Math.floor(nu / 70);
        sti = n % 3 === 2 ? VAEG + side + "-" + (1 + (n * 7) % 6) + ".png?r=1" : VAEG + side + "-kast" + (n % 2) + ".png?r=1";
        dx = Math.sin(nu / 25) * 2.5 * (1 - t);
      } else sti = VAEG + side + "-" + (s ? s.vaerdi : 1) + ".png?r=1";
      type.retninger = [sti, sti, sti, sti];
    }
    try { return tegnMoebelFoerTerning.call(this, c, type, cx + dx, cy + dy, spejlet, retning); }
    finally { type.retninger = gemt; }
  };

  // Resultatet står over terningen et lille stykke tid ("🎲 5 · Pall")
  function terningTop(m) {
    if (m.type === "ev-terning") { const p = feltMidte(m.x, m.y); return { x: p.x, y: p.y - 0.62 * PX_PR_METER }; }
    const side = vaegSide(m.x, m.y, m.retning) || "b";
    const p = side === "b" ? punkt(m.x + 0.5, m.y) : punkt(m.x, m.y + 0.5);
    return { x: p.x, y: p.y - 1.5 * PX_PR_METER };
  }
  if (typeof tegnBobler === "function") {
    const tegnBoblerFoerTerning = tegnBobler;
    tegnBobler = function () {
      const nu = performance.now();
      moeblerIRummet.forEach(function (m) {
        if (!erTerning(m)) return;
        const s = SLAG[noegle(m.x, m.y)];
        if (!s || nu - s.start < RUL_TID || nu - s.start > RUL_TID + VIS_TID) return;
        const p = terningTop(m);
        const alfa = Math.min(1, (RUL_TID + VIS_TID - (nu - s.start)) / 600);
        const tekst = s.vaerdi + "";
        const navn = s.hvem || "";
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.font = "bold 15px Georgia, serif";
        const b1 = ctx.measureText(tekst).width;
        ctx.font = "11px Georgia, serif";
        const b2 = ctx.measureText(navn).width;
        const b = Math.max(b1 + 30, b2 + 14);
        const x = Math.round(p.x - b / 2), y = Math.round(p.y - 38);
        ctx.fillStyle = "rgba(58, 14, 24, 0.92)";
        ctx.strokeStyle = "#d9b45a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, b, 34, 7); else ctx.rect(x, y, b, 34);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#f6e7c1";
        ctx.textAlign = "center";
        ctx.font = "bold 15px Georgia, serif";
        ctx.fillText("🎲 " + tekst, p.x, y + 16);
        ctx.font = "11px Georgia, serif";
        ctx.fillStyle = "#e8cf8f";
        ctx.fillText(navn, p.x, y + 29);
        ctx.restore();
      });
      return tegnBoblerFoerTerning.apply(this, arguments);
    };
  }

  // =============================================================
  //  Klik på en terning = slå (alle kan)
  // =============================================================
  function terningUnderMus(e) {
    const r = laerred.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (BREDDE / r.width), sy = (e.clientY - r.top) * (HOEJDE / r.height);
    let fundet = null;
    moeblerIRummet.forEach(function (m) {
      if (!erTerning(m)) return;
      let inde;
      if (m.type === "ev-terning") {
        const p = feltMidte(m.x, m.y);
        inde = Math.abs(sx - p.x) < 28 && sy > p.y - 48 && sy < p.y + 14;
      } else {
        const side = vaegSide(m.x, m.y, m.retning) || "b";
        const p = side === "b" ? punkt(m.x + 0.5, m.y) : punkt(m.x, m.y + 0.5);
        inde = Math.abs(sx - p.x) < 26 && sy > p.y - 1.45 * PX_PR_METER && sy < p.y - 0.55 * PX_PR_METER;
      }
      if (inde && (!fundet || moebelDybde(m) > moebelDybde(fundet))) fundet = m;
    });
    if (!fundet) {
      const f = musTilFelt(e);
      const m = moebelPaa(f.x, f.y);
      if (m && m.type === "ev-terning") fundet = m;
    }
    return fundet;
  }

  function sendSkjult(tekst) {
    const token = typeof mitToken === "function" ? mitToken() : null;
    if (typeof SERVER === "undefined" || !SERVER.til || !token || typeof serverKald !== "function") return;
    serverKald("hv_chat_send", { p_token: token, p_rum: mitRumId(), p_tekst: SKJULT + tekst, p_boble: typeof minBoble !== "undefined" ? minBoble : null })
      .catch(function (err) { console.warn("Terningen/kick nåede ikke serveren: " + err.message); });
  }

  function slaa(m) {
    if (trillerNu(m)) return;
    const vaerdi = 1 + Math.floor(Math.random() * 6);
    startSlag(m.x, m.y, vaerdi, FIGUR.navn);
    sendSkjult("terning|" + m.x + "|" + m.y + "|" + vaerdi);
    setTimeout(function () { besked.textContent = "🎲 Du slog " + vaerdi + "!"; }, RUL_TID);
  }

  laerred.addEventListener("click", function (e) {
    if (valgtType || (typeof flytter !== "undefined" && flytter) || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const m = terningUnderMus(e);
    if (!m) return;
    e.stopImmediatePropagation();
    valgtMoebel = m;           // så staff stadig kan flytte/dreje/tage den op i møbel-boksen
    opdaterPanel();
    slaa(m);
  }, true);
  laerred.addEventListener("mousemove", function (e) {
    if (valgtType || !moeblerIRummet.some(erTerning)) return;
    if (terningUnderMus(e)) laerred.style.cursor = "pointer";
  });

  // =============================================================
  //  :kick → alle andre i rummet ned i lobbyen
  // =============================================================
  function erHotelEjer(navn) { return typeof EJERE !== "undefined" && EJERE.indexOf(navn) >= 0; }
  function ejerAfRum(navn, rumId) {
    const lille = String(navn || "").toLowerCase();
    return rumId === "lej:hjem-" + lille || String(rumId).toLowerCase().indexOf(lille + ":") === 0;
  }
  function maaKicke(navn, rumId) {
    if (erHotelEjer(navn)) return true;
    if (typeof erAnsat === "function" && erAnsat(navn)) return true;
    return ejerAfRum(navn, rumId);
  }

  const KICK = /^[:：]\s*kick\s*$/i;
  document.addEventListener("submit", function (e) {
    if (typeof chatForm === "undefined" || e.target !== chatForm) return;
    const tekst = chatTekst.value.trim();
    if (!KICK.test(tekst)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    chatTekst.value = "";
    const rum = mitRumId();
    if (rumValg === "hal") { besked.textContent = "👢 Du står allerede i lobbyen."; return; }
    if (!maaKicke(FIGUR.navn, rum)) { besked.textContent = "👢 Kun ansatte og rummets ejer kan bruge :kick."; return; }
    const andre = typeof ANDRE_SPILLERE !== "undefined"
      ? Object.values(ANDRE_SPILLERE).filter(function (g) { return g.rumId === rum && !erHotelEjer(g.navn); }).length : 0;
    sendSkjult("kick|" + rum);
    if (typeof adminSkriv === "function") adminSkriv(":kick i " + (document.getElementById("rum-navn") || {}).textContent + " af " + FIGUR.navn);
    besked.textContent = andre === 0
      ? "👢 Der er ingen andre i rummet lige nu."
      : "👢 " + andre + (andre === 1 ? " spiller er" : " spillere er") + " sendt ned i lobbyen.";
  }, true);

  // Lille besked midt på skærmen til dem, der bliver smidt ud
  function visKicket(hvem) {
    let boks = document.getElementById("kick-besked");
    if (!boks) {
      boks = document.createElement("div");
      boks.id = "kick-besked";
      boks.style.cssText = "position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:9999;" +
        "background:#3a0e18;color:#f6e7c1;border:2px solid #d9b45a;border-radius:10px;padding:14px 22px;" +
        "font:16px Georgia,serif;box-shadow:0 8px 30px rgba(0,0,0,.45);text-align:center;max-width:80vw";
      document.body.appendChild(boks);
    }
    boks.textContent = "👢 " + hvem + " har sendt alle ned i lobbyen.";
    boks.hidden = false;
    clearTimeout(visKicket.t);
    visKicket.t = setTimeout(function () { boks.hidden = true; }, 4500);
  }

  // =============================================================
  //  Usynlige beskeder fra de andre i rummet
  // =============================================================
  const sigFoerTerning = sig;
  sig = function (hvem, navn, tekst) {
    const t = String(tekst || "");
    if (t.indexOf(SKJULT) !== 0) return sigFoerTerning.apply(this, arguments);
    if (hvem === figur) return;
    const dele = t.slice(SKJULT.length).split("|");
    if (dele[0] === "terning") {
      const x = parseInt(dele[1], 10), y = parseInt(dele[2], 10), v = parseInt(dele[3], 10);
      if (v >= 1 && v <= 6) startSlag(x, y, v, navn);
    } else if (dele[0] === "kick") {
      const rum = dele.slice(1).join("|");
      if (rum !== mitRumId() || rumValg === "hal") return;
      if (!maaKicke(navn, rum) || erHotelEjer(FIGUR.navn) || navn === FIGUR.navn) return;
      skiftRum("hal");
      visKicket(navn);
    }
  };
})();
