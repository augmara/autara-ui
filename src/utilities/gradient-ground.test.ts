import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1017 — `.gradient-ground > * { position: relative }` silently defeated
 * Tailwind's `.fixed`, `.absolute` and `.sticky` on any DIRECT child.
 *
 * This file is UNLAYERED, and unlayered CSS beats anything in
 * `@layer utilities` regardless of specificity — so the child kept its class
 * in the markup and lost the behaviour. merchant-mobile's app shell rendered
 * 1194x0: in the DOM, correct background-image, painting nothing.
 *
 * The rule was never needed. The ground is a `background-image` on the
 * element, and CSS paints a background below its own content unconditionally.
 *
 * Read as text rather than through a DOM, deliberately: jsdom does not
 * implement the cascade well enough to distinguish "unlayered beats layered"
 * from "specificity", so a DOM test here would pass for the wrong reason.
 */
const GLASS = readFileSync(resolve(process.cwd(), 'src/utilities/glass.css'), 'utf8')

/** Strip comments — the block explaining the removal names the rule, and a
 *  naive scan matches its own explanation. Exactly the failure mode that let
 *  an earlier guard in this repo pass against the defect it was written for. */
const CODE = GLASS.replace(/\/\*[\s\S]*?\*\//g, '')

describe('gradient-ground does not clobber a child position', () => {
    it('declares no blanket position on direct children', () => {
        expect(CODE).not.toMatch(/\.gradient-ground\s*>\s*\*/)
    })

    it('still paints the ground as a background-image, which is why the rule was unnecessary', () => {
        // If the blooms ever move to a ::before overlay, children WILL need a
        // stacking fix again — but a scoped one, not a blanket child rule.
        expect(CODE).toMatch(/\.gradient-ground\s*\{[^}]*background-image:/)
        expect(CODE).not.toMatch(/\.gradient-ground::(before|after)/)
    })
})
