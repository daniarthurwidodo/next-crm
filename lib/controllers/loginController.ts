import { loginService } from '../services/loginService'
import { createLogger } from '../logger'

const logger = createLogger({ module: 'controller', controller: 'login' })

export async function loginController(username: string, password: string) {
  if (!username || !password) {
    logger.warn({ username: username || '(missing)', hasPassword: !!password }, 'Validation failed: missing credentials')
    return { error: 'Missing username or password', status: 400 }
  }
  return await loginService(username, password)
}
