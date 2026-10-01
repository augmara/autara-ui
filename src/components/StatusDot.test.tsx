import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusDot } from "./StatusDot";

describe("StatusDot (AUTM-1594)", () => {
    it("says the status in words and hides the dot from assistive tech", () => {
        const { container } = render(<StatusDot tone="open">Open</StatusDot>);
        expect(screen.getByText("Open")).toBeInTheDocument();
        const dot = container.querySelector("[aria-hidden='true']");
        expect(dot).not.toBeNull();
        expect(dot!.className).toContain("size-2");
    });

    it.each([
        ["open", "--positive"],
        ["closing", "--caution"],
        ["away", "--text-subtle"],
        ["starting", "--aqua"],
    ] as const)("%s paints %s", (tone, token) => {
        const { container } = render(<StatusDot tone={tone}>State</StatusDot>);
        expect(container.querySelector("[aria-hidden='true']")!.className).toContain(`bg-[var(${token})]`);
    });
});
