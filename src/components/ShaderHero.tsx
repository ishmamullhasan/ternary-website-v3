'use client'

import RichTextComp, { type RichText } from '@/components/richtext'
import { useEffect, useRef, useState, type JSX } from 'react'

/**
 * Full-viewport WebGL hero for /about — a dark liquid-steel field behind the existing headline.
 *
 * Raw WebGL, no library: `three` is not a dependency and this does not add one.
 *
 * The copy is the CMS `hero` block's own `heading` and `description`, passed straight through —
 * no wording is invented here, and the existing type tokens (.ax-hx, .ax-copy) are reused so the
 * headline matches the rest of the page.
 *
 * DEGRADES IN THREE DIRECTIONS.
 *   No WebGL      — `getContext` returns null, the canvas is dropped and the section renders as
 *                   the dark ground with the headline on it. Never a blank screen.
 *   Reduced motion— time is pinned at 0, so the metal is a still frame; no RAF, no cursor.
 *   No JavaScript — the section is server-rendered with its background and copy already in place;
 *                   the canvas simply never initialises.
 *
 * The shader's darkest value (vec3(0.012)) is below --color-page (#050505), so the canvas sits
 * flush against the page ground with no visible seam at the section edges.
 */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`

const FRAG = `precision highp float;
uniform vec2  res;
uniform float time;
uniform vec2  mouse;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0., a=.5;
  for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.02; a*=.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*res)/res.y;
  vec2 m  = (mouse - .5*res)/res.y;

  float t = time*.06;

  vec2 q = vec2(fbm(uv*1.6 + t), fbm(uv*1.6 - t + 4.));
  vec2 r = vec2(fbm(uv*1.6 + 1.7*q + vec2(1.7,9.2) + .15*t),
                fbm(uv*1.6 + 1.7*q + vec2(8.3,2.8) - .12*t));
  float f = fbm(uv*1.6 + 2.4*r);

  float d = length(uv - m);
  f += .20*exp(-d*4.2);

  float bands = abs(sin(f*7.0 + t*2.0));
  vec3 base = mix(vec3(0.012), vec3(0.085,0.088,0.10), f);
  vec3 spec = vec3(0.68,0.70,0.74) * pow(bands, 9.0);
  vec3 sheen= vec3(0.34,0.36,0.40) * pow(bands, 3.5) * .22;
  vec3 col = base + spec + sheen;

  col *= 1.0 - .42*dot(uv,uv);

  gl_FragColor = vec4(col,1.0);
}`

/** Compile one shader, surfacing the driver's log rather than swallowing it. */
function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // Never silent: without the driver log a shader bug is almost impossible to find.
    console.error('[ShaderHero] shader compile failed:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function ShaderHero({
  heading,
  description,
}: {
  heading?: string | null
  description?: RichText | null
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Drives the no-WebGL fallback. Starts false so the server renders the canvas element and the
  // client only removes it if the context genuinely cannot be created.
  const [noWebGL, setNoWebGL] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl', { antialias: false, alpha: false }) ??
      canvas.getContext('experimental-webgl', { antialias: false, alpha: false })) as WebGLRenderingContext | null

    if (!gl) {
      setNoWebGL(true)
      return
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      setNoWebGL(true)
      return
    }

    const prog = gl.createProgram()
    if (!prog) {
      setNoWebGL(true)
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[ShaderHero] program link failed:', gl.getProgramInfoLog(prog))
      setNoWebGL(true)
      return
    }
    gl.useProgram(prog)

    // One fullscreen triangle — cheaper than a quad and needs no index buffer.
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'res')
    const uTime = gl.getUniformLocation(prog, 'time')
    const uMouse = gl.getUniformLocation(prog, 'mouse')

    // Eased cursor, in device pixels. Target and current are separate so the ridge trails the
    // pointer rather than snapping to it.
    let curX = 0
    let curY = 0
    let tgtX = 0
    let tgtY = 0
    let sized = false

    const resize = (): void => {
      // Cap DPR at 2: beyond that the fragment count doubles again for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      if (!sized) {
        // Start the highlight centred so the first frame is not lit from a corner.
        curX = tgtX = w / 2
        curY = tgtY = h / 2
        sized = true
      }
    }
    resize()

    const onPointer = (e: PointerEvent): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      tgtX = (e.clientX - r.left) * dpr
      // WebGL's origin is bottom-left; the DOM's is top-left.
      tgtY = (r.height - (e.clientY - r.top)) * dpr
    }

    const start = performance.now()
    let raf = 0

    const frame = (): void => {
      resize()
      curX += (tgtX - curX) * 0.06
      curY += (tgtY - curY) * 0.06
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 0 : (performance.now() - start) / 1000)
      gl.uniform2f(uMouse, curX, curY)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }

    if (reduce) {
      // A single still frame. No loop, no listeners — the metal is a photograph.
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, 0)
      gl.uniform2f(uMouse, canvas.width / 2, canvas.height / 2)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('resize', resize)
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', resize)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      // Release the GPU context explicitly. Without this, repeated client-side navigation
      // accumulates contexts until the browser starts force-losing the oldest ones.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <section
      data-scene="hero"
      className="ax-black ax-scene relative isolate flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-5 py-16 md:px-10 lg:px-16"
      // The dark ground sits behind the canvas, so a failed or slow context never flashes white.
      style={{ backgroundColor: '#050505' }}
    >
      {!noWebGL ? (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 0 }}
        />
      ) : null}

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-8 lg:gap-10" style={{ zIndex: 2 }}>
        {heading ? (
          <h1 className="ax-hx ax-h max-w-[13ch]">{heading}</h1>
        ) : null}

        {description ? (
          <div className="ax-copy lg:ml-auto lg:text-right">
            <RichTextComp content={description} className="prose-p:mb-0 prose-p:text-inherit" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
