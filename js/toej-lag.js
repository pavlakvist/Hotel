// =============================================================
//  👕 Tøjlag (11/11) — rigtigt tøj oven på figuren, som alle kan se
//
//  • Tøjet ligger som gennemsigtige billeder i billeder/toej-lag/<figur>/<tøj>/
//    med SAMME navn og størrelse som figurens egne billeder
//    (fx pige-staa-ned.png). Laget tegnes på præcis samme punkt,
//    lige før håret, så det følger alle 8 retninger, gang og sid.
//  • Valget gemmes i udseendet: ting.pige["lag-overdel"] = "tshirt-roed".
//    Udseendet sendes allerede til de andre spillere (js/rigtige-spillere.js),
//    så de ser T-shirten uden andre ændringer.
//  • Valget gemmes også på din profil på serveren (database-47-toej.sql),
//    så det følger dig, når du logger ud og ind igen — også på en anden computer.
//  • I garderoben: fanen Overdele → "Rød T-shirt" / "Uden T-shirt" → Gem udseende.
//  • Mangler et lagbillede, tegnes figuren præcis som før.
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke røres.)
// =============================================================
(function () {
  if (typeof tegnHaar !== "function" || typeof figurDel !== "function" || typeof garderobe === "undefined") return;
  if (window.TOEJ_LAG_KLAR) return;
  window.TOEJ_LAG_KLAR = true;

  // Det tøj, der findes. Nyt tøj: læg en mappe i billeder/toej-lag/ og skriv det på her.
  const TOEJ_LAG = {
    "tshirt-roed": { navn: "Rød T-shirt", figur: "pige", mappe: "billeder/toej-lag/pige/tshirt-roed/" },
  };
  const NOEGLE = "lag-overdel";                    // nøglen i ting.<figur>
  const LOKAL_NOEGLE = "mit-hotel-toej-lag";       // { profilnavn: tøj-id } på denne computer

  // ----- Lagbillederne -----
  const billeder = {}, mangler = {};
  function lagBillede(def, fil) {
    const navn = String(fil).split("/").pop();
    const sti = def.mappe + navn;
    if (mangler[sti]) return null;
    if (!billeder[sti]) {
      const b = new Image();
      b.onerror = function () { mangler[sti] = true; };
      b.src = sti;
      billeder[sti] = b;
    }
    const b = billeder[sti];
    return b.complete && b.naturalWidth > 0 ? b : null;
  }
  // hent lagene med det samme, så de ikke "popper" ind
  for (const id in TOEJ_LAG) {
    const def = TOEJ_LAG[id], f = FIGURER[def.figur];
    if (!f) continue;
    try {
      [f.staa, f.sidder, f.poser].forEach(function (g) { for (const r in (g || {})) lagBillede(def, g[r].fil); });
      for (const r in f.gaa) f.gaa[r].forEach(function (b) { lagBillede(def, b.fil); });
    } catch (e) {}
  }

  // Hvilket tøj har denne figur på? (virker for dig selv, de andre spillere og prøvefigurer)
  function valgtToej(valg) {
    if (!valg || !valg.ting || !valg.type) return null;
    const t = valg.ting[valg.type];
    const def = t && TOEJ_LAG[t[NOEGLE]];
    return def && def.figur === valg.type ? def : null;
  }

  // ----- Tegningen -----
  // Kig (uden at ændre noget) på hvilket ankerpunkt billedet blev tegnet med.
  let sidste = null;
  const figurDelFoer = figurDel;
  figurDel = function (valg, del) {
    const d = figurDelFoer.apply(this, arguments);
    sidste = d ? { del: del, ax: d.ax, ay: d.ay } : null;
    return d;
  };
  // tegnHaar kaldes lige efter, at kroppen er tegnet. Her lægges tøjet på.
  const tegnHaarFoer = tegnHaar;
  tegnHaar = function (c, f, valg, del, fx, fy, s) {
    const def = del && del.fil ? valgtToej(valg) : null;
    if (def) {
      const b = lagBillede(def, del.fil);
      if (b) {
        const ax = sidste && sidste.del === del ? sidste.ax : del.anker[0];
        const ay = sidste && sidste.del === del ? sidste.ay : del.anker[1];
        c.drawImage(b, fx + (ax - del.anker[0]) * s, fy + (ay - del.anker[1]) * s, b.naturalWidth * s, b.naturalHeight * s);
      }
    }
    return tegnHaarFoer.apply(this, arguments);
  };

  // ----- Gem og hent valget (følger profilen) -----
  function mitNavn() {
    try { if (typeof aktivKonto === "function" && aktivKonto()) return aktivKonto(); } catch (e) {}
    return typeof FIGUR !== "undefined" && FIGUR.navn ? FIGUR.navn : "";
  }
  function lokalt() {
    try { return JSON.parse(localStorage.getItem(LOKAL_NOEGLE) || "{}") || {}; } catch (e) { return {}; }
  }
  function gemLokalt(id) {
    const l = lokalt();
    l[mitNavn()] = id || null;
    try { localStorage.setItem(LOKAL_NOEGLE, JSON.stringify(l)); } catch (e) {}
  }
  function mitToejId() {
    const t = garderobe.ting && garderobe.ting.pige;
    return (t && TOEJ_LAG[t[NOEGLE]]) ? t[NOEGLE] : null;
  }
  function serverKlar() {
    return typeof SERVER !== "undefined" && SERVER.til && typeof serverKald === "function" &&
      typeof mitToken === "function" && !!mitToken();
  }
  function gemPaaServer(id) {
    if (!serverKlar()) return;
    serverKald("hv_toej_gem", { p_token: mitToken(), p_toej: { overdel: id || null } })
      .catch(function () {});   // database-47-toej.sql er ikke kørt endnu: så huskes det kun på computeren
  }

  // Når udseendet gemmes (Gem udseende i garderoben, butikken osv.), gemmes tøjvalget også på profilen.
  let sidstGemt = mitToejId();
  const gemGarderobeFoer = gemGarderobe;
  gemGarderobe = function () {
    const r = gemGarderobeFoer.apply(this, arguments);
    const id = mitToejId();
    if (id !== sidstGemt) {
      sidstGemt = id;
      gemLokalt(id);
      gemPaaServer(id);
    }
    return r;
  };

  // Tag tøjet på / af min egen figur (uden at røre resten af udseendet)
  function saetMitToej(id) {
    if (!garderobe.ting) garderobe.ting = {};
    if (!garderobe.ting.pige) garderobe.ting.pige = {};
    const foer = mitToejId();
    if (id && TOEJ_LAG[id]) garderobe.ting.pige[NOEGLE] = id;
    else delete garderobe.ting.pige[NOEGLE];
    sidstGemt = mitToejId();
    if (sidstGemt !== foer) {
      try { gemGarderobeFoer(); } catch (e) {}
      try { if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning(); } catch (e) {}
    }
  }

  // Ved start: brug det, der er gemt for DENNE profil (så to profiler på samme computer ikke deler tøj)
  (function hentMitToej() {
    const l = lokalt(), navn = mitNavn();
    saetMitToej(Object.prototype.hasOwnProperty.call(l, navn) ? l[navn] : null);
    if (!serverKlar()) return;
    serverKald("hv_toej_hent", { p_token: mitToken() }).then(function (svar) {
      if (!svar || typeof svar !== "object") return;
      if (Object.prototype.hasOwnProperty.call(svar, "overdel")) {
        // profilen på serveren bestemmer
        saetMitToej(svar.overdel || null);
        gemLokalt(mitToejId());
      } else if (mitToejId()) {
        // serveren har aldrig fået et valg: send det, vi har
        gemPaaServer(mitToejId());
      }
    }).catch(function () {});
  })();

  // ----- Garderoben: "Rød T-shirt" / "Uden T-shirt" under Overdele -----
  const tingBoks = document.getElementById("su-ting");
  function tegnKnapper() {
    if (!tingBoks || typeof kladde === "undefined" || !kladde) return;
    if (typeof suFane === "undefined" || suFane !== "overdel") return;
    if (tingBoks.querySelector(".toej-lag-knap")) return;
    const valg = [];
    for (const id in TOEJ_LAG) if (TOEJ_LAG[id].figur === kladde.type) valg.push(id);
    if (!valg.length) return;
    const nu = kladde.ting && kladde.ting[kladde.type] ? kladde.ting[kladde.type][NOEGLE] || null : null;
    const knapper = valg.map(function (id) { return lavKnap(id, TOEJ_LAG[id].navn, nu === id); });
    knapper.push(lavKnap(null, "Uden T-shirt", !nu || !TOEJ_LAG[nu]));
    for (let i = knapper.length - 1; i >= 0; i--) tingBoks.insertBefore(knapper[i], tingBoks.firstChild);
  }
  function lavKnap(id, navn, valgt) {
    const k = document.createElement("button");
    k.type = "button";
    k.className = "su-ting-knap su-stil-knap toej-lag-knap" + (valgt ? " toej-lag-valgt" : "");
    k.title = navn;
    const c = document.createElement("canvas");
    c.width = 60; c.height = 92;
    const ting = JSON.parse(JSON.stringify(kladde.ting || {}));
    if (!ting[kladde.type]) ting[kladde.type] = {};
    if (id) ting[kladde.type][NOEGLE] = id; else delete ting[kladde.type][NOEGLE];
    const u = { type: kladde.type, farver: kladde.farver || {}, ting: ting, frisure: kladde.frisure || {} };
    const tegn = function () {
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      g.save();
      g.translate(c.width / 2, c.height - 2);
      g.scale(0.56, 0.56);
      try { tegnMenneske(g, 0, 0, u, "ned", null, null); } catch (e) {}
      g.restore();
    };
    tegn();
    setTimeout(tegn, 400);
    k.appendChild(c);
    const n = document.createElement("span");
    n.className = "su-stil-navn";
    n.textContent = navn;
    k.appendChild(n);
    k.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!kladde) return;
      if (typeof foerAendring === "function") foerAendring();
      const t = typeof mineTing === "function" ? mineTing() : (kladde.ting[kladde.type] = kladde.ting[kladde.type] || {});
      if (id) t[NOEGLE] = id; else delete t[NOEGLE];
      tegnSkift();
    });
    return k;
  }
  if (tingBoks) {
    new MutationObserver(tegnKnapper).observe(tingBoks, { childList: true });
    tegnKnapper();
  }
  const stil = document.createElement("style");
  stil.textContent =
    "#su-ting .toej-lag-knap { position: relative; }" +
    "#su-ting .toej-lag-knap.toej-lag-valgt { border-color: #c9a24a !important; box-shadow: 0 0 0 3px #f6e7c1, 0 0 0 5px #c9a24a !important; }" +
    "#su-ting .toej-lag-knap canvas { width: 60px; height: 92px; image-rendering: pixelated; }";
  document.head.appendChild(stil);
})();
