import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/tenant/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/tenant/maintenance", label: "Maintenance", icon: "🔧" },
  { to: "/tenant/agreements", label: "Agreements", icon: "📄" },
  { to: "/tenant/payments", label: "Payments", icon: "💰" },
  { to: "/tenant/complaints", label: "Complaints", icon: "📢" },
  { to: "/tenant/notifications", label: "Notifications", icon: "🔔" },
];

export default function TenantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>

      <div className={`sidebar-overlay ${sidebarOpen ? "overlay-open" : ""}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🏠</span>
          <span className="brand-name">TenantLord</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div
            className="user-info"
            style={{ cursor: 'pointer' }}
            onClick={() => { navigate('/tenant/profile'); closeSidebar(); }}
          >
            <div className="user-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-role">Tenant · View Profile</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
