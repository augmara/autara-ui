import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingStars } from "./RatingStars";

/**
 * Reads back what a sighted user actually sees: how many stars are filled,
 * half-filled and empty. Full/empty are distinguished by the fill colour on
 * the <svg>; the half star is the only branch that emits a <linearGradient>.
 */
function readStars(rating: number, showHalf = true) {
    const { unmount } = render(<RatingStars rating={rating} showHalf={showHalf} />);
    const svgs = Array.from(screen.getByRole("img").querySelectorAll("svg"));
    const counts = svgs.reduce(
        (acc, svg) => {
            if (svg.querySelector("linearGradient")) acc.half += 1;
            else if (svg.getAttribute("class")?.includes("text-amber-500")) acc.full += 1;
            else acc.empty += 1;
            return acc;
        },
        { full: 0, half: 0, empty: 0 },
    );
    unmount();
    return { ...counts, reads: counts.full + counts.half * 0.5 };
}

describe("RatingStars — fraction bucketing (AUTM-741)", () => {
    it("always renders exactly five stars", () => {
        for (const r of [0, 1.2, 3.7, 4.9, 5]) {
            const { full, half, empty } = readStars(r);
            expect(full + half + empty, `rating ${r}`).toBe(5);
        }
    });

    // The regression: `safe - full` was compared against 0.9 without rounding,
    // so 4.9 fell outside the half-star window AND had no round-up branch,
    // rendering four stars for a 4.9 merchant.
    it.each([
        [5, 5],
        [4.95, 5],
        [4.9, 5],
        [4.89, 4.5],
        [4.75, 4.5],
        [4.5, 4.5],
        [4.4, 4.5],
        [4.3, 4],
        [4, 4],
        [3.9, 4],
        [0.9, 1],
        [0.4, 0.5],
        [0.3, 0],
        [0, 0],
    ])("renders %s as %s stars", (rating, expected) => {
        expect(readStars(rating).reads).toBe(expected);
    });

    // 4.9 - 4 = 0.9000000000000004 while 3.9 - 3 = 0.8999999999999999. Before
    // the fix these two identical-looking fractions rendered a full star apart.
    it("treats the same nominal fraction identically across integer parts", () => {
        const offsets = [0, 1, 2, 3, 4].map((n) => readStars(n + 0.9).reads - n);
        expect(new Set(offsets).size).toBe(1);
    });

    it("never shows fewer filled stars than the aria-label announces", () => {
        for (let tenths = 0; tenths <= 50; tenths += 1) {
            const rating = tenths / 10;
            const { reads } = readStars(rating);
            expect(reads, `rating ${rating}`).toBeGreaterThanOrEqual(rating - 0.5);
        }
    });
});

describe("RatingStars — clamping and labelling", () => {
    it.each([
        [7, 5],
        [-3, 0],
    ])("clamps %s into range", (rating, expected) => {
        expect(readStars(rating).reads).toBe(expected);
    });

    it("announces the rating to one decimal place", () => {
        render(<RatingStars rating={4.9} />);
        expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Rated 4.9 of 5");
    });

    it("accepts an aria-label override", () => {
        render(<RatingStars rating={4.9} ariaLabel="Apex Wraps, rated 4.9" />);
        expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Apex Wraps, rated 4.9");
    });

    it("rounds up instead of half-starring when showHalf is off", () => {
        expect(readStars(4.5, false).reads).toBe(4);
        expect(readStars(4.9, false).reads).toBe(5);
    });
});
