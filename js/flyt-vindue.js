// =============================================================
//  Flyt vinduer ved at trække i deres top (ligesom i Habbo)
//  Hvor vinduet står, bliver husket til næste gang.
// =============================================================
function goerFlytbar(vindue, haandtag, noegle) {
  let flyt = { x: 0, y: 0 };
  try { flyt = JSON.parse(localStorage.getItem(noegle)) || flyt; } catch (e) {}
  let traekker = null;

  function saet() {
    // toppen af vinduet må ikke forsvinde ud af skærmen
    vindue.style.transform = "";
    const r = vindue.getBoundingClientRect();
    if (r.width > 0) {
      flyt.x = Math.max(80 - r.right, Math.min(window.innerWidth - 80 - r.left, flyt.x));
      flyt.y = Math.max(-r.top, Math.min(window.innerHeight - 50 - r.top, flyt.y));
    }
    vindue.style.transform = "translate(" + flyt.x + "px, " + flyt.y + "px)";
  }

  haandtag.style.cursor = "move";
  haandtag.addEventListener("mousedown", function (e) {
    if (e.button !== 0 || e.target.closest("button")) return;
    e.preventDefault();
    traekker = { x: e.clientX - flyt.x, y: e.clientY - flyt.y };
  });
  window.addEventListener("mousemove", function (e) {
    if (!traekker) return;
    flyt.x = e.clientX - traekker.x;
    flyt.y = e.clientY - traekker.y;
    saet();
  });
  window.addEventListener("mouseup", function () {
    if (!traekker) return;
    traekker = null;
    try { localStorage.setItem(noegle, JSON.stringify(flyt)); } catch (e) {}
  });
  // dobbeltklik på toppen sætter vinduet tilbage på sin plads
  haandtag.addEventListener("dblclick", function () {
    flyt = { x: 0, y: 0 };
    saet();
    try { localStorage.removeItem(noegle); } catch (e) {}
  });
  window.addEventListener("resize", saet);
  // når vinduet bliver vist, skal det stå hvor man sidst satte det
  new MutationObserver(function () { if (!vindue.closest("[hidden]")) saet(); })
    .observe(vindue.closest("[hidden]") || vindue, { attributes: true, attributeFilter: ["hidden"] });
  saet();
}

goerFlytbar(document.getElementById("ejer-vindue"), document.querySelector(".ejer-top"), "mit-hotel-vindue-ejer");
goerFlytbar(document.querySelector("#profil-vindue .lv-boks"), document.querySelector("#profil-vindue .lv-top"), "mit-hotel-vindue-profil");
goerFlytbar(document.querySelector("#rapport-vindue .lv-boks"), document.querySelector("#rapport-vindue .lv-top"), "mit-hotel-vindue-rapport");
goerFlytbar(document.querySelector("#garderobe-vindue .su-boks"), document.querySelector("#garderobe-vindue .su-top"), "mit-hotel-vindue-garderobe");
goerFlytbar(document.querySelector("#byt-vindue .lv-boks"), document.querySelector("#byt-vindue .lv-top"), "mit-hotel-vindue-byt");
goerFlytbar(document.getElementById("chatlog"), document.querySelector(".chatlog-top"), "mit-hotel-vindue-chatlog");
goerFlytbar(document.getElementById("nav-vindue"), document.querySelector(".nav-top"), "mit-hotel-vindue-nav");
goerFlytbar(document.getElementById("venner-vindue"), document.querySelector(".venner-top"), "mit-hotel-vindue-venner");
