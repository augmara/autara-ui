import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PickerTrigger } from "./PickerTrigger";
import { PickerSheet } from "./PickerSheet";
import { FormField } from "./FormField";

/**
 * PickerTrigger — the field that opens a PickerSheet (AUTM-1594, canvas v44
 * "Picker trigger (replaces Select)"). Looks like the field, is a button that
 * opens a dialog.
 */
const meta = {
  title: "Molecules/PickerTrigger",
  component: PickerTrigger,
  parameters: { layout: "padded" },
  args: { className: "max-w-sm" },
} satisfies Meta<typeof PickerTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithValue: Story = { args: { value: "Paint protection" } };
export const Empty: Story = { args: { placeholder: "Choose a category" } };
export const Invalid: Story = { args: { placeholder: "Choose a category", invalid: true } };
export const Disabled: Story = { args: { value: "Paint protection", disabled: true } };
export const LongValue: Story = {
  args: { value: "Paint protection film, full front with headlights and mirrors" },
};

const OPTIONS = [
  { value: "exterior", data: "Exterior" },
  { value: "ppf", data: "Paint protection" },
  { value: "interior", data: "Interior" },
];

/** In context: the trigger opens the sheet and shows what was chosen. */
export const OpensASheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("ppf");
    return (
      <FormField label="Category" htmlFor="category">
        <>
          <PickerTrigger
            id="category"
            value={OPTIONS.find((o) => o.value === value)?.data}
            open={open}
            onClick={() => setOpen(true)}
          />
          <PickerSheet
            open={open}
            onOpenChange={setOpen}
            title="Choose a category"
            options={OPTIONS}
            selected={value}
            renderRow={(label) => label}
            onSelect={(v) => {
              setValue(v);
              setOpen(false);
            }}
          />
        </>
      </FormField>
    );
  },
};
