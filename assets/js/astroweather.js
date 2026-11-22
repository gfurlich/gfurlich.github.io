//===========================================================
//  Astronomer's Weather Report
//  Data: Open-Meteo (no key, CORS enabled)
//===========================================================

const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const mod360 = x => ((x % 360) + 360) % 360;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

//=== Sun / Moon (low precision) ===//
const OBL = toRad(23.43929);
function eclToEq(lam, beta) {
  const l = toRad(lam), b = toRad(beta);
  const dec = Math.asin(Math.sin(b) * Math.cos(OBL) + Math.cos(b) * Math.sin(OBL) * Math.sin(l));
  const ra = Math.atan2(Math.sin(l) * Math.cos(OBL) - Math.tan(b) * Math.sin(OBL), Math.cos(l));
  return { ra: mod360(toDeg(ra)), dec: toDeg(dec) };
}
function sunEq(jd) {
  const n = jd - 2451545.0;
  const L = mod360(280.460 + 0.9856474 * n), g = toRad(mod360(357.528 + 0.9856003 * n));
  return eclToEq(mod360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)), 0);
}
function moonEq(jd) {
  const n = jd - 2451545.0;
  const L0 = mod360(218.316 + 13.176396 * n), M = toRad(mod360(134.963 + 13.064993 * n));
  const F = toRad(mod360(93.272 + 13.229350 * n)), L0R = toRad(L0);
  const lam = mod360(L0 + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * L0R - M)
    + 0.658 * Math.sin(2 * L0R) - 0.186 * Math.sin(toRad(mod360(357.528 + 0.9856003 * n)))
    - 0.059 * Math.sin(2 * M - 2 * L0R));
  return eclToEq(lam, 5.128 * Math.sin(F));
}
function altitude(ra, dec, lst, lat) {
  const ha = toRad(mod360(lst - ra)), d = toRad(dec), la = toRad(lat);
  return toDeg(Math.asin(Math.sin(d) * Math.sin(la) + Math.cos(d) * Math.cos(la) * Math.cos(ha)));
}
function skyState(tMs, lat, lon) {
  const jd = tMs / 86400000 + 2440587.5;
  const lst = mod360(280.46061837 + 360.98564736629 * (jd - 2451545) + lon);
  const s = sunEq(jd), m = moonEq(jd);
  const elong = mod360(m.ra - s.ra);
  return {
    sunAlt: altitude(s.ra, s.dec, lst, lat),
    moonAlt: altitude(m.ra, m.dec, lst, lat),
    moonIllum: (1 - Math.cos(toRad(elong))) / 2,
  };
}

//=== Data ===//
const CACHE_TTL = 30 * 60 * 1000;   // models update ~hourly, so 30 min is plenty

// pressure levels (hPa) used for the turbulence profile
const LEVELS = [1000, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100];

// fetch JSON with a timeout and retries (network errors, timeouts, 429 and 5xx are retried)
async function fetchJSON(url, tries = 3, timeoutMs = 15000) {
  let lastErr;
  for (let k = 0; k < tries; k++) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (res.ok) return await res.json();
      lastErr = new Error('HTTP ' + res.status);
      if (res.status !== 429 && res.status < 500) throw lastErr;    // other client errors: don't retry
    } catch (err) {
      lastErr = err;
      if (/^HTTP 4/.test(err.message) && !/429/.test(err.message)) throw err;
    } finally { clearTimeout(timer); }
    if (k < tries - 1) await new Promise(r => setTimeout(r, 1500 * (k + 1)));
  }
  throw lastErr;
}

async function cachedGet(key, url, tries = 3, timeoutMs = 15000) {
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  if (cached && Date.now() - cached.at < CACHE_TTL) return { json: cached.json, at: cached.at, stale: false };
  try {
    const json = await fetchJSON(url, tries, timeoutMs);
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), json })); } catch (e) {}
    return { json, at: Date.now(), stale: false };
  } catch (err) {
    if (cached) return { json: cached.json, at: cached.at, stale: true };   // fall back to old data
    throw err;
  }
}

async function fetchWeather(lat, lon) {
  // round to 0.1° (~11 km, finer than the model grid) so nearby requests share a cache entry
  const la = lat.toFixed(1), lo = lon.toFixed(1);
  const vars = ['cloud_cover', 'cloud_cover_high', 'temperature_2m', 'relative_humidity_2m', 'surface_pressure',
    'wind_speed_10m', 'wind_direction_10m', 'wind_speed_250hPa'];
  LEVELS.forEach(L => vars.push(`temperature_${L}hPa`, `wind_speed_${L}hPa`, `wind_direction_${L}hPa`, `geopotential_height_${L}hPa`));
  const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}`
    + `&hourly=${[...new Set(vars)].join(',')}&wind_speed_unit=kmh&timeformat=unixtime&timezone=auto&forecast_days=3`;
  const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${la}&longitude=${lo}`
    + `&hourly=aerosol_optical_depth&timeformat=unixtime&forecast_days=3`;

  const w = await cachedGet(`aw2_w_${la}_${lo}`, wUrl);
  // aerosol data is optional: don't block the chart on it (one try, short timeout)
  const airPromise = cachedGet(`aw2_a_${la}_${lo}`, aUrl, 1, 8000).catch(() => null);
  return { ...w.json, _air: null, _at: w.at, _stale: w.stale, airPromise };
}

//=== Seeing: Cn2 profile from model temperature + wind (Coulman/Vernin-style) ===//
const LAMBDA = 5e-7, K2 = Math.pow(2 * Math.PI / LAMBDA, 2), ARCSEC = 206265;
const FREE_SCALE = 10;    // TUNING: coarse model levels under-resolve free-atmosphere turbulence
const RI_CRIT = 1;        // Richardson number at which half of a layer is assumed turbulent
const GL0 = 1e-12;        // TUNING: ground-layer integral of Cn2 (m^1/3), scaled by surface wind

function windUV(speedKmh, dirDeg) {            // meteorological "from" direction -> u,v in m/s
  const s = speedKmh / 3.6, d = toRad(dirDeg);
  return { u: -s * Math.sin(d), v: -s * Math.cos(d) };
}

function profile(h, i, elev) {
  const P0 = h.surface_pressure?.[i] ?? 1013.25 * Math.exp(-elev / 8400);
  const sw = windUV(h.wind_speed_10m[i], h.wind_direction_10m[i]);
  const pts = [{ P: P0, T: h.temperature_2m[i] + 273.15, z: elev, u: sw.u, v: sw.v }];
  for (const L of LEVELS) {
    const z = h[`geopotential_height_${L}hPa`]?.[i], T = h[`temperature_${L}hPa`]?.[i];
    const s = h[`wind_speed_${L}hPa`]?.[i], d = h[`wind_direction_${L}hPa`]?.[i];
    if ([z, T, s, d].some(x => x == null)) continue;
    if (z < pts[pts.length - 1].z + 30) continue;           // below ground / too thin
    const w = windUV(s, d);
    pts.push({ P: L, T: T + 273.15, z, u: w.u, v: w.v });
  }
  return pts;
}

function seeingArcsec(pts, elev, ws10) {
  const theta = p => p.T * Math.pow(1000 / p.P, 0.2857);
  let J = 0;                                                 // integral of Cn2 dz, free atmosphere
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1], dz = b.z - a.z;
    if ((a.z + b.z) / 2 - elev < 1000) continue;             // lowest 1 km handled by ground-layer term
    const Pm = (a.P + b.P) / 2, Tm = (a.T + b.T) / 2;
    const M = 79e-6 * Pm / (Tm * Tm) * Math.abs((theta(b) - theta(a)) / dz);   // refractive-index gradient
    const S = Math.min(0.05, Math.hypot(b.u - a.u, b.v - a.v) / dz);          // wind shear (1/s)
    const L43 = Math.pow(0.1, 4 / 3) * Math.pow(10, 1.64 + 42 * S);           // outer scale^(4/3), Coulman 1988
    // turbulence only fills a layer when shear can overcome stability: weight by gradient Richardson number
    const Ri = (9.81 / theta(a)) * Math.abs((theta(b) - theta(a)) / dz) / (S * S + 1e-8);
    const frac = 1 / (1 + Math.pow(Ri / RI_CRIT, 2));
    J += 2.8 * M * M * L43 * dz * frac;
  }
  const Jgl = GL0 * (0.5 + Math.min(ws10, 15) / 5);
  const r0 = Math.pow(0.423 * K2 * (FREE_SCALE * J + Jgl), -0.6);          // Fried parameter (m)
  return 0.98 * LAMBDA / r0 * ARCSEC;                                       // FWHM in arcsec
}

//=== Transparency: CAMS aerosol optical depth + thin cirrus + humid haze ===//
function aodAt(air, t) {
  if (!air || !air.hourly) return null;
  const T = air.hourly.time, A = air.hourly.aerosol_optical_depth;
  let best = null, bd = Infinity;
  T.forEach((tt, i) => { if (A[i] != null && Math.abs(tt - t) < bd) { bd = Math.abs(tt - t); best = A[i]; } });
  return bd <= 3 * 3600 ? best : null;
}

function buildCols(json, lat, lon, N = 48) {
  const h = json.hourly, off = json.utc_offset_seconds, nowS = Date.now() / 1000, elev = json.elevation || 0;
  const start = Math.max(0, h.time.findIndex(t => t >= nowS - 3600));
  const cols = [];
  for (let i = start; i < Math.min(h.time.length, start + N); i++) {
    const rh = h.relative_humidity_2m[i], ws = h.wind_speed_10m[i];
    const aod = aodAt(json._air, h.time[i]);
    const tau = (aod ?? 0.1) + 0.3 * (h.cloud_cover_high[i] || 0) / 100 + 0.15 * Math.max(0, (rh - 75) / 25);
    const arc = seeingArcsec(profile(h, i, elev), elev, ws / 3.6);
    const o = {
      t: h.time[i], off, cloud: h.cloud_cover[i], temp: h.temperature_2m[i], rh, ws,
      jet: h.wind_speed_250hPa[i],
      aod, tau, extinction: 1.086 * tau, transp: clamp(1 - tau / 0.6),       // 1 = best
      seeingArc: arc, seeing: clamp(1 - (arc - 0.8) / 2.7),                   // 0.8" -> 1, 3.5" -> 0
      ...skyState(h.time[i] * 1000, lat, lon),
    };
    // overall score 0..1 (1 = best): clear sky x average of transparency/seeing x night-sky darkness
    o.score = (1 - o.cloud / 100) * (0.5 * o.transp + 0.5 * o.seeing) * (1 - darkness(o));
    cols.push(o);
  }
  return cols;
}

//=== Colors: dark = better observing conditions on every row ===//
function interp(stops, p) {            // p in 0..1 across the stops
  const x = clamp(p) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  return `rgb(${stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f))})`;
}
const VIRIDIS = [[68, 1, 84], [59, 82, 139], [33, 144, 141], [93, 200, 99], [253, 231, 37]];
const MAGMA   = [[0, 0, 4], [59, 15, 112], [140, 41, 129], [222, 73, 104], [254, 159, 109], [252, 253, 191]];
const scale = q => interp(VIRIDIS, 1 - q);   // q = 1 (best) -> dark purple, q = 0 (worst) -> yellow

// Darkness: 0 = full dark sky, 1 = daylight, shown on the magma scale
function darkness(c) {
  if (c.sunAlt > 0) return 1;
  if (c.sunAlt > -18) return 0.35 + 0.65 * (1 + c.sunAlt / 18);       // twilight ramp
  const moon = c.moonAlt > 0 ? c.moonIllum * clamp(c.moonAlt / 20) : 0;
  return 0.35 * moon;                                                  // moonlight brightens the sky
}
const darkColor = c => interp(MAGMA, darkness(c));
function darkLabel(c) {
  const s = c.sunAlt > 0 ? 'Day' : c.sunAlt > -6 ? 'Civil tw.' : c.sunAlt > -12 ? 'Naut. tw.'
          : c.sunAlt > -18 ? 'Astro tw.' : 'Dark';
  return s + (c.moonAlt > 0 ? ` ☾${Math.round(c.moonIllum * 100)}%` : '');
}
const COOLWARM = [[59, 76, 192], [141, 176, 254], [221, 221, 221], [245, 160, 130], [180, 4, 38]];
const tempColor = t => interp(COOLWARM, (t + 15) / 50);   // -15 °C (cool) .. 35 °C (warm), 10 °C neutral

const ROWS = [
  { label: 'Cloud Cover',   color: c => scale(1 - c.cloud / 100),         val: c => `${Math.round(c.cloud)}%` },
  { label: 'Transparency',  color: c => scale(c.transp),                  val: c => `+${c.extinction.toFixed(2)} mag` },
  { label: 'Seeing',        color: c => scale(c.seeing),                  val: c => `${c.seeingArc.toFixed(1)}"` },
  { label: 'Darkness',      color: darkColor,                             val: darkLabel },
  { label: 'Ground Wind',   color: c => scale(1 - c.ws / 40),             val: c => `${Math.round(c.ws)} km/h` },
  { label: 'Upper Wind',    color: c => scale(1 - (c.jet - 40) / 160),    val: c => `${Math.round(c.jet)} km/h` },
  { label: 'Humidity',      color: c => scale(1 - c.rh / 100),            val: c => `${Math.round(c.rh)}%` },
  { label: 'Temperature',   color: c => tempColor(c.temp),                val: c => `${c.temp.toFixed(1)} °C` },
  { label: 'Overall Score', color: c => scale(c.score),                   val: c => `${Math.round(c.score * 100)} / 100`, sep: true },
];

//=== Theme ===//
const THEMES = {
  light: { bg: '#fafafa', label: '#555', value: '#222', accent: '#b03040', hover: '#000' },
  dark:  { bg: '#050000', label: '#9a2020', value: '#e83030', accent: '#ff4a4a', hover: '#ff4a4a' },
};
let darkMode = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
try { const s = localStorage.getItem('aw-dark'); if (s !== null) darkMode = s === '1'; } catch (e) {}

function applyTheme() {
  document.body.classList.toggle('aw-dark', darkMode);
  document.getElementById('aw-theme').textContent = darkMode ? 'Light Mode' : 'Dark Mode';
  draw(hoverIdx);
}

//=== Drawing (scales with page width) ===//
const canvas = document.getElementById('aw-chart');
const ctx = canvas.getContext('2d');
let cols = [], hoverIdx = -1, G = { L: 110, cw: 15, n: 48 };
const hourOf = c => new Date((c.t + c.off) * 1000).getUTCHours();
const stamp = c => { const d = new Date((c.t + c.off) * 1000); return d.toUTCString().slice(0, 3) + ' ' + String(d.getUTCHours()).padStart(2, '0') + ':00'; };

function draw(hover = -1) {
  const th = THEMES[darkMode ? 'dark' : 'light'];
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 1000;                 // CSS pixels
  const fs = clamp(W / 90, 9, 16);                      // font size grows with width
  const L = fs * 10, RW = fs * 13, T = fs * 4;
  const n = W < 640 ? 24 : 48;                          // fewer hours on phones
  const vis = cols.slice(0, n);
  const cw = (W - L - RW - 10) / n;                     // square cell size
  const gap = cw * 0.6;                                 // spacing above the score row
  const gridH = ROWS.length * cw + gap, gridR = L + cw * n;
  const H = Math.ceil(T + gridH + fs);
  const rowY = ri => T + ri * cw + (ROWS[ri].sep ? gap : 0);
  G = { L, cw, n };

  canvas.style.height = H + 'px';
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
  ctx.font = `${fs}px monospace`; ctx.textBaseline = 'middle';
  if (!vis.length) return;

  vis.forEach((c, i) => {
    const x = L + i * cw, hr = hourOf(c);
    if (hr % 3 === 0) { ctx.fillStyle = th.label; ctx.textAlign = 'center'; ctx.fillText(String(hr).padStart(2, '0'), x + cw / 2, T - fs); }
    if (hr === 0 || i === 0) {
      ctx.fillStyle = th.accent; ctx.textAlign = 'left';
      ctx.fillText(new Date((c.t + c.off) * 1000).toUTCString().slice(0, 11), x + 2, T - fs * 2.6);
    }
  });

  ROWS.forEach((r, ri) => {
    const y = rowY(ri);
    ctx.fillStyle = th.label; ctx.textAlign = 'right'; ctx.fillText(r.label, L - 8, y + cw / 2);
    vis.forEach((c, i) => { ctx.fillStyle = r.color(c); ctx.fillRect(L + i * cw, y, cw - 1, cw - 1); });
  });

  ctx.strokeStyle = th.accent; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
  vis.forEach((c, i) => {
    if (hourOf(c) === 0 && i > 0) { ctx.beginPath(); ctx.moveTo(L + i * cw - 0.5, T - 4); ctx.lineTo(L + i * cw - 0.5, T + gridH); ctx.stroke(); }
  });
  ctx.globalAlpha = 1;

  // right-hand values for hovered hour (default: first column = now)
  const idx = hover >= 0 && hover < vis.length ? hover : 0, c = vis[idx];
  if (hover >= 0) { ctx.strokeStyle = th.hover; ctx.strokeRect(L + hover * cw, T - 2, cw, gridH + 2); }
  ctx.textAlign = 'left';
  ctx.fillStyle = th.accent; ctx.fillText(hover >= 0 ? stamp(c) : 'Now', gridR + 14, T - fs);
  ROWS.forEach((r, ri) => { ctx.fillStyle = th.value; ctx.fillText(r.val(c), gridR + 14, rowY(ri) + cw / 2); });
}

function pick(e) {
  const rect = canvas.getBoundingClientRect();
  const i = Math.floor((e.clientX - rect.left - G.L) / G.cw);
  hoverIdx = i >= 0 && i < Math.min(cols.length, G.n) ? i : -1;
  draw(hoverIdx);
}
canvas.addEventListener('pointermove', pick);
canvas.addEventListener('pointerdown', pick);
canvas.addEventListener('pointerleave', () => { hoverIdx = -1; draw(); });
window.addEventListener('resize', () => draw(hoverIdx));

//=== Wiring ===//
let loadId = 0;
function statusText(lat, lon, json, airState) {
  const upd = new Date(json._at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Forecast for ${lat.toFixed(2)}°, ${lon.toFixed(2)}° — hours in local time — fetched ${upd}`
    + (airState === 'loading' ? ' (loading aerosol data…)' : '')
    + (airState === 'missing' ? ' (aerosol data unavailable; assuming clean air)' : '')
    + (json._stale ? ' (Open-Meteo unavailable or throttled; showing saved data)' : '');
}

async function load() {
  const lat = parseFloat(document.getElementById('aw-lat').value) || 0;
  const lon = parseFloat(document.getElementById('aw-lon').value) || 0;
  const status = document.getElementById('aw-status');
  const id = ++loadId;
  status.textContent = 'Loading forecast…';
  try {
    const json = await fetchWeather(lat, lon);
    if (id !== loadId) return;                        // a newer request superseded this one
    cols = buildCols(json, lat, lon);
    status.textContent = statusText(lat, lon, json, 'loading');
    draw(hoverIdx);

    const air = await json.airPromise;                // then refine transparency with aerosol data
    if (id !== loadId) return;
    if (air) { json._air = air.json; cols = buildCols(json, lat, lon); }
    status.textContent = statusText(lat, lon, json, air ? 'ok' : 'missing');
    draw(hoverIdx);
  } catch (err) {
    console.warn(err);
    if (id === loadId) status.textContent = 'Could not load forecast (' + err.message + '). Press Update to retry.';
  }
}

document.getElementById('aw-load').addEventListener('click', load);
document.getElementById('aw-theme').addEventListener('click', () => {
  darkMode = !darkMode;
  try { localStorage.setItem('aw-dark', darkMode ? '1' : '0'); } catch (e) {}
  applyTheme();
});
document.getElementById('aw-geo').addEventListener('click', () => {
  navigator.geolocation?.getCurrentPosition(p => {
    document.getElementById('aw-lat').value = p.coords.latitude.toFixed(2);
    document.getElementById('aw-lon').value = p.coords.longitude.toFixed(2);
    load();
  }, () => { document.getElementById('aw-status').textContent = 'Location unavailable'; });
});

applyTheme();
load();
setInterval(() => { if (!document.hidden) load(); }, 30 * 60 * 1000);   // skip while tab is hidden
