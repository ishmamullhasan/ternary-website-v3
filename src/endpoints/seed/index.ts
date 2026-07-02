import type { Payload, PayloadRequest } from 'payload'

export const seed = async ({ payload, req: _req }: { payload: Payload; req: PayloadRequest }): Promise<void> => {
  payload.logger.info('Seeding database...')

  // NOTE: the template's demo-user seed (demo@example.com / "password") was removed — it created a
  // weak credential in the DB and is unnecessary (real admin users exist; SSO + payload-authjs also
  // changed the User create type so the literal no longer type-checks). seed() now only seeds globals.

  payload.logger.info('— Seeding globals (header, footer)...')
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
          // description is a richText (Lexical) field — seed a minimal single-paragraph state.
          description: {
            root: {
              type: 'root',
              format: '' as const,
              indent: 0,
              version: 1,
              direction: 'ltr' as const,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: 'Building products that shape the lives of millions every single day',
                    },
                  ],
                },
              ],
            },
          },
          copyright: `© ${new Date().getFullYear()} Ternary Solutions`,
        },
      },
      context: { disableRevalidate: true },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}
