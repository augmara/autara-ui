import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField } from './FormField'
import { NativeSelect } from './NativeSelect'

const meta = {
    title: 'Atoms/NativeSelect',
    component: NativeSelect,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

const makes = ['Toyota', 'Mazda', 'Hyundai', 'Ford', 'Tesla']

export const Default: Story = {
    render: () => (
        <div className="max-w-sm">
            <NativeSelect placeholder="Choose a make" aria-label="Make">
                {makes.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </NativeSelect>
        </div>
    ),
}

export const InAFormField: Story = {
    render: () => (
        <div className="flex max-w-sm flex-col gap-4">
            <FormField label="Make" required>
                <NativeSelect placeholder="Choose a make">
                    {makes.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </NativeSelect>
            </FormField>
            <FormField label="Reason" error="Pick a reason so the pro knows what happened.">
                <NativeSelect placeholder="Why are you cancelling?">
                    <option value="plans">My plans changed</option>
                    <option value="price">Found a better price</option>
                    <option value="other">Something else</option>
                </NativeSelect>
            </FormField>
        </div>
    ),
}

export const Sizes: Story = {
    render: () => (
        <div className="flex max-w-sm flex-col gap-4">
            <NativeSelect aria-label="State" defaultValue="VIC">
                <option value="VIC">VIC</option>
                <option value="NSW">NSW</option>
            </NativeSelect>
            <NativeSelect size="lg" aria-label="State, large" defaultValue="VIC">
                <option value="VIC">VIC</option>
                <option value="NSW">NSW</option>
            </NativeSelect>
            <NativeSelect aria-label="Disabled" disabled defaultValue="VIC">
                <option value="VIC">VIC</option>
            </NativeSelect>
        </div>
    ),
}
