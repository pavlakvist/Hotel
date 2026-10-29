// =============================================================
//  Postkontoret ✉️ og postkasserne 📬
//  - Postkontoret er et fælles rum på stueetagen. Klik på skranken, den røde
//    postkasse eller knappen "✉️ Skriv et brev" for at skrive et brev.
//    Man vælger hvem det skal til, papirets farve, skrift, smileys og klistermærker.
//  - Brevet havner i modtagerens postkasse ude på gangen ved siden af deres lejlighedsdør.
//    På postkassen står ejerens navn. Klik på din egen postkasse for at læse dine breve.
//  - Navneskiltet på din lejlighedsdør kan du selv lave (tekst, farve og et lille tegn):
//    "🏠 Flyt / lås" i navigatøren eller "🪧 Mit navneskilt" i postkassen.
//  Kræver database-24-post.sql. Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================

// -------------------------------------------------------------
//  Rummet
// -------------------------------------------------------------
const POST_RUM = { id: "postkontor", navn: "Postkontoret", ejer: EJER_NAVNE[0], bredde: 12, dybde: 10,
  vaeg: "#7a2832", gulv1: "#ead9b4", gulv2: "#dcc69c", vaegHoejde: 230, doer: null };   // ingen dør: man kommer og går med elevatoren
INDBYGGEDE_RUM.postkontor = POST_RUM;
NAV_RUM.splice(2, 0, { id: "postkontor", etage: "stue", navn: "Postkontoret", om: "Skriv breve til de andre ✉️",
  billede: "billeder/rum/postkontor.png", maks: 30, rum: "vaerelse", vaerelse: "postkontor" });
function iPostkontoret() { return rumValg === "vaerelse" && aktivtVaerelse === "postkontor"; }

// Postkontoret har ingen møbler fra start (Pavla fik dem fjernet igen 29/10).
// POST_FJERNET er dem, der var sat ind: står de stadig samme sted, bliver de taget ud.
const POST_MOEBLER = [];
const POST_FJERNET = ["ny-spisebord,4,5", "ny-spisestol,4,4", "ny-spisestol,3,5", "ny-spisebord,8,5", "ny-spisestol,8,4", "ny-spisestol,7,5",
  "ny-sofa,8,8", "ny-sofabord,8,9", "ny-laenestol,7,9", "ny-laenestol,1,8", "test-laenestol,3,8", "ny-vitrine,11,4"];
function postUdenEkstra(liste) {
  return liste.filter(function (m) { return POST_FJERNET.indexOf(m.type + "," + m.x + "," + m.y) < 0; });
}
function postSomData() { return POST_MOEBLER.map(function (m) { return Object.assign({}, m); }); }
// Møblerne: det, der er gemt på denne computer, ellers hotellets egne
const vaerelseMoeblerFoerPost = vaerelseMoebler;
vaerelseMoebler = function (id) {
  if (id === "postkontor" && !andreVaerelser.postkontor) {
    let gemt = null;
    try { gemt = JSON.parse(localStorage.getItem("mit-hotel-rum-postkontor") || "null"); } catch (e) {}
    andreVaerelser.postkontor = (Array.isArray(gemt) ? postUdenEkstra(gemt) : postSomData()).filter(function (m) { return MOEBEL_TYPER[m.type]; });
  }
  return vaerelseMoeblerFoerPost(id);
};
// Har ingen bygget noget på postkontoret endnu, ser alle hotellets egne møbler (js/bygmester.js)
if (typeof serverKald === "function") {
  const serverKaldFoerPost = serverKald;
  serverKald = async function (funktion, data) {
    const svar = await serverKaldFoerPost(funktion, data);
    if (funktion === "hv_rum_moebler_hent" && svar) svar.postkontor = Array.isArray(svar.postkontor) ? postUdenEkstra(svar.postkontor) : postSomData();
    return svar;
  };
}

// Papir, skrift og klistermærker til brevene
const PAPIRER = {
  hvid:    { navn: "Hvid",      bund: "#ffffff", linje: "#dfe6ef", tekst: "#2b2b2b", kant: "#c9c2b4" },
  creme:   { navn: "Creme",     bund: "#fbf3df", linje: "#ead9b4", tekst: "#3a2a18", kant: "#d9b981" },
  rosa:    { navn: "Lyserød",   bund: "#fde1ea", linje: "#f5bfd0", tekst: "#5a1f30", kant: "#e79ab3" },
  blaa:    { navn: "Lyseblå",   bund: "#dfeefb", linje: "#bcd7f0", tekst: "#1f3550", kant: "#8db6dd" },
  lilla:   { navn: "Lilla",     bund: "#ece2f8", linje: "#d6c4ee", tekst: "#3b2560", kant: "#b59ddb" },
  gul:     { navn: "Solgul",    bund: "#fff4bf", linje: "#f3e08a", tekst: "#4a3a0a", kant: "#e0c45a" },
  fersken: { navn: "Fersken",   bund: "#ffe2cc", linje: "#f7c6a3", tekst: "#5a2e14", kant: "#eba679" },
  vinroed: { navn: "Vinrød",    bund: "#6e1a28", linje: "#84283a", tekst: "#fbe7c0", kant: "#d9a441" },
  nat:     { navn: "Nattehimmel", bund: "#1f2547", linje: "#2c3462", tekst: "#f3ecff", kant: "#c9b8ff" },
};
const SKRIFTER = {
  normal: { navn: "Normal", css: "Verdana, sans-serif" },
  haand:  { navn: "Håndskrift", css: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive" },
  fin:    { navn: "Fin", css: "Georgia, 'Times New Roman', serif" },
  maskine: { navn: "Skrivemaskine", css: "'Courier New', Courier, monospace" },
};
const KLISTER = ["⭐", "❤️", "🌸", "🌈", "🦋", "🐱", "🐶", "🍀", "🎀", "🎉", "🎂", "🌙", "☀️", "🍓", "🧁", "👑", "💌", "🎵", "🏨", "🔑"];
const KLISTER_PLADS = ["vo", "ho", "vn", "hn"];      // venstre oppe, højre oppe, venstre nede, højre nede
const BREV_SMILEYER = typeof SMILEYER !== "undefined" ? SMILEYER : ["😊", "😂", "😍", "😎", "😉", "😢", "🥳", "❤️", "⭐", "🌸"];

function postRens(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
}
function postFilter(t) { return typeof rensTekst === "function" ? rensTekst(t) : t; }
function postToken() { return typeof mitToken === "function" ? mitToken() : null; }


// -------------------------------------------------------------
//  Breve fra serveren
// -------------------------------------------------------------
let mineBreve = [];          // [{ id, fra, tekst, papir, laest, tid }]
let breveHentet = false;
let postIkkeKlar = false;    // database-24-post.sql er ikke kørt endnu
let postSetIds = null;       // de breve, jeg allerede kender (så nye kan vises)

function ulaesteBreve() { return mineBreve.filter(function (b) { return !b.laest; }).length; }

function hentBreve() {
  const token = postToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_brev_hent", { p_token: token }).then(function (svar) {
    postIkkeKlar = false;
    mineBreve = Array.isArray(svar) ? svar : [];
    breveHentet = true;
    const nye = postSetIds ? mineBreve.filter(function (b) { return !b.laest && postSetIds.indexOf(b.id) < 0; }) : [];
    if (!postSetIds && ulaesteBreve()) visPostBesked(null);
    else if (nye.length) visPostBesked(nye[0]);
    postSetIds = mineBreve.map(function (b) { return b.id; });
    if (!kasseVindue.hidden) visPostkasse();
  }).catch(function (e) {
    if (/hv_brev|function|schema/i.test(e.message)) postIkkeKlar = true;
  });
}
hentBreve();
setInterval(hentBreve, 8000);

// Alle spillere på hotellet (til "Hvem skal brevet til?")
let postSpillere = [];
function hentPostSpillere() {
  const token = postToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_alle_spillere", { p_token: token }).then(function (liste) {
    postSpillere = (liste || []).map(function (s) { return s.navn; });
    lavModtagerListe();
  }).catch(function () {});
}
function postNavne() {
  const navne = postSpillere.slice();
  if (!navne.length && typeof alleSpillere === "function") {
    alleSpillere().forEach(function (s) { if (!(typeof erComputerGaest === "function" && erComputerGaest(s.navn))) navne.push(s.navn); });
  }
  return navne.sort(function (a, b) { return a.localeCompare(b, "da"); });
}


// -------------------------------------------------------------
//  Et brev på papir (bruges både når man skriver og læser)
// -------------------------------------------------------------
function papirStil(p) {
  const pa = PAPIRER[p && p.farve] || PAPIRER.creme;
  const sk = SKRIFTER[p && p.skrift] || SKRIFTER.normal;
  return "background-color:" + pa.bund + ";color:" + pa.tekst + ";border-color:" + pa.kant + ";font-family:" + sk.css + ";" +
    "background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 25px, " + pa.linje + " 25px, " + pa.linje + " 26px);";
}
function klisterHTML(p) {
  const k = (p && Array.isArray(p.klister) ? p.klister : []).slice(0, 4);
  return k.map(function (sm, i) {
    return KLISTER.indexOf(sm) >= 0 ? "<span class='post-klister post-k-" + KLISTER_PLADS[i] + "'>" + sm + "</span>" : "";
  }).join("");
}
function brevHTML(b) {
  const dato = new Date(b.tid);
  const tid = isNaN(dato) ? "" : dato.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }) + " kl. " +
    dato.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return "<div class='post-papir post-laes' style=\"" + papirStil(b.papir) + "\">" + klisterHTML(b.papir) +
    "<div class='post-dato'>" + postRens(tid) + "</div>" +
    "<div class='post-tekst'>" + postRens(postFilter(b.tekst)).replace(/\n/g, "<br>") + "</div>" +
    "<div class='post-hilsen'>Kærlig hilsen<br><b>" + postRens(b.fra) + "</b></div></div>";
}


// -------------------------------------------------------------
//  ✍️ Skrive-vinduet (på postkontoret)
// -------------------------------------------------------------
const postVindue = document.createElement("div");
postVindue.id = "post-vindue";
postVindue.hidden = true;
postVindue.innerHTML =
  "<div class='post-top'><b>✉️ Postkontoret · Skriv et brev</b><button type='button' class='post-luk' title='Luk'>✕</button></div>" +
  "<div class='post-indhold'>" +
  "<label class='post-til'>Til: <input id='post-til' list='post-navne' maxlength='30' placeholder='Skriv eller vælg et navn' autocomplete='off'></label>" +
  "<datalist id='post-navne'></datalist>" +
  "<div class='post-valg'><b>Papir</b><div id='post-papirer'></div></div>" +
  "<div class='post-valg'><b>Skrift</b><div id='post-skrifter'></div></div>" +
  "<div class='post-valg'><b>Klistermærker</b> <small>(højst 4, klik igen for at fjerne)</small><div id='post-klister'></div></div>" +
  "<div id='post-papir' class='post-papir'><span id='post-pynt'></span>" +
  "<textarea id='post-tekst' maxlength='1500' placeholder='Kære …'></textarea>" +
  "<div class='post-hilsen'>Kærlig hilsen<br><b id='post-fra'></b></div></div>" +
  "<div class='post-smil' id='post-smil'></div>" +
  "<p id='post-fejl' class='post-fejl'></p>" +
  "<div class='post-knapper'><button type='button' id='post-mine'>📬 Mine breve</button><button type='button' id='post-send' class='post-send'>📮 Send brevet</button></div>" +
  "</div>";
document.body.appendChild(postVindue);
if (typeof goerFlytbar === "function") goerFlytbar(postVindue, postVindue.querySelector(".post-top"), "mit-hotel-flyt-post");
postVindue.querySelector(".post-luk").addEventListener("click", function () { postVindue.hidden = true; });

let postPapir = { farve: "creme", skrift: "haand", klister: [] };

function lavModtagerListe() {
  document.getElementById("post-navne").innerHTML = postNavne().map(function (n) { return "<option value=\"" + postRens(n) + "\">"; }).join("");
}

function visPapirValg() {
  document.getElementById("post-papirer").innerHTML = Object.keys(PAPIRER).map(function (k) {
    const p = PAPIRER[k];
    return "<button type='button' data-papir='" + k + "' title='" + p.navn + "' class='" + (postPapir.farve === k ? "valgt" : "") +
      "' style='background:" + p.bund + ";border-color:" + p.kant + "'></button>";
  }).join("");
  document.getElementById("post-skrifter").innerHTML = Object.keys(SKRIFTER).map(function (k) {
    return "<button type='button' data-skrift='" + k + "' class='" + (postPapir.skrift === k ? "valgt" : "") + "' style=\"font-family:" + SKRIFTER[k].css + "\">" + SKRIFTER[k].navn + "</button>";
  }).join("");
  document.getElementById("post-klister").innerHTML = KLISTER.map(function (k) {
    return "<button type='button' data-klister='" + k + "' class='" + (postPapir.klister.indexOf(k) >= 0 ? "valgt" : "") + "'>" + k + "</button>";
  }).join("");
  const papir = document.getElementById("post-papir");
  papir.setAttribute("style", papirStil(postPapir));
  document.getElementById("post-tekst").style.color = (PAPIRER[postPapir.farve] || PAPIRER.creme).tekst;
  document.getElementById("post-tekst").style.fontFamily = (SKRIFTER[postPapir.skrift] || SKRIFTER.normal).css;
  document.getElementById("post-pynt").innerHTML = klisterHTML(postPapir);
  document.getElementById("post-fra").textContent = FIGUR.navn;
}
postVindue.addEventListener("click", function (e) {
  const k = e.target.closest && e.target.closest("button");
  if (!k) return;
  if (k.dataset.papir) { postPapir.farve = k.dataset.papir; visPapirValg(); }
  if (k.dataset.skrift) { postPapir.skrift = k.dataset.skrift; visPapirValg(); }
  if (k.dataset.klister) {
    const i = postPapir.klister.indexOf(k.dataset.klister);
    if (i >= 0) postPapir.klister.splice(i, 1);
    else if (postPapir.klister.length < 4) postPapir.klister.push(k.dataset.klister);
    else document.getElementById("post-fejl").textContent = "Der er kun plads til 4 klistermærker.";
    visPapirValg();
  }
});
// smileys sættes ind, hvor man skriver
BREV_SMILEYER.forEach(function (sm) {
  const k = document.createElement("button");
  k.type = "button";
  k.textContent = sm;
  k.addEventListener("click", function () {
    const felt = document.getElementById("post-tekst");
    const start = felt.selectionStart != null ? felt.selectionStart : felt.value.length;
    const slut = felt.selectionEnd != null ? felt.selectionEnd : start;
    felt.value = (felt.value.slice(0, start) + sm + felt.value.slice(slut)).slice(0, 1500);
    felt.focus();
    felt.selectionStart = felt.selectionEnd = start + sm.length;
  });
  document.getElementById("post-smil").appendChild(k);
});

function aabnSkriv(til) {
  visPapirValg();
  lavModtagerListe();
  hentPostSpillere();
  if (til) document.getElementById("post-til").value = til;
  document.getElementById("post-fejl").textContent = postIkkeKlar ? "Breve virker, når database-24-post.sql er kørt i Supabase." : "";
  postVindue.hidden = false;
  kasseVindue.hidden = true;
  document.getElementById(til ? "post-tekst" : "post-til").focus();
}
// Skriv til nogen: er man ikke på postkontoret, går man derhen først
function skrivTil(til) {
  if (!iPostkontoret()) {
    gaaTilVaerelse("postkontor");
    besked.textContent = "✉️ Velkommen på postkontoret! Her skriver du brevet.";
  }
  aabnSkriv(til);
}

document.getElementById("post-mine").addEventListener("click", function () { postVindue.hidden = true; aabnPostkasse(); });
document.getElementById("post-send").addEventListener("click", function () {
  const fejl = document.getElementById("post-fejl");
  const tilFelt = document.getElementById("post-til"), tekstFelt = document.getElementById("post-tekst");
  const skrevet = tilFelt.value.trim();
  const til = postNavne().find(function (n) { return n.toLowerCase() === skrevet.toLowerCase(); }) || skrevet;
  const tekst = postFilter(tekstFelt.value.trim());
  if (!til) { fejl.textContent = "Skriv hvem brevet skal til."; tilFelt.focus(); return; }
  if (!tekst) { fejl.textContent = "Brevet er tomt. Skriv noget først 🙂"; tekstFelt.focus(); return; }
  if (!SERVER.til || !postToken()) { fejl.textContent = "Du skal være logget ind for at sende breve."; return; }
  const knap = this;
  knap.disabled = true;
  fejl.textContent = "📮 Sender …";
  serverKald("hv_brev_send", { p_token: postToken(), p_til: til, p_tekst: tekst,
    p_papir: { farve: postPapir.farve, skrift: postPapir.skrift, klister: postPapir.klister.slice(0, 4) } }).then(function () {
    knap.disabled = false;
    fejl.textContent = "";
    tekstFelt.value = "";
    postVindue.hidden = true;
    flyvendeBrev();
    besked.textContent = "📮 Dit brev er sendt! Det ligger nu i " + til + "s postkasse.";
  }).catch(function (e) {
    knap.disabled = false;
    fejl.textContent = /hv_brev/.test(e.message) ? "Breve virker, når database-24-post.sql er kørt i Supabase." : e.message;
  });
});

// Et lille brev flyver op og væk, når det er sendt
function flyvendeBrev() {
  const b = document.createElement("div");
  b.className = "post-flyv";
  b.textContent = "💌";
  document.body.appendChild(b);
  setTimeout(function () { b.remove(); }, 1600);
}


// -------------------------------------------------------------
//  📬 Min postkasse (læs breve)
// -------------------------------------------------------------
const kasseVindue = document.createElement("div");
kasseVindue.id = "postkasse-vindue";
kasseVindue.hidden = true;
kasseVindue.innerHTML = "<div class='post-top'><b id='pk-titel'>📬 Min postkasse</b><button type='button' class='post-luk' title='Luk'>✕</button></div>" +
  "<div class='post-indhold' id='pk-indhold'></div>";
document.body.appendChild(kasseVindue);
if (typeof goerFlytbar === "function") goerFlytbar(kasseVindue, kasseVindue.querySelector(".post-top"), "mit-hotel-flyt-postkasse");
kasseVindue.querySelector(".post-luk").addEventListener("click", function () { kasseVindue.hidden = true; });

let aabentBrev = null;     // id på det brev, man læser
let sletKlar = null;

function aabnPostkasse() {
  aabentBrev = null;
  visPostkasse();
  kasseVindue.hidden = false;
  postBesked.hidden = true;
  hentBreve();
}
function visPostkasse() {
  const boks = document.getElementById("pk-indhold");
  document.getElementById("pk-titel").textContent = "📬 " + FIGUR.navn + "s postkasse";
  if (postIkkeKlar) { boks.innerHTML = "<p class='post-tom'>Breve virker, når database-24-post.sql er kørt i Supabase.</p>"; return; }
  if (!breveHentet) { boks.innerHTML = "<p class='post-tom'>Henter dine breve …</p>"; return; }
  const b = mineBreve.find(function (x) { return x.id === aabentBrev; });
  if (b) {
    boks.innerHTML = "<button type='button' class='pk-tilbage' id='pk-tilbage'>← Alle breve</button>" + brevHTML(b) +
      "<div class='post-knapper'><button type='button' id='pk-slet'>" + (sletKlar === b.id ? "Er du sikker? Tryk igen" : "🗑 Smid ud") + "</button>" +
      "<button type='button' id='pk-svar' class='post-send'>✉️ Svar " + postRens(b.fra) + "</button></div>";
    document.getElementById("pk-tilbage").onclick = function () { aabentBrev = null; sletKlar = null; visPostkasse(); };
    document.getElementById("pk-svar").onclick = function () { skrivTil(b.fra); };
    document.getElementById("pk-slet").onclick = function () {
      if (sletKlar !== b.id) { sletKlar = b.id; visPostkasse(); return; }
      serverKald("hv_brev_slet", { p_token: postToken(), p_id: b.id }).catch(function () {});
      mineBreve = mineBreve.filter(function (x) { return x.id !== b.id; });
      aabentBrev = null; sletKlar = null;
      visPostkasse();
    };
    return;
  }
  const lej = typeof minLej === "function" ? minLej() : null;
  boks.innerHTML = (mineBreve.length ? "<div class='pk-liste'>" + mineBreve.map(function (x) {
      const d = new Date(x.tid);
      const pa = PAPIRER[x.papir && x.papir.farve] || PAPIRER.creme;
      return "<button type='button' class='pk-brev" + (x.laest ? "" : " ny") + "' data-brev='" + x.id + "'>" +
        "<span class='pk-kuvert' style='background:" + pa.bund + ";border-color:" + pa.kant + "'>" + (x.laest ? "📄" : "💌") + "</span>" +
        "<span class='pk-om'><b>" + postRens(x.fra) + "</b><small>" + (isNaN(d) ? "" : d.toLocaleDateString("da-DK", { day: "numeric", month: "short" }) + " kl. " +
        d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })) + "</small></span>" + (x.laest ? "" : "<i>Nyt!</i>") + "</button>";
    }).join("") + "</div>"
    : "<p class='post-tom'>📭 Din postkasse er tom. Når nogen skriver til dig, kommer brevet her.</p>") +
    "<div class='post-knapper'>" + (lej ? "<button type='button' id='pk-skilt'>🪧 Mit navneskilt</button>" : "") +
    "<button type='button' id='pk-skriv' class='post-send'>✍️ Skriv et brev</button></div>";
  boks.querySelectorAll("[data-brev]").forEach(function (k) {
    k.onclick = function () {
      const x = mineBreve.find(function (y) { return y.id === +k.dataset.brev; });
      if (!x) return;
      aabentBrev = x.id;
      if (!x.laest) { x.laest = true; serverKald("hv_brev_laest", { p_token: postToken(), p_id: x.id }).catch(function () {}); }
      visPostkasse();
    };
  });
  document.getElementById("pk-skriv").onclick = function () { skrivTil(""); };
  const skilt = document.getElementById("pk-skilt");
  if (skilt) skilt.onclick = function () { kasseVindue.hidden = true; aabnSkiltVaelger(); };
}


// -------------------------------------------------------------
//  📬 "Du har fået et brev!"
// -------------------------------------------------------------
const postBesked = document.createElement("div");
postBesked.id = "post-besked";
postBesked.hidden = true;
document.body.appendChild(postBesked);
function spilPling() {
  try {
    const lyd = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1175, 0.12]].forEach(function (n) {
      const tone = lyd.createOscillator(), styrke = lyd.createGain();
      tone.frequency.value = n[0];
      const t = lyd.currentTime + n[1];
      styrke.gain.setValueAtTime(0.0001, t);
      styrke.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      styrke.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      tone.connect(styrke).connect(lyd.destination);
      tone.start(t);
      tone.stop(t + 0.55);
    });
  } catch (e) {}
}
function visPostBesked(brev) {
  const lej = typeof minLej === "function" ? minLej() : null;
  const antal = ulaesteBreve();
  postBesked.innerHTML = "<b>📬 " + (brev ? "Du har fået et brev fra " + postRens(brev.fra) + "!" : "Du har " + antal + (antal === 1 ? " ulæst brev" : " ulæste breve") + " i din postkasse.") + "</b>" +
    "<small>" + (lej ? "Det ligger i din postkasse ude på gangen ved nr. " + husnummer(lej) + "." : "Vælg en lejlighed, så får du en postkasse ved din dør.") + "</small>" +
    "<div>" + (lej ? "<button type='button' id='pb-gaa'>🚶 Gå til min postkasse</button>" : "<button type='button' id='pb-laes'>📖 Læs det nu</button>") +
    "<button type='button' id='pb-luk'>✕</button></div>";
  postBesked.hidden = false;
  if (brev) spilPling();
  const gaa = document.getElementById("pb-gaa");
  if (gaa) gaa.onclick = function () { postBesked.hidden = true; gaaTilPostkasse(); };
  const laes = document.getElementById("pb-laes");
  if (laes) laes.onclick = function () { postBesked.hidden = true; aabnPostkasse(); };
  document.getElementById("pb-luk").onclick = function () { postBesked.hidden = true; };
}
// Ud på gangen og hen til postkassen ved min dør
function gaaTilPostkasse() {
  const l = minLej();
  if (!l) { aabnPostkasse(); return; }
  if (!(iGang() && gangSal(aktivtVaerelse) === l.sal)) {
    gaaTilVaerelse("gang" + l.sal);
    figur.x = doerX(l.nr) + 1; figur.y = 2; figur.rute = [];
  }
  gaaTil(kasseX(l.nr), 1);
  besked.textContent = "📬 Klik på din postkasse ved siden af døren for at læse dine breve.";
}


// -------------------------------------------------------------
//  Postkasserne og navneskiltene ude på gangen
// -------------------------------------------------------------
// Postkassen til dør nr hænger på væggen lige til højre for døren
function kasseX(nr) { return doerX(nr) + 1; }
function kasseMaal(nr) {
  const a = punkt(kasseX(nr), 0), b = punkt(kasseX(nr) + 1, 0);
  return function (t, h) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - h }; };
}
function kassePoly(nr) {
  const m = kasseMaal(nr);
  return [m(0.26, 26), m(0.74, 26), m(0.74, 74), m(0.26, 74)];
}
let postMus = null;
function kasseUnderMus() {
  if (!postMus || !iGang()) return null;
  const sal = gangSal(aktivtVaerelse);
  for (let nr = 1; nr <= LEJ_DOERE; nr++) if (lejPaa(sal, nr) && iPolygon(postMus, kassePoly(nr))) return nr;
  return null;
}

// Farver til navneskiltet på døren
const SKILT_FARVER = {
  creme:   { navn: "Creme",   bund: "#fbf6ea", kant: "#3a1d0e", tekst: "#3a1d0e" },
  guld:    { navn: "Guld",    bund: "#f2c35a", kant: "#6b3f1f", tekst: "#3a1d0e" },
  vinroed: { navn: "Vinrød",  bund: "#7a1f2c", kant: "#d9a441", tekst: "#fbe7c0" },
  sort:    { navn: "Sort",    bund: "#1d1a1c", kant: "#d9a441", tekst: "#f2c35a" },
  rosa:    { navn: "Lyserød", bund: "#f8c8d6", kant: "#b0566f", tekst: "#5a1f30" },
  blaa:    { navn: "Blå",     bund: "#bfdcf2", kant: "#3f5f8a", tekst: "#1f3550" },
  lilla:   { navn: "Lilla",   bund: "#d9c8ef", kant: "#6b4f9a", tekst: "#3b2560" },
  hvid:    { navn: "Hvid",    bund: "#ffffff", kant: "#8a8178", tekst: "#2b2b2b" },
};
const SKILT_IKONER = ["", "⭐", "❤️", "🌸", "🌙", "👑", "🐱", "🎵", "🦋", "🍀", "🔑", "🏠"];
function lejSkilt(l) {
  const s = l && l.data && l.data.skilt;
  return s && typeof s === "object" ? s : null;
}

const tegnGangDoereFoerPost = tegnGangDoere;
tegnGangDoere = function () {
  tegnGangDoereFoerPost();
  const sal = gangSal(aktivtVaerelse), over = kasseUnderMus();
  for (let nr = 1; nr <= LEJ_DOERE; nr++) {
    const l = lejPaa(sal, nr);
    if (!l) continue;
    const d = gangDoerPoly(nr).m;
    // eget navneskilt på døren
    const s = lejSkilt(l);
    if (s) {
      const f = SKILT_FARVER[s.farve] || SKILT_FARVER.creme;
      const tekst = ((SKILT_IKONER.indexOf(s.ikon) > 0 ? s.ikon + " " : "") + String(s.tekst || l.ejer)).trim();
      const kort = tekst.length > 13 ? tekst.slice(0, 12) + "…" : tekst;
      polygon(ctx, [d(-0.14, 56), d(1.14, 56), d(1.14, 80), d(-0.14, 80)], f.kant);
      polygon(ctx, [d(-0.1, 58), d(1.1, 58), d(1.1, 78), d(-0.1, 78)], f.bund);
      skraaTekst(d(0.5, 68), kort, f.tekst, kort.length <= 6 ? 12 : kort.length <= 10 ? 10 : 8);
    }
    // postkassen med beboerens navn
    const m = kasseMaal(nr);
    const mig = l.id === hjemId();
    const nye = mig ? ulaesteBreve() : 0;
    if (mig) polygon(ctx, [m(0.2, 20), m(0.8, 20), m(0.8, 80), m(0.2, 80)], "rgba(255, 210, 110, 0.35)");
    polygon(ctx, [m(0.28, 28), m(0.72, 28), m(0.72, 74), m(0.28, 74)], over === nr ? "#d9a441" : "#b8862f");   // messing
    polygon(ctx, [m(0.3, 30), m(0.7, 30), m(0.7, 72), m(0.3, 72)], over === nr ? "#7a1f2c" : "#6a1a26");      // vinrød front
    polygon(ctx, [m(0.34, 62), m(0.66, 62), m(0.66, 66), m(0.34, 66)], "#2a1410");                              // brevsprækken
    polygon(ctx, [m(0.34, 34), m(0.66, 34), m(0.66, 46), m(0.34, 46)], "#fbf6ea");                              // navnet
    const navn = l.ejer.length > 8 ? l.ejer.slice(0, 7) + "…" : l.ejer;
    skraaTekst(m(0.5, 40), navn, "#3a1d0e", navn.length <= 5 ? 8 : 7);
    skraaTekst(m(0.5, 54), "POST", "#f2c35a", 6);
    if (nye) {
      // flaget er oppe, og der står hvor mange nye breve der er
      polygon(ctx, [m(0.72, 50), m(0.78, 50), m(0.78, 86), m(0.72, 86)], "#3a1d0e");
      polygon(ctx, [m(0.78, 86), m(0.98, 86), m(0.98, 76), m(0.78, 76)], "#d6332c");
      const p = m(0.5, 82);
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fillStyle = "#d6332c"; ctx.fill();
      ctx.font = "bold 9px Verdana, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
      ctx.fillText(nye > 9 ? "9+" : String(nye), p.x, p.y + 0.5);
    }
  }
  if (over) {
    const l = lejPaa(sal, over), p = kasseMaal(over)(0.5, 100);
    const t = l.id === hjemId() ? "📬 Din postkasse" + (ulaesteBreve() ? " (" + ulaesteBreve() + " nye)" : "") : "📮 " + l.ejer + "s postkasse";
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(p.x - w / 2, p.y - 16, w, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(t, p.x, p.y - 2);
  }
};

laerred.addEventListener("mousemove", function (e) {
  const r = laerred.getBoundingClientRect();
  postMus = { x: (e.clientX - r.left) * (BREDDE / r.width), y: (e.clientY - r.top) * (HOEJDE / r.height) };
  if (kasseUnderMus() || postTingUnderMus()) laerred.style.cursor = "pointer";
});
laerred.addEventListener("mouseleave", function () { postMus = null; });

// Klik på en postkasse
const kasseMenu = document.createElement("div");
kasseMenu.id = "postkasse-menu";
kasseMenu.hidden = true;
document.body.appendChild(kasseMenu);
laerred.addEventListener("click", function (e) {
  const nr = kasseUnderMus();
  if (!nr) { kasseMenu.hidden = true; return; }
  e.stopImmediatePropagation();
  const l = lejPaa(gangSal(aktivtVaerelse), nr);
  if (l.id === hjemId()) {
    gaaTil(kasseX(nr), 1);
    aabnPostkasse();
    return;
  }
  kasseMenu.innerHTML = "<b>📮 " + postRens(l.ejer) + "s postkasse</b><small>Breve skrives på postkontoret.</small>" +
    "<button type='button' id='pm-skriv'>✉️ Skriv til " + postRens(l.ejer) + "</button><button type='button' id='pm-luk'>Annuller</button>";
  kasseMenu.style.left = Math.min(e.clientX + 8, innerWidth - 210) + "px";
  kasseMenu.style.top = Math.max(8, Math.min(e.clientY - 20, innerHeight - 140)) + "px";
  kasseMenu.hidden = false;
  document.getElementById("pm-skriv").onclick = function () { kasseMenu.hidden = true; skrivTil(l.ejer); };
  document.getElementById("pm-luk").onclick = function () { kasseMenu.hidden = true; };
}, true);


// -------------------------------------------------------------
//  🪧 Mit navneskilt (i vinduet "Min lejlighed")
// -------------------------------------------------------------
let mitSkilt;            // undefined = det, der ligger på serveren
const minLejDataFoerPost = minLejData;
minLejData = function () {
  const d = minLejDataFoerPost();
  const l = minLej();
  const s = mitSkilt !== undefined ? mitSkilt : lejSkilt(l);
  if (s) d.skilt = s;
  return d;
};
let skiltValg = null;
function skiltHTML() {
  const l = minLej();
  if (!l) return "";
  if (!skiltValg) skiltValg = Object.assign({ tekst: l.ejer, farve: "creme", ikon: "" }, lejSkilt(l) || {});
  const f = SKILT_FARVER[skiltValg.farve] || SKILT_FARVER.creme;
  return "<div id='lej-skilt'><b class='lej-titel'>4. 🪧 Navneskilt på din dør</b>" +
    "<div class='skilt-vis' style='background:" + f.bund + ";border-color:" + f.kant + ";color:" + f.tekst + "'>" +
    postRens(((skiltValg.ikon ? skiltValg.ikon + " " : "") + (skiltValg.tekst || l.ejer)).trim()) + "</div>" +
    "<input id='skilt-tekst' maxlength='14' value=\"" + postRens(skiltValg.tekst) + "\" placeholder='" + postRens(l.ejer) + "'>" +
    "<div class='skilt-farver'>" + Object.keys(SKILT_FARVER).map(function (k) {
      const x = SKILT_FARVER[k];
      return "<button type='button' data-skilt-farve='" + k + "' title='" + x.navn + "' class='" + (k === skiltValg.farve ? "valgt" : "") +
        "' style='background:" + x.bund + ";border-color:" + x.kant + ";color:" + x.tekst + "'>Aa</button>";
    }).join("") + "</div>" +
    "<div class='skilt-ikoner'>" + SKILT_IKONER.map(function (k) {
      return "<button type='button' data-skilt-ikon='" + k + "' class='" + (k === skiltValg.ikon ? "valgt" : "") + "'>" + (k || "–") + "</button>";
    }).join("") + "</div>" +
    "<div class='lej-knapper'><button type='button' id='skilt-gem' class='lej-gem'>🪧 Sæt skiltet op</button></div><p id='skilt-svar' class='lej-fejl'></p></div>";
}
function bindSkilt() {
  const boks = document.getElementById("lej-skilt");
  if (!boks) return;
  const opdaterVis = function () {
    const f = SKILT_FARVER[skiltValg.farve] || SKILT_FARVER.creme, vis = boks.querySelector(".skilt-vis");
    vis.style.background = f.bund; vis.style.borderColor = f.kant; vis.style.color = f.tekst;
    vis.textContent = ((skiltValg.ikon ? skiltValg.ikon + " " : "") + (skiltValg.tekst || minLej().ejer)).trim();
    boks.querySelectorAll("[data-skilt-farve]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.skiltFarve === skiltValg.farve); });
    boks.querySelectorAll("[data-skilt-ikon]").forEach(function (k) { k.classList.toggle("valgt", k.dataset.skiltIkon === skiltValg.ikon); });
  };
  document.getElementById("skilt-tekst").addEventListener("input", function () { skiltValg.tekst = postFilter(this.value); opdaterVis(); });
  boks.querySelectorAll("[data-skilt-farve]").forEach(function (k) { k.onclick = function () { skiltValg.farve = k.dataset.skiltFarve; opdaterVis(); }; });
  boks.querySelectorAll("[data-skilt-ikon]").forEach(function (k) { k.onclick = function () { skiltValg.ikon = k.dataset.skiltIkon; opdaterVis(); }; });
  document.getElementById("skilt-gem").onclick = function () {
    const svar = document.getElementById("skilt-svar");
    mitSkilt = { tekst: (skiltValg.tekst || "").trim().slice(0, 14) || minLej().ejer, farve: skiltValg.farve, ikon: skiltValg.ikon };
    serverKald("hv_lej_gem", { p_token: mitToken(), p_id: hjemId(), p_navn: null, p_sal: null, p_nr: null, p_data: minLejData(), p_adgang: null, p_kode: null })
      .then(function () {
        const l = minLej();
        if (l) { l.data = Object.assign({}, l.data, { skilt: mitSkilt }); }
        svar.style.color = "#3a6b2f";
        svar.textContent = "🪧 Skiltet hænger nu på din dør!";
        hentLejligheder();
      }).catch(function (e) { svar.style.color = ""; svar.textContent = e.message; });
  };
}
const visLejVaelgerFoerPost = visLejVaelger;
visLejVaelger = function () {
  // vinduet tegnes forfra hvert 5. sekund: husk om man er ved at skrive på skiltet
  const aktiv = document.activeElement, skriver = aktiv && aktiv.id === "skilt-tekst";
  const plads = skriver ? aktiv.selectionStart : 0;
  visLejVaelgerFoerPost();
  const knapper = document.querySelector("#lej-indhold > .lej-knapper");
  if (!knapper || !minLej() || document.getElementById("lej-skilt")) return;
  knapper.insertAdjacentHTML("beforebegin", skiltHTML());
  bindSkilt();
  if (skriver) { const felt = document.getElementById("skilt-tekst"); felt.focus(); felt.selectionStart = felt.selectionEnd = plads; }
};
const aabnLejVaelgerFoerPost = aabnLejVaelger;
aabnLejVaelger = function (foerste) { skiltValg = null; aabnLejVaelgerFoerPost(foerste); };
function aabnSkiltVaelger() {
  aabnLejVaelger(false);
  const s = document.getElementById("lej-skilt");
  if (s) s.scrollIntoView({ block: "center" });
}


// -------------------------------------------------------------
//  Postkontoret: skranke, postbokse og den røde postkasse (tegnet med kode på bagvæggen;
//  elevatoren får venstre væg)
// -------------------------------------------------------------
// Et punkt på bagvæggen (x = felt langs væggen, h = højde over gulvet)
function bagP(x, h) { const p = punkt(x, 0); return { x: p.x, y: p.y - h }; }
function bagFirkant(x1, x2, h1, h2, farve) { polygon(ctx, [bagP(x1, h2), bagP(x2, h2), bagP(x2, h1), bagP(x1, h1)], farve); }
function bagTekst(x, h, tekst, farve, font) {
  const p = bagP(x, h);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.transform(1, 0.5, 0, 1, 0, 0);
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = farve;
  ctx.fillText(tekst, 0, 0);
  ctx.restore();
}
const SKRANKE = { fra: 4, til: 8.6 };
const ROED_KASSE = { fra: 1.2, til: 2.4, bund: 70, top: 140 };
const BOKSE = { fra: 9.1, til: 11.8 };
function postTing() {
  return [
    { hvad: "skranke", poly: [bagP(SKRANKE.fra, 150), bagP(SKRANKE.til, 150), bagP(SKRANKE.til, 0), bagP(SKRANKE.fra, 0)], tekst: "✍️ Skriv et brev ved skranken" },
    { hvad: "kasse", poly: [bagP(ROED_KASSE.fra, ROED_KASSE.top + 14), bagP(ROED_KASSE.til, ROED_KASSE.top + 14), bagP(ROED_KASSE.til, ROED_KASSE.bund), bagP(ROED_KASSE.fra, ROED_KASSE.bund)], tekst: "📮 Læg et brev i postkassen" },
    { hvad: "bokse", poly: [bagP(BOKSE.fra, 160), bagP(BOKSE.til, 160), bagP(BOKSE.til, 40), bagP(BOKSE.fra, 40)], tekst: "📬 Mine breve" },
  ];
}
function postTingUnderMus() {
  if (!postMus || !iPostkontoret()) return null;
  return postTing().find(function (t) { return iPolygon(postMus, t.poly); }) || null;
}

const tegnVaeggeFoerPost = tegnVaegge;
tegnVaegge = function () {
  tegnVaeggeFoerPost();
  if (!iPostkontoret()) return;
  const over = postTingUnderMus();
  // skiltet øverst på bagvæggen
  bagFirkant(3.4, 9.2, 176, 214, "#d9a441");
  bagFirkant(3.5, 9.1, 179, 211, "#3a1d0e");
  bagTekst(6.3, 195, "✉  POSTKONTOR  ✉", "#f2c35a", "bold 20px Georgia, serif");
  // skranken: træ forneden, glasrude med messing ovenover
  const S = SKRANKE;
  bagFirkant(S.fra, S.til, 0, 62, over && over.hvad === "skranke" ? "#8a5530" : "#6b3f1f");
  for (let x = S.fra + 0.3; x < S.til - 0.2; x += 1.1) bagFirkant(x, x + 0.8, 10, 52, "#7d4a26");
  bagFirkant(S.fra - 0.15, S.til + 0.15, 62, 70, "#b8862f");                   // bordplade
  bagFirkant(S.fra, S.til, 70, 150, "rgba(190, 225, 240, 0.35)");               // glas
  for (let x = S.fra; x <= S.til + 0.01; x += (S.til - S.fra) / 3) bagFirkant(x - 0.05, x + 0.05, 70, 150, "#b8862f");
  bagFirkant(S.fra - 0.1, S.til + 0.1, 148, 156, "#b8862f");
  bagFirkant(5.1, 7.5, 92, 116, "#fbf6ea");
  bagTekst(6.3, 104, "✍️ Skriv et brev", "#6a1a26", "bold 12px Verdana, sans-serif");
  // brevpapir og en blækpen på skranken
  bagFirkant(4.6, 5.3, 64, 69, "#ffffff");
  bagFirkant(7.4, 8.1, 64, 69, "#fde1ea");
  // den røde postkasse på væggen (som en rigtig dansk postkasse)
  const K = ROED_KASSE, kOver = over && over.hvad === "kasse";
  bagFirkant(K.fra, K.til, K.bund, K.top, kOver ? "#e0453c" : "#c8302a");
  bagFirkant(K.fra - 0.05, K.til + 0.05, K.top, K.top + 14, "#9e2420");
  bagFirkant(K.fra + 0.2, K.til - 0.2, K.top - 24, K.top - 18, "#2a1410");     // sprække
  bagTekst((K.fra + K.til) / 2, K.top - 44, "📯", "#f2c35a", "16px sans-serif");
  bagTekst((K.fra + K.til) / 2, K.bund + 16, "POST", "#f2c35a", "bold 10px Verdana, sans-serif");
  // små postbokse i messing (bagvæggen til højre for skranken)
  const bOver = over && over.hvad === "bokse";
  bagFirkant(BOKSE.fra, BOKSE.til, 40, 160, bOver ? "#8a5530" : "#5a3420");
  for (let x = BOKSE.fra + 0.12; x < BOKSE.til - 0.4; x += 0.56) {
    for (let h = 48; h < 150; h += 22) {
      bagFirkant(x, x + 0.46, h, h + 16, "#c9973a");
      bagFirkant(x + 0.05, x + 0.41, h + 3, h + 13, "#a87a2a");
      const p = bagP(x + 0.34, h + 8);
      ctx.fillStyle = "#3a1d0e";
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
  }
  if (over) {
    const p = { x: over.poly.reduce(function (s, q) { return s + q.x; }, 0) / 4, y: Math.min.apply(null, over.poly.map(function (q) { return q.y; })) - 8 };
    ctx.font = "bold 12px Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const w = ctx.measureText(over.tekst).width + 14;
    ctx.fillStyle = "rgba(58,29,14,0.92)";
    ctx.fillRect(p.x - w / 2, p.y - 16, w, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(over.tekst, p.x, p.y - 2);
  }
};
laerred.addEventListener("click", function (e) {
  const t = postTingUnderMus();
  if (!t) return;
  e.stopImmediatePropagation();
  if (t.hvad === "bokse") aabnPostkasse(); else aabnSkriv("");
}, true);

// Knappen "✉️ Skriv et brev" nederst, når man er på postkontoret
const postKnap = document.createElement("button");
postKnap.type = "button";
postKnap.id = "post-knap";
postKnap.hidden = true;
postKnap.textContent = "✉️ Skriv et brev";
postKnap.addEventListener("click", function () { aabnSkriv(""); });
document.body.appendChild(postKnap);
let varIPost = false;
setInterval(function () {
  const her = iPostkontoret();
  postKnap.hidden = !her;
  if (her && !varIPost) { hentPostSpillere(); besked.textContent = "✉️ Velkommen på postkontoret! Klik på skranken for at skrive et brev."; }
  if (!her && varIPost) postVindue.hidden = true;
  varIPost = her;
}, 400);


// -------------------------------------------------------------
//  Udseendet (vinrød, guld og creme)
// -------------------------------------------------------------
const postStil = document.createElement("style");
postStil.textContent =
  "#post-vindue, #postkasse-vindue { position: fixed; top: 60px; left: calc(50% - 250px); z-index: 62; width: min(500px, calc(100vw - 20px));" +
  " max-height: calc(100vh - 80px); overflow-y: auto; background: #fbf6ea; border: 3px solid #7a1f2c; border-radius: 14px;" +
  " box-shadow: 0 8px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #3a1d0e; }" +
  "#postkasse-vindue { left: calc(50% - 210px); width: min(420px, calc(100vw - 20px)); }" +
  "#post-vindue[hidden], #postkasse-vindue[hidden], #post-besked[hidden], #postkasse-menu[hidden], #post-knap[hidden] { display: none !important; }" +
  ".post-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #7a1f2c; color: #fbe7c0;" +
  " cursor: move; font-size: 15px; border-bottom: 3px solid #d9a441; }" +
  ".post-top button { background: #9a2a3a; border: 2px solid #d9a441; color: #fff; border-radius: 6px; cursor: pointer; }" +
  ".post-indhold { padding: 10px 14px 14px; }" +
  ".post-til { display: flex; align-items: center; gap: 8px; font-weight: bold; color: #7a1f2c; }" +
  ".post-til input { flex: 1; padding: 6px 8px; border: 2px solid #d9a441; border-radius: 8px; font: 13px Verdana, sans-serif; }" +
  ".post-valg { margin-top: 8px; }" +
  ".post-valg > b { color: #7a1f2c; }" +
  ".post-valg small { color: #8a7a6a; }" +
  ".post-valg > div { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }" +
  "#post-papirer button { width: 30px; height: 30px; border: 3px solid; border-radius: 8px; cursor: pointer; }" +
  "#post-skrifter button { padding: 4px 9px; border: 2px solid #e6cf9a; border-radius: 8px; background: #fff; color: #3a1d0e; font-size: 13px; cursor: pointer; }" +
  "#post-klister button { width: 32px; height: 32px; padding: 0; border: 2px solid #e6cf9a; border-radius: 8px; background: #fff; font-size: 17px; cursor: pointer; }" +
  ".post-valg button.valgt { outline: 3px solid #7a1f2c; outline-offset: 1px; }" +
  "#post-skrifter button.valgt, #post-klister button.valgt { background: #fff3cf; border-color: #d9a441; }" +
  ".post-papir { position: relative; margin-top: 10px; padding: 26px 26px 14px; border: 3px solid; border-radius: 6px;" +
  " box-shadow: 3px 4px 0 rgba(58,29,14,0.18); line-height: 26px; font-size: 15px; }" +
  "#post-tekst { display: block; width: 100%; box-sizing: border-box; min-height: 160px; resize: vertical; border: 0; outline: 0; background: transparent;" +
  " font-size: 15px; line-height: 26px; padding: 0; }" +
  ".post-hilsen { margin-top: 8px; text-align: right; line-height: 20px; }" +
  ".post-dato { text-align: right; font-size: 11px; opacity: 0.75; line-height: 16px; margin-bottom: 6px; }" +
  ".post-tekst { white-space: normal; word-wrap: break-word; }" +
  ".post-klister { position: absolute; font-size: 24px; line-height: 1; pointer-events: none; }" +
  ".post-k-vo { top: -10px; left: -10px; transform: rotate(-14deg); } .post-k-ho { top: -10px; right: -10px; transform: rotate(12deg); }" +
  ".post-k-vn { bottom: -10px; left: -10px; transform: rotate(10deg); } .post-k-hn { bottom: -10px; right: -10px; transform: rotate(-12deg); }" +
  ".post-smil { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 8px; }" +
  ".post-smil button { width: 28px; height: 28px; padding: 0; border: 1px solid #e6cf9a; border-radius: 6px; background: #fff; font-size: 15px; cursor: pointer; }" +
  ".post-fejl { min-height: 1em; margin: 8px 0 0; color: #b23b3b; font-weight: bold; }" +
  ".post-knapper { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; flex-wrap: wrap; }" +
  ".post-knapper button, .pk-tilbage { padding: 7px 14px; border: 2px solid #d9a441; border-radius: 8px; background: #fff3cf; color: #3a1d0e;" +
  " font: bold 13px Verdana, sans-serif; cursor: pointer; }" +
  ".post-knapper button.post-send { background: #7a1f2c; border-color: #d9a441; color: #fbe7c0; }" +
  ".post-knapper button:disabled { opacity: 0.6; }" +
  ".pk-tilbage { padding: 4px 10px; font-size: 12px; }" +
  ".post-tom { color: #8a7a6a; }" +
  ".pk-liste { display: flex; flex-direction: column; gap: 6px; }" +
  ".pk-brev { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border: 2px solid #ead9b4; border-radius: 10px; background: #fff;" +
  " color: #3a1d0e; font: 13px Verdana, sans-serif; text-align: left; cursor: pointer; }" +
  ".pk-brev:hover { background: #fff3cf; }" +
  ".pk-brev.ny { border-color: #d9a441; background: #fff8e2; }" +
  ".pk-kuvert { width: 34px; height: 26px; display: flex; align-items: center; justify-content: center; border: 2px solid; border-radius: 4px; font-size: 16px; }" +
  ".pk-om { flex: 1; display: flex; flex-direction: column; } .pk-om small { color: #8a7a6a; }" +
  ".pk-brev i { font-style: normal; font-weight: bold; color: #fff; background: #d6332c; border-radius: 10px; padding: 1px 8px; font-size: 11px; }" +
  "#post-besked { position: fixed; top: 74px; right: 16px; z-index: 63; width: 280px; padding: 12px 14px; background: #fbf6ea; border: 3px solid #d9a441;" +
  " border-radius: 12px; box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #3a1d0e; display: flex; flex-direction: column; gap: 6px;" +
  " animation: post-ind 0.4s ease-out; }" +
  "#post-besked small { color: #6b5a4a; }" +
  "#post-besked div { display: flex; gap: 6px; }" +
  "#post-besked button { padding: 6px 10px; border: 2px solid #d9a441; border-radius: 8px; background: #7a1f2c; color: #fbe7c0; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#post-besked #pb-luk { background: #fff3cf; color: #3a1d0e; }" +
  "@keyframes post-ind { from { transform: translateY(-20px); opacity: 0; } to { transform: none; opacity: 1; } }" +
  "#postkasse-menu { position: fixed; z-index: 63; width: 190px; padding: 10px; background: #fbf6ea; border: 3px solid #7a1f2c; border-radius: 12px;" +
  " box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #3a1d0e; display: flex; flex-direction: column; gap: 6px; }" +
  "#postkasse-menu small { color: #6b5a4a; }" +
  "#postkasse-menu button { padding: 6px 8px; border: 2px solid #d9a441; border-radius: 8px; background: #fff3cf; color: #3a1d0e; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#postkasse-menu #pm-skriv { background: #7a1f2c; color: #fbe7c0; }" +
  "#post-knap { position: fixed; left: 50%; bottom: 84px; transform: translateX(-50%); z-index: 25; padding: 9px 18px; border: 3px solid #d9a441;" +
  " border-radius: 12px; background: #7a1f2c; color: #fbe7c0; font: bold 15px Verdana, sans-serif; cursor: pointer; box-shadow: 0 5px 0 rgba(0,0,0,0.25); }" +
  "#post-knap:hover { background: #9a2a3a; }" +
  ".post-flyv { position: fixed; left: 50%; top: 45%; z-index: 70; font-size: 48px; pointer-events: none; animation: post-flyv 1.5s ease-in forwards; }" +
  "@keyframes post-flyv { 0% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(180px, -320px) scale(0.4) rotate(25deg); opacity: 0; } }" +
  "#lej-skilt .skilt-vis { margin: 4px 0 8px; padding: 6px 10px; border: 3px solid; border-radius: 6px; text-align: center; font: bold 15px Verdana, sans-serif; }" +
  "#lej-skilt input { width: 100%; box-sizing: border-box; padding: 5px 7px; border: 1px solid #9ccc8f; border-radius: 6px; font: 13px Verdana, sans-serif; }" +
  "#lej-skilt .skilt-farver, #lej-skilt .skilt-ikoner { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }" +
  "#lej-skilt .skilt-farver button { width: 34px; height: 28px; border: 3px solid; border-radius: 6px; font: bold 11px Verdana, sans-serif; cursor: pointer; }" +
  "#lej-skilt .skilt-ikoner button { width: 30px; height: 28px; padding: 0; border: 2px solid #e6cf9a; border-radius: 6px; background: #fff; font-size: 14px; cursor: pointer; }" +
  "#lej-skilt button.valgt { outline: 3px solid #7a1f2c; outline-offset: 1px; }";
document.head.appendChild(postStil);
