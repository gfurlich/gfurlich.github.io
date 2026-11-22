//===========================================================
//  Astronomer's Almanac — self-contained (no dependencies)
//  Low-precision ephemerides: Sun/Moon ~1°, planets ~0.1-1°.
//  Times are shown in the browser's timezone.
//===========================================================

const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const mod360 = x => ((x % 360) + 360) % 360;
const J2000 = 2451545.0;
const OBL = toRad(23.43929);

const jdOf = date => date.getTime() / 86400000 + 2440587.5;
const dateOf = jd => new Date((jd - 2440587.5) * 86400000);
const gmst = jd => {
  const T = (jd - J2000) / 36525;
  return mod360(280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * T * T - T * T * T / 38710000);
};

//=== Coordinates ===//
function eclToEq(lambda, beta) {
  const l = toRad(lambda), b = toRad(beta);
  const dec = Math.asin(Math.sin(b) * Math.cos(OBL) + Math.cos(b) * Math.sin(OBL) * Math.sin(l));
  const ra = mod360(toDeg(Math.atan2(Math.sin(l) * Math.cos(OBL) - Math.tan(b) * Math.sin(OBL), Math.cos(l))));
  return { ra, dec: toDeg(dec) };
}

function altAz(ra, dec, lst, lat) {
  const ha = toRad(mod360(lst - ra)), d = toRad(dec), la = toRad(lat);
  const sinAlt = Math.sin(d) * Math.sin(la) + Math.cos(d) * Math.cos(la) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(d) - Math.sin(alt) * Math.sin(la)) / (Math.cos(alt) * Math.cos(la) + 1e-10);
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  return { alt: toDeg(alt), az: toDeg(az) };
}

function sepDeg(a, b) {
  const ra1 = toRad(a.ra), d1 = toRad(a.dec), ra2 = toRad(b.ra), d2 = toRad(b.dec);
  const c = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(ra1 - ra2);
  return toDeg(Math.acos(Math.max(-1, Math.min(1, c))));
}

//=== Sun / Moon ===//
function sunLon(jd) {
  const n = jd - J2000;
  const L = mod360(280.460 + 0.9856474 * n), g = toRad(mod360(357.528 + 0.9856003 * n));
  return mod360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
}

function moonEcl(jd) {
  const n = jd - J2000;
  const L0 = mod360(218.316 + 13.176396 * n), M = toRad(mod360(134.963 + 13.064993 * n));
  const F = toRad(mod360(93.272 + 13.229350 * n)), L0R = toRad(L0);
  const Ms = toRad(mod360(357.528 + 0.9856003 * n));
  const lambda = mod360(L0 + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * L0R - M) + 0.658 * Math.sin(2 * L0R)
    - 0.186 * Math.sin(Ms) - 0.059 * Math.sin(2 * M - 2 * L0R) - 0.057 * Math.sin(M - 2 * L0R + M));
  const D = toRad(mod360(297.850 + 12.190749 * n));
  const beta = 5.128 * Math.sin(F) + 0.2806 * Math.sin(M + F) + 0.2777 * Math.sin(M - F) + 0.1732 * Math.sin(2 * D - F);
  return { lambda, beta };
}

//=== Planets (JPL approximate Keplerian elements) ===//
const EL = {
  Mercury: [0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
  Venus:   [0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
  Earth:   [1.00000261,0.00000562,0.01671022,-0.00003804,0.00005,-0.01369,100.46457166,35999.37244981,102.93768193,0.32327364,-11.26064,-0.00503616],
  Mars:    [1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
  Jupiter: [5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
  Saturn:  [9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794],
  Uranus:  [19.18916464,-0.00196176,0.04725744,-0.00004397,0.77263783,-0.00242939,313.23810451,428.48202785,170.95427630,0.40805281,74.01692503,0.04240589],
  Neptune: [30.06992276,0.00026291,0.00859048,0.00005105,1.77004347,0.00035372,-55.12002969,218.45945325,44.96476227,-0.32241464,131.78422574,-0.00508664],
};

function helio(name, T) {
  const e = EL[name], a = e[0] + e[1] * T, ecc = e[2] + e[3] * T, I = toRad(e[4] + e[5] * T);
  const L = e[6] + e[7] * T, lp = e[8] + e[9] * T, Om = mod360(e[10] + e[11] * T);
  const w = toRad(mod360(lp - Om)), M = toRad(mod360(L - lp)), O = toRad(Om);
  let E = M + ecc * Math.sin(M);
  for (let i = 0; i < 10; i++) { const dE = (M - (E - ecc * Math.sin(E))) / (1 - ecc * Math.cos(E)); E += dE; if (Math.abs(dE) < 1e-10) break; }
  const xp = a * (Math.cos(E) - ecc), yp = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
  const cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I), cw = Math.cos(w), sw = Math.sin(w);
  return [(cO*cw - sO*sw*cI)*xp + (-cO*sw - sO*cw*cI)*yp,
          (sO*cw + cO*sw*cI)*xp + (-sO*sw + cO*cw*cI)*yp,
          (sw*sI)*xp + (cw*sI)*yp];
}

function planetEq(name, jd) {
  const T = (jd - J2000) / 36525, p = helio(name, T), e = helio('Earth', T);
  const x = p[0] - e[0], y = p[1] - e[1], z = p[2] - e[2];
  const yq = Math.cos(OBL) * y - Math.sin(OBL) * z, zq = Math.sin(OBL) * y + Math.cos(OBL) * z;
  const delta = Math.sqrt(x*x + yq*yq + zq*zq);
  return { ra: mod360(toDeg(Math.atan2(yq, x))), dec: toDeg(Math.asin(zq / delta)),
           r: Math.hypot(p[0], p[1], p[2]), R: Math.hypot(e[0], e[1], e[2]), delta };
}

// Illuminated fraction (%) of a body's disc; null for the Sun
function illumPct(name, jd) {
  if (name === 'Sun') return null;
  if (name === 'Moon') return moonInfo(jd).illum;
  const g = planetEq(name, jd);
  return (1 + (g.r*g.r + g.delta*g.delta - g.R*g.R) / (2 * g.r * g.delta)) / 2 * 100;
}

//=== Unified body lookup ===//
const BODIES = [
  { name: 'Sun',  sym: '☉', h0: -0.833 }, { name: 'Moon', sym: '☾', h0: 0.125 },
  { name: 'Mercury', sym: '☿', h0: -0.569 }, { name: 'Venus', sym: '♀', h0: -0.569 },
  { name: 'Mars', sym: '♂', h0: -0.569 }, { name: 'Jupiter', sym: '♃', h0: -0.569 },
  { name: 'Saturn', sym: '♄', h0: -0.569 }, { name: 'Uranus', sym: '⛢', h0: -0.569 },
  { name: 'Neptune', sym: '♆', h0: -0.569 },
];

function bodyEq(name, jd) {
  if (name === 'Sun') return eclToEq(sunLon(jd), 0);
  if (name === 'Moon') { const m = moonEcl(jd); return eclToEq(m.lambda, m.beta); }
  return planetEq(name, jd);
}

function bodyAlt(name, jd, lat, lon) {
  const { ra, dec } = bodyEq(name, jd);
  return altAz(ra, dec, mod360(gmst(jd) + lon), lat);
}

//=== Rise / transit / set by sampling the local day ===//
const STEP_MIN = 5;
function sampleDay(name, dayStart, lat, lon) {
  const out = [];
  for (let i = 0; i <= 24 * 60 / STEP_MIN; i++) {
    const t = dayStart.getTime() + i * STEP_MIN * 60000;
    out.push({ t, alt: bodyAlt(name, jdOf(new Date(t)), lat, lon).alt });
  }
  return out;
}

function crossings(s, h0) {
  let rise = null, set = null;
  for (let i = 1; i < s.length; i++) {
    const a = s[i-1], b = s[i], f = (h0 - a.alt) / (b.alt - a.alt);
    if (rise === null && a.alt < h0 && b.alt >= h0) rise = a.t + f * (b.t - a.t);
    if (set === null && a.alt >= h0 && b.alt < h0) set = a.t + f * (b.t - a.t);
  }
  const max = s.reduce((m, p) => p.alt > m.alt ? p : m, s[0]);
  return { rise, set, transit: max.t, maxAlt: max.alt, allUp: s.every(p => p.alt >= h0), allDown: s.every(p => p.alt < h0) };
}

//=== Moon phase ===//
const phaseAngle = jd => mod360(moonEcl(jd).lambda - sunLon(jd));

function moonInfo(jd) {
  const ang = phaseAngle(jd);
  const NAMES = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const SYM = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const i = Math.round(ang / 45) % 8;
  return { ang, illum: (1 - Math.cos(toRad(ang))) / 2 * 100, age: ang / 360 * 29.530588, name: NAMES[i], sym: SYM[i] };
}

function nextPhases(jd) {
  const targets = [[0,'New Moon','🌑'],[90,'First Quarter','🌓'],[180,'Full Moon','🌕'],[270,'Last Quarter','🌗']];
  return targets.map(([tg, name, sym]) => {
    const d = j => mod360(phaseAngle(j) - tg);
    let t = jd;
    while (t < jd + 32 && !(d(t) > 180 && d(t + 0.25) < 180 && d(t + 0.25) < 60)) t += 0.25;
    let lo = t, hi = t + 0.25;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (d(mid) > 180) lo = mid; else hi = mid; }
    return { name, sym, jd: (lo + hi) / 2 };
  }).sort((a, b) => a.jd - b.jd);
}

// First full moon after jd (bisected on the phase angle)
function nextFull(jd) {
  const d = j => mod360(phaseAngle(j) - 180);
  if (!isFinite(jd)) return NaN;
  let a = jd, guard = 0;
  while (!(d(a) > 180 && d(a + 0.25) < 60) && guard++ < 200) a += 0.25;
  let lo = a, hi = a + 0.25;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (d(m) > 180) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// Traditional (Old Farmer's Almanac) full moon names; Harvest Moon = full moon nearest the September equinox
const FULL_NAMES = ['Wolf','Snow','Worm','Pink','Flower','Strawberry','Buck','Sturgeon','Corn',"Hunter's",'Beaver','Cold'];
function fullMoonsOfMonth(year, month) {  // month 0-11, local calendar month
  const out = [];
  let t = jdOf(new Date(year, month, 1)) - 1;
  const end = jdOf(new Date(year, month + 1, 1));
  for (let n = 0; n < 4; n++) {
    const f = nextFull(t);
    if (!(f < end)) break;
    if (f >= end - 31) {
      const dt = dateOf(f);
      if (dt.getMonth() === month && dt.getFullYear() === year) out.push(f);
    }
    t = f + 20;
  }
  const eq = seasons(year)[2].jd;
  let harvest = nextFull(eq - 16);
  const h2 = nextFull(harvest + 20);
  if (Math.abs(h2 - eq) < Math.abs(harvest - eq)) harvest = h2;
  return out.map((f, i) => {
    let name = Math.abs(f - harvest) < 1 ? 'Harvest' : FULL_NAMES[month];
    let label = name + ' Moon';
    if (out.length > 1 && i === 1) label += ' (Blue Moon)';
    return { jd: f, label };
  });
}

//=== Seasons (Meeus ch. 27, mean-formula) ===//
function seasons(year) {
  const Y = (year - 2000) / 1000;
  return [
    ['March Equinox',    2451623.80984 + 365242.37404*Y + 0.05169*Y*Y - 0.00411*Y**3 - 0.00057*Y**4],
    ['June Solstice',    2451716.56767 + 365241.62603*Y + 0.00325*Y*Y + 0.00888*Y**3 - 0.00030*Y**4],
    ['September Equinox',2451810.21715 + 365242.01767*Y - 0.11575*Y*Y + 0.00337*Y**3 + 0.00078*Y**4],
    ['December Solstice',2451900.05952 + 365242.74049*Y - 0.06223*Y*Y - 0.00823*Y**3 + 0.00032*Y**4],
  ].map(([name, jd]) => ({ name, jd }));
}

//=== Static tables (peaks vary by ±1 day year to year) ===//
const METEORS = [
  { name: 'Quadrantids', m: 1, d: 3,  zhr: 110, parent: '2003 EH1' },
  { name: 'Lyrids',      m: 4, d: 22, zhr: 18,  parent: 'C/1861 G1 Thatcher' },
  { name: 'Eta Aquariids', m: 5, d: 6, zhr: 50, parent: '1P/Halley' },
  { name: 'Perseids',    m: 8, d: 12, zhr: 100, parent: '109P/Swift-Tuttle' },
  { name: 'Orionids',    m: 10, d: 21, zhr: 20, parent: '1P/Halley' },
  { name: 'Leonids',     m: 11, d: 17, zhr: 15, parent: '55P/Tempel-Tuttle' },
  { name: 'Geminids',    m: 12, d: 14, zhr: 150, parent: '3200 Phaethon' },
  { name: 'Ursids',      m: 12, d: 22, zhr: 10, parent: '8P/Tuttle' },
];

const SOLAR_FALLBACK = [  // used only if the USNO request fails
  ['2027-02-06', 'Annular Solar Eclipse'], ['2027-08-02', 'Total Solar Eclipse'],
  ['2028-01-26', 'Annular Solar Eclipse'], ['2028-07-22', 'Total Solar Eclipse'],
];

// Lunar eclipses: find each full moon and classify by the Moon's ecliptic latitude (approximate)
function lunarEclipses(jd0, jd1) {
  const out = [], d = j => mod360(phaseAngle(j) - 180);
  let t = jd0;
  while (t < jd1) {
    let a = t;
    while (!(d(a) > 180 && d(a + 0.25) < 60)) a += 0.25;
    let lo = a, hi = a + 0.25;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (d(m) > 180) lo = m; else hi = m; }
    const fm = (lo + hi) / 2, b = Math.abs(moonEcl(fm).beta);
    const type = b < 0.47 ? 'Total' : b < 0.96 ? 'Partial' : b < 1.55 ? 'Penumbral' : null;
    if (type) out.push({ date: dateOf(fm), type: type + ' Lunar Eclipse', src: [0.47, 0.96, 1.55].some(x => Math.abs(b - x) < 0.1) ? 'computed (borderline type)' : 'computed', time: true });
    t = fm + 20;
  }
  return out;
}

// Solar eclipses: USNO API, cached per year (null on failure)
const solarCache = {};
async function fetchSolar(year) {
  if (year in solarCache) return solarCache[year];
  try {
    const j = await (await fetch(`https://aa.usno.navy.mil/api/eclipses/solar/year?year=${year}&ID=almanac`)).json();
    solarCache[year] = (j.eclipses_in_year || []).map(e => ({
      date: new Date(Date.UTC(e.year, e.month - 1, e.day, 12)), type: e.event, src: 'USNO' }));
  } catch (err) { console.warn('USNO eclipse fetch failed:', err); solarCache[year] = null; }
  return solarCache[year];
}

function eclipseTable(ref) {
  const y0 = ref.getUTCFullYear(), list = [];
  for (let y = y0; y <= y0 + 2; y++) {
    const c = solarCache[y];
    if (c) list.push(...c);
    else if (c === null) list.push(...SOLAR_FALLBACK.filter(e => e[0].startsWith(y)).map(e => ({
      date: new Date(e[0] + 'T12:00:00Z'), type: e[1], src: 'fallback' })));
  }
  list.push(...lunarEclipses(jdOf(ref), jdOf(ref) + 3 * 365));
  const ut = { timeZone: 'UTC' };
  const rows = list.filter(e => e.date > ref).sort((a, b) => a.date - b.date).slice(0, 6).map(e =>
    `<tr><td>${e.date.toLocaleDateString([], { ...ut, month: 'short', day: 'numeric', year: 'numeric' })}` +
    `${e.time ? ' ' + e.date.toLocaleTimeString([], { ...ut, hour: '2-digit', minute: '2-digit' }) + ' UT' : ''}</td>` +
    `<td>${e.type}</td><td>${e.src}</td></tr>`).join('');
  return `<table>${rows}</table>`;
}

function loadEclipses(ref) {
  const y0 = ref.getUTCFullYear();
  Promise.all([y0, y0 + 1, y0 + 2].map(fetchSolar)).then(() => {
    const el = document.getElementById('ecl');
    if (el) el.innerHTML = eclipseTable(ref);
  });
}


//=== Formatting ===//
const hm = t => t == null ? '—' : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dmy = d => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const dm = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
const cd = days => {
  const m = Math.round(days * 1440), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m % 60}m`;
};
const hms = deg => { const s = Math.round(mod360(deg) / 360 * 86400); return [Math.floor(s/3600), Math.floor(s%3600/60), s%60].map(x => String(x).padStart(2,'0')).join(':'); };
const dur = ms => ms == null ? '—' : `${Math.floor(ms / 3600000)}h ${String(Math.round(ms % 3600000 / 60000)).padStart(2,'0')}m`;

const p2 = n => String(Math.abs(n)).padStart(2, '0');
function isoLocal(d) {
  const o = -d.getTimezoneOffset(), sg = o >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}${sg}${p2(Math.floor(Math.abs(o)/60))}:${p2(Math.abs(o)%60)}`;
}
function iso6709(lat, lon) {
  const f = (v, w) => (v < 0 ? '-' : '+') + Math.abs(v).toFixed(4).padStart(w + 5, '0');
  return f(lat, 2) + f(lon, 3) + '/';
}

// Twilight colour bar: colour follows the Sun's altitude across the local day
const ALT_STOPS = [[-18,[4,5,25]],[-12,[16,25,74]],[-6,[59,74,154]],[-0.8,[232,147,90]],[6,[246,217,139]],[25,[126,200,245]]];
function altColor(a) {
  const S = ALT_STOPS;
  if (a <= S[0][0]) return `rgb(${S[0][1]})`;
  for (let i = 1; i < S.length; i++) if (a <= S[i][0]) {
    const f = (a - S[i-1][0]) / (S[i][0] - S[i-1][0]);
    return `rgb(${S[i-1][1].map((c, k) => Math.round(c + f * (S[i][1][k] - c)))})`;
  }
  return `rgb(${S[S.length-1][1]})`;
}
function twilightBar(samples, dayStart, marks, nowMs) {
  const pct = t => (t - dayStart.getTime()) / 864000;
  const grad = samples.filter((_, i) => i % 3 === 0).map(p => `${altColor(p.alt)} ${pct(p.t).toFixed(2)}%`).join(',');
  const ticks = marks.filter(t => t != null).map(t => `<div class="tick" style="left:${pct(t).toFixed(2)}%"></div>`).join('');
  const nowM = nowMs >= dayStart.getTime() && nowMs < dayStart.getTime() + 86400000
    ? `<div class="nowm" style="left:${pct(nowMs).toFixed(2)}%"></div>` : '';
  const hrs = [0,3,6,9,12,15,18,21,24].map(h => `<span>${String(h).padStart(2,'0')}</span>`).join('');
  const key = [['Night',-20],['Astronomical',-15],['Nautical',-9],['Civil',-3],['Day',15]]
    .map(([n, a]) => `<span><i style="background:${altColor(a)}"></i>${n}</span>`).join('');
  return `<div class="tbarwrap"><div class="tbar" style="background:linear-gradient(to right,${grad})"></div>${ticks}${nowM}</div>
    <div class="thours">${hrs}</div><div class="tkey">${key}</div>`;
}

const kv = rows => `<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td class="r">${v}</td></tr>`).join('')}</table>`;
const card = (title, body, wide = false, note = '') =>
  `<div class="card${wide ? ' wide' : ''}"><h3>${title}</h3>${body}${note ? `<div class="note">${note}</div>` : ''}</div>`;

//=== Render ===//
function getParams() {
  const v = id => parseFloat(document.getElementById(id).value) || 0;
  const [y, m, d] = (document.getElementById('date').value || '').split('-').map(Number);
  const dayStart = y ? new Date(y, m - 1, d) : new Date(new Date().setHours(0, 0, 0, 0));
  return { lat: v('lat'), lon: v('lon'), dayStart };
}

function render() {
  const { lat, lon, dayStart } = getParams();
  const now = new Date(), jdNow = jdOf(now);
  const dayMid = new Date(dayStart.getTime() + 12 * 3600000), jdMid = jdOf(dayMid);

  // Sun events + twilight
  const sunS = sampleDay('Sun', dayStart, lat, lon);
  const sunC = crossings(sunS, -0.833);
  const tw = h => crossings(sunS, h);
  const civ = tw(-6), nau = tw(-12), ast = tw(-18);
  const sunRows = [
    ['Astronomical dawn', hm(ast.rise)], ['Nautical dawn', hm(nau.rise)], ['Civil dawn', hm(civ.rise)],
    ['Sunrise', hm(sunC.rise)], ['Solar noon', hm(sunC.transit)], ['Sunset', hm(sunC.set)],
    ['Civil dusk', hm(civ.set)], ['Nautical dusk', hm(nau.set)], ['Astronomical dusk', hm(ast.set)],
    ['Day light duration', sunC.allUp ? '24h 00m' : sunC.allDown ? '0h 00m' : dur(sunC.rise != null && sunC.set != null ? sunC.set - sunC.rise : null)],
    ['Dark sky duration', ast.allDown ? 'all day' : ast.allUp ? 'none' : dur(ast.rise != null && ast.set != null ? (ast.rise > ast.set ? ast.rise - ast.set : ast.rise + 86400000 - ast.set) : null)],
  ];

  const sunBar = twilightBar(sunS, dayStart,
    [ast.rise, nau.rise, civ.rise, sunC.rise, sunC.set, civ.set, nau.set, ast.set], now.getTime());

  // Moon
  const mi = moonInfo(jdMid), np = nextPhases(jdMid);
  const fms = fullMoonsOfMonth(dayMid.getFullYear(), dayMid.getMonth());
  const moonRows = [
    ...fms.map(f => [`🌕 ${dayMid.toLocaleDateString([], { month: 'long' })}'s full moon`,
                     `${f.label} · ${dm(dateOf(f.jd))} ${hm(dateOf(f.jd))}`]),
    ['Phase', `${mi.sym} ${mi.name}`], ['Illumination', mi.illum.toFixed(0) + '%'],
    ['Age', mi.age.toFixed(1) + ' days'],
    ...np.map(p => [`${p.sym} ${p.name}`, `${dmy(dateOf(p.jd))} ${hm(dateOf(p.jd))}`]),
  ];

  // Sky now
  const lstNow = mod360(gmst(jdNow) + lon);
  const nowRows = [
    ['Local time', now.toLocaleTimeString()], ['UTC', now.toUTCString().slice(17, 25)],
    ['Julian date', jdNow.toFixed(5)], ['Local sidereal time', hms(lstNow)],
    ['Observer location', `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`],
    ['ISO 8601 (UTC)', now.toISOString().slice(0, 19) + 'Z'], ['ISO 8601 (local)', isoLocal(now)],
    ['ISO 6709 location', iso6709(lat, lon)],
  ];

  // Rise/set table
  const sunEq = bodyEq('Sun', jdNow);
  const trs = BODIES.map(b => {
    const c = b.name === 'Sun' ? sunC : crossings(sampleDay(b.name, dayStart, lat, lon), b.h0);
    const eq = bodyEq(b.name, jdNow), aa = bodyAlt(b.name, jdNow, lat, lon);
    const rs = c.allUp ? ['up', 'all day'] : c.allDown ? ['—', 'never'] : [hm(c.rise), hm(c.set)];
    const il = illumPct(b.name, jdNow);
    const ph = il == null ? '—' : (b.name === 'Moon' ? moonInfo(jdNow).sym + ' ' : '') + il.toFixed(0) + '%';
    const el = b.name === 'Sun' ? '—' : sepDeg(eq, sunEq).toFixed(0) + '°';
    return `<tr><td>${b.sym} ${b.name}</td><td class="r">${rs[0]}</td><td class="r">${hm(c.transit)}</td><td class="r">${rs[1]}</td>
      <td class="r">${c.maxAlt.toFixed(0)}°</td><td class="r">${aa.alt.toFixed(1)}°</td><td class="r">${aa.az.toFixed(0)}°</td><td class="r">${el}</td><td class="r">${ph}</td></tr>`;
  }).join('');
  const bodyTable = `<table><tr><th>Body</th><th class="r">Rise</th><th class="r">Transit</th><th class="r">Set</th>
    <th class="r">Max alt</th><th class="r">Alt now</th><th class="r">Az now</th><th class="r">Elong.</th><th class="r">Phase</th></tr>${trs}</table>`;

  // Seasons
  const yr = dayMid.getUTCFullYear();
  const seas = [...seasons(yr), ...seasons(yr + 1)].filter(s => s.jd > jdMid).slice(0, 4)
    .map(s => [s.name, `${dm(dateOf(s.jd))} ${hm(dateOf(s.jd))} · ${cd(s.jd - jdMid)}`]);

  // Meteor showers
  const showers = METEORS.map(s => {
    let peak = new Date(Date.UTC(yr, s.m - 1, s.d, 12));
    if (peak < dayMid) peak = new Date(Date.UTC(yr + 1, s.m - 1, s.d, 12));
    return { ...s, peak, days: (peak - dayMid) / 86400000, moon: moonInfo(jdOf(peak)).illum };
  }).sort((a, b) => a.peak - b.peak);
  const showerTbl = `<table><tr><th>Shower</th><th>Peak</th><th class="r">In</th><th class="r">ZHR</th><th class="r">Moon</th><th>Parent</th></tr>` +
    showers.map(s => `<tr><td>${s.name}</td><td>${dm(s.peak)}</td><td class="r">${Math.round(s.days)}d</td><td class="r">~${s.zhr}</td>
      <td class="r">${s.moon.toFixed(0)}%</td><td>${s.parent}</td></tr>`).join('') + '</table>';


  document.getElementById('cards').innerHTML =
    card('Date, Time, &amp; Location', kv(nowRows)) +
    card('Sun &amp; Twilight', kv(sunRows) + sunBar, false, `For ${dmy(dayStart)}`) +
    card('Moon', kv(moonRows), false, 'Phase times accurate to a few hours.') +
    card('Seasons', kv(seas)) +
    card('Planets\' Rise, Transit &amp; Set', bodyTable, true, `For ${dmy(dayStart)}, in your browser's timezone. Alt/Az/Elongation/Phase (illuminated fraction) are for the current moment. Moon rise/set ignores parallax (±~1°).`) +
    card('Meteor Showers', showerTbl, true, 'Relative to the selected date. Peak dates vary ±1 day. "Moon" = illumination at peak; lower means darker skies. ZHR is an ideal-conditions rate.') +
    card('Upcoming Eclipses', `<div id="ecl">${eclipseTable(dayMid)}</div>`, true,
      'Relative to the selected date. Solar: USNO API. Lunar: computed from the built-in Moon model (type may be off for borderline cases). Dates in UT; visibility is regional — see eclipse.gsfc.nasa.gov.');
  loadEclipses(dayMid);
}

function tick() {
  document.getElementById('clock').textContent = new Date().toLocaleString([], {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

//=== Wiring ===//
(function init() {
  const t = new Date();
  document.getElementById('date').value = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  ['date', 'lat', 'lon'].forEach(id => document.getElementById(id).addEventListener('input', render));

  document.getElementById('geo-btn').addEventListener('click', () => {
    navigator.geolocation?.getCurrentPosition(p => {
      document.getElementById('lat').value = p.coords.latitude.toFixed(2);
      document.getElementById('lon').value = p.coords.longitude.toFixed(2);
      render();
    });
  });

  document.getElementById('night-btn').addEventListener('click', e => {
    const on = document.getElementById('almanac').classList.toggle('night');
    document.body.classList.toggle('night-mode', on);
    e.target.textContent = on ? '☀ Day Mode' : '🌜︎ Night Mode';
  });

  render(); tick();
  setInterval(tick, 1000);
  setInterval(render, 60000);
})();
