import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  RefreshCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Download,
  LogOut,
  ChevronDown,
  User,
  LayoutGrid,
  MoreHorizontal,
  FileText,
  Receipt as ReceiptIcon,
  Printer,
  X,
  ShieldCheck,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import fmdqLogo from '../assets/fmdq-logo.png'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import { fetchApps } from '../api/appsService'

const OTP_BASE = (import.meta.env.VITE_PAY_OTP || '').replace(/\/$/, '')

const fetchTransactions = async (page = 1) => {
  const { data } = await apiClient.get(
    `${OTP_BASE}/payment-gateways/transactions?page=${page}&per_page=10`,
    { baseURL: '' }
  )
  return data
}

const fmt = (amount, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount) || 0)

const fmtRaw = (amount) => {
  return new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)
}

function numberToWords(num) {
  if (num === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion']

  function convertChunk(n) {
    let chunkWords = []
    if (n >= 100) {
      chunkWords.push(ones[Math.floor(n / 100)])
      chunkWords.push('Hundred')
      n %= 100
      if (n > 0) chunkWords.push('And')
    }
    if (n >= 20) {
      chunkWords.push(tens[Math.floor(n / 10)])
      n %= 10
      if (n > 0) {
        chunkWords.push(ones[n])
      }
    } else if (n > 0) {
      chunkWords.push(ones[n])
    }
    return chunkWords.join(' ')
  }

  let words = []
  let scaleIdx = 0
  let temp = Math.floor(num)

  while (temp > 0) {
    const chunk = temp % 1000
    if (chunk > 0) {
      const chunkStr = convertChunk(chunk)
      const scaleStr = scales[scaleIdx]
      words.unshift(chunkStr + (scaleStr ? ' ' + scaleStr : ''))
    }
    temp = Math.floor(temp / 1000)
    scaleIdx++
  }

  return words.join(' ')
}

function toNairaWords(amount) {
  const num = Math.floor(amount)
  const kobo = Math.round((amount - num) * 100)
  
  let nairaStr = numberToWords(num)
  if (nairaStr && num > 0) {
    nairaStr += ' Naira'
  } else if (num === 0) {
    nairaStr = ''
  }
  
  let koboStr = ''
  if (kobo > 0) {
    koboStr = numberToWords(kobo) + ' Kobo'
  }
  
  let result = ''
  if (nairaStr && koboStr) {
    result = nairaStr + ' And ' + koboStr + ' Only'
  } else if (nairaStr) {
    result = nairaStr + ' Only'
  } else if (koboStr) {
    result = koboStr + ' Only'
  } else {
    result = 'Zero Naira Only'
  }
  
  return result.replace(/\s+/g, ' ')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_META = {
  successful: { label: 'Successful', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  success:    { label: 'Successful', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  failed:     { label: 'Failed',     color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
  pending:    { label: 'Pending',    color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  processing: { label: 'Processing', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', icon: AlertCircle },
}

function StatusBadge({ status }) {
  const s = STATUS_META[status?.toLowerCase()] || STATUS_META.pending
  const Icon = s.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border whitespace-nowrap"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <Icon size={11} />
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded bg-slate-100 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function TransactionsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10 })
  const [appsMap, setAppsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Action Menu Dropdown (active row ID)
  const [activeActionMenu, setActiveActionMenu] = useState(null)

  // Invoice & Receipt Modal States
  const [selectedInvoiceTxn, setSelectedInvoiceTxn] = useState(null)
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [res, appsRes] = await Promise.all([
        fetchTransactions(p),
        fetchApps().catch(() => null),
      ])

      const payload = res?.data
      setRows(payload?.data || [])
      setMeta({
        currentPage: payload?.current_page ?? p,
        lastPage: payload?.last_page ?? 1,
        total: payload?.total ?? 0,
        perPage: payload?.per_page ?? 10,
      })

      const appsList = appsRes?.data || appsRes || []
      if (Array.isArray(appsList)) {
        const dict = {}
        appsList.forEach((a) => {
          if (a.id) dict[a.id] = a.app_name || a.name || a.appName
        })
        setAppsMap(dict)
      }
    } catch (err) {
      toast.error('Could not load transactions history.')
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  const handleRefresh = () => load(page)

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const getAppName = (t) =>
    t.app?.app_name ||
    t.app?.name ||
    t.app?.appName ||
    appsMap[t.app_config_id] ||
    appsMap[t.app_id] ||
    appsMap[t.appID] ||
    '—'

  const filtered = rows.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const appName = getAppName(t)
    return (
      t.reference?.toLowerCase().includes(q) ||
      t.customer_email?.toLowerCase().includes(q) ||
      t.customer_first_name?.toLowerCase().includes(q) ||
      t.customer_last_name?.toLowerCase().includes(q) ||
      t.gateway?.name?.toLowerCase().includes(q) ||
      appName.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    )
  })

  const exportCSV = () => {
    const headers = ['Reference', 'Amount', 'Currency', 'Customer Email', 'Customer Name', 'Status', 'Gateway', 'App', 'Date']
    const csvRows = [headers.join(',')]
    filtered.forEach((t) => {
      const name = [t.customer_first_name, t.customer_last_name].filter(Boolean).join(' ')
      csvRows.push([
        t.reference,
        t.amount,
        t.currency || 'NGN',
        t.customer_email || '',
        name,
        t.status,
        t.gateway?.name || '',
        getAppName(t),
        t.created_at ? formatDate(t.created_at) : '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `fmdq-transactions-page-${page}.csv` })
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async (elementId, filename) => {
    const element = document.getElementById(elementId)
    if (!element) {
      toast.error('Document element not found')
      return
    }
    
    const tid = toast.loading('Generating PDF...')
    try {
      // Dynamic import to bypass module issues in Vite and optimize bundle size
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      
      const pdf = new jsPDF('p', 'in', 'letter')
      const margin = 0.3
      const pdfWidth = 8.5
      const pdfHeight = 11
      const printableWidth = pdfWidth - (margin * 2)
      
      const imgHeight = (canvas.height * printableWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight)
      pdf.save(filename)
      
      toast.dismiss(tid)
      toast.success('PDF downloaded successfully!')
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.dismiss(tid)
      toast.error(`Failed to generate PDF: ${err?.message || err || 'Unknown error'}`)
    }
  }

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
                className="rounded-full bg-[#dce3f6] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1b2b65] shadow-xs transition-all"
              >
                Transactions
              </button>
              <button
                type="button"
                onClick={() => navigate('/payment-gateways')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
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

        {/* Main White Content Card Container */}
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
                <span className="font-semibold text-slate-700">Payment Transactions</span>
              </nav>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1b2b65] flex items-center gap-2">
                <CreditCard size={18} className="text-[#1b2b65] shrink-0" />
                Transaction Logs
              </h2>
            </div>

            {/* Right Action Controls: Search, Refresh, Export */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[160px]">
                <input
                  type="text"
                  placeholder="Search reference, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:border-[#1b2b65] focus:outline-none transition-all"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs shrink-0"
              >
                <RefreshCcw size={13} /> Refresh
              </button>

              <button
                type="button"
                onClick={exportCSV}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1 rounded-full bg-[#1b2b65] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#13204e] transition shadow-xs disabled:opacity-50 shrink-0"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          {!loading && (
            <div className="mt-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 min-w-0">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Total Logs</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{meta.total}</p>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/70 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Successful</p>
                <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                  {rows.filter((r) => ['successful', 'success'].includes(r.status?.toLowerCase())).length}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/70 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Pending</p>
                <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                  {rows.filter((r) => r.status?.toLowerCase() === 'pending').length}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50/70 p-3 border border-rose-200/70 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">Failed</p>
                <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                  {rows.filter((r) => r.status?.toLowerCase() === 'failed').length}
                </p>
              </div>
            </div>
          )}

          {/* Table Container with Horizontal Scroll Isolation */}
          <div className="mt-3.5 flex-1 min-h-0 w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5">Reference</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Gateway</th>
                  <th className="px-3 py-2.5">Application</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Date & Time</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      {search ? 'No transaction logs match your search.' : 'No transaction records found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((txn) => {
                    const fullName = [txn.customer_first_name, txn.customer_last_name].filter(Boolean).join(' ')
                    const isSuccess = ['successful', 'success'].includes(txn.status?.toLowerCase())
                    const isMenuOpen = activeActionMenu === txn.id

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Reference */}
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-800 border border-slate-200/60">
                            {txn.reference}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-3 py-2.5 max-w-[150px]">
                          <p className="font-bold text-slate-800 truncate">{fullName || '—'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{txn.customer_email || '—'}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-2.5 font-extrabold text-slate-900 whitespace-nowrap">
                          {fmt(txn.amount, txn.currency)}
                        </td>

                        {/* Gateway */}
                        <td className="px-3 py-2.5 font-medium text-slate-700 max-w-[120px] truncate">
                          {txn.gateway?.name || '—'}
                        </td>

                        {/* Application */}
                        <td className="px-3 py-2.5 font-medium text-slate-700 max-w-[120px] truncate">
                          {getAppName(txn)}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <StatusBadge status={txn.status} />
                        </td>

                        {/* Date */}
                        <td className="px-3 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                          {formatDate(txn.created_at)}
                        </td>

                        {/* Action Menu Dropdown */}
                        <td className="px-3 py-2.5 text-right relative whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenu((prev) => (prev === txn.id ? null : txn.id))}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                          >
                            <span>Options</span>
                            <MoreHorizontal size={14} />
                          </button>

                          {/* Action Menu Popover */}
                          {isMenuOpen && (
                            <div className="absolute right-3 top-10 z-40 w-44 rounded-xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in text-left">
                              {/* Invoice Option */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoiceTxn(txn)
                                  setActiveActionMenu(null)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                              >
                                <FileText size={14} className="text-indigo-600 shrink-0" />
                                <span>Invoice</span>
                              </button>

                              {/* Receipt Option (for successful payments) */}
                              {isSuccess ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedReceiptTxn(txn)
                                    setActiveActionMenu(null)
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                                >
                                  <ReceiptIcon size={14} className="text-emerald-600 shrink-0" />
                                  <span>Receipt</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 cursor-not-allowed"
                                  title="Receipt is only available for successful payments"
                                >
                                  <ReceiptIcon size={14} className="text-slate-300 shrink-0" />
                                  <span>Receipt</span>
                                </button>
                              )}

                              {/* Checkout Option */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/checkout/${txn.reference}`)
                                  setActiveActionMenu(null)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1b2b65] hover:bg-slate-50 transition"
                              >
                                <ExternalLink size={14} className="text-[#1b2b65] shrink-0" />
                                <span>Checkout Page</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && meta.lastPage > 1 && (
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <p>
                Page <span className="font-bold text-slate-800">{meta.currentPage}</span> of{' '}
                <span className="font-bold text-slate-800">{meta.lastPage}</span> ({meta.total} items)
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - meta.currentPage) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                        p === meta.currentPage
                          ? 'bg-[#1b2b65] text-white shadow-2xs'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, meta.lastPage))}
                  disabled={page >= meta.lastPage}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── OFFICIAL FMDQ INVOICE MODAL ── */}
      {selectedInvoiceTxn && (() => {
        const txn = selectedInvoiceTxn
        const customerName = [txn.customer_first_name, txn.customer_last_name].filter(Boolean).join(' ') || '—'
        const total = Number(txn.amount) || 0
        const subtotal = total / 1.075
        const vat = total - subtotal
        const currencySymbol = txn.currency === 'USD' ? '$' : '₦'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto no-print">
            <style>{`
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .print-sheet-invoice, .print-sheet-invoice * {
                  visibility: visible !important;
                }
                .print-sheet-invoice {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  border: 6px double #1e293b !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  background: white !important;
                }
              }
            `}</style>
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col my-8">
              {/* Header */}
              <div className="bg-[#0f1f3d] p-4 text-white flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <FmdqLogo />
                  <span className="h-4 w-px bg-white/20" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Payment Invoice
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceTxn(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Invoice Body Container */}
              <div className="p-6 md:p-8 bg-white max-h-[75vh] overflow-y-auto">
                {/* Print Sheet */}
                <div id="invoice-print-sheet" className="print-sheet-invoice border-[6px] border-double border-slate-800 p-6 flex flex-col bg-white">
                  {/* Top Address & Logo */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-left text-[11px] leading-relaxed text-slate-700">
                      <p className="font-bold text-slate-800">Exchange Place, 35, Idowu Taylor Street, Victoria Island, Lagos</p>
                      <p>Email: <span className="font-semibold text-[#1c2c65]">info@fmdqgroup.com</span></p>
                      <p>Website: <span className="font-semibold text-[#1c2c65]">www.fmdqgroup.com</span></p>
                    </div>
                    <div className="flex flex-col items-end">
                      <img src={fmdqLogo} alt="FMDQ Logo" className="h-10 w-auto" />
                    </div>
                  </div>

                  {/* Title Banner */}
                  <div className="bg-[#1b2b65] text-white font-extrabold text-center py-2 uppercase tracking-wider text-[11px] mb-4">
                    Invoice From FMDQ Group PLC
                  </div>

                  {/* Client Info Grid */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-left text-slate-900 mb-4 table-fixed">
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 w-1/2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Bill to:</span>
                            <span className="font-bold text-slate-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 w-1/2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Date:</span>
                            <span className="font-bold text-slate-900">{formatDate(txn.created_at)}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Registered Name:</span>
                            <span className="font-bold text-slate-900">{txn.customer_company || customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Invoice Number:</span>
                            <span className="font-mono font-bold text-slate-900">{txn.reference}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Registered Address:</span>
                            <span className="font-semibold text-slate-800">{txn.customer_address || '—'}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Our Contact:</span>
                            <span className="font-bold text-slate-900">
                              {[user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.email || 'FMDQ Group Support'}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Attention:</span>
                            <span className="font-bold text-slate-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Tel:</span>
                            <span className="font-bold text-slate-900">{txn.customer_phone || '+234 -1-2778771'}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Line Items Table */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-slate-900 mb-2">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold uppercase text-slate-700 bg-slate-50/50">
                        <th className="border-r border-slate-800 px-3 py-2 text-center w-12">S/N</th>
                        <th className="border-r border-slate-800 px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right w-36">({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800 px-3 py-16 text-center align-top font-medium">1</td>
                        <td className="border-r border-slate-800 px-3 py-16 text-left align-top font-medium">
                          {getAppName(txn)} {txn.description ? ` - ${txn.description}` : ''}
                        </td>
                        <td className="px-3 py-16 text-right align-top font-semibold">{fmtRaw(subtotal)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase">Subtotal</td>
                        <td className="px-3 py-1.5 text-right font-bold">{fmtRaw(subtotal)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase">VAT (7.5%)</td>
                        <td className="px-3 py-1.5 text-right font-bold">{fmtRaw(vat)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase text-[#1b2b65]">Amount Due</td>
                        <td className="px-3 py-1.5 text-right font-extrabold text-[#1b2b65] text-[12px]">{fmtRaw(total)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Amount In Words */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-slate-900">
                    <tbody>
                      <tr>
                        <td className="border-r border-slate-800 px-3 py-2 w-1/3 align-top font-bold uppercase">Amount in Words</td>
                        <td className="px-3 py-2 w-2/3 align-top font-bold text-[#1b2b65]">{toNairaWords(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF('invoice-print-sheet', `invoice-${txn.reference}.pdf`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Download size={15} /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ref = txn.reference
                    setSelectedInvoiceTxn(null)
                    navigate(`/checkout/${ref}`)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1b2b65] py-2.5 text-xs font-semibold text-white hover:bg-[#13204e] transition shadow-md"
                >
                  <CreditCard size={15} /> Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── OFFICIAL FMDQ SUCCESS RECEIPT MODAL ── */}
      {selectedReceiptTxn && (() => {
        const txn = selectedReceiptTxn
        const customerName = [txn.customer_first_name, txn.customer_last_name].filter(Boolean).join(' ') || '—'
        const total = Number(txn.amount) || 0
        const subtotal = total / 1.075
        const vat = total - subtotal
        const currencySymbol = txn.currency === 'USD' ? '$' : '₦'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto no-print">
            <style>{`
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .print-sheet-receipt, .print-sheet-receipt * {
                  visibility: visible !important;
                }
                .print-sheet-receipt {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  border: 6px double #1e293b !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  background: white !important;
                }
              }
            `}</style>
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col my-8">
              {/* Header */}
              <div className="bg-[#0f1f3d] p-4 text-white flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <FmdqLogo />
                  <span className="h-4 w-px bg-white/20" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Payment Receipt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptTxn(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Receipt Body Container */}
              <div className="p-6 md:p-8 bg-white max-h-[75vh] overflow-y-auto">
                {/* Print Sheet */}
                <div id="receipt-print-sheet" className="print-sheet-receipt border-[6px] border-double border-slate-800 p-6 flex flex-col bg-white">
                  {/* Top Address & Logo */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-left text-[11px] leading-relaxed text-slate-700">
                      <p className="font-bold text-slate-800">Exchange Place, 35, Idowu Taylor Street, Victoria Island, Lagos</p>
                      <p>Email: <span className="font-semibold text-[#1c2c65]">info@fmdqgroup.com</span></p>
                      <p>Website: <span className="font-semibold text-[#1c2c65]">www.fmdqgroup.com</span></p>
                    </div>
                    <div className="flex flex-col items-end">
                      <img src={fmdqLogo} alt="FMDQ Logo" className="h-10 w-auto" />
                    </div>
                  </div>

                  {/* Title Banner */}
                  <div className="bg-[#1b2b65] text-white font-extrabold text-center py-2 uppercase tracking-wider text-[11px] mb-4">
                    Receipt From FMDQ Group PLC
                  </div>

                  {/* Client Info Grid */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-left text-slate-900 mb-4 table-fixed">
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 w-1/2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Bill to:</span>
                            <span className="font-bold text-slate-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 w-1/2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Date:</span>
                            <span className="font-bold text-slate-900">{formatDate(txn.created_at)}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Registered Name:</span>
                            <span className="font-bold text-slate-900">{txn.customer_company || customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Receipt Number:</span>
                            <span className="font-mono font-bold text-slate-900">{txn.reference}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Registered Address:</span>
                            <span className="font-semibold text-slate-800">{txn.customer_address || '—'}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Our Contact:</span>
                            <span className="font-bold text-slate-900">
                              {[user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.email || 'FMDQ Group Support'}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-32 text-slate-500 font-medium">Attention:</span>
                            <span className="font-bold text-slate-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="border border-slate-800 px-3 py-2 align-top">
                          <div className="flex">
                            <span className="w-28 text-slate-500 font-medium">Tel:</span>
                            <span className="font-bold text-slate-900">{txn.customer_phone || '+234 -1-2778771'}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Line Items Table */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-slate-900 mb-2">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold uppercase text-slate-700 bg-slate-50/50">
                        <th className="border-r border-slate-800 px-3 py-2 text-center w-12">S/N</th>
                        <th className="border-r border-slate-800 px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right w-36">({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800 px-3 py-16 text-center align-top font-medium">1</td>
                        <td className="border-r border-slate-800 px-3 py-16 text-left align-top font-medium">
                          {getAppName(txn)} {txn.description ? ` - ${txn.description}` : ''}
                        </td>
                        <td className="px-3 py-16 text-right align-top font-semibold">{fmtRaw(subtotal)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase">Subtotal</td>
                        <td className="px-3 py-1.5 text-right font-bold">{fmtRaw(subtotal)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase">VAT (7.5%)</td>
                        <td className="px-3 py-1.5 text-right font-bold">{fmtRaw(vat)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-bold uppercase text-emerald-700">Total Paid</td>
                        <td className="px-3 py-1.5 text-right font-extrabold text-emerald-700 text-[12px]">{fmtRaw(total)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Amount In Words */}
                  <table className="w-full border-collapse border border-slate-800 text-[11px] text-slate-900">
                    <tbody>
                      <tr>
                        <td className="border-r border-slate-800 px-3 py-2 w-1/3 align-top font-bold uppercase">Amount in Words</td>
                        <td className="px-3 py-2 w-2/3 align-top font-bold text-[#1b2b65]">{toNairaWords(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF('receipt-print-sheet', `receipt-${txn.reference}.pdf`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Download size={15} /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceiptTxn(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1b2b65] py-2.5 text-xs font-semibold text-white hover:bg-[#13204e] transition shadow-md"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
