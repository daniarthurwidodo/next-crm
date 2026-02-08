import { ReactNode } from 'react';
import '../globals.css';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full py-4 bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <a href="/dashboard" className="text-xl font-bold">Dashboard</a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
