'use client'

import { type ReactNode, useState } from 'react'

/**
 * The compare showpiece — a four-column solution matrix that highlights one column and dims the
 * rest as you hover it (ported from the preview's inline script). It is a progressive hover
 * enhancement: every cell is fully readable without it, so the header cells stay non-interactive
 * (no tabstops, no roving focus). Reduced motion needs no gating here — the effect is opacity/colour
 * only and the underlying content never moves.
 */

const COLUMNS = [
  { n: '01', name: 'Product Development' },
  { n: '02', name: 'Enterprise Transformation' },
  { n: '03', name: 'Engineering Augmentation' },
  { n: '04', name: 'Managed Systems' },
]

type Cell = { node: ReactNode; tab?: boolean }

const ROWS: { label: string; cells: Cell[] }[] = [
  {
    label: 'Best when',
    cells: [
      { node: "You're building something new" },
      { node: 'A critical system is aging out — or still runs on paper' },
      { node: 'Your roadmap outruns your team' },
      { node: 'Your systems need an owner' },
    ],
  },
  {
    label: 'Typical duration',
    cells: [
      { node: '3–9 months', tab: true },
      { node: '12+ months', tab: true },
      { node: 'Rolling, quarterly' },
      { node: 'Ongoing' },
    ],
  },
  {
    label: 'Team shape',
    cells: [
      { node: 'One senior pod' },
      { node: 'Coordinated workstreams' },
      { node: 'Embedded engineers' },
      { node: 'Dedicated ops coverage' },
    ],
  },
  {
    label: 'Roadmap owner',
    cells: [
      { node: 'Shared' },
      { node: 'Shared' },
      { node: 'You' },
      { node: 'We propose, you approve' },
    ],
  },
  {
    label: 'What we hand over',
    cells: [
      { node: 'A launched product + docs' },
      { node: 'A retired legacy + a live platform' },
      { node: 'Merged code, every week' },
      { node: 'Reports, uptime, a healthy system' },
    ],
  },
  {
    label: 'Engagement model',
    cells: [
      {
        node: (
          <>
            <b>Frame™</b> or <b>Flow™</b>
          </>
        ),
      },
      {
        node: (
          <>
            <b>Flow™</b> or <b>Orchestra™</b>
          </>
        ),
      },
      { node: <b>Orchestra™</b> },
      { node: <b>Flow™</b> },
    ],
  },
]

export default function SolutionsCompare() {
  const [hotCol, setHotCol] = useState<number | null>(null)

  const cellClass = (col: number, tab?: boolean) => {
    let c = 'col'
    if (hotCol) c += hotCol === col ? ' hot' : ' dim'
    if (tab) c += ' tabnum'
    return c
  }

  return (
    <div className="cmp-wrap">
      <table onMouseLeave={() => setHotCol(null)}>
        <thead>
          <tr>
            <th></th>
            {COLUMNS.map((col, i) => (
              <th
                key={col.n}
                className={cellClass(i + 1)}
                data-col={i + 1}
                onMouseEnter={() => setHotCol(i + 1)}
              >
                <span className="thn">{col.n}</span>
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className="rl">{row.label}</td>
              {row.cells.map((cell, i) => (
                <td
                  key={i}
                  className={cellClass(i + 1, cell.tab)}
                  data-col={i + 1}
                  onMouseEnter={() => setHotCol(i + 1)}
                >
                  {cell.node}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
