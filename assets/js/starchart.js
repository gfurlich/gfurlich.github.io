//===========================================================
//
//  Star Chart Javascript for Website
//
//  Assisted by Claude
//
//===========================================================

//===========================================================
//  Star catalog (Hipparcos brightest stars)
//===========================================================
// const STARS = [
//     {name:"Sirius",      ra:101.287, dec:-16.716, mag:-1.46},
//     {name:"Canopus",     ra:95.988,  dec:-52.696, mag:-0.74},
//     {name:"Rigil Kent.", ra:219.902, dec:-60.834, mag:-0.27},
//     {name:"Arcturus",    ra:213.915, dec:19.182,  mag:-0.05},
//     {name:"Vega",        ra:279.235, dec:38.784,  mag:0.03},
//     {name:"Capella",     ra:79.172,  dec:45.998,  mag:0.08},
//     {name:"Rigel",       ra:78.634,  dec:-8.202,  mag:0.13},
//     {name:"Procyon",     ra:114.827, dec:5.225,   mag:0.34},
//     {name:"Achernar",    ra:24.429,  dec:-57.237, mag:0.46},
//     {name:"Betelgeuse",  ra:88.793,  dec:7.407,   mag:0.50},
//     {name:"Hadar",       ra:210.956, dec:-60.373, mag:0.61},
//     {name:"Acrux",       ra:186.650, dec:-63.099, mag:0.77},
//     {name:"Altair",      ra:297.696, dec:8.868,   mag:0.77},
//     {name:"Aldebaran",   ra:68.980,  dec:16.509,  mag:0.85},
//     {name:"Spica",       ra:201.298, dec:-11.161, mag:0.97},
//     {name:"Antares",     ra:247.352, dec:-26.432, mag:1.06},
//     {name:"Pollux",      ra:116.329, dec:28.026,  mag:1.14},
//     {name:"Fomalhaut",   ra:344.413, dec:-29.622, mag:1.16},
//     {name:"Deneb",       ra:310.358, dec:45.280,  mag:1.25},
//     {name:"Mimosa",      ra:191.930, dec:-59.689, mag:1.25},
//     {name:"Regulus",     ra:152.093, dec:11.967,  mag:1.36},
//     {name:"Adhara",      ra:104.656, dec:-28.972, mag:1.50},
//     {name:"Castor",      ra:113.650, dec:31.889,  mag:1.58},
//     {name:"Shaula",      ra:263.402, dec:-37.104, mag:1.63},
//     {name:"Bellatrix",   ra:81.283,  dec:6.350,   mag:1.64},
//     {name:"Elnath",      ra:81.573,  dec:28.608,  mag:1.65},
//     {name:"Miaplacidus", ra:138.300, dec:-69.717, mag:1.68},
//     {name:"Alnilam",     ra:84.053,  dec:-1.202,  mag:1.70},
//     {name:"Alnair",      ra:332.058, dec:-46.961, mag:1.74},
//     {name:"Alnitak",     ra:85.190,  dec:-1.943,  mag:1.74},
//     {name:"Regor",       ra:122.383, dec:-47.337, mag:1.75},
//     {name:"Alioth",      ra:193.507, dec:55.960,  mag:1.76},
//     {name:"Mirfak",      ra:51.081,  dec:49.861,  mag:1.79},
//     {name:"Dubhe",       ra:165.932, dec:61.751,  mag:1.79},
//     {name:"Wezen",       ra:107.097, dec:-26.393, mag:1.84},
//     {name:"Kaus Aust.",  ra:276.043, dec:-34.385, mag:1.85},
//     {name:"Avior",       ra:125.628, dec:-59.510, mag:1.86},
//     {name:"Alkaid",      ra:206.886, dec:49.313,  mag:1.86},
//     {name:"Sargas",      ra:264.330, dec:-42.998, mag:1.87},
//     {name:"Menkent",     ra:211.671, dec:-36.370, mag:2.06},
//     {name:"Atria",       ra:253.083, dec:-69.028, mag:1.92},
//     {name:"Peacock",     ra:306.412, dec:-56.735, mag:1.94},
//     {name:"Mirzam",      ra:95.675,  dec:-17.956, mag:1.98},
//     {name:"Alphard",     ra:141.897, dec:-8.659,  mag:1.99},
//     {name:"Hamal",       ra:31.793,  dec:23.463,  mag:2.00},
//     {name:"Polaris",     ra:37.954,  dec:89.264,  mag:1.98},
//     {name:"Denebola",    ra:177.265, dec:14.572,  mag:2.14},
//     {name:"Nunki",       ra:283.816, dec:-26.297, mag:2.05},
//     {name:"Menkib",      ra:46.199,  dec:31.794,  mag:2.85},
//     {name:"Zubenel.",    ra:222.676, dec:-16.042, mag:2.75},
// ];

//===========================================================
//  Star catalog (USNO Nav stars) https://aa.usno.navy.mil/data/
//===========================================================
const STARS = [
  // name, RA (degrees), Dec (degrees), magnitude
  // data from HIP catalog / Nautical Almanac
  {name:"Alpheratz",  ra:2.097,   dec:29.090,  mag:2.07},
  {name:"Ankaa",      ra:6.571,   dec:-42.306, mag:2.40},
  {name:"Schedar",    ra:10.127,  dec:56.537,  mag:2.23},
  {name:"Diphda",     ra:10.897,  dec:-17.987, mag:2.04},
  {name:"Achernar",   ra:24.429,  dec:-57.237, mag:0.46},
  {name:"Hamal",      ra:31.793,  dec:23.463,  mag:2.00},
  {name:"Polaris",    ra:37.954,  dec:89.264,  mag:1.98},
  {name:"Acamar",     ra:44.565,  dec:-40.305, mag:2.88},
  {name:"Menkar",     ra:45.570,  dec:4.090,   mag:2.54},
  {name:"Mirfak",     ra:51.081,  dec:49.861,  mag:1.79},
  {name:"Aldebaran",  ra:68.980,  dec:16.509,  mag:0.85},
  {name:"Rigel",      ra:78.634,  dec:-8.202,  mag:0.13},
  {name:"Capella",    ra:79.172,  dec:45.998,  mag:0.08},
  {name:"Bellatrix",  ra:81.283,  dec:6.350,   mag:1.64},
  {name:"Elnath",     ra:81.573,  dec:28.608,  mag:1.65},
  {name:"Alnilam",    ra:84.053,  dec:-1.202,  mag:1.70},
  {name:"Betelgeuse", ra:88.793,  dec:7.407,   mag:0.50},
  {name:"Canopus",    ra:95.988,  dec:-52.696, mag:-0.74},
  {name:"Sirius",     ra:101.287, dec:-16.716, mag:-1.46},
  {name:"Adhara",     ra:104.656, dec:-28.972, mag:1.50},
  {name:"Procyon",    ra:114.827, dec:5.225,   mag:0.34},
  {name:"Pollux",     ra:116.329, dec:28.026,  mag:1.14},
  {name:"Avior",      ra:125.628, dec:-59.510, mag:1.86},
  {name:"Suhail",     ra:136.999, dec:-43.433, mag:2.21},
  {name:"Miaplacidus",ra:138.300, dec:-69.717, mag:1.68},
  {name:"Alphard",    ra:141.897, dec:-8.659,  mag:1.99},
  {name:"Regulus",    ra:152.093, dec:11.967,  mag:1.36},
  {name:"Dubhe",      ra:165.932, dec:61.751,  mag:1.79},
  {name:"Denebola",   ra:177.265, dec:14.572,  mag:2.14},
  {name:"Gienah",     ra:183.786, dec:-17.542, mag:2.59},
  {name:"Acrux",      ra:186.650, dec:-63.099, mag:0.77},
  {name:"Gacrux",     ra:187.791, dec:-57.113, mag:1.63},
  {name:"Alioth",     ra:193.507, dec:55.960,  mag:1.76},
  {name:"Spica",      ra:201.298, dec:-11.161, mag:0.97},
  {name:"Alkaid",     ra:206.886, dec:49.313,  mag:1.86},
  {name:"Hadar",      ra:210.956, dec:-60.373, mag:0.61},
  {name:"Menkent",    ra:211.671, dec:-36.370, mag:2.06},
  {name:"Arcturus",   ra:213.915, dec:19.182,  mag:-0.05},
  {name:"Rigil Kent.",ra:219.902, dec:-60.834, mag:-0.27},
  {name:"Zubenel.",   ra:222.676, dec:-16.042, mag:2.75},
  {name:"Kochab",     ra:222.676, dec:74.156,  mag:2.08},
  {name:"Alphecca",   ra:233.672, dec:26.715,  mag:2.23},
  {name:"Antares",    ra:247.352, dec:-26.432, mag:1.06},
  {name:"Atria",      ra:253.083, dec:-69.028, mag:1.92},
  {name:"Sabik",      ra:257.595, dec:-15.724, mag:2.43},
  {name:"Shaula",     ra:263.402, dec:-37.104, mag:1.63},
  {name:"Rasalhague", ra:263.734, dec:12.560,  mag:2.08},
  {name:"Eltanin",    ra:269.152, dec:51.489,  mag:2.24},
  {name:"Kaus Aust.", ra:276.043, dec:-34.385, mag:1.85},
  {name:"Vega",       ra:279.235, dec:38.784,  mag:0.03},
  {name:"Nunki",      ra:283.816, dec:-26.297, mag:2.05},
  {name:"Altair",     ra:297.696, dec:8.868,   mag:0.77},
  {name:"Peacock",    ra:306.412, dec:-56.735, mag:1.94},
  {name:"Deneb",      ra:310.358, dec:45.280,  mag:1.25},
  {name:"Enif",       ra:326.046, dec:9.875,   mag:2.40},
  {name:"Alnair",     ra:332.058, dec:-46.961, mag:1.74},
  {name:"Fomalhaut",  ra:344.413, dec:-29.622, mag:1.16},
  {name:"Scheat",     ra:345.944, dec:28.083,  mag:2.44},
  {name:"Markab",     ra:346.190, dec:15.212,  mag:2.49},
];

//===========================================================
//  Math and Coordinate Transform Functions
//===========================================================

//=== Math Helper Funtions ===//
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const mod360 = x => ((x % 360) + 360) % 360;

//=== Time / Sidereal ===//

// Convert a JS Date to Julian Date
function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
    }
  
// Greenwich Mean Sidereal Time in degrees (IAU formula)
function gmst(jd) {
    const T = (jd - 2451545.0) / 36525;
    const g = 280.46061837
            + 360.98564736629 * (jd - 2451545)
            + 0.000387933 * T * T
            - T * T * T / 38710000;
    return mod360(g);
    }
  
/** Format decimal degrees as HH MM SS sidereal time string */
function lstToHMS(deg) {
    const totalSec = Math.round((mod360(deg) / 360) * 86400);
    const h  = Math.floor(totalSec / 3600);
    const m  = Math.floor((totalSec % 3600) / 60);
    const s  = totalSec % 60;
    return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    }
  
 /* Format a Date as local time string HH:MM:SS */
function formatLocal(date) {
    return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  }
  
/* Format a Date as UTC string HH:MM:SS */
function formatUTC(date) {
    return date.toUTCString().slice(17, 25);  // extracts HH:MM:SS portion
  }

/* Format a Datetime to ISO String, ISO 8601
// https://en.wikipedia.org/wiki/ISO_8601 */
function formatISOString(date) {
  return date.toISOString();
}

//=== Coordinate Transforms ===//

/**
 * Equatorial (RA/Dec) → Horizontal (Az/Alt)
 * @param {number} ra   Right ascension, degrees
 * @param {number} dec  Declination, degrees
 * @param {number} lst  Local sidereal time, degrees
 * @param {number} lat  Observer latitude, degrees
 * @returns {{ alt: number, az: number }}
 */
function equatorialToHorizontal(ra, dec, lst, lat) {
    const ha  = mod360(lst - ra);
    const haR = toRad(ha), decR = toRad(dec), latR = toRad(lat);
  
    const sinAlt = Math.sin(decR) * Math.sin(latR)
                 + Math.cos(decR) * Math.cos(latR) * Math.cos(haR);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  
    const cosAz = (Math.sin(decR) - Math.sin(alt) * Math.sin(latR))
                / (Math.cos(alt)  * Math.cos(latR) + 1e-10);
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));

    if (Math.sin(haR) > 0) az = 2 * Math.PI - az;

    return { alt: toDeg(alt), az: toDeg(az) };
    }

/**
 * Polar (zenithal) projection — horizon is always the outer ring.
 * Center = zenith, outer ring = horizon (alt 0°), linear in elevation.
 * North at top, azimuth clockwise.
 * @param {number} az     Azimuth, degrees (0 = N, 90 = E)
 * @param {number} alt    Altitude, degrees
 * @param {number} cx     Canvas center x
 * @param {number} cy     Canvas center y
 * @param {number} R      Pixel radius of the horizon ring
 * @returns {{ x: number, y: number }}
 */
function polarProject(az, alt, cx, cy, R) {
    const r     = (90 - alt) / 90 * R;
    const theta = toRad(az - 90);                 // rotate so N is up
    return {
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta),
    };
    }

//=== Star Visual Characteristics ===//
const starSize  = mag => Math.max(1.2, 5.5 - mag * 1.2);
const starAlpha = mag => Math.min(1, Math.max(0.2, 1 - mag * 0.18));
// const starColor = '#0d0d22'
const darkRed = 'rgba(100, 7, 7, 0.71)'
const lightRed = 'rgba(226, 29, 29, 0.42)'

//===========================================================
//  Time Display Visual
//===========================================================

/**
 * Draw LST / Local / UTC clock labels in the upper-left of the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} lst    Local sidereal time, degrees
 * @param {Date}   now    Current date (possibly offset)
 */
function drawTimeOverlay(ctx, lst, now) {
    const lines = [
      { label: 'Datetime:', value: now.toISOString()},
      { label: 'UTC:', value: formatUTC(now)},
      { label: 'Local Time:', value: formatLocal(now) },
      { label: 'Local Sidereal Time:', value: lstToHMS(lst) },
    ];
  
    const x      = 0;
    const yStart = 10;
    const lineH  = 20;
  
    ctx.font         = '14px monospace';
    ctx.textBaseline = 'middle';
  
    lines.forEach(({ label, value }, i) => {
      const y = yStart + i * lineH;
      
      // dim label
      ctx.fillStyle = darkRed;
      ctx.textAlign = 'left';
      ctx.fillText(label, x, y);

      // bright value
      ctx.fillStyle = lightRed;
      ctx.fillText(value, x + 200, y);
    });
    }

/**
 * Draw a four-point star (cross/diamond hybrid) centered at (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x        Center x
 * @param {number} y        Center y
 * @param {number} outer    Outer spike radius
 * @param {number} inner    Inner waist radius (controls spike sharpness)
 */
function drawStar(ctx, x, y, outer, inner) {
    const spikes = 4;
    const step   = Math.PI / spikes;   // angle between outer and inner point
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r     = i % 2 === 0 ? outer : inner;
      const angle = i * step - Math.PI / 4;  // rotate 45° so spikes point N/S/E/W
      const px    = x + r * Math.cos(angle);
      const py    = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

//===========================================================
//  Galactic → Equatorial (J2000)
//===========================================================

// const GAL_NGP_RA  = toRad(192.85948);   // RA of north galactic pole
// const GAL_NGP_DEC = toRad(27.12825);    // Dec of north galactic pole
// const GAL_LON_NCP = toRad(122.93192); // galactic longitude of north celestial pole
// const GAL_ANODE   = toRad(32.93192);    // ascending node of galactic plane on equator

// /*
//  * Galactic (l, b) → Equatorial (ra, dec), all degrees.
//  */
// function galacticToEquatorial(l, b) {
//   const lR = toRad(l), bR = toRad(b);

//   // declination
//   const sinDec = Math.sin(bR) * Math.sin(GAL_NGP_DEC)
//                + Math.cos(bR) * Math.cos(GAL_NGP_DEC) * Math.sin(lR - GAL_ANODE);
//   const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));

//   // right ascension
//   const y  = Math.cos(bR) * Math.sin(GAL_LON_NCP - lR);
//   const x  = Math.sin(bR) * Math.cos(GAL_NGP_DEC)
//             - Math.cos(bR) * Math.sin(GAL_NGP_DEC) * Math.cos(GAL_LON_NCP - lR);
//   const ra = mod360(toDeg(GAL_NGP_RA) - toDeg(Math.atan2(y, x)));

//   return { ra, dec: toDeg(dec) };
  // }
// ─── Galactic → Equatorial (J2000) ───────────────────────────────────────────
//
// Rotation matrix columns are the galactic X, Y, Z axes expressed in
// equatorial J2000 cartesian coordinates.
//
// Derived from IAU 1958 / Hipparcos definitions:
//   Galactic center:  RA = 266.40499°, Dec = -28.93617°
//   North galactic pole: RA = 192.85948°, Dec = 27.12825°
//
// Verified:
//   galToEq(0,0)   → RA 266.405°  Dec -28.936°  (Sagittarius ✓)
//   galToEq(180,0) → RA  86.405°  Dec +28.936°  (Gemini/Auriga border ✓)
//   galToEq(0,90)  → RA 192.859°  Dec +27.128°  (Coma Berenices ✓)

const R_GAL_TO_EQ = {
  Xx: -0.054875636,  Xy: -0.873437119,  Xz: -0.483834955,   // galactic X axis (→ GC)
  Yx:  0.494109429,  Yy: -0.444829612,  Yz:  0.746982255,   // galactic Y axis
  Zx: -0.867666149,  Zy: -0.198076373,  Zz:  0.455983776,   // galactic Z axis (→ NGP)
};

/**
 * Galactic (l, b) → Equatorial J2000 (ra, dec), all in degrees.
 */
function galacticToEquatorial(l, b) {
  const lR = toRad(l), bR = toRad(b);
  const {Xx,Xy,Xz,Yx,Yy,Yz,Zx,Zy,Zz} = R_GAL_TO_EQ;

  // unit vector in galactic frame
  const xg = Math.cos(bR) * Math.cos(lR);
  const yg = Math.cos(bR) * Math.sin(lR);
  const zg = Math.sin(bR);

  // rotate to equatorial — matrix columns are the galactic axes in equatorial
  const xe = Xx*xg + Yx*yg + Zx*zg;
  const ye = Xy*xg + Yy*yg + Zy*zg;
  const ze = Xz*xg + Yz*yg + Zz*zg;

  const dec = toDeg(Math.asin(Math.max(-1, Math.min(1, ze))));
  const ra  = mod360(toDeg(Math.atan2(ye, xe)));

  return { ra, dec };
}

//===========================================================
//  Ecliptic → Equatorial (J2000)
//===========================================================
const OBLIQUITY = toRad(23.43929);   // obliquity of ecliptic at J2000, degrees → radians

/**
 * Ecliptic (lambda, beta) → Equatorial (ra, dec), all degrees.
 * @param {number} lambda  Ecliptic longitude, degrees (0–360)
 * @param {number} beta    Ecliptic latitude,  degrees (0 for the ecliptic plane)
 */
function eclipticToEquatorial(lambda, beta) {
  const lR = toRad(lambda), bR = toRad(beta);
  const e  = OBLIQUITY;

  // declination
  const sinDec = Math.sin(bR) * Math.cos(e)
               + Math.cos(bR) * Math.sin(e) * Math.sin(lR);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  // right ascension
  const y  = Math.sin(lR) * Math.cos(e)
            - Math.tan(bR) * Math.sin(e);
  const x  = Math.cos(lR);
  const ra = mod360(toDeg(Math.atan2(y, x)));

  return { ra, dec: toDeg(dec) };
  }

//===========================================================
//  Sun Position
//===========================================================
/*
 * Low-precision solar coordinates (accurate to ~1° for dates 1950–2050).
 * Returns { ra, dec } in degrees.
 */
function sunPosition(jd) {
  const n     = jd - 2451545.0;          // days since J2000.0
  const L     = mod360(280.460 + 0.9856474 * n);   // mean longitude
  const g     = mod360(357.528 + 0.9856003 * n);   // mean anomaly
  const gR    = toRad(g);

  // ecliptic longitude (first two terms of equation of centre)
  const lambda = mod360(L + 1.915 * Math.sin(gR) + 0.020 * Math.sin(2 * gR));
  const beta   = 0;   // Sun stays on the ecliptic

  return eclipticToEquatorial(lambda, beta);
}

//===========================================================
//  Moon Position
//===========================================================
/*
 * Low-precision lunar coordinates (accurate to ~1–2° ).
 * Returns { ra, dec } in degrees.
 */
function moonPosition(jd) {
  const n  = jd - 2451545.0;

  // fundamental arguments (degrees)
  const L0 = mod360(218.316 + 13.176396 * n);   // mean longitude
  const M  = mod360(134.963 + 13.064993 * n);   // mean anomaly
  const F  = mod360(93.272  + 13.229350 * n);   // argument of latitude
  const MR = toRad(M), FR = toRad(F), L0R = toRad(L0);

  // ecliptic longitude
  const lambda = mod360(
    L0
    + 6.289 * Math.sin(MR)
    - 1.274 * Math.sin(2 * toRad(L0) - MR)   // evection
    + 0.658 * Math.sin(2 * L0R)               // variation
    - 0.186 * Math.sin(toRad(               // annual equation
        mod360(357.528 + 0.9856003 * n)
      ))
    - 0.059 * Math.sin(2 * MR - 2 * L0R)
    - 0.057 * Math.sin(MR - 2 * L0R + toRad(
        mod360(134.963 + 13.064993 * n)
      ))
  );

  // ecliptic latitude
  const beta = 5.128 * Math.sin(FR);

  return eclipticToEquatorial(lambda, beta);
}

//===========================================================
//  Draw Sun and Moon
//===========================================================
/**
 * Draw the Sun and Moon on the polar plot.
 */
function drawSolarSystem(ctx, jd, lst, lat, cx, cy, R) {
  const bodies = [
    { name: 'Sun',  coords: sunPosition(jd),  draw: drawSun  },
    { name: 'Moon', coords: moonPosition(jd), draw: drawMoon },
  ];

  bodies.forEach(({ name, coords, draw }) => {
    const { alt, az } = equatorialToHorizontal(coords.ra, coords.dec, lst, lat);
    if (alt < 0) return;   // below horizon
    const { x, y } = polarProject(az, alt, cx, cy, R);
    draw(ctx, x, y);

    // label
    ctx.fillStyle    = 'rgba(255,255,255,0.6)';
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x + 14, y);
  });
}

function drawSun(ctx, x, y) {
  const r = 10;

  // corona glow
  ctx.save();
  ctx.filter      = 'blur(6px)';
  ctx.fillStyle   = 'rgba(255, 200, 50, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y, r * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  // rays
  ctx.strokeStyle = 'rgba(255, 220, 80, 0.6)';
  ctx.lineWidth   = 1;
  for (let i = 0; i < 8; i++) {
    const angle  = (i / 8) * Math.PI * 2;
    const inner  = r + 3;
    const outer  = r + 8;
    ctx.beginPath();
    ctx.moveTo(x + inner * Math.cos(angle), y + inner * Math.sin(angle));
    ctx.lineTo(x + outer * Math.cos(angle), y + outer * Math.sin(angle));
    ctx.stroke();
  }

  // disc
  const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r);
  grad.addColorStop(0,   'rgba(255, 255, 200, 1.0)');
  grad.addColorStop(0.6, 'rgba(255, 210, 50,  1.0)');
  grad.addColorStop(1,   'rgba(220, 140, 10,  1.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMoon(ctx, x, y) {
  const r = 8;

  // glow
  ctx.save();
  ctx.filter    = 'blur(5px)';
  ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x, y, r * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  // disc
  const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r);
  grad.addColorStop(0,   'rgba(240, 245, 255, 1.0)');
  grad.addColorStop(0.7, 'rgba(200, 215, 240, 1.0)');
  grad.addColorStop(1,   'rgba(160, 180, 210, 1.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // crescent shadow — compute Moon phase from Sun/Moon elongation
  const sunCoords  = sunPosition(ctx._jd || 0);   // passed via ctx hack below
  const moonCoords = moonPosition(ctx._jd || 0);
  const elongation = mod360(moonCoords.ra - sunCoords.ra);

  // shadow disc offset creates crescent effect
  const phase    = elongation / 360;              // 0=new, 0.5=full, 1=new
  const shadowDx = Math.cos(toRad(elongation)) * r * 0.9;
  ctx.fillStyle  = 'rgba(5, 8, 20, 0.92)';
  ctx.beginPath();
  ctx.arc(x + shadowDx, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

//===========================================================
//  Planets
//===========================================================

// ─── Orbital elements at J2000.0 and rates per Julian century ────────────────
// Source: Meeus "Astronomical Algorithms" Table 33.a
const PLANET_ELEMENTS = {
  Mercury: { a0:0.38709927, ad:0.00000037,  e0:0.20563593, ed:0.00001906,
             I0:7.00497902, Id:-0.00594749, L0:252.25032350, Ld:149472.67411175,
             lp0:77.45779628, lpd:0.16047689, Om0:48.33076593, Omd:-0.12534081 },
  Venus:   { a0:0.72333566, ad:0.00000390,  e0:0.00677672, ed:-0.00004107,
             I0:3.39467605, Id:-0.00078890, L0:181.97909950, Ld:58517.81538729,
             lp0:131.60246718, lpd:0.00268329, Om0:76.67984255, Omd:-0.27769418 },
  Mars:    { a0:1.52371034, ad:0.00001847,  e0:0.09339410, ed:0.00007882,
             I0:1.84969142, Id:-0.00813131, L0:-4.55343205, Ld:19140.30268499,
             lp0:-23.94362959, lpd:0.44441088, Om0:49.55953891, Omd:-0.29257343 },
  Jupiter: { a0:5.20288700, ad:-0.00011607, e0:0.04838624, ed:-0.00013253,
             I0:1.30439695, Id:-0.00183714, L0:34.39644051, Ld:3034.74612775,
             lp0:14.72847983, lpd:0.21252668, Om0:100.47390909, Omd:0.20469106 },
  Saturn:  { a0:9.53667594, ad:-0.00125060, e0:0.05386179, ed:-0.00050991,
             I0:2.48599187, Id:0.00193609,  L0:49.95424423, Ld:1222.49362201,
             lp0:92.59887831, lpd:-0.41897216, Om0:113.66242448, Omd:-0.28867794 },
  Uranus:  { a0:19.18916464, ad:-0.00196176, e0:0.04725744, ed:-0.00004397,
             I0:0.77263783, Id:-0.00242939, L0:313.23810451, Ld:428.48202785,
             lp0:170.95427630, lpd:0.40805281, Om0:74.01692503, Omd:0.04240589 },
  Neptune: { a0:30.06992276, ad:0.00026291,  e0:0.00859048, ed:0.00005105,
             I0:1.77004347, Id:0.00035372,  L0:-55.12002969, Ld:218.45945325,
             lp0:44.96476227, lpd:-0.32241464, Om0:131.78422574, Omd:-0.00508664 },
};

// Earth elements (needed to convert heliocentric → geocentric)
const EARTH_ELEMENTS = {
  a0:1.00000261, ad:0.00000562,  e0:0.01671022, ed:-0.00003804,
  I0:0.00005,    Id:-0.01369,    L0:100.46457166, Ld:35999.37244981,
  lp0:102.93768193, lpd:0.32327364, Om0:-11.26064, Omd:-0.00503616,
};

// ─── Kepler solver ────────────────────────────────────────────────────────────

/**
 * Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E.
 * @param {number} M  Mean anomaly, degrees
 * @param {number} e  Eccentricity
 * @returns {number}  Eccentric anomaly, radians
 */
function solveKepler(M, e) {
  let ER = toRad(M) + e * Math.sin(toRad(M));
  for (let i = 0; i < 10; i++) {
    const dE = (toRad(M) - (ER - e * Math.sin(ER))) / (1 - e * Math.cos(ER));
    ER += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return ER;
}

// ─── Heliocentric ecliptic cartesian from orbital elements ────────────────────

function heliocentricXYZ(el, T) {
  const a  = el.a0  + el.ad  * T;
  const e  = el.e0  + el.ed  * T;
  const I  = el.I0  + el.Id  * T;
  const L  = mod360(el.L0  + el.Ld  * T);
  const lp = mod360(el.lp0 + el.lpd * T);
  const Om = mod360(el.Om0 + el.Omd * T);

  const w = mod360(lp - Om);       // argument of perihelion
  const M = mod360(L  - lp);       // mean anomaly
  const ER = solveKepler(M, e);

  // position in orbital plane
  const xp = a * (Math.cos(ER) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(ER);

  // rotate to ecliptic frame
  const IR  = toRad(I),  wR  = toRad(w),  OmR = toRad(Om);
  const cOs = Math.cos(OmR), sOs = Math.sin(OmR);
  const cI  = Math.cos(IR),  sI  = Math.sin(IR);
  const cw  = Math.cos(wR),  sw  = Math.sin(wR);

  const Xh = (cOs*cw - sOs*sw*cI)*xp + (-cOs*sw - sOs*cw*cI)*yp;
  const Yh = (sOs*cw + cOs*sw*cI)*xp + (-sOs*sw + cOs*cw*cI)*yp;
  const Zh = (sw*sI)*xp + (cw*sI)*yp;

  return { Xh, Yh, Zh };
}

// ─── Planet geocentric equatorial coordinates ─────────────────────────────────

/**
 * Compute geocentric equatorial (RA, Dec) for a planet.
 * @param {string} name  Planet name key in PLANET_ELEMENTS
 * @param {number} jd    Julian date
 * @returns {{ ra, dec }} degrees
 */
function planetPosition(name, jd) {
  const T  = (jd - 2451545.0) / 36525.0;
  const { Xh, Yh, Zh } = heliocentricXYZ(PLANET_ELEMENTS[name], T);
  const { Xh: Xe, Yh: Ye, Zh: Ze } = heliocentricXYZ(EARTH_ELEMENTS, T);

  // geocentric ecliptic
  const Xg = Xh - Xe;
  const Yg = Yh - Ye;
  const Zg = Zh - Ze;

  // rotate ecliptic → equatorial
  const e  = OBLIQUITY;   // already defined as toRad(23.43929)
  const Xq = Xg;
  const Yq = Math.cos(e)*Yg - Math.sin(e)*Zg;
  const Zq = Math.sin(e)*Yg + Math.cos(e)*Zg;

  const dist = Math.sqrt(Xq*Xq + Yq*Yq + Zq*Zq);
  const dec  = toDeg(Math.asin(Math.max(-1, Math.min(1, Zq / dist))));
  const ra   = mod360(toDeg(Math.atan2(Yq, Xq)));

  return { ra, dec };
}

// ─── Planet rendering ─────────────────────────────────────────────────────────

const PLANET_STYLE = {
  Mercury: { color: 'rgba(180,170,160,1.0)', glow: 'rgba(180,170,160,0.4)', r: 4,  symbol: '☿' },
  Venus:   { color: 'rgba(240,220,160,1.0)', glow: 'rgba(240,220,100,0.4)', r: 5,  symbol: '♀' },
  Mars:    { color: 'rgba(210, 90, 60,1.0)', glow: 'rgba(210, 90, 60,0.4)', r: 5,  symbol: '♂' },
  Jupiter: { color: 'rgba(220,190,140,1.0)', glow: 'rgba(220,190,140,0.4)', r: 8,  symbol: '♃' },
  Saturn:  { color: 'rgba(210,195,140,1.0)', glow: 'rgba(210,195,140,0.4)', r: 7,  symbol: '♄' },
  Uranus:  { color: 'rgba(160,220,230,1.0)', glow: 'rgba(160,220,230,0.4)', r: 5,  symbol: '⛢' },
  Neptune: { color: 'rgba(100,140,230,1.0)', glow: 'rgba(100,140,230,0.4)', r: 5,  symbol: '♆' },
};

function drawPlanet(ctx, x, y, style, name) {
  const { color, glow, r, symbol } = style;

  // glow halo
  ctx.save();
  ctx.filter    = `blur(${r}px)`;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  // disc
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Saturn rings — simple ellipse
  if (name === 'Saturn') {
    ctx.save();
    ctx.strokeStyle = 'rgba(210,195,140,0.7)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.4, r * 0.7, toRad(20), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // astronomical symbol label
  ctx.fillStyle    = color;
  ctx.font         = '13px sans-serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol + ' ' + name, x + r + 5, y);

  ctx.restore();
}

// ─── Draw all planets ─────────────────────────────────────────────────────────

/**
 * Call this inside drawSkyPlot after the stars.
 */
function drawPlanets(ctx, jd, lst, lat, cx, cy, R) {
  Object.entries(PLANET_STYLE).forEach(([name, style]) => {
    const { ra, dec } = planetPosition(name, jd);
    const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
    if (alt < 0) return;
    const { x, y } = polarProject(az, alt, cx, cy, R);
    drawPlanet(ctx, x, y, style, name);
  });
}

//===========================================================
//  Main Visual - Sky Plot
//===========================================================
  
/**
 * Draw the full polar sky chart onto a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {{ lat, lon, toffset}} params  Observer parameters
 * @param {string|null} hoveredStar  Name of star to highlight, or null
 * @returns {Array} projected  Array of star objects with {px, py, alt, az, ...}
 */
function drawSkyPlot(canvas, params, hoveredStar = null) {
    const { lat, lon, toffset} = params;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(cx, cy) - 44;
  
    //=== Sidereal time ===//
    const now   = new Date(Date.now() + toffset * 3_600_000);
    const jd    = julianDate(now);
    const lst   = mod360(gmst(jd) + lon);
  
    ctx.clearRect(0, 0, W, H);
  
    //=== Sky background ===//
    const skyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    skyGrad.addColorStop(0,   '#0d0d22');
    skyGrad.addColorStop(0.7, '#070714');
    skyGrad.addColorStop(1,   '#020208');
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = skyGrad;
    ctx.fill();
    ctx.restore();
  
    //=== Elevation rings ===//
    [0, 15, 30, 45, 60, 75, 90].forEach(alt => {
      const rr = (90 - alt) / 90 * R;
      if (rr < 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = alt === 0
        ? lightRed
        : darkRed;
        // ? 'rgba(100,140,255,0.45)'
        // : 'rgba(80,100,180,0.18)';
      ctx.lineWidth = alt === 0 ? 1 : 0.5;
      ctx.stroke();
      if (alt < 90) {
        ctx.fillStyle = lightRed;
        // ctx.fillStyle = 'rgba(140,160,220,0.45)';
        ctx.font = '10px sans-serif';
        ctx.fillText(alt + '°', cx + 3, cy - rr + 12);
      }
    });
  
    //=== Cardinal spokes & labels ===//
    [
      { az: 0,   label: 'N' },
      { az: 90,  label: 'E' },
      { az: 180, label: 'S' },
      { az: 270, label: 'W' },
    ].forEach(({ az, label }) => {
      const theta = toRad(az - 90);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(theta), cy + R * Math.sin(theta));
      ctx.strokeStyle = lightRed;
      // ctx.strokeStyle = 'rgba(80,100,180,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
  
      const lx = cx + (R + 18) * Math.cos(theta);
      const ly = cy + (R + 18) * Math.sin(theta);
      ctx.fillStyle   = label === 'N' ? lightRed : lightRed;
      // ctx.fillStyle   = label === 'N' ? 'rgba(180,200,255,0.9)' : 'rgba(140,160,220,0.65)';
      ctx.font        = label === 'N' ? '500 13px sans-serif'   : '12px sans-serif';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, ly);
    });
  
    //=== Intercardinals Labels ===//
    [
      { az: 45,  label: 'NE' },
      { az: 135, label: 'SE' },
      { az: 225, label: 'SW' },
      { az: 315, label: 'NW' },
    ].forEach(({ az, label }) => {
      const theta = toRad(az - 90);
      ctx.fillStyle    = lightRed;
      // ctx.fillStyle    = 'rgba(100,120,180,0.4)';
      ctx.font         = '10px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label,
        cx + (R + 16) * Math.cos(theta),
        cy + (R + 16) * Math.sin(theta));
    });
  
    /* Zenith dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180,200,255,0.4)';
    ctx.fill();
    */
  
    //===  Galactic Plane Overlay ===//

    /**
     * Draw the galactic plane (b = 0) on the polar plot.
     * Samples every 2° of galactic longitude and draws connected segments.
     */
    function drawGalacticPlane(ctx, lst, lat, cx, cy, R) {
      const STEP    = 2;     // degrees of galactic longitude per sample
      const SAMPLES = 360 / STEP;

      // collect projected points, marking gaps where the plane dips below horizon
      const points = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const l = i * STEP;
        const { ra, dec } = galacticToEquatorial(l, 0);
        const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
        if (alt < 0) {
          points.push(null);   // below horizon — break the line
        } else {
          const { x, y } = polarProject(az, alt, cx, cy, R);
          points.push({ x, y });
        }
      }

      // ── build path ──
      let pathD = '';
      let inSeg = false;
      points.forEach(pt => {
        if (!pt) { inSeg = false; return; }
        pathD += inSeg ? `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
                      : `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        inSeg = true;
      });

      if (!pathD) return;
      const path = new Path2D(pathD);

      ctx.save();
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';

      // ── layer 1: wide soft outer glow ──
      ctx.filter      = 'blur(10px)';
      ctx.strokeStyle = 'rgba(17, 17, 69, 0.18)';
      ctx.lineWidth   = 40;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke(path);

      // ── layer 2: mid haze ──
      ctx.filter      = 'blur(5px)';
      ctx.strokeStyle = 'rgba(35, 35, 102, 0.40)';
      ctx.lineWidth   = 15;
      ctx.stroke(path);

      // ── layer 3: bright dense core ──
      ctx.filter      = 'blur(2px)';
      ctx.strokeStyle = 'rgba(94, 94, 175, 0.5)';
      ctx.lineWidth   = 3;
      ctx.stroke(path);

      ctx.filter = 'none';
      ctx.restore();

      // ctx.strokeStyle = 'rgba(255, 200, 80, 0.55)';   // warm amber tint
      // ctx.lineWidth   = 1;
      // ctx.setLineDash([4, 3]);                          // dashed so it doesn't overpower stars

      // let drawing = false;
      // ctx.beginPath();
      // points.forEach(pt => {
      //   if (!pt) {
      //     drawing = false;
      //     return;
      //   }
      //   if (!drawing) {
      //     ctx.moveTo(pt.x, pt.y);
      //     drawing = true;
      //   } else {
      //     ctx.lineTo(pt.x, pt.y);
      //   }
      // });
      // ctx.stroke();

      // label near galactic center (l=0)
      const { ra: gcRa, dec: gcDec } = galacticToEquatorial(0, 0);
      const { alt: gcAlt, az: gcAz } = equatorialToHorizontal(gcRa, gcDec, lst, lat);
      if (gcAlt > 5) {
        const { x: gx, y: gy } = polarProject(gcAz, gcAlt, cx, cy, R);
        ctx.fillStyle    = darkRed;
        ctx.font         = '10px sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Galactic Plane', gx + 6, gy);
        }

      ctx.setLineDash([]);   // reset dash for subsequent drawing
      ctx.restore();
      }

    //===  Sun and Moon ===//

    // store jd on ctx so drawMoon can access it for phase calc
    ctx._jd = jd;

    // after stars, before time overlay:
    drawSolarSystem(ctx, jd, lst, lat, cx, cy, R);

    // after drawSolarSystem(ctx, jd, lst, lat, cx, cy, R);
    drawPlanets(ctx, jd, lst, lat, cx, cy, R);

    // Point of Ares
    // const ZODIAC = ['♈︎'];
    // ZODIAC.forEach((glyph, i) => {
    //   // const lambda = i * 30 - 90;
    //   const lambda = i * 30;
    //   const { ra, dec } = eclipticToEquatorial(lambda, 0);
    //   const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
    //   if (alt < 3) return;
    //   const { x, y } = polarProject(az, alt, cx, cy, R);
    //   ctx.fillStyle    = 'rgba(80,200,255,0.55)';
    //   ctx.font         = '11px sans-serif';
    //   ctx.textAlign    = 'center';
    //   ctx.textBaseline = 'middle';
    //   ctx.fillText(glyph, x, y - 8);
    // });

    // zodiac markers every 30°
    // const ZODIAC = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']; // Colored symbols
    // const ZODIAC = ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
    // ZODIAC.forEach((glyph, i) => {
    //   const lambda = i * 30 - 90;   // midpoint of each sign
    //   const { ra, dec } = eclipticToEquatorial(lambda, 0);
    //   const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
    //   if (alt < 3) return;
    //   const { x, y } = polarProject(az, alt, cx, cy, R);
    //   ctx.fillStyle    = 'rgba(80,200,255,0.55)';
    //   ctx.font         = '11px sans-serif';
    //   ctx.textAlign    = 'center';
    //   ctx.textBaseline = 'middle';
    //   ctx.fillText(glyph, x, y - 8);
    // });

    //===  Ecliptic Plane Overlay ===//

    /**
     * Draw the ecliptic (beta = 0) on the polar plot.
     * Samples every 2° of ecliptic longitude and draws connected segments.
     */
    function drawEcliptic(ctx, lst, lat, cx, cy, R) {
      const STEP    = 2;
      const SAMPLES = 360 / STEP;

      const points = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const lambda = i * STEP;
        const { ra, dec } = eclipticToEquatorial(lambda, 0);
        const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
        if (alt < 0) {
          points.push(null);   // below horizon — break the line
        } else {
          const { x, y } = polarProject(az, alt, cx, cy, R);
          points.push({ x, y });
        }
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(80, 200, 255, 0.50)';   // cool blue tint
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 3]);

      let drawing = false;
      ctx.beginPath();
      points.forEach(pt => {
        if (!pt) {
          drawing = false;
          return;
        }
        if (!drawing) {
          ctx.moveTo(pt.x, pt.y);
          drawing = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    //=== Draw Refeerence Planes ===//
    drawGalacticPlane(ctx, lst, lat, cx, cy, R);
    drawEcliptic(ctx, lst, lat, cx, cy, R);

    //=== Project & Draw Stars ===//
    const projected = [];
  
    STARS.forEach(star => {
        const { alt, az } = equatorialToHorizontal(star.ra, star.dec, lst, lat);
        if (alt < 0) return;   // below horizon — skip
        const { x, y } = polarProject(az, alt, cx, cy, R);
        projected.push({ ...star, alt, az, px: x, py: y });
        });
  
    /*projected.forEach(star => {
        const r     = starSize(star.mag);
        const a     = starAlpha(star.mag);
  
        const t  = Math.min(1, star.alt / 60);
        const rb = Math.round(200 + t * 55);
        const gb = Math.round(200 + t * 55);
        const bb = Math.round(230 + t * 25);

        ctx.globalAlpha = a;
        ctx.fillStyle   = `rgb(${rb},${gb},${bb})`;
        ctx.beginPath();
        ctx.arc(star.px, star.py, r, 0, Math.PI * 2);
        ctx.fill();

        if (r > 2.8) {
        ctx.globalAlpha = a * 0.12;
        ctx.beginPath();
        ctx.arc(star.px, star.py, r * 2.8, 0, Math.PI * 2);
        ctx.fill();
        }
        ctx.globalAlpha = 1;
        });
    */

    projected.forEach(star => {

        const size = starSize(star.mag);
        const a    = starAlpha(star.mag);

        const t  = Math.min(1, star.alt / 60);
        const rb = Math.round(200 + t * 55);
        const gb = Math.round(200 + t * 55);
        const bb = Math.round(230 + t * 25);
        const color = `rgb(${rb},${gb},${bb})`;

        // soft glow halo behind the glyph
        if (size > 2.8) {
        ctx.globalAlpha = a * 0.12;
        ctx.fillStyle   = color;
        ctx.beginPath();
        ctx.arc(star.px, star.py, size * 2.8, 0, Math.PI * 2);
        ctx.fill();
        }

        // ✦ glyph — font size scaled to match the old dot radius
        ctx.globalAlpha  = a;
        ctx.fillStyle    = color;
        ctx.font         = `${Math.round(size * 2.8)}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u2726', star.px, star.py);

        ctx.globalAlpha = 1;
    });
  
    //=== Hover highlight ===//
    /*if (hoveredStar) {
      const s = projected.find(x => x.name === hoveredStar);
      if (s) {
        ctx.strokeStyle = 'rgba(200,220,255,0.85)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(s.px, s.py, starSize(s.mag) + 6, 0, Math.PI * 2);
        ctx.stroke();
  
        let lx = s.px + 10;
        if (lx > W - 80) lx = s.px - 10;
        ctx.fillStyle    = 'rgba(210,225,255,0.95)';
        ctx.font         = '12px sans-serif';
        ctx.textAlign    = lx > s.px ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.name, lx, s.py - 6);
      }
    }
      */
  
    //=== Highlight Star ===//
    if (hoveredStar) {
        const s = projected.find(x => x.name === hoveredStar);
        if (s) {

          // highlight ring
          ctx.strokeStyle = 'rgba(200,220,255,0.85)';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.arc(s.px, s.py, starSize(s.mag) * 1.4 + 4, 0, Math.PI * 2);
          ctx.stroke();
    
          // redraw glyph on top so the ring doesn't obscure it
          const size = starSize(s.mag);
          const t    = Math.min(1, s.alt / 60);
          ctx.globalAlpha  = starAlpha(s.mag);
          ctx.fillStyle    = `rgb(${Math.round(200+t*55)},${Math.round(200+t*55)},${Math.round(230+t*25)})`;
          ctx.font         = `${Math.round(size * 2.8)}px sans-serif`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('\u2726', s.px, s.py);
          ctx.globalAlpha  = 1;
    
          // Star name label
          let lx = s.px + 15;
          if (lx > canvas.width - 80) lx = s.px - 10;
          // ctx.fillStyle    = 'rgba(210,225,255,0.95)';
          ctx.fillStyle    = lightRed;
          ctx.font         = '12px sans-serif';
          ctx.textAlign    = lx > s.px ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.name, lx, s.py - 6);
        }
      }

    // ── Time overlay (drawn last so it sits on top) ──
    drawTimeOverlay(ctx, lst, now);

    return projected;
    }
  
//===========================================================
//  Interactive Display
//===========================================================

const canvas = document.getElementById('sky');
let hoveredStar = null;
let lastProjected = [];

function getParams() {
    return {
      lat:     parseFloat(document.getElementById('lat').value)    || 0,
      lon:     parseFloat(document.getElementById('lon').value)    || 0,
      toffset: parseFloat(document.getElementById('toffset').value)|| 0,
    };
    }
  
function redraw() {
    lastProjected = drawSkyPlot(canvas, getParams(), hoveredStar);
    }

//=== Display Star Information ===//
canvas.addEventListener('mousemove', e => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
  
    let found = null, minD = Infinity;
    lastProjected.forEach(s => {
      const d = Math.hypot(s.px - mx, s.py - my);
      if (d < 22 && d < minD) { minD = d; found = s; }
    });
  
    hoveredStar = found ? found.name : null;
  
    if (found) {
      document.getElementById('info').textContent =
        `${found.name}  |  Az: ${found.az.toFixed(1)}°  E of N, ` +
        `Alt: ${found.alt.toFixed(1)}°  |  mag ${found.mag}  |  ` +
        `RA: ${found.ra.toFixed(2)}°,  Dec: ${found.dec.toFixed(2)}°`;
    } else {
      document.getElementById('info').textContent = 'Hover over a star to see its name';
    }
    redraw();
  });
  
['lat', 'lon', 'toffset'].forEach(id => {
document.getElementById(id).addEventListener('input', redraw);
});
  
redraw();
setInterval(redraw, 1000);  // auto-refresh every 1 s