// =============================================================
//  Panel for ansatte 🛡️ (MOD og Eventvært)
//  - Giver ejeren nogen MOD-skiltet i Ansættelse, får de 🛡️-knappen med det samme,
//    men kun med fanerne Oversigt, Spillere og konti, Chatlogs, Private beskeder,
//    Rapporter og moderation, Administratorlog og Systemindstillinger.
//  - Eventværter får 🛡️-knappen med kun fanen Events og nyheder.
//  - Bliver de fyret, forsvinder knappen og panelet lukker med det samme.
//  - Straffe, rapporter, administratorlog, chatlogs og nyheder ligger på serveren,
//    så alle ser det samme. Serveren tjekker selv, hvem der må hvad.
//  (Kræver database-5-mod.sql. Indtil da virker det som før.)
// =============================================================
const ROLLE_FANER = {
  mod: ["oversigt", "spillere", "chat", "beskeder", "rapporter", "adminlog", "system"],
  eventvaert: ["events"]
};
const ROLLE_NAVN = { ejer: "🛡️ Ejerpanel", mod: "🛡️ Mod-panel", eventvaert: "🛡️ Eventvært-panel" };

// Hvad er jeg? "ejer", "mod", "eventvaert" eller null
function minRolle() {
  if (EJERE.indexOf(FIGUR.navn) >= 0) return "ejer";
  const skilt = ansatte[FIGUR.navn];
  return ROLLE_FANER[skilt] ? skilt : null;
}
function rolleMaa(fane) {
  const r = minRolle();
  return r === "ejer" || (!!r && ROLLE_FANER[r].indexOf(fane) >= 0);
}
function erModEllerEjer() { const r = minRolle(); return r === "ejer" || r === "mod"; }

// Sammenlign to ting, selvom nøglerne står i forskellig rækkefølge
function stabil(v) {
  if (Array.isArray(v)) return "[" + v.map(stabil).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ":" + stabil(v[k]); }).join(",") + "}";
  return JSON.stringify(v);
}
// Skriver man i panelet lige nu? Så tegnes det ikke om
function skriverIPanel() {
  const a = document.activeElement;
  return !!a && ejerIndhold.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName);
}
function tegnPanelIgen(faner) {
  if (!ejerVindue.hidden && faner.indexOf(ejerFane) >= 0 && !skriverIPanel()) visFane();
}


// -------------------------------------------------------------
//  🛡️-knappen kommer og går med det samme
// -------------------------------------------------------------
const panelTitel = document.querySelector("#ejer-vindue .ejer-top h2");
let sidsteRolle = "start";

function tjekRolle() {
  const rolle = minRolle();
  ejerKnap.hidden = !rolle;
  if (!rolle && !ejerVindue.hidden) {
    ejerVindue.hidden = true;
    besked.textContent = "Du har ikke længere adgang til panelet.";
  }
  if (rolle !== sidsteRolle) {
    sidsteRolle = rolle;
    if (panelTitel) panelTitel.textContent = ROLLE_NAVN[rolle] || ROLLE_NAVN.ejer;
    ejerKnap.title = rolle === "ejer" ? "Ejerpanel (mod tools)" : rolle ? ROLLE_NAVN[rolle].slice(3) : "";
    document.querySelectorAll("#ejer-faner button").forEach(function (k) {
      k.hidden = !rolleMaa(k.dataset.fane);
    });
    if (!ejerVindue.hidden) aabnTilladtFane();
  }
}
function aabnTilladtFane() {
  const r = minRolle();
  if (r && r !== "ejer" && ROLLE_FANER[r].indexOf(ejerFane) < 0) ejerFane = ROLLE_FANER[r][0];
  visFane();
}
tjekRolle();
setInterval(tjekRolle, 300);

// Ejerens egen knap-kode (i ejer.js) åbner kun for ejeren, så her åbner den for MOD og Eventvært
ejerKnap.addEventListener("click", function () {
  const r = minRolle();
  if (!r || r === "ejer") return;
  ejerVindue.hidden = !ejerVindue.hidden;
  if (!ejerVindue.hidden) { aabnTilladtFane(); hentModData(); }
});

// En fane, man ikke må se, kan ikke åbnes
const visFaneFoerRolle = visFane;
visFane = function () {
  if (!minRolle()) { ejerVindue.hidden = true; return; }
  if (!rolleMaa(ejerFane)) { const r = minRolle(); ejerFane = ROLLE_FANER[r][0]; }
  visFaneFoerRolle();
};

// Hvad står der ud for dig selv i spillerlisten?
const alleSpillereFoerRolle = alleSpillere;
alleSpillere = function () {
  const liste = alleSpillereFoerRolle();
  const r = minRolle();
  if (r && r !== "ejer") liste.forEach(function (s) { if (s.navn === FIGUR.navn) s.hvad = r === "mod" ? "MOD (dig)" : "Eventvært (dig)"; });
  return liste;
};

// MOD kan ikke skifte navn på folk og kan ikke straffe ejeren
const visSpillereFoerRolle = visSpillere;
visSpillere = function () {
  visSpillereFoerRolle();
  if (minRolle() === "ejer") return;
  const omdoeb = document.getElementById("sp-omdoeb");
  if (omdoeb) omdoeb.parentNode.remove();
  if (EJERE.indexOf(valgtSpiller) >= 0) {
    const straf = ejerIndhold.querySelector(".sp-straf");
    if (straf) {
      const p = document.createElement("p");
      p.className = "tom";
      p.textContent = "Hotellets ejer kan ikke straffes 😉";
      if (straf.previousElementSibling && straf.previousElementSibling.tagName === "H4") straf.previousElementSibling.remove();
      straf.replaceWith(p);
    }
  }
};

// Eventværter giver ikke nøgler, de laver kun nyheder
const visEventsFoerRolle = visEvents;
visEvents = function () {
  visEventsFoerRolle();
  if (minRolle() !== "ejer") ejerIndhold.querySelectorAll(".elev-noegler").forEach(function (s) { s.remove(); });
  // Eventværter kan også låse, åbne og gå ind i event-rummene herfra
  if (minRolle() === "eventvaert") {
    const nyheder = Array.prototype.slice.call(ejerIndhold.childNodes);
    henterEventRum = true;
    visSystem();
    henterEventRum = false;
    const sek = ejerIndhold.querySelector(".event-laase");
    ejerIndhold.replaceChildren.apply(ejerIndhold, nyheder);
    if (sek) ejerIndhold.appendChild(sek);
  }
};
// Når en Eventvært låser et rum, tegnes Events-fanen igen (ikke Systemindstillinger)
let henterEventRum = false;
const visSystemFoerRolle = visSystem;
visSystem = function () {
  if (minRolle() === "eventvaert" && !henterEventRum) { visFane(); return; }
  visSystemFoerRolle();
};


// -------------------------------------------------------------
//  Straffe på serveren: alle kan mærke dem, og alle kan se skiltet
// -------------------------------------------------------------
let straffeHentet = false;
const straffeServer = {};       // navn → sidst kendte udgave fra serveren
const straffeVenter = {};       // navne med ændringer, der er ved at blive sendt
let straffeTimer = null;

function hentStraffe() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_straffe_hent", { p_token: token }).then(function (svar) {
    straffeHentet = true;
    let aendret = false;
    Object.keys(svar || {}).forEach(function (n) {
      const s = stabil(svar[n]);
      if (straffeVenter[n] || straffeServer[n] === s) return;
      straffeServer[n] = s;
      sanktioner[n] = Object.assign({ bannet: false, timeoutTil: 0, historik: [], note: "" }, svar[n]);
      aendret = true;
    });
    if (aendret) {
      gemSanktionerFoerServer();
      tegnPanelIgen(["spillere", "oversigt"]);
    }
    tjekMinStraf();
  }).catch(function () {});    // database-5-mod.sql er ikke kørt endnu
}
hentStraffe();
setInterval(hentStraffe, 3000);

const gemSanktionerFoerServer = gemSanktioner;
gemSanktioner = function () {
  gemSanktionerFoerServer();
  if (!straffeHentet || !erModEllerEjer()) return;
  Object.keys(sanktioner).forEach(function (n) {
    if (erComputerGaest(n) || n === FIGUR.navn || EJERE.indexOf(n) >= 0) return;
    if (stabil(sanktioner[n]) !== straffeServer[n]) straffeVenter[n] = true;
  });
  // vent lidt, så en note ikke sendes for hvert bogstav
  clearTimeout(straffeTimer);
  straffeTimer = setTimeout(sendStraffe, 500);
};

function sendStraffe() {
  Object.keys(straffeVenter).forEach(function (n) {
    const d = sanktioner[n];
    // hvem gav den nyeste straf, og hvorfor (det kan den straffede selv se)
    const sidste = d.historik.filter(function (h) { return h.handling.indexOf("Ophævet") !== 0; }).pop();
    const advarsel = d.historik.filter(function (h) { return h.handling.indexOf("Advarsel") === 0; }).pop();
    if (advarsel) {
      d.advarselGrund = advarsel.grund || "";
      const m = /\((.*)\)$/.exec(advarsel.handling);
      d.advarselVarighed = m ? m[1] : "";
    }
    if (!d.fra || sidste && sidste.tid > (d.fraTid || 0)) { d.fra = FIGUR.navn; d.fraTid = sidste ? sidste.tid : Date.now(); }
    const s = stabil(d);
    serverKald("hv_straf_saet", { p_token: mitToken(), p_navn: n, p_data: d }).then(function () {
      straffeServer[n] = s;
      delete straffeVenter[n];
    }).catch(function (e) {
      delete straffeVenter[n];
      besked.textContent = e.message;
    });
  });
}

// Er jeg selv blevet straffet?
const SET_ADVARSEL_NOEGLE = "mit-hotel-set-server-advarsel";
let varFrosset = false;
function tjekMinStraf() {
  const mig = FIGUR.navn;
  if (EJERE.indexOf(mig) >= 0) return;
  const d = sanktioner[mig];
  if (!d) return;
  if (erBannet(mig)) {
    logUd();
    location.replace("index.html?login");
    return;
  }
  const frosset = erFrosset(mig);
  if (frosset && !varFrosset) {
    figur.rute = [];
    besked.textContent = "🧊 Du er frosset i " + tidTilbage(d.frysTil) + " og kan hverken gå eller skrive.";
  }
  varFrosset = frosset;
  if (erAdvaret(mig)) {
    let set = "";
    try { set = localStorage.getItem(SET_ADVARSEL_NOEGLE) || ""; } catch (e) {}
    if (set !== String(d.advarselTil) && advarselBoks.hidden) {
      try { localStorage.setItem(SET_ADVARSEL_NOEGLE, String(d.advarselTil)); } catch (e) {}
      visAdvarselPopup({ til: mig, fra: d.fra || "hotellet", grund: d.advarselGrund || "",
        varighed: d.advarselVarighed || tidTilbage(d.advarselTil), tid: d.advarselTil }, false);
    }
  }
}

// Timeout og frys: man kan ikke skrive
window.addEventListener("submit", function (e) {
  if (e.target !== chatForm || EJERE.indexOf(FIGUR.navn) >= 0 || !harTimeout(FIGUR.navn)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const d = sanktioner[FIGUR.navn];
  besked.textContent = erFrosset(FIGUR.navn)
    ? "🧊 Du er frosset i " + tidTilbage(d.frysTil) + " og kan ikke skrive."
    : "🔇 Du er mutet i " + tidTilbage(d.timeoutTil) + " og kan ikke skrive i chatten.";
}, true);

// Frys: man kan ikke gå
const gaaTilFoerFrys = gaaTil;
gaaTil = function (x, y, saede) {
  if (EJERE.indexOf(FIGUR.navn) < 0 && erFrosset(FIGUR.navn)) {
    figur.rute = [];
    besked.textContent = "🧊 Du er frosset i " + tidTilbage(sanktioner[FIGUR.navn].frysTil) + " og kan ikke gå.";
    return;
  }
  gaaTilFoerFrys(x, y, saede);
};


// -------------------------------------------------------------
//  Chatlogs, private beskeder, rapporter og administratorlog fra serveren
// -------------------------------------------------------------
let serverBeskeder = null, serverRapporter = null, serverAdminlog = null;
const setChat = {};
let sidsteModData = "";

function hentModData() {
  const token = mitToken();
  if (!SERVER.til || !token || !erModEllerEjer()) return;
  serverKald("hv_mod_data", { p_token: token }).then(function (svar) {
    // chat fra alle rum kommer med i chatloggen
    let nyChat = false;
    (svar.chat || []).forEach(function (c) {
      if (setChat[c.id]) return;
      setChat[c.id] = true;
      const findes = chatLog.some(function (l) {
        return l.sid === c.id || (l.navn === c.navn && l.tekst === c.tekst && Math.abs(l.tid - c.tid) < 15000);
      });
      if (findes) return;
      chatLog.push({ tid: c.tid, navn: c.navn, rum: c.rum, tekst: c.tekst, sid: c.id });
      nyChat = true;
    });
    if (nyChat) {
      chatLog.sort(function (a, b) { return a.tid - b.tid; });
      gemListe(LOG_NOEGLE, chatLog, MAKS_LOG);
    }
    serverBeskeder = svar.beskeder || [];
    serverRapporter = svar.rapporter || [];
    serverAdminlog = svar.adminlog || [];
    const nu = stabil([serverBeskeder, serverRapporter, serverAdminlog]);
    if (nyChat || nu !== sidsteModData) {
      sidsteModData = nu;
      tegnPanelIgen(["oversigt", "chat", "beskeder", "rapporter", "adminlog", "spillere"]);
      const nye = rapporter().filter(function (r) { return !r.behandlet; }).length;
      document.getElementById("ejer-rapport-tal").textContent = nye ? nye : "";
    }
  }).catch(function () {});
}
setInterval(function () { if (!ejerVindue.hidden) hentModData(); }, 4000);
setTimeout(hentModData, 2000);

// Rummenes navne i chatloggen
rumNavn = function (r) {
  if (r === "hal") return "Velkomsthallen";
  if (r === "vaerelse") return "Et værelse";
  if (typeof INDBYGGEDE_RUM !== "undefined" && INDBYGGEDE_RUM[r]) return INDBYGGEDE_RUM[r].navn || r;
  const ejer = String(r).split(":")[0];
  if (String(r).indexOf(":") > 0) return ejer + (/[sxz]$/i.test(ejer) ? "' rum" : "s rum");
  return String(r);
};

// Rum-filteret i Chatlogs viser alle rum, der er skrevet i
const visChatlogFoerServer = visEjerChatlog;
visEjerChatlog = function () {
  visChatlogFoerServer();
  const valg = document.getElementById("cf-rum");
  if (!valg) return;
  const rum = [];
  chatLog.forEach(function (l) { if (l.rum && rum.indexOf(l.rum) < 0) rum.push(l.rum); });
  valg.innerHTML = "<option value=''>Alle</option>" + rum.map(function (r) {
    return "<option value='" + rens(r) + "'" + (chatFilter.rum === r ? " selected" : "") + ">" + rens(rumNavn(r)) + "</option>";
  }).join("");
};

// Private beskeder: alle samtaler mellem rigtige spillere (+ dine egne med computer-gæster)
let valgtPar = null;
const visAlleBeskederFoerServer = visAlleBeskeder;
visAlleBeskeder = function () {
  if (!serverBeskeder) { visAlleBeskederFoerServer(); return; }
  const par = {};
  function linje(a, b, l) {
    const noegle = [a, b].sort().join(" ↔ ");
    if (!par[noegle]) par[noegle] = { navne: [a, b].sort(), linjer: [], advarsel: false };
    par[noegle].linjer.push(l);
    if (l.advarsel) par[noegle].advarsel = true;
  }
  serverBeskeder.forEach(function (m) {
    linje(m.fra, m.til, { fra: m.fra, tekst: m.tekst, tid: m.tid, advarsel: m.tekst.indexOf("⚠️ Advarsel") === 0 });
  });
  if (typeof beskeder !== "undefined") Object.keys(beskeder).forEach(function (n) {
    if (!erComputerGaest(n)) return;
    beskeder[n].linjer.forEach(function (l) { linje(FIGUR.navn, n, l); });
  });
  const noegler = Object.keys(par).sort(function (a, b) {
    const la = par[a].linjer, lb = par[b].linjer;
    return lb[lb.length - 1].tid - la[la.length - 1].tid;
  });
  if (!valgtPar || !par[valgtPar]) valgtPar = noegler[0] || null;
  let html = "<p class='ejer-antal'>Alle private beskeder på hotellet, også advarsler. Tryk på en samtale for at læse den.</p>" +
    "<div class='ejer-spillere'><aside><input id='pb-soeg' type='text' placeholder='Søg efter navn …'><ul id='pb-liste'>" + noegler.map(function (k) {
      return "<li><button data-par='" + rens(k) + "'" + (k === valgtPar ? " class='valgt'" : "") + ">" +
        (par[k].advarsel ? "⚠️ " : "💬 ") + rens(k) + " <small>(" + par[k].linjer.length + ")</small></button></li>";
    }).join("") + "</ul></aside><div class='sp-detaljer'>";
  let anden = null;
  if (!valgtPar) {
    html += "<p class='tom'>Ingen private beskeder endnu</p>";
  } else {
    const p = par[valgtPar];
    p.linjer.sort(function (a, b) { return a.tid - b.tid; });
    html += "<h3>" + rens(valgtPar) + "</h3><ul class='pb-samtale'>" + p.linjer.map(function (l) {
      return "<li class='" + (l.advarsel ? "advarsel" : l.fra === p.navne[0] ? "dem" : "mig") + "'><b>" + rens(l.fra) + "</b> " + rens(l.tekst) +
        "<span>" + tidTekst(l.tid) + "</span></li>";
    }).join("") + "</ul>";
    if (p.navne.indexOf(FIGUR.navn) >= 0) anden = p.navne[p.navne[0] === FIGUR.navn ? 1 : 0];
    if (anden) html += "<button id='pb-aabn' class='lv-knap'>✉️ Skriv til " + rens(anden) + "</button>";
  }
  ejerIndhold.innerHTML = html + "</div></div>";
  const aabn = document.getElementById("pb-aabn");
  if (aabn) aabn.addEventListener("click", function () { aabnBeskeder(anden); });
  ejerIndhold.querySelectorAll("[data-par]").forEach(function (k) {
    k.addEventListener("click", function () { valgtPar = k.dataset.par; visAlleBeskeder(); });
  });
  const soeg = document.getElementById("pb-soeg");
  soeg.addEventListener("input", function () {
    const q = soeg.value.toLowerCase();
    ejerIndhold.querySelectorAll("#pb-liste li").forEach(function (li) { li.hidden = li.textContent.toLowerCase().indexOf(q) < 0; });
  });
  const liste = ejerIndhold.querySelector(".pb-samtale");
  if (liste) liste.scrollTop = liste.scrollHeight;
};

// Rapporter: dem på serveren + gamle dem på denne computer
const rapporterFoerServer = rapporter;
rapporter = function () {
  const lokale = rapporterFoerServer().filter(function (r) { return !r.sid; });
  if (!serverRapporter) return lokale;
  return lokale.concat(serverRapporter.map(function (r) {
    return { sid: r.id, fra: r.fra, hvem: r.hvem, grund: r.grund, tekst: (r.tekst || "") + " (fra " + r.fra + ")",
      tid: r.tid, behandlet: r.behandlet, behandletTid: r.behandletTid };
  }));
};

// Nyheder og rapporter gemmes på serveren, når panelet gemmer dem
let nyhederHentet = false;
let serverNyheder = [];       // sidst kendte udgave fra serveren
const gemListeFoerServer = gemListe;
gemListe = function (noegle, liste, maks) {
  if (noegle === "mit-hotel-rapporter" && serverRapporter) {
    liste.forEach(function (r) {
      if (!r.sid) return;
      const s = serverRapporter.find(function (x) { return x.id === r.sid; });
      if (!s || !!s.behandlet === !!r.behandlet) return;
      s.behandlet = !!r.behandlet;
      s.behandletTid = r.behandlet ? Date.now() : null;
      serverKald("hv_rapport_behandl", { p_token: mitToken(), p_id: r.sid, p_behandlet: !!r.behandlet })
        .catch(function (e) { besked.textContent = e.message; });
    });
    liste = liste.filter(function (r) { return !r.sid; });
  }
  if (noegle === NYHED_NOEGLE && nyhederHentet) sendNyheder(liste);
  gemListeFoerServer(noegle, liste, maks);
};

function sendNyheder(liste) {
  const token = mitToken();
  liste.forEach(function (n) {
    if (n.sid || n.sender) {
      const s = serverNyheder.find(function (x) { return x.id === n.sid; });
      if (s && (s.banner !== false) !== (n.banner !== false)) {
        s.banner = n.banner !== false;
        serverKald("hv_nyhed_ret", { p_token: token, p_id: n.sid, p_banner: s.banner, p_slet: false })
          .catch(function (e) { besked.textContent = e.message; });
      }
      return;
    }
    n.sender = true;
    const data = { p_token: token, p_titel: n.titel, p_tekst: n.tekst || "", p_banner: n.banner !== false };
    if (n.stil) data.p_stil = n.stil;      // farve, pynt og dato (database-12-banner.sql)
    serverKald("hv_nyhed_send", data)
      .catch(function (e) {
        if (!data.p_stil) throw e;
        // database-12 er ikke kørt endnu: så sendes nyheden uden farve og pynt
        delete data.p_stil;
        return serverKald("hv_nyhed_send", data);
      })
      .then(function (id) { n.sid = id; delete n.sender; hentNyheder(); })
      .catch(function (e) { besked.textContent = e.message; });
  });
  serverNyheder.forEach(function (s) {
    if (liste.some(function (n) { return n.sid === s.id; })) return;
    s.slettet = true;
    serverKald("hv_nyhed_ret", { p_token: token, p_id: s.id, p_banner: null, p_slet: true }).catch(function () {});
  });
  serverNyheder = serverNyheder.filter(function (s) { return !s.slettet; });
}

function hentNyheder() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_nyheder_hent", { p_token: token }).then(function (svar) {
    nyhederHentet = true;
    if (nyheder.some(function (n) { return n.sender; })) return;     // en nyhed er på vej op
    const ny = (svar || []).map(function (n) { return { sid: n.id, titel: n.titel, tekst: n.tekst || "", tid: n.tid, banner: n.banner, hvem: n.hvem, stil: n.stil || null }; });
    if (stabil(ny) === stabil(nyheder)) return;
    serverNyheder = (svar || []).map(function (n) { return Object.assign({}, n); });
    nyheder.length = 0;
    ny.forEach(function (n) { nyheder.push(n); });
    gemListeFoerServer(NYHED_NOEGLE, nyheder);
    if (typeof visBanner === "function") visBanner();
    hallensBesked();
    tegnPanelIgen(["events"]);
  }).catch(function () {});
}
hentNyheder();
setInterval(hentNyheder, 4000);

// En rapport sendes til serveren, så ejeren og MOD kan se den
document.getElementById("rapport-form").addEventListener("submit", function () {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  const alle = hentListe(RAPPORT_NOEGLE);
  const r = alle[alle.length - 1];
  if (!r || r.sid) return;
  serverKald("hv_rapport_send", { p_token: token, p_hvem: r.hvem || "", p_grund: r.grund, p_tekst: r.tekst || "", p_tid: r.tid })
    .then(function () {
      gemListeFoerServer(RAPPORT_NOEGLE, hentListe(RAPPORT_NOEGLE).filter(function (x) { return x.tid !== r.tid; }));
      hentModData();
    }).catch(function () {});
});
// ... og man kan rapportere de rigtige spillere i rummet
const aabnRapportFoerServer = aabnRapport;
aabnRapport = function () {
  aabnRapportFoerServer();
  Object.values(ANDRE_SPILLERE).forEach(function (g) {
    if (g.rumId !== mitRumId()) return;
    if (Array.prototype.some.call(rapportHvem.options, function (o) { return o.textContent === g.navn; })) return;
    const o = document.createElement("option");
    o.textContent = g.navn;
    rapportHvem.appendChild(o);
  });
};

// Administratorloggen er fælles
const adminSkrivFoerServer = adminSkriv;
adminSkriv = function (hvad) {
  adminSkrivFoerServer(hvad);
  const token = mitToken();
  if (!SERVER.til || !token || !minRolle()) return;
  serverKald("hv_adminlog_skriv", { p_token: token, p_hvad: hvad }).then(hentModData).catch(function () {});
};
const visAdminlogFoerServer = visAdminlog;
visAdminlog = function () {
  if (!serverAdminlog) { visAdminlogFoerServer(); return; }
  const alle = serverAdminlog.slice();
  adminLog.forEach(function (a) {
    const findes = alle.some(function (s) { return s.hvem === a.hvem && s.hvad === a.hvad && Math.abs(s.tid - a.tid) < 60000; });
    if (!findes) alle.push(a);
  });
  alle.sort(function (a, b) { return a.tid - b.tid; });
  ejerIndhold.innerHTML = "<p class='ejer-antal'>Alt hvad ejeren og de ansatte har gjort i panelet.</p>" +
    liste(alle.slice(-300).reverse().map(function (a) {
      return "<b>" + rens(a.hvem) + "</b> " + rens(a.hvad) + "<span>" + tidTekst(a.tid) + "</span>";
    }), "Intet endnu");
};
