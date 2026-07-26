'use client'

import { useReducedMotion } from 'motion/react'
import type { JSX } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Cursor-reactive "liquid text" hero headline (WebGL, zero external dependency).
 *
 * The real headline text is rendered as normal DOM inside the <h1> so it stays selectable, SEO-
 * indexable, and readable by assistive tech. On capable clients we rasterize that text to a texture
 * and drive a small fragment shader that ripples the letters away from the pointer, then lets them
 * settle back — an in-house equivalent of the proprietary Framer "liquid text" effect. The DOM text
 * is only visually hidden (opacity, not display/visibility) once the effect is confirmed running, so
 * it remains in the accessibility tree; the <canvas> is decorative and aria-hidden.
 *
 * Falls back to plain text — no canvas, no work — when the user prefers reduced motion or WebGL is
 * unavailable. All GL resources are freed on resize-rebuild and on unmount.
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
uniform float u_amp;      // pointer energy, 0..~1, decays as the pointer stops (letters settle)
uniform vec2 u_mouse;     // pointer in texture space, (0,0) = top-left
uniform float u_aspect;   // width / height, so distance falloff is not stretched

void main() {
  vec2 uv = v_uv;

  // Ripple that emanates from the pointer and pushes texels radially away, decaying with distance
  // and with the settling pointer energy. This is what makes letters "flow away like liquid".
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

/** Rasterize the headline lines into a 2D canvas, matched to the DOM text's font/color/box. */
function paintText(
  source: HTMLElement,
  lines: string[],
  width: number,
  height: number,
  dpr: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * dpr)
  canvas.height = Math.ceil(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const cs = getComputedStyle(source)
  const fontSize = parseFloat(cs.fontSize) || 32
  let lineHeight = parseFloat(cs.lineHeight)
  if (!Number.isFinite(lineHeight)) lineHeight = fontSize * 1.15

  ctx.fillStyle = cs.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`

  const cx = width / 2
  const blockTop = (height - lines.length * lineHeight) / 2 + lineHeight / 2
  lines.forEach((line, i) => ctx.fillText(line, cx, blockTop + i * lineHeight))

  return canvas
}

interface LiquidHeadlineProps {
  lines: string[]
  className?: string
}

export default function LiquidHeadline({ lines, className }: LiquidHeadlineProps): JSX.Element {
  const reduce = useReducedMotion()
  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    const source = textRef.current
    if (!canvas || !source) return

    const gl = (canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return // no WebGL → leave the plain DOM text visible

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let disposed = false
    let started = false
    let fontsReady = false

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let texture: WebGLTexture | null = null
    const u: Record<string, WebGLUniformLocation | null> = {}

    // Pointer energy that decays every frame so letters settle back after the cursor stops.
    let amp = 0
    let time = 0
    const mouse = { x: 0.5, y: 0.5 }
    const last = { x: 0.5, y: 0.5 }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height
      amp = Math.min(1, amp + Math.hypot(nx - last.x, ny - last.y) * 9 + 0.12)
      last.x = nx
      last.y = ny
      mouse.x = nx
      mouse.y = ny
    }

    /** Compile + link the program and set up the quad once. */
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

    /** (Re)size the canvas to the text box and (re)upload the rasterized-text texture. */
    const uploadTexture = (): boolean => {
      const rect = source.getBoundingClientRect()
      if (!rect.width || !rect.height) return false

      canvas.width = Math.ceil(rect.width * dpr)
      canvas.height = Math.ceil(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      if (texture) gl.deleteTexture(texture)
      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        paintText(source, lines, rect.width, rect.height, dpr),
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
      amp *= 0.94 // settle back toward rest
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
      if (!source.getBoundingClientRect().width) return // not laid out yet; ResizeObserver retries
      if (!initGL() || !uploadTexture()) return
      started = true
      // Effect is live: hand the visuals to the canvas and hide the DOM text (a11y-tree intact).
      source.style.opacity = '0'
      canvas.style.opacity = '1'
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      raf = requestAnimationFrame(render)
    }

    // Fonts must be loaded before rasterizing, or the texture bakes a fallback face.
    const fontsPromise = document.fonts?.ready ?? Promise.resolve()
    fontsPromise.then(() => {
      fontsReady = true
      start()
    })

    // Rebuild on reflow (viewport resize, late font swap). Also drives the first start once laid out.
    const ro = new ResizeObserver(() => {
      if (disposed) return
      if (!started) start()
      else uploadTexture()
    })
    ro.observe(source)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      if (texture) gl.deleteTexture(texture)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      source.style.opacity = ''
    }
  }, [reduce, lines])

  return (
    <h1 className={className} style={{ position: 'relative' }}>
      <span ref={textRef} style={{ display: 'block', transition: 'opacity 200ms ease' }}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </h1>
  )
}
