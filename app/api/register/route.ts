import supabaseService from '../../../lib/supabase/service'
import { hashPassword } from '../../../lib/utils/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body || {}
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 })
    }

    // Prefer Supabase Auth for user management. Use admin.createUser via service role key.
    // If username looks like an email, use it as email; otherwise create a placeholder email
    const isEmail = typeof username === 'string' && username.includes('@')
    const email = isEmail ? username : `${username}@local.invalid`

    // Create the user via Supabase Admin API
    // Note: the shape of the response is mocked in tests; handle both `{ data, error }` and thrown errors
    // Hashing password is optional when using Supabase Auth, but keep a hashed copy in metadata for backward compatibility
    const hashed = await hashPassword(password)

    // call admin.createUser
    const res = await (supabaseService as any).auth.admin.createUser({
      email,
      password,
      user_metadata: { username, password_hash: hashed },
    })

    const { data, error } = res || {}
    if (error) {
      // If the user already exists, return 409
      const msg = error?.message || JSON.stringify(error)
      if (/already exists|unique|duplicate/i.test(msg)) {
        return new Response(JSON.stringify({ error: 'Username already exists' }), { status: 409 })
      }
      return new Response(JSON.stringify({ error: msg }), { status: 500 })
    }

    // Sign JWT to return to client for convenience
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
    return new Response(JSON.stringify({ success: true, token }), { status: 201 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), { status: 500 })
  }
}
