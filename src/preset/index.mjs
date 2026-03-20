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
            borderRadius: {
                'autara-sm': '4px',
                autara: '6px',
                'autara-md': '8px',
                'autara-lg': '10px',
                'autara-xl': '12px',
                'autara-full': '20px',
            },
            boxShadow: shadows,
            animation: animations,
            keyframes: keyframes,
        },
    },
}
