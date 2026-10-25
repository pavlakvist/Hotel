// =============================================================
//  📝 Ansøgninger (fanen i Ejerpanelet, lige under Staff chat)
//  Her ser ejeren alle staff-ansøgninger fra forsiden (js/ansoeg.js).
//  Tryk "👀 Se ansøgning" for at læse den, og "💬 Kontakt via privat besked"
//  for at skrive til personen. Man kan godkende, afvise, ansætte og slette.
//  Kun ejeren kan se fanen. Kræver database-15-ansoegninger.sql.
// =============================================================
const ANSOEG_STATUS = {
  ny: { tekst: "Ny", ikon: "🆕" },
  set: { tekst: "Læst", ikon: "👀" },
  godkendt: { tekst: "Godkendt", ikon: "✅" },
  afvist: { tekst: "Afvist", ikon: "❌" },
};

let ansoegninger = null;        // null = ikke hentet endnu
let ansoegFejlTekst = "";
let ansoegValgt = null;         // id på den ansøgning, man læser
let ansoegFilter = "alle";
let ansoegSletSikker = false;

const ansoegFane = document.createElement("button");
ansoegFane.dataset.fane = "ansoegninger";
ansoegFane.textContent = "📝 Ansøgninger";
ansoegFane.hidden = !rolleMaa("ansoegninger");
staffFane.after(ansoegFane);
ansoegFane.addEventListener("click", function () { ejerFane = "ansoegninger"; visFane(); });

function stillingNavn(id) {
  const s = SKILTE.find(function (x) { return x.id === id; });
  return s ? s.navn : id;
}

function hentAnsoegninger() {
  if (!erEjerMig() || !mitToken()) return;
  serverKald("hv_ansoegninger_hent", { p_token: mitToken() }).then(function (svar) {
    const foer = stabil(ansoegninger);
    ansoegninger = svar || [];
    ansoegFejlTekst = "";
    visAnsoegTal();
    if (stabil(ansoegninger) !== foer && !ejerVindue.hidden && ejerFane === "ansoegninger" && !skriverIPanel()) visFane();
  }).catch(function (e) {
    ansoegFejlTekst = /hv_ansoeg/.test(e.message) ? "Ansøgninger virker, når database-15-ansoegninger.sql er kørt i Supabase." : e.message;
    if (ansoegninger === null && !ejerVindue.hidden && ejerFane === "ansoegninger") visFane();
  });
}
function visAnsoegTal() {
  const nye = (ansoegninger || []).filter(function (a) { return a.status === "ny"; }).length;
  ansoegFane.innerHTML = "📝 Ansøgninger" + (nye ? " <span class='staff-fane-tal'>" + nye + "</span>" : "");
}

function retAnsoegning(a, status, slet) {
  return serverKald("hv_ansoegning_ret", { p_token: mitToken(), p_id: a.id, p_status: status || a.status, p_slet: !!slet }).then(function () {
    if (slet) {
      ansoegninger = ansoegninger.filter(function (x) { return x.id !== a.id; });
      if (ansoegValgt === a.id) ansoegValgt = null;
    } else a.status = status;
    visAnsoegTal();
    visFane();
  }).catch(function (e) { besked.textContent = e.message; });
}

const visFaneFoerAnsoeg = visFane;
visFane = function () {
  visFaneFoerAnsoeg();
  if (ejerFane !== "ansoegninger" || ejerVindue.hidden) return;
  if (ansoegninger === null) {
    ejerIndhold.innerHTML = "<p class='tom'>" + rens(ansoegFejlTekst || "Henter ansøgninger …") + "</p>";
    return;
  }
  const liste = ansoegninger.filter(function (a) { return ansoegFilter === "alle" || a.status === ansoegFilter || (ansoegFilter === "ny" && a.status === "set"); });
  const valgt = ansoegninger.find(function (a) { return a.id === ansoegValgt; });
  const antal = function (st) { return ansoegninger.filter(function (a) { return st === "ny" ? a.status === "ny" || a.status === "set" : a.status === st; }).length; };

  ejerIndhold.innerHTML = "<h3>📝 Ansøgninger om at blive staff</h3>" +
    "<div class='ao-filtre'>" + [["alle", "Alle", ansoegninger.length], ["ny", "🆕 Ikke afgjort", antal("ny")], ["godkendt", "✅ Godkendt", antal("godkendt")], ["afvist", "❌ Afvist", antal("afvist")]]
      .map(function (f) { return "<button type='button' data-ao-filter='" + f[0] + "'" + (ansoegFilter === f[0] ? " class='valgt'" : "") + ">" + f[1] + " <small>" + f[2] + "</small></button>"; }).join("") + "</div>" +
    "<div class='ao-krop" + (valgt ? " har-valgt" : "") + "'><ul class='ao-liste'>" + (liste.length ? liste.map(function (a) {
      const st = ANSOEG_STATUS[a.status] || ANSOEG_STATUS.ny;
      return "<li class='ao-kort" + (a.id === ansoegValgt ? " valgt" : "") + (a.status === "ny" ? " ny" : "") + "'>" +
        "<img src='billeder/skilte/" + rens(a.stilling) + ".png' alt=''>" +
        "<div><b>" + rens(a.navn) + "</b><small>søger " + rens(stillingNavn(a.stilling)) + " · " + tidTekst(a.tid) + "</small>" +
        "<span class='ao-status ao-" + rens(a.status) + "'>" + st.ikon + " " + st.tekst + "</span></div>" +
        "<button type='button' data-ao-se='" + a.id + "'>👀 Se ansøgning</button></li>";
    }).join("") : "<li class='tom'>Ingen ansøgninger her endnu.</li>") + "</ul>" +
    "<div class='ao-detaljer'>" + (valgt ? detaljeHtml(valgt) : "<p class='tom'>Tryk på 👀 Se ansøgning for at læse den.</p>") + "</div></div>";

  ejerIndhold.querySelectorAll("[data-ao-filter]").forEach(function (k) {
    k.addEventListener("click", function () { ansoegFilter = k.dataset.aoFilter; visFane(); });
  });
  ejerIndhold.querySelectorAll("[data-ao-se]").forEach(function (k) {
    k.addEventListener("click", function () {
      ansoegValgt = Number(k.dataset.aoSe);
      ansoegSletSikker = false;
      const a = ansoegninger.find(function (x) { return x.id === ansoegValgt; });
      if (a && a.status === "ny") retAnsoegning(a, "set"); else visFane();
    });
  });
  if (!valgt) return;
  const knap = function (id, f) { const k = document.getElementById(id); if (k) k.addEventListener("click", f); };
  knap("ao-tilbage", function () { ansoegValgt = null; visFane(); });
  knap("ao-kontakt", function () { aabnBeskeder(valgt.navn); });
  knap("ao-godkend", function () { retAnsoegning(valgt, valgt.status === "godkendt" ? "set" : "godkendt"); });
  knap("ao-afvis", function () { retAnsoegning(valgt, valgt.status === "afvist" ? "set" : "afvist"); });
  knap("ao-ansaet", function () { ansatValgt = valgt.navn; ejerFane = "ansaettelse"; visFane(); });
  knap("ao-slet", function () {
    if (!ansoegSletSikker) { ansoegSletSikker = true; visFane(); return; }
    ansoegSletSikker = false;
    retAnsoegning(valgt, null, true);
  });
};

function detaljeHtml(a) {
  const st = ANSOEG_STATUS[a.status] || ANSOEG_STATUS.ny;
  return "<button type='button' id='ao-tilbage' class='ao-tilbage'>← Alle ansøgninger</button><div class='ao-top'><img src='billeder/skilte/" + rens(a.stilling) + ".png' alt=''>" +
    "<div><h3>" + rens(a.navn) + "</h3><p>søger som <b>" + rens(stillingNavn(a.stilling)) + "</b></p>" +
    "<span class='ao-status ao-" + rens(a.status) + "'>" + st.ikon + " " + st.tekst + "</span></div></div>" +
    "<div class='ao-fakta'><div><small>Alder</small><b>" + (a.alder ? rens(a.alder) + " år" : "–") + "</b></div>" +
    "<div><small>Online</small><b>" + rens(a.online || "–") + "</b></div>" +
    "<div><small>Sendt</small><b>" + tidTekst(a.tid) + "</b></div></div>" +
    "<h4>Om sig selv</h4><p class='ao-tekst'>" + rens(a.tekst) + "</p>" +
    (a.erfaring ? "<h4>Erfaring som staff</h4><p class='ao-tekst'>" + rens(a.erfaring) + "</p>" : "") +
    "<div class='ao-knapper'>" +
    "<button type='button' id='ao-kontakt' class='ao-kontakt'>💬 Kontakt via privat besked</button>" +
    "<button type='button' id='ao-godkend'>" + (a.status === "godkendt" ? "↩ Fortryd godkend" : "✅ Godkend") + "</button>" +
    "<button type='button' id='ao-afvis'>" + (a.status === "afvist" ? "↩ Fortryd afvis" : "❌ Afvis") + "</button>" +
    "<button type='button' id='ao-ansaet'>🎖️ Ansæt " + rens(a.navn) + "</button>" +
    "<button type='button' id='ao-slet' class='ao-slet" + (ansoegSletSikker ? " sikker" : "") + "'>" + (ansoegSletSikker ? "Er du sikker? Tryk igen" : "🗑 Slet") + "</button>" +
    "</div>";
}

// Hent med det samme og derefter hvert 10. sekund (så nye ansøgninger dukker op)
hentAnsoegninger();
setInterval(hentAnsoegninger, 10000);
const visFaneHentAnsoeg = visFane;
visFane = function () {
  visFaneHentAnsoeg();
  ansoegFane.hidden = !rolleMaa("ansoegninger");
};


// -------------------------------------------------------------
//  Udseendet (grøn/creme som resten af panelet)
// -------------------------------------------------------------
const ansoegPanelStil = document.createElement("style");
ansoegPanelStil.textContent =
  "#ejer-indhold .ao-filtre { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }" +
  "#ejer-indhold .ao-filtre button { padding: 5px 10px; border: 1px solid #9ccc8f; border-radius: 14px; background: #fff; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold .ao-filtre button.valgt { background: #4e7d4a; border-color: #4e7d4a; color: #fff; }" +
  "#ejer-indhold .ao-filtre small { opacity: 0.75; }" +
  "#ejer-indhold .ao-krop { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-items: start; }" +
  "#ejer-indhold .ao-krop.har-valgt .ao-liste { display: none; }" +
  "#ejer-indhold .ao-tilbage { margin: 0 0 8px; padding: 4px 10px; border: 1px solid #9ccc8f; border-radius: 8px; background: #fff; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-vindue.stor #ejer-indhold .ao-tilbage { display: none; }" +
  "#ejer-vindue.stor #ejer-indhold .ao-krop.har-valgt .ao-liste { display: block; }" +
  "#ejer-indhold ul.ao-liste { list-style: none; margin: 0; padding: 0; }" +
  "#ejer-indhold li.ao-kort { display: grid; grid-template-columns: 40px 1fr; gap: 4px 8px; align-items: center; margin: 0 0 6px; padding: 8px; background: #fff; border: 1px solid #d6e8c8; border-radius: 10px; }" +
  "#ejer-indhold li.ao-kort.ny { border-color: #e3c86a; background: #fffbea; }" +
  "#ejer-indhold li.ao-kort.valgt { border: 2px solid #4e7d4a; }" +
  "#ejer-indhold li.ao-kort img { width: 40px; image-rendering: pixelated; }" +
  "#ejer-indhold li.ao-kort b { display: block; color: #1f3a1c; }" +
  "#ejer-indhold li.ao-kort small { display: block; color: #7a8a76; font-size: 11px; }" +
  "#ejer-indhold li.ao-kort button { grid-column: 1 / 3; padding: 5px 8px; border: 1px solid #9ccc8f; border-radius: 6px; background: #e8f2dc; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold .ao-status { display: inline-block; margin-top: 3px; padding: 1px 7px; border-radius: 9px; font-size: 11px; font-weight: bold; background: #eef2ea; color: #5e6b58; }" +
  "#ejer-indhold .ao-status.ao-ny { background: #fff3cf; color: #a0521a; }" +
  "#ejer-indhold .ao-status.ao-godkendt { background: #dff0d6; color: #2f6b2a; }" +
  "#ejer-indhold .ao-status.ao-afvist { background: #fbe3df; color: #a8352a; }" +
  "#ejer-indhold .ao-detaljer { min-width: 0; padding: 12px; background: #fff; border: 2px solid #d6e8c8; border-radius: 12px; }" +
  "#ejer-indhold .ao-top { display: flex; align-items: center; gap: 12px; }" +
  "#ejer-indhold .ao-top img { width: 70px; image-rendering: pixelated; }" +
  "#ejer-indhold .ao-top h3 { margin: 0; }" +
  "#ejer-indhold .ao-top p { margin: 2px 0; }" +
  "#ejer-indhold .ao-fakta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 10px 0; }" +
  "#ejer-indhold .ao-fakta div { padding: 6px 8px; background: #f3f8ee; border-radius: 8px; }" +
  "#ejer-indhold .ao-fakta small { display: block; color: #7a8a76; font-size: 10px; text-transform: uppercase; }" +
  "#ejer-indhold .ao-tekst { margin: 4px 0 10px; padding: 8px 10px; background: #fbf6ea; border-radius: 8px; white-space: pre-wrap; overflow-wrap: anywhere; color: #33402c; }" +
  "#ejer-indhold .ao-knapper { display: flex; flex-wrap: wrap; gap: 6px; }" +
  "#ejer-indhold .ao-knapper button { padding: 6px 10px; border: 1px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold .ao-knapper button.ao-kontakt { background: #4e7d4a; border-color: #3a5e37; color: #fff; }" +
  "#ejer-indhold .ao-knapper button.ao-slet.sikker { background: #c0392b; border-color: #8e2a20; color: #fff; }" +
  "#ejer-vindue.stor #ejer-indhold .ao-krop { grid-template-columns: 320px minmax(0, 1fr); }";
document.head.appendChild(ansoegPanelStil);
