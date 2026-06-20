import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}