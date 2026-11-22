import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LayoutGrid, LogOut, RefreshCcw, CreditCard, BookOpen } from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import AppCard from '../components/AppCard'
import AppCardSkeleton from '../components/AppCardSkeleton'
import { fetchApps } from '../api/appsService'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const [apps, setApps] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const loadApps = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await fetchApps()
      const rawList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : []
      const mapped = rawList.map((item) => ({
        ...item,
        id: item.id || item.appID || item._id,
        app_name: item.appName || item.app_name || item.name || 'Application',
        app_url: item.link || item.app_url || item.url || '',
      }))
      setApps(mapped)
      setStatus('success')
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Unable to load applications right now.'))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-3 sm:p-5 lg:p-6 font-sans">
      <div className="navy-texture relative mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col overflow-hidden rounded-[28px] shadow-2xl sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3rem)]">
        <header className="flex shrink-0 flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-8">
          <FmdqLogo />

          <div className="text-center sm:flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">iAuth</h1>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Single Sign On (SSO) to access all FMDQ Legacy software solutions in one place.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {user?.email && <span className="hidden text-xs text-slate-300 md:inline">{user.email}</span>}
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
            >
              <CreditCard size={16} />
              Transactions
            </button>
            <button
              type="button"
              onClick={() => navigate('/iauth-api-docs')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
            >
              <BookOpen size={16} />
              iAuth Api Doc
            </button>
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-100"
            >
              <LayoutGrid size={16} />
              Enter Admin
            </button>
          </div>
        </header>

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-4 sm:px-10 sm:pt-8 sm:pb-6">
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-12 text-center shadow-md">
              <p className="text-sm font-medium text-slate-600">{errorMessage}</p>
              <button
                type="button"
                onClick={loadApps}
                className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                <RefreshCcw size={16} /> Try again
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <AppCardSkeleton key={index} />
              ))}
            </div>
          )}

          {status === 'success' && apps.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-md">
              <p className="text-sm font-medium text-slate-600">No applications have been registered yet.</p>
            </div>
          )}

          {status === 'success' && apps.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </main>

        <footer className="flex shrink-0 justify-end px-6 pb-6 sm:px-10 sm:pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </footer>
      </div>
    </div>
  )
}
