import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn — className helper", () => {
    it("joins multiple class strings", () => {
        expect(cn("a", "b", "c")).toBe("a b c");
    });

    it("filters out falsy values", () => {
        expect(cn("a", null, undefined, false, "b")).toBe("a b");
    });

    it("supports the clsx object form (truthy keys included)", () => {
        expect(cn("a", { b: true, c: false, d: true })).toBe("a b d");
    });

    it("supports nested arrays", () => {
        expect(cn(["a", ["b", ["c"]]])).toBe("a b c");
    });

    it("uses tailwind-merge to dedupe conflicting utilities", () => {
        // p-2 + p-4 → only p-4 wins (later override).
        expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("preserves non-conflicting utilities", () => {
        expect(cn("p-4", "text-red-500")).toBe("p-4 text-red-500");
    });

    it("merges responsive variants correctly", () => {
        // bg-red-500 + md:bg-blue-500 are both valid (different breakpoints).
        expect(cn("bg-red-500", "md:bg-blue-500")).toBe("bg-red-500 md:bg-blue-500");
    });

    it("dedupes responsive utilities at the same breakpoint", () => {
        expect(cn("md:p-2", "md:p-4")).toBe("md:p-4");
    });

    it("returns empty string with no input", () => {
        expect(cn()).toBe("");
    });

    it("handles a mix of strings, objects, arrays, and falsy", () => {
        expect(
            cn("a", ["b", { c: true, d: false }], undefined, null, "e", false),
        ).toBe("a b c e");
    });
});
