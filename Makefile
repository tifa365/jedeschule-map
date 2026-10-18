PORT ?= 8080
NOTO := https://raw.githubusercontent.com/googlefonts/noto-emoji/v2.042/svg/emoji_u1f3eb.svg
# Niedersachsen coordinates from the PR #226 crawl; used automatically when present
NI_CACHE := cache/niedersachsen.json

.PHONY: data data-ni icon patch serve smoke deploy

# Publish portal/ incl. the built data to the gh-pages branch (GitHub Pages)
deploy:
	sh scripts/deploy_pages.sh

# Headless load check against a running server: make smoke [URL=http://127.0.0.1:8080/] [RUNS=3]
URL ?= http://127.0.0.1:$(PORT)/
RUNS ?= 3
smoke:
	node scripts/smoke_test.mjs $(URL) $(RUNS)

# Download latest.csv and build portal/resources/data/schulen.geojson
data:
	python3 -I scripts/build_data.py $(if $(wildcard $(NI_CACHE)),--ni $(NI_CACHE))

# Same, with Niedersachsen coordinates from another file: make data-ni NI=path/to/file.json
data-ni:
	python3 -I scripts/build_data.py --ni $(NI)

# Noto 🏫, with intrinsic size added so Firefox can draw it on canvas
icon:
	curl -sfL -o portal/resources/img/schule.svg $(NOTO)
	sed -i '0,/viewBox="0 0 128 128"/s//width="128" height="128" viewBox="0 0 128 128"/' portal/resources/img/schule.svg

# Re-apply the filter performance patch (needed after replacing mastercode/)
patch:
	python3 -I scripts/patch_mastercode.py

serve:
	python3 -m http.server $(PORT) -d portal
