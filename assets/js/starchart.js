//===========================================================
//
//  Javascript Star Chart for Website
//
//  Author: Greg Furlich, Assisted by Claude
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
  
/* Format decimal degrees as HH MM SS sidereal time string */
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

//===========================================================
//  Display Colors + Night Mode
//===========================================================

let nightMode = false;

function uiDark()  { return nightMode ? 'rgba(120, 0, 0, 0.85)' : 'rgba(100, 7, 7, 0.71)'; }
function uiLight() { return nightMode ? 'rgba(180, 0, 0, 0.70)' : 'rgba(226, 29, 29, 0.42)'; }

Object.defineProperty(window, 'darkRed',  { get: uiDark,  configurable: true });
Object.defineProperty(window, 'lightRed', { get: uiLight, configurable: true });

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
  
    ctx.font         = '12px monospace';
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
// function drawStar(ctx, x, y, outer, inner) {
//     const spikes = 4;
//     const step   = Math.PI / spikes;   // angle between outer and inner point
//     ctx.beginPath();
//     for (let i = 0; i < spikes * 2; i++) {
//       const r     = i % 2 === 0 ? outer : inner;
//       const angle = i * step - Math.PI / 4;  // rotate 45° so spikes point N/S/E/W
//       const px    = x + r * Math.cos(angle);
//       const py    = y + r * Math.sin(angle);
//       i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
//     }
//     ctx.closePath();
//   }

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

//===  Galactic Plane Overlay ===//

// Offscreen cache — blur is expensive, only rebuild when sky moves
const galCache = { canvas: null, key: null };

function drawGalacticPlane(ctx, lst, lat, cx, cy, R) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const key = `${lst.toFixed(2)}|${lat.toFixed(2)}|${R.toFixed(0)}|${nightMode}`;

  if (galCache.key !== key) {
    if (!galCache.canvas || galCache.canvas.width !== W || galCache.canvas.height !== H) {
      galCache.canvas = document.createElement('canvas');
      galCache.canvas.width  = W;
      galCache.canvas.height = H;
    }
    const oc = galCache.canvas.getContext('2d');
    oc.clearRect(0, 0, W, H);

    const points = [];
    for (let i = 0; i <= 180; i++) {
      const l = i * 2;
      const { ra, dec } = galacticToEquatorial(l, 0);
      const { alt, az } = equatorialToHorizontal(ra, dec, lst, lat);
      if (alt < 0) { points.push(null); continue; }
      const { x, y } = polarProject(az, alt, cx, cy, R);
      points.push({ x, y });
    }

    let pathD = '', inSeg = false;
    points.forEach(pt => {
      if (!pt) { inSeg = false; return; }
      pathD += inSeg ? `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
                     : `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      inSeg = true;
    });

    if (pathD) {
      const path = new Path2D(pathD);
      oc.lineCap = oc.lineJoin = 'round';
      if (nightMode) {
        // red-tinted milky way in night mode
        oc.filter = 'blur(10px)'; oc.strokeStyle = 'rgba(60,0,0,0.25)';    oc.lineWidth = 40; oc.stroke(path);
        oc.filter = 'blur(5px)';  oc.strokeStyle = 'rgba(100,0,0,0.45)';   oc.lineWidth = 15; oc.stroke(path);
        oc.filter = 'blur(2px)';  oc.strokeStyle = 'rgba(140,20,20,0.55)'; oc.lineWidth = 3;  oc.stroke(path);
      } else {
        oc.filter = 'blur(10px)'; oc.strokeStyle = 'rgba(17,17,69,0.18)';  oc.lineWidth = 40; oc.stroke(path);
        oc.filter = 'blur(5px)';  oc.strokeStyle = 'rgba(35,35,102,0.40)'; oc.lineWidth = 15; oc.stroke(path);
        oc.filter = 'blur(2px)';  oc.strokeStyle = 'rgba(94,94,175,0.5)';  oc.lineWidth = 3;  oc.stroke(path);
      }
      oc.filter = 'none';
    }
    galCache.key = key;
  }

  ctx.drawImage(galCache.canvas, 0, 0);

  // label near galactic center
  const { ra: gcRa, dec: gcDec } = galacticToEquatorial(0, 0);
  const { alt: gcAlt, az: gcAz } = equatorialToHorizontal(gcRa, gcDec, lst, lat);
  if (gcAlt > 5) {
    const { x: gx, y: gy } = polarProject(gcAz, gcAlt, cx, cy, R);
    ctx.fillStyle = darkRed; ctx.font = '10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Galactic Plane', gx + 6, gy);
  }
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
/*
 * Draw the Sun and Moon on the polar plot.
 */
function drawSolarSystem(ctx, jd, lst, lat, cx, cy, R) {
  const bodies = [
    { name: 'Moon', coords: moonPosition(jd), draw: drawMoon },
    { name: 'Sun',  coords: sunPosition(jd),  draw: drawSun  },
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

//=== Sun ===//
function drawSun(ctx, x, y) {
  const r = 10;

  // Corona glow
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

//=== Moon ===//
function drawMoon(ctx, x, y) {
  const r = 8;
  ctx.save();

  // glow
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

  // Moon Phase crescent shadow — compute Moon phase from Sun/Moon elongation
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
//  Planets Orbital elements at J2000.0 and rates per Julian century
//
//  Source: Meeus "Astronomical Algorithms" Table 33.a
//
//===========================================================
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

//===========================================================
//  Kepler solver
//===========================================================
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

//===========================================================
//  Heliocentric ecliptic cartesian from orbital elements
//===========================================================
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

//===========================================================
//  Planet geocentric equatorial coordinates
//===========================================================
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

//===========================================================
//  Planet Visual Settings
//===========================================================
//=== Plant Color, Size, and Symbol
const PLANET_STYLE = {
  Mercury: { color: 'rgba(180,170,160,1.0)', glow: 'rgba(180,170,160,0.4)', r: 4,  symbol: '☿' },
  Venus:   { color: 'rgba(240,220,160,1.0)', glow: 'rgba(240,220,100,0.4)', r: 5,  symbol: '♀' },
  Mars:    { color: 'rgba(210, 90, 60,1.0)', glow: 'rgba(210, 90, 60,0.4)', r: 5,  symbol: '♂' },
  Jupiter: { color: 'rgba(220,190,140,1.0)', glow: 'rgba(220,190,140,0.4)', r: 8,  symbol: '♃' },
  Saturn:  { color: 'rgba(210,195,140,1.0)', glow: 'rgba(210,195,140,0.4)', r: 7,  symbol: '♄' },
  Uranus:  { color: 'rgba(160,220,230,1.0)', glow: 'rgba(160,220,230,0.4)', r: 5,  symbol: '⛢' },
  Neptune: { color: 'rgba(100,140,230,1.0)', glow: 'rgba(100,140,230,0.4)', r: 5,  symbol: '♆' },
};
//=== Draw Planet ===//
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

//===========================================================
//  Draw all planets 
//===========================================================
/*
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
//  Satellite catalog groups available from CelesTrak
//===========================================================
const SAT_GROUPS = {
  'ISS':              'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE',
  'Brightest':        'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=TLE',
  'Earth Observing':  'https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=TLE',
  'Weather':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=TLE',
  'Comms':            'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=TLE',
  'GNSS':             'https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=TLE',
  'Science':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=TLE',
  'Cubesat':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=TLE',
  'Calibration':      'https://celestrak.org/NORAD/elements/gp.php?GROUP=radar&FORMAT=TLE',
  'Starlink':         'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE',
};

//===========================================================
//  Fetch Satellite TLEs available from CelesTrak
//===========================================================
// Direct TLE URLs (more reliable, standard CelesTrak format)
const TLE_URLS = {
  'ISS':              'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE',
  'Brightest':        'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=TLE',
  'Earth Observing':  'https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=TLE',
  'Weather':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=TLE',
  'Comms':            'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=TLE',
  'GNSS':             'https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=TLE',
  'Science':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=TLE',
  'Cubesat':          'https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=TLE',
  'Calibration':      'https://celestrak.org/NORAD/elements/gp.php?GROUP=radar&FORMAT=TLE',
  'Starlink':         'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=TLE',
};

/*
 * Parse a raw TLE text block into an array of satellite records.
 * Handles both 2-line and 3-line (with name) TLE formats.
 */
function parseTLEs(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const sats  = [];

  // 3-line format: name, line1, line2
  if (lines.length % 3 === 0 && !lines[0].startsWith('1 ')) {
    for (let i = 0; i < lines.length; i += 3) {
      try {
        const satrec = satellite.twoline2satrec(lines[i + 1], lines[i + 2]);
        sats.push({ name: lines[i].replace(/^0 /, '').trim(), satrec });
      } catch(e) { /* skip malformed */ }
    }
  } else {
    // 2-line format
    for (let i = 0; i < lines.length - 1; i += 2) {
      if (lines[i].startsWith('1 ') && lines[i+1].startsWith('2 ')) {
        try {
          const satrec = satellite.twoline2satrec(lines[i], lines[i + 1]);
          sats.push({ name: `NORAD ${satrec.satnum}`, satrec });
        } catch(e) { /* skip malformed */ }
      }
    }
  }
  return sats;
}

/*
 * Fetch and parse TLEs for a named group.
 * Results are cached in sessionStorage to avoid hammering CelesTrak.
 */
async function fetchTLEs(groupName) {
  const url       = TLE_URLS[groupName];
  const cacheKey  = `tle_${groupName}`;
  const cacheTime = `tle_time_${groupName}`;
  const maxAge    = 3600 * 1000;   // refresh TLEs every hour

  // return cached data if fresh
  const cached = sessionStorage.getItem(cacheKey);
  const cachedAt = parseInt(sessionStorage.getItem(cacheTime) || '0');
  if (cached && Date.now() - cachedAt < maxAge) {
    return parseTLEs(cached);
  }

  try {
    const res  = await fetch(url);
    const text = await res.text();
    sessionStorage.setItem(cacheKey, text);
    sessionStorage.setItem(cacheTime, Date.now().toString());
    return parseTLEs(text);
  } catch (err) {
    console.warn(`TLE fetch failed for ${groupName}:`, err);
    return [];
  }
}

/**
 * Compute topocentric Az/Alt for a satellite at the current time.
 * Uses satellite.js for SGP4 propagation and coordinate transforms.
 *
 * @param {Object} satrec    satellite.js satrec object
 * @param {Date}   date      current UTC date
 * @param {number} lat       observer latitude, degrees
 * @param {number} lon       observer longitude, degrees
 * @param {number} altM      observer altitude, metres (default 0)
 * @returns {{ az, alt, range, lat, lon, visible } | null}
 */
function satelliteAzAlt(satrec, date, lat, lon, altM = 0) {
  const posVel = satellite.propagate(satrec, date);
  if (!posVel || !posVel.position || posVel.position === true) return null;
 
  const gmstRad    = satellite.gstime(date);
  const observerGd = {
    longitude: satellite.degreesToRadians(lon),
    latitude:  satellite.degreesToRadians(lat),
    height:    altM / 1000,   // km
  };
 
  const posEcf  = satellite.eciToEcf(posVel.position, gmstRad);
  const lookAng = satellite.ecfToLookAngles(observerGd, posEcf);
  const geo     = satellite.eciToGeodetic(posVel.position, gmstRad);
 
  return {
    az:    toDeg(lookAng.azimuth),
    alt:   toDeg(lookAng.elevation),
    range: lookAng.rangeSat,             // km (was incorrectly wrapped in toDeg before)
    subLat: toDeg(geo.latitude),
    subLon: toDeg(geo.longitude),
    altKm:  geo.height,
  };
}

//===========================================================
//  Satellite State Manager
//===========================================================

// const satManager = {
//   satellites:   [],          // array of { name, satrec }
//   activeGroup:  'ISS',
//   loading:      false,

//   async loadGroup(groupName) {
//     this.loading = true;
//     this.satellites = await fetchTLEs(groupName);
//     this.activeGroup = groupName;
//     this.loading = false;
//     console.log(`Loaded ${this.satellites.length} satellites for ${groupName}`);
//   }
// };

//===========================================================
//  Satellite State Manager
//===========================================================
const satManager = {
  satellites:    [],       // merged array of { name, satrec, group }
  activeGroups:  new Set(['ISS']),
  loading:       new Set(),   // tracks which groups are currently fetching

  isLoading() { return this.loading.size > 0; },

  async loadGroup(groupName) {
    this.loading.add(groupName);
    const sats = await fetchTLEs(groupName);
    // tag each sat with its group for coloring
    sats.forEach(s => s.group = groupName);
    this.loading.delete(groupName);
    this._rebuild();
    return sats;
  },

  async setGroups(groupNames) {
    this.activeGroups = new Set(groupNames);
    // fetch any groups not already cached
    await Promise.all(groupNames.map(g => this.loadGroup(g)));
  },

  _rebuild() {
    // merge satellites from all active groups, re-fetching from cache
    this.satellites = [];
    this.activeGroups.forEach(groupName => {
      const cacheKey = `tle_${groupName}`;
      const cached   = sessionStorage.getItem(cacheKey);
      if (cached) {
        const sats = parseTLEs(cached);
        sats.forEach(s => {
          s.group = groupName;
          this.satellites.push(s);
        });
      }
    });
  },
};

//===========================================================
//  Satellite Visual Options
//===========================================================

// Satellite colors by group 
const SAT_COLORS = {
  'ISS':             'rgba(247,212,109,1.0)',   // hue  45° — warm gold
  'Brightest':       'rgba(189,247,109,1.0)',   // hue  85° — yellow-green
  'Earth Observing': 'rgba(109,247,121,1.0)',   // hue 125° — green
  'Weather':         'rgba(109,247,212,1.0)',   // hue 165° — teal
  'Comms':           'rgba(109,189,247,1.0)',   // hue 205° — sky blue
  'GNSS':            'rgba(121,109,247,1.0)',   // hue 245° — indigo
  'Science':         'rgba(212,109,247,1.0)',   // hue 285° — violet
  'Cubesat':         'rgba(247,109,189,1.0)',   // hue 325° — pink
  'Calibration':     'rgba(247,121,109,1.0)',   // hue   5° — red-orange
  'Starlink':        'rgba(200,200,200,0.7)'
};

/**
 * Draw ISS silhouette — top-down view.
 * Matches the published configuration: long truss, 4 pairs of solar wings,
 * central habitat spine, radiator panels.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx   Center x
 * @param {number} cy   Center y
 * @param {number} s    Scale factor (1 = ~30px wide truss span)
 * @param {string} color  Fill color
 */
function drawISSShape(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;

  // ── Main truss (long horizontal bar) ──
  // Full span ~109m, habitat ~73m — ratio truss:habitat ≈ 3:2
  const tw = s * 15;   // half-truss width (full span = 30s)
  const th = s * 0.9;  // truss thickness (half)
  ctx.fillRect(-tw, -th, tw * 2, th * 2);

  // ── Central habitat spine (perpendicular to truss) ──
  const hw = s * 1.2;   // half habitat width
  const hh = s * 5;     // half habitat length
  ctx.fillRect(-hw, -hh, hw * 2, hh * 2);

  // ── Solar array wings — 4 pairs, symmetric port & starboard ──
  // Each pair: 2 rectangular panels, stacked forward/aft of truss
  // Pair positions along truss (from center): P6/S6, P4/S4, P3/S3, P1/S1
  const wingW  = s * 4.5;   // wing width (span direction)
  // const wingH  = s * 1.8;   // wing chord (depth)
  const wingH  = s * 10;   // wing chord (depth)
  const wingGap = s * 0.5;  // gap between forward and aft panel in a pair

  // Attachment points along truss (x offsets from center)
  const attachX = [-tw * 0.85, -tw * 0.52, tw * 0.52, tw * 0.85];

  attachX.forEach(ax => {
    // forward panel (above truss in top view)
    ctx.fillRect(ax - wingW / 2,  th + wingGap,           wingW, wingH);
    // aft panel (below truss in top view)
    ctx.fillRect(ax - wingW / 2, -th - wingGap - wingH,   wingW, wingH);
  });

  // ── iROSA roll-out arrays (inner pairs, slightly smaller) ──
  // Mounted inboard of P4/S4, overlapping slightly
  // const irosaW = s * 3.2;
  // const irosaH = s * 1.2;
  // const irosaX = [-tw * 0.38, tw * 0.38];

  // irosaX.forEach(ax => {
  //   ctx.fillRect(ax - irosaW / 2,  th + wingGap + wingH + s * 0.4,  irosaW, irosaH);
  //   ctx.fillRect(ax - irosaW / 2, -th - wingGap - wingH - s * 0.4 - irosaH, irosaW, irosaH);
  // });

  // // ── Radiator panels (on S1/P1 truss segments, perpendicular to arrays) ──
  // const radW = s * 1.0;
  // const radH = s * 3.2;
  // const radX = [-tw * 0.30, tw * 0.30];   // inboard of outer solar pairs

  // radX.forEach(ax => {
  //   // port-side radiators fold perpendicular — rendered as thin tall rects
  //   ctx.fillRect(ax - radW / 2, -radH / 2, radW, radH);
  // });

  // // ── Z1 truss + P6 solar array (top of habitat, forward) ──
  // // Small crossbar near top of habitat spine
  // const z1w = s * 2.5;
  // const z1h = s * 0.6;
  // ctx.fillRect(-z1w / 2, -hh - z1h * 2, z1w, z1h);

  ctx.restore();
}

/*
 * Draw a single satellite marker.
 */
function drawSatellite(ctx, x, y, name, color, isISS = false, hovered = false) {
  ctx.save();

  if (isISS) {
    // glow halo
    ctx.filter    = 'blur(6px)';
    ctx.fillStyle = color.replace('1.0', '0.35');
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';

    // hover ring
    if (hovered) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ISS silhouette — scale 0.7 fits in ~21px radius
    // drawISSShape(ctx, x, y, 0.7, color);
    drawISSShape(ctx, x, y, 1, color);

    // label
    if (hovered) {
      ctx.fillStyle    = 'rgba(255,255,255,0.95)';
      ctx.font         = '500 11px sans-serif';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('ISS', x + 24, y);
    }

  } else {
    // all other satellites — existing dot logic unchanged
    if (hovered) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.filter    = 'blur(3px)';
    ctx.fillStyle = color.replace('1.0', '0.4');
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (hovered || satManager.satellites.length <= 10) {
      ctx.fillStyle    = hovered ? 'rgba(255,255,255,0.95)' : color;
      ctx.font         = hovered ? '500 11px sans-serif' : '10px sans-serif';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x + 6, y);
    }
  }

  ctx.restore();
}

function drawSatellites(ctx, date, lat, lon, cx, cy, R, hoveredSat = null) {
  if (satManager.isLoading()) {
    ctx.fillStyle    = darkRed;
    ctx.font         = '12px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Loading satellites...', 0, 100);
    return [];
  }

  let visCount = 0;
  const projSats = [];

  satManager.satellites.forEach(({ name, satrec, group }) => {
    const pos = satelliteAzAlt(satrec, date, lat, lon);
    if (!pos || pos.alt < 0) return;
    const { x, y } = polarProject(pos.az, pos.alt, cx, cy, R);
    const color = SAT_COLORS[group] || 'rgba(200,200,200,0.9)';
    projSats.push({ name, px: x, py: y, az: pos.az, alt: pos.alt,
                    altKm: pos.altKm, range: pos.range, color, group });
    visCount++;
  });

  const isISS = n => n.includes('ISS') || n.includes('25544');

  // draw non-hovered first
  projSats.forEach(s => {
    if (s.name === hoveredSat) return;
    drawSatellite(ctx, s.px, s.py, s.name, s.color, isISS(s.name), false);
  });

  // draw hovered on top
  const hovSat = projSats.find(s => s.name === hoveredSat);
  if (hovSat) {
    drawSatellite(ctx, hovSat.px, hovSat.py, hovSat.name, hovSat.color, isISS(hovSat.name), true);
  }

  // count display
  ctx.fillStyle    = darkRed;
  ctx.font         = '12px sans-serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  const groupList  = [...satManager.activeGroups].join(', ') || 'none';
  ctx.fillText(`Satellites (${groupList}): ${visCount} visible / ${satManager.satellites.length} tracked`, 0, 100);

  return projSats;
}

function seasonalEvents(year) {
  const Y = (year - 2000) / 1000;
  return {
    spring: 2451623.80984 + 365242.37404*Y + 0.05169*Y*Y - 0.00411*Y*Y*Y - 0.00057*Y*Y*Y*Y,
    summer: 2451716.56767 + 365241.62603*Y + 0.00325*Y*Y + 0.00888*Y*Y*Y - 0.00030*Y*Y*Y*Y,
    autumn: 2451810.21715 + 365242.01767*Y - 0.11575*Y*Y + 0.00337*Y*Y*Y + 0.00078*Y*Y*Y*Y,
    winter: 2451900.05952 + 365242.74049*Y - 0.06223*Y*Y - 0.00823*Y*Y*Y + 0.00032*Y*Y*Y*Y,
  };
}

//===========================================================
//  Astronomical Twighlight Calc
//===========================================================

/**
 * Compute astronomical twilight begin/end for the current day.
 * Sun is at -18° altitude at astronomical twilight.
 * Returns { begin, end } as local time strings, or '—' if not applicable.
 */
function astronomicalTwilight(jd, lat, lon) {
  const H0     = -18;                          // astronomical twilight altitude
  const jd0    = Math.floor(jd - 0.5) + 0.5;  // 0h UT of the day
  const latR   = toRad(lat);
  const gmst0  = mod360(280.46061837 + 360.98564736629 * jd0);

  function calcTime(body) {
    const { ra, dec } = body(jd0 + 0.5);
    const cosH = (Math.sin(toRad(H0)) - Math.sin(latR) * Math.sin(toRad(dec)))
               / (Math.cos(latR) * Math.cos(toRad(dec)));
    if (Math.abs(cosH) > 1) return { rise: null, set: null };
    const H0deg = toDeg(Math.acos(cosH));
    let mT = mod360(ra - lon - gmst0) / 360;
    let mR = ((mT - H0deg / 360) % 1 + 1) % 1;
    let mS = ((mT + H0deg / 360) % 1 + 1) % 1;

    function refine(m) {
      const { ra: raM, dec: decM } = body(jd0 + m);
      const gmstM = mod360(gmst0 + 360.985647 * m);
      let lha = mod360(gmstM + lon - raM);
      if (lha > 180) lha -= 360;
      const hM = toDeg(Math.asin(
        Math.sin(latR) * Math.sin(toRad(decM))
        + Math.cos(latR) * Math.cos(toRad(decM)) * Math.cos(toRad(lha))
      ));
      const dm = (hM - H0) / (360 * Math.cos(toRad(decM)) * Math.cos(latR) * Math.sin(toRad(lha)));
      return ((m + dm) * 24 + 24) % 24;
    }
    return { rise: refine(mR), set: refine(mS) };
  }

  const { rise, set } = calcTime(sunPosition);
  if (rise === null) return { begin: '—', end: '—' };

  // convert decimal hours UT to local time string
  function utToLocal(h) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setTime(d.getTime() + h * 3600000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return { begin: utToLocal(rise), end: utToLocal(set) };
}

//===========================================================
//  Backup Moon Phase
//===========================================================

function nextSeasonalEvent(jd) {
  const now  = new Date((jd - 2440587.5) * 86400000);
  const year = now.getUTCFullYear();
  const LABELS = {
    spring: 'Spring Equinox', summer: 'Summer Solstice',
    autumn: 'Autumn Equinox', winter: 'Winter Solstice',
  };
  const candidates = [];
  for (const y of [year, year + 1]) {
    const evts = seasonalEvents(y);
    for (const [key, evtJd] of Object.entries(evts)) {
      if (evtJd > jd) candidates.push({ name: LABELS[key], jd: evtJd });
    }
  }
  candidates.sort((a, b) => a.jd - b.jd);
  const next = candidates[0];
  return { name: next.name, jd: next.jd, daysAway: next.jd - jd };
}

function moonPhaseInfo(jd) {
  const sunCoords    = sunPosition(jd);
  const moonCoords   = moonPosition(jd);
  const elongation   = mod360(moonCoords.ra - sunCoords.ra);
  const illumination = (1 - Math.cos(toRad(elongation))) / 2 * 100;
  const ageDays      = elongation / 360 * 29.53059;
  const NAMES   = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
                   'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const SYMBOLS = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const idx = Math.round(elongation / 45) % 8;
  return { elongation, illumination, phaseName: NAMES[idx], symbol: SYMBOLS[idx], ageDays };
}

//===========================================================
//  Moon Phase
//===========================================================

/**
 * Compute moon phase information from current JD.
 * @param {number} jd
 * @returns {{ elongation, illumination, phaseName, agedays, symbol }}
 */
function moonPhaseInfo(jd) {
  const sunCoords  = sunPosition(jd);
  const moonCoords = moonPosition(jd);
  const elongation = mod360(moonCoords.ra - sunCoords.ra);
  const illumination = (1 - Math.cos(toRad(elongation))) / 2 * 100;
  const ageDays = elongation / 360 * 29.53059;

  const PHASE_NAMES = [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous',  'Last Quarter',  'Waning Crescent',
  ];
  const PHASE_SYMBOLS = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const idx = Math.round(elongation / 45) % 8;

  return {
    elongation,
    illumination,
    phaseName: PHASE_NAMES[idx],
    symbol:    PHASE_SYMBOLS[idx],
    ageDays,
  };
}

//===========================================================
//  Equinox / Solstice
//===========================================================

/**
 * Find the next equinox or solstice after a given JD.
 * Returns { name, jd, daysAway }.
 */
function nextSeasonalEvent(jd) {
  const now  = new Date((jd - 2440587.5) * 86400000);
  const year = now.getUTCFullYear();

  const LABELS = {
    spring: 'Spring Equinox',
    summer: 'Summer Solstice',
    autumn: 'Autumn Equinox',
    winter: 'Winter Solstice',
  };

  // check this year and next to always find the true next event
  const candidates = [];
  for (const y of [year, year + 1]) {
    const evts = seasonalEvents(y);
    for (const [key, evtJd] of Object.entries(evts)) {
      if (evtJd > jd) candidates.push({ name: LABELS[key], jd: evtJd });
    }
  }

  candidates.sort((a, b) => a.jd - b.jd);
  const next = candidates[0];
  return {
    name:     next.name,
    jd:       next.jd,
    daysAway: next.jd - jd,
  };
}

/**
 * Format a decimal hours UT value as a local time string,
 * accounting for the observer's UTC offset from their longitude.
 * Uses the browser's local timezone when lon is null.
 */
function hoursUTtoLocalString(hoursUT, now) {
  if (hoursUT === null) return '—';
  // Build a Date for today at hoursUT
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  d.setTime(d.getTime() + hoursUT * 3600000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format a days-away value as "Xd Yh" */
function formatCountdown(daysAway) {
  const totalMin = Math.round(daysAway * 24 * 60);
  const d  = Math.floor(totalMin / (60 * 24));
  const h  = Math.floor((totalMin % (60 * 24)) / 60);
  const m  = totalMin % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}


//===========================================================
//  USNO API — Rise/Set/Phase/Seasons
//===========================================================

const usnoCache = {
  rstt:    null,   // { key, data }  — data may be null on fetch failure
  seasons: null,   // { key, data }
};

/** YYYY-MM-DD from a real (non-offset) Date */
function dateStringReal() {
  return new Date().toISOString().slice(0, 10);
}

/** Browser's actual UTC offset in hours, DST-aware */
function browserTZOffset() {
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Fetch sun/moon rise-set + phase from USNO rstt/oneday.
 * Keyed on real today's date + rounded location — never uses toffset time.
 * Returns the inner data object, or null on failure.
 */
async function fetchUSNO_RSTT(lat, lon) {
  const tz      = browserTZOffset();
  const dateStr = dateStringReal();
  const key     = `${dateStr}|${lat.toFixed(1)}|${lon.toFixed(1)}|${tz}`;

  if (usnoCache.rstt?.key === key) return usnoCache.rstt.data;

  const url = `https://aa.usno.navy.mil/api/rstt/oneday`
            + `?date=${dateStr}`
            + `&coords=${lat.toFixed(4)},${lon.toFixed(4)}`
            + `&tz=${tz}`
            + `&ID=starchart`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.properties?.data ?? null;
    usnoCache.rstt = { key, data };
    console.log('USNO RSTT loaded:', data ? 'ok' : 'data null', url);
    return data;
  } catch (err) {
    console.warn('USNO RSTT fetch failed:', err, url);
    usnoCache.rstt = { key, data: null };
    return null;
  }
}

/**
 * Fetch equinox/solstice dates for current + next year.
 * Returns flat array of event objects or [] on failure.
 */
async function fetchUSNO_Seasons() {
  const tz   = browserTZOffset();
  const year = new Date().getUTCFullYear();
  const key  = `${year}|${tz}`;

  if (usnoCache.seasons?.key === key) return usnoCache.seasons.data;

  try {
    const urls = [year, year + 1].map(y =>
      `https://aa.usno.navy.mil/api/seasons?year=${y}&tz=${tz}&ID=starchart`
    );
    const jsons = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
    const data  = jsons.flatMap(j => j?.data ?? []);
    usnoCache.seasons = { key, data };
    console.log('USNO Seasons loaded:', data.length, 'events');
    return data;
  } catch (err) {
    console.warn('USNO Seasons fetch failed:', err);
    usnoCache.seasons = { key, data: [] };
    return [];
  }
}

//===========================================================
//  Parse helpers
//===========================================================

/** Extract time string for phen code from sundata/moondata array */
function usnoTime(arr, phen) {
  return arr?.find(e => e.phen === phen)?.time ?? '—';
}

/** Build phase display from USNO data object */
function usnoPhaseDisplay(data) {
  const SYMBOLS = {
    'New Moon':        '🌑', 'Waxing Crescent': '🌒',
    'First Quarter':   '🌓', 'Waxing Gibbous':  '🌔',
    'Full Moon':       '🌕', 'Waning Gibbous':  '🌖',
    'Last Quarter':    '🌗', 'Waning Crescent': '🌘',
  };
  const phaseName    = data?.curphase   ?? '—';
  const illumination = data?.fracillum  ?? '—';   // already "16%"
  const symbol       = SYMBOLS[phaseName] ?? '🌙';
  const cp           = data?.closestphase;
  const nextPhase    = cp
    ? `Next: ${cp.phase} ${cp.month}/${cp.day} ${cp.time}`
    : '';
  return { phaseName, symbol, illumination, nextPhase };
}

/** Find the next equinox/solstice from USNO seasons array after now */
function nextUSNOEvent(seasonsData, now) {
  if (!seasonsData?.length) return null;

  const candidates = seasonsData
    .filter(e => e.phenom === 'Equinox' || e.phenom === 'Solstice')
    .map(e => {
      const [h, m] = (e.time ?? '00:00').split(':').map(Number);
      const dt = new Date(e.year, e.month - 1, e.day, h, m);
      return { phenom: e.phenom, month: e.month, dt };
    })
    .filter(e => e.dt > now)
    .sort((a, b) => a.dt - b.dt);

  if (!candidates.length) return null;
  const next = candidates[0];

  const name = next.phenom === 'Equinox'
    ? (next.month <= 6 ? 'Spring Equinox' : 'Autumn Equinox')
    : (next.month <= 6 ? 'Summer Solstice' : 'Winter Solstice');

  const ms       = next.dt - now;
  const totalMin = Math.round(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const countdown = d > 0 ? `${d}d ${h}h ${m}m`
                  : h > 0 ? `${h}h ${m}m`
                  :         `${m}m`;
  const dateStr = next.dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
                + ' ' + next.dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return { name, dateStr, countdown };
}

//===========================================================
//  Astro info state
//===========================================================
const astroInfo = {
  rstt:     null,
  seasons:  [],
  lastKey:  null,
  fetching: false,

  /**
   * Fire-and-forget refresh. Uses REAL current date/location,
   * never the toffset-adjusted time. Calls redrawFn once on completion.
   */
  async refresh(lat, lon, redrawFn) {
    const key = `${dateStringReal()}|${lat.toFixed(1)}|${lon.toFixed(1)}`;
    if (key === this.lastKey || this.fetching) return;
    this.lastKey  = key;
    this.fetching = true;

    const [rstt, seasons] = await Promise.all([
      fetchUSNO_RSTT(lat, lon),
      fetchUSNO_Seasons(),
    ]);

    this.rstt     = rstt;       // may be null on failure
    this.seasons  = seasons;    // may be [] on failure
    this.fetching = false;
    redrawFn();
  },
};

//===========================================================
//  Astro Info Overlay
//===========================================================

function drawAstroInfoOverlay(ctx, jd, lat, lon, now, W, H) {

  // fire background refresh using real lat/lon, real time
  // redraw is the global redraw function defined in wiring section
  astroInfo.refresh(lat, lon, redraw);

  // ── assemble display values ──
  let sunRise, sunSet, moonRise, moonSet, astroBegin, astroEnd, phaseDisp, nextEv;

  // FIX: check astroInfo.rstt (not null) AND that its .data is not null
  if (astroInfo.rstt !== null && astroInfo.rstt !== undefined) {
    const d  = astroInfo.rstt;   // may be null if fetch failed
    if (d && d.sundata) {
      sunRise  = usnoTime(d.sundata, 'Rise');
      sunSet   = usnoTime(d.sundata, 'Set');
      moonRise = usnoTime(d.moondata, 'Rise');
      moonSet  = usnoTime(d.moondata, 'Set');
      phaseDisp = usnoPhaseDisplay(d);
      // astronomical twilight always computed locally
      const at = astronomicalTwilight(jd, lat, lon);
      astroBegin = at.begin;
      astroEnd   = at.end;
    } else {
      // fetch completed but returned null — USNO unavailable
      sunRise = sunSet = moonRise = moonSet = 'n/a';
      phaseDisp = usnoPhaseDisplay(null);
    }
  } else {
    // not yet fetched — show local fallback
    sunRise = sunSet = moonRise = moonSet = astroBegin = astroEnd = '…';
    const lp  = moonPhaseInfo(jd);
    phaseDisp = {
      phaseName:    lp.phaseName,
      symbol:       lp.symbol,
      illumination: lp.illumination.toFixed(0) + '%',
      nextPhase:    '(loading…)',
    };
  }

  // countdown — use USNO seasons if available, else local Meeus
  nextEv = nextUSNOEvent(astroInfo.seasons, now);
  if (!nextEv) {
    const ev = nextSeasonalEvent(jd);
    nextEv = {
      name:      ev.name,
      dateStr:   '',
      countdown: formatCountdown(ev.daysAway),
    };
  }

  // ── build lines ──
  const lines = [
    { label: 'Moon:',      value: `${phaseDisp.symbol} ${phaseDisp.phaseName}  ${phaseDisp.illumination}` },
    { label: '',           value: phaseDisp.nextPhase },
    { label: 'Moonrise:',  value: moonRise },
    { label: 'Moonset:',   value: moonSet  },
    { label: 'Sunrise:',   value: sunRise  },
    { label: 'Sunset:',    value: sunSet   },
    { label: 'Astro Dawn:', value: astroBegin },   // ← add
    { label: 'Astro Dusk:', value: astroEnd   },   // ← add
    { label: nextEv.name + ':', value: nextEv.countdown },
    { label: '',           value: nextEv.dateStr },
  ].filter(l => l.label || l.value);

  if (astroInfo.fetching) lines.push({ label: '', value: '⟳ fetching USNO…' });

  // ── draw box ──
  const pad  = 8;
  const lh   = 17;
  const boxW = 255;
  const boxH = lines.length * lh + pad * 2;
  const bx   = pad;
  const by   = H - boxH - pad;

  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 18, 0.70)';
  ctx.beginPath();
  ctx.roundRect(bx - pad / 2, by, boxW, boxH, 4);
  ctx.fill();

  ctx.font         = '11px monospace';
  ctx.textBaseline = 'middle';

  lines.forEach(({ label, value }, i) => {
    const y = by + pad + i * lh + lh / 2;
    if (label) {
      ctx.fillStyle = darkRed;
      ctx.textAlign = 'left';
      ctx.fillText(label, bx, y);
    }
    ctx.fillStyle = lightRed;
    ctx.textAlign = 'left';
    ctx.fillText(value, bx + (label ? 95 : 4), y);
  });

  ctx.restore();
}

/** Format a days-away value as countdown string */
function formatCountdown(daysAway) {
  const totalMin = Math.round(daysAway * 24 * 60);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  return d > 0 ? `${d}d ${h}h ${m}m`
       : h > 0 ? `${h}h ${m}m`
       :         `${m}m`;
}

//===========================================================
//  Main Visual - Sky Plot
//===========================================================
  
/**
 * Draw everything onto the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {{ lat, lon, toffset }} params
 * @param {string|null} hoveredStar   Name of hovered star, or null
 * @param {string|null} hoveredSat    Name of hovered satellite, or null
 * @returns {{ stars: Array, sats: Array }}
 */
function drawSkyPlot(canvas, params, hoveredStar = null, hoveredSat = null) {
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
  
    //=== Nightsky background gradient ===//
    const skyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    if (nightMode) {
      skyGrad.addColorStop(0,   '#0d0000');
      skyGrad.addColorStop(0.7, '#070000');
      skyGrad.addColorStop(1,   '#020000');
    } else {
      skyGrad.addColorStop(0,   '#0d0d22');
      skyGrad.addColorStop(0.7, '#070714');
      skyGrad.addColorStop(1,   '#020208');
    }
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
  
    //===  Sun and Moon ===//

    // store jd on ctx so drawMoon can access it for phase calc
    // ctx._jd = jd;

    // after stars, before time overlay:
    drawSolarSystem(ctx, jd, lst, lat, cx, cy, R);

    // after drawSolarSystem(ctx, jd, lst, lat, cx, cy, R);
    drawPlanets(ctx, jd, lst, lat, cx, cy, R);

    //===  Zodiac References ===//

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

    //=== Draw Reference Planes ===//
    drawGalacticPlane(ctx, lst, lat, cx, cy, R);
    drawEcliptic(ctx, lst, lat, cx, cy, R);

    //=== Draw Satellites ===//
    const projSats = drawSatellites(ctx, now, lat, lon, cx, cy, R, hoveredSat);

    //=== Project & Draw Stars ===//
    const projected = [];
  
    STARS.forEach(star => {
        const { alt, az } = equatorialToHorizontal(star.ra, star.dec, lst, lat);
        if (alt < 0) return;   // below horizon — skip
        const { x, y } = polarProject(az, alt, cx, cy, R);
        projected.push({ ...star, alt, az, px: x, py: y });
        });

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
  
    //=== Hover Highlight Star ===//
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

    // ── Astro info overlay (lower-left) ──
    drawAstroInfoOverlay(ctx, jd, lat, lon, now, W, H);

    // ── Time overlay (drawn last so it sits on top) ──
    drawTimeOverlay(ctx, lst, now);

    // ── Night mode red wash over sky circle ──
    if (nightMode) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(60, 0, 0, 0.25)';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    return { stars: projected, sats: projSats };
    }
  
//===========================================================
//  Interactive Display Event Listeners
//===========================================================

const canvas = document.getElementById('sky');
let hoveredStar    = null;
let hoveredSat     = null;
let lastProjected  = { stars: [], sats: [] };

//=== Display Star Information ===//

function getParams() {
    return {
      lat:     parseFloat(document.getElementById('lat').value)    || 0,
      lon:     parseFloat(document.getElementById('lon').value)    || 0,
      toffset: parseFloat(document.getElementById('toffset').value)|| 0,
    };
    }
  
function redraw() {
  lastProjected = drawSkyPlot(canvas, getParams(), hoveredStar, hoveredSat);
  }

canvas.addEventListener('mousemove', e => {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top)  * scaleY;

  // hit-test stars
  let foundStar = null, minStarD = Infinity;
  lastProjected.stars.forEach(s => {
    const d = Math.hypot(s.px - mx, s.py - my);
    if (d < 22 && d < minStarD) { minStarD = d; foundStar = s; }
  });

  // hit-test satellites (slightly larger hit radius — dots are small)
  let foundSat = null, minSatD = Infinity;
  lastProjected.sats.forEach(s => {
    const d = Math.hypot(s.px - mx, s.py - my);
    if (d < 18 && d < minSatD) { minSatD = d; foundSat = s; }
  });

  // satellites take priority over stars when both are close
  if (foundSat && (!foundStar || minSatD <= minStarD)) {
    hoveredStar = null;
    hoveredSat  = foundSat.name;
    document.getElementById('info').textContent =
      `${foundSat.name}  |  Az: ${foundSat.az.toFixed(1)}° E of N,  ` +
      `Alt: ${foundSat.alt.toFixed(1)}°  |  ` +
      `Range: ${Math.round(foundSat.range)} km,  ` +
      `Orbit alt: ${Math.round(foundSat.altKm)} km`;
  } else if (foundStar) {
    hoveredStar = foundStar.name;
    hoveredSat  = null;
    document.getElementById('info').textContent =
      `${foundStar.name}  |  Az: ${foundStar.az.toFixed(1)}° E of N,  ` +
      `Alt: ${foundStar.alt.toFixed(1)}°  |  mag ${foundStar.mag}  |  ` +
      `RA: ${foundStar.ra.toFixed(2)}°,  Dec: ${foundStar.dec.toFixed(2)}°`;
  } else {
    hoveredStar = null;
    hoveredSat  = null;
    document.getElementById('info').textContent = 'Hover over a star or satellite to see details';
  }

  redraw();
});
  
['lat', 'lon', 'toffset'].forEach(id => {
document.getElementById(id).addEventListener('input', redraw);
});

// document.getElementById('sat-group').addEventListener('change', async e => {
//   const group = e.target.value;
//   if (!group) {
//     satManager.satellites = [];
//     satManager.activeGroup = '';
//     redraw();
//     return;
//   }
//   await satManager.loadGroup(group);
//   redraw();
// });

// // initial Satellite, load ISS
// satManager.loadGroup('ISS');

// read currently checked groups from the checkboxes
function getCheckedGroups() {
  return [...document.querySelectorAll('#sat-group-options input[type=checkbox]:checked')]
    .map(cb => cb.value);
}

// wire up each checkbox
document.querySelectorAll('#sat-group-options input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', async () => {
    const groups = getCheckedGroups();
    await satManager.setGroups(groups);
    redraw();
  });
});

// wire up each time slider
// document.getElementById('toffset').addEventListener('input', () => {
//   const v = parseFloat(document.getElementById('toffset').value);
//   document.getElementById('toffset-val').textContent = v.toFixed(1) + ' h';
//   redraw();
// });

// initial load — whatever is checked on page load (ISS by default)
satManager.setGroups(getCheckedGroups()).then(redraw);

// ── Night mode toggle ──
const nightBtn = document.getElementById('night-mode-btn');
if (nightBtn) {
  nightBtn.addEventListener('click', () => {
    nightMode = !nightMode;
    galCache.key = null;   // force galactic plane redraw with new colors
    nightBtn.textContent = nightMode ? '☀ Day Mode' : '🔴 Night Mode';
    document.body.classList.toggle('night-mode', nightMode);
    redraw();
  });
}

// Refresher
redraw();
setInterval(redraw, 1000);  // auto-refresh every 1 s