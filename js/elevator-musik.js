// =============================================================
//  🎵 Elevatormusik
//  Hyggelig, lidt fjollet jazz-musik, der spiller, mens elevator-
//  menuen er åben og under turen. Musikken er lavet med kode
//  (Web Audio), så der er ingen lydfiler og ingen andres musik.
//  🔊/🔇-knappen i toppen af elevatoren slår den til og fra
//  (valget huskes i mit-hotel-elevatormusik).
//  Hentes fra js/panel-forklaring.js, så hotel.html ikke skal ændres.
// =============================================================
(function () {
  const ELEVMUSIK_NOEGLE = "mit-hotel-elevatormusik";
  const LYDSTYRKE = 0.07;          // lav lydstyrke
  const OTTENDEDEL = 0.3;          // 100 slag i minuttet
  let musikTil = true;
  try { musikTil = localStorage.getItem(ELEVMUSIK_NOEGLE) !== "fra"; } catch (e) {}

  let lyd = null, hoved = null, vibeGain = null;
  let spiller = false, naesteTid = 0, trin = 0, ur = null, stopUr = null;

  // Lyd må først starte, når man har klikket på siden (browserens regel)
  function lavLyd() {
    if (lyd) return lyd;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    lyd = new AC();
    hoved = lyd.createGain();
    hoved.gain.value = 0;
    // lidt blødere lyd (ligesom en gammel højttaler i loftet)
    const filter = lyd.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200;
    hoved.connect(filter);
    filter.connect(lyd.destination);
    // vibrafonen "bølger" (tremolo)
    vibeGain = lyd.createGain();
    vibeGain.gain.value = 0.8;
    const lfo = lyd.createOscillator(), lfoStyrke = lyd.createGain();
    lfo.frequency.value = 5.5;
    lfoStyrke.gain.value = 0.2;
    lfo.connect(lfoStyrke);
    lfoStyrke.connect(vibeGain.gain);
    lfo.start();
    vibeGain.connect(hoved);
    return lyd;
  }
  window.addEventListener("pointerdown", function () {
    if (lavLyd() && lyd.state === "suspended") lyd.resume();
  }, true);

  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // ----- Instrumenterne -----
  function tone(n, t, laengde, styrke, type, ud, decay) {
    const o = lyd.createOscillator(), g = lyd.createGain();
    o.type = type;
    o.frequency.value = hz(n);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(styrke, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + laengde + decay);
    o.connect(g);
    g.connect(ud);
    o.start(t);
    o.stop(t + laengde + decay + 0.05);
  }
  function klaver(akkord, t) {               // blødt el-klaver
    akkord.forEach(function (n) {
      tone(n, t, 0.25, 0.09, "sine", hoved, 0.5);
      tone(n + 12, t, 0.1, 0.015, "triangle", hoved, 0.3);
    });
  }
  function bas(n, t, laengde) { tone(n, t, laengde, 0.32, "triangle", hoved, 0.15); }
  function vibrafon(n, t, laengde) {
    tone(n, t, laengde, 0.22, "sine", vibeGain, 0.9);
    tone(n + 24, t, 0.02, 0.03, "sine", vibeGain, 0.25);  // lille "pling" i anslaget
  }
  let stoej = null;
  function rasle(t, styrke) {                // lille rasle-æg (shaker)
    if (!stoej) {
      stoej = lyd.createBuffer(1, lyd.sampleRate * 0.1, lyd.sampleRate);
      const d = stoej.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const k = lyd.createBufferSource(), f = lyd.createBiquadFilter(), g = lyd.createGain();
    k.buffer = stoej;
    f.type = "highpass";
    f.frequency.value = 6000;
    g.gain.setValueAtTime(styrke, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    k.connect(f); f.connect(g); g.connect(hoved);
    k.start(t);
  }

  // ----- Melodien: 8 takter, der gentages -----
  // hver takt: akkord, basnoder [rod, kvint], og melodi [ottendedel, tone, længde]
  const TAKTER = [
    { akkord: [52, 55, 59, 62], bas: [36, 43], mel: [[0, 76, 2], [2, 74, 1], [3, 72, 3], [6, 71, 2]] },   // Cmaj7
    { akkord: [52, 55, 60, 64], bas: [33, 40], mel: [[0, 72, 2], [2, 76, 2], [4, 79, 3], [7, 77, 1]] },   // Am7
    { akkord: [53, 57, 60, 64], bas: [38, 45], mel: [[0, 76, 2], [2, 74, 2], [4, 72, 2], [6, 69, 2]] },   // Dm7
    { akkord: [53, 57, 59, 64], bas: [43, 38], mel: [[0, 71, 3], [3, 74, 3], [6, 77, 2]] },               // G7
    { akkord: [50, 55, 59, 62], bas: [40, 47], mel: [[0, 79, 2], [2, 76, 1], [3, 74, 3], [6, 71, 2]] },   // Em7
    { akkord: [55, 59, 61, 66], bas: [45, 40], mel: [[0, 73, 2], [2, 76, 2], [4, 79, 2], [6, 81, 2]] },   // A7
    { akkord: [53, 57, 60, 64], bas: [38, 45], mel: [[0, 77, 3], [3, 76, 1], [4, 74, 2], [6, 72, 2]] },   // Dm7
    { akkord: [53, 57, 59, 64], bas: [43, 38], mel: [[0, 74, 3], [3, 71, 1], [4, 67, 4]] }                // G7
  ];

  function spilTrin(t) {
    const takt = TAKTER[Math.floor(trin / 8) % TAKTER.length], i = trin % 8;
    // bossa-agtig rytme på klaveret
    const slag = Math.floor(trin / 8) % 2 ? [0, 3, 6] : [0, 3, 5];
    if (slag.indexOf(i) >= 0) klaver(takt.akkord, t);
    if (i === 0) bas(takt.bas[0], t, OTTENDEDEL * 2.5);
    if (i === 3) bas(takt.bas[1], t, OTTENDEDEL);
    if (i === 4) bas(takt.bas[0], t, OTTENDEDEL * 1.5);
    if (i === 6) bas(takt.bas[1], t, OTTENDEDEL * 1.5);
    takt.mel.forEach(function (m) { if (m[0] === i) vibrafon(m[1], t, OTTENDEDEL * m[2] * 0.8); });
    rasle(t, i % 2 ? 0.05 : 0.025);
  }
  // planlæg noderne lidt frem i tiden, så musikken ikke hakker
  function planlaeg() {
    while (naesteTid < lyd.currentTime + 0.25) {
      spilTrin(naesteTid);
      naesteTid += OTTENDEDEL;
      trin++;
    }
  }

  function startMusik() {
    if (!musikTil || !lavLyd()) return;
    if (lyd.state === "suspended") lyd.resume();
    clearTimeout(stopUr);
    const nu = lyd.currentTime;
    hoved.gain.cancelScheduledValues(nu);
    hoved.gain.setValueAtTime(hoved.gain.value, nu);
    hoved.gain.linearRampToValueAtTime(LYDSTYRKE, nu + 0.8);
    if (spiller) return;
    spiller = true;
    trin = 0;
    naesteTid = nu + 0.05;
    planlaeg();
    ur = setInterval(planlaeg, 80);
  }
  function stopMusik() {
    if (!spiller || !lyd) return;
    const nu = lyd.currentTime;
    hoved.gain.cancelScheduledValues(nu);
    hoved.gain.setValueAtTime(hoved.gain.value, nu);
    hoved.gain.linearRampToValueAtTime(0, nu + 1.2);    // tones langsomt ud
    clearTimeout(stopUr);
    stopUr = setTimeout(function () {
      clearInterval(ur);
      spiller = false;
    }, 1300);
  }

  // ----- Musikken følger elevatoren: menuen åben eller turen i gang -----
  const menu = document.getElementById("elevator");
  const tur = document.getElementById("elevator-tur");
  if (!menu || !tur) return;
  function iElevatoren() { return !menu.hidden || !tur.hidden || (typeof elevKoerer !== "undefined" && elevKoerer); }
  function tjek() { if (iElevatoren() && musikTil) startMusik(); else stopMusik(); }
  const vagt = new MutationObserver(tjek);
  vagt.observe(menu, { attributes: true, attributeFilter: ["hidden"] });
  vagt.observe(tur, { attributes: true, attributeFilter: ["hidden"] });

  // ----- 🔊/🔇-knappen i toppen af elevatoren -----
  const luk = document.getElementById("elev-luk");
  const knap = document.createElement("button");
  knap.type = "button";
  knap.id = "elev-musik";
  knap.style.marginLeft = "auto";
  knap.style.marginRight = "6px";
  function visKnap() {
    knap.textContent = musikTil ? "🔊" : "🔇";
    knap.title = musikTil ? "Slå elevatormusikken fra" : "Slå elevatormusikken til";
  }
  visKnap();
  knap.addEventListener("click", function () {
    musikTil = !musikTil;
    try { localStorage.setItem(ELEVMUSIK_NOEGLE, musikTil ? "til" : "fra"); } catch (e) {}
    visKnap();
    tjek();
  });
  if (luk) luk.parentNode.insertBefore(knap, luk);
})();
