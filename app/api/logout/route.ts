import { NextRequest, NextResponse } from 'next/server'
import { withLogging } from '../../../lib/middleware/logger'
import { createLogger } from '../../../lib/logger'

const logger = createLogger({ module: 'api', route: 'logout' })

export async function POST(request: NextRequest) {
  return withLogging(request, async () => {
    try {
      logger.info('Logout attempt')
      
      const response = NextResponse.json({ success: true }, { status: 200 })
      
      // Clear the token cookie
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
      })
      
      logger.info('Logout successful')
      return response
    } catch (err: any) {
      logger.error({ error: err?.message, stack: err?.stack }, 'Logout exception')
      return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
    }
  })
}
