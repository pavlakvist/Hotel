// =============================================================
//  Ejer-kommandoer, der skrives i chatten (kun for ejeren)
//    :GlimtPavla100   giver Pavla 100 Glimt
//    :StellaPavla5    giver Pavla 5 Stella
//  Navnet kan udelades (:Glimt100), så får du det selv.
//  (Indtil hotellet får en server, tjekkes "kun ejeren" i browseren.)
// =============================================================
const KOMMANDO = /^:(glimt|stella)([a-zæøå]*?)(\d+)$/i;

document.addEventListener("submit", function (e) {
  if (e.target !== chatForm) return;
  const tekst = chatTekst.value.trim();
  if (tekst[0] !== ":") return;
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

  if (navn.toLowerCase() !== FIGUR.navn.toLowerCase()) {
    besked.textContent = "At give " + valuta + " til " + navn + " kræver en server. Indtil da kan du kun give dig selv.";
    return;
  }

  if (hvad === "glimt") faaGlimt(antal); else faaKrystaller(antal);
  adminSkriv("Kommando: gav sig selv " + antal + " " + valuta);
  besked.textContent = "✨ Du fik " + antal + " " + valuta + "!";
}, true);
