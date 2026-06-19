import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

/**
 * Auth.js (NextAuth v5) configuration for Google Workspace SSO into the Payload admin panel.
 *
 * Sign-in is locked to the ternary.solutions Workspace. The `hd` authorization param is only a
 * hint to Google's account chooser and is trivially bypassable, so the real gate is the `signIn`
 * callback below, which requires a verified email AND the `hd` claim (present only on Workspace
 * accounts). Returning false there blocks both login and user auto-provisioning.
 *
 * The Google provider is only attached when AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are present, so
 * the admin keeps working with email/password login until the OAuth client is created. Auth.js v5
 * auto-reads those two env vars, so they are not passed explicitly here.
 *
 * Setup: docs/claude/google-admin-sso.md.
 */
const ALLOWED_HD = 'ternary.solutions'

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

export const authConfig: NextAuthConfig = {
  providers: googleConfigured
    ? [
        Google({
          // Link the Google identity to a pre-existing Payload user with the same email instead of
          // throwing OAuthAccountNotLinked. Normally "dangerous" (an unverified-email provider could
          // be used to hijack an account), but safe here: Google verifies email ownership and the
          // signIn callback below hard-gates on email_verified + hd === ternary.solutions, so the
          // email is guaranteed to belong to the Workspace user.
          allowDangerousEmailAccountLinking: true,
          authorization: {
            params: {
              hd: ALLOWED_HD,
              prompt: 'select_account',
            },
          },
          // Maps the Google profile into the Payload `users` doc on first sign-in. Auth.js does
          // not re-run this after the first login (see the runbook for refreshing on each login).
          profile(profile) {
            return {
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
            }
          },
        }),
      ]
    : [],
  callbacks: {
    // The actual domain gate — `hd` param above is only a UI hint.
    signIn({ account, profile }) {
      if (account?.provider !== 'google') return false
      const p = profile as { email_verified?: boolean; hd?: string; email?: string }
      return p.email_verified === true && p.hd === ALLOWED_HD && Boolean(p.email?.endsWith(`@${ALLOWED_HD}`))
    },
  },
}
