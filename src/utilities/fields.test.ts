import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1594 — canvas v44 "Fields": one field family. 52px, 14px radius, a
 * 1px field edge on paper, 17px text; focus a 2px accent ring and no tint;
 * an error the danger edge; disabled a hairline at 60%. Reads the stylesheet,
 * because jsdom has none and a render assertion would pass on wrong CSS.
 */
const CSS = readFileSync(resolve(process.cwd(), 'src/utilities/forms.css'), 'utf8')

function block(selector: string): string {
    const at = CSS.indexOf(`\n${selector} {`)
    if (at < 0) throw new Error(`${selector} not found`)
    return CSS.slice(at, CSS.indexOf('}', at))
}

describe('the field family (canvas v44)', () => {
    it('.field-input is 52px, 14px, the field edge on paper, 17px', () => {
        const b = block('.field-input')
        expect(b).toContain('height: 3.25rem;')
        expect(b).toContain('border-radius: var(--radius-autara-md);')
        expect(b).toContain('border: 1px solid var(--field-edge);')
        expect(b).toContain('background: var(--paper);')
        expect(b).toContain('font-size: 1.0625rem;')
    })

    it('.field-textarea is the same field, 96px tall at least', () => {
        const b = block('.field-textarea')
        expect(b).toContain('min-height: 6rem;')
        expect(b).toContain('border: 1px solid var(--field-edge);')
        expect(b).toContain('font-size: 1.0625rem;')
    })

    it.each(['.field-input', '.field-textarea'])('%s focus is a 2px accent ring and no tint', (sel) => {
        const b = block(`${sel}:focus,\n${sel}:focus-visible`)
        expect(b).toContain('border-color: var(--accent);')
        expect(b).toContain('box-shadow: inset 0 0 0 1px var(--accent);')
        expect(b).not.toContain('background')
    })

    it.each(['.field-input', '.field-textarea'])('%s error is the danger edge', (sel) => {
        expect(block(`${sel}[aria-invalid="true"]`)).toContain('border-color: var(--danger);')
    })

    it.each(['.field-input', '.field-textarea'])('%s disabled is a hairline at 60%%', (sel) => {
        const b = block(`${sel}:disabled`)
        expect(b).toContain('border-color: var(--hairline);')
        expect(b).toContain('opacity: 0.6;')
    })

    it('no field rule sets a size in px', () => {
        const fieldRules = CSS.split('\n.').filter((r) => /^field-(input|textarea)/.test(r))
        for (const r of fieldRules) expect(r).not.toMatch(/(height|font-size|padding):\s*\d+px/)
    })
})
