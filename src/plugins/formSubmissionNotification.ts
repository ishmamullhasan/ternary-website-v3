import type { CollectionAfterChangeHook } from 'payload'

/**
 * Notify the team whenever a form-builder submission is created (WEB-452).
 *
 * Wired into formBuilderPlugin via `formSubmissionOverrides.hooks.afterChange`. On a `create`
 * we build a readable email from the form name + submitted fields and hand it to
 * `req.payload.sendEmail`, which routes through the SES email adapter in production. When no
 * email transport is configured (local dev) Payload's default adapter just logs to the console,
 * so this is a safe no-op there.
 *
 * The whole thing is wrapped in try/catch: a notification failure must never block or fail the
 * submission itself — the candidate/visitor still gets their confirmation.
 */
export const sendFormSubmissionNotification: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  try {
    // `form` may be a populated Form doc or just its id depending on hook depth — read the title
    // defensively and fall back to the raw value so we always have something to show.
    const form = doc?.form as { title?: string | null } | string | undefined
    const formName = (typeof form === 'object' && form?.title) || 'Website form'

    const rows = Array.isArray(doc?.submissionData)
      ? (doc.submissionData as Array<{ field: string; value: string }>)
      : []

    const escapeHtml = (value: string): string =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const fieldRows = rows
      .map(
        ({ field, value }) =>
          `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top">${escapeHtml(
            field,
          )}</td><td style="padding:4px 0">${escapeHtml(value ?? '')}</td></tr>`,
      )
      .join('')

    const subject = `New submission: ${formName}`
    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#1b1a17">
        <p>A new submission was received from the <strong>${escapeHtml(formName)}</strong> form.</p>
        <table style="border-collapse:collapse">${fieldRows || '<tr><td>(no fields)</td></tr>'}</table>
      </div>
    `

    await req.payload.sendEmail({
      to: process.env.FORM_NOTIFICATION_EMAIL || 'hello@ternary.solutions',
      from: process.env.EMAIL_FROM_ADDRESS,
      subject,
      html,
    })
  } catch (err) {
    // Don't block the submission — just record why the notification didn't go out.
    req.payload.logger.error({ err, msg: 'Failed to send form submission notification email' })
  }

  return doc
}
