// =============================================================
//  Konti: Log ind og Opret mig 🔑
//  Brugernavne og adgangskoder gemmes på denne computer (localStorage).
//  Adgangskoden gemmes aldrig, kun et "fingeraftryk" (hash) af den.
//  Rigtige konti, man kan bruge fra andre computere, kræver en server.
// =============================================================
const KONTI_NOEGLE = "mit-hotel-konti";
const KONTO_AKTIV_NOEGLE = "mit-hotel-logget-ind";

function hentKonti() {
  try { return JSON.parse(localStorage.getItem(KONTI_NOEGLE) || "{}"); } catch (e) { return {}; }
}
function gemKonti(konti) {
  try { localStorage.setItem(KONTI_NOEGLE, JSON.stringify(konti)); } catch (e) {}
}
function aktivKonto() {
  try {
    const navn = localStorage.getItem(KONTO_AKTIV_NOEGLE);
    return navn && hentKonti()[navn.toLowerCase()] ? navn : null;
  } catch (e) { return null; }
}
function saetAktivKonto(navn) {
  try {
    if (navn) localStorage.setItem(KONTO_AKTIV_NOEGLE, navn);
    else localStorage.removeItem(KONTO_AKTIV_NOEGLE);
  } catch (e) {}
}

// Fingeraftryk af adgangskoden (SHA-256 med et tilfældigt "salt" pr. konto)
async function hashKode(salt, kode) {
  const tekst = salt + ":" + kode;
  if (window.crypto && crypto.subtle) {
    const data = new TextEncoder().encode(tekst);
    const h = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  // reserve, hvis browseren ikke kan SHA-256
  let h = 2166136261;
  for (let i = 0; i < tekst.length; i++) { h ^= tekst.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return "fnv" + h.toString(16);
}
function nytSalt() {
  const t = new Uint8Array(12);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(t);
  else for (let i = 0; i < t.length; i++) t[i] = Math.floor(Math.random() * 256);
  return Array.from(t).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

function navnFejl(navn) {
  if (navn.length < 2) return "Brugernavnet skal være mindst 2 tegn.";
  if (navn.length > 16) return "Brugernavnet må højst være 16 tegn.";
  if (!/^[a-zA-ZæøåÆØÅ0-9_\-]+$/.test(navn)) return "Brug kun bogstaver, tal, - og _ (ingen mellemrum).";
  return "";
}

// Opret en ny konto. Giver en fejltekst, eller "" hvis det gik godt.
async function opretKonto(navn, kode) {
  const fejl = navnFejl(navn);
  if (fejl) return fejl;
  if (kode.length < 4) return "Adgangskoden skal være mindst 4 tegn.";
  const konti = hentKonti();
  if (konti[navn.toLowerCase()]) return "Det brugernavn er taget. Prøv et andet.";
  const salt = nytSalt();
  konti[navn.toLowerCase()] = { navn: navn, salt: salt, hash: await hashKode(salt, kode), oprettet: Date.now() };
  gemKonti(konti);
  saetAktivKonto(navn);
  return "";
}

async function logInd(navn, kode) {
  const k = hentKonti()[navn.toLowerCase()];
  if (!k || (await hashKode(k.salt, kode)) !== k.hash) return "Forkert brugernavn eller adgangskode.";
  saetAktivKonto(k.navn);
  return "";
}

function logUd() {
  saetAktivKonto(null);
}

// Når ejeren giver sig selv et nyt navn i ejerpanelet, følger kontoen med
function omdoebKonto(gammelt, nyt) {
  const konti = hentKonti();
  const k = konti[gammelt.toLowerCase()];
  if (!k || konti[nyt.toLowerCase()]) return false;
  delete konti[gammelt.toLowerCase()];
  k.navn = nyt;
  konti[nyt.toLowerCase()] = k;
  gemKonti(konti);
  if (aktivKonto() === null || localStorage.getItem(KONTO_AKTIV_NOEGLE) === gammelt) saetAktivKonto(nyt);
  if (localStorage.getItem("mit-hotel-ejer-genvej") === gammelt) localStorage.setItem("mit-hotel-ejer-genvej", nyt);
  return true;
}

// Ejer-genvej 👑: når ejeren har været logget ind på denne computer én gang,
// husker computeren det, og forsiden viser en knap kun for ejeren.
// Den findes kun i denne browser, så andre computere ser den aldrig.
const EJER_GENVEJ_NOEGLE = "mit-hotel-ejer-genvej";
function ejerGenvej() {
  try {
    const navn = localStorage.getItem(EJER_GENVEJ_NOEGLE);
    const k = navn && hentKonti()[navn.toLowerCase()];
    return k ? k.navn : null;
  } catch (e) { return null; }
}
function huskEjerGenvej(navn) {
  try { localStorage.setItem(EJER_GENVEJ_NOEGLE, navn); } catch (e) {}
}
function glemEjerGenvej() {
  try { localStorage.removeItem(EJER_GENVEJ_NOEGLE); } catch (e) {}
}
function ejerGenvejLogInd() {
  const navn = ejerGenvej();
  if (!navn) return false;
  saetAktivKonto(navn);
  return true;
}

// Den, der er logget ind, er den, man spiller som
if (typeof FIGUR !== "undefined" && aktivKonto()) FIGUR.navn = aktivKonto();
