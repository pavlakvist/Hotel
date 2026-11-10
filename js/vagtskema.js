// =============================================================
//  📅 Vagtskema for de ansatte
//  - Fanen "📅 Vagtskema" i panelet. Kun ejeren og de ansatte kan se den.
//  - Skemaet er delt op i kategorier efter skiltet: MOD, Staff, Eventvært,
//    Hjælper osv. Hver kategori har sit eget skema for ugen.
//  - De ansatte skriver sig selv på vagter i deres egen kategori ("+ Skriv dig på")
//    og kan fjerne deres egne vagter igen (✕).
//  - Ejeren kan skrive alle ansatte på (og sig selv overalt) og fjerne alle.
//  - Ude i hotellet står en lille knap "📅 Vagt" ved Tilkald hjælp (kun ansatte og ejeren),
//    der viser din næste vagt og åbner skemaet.
//  - 🤒 Meld dig syg: under "Dine vagter". Vagten bliver ledig igen, og ejeren får
//    en besked på sin telefon 📱 (Beskeder). Kræver database-44-meld-syg.sql.
//  (Kræver database-31-vagtskema.sql. Indtil den er kørt, gemmes skemaet kun på denne computer.)
// =============================================================
const VS_LOKAL_NOEGLE = "mit-hotel-vagter";
const VS_TIDER = ["06:00 – 10:00", "10:00 – 14:00", "14:00 – 18:00", "18:00 – 22:00", "22:00 – 02:00"];
const VS_START = [6, 10, 14, 18, 22];
const VS_DAGE = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const VS_DAGE_LANG = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
const VS_MDR = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const VS_MAKS = 4;   // højst 4 på samme vagt i samme kategori
// Kategorierne (samme rækkefølge som i Staff chat)
const VS_KATEGORIER = [
  ["mod", "🛡️", "MOD"], ["staff", "⭐", "Staff"], ["eventvaert", "🎉", "Eventvært"], ["eventfolk", "🎪", "Eventfolk"],
  ["bygmester", "🔨", "Bygmester"], ["support", "🛠", "Support"], ["hjaelper", "🙋", "Hjælper"], ["content-creator", "🎥", "Content creator"]
];

let vsVagter = [];          // [{ id, dato "2026-11-09", slot, rolle, navn, hvem }]
let vsHentet = false;
let vsLokal = false;        // true = serveren kender ikke vagtskemaet endnu
let vsFejl = "";
let vsUge = 0;              // 0 = denne uge, 1 = næste uge …
let vsKat = null;           // valgt kategori ("alle" eller et skilt)
let vsVisning = "uge";      // "uge" eller "liste"
let vsVaelgNavn = null;     // ejeren: hvilken celle vælger hun en ansat til? "dato|slot"
let vsSygId = null;         // hvilken af mine vagter er jeg ved at melde mig syg til?

function vsErEjer() { return EJERE.indexOf(FIGUR.navn) >= 0; }
function vsMig() { return FIGUR.navn; }
function vsMinKat() { const s = ansatte[FIGUR.navn]; return VS_KATEGORIER.some(function (k) { return k[0] === s; }) ? s : null; }
function vsMaaSe() { return vsErEjer() || (typeof erAnsat === "function" && erAnsat(FIGUR.navn)); }
function vsKatInfo(id) { if (id === "alle") return ["alle", "👥", "Alle"]; return VS_KATEGORIER.find(function (k) { return k[0] === id; }) || [id, "👤", id]; }

// ----- datoer -----
function vsTo(n) { return (n < 10 ? "0" : "") + n; }
function vsDatoTekst(d) { return d.getFullYear() + "-" + vsTo(d.getMonth() + 1) + "-" + vsTo(d.getDate()); }
function vsFraTekst(t) { const p = t.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function vsMandag(ugerFrem) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 7 * ugerFrem);
  return d;
}
function vsUgeDage() {
  const m = vsMandag(vsUge);
  return [0, 1, 2, 3, 4, 5, 6].map(function (i) { const d = new Date(m); d.setDate(m.getDate() + i); return d; });
}
function vsUgeNr(d) {   // ISO-ugenummer
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const aar = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - aar) / 86400000 + 1) / 7);
}
function vsKort(d) { return d.getDate() + ". " + VS_MDR[d.getMonth()]; }
function vsIdag() { return vsDatoTekst(new Date()); }
// Er vagten (dato + slot) slut? 22–02 slutter kl. 2 næste dag
function vsSlut(dato, slot) { const d = vsFraTekst(dato); d.setHours(VS_START[slot] + 4); return d.getTime() < Date.now(); }
function vsIgang(dato, slot) {
  const d = vsFraTekst(dato); d.setHours(VS_START[slot]);
  return d.getTime() <= Date.now() && Date.now() < d.getTime() + 4 * 3600000;
}


// -------------------------------------------------------------
//  Gem og hent (serveren, eller denne computer indtil SQL'en er kørt)
// -------------------------------------------------------------
function vsLokalHent() { try { return JSON.parse(localStorage.getItem(VS_LOKAL_NOEGLE) || "[]"); } catch (e) { return []; } }
function vsLokalGem(l) { try { localStorage.setItem(VS_LOKAL_NOEGLE, JSON.stringify(l)); } catch (e) {} }
function vsManglerSql(e) { return /function|schema cache|does not exist|hv_vag/i.test(e && e.message || ""); }
function vsServer() { return typeof SERVER !== "undefined" && SERVER.til && typeof mitToken === "function" && mitToken(); }

function vsHent() {
  if (!vsMaaSe()) return;
  const dage = vsUgeDage();
  const fra = new Date(Math.min(dage[0].getTime(), vsMandag(0).getTime()));
  const til = new Date(Math.max(dage[6].getTime(), vsMandag(1).getTime() + 6 * 86400000));
  if (!vsServer() || vsLokal) { vsSaetVagter(vsLokalHent()); return; }
  serverKald("hv_vagter_hent", { p_token: mitToken(), p_fra: vsDatoTekst(fra), p_til: vsDatoTekst(til) }).then(function (svar) {
    vsFejl = "";
    vsSaetVagter(svar || []);
  }).catch(function (e) {
    if (vsManglerSql(e)) { vsLokal = true; vsSaetVagter(vsLokalHent()); }
    else { vsFejl = e.message; vsHentet = true; vsTegnIgen(); }
  });
}
function vsSaetVagter(liste) {
  const foer = JSON.stringify(vsVagter);
  vsVagter = liste.map(function (v) { return { id: v.id, dato: String(v.dato).slice(0, 10), slot: +v.slot, rolle: v.rolle, navn: v.navn, hvem: v.hvem, syg: v.syg || null, grund: v.grund || "" }; });
  const nyt = !vsHentet || JSON.stringify(vsVagter) !== foer;
  vsHentet = true;
  if (nyt) vsTegnIgen();
}
function vsTegnIgen() {
  vsOpdaterKnap();
  if (!ejerVindue.hidden && ejerFane === "vagtskema" && !skriverIPanel()) visFane();
}

function vsSkriv(dato, slot, rolle, navn) {
  navn = navn || vsMig();
  const findes = vsVagter.find(function (v) { return v.dato === dato && v.slot === slot && v.rolle === rolle && v.navn.toLowerCase() === navn.toLowerCase(); });
  if (findes && !findes.syg) return;
  if (vsVagter.filter(function (v) { return v.dato === dato && v.slot === slot && v.rolle === rolle && !v.syg; }).length >= VS_MAKS) {
    besked.textContent = "Der er allerede " + VS_MAKS + " på den vagt."; return;
  }
  const tekst = "📅 " + (navn === vsMig() ? "Du er" : navn + " er") + " skrevet på " + VS_DAGE_LANG[(vsFraTekst(dato).getDay() + 6) % 7] + " " + VS_TIDER[slot] + ".";
  if (!vsServer() || vsLokal) {
    const l = vsLokalHent().filter(function (x) { return !findes || String(x.id) !== String(findes.id); });
    l.push({ id: Date.now(), dato: dato, slot: slot, rolle: rolle, navn: navn, hvem: vsMig() });
    vsLokalGem(l);
    besked.textContent = tekst;
    vsSaetVagter(l);
    return;
  }
  serverKald("hv_vagt_skriv", { p_token: mitToken(), p_dato: dato, p_slot: slot, p_rolle: rolle, p_navn: navn === vsMig() ? null : navn })
    .then(function () { besked.textContent = tekst; vsHent(); })
    .catch(function (e) {
      if (vsManglerSql(e)) { vsLokal = true; vsSkriv(dato, slot, rolle, navn); return; }
      besked.textContent = "⚠️ " + e.message;
    });
}
function vsSlet(id) {
  const v = vsVagter.find(function (x) { return String(x.id) === String(id); });
  if (!v) return;
  if (!vsServer() || vsLokal) {
    const l = vsLokalHent().filter(function (x) { return String(x.id) !== String(id); });
    vsLokalGem(l);
    vsSaetVagter(l);
    return;
  }
  serverKald("hv_vagt_slet", { p_token: mitToken(), p_id: +id }).then(vsHent).catch(function (e) { besked.textContent = "⚠️ " + e.message; });
}
// 🤒 Meld dig syg (syg = true) eller rask igen (syg = false)
function vsSyg(id, grund, syg) {
  const v = vsVagter.find(function (x) { return String(x.id) === String(id); });
  if (!v) return;
  const tekst = syg ? "🤒 Du har meldt dig syg. Ejeren har fået besked på sin telefon. God bedring!" : "💪 Du er skrevet på vagten igen.";
  if (!vsServer() || vsLokal) {
    const l = vsLokalHent();
    l.forEach(function (x) { if (String(x.id) === String(id)) { x.syg = syg ? new Date().toISOString() : null; x.grund = syg ? grund : ""; } });
    vsLokalGem(l);
    besked.textContent = syg ? "🤒 Du er meldt syg (kun på denne computer, indtil database-44-meld-syg.sql er kørt)." : tekst;
    vsSaetVagter(l);
    return;
  }
  serverKald("hv_vagt_syg", { p_token: mitToken(), p_id: +id, p_grund: grund || null, p_syg: !!syg })
    .then(function () { besked.textContent = tekst; vsHent(); })
    .catch(function (e) {
      besked.textContent = vsManglerSql(e) ? "⚠️ Kør database-44-meld-syg.sql i Supabase → SQL Editor, så kan man melde sig syg." : "⚠️ " + e.message;
    });
}
setInterval(function () {
  if (!vsMaaSe()) return;
  if (!ejerVindue.hidden && ejerFane === "vagtskema") vsHent();
}, 5000);
setInterval(vsHent, 60000);     // knappen ude i hotellet holdes frisk
setTimeout(vsHent, 1500);


// -------------------------------------------------------------
//  Fanen i panelet
// -------------------------------------------------------------
function vsGivFane() {
  Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("vagtskema") < 0) ROLLE_FANER[r].push("vagtskema"); });
}
vsGivFane();
const vsFane = document.createElement("button");
vsFane.dataset.fane = "vagtskema";
vsFane.textContent = "📅 Vagtskema";
vsFane.addEventListener("click", function () { ejerFane = "vagtskema"; visFane(); });
(function () {
  const efter = document.querySelector('#ejer-faner [data-fane="staffchat"]') || document.querySelector('#ejer-faner [data-fane="guide"]');
  if (efter) efter.after(vsFane); else document.getElementById("ejer-faner").appendChild(vsFane);
})();
setInterval(function () { vsGivFane(); vsFane.hidden = !vsMaaSe(); }, 1000);
vsFane.hidden = !vsMaaSe();

if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP.vagtskema = { titel: "📅 Vagtskema",
  tekst: "Her ser du, hvem der har vagt på hotellet. Skemaet er delt op i kategorier, så hver slags ansat har sit eget skema.",
  punkter: ["Vælg din kategori øverst (fx 🛡️ MOD eller 🙋 Hjælper).", "Tryk <b>+ Skriv dig på</b> for at tage en vagt. ✕ fjerner din vagt igen.",
    "Du kan kun skrive dig på i din egen kategori. Ejeren kan skrive alle på.", "Knappen 📅 ude i hotellet viser din næste vagt.",
    "Er du syg, så tryk <b>🤒 Meld syg</b> under Dine vagter. Ejeren får en besked på sin telefon 📱, og vagten bliver ledig igen. <b>💪 Rask</b> fortryder det."] };
if (typeof JOB_KAN !== "undefined") VS_KATEGORIER.forEach(function (k) {
  const l = JOB_KAN[k[0]];
  if (l && l.indexOf("📅 Kan skrive sig på vagter i vagtskemaet") < 0) l.push("📅 Kan skrive sig på vagter i vagtskemaet");
});
if (typeof EJER_KAN !== "undefined") EJER_KAN.push("📅 Laver vagtskemaet og kan skrive alle ansatte på vagter");

const visFaneFoerVagt = visFane;
visFane = function () {
  const min = ejerFane === "vagtskema";
  if (min) ejerIndhold.innerHTML = "";
  visFaneFoerVagt();
  ejerIndhold.classList.toggle("vs-aaben", min && !ejerVindue.hidden);
  if (ejerVindue.hidden || !min || !vsMaaSe()) return;
  const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
  ejerIndhold.innerHTML = "";
  const sek = document.createElement("div");
  sek.className = "vs-fane";
  ejerIndhold.appendChild(sek);
  visVagtskema(sek);
  if (hjaelp) ejerIndhold.prepend(hjaelp);
};

// Hvem kan ejeren sætte på i en kategori?
function vsAnsatteI(kat) {
  return Object.keys(ansatte).filter(function (n) { return ansatte[n] === kat && EJERE.indexOf(n) < 0; }).sort();
}
function vsVagterI(dato, slot, kat) {
  return vsVagter.filter(function (v) { return v.dato === dato && v.slot === slot && (kat === "alle" || v.rolle === kat); });
}
function vsMineVagter() {
  const mig = vsMig().toLowerCase();
  return vsVagter.filter(function (v) { return v.navn.toLowerCase() === mig && !v.syg && !vsSlut(v.dato, v.slot); })
    .sort(function (a, b) { return (a.dato + a.slot) < (b.dato + b.slot) ? -1 : 1; });
}
function vsSygeVagter(kunMine) {
  const mig = vsMig().toLowerCase();
  return vsVagter.filter(function (v) { return v.syg && !vsSlut(v.dato, v.slot) && (!kunMine || v.navn.toLowerCase() === mig); })
    .sort(function (a, b) { return (a.dato + a.slot) < (b.dato + b.slot) ? -1 : 1; });
}
function vsNaarTekst(v) {
  const d = vsFraTekst(v.dato);
  return (v.dato === vsIdag() ? "I dag" : VS_DAGE[(d.getDay() + 6) % 7] + " " + vsKort(d));
}
function vsMaaSkriveI(kat) { return kat !== "alle" && (vsErEjer() || vsMinKat() === kat); }

function vsNavnChip(v, visRolle) {
  const k = vsKatInfo(v.rolle);
  const mig = v.navn.toLowerCase() === vsMig().toLowerCase();
  const maaFjerne = mig || vsErEjer();
  return "<span class='vs-navn" + (mig ? " mig" : "") + (v.syg ? " syg" : "") + "' title='" + rens(k[2]) + (v.syg ? " · 🤒 meldt syg" + (v.grund ? ": " + rens(v.grund) : "") : "") +
    (v.hvem && v.hvem !== v.navn ? " · skrevet på af " + rens(v.hvem) : "") + "'>" +
    (v.syg ? "<i>🤒</i>" : visRolle ? "<i>" + k[1] + "</i>" : "") + "<b>" + rens(v.navn) + "</b>" +
    (maaFjerne ? "<button type='button' class='vs-fjern' data-vs-slet='" + rens(String(v.id)) + "' title='Fjern vagten'>✕</button>" : "") + "</span>";
}

function visVagtskema(sek) {
  if (!vsHentet) vsHent();
  if (!vsKat) vsKat = vsMinKat() || (vsErEjer() ? "alle" : "alle");
  const dage = vsUgeDage();
  const idag = vsIdag();
  const mine = vsMineVagter();
  const kat = vsKat;
  const kInfo = vsKatInfo(kat);

  let html = "<div class='vs-hoved'><div class='vs-titel'><span class='vs-ikon'>📅</span><div><h3>Vagtskema</h3>" +
    "<p>Skriv dig på en vagt og vær med til at holde hotellet i gang!</p></div></div></div>";
  if (vsLokal) html += "<p class='vs-advarsel'>⚠️ Serveren kender ikke vagtskemaet endnu, så det gemmes kun på denne computer. Kør <b>database-31-vagtskema.sql</b> i Supabase → SQL Editor.</p>";
  if (vsFejl) html += "<p class='vs-advarsel'>⚠️ " + rens(vsFejl) + "</p>";

  // kategorierne
  html += "<div class='vs-kat'>" + [["alle", "👥", "Alle"]].concat(VS_KATEGORIER).map(function (k) {
    const antal = vsVagter.filter(function (v) { return (k[0] === "alle" || v.rolle === k[0]) && dage.some(function (d) { return vsDatoTekst(d) === v.dato; }); }).length;
    return "<button type='button' data-vs-kat='" + k[0] + "' class='" + (k[0] === kat ? "valgt" : "") + (k[0] === vsMinKat() ? " min" : "") + "'>" +
      k[1] + " " + rens(k[2]) + (antal ? " <small>" + antal + "</small>" : "") + "</button>";
  }).join("") + "</div>";

  html += "<div class='vs-krop'><div class='vs-venstre'>";
  // ugen + visning
  html += "<div class='vs-bjaelke'><button type='button' class='vs-pil' data-vs-uge='-1' title='Forrige uge'>‹</button>" +
    "<div class='vs-uge'><b>Uge " + vsUgeNr(dage[0]) + "</b><small>" + vsKort(dage[0]) + " – " + vsKort(dage[6]) + "</small></div>" +
    "<button type='button' class='vs-pil' data-vs-uge='1' title='Næste uge'>›</button>" +
    (vsUge ? "<button type='button' class='vs-idag-knap' data-vs-uge='0'>I dag</button>" : "") +
    "<span class='vs-plads'></span>" +
    "<button type='button' class='vs-vis" + (vsVisning === "uge" ? " valgt" : "") + "' data-vs-vis='uge'>🗓 Ugevisning</button>" +
    "<button type='button' class='vs-vis" + (vsVisning === "liste" ? " valgt" : "") + "' data-vs-vis='liste'>☰ Listevisning</button></div>";

  html += "<p class='vs-katnavn'>" + kInfo[1] + " <b>" + rens(kInfo[2]) + "</b>" +
    (kat === "alle" ? " · alle kategorier på én gang" : vsMaaSkriveI(kat) ? (vsErEjer() && vsMinKat() !== kat ? " · du kan skrive alle " + rens(kInfo[2]) + " på" : " · din kategori") : " · du kan kun se denne kategori") + "</p>";

  if (vsVisning === "uge") {
    html += "<div class='vs-gitter-rulle'><table class='vs-gitter'><thead><tr><th class='vs-tid'>Tid</th>" + dage.map(function (d, i) {
      return "<th class='" + (vsDatoTekst(d) === idag ? "idag" : "") + "'>" + VS_DAGE[i] + "<small>" + vsKort(d) + "</small></th>";
    }).join("") + "</tr></thead><tbody>";
    VS_TIDER.forEach(function (tid, slot) {
      html += "<tr><th class='vs-tid'>" + tid + "</th>";
      dage.forEach(function (d) {
        const dato = vsDatoTekst(d);
        const her = vsVagterI(dato, slot, kat);
        const slut = vsSlut(dato, slot);
        const mig = her.some(function (v) { return !v.syg && v.navn.toLowerCase() === vsMig().toLowerCase(); });
        const raske = her.filter(function (v) { return !v.syg; }).length;
        const cls = [dato === idag ? "idag" : "", slut ? "slut" : "", vsIgang(dato, slot) ? "nu" : ""].join(" ");
        html += "<td class='" + cls + "'>" + her.map(function (v) { return vsNavnChip(v, kat === "alle"); }).join("");
        if (vsMaaSkriveI(kat) && (!slut || vsErEjer()) && raske < VS_MAKS) {
          const noegle = dato + "|" + slot;
          if (vsErEjer() && vsVaelgNavn === noegle) {
            const valg = [vsMig()].concat(vsAnsatteI(kat)).filter(function (n) { return !her.some(function (v) { return !v.syg && v.navn.toLowerCase() === n.toLowerCase(); }); });
            html += "<select class='vs-vaelg' data-vs-dato='" + dato + "' data-vs-slot='" + slot + "'><option value=''>Vælg …</option>" +
              valg.map(function (n) { return "<option value='" + rens(n) + "'>" + rens(n === vsMig() ? n + " (mig)" : n) + "</option>"; }).join("") + "</select>";
          } else if (!mig || vsErEjer()) {
            html += "<button type='button' class='vs-paa' data-vs-dato='" + dato + "' data-vs-slot='" + slot + "'>" + (vsErEjer() ? "+ Sæt på" : "+ Skriv dig på") + "</button>";
          }
        } else if (!her.length) html += "<span class='vs-tom'>" + (slut ? "" : "Ledig") + "</span>";
        html += "</td>";
      });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
  } else {
    // listevisning: dag for dag
    html += "<div class='vs-liste'>" + dage.map(function (d, i) {
      const dato = vsDatoTekst(d);
      const raekker = VS_TIDER.map(function (tid, slot) {
        const her = vsVagterI(dato, slot, kat);
        if (!her.length) return "";
        return "<li><span class='vs-liste-tid'>" + tid + "</span>" + her.map(function (v) { return vsNavnChip(v, true); }).join("") + "</li>";
      }).join("");
      return "<section class='" + (dato === idag ? "idag" : "") + "'><h4>" + VS_DAGE_LANG[i] + " " + vsKort(d) + (dato === idag ? " · i dag" : "") + "</h4>" +
        (raekker ? "<ul>" + raekker + "</ul>" : "<p class='vs-tom'>Ingen vagter.</p>") + "</section>";
    }).join("") + "</div>";
  }
  html += "</div>";

  // højre side: ledige vagter + dine vagter
  html += "<aside class='vs-hoejre'>";
  const minKat = vsErEjer() ? (kat !== "alle" ? kat : null) : vsMinKat();
  if (minKat) {
    const ledige = [];
    dage.forEach(function (d) {
      const dato = vsDatoTekst(d);
      VS_TIDER.forEach(function (t, slot) {
        if (!vsSlut(dato, slot) && !vsVagterI(dato, slot, minKat).some(function (v) { return !v.syg; })) ledige.push([dato, slot, d]);
      });
    });
    html += "<section class='vs-boks'><h4>🕒 Ledige vagter <small>" + vsKatInfo(minKat)[1] + " " + rens(vsKatInfo(minKat)[2]) + "</small></h4>" +
      (ledige.length ? "<ul>" + ledige.slice(0, 5).map(function (l) {
        return "<li><span><b>" + VS_DAGE[(l[2].getDay() + 6) % 7] + " " + vsKort(l[2]) + "</b><small>" + VS_TIDER[l[1]] + "</small></span>" +
          (vsErEjer() && vsMinKat() !== minKat ? "" : "<button type='button' class='vs-paa' data-vs-dato='" + l[0] + "' data-vs-slot='" + l[1] + "' data-vs-rolle='" + minKat + "'>Skriv mig på</button>") + "</li>";
      }).join("") + "</ul>" + (ledige.length > 5 ? "<p class='vs-lille'>… og " + (ledige.length - 5) + " mere i ugen.</p>" : "")
        : "<p class='vs-lille'>🎉 Alle vagter i ugen er taget.</p>") + "</section>";
  }
  html += "<section class='vs-boks'><h4>🙋 Dine vagter</h4>" +
    (mine.length ? "<p class='vs-lille'>Du er skrevet på " + mine.length + " vagt" + (mine.length === 1 ? "" : "er") + ".</p><ul>" + mine.slice(0, 6).map(function (v) {
      const d = vsFraTekst(v.dato);
      return "<li class='" + (vsIgang(v.dato, v.slot) ? "nu" : "") + "'><span><b>" + (v.dato === idag ? "I dag" : VS_DAGE[(d.getDay() + 6) % 7] + " " + vsKort(d)) + "</b><small>" +
        VS_TIDER[v.slot] + " · " + vsKatInfo(v.rolle)[1] + " " + rens(vsKatInfo(v.rolle)[2]) + "</small></span>" +
        (vsIgang(v.dato, v.slot) ? "<em>🟢 Nu</em>" : "") +
        (vsSygId === String(v.id) ? "" : "<button type='button' class='vs-syg-knap' data-vs-syg='" + rens(String(v.id)) + "' title='Meld dig syg til vagten'>🤒 Meld syg</button>") + "</li>" +
        (vsSygId === String(v.id) ? "<li class='vs-syg-form'><label>🤒 Meld dig syg til " + vsNaarTekst(v).toLowerCase() + " " + VS_TIDER[v.slot] +
          "<input id='vs-syg-grund' type='text' maxlength='200' placeholder='Hvad er der galt? (kan springes over)'></label>" +
          "<span class='vs-syg-knapper'><button type='button' class='vs-syg-send' data-vs-syg-send='" + rens(String(v.id)) + "'>📱 Send til ejeren</button>" +
          "<button type='button' class='vs-syg-fortryd'>Fortryd</button></span></li>" : "");
    }).join("") + "</ul>" : "<p class='vs-lille'>Du har ingen vagter endnu." + (vsMinKat() ? " Tryk <b>+ Skriv dig på</b> i skemaet." : "") + "</p>") + "</section>";
  // mine sygemeldinger, og ejeren ser alle
  const syge = vsSygeVagter(!vsErEjer());
  if (syge.length) html += "<section class='vs-boks vs-syge'><h4>🤒 " + (vsErEjer() ? "Sygemeldinger" : "Du er meldt syg") + "</h4><ul>" + syge.slice(0, 8).map(function (v) {
    const mig = v.navn.toLowerCase() === vsMig().toLowerCase();
    return "<li><span><b>" + (vsErEjer() ? rens(v.navn) + " · " : "") + vsNaarTekst(v) + "</b><small>" + VS_TIDER[v.slot] + " · " + vsKatInfo(v.rolle)[1] + " " + rens(vsKatInfo(v.rolle)[2]) +
      (v.grund ? "<br>💬 " + rens(v.grund) : "") + "</small></span>" +
      (mig || vsErEjer() ? "<button type='button' class='vs-rask' data-vs-rask='" + rens(String(v.id)) + "' title='" + (mig ? "Jeg kan alligevel" : "Sæt på vagten igen") + "'>💪 Rask</button>" : "") + "</li>";
  }).join("") + "</ul></section>";
  html += "<section class='vs-boks vs-info'><h4>ℹ️ Information</h4><ul class='vs-punkter'>" +
    "<li>Vælg en ledig vagt ved at trykke på <b>+ Skriv dig på</b>.</li><li>Du kan altid fjerne din vagt igen med ✕.</li>" +
    "<li>Er du syg? Tryk <b>🤒 Meld syg</b> under Dine vagter, så får ejeren besked på sin telefon.</li>" +
    "<li>Husk at møde til tiden og følge hotellets regler.</li></ul></section>";
  html += "</aside></div>";
  sek.innerHTML = html;

  // knapperne
  sek.querySelectorAll("[data-vs-kat]").forEach(function (k) {
    k.addEventListener("click", function () { vsKat = k.dataset.vsKat; vsVaelgNavn = null; visFane(); });
  });
  sek.querySelectorAll("[data-vs-uge]").forEach(function (k) {
    k.addEventListener("click", function () {
      const t = +k.dataset.vsUge;
      vsUge = t === 0 ? 0 : Math.max(-4, Math.min(12, vsUge + t));
      vsVaelgNavn = null; vsHent(); visFane();
    });
  });
  sek.querySelectorAll("[data-vs-vis]").forEach(function (k) {
    k.addEventListener("click", function () { vsVisning = k.dataset.vsVis; visFane(); });
  });
  sek.querySelectorAll(".vs-paa").forEach(function (k) {
    k.addEventListener("click", function () {
      const rolle = k.dataset.vsRolle || kat;
      if (vsErEjer() && !k.dataset.vsRolle) { vsVaelgNavn = k.dataset.vsDato + "|" + k.dataset.vsSlot; visFane(); return; }
      vsSkriv(k.dataset.vsDato, +k.dataset.vsSlot, rolle);
    });
  });
  sek.querySelectorAll(".vs-vaelg").forEach(function (s) {
    s.focus();
    s.addEventListener("change", function () {
      vsVaelgNavn = null;
      if (s.value) vsSkriv(s.dataset.vsDato, +s.dataset.vsSlot, kat, s.value);
      s.blur(); visFane();
    });
    s.addEventListener("blur", function () { setTimeout(function () { if (vsVaelgNavn) { vsVaelgNavn = null; visFane(); } }, 200); });
  });
  sek.querySelectorAll("[data-vs-syg]").forEach(function (k) {
    k.addEventListener("click", function () { vsSygId = k.dataset.vsSyg; visFane(); const f = document.getElementById("vs-syg-grund"); if (f) f.focus(); });
  });
  sek.querySelectorAll(".vs-syg-fortryd").forEach(function (k) {
    k.addEventListener("click", function () { vsSygId = null; visFane(); });
  });
  function sendSyg(id) {
    const f = document.getElementById("vs-syg-grund");
    const grund = f ? f.value.trim() : "";
    vsSygId = null;
    if (f) f.blur();
    vsSyg(id, grund, true);
    visFane();
  }
  sek.querySelectorAll("[data-vs-syg-send]").forEach(function (k) {
    k.addEventListener("click", function () { sendSyg(k.dataset.vsSygSend); });
  });
  const sygFelt = document.getElementById("vs-syg-grund");
  if (sygFelt) sygFelt.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); sendSyg(vsSygId); }
    if (e.key === "Escape") { e.stopPropagation(); vsSygId = null; visFane(); }
  });
  sek.querySelectorAll("[data-vs-rask]").forEach(function (k) {
    k.addEventListener("click", function () { vsSyg(k.dataset.vsRask, "", false); });
  });
  sek.querySelectorAll("[data-vs-slet]").forEach(function (k) {
    k.addEventListener("click", function () {
      if (!k.classList.contains("sikker")) {
        k.classList.add("sikker"); k.textContent = "Fjern?";
        setTimeout(function () { if (k.isConnected) { k.classList.remove("sikker"); k.textContent = "✕"; } }, 3000);
        return;
      }
      vsSlet(k.dataset.vsSlet);
    });
  });
}


// -------------------------------------------------------------
//  📅 Knappen ude i hotellet (kun ansatte og ejeren)
// -------------------------------------------------------------
const vsKnap = document.createElement("button");
vsKnap.id = "vagt-knap";
vsKnap.type = "button";
vsKnap.hidden = true;
vsKnap.style.top = "168px";
document.body.appendChild(vsKnap);
vsKnap.addEventListener("click", function () {
  ejerVindue.hidden = false;
  ejerFane = "vagtskema";
  vsUge = 0;
  vsHent();
  visFane();
});
function vsOpdaterKnap() {
  const vis = vsMaaSe();
  vsKnap.hidden = !vis;
  if (!vis) return;
  const naeste = vsMineVagter()[0];
  let tekst = "📅 Vagtskema", titel = "Åbn vagtskemaet";
  if (naeste) {
    const d = vsFraTekst(naeste.dato);
    const naar = naeste.dato === vsIdag() ? "i dag" : VS_DAGE[(d.getDay() + 6) % 7].toLowerCase();
    const tid = VS_TIDER[naeste.slot].replace(/:00/g, "").replace(" – ", "–");
    if (vsIgang(naeste.dato, naeste.slot)) { tekst = "🟢 Vagt nu " + tid; titel = "Din vagt er i gang (" + vsKatInfo(naeste.rolle)[2] + ")"; }
    else { tekst = "📅 Vagt " + naar + " " + tid; titel = "Din næste vagt: " + VS_DAGE_LANG[(d.getDay() + 6) % 7] + " " + vsKort(d) + " kl. " + VS_TIDER[naeste.slot] + " (" + vsKatInfo(naeste.rolle)[2] + ")"; }
  }
  vsKnap.classList.toggle("nu", !!(naeste && vsIgang(naeste.dato, naeste.slot)));
  if (vsKnap.textContent !== tekst) vsKnap.textContent = tekst;
  vsKnap.title = titel;
  // står ved siden af Tilkald hjælp, hvis den knap er der
  // står under Tilkald hjælp og Påmindelser i venstre side
  let bund = 0;
  ["hjaelp-knap", "paamind-fane", "online-tal"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && !el.hidden && el.getClientRects().length) bund = Math.max(bund, el.getBoundingClientRect().bottom);
  });
  vsKnap.style.top = Math.round(bund ? bund + 8 : 92) + "px";
}
setInterval(vsOpdaterKnap, 1000);
vsOpdaterKnap();


// -------------------------------------------------------------
//  Udseende: træ, guld og creme papir
// -------------------------------------------------------------
(function () {
  const st = document.createElement("style");
  st.id = "vagtskema-stil";
  // !important og ekstra id, så de realistiske træ-knapper ikke tegner ovenpå
  st.textContent = (
  "#vagt-knap { position: fixed; left: 12px; z-index: 5; padding: 6px 12px; border: 2px solid #6b4520; border-radius: 12px;" +
  "  background: linear-gradient(#fbe7a8, #e0b453); color: #4a2a10; font: bold 12px Verdana, sans-serif; cursor: pointer;" +
  "  box-shadow: 0 2px 0 #6b4520, 0 3px 8px rgba(0,0,0,.3); white-space: nowrap; }" +
  "#vagt-knap:hover { transform: translateY(-1px); }" +
  "#vagt-knap[hidden] { display: none; }" +
  "#vagt-knap.nu { background: linear-gradient(#d9f2c4, #9fd27c); border-color: #3f6b2a; box-shadow: 0 2px 0 #3f6b2a, 0 3px 8px rgba(0,0,0,.3); color: #1f3a12; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-fane { color: #3b2614; font-family: Verdana, sans-serif; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-hoved { display: flex; align-items: center; justify-content: center; margin: 0 0 10px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-titel { display: flex; align-items: center; gap: 12px; padding: 8px 22px; border: 3px solid #c99a3c; border-radius: 16px;" +
  "  background: linear-gradient(#6e4524, #4a2c14); color: #fff3d6; box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 3px 8px rgba(0,0,0,.35); }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-titel h3 { margin: 0; font-size: 24px; color: #ffe8a8; text-shadow: 0 2px 0 #2a170a; border: 0; padding: 0; background: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-titel p { margin: 2px 0 0; font-size: 12px; color: #f6e2b8; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-ikon { font-size: 30px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-advarsel { margin: 0 0 10px; padding: 8px 12px; background: #fff1d6; border: 2px solid #e0a43c; border-radius: 10px; font-size: 12px; color: #6b3d0a; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-kat { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-kat button { padding: 6px 11px; border: 2px solid #8a5a2b; border-radius: 20px; background: #fbf1dc; color: #4a2a10;" +
  "  font: bold 12px Verdana, sans-serif; cursor: pointer; box-shadow: 0 2px 0 #8a5a2b; width: auto; margin: 0; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-kat button.min { border-color: #c99a3c; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-kat button.valgt { background: linear-gradient(#ffd977, #e7a92f); border-color: #8a5a10; color: #3b2000; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-kat small { display: inline-block; min-width: 16px; margin-left: 3px; padding: 0 5px; border-radius: 8px; background: #6e4524; color: #fff; font-size: 10px; line-height: 16px; text-align: center; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-krop { display: flex; gap: 12px; align-items: flex-start; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-venstre { flex: 1 1 auto; min-width: 0; padding: 10px; border: 3px solid #8a5a2b; border-radius: 14px; background: #f7ead0;" +
  "  box-shadow: inset 0 0 0 2px #fff6e2, 0 3px 8px rgba(0,0,0,.25); }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-hoejre { flex: 0 0 230px; display: flex; flex-direction: column; gap: 10px; }" +
  "#ejer-vindue:not(.stor) #ejer-indhold#ejer-indhold .vs-krop { flex-direction: column; }" +
  "#ejer-vindue:not(.stor) #ejer-indhold#ejer-indhold .vs-hoejre { flex: 1 1 auto; width: 100%; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-bjaelke { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 8px; margin: 0 0 8px; border-radius: 10px;" +
  "  background: linear-gradient(#6e4524, #4a2c14); }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-bjaelke button { width: auto; margin: 0; cursor: pointer; font: bold 12px Verdana, sans-serif; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-bjaelke .vs-pil { width: 34px; height: 34px; padding: 0; border-radius: 50%; border: 2px solid #c99a3c; background: #fbf1dc; color: #4a2a10; font-size: 20px; line-height: 28px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-uge { min-width: 130px; padding: 3px 12px; border-radius: 10px; background: #fbf1dc; text-align: center; color: #3b2614; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-uge b { display: block; font-size: 16px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-uge small { font-size: 11px; color: #6e4524; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-idag-knap { padding: 5px 10px; border-radius: 10px; border: 2px solid #c99a3c; background: #fbf1dc; color: #4a2a10; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-plads { flex: 1; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-vis { padding: 6px 12px; border-radius: 12px; border: 2px solid #c99a3c; background: #fbf1dc; color: #4a2a10; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-vis.valgt { background: linear-gradient(#ffd977, #e7a92f); color: #3b2000; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-katnavn { margin: 0 0 6px; font-size: 12px; color: #6e4524; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter-rulle { overflow-x: auto; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 3px; table-layout: fixed; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter thead th { padding: 5px 2px; border-radius: 8px; background: #5a3a1e; color: #ffe8a8; font-size: 13px; text-align: center; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter thead th small { display: block; font-size: 10px; font-weight: normal; color: #f1d9a8; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter thead th.idag { background: linear-gradient(#e7a92f, #b87a14); color: #fff; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter th.vs-tid { width: 92px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter tbody th.vs-tid { padding: 4px; border-radius: 8px; background: #ead3a8; color: #3b2614; font-size: 11px; white-space: nowrap; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter td { height: 46px; padding: 3px; border-radius: 8px; background: #fffaf0; border: 1px solid #e3c999; vertical-align: middle; text-align: center; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter td.idag { background: #fff3cf; border-color: #e0b453; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter td.nu { box-shadow: inset 0 0 0 2px #6fb34a; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-gitter td.slut { background: #efe6d4; opacity: .7; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn { display: inline-flex; align-items: center; gap: 3px; max-width: 100%; margin: 1px; padding: 2px 6px; border-radius: 10px;" +
  "  background: #f1dfbd; border: 1px solid #b98d4f; font-size: 11px; color: #3b2614; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn i { font-style: normal; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn.syg { background: #fde3df; border-color: #d48a80; color: #8a2a1a; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn.syg b { text-decoration: line-through; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks .vs-syg-knap, #ejer-vindue #ejer-indhold#ejer-indhold .vs-boks .vs-rask { width: auto; margin: 0; padding: 3px 7px; border: 1px solid #b5574b; border-radius: 9px; background: #fff0ed; color: #8a2a1a; font: bold 10px Verdana, sans-serif; cursor: pointer; box-shadow: none; text-shadow: none; white-space: nowrap; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks .vs-rask { border-color: #4f8a3a; background: #eaf6e2; color: #2f6b1c; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li.vs-syg-form { display: block; padding: 6px; margin: 0 0 6px; border: 2px solid #e0a9a0; border-radius: 10px; background: #fff6f4; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-form label { display: block; font-size: 11px; font-weight: bold; color: #8a2a1a; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-form input { display: block; width: 100%; box-sizing: border-box; margin: 4px 0 6px; padding: 5px; font-size: 12px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-knapper { display: flex; gap: 6px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-knapper button { width: auto; margin: 0; padding: 4px 8px; border-radius: 9px; font: bold 11px Verdana, sans-serif; cursor: pointer; box-shadow: none; text-shadow: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-knapper .vs-syg-send { border: 2px solid #8a2a1a; background: linear-gradient(#ff8f80, #d9534f); color: #fff; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syg-knapper .vs-syg-fortryd { border: 1px solid #b98d4f; background: #fbf1dc; color: #4a2a10; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-syge h4 { background: linear-gradient(#a8443a, #7a2a20); }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-navn.mig { background: linear-gradient(#ffe39a, #f1c25a); border-color: #a2731c; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-fjern { width: auto; margin: 0 0 0 2px; padding: 0 4px; border: 0; border-radius: 6px; background: transparent; color: #8a2a1a; font-size: 10px; line-height: 14px; cursor: pointer; box-shadow: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-fjern.sikker { background: #d9534f; color: #fff; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-paa { width: auto; margin: 1px 0; padding: 3px 7px; border: 1px dashed #b98d4f; border-radius: 8px; background: #fbf1dc; color: #6e4524;" +
  "  font: bold 10px Verdana, sans-serif; cursor: pointer; box-shadow: none; white-space: nowrap; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-paa:hover { background: #ffe39a; border-style: solid; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-vaelg { width: 100%; font-size: 11px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-tom { color: #b39a76; font-size: 10px; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste section { margin: 0 0 8px; padding: 6px 10px; border-radius: 10px; background: #fffaf0; border: 1px solid #e3c999; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste section.idag { background: #fff3cf; border-color: #e0b453; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste h4 { margin: 0 0 4px; text-transform: capitalize; color: #5a3a1e; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste ul { margin: 0; padding: 0; list-style: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste li { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 3px 0; border: 0; background: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-liste-tid { min-width: 100px; font-size: 11px; font-weight: bold; color: #6e4524; }" +

  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks { padding: 0 0 8px; border: 3px solid #8a5a2b; border-radius: 14px; background: #f7ead0; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,.25); }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks h4 { margin: 0 0 6px; padding: 7px 10px; background: linear-gradient(#6e4524, #4a2c14); color: #ffe8a8; font-size: 14px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks h4 small { font-size: 11px; color: #f1d9a8; font-weight: normal; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks ul { margin: 0; padding: 0 8px; list-style: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 5px 2px; border: 0; border-bottom: 1px solid #e3c999; background: none; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li:last-child { border-bottom: 0; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li span b { display: block; font-size: 12px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li span small { font-size: 11px; color: #6e4524; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li.nu { background: #e3f4d4; border-radius: 6px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks li em { font-style: normal; font-size: 11px; color: #2f6b1c; font-weight: bold; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks .vs-paa { padding: 4px 8px; border: 2px solid #8a5a10; border-radius: 10px; background: linear-gradient(#ffd977, #e7a92f); color: #3b2000; font-size: 11px; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-lille { margin: 2px 10px 4px; font-size: 11px; color: #5a3a1e; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks ul.vs-punkter { padding: 0 10px 0 24px; list-style: disc; }" +
  "#ejer-vindue #ejer-indhold#ejer-indhold .vs-boks ul.vs-punkter li { display: list-item; padding: 2px 0; border: 0; font-size: 11px; }").replace(/;(?=\s+[a-z\-]+:|\s*})/g, " !important;");
  document.head.appendChild(st);
})();
