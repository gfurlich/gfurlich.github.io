(function () {
 
  const API  = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/';
  const now  = new Date();
  const end  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    net__gte : now.toISOString(),
    net__lte : end.toISOString(),
    limit    : '50',
    ordering : 'net'
  });
 
  const container = document.getElementById('launch-container');
  const countEl   = document.getElementById('launch-count');
  const timeEl    = document.getElementById('fetch-time');
  const maps      = {};   // mapId → Leaflet instance
 
  /* == Helpers =================================== */
 
  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
 
  function v(val, fallback) {
    const s = String(val ?? '').trim();
    return s === '' || s === 'null' || s === 'undefined' ? (fallback ?? '—') : s;
  }
 
  function fmtDate(iso) {
    if (!iso) return 'TBD';
    return new Date(iso).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  }
 
  function fmtTime(iso, tbd) {
    if (!iso || tbd) return 'NET TBD';
    return new Date(iso).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', timeZoneName:'short' });
  }
 
  function fmtWindow(start, end) {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    if (Math.abs(s - e) < 60000) return null;
    return s.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
      + ' – ' + e.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
  }
 
  function fmtDayKey(iso) {
    if (!iso) return 'TBD';
    return new Date(iso).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  }
 
  function fmtCoords(lat, lon) {
    if (lat == null || lon == null) return null;
    const la = parseFloat(lat), lo = parseFloat(lon);
    if (isNaN(la) || isNaN(lo)) return null;
    return Math.abs(la).toFixed(4)+'°'+(la>=0?'N':'S')+' '+Math.abs(lo).toFixed(4)+'°'+(lo>=0?'E':'W');
  }
 
  function fmtNum(n, unit) {
    if (n == null) return null;
    return Number(n).toLocaleString() + (unit ? '\u202f' + unit : '');
  }
 
  function statusInfo(s) {
    if (!s) return {cls:'tbd', badge:'TBD', bc:'badge--tbd'};
    const map = {
      1: {cls:'go',   badge:'Go for Launch', bc:'badge--go'},
      2: {cls:'tbd',  badge:'TBD',           bc:'badge--tbd'},
      3: {cls:'go',   badge:'Success',        bc:'badge--go'},
      4: {cls:'hold', badge:'Failed',         bc:'badge--hold'},
      5: {cls:'hold', badge:'On Hold',        bc:'badge--hold'},
      6: {cls:'go',   badge:'In Flight',      bc:'badge--go'},
      7: {cls:'tbc',  badge:'TBC',            bc:'badge--tbd'},
      8: {cls:'hold', badge:'Partial Fail',   bc:'badge--hold'},
      9: {cls:'go',   badge:'Payload Deployed', bc:'badge--go'},
    };
    return map[s.id] || {cls:'tbd', badge: v(s.abbrev || s.name, 'TBD'), bc:'badge--tbd'};
  }
 
  function linkLabel(url) {
    try { return new URL(url).hostname.replace('www.',''); }
    catch { return url.slice(0,28)+'…'; }
  }
 
  function dedup(arr) {
    const seen = new Set();
    return arr.filter(x => { const k = x.url; if (seen.has(k)) return false; seen.add(k); return true; });
  }
 
  /* == Card builder =============================== */
 
  function buildCard(l) {
    const sid   = l.id.replace(/-/g,'').slice(0,10);
    const cardId = 'lc-' + sid;
    const mapId  = 'mp-' + sid;
    const st     = statusInfo(l.status);
    const isTbd  = l.tbdtime || l.tbddate;
    const isLive = !!l.webcast_live;
 
    /* rocket */
    const rCfg   = l.rocket?.configuration || {};
    const vName  = v(rCfg.full_name || rCfg.name);
    const vFam   = v(rCfg.families?.[0]?.name || rCfg.family?.name);
    const vVar   = v(rCfg.variant);
 
    /* operator */
    const lsp    = l.launch_service_provider || {};
    const lspN   = v(lsp.name);
    const lspT   = v(lsp.type?.name || lsp.type);
 
    /* pad */
    const pad    = l.pad || {};
    const loc    = pad.location || {};
    const padN   = v(pad.name);
    const locN   = v(loc.name);
    const ctry   = v(loc.country_code || pad.country?.alpha_3_code || pad.country?.alpha_2_code);
    const lat    = pad.latitude  ?? loc.latitude;
    const lon    = pad.longitude ?? loc.longitude;
    const coords = fmtCoords(lat, lon);
    const mapUrl = pad.map_url || (lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : null);
    const padWiki = pad.wiki_url || null;
 
    /* mission */
    const mis    = l.mission || {};
    const mName  = v(mis.name);
    const mType  = v(mis.type);
    const orb    = mis.orbit || {};
    const mOrbit = orb.name ? orb.name + (orb.abbrev ? ' ('+orb.abbrev+')' : '') : '—';
    const mBody  = orb.celestial_body?.name || '—';
    const mDesc  = mis.description || '';
    const mDesig = v(l.launch_designator || mis.launch_designator);
 
    /* timing */
    const date   = fmtDate(l.net);
    const time   = fmtTime(l.net, isTbd);
    const win    = fmtWindow(l.window_start, l.window_end);
    const prec   = l.net_precision?.name;
    const prob   = l.probability;
    const weather = v(l.weather_concerns);
    const hold   = v(l.holdreason);
    const fail   = v(l.failreason);
 
    /* programs */
    const progs  = l.program || [];
 
    /* links — merge launch-level + mission-level, dedup */
    const allVids  = dedup([...(l.vid_urls||[]), ...(mis.vid_urls||[])]);
    const allInfos = dedup([...(l.info_urls||[]), ...(mis.info_urls||[])]);
 
    /* image */
    const imgSrc = l.image?.thumbnail_url || l.image?.image_url || null;
 
    /* stats */
    const orbTotal  = l.orbital_launch_attempt_count;
    const padTotal  = l.pad_launch_attempt_count;
    const agTotal   = l.agency_launch_attempt_count;
    const orbYear   = l.orbital_launch_attempt_count_year;
    const agYear    = l.agency_launch_attempt_count_year;
 
    /* vehicle specs */
    const vThrust = rCfg.to_thrust;
    const vLEO    = rCfg.leo_capacity;
    const vGTO    = rCfg.gto_capacity;
    const vStages = rCfg.max_stage;
 
    /* == HTML == */
 
    const noticeHtml = [
      hold   !== '—' && hold   ? `<div class="lc__notice"><strong>Hold:</strong> ${esc(hold)}</div>`    : '',
      weather!== '—' && weather? `<div class="lc__notice"><strong>Weather:</strong> ${esc(weather)}</div>` : '',
      fail   !== '—' && fail   ? `<div class="lc__notice"><strong>Failure:</strong> ${esc(fail)}</div>` : '',
    ].join('');
 
    const progsHtml = progs.length ? `
      <div class="lc__programs">
        <span class="section-micro">Programs</span>
        ${progs.map(p=>`<span class="prog-tag">${esc(p.name)}</span>`).join('')}
      </div>` : '';
 
    // fields — always show all, '—' if missing
    const fieldsHtml = `
      <div class="lc__fields">
        <div class="lf"><div class="lf__label">Operator</div><div class="lf__value lf__value--hi">${esc(lspN)}</div></div>
        <div class="lf"><div class="lf__label">Provider Type</div><div class="lf__value">${esc(lspT)}</div></div>
        <div class="lf"><div class="lf__label">Launch Vehicle</div><div class="lf__value">${esc(vName)}</div></div>
        <div class="lf"><div class="lf__label">Vehicle Family</div><div class="lf__value">${esc(vFam)}</div></div>
        <div class="lf"><div class="lf__label">Variant</div><div class="lf__value">${esc(vVar)}</div></div>
        <div class="lf"><div class="lf__label">Launch Pad</div><div class="lf__value">${esc(padN)}</div></div>
        <div class="lf"><div class="lf__label">Location</div><div class="lf__value">${esc(locN)}</div></div>
        <div class="lf"><div class="lf__label">Country</div><div class="lf__value">${esc(ctry)}</div></div>
        <div class="lf"><div class="lf__label">Coordinates</div><div class="lf__value">${coords ? esc(coords) : '—'}</div></div>
        <div class="lf"><div class="lf__label">Mission / Payload</div><div class="lf__value lf__value--hi">${esc(mName)}</div></div>
        <div class="lf"><div class="lf__label">Mission Type</div><div class="lf__value">${esc(mType)}</div></div>
        <div class="lf"><div class="lf__label">Target Orbit</div><div class="lf__value">${esc(mOrbit)}</div></div>
        <div class="lf"><div class="lf__label">Celestial Body</div><div class="lf__value">${esc(mBody)}</div></div>
        <div class="lf"><div class="lf__label">Launch Designator</div><div class="lf__value">${esc(mDesig)}</div></div>
        <div class="lf"><div class="lf__label">Status</div><div class="lf__value">${esc(l.status?.name || '—')}</div></div>
        <div class="lf"><div class="lf__label">Probability</div><div class="lf__value">${prob != null ? prob+'%' : '—'}</div></div>
        <div class="lf"><div class="lf__label">Time Precision</div><div class="lf__value">${esc(prec || '—')}</div></div>
        <div class="lf"><div class="lf__label">Webcast Live</div><div class="lf__value">${isLive ? '● Yes' : 'Not yet'}</div></div>
      </div>`;
 
    const descHtml = mDesc ? `<div class="lc__desc"><p>${esc(mDesc)}</p></div>` : '';
 
    const vsItems = [
      vStages != null ? `<div class="vs"><div class="vs__label">Stages</div><div class="vs__value">${esc(vStages)}</div></div>` : '',
      vThrust != null ? `<div class="vs"><div class="vs__label">Liftoff Thrust</div><div class="vs__value">${fmtNum(vThrust)}<span class="vs__unit">kN</span></div></div>` : '',
      vLEO    != null ? `<div class="vs"><div class="vs__label">LEO Capacity</div><div class="vs__value">${fmtNum(vLEO)}<span class="vs__unit">kg</span></div></div>` : '',
      vGTO    != null ? `<div class="vs"><div class="vs__label">GTO Capacity</div><div class="vs__value">${fmtNum(vGTO)}<span class="vs__unit">kg</span></div></div>` : '',
      orbTotal!= null ? `<div class="vs"><div class="vs__label">Orbital Attempts (all-time)</div><div class="vs__value">${fmtNum(orbTotal)}</div></div>` : '',
      orbYear != null ? `<div class="vs"><div class="vs__label">Orbital Attempts (this year)</div><div class="vs__value">${fmtNum(orbYear)}</div></div>` : '',
      padTotal!= null ? `<div class="vs"><div class="vs__label">Launches from this Pad</div><div class="vs__value">${fmtNum(padTotal)}</div></div>` : '',
      agTotal != null ? `<div class="vs"><div class="vs__label">Agency Total Launches</div><div class="vs__value">${fmtNum(agTotal)}</div></div>` : '',
      agYear  != null ? `<div class="vs"><div class="vs__label">Agency Launches (this year)</div><div class="vs__value">${fmtNum(agYear)}</div></div>` : '',
    ].filter(Boolean).join('');
 
    const vstatsHtml = vsItems ? `<div class="lc__vstats">${vsItems}</div>` : '';
 
    const mapHtml = (lat != null && lon != null) ? `
      <div class="lc__map-pane">
        <div class="lc__map" id="${mapId}"></div>
        ${coords ? `<div class="lc__map-coords">${esc(coords)}</div>` : ''}
      </div>` : `
      <div class="lc__map-pane">
        <div class="lc__map-nocoords">No coordinates available</div>
      </div>`;
 
    const streamHtml = allVids.length
      ? allVids.map(u=>`<a class="link-btn link-btn--stream" href="${esc(u.url)}" target="_blank" rel="noopener"><span class="link-dot"></span>${esc(u.title || linkLabel(u.url))}</a>`).join('')
      : `<span class="no-links">No streams listed yet</span>`;
 
    const infoHtml = allInfos.map(u=>`<a class="link-btn link-btn--info" href="${esc(u.url)}" target="_blank" rel="noopener"><span class="link-dot"></span>${esc(u.title || linkLabel(u.url))}</a>`).join('');
 
    const extraLinks = [
      padWiki ? `<a class="link-btn link-btn--info" href="${esc(padWiki)}" target="_blank" rel="noopener"><span class="link-dot"></span>Pad — Wikipedia</a>` : '',
      mapUrl  ? `<a class="link-btn link-btn--map"  href="${esc(mapUrl)}"  target="_blank" rel="noopener"><span class="link-dot"></span>Open in Google Maps</a>` : '',
    ].filter(Boolean).join('');
 
    const linksHtml = `
      <div class="lc__links-pane">
        <div class="section-micro" style="margin-bottom:0.35rem">Livestreams</div>
        ${streamHtml}
        ${infoHtml || extraLinks ? `
          <div class="section-micro" style="margin-top:0.6rem;margin-bottom:0.35rem">Info &amp; Maps</div>
          ${infoHtml}${extraLinks}
        ` : ''}
      </div>`;
 
    const precLabel = prec && prec !== 'Hour' ? ` <span style="color:var(--text-dim);font-size:0.52rem">(±${esc(prec)})</span>` : '';
 
    const imgHtml = imgSrc
      ? `<img class="lc__img" src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="lc__img-placeholder">🚀</div>`;
 
    return `
    <article class="lc lc--${st.cls}" id="${cardId}"
             data-lat="${lat ?? ''}" data-lon="${lon ?? ''}" data-mapid="${mapId}">
      <div class="lc__strip"></div>
 
      <div class="lc__top" onclick="toggleCard('${cardId}')">
        ${imgHtml}
        <div>
          <h2 class="lc__mission">${esc(l.name)}</h2>
          <div class="lc__vehicle-row">
            <span class="lc__vehicle">${esc(vName)}</span>
            ${lspT !== '—' ? `<span class="lc__provider-type">${esc(lspT)}</span>` : ''}
            ${isLive ? `<span class="badge badge--live">● Live Now</span>` : ''}
          </div>
        </div>
        <div class="lc__time-block">
          <div class="lc__date">${date}${precLabel}</div>
          <div class="lc__time">${time}</div>
          ${win  ? `<div class="lc__window-txt">Window: ${esc(win)}</div>` : ''}
          ${prob != null ? `<div class="lc__prob">Prob: ${prob}%</div>` : ''}
          <span class="badge ${st.bc}">${esc(st.badge)}</span>
        </div>
        <span class="lc__chevron">▼</span>
      </div>
 
      <div class="lc__body">
        ${noticeHtml}
        ${progsHtml}
        ${fieldsHtml}
        ${descHtml}
        ${vstatsHtml}
        <div class="lc__lower">
          ${mapHtml}
          ${linksHtml}
        </div>
      </div>
    </article>`;
  }
 
  /* == Map init (lazy, on expand) =============== */
  window.toggleCard = function (cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const opening = !card.classList.contains('expanded');
    card.classList.toggle('expanded');

    const mapId = card.dataset.mapid;
    const lat   = parseFloat(card.dataset.lat);
    const lon   = parseFloat(card.dataset.lon);

    // Closing — nothing to do
    if (!opening) return;

    // Already initialised — just tell Leaflet the size may have changed
    if (maps[mapId]) {
      requestAnimationFrame(() => maps[mapId].invalidateSize());
      return;
    }

    if (isNaN(lat) || isNaN(lon)) return;

    // Wait for the browser to paint display:block before Leaflet measures the container.
    // Two rAF calls ensure we're past the paint, then a short delay covers any CSS transition.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!window.L) return;
          const el = document.getElementById(mapId);
          if (!el) return;
          const map = L.map(mapId, { zoomControl: true, scrollWheelZoom: false })
                       .setView([lat, lon], 9);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
          }).addTo(map);
          const icon = L.divIcon({
            className: '',
            html: '<div class="launch-marker"></div>',
            iconSize: [10, 10], iconAnchor: [5, 5]
          });
          L.marker([lat, lon], { icon }).addTo(map);
          maps[mapId] = map;
          map.invalidateSize();
        }, 50);
      });
    });
  };
 
  /* == Render ==================================== */
  function render(launches) {
    countEl.textContent = launches.length;
    timeEl.textContent  = 'Updated ' + new Date().toLocaleTimeString();
 
    if (!launches.length) {
      container.innerHTML = `<div class="lp__state"><p>No launches found in the next 7 days.</p></div>`;
      return;
    }
 
    const days = new Map();
    for (const l of launches) {
      const k = fmtDayKey(l.net);
      if (!days.has(k)) days.set(k, []);
      days.get(k).push(l);
    }
 
    let html = '';
    for (const [day, group] of days) {
      html += `
        <div class="day-sep">
          <span class="day-sep__label">${esc(day)}</span>
          <div class="day-sep__line"></div>
          <span class="day-sep__count">${group.length} launch${group.length > 1 ? 'es' : ''}</span>
        </div>`;
      for (const l of group) html += buildCard(l);
    }
 
    container.innerHTML = html;
  }
 
  /* == Fetch ===================================== */
  fetch(`${API}?${params}`)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(d => render(d.results || []))
    .catch(err => {
      console.error(err);
      container.innerHTML = `
        <div class="lp__state lp__state--error">
          <p>Failed to load — API rate limit (15 req/hr) may be reached.</p>
          <p style="margin-top:0.5rem">Try again in a few minutes or
            <a href="https://ll.thespacedevs.com/2.3.0/launches/upcoming/"
               target="_blank" style="color:var(--green)">view the raw API →</a></p>
        </div>`;
      countEl.textContent = '!';
    });
})();