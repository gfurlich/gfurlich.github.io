//===========================================================
//
//  Javascript Top-Down Solar System for Website
//
//  View: looking down on the ecliptic from the north ecliptic pole.
//  Ecliptic longitude 0° (vernal equinox ♈) points right and
//  increases counter-clockwise, as planets orbit.
//
//===========================================================

//===========================================================
//  Math helpers
//===========================================================
const toRad  = d => d * Math.PI / 180;
const toDeg  = r => r * 180 / Math.PI;
const mod360 = x => ((x % 360) + 360) % 360;

const J2000            = 2451545.0;
const K_DEG            = 0.9856076686;   // Gaussian constant, deg/day at a = 1 AU
const LIGHT_MIN_PER_AU = 8.316746;

const julianDate = ms => ms / 86400000 + 2440587.5;

//===========================================================
//  Planet orbital elements at J2000.0 and rates per Julian century
//  Source: JPL "Keplerian Elements for Approximate Positions of the
//  Major Planets", Table 1 (valid 1800 AD – 2050 AD).
//  Pluto is included here too (same table).
//===========================================================
const PLANET_ELEMENTS = {
  Mercury: { a0:0.38709927, ad:0.00000037,  e0:0.20563593, ed:0.00001906,
             I0:7.00497902, Id:-0.00594749, L0:252.25032350, Ld:149472.67411175,
             lp0:77.45779628, lpd:0.16047689, Om0:48.33076593, Omd:-0.12534081 },
  Venus:   { a0:0.72333566, ad:0.00000390,  e0:0.00677672, ed:-0.00004107,
             I0:3.39467605, Id:-0.00078890, L0:181.97909950, Ld:58517.81538729,
             lp0:131.60246718, lpd:0.00268329, Om0:76.67984255, Omd:-0.27769418 },
  Earth:   { a0:1.00000261, ad:0.00000562,  e0:0.01671022, ed:-0.00003804,
             I0:0.00005,    Id:-0.01369,    L0:100.46457166, Ld:35999.37244981,
             lp0:102.93768193, lpd:0.32327364, Om0:-11.26064, Omd:-0.00503616 },
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
  Pluto:   { a0:39.48211675, ad:-0.00031596, e0:0.24882730, ed:0.00005170,
             I0:17.14001206, Id:0.00004818, L0:238.92903833, Ld:145.20780515,
             lp0:224.06891629, lpd:-0.04062942, Om0:110.30393684, Omd:-0.01183482 },
};

//=== Planet visual style: [r,g,b], pixel radius, symbol ===//
const PLANET_STYLE = {
  Mercury: { rgb:[180,170,160], r:3.5, symbol:'☿' },
  Venus:   { rgb:[240,220,160], r:5,   symbol:'♀' },
  Earth:   { rgb:[100,160,255], r:5,   symbol:'♁' },
  Mars:    { rgb:[210, 90, 60], r:4.5, symbol:'♂' },
  Jupiter: { rgb:[220,190,140], r:8,   symbol:'♃' },
  Saturn:  { rgb:[210,195,140], r:7,   symbol:'♄' },
  Uranus:  { rgb:[160,220,230], r:5.5, symbol:'⛢' },
  Neptune: { rgb:[100,140,230], r:5.5, symbol:'♆' },
  Pluto:   { rgb:[205,180,160], r:3.5, symbol:'♇' },
};

//===========================================================
//  Planetary moons (shown in the hover text; Earth uses the live Moon model)
//
//  Counts change as new small moons are announced, so update `count`
//  and `asOf` occasionally. Counts: NASA Space Place / Minor Planet
//  Center announcements, 2026. Diameters are mean values in km.
//===========================================================
const PLANET_MOONS = {
  Mercury: { count: 0 },
  Venus:   { count: 0 },
  Mars:    { count: 2,   asOf: '2026',
             major: [['Phobos', '22 km'], ['Deimos', '12 km']] },
  Jupiter: { count: 115, asOf: 'Apr 2026',
             major: [['Ganymede', '5,268 km, largest moon in the Solar System'],
                     ['Callisto', '4,821 km'], ['Io', '3,643 km'], ['Europa', '3,122 km']] },
  Saturn:  { count: 293, asOf: 'Jun 2026',
             major: [['Titan', '5,150 km, thick atmosphere'], ['Rhea', '1,527 km'],
                     ['Iapetus', '1,469 km'], ['Dione', '1,123 km'], ['Tethys', '1,062 km'],
                     ['Enceladus', '504 km'], ['Mimas', '396 km']] },
  Uranus:  { count: 29,  asOf: '2026',
             major: [['Titania', '1,577 km'], ['Oberon', '1,523 km'], ['Umbriel', '1,169 km'],
                     ['Ariel', '1,158 km'], ['Miranda', '472 km']] },
  Neptune: { count: 16,  asOf: '2026',
             major: [['Triton', '2,707 km, retrograde orbit'], ['Proteus', '420 km'], ['Nereid', '340 km']] },
  Pluto:   { count: 5,   asOf: '2026',
             major: [['Charon', '1,212 km, about half Pluto’s width'], ['Nix', '~50 km'],
                     ['Hydra', '~50 km'], ['Kerberos', '~12 km'], ['Styx', '~10 km']] },
};

function planetMoonsText(name) {
  const m = PLANET_MOONS[name];
  if (!m) return '';
  if (m.count === 0) return 'Moons: none';
  const head = `Moons: ${m.count} known (${m.asOf})`;
  const list = m.major.map(([n, d]) => `${n} (${d})`).join(', ');
  return `${head}  |  Major: ${list}`;
}

//===========================================================
//  Minor bodies (dwarf planets, asteroids, comets)
//
//  Elements are fetched live from the JPL Small-Body Database API
//  (ecliptic J2000, osculating). `fallback` is used if the fetch
//  fails or is blocked; these are approximate (epoch JD 2458600.5).
//  Bodies with no fallback are simply skipped when the fetch fails.
//===========================================================
const MINOR_BODIES = [
  { name:'Ceres',    sstr:'1',      rgb:[200,200,200], note:'dwarf planet · asteroid belt',
    fallback:{ a:2.7691652, e:0.0760091, I:10.59407, Om:80.30553, w:73.59769, M0:77.3721, epoch:2458600.5 } },
  { name:'Vesta',    sstr:'4',      rgb:[230,200,140], note:'asteroid' },
  { name:'Pallas',   sstr:'2',      rgb:[190,210,230], note:'asteroid' },
  { name:'Hygiea',   sstr:'10',     rgb:[180,160,140], note:'asteroid' },
  { name:'Eros',     sstr:'433',    rgb:[240,170,120], note:'near-Earth asteroid' },
  { name:'Apophis',  sstr:'99942',  rgb:[255,120,120], note:'near-Earth asteroid' },
  { name:'Chiron',   sstr:'2060',   rgb:[170,200,170], note:'centaur' },
  { name:'Haumea',   sstr:'136108', rgb:[210,225,240], note:'dwarf planet' },
  { name:'Makemake', sstr:'136472', rgb:[225,170,130], note:'dwarf planet',
    fallback:{ a:45.43, e:0.1559, I:28.98, Om:79.62, w:294.84, M0:165.5, epoch:2458600.5 } },
  { name:'Eris',     sstr:'136199', rgb:[230,230,230], note:'dwarf planet',
    fallback:{ a:67.864, e:0.4407, I:44.04, Om:35.95, w:151.64, M0:205.8, epoch:2458600.5 } },
  { name:'Sedna',    sstr:'90377',  rgb:[220,100,80],  note:'extreme TNO' },
  { name:'Halley',   sstr:'1P',     rgb:[150,230,255], note:'comet',
    // Perihelion 1986-Feb-09 (JD 2446467.4); epoch is the perihelion time, M0 = 0.
    fallback:{ a:17.834, e:0.96714, I:162.26, Om:58.42, w:111.33, M0:0, epoch:2446467.4 } },
];

//===========================================================
//  Kepler solver + orbital geometry
//===========================================================

/** Solve Kepler's equation for eccentric anomaly E (radians). M in degrees. */
function solveKepler(Mdeg, e) {
  let M = toRad(mod360(Mdeg));
  if (M > Math.PI) M -= 2 * Math.PI;                    // [-π, π]
  let E = e < 0.8 ? M + e * Math.sin(M) : (M >= 0 ? Math.PI : -Math.PI);
  for (let i = 0; i < 50; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/** Position in heliocentric ecliptic cartesian coords (AU) from elements + eccentric anomaly. */
function posFromE(el, E) {
  const { a, e, I, w, Om } = el;
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const IR = toRad(I), wR = toRad(w), OmR = toRad(Om);
  const cOs = Math.cos(OmR), sOs = Math.sin(OmR);
  const cI  = Math.cos(IR),  sI  = Math.sin(IR);
  const cw  = Math.cos(wR),  sw  = Math.sin(wR);

  return {
    X: (cOs*cw - sOs*sw*cI)*xp + (-cOs*sw - sOs*cw*cI)*yp,
    Y: (sOs*cw + cOs*sw*cI)*xp + (-sOs*sw + cOs*cw*cI)*yp,
    Z: (sw*sI)*xp + (cw*sI)*yp,
  };
}

/** Instantaneous Keplerian elements of a planet at T Julian centuries from J2000. */
function planetElementsAt(el, T) {
  const a  = el.a0  + el.ad  * T;
  const e  = el.e0  + el.ed  * T;
  const I  = el.I0  + el.Id  * T;
  const L  = mod360(el.L0  + el.Ld  * T);
  const lp = mod360(el.lp0 + el.lpd * T);
  const Om = mod360(el.Om0 + el.Omd * T);
  return { a, e, I, Om, w: mod360(lp - Om), M: mod360(L - lp) };
}

/** Instantaneous elements of a fixed-element minor body at Julian date jd. */
function minorElementsAt(m, jd) {
  const n = m.n ?? K_DEG / Math.pow(m.a, 1.5);          // deg/day
  return { a:m.a, e:m.e, I:m.I, Om:m.Om, w:m.w, M: mod360(m.M0 + n * (jd - m.epoch)) };
}

/** Heliocentric position for a body record at jd. */
function bodyElements(body, jd) {
  return body.kind === 'planet'
    ? planetElementsAt(body.el, (jd - J2000) / 36525)
    : minorElementsAt(body.orbit, jd);
}

function bodyPosition(body, jd) {
  const el = bodyElements(body, jd);
  return { el, ...posFromE(el, solveKepler(el.M, el.e)) };
}

/** Sample the full orbit ellipse (heliocentric X,Y) at the given elements. */
function orbitPoints(el, N = 180) {
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const { X, Y } = posFromE(el, (k / N) * 2 * Math.PI);
    pts.push([X, Y]);
  }
  return pts;
}

//===========================================================
//  Moon (low-precision, ~0.3° / ~0.5% accuracy)
//===========================================================
const AU_KM     = 149597870.7;
const MOON_MEAN_KM = 384400;

/** Geocentric ecliptic position of the Moon + phase info. `earth` = heliocentric Earth {X,Y,Z}. */
function moonState(jd, earth) {
  const n  = jd - J2000;
  const L0 = mod360(218.316 + 13.176396 * n);   // mean longitude
  const M  = toRad(mod360(134.963 + 13.064993 * n));   // Moon mean anomaly
  const F  = toRad(mod360(93.272  + 13.229350 * n));   // argument of latitude
  const D  = toRad(mod360(297.850 + 12.190749 * n));   // mean elongation
  const Ms = toRad(mod360(357.528 + 0.9856003 * n));   // Sun mean anomaly

  const lon = mod360(L0
    + 6.289 * Math.sin(M)
    + 1.274 * Math.sin(2 * D - M)
    + 0.658 * Math.sin(2 * D)
    + 0.214 * Math.sin(2 * M)
    - 0.186 * Math.sin(Ms)
    - 0.114 * Math.sin(2 * F));
  const lat = 5.128 * Math.sin(F)
    + 0.281 * Math.sin(M + F)
    + 0.278 * Math.sin(M - F)
    + 0.173 * Math.sin(2 * D - F);
  const km = 385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M)
           - 2956 * Math.cos(2 * D) - 570 * Math.cos(2 * M);

  const d = km / AU_KM, lonR = toRad(lon), latR = toRad(lat);
  const geo = { X: d * Math.cos(latR) * Math.cos(lonR),
                Y: d * Math.cos(latR) * Math.sin(lonR),
                Z: d * Math.sin(latR) };

  // phase from Moon–Sun elongation (Sun's geocentric longitude = Earth's heliocentric longitude + 180°)
  const sunLon = mod360(toDeg(Math.atan2(earth.Y, earth.X)) + 180);
  const elong  = mod360(lon - sunLon);
  const NAMES  = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
                  'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const SYMS   = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const idx    = Math.round(elong / 45) % 8;

  return { geo, km, lon, lat, elong,
           illum: (1 - Math.cos(toRad(elong))) / 2 * 100,
           ageDays: elong / 360 * 29.53059,
           phaseName: NAMES[idx], symbol: SYMS[idx] };
}

function moonText(m) {
  return `Moon (${m.symbol} ${m.phaseName}, ${m.illum.toFixed(0)}% lit, age ${m.ageDays.toFixed(1)} d)  |  `
       + `${Math.round(m.km).toLocaleString()} km from Earth `
       + `(${(m.km / MOON_MEAN_KM).toFixed(2)}× mean distance, ${(m.km / 299792.458).toFixed(2)} light-sec)  |  `
       + `Ecl. lon ${m.lon.toFixed(1)}°, lat ${m.lat.toFixed(1)}°  |  Period 27.3 d`;
}

//===========================================================
//  Sun–Earth Lagrange points
//  μ = (M_earth + M_moon) / M_sun. L1/L2 use the Hill-radius series
//  r = R·(α ∓ α²/3 − α³/9), α = (μ/3)^(1/3); L3 sits at R(1 + 5μ/12)
//  opposite Earth; L4/L5 lead/trail Earth by 60° on the same orbit.
//===========================================================
const MU_EARTH_SUN = 3.0404234e-6;
const LAG_ALPHA    = Math.cbrt(MU_EARTH_SUN / 3);

const LAG_INFO = {
  L1: 'unstable · between Earth and Sun · e.g. SOHO, DSCOVR',
  L2: 'unstable · beyond Earth, away from Sun · e.g. JWST, Euclid',
  L3: 'unstable · on the far side of the Sun',
  L4: 'stable · leads Earth by 60°',
  L5: 'stable · trails Earth by 60°',
};

/** Heliocentric positions of L1–L5 given heliocentric Earth {X,Y,Z}. */
function lagrangePoints(E) {
  const al = LAG_ALPHA;
  const x1 = al - al * al / 3 - al * al * al / 9;
  const x2 = al + al * al / 3 - al * al * al / 9;
  const scale = k => ({ X: E.X * k, Y: E.Y * k, Z: E.Z * k });
  const rot = deg => {
    const c = Math.cos(toRad(deg)), s = Math.sin(toRad(deg));
    return { X: E.X * c - E.Y * s, Y: E.X * s + E.Y * c, Z: E.Z };
  };
  return {
    L1: scale(1 - x1),
    L2: scale(1 + x2),
    L3: scale(-(1 + 5 * MU_EARTH_SUN / 12)),
    L4: rot(+60),
    L5: rot(-60),
  };
}

function lagrangeText(name, pos, earth) {
  const rS = Math.hypot(pos.X, pos.Y, pos.Z);
  const dE = Math.hypot(pos.X - earth.X, pos.Y - earth.Y, pos.Z - earth.Z);
  const km = dE * AU_KM;
  const dStr = km < 1e7
    ? `${(km / 1e6).toFixed(3)} million km (${(km / MOON_MEAN_KM).toFixed(1)} lunar distances)`
    : `${dE.toFixed(3)} AU`;
  return `Sun–Earth ${name} (${LAG_INFO[name]})  |  ${dStr} from Earth  |  r = ${rS.toFixed(4)} AU from Sun`;
}

//===========================================================
//  Earth-neighborhood inset (rotating frame, Sun to the left)
//  Shows the Moon at its true position plus L1 and L2, which are
//  too close to Earth to separate on the main map.
//===========================================================
const INSET_SPAN = 0.0125;   // AU from Earth to the inset edge in the Sun–Earth view (≈ 4.9 lunar distances)
const INSET_EM_SPAN = 1.3;   // lunar distances from Earth to the inset edge in the Earth–Moon view

const LAG_RGB = [120, 230, 200];   // Sun–Earth points
const EM_RGB  = [190, 160, 255];   // Earth–Moon points

//===========================================================
//  Earth–Moon Lagrange points
//  Solve the circular restricted three-body collinear equation for
//  μ = M_moon / (M_earth + M_moon). Units: Earth–Moon distance = 1,
//  origin at the barycenter (Earth at −μ, Moon at 1−μ). Results are
//  shifted to Earth-centered factors of the instantaneous Moon vector.
//===========================================================
const EM_MU = 0.012150585;

const EM_FACTORS = (function () {
  const mu = EM_MU;
  const f = x => x - (1 - mu) * (x + mu) / Math.pow(Math.abs(x + mu), 3)
                   - mu * (x - 1 + mu) / Math.pow(Math.abs(x - 1 + mu), 3);
  const bisect = (lo, hi) => {
    let flo = f(lo);
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if ((fm < 0) === (flo < 0)) { lo = mid; flo = fm; } else hi = mid;
    }
    return (lo + hi) / 2;
  };
  return {
    L1: bisect(0.7, 1 - mu - 1e-4) + mu,    // ≈ 0.849 of the way from Earth to Moon
    L2: bisect(1 - mu + 1e-4, 1.5) + mu,    // ≈ 1.168
    L3: bisect(-1.5, -0.5) + mu,            // ≈ −0.993
  };
})();

const EM_LAG_INFO = {
  L1: 'unstable · between Earth and Moon',
  L2: 'unstable · beyond the Moon · e.g. Queqiao relay satellites',
  L3: 'unstable · opposite the Moon',
  L4: 'stable · leads the Moon by 60°',
  L5: 'stable · trails the Moon by 60°',
};

/** Geocentric ecliptic vectors of Earth–Moon L1–L5 given the Moon's geocentric vector. */
function earthMoonLagrange(m) {
  const scale = k => ({ X: m.X * k, Y: m.Y * k, Z: m.Z * k });
  const rot = deg => {
    const c = Math.cos(toRad(deg)), s = Math.sin(toRad(deg));
    return { X: m.X * c - m.Y * s, Y: m.X * s + m.Y * c, Z: m.Z };
  };
  return { L1: scale(EM_FACTORS.L1), L2: scale(EM_FACTORS.L2), L3: scale(EM_FACTORS.L3),
           L4: rot(+60), L5: rot(-60) };
}

function earthMoonLagrangeText(name, geo, moonGeo) {
  const kmE = Math.hypot(geo.X, geo.Y, geo.Z) * AU_KM;
  const kmM = Math.hypot(geo.X - moonGeo.X, geo.Y - moonGeo.Y, geo.Z - moonGeo.Z) * AU_KM;
  return `Earth–Moon ${name} (${EM_LAG_INFO[name]})  |  ${Math.round(kmE).toLocaleString()} km from Earth, `
       + `${Math.round(kmM).toLocaleString()} km from Moon`;
}

//===========================================================
//  Earth-neighborhood inset. Click it to switch between two views:
//   'sunEarth'  rotating Sun–Earth frame (Sun to the left): Moon at
//               its true position, Sun–Earth L1/L2, Earth–Moon points.
//   'earthMoon' rotating Earth–Moon frame (Moon fixed on the right):
//               the five Earth–Moon Lagrange points, clearly resolved.
//===========================================================
function buildInset(W, H, earth, moon, lag, showLag, showEM, view) {
  const RI = 90, cxI = RI + 6, cyI = H - RI - 6;   // lower-left corner
  const dMean = MOON_MEAN_KM / AU_KM;
  const rS = Math.hypot(earth.X, earth.Y);
  const s1 = [earth.X / rS, earth.Y / rS];           // Sun → Earth
  let toI, k, sunDir = null;

  if (view === 'earthMoon') {
    k = RI / (INSET_EM_SPAN * dMean);
    const mxy = Math.hypot(moon.geo.X, moon.geo.Y);
    const e1 = [moon.geo.X / mxy, moon.geo.Y / mxy];  // Earth → Moon (right)
    const e2 = [-e1[1], e1[0]];                        // direction of lunar motion (up)
    const off = 0.09 * dMean;                          // centre the circle between L3 and L2
    toI = v => [cxI + ((v.X * e1[0] + v.Y * e1[1]) - off) * k,
                cyI - (v.X * e2[0] + v.Y * e2[1]) * k];
    // direction to the Sun (Earth → Sun = −s1) in this frame: [right, up]
    sunDir = [-(s1[0] * e1[0] + s1[1] * e1[1]), -(s1[0] * e2[0] + s1[1] * e2[1])];
  } else {
    k = RI / INSET_SPAN;
    const e1 = s1, e2 = [-s1[1], s1[0]];
    toI = v => [cxI + (v.X * e1[0] + v.Y * e1[1]) * k,
                cyI - (v.X * e2[0] + v.Y * e2[1]) * k];
  }

  const [ex, ey] = toI({ X: 0, Y: 0, Z: 0 });
  const items = [];

  const [mx, my] = toI(moon.geo);
  items.push({ body:{ name:'Moon', kind:'inset' }, px:mx, py:my, text:moonText(moon),
               label:`Moon ${moon.symbol}`, showLabel:true, rgb:[225,230,240], shape:'disc' });

  if (showLag && view === 'sunEarth') {
    ['L1', 'L2'].forEach(name => {
      const geo = { X: lag[name].X - earth.X, Y: lag[name].Y - earth.Y, Z: lag[name].Z - earth.Z };
      const [x, y] = toI(geo);
      items.push({ body:{ name, kind:'inset' }, px:x, py:y, text:lagrangeText(name, lag[name], earth),
                   label:name, showLabel:true, rgb:LAG_RGB, shape:'diamond' });
    });
  }

  if (showEM) {
    const em = earthMoonLagrange(moon.geo);
    ['L1', 'L2', 'L3', 'L4', 'L5'].forEach(name => {
      const [x, y] = toI(em[name]);
      items.push({ body:{ name:'EM ' + name, kind:'inset' }, px:x, py:y,
                   text:earthMoonLagrangeText(name, em[name], moon.geo),
                   label:'EM ' + name,
                   showLabel: view === 'earthMoon' || ['L3', 'L4', 'L5'].includes(name),
                   rgb:EM_RGB, shape:'diamond' });
    });
  }
  return { cxI, cyI, RI, k, dMean, view, ex, ey, sunDir, items };
}

function drawDiamond(x, y, s, rgb) {
  ctx.fillStyle = col(rgb);
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y);
  ctx.closePath(); ctx.fill();
}

function drawInset(ins, hovered) {
  const { cxI, cyI, RI, k, dMean, view, ex, ey, sunDir, items } = ins;
  const isEM = view === 'earthMoon';

  ctx.save();
  ctx.beginPath(); ctx.arc(cxI, cyI, RI, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5, 5, 18, 0.85)'; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(cxI, cyI, RI, 0, Math.PI * 2); ctx.clip();

  // reference axis and mean lunar orbit (centred on Earth)
  ctx.lineWidth = 0.5; ctx.strokeStyle = darkRed();
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(cxI - RI, cyI); ctx.lineTo(cxI + RI, cyI); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(ex, ey, dMean * k, 0, Math.PI * 2); ctx.stroke();

  // direction to the Sun (Earth–Moon view only)
  if (isEM && sunDir) {
    const ux = sunDir[0], uy = -sunDir[1];
    ctx.strokeStyle = col([255, 210, 80], 0.8); ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cxI + ux * RI * 0.55, cyI + uy * RI * 0.55);
    ctx.lineTo(cxI + ux * RI * 0.76, cyI + uy * RI * 0.76);
    ctx.stroke();
    ctx.fillStyle = col([255, 210, 80]); ctx.font = '11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('☉', cxI + ux * RI * 0.86, cyI + uy * RI * 0.86);
  }

  // Earth
  ctx.fillStyle = col(PLANET_STYLE.Earth.rgb);
  ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();

  // items
  ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  items.forEach(it => {
    if (it.shape === 'diamond') drawDiamond(it.px, it.py, 3.5, it.rgb);
    else {
      ctx.fillStyle = col(it.rgb);
      ctx.beginPath(); ctx.arc(it.px, it.py, isEM ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
    }
    if (hovered === it) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(it.px, it.py, 8, 0, Math.PI * 2); ctx.stroke();
    }
    if (it.showLabel) {
      ctx.fillStyle = col(it.rgb);
      ctx.fillText(it.label, it.px + 6, it.py - 7);
    }
  });
  ctx.restore();

  ctx.beginPath(); ctx.arc(cxI, cyI, RI, 0, Math.PI * 2);
  ctx.strokeStyle = lightRed(); ctx.lineWidth = 1; ctx.stroke();

  ctx.font = '10px sans-serif'; ctx.fillStyle = lightRed(); ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  if (isEM) {
    ctx.fillText(`Moon fixed · edge ≈ ${INSET_EM_SPAN} lunar dist.`, cxI, cyI - RI - 12);
    ctx.fillText('Earth–Moon frame', cxI, cyI - RI - 25);
    ctx.fillText('lunar motion ↑', cxI, cyI - RI + 12);
  } else {
    ctx.fillText(`edge ≈ ${(INSET_SPAN * AU_KM / MOON_MEAN_KM).toFixed(1)} lunar dist.`, cxI, cyI - RI - 12);
    ctx.fillText('Earth neighborhood', cxI, cyI - RI - 25);
    ctx.fillText('orbital motion ↑', cxI, cyI - RI + 12);
    ctx.textAlign = 'left'; ctx.fillText('← Sun', cxI - RI + 5, cyI + 10);
    ctx.textAlign = 'center';
  }
  ctx.font = '9px sans-serif';
  ctx.fillText('click: switch', cxI, cyI + RI - 9);
  ctx.restore();
}

//===========================================================
//  Body records
//===========================================================
const planets = Object.keys(PLANET_ELEMENTS).map(name => ({
  name, kind:'planet', el:PLANET_ELEMENTS[name], style:PLANET_STYLE[name],
}));

const minors = MINOR_BODIES.map(def => ({
  name:def.name, kind:'minor', rgb:def.rgb, note:def.note, sstr:def.sstr,
  orbit: def.fallback ? { ...def.fallback } : null,
  source: def.fallback ? 'approximate fallback' : null,
}));

//===========================================================
//  JPL Small-Body Database fetch (with localStorage cache)
//===========================================================
const SBDB_MAX_AGE = 30 * 86400 * 1000;   // osculating elements drift slowly; 30 days is plenty

async function fetchSBDB(sstr) {
  const cacheKey = `sbdb_${sstr}`;
  try {
    const c = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (c && Date.now() - c.t < SBDB_MAX_AGE) return c.orbit;
  } catch (e) { /* ignore storage errors */ }

  const res = await fetch(`https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(sstr)}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  if (!j.orbit || !j.orbit.elements) throw new Error('no orbit');

  const el = {};
  j.orbit.elements.forEach(x => { el[x.name] = parseFloat(x.value); });
  if (!(el.a > 0) || !(el.e >= 0 && el.e < 1)) throw new Error('unbound or invalid orbit');

  const orbit = { a:el.a, e:el.e, I:el.i, Om:el.om, w:el.w, n:isFinite(el.n) ? el.n : undefined };
  if (isFinite(el.ma)) {                       // asteroid: mean anomaly at epoch
    orbit.M0    = el.ma;
    orbit.epoch = parseFloat(j.orbit.epoch);
  } else if (isFinite(el.tp)) {                // comet: time of perihelion
    orbit.M0    = 0;
    orbit.epoch = el.tp;
  } else throw new Error('no anomaly');

  try { localStorage.setItem(cacheKey, JSON.stringify({ t:Date.now(), orbit })); } catch (e) {}
  return orbit;
}

const sbdbStatus = { pending: minors.length, ok: 0, failed: 0 };

minors.forEach(m => {
  fetchSBDB(m.sstr)
    .then(orbit => { m.orbit = orbit; m.source = 'JPL SBDB'; m._orbitCache = null; sbdbStatus.ok++; })
    .catch(err  => { console.warn(`SBDB fetch failed for ${m.name}:`, err); sbdbStatus.failed++; })
    .finally(()  => { sbdbStatus.pending--; });
});

//===========================================================
//  Particle populations (asteroid belt, Trojans, Kuiper belt)
//  Randomly generated once with a seeded PRNG, then propagated
//  with real Kepler motion so they orbit at the correct rates.
//===========================================================
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGroup(count, seed, gen) {
  const rand  = mulberry32(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
  const g = {
    count,
    a:  new Float64Array(count), e:   new Float64Array(count),
    b:  new Float64Array(count),                       // a·sqrt(1-e²)
    n:  new Float64Array(count), M0:  new Float64Array(count),
    lock: new Float64Array(count),                     // 1 = mean longitude locked to Jupiter
    Px: new Float64Array(count), Py:  new Float64Array(count),
    Qx: new Float64Array(count), Qy:  new Float64Array(count),
  };
  for (let i = 0; i < count; i++) {
    const p = gen(rand, gauss, i);
    const IR = toRad(p.I), OmR = toRad(p.Om), wR = toRad(p.w);
    const cOs = Math.cos(OmR), sOs = Math.sin(OmR), cI = Math.cos(IR);
    const cw = Math.cos(wR),   sw = Math.sin(wR);
    g.a[i]  = p.a;
    g.e[i]  = p.e;
    g.b[i]  = p.a * Math.sqrt(1 - p.e * p.e);
    g.n[i]  = p.lock ? 0 : K_DEG / Math.pow(p.a, 1.5);
    g.M0[i] = p.lock ? p.off - (p.Om + p.w) : p.M0;
    g.lock[i] = p.lock ? 1 : 0;
    g.Px[i] = cOs*cw - sOs*sw*cI;
    g.Py[i] = sOs*cw + cOs*sw*cI;
    g.Qx[i] = -cOs*sw - sOs*cw*cI;
    g.Qy[i] = -sOs*sw + cOs*cw*cI;
  }
  return g;
}

// Main asteroid belt with Kirkwood gaps (3:1, 5:2, 7:3, 2:1 resonances with Jupiter)
const KIRKWOOD = [2.50, 2.82, 2.95, 3.27];
const beltGroup = makeGroup(3000, 101, (rand, gauss) => {
  let a;
  do { a = 2.15 + (rand() + rand() + rand()) / 3 * 1.2; }
  while (KIRKWOOD.some(g => Math.abs(a - g) < 0.03));
  return {
    a, e: Math.min(0.35, Math.abs(gauss() * 0.07 + 0.08)),
    I: Math.abs(gauss() * 7), Om: rand() * 360, w: rand() * 360, M0: rand() * 360,
  };
});

// Jupiter Trojans: L4 leads by ~60°, L5 trails by ~60° in mean longitude
const trojanGroup = makeGroup(700, 202, (rand, gauss, i) => ({
  a: 5.2 + gauss() * 0.08, e: Math.abs(gauss() * 0.06),
  I: Math.abs(gauss() * 10), Om: rand() * 360, w: rand() * 360,
  lock: true, off: (i % 2 ? 60 : -60) + gauss() * 12,
}));

// Kuiper belt: classical (cold + hot), Plutinos (3:2 with Neptune) and a thin scattered disk
const kuiperGroup = makeGroup(2400, 303, (rand, gauss, i) => {
  let a, e, I;
  if (i < 1500)      { a = 41.5 + rand() * 6.5;   e = Math.abs(gauss() * 0.05) + 0.01; I = Math.abs(gauss() * (i % 3 ? 3 : 10)); }
  else if (i < 2100) { a = 39.4 + gauss() * 0.3;  e = 0.10 + rand() * 0.15;            I = Math.abs(gauss() * 10); }
  else               { a = 50 + rand() * 50;      e = 0.25 + rand() * 0.35;            I = Math.abs(gauss() * 15); }
  return { a, e, I, Om: rand() * 360, w: rand() * 360, M0: rand() * 360 };
});

//===========================================================
//  Display Colors + Night Mode (same scheme as the star chart)
//===========================================================
let nightMode = false;
const darkRed  = () => nightMode ? 'rgba(120, 0, 0, 0.85)'   : 'rgba(100, 7, 7, 0.71)';
const lightRed = () => nightMode ? 'rgba(180, 0, 0, 0.70)'   : 'rgba(226, 29, 29, 0.42)';

/** [r,g,b] + alpha → CSS color; in night mode everything collapses to red luminance. */
function col(rgb, a = 1) {
  if (!nightMode) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
  const L = 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2];
  return `rgba(${Math.round(60 + L * 0.7)},0,0,${a})`;
}

//===========================================================
//  State + controls
//===========================================================
const canvas = document.getElementById('solar');
const ctx    = canvas.getContext('2d');

const state = {
  simMs:   Date.now(),
  playing: true,
  speed:   10,                 // days per real second
  viewAU:  60,
  scale:   'sqrt',
  lastTs:  null,
  show: { planetOrbits:true, minor:true, minorOrbits:true, belt:true, trojans:true, kuiper:true, labels:true,
          lagrange:true, earthInset:true, emLagrange:true },
  insetView: 'sunEarth',   // 'sunEarth' | 'earthMoon' (click the inset to toggle)
};

const zoomEl   = document.getElementById('zoom');
const dateEl   = document.getElementById('date-input');
const speedEl  = document.getElementById('speed');
const infoEl   = document.getElementById('info');
infoEl.style.whiteSpace = 'pre-line';   // Earth hover shows a second line for the Moon

const zoomToAU = v => Math.pow(10, v / 100);
const auToZoom = au => Math.round(Math.log10(au) * 100);

function setViewAU(au) {
  state.viewAU = Math.max(1.5, Math.min(1000, au));
  zoomEl.value = auToZoom(state.viewAU);
  document.getElementById('zoom-display').textContent =
    (state.viewAU < 10 ? state.viewAU.toFixed(1) : Math.round(state.viewAU)) + ' AU';
}

function setDateInput() {
  // datetime-local expects "YYYY-MM-DDTHH:MM"; we treat it as UTC.
  dateEl.value = new Date(state.simMs).toISOString().slice(0, 16);
}

zoomEl.addEventListener('input', () => setViewAU(zoomToAU(+zoomEl.value)));
document.querySelectorAll('.preset').forEach(b =>
  b.addEventListener('click', () => setViewAU(+b.dataset.au)));

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  setViewAU(state.viewAU * (e.deltaY > 0 ? 1.12 : 1 / 1.12));
}, { passive: false });

dateEl.addEventListener('change', () => {
  const t = Date.parse(dateEl.value + ':00Z');
  if (!isNaN(t)) state.simMs = t;
});
speedEl.addEventListener('change', () => { state.speed = parseFloat(speedEl.value); });

document.getElementById('play-btn').addEventListener('click', e => {
  state.playing = !state.playing;
  e.target.textContent = state.playing ? '⏸ Pause' : '▶ Play';
});
document.getElementById('now-btn').addEventListener('click', () => {
  state.simMs = Date.now();
  setDateInput();
});
document.getElementById('scale').addEventListener('change', e => { state.scale = e.target.value; });

document.querySelectorAll('#layer-options input[type=checkbox]').forEach(cb =>
  cb.addEventListener('change', () => { state.show[cb.value] = cb.checked; }));

const nightBtn = document.getElementById('night-mode-btn');
if (nightBtn) {
  nightBtn.addEventListener('click', () => {
    nightMode = !nightMode;
    nightBtn.textContent = nightMode ? '☀ Day Mode' : '🌜︎︎ Night Mode';
    document.body.classList.toggle('night-mode', nightMode);
  });
}

// Mouse tracking (canvas pixel coordinates)
let mouse = null;
let lastInset = null;   // geometry of the Earth-neighborhood inset from the last frame
const canvasXY = e => {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * canvas.width / r.width,
           y: (e.clientY - r.top)  * canvas.height / r.height };
};
const overInset = p => lastInset && Math.hypot(p.x - lastInset.cxI, p.y - lastInset.cyI) <= lastInset.RI;
canvas.addEventListener('mousemove', e => {
  mouse = canvasXY(e);
  canvas.style.cursor = overInset(mouse) ? 'pointer' : '';
});
canvas.addEventListener('click', e => {
  if (overInset(canvasXY(e))) state.insetView = state.insetView === 'sunEarth' ? 'earthMoon' : 'sunEarth';
});
canvas.addEventListener('mouseleave', () => { mouse = null; });

//===========================================================
//  Formatting helpers
//===========================================================
function formatPeriod(a) {
  const yr = Math.pow(a, 1.5);
  if (yr < 2)    return `${(yr * 365.25).toFixed(0)} d`;
  if (yr < 1000) return `${yr.toFixed(1)} yr`;
  return `${Math.round(yr)} yr`;
}

const GRID_AU = [0.25, 0.5, 1, 2, 3, 5, 10, 20, 30, 40, 50, 75, 100, 200, 300, 500, 1000];

//===========================================================
//  Render
//===========================================================
function render() {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(cx, cy) - 36;
  const Rv = state.viewAU;
  const jd = julianDate(state.simMs);
  const d  = jd - J2000;
  const T  = d / 36525;
  const sqrtScale = state.scale === 'sqrt';

  // radial scale: AU → pixel radius
  const rPix = au => (sqrtScale ? Math.sqrt(au / Rv) : au / Rv) * R;
  // ecliptic (X,Y) AU → canvas [x, y] (counter-clockwise, 0° to the right)
  const proj = (X, Y) => {
    const rho = Math.hypot(X, Y);
    if (rho < 1e-9) return [cx, cy];
    const s = rPix(rho) / rho;
    return [cx + X * s, cy - Y * s];
  };

  ctx.clearRect(0, 0, W, H);

  //=== Background ===//
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  if (nightMode) { bg.addColorStop(0, '#0d0000'); bg.addColorStop(1, '#020000'); }
  else           { bg.addColorStop(0, '#0d0d22'); bg.addColorStop(1, '#020208'); }
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.restore();

  // everything in the field is clipped to the view circle
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

  //=== Distance rings ===//
  ctx.lineWidth = 0.5;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  GRID_AU.forEach(au => {
    if (au > Rv) return;
    const rr = rPix(au);
    if (rr < 14) return;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.strokeStyle = darkRed(); ctx.stroke();
    ctx.fillStyle = lightRed();
    const lx = cx + rr * Math.cos(-Math.PI / 4), ly = cy + rr * Math.sin(-Math.PI / 4);
    ctx.fillText(au + ' AU', lx + 3, ly);
  });

  //=== Longitude spokes ===//
  ctx.strokeStyle = darkRed();
  [0, 90, 180, 270].forEach(deg => {
    const th = toRad(deg);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(th), cy - R * Math.sin(th));
    ctx.stroke();
  });

  //=== Jupiter mean longitude (for Trojan locking) ===//
  const jEl = PLANET_ELEMENTS.Jupiter;
  const LJ  = jEl.L0 + jEl.Ld * T;

  //=== Particle populations ===//
  function drawGroup(g, rgb, alpha, size) {
    ctx.fillStyle = col(rgb, alpha);
    const rv2 = Rv * Rv;
    for (let i = 0; i < g.count; i++) {
      const M = toRad(g.M0[i] + g.n[i] * d + g.lock[i] * LJ);
      const e = g.e[i];
      let E = M + e * Math.sin(M);
      E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      const xp = g.a[i] * (Math.cos(E) - e);
      const yp = g.b[i] * Math.sin(E);
      const X = xp * g.Px[i] + yp * g.Qx[i];
      const Y = xp * g.Py[i] + yp * g.Qy[i];
      const rho2 = X * X + Y * Y;
      if (rho2 > rv2) continue;
      const rho = Math.sqrt(rho2);
      const s = rPix(rho) / rho;
      ctx.fillRect(cx + X * s - size / 2, cy - Y * s - size / 2, size, size);
    }
  }
  if (state.show.kuiper)  drawGroup(kuiperGroup,  [140,170,230], 0.55, 1.6);
  if (state.show.belt)    drawGroup(beltGroup,    [200,175,130], 0.65, 1.6);
  if (state.show.trojans) drawGroup(trojanGroup,  [150,220,150], 0.70, 1.8);

  //=== Orbit paths ===//
  function strokeOrbit(el, rgb, alpha) {
    const pts = orbitPoints(el);
    ctx.beginPath();
    pts.forEach(([X, Y], i) => {
      const [x, y] = proj(X, Y);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = col(rgb, alpha);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  if (state.show.planetOrbits) {
    planets.forEach(p => strokeOrbit(planetElementsAt(p.el, T), p.style.rgb, 0.28));
  }
  if (state.show.minor && state.show.minorOrbits) {
    ctx.setLineDash([3, 3]);
    minors.forEach(m => { if (m.orbit) strokeOrbit(minorElementsAt(m.orbit, jd), m.rgb, 0.25); });
    ctx.setLineDash([]);
  }

  //=== Sun ===//
  const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
  sunGlow.addColorStop(0,   col([255,230,120], 0.75));
  sunGlow.addColorStop(0.4, col([255,190,60],  0.25));
  sunGlow.addColorStop(1,   col([255,160,20],  0));
  ctx.fillStyle = sunGlow;
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
  const sunDisc = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 8);
  sunDisc.addColorStop(0, col([255,255,210])); sunDisc.addColorStop(0.6, col([255,210,50])); sunDisc.addColorStop(1, col([220,140,10]));
  ctx.fillStyle = sunDisc;
  ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();

  //=== Collect body positions ===//
  const earthPos = bodyPosition(planets.find(p => p.name === 'Earth'), jd);
  const drawn = [];   // for hit-testing

  planets.forEach(p => {
    const pos = bodyPosition(p, jd);
    const [x, y] = proj(pos.X, pos.Y);
    drawn.push({ body:p, pos, px:x, py:y });
  });
  if (state.show.minor) {
    minors.forEach(m => {
      if (!m.orbit) return;
      const pos = bodyPosition(m, jd);
      const [x, y] = proj(pos.X, pos.Y);
      drawn.push({ body:m, pos, px:x, py:y });
    });
  }

  //=== Earth–Moon system + Sun–Earth Lagrange points ===//
  const moon = moonState(jd, earthPos);
  const lag  = lagrangePoints(earthPos);
  if (state.show.lagrange) {
    ['L3', 'L4', 'L5'].forEach(name => {
      const pos = lag[name];
      const [x, y] = proj(pos.X, pos.Y);
      drawn.push({ body:{ name, kind:'lagrange' }, pos, px:x, py:y,
                   text: lagrangeText(name, pos, earthPos) });
    });
  }
  const inset = state.show.earthInset
    ? buildInset(W, H, earthPos, moon, lag, state.show.lagrange, state.show.emLagrange, state.insetView) : null;
  lastInset = inset;
  if (inset) inset.items.forEach(it => drawn.push(it));

  //=== Hover detection ===//
  let hovered = null;
  if (mouse) {
    let best = 18;
    drawn.forEach(o => {
      const dd = Math.hypot(o.px - mouse.x, o.py - mouse.y);
      if (dd < best) { best = dd; hovered = o; }
    });
  }

  //=== Draw planets ===//
  drawn.filter(o => o.body.kind === 'planet').forEach(o => {
    const { style, name } = o.body;
    const { px: x, py: y } = o;
    const { rgb, r, symbol } = style;
    const isHover = hovered === o;

    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    halo.addColorStop(0, col(rgb, 0.45)); halo.addColorStop(1, col(rgb, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = col(rgb);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    if (name === 'Saturn') {
      ctx.strokeStyle = col(rgb, 0.7); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y, r * 2.2, r * 0.7, toRad(-20), 0, Math.PI * 2); ctx.stroke();
    }
    if (isHover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.stroke();
    }
    if (state.show.labels || isHover) {
      ctx.fillStyle = col(rgb); ctx.font = '12px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`${symbol} ${name}`, x + r + 6, y);
    }
  });

  //=== Draw minor bodies ===//
  drawn.filter(o => o.body.kind === 'minor').forEach(o => {
    const { px: x, py: y } = o;
    const m = o.body;
    const isHover = hovered === o;
    ctx.fillStyle = col(m.rgb, 0.35);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col(m.rgb);
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    if (isHover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
    }
    if (state.show.labels || isHover) {
      ctx.fillStyle = col(m.rgb); ctx.font = '10px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(m.name, x + 7, y);
    }
  });

  //=== Draw Lagrange points (L3–L5; L1/L2 are in the inset) ===//
  drawn.filter(o => o.body.kind === 'lagrange').forEach(o => {
    const isHover = hovered === o;
    drawDiamond(o.px, o.py, 4, LAG_RGB);
    if (isHover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(o.px, o.py, 9, 0, Math.PI * 2); ctx.stroke();
    }
    if (state.show.labels || isHover) {
      ctx.fillStyle = col(LAG_RGB); ctx.font = '11px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(o.body.name, o.px + 8, o.py);
    }
  });

  ctx.restore();   // end clip

  //=== View ring + direction labels (outside clip) ===//
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = lightRed(); ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = lightRed(); ctx.font = '12px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [[0, '0° ♈︎'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([deg, label]) => {
    const th = toRad(deg);
    ctx.fillText(label, cx + (R + 20) * Math.cos(th), cy - (R + 20) * Math.sin(th));
  });

  //=== Overlays ===//
  if (inset) drawInset(inset, hovered);
  drawTimeOverlay(jd);
  drawViewOverlay(W, H, jd);
  drawLegend(W, H);

  //=== Hover info text ===//
  let text = 'Hover over a planet or minor body to see details';
  if (hovered && hovered.text) {
    text = hovered.text;
  } else if (hovered) {
    const { body, pos } = hovered;
    const r      = Math.hypot(pos.X, pos.Y, pos.Z);
    const lon    = mod360(toDeg(Math.atan2(pos.Y, pos.X)));
    const lat    = toDeg(Math.asin(pos.Z / r));
    const dEarth = Math.hypot(pos.X - earthPos.X, pos.Y - earthPos.Y, pos.Z - earthPos.Z);
    const parts  = [body.name + (body.note ? ` (${body.note})` : '')];
    parts.push(`r = ${r.toFixed(3)} AU from Sun`);
    if (body.name !== 'Earth') parts.push(`${dEarth.toFixed(3)} AU from Earth (${(dEarth * LIGHT_MIN_PER_AU).toFixed(1)} light-min)`);
    parts.push(`Ecl. lon ${lon.toFixed(1)}°, lat ${lat.toFixed(1)}°`);
    parts.push(`Period ${formatPeriod(pos.el.a)}`);
    if (body.kind === 'minor') parts.push(`e = ${pos.el.e.toFixed(3)}, i = ${pos.el.I.toFixed(1)}°`);
    text = parts.join('  |  ');
    if (body.name === 'Earth') text += '\n' + moonText(moon);
    else if (PLANET_MOONS[body.name]) text += '\n' + planetMoonsText(body.name);
  }
  if (infoEl.textContent !== text) infoEl.textContent = text;
}

//===========================================================
//  Overlays
//===========================================================
function drawTimeOverlay(jd) {
  const now = new Date(state.simMs);
  const lines = [
    { label: 'Datetime:',     value: now.toISOString() },
    { label: 'Julian Date:',  value: jd.toFixed(4) },
    { label: 'Rate:',         value: rateLabel() },
  ];
  const year = now.getUTCFullYear();
  if (year < 1800 || year > 2050) lines.push({ label: 'Note:', value: 'planet elements valid 1800–2050' });

  ctx.font = '12px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  lines.forEach(({ label, value }, i) => {
    const y = 10 + i * 20;
    ctx.fillStyle = darkRed();  ctx.fillText(label, 0, y);
    ctx.fillStyle = lightRed(); ctx.fillText(value, 120, y);
  });
}

function rateLabel() {
  if (!state.playing) return 'paused';
  const s = state.speed, a = Math.abs(s), sign = s < 0 ? '−' : '';
  if (a < 0.001)  return 'real time';
  if (a < 1)      return `${sign}${(a * 24).toFixed(0)} hr/s`;
  if (a < 365)    return `${sign}${a} d/s`;
  return `${sign}${(a / 365.25).toFixed(0)} yr/s`;
}

function drawViewOverlay(W, H, jd) {
  const lines = [
    { label: 'View radius:', value: `${state.viewAU < 10 ? state.viewAU.toFixed(1) : Math.round(state.viewAU)} AU` },
    { label: 'Radial scale:', value: state.scale === 'sqrt' ? 'square root' : 'linear' },
  ];
  if (sbdbStatus.pending > 0) lines.push({ label: '', value: '⟳ fetching JPL SBDB…' });
  else if (sbdbStatus.failed > 0) lines.push({ label: '', value: `JPL SBDB: ${sbdbStatus.ok} ok, ${sbdbStatus.failed} failed` });

  const pad = 8, lh = 17, boxW = 235, boxH = lines.length * lh + pad * 2;
  const bx = pad, by = 100;   // upper-left, just below the time overlay
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 18, 0.70)';
  ctx.beginPath(); ctx.roundRect(bx - pad / 2, by, boxW, boxH, 4); ctx.fill();
  ctx.font = '11px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  lines.forEach(({ label, value }, i) => {
    const y = by + pad + i * lh + lh / 2;
    if (label) { ctx.fillStyle = darkRed(); ctx.fillText(label, bx, y); }
    ctx.fillStyle = lightRed(); ctx.fillText(value, bx + (label ? 100 : 4), y);
  });
  ctx.restore();
}

function drawLegend(W, H) {
  const items = [];
  if (state.show.belt)    items.push(['Asteroid belt',   [200,175,130]]);
  if (state.show.trojans) items.push(['Jupiter Trojans', [150,220,150]]);
  if (state.show.kuiper)  items.push(['Kuiper belt',     [140,170,230]]);
  if (state.show.lagrange) items.push(['Lagrange points', LAG_RGB]);
  if (state.show.emLagrange && state.show.earthInset) items.push(['EM Lagrange pts', EM_RGB]);
  if (!items.length) return;

  const pad = 8, lh = 15, boxW = 150, boxH = items.length * lh + pad * 2;
  const bx = W - boxW - pad, by = H - boxH - pad;
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 18, 0.70)';
  ctx.beginPath(); ctx.roundRect(bx - pad / 2, by, boxW, boxH, 4); ctx.fill();
  ctx.font = '11px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  items.forEach(([label, rgb], i) => {
    const y = by + pad + i * lh + lh / 2;
    ctx.fillStyle = col(rgb); ctx.beginPath(); ctx.arc(bx + 4, y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = darkRed(); ctx.fillText(label, bx + 14, y);
  });
  ctx.restore();
}

//===========================================================
//  Animation loop
//===========================================================
const timeDisplay = document.getElementById('time-display');

function frame(ts) {
  if (state.lastTs === null) state.lastTs = ts;
  const dt = Math.min(0.25, (ts - state.lastTs) / 1000);   // clamp after tab was hidden
  state.lastTs = ts;

  if (state.playing) {
    state.simMs += dt * state.speed * 86400000;
    if (document.activeElement !== dateEl) setDateInput();
  }

  render();

  if (timeDisplay) {
    timeDisplay.textContent = new Date(state.simMs).toLocaleString([], {
      weekday:'short', year:'numeric', month:'short', day:'numeric',
      hour:'2-digit', minute:'2-digit', second:'2-digit',
    });
  }
  requestAnimationFrame(frame);
}

setViewAU(state.viewAU);
setDateInput();
requestAnimationFrame(frame);
