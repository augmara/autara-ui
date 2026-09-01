import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs with JSDoc types, no declaration file.
import { colors } from "./colors.mjs";

/**
 * AUTM-713 — the Tailwind preset and the CSS tokens are one palette expressed
 * twice, and they drifted: six of seven surface/border entries disagreed
 * (`bg` #f7f7f7 vs `--background` #fbfaf6, `border` #e5e5e5 vs
 * `--border-subtle` rgba(17,24,39,.08), and so on).
 *
 * Nothing caught it because the two emit different class names for the same
 * idea, so they were never rendered side by side. The preset now points at
 * the tokens rather than copying them; these tests exist so it stays that way.
 */

// Resolved from cwd, not import.meta.url: the suite runs under jsdom, where
// import.meta.url is not a file: URL and fileURLToPath throws.
//
// AUTM-948 — both token sheets, not just colors.css. The semantic accent trio
// and the glass material live in glass.css, and a preset entry pointing at one
// of them is just as much a pointer as one pointing into colors.css. Scanning
// a single file here would have failed the new entries for the wrong reason
// ("token not defined") and invited someone to "fix" it by inlining a hex,
// which is the exact drift this suite exists to prevent.
const CSS = [
    readFileSync(resolve(process.cwd(), "src/tokens/colors.css"), "utf8"),
    readFileSync(resolve(process.cwd(), "src/tokens/glass.css"), "utf8"),
].join("\n");

/** Every custom property DEFINED in colors.css. */
const defined = new Set(
    [...CSS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
);

/** Flatten the nested palette to [path, value] pairs. */
function entries(obj: unknown, prefix = ""): [string, string][] {
    const out: [string, string][] = [];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object") out.push(...entries(v, path));
        else out.push([path, String(v)]);
    }
    return out;
}

const palette = entries(colors);

describe("preset colours are a pointer layer, not a second source of truth", () => {
    it("has entries at all (guards against an empty import silently passing)", () => {
        expect(palette.length).toBeGreaterThan(20);
    });

    it.each(palette)("%s references a token instead of a literal", (_path, value) => {
        // A raw hex/rgb here is the bug this whole change exists to prevent:
        // it means someone re-copied a number instead of pointing at it.
        expect(value).toMatch(/^var\(--[a-z0-9-]+\)$/);
    });

    it.each(palette)("%s resolves to a token defined in colors.css", (_path, value) => {
        const token = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1];
        expect(token, `${value} is not a var() reference`).toBeDefined();
        expect(
            defined.has(token!),
            `${token} is referenced by the preset but never defined in tokens/colors.css`,
        ).toBe(true);
    });
});

describe("the token sheets themselves", () => {
    it("defines the semantic accent trio in both grades (AUTM-948)", () => {
        // Rule 4 — purple ACTS, aqua IN FLIGHT, lime DONE. Each needs a
        // text grade, a fill grade, and the on-colour the fill guarantees.
        // A trio missing its on-colour is how a solid status pill ends up
        // with unreadable ink on it.
        for (const t of [
            "--act",
            "--act-fill",
            "--on-act",
            "--flight",
            "--flight-fill",
            "--on-flight",
            "--money",
            "--money-fill",
            "--on-money",
        ]) {
            expect(defined.has(t), `${t} missing from tokens/glass.css`).toBe(true);
        }
    });

    it("defines the glass material the surface primitive depends on", () => {
        for (const t of [
            "--glass-fill",
            "--glass-fill-strong",
            // Rule 2 — the 1px inset top highlight. Without it glass reads
            // as flat grey and the whole direction collapses.
            "--glass-hi",
            "--glass-edge",
            "--glass-edge-hi",
            "--glass-blur",
            "--glass-saturate",
            "--bloom-act",
            "--bloom-flight",
            "--bloom-money",
            "--bloom-alpha",
        ]) {
            expect(defined.has(t), `${t} missing from tokens/glass.css`).toBe(true);
        }
    });

    it("defines the semantic surface stack the preset depends on", () => {
        for (const t of [
            "--background",
            "--surface",
            "--surface-elevated",
            "--foreground",
            "--text-muted",
            "--text-subtle",
            "--border-subtle",
        ]) {
            expect(defined.has(t), `${t} missing from tokens/colors.css`).toBe(true);
        }
    });
});
