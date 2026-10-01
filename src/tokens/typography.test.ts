import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1568 — each Satoshi weight is served by the face designed for it.
 *
 * typography.css mapped Satoshi-Black.otf to weight 700 and shipped no Bold,
 * so every bold label, button and title in every consumer rendered Black, and
 * a 900 heading found no 900 face and fell back to the same Black. The two
 * weights the brand distinguishes (UI bold, display Black) looked identical.
 *
 * Reads the stylesheet and the font files rather than a JS constant, like the
 * contrast tests beside it, so editing the CSS is what fails the test. The
 * weight class is read from each font's own OS/2 table, which is the font's
 * statement of which CSS weight it was drawn for.
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/tokens/typography.css'), 'utf8')

type Face = { family: string; file: string; weight: number }

function faces(css: string): Face[] {
	return [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
		family: /font-family:\s*"([^"]+)"/.exec(body)?.[1] ?? '',
		file: /url\("\.\.\/fonts\/([^"]+)"\)/.exec(body)?.[1] ?? '',
		weight: Number(/font-weight:\s*(\d+)/.exec(body)?.[1]),
	}))
}

/** usWeightClass from the font's OS/2 table. */
function weightClass(file: string): number {
	const buf = readFileSync(resolve(process.cwd(), 'src/fonts', file))
	const tables = buf.readUInt16BE(4)
	for (let i = 0; i < tables; i++) {
		const rec = 12 + 16 * i
		if (buf.toString('latin1', rec, rec + 4) === 'OS/2') {
			const offset = buf.readUInt32BE(rec + 8)
			return buf.readUInt16BE(offset + 4)
		}
	}
	throw new Error(`${file} has no OS/2 table`)
}

const satoshi = faces(CSS).filter((f) => f.family === 'Satoshi')
const byWeight = new Map(satoshi.map((f) => [f.weight, f.file]))

describe('Satoshi faces (AUTM-1568)', () => {
	it('700 is Satoshi-Bold and 900 is Satoshi-Black', () => {
		expect(byWeight.get(700)).toBe('Satoshi-Bold.otf')
		expect(byWeight.get(900)).toBe('Satoshi-Black.otf')
	})

	it('declares each weight once, and none of the banned 600 or 800', () => {
		const weights = satoshi.map((f) => f.weight)
		expect(new Set(weights).size).toBe(weights.length)
		expect(weights).not.toContain(600)
		expect(weights).not.toContain(800)
	})

	it.each(satoshi.map((f) => [f.weight, f.file] as const))(
		'weight %i is served by %s, a file the package ships and that was drawn for that weight',
		(weight, file) => {
			expect(existsSync(resolve(process.cwd(), 'src/fonts', file))).toBe(true)
			expect(weightClass(file)).toBe(weight)
		},
	)
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
