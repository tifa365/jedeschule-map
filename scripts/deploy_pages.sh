#!/bin/sh
# Publish portal/ (including the locally built schulen.geojson) to the gh-pages
# branch of origin. GitHub Pages serves that branch.
#
#   make deploy        (run `make data` first if the data should be refreshed)
#
# The branch holds a single commit that is replaced on every deploy, so old data
# files do not pile up in the repository history.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
data="$root/portal/resources/data/schulen.geojson"
[ -s "$data" ] || { echo "missing $data, run 'make data' first" >&2; exit 1; }
remote=$(git -C "$root" remote get-url origin)
rev=$(git -C "$root" rev-parse --short HEAD)
dirty=$(git -C "$root" status --porcelain -- portal | head -1)
[ -z "$dirty" ] || echo "note: portal/ has uncommitted changes, they are deployed too" >&2

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -R "$root/portal/." "$tmp/"
touch "$tmp/.nojekyll"   # serve files as they are, no Jekyll processing
cd "$tmp"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$root" config user.name || echo deploy)" \
    -c user.email="$(git -C "$root" config user.email || echo deploy@localhost)" \
    commit -q -m "Deploy $rev ($(date -u +%Y-%m-%dT%H:%MZ))"
git -c credential.helper= -c credential.helper='!gh auth git-credential' \
    push -q --force "$remote" gh-pages
echo "pushed gh-pages ($rev) to $remote"
