import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CreditCard,
  RefreshCcw,
  Search,
  CheckCircle2,
  XCircle,
  Settings,
  Eye,
  EyeOff,
  LogOut,
  ChevronDown,
  User,
  LayoutGrid,
  X,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import { useAuth } from '../context/AuthContext'
import { fetchPaymentGateways, updatePaymentGateway } from '../api/paymentService'
import { extractErrorMessage } from '../api/client'

function GatewaySlugBadge({ slug }) {
  const map = {
    paystack: { label: 'Paystack', bg: '#00c3b3', text: '#fff' },
    flutterwave: { label: 'Flutterwave', bg: '#f5a623', text: '#fff' },
    interswitch: { label: 'Interswitch', bg: '#e1251b', text: '#fff' },
  }
  const info = map[slug?.toLowerCase()] || { label: slug || 'Gateway', bg: '#6366f1', text: '#fff' }
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs"
      style={{ background: info.bg, color: info.text }}
    >
      {info.label}
    </span>
  )
}

export default function PaymentGatewaysPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [gateways, setGateways] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Edit Gateway Modal state
  const [editingGateway, setEditingGateway] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editConfig, setEditConfig] = useState({})
  const [showSecretKeys, setShowSecretKeys] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const loadGateways = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPaymentGateways()
      setGateways(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Unable to load payment gateways.')
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGateways()
  }, [loadGateways])

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  // Handle Quick Toggle Active Status
  const handleToggleStatus = async (gw) => {
    const newStatus = !gw.is_active
    const updated = gateways.map((g) => (g.id === gw.id ? { ...g, is_active: newStatus } : g))
    setGateways(updated)

    try {
      await updatePaymentGateway(gw.id, {
        name: gw.name,
        description: gw.description,
        is_active: newStatus,
        config: gw.config || {},
      })
      toast.success(`${gw.name} is now ${newStatus ? 'Active' : 'Inactive'}.`)
    } catch (err) {
      // Revert on error
      setGateways(gateways)
      toast.error(extractErrorMessage(err, `Failed to update status for ${gw.name}`))
    }
  }

  // Open Edit Modal
  const handleOpenEditModal = (gw) => {
    setEditingGateway(gw)
    setEditName(gw.name || '')
    setEditDescription(gw.description || '')
    setEditIsActive(Boolean(gw.is_active))
    setEditConfig(gw.config ? { ...gw.config } : {})
    setShowSecretKeys({})
  }

  // Save Gateway Edits
  const handleSaveGateway = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error('Gateway Name is required')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: editName.trim(),
        description: editDescription.trim(),
        is_active: editIsActive,
        config: editConfig,
      }

      await updatePaymentGateway(editingGateway.id, payload)
      toast.success(`${editName.trim()} settings updated successfully!`)
      setEditingGateway(null)
      loadGateways()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save gateway settings'))
    } finally {
      setIsSaving(false)
    }
  }

  const filteredGateways = gateways.filter((gw) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      gw.name?.toLowerCase().includes(q) ||
      gw.slug?.toLowerCase().includes(q) ||
      gw.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#111f44] p-2 sm:p-4 lg:p-6 font-sans text-slate-800 flex flex-col justify-between overflow-x-hidden">
      <div className="navy-texture relative mx-auto w-full max-w-[1440px] flex flex-1 flex-col overflow-hidden rounded-[20px] sm:rounded-[28px] border border-white/10 p-3 sm:p-5 lg:p-6 shadow-2xl">

        {/* Responsive Header Navigation */}
        <header className="flex shrink-0 flex-col lg:flex-row items-center justify-between gap-3 pb-4">
          <div className="flex w-full lg:w-auto items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
              <FmdqLogo className="shadow-md" />
            </div>

            {/* Mobile Admin Profile Toggle */}
            <div className="relative flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="group inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 focus:outline-none"
              >
                <ChevronDown size={14} className="text-white/80" />
                <span className="text-xs font-semibold text-white">Admin</span>
                <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/40 bg-slate-200">
                  <User size={14} className="absolute inset-0 m-auto text-slate-600" />
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-9 z-50 w-48 rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                  <div className="border-b border-slate-100 px-2.5 py-1.5">
                    <p className="text-xs font-bold text-slate-800">Administrator</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@fmdqgroup.com'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutGrid size={13} /> Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Pill Navigation */}
          <div className="flex flex-col items-center justify-center gap-1.5 w-full lg:w-auto">
            <span className="rounded-full bg-[#dbe4f9] px-3 py-0.5 text-[11px] font-bold tracking-wider text-[#1c2c65] uppercase shadow-xs">
              iAuth
            </span>
            <nav className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-md flex-wrap justify-center">
              <button
                type="button"
                onClick={() => navigate('/applications?tab=Users')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Admin Management
              </button>
              <button
                type="button"
                onClick={() => navigate('/applications?tab=Applications')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Applications
              </button>
              <button
                type="button"
                onClick={() => navigate('/applications?tab=Institutions')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Institutions
              </button>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Transactions
              </button>
              <button
                type="button"
                className="rounded-full bg-[#dce3f6] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1b2b65] shadow-xs transition-all"
              >
                Gateways
              </button>
            </nav>
          </div>

          {/* Desktop Right Header Admin Profile Dropdown */}
          <div className="relative hidden lg:flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white transition hover:bg-white/20 focus:outline-none"
            >
              <ChevronDown size={15} className="text-white/80 transition-transform group-hover:translate-y-0.5" />
              <span className="text-xs font-semibold tracking-wide text-white">Admin</span>
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/40 shadow-xs bg-slate-200">
                <User size={16} className="absolute inset-0 m-auto text-slate-600" />
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 px-3 py-1.5">
                  <p className="text-xs font-bold text-slate-800">System Administrator</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@fmdqgroup.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LayoutGrid size={14} /> SSO Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main White Content Card */}
        <main className="relative flex flex-1 flex-col overflow-hidden rounded-[16px] sm:rounded-[20px] bg-white p-3.5 sm:p-5 shadow-xl min-w-0">

          {/* Top Breadcrumb & Heading Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-3 min-w-0">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-navy-900 transition-colors underline underline-offset-2"
                >
                  Home
                </button>
                <span>&gt;</span>
                <span className="font-semibold text-slate-700">Payment Gateways</span>
              </nav>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1b2b65] flex items-center gap-2">
                <CreditCard size={18} className="text-[#1b2b65] shrink-0" />
                Manage Payment Gateways
              </h2>
            </div>

            {/* Right Action Controls: Search & Refresh */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[160px]">
                <input
                  type="text"
                  placeholder="Search gateway name, slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:border-[#1b2b65] focus:outline-none transition-all"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={loadGateways}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs shrink-0"
              >
                <RefreshCcw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Gateway Cards Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 animate-pulse">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-200 mt-4" />
                </div>
              ))
            ) : filteredGateways.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                {search ? 'No payment gateways match your search query.' : 'No payment gateways found.'}
              </div>
            ) : (
              filteredGateways.map((gw) => {
                const isActive = Boolean(gw.is_active)
                return (
                  <div
                    key={gw.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${isActive
                        ? 'border-slate-200 bg-white shadow-md hover:shadow-lg'
                        : 'border-slate-200/80 bg-slate-50/70 opacity-80 hover:opacity-100'
                      }`}
                  >
                    <div>
                      {/* Top Card Bar: Slug & Status Toggle */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <GatewaySlugBadge slug={gw.slug} />

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                          >
                            {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {isActive ? 'Active' : 'Inactive'}
                          </span>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(gw)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-[#1b2b65]' : 'bg-slate-300'
                              }`}
                            title={isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Gateway Name & Description */}
                      <h3 className="text-base font-bold text-slate-900 mb-1">{gw.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {gw.description || 'Configured payment gateway integration for processing transactions.'}
                      </p>

                      {/* Config Keys Summary */}
                      {gw.config && Object.keys(gw.config).length > 0 && (
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Credential Keys
                          </p>
                          {Object.entries(gw.config).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-[11px]">
                              <span className="font-mono text-slate-500">{key}:</span>
                              <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">
                                {String(value).slice(0, 8)}••••••••
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {gw.updated_at ? `Updated: ${new Date(gw.updated_at).toLocaleDateString()}` : 'Configured'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(gw)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#1b2b65] hover:text-white hover:border-[#1b2b65] transition shadow-2xs"
                      >
                        <Settings size={13} />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>

      {/* ── EDIT GATEWAY SETTINGS MODAL ── */}
      {editingGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="bg-[#0f1f3d] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FmdqLogo />
                <span className="h-4 w-px bg-white/20" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Configure Gateway Settings
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingGateway(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGateway} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Gateway Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gateway Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Enable Payment Gateway</p>
                  <p className="text-[11px] text-slate-500">Allow applications to process transactions using this gateway.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editIsActive ? 'bg-[#1b2b65]' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${editIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Dynamic Config Key-Value Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Gateway Credentials & API Configuration
                </label>

                {Object.keys(editConfig).length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    No custom configuration keys set. Add keys below.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(editConfig).map(([key, val]) => {
                      const isSecret = showSecretKeys[key]
                      return (
                        <div key={key} className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase">
                            {key}
                          </label>
                          <div className="relative">
                            <input
                              type={isSecret ? 'text' : 'password'}
                              value={val || ''}
                              onChange={(e) =>
                                setEditConfig((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              className="w-full rounded-xl border border-slate-200 py-2 pl-3 pr-9 font-mono text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowSecretKeys((prev) => ({ ...prev, [key]: !prev[key] }))
                              }
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                              {isSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGateway(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1b2b65] py-2.5 text-xs font-semibold text-white hover:bg-[#13204e] transition shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
