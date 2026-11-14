// =============================================================
//  🚩 Vurdér rapporter (Ejerpanel → Rapporter)
//  Når en spiller rapporterer en anden, skal ejeren (eller en MOD) vurdere den:
//   ✅ Løst                       = rapporten var rigtig. Den der rapporterede får en tak-besked.
//   🚫 Misbrug af rapport-knappen = ikke en rigtig sag. Den der rapporterede får en venlig
//                                   besked, og man kan give dem en straf med det samme.
//  Listen er delt i to: "Skal vurderes" og "Lukkede". De lukkede står som
//  "Lukket som løst" (grøn) eller "Lukket som misbrug" (rød).
//  Kræver database-54-rapport-vurdering.sql. Hentes fra js/panel-forklaring.js,
//  så hotel.html ikke skal ændres. Erstatter visRapporter() fra js/ejer.js.
// =============================================================
(function () {
  if (typeof visRapporter !== "function" || typeof rapporter !== "function" || window.rapportVurderingKlar) return;
  window.rapportVurderingKlar = true;

  let rvVis = "aabne";        // "aabne" eller "lukkede"
  let rvSoeg = "";
  let rvSpoerg = null;        // nøglen på den rapport, hvor man er ved at vælge "Misbrug"
  let rvBesked = "";

  function harServer() { return typeof serverKald === "function" && typeof mitToken === "function" && mitToken(); }
  function kiggere() { return typeof rapportKiggere !== "undefined" && rapportKiggere ? rapportKiggere : {}; }

  // rapporterne får "udfald" (loest / misbrug) og "udfaldAf" med fra serveren
  const rapporterFoerVurdering = rapporter;
  rapporter = function () {
    return rapporterFoerVurdering().map(function (r) {
      const k = r.sid ? kiggere()[r.sid] : null;
      if (k) { r.udfald = k.udfald || null; r.udfaldAf = k.udfaldAf || null; }
      return r;
    });
  };

  function noegle(x) { return x.r.sid ? "s" + x.r.sid : "l" + x.i; }
  function find(n) {
    const alle = rapporter();
    for (let i = 0; i < alle.length; i++) if (noegle({ r: alle[i], i: i }) === n) return { r: alle[i], i: i, alle: alle };
    return null;
  }
  function renTekst(r) { return r.fra ? String(r.tekst || "").replace(" (fra " + r.fra + ")", "") : (r.tekst || ""); }

  // -----------------------------------------------------------
  //  Gem vurderingen: "loest", "misbrug" eller "" (åbn igen)
  // -----------------------------------------------------------
  function saetUdfald(n, udfald, saa) {
    const x = find(n);
    if (!x) return;
    const r = x.r;
    const mig = (typeof FIGUR !== "undefined" && FIGUR.navn) || "";
    function lokalt() {
      if (r.sid) {
        const s = typeof serverRapporter !== "undefined" && serverRapporter ? serverRapporter.find(function (y) { return y.id === r.sid; }) : null;
        if (s) { s.behandlet = !!udfald; s.behandletTid = udfald ? Date.now() : null; }
        const k = kiggere();
        k[r.sid] = Object.assign({}, k[r.sid] || {}, { udfald: udfald || null, udfaldAf: udfald ? mig : null, kigger: (k[r.sid] && k[r.sid].kigger) || mig });
      } else {
        // en rapport, der kun ligger på denne computer
        const alle = rapporterFoerVurdering();
        const l = alle[x.i];
        if (l) {
          l.behandlet = !!udfald;
          l.behandletTid = udfald ? Date.now() : null;
          l.udfald = udfald || null;
          l.udfaldAf = udfald ? mig : null;
          gemListe("mit-hotel-rapporter", alle);
        }
        if (typeof adminSkriv === "function") adminSkriv((udfald === "loest" ? "Rapport løst: " : udfald === "misbrug" ? "Rapport lukket som misbrug: " : "Rapport åbnet igen: ") + (r.grund || ""));
      }
      rvSpoerg = null;
      rvBesked = udfald === "loest" ? "✅ Rapporten er lukket som løst." + (r.fra ? " " + r.fra + " får en tak-besked." : "")
        : udfald === "misbrug" ? "🚫 Rapporten er lukket som misbrug af rapport-knappen." + (r.fra ? " " + r.fra + " får en besked om, hvad knappen er til." : "")
        : "↩ Rapporten er åbnet igen.";
      if (saa) saa(); else visFane();
    }
    if (!r.sid) { lokalt(); return; }
    if (!harServer()) { rvBesked = "Du skal være logget ind på serveren for at vurdere rapporten."; visFane(); return; }
    serverKald("hv_rapport_udfald", { p_token: mitToken(), p_id: r.sid, p_udfald: udfald || "" })
      .then(lokalt)
      .catch(function (e) {
        rvBesked = /hv_rapport_udfald|Could not find|function/i.test(e.message)
          ? "⚠️ Knapperne virker først, når database-54-rapport-vurdering.sql er kørt i Supabase."
          : "⚠️ " + e.message;
        visFane();
      });
  }

  function gaaTilSpiller(navn, lilleFane) {
    valgtSpiller = navn;
    spInfoFane = lilleFane || "straffe";
    ejerFane = "spillere";
    visFane();
  }

  // -----------------------------------------------------------
  //  Fanen 🚩 Rapporter
  // -----------------------------------------------------------
  visRapporter = function () {
    const alle = rapporter().map(function (r, i) { return { r: r, i: i }; }).reverse();
    const aabne = alle.filter(function (x) { return !x.r.behandlet; });
    const lukkede = alle.filter(function (x) { return x.r.behandlet; });
    // hvor mange gange hver spiller har misbrugt knappen
    const misbrugt = {};
    alle.forEach(function (x) { if (x.r.udfald === "misbrug" && x.r.fra) misbrugt[x.r.fra] = (misbrugt[x.r.fra] || 0) + 1; });

    function aabentKort(x) {
      const r = x.r, n = noegle(x), tekst = renTekst(r);
      const spoerg = rvSpoerg === n;
      let html = "<li class='rv-kort' data-rv='" + n + "'>" +
        "<div class='rv-linje'><span class='rv-grund'>🚩 " + rens(r.grund || "Rapport") + "</span><span class='rv-dato'>" + tidTekst(r.tid) + "</span></div>" +
        "<div class='rv-hvem'>" + (r.fra ? "<a href='#' data-spiller='" + rens(r.fra) + "'>" + rens(r.fra) + "</a>" : "<i>Ukendt</i>") +
        " <span class='rv-pil'>→</span> " +
        (r.hvem ? "<a href='#' data-spiller='" + rens(r.hvem) + "'>" + rens(r.hvem) + "</a>" : "<i>ingen bestemt spiller</i>") + "</div>" +
        "<blockquote>" + (tekst ? "“" + rens(tekst) + "”" : "<i>Ingen tekst skrevet</i>") + "</blockquote>";
      if (r.fra && misbrugt[r.fra]) {
        html += "<p class='rv-advar'>⚠️ " + rens(r.fra) + " har misbrugt rapport-knappen " + misbrugt[r.fra] + (misbrugt[r.fra] === 1 ? " gang" : " gange") + " før.</p>";
      }
      html += "<div class='rv-hjaelpere'>" +
        (r.kigger ? "<span class='rv-kigger'>👀 " + rens(r.kigger) + " kigger på den</span>"
          : (r.sid && typeof rapportKigger === "function" ? "<button type='button' class='rv-lille' data-rv-kig='" + n + "'>👀 Jeg kigger på den</button>" : "")) +
        (r.hvem ? "<button type='button' class='rv-lille' data-rv-chat='" + rens(r.hvem) + "'>💬 Se chatlog</button>" : "") +
        "</div>";
      if (!spoerg) {
        html += "<p class='rv-spoerg'>Hvad vurderer du?</p><div class='rv-valg'>" +
          "<button type='button' class='rv-loest' data-rv-loest='" + n + "'>✅ Løst<small>Rapporten var rigtig</small></button>" +
          "<button type='button' class='rv-misbrug' data-rv-misbrug='" + n + "'>🚫 Misbrug af rapport-knap<small>Det var ikke en rigtig sag</small></button>" +
          "</div>" +
          (r.hvem ? "<p class='rv-ekstra'>Har " + rens(r.hvem) + " gjort noget forkert? <a href='#' data-rv-straf='" + rens(r.hvem) + "'>⚖️ Giv " + rens(r.hvem) + " en straf</a> (luk så rapporten med ✅ Løst bagefter)</p>" : "");
      } else {
        html += "<div class='rv-bekraeft'><p>🚫 Rapporten lukkes som <b>misbrug af rapport-knappen</b>." +
          (r.fra ? " Skal <b>" + rens(r.fra) + "</b> også have en straf?" : "") + "</p><div class='rv-valg'>" +
          "<button type='button' class='rv-misbrug' data-rv-luk-misbrug='" + n + "'>🚫 Luk uden straf</button>" +
          (r.fra ? "<button type='button' class='rv-misbrug moerk' data-rv-luk-straf='" + n + "'>⚖️ Luk og giv " + rens(r.fra) + " en straf</button>" : "") +
          "<button type='button' class='rv-fortryd' data-rv-fortryd='1'>Fortryd</button></div></div>";
      }
      return html + "</li>";
    }

    function lukketKort(x) {
      const r = x.r, n = noegle(x), tekst = renTekst(r);
      const soeg = [r.grund, r.hvem, r.fra, tekst].join(" ").toLowerCase();
      const status = r.udfald === "loest" ? "<span class='rv-ok'>Lukket som løst</span>"
        : r.udfald === "misbrug" ? "<span class='rv-nej'>Lukket som misbrug</span>"
        : "<span class='rv-graa'>Lukket</span>";
      return "<li class='rv-lukket' data-soeg='" + rens(soeg) + "'>" +
        "<div class='rv-lukket-tekst'><b>" + rens(r.fra || "Ukendt") + " → " + rens(r.hvem || "ingen") + "</b>" +
        "<span>" + (tekst ? "“" + rens(tekst.length > 90 ? tekst.slice(0, 90) + "…" : tekst) + "”" : "<i>" + rens(r.grund || "Rapport") + "</i>") + " · " + status + "</span></div>" +
        "<div class='rv-lukket-hoejre'><small>" + tidTekst(r.behandletTid || r.tid) + (r.udfaldAf ? "<br>af " + rens(r.udfaldAf) : "") + "</small>" +
        "<button type='button' class='rv-lille' data-rv-aabn='" + n + "' title='Åbn rapporten igen'>↩</button></div></li>";
    }

    let html = "<div class='rv-top'>" +
      "<button type='button' data-rv-vis='aabne'" + (rvVis === "aabne" ? " class='valgt'" : "") + ">🆕 Skal vurderes <b>" + aabne.length + "</b></button>" +
      "<button type='button' data-rv-vis='lukkede'" + (rvVis === "lukkede" ? " class='valgt'" : "") + ">📁 Lukkede <b>" + lukkede.length + "</b></button>" +
      (rvVis === "lukkede" ? "<input id='rv-soeg' type='text' placeholder='🔍 Søg …' value='" + rens(rvSoeg) + "'>" : "") +
      "</div>";
    if (rvBesked) html += "<p class='rv-besked'>" + rens(rvBesked) + "</p>";
    if (rvVis === "aabne") {
      html += aabne.length
        ? "<p class='rv-forklar'>Læs rapporten og tryk på <b>✅ Løst</b>, hvis den var rigtig, eller <b>🚫 Misbrug</b>, hvis nogen bare brugte knappen for sjov.</p>" +
          "<ul class='rv-liste'>" + aabne.map(aabentKort).join("") + "</ul>"
        : "<p class='tom'>Ingen rapporter venter 🎉</p>";
    } else {
      html += lukkede.length ? "<ul class='rv-liste'>" + lukkede.map(lukketKort).join("") + "</ul>" +
        "<p class='tom rv-ingen' hidden>Ingen rapporter passer til søgningen.</p>" : "<p class='tom'>Ingen lukkede rapporter endnu.</p>";
    }
    ejerIndhold.innerHTML = html;
    if (typeof spillerLinks === "function") spillerLinks();

    ejerIndhold.querySelectorAll("[data-rv-vis]").forEach(function (k) {
      k.addEventListener("click", function () { rvVis = k.dataset.rvVis; rvSpoerg = null; rvBesked = ""; visRapporter(); });
    });
    const soeg = document.getElementById("rv-soeg");
    if (soeg) {
      const filtrer = function () {
        const q = rvSoeg.trim().toLowerCase();
        let antal = 0;
        ejerIndhold.querySelectorAll(".rv-lukket").forEach(function (li) {
          li.hidden = !!q && li.dataset.soeg.indexOf(q) < 0;
          if (!li.hidden) antal++;
        });
        const ingen = ejerIndhold.querySelector(".rv-ingen");
        if (ingen) ingen.hidden = !q || antal > 0;
      };
      soeg.addEventListener("input", function () { rvSoeg = soeg.value; filtrer(); });
      soeg.addEventListener("keydown", function (e) { e.stopPropagation(); });
      filtrer();
    }
    function klik(attr, fn) {
      ejerIndhold.querySelectorAll("[" + attr + "]").forEach(function (k) {
        k.addEventListener("click", function (e) { e.preventDefault(); fn(k.getAttribute(attr), k); });
      });
    }
    klik("data-rv-loest", function (n, k) { k.disabled = true; saetUdfald(n, "loest"); });
    klik("data-rv-misbrug", function (n) { rvSpoerg = n; rvBesked = ""; visRapporter(); });
    klik("data-rv-fortryd", function () { rvSpoerg = null; visRapporter(); });
    klik("data-rv-luk-misbrug", function (n, k) { k.disabled = true; saetUdfald(n, "misbrug"); });
    klik("data-rv-luk-straf", function (n, k) {
      k.disabled = true;
      const x = find(n);
      const fra = x && x.r.fra;
      saetUdfald(n, "misbrug", function () { if (fra) gaaTilSpiller(fra, "straffe"); else visFane(); });
    });
    klik("data-rv-aabn", function (n) { saetUdfald(n, ""); });
    klik("data-rv-straf", function (navn) { gaaTilSpiller(navn, "straffe"); });
    klik("data-rv-chat", function (navn) {
      try { chatFilter.spiller = navn; } catch (e) {}
      ejerFane = "chat";
      visFane();
    });
    klik("data-rv-kig", function (n, k) {
      const x = find(n);
      if (!x) return;
      k.disabled = true;
      rapportKigger(x.r);
      if (typeof adminSkriv === "function") adminSkriv("Kigger på rapport: " + x.r.grund + (x.r.fra ? " (fra " + x.r.fra + ")" : ""));
    });
  };

  // -----------------------------------------------------------
  //  Udseendet (følger panelets farve fra js/ejer-enkel.js)
  // -----------------------------------------------------------
  const I = "#ejer-vindue #ejer-indhold";
  const stil = document.createElement("style");
  stil.id = "rapport-vurdering-stil";
  stil.textContent =
    I + " .rv-top { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }" +
    I + " .rv-top button { padding: 9px 16px; border-radius: 20px; border: 2px solid var(--ee-kant, #ecc9cd); background: var(--ee-kort, #fff);" +
      " color: var(--ee-tekst, #4a2028); font: bold 14px Verdana, sans-serif; cursor: pointer; box-shadow: none; text-shadow: none; }" +
    I + " .rv-top button b { display: inline-block; min-width: 20px; padding: 1px 6px; margin-left: 4px; border-radius: 10px; background: var(--ee-side, #f7e4e4); font-size: 12px; }" +
    I + " .rv-top button.valgt { background: var(--ee-moerk, #7a1f33); border-color: var(--ee-moerk, #7a1f33); color: #fff; }" +
    I + " .rv-top button.valgt b { background: var(--ee-guld, #e3b65c); color: #3a2410; }" +
    I + " .rv-top input { flex: 1; min-width: 140px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--ee-kant, #ecc9cd); font: 13px Verdana, sans-serif; }" +
    I + " .rv-besked { margin: 0 0 10px; padding: 9px 12px; border-radius: 10px; background: #fff7d6; border: 1.5px solid #ecd27a; color: #5a4510; font-size: 13px; }" +
    I + " .rv-forklar { margin: 0 0 10px; font-size: 13px; color: var(--ee-tekst, #4a2028); opacity: .85; }" +
    I + " .rv-liste { list-style: none; margin: 0; padding: 0; }" +
    I + " .rv-liste li.rv-kort { display: block; margin: 0 0 12px; padding: 12px 14px; border-radius: 12px; border: 2px solid #f0c9a0;" +
      " border-left: 7px solid #e08a2e; background: #fffaf3; color: #3d2a1c; }" +
    I + " .rv-linje { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }" +
    I + " .rv-grund { font: bold 15px Verdana, sans-serif; color: #b24a1a; }" +
    I + " .rv-dato { font-size: 11px; color: #8a7a6a; white-space: nowrap; }" +
    I + " .rv-hvem { margin: 4px 0 8px; font-size: 14px; } " + I + " .rv-hvem a { font-weight: bold; }" +
    I + " .rv-pil { color: #b08060; font-weight: bold; }" +
    I + " .rv-kort blockquote { margin: 0 0 8px; padding: 9px 12px; border-left: 3px solid #f0c9a0; background: #fff; border-radius: 8px; font-size: 14px; overflow-wrap: anywhere; }" +
    I + " .rv-advar { margin: 0 0 8px; padding: 6px 10px; border-radius: 8px; background: #fde4e4; color: #8a1f1f; font-size: 12.5px; font-weight: bold; }" +
    I + " .rv-hjaelpere { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 4px; }" +
    I + " .rv-kigger { font-size: 12px; color: #6a5a4a; }" +
    I + " .rv-lille { padding: 4px 10px; border-radius: 8px; border: 1px solid #d9c2a8; background: #fff; color: #4a3424; font: 12px Verdana, sans-serif; cursor: pointer; box-shadow: none; }" +
    I + " .rv-lille:hover { background: #fbefe0; }" +
    I + " .rv-spoerg { margin: 10px 0 6px; font: bold 13px Verdana, sans-serif; color: #4a3424; }" +
    I + " .rv-valg { display: flex; flex-wrap: wrap; gap: 8px; }" +
    I + " .rv-valg button { flex: 1 1 180px; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 11px 12px; border-radius: 11px;" +
      " font: bold 15px Verdana, sans-serif; cursor: pointer; color: #fff; border: 0; box-shadow: 0 3px 0 rgba(0,0,0,.18); text-shadow: none; }" +
    I + " .rv-valg button small { font: 11.5px Verdana, sans-serif; opacity: .9; }" +
    I + " .rv-valg button:hover { filter: brightness(1.07); transform: translateY(-1px); }" +
    I + " .rv-valg button:disabled { opacity: .55; cursor: default; transform: none; }" +
    I + " .rv-valg .rv-loest { background: #3f8a4a; }" +
    I + " .rv-valg .rv-misbrug { background: #c0453a; } " + I + " .rv-valg .rv-misbrug.moerk { background: #7a1f33; }" +
    I + " .rv-valg .rv-fortryd { flex: 0 0 auto; background: #fff; color: #555; border: 1.5px solid #ccc; box-shadow: none; font-size: 13px; }" +
    I + " .rv-ekstra { margin: 8px 0 0; font-size: 12px; color: #6a5a4a; }" +
    I + " .rv-bekraeft { margin-top: 8px; padding: 10px 12px; border-radius: 10px; background: #fdecea; border: 1.5px solid #f0b7b0; }" +
    I + " .rv-bekraeft p { margin: 0 0 8px; font-size: 13.5px; color: #5a1a14; }" +
    I + " .rv-liste li.rv-lukket { display: flex; gap: 10px; justify-content: space-between; align-items: center; margin: 0 0 6px; padding: 9px 12px;" +
      " border-radius: 10px; background: var(--ee-kort, #fffaf6); border: 1.5px solid var(--ee-kant, #ecc9cd); color: var(--ee-tekst, #4a2028); }" +
    I + " .rv-lukket-tekst { min-width: 0; display: flex; flex-direction: column; gap: 3px; font-size: 13px; overflow-wrap: anywhere; }" +
    I + " .rv-lukket-hoejre { display: flex; align-items: center; gap: 8px; text-align: right; }" +
    I + " .rv-lukket-hoejre small { font-size: 11px; opacity: .7; white-space: nowrap; }" +
    I + " .rv-ok { color: #2f7a3a; font-weight: bold; } " + I + " .rv-nej { color: #c0392b; font-weight: bold; } " + I + " .rv-graa { color: #888; font-weight: bold; }" +
    // 🌙 mørkt panel
    "#ejer-vindue.moerkt #ejer-indhold .rv-liste li.rv-kort { background: #2b2620; border-color: #5a4630; color: #eee; }" +
    "#ejer-vindue.moerkt #ejer-indhold .rv-kort blockquote { background: #1f1c18; border-left-color: #5a4630; color: #eee; }" +
    "#ejer-vindue.moerkt #ejer-indhold .rv-liste li.rv-lukket { background: #24262c; border-color: #3a3d46; color: #e8e8ec; }" +
    "#ejer-vindue.moerkt #ejer-indhold .rv-spoerg, #ejer-vindue.moerkt #ejer-indhold .rv-ekstra, #ejer-vindue.moerkt #ejer-indhold .rv-kigger { color: #ddd; }" +
    "#ejer-vindue.moerkt #ejer-indhold .rv-ok { color: #7fd38a; } #ejer-vindue.moerkt #ejer-indhold .rv-nej { color: #ff8a80; }";
  document.head.appendChild(stil);

  // hjælpe-teksten øverst i fanen (js/panel-forklaring.js)
  try {
    if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP.rapporter = {
      titel: "🚩 Rapporter", tekst: "Her lander det, når en spiller trykker Rapportér på en anden. Hver rapport skal vurderes.",
      punkter: ["Læs rapporten. Tryk 💬 Se chatlog, hvis du vil se, hvad der skete.",
        "✅ <b>Løst</b>: rapporten var rigtig. Den der rapporterede får en tak-besked.",
        "🚫 <b>Misbrug af rapport-knap</b>: det var ikke en rigtig sag. Du kan give den der rapporterede en straf med det samme.",
        "Lukkede rapporter kan ses under 📁 Lukkede, og kan åbnes igen med ↩."] };
  } catch (e) {}

  // er panelet allerede åbent på Rapporter, tegnes det med det nye udseende
  try { if (typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === "rapporter") visFane(); } catch (e) {}
})();
