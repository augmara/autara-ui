'use client'

import {
    forwardRef,
    useEffect,
    useRef,
    type HTMLAttributes,
    type ReactNode,
} from 'react'
import { cn } from '../lib/cn'

/**
 * BloomField — the gradient ground, alive.
 *
 * AUTM-1475, Phase 0 of the web revamp Don approved on 2026-09-28
 * (`knowledge/project_web_revamp_direction_2026_09_28.md`). The three
 * blooms behind the glass stop being a static `radial-gradient` and become a
 * slow, domain-warped field that drifts at about a pixel a second and leans
 * a little toward the pointer. Same three colours, same peak alpha, same
 * ground: the shader READS `--background`, `--bloom-act`, `--bloom-flight`,
 * `--bloom-money` and `--bloom-alpha` from the element's computed style, so
 * a token change or a theme flip reaches it and it never restates a colour.
 *
 * Where it goes: the hero and the footer of a marketing page, and nowhere
 * else (Don, 2026-09-28: "hero and footer only"). Sections between keep
 * `GradientGround`. One lit moment at each end reads as restraint; a page
 * that shimmers everywhere reads as a screensaver.
 *
 * ─── What it costs, and the rules that bound it ─────────────────────────
 *
 *   - It is GPU work per frame, like `backdrop-filter`. It renders at HALF
 *     resolution (the field is blurred by nature, nobody can see the
 *     difference) and is capped at 30 fps. It stops when it scrolls out of
 *     view, when the tab is hidden, and when `paused` is set.
 *   - Consumer budget: under 2 ms a frame on the iPad Pro 11", measured on
 *     the device. Over that, ship `GradientGround` instead. Every instance
 *     carries `data-ground="live|static|paused|reduced"` so a device test
 *     can find it: `document.querySelectorAll('[data-ground="live"]')`.
 *   - `prefers-reduced-motion: reduce` paints ONE frame and stops. The
 *     ground is still lit; it just does not move.
 *   - No WebGL2 (or a context that fails to compile) means the canvas is
 *     removed and the static `.gradient-ground` underneath is what shows.
 *     The static ground is painted by CSS on the wrapper BEFORE any script
 *     runs, so server HTML and the first paint always have blooms.
 *
 * Rule 7 still holds: nothing here glows, casts a shadow, or draws an
 * outline. It is the ground. Glass sits on it exactly as it sits on
 * `GradientGround`, and the contrast matrix in `tokens/glass.css` is
 * unchanged because the peak alpha is the token's value times `gain`,
 * which defaults to a value the blur of the field keeps under the cap at
 * the point where text actually sits.
 */

export interface BloomFieldProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Stops the field. The last painted frame stays; if nothing has painted
     * yet the static ground shows through.
     */
    paused?: boolean
    /**
     * Multiplies the peak read from `--bloom-alpha`. The field's Gaussian
     * falloff means a panel of text rarely sits on a peak, which is why the
     * default runs above 1. Above ~2 the contrast cap in `tokens/glass.css`
     * stops holding under a panel centred on a bloom; do not.
     */
    gain?: number
    children?: ReactNode
}

const VERT = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

const FRAG = [
    '#version 300 es',
    'precision highp float;',
    'out vec4 o;',
    'uniform vec2 r;uniform float t;uniform vec2 m;',
    'uniform vec3 g;uniform vec3 a;uniform vec3 b;uniform vec3 c;uniform float al;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fb(vec2 p){float v=0.,w=.5;for(int k=0;k<4;k++){v+=w*n(p);p=p*2.03+vec2(1.7,9.2);w*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r;float ar=r.x/r.y;vec2 p=vec2(uv.x*ar,uv.y);float T=t*.045;',
    ' vec2 q=vec2(fb(p*1.1+T),fb(p*1.1+vec2(5.2,1.3)-T));vec2 w=p+.55*q;',
    ' vec2 mm=(m-.5)*vec2(ar,1.);',
    ' vec2 ca=vec2(.2*ar,.6)+.05*vec2(sin(T*1.7),cos(T*1.1))+.10*mm;',
    ' vec2 cb=vec2(.78*ar,.3)+.05*vec2(cos(T*1.3),sin(T*.9))+.07*mm;',
    ' vec2 cc=vec2(.58*ar,.95)+.05*vec2(sin(T*.8),cos(T*1.5))+.05*mm;',
    ' float ia=exp(-dot(w-ca,w-ca)*3.0),ib=exp(-dot(w-cb,w-cb)*3.7),ic=exp(-dot(w-cc,w-cc)*4.4);',
    ' vec3 col=g;col=mix(col,a,ia*al);col=mix(col,b,ib*al*.85);col=mix(col,c,ic*al*.7);',
    ' col+=(h(gl_FragCoord.xy+t)-.5)*.012;',
    ' o=vec4(col,1.);}',
].join('\n')

/** `#rrggbb` or `rgb(a)(r, g, b[, a])` → three floats. Anything else is black. */
function parseColor(value: string): [number, number, number] {
    const v = value.trim()
    if (v.startsWith('#') && (v.length === 7 || v.length === 4)) {
        const hex = v.length === 4 ? v.replace(/./g, (ch, i) => (i ? ch + ch : ch)) : v
        return [
            parseInt(hex.slice(1, 3), 16) / 255,
            parseInt(hex.slice(3, 5), 16) / 255,
            parseInt(hex.slice(5, 7), 16) / 255,
        ]
    }
    const nums = v.match(/[\d.]+/g)
    if (nums && nums.length >= 3) {
        return [Number(nums[0]) / 255, Number(nums[1]) / 255, Number(nums[2]) / 255]
    }
    return [0, 0, 0]
}

export const BloomField = forwardRef<HTMLDivElement, BloomFieldProps>(function BloomField(
    { paused = false, gain = 1.7, className, children, ...rest },
    ref
) {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pausedRef = useRef(paused)
    pausedRef.current = paused

    useEffect(() => {
        const host = hostRef.current
        const cv = canvasRef.current
        if (!host || !cv) return

        const reduce =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const gl = cv.getContext('webgl2', {
            alpha: false,
            antialias: false,
            powerPreference: 'low-power',
        })
        if (!gl) {
            cv.remove()
            host.dataset.ground = 'static'
            return
        }

        const compile = (type: number, src: string): WebGLShader | null => {
            const s = gl.createShader(type)
            if (!s) return null
            gl.shaderSource(s, src)
            gl.compileShader(s)
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
        }
        const vs = compile(gl.VERTEX_SHADER, VERT)
        const fs = compile(gl.FRAGMENT_SHADER, FRAG)
        const prog = gl.createProgram()
        if (!vs || !fs || !prog) {
            cv.remove()
            host.dataset.ground = 'static'
            return
        }
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            cv.remove()
            host.dataset.ground = 'static'
            return
        }
        gl.useProgram(prog)

        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, 'p')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        const u = {
            r: gl.getUniformLocation(prog, 'r'),
            t: gl.getUniformLocation(prog, 't'),
            m: gl.getUniformLocation(prog, 'm'),
            g: gl.getUniformLocation(prog, 'g'),
            a: gl.getUniformLocation(prog, 'a'),
            b: gl.getUniformLocation(prog, 'b'),
            c: gl.getUniformLocation(prog, 'c'),
            al: gl.getUniformLocation(prog, 'al'),
        }

        let running = false
        let visible = true
        let last = 0
        const mouse = [0.5, 0.5]
        let target = [0.5, 0.5]
        const start = performance.now()

        /* The tokens are read from the HOST, not from <html>, so a dark island
         * (`<div data-theme="dark">`) lights its own field correctly. */
        const readTokens = () => {
            const cs = getComputedStyle(host)
            gl.uniform3fv(u.g, parseColor(cs.getPropertyValue('--background')))
            gl.uniform3fv(u.a, parseColor(cs.getPropertyValue('--bloom-act')))
            gl.uniform3fv(u.b, parseColor(cs.getPropertyValue('--bloom-flight')))
            gl.uniform3fv(u.c, parseColor(cs.getPropertyValue('--bloom-money')))
            const alpha = parseFloat(cs.getPropertyValue('--bloom-alpha')) || 0.28
            gl.uniform1f(u.al, alpha * gain)
        }

        const size = () => {
            /* Half resolution. The field is blurred by construction, so the
             * missing pixels are invisible and the fill cost is a quarter. */
            const scale = 0.5
            cv.width = Math.max(1, Math.round(host.clientWidth * scale))
            cv.height = Math.max(1, Math.round(host.clientHeight * scale))
            gl.viewport(0, 0, cv.width, cv.height)
        }

        const draw = (now: number) => {
            mouse[0] += (target[0] - mouse[0]) * 0.05
            mouse[1] += (target[1] - mouse[1]) * 0.05
            gl.uniform2f(u.r, cv.width, cv.height)
            gl.uniform1f(u.t, (now - start) / 1000)
            gl.uniform2f(u.m, mouse[0], mouse[1])
            gl.drawArrays(gl.TRIANGLES, 0, 3)
        }

        const frame = (now: number) => {
            if (!running) return
            requestAnimationFrame(frame)
            // 30 fps cap: the drift is slow and the field is soft.
            if (now - last < 33) return
            last = now
            draw(now)
        }

        const state = () => {
            if (reduce) return 'reduced'
            if (pausedRef.current) return 'paused'
            return 'live'
        }
        const play = () => {
            host.dataset.ground = state()
            if (running || pausedRef.current || !visible || reduce || document.hidden) return
            running = true
            requestAnimationFrame(frame)
        }
        const stop = () => {
            running = false
        }

        size()
        readTokens()
        draw(performance.now())
        host.dataset.ground = state()
        play()

        const ro =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => {
                      size()
                      if (!running) draw(performance.now())
                  })
                : null
        ro?.observe(host)

        const io =
            typeof IntersectionObserver !== 'undefined'
                ? new IntersectionObserver(
                      (entries) => {
                          visible = entries[0]?.isIntersecting ?? true
                          if (visible) play()
                          else stop()
                      },
                      { threshold: 0.02 }
                  )
                : null
        io?.observe(host)

        const onVisibility = () => (document.hidden ? stop() : play())
        document.addEventListener('visibilitychange', onVisibility)

        const onMove = (e: PointerEvent) => {
            const rect = host.getBoundingClientRect()
            target = [(e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height]
        }
        host.addEventListener('pointermove', onMove, { passive: true })

        /* A theme flip re-reads the tokens; the consuming app stamps
         * `data-theme` on <html> (or on an island), never a class. */
        const mo =
            typeof MutationObserver !== 'undefined'
                ? new MutationObserver(() => {
                      readTokens()
                      if (!running) draw(performance.now())
                  })
                : null
        mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        if (host.closest('[data-theme]') && host.closest('[data-theme]') !== document.documentElement) {
            mo?.observe(host.closest('[data-theme]') as Element, {
                attributes: true,
                attributeFilter: ['data-theme'],
            })
        }

        const onPauseChange = () => (pausedRef.current ? stop() : play())
        host.addEventListener('bloomfield:pause', onPauseChange)

        return () => {
            running = false
            ro?.disconnect()
            io?.disconnect()
            mo?.disconnect()
            document.removeEventListener('visibilitychange', onVisibility)
            host.removeEventListener('pointermove', onMove)
            host.removeEventListener('bloomfield:pause', onPauseChange)
            gl.getExtension('WEBGL_lose_context')?.loseContext()
        }
    }, [gain])

    /* `paused` is a prop but the loop lives in the effect above, so a change
     * is relayed as an event on the host rather than re-running the whole
     * setup (which would re-create the GL context). */
    useEffect(() => {
        hostRef.current?.dispatchEvent(new Event('bloomfield:pause'))
    }, [paused])

    return (
        <div
            ref={(node) => {
                hostRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
            }}
            /* `static` until the effect proves a context. Server HTML and the
             * first paint are the CSS blooms, which is the fallback anyway. */
            data-ground="static"
            className={cn('bloom-field gradient-ground', className)}
            {...rest}
        >
            <canvas ref={canvasRef} className="bloom-field__canvas" aria-hidden="true" />
            {children}
        </div>
    )
})

BloomField.displayName = 'BloomField'
