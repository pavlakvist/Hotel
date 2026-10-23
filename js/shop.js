// =============================================================
//  Shop 🛒 og Mine ting / Lager 📦
//  I shoppen køber man møbler for Glimt (de særlige for Stella).
//  Det man køber, kommer i "Mine ting", og derfra kan man
//  sætte det ind i sit værelse. Samler man et møbel op i værelset,
//  kommer det tilbage i "Mine ting".
//  Begge åbnes med de små knapper i chatbaren.
// =============================================================
const LAGER_NOEGLE = "mit-hotel-lager";
const shopVindue = document.getElementById("shop-vindue");
const lagerVindue = document.getElementById("lager-vindue");

// Hver ting i lageret: { type: "lobby-02", tid: 1700000000000 }
let lager = [];
try { lager = JSON.parse(localStorage.getItem(LAGER_NOEGLE) || "[]"); } catch (e) {}
function gemLager() {
  try { localStorage.setItem(LAGER_NOEGLE, JSON.stringify(lager)); } catch (e) {}
}

function tilLager(type) {
  if (!MOEBEL_TYPER[type]) return;
  lager.push({ type: type, tid: Date.now() });
  gemLager();
  visLager();
}

function fraLager(type) {
  // den nyeste af slagsen bliver taget
  for (let i = lager.length - 1; i >= 0; i--) {
    if (lager[i].type === type) { lager.splice(i, 1); break; }
  }
  gemLager();
  visLager();
}


// -------------------------------------------------------------
//  Små billeder af møblerne (klippet ud af dine møbel-ark)
// -------------------------------------------------------------
const butikBilleder = [];

function tegnTing(c, type) {
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  const b = hentBillede(type.billede);
  if (!billedeKlar(b)) {
    if (b && !b.butikVenter) {
      b.butikVenter = true;
      b.addEventListener("load", function () {
        butikBilleder.forEach(function (t) { if (t.type.billede === type.billede) tegnTing(t.c, t.type); });
      });
    }
    return;
  }
  const k = type.klip || [0, 0, b.naturalWidth, b.naturalHeight];
  const skala = Math.min(1, (c.width - 6) / k[2], (c.height - 6) / k[3]);
  const w = k[2] * skala, h = k[3] * skala;
  g.drawImage(b, k[0], k[1], k[2], k[3], (c.width - w) / 2, (c.height - h) / 2, w, h);
}

function lavTingBillede(type, str) {
  const c = document.createElement("canvas");
  c.width = str;
  c.height = str;
  if (butikBilleder.length > 300) {
    for (let i = butikBilleder.length - 1; i >= 0; i--) if (!butikBilleder[i].c.isConnected) butikBilleder.splice(i, 1);
  }
  butikBilleder.push({ c: c, type: type });
  tegnTing(c, type);
  return c;
}


// -------------------------------------------------------------
//  Priser: større møbler koster mere. De særlige koster Stella.
// -------------------------------------------------------------
function pris(type) {
  const k = type.klip || [0, 0, 60, 60];
  const flade = k[2] * k[3];
  if (type.kategori === "Special") return { stella: true, beloeb: Math.max(2, Math.min(8, Math.round(flade / 3000) + 2)) };
  return { stella: false, beloeb: Math.max(50, Math.min(600, Math.round((40 + flade / 40) / 10) * 10)) };
}

function prisHtml(p) {
  return "<img src='billeder/" + (p.stella ? "krystal" : "glimt") + ".png' alt=''>" + p.beloeb;
}


// -------------------------------------------------------------
//  Shoppens kategorier (lavet ud fra dit møbel-katalog)
// -------------------------------------------------------------
const KAT_IKON = {
  "Reception": "🛎️", "Lobby": "🛋️", "Senge": "🛏️", "Lamper": "💡", "Tæpper": "🧶", "Planter": "🪴",
  "Dekoration": "🖼️", "Opbevaring": "📚", "Restaurant og bar": "🍷", "Bad og spa": "🛁", "Have": "🌳",
  "Pool": "🏊", "Spil": "🎲", "Døre og vinduer": "🚪", "Special": "💜",
};

const SHOP_KAT = [];
(function () {
  const perKat = {};
  MOEBLER.forEach(function (m) {
    if (!m.kategori) return;
    (perKat[m.kategori] = perKat[m.kategori] || []).push(m);
  });
  const navne = Object.keys(perKat);
  SHOP_KAT.push({ navn: "Populære", ikon: "⭐", ting: navne.flatMap(function (k) { return perKat[k].slice(0, 2); }) });
  SHOP_KAT.push({ navn: "Nyt", ikon: "✨", ting: navne.flatMap(function (k) { return perKat[k].slice(-2); }).reverse() });
  SHOP_KAT.push({ navn: "Siddepladser", ikon: "🪑", ting: MOEBLER.filter(function (m) { return m.saede && m.kategori; }) });
  navne.forEach(function (k) {
    SHOP_KAT.push({ navn: k === "Special" ? "Særlige" : k, ikon: KAT_IKON[k] || "📦", ting: perKat[k] });
  });
})();

let shopFane = "moebler";
let shopKat = SHOP_KAT[0];
let shopValgt = null;

function visShop() {
  if (shopVindue.hidden) return;
  document.getElementById("shop-glimt").textContent = glimt.toLocaleString("da-DK");
  document.getElementById("shop-stella").textContent = krystaller.toLocaleString("da-DK");
  document.querySelectorAll("#shop-faner button").forEach(function (f) {
    f.classList.toggle("aktiv", f.dataset.fane === shopFane);
  });

  const kat = document.getElementById("shop-kat");
  const gitter = document.getElementById("shop-gitter");
  kat.innerHTML = "";
  gitter.innerHTML = "";

  if (shopFane !== "moebler") {
    kat.hidden = true;
    const hvad = { toej: "Tøj", dyr: "Kæledyr", items: "Items" }[shopFane];
    gitter.innerHTML = "<p class='butik-tom'>✨ " + hvad + " kommer snart ✨<br><small>Der ligger noget og venter bag disken …</small></p>";
    visShopValgt();
    return;
  }
  kat.hidden = false;
  SHOP_KAT.forEach(function (k) {
    const knap = document.createElement("button");
    knap.innerHTML = "<span>" + k.ikon + "</span>" + k.navn;
    if (k === shopKat) knap.className = "aktiv";
    knap.addEventListener("click", function () { shopKat = k; visShop(); gitter.scrollTop = 0; });
    kat.appendChild(knap);
  });
  shopKat.ting.forEach(function (type) {
    const p = pris(type);
    const knap = document.createElement("button");
    knap.className = "butik-ting" + (type === shopValgt ? " aktiv" : "") + (p.stella ? " stella" : "");
    knap.title = type.navn;
    knap.appendChild(lavTingBillede(type, 64));
    const pr = document.createElement("span");
    pr.className = "butik-pris";
    pr.innerHTML = prisHtml(p);
    knap.appendChild(pr);
    knap.addEventListener("click", function () { shopValgt = type; visShop(); });
    gitter.appendChild(knap);
  });
  visShopValgt();
}

function visShopValgt() {
  const boks = document.getElementById("shop-valgt");
  if (!shopValgt || shopFane !== "moebler") { boks.hidden = true; return; }
  boks.hidden = false;
  tegnTing(document.getElementById("shop-valgt-billede"), shopValgt);
  document.getElementById("shop-valgt-navn").textContent = shopValgt.navn;
  const p = pris(shopValgt);
  const har = lager.filter(function (t) { return t.type === shopValgt.id; }).length;
  document.getElementById("shop-valgt-pris").innerHTML = prisHtml(p) + (har ? " · du har " + har : "");
  const kanKoebe = p.stella ? krystaller >= p.beloeb : glimt >= p.beloeb;
  const koeb = document.getElementById("shop-koeb");
  koeb.disabled = !kanKoebe;
  koeb.textContent = kanKoebe ? "Køb" : "Ikke nok " + (p.stella ? "Stella" : "Glimt");
}

document.getElementById("shop-koeb").addEventListener("click", function () {
  if (!shopValgt) return;
  const p = pris(shopValgt);
  const betalt = p.stella ? brugKrystaller(p.beloeb) : brugGlimt(p.beloeb);
  if (!betalt) return;
  tilLager(shopValgt.id);
  svaev("🛍️");
  besked.textContent = "Du købte " + shopValgt.navn + "! Den ligger i Mine ting 📦";
  visShop();
});

document.querySelectorAll("#shop-faner button").forEach(function (f) {
  f.addEventListener("click", function () { shopFane = f.dataset.fane; visShop(); });
});

function aabnShop() {
  shopVindue.hidden = false;
  visShop();
}


// -------------------------------------------------------------
//  Mine ting / Lager
// -------------------------------------------------------------
const LAGER_KAT = [
  { id: "alle", navn: "Alle ting", ikon: "📦" },
  { id: "moebler", navn: "Møbler", ikon: "🛋️" },
  { id: "toej", navn: "Tøj", ikon: "👕" },
  { id: "items", navn: "Items", ikon: "⭐" },
  { id: "dyr", navn: "Kæledyr", ikon: "🐾" },
];
let lagerKat = "alle";
let lagerValgt = null;
const lagerSoeg = document.getElementById("lager-soeg");
const lagerSorter = document.getElementById("lager-sorter");

function lagerAntal(kat) {
  // lige nu er alle ting møbler; tøj, items og kæledyr kommer senere
  return kat === "alle" || kat === "moebler" ? lager.length : 0;
}

function visLager() {
  if (lagerVindue.hidden) return;
  const kat = document.getElementById("lager-kat");
  kat.innerHTML = "";
  LAGER_KAT.forEach(function (k) {
    const knap = document.createElement("button");
    knap.innerHTML = "<span>" + k.ikon + "</span><b>" + k.navn + "<small>" + lagerAntal(k.id) + "</small></b>";
    if (k.id === lagerKat) knap.className = "aktiv";
    knap.addEventListener("click", function () { lagerKat = k.id; visLager(); });
    kat.appendChild(knap);
  });

  // ens ting samles i én rude med et tal på
  const grupper = {};
  if (lagerKat === "alle" || lagerKat === "moebler") {
    lager.forEach(function (t) {
      const g = grupper[t.type] || (grupper[t.type] = { type: MOEBEL_TYPER[t.type], antal: 0, nyest: 0, aeldst: Infinity });
      g.antal++;
      g.nyest = Math.max(g.nyest, t.tid);
      g.aeldst = Math.min(g.aeldst, t.tid);
    });
  }
  const soeg = lagerSoeg.value.trim().toLowerCase();
  let liste = Object.values(grupper).filter(function (g) {
    return g.type && (!soeg || g.type.navn.toLowerCase().indexOf(soeg) >= 0 || (g.type.kategori || "").toLowerCase().indexOf(soeg) >= 0);
  });
  if (lagerSorter.value === "navn") liste.sort(function (a, b) { return a.type.navn.localeCompare(b.type.navn, "da", { numeric: true }); });
  else if (lagerSorter.value === "aeldste") liste.sort(function (a, b) { return a.aeldst - b.aeldst; });
  else liste.sort(function (a, b) { return b.nyest - a.nyest; });

  const gitter = document.getElementById("lager-gitter");
  gitter.innerHTML = "";
  if (!liste.length) {
    gitter.innerHTML = soeg
      ? "<p class='butik-tom'>Ingen ting hedder sådan.</p>"
      : lagerKat === "alle" || lagerKat === "moebler"
        ? "<p class='butik-tom'>Du har ingen ting endnu.<br><small>Køb noget i shoppen 🛒, eller saml et møbel op i dit værelse.</small></p>"
        : "<p class='butik-tom'>Her kommer dine ting, når de kan købes i shoppen ✨</p>";
  }
  liste.forEach(function (g) {
    const knap = document.createElement("button");
    knap.className = "butik-ting" + (g.type === lagerValgt ? " aktiv" : "");
    knap.title = g.type.navn;
    knap.appendChild(lavTingBillede(g.type, 64));
    if (g.antal > 1) {
      const tal = document.createElement("span");
      tal.className = "lager-tal";
      tal.textContent = "×" + g.antal;
      knap.appendChild(tal);
    }
    knap.addEventListener("click", function () { lagerValgt = g.type; visLager(); });
    gitter.appendChild(knap);
  });

  const boks = document.getElementById("lager-valgt");
  const har = lagerValgt ? (grupper[lagerValgt.id] || { antal: 0 }).antal : 0;
  if (!har) { lagerValgt = null; boks.hidden = true; return; }
  boks.hidden = false;
  tegnTing(document.getElementById("lager-valgt-billede"), lagerValgt);
  document.getElementById("lager-valgt-navn").textContent = lagerValgt.navn;
  document.getElementById("lager-valgt-antal").textContent = "Du har " + har + " · " + (lagerValgt.kategori || "Møbel");
}

lagerSoeg.addEventListener("input", visLager);
lagerSorter.addEventListener("change", visLager);

// "Sæt i mit værelse": går til værelset og lader dig vælge feltet
let lagerStiller = null;
document.getElementById("lager-saet").addEventListener("click", function () {
  if (!lagerValgt) return;
  if (rumValg !== "vaerelse") skiftRum("vaerelse");
  valgtType = lagerValgt.id;
  valgtMoebel = null;
  lagerStiller = lagerValgt.id;
  lagerVindue.hidden = true;
  opdaterPanel();
});

// Når møblet står i rummet, er det ikke længere i lageret
let rumFoer = 0;
laerred.addEventListener("click", function () { rumFoer = moeblerIRummet.length; }, true);
laerred.addEventListener("click", function () {
  if (lagerStiller && moeblerIRummet.length > rumFoer) {
    fraLager(lagerStiller);
    lagerStiller = null;
  }
  if (valgtType !== lagerStiller) lagerStiller = null;
});

function aabnLager() {
  lagerVindue.hidden = false;
  visLager();
}


// -------------------------------------------------------------
//  Knapper, Esc og Glimt
// -------------------------------------------------------------
document.getElementById("chat-shop-knap").addEventListener("click", function () {
  if (shopVindue.hidden) aabnShop(); else shopVindue.hidden = true;
});
document.getElementById("chat-lager-knap").addEventListener("click", function () {
  if (lagerVindue.hidden) aabnLager(); else lagerVindue.hidden = true;
});
document.getElementById("shop-luk").addEventListener("click", function () { shopVindue.hidden = true; });
document.getElementById("lager-luk").addEventListener("click", function () { lagerVindue.hidden = true; });
window.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  shopVindue.hidden = true;
  lagerVindue.hidden = true;
});

// får man Glimt eller Stella, kan man måske købe mere
const visGlimtShop = visGlimt;
visGlimt = function () {
  visGlimtShop();
  if (typeof visShop === "function") visShop();
};
