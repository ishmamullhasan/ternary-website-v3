# fantasy.co — presentation takeaways for the stories redesign

Studied 2026-07-27 (`https://fantasy.co/` + `/work`). What makes their work presentation feel
premium, and how each observation maps to our stories index + case-study detail.

1. **Media leads, text follows.** Every work item is anchored by one large media area; the title
   and a single line of copy sit against or under it. → Story cards and the detail hero should lead
   with the story's CMS image (or a structured GradientPanel placeholder awaiting client assets),
   not with paragraphs.
2. **One confident sentence per item.** Index descriptions are a single action-oriented line
   ("Replatforming a sports league with full-stack AI, design through deployment") — capability and
   transformation, never feature lists. → Excerpts get compressed to one plain, confident sentence.
3. **Numbered eyebrow rhythm.** Items carry a mono-style "01 /" sequence label that paces the page
   and signals order/process. → Use our existing `SectionMarker` / `font-mono` tabular-nums language
   ("01 / Case study") on index rows and detail sections.
4. **Whitespace is the layout.** Sections are separated by generous vertical gaps rather than
   rules or background changes; density never rises. → `py-24 lg:py-32` rhythm, wide gutters
   (`px-5 md:px-8 lg:px-12`), one idea per band.
5. **Single-column editorial index, not a dense grid.** Work reads as a sequence of large discrete
   moments you scroll through, each given full attention. → The stories band gets large-format
   editorial cards (feature-scale rows) instead of uniform small tiles.
6. **Short commanding statements over explanations.** Headlines are 2–5 words; the lyric copy is
   saved for one supporting paragraph. → Detail-hero title big and tight; the "story rail" copy
   stays to a sentence or two.
7. **Narrative page order.** Home flows mission → services → work → CTA as one arc, present tense
   into proof into invitation. → Detail page keeps a single arc: statement → media → story →
   visuals → related → talk.
8. **Case-study label as a quiet chrome element.** A small "Case study" eyebrow above the title
   does the categorization; the title itself is purely the client/product. → Keep category chips
   small, mono, muted — never compete with the title.
9. **Navigation restraint.** Minimal chrome around the work; the content is the interface. → Keep
   the filter bar utilitarian and compact; no extra decoration around cards.
10. **Process implied by sequence, not claimed by adjectives.** The numbered system (01/02/03)
    conveys methodology without saying "our proven process." → Let section numbering and structure
    carry rigor; keep copy free of self-praise and of quantified claims.

Key five applied (summary): media-forward hero areas from CMS thumbnails · one-sentence confident
excerpts · mono numbered eyebrows (`SectionMarker`) · roomy single-idea vertical rhythm · large
editorial index cards instead of a uniform small-tile grid.
