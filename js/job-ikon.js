// =============================================================
//  🎖️ Jobbeskrivelser og job-ikonet i chatbaren
//  - Alle jobtitler (skiltene i Ansættelse) har nu en rigtig jobbeskrivelse.
//  - Har man et job eller skilt (eller er man ejeren), kommer et lille ikon med
//    ens eget skilt i chatbaren. Klik på det for at se "Mit job".
//  Beskrivelserne står i JOB_BESKRIVELSE herunder og kan rettes frit.
// =============================================================
const JOB_BESKRIVELSE = {
  ejer: "Du har bygget HELLO VERA og bestemmer over hele hotellet. Du ansætter personalet, sender nyheder ud, giver Glimt og Stella og sørger for, at hotellet er et rart sted at være.",
  mod: "Som moderator passer du på gæsterne. Du holder øje med chatten, læser rapporter og giver advarsler og straffe, når nogen er grove, mobber eller snyder. Du er rolig og retfærdig, og du advarer altid før du straffer.",
  staff: "Som staff er du en del af hotellets personale. Du går rundt på hotellet, hjælper gæsterne, siger til hvis noget er galt, og tilkalder en MOD, hvis der er brug for det. Du er et godt eksempel for de andre.",
  hjaelper: "Som hjælper tager du dig af de nye gæster. Du byder velkommen i hallen, viser hvordan man går, chatter, køber møbler og finder sin lejlighed, og du svarer på spørgsmål med et smil.",
  vip: "VIP er et særligt skilt til gæster, der har gjort noget ekstra for hotellet. Det er ikke et job, men et tegn på, at du er noget helt særligt her.",
  gaest: "Gæst er hotellets almindelige skilt. Du er velkommen til at gå rundt, chatte, indrette din lejlighed og være med til events.",
  "ny-gaest": "Ny gæst viser, at du lige er startet på hotellet. Så ved personalet og de andre gæster, at de kan hjælpe dig godt i gang.",
  eventvaert: "Som eventvært laver du sjove ting sammen med gæsterne: konkurrencer, fester og skattejagter. Du sender nyheder og bannere ud, holder styr på fødselsdage og låser event-rummene, mens I gør klar.",
  bygmester: "Som bygmester pynter du hotellets fælles rum. Alle møbler er gratis for dig i hallen, event-rummene og den hemmelige etage, så du kan bygge flotte steder, som alle kan nyde.",
  veteran: "Veteran er til gæster, der har været med i lang tid. Det viser, at du kender hotellet godt, og at nye gæster kan spørge dig om hjælp.",
  "content-creator": "Som content creator viser du hotellet frem. Du tager billeder med kameraet, laver videoer og opslag og lægger flotte billeder i det fælles album.",
  support: "Som support hjælper du, når noget driller: hvis nogen ikke kan logge ind, har mistet noget, eller hvis noget ikke virker. Du skriver fejlen videre til ejeren.",
  "saeson-vinder": "Sæsonvinder er til vinderen af et event eller en sæson. Skiltet viser alle, at du har vundet!",
};
SKILTE.forEach(function (s) { s.beskrivelse = JOB_BESKRIVELSE[s.id] || s.tekst; });

// Ansættelse og Jobbeskrivelser viser også den lange beskrivelse
const jobHtmlFoerBeskrivelse = jobHtml;
jobHtml = function (s) {
  return "<p class='job-beskrivelse'>" + rens(s.beskrivelse || s.tekst) + "</p>" + jobHtmlFoerBeskrivelse(s);
};

// Mit job (i panelet og Min profil) får også beskrivelsen
const mitJobFoerBeskrivelse = mitJob;
mitJob = function () {
  const job = mitJobFoerBeskrivelse();
  if (!job) return null;
  const s = SKILTE.find(function (x) { return x.navn === job.navn; });
  job.beskrivelse = job.navn === "Ejer" ? JOB_BESKRIVELSE.ejer : (s && s.beskrivelse) || job.tekst;
  return job;
};
const mitJobHtmlFoerBeskrivelse = mitJobHtml;
mitJobHtml = function (job) {
  return mitJobHtmlFoerBeskrivelse(job).replace("<h4>", "<h4>📝 Jobbeskrivelse</h4><p class='job-beskrivelse'>" + rens(job.beskrivelse || "") + "</p><h4>");
};


// -------------------------------------------------------------
//  Det lille job-ikon i chatbaren
// -------------------------------------------------------------
const jobKnap = document.createElement("button");
jobKnap.type = "button";
jobKnap.id = "chat-job-knap";
jobKnap.className = "chat-lille";
jobKnap.hidden = true;
document.getElementById("chat-ejer-knap").after(jobKnap);

const jobVindue = document.createElement("div");
jobVindue.id = "job-vindue";
jobVindue.hidden = true;
jobVindue.innerHTML = "<div class='jv-top'><b>🎖️ Mit job</b><button type='button' id='jv-luk' title='Luk'>✕</button></div><div class='jv-krop'></div>";
document.body.appendChild(jobVindue);
document.getElementById("jv-luk").onclick = function () { jobVindue.hidden = true; };

let jobIkonNu = "";
function tjekJobIkon() {
  const job = mitJob();
  const noegle = job ? job.navn + job.fil : "";
  if (noegle === jobIkonNu) return;
  jobIkonNu = noegle;
  jobKnap.hidden = !job;
  if (!job) { jobVindue.hidden = true; return; }
  jobKnap.title = "Mit job: " + job.navn;
  jobKnap.innerHTML = "<img src='" + job.fil + "' alt='" + rens(job.navn) + "'>";
  if (!jobVindue.hidden) visJobVindue();
}
function visJobVindue() {
  const job = mitJob();
  if (!job) { jobVindue.hidden = true; return; }
  jobVindue.querySelector(".jv-krop").innerHTML = mitJobHtml(job) +
    (typeof minRolle === "function" && minRolle() ? "<button type='button' id='jv-panel'>🛡️ Åbn mit panel</button>" : "");
  const p = document.getElementById("jv-panel");
  if (p) p.onclick = function () { jobVindue.hidden = true; if (ejerVindue.hidden) ejerKnap.click(); };
}
jobKnap.addEventListener("click", function () {
  jobVindue.hidden = !jobVindue.hidden;
  if (!jobVindue.hidden) visJobVindue();
});
goerFlytbar(jobVindue, jobVindue.querySelector(".jv-top"), "mit-hotel-flyt-job");
tjekJobIkon();
setInterval(tjekJobIkon, 700);

const jobIkonStil = document.createElement("style");
jobIkonStil.textContent =
  "#chat { width: min(820px, calc(100vw - 32px)); }" +
  "#chat #chat-job-knap img { height: 24px; max-width: 34px; object-fit: contain; image-rendering: pixelated; vertical-align: middle; }" +
  "#chat #chat-job-knap[hidden] { display: none; }" +
  "#job-vindue[hidden] { display: none; }" +
  "#job-vindue { position: fixed; z-index: 40; left: calc(50% - 190px); bottom: 90px; width: 380px; max-height: 70vh; overflow-y: auto;" +
  " background: #fbf6ea; border: 3px solid #4e7d4a; border-radius: 14px; box-shadow: 0 6px 0 rgba(0,0,0,0.25); font: 13px Verdana, sans-serif; color: #33402c; }" +
  "#job-vindue .jv-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #4e7d4a; color: #fbf6ea; cursor: move; border-radius: 10px 10px 0 0; }" +
  "#job-vindue .jv-top button { background: #6b9c62; border: 2px solid #d9edcc; color: #fff; border-radius: 6px; cursor: pointer; }" +
  "#job-vindue .jv-krop { padding: 12px 14px; }" +
  "#job-vindue .mj-top { display: flex; align-items: center; gap: 12px; padding: 10px; background: #e8f2dc; border: 2px solid #9ccc8f; border-radius: 10px; }" +
  "#job-vindue .mj-top img { height: 56px; image-rendering: pixelated; }" +
  "#job-vindue .mj-top h3 { margin: 0 0 4px; color: #1f3a1c; }" +
  "#job-vindue .mj-top p { margin: 0; }" +
  "#job-vindue h4 { margin: 12px 0 4px; color: #3b6338; }" +
  "#job-vindue ul.mj-kan { margin: 4px 0 8px; padding-left: 20px; }" +
  "#job-vindue ul.mj-kan li { padding: 2px 0; }" +
  "#job-vindue #jv-panel { width: 100%; margin-top: 6px; padding: 8px; border: 2px solid #3b6338; border-radius: 8px; background: #4e7d4a; color: #fff; font: bold 13px Verdana, sans-serif; cursor: pointer; }" +
  ".job-beskrivelse { margin: 4px 0 8px; line-height: 1.45; }";
document.head.appendChild(jobIkonStil);
