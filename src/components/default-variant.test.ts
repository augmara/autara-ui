import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * AUTM-934 — a component's DEFAULT rendering has to work on the canonical
 * warm-cream canvas, because the default is what you get when you have not
 * thought about it yet.
 *
 * Four primitives failed this for months and nobody noticed, for a reason
 * worth writing down: every consumer call site passed an explicit variant
 * (`variant="light"`, a status tone), so the broken default was never on
 * screen. A trap that everyone routes around produces no bug reports — it
 * just quietly costs the next person an afternoon. Measured on #FBFAF6:
 *
 *   Badge default   text-white/60 on bg-white/[0.04]  1.03:1
 *   Card default    glass, bg-white/[0.03]            1.001:1
 *   CardDescription text-white/35 (no variant axis)   1.02:1
 *   Skeleton        bg-white/[0.06]                   1.003:1
 *
 * This is a source scan, not a render test, for the same reason
 * theme-pairing.test.ts is: jsdom has no themed stylesheet to measure
 * against, so a render assertion would pass while the real app was blank.
 *
 * The rule it encodes: a static white-alpha or raw-ink-hex class may appear
 * in a component, but never in the branch you reach by passing nothing. Dark
 * treatments have to be opt-in by name (`glass`, `dark-default`, `dark-aqua`).
 */

const DIR = resolve(process.cwd(), 'src/components')

/** Colours that do NOT track the theme and only read on an ink surface. */
const STATIC_DARK =
    /\b(?:bg|text|border|ring|divide)-white\/(?:\[[\d.]+\]|\d{1,3})|#0c0614|#1a1025|#1a1428/

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

/** Strip comments — they quote the bad pattern on purpose, as documentation. */
function code(text: string): string[] {
    let inBlock = false
    return text.split('\n').filter((line) => {
        const t = line.trim()
        if (t.startsWith('/*')) inBlock = true
        const was = inBlock
        if (t.endsWith('*/')) inBlock = false
        return !was && !t.startsWith('//') && !t.startsWith('*')
    })
}

/**
 * Pull `defaultVariants: { variant: 'x' }` out of a cva() call. Returns null
 * when the component has no variant axis, which is the common case.
 */
function defaultVariant(text: string): string | null {
    const m = /defaultVariants:\s*\{[^}]*?variant:\s*'([\w-]+)'/s.exec(text)
    return m ? m[1] : null
}

/** Pull the class string a named cva variant maps to. */
function variantClasses(text: string, name: string): string {
    // Matches both `name: 'classes'` and `name: [ 'a', 'b' ].join(' ')`.
    const quoted = new RegExp(`(?:^|\\s)'?${name}'?:\\s*(\\[[\\s\\S]*?\\]|'[^']*'|"[^"]*")`, 'm')
    const m = quoted.exec(text)
    return m ? m[1] : ''
}

describe('default variants render on the cream canvas', () => {
    it('never resolves a cva default to a static dark-only treatment', () => {
        const offenders: string[] = []
        for (const { file, text } of sources()) {
            const name = defaultVariant(text)
            if (!name) continue
            const classes = variantClasses(code(text).join('\n'), name)
            if (STATIC_DARK.test(classes)) {
                offenders.push(
                    `${file} — default variant '${name}' carries ${STATIC_DARK.exec(classes)?.[0]}`
                )
            }
        }
        expect(offenders).toEqual([])
    })

    /**
     * The four AUTM-934 components specifically. A component with no variant
     * axis at all (CardDescription, Skeleton) is not caught by the cva scan
     * above, and those were two of the four.
     */
    it.each([
        ['Card.tsx', 'CardDescription'],
        ['Skeleton.tsx', 'Skeleton'],
    ])('%s: %s uses themed tokens, not static white alpha', (file, symbol) => {
        const text = code(readFileSync(join(DIR, file), 'utf8')).join('\n')
        // Narrow to the block that declares the symbol, so an unrelated dark
        // variant elsewhere in the same file does not trip this.
        const start = text.indexOf(symbol)
        expect(start).toBeGreaterThan(-1)
        const block = text.slice(start, start + 1200)
        expect(STATIC_DARK.test(block)).toBe(false)
    })
})

/**
 * ─── AUTM-975: the shape the scan above structurally cannot see ─────────
 *
 * `Table` rendered white-on-cream for a bare `<Table>` and survived every
 * check in this file, because its default is not a cva `defaultVariants`
 * entry — it is a TypeScript PARAMETER default:
 *
 *     >(({ className, theme = 'dark', ...props }, ref) => (
 *
 * `defaultVariant()` reads `defaultVariants:` out of a `cva()` call, so a
 * parameter default is not merely missed by it, it is unreachable by that
 * technique. Two more components had the same shape and the same defect —
 * `Avatar`'s fallback and `Progress`'s track — so this was a hole in the
 * guard, not three unlucky components.
 *
 * The scan below is deliberately NOT keyed on a prop called `theme`. It
 * resolves any parameter default to the ternary branch that default selects,
 * and fails if that branch carries a static dark-only treatment. A component
 * that invents `surface = 'ink'` tomorrow is caught by the same rule.
 *
 * Two forms are resolved, because both are in the codebase:
 *
 *     theme === 'dark' ? A : B          // Table, Avatar
 *     const isDark = theme === 'dark'   // Progress
 *     isDark ? A : B
 *
 * The rule is the same one the cva scan encodes: a dark treatment has to be
 * opt-in BY NAME. What you get for passing nothing has to work on cream.
 */

/** `{ name = 'value' }` in a destructuring parameter list — not `const x = 'y'`. */
const PARAM_DEFAULT = /[{,]\s*([A-Za-z_$][\w$]*)\s*=\s*'([\w-]+)'\s*(?=[,}])/g

/** `const isDark = theme === 'dark'` — a boolean standing in for a comparison. */
const COMPARISON_ALIAS =
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*===\s*'([\w-]+)'/g

/** `cond ? 'classes' : 'classes'`, where cond is a comparison or an alias. */
const STRING_TERNARY =
    /([A-Za-z_$][\w$]*)(?:\s*===\s*'([\w-]+)')?\s*\?\s*('[^']*'|"[^"]*")\s*:\s*('[^']*'|"[^"]*")/g

/** Collapse to one line so a ternary split across lines still matches. */
function flatten(lines: string[]): string {
    return lines.join(' ').split(/\s+/).join(' ')
}

/**
 * Every branch a component renders when the caller passes nothing, paired
 * with the parameter whose default selected it.
 */
function defaultBranches(text: string): { param: string; value: string; classes: string }[] {
    const flat = flatten(code(text))

    const defaults = new Map<string, string>()
    for (const [, name, value] of flat.matchAll(PARAM_DEFAULT)) defaults.set(name, value)
    if (defaults.size === 0) return []

    // alias -> the comparison it stands for
    const aliases = new Map<string, { subject: string; literal: string }>()
    for (const [, alias, subject, literal] of flat.matchAll(COMPARISON_ALIAS)) {
        aliases.set(alias, { subject, literal })
    }

    const taken: { param: string; value: string; classes: string }[] = []
    for (const [, head, inlineLiteral, whenTrue, whenFalse] of flat.matchAll(STRING_TERNARY)) {
        const test = inlineLiteral
            ? { subject: head, literal: inlineLiteral }
            : aliases.get(head)
        if (!test) continue
        const fallback = defaults.get(test.subject)
        if (fallback === undefined) continue
        taken.push({
            param: test.subject,
            value: fallback,
            classes: fallback === test.literal ? whenTrue : whenFalse,
        })
    }
    return taken
}

describe('parameter defaults render on the cream canvas too', () => {
    it('never resolves a parameter default to a static dark-only treatment', () => {
        const offenders: string[] = []
        for (const { file, text } of sources()) {
            for (const { param, value, classes } of defaultBranches(text)) {
                const hit = STATIC_DARK.exec(classes)
                if (hit) {
                    offenders.push(
                        `${file} — \`${param} = '${value}'\` selects a branch carrying ${hit[0]}`
                    )
                }
            }
        }
        expect(
            offenders,
            'a dark treatment must be opt-in by name; passing nothing has to work on #FBFAF6'
        ).toEqual([])
    })

    /**
     * The resolver has to actually resolve something, or the assertion above
     * passes because it found no branches rather than because they were all
     * clean. `Table` is the component the ticket is about and it uses the
     * direct form; `Progress` uses the aliased form.
     */
    it.each([
        ['Table.tsx', 'theme'],
        ['Progress.tsx', 'theme'],
        ['Avatar.tsx', 'theme'],
    ])('%s: the scan reaches the branch `%s` selects', (file, param) => {
        const branches = defaultBranches(readFileSync(join(DIR, file), 'utf8'))
        expect(branches.filter((b) => b.param === param).length).toBeGreaterThan(0)
    })
})
