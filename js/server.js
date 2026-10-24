// =============================================================
//  Serveren 🌐 — så flere kan være på hotellet sammen
//  Profiler, hvem der er online, hvor man står og chatten gemmes
//  på hotellets server hos Supabase (gratis), ikke kun på denne computer.
//  Sæt  til: false  hvis du vil tilbage til kun at spille alene.
//  Nøglen herunder er offentlig og må gerne ligge på GitHub.
// =============================================================
const SERVER = {
  til: true,
  adresse: "https://tmqdvijehqfwofsllwmu.supabase.co",
  noegle: "sb_publishable_iYR-b30EBzLTZDScQ4vicw_hHsctavJ",
};
const SERVER_TOKENS_NOEGLE = "mit-hotel-server-tokens";   // { navn: token } for profiler logget ind her

// Spørg serveren. Giver svaret, eller kaster en fejl med serverens besked.
async function serverKald(funktion, data) {
  const svar = await fetch(SERVER.adresse + "/rest/v1/rpc/" + funktion, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SERVER.noegle },
    body: JSON.stringify(data || {}),
  });
  const tekst = await svar.text();
  let json = null;
  try { json = tekst ? JSON.parse(tekst) : null; } catch (e) {}
  if (!svar.ok) throw new Error((json && json.message) || "Serveren svarede ikke (" + svar.status + ").");
  return json;
}

function hentTokens() {
  try { return JSON.parse(localStorage.getItem(SERVER_TOKENS_NOEGLE) || "{}"); } catch (e) { return {}; }
}
function gemToken(navn, token) {
  const t = hentTokens();
  if (token) t[navn] = token; else delete t[navn];
  try { localStorage.setItem(SERVER_TOKENS_NOEGLE, JSON.stringify(t)); } catch (e) {}
}
// Hvem er logget ind, og hvad er deres "adgangskort" (token) til serveren?
function mitToken() {
  const navn = aktivKonto();
  return navn ? hentTokens()[navn] || null : null;
}

if (SERVER.til) {
  // Firefox giver hver fil på computeren sin egen hukommelse, så forsiden sender
  // navn og token med i adressen (hotel.html#konto=Navn&t=token). Gem dem her.
  (function () {
    const n = location.hash.match(/konto=([^&]+)/), t = location.hash.match(/[#&]t=([^&]+)/);
    if (n && t) {
      try {
        const navn = decodeURIComponent(n[1]);
        gemToken(navn, decodeURIComponent(t[1]));
        saetAktivKonto(navn);
      } catch (e) {}
    }
  })();

  // Profilerne "her" = dem, der er logget ind på serveren fra denne computer
  hentKonti = function () {
    const ud = {};
    Object.keys(hentTokens()).forEach(function (navn) { ud[navn.toLowerCase()] = { navn: navn }; });
    return ud;
  };

  aktivKonto = function () {
    try {
      const navn = localStorage.getItem(KONTO_AKTIV_NOEGLE);
      if (navn && hentTokens()[navn]) return navn;
    } catch (e) {}
    return null;
  };

  hotelAdresse = function () {
    const navn = aktivKonto();
    return navn ? "hotel.html#konto=" + encodeURIComponent(navn) + "&t=" + encodeURIComponent(mitToken()) : "hotel.html";
  };

  opretKonto = async function (navn, kode) {
    const fejl = navnFejl(navn);
    if (fejl) return fejl;
    if (kode.length < 4) return "Adgangskoden skal være mindst 4 tegn.";
    const felt = document.getElementById("konto-invitation");
    const invitation = felt ? felt.value.trim() : "";
    if (!invitation) return "Skriv invitationskoden, du har fået af hotellets ejer.";
    try {
      const svar = await serverKald("hv_opret", { p_navn: navn, p_kode: kode, p_invitation: invitation });
      gemToken(svar.navn, svar.token);
      saetAktivKonto(svar.navn);
      if (EJER_NAVNE.includes(svar.navn)) huskEjerGenvej(svar.navn);
      return "";
    } catch (e) { return e.message; }
  };

  logInd = async function (navn, kode) {
    if (!navn) return "Skriv dit brugernavn.";
    try {
      const svar = await serverKald("hv_log_ind", { p_navn: navn, p_kode: kode });
      gemToken(svar.navn, svar.token);
      saetAktivKonto(svar.navn);
      if (EJER_NAVNE.includes(svar.navn)) huskEjerGenvej(svar.navn);
      return "";
    } catch (e) { return e.message; }
  };

  logUd = function () {
    const navn = aktivKonto(), token = mitToken();
    if (token) serverKald("hv_log_ud", { p_token: token }).catch(function () {});
    if (navn) gemToken(navn, null);
    saetAktivKonto(null);
  };

  // Navneskift i ejerpanelet virker ikke på serveren endnu
  omdoebKonto = function () { return false; };

  // Feltet "Invitationskode" i Opret mig-vinduet på forsiden
  const kode2 = document.getElementById("konto-kode2-felt");
  if (kode2) {
    const felt = document.createElement("label");
    felt.id = "konto-invitation-felt";
    felt.innerHTML = "Invitationskode<input id='konto-invitation' type='text' maxlength='40' autocomplete='off'>";
    kode2.after(felt);
    const opdater = function () { felt.hidden = kode2.hidden; };
    new MutationObserver(opdater).observe(kode2, { attributes: true, attributeFilter: ["hidden"] });
    opdater();
    const note = document.querySelector(".konto-note");
    if (note) note.textContent = "Din profil gemmes på hotellets server, så du kan logge ind fra alle computere.";
  }
}
