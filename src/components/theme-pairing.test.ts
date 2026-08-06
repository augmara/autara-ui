import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * AUTM-734 — a literal colour on a THEMED background is a dark-mode bug
 * waiting to happen, and it is invisible in review because it looks correct
 * in light.
 *
 * `--text-strong` is near-black in light and near-WHITE in dark. Pairing it
 * with a hardcoded `text-white` measures 19.5:1 in light and **1.14:1** in
 * dark — the label is gone. It shipped twice (FilterChipRow's active chip,
 * MessageBubble's own-side bubble) before anyone looked at the app in dark.
 *
 * The rule: when the BACKGROUND is a theme token, the FOREGROUND must be one
 * too, so they flip together. `--surface` is `--text-strong`'s inverse and is
 * the right partner (19.5:1 light / 14.8:1 dark).
 *
 * This reads the component sources rather than rendering, because the bug is
 * a class-string pairing — jsdom has no themed stylesheet to measure against,
 * so a render test would pass while the real app was unreadable.
 */

/** Background tokens that INVERT between themes. */
const INVERTING_BG = [
    '--text-strong',
    '--text-muted',
    '--foreground',
]

/** Foreground literals that do NOT invert. */
const LITERAL_FG = /\btext-(white|black)\b/

const DIR = resolve(process.cwd(), 'src/components')

function sources(): { file: string; text: string }[] {
    return readdirSync(DIR)
        .filter((f) => f.endsWith('.tsx') && !f.includes('.stories.'))
        .map((f) => ({ file: f, text: readFileSync(join(DIR, f), 'utf8') }))
}

describe('theme pairing', () => {
    it('never puts a literal text colour on an inverting background token', () => {
        const offenders: string[] = []
        for (const { file, text } of sources()) {
            text.split('\n').forEach((line, i) => {
                // Comments explain the rule and quote the bad pattern on
                // purpose — they are documentation, not shipped classes.
                const code = line.trim()
                if (code.startsWith('*') || code.startsWith('//')) return
                const bg = INVERTING_BG.find((t) => line.includes(`bg-[var(${t})]`))
                if (bg && LITERAL_FG.test(line)) {
                    offenders.push(`${file}:${i + 1} — ${bg} + ${LITERAL_FG.exec(line)?.[0]}`)
                }
            })
        }
        expect(offenders).toEqual([])
    })
})
