import { createClient } from '@/lib/supabase/server';

export async function getUsers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      // Supabase errors are objects, serialize them properly
      const errorDetails = JSON.stringify(error, null, 2);
      throw new Error(`Supabase query error: ${errorDetails}`);
    }
    return data ?? [];
  } catch (err) {
    if (err instanceof Error) {
      throw err; // Re-throw if already an Error
    }
    // Handle non-Error objects
    const msg = typeof err === 'object' ? JSON.stringify(err) : String(err);
    throw new Error(`getUsers failed: ${msg}`);
  }
}

export async function getUserById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) {
    if ((error as any).code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createUser(user: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').insert([user]).select('*');
  if (error) throw error;
  return data[0];
}

export async function updateUser(id: string, user: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').update(user).eq('id', id).select('*');
  if (error) throw error;
  return data[0];
}

export async function deleteUser(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return true;
}
