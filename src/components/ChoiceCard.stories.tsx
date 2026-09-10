import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChoiceCard, ChoiceGroup } from './ChoiceCard'

const meta = {
    title: 'Molecules/ChoiceCard',
    component: ChoiceCard,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof ChoiceCard>

export default meta
type Story = StoryObj<typeof meta>

const Car = () => (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l1.5-5h11L19 13M4 13h16v5H4zM7 18v1.5M17 18v1.5" />
    </svg>
)

function VehicleTypes() {
    const [value, setValue] = useState<string | null>('SEDAN')
    return (
        <div className="max-w-lg">
            <ChoiceGroup name="vehicleType" value={value} onChange={setValue} legend="Type" columns={3}>
                <ChoiceCard value="SEDAN" label="Sedan" icon={<Car />} />
                <ChoiceCard value="SUV" label="SUV / Crossover" icon={<Car />} />
                <ChoiceCard value="UTE" label="Ute" icon={<Car />} />
                <ChoiceCard value="VAN" label="Van" icon={<Car />} />
                <ChoiceCard value="WAGON" label="Wagon" icon={<Car />} />
                <ChoiceCard value="OTHER" label="Something else" icon={<Car />} />
            </ChoiceGroup>
        </div>
    )
}

export const Default: Story = { args: {} as never, render: () => <VehicleTypes /> }

function Garage() {
    const [value, setValue] = useState<string | null>('v1')
    return (
        <div className="max-w-lg">
            <ChoiceGroup name="vehicle" value={value} onChange={setValue} legend="Which vehicle needs service?">
                <ChoiceCard value="v1" label="Toyota Corolla" description="2021 · ABC123 · Default" icon={<Car />} />
                <ChoiceCard value="v2" label="Mazda CX-5" description="2019 · XYZ789" icon={<Car />} />
                <ChoiceCard value="new" label="Enter a different vehicle" description="Saved to your garage for next time" />
            </ChoiceGroup>
        </div>
    )
}

export const WithDescriptions: Story = { args: {} as never, render: () => <Garage /> }

function Slots() {
    const [value, setValue] = useState<string | null>(null)
    return (
        <div className="max-w-lg">
            <ChoiceGroup name="slot" value={value} onChange={setValue} legend="Time" columns={4} error={value ? undefined : 'Please select a time slot'}>
                <ChoiceCard value="09:00" label="9:00 am" />
                <ChoiceCard value="10:30" label="10:30 am" disabled disabledLabel="Booked" />
                <ChoiceCard value="12:00" label="12:00 pm" />
                <ChoiceCard value="13:30" label="1:30 pm" />
            </ChoiceGroup>
        </div>
    )
}

export const DisabledAndError: Story = { args: {} as never, render: () => <Slots /> }

function Narrow() {
    const [value, setValue] = useState<string | null>('MOBILE')
    return (
        <div className="w-[300px]">
            <ChoiceGroup name="mode" value={value} onChange={setValue} legend="How would you like this booked?" columns={1}>
                <ChoiceCard value="MOBILE" label="Comes to you" description="The detailer drives to your address, anywhere inside their 15 km radius." />
                <ChoiceCard value="WORKSHOP" label="Visit the workshop" description="Drop the vehicle at Brunswick. The street address is shared once your deposit is paid." />
            </ChoiceGroup>
        </div>
    )
}

export const LongCopyNarrow: Story = { args: {} as never, render: () => <Narrow /> }
