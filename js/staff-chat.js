// =============================================================
//  💬 Staff chat og 🔒 adgang til private beskeder
//  - Alle ansatte (og ejeren) har fanen "💬 Staff chat" i panelet: en fælles chat
//    for hele personalet og private samtaler med hver enkelt ansat.
//    Ansatte uden MOD- eller Eventvært-job får 🛡️-knappen med "Mit job" og "Staff chat".
//  - Alle ansatte ser fanen "Private beskeder", men den er låst. De kan bede om adgang,
//    og ejeren sætter et flueben ud for deres navn (i Staff chat eller Ansættelse).
//  (Kræver database-13-staff.sql.)
// =============================================================
["staff", "hjaelper", "bygmester", "support", "content-creator"].forEach(function (s) {
  if (!ROLLE_FANER[s]) ROLLE_FANER[s] = ["mitjob"];
  ROLLE_NAVN[s] = "🛡️ Staff-panel";
});
Object.keys(ROLLE_FANER).forEach(function (r) { if (ROLLE_FANER[r].indexOf("staffchat") < 0) ROLLE_FANER[r].push("staffchat"); });

// Alle ansatte har fanen Private beskeder (låst, indtil ejeren giver adgang)
const rolleMaaFoerStaff = rolleMaa;
rolleMaa = function (fane) {
  if (fane === "beskeder" && minRolle()) return true;
  return rolleMaaFoerStaff(fane);
};
document.querySelectorAll("#ejer-faner button").forEach(function (k) { k.hidden = !rolleMaa(k.dataset.fane); });

const staffFane = document.createElement("button");
staffFane.dataset.fane = "staffchat";
document.getElementById("ejer-faner").appendChild(staffFane);
staffFane.addEventListener("click", function () { ejerFane = "staffchat"; visFane(); });

let staffBeskeder = [];          // [{ id, fra, til, tekst, tid }]
let staffEfter = 0;
let staffHentet = false;         // false indtil database-13 svarer
let maaSeBeskeder = false;       // må jeg se spillernes private beskeder?
let staffAdgang = [];            // [{ navn, beskeder, beder }] (ejeren ser alle, andre kun sig selv)
let staffSamtale = "faelles";    // "faelles" eller en ansats navn

function erEjerMig() { return EJERE.indexOf(FIGUR.navn) >= 0; }
function laestNoegle() { return "mit-hotel-staff-laest-" + FIGUR.navn; }
function laest() { try { return JSON.parse(localStorage.getItem(laestNoegle()) || "{}"); } catch (e) { return {}; } }
function saetLaest(samtale) {
  const l = laest();
  const sidste = staffBeskeder.filter(function (m) { return samtaleFor(m) === samtale; }).pop();
  if (!sidste || l[samtale] >= sidste.id) return;
  l[samtale] = sidste.id;
  try { localStorage.setItem(laestNoegle(), JSON.stringify(l)); } catch (e) {}
}
// Hvilken samtale hører beskeden til?
function samtaleFor(m) {
  if (!m.til) return "faelles";
  return m.fra === FIGUR.navn ? m.til : m.fra;
}
function ulaeste(samtale) {
  const l = laest();
  return staffBeskeder.filter(function (m) {
    return m.fra !== FIGUR.navn && (!samtale || samtaleFor(m) === samtale) && m.id > (l[samtaleFor(m)] || 0);
  }).length;
}
// Alle ansatte (og ejeren), undtagen mig selv
function staffNavne() {
  const navne = [];
  if (EJERE[0]) navne.push(EJERE[0]);
  Object.keys(ansatte).forEach(function (n) { if (erAnsat(n) && navne.indexOf(n) < 0) navne.push(n); });
  staffBeskeder.forEach(function (m) { [m.fra, m.til].forEach(function (n) { if (n && navne.indexOf(n) < 0) navne.push(n); }); });
  return navne.filter(function (n) { return n !== FIGUR.navn; });
}
function adgangFor(navn) {
  return staffAdgang.find(function (a) { return a.navn.toLowerCase() === navn.toLowerCase(); }) || { beskeder: false, beder: false };
}


// -------------------------------------------------------------
//  Hent fra serveren hvert 3. sekund
// -------------------------------------------------------------
let staffSidsteBeder = "";
function hentStaff() {
  const token = mitToken();
  if (!SERVER.til || !token || !minRolle()) return;
  serverKald("hv_staff_hent", { p_token: token, p_efter: staffEfter }).then(function (svar) {
    staffHentet = true;
    const nye = (svar.beskeder || []).filter(function (m) { return m.id > staffEfter; });
    nye.forEach(function (m) { staffBeskeder.push(m); staffEfter = Math.max(staffEfter, m.id); });
    if (staffBeskeder.length > 400) staffBeskeder = staffBeskeder.slice(-400);
    const foerAdgang = stabil([maaSeBeskeder, staffAdgang]);
    maaSeBeskeder = !!svar.maaSeBeskeder;
    staffAdgang = svar.adgang || [];
    // ejeren får besked, når nogen beder om adgang
    if (erEjerMig()) {
      const beder = staffAdgang.filter(function (a) { return a.beder; }).map(function (a) { return a.navn; }).join(", ");
      if (beder && beder !== staffSidsteBeder) besked.textContent = "🙋 " + beder + " beder om adgang til private beskeder. Se 💬 Staff chat.";
      staffSidsteBeder = beder;
    }
    const nyFraAndre = nye.some(function (m) { return m.fra !== FIGUR.navn; });
    if (nyFraAndre && typeof spilPling === "function" && staffEfter && nye.length < 20) spilPling();
    if (nye.length || stabil([maaSeBeskeder, staffAdgang]) !== foerAdgang) opdaterStaff();
  }).catch(function () {});    // database-13-staff.sql er ikke kørt endnu
}
hentStaff();
setInterval(hentStaff, 3000);


// -------------------------------------------------------------
//  Tal på fanen og 🛡️-knappen, og 🔒 på Private beskeder
// -------------------------------------------------------------
const staffTal = document.createElement("span");
staffTal.className = "staff-tal";
staffTal.hidden = true;
ejerKnap.appendChild(staffTal);

function beskederLaast() { return minRolle() && minRolle() !== "ejer" && !maaSeBeskeder; }

// Ansatte uden MOD-job, der har fået adgang, henter beskederne her (MOD får dem med resten)
function hentBeskederTilAnsat() {
  if (ejerVindue.hidden || ejerFane !== "beskeder" || !maaSeBeskeder || erModEllerEjer()) return;
  serverKald("hv_beskeder_alle", { p_token: mitToken() }).then(function (liste) {
    const foer = stabil(serverBeskeder);
    serverBeskeder = liste || [];
    if (stabil(serverBeskeder) !== foer && !skriverIPanel()) visFane();
  }).catch(function () {});
}
setInterval(hentBeskederTilAnsat, 4000);

function opdaterTal() {
  const n = minRolle() ? ulaeste() : 0;
  const beder = erEjerMig() ? staffAdgang.filter(function (a) { return a.beder; }).length : 0;
  const alle = n + beder;
  staffFane.innerHTML = "💬 Staff chat" + (alle ? " <span class='staff-fane-tal'>" + alle + "</span>" : "");
  staffTal.textContent = alle > 9 ? "9+" : alle;
  staffTal.hidden = !alle;
  const bf = document.querySelector('#ejer-faner [data-fane="beskeder"]');
  if (bf) bf.classList.toggle("laast", !!beskederLaast());
}
setInterval(opdaterTal, 500);

function opdaterStaff() {
  opdaterTal();
  if (ejerVindue.hidden) return;
  if (ejerFane === "staffchat") {
    if (document.getElementById("sc-liste")) { tegnSamtaler(); tegnBeskeder(); } else visFane();
  }
  if (ejerFane === "beskeder" && !skriverIPanel()) visFane();
  if (ejerFane === "ansaettelse" && !skriverIPanel()) visFane();
}


// -------------------------------------------------------------
//  Fanerne
// -------------------------------------------------------------
const visFaneFoerStaff = visFane;
visFane = function () {
  visFaneFoerStaff();
  ejerIndhold.classList.toggle("sc-nat", ejerFane === "staffchat");
  if (ejerVindue.hidden) return;
  if (ejerFane === "staffchat") visStaffChat();
  if (ejerFane === "beskeder" && beskederLaast()) visLaasteBeskeder();
  else if (ejerFane === "beskeder" && !erModEllerEjer() && !serverBeskeder) {
    ejerIndhold.innerHTML = "<p class='tom'>Henter private beskeder …</p>";
    hentBeskederTilAnsat();
  }
  if (ejerFane === "ansaettelse" && erEjerMig()) tilfoejFlueben();
};

// Private beskeder er låst, indtil ejeren giver adgang
function visLaasteBeskeder() {
  const mig = adgangFor(FIGUR.navn);
  ejerIndhold.innerHTML = "<div class='sc-laast'><div class='sc-laas'>🔒</div><h3>Private beskeder er låst</h3>" +
    "<p>Spillernes private beskeder kan kun ses, når ejeren har givet dig adgang.</p>" +
    (!staffHentet ? "<p class='ejer-info'>Virker, når database-13-staff.sql er kørt.</p>" :
      mig.beder ? "<p class='sc-venter'>⏳ Du har bedt om adgang. Ejeren skal godkende det.</p>" :
      "<button id='sc-bed' class='lv-knap'>🙋 Bed om adgang</button>") + "</div>";
  const bed = document.getElementById("sc-bed");
  if (bed) bed.addEventListener("click", function () {
    serverKald("hv_staff_bed", { p_token: mitToken() }).then(function () {
      besked.textContent = "🙋 Du har bedt ejeren om adgang til private beskeder.";
      staffAdgang = [{ navn: FIGUR.navn, beskeder: false, beder: true }];
      visFane();
    }).catch(function (e) { besked.textContent = e.message; });
  });
}

// Ejeren giver eller tager adgangen
function saetAdgang(navn, til) {
  serverKald("hv_staff_adgang_saet", { p_token: mitToken(), p_navn: navn, p_beskeder: til }).then(function () {
    const a = adgangFor(navn);
    if (staffAdgang.indexOf(a) < 0) staffAdgang.push({ navn: navn, beskeder: til, beder: false }); else { a.beskeder = til; a.beder = false; }
    adminSkriv((til ? "Gav " : "Tog ") + navn + (til ? " adgang til" : " adgangen til") + " private beskeder");
    besked.textContent = til ? "✅ " + navn + " kan nu se private beskeder." : "🔒 " + navn + " kan ikke længere se private beskeder.";
    opdaterStaff();
  }).catch(function (e) { besked.textContent = /hv_staff/.test(e.message) ? "Virker, når database-13-staff.sql er kørt." : e.message; });
}
function fluebenHtml(navn) {
  const a = adgangFor(navn);
  return "<label class='sc-flueben" + (a.beder ? " beder" : "") + "' title='Må se spillernes private beskeder'>" +
    "<input type='checkbox' data-sc-adgang='" + rens(navn) + "'" + (a.beskeder ? " checked" : "") + ">" +
    (a.beder ? "🙋 Beder om adgang" : "✉️ Private beskeder") + "</label>";
}
function fluebenLyt(hvor) {
  hvor.querySelectorAll("[data-sc-adgang]").forEach(function (k) {
    k.addEventListener("change", function () { saetAdgang(k.dataset.scAdgang, k.checked); });
  });
}
// I Ansættelse: flueben ud for hver ansat i "Alle med skilt"
function tilfoejFlueben() {
  ejerIndhold.querySelectorAll(".an-liste li").forEach(function (li) {
    const a = li.querySelector("[data-an-vis]");
    if (!a || !erAnsat(a.dataset.anVis) || li.querySelector(".sc-flueben")) return;
    li.insertAdjacentHTML("afterbegin", fluebenHtml(a.dataset.anVis));
  });
  fluebenLyt(ejerIndhold);
}


// -------------------------------------------------------------
//  💬 Staff chat
// -------------------------------------------------------------
function visStaffChat() {
  if (staffSamtale !== "faelles" && staffNavne().indexOf(staffSamtale) < 0) staffSamtale = "faelles";
  ejerIndhold.innerHTML = "<div class='sc-krop'><aside><ul id='sc-liste'></ul></aside>" +
    "<section class='sc-samtale'><h3 id='sc-titel'></h3><div id='sc-beskeder'></div>" +
    "<form id='sc-form'><input id='sc-tekst' type='text' maxlength='300' autocomplete='off' placeholder='Skriv til personalet …'><button class='lv-knap'>Send</button></form></section></div>" +
    (staffHentet ? "" : "<p class='ejer-info'>ℹ️ Staff chatten virker, når database-13-staff.sql er kørt i Supabase.</p>");
  tegnSamtaler();
  tegnBeskeder();
  document.getElementById("sc-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const felt = document.getElementById("sc-tekst");
    const tekst = felt.value.trim();
    if (!tekst) return;
    felt.value = "";
    serverKald("hv_staff_send", { p_token: mitToken(), p_til: staffSamtale === "faelles" ? "" : staffSamtale, p_tekst: tekst })
      .then(hentStaff)
      .catch(function (err) { felt.value = tekst; besked.textContent = /hv_staff/.test(err.message) ? "Staff chatten virker, når database-13-staff.sql er kørt." : err.message; });
  });
}

// Rangorden i staff chatten: højeste rang øverst
const STAFF_RANG = [["ejer", "👑 Ejer"], ["mod", "🛡️ MOD"], ["staff", "⭐ Staff"], ["eventvaert", "🎉 Eventvært"],
  ["bygmester", "🔨 Bygmester"], ["support", "🛠 Support"], ["hjaelper", "🙋 Hjælper"], ["content-creator", "🎥 Content creator"], ["andet", "👤 Andre"]];
function staffRang(navn) {
  if (EJERE.indexOf(navn) >= 0) return "ejer";
  const s = ansatte[navn];
  return STAFF_RANG.some(function (r) { return r[0] === s; }) ? s : "andet";
}

function tegnSamtaler() {
  const liste = document.getElementById("sc-liste");
  if (!liste) return;
  function knapHtml(id, titel, under) {
    const u = ulaeste(id);
    const flueben = erEjerMig() && id !== "faelles" && erAnsat(id) ? fluebenHtml(id) : "";
    return "<li>" + flueben + "<button type='button' data-sc-samtale='" + rens(id) + "'" + (id === staffSamtale ? " class='valgt'" : "") + ">" +
      "<b>" + rens(titel) + "</b><small>" + rens(under) + "</small>" + (u ? "<span class='staff-fane-tal'>" + u + "</span>" : "") + "</button></li>";
  }
  let html = knapHtml("faelles", "👥 Fælles chat", "Hele personalet");
  const navne = staffNavne();
  STAFF_RANG.forEach(function (r) {
    const her = navne.filter(function (n) { return staffRang(n) === r[0]; }).sort(function (a, b) { return a.localeCompare(b); });
    if (!her.length) return;
    html += "<li class='sc-rang'>" + r[1] + "</li>" + her.map(function (n) {
      return knapHtml(n, (erOnline(n) ? "🟢 " : "⚪ ") + n, erOnline(n) ? "Online" : "Offline");
    }).join("");
  });
  liste.innerHTML = html;
  liste.querySelectorAll("[data-sc-samtale]").forEach(function (k) {
    k.addEventListener("click", function () { staffSamtale = k.dataset.scSamtale; tegnSamtaler(); tegnBeskeder(); document.getElementById("sc-tekst").focus(); });
  });
  fluebenLyt(liste);
}

function tegnBeskeder() {
  const boks = document.getElementById("sc-beskeder");
  if (!boks) return;
  document.getElementById("sc-titel").textContent = staffSamtale === "faelles" ? "👥 Fælles staff chat" : "💬 " + staffSamtale;
  document.getElementById("sc-tekst").placeholder = staffSamtale === "faelles" ? "Skriv til hele personalet …" : "Skriv til " + staffSamtale + " …";
  const mine = staffBeskeder.filter(function (m) { return samtaleFor(m) === staffSamtale; });
  const nede = boks.scrollHeight - boks.scrollTop - boks.clientHeight < 40;
  boks.innerHTML = mine.length ? mine.map(function (m) {
    const mig = m.fra === FIGUR.navn;
    return "<div class='sc-linje" + (mig ? " mig" : "") + "'><span class='sc-hvem'>" + rens(mig ? "Dig" : m.fra) + " · " + tidTekst(m.tid) + "</span>" +
      "<span class='sc-tekst'>" + rens(m.tekst) + "</span></div>";
  }).join("") : "<p class='tom'>Ingen beskeder endnu. Skriv den første 👋</p>";
  if (nede || !boks.dataset.set) boks.scrollTop = boks.scrollHeight;
  boks.dataset.set = "1";
  saetLaest(staffSamtale);
  opdaterTal();
  tegnUlaesteISamtaler();
}
function tegnUlaesteISamtaler() {
  document.querySelectorAll("#sc-liste [data-sc-samtale]").forEach(function (k) {
    const u = ulaeste(k.dataset.scSamtale);
    let s = k.querySelector(".staff-fane-tal");
    if (!u && s) s.remove();
    if (u) { if (!s) { s = document.createElement("span"); s.className = "staff-fane-tal"; k.appendChild(s); } s.textContent = u; }
  });
}


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const staffStil = document.createElement("style");
staffStil.textContent =
  "#chat-ejer-knap { position: relative; }" +
  ".staff-tal { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: #d9534f; color: #fff; font: bold 11px/18px Verdana, sans-serif; text-align: center; box-sizing: border-box; }" +
  ".staff-tal[hidden] { display: none; }" +
  ".staff-fane-tal { display: inline-block; min-width: 18px; margin-left: 6px; padding: 0 5px; border-radius: 9px; background: #d9534f; color: #fff; font: bold 11px/18px Verdana, sans-serif; text-align: center; }" +
  "#ejer-faner button.laast::after { content: ' 🔒'; }" +
  "#ejer-indhold .sc-krop { display: grid; grid-template-columns: minmax(110px, 32%) minmax(0, 1fr); gap: 12px; height: calc(100% - 4px); min-height: 360px; }" +
  "#ejer-indhold .sc-krop aside { overflow-y: auto; }" +
  "#ejer-indhold #sc-liste { list-style: none; margin: 0; padding: 0; }" +
  "#ejer-indhold #sc-liste li { display: block; padding: 0; margin: 0 0 6px; border: 0; }" +
  "#ejer-indhold #sc-liste button { width: 100%; display: block; position: relative; padding: 7px 9px; background: #fff; border: 1px solid #d6e8c8; border-radius: 8px; text-align: left; cursor: pointer; color: #33402c; font: 13px Verdana, sans-serif; }" +
  "#ejer-indhold #sc-liste button b { display: block; }" +
  "#ejer-indhold #sc-liste button small { display: block; color: #7a8a76; font-size: 11px; }" +
  "#ejer-indhold #sc-liste button .staff-fane-tal { position: absolute; top: 8px; right: 8px; }" +
  "#ejer-indhold #sc-liste button.valgt { background: #9ccc8f; border-color: #7fb56f; }" +
  "#ejer-indhold #sc-liste li.sc-rang { margin: 12px 0 4px; padding: 0 2px; border-bottom: 1px solid #d6e8c8; color: #3d6b39; font: bold 11px Verdana, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }" +
  "#ejer-indhold .sc-flueben { display: flex !important; align-items: center; gap: 5px; margin: 0 0 3px; padding: 3px 6px; border-radius: 6px; background: #f3ecd9; color: #5a4a2a; font: 11px Verdana, sans-serif; cursor: pointer; }" +
  "#ejer-indhold .sc-flueben.beder { background: #fff3cf; color: #a0521a; font-weight: bold; animation: paamind-puls 1.6s ease-in-out infinite; }" +
  "#ejer-indhold .an-liste .sc-flueben { display: inline-flex !important; margin-right: 6px; }" +
  "#ejer-indhold .sc-samtale { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: #fff; border: 2px solid #d6e8c8; border-radius: 10px; overflow: hidden; }" +
  "#ejer-indhold .sc-samtale h3 { margin: 0; padding: 8px 12px; background: #e8f2dc; color: #1f3a1c; font-size: 14px; }" +
  "#ejer-indhold #sc-beskeder { flex: 1; min-height: 200px; max-height: 420px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }" +
  "#ejer-vindue.stor #sc-beskeder { max-height: none; }" +
  "#ejer-indhold .sc-linje { align-self: flex-start; max-width: 80%; padding: 6px 10px; background: #f3ecd9; border-radius: 10px 10px 10px 2px; }" +
  "#ejer-indhold .sc-linje.mig { align-self: flex-end; background: #cfe4bf; border-radius: 10px 10px 2px 10px; }" +
  "#ejer-indhold .sc-hvem { display: block; font-size: 10px; color: #7a8a76; }" +
  "#ejer-indhold .sc-tekst { display: block; font-size: 13px; color: #33402c; overflow-wrap: anywhere; }" +
  "#ejer-indhold #sc-form { display: flex; gap: 6px; padding: 8px; border-top: 1px solid #e3ead8; }" +
  "#ejer-indhold #sc-form input { flex: 1; min-width: 0; width: auto; margin: 0; }" +
  "#ejer-indhold #sc-form .lv-knap { margin: 0; padding: 6px 12px; }" +
  "#ejer-indhold .sc-laast { max-width: 420px; margin: 30px auto; padding: 20px; text-align: center; background: #fff; border: 2px solid #d6e8c8; border-radius: 12px; }" +
  "#ejer-indhold .sc-laas { font-size: 46px; }" +
  "#ejer-indhold .sc-venter { color: #a0521a; font-weight: bold; }";
document.head.appendChild(staffStil);

// Staff chattens eget rolige tema: blød, mørk blågrå, rar at kigge på i mange timer
const N = "#ejer-indhold.sc-nat ";
const staffNatStil = document.createElement("style");
staffNatStil.textContent =
  "#ejer-indhold.sc-nat { background: #262f3b; color: #d5dde8; }" +
  N + ".sc-krop aside { padding-right: 2px; }" +
  N + "#sc-liste li.sc-rang { color: #9fbfd8; border-bottom-color: #3a4757; }" +
  N + "#sc-liste button { background: #2f3a48; border-color: #3a4757; color: #d5dde8; }" +
  N + "#sc-liste button:hover { background: #364353; }" +
  N + "#sc-liste button small { color: #8c9aab; }" +
  N + "#sc-liste button.valgt { background: #3f5a6e; border-color: #5f8199; color: #eef3f8; }" +
  N + ".sc-flueben { background: #2b3542; color: #a9b6c6; }" +
  N + ".sc-flueben.beder { background: #4a4230; color: #f0d58c; }" +
  N + ".sc-samtale { background: #2b3542; border-color: #3a4757; }" +
  N + ".sc-samtale h3 { background: #323f4f; color: #e3eaf2; }" +
  N + "#sc-beskeder .tom { color: #8c9aab; }" +
  N + ".sc-linje { background: #3a4657; }" +
  N + ".sc-linje.mig { background: #3e5f58; }" +
  N + ".sc-hvem { color: #93a3b5; }" +
  N + ".sc-tekst { color: #e6ebf2; }" +
  N + "#sc-form { border-top-color: #3a4757; background: #2f3a48; }" +
  N + "#sc-form input { background: #232b36; border-color: #46556a; color: #e6ebf2; }" +
  N + "#sc-form input::placeholder { color: #7f8da0; }" +
  N + "#sc-form .lv-knap { background: linear-gradient(#6fa597, #5a8f82); border-color: #44766a; color: #f2f8f6; }" +
  N + ".ejer-info { background: #2f3a48; color: #a9b6c6; }" +
  N + "#sc-beskeder::-webkit-scrollbar { width: 8px; }" +
  N + "#sc-beskeder::-webkit-scrollbar-thumb { background: #46556a; border-radius: 4px; }";
document.head.appendChild(staffNatStil);
