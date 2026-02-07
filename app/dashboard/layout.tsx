import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full py-4 bg-white shadow mb-8">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <a href="/dashboard" className="text-xl font-bold">Dashboard</a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4">{children}</main>
    </div>
  );
}
