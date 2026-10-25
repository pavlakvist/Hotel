// =============================================================
//  🎉 Giv Glimt eller Stella til ALLE spillere på én gang
//  Ejerpanel → Valuta og økonomi. Ejeren skriver selv beløbet og trykker to gange
//  ("Er du sikker?"), så ingen kommer til det ved et uheld. Ejerne selv får ikke noget.
//  Spillerne ser pengene komme med det samme (🎁 Du har fået …).
//  Kræver database-14-giv-alle.sql. Det bliver skrevet i Administratorlog.
// =============================================================
const visValutaFoerAlle = visValuta;
visValuta = function () {
  visValutaFoerAlle();
  if (EJERE.indexOf(FIGUR.navn) < 0) return;
  const sek = document.createElement("section");
  sek.className = "giv-alle";
  sek.innerHTML = "<h3>🎉 Giv til alle spillere</h3>" +
    "<label class='ejer-felt'>Beløb<input id='ga-antal' type='number' min='1' value='100'></label>" +
    "<div class='sp-handlinger'><button type='button' id='ga-glimt'>⭐ Giv " + rens(system.valutaNavn) + " til alle</button>" +
    "<button type='button' id='ga-stella'>🔮 Giv Stella til alle</button></div>" +
    "<p class='ga-info'>Alle spillere på hotellet får beløbet. Tryk to gange for at være sikker.</p>";
  const giv = ejerIndhold.querySelector(".penge-giv");
  const egne = ejerIndhold.querySelector("#v-giv-k");
  if (giv) giv.before(sek); else if (egne) egne.parentNode.after(sek); else ejerIndhold.appendChild(sek);

  let sikker = null, sikkerTimer = null;
  function nulstil() {
    sikker = null;
    sek.querySelectorAll("button").forEach(function (k) { k.classList.remove("ga-sikker"); k.textContent = k.dataset.tekst; });
  }
  sek.querySelectorAll("button").forEach(function (k) {
    k.dataset.tekst = k.textContent;
    k.addEventListener("click", function () {
      const stella = k.id === "ga-stella";
      const navnet = stella ? "Stella" : system.valutaNavn;
      const antal = parseInt(document.getElementById("ga-antal").value, 10) || 0;
      if (antal <= 0) { besked.textContent = "Skriv et beløb over 0."; return; }
      if (sikker !== k) {
        nulstil();
        sikker = k;
        k.classList.add("ga-sikker");
        k.textContent = "Er du sikker? Giv " + antal.toLocaleString("da-DK") + " " + navnet + " til alle";
        clearTimeout(sikkerTimer);
        sikkerTimer = setTimeout(nulstil, 5000);
        return;
      }
      clearTimeout(sikkerTimer);
      nulstil();
      serverKald("hv_penge_giv_alle", { p_token: mitToken(), p_glimt: stella ? 0 : antal, p_stella: stella ? antal : 0 }).then(function (hvor) {
        besked.textContent = "🎉 " + (hvor || 0) + (hvor === 1 ? " spiller" : " spillere") + " fik " + antal.toLocaleString("da-DK") + " " + navnet + "!";
        setTimeout(hentAllesPenge, 300);
      }).catch(function (e) {
        besked.textContent = /hv_penge_giv_alle/.test(e.message) ? "Virker, når database-14-giv-alle.sql er kørt i Supabase." : e.message;
      });
    });
  });
};

const givAlleStil = document.createElement("style");
givAlleStil.textContent =
  "#ejer-indhold .giv-alle { margin-top: 14px; padding: 10px 12px; background: #fff7dc; border: 2px solid #e3c86a; border-radius: 10px; }" +
  "#ejer-indhold .giv-alle h3 { margin-top: 0; }" +
  "#ejer-indhold .giv-alle input { width: 160px; }" +
  "#ejer-indhold .giv-alle .ga-info { margin: 8px 0 0; font-size: 12px; color: #7a5a1a; }" +
  "#ejer-indhold .giv-alle button.ga-sikker { background: #c0392b; border-color: #8e2a20; color: #fff; }";
document.head.appendChild(givAlleStil);
