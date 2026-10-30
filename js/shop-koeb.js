// =============================================================
//  🛒 Køb i Shoppen: vælg antal, bekræft købet, og se hvor mange du har
//  - Under et møbel kan man vælge, hvor mange man vil købe (− 1 +).
//  - Når man trykker Køb, kommer der et lille vindue: "Vil du købe …?"
//    Først når man trykker ✔ Ja, køb, bliver der betalt.
//  - Har man møblet i Mine ting, står der et lille tal på det i Shoppen.
//  (Hentes fra js/panel-forklaring.js.)
// =============================================================

const KOEB_MAKS = 99;          // højst så mange af gangen
let koebAntal = 1;
let koebSidstValgt = null;     // nulstil antal, når man vælger et nyt møbel
let koebGodkendt = false;      // sat lige før et bekræftet tøj-køb, så købet får lov at gå igennem

// ----- Hvor mange har jeg af det her møbel? -----
function koebHarAntal(id) {
  return lager.filter(function (t) { return t.type === id; }).length;
}

// ----- Antal-vælgeren under det valgte møbel -----
const koebAntalBoks = document.createElement("div");
koebAntalBoks.id = "shop-antal";
koebAntalBoks.innerHTML =
  "<button type='button' data-v='-1' title='Færre'>−</button>" +
  "<input type='number' min='1' max='" + KOEB_MAKS + "' value='1' aria-label='Antal'>" +
  "<button type='button' data-v='1' title='Flere'>+</button>";
const koebAntalFelt = koebAntalBoks.querySelector("input");
document.getElementById("shop-koeb").before(koebAntalBoks);

function koebPris() {
  const p = pris(shopValgt);
  return { stella: p.stella, beloeb: p.beloeb * koebAntal, stk: p.beloeb };
}
function koebHarRaad(beloeb, stella) { return stella ? krystaller >= beloeb : glimt >= beloeb; }

function saetKoebAntal(n) {
  koebAntal = Math.max(1, Math.min(KOEB_MAKS, Math.floor(n) || 1));
  koebAntalFelt.value = koebAntal;
  opdaterKoebKnap();
}
koebAntalBoks.querySelectorAll("button").forEach(function (b) {
  b.addEventListener("click", function () { saetKoebAntal(koebAntal + Number(b.dataset.v)); });
});
koebAntalFelt.addEventListener("input", function () {
  if (koebAntalFelt.value === "") return;        // lad folk slette og skrive et nyt tal
  saetKoebAntal(Number(koebAntalFelt.value));
});
koebAntalFelt.addEventListener("blur", function () { saetKoebAntal(Number(koebAntalFelt.value)); });

// Knappen og prisen følger antallet
function opdaterKoebKnap() {
  const moebel = shopFane === "moebler" && shopValgt;
  koebAntalBoks.hidden = !moebel;
  if (!moebel) return;
  const p = koebPris();
  const koeb = document.getElementById("shop-koeb");
  const kan = koebHarRaad(p.beloeb, p.stella);
  koeb.disabled = !kan;
  koeb.textContent = kan ? (koebAntal > 1 ? "Køb " + koebAntal : "Køb") : "Ikke nok " + (p.stella ? "Stella" : "Glimt");
  const har = koebHarAntal(shopValgt.id);
  document.getElementById("shop-valgt-pris").innerHTML = prisHtml({ stella: p.stella, beloeb: p.beloeb }) +
    (koebAntal > 1 ? " <small>(" + koebAntal + " × " + p.stk.toLocaleString("da-DK") + ")</small>" : "") +
    (har ? " · du har " + har : "");
}

// ----- Tal på de møbler, man allerede har -----
function saetKoebTal() {
  if (shopFane !== "moebler" || !shopKat) return;
  const knapper = document.querySelectorAll("#shop-gitter .butik-ting");
  shopKat.ting.forEach(function (type, i) {
    const knap = knapper[i];
    if (!knap) return;
    const gammel = knap.querySelector(".shop-har-tal");
    if (gammel) gammel.remove();
    const n = koebHarAntal(type.id);
    if (!n) return;
    const tal = document.createElement("span");
    tal.className = "shop-har-tal";
    tal.textContent = n > 99 ? "99+" : n;
    tal.title = "Du har " + n + " i Mine ting";
    knap.appendChild(tal);
  });
}

const visShopFoerKoeb = visShop;
visShop = function () {
  if (shopValgt !== koebSidstValgt) { koebSidstValgt = shopValgt; koebAntal = 1; koebAntalFelt.value = 1; }
  visShopFoerKoeb();
  opdaterKoebKnap();
  saetKoebTal();
};

// ----- Bekræft køb -----
const koebBekraeft = document.createElement("div");
koebBekraeft.id = "shop-bekraeft";
koebBekraeft.hidden = true;
koebBekraeft.innerHTML =
  "<div class='sb-boks' role='dialog' aria-modal='true'>" +
  "<b class='sb-titel'>🛍️ Bekræft køb</b>" +
  "<canvas width='72' height='72'></canvas>" +
  "<p class='sb-tekst'></p>" +
  "<p class='sb-pris'></p>" +
  "<div class='sb-knapper'><button type='button' class='sb-nej'>Fortryd</button><button type='button' class='sb-ja'>✔ Ja, køb</button></div>" +
  "</div>";
shopVindue.appendChild(koebBekraeft);
let koebVenter = null;   // det, der skal ske, når man trykker Ja

function visBekraeft(tegn, tekst, prisTekst, ja) {
  tegn(koebBekraeft.querySelector("canvas"));
  koebBekraeft.querySelector(".sb-tekst").innerHTML = tekst;
  koebBekraeft.querySelector(".sb-pris").innerHTML = prisTekst;
  koebVenter = ja;
  koebBekraeft.hidden = false;
  koebBekraeft.querySelector(".sb-ja").focus();
}
function lukBekraeft() { koebBekraeft.hidden = true; koebVenter = null; }
koebBekraeft.querySelector(".sb-nej").addEventListener("click", lukBekraeft);
koebBekraeft.addEventListener("click", function (e) { if (e.target === koebBekraeft) lukBekraeft(); });
koebBekraeft.querySelector(".sb-ja").addEventListener("click", function () {
  const ja = koebVenter;
  lukBekraeft();
  if (ja) ja();
});
document.addEventListener("keydown", function (e) {
  if (koebBekraeft.hidden) return;
  if (e.key === "Escape") { e.preventDefault(); lukBekraeft(); }
  if (e.key === "Enter") { e.preventDefault(); koebBekraeft.querySelector(".sb-ja").click(); }
}, true);
document.getElementById("shop-luk").addEventListener("click", lukBekraeft);

function koebMoebler() {
  const type = shopValgt;
  if (!type) return;
  const p = pris(type);
  let koebt = 0;
  for (let i = 0; i < koebAntal; i++) {
    const betalt = p.stella ? brugKrystaller(p.beloeb) : brugGlimt(p.beloeb);
    if (!betalt) break;
    laegILager(type.id);
    koebt++;
  }
  if (!koebt) return;
  svaev("🛍️");
  besked.textContent = "Du købte " + (koebt > 1 ? koebt + " × " : "") + type.navn + "! " +
    (koebt > 1 ? "De ligger" : "Den ligger") + " i Mine ting 📦";
  koebAntal = 1;
  koebAntalFelt.value = 1;
  visShop();
  if (typeof visLager === "function") visLager();
}

// Fanger klik på Køb, før Shoppen (og tøj-butikken) selv køber
document.addEventListener("click", function (e) {
  const koeb = e.target.closest && e.target.closest("#shop-koeb");
  if (!koeb || koeb.disabled) return;
  if (koebGodkendt) { koebGodkendt = false; return; }      // købet er bekræftet: lad det gå igennem

  if (shopFane === "moebler" && shopValgt) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const type = shopValgt, p = koebPris();
    visBekraeft(function (c) { tegnTing(c, type); },
      "Vil du købe <b>" + (koebAntal > 1 ? koebAntal + " × " : "") + type.navn + "</b>?",
      "Det koster " + prisHtml({ stella: p.stella, beloeb: p.beloeb }),
      koebMoebler);
    return;
  }

  // Tøj: kun selve købet skal bekræftes (ikke "Tag på")
  if (shopFane === "toej" && typeof toejValgt !== "undefined" && toejValgt && !harToej(toejValgt.id)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const v = toejValgt;
    visBekraeft(function (c) { if (typeof tegnToejBillede === "function") tegnToejBillede(c, v); },
      "Vil du købe <b>" + v.navn + "</b>?",
      "Det koster " + prisHtml({ stella: false, beloeb: v.pris }),
      function () { koebGodkendt = true; koeb.click(); });
  }
}, true);

// ----- Udseende (vinrød, guld og creme som resten af hotellet) -----
const koebStil = document.createElement("style");
koebStil.textContent = `
#shop-antal { flex: none; display: flex; align-items: center; gap: 4px; margin: 0 4px 0 auto; }
#shop-antal[hidden] { display: none; }
#shop-antal button { width: 30px; height: 30px; padding: 0; border: 2px solid #7a2333; border-radius: 8px;
  background: #fbf3e4; color: #7a2333; font: bold 18px/1 system-ui, sans-serif; cursor: pointer; }
#shop-antal button:hover { background: #f3dfbd; }
#shop-antal input { width: 46px; height: 30px; box-sizing: border-box; border: 2px solid #c9a76a; border-radius: 8px;
  background: #fff; color: #4a1420; font: bold 15px system-ui, sans-serif; text-align: center; -moz-appearance: textfield; }
#shop-antal input::-webkit-outer-spin-button, #shop-antal input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.butik-ting .shop-har-tal { position: absolute; top: 4px; right: 4px; min-width: 20px; height: 20px; padding: 0 5px;
  box-sizing: border-box; border-radius: 10px; background: #8a2a3e; color: #fff4dc; border: 2px solid #f1d38f;
  font: bold 11px/16px system-ui, sans-serif; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.3); pointer-events: none; }
#shop-bekraeft { position: absolute; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center;
  background: rgba(40, 10, 18, .45); border-radius: inherit; }
#shop-bekraeft[hidden] { display: none; }
#shop-bekraeft .sb-boks { width: min(300px, 86%); padding: 14px 16px 16px; border-radius: 14px; text-align: center;
  background: #fbf3e4; border: 3px solid #7a2333; box-shadow: 0 10px 30px rgba(0,0,0,.4); color: #4a1420; }
#shop-bekraeft .sb-titel { display: block; margin: -14px -16px 10px; padding: 9px; border-radius: 10px 10px 0 0;
  background: #7a2333; color: #fff4dc; font-size: 16px; }
#shop-bekraeft canvas { width: 72px; height: 72px; background: #fff; border: 2px solid #e2c99a; border-radius: 10px; }
#shop-bekraeft .sb-tekst { margin: 8px 0 4px; font-size: 15px; }
#shop-bekraeft .sb-pris { margin: 0 0 12px; font-size: 14px; font-weight: bold; }
#shop-bekraeft .sb-pris img { width: 16px; height: 16px; vertical-align: -3px; image-rendering: pixelated; }
#shop-bekraeft .sb-knapper { display: flex; gap: 8px; justify-content: center; }
#shop-bekraeft .sb-knapper button { flex: 1; padding: 8px 10px; border-radius: 9px; font: bold 14px system-ui, sans-serif; cursor: pointer; }
#shop-bekraeft .sb-nej { background: #fff; color: #7a2333; border: 2px solid #c9a76a; }
#shop-bekraeft .sb-ja { background: linear-gradient(#e9c46a, #c99a3b); color: #3d1b0c; border: 2px solid #7a2333; }
#shop-bekraeft .sb-ja:hover { filter: brightness(1.06); }
`;
document.head.appendChild(koebStil);

// Shoppen er måske allerede åben
visShop();
