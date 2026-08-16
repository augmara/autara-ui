import { colors } from './colors.mjs'
import { shadows } from './shadows.mjs'
import { animations, keyframes } from './animations.mjs'

/** @type {import('tailwindcss').Config} Autara Tailwind preset */
export default {
    theme: {
        extend: {
            colors: {
                autara: colors,
            },
            fontFamily: {
                brand: ['var(--font-brand-var)', 'system-ui', '-apple-system', 'sans-serif'],
            },
            // Mirrors src/tokens/radii.css — that file is the source of truth
            // and carries the rationale. Literals rather than var() because a
            // consumer may take the preset WITHOUT importing the CSS tokens
            // (see CLAUDE.md § Known gotchas); a var() here would resolve to
            // nothing for them. Change both files together.
            borderRadius: {
                'autara-sm': '8px',
                autara: '12px',
                'autara-md': '14px',
                'autara-lg': '16px',
                'autara-xl': '24px',
                'autara-full': '9999px',
            },
            boxShadow: shadows,
            animation: animations,
            keyframes: keyframes,
        },
    },
}
