// =============================================================
//  👕 Rigtigt tøjskift på pigen og drengen (4/11)
//  1) Skoene kan nu få farve (nyt sko-område i farvelagene).
//  2) Tøj kan have mønster: tern, striber, prikker eller camouflage.
//     Mønsteret huskes ved siden af farven, fx farver.underdelMoenster = "tern".
//  3) Tøjet fra Shoppen kommer på figuren med farve, mønster og sko,
//     og kan tages af igen (knappen "Tag af").
//  4) I "Skift udseende" kan du vælge dit eget tøj fra Shoppen
//     under Overdel og Underdel, og vælge mønster under farverne.
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================
(function () {
  // ----- 1) Skoene får et område, og farvelagene hentes friske -----
  ["pige", "dreng"].forEach(function (hvem) {
    const f = FIGURER[hvem];
    if (!f || !f.omraader) return;
    if (f.omraader.indexOf("sko") < 0) f.omraader.push("sko");
    f.omraadeNavne = Object.assign({}, f.omraadeNavne, { sko: "Farve på sko" });
  });
  // farvelagene for pigen og drengen er lavet om (sko + rettede spejl-billeder),
  // så de hentes med et nyt navn, og browseren ikke bruger de gamle
  const figurBilledeFoer = figurBillede;
  figurBillede = function (sti) {
    if (sti && sti.indexOf("/farvelag/") >= 0 && /\/(pige|dreng)-[^\/]*\.png$/.test(sti)) sti += "?sko=1";
    return figurBilledeFoer(sti);
  };

  // ----- 2) Mønstre -----
  const MOENSTRE = [
    { id: "", navn: "Ensfarvet" },
    { id: "tern", navn: "Tern" },
    { id: "striber", navn: "Striber" },
    { id: "prikker", navn: "Prikker" },
    { id: "camo", navn: "Camouflage" },
  ];
  // farven, hvis man vælger mønster uden at have valgt en farve
  const STD_FARVE = { skjorte: "#e8dccb", underdel: "#7fa6c8", sko: "#f0ede6" };
  window.TOEJ_MOENSTRE = MOENSTRE;

  function hexRgb(h) {
    h = (h || "#888888").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function bland(c, mod, t) {
    return "rgb(" + c.map(function (v, i) { return Math.round(v + (mod[i] - v) * t); }).join(",") + ")";
  }
  const stofGemmer = {};
  function stofBillede(farve, moenster) {
    const noegle = farve + "|" + moenster;
    if (stofGemmer[noegle]) return stofGemmer[noegle];
    const c = hexRgb(farve);
    const base = bland(c, c, 0), moerk = bland(c, [20, 14, 12], 0.42), moerkest = bland(c, [10, 8, 8], 0.62),
      lys = bland(c, [255, 252, 245], 0.45), hvid = bland(c, [255, 255, 255], 0.75);
    let s = 8;
    if (moenster === "striber") s = 4;
    if (moenster === "prikker") s = 6;
    const t = document.createElement("canvas");
    t.width = s; t.height = s;
    const g = t.getContext("2d");
    g.fillStyle = base;
    g.fillRect(0, 0, s, s);
    function px(x, y, f) { g.fillStyle = f; g.fillRect(x, y, 1, 1); }
    if (moenster === "tern") {
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
        const lodret = x < 2, vandret = y < 2;
        if (lodret && vandret) px(x, y, moerkest);
        else if (lodret || vandret) px(x, y, moerk);
        else if (x === 5 || y === 5) px(x, y, lys);
      }
    } else if (moenster === "striber") {
      g.fillStyle = hvid;
      g.fillRect(0, 2, s, 2);
    } else if (moenster === "prikker") {
      px(1, 1, hvid); px(4, 4, hvid);
    } else if (moenster === "camo") {
      const kort = ["..##....", ".####..x", "..##..xx", "x.....xx", "xx..##..", "x..####.", "...##...", "..xx...."];
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        if (kort[y][x] === "#") px(x, y, moerk);
        else if (kort[y][x] === "x") px(x, y, lys);
      }
    }
    stofGemmer[noegle] = t;
    return t;
  }
  function fyldFor(ctx, farver, o) {
    const m = farver[o + "Moenster"];
    const farve = farver[o] || STD_FARVE[o];
    if (!m) return farver[o];
    return ctx.createPattern(stofBillede(farve, m), "repeat");
  }

  // farvetFigur fra js/figur.js, nu med mønstre
  farvetFigur = function (d, farver) {
    if (!farver) return null;
    const bukser = farver.bukser && typeof BUKSER !== "undefined" ?
      BUKSER.find(function (b) { return b.id === farver.bukser; }) : null;
    const brugte = FARVE_OMRAADER.filter(function (o) {
      return farver[o] || farver[o + "Moenster"] || (bukser && (o === "underdel" || o === "stroemper"));
    });
    if (brugte.length === 0) return null;
    if (!klar(d.lag)) return null;

    const noegle = d.noegle + "|" + (bukser ? bukser.id : "") + "|" +
      brugte.map(function (o) { return o + (farver[o] || "") + (farver[o + "Moenster"] || ""); }).join();
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
        farvOmraade(o, fyldFor(hc, farver, o));
      }
    });
    farveGemmer[noegle] = ud;
    farveAntal++;
    return ud;
  };

  // ----- 3) Tøjet fra Shoppen -----
  if (typeof TOEJ_VARER === "undefined") return;

  // bedre navne og mønstre, så tøjet på figuren ligner billedet i Shoppen
  const RETTET = {
    "pige-overdel-08": { navn: "Grøn top" },
    "pige-overdel-24": { navn: "Grøn trøje" },
    "pige-overdel-25": { navn: "Grøn trøje 2" },
    "pige-underdel-07": { navn: "Grå shorts" },
    "pige-underdel-10": { navn: "Ternede bukser", farve: "#9b2a24", moenster: "tern" },
    "pige-underdel-13": { navn: "Sorte shorts" },
    "dreng-overdel-05": { navn: "Grøn t-shirt" },
    "dreng-overdel-08": { navn: "Ternet skjorte", farve: "#9a2e27", moenster: "tern" },
    "dreng-overdel-23": { navn: "Ternet jakke", farve: "#8e2a24", moenster: "tern" },
    "dreng-underdel-06": { navn: "Camo bukser", farve: "#5a5a3e", moenster: "camo" },
    "dreng-underdel-07": { navn: "Camo bukser 2", farve: "#606046", moenster: "camo" },
    "dreng-sko-07": { navn: "Grønne sko" },
  };
  TOEJ_VARER.forEach(function (v) { if (RETTET[v.id]) Object.assign(v, RETTET[v.id]); });

  // skoene kan ses nu
  TOEJ_FIGUR_OMR.sko = "sko";

  function erEjer() {
    return typeof EJERE !== "undefined" && typeof FIGUR !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0;
  }

  // Tag på: farven OG mønsteret kommer på figuren
  const tagToejPaaFoer = tagToejPaa;
  tagToejPaa = function (v) {
    tagToejPaaFoer(v);
    const type = toejFigur(v), omr = TOEJ_FIGUR_OMR[v.slot];
    const fv = garderobe.farver && garderobe.farver[type];
    if (!fv || !omr) return;
    if (v.moenster) fv[omr + "Moenster"] = v.moenster;
    else delete fv[omr + "Moenster"];
    gemGarderobe();
    tegnForhaandsvisning();
  };

  // Tag af: figuren får sit eget tøj igen
  function tagToejAf(v) {
    const type = toejFigur(v), omr = TOEJ_FIGUR_OMR[v.slot];
    const fv = garderobe.farver && garderobe.farver[type];
    if (fv && omr) { delete fv[omr]; delete fv[omr + "Moenster"]; }
    if (garderobe.ting && garderobe.ting[type]) delete garderobe.ting[type]["butik-" + v.slot];
    gemGarderobe();
    tegnForhaandsvisning();
    if (typeof besked !== "undefined" && besked) besked.textContent = "Du tog " + v.navn.toLowerCase() + " af";
    if (typeof svaev === "function") svaev("👋");
  }
  window.tagToejAf = tagToejAf;

  // en "Tag af"-knap ved siden af Køb/Tag på-knappen
  function tagAfKnap(id, efter, vare) {
    let knap = document.getElementById(id);
    const knapEfter = document.getElementById(efter);
    if (!knapEfter) return;
    if (!knap) {
      knap = document.createElement("button");
      knap.id = id;
      knap.className = "toej-tag-af";
      knap.textContent = "Tag af";
      knapEfter.insertAdjacentElement("afterend", knap);
    }
    knap.hidden = !vare || !harToej(vare.id) || !harToejPaa(vare);
    knap.onclick = function (e) {
      e.stopPropagation();
      if (!vare) return;
      tagToejAf(vare);
      visShop();
      if (typeof visLager === "function") visLager();
    };
  }
  const visShopFoerTagAf = visShop;
  visShop = function () {
    visShopFoerTagAf.apply(this, arguments);
    tagAfKnap("shop-tag-af", "shop-koeb", shopFane === "toej" ? toejValgt : null);
  };
  if (typeof visLager === "function") {
    const visLagerFoerTagAf = visLager;
    visLager = function () {
      visLagerFoerTagAf.apply(this, arguments);
      const v = lagerToejValgt && !lagerValgt && (lagerKat === "toej" || lagerKat === "alle") ? lagerToejValgt : null;
      tagAfKnap("lager-tag-af", "lager-saet", v);
      const saet = document.getElementById("lager-saet");
      if (v && harToejPaa(v) && saet) saet.textContent = "Har den på ✔";
    };
  }

  // ----- 4) Skift udseende: dit tøj og mønstre -----
  if (typeof SU_FANER === "undefined") return;
  const BUTIK_DELE = {
    overdel: [{ slags: "butik", slot: "overdel", navn: "Mit tøj", drengNavn: "Mit tøj" }],
    underdel: [{ slags: "butik", slot: "underdel", navn: "Mine bukser" }, { slags: "butik", slot: "sko", navn: "Mine sko" }],
  };
  SU_FANER.forEach(function (fane) {
    if (!BUTIK_DELE[fane.id]) return;
    fane.dele = BUTIK_DELE[fane.id].concat(fane.dele || []);
  });

  function toejHvemType() { return kladde && kladde.type === "dreng" ? "dreng" : kladde && kladde.type === "pige" ? "pige" : null; }

  const deleIFoer = deleI;
  deleI = function (fane) {
    return deleIFoer(fane).filter(function (d) { return d.slags !== "butik" || !!toejHvemType(); });
  };

  function butikVarer(slot) {
    const h = toejHvemType();
    return TOEJ_VARER.filter(function (v) {
      return v.hvem === h && v.slot === slot && (harToej(v.id) || erEjer());
    });
  }

  const tegnSuTingFoer = tegnSuTing;
  tegnSuTing = function () {
    const d = suFane !== "gemte" && suFane !== "krop" ? valgtDel() : null;
    if (!d || d.slags !== "butik") return tegnSuTingFoer.apply(this, arguments);
    const boks = document.getElementById("su-ting");
    boks.innerHTML = "";
    const omr = TOEJ_FIGUR_OMR[d.slot];
    const ting = mineTing();
    const liste = butikVarer(d.slot);
    lavTekst(boks, liste.length ?
      "Dit tøj fra Shoppen. Det kommer på figuren, når den står, går og sidder." :
      "Du har ikke købt noget her endnu. Køb tøj i Shoppen under Tøj 🛒");
    lavIngenKnap(boks, "Mit eget", !ting["butik-" + d.slot], function () {
      foerAendring();
      delete ting["butik-" + d.slot];
      delete mineFarver()[omr];
      delete mineFarver()[omr + "Moenster"];
      tegnSkift();
    });
    liste.forEach(function (v) {
      const knap = lavBilledKnap(boks, toejFil(v), ting["butik-" + d.slot] === v.id, function () {
        foerAendring();
        mineTing()["butik-" + d.slot] = v.id;
        mineFarver()[omr] = v.farve;
        if (v.moenster) mineFarver()[omr + "Moenster"] = v.moenster;
        else delete mineFarver()[omr + "Moenster"];
        tegnSkift();
      });
      knap.title = v.navn;
    });
  };

  // under farverne: vælg mønster (trøje og bukser)
  const tegnPaletFoer = tegnPalet;
  tegnPalet = function (boks, omr) {
    tegnPaletFoer.apply(this, arguments);
    if (!toejHvemType() || (omr !== "skjorte" && omr !== "underdel")) return;
    const r = document.createElement("div");
    r.className = "su-moenstre";
    const t = document.createElement("span");
    t.textContent = "Mønster:";
    r.appendChild(t);
    const nu = mineFarver()[omr + "Moenster"] || "";
    MOENSTRE.forEach(function (m) {
      const knap = document.createElement("button");
      knap.className = "su-chip" + (m.id === nu ? " aktiv" : "");
      knap.textContent = m.navn;
      knap.addEventListener("click", function () {
        foerAendring();
        if (m.id) mineFarver()[omr + "Moenster"] = m.id;
        else delete mineFarver()[omr + "Moenster"];
        tegnSkift();
      });
      r.appendChild(knap);
    });
    // øverst, lige under teksten, så man ser dem uden at rulle
    const foerste = boks.querySelector(".su-farve");
    if (foerste) boks.insertBefore(r, foerste); else boks.appendChild(r);
  };

  // lidt plads til mønster-knapperne og Tag af-knappen
  const stil = document.createElement("style");
  stil.textContent =
    ".su-moenstre{display:flex;flex-wrap:wrap;gap:4px;align-items:center;width:100%;grid-column:1/-1;margin:2px 0 8px}" +
    ".su-moenstre span{font-weight:bold;margin-right:4px}" +
    ".toej-tag-af{margin-left:6px}";
  document.head.appendChild(stil);

  if (typeof tegnForhaandsvisning === "function") tegnForhaandsvisning();
})();
