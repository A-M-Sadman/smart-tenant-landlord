import { useAuth } from "../../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1 className="page-title">Welcome back, {user?.full_name} 👋</h1>
      <p className="page-subtitle">Manage your properties and tenants from here.</p>
    </div>
  );
}