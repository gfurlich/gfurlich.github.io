(function () {
  'use strict';
 
  /* == Satellite definitions == */
  var SATS = {
    east:   { key:'east',    name:'GOES-19 East',     lon:-75.2,
      diskColor:'#5b9bd5', diskFill:'rgba(91,155,213,0.15)',
      s3Bucket:'noaa-goes19' },
    west:   { key:'west',    name:'GOES-18 West',     lon:-136.9,
      diskColor:'#4caf8a', diskFill:'rgba(76,175,138,0.15)',
      s3Bucket:'noaa-goes18' },
    msat9:  { key:'msat9',   name:'Meteosat-9',       lon:45.5,
      diskColor:'#e8a030', diskFill:'rgba(232,160,48,0.15)',
      s3Bucket:'n/a' },
    msat12: { key:'msat12',  name:'Meteosat-12',      lon:0,
      diskColor:'#e05c5c', diskFill:'rgba(224,92,92,0.15)',
      s3Bucket:'n/a' },
    h9: { key:'himawari', name:'Himawari 9', lon:140.7,
      diskColor:'#c47ed4', diskFill:'rgba(196,126,212,0.15)',
      s3Bucket:'noaa-himawari9',
      // jpCenter: [145, 34], // TODO: Update
      jpCenter: [137, 49], // TODO: Update
      jpColor: '#c47ed4',
      jpFill:  'rgba(196,126,212,0.18)',
    },
    gk2a:   { key:'gk2a',   name:'GEO-KOMPSAT-2A',   lon:128.2,
      diskColor:'#4dd0e1', diskFill:'rgba(77,208,225,0.15)',
      s3Bucket:'noaa-gk2a',
      // LA sector corners from actual la020ge file (geostationary fixed-grid, 500×500 px)
      // Source: gk2a_ami_le1b_ir096_la020ge_202604230344.nc global attributes
      laSector: {
        nw: [119.914, 44.175],   // [lon, lat]
        ne: [133.123, 44.114],
        sw: [121.398, 31.138],
        se: [132.206, 31.115],
      },
      laColor: '#4dd0e1',
      laFill:  'rgba(77,208,225,0.15)', 
    },
  };
 
  /* Height-width of a meso sector in degrees latitude (fixed). The lon
    half-width is derived per-box via mesoPolygon() to account for
    the east-west stretching that occurs away from the sub-satellite point. */
  var MESO_HW = 4.5;
 
  var MESO_STYLE = {
    east: {
      M1: { fill:'rgba(255,190,0,0.18)',  stroke:'#ffbe00', labelFill:'#ffbe00' },
      M2: { fill:'rgba(255,100,0,0.18)',  stroke:'#ff6400', labelFill:'#ff8c00' },
    },
    west: {
      M1: { fill:'rgba(80,180,255,0.18)', stroke:'#50b4ff', labelFill:'#50b4ff' },
      M2: { fill:'rgba(180,100,255,0.18)',stroke:'#b464ff', labelFill:'#b464ff' },
    },
  };
 
  /* == SVG setup == */
  var SIZE = 800, CX = 400, CY = 400, R = 370;
  var CLIP_ANGLE = 81.3;
 
  /* == Zoom state == */
  var scale     = R;           /* current projection scale */
  var MIN_SCALE = R;           /* fully zoomed out = whole globe */
  var MAX_SCALE = R * 6;       /* ~6× zoom */

  // Render Order
  var svg      = d3.select('#gv-svg');
  var gSphere  = svg.append('g'); // Globe
  var gGrat    = svg.append('g'); // Graticule grid (Lat and Lon)
  var gLand    = svg.append('g'); // Landmass
  var gStates  = svg.append('g'); // State/Province borders
  var gBorders = svg.append('g'); // Country Borders
  var gDisk    = svg.append('g'); // GOES Field of Regards
  var gGK2A    = svg.append('g'); // GK2A AMI LA sector footprint
  var gH9JP    = svg.append('g'); // Himawari-9 JP01 sector footprint
  var gNight   = svg.append('g'); // Terminator
  var gMeso    = svg.append('g'); // Meso Boxes
  var gLaunch  = svg.append('g'); // Launch Site Markers
  var gSubsat  = svg.append('g'); // Satellite Subpoints
  var gSolar   = svg.append('g'); // Solar Subpoint
 
  /* == Launch sites == */
  // https://en.wikipedia.org/wiki/List_of_rocket_launch_sites
  // https://en.wikipedia.org/wiki/Spaceport
  var LAUNCH_SITES = [
    // USA
    { name: 'Vandenberg SFB', country: 'USSF',
      lat: 34.632, lon: -120.611},
    { name: 'Cape Canaveral', country: 'NASA/USSF',
      lat: 28.392, lon: -80.605 },
    { name: 'Mid-Atlantic Regional Spaceport (MARS)', country: 'NASA/USSF',
      lat: 37.843, lon: -75.478 },
    { name: 'Starbase', country: 'SpaceX',
      lat: 25.997, lon: -97.155 },
    { name: 'Keweenaw Rocket Range', country: 'NASA',
      lat: 47.43, lon: -87.7170 },
    { name: 'Poker Flat Research Range', country: 'UAF',
      lat: 65.12, lon: -147.47 },
    { name: 'Pacific Spaceport Complex - Alaska (PSCA)', country: 'Alaska',
      lat: 57.4353, lon: -152.34 },

    // European Space Agency, ESA
    { name: 'Guiana Space Centre', country: 'ESA',
      lat: 5.169, lon: -52.6903 },
    { name: 'Alcântara Space Center', country: 'Brasil (AEB)',
      lat: -2.3394, lon: -44.4175 },

    // Middle East
    { name: 'Palmachim Airbase', country: 'Isreal (ISA/IAF)',
      lat: 31.8977, lon: 34.6905 },
    { name: 'Shahroud Space Center', country: 'Iran (ISA/IRGCASF)',
      lat: 36.2009, lon: 55.3339 },
    { name: 'Semnan Space Center', country: 'Iran (ISA/IRGCASF)',
      lat: 35.2346, lon: 53.9221 },

    // China, CNSA
    { name: 'Jiuquan Satellite Launch Center', country: 'CHN',
       lat: 40.961, lon: 100.298 },
    { name: 'Taiyuan Satellite Launch Center', country: 'CHN',
       lat: 38.849, lon: 111.608 },
    { name: 'Xichang Satellite Launch Center', country: 'CHN',
       lat: 28.246, lon: 102.028 },
    { name: 'Wenchang Satellite Launch Center', country: 'CHN',
       lat: 19.6144, lon: 110.951 },
    { name: 'DongFang Maritime Launch Center', country: 'CHN',
       lat: 36.779, lon: 121.168 },

    // Japan, Japan Aerospace Exploration Agency, JAXA
    { name: 'Uchinoura Space Center', country: 'JAXA',
       lat: 31.251, lon: 131.081 },
    { name: 'Tanegashima Space Center', country: 'JAXA',
       lat: 30.4, lon: 130.97 },

    // Russia, CIS
    { name: 'Baikonur Cosmodrome', country: 'CIS', 
      lat: 45.965, lon: 63.305 },
    { name: 'Vostochny Cosmodrome', country: 'CIS', 
      lat: 51.884, lon: 128.334 },
    { name: 'Plesetsk Cosmodrome', country: 'CIS', 
      lat: 62.925, lon: 40.577 },
    { name: 'Yasny Launch Base', country: 'CIS', 
      lat: 51.0488, lon: 59.8533 },

    // Asia and Oceania
    { name: 'Mahia Launch Complex 1', country: 'Rocket Lab',
       lat: -39.260, lon: 177.865 },
    { name: 'Satish Dhawan Space Centre', country: 'ISRO', 
      lat: 13.72, lon: 80.23 },
    { name: 'Tonghae Satellite Launching Ground', country: 'PRK', 
      lat: 40.858, lon: 129.686 },
    { name: 'Sohae Satellite Launching Station', country: 'PRK', 
      lat: 39.66, lon: 124.705 },
    { name: 'Naro Space Center', country: 'ROK', 
      lat: 34.431, lon: 127.535 },
  ];

    // Globe
  // gSphere.append('circle').attr('cx',CX).attr('cy',CY).attr('r',R).attr('fill','#04080f');
  // gSphere.append('circle').attr('cx',CX).attr('cy',CY).attr('r',R)
    // .attr('fill','none').attr('stroke','rgba(100,160,255,0.12)').attr('stroke-width',2);

  // Check if the Site is Visible
  function isVisible(lon, lat) {
    var r = makeProjection().rotate();  // current [λ, φ, γ]
    // The center of the visible hemisphere is the anti-rotation point
    var centerLon = -rotation[0];
    var centerLat = -rotation[1];
    return d3.geoDistance([lon, lat], [centerLon, centerLat]) < Math.PI / 2;
  }

  /* == Initial View Point (Over CONUS) == */
  // var rotation = [0, -20, 0];
  var rotation = [103, -38, 0];
 
/* ══════════════════════════════════════════════════════════
     GOES-R ABI FIXED GRID PROJECTION  (GOES-R PUG Vol.3 §5.1.2.8)

     A GOES meso sector is 1000 × 1000 km in satellite scan-angle
     space. We convert the center (lat, lon) → scan angles (λ, φ),
     offset ±DELTA radians along each axis to get corners + edge
     points, then invert each point back to (lat, lon). This gives
     the correct asymmetric trapezoid shape at any position within
     the field of regard.

     Winding order: GeoJSON exterior rings must be CLOCKWISE when
     viewed from outside the sphere so D3 fills the interior
     (small) region rather than the complement hemisphere.
  ══════════════════════════════════════════════════════════ */
  var _GRS = (function() {
    var a_e  = 6378137.0;
    var f    = 1 / 298.257222101;
    var e2   = 2*f - f*f;
    var a_p  = a_e * Math.sqrt(1 - e2);
    var H    = 42164160.0;       /* satellite distance from Earth centre, m */
    // var DELTA = 500000.0 / H;   /* half-angle for 500 km at sub-sat point, rad */
    var DELTA = 500000.0 / 35786000.0;  // = 0.01397 rad
    var D2R  = Math.PI / 180;

    /* Forward: geographic → scan angles (lam, phi) in rad.
       Returns null if the point is behind the Earth. */
    function fwd(lat_deg, lon_deg, lon_sat_deg) {
      var lat     = lat_deg * D2R;
      var lon     = lon_deg * D2R;
      var lon_sat = lon_sat_deg * D2R;
      var lat_c   = Math.atan((a_p*a_p) / (a_e*a_e) * Math.tan(lat));
      var cos_lc  = Math.cos(lat_c), sin_lc = Math.sin(lat_c);
      var r_c     = a_p / Math.sqrt(1 - (a_e*a_e - a_p*a_p)/(a_e*a_e) * cos_lc*cos_lc);
      var dlon    = lon - lon_sat;
      var sx = H - r_c * cos_lc * Math.cos(dlon);
      var sy = -r_c * cos_lc * Math.sin(dlon);
      var sz =  r_c * sin_lc;
      if (sx < 0) return null;  /* point on far side */
      return [
        Math.atan(-sy / sx),
        Math.asin(sz / Math.sqrt(sx*sx + sy*sy + sz*sz))
      ];
    }

    /* Inverse: scan angles → geographic [lon_deg, lat_deg].
       Returns null if the angle points into space. */
    function inv(lam, phi, lon_sat_deg) {
      var lon_sat = lon_sat_deg * D2R;
      var cl = Math.cos(lam), sl = Math.sin(lam);
      var cp = Math.cos(phi), sp = Math.sin(phi);
      var r  = a_e / a_p;
      var a  = sl*sl + cl*cl*(cp*cp + r*r*sp*sp);
      var b  = -2 * H * cl * cp;
      var c  = H*H - a_e*a_e;
      var disc = b*b - 4*a*c;
      if (disc < 0) return null;
      var rs = (-b - Math.sqrt(disc)) / (2*a);
      var sx =  rs * cl * cp;
      var sy = -rs * sl;
      var sz =  rs * cl * sp;
      var lat = Math.atan(r*r * sz / Math.sqrt((H-sx)*(H-sx) + sy*sy));
      var lon = lon_sat + Math.atan2(-sy, H - sx);
      return [lon / D2R, lat / D2R];
    }

    return { fwd: fwd, inv: inv, DELTA: DELTA };
  })();

  /* Build a GeoJSON polygon for a meso sector using the PUG projection.
     Returns { polygon, labelLat } or null if center is not visible. */
  function mesoPolygon(lat, lon, satLon) {
    var c = _GRS.fwd(lat, lon, satLon);
    // var roundtrip = _GRS.inv(c[0], c[1], satLon);
    // console.log('input:', lat, lon, '→ scan:', c, '→ roundtrip:', roundtrip);
    if (!c) return null;
    var lam_c = c[0], phi_c = c[1];
    var D = _GRS.DELTA;
    var N = 24;  /* samples per edge */

    function pt(lam, phi) { return _GRS.inv(lam, phi, satLon); }

    /* Sample one edge in scan-angle space, returning geo [lon,lat] points.
       includeFirst=true adds the first point, false skips it (shared corner). */
    function edge(lam0, phi0, lam1, phi1, includeFirst) {
      var out = [];
      for (var i = includeFirst ? 0 : 1; i <= N; i++) {
        var t = i / N;
        var p = pt(lam0 + (lam1-lam0)*t, phi0 + (phi1-phi0)*t);
        if (p) out.push(p);
      }
      return out;
    }

    /* Check Geodetic Span */
    // var nw_geo = _GRS.inv(lam_c - D, phi_c + D, satLon);
    // var ne_geo = _GRS.inv(lam_c + D, phi_c + D, satLon);
    // var se_geo = _GRS.inv(lam_c + D, phi_c - D, satLon);
    // var sw_geo = _GRS.inv(lam_c - D, phi_c - D, satLon);
    // console.log('center:', lat, lon);
    // console.log('NW:', nw_geo, 'NE:', ne_geo, 'SE:', se_geo, 'SW:', sw_geo);
    // console.log('lat span:', nw_geo[1] - se_geo[1], 'lon span:', nw_geo[0] - se_geo[0]);

    var nw = [lam_c - D, phi_c + D];
    var ne = [lam_c + D, phi_c + D];
    var se = [lam_c + D, phi_c - D];
    var sw = [lam_c - D, phi_c - D];

    var pts = [];
    /* Counter-clockwise winding (GeoJSON right-hand rule): NW→SW→SE→NE */
    // pts = pts.concat(edge(nw[0],nw[1], sw[0],sw[1], true));   // left side down
    // pts = pts.concat(edge(sw[0],sw[1], se[0],se[1], false));   // bottom
    // pts = pts.concat(edge(se[0],se[1], ne[0],ne[1], false));   // right side up
    // pts = pts.concat(edge(ne[0],ne[1], nw[0],nw[1], false));   // top
    /* Clockwise winding (D3 right-hand rule): NW→NE→SE→SW */
    pts = pts.concat(edge(nw[0],nw[1], ne[0],ne[1], true));   // top left→right
    pts = pts.concat(edge(ne[0],ne[1], se[0],se[1], false));   // right side down
    pts = pts.concat(edge(se[0],se[1], sw[0],sw[1], false));   // bottom right→left
    pts = pts.concat(edge(sw[0],sw[1], nw[0],nw[1], false));   // left side up
    pts.push(pts[0]);

    if (pts.length < 4) return null;

    /* Label anchor: geographic position of the top-centre of the box */
    var topCentre = pt(lam_c, phi_c + D);
    var labelLat  = topCentre ? topCentre[1] : lat + 6;

    return {
      polygon:  { type:'Feature', geometry:{ type:'Polygon', coordinates:[pts] } },
      labelLat: labelLat
    };
  }

  /* == Look up the sat longitude for east/west keys == */
  function satLonForKey(satKey) {
    if (satKey === 'east') return SATS.east.lon;
    if (satKey === 'west') return SATS.west.lon;
    return 0;
  }
 
  /* == HimawariJP GEOJSON */
  let himawariJP = null;

  function loadHimawari() {
    if (himawariJP) return Promise.resolve(himawariJP);

    return fetch('/assets/js/himawari_japan.json')
      .then(res => res.json())
      .then(data => {
        himawariJP = data;
        return data;
      });
  }

  /* ══════════════════════════════════════════════════════════
     IMAGE URL HELPERS
  ══════════════════════════════════════════════════════════ */
 
  /**
   * Returns a link to the NESDIS GOES imagery viewer for this meso slot.
   * Grabs the latest GEOCOLOR of sat and meso.
   */
  function mesoViewerUrl(satKey, lat, lon, meso) {
    // mesoSlot: 'M1' or 'M2'
    // channel:  'GEOCOLOR', '07', '13', '02', '09', etc.
    var goesNum = (satKey === 'east') ? '19' : '18';
    var mesoNum = (meso === 'M2') ? 'M2' : 'M1';
    return 'https://cdn.star.nesdis.noaa.gov/GOES' + goesNum +
           '/ABI/MESO/' + mesoNum + '/GEOCOLOR/latest.jpg';
  }
 
  /**
   * Build image URL by meso slot (M1/M2) and channel.
   * Full-res: /GOES19/ABI/MESO/M1/GEOCOLOR/latest.jpg
   */
  function mesoImgUrl(satKey, mesoSlot, channel) {
    var goesNum = (satKey === 'east') ? '19' : '18';
    return 'https://cdn.star.nesdis.noaa.gov/GOES' + goesNum +
           '/ABI/MESO/' + mesoSlot + '/' + channel + '/latest.jpg';
  }
 
  /**
   * Low-res thumbnail variant (250×250), now 500x500.
   */
  function mesoLowResImgUrl(satKey, mesoSlot, channel) {
    var goesNum = (satKey === 'east') ? '19' : '18';
    return 'https://cdn.star.nesdis.noaa.gov/GOES' + goesNum +
           '/ABI/MESO/' + mesoSlot + '/' + channel + '/500x500.jpg';
          //  '/ABI/MESO/' + mesoSlot + '/' + channel + '/250x250.jpg';
  }

  function makeProjection() {
    return d3.geoOrthographic()
      .scale(scale)          
      .translate([CX, CY])
      .rotate(rotation)
      .clipAngle(90);
  }
 
  var gratData    = d3.geoGraticule().step([15,15])();
  var equatorData = { type:'LineString', coordinates: d3.range(-180,181).map(function(d){ return [d,0]; }) };
 
  /* == State == */
  var worldTopo  = null;
  var stateLines = null;   /* Natural Earth Admin 1 boundary lines */
  var mesoBoxes  = [];   /* from ADMNES */
  var scanTimes  = {};   /* {east_M1, east_M2, west_M1, west_M2} → {time, lat, lon} */

  /* == Active imagery channel selection == */
  var activeImgChannel = 'GEOCOLOR'; // or '07', '02', etc.

  /* == ABI channel catalogue (for the channel picker) == */
  var IMG_CHANNELS = [
    { id: 'GEOCOLOR', label: 'GeoColor',  desc: 'True color / multispectral IR' },
    { id: 'FireTemperature', label: 'Fire Temperature',   desc: 'Multispectral RGB for Fires' },
    { id: 'Sandwich', label: 'Sandwich',  desc: 'Multispectral IR band 13 with Vis 3' },
    { id: 'Dust',     label: 'Dust',      desc: 'Tropospheric Dust' },
    { id: 'DayNightCloudMicroCombo',     label: 'Day Night Cloud Micro Combo',      desc: 'Day: Show cloud-top phase; Night: distinguish clouds/fog' },
    { id: '01',       label: 'CH01',      desc: '0.47 µm Visible - Blue Band' },
    { id: '02',       label: 'CH02',      desc: '0.64 µm Visible - Red Band' },
    { id: '03',       label: 'CH03',      desc: '0.86 µm Veggie - Near IR' },
    { id: '04',       label: 'CH04',      desc: '1.37 µm Cirrus - Near IR' },
    { id: '05',       label: 'CH05',      desc: '1.6 µm Snow/Ice - Near IR' },
    { id: '06',       label: 'CH06',      desc: '2.2 µm Cloud Particle - Near IR' },
    { id: '07',       label: 'CH07',      desc: '3.9 µm Shortwave Window - IR' },
    { id: '08',       label: 'CH08',      desc: '6.2 µm Upper Water Vapor - IR' },
    { id: '09',       label: 'CH09',      desc: '6.9 µm Mid Water Vapor - IR' },
    { id: '10',       label: 'CH10',      desc: '7.3 µm Lower Water Vapor - IR' },
    { id: '11',       label: 'CH11',      desc: '8.4 µm Cloud Top - IR' },
    { id: '12',       label: 'CH12',      desc: '9.6 µm Ozone - IR' },
    { id: '13',       label: 'CH13',      desc: '10.3 µm Clean Longwave - IR' },
    { id: '14',       label: 'CH14',      desc: '11.2 µm Longwave - IR' },
    { id: '15',       label: 'CH15',      desc: '12.3 µm Dirty Longwave - IR' },
    { id: '16',       label: 'CH16',      desc: '13.3 µm CO2 Longwave - IR' },
  ];
    
  /* ══════════════════════════════════════════════════════════
     SOLAR POSITION — returns { lat, lon } of subsolar point
     Uses low-precision solar coordinates (accuracy ~0.01°).
     Based on Jean Meeus "Astronomical Algorithms" Ch.25.
  ══════════════════════════════════════════════════════════ */
  function solarPosition(date) {
    var JD  = date / 86400000 + 2440587.5;          /* Julian Date */
    var n   = JD - 2451545.0;                        /* days since J2000.0 */
    var L   = (280.460 + 0.9856474 * n) % 360;      /* mean longitude */
    var g   = (357.528 + 0.9856003 * n) % 360;      /* mean anomaly (deg) */
    var gR  = g * Math.PI / 180;
    var lam = L + 1.915 * Math.sin(gR) + 0.020 * Math.sin(2*gR); /* ecliptic lon */
    var lamR = lam * Math.PI / 180;
    var eps = (23.439 - 0.0000004 * n) * Math.PI / 180; /* obliquity */
    /* Right ascension & declination */
    var ra  = Math.atan2(Math.cos(eps) * Math.sin(lamR), Math.cos(lamR));
    var dec = Math.asin(Math.sin(eps) * Math.sin(lamR));
    /* Greenwich Mean Sidereal Time (degrees) */
    var GMST = (280.46061837 + 360.98564736629 * n) % 360;
    /* Subsolar longitude = RA - GMST (converted) */
    var subLon = (ra * 180/Math.PI - GMST + 360) % 360;
    if (subLon > 180) subLon -= 360;
    var subLat = dec * 180 / Math.PI;
    return { lat: subLat, lon: subLon };
  }

  /* == Draw == */
  function draw() {
    var proj = makeProjection();
    var path = d3.geoPath().projection(proj);
    var visibleCenter = [-rotation[0], -rotation[1]];
    
    /* Globe background — redrawn every frame so it tracks zoom */
    gSphere.selectAll('*').remove();
    gSphere.append('circle').attr('cx',CX).attr('cy',CY).attr('r',scale).attr('fill','#04080f');
    gSphere.append('circle').attr('cx',CX).attr('cy',CY).attr('r',scale)
      .attr('fill','none').attr('stroke','rgba(100,160,255,0.12)').attr('stroke-width',2);

    /* Lat and Lon Grid */
    gGrat.selectAll('path').remove();
    gGrat.append('path').datum(gratData).attr('d',path)
      .attr('fill','none').attr('stroke','rgba(60,100,160,0.3)').attr('stroke-width',0.4);
    gGrat.append('path').datum(equatorData).attr('d',path)
      .attr('fill','none').attr('stroke','rgba(60,100,160,0.6)').attr('stroke-width',0.7);

    /* World Features */
    if (worldTopo) {
      gLand.selectAll('path').remove();
      gLand.append('path')
        .datum(topojson.feature(worldTopo, worldTopo.objects.land))
        .attr('d',path).attr('fill','#2a3d2a').attr('stroke','#3d5c3d').attr('stroke-width',0.5);
      gBorders.selectAll('path').remove();
      gBorders.append('path')
        .datum(topojson.mesh(worldTopo, worldTopo.objects.countries, function(a,b){ return a!==b; }))
        .attr('d',path).attr('fill','none').attr('stroke','#4a6b4a')
        .attr('stroke-width',1).attr('stroke-dasharray','2 2');
    }

    /* State / Province borders (Admin 1) */
    gStates.selectAll('path').remove();
    if (stateLines) {
      gStates.append('path')
        .datum(stateLines)
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#3a5c3a')
        .attr('stroke-width', 1)
        // .attr('stroke-width', 0.25)
        .attr('stroke-dasharray', '1.5 2');
    }

    /* Night shadow + terminator */
    gNight.selectAll('*').remove();
    var sol = solarPosition(Date.now());
    /* The night hemisphere is a great circle 90° from the subsolar point.
        d3.geoCircle centered on the ANTI-solar point with radius 90° = night side. */
    var antiSol = [sol.lon + 180, -sol.lat];
    if (antiSol[0] > 180) antiSol[0] -= 360;
    var nightFeature = d3.geoCircle().center(antiSol).radius(90)();
    gNight.append('path')
      .datum(nightFeature)
      .attr('d', path)
      .attr('fill', 'rgba(0,5,20,0.55)')
      .attr('stroke', 'rgba(180,210,255,0.55)')
      .attr('stroke-width', 1.4);

    /* Satellite Field of Regard */
    gDisk.selectAll('*').remove();
    Object.values(SATS).forEach(function(sat) {
      var disk = d3.geoCircle().center([sat.lon,0]).radius(CLIP_ANGLE)();
      gDisk.append('path').datum(disk).attr('d',path)
        .attr('fill',sat.diskFill).attr('stroke',sat.diskColor)
        .attr('stroke-width',1.2).attr('stroke-dasharray','4 3').attr('opacity',0.9);
    });
 
    /* == Meso boxes (ADMNES / NetCDF sourced) == */
    gMeso.selectAll('*').remove();
    mesoBoxes.forEach(function(box) {
      var center = proj([box.lon, box.lat]);
      if (!center) return;
 
      var sLon   = satLonForKey(box.sat);
      console.log('drawing box:', box.sat, box.meso, 'center:', box.lat, box.lon, 'satLon:', sLon);
      var result = mesoPolygon(box.lat, box.lon, sLon);
      if (!result) return;
 
      gMeso.append('path').datum(result.polygon).attr('d',path)
        .attr('fill',box.style.fill).attr('stroke',box.style.stroke).attr('stroke-width',1.8);
 
      var labelPt = proj([box.lon, result.labelLat]);
      if (labelPt) {
        if (d3.geoDistance([box.lon, box.lat], visibleCenter) >= Math.PI / 2) return;
        var g = gMeso.append('g');
        var label = box.sat.toUpperCase() + ' ' + box.meso;
        var tw = label.length * 6.5 + 10;
        g.append('rect').attr('x',labelPt[0]-tw/2).attr('y',labelPt[1]-9)
          .attr('width',tw).attr('height',14).attr('rx',3).attr('fill','rgba(4,8,15,0.82)');
        g.append('text').attr('x',labelPt[0]).attr('y',labelPt[1]+1)
          .attr('text-anchor','middle').attr('dominant-baseline','middle')
          .attr('fill',box.style.labelFill).attr('font-size',9)
          .attr('font-family','Share Tech Mono, monospace').attr('font-weight','600')
          .attr('letter-spacing','0.06em').text(label);
      }
    });
 
    /* Scan-detected fallback boxes (no ADMNES entry for that slot) */
    var admnesKeys = {};
    mesoBoxes.forEach(function(b){ admnesKeys[b.sat+'_'+b.meso] = true; });
    Object.keys(scanTimes).forEach(function(key) {
      if (admnesKeys[key]) return;
      var info = scanTimes[key];
      if (!info || info.lat == null || info.lon == null) return;
      var parts  = key.split('_');
      var sat    = parts[0], meso = parts[1];
      var style  = MESO_STYLE[sat] && MESO_STYLE[sat][meso] ? MESO_STYLE[sat][meso] : MESO_STYLE.east.M1;
      var sLon   = satLonForKey(sat);
      var result = mesoPolygon(info.lat, info.lon, sLon);
      if (!result) return;
      var center = proj([info.lon, info.lat]);
      if (!center) return;
      gMeso.append('path').datum(result.polygon).attr('d',path)
        .attr('fill',style.fill).attr('stroke',style.stroke)
        .attr('stroke-width',1.2).attr('stroke-dasharray','5 3').attr('opacity',0.7);
      var labelPt = proj([info.lon, result.labelLat]);
      if (labelPt) {
        var g2 = gMeso.append('g');
        var lbl2 = sat.toUpperCase() + ' ' + meso + ' (S3)';
        var tw2 = lbl2.length * 5.8 + 10;
        g2.append('rect').attr('x',labelPt[0]-tw2/2).attr('y',labelPt[1]-9)
          .attr('width',tw2).attr('height',14).attr('rx',3).attr('fill','rgba(4,8,15,0.75)');
        g2.append('text').attr('x',labelPt[0]).attr('y',labelPt[1]+1)
          .attr('text-anchor','middle').attr('dominant-baseline','middle')
          .attr('fill',style.labelFill).attr('font-size',8)
          .attr('font-family','Share Tech Mono, monospace').attr('opacity',0.8)
          .text(lbl2);
      }
    });

    /* GK2A AMI Local Area sector footprint (static, from la020ge file header) */
    gGK2A.selectAll('*').remove();
    (function() {
      var la = SATS.gk2a.laSector;
      // Build a GeoJSON polygon from the four geodetic corners (clockwise)
      var coords = [la.nw, la.ne, la.se, la.sw, la.nw];
      var feature = { type:'Feature', geometry:{ type:'Polygon', coordinates:[coords] } };
      var centerLon = (la.nw[0]+la.ne[0]+la.se[0]+la.sw[0])/4;
      var centerLat = (la.nw[1]+la.ne[1]+la.se[1]+la.sw[1])/4;
      if (d3.geoDistance([centerLon, centerLat], visibleCenter) >= Math.PI/2) return;
      gGK2A.append('path').datum(feature).attr('d', path)
        .attr('fill', SATS.gk2a.laFill)
        .attr('stroke', SATS.gk2a.laColor)
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '5 3')
        .attr('opacity', 0.85);
      // Label at top-center
      var labelPt = proj([centerLon, la.nw[1]]);
      if (labelPt) {
        var lbl = 'GK2A LA';
        var tw = lbl.length * 6 + 10;
        gGK2A.append('rect')
          .attr('x', labelPt[0]-tw/2).attr('y', labelPt[1]-9)
          .attr('width', tw).attr('height', 14).attr('rx', 3)
          .attr('fill', 'rgba(4,8,15,0.82)');
        gGK2A.append('text')
          .attr('x', labelPt[0]).attr('y', labelPt[1]+1)
          .attr('text-anchor','middle').attr('dominant-baseline','middle')
          .attr('fill', SATS.gk2a.laColor).attr('font-size', 9)
          .attr('font-family','Share Tech Mono, monospace').attr('font-weight','600')
          .attr('letter-spacing','0.06em').text(lbl);
      }
    })();

    /* Himawari-9 JP sector footprint (static, GEOJSON file) */
    gH9JP.selectAll('*').remove();
    (function() {
      loadHimawari().then(data => {
        gH9JP.append('path')
          .datum(data)
          .attr('d', path)
          .attr('fill', SATS.h9.jpFill)
          .attr('stroke', SATS.h9.jpColor)
          .attr('stroke-width', 1.4)
          .attr('stroke-dasharray', '5 3')
          .attr('opacity', 0.85);
        });
      var labelPt = proj([SATS.h9.jpCenter[0], SATS.h9.jpCenter[1]]);
      // console.log('JPN Vis:', SATS.h9.jpCenter, visibleCenter)
      if (d3.geoDistance(SATS.h9.jpCenter, visibleCenter) >= Math.PI/2) return;
      if (labelPt) {
        var lbl = 'H9 JPN';
        var tw = lbl.length * 6 + 10;
        gH9JP.append('rect')
          .attr('x', labelPt[0]-tw/2).attr('y', labelPt[1]-9)
          .attr('width', tw).attr('height', 14).attr('rx', 3)
          .attr('fill', 'rgba(4,8,15,0.82)');
        gH9JP.append('text')
          .attr('x', labelPt[0]).attr('y', labelPt[1]+1)
          .attr('text-anchor','middle').attr('dominant-baseline','middle')
          .attr('fill', SATS.h9.jpColor).attr('font-size', 9)
          .attr('font-family','Share Tech Mono, monospace').attr('font-weight','600')
          .attr('letter-spacing','0.06em').text(lbl);
      };
    })();

    /* Launch sites */
    gLaunch.selectAll('*').remove();
    LAUNCH_SITES.forEach(function(site) {
      if (d3.geoDistance([site.lon, site.lat], visibleCenter) >= Math.PI / 2) return;
      var pt = proj([site.lon, site.lat]);
      if (!pt) return;

      /* Triangle marker */
      var ts = 6;
      var tri = (pt[0])+','+(pt[1]-ts*1.1)+' '+(pt[0]-ts)+','+(pt[1]+ts*0.6)+' '+(pt[0]+ts)+','+(pt[1]+ts*0.6);
      gLaunch.append('polygon')
        .attr('points', tri)
        .attr('fill', '#e8f060')
        .attr('stroke', '#b8bc30')
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.92)
        .style('cursor', 'crosshair')
        .attr('data-name', site.name)
        .on('mouseenter', function(event) {
          var tip = document.getElementById('gv-tooltip');
          // tip.textContent = site.name + ' (' + site.country + ')';
          // tip.textContent += '\r\n' + site.lat + ', ' + site.lon;
          tip.innerHTML = site.name + '<br>' +
          'Operator: ' + site.country + '<br>' +
          'Location: ' + site.lat + ', ' + site.lon;
          tip.style.display = 'block';
          tip.style.left = (event.clientX + 14) + 'px';
          tip.style.top  = (event.clientY - 10) + 'px';
        })
        .on('mousemove', function(event) {
          var tip = document.getElementById('gv-tooltip');
          tip.style.left = (event.clientX + 14) + 'px';
          tip.style.top  = (event.clientY - 10) + 'px';
        })
        .on('mouseleave', function() {
          document.getElementById('gv-tooltip').style.display = 'none';
        });

    });

    /* Satellite Sub-points */
    gSubsat.selectAll('*').remove();
    Object.values(SATS).forEach(function(sat) {
      // console.log(sat)
      if (d3.geoDistance([sat.lon, 0], visibleCenter) >= Math.PI / 2) return;
      
        /* Label */
        var lonStr = sat.lon >= 0
          ? sat.lon.toFixed(1) + '°E'
          : Math.abs(sat.lon).toFixed(1) + '°W';
        var slabel = sat.name + ' Subpoint, ' + lonStr;
        // var sinfo = latStr + ' ' + lonStr;
        var stw = slabel.length * 6 + 10;

      var pt = proj([sat.lon, 0]);
      if (!pt) return;
      gSubsat.append('circle').attr('cx',pt[0]).attr('cy',pt[1]).attr('r',7)
        .attr('fill','none').attr('stroke',sat.diskColor).attr('stroke-width',1.2);
      gSubsat.append('circle').attr('cx',pt[0]).attr('cy',pt[1]).attr('r',3).attr('fill',sat.diskColor);
      gSubsat.append('line').attr('x1',pt[0]-11).attr('y1',pt[1]).attr('x2',pt[0]+11).attr('y2',pt[1])
        .attr('stroke',sat.diskColor).attr('stroke-width',0.8);
      gSubsat.append('line').attr('x1',pt[0]).attr('y1',pt[1]-11).attr('x2',pt[0]).attr('y2',pt[1]+11)
        .attr('stroke',sat.diskColor).attr('stroke-width',0.8);
      gSubsat.append('text')
        .attr('x', pt[0]).attr('y', pt[1] + 20)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff').attr('font-size', 8.5)
        .attr('font-family', 'Share Tech Mono, monospace')
        .attr('letter-spacing', '0.04em')
        .text(sat.name)
      gSubsat.append('text')
        .attr('x', pt[0]).attr('y', pt[1] + 32)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff').attr('font-size', 8.5)
        .attr('font-family', 'Share Tech Mono, monospace')
        .attr('letter-spacing', '0.04em')
        .text(lonStr)
    });

    /* Solar subpoint */
    gSolar.selectAll('*').remove();
    var solPt = proj([sol.lon, sol.lat]);
    if (d3.geoDistance([sol.lon, sol.lat], visibleCenter) >= Math.PI / 2) return;
    if (solPt) {
      /* Outer glow ring */
      // gSolar.append('circle')
      //   .attr('cx', solPt[0]).attr('cy', solPt[1]).attr('r', 10)
      //   .attr('fill', 'rgba(255,220,80,0.12)')
      //   .attr('stroke', 'rgba(255,220,80,0.35)')
      //   .attr('stroke-width', 1);
      /* Inner bright dot */
      gSolar.append('circle')
        .attr('cx', solPt[0]).attr('cy', solPt[1]).attr('r', 4.5)
        .attr('fill', '#ffe050')
        .attr('stroke', '#ffaa00')
        .attr('stroke-width', 1.2);

      /* Label */
      var latStr = sol.lat >= 0
        ? sol.lat.toFixed(1) + '°N'
        : Math.abs(sol.lat).toFixed(1) + '°S';
      var lonStr = sol.lon >= 0
        ? sol.lon.toFixed(1) + '°E'
        : Math.abs(sol.lon).toFixed(1) + '°W';
      // var slabel = '☀ Solar Subpoint';
      var slabel = 'Solar Subpoint';
      var sinfo = latStr + ' ' + lonStr;
      var stw = slabel.length * 6 + 10;
      gSolar.append('rect')
        .attr('x', solPt[0] - stw/2)
        .attr('y', solPt[1] + 13)
        .attr('width', stw).attr('height', 24)
        .attr('rx', 3).attr('fill', 'rgba(4,8,15,0.82)');
      gSolar.append('text')
        .attr('x', solPt[0]).attr('y', solPt[1] + 20)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#ffe050').attr('font-size', 8.5)
        .attr('font-family', 'Share Tech Mono, monospace')
        .attr('letter-spacing', '0.04em')
        .text(slabel)
        gSolar.append('text')
        .attr('x', solPt[0]).attr('y', solPt[1] + 30)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#ffe050').attr('font-size', 8.5)
        .attr('font-family', 'Share Tech Mono, monospace')
        .attr('letter-spacing', '0.04em')
        .text(sinfo);
    }
  }
 
  /* ══════════════════════════════════════════════════════════
     DRAG + MOMENTUM
  ══════════════════════════════════════════════════════════ */
  var dragging=false, lastPos=null, velocity=[0,0], lastTime=0, momentumRaf=null;
  function stopMomentum(){ if(momentumRaf){cancelAnimationFrame(momentumRaf);momentumRaf=null;} }
  function startMomentum(){
    stopMomentum();
    var vl=velocity[0], va=velocity[1];
    function step(){
      vl*=0.94; va*=0.94;
      if(Math.abs(vl)<0.002&&Math.abs(va)<0.002) return;
      rotation[0]+=vl*16;
      rotation[1]=Math.max(-90,Math.min(90,rotation[1]+va*16));
      draw();
      momentumRaf=requestAnimationFrame(step);
    }
    momentumRaf=requestAnimationFrame(step);
  }
  function getPos(e){ return e.touches ? [e.touches[0].clientX,e.touches[0].clientY] : [e.clientX,e.clientY]; }
  function onDragStart(e){
    e.preventDefault(); stopMomentum(); dragging=true; lastPos=getPos(e); lastTime=Date.now(); velocity=[0,0];
    document.getElementById('gv-hint').textContent='Dragging…';
  }
  function onDragMove(e){
    if(!dragging) return; e.preventDefault();
    var pos=getPos(e), now=Date.now(), dt=Math.max(1,now-lastTime);
    var dlon=(pos[0]-lastPos[0])*0.3, dlat=(pos[1]-lastPos[1])*0.3;
    velocity=[dlon/dt, dlat/dt];
    rotation[0]+=dlon;
    rotation[1]=Math.max(-85,Math.min(85,rotation[1]-dlat));
    lastPos=pos; lastTime=now; draw();
  }
  function onDragEnd(){
    if(!dragging) return; dragging=false;
    document.getElementById('gv-hint').textContent='Drag to rotate';
    startMomentum();
  }
  var wrap=document.getElementById('gv-wrap');
  wrap.addEventListener('mousedown',onDragStart,{passive:false});
  wrap.addEventListener('touchstart',onDragStart,{passive:false});
  document.addEventListener('mousemove',onDragMove);
  document.addEventListener('touchmove',onDragMove,{passive:false});
  document.addEventListener('mouseup',onDragEnd);
  document.addEventListener('touchend',onDragEnd);
 
  var scale = R; // current scale, starts at full-globe
  var MIN_SCALE = R, MAX_SCALE = R * 6;

  wrap.addEventListener('wheel', function(e) {
    e.preventDefault();
    var factor = e.deltaY < 0 ? 1.1 : 0.91;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    draw();
  }, { passive: false });

  /* == UTC clock == */
  function tickClock(){ document.getElementById('gv-utc').textContent=new Date().toUTCString().replace(' GMT',' UTC'); }
  tickClock(); setInterval(tickClock,1000);
  /* Redraw every 60 s so terminator + solar subpoint drift correctly */
  setInterval(draw, 60000);

  /* ══════════════════════════════════════════════════════════
     S3 PATH HELPERS
  ══════════════════════════════════════════════════════════ */
  function getS3PathParts(offsetHours) {
    var d     = new Date(Date.now() + (offsetHours||0)*3600000);
    var year  = d.getUTCFullYear();
    var start = new Date(Date.UTC(year,0,1));
    var jday  = Math.floor((d-start)/86400000)+1;
    return { year:year, jday:String(jday).padStart(3,'0'), hour:String(d.getUTCHours()).padStart(2,'0') };
  }
 
  function parseS3Keys(xmlText) {
    var keys = [];
    (xmlText.match(/<Key>([^<]+)<\/Key>/g)||[]).forEach(function(m){
      keys.push(m.replace(/<\/?Key>/g,''));
    });
    return keys;
  }
 
  function parseScanTime(filename) {
    /* OR_ABI-L2-CMIPM1-M6C01_G19_s20261021430179_e... */
    var m = filename.match(/_s(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})/);
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1],0,1));
    d.setUTCDate(d.getUTCDate() + (+m[2]-1));
    d.setUTCHours(+m[3], +m[4], +m[5], 0);
    return d;
  }
 
  function fmtUTC(d) {
    if (!d) return '—';
    return d.toUTCString().replace(/.*?,\s*/,'').replace(/ GMT$/,'') + ' UTC';
  }
   
  /* ══════════════════════════════════════════════════════════
     GOES ABI FILE HEADER PARSER  (NetCDF-3 + HDF5/NetCDF-4)
 
     GOES ABI files are NetCDF4/HDF5 format (magic: 89 48 44 46).
     We Range-fetch the first 256 KB and scan for global attributes:
       geospatial_lat_center   float32, degrees_north
       geospatial_lon_center   float32, degrees_east
       time_coverage_start     ISO-8601 string
 
     == HDF5 Attribute Message layout ========================─
     Version 1 (8-byte header, padded sections):
       [0]     uint8   version (1)
       [1]     uint8   reserved
       [2-3]   uint16  name_size  (LE, includes null terminator)
       [4-5]   uint16  dtype_size (LE)
       [6-7]   uint16  dspace_size (LE)
       [8 ..]  char[]  name  (null-terminated, padded to 8-byte boundary)
       [..]    bytes   datatype msg (padded to 8 bytes)
       [..]    bytes   dataspace msg (padded to 8 bytes)
       [..]    bytes   data
 
     Version 3 (9-byte header, no padding):
       [0]     uint8   version (3)
       [1]     uint8   flags
       [2-3]   uint16  name_size  (LE)
       [4-5]   uint16  dtype_size (LE)
       [6-7]   uint16  dspace_size (LE)
       [8]     uint8   name charset (0=ASCII)
       [9 ..]  char[]  name (NOT padded)
       [..]    bytes   datatype (NOT padded)
       [..]    bytes   dataspace (NOT padded)
       [..]    bytes   data
 
     Float32 values are little-endian (x86 architecture).
     NetCDF-3 (legacy, big-endian floats) is also handled as fallback.
  ══════════════════════════════════════════════════════════ */
 
  /**
   * Scan a raw ArrayBuffer for an HDF5 attribute message by name.
   * Returns { dataOff, dtypeOff, dtypeSize } or null.
   * Works for both attribute message versions 1 and 3.
   */
  function findHdf5AttrMsg(bytes, attrName) {
    var enc     = new TextEncoder().encode(attrName);
    var nameLen = enc.length;
    var limit   = bytes.length - nameLen - 20;
 
    for (var i = 9; i < limit; i++) {
      if (bytes[i] !== enc[0]) continue;
      var match = true;
      for (var j = 1; j < nameLen; j++) {
        if (bytes[i + j] !== enc[j]) { match = false; break; }
      }
      if (!match) continue;
      if (bytes[i + nameLen] !== 0) continue;
 
      /* Try v3 (9-byte header, name at hdr+9) then v1 (8-byte header, name at hdr+8).
         NetCDF4 C library writes v3; h5py may write v1. */
      var hdrBacks = [9, 8];
      for (var bi = 0; bi < hdrBacks.length; bi++) {
        var back = hdrBacks[bi];
        var hdr  = i - back;
        if (hdr < 0) continue;
 
        var version    = bytes[hdr];
        var nameSize   = bytes[hdr + 2] | (bytes[hdr + 3] << 8);
        var dtypeSize  = bytes[hdr + 4] | (bytes[hdr + 5] << 8);
        var dspaceSize = bytes[hdr + 6] | (bytes[hdr + 7] << 8);
 
        if (nameSize !== nameLen + 1)          continue;
        if (back === 9 && version !== 3)       continue;
        if (back === 8 && version !== 1)       continue;
        if (dtypeSize  < 4 || dtypeSize  > 512) continue;
        if (dspaceSize > 512)                  continue;
 
        var dtypeOff, dataOff;
        if (version === 1) {
          var namePad   = Math.ceil(nameSize  / 8) * 8;
          var dtypePad  = Math.ceil(dtypeSize / 8) * 8;
          var dspacePad = Math.ceil(dspaceSize / 8) * 8;
          dtypeOff = hdr + 8 + namePad;
          dataOff  = dtypeOff + dtypePad + dspacePad;
        } else {
          /* v3: no padding; charset byte at hdr+8, name immediately after */
          dtypeOff = hdr + 9 + nameSize;
          dataOff  = dtypeOff + dtypeSize + dspaceSize;
        }
 
        if (dataOff + 4 > bytes.length) continue;
        return { dataOff: dataOff, dtypeOff: dtypeOff, dtypeSize: dtypeSize };
      }
    }
    return null;
  }
 
  /**
   * Extract a float32 (little-endian) global attribute from an HDF5 buffer.
   * Returns the float value or null.
   */
  function findHdf5FloatAttr(buf, attrName) {
    var bytes  = new Uint8Array(buf);
    var result = findHdf5AttrMsg(bytes, attrName);
    if (!result) return null;
 
    var view = new DataView(buf);
    // console.log('view',view)
    return view.getFloat32(result.dataOff, true /* little-endian */);
  }
 
  /**
   * Extract a string global attribute from an HDF5 buffer.
   * Returns the trimmed string or null.
   *
   * HDF5 string datatype: class 3 (0x03).
   * The string length is stored in bytes [4..7] of the datatype message.
   * Variable-length strings (class 3, flag bit) are also handled via
   * a regex fallback scan for ISO-8601 timestamps.
   */
  function findHdf5StringAttr(buf, attrName) {
    var bytes  = new Uint8Array(buf);
    var result = findHdf5AttrMsg(bytes, attrName);
    if (!result) return null;
 
    /* Read string length from datatype message bytes 4-7 (LE uint32) */
    var strLen = bytes[result.dtypeOff + 4] |
                (bytes[result.dtypeOff + 6] << 16) |
                (bytes[result.dtypeOff + 7] << 24);
 
    if (strLen > 0 && strLen < 512 && result.dataOff + strLen <= bytes.length) {
      var chars = '';
      for (var k = 0; k < strLen; k++) {
        var c = bytes[result.dataOff + k];
        if (c === 0) break;
        chars += String.fromCharCode(c);
      }
      return chars.trim() || null;
    }
    return null;
  }
 
  /**
   * Fallback: scan raw bytes for an ISO-8601 timestamp string.
   * Used when the structured HDF5 attribute parser can't extract the string.
   */
  function scanForIsoTimestamp(buf) {
    /* Look for pattern: YYYY-MM-DDTHH:MM:SS */
    var bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length - 19; i++) {
      if (bytes[i+4] === 0x2D && bytes[i+7] === 0x2D &&   /* dashes */
          bytes[i+10] === 0x54 &&                           /* T */
          bytes[i+13] === 0x3A && bytes[i+16] === 0x3A) {  /* colons */
        /* Verify digits at expected positions */
        var ok = true;
        for (var d of [0,1,2,3,5,6,8,9,11,12,14,15,17,18]) {
          if (bytes[i+d] < 0x30 || bytes[i+d] > 0x39) { ok = false; break; }
        }
        if (!ok) continue;
        var s = '';
        for (var k = 0; k < 20; k++) s += String.fromCharCode(bytes[i+k]);
        return s;
      }
    }
    return null;
  }
 
  /* == NetCDF-3 fallback (big-endian, CDF magic) ============─
     Kept for any legacy files that still use classic format.   */
  function findNc3FloatAttr(buf, attrName) {
    var bytes   = new Uint8Array(buf);
    var enc     = new TextEncoder().encode(attrName);
    var nameLen = enc.length;
    var view    = new DataView(buf);
    for (var i = 0; i < bytes.length - nameLen - 16; i++) {
      var match = true;
      for (var j = 0; j < nameLen; j++) {
        if (bytes[i+j] !== enc[j]) { match = false; break; }
      }
      if (!match) continue;
      var nameStart = i - 4;
      if (nameStart < 0) continue;
      var storedLen = view.getInt32(nameStart, false);  /* BE */
      if (storedLen !== nameLen) continue;
      var padded    = Math.ceil(nameLen / 4) * 4;
      var typeOff   = nameStart + 4 + padded;
      if (typeOff + 12 > buf.byteLength) continue;
      var ncType  = view.getInt32(typeOff,     false);
      var numVals = view.getInt32(typeOff + 4, false);
      if (ncType === 5 && numVals >= 1) {
        var valOff = typeOff + 8;
        if (valOff + 4 <= buf.byteLength)
          return view.getFloat32(valOff, false);  /* BE float */
      }
    }
    return null;
  }
 
  function findNc3StringAttr(buf, attrName) {
    var bytes   = new Uint8Array(buf);
    var enc     = new TextEncoder().encode(attrName);
    var nameLen = enc.length;
    var view    = new DataView(buf);
    for (var i = 0; i < bytes.length - nameLen - 16; i++) {
      var match = true;
      for (var j = 0; j < nameLen; j++) {
        if (bytes[i+j] !== enc[j]) { match = false; break; }
      }
      if (!match) continue;
      var nameStart = i - 4;
      if (nameStart < 0) continue;
      var storedLen = view.getInt32(nameStart, false);
      if (storedLen !== nameLen) continue;
      var padded   = Math.ceil(nameLen / 4) * 4;
      var typeOff  = nameStart + 4 + padded;
      if (typeOff + 12 > buf.byteLength) continue;
      var ncType  = view.getInt32(typeOff,     false);
      var numVals = view.getInt32(typeOff + 4, false);
      if (ncType === 2 && numVals > 0) {
        var valOff = typeOff + 8;
        if (valOff + numVals > buf.byteLength) continue;
        var chars = '';
        for (var k = 0; k < numVals; k++) {
          var c = bytes[valOff + k];
          if (c === 0) break;
          chars += String.fromCharCode(c);
        }
        return chars.trim();
      }
    }
    return null;
  }
 
  /**
   * Decompress a gzip ArrayBuffer using the browser DecompressionStream API.
   * Returns a Promise<ArrayBuffer> of the decompressed bytes (first 256 KB).
   */
  function gunzip(buf) {
    var ds     = new DecompressionStream('gzip');
    var writer = ds.writable.getWriter();
    var reader = ds.readable.getReader();
    var chunks = [];
    var total  = 0;
    var LIMIT  = 262144;  /* 256 KB */
    writer.write(buf);
    writer.close();
    function pump() {
      return reader.read().then(function(res) {
        if (res.done || total >= LIMIT) {
          var out = new Uint8Array(Math.min(total, LIMIT));
          var off = 0;
          chunks.forEach(function(c) {
            var slice = c.byteLength;
            if (off + slice > LIMIT) slice = LIMIT - off;
            out.set(new Uint8Array(c, 0, slice), off);
            off += slice;
          });
          return out.buffer;
        }
        chunks.push(res.value);
        total += res.value.byteLength;
        return pump();
      });
    }
    return pump().catch(function(e) {
      throw new Error('gunzip failed: ' + e.message);
    });
  }
 
  /**
   * Parse lat/lon/time from a raw ArrayBuffer.
   * Handles both HDF5/NetCDF-4 and NetCDF-3 (classic) formats.
   */
  function parseGoesHeader(buf) {
    var b = new Uint8Array(buf, 0, Math.min(buf.byteLength, 8));
    /* == HDF5 / NetCDF-4 (magic: 89 48 44 46) == */
    if (b[0] === 0x89 && b[1] === 0x48 && b[2] === 0x44 && b[3] === 0x46) {
      // console.debug('HDF5 / NetCDF-4')
      // console.log('buffer',buf)
      var lat  = findHdf5FloatAttr(buf, 'geospatial_lat_center');
      var lon  = findHdf5FloatAttr(buf, 'geospatial_lon_center');
      var tstr = findHdf5StringAttr(buf, 'time_coverage_start');
      console.log('Meso geolocation:',lat, lon, tstr)
      /* Fallback: scan raw bytes for ISO timestamp if string parser missed it */
      if (!tstr) tstr = scanForIsoTimestamp(buf);
      if (lat === null || lon === null) return null;
      var time = tstr ? new Date(tstr) : null;
      return { lat: lat, lon: lon, time: time, fmt: 'hdf5' };
    }
 
    /* == NetCDF-3 classic (magic: CDF\x01 or CDF\x02) == */
    if (b[0] === 0x43 && b[1] === 0x44 && b[2] === 0x46) {
      console.debug('NetCDF-3 classic')
      var lat  = findNc3FloatAttr(buf, 'geospatial_lat_center');
      var lon  = findNc3FloatAttr(buf, 'geospatial_lon_center');
      var tstr = findNc3StringAttr(buf, 'time_coverage_start');
      if (lat === null || lon === null) return null;
      var time = tstr ? new Date(tstr) : null;
      return { lat: lat, lon: lon, time: time, fmt: 'nc3' };
    }
 
    /* Unknown format */
    var hex = Array.from(b.slice(0, 8))
      .map(function(x) { return x.toString(16).padStart(2, '0'); }).join(' ');
    throw new Error('Unrecognised file format (magic: ' + hex + ')');
  }
 
  /**
   * Fetch the first 256 KB of a GOES S3 file and extract
   * lat/lon center + scan time from its global attributes.
   * Handles raw, gzip-compressed, HDF5, and NetCDF-3 responses.
   * Returns a Promise resolving to { lat, lon, time } or null.
   */
  function fetchNetcdfMeta(s3Key, bucket) {
    var url = 'https://' + bucket + '.s3.amazonaws.com/' + s3Key;
    console.log('Fetching GOES header:', url);
    return fetch(url, {
      headers: {
        // 'Range': 'bytes=0-524287',       /* 512 KB */
        'Accept-Encoding': 'identity',   /* request raw bytes; CDN may still gzip */
      }
    })
    .then(function(r) {
      if (!r.ok && r.status !== 206) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    })
    .then(function(buf) {
      var b = new Uint8Array(buf, 0, Math.min(buf.byteLength, 2));
      if (b[0] === 0x1F && b[1] === 0x8B) {
        console.warn('S3 returned gzip — decompressing in browser');
        return gunzip(buf).then(parseGoesHeader);
      }
      // console.log('buf size:', buf.byteLength, 'magic:', Array.from(new Uint8Array(buf,0,4)).map(x=>x.toString(16)));
      return parseGoesHeader(buf);
    });
  };
 
  /* ══════════════════════════════════════════════════════════
     MAIN FETCH PIPELINE
     1. List the current (and prior) hour's directory on S3
        for each of the 4 meso slots.
     2. Take the most recent file in that listing.
     3. Range-fetch its NetCDF header to extract lat/lon.
     4. Update the globe and scan cards.
 
     Product: ABI-L2-CMIPM (Cloud & Moisture Imagery, Mesoscale)
       — smaller files than L1b, same header attributes.
     Fallback: ABI-L1b-RadM
  ══════════════════════════════════════════════════════════ */
 
  /* startAfterTag uses S3's &start-after= to jump past M1 files for M2 slots.
     The S3 folder is always ABI-L2-CMIPM/ — meso number is filename-only.
     Without start-after, max-keys=50 returns only M1 files (CMIPM1 < CMIPM2). */
  var MESO_SLOTS = [
    { sat:'east', meso:'M1', mesoTag:'CMIPM1', startAfterTag:'',                bucket:'noaa-goes19', product:'ABI-L2-CMIPM', timeId:'sc-e1-time', posId:'sc-e1-pos' },
    { sat:'east', meso:'M2', mesoTag:'CMIPM2', startAfterTag:'OR_ABI-L2-CMIPM2', bucket:'noaa-goes19', product:'ABI-L2-CMIPM', timeId:'sc-e2-time', posId:'sc-e2-pos' },
    { sat:'west', meso:'M1', mesoTag:'CMIPM1', startAfterTag:'',                bucket:'noaa-goes18', product:'ABI-L2-CMIPM', timeId:'sc-w1-time', posId:'sc-w1-pos' },
    { sat:'west', meso:'M2', mesoTag:'CMIPM2', startAfterTag:'OR_ABI-L2-CMIPM2', bucket:'noaa-goes18', product:'ABI-L2-CMIPM', timeId:'sc-w2-time', posId:'sc-w2-pos' },
  ];
   
  /* Fetch one meso slot: list → pick latest file → parse header */
  function fetchMesoSlot(slot) {
    var parts  = getS3PathParts(0);
    var pparts = getS3PathParts(-1);
  
    /* Build listing URLs for current + previous hour.
        start-after skips M1 files for M2 slots (CMIPM1 < CMIPM2 lexicographically). */
    function makeListUrl(bucket, prefix, startAfterTag) {
      var sa = startAfterTag ? '&start-after=' + prefix + startAfterTag : '';
      return 'https://' + bucket + '.s3.amazonaws.com/?list-type=2&prefix=' + prefix + sa + '&max-keys=20';
    }
    var prefix  = slot.product + '/' + parts.year  + '/' + parts.jday  + '/' + parts.hour  + '/';
    var pprefix = slot.product + '/' + pparts.year + '/' + pparts.jday + '/' + pparts.hour + '/';
    var listUrls = [
      makeListUrl(slot.bucket, prefix,  slot.startAfterTag),
      makeListUrl(slot.bucket, pprefix, slot.startAfterTag),
    ];
  
    // console.log(listUrls)

    function tryList(idx) {
      if (idx >= listUrls.length) {
        setCardStatus(slot, null, null, 'No data');
        return;
      }
      fetch(listUrls[idx])
        .then(function(r) { return r.ok ? r.text() : Promise.reject('HTTP '+r.status); })
        .then(function(xml) {
          // console.log(xml)
          var keys = parseS3Keys(xml);

          // console.log(keys)
          /* Filter to this specific meso sector (M1- or M2- in filename), single channel C01 */
          var slotKeys = keys.filter(function(k){
            return k.indexOf(slot.mesoTag) !== -1 && k.indexOf('C01') !== -1;
          });
          /* Fallback: any file for this meso sector */
          if (!slotKeys.length) {
            slotKeys = keys.filter(function(k){ return k.indexOf(slot.mesoTag) !== -1; });
          }
          // console.log('Slot Keys:',slotKeys)
          var key = slotKeys[slotKeys.length - 1];

          // if (slot.sat === 'west' && slot.meso === 'M2') {
          //   console.log('West M2 raw XML:', xml);
          //   console.log('West M2 keys:', keys);
          //   console.log('West M2 slotKeys after filter:', slotKeys);
          // }

          if (!key) { tryList(idx+1); return; }
  
          /* Parse scan time from filename for card display */
          var t = parseScanTime(key);
          setCardStatus(slot, t, null, 'Reading position…');
  
          /* Fetch NetCDF header for lat/lon */
          fetchNetcdfMeta(key, slot.bucket)
            .then(function(meta) {
              if (!meta) {
                setCardStatus(slot, t, null, 'Position unavailable');
                return;
              }
              setCardStatus(slot, meta.time || t, meta, null);
              updateMesoBox(slot, meta.lat, meta.lon, 'netcdf');
            })
            .catch(function(err) {
              console.warn('NetCDF parse failed for '+key+':', err.message);
              setCardStatus(slot, t, null, 'Parse error');
            });
        })
        .catch(function() { tryList(idx+1); });
    }
  
    tryList(0);
  }
  
  function setCardStatus(slot, time, meta, msg) {
    var timeEl = document.getElementById(slot.timeId);
    var posEl  = document.getElementById(slot.posId);
    if (timeEl) timeEl.textContent = time ? fmtUTC(time) : (msg || '—');
    if (posEl) {
      if (meta) {
        var latStr = meta.lat >= 0 ? meta.lat.toFixed(1)+'°N' : Math.abs(meta.lat).toFixed(1)+'°S';
        var lonStr = meta.lon >= 0 ? meta.lon.toFixed(1)+'°E' : Math.abs(meta.lon).toFixed(1)+'°W';
        posEl.textContent = latStr+' / '+lonStr;
      } else {
        posEl.textContent = msg || '—';
      }
    }
  }
  
  /* Merge a NetCDF-sourced position into mesoBoxes */
  function updateMesoBox(slot, lat, lon, source) {
    /* Don't overwrite a higher-priority ADMNES entry with a NetCDF default */
    var existing = mesoBoxes.filter(function(b) {
      return b.sat === slot.sat && b.meso === slot.meso;
    })[0];
    if (existing && existing.source === 'admnes') return;
  
    mesoBoxes = mesoBoxes.filter(function(b){
      return !(b.sat === slot.sat && b.meso === slot.meso);
    });
  
    var style = MESO_STYLE[slot.sat][slot.meso];
    mesoBoxes.push({
      sat:    slot.sat,
      meso:   slot.meso,
      lat:    lat,
      lon:    lon,
      style:  style,
      source: source,
    });
  
    draw();
    updateTable();
    updateStatusBar();
    renderMesoImagery();
  }
  
  function updateStatusBar() {
    var el = document.getElementById('gv-fetch-status');
    if (!el) return;
    var n = mesoBoxes.length;
    el.textContent = n
      ? n + ' meso position'+(n===1?'':'s')+' loaded from S3/NetCDF · '+new Date().toUTCString().replace(' GMT',' UTC')
      : 'Fetching meso positions…';
  }

  /* ══════════════════════════════════════════════════════════
     ADMNES — NWS administrative bulletins for meso repositioning.
     Fetched from forecast.weather.gov which has CORS open.
     Meso info is in the SUBJECT line, not TOPIC.
     Pages can contain multiple bulletins separated by sequence numbers.
  ══════════════════════════════════════════════════════════ */
  var ADMNES_BASE = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=NES&product=ADM&format=CI&glossary=0&version=';
  var ADMNES_MAX_VERSIONS = 50;
 
  var MESO_STYLE_REF = {
    east: {
      M1: { fill:'rgba(255,190,0,0.18)',  stroke:'#ffbe00', labelFill:'#ffbe00' },
      M2: { fill:'rgba(255,100,0,0.18)',  stroke:'#ff6400', labelFill:'#ff8c00' },
    },
    west: {
      M1: { fill:'rgba(80,180,255,0.18)', stroke:'#50b4ff', labelFill:'#50b4ff' },
      M2: { fill:'rgba(180,100,255,0.18)',stroke:'#b464ff', labelFill:'#b464ff' },
    },
  };
 
  /* Extract individual bulletin blocks from the HTML page.
     Pages can contain multiple bulletins separated by sequence number lines. */
  function extractBulletins(html) {
      var m = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (!m) {
        // fallback: strip all tags and use raw text
        m = [null, html.replace(/<[^>]+>/g, ' ')];
      }
      var raw = m[1].replace(/<[^>]+>/g, '').replace(/\*([^*\n]+)\*/g, '$1');
      return raw.split(/^\s*\d{3,}\s*$/m).filter(function(b) { return b.trim(); });
    }
 
  function formatNwsTime(str) {
    var d = parseNwsDate(str.trim().replace(/\s+/g, ' '));
    if (!d) return str.trim().replace(/\s+/g, ' ');  // fallback to raw if unparseable
    return d.toUTCString().replace(/.*?,\s*/, '').replace(/ GMT$/, ' UTC');
  }

  function parseBulletin(text) {
    var r = {};
    /* Meso info is in the SUBJECT line e.g:
       "SUBJECT: ADMINISTRATIVE: GOES-WEST MDS MESO-2 SCHEDULED..." */
    // console.log('bulletin:',text)
    var tm = text.match(/TOPIC\s*:.*?GOES[- ]*(EAST|WEST).*?(?:MDS\s+)?MESO[- ]?([12])/i);
    if (!tm) return null;
    r.sat  = tm[1].toLowerCase();
    r.meso = 'M' + tm[2];
 
    /* REQUESTED CENTER POINT: 21N/157.8W */
    var cp = text.match(/REQUESTED CENTER POINT\s*:\s*([\d.]+)\s*([NS])\s*[\/,\s]\s*([\d.]+)\s*([EW])/i);
    if (!cp) return null;
    var lat = parseFloat(cp[1]), lon = parseFloat(cp[3]);
    if (cp[2].toUpperCase() === 'S') lat = -lat;
    if (cp[4].toUpperCase() === 'W') lon = -lon;
    r.lat = lat; r.lon = lon;
 
    var issued = text.match(/DATE\/TIME ISSUED\s*:\s*([^\n]+)/i);
    var start  = text.match(/DATE\/TIME (?:OF )?INITIAL IMPACT\s*:\s*([^\n]+)/i);
    var end    = text.match(/DATE\/TIME OF EXPECTED END\s*:\s*([^\n]+)/i);
    r.issued    = issued ? issued[1].trim().replace(/\s+/g, ' ') : '—';
    // r.startTime = start  ? start[1].trim().replace(/\s+/g, ' ')  : '—';
    // r.endTime   = end    ? end[1].trim().replace(/\s+/g, ' ')    : '—';
    r.startTime = start ? formatNwsTime(start[1]) : '—';
    r.endTime   = end   ? formatNwsTime(end[1])   : '—';
    r.startDate = start ? parseNwsDate(start[1].trim().replace(/\s+/g, ' ')) : null;
    r.endDate   = end   ? parseNwsDate(end[1].trim().replace(/\s+/g, ' '))   : null;
 
    var req = text.match(/REQUESTER\s*:\s*([^\n]+)/i);
    r.requester = req ? req[1].trim() : '—';
    var det = text.match(/DETAILS\/SPECIFICS\s*:\s*([^\n]+)/i);
    var pri = text.match(/PRIORITY\s*:\s*([^\n]+)/i);
    r.reason = det ? det[1].trim() : (pri ? pri[1].trim() : '—');
 
    var sm = MESO_STYLE_REF[r.sat];
    r.style  = sm ? (sm[r.meso] || sm.M1) : MESO_STYLE_REF.east.M1;
    r.source = 'admnes';
    return r;
  }
 
  function parseNwsDate(str) {
    if (!str || str === '—' || /TBD/i.test(str)) return null;
    var clean = str
      .replace(/\s+J\/DAY\s+\d+/i, '')   // strip J/DAY 100
      .replace(/\(\d+\)/g, '')            // strip (100)
      .trim();
    // Insert colon into times like "0530Z" → "05:30Z"
    clean = clean.replace(/\b(\d{2})(\d{2})Z\b/i, '$1:$2Z');
    // Replace trailing Z or UTC
    clean = clean.replace(/Z$/i, ' UTC').replace(/\bUTC$/i, 'UTC');
    return new Date(clean);
  }
  
  function isActive(row) {
    if (!row.endDate) return true;
    return row.endDate.getTime() > Date.now();
  }

  function isUpcoming(row) {
    if (!row.startDate || !row.endDate) return false;
    var now = Date.now();
    return row.startDate.getTime() > now && row.endDate.getTime() > now;
  }
 
  function fetchAdmnes() {
    var versions = [];
    for (var i = 1; i <= ADMNES_MAX_VERSIONS; i++) versions.push(i);
 
    Promise.all(versions.map(function(v) {
      return fetch(ADMNES_BASE + v)
        .then(function(r) { return r.ok ? r.text() : null; })
        .then(function(html) { return { v: v, html: html }; })
        .catch(function() { return { v: v, html: null }; });
    }))
    .then(function(results) {
      var admnesRows = [];
      var upcomingRows = [];
      var seenActive = {}, seenUpcoming = {};
      results.forEach(function(res) {
        if (!res.html) return;
        extractBulletins(res.html).forEach(function(text) {
          var row = parseBulletin(text);
          if (!row) return;
          row.admnesVersion = res.v;
          var key = row.sat + '_' + row.meso;
          // Upcoming: starts in the future (and not yet expired)
          if (isUpcoming(row) && !seenUpcoming[key]) {
            seenUpcoming[key] = true;
            upcomingRows.push(row);
          // Active: already started and not yet expired
          } else if (!isUpcoming(row) && isActive(row) && !seenActive[key]) {
            seenActive[key] = true;
            admnesRows.push(row);
          }
        });
      });

      // Sort upcoming by start time ascending
      upcomingRows.sort(function(a, b) {
        return (a.startDate ? a.startDate.getTime() : 0) - (b.startDate ? b.startDate.getTime() : 0);
      });

      console.log('ADMNES active:', admnesRows.length, 'upcoming:', upcomingRows.length);
 
      admnesRows.forEach(function(row) {
        mesoBoxes = mesoBoxes.filter(function(b) {
          return !(b.sat === row.sat && b.meso === row.meso);
        });
        mesoBoxes.push(row);
        var cardMap = { east_M1:'sc-e1-pos', east_M2:'sc-e2-pos', west_M1:'sc-w1-pos', west_M2:'sc-w2-pos' };
        var posEl = document.getElementById(cardMap[row.sat + '_' + row.meso]);
        if (posEl) {
          var latStr = row.lat >= 0 ? row.lat.toFixed(1)+'°N' : Math.abs(row.lat).toFixed(1)+'°S';
          var lonStr = row.lon >= 0 ? row.lon.toFixed(1)+'°E' : Math.abs(row.lon).toFixed(1)+'°W';
          posEl.textContent = latStr + ' / ' + lonStr + ' (ADMNES)';
        }
      });
 
      updateTable();
      updateUpcomingTable(upcomingRows);
      draw();
      updateStatusBar();
      renderMesoImagery();

    })
    .catch(function(err) {
      console.warn('ADMNES fetch error:', err.message);
    });
  }
 
    /*
   * updateTable — renders all 4 meso slots always.
   * source='admnes' rows show full request metadata.
   * source='netcdf' rows are shown as DEFAULT with muted styling.
   * Slots not yet loaded show a Loading placeholder.
   */
  var LINK_STYLE = 'font-family:var(--mono);font-size:0.6rem;color:var(--accent);' +
                   'opacity:0.8;text-decoration:none;letter-spacing:0.03em';
  
  function updateTable() {
    var tbody = document.getElementById('gv-tbody');
    if (!tbody) return;

    var SLOTS = [
      { sat:'east', meso:'M1' },
      { sat:'east', meso:'M2' },
      { sat:'west', meso:'M1' },
      { sat:'west', meso:'M2' },
    ];

    tbody.innerHTML = SLOTS.map(function(slot) {
      var r = null;
      for (var i = 0; i < mesoBoxes.length; i++) {
        if (mesoBoxes[i].sat === slot.sat && mesoBoxes[i].meso === slot.meso) { r = mesoBoxes[i]; break; }
      }

      var satTag = slot.sat === 'east'
        ? '<span class="tag tag-east">EAST</span>'
        : '<span class="tag tag-west">WEST</span>';
      var mc   = slot.sat==='east' ? (slot.meso==='M1'?'tag-m1':'tag-m2') : (slot.meso==='M1'?'tag-m1w':'tag-m2w');
      var mTag = '<span class="tag '+mc+'">'+slot.meso+'</span>';

      if (!r) {
        return '<tr style="opacity:0.45"><td>'+satTag+'</td><td>'+mTag+'</td>'+
          '<td colspan="5" style="color:var(--muted);font-style:italic">Loading…</td></tr>';
      }

      var latS = r.lat >= 0 ? r.lat.toFixed(1)+'N' : Math.abs(r.lat).toFixed(1)+'S';
      var lonS = r.lon >= 0 ? r.lon.toFixed(1)+'E' : Math.abs(r.lon).toFixed(1)+'W';

      /* GeoColor link — always built from the known lat/lon */
      var gcLink = '<a href="' + mesoViewerUrl(r.sat, r.lat, r.lon, r.meso) + '" target="_blank" rel="noopener" ' +
                    'style="' + LINK_STYLE + '" title="View GeoColor animation on NESDIS STAR">GeoColor ↗</a>';

      if (r.source === 'admnes') {
        var admnesUrl = ADMNES_BASE + (r.admnesVersion || 1);
        var admLink = '<a href="'+admnesUrl+'" target="_blank" rel="noopener" ' +
          'style="' + LINK_STYLE + '" title="View NWS Alert Administrative Message">ADM ↗</a>';
        return '<tr><td>'+satTag+'</td><td>'+mTag+'</td><td>'+latS+' / '+lonS+'</td>'+
          '<td>'+r.startTime+'</td><td>'+r.endTime+'</td><td>'+r.requester+'</td>'+
          // '<td>'+r.reason+'&nbsp; '+admLink+'&nbsp; '+gcLink+'</td></tr>';
          '<td>'+r.reason+'&nbsp; '+admLink+'</td></tr>';
      } else {
        return '<tr style="opacity:0.65"><td>'+satTag+'</td><td>'+mTag+'</td><td>'+latS+' / '+lonS+'</td>'+
          '<td colspan="3" style="color:var(--muted)">' +
          '<span class="tag" style="color:var(--muted);border-color:var(--muted);background:transparent">DEFAULT</span>' +
          '&nbsp; No active repositioning request</td></tr>';
      }
    }).join('');
  }
 
  function updateUpcomingTable(rows) {
    var wrap = document.getElementById('gv-upcoming-wrap');
    if (!wrap) return;
    wrap.style.display = rows.length ? '' : 'none';
    var tbody = document.getElementById('gv-upcoming-tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(function(r) {
      var satTag = r.sat === 'east'
        ? '<span class="tag tag-east">EAST</span>'
        : '<span class="tag tag-west">WEST</span>';
      var mc   = r.sat==='east' ? (r.meso==='M1'?'tag-m1':'tag-m2') : (r.meso==='M1'?'tag-m1w':'tag-m2w');
      var mTag = '<span class="tag '+mc+'">'+r.meso+'</span>';
      var latS = r.lat >= 0 ? r.lat.toFixed(1)+'N' : Math.abs(r.lat).toFixed(1)+'S';
      var lonS = r.lon >= 0 ? r.lon.toFixed(1)+'E' : Math.abs(r.lon).toFixed(1)+'W';
      var admnesUrl = ADMNES_BASE + (r.admnesVersion || 1);
      var link = '<a href="'+admnesUrl+'" target="_blank" rel="noopener" '+
        'style="font-family:var(--mono);font-size:0.6rem;color:var(--accent);opacity:0.8;text-decoration:none;letter-spacing:0.03em" '+
        'title="View NWS Alert Administrative Message">ADM ↗</a>';
      return '<tr><td>'+satTag+'</td><td>'+mTag+'</td><td>'+latS+' / '+lonS+'</td>'+
        '<td>'+r.startTime+'</td><td>'+r.endTime+'</td><td>'+r.requester+'</td><td>'+r.reason+' '+link+'</td></tr>';
    }).join('');
  }

   /* ══════════════════════════════════════════════════════════
     MESO IMAGERY PANEL
     2×2 grid of ABI images. The footEl for each card owns both
     the <img> and the label/link bar via innerHTML — no separate
     stage element needed.
  ══════════════════════════════════════════════════════════ */
 
  var MESO_SLOT_ORDER = [
    { sat:'east', meso:'M1', label:'GOES-19 East M1' },
    { sat:'east', meso:'M2', label:'GOES-19 East M2' },
    { sat:'west', meso:'M1', label:'GOES-18 West M1' },
    { sat:'west', meso:'M2', label:'GOES-18 West M2' },
  ];
 
  /** Build the card HTML for a slot (image + label bar all inside footEl). */
  function buildCardHtml(slot, box) {
    var cardId    = 'gv-imgcard-' + slot.sat + '-' + slot.meso;
    var satClass  = slot.sat === 'east' ? 'tag-east' : 'tag-west';
    var mesoClass = slot.sat === 'east'
      ? (slot.meso === 'M1' ? 'tag-m1' : 'tag-m2')
      : (slot.meso === 'M1' ? 'tag-m1w' : 'tag-m2w');
    var posHtml = box
      ? '<span class="gv-img-card-pos" id="' + cardId + '-pos">'
        + (box.lat >= 0 ? box.lat.toFixed(1)+'°N' : Math.abs(box.lat).toFixed(1)+'°S') + ' / '
        + (box.lon >= 0 ? box.lon.toFixed(1)+'°E' : Math.abs(box.lon).toFixed(1)+'°W')
        + '</span>'
      : '<span class="gv-img-card-pos" id="' + cardId + '-pos"></span>';
 
    return '<div id="' + cardId + '" class="gv-img-card">' +
      '<div class="gv-img-card-head">' +
        '<span class="tag ' + satClass + '">' + (slot.sat === 'east' ? 'EAST' : 'WEST') + '</span>' +
        '&nbsp;<span class="tag ' + mesoClass + '">' + slot.meso + '</span>' +
        posHtml +
      '</div>' +
      '<div class="gv-img-card-foot" id="' + cardId + '-foot">' +
        footContent(slot, box) +
      '</div>' +
    '</div>';
  }
 
  /** innerHTML for the foot div: image + label bar, or placeholder. */
  function footContent(slot, box) {
    if (!box) {
      return '<span style="font-family:var(--mono);font-size:0.65rem;color:var(--muted);padding:0.5rem">Waiting for position\u2026</span>';
    }
    var imgUrl    = mesoLowResImgUrl(box.sat, box.meso, activeImgChannel);
    var cacheBust = Math.floor(Date.now() / 120000);
    var chInfo    = IMG_CHANNELS.filter(function(c){ return c.id === activeImgChannel; })[0];
    return '<div style="padding-bottom:0.5rem;"><img src="' + imgUrl + '?t=' + cacheBust + '" style="width:100%;display:block;" alt="' + slot.label + '"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;' +
      'padding:0.35rem 0.75rem;font-family:var(--mono);font-size:0.6rem;color:var(--muted);' +
      'border-top:1px solid var(--border)">' +
      '<span>' + (chInfo ? chInfo.desc : activeImgChannel) + '</span>' +
      '<a href="' + mesoImgUrl(box.sat, box.meso, activeImgChannel) + '" target="_blank" rel="noopener" ' +
      'style="color:var(--accent);text-decoration:none;opacity:0.8;">Open ↗</a>' +
      '</div>';
  }
 
  /** Build/update the imagery section. Rebuilds grid innerHTML each call for simplicity. */
  function renderMesoImagery() {
    var wrap = document.getElementById('gv-imagery-wrap');
    if (!wrap) return;
 
    /* == Channel picker - Pill Button Version (render once) == */
    // if (!document.getElementById('gv-img-channel-picker')) {
    //   var picker = document.createElement('div');
    //   picker.id = 'gv-img-channel-picker';
    //   picker.className = 'gv-img-picker';
    //   IMG_CHANNELS.forEach(function(ch) {
    //     var btn = document.createElement('button');
    //     btn.className = 'gv-img-pill' + (ch.id === activeImgChannel ? ' active' : '');
    //     btn.dataset.channel = ch.id;
    //     btn.title = ch.desc;
    //     btn.textContent = ch.label;
    //     btn.addEventListener('click', function() {
    //       activeImgChannel = ch.id;
    //       document.querySelectorAll('.gv-img-pill').forEach(function(b) {
    //         b.classList.toggle('active', b.dataset.channel === ch.id);
    //       });
    //       refreshImageSrcs();
    //     });
    //     picker.appendChild(btn);
    //   });
    //   /* Insert picker after the table-head div */
    //   var tableHead = wrap.querySelector('.gv-table-head');
    //   if (tableHead && tableHead.nextSibling) {
    //     wrap.insertBefore(picker, tableHead.nextSibling);
    //   } else {
    //     wrap.appendChild(picker);
    //   }
    // }
 
    /* == Channel picker - Toggle Version (render once) == */
    if (!document.getElementById('gv-img-channel-picker')) {
      var picker = document.createElement('div');
      picker.id = 'gv-img-channel-picker';
      picker.className = 'gv-img-picker';

      var label = document.createElement('label');
      label.textContent = 'Channel: ';
      label.style.cssText = 'font-family:var(--mono);font-size:0.68rem;color:var(--muted);letter-spacing:0.04em;';

      var select = document.createElement('select');
      select.id = 'gv-img-channel-select';
      select.style.cssText = 'font-family:var(--mono);font-size:0.68rem;color:var(--text);' +
        'background:var(--surface);border:1.5px solid var(--border);border-radius:6px;' +
        'padding:0.3rem 0.5rem;cursor:pointer;letter-spacing:0.03em;';

      IMG_CHANNELS.forEach(function(ch) {
        var opt = document.createElement('option');
        opt.value = ch.id;
        opt.textContent = ch.label + ' — ' + ch.desc;
        if (ch.id === activeImgChannel) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', function() {
        activeImgChannel = select.value;
        refreshImageSrcs();
      });

      label.appendChild(select);
      picker.appendChild(label);

      var tableHead = wrap.querySelector('.gv-table-head');
      if (tableHead && tableHead.nextSibling) {
        wrap.insertBefore(picker, tableHead.nextSibling);
      } else {
        wrap.appendChild(picker);
      }
    }

    /* == Image grid == */
    var grid = document.getElementById('gv-img-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'gv-img-grid';
      grid.className = 'gv-img-grid';
      wrap.appendChild(grid);
    }
 
    /* Rebuild each card — simple and reliable */
    grid.innerHTML = MESO_SLOT_ORDER.map(function(slot) {
      var box = null;
      for (var i = 0; i < mesoBoxes.length; i++) {
        if (mesoBoxes[i].sat === slot.sat && mesoBoxes[i].meso === slot.meso) { box = mesoBoxes[i]; break; }
      }
      return buildCardHtml(slot, box);
    }).join('');
 
    wrap.style.display = '';
  }
 
  /** Refresh only the foot content on channel switch or 2-min timer. */
  function refreshImageSrcs() {
    MESO_SLOT_ORDER.forEach(function(slot) {
      var box = null;
      for (var i = 0; i < mesoBoxes.length; i++) {
        if (mesoBoxes[i].sat === slot.sat && mesoBoxes[i].meso === slot.meso) { box = mesoBoxes[i]; break; }
      }
      var cardId = 'gv-imgcard-' + slot.sat + '-' + slot.meso;
      var footEl = document.getElementById(cardId + '-foot');
      if (!footEl) return;
      footEl.innerHTML = footContent(slot, box);
    });
  }


  /* Refresh imagery every 1 minutes */
  setInterval(refreshImageSrcs, 1 * 60 * 1000);
  
  /* == Boot == */
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(function(r){ return r.json(); })
    .then(function(topo){
      worldTopo = topo;
    draw();
      /* Fetch all 4 meso slots from NetCDF headers */
      MESO_SLOTS.forEach(fetchMesoSlot);
      /* Also fetch ADMNES for active repositioning requests */
      fetchAdmnes();
      /* Refresh every 2 minutes for NetCDF, 5 minutes for ADMNES */
      setInterval(function(){ MESO_SLOTS.forEach(fetchMesoSlot); }, 2*60*1000);
      setInterval(fetchAdmnes, 5*60*1000);
    })
    .catch(function(err){ console.error('world-atlas load failed:', err); });

  // State/province lines — optional layer, failure is non-fatal
  fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson')
    .then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(geojson){ stateLines = geojson; draw(); })
    .catch(function(err){ console.warn('State lines load failed:', err.message); });

})();