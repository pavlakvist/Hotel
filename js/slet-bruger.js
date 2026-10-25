// =============================================================
//  🗑 Slet bruger (fanen i Ejerpanelet, kun for hotellets ejer)
//  Find spilleren, tryk "🗑 Slet" og så "Er du sikker? Tryk igen".
//  Profilen og alt hvad der hører til (lejlighed, venner, beskeder …) slettes,
//  og navnet bliver ledigt. Ejere kan ikke slettes. Kræver database-18-slet-bruger.sql.
// =============================================================
let sbSoeg = "";
let sbSikker = null;      // navnet, der er trykket "Slet" på én gang
let sbTimer = null;
let sbBesked = "";

const sbFane = document.createElement("button");
sbFane.dataset.fane = "sletbruger";
sbFane.textContent = "🗑 Slet bruger";
sbFane.hidden = !erEjerMig();
(typeof ansoegFane !== "undefined" ? ansoegFane : staffFane).after(sbFane);
sbFane.addEventListener("click", function () { ejerFane = "sletbruger"; visFane(); });

function sbListe() {
  const s = sbSoeg.trim().toLowerCase();
  return serverAlle.filter(function (x) {
    return EJERE.indexOf(x.navn) < 0 && (!s || x.navn.toLowerCase().indexOf(s) >= 0);
  }).sort(function (a, b) { return a.navn.localeCompare(b.navn, "da"); });
}

function sbTegnListe() {
  const boks = document.getElementById("sb-liste");
  if (!boks) return;
  const liste = sbListe();
  boks.innerHTML = liste.length ? liste.map(function (x) {
    const sikker = sbSikker === x.navn;
    return "<div class='sb-raekke'><span class='sb-prik" + (x.online ? " on" : "") + "' title='" + (x.online ? "Online" : "Offline") + "'></span>" +
      "<b>" + rens(x.navn) + "</b><button type='button' data-sb-slet='" + rens(x.navn) + "' class='" + (sikker ? "sikker" : "") + "'>" +
      (sikker ? "Er du sikker? Tryk igen" : "🗑 Slet") + "</button></div>";
  }).join("") : "<p class='tom'>" + (serverAlle.length ? "Ingen brugere passer til søgningen." : "Henter brugere …") + "</p>";
  boks.querySelectorAll("[data-sb-slet]").forEach(function (k) {
    k.addEventListener("click", function () {
      const navn = k.dataset.sbSlet;
      if (sbSikker !== navn) {
        sbSikker = navn;
        clearTimeout(sbTimer);
        sbTimer = setTimeout(function () { sbSikker = null; sbTegnListe(); }, 5000);
        sbTegnListe();
        return;
      }
      sbSikker = null;
      k.disabled = true;
      k.textContent = "Sletter …";
      serverKald("hv_bruger_slet", { p_token: mitToken(), p_navn: navn }).then(function (slettet) {
        serverAlle = serverAlle.filter(function (x) { return x.navn.toLowerCase() !== navn.toLowerCase(); });
        sbBesked = "✅ " + (slettet || navn) + " er slettet.";
        visFane();
      }).catch(function (e) {
        sbBesked = /hv_bruger_slet/.test(e.message) ? "⚠ Kør database-18-slet-bruger.sql i Supabase først." : "⚠ " + e.message;
        visFane();
      });
    });
  });
}

const visFaneFoerSb = visFane;
visFane = function () {
  visFaneFoerSb();
  sbFane.hidden = !erEjerMig();
  if (ejerFane !== "sletbruger" || ejerVindue.hidden) return;
  if (!erEjerMig()) { ejerIndhold.innerHTML = "<p class='tom'>Kun hotellets ejer kan slette brugere.</p>"; return; }
  ejerIndhold.innerHTML = "<h3>🗑 Slet bruger</h3>" +
    "<p class='sb-info'>Når en bruger slettes, forsvinder profilen, lejligheden, venner, private beskeder, likes, skilt og straffe. " +
    "Navnet bliver ledigt igen. Det kan <b>ikke</b> fortrydes. Ejere kan ikke slettes.</p>" +
    (sbBesked ? "<p class='sb-besked'>" + rens(sbBesked) + "</p>" : "") +
    "<input id='sb-soeg' type='search' placeholder='🔍 Søg efter navn …' value='" + rens(sbSoeg) + "'>" +
    "<div id='sb-liste'></div>";
  const soeg = document.getElementById("sb-soeg");
  soeg.addEventListener("input", function () { sbSoeg = soeg.value; sbTegnListe(); });
  sbTegnListe();
  if (!serverAlle.length && typeof hentAlleSpillere === "function") hentAlleSpillere();
};
// listen hentes hvert 30. sek i rigtige-ejer.js; når fanen er åben, opdateres den uden at miste søgefeltet
setInterval(function () { if (!ejerVindue.hidden && ejerFane === "sletbruger" && !sbSikker) sbTegnListe(); }, 5000);

const sbStil = document.createElement("style");
sbStil.textContent =
  "#ejer-indhold .sb-info { margin: 0 0 10px; padding: 8px 10px; background: #fff3cf; border: 2px dashed #e3c86a; border-radius: 10px; font-size: 12px; }" +
  "#ejer-indhold .sb-besked { margin: 0 0 10px; font-weight: bold; }" +
  "#ejer-indhold #sb-soeg { width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 7px 10px; border: 1px solid #9ccc8f; border-radius: 8px; font: 13px Verdana, sans-serif; }" +
  "#ejer-indhold .sb-raekke { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid #e3eed8; }" +
  "#ejer-indhold .sb-raekke b { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  "#ejer-indhold .sb-prik { width: 9px; height: 9px; border-radius: 50%; background: #c9c3b8; flex: none; }" +
  "#ejer-indhold .sb-prik.on { background: #4caf50; }" +
  "#ejer-indhold [data-sb-slet] { padding: 4px 10px; border: 2px solid #e0b4b4; border-radius: 8px; background: #fff; color: #b23b3b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold [data-sb-slet].sikker { background: #d64545; border-color: #a83232; color: #fff; }";
document.head.appendChild(sbStil);
