// =============================================================
//  @-beskeder og Mentions 📣
//  Skriv @navn og en besked nede i chatten, fx "@Ida hej!".
//  Beskeden kommer frem, selv om I er i hvert sit rum.
//  Det, andre skriver til dig med @, kan ses under "@ Mentions"
//  ved HELLO VERA øverst. Computer-gæsterne svarer selv.
//  (@-beskeder mellem rigtige spillere kræver en server.)
// =============================================================
const MENTION_NOEGLE = "mit-hotel-mentions";
const mentionVindue = document.getElementById("mention-vindue");
const mentionListe = document.getElementById("mention-liste");
const mentionTal = document.getElementById("mention-tal");
const mentionForslag = document.getElementById("mention-forslag");

// [{ fra, til, tekst, tid, rum, ulaest }]
let mentions = [];
try { mentions = JSON.parse(localStorage.getItem(MENTION_NOEGLE) || "[]"); } catch (e) {}
function gemMentions() {
  if (mentions.length > 200) mentions.splice(0, mentions.length - 200);
  try { localStorage.setItem(MENTION_NOEGLE, JSON.stringify(mentions)); } catch (e) {}
}

// Alle man kan skrive til: gæsterne, dine venner og dig selv
function mentionNavne() {
  const navne = [FIGUR.navn];
  HAL_GAESTER.forEach(function (g) { if (navne.indexOf(g.navn) < 0) navne.push(g.navn); });
  if (typeof venner !== "undefined") venner.forEach(function (v) { if (navne.indexOf(v) < 0) navne.push(v); });
  return navne;
}
function findNavn(navn) {
  return mentionNavne().find(function (n) { return n.toLowerCase() === navn.toLowerCase(); }) || null;
}

function mitRum() {
  return rumValg === "hal" ? "Velkomsthallen" : "dit værelse";
}

function visMentionTal() {
  const n = mentions.filter(function (m) { return m.ulaest; }).length;
  mentionTal.textContent = n > 9 ? "9+" : n;
  mentionTal.hidden = n === 0;
}

function nyMention(fra, til, tekst, rum) {
  const tilMig = til === FIGUR.navn;
  mentions.push({ fra: fra, til: til, tekst: tekst, tid: Date.now(), rum: rum, ulaest: tilMig && mentionVindue.hidden });
  gemMentions();
  visMentionTal();
  visMentions();
  if (tilMig && fra !== FIGUR.navn) {
    besked.textContent = "📣 " + fra + " skrev til dig: " + tekst;
    if (typeof svaev === "function") svaev("📣");
  }
}


// -------------------------------------------------------------
//  Vinduet med mentions
// -------------------------------------------------------------
function visMentions() {
  if (mentionVindue.hidden) return;
  if (!mentions.length) {
    mentionListe.innerHTML = "<li class='mention-tom'>Ingen mentions endnu 📣<br><small>Skriv fx <b>@Ida hej!</b> nede i chatten.</small></li>";
    return;
  }
  mentionListe.innerHTML = mentions.slice().reverse().map(function (m) {
    const tilMig = m.til === FIGUR.navn && m.fra !== FIGUR.navn;
    const hvem = tilMig ? "<b>" + tegnTilHtml(m.fra) + "</b> → dig" : "Du → <b>" + tegnTilHtml(m.til) + "</b>";
    return "<li class='" + (tilMig ? "til-mig" : "fra-mig") + "'>" +
      "<div class='mention-top'><span>" + hvem + "</span><small>" + tegnTilHtml(m.rum || "") + " · " + klokken(m.tid) + "</small></div>" +
      "<p>" + tegnTilHtml(m.tekst) + "</p>" +
      "<button data-svar='" + tegnTilHtml(tilMig ? m.fra : m.til) + "'>↩ Svar</button></li>";
  }).join("");
  mentionListe.querySelectorAll("[data-svar]").forEach(function (k) {
    k.addEventListener("click", function () {
      chatTekst.value = "@" + k.dataset.svar + " ";
      chatTekst.focus();
    });
  });
}

function aabnMentions() {
  mentionVindue.hidden = false;
  mentions.forEach(function (m) { m.ulaest = false; });
  gemMentions();
  visMentionTal();
  visMentions();
}

document.getElementById("mention-knap").addEventListener("click", function () {
  if (mentionVindue.hidden) aabnMentions(); else mentionVindue.hidden = true;
});
document.getElementById("mention-luk").addEventListener("click", function () { mentionVindue.hidden = true; });
document.getElementById("mention-ryd").addEventListener("click", function () {
  mentions = [];
  gemMentions();
  visMentionTal();
  visMentions();
});
window.addEventListener("keydown", function (e) { if (e.key === "Escape") mentionVindue.hidden = true; });


// -------------------------------------------------------------
//  @navn i chatten
// -------------------------------------------------------------
const MENTION = /^@\s*([^\s@]+)\s+([\s\S]+)$/;

document.addEventListener("submit", function (e) {
  if (e.target !== chatForm) return;
  const raa = chatTekst.value.trim();
  if (raa[0] !== "@") return;
  e.preventDefault();
  e.stopImmediatePropagation();
  mentionForslag.hidden = true;
  const m = raa.match(MENTION);
  if (!m) {
    besked.textContent = "Skriv @navn og så din besked, fx @Ida hej!";
    return;
  }
  const til = findNavn(m[1]);
  if (!til) {
    besked.textContent = "Der er ingen, der hedder " + m[1] + " på hotellet.";
    return;
  }
  const tekst = rensTekst(lavSmileyer(m[2])).trim();
  chatTekst.value = "";
  if (!tekst) return;
  nyMention(FIGUR.navn, til, tekst, mitRum());
  if (til !== FIGUR.navn) besked.textContent = "📣 Sendt til " + til + "!";

  // computer-gæsten svarer med en @ tilbage (hvor du end er)
  const g = HAL_GAESTER.find(function (x) { return x.navn === til; });
  if (g && !(typeof harTimeout === "function" && harTimeout(g.navn))) {
    const regel = SVAR.find(function (s) { return s.naar.test(tekst); });
    const svar = tilfaeldig(regel.svar).replace("{mig}", FIGUR.navn);
    setTimeout(function () {
      if (HAL_GAESTER.indexOf(g) >= 0) nyMention(g.navn, FIGUR.navn, svar, "Velkomsthallen");
    }, 2000 + Math.random() * 3000);
  }
}, true);

// Forslag til navne, mens man skriver @…
chatTekst.addEventListener("input", function () {
  const m = chatTekst.value.match(/^@([^\s@]*)$/);
  if (!m) { mentionForslag.hidden = true; return; }
  const q = m[1].toLowerCase();
  const navne = mentionNavne().filter(function (n) { return n.toLowerCase().indexOf(q) === 0; }).slice(0, 6);
  if (!navne.length) { mentionForslag.hidden = true; return; }
  mentionForslag.innerHTML = "";
  navne.forEach(function (n) {
    const k = document.createElement("button");
    k.type = "button";
    k.textContent = "@" + n + (n === FIGUR.navn ? " (dig)" : "");
    k.addEventListener("click", function () {
      chatTekst.value = "@" + n + " ";
      mentionForslag.hidden = true;
      chatTekst.focus();
    });
    mentionForslag.appendChild(k);
  });
  mentionForslag.hidden = false;
});
chatTekst.addEventListener("blur", function () {
  setTimeout(function () { mentionForslag.hidden = true; }, 200);
});

visMentionTal();
