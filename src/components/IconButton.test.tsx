import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CloseButton, IconButton } from "./IconButton";

describe("IconButton (AUTM-1594)", () => {
    it("is named by its label, not by its icon", () => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="Remove vehicle" />);
        expect(screen.getByRole("button", { name: "Remove vehicle" })).toBeInTheDocument();
    });

    // AUTM-1756: a FILLED disc, never a bare glyph or a band ring.
    it("is a 44px neutral disc by default, 48px to a finger, with a 20px glyph", () => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="Remove" />);
        const btn = screen.getByRole("button");
        const cls = btn.className;
        expect(cls).toMatch(/\bsize-11\b/);
        expect(cls).toContain("pointer-coarse:size-12");
        expect(cls).toContain("[&_svg]:size-5");
        expect(cls).toMatch(/\brounded-full\b/);
        expect(cls).toContain("bg-[var(--icon-disc)]");
        expect(cls).toContain("text-[var(--on-icon-disc)]");
        expect(cls).not.toContain("bg-transparent");
        expect(cls).not.toContain("bg-[var(--band)]");
        expect(btn).toHaveAttribute("data-tone", "neutral");
    });

    it("size lg is 48px with a 24px glyph", () => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="Close" size="lg" />);
        const cls = screen.getByRole("button").className;
        expect(cls).toMatch(/\bsize-12\b/);
        expect(cls).toContain("[&_svg]:size-6");
        expect(cls).not.toContain("[&_svg]:size-5");
    });

    it.each([
        ["neutral", "bg-[var(--icon-disc)]", "not-disabled:hover:bg-[var(--icon-disc-hover)]", "not-disabled:active:bg-[var(--icon-disc-press)]"],
        ["onbrand", "bg-[var(--icon-disc-onbrand)]", "not-disabled:hover:bg-[var(--icon-disc-onbrand-hover)]", "not-disabled:active:bg-[var(--icon-disc-onbrand-press)]"],
        ["strong", "bg-[var(--strong)]", "not-disabled:hover:bg-[var(--strong-hover)]", "not-disabled:active:bg-[var(--strong-hover)]"],
    ] as const)("tone=%s fills, hovers and presses from its tokens", (tone, fill, hover, press) => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="X" tone={tone} />);
        const cls = screen.getByRole("button").className;
        for (const c of [fill, hover, press]) expect(cls).toContain(c);
    });

    it.each([
        ["quiet", "neutral"],
        ["ghost", "neutral"],
        ["ondeep", "onbrand"],
        ["strong", "strong"],
    ] as const)("the old variant=%s draws tone %s, so no consumer is left with a bare glyph", (variant, tone) => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="X" variant={variant} />);
        expect(screen.getByRole("button")).toHaveAttribute("data-tone", tone);
    });

    it("tone wins over the old variant", () => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="X" variant="strong" tone="onbrand" />);
        expect(screen.getByRole("button")).toHaveAttribute("data-tone", "onbrand");
    });

    it("presses (motion-press) and keeps Button's one focus ring", () => {
        render(<IconButton icon={<svg aria-hidden="true" />} label="X" />);
        const cls = screen.getByRole("button").className;
        expect(cls).toContain("motion-press");
        expect(cls).toContain("focus-visible:ring-[var(--accent)]");
    });

    it("draws the badge without adding it to the accessible name", () => {
        render(
            <IconButton
                icon={<svg aria-hidden="true" />}
                label="Notifications, 12 unread"
                badge={<span>12</span>}
            />,
        );
        expect(screen.getByRole("button", { name: "Notifications, 12 unread" })).toBeInTheDocument();
        expect(screen.getByText("12").closest("[aria-hidden]")).not.toBeNull();
    });

    it("fires onClick and honours disabled", async () => {
        const onClick = vi.fn();
        const { rerender } = render(<IconButton icon={<svg />} label="Remove" onClick={onClick} />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
        rerender(<IconButton icon={<svg />} label="Remove" onClick={onClick} disabled />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

describe("CloseButton (AUTM-1756)", () => {
    it("is named Close by default, and by its label when given", () => {
        const { rerender } = render(<CloseButton />);
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
        rerender(<CloseButton label="Close dialog" />);
        expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
    });

    it("is the neutral disc with the cross, and passes data-testid through", () => {
        render(<CloseButton data-testid="sheet-close" />);
        const btn = screen.getByTestId("sheet-close");
        expect(btn).toHaveAttribute("data-tone", "neutral");
        expect(btn.querySelector("svg path")?.getAttribute("d")).toBe("M5.5 5.5l13 13M18.5 5.5l-13 13");
    });
});
