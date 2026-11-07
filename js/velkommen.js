// =============================================================
//  🛎 Min side — velkomstsiden man kommer til efter login
//  Pavlas billede er selve siden; her gør vi det levende:
//  navn, Glimt/Stella, nyheder, dine mål, og vinduet med
//  Fællesskab (opslagstavle + venner), Nyheder, Profil og Indstillinger.
//  Henter alt fra serveren med hv_velkomst (database-30-velkomst.sql).
// =============================================================
const MS = {
  navn: aktivKonto(),
  data: null,
  harVelkomst: true,      // false, hvis database-30 ikke er kørt endnu
  hoej: 0,                // hvilken nyhed "Dagens højdepunkter" viser
};
const MS_TJEKKET_IND = "mit-hotel-har-tjekket-ind";
const MS_NYT_SET = "mit-hotel-nyt-set";

function $(id) { return document.getElementById(id); }
function tal(n) { return typeof n === "number" ? n.toLocaleString("da-DK") : "–"; }
function figurBillede(type) {
  return "billeder/figurer/" + (type === "pige" ? "pige" : "dreng") + "-staa-ned.png";
}
function siden(tid) {
  const s = Math.max(0, Math.round((Date.now() - tid) / 1000));
  if (s < 60) return "lige nu";
  const m = Math.round(s / 60);
  if (m < 60) return "for " + m + (m === 1 ? " minut" : " minutter") + " siden";
  const t = Math.round(m / 60);
  if (t < 24) return "for " + t + (t === 1 ? " time" : " timer") + " siden";
  const d = Math.round(t / 24);
  if (d < 7) return "for " + d + (d === 1 ? " dag" : " dage") + " siden";
  return new Date(tid).toLocaleDateString("da-DK", { day: "numeric", month: "long" });
}
function lav(tag, klasse, tekst) {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (tekst != null) el.textContent = tekst;
  return el;
}
function hent(noegle) { try { return localStorage.getItem(noegle); } catch (e) { return null; } }
function gem(noegle, v) { try { localStorage.setItem(noegle, v); } catch (e) {} }

// ----- Navnet med det samme, og alle "ind i hotellet"-steder får navnet med -----
$("ms-navn").textContent = MS.navn || "";
$("ms-ind-som").textContent = MS.navn || "";
$("ms-skriv-tekst").placeholder = "Hvad sker der, " + (MS.navn || "") + "?";
document.querySelectorAll(".tjek").forEach(function (a) {
  a.href = hotelAdresse();
  a.addEventListener("click", function () { gem(MS_TJEKKET_IND, "1"); });
});

// ----- Vinduet -----
const FANE_TITLER = { faellesskab: "Fællesskab", nyt: "Nyt fra hotellet", profil: "Min profil", indstillinger: "Indstillinger" };
function aabnVindue(fane) {
  document.querySelectorAll(".vindue-faner button").forEach(function (b) { b.classList.toggle("aktiv", b.dataset.fane === fane); });
  document.querySelectorAll(".fane").forEach(function (f) { f.hidden = f.dataset.fane !== fane; });
  $("ms-vindue-titel").textContent = FANE_TITLER[fane];
  $("ms-vindue-baggrund").hidden = false;
  if (fane === "nyt") markerNytSet();
}
function lukVindue() { $("ms-vindue-baggrund").hidden = true; }
document.querySelectorAll("[data-panel]").forEach(function (b) {
  b.addEventListener("click", function () { aabnVindue(b.dataset.panel); });
});
document.querySelectorAll(".vindue-faner button").forEach(function (b) {
  b.addEventListener("click", function () { aabnVindue(b.dataset.fane); });
});
$("ms-vindue-luk").addEventListener("click", lukVindue);
$("ms-vindue-baggrund").addEventListener("click", function (e) { if (e.target === this) lukVindue(); });
window.addEventListener("keydown", function (e) { if (e.key === "Escape") lukVindue(); });

// ----- Log ud (to klik) -----
$("ms-log-ud").addEventListener("click", function () {
  const k = this;
  if (!k.classList.contains("sikker")) {
    k.classList.add("sikker");
    k.textContent = "Er du sikker? Tryk igen";
    setTimeout(function () { k.classList.remove("sikker"); k.textContent = "🚪 Log ud"; }, 4000);
    return;
  }
  try { logUd(); } catch (e) {}
  location.href = "index.html";
});

// ----- Hent alt fra serveren -----
async function hentAlt() {
  const token = mitToken();
  if (!token) return;
  if (MS.harVelkomst) {
    try {
      MS.data = await serverKald("hv_velkomst", { p_token: token });
      visAlt();
      return;
    } catch (e) {
      if (/ikke logget ind/.test(e.message)) { logUd(); location.replace("index.html?login"); return; }
      if (!/function|schema|404/i.test(e.message)) return;   // fx intet internet: prøv igen om lidt
      MS.harVelkomst = false;     // database-30 er ikke kørt endnu: hent det, vi kan
    }
  }
  const d = MS.data || { navn: MS.navn, venner: null, opslag: null };
  try { const p = await serverKald("hv_penge_hent", { p_token: token, p_glimt: null, p_stella: null }); d.glimt = p.glimt; d.stella = p.stella; } catch (e) {}
  try { const k = await serverKald("hv_spillerkort", { p_token: token, p_navn: MS.navn }); if (k) { d.motto = k.motto; d.oprettet = k.oprettet; } } catch (e) {}
  try { d.nyheder = (await serverKald("hv_nyheder_hent", { p_token: token })).slice(-5).reverse(); } catch (e) {}
  MS.data = d;
  visAlt();
}

function visAlt() {
  const d = MS.data;
  const navn = d.navn || MS.navn;
  $("ms-navn").textContent = navn + (d.ejer ? " 👑" : "");
  $("ms-glimt").textContent = tal(d.glimt);
  $("ms-stella").textContent = tal(d.stella);
  // profil-vinduet
  $("ms-profil-navn").textContent = navn;
  $("ms-profil-motto").textContent = d.motto ? "“" + d.motto + "”" : "";
  $("ms-profil-glimt").textContent = tal(d.glimt);
  $("ms-profil-stella").textContent = tal(d.stella);
  $("ms-profil-venner").textContent = d.venner ? d.venner.length : "–";
  $("ms-profil-medlem").textContent = d.oprettet ? "Gæst siden " + new Date(d.oprettet).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }) : "";
  $("ms-profil-figur").src = figurBillede(d.figur);
  visMaal();
  visHoejdepunkt();
  visKlokke();
  visNyheder(d.nyheder);
  visVenner(d.venner);
  visOpslag(d.opslag);
}

// ----- Dine mål (i bogen) + baren på profilkortet -----
function visMaal() {
  const d = MS.data;
  const venner = d.venner ? d.venner.length : 0;
  const harOpslag = (d.opslag || []).some(function (o) { return o.hvem === d.navn; });
  const maal = [
    { tekst: "Besøg hotellet", klaret: hent(MS_TJEKKET_IND) === "1" },
    { tekst: "Skriv et opslag", klaret: harOpslag },
    { tekst: "Få 5 venner (" + Math.min(venner, 5) + "/5)", klaret: venner >= 5 },
    { tekst: "Skriv et motto", klaret: !!d.motto },
  ];
  const ul = $("ms-maal");
  ul.innerHTML = "";
  maal.forEach(function (m) {
    const li = lav("li", m.klaret ? "klaret" : "");
    li.appendChild(lav("span", "boks"));
    li.appendChild(lav("span", "tekst", m.tekst));
    ul.appendChild(li);
  });
  const klaret = maal.filter(function (m) { return m.klaret; }).length;
  $("ms-under").textContent = "Mål " + klaret + "/" + maal.length + (d.venner ? " · " + venner + (venner === 1 ? " ven" : " venner") : "");
  $("ms-bar").style.width = Math.round(klaret / maal.length * 100) + "%";
}

// ----- Dagens højdepunkter: hotellets nyheder, pilene skifter -----
function visHoejdepunkt() {
  const n = MS.data.nyheder || [];
  if (!n.length) { $("ms-hoej-titel").textContent = "Velkommen til HELLO VERA"; $("ms-hoej-under").textContent = "Tjek ind og sig hej!"; return; }
  MS.hoej = (MS.hoej + n.length) % n.length;
  const ny = n[MS.hoej];
  $("ms-hoej-titel").textContent = ny.titel;
  $("ms-hoej-under").textContent = ny.tekst || (ny.tid ? siden(ny.tid) : "");
}
$("ms-hoej-forrige").addEventListener("click", function () { if (MS.data) { MS.hoej--; visHoejdepunkt(); } });
$("ms-hoej-naeste").addEventListener("click", function () { if (MS.data) { MS.hoej++; visHoejdepunkt(); } });

// ----- Klokken: antal nyheder, du ikke har set endnu -----
function visKlokke() {
  const n = MS.data.nyheder || [];
  const set = Number(hent(MS_NYT_SET) || 0);
  const nye = n.filter(function (x) { return x.id > set; }).length;
  $("ms-klokke-tal").hidden = !nye;
  $("ms-klokke-tal").textContent = nye > 9 ? "9+" : nye;
}
function markerNytSet() {
  const n = (MS.data && MS.data.nyheder) || [];
  const maks = n.reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0);
  if (maks) gem(MS_NYT_SET, String(maks));
  if (MS.data) visKlokke();
}

// ----- Nyheder -----
function visNyheder(nyheder) {
  const ul = $("ms-nyheder");
  ul.innerHTML = "";
  if (!nyheder || !nyheder.length) { ul.appendChild(lav("li", "tom", "Ingen nyheder lige nu.")); return; }
  nyheder.forEach(function (n) {
    const li = lav("li");
    li.appendChild(lav("b", null, n.titel));
    if (n.tekst) li.appendChild(lav("p", null, n.tekst));
    li.appendChild(lav("small", null, (n.hvem ? n.hvem + " · " : "") + (n.tid ? siden(n.tid) : "")));
    ul.appendChild(li);
  });
}

// ----- Venner -----
function visVenner(venner) {
  const ul = $("ms-venner");
  ul.innerHTML = "";
  if (!venner) { ul.appendChild(lav("li", "tom", "Vennelisten åbner snart.")); return; }
  if (!venner.length) { ul.appendChild(lav("li", "tom", "Du har ingen venner endnu. Find en gæst herunder, eller sig hej i velkomsthallen!")); return; }
  venner.forEach(function (v) {
    const li = lav("li", v.online ? "online" : "");
    const img = lav("img", "lille-figur"); img.src = figurBillede(v.figur); img.alt = "";
    li.appendChild(img);
    li.appendChild(lav("span", "venne-navn", v.navn));
    li.appendChild(lav("span", "venne-status", v.online ? "● online" : "offline"));
    ul.appendChild(li);
  });
}

// ----- Opslagstavlen -----
function visOpslag(opslag) {
  const boks = $("ms-opslag-liste");
  boks.innerHTML = "";
  if (!opslag) {
    boks.appendChild(lav("p", "tom", "📝 Opslagstavlen åbner snart."));
    $("ms-del").disabled = true;
    return;
  }
  $("ms-del").disabled = false;
  if (!opslag.length) { boks.appendChild(lav("p", "tom", "Ingen opslag endnu. Skriv det første!")); return; }
  const d = MS.data;
  opslag.forEach(function (o) {
    const kort = lav("article", "opslag");
    const top = lav("div", "opslag-top");
    const img = lav("img", "lille-figur"); img.src = figurBillede(o.figur); img.alt = "";
    top.appendChild(img);
    const hvem = lav("div", "opslag-hvem");
    hvem.appendChild(lav("b", null, o.hvem));
    hvem.appendChild(lav("small", null, siden(o.tid)));
    top.appendChild(hvem);
    if (o.hvem === d.navn || d.ejer || d.mod) {
      const slet = lav("button", "opslag-slet", "🗑");
      slet.type = "button";
      slet.title = "Slet opslaget";
      slet.addEventListener("click", function () { sletOpslag(o.id, slet); });
      top.appendChild(slet);
    }
    kort.appendChild(top);
    kort.appendChild(lav("p", "opslag-tekst", o.tekst));
    boks.appendChild(kort);
  });
}

async function sletOpslag(id, knap) {
  if (!knap.classList.contains("sikker")) {
    knap.classList.add("sikker");
    knap.textContent = "Er du sikker?";
    setTimeout(function () { knap.classList.remove("sikker"); knap.textContent = "🗑"; }, 4000);
    return;
  }
  try { await serverKald("hv_opslag_slet", { p_token: mitToken(), p_id: id }); } catch (e) {}
  hentAlt();
}

// skriv et opslag
const skrivTekst = $("ms-skriv-tekst");
skrivTekst.addEventListener("input", function () { $("ms-skriv-tegn").textContent = skrivTekst.value.length + "/200"; });
document.querySelectorAll(".skriv-smileys button").forEach(function (b) {
  b.addEventListener("click", function () {
    if (skrivTekst.value.length + b.dataset.s.length > 200) return;
    skrivTekst.value += b.dataset.s;
    skrivTekst.dispatchEvent(new Event("input"));
    skrivTekst.focus();
  });
});
$("ms-del").addEventListener("click", async function () {
  const tekst = skrivTekst.value.trim();
  const fejl = $("ms-skriv-fejl");
  fejl.textContent = "";
  if (!tekst) { fejl.textContent = "Skriv noget først."; return; }
  this.disabled = true;
  try {
    await serverKald("hv_opslag_send", { p_token: mitToken(), p_tekst: tekst });
    skrivTekst.value = "";
    skrivTekst.dispatchEvent(new Event("input"));
    await hentAlt();
  } catch (e) { fejl.textContent = e.message; }
  this.disabled = false;
});

// ----- Find en gæst -----
$("ms-soeg").addEventListener("submit", async function (e) {
  e.preventDefault();
  const svar = $("ms-soeg-svar");
  const navn = $("ms-soeg-navn").value.trim();
  svar.innerHTML = "";
  if (!navn) return;
  let alle = [];
  try { alle = await serverKald("hv_alle_spillere", { p_token: mitToken() }); }
  catch (fejl) { svar.textContent = fejl.message; return; }
  const fundet = alle.filter(function (s) { return s.navn.toLowerCase().indexOf(navn.toLowerCase()) >= 0; }).slice(0, 6);
  if (!fundet.length) { svar.appendChild(lav("p", "tom", "Ingen gæst hedder sådan.")); return; }
  const venner = (MS.data && MS.data.venner || []).map(function (v) { return v.navn; });
  fundet.forEach(function (s) {
    const r = lav("div", "soeg-raekke" + (s.online ? " online" : ""));
    r.appendChild(lav("span", "venne-navn", s.navn));
    r.appendChild(lav("span", "venne-status", s.online ? "● online" : "offline"));
    if (s.navn !== MS.navn && venner.indexOf(s.navn) < 0) {
      const b = lav("button", "link-knap", "➕ Tilføj ven");
      b.type = "button";
      b.addEventListener("click", async function () {
        try {
          const ud = await serverKald("hv_ven_tilfoej", { p_token: mitToken(), p_navn: s.navn });
          b.replaceWith(lav("span", "venne-status", ud && ud.status === "venner" ? "💚 I er venner" : "✉ Anmodning sendt"));
          hentAlt();
        } catch (fejl) { b.replaceWith(lav("span", "venne-status", fejl.message)); }
      });
      r.appendChild(b);
    } else if (s.navn !== MS.navn) {
      r.appendChild(lav("span", "venne-status", "💚 Ven"));
    }
    svar.appendChild(r);
  });
});

hentAlt();
setInterval(hentAlt, 20000);
