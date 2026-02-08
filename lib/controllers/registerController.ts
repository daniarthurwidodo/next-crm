import { registerService } from '../services/registerService'

export async function registerController(username: string, password: string) {
  if (!username || !password) {
    return { error: 'Missing username or password', status: 400 }
  }
  return await registerService(username, password)
}
