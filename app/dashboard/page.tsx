import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import './dashboard.css';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const auth = token ? verifyJWT(token) : { valid: false };
  if (!auth.valid) redirect('/dashboard/login');
  return (
    <div className="dashboard-container">
      <Sidebar username={auth.username || 'Unknown'} menuItems={[{ label: 'Dashboard' }]} />
      <main className="dashboard-main">
        <h1 className="dashboard-title">Welcome, {auth.username}!</h1>
        <p className="dashboard-content">This is your dashboard.</p>
      </main>
    </div>
  );
}
