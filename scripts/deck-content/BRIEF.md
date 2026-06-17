# Ternary website content build — shared brief

You are authoring website copy for **Ternary Solutions**, derived from the company pitch deck. The full
verbatim deck text is in `scripts/deck-content/_deck-source.json` (a JSON array; each entry has a slide
number and its text). Read it for source material.

## Voice & rules
- Ternary is an **engineering institution** — New York HQ, Dhaka delivery hub. Tone: calm, precise,
  senior, declarative. Themes: **ownership/stewardship, transparency/low-noise execution, proximity to
  users/impact, production responsibility across the lifecycle**.
- **Polish & tighten** the deck copy. FIX the source's errors: slide 12 has a spliced/corrupted sentence;
  slide 26's Turfly blurb is mislabeled "Flex5"; the paragraph "From early-stage startups building MVPs…"
  is repeated as filler on ~10 slides (it is the *Scales* tagline — use it only for scales, not as filler).
  Remove duplicated sentences. Convert deck fragments into clean web sentences.
- **Do NOT fabricate metrics or facts.** Only Turfly has explicit numbers in the deck (60% faster booking,
  95%+ policy compliance, 85% mobile adoption in 30 days) — those may be used. For every other case study
  the deck explicitly says quantitative KPIs are not disclosed: describe delivered capability, not invented
  numbers. Keep trademark terms exact: **Frame™, Flow™, Orchestra™**. Keep proper nouns exact.
- Replace placeholder copy entirely; write real, final marketing copy. Concise > verbose. Web reading.

## richText convention
Any field that is richText must be provided as an array of "blocks":
```
"contentBlocks": [ { "heading": "Optional H3 heading or omit", "paras": ["paragraph 1", "paragraph 2"] } ]
```
The seed script converts this to Lexical. For plain text/textarea fields, just give a string.

## Output
Write ONE JSON file to the path your task names, valid JSON (UTF-8, no comments, no trailing commas).
Match the requested schema's field names EXACTLY. Return only a one-line confirmation (path + record count).

## Fixed slug registry (use these slugs verbatim for cross-references)
- **story** (8): `counterfoil-continuum`, `turfly`, `alley-analytix`, `flex5`, `farogl-odoo-erp`,
  `doyouwork`, `hissho-sushiops360`, `lankabangla-securities`
- **solution** (3): `product-development`, `enterprise-modernization`, `engineering-augmentation`
- **capability** (6): `data-analytics`, `artificial-intelligence`, `cloud-transformation`,
  `digital-experiences`, `platforms`, `internet-of-things`
- **industry** (8): `banking-capital-markets`, `financial-services-insurance`, `advanced-manufacturing`,
  `sports-entertainment`, `hospitality-travel`, `consumer-goods`, `software-platforms`, `healthcare`
- **model** (3): `frame`, `flow`, `orchestra`
- **scale** (5): `startups`, `scale-ups`, `mid-market`, `enterprise`, `government-defense`
- **team** (16, slug auto-derives from name): Shadman Shakib (Founder), Sajid Islam (Chief Revenue
  Officer), Shakil Ahmed (Chief Technology Officer), Nahid Reza (Head of Engineering), Ashraful Alam Shemul
  (Software Engineer), Israt Zahin (Software Engineer), Md. Shahriar Hasan (Software Engineer), Farzana
  Rahman Supti (Software Engineer), Raufur Mukit Aman (Software Engineer), Afra Anan (Software Engineer),
  Gazee Muzeeru (Associate Legal Counsel), Sakib Hossain (Associate Facilities Manager), Alimus Shams
  (Partnerships Manager), Ariba Chowdhury (Marketing Specialist), Samin Luban (Business Analyst), Kazi
  Ishmam Ull Hasan (Product Designer)

## Contact facts (from deck slide 49)
hello@ternary.solutions · ternary.solutions · +1 (800) 123-4567 · New York | Dhaka
