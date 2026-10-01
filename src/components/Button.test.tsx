import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonVariants } from "./Button";

describe("Button — base rendering", () => {
    it("renders the children label", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("defaults to type='button' (prevents accidental form submission)", () => {
        render(<Button>Cancel</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("honours an explicit type='submit'", () => {
        render(<Button type="submit">Save</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("applies the disabled attribute and disabled:opacity utility", () => {
        render(<Button disabled>Disabled</Button>);
        const btn = screen.getByRole("button");
        expect(btn).toBeDisabled();
        expect(btn.className).toMatch(/disabled:opacity/);
    });

    it("applies fullWidth → w-full utility", () => {
        render(<Button fullWidth>Wide</Button>);
        expect(screen.getByRole("button").className).toMatch(/\bw-full\b/);
    });

    it("renders leadingIcon and trailingIcon alongside the label", () => {
        render(
            <Button
                leadingIcon={<span data-testid="lead">L</span>}
                trailingIcon={<span data-testid="trail">T</span>}
            >
                Label
            </Button>,
        );
        expect(screen.getByTestId("lead")).toBeInTheDocument();
        expect(screen.getByTestId("trail")).toBeInTheDocument();
    });

    it("forwards arbitrary aria-* attributes for accessibility", () => {
        render(
            <Button aria-label="Save changes" aria-pressed="true">
                Save
            </Button>,
        );
        const btn = screen.getByRole("button");
        expect(btn).toHaveAttribute("aria-label", "Save changes");
        expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    it("merges className overrides via cn", () => {
        render(<Button className="custom-class">Mix</Button>);
        expect(screen.getByRole("button").className).toMatch(/custom-class/);
    });
});

describe("Button — variant + size styling", () => {
    /**
     * Asserts each variant is TOKEN-DRIVEN and DISTINCT — not that it uses one
     * specific token name.
     *
     * Naming the token made this the most fragile test in the suite: it broke
     * twice in one afternoon as the dark-mode work renamed things underneath
     * it (`--color-autara-purple` → `--accent-fill`, then `--surface-inverse`
     * → `--cta-fill`), both times with nothing actually wrong. A stale
     * assertion that reads as a failure is worse than no assertion — the
     * second break went out on a red main because the noise was assumed.
     *
     * What actually matters, and what breaks if a variant loses its styling:
     * every variant paints from a custom property (so it themes), and no two
     * variants collapse to the same look.
     */
    // AUTM-1594: the sheet's variants. Legacy names are covered below.
    const VARIANTS = [
        "primary",
        "strong",
        "quiet",
        "ondeep",
        "link",
        "ghost",
    ] as const;

    const FILLED = ["primary", "strong", "quiet", "ondeep"] as const;

    it.each(FILLED)("variant=%s paints from a theme token", (variant) => {
        render(<Button variant={variant}>X</Button>);
        // bg-[var(--x)] or a themed palette utility (bg-rose-600) — either
        // way it must not be an ad-hoc literal.
        expect(screen.getByRole("button").className).toMatch(
            /\bbg-\[(var\(--[a-z-]+\)|rgba\(255,255,255,0\.\d+\))\]/,
        );
    });

    it("gives every variant a distinct look", () => {
        const seen = VARIANTS.map((variant) => {
            const { container } = render(<Button variant={variant}>X</Button>);
            return container.querySelector("button")!.className;
        });
        expect(new Set(seen).size).toBe(VARIANTS.length);
    });

    /*
     * AUTM-915 — sizes moved from a fixed `h-*` to `min-h-*` so a label can
     * wrap instead of overflowing at large text scale. The rendered height
     * at normal scale is unchanged; only the utility name moved.
     */
    // AUTM-1594, canvas v44: sm 44, md 48, lg 52, icon a 44px disc.
    it.each([
        ["sm", /\bmin-h-11\b/],
        ["md", /\bmin-h-12\b/],
        ["lg", /\bmin-h-13\b/],
        ["icon", /\bsize-11\b/],
    ] as const)("size=%s applies the right height utility", (size, pattern) => {
        render(<Button size={size}>X</Button>);
        expect(screen.getByRole("button").className).toMatch(pattern);
    });

    it("size='default' resolves to size='md' (legacy alias)", () => {
        render(<Button size="default">X</Button>);
        expect(screen.getByRole("button").className).toMatch(/\bmin-h-12\b/);
    });

    /**
     * Each legacy name renders exactly as the sheet variant that does its job,
     * so a consumer bump changes the look and nothing else. `destructive` is
     * `strong`: the sheet has no red button.
     */
    it.each([
        ["dark", "strong"],
        ["destructive", "strong"],
        ["light-destructive", "strong"],
        ["acid", "primary"],
        ["light-primary", "primary"],
        ["outline", "quiet"],
        ["secondary", "quiet"],
        ["glass", "quiet"],
        ["light", "quiet"],
        ["light-outline", "quiet"],
        ["light-secondary", "quiet"],
        ["light-ghost", "ghost"],
        ["light-link", "link"],
    ] as const)("legacy variant=%s renders as %s", (legacy, sheet) => {
        expect(buttonVariants({ variant: legacy })).toBe(buttonVariants({ variant: sheet }));
    });

    it("no variant paints a red fill", () => {
        for (const v of ["destructive", "light-destructive"] as const) {
            expect(buttonVariants({ variant: v })).not.toMatch(/rose|red|danger/);
        }
    });

    it("primary is lime with ink, the sheet's one action", () => {
        expect(buttonVariants()).toMatch(/bg-\[var\(--lime\)\]/);
        expect(buttonVariants()).toMatch(/text-\[var\(--on-lime\)\]/);
    });

    it("link has no padding but keeps the 44px floor", () => {
        const cls = buttonVariants({ variant: "link", size: "sm" });
        expect(cls).toMatch(/\bpx-0\b/);
        expect(cls).toMatch(/\bmin-h-11\b/);
    });

    it.each([
        "light",
        "light-primary",
        "light-outline",
        "light-ghost",
        "light-secondary",
        "light-destructive",
        "light-link",
    ] as const)("legacy variant=%s still renders without error", (variant) => {
        render(<Button variant={variant}>X</Button>);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});

describe("Button — interaction", () => {
    it("fires onClick when clicked", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Press</Button>);
        await user.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does NOT fire onClick when disabled", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick} disabled>Press</Button>);
        await user.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("activates with Enter via keyboard", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Press</Button>);
        screen.getByRole("button").focus();
        await user.keyboard("{Enter}");
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("activates with Space via keyboard", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Press</Button>);
        screen.getByRole("button").focus();
        await user.keyboard(" ");
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

describe("Button — asChild polymorphism (Radix Slot)", () => {
    it("renders as an <a> tag when wrapping an anchor via asChild", () => {
        render(
            <Button asChild>
                <a href="https://autara.au">Open</a>
            </Button>,
        );
        const link = screen.getByRole("link", { name: "Open" });
        expect(link.tagName).toBe("A");
        expect(link).toHaveAttribute("href", "https://autara.au");
    });

    it("does NOT render leading/trailing icons when asChild (Slot forwards children directly)", () => {
        render(
            <Button asChild leadingIcon={<span data-testid="should-not-render" />}>
                <a href="/x">Link</a>
            </Button>,
        );
        expect(screen.queryByTestId("should-not-render")).not.toBeInTheDocument();
    });
});

/**
 * AUTM-915 — the label has to be able to wrap. These pin the class-level
 * contract, since jsdom has no layout and cannot measure the overflow that
 * was actually reported.
 */
describe("Button — long labels at large text scale", () => {
    it("does not pin whitespace-nowrap, so a long label can wrap", () => {
        render(<Button>Go to your dashboard</Button>);
        expect(screen.getByRole("button").className).not.toMatch(
            /\bwhitespace-nowrap\b/,
        );
    });

    it("lets a consumer opt back into nowrap via className", () => {
        render(<Button className="whitespace-nowrap">Save</Button>);
        expect(screen.getByRole("button").className).toMatch(
            /\bwhitespace-nowrap\b/,
        );
    });

    it.each(["sm", "md", "lg"] as const)(
        "size=%s grows rather than clipping — min-h, never a fixed h",
        (size) => {
            const cls = buttonVariants({ size });
            expect(cls).toMatch(/\bmin-h-\d+\b/);
            // A bare `h-N` alongside `min-h-N` would re-freeze the box.
            expect(cls).not.toMatch(/(?:^|\s)h-\d+(?:\s|$)/);
        },
    );

    it("clamps horizontal padding against the viewport, not just the root size", () => {
        // Padding in rem doubles with the text at 200%; on a narrow screen an
        // un-clamped px-5 crowds the label out of its own box.
        expect(buttonVariants({ size: "md" })).toMatch(/px-\[min\(/);
    });

    it("keeps the icon disc square and unshrinkable", () => {
        const cls = buttonVariants({ size: "icon" });
        expect(cls).toMatch(/\bsize-11\b/);
        expect(cls).toMatch(/\bshrink-0\b/);
    });
});

describe("buttonVariants — legacy CVA helper", () => {
    it("returns the same className as a rendered Button", () => {
        render(<Button variant="strong" size="lg">X</Button>);
        expect(screen.getByRole("button").className).toBe(
            buttonVariants({ variant: "strong", size: "lg" }),
        );
    });

    it("defaults to primary + md when no opts provided", () => {
        expect(buttonVariants()).toBe(buttonVariants({ variant: "primary", size: "md" }));
        expect(buttonVariants()).toMatch(/\bmin-h-12\b/);
    });

    it("resolves size='default' to md", () => {
        expect(buttonVariants({ size: "default" })).toBe(buttonVariants({ size: "md" }));
    });

    it("appends a custom className", () => {
        const cls = buttonVariants({ className: "extra" });
        expect(cls).toMatch(/extra/);
    });
});

describe("Button — busy (AUTM-1594)", () => {
    it("keeps the label, shows a ring, and says it is busy", () => {
        const { container } = render(<Button busy>Saving</Button>);
        const btn = screen.getByRole("button", { name: "Saving" });
        expect(btn).toHaveAttribute("aria-busy", "true");
        expect(btn).toBeDisabled();
        expect(container.querySelector(".animate-spin")).not.toBeNull();
    });

    it("puts the ring where the leading icon was", () => {
        render(
            <Button busy leadingIcon={<span data-testid="lead">L</span>}>
                Save
            </Button>,
        );
        expect(screen.queryByTestId("lead")).not.toBeInTheDocument();
    });

    it("does not fire onClick while busy", async () => {
        const onClick = vi.fn();
        render(
            <Button busy onClick={onClick}>
                Save
            </Button>,
        );
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("stays at full strength rather than the disabled 45%", () => {
        expect(buttonVariants()).toMatch(/aria-busy:disabled:opacity-100/);
        expect(buttonVariants()).toMatch(/disabled:opacity-45/);
    });
});
