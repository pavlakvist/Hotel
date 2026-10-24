// =============================================================
//  Elevatoren 🛗 i velkomsthallen
//  Klik på elevatoren: figuren går hen til den, dørene åbner,
//  og man vælger en etage. Så lukker dørene, elevatoren kører,
//  og man kommer ud på den valgte etage.
//  Kun etager med rum, man kan komme ind i, bliver vist.
//  Den hemmelige etage kræver en nøgle fra events (ejeren kommer altid ind).
//  Elevatoren er tegnet med kode. Den kan skiftes til et billede senere.
// =============================================================
const ELEVATOR = { fra: 6, til: 8, hoejde: 150, felt: { x: 0, y: 7 } };   // på venstre væg, felterne y 6–7
const NOEGLE_NOEGLE = "mit-hotel-noegler";
let elevAaben = 0;          // 0 = dørene er lukket, 1 = helt åbne
let elevMaal = 0;           // hvor dørene er på vej hen
let elevVenter = null;      // figuren går hen til elevatoren
let elevKoerer = false;

// ----- Nøgler fra events: { navn: ["hemmelig"] } -----
let noegler = {};
try { noegler = JSON.parse(localStorage.getItem(NOEGLE_NOEGLE) || "{}"); } catch (e) {}
function gemNoegler() {
  try { localStorage.setItem(NOEGLE_NOEGLE, JSON.stringify(noegler)); } catch (e) {}
}
function harNoegle(navn, hvad) {
  return (noegler[navn] || []).indexOf(hvad) >= 0;
}
function erHotelEjer() {
  return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0;
}
function maaHemmelig() {
  return erHotelEjer() || harNoegle(FIGUR.navn, "hemmelig");
}


// -------------------------------------------------------------
//  Tegn elevatoren på venstre væg i hallen
// -------------------------------------------------------------
function elevHjoerner() {
  const a = punkt(0, ELEVATOR.til), b = punkt(0, ELEVATOR.fra);
  return { a: a, b: b, poly: [a, b, { x: b.x, y: b.y - ELEVATOR.hoejde - 20 }, { x: a.x, y: a.y - ELEVATOR.hoejde - 20 }] };
}

let elevSidst = performance.now();
function tegnElevator() {
  const nu = performance.now();
  const dt = Math.min(0.1, (nu - elevSidst) / 1000);
  elevSidst = nu;
  elevAaben += Math.max(-dt * 1.6, Math.min(dt * 1.6, elevMaal - elevAaben));

  const h = elevHjoerner();
  const B = 64;
  ctx.save();
  ctx.transform((h.b.x - h.a.x) / B, (h.b.y - h.a.y) / B, 0, 1, h.a.x, h.a.y);
  const firkant = function (x, y, w, hh, farve) { ctx.fillStyle = farve; ctx.fillRect(x, y, w, hh); };
  // rammen af mørkerødt træ med guld
  firkant(-3, -162, 70, 162, "#e0a73c");                       // guldkant hele vejen rundt
  firkant(-1, -160, 66, 160, "#2a0806");
  firkant(10, -166, 44, 6, "#e0a73c");                         // lille krone af guld foroven
  firkant(26, -171, 12, 6, "#e0a73c");
  firkant(30, -174, 4, 4, "#fff1c4");
  firkant(0, -150, 64, 150, "#3a0f0c");
  firkant(2, -148, 60, 146, "#6b1c16");
  for (let i = 0; i < 6; i++) firkant(4 + i * 10, -146, 1, 142, "rgba(0,0,0,0.12)");    // træets årer
  firkant(0, -150, 64, 4, "#e0a73c");
  firkant(0, -4, 64, 4, "#b98153");
  // skærmen med etagen og pilene
  firkant(17, -144, 30, 15, "#e0a73c");
  firkant(19, -142, 26, 11, "#1a0d08");
  ctx.fillStyle = elevKoerer ? "#ffdf7a" : "#f2b134";
  ctx.font = "bold 9px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(rumValg === "hal" ? "▲ S ▼" : "▲ ▼", 32, -136.5);
  // åbningen og det gyldne lys indeni
  firkant(7, -125, 50, 123, "#e0a73c");
  firkant(9, -123, 46, 121, "#2a1410");
  const lys = ctx.createLinearGradient(0, -123, 0, -2);
  lys.addColorStop(0, "rgba(255,214,120,0.55)");
  lys.addColorStop(1, "rgba(120,60,20,0.2)");
  ctx.fillStyle = lys;
  ctx.fillRect(9, -123, 46, 121);
  // dørene glider til siden
  const dw = 23 * (1 - elevAaben);
  function doer(x, w, venstre) {
    if (w < 0.5) return;
    firkant(x, -123, w, 121, "#7a2a20");
    firkant(x + 2, -118, Math.max(0, w - 4), 52, "#8d3428");
    firkant(x + 2, -60, Math.max(0, w - 4), 52, "#8d3428");
    firkant(venstre ? x + w - 1 : x, -123, 1, 121, "#e0a73c");
    firkant(venstre ? x + w - 4 : x + 2, -66, 2, 10, "#f2c14e");    // håndtag
  }
  doer(9, dw, true);
  doer(55 - dw, dw, false);
  // knappen ved siden af
  firkant(58.5, -72, 4, 10, "#e0a73c");
  firkant(59.5, -70, 2, 2.5, elevMaal ? "#ff6a4d" : "#fff1c4");
  firkant(59.5, -66, 2, 2.5, "#fff1c4");
  ctx.restore();
}

const tegnHalVaeggeFoerElev = tegnHalVaegge;
tegnHalVaegge = function () {
  tegnHalVaeggeFoerElev();
  tegnElevator();
};


// -------------------------------------------------------------
//  Klik på elevatoren
// -------------------------------------------------------------
function iPolygon(p, poly) {
  let inde = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    if ((poly[i].y > p.y) !== (poly[j].y > p.y) && p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) inde = !inde;
  }
  return inde;
}
laerred.addEventListener("click", function (e) {
  if (rumValg !== "hal" || elevKoerer) return;
  const r = laerred.getBoundingClientRect();
  const p = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (!iPolygon(p, elevHjoerner().poly)) return;
  e.stopImmediatePropagation();
  const her = figurFelt();
  if (Math.abs(her.x - ELEVATOR.felt.x) + Math.abs(her.y - ELEVATOR.felt.y) <= 1) { aabnElevator(); return; }
  gaaTil(ELEVATOR.felt.x, ELEVATOR.felt.y);
  elevVenter = Date.now();
  besked.textContent = "🛗 Du går hen til elevatoren …";
}, true);
laerred.addEventListener("mousemove", function (e) {
  if (rumValg !== "hal") return;
  const r = laerred.getBoundingClientRect();
  const p = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (iPolygon(p, elevHjoerner().poly)) laerred.style.cursor = "pointer";
});

// når figuren står ved elevatoren, åbner den
setInterval(function () {
  if (!elevVenter) return;
  if (rumValg !== "hal") { elevVenter = null; return; }
  const her = figurFelt();
  const fremme = Math.abs(her.x - ELEVATOR.felt.x) + Math.abs(her.y - ELEVATOR.felt.y) <= 1 && !figur.rute.length;
  if (fremme || (!figur.rute.length && Date.now() - elevVenter > 400) || Date.now() - elevVenter > 15000) {
    elevVenter = null;
    aabnElevator();
  }
}, 150);


// -------------------------------------------------------------
//  Etage-menuen
// -------------------------------------------------------------
const elevVindue = document.createElement("div");
elevVindue.id = "elevator";
elevVindue.hidden = true;
elevVindue.innerHTML =
  '<div class="elev-top"><b>🛗 Elevator</b><button type="button" id="elev-luk" title="Luk">✕</button></div>' +
  '<div id="elev-etager" class="elev-etager"></div>' +
  '<p id="elev-tekst" class="elev-tekst"></p>';
document.body.appendChild(elevVindue);
goerFlytbar(elevVindue, elevVindue.querySelector(".elev-top"), "mit-hotel-flyt-elevator");
let elevValgtEtage = null;

function aabnElevator() {
  elevMaal = 1;
  figur.retning = "op-venstre";
  elevValgtEtage = null;
  visElevator();
  elevVindue.hidden = false;
  besked.textContent = "🛗 Hvor skal du hen?";
}
function lukElevator() {
  elevVindue.hidden = true;
  elevMaal = 0;
}
document.getElementById("elev-luk").addEventListener("click", lukElevator);

// Etagerne med de rum, man faktisk kan komme ind i
function elevEtager() {
  if (typeof lavMineRumKort === "function") lavMineRumKort();
  const liste = [];
  ETAGER.forEach(function (e, i) {
    if (e.id === "hemmelig") return;
    const rum = NAV_RUM.filter(function (r) { return r.etage === e.id && r.rum; }).map(function (r) {
      const m = r.vaerelse && r.vaerelse !== "mit" ? mineRum.find(function (x) { return x.id === r.vaerelse; }) : null;
      return { navn: r.navn, rum: r.rum, vaerelse: r.vaerelse, laast: m ? !kanGaaInd(m) : false };
    });
    if (rum.length) liste.push({ id: e.id, navn: e.navn, ikon: e.ikon, knap: e.id === "stue" ? "S" : e.id === "privat" ? "🔑" : String(i), rum: rum });
  });
  // den hemmelige etage findes altid, men er låst uden en nøgle
  liste.push({ id: "hemmelig", navn: "Den hemmelige etage", ikon: "🔮", knap: "?", hemmelig: true, laast: !maaHemmelig(),
    rum: [{ navn: "Den hemmelige etage", rum: "vaerelse", vaerelse: "hemmelig", laast: !maaHemmelig() }] });
  return liste;
}
function erHer(r) {
  if (r.rum === "hal") return rumValg === "hal";
  return rumValg === "vaerelse" && aktivtVaerelse === r.vaerelse;
}

function visElevator() {
  const etager = elevEtager();
  const boks = document.getElementById("elev-etager");
  boks.innerHTML = "";
  etager.forEach(function (e) {
    const k = document.createElement("button");
    k.className = "elev-etage" + (e.laast ? " laast" : "") + (e.hemmelig ? " hemmelig" : "") + (elevValgtEtage === e.id ? " valgt" : "");
    const her = e.rum.length === 1 && erHer(e.rum[0]);
    k.innerHTML = "<span class='elev-nr'>" + e.knap + "</span><b>" + e.ikon + " " + e.navn + "</b><small>" +
      (e.laast ? "🔒 Kræver en nøgle fra events" : her ? "Du er her" : e.hemmelig ? "🗝️ Åben for dig" : e.rum.length > 1 ? e.rum.length + " rum" : rens(e.rum[0].navn)) + "</small>";
    k.addEventListener("click", function () {
      if (e.laast) { document.getElementById("elev-tekst").textContent = "🔒 Den hemmelige etage er låst. Nøglen kan vindes til events ✨"; return; }
      if (e.rum.length === 1) { if (!her) koerTil(e, e.rum[0]); return; }
      elevValgtEtage = elevValgtEtage === e.id ? null : e.id;
      visElevator();
    });
    boks.appendChild(k);
    if (elevValgtEtage === e.id) {
      const under = document.createElement("div");
      under.className = "elev-rum";
      e.rum.forEach(function (r) {
        const rk = document.createElement("button");
        rk.textContent = (r.laast ? "🔒 " : "") + r.navn + (erHer(r) ? " (du er her)" : "");
        rk.disabled = r.laast || erHer(r);
        rk.title = r.laast ? "Rummet er låst. Brug navigatøren, hvis det har en kode." : "";
        rk.addEventListener("click", function () { koerTil(e, r); });
        under.appendChild(rk);
      });
      boks.appendChild(under);
    }
  });
  document.getElementById("elev-tekst").textContent = maaHemmelig() && !erHotelEjer() ? "🗝️ Du har nøglen til den hemmelige etage." : "";
}


// -------------------------------------------------------------
//  Turen: dørene lukker, elevatoren kører, dørene åbner
// -------------------------------------------------------------
const elevTur = document.createElement("div");
elevTur.id = "elevator-tur";
elevTur.hidden = true;
elevTur.innerHTML = '<div class="et-doer et-v"></div><div class="et-doer et-h"></div><div class="et-skaerm"><span id="et-pil">▲</span><b id="et-etage">S</b><small id="et-navn"></small></div>';
document.body.appendChild(elevTur);

function koerTil(etage, r) {
  if (elevKoerer) return;
  elevKoerer = true;
  elevVindue.hidden = true;
  elevMaal = 0;                        // dørene i hallen lukker
  const fra = rumValg === "hal" ? 0 : 1;
  const tilNr = etage.id === "stue" ? 0 : etage.id === "hemmelig" ? 9 : 1;
  document.getElementById("et-pil").textContent = tilNr >= fra ? "▲" : "▼";
  document.getElementById("et-etage").textContent = rumValg === "hal" ? "S" : "…";
  document.getElementById("et-navn").textContent = "Til " + r.navn.replace(/ [🔒🔑]$/, "");
  setTimeout(function () {
    elevTur.hidden = false;
    elevTur.classList.remove("aaben");
    void elevTur.offsetWidth;
    elevTur.classList.add("lukket");
  }, 450);
  setTimeout(function () { document.getElementById("et-etage").textContent = etage.knap; }, 1500);
  setTimeout(function () {
    // skift rum, mens dørene er lukkede
    if (r.rum === "hal") {
      skiftRum("hal");
      figur.x = ELEVATOR.felt.x + 1; figur.y = ELEVATOR.felt.y;     // man kommer ud foran elevatoren
      figur.retning = "ned-hoejre";
      elevAaben = 1; elevMaal = 1;
      setTimeout(function () { elevMaal = 0; }, 1600);
    } else {
      gaaTilVaerelse(r.vaerelse);
    }
    besked.textContent = "🛗 Ding! Du er på " + (etage.id === "hemmelig" ? "den hemmelige etage 🔮" : etage.navn) + ".";
    elevTur.classList.remove("lukket");
    elevTur.classList.add("aaben");
  }, 2300);
  setTimeout(function () {
    elevTur.hidden = true;
    elevTur.classList.remove("aaben");
    elevKoerer = false;
  }, 3100);
}


// -------------------------------------------------------------
//  Ejerpanelet → Events og nyheder: giv nøgler
// -------------------------------------------------------------
const visEventsFoerNoegler = visEvents;
visEvents = function () {
  visEventsFoerNoegler();
  const spillere = alleSpillere().filter(function (s) { return EJERE.indexOf(s.navn) < 0; });
  const med = Object.keys(noegler).filter(function (n) { return harNoegle(n, "hemmelig"); });
  const sek = document.createElement("section");
  sek.className = "elev-noegler";
  sek.innerHTML = "<h3>🗝️ Nøgler fra events</h3><p class='ejer-info'>Giv en spiller nøglen til den hemmelige etage i elevatoren, fx som præmie til et event. Du selv kommer altid ind.</p>" +
    "<div class='sp-handlinger'><select id='noegle-hvem'>" + spillere.map(function (s) { return "<option>" + rens(s.navn) + "</option>"; }).join("") + "</select>" +
    "<button id='noegle-giv'>🗝️ Giv nøgle</button></div>" +
    (med.length ? "<ul class='an-liste'>" + med.map(function (n) {
      return "<li>🗝️ <b>" + rens(n) + "</b><button data-tag-noegle='" + rens(n) + "' class='nav-slet'>✕ Tag nøglen</button></li>";
    }).join("") + "</ul>" : "<p class='ejer-tom'>Ingen har en nøgle endnu.</p>");
  ejerIndhold.appendChild(sek);
  document.getElementById("noegle-giv").addEventListener("click", function () {
    const navn = document.getElementById("noegle-hvem").value;
    if (!navn) return;
    noegler[navn] = (noegler[navn] || []).filter(function (x) { return x !== "hemmelig"; }).concat("hemmelig");
    gemNoegler();
    adminSkriv("Gav " + navn + " nøglen til den hemmelige etage");
    visEvents();
  });
  sek.querySelectorAll("[data-tag-noegle]").forEach(function (k) {
    k.addEventListener("click", function () {
      const navn = k.dataset.tagNoegle;
      noegler[navn] = (noegler[navn] || []).filter(function (x) { return x !== "hemmelig"; });
      gemNoegler();
      adminSkriv("Tog nøglen til den hemmelige etage fra " + navn);
      visEvents();
    });
  });
};

window.addEventListener("keydown", function (e) { if (e.key === "Escape" && !elevVindue.hidden) lukElevator(); });
