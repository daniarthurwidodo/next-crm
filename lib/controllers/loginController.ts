import { loginService } from '../services/loginService'

export async function loginController(username: string, password: string) {
  if (!username || !password) {
    return { error: 'Missing username or password', status: 400 }
  }
  return await loginService(username, password)
}
