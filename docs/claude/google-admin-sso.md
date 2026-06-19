# Google Workspace SSO for the Payload admin

Lets Ternary staff sign into the Payload admin (`/admin`) with their `@ternary.solutions`
Google account, in addition to (or instead of) email/password. Built on **Auth.js v5**
(`next-auth@beta`) via **`payload-authjs`**.

## Status

The code is wired and ships **inert**: the "Sign in with Google" button only appears once
`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are set. Until then the admin uses email/password login
and nothing changes for editors.

### Provisioned (2026-06-19)

The OAuth client **exists** — Step 1 below is already done:

- Google Cloud project: **`internal-system-integration`** (`macro-magpie-429318-t8`), alongside the other
  `Ternary <App>` internal clients. Consent screen audience = **Internal** (org-restricted to the Workspace).
- Client name: **Ternary Website** (Web application). Client ID `745762977934-v3fdud22fc8l7mpqc4h4acibj4p3ldb2.apps.googleusercontent.com`.
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`,
  `https://ternary.solutions/api/auth/callback/google`. JS origins: `http://localhost:3000`, `https://ternary.solutions`.
- Local `.env` already has `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `AUTH_SECRET` / `AUTH_TRUST_HOST`.

**Remaining to go live:** (1) restart the dev server to load the new env/deps and confirm the Google
button on `/admin`; (2) set the same four `AUTH_*` vars on the production host; (3) if the prod admin
isn't served at `https://ternary.solutions`, edit the redirect URI on the client to match.

## How it works

| Piece                                          | File                                      |
| ---------------------------------------------- | ----------------------------------------- |
| Auth.js config + Google provider + domain gate | `src/auth.config.ts`                      |
| Payload-bound Auth.js instance                 | `src/auth.ts`                             |
| Auth.js route handler (`/api/auth/*`)          | `src/app/api/auth/[...nextauth]/route.ts` |
| Plugin registration                            | `src/plugins/index.ts` (`authjsPlugin`)   |

- **Domain lock** — sign-in is restricted to the `ternary.solutions` Workspace in the `signIn`
  callback (`email_verified === true && hd === 'ternary.solutions'`). The `hd` authorization
  param is only a chooser hint; the callback is the real gate.
- **Provisioning** — on first successful Google login, `payload-authjs` auto-creates the Payload
  `users` doc (id/name/email/image from the Google profile). Any verified `@ternary.solutions`
  account that passes the gate becomes an admin. To restrict further, add an allowlist check
  inside the `signIn` callback (env list or a Payload collection lookup).
- **Roles** — Google's OIDC profile carries no Workspace group/role data. `profile()` runs only
  on first login; to refresh fields on every login use the `signIn` _event_ with
  `adapter.updateUser`. Real role assignment is your own logic (email map / Directory API).

## Step 1 — Create the Google OAuth client (Console-only; not scriptable)

Google Cloud Console → **APIs & Services → Credentials → Create credentials → OAuth client ID →
Web application**:

- **Authorized JavaScript origins**
  - `http://localhost:3000` (dev)
  - `https://<prod-domain>` (e.g. `https://ternary.solutions`)
- **Authorized redirect URIs** (exact path matters)
  - `http://localhost:3000/api/auth/callback/google`
  - `https://<prod-domain>/api/auth/callback/google`
- **OAuth consent screen**: User type = **Internal** (restricts to the Workspace, no Google
  review needed). Scopes: defaults `openid email profile` only — no sensitive scopes, no
  verification.

Copy the **Client ID** and **Client secret**.

> The classic Web-application OAuth client is Console-only. `gcloud iam oauth-clients` is a
> different product (workforce identity federation) and does not create this.

## Step 2 — Set env vars

Local `.env` and the production host (Vercel / Payload Cloud):

```
AUTH_SECRET=<openssl rand -base64 33>   # already set locally
AUTH_TRUST_HOST=true                    # required behind a proxy / on Vercel
AUTH_GOOGLE_ID=<client id>
AUTH_GOOGLE_SECRET=<client secret>
```

Redeploy. The "Sign in with Google" button appears under the login form. No code change needed.

## Options

- **SSO-only admin** (hide the password form): override the login view via
  `admin.components.views.login`, or pass `components.SignInButton` options to `authjsPlugin`.
- **Tighter allowlist**: extend the `signIn` callback in `src/auth.config.ts`.
- **Rolling sessions**: add a Next 16 `proxy.ts` re-exporting `auth` (optional).

## Caveat

Auth.js v5 is still **beta** and is folding into "Better Auth"; a stable v5 may never ship.
It works today and `payload-authjs@0.10.2` targets it, but this is a beta dependency in the
production CMS. If that risk needs removing later, the fallback is a hand-rolled Payload custom
auth strategy, or a non-beta plugin (e.g. `@papercup/payload-auth-plugin`).
