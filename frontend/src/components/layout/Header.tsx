import { Settings, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    navigate('/')
  }

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">AI Job Aggregator</h1>
            <p className="text-xs text-slate-500 font-medium">Trợ lý tìm việc thông minh</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold hover:bg-brand/20 transition-colors"
            >
              {user?.email ? getInitials(user.email) : 'QV'}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {user?.isEmailVerified ? '✓ Đã xác thực' : 'Chưa xác thực'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
