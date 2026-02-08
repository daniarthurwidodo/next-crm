import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/utils/auth';
import { Sidebar } from '@/components/ui/sidebar';
import '../dashboard.css';

export default async function ProtectedDashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const auth = token ? verifyJWT(token) : { valid: false };

  if (!auth.valid) {
    redirect('/dashboard/login');
  }

  const username = auth.username || 'Unknown';

  return (
    <div className="dashboard-container">
      <Sidebar username={username} menuItems={[{ label: 'Dashboard' }]} />
      <main className="dashboard-main">
        <h1 className="dashboard-title">Welcome, {username}!</h1>
        {children}
      </main>
    </div>
  );
}
