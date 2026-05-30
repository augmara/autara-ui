import type { Meta, StoryObj } from '@storybook/react-vite'
import { ModeChip } from './ModeChip'

const meta: Meta<typeof ModeChip> = {
    title: 'Merchant portal/ModeChip',
    component: ModeChip,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof ModeChip>

export const Mobile: Story = { args: { mode: 'MOBILE' } }
export const InShop: Story = { args: { mode: 'IN_SHOP' } }
export const Small: Story = { args: { mode: 'MOBILE', size: 'sm' } }
export const IconOnly: Story = { args: { mode: 'MOBILE', iconOnly: true } }

export const Pair: Story = {
    name: 'Pair — Mobile + In-shop',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex items-center gap-3">
            <ModeChip mode="MOBILE" />
            <ModeChip mode="IN_SHOP" />
            <ModeChip mode="MOBILE" size="sm" />
            <ModeChip mode="IN_SHOP" size="sm" />
        </div>
    ),
}
