// =============================================================
//  Hvor mange er online 🟢 — vises lige under bjælken øverst
//  Tæller dig selv + computer-gæsterne (bannede tæller ikke med).
//  (Rigtige spillere på andre computere kræver en server.)
// =============================================================
const onlineBoks = document.createElement("div");
onlineBoks.id = "online-tal";
onlineBoks.innerHTML = "<i class='online-prik'></i><b id='online-antal'>1</b> online";
document.body.appendChild(onlineBoks);

function hvemErOnline() {
  const navne = [FIGUR.navn];
  HAL_GAESTER.forEach(function (g) {
    if (!(typeof erBannet === "function" && erBannet(g.navn))) navne.push(g.navn);
  });
  return navne;
}

function visOnline() {
  const navne = hvemErOnline();
  document.getElementById("online-antal").textContent = navne.length;
  onlineBoks.title = "Online nu: " + navne.join(", ");
  // lige under bjælken øverst
  const bund = document.querySelector("header").getBoundingClientRect().bottom;
  onlineBoks.style.top = Math.round(bund + 6) + "px";
}

visOnline();
setInterval(visOnline, 2000);
window.addEventListener("resize", visOnline);
