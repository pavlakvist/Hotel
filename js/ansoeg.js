// =============================================================
//  🎖️ Ansøg om at være staff (forsiden)
//  Knappen "Ansøg om at være staff" åbner en formular, hvor man ser stillingerne,
//  vælger én, skriver sit brugernavn og fortæller om sig selv.
//  Ansøgningen gemmes på serveren, og kun ejeren kan læse den
//  (Ejerpanel → 📝 Ansøgninger). Kræver database-15-ansoegninger.sql.
// =============================================================
const ANSOEG_STILLINGER = [
  { id: "mod", navn: "Mod", tekst: "Holder øje med chatten, hjælper med at holde ro og kan give advarsler og mute." },
  { id: "staff", navn: "Staff", tekst: "Personalet. Holder hotellet sikkert og hyggeligt og hjælper, hvor der er brug for det." },
  { id: "hjaelper", navn: "Hjælper", tekst: "Byder nye gæster velkommen og svarer på spørgsmål i hallen." },
  { id: "eventvaert", navn: "Eventvært", tekst: "Arrangerer events og konkurrencer og laver bannere til hele hotellet." },
  { id: "bygmester", navn: "Bygmester", tekst: "Bygger og indretter de fælles rum, så de bliver flotte." },
  { id: "support", navn: "Support", tekst: "Hjælper, når noget driller, fx log ind eller ting der ikke virker." },
  { id: "content-creator", navn: "Content creator", tekst: "Laver videoer, billeder og opslag om hotellet." },
];
const ANSOEG_ONLINE = ["Hver dag", "Et par gange om ugen", "Mest i weekenden", "En gang imellem"];

function ansoegRens(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ----- Knapperne på forsiden -----
const ansoegKnap = document.createElement("button");
ansoegKnap.type = "button";
ansoegKnap.className = "knap ansoeg-knap";
ansoegKnap.innerHTML = "🎖️ Ansøg om at være staff";
document.querySelector(".velkomst").appendChild(ansoegKnap);

const ansoegMenu = document.createElement("a");
ansoegMenu.href = "#ansoeg";
ansoegMenu.className = "menu-link";
ansoegMenu.textContent = "Bliv staff";
document.querySelector(".menu-links").insertBefore(ansoegMenu, document.getElementById("menu-tjek-ind"));

// ----- Vinduet -----
const ansoegVindue = document.createElement("div");
ansoegVindue.id = "ansoeg-vindue";
ansoegVindue.className = "konto-baggrund";
ansoegVindue.hidden = true;
ansoegVindue.innerHTML =
  "<div class='konto-boks ansoeg-boks' role='dialog' aria-labelledby='ansoeg-titel'>" +
  "<button type='button' class='konto-luk' id='ansoeg-luk' title='Luk'>✕</button>" +
  "<h2 id='ansoeg-titel'>🎖️ Ansøg om at være staff</h2>" +
  "<p class='konto-under'>Vil du hjælpe med at gøre HELLO VERA til et hyggeligt sted? Vælg den stilling, du helst vil have, og fortæl lidt om dig selv.</p>" +
  "<form id='ansoeg-form' novalidate>" +
  "<h3>1. Vælg stilling</h3>" +
  "<div class='ansoeg-stillinger'>" + ANSOEG_STILLINGER.map(function (s) {
    return "<label class='ansoeg-stilling'><input type='radio' name='stilling' value='" + s.id + "'>" +
      "<img src='billeder/skilte/" + s.id + ".png' alt=''><b>" + ansoegRens(s.navn) + "</b><small>" + ansoegRens(s.tekst) + "</small></label>";
  }).join("") + "</div>" +
  "<h3>2. Om dig</h3>" +
  "<div class='ansoeg-raekke'>" +
  "<label>Dit brugernavn på hotellet<input id='ansoeg-navn' type='text' maxlength='16' autocomplete='username' placeholder='fx Smørblomst'></label>" +
  "<label id='ansoeg-kode-felt'>Din adgangskode<input id='ansoeg-kode' type='password' maxlength='64' autocomplete='current-password'><small>Så vi ved, at det er dig.</small></label>" +
  "</div>" +
  "<div class='ansoeg-raekke'>" +
  "<label>Alder<input id='ansoeg-alder' type='number' min='5' max='120' placeholder='fx 13'></label>" +
  "<label>Hvor tit er du online?<select id='ansoeg-online'>" + ANSOEG_ONLINE.map(function (o) { return "<option>" + o + "</option>"; }).join("") + "</select></label>" +
  "</div>" +
  "<label>Beskriv dig selv<textarea id='ansoeg-tekst' rows='6' maxlength='2000'></textarea></label>" +
  "<div class='ansoeg-forklaring'><b>💡 Hvad skal jeg skrive?</b><ul>" +
  "<li>Hvem er du, og hvad kan du lide at lave på hotellet?</li>" +
  "<li>Hvorfor vil du gerne have netop den stilling?</li>" +
  "<li>Hvad er du god til? (fx at hjælpe, bygge, finde på events)</li>" +
  "<li>Hvad gør du, hvis to gæster bliver uvenner i chatten?</li>" +
  "</ul><small>Skriv mindst et par sætninger med dine egne ord. Det er helt okay at stave forkert 😊</small></div>" +
  "<label>Har du prøvet at være staff før? <span class='ansoeg-valgfri'>(valgfrit)</span><textarea id='ansoeg-erfaring' rows='2' maxlength='1000' placeholder='fx Jeg var hjælper på et andet hotel i et halvt år'></textarea></label>" +
  "<p id='ansoeg-fejl' class='konto-fejl' role='alert'></p>" +
  "<button type='submit' id='ansoeg-send' class='knap guld lille'>Send ansøgning</button>" +
  "</form>" +
  "<div id='ansoeg-tak' class='ansoeg-tak' hidden><div class='ansoeg-tak-ikon'>💌</div><h3>Tak for din ansøgning!</h3>" +
  "<p>Den er sendt til ejeren. Du hører fra os med en privat besked inde på hotellet, så kig efter 💬.</p>" +
  "<button type='button' class='knap guld lille' id='ansoeg-ok'>OK</button></div>" +
  "</div>";
document.body.appendChild(ansoegVindue);

const ansoegForm = document.getElementById("ansoeg-form");
const ansoegFejl = document.getElementById("ansoeg-fejl");

function ansoegLoggetInd() {
  const navn = typeof aktivKonto === "function" ? aktivKonto() : null;
  const token = navn && typeof mitToken === "function" ? mitToken() : null;
  return token ? { navn: navn, token: token } : null;
}

function aabnAnsoeg() {
  const ind = ansoegLoggetInd();
  const navn = document.getElementById("ansoeg-navn");
  navn.value = ind ? ind.navn : navn.value;
  navn.readOnly = !!ind;
  document.getElementById("ansoeg-kode-felt").hidden = !!ind;
  ansoegFejl.textContent = "";
  ansoegForm.hidden = false;
  document.getElementById("ansoeg-tak").hidden = true;
  ansoegVindue.hidden = false;
}
function lukAnsoeg() {
  ansoegVindue.hidden = true;
  if (location.hash === "#ansoeg") history.replaceState(null, "", location.pathname + location.search);
}
ansoegKnap.addEventListener("click", aabnAnsoeg);
ansoegMenu.addEventListener("click", function (e) { e.preventDefault(); aabnAnsoeg(); });
document.getElementById("ansoeg-luk").addEventListener("click", lukAnsoeg);
document.getElementById("ansoeg-ok").addEventListener("click", lukAnsoeg);
ansoegVindue.addEventListener("click", function (e) { if (e.target === ansoegVindue) lukAnsoeg(); });
window.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ansoegVindue.hidden) lukAnsoeg(); });
if (location.hash === "#ansoeg") aabnAnsoeg();

ansoegForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const valgt = ansoegForm.querySelector("input[name='stilling']:checked");
  const navn = document.getElementById("ansoeg-navn").value.trim();
  const tekst = document.getElementById("ansoeg-tekst").value.trim();
  const ind = ansoegLoggetInd();
  ansoegFejl.textContent = "";
  if (!valgt) { ansoegFejl.textContent = "Vælg den stilling, du vil søge."; return; }
  if (!navn) { ansoegFejl.textContent = "Skriv dit brugernavn."; return; }
  if (!ind && !document.getElementById("ansoeg-kode").value) { ansoegFejl.textContent = "Skriv din adgangskode."; return; }
  if (tekst.length < 30) { ansoegFejl.textContent = "Skriv lidt mere om dig selv (mindst 30 tegn)."; return; }
  if (typeof SERVER === "undefined" || !SERVER.til) { ansoegFejl.textContent = "Ansøgninger kræver, at hotellet er online."; return; }
  const knap = document.getElementById("ansoeg-send");
  knap.disabled = true;
  knap.textContent = "Sender …";
  try {
    await serverKald("hv_ansoeg", {
      p_token: ind ? ind.token : null,
      p_navn: navn,
      p_kode: ind ? null : document.getElementById("ansoeg-kode").value,
      p_stilling: valgt.value,
      p_alder: parseInt(document.getElementById("ansoeg-alder").value, 10) || null,
      p_online: document.getElementById("ansoeg-online").value,
      p_tekst: tekst,
      p_erfaring: document.getElementById("ansoeg-erfaring").value.trim(),
    });
    ansoegForm.reset();
    ansoegForm.hidden = true;
    document.getElementById("ansoeg-tak").hidden = false;
  } catch (fejl) {
    ansoegFejl.textContent = /hv_ansoeg/.test(fejl.message) ? "Ansøgninger er ikke helt klar endnu. Prøv igen senere." : fejl.message;
  }
  knap.disabled = false;
  knap.textContent = "Send ansøgning";
});


// ----- Udseendet (samme creme, brun og guld som receptionen) -----
const ansoegStil = document.createElement("style");
ansoegStil.textContent =
  ".ansoeg-knap { margin-top: 18px; padding: 10px 26px; border-radius: 24px; font-size: 14px; background: rgba(255, 246, 227, 0.12);" +
  " color: var(--guld-lys); border: 2px solid var(--guld); box-shadow: 0 3px 0 var(--brun-moerk); }" +
  ".ansoeg-knap:hover { background: rgba(255, 246, 227, 0.22); }" +
  "#ansoeg-vindue { z-index: 30; align-items: flex-start; overflow-y: auto; }" +
  ".ansoeg-boks { width: min(640px, 100%); margin: 24px auto; text-align: left; }" +
  ".ansoeg-boks h2 { text-align: center; padding-right: 30px; }" +
  ".ansoeg-boks > .konto-under { text-align: center; }" +
  ".ansoeg-boks h3 { margin: 16px 0 8px; font: 700 16px 'Poppins', sans-serif; color: var(--brun); }" +
  "#ansoeg-form { display: flex; flex-direction: column; gap: 10px; }" +
  "#ansoeg-form[hidden], .ansoeg-tak[hidden], #ansoeg-form label[hidden] { display: none; }" +
  "#ansoeg-form label { display: flex; flex-direction: column; gap: 4px; font-weight: 700; font-size: 14px; }" +
  "#ansoeg-form label small { font-weight: 600; font-size: 12px; color: var(--brun); opacity: 0.8; }" +
  "#ansoeg-form input:not([type=radio]), #ansoeg-form select, #ansoeg-form textarea { padding: 9px 11px; border: 2px solid var(--creme-moerk); border-radius: 10px;" +
  " font: 600 15px 'Nunito', sans-serif; color: var(--brun-moerk); background: #fff; width: 100%; }" +
  "#ansoeg-form textarea { resize: vertical; }" +
  "#ansoeg-form input:focus, #ansoeg-form select:focus, #ansoeg-form textarea:focus { outline: none; border-color: var(--guld); box-shadow: 0 0 0 3px rgba(245, 185, 56, 0.35); }" +
  "#ansoeg-form input[readonly] { background: var(--creme-moerk); }" +
  ".ansoeg-raekke { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }" +
  ".ansoeg-stillinger { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }" +
  "#ansoeg-form label.ansoeg-stilling { position: relative; display: grid; grid-template-columns: 54px 1fr; grid-template-rows: auto 1fr; column-gap: 8px; align-items: start;" +
  " padding: 8px; background: #fff; border: 2px solid var(--creme-moerk); border-radius: 12px; cursor: pointer; transition: transform 0.12s; }" +
  "#ansoeg-form label.ansoeg-stilling:hover { transform: translateY(-2px); border-color: var(--guld); }" +
  ".ansoeg-stilling input { position: absolute; opacity: 0; pointer-events: none; }" +
  ".ansoeg-stilling img { grid-row: 1 / 3; width: 54px; image-rendering: pixelated; }" +
  ".ansoeg-stilling b { font-size: 15px; color: var(--brun); }" +
  "#ansoeg-form .ansoeg-stilling small { font-size: 11.5px; line-height: 1.3; color: var(--brun-moerk); opacity: 0.85; }" +
  "#ansoeg-form label.ansoeg-stilling:has(input:checked) { background: #fff3cf; border-color: var(--guld-moerk); box-shadow: 0 0 0 3px rgba(245, 185, 56, 0.45); }" +
  "#ansoeg-form label.ansoeg-stilling:has(input:checked)::after { content: '✓'; position: absolute; top: 6px; right: 8px; color: var(--guld-moerk); font-weight: 800; }" +
  ".ansoeg-forklaring { padding: 10px 12px; background: #fff3cf; border: 2px dashed var(--guld); border-radius: 12px; font-size: 13px; color: var(--brun-moerk); }" +
  ".ansoeg-forklaring ul { margin: 6px 0; padding-left: 20px; }" +
  ".ansoeg-forklaring li { margin: 2px 0; }" +
  ".ansoeg-valgfri { font-weight: 600; opacity: 0.7; }" +
  "#ansoeg-send { align-self: center; margin-top: 4px; }" +
  ".ansoeg-tak { text-align: center; padding: 20px 0 6px; }" +
  ".ansoeg-tak-ikon { font-size: 50px; }" +
  ".ansoeg-tak p { margin: 0 0 16px; }" +
  "@media (max-width: 560px) { .ansoeg-raekke { grid-template-columns: 1fr; } }";
document.head.appendChild(ansoegStil);
