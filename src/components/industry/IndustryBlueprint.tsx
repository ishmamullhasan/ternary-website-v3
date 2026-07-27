import type { JSX, ReactNode } from 'react'

import './industryBlueprint.css'

/**
 * Isometric monoline "blueprint" graphic for a homepage industry card. One motif per sector, all in
 * the same visual language: white wireframe on the card ground, a dotted construction grid, corner
 * nodes and a crosshair (see industryBlueprint.css). Selected by keyword on the industry title so it
 * is robust to slug/title variations.
 */

const VAULT: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="168" x2="226" y2="222" />
      <line x1="226" y1="168" x2="34" y2="222" />
      <line x1="70" y1="70" x2="70" y2="196" />
      <line x1="190" y1="70" x2="190" y2="196" />
    </g>
    <circle className="nd" cx="34" cy="168" r="2.6" />
    <circle className="nd" cx="226" cy="168" r="2.6" />
    <circle className="nd" cx="34" cy="222" r="2.6" />
    <circle className="nd" cx="226" cy="222" r="2.6" />
    <g className="x">
      <line x1="124" y1="214" x2="136" y2="226" />
      <line x1="136" y1="214" x2="124" y2="226" />
    </g>
    <path className="ln" d="M70 96 L130 66 L190 96 L130 126 Z" />
    <path className="ln" d="M70 96 L70 170 L130 200 L130 126" />
    <path className="ln" d="M190 96 L190 170 L130 200 L130 126" />
    <ellipse className="ln" cx="160" cy="150" rx="13" ry="24" transform="rotate(-13 160 150)" />
    <ellipse className="ln dim" cx="160" cy="150" rx="7" ry="13" transform="rotate(-13 160 150)" />
    <circle className="ln" cx="160" cy="150" r="2.2" />
  </>
)

const CELLS: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="168" x2="226" y2="222" />
      <line x1="226" y1="168" x2="34" y2="222" />
      <line x1="130" y1="112" x2="130" y2="192" />
    </g>
    <circle className="nd" cx="34" cy="168" r="2.6" />
    <circle className="nd" cx="226" cy="168" r="2.6" />
    <circle className="nd" cx="34" cy="222" r="2.6" />
    <circle className="nd" cx="226" cy="222" r="2.6" />
    <g className="x">
      <line x1="124" y1="214" x2="136" y2="226" />
      <line x1="136" y1="214" x2="124" y2="226" />
    </g>
    <path className="ln dim" d="M100 84 L130 100 M160 88 L130 100 M130 132 L130 100" />
    <circle className="ln" cx="130" cy="100" r="17" />
    <circle className="ln" cx="100" cy="84" r="10" />
    <circle className="ln" cx="160" cy="88" r="10" />
    <circle className="ln" cx="130" cy="134" r="10" />
    <path className="ln dim" d="M96 188 L130 171 L164 188 L130 205 Z" />
  </>
)

const BLOCKS: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="176" x2="226" y2="230" />
      <line x1="226" y1="176" x2="34" y2="230" />
    </g>
    <circle className="nd" cx="34" cy="176" r="2.6" />
    <circle className="nd" cx="226" cy="176" r="2.6" />
    <circle className="nd" cx="34" cy="230" r="2.6" />
    <circle className="nd" cx="226" cy="230" r="2.6" />
    <g className="x">
      <line x1="124" y1="222" x2="136" y2="234" />
      <line x1="136" y1="222" x2="124" y2="234" />
    </g>
    <path className="ln dim" d="M100 96 L130 81 L160 96 L130 111 Z" />
    <path className="ln dim" d="M100 96 L100 126 L130 141 L130 111" />
    <path className="ln dim" d="M160 96 L160 126 L130 141 L130 111" />
    <path className="ln" d="M74 138 L104 123 L134 138 L104 153 Z" />
    <path className="ln" d="M74 138 L74 168 L104 183 L104 153" />
    <path className="ln" d="M134 138 L134 168 L104 183 L104 153" />
    <path className="ln" d="M126 138 L156 123 L186 138 L156 153 Z" />
    <path className="ln" d="M126 138 L126 168 L156 183 L156 153" />
    <path className="ln" d="M186 138 L186 168 L156 183 L156 153" />
  </>
)

const ARENA: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="176" x2="226" y2="230" />
      <line x1="226" y1="176" x2="34" y2="230" />
    </g>
    <circle className="nd" cx="34" cy="176" r="2.6" />
    <circle className="nd" cx="226" cy="176" r="2.6" />
    <circle className="nd" cx="34" cy="230" r="2.6" />
    <circle className="nd" cx="226" cy="230" r="2.6" />
    <g className="x">
      <line x1="124" y1="222" x2="136" y2="234" />
      <line x1="136" y1="222" x2="124" y2="234" />
    </g>
    <path className="ln dim" d="M40 150 L130 105 L220 150 L130 195 Z" />
    <path className="ln" d="M62 138 L130 104 L198 138 L130 172 Z" />
    <path className="ln dim" d="M40 150 L62 138 M220 150 L198 138 M130 195 L130 172" />
    <path className="ln" d="M84 126 L130 103 L176 126 L130 149 Z" />
    <path className="ln dim" d="M62 138 L84 126 M198 138 L176 126 M130 172 L130 149" />
    <ellipse className="ln" cx="130" cy="126" rx="24" ry="12" />
  </>
)

const ROUTES: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="176" x2="226" y2="230" />
      <line x1="226" y1="176" x2="34" y2="230" />
    </g>
    <circle className="nd" cx="34" cy="176" r="2.6" />
    <circle className="nd" cx="226" cy="176" r="2.6" />
    <circle className="nd" cx="34" cy="230" r="2.6" />
    <circle className="nd" cx="226" cy="230" r="2.6" />
    <g className="x">
      <line x1="124" y1="222" x2="136" y2="234" />
      <line x1="136" y1="222" x2="124" y2="234" />
    </g>
    <path className="ln dim" d="M60 160 L130 125 L200 160 L130 195 Z" />
    <path className="gr" strokeDasharray="1 6" strokeOpacity="0.7" d="M88 158 Q120 120 130 118 Q150 118 172 150" />
    <path className="ln" d="M88 132 C80 132 78 143 88 154 C98 143 96 132 88 132 Z" />
    <circle className="ln" cx="88" cy="140" r="3.4" />
    <path className="ln" d="M130 108 C122 108 120 119 130 130 C140 119 138 108 130 108 Z" />
    <circle className="ln" cx="130" cy="116" r="3.4" />
    <path className="ln" d="M172 124 C164 124 162 135 172 146 C182 135 180 124 172 124 Z" />
    <circle className="ln" cx="172" cy="132" r="3.4" />
  </>
)

const GOODS: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="180" x2="226" y2="234" />
      <line x1="226" y1="180" x2="34" y2="234" />
    </g>
    <circle className="nd" cx="34" cy="180" r="2.6" />
    <circle className="nd" cx="226" cy="180" r="2.6" />
    <circle className="nd" cx="34" cy="234" r="2.6" />
    <circle className="nd" cx="226" cy="234" r="2.6" />
    <g className="x">
      <line x1="124" y1="226" x2="136" y2="238" />
      <line x1="136" y1="226" x2="124" y2="238" />
    </g>
    <path className="ln dim" d="M64 168 L130 135 L196 168 L130 201 Z" />
    <path className="ln dim" d="M64 168 L64 178 L130 211 L130 201 M196 168 L196 178 L130 211" />
    <path className="ln dim" d="M108 116 L134 103 L160 116 L134 129 Z" />
    <path className="ln dim" d="M108 116 L108 138 L134 151 L134 129 M160 116 L160 138 L134 151" />
    <path className="ln" d="M86 150 L112 137 L138 150 L112 163 Z" />
    <path className="ln" d="M86 150 L86 172 L112 185 L112 163 M138 150 L138 172 L112 185" />
    <path className="ln" d="M124 150 L150 137 L176 150 L150 163 Z" />
    <path className="ln" d="M124 150 L124 172 L150 185 L150 163 M176 150 L176 172 L150 185" />
  </>
)

const INSTITUTION: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="176" x2="226" y2="230" />
      <line x1="226" y1="176" x2="34" y2="230" />
      <line x1="70" y1="72" x2="70" y2="200" />
      <line x1="190" y1="72" x2="190" y2="200" />
    </g>
    <circle className="nd" cx="34" cy="176" r="2.6" />
    <circle className="nd" cx="226" cy="176" r="2.6" />
    <circle className="nd" cx="34" cy="230" r="2.6" />
    <circle className="nd" cx="226" cy="230" r="2.6" />
    <g className="x">
      <line x1="124" y1="222" x2="136" y2="234" />
      <line x1="136" y1="222" x2="124" y2="234" />
    </g>
    <path className="ln dim" d="M56 168 L130 131 L204 168 L130 205 Z" />
    <path className="ln dim" d="M56 168 L56 178 L130 215 L130 205 M204 168 L204 178 L130 215" />
    <path className="ln" d="M70 156 L130 126 L190 156 L130 186 Z" />
    <path className="ln" d="M70 156 L70 164 L130 194 L130 186 M190 156 L190 164 L130 194" />
    <path className="ln" d="M94 158 q0 -5 5 -5 q5 0 5 5 v-52 q0 -5 -5 -5 q-5 0 -5 5 Z" />
    <path className="ln" d="M116 166 q0 -5 5 -5 q5 0 5 5 v-58 q0 -5 -5 -5 q-5 0 -5 5 Z" />
    <path className="ln" d="M138 166 q0 -5 5 -5 q5 0 5 5 v-58 q0 -5 -5 -5 q-5 0 -5 5 Z" />
    <path className="ln" d="M160 158 q0 -5 5 -5 q5 0 5 5 v-52 q0 -5 -5 -5 q-5 0 -5 5 Z" />
    <path className="ln" d="M72 90 L130 61 L188 90 L130 119 Z" />
    <path className="ln" d="M72 90 L72 102 L130 131 L130 119 M188 90 L188 102 L130 131" />
    <path className="ln dim" d="M100 86 L130 71 L160 86 L130 101 Z" />
  </>
)

const STACK: ReactNode = (
  <>
    <g className="gr">
      <line x1="34" y1="182" x2="226" y2="236" />
      <line x1="226" y1="182" x2="34" y2="236" />
      <line x1="70" y1="80" x2="70" y2="202" />
      <line x1="190" y1="80" x2="190" y2="202" />
    </g>
    <circle className="nd" cx="34" cy="182" r="2.6" />
    <circle className="nd" cx="226" cy="182" r="2.6" />
    <circle className="nd" cx="34" cy="236" r="2.6" />
    <circle className="nd" cx="226" cy="236" r="2.6" />
    <g className="x">
      <line x1="124" y1="228" x2="136" y2="240" />
      <line x1="136" y1="228" x2="124" y2="240" />
    </g>
    <path className="ln dim" d="M70 168 L130 138 L190 168 L130 198 Z" />
    <path className="ln dim" d="M70 168 L70 178 L130 208 L130 198 M190 168 L190 178 L130 208" />
    <path className="ln" d="M74 134 L130 106 L186 134 L130 162 Z" />
    <path className="ln" d="M74 134 L74 144 L130 172 L130 162 M186 134 L186 144 L130 172" />
    <path className="ln" d="M78 100 L130 74 L182 100 L130 126 Z" />
    <path className="ln dim" d="M104 90 L130 100 L156 90 M104 108 L130 100 L156 108" />
    <circle className="ln" cx="130" cy="100" r="4.5" />
    <circle className="ln" cx="104" cy="90" r="3.4" />
    <circle className="ln" cx="156" cy="90" r="3.4" />
    <circle className="ln" cx="104" cy="108" r="3.4" />
    <circle className="ln" cx="156" cy="108" r="3.4" />
  </>
)

function blueprintFor(title: string): ReactNode {
  const t = title.toLowerCase()
  if (/bank|capital|financ|invest/.test(t)) return VAULT
  if (/health|care|medic|life science/.test(t)) return CELLS
  if (/manufactur|industrial|energy|supply/.test(t)) return BLOCKS
  if (/sport|entertain|media|leisure/.test(t)) return ARENA
  if (/hospitalit|travel|tourism/.test(t)) return ROUTES
  if (/consumer|goods|retail|commerce/.test(t)) return GOODS
  if (/public|govern|sector|civic/.test(t)) return INSTITUTION
  if (/tech|platform|software|saas|cloud/.test(t)) return STACK
  return INSTITUTION
}

export default function IndustryBlueprint({
  title,
  className,
}: {
  title?: string | null
  className?: string
}): JSX.Element {
  return (
    <svg
      className={`ib${className ? ` ${className}` : ''}`}
      viewBox="0 0 260 240"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {blueprintFor(title ?? '')}
    </svg>
  )
}
