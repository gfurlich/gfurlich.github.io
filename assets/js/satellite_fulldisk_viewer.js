(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     SATELLITE DEFINITIONS
  ══════════════════════════════════════════════════════════════ */
  var SATS = {
    g19: {
      type:     'img',
      name:     'GOES-19',
      detail:   '75.2°W · Americas & Atlantic · NOAA/NESDIS',
      tags:     ['GeoColor', '~10 min'],
      url:      'https://cdn.star.nesdis.noaa.gov/GOES19/ABI/FD/GEOCOLOR/1808x1808.jpg',
      cadence:  10,
      credit:   'NOAA / NESDIS · GeoColor composite (CIRA)',
      note:     'Updates approximately every 10 minutes',
      provider: 'https://www.star.nesdis.noaa.gov/goes/fulldisk.php?sat=G19',
    },
    g18: {
      type:     'img',
      name:     'GOES-18',
      detail:   '136.9°W · Pacific & Western US · NOAA/NESDIS',
      tags:     ['GeoColor', '~10 min'],
      url:      'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/FD/GEOCOLOR/1808x1808.jpg',
      cadence:  10,
      credit:   'NOAA / NESDIS · GeoColor composite (CIRA)',
      note:     'Updates approximately every 10 minutes',
      provider: 'https://www.star.nesdis.noaa.gov/goes/fulldisk.php?sat=G18',
    },
    msg: {
      type:     'img',
      name:     'Meteosat-12 (MSG)',
      detail:   '0° · Europe, Africa & Atlantic · EUMETSAT',
      tags:     ['Natural Colour', '~15 min'],
      url:      'https://eumetview.eumetsat.int/static-images/latestImages/EUMETSAT_MSG_RGBNatColourEnhncd_FullResolution.jpg',
      cadence:  15,
      credit:   'EUMETSAT · MSG Natural Colour Enhanced',
      note:     'Updates approximately every 15 minutes (free-tier image)',
      provider: 'https://eumetview.eumetsat.int',
    },
    iodc: {
      type:     'img',
      name:     'Meteosat IODC',
      detail:   '45.5°E · Indian Ocean, Middle East & East Africa · EUMETSAT',
      tags:     ['Natural Colour', '~15 min'],
      url:      'https://eumetview.eumetsat.int/static-images/latestImages/EUMETSAT_MSGIODC_RGBNatColourEnhncd_FullResolution.jpg',
      cadence:  15,
      credit:   'EUMETSAT · MSG IODC Natural Colour Enhanced',
      note:     'Updates approximately every 15 minutes (free-tier image)',
      provider: 'https://eumetview.eumetsat.int',
    },
    h9: {
      type:     'img',
      name:     'Himawari-9',
      detail:   '140.7°E · Asia & Western Pacific · JMA via NOAA/OSPO',
      tags:     ['Visible', '~10 min'],
      url:      'https://www.ospo.noaa.gov/dimg/jma/fd/vis/10.gif',
      cadence:  10,
      credit:   'JMA / NOAA OSPO · Himawari Full Disk Visible',
      note:     'Updates approximately every 10 minutes',
      provider: 'https://www.ospo.noaa.gov/products/imagery/fulldisk.html',
    },
    epic: {
      type:     'epic',
      name:     'DSCOVR EPIC',
      detail:   'L1 Lagrange Point · Full sunlit Earth · NASA GSFC',
      tags:     ['Natural Color', '~2 hr'],
      url:      'https://epic.gsfc.nasa.gov/api/natural',
      cadence:  110,
      credit:   'NASA GSFC · DSCOVR EPIC Natural Color',
      note:     'Most recent image · Updates every ~2 hours',
      provider: 'https://epic.gsfc.nasa.gov',
    },
    // gk2a: {
    //   /*
    //    * GK2A AMI Full Disk — GeoColor composite built in-browser from
    //    * raw NetCDF4 (HDF5) L1B files on the noaa-gk2a-pds S3 bucket.
    //    *
    //    * BANDS USED
    //    * ──────────────────────────────────────────────────────────
    //    *   VI006  0.64 µm  Red      0.5 km  11000×11000  fd005ge
    //    *   VI005  0.51 µm  Green    1.0 km   5500×5500   fd010ge
    //    *   VI004  0.47 µm  Blue     1.0 km   5500×5500   fd010ge
    //    *
    //    * FILE PATH ON S3 (public, no-sign-request)
    //    * ──────────────────────────────────────────────────────────
    //    *   https://noaa-gk2a-pds.s3.amazonaws.com/
    //    *     AMI/L1B/FD/{YYYY}/{MM}/{DD}/{HH}/
    //    *       gk2a_ami_le1b_{band}_fd{res}ge_{YYYYMMDDHHmm}.nc
    //    *
    //    * CALIBRATION (read from per-file global NetCDF4 attributes)
    //    * ──────────────────────────────────────────────────────────
    //    *   radiance    = DN_to_Radiance_Gain * DN + DN_to_Radiance_Offset
    //    *   reflectance = radiance * Radiance_to_Albedo_c   →  [0, 1]
    //    *
    //    * CORS NOTE
    //    * ──────────────────────────────────────────────────────────
    //    *   noaa-gk2a-pds S3 does not send Access-Control-Allow-Origin.
    //    *   Set corsProxy to a URL prefix that adds that header, e.g.:
    //    *     corsProxy: 'https://your-worker.workers.dev/?url='
    //    *   Leave as '' to attempt a direct fetch (works from localhost
    //    *   or if the bucket policy is updated in future).
    //    */
    //   type:       'netcdf',
    //   name:       'GK2A AMI',
    //   detail:     '128.2°E · Asia-Pacific · KMA / NOAA NODD',
    //   tags:       ['GeoColor', '~10 min', 'NetCDF4'],
    //   credit:     'KMA / NOAA NODD · GeoColor from VI006 + VI005 + VI004 L1B',
    //   note:       'Rendered in-browser from raw NetCDF4 via h5wasm',
    //   provider:   'https://registry.opendata.aws/noaa-gk2a-pds/',
    //   bucket:     'https://noaa-gk2a-pds.s3.amazonaws.com',
    //   prefix:     'AMI/L1B/FD',
    //   cadence:    10,
    //   corsProxy:  '',         // set to proxy prefix if needed, e.g. 'https://worker.example.com/?url='
    //   canvasSize: 1100,       // output render resolution in pixels (square)
    //   gamma:      1.7,        // display gamma — increase to brighten
    //   bands: {
    //     R: { name: 'vi006', res: '005', nativePx: 11000 },
    //     G: { name: 'vi005', res: '010', nativePx:  5500 },
    //     B: { name: 'vi004', res: '010', nativePx:  5500 },
    //   },
    // },
  };

  /* ── DOM refs ─────────────────────────────────────────── */
  var elImg      = document.getElementById('sv-img');
  var elCanvas   = document.getElementById('sv-canvas');   // reused for GK2A paint
  var elSpin     = document.getElementById('sv-spin');
  var elSpinLbl  = document.getElementById('sv-spin-label');
  var elTileBar  = document.getElementById('sv-tile-bar');
  var elTileFill = document.getElementById('sv-tile-fill');
  var elErr      = document.getElementById('sv-err');
  var elErrMsg   = document.getElementById('sv-err-msg');
  var elName     = document.getElementById('sv-name');
  var elDetail   = document.getElementById('sv-detail');
  var elTags     = document.getElementById('sv-tags');
  var elCredit   = document.getElementById('sv-credit');
  var elNote     = document.getElementById('sv-note');
  var elSrcLink  = document.getElementById('sv-src-link');
  var elPrvLink  = document.getElementById('sv-provider-link');
  var elLoaded   = document.getElementById('sv-loaded');
  var elUTC      = document.getElementById('sv-utc');

  var current = 'g18';

  /* ── Live UTC clock ───────────────────────────────────── */
  function fmtUTC(d) {
    return (d || new Date()).toUTCString().replace(' GMT', ' UTC');
  }
  setInterval(function () { elUTC.textContent = fmtUTC(); }, 1000);
  elUTC.textContent = fmtUTC();

  /* ── UI helpers ───────────────────────────────────────── */

  /* label: spinner text; showBar: show the progress bar */
  function showSpinner(label, showBar) {
    if (elSpinLbl)  elSpinLbl.textContent = label || 'Loading…';
    if (elTileBar)  elTileBar.classList.toggle('visible', !!showBar);
    if (elTileFill) elTileFill.style.width = '0%';
    elSpin.classList.remove('hidden');
  }
  function hideSpinner() { elSpin.classList.add('hidden'); }

  function showError(msg) {
    hideSpinner();
    elErrMsg.textContent = msg;
    elErr.classList.add('visible');
  }
  function hideError() { elErr.classList.remove('visible'); }

  function setMeta(sat) {
    elName.textContent   = sat.name;
    elDetail.innerHTML   = sat.detail;
    elCredit.textContent = sat.credit;
    elNote.textContent   = sat.note;
    elPrvLink.href       = sat.provider;
    elSrcLink.href       = sat.url || sat.provider;
    elSrcLink.textContent = 'Source ↗';
    elTags.innerHTML = sat.tags.map(function (t) {
      return '<span class="sv-tag">' + t + '</span>';
    }).join('');
  }

  function stampLoaded() {
    elLoaded.textContent = 'Last loaded: ' + fmtUTC();
  }

  /* Toggle which display layer is shown (img vs canvas) */
  function showLayer(which) {
    elImg.classList.toggle('visible',    which === 'img');
    if (elCanvas) elCanvas.classList.toggle('visible', which === 'canvas');
  }

  /* ══════════════════════════════════════════════════════
     LOADER: plain <img>  (GOES + Meteosat + Himawari GIF)
  ══════════════════════════════════════════════════════ */
  function loadImg(sat) {
    var cb  = Math.floor(Date.now() / (sat.cadence * 60 * 1000));
    var url = sat.url + '?cb=' + cb;

    hideError();
    showLayer('img');
    elImg.classList.remove('visible');
    showSpinner('Loading…', false);

    var tmp = new Image();
    tmp.onload = function () {
      elImg.src = url;
      elImg.alt = sat.name + ' full disk';
      requestAnimationFrame(function () {
        elImg.classList.add('visible');
        hideSpinner();
        stampLoaded();
      });
    };
    tmp.onerror = function () {
      showError('Could not load ' + sat.name + '. CDN may be temporarily unavailable.');
    };
    tmp.src = url;
  }

  /* ══════════════════════════════════════════════════════
     LOADER: GK2A NetCDF4 GeoColor  (h5wasm, in-browser)
  ══════════════════════════════════════════════════════ */

  // /* h5wasm CDN script is injected once; Promise cached for subsequent calls. */
  // var h5wasmPromise = null;

  // function loadH5wasm() {
  //   if (h5wasmPromise) return h5wasmPromise;
  //   h5wasmPromise = new Promise(function (resolve, reject) {
  //     var s   = document.createElement('script');
  //     s.src   = 'https://cdn.jsdelivr.net/npm/h5wasm@0.7.7/dist/iife/h5wasm.js';
  //     s.onload  = function () {
  //       h5wasm.ready.then(function () { resolve(h5wasm); }).catch(reject);
  //     };
  //     s.onerror = function () {
  //       reject(new Error('Failed to load h5wasm from CDN'));
  //     };
  //     document.head.appendChild(s);
  //   });
  //   return h5wasmPromise;
  // }

  // /* ── Timestamp helpers ── */
  // function pad2(n) { return String(n).padStart(2, '0'); }

  // function roundDown10min(d) {
  //   return new Date(Date.UTC(
  //     d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
  //     d.getUTCHours(), Math.floor(d.getUTCMinutes() / 10) * 10, 0, 0
  //   ));
  // }

  // function toStamp(d) {
  //   return '' + d.getUTCFullYear() +
  //     pad2(d.getUTCMonth() + 1) +
  //     pad2(d.getUTCDate()) +
  //     pad2(d.getUTCHours()) +
  //     pad2(d.getUTCMinutes());
  // }

  // /* Returns the last n scan-time stamps, newest first */
  // function recentStamps(n) {
  //   var base = roundDown10min(new Date());
  //   var out  = [];
  //   for (var i = 0; i < n; i++) {
  //     out.push(toStamp(new Date(base.getTime() - i * 10 * 60 * 1000)));
  //   }
  //   return out;
  // }

  // /* Build the full S3 (or proxied) URL for one band + timestamp */
  // function gk2aUrl(sat, band, stamp) {
  //   var fname = 'gk2a_ami_le1b_' + band.name +
  //               '_fd' + band.res + 'ge_' + stamp + '.nc';
  //   // var raw = sat.bucket + '/' + sat.prefix +
  //   //           '/' + stamp.slice(0,4) +
  //   //           '/' + stamp.slice(4,6) +
  //   //           '/' + stamp.slice(6,8) +
  //   //           '/' + stamp.slice(8,10) +
  //   //           '/' + fname;
  //   var raw = sat.bucket + '/' + sat.prefix +
  //             '/' + stamp.slice(0,6) +
  //             // stamp.slice(4,6) +
  //             '/' + stamp.slice(6,8) +
  //             '/' + stamp.slice(8,10) +
  //             '/' + fname;
  //   console.log(raw)
  //   return sat.corsProxy ? sat.corsProxy + encodeURIComponent(raw) : raw;
  // }

  // /* HEAD-poll the stamp list to find the most recent file that exists */
  // function findLatestStamp(sat, stamps) {
  //   var i = 0;
  //   function next() {
  //     if (i >= stamps.length) {
  //       return Promise.reject(new Error(
  //         'No GK2A files found for the last ' + (stamps.length * 10) + ' minutes.'
  //       ));
  //     }
  //     var stamp = stamps[i++];
  //     return fetch(gk2aUrl(sat, sat.bands.R, stamp), { method: 'HEAD' })
  //       .then(function (r) { return r.ok ? stamp : next(); })
  //       .catch(function ()  { return next(); });
  //   }
  //   return next();
  // }

  // /* Fetch one NetCDF4 file as ArrayBuffer */
  // function fetchNC(url) {
  //   return fetch(url).then(function (r) {
  //     if (!r.ok) throw new Error('HTTP ' + r.status + ' fetching ' + url);
  //     return r.arrayBuffer();
  //   });
  // }

  // /*
  //  * Open one NetCDF4 buffer with h5wasm, read image_pixel_values and
  //  * calibration attributes, then close + unlink the temp FS file.
  //  * Returns { raw, gain, offset, alb_c, cols, lines, vmin, vmax }
  //  */
  // function parseNC(h5, buf, tmpName) {
  //   h5.FS.writeFile(tmpName, new Uint8Array(buf));
  //   var f   = new h5.File(tmpName, 'r');
  //   var ds  = f.get('image_pixel_values');
  //   var raw = ds.value;   /* Uint16Array */

  //   function attr(name) {
  //     try { return f.attrs[name] ? f.attrs[name].value : null; } catch (e) { return null; }
  //   }

  //   var gain   = attr('DN_to_Radiance_Gain');
  //   var offset = attr('DN_to_Radiance_Offset');
  //   var alb_c  = attr('Radiance_to_Albedo_c');
  //   var cols   = attr('number_of_columns') || Math.round(Math.sqrt(raw.length));
  //   var lines  = attr('number_of_lines')   || Math.round(Math.sqrt(raw.length));
  //   var vmin   = attr('valid_min') != null  ? attr('valid_min') : 0;
  //   var vmax   = attr('valid_max') != null  ? attr('valid_max') : 65534;

  //   f.close();
  //   try { h5.FS.unlink(tmpName); } catch (e) { /* ignore */ }

  //   return { raw: raw, gain: gain, offset: offset, alb_c: alb_c,
  //            cols: cols, lines: lines, vmin: vmin, vmax: vmax };
  // }

  // /* Convert packed DN integers → reflectance [0, 1] */
  // function dnToRefl(b) {
  //   var n      = b.raw.length;
  //   var out    = new Float32Array(n);
  //   var gain   = b.gain;
  //   var offset = b.offset;
  //   var alb_c  = b.alb_c;
  //   var vmin   = b.vmin;
  //   var vmax   = b.vmax;
  //   for (var i = 0; i < n; i++) {
  //     var dn = b.raw[i];
  //     if (dn < vmin || dn > vmax) { out[i] = 0; continue; }
  //     var refl = (gain * dn + offset) * alb_c;
  //     out[i]   = refl < 0 ? 0 : refl > 1 ? 1 : refl;
  //   }
  //   return out;
  // }

  // /* Box-average downsample from srcW×srcH → dstW×dstH */
  // function downsample(src, srcW, srcH, dstW, dstH) {
  //   var dst = new Float32Array(dstW * dstH);
  //   var xr  = srcW / dstW;
  //   var yr  = srcH / dstH;
  //   for (var j = 0; j < dstH; j++) {
  //     var sy0 = Math.floor(j * yr);
  //     var sy1 = Math.min(Math.ceil((j + 1) * yr), srcH);
  //     for (var i = 0; i < dstW; i++) {
  //       var sx0 = Math.floor(i * xr);
  //       var sx1 = Math.min(Math.ceil((i + 1) * xr), srcW);
  //       var sum = 0, cnt = 0;
  //       for (var sy = sy0; sy < sy1; sy++) {
  //         var base = sy * srcW;
  //         for (var sx = sx0; sx < sx1; sx++) { sum += src[base + sx]; cnt++; }
  //       }
  //       dst[j * dstW + i] = cnt > 0 ? sum / cnt : 0;
  //     }
  //   }
  //   return dst;
  // }

  // /* Write gamma-corrected R/G/B Float32 arrays to elCanvas */
  // function paintGeoColor(R, G, B, size, gamma) {
  //   elCanvas.width  = size;
  //   elCanvas.height = size;
  //   var ctx     = elCanvas.getContext('2d');
  //   var imgData = ctx.createImageData(size, size);
  //   var data    = imgData.data;
  //   var inv     = 1 / gamma;
  //   var n       = size * size;
  //   for (var i = 0; i < n; i++) {
  //     data[i * 4]     = Math.round(Math.pow(R[i], inv) * 255);
  //     data[i * 4 + 1] = Math.round(Math.pow(G[i], inv) * 255);
  //     data[i * 4 + 2] = Math.round(Math.pow(B[i], inv) * 255);
  //     data[i * 4 + 3] = 255;
  //   }
  //   ctx.putImageData(imgData, 0, 0);
  // }

  /* Main GK2A loader — called by switchSat() */
  // function loadGK2A(sat) {
  //   hideError();
  //   showLayer('canvas');
  //   if (elCanvas) elCanvas.classList.remove('visible');
  //   showSpinner('Loading h5wasm…', false);

  //   var SZ = sat.canvasSize;

  //   loadH5wasm()
  //     .then(function (h5) {
  //       if (elSpinLbl) elSpinLbl.textContent = 'Finding latest scan…';
  //       return Promise.all([h5, findLatestStamp(sat, recentStamps(6))]);
  //     })
  //     .then(function (args) {
  //       var h5    = args[0];
  //       var stamp = args[1];

  //       /* Show actual image time in the footer */
  //       elNote.textContent =
  //         'Image time: ' +
  //         stamp.slice(0,4) + '-' + stamp.slice(4,6) + '-' + stamp.slice(6,8) +
  //         ' ' + stamp.slice(8,10) + ':' + stamp.slice(10,12) +
  //         ' UTC · Updates every 10 minutes';

  //       /* Fetch bands sequentially to keep peak RAM manageable */
  //       if (elSpinLbl)  elSpinLbl.textContent = 'Fetching VI006 (red 0.5 km)…';
  //       if (elTileBar)  elTileBar.classList.add('visible');
  //       if (elTileFill) elTileFill.style.width = '10%';

  //       return fetchNC(gk2aUrl(sat, sat.bands.R, stamp))
  //         .then(function (bufR) {
  //           if (elSpinLbl)  elSpinLbl.textContent = 'Fetching VI005 (green 1 km)…';
  //           if (elTileFill) elTileFill.style.width = '30%';
  //           return Promise.all([bufR, fetchNC(gk2aUrl(sat, sat.bands.G, stamp))]);
  //         })
  //         .then(function (res) {
  //           if (elSpinLbl)  elSpinLbl.textContent = 'Fetching VI004 (blue 1 km)…';
  //           if (elTileFill) elTileFill.style.width = '50%';
  //           return Promise.all([res[0], res[1], fetchNC(gk2aUrl(sat, sat.bands.B, stamp))]);
  //         })
  //         .then(function (bufs) {
  //           if (elSpinLbl)  elSpinLbl.textContent = 'Decoding NetCDF4…';
  //           if (elTileFill) elTileFill.style.width = '65%';

  //           var dR = parseNC(h5, bufs[0], '/gk2a_r.nc');
  //           var dG = parseNC(h5, bufs[1], '/gk2a_g.nc');
  //           var dB = parseNC(h5, bufs[2], '/gk2a_b.nc');

  //           if (elSpinLbl)  elSpinLbl.textContent = 'Computing reflectance…';
  //           if (elTileFill) elTileFill.style.width = '78%';

  //           var reflR = dnToRefl(dR);
  //           var reflG = dnToRefl(dG);
  //           var reflB = dnToRefl(dB);

  //           if (elSpinLbl)  elSpinLbl.textContent = 'Resampling to ' + SZ + '\u00d7' + SZ + '\u2026';
  //           if (elTileFill) elTileFill.style.width = '88%';

  //           var R = downsample(reflR, dR.cols, dR.lines, SZ, SZ);
  //           var G = downsample(reflG, dG.cols, dG.lines, SZ, SZ);
  //           var B = downsample(reflB, dB.cols, dB.lines, SZ, SZ);

  //           if (elSpinLbl)  elSpinLbl.textContent = 'Compositing GeoColor…';
  //           if (elTileFill) elTileFill.style.width = '96%';

  //           paintGeoColor(R, G, B, SZ, sat.gamma);

  //           requestAnimationFrame(function () {
  //             showLayer('canvas');
  //             if (elCanvas) elCanvas.classList.add('visible');
  //             hideSpinner();
  //             stampLoaded();
  //           });
  //         });
  //     })
  //     .catch(function (err) {
  //       var msg = err.message || String(err);
  //       /* Translate opaque network failures into something actionable */
  //       if (/fetch|network|failed to fetch/i.test(msg) && !sat.corsProxy) {
  //         msg = 'CORS blocked — noaa-gk2a-pds S3 does not send ' +
  //               'Access-Control-Allow-Origin. Set corsProxy in the gk2a ' +
  //               'sat definition, or serve a pre-rendered image instead.';
  //       }
  //       showError(msg);
  //     });
  // }


  /* ══════════════════════════════════════════════════════
     LOADER: DSCOVR EPIC  (NASA GSFC API → archive image)
  ══════════════════════════════════════════════════════ */
  function loadEPIC(sat) {
    hideError();
    showLayer('img');
    elImg.classList.remove('visible');
    showSpinner('Fetching EPIC metadata…', false);
 
    fetch(sat.url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' from EPIC API');
        return r.json();
      })
      .then(function (images) {
        if (!images || images.length === 0) {
          throw new Error('No EPIC images returned by API.');
        }
 
        /* Pick the most recent (first) image */
        var img   = images[0];
        var name  = img.image;          // e.g. "epic_1b_20250409000428"
        var date  = img.date;           // e.g. "2025-04-09 00:04:28"
        var parts = date.split(/[- :]/);
        var yyyy  = parts[0];
        var mm    = parts[1];
        var dd    = parts[2];
 
        /* Build archive URL (use jpg for faster load) */
        var url = 'https://epic.gsfc.nasa.gov/archive/natural/' +
                  yyyy + '/' + mm + '/' + dd + '/jpg/' + name + '.jpg';
 
        /* Update footer note with actual image time */
        elNote.textContent = 'Image time: ' + yyyy + '-' + mm + '-' + dd +
                             ' ' + parts[3] + ':' + parts[4] + ' UTC · Updates ~every 2 hours';
        elSrcLink.href = url;
 
        if (elSpinLbl) elSpinLbl.textContent = 'Loading image…';
 
        var tmp = new Image();
        tmp.onload = function () {
          elImg.src = url;
          elImg.alt = sat.name + ' full disk – ' + date + ' UTC';
          requestAnimationFrame(function () {
            elImg.classList.add('visible');
            hideSpinner();
            stampLoaded();
          });
        };
        tmp.onerror = function () {
          showError('Could not load EPIC image from NASA archive. Try again shortly.');
        };
        tmp.src = url;
      })
      .catch(function (err) {
        showError(err.message || 'EPIC API error.');
      });
  }

  /* ══════════════════════════════════════════════════════
     SWITCH SATELLITE
  ══════════════════════════════════════════════════════ */
  function switchSat(key) {
    if (key === current) return;
    current = key;

    document.querySelectorAll('[data-sat]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.sat === key);
    });

    var sat = SATS[key];
    if (!sat) return;

    setMeta(sat);
    // loadImg(sat);

    if (sat.type === 'epic') {
      loadEPIC(sat);
    } else {
      loadImg(sat);
    }

    // if (sat.type === 'netcdf') {
    //   loadGK2A(sat);
    // } else {
    //   loadImg(sat);
    // }
  }

  /* ── Wire all [data-sat] buttons ──────────────────────── */
  document.querySelectorAll('[data-sat]').forEach(function (el) {
    el.addEventListener('click', function () { switchSat(el.dataset.sat); });
  });

  /* ── Init ─────────────────────────────────────────────── */
  var INIT_KEY = 'g18';
  current = INIT_KEY;
  document.querySelectorAll('[data-sat]').forEach(function (el) {
    el.classList.toggle('active', el.dataset.sat === INIT_KEY);
  });
  var initSat = SATS[INIT_KEY];
  setMeta(initSat);
  loadImg(initSat);

})();
