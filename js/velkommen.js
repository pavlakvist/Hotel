// =============================================================
//  🛎 Min side — velkomstsiden man kommer til efter login
//  Profilkort, opslagstavle ("Hvad sker der?"), nyheder, venner
//  og en stor knap: "Tjek ind på HELLO VERA".
//  Henter alt fra serveren med hv_velkomst (database-30-velkomst.sql).
// =============================================================
const MS = {
  navn: aktivKonto(),
  data: null,
  harVelkomst: true,      // false, hvis database-30 ikke er kørt endnu
};

function $(id) { return document.getElementById(id); }
function tal(n) { return typeof n === "number" ? n.toLocaleString("da-DK") : "–"; }
function figurBillede(type) {
  return "billeder/figurer/" + (type === "dreng" ? "dreng" : "pige") + "-staa-ned.png";
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

// ----- Navnet og hilsenen med det samme -----
(function () {
  const time = new Date().getHours();
  const hilsen = time < 5 ? "God nat" : time < 10 ? "Godmorgen" : time < 17 ? "Goddag" : "Godaften";
  document.querySelector(".ms-hej h2").firstChild.textContent = hilsen + ", ";
  $("ms-navn").textContent = MS.navn || "";
  $("ms-hej-navn").textContent = MS.navn || "";
  $("ms-skriv-tekst").placeholder = "Hvad sker der, " + (MS.navn || "") + "?";
  // Alle "Tjek ind"-knapper tager navnet med ind i hotellet
  document.querySelectorAll("#ms-tjek-ind, .tjek-link").forEach(function (a) { a.href = hotelAdresse(); });
})();

// ----- Log ud -----
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
  try { d.online = await serverKald("hv_antal_online", {}); } catch (e) {}
  MS.data = d;
  visAlt();
}

function visAlt() {
  const d = MS.data;
  // profilkortet
  $("ms-navn").textContent = d.navn || MS.navn;
  $("ms-hej-navn").textContent = d.navn || MS.navn;
  $("ms-motto").textContent = d.motto ? "“" + d.motto + "”" : "";
  $("ms-glimt").textContent = tal(d.glimt);
  $("ms-stella").textContent = tal(d.stella);
  $("ms-antal-venner").textContent = d.venner ? d.venner.length : "–";
  $("ms-medlem").textContent = d.oprettet ? "Gæst siden " + new Date(d.oprettet).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }) : "";
  $("ms-figur").src = figurBillede(d.figur);
  $("ms-skriv-figur").src = figurBillede(d.figur);
  $("ms-online-tal").textContent = typeof d.online === "number" ? d.online : "–";
  visNyheder(d.nyheder);
  visVenner(d.venner);
  visOpslag(d.opslag);
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
  if (!opslag.length) { boks.appendChild(lav("p", "tom", "Ingen opslag endnu. Skriv det første!")); return; }
  const d = MS.data;
  opslag.forEach(function (o) {
    const kort = lav("article", "ms-kort opslag");
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
