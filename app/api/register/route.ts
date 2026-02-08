import { NextRequest, NextResponse } from 'next/server'
import { registerController } from '../../../lib/controllers/registerController'
import { withLogging } from '../../../lib/middleware/logger'
import { createLogger } from '../../../lib/logger'

const logger = createLogger({ module: 'api', route: 'register' })

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const body = await req.json()
      const { username, password } = body || {}
      
      logger.info({ username }, 'Registration attempt')
      
      const result = await registerController(username, password)
      
      if (result.error) {
        logger.warn({ username, error: result.error, status: result.status }, 'Registration failed')
        return NextResponse.json({ error: result.error }, { status: result.status || 500 })
      }
      
      logger.info({ username }, 'Registration successful')
      return NextResponse.json({ success: true, token: result.token }, { status: result.status || 201 })
    } catch (err: any) {
      logger.error({ error: err?.message, stack: err?.stack }, 'Registration exception')
      return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
    }
  })
}
