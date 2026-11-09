// =============================================================
//  🎨 Hotellets farve: hver spiller vælger selv hotellets farve
//  Knappen "🎨 Farve" sidder øverst ved Mentions/Log ud/Normal.
//  Alt det brune/vinrøde (træ, læder, kanter), messingknapperne
//  (også ikon-knapperne i chatbaren) og papiret i vinduerne skifter farve.
//  Valget huskes på computeren: mit-hotel-farve-<navn>
//  "Klassisk" = hotellets egen vinrød/brun med guld.
// =============================================================
(function () {
  if (window.hotelFarveKlar) return;
  window.hotelFarveKlar = true;

  // t = farven til træ/læder, m = farven til messingknapper, p = farven til papiret,
  // lys = hvor meget lysere træet bliver, h/s = farvetone til kanter og tekst
  const FARVER = [
    { id: "klassisk", navn: "Klassisk", prik: "#6b1f2c" },
    { id: "lyseroed", navn: "Lyserød", prik: "#e07aa0", t: "#c25a82", m: "#f2a9c3", p: "#f9dde7", lys: 0.16, h: 335, s: 0.9 },
    { id: "rosa",     navn: "Rosa guld", prik: "#d9a0a0", t: "#a8646c", m: "#ecc39a", p: "#f6e2dc", lys: 0.12, h: 355, s: 0.6 },
    { id: "lilla",    navn: "Lilla",   prik: "#8a5bc4", t: "#7046a8", m: "#c7a6ec", p: "#ece2f8", lys: 0.1, h: 270, s: 0.75 },
    { id: "blaa",     navn: "Blå",     prik: "#2f6aa3", t: "#2c5f96", m: "#9cc4ec", p: "#e1ecf8", lys: 0.08, h: 212, s: 0.8 },
    { id: "turkis",   navn: "Turkis",  prik: "#2a9d9a", t: "#23827f", m: "#94dcd6", p: "#dff4f2", lys: 0.08, h: 178, s: 0.75 },
    { id: "groen",    navn: "Grøn",    prik: "#3f8a4a", t: "#3d7a44", m: "#a9d79d", p: "#e5f2df", lys: 0.06, h: 125, s: 0.7 },
    { id: "gul",      navn: "Gul",     prik: "#e0a419", t: "#b8841c", m: "#f5d36b", p: "#fbf0cf", lys: 0.12, h: 42, s: 0.95 },
    { id: "orange",   navn: "Orange",  prik: "#e07a2c", t: "#c0601c", m: "#f6b77c", p: "#fbe6d3", lys: 0.1, h: 24, s: 0.95 },
    { id: "roed",     navn: "Rød",     prik: "#c8202c", t: "#a8202c", m: "#f09a9a", p: "#f9e0df", lys: 0.06, h: 356, s: 1 },
    { id: "graa",     navn: "Grå",     prik: "#8a8d94", t: "#6d7078", m: "#d4d6da", p: "#eeeff1", lys: 0.1, h: 220, s: 0.12 },
    { id: "sort",     navn: "Sort",    prik: "#1b1c21", t: "#2b2d33", m: "#b9bcc4", p: "#e9e9ec", lys: -0.15, h: 225, s: 0.12 },
  ];
  const TEKSTURER = /url\(['"]?billeder\/ui\/(trae|trae-lys|laeder|messing|papir)\.jpg['"]?\)/;

  function mitNavn() {
    try { if (typeof FIGUR !== "undefined" && FIGUR.navn) return FIGUR.navn; } catch (e) {}
    return "";
  }
  function noegle() { return "mit-hotel-farve-" + mitNavn(); }
  function hent(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gem(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function mitValg() {
    const v = hent(noegle()) || hent("mit-hotel-farve");
    return FARVER.some(function (f) { return f.id === v; }) ? v : "klassisk";
  }

  // ---------- farveregning ----------
  function tilHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, f = mx - mn;
    if (f === 0) return [0, 0, l];
    const s = f / (1 - Math.abs(2 * l - 1));
    let h = mx === r ? ((g - b) / f) % 6 : mx === g ? (b - r) / f + 2 : (r - g) / f + 4;
    return [(h * 60 + 360) % 360, s, l];
  }
  function fraHsl(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  // brun, vinrød og guld (alt mellem lyserød-rød og gul) får temaets farvetone
  function omfarv(r, g, b, F) {
    const hsl = tilHsl(r, g, b);
    if (hsl[1] < 0.08) return null;
    if (!(hsl[0] <= 62 || hsl[0] >= 320)) return null;
    let l = hsl[2];
    if (F.lys < 0 && l < 0.5) l = Math.max(0, l * (1 + F.lys));
    return fraHsl(F.h, Math.min(1, hsl[1] * F.s), l);
  }
  function hex2(n) { return ("0" + n.toString(16)).slice(-2); }
  function omfarvTekst(v, F) {
    v = v.replace(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi, function (hel, x) {
      if (x.length === 3) x = x[0] + x[0] + x[1] + x[1] + x[2] + x[2];
      const n = omfarv(parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), F);
      return n ? "#" + hex2(n[0]) + hex2(n[1]) + hex2(n[2]) : hel;
    });
    return v.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(\s*,\s*[\d.]+)?\)/g, function (hel, r, g, b, a) {
      const n = omfarv(+r, +g, +b, F);
      return n ? (a ? "rgba(" : "rgb(") + n.join(",") + (a || "") + ")" : hel;
    });
  }

  // del "a, b(c, d), e" ved de kommaer, der ikke er inde i parenteser
  function lag(v) {
    const ud = []; let dybde = 0, start = 0;
    for (let i = 0; i < v.length; i++) {
      const c = v[i];
      if (c === "(") dybde++; else if (c === ")") dybde--;
      else if (c === "," && dybde === 0) { ud.push(v.slice(start, i).trim()); start = i + 1; }
    }
    ud.push(v.slice(start).trim());
    return ud;
  }

  // et lag-billede (træ, læder …) får en farvehinde ovenpå med blandingen "color"
  function farvBaggrund(vaerdi, F) {
    const vigtig = /!important\s*$/.test(vaerdi);
    const v = vaerdi.replace(/!important\s*$/, "").trim();
    const ny = [], bland = [];
    lag(v).forEach(function (l) {
      const m = TEKSTURER.exec(l);
      if (m) {
        const slags = m[1];
        const farve = slags === "messing" ? F.m : slags === "papir" ? F.p : F.t;
        const lys = slags === "papir" || slags === "messing" ? 0 : F.lys;
        if (lys > 0) { ny.push("linear-gradient(rgba(255,255,255," + lys + "), rgba(255,255,255," + lys + "))"); bland.push("normal"); }
        if (lys < 0) { ny.push("linear-gradient(rgba(0,0,0," + (-lys) + "), rgba(0,0,0," + (-lys) + "))"); bland.push("normal"); }
        const fy = slags === "papir" ? farve + "99" : farve;     // papiret får kun et strejf af farven
        ny.push("linear-gradient(" + fy + ", " + fy + ")"); bland.push("color");
      }
      ny.push(omfarvTekst(l, F)); bland.push("normal");
    });
    return "background: " + ny.join(", ") + (vigtig ? " !important" : "") + "; background-blend-mode: " + bland.join(", ") + (vigtig ? " !important" : "");
  }

  // regler vi ikke rører: alarmknappen, spillerkortets farvestriber og ejerpanelet (har sin egen 🎨)
  const SPRING_OVER = /#ejer-vindue|hjaelp|#hf-menu|sk-likes|sk-medlem|sk-online|sk-offline|sk-fd|sk-forhold|bs-farver|farve-gitter/;

  function lavCss(F) {
    const kilde = document.getElementById("realistisk-ui-stil");
    const ud = [];
    if (kilde) {
      kilde.textContent.split("\n").forEach(function (linje) {
        const m = /^([^{]+)\{([\s\S]*)\}\s*$/.exec(linje.trim());
        if (!m || SPRING_OVER.test(m[1])) return;
        const dele = [];
        m[2].split(";").forEach(function (d) {
          const i = d.indexOf(":");
          if (i < 0) return;
          const navn = d.slice(0, i).trim(), vaerdi = d.slice(i + 1).trim();
          if ((navn === "background" || navn === "background-image") && TEKSTURER.test(vaerdi)) { dele.push(farvBaggrund(vaerdi, F)); return; }
          const ny = omfarvTekst(vaerdi, F);
          if (ny !== vaerdi) dele.push(navn + ": " + ny);
        });
        let valg = m[1].trim();
        if (valg.indexOf("#skaansom-knap") >= 0) valg += ", #hf-knap";
        if (dele.length) ud.push(valg + " { " + dele.join("; ") + "; }");
      });
    }
    // selve farvemenuen
    const mork = "rgb(" + fraHsl(F.h, Math.min(1, 0.55 * F.s), F.lys < 0 ? 0.13 : 0.24).join(",") + ")";
    ud.push("#hf-menu { background: " + F.p + " !important; border-color: " + mork + " !important; }");
    ud.push("#hf-menu > b { color: " + mork + " !important; }");
    return ud.join("\n");
  }

  // ---------- resten af hotellets stilark (stil.css, vinrødt-temaet, vinduer) ----------
  // Første gang huskes den rigtige farve, så man altid kan skifte tilbage.
  const EGEN = ["hotel-farve-stil", "hotel-farve-fast", "realistisk-ui-stil", "ejer-enkel-stil"];
  const ORIGINAL = new WeakMap();      // regel.style → { egenskab: farve }
  const FARVE_EG = /color|background|shadow|^fill$|^stroke$|^outline/;
  let aktiv = null;                    // det valgte tema (null = klassisk)
  function regelListe(regler, F) {
    for (let i = 0; i < regler.length; i++) {
      const r = regler[i];
      if (r.cssRules) regelListe(r.cssRules, F);
      if (!r.style || (r.selectorText && SPRING_OVER.test(r.selectorText))) continue;
      let gemt = ORIGINAL.get(r.style);
      if (!gemt) {
        if (!F) continue;            // aldrig farvet, intet at sætte tilbage
        gemt = {};
        for (let j = 0; j < r.style.length; j++) {
          const eg = r.style[j];
          if (!FARVE_EG.test(eg)) continue;
          const v = r.style.getPropertyValue(eg);
          if (!v || v.indexOf("url(") >= 0 || v.indexOf("var(") >= 0) continue;
          if (omfarvTekst(v, FARVER[1]) !== v) gemt[eg] = [v, r.style.getPropertyPriority(eg)];
        }
        ORIGINAL.set(r.style, gemt);
      }
      Object.keys(gemt).forEach(function (eg) {
        const v = F ? omfarvTekst(gemt[eg][0], F) : gemt[eg][0];
        if (r.style.getPropertyValue(eg) !== v) r.style.setProperty(eg, v, gemt[eg][1]);
      });
    }
  }
  function alleArk(F) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const ark = document.styleSheets[i];
      const node = ark.ownerNode;
      if (node && EGEN.indexOf(node.id) >= 0) continue;
      try { regelListe(ark.cssRules, F); } catch (e) {}   // Firefox + file:///: se vinEt herunder
    }
  }

  // Firefox + file:///: stilarkene kan ikke læses, så vinrødt-temaet farver hvert element.
  // Mens det sker, får brune/vinrøde/guld farver også det valgte tema.
  let iElement = false;
  if (typeof vinFarve === "function" && typeof vinEt === "function") {
    const gammelFarve = vinFarve, gammelEt = vinEt;
    vinFarve = function (r, g, b) {
      const ny = gammelFarve(r, g, b);
      if (!iElement || !aktiv) return ny;
      const fra = ny || [r, g, b];
      return omfarv(fra[0], fra[1], fra[2], aktiv) || ny;
    };
    vinEt = function (el) {
      iElement = !!aktiv && !el.closest("#ejer-vindue, #hjaelp-knap, #hjaelp-alarm, #hf-menu, .bs-farver, .farve-gitter");
      try { gammelEt(el); } finally { iElement = false; }
    };
  }

  let stil = null;
  function brug(id, fraKlik) {
    const F = FARVER.find(function (f) { return f.id === id; }) || FARVER[0];
    aktiv = F.t ? F : null;
    document.documentElement.dataset.hotelFarve = F.id;
    if (!aktiv) { if (stil) { stil.remove(); stil = null; } }
    else {
      if (!stil) { stil = document.createElement("style"); stil.id = "hotel-farve-stil"; }
      stil.textContent = lavCss(F);
      document.head.appendChild(stil);              // altid sidst, så den vinder
      if (typeof vinFaerdige !== "undefined" && stil.sheet) vinFaerdige.add(stil.sheet);
    }
    alleArk(aktiv);
    if (menu) menu.querySelectorAll("button[data-farve]").forEach(function (b) { b.classList.toggle("valgt", b.dataset.farve === F.id); });
    if (typeof window.ruiOpfrisk === "function") try { window.ruiOpfrisk(); } catch (e) {}
    // Ejerpanelet følger med, når det har samme farve
    const panelId = { lyseroed: "lyseroed", blaa: "blaa", groen: "groen", gul: "gul", sort: "sort", klassisk: "vinroed" }[F.id];
    if (fraKlik && panelId && mitNavn()) {
      try { localStorage.setItem("mit-hotel-panel-farve-" + mitNavn(), panelId); } catch (e) {}
      const ev = document.getElementById("ejer-vindue");
      if (ev && ev.classList.contains("ee-ny")) ev.dataset.eeFarve = panelId;
    }
  }
  // nye stilark, som andre scripts laver senere (efter vinrødt-temaet har farvet dem)
  new MutationObserver(function (liste) {
    if (!aktiv) return;
    if (liste.some(function (m) { return Array.prototype.some.call(m.addedNodes, function (n) { return n.nodeName === "STYLE" || n.nodeName === "LINK"; }); }))
      setTimeout(function () { alleArk(aktiv); }, 30);
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", function () { setTimeout(function () { alleArk(aktiv); }, 50); });
  setTimeout(function () { alleArk(aktiv); }, 1700);

  // ---------- knappen og menuen ----------
  let menu = null;
  function lavKnap() {
    if (document.getElementById("hf-knap")) return true;
    const ved = document.getElementById("skaansom-knap") || document.getElementById("log-ud-knap") || document.getElementById("mention-knap");
    if (!ved) return false;
    const knap = document.createElement("button");
    knap.type = "button";
    knap.id = "hf-knap";
    knap.className = ved.className;
    knap.title = "Skift hotellets farve (kun for dig)";
    knap.textContent = "🎨 Farve";
    ved.after(knap);

    menu = document.createElement("div");
    menu.id = "hf-menu";
    menu.hidden = true;
    menu.innerHTML = "<b>Hotellets farve</b><small>Kun for dig. Hotellet husker det.</small>" + FARVER.map(function (f) {
      return "<button type='button' data-farve='" + f.id + "'><i style='background:" + f.prik + "'></i>" + f.navn + "</button>";
    }).join("");
    document.body.appendChild(menu);

    knap.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      if (!menu.hidden) {
        const r = knap.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8)) + "px";
        menu.style.top = (r.bottom + 8) + "px";
      }
    });
    menu.addEventListener("click", function (e) {
      e.stopPropagation();
      const b = e.target.closest("button[data-farve]");
      if (!b) return;
      gem(noegle(), b.dataset.farve);
      gem("mit-hotel-farve", b.dataset.farve);
      brug(b.dataset.farve, true);
    });
    document.addEventListener("click", function () { menu.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") menu.hidden = true; });
    brug(mitValg());
    return true;
  }

  const fast = document.createElement("style");
  fast.id = "hotel-farve-fast";
  fast.textContent =
    "#hf-menu { position: fixed; z-index: 99999; width: 300px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 12px;" +
    " background: #fbf3e2; border: 2px solid #2a0d0a; border-radius: 10px; box-shadow: 0 0 0 2px #9c7430, 0 14px 30px rgba(0,0,0,.5);" +
    " font-family: Georgia, 'Times New Roman', serif; }" +
    "#hf-menu[hidden] { display: none; }" +
    "#hf-knap { margin-left: 8px; padding: 4px 10px; border-radius: 8px; cursor: pointer; font: bold 13px Georgia, 'Times New Roman', serif;" +
    " background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 50%, rgba(0,0,0,.16)), url('billeder/ui/messing.jpg'), #d8b46a;" +
    " border: 1px solid #5e3f12; color: #3a2408; text-shadow: 0 1px 0 rgba(255,240,200,.7); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 2px 4px rgba(0,0,0,.45); }" +
    "#hf-knap:hover { filter: brightness(1.08); }" +
    "#hf-menu > b { grid-column: 1 / 3; font-size: 15px; color: #6d1a28; }" +
    "#hf-menu > small { grid-column: 1 / 3; color: #7a5a40; font-style: italic; font-size: 12px; margin: -4px 0 4px; }" +
    "#hf-menu button { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 2px solid rgba(0,0,0,.08); border-radius: 8px;" +
    " background: rgba(255,255,255,.75); color: #3a1d14; font: 13px Georgia, serif; cursor: pointer; text-align: left; }" +
    "#hf-menu button:hover { border-color: rgba(0,0,0,.3); }" +
    "#hf-menu button.valgt { border-color: #3a1d14; font-weight: bold; background: #fff; }" +
    "#hf-menu i { width: 20px; height: 20px; border-radius: 50%; flex: none; box-shadow: inset 0 0 0 2px rgba(255,255,255,.5), 0 0 0 1px rgba(0,0,0,.3); }";
  document.head.appendChild(fast);

  // vent på toppen og på de realistiske vinduer
  let forsoeg = 0;
  (function vent() {
    forsoeg++;
    if (lavKnap() && (document.getElementById("realistisk-ui-stil") || forsoeg > 40)) { brug(mitValg()); return; }
    setTimeout(vent, 150);
  })();

  // logger man ind som en anden, kommer deres farve frem
  let navnFoer = mitNavn();
  setInterval(function () { if (mitNavn() !== navnFoer) { navnFoer = mitNavn(); brug(mitValg()); } }, 1000);
})();
