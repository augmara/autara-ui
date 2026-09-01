import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * AUTM-936 — an intent surface has to be built from tokens, not from
 * Tailwind's own palette, because that palette is static and the canvas is
 * not.
 *
 * ErrorCard was `border-rose-200 bg-rose-50/40 text-rose-900`. Composited
 * over the dark canvas (#12101A) the tinted fill turns to a muddy grey and
 * the title measures **1.82:1**, while the retry button (`bg-white
 * text-rose-900`) punches a white slab into a dark page.
 *
 * merchant-mobile renders ErrorCard inside AppErrorBoundary, so this was
 * the app-wide crash screen: the copy explaining what broke was unreadable
 * and the retry control — the only way out — was the loudest thing on the
 * page for the wrong reason.
 *
 * Scoped to the status/async surfaces rather than the whole library, so it
 * stays a statement about intent colour rather than a blanket ban. The
 * marketing components legitimately carry one-off brand inks.
 */

const DIR = resolve(process.cwd(), 'src/components')

/** Tailwind's own ramps. Brand names (autara-*) are deliberately excluded. */
const RAW_PALETTE =
    /\b(?:bg|text|border|ring|divide|from|to|via)-(?:rose|amber|emerald|slate|zinc|indigo|teal|violet|fuchsia|orange|red|green|blue|yellow|gray|neutral|stone|pink|purple)-\d{2,3}\b/

/** Surfaces whose whole job is to communicate state. */
const INTENT_SURFACES = ['ErrorCard.tsx', 'EmptyState.tsx', 'AsyncSkeleton.tsx']

/** Strip comments — they quote the bad pattern on purpose, as documentation. */
function code(text: string): string {
    let inBlock = false
    return text
        .split('\n')
        .filter((line) => {
            const t = line.trim()
            if (t.startsWith('/*')) inBlock = true
            const was = inBlock
            if (t.endsWith('*/')) inBlock = false
            return !was && !t.startsWith('//') && !t.startsWith('*')
        })
        .join('\n')
}

describe('intent surfaces use tokens, not the Tailwind palette', () => {
    it.each(INTENT_SURFACES)('%s carries no raw Tailwind palette colour', (file) => {
        const hit = RAW_PALETTE.exec(code(readFileSync(join(DIR, file), 'utf8')))
        expect(hit?.[0] ?? null).toBeNull()
    })

    it('every intent surface it names actually exists', () => {
        const present = new Set(readdirSync(DIR))
        expect(INTENT_SURFACES.filter((f) => !present.has(f))).toEqual([])
    })
})
