// Authentication logic for JWT and username/password
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { createLogger } from '../logger';

const logger = createLogger({ module: 'util', utility: 'auth' });

// Lazy client initialization to avoid module-level environment variable access
let _supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    _supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return _supabaseClient;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
}

export async function registerUser(username: string, password: string): Promise<AuthResult> {
  // Check if user exists
  logger.debug({ username }, 'Checking if user exists');
  const { data: existing, error: findError } = await getSupabaseClient()
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (existing) {
    logger.warn({ username }, 'Username already exists');
    return { success: false, message: 'Username already exists' };
  }
  if (findError && findError.code !== 'PGRST116') {
    logger.error({ username, error: findError.message }, 'Error checking existing user');
    return { success: false, message: findError.message };
  }

  // Hash password (simple hash for demo, use bcrypt in production)
  logger.debug({ username }, 'Hashing password');
  const hashed = await hashPassword(password);
  const { error } = await getSupabaseClient().from('users').insert([{ username, password: hashed }]);
  if (error) {
    logger.error({ username, error: error.message }, 'Error inserting user');
    return { success: false, message: error.message };
  }
  logger.info({ username }, 'User registered successfully');
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  logger.debug({ username }, 'Fetching user for login');
  const { data: user, error } = await getSupabaseClient()
    .from('users')
    .select('password')
    .eq('username', username)
    .single();
  if (error || !user) {
    logger.warn({ username, error: error?.message }, 'User not found or error fetching user');
    return { success: false, message: 'Invalid username or password' };
  }
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    logger.warn({ username }, 'Invalid password');
    return { success: false, message: 'Invalid username or password' };
  }
  logger.info({ username }, 'User logged in successfully');
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token };
}

export function verifyJWT(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    logger.debug({ username: decoded.username }, 'JWT verified successfully');
    return { valid: true, username: decoded.username };
  } catch (error) {
    logger.warn({ error: error instanceof Error ? error.message : 'Unknown error' }, 'JWT verification failed');
    return { valid: false };
  }
}

// Simple hash/verify (replace with bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  return Promise.resolve(Buffer.from(password).toString('base64'));
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Promise.resolve(Buffer.from(password).toString('base64') === hash);
}
