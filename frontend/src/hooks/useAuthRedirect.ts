import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  landlord: "/landlord/dashboard",
  tenant: "/tenant/dashboard",
  maintenance_staff: "/maintenance/dashboard",
};

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) {
      navigate(ROLE_HOME[user.role as UserRole] ?? "/", { replace: true });
    }
  }, [user, loading, navigate]);
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);
}