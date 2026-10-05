import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/* AUTM-1739: the scrollbar rules are CSS only, so these hold the contract
   the story shows: standard properties from tokens, a WebKit fallback,
   nothing under forced colours, and nothing hidden. */
const rules = readFileSync(join(__dirname, 'scrollbars.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const tokens = readFileSync(join(__dirname, '..', 'tokens', 'scrollbar.css'), 'utf8')

describe('scrollbars', () => {
    it('are in the base layer, so a consumer rule still wins', () => {
        expect(rules).toMatch(/@layer base\s*\{/)
    })

    it('use the standard properties, from the tokens', () => {
        expect(rules).toMatch(/scrollbar-width:\s*thin;/)
        expect(rules).toMatch(/scrollbar-color:\s*var\(--scrollbar-thumb\) var\(--scrollbar-track\);/)
        expect(rules).toMatch(/scrollbar-color:\s*var\(--scrollbar-thumb-hover\) var\(--scrollbar-track\);/)
    })

    it('fall back to ::-webkit-scrollbar with the same colours', () => {
        expect(rules).toMatch(/::-webkit-scrollbar-thumb\s*\{[^}]*var\(--scrollbar-thumb\)/)
        expect(rules).toMatch(/::-webkit-scrollbar-thumb:hover\s*\{[^}]*var\(--scrollbar-thumb-hover\)/)
    })

    it('leave the system scrollbars alone under forced colours', () => {
        expect(rules).toMatch(/@media \(forced-colors: none\)/)
        // Every rule sits inside that guard: nothing styles a scrollbar outside it.
        const outside = rules.replace(/@layer base\s*\{\s*@media \(forced-colors: none\)\s*\{[\s\S]*\}\s*\}\s*$/, '')
        expect(outside).not.toMatch(/scrollbar/)
    })

    it('never hide a scrollbar', () => {
        expect(rules).not.toMatch(/scrollbar-width:\s*none/)
        expect(rules).not.toMatch(/display:\s*none/)
    })

    it('take a lighter purple on a brand-deep ground, on a transparent track', () => {
        expect(rules).toMatch(/\.scroll-on-deep,\s*\[data-ground="deep"\]/)
        expect(tokens).toMatch(/--scrollbar-track:\s*transparent;/)
        expect(tokens).toMatch(/--scrollbar-thumb-deep:\s*color-mix\(in srgb, var\(--brand\) \d+%, var\(--on-deep\)\);/)
    })

    it('are imported by the token and utility entry points', () => {
        const tokenIndex = readFileSync(join(__dirname, '..', 'tokens', 'index.css'), 'utf8')
        const utilIndex = readFileSync(join(__dirname, 'index.css'), 'utf8')
        expect(tokenIndex).toContain('@import "./scrollbar.css";')
        expect(utilIndex).toContain('@import "./scrollbars.css";')
    })
})
