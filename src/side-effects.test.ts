/**
 * AUTM-1688: the package declares `"sideEffects": ["**\/*.css"]`, so a bundler
 * may drop every module a consumer does not import. Before it, one `Button`
 * import from the barrel carried the whole library into the bundle (Radix,
 * the date and time pickers, the dialogs): 78 KB gzip of autara-ui for a
 * button, measured in a Vite fixture, against 11 KB after.
 *
 * The declaration is a PROMISE that no JS module does anything when it is
 * merely imported. A bundler trusts it and drops the module, so a module that
 * breaks it (registers something globally, injects a stylesheet, patches
 * another module's export) works in Storybook and silently does nothing in a
 * consumer. This test keeps the promise true:
 *
 *   1. package.json still declares it, and lists CSS only.
 *   2. Every shipped module's top level is declarations, imports, exports and
 *      the `"use client"` directive, plus `X.displayName = ...` on a component
 *      the same file declares. No bare `import './x'`, which exists only for
 *      its side effect and would be dropped.
 *   3. A call in a top-level initializer is one of a short list of pure
 *      constructors (`forwardRef`, `cva`, `createContext` ...). Add to that
 *      list only for a call that touches nothing outside its own return value.
 *
 * If a module genuinely needs an import-time effect, list it in
 * package.json `sideEffects` AND here, and say why in both places.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'

const ROOT = process.cwd()
const SRC = resolve(ROOT, 'src')

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
    sideEffects?: unknown
}

function shippedModules(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) shippedModules(full, out)
        else if (
            /\.tsx?$/.test(entry) &&
            !entry.endsWith('.d.ts') &&
            !/\.(test|spec|stories)\.tsx?$/.test(entry)
        )
            out.push(full)
    }
    return out
}

/** Calls allowed in a top-level initializer: each builds a value and touches nothing else. */
const PURE_CALLS = new Set([
    'React.forwardRef',
    'forwardRef',
    'React.createContext',
    'createContext',
    'cva',
    'cn',
    'Object.entries',
    'Object.fromEntries',
    'Object.keys',
    'Object.freeze',
    'Map',
    'Set',
    'WeakMap',
    'Intl.DateTimeFormat',
    'Intl.NumberFormat',
])

/** Non-mutating array and string methods, called on whatever value: `[...].join('')`, `Object.entries(x).map(...)`. */
const PURE_METHODS = new Set(['map', 'filter', 'join', 'concat', 'slice', 'flatMap', 'reduce', 'split', 'trim', 'toLowerCase', 'toUpperCase'])

function topLevelNames(sf: ts.SourceFile): Set<string> {
    const names = new Set<string>()
    for (const s of sf.statements) {
        if (ts.isVariableStatement(s)) {
            for (const d of s.declarationList.declarations) {
                if (ts.isIdentifier(d.name)) names.add(d.name.text)
            }
        } else if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && s.name) {
            names.add(s.name.text)
        }
    }
    return names
}

function violations(file: string): string[] {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    const local = topLevelNames(sf)
    const found: string[] = []
    const where = (n: ts.Node) =>
        `${relative(ROOT, file)}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`

    for (const s of sf.statements) {
        if (ts.isImportDeclaration(s)) {
            if (!s.importClause) found.push(`${where(s)} bare import ${s.getText()}`)
            continue
        }
        if (
            ts.isExportDeclaration(s) ||
            ts.isExportAssignment(s) ||
            ts.isFunctionDeclaration(s) ||
            ts.isClassDeclaration(s) ||
            ts.isInterfaceDeclaration(s) ||
            ts.isTypeAliasDeclaration(s) ||
            ts.isEnumDeclaration(s) ||
            ts.isModuleDeclaration(s)
        )
            continue
        if (ts.isExpressionStatement(s)) {
            const e = s.expression
            if (ts.isStringLiteral(e)) continue // "use client"
            if (
                ts.isBinaryExpression(e) &&
                e.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                ts.isPropertyAccessExpression(e.left) &&
                e.left.name.text === 'displayName' &&
                ts.isIdentifier(e.left.expression) &&
                local.has(e.left.expression.text)
            )
                continue
            found.push(`${where(s)} top-level statement ${s.getText().slice(0, 80)}`)
            continue
        }
        if (ts.isVariableStatement(s)) {
            for (const d of s.declarationList.declarations) {
                if (!d.initializer) continue
                const visit = (n: ts.Node): void => {
                    // A function body runs later, on a call, not on import.
                    if (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) return
                    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
                        const callee = n.expression.getText()
                        const method = ts.isPropertyAccessExpression(n.expression) ? n.expression.name.text : ''
                        const first = n.arguments?.[0]
                        const assignOntoFresh =
                            callee === 'Object.assign' &&
                            first !== undefined &&
                            (ts.isArrowFunction(first) ||
                                ts.isFunctionExpression(first) ||
                                ts.isObjectLiteralExpression(first))
                        if (!PURE_CALLS.has(callee) && !PURE_METHODS.has(method) && !assignOntoFresh)
                            found.push(`${where(n)} call at import time: ${callee.slice(0, 60)}(...)`)
                    }
                    if (ts.isTaggedTemplateExpression(n))
                        found.push(`${where(n)} tagged template at import time: ${n.tag.getText()}`)
                    ts.forEachChild(n, visit)
                }
                visit(d.initializer)
            }
            continue
        }
        found.push(`${where(s)} ${ts.SyntaxKind[s.kind]} at top level`)
    }
    return found
}

describe('tree-shaking contract (AUTM-1688)', () => {
    it('package.json declares sideEffects, listing CSS only', () => {
        expect(Array.isArray(pkg.sideEffects)).toBe(true)
        const list = pkg.sideEffects as string[]
        expect(list).toContain('**/*.css')
        for (const pattern of list) expect(pattern).toMatch(/\.css$/)
    })

    const files = shippedModules(SRC)

    it('finds the shipped modules', () => {
        // A guard that scans nothing passes forever.
        expect(files.length).toBeGreaterThan(50)
        expect(files.some((f) => f.endsWith('components/Button.tsx'))).toBe(true)
    })

    it('no shipped module does anything when it is imported', () => {
        expect(files.flatMap(violations)).toEqual([])
    })
})
