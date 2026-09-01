import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * THE SHAPE LANGUAGE — Don, 2026-09-01. Two families, and only two.
 *
 *   1. SHARED RADIUS — input, button, chip, card, panel. "A surface or a
 *      control." `--radius-autara-md` (14px) is the pair rung: a button and
 *      the field beside it are ONE control group (type, then act), so they
 *      take the same corner. A pill next to a rounded rectangle reads as two
 *      unrelated objects that happen to be adjacent. Cards go one step larger
 *      (16px); chips one step tighter (8px).
 *   2. ROUNDED PARALLELOGRAM — status, and only status. That is `Badge`.
 *
 * The point of buttons giving up the pill is what it leaves behind: the only
 * fully-round things are AVATARS, INDICATOR DOTS, and the small status
 * markers Don kept deliberately. Round therefore means "a person, a state
 * light, or a status marker" and never "an action".
 *
 * That meaning is a finite resource. Every new `rounded-full` spends it, so
 * this test makes spending it a deliberate act with a name attached rather
 * than a default reach.
 *
 * A source scan, in the shape of `default-variant.test.ts`, and for the same
 * reason: jsdom has no stylesheet, so a render assertion would pass while the
 * real app was wrong.
 */

const DIR = resolve(process.cwd(), 'src/components')

/**
 * Files allowed to use `rounded-full`, each with the reason. Two groups.
 *
 * KEEPS — these ARE the reserved meanings, and they are why the rule is worth
 * having. Removing an entry here would be the change that needs arguing.
 */
const KEEPS: Record<string, string> = {
    'Avatar.tsx': 'a person',
    'Radio.tsx': 'the selected dot and its ring — a state light',
    'Switch.tsx': 'a physical toggle: round track, round thumb. State, not an action',
    'Progress.tsx': 'a state bar; the round cap is what makes it read as fill',
    'AsyncSkeleton.tsx': 'shape-matches the avatar it stands in for while loading',
    'Badge.tsx': 'shape="pill" — kept deliberately by Don under AUTM-211 for dense rows where the tilt crowds. A small status object, not an action',
    // Arrived via AUTM-936, which merged after AUTM-948 was branched — this
    // guard caught it on the merge rather than after it shipped, which is the
    // whole reason the list exists.
    'ErrorCard.tsx': 'the 32px icon medallion — a state light, not the retry button. The retry button itself takes the shared radius',
}

/**
 * NOT YET MIGRATED — AUTM-948 moved the five primitives in its scope
 * (Button, Input, MetaChip, FilterChipRow, plus the `.btn-*` CSS classes).
 * These are the rest, listed rather than silently permitted so the remaining
 * sweep is visible and can only shrink.
 *
 * `Toast.tsx` is NOT a simple carry-over: the Torph ink capsule is documented
 * in the `autara-aesthetic` skill as "Always rounded-full. Never rounded-xl
 * for a capsule." A floating status capsule is arguably a status marker and
 * arguably a surface. That one needs Don, not a sweep.
 */
const PENDING: Record<string, string> = {
    'Toast.tsx': 'Torph ink capsule — conflicts with a documented grammar, needs Don',
    'BackButton.tsx': 'circular icon button — an action, should move',
    'CarouselHeader.tsx': 'prev/next icon buttons — actions, should move',
    'Dialog.tsx': 'close button — an action, should move',
    'Sheet.tsx': 'close button — an action, should move',
    'ImageCropDialog.tsx': 'range-slider track — a state bar, likely a keep',
    'MultiSelect.tsx': 'value chips + clear button — chips go to 8px',
    'EmptyState.tsx': 'icon medallion — decorative, likely a keep',
    'MerchantCard.tsx': 'overlay control — should move',
    'StepCard.tsx': 'step numeral medallion — a numeral in a circle, likely a keep',
    'Stepper.tsx': 'step dots and connectors — indicator dots, likely a keep',
}

function sources(): { file: string; text: string }[] {
    return readdirSync(DIR)
        .filter(
            (f) =>
                f.endsWith('.tsx') &&
                !f.includes('.stories.') &&
                !f.includes('.test.')
        )
        .map((f) => ({ file: f, text: readFileSync(join(DIR, f), 'utf8') }))
}

/**
 * An INDICATOR DOT is a permitted round element anywhere, including inside a
 * component that is otherwise on the shared radius — a status dot on a chip
 * is precisely the meaning `rounded-full` is being reserved for.
 *
 * A dot is SQUARE and SMALL: matching `h-N w-N` at 0.75rem or under. Both
 * halves matter.
 *
 * The size test alone is not enough, and this is not hypothetical — the first
 * version of this helper matched on height only, and cleared
 * `ImageCropDialog`'s range-slider TRACK (`h-1.5 flex-1 rounded-full`) as a
 * dot. A 1.5-unit-tall bar stretched across a dialog is the opposite of a
 * dot; it only shared its height. Requiring the matching width is what tells
 * a state light apart from a track.
 */
function isDot(line: string): boolean {
    const h = /\bh-(\d+(?:\.\d+)?)\b/.exec(line)
    const w = /\bw-(\d+(?:\.\d+)?)\b/.exec(line)
    if (!h || !w || h[1] !== w[1]) return false
    return Number(h[1]) <= 3
}

/** Lines that use `rounded-full` on something that is not a dot. */
function roundNonDots(text: string): string[] {
    return code(text)
        .split('\n')
        .filter((l) => /\brounded-full\b/.test(l) && !isDot(l))
        .map((l) => l.trim())
}

/** Strip comments — they quote the banned class on purpose, as documentation. */
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

describe('round means a person, a state light, or a status marker — never an action', () => {
    it('no component reaches for rounded-full without being on a list', () => {
        const unlisted = sources()
            .filter(({ file, text }) => {
                if (file in KEEPS || file in PENDING) return false
                return roundNonDots(text).length > 0
            })
            .map(({ file }) => file)

        expect(
            unlisted,
            'add the file to KEEPS with a reason, or move it to the shared radius'
        ).toEqual([])
    })

    /**
     * The migrated set, pinned individually. A regression here is the exact
     * thing Don flagged: a fully-round purple button sitting next to a
     * rounded-rectangle input.
     */
    it.each([
        ['Button.tsx', 'rounded-autara-md'],
        ['MetaChip.tsx', 'rounded-autara-sm'],
        ['FilterChipRow.tsx', 'rounded-autara-sm'],
    ])('%s carries %s, and any round left on it is a dot', (file, radius) => {
        const text = readFileSync(join(DIR, file), 'utf8')
        expect(code(text)).toContain(radius)
        // MetaChip keeps a round STATUS DOT, and should — that is the
        // reserved meaning, not a leftover. The container is what had to move.
        expect(roundNonDots(text)).toEqual([])
    })

    /**
     * The 48px button pairs with the 48px field, not with the 44px one.
     * "Same-height elements get the same radius" is the part of the rule that
     * is easiest to lose in a later refactor, because it looks like an
     * inconsistency until you put the two controls side by side.
     */
    it('Button size="lg" steps up to the 48px field radius', () => {
        const text = code(readFileSync(join(DIR, 'Button.tsx'), 'utf8'))
        // `min-h-12`, not `h-12`: AUTM-915 replaced every fixed height so a
        // label wraps and the box grows at 200% text scale instead of
        // overflowing. What this test guards is the RADIUS pairing, so it
        // must not re-pin the height AUTM-915 deliberately removed.
        expect(text).toMatch(/lg:\s*"min-h-12 rounded-autara-lg/)
    })

    /**
     * The list of pending files is allowed to shrink and never to grow. If
     * someone migrates one, this fails and tells them to delete the entry —
     * which is the only way a "we'll get to it" list ever gets shorter.
     */
    it('every PENDING file still actually uses rounded-full', () => {
        const stale = Object.keys(PENDING).filter(
            (f) => roundNonDots(readFileSync(join(DIR, f), 'utf8')).length === 0
        )
        expect(stale, 'migrated — remove these from PENDING').toEqual([])
    })
})

/**
 * The CSS side of the same rule. `.btn-*` are buttons and take the shared
 * control radius; `.section-pill*` are status/label markers and keep `full`.
 * The two live in one file, so a careless find-and-replace across it would
 * take out the carve-out along with the fix.
 */
describe('the CSS button classes follow the same rule', () => {
    const CSS = readFileSync(
        resolve(process.cwd(), 'src/utilities/buttons.css'),
        'utf8'
    )

    it.each(['.btn-primary', '.btn-outline', '.btn-outline-light'])(
        '%s uses the shared control radius',
        (sel) => {
            const block = CSS.slice(CSS.indexOf(`${sel} {`))
            expect(block.slice(0, block.indexOf('}'))).toContain(
                'var(--radius-autara-md)'
            )
        }
    )

    it.each(['.section-pill', '.section-pill-light'])(
        '%s keeps full — a status marker, not an action',
        (sel) => {
            const block = CSS.slice(CSS.indexOf(`${sel} {`))
            expect(block.slice(0, block.indexOf('}'))).toContain(
                'var(--radius-autara-full)'
            )
        }
    )
})
