import { createClient } from '@supabase/supabase-js'

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
	return new Proxy({}, {
		get() {
			throw new Error(
				'Supabase service not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
			)
		},
	}) as unknown;
}

let supabaseService: unknown;
try {
	supabaseService = createClient(supabaseUrl ?? '', supabaseServiceRoleKey ?? '')
} catch {
	supabaseService = makeMissingEnvStub()
}

export default supabaseService
