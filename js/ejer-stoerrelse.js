// =============================================================
//  Gør Ejerpanelet større ↘
//  Træk i hjørnet nede til venstre (eller i venstre kant / bunden) for at gøre
//  panelet større eller mindre. ⤢-knappen i toppen gør det næsten fuld skærm.
//  Størrelsen huskes. Gælder også MOD- og Eventvært-panelet.
//  Dobbeltklik på hjørnet sætter det tilbage til normal størrelse.
// =============================================================
const EJER_STR_NOEGLE = "mit-hotel-ejer-stoerrelse";
const EJER_MIN = { b: 480, h: 380 };

let ejerStr = null;            // { b, h } eller null = normal størrelse
try { ejerStr = JSON.parse(localStorage.getItem(EJER_STR_NOEGLE) || "null"); } catch (e) {}

function ejerMaks() { return { b: window.innerWidth, h: window.innerHeight }; }

function saetEjerStr(str, gem) {
  ejerStr = str;
  if (str) {
    const m = ejerMaks();
    str.b = Math.max(EJER_MIN.b, Math.min(m.b, Math.round(str.b)));
    str.h = Math.max(EJER_MIN.h, Math.min(m.h, Math.round(str.h)));
    ejerVindue.style.width = str.b + "px";
    ejerVindue.style.height = str.h + "px";
  } else {
    ejerVindue.style.width = "";
    ejerVindue.style.height = "";
  }
  ejerVindue.classList.toggle("stor", !!str && str.b >= 900);
  if (gem) {
    try {
      if (str) localStorage.setItem(EJER_STR_NOEGLE, JSON.stringify(str)); else localStorage.removeItem(EJER_STR_NOEGLE);
    } catch (e) {}
  }
  stoerKnap.textContent = erNaestenFuld() ? "🗗" : "⤢";
  stoerKnap.title = erNaestenFuld() ? "Normal størrelse" : "Gør panelet stort";
}
function erNaestenFuld() {
  const m = ejerMaks();
  return !!ejerStr && ejerStr.b >= m.b - 40 && ejerStr.h >= m.h - 40;
}

// ⤢-knappen ved siden af ✕
const stoerKnap = document.createElement("button");
stoerKnap.type = "button";
stoerKnap.className = "su-luk ejer-stoer";
document.getElementById("ejer-luk").before(stoerKnap);
stoerKnap.addEventListener("click", function () {
  if (erNaestenFuld()) { saetEjerStr(null, true); return; }
  // stort: fylder næsten hele skærmen, og står i hjørnet igen
  ejerVindue.style.transform = "";
  try { localStorage.removeItem("mit-hotel-vindue-ejer"); } catch (e) {}
  const m = ejerMaks();
  saetEjerStr({ b: m.b, h: m.h }, true);
});

// Håndtag: hjørnet nede til venstre, venstre kant og bunden
[["hjoerne", true, true], ["venstre", true, false], ["bund", false, true]].forEach(function (h) {
  const greb = document.createElement("div");
  greb.className = "ejer-greb ejer-greb-" + h[0];
  greb.title = "Træk for at gøre panelet større";
  ejerVindue.appendChild(greb);
  greb.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const r = ejerVindue.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, b: r.width, h: r.height };
    document.body.classList.add("ejer-traekker");
    function flyt(ev) {
      saetEjerStr({
        b: h[1] ? start.b + (start.x - ev.clientX) : start.b,
        h: h[2] ? start.h + (ev.clientY - start.y) : start.h,
      }, false);
    }
    function slip() {
      window.removeEventListener("mousemove", flyt);
      window.removeEventListener("mouseup", slip);
      document.body.classList.remove("ejer-traekker");
      saetEjerStr(ejerStr, true);
    }
    window.addEventListener("mousemove", flyt);
    window.addEventListener("mouseup", slip);
  });
  greb.addEventListener("dblclick", function () { saetEjerStr(null, true); });
});

saetEjerStr(ejerStr, false);
window.addEventListener("resize", function () { if (ejerStr) saetEjerStr(ejerStr, false); });


// Indholdet bruger den ekstra plads (flere kort og skilte pr. række)
const ejerStrStil = document.createElement("style");
ejerStrStil.textContent =
  "#ejer-vindue { max-width: 100vw; max-height: 100vh; box-sizing: border-box; }" +
  ".ejer-greb { position: absolute; z-index: 2; }" +
  ".ejer-greb-venstre { left: 0; top: 60px; bottom: 26px; width: 10px; cursor: ew-resize; }" +
  ".ejer-greb-bund { left: 26px; right: 10px; bottom: 0; height: 10px; cursor: ns-resize; }" +
  ".ejer-greb-hjoerne { left: 0; bottom: 0; width: 26px; height: 26px; cursor: nesw-resize;" +
  " background: linear-gradient(45deg, transparent 0 40%, #4e7d4a 40% 48%, transparent 48% 60%, #4e7d4a 60% 68%, transparent 68%);" +
  " transform: scaleX(-1); border-radius: 0 0 0 12px; opacity: 0.8; }" +
  ".ejer-greb-hjoerne:hover { opacity: 1; }" +
  "body.ejer-traekker, body.ejer-traekker * { user-select: none !important; }" +
  "#ejer-vindue .ejer-top .ejer-stoer { margin-right: 6px; }" +
  "#ejer-vindue .ejer-kort-raekke { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }" +
  "#ejer-vindue .ejer-filtre { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }" +
  "#ejer-vindue .sp-fakta { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }" +
  "#ejer-vindue .an-skilte { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }" +
  "#ejer-vindue.stor .an-krop { grid-template-columns: 180px 1fr; }" +
  "#ejer-vindue.stor .ejer-boks { grid-template-columns: 220px 1fr; }" +
  "#ejer-vindue.stor .an-beskrivelser { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); align-items: start; }" +
  "#ejer-vindue.stor .rap-liste { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 10px; align-items: start; }" +
  "#ejer-vindue.stor .rap-liste li.rap-kort { margin: 0; }" +
  "#ejer-vindue.stor .sp-info-side { max-height: 480px; }";
document.head.appendChild(ejerStrStil);
