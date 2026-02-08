import { registerService } from '../services/registerService'
import { createLogger } from '../logger'

const logger = createLogger({ module: 'controller', controller: 'register' })

export async function registerController(username: string, password: string) {
  if (!username || !password) {
    logger.warn({ username: username || '(missing)', hasPassword: !!password }, 'Validation failed: missing credentials')
    return { error: 'Missing username or password', status: 400 }
  }
  return await registerService(username, password)
}
