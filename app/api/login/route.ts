import supabaseService from '../../../lib/supabase/service'
import { verifyPassword } from '../../../lib/utils/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body || {}
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 })
    }

    // Prefer Supabase Auth for user management. Use admin.listUsers to find user.
    const isEmail = typeof username === 'string' && username.includes('@')
    const email = isEmail ? username : `${username}@local.invalid`

    // Find user by email
    const res = await (supabaseService as any).auth.admin.listUsers({ email })
    const { users, error } = res || {}
    if (error) {
      return new Response(JSON.stringify({ error: error?.message || 'User lookup failed' }), { status: 500 })
    }
    const user = users && users.length > 0 ? users[0] : null
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    // Check password
    const hash = user.user_metadata?.password_hash
    const valid = hash && await verifyPassword(password, hash)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 })
    }

    // Sign JWT to return to client
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
    return new Response(JSON.stringify({ success: true, token }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), { status: 500 })
  }
}
