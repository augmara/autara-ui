import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { FormField } from './FormField'
import { MoneyBreakdown } from './MoneyBreakdown'
import { NativeSelect } from './NativeSelect'

const meta = {
    title: 'Molecules/ConfirmDialog',
    component: ConfirmDialog,
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

function Host(props: Partial<React.ComponentProps<typeof ConfirmDialog>> & { trigger?: string }) {
    const [open, setOpen] = useState(true)
    return (
        <>
            <Button variant="glass" onClick={() => setOpen(true)}>
                {props.trigger ?? 'Open'}
            </Button>
            <ConfirmDialog
                open={open}
                title="Sign out?"
                description="You can sign back in with your email or mobile any time."
                confirmLabel="Sign out"
                onConfirm={() => setOpen(false)}
                onClose={() => setOpen(false)}
                {...props}
            />
        </>
    )
}

export const Default: Story = {
    args: {} as never,
    render: () => <Host />,
}

export const Destructive: Story = {
    args: {} as never,
    render: () => (
        <Host
            trigger="Remove vehicle"
            title="Remove Toyota Corolla from your garage?"
            description="It won't be offered at checkout any more. You can add it again later."
            confirmLabel="Remove"
            cancelLabel="Keep it"
            tone="destructive"
            testId="garage-remove"
        />
    ),
}

export const Loading: Story = {
    args: {} as never,
    render: () => (
        <Host
            title="Cancel this booking?"
            description="Your deposit is refunded under the cancellation policy."
            confirmLabel="Cancel booking"
            cancelLabel="Keep booking"
            tone="destructive"
            loading
        />
    ),
}

export const WithError: Story = {
    args: {} as never,
    render: () => (
        <Host
            title="Cancel this booking?"
            description="Your deposit is refunded under the cancellation policy."
            confirmLabel="Cancel booking"
            cancelLabel="Keep booking"
            tone="destructive"
            errorMessage="We couldn't cancel the booking. Something failed on our side, not your connection. Try again in a moment."
        />
    ),
}

export const LongCopy: Story = {
    args: {} as never,
    render: () => (
        <Host
            title="Move your booking to Saturday 14 September, 10:30am?"
            description="Your current time on Thursday 12 September at 2:00pm is released the moment you confirm, and Northside Ceramic Works is told straight away. If you change your mind after this you will need to request another time."
            confirmLabel="Move to new time"
            cancelLabel="Keep current time"
        />
    ),
}

/** In context: cancelling a booking with a reason and the refund lines. */
export const CancelBookingInContext: Story = {
    args: {} as never,
    render: () => (
        <Host
            trigger="Cancel booking"
            title="Cancel this booking?"
            description="It's 30 hours before your slot, so half the deposit comes back."
            confirmLabel="Confirm cancellation"
            cancelLabel="Keep booking"
            tone="destructive"
            testId="booking-cancel"
        >
            <div className="flex flex-col gap-4">
                <MoneyBreakdown
                    label="If you cancel now"
                    rows={[
                        { label: 'Deposit paid', value: 'A$54.00' },
                        { label: 'Cancellation fee (50%)', value: 'A$27.00', muted: true },
                    ]}
                    total={{ label: 'You get back', value: 'A$27.00' }}
                    note="Within 5 to 10 business days, depending on your bank."
                />
                <FormField label="Reason">
                    <NativeSelect placeholder="Why are you cancelling?">
                        <option value="plans">My plans changed</option>
                        <option value="price">Found a better price</option>
                        <option value="other">Something else</option>
                    </NativeSelect>
                </FormField>
            </div>
        </Host>
    ),
}
