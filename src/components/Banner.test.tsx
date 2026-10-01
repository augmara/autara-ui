import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Banner } from "./Banner";

describe("Banner (AUTM-1594)", () => {
    it("is a polite status with its words", () => {
        render(<Banner>No connection. We'll catch up as soon as you're back.</Banner>);
        expect(screen.getByRole("status")).toHaveTextContent("No connection");
    });

    it("is the ink capsule", () => {
        render(<Banner>Offline</Banner>);
        const cls = screen.getByRole("status").className;
        expect(cls).toContain("bg-[var(--surface-inverse)]");
        expect(cls).toContain("rounded-2xl");
    });

    it("renders the one action beside the words", () => {
        render(<Banner action={<button>Retry</button>}>Offline</Banner>);
        expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });
});
