// =============================================================
//  🔄 Møbelbytte mellem spillere
//  Klik på en anden spiller i samme rum → 🔄 Byt møbler.
//  Den anden siger ja, og så åbner byttevinduet hos begge:
//   - Klik på et møbel fra Mine ting for at lægge det i byttet.
//   - Klik på et af dine møbler i byttet for at tage det ud igen.
//   - Begge trykker ✔ Godkend. Ændrer nogen noget, skal begge godkende igen.
//  Mens byttet står på, passer hotellets server på møblerne.
//  Først når begge har godkendt, bytter møblerne ejer, og det sker på én gang
//  på serveren (database-66-moebelbytte.sql), så ingen kan snyde.
//  Stopper byttet, får alle deres egne møbler tilbage i Mine ting.
//  Ejeren (og MOD) kan se hele bytte-loggen i Ejerpanel → 🪙 Penge → 🔄 Møbelbytte.
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================
(function () {
  if (window.MOEBELBYTTE_HENTET) return;
  window.MOEBELBYTTE_HENTET = true;
  if (typeof serverKald !== "function" || typeof SERVER === "undefined" || typeof lager === "undefined") return;

  const MAKS = 12;               // højst så mange møbler hver i et bytte
  const MB = {
    klar: true,                  // false, hvis database-66 ikke er kørt endnu
    aktiv: null,                 // byttet lige nu (fra serveren)
    invitationer: [],
    straf: "",
    sendt: null,                 // hvem jeg har inviteret (mens de tænker)
    travlt: false,               // venter på svar fra serveren
    senestSet: 0,                // id på det sidste afsluttede bytte, vi har sagt noget om
    sidst: "",
    rapport: false,
    soeg: ""
  };
  let henter = false, henterLev = false;

  function mig() { return String(FIGUR.navn || ""); }
  function erEjer() { return typeof EJERE !== "undefined" && EJERE.indexOf(mig()) >= 0; }
  function kanSeLog() { return erEjer() || (typeof erModEllerEjer === "function" && erModEllerEjer()); }
  function online() { return SERVER.til && typeof mitToken === "function" && !!mitToken(); }
  function rens(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function typeNavn(id) { const t = MOEBEL_TYPER[id]; return t ? t.navn : id; }
  function mangler(e) { return /Could not find|schema cache|does not exist|hv_bytte/i.test(e && e.message || ""); }
  function kald(fn, data) {
    return serverKald(fn, Object.assign({ p_token: mitToken() }, data || {})).catch(function (e) {
      if (mangler(e)) { MB.klar = false; throw new Error("Møbelbytte er ikke sat op endnu (database-66-moebelbytte.sql mangler)."); }
      throw e;
    });
  }
  function sig(tekst) {
    if (typeof besked !== "undefined" && besked) besked.textContent = tekst;
    toast.textContent = tekst;
    toast.hidden = false;
    clearTimeout(toast.ur);
    toast.ur = setTimeout(function () { toast.hidden = true; }, 6000);
  }
  function billede(type, str) {
    const t = MOEBEL_TYPER[type];
    if (t && typeof lavTingBillede === "function") return lavTingBillede(t, str);
    const s = document.createElement("span");
    s.className = "mb-ukendt";
    s.textContent = "📦";
    return s;
  }
  // Mine ting, samlet pr. slags: { type: antal }
  function mineTing() {
    const g = {};
    lager.forEach(function (t) { if (MOEBEL_TYPER[t.type]) g[t.type] = (g[t.type] || 0) + 1; });
    return g;
  }


  // -----------------------------------------------------------
  //  Vinduer og små bokse
  // -----------------------------------------------------------
  const toast = document.createElement("div");
  toast.id = "mb-toast";
  toast.hidden = true;
  document.body.appendChild(toast);

  const invBoks = document.createElement("div");
  invBoks.id = "mb-invitation";
  invBoks.hidden = true;
  document.body.appendChild(invBoks);

  const vindue = document.createElement("div");
  vindue.id = "mb-vindue";
  vindue.hidden = true;
  document.body.appendChild(vindue);


  // -----------------------------------------------------------
  //  Klik på en rigtig spiller: 🔄 Byt møbler
  // -----------------------------------------------------------
  function erRigtig(g) {
    if (typeof erRigtigSpiller === "function") return erRigtigSpiller(g);
    return typeof ANDRE_SPILLERE !== "undefined" && !!g && ANDRE_SPILLERE[g.navn] === g;
  }
  if (typeof aabnGaestMenu === "function") {
    const aabnGaestMenuFoerBytte = aabnGaestMenu;
    aabnGaestMenu = function (g) {
      aabnGaestMenuFoerBytte(g);
      if (!erRigtig(g) || !online() || g.erBot) return;
      knap("🔄 Byt møbler", function () { lukMinMenu(); inviter(g.navn); });
      // øverst under navnet, så den er nem at finde
      const k = minMenuKnapper.lastElementChild;
      if (k && minMenuKnapper.firstChild !== k) minMenuKnapper.insertBefore(k, minMenuKnapper.firstChild);
      placerMinMenu();
    };
  }

  function inviter(navn) {
    if (MB.aktiv) { visVindue(); sig("Du er allerede i gang med et bytte."); return; }
    kald("hv_bytte_inviter", { p_til: navn }).then(function () {
      MB.sendt = navn;
      sig("📨 Du har spurgt " + navn + ", om I skal bytte møbler. Venter på svar …");
      hent(true);
    }).catch(function (e) { sig("⚠️ " + e.message); });
  }


  // -----------------------------------------------------------
  //  Spørg serveren, hvad der sker (hvert 2. sekund i et bytte, ellers hvert 4.)
  // -----------------------------------------------------------
  function hent(tving) {
    if (!online() || !MB.klar || henter) return;
    henter = true;
    kald("hv_bytte_hent").then(function (svar) {
      henter = false;
      const foer = MB.aktiv;
      MB.aktiv = svar.aktiv && svar.aktiv.status === "aaben" ? svar.aktiv : null;
      MB.sendt = svar.aktiv && svar.aktiv.status === "inviteret" ? svar.aktiv.med : null;
      MB.invitationer = svar.invitationer || [];
      MB.straf = svar.straf || "";
      // et bytte er lige slut: fortæl hvordan det gik
      const s = svar.senest;
      if (s && s.id !== MB.senestSet) {
        MB.senestSet = s.id;
        if (!MB.foersteGang) slutBesked(s);
      }
      MB.foersteGang = false;
      if (svar.leveringer > 0) hentLeveringer();
      const nyt = JSON.stringify([MB.aktiv, MB.invitationer, MB.sendt, MB.straf]);
      if (nyt !== MB.sidst || tving) {
        MB.sidst = nyt;
        if (MB.aktiv && (!foer || foer.id !== MB.aktiv.id)) { MB.rapport = false; MB.soeg = ""; vindue.hidden = false; }
        if (!MB.aktiv) vindue.hidden = true;
        visVindue();
        visMini();
        visInvitation();
      }
    }).catch(function () { henter = false; });
  }
  function slutBesked(s) {
    // det var mig selv, der sagde nej eller stoppede: det ved jeg allerede
    if ((s.status === "afvist" || s.status === "udloebet") && !s.jeg_fra) return;
    if (s.status === "annulleret" && s.stoppet_af && s.stoppet_af.toLowerCase() === mig().toLowerCase()) return;
    let t = "";
    if (s.status === "byttet") t = "🎉 Byttet med " + s.med + " er gennemført! Det, du fik, ligger i Mine ting 📦";
    else if (s.status === "afvist") t = "🙅 " + s.med + " sagde nej tak til at bytte.";
    else if (s.status === "udloebet") t = "⌛ " + s.med + " svarede ikke på din invitation.";
    else t = "↩ Byttet med " + s.med + " blev stoppet" + (s.grund ? " (" + s.grund + ")" : "") + ". Du har fået dine møbler tilbage.";
    sig(t);
    if (s.status === "byttet") {
      if (typeof svaev === "function") { try { svaev("🤝", figur); } catch (e) {} }
      if (typeof spilPling === "function") spilPling();
    }
  }
  // første gang: husk det seneste, så vi ikke siger noget om gamle bytter
  MB.foersteGang = true;
  let taeller = 0;
  setInterval(function () {
    taeller++;
    if (MB.aktiv || MB.sendt || MB.invitationer.length || taeller % 2 === 0) hent();
  }, 2000);
  setTimeout(function () { hent(true); }, 1500);


  // -----------------------------------------------------------
  //  📦 Møbler på vej til Mine ting (det man fik, eller fik tilbage)
  // -----------------------------------------------------------
  function hentLeveringer() {
    if (henterLev) return;
    henterLev = true;
    kald("hv_bytte_leveringer_hent").then(function (liste) {
      // kun møbler, spillet kender lige nu (nogle møbler hentes lidt senere; de kommer næste gang)
      const kendte = (liste || []).filter(function (l) { return MOEBEL_TYPER[l.type]; });
      if (!kendte.length) { henterLev = false; return; }
      return kald("hv_bytte_leveringer_kvit", { p_ids: kendte.map(function (l) { return l.id; }) }).then(function (ok) {
        henterLev = false;
        const hentet = {};
        (ok || []).forEach(function (id) { hentet[id] = true; });
        let fik = 0;
        kendte.forEach(function (l) { if (hentet[l.id]) { laegILager(l.type); fik++; } });
        if (fik && !MB.aktiv) sig("📦 " + fik + (fik === 1 ? " møbel" : " møbler") + " er kommet i Mine ting.");
        visVindue();
      });
    }).catch(function () { henterLev = false; });
  }


  // -----------------------------------------------------------
  //  Invitationen: "Anna vil bytte møbler med dig"
  // -----------------------------------------------------------
  function visInvitation() {
    const i = MB.aktiv ? null : MB.invitationer[0];
    if (!i) { invBoks.hidden = true; invBoks.dataset.id = ""; return; }
    if (invBoks.dataset.id === String(i.id) && !invBoks.hidden) return;
    invBoks.dataset.id = String(i.id);
    invBoks.innerHTML = "<div class='mb-top'><b>🔄 Møbelbytte</b></div>" +
      "<p><b>" + rens(i.fra) + "</b> vil gerne bytte møbler med dig.</p>" +
      "<p class='mb-lille'>I lægger begge møbler fra Mine ting i et byttevindue. Intet sker, før I begge har trykket ✔ Godkend.</p>" +
      "<div class='mb-knapper'><button type='button' class='mb-lys' data-mb-nej>✕ Nej tak</button><button type='button' data-mb-ja>✔ Ja, lad os bytte</button></div>";
    invBoks.hidden = false;
    if (typeof spilPling === "function") spilPling();
    invBoks.querySelector("[data-mb-ja]").addEventListener("click", function () { svar(i, true); });
    invBoks.querySelector("[data-mb-nej]").addEventListener("click", function () { svar(i, false); });
  }
  function svar(i, ja) {
    invBoks.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
    kald("hv_bytte_svar", { p_id: i.id, p_ja: ja }).then(function () {
      invBoks.hidden = true;
      if (!ja) sig("Du sagde nej tak til at bytte med " + i.fra + ".");
      hent(true);
    }).catch(function (e) {
      invBoks.hidden = true;
      sig("⚠️ " + e.message);
      hent(true);
    });
  }


  // -----------------------------------------------------------
  //  Byttevinduet
  // -----------------------------------------------------------
  function visVindue() {
    const b = MB.aktiv;
    if (!b || vindue.hidden) return;
    // skriver man i rapport-feltet? Så tegnes det ikke om
    const a = document.activeElement;
    if (a && vindue.contains(a) && /INPUT|TEXTAREA/.test(a.tagName)) { opdaterKnapper(); return; }
    const har = mineTing();
    const soeg = MB.soeg.trim().toLowerCase();
    const typer = Object.keys(har).filter(function (t) { return !soeg || typeNavn(t).toLowerCase().indexOf(soeg) >= 0; })
      .sort(function (x, y) { return typeNavn(x).localeCompare(typeNavn(y), "da", { numeric: true }); });

    vindue.innerHTML =
      "<div class='mb-top'><b>🔄 Møbelbytte med " + rens(b.med) + "</b><button type='button' class='mb-luk' title='Gør lille (byttet fortsætter)'>–</button></div>" +
      "<div class='mb-sider'>" +
        side("Du giver", b.mine, b.jeg_ok, true) +
        "<div class='mb-pil'>⇄</div>" +
        side(rens(b.med) + " giver", b.hans, b.han_ok, false) +
      "</div>" +
      "<p class='mb-hjaelp'>" + hjaelpTekst(b) + "</p>" +
      "<div class='mb-lager'><div class='mb-lager-top'><b>📦 Mine ting</b><input type='text' id='mb-soeg' placeholder='🔍 Søg …' value='" + rens(MB.soeg) + "'></div>" +
        "<div class='mb-gitter' id='mb-lager'></div></div>" +
      (MB.rapport ? "<div class='mb-rapport'><b>🚩 Rapportér " + rens(b.med) + "</b>" +
        "<select id='mb-r-grund'><option>Snyd eller svindel i et bytte</option><option>Presser mig til at bytte</option><option>Grimt sprog</option><option>Andet</option></select>" +
        "<textarea id='mb-r-tekst' maxlength='500' placeholder='Fortæl kort, hvad der skete …'></textarea>" +
        "<div class='mb-knapper'><button type='button' class='mb-lys' data-mb-r-luk>Fortryd</button><button type='button' data-mb-r-send>🚩 Send rapport</button></div></div>" : "") +
      "<div class='mb-knapper mb-bund'>" +
        "<button type='button' class='mb-lys' data-mb-stop>✕ Stop byttet</button>" +
        "<button type='button' class='mb-lys' data-mb-rapporter title='Rapportér til de ansatte'>🚩</button>" +
        "<button type='button' class='mb-godkend" + (b.jeg_ok ? " ok" : "") + "' data-mb-ok>" + (b.jeg_ok ? "↩ Fortryd godkendelse" : "✔ Godkend byttet") + "</button>" +
      "</div>";

    // mine møbler i byttet: klik = tag ud igen
    vindue.querySelectorAll("[data-mb-ting]").forEach(function (k) {
      const t = b.mine.find(function (x) { return String(x.id) === k.dataset.mbTing; });
      if (!t) return;
      k.insertBefore(billede(t.type, 52), k.firstChild);
      k.addEventListener("click", function () { tagUd(t); });
    });
    vindue.querySelectorAll("[data-mb-hans]").forEach(function (k) {
      const t = b.hans.find(function (x) { return String(x.id) === k.dataset.mbHans; });
      if (t) k.insertBefore(billede(t.type, 52), k.firstChild);
    });

    // Mine ting
    const gitter = vindue.querySelector("#mb-lager");
    if (!typer.length) gitter.innerHTML = "<p class='mb-tom'>" + (soeg ? "Ingen møbler hedder sådan." : "Du har ingen møbler i Mine ting.") + "</p>";
    typer.forEach(function (t) {
      const k = document.createElement("button");
      k.type = "button";
      k.className = "mb-ting";
      k.title = "Læg " + typeNavn(t) + " i byttet";
      k.appendChild(billede(t, 52));
      const n = document.createElement("span");
      n.textContent = typeNavn(t);
      k.appendChild(n);
      if (har[t] > 1) { const i = document.createElement("i"); i.textContent = "×" + har[t]; k.appendChild(i); }
      k.addEventListener("click", function () { laegI(t); });
      gitter.appendChild(k);
    });

    const soegFelt = vindue.querySelector("#mb-soeg");
    soegFelt.addEventListener("input", function () {
      MB.soeg = soegFelt.value;
      const pos = soegFelt.selectionStart;
      soegFelt.blur();
      visVindue();
      const ny = vindue.querySelector("#mb-soeg");
      if (ny) { ny.focus(); try { ny.setSelectionRange(pos, pos); } catch (e) {} }
    });
    vindue.querySelector(".mb-luk").addEventListener("click", function () { vindue.hidden = true; visMini(); });
    vindue.querySelector("[data-mb-stop]").addEventListener("click", stop);
    vindue.querySelector("[data-mb-ok]").addEventListener("click", godkend);
    vindue.querySelector("[data-mb-rapporter]").addEventListener("click", function () { MB.rapport = !MB.rapport; visVindue(); });
    if (MB.rapport) {
      vindue.querySelector("[data-mb-r-luk]").addEventListener("click", function () { MB.rapport = false; visVindue(); });
      vindue.querySelector("[data-mb-r-send]").addEventListener("click", sendRapport);
    }
    opdaterKnapper();
    visMini();
  }
  function side(titel, ting, ok, mine) {
    let html = "<div class='mb-side" + (ok ? " ok" : "") + "'><div class='mb-side-top'><b>" + titel + "</b>" +
      "<span class='mb-maerke'>" + (ok ? "✔ Godkendt" : "⏳ Ikke godkendt") + "</span></div><div class='mb-gitter mb-tilbud'>";
    if (!ting.length) html += "<p class='mb-tom'>" + (mine ? "Klik på et møbel nedenfor for at lægge det her." : "Intet endnu …") + "</p>";
    ting.forEach(function (t) {
      html += "<button type='button' class='mb-ting" + (mine ? " min" : "") + "' " + (mine ? "data-mb-ting" : "data-mb-hans") + "='" + t.id + "'" +
        (mine ? " title='Klik for at tage " + rens(typeNavn(t.type)) + " ud igen'" : " disabled") + "><span>" + rens(typeNavn(t.type)) + "</span></button>";
    });
    return html + "</div><small class='mb-antal'>" + ting.length + " af " + MAKS + "</small></div>";
  }
  function hjaelpTekst(b) {
    if (MB.straf) return "⛔ Du er " + rens(MB.straf) + " og kan ikke bytte lige nu.";
    if (b.jeg_ok && b.han_ok) return "🤝 Bytter …";
    if (b.jeg_ok) return "✔ Du har godkendt. Venter på, at " + rens(b.med) + " også godkender.";
    if (b.han_ok) return "✔ " + rens(b.med) + " har godkendt. Kig efter, og tryk ✔ Godkend byttet, hvis du er glad for det.";
    return "Læg møbler i byttet, og kig godt efter, hvad du får. Ændrer nogen noget, skal I begge godkende igen.";
  }
  function opdaterKnapper() {
    vindue.querySelectorAll(".mb-knapper button, .mb-ting.min, .mb-lager .mb-ting").forEach(function (k) {
      if (k.hasAttribute("data-mb-r-luk") || k.hasAttribute("data-mb-rapporter") || k.hasAttribute("data-mb-r-send")) return;
      k.disabled = MB.travlt;
    });
  }

  // Lille knap i hjørnet, når vinduet er gjort lille
  const mini = document.createElement("button");
  mini.type = "button";
  mini.id = "mb-mini";
  mini.hidden = true;
  document.body.appendChild(mini);
  mini.addEventListener("click", function () { vindue.hidden = false; visVindue(); visMini(); });
  function visMini() {
    mini.hidden = !MB.aktiv || !vindue.hidden;
    if (MB.aktiv) mini.textContent = "🔄 Bytte med " + MB.aktiv.med + (MB.aktiv.han_ok ? " · ✔" : "");
  }

  function travlt(til) { MB.travlt = til; opdaterKnapper(); }

  function laegI(type) {
    const b = MB.aktiv;
    if (!b || MB.travlt) return;
    if (b.mine.length >= MAKS) { sig("Du kan højst lægge " + MAKS + " møbler i et bytte."); return; }
    if (!lager.some(function (t) { return t.type === type; })) return;
    travlt(true);
    fraLager(type);                   // hotellet passer på møblet, så længe byttet står på
    kald("hv_bytte_laeg", { p_id: b.id, p_type: type }).then(function (id) {
      b.mine.push({ id: id, type: type });
      b.jeg_ok = false; b.han_ok = false;
      travlt(false);
      visVindue();
      hent(true);
    }).catch(function (e) {
      laegILager(type);               // det gik ikke: møblet kommer straks tilbage
      travlt(false);
      sig("⚠️ " + e.message);
      hent(true);
    });
  }
  function tagUd(t) {
    const b = MB.aktiv;
    if (!b || MB.travlt) return;
    travlt(true);
    kald("hv_bytte_fjern", { p_id: b.id, p_ting: t.id }).then(function () {
      b.mine = b.mine.filter(function (x) { return x.id !== t.id; });
      travlt(false);
      hentLeveringer();               // møblet kommer tilbage i Mine ting
      hent(true);
    }).catch(function (e) { travlt(false); sig("⚠️ " + e.message); hent(true); });
  }
  function godkend() {
    const b = MB.aktiv;
    if (!b || MB.travlt) return;
    const ok = !b.jeg_ok;
    if (ok && !b.mine.length && !b.hans.length) { sig("Der er ingen møbler i byttet endnu."); return; }
    travlt(true);
    kald("hv_bytte_godkend", { p_id: b.id, p_ok: ok, p_version: b.version }).then(function (svar) {
      travlt(false);
      if (svar && svar.byttet) hentLeveringer();
      hent(true);
    }).catch(function (e) { travlt(false); sig("⚠️ " + e.message); hent(true); });
  }
  function stop() {
    const b = MB.aktiv;
    if (!b || MB.travlt) return;
    travlt(true);
    kald("hv_bytte_annuller", { p_id: b.id }).then(function () {
      travlt(false);
      MB.aktiv = null;
      vindue.hidden = true;
      visMini();
      sig("↩ Du stoppede byttet. Dine møbler kommer tilbage i Mine ting.");
      hentLeveringer();
      hent(true);
    }).catch(function (e) { travlt(false); sig("⚠️ " + e.message); hent(true); });
  }
  function sendRapport() {
    const b = MB.aktiv;
    if (!b) return;
    const grund = vindue.querySelector("#mb-r-grund").value;
    const tekst = vindue.querySelector("#mb-r-tekst").value.trim();
    const indhold = "Bytte #" + b.id + ". " + b.med + " lagde: " + (b.hans.map(function (t) { return typeNavn(t.type); }).join(", ") || "intet") +
      ". Jeg lagde: " + (b.mine.map(function (t) { return typeNavn(t.type); }).join(", ") || "intet") + ".";
    kald("hv_rapport_send", { p_hvem: b.med, p_grund: "🔄 Møbelbytte: " + grund, p_tekst: (tekst ? tekst + "\n\n" : "") + indhold,
      p_tid: new Date().toLocaleString("da-DK") }).then(function () {
      MB.rapport = false;
      visVindue();
      sig("🚩 Tak! Din rapport er sendt til de ansatte. Du kan stoppe byttet med ✕, hvis du vil.");
    }).catch(function (e) { sig("⚠️ " + e.message); });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !vindue.hidden) { vindue.hidden = true; visMini(); }
  });


  // -----------------------------------------------------------
  //  👑 Ejerpanel → 🪙 Penge → 🔄 Møbelbytte (ejeren og MOD)
  // -----------------------------------------------------------
  const LOG = { linjer: [], i_alt: 0, i_gang: 0, i_dag: 0, fejl: "", soeg: "", sidst: 0, henter: false };
  function giv() {
    if (typeof ROLLE_FANER !== "undefined" && ROLLE_FANER.mod && ROLLE_FANER.mod.indexOf("bytte") < 0) ROLLE_FANER.mod.push("bytte");
  }
  giv();
  const fane = document.createElement("button");
  fane.dataset.fane = "bytte";
  fane.textContent = "🔄 Møbelbytte";
  fane.addEventListener("click", function () { ejerFane = "bytte"; visFane(); hentLog(); });
  (function () {
    const faner = document.getElementById("ejer-faner");
    if (!faner) return;
    const efter = faner.querySelector('[data-fane="veksel"]') || faner.querySelector('[data-fane="valuta"]');
    if (efter) efter.after(fane); else faner.appendChild(fane);
  })();
  fane.hidden = !kanSeLog();
  setInterval(function () { giv(); fane.hidden = !kanSeLog(); }, 1500);
  if (typeof PANEL_HJAELP !== "undefined") PANEL_HJAELP.bytte = { titel: "🔄 Møbelbytte",
    tekst: "Her ser du alle møbelbytter mellem spillerne: hvem der byttede, hvad de gav, og hvordan det endte.",
    punkter: ["🟢 I gang: byttet står på lige nu. Du kan stoppe det med ⛔ Stop, så får begge deres egne møbler tilbage.",
      "🤝 Byttet: begge godkendte, og møblerne skiftede ejer.", "↩ Stoppet / 🙅 Nej tak / ⌛ Intet svar: ingen møbler skiftede ejer.",
      "Søg på et navn for at se alle bytter, en spiller har været med i.", "Rapporter fra byttevinduet kommer under 🚩 Rapporter med grunden \"🔄 Møbelbytte\"."] };

  function hentLog() {
    if (!online() || LOG.henter || !kanSeLog()) return;
    LOG.henter = true;
    LOG.sidst = Date.now();
    kald("hv_bytte_log", { p_navn: LOG.soeg.trim() || null, p_antal: 150 }).then(function (svar) {
      LOG.henter = false;
      LOG.fejl = "";
      LOG.linjer = svar.linjer || [];
      LOG.i_alt = svar.i_alt || 0; LOG.i_gang = svar.i_gang || 0; LOG.i_dag = svar.i_dag || 0;
      if (!ejerVindue.hidden && ejerFane === "bytte" && !(typeof skriverIPanel === "function" && skriverIPanel())) visFane();
    }).catch(function (e) {
      LOG.henter = false;
      LOG.fejl = e.message;
      if (!ejerVindue.hidden && ejerFane === "bytte") visFane();
    });
  }
  setInterval(function () {
    if (typeof ejerVindue !== "undefined" && !ejerVindue.hidden && ejerFane === "bytte" && Date.now() - LOG.sidst > 5000) hentLog();
  }, 1000);

  const STATUS = {
    inviteret: ["🟢", "Inviteret", "i-gang"], aaben: ["🟢", "I gang", "i-gang"], byttet: ["🤝", "Byttet", "byttet"],
    annulleret: ["↩", "Stoppet", "stop"], stoppet: ["⛔", "Stoppet af ansat", "stop"], afvist: ["🙅", "Nej tak", "stop"], udloebet: ["⌛", "Intet svar", "stop"]
  };
  function tid(ms) {
    return ms ? new Date(ms).toLocaleString("da-DK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  }
  function tingListe(liste) {
    if (!liste || !liste.length) return "<span class='mb-tom'>intet</span>";
    const t = {};
    liste.forEach(function (x) { t[x] = (t[x] || 0) + 1; });
    return Object.keys(t).map(function (x) {
      return "<span class='mb-log-ting' data-mb-type='" + rens(x) + "'>" + rens(typeNavn(x)) + (t[x] > 1 ? " ×" + t[x] : "") + "</span>";
    }).join("");
  }

  if (typeof visFane === "function") {
    const visFaneFoerBytte = visFane;
    visFane = function () {
      const min = typeof ejerFane !== "undefined" && ejerFane === "bytte";
      if (min) ejerIndhold.innerHTML = "";
      visFaneFoerBytte();
      if (ejerVindue.hidden || !min || !kanSeLog()) return;
      const hjaelp = ejerIndhold.querySelector(".pf-hjaelp");
      ejerIndhold.innerHTML = "";
      if (hjaelp) ejerIndhold.appendChild(hjaelp);
      const sek = document.createElement("div");
      sek.className = "mb-log";
      sek.innerHTML = "<h3>🔄 Møbelbytte</h3>" + (LOG.fejl ? "<p class='ejer-info'>⚠️ " + rens(LOG.fejl) + "</p>" : "") +
        "<div class='mb-log-tal'><div><b>" + LOG.i_gang + "</b><span>I gang nu</span></div><div><b>" + LOG.i_dag + "</b><span>Byttet i dag</span></div>" +
        "<div><b>" + LOG.i_alt + "</b><span>Byttet i alt</span></div></div>" +
        "<div class='mb-log-soeg'><input type='text' id='mb-log-soeg' placeholder='🔍 Søg på et navn …' value='" + rens(LOG.soeg) + "'><button type='button' id='mb-log-opdater'>↻ Opdatér</button></div>" +
        (LOG.linjer.length ? "<ul class='mb-log-liste'>" + LOG.linjer.map(function (l) {
          const st = STATUS[l.status] || ["", l.status, ""];
          const igang = l.status === "inviteret" || l.status === "aaben";
          return "<li class='mb-log-" + st[2] + "'><div class='mb-log-hoved'><b>#" + l.id + "</b> <span class='mb-log-status'>" + st[0] + " " + st[1] + "</span>" +
            "<span class='mb-log-tid'>" + tid(l.slut || l.oprettet) + (l.rum ? " · " + rens(l.rum) : "") + "</span>" +
            (igang ? "<button type='button' data-mb-stop-id='" + l.id + "'>⛔ Stop</button>" : "") + "</div>" +
            "<div class='mb-log-byt'><div><b>" + rens(l.fra) + "</b> gav " + tingListe(l.fra_ting) + "</div>" +
            "<div><b>" + rens(l.til) + "</b> gav " + tingListe(l.til_ting) + "</div></div>" +
            (l.grund && l.status !== "byttet" ? "<small>" + rens(l.grund) + "</small>" : "") + "</li>";
        }).join("") + "</ul>" : "<p class='ejer-info'>" + (LOG.henter || !LOG.sidst ? "Henter …" : "Ingen bytter endnu.") + "</p>");
      ejerIndhold.appendChild(sek);
      const soeg = sek.querySelector("#mb-log-soeg");
      let ur = null;
      soeg.addEventListener("input", function () {
        LOG.soeg = soeg.value;
        clearTimeout(ur);
        ur = setTimeout(hentLog, 400);
      });
      sek.querySelector("#mb-log-opdater").addEventListener("click", hentLog);
      sek.querySelectorAll("[data-mb-stop-id]").forEach(function (k) {
        k.addEventListener("click", function () {
          k.disabled = true;
          kald("hv_bytte_ejer_stop", { p_id: +k.dataset.mbStopId }).then(function () {
            if (typeof adminSkriv === "function") { try { adminSkriv("Stoppede møbelbytte #" + k.dataset.mbStopId); } catch (e) {} }
            hentLog();
          }).catch(function (e) { LOG.fejl = e.message; visFane(); });
        });
      });
    };
  }


  // -----------------------------------------------------------
  //  Udseende: vinrød, guld og creme
  // -----------------------------------------------------------
  const stil = document.createElement("style");
  stil.textContent = [
    "#mb-vindue { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 1200; width: min(640px, calc(100vw - 24px)); max-height: calc(100vh - 24px);",
    "  overflow: auto; background: #fff8ec; color: #3a1a14; border: 3px solid #d9a441; border-radius: 14px; box-shadow: 0 12px 40px rgba(40,0,10,.45); font-family: inherit; }",
    "#mb-vindue[hidden], #mb-invitation[hidden], #mb-toast[hidden], #mb-mini[hidden] { display: none; }",
    ".mb-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; background: linear-gradient(#8c2535, #6a1726); color: #ffe7b0; padding: 8px 12px; border-radius: 10px 10px 0 0; }",
    ".mb-top b { font-size: 15px; }",
    ".mb-luk { background: #ffe7b0; color: #6a1726; border: 0; border-radius: 6px; width: 28px; height: 26px; font-weight: bold; cursor: pointer; }",
    ".mb-sider { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; padding: 10px 12px 0; align-items: stretch; }",
    ".mb-pil { align-self: center; font-size: 26px; color: #b0802a; }",
    ".mb-side { background: #fff; border: 2px solid #eadcbc; border-radius: 10px; padding: 6px; display: flex; flex-direction: column; min-height: 150px; }",
    ".mb-side.ok { border-color: #3f9a4b; background: #f2fbf1; }",
    ".mb-side-top { display: flex; justify-content: space-between; align-items: center; gap: 4px; margin-bottom: 4px; font-size: 13px; }",
    ".mb-maerke { font-size: 11px; padding: 1px 6px; border-radius: 8px; background: #f1e6cf; white-space: nowrap; }",
    ".mb-side.ok .mb-maerke { background: #3f9a4b; color: #fff; }",
    ".mb-antal { text-align: right; opacity: .6; font-size: 11px; margin-top: auto; }",
    ".mb-gitter { display: grid; grid-template-columns: repeat(auto-fill, minmax(74px, 1fr)); gap: 5px; }",
    ".mb-tilbud { flex: 1; align-content: start; }",
    ".mb-ting { position: relative; background: #fffdf8; color: #3a1a14; border: 2px solid #eadcbc; border-radius: 8px; padding: 3px; display: flex; flex-direction: column;",
    "  align-items: center; gap: 1px; cursor: pointer; font: inherit; min-height: 78px; }",
    ".mb-ting:hover:not(:disabled) { border-color: #d9a441; background: #fff3d6; }",
    ".mb-ting.min:hover:not(:disabled) { border-color: #b8364a; background: #fde8ea; }",
    ".mb-ting:disabled { cursor: default; opacity: 1; }",
    ".mb-ting span { font-size: 10px; line-height: 1.15; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }",
    ".mb-ting i { position: absolute; top: 2px; right: 3px; background: #7a1f2e; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 10px; font-style: normal; }",
    ".mb-ting canvas { width: 52px; height: 52px; }",
    ".mb-ukendt { font-size: 30px; line-height: 52px; }",
    ".mb-tom { grid-column: 1 / -1; font-size: 12px; opacity: .65; margin: 6px 2px; }",
    ".mb-hjaelp { margin: 8px 12px; padding: 6px 10px; background: #f6ecd6; border-left: 4px solid #d9a441; border-radius: 6px; font-size: 13px; }",
    ".mb-lager { margin: 0 12px; border: 2px solid #eadcbc; border-radius: 10px; padding: 6px; background: #fbf3e2; }",
    ".mb-lager-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; }",
    ".mb-lager-top input { flex: 0 1 180px; padding: 4px 8px; border: 1px solid #d8c49b; border-radius: 6px; background: #fff; color: #3a1a14; }",
    ".mb-lager .mb-gitter { max-height: 190px; overflow: auto; }",
    ".mb-knapper { display: flex; gap: 8px; justify-content: flex-end; padding: 10px 12px; flex-wrap: wrap; }",
    ".mb-knapper button, #mb-invitation button { background: #7a1f2e; color: #ffe7b0; border: 2px solid #d9a441; border-radius: 8px; padding: 7px 12px; font: inherit; font-weight: bold; cursor: pointer; }",
    ".mb-knapper button.mb-lys, #mb-invitation button.mb-lys { background: #fff; color: #7a1f2e; border-color: #d8c49b; }",
    ".mb-knapper button:disabled { opacity: .55; cursor: wait; }",
    ".mb-bund { border-top: 1px solid #eadcbc; margin-top: 10px; }",
    ".mb-bund .mb-godkend { min-width: 170px; }",
    ".mb-bund .mb-godkend.ok { background: #3f9a4b; border-color: #2f7a39; color: #fff; }",
    ".mb-rapport { margin: 10px 12px 0; padding: 8px; border: 2px solid #e2a0a8; background: #fdeef0; border-radius: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }",
    ".mb-rapport select, .mb-rapport textarea { font: inherit; padding: 5px; border: 1px solid #d8c49b; border-radius: 6px; background: #fff; color: #3a1a14; }",
    ".mb-rapport textarea { min-height: 54px; resize: vertical; }",
    ".mb-rapport .mb-knapper { padding: 0; }",
    "#mb-invitation { position: fixed; right: 18px; bottom: 90px; z-index: 1201; width: 300px; max-width: calc(100vw - 32px); background: #fff8ec; color: #3a1a14;",
    "  border: 3px solid #d9a441; border-radius: 14px; box-shadow: 0 10px 30px rgba(40,0,10,.45); animation: mb-ind .25s ease-out; }",
    "#mb-invitation p { margin: 8px 12px; font-size: 14px; } #mb-invitation .mb-lille { font-size: 12px; opacity: .75; }",
    "#mb-invitation .mb-knapper { padding: 6px 12px 12px; flex-wrap: nowrap; } #mb-invitation .mb-knapper button { flex: 1; padding: 7px 6px; }",
    "@keyframes mb-ind { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }",
    "#mb-toast { position: fixed; left: 50%; top: 14px; transform: translateX(-50%); z-index: 1300; background: #7a1f2e; color: #ffe7b0; border: 2px solid #d9a441;",
    "  border-radius: 10px; padding: 8px 14px; font-weight: bold; box-shadow: 0 6px 20px rgba(0,0,0,.35); max-width: calc(100vw - 32px); text-align: center; }",
    "#mb-mini { position: fixed; right: 18px; bottom: 90px; z-index: 1199; background: #7a1f2e; color: #ffe7b0; border: 2px solid #d9a441; border-radius: 20px;",
    "  padding: 8px 14px; font: inherit; font-weight: bold; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,.35); }",
    // Ejerpanelet
    "#ejer-vindue #ejer-indhold .mb-log-tal { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 10px; }",
    "#ejer-vindue #ejer-indhold .mb-log-tal div { flex: 1; min-width: 100px; padding: 8px 10px; border-radius: 10px; background: rgba(122,31,46,.08); border: 1px solid rgba(217,164,65,.6); }",
    "#ejer-vindue #ejer-indhold .mb-log-tal b { display: block; font-size: 22px; } #ejer-vindue #ejer-indhold .mb-log-tal span { font-size: 12px; opacity: .75; }",
    "#ejer-vindue #ejer-indhold .mb-log-soeg { display: flex; gap: 6px; margin-bottom: 8px; } #ejer-vindue #ejer-indhold .mb-log-soeg input { flex: 1; }",
    "#ejer-vindue #ejer-indhold .mb-log-liste { list-style: none; padding: 0; margin: 0; }",
    "#ejer-vindue #ejer-indhold .mb-log-liste li { padding: 7px 8px; margin-bottom: 6px; border-radius: 8px; border-left: 5px solid #bbb; background: rgba(0,0,0,.035); }",
    "#ejer-vindue #ejer-indhold .mb-log-liste li.mb-log-byttet { border-left-color: #3f9a4b; }",
    "#ejer-vindue #ejer-indhold .mb-log-liste li.mb-log-i-gang { border-left-color: #d9a441; background: rgba(217,164,65,.12); }",
    "#ejer-vindue #ejer-indhold .mb-log-hoved { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; }",
    "#ejer-vindue #ejer-indhold .mb-log-tid { opacity: .65; font-size: 12px; flex: 1; }",
    "#ejer-vindue #ejer-indhold .mb-log-byt { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px; font-size: 12px; }",
    "#ejer-vindue #ejer-indhold .mb-log-ting { display: inline-block; margin: 2px 3px 0 0; padding: 1px 6px; border-radius: 8px; background: rgba(217,164,65,.25); }",
    "#ejer-vindue #ejer-indhold .mb-log-liste small { display: block; opacity: .7; margin-top: 3px; }",
    "@media (max-width: 520px) { .mb-sider { grid-template-columns: 1fr; } .mb-pil { justify-self: center; transform: rotate(90deg); } }"
  ].join("\n");
  document.head.appendChild(stil);
})();
