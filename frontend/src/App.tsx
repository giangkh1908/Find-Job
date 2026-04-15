import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks'
import { LoginPage, RegisterPage, HomePage, LandingPage } from '@/pages'
import { SeoProvider, Helmet } from '@/components/seo/SeoProvider'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <>
      <Helmet>
        <title>Tìm Việc Làm - Tìm Việc Theo Yêu Cầu AI | Find-Job</title>
        <meta name="description" content="Tìm kiếm việc làm với AI thông minh. Nhập yêu cầu bằng ngôn ngữ tự nhiên - tìm việc phù hợp với kỹ năng và kinh nghiệm của bạn." />
        <link rel="canonical" href="https://findjob.com/" />
      </Helmet>

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Helmet>
                <title>Đăng Nhập | Find-Job</title>
                <meta name="description" content="Đăng nhập vào Find-Job để tìm việc làm với AI thông minh." />
              </Helmet>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Helmet>
                <title>Đăng Ký | Find-Job</title>
                <meta name="description" content="Đăng ký tài khoản Find-Job để bắt đầu tìm việc với AI." />
              </Helmet>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect based on auth status */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SeoProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SeoProvider>
    </BrowserRouter>
  )
}
