import { createClient } from '@supabase/supabase-js'
import { createLogger } from '../logger'

const logger = createLogger({ module: 'supabase', client: 'service' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Lazily initialize the Supabase service client. If env vars are missing,
// export a stub that throws a clear error when used. This avoids throwing
// at import time (so tests can mock `@supabase/supabase-js`) while providing
// a helpful message if runtime code tries to use the client without config.
// Try to create the client immediately (so tests that mock
// `@supabase/supabase-js` get the mocked client). If creation fails
// (missing env or createClient throws), fall back to a stub that throws
// when used.
function makeMissingEnvStub() {
	logger.error('Supabase service client not configured - missing environment variables')
	return new Proxy({}, {
		get() {
			logger.error('Attempted to use unconfigured Supabase service client')
			throw new Error(
				'Supabase service not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
			)
		},
	}) as unknown;
}

let supabaseService: unknown;
try {
	logger.info('Initializing Supabase service role client')
	supabaseService = createClient(supabaseUrl ?? '', supabaseServiceRoleKey ?? '')
} catch (error) {
	logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to create Supabase service client')
	supabaseService = makeMissingEnvStub()
}

export default supabaseService
