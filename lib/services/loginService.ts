import supabaseService from '../../lib/supabase/service'
import jwt from 'jsonwebtoken'
import { createLogger } from '../logger'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const logger = createLogger({ module: 'service', service: 'login' })

export async function loginService(username: string, password: string) {
  const isEmail = typeof username === 'string' && username.includes('@')
  const email = isEmail ? username : `${username}@local.invalid`

  logger.debug({ username, email }, 'Attempting Supabase authentication')

  const { data, error } = await (supabaseService as any).auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data?.user) {
    logger.warn({ username, error: error?.message }, 'Supabase authentication failed')
    return { error: 'Invalid username or password', status: 401 }
  }

  const userUsername = data.user.user_metadata?.username || username
  logger.debug({ username: userUsername }, 'Generating JWT token')
  
  const token = jwt.sign({ username: userUsername }, JWT_SECRET, { expiresIn: '7d' })
  logger.info({ username: userUsername }, 'Login service completed successfully')
  
  return { success: true, token, status: 200 }
}
