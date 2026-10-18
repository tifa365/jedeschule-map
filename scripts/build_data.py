#!/usr/bin/env python3
"""Build the schools GeoJSON for the map from the jedeschule CSV dump.

    python3 scripts/build_data.py                     # download latest.csv
    python3 scripts/build_data.py --csv latest.csv    # use a local copy
    python3 scripts/build_data.py --ni niedersachsen.json

--ni takes the output of `scrapy crawl niedersachsen -O <file>.json` from the
feature/niedersachsen-geodata branch (PR #226) and fills in Niedersachsen
coordinates, which the published CSV does not have yet.

Writes portal/resources/data/schulen.geojson and schulen.meta.json, and updates the
statistics in the About text of portal/config.json. With a non-default --out, the
portal config is only touched if --config is given explicitly.

All outputs are first written to uniquely named temp files and validated; only then
are they swapped in, one os.replace each. A lock file prevents concurrent builds.
Refuses to write if ids are empty or duplicated, or if coverage drops noticeably
compared to the previous build (override with --allow-drop).
Standard library only.
"""
import argparse
import collections
import contextlib
import csv
import datetime
import fcntl
import json
import os
import re
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_URL = "https://jedeschule.codefor.de/csv-data/latest.csv"
OUT = ROOT / "portal" / "resources" / "data" / "schulen.geojson"
CONFIG = ROOT / "portal" / "config.json"
CACHE = ROOT / "cache"

# lon_min, lat_min, lon_max, lat_max; generous box around Germany
DE_BBOX = (5.5, 47.0, 15.5, 55.5)

# Coverage guard: maximum allowed loss of mapped schools vs. the previous build
MAX_DROP_TOTAL = 0.02
MAX_DROP_STATE = 0.10
# States with more missing schools than this are named in the About text
MISSING_NOTE_MIN = 100

STATES = {
    "BW": "Baden-Württemberg", "BY": "Bayern", "BE": "Berlin", "BB": "Brandenburg",
    "HB": "Bremen", "HH": "Hamburg", "HE": "Hessen", "MV": "Mecklenburg-Vorpommern",
    "NI": "Niedersachsen", "NW": "Nordrhein-Westfalen", "RP": "Rheinland-Pfalz",
    "SL": "Saarland", "SN": "Sachsen", "ST": "Sachsen-Anhalt", "SH": "Schleswig-Holstein",
    "TH": "Thüringen",
}

COLUMNS = {"id", "name", "address", "address2", "zip", "city", "website", "email",
           "school_type", "legal_status", "provider", "phone", "update_timestamp",
           "longitude", "latitude", "state"}


@contextlib.contextmanager
def build_lock(lock_dir):
    """Exclusive lock so two builds cannot interleave their outputs."""
    lock_dir.mkdir(parents=True, exist_ok=True)
    with open(lock_dir / ".build.lock", "w") as fh:
        try:
            fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            sys.exit(f"Another build is running (lock {lock_dir / '.build.lock'}).")
        yield


def temp_path(path, suffix=".tmp"):
    """A uniquely named, empty temp file next to path (same filesystem for os.replace)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=suffix)
    os.close(fd)
    os.chmod(name, 0o644)  # mkstemp uses 0600; published files must stay world-readable
    return Path(name)


class Staging:
    """Collects prepared outputs as temp files; publish() swaps them in, else they are removed."""

    def __init__(self):
        self.files = []  # (temp, target)

    def write(self, target, write):
        tmp = temp_path(target)
        self.files.append((tmp, target))
        with open(tmp, "w", encoding="utf-8", newline="") as fh:
            write(fh)
        return tmp

    def publish(self):
        for tmp, target in self.files:
            os.replace(tmp, target)
        self.files = []

    def discard(self):
        for tmp, _ in self.files:
            tmp.unlink(missing_ok=True)
        self.files = []


def download_csv(url, cache_dir):
    path = cache_dir / "latest.csv"
    part = temp_path(path, suffix=".part")
    print(f"Downloading {url} …", file=sys.stderr)
    try:
        with urllib.request.urlopen(url, timeout=120) as resp, open(part, "wb") as fh:
            while chunk := resp.read(1 << 20):
                fh.write(chunk)
        os.replace(part, path)
    finally:
        part.unlink(missing_ok=True)
    return path


def read_schools(path):
    """The `raw` column holds multi-line quoted JSON, so let csv do the parsing."""
    csv.field_size_limit(1 << 30)
    with open(path, encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        missing = COLUMNS - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"CSV is missing columns: {sorted(missing)}")
        yield from reader


def parse_coord(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number or None  # 0 is a known placeholder


def load_ni(path):
    """Scrapy's feed export wraps each item as {"info": {...}, "item": {...}}."""
    with open(path, encoding="utf-8") as fh:
        records = json.load(fh)
    coords = {}
    for rec in records:
        info = rec.get("info", rec)
        lat, lon = parse_coord(info.get("latitude")), parse_coord(info.get("longitude"))
        if info.get("id") and lat and lon:
            coords[info["id"]] = (lat, lon)
    return coords


def clean(value):
    return " ".join((value or "").split())


def in_germany(lat, lon):
    lon_min, lat_min, lon_max, lat_max = DE_BBOX
    return lon_min <= lon <= lon_max and lat_min <= lat <= lat_max


def to_feature(row, ni_coords):
    """Return (feature, reason); reason is None for a mapped school."""
    lat, lon = parse_coord(row["latitude"]), parse_coord(row["longitude"])
    if (lat is None or lon is None) and row["state"] == "NI" and row["id"] in ni_coords:
        lat, lon = ni_coords[row["id"]]
    if lat is None or lon is None:
        return None, "no_coords"
    if not in_germany(lat, lon):
        return None, "outside_bbox"

    props = {
        "id": row["id"],
        "name": clean(row["name"]),
        "schulart": clean(row["school_type"]),
        "traegerschaft": clean(row["legal_status"]),
        "traeger": clean(row["provider"]),
        "adresse": " ".join(filter(None, [clean(row["address"]), clean(row["address2"])])),
        "plz": clean(row["zip"]),
        "ort": clean(row["city"]),
        "bundesland": STATES.get(row["state"], row["state"]),
        "bl": row["state"],
        "telefon": clean(row["phone"]),
        "email": clean(row["email"]),
        "website": clean(row["website"]),
    }
    feature = {
        "type": "Feature",
        # A top-level id stops Masterportal's GeoJSON afterLoading from calling setId() on
        # every feature; each call triggers a full re-cluster and freezes the page.
        "id": clean(row["id"]),
        "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
        "properties": {k: v for k, v in props.items() if v},
    }
    return feature, None


def check_ids(features):
    """Empty or duplicate ids would bring back the setId freeze and break feature lookup."""
    ids = [f["id"] for f in features]
    empty = sum(1 for i in ids if not i)
    dupes = [i for i, n in collections.Counter(ids).items() if i and n > 1]
    if empty or dupes:
        sys.exit(f"Invalid ids: {empty} empty, {len(dupes)} duplicated "
                 f"(e.g. {dupes[:10]}). Not writing output.")


def check_coverage(per_state, mapped, meta_path):
    """Return a list of problems compared to the previous build's meta file."""
    try:
        with open(meta_path, encoding="utf-8") as fh:
            prev = json.load(fh)
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    problems = []
    if mapped < prev["mapped"] * (1 - MAX_DROP_TOTAL):
        problems.append(f"gesamt: {prev['mapped']} → {mapped}")
    for code, old in prev.get("per_state", {}).items():
        new = per_state.get(code, {}).get("mapped", 0)
        if new < old["mapped"] * (1 - MAX_DROP_STATE):
            problems.append(f"{code}: {old['mapped']} → {new} ({new - old['mapped']:+d})")
    return problems


def de_int(n):
    return f"{n:,}".replace(",", ".")


def update_about(config_path, meta, staging):
    """Stage config.json with the <span data-stats>/<span data-missing> markers filled."""
    with open(config_path, encoding="utf-8") as fh:
        config = json.load(fh)
    sections = config["portalConfig"]["mainMenu"]["sections"]
    about = next((e for section in sections for e in section
                  if e.get("type") == "customMenuElement"
                  and e.get("name") == "Über diese Karte"), None)
    if about is None or "data-stats" not in about.get("htmlContent", ""):
        print("warning: About text markers not found, statistics not updated", file=sys.stderr)
        return

    date = datetime.date.fromisoformat(meta["data_date"]).strftime("%d.%m.%Y")
    stats = (f"<b>Datenstand:</b> {date} &middot; <b>Schulen gesamt:</b> "
             f"{de_int(meta['total'])} &middot; <b>davon auf der Karte:</b> "
             f"{de_int(meta['mapped'])}")
    missing = sorted(((s["total"] - s["mapped"], code) for code, s in meta["per_state"].items()),
                     reverse=True)
    names = [STATES.get(code, code) for n, code in missing if n > MISSING_NOTE_MIN]
    if names:
        listed = names[0] if len(names) == 1 else ", ".join(names[:-1]) + " und " + names[-1]
        note = f"Schulen ohne Koordinaten fehlen auf der Karte, vor allem in {listed}."
    else:
        note = "Schulen ohne Koordinaten fehlen auf der Karte."
    if meta.get("ni_coords"):
        note += " Die Koordinaten für Niedersachsen stammen vorläufig direkt von NiBiS."

    html = about["htmlContent"]
    html = re.sub(r"(<span data-stats>).*?(</span>)", lambda m: m[1] + stats + m[2], html)
    html = re.sub(r"(<span data-missing>).*?(</span>)", lambda m: m[1] + note + m[2], html)
    about["htmlContent"] = html

    def write(fh):
        json.dump(config, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    tmp = staging.write(config_path, write)
    with open(tmp, encoding="utf-8") as fh:
        json.load(fh)  # never publish a config the portal cannot parse


def report(per_state, dropped, total, mapped, n_types, data_date, out):
    print(f"\n{'Land':<4} {'gesamt':>7} {'Karte':>7} {'fehlt':>7}")
    for code in sorted(per_state):
        s = per_state[code]
        print(f"{code:<4} {s['total']:>7} {s['mapped']:>7} {s['total'] - s['mapped']:>7}")
    print(f"{'Σ':<4} {total:>7} {mapped:>7} {total - mapped:>7}")
    print(f"\nohne Koordinaten: {dropped['no_coords']}, außerhalb DE: {dropped['outside_bbox']}")
    print(f"Schularten (distinct): {n_types}, Datenstand: {data_date}")
    print(f"→ {out} ({out.stat().st_size / 1e6:.1f} MB)")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--csv", type=Path, help="local CSV instead of downloading latest.csv")
    ap.add_argument("--ni", type=Path, help="Niedersachsen scrapy JSON with coordinates")
    ap.add_argument("--out", type=Path, default=OUT)
    ap.add_argument("--config", type=Path,
                    help="portal config.json whose About text to update (default: the live "
                         "portal config, but only when --out is the default)")
    ap.add_argument("--cache", type=Path, default=CACHE, help="download directory")
    ap.add_argument("--allow-drop", action="store_true",
                    help="write even if coverage dropped compared to the previous build")
    args = ap.parse_args()
    if args.config is None and args.out.resolve() == OUT:
        args.config = CONFIG
    elif args.config is None:
        print("note: alternate --out without --config; About text not updated", file=sys.stderr)

    with build_lock(args.cache):
        build(args)


def build(args):
    csv_path = args.csv or download_csv(CSV_URL, args.cache)
    ni_coords = load_ni(args.ni) if args.ni else {}
    if args.ni:
        print(f"Niedersachsen: {len(ni_coords)} Koordinaten aus {args.ni}", file=sys.stderr)

    features, types, dates = [], set(), []
    per_state = collections.defaultdict(lambda: {"total": 0, "mapped": 0})
    dropped = collections.Counter(no_coords=0, outside_bbox=0)
    total = 0
    for row in read_schools(csv_path):
        total += 1
        per_state[row["state"]]["total"] += 1
        if row["update_timestamp"]:
            dates.append(row["update_timestamp"][:10])
        feature, reason = to_feature(row, ni_coords)
        if reason:
            dropped[reason] += 1
            continue
        per_state[row["state"]]["mapped"] += 1
        types.add(feature["properties"].get("schulart"))
        features.append(feature)

    mapped = len(features)
    if total < 30000 or mapped < 25000:
        sys.exit(f"Implausible result: {total} rows, {mapped} mapped. Not writing output.")
    check_ids(features)
    meta_path = args.out.with_suffix(".meta.json")
    problems = check_coverage(per_state, mapped, meta_path)
    if problems and not args.allow_drop:
        sys.exit("Coverage dropped compared to the previous build:\n  " + "\n  ".join(problems)
                 + "\nNot writing output. Pass --ni cache/niedersachsen.json if Niedersachsen "
                 "is missing, or --allow-drop to accept the drop.")

    data_date = max(dates) if dates else None
    meta = {
        "generated": datetime.date.today().isoformat(),
        "data_date": data_date,
        "source": CSV_URL if not args.csv else str(args.csv),
        "ni_coords": bool(args.ni),
        "total": total,
        "mapped": mapped,
        "dropped": dict(dropped),
        "per_state": dict(sorted(per_state.items())),
    }
    # Prepare and validate every output first; publish only if all of them succeeded.
    staging = Staging()
    try:
        staging.write(args.out, lambda fh: json.dump(
            {"type": "FeatureCollection", "features": features}, fh,
            ensure_ascii=False, separators=(",", ":")))
        staging.write(meta_path, lambda fh: json.dump(meta, fh, ensure_ascii=False, indent=2))
        if data_date and args.config:
            update_about(args.config, meta, staging)
        staging.publish()
    finally:
        staging.discard()
    report(per_state, dropped, total, mapped, len(types - {None}), data_date, args.out)


if __name__ == "__main__":
    main()
