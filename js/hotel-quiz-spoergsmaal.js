// =============================================================
//  ❓ Hotel-quiz — spørgsmålene, der kommer op på hele hotellet
//
//  Hver linje er:  ["Spørgsmål", "Svar", "Andet rigtigt svar", ...]
//  Det første svar er det, der bliver vist, når spørgsmålet er slut.
//  Store/små bogstaver, mellemrum, ! ? . og "en/et/den/det" foran betyder ikke noget,
//  så "Paris", "paris" og "PARIS!" er alle rigtige.
//
//  Vil du have flere spørgsmål? Tilføj bare en linje (husk komma til sidst).
//  Når du (ejeren) går ind på hotellet, bliver listen sendt til serveren af sig selv.
//
//  Regnestykker (fx 37 + 48) laver serveren også selv, så der kommer altid nye.
//  Hentes af js/hotel-quiz.js.
// =============================================================
window.HOTEL_QUIZ = [
  // 🏨 Hotellet
  ["Hvad hedder hotellet?", "HELLO VERA", "Vera", "Hello Vera hotel"],
  ["Hvad hedder hotellets valuta med en stjerne ⭐?", "Glimt"],
  ["Hvad hedder hotellets lilla valuta 🔮?", "Stella"],
  ["Hvor mange Glimt koster 1 Stella i Vekselbørsen?", "4", "fire"],
  ["Hvad hedder hotellets radio?", "Vera-radio", "Vera radio", "veraradio"],
  ["Hvad hedder appen, hvor man køber biografbilletter?", "Vera-cinema", "Vera cinema", "veracinema"],
  ["Hvad hedder oversætter-appen på telefonen?", "Vera-translate", "Vera translate", "veratranslate"],
  ["Hvad skriver man i chatten for at svare på hotel-quizzen?", ":S", "S"],
  ["Hvad tager man for at komme mellem etagerne på hotellet?", "Elevatoren", "Elevator"],
  ["Hvilke to farver er HELLO VERA's farver? (skriv dem med 'og' imellem)", "Vinrød og guld", "guld og vinrød", "rød og guld", "guld og rød"],

  // 🌍 Verden
  ["Hvad er hovedstaden i Danmark?", "København", "Kobenhavn", "Copenhagen"],
  ["Hvad er hovedstaden i Frankrig?", "Paris"],
  ["Hvad er hovedstaden i Norge?", "Oslo"],
  ["Hvad er hovedstaden i Sverige?", "Stockholm"],
  ["Hvad er hovedstaden i England?", "London"],
  ["Hvad er hovedstaden i Tyskland?", "Berlin"],
  ["Hvad er hovedstaden i Italien?", "Rom", "Roma", "Rome"],
  ["Hvad er hovedstaden i Spanien?", "Madrid"],
  ["Hvilket land kommer pizza fra?", "Italien"],
  ["Hvad hedder det største hav på Jorden?", "Stillehavet", "Stille Hav", "Stillehav"],
  ["Hvad hedder verdens højeste bjerg?", "Mount Everest", "Everest"],
  ["Hvilket land har form som en støvle?", "Italien"],
  ["I hvilket land ligger pyramiderne i Giza?", "Egypten"],
  ["Hvor mange verdensdele er der?", "7", "syv"],
  ["Hvilket land har flest indbyggere i Nordamerika?", "USA", "Amerika", "De forenede stater"],
  ["Hvad hedder den lange mur i Kina?", "Den kinesiske mur", "Kinesiske mur", "Muren"],
  ["Hvilken by er Eiffeltårnet i?", "Paris"],
  ["Hvor mange øer er der cirka i Danmark? (100, 400 eller 4000)", "400", "443"],
  ["Hvad hedder Danmarks største ø?", "Sjælland", "Sjaelland"],

  // 🐾 Dyr
  ["Hvor mange ben har en edderkop?", "8", "otte"],
  ["Hvor mange ben har et insekt?", "6", "seks"],
  ["Hvad er verdens største dyr?", "Blåhval", "Blåhvalen", "Blaahval"],
  ["Hvilket dyr kaldes junglens konge?", "Løve", "Løven"],
  ["Hvilken fugl kan ikke flyve, men svømmer og bor på Sydpolen?", "Pingvin", "Pingvinen"],
  ["Hvad kalder man en baby-hund?", "Hvalp", "Hvalpen"],
  ["Hvad kalder man en baby-kat?", "Killing", "Killingen"],
  ["Hvilket dyr har den længste hals?", "Giraf", "Giraffen"],
  ["Hvilket dyr siger 'muh'?", "Ko", "Koen"],
  ["Hvilket dyr har en snabel?", "Elefant", "Elefanten"],
  ["Hvad spiser en panda mest?", "Bambus"],
  ["Hvilket hurtigt kattedyr er verdens hurtigste landdyr?", "Gepard", "Geparden"],

  // 🔬 Natur og rummet
  ["Hvad hedder den største planet i vores solsystem?", "Jupiter"],
  ["Hvilken planet kaldes den røde planet?", "Mars"],
  ["Hvad hedder den stjerne, som Jorden kredser om?", "Solen", "Sol"],
  ["Hvilken planet er tættest på Solen?", "Merkur", "Mercury"],
  ["Hvor mange farver er der i en regnbue?", "7", "syv"],
  ["Hvilken farve får man, når man blander blå og gul?", "Grøn"],
  ["Hvilken farve får man, når man blander rød og hvid?", "Lyserød", "Pink", "Rosa"],
  ["Hvilken farve får man, når man blander rød og blå?", "Lilla", "Violet"],
  ["Ved hvor mange grader fryser vand til is?", "0", "nul"],
  ["Ved hvor mange grader koger vand?", "100", "hundrede"],
  ["Hvilken årstid kommer efter vinter?", "Forår"],
  ["Hvad hedder det hvide, kolde, der falder fra himlen om vinteren?", "Sne"],

  // 📅 Tid og tal
  ["Hvor mange dage er der i et skudår?", "366"],
  ["Hvor mange dage er der i en uge?", "7", "syv"],
  ["Hvor mange minutter er der i en time?", "60", "tres"],
  ["Hvor mange sekunder er der i et minut?", "60", "tres"],
  ["Hvor mange timer er der i et døgn?", "24"],
  ["Hvor mange måneder er der i et år?", "12", "tolv"],
  ["Hvilken måned har færrest dage?", "Februar"],
  ["Hvad hedder dagen efter fredag?", "Lørdag"],
  ["Hvad er halvdelen af 100?", "50", "halvtreds"],
  ["Hvad er 10 × 10?", "100", "hundrede"],
  ["Hvad er 7 × 8?", "56"],
  ["Hvad er 9 × 9?", "81"],
  ["Hvad er 144 : 12?", "12", "tolv"],
  ["Hvad er 25 + 25 + 25?", "75"],
  ["Hvad er 1000 − 1?", "999"],
  ["Hvor mange sider har en trekant?", "3", "tre"],
  ["Hvor mange hjørner har en firkant?", "4", "fire"],

  // 🎬 Eventyr, film og musik
  ["Hvad hedder H.C. Andersens eventyr om en grim fugleunge?", "Den grimme ælling", "Grimme ælling"],
  ["Hvilken forfatter skrev Den lille havfrue?", "H.C. Andersen", "HC Andersen", "Andersen", "Hans Christian Andersen"],
  ["Hvilken farve har Shrek?", "Grøn"],
  ["Hvad hedder snemanden i Frost?", "Olaf"],
  ["Hvad hedder Mickey Mouses hund?", "Pluto"],
  ["Hvad hedder Peter Pans lille fe-veninde?", "Klokkeblomst", "Tinkerbell"],
  ["Hvor mange strenge har en almindelig guitar?", "6", "seks"],
  ["Hvor mange dværge er der i Snehvide?", "7", "syv"],
  ["Hvilket dyr er Simba i Løvernes Konge?", "Løve", "En løve"],

  // ⚽ Sport og hverdag
  ["Hvor mange spillere har et fodboldhold på banen?", "11", "elleve"],
  ["Hvor mange ringe er der i OL-logoet?", "5", "fem"],
  ["Hvilken frugt er gul og bøjet?", "Banan", "Bananen"],
  ["Hvad bruger man til at måle temperatur?", "Termometer", "Et termometer"],
  ["Hvilket køretøj kører på skinner?", "Tog", "Toget", "Letbane", "Sporvogn"],
  ["Hvor mange sider har en terning?", "6", "seks"],
  ["Hvor mange øjne er der i alt på en almindelig terning? (1+2+3+4+5+6)", "21"],
  ["Hvad hedder Danmarks flag?", "Dannebrog"],
  ["Hvilke to farver har Dannebrog?", "Rød og hvid", "hvid og rød"],
  ["Hvad laver man popcorn af?", "Majs", "Majskorn"],
];
