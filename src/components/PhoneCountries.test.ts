import { describe, it, expect } from "vitest";
import { DEFAULT_COUNTRIES } from "./PhoneCountries";

describe("DEFAULT_COUNTRIES — phone country list", () => {
    it("includes Australia as the launch market", () => {
        const au = DEFAULT_COUNTRIES.find(c => c.iso === "AU");
        expect(au).toBeDefined();
        expect(au?.dial).toBe("+61");
        expect(au?.name).toBe("Australia");
    });

    it("includes near-term rollout markets NZ / GB / IE / CA / US", () => {
        const isoSet = new Set(DEFAULT_COUNTRIES.map(c => c.iso));
        for (const iso of ["NZ", "GB", "IE", "CA", "US"]) {
            expect(isoSet.has(iso)).toBe(true);
        }
    });

    it("every entry has iso (ISO 3166-1 alpha-2), name, dial (+), flag emoji", () => {
        for (const c of DEFAULT_COUNTRIES) {
            expect(c.iso).toMatch(/^[A-Z]{2}$/);
            expect(c.name.length).toBeGreaterThan(0);
            expect(c.dial.startsWith("+")).toBe(true);
            expect(c.dial.slice(1)).toMatch(/^\d+$/);
            expect(c.flag.length).toBeGreaterThan(0);
        }
    });

    it("ISO codes are unique", () => {
        const isoSet = new Set(DEFAULT_COUNTRIES.map(c => c.iso));
        expect(isoSet.size).toBe(DEFAULT_COUNTRIES.length);
    });

    it("has at least one country list entry (smoke)", () => {
        expect(DEFAULT_COUNTRIES.length).toBeGreaterThan(10);
    });
});
