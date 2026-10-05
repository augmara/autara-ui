import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageContainer } from './PageContainer'

const css = (file: string) => readFileSync(join(__dirname, '..', file), 'utf8')

describe('PageContainer', () => {
    it('renders the page track as the element asked for', () => {
        render(
            <PageContainer as="section" data-testid="track" aria-label="Pricing">
                Content
            </PageContainer>
        )
        const el = screen.getByTestId('track')
        expect(el.tagName).toBe('SECTION')
        expect(el).toHaveClass('page-container')
        expect(el).toHaveTextContent('Content')
    })

    it('keeps running text to the measure when asked', () => {
        render(
            <PageContainer measure data-testid="track">
                <p>Long text</p>
            </PageContainer>
        )
        expect(screen.getByTestId('track').firstElementChild).toHaveClass('page-measure')
    })

    it('grows to 1440px of content with a gutter from 16px to 96px, and a 68ch measure', () => {
        const tokens = css('tokens/layout.css')
        expect(tokens).toMatch(/--page-max:\s*90rem;/)
        expect(tokens).toMatch(/--page-gutter:\s*clamp\(1rem,[^;]+,\s*6rem\);/)
        expect(tokens).toMatch(/--page-measure:\s*68ch;/)
        const rules = css('utilities/layout.css')
        expect(rules).toMatch(/max-width:\s*calc\(var\(--page-max\) \+ 2 \* var\(--page-gutter\)\)/)
        expect(rules).toMatch(/padding-inline:\s*var\(--page-gutter\)/)
    })

    it('is imported by the token and utility entry points', () => {
        expect(css('tokens/index.css')).toContain('@import "./layout.css";')
        expect(css('utilities/index.css')).toContain('@import "./layout.css";')
    })
})
