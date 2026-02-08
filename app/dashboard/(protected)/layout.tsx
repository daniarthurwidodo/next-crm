import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import "../dashboard.css";

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/dashboard/login");
  }

  const username = session.user.name || session.user.email;

  return (
    <div className="dashboard-container">
      <Sidebar
        username={username}
        menuItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/dashboard/users" },
        ]}
      />
      <main className="dashboard-main">
        <h1 className="dashboard-title">Welcome, {username}!</h1>
        {children}
      </main>
    </div>
  );
}
