
import { loginController } from '../../../lib/controllers/loginController'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body || {}
    const result = await loginController(username, password)
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), { status: result.status || 500 })
    }
    return new Response(JSON.stringify({ success: true, token: result.token }), { status: result.status || 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), { status: 500 })
  }
}
