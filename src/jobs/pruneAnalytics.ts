import type { TaskConfig } from 'payload'

// Retention task (WEB-447): deletes analytics rows older than `days` (default 90). Keeps the
// pageview log bounded so the collection doesn't grow without limit.
//
// HOW TO SCHEDULE (no new infra — uses Payload's own jobs run endpoint, which is already gated by
// jobs.access.run = CRON_SECRET in payload.config.ts):
//   1. Set CRON_SECRET in the environment.
//   2. Add a Vercel Cron in vercel.json that hits the Payload jobs run endpoint, e.g. daily:
//        {
//          "crons": [
//            { "path": "/api/payload-jobs/run?queue=nightly", "schedule": "0 3 * * *" }
//          ]
//        }
//      Vercel sends the cron request with `Authorization: Bearer $CRON_SECRET`, which
//      jobs.access.run already validates. The run endpoint then executes queued/scheduled tasks.
//   3. To enqueue this task on that schedule, either add a `schedule` block to this TaskConfig, or
//      queue it from a thin route/cron and let the run endpoint pick it up.
// (Left as a note per WEB-447: wire the actual cron when deploying — do not invent infra here.)

const DEFAULT_RETENTION_DAYS = 90

export const pruneAnalyticsTask: TaskConfig<'pruneAnalytics'> = {
  slug: 'pruneAnalytics',
  label: 'Prune old analytics rows',
  inputSchema: [
    {
      name: 'days',
      type: 'number',
      defaultValue: DEFAULT_RETENTION_DAYS,
      admin: {
        description: 'Delete analytics pageviews older than this many days.',
      },
    },
  ],
  outputSchema: [
    {
      name: 'deleted',
      type: 'number',
    },
  ],
  handler: async ({ input, req }) => {
    const days = typeof input?.days === 'number' && input.days > 0 ? input.days : DEFAULT_RETENTION_DAYS
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { docs } = await req.payload.delete({
      collection: 'analytics',
      where: { timestamp: { less_than: cutoff } },
      req,
    })

    return { output: { deleted: docs.length } }
  },
}
