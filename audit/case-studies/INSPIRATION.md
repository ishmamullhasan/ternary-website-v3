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

---

# accenture.com — layout takeaways for interleaving stories, insights, and services

Studied 2026-07-28 (`https://www.accenture.com/us-en` + `/us-en/services/data-ai`). How Accenture
mixes case studies, insights, and services on a single page, and what maps to our hubs and detail
routes.

1. **Insights lead, services follow, stories prove.** The homepage gives its prime carousel real
   estate to research/perspectives, then services, then a client-stories band — editorial first,
   catalogue second, proof third. → Our capability/solution pages can keep the same arc: define
   the practice, then show the work behind it, then link one relevant insight.
2. **One card grammar for every content type.** Research reports, perspectives, case studies, and
   blog posts all share a single card pattern — eyebrow category label, headline, 1–2 sentence
   body, one action-verb CTA. Only the eyebrow tells you the type. → Reuse one related-card
   component across "Related work" / "Related insights" and let a small mono eyebrow ("Case study",
   "Insight") carry the distinction.
3. **A mixed "What's trending" band interleaves types deliberately.** On the services page, case
   studies sit *inside* the same carousel as research and blog posts rather than in a separate
   section — the practice page becomes a feed of everything that validates it. → A capability page
   can mix its proof rows and one insight card in a single "From this practice" band instead of
   two thin sections.
4. **Case-study cards can be text-only.** The homepage's six client stories run with no imagery at
   all — client + outcome headline, 1–2 sentences, "Read more". Proof reads fine without media
   when the headline names the client and the change. → Our proof rows don't need thumbnails;
   meta ("Sector · Client") + a concrete title does the work.
5. **Cards link outward to the story, not sideways to services.** Stories link to their own full
   pages; service associations live in the story body, not as chips on the card. The hub page is a
   dispatcher, never a dead end. → Keep proof rows linking straight to `/case-studies/<slug>`;
   don't clutter cards with capability chips.
6. **Service cards are expandable summaries with deep links.** The services grid is 6–8 cards,
   each headline + subhead + 1–2 sentences + "Learn more" to a sub-service page — depth lives one
   click away, never on the hub. → Matches our related-capability rail; keep excerpts to one
   sentence and push detail to the detail route.
7. **Every section is a distinct exit ramp.** Sequence on the services page: hero → stats →
   service cards → mixed trending feed → partners → awards → news → leadership → careers CTA.
   Each band offers a different onward journey, so the page ends in invitations, not summary. →
   Our detail pages should keep ending in two CTAs (talk to us / browse the hub) after the proof
   and related bands.
8. **Restraint in copy density is systematic.** Across both pages nearly everything is headline +
   ≤2 sentences + one CTA; long-form never appears on hub surfaces. (Their stats bands are the one
   pattern we deliberately do NOT copy — our house rule is no numbers-as-boasts.) → Hold proof-row
   problem/approach/outcome to 1–2 plain sentences each.
