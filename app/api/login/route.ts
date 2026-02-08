import { NextRequest, NextResponse } from 'next/server'
import { loginController } from '../../../lib/controllers/loginController'
import { withLogging } from '../../../lib/middleware/logger'
import { createLogger } from '../../../lib/logger'

const logger = createLogger({ module: 'api', route: 'login' })

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const body = await req.json()
      const { username, password } = body || {}
      
      logger.info({ username }, 'Login attempt')
      
      const result = await loginController(username, password)
      
      if (result.error) {
        logger.warn({ username, error: result.error, status: result.status }, 'Login failed')
        return NextResponse.json({ error: result.error }, { status: result.status || 500 })
      }
      
      logger.info({ username }, 'Login successful')
      return NextResponse.json({ success: true, token: result.token }, { status: result.status || 200 })
    } catch (err: any) {
      logger.error({ error: err?.message, stack: err?.stack }, 'Login exception')
      return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
    }
  })
}
