// =============================================================
//  🍷 Vinrødt hotel-tema
//  Alt det grønne i knapper, bjælker, vinduer og Ejerpanelet bliver til
//  et luksuriøst hotel-tema: dyb vinrød, guld og varm creme.
//  Det sker ved at skifte farverne i stilarkene, når siden åbner
//  (også dem, andre scripts laver senere). Farver, man selv vælger
//  (vægfarver, boblefarver, bannerfarver), bliver som de er.
//    mørkegrøn  → vinrød
//    mellemgrøn → guld
//    lysegrøn   → varm creme
// =============================================================

function vinFarve(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const maks = Math.max(r, g, b), min = Math.min(r, g, b), l = (maks + min) / 2, f = maks - min;
  if (f < 0.04) return null;
  const s = f / (1 - Math.abs(2 * l - 1));
  let h = maks === r ? ((g - b) / f) % 6 : maks === g ? (b - r) / f + 2 : (r - g) / f + 4;
  h = (h * 60 + 360) % 360;
  if (h < 70 || h > 175 || s < 0.12) return null;            // ikke grøn
  if (s > 0.45 && l > 0.35 && l < 0.65) return null;          // klar "online"-grøn bliver grøn
  let nh, ns, nl;
  if (l < 0.45) { nh = 345; ns = Math.min(0.62, s + 0.25); nl = l * 0.85; }   // vinrød
  else if (l < 0.8) { nh = 40; ns = 0.5; nl = l; }                            // guld
  else { nh = 32; ns = 0.55; nl = Math.max(l, 0.9); }                          // varm creme
  return hslTilRgb(nh, ns, nl);
}
function hslTilRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgb.map(function (v) { return Math.round((v + m) * 255); });
}
// Skift alle grønne farver i en tekst som "1px solid rgb(78, 125, 74)"
function vinTekst(tekst) {
  return tekst
    .replace(/rgba?\(([^)]+)\)/g, function (hel, tal) {
      const d = tal.split(/[,\s/]+/).filter(Boolean).map(parseFloat);
      const ny = vinFarve(d[0], d[1], d[2]);
      if (!ny) return hel;
      return d.length > 3 ? "rgba(" + ny.join(", ") + ", " + d[3] + ")" : "rgb(" + ny.join(", ") + ")";
    })
    .replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, function (hel, hx) {
      if (hx.length === 3) hx = hx[0] + hx[0] + hx[1] + hx[1] + hx[2] + hx[2];
      const n = parseInt(hx, 16);
      const ny = vinFarve((n >> 16) & 255, (n >> 8) & 255, n & 255);
      return ny ? "rgb(" + ny.join(", ") + ")" : hel;
    });
}

// ----- Stilarkene -----
const vinFaerdige = new WeakSet();
function vinRegler(regler) {
  for (let i = 0; i < regler.length; i++) {
    const r = regler[i];
    if (r.style) {
      for (let j = 0; j < r.style.length; j++) {
        const eg = r.style[j];
        if (eg.indexOf("color") < 0 && eg.indexOf("background") < 0 && eg !== "box-shadow" && eg !== "text-shadow" && eg !== "fill" && eg !== "stroke") continue;
        const v = r.style.getPropertyValue(eg);
        if (!v || v.indexOf("url(") >= 0) continue;
        const ny = vinTekst(v);
        if (ny !== v) r.style.setProperty(eg, ny, r.style.getPropertyPriority(eg));
      }
    }
    if (r.cssRules) vinRegler(r.cssRules);
  }
}
function vinArk(ark) {
  if (!ark || vinFaerdige.has(ark)) return;
  try { vinRegler(ark.cssRules); vinFaerdige.add(ark); }
  catch (e) {
    // Firefox må ikke læse stilarket, når hotellet åbnes fra computeren (file:///).
    // Så farves hvert element i stedet (se vinElementer herunder).
    if (e && e.name === "SecurityError") setTimeout(vinStartElementer, 0);
  }
}
function vinAlleArk() {
  for (let i = 0; i < document.styleSheets.length; i++) vinArk(document.styleSheets[i]);
}
vinAlleArk();

// Nye <style> og <link>, som andre scripts tilføjer senere
new MutationObserver(function (liste) {
  liste.forEach(function (m) {
    m.addedNodes.forEach(function (n) {
      if (n.nodeName === "STYLE") vinArk(n.sheet);
      else if (n.nodeName === "LINK") n.addEventListener("load", function () { vinArk(n.sheet); });
    });
  });
}).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("load", vinAlleArk);
setTimeout(vinAlleArk, 1500);

// ----- Reserve: farv elementerne ét for ét -----
// Bruges kun, når stilarket ikke kan læses (Firefox + file:///).
const VIN_EGENSKABER = ["color", "background-color", "background-image", "border-top-color", "border-right-color",
  "border-bottom-color", "border-left-color", "outline-color", "box-shadow"];
const vinGemt = new WeakMap();     // element → dets egen stil, før det blev farvet
let vinElementerTil = false, vinKoe = new Set(), vinVenter = false;
function vinEt(el) {
  if (vinGemt.has(el)) el.style.cssText = vinGemt.get(el);
  const egen = el.style;
  const cs = getComputedStyle(el);
  const nye = [];
  VIN_EGENSKABER.forEach(function (eg) {
    if (egen.getPropertyValue(eg) || (eg === "background-color" && egen.getPropertyValue("background"))) return;  // selvvalgt farve
    const v = cs.getPropertyValue(eg);
    if (!v || v === "none" || v.indexOf("rgb") < 0 || v.indexOf("url(") >= 0) return;
    const ny = vinTekst(v);
    if (ny !== v) nye.push([eg, ny]);
  });
  if (!nye.length) return;
  if (!vinGemt.has(el)) vinGemt.set(el, egen.cssText);
  nye.forEach(function (x) { egen.setProperty(x[0], x[1], "important"); });
}
function vinKoeEl(el) {
  if (el.nodeType !== 1 || el.closest("canvas, .bs-farver, .bs-forhaand, .or-farver")) return;
  vinKoe.add(el);
  if (!vinVenter) { vinVenter = true; requestAnimationFrame(vinTomKoe); }
}
function vinTomKoe() {
  vinVenter = false;
  const liste = Array.from(vinKoe); vinKoe.clear();
  liste.forEach(function (el) { if (el.isConnected) vinEt(el); });
}
function vinStartElementer() {
  if (vinElementerTil) return;
  vinElementerTil = true;
  document.querySelectorAll("body *").forEach(vinKoeEl);
  new MutationObserver(function (liste) {
    liste.forEach(function (m) {
      if (m.type === "attributes") { vinKoeEl(m.target); m.target.querySelectorAll("*").forEach(vinKoeEl); return; }
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        vinKoeEl(n); n.querySelectorAll("*").forEach(vinKoeEl);
      });
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
}

// ----- Navneskiltene over figurerne (tegnes i spillet, ikke med CSS) -----
const VIN_LAERRED = { "#4e7d4a": "#8a2a3e", "#2f4a2b": "#5a1626", "#e7f3e2": "#f7e7cf" };
["fillStyle", "strokeStyle"].forEach(function (eg) {
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, eg);
  if (!d || !d.set) return;
  Object.defineProperty(CanvasRenderingContext2D.prototype, eg, {
    configurable: true,
    get: d.get,
    set: function (v) { d.set.call(this, typeof v === "string" && VIN_LAERRED[v.toLowerCase()] || v); },
  });
});
