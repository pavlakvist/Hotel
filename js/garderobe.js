// =============================================================
//  GARDEROBEN — vælg tøj fra dine tøj-ark.
//  Tøjet vises på et outfit-kort, og frisuren bliver dit profilbillede,
//  som står ved dit navn inde i rummet.
//  (Figuren, der går rundt i rummet, har stadig hotel-uniformen på.)
// =============================================================

const OUTFIT_NOEGLE = "mit-hotel-outfit";

// Hvor tingene ligger på outfit-kortet. Hvert felt har et navn (område),
// og hver figur har sin egen liste over, hvilken ting der ligger i hvilket felt.
const KORT_FELTER = {
  pige: { hat: "hat", frisure: "frisure", pynt: "haarpynt", jakke: "jakke", top: "top", smykke: "smykke",
          taske: "taske", under: "underdel", ekstra: "ekstra", stroemper: "stroemper", sko: "sko", briller: "briller" },
  dreng: { hat: "hat", frisure: "frisure", pynt: "tilbehoer", jakke: "jakke", top: "top", smykke: "ekstra",
           taske: "taske", under: "underdel", sko: "sko" },
};

let outfit = { pige: {}, dreng: {} };
try {
  const gemt = JSON.parse(localStorage.getItem(OUTFIT_NOEGLE));
  if (gemt && typeof gemt === "object") outfit = Object.assign(outfit, gemt);
} catch (fejl) {
  // intet gemt endnu
}
let valgtFane = "frisure";

function gemOutfit() {
  try {
    localStorage.setItem(OUTFIT_NOEGLE, JSON.stringify(outfit));
  } catch (fejl) {
    // kan ikke gemme, men valget virker stadig nu
  }
}

// pige eller dreng, efter hvilken figur man har valgt
function hvem() {
  return garderobe.type === "mand" ? "dreng" : "pige";
}

// navnet på en fane (drengen har kun bukser, ikke nederdele)
function fanenavn(slot) {
  if (slot === "underdel" && hvem() === "dreng") return "Bukser";
  return TOEJ_NAVNE[slot] || slot;
}

function toejSti(fil) {
  return "billeder/toej/" + hvem() + "/" + fil;
}

// ----- Profilbilledet ved navnet i rummet -----
const profilBilleder = {};
function profilBillede() {
  const fil = outfit[hvem()].frisure;
  if (!fil) return null;
  const sti = toejSti(fil);
  if (!profilBilleder[sti]) {
    profilBilleder[sti] = new Image();
    profilBilleder[sti].src = sti;
  }
  return profilBilleder[sti];
}

// ----- Vinduet -----
const vindue = document.getElementById("garderobe-vindue");

function aabnGarderobe() {
  if (!TOEJ[hvem()][valgtFane]) valgtFane = "frisure";
  vindue.hidden = false;
  tegnGarderobe();
}

function lukGarderobe() {
  vindue.hidden = true;
}

function tegnGarderobe() {
  tegnFaner();
  tegnTing();
  tegnKort();
}

function tegnFaner() {
  const boks = document.getElementById("gv-faner");
  boks.innerHTML = "";
  for (const slot in TOEJ[hvem()]) {
    const knap = document.createElement("button");
    knap.textContent = fanenavn(slot);
    knap.classList.toggle("aktiv", slot === valgtFane);
    knap.addEventListener("click", function () {
      valgtFane = slot;
      tegnGarderobe();
    });
    boks.appendChild(knap);
  }
}

function tegnTing() {
  const boks = document.getElementById("gv-ting");
  boks.innerHTML = "";
  const mine = outfit[hvem()];
  TOEJ[hvem()][valgtFane].forEach(function (fil) {
    const knap = document.createElement("button");
    knap.className = "gv-ting-knap";
    knap.classList.toggle("aktiv", mine[valgtFane] === fil);
    const b = document.createElement("img");
    b.src = toejSti(fil);
    b.alt = "";
    knap.appendChild(b);
    knap.addEventListener("click", function () {
      // klik igen for at tage tingen af
      mine[valgtFane] = mine[valgtFane] === fil ? null : fil;
      // en kjole erstatter top og underdel, og omvendt
      if (valgtFane === "kjole" && mine.kjole) { mine.top = null; mine.underdel = null; }
      if ((valgtFane === "top" || valgtFane === "underdel") && mine[valgtFane]) mine.kjole = null;
      gemOutfit();
      tegnGarderobe();
    });
    boks.appendChild(knap);
  });
}

function tegnKort() {
  const kort = document.getElementById("outfit-kort");
  kort.innerHTML = "";
  const felter = KORT_FELTER[hvem()];
  const mine = outfit[hvem()];
  for (const felt in felter) {
    let slot = felter[felt];
    // kjolen ligger, hvor toppen ellers er, og fylder også bukse-feltet
    if (felt === "top" && mine.kjole) slot = "kjole";
    if (felt === "under" && mine.kjole) continue;
    const celle = document.createElement("button");
    celle.className = "kort-felt";
    celle.style.gridArea = felt;
    if (slot === "kjole") celle.classList.add("kjole");
    celle.title = fanenavn(slot);
    if (mine[slot]) {
      const b = document.createElement("img");
      b.src = toejSti(mine[slot]);
      b.alt = fanenavn(slot);
      celle.appendChild(b);
    } else {
      const t = document.createElement("span");
      t.textContent = fanenavn(slot);
      celle.appendChild(t);
    }
    celle.addEventListener("click", function () {
      valgtFane = slot;
      tegnGarderobe();
    });
    kort.appendChild(celle);
  }
}

// Et tilfældigt outfit, bare for sjov
function tilfaeldigtOutfit() {
  const mine = {};
  const alle = TOEJ[hvem()];
  const valg = function (slot) {
    const l = alle[slot];
    return l && l.length ? l[Math.floor(Math.random() * l.length)] : null;
  };
  mine.frisure = valg("frisure");
  if (Math.random() < 0.3 && alle.kjole) mine.kjole = valg("kjole");
  else { mine.top = valg("top"); mine.underdel = valg("underdel"); }
  mine.sko = valg("sko");
  ["hat", "jakke", "taske", "smykke", "tilbehoer", "haarpynt"].forEach(function (slot) {
    if (alle[slot] && Math.random() < 0.5) mine[slot] = valg(slot);
  });
  outfit[hvem()] = mine;
  gemOutfit();
  tegnGarderobe();
}

document.getElementById("knap-garderobe").addEventListener("click", aabnGarderobe);
document.getElementById("gv-luk").addEventListener("click", lukGarderobe);
document.getElementById("gv-tilfaeldig").addEventListener("click", tilfaeldigtOutfit);
vindue.addEventListener("click", function (e) {
  if (e.target === vindue) lukGarderobe();   // klik udenfor lukker
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !vindue.hidden) lukGarderobe();
});
