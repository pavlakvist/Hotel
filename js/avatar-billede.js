// =============================================================
//  Dit avatar-billede øverst til venstre (ved "online")
//  Viser hoved og skuldre af din figur, som den ser ud lige nu,
//  og skifter med, når du skifter udseende. Klik = Min profil.
// =============================================================
const avatarBoks = document.createElement("button");
avatarBoks.id = "avatar-billede";
avatarBoks.type = "button";
avatarBoks.title = "Min profil";
avatarBoks.innerHTML = "<canvas width='140' height='140'></canvas><span id='avatar-navn'></span>";
document.body.appendChild(avatarBoks);
const avatarLaerred = avatarBoks.querySelector("canvas");

function tegnAvatarBillede() {
  const c = avatarLaerred.getContext("2d");
  c.clearRect(0, 0, avatarLaerred.width, avatarLaerred.height);
  const h = figurHoejde(garderobe);
  const s = 2.6;                                // hvor meget figuren er forstørret
  c.save();
  c.translate(avatarLaerred.width / 2, 4 + h * s);   // fødderne langt nede, så hovedet står øverst
  c.scale(s, s);
  try { tegnMenneske(c, 0, 0, garderobe, "ned", null, null); } catch (e) {}
  c.restore();
  document.getElementById("avatar-navn").textContent = FIGUR.navn;
}

avatarBoks.addEventListener("click", function () {
  if (typeof aabnProfil === "function") aabnProfil();
});
setInterval(tegnAvatarBillede, 700);
tegnAvatarBillede();
