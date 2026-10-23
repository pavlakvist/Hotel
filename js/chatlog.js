// =============================================================
//  Chatlog for alle spillere: alt hvad der bliver sagt i rummet
//  Boksen kan flyttes (træk i toppen) og gøres større (træk i hjørnet).
//  Hvor den står, og hvor stor den er, bliver husket.
// =============================================================
const chatlogBoks = document.getElementById("chatlog");
const chatlogListe = document.getElementById("chatlog-liste");
const CHATLOG_STR_NOEGLE = "mit-hotel-chatlog-stoerrelse";
const CHATLOG_VIS_NOEGLE = "mit-hotel-chatlog-vis";

function chatlogLinje(html, klasse) {
  const li = document.createElement("li");
  if (klasse) li.className = klasse;
  li.innerHTML = html;
  // bliv kun i bunden, hvis man ikke har rullet op for at læse
  const iBunden = chatlogListe.scrollHeight - chatlogListe.scrollTop - chatlogListe.clientHeight < 30;
  chatlogListe.appendChild(li);
  while (chatlogListe.children.length > 300) chatlogListe.removeChild(chatlogListe.firstChild);
  if (iBunden) chatlogListe.scrollTop = chatlogListe.scrollHeight;
}

function tegnTilHtml(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Hver gang nogen siger noget, kommer det i chatloggen
const sigChatlog = sig;
sig = function (hvem, navn, tekst) {
  sigChatlog(hvem, navn, tekst);
  if (!String(tekst).trim()) return;
  const stil = hvem === figur ? minBoble : GAEST_BOBLER[navn] || {};
  const tid = new Date().toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  chatlogLinje("<span class='cl-tid'>" + tid + "</span> " +
    "<b style='color:" + (stil.navnFarve || "#2f4a63") + "'>" + tegnTilHtml(navn) + ":</b> " + tegnTilHtml(String(tekst).trim()));
};

// Når man går ind i et nyt rum, starter loggen forfra
function nytRumILog() {
  chatlogListe.innerHTML = "";
  chatlogLinje("Du er gået ind i " + (rumValg === "hal" ? "Velkomsthallen" : "dit værelse"), "cl-rum");
}
const skiftRumChatlog = skiftRum;
skiftRum = function (navn) {
  skiftRumChatlog(navn);
  nytRumILog();
};
nytRumILog();

// Vis og skjul
function visChatlog(vis) {
  chatlogBoks.hidden = !vis;
  try { localStorage.setItem(CHATLOG_VIS_NOEGLE, vis ? "ja" : "nej"); } catch (e) {}
  if (vis) chatlogListe.scrollTop = chatlogListe.scrollHeight;
}
document.getElementById("chatlog-luk").addEventListener("click", function () { visChatlog(false); });
document.getElementById("chat-log-knap").addEventListener("click", function () { visChatlog(chatlogBoks.hidden); });
try { if (localStorage.getItem(CHATLOG_VIS_NOEGLE) === "nej") chatlogBoks.hidden = true; } catch (e) {}

// Husk størrelsen, når man trækker i hjørnet
try {
  const str = JSON.parse(localStorage.getItem(CHATLOG_STR_NOEGLE));
  if (str) { chatlogBoks.style.width = str.b + "px"; chatlogBoks.style.height = str.h + "px"; }
} catch (e) {}

// Boksen starter nederst til højre (så vokser den nedad og til højre, når man trækker i hjørnet)
function placerChatlog() {
  const b = chatlogBoks.offsetWidth || 320, h = chatlogBoks.offsetHeight || 220;
  chatlogBoks.style.left = Math.max(0, window.innerWidth - b - 16) + "px";
  chatlogBoks.style.top = Math.max(0, window.innerHeight - h - 16) + "px";
}
placerChatlog();
window.addEventListener("resize", placerChatlog);

new ResizeObserver(function () {
  if (chatlogBoks.hidden || !chatlogBoks.offsetWidth) return;
  try { localStorage.setItem(CHATLOG_STR_NOEGLE, JSON.stringify({ b: chatlogBoks.offsetWidth, h: chatlogBoks.offsetHeight })); } catch (e) {}
}).observe(chatlogBoks);
