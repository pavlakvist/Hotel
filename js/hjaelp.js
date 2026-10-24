// =============================================================
//  🚨 Tilkald hjælp (kun for ansatte og ejeren)
//  Knappen sidder under "online". Trykker en ansat på den, lyser
//  en stor alarm op hos de ansatte: "En ansat har brug for hjælp",
//  med en knap der fører direkte ind i rummet.
//  (Indtil hotellet får en server, ses alarmen kun på denne computer.)
// =============================================================
const HJAELP_NOEGLE = "mit-hotel-hjaelp";
const HJAELP_VARER = 10 * 60 * 1000;      // en alarm forsvinder af sig selv efter 10 minutter

function hentAlarmer() {
  let liste = [];
  try { liste = JSON.parse(localStorage.getItem(HJAELP_NOEGLE) || "[]"); } catch (e) {}
  return liste.filter(function (a) { return !a.klaret && Date.now() - a.tid < HJAELP_VARER; });
}
function gemAlarmer(liste) {
  try { localStorage.setItem(HJAELP_NOEGLE, JSON.stringify(liste)); } catch (e) {}
}
function erAnsatHer() {
  return typeof erAnsat === "function" ? erAnsat(FIGUR.navn) : EJERE.indexOf(FIGUR.navn) >= 0;
}

// ----- knappen under online -----
const hjaelpKnap = document.createElement("button");
hjaelpKnap.id = "hjaelp-knap";
hjaelpKnap.type = "button";
hjaelpKnap.innerHTML = "🚨 Tilkald hjælp";
hjaelpKnap.title = "Kun for ansatte: få hjælp fra de andre ansatte";
document.body.appendChild(hjaelpKnap);

function visHjaelpKnap() {
  hjaelpKnap.hidden = !erAnsatHer();
}

hjaelpKnap.addEventListener("click", function () {
  const liste = hentAlarmer();
  if (liste.some(function (a) { return a.navn === FIGUR.navn; })) {
    besked.textContent = "🚨 Du har allerede tilkaldt hjælp. Vent på en ansat.";
    return;
  }
  liste.push({
    id: "h" + Date.now().toString(36),
    navn: FIGUR.navn,
    rum: rumValg === "hal" ? "hal" : aktivtVaerelse,
    rumNavn: rumValg === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse),
    tid: Date.now(),
  });
  gemAlarmer(liste);
  if (typeof adminSkriv === "function") adminSkriv(FIGUR.navn + " tilkaldte hjælp i " + liste[liste.length - 1].rumNavn);
  besked.textContent = "🚨 Hjælp er tilkaldt! De andre ansatte kan se det nu.";
  visAlarmer();
});


// ----- den store alarm -----
const alarmBoks = document.createElement("div");
alarmBoks.id = "hjaelp-alarm";
alarmBoks.hidden = true;
document.body.appendChild(alarmBoks);
const alarmKant = document.createElement("div");
alarmKant.id = "hjaelp-kant";
alarmKant.hidden = true;
document.body.appendChild(alarmKant);
let lukkedeAlarmer = [];     // dem du har trykket "Luk" på

function gaaTilAlarm(a) {
  if (a.rum === "hal") { if (rumValg !== "hal") skiftRum("hal"); }
  else if (!(rumValg === "vaerelse" && aktivtVaerelse === a.rum)) gaaTilVaerelse(a.rum);
  besked.textContent = "🚨 Du er på vej til " + a.navn + " i " + a.rumNavn + ".";
}

function visAlarmer() {
  visHjaelpKnap();
  const alle = hentAlarmer();
  const vis = erAnsatHer() ? alle.filter(function (a) { return lukkedeAlarmer.indexOf(a.id) < 0; }) : [];
  alarmBoks.hidden = !vis.length;
  alarmKant.hidden = !vis.some(function (a) { return a.navn !== FIGUR.navn; });
  hjaelpKnap.classList.toggle("tilkaldt", alle.some(function (a) { return a.navn === FIGUR.navn; }));
  const noegle = FIGUR.navn + ":" + vis.map(function (a) { return a.id; }).join(",");
  if (alarmBoks.dataset.noegle === noegle) return;     // tegn kun om, når noget har ændret sig
  alarmBoks.dataset.noegle = noegle;
  alarmBoks.innerHTML = "";
  vis.forEach(function (a) {
    const mig = a.navn === FIGUR.navn;
    const el = document.createElement("div");
    el.className = "hjaelp-boks" + (mig ? " mig" : "");
    el.innerHTML = "<div class='hjaelp-ikon'>🚨</div><div class='hjaelp-tekst'><b>" +
      (mig ? "Du har tilkaldt hjælp" : "HJÆLP! En ansat har brug for hjælp") + "</b><span>" +
      (mig ? "i " + rens(a.rumNavn) + " · de andre ansatte kan se det" : rens(a.navn) + " i " + rens(a.rumNavn)) + "</span></div>" +
      "<div class='hjaelp-knapper'>" +
      (mig ? "<button data-a='klaret'>✓ Klaret, annullér</button>"
           : "<button data-a='gaa' class='gaa'>➡ Gå derhen</button><button data-a='klaret'>✓ Jeg tager den</button><button data-a='luk' title='Skjul for mig'>✕</button>") +
      "</div>";
    el.querySelectorAll("button").forEach(function (k) {
      k.addEventListener("click", function () {
        if (k.dataset.a === "gaa") gaaTilAlarm(a);
        if (k.dataset.a === "luk") lukkedeAlarmer.push(a.id);
        if (k.dataset.a === "klaret") {
          // alarmen forsvinder for alle
          gemAlarmer(hentAlarmer().filter(function (x) { return x.id !== a.id; }));
          if (!mig && typeof adminSkriv === "function") adminSkriv(FIGUR.navn + " tog sig af " + a.navn + "s hjælp-alarm");
        }
        alarmBoks.dataset.noegle = "";
        visAlarmer();
      });
    });
    alarmBoks.appendChild(el);
  });
}

// alarmen dukker op, så snart nogen tilkalder hjælp (også i en anden fane)
window.addEventListener("storage", function (e) { if (e.key === HJAELP_NOEGLE) visAlarmer(); });
setInterval(visAlarmer, 1000);
visAlarmer();
