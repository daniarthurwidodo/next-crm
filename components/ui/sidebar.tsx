'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import './sidebar.css';

interface SidebarProps {
  username: string;
  menuItems?: Array<{ label: string; onClick?: () => void }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ username, menuItems = [] }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/dashboard/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <span>User:</span>
        <strong>{username}</strong>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className="sidebar-menu-item"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
        <button
          className="sidebar-menu-item logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};
