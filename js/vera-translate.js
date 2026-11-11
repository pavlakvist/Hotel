// =============================================================
//  🌐 Vera-translate — oversætter-app på telefonen
//  Hentes i App Butik på telefonen (gratis), ligesom Vera-maps.
//  - ✍️ Oversæt: skriv en tekst, vælg sprog, få den oversat. Læs op, kopiér,
//    gem – eller send den direkte i chatten.
//  - 💬 Chat: det, folk har sagt i rummet. Tryk 🌐 for at oversætte en besked
//    til dit eget sprog, og ↩ for at svare på deres sprog.
//  - 📖 Parlør: færdige sætninger til hotellet på 13 sprog (virker også
//    uden internet).
//  - 🕘 Historik og ⭐ Gemt.
//
//  Selve oversættelsen kommer fra den gratis tjeneste MyMemory
//  (api.mymemory.translated.net). Virker den ikke, prøves Lingva, og ellers
//  bruges parløren. Ingen database nødvendig. Hentes fra js/panel-forklaring.js.
// =============================================================
(function () {
  if (window.veraTranslateKlar) return;
  window.veraTranslateKlar = true;

  // ---------------------------------------------------------------
  //  Små hjælpere
  // ---------------------------------------------------------------
  function vent(test, gør, gange) {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { gør(); return; }
    if ((gange || 0) > 240) return;
    setTimeout(function () { vent(test, gør, (gange || 0) + 1); }, 250);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function mig() { return typeof FIGUR !== "undefined" ? FIGUR.navn : ""; }
  // MyMemory sender nogle gange tegn som &#39; – lav dem om til rigtige tegn
  function afkod(t) {
    const d = document.createElement("textarea");
    d.innerHTML = String(t || "");
    return d.value;
  }
  function kl(t) { const d = new Date(t); return ("0" + d.getHours()).slice(-2) + "." + ("0" + d.getMinutes()).slice(-2); }

  // ---------------------------------------------------------------
  //  Sprogene
  // ---------------------------------------------------------------
  const SPROG = [
    { id: "da", navn: "Dansk",      flag: "🇩🇰", tale: "da-DK" },
    { id: "en", navn: "Engelsk",    flag: "🇬🇧", tale: "en-GB" },
    { id: "de", navn: "Tysk",       flag: "🇩🇪", tale: "de-DE" },
    { id: "sv", navn: "Svensk",     flag: "🇸🇪", tale: "sv-SE" },
    { id: "no", navn: "Norsk",      flag: "🇳🇴", tale: "nb-NO" },
    { id: "es", navn: "Spansk",     flag: "🇪🇸", tale: "es-ES" },
    { id: "fr", navn: "Fransk",     flag: "🇫🇷", tale: "fr-FR" },
    { id: "it", navn: "Italiensk",  flag: "🇮🇹", tale: "it-IT" },
    { id: "nl", navn: "Hollandsk",  flag: "🇳🇱", tale: "nl-NL" },
    { id: "pl", navn: "Polsk",      flag: "🇵🇱", tale: "pl-PL" },
    { id: "pt", navn: "Portugisisk", flag: "🇵🇹", tale: "pt-PT" },
    { id: "tr", navn: "Tyrkisk",    flag: "🇹🇷", tale: "tr-TR" },
    { id: "uk", navn: "Ukrainsk",   flag: "🇺🇦", tale: "uk-UA" },
  ];
  const IDS = SPROG.map(function (s) { return s.id; });
  function sprog(id) { return SPROG.find(function (s) { return s.id === id; }) || SPROG[0]; }
  function sprogNavn(id) { const s = sprog(id); return s.flag + " " + s.navn; }

  // ---------------------------------------------------------------
  //  📖 Parløren – færdige sætninger (samme rækkefølge som SPROG)
  // ---------------------------------------------------------------
  const PARLOER = [
    { gruppe: "👋 Hils", s: [
      ["Hej", "Hi", "Hallo", "Hej", "Hei", "Hola", "Salut", "Ciao", "Hoi", "Cześć", "Olá", "Merhaba", "Привіт"],
      ["Hvordan går det?", "How are you?", "Wie geht's?", "Hur mår du?", "Hvordan går det?", "¿Cómo estás?", "Comment ça va ?", "Come stai?", "Hoe gaat het?", "Jak się masz?", "Como você está?", "Nasılsın?", "Як справи?"],
      ["Det går godt, tak!", "I'm fine, thanks!", "Mir geht's gut, danke!", "Jag mår bra, tack!", "Det går bra, takk!", "¡Estoy bien, gracias!", "Ça va bien, merci !", "Sto bene, grazie!", "Het gaat goed, dank je!", "Dobrze, dziękuję!", "Estou bem, obrigado!", "İyiyim, teşekkürler!", "Добре, дякую!"],
      ["Velkommen til hotellet!", "Welcome to the hotel!", "Willkommen im Hotel!", "Välkommen till hotellet!", "Velkommen til hotellet!", "¡Bienvenido al hotel!", "Bienvenue à l'hôtel !", "Benvenuto all'hotel!", "Welkom in het hotel!", "Witamy w hotelu!", "Bem-vindo ao hotel!", "Otele hoş geldin!", "Ласкаво просимо до готелю!"],
      ["Vi ses!", "See you!", "Bis später!", "Vi ses!", "Vi ses!", "¡Hasta luego!", "À plus !", "Ci vediamo!", "Tot ziens!", "Do zobaczenia!", "Até logo!", "Görüşürüz!", "До зустрічі!"],
      ["Farvel!", "Goodbye!", "Tschüss!", "Hej då!", "Ha det!", "¡Adiós!", "Au revoir !", "Arrivederci!", "Doei!", "Do widzenia!", "Tchau!", "Hoşça kal!", "Бувай!"],
      ["Godnat!", "Good night!", "Gute Nacht!", "God natt!", "God natt!", "¡Buenas noches!", "Bonne nuit !", "Buonanotte!", "Welterusten!", "Dobranoc!", "Boa noite!", "İyi geceler!", "На добраніч!"],
    ] },
    { gruppe: "💬 Snak", s: [
      ["Hvad hedder du?", "What's your name?", "Wie heißt du?", "Vad heter du?", "Hva heter du?", "¿Cómo te llamas?", "Comment tu t'appelles ?", "Come ti chiami?", "Hoe heet je?", "Jak masz na imię?", "Qual é o seu nome?", "Adın ne?", "Як тебе звати?"],
      ["Hvor kommer du fra?", "Where are you from?", "Woher kommst du?", "Var kommer du ifrån?", "Hvor kommer du fra?", "¿De dónde eres?", "D'où viens-tu ?", "Di dove sei?", "Waar kom je vandaan?", "Skąd jesteś?", "De onde você é?", "Nerelisin?", "Звідки ти?"],
      ["Jeg er fra Danmark", "I'm from Denmark", "Ich komme aus Dänemark", "Jag kommer från Danmark", "Jeg er fra Danmark", "Soy de Dinamarca", "Je viens du Danemark", "Vengo dalla Danimarca", "Ik kom uit Denemarken", "Jestem z Danii", "Sou da Dinamarca", "Danimarkalıyım", "Я з Данії"],
      ["Ja", "Yes", "Ja", "Ja", "Ja", "Sí", "Oui", "Sì", "Ja", "Tak", "Sim", "Evet", "Так"],
      ["Nej", "No", "Nein", "Nej", "Nei", "No", "Non", "No", "Nee", "Nie", "Não", "Hayır", "Ні"],
      ["Tak", "Thank you", "Danke", "Tack", "Takk", "Gracias", "Merci", "Grazie", "Dank je", "Dziękuję", "Obrigado", "Teşekkürler", "Дякую"],
      ["Undskyld", "Sorry", "Entschuldigung", "Förlåt", "Unnskyld", "Lo siento", "Pardon", "Scusa", "Sorry", "Przepraszam", "Desculpa", "Özür dilerim", "Вибач"],
      ["Jeg forstår ikke", "I don't understand", "Ich verstehe nicht", "Jag förstår inte", "Jeg forstår ikke", "No entiendo", "Je ne comprends pas", "Non capisco", "Ik begrijp het niet", "Nie rozumiem", "Não entendo", "Anlamıyorum", "Я не розумію"],
      ["Taler du engelsk?", "Do you speak English?", "Sprichst du Englisch?", "Pratar du engelska?", "Snakker du engelsk?", "¿Hablas inglés?", "Tu parles anglais ?", "Parli inglese?", "Spreek je Engels?", "Mówisz po angielsku?", "Você fala inglês?", "İngilizce konuşuyor musun?", "Ти розмовляєш англійською?"],
      ["Vil du være min ven?", "Do you want to be my friend?", "Willst du mein Freund sein?", "Vill du vara min vän?", "Vil du være vennen min?", "¿Quieres ser mi amigo?", "Tu veux être mon ami ?", "Vuoi essere mio amico?", "Wil je mijn vriend zijn?", "Chcesz być moim przyjacielem?", "Quer ser meu amigo?", "Arkadaşım olmak ister misin?", "Хочеш бути моїм другом?"],
      ["Tillykke med fødselsdagen!", "Happy birthday!", "Alles Gute zum Geburtstag!", "Grattis på födelsedagen!", "Gratulerer med dagen!", "¡Feliz cumpleaños!", "Joyeux anniversaire !", "Buon compleanno!", "Gefeliciteerd met je verjaardag!", "Wszystkiego najlepszego!", "Feliz aniversário!", "İyi ki doğdun!", "З днем народження!"],
    ] },
    { gruppe: "🏨 På hotellet", s: [
      ["Jeg er ny her", "I'm new here", "Ich bin neu hier", "Jag är ny här", "Jeg er ny her", "Soy nuevo aquí", "Je suis nouveau ici", "Sono nuovo qui", "Ik ben nieuw hier", "Jestem tu nowy", "Sou novo aqui", "Burada yeniyim", "Я тут новенький"],
      ["Kom med mig!", "Come with me!", "Komm mit mir!", "Följ med mig!", "Bli med meg!", "¡Ven conmigo!", "Viens avec moi !", "Vieni con me!", "Kom met mij mee!", "Chodź ze mną!", "Vem comigo!", "Benimle gel!", "Ходімо зі мною!"],
      ["Flot værelse!", "Nice room!", "Schönes Zimmer!", "Fint rum!", "Fint rom!", "¡Bonita habitación!", "Belle chambre !", "Bella stanza!", "Mooie kamer!", "Ładny pokój!", "Quarto bonito!", "Güzel oda!", "Гарна кімната!"],
      ["Vil du bytte?", "Do you want to trade?", "Willst du tauschen?", "Vill du byta?", "Vil du bytte?", "¿Quieres intercambiar?", "Tu veux échanger ?", "Vuoi scambiare?", "Wil je ruilen?", "Chcesz się wymienić?", "Quer trocar?", "Takas yapmak ister misin?", "Хочеш обмінятися?"],
      ["Hvor er caféen?", "Where is the café?", "Wo ist das Café?", "Var är kaféet?", "Hvor er kafeen?", "¿Dónde está la cafetería?", "Où est le café ?", "Dov'è il bar?", "Waar is het café?", "Gdzie jest kawiarnia?", "Onde fica o café?", "Kafe nerede?", "Де кафе?"],
      ["Skal vi i biografen?", "Shall we go to the cinema?", "Gehen wir ins Kino?", "Ska vi gå på bio?", "Skal vi på kino?", "¿Vamos al cine?", "On va au cinéma ?", "Andiamo al cinema?", "Zullen we naar de bioscoop gaan?", "Idziemy do kina?", "Vamos ao cinema?", "Sinemaya gidelim mi?", "Підемо в кіно?"],
      ["Hvor er elevatoren?", "Where is the elevator?", "Wo ist der Aufzug?", "Var är hissen?", "Hvor er heisen?", "¿Dónde está el ascensor?", "Où est l'ascenseur ?", "Dov'è l'ascensore?", "Waar is de lift?", "Gdzie jest winda?", "Onde fica o elevador?", "Asansör nerede?", "Де ліфт?"],
      ["Kan du hjælpe mig?", "Can you help me?", "Kannst du mir helfen?", "Kan du hjälpa mig?", "Kan du hjelpe meg?", "¿Me puedes ayudar?", "Tu peux m'aider ?", "Puoi aiutarmi?", "Kun je me helpen?", "Możesz mi pomóc?", "Pode me ajudar?", "Bana yardım edebilir misin?", "Можеш мені допомогти?"],
    ] },
  ];
  function normal(t) { return String(t || "").toLowerCase().replace(/[!?.,¡¿…:;"'’\s]+/g, " ").trim(); }
  // Find en sætning fra parløren (bruges, når der ikke er internet)
  function fraParloer(tekst, fra, til) {
    const n = normal(tekst), fi = IDS.indexOf(fra), ti = IDS.indexOf(til);
    if (!n || ti < 0) return null;
    for (const g of PARLOER) for (const r of g.s) {
      if (fi >= 0 ? normal(r[fi]) === n : r.some(function (x) { return normal(x) === n; })) return r[ti];
    }
    return null;
  }

  // ---------------------------------------------------------------
  //  🔍 Gæt sproget (når man vælger "Find selv")
  // ---------------------------------------------------------------
  const ORD = {
    da: "jeg du er det og ikke hvad hvordan hej har vil med til på en et af kan skal tak hvor godt mig dig nej ja også bare noget meget lige",
    en: "the you i is are and not what how hello hi have will with to on a an of can thanks where good me yes no my your it this that do",
    de: "ich du ist sind und nicht was wie hallo habe mit zu auf ein eine der die das kann danke wo gut mich dich ja nein auch mein",
    sv: "jag du är och inte vad hur hej har vill med till på en ett av kan ska tack var bra mig dig nej ja också bara något mycket",
    no: "jeg du er det og ikke hva hvordan hei har vil med til på en et av kan skal takk hvor bra meg deg nei ja også bare noe veldig",
    es: "yo tú es son y no qué cómo hola tengo con a en un una el la de puedo gracias dónde bien me te sí mi está estás",
    fr: "je tu est sont et ne pas quoi comment salut bonjour ai avec à sur un une le la de peux merci où bien moi toi oui non mon",
    it: "io tu è sono e non che come ciao ho con a su un una il la di posso grazie dove bene me te sì no mio sei",
    nl: "ik jij je is zijn en niet wat hoe hoi hallo heb met naar op een het de van kan bedankt waar goed mij jou ja nee ook mijn",
    pl: "ja ty jest są i nie co jak cześć mam z do na w to się dziękuję gdzie dobrze mnie ciebie tak mój jestem",
    pt: "eu você é são e não que como olá tenho com a em um uma o de posso obrigado onde bem me te sim meu está",
    tr: "ben sen bu ve değil ne nasıl merhaba var ile bir için evet hayır teşekkürler nerede iyi benim senin mı mi musun",
    uk: "я ти це і не що як привіт маю з до на в так ні дякую де добре мене тебе мій",
  };
  const ORDSAET = {};
  Object.keys(ORD).forEach(function (k) { ORDSAET[k] = new Set(ORD[k].split(" ")); });
  function gaetSprog(tekst) {
    const t = String(tekst || "").toLowerCase();
    if (/[а-яіїєґ]/.test(t)) return "uk";
    const p = {};
    IDS.forEach(function (id) { p[id] = 0; });
    t.split(/[^a-zæøåäöüßéèêàâçñíóúãõąćęłńśźżğışç]+/).forEach(function (o) {
      if (!o) return;
      IDS.forEach(function (id) { if (ORDSAET[id] && ORDSAET[id].has(o)) p[id] += 1; });
    });
    if (/[æø]/.test(t)) { p.da += 2; p.no += 2; }
    if (/[äö]/.test(t)) { p.sv += 1.5; p.de += 1.5; }
    if (/[üß]/.test(t)) p.de += 3;
    if (/å/.test(t) && !/[æø]/.test(t)) p.sv += 1;
    if (/[ñ¿¡]/.test(t)) p.es += 3;
    if (/[çèêàâ]/.test(t)) p.fr += 2;
    if (/[ąćęłńśźż]/.test(t)) p.pl += 3;
    if (/[ğış]/.test(t)) p.tr += 3;
    if (/[ãõ]/.test(t)) p.pt += 3;
    let bedst = null, max = 0;
    IDS.forEach(function (id) { if (p[id] > max) { max = p[id]; bedst = id; } });
    return bedst || "en";
  }

  // ---------------------------------------------------------------
  //  Gemt for hver spiller
  // ---------------------------------------------------------------
  function noegle() { return "mit-hotel-vera-translate-" + mig(); }
  let gemt = { fra: "auto", til: "en", mit: "da", hist: [], fav: [] };
  function hentGemt() {
    try {
      const d = JSON.parse(localStorage.getItem(noegle()) || "{}");
      gemt = {
        fra: d.fra === "auto" || IDS.indexOf(d.fra) >= 0 ? d.fra : "auto",
        til: IDS.indexOf(d.til) >= 0 ? d.til : "en",
        mit: IDS.indexOf(d.mit) >= 0 ? d.mit : "da",
        hist: Array.isArray(d.hist) ? d.hist : [],
        fav: Array.isArray(d.fav) ? d.fav : [],
      };
    } catch (e) {}
  }
  function gem() { try { localStorage.setItem(noegle(), JSON.stringify(gemt)); } catch (e) {} }

  // ---------------------------------------------------------------
  //  Oversættelse via internettet
  // ---------------------------------------------------------------
  const MAKS = 450;          // MyMemory tager højst 500 bogstaver ad gangen
  const huske = {};          // samme tekst oversættes ikke to gange
  function hentMedTid(url, ms) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).finally(function () { clearTimeout(t); });
  }
  function myMemory(tekst, fra, til) {
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(tekst) + "&langpair=" + fra + "|" + til;
    return hentMedTid(url, 9000).then(function (r) { return r.json(); }).then(function (d) {
      const ud = d && d.responseData && d.responseData.translatedText;
      const status = Number(d && d.responseStatus);
      if (!ud || (status && status !== 200)) throw new Error(String(d && (d.responseDetails || d.responseStatus) || "fejl"));
      if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE PAIR/i.test(ud)) throw new Error(ud);
      return afkod(ud);
    });
  }
  function lingva(tekst, fra, til) {
    const url = "https://lingva.ml/api/v1/" + fra + "/" + til + "/" + encodeURIComponent(tekst);
    return hentMedTid(url, 9000).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.translation) throw new Error("fejl");
      return afkod(d.translation);
    });
  }
  // Giver { tekst, kilde, fra } – eller fejl
  function oversaet(tekst, fra, til) {
    tekst = String(tekst || "").trim().slice(0, MAKS);
    if (!tekst) return Promise.reject(new Error("tom"));
    if (fra === "auto") fra = gaetSprog(tekst);
    if (fra === til) return Promise.resolve({ tekst: tekst, kilde: "samme", fra: fra });
    const k = fra + "|" + til + "|" + tekst;
    if (huske[k]) return Promise.resolve(huske[k]);
    const p = fraParloer(tekst, fra, til);
    if (p) { huske[k] = { tekst: p, kilde: "parlør", fra: fra }; return Promise.resolve(huske[k]); }
    return myMemory(tekst, fra, til).then(function (ud) {
      return (huske[k] = { tekst: ud, kilde: "MyMemory", fra: fra });
    }).catch(function (fejl1) {
      return lingva(tekst, fra, til).then(function (ud) {
        return (huske[k] = { tekst: ud, kilde: "Lingva", fra: fra });
      }).catch(function () {
        const e = new Error(/MYMEMORY WARNING|429/i.test(String(fejl1 && fejl1.message)) ? "graense" : "net");
        throw e;
      });
    });
  }
  function fejlTekst(e) {
    if (e && e.message === "graense") return "😴 Oversætteren har brugt dagens gratis oversættelser. Prøv igen i morgen – eller brug 📖 Parløren.";
    return "📡 Kunne ikke nå oversætteren. Er du på internettet? Sætningerne i 📖 Parløren virker altid.";
  }

  // ---------------------------------------------------------------
  //  💬 Chatten – husk det, folk siger i rummet
  // ---------------------------------------------------------------
  const chat = [];   // { navn, tekst, tid, ud?, fra?, fejl? }
  function lytTilChat() {
    if (typeof window.sig !== "function" || window.sig.veraTranslate) return;
    const gl = window.sig;
    const ny = function (hvem, navn, tekst) {
      gl.apply(this, arguments);
      try {
        const t = String(tekst == null ? "" : tekst).trim();
        if (!t || !navn) return;
        chat.push({ navn: String(navn), tekst: t, tid: Date.now(), mig: navn === mig() });
        while (chat.length > 40) chat.shift();
        if (appEl && fane === "chat") tegn();
      } catch (e) {}
    };
    ny.veraTranslate = true;
    window.sig = ny;
    try { sig = ny; } catch (e) {}   // chat.js kalder sig() direkte
  }
  vent(function () { return typeof window.sig === "function"; }, lytTilChat);
  // Hvis en anden fil pakker sig ind senere, så lyt igen
  setInterval(function () { if (typeof window.sig === "function" && !window.sig.veraTranslate) lytTilChat(); }, 5000);

  // Send en tekst i hotellets chat
  function iChatten(tekst, send) {
    const felt = document.getElementById("chat-tekst"), form = document.getElementById("chat");
    if (!felt) { lille("💬 Chatten findes ikke her"); return; }
    const maks = Number(felt.getAttribute("maxlength")) || 100;
    let t = String(tekst || "").trim();
    if (t.length > maks) { t = t.slice(0, maks); lille("✂️ Chatten tager højst " + maks + " tegn – resten blev skåret af"); }
    felt.value = t;
    if (send && form) {
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true }));
      lille("💬 Sendt i chatten");
    } else {
      felt.focus();
      lille("✏️ Teksten står i chatfeltet – tryk Enter for at sende");
    }
  }

  // ---------------------------------------------------------------
  //  🔊 Læs op og 📋 kopiér
  // ---------------------------------------------------------------
  function laesOp(tekst, id) {
    if (!("speechSynthesis" in window)) { lille("🔇 Din browser kan ikke læse op"); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tekst);
      u.lang = sprog(id).tale;
      const s = speechSynthesis.getVoices().find(function (v) { return v.lang && v.lang.toLowerCase().indexOf(id === "no" ? "nb" : id) === 0; });
      if (s) u.voice = s;
      speechSynthesis.speak(u);
    } catch (e) { lille("🔇 Kunne ikke læse op"); }
  }
  function kopier(tekst) {
    function gl() {
      const t = document.createElement("textarea");
      t.value = tekst; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); lille("📋 Kopieret"); } catch (e) { lille("📋 Kunne ikke kopiere"); }
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tekst).then(function () { lille("📋 Kopieret"); }, gl);
    else gl();
  }

  // ---------------------------------------------------------------
  //  Appen
  // ---------------------------------------------------------------
  const IKON = "<rect x='3' y='3' width='18' height='18' rx='4' fill='#e8649a'/>" +
    "<path d='M5 6.5h8.5a1.5 1.5 0 0 1 1.5 1.5v4.5a1.5 1.5 0 0 1-1.5 1.5H9l-2.6 2.2V14H5z' fill='#fff'/>" +
    "<path d='M19 10.5h-2.6v3a2.4 2.4 0 0 1-2.4 2.4h-2.2v.6a1.5 1.5 0 0 0 1.5 1.5h3.4l2.3 1.9V18H19a1 1 0 0 0 1-1v-5.5a1 1 0 0 0-1-1z' fill='#ffd6e7'/>" +
    "<text x='9.2' y='12.4' font-size='5.4' font-weight='700' text-anchor='middle' fill='#c2306f' font-family='Verdana'>A</text>" +
    "<text x='16.4' y='16.6' font-size='4.6' font-weight='700' text-anchor='middle' fill='#c2306f' font-family='Verdana'>Ü</text>";
  let api = null, appEl = null;
  let fane = "oversaet";      // oversaet | chat | parloer | hist | gemt
  let input = "";
  let resultat = null;        // { tekst, kilde, fra, til, kilde }
  let arbejder = false;
  let fejl = "";
  let parloerGruppe = 0;

  const APP = {
    navn: "Vera-translate", ikSvg: IKON, bg: "linear-gradient(#ffa6cb, #e0558f)", butik: true,
    tekst: "Oversæt mellem 13 sprog 🌐 Forstå chatten, svar på andres sprog og brug parløren med færdige sætninger.",
    tegn: function (el, a) {
      api = a; appEl = el; hentGemt();
      tegn();
    },
    luk: function () {
      try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (e) {}
      api = null; appEl = null;
    },
  };
  function lille(t) { if (api && api.lille) api.lille(t); else if (typeof besked !== "undefined" && besked) besked.textContent = t; }

  function sprogValg(id, vaerdi, medAuto) {
    return "<select id='" + id + "'>" + (medAuto ? "<option value='auto'" + (vaerdi === "auto" ? " selected" : "") + ">🔍 Find selv</option>" : "") +
      SPROG.map(function (s) { return "<option value='" + s.id + "'" + (s.id === vaerdi ? " selected" : "") + ">" + s.flag + " " + s.navn + "</option>"; }).join("") +
      "</select>";
  }

  function tegn() {
    if (!appEl || !api) return;
    const sc = appEl.querySelector(".tlf-indhold");
    const scroll = sc ? sc.scrollTop : 0;
    const aktiv = document.activeElement && document.activeElement.id === "vt-tekst";
    appEl.innerHTML = api.top("Vera-translate") +
      "<div class='tlf-indhold vt-app'>" +
        "<div class='vt-faner'>" + [["oversaet", "✍️ Oversæt"], ["chat", "💬 Chat"], ["parloer", "📖 Parlør"], ["hist", "🕘 Historik"], ["gemt", "⭐ Gemt"]].map(function (f) {
          return "<button data-vt-fane='" + f[0] + "'" + (fane === f[0] ? " class='valgt'" : "") + ">" + f[1] + "</button>";
        }).join("") + "</div>" +
        "<div class='vt-krop'>" + krop() + "</div>" +
      "</div>";
    const sc2 = appEl.querySelector(".tlf-indhold");
    if (sc2) sc2.scrollTop = scroll;
    lyt();
    if (aktiv) {
      const f = appEl.querySelector("#vt-tekst");
      if (f) { f.focus(); f.selectionStart = f.selectionEnd = f.value.length; }
    }
  }

  function krop() {
    if (fane === "chat") return tegnChat();
    if (fane === "parloer") return tegnParloer();
    if (fane === "hist") return tegnListe(gemt.hist, "hist", "Du har ikke oversat noget endnu.");
    if (fane === "gemt") return tegnListe(gemt.fav, "fav", "Tryk ⭐ ved en oversættelse for at gemme den her.");
    return tegnOversaet();
  }

  function tegnOversaet() {
    let h = "<div class='vt-sprogbar'>" + sprogValg("vt-fra", gemt.fra, true) +
      "<button class='vt-byt' data-vt-byt title='Byt sprog'>⇄</button>" + sprogValg("vt-til", gemt.til, false) + "</div>";
    h += "<div class='vt-kort'>" +
      "<textarea id='vt-tekst' maxlength='" + MAKS + "' placeholder='Skriv eller indsæt tekst …'>" + esc(input) + "</textarea>" +
      "<div class='vt-under'><span>" + (gemt.fra === "auto" && input.trim() ? "Ser ud til at være " + sprogNavn(gaetSprog(input)) : "") + "</span>" +
      "<span class='vt-taeller'>" + input.length + "/" + MAKS + "</span>" +
      (input ? "<button data-vt-ryd title='Ryd'>✕</button>" : "") + "</div></div>";
    h += "<button class='vt-hoved' data-vt-gaa" + (arbejder ? " disabled" : "") + ">" + (arbejder ? "⏳ Oversætter …" : "🌐 Oversæt") + "</button>";
    if (fejl) h += "<div class='vt-fejl'>" + esc(fejl) + "</div>";
    if (resultat) {
      const r = resultat;
      const erFav = gemt.fav.some(function (x) { return x.ind === r.ind && x.til === r.til; });
      h += "<div class='vt-kort vt-svar'>" +
        "<small>" + sprogNavn(r.til) + "</small>" +
        "<p>" + esc(r.tekst) + "</p>" +
        "<div class='vt-knapper'>" +
          "<button data-vt-laes>🔊 Læs op</button><button data-vt-kopi>📋 Kopiér</button>" +
          "<button data-vt-fav class='" + (erFav ? "valgt" : "") + "'>" + (erFav ? "⭐ Gemt" : "☆ Gem") + "</button>" +
        "</div>" +
        "<div class='vt-knapper'><button class='hoved' data-vt-send>💬 Send i chatten</button><button data-vt-felt>✏️ Til chatfeltet</button></div>" +
        "<div class='vt-kilde'>" + (r.kilde === "parlør" ? "📖 Fra parløren (virker uden internet)" : r.kilde === "samme" ? "Samme sprog – intet at oversætte" : "Oversat af " + esc(r.kilde) + " · fra " + sprogNavn(r.fra)) + "</div>" +
      "</div>";
    } else if (!fejl) {
      h += "<div class='vt-tip'>💡 Tip: Under 💬 Chat kan du oversætte det, andre siger i rummet, og svare dem på deres eget sprog.</div>";
    }
    return h;
  }

  function tegnChat() {
    let h = "<div class='vt-mitsprog'>Oversæt til " + sprogValg("vt-mit", gemt.mit, false) + "</div>";
    const liste = chat.slice().reverse();
    if (!liste.length) return h + "<div class='vt-tom'>💬 Ingen har sagt noget endnu, siden du åbnede hotellet.<br>Når nogen skriver i chatten, kommer det her.</div>";
    h += liste.map(function (b) {
      const i = chat.indexOf(b);
      return "<div class='vt-besked" + (b.mig ? " mig" : "") + "'>" +
        "<div class='vt-hvem'><b>" + esc(b.navn) + "</b><small>" + kl(b.tid) + "</small></div>" +
        "<div class='vt-org'>" + esc(b.tekst) + "</div>" +
        (b.ud ? "<div class='vt-ud'>🌐 " + esc(b.ud) + "<small>" + (b.kilde === "samme" ? "allerede på " + sprog(gemt.mit).navn.toLowerCase() : "fra " + sprogNavn(b.fra)) + "</small></div>" : "") +
        (b.fejl ? "<div class='vt-fejl lille'>" + esc(b.fejl) + "</div>" : "") +
        "<div class='vt-smaa'>" +
          (b.ud ? "" : "<button data-vt-chat-oversaet='" + i + "'>" + (b.arbejder ? "⏳" : "🌐 Oversæt") + "</button>") +
          (b.mig ? "" : "<button data-vt-svar='" + i + "'>↩ Svar på " + esc(sprog(b.fra || gaetSprog(b.tekst)).navn.toLowerCase()) + "</button>") +
        "</div></div>";
    }).join("");
    return h;
  }

  function tegnParloer() {
    const fi = IDS.indexOf(gemt.mit), ti = IDS.indexOf(gemt.til);
    let h = "<div class='vt-mitsprog'>Fra " + sprogValg("vt-mit", gemt.mit, false) + " til " + sprogValg("vt-til", gemt.til, false) + "</div>";
    h += "<div class='vt-grupper'>" + PARLOER.map(function (g, i) {
      return "<button data-vt-gruppe='" + i + "'" + (i === parloerGruppe ? " class='valgt'" : "") + ">" + g.gruppe + "</button>";
    }).join("") + "</div>";
    h += PARLOER[parloerGruppe].s.map(function (r, i) {
      return "<div class='vt-saetning'>" +
        "<div class='vt-tekst'><b>" + esc(r[ti]) + "</b><small>" + esc(r[fi]) + "</small></div>" +
        "<button data-vt-p-laes='" + i + "' title='Læs op'>🔊</button>" +
        "<button data-vt-p-send='" + i + "' title='Send i chatten'>💬</button>" +
      "</div>";
    }).join("");
    return h;
  }

  function tegnListe(l, hvad, tom) {
    if (!l.length) return "<div class='vt-tom'>" + tom + "</div>";
    return (hvad === "hist" ? "<button class='vt-ryd-alt' data-vt-ryd-hist>🗑 Ryd historikken</button>" : "") +
      l.map(function (x, i) {
        return "<div class='vt-post'>" +
          "<small>" + sprogNavn(x.fra) + " → " + sprogNavn(x.til) + "</small>" +
          "<div class='vt-org'>" + esc(x.ind) + "</div>" +
          "<div class='vt-ud'>" + esc(x.ud) + "</div>" +
          "<div class='vt-smaa'>" +
            "<button data-vt-l-laes='" + hvad + ":" + i + "'>🔊</button>" +
            "<button data-vt-l-send='" + hvad + ":" + i + "'>💬 Send</button>" +
            "<button data-vt-l-brug='" + hvad + ":" + i + "'>✍️ Brug igen</button>" +
            (hvad === "fav" ? "<button data-vt-l-slet='" + i + "'>🗑</button>" : "") +
          "</div></div>";
      }).join("");
  }

  function gaa() {
    const t = input.trim();
    if (!t || arbejder) { if (!t) lille("✍️ Skriv noget først"); return; }
    arbejder = true; fejl = ""; tegn();
    const til = gemt.til;
    oversaet(t, gemt.fra, til).then(function (r) {
      resultat = { tekst: r.tekst, kilde: r.kilde, fra: r.fra, til: til, ind: t };
      if (r.kilde !== "samme") {
        gemt.hist = [{ ind: t, ud: r.tekst, fra: r.fra, til: til, tid: Date.now() }]
          .concat(gemt.hist.filter(function (x) { return !(x.ind === t && x.til === til); })).slice(0, 30);
        gem();
      }
    }).catch(function (e) {
      resultat = null; fejl = fejlTekst(e);
    }).finally(function () { arbejder = false; tegn(); });
  }

  function listePost(v) {
    const d = String(v).split(":");
    const l = d[0] === "fav" ? gemt.fav : gemt.hist;
    return l[Number(d[1])];
  }

  function lyt() {
    const felt = appEl.querySelector("#vt-tekst");
    if (felt) {
      felt.addEventListener("input", function () {
        input = felt.value;
        const t = appEl.querySelector(".vt-taeller");
        if (t) t.textContent = input.length + "/" + MAKS;
        const g = appEl.querySelector(".vt-under span");
        if (g) g.textContent = gemt.fra === "auto" && input.trim() ? "Ser ud til at være " + sprogNavn(gaetSprog(input)) : "";
      });
      felt.addEventListener("keydown", function (e) {
        e.stopPropagation();   // så figuren ikke går, mens man skriver
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); input = felt.value; gaa(); }
      });
    }
    appEl.querySelectorAll(".vt-app select").forEach(function (s) {
      s.addEventListener("change", function () {
        if (s.id === "vt-fra") gemt.fra = s.value;
        if (s.id === "vt-til") gemt.til = s.value;
        if (s.id === "vt-mit") { gemt.mit = s.value; chat.forEach(function (b) { b.ud = null; b.fejl = ""; }); }
        gem();
        if (s.id !== "vt-mit" && resultat) resultat = null;
        tegn();
      });
    });
    appEl.querySelector(".vt-app").addEventListener("click", function (e) {
      const b = e.target.closest("button");
      if (!b) return;
      const d = b.dataset;
      if (d.vtFane) { fane = d.vtFane; fejl = ""; tegn(); return; }
      if (d.vtByt !== undefined) {
        const fra = gemt.fra === "auto" ? (input.trim() ? gaetSprog(input) : gemt.mit) : gemt.fra;
        gemt.fra = gemt.til; gemt.til = fra;
        if (resultat) { input = resultat.tekst; resultat = null; }
        gem(); tegn(); return;
      }
      if (d.vtRyd !== undefined) { input = ""; resultat = null; fejl = ""; tegn(); const f = appEl.querySelector("#vt-tekst"); if (f) f.focus(); return; }
      if (d.vtGaa !== undefined) { const f = appEl.querySelector("#vt-tekst"); if (f) input = f.value; gaa(); return; }
      if (d.vtLaes !== undefined && resultat) { laesOp(resultat.tekst, resultat.til); return; }
      if (d.vtKopi !== undefined && resultat) { kopier(resultat.tekst); return; }
      if (d.vtSend !== undefined && resultat) { iChatten(resultat.tekst, true); return; }
      if (d.vtFelt !== undefined && resultat) { iChatten(resultat.tekst, false); return; }
      if (d.vtFav !== undefined && resultat) {
        const r = resultat;
        const i = gemt.fav.findIndex(function (x) { return x.ind === r.ind && x.til === r.til; });
        if (i >= 0) { gemt.fav.splice(i, 1); lille("☆ Fjernet fra Gemt"); }
        else { gemt.fav.unshift({ ind: r.ind, ud: r.tekst, fra: r.fra, til: r.til, tid: Date.now() }); gemt.fav = gemt.fav.slice(0, 50); lille("⭐ Gemt"); }
        gem(); tegn(); return;
      }
      // 💬 Chat
      if (d.vtChatOversaet !== undefined) {
        const m = chat[Number(d.vtChatOversaet)];
        if (!m || m.arbejder) return;
        m.arbejder = true; m.fejl = ""; tegn();
        oversaet(m.tekst, "auto", gemt.mit).then(function (r) { m.ud = r.tekst; m.fra = r.fra; m.kilde = r.kilde; })
          .catch(function (er) { m.fejl = fejlTekst(er); })
          .finally(function () { m.arbejder = false; tegn(); });
        return;
      }
      if (d.vtSvar !== undefined) {
        const m = chat[Number(d.vtSvar)];
        if (!m) return;
        gemt.fra = gemt.mit; gemt.til = m.fra || gaetSprog(m.tekst);
        if (gemt.til === gemt.fra) gemt.til = gemt.fra === "en" ? "da" : "en";
        gem();
        fane = "oversaet"; input = ""; resultat = null; fejl = "";
        tegn();
        const f = appEl.querySelector("#vt-tekst");
        if (f) { f.placeholder = "Skriv dit svar til " + m.navn + " på " + sprog(gemt.fra).navn.toLowerCase() + " …"; f.focus(); }
        return;
      }
      // 📖 Parlør
      if (d.vtGruppe !== undefined) { parloerGruppe = Number(d.vtGruppe); tegn(); return; }
      const ti = IDS.indexOf(gemt.til);
      if (d.vtPLaes !== undefined) { laesOp(PARLOER[parloerGruppe].s[Number(d.vtPLaes)][ti], gemt.til); return; }
      if (d.vtPSend !== undefined) { iChatten(PARLOER[parloerGruppe].s[Number(d.vtPSend)][ti], true); return; }
      // 🕘 Historik og ⭐ Gemt
      if (d.vtRydHist !== undefined) { gemt.hist = []; gem(); tegn(); lille("🗑 Historikken er ryddet"); return; }
      if (d.vtLLaes) { const p = listePost(d.vtLLaes); if (p) laesOp(p.ud, p.til); return; }
      if (d.vtLSend) { const p = listePost(d.vtLSend); if (p) iChatten(p.ud, true); return; }
      if (d.vtLBrug) {
        const p = listePost(d.vtLBrug);
        if (!p) return;
        gemt.fra = p.fra; gemt.til = p.til; gem();
        input = p.ind; resultat = { tekst: p.ud, kilde: "Historik", fra: p.fra, til: p.til, ind: p.ind };
        fane = "oversaet"; fejl = ""; tegn(); return;
      }
      if (d.vtLSlet !== undefined) { gemt.fav.splice(Number(d.vtLSlet), 1); gem(); tegn(); return; }
    });
  }

  // ---------------------------------------------------------------
  //  Udseende (vinrød + guld som hotellet)
  // ---------------------------------------------------------------
  const stil = document.createElement("style");
  stil.id = "vera-translate-stil";
  stil.textContent = [
    "#telefon .vt-app { background: #faf5ec; color: #2a1a14; padding: 8px 10px 18px; min-height: 100%; box-sizing: border-box; }",
    "#telefon .vt-faner { display: flex; gap: 5px; overflow-x: auto; padding: 1px 1px 8px; scrollbar-width: none; }",
    "#telefon .vt-faner::-webkit-scrollbar { display: none; }",
    "#telefon .vt-faner button, #telefon .vt-grupper button { flex: none; border: 1px solid #e2d3b8; background: #fff; color: #5a3a2a; border-radius: 16px; padding: 5px 10px; font-size: 11.5px; cursor: pointer; }",
    "#telefon .vt-faner button.valgt, #telefon .vt-grupper button.valgt { background: #7a1f2e; border-color: #7a1f2e; color: #f6dfa0; font-weight: 600; }",
    "#telefon .vt-sprogbar { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }",
    "#telefon .vt-app select { flex: 1; min-width: 0; border: 1px solid #e2d3b8; background: #fff; color: #2a1a14; border-radius: 10px; padding: 6px 4px; font: inherit; font-size: 11.5px; cursor: pointer; }",
    "#telefon .vt-byt { flex: none; width: 30px; height: 30px; border-radius: 50%; border: 0; background: #d9a441; color: #4a1018; font-size: 15px; font-weight: 700; cursor: pointer; padding: 0; }",
    "#telefon .vt-byt:hover { transform: rotate(180deg); transition: transform .3s; }",
    "#telefon .vt-kort { background: #fff; border-radius: 14px; padding: 8px 10px; box-shadow: 0 1px 4px rgba(90,40,20,.12); margin-bottom: 8px; }",
    "#telefon .vt-kort textarea { width: 100%; box-sizing: border-box; min-height: 74px; resize: vertical; border: 0; outline: 0; background: transparent; font: inherit; font-size: 14px; color: #2a1a14; padding: 0; }",
    "#telefon .vt-under { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #8a6f5c; }",
    "#telefon .vt-under span:first-child { flex: 1; }",
    "#telefon .vt-under button { width: 20px; height: 20px; border-radius: 50%; border: 0; background: #f0e6d6; color: #5a3a2a; cursor: pointer; font-size: 10px; padding: 0; }",
    "#telefon .vt-hoved { width: 100%; border: 0; border-radius: 14px; padding: 9px; background: linear-gradient(#a3304a, #7a1f2e); color: #fff3d0; font-size: 13px; font-weight: 700; cursor: pointer; margin-bottom: 8px; box-shadow: inset 0 0 0 1.5px #d9a441; }",
    "#telefon .vt-hoved:disabled { opacity: .7; cursor: default; }",
    "#telefon .vt-svar { border-left: 4px solid #d9a441; }",
    "#telefon .vt-svar small { font-size: 10.5px; color: #8a6f5c; }",
    "#telefon .vt-svar p { margin: 4px 0 6px; font-size: 15px; font-weight: 600; color: #4a1018; word-wrap: break-word; }",
    "#telefon .vt-knapper { display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; }",
    "#telefon .vt-knapper button { flex: 1 0 auto; border: 1px solid #e2d3b8; background: #fff; color: #7a1f2e; border-radius: 14px; padding: 5px 7px; font-size: 11px; font-weight: 600; cursor: pointer; }",
    "#telefon .vt-knapper button.hoved { background: #7a1f2e; border-color: #7a1f2e; color: #fff3d0; }",
    "#telefon .vt-knapper button.valgt { background: #fbeec9; }",
    "#telefon .vt-kilde { font-size: 9.5px; color: #9a8270; margin-top: 7px; }",
    "#telefon .vt-fejl { background: #fbe4e4; color: #8a1f2a; border-radius: 10px; padding: 7px 9px; font-size: 11.5px; margin-bottom: 8px; }",
    "#telefon .vt-fejl.lille { font-size: 10.5px; padding: 4px 7px; margin: 4px 0 0; }",
    "#telefon .vt-tip { font-size: 11px; color: #6e5444; background: #fbf1dc; border-radius: 10px; padding: 7px 9px; }",
    "#telefon .vt-tom { font-size: 12px; color: #8a6f5c; text-align: center; padding: 18px 6px; line-height: 1.5; }",
    "#telefon .vt-mitsprog { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6e5444; margin-bottom: 8px; }",
    "#telefon .vt-besked, #telefon .vt-post { background: #fff; border-radius: 12px; padding: 7px 9px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(90,40,20,.08); }",
    "#telefon .vt-besked.mig { background: #fbf1dc; }",
    "#telefon .vt-hvem { display: flex; justify-content: space-between; font-size: 11.5px; }",
    "#telefon .vt-hvem b { color: #7a1f2e; } #telefon .vt-hvem small, #telefon .vt-post > small { font-size: 9.5px; color: #9a8270; }",
    "#telefon .vt-org { font-size: 12.5px; margin-top: 2px; word-wrap: break-word; }",
    "#telefon .vt-ud { font-size: 12.5px; margin-top: 4px; color: #4a1018; font-weight: 600; background: #fdf6e6; border-radius: 8px; padding: 4px 7px; word-wrap: break-word; }",
    "#telefon .vt-ud small { display: block; font-weight: 400; font-size: 9.5px; color: #9a8270; }",
    "#telefon .vt-smaa { display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; }",
    "#telefon .vt-smaa button { border: 1px solid #e2d3b8; background: #fff; color: #7a1f2e; border-radius: 12px; padding: 3px 8px; font-size: 10.5px; cursor: pointer; }",
    "#telefon .vt-smaa button:hover, #telefon .vt-knapper button:hover { background: #fbeec9; }",
    "#telefon .vt-grupper { display: flex; gap: 5px; overflow-x: auto; margin-bottom: 7px; scrollbar-width: none; }",
    "#telefon .vt-saetning { display: flex; align-items: center; gap: 5px; background: #fff; border-radius: 12px; padding: 7px 8px; margin-bottom: 5px; box-shadow: 0 1px 2px rgba(90,40,20,.08); }",
    "#telefon .vt-saetning .vt-tekst { flex: 1; min-width: 0; display: flex; flex-direction: column; }",
    "#telefon .vt-saetning b { font-size: 12.5px; color: #4a1018; } #telefon .vt-saetning small { font-size: 10.5px; color: #8a6f5c; }",
    "#telefon .vt-saetning button { flex: none; width: 28px; height: 28px; border-radius: 50%; border: 1px solid #e2d3b8; background: #fff; cursor: pointer; font-size: 13px; padding: 0; }",
    "#telefon .vt-ryd-alt { border: 0; background: transparent; color: #8a1f2a; font-size: 11px; cursor: pointer; margin: 0 0 6px; padding: 0; }",
  ].join("\n");
  document.head.appendChild(stil);

  // Læg appen i App Butik på telefonen
  vent(function () { return typeof window.tlfTilfoejApp === "function"; }, function () { window.tlfTilfoejApp("translate", APP); });
})();
