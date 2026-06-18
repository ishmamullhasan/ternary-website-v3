# Block-redesign decomposition conventions (for subagents)

You decompose ONE monolithic page block (`src/blocks/<X>Page/{config.ts,Component.tsx}`) into granular,
design-faithful, admin-friendly section blocks. **Read the proven reference slice first**:
`src/blocks/ScalesHero/`, `src/blocks/QualityBar/`, `src/blocks/ScaleShowcase/`, `src/blocks/Cta/Component.tsx`,
and the factories `src/fields/{sectionHeader,arrays,iconSelect,buttons,image,ctaGroup,link,rowLabel}.ts`.

## Rules
1. **One block per visual section** in the monolith Component (each top-level `<Motion tag="section">` or
   equivalent). Name blocks descriptively, PascalCase dir + slug camelCase (e.g. `AboutThesis` → slug `aboutThesis`).
2. **Component = verbatim extraction.** Copy that section's JSX EXACTLY — identical className strings, Motion
   wrappers, `next/image` handling, helper functions/icon maps, motion prop objects. Only change: read from the
   block's own props instead of `data.<group>.<field>`. The block **self-wraps in its own `<Motion tag="section">`**
   exactly as the monolith did (it will be rendered directly — a SELF_WRAPPED block).
3. **config.ts** — `export const <Name>: Block = { slug, interfaceName: '<Name>Block', labels: {...}, fields: [...] }`.
   Build fields on the FACTORIES for clean admin UX:
   - section heading/description → `...sectionHeader()`
   - repeatable cards {title, excerpt, image?, icon?} → `cardsArray({ name, label, media?, icons?: [...], link? })`
     (cardsArray gives RowLabel previews + admin widths; `media:true` makes the image field be named `media`).
   - {value,label,detail} metrics → `statsArray()`; {title, richtext} steps → `stepsArray()`; tags → `tagsArray()`.
   - buttons → `buttonsField()` (replaces button_1/button_2).
   - single image → `imageField({ name, label })`. icon select → `iconSelect([...allowed])`.
   - Add `admin.description` help text on non-obvious fields. **Never expose cryptic names** (item_1, section_2,
     whoTitle, heading_2, button_1) — collapse them into proper arrays/named fields.
4. **Component prop type**: define a LOCAL `interface <Name>Block { ... }` mirroring the config (the generated
   payload type does not exist yet) and add `// TODO: switch to <Name>Block from '@/payload-types' after generate:types`.
   Import `Motion` from `@/components/animation/motion`, media/relationship types from `@/payload-types`.
5. **CTA sections** → DO NOT build a block. They map to the existing `ctaBlock` (already design-faithful). Just note it.
6. **Relationship/upload fields** stay as relationships/uploads (ids at depth-0). Note any field rename caused by
   the factories (e.g. old `image` → new `media` under cardsArray media:true).
7. Do **NOT** register anything in `Pages.ts` or `RenderBlocks` — the orchestrator wires centrally.
8. Run `cd <repo> && npx tsc --noEmit 2>&1 | grep -i <YourBlockNames>` and fix errors in YOUR files (the
   "Cannot find name '<Name>Block'" from payload-types is expected only if you import it — you use a local interface,
   so there should be none).

## Required report back
- The ordered list of new blocks: `slug` + dir.
- For EACH block: its exact config field shape (names + types).
- The **section → block mapping** with OLD field path → NEW field path for every field (this is the migration
  contract the orchestrator uses). Flag the section that maps to `ctaBlock` and give its old field path (usually `cta`).
- Any field renames (e.g. `heroSection.items[].image` → `items[].media`).
