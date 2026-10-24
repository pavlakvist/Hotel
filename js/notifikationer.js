// =============================================================
//  Notifikationer 🔔 — en lille lyd og en rød prik,
//  når nogen skriver @dig, sender dig en privat besked eller vil være din ven.
//  @-beskeder til rigtige spillere sendes via serveren (js/server.js).
// =============================================================
let lydSidst = 0;
let lydKontekst = null;

// "Pling": to små toner, lavet af browseren (ingen lydfil)
function spilPling() {
  const nu = Date.now();
  if (nu - lydSidst < 1500) return;     // ikke en hel kaskade, hvis der kommer mange på én gang
  lydSidst = nu;
  try {
    lydKontekst = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
    const start = lydKontekst.currentTime;
    [880, 1320].forEach(function (frekvens, i) {
      const tone = lydKontekst.createOscillator();
      const styrke = lydKontekst.createGain();
      tone.type = "sine";
      tone.frequency.value = frekvens;
      const t = start + i * 0.12;
      styrke.gain.setValueAtTime(0.0001, t);
      styrke.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      styrke.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      tone.connect(styrke).connect(lydKontekst.destination);
      tone.start(t);
      tone.stop(t + 0.32);
    });
  } catch (e) {}
}

// Ny privat besked til mig (fra en rigtig ven eller en computer-gæst)
const tilfoejBeskedNotif = tilfoejBesked;
tilfoejBesked = function (navn, fra, tekst, ekstra) {
  tilfoejBeskedNotif(navn, fra, tekst, ekstra);
  if (fra !== FIGUR.navn && fra !== "⚠️" && !(beskedMed === navn && !beskedVindue.hidden)) {
    spilPling();
    besked.textContent = "💬 Ny besked fra " + fra + ". Åbn vennelisten 👫 for at læse den.";
  }
};

// Ny venneanmodning
const visUlaestNotif = visUlaest;
let anmodningerSidst = 0;
visUlaest = function () {
  visUlaestNotif();
  const n = anmodninger.tilMig.length;
  if (n > anmodningerSidst) spilPling();
  anmodningerSidst = n;
};


// -------------------------------------------------------------
//  @-beskeder til og fra rigtige spillere
// -------------------------------------------------------------
const mentionNavneFoerServer = mentionNavne;
mentionNavne = function () {
  const navne = mentionNavneFoerServer();
  Object.keys(ANDRE_SPILLERE).concat(typeof serverAlle !== "undefined" ? serverAlle.map(function (s) { return s.navn; }) : [])
    .forEach(function (n) { if (navne.indexOf(n) < 0) navne.push(n); });
  return navne;
};

const nyMentionFoerServer = nyMention;
nyMention = function (fra, til, tekst, rum) {
  nyMentionFoerServer(fra, til, tekst, rum);
  if (fra === FIGUR.navn && til !== FIGUR.navn && !erComputerGaest(til) && mitToken()) {
    const rumNavn = rumValg === "hal" ? "Velkomsthallen" : vaerelseNavn(aktivtVaerelse);
    serverKald("hv_mention_send", { p_token: mitToken(), p_til: til, p_tekst: tekst, p_rum: rumNavn })
      .catch(function (e) { besked.textContent = "📣 Kom ikke frem: " + e.message; });
  }
  if (til === FIGUR.navn && fra !== FIGUR.navn) spilPling();
};

function mentionEfterNoegle() { return "mit-hotel-mention-efter-" + FIGUR.navn; }
function hentMentions() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  let efter = 0;
  try { efter = parseInt(localStorage.getItem(mentionEfterNoegle()), 10) || 0; } catch (e) {}
  serverKald("hv_mentions_hent", { p_token: token, p_efter: efter }).then(function (liste) {
    (liste || []).forEach(function (m) {
      nyMentionFoerServer(m.fra, FIGUR.navn, m.tekst, m.rum || "");
      efter = Math.max(efter, m.id);
    });
    if (liste && liste.length) {
      spilPling();
      try { localStorage.setItem(mentionEfterNoegle(), efter); } catch (e) {}
    }
  }).catch(function () {});   // database-3-anmodninger-og-mentions.sql er ikke kørt endnu
}
hentMentions();
setInterval(hentMentions, 4000);
