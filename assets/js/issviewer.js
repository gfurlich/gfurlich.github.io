(function () {
  'use strict';

  /* == Constants == */
  var RE = 6378.137, RS = 695700, AU = 149597870.7;
  var MU = 398600.4418, OMEGA = 7.2921159e-5, D2R = Math.PI / 180;
  var TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';
  var TRACK_PAST_MIN = 45, TRACK_FUTURE_MIN = 95, TRACK_STEP_S = 30;

  /* Approximate fallback only, used if CelesTrak cannot be reached. Positions
     from it will drift from the real ISS; the status line says so. */
  var FALLBACK = [
    'ISS (ZARYA)',
    '1 25544U 98067A   26322.50000000  .00016717  00000-0  30000-3 0  9990',
    '2 25544  51.6400 120.0000 0005000 100.0000 260.0000 15.50000000400000'
  ];

  /* == State == */
  var satrec = null, tle = null;
  var worldTopo = null;
  var view = 'globe';
  var track = { past: [], future: [] };
  var rotation = [100, -30, 0];
  var SIZE = 800, CX = 400, CY = 400, R = 370;
  var scale = R, MIN_SCALE = R, MAX_SCALE = R * 6;
  var lastState = null, lastEclipseScan = 0, nextChangeText = '—';

  var globeLayers = makeLayers(d3.select('#iss-globe-svg'));
  var flatLayers  = makeLayers(d3.select('#iss-flat-svg'));
  var gratData = d3.geoGraticule().step([15, 15])();

  function makeLayers(svg) {
    var o = {};
    ['bg', 'grat', 'land', 'lakes', 'rivers', 'borders', 'states', 'night', 'foot', 'past', 'future', 'sun', 'iss']
      .forEach(function (k) { o[k] = svg.append('g'); });
    return o;
  }

  /* == Small math helpers == */
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { return Math.sqrt(dot(a, a)); }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function fx(v, d) { return (v >= 0 ? ' ' : '') + v.toFixed(d); }

  /* == Sun == */
  function sunInfo(date) {
    var n = date / 86400000 + 2440587.5 - 2451545.0;
    var L = (280.460 + 0.9856474 * n) % 360;
    var g = (357.528 + 0.9856003 * n) % 360, gR = g * D2R;
    var lam = (L + 1.915 * Math.sin(gR) + 0.020 * Math.sin(2 * gR)) * D2R;
    var eps = (23.439 - 0.0000004 * n) * D2R;
    var rAU = 1.00014 - 0.01671 * Math.cos(gR) - 0.00014 * Math.cos(2 * gR);
    var eci = [Math.cos(lam), Math.cos(eps) * Math.sin(lam), Math.sin(eps) * Math.sin(lam)]
      .map(function (c) { return c * rAU * AU; });
    var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    var dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    var gmst = (280.46061837 + 360.98564736629 * n) % 360;
    var lon = (ra / D2R - gmst + 720) % 360;
    if (lon > 180) lon -= 360;
    return { eci: eci, lat: dec / D2R, lon: lon };
  }

  /* == Propagation == */
  function stateAt(date) {
    var pv = satellite.propagate(satrec, date);
    if (!pv.position || !pv.velocity) return null;
    var gmst = satellite.gstime(date);
    var geo = satellite.eciToGeodetic(pv.position, gmst);
    var ecf = satellite.eciToEcf(pv.position, gmst);
    var vr = satellite.eciToEcf(pv.velocity, gmst);
    var vEcf = [vr.x + OMEGA * ecf.y, vr.y - OMEGA * ecf.x, vr.z]; /* subtract w x r */
    var rEci = [pv.position.x, pv.position.y, pv.position.z];
    var vEci = [pv.velocity.x, pv.velocity.y, pv.velocity.z];
    return {
      date: date, lat: satellite.degreesLat(geo.latitude), lon: satellite.degreesLong(geo.longitude),
      alt: geo.height, rEci: rEci, vEci: vEci, rEcf: [ecf.x, ecf.y, ecf.z], vEcf: vEcf
    };
  }

  /* Conical shadow: 'SUNLIT' | 'PENUMBRA' | 'UMBRA' */
  function eclipseOf(st) {
    var s = sunInfo(st.date).eci, r = st.rEci;
    var thE = Math.asin(RE / norm(r));
    var toSun = sub(s, r);
    var thS = Math.asin(RS / norm(toSun));
    var cosT = dot([-r[0], -r[1], -r[2]], toSun) / (norm(r) * norm(toSun));
    var th = Math.acos(Math.max(-1, Math.min(1, cosT)));
    if (th < thE - thS) return 'UMBRA';
    if (th < thE + thS) return 'PENUMBRA';
    return 'SUNLIT';
  }

  function scanNextChange(from, current) {
    for (var t = 30; t <= 6000; t += 30) {
      var st = stateAt(new Date(from.getTime() + t * 1000));
      if (!st) continue;
      var e = eclipseOf(st);
      if (e !== current) return { sec: t, to: e };
    }
    return null;
  }

  function computeTracks(now) {
    var past = [], fut = [];
    for (var s = -TRACK_PAST_MIN * 60; s <= 0; s += TRACK_STEP_S) {
      var a = stateAt(new Date(now.getTime() + s * 1000));
      if (a) past.push([a.lon, a.lat]);
    }
    for (var f = 0; f <= TRACK_FUTURE_MIN * 60; f += TRACK_STEP_S) {
      var b = stateAt(new Date(now.getTime() + f * 1000));
      if (b) fut.push([b.lon, b.lat]);
    }
    track = { past: past, future: fut };
  }

  /* == TLE loading == */
  function setTle(lines, source) {
    var rec = satellite.twoline2satrec(lines[1], lines[2]);
    if (rec.error) throw new Error('bad TLE');
    satrec = rec;
    tle = { name: lines[0], l1: lines[1], l2: lines[2], source: source };
    document.getElementById('iss-tle').textContent = lines.join('\n');
    document.getElementById('iss-fetch-status').textContent =
      'TLE: ' + source + ' · loaded ' + new Date().toUTCString().replace(' GMT', ' UTC');
    computeTracks(new Date());
  }

  function loadTle() {
    return fetch(TLE_URL)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (txt) {
        var L = txt.trim().split(/\r?\n/).map(function (s) { return s.trim(); });
        if (L.length < 3) throw new Error('short response');
        setTle(L.slice(0, 3), 'CelesTrak');
      })
      .catch(function (err) {
        console.warn('TLE fetch failed:', err.message);
        if (!satrec) setTle(FALLBACK, 'built-in fallback (approximate, may be stale)');
      });
  }

  /* == Drawing == */
  function addPath(g, datum, path, attrs) {
    var p = g.append('path').datum(datum).attr('d', path);
    Object.keys(attrs).forEach(function (k) { p.attr(k, attrs[k]); });
    return p;
  }

  function drawScene(L, proj, flat) {
    var path = d3.geoPath().projection(proj);
    var vc = [-rotation[0], -rotation[1]];
    var visible = function (lon, lat) { return flat || d3.geoDistance([lon, lat], vc) < Math.PI / 2; };

    L.bg.selectAll('*').remove();
    var textured = !!tex && bmOn;
    if (flat) {
      L.bg.append('rect').attr('width', 1000).attr('height', 500).attr('fill', '#04080f');
      if (textured) L.bg.append('image').attr('href', texUrl).attr('width', 1000).attr('height', 500)
        .attr('preserveAspectRatio', 'none');
    } else {
      /* Globe texture is painted on the canvas behind this SVG */
      if (!textured) L.bg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', scale).attr('fill', '#04080f');
      L.bg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', scale)
        .attr('fill', 'none').attr('stroke', 'rgba(100,160,255,0.12)').attr('stroke-width', 2);
    }

    L.grat.selectAll('*').remove();
    addPath(L.grat, gratData, path, { fill: 'none', stroke: 'rgba(60,100,160,0.3)', 'stroke-width': 0.4 });

    if (worldTopo) {
      L.land.selectAll('*').remove();
      addPath(L.land, topojson.feature(worldTopo, worldTopo.objects.land), path,
        textured ? { fill: 'none', stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 0.5 }
                : { fill: '#2a3d2a', stroke: '#3d5c3d', 'stroke-width': 0.5 });
      L.borders.selectAll('*').remove();
      addPath(L.borders, topojson.mesh(worldTopo, worldTopo.objects.countries, function (a, b) { return a !== b; }), path,
        { fill: 'none', stroke: '#4a6b4a', 'stroke-width': 0.8, 'stroke-dasharray': '2 2' });
    }

    /* Vector detail, shown only when the Blue Marble image is off */
    ['lakes', 'rivers', 'states'].forEach(function (k) { L[k].selectAll('*').remove(); });
    if (!textured) {
      if (geo.lakes) addPath(L.lakes, geo.lakes, path,
        { fill: '#0a1a2e', stroke: 'rgba(100,160,255,0.4)', 'stroke-width': 0.5 });
      if (geo.rivers) addPath(L.rivers, geo.rivers, path,
        { fill: 'none', stroke: 'rgba(90,150,230,0.65)', 'stroke-width': 0.6 });
      if (geo.states) addPath(L.states, geo.states, path,
        { fill: 'none', stroke: '#3a5c3a', 'stroke-width': 1, 'stroke-dasharray': '1.5 2' });
    }

    /* Night side */
    var sun = sunInfo(Date.now());
    var anti = [sun.lon + 180, -sun.lat];
    if (anti[0] > 180) anti[0] -= 360;
    L.night.selectAll('*').remove();
    addPath(L.night, d3.geoCircle().center(anti).radius(90)(), path,
      { fill: 'rgba(0,5,20,0.55)', stroke: 'rgba(180,210,255,0.55)', 'stroke-width': 1.4 });

    if (!lastState) return;
    var st = lastState;

    /* Visibility footprint */
    L.foot.selectAll('*').remove();
    var fr = Math.acos(RE / (RE + st.alt)) / D2R;
    addPath(L.foot, d3.geoCircle().center([st.lon, st.lat]).radius(fr)(), path,
      { fill: 'rgba(255,90,90,0.12)', stroke: '#ff5a5a', 'stroke-width': 1, 'stroke-opacity': 0.7 });

    /* Ground track. d3 cuts lines at the antimeridian for us. */
    L.past.selectAll('*').remove();
    L.future.selectAll('*').remove();
    if (track.past.length > 1)
      addPath(L.past, { type: 'LineString', coordinates: track.past }, path,
        { fill: 'none', stroke: 'rgba(255,255,255,0.4)', 'stroke-width': 1.6 });
    if (track.future.length > 1)
      addPath(L.future, { type: 'LineString', coordinates: track.future }, path,
        { fill: 'none', stroke: '#ff9a9a', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });

    /* Subsolar point */
    L.sun.selectAll('*').remove();
    var sp = proj([sun.lon, sun.lat]);
    if (sp && visible(sun.lon, sun.lat)) {
      L.sun.append('circle').attr('cx', sp[0]).attr('cy', sp[1]).attr('r', 4.5)
        .attr('fill', '#ffe050').attr('stroke', '#ffaa00').attr('stroke-width', 1.2);
    }

    /* ISS marker */
    L.iss.selectAll('*').remove();
    var p = proj([st.lon, st.lat]);
    if (p && visible(st.lon, st.lat)) {
      drawISSShape(L.iss, p[0], p[1], ISS_SCALE, ISS_COLOR);
      L.iss.append('text').attr('x', p[0]).attr('y', p[1] + 22).attr('text-anchor', 'middle')
        .attr('fill', '#fff').attr('font-size', 9).attr('font-family', 'Fira Code, monospace')
        .text('ISS ' + Math.abs(st.lat).toFixed(1) + (st.lat >= 0 ? 'N ' : 'S ') +
              Math.abs(st.lon).toFixed(1) + (st.lon >= 0 ? 'E' : 'W'));
    }
  }

  /* SVG port of the star chart's canvas drawISSShape(). Full truss span = 30*s. */
  var ISS_COLOR = 'rgba(247,212,109,1.0)', ISS_SCALE = 0.7;
  function drawISSShape(g, cx, cy, s, color) {
    var grp = g.append('g').attr('transform', 'translate(' + cx + ',' + cy + ')').attr('fill', color);
    function rect(x, y, w, h) {
      grp.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
    }
    var tw = s * 15, th = s * 0.9;            /* half-truss width / half thickness */
    rect(-tw, -th, tw * 2, th * 2);           /* main truss */
    var hw = s * 1.2, hh = s * 5;             /* habitat spine */
    rect(-hw, -hh, hw * 2, hh * 2);
    var wingW = s * 4.5, wingH = s * 10, gap = s * 0.5;
    [-tw * 0.85, -tw * 0.52, tw * 0.52, tw * 0.85].forEach(function (ax) {
      rect(ax - wingW / 2, th + gap, wingW, wingH);          /* forward panel */
      rect(ax - wingW / 2, -th - gap - wingH, wingW, wingH); /* aft panel */
    });
  }

  /* == Vector overlays (Natural Earth) + Blue Marble toggle == */
  var bmOn = true;
  var geo = { states: null, lakes: null, rivers: null };
  var NE = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/';
  function loadGeo(file, key, keep) {
    fetch(NE + file)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (gj) {
        if (keep) gj = { type: 'FeatureCollection', features: gj.features.filter(keep) };
        geo[key] = gj; redraw();
      })
      .catch(function (err) { console.warn(file + ' load failed:', err.message); });
  }
  document.getElementById('iss-bm').addEventListener('change', function (e) {
    bmOn = e.target.checked; redraw();
  });

  /* == Blue Marble texture ==
     The SVG can't texture-map a sphere, so each canvas pixel of the globe disk is
     inverse-projected (orthographic) to lon/lat and sampled from the equirectangular
     image. The flat view just uses the image directly. */
  var gwrapEl = document.getElementById('iss-globe-wrap');
  var texUrl = gwrapEl.getAttribute('data-texture');
  var tex = null;
  var tcv = document.getElementById('iss-globe-canvas');
  var TW = 2048, TH = 1024;

  function loadTexture() {
    var img = new Image();
    img.onload = function () {
      try {
        var c = document.createElement('canvas'); c.width = TW; c.height = TH;
        var x = c.getContext('2d'); x.drawImage(img, 0, 0, TW, TH);
        tex = x.getImageData(0, 0, TW, TH).data;
        redraw();
      } catch (e) { console.warn('Texture unreadable (cross-origin?):', e.message); }
    };
    img.onerror = function () { console.warn('Texture not found:', texUrl); };
    img.src = texUrl;
  }

  function drawTexture() {
    var ctx = tcv.getContext('2d');
    if (!tex || !bmOn) { ctx.clearRect(0, 0, tcv.width, tcv.height); return; }
    var N = tcv.width, k = SIZE / N;
    var out = ctx.createImageData(N, N), d = out.data;
    var lon0 = -rotation[0] * D2R, lat0 = -rotation[1] * D2R;
    var sl = Math.sin(lat0), cl = Math.cos(lat0);
    for (var j = 0; j < N; j++) {
      var py = -((j + 0.5) * k - CY) / scale;
      for (var i = 0; i < N; i++) {
        var px = ((i + 0.5) * k - CX) / scale;
        var r2 = px * px + py * py;
        if (r2 > 1) continue;
        var z = Math.sqrt(1 - r2);
        var lat = Math.asin(z * sl + py * cl);
        var lon = lon0 + Math.atan2(px, z * cl - py * sl);
        var u = lon / (2 * Math.PI) + 0.5; u -= Math.floor(u);
        var v = 0.5 - lat / Math.PI;
        var ti = (Math.min(TH - 1, (v * TH) | 0) * TW + ((u * TW) | 0)) * 4;
        var o = (j * N + i) * 4;
        d[o] = tex[ti]; d[o + 1] = tex[ti + 1]; d[o + 2] = tex[ti + 2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  function drawGlobe() {
    var proj = d3.geoOrthographic().scale(scale).translate([CX, CY]).rotate(rotation).clipAngle(90);
    drawTexture();
    drawScene(globeLayers, proj, false);
  }
  function drawFlat() {
    var proj = d3.geoEquirectangular().scale(1000 / (2 * Math.PI)).translate([500, 250]);
    drawScene(flatLayers, proj, true);
  }
  function redraw() { if (view === 'globe') drawGlobe(); else drawFlat(); }

  /* == Info panels == */
  function rows(id, list) {
    document.getElementById(id).innerHTML = list.map(function (r) {
      return '<tr><td style="color:var(--muted)">' + r[0] + '</td><td class="iss-val">' + r[1] + '</td></tr>';
    }).join('');
  }
  function fmtDur(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + 'm ' + (r < 10 ? '0' : '') + r + 's';
  }

  function updatePanels(st, now) {
    var ecl = eclipseOf(st);
    if (now - lastEclipseScan > 5000 || lastEclipseScan === 0) {
      lastEclipseScan = now;
      var nx = scanNextChange(new Date(now), ecl);
      nextChangeText = nx ? (nx.to === 'SUNLIT' ? 'Sunrise' : (nx.to === 'UMBRA' ? 'Entering umbra' : 'Entering penumbra')) +
        ' in ' + fmtDur(nx.sec) : '—';
    }
    var cls = ecl === 'SUNLIT' ? 'sun' : (ecl === 'UMBRA' ? 'umb' : 'pen');
    var label = ecl === 'SUNLIT' ? 'IN SUNLIGHT' : (ecl === 'UMBRA' ? 'ECLIPSED (UMBRA)' : 'PARTIAL (PENUMBRA)');

    var yr = satrec.epochyr < 57 ? 2000 + satrec.epochyr : 1900 + satrec.epochyr;
    var epoch = new Date(Date.UTC(yr, 0, 1) + (satrec.epochdays - 1) * 86400000);
    var ageD = (now - epoch) / 86400000;

    rows('iss-t-status', [
      ['Time (UTC)', new Date(now).toISOString().replace('T', ' ').slice(0, 19)],
      ['Eclipse', '<span class="iss-badge ' + cls + '">' + label + '</span>'],
      ['Next change', nextChangeText],
      ['TLE epoch', epoch.toISOString().slice(0, 19).replace('T', ' ') + ' UTC'],
      ['TLE age', ageD.toFixed(2) + ' days' + (ageD > 7 ? ' (stale)' : '')]
    ]);

    var vi = norm(st.vEci), ve = norm(st.vEcf);
    rows('iss-t-lla', [
      ['Latitude', fx(st.lat, 4) + '°'],
      ['Longitude', fx(st.lon, 4) + '°'],
      ['Altitude', fx(st.alt, 2) + ' km'],
      ['Speed (inertial)', vi.toFixed(4) + ' km/s'],
      ['Speed (Earth-fixed)', ve.toFixed(4) + ' km/s']
    ]);

    rows('iss-t-ecef', [
      ['X', fx(st.rEcf[0], 3) + ' km'], ['Y', fx(st.rEcf[1], 3) + ' km'], ['Z', fx(st.rEcf[2], 3) + ' km'],
      ['Vx', fx(st.vEcf[0], 5) + ' km/s'], ['Vy', fx(st.vEcf[1], 5) + ' km/s'], ['Vz', fx(st.vEcf[2], 5) + ' km/s']
    ]);

    rows('iss-t-eci', [
      ['X', fx(st.rEci[0], 3) + ' km'], ['Y', fx(st.rEci[1], 3) + ' km'], ['Z', fx(st.rEci[2], 3) + ' km'],
      ['Vx', fx(st.vEci[0], 5) + ' km/s'], ['Vy', fx(st.vEci[1], 5) + ' km/s'], ['Vz', fx(st.vEci[2], 5) + ' km/s']
    ]);

    var n = satrec.no / 60;                         /* rad/s */
    var a = Math.pow(MU / (n * n), 1 / 3);
    rows('iss-t-elem', [
      ['Inclination', (satrec.inclo / D2R).toFixed(4) + '°'],
      ['RAAN', (satrec.nodeo / D2R).toFixed(4) + '°'],
      ['Eccentricity', satrec.ecco.toFixed(7)],
      ['Arg. of perigee', (satrec.argpo / D2R).toFixed(4) + '°'],
      ['Mean anomaly', (satrec.mo / D2R).toFixed(4) + '°'],
      ['Period', (2 * Math.PI / satrec.no).toFixed(2) + ' min'],
      ['Perigee / apogee', (a * (1 - satrec.ecco) - RE).toFixed(1) + ' / ' + (a * (1 + satrec.ecco) - RE).toFixed(1) + ' km']
    ]);
  }

  /* == Main tick == */
  var tickCount = 0;
  function tick() {
    document.getElementById('iss-utc').textContent = new Date().toUTCString().replace(' GMT', ' UTC');
    if (!satrec) return;
    var now = Date.now();
    var st = stateAt(new Date(now));
    if (!st) return;
    lastState = st;
    if (tickCount % 10 === 0) computeTracks(new Date(now));
    tickCount++;
    if (document.getElementById('iss-follow').checked) {
      rotation[0] = -st.lon;
      rotation[1] = Math.max(-85, Math.min(85, -st.lat));
    }
    updatePanels(st, now);
    redraw();
  }

  /* == Drag + momentum (globe only) == */
  var dragging = false, lastPos = null, velocity = [0, 0], lastTime = 0, raf = null;
  var gwrap = document.getElementById('iss-globe-wrap');
  function stopMomentum() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  function startMomentum() {
    stopMomentum();
    var vl = velocity[0], va = velocity[1];
    (function step() {
      vl *= 0.94; va *= 0.94;
      if (Math.abs(vl) < 0.002 && Math.abs(va) < 0.002) return;
      rotation[0] += vl * 16;
      rotation[1] = Math.max(-85, Math.min(85, rotation[1] + va * 16));
      drawGlobe();
      raf = requestAnimationFrame(step);
    })();
  }
  function getPos(e) { return e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY]; }
  function onDragStart(e) {
    e.preventDefault(); stopMomentum(); dragging = true; lastPos = getPos(e); lastTime = Date.now(); velocity = [0, 0];
    document.getElementById('iss-follow').checked = false;
    document.getElementById('iss-hint').textContent = 'Dragging…';
  }
  function onDragMove(e) {
    if (!dragging) return; e.preventDefault();
    var pos = getPos(e), now = Date.now(), dt = Math.max(1, now - lastTime);
    var dlon = (pos[0] - lastPos[0]) * 0.3, dlat = (pos[1] - lastPos[1]) * 0.3;
    velocity = [dlon / dt, -dlat / dt];
    rotation[0] += dlon;
    rotation[1] = Math.max(-85, Math.min(85, rotation[1] - dlat));
    lastPos = pos; lastTime = now; drawGlobe();
  }
  function onDragEnd() {
    if (!dragging) return; dragging = false;
    document.getElementById('iss-hint').textContent = 'Drag to rotate · scroll to zoom';
    startMomentum();
  }
  gwrap.addEventListener('mousedown', onDragStart, { passive: false });
  gwrap.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
  gwrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * (e.deltaY < 0 ? 1.1 : 0.91)));
    drawGlobe();
  }, { passive: false });

  /* == View toggle == */
  document.querySelectorAll('.iss-toolbar .gv-img-pill').forEach(function (btn) {
    btn.addEventListener('click', function () {
      view = btn.dataset.view;
      document.querySelectorAll('.iss-toolbar .gv-img-pill').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      document.getElementById('iss-globe-wrap').style.display = view === 'globe' ? '' : 'none';
      document.getElementById('iss-flat-wrap').style.display = view === 'flat' ? '' : 'none';
      document.getElementById('iss-follow-label').style.display = view === 'globe' ? '' : 'none';
      document.getElementById('iss-hint').textContent =
        view === 'globe' ? 'Drag to rotate · scroll to zoom' : 'Equirectangular ground track';
      stopMomentum();
      redraw();
    });
  });

  /* == Boot == */
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(function (r) { return r.json(); })
    .then(function (topo) { worldTopo = topo; redraw(); })
    .catch(function (err) { console.error('world-atlas load failed:', err); });

  loadTexture();
  loadGeo('ne_50m_admin_1_states_provinces_lakes.geojson', 'states', function (f) {
    var p = f.properties || {};
    return p.iso_a2 === 'US' || p.iso_a2 === 'CA' || p.adm0_a3 === 'USA' || p.adm0_a3 === 'CAN';
  });
  loadGeo('ne_50m_lakes.geojson', 'lakes');
  loadGeo('ne_50m_rivers_lake_centerlines.geojson', 'rivers');
  loadTle().then(function () { tick(); setInterval(tick, 1000); });
  setInterval(loadTle, 6 * 3600 * 1000);

})();
