
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createLogger } from "../logger";

const logger = createLogger({ module: 'supabase', client: 'server' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  const cookieStore = await cookies();
  
  logger.debug('Creating Supabase server client');
  
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            logger.debug({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Cannot set cookies from Server Component');
          }
        },
      },
    },
  );
}
