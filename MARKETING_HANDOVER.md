# Ternary website — marketing/copy handover

Welcome! This is the guide for working on the Ternary website's **copy and content** using Claude
Code. You don't need to be technical — Claude does the mechanics; you bring the words and judgment.

---

## 1. The 30-second mental model

- The website is at **https://ternary-website-v3-yh16.vercel.app** — this is the **staging/review
  site**. Everything we change shows up here first (never on the real ternary.solutions until it's
  approved and copied over).
- Two kinds of change:
  - **Copy / content** (headlines, page text, case studies, news articles) → lives in a **database
    (CMS)**. This is 95% of your work.
  - **Design / layout** (spacing, colors, animations) → lives in **code**. Claude handles this if
    you ask, but it's mostly done.
- **Claude Code** is a tool you run in a terminal. It reads the project, makes the change you
  describe, publishes it to staging, and you review it on the URL above. It takes a few minutes for
  a change to appear after Claude says "deployed."

---

## 2. The golden copy rules (most important part)

Every piece of writing on this site must follow these. Tell Claude to hold to them, and check its
drafts against them:

1. **Audience:** new business owners and enterprise clients looking for a trustworthy partner. A
   non-technical reader must understand every sentence.
2. **Plain language.** No jargon without a plain-English explanation. (Say "authorization-ready,"
   not "ATO-ready.")
3. **Tell a story / be marketing-friendly** — but short and to the point. Comprehensive, not walls
   of text.
4. **NEVER quantify achievements.** No percentages, no "60% faster," no "in 3 weeks." (Certifications
   like ISO 27001 / SOC 2 are facts and are fine.)
5. **NEVER invent anything** — no client names, metrics, or claims that aren't in our approved
   sources. If we don't have a fact, we leave the space empty rather than make something up.
6. **Voice:** confident, plain-spoken, "engineering institution." Avoid hype words ("world-class,"
   "cutting-edge," "revolutionary").
7. **Trademarks:** Frame™ · Flow™ · Orchestra™ (always ™).

**Approved source material** (Claude already has these in the project — the ONLY places real facts
come from):
- `audit/deck/DECK_COPY.md` — the company deck
- `audit/case-studies/SOURCES.md` — the case-study write-ups
- Existing approved copy already on the site

---

## 3. Connect Claude to the repo (pick ONE — you already have repo access as a collaborator)

You do **not** have to clone anything. Two ways to connect Claude to the repo:

**Option A — Claude on the web (no download, easiest).**
1. Sign in at **https://claude.ai** with your account.
2. Connect your **GitHub** and select the repository **`sajid209-stack/ternary-website-v3`**.
3. Start a session on that repo and paste the prompt in section 4. Claude works on the repo in the
   cloud — nothing is installed on your computer.

**Option B — Claude Code on your computer (one-time clone, most powerful).**
1. Install Claude Code: https://claude.com/claude-code
2. In a terminal: `git clone https://github.com/sajid209-stack/ternary-website-v3.git` then
   `cd ternary-website-v3` (sign in to GitHub with your own account when asked — you have access).
3. Run Claude Code in that folder and paste the prompt in section 4.

**Get these from Sajid privately — never paste into email/Slack/chat:**
- The **database connection string** (lets Claude publish copy changes; you paste it into Claude only
  when it asks). Without it Claude can still read everything and draft copy, but can't publish
  content changes.

_(Simplest alternative for small text tweaks, no Claude at all: the CMS dashboard at
`https://ternary-website-v3-yh16.vercel.app/admin` — ask Sajid for a login. Good for quick edits;
use the Claude prompt below for anything bigger.)_

---

## 4. The prompt to paste into Claude Code (start every session with this)

Copy everything between the lines:

---
```
You are helping me with COPY and CONTENT for the Ternary website. Before doing anything, read these
files in the project so you have full context: HANDOFF.md, MARKETING_HANDOVER.md, CLAUDE.md,
REDESIGN_PLAN.md, COPY_CHANGELOG.md, and audit/deck/DECK_COPY.md. Then confirm you've read them and
summarize the copy rules back to me in 5 bullets.

How we work:
- The review site is https://ternary-website-v3-yh16.vercel.app — I check changes there.
- Copy/content lives in the CMS database (a MongoDB Atlas "staging cluster"), NOT in git. I will
  paste the database connection string when you ask for it. Use it ONLY to write to that staging
  cluster — never any other database, and never a production database.
- Follow the established pattern in this repo exactly: make CMS changes with an idempotent mongosh
  seed script under scripts/, run and verify it, bump the relevant unstable_cache key so the change
  surfaces, log every content change in COPY_CHANGELOG.md, then deploy the way this repo always does:
  branch off fresh main, commit with --no-verify (co-author line for Claude), open a PR via the
  GitHub API and squash-merge it, then sync the fork with `git push staging origin/main:main`
  (fast-forward only, never force-push). If a "staging" remote for github.com/sajid209-stack isn't
  set, add it.
- After you deploy, tell me the change may take a few minutes to appear on the review URL.

Hard rules for all copy (do not break these):
1. Plain language a non-technical business owner understands; explain any technical term.
2. Never quantify achievements (no %, counts, or timeframes as boasts). Certifications are OK.
3. Never invent clients, metrics, or claims. Only use facts from DECK_COPY.md,
   audit/case-studies/SOURCES.md, or copy already approved on the site. If a fact is missing, leave
   the space empty and tell me what you'd need.
4. Confident, plain-spoken "engineering institution" voice; no hype words.
5. Trademarks are Frame™ / Flow™ / Orchestra™.
6. Within any card group, keep every card's text a similar length so they align.

Do NOT touch the real production site or production database. When unsure whether something is a
fact we can claim, stop and ask me. Now, wait for my first task.
```
---

Then just talk to it in plain English, e.g.:
- *"Rewrite the About page's culture section to be warmer and shorter."*
- *"Draft a news article about the LankaBangla case study for the insights section."*
- *"The Solutions page hero feels too corporate — give me three friendlier options."*
- *"Check the Industries pages and flag any copy that sounds too technical."*

---

## 5. How to review

After Claude says "deployed," wait ~3–5 minutes, then open
**https://ternary-website-v3-yh16.vercel.app**, hard-refresh (Ctrl+Shift+R), and read the page.
If something's off, just tell Claude what to change — you can iterate as many times as you like.

---

## 6. What NOT to do

- Don't paste the database string or any password into email, Slack, or a shared doc — terminal only.
- Don't force-push, and don't approve/merge anything to the **real** ternary.solutions — staging only.
- Don't let Claude write numbers, client names, or claims you can't point to a source for. When in
  doubt, ask Sajid.

## 7. Who to ask

- **Sajid** — for the database connection string, GitHub access questions, and "can we say this
  publicly?" approvals.
- The full change history and pending "copy to production later" list is in `COPY_CHANGELOG.md`.

Everything you publish goes to the **staging** review site. Making it live on the real
ternary.solutions is a separate, deliberate step Sajid controls.
