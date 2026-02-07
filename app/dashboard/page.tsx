import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const auth = token ? verifyJWT(token) : { valid: false };
  if (!auth.valid) redirect('/dashboard/login');
  return (
    <main className="max-w-xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-4">Welcome, {auth.username}!</h1>
      <p>This is your dashboard.</p>
    </main>
  );
}
