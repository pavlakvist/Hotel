// =============================================================
//  📘 Forklaringer i panelet (Ejerpanel, Mod-panel, Eventvært- og Staff-panel)
//  - Ny fane "📘 Guide" øverst for alle: hvad panelet er, hvad dit job må,
//    og reglerne for personalet.
//  - Øverst i hver fane står en gul boks "❓ Sådan bruger du fanen", som kan
//    klappes sammen. Den husker, om du har lukket den.
//  Teksterne står i PANEL_HJAELP herunder og kan rettes frit.
// =============================================================
const PANEL_HJAELP = {
  oversigt: { titel: "📊 Oversigt", tekst: "Et hurtigt overblik over hotellet lige nu: hvor mange der er online, nye spillere og hvad der er sket for nylig.",
    punkter: ["Kig her først, når du starter din vagt.", "Tallene opdaterer sig selv."] },
  spillere: { titel: "👥 Spillere og konti", tekst: "Alle spillere på hotellet. Klik på et navn for at se dem og give en straf.",
    punkter: ["⚠️ <b>Advar</b>: spilleren får en rød besked midt på skærmen. Brug det først.",
      "🔇 <b>Timeout</b>: spilleren kan ikke skrive i chatten i den tid, du vælger.",
      "🧊 <b>Frys</b>: spilleren kan hverken gå eller skrive.",
      "⛔ <b>Ban</b>: spilleren kan ikke logge ind. Kun ved grove ting.",
      "Skriv altid en <b>grund</b>, så andre kan se hvorfor.",
      "Under <b>Aktive straffe</b> kan du ophæve en straf igen."] },
  chat: { titel: "💬 Chatlogs", tekst: "Alt hvad der er skrevet højt i rummene, så du kan se, hvad der skete.",
    punkter: ["Brug det, når nogen rapporterer en anden, så du kan se om det passer.", "Søg efter et navn eller et ord."] },
  beskeder: { titel: "✉️ Private beskeder", tekst: "Spillernes private beskeder til hinanden.",
    punkter: ["Fanen er låst for ansatte, indtil ejeren giver adgang. Tryk 🙋 Bed om adgang, hvis du skal bruge den.",
      "Læs kun beskeder, når der er en god grund, fx en rapport om mobning.", "Fortæl aldrig andre, hvad der står i dem."] },
  rapporter: { titel: "🚩 Rapporter og moderation", tekst: "Her lander det, når en spiller trykker Rapportér på en anden.",
    punkter: ["Læs rapporten, og tjek Chatlogs for at se hvad der skete.", "Giv en straf under Spillere og konti, hvis det er nødvendigt.",
      "Tryk ✓ Behandlet bagefter, så de andre ansatte kan se, at den er klaret."] },
  ip: { titel: "🔐 IP og loginhistorik", tekst: "Hvem der har logget ind og hvornår, og hvem der er bannet.", punkter: ["Kun for ejeren."] },
  rum: { titel: "🛋️ Rum og møbler", tekst: "Alle rum på hotellet og hvad der står i dem.", punkter: ["Kun for ejeren."] },
  valuta: { titel: "🪙 Valuta og økonomi", tekst: "Giv eller tag ⭐ Glimt og 🔮 Stella fra spillerne.",
    punkter: ["Vælg en spiller, skriv beløbet og tryk Giv eller Tag.", "🎉 Giv til alle spillere: den gule boks giver alle (undtagen ejerne) det samme beløb. Tryk to gange."] },
  events: { titel: "📰 Events og nyheder", tekst: "Send nyheder og store bannere ud til hele hotellet, og hold styr på events.",
    punkter: ["Skriv en titel og en tekst, og sæt flueben i <b>Vis som stort banner</b>, hvis alle skal se den øverst på skærmen.",
      "Under Udsendte nyheder kan du fjerne et banner igen.", "🎂 Fødselsdage: se hvem der har fødselsdag, og lav et fødselsdagsbanner.",
      "🗝 Nøgler fra events giver en spiller adgang til den hemmelige etage (kun ejeren)."] },
  adminlog: { titel: "📜 Administratorlog", tekst: "En liste over alt, hvad ejeren og de ansatte har gjort i panelet: straffe, penge, ansættelser osv.",
    punkter: ["Den kan ikke slettes, så alle kan se hvem der gjorde hvad."] },
  system: { titel: "⚙️ Systemindstillinger", tekst: "Hotellets indstillinger, fx at låse og åbne event-rummene.", punkter: ["Lås et event-rum, mens I gør klar til et event."] },
  ansaettelse: { titel: "🎖️ Ansættelse", tekst: "Giv en spiller et job eller et skilt.",
    punkter: ["Vælg spilleren til venstre, og klik på et skilt.", "🔥 Fyr fjerner skiltet igen (tryk to gange).", "Læs Jobbeskrivelser nederst for at se, hvad hvert job må."] },
  mitjob: { titel: "📖 Mit job", tekst: "Dit job, og hvad du må og skal.", punkter: ["Er du i tvivl om noget, så skriv til ejeren i Staff chat."] },
  staffchat: { titel: "💬 Staff chat", tekst: "En chat kun for personalet. Fælles chat for alle ansatte, og en privat samtale med hver enkelt.",
    punkter: ["Brug den til at aftale vagter, spørge om hjælp eller sige, hvis der er problemer.", "Ejeren kan her give adgang til private beskeder."] },
  ansoegninger: { titel: "📝 Ansøgninger", tekst: "Ansøgninger om at blive staff fra forsiden.",
    punkter: ["👀 Se ansøgning for at læse den.", "💬 Kontakt via privat besked for at skrive til personen.", "✅ Godkend, ❌ Afvis eller 🎖️ Ansæt direkte."] },
  sletbruger: { titel: "🗑 Slet bruger", tekst: "Slet en spillers profil helt. Det kan ikke fortrydes.", punkter: ["Kun for ejeren. Tryk to gange."] },
};

// Hvad hver rolle skal vide (vises i Guide-fanen)
const ROLLE_GUIDE = {
  ejer: "Du ejer hotellet og kan se alle faner. Det, du giver de ansatte, kan du altid selv.",
  mod: "Du er moderator. Du holder øje med chatten, læser rapporter og giver straffe, når nogen ikke opfører sig ordentligt.",
  eventvaert: "Du er eventvært. Du laver events, sender nyheder og bannere ud og låser event-rummene, mens I gør klar.",
  staff: "Du er en del af personalet. Du holder øje med hotellet og hjælper, hvor der er brug for det.",
  hjaelper: "Du er hjælper. Du byder nye gæster velkommen og svarer på spørgsmål i hallen.",
  bygmester: "Du er bygmester. Møblerne er gratis for dig i de fælles rum, så du kan pynte hallen og event-rummene.",
  support: "Du er support. Du hjælper, når noget driller, fx log ind eller ting der ikke virker.",
  "content-creator": "Du er content creator. Du laver billeder, videoer og opslag om hotellet.",
};
const STAFF_REGLER = ["😊 Vær venlig og rolig, også når andre ikke er det.",
  "⚠️ Advar først. Brug kun ban ved grove ting (fx trusler, snyd eller gentagen mobning).",
  "📝 Skriv altid en grund, når du giver en straf.",
  "🔒 Fortæl aldrig andre om private beskeder eller hvem der har rapporteret.",
  "🙅 Brug aldrig dine knapper på dine venner eller for sjov.",
  "💬 Er du i tvivl, så spørg i Staff chat eller skriv til ejeren."];

const PANEL_HJAELP_NOEGLE = "mit-hotel-panel-hjaelp-lukket";
let hjaelpLukket = {};
try { hjaelpLukket = JSON.parse(localStorage.getItem(PANEL_HJAELP_NOEGLE) || "{}"); } catch (e) {}

// Guide-fanen øverst for alle med et panel
Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("guide") < 0) ROLLE_FANER[r].unshift("guide"); });
const guideFane = document.createElement("button");
guideFane.dataset.fane = "guide";
guideFane.textContent = "📘 Guide";
document.getElementById("ejer-faner").prepend(guideFane);
guideFane.addEventListener("click", function () { ejerFane = "guide"; visFane(); });

function guideHtml() {
  const r = minRolle() || "ejer";
  const tilladte = Array.from(document.querySelectorAll("#ejer-faner button")).filter(function (k) {
    return !k.hidden && PANEL_HJAELP[k.dataset.fane];
  });
  return "<div class='pf-guide'><h3>📘 Sådan virker panelet</h3>" +
    "<p class='pf-rolle'>" + rens(ROLLE_GUIDE[r] || ROLLE_GUIDE.staff) + "</p>" +
    "<h4>Dine faner</h4><div class='pf-faner'>" + tilladte.map(function (k) {
      const h = PANEL_HJAELP[k.dataset.fane];
      return "<button type='button' data-pf-gaa='" + k.dataset.fane + "'><b>" + h.titel + "</b><small>" + h.tekst + "</small></button>";
    }).join("") + "</div>" +
    "<h4>Reglerne for personalet</h4><ul class='pf-regler'>" + STAFF_REGLER.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" +
    "<h4>Gode at vide</h4><ul class='pf-regler'>" +
    "<li>🛡️ Knappen i chatbaren åbner og lukker panelet.</li>" +
    "<li>🌙 skifter til mørkt tema, ⤢ gør panelet stort. Træk i toppen for at flytte det.</li>" +
    "<li>🚨 <b>Tilkald hjælp</b> (øverst til venstre) sender en alarm til alle ansatte.</li>" +
    "</ul></div>";
}

const visFaneFoerForklaring = visFane;
visFane = function () {
  visFaneFoerForklaring();
  guideFane.hidden = !minRolle();
  if (ejerVindue.hidden || !minRolle()) return;
  if (ejerFane === "guide") {
    ejerIndhold.innerHTML = guideHtml();
    ejerIndhold.querySelectorAll("[data-pf-gaa]").forEach(function (k) {
      k.addEventListener("click", function () { ejerFane = k.dataset.pfGaa; visFane(); });
    });
    return;
  }
  // De gule "❓ Sådan bruger du fanen"-bokse er fjernet (Pavla 28/10). Forklaringerne står stadig i 📘 Guide.
  return;
  const h = PANEL_HJAELP[ejerFane];
  if (!h || ejerIndhold.querySelector(".pf-hjaelp")) return;
  const boks = document.createElement("details");
  boks.className = "pf-hjaelp";
  boks.open = !hjaelpLukket[ejerFane];
  boks.innerHTML = "<summary>❓ Sådan bruger du fanen " + h.titel + "</summary><p>" + h.tekst + "</p>" +
    (h.punkter.length ? "<ul>" + h.punkter.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "");
  const fane = ejerFane;
  boks.addEventListener("toggle", function () {
    if (boks.open) delete hjaelpLukket[fane]; else hjaelpLukket[fane] = true;
    try { localStorage.setItem(PANEL_HJAELP_NOEGLE, JSON.stringify(hjaelpLukket)); } catch (e) {}
  });
  ejerIndhold.prepend(boks);
};
// Første gang man åbner panelet, starter man i Guide
(function () {
  try {
    if (localStorage.getItem("mit-hotel-panel-guide-set")) return;
    ejerFane = "guide";
    localStorage.setItem("mit-hotel-panel-guide-set", "1");
  } catch (e) {}
})();

const forklaringStil = document.createElement("style");
forklaringStil.textContent =
  "#ejer-indhold .pf-hjaelp { margin: 0 0 12px; padding: 8px 12px; background: #fff8dc; border: 2px solid #ecd27e; border-radius: 10px; color: #4a3d14; font-size: 12px; }" +
  "#ejer-indhold .pf-hjaelp summary { cursor: pointer; font-weight: bold; color: #6a5414; }" +
  "#ejer-indhold .pf-hjaelp p { margin: 6px 0 4px; }" +
  "#ejer-indhold .pf-hjaelp ul { margin: 4px 0 2px; padding-left: 18px; }" +
  "#ejer-indhold .pf-hjaelp li { display: list-item; padding: 2px 0; border: 0; }" +
  "#ejer-indhold .pf-guide { max-width: 700px; }" +
  "#ejer-indhold .pf-rolle { padding: 10px 12px; background: #e8f2dc; border: 2px solid #9ccc8f; border-radius: 10px; color: #1f3a1c; }" +
  "#ejer-indhold .pf-faner { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }" +
  "#ejer-indhold .pf-faner button { display: flex; flex-direction: column; gap: 3px; padding: 8px 10px; text-align: left; border: 2px solid #9ccc8f;" +
  " border-radius: 10px; background: #fff; color: #1f3a1c; font: 12px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold .pf-faner button:hover { background: #eef7e6; }" +
  "#ejer-indhold .pf-faner small { color: #4d5a48; font-size: 11px; }" +
  "#ejer-indhold ul.pf-regler { padding-left: 20px; }" +
  "#ejer-indhold ul.pf-regler li { display: list-item; padding: 3px 0; border: 0; }";
document.head.appendChild(forklaringStil);

// 📝 Eventnoter, 🏆 vindere og 🎁 gratis gevinst (js/event-vindere.js) hentes herfra,
// så hotel.html ikke skal ændres. Den kører, når alt det andet er klar.
(function () {
  const s = document.createElement("script");
  s.src = "js/event-vindere.js?v=3";
  document.body.appendChild(s);
})();

// 🧊 Køleskabet med gulerod, sodavand og is (js/koeleskab.js) hentes også herfra.
(function () {
  if (document.querySelector("script[src^='js/koeleskab.js']")) return;   // står den allerede i hotel.html?
  const s = document.createElement("script");
  s.src = "js/koeleskab.js?v=1";
  document.body.appendChild(s);
})();

// 🌿 Skånsom visning (js/skaansom.js): rarere for øjnene, knap øverst ved 🚪 Log ud.
(function () {
  if (document.querySelector("script[src^='js/skaansom.js']")) return;   // står den allerede i hotel.html?
  const s = document.createElement("script");
  s.src = "js/skaansom.js?v=1";
  document.body.appendChild(s);
})();

// 🍷 Vinrødt hotel-tema (js/vinroed-tema.js): det grønne bliver vinrødt, guld og creme.
(function () {
  if (document.querySelector("script[src^='js/vinroed-tema.js']")) return;
  const s = document.createElement("script");
  s.src = "js/vinroed-tema.js?v=2";
  document.body.appendChild(s);
})();

// 🎵 Elevatormusik (js/elevator-musik.js): hyggelig musik i elevatoren, med 🔊/🔇-knap.
(function () {
  if (document.querySelector("script[src^='js/elevator-musik.js']")) return;
  const s = document.createElement("script");
  s.src = "js/elevator-musik.js?v=1";
  document.body.appendChild(s);
})();

// 🎬 Biografen (js/biograf.js): lærred med film, biografsæder og popcorn.
(function () {
  if (document.querySelector("script[src^='js/biograf.js']")) return;
  const s = document.createElement("script");
  s.src = "js/biograf.js?v=4";
  document.body.appendChild(s);
})();
