#!/usr/bin/env node
// AUTM-339 — postbuild fixup for strict Node ESM consumers.
//
// tsconfig.json uses moduleResolution:"bundler" so source files can write
// extension-less relative imports (`from './components'`) the way a
// bundler-consuming app does. tsc compiles those verbatim into dist/*.js
// with the same missing extension — fine for Vite/webpack-bundled
// consumers, but Node's native ESM resolver (hit by Vitest's SSR/vite-node
// path when it externalizes this package) refuses both extension-less
// file imports AND directory imports ("Directory import '.../components'
// is not supported"). Rewriting every source import to the NodeNext-style
// `.js`/`/index.js` suffix would touch 60+ lines across the component
// barrel; this script instead corrects the compiled OUTPUT once, after
// every build, so the published package resolves under both bundler and
// strict-Node-ESM consumers without changing source authoring style.
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");

// Matches `from './x'` / `from "../x"` (import or export specifiers) —
// deliberately excludes bare specifiers (no leading `.`), which are
// package imports and resolve fine as-is.
const RELATIVE_SPECIFIER = /((?:from|import)\s*\(?\s*['"])(\.[^'"]*)(['"])/g;

function resolveSpecifier(fileDir, spec) {
  if (spec.endsWith(".js") || spec.endsWith(".mjs") || spec.endsWith(".json")) {
    return spec; // already fully specified
  }
  const asFile = resolve(fileDir, `${spec}.js`);
  if (existsSync(asFile)) return `${spec}.js`;
  const asIndex = resolve(fileDir, spec, "index.js");
  if (existsSync(asIndex)) return `${spec}/index.js`;
  return null; // can't resolve — leave untouched, don't guess
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".js")) out.push(full);
  }
  return out;
}

let filesChanged = 0;
let specifiersFixed = 0;
let unresolved = [];

for (const file of walk(DIST)) {
  const dir = dirname(file);
  const src = readFileSync(file, "utf8");
  let changed = false;

  const next = src.replace(RELATIVE_SPECIFIER, (match, pre, spec, post) => {
    const fixed = resolveSpecifier(dir, spec);
    if (fixed === null) {
      unresolved.push(`${file}: ${spec}`);
      return match;
    }
    if (fixed !== spec) {
      changed = true;
      specifiersFixed += 1;
    }
    return `${pre}${fixed}${post}`;
  });

  if (changed) {
    writeFileSync(file, next);
    filesChanged += 1;
  }
}

console.log(
  `[fix-esm-extensions] ${specifiersFixed} specifier(s) fixed across ${filesChanged} file(s).`,
);
if (unresolved.length > 0) {
  console.warn(
    `[fix-esm-extensions] ${unresolved.length} relative specifier(s) could not be resolved to a real file — left unchanged:`,
  );
  for (const u of unresolved) console.warn(`  ${u}`);
  process.exitCode = 1;
}
