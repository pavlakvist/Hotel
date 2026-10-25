// =============================================================
//  Lejlighederne 🏢
//  Dit eget værelse (det første rum, du får) er din lejlighed med et husnummer.
//  Du vælger selv sal (2.–11. sal, altså 10 etager) og dør (1–10). Husnummeret er sal + dør,
//  fx 304 = 3. sal, dør 4. To kan ikke have det samme.
//  På hver sal er der en gang med døre og navneskilte. Klik på en dør for at gå ind
//  (låst = kun ejeren, kode = man skal kende koden). I lejligheden fører døren ud til gangen,
//  og i gangen er der en elevator. Dine andre rum er almindelige rum uden husnummer.
//  Kræver database-16-lejligheder.sql.
// =============================================================
const LEJ_SALE = Array.from({ length: 10 }, function (_, i) { return i + 2; });   // 2. til 11. sal
const LEJ_DOERE = 10;
const LEJ_GANG_FARVER = [
  ["#3f5f4a", "#b4473d", "#a33f36"], ["#3f4d72", "#d8b47a", "#c9a46c"], ["#7d62a8", "#e9e6e1", "#d6d2cb"],
  ["#8a5a3b", "#b4473d", "#a33f36"], ["#4f7698", "#ecd7a6", "#e0c992"], ["#2c2b33", "#b4473d", "#a33f36"],
];

let lejligheder = [];          // [{ id, ejer, navn, sal, nr, adgang, data }] fra serveren
let lejHentet = false;
const lejFremmede = {};        // andres lejligheder, man har været inde i: id → info
let lejSendtData = "";
let lejVaelgerVist = false;

function hjemId() { return "hjem-" + String(FIGUR.navn || "").toLowerCase(); }
function minLej() { return lejligheder.find(function (l) { return l.id === hjemId(); }) || null; }
function husnummer(l) { return l.sal * 100 + l.nr; }
function lejPaa(sal, nr) { return lejligheder.find(function (l) { return l.sal === sal && l.nr === nr; }) || null; }
function erGang(id) { return /^gang\d+$/.test(id || ""); }
function gangSal(id) { return parseInt(String(id).slice(4), 10); }
function erHotelEjerLej() { return typeof EJERE !== "undefined" && EJERE.indexOf(FIGUR.navn) >= 0; }

// Andres lejligheder bruges som rum (velkomsthal.js spørger lejInfo, når den ikke kender et rum)
function lejInfo(id) {
  if (!/^hjem-/.test(id || "") || id === hjemId()) return null;
  return lejFremmede[id] || null;
}
// Er jeg inde i en andens lejlighed?
function iFremmedLej() { return rumValg === "vaerelse" && !!lejInfo(aktivtVaerelse); }


// -------------------------------------------------------------
//  Gangene på 2.–7. sal (fælles rum med elevator, ligesom event-rummene)
// -------------------------------------------------------------
// Alle lejlighederne er samlet under én etage-knap 🏢 i elevatoren og navigatøren.
// Kun sale, hvor der bor nogen (og din egen), bliver vist.
const gammelSal2 = ETAGER.findIndex(function (e) { return e.id === "sal2"; });
const lejEtage = { id: "lej", navn: "Lejlighederne", ikon: "🏢" };
if (gammelSal2 >= 0) ETAGER.splice(gammelSal2, 1, lejEtage); else ETAGER.splice(2, 0, lejEtage);
LEJ_SALE.forEach(function (s) {
  const f = LEJ_GANG_FARVER[s % LEJ_GANG_FARVER.length];
  INDBYGGEDE_RUM["gang" + s] = { id: "gang" + s, navn: "Lejlighederne " + s + ". sal", ejer: EJER_NAVNE[0],
    bredde: LEJ_DOERE * 2 + 2, dybde: 5, vaeg: f[0], gulv1: f[1], gulv2: f[2], vaegHoejde: 150, doer: null, gang: s };
});
function opdaterGange() {
  for (let i = NAV_RUM.length - 1; i >= 0; i--) if (NAV_RUM[i].gang) NAV_RUM.splice(i, 1);
  LEJ_SALE.forEach(function (s) {
    const beboere = lejligheder.filter(function (l) { return l.sal === s; }).length;
    const her = rumValg === "vaerelse" && aktivtVaerelse === "gang" + s;
    if (!beboere && !her) return;
    NAV_RUM.push({ id: "gang" + s, etage: "lej", navn: s + ". sal", gang: s,
      om: "Lejlighederne " + (s * 100 + 1) + "–" + (s * 100 + LEJ_DOERE) + " · " + beboere + (beboere === 1 ? " beboer" : " beboere"),
      billede: "billeder/rum/vaerelse.png", maks: 50, rum: "vaerelse", vaerelse: "gang" + s });
  });
}
opdaterGange();
// I hallen og gangene står dørene på bagvæggen: dør nr ligger ved feltet x = 2 · nr
function doerX(nr) { return nr * 2; }


// -------------------------------------------------------------
//  Hent lejlighederne fra serveren
// -------------------------------------------------------------
function hentLejligheder() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_lej_alle", { p_token: token }).then(function (svar) {
    lejligheder = svar || [];
    lejHentet = true;
    opdaterMitKort();
    opdaterGange();
    sendMinLejData(false);
    // første gang: vælg din lejlighed
    if (!minLej() && !lejVaelgerVist && !erGangEllerHal()) return;
    if (!minLej() && !lejVaelgerVist) { lejVaelgerVist = true; aabnLejVaelger(true); }
    if (!lejVindue.hidden) visLejVaelger();
  }).catch(function () {});     // database-16-lejligheder.sql er ikke kørt endnu
}
function erGangEllerHal() { return rumValg === "hal" || (rumValg === "vaerelse" && aktivtVaerelse === "mit"); }
hentLejligheder();
setInterval(hentLejligheder, 5000);


// -------------------------------------------------------------
//  Rum-id til serveren: alle i samme lejlighed ser hinanden
// -------------------------------------------------------------
const mitRumIdFoerLej = mitRumId;
mitRumId = function () {
  if (rumValg === "vaerelse" && aktivtVaerelse === "mit" && minLej()) return "lej:" + hjemId();
  if (rumValg === "vaerelse" && lejInfo(aktivtVaerelse)) return "lej:" + aktivtVaerelse;
  return mitRumIdFoerLej();
};
if (typeof navRumId === "function") {
  const navRumIdFoerLej = navRumId;
  navRumId = function (r) {
    if (r.vaerelse === "mit" && minLej()) return "lej:" + hjemId();
    return navRumIdFoerLej(r);
  };
}


// -------------------------------------------------------------
//  Min lejlighed: farver, størrelse, dør og møbler sendes til serveren
// -------------------------------------------------------------
// Døren ind til lejligheden: brug den fra :floor, ellers det første felt på venstre væg
function standardDoer(info) {
  if (info.doer) return info.doer;
  const form = info.felter ? feltForm(info.felter) : info.form ? lavForm(info.form, info.bredde, info.dybde) : null;
  const gulv = function (x, y) { return x >= 0 && y >= 0 && x < info.bredde && y < info.dybde && (!form || form(x, y)); };
  for (let y = 1; y < info.dybde; y++) for (let x = 0; x < info.bredde; x++) if (gulv(x, y)) return { x: x, y: y };
  return { x: 0, y: 0 };
}
if (!RUM_FARVER.doer) RUM_FARVER.doer = standardDoer(RUM_FARVER);

function minLejData() {
  const her = rumValg === "vaerelse" && aktivtVaerelse === "mit";
  const v = RUM_FARVER;
  return { bredde: v.bredde, dybde: v.dybde, felter: v.felter || null, form: v.form || null,
    vaeg: her ? RUM.vaegFarve : v.vaeg, gulv1: her ? RUM.gulvFarve1 : v.gulv1, gulv2: her ? RUM.gulvFarve2 : v.gulv2,
    vaegHoejde: v.vaegHoejde || null, doer: v.doer || standardDoer(v) };
}
function sendMinLejData(tving) {
  const l = minLej();
  if (!l) return;
  const data = minLejData();
  const tekst = stabil(data);
  if (!tving && (tekst === lejSendtData || tekst === stabil(l.data))) { lejSendtData = tekst; return; }
  lejSendtData = tekst;
  serverKald("hv_lej_gem", { p_token: mitToken(), p_id: hjemId(), p_navn: null, p_sal: null, p_nr: null, p_data: data, p_adgang: null, p_kode: null })
    .catch(function () { lejSendtData = ""; });
}
function mineLejMoebler() {
  const liste = rumValg === "vaerelse" && aktivtVaerelse === "mit" ? moeblerIRummet : mitVaerelse;
  return liste.map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: !!m.spejlet }; });
}
let lejMoebelTimer = null;
function sendMineMoebler() {
  if (!minLej()) return;
  clearTimeout(lejMoebelTimer);
  lejMoebelTimer = setTimeout(function () {
    serverKald("hv_lej_moebler_gem", { p_token: mitToken(), p_id: hjemId(), p_moebler: mineLejMoebler() }).catch(function () {});
  }, 500);
}
const gemFoerLej = gem;
gem = function () {
  if (iFremmedLej()) return;           // andres lejligheder gemmes ikke hos dig
  gemFoerLej();
  if (rumValg === "vaerelse" && aktivtVaerelse === "mit") { sendMineMoebler(); sendMinLejData(false); }
};


// -------------------------------------------------------------
//  🏠 Vælg din lejlighed (sal og dør)
// -------------------------------------------------------------
const lejVindue = document.createElement("div");
lejVindue.id = "lej-vindue";
lejVindue.hidden = true;
lejVindue.innerHTML = "<div class='lej-top'><b>🏠 Min lejlighed</b><button type='button' id='lej-luk' title='Luk'>✕</button></div><div id='lej-indhold'></div>";
document.body.appendChild(lejVindue);
if (typeof goerFlytbar === "function") goerFlytbar(lejVindue, lejVindue.querySelector(".lej-top"), "mit-hotel-flyt-lejlighed");
document.getElementById("lej-luk").addEventListener("click", function () { lejVindue.hidden = true; });

let lejValgtSal = 2;
let lejValgtNr = null;
let lejFoersteGang = false;

function aabnLejVaelger(foerste) {
  const l = minLej();
  lejFoersteGang = !!foerste;
  lejValgtSal = l ? l.sal : (LEJ_SALE.find(function (s) { return lejligheder.filter(function (x) { return x.sal === s; }).length < LEJ_DOERE; }) || 2);
  lejValgtNr = l ? l.nr : null;
  visLejVaelger();
  lejVindue.hidden = false;
  hentLejligheder();           // så de nyeste optagne døre er med
}

function visLejVaelger() {
  const l = minLej();
  const boks = document.getElementById("lej-indhold");
  if (!lejHentet) { boks.innerHTML = "<p class='lej-tom'>Lejlighederne virker, når database-16-lejligheder.sql er kørt i Supabase.</p>"; return; }
  const adgang = l ? l.adgang : "aaben";
  boks.innerHTML =
    (lejFoersteGang && !l ? "<p class='lej-velkommen'>✨ Velkommen! Dit værelse er din egen lejlighed i hotellet. Vælg hvilken sal du vil bo på, og hvilken dør der skal være din.</p>" : "") +
    (l ? "<p class='lej-nu'>Du bor i <b>nr. " + husnummer(l) + "</b> (" + l.sal + ". sal, dør " + l.nr + ").</p>" : "") +
    "<b class='lej-titel'>1. Vælg sal (10 etager)</b><div class='lej-sale'>" + LEJ_SALE.map(function (s) {
      const ledige = LEJ_DOERE - lejligheder.filter(function (x) { return x.sal === s && x.id !== hjemId(); }).length;
      return "<button type='button' data-lej-sal='" + s + "' class='" + (s === lejValgtSal ? "valgt" : "") + (ledige ? "" : " fuld") + "' title='" + ledige + " ledige'><b>" + s + ".</b><small>" + ledige + " ledige</small></button>";
    }).join("") + "</div>" +
    "<b class='lej-titel'>2. Vælg dør</b><div class='lej-doere'>" + Array.from({ length: LEJ_DOERE }, function (_, i) {
      const nr = i + 1, x = lejPaa(lejValgtSal, nr), mig = x && x.id === hjemId(), taget = x && !mig;
      return "<button type='button' data-lej-nr='" + nr + "' class='" + (taget ? "taget" : "") + (mig ? " mig" : "") + (nr === lejValgtNr && !taget ? " valgt" : "") + "'" +
        (taget ? " disabled title='Her bor " + rens(x.ejer) + "'" : "") + "><span>🚪</span><b>" + (lejValgtSal * 100 + nr) + "</b><small>" +
        (mig ? "Din" : taget ? rens(x.ejer) : "Ledig") + "</small></button>";
    }).join("") + "</div>" +
    "<b class='lej-titel'>3. Hvem må komme ind?</b>" +
    "<div class='lej-adgang'><select id='lej-adgang'>" + [["aaben", "🔓 Alle må komme ind"], ["laast", "🔒 Låst (kun mig)"], ["kode", "🔑 Med adgangskode"]].map(function (a) {
      return "<option value='" + a[0] + "'" + (a[0] === adgang ? " selected" : "") + ">" + a[1] + "</option>";
    }).join("") + "</select><input id='lej-kode' type='password' maxlength='30' placeholder='" + (l && l.adgang === "kode" ? "Ny kode (tom = behold den gamle)" : "Adgangskode") + "'" + (adgang === "kode" ? "" : " hidden") + "></div>" +
    "<p id='lej-fejl' class='lej-fejl'></p>" +
    "<div class='lej-knapper'>" + (l ? "<button type='button' id='lej-gaa'>🚪 Gå hjem</button>" : "") +
    "<button type='button' id='lej-gem' class='lej-gem'>" + (l ? "💾 Gem" : "🏠 Flyt ind") + "</button></div>";

  boks.querySelectorAll("[data-lej-sal]").forEach(function (k) {
    k.addEventListener("click", function () {
      lejValgtSal = +k.dataset.lejSal;
      if (!(l && l.sal === lejValgtSal)) lejValgtNr = null; else lejValgtNr = l.nr;
      visLejVaelger();
    });
  });
  boks.querySelectorAll("[data-lej-nr]").forEach(function (k) {
    k.addEventListener("click", function () { lejValgtNr = +k.dataset.lejNr; visLejVaelger(); });
  });
  const adgangValg = document.getElementById("lej-adgang");
  adgangValg.addEventListener("change", function () { document.getElementById("lej-kode").hidden = adgangValg.value !== "kode"; });
  const hjem = document.getElementById("lej-gaa");
  if (hjem) hjem.addEventListener("click", function () { lejVindue.hidden = true; gaaTilVaerelse("mit"); });
  document.getElementById("lej-gem").addEventListener("click", function () {
    const fejl = document.getElementById("lej-fejl");
    if (!lejValgtNr) { fejl.textContent = "Vælg en dør først."; return; }
    const ny = document.getElementById("lej-adgang").value;
    const kode = document.getElementById("lej-kode").value;
    if (ny === "kode" && kode.length < 3 && !(l && l.adgang === "kode")) { fejl.textContent = "Adgangskoden skal være mindst 3 tegn."; return; }
    if (kode && kode.length < 3) { fejl.textContent = "Adgangskoden skal være mindst 3 tegn."; return; }
    const flytter = !l || l.sal !== lejValgtSal || l.nr !== lejValgtNr;
    serverKald("hv_lej_gem", { p_token: mitToken(), p_id: hjemId(), p_navn: FIGUR.navn + "s lejlighed", p_sal: lejValgtSal, p_nr: lejValgtNr,
      p_data: minLejData(), p_adgang: ny, p_kode: ny === "kode" && kode ? kode : null }).then(function (svar) {
      const nr = svar.sal * 100 + svar.nr;
      lejVindue.hidden = true;
      besked.textContent = !l ? "🏠 Velkommen hjem! Du bor nu i nr. " + nr + " på " + svar.sal + ". sal." : flytter ? "🏠 Du er flyttet til nr. " + nr + "." : "🏠 Din lejlighed er gemt.";
      if (!l) sendMineMoebler();
      hentLejligheder();
      if (!l) setTimeout(sendMineMoebler, 800);
    }).catch(function (e) {
      fejl.textContent = /hv_lej/.test(e.message) ? "Lejlighederne virker, når database-16-lejligheder.sql er kørt." : e.message;
      hentLejligheder();
    });
  });
}

// I navigatøren (Mine rum) står husnummeret ved dit værelse, og der er en knap til at vælge/flytte
function opdaterMitKort() {
  const r = NAV_RUM.find(function (x) { return x.id === "mit"; });
  const l = minLej();
  if (r) r.om = l ? "Din lejlighed · 🏠 nr. " + husnummer(l) + " på " + l.sal + ". sal" : "Dit eget værelse";
}
const rumKortFoerLej = rumKort;
rumKort = function (r) {
  let html = rumKortFoerLej(r);
  if (r.id === "mit" && lejHentet) {
    html = html.replace("<div class='nav-hoejre'>", "<div class='nav-hoejre'><button type='button' class='nav-besoeg lej-nav-knap' data-lej-vaelg>" +
      (minLej() ? "🏠 Flyt / lås" : "🏠 Vælg husnummer") + "</button>");
  }
  return html;
};
navVindue.addEventListener("click", function (e) {
  if (e.target.closest && e.target.closest("[data-lej-vaelg]")) aabnLejVaelger(false);
});


// -------------------------------------------------------------
//  Tegn dørene i gangen
// -------------------------------------------------------------
let lejMus = null;
function iGang() { return rumValg === "vaerelse" && erGang(aktivtVaerelse); }
function gangDoerPoly(nr) {
  const a = punkt(doerX(nr), 0), b = punkt(doerX(nr) + 1, 0);
  const m = function (t, h) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - h }; };
  return { m: m, poly: [m(0.1, 0), m(0.9, 0), m(0.9, 92), m(0.1, 92)] };
}
function doerUnderMus() {
  if (!lejMus || !iGang()) return null;
  for (let nr = 1; nr <= LEJ_DOERE; nr++) if (iPolygon(lejMus, gangDoerPoly(nr).poly)) return nr;
  return null;
}
function skraaTekst(m, tekst, farve, str) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.transform(1, 0.5, 0, 1, 0, 0);
  ctx.font = "bold " + str + "px Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = farve;
  ctx.fillText(tekst, 0, 0);
  ctx.restore();
}
function tegnGangDoere() {
  const sal = gangSal(aktivtVaerelse), over = doerUnderMus();
  for (let nr = 1; nr <= LEJ_DOERE; nr++) {
    const l = lejPaa(sal, nr), d = gangDoerPoly(nr), m = d.m;
    const mig = l && l.id === hjemId();
    // karm og dør
    polygon(ctx, [m(0.04, 0), m(0.96, 0), m(0.96, 98), m(0.04, 98)], "#e0a73c");
    polygon(ctx, d.poly, over === nr ? (l ? "#8a5530" : "#a49a90") : (l ? "#6b3f1f" : "#8a8178"));
    polygon(ctx, [m(0.5, 0), m(0.53, 0), m(0.53, 92), m(0.5, 92)], "rgba(0,0,0,0.18)");
    const h = m(0.78, 44);
    ctx.beginPath(); ctx.arc(h.x, h.y, 2.4, 0, Math.PI * 2); ctx.fillStyle = "#f2b134"; ctx.fill();
    // husnummer-skilt over døren
    polygon(ctx, [m(0.14, 104), m(0.86, 104), m(0.86, 124), m(0.14, 124)], mig ? "#f7c65a" : "#3a1d0e");
    skraaTekst(m(0.5, 114), String(sal * 100 + nr), mig ? "#3a1d0e" : "#f7c65a", 11);
    // navneskilt på døren
    const navn = l ? l.ejer : "Ledig";
    if (l) {     // stort, tydeligt navneskilt, så alle i gangen kan se hvem der bor der
      polygon(ctx, [m(-0.14, 56), m(1.14, 56), m(1.14, 80), m(-0.14, 80)], "#3a1d0e");
      polygon(ctx, [m(-0.1, 58), m(1.1, 58), m(1.1, 78), m(-0.1, 78)], "#fbf6ea");
      const kort = navn.length > 12 ? navn.slice(0, 11) + "…" : navn;
      skraaTekst(m(0.5, 68), kort, "#3a1d0e", kort.length <= 6 ? 12 : kort.length <= 9 ? 9 : 7);
    } else {
      polygon(ctx, [m(0.18, 62), m(0.82, 62), m(0.82, 76), m(0.18, 76)], "rgba(255,255,255,0.5)");
      skraaTekst(m(0.5, 69), navn, "#5a5048", 8);
    }
    if (l && l.adgang !== "aaben") skraaTekst(m(0.5, 84), l.adgang === "laast" ? "🔒" : "🔑", "#fff", 10);
  }
  if (over) {
    const l = lejPaa(sal, over), m = gangDoerPoly(over).m(0.5, 135);
    const t = l ? (l.id === hjemId() ? "Hjem til dig" : l.ejer + "s lejlighed" + (l.adgang === "laast" ? " 🔒" : l.adgang === "kode" ? " 🔑" : "")) : "Nr. " + (sal * 100 + over) + " er ledig";
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    const w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(m.x - w / 2, m.y - 16, w, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(t, m.x, m.y - 2);
  }
}
const tegnVaeggeFoerLej = tegnVaegge;
tegnVaegge = function () {
  tegnVaeggeFoerLej();
  if (iGang()) tegnGangDoere();
};

laerred.addEventListener("mousemove", function (e) {
  const r = laerred.getBoundingClientRect();
  lejMus = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (doerUnderMus() || lejDoerUnderMus()) laerred.style.cursor = "pointer";
});
laerred.addEventListener("mouseleave", function () { lejMus = null; });


// -------------------------------------------------------------
//  Gå ind ad en dør i gangen
// -------------------------------------------------------------
let lejVenter = null;     // { ind: lejlighed } eller { ud: true }
laerred.addEventListener("click", function (e) {
  if (!iGang()) return;
  const nr = doerUnderMus();
  if (!nr) {
    // man kan ikke stille møbler foran dørene
    const f = musTilFelt(e);
    if (valgtType && f.y === 0 && f.x % 2 === 0 && f.x >= 2 && f.x <= doerX(LEJ_DOERE)) {
      e.stopImmediatePropagation();
      besked.textContent = "🚪 Der skal være plads foran dørene.";
    }
    return;
  }
  e.stopImmediatePropagation();
  const sal = gangSal(aktivtVaerelse), l = lejPaa(sal, nr);
  if (!l) {
    if (!minLej()) { lejValgtSal = sal; lejValgtNr = nr; lejFoersteGang = false; visLejVaelger(); lejVindue.hidden = false; }
    else besked.textContent = "🚪 Nr. " + (sal * 100 + nr) + " er ledig.";
    return;
  }
  gaaTil(doerX(nr), 0);
  lejVenter = { ind: l, tid: Date.now() };
}, true);

setInterval(function () {
  if (!lejVenter) return;
  const her = figurFelt();
  if (lejVenter.ind) {
    if (!iGang()) { lejVenter = null; return; }
    const x = doerX(lejVenter.ind.nr);
    const fremme = her.x === x && her.y === 0;
    if (fremme || (!figur.rute.length && Date.now() - lejVenter.tid > 500 && Math.abs(her.x - x) + her.y <= 1) || Date.now() - lejVenter.tid > 15000) {
      const l = lejVenter.ind;
      lejVenter = null;
      if (fremme || Math.abs(her.x - x) + her.y <= 1) gaaIndLej(l);
    }
  } else if (lejVenter.ud) {
    const d = RUM.doer;
    if (!d || rumValg !== "vaerelse") { lejVenter = null; return; }
    const fremme = her.x === d.x && her.y === d.y;
    if (fremme || (!figur.rute.length && Date.now() - lejVenter.tid > 500) || Date.now() - lejVenter.tid > 15000) {
      const l = lejVenter.ud;
      lejVenter = null;
      if (fremme || Math.abs(her.x - d.x) + Math.abs(her.y - d.y) <= 1) udIGangen(l);
    }
  }
}, 150);

function gaaIndLej(l) {
  if (l.id === hjemId()) { gaaTilVaerelse("mit"); besked.textContent = "🏠 Velkommen hjem!"; return; }
  if (l.adgang === "laast" && !erHotelEjerLej()) { besked.textContent = "🔒 " + l.ejer + "s lejlighed er låst."; return; }
  if (l.adgang === "kode" && !erHotelEjerLej()) { spoergKode(l); return; }
  gaaIndFremmed(l);
}
function gaaIndFremmed(l) {
  serverKald("hv_lej_hent", { p_token: mitToken(), p_id: l.id }).then(function (svar) {
    if (!svar) { besked.textContent = "Lejligheden findes ikke længere."; return; }
    const d = svar.data || {};
    const info = lejFremmede[l.id] || {};
    Object.keys(info).forEach(function (k) { delete info[k]; });
    Object.assign(info, { id: svar.id, navn: svar.ejer + "s lejlighed", ejer: svar.ejer, sal: svar.sal, nr: svar.nr,
      bredde: d.bredde || 8, dybde: d.dybde || 8, felter: d.felter || null, form: d.form || null,
      vaeg: d.vaeg || "#86b3dd", gulv1: d.gulv1 || "#d8b47a", gulv2: d.gulv2 || "#c9a46c", vaegHoejde: d.vaegHoejde || null });
    info.doer = d.doer || standardDoer(info);
    lejFremmede[l.id] = info;
    andreVaerelser[l.id] = (svar.moebler || []).filter(function (m) { return MOEBEL_TYPER[m.type]; })
      .map(function (m) { return { type: m.type, x: m.x, y: m.y, spejlet: !!m.spejlet }; });
    lejMoeblerSidst = stabil(svar.moebler || []);
    gaaTilVaerelse(l.id);
    besked.textContent = "🚪 Du er på besøg hos " + svar.ejer + " (nr. " + (svar.sal * 100 + svar.nr) + ").";
  }).catch(function (e) { besked.textContent = e.message; });
}

// Adgangskode til en lejlighed
const kodeBoks = document.createElement("div");
kodeBoks.id = "lej-kode-boks";
kodeBoks.hidden = true;
kodeBoks.innerHTML = "<b id='lk-titel'></b><input id='lk-kode' type='password' maxlength='30' placeholder='Adgangskode'>" +
  "<div><button type='button' id='lk-ind'>Gå ind</button><button type='button' id='lk-luk'>Annuller</button></div><small id='lk-fejl'></small>";
document.body.appendChild(kodeBoks);
let kodeLej = null;
function spoergKode(l) {
  kodeLej = l;
  document.getElementById("lk-titel").textContent = "🔑 Skriv koden til nr. " + husnummer(l);
  document.getElementById("lk-kode").value = "";
  document.getElementById("lk-fejl").textContent = "";
  kodeBoks.hidden = false;
  document.getElementById("lk-kode").focus();
}
function proevKode() {
  const l = kodeLej;
  if (!l) return;
  serverKald("hv_lej_kode", { p_token: mitToken(), p_id: l.id, p_kode: document.getElementById("lk-kode").value }).then(function (ok) {
    if (!ok) { document.getElementById("lk-fejl").textContent = "Forkert kode"; return; }
    kodeBoks.hidden = true;
    kodeLej = null;
    gaaIndFremmed(l);
  }).catch(function (e) { document.getElementById("lk-fejl").textContent = e.message; });
}
document.getElementById("lk-ind").addEventListener("click", proevKode);
document.getElementById("lk-kode").addEventListener("keydown", function (e) { if (e.key === "Enter") proevKode(); if (e.key === "Escape") kodeBoks.hidden = true; });
document.getElementById("lk-luk").addEventListener("click", function () { kodeBoks.hidden = true; kodeLej = null; });


// -------------------------------------------------------------
//  Døren i lejligheden fører ud til gangen
// -------------------------------------------------------------
function denneLej() {
  if (rumValg !== "vaerelse") return null;
  if (aktivtVaerelse === "mit") return minLej();
  const info = lejInfo(aktivtVaerelse);
  return info ? lejligheder.find(function (l) { return l.id === aktivtVaerelse; }) || { id: info.id, sal: info.sal, nr: info.nr, ejer: info.ejer } : null;
}
function lejDoerUnderMus() {
  const d = RUM.doer;
  if (!lejMus || !d || !denneLej() || !erIRummet(d.x, d.y)) return false;
  let venstreVaeg = true;
  for (let x = 0; x < d.x; x++) if (erIRummet(x, d.y)) venstreVaeg = false;
  const a = venstreVaeg ? punkt(d.x, d.y + 1) : punkt(d.x, d.y);
  const b = venstreVaeg ? punkt(d.x, d.y) : punkt(d.x + 1, d.y);
  const m = function (t, h) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - h }; };
  const dh = Math.min(78, (RUM.vaegHoejde || VAEG_HOEJDE) - 12) + 6;
  return iPolygon(lejMus, [m(0.12, 0), m(0.88, 0), m(0.88, dh), m(0.12, dh)]);
}
laerred.addEventListener("click", function (e) {
  if (!lejDoerUnderMus()) return;
  e.stopImmediatePropagation();
  const l = denneLej(), d = RUM.doer;
  gaaTil(d.x, d.y);
  lejVenter = { ud: l, tid: Date.now() };
  besked.textContent = "🚪 Du går ud i gangen …";
}, true);
// skilt over døren inde i lejligheden
const tegnDoerFoerLej = tegnDoer;
tegnDoer = function () {
  tegnDoerFoerLej();
  const l = denneLej(), d = RUM.doer;
  if (!l || !d || !erIRummet(d.x, d.y)) return;
  if (lejDoerUnderMus()) {
    const p = punkt(d.x + 0.5, d.y + 0.5);
    const t = "Ud i gangen (" + l.sal + ". sal)";
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    const w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(p.x - w / 2, p.y - 120, w, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(t, p.x, p.y - 106);
  }
};
// Man kommer ind et skridt fra døren, så man ikke står foran den
const skiftRumFoerLej = skiftRum;
skiftRum = function (navn) {
  skiftRumFoerLej(navn);
  const d = RUM.doer;
  if (!denneLej() || !d || figur.x !== d.x || figur.y !== d.y) return;
  const nabo = [[1, 0], [0, 1], [1, 1], [0, -1]].map(function (n) { return { x: d.x + n[0], y: d.y + n[1] }; })
    .find(function (f) { return kanGaa(f.x, f.y); });
  if (nabo) { figur.x = nabo.x; figur.y = nabo.y; figur.retning = "ned-hoejre"; }
};
function udIGangen(l) {
  gaaTilVaerelse("gang" + l.sal);
  figur.x = doerX(l.nr);
  figur.y = 2;
  figur.rute = [];
  figur.retning = "ned-hoejre";
  besked.textContent = "🚪 Du står på gangen på " + l.sal + ". sal, uden for nr. " + husnummer(l) + ".";
}


// -------------------------------------------------------------
//  På besøg: møblerne følger med, men man kan ikke ændre noget
// -------------------------------------------------------------
let lejMoeblerSidst = "";
setInterval(function () {
  if (!iFremmedLej()) return;
  const id = aktivtVaerelse;
  serverKald("hv_lej_hent", { p_token: mitToken(), p_id: id }).then(function (svar) {
    if (!svar || aktivtVaerelse !== id) return;
    const s = stabil(svar.moebler || []);
    if (s === lejMoeblerSidst) return;
    lejMoeblerSidst = s;
    if (typeof brugMoebler === "function") brugMoebler(id, svar.moebler || []);
    // er man blevet låst ude, går man ud i gangen
    if (svar.adgang === "laast" && !erHotelEjerLej()) { udIGangen(svar); besked.textContent = "🔒 " + svar.ejer + " har låst lejligheden."; }
  }).catch(function () {});
}, 3000);

["samlOpValgt", "drejValgt"].forEach(function (navn) {
  const foer = window[navn];
  window[navn] = function () {
    if (iFremmedLej()) { setTimeout(function () { besked.textContent = "Det er ikke dit rum, så du kan ikke ændre møblerne."; }, 0); return; }
    return foer.apply(this, arguments);
  };
});
const tilLagerFoerLej = tilLager;
tilLager = function (type) { if (iFremmedLej()) return; tilLagerFoerLej(type); };
// "Sæt i mit værelse" fra Mine ting: gå hjem først
document.getElementById("lager-saet").addEventListener("click", function () { if (iFremmedLej()) gaaTilVaerelse("mit"); }, true);
// placér/flyt ikke møbler hos andre
laerred.addEventListener("click", function (e) {
  if (!iFremmedLej()) return;
  if (valgtType || (typeof flytter !== "undefined" && flytter)) { e.stopImmediatePropagation(); valgtType = null; if (typeof flytter !== "undefined") flytter = null; opdaterPanel(); }
}, true);
let varFremmed = false;
setInterval(function () {
  const f = iFremmedLej();
  if (f) {
    document.getElementById("moebel-sektion").hidden = true;
    const k = document.getElementById("mi-knapper");
    if (k) k.hidden = true;
    const om = document.getElementById("mi-om");
    if (om && valgtMoebel) om.textContent = lejInfo(aktivtVaerelse).ejer + "s møbel";
  } else if (varFremmed && rumValg === "vaerelse" && !erGang(aktivtVaerelse)) {
    document.getElementById("moebel-sektion").hidden = false;
  }
  varFremmed = f;
}, 300);


// -------------------------------------------------------------
//  Udseendet (grøn/creme som navigatøren)
// -------------------------------------------------------------
const lejStil = document.createElement("style");
lejStil.textContent =
  "#lej-vindue { position: fixed; top: 70px; left: calc(50% - 230px); z-index: 60; width: min(460px, calc(100vw - 20px)); max-height: calc(100vh - 100px); overflow-y: auto;" +
  " background: #fbf6ea; border: 3px solid #4e7d4a; border-radius: 14px; box-shadow: 0 8px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; }" +
  "#lej-vindue[hidden], #lej-kode-boks[hidden] { display: none; }" +
  "#lej-vindue .lej-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #4e7d4a; color: #fbf6ea; cursor: move; font-size: 15px; }" +
  "#lej-vindue .lej-top button { background: #6b9c62; border: 2px solid #d9edcc; color: #fff; border-radius: 6px; cursor: pointer; }" +
  "#lej-indhold { padding: 10px 14px 14px; }" +
  ".lej-velkommen { margin: 0 0 8px; padding: 8px 10px; background: #fff3cf; border: 2px dashed #e3c86a; border-radius: 10px; }" +
  ".lej-nu { margin: 0 0 6px; }" +
  ".lej-titel { display: block; margin: 10px 0 6px; color: #3b6338; }" +
  ".lej-sale { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }" +
  ".lej-sale button, .lej-doere button { padding: 6px 2px; border: 2px solid #d6e8c8; border-radius: 8px; background: #fff; color: #33402c; font: 12px Verdana, sans-serif; cursor: pointer; }" +
  ".lej-sale button small, .lej-doere button small { display: block; font-size: 10px; color: #7a8a76; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }" +
  ".lej-sale button.valgt, .lej-doere button.valgt { background: #9ccc8f; border-color: #4e7d4a; }" +
  ".lej-doere { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }" +
  ".lej-doere button span { display: block; font-size: 18px; }" +
  ".lej-sale button.fuld { opacity: 0.5; }" +
  ".lej-doere button.taget { background: #eee8dc; color: #9a9184; cursor: not-allowed; }" +
  ".lej-doere button.mig { border-color: #e0a73c; background: #fff3cf; }" +
  ".lej-adgang { display: flex; gap: 6px; flex-wrap: wrap; }" +
  ".lej-adgang select, .lej-adgang input { padding: 5px 7px; border: 1px solid #9ccc8f; border-radius: 6px; font: 12px Verdana, sans-serif; }" +
  ".lej-adgang input[hidden] { display: none; }" +
  ".lej-fejl { min-height: 1em; margin: 8px 0 0; color: #b23b3b; font-weight: bold; }" +
  ".lej-knapper { display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; }" +
  ".lej-knapper button { padding: 7px 14px; border: 2px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 13px Verdana, sans-serif; cursor: pointer; }" +
  ".lej-knapper button.lej-gem { background: #4e7d4a; border-color: #3a5e37; color: #fff; }" +
  ".lej-tom { color: #7a8a76; }" +
  "#nav-vindue .lej-nav-knap { margin-bottom: 4px; }" +
  "#lej-kode-boks { position: fixed; top: 40%; left: calc(50% - 130px); z-index: 61; width: 260px; padding: 12px; background: #fbf6ea; border: 3px solid #4e7d4a;" +
  " border-radius: 12px; box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; display: flex; flex-direction: column; gap: 8px; }" +
  "#lej-kode-boks input { padding: 6px 8px; border: 1px solid #9ccc8f; border-radius: 6px; }" +
  "#lej-kode-boks div { display: flex; gap: 6px; }" +
  "#lej-kode-boks button { flex: 1; padding: 6px; border: 2px solid #9ccc8f; border-radius: 8px; background: #e8f2dc; color: #2f4a2b; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#lej-kode-boks #lk-ind { background: #4e7d4a; color: #fff; }" +
  "#lej-kode-boks small { color: #b23b3b; font-weight: bold; }";
document.head.appendChild(lejStil);
