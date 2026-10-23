// =============================================================
//  Ejer-kommandoer, der skrives i chatten (kun for ejeren)
//    :GlimtPall100    giver Pall 100 Glimt
//    :StellaPall5     giver Pall 5 Stella
//  Navnet kan udelades (:Glimt100), så får du det selv.
//  (Indtil hotellet får en server, tjekkes "kun ejeren" i browseren.)
// =============================================================
const KOMMANDO = /^[:：]\s*(glimt|stella)\s*([a-zæøå]*?)\s*(\d+)$/i;

document.addEventListener("submit", function (e) {
  if (e.target !== chatForm) return;
  const tekst = chatTekst.value.trim();
  if (tekst[0] !== ":" && tekst[0] !== "：") return;
  const m = tekst.match(KOMMANDO);
  if (!m) return;                      // fx :) er en smiley, ikke en kommando

  // kommandoen bliver aldrig sagt højt i rummet
  e.preventDefault();
  e.stopImmediatePropagation();
  chatTekst.value = "";

  if (EJERE.indexOf(FIGUR.navn) < 0) {
    besked.textContent = "Den kommando findes ikke.";
    return;
  }

  const hvad = m[1].toLowerCase();
  const navn = m[2] || FIGUR.navn;
  const antal = Math.min(1000000, parseInt(m[3], 10));
  const valuta = hvad === "glimt" ? "Glimt" : "Stella";

  // dit eget navn (også dit gamle ejernavn) betyder dig selv
  const mig = navn.toLowerCase() === FIGUR.navn.toLowerCase() ||
    EJERE.some(function (n) { return n.toLowerCase() === navn.toLowerCase(); });
  if (!mig) {
    besked.textContent = "At give " + valuta + " til " + navn + " kræver en server. Indtil da kan du kun give dig selv.";
    return;
  }

  if (hvad === "glimt") faaGlimt(antal); else faaKrystaller(antal);
  adminSkriv("Kommando: gav sig selv " + antal + " " + valuta);
  besked.textContent = "✨ Du fik " + antal + " " + valuta + "!";
}, true);
