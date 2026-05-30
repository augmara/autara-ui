/**
 * Autara shadow scale — deliberately empty.
 *
 * Per the canonical autara-aesthetic rule (workspace CLAUDE.md, customer-web
 * globals.css, autara-ui CLAUDE.md): NO drop shadows. The brand reads as
 * solid, editorial, hairline-edged — never floating-card. Depth comes from
 * border-color shifts on hover, never `box-shadow`.
 *
 * The named scale (`autara`, `autara-md`, `autara-lg`) is retained for
 * backwards compat with v1.0.x consumers that ship `className="shadow-autara"`
 * — those resolve to `box-shadow: none` and produce the correct treatment
 * without breaking compile. Same pattern as `tokens/shadows.css`.
 *
 * If you're tempted to put a value back here, ask: "Would Linear, Stripe,
 * or Cal.com add one?" If the answer's still yes, push back via PR
 * conversation rather than silently re-introducing depth-by-shadow.
 */

/** @type {Record<string, string>} */
export const shadows = {
    autara: 'none',
    'autara-md': 'none',
    'autara-lg': 'none',
}
