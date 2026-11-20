/*
 * sky_background.js  (v2)
 *
 * A transparent, monochrome canvas behind your page that shows the REAL northern sky
 * (looking north) for your location and the current time:
 *   - bright stars of the northern constellations (Big & Little Dipper, Cassiopeia, Cepheus, Draco,
 *     Cygnus, Lyra, Auriga, Perseus, Andromeda, plus Arcturus, Capella, Vega, Deneb...)
 *   - real satellites (CelesTrak "visual" group) via satellite.js, as they pass overhead
 *   - the real Moon position and phase (only drawn when it is in the northern view)
 *
 * Usage (Jekyll, home page only):
 *   <script src="{{ '/assets/js/sky_background.js' | relative_url }}" defer></script>
 *
 * Optional config, placed BEFORE the script tag:
 *   <script>window.SKY_CONFIG = { color: '#1b2a4a', moonMode: 'demo' };</script>
 */
(function () {
  'use strict';

  const cfg = Object.assign({
    // Observer (default: Boulder, CO). Change to taste.
    lat: 40.015, lon: -105.27, heightKm: 1.65,

    // Color: null = read the background color of your .topnav bar at load time.
    color: null,
    fallbackColor: '#1c2b4a',

    fov: 100,                 // degrees across the larger screen dimension
    timeScale: 20,             // 1 = real time. 600 = sky turns 10 min per second (fun for testing)
    fillerStars: 350,         // faint synthetic stars so the sky isn't sparse (0 = off)
    fillerSize: [4.5, 6.5],   // px size range of filler stars (real stars are 6.5-13 px)
    fillerAlpha: [0.4, 0.6],  // opacity range of filler stars (real stars are 0.6-0.95)
    constellationLines: true,
    lineAlpha: 0.4,           // line opacity (0-1)
    lineLighten: 0.5,         // 0 = same color as the stars, 1 = white
    lineWidth: 1,
    twinkle: 0.15,            // twinkle depth, 0 = steady, 0.15 = gentle dim, 0.5 = strong
    starGlyph: '\u2726',      // U+2726 BLACK FOUR POINTED STAR
    moonMode: 'real',         // 'real' | 'demo' (sweeps across the screen) | 'off'
    moonRadius: 16,           // px (exaggerated; the real Moon is tiny at this field of view)

    satellites: true,
    satelliteJsUrl: 'https://cdn.jsdelivr.net/npm/satellite.js@6.0.0/dist/satellite.min.js',
    // TLE sources, tried in order. Results are cached in the visitor's browser (tleCacheHours).
    tleUrls: [
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
    ],
    tleMaxAgeDays: 10,        // skip a TLE source whose data is older than this
    tleCacheHours: 6,
    satelliteSize: 6,         // icon unit in px (station ~12 px wide, payload ~7 px)
    labelPattern: /^(ISS|CSS|HST)/,   // satellites that get a text label

    zIndex: -1,
  }, window.SKY_CONFIG || {});

  const D2R = Math.PI / 180;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // Star catalog: [RA hours, Dec degrees, apparent magnitude]
  // ------------------------------------------------------------------
  const S = {
    // Ursa Major (Big Dipper)
    Dubhe: [11.062, 61.75, 1.8], Merak: [11.031, 56.38, 2.4], Phecda: [11.897, 53.69, 2.4],
    Megrez: [12.257, 57.03, 3.3], Alioth: [12.900, 55.96, 1.8], Mizar: [13.399, 54.93, 2.3],
    Alkaid: [13.792, 49.31, 1.9],
    // Ursa Minor (Little Dipper)
    Polaris: [2.530, 89.26, 2.0], Yildun: [17.537, 86.59, 4.3], EpsUMi: [16.766, 82.04, 4.2],
    ZetaUMi: [15.734, 77.79, 4.3], EtaUMi: [16.292, 75.76, 5.0], Pherkad: [15.345, 71.83, 3.0],
    Kochab: [14.845, 74.16, 2.1],
    // Cassiopeia
    Caph: [0.153, 59.15, 2.3], Schedar: [0.675, 56.54, 2.2], GamCas: [0.945, 60.72, 2.5],
    Ruchbah: [1.430, 60.24, 2.7], Segin: [1.907, 63.67, 3.4],
    // Cepheus
    Alderamin: [21.310, 62.59, 2.5], Alfirk: [21.478, 70.56, 3.2], Errai: [23.656, 77.63, 3.2],
    ZetaCep: [22.181, 58.20, 3.4], IotaCep: [22.828, 66.20, 3.5],
    // Draco
    Eltanin: [17.944, 51.49, 2.2], Rastaban: [17.507, 52.30, 2.8], Grumium: [17.892, 56.87, 3.7],
    NuDra: [17.536, 55.18, 4.9], Thuban: [14.073, 64.38, 3.7], Edasich: [15.416, 58.97, 3.3],
    EtaDra: [16.400, 61.51, 2.7], ZetaDra: [17.146, 65.71, 3.2], Altais: [19.209, 67.66, 3.1],
    // Cygnus
    Deneb: [20.691, 45.28, 1.25], Sadr: [20.370, 40.26, 2.2], Albireo: [19.512, 27.96, 3.1],
    Gienah: [20.770, 33.97, 2.5], DeltaCyg: [19.750, 45.13, 2.9],
    // Lyra
    Vega: [18.616, 38.78, 0.03], Sheliak: [18.835, 33.36, 3.5], Sulafat: [18.982, 32.69, 3.2],
    DeltaLyr: [18.908, 36.90, 4.2], ZetaLyr: [18.746, 37.60, 4.3],
    // Auriga
    Capella: [5.278, 46.00, 0.08], Menkalinan: [5.992, 44.95, 1.9], ThetaAur: [5.995, 37.21, 2.6],
    Elnath: [5.438, 28.61, 1.65], Hassaleh: [4.950, 33.17, 2.7],
    // Perseus
    Mirfak: [3.405, 49.86, 1.8], Algol: [3.136, 40.96, 2.1], EpsPer: [3.964, 40.01, 2.9],
    ZetaPer: [3.902, 31.88, 2.85], GamPer: [3.080, 53.51, 2.9], DelPer: [3.715, 47.79, 3.0],
    // Andromeda
    Alpheratz: [0.139, 29.09, 2.06], Mirach: [1.162, 35.62, 2.05], Almach: [2.065, 42.33, 2.26],
    // Other notable stars
    Arcturus: [14.261, 19.18, -0.05], Castor: [7.577, 31.89, 1.6], Pollux: [7.755, 28.03, 1.15],
    Altair: [19.846, 8.87, 0.76],
  };

  const LINES = [
    ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Dubhe'], ['Megrez', 'Alioth', 'Mizar', 'Alkaid'],
    ['Polaris', 'Yildun', 'EpsUMi', 'ZetaUMi', 'EtaUMi', 'Pherkad', 'Kochab', 'ZetaUMi'],
    ['Caph', 'Schedar', 'GamCas', 'Ruchbah', 'Segin'],
    ['Alderamin', 'Alfirk', 'Errai', 'IotaCep', 'ZetaCep', 'Alderamin'],
    ['Eltanin', 'Rastaban', 'NuDra', 'Grumium', 'Eltanin'],
    ['Thuban', 'Edasich', 'EtaDra', 'ZetaDra'],
    ['Deneb', 'Sadr', 'Albireo'], ['DeltaCyg', 'Sadr', 'Gienah'],
    ['Vega', 'ZetaLyr', 'DeltaLyr', 'Sulafat', 'Sheliak', 'ZetaLyr'],
    ['Capella', 'Menkalinan', 'ThetaAur', 'Elnath', 'Hassaleh', 'Capella'],
    ['GamPer', 'Mirfak', 'DelPer', 'EpsPer', 'ZetaPer'], ['Mirfak', 'Algol'],
    ['Alpheratz', 'Mirach', 'Almach'],
  ];

  // ------------------------------------------------------------------
  // Star objects (equatorial -> horizon is done per frame)
  // ------------------------------------------------------------------
  function makeStar(raRad, decDeg, size, alpha, filler) {
    const d = decDeg * D2R;
    return {
      ra: raRad, ca: Math.cos(raRad), sa: Math.sin(raRad),
      cd: Math.cos(d), sd: Math.sin(d),
      size, alpha, filler: !!filler,
      speed: 0.6 + Math.random() * 2, phase: Math.random() * 6.283,
      x: 0, y: 0, vis: false,
    };
  }

  const stars = [];
  const byName = {};
  Object.keys(S).forEach((name) => {
    const [ra, dec, mag] = S[name];
    const size = Math.max(6.5, 13 - 2.4 * mag);                   // brighter = bigger
    const alpha = Math.min(0.95, Math.max(0.6, 1.05 - 0.14 * mag));
    const st = makeStar(ra * 15 * D2R, dec, size, alpha);
    stars.push(st); byName[name] = st;
  });

  // Seeded RNG so the faint filler stars are the same every visit
  let seed = 20260101;
  function rnd() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (let i = 0; i < cfg.fillerStars; i++) {
    const sinMin = Math.sin(-10 * D2R);
    const dec = Math.asin(sinMin + rnd() * (1 - sinMin)) / D2R;  // uniform on the sphere
    const [s0, s1] = cfg.fillerSize, [a0, a1] = cfg.fillerAlpha;
    stars.push(makeStar(rnd() * 2 * Math.PI, dec, s0 + rnd() * (s1 - s0), a0 + rnd() * (a1 - a0), true));
  }

  // ------------------------------------------------------------------
  // Canvas + colors
  // ------------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-sky';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    zIndex: String(cfg.zIndex), pointerEvents: 'none',
  });
  const ctx = canvas.getContext('2d');

  let rgb = [28, 43, 74];
  const c = (a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

  function parseColor(str) {
    if (!str) return null;
    let m = str.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (m) {
      if (m[4] !== undefined && parseFloat(m[4]) === 0) return null; // transparent
      return [+m[1], +m[2], +m[3]];
    }
    m = str.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map((x) => x + x).join('');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    return null;
  }

  // The star glyph is rendered at the exact device-pixel size it will be drawn at (cached per
  // size), so small stars stay crisp instead of being blurred by down-scaling one big sprite.
  const spriteCache = new Map();
  function getSprite(px) {
    let cv = spriteCache.get(px);
    if (!cv) {
      cv = document.createElement('canvas');
      cv.width = cv.height = px;
      const sc = cv.getContext('2d');
      sc.fillStyle = c(1);
      sc.font = (px * 0.875) + 'px "Segoe UI Symbol","Apple Symbols","DejaVu Sans","Noto Sans Symbols2",sans-serif';
      sc.textAlign = 'center'; sc.textBaseline = 'middle';
      sc.fillText(cfg.starGlyph, px / 2, px * 0.53);
      spriteCache.set(px, cv);
    }
    return cv;
  }

  function pickColor() {
    let col = parseColor(cfg.color);
    if (!col) {
      for (const sel of ['.topnav', 'nav', 'header']) {
        const el = document.querySelector(sel);
        if (el) { col = parseColor(getComputedStyle(el).backgroundColor); if (col) break; }
      }
    }
    rgb = col || parseColor(cfg.fallbackColor);
    spriteCache.clear();
  }

  // ------------------------------------------------------------------
  // View geometry: stereographic projection looking due north
  // ------------------------------------------------------------------
  const phi = cfg.lat * D2R;
  const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
  let W = 0, H = 0, dpr = 1, k = 1, cosA0 = 1, sinA0 = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    spriteCache.clear();
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    k = (Math.max(W, H) / 2) / (2 * Math.tan(cfg.fov * D2R / 4));
    const a0full = 2 * Math.atan((H / 2) / (2 * k));
    const a0 = Math.min(a0full * 1.15, 60 * D2R); // centre altitude; horizon just below the bottom edge
    cosA0 = Math.cos(a0); sinA0 = Math.sin(a0);
  }

  // e/n/u = east/north/up unit vector. Writes screen x,y,vis into `out`.
  function project(e, n, u, out) {
    const zf = n * cosA0 + u * sinA0;
    const yu = -n * sinA0 + u * cosA0;
    if (u < -0.02 || zf < -0.6) { out.vis = false; return; }
    const s = 2 / (1 + zf);
    out.x = W / 2 + e * s * k;
    out.y = H / 2 - yu * s * k;
    out.vis = true;
  }

  // ------------------------------------------------------------------
  // Astronomy helpers
  // ------------------------------------------------------------------
  let simStart = Date.now(), perfStart = performance.now();
  function simDate(now) {
    return new Date(simStart + (now - perfStart) * cfg.timeScale);
  }

  function lstRad(date) {
    const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const gmst = 280.46061837 + 360.98564736629 * d;
    return (((gmst + cfg.lon) % 360) + 360) % 360 * D2R;
  }

  // Low-precision Sun + Moon (good to ~0.5 degree; plenty for a background)
  function sunMoon(date) {
    const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const eps = (23.4393 - 3.563e-7 * d) * D2R;

    const g = (357.528 + 0.9856003 * d) * D2R;
    const Ls = (280.460 + 0.9856474 * d + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * D2R;
    const sun = { x: Math.cos(Ls), y: Math.sin(Ls) * Math.cos(eps), z: Math.sin(Ls) * Math.sin(eps) };

    const Lm = (218.316 + 13.176396 * d) * D2R;
    const M = (134.963 + 13.064993 * d) * D2R;
    const F = (93.272 + 13.229350 * d) * D2R;
    const lon = Lm + 6.289 * D2R * Math.sin(M);
    const lat = 5.128 * D2R * Math.sin(F);
    const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
    const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
    let phase = ((lon - Ls) / (2 * Math.PI)) % 1;
    if (phase < 0) phase += 1;          // 0 = new, 0.5 = full
    return { sun, ra, dec, phase };
  }

  function drawMoon(x, y, r, phase) {
    // dark limb
    ctx.strokeStyle = c(0.35); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    // lit part
    const waxing = phase < 0.5;
    const kk = Math.cos(phase * 2 * Math.PI);   // 1 = new, -1 = full
    ctx.fillStyle = c(0.85);
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !waxing);
    ctx.ellipse(x, y, Math.abs(kk) * r, r, 0, Math.PI / 2, -Math.PI / 2, waxing ? kk > 0 : kk < 0);
    ctx.closePath();
    ctx.fill();
  }

  // ------------------------------------------------------------------
  // Satellites (satellite.js + TLEs)
  // ------------------------------------------------------------------
  let sats = [];            // [{ name, rec }]
  let above = [];           // satellites currently above the horizon (rescanned every 2 s)
  let lastScan = -1e9;
  let sat = null;           // the satellite.js namespace
  let observerGd = null;
  const EARTH_R = 6371;

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function fetchText(url, ms) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .finally(() => clearTimeout(timer));
  }

  function cacheGet(url) {
    try {
      const o = JSON.parse(localStorage.getItem('skytle:' + url) || 'null');
      if (o && Date.now() - o.t < cfg.tleCacheHours * 3600e3) return o.text;
    } catch (e) { /* storage unavailable */ }
    return null;
  }
  function cacheSet(url, text) {
    try { localStorage.setItem('skytle:' + url, JSON.stringify({ t: Date.now(), text })); } catch (e) { /* ignore */ }
  }

  // ---- Satellite types, classified from the TLE name ----
  const EO_RE = /NOAA|METOP|TERRA|AQUA|LANDSAT|SENTINEL|GOES|FENGYUN|FY-|SUOMI|JPSS|ALOS|RESURS|CARTOSAT|SPOT|PLEIADES|WORLDVIEW|ENVISAT|OCEANSAT|RADARSAT|DMSP|METEOR|NIMBUS|TIROS|ERS-/;
  function classify(name) {
    const n = name.toUpperCase();
    if (/\bDEB\b/.test(n)) return 'debris';                                   // fragments
    if (/R\/B/.test(n)) return 'rocket';                                      // spent rocket bodies
    if (/^(ISS|CSS)\b|TIANHE|TIANGONG|WENTIAN|MENGTIAN|ZARYA/.test(n)) return 'station';
    if (/^HST\b|HUBBLE/.test(n)) return 'telescope';
    if (EO_RE.test(n)) return 'earthobs';                                     // weather / Earth observation
    return 'payload';                                                         // everything else
  }

  // Draw one satellite icon at (x, y). `ang` = direction of travel, `spin` = tumble angle.
  function drawSatIcon(type, x, y, ang, spin, a, u) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(type === 'rocket' || type === 'debris' ? spin : ang);
    ctx.fillStyle = c(a); ctx.strokeStyle = c(a); ctx.lineWidth = 1;
    const panel = c(a * 0.7);
    switch (type) {
      case 'station':            // long module along travel, big truss + panels across it
        ctx.fillRect(-1.6 * u, -0.25 * u, 3.2 * u, 0.5 * u);
        ctx.fillRect(-0.2 * u, -2 * u, 0.4 * u, 4 * u);
        ctx.fillStyle = panel;
        for (const sy of [-1, 1]) for (const sx of [-1, 1]) ctx.fillRect(sx * 0.75 * u - 0.3 * u, sy * 1.5 * u - 0.5 * u, 0.6 * u, u);
        break;
      case 'telescope':          // tube with an open aperture ring and two side panels
        ctx.fillRect(-1.5 * u, -0.6 * u, 3 * u, 1.2 * u);
        ctx.beginPath(); ctx.arc(1.5 * u, 0, 0.7 * u, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = panel;
        ctx.fillRect(-0.9 * u, -2.2 * u, 0.8 * u, 1.4 * u);
        ctx.fillRect(-0.9 * u, 0.8 * u, 0.8 * u, 1.4 * u);
        break;
      case 'earthobs':           // box body, one long solar wing
        ctx.fillRect(-0.6 * u, -0.6 * u, 1.2 * u, 1.2 * u);
        ctx.fillStyle = panel;
        ctx.fillRect(-0.4 * u, 0.8 * u, 0.8 * u, 2.6 * u);
        break;
      case 'rocket':             // hollow cylinder (spent stage)
        ctx.strokeRect(-1.4 * u, -0.5 * u, 2.8 * u, u);
        break;
      case 'debris':             // tiny tumbling X
        ctx.beginPath();
        ctx.moveTo(-0.7 * u, -0.7 * u); ctx.lineTo(0.7 * u, 0.7 * u);
        ctx.moveTo(-0.7 * u, 0.7 * u); ctx.lineTo(0.7 * u, -0.7 * u);
        ctx.stroke();
        break;
      default:                   // generic payload: diamond body, two wings
        ctx.beginPath();
        ctx.moveTo(0, -0.8 * u); ctx.lineTo(0.8 * u, 0); ctx.lineTo(0, 0.8 * u); ctx.lineTo(-0.8 * u, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = panel;
        ctx.fillRect(-0.4 * u, -2.5 * u, 0.8 * u, 1.5 * u);
        ctx.fillRect(-0.4 * u, 1 * u, 0.8 * u, 1.5 * u);
    }
    ctx.restore();
  }

  function parseTLE(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out = [];
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].startsWith('1 ') && lines[i + 1].startsWith('2 ')) {
        const prev = lines[i - 1];
        const name = prev && !prev.startsWith('1 ') && !prev.startsWith('2 ') ? prev : '';
        try {
          let h = 0; for (let j = 0; j < name.length; j++) h = (h * 31 + name.charCodeAt(j)) | 0;
          out.push({
            name, type: classify(name), rec: sat.twoline2satrec(lines[i], lines[i + 1]),
            spinRate: 0.3 + (Math.abs(h) % 10) * 0.15, spinPhase: (Math.abs(h) % 628) / 100,
          });
        } catch (e) { /* skip bad TLE */ }
        i++;
      }
    }
    return out;
  }

  function ageDays(rec) {
    const yr = rec.epochyr < 57 ? 2000 + rec.epochyr : 1900 + rec.epochyr;
    const epoch = Date.UTC(yr, 0, 1) + (rec.epochdays - 1) * 86400000;
    return (Date.now() - epoch) / 86400000;
  }

  async function initSatellites() {
    if (!cfg.satellites) return;
    try {
      if (!window.satellite) await loadScript(cfg.satelliteJsUrl);
      sat = window.satellite;
      observerGd = { longitude: cfg.lon * D2R, latitude: cfg.lat * D2R, height: cfg.heightKm };
    } catch (e) { return; }

    let best = null;
    for (const url of cfg.tleUrls) {
      try {
        let text = cacheGet(url);
        if (!text) { text = await fetchText(url, 8000); cacheSet(url, text); }
        const list = parseTLE(text);
        if (!list.length) continue;
        if (ageDays(list[0].rec) <= cfg.tleMaxAgeDays) { sats = list; return; }
        if (!best) best = list;   // stale, but better than nothing
      } catch (e) { /* try next source */ }
    }
    if (best) sats = best;
  }

  function satState(rec, date) {
    let pv;
    try { pv = sat.propagate(rec, date); } catch (e) { return null; }
    if (!pv || !pv.position) return null;
    const ecf = sat.eciToEcf(pv.position, sat.gstime(date));
    const la = sat.ecfToLookAngles(observerGd, ecf);
    return { az: la.azimuth, el: la.elevation, eci: pv.position };
  }

  function azelToScreen(az, el, out) {
    const ce = Math.cos(el);
    project(ce * Math.sin(az), ce * Math.cos(az), Math.sin(el), out);
  }

  // ------------------------------------------------------------------
  // Main loop
  // ------------------------------------------------------------------
  const tmp = { x: 0, y: 0, vis: false };
  const tmp2 = { x: 0, y: 0, vis: false };
  let running = true;

  function frame(now) {
    if (!running) return;
    const date = simDate(now);
    const t = now / 1000;
    const lst = lstRad(date);
    const cL = Math.cos(lst), sL = Math.sin(lst);

    ctx.clearRect(0, 0, W, H);

    // Stars -> screen
    for (const s of stars) {
      const cosH = cL * s.ca + sL * s.sa;
      const sinH = sL * s.ca - cL * s.sa;
      const e = -s.cd * sinH;
      const n = s.sd * cosPhi - s.cd * sinPhi * cosH;
      const u = s.sd * sinPhi + s.cd * cosPhi * cosH;
      project(e, n, u, s);
    }

    // Constellation lines (lighter tint of the star color)
    if (cfg.constellationLines) {
      const L = cfg.lineLighten;
      ctx.strokeStyle = `rgba(${Math.round(rgb[0] + (255 - rgb[0]) * L)},${Math.round(rgb[1] + (255 - rgb[1]) * L)},${Math.round(rgb[2] + (255 - rgb[2]) * L)},${cfg.lineAlpha})`;
      ctx.lineWidth = cfg.lineWidth;
      ctx.beginPath();
      for (const line of LINES) {
        for (let i = 0; i < line.length - 1; i++) {
          const a = byName[line[i]], b = byName[line[i + 1]];
          if (a.vis && b.vis) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        }
      }
      ctx.stroke();
    }

    // Stars (U+2726 glyph, pixel-aligned so they never smear)
    for (const s of stars) {
      if (!s.vis) continue;
      const tw = (reduceMotion || s.filler) ? 1
        : 1 - cfg.twinkle * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const px = Math.max(4, Math.round(s.size * dpr));
      ctx.globalAlpha = s.alpha * tw;
      ctx.drawImage(getSprite(px),
        Math.round(s.x * dpr - px / 2) / dpr, Math.round(s.y * dpr - px / 2) / dpr,
        px / dpr, px / dpr);
    }
    ctx.globalAlpha = 1;

    // Moon
    const sm = sunMoon(date);
    if (cfg.moonMode === 'real') {
      const cd = Math.cos(sm.dec), sd = Math.sin(sm.dec);
      const ca = Math.cos(sm.ra), sa = Math.sin(sm.ra);
      const cosH = cL * ca + sL * sa, sinH = sL * ca - cL * sa;
      project(-cd * sinH, sd * cosPhi - cd * sinPhi * cosH, sd * sinPhi + cd * cosPhi * cosH, tmp);
      const m = cfg.moonRadius;
      if (tmp.vis && tmp.x > -m && tmp.x < W + m && tmp.y > -m && tmp.y < H + m) drawMoon(tmp.x, tmp.y, m, sm.phase);
    } else if (cfg.moonMode === 'demo') {
      const f = ((t % 120) / 120);
      drawMoon(-cfg.moonRadius + f * (W + 2 * cfg.moonRadius), H * 0.9 - Math.sin(Math.PI * f) * H * 0.55,
               cfg.moonRadius, sm.phase);
    }

    // Satellites
    if (sat && sats.length) {
      if (now - lastScan > 2000) {
        lastScan = now;
        above = sats.filter((s) => { const st = satState(s.rec, date); return st && st.el > -0.05; });
      }
      const past = new Date(date.getTime() - 20000);
      ctx.font = '10px sans-serif';
      for (const s of above) {
        const st = satState(s.rec, date);
        if (!st || st.el < 0) continue;
        azelToScreen(st.az, st.el, tmp);
        if (!tmp.vis) continue;

        // sunlit? (cylindrical Earth-shadow test; Earth-shadowed satellites are drawn faint)
        const r = st.eci, sv = sm.sun;
        const dot = r.x * sv.x + r.y * sv.y + r.z * sv.z;
        const r2 = r.x * r.x + r.y * r.y + r.z * r.z;
        const shadow = dot < 0 && (r2 - dot * dot) < EARTH_R * EARTH_R;
        const a = shadow ? 0.2 : 0.95;

        // short trail (position 20 s ago) + direction of travel
        let ang = 0;
        const p0 = satState(s.rec, past);
        if (p0 && p0.el > 0) {
          azelToScreen(p0.az, p0.el, tmp2);
          if (tmp2.vis) {
            ang = Math.atan2(tmp.y - tmp2.y, tmp.x - tmp2.x);
            const g = ctx.createLinearGradient(tmp2.x, tmp2.y, tmp.x, tmp.y);
            g.addColorStop(0, c(0)); g.addColorStop(1, c(a * 0.6));
            ctx.strokeStyle = g; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(tmp2.x, tmp2.y); ctx.lineTo(tmp.x, tmp.y); ctx.stroke();
          }
        }
        drawSatIcon(s.type, tmp.x, tmp.y, ang, s.spinPhase + t * s.spinRate, a, cfg.satelliteSize);
        if (cfg.labelPattern.test(s.name) && s.type !== 'debris' && s.type !== 'rocket') {
          ctx.fillStyle = c(a * 0.9);
          ctx.fillText(s.name.replace(/\s*\(.*\)/, ''), tmp.x + 6, tmp.y - 5);
        }
      }
    }

    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  function start() {
    document.body.prepend(canvas);
    pickColor();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('load', pickColor);   // re-read once all CSS has applied
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
    initSatellites();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
