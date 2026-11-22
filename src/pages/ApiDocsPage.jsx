import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ChevronDown,
  Code,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Terminal,
  User,
  ArrowLeft,
  AppWindow,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import FmdqLogo from '../components/FmdqLogo'
import { fetchApps } from '../api/appsService'
import { fetchAppDetails } from '../api/otpConfiServices'
import { fetchAppPaymentConfig } from '../api/paymentService'
import { useAuth } from '../context/AuthContext'

export default function ApiDocsPage() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { logout, user } = useAuth()

  const [appsList, setAppsList] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [loading, setLoading] = useState(true)

  const [copiedField, setCopiedField] = useState(null)
  const [activeTab, setActiveTab] = useState('payment')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Load apps list and target application details
  useEffect(() => {
    const initPage = async () => {
      setLoading(true)
      try {
        const response = await fetchApps()
        const rawList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : []

        const mapped = rawList.map((item, index) => ({
          id: String(item.id || item._id || index + 1),
          appID: String(item.appID || item.app_id || item.appId || item.id || `APP_${item.id || index + 1}`),
          name: item.app_name || item.name || item.title || `App #${index + 1}`,
          url: item.app_url || item.url || item.link,
          description: item.app_description || item.description || '-',
          username: item.username,
          status: item.status || 'Active',
          type: item.type || 'numeric',
          otp_length: item.otp_length || 6,
          payment_configured: Boolean(item.payment_callback_url || (item.gateways && item.gateways.length > 0)),
          otp_configured: Boolean(item.username || item.otp_length),
        }))

        setAppsList(mapped)

        // Find selected app by param or fallback to first
        let current = null
        if (appId) {
          current = mapped.find(
            (a) => String(a.id) === String(appId) || String(a.appID) === String(appId)
          )
        }

        if (!current && mapped.length > 0) {
          current = mapped[0]
        }

        if (current) {
          // Attempt to fetch both OTP & Payment backend configs for accurate detection
          try {
            const [otpResult, payResult] = await Promise.allSettled([
              fetchAppDetails(current.id),
              fetchAppPaymentConfig(current.id),
            ])

            let isPayConfigured = Boolean(current.payment_configured)
            let isOtpConfigured = Boolean(current.otp_configured)

            if (otpResult.status === 'fulfilled' && otpResult.value) {
              const d = otpResult.value.data || otpResult.value
              if (d && (d.username || d.otp_length || d.appID)) {
                current.username = d.username || current.username
                current.type = d.type || current.type
                current.otp_length = d.otp_length || current.otp_length
                isOtpConfigured = true
              }
            }

            if (payResult.status === 'fulfilled' && payResult.value) {
              const p = payResult.value.data || payResult.value
              if (p) {
                const appConfigs = p.app_configs || {}
                const hasActiveGw = Object.values(appConfigs).some(
                  (cfg) => cfg.is_active === true || cfg.is_active === 1 || cfg.is_active === '1' || cfg.is_active === 'true'
                )
                if (p.payment_callback_url || hasActiveGw || (Array.isArray(p.gateways) && p.gateways.length > 0)) {
                  isPayConfigured = true
                }
              }
            }

            current.payment_configured = isPayConfigured
            current.otp_configured = isOtpConfigured
          } catch (e) {
            console.warn('Backend detail fetch skipped:', e)
          }
        }

        setSelectedApp(current)

        // Set initial active tab based strictly on what is configured
        if (current) {
          if (current.payment_configured) {
            setActiveTab('payment')
          } else if (current.otp_configured) {
            setActiveTab('otp')
          } else {
            setActiveTab('payment')
          }
        }
      } catch (err) {
        console.warn('Error loading applications for docs:', err)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [appId])

  const handleSelectApp = (targetAppId) => {
    navigate(`/docs/${targetAppId}`)
  }

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

  const resolvedAppId = selectedApp?.appID || selectedApp?.id || 'APP_100928'
  const resolvedAppName = selectedApp?.name || 'Application'
  const resolvedAppUrl = selectedApp?.url || 'http://localhost/fmrr_test'
  const baseUrl = import.meta.env.VITE_PAY_OTP || 'http://localhost/otp/api'

  const isPaymentConfigured = Boolean(selectedApp?.payment_configured)
  const isOtpConfigured = Boolean(selectedApp?.otp_configured)

  /* ── Code Snippet Generators ── */
  const getPaymentCodeSnippet = (lang) => {
    if (lang === 'javascript') {
      return `// JavaScript / Axios Payment Initiation
import axios from 'axios';

const initiatePayment = async () => {
  try {
    const response = await axios.post('${baseUrl}/payment/initiate', {
      appID: "${resolvedAppId}",
      amount: 5000,
      currency: "NGN",
      email: "customer@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "+2348012345678",
      company: "FMDQ Group",
      callback_url: "${resolvedAppUrl}/payment/callback",
      metadata: {
        subscription_id: "SUB_9902"
      }
    }, {
      headers: {
        'ID': "${resolvedAppId}",
        'Username': "${selectedApp?.username || 'fmrr_app_user'}",
        'Password': "your_app_password",
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      const { checkout_url, reference } = response.data.data;
      console.log('Payment Reference:', reference);
      // Redirect customer to checkout portal
      window.location.href = checkout_url;
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
  }
};`
    }

    if (lang === 'php') {
      return `<?php
// PHP cURL Payment Initiation
$payload = [
    'appID'        => '${resolvedAppId}',
    'amount'       => 5000,
    'currency'     => 'NGN',
    'email'        => 'customer@example.com',
    'first_name'   => 'John',
    'last_name'    => 'Doe',
    'phone'        => '+2348012345678',
    'company'      => 'FMDQ Group',
    'callback_url' => '${resolvedAppUrl}/payment/callback',
    'metadata'     => [
        'subscription_id' => 'SUB_9902'
    ]
];

$ch = curl_init('${baseUrl}/payment/initiate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'ID: ${resolvedAppId}',
    'Username: ${selectedApp?.username || 'fmrr_app_user'}',
    'Password: your_app_password',
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
if ($result['status'] === 'success') {
    $checkoutUrl = $result['data']['checkout_url'];
    header("Location: " . $checkoutUrl);
    exit;
}`
    }

    return `# cURL Payment Initiation Request
curl -X POST "${baseUrl}/payment/initiate" \\
  -H "ID: ${resolvedAppId}" \\
  -H "Username: ${selectedApp?.username || 'fmrr_app_user'}" \\
  -H "Password: your_app_password" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "appID": "${resolvedAppId}",
    "amount": 5000,
    "currency": "NGN",
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+2348012345678",
    "company": "FMDQ Group",
    "callback_url": "${resolvedAppUrl}/payment/callback",
    "metadata": {
      "subscription_id": "SUB_9902"
    }
  }'`
  }

  const getOtpCodeSnippet = (lang) => {
    if (lang === 'javascript') {
      return `// JavaScript / Axios OTP Generator & Validator
import axios from 'axios';

// 1. Generate & Deliver OTP Code
const generateOtp = async (userEmail) => {
  const { data } = await axios.post('${baseUrl}/master/generator', {
    appID: "${resolvedAppId}",
    username: "${selectedApp?.username || 'client_app_user'}",
    email: userEmail
  });
  return data;
};

// 2. Validate User Code
const verifyOtp = async (userOtpCode, reference) => {
  const { data } = await axios.post('${baseUrl}/master/validator', {
    appID: "${resolvedAppId}",
    otp_code: userOtpCode,
    reference: reference
  });
  return data; // { status: "success", message: "OTP verified successfully" }
};`
    }

    if (lang === 'php') {
      return `<?php
// PHP OTP Generation & Verification
$appId = '${resolvedAppId}';
$username = '${selectedApp?.username || 'client_app_user'}';

// 1. Generate OTP
function generateOtp($email) {
    global $appId, $username;
    $ch = curl_init('${baseUrl}/master/generator');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'appID' => $appId,
        'username' => $username,
        'email' => $email
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    return json_decode(curl_exec($ch), true);
}

// 2. Validate OTP
function validateOtp($code, $reference) {
    global $appId;
    $ch = curl_init('${baseUrl}/master/validator');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'appID' => $appId,
        'otp_code' => $code,
        'reference' => $reference
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    return json_decode(curl_exec($ch), true);
}`
    }

    return `# cURL 1. Generate OTP Code
curl -X POST "${baseUrl}/master/generator" \\
  -H "Content-Type: application/json" \\
  -d '{
    "appID": "${resolvedAppId}",
    "username": "${selectedApp?.username || 'client_app_user'}",
    "email": "user@example.com"
  }'

# cURL 2. Validate OTP Code
curl -X POST "${baseUrl}/master/validator" \\
  -H "Content-Type: application/json" \\
  -d '{
    "appID": "${resolvedAppId}",
    "otp_code": "482910",
    "reference": "REF_990182"
  }'`
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">

      {/* Top Header Bar */}
      <header className="bg-[#0f1f3d] border-b border-slate-800 px-4 py-3 lg:px-8 shrink-0">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 flex-wrap">

          {/* Logo & Back button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <ArrowLeft size={14} /> Back to Applications
            </button>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
              <FmdqLogo className="shadow-md" />
            </div>
          </div>

          {/* Center 5-tab Pill Navigation */}
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
                onClick={() => navigate('/payment-gateways')}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-all"
              >
                Gateways
              </button>
            </nav>
          </div>

          {/* Profile Dropdown */}
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

      {/* Main Page Layout Container */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-8 space-y-6">

        {/* Hero Banner with Application Selector */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f1f3d] via-[#1b2b65] to-[#1e1b4b] p-6 lg:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <BookOpen size={14} /> Developer API Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              API Integration Documentation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Step-by-step developer guides, payloads, and code snippets for integrating Payment Gateways & OTP Services.
            </p>
          </div>

          {/* App Switcher Dropdown */}
          <div className="w-full md:w-72 bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 shadow-xl space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Application
            </label>
            <select
              value={selectedApp?.id || ''}
              onChange={(e) => handleSelectApp(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2 px-3 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
            >
              {appsList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.appID})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credentials & Status Card */}
        <div className="rounded-3xl bg-slate-800/80 p-6 border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8 flex-wrap font-mono text-xs">
            <div>
              <span className="font-sans block text-[10px] font-bold uppercase tracking-wider text-slate-400">appID</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 text-sm">
                  {resolvedAppId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(resolvedAppId, 'appID')}
                  className="text-slate-400 hover:text-white transition"
                  title="Copy appID"
                >
                  {copiedField === 'appID' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <span className="font-sans block text-[10px] font-bold uppercase tracking-wider text-slate-400">API Base Endpoint</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                  {baseUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(baseUrl, 'API Base URL')}
                  className="text-slate-400 hover:text-white transition"
                  title="Copy Base URL"
                >
                  {copiedField === 'API Base URL' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <span className="font-sans block text-[10px] font-bold uppercase tracking-wider text-slate-400">App URL</span>
              <a
                href={resolvedAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:underline mt-1 font-sans text-xs"
              >
                <span>{resolvedAppUrl}</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Configured Badges */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${isPaymentConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-700/60 text-slate-400 border-slate-600'
                }`}
            >
              <CreditCard size={14} />
              Payment: {isPaymentConfigured ? 'Active' : 'Unconfigured'}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${isOtpConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-700/60 text-slate-400 border-slate-600'
                }`}
            >
              <ShieldCheck size={14} />
              OTP: {isOtpConfigured ? 'Active' : 'Unconfigured'}
            </span>
          </div>
        </div>

        {/* Documentation Content Card */}
        <div className="rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">

          {/* Documentation Tabs & Code Language Toggle */}
          <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isPaymentConfigured && (
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeTab === 'payment'
                      ? 'bg-[#1b2b65] text-white shadow-md border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  <CreditCard size={16} />
                  <span>Payment Integration</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </button>
              )}

              {isOtpConfigured && (
                <button
                  type="button"
                  onClick={() => setActiveTab('otp')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeTab === 'otp'
                      ? 'bg-[#1b2b65] text-white shadow-md border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  <ShieldCheck size={16} />
                  <span>OTP Integration</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </button>
              )}

              {!isPaymentConfigured && !isOtpConfigured && (
                <span className="text-xs text-amber-400 font-semibold italic">
                  No active service configured yet for this application
                </span>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedLanguage('javascript')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${selectedLanguage === 'javascript'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                JavaScript / Axios
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('php')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${selectedLanguage === 'php'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                PHP cURL
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('curl')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${selectedLanguage === 'curl'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                cURL CLI
              </button>
            </div>
          </div>

          {/* Main Guide Content */}
          <div className="p-6 lg:p-8 space-y-8">

            {/* ═════════ PAYMENT TAB CONTENT ═════════ */}
            {activeTab === 'payment' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-slate-700 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-indigo-400" size={22} />
                    Payment Gateway Switch Integration
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Follow this step-by-step workflow to process payments securely via Paystack & Flutterwave.
                  </p>
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">POST /payment/initiate</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">1. Initiate Payment</h4>
                    <p className="text-xs text-slate-400">
                      Submit transaction details from your application backend to generate a unique checkout URL.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Redirect</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">2. Customer Checkout</h4>
                    <p className="text-xs text-slate-400">
                      Redirect customer to <code className="text-amber-300 font-mono text-xs">checkout_url</code>. The user chooses active payment options.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Callback</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">3. Callback Verification</h4>
                    <p className="text-xs text-slate-400">
                      Customer returns to your callback URL with <code className="text-slate-300 font-mono text-xs">?status=success&reference=PAY-xxx</code>.
                    </p>
                  </div>
                </div>

                {/* API Request Specification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      API Payload Specification
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      POST {baseUrl}/payment/initiate
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-3.5">Parameter</th>
                          <th className="p-3.5">Type</th>
                          <th className="p-3.5">Requirement</th>
                          <th className="p-3.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                        <tr>
                          <td className="p-3.5 font-mono font-bold text-indigo-400">appID</td>
                          <td className="p-3.5 font-mono text-slate-400">string</td>
                          <td className="p-3.5 font-semibold text-emerald-400">Required</td>
                          <td className="p-3.5">Application ID (<code className="font-mono text-amber-300">{resolvedAppId}</code>)</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-mono font-bold text-indigo-400">amount</td>
                          <td className="p-3.5 font-mono text-slate-400">numeric</td>
                          <td className="p-3.5 font-semibold text-emerald-400">Required</td>
                          <td className="p-3.5">Transaction amount</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-mono font-bold text-indigo-400">email</td>
                          <td className="p-3.5 font-mono text-slate-400">string</td>
                          <td className="p-3.5 font-semibold text-emerald-400">Required</td>
                          <td className="p-3.5">Customer email address</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-mono font-bold text-indigo-400">callback_url</td>
                          <td className="p-3.5 font-mono text-slate-400">string (url)</td>
                          <td className="p-3.5 text-slate-400">Optional</td>
                          <td className="p-3.5">Redirect URL after completion (<code className="font-mono text-slate-400">{resolvedAppUrl}/payment/callback</code>)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal size={15} /> Sample Integration Code ({selectedLanguage.toUpperCase()})
                    </h4>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getPaymentCodeSnippet(selectedLanguage), 'Code Snippet')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 transition"
                    >
                      {copiedField === 'Code Snippet' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy Code</span>
                    </button>
                  </div>

                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed shadow-2xl">
                    <code>{getPaymentCodeSnippet(selectedLanguage)}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* ═════════ OTP TAB CONTENT ═════════ */}
            {activeTab === 'otp' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-slate-700 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" size={22} />
                    OTP Generation & Verification Integration
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate single-use verification codes and validate customer inputs.
                  </p>
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">POST /master/generator</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">1. Generate & Deliver OTP</h4>
                    <p className="text-xs text-slate-400">
                      Submit <code className="text-amber-300 font-mono">{resolvedAppId}</code> and recipient email. System sends email code.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">POST /master/validator</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">2. Validate User Code</h4>
                    <p className="text-xs text-slate-400">
                      Submit user's entered OTP code to verify validity. Returns success status payload.
                    </p>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal size={15} /> Sample OTP Integration Code ({selectedLanguage.toUpperCase()})
                    </h4>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getOtpCodeSnippet(selectedLanguage), 'OTP Code Snippet')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 transition"
                    >
                      {copiedField === 'OTP Code Snippet' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy Code</span>
                    </button>
                  </div>

                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed shadow-2xl">
                    <code>{getOtpCodeSnippet(selectedLanguage)}</code>
                  </pre>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  )
}
