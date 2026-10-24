// =============================================================
//  Likes 👍 — 4 likes om dagen at give væk (ejeren har uendeligt mange)
//  Likes tælles på serveren, og når man liker nogen, siger man det højt
//  i rummet, fx "Pall: 👍 har liket Ida!"
// =============================================================
function likeTekst(g, antal) {
  return "👍 Like" + (antal !== null && antal !== undefined ? " (" + antal + ")" : "");
}

const aabnGaestMenuLikes = aabnGaestMenu;
aabnGaestMenu = function (g) {
  aabnGaestMenuLikes(g);
  const gammel = Array.prototype.find.call(minMenuKnapper.querySelectorAll("button"), function (k) {
    return k.textContent.indexOf("👍") === 0 || k.textContent.indexOf("💙") === 0;
  });
  if (!gammel || !mitToken()) return;
  // samme knap, men nu med serverens likes
  const k = gammel.cloneNode(true);
  gammel.replaceWith(k);
  const computer = erComputerGaest(g.navn);
  k.textContent = likeTekst(g, computer ? likes.antal[g.navn] || 0 : null);
  if (!computer) {
    serverKald("hv_like_info", { p_token: mitToken(), p_navn: g.navn })
      .then(function (svar) { if (k.isConnected) k.textContent = likeTekst(g, svar.antal); })
      .catch(function () {});
  }
  k.addEventListener("click", function () {
    lukMinMenu();
    giveLike(g);
  });
};

function giveLike(g) {
  serverKald("hv_like", { p_token: mitToken(), p_til: g.navn }).then(function (svar) {
    if (erComputerGaest(g.navn)) {
      likes.antal[g.navn] = (likes.antal[g.navn] || 0) + 1;
      gemLikes();
      gaestSkriver(g, "Tak for like'et, " + FIGUR.navn + "! 😊");
    }
    sig(figur, FIGUR.navn, "👍 har liket " + g.navn + "!");
    svaev("👍", g);
    besked.textContent = svar.tilbage === null ? "👑 Du har uendeligt mange likes." :
      svar.tilbage === 1 ? "Du har 1 like tilbage i dag." : "Du har " + svar.tilbage + " likes tilbage i dag.";
  }).catch(function (e) {
    besked.textContent = /find the function|hv_like/.test(e.message)
      ? "Likes virker, når database-3-anmodninger-og-mentions.sql er kørt i Supabase."
      : e.message;
  });
}
