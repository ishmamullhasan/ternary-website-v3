# Prompt for the marketing team — editing yh16 website content via Claude Code

Give this to whoever will update the **yh16 preview site** content. They should:
1. Have this repo (`ternary-website-v3`) open in Claude Code.
2. Have the **Atlas connection string** ready (the "cluster link" — the founder/admin provides it).
   It looks like `mongodb+srv://ternary-preview:…@cluster0.xxpag78.mongodb.net/ternary-local?...`.
3. Paste the prompt below into Claude Code, then paste the connection string when Claude asks.

---

## ✂️ Paste this into Claude Code:

> I want to change some content on our **yh16 preview website** (the Ternary site at
> `https://ternary-website-v3-yh16.vercel.app`). Before doing anything, **read the file
> `TERNARY-YH16-CMS-CONTEXT.md` in this repo** — it explains how our content, database, and deploys
> work. Follow it exactly.
>
> Hard rules:
> - Only ever change the **yh16 preview** site. **Never** touch the live company site
>   `ternary.solutions` or its database (the one on host `54.254.242.76` / DB named `ternary`). If a
>   connection string looks like production, stop and ask me.
> - Our content lives in the **Atlas `ternary-local` database**. I will paste the Atlas connection
>   string for you to use — run seed scripts with it via `DATABASE_URI='<that string>' …`, not the
>   repo's localhost `.env`.
> - When you write to the database in a seed script, you **must** use `disableTransaction: true` on
>   every `payload.update`/`create`, or the write silently rolls back on Atlas (the context doc
>   explains why). After writing, **read it back** with `scripts/inspect-legal-db.ts` (or an
>   equivalent) to confirm it actually persisted before telling me it's done.
> - To make the change show up on the live yh16 site: **bump the affected page's `unstable_cache`
>   key version** (e.g. `_v3 → _v4`), then commit and push to the `staging` remote's `main` branch
>   (`git push staging main`) — that triggers the yh16 deploy. `git fetch` + `git rebase staging/main`
>   first, and commit with `--no-verify` (our commit hook wants a Jira key we don't have — don't
>   invent one). Never push to `origin`.
> - After it deploys (~3 min), **verify** by fetching the live page and confirming the new text is
>   there. Don't claim it's live until you've checked.
> - Log what you changed in `COPY_CHANGELOG.md`.
>
> The change I want is: **[DESCRIBE THE CONTENT CHANGE HERE — which page/section, old text → new
> text, or what to add/remove]**
>
> Ask me for the Atlas connection string now, then proceed.

---

**Notes for the person handing this over**
- Give her the Atlas connection string over a secure channel (not email/Slack in plain text if you
  can avoid it). It grants full read/write to the preview content DB.
- She never needs production credentials for this.
- If she's changing *legal* pages specifically, the copy is in
  `scripts/content/legal-content.data.ts` and the `[CONFIRM: …]` markers are intentional
  placeholders for unconfirmed company facts — she shouldn't fill those unless you've given her the
  confirmed values.
