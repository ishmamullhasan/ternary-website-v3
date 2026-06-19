import config from '@payload-config'
import { getPayload } from 'payload'
const payload = await getPayload({ config })
const email = 'sshakib@ternary.solutions'
try {
  const token = await payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: true } as any)
  console.log(`RESET_URL=https://ternary.solutions/admin/reset/${token}`)
} catch (e) {
  console.log(`RESET_ERROR=${(e as Error).message}`)
}
process.exit(0)
