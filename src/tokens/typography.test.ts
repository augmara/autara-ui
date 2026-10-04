import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * AUTM-1724 — this package ships no font files and declares no @font-face.
 *
 * Satoshi's licence (ITF Free Font License v2.0, section 02) forbids making
 * the font files available to anyone else, and this repository is public. The
 * package used to carry five Satoshi .otf files in src/fonts, listed in
 * package.json "files", with @font-face rules here pointing at them. Every
 * consumer now self-hosts its own copy and owns its @font-face.
 *
 * These checks read the files themselves, so adding a font back, or a rule
 * that points at one, fails by name. Comments are stripped first, because
 * typography.css explains the rule in prose.
 */

const ROOT = process.cwd()
const CSS = readFileSync(resolve(ROOT, 'src/tokens/typography.css'), 'utf8')
const FONT_FILE = /\.(otf|ttf|woff2?|eot)$/i

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name)
		return statSync(path).isDirectory() ? walk(path) : [path]
	})
}

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { files: string[] }

describe('no fonts in the package (AUTM-1724)', () => {
	it('ships no font file anywhere under a published path or in src', () => {
		const roots = new Set(['src', ...pkg.files.filter((f) => f.startsWith('src/'))])
		const fonts = [...roots].flatMap((r) => walk(resolve(ROOT, r))).filter((p) => FONT_FILE.test(p))
		expect(fonts).toEqual([])
	})

	it('does not list src/fonts in package.json "files"', () => {
		expect(pkg.files).not.toContain('src/fonts')
	})

	it('declares no @font-face and no font URL in any published stylesheet or the preset', () => {
		const sheets = ['src/tokens', 'src/utilities', 'src/preset']
			.flatMap((d) => walk(resolve(ROOT, d)))
			.filter((p) => /\.(css|mjs)$/.test(p))
		expect(sheets.length).toBeGreaterThan(0)
		for (const sheet of sheets) {
			const body = stripComments(readFileSync(sheet, 'utf8'))
			expect(body, sheet).not.toMatch(/@font-face/)
			expect(body, sheet).not.toMatch(/url\([^)]*\.(otf|ttf|woff2?|eot)/i)
		}
	})

	it('still names the family consumers declare their faces under', () => {
		expect(stripComments(CSS)).toMatch(/--font-brand:\s*"Satoshi",/)
		expect(stripComments(CSS)).toMatch(/--font-brand-var:\s*"Satoshi";/)
	})
})

/**
 * AUTM-1594 — the type scale is canvas v44's, in rem. Pinned here so a step
 * that drifts from the sheet fails by name.
 */
describe('type scale (canvas v44)', () => {
	const scale: Array<[string, string, string, string?]> = [
		// step, size, line-height, weight
		['display', '3.25rem', '1.04', '900'],
		['section', '1.75rem', '1.04', '900'],
		['figure', '2.5rem', '1', '900'],
		['title', '1.0625rem', '1.3', '700'],
		['body', '1rem', '1.5'],
		['caption', '0.875rem', '1.4'],
	]
	for (const [step, size, lh, weight] of scale) {
		it(`text-${step} is ${size} at ${lh}${weight ? `, weight ${weight}` : ''}`, () => {
			expect(CSS).toMatch(new RegExp(`--text-${step}:\\s*${size.replace('.', '\\.')};`))
			expect(CSS).toMatch(new RegExp(`--text-${step}--line-height:\\s*${lh.replace('.', '\\.')};`))
			if (weight) expect(CSS).toMatch(new RegExp(`--text-${step}--font-weight:\\s*${weight};`))
		})
	}
	it('no step is set in px', () => {
		expect(CSS).not.toMatch(/--text-[a-z]+:\s*\d+px/)
	})
})
