#!/usr/bin/env python3
"""Patch the bundled Masterportal 3.7.0: fast filtering on large clustered layers, zoom into clusters on click.

    python3 scripts/patch_mastercode.py

Three patches:

1. show-features: the vector layer's showFeaturesByIds() changed each matching feature
   while attached to the source; every change made the OpenLayers Cluster source
   re-cluster all 30k features (thousands of full re-clusterings per filter). The
   patched version unhooks the cluster from its source, updates all features in
   place, re-hooks it and re-clusters once. Non-clustered layers: detach all, update,
   re-add once. In both cases try/finally restores the listener or the features if
   a style function throws.

2. apply-once: the filter matches features in pages and re-applied the accumulated
   result to the map after every page. The patched call passes "apply now" only for
   the last page, so the map is rebuilt once per filter operation while matching
   still runs in chunks (the UI stays responsive between them).

3. cluster-zoom: a click on a cluster circle zooms the map to the clustered schools
   instead of opening the feature info for all of them. At maximum zoom, or when all
   members share one location, the feature info opens as before.

4. cluster-extent: OpenLayers' Cluster source re-clustered all 30k features after every
   zoom (about 1 s) and kept ~11k cluster features for all of Germany, which made
   every frame slow to draw. Now it clusters only the visible extent plus a margin and
   re-clusters on zoom or when the view moves out of that area.

Idempotent: skips patches that are applied, upgrades earlier show-features
variants (v1, v2), and fails if a patch site is not found (e.g. after a Masterportal update).
"""
import os
import sys
from pathlib import Path

BUNDLE = (Path(__file__).resolve().parents[1]
          / "portal" / "mastercode" / "3_7_0" / "js" / "masterportal.js")

SHOW_ORIGINAL = """\
        (n.prototype.showFeaturesByIds = function (i) {
          const d =
              this.getLayerSource() instanceof r.default
                ? this.getLayerSource().getSource()
                : this.getLayerSource(),
            h = d.getFeatures(),
            O = i.map((P) => d.getFeatureById(P));
          this.hideAllFeatures(),
            O.forEach((P) => {
              const p = this.getStyleAsFunction(this.get("style"));
              P &&
                P !== null &&
                (P.set("hideInClustering", !1), P.setStyle(p(P)));
            }),
            d.addFeatures(h);
        }),
"""

SHOW_V1 = """\
        (n.prototype.showFeaturesByIds = function (i) {
          /* jedeschule-map patch: update features while detached, re-add once */
          const d =
              this.getLayerSource() instanceof r.default
                ? this.getLayerSource().getSource()
                : this.getLayerSource(),
            h = d.getFeatures(),
            ids = new Set(i),
            p = this.getStyleAsFunction(this.get("style"));
          d.clear(),
            h.forEach((P) => {
              ids.has(P.getId())
                ? (P.set("hideInClustering", !1), P.setStyle(p(P)))
                : (P.set("hideInClustering", !0), P.setStyle(new o.default()));
            }),
            d.addFeatures(h);
        }),
"""

SHOW_V2 = """\
        (n.prototype.showFeaturesByIds = function (i) {
          /* jedeschule-map patch v2: update features in place with the cluster
             unhooked from its source, then re-cluster once */
          const c = this.getLayerSource(),
            isCluster = c instanceof r.default,
            d = isCluster ? c.getSource() : c,
            h = d.getFeatures(),
            ids = new Set(i),
            p = this.getStyleAsFunction(this.get("style")),
            apply = () =>
              h.forEach((P) => {
                ids.has(P.getId())
                  ? (P.set("hideInClustering", !1), P.setStyle(p(P)))
                  : (P.set("hideInClustering", !0), P.setStyle(new o.default()));
              });
          isCluster
            ? (d.removeEventListener("change", c.boundRefresh_),
              apply(),
              d.addEventListener("change", c.boundRefresh_),
              c.refresh())
            : (d.clear(), apply(), d.addFeatures(h));
        }),
"""

SHOW_PATCHED = """\
        (n.prototype.showFeaturesByIds = function (i) {
          /* jedeschule-map patch v3: update features in place with the cluster
             unhooked from its source, then re-cluster once; try/finally restores
             the listener (or the features) if a style function throws */
          const c = this.getLayerSource(),
            isCluster = c instanceof r.default,
            d = isCluster ? c.getSource() : c,
            h = d.getFeatures(),
            ids = new Set(i),
            p = this.getStyleAsFunction(this.get("style")),
            apply = () =>
              h.forEach((P) => {
                ids.has(P.getId())
                  ? (P.set("hideInClustering", !1), P.setStyle(p(P)))
                  : (P.set("hideInClustering", !0), P.setStyle(new o.default()));
              });
          if (isCluster) {
            d.removeEventListener("change", c.boundRefresh_);
            try {
              apply();
            } finally {
              d.addEventListener("change", c.boundRefresh_), c.refresh();
            }
          } else {
            d.clear();
            try {
              apply();
            } finally {
              d.addFeatures(h);
            }
          }
        }),
"""

CALL_ORIGINAL = """\
                            this.mapHandler.addItemsToLayer(
                              ue,
                              _e.items,
                              this.isExtern()
                            ),"""

CALL_PATCHED = """\
                            this.mapHandler.addItemsToLayer(
                              ue,
                              _e.items,
                              this.isExtern(),
                              /* jedeschule-map patch: apply to the map on the last page only */
                              !_e.paging ||
                                !_e.paging.total ||
                                _e.paging.page === _e.paging.total
                            ),"""

SIG_ORIGINAL = """\
      addItemsToLayer(r, o, n) {"""

SIG_PATCHED = """\
      addItemsToLayer(r, o, n, applyNow) {"""

APPLY_ORIGINAL = """\
          n
            ? p.addFeatures(o)
            : this.handlers.showFeaturesByIds(O.id, this.filteredIds[r]));"""

APPLY_PATCHED = """\
          n
            ? p.addFeatures(o)
            : applyNow !== !1 &&
              this.handlers.showFeaturesByIds(O.id, this.filteredIds[r]));"""

CLUSTER_ORIGINAL = """\
        collectGfiFeatures({
          getters: d,
          commit: h,
          dispatch: O,
          rootGetters: P,
        }) {
"""

CLUSTER_PATCHED = CLUSTER_ORIGINAL + """\
          /* jedeschule-map patch: a click on a cluster circle zooms in to split it
             instead of opening the feature info. Falls through to the feature info
             at maximum zoom or when all clustered points share one location. */
          {
            const cm = mapCollection.getMap("2D"),
              cpx = P["Maps/clickPixel"],
              cview = cm && cm.getView();
            let members = null;
            P["Maps/mode"] === "2D" &&
              cm &&
              cpx &&
              cm.forEachFeatureAtPixel(cpx, (f) => {
                const fs = f.get("features");
                return Array.isArray(fs) && fs.length > 1 ? ((members = fs), !0) : void 0;
              });
            if (members && cview.getZoom() < cview.getMaxZoom()) {
              const ext = [Infinity, Infinity, -Infinity, -Infinity];
              members.forEach((f) => {
                const e = f.getGeometry().getExtent();
                (ext[0] = Math.min(ext[0], e[0])), (ext[1] = Math.min(ext[1], e[1])),
                  (ext[2] = Math.max(ext[2], e[2])), (ext[3] = Math.max(ext[3], e[3]));
              });
              if (ext[2] - ext[0] > 1 || ext[3] - ext[1] > 1) {
                cview.fit(ext, { padding: [80, 80, 80, 80], duration: 400 });
                return;
              }
            }
          }
"""

EXTENT_LOAD_ORIGINAL = """\
      loadFeatures(n, i, d) {
        var h;
        (h = this.source) == null || h.loadFeatures(n, i, d),
          i !== this.resolution && ((this.resolution = i), this.refresh());
      }
"""

EXTENT_LOAD_PATCHED = """\
      loadFeatures(n, i, d) {
        /* jedeschule-map patch: cluster only the requested extent plus a margin of
           half its size on every side, and re-cluster on zoom or when the view
           leaves that area (OpenLayers clustered all features at every zoom). */
        var h;
        (h = this.source) == null || h.loadFeatures(n, i, d);
        const fin = n && n.every((v) => isFinite(v)),
          ce = this.clusterExtent_,
          inside = fin && ce && n[0] >= ce[0] && n[1] >= ce[1] && n[2] <= ce[2] && n[3] <= ce[3];
        if (i !== this.resolution || (fin && !inside)) {
          const w = fin ? (n[2] - n[0]) / 2 : 0,
            hh = fin ? (n[3] - n[1]) / 2 : 0;
          (this.clusterExtent_ = fin ? [n[0] - w, n[1] - hh, n[2] + w, n[3] + hh] : null),
            (this.resolution = i),
            this.refresh();
        }
      }
"""

EXTENT_CLUSTER_ORIGINAL = """\
          i = this.distance * this.resolution,
          d = this.source.getFeatures(),
          h = {};"""

EXTENT_CLUSTER_PATCHED = """\
          i = this.distance * this.resolution,
          d = this.clusterExtent_
            ? this.source.getFeaturesInExtent(this.clusterExtent_)
            : this.source.getFeatures(),
          h = {};"""

# name, patched text, known unpatched variants
PATCHES = [
    ("show-features", SHOW_PATCHED, [SHOW_ORIGINAL, SHOW_V1, SHOW_V2]),
    ("apply-once call", CALL_PATCHED, [CALL_ORIGINAL]),
    ("apply-once signature", SIG_PATCHED, [SIG_ORIGINAL]),
    ("apply-once apply", APPLY_PATCHED, [APPLY_ORIGINAL]),
    ("cluster-zoom", CLUSTER_PATCHED, [CLUSTER_ORIGINAL]),
    ("cluster-extent load", EXTENT_LOAD_PATCHED, [EXTENT_LOAD_ORIGINAL]),
    ("cluster-extent cluster", EXTENT_CLUSTER_PATCHED, [EXTENT_CLUSTER_ORIGINAL]),
]


def main():
    text = BUNDLE.read_text(encoding="utf-8")
    changed = []
    for name, patched, variants in PATCHES:
        if text.count(patched) == 1:
            continue
        old = next((v for v in variants if text.count(v) == 1), None)
        if old is None:
            sys.exit(f"patch site '{name}' not found as expected in {BUNDLE}; "
                     "Masterportal version changed? Nothing was written.")
        text = text.replace(old, patched)
        changed.append(name)
    if not changed:
        print("already patched")
        return
    tmp = BUNDLE.with_name(f".{BUNDLE.name}.{os.getpid()}.tmp")
    try:
        tmp.write_text(text, encoding="utf-8")
        os.replace(tmp, BUNDLE)
    finally:
        tmp.unlink(missing_ok=True)
    print(f"patched {BUNDLE}: {', '.join(changed)}")


if __name__ == "__main__":
    main()
