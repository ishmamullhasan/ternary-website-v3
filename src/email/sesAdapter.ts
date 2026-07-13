import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'

/**
 * Amazon SES email transport for Payload (transactional mail + form-builder notifications).
 *
 * Sends through the corporate SES account (ap-southeast-1) over SMTP/STARTTLS using the
 * dedicated `corporate-ses-smtp-website` IAM credentials — the same per-app pattern used
 * across the rest of the Ternary stack (odoo, twenty, documenso, shelf, supabase, cal.com).
 * The `ternary.solutions` domain is DKIM-verified and the SES account is in production
 * (50k/day, 14/s), so no sandbox or domain work is required.
 *
 * When SMTP credentials are absent (local dev / CI), returns `undefined` so Payload falls
 * back to its built-in console/ethereal mock transport instead of failing to boot.
 */
export async function sesEmailAdapter(): Promise<EmailAdapter<unknown> | undefined> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_USER || !SMTP_PASS) {
    return undefined
  }

  return nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@ternary.solutions',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Ternary',
    transportOptions: {
      host: SMTP_HOST || 'email-smtp.ap-southeast-1.amazonaws.com',
      port: Number(SMTP_PORT) || 587,
      // STARTTLS on 587 (SES SMTP). `secure: true` would be for implicit TLS on 465.
      secure: false,
      requireTLS: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    },
  })
}
