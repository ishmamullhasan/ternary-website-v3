import config from '@payload-config'
import { getPayload } from 'payload'
const payload = await getPayload({ config })
const email = 'sshakib@ternary.solutions'
try {
  const ok = await payload.unlock({ collection: 'users', data: { email }, overrideAccess: true } as any)
  console.log(`UNLOCK ${email}: result=${ok}`)
} catch (e) {
  console.log(`UNLOCK_ERROR: ${(e as Error).message}`)
}
process.exit(0)
