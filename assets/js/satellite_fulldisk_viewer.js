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
      detail:    '140.7°E · Asia & Western Pacific · JMA via NOAA/OSPO',
      tags:     ['Visible', '~10 min'],
      url:      'https://www.ospo.noaa.gov/dimg/jma/fd/vis/10.gif',
      cadence:  10,
      credit:   'JMA / NOAA OSPO · Himawari Full Disk Visible',
      note:     'Updates approximately every 10 minutes',
      provider: 'https://www.ospo.noaa.gov/products/imagery/fulldisk.html',
    },
  };

  /* ── DOM refs ─────────────────────────────────────────── */
  var elImg      = document.getElementById('sv-img');
  var elSpin     = document.getElementById('sv-spin');
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

  var current = 'g19';

  /* ── Live UTC clock ───────────────────────────────────── */
  function fmtUTC(d) {
    return (d || new Date()).toUTCString().replace(' GMT', ' UTC');
  }
  setInterval(function () { elUTC.textContent = fmtUTC(); }, 1000);
  elUTC.textContent = fmtUTC();

  /* ── UI helpers ───────────────────────────────────────── */
  function showSpinner() {
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

  /* ══════════════════════════════════════════════════════
     LOADER: plain <img>
  ══════════════════════════════════════════════════════ */
  function loadImg(sat) {
    var cb  = Math.floor(Date.now() / (sat.cadence * 60 * 1000));
    var url = sat.url + '?cb=' + cb;

    hideError();
    elImg.classList.remove('visible');
    showSpinner();

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

    loadImg(sat);
  }

  /* ── Wire all [data-sat] buttons ──────────────────────── */
  document.querySelectorAll('[data-sat]').forEach(function (el) {
    el.addEventListener('click', function () { switchSat(el.dataset.sat); });
  });

  /* ── Init with GOES-18 ────────────────────────────────── */
  var initSat = SATS['g18'];
  setMeta(initSat);
  loadImg(initSat);

})();

