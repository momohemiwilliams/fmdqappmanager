import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AppUserAdminPage from './pages/AppUserAdminPage'
import ApplicationsPage from './pages/ApplicationsPage'
import TransactionsPage from './pages/TransactionsPage'
import PaymentGatewaysPage from './pages/PaymentGatewaysPage'
import CheckoutPage from './pages/CheckoutPage'
import ApiDocsPage from './pages/ApiDocsPage'
import IauthApiDocsPage from './pages/IauthApiDocsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Checkout Route for Payment Backend Redirects */}
        <Route path="/checkout/:reference" element={<CheckoutPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/apps/:appId/admin" element={<AppUserAdminPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/payment-gateways" element={<PaymentGatewaysPage />} />
          <Route path="/docs" element={<ApiDocsPage />} />
          <Route path="/docs/:appId" element={<ApiDocsPage />} />
          <Route path="/iauth-api-docs" element={<IauthApiDocsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
