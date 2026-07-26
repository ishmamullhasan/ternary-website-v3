import type { JSX } from 'react'

import './industryGlyph.css'

/**
 * IndustryGlyph — a minimal, meaningful abstract mark per sector for the Industries hub index.
 *
 * Pure SVG + CSS animation (see industryGlyph.css), so it renders in a Server Component with no
 * client island; the globals `prefers-reduced-motion` guard stills it. Marks use `currentColor`
 * (so the row can brighten them on hover) plus a cream `.em` accent. Decorative — aria-hidden.
 *
 * The variant is chosen from the industry's slug/title by keyword, so CMS-authored industries pick
 * a sensible motif automatically and anything unrecognized falls back to the neutral lattice.
 */

export type IndustryGlyphVariant =
  | 'market'
  | 'balance'
  | 'pulse'
  | 'assembly'
  | 'orbit'
  | 'route'
  | 'network'
  | 'institution'
  | 'layers'
  | 'lattice'

const KEYWORD_MAP: Array<[RegExp, IndustryGlyphVariant]> = [
  [/bank|capital|market|securit|broker|exchange|trading/, 'market'],
  [/financ|insur|fintech|wealth|lending|payment/, 'balance'],
  [/health|care|medical|clinical|pharma|life science/, 'pulse'],
  [/manufactur|industrial|energy|oil|gas|plant|factory|utilit/, 'assembly'],
  [/sport|entertain|media|gaming|event/, 'orbit'],
  [/hospitality|travel|tourism|booking|hotel|airline|leisure/, 'route'],
  [/consumer|retail|goods|commerce|franchise|field/, 'network'],
  [/public|government|gov|civic|defen|agency|institution/, 'institution'],
  [/platform|software|technolog|saas|developer|infrastructure/, 'layers'],
]

export function industryGlyphVariant(input?: string | null): IndustryGlyphVariant {
  if (!input) return 'lattice'
  const s = input.toLowerCase()
  for (const [re, variant] of KEYWORD_MAP) if (re.test(s)) return variant
  return 'lattice'
}

export default function IndustryGlyph({ variant }: { variant: IndustryGlyphVariant }): JSX.Element {
  const props = { viewBox: '0 0 64 64', fill: 'none', 'aria-hidden': true } as const

  switch (variant) {
    case 'market':
      return (
        <svg className="ig v-market" {...props}>
          <line className="st" x1="8" y1="54" x2="56" y2="54" strokeOpacity="0.4" />
          <line className="st bar" x1="14" y1="54" x2="14" y2="38" />
          <line className="st bar" x1="24" y1="54" x2="24" y2="28" />
          <line className="st bar em" x1="34" y1="54" x2="34" y2="20" />
          <line className="st bar" x1="44" y1="54" x2="44" y2="32" />
          <line className="st bar" x1="54" y1="54" x2="54" y2="24" />
        </svg>
      )
    case 'balance':
      return (
        <svg className="ig v-balance" {...props}>
          <line className="st" x1="32" y1="26" x2="32" y2="52" strokeOpacity="0.5" />
          <circle className="st" cx="32" cy="26" r="2" />
          <g className="beam">
            <line className="st" x1="14" y1="26" x2="50" y2="26" />
            <circle className="fp" cx="14" cy="26" r="3.2" />
            <circle className="fp em" cx="50" cy="26" r="3.2" />
          </g>
        </svg>
      )
    case 'pulse':
      return (
        <svg className="ig v-pulse" {...props}>
          <path className="st" d="M6 32 H22 L27 20 L33 44 L39 32 H58" strokeOpacity="0.32" />
          <path className="st em trace" d="M6 32 H22 L27 20 L33 44 L39 32 H58" />
        </svg>
      )
    case 'assembly':
      return (
        <svg className="ig v-assembly" {...props}>
          <g className="gear">
            <circle className="st" cx="32" cy="32" r="16" strokeOpacity="0.6" />
            <g className="st">
              <line x1="32" y1="10" x2="32" y2="16" />
              <line x1="32" y1="48" x2="32" y2="54" />
              <line x1="10" y1="32" x2="16" y2="32" />
              <line x1="48" y1="32" x2="54" y2="32" />
              <line x1="17" y1="17" x2="21" y2="21" />
              <line x1="43" y1="43" x2="47" y2="47" />
              <line x1="17" y1="47" x2="21" y2="43" />
              <line x1="43" y1="21" x2="47" y2="17" />
            </g>
          </g>
          <circle className="fp em" cx="32" cy="32" r="3" />
        </svg>
      )
    case 'orbit':
      return (
        <svg className="ig v-orbit" {...props}>
          <circle className="st" cx="32" cy="32" r="18" strokeOpacity="0.3" />
          <circle className="fp" cx="32" cy="32" r="3.4" />
          <g className="orb">
            <circle className="fp em" cx="32" cy="14" r="3" />
          </g>
        </svg>
      )
    case 'route':
      return (
        <svg className="ig v-route" {...props}>
          <path className="st em path" d="M12 44 C24 20 40 20 52 44" />
          <circle className="fp" cx="12" cy="44" r="3" />
          <circle className="fp" cx="52" cy="44" r="3" />
        </svg>
      )
    case 'network':
      return (
        <svg className="ig v-network" {...props}>
          <g className="st" strokeOpacity="0.4">
            <line x1="32" y1="32" x2="32" y2="12" />
            <line x1="32" y1="32" x2="50" y2="24" />
            <line x1="32" y1="32" x2="50" y2="44" />
            <line x1="32" y1="32" x2="14" y2="44" />
            <line x1="32" y1="32" x2="14" y2="24" />
          </g>
          <circle className="fp em" cx="32" cy="32" r="3.2" />
          <circle className="fp np" cx="32" cy="12" r="2.4" />
          <circle className="fp np" cx="50" cy="24" r="2.4" />
          <circle className="fp np" cx="50" cy="44" r="2.4" />
          <circle className="fp np" cx="14" cy="44" r="2.4" />
          <circle className="fp np" cx="14" cy="24" r="2.4" />
        </svg>
      )
    case 'institution':
      return (
        <svg className="ig v-institution" {...props}>
          <rect className="st frame" x="14" y="14" width="36" height="36" rx="2" strokeOpacity="0.3" />
          <rect className="st frame" x="21" y="21" width="22" height="22" rx="2" strokeOpacity="0.5" />
          <rect className="st frame em" x="28" y="28" width="8" height="8" rx="1.5" />
        </svg>
      )
    case 'layers':
      return (
        <svg className="ig v-layers" {...props}>
          <rect className="st layer" x="14" y="38" width="36" height="9" rx="2" />
          <rect className="st layer" x="14" y="27" width="36" height="9" rx="2" />
          <rect className="st layer em" x="14" y="16" width="36" height="9" rx="2" />
        </svg>
      )
    case 'lattice':
    default:
      return (
        <svg className="ig v-lattice" {...props}>
          <g className="st" strokeOpacity="0.35">
            <line x1="18" y1="20" x2="46" y2="20" />
            <line x1="18" y1="44" x2="46" y2="44" />
            <line x1="18" y1="20" x2="18" y2="44" />
            <line x1="46" y1="20" x2="46" y2="44" />
            <line x1="18" y1="20" x2="46" y2="44" />
          </g>
          <circle className="fp node" cx="18" cy="20" r="2.6" />
          <circle className="fp node em" cx="46" cy="20" r="2.6" />
          <circle className="fp node" cx="18" cy="44" r="2.6" />
          <circle className="fp node" cx="46" cy="44" r="2.6" />
        </svg>
      )
  }
}
