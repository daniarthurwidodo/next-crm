import ProtectedDashboardLayout from './(protected)/layout';
import './dashboard.css';

export default function DashboardPage() {
  return (
    <ProtectedDashboardLayout>
      <p className="dashboard-content">This is your dashboard.</p>
    </ProtectedDashboardLayout>
  );
}
