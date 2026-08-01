import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./components/landlord/DashboardLayout";
import DashboardHome from "./pages/landlord/DashboardHome";
import PropertiesPage from "./pages/landlord/PropertiesPage";
import PropertyForm from "./pages/landlord/PropertyForm";
import PropertyDetail from "./pages/landlord/PropertyDetail";
import UnitForm from "./pages/landlord/UnitForm";
import TenantLayout from "./components/tenant/TenantLayout";
import TenantHome from "./pages/tenant/TenantHome";
import TenantProfilePage from "./pages/tenant/TenantProfilePage";
import AssignmentsPage from './pages/landlord/AssignmentsPage';
import StaffLayout from './components/staff/StaffLayout';
import TenantMaintenancePage from './pages/tenant/TenantMaintenancePage';
import LandlordMaintenancePage from './pages/landlord/LandlordMaintenancePage';
import AgreementsPage from './pages/landlord/AgreementsPage';
import TenantAgreementsPage from './pages/tenant/TenantAgreementsPage';
import LandlordPaymentsPage from './pages/landlord/LandlordPaymentsPage';
import TenantPaymentsPage from './pages/tenant/TenantPaymentsPage';
import TenantComplaintsPage from './pages/tenant/TenantComplaintsPage';
import LandlordComplaintsPage from './pages/landlord/LandlordComplaintsPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage'
import AnalyticsPage from './pages/landlord/AnalyticsPage';
import StaffDashboardHome from './pages/staff/StaffDashboardHome';
import StaffAssignmentsPage from './pages/staff/StaffAssignmentsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import NotificationPreferencesPage from './pages/shared/NotificationPreferencesPage';
import ProfilePage from './pages/shared/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          // Add new admin route group (same level as landlord/tenant):
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Landlord routes */}
          <Route
            path="/landlord"
            element={
              <ProtectedRoute roles={["landlord", "admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties/:id/edit" element={<PropertyForm />} />
            <Route path="properties/:id/units/new" element={<UnitForm />} />
            <Route path="properties/:id/units/:unitId/edit" element={<UnitForm />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="maintenance" element={<LandlordMaintenancePage />} />
            <Route path="agreements" element={<AgreementsPage />} />
            <Route path="payments" element={<LandlordPaymentsPage />} />
            <Route path="complaints" element={<LandlordComplaintsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notification-preferences" element={<NotificationPreferencesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Tenant routes */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute roles={["tenant"]}>
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantHome />} />
            {/* <Route path="profile" element={<TenantProfilePage />} /> */}
            <Route path="maintenance" element={<TenantMaintenancePage />} />
            <Route path="agreements" element={<TenantAgreementsPage />} />
            <Route path="payments" element={<TenantPaymentsPage />} />
            <Route path="complaints" element={<TenantComplaintsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notification-preferences" element={<NotificationPreferencesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Maintenance placeholder */}
          <Route
            path="/maintenance/*"
            element={
              <ProtectedRoute roles={["maintenance_staff"]}>
                < StaffLayout />
              </ProtectedRoute>
              
              
            }
          />
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="dashboard" element={<StaffDashboardHome />} />
            <Route path="assignments" element={<StaffAssignmentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notification-preferences" element={<NotificationPreferencesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


