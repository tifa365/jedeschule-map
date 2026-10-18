# Jede Schule – Karte

A Germany-wide marker map of the schools collected by
[jedeschule.codefor.de](https://jedeschule.codefor.de) (repo:
`/home/tim/Projekte/jedeschule-scraper`). It is built on
[Masterportal](https://www.masterportal.org) 3.7.0. The portal itself was taken from
the Berlin Gärtnert portal (`/home/tim/Projekte/berlingaertnert_senmvku_masterportal`)
and stripped of everything Berlin-specific.

- One layer, "Schulen". Each school is drawn as a 🏫 icon. Nearby schools are grouped
  into circles that show how many schools they contain (`clusterDistance` in
  `services.json`).
- Click a school to see its name, type, operator, address and contact details.
- The search box finds schools by name in the loaded data, and addresses via Photon
  (OSM, limited to Germany).
- The filter narrows the map by state (Bundesland), school type (Schulart) and legal
  status (Trägerschaft).
- Background map: basemap.de raster WMS by default; the basemap.de vector tiles (day and
  night styles) can be switched on in the layer tree.
- No measuring or coordinate tools. The secondary menu (right side) only holds the
  school details opened by clicking the map, so its toggle button is hidden in
  `index.html`.
- Layout follows the Berlin gärtnert portal: wordmark logo (`resources/img/logo.svg`,
  the 🏫 icon plus text), menu split into tools, share and project sections, About
  page with picture and a "how to use" part, no opacity slider in the layer tree.

## Quickstart

```sh
make data      # download latest.csv (~43 MB) → portal/resources/data/schulen.geojson
make serve     # http://localhost:8080/
```

`make data` also merges the Niedersachsen coordinates from `cache/niedersachsen.json`
if that file exists, and updates the numbers in the About text.

The portal must be served over HTTP, because Masterportal loads its config files with
`fetch`. Opening `index.html` directly from disk does not work.

## Layout

| Path | What |
|---|---|
| `scripts/build_data.py` | Turns the CSV into GeoJSON (standard library only). Writes `schulen.geojson` (git-ignored, ~14 MB) and `schulen.meta.json` (counts per state, data date), and updates the About text |
| `scripts/patch_mastercode.py` | Applies the filter performance patch to the Masterportal bundle (see below) |
| `portal/config.json` | Masterportal portal config: map view and zoom levels, search, filter, about text, layer tree |
| `portal/config.js` | Paths to the layer, REST and style configs. `portalLanguage.enabled` must stay `true`: with `false`, Masterportal 3.7 hangs at start-up |
| `portal/resources/services.json` | Layer definitions: basemaps and the `schulen` GeoJSON layer |
| `portal/resources/style_v3.json` | Style for single schools (icon) and clusters |
| `portal/resources/img/schule.svg` | 🏫 from Noto Color Emoji |
| `portal/mastercode/3_7_0/` | Pre-built Masterportal, with two patches (see below) |

## Data

- **Source:** `https://jedeschule.codefor.de/csv-data/latest.csv`, a nationwide file
  refreshed weekly.
- **Kept fields:** id, name, school type, legal status, operator, address, postcode,
  town, state, phone, email and website. The columns `raw`, `location`, `fax`,
  `director` and `update_timestamp` are dropped.
- **Dropped schools:** those without coordinates, and those outside a box around
  Germany (`DE_BBOX`).
- **Feature ids:** every feature gets a top-level `id` (the jedeschule id). This is
  required, not cosmetic. Without it, Masterportal assigns ids one by one after loading,
  each assignment re-clusters all 30k points, and the page freezes. The build stops if
  any id is empty or duplicated.
- **Coverage guard:** the build compares itself with the previous
  `schulen.meta.json`. If more than 2 % of mapped schools, or more than 10 % of one
  state's mapped schools, disappear, it stops without writing anything and names the
  affected states. Typical cause: a build without the Niedersachsen file. Pass
  `--allow-drop` to accept a real drop.
- **Safe publishing:**
  - The GeoJSON, the meta file and `config.json` are each written to a uniquely named
    temporary file in the target directory and validated first. Only when all three
    are ready are they moved into place, so any failure during download, parsing,
    validation or writing publishes nothing.
  - The final step is not transactional: the three files are renamed one after the
    other (`os.replace`, atomic per file). If the process dies between two renames,
    for example on a crash or power loss, the already renamed files stay and the
    rest keep the old version. Running the build again fixes that.
  - The download goes to a temporary `.part` file the same way.
  - A lock (`cache/.build.lock`) stops a second build from running at the same time.
- **Alternate outputs:** with `--out` pointing somewhere else, the live About text is
  only updated if `--config` is given explicitly.

### Missing coordinates

In the CSV from 2026-10-17, 6,354 of 34,136 schools have no usable coordinates.
With the Niedersachsen crawl below merged in, 30,861 schools are on the map and 3,275 are missing:

- Niedersachsen: 63 (all 3,142 without the crawl)
- SH 1,012, ST 927, BW 534, SL 357, HE 239, TH 110
- a handful in the other states

`schulen.meta.json` holds the current numbers per state.

### Niedersachsen coordinates (temporary)

PR #226 (branch `feature/niedersachsen-geodata`) makes the Niedersachsen spider fetch
coordinates from NiBiS. Until it is merged and the published CSV includes them, add
them by crawling Niedersachsen from that branch:

```sh
cd /home/tim/Projekte/jedeschule-scraper
git worktree add /tmp/jedeschule-ni feature/niedersachsen-geodata
cd /tmp/jedeschule-ni && uv sync --locked
ENVIRONMENT=TEST uv run scrapy crawl niedersachsen -O /tmp/niedersachsen.json   # no DB needed
cd /home/tim/Projekte/jedeschule-map && make data-ni NI=/tmp/niedersachsen.json
git -C /home/tim/Projekte/jedeschule-scraper worktree remove /tmp/jedeschule-ni
```

Records are matched by ID (`NI-<schulnr>`). The crawl from 2026-10-18 returned 3,092
schools, 3,079 with coordinates, and is kept in `cache/niedersachsen.json`
(git-ignored). `make data` uses that file automatically, so a rebuild needs no new
crawl. Copy a fresh crawl to the same path to update it.

### About text

The "Über diese Karte" text in `portal/config.json` contains two marker spans,
`<span data-stats>` (data date and counts) and `<span data-missing>` (states with more
than 100 schools missing). `build_data.py` fills both from the new meta data on every
build. Edit the text around the spans freely, but keep the spans.

## Patched Masterportal

`portal/mastercode/3_7_0/js/masterportal.js` contains two patches, applied by
`make patch` (`scripts/patch_mastercode.py`). Both are about filter performance with
30k clustered points.

1. **show-features** (`showFeaturesByIds`):
   - Originally, every matching feature was changed while attached to the source.
     Each change made the OpenLayers cluster source re-cluster all 30k points, so
     choosing "Bayern" froze the page.
   - Now the cluster is unhooked from its source, all features are updated in place,
     and it is re-hooked and re-clusters once. The re-hook runs in a `finally`
     block, so a style function that throws cannot leave the cluster detached (the
     map would otherwise stop reacting to the filter).
2. **apply-once** (`addItemsToLayer` and its caller):
   - The filter matches features in pages and used to apply the accumulated result to
     the map after every page.
   - Now it collects ids on every page (so the hit counter still updates) but applies
     them to the map only on the last page.
   - Matching still runs in chunks of `"paging": 10000`, which keeps each blocking
     step short.

Measured headless with all 30,861 schools (3 runs each):

| | Select NRW | Reset all | Longest blocking task |
|---|---:|---:|---:|
| before (show-features v1, paging 10000) | 13.4 s | 17.6 s | – |
| now | 3.1–3.4 s | 5.1–6.6 s | 1.6 s / 0.85 s |

A single page (`"paging": 100000`) was no faster overall and blocked the page for
3–6 s at a time, so 10000 stays.

The script is idempotent: it skips applied patches and upgrades the earlier
show-features variants (v1, v2). If you replace `mastercode/`, run `make patch` again. If it
reports that a patch site was not found, the Masterportal version changed, nothing is
written, and the patches have to be redone by hand.

## Testing

`make smoke` (`scripts/smoke_test.mjs`, Node 22+ and Chrome) loads the portal in
headless Chrome and waits until the `schulen` layer holds the number of features from
`schulen.meta.json`. It prints the time to ready per run and exits non-zero if a run
is not ready within `SMOKE_TIMEOUT` (default 60 s). A timeout is reported as such, so
slow loading and broken loading are distinguishable.

```sh
make serve &
make smoke RUNS=3                       # against http://127.0.0.1:8080/
node scripts/smoke_test.mjs http://127.0.0.1:8080/ 5
```

### Intermittent start-up failure in headless Chrome

While testing, roughly a quarter of headless loads never showed any schools. Findings
(Google Chrome 149.0.7827.196 on Linux, 2026-10-18):

- In a failing load, Chrome cancels every request in flight at one instant, a few
  seconds after the page's `load` event (`net::ERR_ABORTED`, `canceled: true`). Which
  requests die depends on timing: `config.js` (then the page stays blank),
  `config.json`, or `schulen.geojson` (then the map shows no schools). The server never
  receives the cancelled requests, and it makes no difference whether Python's
  `http.server` or a node server serves the files.
- The page does not navigate or reload, and nothing in Masterportal calls
  `XMLHttpRequest.abort()` or `window.stop()` at that time (checked with hooks on
  both). Running Chrome's network service in-process changes nothing.
- With `--disable-extensions`, 13 of 13 loads succeeded; without it, 10 of 13 in the
  same interleaved series and far fewer earlier. The smoke test therefore passes that
  flag. The exact Chrome mechanism (something in the extension system of a fresh
  profile shortly after start-up) was not identified.
- The failure was not reproduced in a normal browser window. Masterportal does not
  catch a failed `config.js` load (`masterportal.js`, the promise around the script
  element), so if it ever happens in a real browser the result is a blank page and a
  reload is the only remedy.

## Credits and licences

- School data: jedeschule.codefor.de / Code for Germany. Check the project's terms
  before publishing the map.
- Background map: basemap.de, © GeoBasis-DE / BKG, CC BY 4.0.
- 🏫 icon: [Noto Color Emoji](https://github.com/googlefonts/noto-emoji) v2.042
  (Apache-2.0). `make icon` downloads it again and adds `width`/`height`, without which
  Firefox does not draw it on the canvas.
- Masterportal: Geowerkstatt Hamburg, MIT.

## Possible next steps

- Vector tiles (`/home/tim/Projekte/tippecanoe`) instead of one 11 MB GeoJSON file, if
  loading becomes too slow.
- Group the ~230 state-specific school types into broader categories (Grundschule,
  Gymnasium, Förderschule, Berufsschule, …) for the filter and for colours.
- Deploy as a static site (e.g. GitHub Pages), building the data in CI.
