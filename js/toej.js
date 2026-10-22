// =============================================================
//  TØJET — alle tingene fra dine tøj-ark.
//  Billederne ligger i billeder/toej/pige og billeder/toej/dreng.
//  Vil du fjerne en ting, så slet dens navn fra listen herunder.
//  Vil du tilføje en ting, så læg billedet i mappen og skriv navnet her.
// =============================================================

const TOEJ_NAVNE = {
  "frisure": "Frisure",
  "hat": "Hat",
  "haarpynt": "Hårpynt",
  "briller": "Briller",
  "top": "Top",
  "kjole": "Kjole",
  "jakke": "Jakke",
  "underdel": "Bukser og nederdele",
  "stroemper": "Strømper",
  "sko": "Sko",
  "taske": "Taske",
  "smykke": "Smykker",
  "tilbehoer": "Tilbehør",
  "ekstra": "Ekstra"
};

const TOEJ = {
  pige: {
    frisure: [
      "frisure-01.png", "frisure-02.png", "frisure-03.png", "frisure-04.png", "frisure-05.png", "frisure-06.png",
      "frisure-07.png", "frisure-08.png", "frisure-09.png", "frisure-10.png", "frisure-11.png", "frisure-12.png",
      "frisure-13.png", "frisure-14.png", "frisure-15.png", "frisure-16.png", "frisure-17.png", "frisure-18.png",
      "frisure-19.png", "frisure-20.png", "frisure-21.png", "frisure-22.png",
    ],
    hat: [
      "hat-01.png", "hat-02.png", "hat-03.png", "hat-04.png", "hat-05.png", "hat-06.png",
      "hat-07.png", "hat-08.png", "hat-09.png", "hat-10.png",
    ],
    haarpynt: [
      "haarpynt-01.png", "haarpynt-02.png", "haarpynt-03.png", "haarpynt-04.png", "haarpynt-05.png", "haarpynt-06.png",
      "haarpynt-07.png", "haarpynt-08.png", "haarpynt-09.png", "haarpynt-10.png", "haarpynt-11.png", "haarpynt-12.png",
      "haarpynt-13.png", "haarpynt-14.png",
    ],
    briller: [
      "briller-01.png", "briller-02.png", "briller-03.png", "briller-04.png", "briller-05.png", "briller-06.png",
    ],
    top: [
      "top-01.png", "top-02.png", "top-03.png", "top-04.png", "top-05.png", "top-06.png",
      "top-07.png", "top-08.png", "top-09.png", "top-10.png", "top-11.png", "top-12.png",
      "top-13.png", "top-14.png", "top-15.png", "top-16.png", "top-17.png", "top-18.png",
      "top-19.png", "top-20.png", "top-21.png", "top-22.png", "top-23.png", "top-24.png",
      "top-25.png", "top-26.png", "top-27.png", "top-28.png", "top-29.png", "top-30.png",
      "top-31.png", "top-32.png", "top-33.png", "top-34.png", "top-35.png",
    ],
    kjole: [
      "kjole-01.png", "kjole-02.png", "kjole-03.png", "kjole-04.png", "kjole-05.png", "kjole-06.png",
      "kjole-07.png", "kjole-08.png", "kjole-09.png", "kjole-10.png", "kjole-11.png", "kjole-12.png",
      "kjole-13.png", "kjole-14.png", "kjole-15.png", "kjole-16.png", "kjole-17.png",
    ],
    jakke: [
      "jakke-01.png", "jakke-02.png", "jakke-03.png", "jakke-04.png", "jakke-05.png", "jakke-06.png",
      "jakke-07.png", "jakke-08.png", "jakke-09.png", "jakke-10.png", "jakke-11.png", "jakke-12.png",
      "jakke-13.png", "jakke-14.png", "jakke-15.png", "jakke-16.png",
    ],
    underdel: [
      "underdel-01.png", "underdel-02.png", "underdel-03.png", "underdel-04.png", "underdel-05.png", "underdel-06.png",
      "underdel-07.png", "underdel-08.png", "underdel-09.png", "underdel-10.png", "underdel-11.png", "underdel-12.png",
      "underdel-13.png", "underdel-14.png", "underdel-15.png", "underdel-16.png", "underdel-17.png", "underdel-18.png",
      "underdel-19.png", "underdel-20.png", "underdel-21.png", "underdel-22.png", "underdel-23.png", "underdel-24.png",
      "underdel-25.png", "underdel-26.png", "underdel-27.png", "underdel-28.png", "underdel-29.png", "underdel-30.png",
      "underdel-31.png", "underdel-32.png",
    ],
    stroemper: [
      "stroemper-01.png", "stroemper-02.png", "stroemper-03.png", "stroemper-04.png", "stroemper-05.png", "stroemper-06.png",
      "stroemper-07.png", "stroemper-08.png", "stroemper-09.png", "stroemper-10.png",
    ],
    sko: [
      "sko-01.png", "sko-02.png", "sko-03.png", "sko-04.png", "sko-05.png", "sko-06.png",
      "sko-07.png", "sko-08.png", "sko-09.png", "sko-10.png", "sko-11.png", "sko-12.png",
      "sko-13.png", "sko-14.png", "sko-15.png", "sko-16.png", "sko-17.png",
    ],
    taske: [
      "taske-01.png", "taske-02.png", "taske-03.png", "taske-04.png", "taske-05.png", "taske-06.png",
      "taske-07.png", "taske-08.png", "taske-09.png", "taske-10.png",
    ],
    smykke: [
      "smykke-01.png", "smykke-02.png", "smykke-03.png", "smykke-04.png", "smykke-05.png", "smykke-06.png",
      "smykke-07.png", "smykke-08.png", "smykke-09.png", "smykke-10.png", "smykke-11.png", "smykke-12.png",
      "smykke-13.png", "smykke-14.png", "smykke-15.png", "smykke-16.png", "smykke-17.png", "smykke-18.png",
      "smykke-19.png", "smykke-20.png", "smykke-21.png", "smykke-22.png", "smykke-23.png", "smykke-24.png",
    ],
    ekstra: [
      "ekstra-01.png", "ekstra-02.png", "ekstra-03.png", "ekstra-04.png", "ekstra-05.png", "ekstra-06.png",
      "ekstra-07.png", "ekstra-08.png", "ekstra-09.png", "ekstra-10.png", "ekstra-11.png", "ekstra-12.png",
      "ekstra-13.png", "ekstra-14.png", "ekstra-15.png",
    ],
  },
  dreng: {
    frisure: [
      "frisure-01.png", "frisure-02.png", "frisure-03.png", "frisure-04.png", "frisure-05.png", "frisure-06.png",
      "frisure-07.png", "frisure-08.png", "frisure-09.png", "frisure-10.png", "frisure-11.png", "frisure-12.png",
      "frisure-13.png", "frisure-14.png", "frisure-15.png", "frisure-16.png", "frisure-17.png", "frisure-18.png",
      "frisure-19.png", "frisure-20.png", "frisure-21.png", "frisure-22.png", "frisure-23.png", "frisure-24.png",
      "frisure-25.png", "frisure-26.png",
    ],
    hat: [
      "hat-01.png", "hat-02.png", "hat-03.png", "hat-04.png", "hat-05.png", "hat-06.png",
      "hat-07.png",
    ],
    top: [
      "top-01.png", "top-02.png", "top-03.png", "top-04.png", "top-05.png", "top-06.png",
      "top-07.png", "top-08.png", "top-09.png", "top-10.png", "top-11.png", "top-12.png",
      "top-13.png", "top-14.png", "top-15.png", "top-16.png", "top-17.png", "top-18.png",
      "top-19.png", "top-20.png", "top-21.png", "top-22.png", "top-23.png",
    ],
    jakke: [
      "jakke-01.png", "jakke-02.png", "jakke-03.png", "jakke-04.png", "jakke-05.png", "jakke-06.png",
      "jakke-07.png", "jakke-08.png", "jakke-09.png", "jakke-10.png", "jakke-11.png", "jakke-12.png",
      "jakke-13.png", "jakke-14.png", "jakke-15.png", "jakke-16.png",
    ],
    underdel: [
      "underdel-01.png", "underdel-02.png", "underdel-03.png", "underdel-04.png", "underdel-05.png", "underdel-06.png",
      "underdel-07.png", "underdel-08.png", "underdel-09.png", "underdel-10.png", "underdel-11.png", "underdel-12.png",
      "underdel-13.png", "underdel-14.png", "underdel-15.png", "underdel-16.png", "underdel-17.png", "underdel-18.png",
      "underdel-19.png", "underdel-20.png", "underdel-21.png", "underdel-22.png", "underdel-23.png",
    ],
    sko: [
      "sko-01.png", "sko-02.png", "sko-03.png", "sko-04.png", "sko-05.png", "sko-06.png",
    ],
    taske: [
      "taske-01.png", "taske-02.png", "taske-03.png", "taske-04.png", "taske-05.png", "taske-06.png",
      "taske-07.png",
    ],
    tilbehoer: [
      "tilbehoer-01.png", "tilbehoer-02.png", "tilbehoer-03.png", "tilbehoer-04.png", "tilbehoer-05.png", "tilbehoer-06.png",
      "tilbehoer-07.png", "tilbehoer-08.png", "tilbehoer-09.png", "tilbehoer-10.png", "tilbehoer-11.png", "tilbehoer-12.png",
      "tilbehoer-13.png", "tilbehoer-14.png", "tilbehoer-15.png", "tilbehoer-16.png", "tilbehoer-17.png", "tilbehoer-18.png",
    ],
    ekstra: [
      "ekstra-01.png", "ekstra-02.png", "ekstra-03.png", "ekstra-04.png", "ekstra-05.png", "ekstra-06.png",
      "ekstra-07.png", "ekstra-08.png", "ekstra-09.png", "ekstra-10.png", "ekstra-11.png",
    ],
  },
};
