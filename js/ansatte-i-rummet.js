// =============================================================
//  👥 Ansatte i rummet — vises i Ejerpanelet (venstre side, under Hurtigmenu)
//  Ansatte og ejeren kan se, hvilke andre ansatte der står i SAMME rum som dem.
//  Hvert kort: 🟢 navn, skilt (fx Moderator) · rummets navn ([EVENT] foran event-rum).
//  Klik på et navn → åbner Staff chat med den person.
//  Bruger de spillere, serveren allerede sender (ANDRE_SPILLERE i js/rigtige-spillere.js),
//  så der skal IKKE køres ny SQL.
// =============================================================
(function () {
  if (document.getElementById("air-boks")) return;

  function rensA(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function erEjer(navn) { return typeof EJERE !== "undefined" && EJERE.indexOf(navn) >= 0; }
  function erPersonale(navn) {
    if (erEjer(navn)) return true;
    return typeof erAnsat === "function" && erAnsat(navn);
  }
  // Må jeg se kortet? Ejeren og alle ansatte (ejeren ser altid mindst det samme som de ansatte)
  function maaSe() {
    if (typeof FIGUR === "undefined") return false;
    return erPersonale(FIGUR.navn);
  }

  // Skiltets navn, fx "Moderator", "Eventvært", "Ejer"
  function skiltNavn(navn) {
    if (erEjer(navn)) return "Ejer";
    const id = typeof ansatte !== "undefined" ? ansatte[navn] : null;
    if (id === "mod") return "Moderator";
    const s = typeof SKILTE !== "undefined" ? SKILTE.find(function (x) { return x.id === id; }) : null;
    return s ? s.navn : "Ansat";
  }

  // Rummets navn, fx "Velkomsthallen" eller "[EVENT] Booster Baren"
  function rumNavn(id) {
    if (!id) return "";
    if (id === "hal") return "Velkomsthallen";
    let navn = "";
    try { if (typeof vaerelseNavn === "function") navn = vaerelseNavn(id); } catch (e) {}
    if (!navn && typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[id]) navn = INDBYGGEDE_RUM[id].navn || "";
    if (!navn) navn = id.indexOf(":") > 0 ? id.split(":")[0] + "s rum" : id;
    const event = typeof erEventRum === "function" && erEventRum(id);
    return (event ? "[EVENT] " : "") + navn;
  }

  function mitRum() { return typeof mitRumId === "function" ? mitRumId() : null; }

  // De andre ansatte, der står i mit rum lige nu
  function ansatteHer() {
    const rum = mitRum();
    if (!rum || typeof ANDRE_SPILLERE === "undefined") return [];
    return Object.values(ANDRE_SPILLERE).filter(function (g) {
      return g.rumId === rum && g.navn !== FIGUR.navn && erPersonale(g.navn);
    }).sort(function (a, b) {
      // ejeren øverst, derefter efter navn
      return (erEjer(b.navn) - erEjer(a.navn)) || a.navn.localeCompare(b.navn);
    });
  }

  // ---- selve kortet ----
  const boks = document.createElement("section");
  boks.id = "air-boks";
  boks.hidden = true;
  boks.innerHTML = "<h4 class='air-top'>👥 Ansatte i rummet <i class='air-antal'>0</i></h4><div class='air-liste'></div>";
  const liste = boks.querySelector(".air-liste");
  const antal = boks.querySelector(".air-antal");

  // Læg kortet i panelets venstre side (Enkelt panel). Findes den ikke, kommer det under fanerne.
  function placer() {
    const side = document.getElementById("ee-side");
    const hjem = side || document.getElementById("ejer-faner");
    if (hjem && boks.parentNode !== hjem) hjem.appendChild(boks);
  }

  let sidst = "";
  function tegn() {
    const vindue = document.getElementById("ejer-vindue");
    if (!vindue || vindue.hidden || !maaSe()) { boks.hidden = true; return; }
    placer();
    boks.hidden = false;
    const her = ansatteHer();
    const rum = rumNavn(mitRum());
    const html = her.length ? her.map(function (g) {
      return "<button type='button' class='air-kort' data-air-navn='" + rensA(g.navn) + "' title='Skriv til " + rensA(g.navn) + " i Staff chat'>" +
        "<b><i class='air-prik" + (g.sover ? " sover" : "") + "'></i>" + rensA(g.navn) + "</b>" +
        "<small>" + rensA(skiltNavn(g.navn)) + " · " + rensA(rum) + "</small></button>";
    }).join("") : "<p class='air-tom'>Ingen andre ansatte i " + rensA(rum || "rummet") + " lige nu.</p>";
    antal.textContent = her.length;
    if (html !== sidst) { liste.innerHTML = html; sidst = html; }
  }

  // Klik på en ansat → Staff chat med personen
  liste.addEventListener("click", function (e) {
    const k = e.target.closest("[data-air-navn]");
    if (!k) return;
    const navn = k.dataset.airNavn;
    try {
      if (typeof staffSamtale !== "undefined") staffSamtale = navn;
      ejerFane = "staffchat";
      visFane();
    } catch (err) {}
  });

  setInterval(tegn, 1500);
  setTimeout(tegn, 300);

  // ---- udseende (følger panelets farve; mørk når 🌙 er slået til) ----
  const V = "#ejer-vindue#ejer-vindue";
  const stil = document.createElement("style");
  stil.id = "air-stil";
  stil.textContent =
    V + " #air-boks { margin-top: auto; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 12px;" +
      " background: var(--ee-kort, #fffaf6); border: 1.5px solid var(--ee-kant, #ecc9cd); color: var(--ee-tekst, #4a2028); font: 12px Verdana, sans-serif; }" +
    V + " #air-boks[hidden] { display: none !important; }" +
    V + " #air-boks .air-top { display: flex; align-items: center; gap: 6px; margin: 0 !important; padding: 0 !important; border: 0 !important;" +
      " font: bold 13px Verdana, sans-serif !important; color: var(--ee-overskrift, #7a1f33) !important; }" +
    V + " #air-boks .air-antal { margin-left: auto; font-style: normal; background: #5cb85c; color: #fff; border-radius: 10px; padding: 0 7px; font-size: 11px; line-height: 18px; }" +
    V + " #air-boks .air-liste { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow-y: auto; }" +
    V + " #air-boks .air-kort { display: flex !important; flex-direction: column; align-items: flex-start; gap: 3px; width: 100%; padding: 8px 10px !important;" +
      " border: 0 !important; border-radius: 10px !important; background: var(--ee-side, #f7e4e4) !important; color: inherit !important; cursor: pointer;" +
      " text-align: left; box-shadow: none !important; text-shadow: none !important; font: 12px Verdana, sans-serif !important; }" +
    V + " #air-boks .air-kort:hover { background: var(--ee-hover, #efd0d2) !important; }" +
    V + " #air-boks .air-kort b { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--ee-overskrift, #7a1f33); }" +
    V + " #air-boks .air-kort small { font-size: 11.5px; line-height: 1.35; opacity: .8; }" +
    V + " #air-boks .air-prik { display: inline-block; flex: none; width: 9px; height: 9px; border-radius: 50%; background: #6fd35f; box-shadow: 0 0 5px #6fd35f; }" +
    V + " #air-boks .air-prik.sover { background: #e0b84a; box-shadow: none; }" +
    V + " #air-boks .air-tom { margin: 0; font-size: 11.5px; opacity: .7; }" +
    // mørkt panel (🌙) — ligesom på billedet
    V + ".moerkt #air-boks { background: #1d2a33; border-color: #2c3e4a; color: #c9d6de; }" +
    V + ".moerkt #air-boks .air-top { color: #fff !important; }" +
    V + ".moerkt #air-boks .air-kort { background: #233541 !important; }" +
    V + ".moerkt #air-boks .air-kort:hover { background: #2b4250 !important; }" +
    V + ".moerkt #air-boks .air-kort b { color: #fff; }" +
    V + ".moerkt #air-boks .air-kort small { color: #a9bcc8; opacity: 1; }";
  document.head.appendChild(stil);
})();
