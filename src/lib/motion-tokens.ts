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
 * Pairing, as the stylesheet does it: an EXIT (`*Out`) runs on the ease-in
 * curve and everything else (every enter, and hover and press) on ease-out. Enters are slower than
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
    // AUTM-1678: page content. Uses and the reduced-motion form of each are
    // in the "Page content motion" header of utilities/animations.css.
    reveal: 480,
    stagger: 60,
    settle: 280,
    settleDelay: 120,
    hover: 160,
    press: 120,
    pageIn: 200,
    pageOut: 120,
    skeleton: 1400,
    crossfade: 160,
} as const

/** `--motion-ease-out` (enters) and `--motion-ease-in` (exits). */
export const motionEasings = {
    out: [0.16, 1, 0.3, 1],
    in: [0.4, 0, 1, 1],
} as const satisfies Record<string, MotionBezier>

export type MotionDurationName = keyof typeof motionDurations

/**
 * The tokens that time a transition, which `motionTransition()` takes. The
 * other three are not transitions: `stagger` and `settleDelay` are DELAYS
 * (use `motionStaggerDelay()` and `motionDurations.settleDelay`), and
 * `skeleton` is a loop on `ease-in-out`, not an enter or an exit.
 */
export type MotionTransitionName = Exclude<MotionDurationName, 'stagger' | 'settleDelay' | 'skeleton'>

/**
 * Children 1 to 6 step by `--motion-stagger`; the seventh onward share the
 * sixth's delay, so no more than six things are ever moving at once.
 */
export const MOTION_STAGGER_CAP = 6

/** Every token in one object, for consumers that want a single import. */
export const motionTokens = {
    durationMs: motionDurations,
    ease: motionEasings,
} as const

/**
 * A framer-motion transition for a token: the duration in SECONDS (the unit
 * framer-motion takes) and the curve the stylesheet pairs it with. Exits
 * (`*Out`) run on ease-in; enters and interactive responses (reveal, settle,
 * hover, press, crossfade) on ease-out.
 *
 *     <motion.div transition={{ ...motionTransition('settle'), delay: motionDurations.settleDelay / 1000 }} />
 */
export function motionTransition(name: MotionTransitionName): {
    duration: number
    ease: MotionBezier
} {
    return {
        duration: motionDurations[name] / 1000,
        ease: name.endsWith('Out') ? motionEasings.in : motionEasings.out,
    }
}

/**
 * The stagger delay in MILLISECONDS for the child at `index` (0-based), as
 * `.motion-stagger` and `Reveal stagger` apply it: 0, 60, 120 ... 300, then
 * 300 for every child after the sixth. Divide by 1000 for framer-motion.
 */
export function motionStaggerDelay(index: number): number {
    const step = Math.min(Math.max(Math.floor(index), 0), MOTION_STAGGER_CAP - 1)
    return step * motionDurations.stagger
}
