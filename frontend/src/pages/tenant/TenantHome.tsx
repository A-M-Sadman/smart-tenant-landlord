import { useAuth } from "../../context/AuthContext";

export default function TenantHome() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1 className="page-title">Welcome, {user?.full_name} 👋</h1>
      <p className="page-subtitle">View your rental info and manage your profile here.</p>
    </div>
  );
}