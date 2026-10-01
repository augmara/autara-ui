import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressSteps } from "./ProgressSteps";
import { Stepper } from "./Stepper";
import { Countdown } from "./Countdown";

const STEPS = ["Requested", "Confirmed", "In progress", "Completed"];

describe("ProgressSteps (AUTM-1594)", () => {
    it("is a named list that marks where the booking is", () => {
        render(<ProgressSteps steps={STEPS} current={1} label="Booking progress" />);
        expect(screen.getByRole("list", { name: "Booking progress" })).toBeInTheDocument();
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(4);
        expect(items[1]).toHaveAttribute("aria-current", "step");
        expect(items[0]).not.toHaveAttribute("aria-current");
    });

    it("fills the bars up to and including the current step", () => {
        const { container } = render(<ProgressSteps steps={STEPS} current={1} />);
        const bars = [...container.querySelectorAll("span[aria-hidden='true']")];
        expect(bars.map((b) => b.className.includes("--brand"))).toEqual([true, true, false, false]);
    });

    it("clamps a current step outside the list", () => {
        render(<ProgressSteps steps={STEPS} current={9} />);
        expect(screen.getAllByRole("listitem")[3]).toHaveAttribute("aria-current", "step");
    });
});

describe("Stepper (AUTM-1594)", () => {
    const steps = ["Service", "Vehicle", "When", "Review and pay"].map((label, i) => ({ id: String(i), label }));

    it("renders the numbered list for wide screens and the bars for phones", () => {
        const { container } = render(<Stepper steps={steps} currentStep={2} ariaLabel="Booking progress" />);
        expect(container.querySelector("ol")?.className).toContain("lg:flex");
        // The bars are visually hidden from 64rem, never removed: the named
        // progressbar must exist at every width.
        const bars = container.querySelector("[role='progressbar']")!.parentElement!;
        expect(bars.className).toContain("lg:sr-only");
        expect(bars.className).not.toContain("lg:hidden");
        expect(screen.getByRole("progressbar", { name: "Booking progress" })).toHaveAttribute("aria-valuetext", "Step 3 of 4: When");
        expect(screen.getByText("When", { selector: "span" }).closest("[aria-current='step']")).not.toBeNull();
    });

    it("compact renders the bars only, at every width", () => {
        const { container } = render(<Stepper steps={steps} currentStep={2} compact />);
        expect(container.querySelector("ol")).toBeNull();
        expect(container.querySelector("[role='progressbar']")!.parentElement!.className).not.toContain("lg:hidden");
    });
});

describe("Countdown (AUTM-1594)", () => {
    it("is the sheet's band pill by default, and bare text on request", () => {
        const until = new Date(Date.now() + 4 * 3600_000).toISOString();
        const { container, rerender } = render(<Countdown until={until} />);
        expect(container.firstElementChild!.className).toContain("bg-[var(--band)]");
        expect(container.firstElementChild!.className).toContain("rounded-full");
        rerender(<Countdown until={until} appearance="text" />);
        expect(container.firstElementChild!.className).not.toContain("bg-[var(--band)]");
    });
});
