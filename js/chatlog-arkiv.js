// =============================================================
//  📚 Chat-arkiv i Ejerpanel → 💬 Chatlogs
//  Alt hvad der bliver skrevet højt i rummene, gemmes for altid på serveren
//  (database-49-chat-arkiv.sql). Her kan ejeren og MOD søge i det hele,
//  også mange år tilbage: på spiller, rum, dato og ord.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================
(function () {
  if (typeof visEjerChatlog !== "function" || typeof serverKald !== "function") return;

  const SIDE = 200;   // så mange beskeder hentes ad gangen
  const arkiv = {
    noegle: null,     // hvilken søgning linjerne hører til
    linjer: [],       // nyeste først
    flere: false,     // findes der ældre beskeder end dem, vi har hentet?
    henter: false,
    sidst: 0,         // hvornår vi sidst spurgte serveren
    fejl: "",
    iAlt: 0,
    aeldste: null,
    rum: []
  };
  let ventTimer = null;

  function brugArkiv() {
    return typeof SERVER !== "undefined" && SERVER.til && !!mitToken() &&
      typeof erModEllerEjer === "function" && erModEllerEjer() && !chatFilter.kunGrimme;
  }
  function filterNoegle() {
    return JSON.stringify([chatFilter.spiller, chatFilter.rum, chatFilter.dato, String(chatFilter.soeg || "").trim()]);
  }
  // Dato MED årstal, fordi beskederne kan være flere år gamle
  function tidMedAar(t) {
    return new Date(t).toLocaleString("da-DK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function datoMedAar(t) {
    return new Date(t).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
  }

  // Spørg serveren. aeldre = true henter de næste (ældre) beskeder under dem, vi allerede har.
  function hent(aeldre) {
    const noegle = filterNoegle();
    const token = mitToken();
    if (!token) return;
    const foer = aeldre && arkiv.linjer.length ? arkiv.linjer[arkiv.linjer.length - 1].id : null;
    arkiv.henter = true;
    arkiv.sidst = Date.now();
    serverKald("hv_chatlog_soeg", {
      p_token: token,
      p_navn: chatFilter.spiller || null,
      p_rum: chatFilter.rum || null,
      p_dato: chatFilter.dato || null,
      p_soeg: String(chatFilter.soeg || "").trim() || null,
      p_foer: foer,
      p_antal: SIDE
    }).then(function (svar) {
      if (noegle !== filterNoegle()) return;   // man har ændret søgningen imens
      const nye = (svar && svar.linjer) || [];
      if (aeldre) {
        arkiv.linjer = arkiv.linjer.concat(nye);
        arkiv.flere = nye.length === SIDE;
      } else if (arkiv.noegle === noegle && arkiv.linjer.length > SIDE) {
        // samme søgning, men man har trykket "Vis ældre": behold de ældre, læg kun de nye ovenpå
        const kendt = {};
        arkiv.linjer.forEach(function (l) { kendt[l.id] = true; });
        arkiv.linjer = nye.filter(function (l) { return !kendt[l.id]; }).concat(arkiv.linjer);
      } else {
        arkiv.linjer = nye;
        arkiv.flere = nye.length === SIDE;
      }
      arkiv.noegle = noegle;
      arkiv.iAlt = svar.i_alt || 0;
      arkiv.aeldste = svar.aeldste || null;
      arkiv.rum = svar.rum || [];
      arkiv.fejl = "";
    }).catch(function (e) {
      arkiv.fejl = /hv_chatlog_soeg/.test(e.message) || /Could not find/i.test(e.message)
        ? "Chat-arkivet er ikke slået til endnu. Kør database-49-chat-arkiv.sql i Supabase."
        : e.message;
      arkiv.noegle = noegle;
    }).finally(function () {
      arkiv.henter = false;
      tegnIgen();
    });
  }

  // Tegn fanen igen, uden at man mister sin plads i søgefeltet
  function tegnIgen() {
    if (typeof ejerVindue === "undefined" || ejerVindue.hidden || ejerFane !== "chat") return;
    const aktiv = document.activeElement;
    const id = aktiv && ejerIndhold.contains(aktiv) ? aktiv.id : null;
    const pos = id && aktiv.setSelectionRange && aktiv.type === "text" ? aktiv.selectionStart : null;
    const rul = ejerIndhold.scrollTop;
    visFane();
    ejerIndhold.scrollTop = rul;
    if (id) {
      const ny = document.getElementById(id);
      if (ny) { ny.focus(); if (pos != null) ny.setSelectionRange(pos, pos); }
    }
  }

  const visChatlogFoerArkiv = visEjerChatlog;
  visEjerChatlog = function () {
    visChatlogFoerArkiv();
    if (!brugArkiv()) {
      if (chatFilter.kunGrimme) {
        const p = ejerIndhold.querySelector(".ejer-antal");
        if (p) p.insertAdjacentHTML("afterend", "<p class='tom'>\"Kun grimme ord\" søger kun i de sidste 1000 beskeder på denne computer.</p>");
      }
      return;
    }

    // Ny søgning? Vent et øjeblik (man skriver måske stadig), og spørg så serveren.
    // Samme søgning? Spørg igen højst hvert 5. sekund, så nye beskeder kommer med.
    const noegle = filterNoegle();
    if (noegle !== arkiv.noegle) {
      clearTimeout(ventTimer);
      ventTimer = setTimeout(function () { hent(false); }, 350);
    } else if (!arkiv.henter && Date.now() - arkiv.sidst > 5000) {
      hent(false);
    }

    // Spiller-listen: også spillere, der kun findes i arkivet
    const spillerValg = document.getElementById("cf-spiller");
    if (spillerValg) {
      const har = {};
      Array.prototype.forEach.call(spillerValg.options, function (o) { har[o.value] = true; });
      arkiv.linjer.forEach(function (l) {
        if (har[l.navn]) return;
        har[l.navn] = true;
        const o = document.createElement("option");
        o.value = o.textContent = l.navn;
        spillerValg.appendChild(o);
      });
      spillerValg.value = chatFilter.spiller || "";
    }

    // Rum-listen: alle rum, der nogensinde er skrevet i
    const valg = document.getElementById("cf-rum");
    if (valg) {
      const rum = arkiv.rum.slice();
      chatLog.forEach(function (l) { if (l.rum && rum.indexOf(l.rum) < 0) rum.push(l.rum); });
      if (chatFilter.rum && rum.indexOf(chatFilter.rum) < 0) rum.push(chatFilter.rum);
      valg.innerHTML = "<option value=''>Alle</option>" + rum.map(function (r) {
        return "<option value='" + rens(r) + "'" + (chatFilter.rum === r ? " selected" : "") + ">" + rens(rumNavn(r)) + "</option>";
      }).join("");
    }

    // Fjern den lokale liste (kun de sidste 1000 på denne computer) og vis arkivet i stedet
    ejerIndhold.querySelectorAll(".ejer-antal, .ejer-tabel, p.tom").forEach(function (el) { el.remove(); });

    const klar = arkiv.noegle === noegle;
    let html = "<p class='ejer-antal'>📚 <b>Chat-arkiv</b>: ";
    if (arkiv.fejl && klar) {
      html += rens(arkiv.fejl) + "</p>";
    } else if (!klar) {
      html += "søger …</p>";
    } else {
      html += arkiv.iAlt + " beskeder gemt i alt" +
        (arkiv.aeldste ? ", helt tilbage til " + datoMedAar(arkiv.aeldste) : "") +
        ". Viser " + arkiv.linjer.length + (arkiv.flere ? " (de nyeste)" : "") + ", der passer til søgningen.</p>";
    }

    if (klar && !arkiv.fejl) {
      html += "<table class='ejer-tabel'><thead><tr><th>Tid</th><th>Rum</th><th>Spiller</th><th>Besked</th></tr></thead><tbody>" +
        arkiv.linjer.map(function (l) {
          return "<tr data-id='" + l.id + "'><td>" + tidMedAar(l.tid) + "</td><td>" + rens(rumNavn(l.rum)) + "</td>" +
            "<td><a href='#' data-spiller='" + rens(l.navn) + "'>" + rens(l.navn) + "</a></td><td>" + rens(l.tekst) + "</td></tr>";
        }).join("") + "</tbody></table>" +
        (arkiv.linjer.length ? "" : "<p class='tom'>Ingen beskeder passer til søgningen.</p>") +
        (arkiv.flere ? "<p><button type='button' class='lille' id='ca-aeldre'" + (arkiv.henter ? " disabled" : "") + ">" +
          (arkiv.henter ? "Henter …" : "⬇️ Vis ældre beskeder") + "</button></p>" : "");
    }

    const filtre = ejerIndhold.querySelector(".ejer-filtre");
    if (filtre) filtre.insertAdjacentHTML("afterend", html);
    else ejerIndhold.insertAdjacentHTML("beforeend", html);

    spillerLinks();
    const knap = document.getElementById("ca-aeldre");
    if (knap) knap.addEventListener("click", function () {
      if (arkiv.henter) return;
      knap.disabled = true;
      knap.textContent = "Henter …";
      hent(true);
    });
  };

  // Står man allerede i Chatlogs-fanen, så vis arkivet med det samme
  tegnIgen();

  // ⚖️ Flueben ved beskeder + straf med beviser (js/straf-beviser.js) bygger videre på arkivet
  if (!document.querySelector("script[src^='js/straf-beviser.js']")) {
    const s = document.createElement("script");
    s.src = "js/straf-beviser.js?t=" + Date.now();
    document.body.appendChild(s);
  }
})();
