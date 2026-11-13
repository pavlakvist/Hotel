// =============================================================
//  ⚖️ Straf med beviser fra chatloggen
//  - I Ejerpanel → 💬 Chatlogs kan ejeren og MOD sætte ✅ ved de beskeder,
//    der viser at nogen har skrevet grimt, og give en straf med dem som bevis.
//  - Straffen bliver til en straf-rapport med beviserne. Ejeren og ALLE ansatte
//    kan se rapporterne i fanen ⚖️ Straf-rapporter, og der kommer en besked i Staff chat.
//  Hentes af js/chatlog-arkiv.js. Kræver database-50-straf-beviser.sql.
// =============================================================
(function () {
  if (typeof visEjerChatlog !== "function" || typeof serverKald !== "function") return;

  const valgte = {};          // id → { id, tid, rum, navn, tekst }  (husket, også når man søger videre)
  const form = { navn: "", grund: "Grimt sprog", tid: null, altid: false };
  let sender = false;
  let rapporter = null;       // fra serveren
  let rapportFejl = "";
  let rapportSoeg = "";
  let sidstHentet = 0;
  let fraChatlog = false;     // true mens Chatlogs-bjælken selv giver straffen

  function antalValgte() { return Object.keys(valgte).length; }
  function tidMedAar(t) {
    return new Date(t).toLocaleString("da-DK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function rumTekst(r) { return typeof rumNavn === "function" ? rumNavn(r) : r; }
  function kanStraffe() { return typeof erModEllerEjer === "function" && erModEllerEjer(); }
  function erEjer() { return EJERE.indexOf(FIGUR.navn) >= 0; }

  // -----------------------------------------------------------
  //  1) ✅ ved beskederne i Chatlogs
  // -----------------------------------------------------------
  const visChatlogFoerBevis = visEjerChatlog;
  visEjerChatlog = function () {
    visChatlogFoerBevis();
    if (!kanStraffe()) return;
    const tabel = ejerIndhold.querySelector(".ejer-tabel");
    const raekker = tabel ? tabel.querySelectorAll("tbody tr[data-id]") : [];
    if (!tabel || !raekker.length && !antalValgte()) { tegnBjaelke(tabel); return; }

    const hoved = tabel.querySelector("thead tr");
    if (hoved && !hoved.querySelector(".sb-th")) hoved.insertAdjacentHTML("afterbegin", "<th class='sb-th' title='Sæt flueben ved beviser'>✅</th>");
    raekker.forEach(function (tr) {
      const id = tr.dataset.id;
      const td = document.createElement("td");
      td.className = "sb-td";
      td.innerHTML = "<input type='checkbox' title='Brug beskeden som bevis'" + (valgte[id] ? " checked" : "") + ">";
      tr.prepend(td);
      tr.classList.toggle("sb-valgt", !!valgte[id]);
      td.firstChild.addEventListener("change", function (e) {
        if (e.target.checked) {
          const celler = tr.querySelectorAll("td");
          valgte[id] = {
            id: +id, tid: celler[1].textContent, rum: celler[2].textContent,
            navn: celler[3].textContent, tekst: celler[4].textContent
          };
          if (!form.navn) form.navn = valgte[id].navn;
        } else {
          delete valgte[id];
        }
        tr.classList.toggle("sb-valgt", !!valgte[id]);
        tegnBjaelke(tabel);
      });
    });
    tegnBjaelke(tabel);
  };

  // Bjælken over listen: de valgte beviser + straf-knapperne
  function tegnBjaelke(tabel) {
    const gammel = document.getElementById("sb-bjaelke");
    if (gammel) gammel.remove();
    if (!antalValgte() || ejerFane !== "chat") return;

    const liste = Object.keys(valgte).map(function (k) { return valgte[k]; }).sort(function (a, b) { return a.id - b.id; });
    const navne = [];
    liste.forEach(function (l) { if (navne.indexOf(l.navn) < 0) navne.push(l.navn); });
    if (navne.indexOf(form.navn) < 0) form.navn = navne[0];
    if (form.tid == null) form.tid = typeof valgtStrafTid !== "undefined" ? valgtStrafTid : 60;

    const div = document.createElement("div");
    div.id = "sb-bjaelke";
    div.innerHTML = "<div class='sb-top'><b>⚖️ " + liste.length + (liste.length === 1 ? " besked" : " beskeder") + " valgt som bevis</b>" +
      "<button type='button' class='lille' id='sb-fjern'>✖ Fjern alle flueben</button></div>" +
      "<ul class='sb-beviser'>" + liste.map(function (l) {
        return "<li><small>" + rens(l.tid) + " · " + rens(l.rum) + "</small> <b>" + rens(l.navn) + ":</b> " + rens(l.tekst) + "</li>";
      }).join("") + "</ul>" +
      "<div class='sb-form'>" +
      "<label>Hvem skal straffes<select id='sb-navn'>" + navne.map(function (n) {
        return "<option" + (n === form.navn ? " selected" : "") + ">" + rens(n) + "</option>";
      }).join("") + "</select></label>" +
      "<label class='sb-bred'>Grund<input id='sb-grund' type='text' maxlength='80' value='" + rens(form.grund) + "'></label>" +
      "<label>Hvor længe<select id='sb-tid'>" + STRAF_TIDER.map(function (t) {
        return "<option value='" + t[0] + "'" + (t[0] === form.tid ? " selected" : "") + ">" + t[1] + "</option>";
      }).join("") + "</select></label>" +
      "<label class='tjek'><input id='sb-altid' type='checkbox'" + (form.altid ? " checked" : "") + "> Ban for altid</label>" +
      "</div><div class='sb-knapper'>" +
      "<button type='button' data-sb='Advarsel'>⚠️ Advar</button>" +
      "<button type='button' data-sb='Mute'>🔇 Mute</button>" +
      "<button type='button' data-sb='Frys'>🧊 Frys</button>" +
      "<button type='button' data-sb='Ban' class='roed'>⛔ Ban</button>" +
      "</div><p class='sb-svar' id='sb-svar'></p>";

    const efter = ejerIndhold.querySelector(".ejer-antal") || ejerIndhold.querySelector(".ejer-filtre");
    if (efter) efter.after(div); else ejerIndhold.prepend(div);

    document.getElementById("sb-fjern").addEventListener("click", function () {
      Object.keys(valgte).forEach(function (k) { delete valgte[k]; });
      form.navn = "";
      visFane();
    });
    document.getElementById("sb-navn").addEventListener("change", function (e) { form.navn = e.target.value; });
    document.getElementById("sb-grund").addEventListener("input", function (e) { form.grund = e.target.value; });
    document.getElementById("sb-tid").addEventListener("change", function (e) { form.tid = +e.target.value; });
    document.getElementById("sb-altid").addEventListener("change", function (e) { form.altid = e.target.checked; });
    div.querySelectorAll("[data-sb]").forEach(function (k) {
      k.addEventListener("click", function () { givStraf(k.dataset.sb, liste); });
    });
  }

  function givStraf(handling, liste) {
    const svar = document.getElementById("sb-svar");
    const navn = form.navn;
    const grund = String(form.grund || "").trim();
    if (sender) return;
    if (!navn) { svar.textContent = "Vælg hvem der skal straffes."; return; }
    if (navn === FIGUR.navn) { svar.textContent = "Du kan ikke straffe dig selv 😄"; return; }
    if (EJERE.indexOf(navn) >= 0) { svar.textContent = "Hotellets ejer kan ikke straffes 😉"; return; }
    const minutter = handling === "Ban" && form.altid ? 0 : form.tid;
    const varighed = minutter ? (STRAF_TIDER.find(function (t) { return t[0] === minutter; }) || [0, minutter + " min"])[1] : "for altid";
    const ids = liste.map(function (l) { return l.id; });

    sender = true;
    svar.textContent = "Gemmer straf-rapporten …";
    serverKald("hv_straf_rapport_gem", {
      p_token: mitToken(), p_navn: navn, p_handling: handling + " (" + varighed + ")", p_grund: grund, p_ids: ids
    }).then(function () {
      // selve straffen gives på den sædvanlige måde (samme som under Spillere og konti)
      fraChatlog = true;
      try { straf(navn, handling, grund, minutter); } finally { fraChatlog = false; }
      const ikon = { Advarsel: "⚠️", Mute: "🔇", Frys: "🧊", Ban: "⛔" }[handling] || "⚖️";
      serverKald("hv_staff_send", {
        p_token: mitToken(), p_til: "",
        p_tekst: "⚖️ Straf-rapport: " + navn + " fik " + ikon + " " + handling + " (" + varighed + ")" +
          (grund ? " for " + grund : "") + ", med " + ids.length + (ids.length === 1 ? " bevis" : " beviser") +
          ". Se fanen ⚖️ Straf-rapporter."
      }).catch(function () {});
      Object.keys(valgte).forEach(function (k) { delete valgte[k]; });
      form.navn = "";
      sidstHentet = 0;
      visFane();
      besked.textContent = "⚖️ " + handling + " til " + navn + " er givet, og straf-rapporten med beviserne er gemt.";
    }).catch(function (e) {
      const el = document.getElementById("sb-svar");
      if (el) el.textContent = /hv_straf_rapport_gem|Could not find/i.test(e.message)
        ? "Straf med beviser er ikke slået til endnu. Kør database-50-straf-beviser.sql i Supabase."
        : e.message;
    }).finally(function () { sender = false; });
  }

  // -----------------------------------------------------------
  //  1b) Spillere og konti → en spiller → 💬 Beskeder:
  //      flueben ved beskederne + ✅ Godkend beviser.
  //      De godkendte beviser kommer med i straf-rapporten,
  //      når man giver straffen med de sædvanlige knapper (Advar/Mute/Frys/Ban).
  // -----------------------------------------------------------
  const spValgte = {};        // spiller → { id: linje }   (flueben, ikke godkendt endnu)
  const godkendte = {};       // spiller → [linje, …]      (godkendt, venter på straffen)
  const spArkiv = {};         // spiller → { linjer, flere, henter, sidst, fejl }

  function hentSpillerBeskeder(navn, aeldre) {
    const a = spArkiv[navn] || (spArkiv[navn] = { linjer: [], flere: false, henter: false, sidst: 0, fejl: "", hentet: false });
    if (a.henter || !mitToken()) return;
    a.henter = true;
    a.sidst = Date.now();
    const foer = aeldre && a.linjer.length ? a.linjer[a.linjer.length - 1].id : null;
    const foerSvar = JSON.stringify([a.linjer.length && a.linjer[0].id, a.linjer.length, a.fejl, a.hentet]);
    serverKald("hv_chatlog_soeg", { p_token: mitToken(), p_navn: navn, p_foer: foer, p_antal: 100 }).then(function (svar) {
      const nye = (svar && svar.linjer) || [];
      if (aeldre) { a.linjer = a.linjer.concat(nye); a.flere = nye.length === 100; }
      else {
        const kendt = {};
        nye.forEach(function (l) { kendt[l.id] = true; });
        const gamle = a.linjer.filter(function (l) { return !kendt[l.id] && (!nye.length || l.id < nye[nye.length - 1].id); });
        a.linjer = nye.concat(gamle);
        if (!a.hentet) a.flere = nye.length === 100;
      }
      a.hentet = true;
      a.fejl = "";
    }).catch(function (e) {
      a.fejl = /hv_chatlog_soeg|Could not find/i.test(e.message)
        ? "Chat-arkivet er ikke slået til endnu. Kør database-49-chat-arkiv.sql i Supabase." : e.message;
    }).finally(function () {
      a.henter = false;
      const nu = JSON.stringify([a.linjer.length && a.linjer[0].id, a.linjer.length, a.fejl, a.hentet]);
      if ((aeldre || nu !== foerSvar) && !ejerVindue.hidden && ejerFane === "spillere" && valgtSpiller === navn && !skriverIPanel()) visFane();
    });
  }

  function godkendtBoks(navn) {
    const g = godkendte[navn] || [];
    if (!g.length) return "";
    return "<div class='sb-godkendt'><b>📎 " + g.length + (g.length === 1 ? " bevis" : " beviser") + " godkendt</b>" +
      "<small>De kommer med i straf-rapporten, når du trykker Advar, Mute, Frys eller Ban.</small>" +
      "<ul>" + g.map(function (l) {
        return "<li><small>" + tidMedAar(l.tid) + " · " + rens(rumTekst(l.rum)) + "</small> " + rens(l.tekst) + "</li>";
      }).join("") + "</ul><button type='button' class='lille' id='sb-glem'>✖ Fjern de godkendte beviser</button></div>";
  }

  if (typeof visSpillere === "function") {
    const visSpillereFoerBevis = visSpillere;
    visSpillere = function () {
      visSpillereFoerBevis();
      if (!kanStraffe() || typeof valgtSpiller === "undefined") return;
      const navn = valgtSpiller;
      const side = ejerIndhold.querySelector(".sp-info-side[data-side='beskeder']");
      if (!side) return;
      const a = spArkiv[navn];
      if (!a || (!a.henter && Date.now() - a.sidst > 5000)) hentSpillerBeskeder(navn, false);

      // Godkendte beviser vises ved Straf-knapperne
      const strafBoks = ejerIndhold.querySelector(".sp-straf");
      if (strafBoks && godkendte[navn] && godkendte[navn].length) {
        strafBoks.insertAdjacentHTML("afterend", godkendtBoks(navn));
        document.getElementById("sb-glem").addEventListener("click", function () { delete godkendte[navn]; visFane(); });
      }

      if (!a || !a.hentet) {
        if (a && a.fejl) side.innerHTML = "<p class='tom'>" + rens(a.fejl) + "</p>";
        return;     // indtil arkivet svarer, står den gamle liste der
      }
      const valgt = spValgte[navn] || (spValgte[navn] = {});
      const erGodkendt = {};
      (godkendte[navn] || []).forEach(function (l) { erGodkendt[l.id] = true; });
      const antal = Object.keys(valgt).length;
      side.innerHTML =
        "<div class='sb-sp-top'><span>Sæt ✅ ved de beskeder, der er beviser.</span>" +
        "<button type='button' class='lille groen' id='sb-godkend'" + (antal ? "" : " disabled") + ">✅ Godkend beviser" + (antal ? " (" + antal + ")" : "") + "</button></div>" +
        (a.linjer.length ? "<ul class='sp-chat-liste sb-sp-liste'>" + a.linjer.map(function (l) {
          const tjek = !!valgt[l.id], ok = erGodkendt[l.id];
          return "<li class='" + (tjek ? "sb-valgt" : "") + (ok ? " sb-ok" : "") + "'><label>" +
            "<input type='checkbox' data-sb-id='" + l.id + "'" + (tjek ? " checked" : "") + (ok ? " disabled title='Allerede godkendt'" : "") + ">" +
            "<span><span class='sp-chat-tid'>" + tidMedAar(l.tid) + " · " + rens(rumTekst(l.rum)) + (ok ? " · 📎 godkendt" : "") + "</span>" +
            "<span class='sp-chat-tekst'><b>" + rens(l.navn) + ":</b> " + rens(l.tekst) + "</span></span></label></li>";
        }).join("") + "</ul>" : "<p class='tom'>Har ikke skrevet noget</p>") +
        (a.flere ? "<p><button type='button' class='lille' id='sb-sp-aeldre'" + (a.henter ? " disabled" : "") + ">⬇️ Vis ældre beskeder</button></p>" : "");

      side.querySelectorAll("[data-sb-id]").forEach(function (k) {
        k.addEventListener("change", function () {
          const id = +k.dataset.sbId;
          if (k.checked) valgt[id] = a.linjer.find(function (l) { return l.id === id; });
          else delete valgt[id];
          k.closest("li").classList.toggle("sb-valgt", k.checked);
          const n = Object.keys(valgt).length;
          const knap = document.getElementById("sb-godkend");
          knap.disabled = !n;
          knap.textContent = "✅ Godkend beviser" + (n ? " (" + n + ")" : "");
        });
      });
      document.getElementById("sb-godkend").addEventListener("click", function () {
        const nye = Object.keys(valgt).map(function (k) { return valgt[k]; }).filter(Boolean);
        if (!nye.length) return;
        const g = godkendte[navn] || (godkendte[navn] = []);
        nye.forEach(function (l) { if (!g.some(function (x) { return x.id === l.id; })) g.push(l); });
        g.sort(function (x, y) { return x.id - y.id; });
        spValgte[navn] = {};
        besked.textContent = "📎 " + g.length + (g.length === 1 ? " bevis" : " beviser") + " godkendt. Giv nu straffen ovenfor, så kommer de med i straf-rapporten.";
        visFane();
        const boks = ejerIndhold.querySelector(".sb-godkendt");
        if (boks) boks.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      const aeldre = document.getElementById("sb-sp-aeldre");
      if (aeldre) aeldre.addEventListener("click", function () { aeldre.disabled = true; hentSpillerBeskeder(navn, true); });
    };
  }

  // Når straffen gives under Spillere og konti, kommer de godkendte beviser med i en straf-rapport
  if (typeof straf === "function") {
    const strafFoerBevis = straf;
    straf = function (navn, handling, grund, minutter) {
      strafFoerBevis(navn, handling, grund, minutter);
      const g = godkendte[navn];
      if (fraChatlog || !g || !g.length || !kanStraffe()) return;
      delete godkendte[navn];
      const varighed = minutter ? (STRAF_TIDER.find(function (t) { return t[0] === minutter; }) || [0, minutter + " min"])[1] : "for altid";
      const ids = g.map(function (l) { return l.id; });
      serverKald("hv_straf_rapport_gem", {
        p_token: mitToken(), p_navn: navn, p_handling: handling + " (" + varighed + ")", p_grund: grund || "", p_ids: ids
      }).then(function () {
        const ikon = { Advarsel: "⚠️", Mute: "🔇", Frys: "🧊", Ban: "⛔" }[handling] || "⚖️";
        serverKald("hv_staff_send", {
          p_token: mitToken(), p_til: "",
          p_tekst: "⚖️ Straf-rapport: " + navn + " fik " + ikon + " " + handling + " (" + varighed + ")" +
            (grund ? " for " + grund : "") + ", med " + ids.length + (ids.length === 1 ? " bevis" : " beviser") +
            ". Se fanen ⚖️ Straf-rapporter."
        }).catch(function () {});
        sidstHentet = 0;
        besked.textContent = "⚖️ " + handling + " til " + navn + " er givet, og straf-rapporten med " + ids.length +
          (ids.length === 1 ? " bevis" : " beviser") + " er gemt.";
        visFane();
      }).catch(function (e) {
        godkendte[navn] = g;    // prøv igen næste gang
        besked.textContent = /hv_straf_rapport_gem|Could not find/i.test(e.message)
          ? "Straffen er givet, men straf-rapporten kunne ikke gemmes: kør database-50-straf-beviser.sql i Supabase."
          : "Straffen er givet, men straf-rapporten kunne ikke gemmes: " + e.message;
        visFane();
      });
    };
  }

  // -----------------------------------------------------------
  //  2) Fanen ⚖️ Straf-rapporter (ejeren og alle ansatte)
  // -----------------------------------------------------------
  const FANE = "strafrapporter";
  function giv() {
    if (typeof ROLLE_FANER === "undefined") return;
    Object.keys(ROLLE_FANER).forEach(function (r) {
      const l = ROLLE_FANER[r];
      if (l.indexOf(FANE) < 0) {
        const efter = l.indexOf("staffchat");
        if (efter >= 0) l.splice(efter + 1, 0, FANE); else l.push(FANE);
      }
    });
  }
  giv();
  setInterval(giv, 2000);

  if (typeof PANEL_HJAELP !== "undefined") {
    PANEL_HJAELP[FANE] = { titel: "⚖️ Straf-rapporter", tekst: "Alle straffe, der er givet med beviser fra chatloggen. Ejeren og alle ansatte kan se dem.",
      punkter: ["Ejeren og MOD sætter ✅ ved beskederne i 💬 Chatlogs og giver straffen derfra.", "Søg på en spillers navn for at se alt om dem."] };
  }

  const fane = document.createElement("button");
  fane.dataset.fane = FANE;
  fane.textContent = "⚖️ Straf-rapporter";
  fane.addEventListener("click", function () { ejerFane = FANE; visFane(); });
  const faner = document.getElementById("ejer-faner");
  const staffKnap = faner.querySelector('[data-fane="staffchat"]');
  if (staffKnap) staffKnap.after(fane); else faner.appendChild(fane);
  function synlig() { fane.hidden = !(typeof rolleMaa === "function" && minRolle() && rolleMaa(FANE)); }
  synlig();
  setInterval(synlig, 1000);

  function hentRapporter() {
    const token = mitToken();
    if (!token) return;
    sidstHentet = Date.now();
    serverKald("hv_straf_rapporter_hent", { p_token: token }).then(function (svar) {
      const nu = JSON.stringify(svar || []);
      const foer = JSON.stringify(rapporter || null);
      rapporter = svar || [];
      rapportFejl = "";
      if (nu !== foer && ejerFane === FANE && !ejerVindue.hidden && !skriverIPanel()) visFane();
    }).catch(function (e) {
      rapportFejl = /hv_straf_rapporter_hent|Could not find/i.test(e.message)
        ? "Straf-rapporterne er ikke slået til endnu. Kør database-50-straf-beviser.sql i Supabase."
        : e.message;
      if (ejerFane === FANE && !ejerVindue.hidden && !skriverIPanel()) visFane();
    });
  }
  setInterval(function () { if (!ejerVindue.hidden && ejerFane === FANE) hentRapporter(); }, 10000);

  const visFaneFoerStraf = visFane;
  visFane = function () {
    const min = ejerFane === FANE;
    if (min) ejerIndhold.innerHTML = "";
    visFaneFoerStraf();
    synlig();
    if (ejerVindue.hidden || !min) return;
    if (Date.now() - sidstHentet > 3000) hentRapporter();
    visRapportFane();
  };

  function visRapportFane() {
    const q = rapportSoeg.trim().toLowerCase();
    const alle = rapporter || [];
    const fundet = alle.filter(function (r) {
      return !q || [r.navn, r.af, r.grund, r.handling].join(" ").toLowerCase().indexOf(q) >= 0;
    });
    let html = "<div class='ejer-filtre'><label class='bred'>Søg (fx et navn)<input id='sr-soeg' type='text' value='" + rens(rapportSoeg) + "'></label></div>";
    if (rapportFejl) html += "<p class='tom'>" + rens(rapportFejl) + "</p>";
    else if (!rapporter) html += "<p class='tom'>Henter straf-rapporter …</p>";
    else {
      html += "<p class='ejer-antal'>" + fundet.length + (fundet.length === 1 ? " straf-rapport" : " straf-rapporter") + "</p>";
      html += fundet.length ? "<ul class='sr-liste'>" + fundet.map(function (r) {
        const beviser = r.beviser || [];
        return "<li class='sr-kort'><div class='sr-top'><b>" + rens(r.navn) + "</b> <span class='sr-handling'>" + rens(r.handling) + "</span>" +
          "<span class='sr-dato'>" + tidMedAar(r.tid) + " · givet af " + rens(r.af) + "</span>" +
          (erEjer() ? "<button type='button' class='lille' data-sr-slet='" + r.id + "'>🗑</button>" : "") + "</div>" +
          "<p>" + (r.grund ? "Grund: " + rens(r.grund) : "<i>ingen grund skrevet</i>") + "</p>" +
          "<details" + (beviser.length <= 5 ? " open" : "") + "><summary>🔎 " + beviser.length + (beviser.length === 1 ? " bevis" : " beviser") + "</summary>" +
          "<ul class='sr-beviser'>" + beviser.map(function (b) {
            return "<li><small>" + tidMedAar(b.tid) + " · " + rens(rumTekst(b.rum)) + "</small> <b>" + rens(b.navn) + ":</b> " + rens(b.tekst) + "</li>";
          }).join("") + "</ul></details></li>";
      }).join("") + "</ul>" : "<p class='tom'>Ingen straf-rapporter" + (q ? " passer til søgningen" : " endnu") + ".</p>";
    }
    ejerIndhold.insertAdjacentHTML("beforeend", html);

    const soeg = document.getElementById("sr-soeg");
    soeg.addEventListener("input", function () {
      rapportSoeg = soeg.value;
      const pos = soeg.selectionStart;
      visFane();
      const ny = document.getElementById("sr-soeg");
      if (ny) { ny.focus(); ny.setSelectionRange(pos, pos); }
    });
    // Slet: første tryk spørger "Er du sikker?", andet tryk sletter
    ejerIndhold.querySelectorAll("[data-sr-slet]").forEach(function (k) {
      k.addEventListener("click", function () {
        if (!k.classList.contains("sikker")) { k.classList.add("sikker"); k.textContent = "Er du sikker?"; return; }
        serverKald("hv_straf_rapport_slet", { p_token: mitToken(), p_id: +k.dataset.srSlet }).then(function () {
          rapporter = (rapporter || []).filter(function (r) { return r.id !== +k.dataset.srSlet; });
          visFane();
        }).catch(function (e) { besked.textContent = e.message; });
      });
    });
  }

  // -----------------------------------------------------------
  //  Udseende
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent =
    "#ejer-indhold .sb-td, #ejer-indhold .sb-th { width: 26px; text-align: center; }" +
    "#ejer-indhold .sb-td input { width: 16px; height: 16px; cursor: pointer; accent-color: #7a1f2b; }" +
    "#ejer-indhold tr.sb-valgt td { background: #fbeec9; }" +
    "#sb-bjaelke { margin: 8px 0 12px; padding: 10px 12px; border: 2px solid #c9a24a; border-radius: 10px; background: #fff8e6; color: #3a1a1e; }" +
    "#sb-bjaelke .sb-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }" +
    "#sb-bjaelke .sb-beviser { list-style: none; margin: 0 0 8px; padding: 0; max-height: 130px; overflow-y: auto; font-size: 13px; }" +
    "#sb-bjaelke .sb-beviser li { padding: 3px 0; border-bottom: 1px dashed #e6d3a8; }" +
    "#sb-bjaelke small, #ejer-indhold .sr-beviser small { color: #8a6a4c; }" +
    "#sb-bjaelke .sb-form { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: flex-end; }" +
    "#sb-bjaelke .sb-form label { display: flex; flex-direction: column; font-size: 12px; font-weight: bold; gap: 3px; }" +
    "#sb-bjaelke .sb-form label.tjek { flex-direction: row; align-items: center; }" +
    "#sb-bjaelke .sb-bred { flex: 1 1 180px; }" +
    "#sb-bjaelke .sb-knapper { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }" +
    "#sb-bjaelke .sb-knapper button { padding: 6px 12px; border-radius: 8px; border: 1px solid #b98d3b; background: #fff; cursor: pointer; font-weight: bold; }" +
    "#sb-bjaelke .sb-knapper button.roed { background: #7a1f2b; color: #fff; border-color: #5c1620; }" +
    "#sb-bjaelke .sb-svar { margin: 6px 0 0; color: #7a1f2b; min-height: 1em; }" +
    "#ejer-indhold .sb-sp-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 0 0 8px; font-size: 13px; }" +
    "#ejer-indhold .sb-sp-liste li label { display: flex; gap: 8px; align-items: flex-start; cursor: pointer; }" +
    "#ejer-indhold .sb-sp-liste li input { width: 16px; height: 16px; margin-top: 2px; flex: none; accent-color: #7a1f2b; }" +
    "#ejer-indhold .sb-sp-liste li.sb-valgt { background: #fbeec9; }" +
    "#ejer-indhold .sb-sp-liste li.sb-ok { background: #eef6e6; }" +
    "#ejer-indhold button:disabled { opacity: .5; cursor: default; }" +
    "#ejer-indhold .sb-godkendt { margin: 8px 0 12px; padding: 8px 12px; border: 2px solid #c9a24a; border-radius: 10px; background: #fff8e6; color: #3a1a1e; }" +
    "#ejer-indhold .sb-godkendt small { display: block; color: #8a6a4c; }" +
    "#ejer-indhold .sb-godkendt ul { list-style: none; margin: 6px 0; padding: 0; max-height: 140px; overflow-y: auto; font-size: 13px; }" +
    "#ejer-indhold .sb-godkendt li { display: block; padding: 3px 0; border-bottom: 1px dashed #e6d3a8; }" +
    "#ejer-indhold .sr-liste { list-style: none; margin: 0; padding: 0; }" +
    "#ejer-indhold .sr-kort { display: block; margin: 0 0 10px; padding: 10px 12px; border: 1px solid #e0c98f; border-radius: 10px; background: #fffaf0; }" +
    "#ejer-indhold .sr-top { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }" +
    "#ejer-indhold .sr-handling { background: #7a1f2b; color: #fff; border-radius: 8px; padding: 1px 8px; font-size: 12px; }" +
    "#ejer-indhold .sr-dato { color: #8a6a4c; font-size: 12px; flex: 1; }" +
    "#ejer-indhold .sr-kort p { margin: 6px 0; }" +
    "#ejer-indhold .sr-beviser { list-style: none; margin: 4px 0 0; padding: 0; font-size: 13px; }" +
    "#ejer-indhold .sr-beviser li { display: block; padding: 3px 0; border-bottom: 1px dashed #ead9b3; }";
  document.head.appendChild(stil);

  if (!ejerVindue.hidden && ejerFane === "chat") visFane();
})();
