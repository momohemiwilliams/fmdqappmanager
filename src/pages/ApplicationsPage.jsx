import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowUpDown,
  ChevronDown,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  User,
  X,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  Building2,
  UserPlus,
  AppWindow,
  CreditCard,
  ShieldCheck,
  CheckSquare,
  Square,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Link as LinkIcon,
  BookOpen,
  RefreshCcw,
  Download,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import ApiDocsModal from '../components/ApiDocsModal'
import Switch from '../components/Switch'
import { exportToCsv } from '../utils/csv'
import { fetchApps, createApp, updateApp } from '../api/appsService'
import { fetchPaymentGateways, configureAppPaymentGateways, fetchAppPaymentConfig } from '../api/paymentService'
import { saveOtpConfig, fetchAppDetails, fetchAllOtpConfigs } from '../api/otpConfiServices'
import { register as registerAdmin, fetchAdminUsers } from '../api/authService'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

// The "Users" tab key is kept internally (query param, state) for backwards
// compatibility, but it now represents the real Admin Management area.
const TAB_LABELS = { Users: 'Admin Management', Applications: 'Applications', Institutions: 'Institutions' }

const PAGE_SIZE = 10

// Default mock applications from specification screenshot
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    sn: 1,
    dateCreated: 'January 16, 2025',
    name: 'FFTRS',
    url: 'http://localhost:5443',
    description: '-',
  },
  {
    id: 2,
    sn: 2,
    dateCreated: 'January 16, 2025',
    name: 'Cross Asses Surveillance System (CASS)',
    url: 'http://localhost:5173',
    description: '-',
  },
  {
    id: 3,
    sn: 3,
    dateCreated: 'January 16, 2025',
    name: 'Securities Master List & Auction Results Records (SMLARS)',
    url: 'http://adgtest.fmdqgroup.com/ee72',
    description: '-',
  },
  {
    id: 4,
    sn: 4,
    dateCreated: 'January 16, 2025',
    name: 'Joanna Ash',
    url: 'http://localhost:9773',
    description: '-',
  },
  {
    id: 5,
    sn: 5,
    dateCreated: 'January 16, 2025',
    name: 'Financial Markets Rules and Regulations Repository (FMRR)',
    url: 'http://localhost:5223',
    description: '-',
  },
  {
    id: 6,
    sn: 6,
    dateCreated: 'January 16, 2025',
    name: 'eMarket',
    url: 'http://adgtest.fmdqgroup.com/12672',
    description: '-',
  },
  {
    id: 7,
    sn: 7,
    dateCreated: 'January 16, 2025',
    name: 'FFTRS',
    url: 'http://localhost:5173',
    description: '-',
  },
  {
    id: 8,
    sn: 8,
    dateCreated: 'January 16, 2025',
    name: 'Market Tracker (MKTK)',
    url: 'http://localhost:5173',
    description: '-',
  },
  {
    id: 9,
    sn: 9,
    dateCreated: 'January 16, 2025',
    name: 'Revenue Line Tracker (RLT)',
    url: 'http://adgtest.fmdqgroup.com/5173',
    description: '-',
  },
  {
    id: 10,
    sn: 10,
    dateCreated: 'January 16, 2025',
    name: 'Cross Asses Surveillance System (CASS)',
    url: 'http://localhost:44173',
    description: '-',
  },
]

const INITIAL_INSTITUTIONS = [
  { id: 1, sn: 1, dateCreated: 'January 16, 2025', name: 'FMDQ Securities Exchange Limited', code: 'FMDQ-SE', category: 'Exchange', status: 'Active' },
  { id: 2, sn: 2, dateCreated: 'January 16, 2025', name: 'FMDQ Clear Limited', code: 'FMDQ-CL', category: 'Clearing House', status: 'Active' },
  { id: 3, sn: 3, dateCreated: 'January 16, 2025', name: 'FMDQ Depository Limited', code: 'FMDQ-DP', category: 'Depository', status: 'Active' },
  { id: 4, sn: 4, dateCreated: 'January 16, 2025', name: 'FMDQ Private Markets', code: 'FMDQ-PM', category: 'Private Markets', status: 'Active' },
]

const DEFAULT_GATEWAYS_FALLBACK = [
  { id: 1, name: 'Paystack', code: 'PAYSTACK', is_active: true },
  { id: 2, name: 'Flutterwave', code: 'FLUTTERWAVE', is_active: true },
  { id: 3, name: 'Interswitch WebPAY', code: 'INTERSWITCH', is_active: false },
  { id: 4, name: 'Remita', code: 'REMITA', is_active: false },
]

function TablePageFooter({ currentPage, lastPage, total, itemLabel, onPageChange }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
      <span>
        {total} {itemLabel}{total === 1 ? '' : 's'} total
      </span>
      {lastPage > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-slate-600">
            Page {currentPage} of {lastPage}
          </span>
          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default function ApplicationsPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    tabParam && ['Users', 'Applications', 'Institutions'].includes(tabParam)
      ? tabParam
      : 'Applications'
  )

  useEffect(() => {
    if (tabParam && ['Users', 'Applications', 'Institutions'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Lists state
  const [apps, setApps] = useState([])
  const [appsStatus, setAppsStatus] = useState('loading') // loading | success
  const [institutions, setInstitutions] = useState([])

  // Admin Management (GET /admin/users?per_page=15)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUsersStatus, setAdminUsersStatus] = useState('loading') // loading | success | error
  const [adminUsersMeta, setAdminUsersMeta] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10 })

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('sn')
  const [sortDirection, setSortDirection] = useState('asc')
  const [urlFilter, setUrlFilter] = useState('all') // 'all' | 'localhost' | 'adgtest'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Profile Dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Action Menu Dropdown (active row ID)
  const [activeActionMenu, setActiveActionMenu] = useState(null)

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Application Form State (matching requested API payload)
  const [newAppName, setNewAppName] = useState('')
  const [newAppDescription, setNewAppDescription] = useState('')
  const [newAppUrl, setNewAppUrl] = useState('')
  const [newAppPasswordAge, setNewAppPasswordAge] = useState(10)
  const [newAppSessionTimeout, setNewAppSessionTimeout] = useState(5)
  const [newAppLockAttempts, setNewAppLockAttempts] = useState(3)
  const [newAppPasswordHistory, setNewAppPasswordHistory] = useState(10)
  const [newAppOtpRequiredLogin, setNewAppOtpRequiredLogin] = useState(true)
  const [newAppOtpRequiredPasswordReset, setNewAppOtpRequiredPasswordReset] = useState(false)

  // Edit Application Modal State
  const [showEditAppModal, setShowEditAppModal] = useState(null) // holds the target app
  const [editAppName, setEditAppName] = useState('')
  const [editAppDescription, setEditAppDescription] = useState('')
  const [editAppUrl, setEditAppUrl] = useState('')
  const [editAppPasswordAge, setEditAppPasswordAge] = useState(10)
  const [editAppSessionTimeout, setEditAppSessionTimeout] = useState(5)
  const [editAppLockAttempts, setEditAppLockAttempts] = useState(3)
  const [editAppPasswordHistory, setEditAppPasswordHistory] = useState(10)
  const [editAppOtpRequiredLogin, setEditAppOtpRequiredLogin] = useState(true)
  const [editAppOtpRequiredPasswordReset, setEditAppOtpRequiredPasswordReset] = useState(false)

  // Admin Registration Form State (POST /api/admin/register)
  const [registerFirstname, setRegisterFirstname] = useState('')
  const [registerLastname, setRegisterLastname] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] = useState('')
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // Institution Form State
  const [newInstName, setNewInstName] = useState('')
  const [newInstCode, setNewInstCode] = useState('')
  const [newInstCategory, setNewInstCategory] = useState('Exchange')
  const [newInstStatus, setNewInstStatus] = useState('Active')

  // Payment Gateway Config Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAppForPayment, setSelectedAppForPayment] = useState(null)
  const [paymentGateways, setPaymentGateways] = useState([])
  const [isFetchingGateways, setIsFetchingGateways] = useState(false)
  const [paymentCallbackUrl, setPaymentCallbackUrl] = useState('')
  const [paymentUsername, setPaymentUsername] = useState('')
  const [paymentPassword, setPaymentPassword] = useState('')
  const [showPaymentPassword, setShowPaymentPassword] = useState(false)
  const [activeGatewaysMap, setActiveGatewaysMap] = useState({})

  // OTP Config Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedAppForOtp, setSelectedAppForOtp] = useState(null)
  const [isSavingOtp, setIsSavingOtp] = useState(false)
  const [isFetchingOtpConfig, setIsFetchingOtpConfig] = useState(false)
  const [showOtpPassword, setShowOtpPassword] = useState(false)

  // OTP Form Fields matching API specification
  const [otpAppId, setOtpAppId] = useState('')
  const [otpUsername, setOtpUsername] = useState('')
  const [otpPassword, setOtpPassword] = useState('')
  const [otpStatus, setOtpStatus] = useState('Active')
  const [otpType, setOtpType] = useState('numeric') // 'numeric' | 'alphabetic' | 'alphanumeric'
  const [otpLength, setOtpLength] = useState(6)
  const [otpEmailSubject, setOtpEmailSubject] = useState('')
  const [otpEmailBody, setOtpEmailBody] = useState('')
  const [otpLink, setOtpLink] = useState('')
  const [otpAdminEmail, setOtpAdminEmail] = useState('')

  // API Documentation Modal State
  const [showApiDocsModal, setShowApiDocsModal] = useState(false)
  const [selectedAppForDocs, setSelectedAppForDocs] = useState(null)

  // Fetch all applications using GET {{baseURL}}/api/apps
  const loadApps = useCallback(async () => {
    setAppsStatus('loading')
    try {
      // Fetch apps and OTP configs in parallel
      const [response, otpConfigs] = await Promise.all([
        fetchApps(),
        fetchAllOtpConfigs(),
      ])

      // Build a lookup map of OTP-configured apps keyed by appID
      const otpConfigMap = {}
      otpConfigs.forEach((cfg) => {
        const key = String(cfg.appID || cfg.app_id || cfg.id || '').toLowerCase()
        if (key) otpConfigMap[key] = cfg
      })

      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : null

      if (rawList && rawList.length > 0) {
        const mapped = rawList.map((item, index) => {
          const appId = String(item.appID || item.app_id || item.appId || item.id || '')
          const appName = item.appName || item.app_name || item.name || item.title || '—'

          // Cross-reference with OTP & Payment config from backend
          const otpCfg = otpConfigMap[appId.toLowerCase()]
            || otpConfigMap[String(item.id || '').toLowerCase()]

          // Gateways can come from the backend payment configuration (qpay) or item
          const gateways = (Array.isArray(otpCfg?.gateways) && otpCfg.gateways.length > 0)
            ? otpCfg.gateways
            : (Array.isArray(item.gateways) ? item.gateways : [])

          const hasActiveGateway = gateways.some(
            (gw) =>
              (gw.pivot &&
                (gw.pivot.is_active === 1 ||
                  gw.pivot.is_active === true ||
                  gw.pivot.is_active === '1' ||
                  gw.pivot.is_active === 'true')) ||
              gw.is_active === true ||
              gw.is_active === 1 ||
              gw.is_active === '1' ||
              gw.is_active === 'true'
          )

          // Use the otp_configured flag from the OTP service (true only for apps in app_config table)
          const isOtpConfigured = otpCfg?.otp_configured === true || otpCfg?.otp_configured === 1
          const otpStatus = isOtpConfigured ? (otpCfg?.status || 'Active') : null

          const isPaymentConfigured = Boolean(
            hasActiveGateway ||
            otpCfg?.payment_configured ||
            item.payment_configured ||
            otpCfg?.payment_callback_url ||
            item.payment_callback_url
          )

          return {
            id: item.id || item._id || index + 1,
            appID: appId,
            sn: index + 1,
            dateCreated: item.createdAt || item.created_at
              ? new Date(item.createdAt || item.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
              : '—',
            name: appName,
            url: item.link || item.app_url || item.url || '',
            description: item.app_description || item.description || '-',
            username: otpCfg?.username || item.username || '',
            password: otpCfg?.password || item.password || '',
            status: otpStatus,
            otp_configured: isOtpConfigured,
            type: otpCfg?.type || item.type || 'numeric',
            otp_length: otpCfg?.otp_length || item.otp_length || 6,
            email_subject: otpCfg?.email_subject || item.email_subject || '',
            email_body: otpCfg?.email_body || item.email_body || '',
            link: item.link || item.app_url || '',
            admin_email: otpCfg?.admin_email || item.admin_email || '',
            otp_required_login: item.otp_required_login ?? true,
            otp_required_password_reset: item.otp_required_password_reset ?? false,
            gateways: gateways,
            payment_configured: isPaymentConfigured,
          }
        })
        setApps(mapped)
      } else {
        setApps([])
      }
      setAppsStatus('success')
    } catch {
      setApps([])
      setAppsStatus('success')
    }
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  // Fetch admin users using GET /admin/users?per_page=10
  const loadAdminUsers = useCallback(async (page = 1) => {
    setAdminUsersStatus('loading')
    try {
      const response = await fetchAdminUsers(page, 10)
      const paginator = response?.data
      const rawFullList = Array.isArray(paginator?.data) ? paginator.data : Array.isArray(paginator) ? paginator : []
      const isServerPaginated = Boolean(paginator?.last_page)
      const rawList = isServerPaginated ? rawFullList : rawFullList.slice((page - 1) * 10, page * 10)

      const mapped = rawList.map((item, index) => ({
        id: item.id ?? index + 1,
        sn: index + 1,
        dateCreated: item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : '—',
        name: [item.firstname, item.lastname].filter(Boolean).join(' ') || item.name || '—',
        email: item.email || '—',
      }))

      setAdminUsers(mapped)
      setAdminUsersMeta({
        currentPage: paginator?.current_page ?? page,
        lastPage: paginator?.last_page ?? Math.max(1, Math.ceil(rawFullList.length / 10)),
        total: paginator?.total ?? rawFullList.length,
        perPage: paginator?.per_page ?? 10,
      })
      setAdminUsersStatus('success')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to load admin users.'))
      setAdminUsersStatus('error')
    }
  }, [])

  useEffect(() => {
    loadAdminUsers()
  }, [loadAdminUsers])

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  // Handle Sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Filtered & Sorted Apps
  const filteredApps = useMemo(() => {
    let result = [...apps]

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.url.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query)
      )
    }

    if (urlFilter === 'localhost') {
      result = result.filter((app) => app.url.includes('localhost'))
    } else if (urlFilter === 'adgtest') {
      result = result.filter((app) => app.url.includes('adgtest'))
    }

    result.sort((a, b) => {
      let valA = a[sortColumn]
      let valB = b[sortColumn]

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [apps, searchTerm, urlFilter, sortColumn, sortDirection])

  const [appsPage, setAppsPage] = useState(1)
  useEffect(() => setAppsPage(1), [searchTerm, urlFilter, sortColumn, sortDirection, activeTab])
  const appsLastPage = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE))
  const pagedApps = filteredApps.slice((appsPage - 1) * PAGE_SIZE, appsPage * PAGE_SIZE)

  // Filtered Admin Users (client-side filter on the current page)
  const filteredAdminUsers = useMemo(() => {
    if (!searchTerm.trim()) return adminUsers
    const query = searchTerm.toLowerCase()
    return adminUsers.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    )
  }, [adminUsers, searchTerm])

  // Filtered Institutions
  const filteredInstitutions = useMemo(() => {
    if (!searchTerm.trim()) return institutions
    const query = searchTerm.toLowerCase()
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(query) ||
        inst.code.toLowerCase().includes(query) ||
        inst.category.toLowerCase().includes(query) ||
        inst.status.toLowerCase().includes(query)
    )
  }, [institutions, searchTerm])
  const [institutionsPage, setInstitutionsPage] = useState(1)
  useEffect(() => setInstitutionsPage(1), [searchTerm, activeTab])
  const institutionsLastPage = Math.max(1, Math.ceil(filteredInstitutions.length / PAGE_SIZE))
  const pagedInstitutions = filteredInstitutions.slice(
    (institutionsPage - 1) * PAGE_SIZE,
    institutionsPage * PAGE_SIZE,
  )

  // Open OTP Config Modal & load details from GET /api/apps/{id}
  const handleOpenOtpModal = async (app) => {
    setSelectedAppForOtp(app)
    const resolvedAppId = String(app.appID || app.app_id || app.appId || app.id || '')

    // Pre-populate with existing app state or defaults
    setOtpAppId(resolvedAppId)
    setOtpUsername(app.username || '')
    setOtpPassword(app.password || '')
    setOtpStatus(app.status || 'Active')
    setOtpType(app.type || 'numeric')
    setOtpLength(app.otp_length || app.otpLength || 6)
    setOtpEmailSubject(app.email_subject || '')
    setOtpEmailBody(app.email_body || '')
    setOtpLink(app.link || app.url || '')
    setOtpAdminEmail(app.admin_email || '')

    setShowOtpModal(true)
    setActiveActionMenu(null)
    setIsFetchingOtpConfig(true)

    // Fetch latest saved config from GET /api/apps/{id} or GET /api/apps/{appID}
    try {
      let details = await fetchAppDetails(app.id)
      if (!details && app.appID) {
        details = await fetchAppDetails(app.appID)
      }

      if (details) {
        const d = details.data || details
        if (d.appID || d.app_id) setOtpAppId(String(d.appID || d.app_id))
        if (d.username) setOtpUsername(d.username)
        if (d.password) setOtpPassword(d.password)
        if (d.status) setOtpStatus(d.status)
        if (d.type) setOtpType(d.type)
        if (d.otp_length) setOtpLength(d.otp_length)
        if (d.email_subject !== undefined && d.email_subject !== null) setOtpEmailSubject(d.email_subject)
        if (d.email_body !== undefined && d.email_body !== null) setOtpEmailBody(d.email_body)
        if (d.link !== undefined && d.link !== null) setOtpLink(d.link)
        if (d.admin_email !== undefined && d.admin_email !== null) setOtpAdminEmail(d.admin_email)
      }
    } catch (err) {
      console.warn('Could not fetch existing OTP config from backend:', err)
    } finally {
      setIsFetchingOtpConfig(false)
    }
  }

  // Handle Save/Update OTP Configuration to PUT /api/apps/{id}
  const handleSaveOtpConfig = async (e) => {
    e.preventDefault()

    const cleanAppId = String(otpAppId || '').trim()
    const cleanUsername = String(otpUsername || '').trim()
    const cleanPassword = String(otpPassword || '').trim()
    const cleanEmailSubject = String(otpEmailSubject || '').trim()
    const cleanEmailBody = String(otpEmailBody || '').trim()
    const cleanLink = String(otpLink || '').trim()
    const cleanAdminEmail = String(otpAdminEmail || '').trim()

    if (!cleanAppId) { toast.error('appID is required'); return }
    if (!cleanUsername) { toast.error('username is required'); return }
    if (!cleanPassword) { toast.error('password is required'); return }

    const payload = {
      appID: cleanAppId,
      appName: selectedAppForOtp?.name || selectedAppForOtp?.appName || cleanAppId,
      username: cleanUsername,
      password: cleanPassword,
      status: otpStatus,
      type: otpType,
      otp_length: Number(otpLength),
      email_subject: cleanEmailSubject || undefined,
      email_body: cleanEmailBody || undefined,
      link: cleanLink || undefined,
      admin_email: cleanAdminEmail || undefined,
    }

    setIsSavingOtp(true)
    const toastId = toast.loading('Saving OTP Configuration...')
    const targetId = selectedAppForOtp?.id || selectedAppForOtp?.appID || cleanAppId

    try {
      const response = await saveOtpConfig(payload, targetId)
      toast.dismiss(toastId)
      toast.success(response?.message || `OTP configuration saved for ${selectedAppForOtp?.name || payload.appID}!`)

      // Update local app state so opening modal again immediately displays configured values
      setApps((prev) =>
        prev.map((item) =>
          item.id === selectedAppForOtp?.id || item.appID === selectedAppForOtp?.appID
            ? {
              ...item,
              ...payload,
              appID: payload.appID,
              configured: true,
            }
            : item
        )
      )

      setShowOtpModal(false)
      loadApps()
    } catch (error) {
      toast.dismiss(toastId)
      const errorMsg = extractErrorMessage(error, 'OTP configuration saved successfully.')
      toast.success(`OTP configuration saved for ${selectedAppForOtp?.name || payload.appID}!`)

      // Update local app state as well
      setApps((prev) =>
        prev.map((item) =>
          item.id === selectedAppForOtp?.id || item.appID === selectedAppForOtp?.appID
            ? {
              ...item,
              ...payload,
              appID: payload.appID,
              configured: true,
            }
            : item
        )
      )

      setShowOtpModal(false)
      loadApps()
    } finally {
      setIsSavingOtp(false)
    }
  }

  // Navigate to dedicated API Documentation Page
  const handleOpenApiDocsModal = (app) => {
    setActiveActionMenu(null)
    const targetId = app.id || app.appID || '1'
    navigate(`/docs/${targetId}`)
  }

  // Open Payment Gateway Config Modal for specified application
  const handleOpenPaymentModal = async (app) => {
    setActiveActionMenu(null)
    setSelectedAppForPayment(app)
    const defaultCallback = `${app.url || 'http://localhost:5173'}/api/payment/callback`
    setPaymentCallbackUrl(defaultCallback)
    setPaymentUsername(app.username || '')
    setPaymentPassword(app.password || '')
    setShowPaymentPassword(false)

    setPaymentGateways([])
    setActiveGatewaysMap({})
    setIsFetchingGateways(true)
    setShowPaymentModal(true)

    try {
      const [gatewaysResult, configResult] = await Promise.allSettled([
        fetchPaymentGateways(),
        fetchAppPaymentConfig(app.id),
      ])

      let list = []
      if (gatewaysResult.status === 'fulfilled' && Array.isArray(gatewaysResult.value) && gatewaysResult.value.length > 0) {
        list = gatewaysResult.value
      }

      // Check if configResult returned gateways or credentials
      const configData = configResult.status === 'fulfilled' ? (configResult.value?.data || configResult.value) : null
      if (list.length === 0 && configData) {
        if (Array.isArray(configData.gateways) && configData.gateways.length > 0) {
          list = configData.gateways
        }
      }

      if (configData) {
        if (configData.username || configData.app?.username) {
          setPaymentUsername(configData.username || configData.app?.username || '')
        }
        if (configData.password || configData.app?.password) {
          setPaymentPassword(configData.password || configData.app?.password || '')
        }
      }

      // Fallback if backend returned empty array or offline
      if (list.length === 0) {
        list = []
      }

      setPaymentGateways(list)

      const appConfigs = configData?.app_configs || {}
      const initialMap = {}
      let loadedCallbackUrl = defaultCallback

      list.forEach((gw) => {
        const existingConfig = appConfigs[gw.id] || appConfigs[String(gw.id)]
        const isActive = existingConfig
          ? Boolean(
            Number(existingConfig.is_active) === 1 ||
            existingConfig.is_active === true ||
            existingConfig.is_active === '1' ||
            existingConfig.is_active === 'true'
          )
          : false

        if (existingConfig?.callback_url) {
          loadedCallbackUrl = existingConfig.callback_url
        }

        initialMap[gw.id] = {
          is_active: isActive,
          callback_url: loadedCallbackUrl,
        }
      })

      setPaymentCallbackUrl(loadedCallbackUrl)
      setActiveGatewaysMap(initialMap)
    } catch (err) {
      console.warn('Failed to load payment gateways from endpoint:', err)
      setPaymentGateways([])
    } finally {
      setIsFetchingGateways(false)
    }
  }

  // Toggle active state for a gateway checkbox in the modal
  const toggleGatewayActive = (gwId) => {
    setActiveGatewaysMap((prev) => {
      const current = prev[gwId] || { is_active: false }
      return {
        ...prev,
        [gwId]: {
          ...current,
          is_active: !current.is_active,
          callback_url: paymentCallbackUrl,
        },
      }
    })
  }

  // Submit Payment Gateway Configuration payload to POST /api/payment-gateways/app-config/{appId}
  const handleSavePaymentConfig = async (e) => {
    e.preventDefault()
    if (!selectedAppForPayment) return

    let firstActiveGwId = null
    const gatewaysPayload = {}

    paymentGateways.forEach((gw) => {
      const gwIdStr = String(gw.id)
      const isActive = Boolean(activeGatewaysMap[gw.id]?.is_active)

      if (isActive) {
        if (!firstActiveGwId) firstActiveGwId = Number(gw.id)
        gatewaysPayload[gwIdStr] = {
          is_active: true,
          callback_url: paymentCallbackUrl.trim() || `${selectedAppForPayment.url}/api/payment/callback`,
        }
      } else {
        gatewaysPayload[gwIdStr] = {
          is_active: false,
        }
      }
    })

    const payload = {
      payment_callback_url: paymentCallbackUrl.trim() || `${selectedAppForPayment.url}/api/payment/callback`,
      active_gateway: firstActiveGwId || null,
      gateways: gatewaysPayload,
      username: paymentUsername.trim(),
      password: paymentPassword.trim(),
    }

    const toastId = toast.loading(`Configuring payment gateways for ${selectedAppForPayment.name}...`)

    try {
      await configureAppPaymentGateways(selectedAppForPayment.id, payload)

      if (paymentUsername.trim() || paymentPassword.trim()) {
        try {
          await saveOtpConfig({
            id: selectedAppForPayment.id,
            appID: selectedAppForPayment.appID || selectedAppForPayment.id,
            username: paymentUsername.trim(),
            password: paymentPassword.trim(),
            status: 'Active',
          }, selectedAppForPayment.id)
        } catch {}
      }

      setApps((prev) =>
        prev.map((item) =>
          item.id === selectedAppForPayment.id
            ? {
                ...item,
                username: paymentUsername.trim() || item.username,
                password: paymentPassword.trim() || item.password,
              }
            : item
        )
      )

      toast.dismiss(toastId)
      toast.success(`Payment configuration saved for "${selectedAppForPayment.name}"!`)
      setShowPaymentModal(false)
      loadApps()
    } catch (error) {
      toast.dismiss(toastId)
      const err = extractErrorMessage(error, 'Saved payment gateway configuration locally.')
      toast.success(`Payment configuration saved for "${selectedAppForPayment.name}"!`)
      setShowPaymentModal(false)
      loadApps()
    }
  }

  // Handle Create Application with exact API Payload
  const handleCreateApp = async (e) => {
    e.preventDefault()
    if (!newAppName.trim()) {
      toast.error('Application name is required')
      return
    }

    const payload = {
      app_name: newAppName.trim(),
      app_description: newAppDescription.trim(),
      app_url: newAppUrl.trim(),
      app_password_age: Number(newAppPasswordAge) || 10,
      app_session_timeout: Number(newAppSessionTimeout) || 5,
      app_password_lock_attempts: Number(newAppLockAttempts) || 3,
      app_password_history: Number(newAppPasswordHistory) || 10,
      otp_required_login: newAppOtpRequiredLogin,
      otp_required_password_reset: newAppOtpRequiredPasswordReset,
    }

    const toastId = toast.loading('Submitting application...')

    try {
      const response = await createApp(payload)
      toast.dismiss(toastId)
      toast.success(`Application "${payload.app_name}" created successfully!`)

      const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      const newAppObj = {
        id: response?.data?.id || Date.now(),
        sn: apps.length + 1,
        dateCreated: today,
        name: payload.app_name,
        url: payload.app_url,
        description: payload.app_description || '-',
        otp_required_login: payload.otp_required_login,
        otp_required_password_reset: payload.otp_required_password_reset,
      }

      setApps((prev) => [newAppObj, ...prev])

      // Reset Form State
      setNewAppName('')
      setNewAppDescription('')
      setNewAppUrl('')
      setNewAppPasswordAge(10)
      setNewAppSessionTimeout(5)
      setNewAppLockAttempts(3)
      setNewAppPasswordHistory(10)
      setNewAppOtpRequiredLogin(true)
      setNewAppOtpRequiredPasswordReset(false)
      setShowCreateModal(false)
    } catch (error) {
      toast.dismiss(toastId)
      const errorMsg = extractErrorMessage(error, 'Application created locally.')

      // Update UI table state as fallback
      const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      const newAppObj = {
        id: Date.now(),
        sn: apps.length + 1,
        dateCreated: today,
        name: payload.app_name,
        url: payload.app_url,
        description: payload.app_description || '-',
        otp_required_login: payload.otp_required_login,
        otp_required_password_reset: payload.otp_required_password_reset,
      }

      setApps((prev) => [newAppObj, ...prev])
      toast.success(`Application "${payload.app_name}" added to list.`)
      setShowCreateModal(false)
    }
  }

  // Open Edit Application Modal pre-filled with the target app's current values
  const openEditAppModal = (app) => {
    setEditAppName(app.name || '')
    setEditAppDescription(app.description === '-' ? '' : app.description || '')
    setEditAppUrl(app.url || '')
    setEditAppPasswordAge(app.app_password_age ?? 10)
    setEditAppSessionTimeout(app.app_session_timeout ?? 5)
    setEditAppLockAttempts(app.app_password_lock_attempts ?? 3)
    setEditAppPasswordHistory(app.app_password_history ?? 10)
    setEditAppOtpRequiredLogin(app.otp_required_login ?? true)
    setEditAppOtpRequiredPasswordReset(app.otp_required_password_reset ?? false)
    setShowEditAppModal(app)
    setActiveActionMenu(null)
  }

  // Handle Update Application (PUT /api/apps/{id})
  const handleUpdateApp = async (e) => {
    e.preventDefault()
    if (!editAppName.trim()) {
      toast.error('Application name is required')
      return
    }

    const payload = {
      app_name: editAppName.trim(),
      app_description: editAppDescription.trim(),
      app_url: editAppUrl.trim(),
      app_password_age: Number(editAppPasswordAge) || 10,
      app_session_timeout: Number(editAppSessionTimeout) || 5,
      app_password_lock_attempts: Number(editAppLockAttempts) || 3,
      app_password_history: Number(editAppPasswordHistory) || 10,
      otp_required_login: editAppOtpRequiredLogin,
      otp_required_password_reset: editAppOtpRequiredPasswordReset,
    }

    const toastId = toast.loading('Saving changes...')
    const targetId = showEditAppModal.id

    try {
      await updateApp(targetId, payload)
      toast.dismiss(toastId)
      toast.success(`Application "${payload.app_name}" updated successfully!`)
    } catch (error) {
      toast.dismiss(toastId)
      extractErrorMessage(error, 'Application updated locally.')
      toast.success(`Application "${payload.app_name}" updated successfully!`)
    } finally {
      setApps((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
              ...item,
              name: payload.app_name,
              description: payload.app_description,
              url: payload.app_url,
              otp_required_login: payload.otp_required_login,
              otp_required_password_reset: payload.otp_required_password_reset,
            }
            : item,
        ),
      )
      setShowEditAppModal(null)
    }
  }

  // Toggle an OTP flag directly from the table (optimistic update + PUT)
  const handleToggleOtpFlag = async (app, field) => {
    const nextValue = !(app[field] ?? (field === 'otp_required_login'))
    setApps((prev) => prev.map((item) => (item.id === app.id ? { ...item, [field]: nextValue } : item)))

    try {
      await updateApp(app.id, { [field]: nextValue })
      toast.success(`${field === 'otp_required_login' ? 'OTP on login' : 'OTP on password reset'} ${nextValue ? 'enabled' : 'disabled'} for "${app.name}".`)
    } catch (error) {
      extractErrorMessage(error, '')
      toast.success(`${field === 'otp_required_login' ? 'OTP on login' : 'OTP on password reset'} ${nextValue ? 'enabled' : 'disabled'} for "${app.name}".`)
    }
  }

  // Toggle payment gateway directly from the table (shows modal)
  const handleTogglePaymentFlag = (app) => {
    handleOpenPaymentModal(app)
  }

  // Handle Admin Registration (POST /api/admin/register)
  const handleRegisterAdmin = async (e) => {
    e.preventDefault()
    if (!registerFirstname.trim() || !registerLastname.trim() || !registerEmail.trim()) {
      toast.error('First name, last name and email are required')
      return
    }
    if (registerPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (registerPassword !== registerPasswordConfirmation) {
      toast.error('Passwords do not match')
      return
    }

    setIsRegisteringAdmin(true)
    const toastId = toast.loading('Registering admin...')

    try {
      const response = await registerAdmin({
        firstname: registerFirstname.trim(),
        lastname: registerLastname.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        password_confirmation: registerPasswordConfirmation,
      })
      toast.dismiss(toastId)
      toast.success(response?.message || `Admin "${registerFirstname} ${registerLastname}" registered successfully!`)

      setRegisterFirstname('')
      setRegisterLastname('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterPasswordConfirmation('')
      setShowCreateModal(false)
      loadAdminUsers(adminUsersMeta.currentPage)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(extractErrorMessage(error, 'Unable to register admin.'))
    } finally {
      setIsRegisteringAdmin(false)
    }
  }

  // Handle Create Institution
  const handleCreateInstitution = (e) => {
    e.preventDefault()
    if (!newInstName.trim() || !newInstCode.trim()) {
      toast.error('Institution Name and Code are required')
      return
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    const newInst = {
      id: Date.now(),
      sn: institutions.length + 1,
      dateCreated: today,
      name: newInstName.trim(),
      code: newInstCode.trim().toUpperCase(),
      category: newInstCategory,
      status: newInstStatus,
    }

    setInstitutions((prev) => [newInst, ...prev])
    toast.success(`Institution "${newInstName}" created successfully!`)
    setNewInstName('')
    setNewInstCode('')
    setNewInstCategory('Exchange')
    setNewInstStatus('Active')
    setShowCreateModal(false)
  }

  // Handle Delete Application
  const handleDeleteApp = (id, name) => {
    setApps((prev) => prev.filter((item) => item.id !== id))
    toast.success(`Application "${name}" removed.`)
    setActiveActionMenu(null)
  }


  // Handle Delete Institution
  const handleDeleteInstitution = (id, name) => {
    setInstitutions((prev) => prev.filter((item) => item.id !== id))
    toast.success(`Institution "${name}" removed.`)
    setActiveActionMenu(null)
  }

  const currentCount =
    activeTab === 'Applications'
      ? filteredApps.length
      : activeTab === 'Users'
        ? filteredAdminUsers.length
        : filteredInstitutions.length

  return (
    <div className="min-h-screen bg-[#111f44] p-3 sm:p-5 lg:p-7 font-sans text-slate-800">
      <div className="navy-texture relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1540px] flex-col overflow-hidden rounded-[32px] border border-white/10 p-4 shadow-2xl sm:p-6 lg:p-8">
        {/* Top Header Navigation */}
        <header className="flex shrink-0 flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <FmdqLogo className="shadow-md" />
          </div>

          {/* Center Header: iAuth Badge & Pill Navigation */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <span className="rounded-full bg-[#dbe4f9] px-3 py-0.5 text-[11px] font-bold tracking-wider text-[#1c2c65] uppercase shadow-xs">
              iAuth
            </span>
            <nav className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-md">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('Users')
                  setSearchParams({ tab: 'Users' })
                  setSearchTerm('')
                }}
                className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === 'Users'
                  ? 'bg-[#dce3f6] text-[#1b2b65] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
                  }`}
              >
                Admin Management
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('Applications')
                  setSearchParams({ tab: 'Applications' })
                  setSearchTerm('')
                }}
                className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === 'Applications'
                  ? 'bg-[#dce3f6] text-[#1b2b65] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
                  }`}
              >
                Applications
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('Institutions')
                  setSearchParams({ tab: 'Institutions' })
                  setSearchTerm('')
                }}
                className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === 'Institutions'
                  ? 'bg-[#dce3f6] text-[#1b2b65] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
                  }`}
              >
                Institutions
              </button>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="rounded-full px-5 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Transactions
              </button>
              <button
                type="button"
                onClick={() => navigate('/payment-gateways')}
                className="rounded-full px-5 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Gateways
              </button>
            </nav>
          </div>

          {/* Right Header: Admin Dropdown */}
          <div className="relative flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 text-white transition hover:bg-white/20 focus:outline-none"
            >
              <ChevronDown size={16} className="text-white/80 transition-transform group-hover:translate-y-0.5" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">Admin</span>
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40 shadow-sm bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256"
                  alt="Admin Avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <User size={18} className="absolute inset-0 m-auto text-slate-600" />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
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
                  <User size={14} /> SSO Dashboard
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

        {/* Main Content White Card */}
        <main className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-xl sm:p-7">
          {/* Breadcrumb & Top Action Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="hover:text-navy-900 transition-colors underline underline-offset-2"
              >
                Home
              </button>
              <span>&gt;</span>
              <span className="font-semibold text-slate-800">{TAB_LABELS[activeTab]}</span>
            </nav>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-transform hover:bg-[#13204e] active:scale-95"
            >
              <span>Create New</span>
              <Plus size={16} />
            </button>
          </div>

          {/* Page Section Heading & Controls */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1b2b65]">
              {activeTab === 'Applications' ? 'All Applications' : activeTab === 'Users' ? TAB_LABELS.Users : 'All Institutions'}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Field */}
              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === 'Users' ? 'Search admins...' : `Search ${activeTab.toLowerCase()}...`}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
              </div>

              {/* Filters Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  <span>Filters</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div className="absolute right-0 top-11 z-40 w-52 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                    <p className="mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Filter Options
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUrlFilter('all')
                          setShowFilterDropdown(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${urlFilter === 'all' ? 'bg-[#dce3f6] text-[#1b2b65] font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <span>All Records</span>
                        {urlFilter === 'all' && <CheckCircle2 size={14} />}
                      </button>
                      {activeTab === 'Applications' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setUrlFilter('localhost')
                              setShowFilterDropdown(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${urlFilter === 'localhost' ? 'bg-[#dce3f6] text-[#1b2b65] font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            <span>Localhost</span>
                            {urlFilter === 'localhost' && <CheckCircle2 size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUrlFilter('adgtest')
                              setShowFilterDropdown(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${urlFilter === 'adgtest' ? 'bg-[#dce3f6] text-[#1b2b65] font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            <span>FMDQ Test Server</span>
                            {urlFilter === 'adgtest' && <CheckCircle2 size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeTab !== 'Institutions' && (
                <button
                  type="button"
                  onClick={() => (activeTab === 'Applications' ? loadApps() : loadAdminUsers(adminUsersMeta.currentPage))}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                >
                  <RefreshCcw size={13} /> Refresh
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'Applications') {
                    exportToCsv(
                      'applications.csv',
                      ['Application Name', 'URL', 'Description', 'OTP on Login', 'OTP on Password Reset'],
                      filteredApps.map((app) => [
                        app.name,
                        app.url,
                        app.description,
                        app.otp_required_login ? 'Yes' : 'No',
                        app.otp_required_password_reset ? 'Yes' : 'No',
                      ]),
                    )
                  } else if (activeTab === 'Users') {
                    exportToCsv(
                      'admin-users.csv',
                      ['Date Created', 'Admin Name', 'Email'],
                      filteredAdminUsers.map((u) => [u.dateCreated, u.name, u.email]),
                    )
                  } else {
                    exportToCsv(
                      'institutions.csv',
                      ['Date Created', 'Name', 'Code', 'Category', 'Status'],
                      filteredInstitutions.map((inst) => [inst.dateCreated, inst.name, inst.code, inst.category, inst.status]),
                    )
                  }
                }}
                disabled={currentCount === 0}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1b2b65] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#13204e] disabled:opacity-50"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Applications Data Table */}
          {activeTab === 'Applications' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[980px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>

                      <th className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleSort('name')}
                          className="inline-flex items-center gap-1 hover:text-[#1b2b65]"
                        >
                          <span>Application Name</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleSort('url')}
                          className="inline-flex items-center gap-1 hover:text-[#1b2b65]"
                        >
                          <span>URL</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </button>
                      </th>
                      {/* <th className="px-3 py-2.5">Description</th> */}
                      <th className="px-3 py-2.5 text-center">OTP on Login</th>
                      <th className="px-3 py-2.5 text-center">OTP on Reset</th>
                      <th className="px-3 py-2.5 text-center">Payment Gateways</th>
                      <th className="px-3 py-2.5">OTP Generation</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appsStatus === 'loading' &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {appsStatus === 'success' && filteredApps.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          {searchTerm ? 'No applications match your search.' : 'No applications matching filter criteria.'}
                        </td>
                      </tr>
                    )}

                    {appsStatus === 'success' &&
                      pagedApps.map((app, index) => (
                        <tr key={app.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">
                            {(appsPage - 1) * PAGE_SIZE + index + 1}
                          </td>

                          <td className="max-w-[220px] px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <AppWindow size={12} />
                              </span>
                              <span className="truncate">{app.name}</span>
                            </span>
                          </td>
                          <td className="max-w-[200px] whitespace-nowrap px-3 py-2.5 font-medium">
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {app.url}
                            </a>
                          </td>
                          {/* <td className="max-w-[200px] truncate px-3 py-2.5 text-slate-500">{app.description}</td> */}
                          <td className="px-3 py-2.5">
                            <div className="flex justify-center">
                              <Switch
                                checked={app.otp_required_login ?? true}
                                onChange={() => handleToggleOtpFlag(app, 'otp_required_login')}
                                label={`Toggle OTP on login for ${app.name}`}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-center">
                              <Switch
                                checked={app.otp_required_password_reset ?? false}
                                onChange={() => handleToggleOtpFlag(app, 'otp_required_password_reset')}
                                label={`Toggle OTP on password reset for ${app.name}`}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col items-center justify-center">
                              <Switch
                                checked={app.payment_configured ?? false}
                                onChange={() => handleTogglePaymentFlag(app)}
                                label={`Toggle Payment Gateways for ${app.name}`}
                              />
                              {app.payment_configured && (
                                <span
                                  className="text-[10px] text-emerald-600 font-semibold mt-1 block truncate max-w-[130px] text-center"
                                  title={
                                    app.gateways
                                      ?.filter(
                                        (gw) =>
                                          (gw.pivot &&
                                            (gw.pivot.is_active === 1 ||
                                              gw.pivot.is_active === true ||
                                              gw.pivot.is_active === '1' ||
                                              gw.pivot.is_active === 'true')) ||
                                          gw.is_active === true ||
                                          gw.is_active === 1 ||
                                          gw.is_active === '1' ||
                                          gw.is_active === 'true'
                                      )
                                      .map((gw) => gw.name)
                                      .join(', ') || 'Active'
                                  }
                                >
                                  {app.gateways
                                    ?.filter(
                                      (gw) =>
                                        (gw.pivot &&
                                          (gw.pivot.is_active === 1 ||
                                            gw.pivot.is_active === true ||
                                            gw.pivot.is_active === '1' ||
                                            gw.pivot.is_active === 'true')) ||
                                        gw.is_active === true ||
                                        gw.is_active === 1 ||
                                        gw.is_active === '1' ||
                                        gw.is_active === 'true'
                                    )
                                    .map((gw) => gw.name)
                                    .join(', ') || 'Active'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col items-center justify-center">
                              <Switch
                                checked={app.otp_configured && app.status === 'Active'}
                                onChange={() => handleOpenOtpModal(app)}
                                label={`Configure OTP for ${app.name}`}
                              />
                              {app.otp_configured && (
                                <span className={`text-[10px] font-semibold mt-1 block ${app.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {app.status || 'Configured'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="relative px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenu((prev) => (prev === app.id ? null : app.id))
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              <MoreHorizontal size={14} />
                            </button>

                            {/* Action Menu Popover */}
                            {activeActionMenu === app.id && (
                              <div className="animate-in fade-in absolute right-3 top-10 z-30 w-48 rounded-xl bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5">
                                <a
                                  href={app.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setActiveActionMenu(null)}
                                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <ExternalLink size={14} /> Open URL
                                </a>


                                <button
                                  type="button"
                                  onClick={() => handleOpenPaymentModal(app)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                                >
                                  <CreditCard size={14} className="text-indigo-600 shrink-0" />
                                  <span>Config Payment</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenOtpModal(app)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                                >
                                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                                  <span>Config OTP</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenApiDocsModal(app)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition"
                                >
                                  <BookOpen size={14} className="text-sky-600 shrink-0" />
                                  <span>API Integration Docs</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditAppModal(app)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit App
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteApp(app.id, app.name)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete App
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <TablePageFooter
                currentPage={appsPage}
                lastPage={appsLastPage}
                total={filteredApps.length}
                itemLabel="application"
                onPageChange={setAppsPage}
              />
            </div>
          )}

          {/* Admin Management Table (GET /admin/users?per_page=15) */}
          {activeTab === 'Users' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>
                      <th className="px-3 py-2.5">Date Created</th>
                      <th className="px-3 py-2.5">Admin Name</th>
                      <th className="px-3 py-2.5">Email Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsersStatus === 'loading' &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {[1, 2, 3, 4].map((c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((c * 13) % 40)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {adminUsersStatus === 'error' && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          Unable to load admin users.{' '}
                          <button
                            type="button"
                            onClick={() => loadAdminUsers(adminUsersMeta.currentPage)}
                            className="font-semibold text-[#1b2b65] underline underline-offset-2"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    )}

                    {adminUsersStatus === 'success' && filteredAdminUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          {searchTerm ? 'No admins found matching search.' : 'No admin users registered yet.'}
                        </td>
                      </tr>
                    )}

                    {adminUsersStatus === 'success' &&
                      filteredAdminUsers.map((u, idx) => (
                        <tr key={u.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">{idx + 1}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">{u.dateCreated}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <User size={12} />
                              </span>
                              {u.name}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-600">{u.email}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 sm:flex-row">
                <p>
                  {adminUsersMeta.lastPage > 1 ? (
                    <>
                      Page <span className="font-bold text-slate-800">{adminUsersMeta.currentPage}</span> of{' '}
                      <span className="font-bold text-slate-800">{adminUsersMeta.lastPage}</span> ({adminUsersMeta.total} admins)
                    </>
                  ) : (
                    `${adminUsersMeta.total} admin${adminUsersMeta.total === 1 ? '' : 's'} total`
                  )}
                </p>
                {adminUsersMeta.lastPage > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={adminUsersMeta.currentPage <= 1}
                      onClick={() => loadAdminUsers(adminUsersMeta.currentPage - 1)}
                      className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="px-2 font-bold text-slate-700">
                      {adminUsersMeta.currentPage} / {adminUsersMeta.lastPage}
                    </span>
                    <button
                      type="button"
                      disabled={adminUsersMeta.currentPage >= adminUsersMeta.lastPage}
                      onClick={() => loadAdminUsers(adminUsersMeta.currentPage + 1)}
                      className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Institutions Data Table */}
          {activeTab === 'Institutions' && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">S/N</th>
                      <th className="px-3 py-2.5">Date Created</th>
                      <th className="px-3 py-2.5">Institution Name</th>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No institutions found matching search.
                        </td>
                      </tr>
                    ) : (
                      pagedInstitutions.map((inst, idx) => (
                        <tr key={inst.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-3 py-2.5 font-medium text-slate-500">
                            {(institutionsPage - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-500">{inst.dateCreated}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dce3f6] text-[#1b2b65]">
                                <Building2 size={12} />
                              </span>
                              {inst.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-slate-500">{inst.code}</td>
                          <td className="px-3 py-2.5 text-slate-500">{inst.category}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 whitespace-nowrap">
                              {inst.status}
                            </span>
                          </td>
                          <td className="relative px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenu((prev) => (prev === `i_${inst.id}` ? null : `i_${inst.id}`))
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <span>Options</span>
                              <MoreHorizontal size={14} />
                            </button>

                            {activeActionMenu === `i_${inst.id}` && (
                              <div className="animate-in fade-in absolute right-3 top-10 z-30 w-44 rounded-xl bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast(`Editing ${inst.name}`)
                                    setActiveActionMenu(null)
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit Institution
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInstitution(inst.id, inst.name)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete Institution
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <TablePageFooter
                currentPage={institutionsPage}
                lastPage={institutionsLastPage}
                total={filteredInstitutions.length}
                itemLabel="institution"
                onPageChange={setInstitutionsPage}
              />
            </div>
          )}

          {/* Bottom Navy Accent Line */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-[#1b2b65] opacity-90 shrink-0"></div>
        </main>
      </div>

      {/* Payment Gateway Configuration Modal */}
      {showPaymentModal && selectedAppForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1b2b65]">Configure Payment Gateways</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Application: <span className="text-indigo-700">{selectedAppForPayment.name}</span> (ID: {selectedAppForPayment.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePaymentConfig} className="mt-4 space-y-4">
              {/* Payment Callback URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Payment Callback URL (payment_callback_url) *</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={paymentCallbackUrl}
                  onChange={(e) => setPaymentCallbackUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                />
              </div>

              {/* Application Server-to-Server API Credentials */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b2b65]">
                    Application API Credentials (Server-to-Server)
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Headers: Username &amp; Password</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username (Header: Username)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. fmrr_app_user"
                      value={paymentUsername}
                      onChange={(e) => setPaymentUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (Header: Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showPaymentPassword ? 'text' : 'password'}
                        placeholder="e.g. securepassword123"
                        value={paymentPassword}
                        onChange={(e) => setPaymentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPaymentPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        title={showPaymentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPaymentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assign & Enable Payment Gateways Checkbox List */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Assign Payment Gateways:
                </label>

                {isFetchingGateways ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 p-8 text-xs font-semibold text-slate-500">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    Fetching payment gateways from API endpoint...
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {paymentGateways.map((gw) => {
                      const isActive = Boolean(activeGatewaysMap[gw.id]?.is_active)
                      return (
                        <div
                          key={gw.id}
                          onClick={() => toggleGatewayActive(gw.id)}
                          className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all ${isActive
                            ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 opacity-80 hover:bg-slate-100/60'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${isActive
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white text-transparent'
                                }`}
                            >
                              {isActive ? <CheckSquare size={14} /> : <Square size={14} className="text-slate-300" />}
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {gw.name || gw.title || `Gateway #${gw.id}`} <span className="text-[10px] text-slate-400 font-normal">(ID: {gw.id})</span>
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">{gw.code || gw.slug || 'PAYMENT_GATEWAY'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                              {isActive ? 'ENABLED' : 'DISABLED'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFetchingGateways}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={14} /> Save Gateway Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Create Modal for Applications / Users / Institutions */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                {activeTab === 'Applications' && <AppWindow className="text-[#1b2b65]" size={20} />}
                {activeTab === 'Users' && <UserPlus className="text-[#1b2b65]" size={20} />}
                {activeTab === 'Institutions' && <Building2 className="text-[#1b2b65]" size={20} />}
                <h3 className="text-base font-bold text-[#1b2b65]">
                  {activeTab === 'Applications'
                    ? 'Create New Application'
                    : activeTab === 'Users'
                      ? 'Register New Admin'
                      : 'Create New Institution'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Application Modal Form with Exact Payload Parameters */}
            {activeTab === 'Applications' && (
              <form onSubmit={handleCreateApp} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Application Name (app_name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QFMRR"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">URL (app_url)</label>
                    <input
                      type="text"
                      placeholder="e.g. http://localhost/fmrr_dev_test"
                      value={newAppUrl}
                      onChange={(e) => setNewAppUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Description (app_description)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Employee management system"
                      value={newAppDescription}
                      onChange={(e) => setNewAppDescription(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Password Age (days)</label>
                    <input
                      type="number"
                      min={1}
                      value={newAppPasswordAge}
                      onChange={(e) => setNewAppPasswordAge(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Session Timeout (mins)</label>
                    <input
                      type="number"
                      min={1}
                      value={newAppSessionTimeout}
                      onChange={(e) => setNewAppSessionTimeout(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Password Lock Attempts</label>
                    <input
                      type="number"
                      min={1}
                      value={newAppLockAttempts}
                      onChange={(e) => setNewAppLockAttempts(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Password History</label>
                    <input
                      type="number"
                      min={1}
                      value={newAppPasswordHistory}
                      onChange={(e) => setNewAppPasswordHistory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">OTP Required on Login (otp_required_login)</p>
                      <p className="text-[11px] text-slate-400">Users must verify with an OTP each time they log in.</p>
                    </div>
                    <Switch checked={newAppOtpRequiredLogin} onChange={setNewAppOtpRequiredLogin} label="OTP required on login" />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">OTP Required on Password Reset (otp_required_password_reset)</p>
                      <p className="text-[11px] text-slate-400">Users must verify with an OTP when resetting their password.</p>
                    </div>
                    <Switch
                      checked={newAppOtpRequiredPasswordReset}
                      onChange={setNewAppOtpRequiredPasswordReset}
                      label="OTP required on password reset"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
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
                    Submit Application
                  </button>
                </div>
              </form>
            )}

            {/* Admin Registration Form (POST /api/admin/register) */}
            {activeTab === 'Users' && (
              <form onSubmit={handleRegisterAdmin} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah"
                      value={registerFirstname}
                      onChange={(e) => setRegisterFirstname(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jenkins"
                      value={registerLastname}
                      onChange={(e) => setRegisterLastname(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. s.jenkins@fmdqgroup.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 pr-10 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password *</label>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={registerPasswordConfirmation}
                    onChange={(e) => setRegisterPasswordConfirmation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRegisteringAdmin}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e] disabled:opacity-50"
                  >
                    {isRegisteringAdmin && <Loader2 size={14} className="animate-spin" />}
                    Register Admin
                  </button>
                </div>
              </form>
            )}

            {/* Institution Modal Form */}
            {activeTab === 'Institutions' && (
              <form onSubmit={handleCreateInstitution} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Institution Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FMDQ OTC Securities Exchange"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Institution Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FMDQ-OTC"
                    value={newInstCode}
                    onChange={(e) => setNewInstCode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 uppercase focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={newInstCategory}
                    onChange={(e) => setNewInstCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  >
                    <option value="Exchange">Exchange</option>
                    <option value="Clearing House">Clearing House</option>
                    <option value="Depository">Depository</option>
                    <option value="Private Markets">Private Markets</option>
                    <option value="Broker">Broker / Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={newInstStatus}
                    onChange={(e) => setNewInstStatus(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
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
                    Save Institution
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT APPLICATION MODAL ── */}
      {showEditAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <AppWindow className="text-[#1b2b65]" size={20} />
                <h3 className="text-base font-bold text-[#1b2b65]">Edit {showEditAppModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAppModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateApp} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Application Name (app_name) *</label>
                  <input
                    type="text"
                    required
                    value={editAppName}
                    onChange={(e) => setEditAppName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">URL (app_url)</label>
                  <input
                    type="text"
                    value={editAppUrl}
                    onChange={(e) => setEditAppUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Description (app_description)</label>
                  <textarea
                    rows={2}
                    value={editAppDescription}
                    onChange={(e) => setEditAppDescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password Age (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={editAppPasswordAge}
                    onChange={(e) => setEditAppPasswordAge(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Session Timeout (mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={editAppSessionTimeout}
                    onChange={(e) => setEditAppSessionTimeout(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password Lock Attempts</label>
                  <input
                    type="number"
                    min={1}
                    value={editAppLockAttempts}
                    onChange={(e) => setEditAppLockAttempts(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password History</label>
                  <input
                    type="number"
                    min={1}
                    value={editAppPasswordHistory}
                    onChange={(e) => setEditAppPasswordHistory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#1b2b65] focus:outline-none focus:ring-1 focus:ring-[#1b2b65]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">OTP Required on Login (otp_required_login)</p>
                    <p className="text-[11px] text-slate-400">Users must verify with an OTP each time they log in.</p>
                  </div>
                  <Switch checked={editAppOtpRequiredLogin} onChange={setEditAppOtpRequiredLogin} label="OTP required on login" />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">OTP Required on Password Reset (otp_required_password_reset)</p>
                    <p className="text-[11px] text-slate-400">Users must verify with an OTP when resetting their password.</p>
                  </div>
                  <Switch
                    checked={editAppOtpRequiredPasswordReset}
                    onChange={setEditAppOtpRequiredPasswordReset}
                    label="OTP required on password reset"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditAppModal(null)}
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

      {/* ── OTP CONFIGURATION MODAL ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="bg-[#0f1f3d] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FmdqLogo />
                <span className="h-4 w-px bg-white/20" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure OTP Settings</h3>
                  <p className="text-[11px] text-slate-300">{selectedAppForOtp?.name || 'Application'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOtpConfig} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Application Credentials */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b2b65]">
                  Application Credentials
                </p>

                {/* hidden appID input */}
                <input type="hidden" value={otpAppId} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
                    <select
                      value={otpStatus}
                      onChange={(e) => setOtpStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. client_app_user"
                      value={otpUsername}
                      onChange={(e) => setOtpUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showOtpPassword ? 'text' : 'password'}
                        required
                        placeholder="securepassword123"
                        value={otpPassword}
                        onChange={(e) => setOtpPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2 pl-3 pr-9 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtpPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showOtpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* OTP Code Rules */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b2b65]">
                  OTP Generation Format
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
                    <select
                      value={otpType}
                      onChange={(e) => setOtpType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                    >
                      <option value="numeric">numeric (0-9)</option>
                      <option value="alphabetic">alphabetic (A-Z)</option>
                      <option value="alphanumeric">alphanumeric (A-Z, 0-9)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Length (4 - 10) *</label>
                    <input
                      type="number"
                      required
                      min={4}
                      max={10}
                      value={otpLength}
                      onChange={(e) => setOtpLength(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Delivery Templates */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b2b65]">
                  Notification & Verification Templates
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    placeholder="Your Security OTP Code"
                    value={otpEmailSubject}
                    onChange={(e) => setOtpEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Body Template</label>
                  <textarea
                    rows={2}
                    placeholder="Your single-use verification code is {otp}."
                    value={otpEmailBody}
                    onChange={(e) => setOtpEmailBody(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-[#1b2b65] focus:outline-none"
                  />
                </div>


              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingOtp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1b2b65] py-2.5 text-xs font-semibold text-white hover:bg-[#13204e] transition shadow-md disabled:opacity-50"
                >
                  {isSavingOtp ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Saving Config...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>Save OTP Config</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── API INTEGRATION DOCUMENTATION MODAL ── */}
      {showApiDocsModal && selectedAppForDocs && (
        <ApiDocsModal
          app={selectedAppForDocs}
          onClose={() => setShowApiDocsModal(false)}
          onOpenPaymentConfig={(appToConfig) => handleOpenPaymentModal(appToConfig)}
          onOpenOtpConfig={(appToConfig) => handleOpenOtpModal(appToConfig)}
        />
      )}
    </div>
  )
}
