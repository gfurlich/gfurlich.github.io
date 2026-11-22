/* Local weather + forecast from the National Weather Service (the data behind
 * forecast.weather.gov). The NWS exposes it through https://api.weather.gov,
 * which allows cross-origin browser requests and needs no API key.
 * US locations only. */

(function () {
  "use strict";

  const API = "https://api.weather.gov";
  const FALLBACK = { lat: 40.015, lon: -105.2705, name: "Boulder, CO" }; // used if geolocation is denied
  const REFRESH_MS = 15 * 60 * 1000;

  const $ = (id) => document.getElementById(id);
  const headers = { Accept: "application/geo+json" };

  let current = null;     // {lat, lon}
  let refreshTimer = null;

  /* ---------- helpers ---------- */

  async function getJSON(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`NWS request failed (${res.status}) for ${url}`);
    return res.json();
  }

  const cToF = (c) => (c * 9) / 5 + 32;
  const kmhToMph = (k) => k * 0.621371;
  const paToInHg = (p) => p * 0.00029530;
  const mToMi = (m) => m / 1609.344;
  const round = (n) => Math.round(n);

  function setStatus(msg, isError) {
    const el = $("wx-status");
    el.textContent = msg || "";
    el.classList.toggle("wx-error", !!isError);
  }

  function fmtHour(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric" });
  }

  function fmtDateTime(iso) {
    return new Date(iso).toLocaleString([], {
      weekday: "short", hour: "numeric", minute: "2-digit"
    });
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function icon(url, alt) {
    // NWS icon URLs accept a size parameter; request a larger one.
    const img = el("img", "wx-icon");
    img.src = url ? url.replace("size=small", "size=medium") : "";
    img.alt = alt || "";
    img.loading = "lazy";
    img.width = 36;
    img.height = 36;
    return img;
  }

  /* ---------- location ---------- */

  function locate() {
    setStatus("Locating…");
    if (!navigator.geolocation) return load(FALLBACK.lat, FALLBACK.lon, "geolocation unavailable");
    navigator.geolocation.getCurrentPosition(
      (pos) => load(pos.coords.latitude, pos.coords.longitude),
      () => load(FALLBACK.lat, FALLBACK.lon, "location permission denied, showing " + FALLBACK.name),
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }

  /* ---------- main load ---------- */

  async function load(lat, lon, note) {
    lat = Number(lat.toFixed(4));   // the API redirects/rejects >4 decimals
    lon = Number(lon.toFixed(4));
    current = { lat, lon };
    $("wx-lat").value = lat;
    $("wx-lon").value = lon;
    setStatus("Loading forecast…");

    try {
      const point = await getJSON(`${API}/points/${lat},${lon}`);
      const p = point.properties;
      const rel = p.relativeLocation && p.relativeLocation.properties;
      $("wx-place").textContent = rel ? `${rel.city}, ${rel.state}` : "Local Weather";

      // Fire everything that only depends on the point lookup in parallel.
      const [daily, hourly, alerts] = await Promise.all([
        getJSON(p.forecast),
        getJSON(p.forecastHourly),
        getJSON(`${API}/alerts/active?point=${lat},${lon}`).catch(() => null)
      ]);

      renderDaily(daily.properties.periods);
      renderHourly(hourly.properties.periods.slice(0, 24));
      renderAlerts(alerts);
      renderRadar(p.radarStation);
      renderGraph(lat, lon, p);

      // Current conditions come from the nearest station that reports.
      renderCurrent(p.observationStations, hourly.properties.periods[0]).catch(() => {
        $("wx-current").hidden = true;
      });

      const updated = new Date(daily.properties.updateTime || Date.now());
      setStatus(
        `Forecast updated ${updated.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` +
        (note ? ` (${note})` : "")
      );
    } catch (err) {
      console.error(err);
      setStatus(
        "Couldn't load weather. The NWS only covers US locations; check the coordinates and try again.",
        true
      );
    }

    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => current && load(current.lat, current.lon), REFRESH_MS);
  }

  /* ---------- radar + hourly forecast graph ---------- */

  let radarStation = null;

  // NWS "tinfo" code for the graph: <zone letter><Y if DST observed><standard UTC offset>,
  // e.g. MY7 = Mountain, DST observed, UTC-7.
  function tinfo(tz) {
    try {
      const off = (ms) => {
        const str = new Date(ms).toLocaleString("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
        const m = str.match(/GMT([+-]\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      };
      const jan = off(Date.UTC(2026, 0, 1)), jul = off(Date.UTC(2026, 6, 1));
      const std = -Math.min(jan, jul);
      const letter = { 4: "A", 5: "E", 6: "C", 7: "M", 8: "P", 9: "A", 10: "H" }[std];
      return letter ? `${letter}${jan !== jul ? "Y" : "N"}${std}` : "MY7";
    } catch (_) {
      return "MY7";
    }
  }

  function setRadarSrc() {
    if (!radarStation) return;
    // time bucket = cache-buster that changes every 5 minutes
    $("wx-radar").src =
      `https://radar.weather.gov/ridge/standard/${radarStation}_loop.gif?_=${Math.floor(Date.now() / 300000)}`;
  }

  function renderRadar(station) {
    const card = $("wx-radar-card");
    if (!station) { card.hidden = true; radarStation = null; return; }
    radarStation = station;
    $("wx-radar-title").textContent = `Local radar (${station})`;
    $("wx-radar-link").href = `https://radar.weather.gov/station/${station.toLowerCase()}/standard`;
    card.hidden = false;
    setRadarSrc();
  }

  function renderGraph(lat, lon, p) {
    const card = $("wx-graph-card");
    const wfo = p.cwa || p.gridId;
    const zcode = (p.forecastZone || "").split("/").pop();
    if (!wfo || !zcode) { card.hidden = true; return; }

    const url =
      `https://forecast.weather.gov/meteograms/Plotter.php?lat=${lat}&lon=${lon}` +
      `&wfo=${wfo}&zcode=${zcode}&gset=15&gdiff=3&unit=0&tinfo=${tinfo(p.timeZone)}` +
      `&ahour=0&pcmd=11011111111110000000000000000000000000000000000000000000000` +
      `&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6`;

    $("wx-graph").src = url;
    $("wx-graph-link").href =
      `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lon}&unit=0&lg=english&FcstType=graphical`;
    card.hidden = false;
  }

  /* ---------- rendering ---------- */

  async function renderCurrent(stationsUrl, hourNow) {
    const stations = await getJSON(stationsUrl);
    // Try the closest few stations; some report nulls or are offline.
    for (const s of stations.features.slice(0, 4)) {
      const id = s.properties.stationIdentifier;
      let obs;
      try {
        obs = (await getJSON(`${API}/stations/${id}/observations/latest`)).properties;
      } catch (_) { continue; }
      if (obs.temperature.value === null) continue;

      const t = obs.temperature.value;
      $("wx-temp").textContent = `${round(cToF(t))}°F`;
      $("wx-desc").textContent = obs.textDescription || hourNow.shortForecast;

      const ic = $("wx-current-icon");
      ic.src = (obs.icon || hourNow.icon || "").replace("size=small", "size=large");
      ic.alt = obs.textDescription || "";

      $("wx-station").textContent = `${s.properties.name} (${id})`;

      const feels = obs.heatIndex.value ?? obs.windChill.value ?? t;
      $("wx-feels").textContent = `${round(cToF(feels))}°F`;
      $("wx-humidity").textContent =
        obs.relativeHumidity.value !== null ? `${round(obs.relativeHumidity.value)}%` : "n/a";

      const wspd = obs.windSpeed.value;
      const wdir = obs.windDirection.value;
      $("wx-wind").textContent = wspd === null ? "n/a"
        : wspd < 1 ? "Calm"
        : `${compass(wdir)} ${round(kmhToMph(wspd))} mph` +
          (obs.windGust.value ? `, gusts ${round(kmhToMph(obs.windGust.value))}` : "");

      $("wx-pressure").textContent =
        obs.barometricPressure.value !== null
          ? `${paToInHg(obs.barometricPressure.value).toFixed(2)} inHg` : "n/a";
      $("wx-vis").textContent =
        obs.visibility.value !== null ? `${mToMi(obs.visibility.value).toFixed(1)} mi` : "n/a";
      $("wx-time").textContent = fmtDateTime(obs.timestamp);

      $("wx-current").classList.toggle("is-night", hourNow.isDaytime === false);
      $("wx-current").hidden = false;
      return;
    }
    throw new Error("No station returned current conditions");
  }

  function compass(deg) {
    if (deg === null || deg === undefined) return "";
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function renderHourly(periods) {
    const box = $("wx-hourly");
    box.replaceChildren();

    const table = el("table", "wx-htable");
    const head = el("thead");
    const hr = el("tr");
    ["Time", "Temp", "Conditions", "Precip", "Wind", "Humidity"].forEach((t, i) => {
      const th = el("th", i === 5 ? "wx-h-hum" : "", t);
      hr.append(th);
    });
    head.append(hr);
    table.append(head);

    const body = el("tbody");
    let lastDay = null;
    periods.forEach((h, i) => {
      const d = new Date(h.startTime);
      const dayKey = d.toDateString();

      // Date divider whenever the day changes (and for the first row)
      if (dayKey !== lastDay) {
        const sep = el("tr", "wx-h-day");
        const td = el("td", "", d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }));
        td.colSpan = 6;
        sep.append(td);
        body.append(sep);
        lastDay = dayKey;
      }

      const tr = el("tr");
      tr.append(el("td", "wx-h-time", i === 0 ? "Now" : fmtHour(h.startTime)));
      tr.append(el("td", "wx-h-temp", `${h.temperature}°`));
      tr.append(el("td", "wx-h-cond", h.shortForecast));
      const pop = h.probabilityOfPrecipitation && h.probabilityOfPrecipitation.value;
      tr.append(el("td", "wx-h-pop", pop ? `${pop}%` : "–"));
      tr.append(el("td", "wx-h-wind", `${h.windDirection} ${h.windSpeed}`));
      const rh = h.relativeHumidity && h.relativeHumidity.value;
      tr.append(el("td", "wx-h-hum", rh !== null && rh !== undefined ? `${round(rh)}%` : "–"));
      body.append(tr);
    });
    table.append(body);

    const wrap = el("div", "wx-hwrap");
    wrap.append(table);
    box.append(wrap);
  }

  // Merge the alternating day/night periods into one row per day with a
  // high/low range bar scaled to the whole week.
  function renderDaily(periods) {
    const box = $("wx-daily");
    box.replaceChildren();

    const days = [];
    periods.forEach((p) => {
      const last = days[days.length - 1];
      if (p.isDaytime) days.push({ day: p, night: null });
      else if (last && last.day && !last.night) last.night = p;
      else days.push({ day: null, night: p });
    });

    const temps = periods.map((p) => p.temperature);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const span = Math.max(max - min, 1);

    days.forEach((d, i) => {
      const main = d.day || d.night;
      const hi = d.day ? d.day.temperature : null;
      const lo = d.night ? d.night.temperature : null;
      const label = i === 0 ? (d.day ? "Today" : "Tonight")
        : new Date(main.startTime).toLocaleDateString([], { weekday: "short", month: "numeric", day: "numeric" });

      const row = el("details", "wx-day");
      const sum = el("summary", "wx-day-row");
      sum.append(el("span", "wx-day-name", label));
      sum.append(icon(main.icon, main.shortForecast));

      const txt = el("span", "wx-day-text");
      txt.append(el("span", "wx-day-short", main.shortForecast));
      const pops = [d.day, d.night]
        .map((x) => x && x.probabilityOfPrecipitation && x.probabilityOfPrecipitation.value)
        .filter(Boolean);
      if (pops.length) txt.append(el("span", "wx-day-pop", `${Math.max(...pops)}% precip`));
      sum.append(txt);

      sum.append(el("span", "wx-lo", lo !== null ? `${lo}°` : ""));
      const range = el("span", "wx-range");
      const bar = el("span", "wx-range-bar");
      const a = lo !== null ? lo : hi;
      const b = hi !== null ? hi : lo;
      bar.style.left = ((a - min) / span) * 100 + "%";
      bar.style.width = Math.max(((b - a) / span) * 100, 6) + "%";
      range.append(bar);
      sum.append(range);
      sum.append(el("span", "wx-hi", hi !== null ? `${hi}°` : ""));

      row.append(sum);
      row.append(el("p", "wx-day-detail",
        [d.day && d.day.detailedForecast, d.night && d.night.detailedForecast].filter(Boolean).join("\n\n")));
      box.append(row);
    });
  }

  function renderAlerts(data) {
    const box = $("wx-alerts");
    box.replaceChildren();
    const feats = (data && data.features) || [];
    box.hidden = feats.length === 0;
    feats.forEach((f) => {
      const a = f.properties;
      const item = el("details", "wx-alert");
      item.append(el("summary", "", a.event + (a.expires ? ` (until ${fmtDateTime(a.expires)})` : "")));
      item.append(el("p", "", a.headline || ""));
      item.append(el("p", "", a.description || ""));
      box.append(item);
    });
  }

  /* ---------- events ---------- */

  $("wx-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const lat = parseFloat($("wx-lat").value);
    const lon = parseFloat($("wx-lon").value);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return setStatus("Enter a latitude and longitude.", true);
    load(lat, lon);
  });
  $("wx-here").addEventListener("click", locate);

  // show a fallback message if an image fails, hide it again when it loads
  [["wx-radar", "wx-radar-msg"], ["wx-graph", "wx-graph-msg"]].forEach(([img, msg]) => {
    $(img).addEventListener("error", () => { $(img).hidden = true; $(msg).hidden = false; });
    $(img).addEventListener("load", () => { $(img).hidden = false; $(msg).hidden = true; });
  });
  setInterval(setRadarSrc, 5 * 60 * 1000);   // keep the radar loop fresh

  locate();
})();
