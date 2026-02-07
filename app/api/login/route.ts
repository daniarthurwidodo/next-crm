import supabaseService from '../../../lib/supabase/service'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body || {}
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 })
    }

    // Use Supabase's built-in authentication
    const isEmail = typeof username === 'string' && username.includes('@')
    const email = isEmail ? username : `${username}@local.invalid`

    // Authenticate using Supabase's signInWithPassword
    const { data, error } = await (supabaseService as any).auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data?.user) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 })
    }

    // Get username from user_metadata or use email
    const userUsername = data.user.user_metadata?.username || username

    // Sign JWT to return to client
    const token = jwt.sign({ username: userUsername }, JWT_SECRET, { expiresIn: '7d' })
    return new Response(JSON.stringify({ success: true, token }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), { status: 500 })
  }
}
