#!/usr/bin/env python3
"""Patch the bundled Masterportal 3.7.0 so the filter stays fast on large clustered layers.

    python3 scripts/patch_mastercode.py

Two problems, two patches:

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

# name, patched text, known unpatched variants
PATCHES = [
    ("show-features", SHOW_PATCHED, [SHOW_ORIGINAL, SHOW_V1, SHOW_V2]),
    ("apply-once call", CALL_PATCHED, [CALL_ORIGINAL]),
    ("apply-once signature", SIG_PATCHED, [SIG_ORIGINAL]),
    ("apply-once apply", APPLY_PATCHED, [APPLY_ORIGINAL]),
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
