// Authentication logic for JWT and username/password
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
}

export async function registerUser(username: string, password: string): Promise<AuthResult> {
  // Check if user exists
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (existing) return { success: false, message: 'Username already exists' };
  if (findError && findError.code !== 'PGRST116') return { success: false, message: findError.message };

  // Hash password (simple hash for demo, use bcrypt in production)
  const hashed = await hashPassword(password);
  const { error } = await supabase.from('users').insert([{ username, password: hashed }]);
  if (error) return { success: false, message: error.message };
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const { data: user, error } = await supabase
    .from('users')
    .select('password')
    .eq('username', username)
    .single();
  if (error || !user) return { success: false, message: 'Invalid username or password' };
  const valid = await verifyPassword(password, user.password);
  if (!valid) return { success: false, message: 'Invalid username or password' };
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token };
}

export function verifyJWT(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return { valid: true, username: decoded.username };
  } catch {
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
