import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Code,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import FmdqLogo from './FmdqLogo'
import { fetchAppDetails } from '../api/otpConfiServices'
import { fetchAppPaymentConfig } from '../api/paymentService'

export default function ApiDocsModal({ app, onClose, onOpenPaymentConfig, onOpenOtpConfig }) {
  const [copiedField, setCopiedField] = useState(null)
  
  const [isPaymentConfigured, setIsPaymentConfigured] = useState(
    Boolean(app?.payment_configured || app?.has_payment || app?.payment_callback_url || (app?.gateways && app?.gateways.length > 0))
  )

  const [isOtpConfigured, setIsOtpConfigured] = useState(
    Boolean(app?.otp_configured || app?.has_otp || app?.username || app?.otp_length)
  )

  const [activeTab, setActiveTab] = useState('payment')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript') // 'javascript' | 'php' | 'curl'

  // Fetch backend details on mount to verify actual configuration status
  React.useEffect(() => {
    const checkConfigs = async () => {
      if (!app?.id) return
      try {
        const [otpRes, payRes] = await Promise.allSettled([
          fetchAppDetails(app.id),
          fetchAppPaymentConfig(app.id),
        ])

        let hasPay = isPaymentConfigured
        let hasOtp = isOtpConfigured

        if (otpRes.status === 'fulfilled' && otpRes.value) {
          const d = otpRes.value.data || otpRes.value
          if (d && (d.username || d.otp_length || d.appID)) {
            hasOtp = true
          }
        }

        if (payRes.status === 'fulfilled' && payRes.value) {
          const p = payRes.value.data || payRes.value
          if (p) {
            const appConfigs = p.app_configs || {}
            const hasActiveGw = Object.values(appConfigs).some(
              (cfg) => cfg.is_active === true || cfg.is_active === 1 || cfg.is_active === '1' || cfg.is_active === 'true'
            )
            if (p.payment_callback_url || hasActiveGw || (Array.isArray(p.gateways) && p.gateways.length > 0)) {
              hasPay = true
            }
          }
        }

        setIsPaymentConfigured(hasPay)
        setIsOtpConfigured(hasOtp)

        if (hasPay) {
          setActiveTab('payment')
        } else if (hasOtp) {
          setActiveTab('otp')
        }
      } catch (e) {
        console.warn('Modal config check failed:', e)
      }
    }

    checkConfigs()
  }, [app])

  const appId = app?.appID || app?.app_id || app?.appId || app?.code || `APP_${app?.id || '100928'}`
  const appName = app?.name || app?.app_name || 'Application'
  const appUrl = app?.url || app?.app_url || 'http://localhost/fmrr_test'
  const baseUrl = import.meta.env.VITE_PAY_OTP || 'http://localhost/otp/api'

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  /* ── Code Snippet Builders ── */
  const getPaymentCodeSnippet = (lang) => {
    if (lang === 'javascript') {
      return `// JavaScript / Axios Payment Initiation
import axios from 'axios';

const initiatePayment = async () => {
  try {
    const response = await axios.post('${baseUrl}/payment/initiate', {
      appID: "${appId}",
      amount: 5000,
      currency: "NGN",
      email: "customer@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "+2348012345678",
      company: "FMDQ Group",
      callback_url: "${appUrl}/payment/callback",
      metadata: {
        subscription_id: "SUB_9902",
        account_id: "ACC_4401"
      }
    }, {
      headers: {
        'ID': "${appId}",
        'Username': "${app?.username || 'fmrr_app_user'}",
        'Password': "your_app_password",
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      const { checkout_url, reference } = response.data.data;
      console.log('Transaction reference:', reference);
      // Redirect user to payment checkout page
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
    'appID'        => '${appId}',
    'amount'       => 5000,
    'currency'     => 'NGN',
    'email'        => 'customer@example.com',
    'first_name'   => 'John',
    'last_name'    => 'Doe',
    'phone'        => '+2348012345678',
    'company'      => 'FMDQ Group',
    'callback_url' => '${appUrl}/payment/callback',
    'metadata'     => [
        'subscription_id' => 'SUB_9902'
    ]
];

$ch = curl_init('${baseUrl}/payment/initiate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'ID: ${appId}',
    'Username: ${app?.username || 'fmrr_app_user'}',
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
  -H "ID: ${appId}" \\
  -H "Username: ${app?.username || 'fmrr_app_user'}" \\
  -H "Password: your_app_password" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "appID": "${appId}",
    "amount": 5000,
    "currency": "NGN",
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+2348012345678",
    "company": "FMDQ Group",
    "callback_url": "${appUrl}/payment/callback"
  }'`
  }

  const getOtpCodeSnippet = (lang) => {
    if (lang === 'javascript') {
      return `// JavaScript / Axios OTP Generator & Validator
import axios from 'axios';

// 1. Generate & Send OTP
const generateOtp = async (userEmail) => {
  const { data } = await axios.post('${baseUrl}/master/generator', {
    appID: "${appId}",
    username: "${app?.username || 'client_app_user'}",
    email: userEmail
  });
  return data;
};

// 2. Verify OTP Code
const verifyOtp = async (otpCode, reference) => {
  const { data } = await axios.post('${baseUrl}/master/validator', {
    appID: "${appId}",
    otp_code: otpCode,
    reference: reference
  });
  return data; // { status: "success", message: "OTP verified successfully" }
};`
    }

    if (lang === 'php') {
      return `<?php
// PHP OTP Generation & Verification
$appId = '${appId}';
$username = '${app?.username || 'client_app_user'}';

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
    "appID": "${appId}",
    "username": "${app?.username || 'client_app_user'}",
    "email": "user@example.com"
  }'

# cURL 2. Validate OTP Code
curl -X POST "${baseUrl}/master/validator" \\
  -H "Content-Type: application/json" \\
  -d '{
    "appID": "${appId}",
    "otp_code": "482910",
    "reference": "REF_990182"
  }'`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0f1f3d] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FmdqLogo />
            <span className="h-5 w-px bg-white/20" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">API Integration Documentation</h3>
                <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-200 border border-indigo-400/30">
                  Developer Guide
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Application: <span className="font-semibold text-white">{appName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Credentials & Status Banner */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 text-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap text-xs font-mono">
            <div>
              <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">App Identifier (appID)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{appId}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(appId, 'appID')}
                  className="text-slate-400 hover:text-white transition"
                  title="Copy appID"
                >
                  {copiedField === 'appID' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">API Base Endpoint</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{baseUrl}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(baseUrl, 'API Base URL')}
                  className="text-slate-400 hover:text-white transition"
                  title="Copy API Base URL"
                >
                  {copiedField === 'API Base URL' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Integration Status Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                isPaymentConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <CreditCard size={12} />
              Payment Gateway: {isPaymentConfigured ? 'Active' : 'Unconfigured'}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                isOtpConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <ShieldCheck size={12} />
              OTP Service: {isOtpConfigured ? 'Active' : 'Unconfigured'}
            </span>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            {isPaymentConfigured && (
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'payment'
                    ? 'bg-[#1b2b65] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <CreditCard size={15} />
                <span>Payment Integration</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </button>
            )}

            {isOtpConfigured && (
              <button
                type="button"
                onClick={() => setActiveTab('otp')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'otp'
                    ? 'bg-[#1b2b65] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck size={15} />
                <span>OTP Integration</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </button>
            )}

            {!isPaymentConfigured && !isOtpConfigured && (
              <span className="text-xs font-semibold text-amber-700 italic">
                No active service configured yet for this application
              </span>
            )}
          </div>

          {/* Language Switcher for Code Samples */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-200 p-1">
            <button
              type="button"
              onClick={() => setSelectedLanguage('javascript')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedLanguage === 'javascript' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JS / Axios
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('php')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedLanguage === 'php' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PHP cURL
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('curl')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedLanguage === 'curl' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cURL CLI
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Notice if features aren't configured yet */}
          {!isPaymentConfigured && !isOtpConfigured && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 flex items-start gap-3">
              <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Neither Payment nor OTP is Configured Yet</h4>
                <p className="text-xs text-amber-700 mt-1">
                  You can view the full integration specifications below. To activate live API endpoints for "{appName}", please configure the Payment Gateway or OTP Service.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenPaymentConfig(app); }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <CreditCard size={14} /> Configure Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenOtpConfig(app); }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <ShieldCheck size={14} /> Configure OTP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ PAYMENT INTEGRATION TAB ═════════ */}
          {activeTab === 'payment' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-indigo-600" size={20} />
                  Payment Gateway Switch Integration
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow these 3 simple steps to redirect customers to active payment gateways (Paystack / Flutterwave) and process transactions.
                </p>
              </div>

              {/* Steps Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Step 1 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">POST /payment/initiate</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Initiate Payment</h5>
                  <p className="text-[11px] text-slate-500">
                    Send transaction amount, customer details, and callback URL from your backend to receive checkout URL.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Redirect User</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Customer Payment</h5>
                  <p className="text-[11px] text-slate-500">
                    Redirect customer to <code className="text-indigo-600 font-mono text-[10px]">checkout_url</code>. The user selects active gateways & completes payment.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Callback / Webhook</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Verification</h5>
                  <p className="text-[11px] text-slate-500">
                    Customer is returned to your callback URL with <code className="text-slate-700 font-mono text-[10px]">?status=success&reference=PAY-xxx</code>.
                  </p>
                </div>
              </div>

              {/* Endpoint Specification Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Endpoint Details</h5>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">POST {baseUrl}/payment/initiate</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Field</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Requirement</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-700">appID</td>
                        <td className="p-3 font-mono text-slate-500">string</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">Must match application identifier (<code className="font-mono text-indigo-900 font-bold">{appId}</code>)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-700">amount</td>
                        <td className="p-3 font-mono text-slate-500">numeric</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">Transaction amount (e.g. 5000.00)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-700">email</td>
                        <td className="p-3 font-mono text-slate-500">string (email)</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">Customer email address for payment receipt</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-700">callback_url</td>
                        <td className="p-3 font-mono text-slate-500">string (url)</td>
                        <td className="p-3 font-semibold text-slate-500">Optional</td>
                        <td className="p-3">Custom redirect URL after payment completion</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-700">metadata</td>
                        <td className="p-3 font-mono text-slate-500">object</td>
                        <td className="p-3 font-semibold text-slate-500">Optional</td>
                        <td className="p-3">Custom key-value pairs (e.g. subscription_id, user_id)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Code Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={14} className="text-slate-600" />
                    2. Ready-to-Use Code Sample ({selectedLanguage.toUpperCase()})
                  </h5>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getPaymentCodeSnippet(selectedLanguage), 'Payment Code Sample')}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    {copiedField === 'Payment Code Sample' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>Copy Code</span>
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed">
                  <code>{getPaymentCodeSnippet(selectedLanguage)}</code>
                </pre>
              </div>
            </div>
          )}

          {/* ═════════ OTP INTEGRATION TAB ═════════ */}
          {activeTab === 'otp' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  OTP Generation & Verification Service
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow these steps to generate, deliver, and validate single-use verification codes for "{appName}".
                </p>
              </div>

              {/* Steps Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">POST /master/generator</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Generate & Send OTP</h5>
                  <p className="text-[11px] text-slate-500">
                    Sends an API request with <code className="text-indigo-900 font-mono text-[10px] font-bold">{appId}</code>. System generates a {app?.otp_length || 6}-digit {app?.type || 'numeric'} code and emails it to the user.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">POST /master/validator</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Validate OTP Code</h5>
                  <p className="text-[11px] text-slate-500">
                    Verify the user-submitted OTP code against the transaction reference. Returns success or error validation payload.
                  </p>
                </div>
              </div>

              {/* Endpoint Specification Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Endpoint Parameters</h5>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">POST {baseUrl}/master/generator & validator</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Field</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Requirement</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">appID</td>
                        <td className="p-3 font-mono text-slate-500">string</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">Application identifier (<code className="font-mono text-emerald-900 font-bold">{appId}</code>)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">username</td>
                        <td className="p-3 font-mono text-slate-500">string</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">App authentication username (<code className="font-mono text-slate-800">{app?.username || 'client_app_user'}</code>)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">email</td>
                        <td className="p-3 font-mono text-slate-500">string (email)</td>
                        <td className="p-3 font-semibold text-emerald-600">Required</td>
                        <td className="p-3">Target recipient email address for OTP delivery</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">otp_code</td>
                        <td className="p-3 font-mono text-slate-500">string</td>
                        <td className="p-3 font-semibold text-indigo-600">Validator Required</td>
                        <td className="p-3">The {app?.otp_length || 6}-character OTP code entered by the user</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Code Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={14} className="text-slate-600" />
                    2. Ready-to-Use Code Sample ({selectedLanguage.toUpperCase()})
                  </h5>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getOtpCodeSnippet(selectedLanguage), 'OTP Code Sample')}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    {copiedField === 'OTP Code Sample' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>Copy Code</span>
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-100 border border-slate-800 leading-relaxed">
                  <code>{getOtpCodeSnippet(selectedLanguage)}</code>
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Need help? Contact system admin at <span className="font-semibold text-slate-700">support@fmdqgroup.com</span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1b2b65] px-6 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#13204e] transition"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  )
}
