import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PickerTrigger } from "./PickerTrigger";
import { Label } from "./Label";

describe("PickerTrigger (AUTM-1594)", () => {
    it("announces that it opens a dialog, and whether it is open", () => {
        const { rerender } = render(<PickerTrigger value="Paint protection" />);
        const btn = screen.getByRole("button");
        expect(btn).toHaveAttribute("aria-haspopup", "dialog");
        expect(btn).toHaveAttribute("aria-expanded", "false");
        rerender(<PickerTrigger value="Paint protection" open />);
        expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    it("is named by its label and reads its value", () => {
        render(
            <>
                <Label htmlFor="cat">Category</Label>
                <PickerTrigger id="cat" value="Paint protection" />
            </>,
        );
        expect(screen.getByRole("button", { name: "Category" })).toHaveTextContent("Paint protection");
    });

    it("shows the placeholder in subtle ink when empty", () => {
        render(<PickerTrigger placeholder="Choose a category" />);
        const text = screen.getByText("Choose a category");
        expect(text.className).toContain("text-[var(--text-subtle)]");
    });

    it("marks itself invalid", () => {
        render(<PickerTrigger invalid />);
        expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
    });

    it("opens on click and not when disabled", async () => {
        const onClick = vi.fn();
        const { rerender } = render(<PickerTrigger onClick={onClick} />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
        rerender(<PickerTrigger onClick={onClick} disabled />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
