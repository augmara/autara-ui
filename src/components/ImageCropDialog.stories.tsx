import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from './Button'
import { ImageCropDialog } from './ImageCropDialog'

/**
 * ImageCropDialog — pick-then-crop for any uploaded image.
 *
 * - Pan + zoom inside a fixed-aspect window; confirm exports a JPEG `File`.
 * - Shape-agnostic: pass `aspect` (and `cropShape="round"` for avatars).
 * - Drive `open` + `src` from the consumer; the demo wires a sample image
 *   and an "upload your own" picker so you can feel the real interaction.
 */

// Self-contained 1200×800 sample so the story needs no network.
const SAMPLE_IMAGE =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#4E1BBD"/>
                    <stop offset="1" stop-color="#22d3a6"/>
                </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#g)"/>
            <circle cx="360" cy="300" r="160" fill="#ffffff" opacity="0.85"/>
            <rect x="700" y="440" width="360" height="240" rx="24" fill="#0c0a14" opacity="0.6"/>
            <text x="60" y="740" font-family="sans-serif" font-size="48" fill="#ffffff">1200 × 800 sample</text>
        </svg>`,
    )

const meta: Meta<typeof ImageCropDialog> = {
    title: 'Components/ImageCropDialog',
    component: ImageCropDialog,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof meta>

function Demo({
    aspect,
    cropShape,
    title,
}: {
    aspect: number
    cropShape?: 'rect' | 'round'
    title: string
}) {
    const [open, setOpen] = React.useState(false)
    const [src, setSrc] = React.useState<string | null>(SAMPLE_IMAGE)
    const [resultUrl, setResultUrl] = React.useState<string | null>(null)
    const fileRef = React.useRef<HTMLInputElement>(null)

    function pickOwn(file: File) {
        const url = URL.createObjectURL(file)
        setSrc(url)
        setOpen(true)
    }

    return (
        <div className="flex w-[420px] flex-col items-start gap-4">
            <div className="flex gap-2">
                <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                    Crop sample
                </Button>
                <Button
                    variant="outline"
                    size="md"
                    onClick={() => fileRef.current?.click()}
                >
                    Upload your own
                </Button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) pickOwn(f)
                        e.target.value = ''
                    }}
                />
            </div>

            {resultUrl ? (
                <figure className="flex flex-col gap-2">
                    <figcaption className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                        Cropped result
                    </figcaption>
                    <img
                        src={resultUrl}
                        alt="cropped"
                        className={
                            cropShape === 'round'
                                ? 'h-28 w-28 rounded-full border border-[var(--border-subtle)] object-cover'
                                : 'w-[360px] rounded-xl border border-[var(--border-subtle)] object-cover'
                        }
                    />
                </figure>
            ) : null}

            <ImageCropDialog
                open={open}
                src={src}
                aspect={aspect}
                cropShape={cropShape}
                title={title}
                onCropComplete={(file) => {
                    if (resultUrl) URL.revokeObjectURL(resultUrl)
                    setResultUrl(URL.createObjectURL(file))
                    setOpen(false)
                }}
                onCancel={() => setOpen(false)}
            />
        </div>
    )
}

export const ProfilePicture: Story = {
    render: () => (
        <Demo aspect={1} cropShape="round" title="Crop your profile photo" />
    ),
}

export const CoverBanner: Story = {
    render: () => <Demo aspect={16 / 9} title="Crop your cover photo" />,
}
