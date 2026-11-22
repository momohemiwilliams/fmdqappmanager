import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  FileText,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Terminal,
  User,
  Users,
  X,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import { IAUTH_API_DOCS } from '../data/iauthApiDocs'
import { useAuth } from '../context/AuthContext'

const GROUP_ICONS = {
  'user-auth': Users,
  'audit-logs': FileText,
  'admin-app-setup': Layers,
  'admin-auth': Shield,
  'admin-roles': ShieldCheck,
  groups: Users,
  subsidiaries: Building2,
  'payment-integration': CreditCard,
  'otp-integration': ShieldCheck,
}

const METHOD_STYLES = {
  GET: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  POST: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  PUT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PATCH: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

const AUTH_LABELS = {
  bearer: 'Bearer Token',
  basic: 'Basic Auth',
  noauth: 'No Auth',
  inherit: 'Inherited (Basic)',
  custom: 'App Credentials Headers',
}

function MethodBadge({ method }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2 py-1 font-mono text-[11px] font-bold ${
        METHOD_STYLES[method] || METHOD_STYLES.GET
      }`}
    >
      {method}
    </span>
  )
}

export default function IauthApiDocsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const allEndpoints = useMemo(
    () => IAUTH_API_DOCS.groups.flatMap((g) => g.endpoints.map((e) => ({ ...e, groupKey: g.key, groupName: g.name }))),
    [],
  )

  const groupParam = searchParams.get('group')
  const initialGroup = IAUTH_API_DOCS.groups.find((g) => g.key === groupParam) || IAUTH_API_DOCS.groups[0]
  const [activeGroupKey, setActiveGroupKey] = useState(initialGroup.key)
  const [selectedEndpoint, setSelectedEndpoint] = useState(
    initialGroup.endpoints[0] ? { ...initialGroup.endpoints[0], groupKey: initialGroup.key } : null,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedField, setCopiedField] = useState(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const activeBaseUrl = useMemo(() => {
    const key = selectedEndpoint?.groupKey || activeGroupKey
    const parentGroup = IAUTH_API_DOCS.groups.find((g) => g.key === key)
    if (parentGroup && parentGroup.baseUrl) {
      return parentGroup.baseUrl
    }
    return IAUTH_API_DOCS.baseUrl
  }, [selectedEndpoint, activeGroupKey])

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('group', activeGroupKey)
      return next
    }, { replace: true })
  }, [activeGroupKey, setSearchParams])

  const activeGroup = IAUTH_API_DOCS.groups.find((g) => g.key === activeGroupKey) || IAUTH_API_DOCS.groups[0]

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null
    const q = searchTerm.toLowerCase()
    return allEndpoints.filter(
      (e) => e.name.toLowerCase().includes(q) || e.path.toLowerCase().includes(q) || e.method.toLowerCase().includes(q),
    )
  }, [searchTerm, allEndpoints])

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const selectEndpoint = (endpoint, groupKey) => {
    const effectiveGroupKey = groupKey || endpoint.groupKey || activeGroupKey
    setSelectedEndpoint({ ...endpoint, groupKey: effectiveGroupKey })
    if (effectiveGroupKey && effectiveGroupKey !== activeGroupKey) setActiveGroupKey(effectiveGroupKey)
    setSearchTerm('')
  }

  const getCurlSnippet = (ep) => {
    const key = ep.groupKey || selectedEndpoint?.groupKey || activeGroupKey
    const parentGroup = IAUTH_API_DOCS.groups.find((g) => g.key === key)
    const baseUrl = parentGroup && parentGroup.baseUrl ? parentGroup.baseUrl : IAUTH_API_DOCS.baseUrl
    const url = `${baseUrl}${ep.path}`
    const authFlag = ep.auth === 'basic' || ep.auth === 'inherit' 
      ? ' \\\n  -u "fmdq_admin:<password>"' 
      : ep.auth === 'bearer' 
        ? ' \\\n  -H "Authorization: Bearer <token>"' 
        : ep.auth === 'custom'
          ? ' \\\n  -H "ID: 30" \\\n  -H "Username: fmrr_app_user" \\\n  -H "Password: securepassword123"'
          : ''
    const bodyFlag = ep.requestBody ? ` \\\n  -d '${ep.requestBody.replace(/\n\s*/g, ' ')}'` : ''
    return `curl -X ${ep.method} "${url}"${authFlag} \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json"${bodyFlag}`
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Header Bar */}
      <header className="bg-[#0f1f3d] border-b border-slate-800 px-4 py-3 lg:px-8 shrink-0">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
              <FmdqLogo className="shadow-md" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 w-full lg:w-auto order-3 lg:order-2">
            <span className="rounded-full bg-[#dbe4f9] px-3 py-0.5 text-[11px] font-bold tracking-wider text-[#1c2c65] uppercase shadow-xs">
              iAuth
            </span>
            <nav className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-md flex-wrap justify-center text-slate-900">
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
                onClick={() => navigate('/transactions')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Transactions
              </button>
              <button
                type="button"
                className="rounded-full bg-[#dce3f6] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1b2b65] shadow-xs transition-all"
              >
                iAuth API Docs
              </button>
            </nav>
          </div>

          <div className="relative flex items-center justify-end order-2 lg:order-3">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white transition hover:bg-white/20"
            >
              <ChevronDown size={15} className="text-white/80" />
              <span className="text-xs font-semibold tracking-wide text-white">Admin</span>
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/40 bg-slate-200">
                <User size={16} className="absolute inset-0 m-auto text-slate-600" />
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-white p-2 text-slate-800 shadow-2xl ring-1 ring-black/5 animate-in fade-in">
                <div className="border-b border-slate-100 px-3 py-1.5">
                  <p className="text-xs font-bold text-slate-800">Administrator</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@fmdqgroup.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LayoutGrid size={14} /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 lg:p-8 space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f1f3d] via-[#1b2b65] to-[#1e1b4b] p-6 lg:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <BookOpen size={14} /> iAuth Service Reference
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">iAuth API Documentation</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Complete endpoint reference for the FMDQ iAuth Central Authentication Service — admin auth, per-app user
              management, roles, groups, subsidiaries and audit logs.
            </p>
          </div>

          <div className="w-full md:w-80 bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 shadow-xl space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Base URL</label>
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate rounded-xl bg-slate-800 border border-slate-700 py-2 px-3 text-xs font-mono font-bold text-white">
                {activeBaseUrl}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeBaseUrl, 'Base URL')}
                className="shrink-0 rounded-xl bg-slate-800 border border-slate-700 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Copy base URL"
              >
                {copiedField === 'Base URL' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Two-column: sidebar nav + endpoint detail */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-700">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search endpoints..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 py-2 pl-8 pr-8 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto no-scrollbar p-2">
              {searchResults ? (
                <div className="space-y-1">
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
                  </p>
                  {searchResults.map((ep) => (
                    <button
                      key={`${ep.groupKey}-${ep.name}`}
                      type="button"
                      onClick={() => selectEndpoint(ep, ep.groupKey)}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                        selectedEndpoint?.name === ep.name && selectedEndpoint?.path === ep.path
                          ? 'bg-[#1b2b65] text-white'
                          : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <MethodBadge method={ep.method} />
                      <span className="truncate font-semibold">{ep.name}</span>
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-slate-500">No endpoints match your search.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {IAUTH_API_DOCS.groups.map((group) => {
                    const Icon = GROUP_ICONS[group.key] || Server
                    const isActive = group.key === activeGroupKey
                    return (
                      <div key={group.key}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGroupKey(group.key)
                            if (group.endpoints && group.endpoints.length > 0) {
                              setSelectedEndpoint({ ...group.endpoints[0], groupKey: group.key })
                            }
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-xs font-bold transition ${
                            isActive ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-700/40'
                          }`}
                        >
                          <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                          <span className="flex-1 truncate">{group.name}</span>
                          <span className="rounded-full bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                            {group.endpoints.length}
                          </span>
                        </button>

                        {isActive && (
                          <div className="ml-3.5 mt-1 mb-2 space-y-0.5 border-l border-slate-700 pl-3">
                            {group.endpoints.map((ep) => (
                              <button
                                key={ep.name}
                                type="button"
                                onClick={() => selectEndpoint(ep, group.key)}
                                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                                  selectedEndpoint?.name === ep.name && selectedEndpoint?.path === ep.path
                                    ? 'bg-[#1b2b65] text-white font-semibold'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                }`}
                              >
                                <MethodBadge method={ep.method} />
                                <span className="truncate">{ep.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Endpoint Detail */}
          {selectedEndpoint && (
            <div className="rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-700 pb-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <MethodBadge method={selectedEndpoint.method} />
                    <code className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs sm:text-sm font-mono text-slate-200">
                      {selectedEndpoint.path}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${activeBaseUrl}${selectedEndpoint.path}`, 'Endpoint URL')}
                      className="text-slate-400 hover:text-white transition"
                      title="Copy full URL"
                    >
                      {copiedField === 'Endpoint URL' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      <Lock size={11} /> {AUTH_LABELS[selectedEndpoint.auth] || selectedEndpoint.auth}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedEndpoint.name}</h2>
                  {selectedEndpoint.description && (
                    <p className="text-xs sm:text-sm text-slate-400">{selectedEndpoint.description}</p>
                  )}
                </div>

                {selectedEndpoint.auth === 'custom' && (
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2 text-xs">
                    <h4 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} /> Authentication Headers Required
                    </h4>
                    <p className="text-slate-400">
                      This endpoint requires server-to-server validation. Provide your application credentials in the request headers:
                    </p>
                    <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5 font-mono text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold">ID</span>
                      <span className="text-emerald-400 font-bold">30</span>
                      <span className="text-slate-400 font-bold">Username</span>
                      <span className="text-emerald-400 font-bold">fmrr_app_user</span>
                      <span className="text-slate-400 font-bold">Password</span>
                      <span className="text-emerald-400 font-bold">securepassword123</span>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Request Body</h3>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedEndpoint.requestBody, 'Request Body')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-600 transition"
                      >
                        {copiedField === 'Request Body' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        Copy
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed">
                      <code>{selectedEndpoint.requestBody}</code>
                    </pre>
                  </div>
                )}

                {/* Example Response */}
                {selectedEndpoint.response && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        Example Response
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${
                            selectedEndpoint.response.code < 300
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}
                        >
                          {selectedEndpoint.response.code}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedEndpoint.response.body, 'Response Body')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-600 transition"
                      >
                        {copiedField === 'Response Body' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        Copy
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed max-h-96">
                      <code>{selectedEndpoint.response.body}</code>
                    </pre>
                  </div>
                )}

                {/* cURL Snippet */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal size={14} /> cURL
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getCurlSnippet(selectedEndpoint), 'cURL Command')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-600 transition"
                    >
                      {copiedField === 'cURL Command' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed">
                    <code>{getCurlSnippet(selectedEndpoint)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
