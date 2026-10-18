#!/usr/bin/env node
// Headless load check: opens the portal in headless Chrome and waits until the
// "schulen" layer holds the expected number of features.
//
//   node scripts/smoke_test.mjs [url] [runs]        (default: http://127.0.0.1:8080/, 1 run)
//   SMOKE_TIMEOUT=60 SMOKE_EXPECT=30861 CHROME=/usr/bin/google-chrome node scripts/smoke_test.mjs
//
// Prints one line per run (ready or not, time to ready, aborted requests) and
// exits non-zero if any run did not become ready within the timeout. The timeout
// is reported separately from a failure, so slow loading and broken loading are
// distinguishable. Needs Node 22+ (global WebSocket and fetch) and Chrome.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.argv[2] || "http://127.0.0.1:8080/";
const runs = +(process.argv[3] || 1);
const timeoutS = +(process.env.SMOKE_TIMEOUT || 60);
const chromeBin = process.env.CHROME || "/usr/bin/google-chrome";
const port = +(process.env.SMOKE_PORT || 9339);
const expected = +(process.env.SMOKE_EXPECT || defaultExpected());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function defaultExpected() {
  try {
    const meta = join(dirname(fileURLToPath(import.meta.url)), "..", "portal", "resources", "data", "schulen.meta.json");
    return JSON.parse(readFileSync(meta, "utf8")).mapped;
  } catch { return 1; }
}

async function once() {
  const profile = mkdtempSync(join(tmpdir(), "jedeschule-smoke-"));
  const chrome = spawn(chromeBin, [
    "--headless=new", `--remote-debugging-port=${port}`, "--no-first-run",
    // Without this, a fresh headless profile cancels in-flight requests at random
    // during start-up (ERR_ABORTED, see README "Testing"); ~25 % of loads failed.
    "--disable-extensions",
    `--user-data-dir=${profile}`, "--window-size=1400,900", "about:blank",
  ], { stdio: "ignore" });
  try {
    let targets;
    for (let i = 0; i < 50 && !targets; i++) {
      try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(200); }
    }
    if (!targets) throw new Error("Chrome did not open its debugging port");
    const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r));
    let id = 0; const pending = new Map(); const urls = {}; const aborted = [];
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.method === "Network.requestWillBeSent") urls[m.params.requestId] = m.params.request.url;
      if (m.method === "Network.loadingFailed") aborted.push(`${m.params.errorText} ${(urls[m.params.requestId] || "").split("/").slice(-1)[0]}`);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
    });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Network.enable");
    const t0 = Date.now();
    await send("Page.navigate", { url });
    const probe = `(()=>{const m=window.mapCollection&&mapCollection.getMap('2D');const l=m&&m.getLayers().getArray().find(l=>l.get('id')==='schulen');return l?l.getSource().getSource().getFeatures().length:null})()`;
    let features = null;
    while (Date.now() - t0 < timeoutS * 1000) {
      const r = await Promise.race([send("Runtime.evaluate", { expression: probe, returnByValue: true }), sleep(10000).then(() => null)]);
      if (r === null) { ws.close(); return { ready: false, reason: "page did not respond for 10 s", features, ms: Date.now() - t0, aborted }; }
      features = r.result?.value ?? null;
      if (features >= expected) { ws.close(); return { ready: true, features, ms: Date.now() - t0, aborted }; }
      await sleep(500);
    }
    ws.close();
    return { ready: false, reason: `not ready after ${timeoutS} s`, features, ms: Date.now() - t0, aborted };
  } finally {
    chrome.kill("SIGKILL");
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
  }
}

let failed = 0;
for (let i = 1; i <= runs; i++) {
  const r = await once();
  if (!r.ready) failed++;
  const ab = r.aborted.filter((a) => !/woff|ttf/.test(a));
  console.log(`run ${i}: ${r.ready ? "ready" : "NOT READY"} features=${r.features} after ${(r.ms / 1000).toFixed(1)} s` +
    (r.reason ? ` (${r.reason})` : "") + (ab.length ? ` aborted: ${ab.join(", ")}` : ""));
}
console.log(`${runs - failed}/${runs} ready (expected ${expected} features, timeout ${timeoutS} s)`);
process.exit(failed ? 1 : 0);
