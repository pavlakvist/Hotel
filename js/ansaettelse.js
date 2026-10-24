// =============================================================
//  Ansættelse 🎖️  (fanen i Ejerpanelet)
//  Ejeren giver spillerne et skilt (Staff, Hjælper, VIP …),
//  som vises over hovedet på dem og i chatloggen.
//  "Fyr" tager skiltet fra dem igen. Kun ejeren kan styre det.
//  Skiltene er klippet ud af Pavlas ark (billeder/kilde/skilte-ark.png).
// =============================================================
const ANSAT_NOEGLE = "mit-hotel-ansatte";
const SKILTE = [
  { id: "staff", navn: "Staff", tekst: "Personalet. Holder hotellet sikkert og hyggeligt." },
  { id: "hjaelper", navn: "Hjælper", tekst: "Hjælper nye gæster og svarer på spørgsmål." },
  { id: "vip", navn: "VIP", tekst: "Særlige fordele. Eksklusivt skilt." },
  { id: "gaest", navn: "Gæst", tekst: "Almindelig spiller. Velkommen på hotellet!" },
  { id: "ny-gaest", navn: "Ny gæst", tekst: "Til spillere der lige er startet." },
  { id: "eventvaert", navn: "Eventvært", tekst: "Arrangerer events og konkurrencer." },
  { id: "bygmester", navn: "Bygmester", tekst: "Hjælper med at bygge og indrette rum." },
  { id: "veteran", navn: "Veteran", tekst: "Har været medlem længe." },
  { id: "content-creator", navn: "Content creator", tekst: "Laver indhold om hotellet." },
  { id: "support", navn: "Support", tekst: "Hjælper med tekniske spørgsmål." },
  { id: "saeson-vinder", navn: "Sæson vinder", tekst: "Midlertidigt skilt ved events og sæsoner." },
];
SKILTE.forEach(function (s) { s.fil = "billeder/skilte/" + s.id + ".png"; });

let ansatte = {};     // navn → skiltets id
try { ansatte = JSON.parse(localStorage.getItem(ANSAT_NOEGLE) || "{}"); } catch (e) {}
function gemAnsatte() {
  try { localStorage.setItem(ANSAT_NOEGLE, JSON.stringify(ansatte)); } catch (e) {}
}
// Hvilket skilt har spilleren? (ejerne har altid EJER-skiltet i stedet)
function rolleSkilt(navn) {
  if (EJERE.indexOf(navn) >= 0) return null;
  return SKILTE.find(function (s) { return s.id === ansatte[navn]; }) || null;
}


// -------------------------------------------------------------
//  Fanen i Ejerpanelet
// -------------------------------------------------------------
const ansatFane = document.createElement("button");
ansatFane.dataset.fane = "ansaettelse";
ansatFane.textContent = "🎖️ Ansættelse";
document.querySelector('#ejer-faner [data-fane="spillere"]').after(ansatFane);
ansatFane.addEventListener("click", function () { ejerFane = "ansaettelse"; visFane(); });

const visFaneFoerAnsat = visFane;
visFane = function () {
  visFaneFoerAnsat();
  if (ejerFane === "ansaettelse") visAnsaettelse();
};

let ansatValgt = null;
let fyrSikker = false;

function visAnsaettelse() {
  const spillere = alleSpillere().filter(function (s) { return EJERE.indexOf(s.navn) < 0; });
  if (!ansatValgt || !spillere.some(function (s) { return s.navn === ansatValgt; })) ansatValgt = spillere.length ? spillere[0].navn : null;
  const nu = ansatValgt ? rolleSkilt(ansatValgt) : null;

  let html = "<div class='an-krop'><aside class='an-spillere'><h3>Spillere</h3>";
  spillere.forEach(function (s) {
    const sk = rolleSkilt(s.navn);
    html += "<button data-an-spiller='" + rens(s.navn) + "'" + (s.navn === ansatValgt ? " class='valgt'" : "") + ">" +
      "<b>" + rens(s.navn) + "</b><small>" + (sk ? "🎖️ " + rens(sk.navn) : rens(s.hvad)) + "</small></button>";
  });
  if (!spillere.length) html += "<p class='ejer-info'>Der er ingen spillere endnu.</p>";
  html += "</aside><div class='an-midte'>";

  if (ansatValgt) {
    html += "<div class='an-hvem'><div><h3>" + rens(ansatValgt) + "</h3><span>" +
      (nu ? "Har skiltet <b>" + rens(nu.navn) + "</b>" : "Har ikke noget skilt") + "</span></div>" +
      (nu ? "<img src='" + nu.fil + "' alt=''>" : "") +
      "<button id='an-fyr' class='an-fyr" + (fyrSikker ? " sikker" : "") + "'" + (nu ? "" : " disabled") + ">" +
      (fyrSikker ? "Er du sikker? Tryk igen" : "🔥 Fyr") + "</button></div>" +
      "<p class='an-hjaelp'>Klik på et skilt for at give det til " + rens(ansatValgt) + ":</p><div class='an-skilte'>";
    SKILTE.forEach(function (s) {
      html += "<button data-skilt='" + s.id + "'" + (nu && nu.id === s.id ? " class='valgt'" : "") + " title='" + rens(s.tekst) + "'>" +
        "<img src='" + s.fil + "' alt=''><b>" + rens(s.navn) + "</b><small>" + rens(s.tekst) + "</small></button>";
    });
    html += "</div>";
  }

  // alle ansatte samlet
  const liste = Object.keys(ansatte).filter(function (n) { return rolleSkilt(n); });
  html += "<h4>Alle med skilt (" + liste.length + ")</h4>" + liste_(liste) +
    "<p class='ejer-info'>ℹ️ Skiltene gemmes på din computer. Når hotellet får en server, kan alle spillere se dem.</p></div></div>";
  ejerIndhold.innerHTML = html;

  ejerIndhold.querySelectorAll("[data-an-spiller]").forEach(function (k) {
    k.addEventListener("click", function () { ansatValgt = k.dataset.anSpiller; fyrSikker = false; visAnsaettelse(); });
  });
  ejerIndhold.querySelectorAll("[data-skilt]").forEach(function (k) {
    k.addEventListener("click", function () {
      const s = SKILTE.find(function (x) { return x.id === k.dataset.skilt; });
      ansatte[ansatValgt] = s.id;
      gemAnsatte();
      adminSkriv("Ansættelse: " + ansatValgt + " fik skiltet " + s.navn);
      fyrSikker = false;
      visAnsaettelse();
    });
  });
  const fyr = document.getElementById("an-fyr");
  if (fyr) fyr.addEventListener("click", function () {
    if (!fyrSikker) { fyrSikker = true; visAnsaettelse(); return; }
    const gammel = rolleSkilt(ansatValgt);
    delete ansatte[ansatValgt];
    gemAnsatte();
    adminSkriv("Ansættelse: " + ansatValgt + " blev fyret" + (gammel ? " som " + gammel.navn : ""));
    fyrSikker = false;
    visAnsaettelse();
  });
  ejerIndhold.querySelectorAll("[data-an-vis]").forEach(function (k) {
    k.addEventListener("click", function (e) { e.preventDefault(); ansatValgt = k.dataset.anVis; fyrSikker = false; visAnsaettelse(); });
  });
}
function liste_(navne) {
  if (!navne.length) return "<p class='ejer-tom'>Ingen har fået et skilt endnu.</p>";
  return "<ul class='an-liste'>" + navne.map(function (n) {
    const s = rolleSkilt(n);
    return "<li><img src='" + s.fil + "' alt=''><a href='#' data-an-vis='" + rens(n) + "'>" + rens(n) + "</a><span>" + rens(s.navn) + "</span></li>";
  }).join("") + "</ul>";
}


// -------------------------------------------------------------
//  Skiltet over hovedet (gæsterne i hallen og dig selv)
// -------------------------------------------------------------
const SKILT_HOEJDE = 40;     // hvor højt skiltet er over hovedet, i spil-punkter
function tegnRolleSkilt(sk, x, bund) {
  const b = hentBillede(sk.fil);
  if (!billedeKlar(b)) return;
  const s = SKILT_HOEJDE / b.naturalHeight;
  ctx.drawImage(b, Math.round(x - b.naturalWidth * s / 2), Math.round(bund - SKILT_HOEJDE), b.naturalWidth * s, SKILT_HOEJDE);
}

const tegnHalGaestFoerSkilt = tegnHalGaest;
tegnHalGaest = function (g) {
  tegnHalGaestFoerSkilt(g);
  const sk = rolleSkilt(g.navn);
  if (!sk) return;
  const p = punkt(g.x + 0.5, g.y + 0.5);
  p.x += gaestPlads(g);
  const sidde = g.sidder ? MOEBEL_TYPER[g.saede.type].saede : 0;
  const hoejde = figurHoejde(g.valg) - 10 + (g.sidder ? -sidde + 10 : 0);
  // over navnet, og over straf-skiltet hvis der er et
  const straf = typeof strafSkilt === "function" && strafSkilt(g.navn);
  tegnRolleSkilt(sk, p.x, p.y - hoejde - (straf ? 48 : 24));
};

// i chatloggen står skiltet foran navnet
const sigFoerSkilt = sig;
sig = function (hvem, navn, tekst) {
  sigFoerSkilt(hvem, navn, tekst);
  const sk = rolleSkilt(navn);
  const li = chatlogListe.lastElementChild;
  if (!sk || !li || !String(tekst).trim()) return;
  const b = li.querySelector("b");
  if (!b) return;
  const img = document.createElement("img");
  img.className = "cl-skilt";
  img.src = sk.fil;
  img.alt = sk.navn;
  img.title = sk.navn;
  b.before(img);
};
