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
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import TenantMaintenancePage from './pages/tenant/TenantMaintenancePage';
import LandlordMaintenancePage from './pages/landlord/LandlordMaintenancePage';
import AgreementsPage from './pages/landlord/AgreementsPage';
import TenantAgreementsPage from './pages/tenant/TenantAgreementsPage';
import LandlordPaymentsPage from './pages/landlord/LandlordPaymentsPage';
import TenantPaymentsPage from './pages/tenant/TenantPaymentsPage';
import TenantComplaintsPage from './pages/tenant/TenantComplaintsPage';
import LandlordComplaintsPage from './pages/landlord/LandlordComplaintsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
            <Route path="profile" element={<TenantProfilePage />} />
            <Route path="maintenance" element={<TenantMaintenancePage />} />
            <Route path="agreements" element={<TenantAgreementsPage />} />
            <Route path="payments" element={<TenantPaymentsPage />} />
            <Route path="complaints" element={<TenantComplaintsPage />} />
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
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="assignments" element={<StaffDashboardPage />} />
          </Route>  
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;