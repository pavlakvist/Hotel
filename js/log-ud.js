// =============================================================
//  🚪 Log ud
//  Knap øverst ved siden af @ Mentions. Første klik spørger "Er du sikker?",
//  andet klik logger ud og sender dig tilbage til forsiden.
// =============================================================
const logUdKnap = document.createElement("button");
logUdKnap.type = "button";
logUdKnap.id = "log-ud-knap";
logUdKnap.title = "Log ud af hotellet";
logUdKnap.textContent = "🚪 Log ud";
(document.getElementById("mention-knap") || document.querySelector("header h1")).after(logUdKnap);

let logUdTimer = null;
logUdKnap.addEventListener("click", function () {
  if (!logUdKnap.classList.contains("sikker")) {
    logUdKnap.classList.add("sikker");
    logUdKnap.textContent = "Er du sikker? Tryk igen";
    clearTimeout(logUdTimer);
    logUdTimer = setTimeout(function () {
      logUdKnap.classList.remove("sikker");
      logUdKnap.textContent = "🚪 Log ud";
    }, 4000);
    return;
  }
  try { logUd(); } catch (e) {}
  location.href = "index.html";
});

const logUdStil = document.createElement("style");
logUdStil.textContent =
  "#log-ud-knap { margin-left: 8px; padding: 4px 10px; border: 2px solid #9ccc8f; border-radius: 8px;" +
  " background: #fbf6ea; color: #4e7d4a; font: bold 12px Verdana, sans-serif; cursor: pointer; }" +
  "#log-ud-knap:hover { background: #eef7e6; }" +
  "#log-ud-knap.sikker { background: #d64545; border-color: #a83232; color: #fff; }";
document.head.appendChild(logUdStil);
