// =============================================================
//  🔒 Private beskeder: kun ejeren – medmindre ejeren giver adgang
//  - Fanen "✉️ Private beskeder" er skjult for alle ansatte (også MOD),
//    indtil ejeren har givet dem adgang. Ejeren ser den altid.
//  - Ansatte beder om adgang inde i 💬 Staff chat (knap øverst).
//    Ejeren får samtidig en privat besked i Staff chat.
//  - Ejeren får en notifikation midt øverst på skærmen (også når panelet er lukket):
//    ✅ Godkend / ✖ Afvis / Senere.
//  - Øverst i Staff chat ser ejeren, hvem der har adgang, og kan fjerne den igen.
//  - Serveren tjekker også selv (database-13-staff.sql: hv_maa_se_beskeder),
//    så ingen kan se beskederne ved at snyde i browseren.
//  (Hentes fra js/panel-forklaring.js. Bygger på js/staff-chat.js.)
// =============================================================
(function () {
  if (typeof staffAdgang === "undefined" || typeof saetAdgang !== "function") return;   // staff-chat.js mangler
  if (window.beskederAdgangKlar) return;
  window.beskederAdgangKlar = true;

  function r(t) { return typeof rens === "function" ? rens(t) : String(t == null ? "" : t); }
  function ejer() { return erEjerMig(); }
  function ansatMig() { return !!minRolle() && !ejer(); }
  function harAdgang() { return ejer() || !!maaSeBeskeder; }

  // -----------------------------------------------------------
  //  1. Fanen "Private beskeder" vises kun for ejeren og dem med adgang
  // -----------------------------------------------------------
  const rolleMaaFoer = rolleMaa;
  rolleMaa = function (fane) {
    if (fane === "beskeder") return harAdgang();
    return rolleMaaFoer(fane);
  };
  function tjekFane() {
    const k = document.querySelector('#ejer-faner [data-fane="beskeder"]');
    if (k) k.hidden = !harAdgang();
    // mister man adgangen, mens fanen er åben, lukkes den
    if (!harAdgang() && ejerFane === "beskeder") {
      ejerFane = "staffchat";
      if (!ejerVindue.hidden) visFane();
    }
  }
  setInterval(tjekFane, 500);
  tjekFane();


  // -----------------------------------------------------------
  //  2. Bed om adgang – inde i Staff chat
  // -----------------------------------------------------------
  let sender = false;
  function bedOmAdgang() {
    if (sender) return;
    sender = true;
    serverKald("hv_staff_bed", { p_token: mitToken() }).then(function () {
      const a = adgangFor(FIGUR.navn);
      if (staffAdgang.indexOf(a) < 0) staffAdgang.push({ navn: FIGUR.navn, beskeder: false, beder: true }); else a.beder = true;
      besked.textContent = "🙋 Du har bedt ejeren om adgang til private beskeder.";
      // ejeren får det også som en privat besked i Staff chat
      if (EJERE[0]) {
        return serverKald("hv_staff_send", { p_token: mitToken(), p_til: EJERE[0],
          p_tekst: "🙋 Jeg vil gerne have adgang til spillernes private beskeder." }).then(hentStaff).catch(function () {});
      }
    }).catch(function (e) {
      besked.textContent = /hv_staff/.test(e.message) ? "Virker, når database-13-staff.sql er kørt." : e.message;
    }).then(function () { sender = false; tegnBoks(); });
  }

  // Ejeren: godkend, afvis eller fjern igen (fjern kræver to tryk)
  let fjernKlar = "";
  let fjernTimer = null;
  function fjern(navn) {
    if (fjernKlar !== navn) {
      fjernKlar = navn;
      clearTimeout(fjernTimer);
      fjernTimer = setTimeout(function () { fjernKlar = ""; tegnBoks(); }, 4000);
      tegnBoks();
      return;
    }
    fjernKlar = "";
    saetAdgang(navn, false);
  }

  function boksHtml() {
    if (ejer()) {
      const beder = staffAdgang.filter(function (a) { return a.beder && !a.beskeder; });
      const har = staffAdgang.filter(function (a) { return a.beskeder && !EJERE.some(function (e) { return e.toLowerCase() === a.navn.toLowerCase(); }); });
      let h = "<div class='ba-titel'>🔒 Private beskeder <small>Kun du kan se dem, medmindre du giver en ansat adgang.</small></div>";
      beder.forEach(function (a) {
        h += "<div class='ba-raekke beder'><span>🙋 <b>" + r(a.navn) + "</b> beder om adgang</span>" +
          "<button type='button' class='ba-ja' data-ba-ja='" + r(a.navn) + "'>✅ Godkend</button>" +
          "<button type='button' class='ba-nej' data-ba-nej='" + r(a.navn) + "'>✖ Afvis</button></div>";
      });
      har.forEach(function (a) {
        const klar = fjernKlar === a.navn;
        h += "<div class='ba-raekke har'><span>🔓 <b>" + r(a.navn) + "</b> har adgang</span>" +
          "<button type='button' class='ba-fjern" + (klar ? " klar" : "") + "' data-ba-fjern='" + r(a.navn) + "'>" +
          (klar ? "Er du sikker? Tryk igen" : "🔒 Fjern adgang") + "</button></div>";
      });
      if (!beder.length && !har.length) h += "<div class='ba-raekke tom'>Ingen ansatte har adgang lige nu. 👍</div>";
      return h;
    }
    if (!ansatMig()) return "";
    if (maaSeBeskeder) return "<div class='ba-raekke har'><span>🔓 Ejeren har givet dig adgang til spillernes private beskeder (fanen ✉️ Private beskeder).</span></div>";
    if (!staffHentet) return "<div class='ba-raekke tom'>🔒 Adgang til private beskeder virker, når database-13-staff.sql er kørt.</div>";
    if (adgangFor(FIGUR.navn).beder) return "<div class='ba-raekke beder'><span>⏳ Du har bedt om adgang til private beskeder. Ejeren skal godkende det.</span></div>";
    return "<div class='ba-raekke'><span>🔒 Spillernes private beskeder kan kun ses af ejeren.</span>" +
      "<button type='button' class='ba-ja' data-ba-bed>🙋 Bed om adgang</button></div>";
  }

  function tegnBoks() {
    if (ejerVindue.hidden || ejerFane !== "staffchat") return;
    const krop = ejerIndhold.querySelector(".sc-krop");
    if (!krop) return;
    let boks = document.getElementById("ba-boks");
    if (!boks) {
      boks = document.createElement("div");
      boks.id = "ba-boks";
      krop.before(boks);
      boks.addEventListener("click", function (e) {
        const k = e.target.closest("button");
        if (!k) return;
        if (k.hasAttribute("data-ba-bed")) bedOmAdgang();
        else if (k.dataset.baJa) saetAdgang(k.dataset.baJa, true);
        else if (k.dataset.baNej) { saetAdgang(k.dataset.baNej, false); besked.textContent = "✖ Du afviste " + k.dataset.baNej + "."; }
        else if (k.dataset.baFjern) fjern(k.dataset.baFjern);
      });
    }
    const html = boksHtml();
    if (boks.dataset.html !== html) { boks.innerHTML = html; boks.dataset.html = html; }
    boks.hidden = !html;
  }
  const visFaneFoer = visFane;
  visFane = function () {
    visFaneFoer.apply(this, arguments);
    tegnBoks();
  };
  setInterval(tegnBoks, 700);


  // -----------------------------------------------------------
  //  3. Notifikation til ejeren, når en ansat beder om adgang
  // -----------------------------------------------------------
  const note = document.createElement("div");
  note.id = "ba-note";
  note.hidden = true;
  document.body.appendChild(note);
  let senere = {};        // navne, ejeren har trykket "Senere" på (indtil siden genindlæses)
  let vist = "";
  function tjekNote() {
    if (!ejer()) { note.hidden = true; return; }
    const beder = staffAdgang.filter(function (a) { return a.beder && !a.beskeder && !senere[a.navn.toLowerCase()]; });
    if (!beder.length) { note.hidden = true; vist = ""; return; }
    const a = beder[0];
    if (vist !== a.navn) {
      vist = a.navn;
      note.innerHTML = "<div class='ba-note-ikon'>🙋</div><div class='ba-note-tekst'><b>" + r(a.navn) + "</b> vil gerne have adgang til spillernes private beskeder." +
        (beder.length > 1 ? "<small>+ " + (beder.length - 1) + " mere venter</small>" : "") + "</div>" +
        "<div class='ba-note-knapper'><button type='button' class='ba-ja'>✅ Godkend</button>" +
        "<button type='button' class='ba-nej'>✖ Afvis</button><button type='button' class='ba-senere'>Senere</button></div>";
      note.querySelector(".ba-ja").onclick = function () { saetAdgang(a.navn, true); note.hidden = true; vist = ""; };
      note.querySelector(".ba-nej").onclick = function () { saetAdgang(a.navn, false); besked.textContent = "✖ Du afviste " + a.navn + "."; note.hidden = true; vist = ""; };
      note.querySelector(".ba-senere").onclick = function () { senere[a.navn.toLowerCase()] = true; note.hidden = true; vist = ""; };
      if (typeof spilPling === "function") { try { spilPling(); } catch (e) {} }
    }
    note.hidden = false;
  }
  setInterval(tjekNote, 1000);


  // -----------------------------------------------------------
  //  Udseendet (passer til Staff chattens rolige mørke tema)
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent =
    "#ba-boks { margin: 0 0 10px; padding: 9px 11px; background: #2f3a48; border: 1px solid #46556a; border-radius: 10px; color: #d5dde8; font: 12px Verdana, sans-serif; }" +
    "#ba-boks[hidden] { display: none; }" +
    "#ba-boks .ba-titel { margin-bottom: 6px; font-weight: bold; color: #e3eaf2; }" +
    "#ba-boks .ba-titel small { display: block; font-weight: normal; color: #8c9aab; font-size: 11px; }" +
    "#ba-boks .ba-raekke { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 5px 0; }" +
    "#ba-boks .ba-raekke + .ba-raekke { border-top: 1px solid #3a4757; }" +
    "#ba-boks .ba-raekke span { flex: 1; min-width: 160px; }" +
    "#ba-boks .ba-raekke.beder span { color: #f0d58c; }" +
    "#ba-boks .ba-raekke.har span { color: #cfe6dc; }" +
    "#ba-boks .ba-raekke.tom { color: #8c9aab; }" +
    "#ba-boks button, #ba-note button { margin: 0; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; font: bold 11px Verdana, sans-serif; cursor: pointer; }" +
    "#ba-boks .ba-ja { background: #5a8f82; border-color: #44766a; color: #fff; }" +
    "#ba-boks .ba-nej, #ba-boks .ba-fjern { background: #2b3542; border-color: #46556a; color: #e6ebf2; }" +
    "#ba-boks .ba-fjern.klar { background: #a5524a; border-color: #c0392b; color: #fff; }" +
    "#ba-note { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 9000; display: flex; align-items: center; gap: 12px;" +
    " max-width: calc(100vw - 32px); width: 460px; box-sizing: border-box; padding: 12px 14px; background: #fbf6ea; border: 3px solid #c9a24a; border-radius: 14px;" +
    " box-shadow: 0 8px 24px rgba(0,0,0,0.35); color: #4a3517; font: 13px Verdana, sans-serif; animation: ba-ind 0.35s ease-out; }" +
    "#ba-note[hidden] { display: none; }" +
    "#ba-note .ba-note-ikon { font-size: 30px; }" +
    "#ba-note .ba-note-tekst { flex: 1; min-width: 0; }" +
    "#ba-note .ba-note-tekst small { display: block; color: #8a6d3b; font-size: 11px; margin-top: 2px; }" +
    "#ba-note .ba-note-knapper { display: flex; flex-direction: column; gap: 4px; }" +
    "#ba-note .ba-ja { background: #4e7d4a; color: #fff; }" +
    "#ba-note .ba-nej { background: #a5524a; color: #fff; }" +
    "#ba-note .ba-senere { background: #efe4c8; border-color: #d8c595; color: #5a4313; font-weight: normal; }" +
    "@media (max-width: 520px) { #ba-note { flex-wrap: wrap; } #ba-note .ba-note-knapper { flex-direction: row; width: 100%; } }" +
    "@keyframes ba-ind { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }";
  document.head.appendChild(stil);
})();
