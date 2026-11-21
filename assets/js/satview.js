(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     SATELLITE PERSPECTIVE VIEWER
     Payload view: every pixel is a ray from the satellite through a
     pinhole camera, intersected with the WGS84 ellipsoid, coloured
     from an equirectangular texture drawn once with D3. Pixels outside
     the payload's FOV shape (rect / ellipse / diamond / custom polygon)
     are masked.
     Payload coverage: interactive D3 orthographic globe showing the
     payload footprint plus the satellite's complete visible Earth
     (horizon) region.
  ══════════════════════════════════════════════════════════ */

  var A = 6378.137, B = 6356.752314245;          /* WGS84, km */
  var E2 = 1 - (B * B) / (A * A);
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var TW = 4096, TH = 2048;                      /* texture size */
  var BASE_GAMMA = 0.75, BASE_GAIN = 1.15;       /* lighten the Blue Marble base (gamma < 1 lifts shadows; gain scales) */

  var DEFAULT_POLY = '-8, 6\n8, 6\n11, -2\n0, -8\n-11, -2';

  var PRESETS = {
    goes19: { lat: 0,  lon: -75.2,  alt: 35786, fov: 17.4, az: 0, off: 0, px: 5424 },
    goes18: { lat: 0,  lon: -136.9, alt: 35786, fov: 17.4, az: 0, off: 0, px: 5424 },
    h9:     { lat: 0,  lon: 140.7,  alt: 35786, fov: 17.4, az: 0, off: 0, px: 5424 },
    gk2a:   { lat: 0,  lon: 128.2,  alt: 35786, fov: 17.4, az: 0, off: 0, px: 5424 },
    met12:  { lat: 0,  lon: 0,      alt: 35786, fov: 17.4, az: 0, off: 0, px: 5424 },
    iss:    { lat: 28, lon: -80,    alt: 420,   fov: 70,   az: 90, off: 30, px: 4096 },
    leo:    { lat: 39, lon: -105,   alt: 705,   fov: 15,   az: 0, off: 0, px: 6160 },
  };

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('sp-canvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  var mm = $('sp-minimap'), mctx = mm.getContext('2d');
  var img = ctx.createImageData(W, H);
  var worldTopo = null, lakesGeo = null, riversGeo = null, statesGeo = null;   /* Natural Earth layers */
  var baseImg = null;                                         /* Blue Marble base image (optional) */
  var tex = null, raf = null, lastCam = null;

  /* Ground-coverage globe state. auto = follow the footprint; once the user
     drags / zooms, auto turns off and view holds until "Fit footprint". */
  var cov = { auto: true, fast: false, view: null, data: null, raf: null };

  /* == Vector helpers == */
  var dot = function (a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; };
  var cross = function (a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; };
  var add = function (a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; };
  var mul = function (a, s) { return [a[0]*s, a[1]*s, a[2]*s]; };
  var unit = function (a) { var n = Math.sqrt(dot(a, a)); return mul(a, 1 / n); };

  /* Geodetic (deg, deg, km) → ECEF km */
  function ecef(latD, lonD, h) {
    var la = latD * D2R, lo = lonD * D2R, s = Math.sin(la), c = Math.cos(la);
    var N = A / Math.sqrt(1 - E2 * s * s);
    return [(N + h) * c * Math.cos(lo), (N + h) * c * Math.sin(lo), (N * (1 - E2) + h) * s];
  }

  /* Local East / North / Up unit vectors in ECEF */
  function enu(latD, lonD) {
    var la = latD * D2R, lo = lonD * D2R;
    return {
      E: [-Math.sin(lo), Math.cos(lo), 0],
      N: [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)],
      U: [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)],
    };
  }

  /* Solar subpoint (Meeus low-precision, same as mesoviewer.js) */
  function solarPosition(ms) {
    var n = ms / 86400000 + 2440587.5 - 2451545.0;
    var L = (280.460 + 0.9856474 * n) % 360, g = (357.528 + 0.9856003 * n) % 360 * D2R;
    var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * D2R;
    var eps = (23.439 - 0.0000004 * n) * D2R;
    var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    var dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    var gmst = (280.46061837 + 360.98564736629 * n) % 360;
    var lon = (ra * R2D - gmst + 720) % 360;
    return { lat: dec * R2D, lon: lon > 180 ? lon - 360 : lon };
  }

  /* == Inputs == */
  function num(id, def, lo, hi) {
    var v = parseFloat($(id).value);
    if (isNaN(v)) v = def;
    return Math.min(hi === undefined ? Infinity : hi, Math.max(lo === undefined ? -Infinity : lo, v));
  }

  function readInputs() {
    var t = $('sp-time').value ? new Date($('sp-time').value + ':00Z') : new Date();
    return {
      lat: num('sp-lat', 0, -90, 90), lon: num('sp-lon', 0, -180, 180), alt: num('sp-alt', 35786, 100),
      shape: $('sp-shape').value, poly: $('sp-poly').value,
      fovw: num('sp-fovw', 17.4, 0.05, 170), fovh: num('sp-fovh', 17.4, 0.05, 170),
      roll: num('sp-roll', 0),
      mode: $('sp-mode').value, az: num('sp-az', 0), off: num('sp-off', 0, 0, 180),
      tlat: num('sp-tlat', 0, -90, 90), tlon: num('sp-tlon', 0, -180, 180),
      time: isNaN(t) ? Date.now() : t.getTime(), light: $('sp-light').value,
      def: $('sp-def').value, sim: $('sp-sim').checked,
      pixx: Math.round(num('sp-pixx', 5424, 1, 100000)), pixy: Math.round(num('sp-pixy', 5424, 1, 100000)),
      pitch: num('sp-pitch', 10, 0.01, 1000), focal: num('sp-focal', 500, 0.1, 100000),
    };
  }

  /* ══════════════════════════════════════════════════════════
     PAYLOAD FOV SHAPE
     Shapes live in the camera's tangent plane (x right, y up, units
     of tan(angle)), which is exactly what a pinhole camera images.
     Custom polygons are entered as angular offsets in degrees.
  ══════════════════════════════════════════════════════════ */
  function parsePoly(txt) {
    var pts = [];
    String(txt).split(/[\n;]+/).forEach(function (ln) {
      var m = ln.match(/[-+]?(?:\d+\.?\d*|\.\d+)/g);
      if (m && m.length >= 2) pts.push([parseFloat(m[0]), parseFloat(m[1])]);
    });
    return pts;
  }

  function shapeGeom(p) {
    var hw = Math.tan(p.fovw * D2R / 2), hh = Math.tan(p.fovh * D2R / 2), poly = [], ok = true, i;
    var shape = p.shape, tn = function (d) { return Math.tan(Math.max(-85, Math.min(85, d)) * D2R); };

    if (shape === 'custom') {
      var v = parsePoly(p.poly);
      if (v.length >= 3) {
        poly = v.map(function (q) { return [tn(q[0]), tn(q[1])]; });
        hw = hh = 0;
        poly.forEach(function (q) { hw = Math.max(hw, Math.abs(q[0])); hh = Math.max(hh, Math.abs(q[1])); });
        hw = Math.max(hw, 1e-4); hh = Math.max(hh, 1e-4);
      } else { ok = false; shape = 'rect'; }
    }
    if (shape === 'rect') poly = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]];
    if (shape === 'diamond') poly = [[0, hh], [hw, 0], [0, -hh], [-hw, 0]];
    if (shape === 'ellipse') {
      for (i = 0; i < 96; i++) poly.push([hw * Math.sin(i / 96 * 2 * Math.PI), hh * Math.cos(i / 96 * 2 * Math.PI)]);
    }
    /* image window: square, sized to the larger extent (small margin so a
       non-rectangular outline is not clipped by the canvas edge) */
    var th = Math.max(hw, hh) * (shape === 'rect' ? 1 : 1.04);
    return { shape: shape, hw: hw, hh: hh, th: th, poly: poly, ok: ok };
  }

  function makeInside(g) {
    var hw = g.hw, hh = g.hh, poly = g.poly;
    if (g.shape === 'rect')    return function (x, y) { return Math.abs(x) <= hw && Math.abs(y) <= hh; };
    if (g.shape === 'ellipse') return function (x, y) { var a = x / hw, b = y / hh; return a*a + b*b <= 1; };
    if (g.shape === 'diamond') return function (x, y) { return Math.abs(x) / hw + Math.abs(y) / hh <= 1; };
    return function (x, y) {                                   /* even-odd polygon test */
      var c = false, n = poly.length;
      for (var i = 0, j = n - 1; i < n; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      return c;
    };
  }

  /* Densify the outline (tangent-plane straight edges) to ~192 samples */
  function boundary(poly) {
    var out = [], n = poly.length, per = Math.max(2, Math.ceil(192 / n));
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n];
      for (var k = 0; k < per; k++) out.push([a[0] + (b[0] - a[0]) * k / per, a[1] + (b[1] - a[1]) * k / per]);
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════
     CAMERA
     Boresight f = −Up·cosθ + H·sinθ  (θ = off-nadir, H = horizontal
     unit vector at azimuth az). Image "up" lies in the Up/H plane,
     so with θ=0 and az=0 the picture is north-up. Roll spins the
     camera about the boresight.
  ══════════════════════════════════════════════════════════ */
  function buildCamera(p) {
    var P = ecef(p.lat, p.lon, p.alt), L = enu(p.lat, p.lon);
    var az = p.az, off = p.off;

    if (p.mode === 'target') {
      var f0 = unit(add(ecef(p.tlat, p.tlon, 0), mul(P, -1)));
      off = Math.acos(Math.max(-1, Math.min(1, -dot(f0, L.U)))) * R2D;
      az = Math.atan2(dot(f0, L.E), dot(f0, L.N)) * R2D;
      $('sp-az').value = az.toFixed(2);
      $('sp-off').value = off.toFixed(2);
    }

    var Hh = add(mul(L.N, Math.cos(az * D2R)), mul(L.E, Math.sin(az * D2R)));
    var th = off * D2R, r = p.roll * D2R;
    var f = add(mul(L.U, -Math.cos(th)), mul(Hh, Math.sin(th)));
    var up0 = add(mul(L.U, Math.sin(th)), mul(Hh, Math.cos(th)));
    var right0 = cross(f, up0);
    var g = shapeGeom(p);
    return {
      P: P, f: f, L: L, az: az, off: off,
      up: add(mul(up0, Math.cos(r)), mul(right0, Math.sin(r))),
      right: add(mul(right0, Math.cos(r)), mul(up0, -Math.sin(r))),
      hw: g.hw, hh: g.hh, th: g.th, poly: g.poly, shape: g.shape, polyOk: g.ok, inside: makeInside(g),
    };
  }

  /* Ray/ellipsoid intersection. Returns t > 0 on hit, otherwise a
     negative number whose magnitude is the miss distance from Earth's
     centre (used for the atmospheric limb glow). */
  function hitT(px, py, pz, dx, dy, dz) {
    var sx = 1 / A, sz = 1 / B;
    var ax = dx*sx, ay = dy*sx, az = dz*sz, bx = px*sx, by = py*sx, bz = pz*sz;
    var a = ax*ax + ay*ay + az*az, b = 2 * (ax*bx + ay*by + az*bz), c = bx*bx + by*by + bz*bz - 1;
    var disc = b*b - 4*a*c;
    if (disc >= 0) { var t = (-b - Math.sqrt(disc)) / (2*a); if (t > 0) return t; }
    var pd = px*dx + py*dy + pz*dz;
    if (pd >= 0) return -1e9;
    return -Math.sqrt(Math.max(0, px*px + py*py + pz*pz - pd*pd));
  }

  var toLL = function (q) {
    return [Math.atan2(q[1], q[0]) * R2D, Math.atan2(q[2] / (B * B), Math.hypot(q[0], q[1]) / (A * A)) * R2D];
  };

  /* Ground point under tangent-plane coords (tx, ty), or null. */
  function groundAt(cam, tx, ty) {
    var d = unit(add(add(cam.f, mul(cam.right, tx)), mul(cam.up, ty)));
    var t = hitT(cam.P[0], cam.P[1], cam.P[2], d[0], d[1], d[2]);
    if (t <= 0) return null;
    var ll = toLL(add(cam.P, mul(d, t)));
    return { lon: ll[0], lat: ll[1], range: t };
  }

  /* Detector pixel size in the camera tangent plane (tan units).
     Optics mode: pitch / focal length. FOV mode: FOV extent / pixel count. */
  function pixelTan(p, cam) {
    if (p.def === 'optics') { var t = p.pitch * 1e-3 / p.focal; return { x: t, y: t }; }
    return { x: 2 * cam.hw / p.pixx, y: 2 * cam.hh / p.pixy };
  }

  /* Ground sample distance (m) of one pixel at tangent coords (tx, ty): ground
     chord between the ray one half-pixel either side, along image x and y. */
  function gsdAt(cam, tx, ty, px, py) {
    var e = function (g) { return g ? ecef(g.lat, g.lon, 0) : null; };
    var a = e(groundAt(cam, tx - px / 2, ty)), b = e(groundAt(cam, tx + px / 2, ty));
    var c = e(groundAt(cam, tx, ty - py / 2)), d = e(groundAt(cam, tx, ty + py / 2));
    if (!a || !b || !c || !d) return null;
    var dist = function (u, v) { var w = add(u, mul(v, -1)); return Math.sqrt(dot(w, w)) * 1000; };
    return [dist(a, b), dist(c, d)];
  }

  var fmtLen = function (m) { return m >= 1000 ? (m / 1000).toFixed(2) + ' km' : m.toFixed(m < 10 ? 2 : 1) + ' m'; };

  /* Point on the satellite horizon (limb) at azimuth az (rad) around nadir:
     bisect the off-nadir angle to the last ray that still touches the
     ellipsoid. Returns ECEF km, or null. */
  function horizonPoint(cam, az) {
    var P = cam.P, L = cam.L, rad = Math.sqrt(dot(P, P));
    var hz = add(mul(L.N, Math.cos(az)), mul(L.E, Math.sin(az)));
    var dirAt = function (th) { return add(mul(L.U, -Math.cos(th)), mul(hz, Math.sin(th))); };
    var lo = 0, hi = Math.min(1.5, Math.asin(Math.min(1, A / rad)) + 0.02), d, t;
    for (var it = 0; it < 28; it++) {
      var mid = (lo + hi) / 2; d = dirAt(mid);
      if (hitT(P[0], P[1], P[2], d[0], d[1], d[2]) > 0) lo = mid; else hi = mid;
    }
    d = dirAt(lo); t = hitT(P[0], P[1], P[2], d[0], d[1], d[2]);
    return t > 0 ? add(P, mul(d, t)) : null;
  }

  /* Complete visible-Earth outline, ordered clockwise seen from outside. */
  function horizonRing(cam) {
    var out = [];
    for (var k = 0; k < 360; k++) { var q = horizonPoint(cam, k * D2R); if (q) out.push(toLL(q)); }
    return out;
  }

  /* ECEF point → camera tangent-plane coords (null if behind the camera) */
  function toTangent(cam, q) {
    var d = add(q, mul(cam.P, -1)), z = dot(d, cam.f);
    return z > 0 ? [dot(d, cam.right) / z, dot(d, cam.up) / z] : null;
  }

  /* Payload footprint = the FOV outline on the ground, extended to the limb
     wherever the FOV runs off the Earth's disk, PLUS the stretch of satellite
     horizon that lies inside the FOV. Together they form the true outline of
     the visible footprint. Returns an array of [lon,lat] polylines. */
  function footprintSegs(cam) {
    var pts = boundary(cam.poly), n = pts.length, segs = [], cur = [], i, j, k;
    var hit = pts.map(function (q) { var g = groundAt(cam, q[0], q[1]); return g ? [g.lon, g.lat] : null; });

    /* last ground hit walking along the tangent-plane edge from a (hit) toward b (miss) */
    var limb = function (a, b) {
      var lo = 0, hi = 1;
      var at = function (m) { return groundAt(cam, a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m); };
      for (var it = 0; it < 30; it++) { var m = (lo + hi) / 2; if (at(m)) lo = m; else hi = m; }
      var g = at(lo); return g ? [g.lon, g.lat] : null;
    };

    /* 1. FOV outline on the ground, ending exactly at the limb */
    var s = hit.indexOf(null);
    if (s < 0) { segs.push(hit.concat([hit[0]])); return segs; }   /* whole FOV on the disk */
    for (k = 0; k < n; k++) {
      i = (s + k) % n; j = (i + 1) % n;
      if (hit[i]) {
        cur.push(hit[i]);
        if (!hit[j]) { var e = limb(pts[i], pts[j]); if (e) cur.push(e); if (cur.length > 1) segs.push(cur); cur = []; }
      } else if (hit[j]) { var st = limb(pts[j], pts[i]); cur = st ? [st] : []; }
    }

    /* 2. horizon arcs inside the FOV (ends refined by bisecting in azimuth) */
    var N = 360, qs = [], inn = [];
    var insideAz = function (az) {
      var q = horizonPoint(cam, az), t = q && toTangent(cam, q);
      return !!(t && cam.inside(t[0], t[1]));
    };
    for (k = 0; k < N; k++) { qs.push(horizonPoint(cam, k * D2R)); inn.push(insideAz(k * D2R)); }
    var edgeAt = function (aIn, aOut) {
      var lo = aIn, hi = aOut;
      for (var it = 0; it < 22; it++) { var m = (lo + hi) / 2; if (insideAz(m)) lo = m; else hi = m; }
      return toLL(horizonPoint(cam, lo));
    };
    var s2 = inn.indexOf(false);
    if (s2 < 0) { var ring = qs.map(toLL); segs.push(ring.concat([ring[0]])); return segs; }
    cur = [];
    for (k = 0; k < N; k++) {
      i = (s2 + k) % N; j = (i + 1) % N;
      if (inn[i]) {
        cur.push(toLL(qs[i]));
        if (!inn[j]) { cur.push(edgeAt(i * D2R, (i + 1) * D2R)); segs.push(cur); cur = []; }
      } else if (inn[j]) { cur = [edgeAt((i + 1) * D2R, i * D2R)]; }
    }
    return segs;
  }

  /* ══════════════════════════════════════════════════════════
     EARTH TEXTURE  (equirectangular, drawn once with D3)
  ══════════════════════════════════════════════════════════ */
  function buildTexture() {
    var c = document.createElement('canvas');
    c.width = TW; c.height = TH;
    var g = c.getContext('2d');
    g.fillStyle = '#0a2a4a'; g.fillRect(0, 0, TW, TH);
    var path = d3.geoPath(d3.geoEquirectangular().scale(TW / (2 * Math.PI)).translate([TW / 2, TH / 2]), g);

    if (baseImg) {                                   /* NASA Blue Marble (equirectangular, -180..180 / 90..-90) */
      g.imageSmoothingQuality = 'high';
      g.drawImage(baseImg, 0, 0, TW, TH);
      var id = g.getImageData(0, 0, TW, TH), px = id.data, lut = new Uint8ClampedArray(256), q;
      for (q = 0; q < 256; q++) lut[q] = 255 * Math.min(1, BASE_GAIN * Math.pow(q / 255, BASE_GAMMA));
      for (q = 0; q < px.length; q += 4) { px[q] = lut[px[q]]; px[q + 1] = lut[px[q + 1]]; px[q + 2] = lut[px[q + 2]]; }
      g.putImageData(id, 0, 0);
    } else if (worldTopo) {                          /* fallback: flat vector land */
      g.beginPath(); path(topojson.feature(worldTopo, worldTopo.objects.land));
      g.fillStyle = '#4b6e3e'; g.fill();
    }
    if (riversGeo) {                                 /* line weight follows river scalerank */
      g.strokeStyle = baseImg ? 'rgba(95,165,220,0.6)' : '#3f86bd';
      riversGeo.features.forEach(function (f) {
        var rk = f.properties.scalerank;
        g.beginPath(); path(f); g.lineWidth = rk <= 2 ? 2 : rk <= 4 ? 1.3 : 0.9; g.stroke();
      });
    }
    if (lakesGeo && !baseImg) {                      /* the imagery already shows lakes */
      g.beginPath(); path(lakesGeo);
      g.fillStyle = '#14507d'; g.fill();
      g.strokeStyle = 'rgba(130,195,235,0.55)'; g.lineWidth = 0.8; g.stroke();
    }
    if (worldTopo) {
      g.beginPath();
      path(topojson.mesh(worldTopo, worldTopo.objects.countries, function (a, b) { return a !== b; }));
      g.strokeStyle = baseImg ? 'rgba(255,255,230,0.4)' : 'rgba(240,240,200,0.55)';
      g.lineWidth = 1.2; g.stroke();
    }
    if (statesGeo) {                                 /* US states + Canadian provinces/territories */
      g.beginPath(); path(statesGeo);
      g.strokeStyle = baseImg ? 'rgba(255,255,230,0.3)' : 'rgba(240,240,200,0.3)';
      g.lineWidth = 0.9; g.stroke();
    }
    if ($('sp-grat').checked) {
      g.beginPath(); path(d3.geoGraticule().step([10, 10])());
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; g.stroke();
    }
    tex = g.getImageData(0, 0, TW, TH).data;
  }

  /* ══════════════════════════════════════════════════════════
     CAMERA RENDER
  ══════════════════════════════════════════════════════════ */
  function render() {
    raf = null;
    if (!tex) buildTexture();
    var p = readInputs();
    if (p.def === 'optics') {                        /* FOV follows from detector size + focal length */
      var ang = function (n) { return Math.min(170, Math.max(0.05, 2 * Math.atan(n * p.pitch * 1e-3 / (2 * p.focal)) * R2D)); };
      p.fovw = ang(p.pixx); p.fovh = ang(p.pixy);
      $('sp-fovw').value = p.fovw.toFixed(3); $('sp-fovh').value = p.fovh.toFixed(3);
    }
    var cam = buildCamera(p), pt = pixelTan(p, cam);
    lastCam = cam;

    var sun = solarPosition(p.time), sl = sun.lat * D2R, so = sun.lon * D2R;
    var sX = Math.cos(sl) * Math.cos(so), sY = Math.cos(sl) * Math.sin(so), sZ = Math.sin(sl);
    var P0 = cam.P[0], P1 = cam.P[1], P2 = cam.P[2];
    var f = cam.f, rt = cam.right, up = cam.up, th = cam.th, inside = cam.inside;
    var buf = new Uint32Array(img.data.buffer);
    var daylight = p.light === 'day';
    var sim = p.sim, ptx = pt.x, pty = pt.y, gx = p.pixx * ptx / 2, gy = p.pixy * pty / 2;
    var B2 = B * B, A2 = A * A, MASK = (255 << 24) | (13 << 16) | (9 << 8) | 7;

    for (var j = 0; j < H; j++) {
      var y = (1 - 2 * (j + 0.5) / H) * th;
      for (var i = 0; i < W; i++) {
        var x = (2 * (i + 0.5) / W - 1) * th;
        if (!inside(x, y)) { buf[j * W + i] = MASK; continue; }     /* outside payload FOV */
        if (sim) {                                                  /* snap to the centre of the detector pixel */
          if (Math.abs(x) > gx || Math.abs(y) > gy) { buf[j * W + i] = MASK; continue; }
          x = (Math.min(p.pixx - 1, Math.floor((x + gx) / ptx)) + 0.5) * ptx - gx;
          y = (Math.min(p.pixy - 1, Math.floor((y + gy) / pty)) + 0.5) * pty - gy;
        }

        var dx = f[0] + x * rt[0] + y * up[0], dy = f[1] + x * rt[1] + y * up[1], dz = f[2] + x * rt[2] + y * up[2];
        var inv = 1 / Math.sqrt(dx*dx + dy*dy + dz*dz);
        dx *= inv; dy *= inv; dz *= inv;

        var t = hitT(P0, P1, P2, dx, dy, dz), r, g, b;
        if (t > 0) {
          var qx = P0 + t * dx, qy = P1 + t * dy, qz = P2 + t * dz;
          var lon = Math.atan2(qy, qx), lat = Math.atan2(qz / B2, Math.hypot(qx, qy) / A2);
          var tx = Math.min(TW - 1, ((lon * R2D + 180) / 360 * TW) | 0);
          var ty = Math.min(TH - 1, Math.max(0, ((90 - lat * R2D) / 180 * TH) | 0));
          var o = (ty * TW + tx) * 4;
          var cl = Math.cos(lat), nx = cl * Math.cos(lon), ny = cl * Math.sin(lon), nz = Math.sin(lat);

          /* day/night with soft twilight */
          var k = Math.max(0, Math.min(1, ((nx*sX + ny*sY + nz*sZ) + 0.08) / 0.28));
          k = k * k * (3 - 2 * k);
          if (daylight) k = 1;                                  /* full-daylight mode ignores the terminator */
          var lit = 0.22 + 0.78 * k;

          /* limb haze */
          var hz = Math.pow(1 - Math.max(0, -(nx*dx + ny*dy + nz*dz)), 3) * 0.55 * (0.4 + 0.6 * k);
          r = tex[o] * lit * (1 - hz) + 110 * hz;
          g = tex[o + 1] * lit * (1 - hz) + 170 * hz;
          b = tex[o + 2] * lit * (1 - hz) + 255 * hz;
        } else {
          var m = -t, gl = m < A ? 1 : Math.max(0, 1 - (m - A) / 110);
          gl = gl * gl * 0.85;
          var star = (((i * 73856093) ^ (j * 19349663)) >>> 0) % 1000 < 2 ? 200 : 0;
          r = star + 100 * gl; g = star + 165 * gl; b = star + 255 * gl;
        }
        buf[j * W + i] = (255 << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0);
      }
    }
    ctx.putImageData(img, 0, 0);

    var msg = $('sp-poly-msg');
    msg.textContent = p.shape !== 'custom' ? '' :
      (cam.polyOk ? cam.poly.length + ' vertices' : 'Need at least 3 "x, y" lines; using rectangle');
    updateInfo(p, cam, pt);
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(render); }

  /* ══════════════════════════════════════════════════════════
     INFO PANELS + COVERAGE DATA
  ══════════════════════════════════════════════════════════ */
  var fmtLL = function (g) {
    return g ? Math.abs(g.lat).toFixed(2) + (g.lat >= 0 ? '°N ' : '°S ') +
               Math.abs(g.lon).toFixed(2) + (g.lon >= 0 ? '°E' : '°W') : '—';
  };

  function infoRows(id, list) {
    $(id).innerHTML = list.map(function (r) { return '<div><span>' + r[0] + '</span>' + r[1] + '</div>'; }).join('');
  }

  function updateSensor(p, cam, pt, bore) {
    var ifx = Math.atan(pt.x) * 1e6, ify = Math.atan(pt.y) * 1e6;           /* µrad */
    var fx = p.pitch * 1e-3 / pt.x, fy = p.pitch * 1e-3 / pt.y;              /* mm */
    if (p.def === 'fov') $('sp-focal').value = fx.toFixed(2);                /* show derived focal length */
    var gb = bore ? gsdAt(cam, 0, 0, pt.x, pt.y) : null, worst = 0;
    /* worst case: sample the FOV outline plus a 21 x 21 grid inside it */
    var samples = boundary(cam.poly);
    for (var gi = 0; gi <= 20; gi++) for (var gj = 0; gj <= 20; gj++) {
      var gxp = (gi / 10 - 1) * cam.hw, gyp = (gj / 10 - 1) * cam.hh;
      if (cam.inside(gxp, gyp)) samples.push([gxp, gyp]);
    }
    samples.forEach(function (q) {
      var g = gsdAt(cam, q[0], q[1], pt.x, pt.y);
      if (g) worst = Math.max(worst, g[0], g[1]);
    });
    infoRows('sp-info-sensor', [
      ['Detector array', p.pixx + ' × ' + p.pixy + ' px (' + (p.pixx * p.pitch / 1000).toFixed(1) + ' × ' +
                         (p.pixy * p.pitch / 1000).toFixed(1) + ' mm)'],
      ['Focal length', fx.toFixed(1) + ' mm' + (Math.abs(fx / fy - 1) > 0.01 ? ' (y: ' + fy.toFixed(1) + ')' : '')],
      ['IFOV at centre', ifx.toFixed(1) + ' × ' + ify.toFixed(1) + ' µrad'],
      ['GSD at nadir', fmtLen(p.alt * 1e3 * pt.x) + ' × ' + fmtLen(p.alt * 1e3 * pt.y)],
      ['GSD at boresight', gb ? fmtLen(gb[0]) + ' × ' + fmtLen(gb[1]) : '—'],
      ['Worst-case GSD (sampled)', worst ? fmtLen(worst) : '—'],
      ['Detector pixel on screen', (pt.x / (2 * cam.th) * W).toFixed(2) + ' px'],
    ]);
  }

  function updateInfo(p, cam, pt) {
    var bore = groundAt(cam, 0, 0);
    var rad = Math.sqrt(dot(cam.P, cam.P));
    var earthHalf = Math.asin(Math.min(1, 6371 / rad)) * R2D;

    /* complete coverage: satellite horizon polygon (forced clockwise for D3) */
    var ring = horizonRing(cam), visRing = null, hRad = 0, visPct = 0;
    if (ring.length > 3) {
      visRing = ring.concat([ring[0]]);
      if (d3.geoArea({ type: 'Polygon', coordinates: [visRing] }) > 2 * Math.PI) visRing.reverse();
      visPct = d3.geoArea({ type: 'Polygon', coordinates: [visRing] }) / (4 * Math.PI) * 100;
      ring.forEach(function (q) { hRad = Math.max(hRad, d3.geoDistance(q, [p.lon, p.lat])); });
    }

    infoRows('sp-info-view', [
      ['Boresight ground point', fmtLL(bore)],
      ['Slant range to boresight', bore ? bore.range.toFixed(0) + ' km' : 'no ground'],
      ['Azimuth / off-nadir', cam.az.toFixed(1) + '° / ' + cam.off.toFixed(1) + '°'],
      ['Solar subpoint', fmtLL(solarPosition(p.time))],
    ]);
    infoRows('sp-info-cov', [
      ['Footprint size at center (bounding box)', bore ? (2 * bore.range * cam.hw).toFixed(0) + ' × ' +
                                                 (2 * bore.range * cam.hh).toFixed(0) + ' km' : '—'],
      ['Horizon radius from subpoint', visRing ? (hRad * R2D).toFixed(1) + '°' : '—'],
      ['Visible fraction of Earth', visRing ? visPct.toFixed(1) + '%' : '—'],
      ['Earth disk half-angle', earthHalf.toFixed(2) + '°'],
    ]);

    updateSensor(p, cam, pt, bore);
    var segs = footprintSegs(cam);

    cov.data = { p: p, bore: bore, segs: segs, visRing: visRing };
    drawCoverage();
  }

  /* ══════════════════════════════════════════════════════════
     GROUND COVERAGE GLOBE  (auto-fit, drag to rotate, wheel/pinch zoom)
  ══════════════════════════════════════════════════════════ */
  function drawCoverage() {
    var d = cov.data;
    if (!d) return;
    var S = mm.width, c0 = d.bore || { lon: d.p.lon, lat: d.p.lat };

    if (cov.auto) {                                   /* fit footprint, else whole hemisphere */
      var v = { lon: c0.lon, lat: c0.lat, scale: S * 0.46 };
      if (d.segs.length) {
        var maxD = 0;
        d.segs.forEach(function (sg) {
          sg.forEach(function (q) { maxD = Math.max(maxD, d3.geoDistance(q, [c0.lon, c0.lat])); });
        });
        if (maxD < 1.2) v.scale = Math.min(S * 400, S * 0.4 / Math.sin(Math.max(maxD * 1.15, 1e-4)));
      }
      cov.view = v;
    }
    var view = cov.view;
    var proj = d3.geoOrthographic().scale(view.scale).translate([S / 2, S / 2])
      .rotate([-view.lon, -view.lat]).clipAngle(90);
    var path = d3.geoPath(proj, mctx);

    /* graticule density follows the visible angular width */
    var vd = view.scale <= S * 0.5 ? 90 : Math.asin(S * 0.5 / view.scale) * R2D, grat;
    if (vd >= 50) grat = d3.geoGraticule().step([30, 30]);
    else {
      var step = vd > 20 ? 10 : vd > 8 ? 5 : vd > 3 ? 1 : vd > 0.8 ? 0.5 : 0.1;
      var w = Math.min(90, vd * 1.6 + 1), wl = Math.min(180, w / Math.max(0.05, Math.cos(view.lat * D2R)));
      grat = d3.geoGraticule().step([step, step])
        .extent([[view.lon - wl, Math.max(-90, view.lat - w)], [view.lon + wl, Math.min(90, view.lat + w)]]);
    }

    mctx.clearRect(0, 0, S, S);
    mctx.beginPath(); path({ type: 'Sphere' }); mctx.fillStyle = '#0a2a4a'; mctx.fill();
    if (worldTopo) {
      mctx.beginPath(); path(topojson.feature(worldTopo, worldTopo.objects.land));
      mctx.fillStyle = '#3b5a3a'; mctx.fill();
      if (!cov.fast) {                               /* water layers skipped while dragging for speed */
        if (riversGeo && vd < 45) {
          mctx.beginPath(); path(riversGeo);
          mctx.strokeStyle = '#3f86bd'; mctx.lineWidth = 1; mctx.stroke();
        }
        if (lakesGeo) { mctx.beginPath(); path(lakesGeo); mctx.fillStyle = '#14507d'; mctx.fill(); }
      }
      if (!cov.fast) {                                /* skip borders while dragging for speed */
        mctx.beginPath();
        path(topojson.mesh(worldTopo, worldTopo.objects.countries, function (a, b) { return a !== b; }));
        mctx.strokeStyle = 'rgba(240,240,200,0.4)'; mctx.lineWidth = 1; mctx.stroke();
        if (statesGeo && vd < 60) {                    /* state / province lines once zoomed in */
          mctx.beginPath(); path(statesGeo);
          mctx.strokeStyle = 'rgba(240,240,200,0.28)'; mctx.lineWidth = 0.8; mctx.stroke();
        }
      }
    }
    mctx.beginPath(); path(grat());
    mctx.strokeStyle = 'rgba(255,255,255,0.2)'; mctx.lineWidth = 0.7; mctx.stroke();

    /* complete coverage: shade what the satellite cannot see, outline the horizon */
    if (d.visRing) {
      mctx.beginPath(); path({ type: 'Polygon', coordinates: [d.visRing.slice().reverse()] });
      mctx.fillStyle = 'rgba(0,0,0,0.42)'; mctx.fill();
      mctx.beginPath(); path({ type: 'LineString', coordinates: d.visRing });
      mctx.strokeStyle = '#4dd0e1'; mctx.lineWidth = 2; mctx.setLineDash([8, 5]); mctx.stroke(); mctx.setLineDash([]);
    }
    /* payload footprint */
    if (d.segs.length) {
      mctx.beginPath(); path({ type: 'MultiLineString', coordinates: d.segs });
      mctx.strokeStyle = '#ffbe00'; mctx.lineWidth = 2.5; mctx.stroke();
    }
    function dotAt(ll, col, r) {
      if (d3.geoDistance(ll, [view.lon, view.lat]) >= Math.PI / 2) return;
      var q = proj(ll); mctx.beginPath(); mctx.arc(q[0], q[1], r, 0, 7);
      mctx.fillStyle = col; mctx.fill();
    }
    dotAt([d.p.lon, d.p.lat], '#ffffff', 5);                    /* satellite subpoint */
    if (d.bore) dotAt([d.bore.lon, d.bore.lat], '#e8f060', 4);  /* boresight */

    /* legend */
    mctx.font = '13px monospace'; mctx.textBaseline = 'middle';
    [['#ffbe00', 'Payload footprint', false], ['#4dd0e1', 'Satellite horizon (all visible Earth)', true],
     ['#ffffff', 'Satellite subpoint', null]].forEach(function (it, i) {
      var y = S - 14 - (2 - i) * 18;
      if (it[2] === null) { mctx.beginPath(); mctx.arc(18, y, 4, 0, 7); mctx.fillStyle = it[0]; mctx.fill(); }
      else {
        mctx.beginPath(); mctx.moveTo(8, y); mctx.lineTo(28, y);
        mctx.setLineDash(it[2] ? [6, 4] : []); mctx.strokeStyle = it[0]; mctx.lineWidth = 2.5; mctx.stroke(); mctx.setLineDash([]);
      }
      mctx.fillStyle = 'rgba(255,255,255,0.75)'; mctx.fillText(it[1], 36, y);
    });
  }

  function scheduleCov() { if (!cov.raf) cov.raf = requestAnimationFrame(function () { cov.raf = null; drawCoverage(); }); }

  var drag = null, pinch = 0, wheelTimer = null;
  var clampScale = function (s) { return Math.min(mm.width * 400, Math.max(mm.width * 0.3, s)); };

  function dragStart(x, y) {
    if (!cov.view) return;
    cov.auto = false; cov.fast = true; drag = { x: x, y: y }; mm.style.cursor = 'grabbing';
  }
  function dragMove(x, y) {
    if (!drag) return;
    var k = (mm.width / mm.getBoundingClientRect().width) / cov.view.scale * R2D;
    cov.view.lon -= (x - drag.x) * k;
    cov.view.lat = Math.max(-89, Math.min(89, cov.view.lat + (y - drag.y) * k));
    cov.view.lon = ((cov.view.lon + 540) % 360) - 180;
    drag = { x: x, y: y };
    scheduleCov();
  }
  function dragEnd() {
    if (!drag) return;
    drag = null; cov.fast = false; mm.style.cursor = 'grab'; scheduleCov();
  }

  mm.addEventListener('mousedown', function (e) { e.preventDefault(); dragStart(e.clientX, e.clientY); });
  document.addEventListener('mousemove', function (e) { dragMove(e.clientX, e.clientY); });
  document.addEventListener('mouseup', dragEnd);

  mm.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (e.touches.length === 2) { dragEnd(); pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    else dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  mm.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length === 2 && pinch && cov.view) {
      var dd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      cov.auto = false; cov.fast = true; cov.view.scale = clampScale(cov.view.scale * dd / pinch); pinch = dd; scheduleCov();
    } else if (e.touches.length === 1) dragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  mm.addEventListener('touchend', function () { pinch = 0; cov.fast = false; dragEnd(); scheduleCov(); });

  mm.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (!cov.view) return;
    cov.auto = false; cov.fast = true;
    cov.view.scale = clampScale(cov.view.scale * Math.exp(-e.deltaY * 0.0015));
    scheduleCov();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { cov.fast = false; scheduleCov(); }, 150);
  }, { passive: false });

  $('sp-cov-fit').addEventListener('click', function () { cov.auto = true; drawCoverage(); });
  $('sp-cov-full').addEventListener('click', function () {
    if (!cov.data) return;
    cov.auto = false;
    cov.view = { lon: cov.data.p.lon, lat: cov.data.p.lat, scale: mm.width * 0.46 };
    drawCoverage();
  });

  /* == Camera hover readout == */
  cv.addEventListener('mousemove', function (e) {
    if (!lastCam) return;
    var r = cv.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width * 2 - 1) * lastCam.th, y = (1 - (e.clientY - r.top) / r.height * 2) * lastCam.th;
    if (!lastCam.inside(x, y)) { $('sp-hover').textContent = 'Outside payload FOV'; return; }
    var g = groundAt(lastCam, x, y);
    $('sp-hover').textContent = g ? fmtLL(g) + ' · ' + g.range.toFixed(0) + ' km' : 'Space';
  });

  /* ══════════════════════════════════════════════════════════
     WIRING
  ══════════════════════════════════════════════════════════ */
  function setNow() { $('sp-time').value = new Date().toISOString().slice(0, 16); }

  function applyPreset(key) {
    var s = PRESETS[key];
    if (!s) return;
    $('sp-mode').value = 'nadir'; syncMode();
    $('sp-shape').value = 'rect'; $('sp-def').value = 'fov';
    ['lat', 'lon', 'alt', 'az', 'off'].forEach(function (k) { $('sp-' + k).value = s[k]; });
    $('sp-fovw').value = s.fov; $('sp-fovh').value = s.fov;
    $('sp-pixx').value = s.px; $('sp-pixy').value = s.px; $('sp-pitch').value = 10;
    $('sp-roll').value = 0;
    syncPayload();
  }

  function syncMode() {
    var t = $('sp-mode').value === 'target';
    $('sp-az').disabled = t; $('sp-off').disabled = t;
    $('sp-tlat').disabled = !t; $('sp-tlon').disabled = !t;
  }

  function syncPayload() {
    var c = $('sp-shape').value === 'custom', o = $('sp-def').value === 'optics';
    $('sp-poly').disabled = !c;
    $('sp-fovw').disabled = c || o; $('sp-fovh').disabled = c || o;      /* derived from optics, or from the polygon */
    $('sp-focal').disabled = !o;                                         /* derived from FOV unless optics mode */
  }

  ['lat', 'lon', 'alt', 'fovw', 'fovh', 'poly', 'roll', 'az', 'off', 'tlat', 'tlon', 'time', 'pixx', 'pixy', 'pitch', 'focal'].forEach(function (k) {
    $('sp-' + k).addEventListener('input', schedule);
  });
  ['lat', 'lon', 'alt', 'fovw', 'fovh'].forEach(function (k) {
    $('sp-' + k).addEventListener('input', function () { $('sp-preset').value = 'custom'; });
  });
  $('sp-preset').addEventListener('change', function () { applyPreset(this.value); schedule(); });
  $('sp-mode').addEventListener('change', function () { syncMode(); schedule(); });
  $('sp-shape').addEventListener('change', function () { syncPayload(); $('sp-preset').value = 'custom'; schedule(); });
  $('sp-light').addEventListener('change', schedule);
  $('sp-sim').addEventListener('change', schedule);
  $('sp-def').addEventListener('change', function () { syncPayload(); schedule(); });
  /* Picking a time only matters for real day/night, so editing it (or pressing
     "Use current time") switches Illumination to that mode. */
  var useRealLight = function () { $('sp-light').value = 'real'; };
  $('sp-time').addEventListener('input', useRealLight);
  $('sp-now').addEventListener('click', function () { setNow(); useRealLight(); schedule(); });
  $('sp-grat').addEventListener('change', function () { tex = null; schedule(); });

  setInterval(function () { $('sp-utc').textContent = new Date().toUTCString().replace(' GMT', ' UTC'); }, 1000);

  /* == Boot == */
  $('sp-poly').value = DEFAULT_POLY;
  setNow(); applyPreset('goes19'); syncPayload(); schedule();
  mm.style.cursor = 'grab';
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
    .then(function (r) { return r.json(); })
    .then(function (topo) { worldTopo = topo; tex = null; schedule(); })
    .catch(function (err) { console.error('world-atlas load failed:', err); });

  /* Blue Marble base image. Path comes from window.SATVIEW.baseImage (set in
     satview.html via Jekyll's relative_url). Failure falls back to vector land. */
  (function () {
    var url = window.SATVIEW && window.SATVIEW.baseImage;
    if (!url) return;
    var im = new Image();
    im.crossOrigin = 'anonymous';                    /* needed only if hosted on another origin */
    im.onload = function () { baseImg = im; tex = null; schedule(); };
    im.onerror = function () { console.warn('Base image failed to load, using vector land:', url); };
    im.src = url;
  })();

  /* Natural Earth lakes + rivers (optional layers: failure is non-fatal) */
  var NE = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/';
  function loadGeo(file, set) {
    fetch(NE + file).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (g) { set(g); tex = null; schedule(); })
      .catch(function (err) { console.warn(file + ' load failed:', err.message); });
  }
  loadGeo('ne_50m_lakes.geojson', function (g) { lakesGeo = g; });
  loadGeo('ne_50m_admin_1_states_provinces_lines.geojson', function (g) {
    statesGeo = { type: 'FeatureCollection', features: g.features.filter(function (f) {
      return f.properties.ADM0_A3 === 'USA' || f.properties.ADM0_A3 === 'CAN';
    }) };
  });
  loadGeo('ne_50m_rivers_lake_centerlines.geojson', function (g) {
    riversGeo = { type: 'FeatureCollection', features: g.features.filter(function (f) {
      return f.properties.featurecla !== 'Lake Centerline';       /* lakes already drawn as polygons */
    }) };
  });
})();
