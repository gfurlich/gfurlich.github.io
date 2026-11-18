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
//  Galactic Center direction + notable spacecraft
//
//  Spacecraft status checked Nov 2026 (NASA/ESA/NOAA/JAXA pages);
//  these change, so edit the tables below as missions start or end.
//===========================================================

/** Equatorial J2000 (RA, Dec) → ecliptic (lon, lat), degrees. */
function equatorialToEcliptic(ra, dec) {
  const e = toRad(23.43929), a = toRad(ra), d = toRad(dec);
  const lon = mod360(toDeg(Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a))));
  const lat = toDeg(Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a)));
  return { lon, lat };
}

// Sagittarius A*: RA 17h45m40s, Dec −29°00′28″ (J2000)
const GC_ECL = equatorialToEcliptic(266.41683, -29.00781);

function galacticCenterText() {
  return `Direction to the Galactic Center (Sagittarius A*)  |  Ecl. lon ${GC_ECL.lon.toFixed(1)}°, `
       + `lat ${GC_ECL.lat.toFixed(1)}° (arrow is projected onto the ecliptic plane)  |  `
       + `~26,000 light-years (8.2 kpc) away; the Sun orbits it at ~230 km/s, once per ~230 million years`;
}

// Spacecraft plotted around Lagrange points (Earth view). Real halo / Lissajous orbits are
// hundreds of thousands of km wide and no ephemeris is used, so they are drawn schematically.
const SPACECRAFT_AT = {
  'SE-L1': { place: 'Sun–Earth L1', items: [
    ['SOHO',      'ESA/NASA solar observatory, since 1996'],
    ['ACE',       'NASA Advanced Composition Explorer, since 1997'],
    ['Wind',      'NASA solar-wind monitor, at L1 since 2004'],
    ['DSCOVR',    'NOAA/NASA Earth and solar-wind observatory, since 2015'],
    ['Aditya-L1', 'ISRO solar observatory, halo orbit since Jan 2024'],
    ['IMAP',      'NASA heliosphere mapper, arrived Jan 2026'],
    ['SOLAR-1',   'NOAA space-weather satellite (formerly SWFO-L1), arrived Jan 2026'] ] },
  'SE-L2': { place: 'Sun–Earth L2', items: [
    ['JWST',      'NASA/ESA/CSA infrared observatory, since 2022'],
    ['Euclid',    'ESA dark-universe survey telescope, since 2023'] ] },
  'EM-L2': { place: 'Earth–Moon L2', items: [
    ['Queqiao-1', 'Chinese lunar relay satellite in a halo orbit, since 2018'] ] },
};

// Spacecraft at/around each planet, shown as an extra hover line.
const PLANET_SPACECRAFT = {
  Mercury: 'BepiColombo (ESA/JAXA), on final approach; Mercury orbit insertion planned 21 Nov 2026',
  Venus:   'none currently orbiting',
  Earth:   'ISS, Tiangong, Hubble and thousands more; L1/L2 observatories are in the Earth view',
  Mars:    'Orbiters: Mars Odyssey, MRO, Mars Express, ExoMars TGO, Hope, Tianwen-1. Rovers: Curiosity, Perseverance (MAVEN retired Jun 2026)',
  Jupiter: 'Juno (polar orbiter, extended mission)',
  Saturn:  'none currently (Cassini ended 2017)',
  Uranus:  'none (Voyager 2 flyby, 1986)',
  Neptune: 'none (Voyager 2 flyby, 1989)',
  Pluto:   'none (New Horizons flyby, 2015)',
};
const PLANETS_WITH_ORBITERS = new Set(['Earth', 'Mars', 'Jupiter']);   // get a small badge on the map

const planetCraftText = name => `Spacecraft: ${PLANET_SPACECRAFT[name]}`;

//===========================================================
//  Extra-solar probes (Voyagers, Pioneers, New Horizons)
//
//  Direction = fixed sky position (RA/Dec, Sky & Telescope, Dec 2018);
//  distance = value at the epoch below + constant radial speed.
//  Distances/speeds follow NASA/JPL and Wikipedia figures (Nov 2026);
//  a straight-line extrapolation, good to a few AU and ~1° in direction.
//===========================================================
const PROBE_EPOCH_MS      = Date.UTC(2026, 10, 14);
const AU_PER_YR_PER_KMS   = 0.21095;

const PROBES = [
  { name:'Voyager 1',    ra:258.263, dec: 11.972, r0:171.8, kms:16.92, showFrom:1990, rgb:[120,200,255],
    note:'NASA · interstellar since Aug 2012 · toward Ophiuchus' },
  { name:'Voyager 2',    ra:300.738, dec:-57.620, r0:144.4, kms:15.27, showFrom:1990, rgb:[120,200,255],
    note:'NASA · interstellar since Nov 2018 · toward Telescopium' },
  { name:'Pioneer 10',   ra: 78.396, dec: 26.040, r0:142.1, kms:11.8,  showFrom:1990, rgb:[120,200,255],
    note:'NASA · silent since 2003 · toward Taurus (Aldebaran)' },
  { name:'Pioneer 11',   ra:282.990, dec: -8.924, r0:119.4, kms:11.1,  showFrom:1990, rgb:[120,200,255],
    note:'NASA · silent since 1995 · toward Scutum' },
  { name:'New Horizons', ra:286.800, dec:-20.690, r0: 65.8, kms:13.5,  showFrom:2016, rgb:[120,200,255],
    note:'NASA · Pluto flyby 2015, extended mission · toward Sagittarius' },
];
PROBES.forEach(p => { p.ecl = equatorialToEcliptic(p.ra, p.dec); });

/** Heliocentric ecliptic position (AU) of a probe at time ms. */
function probeState(pr, ms) {
  const yrs = (ms - PROBE_EPOCH_MS) / (365.25 * 86400000);
  const r   = Math.max(1, pr.r0 + pr.kms * AU_PER_YR_PER_KMS * yrs);
  const lon = toRad(pr.ecl.lon), lat = toRad(pr.ecl.lat);
  return { r, X: r * Math.cos(lat) * Math.cos(lon), Y: r * Math.cos(lat) * Math.sin(lon), Z: r * Math.sin(lat) };
}

function probeText(pr, st) {
  return `${pr.name} (${pr.note})  |  ~${st.r.toFixed(1)} AU from Sun (${(st.r * LIGHT_MIN_PER_AU / 60).toFixed(1)} light-hours), `
       + `${pr.kms} km/s (${(pr.kms * AU_PER_YR_PER_KMS).toFixed(2)} AU/yr)  |  `
       + `Heading ecl. lon ${pr.ecl.lon.toFixed(1)}°, lat ${pr.ecl.lat.toFixed(1)}°  |  position approximate (straight-line extrapolation)`;
}

const angDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

//===========================================================
//  Minor bodies (dwarf planets, asteroids, comets)
//
//  Elements are fetched live from the JPL Small-Body Database API
//  (ecliptic J2000, osculating). `fallback` is used if the fetch
//  fails or is blocked; these are approximate (epoch JD 2458600.5).
//  Bodies with no fallback are simply skipped when the fetch fails.
//===========================================================
const MINOR_BODIES = [
  { name:'Ceres',    sstr:'1',      rgb:[225,225,225], note:'dwarf planet · asteroid belt',
    fallback:{ a:2.7691652, e:0.0760091, I:10.59407, Om:80.30553, w:73.59769, M0:77.3721, epoch:2458600.5 } },
  { name:'Vesta',    sstr:'4',      rgb:[215,175,120], note:'asteroid' },
  { name:'Pallas',   sstr:'2',      rgb:[110,150,215], note:'asteroid' },
  { name:'Hygiea',   sstr:'10',     rgb:[175,135,105], note:'asteroid' },
  { name:'Eros',     sstr:'433',    rgb:[255,140,60], note:'near-Earth asteroid' },
  { name:'Apophis',  sstr:'99942',  rgb:[255,85,85], note:'near-Earth asteroid' },
  { name:'Chiron',   sstr:'2060',   rgb:[100,175,125], note:'centaur' },
  { name:'Haumea',   sstr:'136108', rgb:[195,205,255], note:'dwarf planet' },
  { name:'Makemake', sstr:'136472', rgb:[235,150,120], note:'dwarf planet',
    fallback:{ a:45.43, e:0.1559, I:28.98, Om:79.62, w:294.84, M0:165.5, epoch:2458600.5 } },
  { name:'Eris',     sstr:'136199', rgb:[240,240,160], note:'dwarf planet',
    fallback:{ a:67.864, e:0.4407, I:44.04, Om:35.95, w:151.64, M0:205.8, epoch:2458600.5 } },
  { name:'Sedna',    sstr:'90377',  rgb:[205,85,175],  note:'extreme TNO' },
  { name:'Halley',   sstr:'1P',     rgb:[80,220,255], note:'comet · 76-yr period', comet:true,
    // Perihelion 1986-Feb-09 (JD 2446467.4); epoch is the perihelion time, M0 = 0.
    fallback:{ a:17.834, e:0.96714, I:162.26, Om:58.42, w:111.33, M0:0, epoch:2446467.4 } },
  // Other notable comets. Fallbacks use time of perihelion as the epoch (M0 = 0).
  { name:'Encke',        sstr:'2P',        rgb:[255,110,190], note:'comet · 3.3-yr period', comet:true,
    fallback:{ a:2.215, e:0.8483, I:11.78, Om:334.57, w:186.54, M0:0, epoch:2460240.0 } },
  { name:'67P/C-G',      sstr:'67P',       rgb:[150,255,110], note:'comet · Rosetta target, 6.4-yr period', comet:true },
  { name:'Swift-Tuttle', sstr:'109P',      rgb:[170,130,255], note:'comet · Perseid parent, 133-yr period', comet:true,
    fallback:{ a:26.09, e:0.9632, I:113.45, Om:139.38, w:152.98, M0:0, epoch:2448968.8 } },
  { name:'Hale-Bopp',    sstr:'C/1995 O1', rgb:[60,240,200], note:'comet · ~2,500-yr period', comet:true,
    fallback:{ a:186, e:0.9951, I:89.43, Om:282.47, w:130.59, M0:0, epoch:2450539.6 } },
  { name:'NEOWISE',      sstr:'C/2020 F3', rgb:[255,200,70], note:'comet · ~6,800-yr period', comet:true,
    fallback:{ a:358, e:0.99918, I:128.94, Om:61.01, w:37.28, M0:0, epoch:2459033.7 } },
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
  const hi = el.e > 0.9;            // very eccentric (comets): crowd samples near perihelion
  if (hi) N = 320;
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const E = hi ? Math.PI * Math.pow(2 * u - 1, 3) : 2 * Math.PI * u;
    const { X, Y, Z } = posFromE(el, E);
    pts.push([X, Y, Z]);
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
  L1: 'unstable · between Earth and Sun · e.g. SOHO, DSCOVR, IMAP',
  L2: 'unstable · beyond Earth, away from Sun · e.g. JWST, Euclid; Roman due Dec 2026',
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
  L2: 'unstable · beyond the Moon · e.g. Queqiao-1 relay',
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
function buildInset(vp, earth, moon, lag, showLag, showEM, view, showCraft) {
  const RI = vp.R, cxI = vp.cx, cyI = vp.cy;
  const z  = vp.small ? 1 : 1.5;                      // symbol-size multiplier
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

  const em = earthMoonLagrange(moon.geo);

  // Spacecraft around the L points. Plotted schematically on a small ring around the point
  // (real halo/Lissajous orbits are far larger and no ephemeris is used).
  if (showCraft) {
    const geoOf = L => ({ X: L.X - earth.X, Y: L.Y - earth.Y, Z: L.Z - earth.Z });
    const place = (key, geo) => {
      const grp = SPACECRAFT_AT[key], [x0, y0] = toI(geo), n = grp.items.length;
      const rad = (n > 1 ? 9 : 0) * z;
      grp.items.forEach(([name, note], i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        items.push({ body:{ name, kind:'inset' },
                     px: x0 + rad * Math.cos(a), py: y0 + rad * Math.sin(a),
                     text: `${name}: ${note}  |  near ${grp.place} (halo/Lissajous orbit; position schematic)`,
                     label: name, showLabel: false, rgb: [255, 255, 255], shape: 'craft' });
      });
    };
    if (view === 'sunEarth') { place('SE-L1', geoOf(lag.L1)); place('SE-L2', geoOf(lag.L2)); }
    else                     { place('EM-L2', em.L2); }
  }

  if (showEM) {
    ['L1', 'L2', 'L3', 'L4', 'L5'].forEach(name => {
      const [x, y] = toI(em[name]);
      items.push({ body:{ name:'EM ' + name, kind:'inset' }, px:x, py:y,
                   text:earthMoonLagrangeText(name, em[name], moon.geo),
                   label:'EM ' + name,
                   // in the small Sun–Earth view L1/L2 sit on top of the Moon, so skip their labels there
                   showLabel: view === 'earthMoon' || !vp.small || ['L3', 'L4', 'L5'].includes(name),
                   rgb:EM_RGB, shape:'diamond' });
    });
  }
  return { cxI, cyI, RI, z, small: vp.small, k, dMean, view, ex, ey, sunDir, items };
}

function drawDiamond(x, y, s, rgb) {
  ctx.fillStyle = col(rgb);
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y);
  ctx.closePath(); ctx.fill();
}

function drawInset(ins, hovered) {
  const { cxI, cyI, RI, z, small, k, dMean, view, ex, ey, sunDir, items } = ins;
  const isEM = view === 'earthMoon';

  ctx.save();
  ctx.beginPath(); ctx.arc(cxI, cyI, RI, 0, Math.PI * 2);
  ctx.fillStyle = small ? panelBg(0.85) : (nightMode ? '#050000' : '#05050f'); ctx.fill();

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
    ctx.strokeStyle = col([255, 210, 80], 0.8); ctx.lineWidth = 1.2 * z;
    ctx.beginPath();
    ctx.moveTo(cxI + ux * RI * 0.55, cyI + uy * RI * 0.55);
    ctx.lineTo(cxI + ux * RI * 0.76, cyI + uy * RI * 0.76);
    ctx.stroke();
    ctx.fillStyle = col([255, 210, 80]); ctx.font = `${11 * z}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('☉', cxI + ux * RI * 0.86, cyI + uy * RI * 0.86);
  }

  // Earth
  ctx.fillStyle = col(PLANET_STYLE.Earth.rgb);
  ctx.beginPath(); ctx.arc(ex, ey, 4 * z, 0, Math.PI * 2); ctx.fill();

  // items
  ctx.font = `${10 * z}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  items.forEach(it => {
    if (it.shape === 'diamond') drawDiamond(it.px, it.py, 3.5 * z, it.rgb);
    else if (it.shape === 'craft') {
      ctx.fillStyle = col(it.rgb, 0.95);
      ctx.beginPath(); ctx.arc(it.px, it.py, 1.7 * z, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = col(it.rgb);
      ctx.beginPath(); ctx.arc(it.px, it.py, (isEM ? 3.5 : 2.5) * z, 0, Math.PI * 2); ctx.fill();
    }
    if (hovered === it) {
      ctx.strokeStyle = hoverRing(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(it.px, it.py, 8 * z, 0, Math.PI * 2); ctx.stroke();
    }
    if (it.showLabel) {
      ctx.fillStyle = col(it.rgb);
      ctx.fillText(it.label, it.px + 6 * z, it.py - 7 * z);
    }
  });
  if (nightMode) { ctx.fillStyle = 'rgba(60, 0, 0, 0.25)'; ctx.fillRect(cxI - RI, cyI - RI, 2 * RI, 2 * RI); }
  ctx.restore();

  ctx.beginPath(); ctx.arc(cxI, cyI, RI, 0, Math.PI * 2);
  ctx.strokeStyle = lightRed(); ctx.lineWidth = 1; ctx.stroke();

  // captions (above the circle) and in-circle labels
  const capFont = small ? 10 : 12, cap1 = small ? 12 : 10, cap2 = small ? 25 : 23;
  ctx.font = `${capFont}px sans-serif`; ctx.fillStyle = lightRed(); ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  if (isEM) {
    ctx.fillText(`Moon fixed · edge ≈ ${INSET_EM_SPAN} lunar dist.`, cxI, cyI - RI - cap1);
    ctx.fillText('Earth–Moon frame', cxI, cyI - RI - cap2);
    ctx.fillText('lunar motion ↑', cxI, cyI - RI + 12 * z);
  } else {
    ctx.fillText(`edge ≈ ${(INSET_SPAN * AU_KM / MOON_MEAN_KM).toFixed(1)} lunar dist.`, cxI, cyI - RI - cap1);
    ctx.fillText('Earth neighborhood', cxI, cyI - RI - cap2);
    ctx.fillText('orbital motion ↑', cxI, cyI - RI + 12 * z);
    ctx.textAlign = 'left'; ctx.fillText('← Sun', cxI - RI + 5 * z, cyI + 10 * z);
    ctx.textAlign = 'center';
  }
  ctx.font = `${9 * z}px sans-serif`;
  ctx.fillText(small ? 'click: enlarge' : 'click: switch frame', cxI, cyI + RI - 9 * z);
  ctx.restore();
}

//===========================================================
//  Body records
//===========================================================
const planets = Object.keys(PLANET_ELEMENTS).map(name => ({
  name, kind:'planet', el:PLANET_ELEMENTS[name], style:PLANET_STYLE[name],
}));

const minors = MINOR_BODIES.map(def => ({
  name:def.name, kind:'minor', rgb:def.rgb, note:def.note, sstr:def.sstr, comet:!!def.comet,
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
// Hover rings and panel backgrounds: white / blue-black by day, red / red-black at night
const hoverRing = () => nightMode ? 'rgba(210,0,0,0.9)' : 'rgba(255,255,255,0.85)';
const panelBg   = a  => nightMode ? `rgba(10,0,0,${a})` : `rgba(5,5,18,${a})`;

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
          lagrange:true, earthInset:true, emLagrange:true,
          galactic:true, spacecraft:true, probes:true },
  insetView: 'sunEarth',   // 'sunEarth' | 'earthMoon' (click the enlarged Earth view to toggle)
  swapped:   false,        // true: Earth–Moon view is the large panel, solar system is the inset
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

const swapBtn = document.getElementById('swap-btn');   // optional
function updateSwapButton() {
  if (swapBtn) swapBtn.textContent = state.swapped ? '⇄ Show Solar System Large' : '⇄ Show Earth–Moon Large';
}
if (swapBtn) swapBtn.addEventListener('click', toggleSwap);
updateSwapButton();

//=== Night-mode styling for the page controls and the hover-text line ===//
// Same red theme as the canvas / star chart. Self-contained, so it works in any layout;
// if your site CSS already styles body.night-mode you can delete this block.
(function injectNightStyles() {
  if (!document.createElement || !document.head || document.getElementById('solar-night-style')) return;
  const st = document.createElement('style');
  st.id = 'solar-night-style';
  st.textContent = `
    body.night-mode { background-color: #050000; color: #8a0000; }
    body.night-mode .canvas-container, body.night-mode .ctrl, body.night-mode .ctrl label,
    body.night-mode #time-display { color: #8a0000; }
    body.night-mode #info, body.night-mode #zoom-display { color: #7e0000 !important; }
    body.night-mode .ctrl button, body.night-mode .canvas-container button, body.night-mode #night-mode-btn,
    body.night-mode .ctrl select, body.night-mode .ctrl input[type="datetime-local"],
    body.night-mode .ctrl input[type="number"] {
      background-color: #140000; color: #a00000; border: 1px solid #4a0000; }
    body.night-mode .ctrl button:hover, body.night-mode .canvas-container button:hover,
    body.night-mode #night-mode-btn:hover { background-color: #260000; border-color: #7a0000; color: #c00000; }
    body.night-mode .ctrl option { background-color: #140000; color: #a00000; }
    body.night-mode .ctrl input[type="checkbox"] { accent-color: #9a0000; }
    /* range slider: custom red track + thumb (the browser default stays light grey at night) */
    body.night-mode .ctrl input[type="range"] {
      -webkit-appearance: none; appearance: none; background: transparent; height: 18px; cursor: pointer; }
    body.night-mode .ctrl input[type="range"]::-webkit-slider-runnable-track {
      height: 6px; background: #3a0000; border-radius: 3px; border: none; }
    body.night-mode .ctrl input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; width: 14px; height: 14px; margin-top: -4px;
      border-radius: 50%; background: #a00000; border: 1px solid #2a0000; }
    body.night-mode .ctrl input[type="range"]:hover::-webkit-slider-thumb { background: #c00000; }
    body.night-mode .ctrl input[type="range"]::-moz-range-track { height: 6px; background: #3a0000; border-radius: 3px; border: none; }
    body.night-mode .ctrl input[type="range"]::-moz-range-progress { height: 6px; background: #6a0000; border-radius: 3px; }
    body.night-mode .ctrl input[type="range"]::-moz-range-thumb {
      width: 14px; height: 14px; border-radius: 50%; background: #a00000; border: 1px solid #2a0000; }
    body.night-mode .ctrl input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      filter: invert(12%) sepia(100%) saturate(7000%) hue-rotate(-10deg) brightness(70%); }
    body.night-mode .ctrl button:focus-visible, body.night-mode .ctrl select:focus-visible,
    body.night-mode .ctrl input:focus-visible { outline: 1px solid #a00000; }
  `;
  document.head.appendChild(st);
})();

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
let lastViews = null;   // { big, small, swapped } viewports from the last frame
const canvasXY = e => {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * canvas.width / r.width,
           y: (e.clientY - r.top)  * canvas.height / r.height };
};
const inVp = (p, vp) => vp && Math.hypot(p.x - vp.cx, p.y - vp.cy) <= vp.R;

function toggleSwap() {
  state.swapped = !state.swapped;
  updateSwapButton();
}
function toggleInsetFrame() {
  state.insetView = state.insetView === 'sunEarth' ? 'earthMoon' : 'sunEarth';
}

canvas.addEventListener('mousemove', e => {
  mouse = canvasXY(e);
  const v = lastViews;
  const clickable = v && (inVp(mouse, v.small) || (v.swapped && inVp(mouse, v.big)));
  canvas.style.cursor = clickable ? 'pointer' : '';
});
canvas.addEventListener('click', e => {
  const p = canvasXY(e), v = lastViews;
  if (!v) return;
  if (inVp(p, v.small)) toggleSwap();                        // click the small view → swap places
  else if (v.swapped && inVp(p, v.big)) toggleInsetFrame();  // click the enlarged Earth view → switch frame
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
// Projected orbit polylines from the last frame (used to hover an orbit and identify its body)
let lastOrbits = {};

/** Shortest distance from point (px,py) to a polyline [[x,y],...]. */
function polyDist(poly, px, py) {
  let best = Infinity;
  for (let i = 1; i < poly.length; i++) {
    const [x0, y0] = poly[i - 1], [x1, y1] = poly[i];
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    let t = L2 ? ((px - x0) * dx + (py - y0) * dy) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
    if (d < best) best = d;
  }
  return best;
}

function render() {
  const W = canvas.width, H = canvas.height;
  const Rv = state.viewAU;
  const jd = julianDate(state.simMs);
  const d  = jd - J2000;
  const T  = d / 36525;
  const sqrtScale = state.scale === 'sqrt';

  //=== Viewports: the solar map and the Earth–Moon inset can swap places ===//
  const insetOn = state.show.earthInset;
  const swapped = state.swapped && insetOn;
  const BIG   = { cx: W / 2, cy: H / 2, R: Math.min(W, H) / 2 - 62, small: false };   // margin for outside labels
  const SMALL = { cx: 96,    cy: H - 96, R: 90,                     small: true  };
  const solarVp = swapped ? SMALL : BIG;
  const earthVp = swapped ? BIG   : SMALL;
  lastViews = { big: BIG, small: insetOn ? SMALL : null, swapped };

  const { cx, cy, R } = solarVp;
  const sm = solarVp.small;
  const sz = sm ? 0.45 : 1;            // symbol-size multiplier for the solar map

  // radial scale: AU → pixel radius
  const rPix = au => (sqrtScale ? Math.sqrt(au / Rv) : au / Rv) * R;
  // ecliptic (X,Y) AU → canvas [x, y] (counter-clockwise, 0° to the right)
  const proj = (X, Y) => {
    const rho = Math.hypot(X, Y);
    if (rho < 1e-9) return [cx, cy];
    const s = rPix(rho) / rho;
    return [cx + X * s, cy - Y * s];
  };

  //=== Collect positions for both views (needed for hover before drawing) ===//
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
  // Direction markers on the ring: Galactic Center + extra-solar probes that lie beyond the view
  const edgeMarkers = [], probeDots = [];
  if (state.show.galactic) {
    edgeMarkers.push({ name:'Galactic Center', lon:GC_ECL.lon, rgb:[235, 150, 255], text:galacticCenterText() });
  }
  if (state.show.probes) {
    const yr = new Date(state.simMs).getUTCFullYear();
    PROBES.forEach(pr => {
      if (yr < pr.showFrom) return;                 // extrapolation not meaningful before this
      const st = probeState(pr, state.simMs), rho = Math.hypot(st.X, st.Y), text = probeText(pr, st);
      if (rho <= Rv * 0.98) {                       // inside the view: plot the true position
        const [x, y] = proj(st.X, st.Y);
        const it = { body:{ name:pr.name, kind:'probe', rgb:pr.rgb }, px:x, py:y, text };
        drawn.push(it); probeDots.push(it);
      } else {                                      // beyond the view: just note the direction at the edge
        edgeMarkers.push({ name:pr.name, lon:mod360(toDeg(Math.atan2(st.Y, st.X))), rgb:pr.rgb, text });
      }
    });
  }
  // Where each marker's direction crosses the ring (screen unit vector)
  edgeMarkers.forEach(m => { m.c = Math.cos(toRad(m.lon)); m.s = -Math.sin(toRad(m.lon)); });

  // Labels sit OUTSIDE the ring. They are spread along the ring just far enough apart not to
  // overlap (order preserved), and joined to their arrowheads by thin leader lines.
  if (!sm && edgeMarkers.length) {
    ctx.font = '12px sans-serif';
    const LH = 15, GAP = 10, Rc = R + 32;
    const lab = edgeMarkers.map(m => ({ m, w: ctx.measureText(m.name).width + 8, ang: m.lon }));
    lab.sort((p, q) => p.ang - q.ang);
    // start after the biggest angular gap, and unwrap so the list is monotonic
    let gi = lab.length - 1, bestGap = -1;
    lab.forEach((l, i) => {
      const nxt = lab[(i + 1) % lab.length];
      const g = ((nxt.ang - l.ang + 360) % 360) || 360;
      if (g > bestGap) { bestGap = g; gi = i; }
    });
    const ord = [...lab.slice(gi + 1), ...lab.slice(0, gi + 1)];
    for (let i = 1; i < ord.length; i++) while (ord[i].ang < ord[i - 1].ang) ord[i].ang += 360;
    // half-extent of a label box along the ring's tangent at its angle
    const ext = l => (l.w / 2) * Math.abs(Math.sin(toRad(l.ang))) + (LH / 2) * Math.abs(Math.cos(toRad(l.ang)));
    for (let it = 0; it < 80; it++) {
      let moved = false;
      for (let i = 1; i < ord.length; i++) {
        const need = toDeg((ext(ord[i]) + ext(ord[i - 1]) + GAP) / Rc);
        const diff = ord[i].ang - ord[i - 1].ang;
        if (diff < need - 0.01) { const d = (need - diff) / 2; ord[i].ang += d; ord[i - 1].ang -= d; moved = true; }
      }
      if (!moved) break;
    }
    ord.forEach(l => {
      const a = toRad(l.ang), ca = Math.cos(a), sa = -Math.sin(a);
      const rc = R + 12 + (l.w / 2) * Math.abs(ca) + (LH / 2) * Math.abs(sa);   // box's nearest edge ≈ R+12
      l.m.label = { x: cx + ca * rc, y: cy + sa * rc, w: l.w, h: LH };
    });
  }

  edgeMarkers.forEach(m => {
    const L = m.label;
    m.item = { body:{ name:m.name, kind:'direction' }, px: cx + m.c * R, py: cy + m.s * R, text:m.text,
               box: L ? { x0: L.x - L.w / 2, y0: L.y - L.h / 2, x1: L.x + L.w / 2, y1: L.y + L.h / 2 } : null };
    drawn.push(m.item);
  });

  const inset = insetOn
    ? buildInset(earthVp, earthPos, moon, lag, state.show.lagrange, state.show.emLagrange, state.insetView, state.show.spacecraft) : null;
  if (inset) inset.items.forEach(it => drawn.push(it));

  //=== Hover detection ===//
  let hovered = null;
  if (mouse) {
    let best = Infinity;
    drawn.forEach(o => {
      let dd = Math.hypot(o.px - mouse.x, o.py - mouse.y);
      if (o.box) {                                              // direction markers: also hit-test the label box
        const bx = Math.max(o.box.x0 - mouse.x, 0, mouse.x - o.box.x1);
        const by = Math.max(o.box.y0 - mouse.y, 0, mouse.y - o.box.y1);
        dd = Math.min(dd, Math.hypot(bx, by));
      }
      const lim = o.box ? 9 : ((o.body.kind === 'inset' || !sm) ? 18 : 12);   // tighter hit radius on the small solar map
      if (dd < lim && dd < best) { best = dd; hovered = o; }
    });
  }

  // No marker under the mouse? Then see whether the mouse is on an orbit line: hovering an
  // orbit selects its body (marker ring + label + orbit highlight + info text).
  if (mouse && !hovered && state.show.minor && state.show.minorOrbits && Math.hypot(mouse.x - cx, mouse.y - cy) < R) {
    let bestD = sm ? 4 : 6, bestName = null;
    minors.forEach(m => {
      const o = lastOrbits[m.name];
      if (!o) return;
      const d = polyDist(o.poly, mouse.x, mouse.y);
      if (d < bestD) { bestD = d; bestName = m.name; }
    });
    if (bestName) hovered = drawn.find(o => o.body.kind === 'minor' && o.body.name === bestName) || null;
  }
  // body whose orbit should be highlighted
  const hlName = hovered && (hovered.body.kind === 'minor' || hovered.body.kind === 'planet') ? hovered.body.name : null;

  ctx.clearRect(0, 0, W, H);

  //=============== SOLAR SYSTEM VIEW ===============//

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
    if (rr < (sm ? 6 : 14)) return;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.strokeStyle = darkRed(); ctx.stroke();
    if (!sm) {
      ctx.fillStyle = lightRed();
      const lx = cx + rr * Math.cos(-Math.PI / 4), ly = cy + rr * Math.sin(-Math.PI / 4);
      ctx.fillText(au + ' AU', lx + 3, ly);
    }
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
  if (state.show.kuiper)  drawGroup(kuiperGroup,  [140,170,230], 0.55, sm ? 1 : 1.6);
  if (state.show.belt)    drawGroup(beltGroup,    [200,175,130], 0.65, sm ? 1 : 1.6);
  if (state.show.trojans) drawGroup(trojanGroup,  [150,220,150], 0.70, sm ? 1 : 1.8);

  //=== Orbit paths ===//
  // Draws one orbit in the body's own colour, at the same strength as the planets' orbits.
  //  - comets: dashed along the whole orbit (longer dashes above the ecliptic, finer below it)
  //  - other minor bodies: solid above the ecliptic, dashed below it
  // Returns the outermost visible point plus the direction of travel there (for the arrowhead
  // on the name tag).
  const ORBIT_ALPHA = 0.28;
  lastOrbits = {};
  function strokeOrbit(name, el, rgb, isMinor, isComet) {
    const pts = orbitPoints(el);
    let zmax = 0, rmax = 0;
    pts.forEach(([X, Y, Z]) => { zmax = Math.max(zmax, Math.abs(Z)); rmax = Math.max(rmax, Math.hypot(X, Y)); });
    const tilted = zmax > 0.2 * rmax;
    const above = new Path2D(), below = new Path2D(), poly = [];
    let prev = null, lastBelow = null, tagIdx = -1, tagR = -1;
    pts.forEach(([X, Y, Z], i) => {
      const cur = proj(X, Y), rho = Math.hypot(X, Y);
      poly.push(cur);
      if (rho <= Rv * 0.985 && rho > tagR) { tagR = rho; tagIdx = i; }
      if (prev) {
        const isBelow = tilted && (prev[2] + Z) < 0, path = isBelow ? below : above;
        if (isBelow !== lastBelow) path.moveTo(prev[0], prev[1]);   // new run keeps dashes continuous
        path.lineTo(cur[0], cur[1]);
        lastBelow = isBelow;
      }
      prev = [cur[0], cur[1], Z];
    });
    lastOrbits[name] = { poly };
    const hi  = name === hlName;
    const dim = isMinor && hlName && !hi;                       // fade the others while one is highlighted
    ctx.lineWidth = hi ? 2.4 : (isMinor ? (sm ? 0.7 : 1.0) : (sm ? 0.6 : 0.8));
    ctx.strokeStyle = col(rgb, hi ? 1 : (dim ? ORBIT_ALPHA * 0.6 : ORBIT_ALPHA));
    ctx.setLineDash(isComet ? (sm ? [3, 2] : [6, 3]) : []);
    ctx.stroke(above);
    if (tilted) {
      ctx.setLineDash(isComet ? (sm ? [1, 2] : [2.5, 3]) : (sm ? [2, 2] : [5, 3]));
      ctx.stroke(below);
    }
    ctx.setLineDash([]);
    if (tagIdx < 0) return null;
    // direction of travel = direction of increasing eccentric anomaly = along the sampled polyline
    const p0 = poly[Math.max(0, tagIdx - 1)], p1 = poly[Math.min(poly.length - 1, tagIdx + 1)];
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    return { x: poly[tagIdx][0], y: poly[tagIdx][1], dx: dx / L, dy: dy / L };
  }
  if (state.show.planetOrbits) {
    planets.forEach(p => strokeOrbit(p.name, planetElementsAt(p.el, T), p.style.rgb, false, false));
  }
  const orbitTags = [];
  if (state.show.minor && state.show.minorOrbits) {
    minors.forEach(m => {
      if (!m.orbit) return;
      const tag = strokeOrbit(m.name, minorElementsAt(m.orbit, jd), m.rgb, true, !!m.comet);
      if (tag) orbitTags.push({ m, tag });
    });
  }
  // Annotations on the orbits themselves: an arrowhead showing the direction of travel (always),
  // plus the body's name where its own label isn't already close and tags wouldn't collide.
  if (!sm && state.show.labels && orbitTags.length) {
    ctx.font = '10px sans-serif'; ctx.textBaseline = 'middle';
    const placed = [];
    orbitTags.forEach(({ m, tag }) => {
      const sz2 = 5, nx = -tag.dy, ny = tag.dx;
      ctx.fillStyle = col(m.rgb, 0.95);
      ctx.beginPath();
      ctx.moveTo(tag.x + tag.dx * sz2, tag.y + tag.dy * sz2);
      ctx.lineTo(tag.x - tag.dx * sz2 * 0.6 + nx * sz2 * 0.7, tag.y - tag.dy * sz2 * 0.6 + ny * sz2 * 0.7);
      ctx.lineTo(tag.x - tag.dx * sz2 * 0.6 - nx * sz2 * 0.7, tag.y - tag.dy * sz2 * 0.6 - ny * sz2 * 0.7);
      ctx.closePath(); ctx.fill();

      const item = drawn.find(o => o.body === m);
      if (item && Math.hypot(item.px - tag.x, item.py - tag.y) < 45) return;
      if (placed.some(q => Math.hypot(q[0] - tag.x, q[1] - tag.y) < 26)) return;
      placed.push([tag.x, tag.y]);
      const right = tag.x >= cx;                                // text runs toward the centre, staying inside the map
      ctx.fillStyle = col(m.rgb, 0.95);
      ctx.textAlign = right ? 'right' : 'left';
      ctx.fillText(m.name, tag.x + (right ? -9 : 9), tag.y);
    });
  }

  //=== Sun ===//
  const glowR = 34 * sz, discR = Math.max(2.5, 7 * sz);
  const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  sunGlow.addColorStop(0,   col([255,230,120], 0.75));
  sunGlow.addColorStop(0.4, col([255,190,60],  0.25));
  sunGlow.addColorStop(1,   col([255,160,20],  0));
  ctx.fillStyle = sunGlow;
  ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
  const sunDisc = ctx.createRadialGradient(cx - 2 * sz, cy - 2 * sz, 1 * sz, cx, cy, discR);
  sunDisc.addColorStop(0, col([255,255,210])); sunDisc.addColorStop(0.6, col([255,210,50])); sunDisc.addColorStop(1, col([220,140,10]));
  ctx.fillStyle = sunDisc;
  ctx.beginPath(); ctx.arc(cx, cy, discR, 0, Math.PI * 2); ctx.fill();

  //=== Draw planets ===//
  drawn.filter(o => o.body.kind === 'planet').forEach(o => {
    const { style, name } = o.body;
    const { px: x, py: y } = o;
    const { rgb, symbol } = style;
    const r = Math.max(1.4, style.r * sz);
    const isHover = hovered === o;

    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    halo.addColorStop(0, col(rgb, 0.45)); halo.addColorStop(1, col(rgb, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = col(rgb);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    if (state.show.spacecraft && PLANETS_WITH_ORBITERS.has(name)) {   // small dot = spacecraft present
      ctx.fillStyle = col([255, 255, 255], 0.95);
      ctx.beginPath(); ctx.arc(x + r + 2, y - r - 2, Math.max(1, 1.7 * sz), 0, Math.PI * 2); ctx.fill();
    }

    if (name === 'Saturn') {
      ctx.strokeStyle = col(rgb, 0.7); ctx.lineWidth = Math.max(0.8, 1.5 * sz);
      ctx.beginPath(); ctx.ellipse(x, y, r * 2.2, r * 0.7, toRad(-20), 0, Math.PI * 2); ctx.stroke();
    }
    if (isHover) {
      ctx.strokeStyle = hoverRing(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, r + (sm ? 4 : 7), 0, Math.PI * 2); ctx.stroke();
    }
    if ((!sm && state.show.labels) || isHover) {
      ctx.fillStyle = col(rgb); ctx.font = '12px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`${symbol} ${name}`, x + r + 6, y);
    }
  });

  //=== Comet tails (point away from the Sun when the comet is near it) ===//
  if (state.show.minor) {
    drawn.filter(o => o.body.kind === 'minor' && o.body.comet).forEach(o => {
      const r = Math.hypot(o.pos.X, o.pos.Y, o.pos.Z);
      if (r > 4.5) return;
      const dx = o.px - cx, dy = o.py - cy, len = Math.hypot(dx, dy);
      if (len < 1) return;
      const ux = dx / len, uy = dy / len;
      const L  = (sm ? 8 : 42) * Math.min(1, Math.max(0.2, (4.5 - r) / 3));
      const g  = ctx.createLinearGradient(o.px, o.py, o.px + ux * L, o.py + uy * L);
      g.addColorStop(0, col(o.body.rgb, 0.7)); g.addColorStop(1, col(o.body.rgb, 0));
      ctx.strokeStyle = g; ctx.lineWidth = sm ? 1 : 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(o.px, o.py); ctx.lineTo(o.px + ux * L, o.py + uy * L); ctx.stroke();
      ctx.lineCap = 'butt';
    });
  }

  //=== Draw minor bodies ===//
  drawn.filter(o => o.body.kind === 'minor').forEach(o => {
    const { px: x, py: y } = o;
    const m = o.body;
    const isHover = hovered === o;
    ctx.fillStyle = col(m.rgb, 0.35);
    ctx.beginPath(); ctx.arc(x, y, Math.max(2, 5 * sz), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col(m.rgb);
    ctx.beginPath(); ctx.arc(x, y, Math.max(1, 2.5 * sz), 0, Math.PI * 2); ctx.fill();
    if (isHover) {
      ctx.strokeStyle = hoverRing(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, sm ? 5 : 9, 0, Math.PI * 2); ctx.stroke();
    }
    if ((!sm && state.show.labels) || isHover) {
      ctx.fillStyle = col(m.rgb); ctx.font = '10px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(m.name, x + 7, y);
    }
  });

  //=== Draw extra-solar probes that fall inside the view ===//
  probeDots.forEach(o => {
    const isHover = hovered === o;
    drawDiamond(o.px, o.py, Math.max(2, 4 * sz), o.body.rgb);
    if (isHover) {
      ctx.strokeStyle = hoverRing(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(o.px, o.py, sm ? 5 : 9, 0, Math.PI * 2); ctx.stroke();
    }
    if ((!sm && state.show.labels) || isHover) {
      ctx.fillStyle = col(o.body.rgb); ctx.font = '11px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(o.body.name, o.px + 8, o.py);
    }
  });

  //=== Draw Lagrange points (L3–L5; L1/L2 are in the Earth view) ===//
  drawn.filter(o => o.body.kind === 'lagrange').forEach(o => {
    const isHover = hovered === o;
    drawDiamond(o.px, o.py, Math.max(2, 4 * sz), LAG_RGB);
    if (isHover) {
      ctx.strokeStyle = hoverRing(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(o.px, o.py, sm ? 5 : 9, 0, Math.PI * 2); ctx.stroke();
    }
    if ((!sm && state.show.labels) || isHover) {
      ctx.fillStyle = col(LAG_RGB); ctx.font = '11px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(o.body.name, o.px + 8, o.py);
    }
  });

  ctx.restore();   // end clip

  // Night mode: red wash over the sky disc, as in the star chart
  if (nightMode) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(60, 0, 0, 0.25)'; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.restore();
  }

  //=== View ring (+ direction labels or swap hint) ===//
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = lightRed(); ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = lightRed(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (!sm) {
    ctx.font = '12px sans-serif';
    [[0, '0° ♈︎'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([deg, label]) => {
      const th = toRad(deg);
      ctx.fillText(label, cx + (R - 22) * Math.cos(th), cy - (R - 22) * Math.sin(th));   // inside the ring
    });
  } else {
    ctx.font = '10px sans-serif';
    ctx.fillText('Solar System', cx, cy - R - 12);
    ctx.font = '9px sans-serif';
    ctx.fillText('click: enlarge', cx, cy + R - 9);
  }

  //=== Direction markers at the ring edge (arrowhead on the ring, label outside) ===//
  edgeMarkers.forEach(m => {
    const hov = hovered === m.item;
    ctx.save();
    const a = sm ? 4 : 9, tx = cx + m.c * (R + a), ty = cy + m.s * (R + a);
    const bx = cx + m.c * R, by = cy + m.s * R, nx = -m.s, ny = m.c;
    ctx.fillStyle = col(m.rgb, hov ? 1 : 0.85);
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(bx + nx * a * 0.6, by + ny * a * 0.6); ctx.lineTo(bx - nx * a * 0.6, by - ny * a * 0.6);
    ctx.closePath(); ctx.fill();
    if (m.label) {
      const L = m.label;
      // leader line from the arrow tip to the nearest point of the label box
      const qx = Math.min(Math.max(tx, L.x - L.w / 2), L.x + L.w / 2);
      const qy = Math.min(Math.max(ty, L.y - L.h / 2), L.y + L.h / 2);
      if (Math.hypot(qx - tx, qy - ty) > 3) {
        ctx.strokeStyle = col(m.rgb, hov ? 0.9 : 0.45); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(qx, qy); ctx.stroke();
      }
      ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = col(m.rgb, hov ? 1 : 0.95);
      ctx.fillText(m.name, L.x, L.y);
    }
    ctx.restore();
  });

  //=============== EARTH–MOON VIEW ===============//
  if (inset) drawInset(inset, hovered);

  //=== Overlays ===//
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
    if (body.kind === 'minor') {
      const q = pos.el.a * (1 - pos.el.e), Q = pos.el.a * (1 + pos.el.e);
      parts.push(`e = ${pos.el.e.toFixed(3)}, i = ${pos.el.I.toFixed(1)}°`);
      parts.push(`perihelion ${q.toFixed(2)} AU, aphelion ${Q.toFixed(Q < 100 ? 1 : 0)} AU`
               + (Q > Rv * 0.98 ? ' (orbit continues beyond this view)' : ''));
    }
    if (body.kind === 'minor' && Math.abs(pos.el.I - 90) < 20) parts.push('orbit is nearly edge-on from above');
    if (body.kind === 'minor') parts.push(pos.el.I > 90 ? 'retrograde (clockwise from above)' : 'prograde (counter-clockwise from above)');
    text = parts.join('  |  ');
    if (body.name === 'Earth') text += '\n' + moonText(moon);
    else if (PLANET_MOONS[body.name]) text += '\n' + planetMoonsText(body.name);
    if (state.show.spacecraft && PLANET_SPACECRAFT[body.name]) text += '\n' + planetCraftText(body.name);
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
  ctx.fillStyle = panelBg(0.7);
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
  ctx.fillStyle = panelBg(0.7);
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
