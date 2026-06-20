import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["admin"]}>
                <div>Admin Dashboard (coming soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/*"
            element={
              <ProtectedRoute roles={["landlord"]}>
                <div>Landlord Dashboard (coming soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute roles={["tenant"]}>
                <div>Tenant Dashboard (coming soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/*"
            element={
              <ProtectedRoute roles={["maintenance_staff"]}>
                <div>Maintenance Dashboard (coming soon)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;