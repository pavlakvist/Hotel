// =============================================================
//  Personale på serveren 🎖️🚨
//  Skilte fra Ansættelse, 🚨 Tilkald hjælp og låste event-rum
//  gemmes nu på serveren, så alle kan se dem fra hver sin computer.
//  (Kræver database-4-personale.sql. Indtil da virker det som før.)
// =============================================================
let personaleHentet = false;    // har serveren svaret? Ellers bruges det gamle (kun denne computer)
let serverAnsatte = {};
let serverEventLaas = {};
let serverAlarmer = [];
const hoerteAlarmer = {};       // alarmer vi allerede har spillet lyd for

// En tydelig alarmlyd: "dyt-dut-dyt-dut"
function spilAlarm() {
  try {
    lydKontekst = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
    const start = lydKontekst.currentTime;
    for (let i = 0; i < 6; i++) {
      const tone = lydKontekst.createOscillator();
      const styrke = lydKontekst.createGain();
      tone.type = "square";
      tone.frequency.value = i % 2 ? 660 : 990;
      const t = start + i * 0.22;
      styrke.gain.setValueAtTime(0.0001, t);
      styrke.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      styrke.gain.setValueAtTime(0.18, t + 0.17);
      styrke.gain.exponentialRampToValueAtTime(0.0001, t + 0.21);
      tone.connect(styrke).connect(lydKontekst.destination);
      tone.start(t);
      tone.stop(t + 0.22);
    }
  } catch (e) {}
}

function kopierInd(maal, kilde) {
  Object.keys(maal).forEach(function (k) { delete maal[k]; });
  Object.assign(maal, kilde);
}

function hentPersonale() {
  const token = mitToken();
  if (!SERVER.til || !token) return;
  serverKald("hv_personale_hent", { p_token: token }).then(function (svar) {
    const foersteGang = !personaleHentet;
    personaleHentet = true;
    // første gang: ejeren sender de skilte og låse, der kun lå på denne computer, op til serveren
    if (foersteGang && EJERE.indexOf(FIGUR.navn) >= 0) {
      Object.keys(ansatte).forEach(function (n) {
        if (!(n in svar.ansatte)) { svar.ansatte[n] = ansatte[n]; serverKald("hv_ansaet", { p_token: token, p_navn: n, p_skilt: ansatte[n] }).catch(function () {}); }
      });
      Object.keys(eventLaas).forEach(function (r) {
        if (eventLaas[r] && !(r in svar.eventLaas)) { svar.eventLaas[r] = true; serverKald("hv_event_laas_saet", { p_token: token, p_rum: r, p_laast: true }).catch(function () {}); }
      });
    }
    serverAnsatte = Object.assign({}, svar.ansatte);
    serverEventLaas = Object.assign({}, svar.eventLaas);
    kopierInd(ansatte, svar.ansatte);
    kopierInd(eventLaas, svar.eventLaas);
    // er rummet, jeg står i, lige blevet låst for mig?
    if (rumValg === "vaerelse" && eventLaastFor(aktivtVaerelse)) {
      skiftRum("hal");
      besked.textContent = "🔒 Event-rummet blev låst. Kun ansatte kan være derinde lige nu.";
    }
    // nye alarmer fra andre giver en alarmlyd
    serverAlarmer = svar.alarmer || [];
    serverAlarmer.forEach(function (a) {
      if (hoerteAlarmer[a.id]) return;
      hoerteAlarmer[a.id] = true;
      if (a.navn !== FIGUR.navn && erAnsatHer() && !foersteGang) spilAlarm();
    });
    visAlarmer();
  }).catch(function () {});   // database-4-personale.sql er ikke kørt endnu
}
hentPersonale();
setInterval(hentPersonale, 3000);


// -------------------------------------------------------------
//  Ansættelse: ejerens ændringer sendes til serveren
// -------------------------------------------------------------
const gemAnsatteFoerServer = gemAnsatte;
gemAnsatte = function () {
  gemAnsatteFoerServer();
  if (!personaleHentet) return;
  const navne = Object.keys(ansatte).concat(Object.keys(serverAnsatte));
  navne.forEach(function (n) {
    if ((ansatte[n] || null) === (serverAnsatte[n] || null)) return;
    serverAnsatte[n] = ansatte[n];
    if (!ansatte[n]) delete serverAnsatte[n];
    serverKald("hv_ansaet", { p_token: mitToken(), p_navn: n, p_skilt: ansatte[n] || null })
      .catch(function (e) { besked.textContent = e.message; });
  });
};


// -------------------------------------------------------------
//  Event-rum: Lås / Åben sendes til serveren
// -------------------------------------------------------------
const gemEventLaasFoerServer = gemEventLaas;
gemEventLaas = function () {
  gemEventLaasFoerServer();
  if (!personaleHentet) return;
  Object.keys(eventLaas).forEach(function (r) {
    if (!!eventLaas[r] === !!serverEventLaas[r]) return;
    serverEventLaas[r] = !!eventLaas[r];
    serverKald("hv_event_laas_saet", { p_token: mitToken(), p_rum: r, p_laast: !!eventLaas[r] })
      .catch(function (e) { besked.textContent = e.message; });
  });
};


// -------------------------------------------------------------
//  🚨 Tilkald hjælp: alarmerne ligger på serveren
// -------------------------------------------------------------
const hentAlarmerFoerServer = hentAlarmer;
hentAlarmer = function () {
  if (!personaleHentet) return hentAlarmerFoerServer();
  return serverAlarmer.filter(function (a) { return Date.now() - a.tid < HJAELP_VARER; });
};

const gemAlarmerFoerServer = gemAlarmer;
gemAlarmer = function (liste) {
  if (!personaleHentet) { gemAlarmerFoerServer(liste); return; }
  const token = mitToken();
  liste.forEach(function (a) {
    if (serverAlarmer.some(function (x) { return x.id === a.id; })) return;
    hoerteAlarmer[a.id] = true;
    spilAlarm();      // man kan høre, at alarmen er sendt
    serverKald("hv_hjaelp_kald", { p_token: token, p_id: a.id, p_rum: a.rum, p_rum_navn: a.rumNavn })
      .catch(function (e) { besked.textContent = e.message; });
  });
  serverAlarmer.forEach(function (a) {
    if (liste.some(function (x) { return x.id === a.id; })) return;
    serverKald("hv_hjaelp_fjern", { p_token: token, p_id: a.id }).catch(function () {});
  });
  serverAlarmer = liste.slice();
};
