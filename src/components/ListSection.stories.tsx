import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListSection, ListSectionRow } from './ListSection'

const meta: Meta<typeof ListSection> = {
    title: 'Merchant portal/ListSection',
    component: ListSection,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ListSection>

const ShopIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M3 9.5l1.5-5A1 1 0 0 1 5.5 4h13a1 1 0 0 1 1 .5L21 9.5M3 9.5h18M8 14h8M8 18h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const BellIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M6 19V13a6 6 0 0 1 12 0v6M3 19h18M9 22h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const LogoutIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12m0 0-3-3m3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const Default: Story = {
    render: () => (
        <div className="w-[480px]">
            <ListSection title="Business">
                <ListSectionRow
                    icon={<ShopIcon />}
                    label="Business profile"
                    description="Name, description, social links"
                    onTap={() => {}}
                />
                <ListSectionRow
                    icon={<BellIcon />}
                    label="Notifications"
                    description="Push, email, SMS preferences"
                    onTap={() => {}}
                />
            </ListSection>
        </div>
    ),
}

export const WithTrailingValue: Story = {
    render: () => (
        <div className="w-[480px]">
            <ListSection title="Operations">
                <ListSectionRow
                    icon={<ShopIcon />}
                    label="Payouts"
                    description="Connected to Stripe"
                    trailing="Active"
                    onTap={() => {}}
                />
                <ListSectionRow
                    icon={<BellIcon />}
                    label="Quiet hours"
                    description="9pm – 7am · weekdays"
                    trailing="Mon–Fri"
                    onTap={() => {}}
                />
            </ListSection>
        </div>
    ),
}

export const Destructive: Story = {
    name: 'Destructive row — sign out',
    render: () => (
        <div className="w-[480px]">
            <ListSection>
                <ListSectionRow
                    icon={<LogoutIcon />}
                    label="Sign out"
                    onTap={() => {}}
                    destructive
                />
            </ListSection>
        </div>
    ),
}

export const NoTitle: Story = {
    name: 'No section title',
    render: () => (
        <div className="w-[480px]">
            <ListSection>
                <ListSectionRow icon={<ShopIcon />} label="App settings" onTap={() => {}} />
                <ListSectionRow icon={<BellIcon />} label="Notifications" onTap={() => {}} />
            </ListSection>
        </div>
    ),
}

export const FullSettings: Story = {
    name: 'In context — Settings screen',
    render: () => (
        <div className="w-[480px]">
            <ListSection title="Business">
                <ListSectionRow
                    icon={<ShopIcon />}
                    label="Business profile"
                    description="Name, description, social links"
                    onTap={() => {}}
                />
                <ListSectionRow
                    icon={<BellIcon />}
                    label="Verification"
                    description="ABN, ID, business docs"
                    onTap={() => {}}
                />
            </ListSection>
            <ListSection title="Operations">
                <ListSectionRow
                    icon={<ShopIcon />}
                    label="Availability"
                    description="Hours, capacity, mobile vs in-shop"
                    onTap={() => {}}
                />
                <ListSectionRow
                    icon={<ShopIcon />}
                    label="Payouts"
                    description="Connected to Stripe"
                    trailing="Active"
                    onTap={() => {}}
                />
            </ListSection>
            <ListSection>
                <ListSectionRow
                    icon={<LogoutIcon />}
                    label="Sign out"
                    onTap={() => {}}
                    destructive
                />
            </ListSection>
        </div>
    ),
}
