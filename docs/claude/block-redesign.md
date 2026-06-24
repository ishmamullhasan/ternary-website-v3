# Block library redesign — taxonomy & field-mapping spec (Phase 0)

Status: **for review** — this is the migration contract. No code is written until the mapping and the
open decisions (§5) are signed off.

## 1. Canonical block library (the new set)

Reusable, granular, design-faithful. Each gets full admin UX (friendly labels, help text,
`admin.width` rows, array `RowLabel` previews, collapsibles, defaults, conditions) and is built on the
shared factories in §2.

| #   | Block (slug)      | Purpose                           | Core fields                                                                                         |
| --- | ----------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | `hero`            | Page-top hero                     | eyebrow?, heading, description(richText), media?+alt, layout(centered/split-l/split-r), buttons[≤2] |
| 2   | `feature`         | Mid-page statement w/ media       | eyebrow?, heading, description(richText), media?+alt, layout, buttons[≤2]                           |
| 3   | `richText`        | Prose block (keep `Content`)      | content(richText)                                                                                   |
| 4   | `cardGrid`        | Uniform card grid                 | sectionHeader, columns(2/3/4), cards[]{title, excerpt, media?+alt, icon?, link?}                    |
| 5   | `featureBento`    | Bento/asymmetric grid             | sectionHeader, items[]{title, excerpt, media?, icon?, span(sm/md/lg)}                               |
| 6   | `relationGrid`    | Cards from a collection           | sectionHeader, relationTo(select or "mixed"), items(rel, hasMany/poly), columns, footnote?          |
| 7   | `stats`           | Stat row                          | sectionHeader?, stats[]{value, label, detail?} (width rows)                                         |
| 8   | `process`         | Numbered steps (keep `Steps`)     | sectionHeader, steps[]{title, description(richText), active?}                                       |
| 9   | `teamGrid`        | Team (keep/extend `Team`)         | sectionHeader, source(refs→team \| inline[]), members, variant(grid/carousel)                       |
| 10  | `logos`           | Logo/brand strip (keep `Logos`)   | heading?, logos[]{media, name, link}                                                                |
| 11  | `engagement`      | Engagement models                 | sectionHeader, source(refs→model \| inline[]{title, subtitle, description, idealFor})               |
| 12  | `globalDelivery`  | Animated-globe delivery section   | heading, description, title, excerpt, media                                                         |
| 13  | `ctaBanner`       | CTA (keep `Cta`, uses `ctaGroup`) | ctaGroup{heading, description, buttons[2], bgMedia}                                                 |
| 14  | `jobsList`        | Open roles (keep `Jobs`)          | heading, description, list(rel→job)                                                                 |
| 15  | `contactRoutes`   | Contact routing cards             | sectionHeader, routes[]{title, description, email, replyWindow, cta, bestFor[]}                     |
| 16  | `contactOffices`  | Office cards                      | sectionHeader, offices[]{city, tag, timezone, hours, email, phone, address[]}                       |
| 17  | `contactForm`     | Embedded form                     | heading, description, form(rel→forms)                                                               |
| 18  | `storiesArchive`  | Featured + archive grid           | featured{story, stats[], highlights[]}, items(poly story/insight), pressReleases?                   |
| 19  | `subscribe`       | Newsletter signup                 | heading, description, followOptions[], emailPlaceholder, buttonLabel, disclaimer, preview{...}      |
| 20  | `categoryLanding` | Category tiles                    | sectionHeader, categories[]{title, description, icon, media, link, linkLabel}                       |

Net: **20 blocks** replace 7 monoliths + 10 homeSections + the current generics. `Content`, `Cta`,
`Logos`, `Jobs`, `Steps`, `Team`, `RelationGrid`, `FeatureGrid` are kept/renamed/extended; the rest
are new or extracted from the monolith Components.

## 2. Field factories (`src/fields/`)

Keep `ctaGroup`, `image`, `link`, `sectionHeader`. Add:

- `buttonsField({max})` — array of `link()` (label/url/variant) → replaces all 6 inline `button_1`/`button_2`.
- `mediaField({altRequired})` — upload + required alt (a11y).
- `iconSelect(options)` — typed picker (lock/activity/check/shield-check/workflow/book-check/newspaper/flask-conical/lightbulb/file-text).
- `cardsArray()`, `statsArray()`, `stepsArray()`, `tagsArray()` — standard repeatables, each with a RowLabel.
- `src/blocks/_ui/RowLabel.tsx` — generic preview (title→name→label→heading→"Item N").

## 3. Per-page composition (new block order)

| Page           | New blocks (in order)                                                                                                                                                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **home**       | hero(intro)? · relationGrid(about.items — the **top-8 cards**) · logos(organizations) · relationGrid(solutions) · featureBento(capabilities) · feature(capabilities-leadership) · relationGrid(industries) · relationGrid(scales) · engagement · globalDelivery · process · teamGrid · jobsList(opportunities) |
| **about**      | hero · feature(fundingStory) · richText(about) · cardGrid(ourThesis) · cardGrid(whatWeBelieve) · cardGrid(ourApproach) · stats(proofOfScale)+logos(company stack) · teamGrid(leadership, inline) · ctaBanner                                                                                                   |
| **solutions**  | hero(+hero.cards→cardGrid) · feature×4 (section_2..section_5, each: badge/title/desc/media + who/shape → feature w/ detail list) · engagement(engage) · ctaBanner                                                                                                                                              |
| **industries** | hero(heroSection) · relationGrid(industryList) · richText(details) · featureBento(perIndustryPanels) · cardGrid(crossIndustryPatterns) · cardGrid(regulatoryPosture, icons) · ctaBanner                                                                                                                        |
| **scales**     | hero(+heroSection.items→cardGrid) · cardGrid(qualityBar, icons) · relationGrid(scale) · ctaBanner                                                                                                                                                                                                              |
| **contact**    | hero(+buttons) · stats · contactRoutes · contactOffices · contactForm · ctaBanner                                                                                                                                                                                                                              |
| **careers**    | hero(+button) · cardGrid(section_2: item_1..item_6) · cardGrid(section_3: item_1..item_4) · process(section_4: item_1..item_5 incl. levels) · teamGrid(team) · jobsList(jobs)                                                                                                                                  |
| **stories**    | hero(heroSection) · storiesArchive(featureCaseStudy + allStoriesGrid) · categoryLanding · subscribe                                                                                                                                                                                                            |

## 4. Old→new field map (migration contract, by source)

Cryptic groups collapse into arrays/known blocks:

- **careers** `section_2.item_1..item_6` (each {heading, description}) → `cardGrid.cards[]` {title←heading, excerpt←description}. Same for `section_3.item_1..item_4`.
- **careers** `section_4.item_1..item_5` (+ `item_1.levels[]`) → `process.steps[]` (levels → steps) + `cardGrid` for the rest.
- **solutions** `section_2..section_5` {badge, title, description, image, whoTitle, whoDescription, shapeTitle, shapeDescription, trajectory/techStack/incident} → `feature` per section: eyebrow←badge, heading←title, description←description, media←image; the who/shape pairs → a `feature.detail[]` two-item list (label/value); trajectory/techStack/incident → `process`/`tags` sub-block where present.
- **\*.cta** {heading, description, button_1, button_2, backgroundImage} → `ctaBanner` via `ctaGroup` (buttons[]←[button_1, button_2]).
- **\*.hero(+cards)** → `hero` + (cards → `cardGrid` if present).
- **about.proofOfScale** {items[], company{items[]{stack[]}}} → `stats` (items) + `logos`/`cardGrid` (company).
- **about.leadership.members[]** (inline {name, position, story, specialization, image, socials}) → `teamGrid` inline source (or team refs — **decision §5b**).
- **home.about.items** (poly) → `relationGrid` (mixed) — **preserve existing 8 refs by id/poly** (the "top-8-cards" lesson).
- **home.capabilities** {capability refs} + {heading_2/description_2/image = leadership} → `featureBento`(capabilities) + `feature`(leadership).
- All `*.items[]{title, excerpt, image}` patterns → `cardGrid.cards[]`.
- All `icon` selects keep their option sets via `iconSelect`.

Relationships migrate **by id / `{relationTo,value}` at depth-0** (same as the prior migration);
existing refs are preserved, never silently re-pointed.

## 5. Decisions — RESOLVED (2026-06-18)

- **a.** hero & feature ship as **two slugs** (clearer picker). ✓
- **b.** about leadership → **`team` collection refs** (create/link 4 team docs; single source of truth). ✓
- **c.** solutions who/shape pairs → **`feature.detail[]`** 2-row list. ✓
- **d.** migrate from the **current `pages` collection** block data. ✓
- **e.** clone-first → render-diff → **prod on explicit sign-off**; old blocks stay registered until verified. ✓

### (original) Decisions to confirm before code

- **a. `feature` vs `hero`** — they share fields; OK to ship them as two slugs (semantic: hero=page-top, feature=mid-page) rather than one block with a `prominence` select? (Recommend: two slugs, clearer in the picker.)
- **b. about `leadership`** — keep the 4 leaders as an **inline** array on `teamGrid`, or convert them to `team` collection refs (so they're managed once and reused on /careers)? (Recommend: team refs — single source of truth.)
- **c. solutions `section_2..5` who/shape pairs** — render as a `feature.detail[]` 2-row list (recommend) vs separate small blocks.
- **d. Migration source** — read the **current `pages` collection** block data (globals are retired) and map in place. Confirm OK (vs re-deriving from anything else).
- **e. Rollout** — clone-first, full render-diff, then **prod on explicit sign-off**; keep old blocks registered until verified. (Standing guardrail — confirm.)

## 6. What does NOT change

Rendered design (render-diff gate), the `pages` collection itself, detail-route collections
(story/capability/insight/etc.), Header/Footer/LegalCenter, the contact form plugin.
