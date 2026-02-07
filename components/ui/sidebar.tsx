import React from 'react';
import './sidebar.css';

interface SidebarProps {
  username: string;
  menuItems?: Array<{ label: string; onClick?: () => void }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ username, menuItems = [] }) => {
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
      </nav>
    </aside>
  );
};
