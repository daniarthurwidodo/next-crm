import supabaseService from '../../lib/supabase/service'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function loginService(username: string, password: string) {
  const isEmail = typeof username === 'string' && username.includes('@')
  const email = isEmail ? username : `${username}@local.invalid`

  const { data, error } = await (supabaseService as any).auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data?.user) {
    return { error: 'Invalid username or password', status: 401 }
  }

  const userUsername = data.user.user_metadata?.username || username
  const token = jwt.sign({ username: userUsername }, JWT_SECRET, { expiresIn: '7d' })
  return { success: true, token, status: 200 }
}
