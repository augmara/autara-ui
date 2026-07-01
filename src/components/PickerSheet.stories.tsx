import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { PickerSheet, type PickerOption } from './PickerSheet'
import { Button } from './Button'

const meta: Meta = {
    title: 'Molecules/PickerSheet',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ─── Fixtures ─────────────────────────────────────────────────────────────

interface Service {
    name: string
    price: string
    duration: string
}

const SERVICES: PickerOption<Service>[] = [
    { value: 'ppf', data: { name: 'Full-body PPF', price: '$1,800', duration: '2 days' }, searchText: 'full body ppf paint protection film' },
    { value: 'ceramic', data: { name: 'Ceramic coating', price: '$650', duration: '1 day' }, searchText: 'ceramic coating' },
    { value: 'wash', data: { name: 'Express wash', price: '$45', duration: '45 min' }, searchText: 'express wash exterior' },
    { value: 'interior', data: { name: 'Interior detail', price: '$180', duration: '3 hrs' }, searchText: 'interior detail valet' },
    { value: 'correction', data: { name: 'Paint correction', price: '$420', duration: '1 day' }, searchText: 'paint correction polish' },
]

function ServiceRow({ name, price, duration }: Service) {
    return (
        <span className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm,#F5F2EA)] text-sm font-medium text-[var(--text-strong)]">
                {name.charAt(0)}
            </span>
            <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{name}</span>
                <span className="text-sm text-[var(--text-muted)]">
                    {price} · {duration}
                </span>
            </span>
        </span>
    )
}

interface Cat {
    label: string
}

const CATEGORIES: PickerOption<Cat>[] = [
    {
        value: 'exterior',
        data: { label: 'Exterior' },
        searchText: 'exterior',
        children: [
            { value: 'wash', data: { label: 'Wash & valet' }, searchText: 'wash valet' },
            { value: 'ppf', data: { label: 'Paint protection film' }, searchText: 'ppf' },
            { value: 'ceramic', data: { label: 'Ceramic coating' }, searchText: 'ceramic' },
        ],
    },
    {
        value: 'interior',
        data: { label: 'Interior' },
        searchText: 'interior',
        // Lazy-loaded subcategories (mirrors AUTM-266's lazy subcategory query).
        loadChildren: () =>
            new Promise((resolve) =>
                setTimeout(
                    () =>
                        resolve([
                            { value: 'seats', data: { label: 'Seats & upholstery' } },
                            { value: 'trim', data: { label: 'Trim & dashboard' } },
                        ]),
                    600,
                ),
            ),
    },
    { value: 'wheels', data: { label: 'Wheels & tyres' }, searchText: 'wheels tyres' },
]

function CatRow({ label }: Cat) {
    return <span className="font-medium">{label}</span>
}

// ─── Harness (PickerSheet is controlled) ──────────────────────────────────

function OpenButton({ onClick }: { onClick: () => void }) {
    return <Button onClick={onClick}>Open picker</Button>
}

// ─── Stories ──────────────────────────────────────────────────────────────

function SingleDemo() {
    const [open, setOpen] = React.useState(false)
    const [sel, setSel] = React.useState<string>()
    const chosen = SERVICES.find((s) => s.value === sel)?.data
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <p className="text-sm text-[var(--text-muted)]">
                Selected: {chosen ? chosen.name : '—'}
            </p>
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Choose a service"
                description="Pick the service for this booking."
                options={SERVICES}
                selected={sel}
                onSelect={(v) => setSel(v)}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const SingleSelect: Story = {
    name: 'Single select — services',
    render: () => <SingleDemo />,
}

function MultiDemo() {
    const [open, setOpen] = React.useState(false)
    const [sel, setSel] = React.useState<string[]>(['wash'])
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <p className="text-sm text-[var(--text-muted)]">Selected: {sel.length}</p>
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Included services"
                description="Bundle these into the package."
                mode="multi"
                options={SERVICES}
                selected={sel}
                onSelectionChange={setSel}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const MultiSelect: Story = {
    name: 'Multi select — package builder',
    render: () => <MultiDemo />,
}

function SearchDemo() {
    const [open, setOpen] = React.useState(false)
    const [sel, setSel] = React.useState<string>()
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Choose a service"
                searchable
                searchPlaceholder="Search services"
                options={SERVICES}
                selected={sel}
                onSelect={(v) => setSel(v)}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const Searchable: Story = {
    name: 'Searchable',
    render: () => <SearchDemo />,
}

function HierarchicalDemo() {
    const [open, setOpen] = React.useState(false)
    const [sel, setSel] = React.useState<string>()
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <p className="text-sm text-[var(--text-muted)]">
                Interior drills into a lazy-loaded list; Wheels selects directly.
            </p>
            <PickerSheet<Cat>
                open={open}
                onOpenChange={setOpen}
                title="Choose a category"
                searchable
                searchPlaceholder="Search categories"
                options={CATEGORIES}
                selected={sel}
                onSelect={(v) => setSel(v)}
                renderRow={(c) => <CatRow {...c} />}
            />
        </div>
    )
}
export const Hierarchical: Story = {
    name: 'Hierarchical — category drill-down (incl. lazy)',
    render: () => <HierarchicalDemo />,
}

function LoadingDemo() {
    const [open, setOpen] = React.useState(true)
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Choose a service"
                loading
                options={[]}
                onSelect={() => {}}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const LoadingState: Story = {
    name: 'Loading',
    render: () => <LoadingDemo />,
}

function ErrorDemo() {
    const [open, setOpen] = React.useState(true)
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Choose a service"
                error="We couldn't load your services — check your connection."
                onRetry={() => {}}
                options={[]}
                onSelect={() => {}}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const ErrorState: Story = {
    name: 'Error + retry',
    render: () => <ErrorDemo />,
}

function EmptyDemo() {
    const [open, setOpen] = React.useState(true)
    return (
        <div className="flex flex-col items-start gap-3">
            <OpenButton onClick={() => setOpen(true)} />
            <PickerSheet<Service>
                open={open}
                onOpenChange={setOpen}
                title="Choose a service"
                options={[]}
                emptyTitle="No active services"
                emptyDescription="Publish a service to book it."
                onSelect={() => {}}
                renderRow={(s) => <ServiceRow {...s} />}
            />
        </div>
    )
}
export const Empty: Story = {
    name: 'Empty',
    render: () => <EmptyDemo />,
}
