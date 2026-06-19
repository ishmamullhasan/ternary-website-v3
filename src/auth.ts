import config from '@payload-config'
import { getPayload } from 'payload'
import { getAuthjsInstance } from 'payload-authjs'

/**
 * Auth.js instance bound to the Payload instance. payload-authjs reads the Auth.js config that
 * `authjsPlugin` registered on the Payload config, so the instance must be created from Payload
 * (not via a bare `NextAuth(authConfig)` call).
 */
const payload = await getPayload({ config })

export const { handlers, signIn, signOut, auth } = getAuthjsInstance(payload)
