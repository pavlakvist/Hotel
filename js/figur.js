// =============================================================
//  FIGURERNE — tegnet med bløde former (ikke pixels)
// =============================================================
//
//  Figuren bliver tegnet med cirkler, ovaler og bløde kurver, ligesom
//  en tegneserie-tegning. Alle mål er i pixels, og (0, 0) er midt
//  mellem fødderne. Minus-tal på y betyder opad, så hovedet sidder ved
//  ca. y = -89 og fødderne ved y = 0.
//
//  Her i filen finder du:
//    FRISURER   — knold, langt hår, kort og undercut
//    TOEJ       — hotel-uniform og hættetrøje
//    tegnMenneske() — tegner hele figuren og får den til at bevæge sig
//
//  Vil du lave en ny frisure eller nyt tøj, så kopiér en af dem,
//  giv den et nyt navn, og ret i tallene.

const FASTE_FARVER = {
  oejne: "#6b3f22",
  pupil: "#2a1710",
  mund: "#b5473f",
  kinder: "rgba(240, 120, 120, 0.35)",
  guld: "#f0c14b",
  skjorte: "#f7f3ea",
  stroemper: "#4b3228",
  saal: "#d9d9e0",
};


// =============================================================
//  Tegne-værktøjer
// =============================================================

// Gør en farve lysere (tal over 1) eller mørkere (tal under 1)
function skygge(hex, faktor) {
  const n = parseInt(hex.slice(1), 16);
  const t = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
    return Math.min(255, Math.round(v * faktor));
  });
  return "rgb(" + t.join(",") + ")";
}

// En farve, der er lidt lysere til venstre og mørkere til højre (som lys fra siden)
function glans(c, hex, x0, x1) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, skygge(hex, 1.18));
  g.addColorStop(0.45, hex);
  g.addColorStop(1, skygge(hex, 0.78));
  return g;
}

// Udfyld en form og tegn en tynd, mørk kant rundt om
function form(c, sti, fyld, kantFarve) {
  c.beginPath();
  sti();
  c.fillStyle = fyld;
  c.fill();
  if (kantFarve) {
    c.lineWidth = 1.2;
    c.lineJoin = "round";
    c.strokeStyle = kantFarve;
    c.stroke();
  }
}

function oval(c, x, y, rx, ry, fyld, kantFarve) {
  form(c, function () { c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }, fyld, kantFarve);
}

// Et rundt "lem" (arm eller ben) fra et punkt til et andet
function lem(c, x1, y1, x2, y2, bredde, farve) {
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.strokeStyle = skygge(farve, 0.5);
  c.lineWidth = bredde + 2.4;
  c.stroke();
  c.strokeStyle = farve;
  c.lineWidth = bredde;
  c.stroke();
}

function linje(c, punkter, farve, bredde) {
  c.beginPath();
  c.moveTo(punkter[0][0], punkter[0][1]);
  for (let i = 1; i < punkter.length; i++) c.lineTo(punkter[i][0], punkter[i][1]);
  c.strokeStyle = farve;
  c.lineWidth = bredde;
  c.lineCap = "round";
  c.stroke();
}

// Lys glans i håret
function haarGlans(c, valg, x, y, r) {
  c.beginPath();
  c.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.55);
  c.strokeStyle = skygge(valg.haar, 1.45);
  c.lineWidth = 1.4;
  c.lineCap = "round";
  c.stroke();
}


// =============================================================
//  KROPPENS MÅL
// =============================================================
const KROP = {
  kvinde: { skulder: 11, talje: 7.5, hofte: 10, arm: 5.2, laar: 6.8, skinneben: 5.6 },
  mand:   { skulder: 13, talje: 10,  hofte: 10, arm: 6.2, laar: 7.6, skinneben: 6.4 },
};

const HOFTE_Y = -46;
const SKULDER_Y = -72;
const HOVED_Y = -89;

function kropSti(c, k) {
  c.moveTo(-k.skulder, -70);
  c.quadraticCurveTo(-k.skulder, -75, -k.skulder + 4, -75.5);
  c.lineTo(k.skulder - 4, -75.5);
  c.quadraticCurveTo(k.skulder, -75, k.skulder, -70);
  c.quadraticCurveTo(k.talje + 1, -60, k.talje, -54);
  c.lineTo(k.hofte, -44);
  c.lineTo(-k.hofte, -44);
  c.lineTo(-k.talje, -54);
  c.quadraticCurveTo(-k.talje - 1, -60, -k.skulder, -70);
  c.closePath();
}


// =============================================================
//  FRISURER
//    bag:      hår bag hovedet (forfra) — eller hele håret (bagfra)
//    foran:    pandehår, tegnes oven på ansigtet
//    overKrop: (kun nogle) hår, der hænger ned foran kroppen
// =============================================================
const FRISURER = {
  knold: {
    navn: "Knold",
    figur: "kvinde",
    bag: function (c, v, forfra) {
      const H = v.haar, kant = skygge(H, 0.5);
      oval(c, 0, -90, 10, 10.8, glans(c, H, -10, 10), kant);
      oval(c, 0.5, -103, 5.4, 4.6, glans(c, H, -5, 6), kant);           // knolden
      form(c, function () { c.roundRect(-3.6, -99.4, 7.4, 1.8, 0.9); }, FASTE_FARVER.guld, skygge("#f0c14b", 0.6));
      [[-9, -84, 3.2], [-8.6, -79.4, 2.8], [9, -84, 3.2], [8.6, -79.4, 2.8]].forEach(function (k) {
        oval(c, k[0], k[1], k[2], k[2], H, kant);                      // krøller
      });
      haarGlans(c, v, -1, -103, 3.5);
      if (!forfra) haarGlans(c, v, -2, -92, 6);
    },
    foran: function (c, v) {
      form(c, function () {
        c.moveTo(-9.2, -86);
        c.quadraticCurveTo(-10, -100, 0.5, -99.8);
        c.quadraticCurveTo(10, -99.5, 9, -89);
        c.quadraticCurveTo(4, -94.5, -2, -93);
        c.quadraticCurveTo(-6, -91.5, -9.2, -86);
      }, glans(c, v.haar, -9, 9), skygge(v.haar, 0.5));
      haarGlans(c, v, -1, -91, 6);
    },
  },

  langt: {
    navn: "Langt hår",
    figur: "kvinde",
    bag: function (c, v, forfra) {
      form(c, function () {
        c.moveTo(-10, -90);
        c.quadraticCurveTo(-11, -101, 0, -101);
        c.quadraticCurveTo(11, -101, 10, -90);
        c.quadraticCurveTo(12, -75, 11, -62);
        c.quadraticCurveTo(0, -59, -11, -62);
        c.quadraticCurveTo(-12, -75, -10, -90);
      }, glans(c, v.haar, -11, 11), skygge(v.haar, 0.5));
      if (!forfra) {
        haarGlans(c, v, -2, -92, 6);
        linje(c, [[-4, -88], [-4.5, -64]], skygge(v.haar, 0.8), 0.8);
        linje(c, [[3, -88], [3.5, -64]], skygge(v.haar, 0.8), 0.8);
      }
    },
    foran: function (c, v) {
      // midterskilning med "gardin-pandehår"
      form(c, function () {
        c.moveTo(-9, -84);
        c.quadraticCurveTo(-10, -99.5, 0, -99.5);
        c.quadraticCurveTo(10, -99.5, 9, -84);
        c.quadraticCurveTo(8, -93, 0.3, -95);
        c.quadraticCurveTo(-8, -93, -9, -84);
      }, glans(c, v.haar, -9, 9), skygge(v.haar, 0.5));
      haarGlans(c, v, -3, -94, 4);
    },
    overKrop: function (c, v) {
      [-1, 1].forEach(function (side) {
        form(c, function () {
          c.moveTo(side * 10, -86);
          c.quadraticCurveTo(side * 11.8, -74, side * 9.5, -63);
          c.quadraticCurveTo(side * 7.5, -63.5, side * 6.8, -66);
          c.quadraticCurveTo(side * 7.8, -76, side * 6.8, -84);
          c.closePath();
        }, side < 0 ? skygge(v.haar, 1.08) : skygge(v.haar, 0.85), skygge(v.haar, 0.5));
      });
    },
  },

  kort: {
    navn: "Kort",
    figur: "mand",
    bag: function (c, v, forfra) {
      oval(c, 0, forfra ? -91.5 : -90.8, 9.6, forfra ? 9.4 : 9.6, glans(c, v.haar, -10, 10), skygge(v.haar, 0.5));
      if (!forfra) haarGlans(c, v, -2, -93, 6);
    },
    foran: function (c, v) {
      form(c, function () {
        c.moveTo(-9, -87);
        c.quadraticCurveTo(-10, -100, 0, -100.5);
        c.quadraticCurveTo(10, -100, 9, -87);
        c.quadraticCurveTo(8, -94, 3, -95.5);
        c.quadraticCurveTo(-1, -97, -4, -94);
        c.quadraticCurveTo(-7, -92, -9, -87);
      }, glans(c, v.haar, -9, 9), skygge(v.haar, 0.5));
      haarGlans(c, v, -2, -95, 5);
    },
  },

  undercut: {
    navn: "Undercut",
    figur: "mand",
    bag: function (c, v, forfra) {
      oval(c, 0, -89.8, 9.1, 9.7, skygge(v.haar, 0.7), skygge(v.haar, 0.45));   // kortklippede sider
      if (!forfra) FRISURER.undercut.top(c, v);
    },
    foran: function (c, v) {
      FRISURER.undercut.top(c, v);
    },
    top: function (c, v) {
      form(c, function () {
        c.moveTo(-9.2, -91);
        c.quadraticCurveTo(-9.5, -104, 1, -103.5);
        c.quadraticCurveTo(10.5, -103, 9.3, -92);
        c.quadraticCurveTo(4, -96.5, -1, -96);
        c.quadraticCurveTo(-6, -95.5, -9.2, -91);
      }, glans(c, v.haar, -9, 10), skygge(v.haar, 0.5));
      haarGlans(c, v, -1, -97, 5);
    },
  },
};


// =============================================================
//  TØJ
//    ben:      farve og sko til benene
//    overdel:  tegner trøjen/vesten på kroppen
//    aerme:    farven på ærmerne
// =============================================================
const TOEJ = {
  hotel: {
    navn: "Hotel-uniform",
    farver: { troeje: "#8b1e2b", bukser: "#2f2f35", sko: "#1e1e22" },
    benFarve: function (v) { return v.type === "kvinde" ? FASTE_FARVER.stroemper : v.bukser; },
    sneakers: false,
    aerme: function (v) { return FASTE_FARVER.skjorte; },
    underdel: function (c, v, k) {
      if (v.type === "kvinde") {
        form(c, function () {                                   // nederdel
          c.moveTo(-k.talje - 0.5, -53);
          c.lineTo(k.talje + 0.5, -53);
          c.quadraticCurveTo(k.hofte + 1.5, -40, k.hofte + 2, -29);
          c.quadraticCurveTo(0, -27.5, -k.hofte - 2, -29);
          c.quadraticCurveTo(-k.hofte - 1.5, -40, -k.talje - 0.5, -53);
        }, glans(c, v.bukser, -12, 12), skygge(v.bukser, 0.5));
      } else {
        form(c, function () { c.rect(-k.hofte, -48, k.hofte * 2, 3); }, skygge(v.sko, 1.6), skygge(v.sko, 0.5)); // bælte
        oval(c, 0, -46.5, 1.4, 1.2, FASTE_FARVER.guld);
      }
    },
    overdel: function (c, v, k, forfra) {
      const kant = skygge(v.troeje, 0.5);
      form(c, function () { kropSti(c, k); }, glans(c, FASTE_FARVER.skjorte, -k.skulder, k.skulder), "#a99f8e");
      // vesten
      form(c, function () {
        c.moveTo(-k.skulder + 2.5, -74.5);
        c.lineTo(-3, -74.5);
        if (forfra) c.lineTo(0, -63);
        c.lineTo(3, -74.5);
        c.lineTo(k.skulder - 2.5, -74.5);
        c.quadraticCurveTo(k.skulder - 0.5, -66, k.talje, -54);
        c.lineTo(k.talje + 0.5, -49);
        c.lineTo(forfra ? 0 : k.talje, forfra ? -45.5 : -48);
        c.lineTo(-k.talje - 0.5, -49);
        c.lineTo(-k.talje, -54);
        c.quadraticCurveTo(-k.skulder + 0.5, -66, -k.skulder + 2.5, -74.5);
      }, glans(c, v.troeje, -k.skulder, k.skulder), kant);
      if (forfra) {
        // krave, knapper og navneskilt
        form(c, function () { c.moveTo(-3.5, -76); c.lineTo(0, -72); c.lineTo(-1, -76); }, "#ffffff", "#a99f8e");
        form(c, function () { c.moveTo(3.5, -76); c.lineTo(0, -72); c.lineTo(1, -76); }, "#ffffff", "#a99f8e");
        [-60, -56, -52].forEach(function (y) { oval(c, 0, y, 0.9, 0.9, FASTE_FARVER.guld, skygge("#f0c14b", 0.6)); });
        form(c, function () { c.roundRect(3.2, -69, 4.5, 1.6, 0.5); }, FASTE_FARVER.guld, skygge("#f0c14b", 0.6));
      } else {
        linje(c, [[0, -74], [0, -49]], kant, 0.8);
        form(c, function () { c.roundRect(-4, -55, 8, 1.6, 0.6); }, skygge(v.troeje, 0.8), kant);   // spænde bag på
      }
    },
  },

  moderne: {
    navn: "Hættetrøje",
    farver: { troeje: "#7d6bd6", bukser: "#3f6fb5", sko: "#f4f4f4" },
    benFarve: function (v) { return v.bukser; },
    sneakers: true,
    aerme: function (v) { return v.troeje; },
    underdel: function (c, v, k) {},
    overdel: function (c, v, k, forfra) {
      const kant = skygge(v.troeje, 0.5);
      if (forfra) oval(c, 0, -75.5, 7, 3, skygge(v.troeje, 0.8), kant);   // hætten om halsen
      form(c, function () { kropSti(c, k); }, glans(c, v.troeje, -k.skulder, k.skulder), kant);
      form(c, function () { c.roundRect(-k.hofte, -47.5, k.hofte * 2, 3.5, 1.5); }, skygge(v.troeje, 0.85), kant);  // ribkant
      if (forfra) {
        linje(c, [[-2, -74], [-2.4, -66]], "#ffffff", 0.9);                // snore
        linje(c, [[2, -74], [2.3, -67]], "#ffffff", 0.9);
        form(c, function () {                                               // lomme
          c.moveTo(-6, -55);
          c.lineTo(6, -55);
          c.lineTo(7.5, -48);
          c.lineTo(-7.5, -48);
          c.closePath();
        }, skygge(v.troeje, 0.92), kant);
      } else {
        form(c, function () {                                               // hætten på ryggen
          c.moveTo(-7, -75);
          c.quadraticCurveTo(0, -77, 7, -75);
          c.quadraticCurveTo(7.5, -66, 0, -63.5);
          c.quadraticCurveTo(-7.5, -66, -7, -75);
        }, glans(c, v.troeje, -7, 7), kant);
        linje(c, [[0, -74.5], [0, -65]], kant, 0.7);
      }
    },
  },
};


// =============================================================
//  BEN, ARME, HOVED
// =============================================================
// sving: fra -1 (benet er bagud) til 1 (benet er fremme)
function tegnEtBen(c, v, toej, k, side, sving) {
  const hx = side * 4.6;
  const vinkel = sving * 0.07;
  const loeft = Math.max(0, sving) * 5;          // benet, der går frem, løftes i knæet
  const knae = [hx + Math.sin(vinkel) * 21 + loeft * 0.15, HOFTE_Y + 21 - loeft * 0.4];
  const ankel = [knae[0] + Math.sin(vinkel) * 19 - loeft * 0.15, knae[1] + 19 - loeft * 0.6];
  const farve = toej.benFarve(v);
  lem(c, hx, HOFTE_Y, knae[0], knae[1], k.laar, farve);
  lem(c, knae[0], knae[1], ankel[0], ankel[1], k.skinneben, farve);
  // sko
  const sx = ankel[0] + 1.8, sy = ankel[1] + 2.6;
  if (toej.sneakers) {
    oval(c, sx, sy, 4.9, 3, v.sko, skygge(v.sko, 0.55));
    form(c, function () { c.roundRect(sx - 5, sy + 1, 10, 1.8, 0.9); }, FASTE_FARVER.saal, "#9a9aa3");
    linje(c, [[sx - 1.5, sy - 0.8], [sx + 2.5, sy + 0.2]], v.troeje, 1);   // farvet streg
  } else {
    oval(c, sx, sy, 4.6, 2.8, glans(c, v.sko, sx - 5, sx + 5), skygge(v.sko, 0.5));
    oval(c, sx - 1.5, sy - 1, 1.3, 0.6, "rgba(255,255,255,0.35)");
  }
}

// sving: fra -1 (armen er bagud) til 1 (armen er fremme)
function tegnEnArm(c, v, toej, k, side, sving) {
  const sx = side * (k.skulder - 2);
  const sy = SKULDER_Y + 0.5;
  const vinkel = side * 0.08 + sving * 0.18;
  const albue = [sx + Math.sin(vinkel) * 12.5, sy + Math.cos(vinkel) * 12.5];
  const underarm = vinkel + 0.15 + Math.max(0, sving) * 0.45;   // armen bøjer, når den svinger frem
  const haand = [albue[0] + Math.sin(underarm) * 11, albue[1] + Math.cos(underarm) * 11];
  const farve = toej.aerme(v);
  lem(c, sx, sy, albue[0], albue[1], k.arm, farve);
  lem(c, albue[0], albue[1], haand[0], haand[1], k.arm - 0.6, farve);
  oval(c, haand[0], haand[1] + 1, 2.6, 2.8, v.hud, skygge(v.hud, 0.6));
}

function tegnAnsigt(c, v, blink) {
  const kvinde = v.type === "kvinde";
  const fx = 1.2;   // ansigtet er drejet en lille smule mod højre
  const y = HOVED_Y + 1;
  [-3.4, 3.4].forEach(function (ox) {
    const x = fx + ox;
    if (blink) {
      c.beginPath();
      c.arc(x, y - 0.5, 2, Math.PI * 0.15, Math.PI * 0.85);
      c.strokeStyle = FASTE_FARVER.pupil;
      c.lineWidth = 1;
      c.stroke();
      return;
    }
    oval(c, x, y, 2.1, 2.5, "#ffffff", skygge(v.hud, 0.55));
    oval(c, x + 0.3, y + 0.2, 1.5, 1.9, FASTE_FARVER.oejne);
    oval(c, x + 0.3, y + 0.3, 0.85, 1.05, FASTE_FARVER.pupil);
    oval(c, x - 0.3, y - 0.6, 0.55, 0.55, "#ffffff");
    if (kvinde) linje(c, [[x + Math.sign(ox) * 1.6, y - 1.8], [x + Math.sign(ox) * 2.8, y - 2.8]], FASTE_FARVER.pupil, 0.8);
  });
  // øjenbryn
  [-3.4, 3.4].forEach(function (ox) {
    c.beginPath();
    c.arc(fx + ox, HOVED_Y + 0.8, 3, Math.PI * 1.3, Math.PI * 1.7);
    c.strokeStyle = skygge(v.haar, 0.75);
    c.lineWidth = kvinde ? 0.8 : 1.2;
    c.stroke();
  });
  // næse, kinder og mund
  c.beginPath();
  c.arc(fx + 0.6, HOVED_Y + 4.3, 1, Math.PI * 0.1, Math.PI * 0.9);
  c.strokeStyle = skygge(v.hud, 0.7);
  c.lineWidth = 0.8;
  c.stroke();
  oval(c, fx - 5.4, HOVED_Y + 4.8, 1.8, 1.1, FASTE_FARVER.kinder);
  oval(c, fx + 5.4, HOVED_Y + 4.8, 1.8, 1.1, FASTE_FARVER.kinder);
  form(c, function () {
    c.moveTo(fx - 2, HOVED_Y + 6.4);
    c.quadraticCurveTo(fx + 0.2, HOVED_Y + 9.2, fx + 2.2, HOVED_Y + 6.4);
    c.closePath();
  }, FASTE_FARVER.mund, skygge("#b5473f", 0.7));
}

function tegnHoved(c, v, forfra, blink) {
  const hudKant = skygge(v.hud, 0.6);
  lem(c, 0, -80, 0, -73, 5, v.hud);                                   // hals
  oval(c, -8.4, HOVED_Y + 1, 1.8, 2.6, v.hud, hudKant);                // ører
  oval(c, 8.4, HOVED_Y + 1, 1.8, 2.6, v.hud, hudKant);
  form(c, function () {                                                // hovedet
    c.moveTo(-8.5, HOVED_Y - 1);
    c.quadraticCurveTo(-8.7, HOVED_Y - 11, 0, HOVED_Y - 11);
    c.quadraticCurveTo(8.7, HOVED_Y - 11, 8.5, HOVED_Y - 1);
    c.quadraticCurveTo(8.2, HOVED_Y + 7, 0.5, HOVED_Y + 10);
    c.quadraticCurveTo(-8.2, HOVED_Y + 7, -8.5, HOVED_Y - 1);
  }, glans(c, v.hud, -9, 9), hudKant);
  if (v.type === "kvinde" && forfra) {                                  // øreringe
    oval(c, -8.6, HOVED_Y + 4.6, 1, 1, FASTE_FARVER.guld, skygge("#f0c14b", 0.6));
    oval(c, 8.6, HOVED_Y + 4.6, 1, 1, FASTE_FARVER.guld, skygge("#f0c14b", 0.6));
  }
  if (forfra) tegnAnsigt(c, v, blink);
}


// =============================================================
//  Hvordan figuren bevæger sig lige nu
// =============================================================
function beregnPose(gaarTrin, tid) {
  if (gaarTrin === null) {
    return {
      ben: 0,
      arm: Math.sin(tid / 900) * 0.12,          // armene bevæger sig en lille smule
      hop: 0,
      aande: Math.sin(tid / 700) * 0.6,         // vejrtrækning
      hoved: Math.sin(tid / 1600) * 0.04,       // hovedet vipper lidt
    };
  }
  const fase = gaarTrin * Math.PI / 2;
  const sving = Math.sin(fase);
  return {
    ben: sving,
    arm: sving,
    hop: Math.abs(Math.cos(fase)) * 1.6,
    aande: 0,
    hoved: sving * 0.03,
  };
}


// =============================================================
//  Tegn hele figuren
//    x, y:      hvor fødderne står på skærmen
//    valg:      { type, frisure, toej, haar, hud, troeje, bukser, sko }
//    forfra:    true = kigger mod os, false = vender ryggen til
//    vendt:     1 = mod højre, -1 = mod venstre
//    gaarTrin:  null når figuren står stille, ellers et tal der tæller op
//    skala:     hvor stor figuren skal være (1 = normal)
// =============================================================
function tegnMenneske(c, x, y, valg, forfra, vendt, gaarTrin, skala) {
  const tid = performance.now();
  const pose = beregnPose(gaarTrin, tid);
  const k = KROP[valg.type] || KROP.kvinde;
  const toej = TOEJ[valg.toej] || TOEJ.hotel;
  const frisure = FRISURER[valg.frisure] || FRISURER.knold;
  const blink = tid % 3400 < 130;
  const s = skala || 1;

  c.save();
  c.translate(x, y - pose.hop * s);
  c.scale(vendt * s, s);

  if (forfra) frisure.bag(c, valg, true);

  // ben (det ene svinger frem, det andet tilbage)
  tegnEtBen(c, valg, toej, k, -1, pose.ben);
  tegnEtBen(c, valg, toej, k, 1, -pose.ben);
  toej.underdel(c, valg, k);

  // overkroppen trækker vejret
  c.translate(0, -pose.aande);
  if (forfra) lem(c, 0, -80, 0, -73, 5, valg.hud);
  toej.overdel(c, valg, k, forfra);
  if (forfra && frisure.overKrop) frisure.overKrop(c, valg);

  // armene svinger modsat benene
  tegnEnArm(c, valg, toej, k, -1, -pose.arm);
  tegnEnArm(c, valg, toej, k, 1, pose.arm);

  // hovedet
  c.translate(0, -78);
  c.rotate(pose.hoved);
  c.translate(0, 78);
  tegnHoved(c, valg, forfra, blink);
  if (forfra) frisure.foran(c, valg);
  else frisure.bag(c, valg, false);

  c.restore();
}

// Hvor høj figuren er (bruges til navneskiltet)
function figurHoejde(valg) {
  return valg.frisure === "knold" ? 110 : valg.frisure === "undercut" ? 106 : 103;
}

// Hvilke frisurer passer til en figur-type ("kvinde" eller "mand")
function frisurerTil(type) {
  return Object.keys(FRISURER).filter(function (id) { return FRISURER[id].figur === type; });
}
