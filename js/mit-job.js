// =============================================================
//  📖 Mit job — de ansatte kan selv se, hvad deres job går ud på
//  - I panelet (MOD, Eventvært og ejeren) er der fanen "📖 Mit job".
//  - I Min profil står jobbet for alle med et skilt (fx Bygmester, Hjælper, VIP).
//  Opdateres med det samme, hvis ejeren giver et nyt skilt eller fyrer en.
//  Beskrivelserne står i JOB_KAN i js/ansaettelse.js.
// =============================================================
const EJER_KAN = ["👑 Du ejer hotellet og kan alt", "🛡 Ser alle fanerne i panelet",
  "🎖️ Giver og tager job i Ansættelse", "💰 Giver Glimt og Stella til spillerne",
  "🔨 Kan bygge gratis i de fælles rum", "🔓 Kommer ind i alle rum"];

// Mit job lige nu: { navn, fil, tekst, kan } eller null
function mitJob() {
  if (EJERE.indexOf(FIGUR.navn) >= 0) {
    return { navn: "Ejer", fil: "billeder/skilt-ejer.png", tekst: "Du har bygget HELLO VERA og bestemmer over hele hotellet.", kan: EJER_KAN };
  }
  const sk = rolleSkilt(FIGUR.navn);
  return sk ? { navn: sk.navn, fil: sk.fil, tekst: sk.tekst, kan: jobKan(sk.id) } : null;
}
function mitJobHtml(job) {
  return "<div class='mj-top'><img src='" + job.fil + "' alt=''><div><h3>" + rens(job.navn) + "</h3><p>" + rens(job.tekst) + "</p></div></div>" +
    "<h4>Det må og skal du</h4><ul class='mj-kan'>" + job.kan.map(function (k) { return "<li>" + rens(k) + "</li>"; }).join("") + "</ul>";
}


// -------------------------------------------------------------
//  Fanen "📖 Mit job" i panelet
// -------------------------------------------------------------
ROLLE_FANER.mod.push("mitjob");
ROLLE_FANER.eventvaert.push("mitjob");
const mitJobFane = document.createElement("button");
mitJobFane.dataset.fane = "mitjob";
mitJobFane.textContent = "📖 Mit job";
document.getElementById("ejer-faner").appendChild(mitJobFane);
mitJobFane.hidden = !rolleMaa("mitjob");
mitJobFane.addEventListener("click", function () { ejerFane = "mitjob"; visFane(); });

const visFaneFoerJob = visFane;
visFane = function () {
  visFaneFoerJob();
  if (ejerFane !== "mitjob" || ejerVindue.hidden) return;
  const job = mitJob();
  ejerIndhold.innerHTML = job ? "<div class='mit-job'>" + mitJobHtml(job) +
    "<p class='ejer-info'>ℹ️ Hvis du er i tvivl om noget, så skriv til ejeren.</p></div>" : "<p class='tom'>Du har ikke noget job.</p>";
};


// -------------------------------------------------------------
//  Jobbet i Min profil
// -------------------------------------------------------------
const profilJob = document.createElement("div");
profilJob.id = "profil-job";
profilJob.hidden = true;
document.getElementById("profil-outfit").before(profilJob);

let sidsteJob = "";
function tjekMitJob() {
  const job = mitJob();
  const noegle = job ? job.navn : "";
  if (noegle === sidsteJob) return;
  sidsteJob = noegle;
  profilJob.hidden = !job;
  profilJob.innerHTML = job ? "<details><summary><img src='" + job.fil + "' alt=''> 📖 Mit job: <b>" + rens(job.navn) + "</b></summary>" +
    "<p>" + rens(job.tekst) + "</p><ul class='mj-kan'>" + job.kan.map(function (k) { return "<li>" + rens(k) + "</li>"; }).join("") + "</ul></details>" : "";
  if (!ejerVindue.hidden && ejerFane === "mitjob") visFane();
}
tjekMitJob();
setInterval(tjekMitJob, 500);


// -------------------------------------------------------------
//  Udseendet
// -------------------------------------------------------------
const mitJobStil = document.createElement("style");
mitJobStil.textContent =
  "#ejer-indhold .mit-job { max-width: 640px; }" +
  "#ejer-indhold .mj-top { display: flex; align-items: center; gap: 14px; padding: 12px; background: #e8f2dc; border: 2px solid #9ccc8f; border-radius: 10px; }" +
  "#ejer-indhold .mj-top img { height: 64px; image-rendering: pixelated; }" +
  "#ejer-indhold .mj-top h3 { margin: 0 0 4px; color: #1f3a1c; }" +
  "#ejer-indhold .mj-top p { margin: 0; color: #33402c; }" +
  "#ejer-indhold ul.mj-kan { margin: 6px 0 12px; padding-left: 20px; }" +
  "#ejer-indhold ul.mj-kan li { display: list-item; padding: 4px 0; border: 0; color: #33402c; }" +
  "#profil-job { margin: 8px 0; padding: 6px 8px; background: #e8f2dc; border: 1px solid #9ccc8f; border-radius: 8px; font-size: 12px; color: #1f3a1c; }" +
  "#profil-job summary { cursor: pointer; display: flex; align-items: center; gap: 6px; }" +
  "#profil-job summary img { height: 22px; image-rendering: pixelated; }" +
  "#profil-job p { margin: 6px 0 0; }" +
  "#profil-job ul.mj-kan { margin: 4px 0 0; padding-left: 18px; }" +
  "#profil-job ul.mj-kan li { padding: 2px 0; }";
document.head.appendChild(mitJobStil);
