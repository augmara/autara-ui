/**
 * The `--motion-*` tokens from `utilities/animations.css`, as typed values
 * for motion driven from JavaScript (framer-motion, `motion/react`, the Web
 * Animations API). AUTM-1594.
 *
 * Why: merchant-web read these off the page with `getComputedStyle` and kept
 * a hard-coded fallback for the server render (its `src/utils/motion.ts`,
 * AUTM-1601). A copy like that drifts the day a token moves. These are the
 * same numbers, shipped with the stylesheet that defines them, and
 * `motion-tokens.test.ts` fails if the two ever disagree.
 *
 * Pairing, as the stylesheet does it: an ENTER (`*In`) runs on the ease-out
 * curve and an EXIT (`*Out`) on the ease-in curve. Enters are slower than
 * exits on purpose: an opening surface is asking for attention and a closing
 * one is getting out of the way. `motionTransition()` applies the pairing.
 *
 *     import { motionTransition } from '@autara-au/autara-ui'
 *     <motion.div
 *         initial={{ y: '100%' }}
 *         animate={{ y: 0, transition: motionTransition('sheetIn') }}
 *         exit={{ y: '100%', transition: motionTransition('sheetOut') }}
 *     />
 *
 * Reduced motion: the stylesheet clamps every CSS animation for a user who
 * asked for less motion, and that clamp cannot reach an animation driven from
 * JS. Honour it where the animation is defined, for framer-motion with
 * `<MotionConfig reducedMotion="user">` or `useReducedMotion()`. Animate
 * `transform` and `opacity` only, as the CSS does.
 */

/** A cubic-bezier as four control-point numbers, framer-motion's `ease`. */
export type MotionBezier = readonly [number, number, number, number]

/**
 * Durations in MILLISECONDS, as the stylesheet declares them. Key is the CSS
 * name in camelCase: `--motion-sheet-in` is `sheetIn`.
 */
export const motionDurations = {
    panelIn: 160,
    panelOut: 120,
    modalIn: 200,
    modalOut: 150,
    scrimIn: 200,
    scrimOut: 150,
    sheetIn: 280,
    sheetOut: 200,
    navIn: 250,
    navOut: 200,
} as const

/** `--motion-ease-out` (enters) and `--motion-ease-in` (exits). */
export const motionEasings = {
    out: [0.16, 1, 0.3, 1],
    in: [0.4, 0, 1, 1],
} as const satisfies Record<string, MotionBezier>

export type MotionDurationName = keyof typeof motionDurations

/** Every token in one object, for consumers that want a single import. */
export const motionTokens = {
    durationMs: motionDurations,
    ease: motionEasings,
} as const

/**
 * A framer-motion transition for a token: the duration in SECONDS (the unit
 * framer-motion takes) and the curve the stylesheet pairs it with.
 */
export function motionTransition(name: MotionDurationName): {
    duration: number
    ease: MotionBezier
} {
    return {
        duration: motionDurations[name] / 1000,
        ease: name.endsWith('In') ? motionEasings.out : motionEasings.in,
    }
}
