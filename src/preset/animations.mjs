/** @type {Record<string, string>} Animation definitions */
export const animations = {
    float: 'float 6s ease-in-out infinite',
    'gradient-shift': 'gradient-shift 8s ease infinite',
    'scroll-x': 'scroll-x 30s linear infinite',
}

/** @type {Record<string, Record<string, Record<string, string>>>} Keyframe definitions */
export const keyframes = {
    float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-12px)' },
    },
    'gradient-shift': {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
    },
    'scroll-x': {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-50%)' },
    },
}
