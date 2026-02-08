import supabaseService from '../../lib/supabase/service'
import { hashPassword } from '../../lib/utils/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function registerService(username: string, password: string) {
  const isEmail = typeof username === 'string' && username.includes('@')
  const email = isEmail ? username : `${username}@local.invalid`
  const hashed = await hashPassword(password)

  const res = await (supabaseService as any).auth.admin.createUser({
    email,
    password,
    // Auto-confirm so sign-in works immediately without email verification
    email_confirm: true,
    user_metadata: { username, password_hash: hashed },
  })

  const { data, error } = res || {}
  if (error) {
    const msg = error?.message || JSON.stringify(error)
    if (/already exists|unique|duplicate/i.test(msg)) {
      return { error: 'Username already exists', status: 409 }
    }
    return { error: msg, status: 500 }
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
  return { success: true, token, status: 201 }
}
