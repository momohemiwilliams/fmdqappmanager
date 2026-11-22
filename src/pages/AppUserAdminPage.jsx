import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ChevronDown,
  Search,
  X,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  KeyRound,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  LogOut,
  User,
  LayoutGrid,
  Users as UsersIcon,
  ListChecks,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  FolderKanban,
  Info,
  ScrollText,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  CreditCard,
  AlertCircle,
  RefreshCcw,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import { fetchApps } from '../api/appsService'
import apiClient, { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { deriveAppCode } from '../utils/appCode'
import { exportToCsv } from '../utils/csv'
import {
  fetchAppUsers,
  createAppUser,
  updateAppUser,
  deleteAppUser,
  deactivateAppUser,
  activateAppUser,
  fetchPendingActions,
  approvePendingAction,
  denyPendingAction,
  triggerForgotPassword,
  resetUserPassword,
} from '../api/userMgtService'
import {
  fetchAppRoles,
  createRole,
  fetchRole,
  fetchGroups,
  createGroup,
  fetchGroup,
  updateGroup,
  deleteGroup,
  fetchSubsidiaries,
  createSubsidiary,
  fetchSubsidiary,
  updateSubsidiary,
  deleteSubsidiary,
} from '../api/orgService'
import { fetchAuditLogs } from '../api/auditService'

const TABLE_PAGE_SIZE = 10

const TABS = [
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'pending', label: 'Pending Actions', icon: ListChecks },
  { key: 'roles', label: 'Roles', icon: ShieldCheck },
  { key: 'groups', label: 'Groups', icon: FolderKanban },
  { key: 'subsidiaries', label: 'Subsidiaries', icon: Building2 },
  { key: 'audit', label: 'Audit Logs', icon: ScrollText },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
  { key: 'otpLogs', label: 'OTP Logs', icon: KeyRound },
]

const AUDIT_SORT_OPTIONS = [
  { value: 'created_at', label: 'Date' },
  { value: 'id', label: 'ID' },
  { value: 'email', label: 'Email' },
  { value: 'action', label: 'Action' },
  { value: 'ip_address', label: 'IP Address' },
]

const DEFAULT_AUDIT_FILTERS = {
  search: '',
  id: '',
  email: '',
  action: '',
  description: '',
  ip_address: '',
  details: '',
  date_from: '',
  date_to: '',
  sort_by: 'created_at',
  sort_dir: 'desc',
  per_page: TABLE_PAGE_SIZE,
}

const ACTION_META = {
  create: { label: 'Create', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  update: { label: 'Update', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  delete: { label: 'Delete', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  activate: { label: 'Activate', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  deactivate: { label: 'Deactivate', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
}

function ActionTypeBadge({ action }) {
  const meta = ACTION_META[action] || { label: action || 'Action', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' }
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize whitespace-nowrap"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
    >
      {meta.label}
    </span>
  )
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function AuthoriserSelect({ value, onChange, users, required = true, className = '' }) {
  return (
    <select required={required} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="" disabled>
        {users.length === 0 ? 'No users available' : 'Select authoriser'}
      </option>
      {users.map((u) => (
        <option key={u.id} value={u.email}>
          {`${u.firstname || ''} ${u.lastname || ''}`.trim() || u.email}
        </option>
      ))}
    </select>
  )
}

function TableToolbar({ search, onSearchChange, placeholder, onRefresh, onExport, exportDisabled, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <div className="relative min-w-[160px] flex-1 sm:w-64 sm:flex-none">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 transition-all focus:border-[#1b2b65] focus:bg-white focus:outline-none"
          />
        </div>
      )}
      {children}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <RefreshCcw size={13} /> Refresh
        </button>
      )}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1b2b65] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#13204e] disabled:opacity-50"
        >
          <Download size={13} /> Export CSV
        </button>
      )}
    </div>
  )
}

function TablePagination({ currentPage, lastPage, total, itemLabel = 'item', onPageChange }) {
  if (lastPage <= 1) {
    return (
      <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        {total} {itemLabel}
        {total === 1 ? '' : 's'} total
      </div>
    )
  }
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter((p) => Math.abs(p - currentPage) <= 2)
  return (
    <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 sm:flex-row">
      <p>
        Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
        <span className="font-bold text-slate-800">{lastPage}</span> ({total} {itemLabel}
        {total === 1 ? '' : 's'})
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft size={13} /> Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
              p === currentPage ? 'bg-[#1b2b65] text-white shadow-2xs' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

function TransactionStatusBadge({ status }) {
  const s = status?.toLowerCase()
  if (s === 'successful' || s === 'success') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 size={11} />
        Successful
      </span>
    )
  }
  if (s === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 whitespace-nowrap">
        <XCircle size={11} />
        Failed
      </span>
    )
  }
  if (s === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 whitespace-nowrap">
        <AlertCircle size={11} />
        Processing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
      <Clock size={11} />
      Pending
    </span>
  )
}

function OtpStatusBadge({ status }) {
  const s = status?.toLowerCase()
  if (s === 'validated') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 size={11} />
        Validated
      </span>
    )
  }
  if (s === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 whitespace-nowrap">
        <XCircle size={11} />
        Expired
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
      <Clock size={11} />
      Pending
    </span>
  )
}

function LogTypeBadge({ type }) {
  if (type === 'master') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#1b2b65]/20 bg-[#1b2b65]/5 px-2 py-0.5 text-[10px] font-medium text-[#1b2b65] whitespace-nowrap">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 whitespace-nowrap">
      Archived
    </span>
  )
}

function formatCurrency(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount) || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]'
const labelClass = 'block text-xs font-semibold text-slate-700'

export default function AppUserAdminPage() {
  const { appId } = useParams()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const [app, setApp] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [activeActionMenu, setActiveActionMenu] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [users, setUsers] = useState([])
  const [usersStatus, setUsersStatus] = useState('loading') // loading | success | error
  const [usersMeta, setUsersMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: TABLE_PAGE_SIZE })

  const [pendingActions, setPendingActions] = useState([])
  const [pendingStatus, setPendingStatus] = useState('loading')

  const [roles, setRoles] = useState([])
  const [rolesStatus, setRolesStatus] = useState('loading')

  const [groups, setGroups] = useState([])
  const [groupsStatus, setGroupsStatus] = useState('loading')

  const [subsidiaries, setSubsidiaries] = useState([])
  const [subsidiariesStatus, setSubsidiariesStatus] = useState('loading')

  const [auditLogs, setAuditLogs] = useState([])
  const [auditStatus, setAuditStatus] = useState('loading')
  const [auditMeta, setAuditMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, paginated: false })
  const [auditFilters, setAuditFilters] = useState(DEFAULT_AUDIT_FILTERS)
  const [auditFiltersDraft, setAuditFiltersDraft] = useState(DEFAULT_AUDIT_FILTERS)
  const [showAuditFiltersPanel, setShowAuditFiltersPanel] = useState(false)
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(null)

  const [transactions, setTransactions] = useState([])
  const [transactionsStatus, setTransactionsStatus] = useState('loading') // loading | success | error
  const [transactionsMeta, setTransactionsMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const [otpLogs, setOtpLogs] = useState([])
  const [otpLogsStatus, setOtpLogsStatus] = useState('loading') // loading | success | error
  const [otpLogsMeta, setOtpLogsMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null) // holds the target user
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showDenyModal, setShowDenyModal] = useState(null) // holds the target pending action
  const [showResetModal, setShowResetModal] = useState(null)
  const [busyId, setBusyId] = useState(null)

  // Roles: create + view single
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [showRoleDetailModal, setShowRoleDetailModal] = useState(null) // holds fetched single-role detail
  const [isLoadingRoleDetail, setIsLoadingRoleDetail] = useState(false)

  // Groups: create / edit / delete
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [showEditGroupModal, setShowEditGroupModal] = useState(null)
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(null)
  const [groupActionMenu, setGroupActionMenu] = useState(null)

  // Subsidiaries: create / edit / delete
  const [showCreateSubsidiaryModal, setShowCreateSubsidiaryModal] = useState(false)
  const [subsidiaryForm, setSubsidiaryForm] = useState({ name: '', code: '', description: '' })
  const [showEditSubsidiaryModal, setShowEditSubsidiaryModal] = useState(null)
  const [showDeleteSubsidiaryModal, setShowDeleteSubsidiaryModal] = useState(null)
  const [subsidiaryActionMenu, setSubsidiaryActionMenu] = useState(null)

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const loadApp = useCallback(async () => {
    try {
      const response = await fetchApps()
      const list = Array.isArray(response?.data) ? response.data : []
      const match = list.find((a) => String(a.id) === String(appId))
      setApp(match || null)
    } catch {
      setApp(null)
    }
  }, [appId])

  const loadUsers = useCallback(
    async (page = 1) => {
      setUsersStatus('loading')
      try {
        const response = await fetchAppUsers(appId, page, TABLE_PAGE_SIZE)
        const paginator = response?.data
        const rawList = Array.isArray(paginator?.data) ? paginator.data : Array.isArray(paginator) ? paginator : []
        const isServerPaginated = Boolean(paginator?.last_page)
        const list = isServerPaginated ? rawList : rawList.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE)
        setUsers(list)
        setUsersMeta({
          currentPage: paginator?.current_page ?? page,
          lastPage: paginator?.last_page ?? Math.max(1, Math.ceil(rawList.length / TABLE_PAGE_SIZE)),
          total: paginator?.total ?? rawList.length,
          perPage: paginator?.per_page ?? TABLE_PAGE_SIZE,
        })
        setUsersStatus('success')
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Unable to load users for this application.'))
        setUsersStatus('error')
      }
    },
    [appId],
  )

  const loadPendingActions = useCallback(async () => {
    setPendingStatus('loading')
    try {
      const response = await fetchPendingActions(appId)
      setPendingActions(Array.isArray(response?.data) ? response.data : [])
      setPendingStatus('success')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load pending actions.'))
      setPendingStatus('error')
    }
  }, [appId])

  const loadRoles = useCallback(async () => {
    setRolesStatus('loading')
    try {
      const response = await fetchAppRoles(appId)
      setRoles(Array.isArray(response?.data) ? response.data : [])
      setRolesStatus('success')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load roles.'))
      setRolesStatus('error')
    }
  }, [appId])

  const loadGroups = useCallback(async () => {
    setGroupsStatus('loading')
    try {
      const response = await fetchGroups(appId)
      setGroups(Array.isArray(response?.data) ? response.data : [])
      setGroupsStatus('success')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load groups.'))
      setGroupsStatus('error')
    }
  }, [appId])

  const loadSubsidiaries = useCallback(async () => {
    setSubsidiariesStatus('loading')
    try {
      const response = await fetchSubsidiaries(appId)
      setSubsidiaries(Array.isArray(response?.data) ? response.data : [])
      setSubsidiariesStatus('success')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load subsidiaries.'))
      setSubsidiariesStatus('error')
    }
  }, [appId])

  const loadAuditLogs = useCallback(
    async (page = 1, filters = auditFilters) => {
      setAuditStatus('loading')
      try {
        const response = await fetchAuditLogs(appId, filters, page)
        const payload = response?.data
        const isPaginated = payload && !Array.isArray(payload) && Array.isArray(payload.data)
        const list = isPaginated ? payload.data : Array.isArray(payload) ? payload : []
        setAuditLogs(list)
        setAuditMeta({
          currentPage: isPaginated ? payload.current_page ?? page : 1,
          lastPage: isPaginated ? payload.last_page ?? 1 : 1,
          total: isPaginated ? payload.total ?? list.length : list.length,
          paginated: isPaginated,
        })
        setAuditStatus('success')
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Unable to load audit logs.'))
        setAuditStatus('error')
      }
    },
    [appId, auditFilters],
  )

  const loadTransactions = useCallback(
    async (page = 1) => {
      setTransactionsStatus('loading')
      try {
        const otpBase = (import.meta.env.VITE_PAY_OTP || '').replace(/\/$/, '')
        const { data } = await apiClient.get(
          `${otpBase}/payment-gateways/transactions?app_id=${appId}&page=${page}&per_page=${TABLE_PAGE_SIZE}`,
          { baseURL: '' }
        )
        const payload = data?.data
        const rawList = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        const isServerPaginated = Boolean(payload?.last_page)
        const list = isServerPaginated ? rawList : rawList.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE)
        setTransactions(list)
        setTransactionsMeta({
          currentPage: payload?.current_page ?? page,
          lastPage: payload?.last_page ?? Math.max(1, Math.ceil(rawList.length / TABLE_PAGE_SIZE)),
          total: payload?.total ?? rawList.length,
        })
        setTransactionsStatus('success')
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Unable to load transactions.'))
        setTransactionsStatus('error')
      }
    },
    [appId],
  )

  const loadOtpLogs = useCallback(
    async (page = 1) => {
      setOtpLogsStatus('loading')
      try {
        const otpBase = (import.meta.env.VITE_PAY_OTP || '').replace(/\/$/, '')
        const { data } = await apiClient.get(
          `${otpBase}/logs/unified/${appId}?page=${page}&per_page=${TABLE_PAGE_SIZE}`,
          { baseURL: '' }
        )
        const payload = data?.data
        const rawList = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        const isServerPaginated = Boolean(payload?.last_page)
        const list = isServerPaginated ? rawList : rawList.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE)
        setOtpLogs(list)
        setOtpLogsMeta({
          currentPage: payload?.current_page ?? page,
          lastPage: payload?.last_page ?? Math.max(1, Math.ceil(rawList.length / TABLE_PAGE_SIZE)),
          total: payload?.total ?? rawList.length,
        })
        setOtpLogsStatus('success')
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Unable to load OTP logs.'))
        setOtpLogsStatus('error')
      }
    },
    [appId],
  )

  useEffect(() => {
    loadApp()
    loadUsers()
    loadPendingActions()
    loadRoles()
    loadGroups()
    loadSubsidiaries()
    loadAuditLogs(1, DEFAULT_AUDIT_FILTERS)
    loadTransactions()
    loadOtpLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadApp, loadUsers, loadPendingActions, loadRoles, loadGroups, loadSubsidiaries, loadTransactions, loadOtpLogs])

  useEffect(() => {
    if (activeTab === 'transactions' && transactionsStatus === 'success' && transactions.length === 0) {
      setActiveTab('users')
    }
    if (activeTab === 'otpLogs' && otpLogsStatus === 'success' && otpLogs.length === 0) {
      setActiveTab('users')
    }
  }, [activeTab, transactionsStatus, transactions, otpLogsStatus, otpLogs])

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const q = searchTerm.toLowerCase()
    return users.filter(
      (u) =>
        `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.group?.toLowerCase().includes(q) ||
        u.subsidiary?.toLowerCase().includes(q),
    )
  }, [users, searchTerm])

  const pendingCount = pendingActions.filter((a) => a.status === 'pending').length

  const [rolesSearchTerm, setRolesSearchTerm] = useState('')
  const filteredRoles = useMemo(() => {
    if (!rolesSearchTerm.trim()) return roles
    const q = rolesSearchTerm.toLowerCase()
    return roles.filter((r) => r.name?.toLowerCase().includes(q) || String(r.id).includes(q))
  }, [roles, rolesSearchTerm])
  const [rolesPage, setRolesPage] = useState(1)
  useEffect(() => setRolesPage(1), [rolesSearchTerm])
  const rolesLastPage = Math.max(1, Math.ceil(filteredRoles.length / TABLE_PAGE_SIZE))
  const pagedRoles = filteredRoles.slice((rolesPage - 1) * TABLE_PAGE_SIZE, rolesPage * TABLE_PAGE_SIZE)

  const [pendingSearchTerm, setPendingSearchTerm] = useState('')
  const filteredPendingActions = useMemo(() => {
    if (!pendingSearchTerm.trim()) return pendingActions
    const q = pendingSearchTerm.toLowerCase()
    return pendingActions.filter((a) =>
      [
        a.action,
        a.status,
        a.user?.firstname,
        a.user?.lastname,
        a.user?.email,
        a.requested_by?.firstname,
        a.requested_by?.lastname,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [pendingActions, pendingSearchTerm])
  const [pendingPage, setPendingPage] = useState(1)
  useEffect(() => setPendingPage(1), [pendingSearchTerm])
  const pendingLastPage = Math.max(1, Math.ceil(filteredPendingActions.length / TABLE_PAGE_SIZE))
  const pagedPendingActions = filteredPendingActions.slice(
    (pendingPage - 1) * TABLE_PAGE_SIZE,
    pendingPage * TABLE_PAGE_SIZE,
  )

  const [groupsSearchTerm, setGroupsSearchTerm] = useState('')
  const filteredGroups = useMemo(() => {
    if (!groupsSearchTerm.trim()) return groups
    const q = groupsSearchTerm.toLowerCase()
    return groups.filter((g) => g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q))
  }, [groups, groupsSearchTerm])
  const [groupsPage, setGroupsPage] = useState(1)
  useEffect(() => setGroupsPage(1), [groupsSearchTerm])
  const groupsLastPage = Math.max(1, Math.ceil(filteredGroups.length / TABLE_PAGE_SIZE))
  const pagedGroups = filteredGroups.slice((groupsPage - 1) * TABLE_PAGE_SIZE, groupsPage * TABLE_PAGE_SIZE)

  const [subsidiariesSearchTerm, setSubsidiariesSearchTerm] = useState('')
  const filteredSubsidiaries = useMemo(() => {
    if (!subsidiariesSearchTerm.trim()) return subsidiaries
    const q = subsidiariesSearchTerm.toLowerCase()
    return subsidiaries.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
    )
  }, [subsidiaries, subsidiariesSearchTerm])
  const [subsidiariesPage, setSubsidiariesPage] = useState(1)
  useEffect(() => setSubsidiariesPage(1), [subsidiariesSearchTerm])
  const subsidiariesLastPage = Math.max(1, Math.ceil(filteredSubsidiaries.length / TABLE_PAGE_SIZE))
  const pagedSubsidiaries = filteredSubsidiaries.slice(
    (subsidiariesPage - 1) * TABLE_PAGE_SIZE,
    subsidiariesPage * TABLE_PAGE_SIZE,
  )

  const getUserRoleName = (targetUser) => {
    if (targetUser?.role?.name) return targetUser.role.name
    if (targetUser?.role_id) {
      const match = roles.find((r) => String(r.id) === String(targetUser.role_id))
      if (match) return match.name
    }
    return '—'
  }

  const getUserFullName = (targetUser) => `${targetUser?.firstname || ''} ${targetUser?.lastname || ''}`.trim() || 'User'

  // ── Create user ────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role_id: '',
    group: '',
    subsidiary: '',
    division: '',
    authoriser_email: '',
  })

  const openCreateModal = () => {
    setCreateForm({
      firstname: '',
      lastname: '',
      email: '',
      role_id: roles[0]?.id ? String(roles[0].id) : '',
      group: '',
      subsidiary: '',
      division: '',
      authoriser_email: '',
    })
    setShowCreateModal(true)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!createForm.role_id) {
      toast.error('Please select a role')
      return
    }
    const toastId = toast.loading('Submitting user for approval...')
    try {
      const response = await createAppUser(appId, {
        firstname: createForm.firstname.trim(),
        lastname: createForm.lastname.trim(),
        email: createForm.email.trim(),
        role_id: Number(createForm.role_id),
        group: createForm.group.trim(),
        subsidiary: createForm.subsidiary.trim(),
        division: createForm.division.trim(),
        authoriser_email: createForm.authoriser_email.trim(),
      })
      toast.dismiss(toastId)
      toast.success(response?.message || 'User creation requested. Pending admin approval.')
      setShowCreateModal(false)
      loadPendingActions()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to create user.'))
    }
  }

  // ── Edit user ──────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role_id: '',
    group: '',
    subsidiary: '',
    division: '',
    authoriser_email: '',
  })

  const openEditModal = (targetUser) => {
    setEditForm({
      firstname: targetUser.firstname || '',
      lastname: targetUser.lastname || '',
      email: targetUser.email || '',
      role_id: targetUser.role_id ? String(targetUser.role_id) : targetUser.role?.id ? String(targetUser.role.id) : '',
      group: targetUser.group || '',
      subsidiary: targetUser.subsidiary || '',
      division: targetUser.division || '',
      authoriser_email: '',
    })
    setShowEditModal(targetUser)
    setActiveActionMenu(null)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Submitting update for approval...')
    try {
      const response = await updateAppUser(appId, showEditModal.id, {
        firstname: editForm.firstname.trim(),
        lastname: editForm.lastname.trim(),
        email: editForm.email.trim(),
        role_id: editForm.role_id ? Number(editForm.role_id) : undefined,
        group: editForm.group.trim(),
        subsidiary: editForm.subsidiary.trim(),
        division: editForm.division.trim(),
        authoriser_email: editForm.authoriser_email.trim(),
      })
      toast.dismiss(toastId)
      toast.success(response?.message || 'User updated successfully.')
      setShowEditModal(null)
      loadUsers(usersMeta.currentPage)
      loadPendingActions()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to update user.'))
    }
  }

  // ── Delete user ────────────────────────────────────────────────────────
  const [deleteForm, setDeleteForm] = useState({ authoriser_email: '', reason: '' })

  const openDeleteModal = (targetUser) => {
    setDeleteForm({ authoriser_email: '', reason: '' })
    setShowDeleteModal(targetUser)
    setActiveActionMenu(null)
  }

  const handleDeleteUser = async (e) => {
    e.preventDefault()
    if (!deleteForm.reason.trim()) {
      toast.error('Please provide a reason for deletion.')
      return
    }
    const toastId = toast.loading('Submitting deletion for approval...')
    try {
      const response = await deleteAppUser(appId, showDeleteModal.id, deleteForm.authoriser_email.trim(), deleteForm.reason.trim())
      toast.dismiss(toastId)
      toast.success(response?.message || 'User deleted successfully.')
      setShowDeleteModal(null)
      loadUsers(usersMeta.currentPage)
      loadPendingActions()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to delete user.'))
    }
  }

  // ── Activate / Deactivate ─────────────────────────────────────────────
  const handleToggleActive = async (targetUser) => {
    setActiveActionMenu(null)
    setBusyId(targetUser.id)
    const toastId = toast.loading(targetUser.is_active ? 'Deactivating user...' : 'Reactivating user...')
    try {
      const response = targetUser.is_active
        ? await deactivateAppUser(appId, targetUser.id)
        : await activateAppUser(appId, targetUser.id)
      toast.dismiss(toastId)
      toast.success(response?.message || 'User status updated.')
      loadUsers(usersMeta.currentPage)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to update user status.'))
    } finally {
      setBusyId(null)
    }
  }

  // ── Reset password ────────────────────────────────────────────────────
  const [resetForm, setResetForm] = useState({ password: '', password_confirmation: '' })
  const [showResetPw, setShowResetPw] = useState(false)

  const openResetModal = (targetUser) => {
    setResetForm({ password: '', password_confirmation: '' })
    setShowResetModal(targetUser)
    setActiveActionMenu(null)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (resetForm.password !== resetForm.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    const toastId = toast.loading('Resetting password...')
    try {
      const response = await resetUserPassword(
        appId,
        showResetModal.email,
        resetForm.password,
        resetForm.password_confirmation,
      )
      toast.dismiss(toastId)
      toast.success(response?.message || 'Password reset successful.')
      setShowResetModal(null)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to reset password.'))
    }
  }

  const handleTriggerForgotPassword = async (targetUser) => {
    setActiveActionMenu(null)
    const toastId = toast.loading(`Sending OTP to ${targetUser.email}...`)
    try {
      const response = await triggerForgotPassword(appId, targetUser.email)
      toast.dismiss(toastId)
      toast.success(response?.message || 'OTP sent to user email.')
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to send OTP.'))
    }
  }

  // ── Pending actions: approve / deny ───────────────────────────────────
  const handleApprove = async (action) => {
    setBusyId(action.id)
    const toastId = toast.loading('Approving action...')
    try {
      const response = await approvePendingAction(appId, action.id)
      toast.dismiss(toastId)
      toast.success(response?.message || 'Action approved successfully.')
      loadPendingActions()
      loadUsers(usersMeta.currentPage)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to approve action.'))
    } finally {
      setBusyId(null)
    }
  }

  const [denyNotes, setDenyNotes] = useState('')

  const openDenyModal = (action) => {
    setDenyNotes('')
    setShowDenyModal(action)
  }

  const handleDeny = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Denying action...')
    try {
      const response = await denyPendingAction(appId, showDenyModal.id, denyNotes.trim())
      toast.dismiss(toastId)
      toast.success(response?.message || 'Action denied successfully.')
      setShowDenyModal(null)
      loadPendingActions()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to deny action.'))
    }
  }

  // ── Roles: create + view single ───────────────────────────────────────
  const handleCreateRole = async (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) {
      toast.error('Role name is required')
      return
    }
    setIsCreatingRole(true)
    const toastId = toast.loading('Creating role...')
    try {
      const response = await createRole(appId, newRoleName.trim())
      toast.dismiss(toastId)
      toast.success(response?.message || 'Role created successfully.')
      setNewRoleName('')
      setShowCreateRoleModal(false)
      loadRoles()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to create role.'))
    } finally {
      setIsCreatingRole(false)
    }
  }

  const handleViewRole = async (role) => {
    setIsLoadingRoleDetail(true)
    setShowRoleDetailModal(role)
    try {
      const response = await fetchRole(role.id)
      setShowRoleDetailModal(response?.data || role)
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load role details.'))
    } finally {
      setIsLoadingRoleDetail(false)
    }
  }

  // ── Groups: create / edit / delete ─────────────────────────────────────
  const openCreateGroupModal = () => {
    setGroupForm({ name: '', description: '' })
    setShowCreateGroupModal(true)
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Creating group...')
    try {
      const response = await createGroup(appId, { name: groupForm.name.trim(), description: groupForm.description.trim() })
      toast.dismiss(toastId)
      toast.success(response?.message || 'Group created successfully.')
      setShowCreateGroupModal(false)
      loadGroups()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to create group.'))
    }
  }

  const openEditGroupModal = (group) => {
    setGroupForm({ name: group.name || '', description: group.description || '' })
    setShowEditGroupModal(group)
    setGroupActionMenu(null)
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Saving group...')
    try {
      const response = await updateGroup(appId, showEditGroupModal.id, {
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
      })
      toast.dismiss(toastId)
      toast.success(response?.message || 'Group updated successfully.')
      setShowEditGroupModal(null)
      loadGroups()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to update group.'))
    }
  }

  const handleDeleteGroup = async () => {
    const target = showDeleteGroupModal
    setShowDeleteGroupModal(null)
    const toastId = toast.loading('Deleting group...')
    try {
      const response = await deleteGroup(appId, target.id)
      toast.dismiss(toastId)
      toast.success(response?.message || 'Group deleted successfully.')
      loadGroups()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to delete group.'))
    }
  }

  // ── Subsidiaries: create / edit / delete ───────────────────────────────
  const openCreateSubsidiaryModal = () => {
    setSubsidiaryForm({ name: '', code: '', description: '' })
    setShowCreateSubsidiaryModal(true)
  }

  const handleCreateSubsidiary = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Creating subsidiary...')
    try {
      const response = await createSubsidiary(appId, {
        name: subsidiaryForm.name.trim(),
        code: subsidiaryForm.code.trim(),
        description: subsidiaryForm.description.trim(),
      })
      toast.dismiss(toastId)
      toast.success(response?.message || 'Subsidiary created successfully.')
      setShowCreateSubsidiaryModal(false)
      loadSubsidiaries()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to create subsidiary.'))
    }
  }

  const openEditSubsidiaryModal = (subsidiary) => {
    setSubsidiaryForm({
      name: subsidiary.name || '',
      code: subsidiary.code || '',
      description: subsidiary.description || '',
    })
    setShowEditSubsidiaryModal(subsidiary)
    setSubsidiaryActionMenu(null)
  }

  const handleUpdateSubsidiary = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Saving subsidiary...')
    try {
      const response = await updateSubsidiary(appId, showEditSubsidiaryModal.id, {
        name: subsidiaryForm.name.trim(),
        code: subsidiaryForm.code.trim(),
        description: subsidiaryForm.description.trim(),
      })
      toast.dismiss(toastId)
      toast.success(response?.message || 'Subsidiary updated successfully.')
      setShowEditSubsidiaryModal(null)
      loadSubsidiaries()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to update subsidiary.'))
    }
  }

  const handleDeleteSubsidiary = async () => {
    const target = showDeleteSubsidiaryModal
    setShowDeleteSubsidiaryModal(null)
    const toastId = toast.loading('Deleting subsidiary...')
    try {
      const response = await deleteSubsidiary(appId, target.id)
      toast.dismiss(toastId)
      toast.success(response?.message || 'Subsidiary deleted successfully.')
      loadSubsidiaries()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to delete subsidiary.'))
    }
  }

  // ── Audit Logs: search, filter, sort, paginate ─────────────────────────
  const activeAuditFilterCount = useMemo(
    () =>
      Object.entries(auditFilters).filter(([key, value]) => {
        if (['sort_by', 'sort_dir', 'per_page', 'search'].includes(key)) return false
        return value !== '' && value !== null && value !== undefined
      }).length,
    [auditFilters],
  )

  const handleAuditSearchSubmit = (e) => {
    e.preventDefault()
    loadAuditLogs(1, auditFilters)
  }

  const openAuditFiltersPanel = () => {
    setAuditFiltersDraft(auditFilters)
    setShowAuditFiltersPanel((prev) => !prev)
  }

  const handleApplyAuditFilters = () => {
    if (auditFiltersDraft.date_from && auditFiltersDraft.date_to) {
      if (new Date(auditFiltersDraft.date_to) < new Date(auditFiltersDraft.date_from)) {
        toast.error('"Date to" must be on or after "Date from".')
        return
      }
    }
    const next = { ...auditFiltersDraft }
    setAuditFilters(next)
    setShowAuditFiltersPanel(false)
    loadAuditLogs(1, next)
  }

  const handleClearAuditFilters = () => {
    setAuditFiltersDraft(DEFAULT_AUDIT_FILTERS)
    setAuditFilters(DEFAULT_AUDIT_FILTERS)
    setShowAuditFiltersPanel(false)
    loadAuditLogs(1, DEFAULT_AUDIT_FILTERS)
  }

  const handleAuditSort = (column) => {
    const nextDir = auditFilters.sort_by === column && auditFilters.sort_dir === 'asc' ? 'desc' : 'asc'
    const next = { ...auditFilters, sort_by: column, sort_dir: nextDir }
    setAuditFilters(next)
    loadAuditLogs(auditMeta.currentPage, next)
  }

  const AuditSortIcon = ({ column }) => {
    if (auditFilters.sort_by !== column) return <ArrowUpDown size={12} className="text-slate-300" />
    return auditFilters.sort_dir === 'asc' ? (
      <ArrowUp size={12} className="text-[#1b2b65]" />
    ) : (
      <ArrowDown size={12} className="text-[#1b2b65]" />
    )
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const appName = app?.app_name || `Application #${appId}`
  const appCode = app ? deriveAppCode(app.app_name) : '—'

  return (
    <div className="min-h-screen bg-[#111f44] p-3 sm:p-5 lg:p-7 font-sans text-slate-800">
      <div className="navy-texture relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1540px] flex-col overflow-hidden rounded-[32px] border border-white/10 p-4 shadow-2xl sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex shrink-0 flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <FmdqLogo className="shadow-md" />
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5">
            <span className="rounded-full bg-[#dbe4f9] px-3 py-0.5 text-[11px] font-bold tracking-wider text-[#1c2c65] uppercase shadow-xs">
              App Admin
            </span>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-md">
              <span className="text-xs sm:text-sm font-bold text-[#1b2b65]">{appName}</span>
              <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">
                {appCode}
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 text-white transition hover:bg-white/20 focus:outline-none"
            >
              <ChevronDown size={16} className="text-white/80 transition-transform group-hover:translate-y-0.5" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">Admin</span>
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40 bg-slate-200">
                <User size={18} className="absolute inset-0 m-auto text-slate-600" />
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-12 z-50 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-xs font-bold text-slate-800">System Administrator</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@fmdqgroup.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LayoutGrid size={14} /> SSO Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main White Card */}
        <main className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-xl sm:p-7">
          {/* Breadcrumb */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1 underline-offset-2 transition-colors hover:text-navy-900 hover:underline"
              >
                <ArrowLeft size={14} /> Dashboard
              </button>
              <span>&gt;</span>
              <span className="font-semibold text-slate-800">{appName}</span>
            </nav>

            {activeTab === 'users' && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-transform hover:bg-[#13204e] active:scale-95"
              >
                <span>Create New User</span>
                <Plus size={16} />
              </button>
            )}
            {activeTab === 'roles' && (
              <button
                type="button"
                onClick={() => {
                  setNewRoleName('')
                  setShowCreateRoleModal(true)
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-transform hover:bg-[#13204e] active:scale-95"
              >
                <span>Create Role</span>
                <Plus size={16} />
              </button>
            )}
            {activeTab === 'groups' && (
              <button
                type="button"
                onClick={openCreateGroupModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-transform hover:bg-[#13204e] active:scale-95"
              >
                <span>Create Group</span>
                <Plus size={16} />
              </button>
            )}
            {activeTab === 'subsidiaries' && (
              <button
                type="button"
                onClick={openCreateSubsidiaryModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-transform hover:bg-[#13204e] active:scale-95"
              >
                <span>Create Subsidiary</span>
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Tab Pills */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 p-1">
              {TABS.map((tab) => {
                if (tab.key === 'transactions' && (transactionsStatus !== 'success' || transactions.length === 0)) {
                  return null
                }
                if (tab.key === 'otpLogs' && (otpLogsStatus !== 'success' || otpLogs.length === 0)) {
                  return null
                }
                const Icon = tab.icon
                const count = tab.key === 'pending' ? pendingCount : null
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-[#1b2b65] shadow-xs' : 'text-slate-500 hover:text-navy-900'
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {count > 0 && (
                      <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {activeTab === 'users' && (
              <TableToolbar
                search={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search users..."
                onRefresh={() => loadUsers(usersMeta.currentPage)}
                onExport={() =>
                  exportToCsv(
                    `${appName}-users.csv`,
                    ['Name', 'Email', 'Role', 'Group', 'Subsidiary', 'Division', 'Status', 'Last Activity'],
                    filteredUsers.map((u) => [
                      `${u.firstname} ${u.lastname}`,
                      u.email,
                      getUserRoleName(u),
                      u.group || '',
                      u.subsidiary || '',
                      u.division || '',
                      u.is_active ? 'Active' : 'Inactive',
                      u.app_last_activity_at ? formatDate(u.app_last_activity_at) : 'Never',
                    ]),
                  )
                }
                exportDisabled={filteredUsers.length === 0}
              />
            )}
            {activeTab === 'pending' && (
              <TableToolbar
                search={pendingSearchTerm}
                onSearchChange={setPendingSearchTerm}
                placeholder="Search pending actions..."
                onRefresh={loadPendingActions}
                onExport={() =>
                  exportToCsv(
                    `${appName}-pending-actions.csv`,
                    ['Type', 'User', 'Email', 'Requested By', 'Requested At', 'Status', 'Notes'],
                    filteredPendingActions.map((a) => [
                      a.action,
                      a.user ? `${a.user.firstname} ${a.user.lastname}` : `User #${a.user_id}`,
                      a.user?.email || '',
                      a.requested_by ? `${a.requested_by.firstname} ${a.requested_by.lastname}` : '',
                      formatDate(a.requested_at),
                      a.status,
                      a.review_notes || '',
                    ]),
                  )
                }
                exportDisabled={filteredPendingActions.length === 0}
              />
            )}
            {activeTab === 'roles' && (
              <TableToolbar
                search={rolesSearchTerm}
                onSearchChange={setRolesSearchTerm}
                placeholder="Search roles..."
                onRefresh={loadRoles}
                onExport={() =>
                  exportToCsv(
                    `${appName}-roles.csv`,
                    ['Role ID', 'Name', 'Created'],
                    filteredRoles.map((r) => [r.id, r.name, formatDate(r.created_at)]),
                  )
                }
                exportDisabled={filteredRoles.length === 0}
              />
            )}
            {activeTab === 'groups' && (
              <TableToolbar
                search={groupsSearchTerm}
                onSearchChange={setGroupsSearchTerm}
                placeholder="Search groups..."
                onRefresh={loadGroups}
                onExport={() =>
                  exportToCsv(
                    `${appName}-groups.csv`,
                    ['Name', 'Description'],
                    filteredGroups.map((g) => [g.name, g.description || '']),
                  )
                }
                exportDisabled={filteredGroups.length === 0}
              />
            )}
            {activeTab === 'subsidiaries' && (
              <TableToolbar
                search={subsidiariesSearchTerm}
                onSearchChange={setSubsidiariesSearchTerm}
                placeholder="Search subsidiaries..."
                onRefresh={loadSubsidiaries}
                onExport={() =>
                  exportToCsv(
                    `${appName}-subsidiaries.csv`,
                    ['Name', 'Code', 'Description'],
                    filteredSubsidiaries.map((s) => [s.name, s.code || '', s.description || '']),
                  )
                }
                exportDisabled={filteredSubsidiaries.length === 0}
              />
            )}
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[820px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Email &amp; Role</th>
                      <th className="px-3 py-2.5">Group / Subsidiary / Division</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Last Activity</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersStatus === 'loading' &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div
                                className="h-3.5 animate-pulse rounded bg-slate-100"
                                style={{ width: `${50 + ((c * 13) % 40)}%` }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {usersStatus === 'success' && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          {searchTerm ? 'No users match your search.' : 'No users found for this application yet.'}
                        </td>
                      </tr>
                    )}

                    {usersStatus === 'success' &&
                      filteredUsers.map((u, idx) => (
                        <tr key={u.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">
                            {(usersMeta.currentPage - 1) * (usersMeta.perPage || TABLE_PAGE_SIZE) + idx + 1}
                          </td>
                          <td className="max-w-[180px] px-3 py-2.5">
                            <p className="truncate font-bold text-slate-800">
                              {u.firstname} {u.lastname}
                            </p>
                            {Boolean(u.must_change_password) && (
                              <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Must change password
                              </span>
                            )}
                          </td>
                          <td className="max-w-[220px] px-3 py-2.5">
                            <p className="truncate font-medium text-slate-700">{u.email}</p>
                            <span className="mt-0.5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {getUserRoleName(u)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            {[u.group, u.subsidiary, u.division].filter(Boolean).join(' / ') || '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusPill active={Boolean(u.is_active)} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">
                            {u.app_last_activity_at ? formatDate(u.app_last_activity_at) : 'Never'}
                          </td>
                          <td className="relative whitespace-nowrap px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveActionMenu((prev) => (prev === u.id ? null : u.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              {busyId === u.id ? <Loader2 size={14} className="animate-spin" /> : <MoreHorizontal size={14} />}
                            </button>

                            {activeActionMenu === u.id && (
                              <div className="animate-in fade-in absolute right-3 top-10 z-30 w-52 rounded-xl bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(u)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit User
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(u)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 ${u.is_active ? 'text-amber-700' : 'text-emerald-700'
                                    }`}
                                >
                                  {u.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                  {u.is_active ? 'Deactivate User' : 'Reactivate User'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openResetModal(u)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                                >
                                  <KeyRound size={14} /> Reset Password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTriggerForgotPassword(u)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                                >
                                  <Mail size={14} /> Send OTP Email
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(u)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete User
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={usersMeta.currentPage}
                lastPage={usersMeta.lastPage}
                total={usersMeta.total}
                itemLabel="user"
                onPageChange={loadUsers}
              />
            </div>
          )}

          {/* Pending Actions Tab */}
          {activeTab === 'pending' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">User</th>
                      <th className="px-3 py-2.5">Requested By</th>
                      <th className="px-3 py-2.5">Requested At</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingStatus === 'loading' &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4, 5, 6].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div
                                className="h-3.5 animate-pulse rounded bg-slate-100"
                                style={{ width: `${50 + ((c * 13) % 40)}%` }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {pendingStatus === 'success' && filteredPendingActions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          {pendingSearchTerm ? 'No pending actions match your search.' : 'No pending actions for this application.'}
                        </td>
                      </tr>
                    )}

                    {pendingStatus === 'success' &&
                      pagedPendingActions.map((action) => (
                        <tr key={action.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5">
                            <ActionTypeBadge action={action.action} />
                          </td>
                          <td className="max-w-[200px] whitespace-nowrap px-3 py-2.5">
                            <p className="truncate font-bold text-slate-800">
                              {action.user ? `${action.user.firstname} ${action.user.lastname}` : `User #${action.user_id}`}
                            </p>
                            <p className="truncate text-[10px] font-normal text-slate-500">{action.user?.email}</p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                            {action.requested_by
                              ? `${action.requested_by.firstname} ${action.requested_by.lastname}`
                              : '—'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">{formatDate(action.requested_at)}</td>
                          <td className="px-3 py-2.5">
                            {action.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                                <Clock size={11} /> Pending
                              </span>
                            ) : action.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 whitespace-nowrap">
                                <XCircle size={11} /> Denied
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">
                            {action.status === 'pending' ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={busyId === action.id}
                                  onClick={() => handleApprove(action)}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {busyId === action.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDenyModal(action)}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-600 shadow-2xs transition hover:bg-red-50"
                                >
                                  <XCircle size={12} /> Deny
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">{action.review_notes || '—'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={pendingPage}
                lastPage={pendingLastPage}
                total={filteredPendingActions.length}
                itemLabel="pending action"
                onPageChange={setPendingPage}
              />
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">Role ID</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Created</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rolesStatus === 'loading' &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {rolesStatus === 'success' && filteredRoles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          {rolesSearchTerm ? 'No roles match your search.' : 'No roles configured for this application yet.'}
                        </td>
                      </tr>
                    )}

                    {rolesStatus === 'success' &&
                      pagedRoles.map((role) => (
                        <tr key={role.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-mono text-slate-500">{role.id}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <ShieldCheck size={12} />
                              </span>
                              {role.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">{formatDate(role.created_at)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewRole(role)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              <Info size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={rolesPage}
                lastPage={rolesLastPage}
                total={filteredRoles.length}
                itemLabel="role"
                onPageChange={setRolesPage}
              />
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupsStatus === 'loading' &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {groupsStatus === 'success' && filteredGroups.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          {groupsSearchTerm ? 'No groups match your search.' : 'No groups configured for this application yet.'}
                        </td>
                      </tr>
                    )}

                    {groupsStatus === 'success' &&
                      pagedGroups.map((group, idx) => (
                        <tr key={group.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">
                            {(groupsPage - 1) * TABLE_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <FolderKanban size={12} />
                              </span>
                              {group.name}
                            </span>
                          </td>
                          <td className="max-w-[320px] truncate px-3 py-2.5 text-slate-500">{group.description || '—'}</td>
                          <td className="relative px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setGroupActionMenu((prev) => (prev === group.id ? null : group.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              <MoreHorizontal size={14} />
                            </button>

                            {groupActionMenu === group.id && (
                              <div className="animate-in fade-in absolute right-3 top-10 z-30 w-44 rounded-xl bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => openEditGroupModal(group)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit Group
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGroupActionMenu(null)
                                    setShowDeleteGroupModal(group)
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete Group
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={groupsPage}
                lastPage={groupsLastPage}
                total={filteredGroups.length}
                itemLabel="group"
                onPageChange={setGroupsPage}
              />
            </div>
          )}

          {/* Subsidiaries Tab */}
          {activeTab === 'subsidiaries' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subsidiariesStatus === 'loading' &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4, 5].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {subsidiariesStatus === 'success' && filteredSubsidiaries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          {subsidiariesSearchTerm
                            ? 'No subsidiaries match your search.'
                            : 'No subsidiaries configured for this application yet.'}
                        </td>
                      </tr>
                    )}

                    {subsidiariesStatus === 'success' &&
                      pagedSubsidiaries.map((sub, idx) => (
                        <tr key={sub.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">
                            {(subsidiariesPage - 1) * TABLE_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <Building2 size={12} />
                              </span>
                              {sub.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-slate-500">{sub.code || '—'}</td>
                          <td className="max-w-[280px] truncate px-3 py-2.5 text-slate-500">{sub.description || '—'}</td>
                          <td className="relative px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSubsidiaryActionMenu((prev) => (prev === sub.id ? null : sub.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              <MoreHorizontal size={14} />
                            </button>

                            {subsidiaryActionMenu === sub.id && (
                              <div className="animate-in fade-in absolute right-3 top-10 z-30 w-48 rounded-xl bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => openEditSubsidiaryModal(sub)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit Subsidiary
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubsidiaryActionMenu(null)
                                    setShowDeleteSubsidiaryModal(sub)
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete Subsidiary
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={subsidiariesPage}
                lastPage={subsidiariesLastPage}
                total={filteredSubsidiaries.length}
                itemLabel="subsidiary"
                onPageChange={setSubsidiariesPage}
              />
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Filter bar */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <form onSubmit={handleAuditSearchSubmit} className="relative flex-1">
                  <input
                    type="text"
                    value={auditFilters.search}
                    onChange={(e) => setAuditFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search ID, email, action, description, IP, details..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <Search size={14} />
                  </button>
                </form>

                <div className="relative">
                  <button
                    type="button"
                    onClick={openAuditFiltersPanel}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    <SlidersHorizontal size={14} />
                    Filters
                    {activeAuditFilterCount > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1b2b65] px-1 text-[10px] font-bold text-white">
                        {activeAuditFilterCount}
                      </span>
                    )}
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>

                  {showAuditFiltersPanel && (
                    <div className="animate-in fade-in absolute right-0 top-11 z-40 w-[calc(100vw-2.5rem)] max-w-[460px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Advanced Filters
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>ID (exact)</label>
                          <input
                            type="number"
                            value={auditFiltersDraft.id}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, id: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Email</label>
                          <input
                            type="text"
                            value={auditFiltersDraft.email}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, email: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Action</label>
                          <input
                            type="text"
                            value={auditFiltersDraft.action}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, action: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>IP Address</label>
                          <input
                            type="text"
                            value={auditFiltersDraft.ip_address}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, ip_address: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Description</label>
                          <input
                            type="text"
                            value={auditFiltersDraft.description}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, description: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Details</label>
                          <input
                            type="text"
                            value={auditFiltersDraft.details}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, details: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Date from</label>
                          <input
                            type="date"
                            value={auditFiltersDraft.date_from}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, date_from: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Date to</label>
                          <input
                            type="date"
                            value={auditFiltersDraft.date_to}
                            onChange={(e) => setAuditFiltersDraft((f) => ({ ...f, date_to: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={handleClearAuditFilters}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                          <RotateCcw size={13} /> Clear all
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAuditFiltersPanel(false)}
                            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyAuditFilters}
                            className="rounded-full bg-[#1b2b65] px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => loadAuditLogs(auditMeta.currentPage, auditFilters)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:py-2"
                >
                  <RefreshCcw size={13} /> Refresh
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportToCsv(
                      `${appName}-audit-logs.csv`,
                      ['ID', 'Date', 'Email', 'Action', 'Description', 'IP Address', 'Details'],
                      auditLogs.map((log) => [
                        log.id,
                        formatDateTime(log.created_at),
                        log.email || '',
                        log.action || '',
                        log.description || '',
                        log.ip_address || '',
                        log.details ? JSON.stringify(log.details) : '',
                      ]),
                    )
                  }
                  disabled={auditLogs.length === 0}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1b2b65] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#13204e] disabled:opacity-50 sm:py-2"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>

              {/* Table */}
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[920px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">
                        <button type="button" onClick={() => handleAuditSort('id')} className="inline-flex items-center gap-1 hover:text-[#1b2b65]">
                          ID <AuditSortIcon column="id" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">
                        <button type="button" onClick={() => handleAuditSort('created_at')} className="inline-flex items-center gap-1 hover:text-[#1b2b65]">
                          Date <AuditSortIcon column="created_at" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">
                        <button type="button" onClick={() => handleAuditSort('email')} className="inline-flex items-center gap-1 hover:text-[#1b2b65]">
                          Email <AuditSortIcon column="email" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">
                        <button type="button" onClick={() => handleAuditSort('action')} className="inline-flex items-center gap-1 hover:text-[#1b2b65]">
                          Action <AuditSortIcon column="action" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5">
                        <button type="button" onClick={() => handleAuditSort('ip_address')} className="inline-flex items-center gap-1 hover:text-[#1b2b65]">
                          IP Address <AuditSortIcon column="ip_address" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditStatus === 'loading' &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {auditStatus === 'error' && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Unable to load audit logs.{' '}
                          <button
                            type="button"
                            onClick={() => loadAuditLogs(auditMeta.currentPage)}
                            className="font-semibold text-[#1b2b65] underline underline-offset-2"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    )}

                    {auditStatus === 'success' && auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No audit log entries match your filters.
                        </td>
                      </tr>
                    )}

                    {auditStatus === 'success' &&
                      auditLogs.map((log) => (
                        <tr key={log.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-mono text-slate-500">{log.id}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">{formatDateTime(log.created_at)}</td>
                          <td className="max-w-[200px] truncate px-3 py-2.5 font-medium text-slate-700">{log.email || '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-[#1b2b65] whitespace-nowrap">
                              {log.action || '—'}
                            </span>
                          </td>
                          <td className="max-w-[240px] truncate px-3 py-2.5 text-slate-500" title={log.description || ''}>
                            {log.description || '—'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-slate-500">{log.ip_address || '—'}</td>
                          <td className="px-3 py-2.5">
                            {log.details ? (
                              <button
                                type="button"
                                onClick={() => setShowAuditDetailModal(log)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                              >
                                <Info size={12} /> View
                              </button>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={auditMeta.currentPage}
                lastPage={auditMeta.lastPage}
                total={auditMeta.total}
                itemLabel="log"
                onPageChange={(p) => loadAuditLogs(p, auditFilters)}
              />
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="no-scrollbar flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Reference</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Date Initiated</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Customer Email</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Customer Name</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Amount</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactionsStatus === 'loading' &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-4 py-3.5">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))}

                    {transactionsStatus === 'error' && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center font-medium text-slate-500">
                          Unable to load transactions.{' '}
                          <button
                            type="button"
                            onClick={() => loadTransactions(transactionsMeta.currentPage)}
                            className="font-semibold text-[#1b2b65] underline underline-offset-2"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    )}

                    {transactionsStatus === 'success' && transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center font-medium text-slate-500">
                          No transactions found for this application yet.
                        </td>
                      </tr>
                    )}

                    {transactionsStatus === 'success' &&
                      transactions.map((txn) => (
                        <tr key={txn.id || txn.reference} className="transition-colors hover:bg-slate-50/80">
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-slate-700">
                            {txn.reference}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                            {txn.created_at ? formatDate(txn.created_at) : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">
                            {txn.customer_email || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                            {[txn.customer_first_name, txn.customer_last_name].filter(Boolean).join(' ') || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                            {formatCurrency(txn.amount, txn.currency)}
                          </td>
                          <td className="px-4 py-3.5">
                            <TransactionStatusBadge status={txn.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {transactionsMeta.lastPage > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>
                    {transactionsMeta.total} transaction{transactionsMeta.total === 1 ? '' : 's'} total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={transactionsMeta.currentPage <= 1}
                      onClick={() => loadTransactions(transactionsMeta.currentPage - 1)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="font-semibold text-slate-700">
                      {transactionsMeta.currentPage} / {transactionsMeta.lastPage}
                    </span>
                    <button
                      type="button"
                      disabled={transactionsMeta.currentPage >= transactionsMeta.lastPage}
                      onClick={() => loadTransactions(transactionsMeta.currentPage + 1)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OTP Logs Tab */}
          {activeTab === 'otpLogs' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="no-scrollbar flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">ID</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Date Generated</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Username / Email</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">OTP Value</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">IP Address</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Type</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {otpLogsStatus === 'loading' &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={7} className="px-4 py-3.5">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))}

                    {otpLogsStatus === 'error' && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center font-medium text-slate-500">
                          Unable to load OTP logs.{' '}
                          <button
                            type="button"
                            onClick={() => loadOtpLogs(otpLogsMeta.currentPage)}
                            className="font-semibold text-[#1b2b65] underline underline-offset-2"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    )}

                    {otpLogsStatus === 'success' && otpLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center font-medium text-slate-500">
                          No OTP logs found for this application yet.
                        </td>
                      </tr>
                    )}

                    {otpLogsStatus === 'success' &&
                      otpLogs.map((log) => (
                        <tr key={log.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-4 py-3.5 font-mono text-slate-500">
                            {log.id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                            {log.created_at ? formatDate(log.created_at) : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">
                            {log.username || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-500 select-all tracking-widest font-semibold">
                            {log.OTP || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-500">
                            {log.IP || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <LogTypeBadge type={log.log_type} />
                          </td>
                          <td className="px-4 py-3.5">
                            <OtpStatusBadge status={log.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {otpLogsMeta.lastPage > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>
                    {otpLogsMeta.total} log{otpLogsMeta.total === 1 ? '' : 's'} total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={otpLogsMeta.currentPage <= 1}
                      onClick={() => loadOtpLogs(otpLogsMeta.currentPage - 1)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="font-semibold text-slate-700">
                      {otpLogsMeta.currentPage} / {otpLogsMeta.lastPage}
                    </span>
                    <button
                      type="button"
                      disabled={otpLogsMeta.currentPage >= otpLogsMeta.lastPage}
                      onClick={() => loadOtpLogs(otpLogsMeta.currentPage + 1)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Create New User — {appName}</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.firstname}
                    onChange={(e) => setCreateForm((f) => ({ ...f, firstname: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.lastname}
                    onChange={(e) => setCreateForm((f) => ({ ...f, lastname: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Role *</label>
                  <select
                    required
                    value={createForm.role_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, role_id: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      {rolesStatus === 'loading' ? 'Loading roles…' : 'Select a role'}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Group</label>
                  <input
                    type="text"
                    placeholder="e.g. BIG"
                    value={createForm.group}
                    onChange={(e) => setCreateForm((f) => ({ ...f, group: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Subsidiary</label>
                  <input
                    type="text"
                    placeholder="e.g. iQx"
                    value={createForm.subsidiary}
                    onChange={(e) => setCreateForm((f) => ({ ...f, subsidiary: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Division</label>
                  <input
                    type="text"
                    placeholder="e.g. ADG"
                    value={createForm.division}
                    onChange={(e) => setCreateForm((f) => ({ ...f, division: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Authoriser *</label>
                  <AuthoriserSelect
                    value={createForm.authoriser_email}
                    onChange={(value) => setCreateForm((f) => ({ ...f, authoriser_email: value }))}
                    users={users}
                    className={inputClass}
                  />
                </div>
              </div>

              <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] font-medium text-amber-700">
                New users are created in a pending state and require approval from the Pending Actions tab.
              </p>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Edit {getUserFullName(showEditModal)}</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstname}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstname: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastname}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastname: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Role *</label>
                  <select
                    required
                    value={editForm.role_id}
                    onChange={(e) => setEditForm((f) => ({ ...f, role_id: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      {rolesStatus === 'loading' ? 'Loading roles…' : 'Select a role'}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Group</label>
                  <input
                    type="text"
                    placeholder="e.g. BIG"
                    value={editForm.group}
                    onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Subsidiary</label>
                  <input
                    type="text"
                    placeholder="e.g. iQx"
                    value={editForm.subsidiary}
                    onChange={(e) => setEditForm((f) => ({ ...f, subsidiary: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Division</label>
                  <input
                    type="text"
                    placeholder="e.g. ADG"
                    value={editForm.division}
                    onChange={(e) => setEditForm((f) => ({ ...f, division: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Authoriser *</label>
                  <AuthoriserSelect
                    value={editForm.authoriser_email}
                    onChange={(value) => setEditForm((f) => ({ ...f, authoriser_email: value }))}
                    users={users}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b2b65]">Delete {getUserFullName(showDeleteModal)}</h3>
                <p className="text-xs text-slate-500">{showDeleteModal.email}</p>
              </div>
            </div>

            <form onSubmit={handleDeleteUser} className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-600">
                This will submit a deletion request for approval. Select the authoriser and provide a reason to proceed.
              </p>
              <div>
                <label className={labelClass}>Authoriser *</label>
                <AuthoriserSelect
                  value={deleteForm.authoriser_email}
                  onChange={(value) => setDeleteForm((f) => ({ ...f, authoriser_email: value }))}
                  users={users}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Reason for deletion *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this user is being deleted..."
                  value={deleteForm.reason}
                  onChange={(e) => setDeleteForm((f) => ({ ...f, reason: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-red-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deny Pending Action Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Deny Pending Action</h3>
              <button
                type="button"
                onClick={() => setShowDenyModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeny} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Reason (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this request is being denied..."
                  value={denyNotes}
                  onChange={(e) => setDenyNotes(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDenyModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-red-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700"
                >
                  Deny Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Reset Password — {showResetModal.email}</h3>
              <button
                type="button"
                onClick={() => setShowResetModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>New password *</label>
                <div className="relative">
                  <input
                    type={showResetPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={resetForm.password}
                    onChange={(e) => setResetForm((f) => ({ ...f, password: e.target.value }))}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm password *</label>
                <input
                  type={showResetPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={resetForm.password_confirmation}
                  onChange={(e) => setResetForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Create Role — {appName}</h3>
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Role name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authoriser"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRole}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e] disabled:opacity-50"
                >
                  {isCreatingRole && <Loader2 size={14} className="animate-spin" />}
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Role Detail Modal */}
      {showRoleDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Role Details</h3>
              <button
                type="button"
                onClick={() => setShowRoleDetailModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingRoleDetail ? (
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Role ID</span>
                  <span className="font-mono font-bold text-slate-800">{showRoleDetailModal.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Name</span>
                  <span className="font-bold text-[#1b2b65]">{showRoleDetailModal.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Application ID</span>
                  <span className="text-right">
                    <span className="font-mono text-slate-800">{showRoleDetailModal.app_id ?? appId}</span>
                    <span className="ml-1.5 text-slate-500">({appName})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-800">{formatDate(showRoleDetailModal.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-800">{formatDate(showRoleDetailModal.updated_at)}</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRoleDetailModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Create Group — {appName}</h3>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate Banking"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Group handling corporate clients and large transactions"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Edit {showEditGroupModal.name}</h3>
              <button
                type="button"
                onClick={() => setShowEditGroupModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditGroupModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Confirm Modal */}
      {showDeleteGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b2b65]">Delete Group</h3>
                <p className="text-xs text-slate-500">{showDeleteGroupModal.name}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              This will fail if there are still users assigned to this group. This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteGroupModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                className="rounded-full bg-red-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subsidiary Modal */}
      {showCreateSubsidiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Create Subsidiary — {appName}</h3>
              <button
                type="button"
                onClick={() => setShowCreateSubsidiaryModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubsidiary} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FMDQ Securities Limited"
                  value={subsidiaryForm.name}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FMDQ-SEC"
                  value={subsidiaryForm.code}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, code: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Brokerage and dealing subsidiary"
                  value={subsidiaryForm.description}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateSubsidiaryModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Create Subsidiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subsidiary Modal */}
      {showEditSubsidiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1b2b65]">Edit {showEditSubsidiaryModal.name}</h3>
              <button
                type="button"
                onClick={() => setShowEditSubsidiaryModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubsidiary} className="mt-4 space-y-3.5">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  required
                  value={subsidiaryForm.name}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Code *</label>
                <input
                  type="text"
                  required
                  value={subsidiaryForm.code}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, code: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={subsidiaryForm.description}
                  onChange={(e) => setSubsidiaryForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditSubsidiaryModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subsidiary Confirm Modal */}
      {showDeleteSubsidiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b2b65]">Delete Subsidiary</h3>
                <p className="text-xs text-slate-500">{showDeleteSubsidiaryModal.name}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600">This action cannot be undone.</p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteSubsidiaryModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubsidiary}
                className="rounded-full bg-red-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700"
              >
                Delete Subsidiary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Detail Modal */}
      {showAuditDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1b2b65]">Audit Log #{showAuditDetailModal.id}</h3>
                <p className="text-xs text-slate-500">{formatDateTime(showAuditDetailModal.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditDetailModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{showAuditDetailModal.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Action</span>
                <span className="font-bold text-[#1b2b65]">{showAuditDetailModal.action || '—'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">IP Address</span>
                <span className="font-mono text-slate-800">{showAuditDetailModal.ip_address || '—'}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-500">Description</span>
                <p className="mt-1 text-slate-800">{showAuditDetailModal.description || '—'}</p>
              </div>
              <div>
                <span className="text-slate-500">Details</span>
                <pre className="mt-1.5 max-h-64 overflow-auto rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] text-slate-100">
                  {JSON.stringify(showAuditDetailModal.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditDetailModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
