import { handlers } from '@/auth'

// Auth.js v5 route handler. Sits outside the (payload) route group; the callback path is
// /api/auth/callback/google — register that exact URI on the Google OAuth client.
export const { GET, POST } = handlers
