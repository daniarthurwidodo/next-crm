import supabaseService from '../../lib/supabase/service'
import { hashPassword } from '../../lib/utils/auth'
import jwt from 'jsonwebtoken'
import { createLogger } from '../logger'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const logger = createLogger({ module: 'service', service: 'register' })

export async function registerService(username: string, password: string) {
  const isEmail = typeof username === 'string' && username.includes('@')
  const email = isEmail ? username : `${username}@local.invalid`
  
  logger.debug({ username }, 'Hashing password')
  const hashed = await hashPassword(password)

  logger.debug({ username, email }, 'Creating user in Supabase')
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
      logger.warn({ username, error: msg }, 'User already exists')
      return { error: 'Username already exists', status: 409 }
    }
    logger.error({ username, error: msg }, 'User creation failed')
    return { error: msg, status: 500 }
  }

  logger.debug({ username }, 'Generating JWT token')
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
  logger.info({ username }, 'Registration service completed successfully')
  
  return { success: true, token, status: 201 }
}
