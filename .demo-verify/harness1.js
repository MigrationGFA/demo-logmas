/* ---- browser-global polyfills + @/ require hook, loaded by harness.js ---- */
const path = require("path");
const Module = require("module");
const ts = require("typescript");
const fs = require("fs");
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(__dirname, "out");

const lls = (() => {
  let s = {};
  return {
    getItem: (k) => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: (k) => { delete s[k]; },
    clear: () => { s = {}; },
  };
})();
class DummyEl { addEventListener() {} }
const listeners = {};
global.window = {
  localStorage: lls, document: new DummyEl(), location: { origin: "http://localhost:3000" },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({ status: "success", data: {} }), text: async () => "{}" }),
  addEventListener: (k, fn) => { (listeners[k] = listeners[k] || []).push(fn); },
  dispatchEvent: (ev) => { (listeners[ev.type] = listeners[ev.type] || []).forEach(fn => { try { fn(ev); } catch (e) {} }); return true; },
};
global.window.fetch.bind = global.window.fetch.bind;
global.localStorage = lls;
global.sessionStorage = lls;
global.navigator = { userAgent: "node", clipboard: { writeText: async () => {} } };
global.FormData = class { constructor() { this._d = {}; } append(k, v) { this._d[k] = v; } get(k) { return this._d[k]; } forEach(fn) { for (const k in this._d) fn(this._d[k], k); } };
global.File = class File { constructor(bits, name, opts = {}) { this.name = name; this.size = 0; this.type = opts.type || ""; this.lastModified = Date.now(); } };
global.Blob = class Blob { constructor() { this.size = 0; this.type = ""; } };

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...rest) {
  let resolved = req;
  if (req && req.startsWith("@/")) resolved = path.join(SRC, req.slice(2));
  try {
    return origResolve.call(this, resolved, parent, ...rest);
  } catch (e) {
    // Try common TS extensions / index files for aliased source modules.
    for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
      try { return origResolve.call(this, resolved + ext, parent, ...rest); } catch (_) {}
    }
    try { return origResolve.call(this, path.join(resolved, "index.ts"), parent, ...rest); } catch (_) {}
    try { return origResolve.call(this, path.join(resolved, "index.tsx"), parent, ...rest); } catch (_) {}
    throw e;
  }
};
Module._extensions[".ts"] = function (mod, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, allowJs: true },
  }).outputText;
  return mod._compile(out, filename);
};
Module._extensions[".tsx"] = Module._extensions[".ts"];

const handler = require(path.join(OUT, "mockApiHandler.js"));
const appsStore = require(path.join(OUT, "applicationsStore.js"));
const store = require(path.join(OUT, "store.js"));

module.exports = { handler, appsStore, store, lls };
