/// <reference types="@vitest/browser/providers/playwright" />
/**
 * AUTM-1799, in a real browser: the money chips' layout, which jsdom cannot
 * measure (container queries, line boxes, 200% text).
 *
 * At 200% text the chip's amount broke mid-number ("$25.1" over "8"), because
 * the figure could wrap anywhere. It is whole now, and the chips still sit
 * side by side as they always have (the booking screen).
 */
import "../../.storybook/storybook.css";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MoneyBreakdown, type MoneyRow } from "./MoneyBreakdown";

const ROWS: MoneyRow[] = [
    {
        label: (
            <span className="flex flex-col">
                <span>On hold today</span>
                <span className="text-xs font-normal">Deposit $24 + booking fee $1.18</span>
            </span>
        ),
        value: "$25.18",
        tone: "flight",
    },
    { label: "After the job", value: "$58.74" },
];

function mount(width: number) {
    const { container } = render(
        <div style={{ width }}>
            <MoneyBreakdown variant="chips" label="When you pay" rows={ROWS} />
        </div>,
    );
    const dl = container.querySelector("dl")!;
    const chips = [...dl.children] as HTMLElement[];
    return { dl, chips };
}

/** Line boxes of an element's text: 1 means it is on one line. */
function lines(el: Element): number {
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
    return tops.size;
}

function sideBySide(chips: HTMLElement[]): boolean {
    return Math.round(chips[0].getBoundingClientRect().top) === Math.round(chips[1].getBoundingClientRect().top);
}

afterEach(() => {
    cleanup();
    document.documentElement.style.fontSize = "";
});

describe("MoneyBreakdown chips (AUTM-1799)", () => {
    it("keeps each amount one figure on one line, inside its chip, at 200% text", () => {
        document.documentElement.style.fontSize = "200%";
        /* 270px: about a chip's width in checkout's card at 390, where
           "$25.18" at 64px is wider than the chip's content box. */
        const { chips } = mount(270);
        for (const chip of chips) {
            const dd = chip.querySelector("dd")!;
            expect(lines(dd)).toBe(1);
            const range = document.createRange();
            range.selectNodeContents(dd);
            expect(range.getBoundingClientRect().right).toBeLessThanOrEqual(chip.getBoundingClientRect().right);
        }
    });

    it("still sits side by side in a phone's card, as the booking screen does", () => {
        const { chips } = mount(318);
        expect(sideBySide(chips)).toBe(true);
    });
});
