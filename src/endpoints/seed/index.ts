import type { Payload, PayloadRequest } from 'payload'

export const seed = async ({ payload, req: _req }: { payload: Payload; req: PayloadRequest }): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info('— Seeding demo user...')
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: 'demo@example.com' } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    await payload.delete({ collection: 'users', id: existing.docs[0].id })
  }

  await payload.create({
    collection: 'users',
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password',
    },
  })

  payload.logger.info('— Seeding globals (header, footer, homepage)...')
  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        siteName: 'Ternary Solutions',
        menu: [],
      },
      context: { disableRevalidate: true },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        menu_1: {
          siteName: 'Ternary Solutions',
          description: 'Building products that shape the lives of millions every single day',
          copyright: `© ${new Date().getFullYear()} Ternary Solutions`,
        },
      },
      context: { disableRevalidate: true },
    }),
    payload.updateGlobal({
      slug: 'homePage',
      data: {},
      context: { disableRevalidate: true },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}
