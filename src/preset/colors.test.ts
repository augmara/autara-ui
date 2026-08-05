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
const CSS = readFileSync(resolve(process.cwd(), "src/tokens/colors.css"), "utf8");

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

describe("the token sheet itself", () => {
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
