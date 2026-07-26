'use client'

import { useReducedMotion } from 'motion/react'
import type { JSX, ReactNode } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Cursor-reactive "liquid text" effect (WebGL, zero external dependency).
 *
 * Wraps arbitrary children and, on capable clients, finds the display heading inside (h1–h3),
 * rasterizes it to a texture, and drives a fragment shader that ripples the glyphs away from the
 * pointer and lets them settle back — an in-house equivalent of the proprietary Framer "liquid text"
 * effect. Built to sit around a CMS RichText heading: it targets the heading element only, leaving
 * paragraphs untouched.
 *
 * Accessibility preserved: the real heading text stays in the DOM (selectable, SEO-indexable,
 * screen-reader-readable). When the effect is live the glyphs are hidden with `color: transparent`
 * (not display/visibility), so the text stays in the accessibility tree; the overlay <canvas> is a
 * decorative aria-hidden child of the heading. Falls back to the untouched heading under
 * prefers-reduced-motion, when WebGL is unavailable, or if anything throws. GL resources are freed
 * on resize-rebuild and unmount.
 */

const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_amp;      // pointer energy, 0..~1, decays as the pointer stops (glyphs settle)
uniform vec2 u_mouse;     // pointer in texture space, (0,0) = top-left
uniform float u_aspect;   // width / height, so distance falloff is not stretched

void main() {
  vec2 uv = v_uv;

  // Ripple emanating from the pointer, pushing texels radially away, decaying with distance and
  // with the settling pointer energy — this is what makes glyphs "flow away like liquid".
  vec2 toM = uv - u_mouse;
  vec2 aspectToM = vec2(toM.x * u_aspect, toM.y);
  float dist = length(aspectToM);
  vec2 dir = aspectToM / (dist + 1e-4);
  float ring = sin(dist * 26.0 - u_time * 4.5);
  float falloff = exp(-dist * 6.5);
  vec2 disp = dir * ring * falloff * u_amp * 0.05;

  // Gentle always-on flow so the headline reads as a living liquid surface even at rest.
  disp += 0.0035 * vec2(sin(uv.y * 9.0 + u_time * 0.9), cos(uv.x * 9.0 + u_time * 0.8));

  gl_FragColor = texture2D(u_tex, uv - disp);
}`

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/** Greedy word-wrap `text` to `maxWidth` under the already-set `ctx.font`. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (current && ctx.measureText(candidate).width > maxWidth) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

/** Rasterize the heading's text into a canvas matched to its box, font, colour, and wrapping. */
function paintHeading(heading: HTMLElement, width: number, height: number, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * dpr)
  canvas.height = Math.ceil(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const cs = getComputedStyle(heading)
  const fontSize = parseFloat(cs.fontSize) || 32
  let lineHeight = parseFloat(cs.lineHeight)
  if (!Number.isFinite(lineHeight)) lineHeight = fontSize * 1.15

  ctx.fillStyle = cs.color && cs.color !== 'rgba(0, 0, 0, 0)' ? cs.color : '#F4F3EC'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`

  const text = (heading.innerText || heading.textContent || '').trim()
  const lines = wrapLines(ctx, text, width)
  const cx = width / 2
  const blockTop = (height - lines.length * lineHeight) / 2 + lineHeight / 2
  lines.forEach((line, i) => ctx.fillText(line, cx, blockTop + i * lineHeight))

  return canvas
}

export default function LiquidText({ children }: { children: ReactNode }): JSX.Element {
  const reduce = useReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduce) return
    const host = hostRef.current
    const heading = host?.querySelector('h1, h2, h3') as HTMLElement | null
    if (!heading) return

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.position = 'absolute'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.opacity = '0'
    canvas.style.pointerEvents = 'none'

    const gl = (canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return // no WebGL → leave the heading untouched

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let disposed = false
    let started = false
    let fontsReady = false

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let texture: WebGLTexture | null = null
    const u: Record<string, WebGLUniformLocation | null> = {}

    let amp = 0
    let time = 0
    const mouse = { x: 0.5, y: 0.5 }
    const last = { x: 0.5, y: 0.5 }

    const onPointerMove = (e: PointerEvent) => {
      const rect = heading.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height
      amp = Math.min(1, amp + Math.hypot(nx - last.x, ny - last.y) * 9 + 0.12)
      last.x = nx
      last.y = ny
      mouse.x = nx
      mouse.y = ny
    }

    const initGL = (): boolean => {
      const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
      const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
      if (!vs || !fs) return false
      const prog = gl.createProgram()
      if (!prog) return false
      gl.attachShader(prog, vs)
      gl.attachShader(prog, fs)
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false
      program = prog
      gl.useProgram(program)

      // Full-screen quad. a_uv (0,0) = top-left so it lines up with the un-flipped text texture.
      // prettier-ignore
      const data = new Float32Array([
        -1, -1, 0, 1,
         1, -1, 1, 1,
        -1,  1, 0, 0,
         1,  1, 1, 0,
      ])
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const posLoc = gl.getAttribLocation(program, 'a_pos')
      const uvLoc = gl.getAttribLocation(program, 'a_uv')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8)

      for (const name of ['u_tex', 'u_time', 'u_amp', 'u_mouse', 'u_aspect']) {
        u[name] = gl.getUniformLocation(program, name)
      }

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
      return true
    }

    const uploadTexture = (): boolean => {
      const rect = heading.getBoundingClientRect()
      if (!rect.width || !rect.height) return false

      canvas.width = Math.ceil(rect.width * dpr)
      canvas.height = Math.ceil(rect.height * dpr)

      if (texture) gl.deleteTexture(texture)
      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // Premultiply on upload so the texture matches the premultipliedAlpha context + (ONE,
      // 1-SRC_ALPHA) blend — otherwise antialiased glyph edges composite as bright halos.
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        paintHeading(heading, rect.width, rect.height, dpr),
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.viewport(0, 0, canvas.width, canvas.height)
      return true
    }

    const render = () => {
      if (disposed || !program) return
      time += 0.016
      amp *= 0.94
      gl.uniform1f(u.u_time, time)
      gl.uniform1f(u.u_amp, amp)
      gl.uniform2f(u.u_mouse, mouse.x, mouse.y)
      gl.uniform1f(u.u_aspect, canvas.width / canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }

    const start = () => {
      if (started || disposed || !fontsReady) return
      if (!heading.getBoundingClientRect().width) return // not laid out yet; ResizeObserver retries
      if (!initGL() || !uploadTexture()) return
      started = true
      // Effect is live: overlay the canvas and hide the real glyphs (a11y tree intact).
      if (getComputedStyle(heading).position === 'static') heading.style.position = 'relative'
      heading.appendChild(canvas)
      heading.style.color = 'transparent'
      canvas.style.opacity = '1'
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      raf = requestAnimationFrame(render)
    }

    const fontsPromise = document.fonts?.ready ?? Promise.resolve()
    fontsPromise.then(() => {
      fontsReady = true
      start()
    })

    const ro = new ResizeObserver(() => {
      if (disposed) return
      if (!started) start()
      else uploadTexture()
    })
    ro.observe(heading)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      if (texture) gl.deleteTexture(texture)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      heading.style.color = ''
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
    }
  }, [reduce])

  return (
    <div ref={hostRef} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
