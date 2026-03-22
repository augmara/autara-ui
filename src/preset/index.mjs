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
                'autara-sm': '6px',
                autara: '8px',
                'autara-md': '10px',
                'autara-lg': '12px',
                'autara-xl': '16px',
                'autara-full': '24px',
            },
            boxShadow: shadows,
            animation: animations,
            keyframes: keyframes,
        },
    },
}
