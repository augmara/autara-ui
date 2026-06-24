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
    it.each([
        ["primary", /color-autara-purple/],
        ["dark", /text-strong/],
        ["outline", /border-subtle/],
        ["secondary", /surface-elevated/],
        ["destructive", /rose-600/],
        ["acid", /color-autara-lime-bright/],
    ] as const)("variant=%s applies its colour token", (variant, pattern) => {
        render(<Button variant={variant}>X</Button>);
        expect(screen.getByRole("button").className).toMatch(pattern);
    });

    it.each([
        ["sm", /\bh-9\b/],
        ["md", /\bh-11\b/],
        ["lg", /\bh-12\b/],
        ["icon", /\bh-10\b/],
    ] as const)("size=%s applies the right height utility", (size, pattern) => {
        render(<Button size={size}>X</Button>);
        expect(screen.getByRole("button").className).toMatch(pattern);
    });

    it("size='default' resolves to size='md' (legacy alias)", () => {
        render(<Button size="default">X</Button>);
        expect(screen.getByRole("button").className).toMatch(/\bh-11\b/);
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

describe("buttonVariants — legacy CVA helper", () => {
    it("returns the same className as a rendered Button", () => {
        const cls = buttonVariants({ variant: "primary", size: "md" });
        expect(cls).toMatch(/color-autara-purple/);
        expect(cls).toMatch(/\bh-11\b/);
    });

    it("defaults to primary + md when no opts provided", () => {
        const cls = buttonVariants();
        expect(cls).toMatch(/color-autara-purple/);
        expect(cls).toMatch(/\bh-11\b/);
    });

    it("resolves size='default' to md", () => {
        const cls = buttonVariants({ size: "default" });
        expect(cls).toMatch(/\bh-11\b/);
    });

    it("appends a custom className", () => {
        const cls = buttonVariants({ className: "extra" });
        expect(cls).toMatch(/extra/);
    });
});
