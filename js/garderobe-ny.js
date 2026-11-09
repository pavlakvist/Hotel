// =============================================================
//  👗 Ny garderobe (9/11) — bygget efter Pavlas tegning:
//   • figuren til venstre i et lille omklædningsrum (drej med pilene)
//   • knapper i siden: pige, dreng, tilfældig, fortryd, gør igen
//   • faner øverst: Overdele, Underdele, Sko, Hår, Krop
//   • gitter med tøjet i midten
//   • til højre: det valgte stykke tøj, farvepalet, mønster og
//     den store "Gem udseende"-knap
//   • forneden: dine gemte udseender (+ gemmer det, du har på nu)
//   • 🎨 i toppen: vælg garderobens farve. Den bliver husket.
//  Alt det gamle (tøj, frisurer, farver, mønstre) virker som før,
//  det står bare et nyt sted. Gemmes stadig, når du trykker Gem.
//  Slå fra: localStorage "mit-hotel-ny-garderobe" = "fra".
//  (Hentes fra js/panel-forklaring.js, så hotel.html ikke røres.)
// =============================================================
(function () {
  if (typeof SU_FANER === "undefined" || typeof tegnSkift !== "function") return;
  try { if (localStorage.getItem("mit-hotel-ny-garderobe") === "fra") return; } catch (e) {}

  const vindue = document.getElementById("garderobe-vindue");
  const boks = vindue && vindue.querySelector(".su-boks");
  if (!boks || vindue.classList.contains("gn")) return;

  const FARVE_NOEGLE = "mit-hotel-garderobe-farve";

  // Garderobens farver (man vælger med 🎨). Lyserød er som på Pavlas tegning.
  const TEMAER = [
    { id: "lyseroed", navn: "Lyserød", m: "#8e3a59", a: "#d9668f", l: "#f7d6e2", b: "#fff3f7", k: "#e8b6c8", t: "#5a2338", w: "#fffafc", h: "#8e3a59" },
    { id: "vinroed", navn: "Vinrød", m: "#5c1626", a: "#9b2c45", l: "#f2dccd", b: "#fbf3ea", k: "#d9b48a", t: "#3e1a14", w: "#fffaf3", h: "#5c1626" },
    { id: "blaa", navn: "Blå", m: "#26426f", a: "#4f7fc4", l: "#d8e5f6", b: "#f3f7fd", k: "#a9c1e2", t: "#1d2b45", w: "#fbfdff", h: "#26426f" },
    { id: "lilla", navn: "Lilla", m: "#4d2c6e", a: "#8d5cc4", l: "#e6d9f5", b: "#f8f3fd", k: "#c6aee3", t: "#2f1d45", w: "#fdfaff", h: "#4d2c6e" },
    { id: "brun", navn: "Brun", m: "#5b2c16", a: "#a8642f", l: "#f2e3d3", b: "#fcf6ee", k: "#d8b48a", t: "#3a1d14", w: "#fffcf6", h: "#5b2c16" },
    { id: "nat", navn: "Nat", m: "#17141c", a: "#b06a9a", l: "#3a3343", b: "#26212d", k: "#4d4458", t: "#f3e9f6", w: "#2f2938", h: "#f0c8e0" },
  ];

  // Fanerne. "kilde" er fanen i den gamle garderobe, delene kommer fra.
  function erSko(d) { return d.slot === "sko" || d.omr === "sko"; }
  const FANER = [
    { id: "overdel", navn: "Overdele", kilde: "overdel", ikon: "overdel" },
    { id: "underdel", navn: "Underdele", kilde: "underdel", ikon: "underdel", filter: function (d) { return !erSko(d); } },
    { id: "sko", navn: "Sko", kilde: "underdel", ikon: "sko", filter: erSko },
    { id: "haar", navn: "Hår", kilde: "haar", ikon: "haar" },
    { id: "krop", navn: "Krop", kilde: "krop", ikon: "krop" },
  ];

  let gnFane = "overdel";
  let gnFarveNr = 0;
  let gnGentag = [];      // "gør igen" efter fortryd

  // ----- Hjælpere -----
  function lav(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  }
  function figurHvem() { return kladde && kladde.type === "dreng" ? "dreng" : "pige"; }
  function faneDef(id) { return FANER.find(function (f) { return f.id === id; }); }
  function deleFor(f) {
    const kilde = faneMedId(f.kilde);
    if (!kilde) return [];
    const alle = deleI(kilde);
    return f.filter ? alle.filter(f.filter) : alle;
  }
  function tingDele(f) { return deleFor(f).filter(function (d) { return d.slags !== "farve"; }); }
  function farveDele(f) { return deleFor(f).filter(function (d) { return d.slags === "farve"; }); }
  function synligeFaner() {
    return FANER.filter(function (f) { return f.id === "krop" || deleFor(f).length > 0; });
  }
  function vaelgDel(f, d) {
    suFane = f.kilde;
    const alle = deleI(faneMedId(f.kilde));
    const nr = alle.indexOf(d);
    suDel = nr >= 0 ? nr : 0;
  }

  // Sørg for at fanen findes for figuren, og at der er valgt noget tøj (ikke en farve) i midten
  function sikrValg() {
    const synlige = synligeFaner();
    let f = faneDef(gnFane);
    if (!f || synlige.indexOf(f) < 0) { f = synlige[0] || FANER[4]; gnFane = f.id; }
    suFane = f.kilde;
    const ting = tingDele(f);
    const nu = suFane === "krop" ? null : valgtDel();
    if (ting.length && (!nu || ting.indexOf(nu) < 0)) vaelgDel(f, ting[0]);
    const farver = farveDele(f);
    if (gnFarveNr >= farver.length) gnFarveNr = 0;
  }

  // ----- Garderobens farve (husket) -----
  function hentTema() {
    let id = "lyseroed";
    try { id = localStorage.getItem(FARVE_NOEGLE) || id; } catch (e) {}
    return TEMAER.find(function (t) { return t.id === id; }) || TEMAER[0];
  }
  function saetTema(t) {
    // farverne ligger i variabler, så vinrød-temaet ikke farver dem om
    vindue.style.setProperty("--gm", t.m);
    vindue.style.setProperty("--ga", t.a);
    vindue.style.setProperty("--gl", t.l);
    vindue.style.setProperty("--gb", t.b);
    vindue.style.setProperty("--gk", t.k);
    vindue.style.setProperty("--gt", t.t);
    vindue.style.setProperty("--gw", t.w);
    vindue.style.setProperty("--gh", t.h);
    vindue.dataset.gnTema = t.id;
  }

  // =============================================================
  //  Byg det nye vindue af de gamle dele
  // =============================================================
  vindue.classList.add("gn");
  boks.classList.add("gn-boks");
  const top = boks.querySelector(".su-top");
  const titel = document.getElementById("su-titel");
  const lukKnap = document.getElementById("gv-luk");
  const faner = document.getElementById("su-faner");
  const under = document.getElementById("su-under");
  const tingBoks = document.getElementById("su-ting");
  const figurLaerred = document.getElementById("su-figur");
  const drejV = document.getElementById("su-drej-venstre");
  const drejH = document.getElementById("su-drej-hoejre");
  const fortrydKnap = document.getElementById("su-fortryd");
  const fjernKnap = document.getElementById("su-fjern");
  const tilfaeldigKnap = document.getElementById("gv-tilfaeldig");
  const gemKnap = document.getElementById("su-gem");

  // Toppen: logo, titel, 🎨, 🗑, ✕
  const logo = lav("div", "gn-logo");
  logo.innerHTML = "<span class='gn-krone'>👑</span><span>HELLO<br>VERA</span>";
  top.insertBefore(logo, top.firstChild);
  titel.textContent = "Garderobe";
  const temaKnap = lav("button", "gn-top-knap", "🎨");
  temaKnap.title = "Vælg garderobens farve";
  fjernKnap.classList.add("gn-top-knap");
  fjernKnap.title = "Fjern farven/tøjet, du står på";
  lukKnap.classList.add("gn-top-knap");
  top.insertBefore(temaKnap, lukKnap);
  top.insertBefore(fjernKnap, lukKnap);

  // Lille vindue med farverne til garderoben
  const temaValg = lav("div", "gn-tema-valg");
  temaValg.hidden = true;
  temaValg.appendChild(lav("b", "", "Garderobens farve"));
  const temaRaekke = lav("div", "gn-tema-raekke");
  temaValg.appendChild(temaRaekke);
  TEMAER.forEach(function (t) {
    const k = lav("button", "gn-tema");
    k.title = t.navn;
    k.style.background = "linear-gradient(135deg, " + t.a + " 0 50%, " + t.m + " 50% 100%)";
    k.dataset.tema = t.id;
    const n = lav("span", "", t.navn);
    const hel = lav("div", "gn-tema-hel");
    hel.appendChild(k);
    hel.appendChild(n);
    k.addEventListener("click", function () {
      try { localStorage.setItem(FARVE_NOEGLE, t.id); } catch (e) {}
      saetTema(t);
      visTemaValgt();
      temaValg.hidden = true;
    });
    temaRaekke.appendChild(hel);
  });
  function visTemaValgt() {
    temaRaekke.querySelectorAll(".gn-tema").forEach(function (k) {
      k.classList.toggle("aktiv", k.dataset.tema === vindue.dataset.gnTema);
    });
  }
  temaKnap.addEventListener("click", function (e) {
    e.stopPropagation();
    temaValg.hidden = !temaValg.hidden;
    visTemaValgt();
  });
  boks.addEventListener("click", function (e) {
    if (!temaValg.hidden && !e.target.closest(".gn-tema-valg") && e.target !== temaKnap) temaValg.hidden = true;
  });
  boks.appendChild(temaValg);

  // Selve indholdet
  const indhold = boks.querySelector(".su-indhold");
  const gamleVenstre = indhold.querySelector(".su-venstre");
  const gamleHoejre = indhold.querySelector(".su-hoejre");
  const krop = lav("div", "gn-krop");

  // venstre: knapper i siden, figuren, gemte udseender
  const venstre = lav("div", "gn-venstre");
  const rum = lav("div", "gn-rum");
  const sideKnapper = lav("div", "gn-side");
  const pigeKnap = lav("button", "gn-rund", "♀");
  pigeKnap.title = "Pige";
  const drengKnap = lav("button", "gn-rund", "♂");
  drengKnap.title = "Dreng";
  const gentagKnap = lav("button", "gn-rund", "↷");
  gentagKnap.title = "Gør igen";
  [tilfaeldigKnap, fortrydKnap].forEach(function (k) { k.classList.add("gn-rund"); });
  tilfaeldigKnap.textContent = "🎲";
  fortrydKnap.textContent = "↶";
  fortrydKnap.title = "Fortryd";
  [pigeKnap, drengKnap, tilfaeldigKnap, fortrydKnap, gentagKnap].forEach(function (k) { sideKnapper.appendChild(k); });
  const scene = lav("div", "gn-scene");
  scene.appendChild(lav("div", "gn-spejl"));
  scene.appendChild(lav("div", "gn-lys"));
  scene.appendChild(lav("div", "gn-taeppe"));
  scene.appendChild(figurLaerred);
  drejV.className = "gn-drej venstre";
  drejH.className = "gn-drej hoejre";
  drejV.textContent = "⟲";
  drejH.textContent = "⟳";
  scene.appendChild(drejV);
  scene.appendChild(drejH);
  rum.appendChild(sideKnapper);
  rum.appendChild(scene);
  venstre.appendChild(rum);
  const gemteBoks = lav("div", "gn-gemte");
  venstre.appendChild(gemteBoks);

  // højre del: faner, (under-valg + gitter) og panelet med farver
  const hoejreDel = lav("div", "gn-hoved");
  const midt = lav("div", "gn-midt");
  const gitterRamme = lav("div", "gn-gitter-ramme");
  gitterRamme.appendChild(under);
  gitterRamme.appendChild(tingBoks);
  const panel = lav("div", "gn-panel");
  midt.appendChild(gitterRamme);
  midt.appendChild(panel);
  hoejreDel.appendChild(faner);
  hoejreDel.appendChild(midt);

  krop.appendChild(venstre);
  krop.appendChild(hoejreDel);
  indhold.innerHTML = "";
  indhold.appendChild(krop);
  // de gamle beholdere er tomme nu; de knapper vi ikke bruger, gemmes væk
  [gamleVenstre, gamleHoejre].forEach(function (e) { if (e) { e.hidden = true; indhold.appendChild(e); } });

  saetTema(hentTema());

  // vinduet er større nu: start midt på skærmen (dobbeltklik på toppen = tilbage på plads)
  try {
    if (localStorage.getItem("mit-hotel-ny-garderobe-flyttet") !== "ja") {
      localStorage.setItem("mit-hotel-ny-garderobe-flyttet", "ja");
      top.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    }
  } catch (e) {}

  // ----- Pige / dreng -----
  function skiftType(type) {
    if (!kladde || kladde.type === type || !FIGURER[type]) return;
    foerAendring();
    kladde.type = type;
    tegnSkift();
  }
  pigeKnap.addEventListener("click", function () { skiftType("pige"); });
  drengKnap.addEventListener("click", function () { skiftType("dreng"); });

  // ----- Fortryd og gør igen -----
  const foerAendringFoer = foerAendring;
  foerAendring = function () {
    gnGentag = [];
    return foerAendringFoer.apply(this, arguments);
  };
  // før det gamle fortryd: husk hvordan det så ud, så man kan gøre det igen
  fortrydKnap.addEventListener("click", function () {
    if (kladde && fortrydListe.length) gnGentag.push(kopi(kladde));
  }, true);
  gentagKnap.addEventListener("click", function () {
    if (!kladde || !gnGentag.length) return;
    fortrydListe.push(kopi(kladde));
    kladde = gnGentag.pop();
    tegnSkift();
  });

  // =============================================================
  //  Tegn de nye dele
  // =============================================================
  function faneIkon(f) {
    const h = figurHvem();
    if (f.ikon === "overdel" || f.ikon === "underdel" || f.ikon === "sko") return "billeder/toej/butik/" + h + "-" + f.ikon + "-01.png";
    if (f.ikon === "haar") return "billeder/toej/" + h + "/frisure-01.png";
    return null;
  }

  tegnSuFaner = function () {
    faner.innerHTML = "";
    faner.className = "su-faner gn-faner";
    synligeFaner().forEach(function (f) {
      const k = lav("button", "gn-fane");
      k.classList.toggle("aktiv", f.id === gnFane);
      k.title = f.navn;
      const sti = faneIkon(f);
      if (sti) {
        const b = lav("img");
        b.src = sti;
        b.alt = "";
        b.onerror = function () { b.remove(); };
        k.appendChild(b);
      } else {
        // Krop: et lille billede af din egen figur
        const c = lav("canvas");
        c.width = 40; c.height = 40;
        tegnHoved(c);
        k.appendChild(c);
      }
      k.appendChild(lav("span", "", f.navn));
      k.addEventListener("click", function () {
        if (gnFane === f.id) return;
        gnFane = f.id;
        gnFarveNr = 0;
        const ting = tingDele(f);
        suFane = f.kilde;
        if (ting.length) vaelgDel(f, ting[0]); else suDel = 0;
        tegnSkift();
      });
      faner.appendChild(k);
    });
  };

  function tegnHoved(c) {
    if (!kladde) return;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(c.width / 2, 92);
    g.scale(0.62, 0.62);
    try { tegnMenneske(g, 0, 0, { type: kladde.type, farver: kladde.farver || {}, ting: kladde.ting || {}, frisure: kladde.frisure || {} }, "ned", null, null); } catch (e) {}
    g.restore();
  }

  // Rækken over gitteret: hvad fanen hedder + valg (fx Form / Mine bukser)
  tegnSuUnder = function () {
    under.innerHTML = "";
    under.className = "su-under gn-under";
    const f = faneDef(gnFane);
    if (!f) return;
    under.appendChild(lav("span", "gn-overskrift", f.navn));
    const ting = tingDele(f);
    if (ting.length > 1) {
      const nu = valgtDel();
      ting.forEach(function (d) {
        const k = lav("button", "gn-pille", delNavn(d));
        k.classList.toggle("aktiv", d === nu);
        k.addEventListener("click", function () {
          vaelgDel(f, d);
          tegnSkift();
        });
        under.appendChild(k);
      });
    }
  };

  // Krop-fanen: vælg figur (med billeder i stedet for tekst)
  const tegnSuTingFoerNy = tegnSuTing;
  tegnSuTing = function () {
    if (suFane !== "krop") {
      const r = tegnSuTingFoerNy.apply(this, arguments);
      ryd();
      return r;
    }
    tingBoks.innerHTML = "";
    lavTekst(tingBoks, "Vælg din figur.");
    const figurer = alleFigurer();
    for (const id in figurer) {
      const k = lav("button", "su-ting-knap su-stil-knap");
      k.classList.toggle("aktiv", kladde.type === id);
      k.title = figurer[id];
      const c = lav("canvas");
      c.width = 60; c.height = 92;
      const u = { type: id, farver: kladde.farver || {}, ting: kladde.ting || {}, frisure: kladde.frisure || {} };
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
      k.appendChild(lav("span", "su-stil-navn", figurer[id]));
      k.addEventListener("click", function () { skiftType(id); });
      tingBoks.appendChild(k);
    }
  };
  // farver og mønstre hører til panelet til højre, ikke gitteret
  function ryd() {
    tingBoks.querySelectorAll(".su-farve, .su-moenstre").forEach(function (e) { e.remove(); });
  }

  // ----- Panelet til højre -----
  function tegnPanel() {
    panel.innerHTML = "";
    const f = faneDef(gnFane);
    const ydre = panel;
    const rul = lav("div", "gn-panel-rul");
    ydre.appendChild(rul);
    const panelInd = rul;

    // 1) det valgte stykke tøj, med pile til forrige/næste
    const valgt = lav("div", "gn-valgt");
    const forrige = lav("button", "gn-pil", "◀");
    const naeste = lav("button", "gn-pil", "▶");
    forrige.title = "Forrige";
    naeste.title = "Næste";
    const billede = lav("div", "gn-valgt-billede");
    valgt.appendChild(forrige);
    valgt.appendChild(billede);
    valgt.appendChild(naeste);
    panelInd.appendChild(valgt);
    const navn = lav("div", "gn-valgt-navn");
    panelInd.appendChild(navn);
    visValgt(billede, navn);
    function hop(retning) {
      const knapper = Array.prototype.slice.call(tingBoks.querySelectorAll(".su-ting-knap"));
      if (!knapper.length) return;
      let nr = knapper.findIndex(function (k) { return k.classList.contains("aktiv"); });
      nr = nr < 0 ? 0 : (nr + retning + knapper.length) % knapper.length;
      knapper[nr].click();
    }
    forrige.addEventListener("click", function () { hop(-1); });
    naeste.addEventListener("click", function () { hop(1); });

    // 2) farver
    const farver = f ? farveDele(f) : [];
    const farveKort = lav("div", "gn-kort gn-farve-kort");
    panelInd.appendChild(farveKort);
    if (!farver.length) {
      farveKort.appendChild(lav("p", "gn-lille", f && f.id === "krop" ?
        "Vælg pige eller dreng her eller med ♀ og ♂ til venstre." :
        "Det her kan ikke få en anden farve."));
    } else {
      const d = farver[gnFarveNr] || farver[0];
      const hoved = lav("div", "gn-kort-top");
      hoved.appendChild(lav("b", "", "Farve"));
      if (farver.length > 1) {
        farver.forEach(function (fd, nr) {
          const k = lav("button", "gn-pille lille", delNavn(fd).replace(/^Farve på /, ""));
          k.classList.toggle("aktiv", nr === gnFarveNr);
          k.addEventListener("click", function () { gnFarveNr = nr; tegnPanel(); });
          hoved.appendChild(k);
        });
      } else {
        hoved.appendChild(lav("span", "gn-lille", delNavn(d).replace(/^Farve på /, "")));
      }
      farveKort.appendChild(hoved);
      const palet = lav("div", "gn-palet");
      farveKort.appendChild(palet);
      tegnPalet(palet, d.omr);
      // din egen farve (lille farvevælger)
      const egen = lav("label", "gn-egen");
      egen.title = "Vælg din helt egen farve";
      const input = lav("input");
      input.type = "color";
      input.value = /^#[0-9a-f]{6}$/i.test(mineFarver()[d.omr] || "") ? mineFarver()[d.omr] : "#d9668f";
      input.addEventListener("change", function () {
        foerAendring();
        mineFarver()[d.omr] = input.value.toLowerCase();
        tegnSkift();
      });
      egen.appendChild(input);
      egen.appendChild(lav("span", "", "Egen farve"));
      palet.appendChild(egen);
      // mønstre og hår-effekter flyttes ned i "Detaljer"
      const ekstra = palet.querySelectorAll(".su-moenstre");
      if (ekstra.length) {
        const det = lav("div", "gn-kort gn-detaljer");
        det.appendChild(lav("b", "", "Detaljer"));
        ekstra.forEach(function (e) { det.appendChild(e); });
        panelInd.appendChild(det);
      }
    }

    // 3) Gem udseende
    gemKnap.className = "su-gem gn-gem";
    gemKnap.innerHTML = "<span>✔</span> Gem udseende";
    ydre.appendChild(gemKnap);
  }

  // Vis billedet af det, der er valgt i gitteret
  function visValgt(billede, navn) {
    const aktiv = tingBoks.querySelector(".su-ting-knap.aktiv");
    billede.innerHTML = "";
    if (!aktiv) { navn.textContent = ""; return; }
    const img = aktiv.querySelector("img");
    const c = aktiv.querySelector("canvas");
    if (img) {
      const ny = lav("img");
      ny.src = img.src;
      ny.alt = "";
      billede.appendChild(ny);
    } else if (c) {
      const ny = lav("canvas");
      ny.width = c.width; ny.height = c.height;
      const kopier = function () {
        const g = ny.getContext("2d");
        g.clearRect(0, 0, ny.width, ny.height);
        g.drawImage(c, 0, 0);
      };
      kopier();
      setTimeout(kopier, 450);
      setTimeout(kopier, 1600);
      billede.appendChild(ny);
    } else {
      billede.appendChild(lav("span", "gn-valgt-tekst", aktiv.textContent || ""));
    }
    const sn = aktiv.querySelector(".su-stil-navn");
    navn.textContent = aktiv.title || (sn && sn.textContent) || (img || c ? "" : "");
  }

  // ----- Gemte udseender forneden -----
  function tegnGemteRaekke() {
    gemteBoks.innerHTML = "";
    gemte.forEach(function (g, nr) {
      const k = lav("button", "gn-gemt");
      k.title = "Tag dette udseende på";
      const c = lav("canvas");
      c.width = 72; c.height = 96;
      try { tegnLilleFigur(c, g); } catch (e) {}
      setTimeout(function () { try { tegnLilleFigur(c, g); } catch (e) {} }, 500);
      k.appendChild(c);
      const slet = lav("span", "gn-slet", "✕");
      slet.title = "Slet";
      slet.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!slet.classList.contains("sikker")) {
          slet.classList.add("sikker");
          slet.textContent = "Slet?";
          setTimeout(function () { slet.classList.remove("sikker"); slet.textContent = "✕"; }, 2500);
          return;
        }
        gemte.splice(nr, 1);
        gemGemte();
        tegnSkift();
      });
      k.appendChild(slet);
      k.addEventListener("click", function () {
        foerAendring();
        kladde.type = g.type;
        kladde.farver = kopi(g.farver);
        kladde.ting = kopi(g.ting);
        kladde.frisure = kopi(g.frisure);
        tegnSkift();
      });
      gemteBoks.appendChild(k);
    });
    const plus = lav("button", "gn-gemt gn-plus", "+");
    plus.title = gemte.length >= MAKS_GEMTE ? "Du kan gemme " + MAKS_GEMTE + ". Det ældste bliver slettet." : "Gem det, du har på nu";
    plus.addEventListener("click", function () {
      gemte.unshift(kopi({ type: kladde.type, farver: kladde.farver, ting: kladde.ting, frisure: kladde.frisure }));
      gemte = gemte.slice(0, MAKS_GEMTE);
      gemGemte();
      tegnSkift();
    });
    gemteBoks.appendChild(plus);
  }

  // ----- Det hele -----
  const tegnSkiftFoer = tegnSkift;
  tegnSkift = function () {
    if (!kladde) return tegnSkiftFoer.apply(this, arguments);
    sikrValg();
    tegnSuFaner();
    tegnSuUnder();
    tegnSuTing();
    tegnSuFigur();
    tegnPanel();
    tegnGemteRaekke();
    pigeKnap.classList.toggle("aktiv", kladde.type === "pige");
    drengKnap.classList.toggle("aktiv", kladde.type === "dreng");
    pigeKnap.hidden = !FIGURER.pige;
    drengKnap.hidden = !FIGURER.dreng;
    fortrydKnap.disabled = !fortrydListe.length;
    gentagKnap.disabled = !gnGentag.length;
  };

  // ved åbning: start på Overdele
  const aabnFoer = aabnGarderobe;
  aabnGarderobe = function () {
    gnGentag = [];
    temaValg.hidden = true;
    return aabnFoer.apply(this, arguments);
  };
  const gammelKnap = document.getElementById("knap-garderobe");
  if (gammelKnap) {
    // knappen kalder den gamle funktion direkte: byt den ud
    gammelKnap.removeEventListener("click", aabnFoer);
    gammelKnap.addEventListener("click", aabnGarderobe);
  }

  // ----- Udseendet -----
  const css = lav("style");
  css.id = "garderobe-ny-stil";
  const V = "#garderobe-vindue.gn ";
  css.textContent = [
    V + "{ --gm:#8e3a59; --ga:#d9668f; --gl:#f7d6e2; --gb:#fff3f7; --gk:#e8b6c8; --gt:#5a2338; --gw:#fffafc; --gh:#8e3a59; }",
    "#garderobe-vindue.gn .su-boks.gn-boks { max-width: 1080px !important; width: 100% !important; height: min(680px, 100%) !important; max-height: 100% !important;" +
      " display: flex !important; flex-direction: column !important; overflow: hidden !important; position: relative;" +
      " background: var(--gb) !important; border: 4px solid var(--gm) !important; border-radius: 16px !important;" +
      " box-shadow: 0 0 0 2px var(--gk), 0 18px 40px rgba(0,0,0,.45) !important; color: var(--gt) !important; font-family: inherit; }",
    // toppen
    V + ".su-top.su-top { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.12)), var(--gm) !important; border: 0 !important;" +
      " box-shadow: inset 0 -3px 0 rgba(0,0,0,.18) !important; padding: 8px 12px !important; gap: 8px; text-shadow: none !important; flex: none; }",
    V + ".gn-logo { display: flex; align-items: center; gap: 6px; padding-right: 14px; margin-right: 6px; border-right: 2px solid rgba(255,255,255,.25);" +
      " color: #fff !important; font: bold 15px/1 Georgia, 'Times New Roman', serif; letter-spacing: .06em; }",
    V + ".gn-krone { font-size: 26px; filter: drop-shadow(0 2px 0 rgba(0,0,0,.25)); }",
    V + ".su-top h2#su-titel { text-align: left !important; color: #fff !important; font: bold 24px Georgia, 'Times New Roman', serif !important; text-shadow: 0 2px 0 rgba(0,0,0,.25) !important; flex: 1; }",
    V + ".su-top button.gn-top-knap { width: 40px !important; height: 36px !important; margin: 0 !important; padding: 0 !important; border-radius: 10px !important;" +
      " background: rgba(255,255,255,.16) !important; border: 2px solid rgba(255,255,255,.45) !important; color: #fff !important; font-size: 18px !important;" +
      " box-shadow: none !important; text-shadow: none !important; display: grid; place-items: center; }",
    V + ".su-top button.gn-top-knap:hover { background: rgba(255,255,255,.3) !important; }",
    V + ".gn-tema-valg { position: absolute; top: 54px; right: 60px; z-index: 5; background: var(--gw); border: 2px solid var(--gk); border-radius: 12px;" +
      " padding: 10px 12px; box-shadow: 0 10px 24px rgba(0,0,0,.25); color: var(--gt); }",
    V + ".gn-tema-valg[hidden] { display: none; }",
    V + ".gn-tema-raekke { display: grid; grid-template-columns: repeat(3, 64px); gap: 8px; margin-top: 8px; }",
    V + ".gn-tema-hel { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 12px; }",
    V + ".gn-tema { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 2px var(--gk); cursor: pointer; padding: 0; margin: 0; }",
    V + ".gn-tema.aktiv { box-shadow: 0 0 0 3px var(--gt); }",
    // krop: venstre + hoved
    V + ".su-indhold { display: block !important; padding: 0 !important; flex: 1; min-height: 0; background: transparent !important; }",
    V + ".gn-krop { display: flex; gap: 12px; padding: 12px; height: 100%; box-sizing: border-box; }",
    V + ".gn-venstre { width: 330px; flex: none; display: flex; flex-direction: column; gap: 10px; min-height: 0; }",
    V + ".gn-rum { flex: 1; min-height: 0; display: flex; gap: 8px; border-radius: 12px; padding: 8px; border: 2px solid var(--gk);" +
      " background: repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 14px, rgba(255,255,255,0) 14px 28px), linear-gradient(180deg, var(--gl), var(--gk)); }",
    V + ".gn-side { display: flex; flex-direction: column; gap: 8px; justify-content: center; }",
    V + ".gn-rund, " + V + ".su-knapper button.gn-rund { width: 44px !important; height: 44px !important; margin: 0 !important; padding: 0 !important; border-radius: 50% !important;" +
      " background: var(--gw) !important; border: 2px solid var(--gk) !important; color: var(--ga) !important; font-size: 22px !important; line-height: 1 !important;" +
      " box-shadow: 0 2px 0 rgba(0,0,0,.12) !important; cursor: pointer; display: grid; place-items: center; text-shadow: none !important; }",
    V + ".gn-rund:hover:not(:disabled) { background: var(--gl) !important; }",
    V + ".gn-rund.aktiv { background: var(--ga) !important; color: #fff !important; border-color: var(--gm) !important; }",
    V + ".gn-rund:disabled { opacity: .4; cursor: default; }",
    V + ".gn-rund[hidden] { display: none !important; }",
    V + ".gn-scene { position: relative; flex: 1; min-width: 0; border-radius: 10px; overflow: hidden;" +
      " background: linear-gradient(180deg, rgba(255,255,255,.0) 0 62%, rgba(0,0,0,.08) 62% 63%, var(--gl) 63% 100%); }",
    V + ".gn-spejl { position: absolute; right: 12px; top: 14%; width: 46px; height: 46%; border-radius: 24px 24px 4px 4px;" +
      " background: linear-gradient(135deg, rgba(255,255,255,.85), rgba(210,225,240,.6) 45%, rgba(255,255,255,.75)); border: 5px solid #d9b25a; box-shadow: 0 3px 0 rgba(0,0,0,.15); }",
    V + ".gn-lys { position: absolute; left: 0; right: 0; top: 6px; height: 12px;" +
      " background: radial-gradient(circle, #fff6c8 0 3px, rgba(255,240,170,.5) 4px, transparent 6px) 0 0/26px 12px repeat-x; }",
    V + ".gn-taeppe { position: absolute; left: 50%; bottom: 6%; width: 78%; height: 15%; transform: translateX(-50%); border-radius: 50%;" +
      " background: radial-gradient(ellipse, var(--gw) 0 40%, var(--gk) 41% 46%, var(--gl) 47% 100%); box-shadow: 0 2px 0 rgba(0,0,0,.1); }",
    V + "#su-figur { position: absolute; left: 50%; bottom: 3%; transform: translateX(-50%); width: 220px !important; height: 340px !important;" +
      " max-height: 92%; object-fit: contain; image-rendering: pixelated; background: none !important; border: 0 !important; }",
    V + ".gn-drej { position: absolute; bottom: 8px; width: 40px !important; height: 40px !important; padding: 0 !important; margin: 0 !important; border-radius: 50% !important;" +
      " background: var(--gw) !important; border: 2px solid var(--gk) !important; color: var(--ga) !important; font-size: 20px !important; cursor: pointer; z-index: 2; box-shadow: 0 2px 0 rgba(0,0,0,.12) !important; }",
    V + ".gn-drej.venstre { left: 8px; } " + V + ".gn-drej.hoejre { right: 8px; }",
    // gemte udseender
    V + ".gn-gemte { flex: none; display: flex; gap: 6px; overflow-x: auto; padding: 6px; border-radius: 12px; background: var(--gw); border: 2px solid var(--gk); }",
    V + ".gn-gemt { position: relative; flex: none; width: 54px; height: 72px; margin: 0; padding: 0; border-radius: 8px; background: var(--gl); border: 2px solid var(--gk); cursor: pointer; }",
    V + ".gn-gemt canvas { width: 54px; height: 72px; display: block; }",
    V + ".gn-gemt:hover { border-color: var(--ga); }",
    V + ".gn-plus { font-size: 30px; color: var(--ga); background: var(--gw); border-style: dashed; }",
    V + ".gn-slet { position: absolute; top: -2px; right: -2px; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 8px; background: var(--gm); color: #fff;" +
      " font-size: 10px; line-height: 16px; display: none; }",
    V + ".gn-gemt:hover .gn-slet, " + V + ".gn-slet.sikker { display: block; }",
    // faner
    V + ".gn-hoved { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }",
    V + ".su-faner.gn-faner { display: flex !important; gap: 4px; padding: 0 0 0 6px !important; background: none !important; border: 0 !important; flex: none; }",
    V + ".gn-faner button.gn-fane { flex: 0 1 110px; height: 52px !important; margin: 0 !important; padding: 4px 8px !important; display: flex; align-items: center; gap: 4px; justify-content: center;" +
      " background: var(--gl) !important; border: 2px solid var(--gk) !important; border-bottom: 0 !important; border-radius: 12px 12px 0 0 !important;" +
      " color: var(--gt) !important; font: bold 13px inherit; text-shadow: none !important; box-shadow: none !important; position: relative; top: 2px; cursor: pointer; }",
    V + ".gn-faner button.gn-fane img, " + V + ".gn-faner button.gn-fane canvas { width: 36px; height: 36px; object-fit: contain; image-rendering: pixelated; }",
    V + ".gn-faner button.gn-fane.aktiv { background: var(--gw) !important; border-color: var(--ga) !important; color: var(--gh) !important; z-index: 1; }",
    V + ".gn-midt { flex: 1; min-height: 0; display: flex; gap: 10px; padding: 10px; background: var(--gw); border: 2px solid var(--ga); border-radius: 0 12px 12px 12px; }",
    V + ".gn-gitter-ramme { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; min-height: 0; }",
    V + ".su-under.gn-under { display: flex !important; flex-wrap: wrap; gap: 6px; align-items: center; padding: 0 !important; background: none !important; border: 0 !important; flex: none; }",
    V + ".gn-overskrift { font: bold 17px Georgia, 'Times New Roman', serif; color: var(--gh); margin-right: 8px; padding: 6px 14px; border-radius: 10px; background: var(--gb); border: 2px solid var(--gk); }",
    V + ".gn-pille { margin: 0 !important; padding: 6px 14px !important; border-radius: 999px !important; background: var(--gw) !important; border: 2px solid var(--gk) !important;" +
      " color: var(--gt) !important; font-size: 13px !important; cursor: pointer; text-shadow: none !important; box-shadow: none !important; }",
    V + ".gn-pille.aktiv { background: var(--ga) !important; border-color: var(--ga) !important; color: #fff !important; }",
    V + ".gn-pille.lille { padding: 3px 9px !important; font-size: 12px !important; }",
    V + ".su-ting#su-ting { flex: 1; min-height: 0; overflow-y: auto; display: grid !important; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px;" +
      " align-content: start; padding: 8px !important; background: var(--gb) !important; border: 2px solid var(--gk) !important; border-radius: 10px !important; }",
    V + ".su-ting .su-tom { grid-column: 1 / -1; margin: 0 0 2px !important; font-size: 12px; color: var(--gt) !important; opacity: .8; }",
    V + ".su-ting .su-ting-knap { width: auto !important; height: 104px !important; min-height: 104px; margin: 0 !important; padding: 4px !important; border-radius: 10px !important;" +
      " background: var(--gw) !important; border: 2px solid var(--gk) !important; box-shadow: 0 2px 0 rgba(0,0,0,.06) !important; color: var(--gt) !important; text-shadow: none !important; }",
    V + ".su-ting .su-ting-knap:hover { border-color: var(--ga) !important; transform: translateY(-1px); }",
    V + ".su-ting .su-ting-knap.aktiv { border-color: var(--ga) !important; box-shadow: 0 0 0 3px var(--gl), 0 0 0 5px var(--ga) !important; }",
    V + ".su-ting .su-ting-knap img { width: 100% !important; height: 100% !important; object-fit: contain; image-rendering: pixelated; }",
    V + ".su-ting .su-stil-knap { height: 124px !important; }",
    V + ".su-ting .su-ingen { font-weight: bold; font-size: 13px !important; }",
    // panelet til højre
    V + ".gn-panel { width: 250px; flex: none; display: flex; flex-direction: column; gap: 8px; min-height: 0; }",
    V + ".gn-panel-rul { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; }",
    V + ".gn-valgt { display: flex; align-items: center; gap: 4px; padding: 6px; background: var(--gb); border: 2px solid var(--gk); border-radius: 12px; }",
    V + ".gn-valgt-billede { flex: 1; height: 110px; display: grid; place-items: center; }",
    V + ".gn-valgt-billede img, " + V + ".gn-valgt-billede canvas { max-width: 100%; max-height: 110px; image-rendering: pixelated; }",
    V + ".gn-valgt-tekst { font-weight: bold; color: var(--gh); text-align: center; }",
    V + ".gn-pil { width: 30px !important; height: 30px !important; margin: 0 !important; padding: 0 !important; border-radius: 50% !important; flex: none;" +
      " background: var(--gw) !important; border: 2px solid var(--gk) !important; color: var(--ga) !important; font-size: 12px !important; cursor: pointer; box-shadow: none !important; text-shadow: none !important; }",
    V + ".gn-valgt-navn { text-align: center; font-size: 12px; font-weight: bold; min-height: 14px; margin-top: -4px; }",
    V + ".gn-kort { padding: 8px; background: var(--gb); border: 2px solid var(--gk); border-radius: 12px; }",
    V + ".gn-kort > b { display: block; font: bold 15px Georgia, 'Times New Roman', serif; color: var(--gh); margin-bottom: 4px; }",
    V + ".gn-kort-top { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: 6px; }",
    V + ".gn-kort-top b { font: bold 15px Georgia, 'Times New Roman', serif; color: var(--gh); margin-right: 4px; }",
    V + ".gn-lille { font-size: 12px; margin: 0; }",
    V + ".gn-palet { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; max-height: 150px; overflow-y: auto; padding: 2px; }",
    V + ".gn-palet .su-farve { width: auto !important; height: 26px !important; min-width: 0; margin: 0 !important; padding: 0 !important; border-radius: 6px !important;" +
      " border: 2px solid rgba(255,255,255,.9) !important; box-shadow: 0 0 0 1px var(--gk) !important; cursor: pointer; }",
    V + ".gn-palet .su-farve.aktiv { box-shadow: 0 0 0 2px var(--gt) !important; transform: scale(1.08); }",
    V + ".gn-palet .su-original { background: var(--gw) !important; color: var(--ga) !important; font-size: 15px !important; }",
    V + ".gn-egen { grid-column: 1 / -1; display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; margin-top: 2px; }",
    V + ".gn-egen input { width: 34px; height: 26px; padding: 0; border: 2px solid var(--gk); border-radius: 6px; background: none; cursor: pointer; }",
    V + ".gn-detaljer .su-moenstre { margin: 0 0 6px !important; gap: 4px; }",
    V + ".gn-detaljer .su-moenstre span { font-size: 12px; }",
    V + ".gn-detaljer .su-chip { margin: 0 !important; padding: 3px 9px !important; border-radius: 999px !important; background: var(--gw) !important;" +
      " border: 2px solid var(--gk) !important; color: var(--gt) !important; font-size: 12px !important; text-shadow: none !important; box-shadow: none !important; }",
    V + ".gn-detaljer .su-chip.aktiv { background: var(--ga) !important; border-color: var(--ga) !important; color: #fff !important; }",
    V + ".gn-detaljer .su-farve { width: 20px !important; height: 20px !important; margin: 0 !important; border-radius: 5px !important; border: 2px solid #fff !important; box-shadow: 0 0 0 1px var(--gk) !important; }",
    V + ".gn-detaljer .su-farve.aktiv { box-shadow: 0 0 0 2px var(--gt) !important; }",
    V + ".su-gem.gn-gem { margin: 0 !important; width: 100% !important; padding: 14px 10px !important; border-radius: 14px !important; flex: none;" +
      " background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(0,0,0,.08)), var(--ga) !important; border: 3px solid var(--gm) !important; color: #fff !important;" +
      " font: bold 19px Georgia, 'Times New Roman', serif !important; text-shadow: 0 1px 0 rgba(0,0,0,.25) !important; box-shadow: 0 3px 0 var(--gm) !important; cursor: pointer;" +
      " display: flex !important; align-items: center; justify-content: center; line-height: 1.2 !important; height: auto !important; }",
    V + ".su-gem.gn-gem span { font-size: 22px; margin-right: 6px; }",
    V + ".su-gem.gn-gem:hover { filter: brightness(1.07); }",
    // Nat-farven: lyse tekster
    "#garderobe-vindue.gn[data-gn-tema='nat'] .gn-palet .su-farve { border-color: #2f2938 !important; }",
    // små skærme
    "@media (max-width: 900px) { " + V + ".gn-krop { flex-direction: column; overflow-y: auto; } " + V + ".gn-venstre { width: auto; flex: none; } " +
      V + ".gn-rum { height: 380px; flex: none; } " + V + ".gn-hoved, " + V + ".gn-gitter-ramme { flex: none; } " +
      V + ".gn-midt { flex-direction: column; flex: none; } " + V + ".su-ting#su-ting { height: 320px; flex: none; } " +
      V + ".gn-panel { width: auto; flex: none; } " + V + ".gn-panel-rul { overflow: visible; flex: none; } " +
      V + ".gn-faner button.gn-fane span { display: none; } }",
  ].join("\n");
  document.head.appendChild(css);

  // Er vinduet allerede åbent, så tegn det om
  if (!vindue.hidden && kladde) tegnSkift();
})();
