import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  Loader2,
  Mail,
  User,
  Phone,
  Building2,
  Printer,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Zap,
  Download,
  FileText,
} from 'lucide-react'
import FmdqLogo from '../components/FmdqLogo'
import {
  fetchTransactionByReference,
  fetchPaymentGateways,
  processPaymentCheckout,
} from '../api/paymentService'
import { extractErrorMessage } from '../api/client'

/* ── tiny inline animation helpers ── */
const fadeIn = {
  animation: 'fadeIn 0.4s ease both',
}

const styles = `
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse-ring { 0%,100%{ box-shadow:0 0 0 0 rgba(16,185,129,.4); } 50%{ box-shadow:0 0 0 10px rgba(16,185,129,0); } }
@keyframes spin { to{ transform:rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }
.pulse-ring { animation: pulse-ring 2s ease infinite; }
`

function GatewaySlugBadge({ slug }) {
  const map = {
    paystack: { label: 'Paystack', bg: '#00c3b3', text: '#fff' },
    flutterwave: { label: 'Flutterwave', bg: '#f5a623', text: '#fff' },
    interswitch: { label: 'Interswitch', bg: '#e1251b', text: '#fff' },
  }
  const info = map[slug?.toLowerCase()] || { label: slug || 'Gateway', bg: '#6366f1', text: '#fff' }
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: info.bg, color: info.text }}
    >
      {info.label}
    </span>
  )
}

export default function CheckoutPage() {
  const { reference } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState(null)
  const [gateways, setGateways] = useState([])
  const [selectedGatewayId, setSelectedGatewayId] = useState(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [completedTxn, setCompletedTxn] = useState(null)

  /* ── init ── */
  useEffect(() => {
    const initCheckout = async () => {
      setLoading(true)
      try {
        const [refResult, allGateways] = await Promise.all([
          fetchTransactionByReference(reference),
          fetchPaymentGateways(),
        ])

        const txnData = refResult?.transaction
        setTransaction(txnData)
        if (txnData?.customer_email) setCustomerEmail(txnData.customer_email)

        let gwList = refResult?.gateways || []
        if (!Array.isArray(gwList) || gwList.length === 0) {
          gwList = Array.isArray(allGateways) ? allGateways : []
        }

        // Filter to display ONLY active payment gateways
        const activeGateways = gwList.filter((gw) => {
          const gObj = gw.gateway || gw
          const activeVal = gw.is_active !== undefined ? gw.is_active : gObj?.is_active
          return activeVal === true || activeVal === 1 || activeVal === '1' || activeVal === 'true'
        })

        // Fallback to active gateways from global list if app-specific filter resulted in empty list
        let finalGateways = activeGateways
        if (finalGateways.length === 0 && Array.isArray(allGateways)) {
          finalGateways = allGateways.filter((g) => {
            return g.is_active === true || g.is_active === 1 || g.is_active === '1' || g.is_active === 'true'
          })
        }

        setGateways(finalGateways)
        if (finalGateways.length > 0) setSelectedGatewayId(finalGateways[0].id)
      } catch (err) {
        console.warn('Checkout init error:', err)
        toast.error('Failed to load checkout details.')
      } finally {
        setLoading(false)
      }
    }
    if (reference) initCheckout()
  }, [reference])

  /* ── pay ── */
  const handlePayNow = async (e) => {
    e.preventDefault()
    if (!selectedGatewayId) { toast.error('Please select a payment gateway'); return }

    setIsProcessing(true)
    const tid = toast.loading('Connecting to payment provider…')

    try {
      const selectedGw = gateways.find((g) => Number(g.id) === Number(selectedGatewayId))
      const response = await processPaymentCheckout({
        reference,
        payment_gateway_id: Number(selectedGatewayId),
        customer_email: customerEmail.trim(),
      })
      toast.dismiss(tid)

      const checkoutUrl = response?.data?.checkout_url || response?.checkout_url
      if (checkoutUrl) {
        toast.success('Redirecting to payment gateway…')
        setTimeout(() => { window.location.href = checkoutUrl }, 500)
        return
      }

      toast.success('Payment completed!')
      const otpBase = (import.meta.env.VITE_PAY_OTP || 'http://localhost/qpay/api').replace(/\/$/, '')
      setCompletedTxn({
        reference,
        amount: transaction?.amount || 0,
        gateway: selectedGw?.name || 'Payment Gateway',
        gatewaySlug: selectedGw?.slug || '',
        customerEmail: customerEmail.trim(),
        customerName: [transaction?.customer_first_name, transaction?.customer_last_name].filter(Boolean).join(' '),
        customerPhone: transaction?.customer_phone || '',
        customerCompany: transaction?.customer_company || '',
        paidAt: new Date().toLocaleString(),
        callbackUrl: transaction?.callback_url || '',
        invoiceUrl: transaction?.invoice_url || `${otpBase}/payment/invoice/${reference}`,
        receiptUrl: `${otpBase}/payment/receipt/${reference}`,
      })
      setPaymentSuccess(true)
    } catch (err) {
      toast.dismiss(tid)
      toast.error(extractErrorMessage(err, 'Could not initialize payment.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReturnToMerchant = () => {
    const base = transaction?.callback_url || ''
    if (!base) { navigate('/'); return }
    window.location.href = `${base}${base.includes('?') ? '&' : '?'}reference=${reference}&status=success`
  }

  const fmt = (amt) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: transaction?.currency || 'NGN' }).format(amt || 0)

  const customerName = [transaction?.customer_first_name, transaction?.customer_last_name].filter(Boolean).join(' ')

  return (
    <>
      <style>{styles}</style>

      {/* Full-page shell */}
      <div className="min-h-screen flex flex-col bg-[#f4f6fb]" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

        {/* ── Top bar ── */}
        <header
          style={{ background: '#0f1f3d', borderBottom: '1px solid rgba(255,255,255,.08)' }}
          className="w-full px-6 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FmdqLogo />
            <span className="hidden sm:block text-white/30 text-sm">|</span>
            <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Secure Payment Gateway
            </span>
          </div>
          {/* <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">256-Bit SSL</span>
          </div> */}
        </header>

        {/* ── Main area ── */}
        <main className="flex-1 flex items-start justify-center px-4 py-8">

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500" style={fadeIn}>
              <div className="h-11 w-11 rounded-full border-2 border-indigo-600 border-t-transparent spin mb-4" />
              <p className="text-sm font-medium">Loading secure checkout…</p>
              <p className="text-xs font-mono text-slate-400 mt-1">{reference}</p>
            </div>

          ) : paymentSuccess ? (
            /* ── SUCCESS ── */
            <div
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
              style={{ ...fadeIn, boxShadow: '0 24px 60px rgba(0,0,0,.12)' }}
            >
              {/* green header strip */}
              <div className="bg-emerald-500 px-8 py-7 flex flex-col items-center text-center">
                <div className="pulse-ring mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600">
                  <CheckCircle2 size={34} />
                </div>
                <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
                <p className="text-emerald-100 text-xs mt-1">Your transaction has been processed securely.</p>
              </div>

              {/* receipt body */}
              <div className="px-7 py-6 space-y-0 text-sm">
                {[
                  { label: 'Reference', value: completedTxn?.reference, mono: true },
                  { label: 'Amount Paid', value: fmt(completedTxn?.amount), highlight: 'emerald' },
                  { label: 'Gateway', value: completedTxn?.gateway, highlight: 'indigo' },
                  { label: 'Email', value: completedTxn?.customerEmail },
                  completedTxn?.customerName ? { label: 'Name', value: completedTxn.customerName } : null,
                  completedTxn?.customerPhone ? { label: 'Phone', value: completedTxn.customerPhone } : null,
                  completedTxn?.customerCompany ? { label: 'Company', value: completedTxn.customerCompany } : null,
                  { label: 'Date', value: completedTxn?.paidAt },
                ].filter(Boolean).map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <span className="text-slate-500 text-xs font-medium">{row.label}</span>
                    <span
                      className={`text-xs font-semibold ${row.mono ? 'font-mono text-slate-800' :
                        row.highlight === 'emerald' ? 'text-emerald-700 text-sm font-bold' :
                          row.highlight === 'indigo' ? 'text-indigo-700' :
                            'text-slate-800'
                        }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* actions */}
              <div className="px-7 pb-7 space-y-3">
                <div className="flex gap-3">
                  <a
                    href={completedTxn?.receiptUrl || `${(import.meta.env.VITE_PAY_OTP || 'http://localhost/qpay/api').replace(/\/$/, '')}/payment/receipt/${reference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition shadow-xs"
                  >
                    <Download size={14} /> Download Receipt (PDF)
                  </a>
                  <a
                    href={completedTxn?.invoiceUrl || `${(import.meta.env.VITE_PAY_OTP || 'http://localhost/qpay/api').replace(/\/$/, '')}/payment/invoice/${reference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="View Invoice"
                  >
                    <FileText size={14} /> Invoice
                  </a>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    onClick={handleReturnToMerchant}
                    style={{ background: '#0f1f3d' }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Return to App <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>

          ) : (
            /* ── CHECKOUT FORM ── */
            <div
              className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 overflow-hidden rounded-2xl shadow-2xl"
              style={{ ...fadeIn, boxShadow: '0 24px 60px rgba(0,0,0,.14)' }}
            >

              {/* ═══ LEFT PANEL — order summary ═══ */}
              <div
                className="lg:col-span-2 flex flex-col p-7 lg:p-9 text-white"
                style={{ background: '#0f1f3d' }}
              >
                {/* merchant name */}
                <div className="mb-7">
                  {/* <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-1">Merchant</p> */}
                  <h1 className="text-xl font-bold leading-snug">
                    {transaction?.app_name}
                  </h1>
                </div>

                {/* amount hero */}
                <div
                  className="rounded-xl p-5 mb-6"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Due</p>
                  <p className="text-4xl font-extrabold tracking-tight">{fmt(transaction?.amount)}</p>
                  <p className="text-xs text-white/40 mt-1">{transaction?.currency || 'NGN'} · Zero processing fee</p>
                </div>

                {/* line items */}
                <div className="space-y-2.5 text-[13px] mb-6">
                  <RowItem label="Reference">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/10">{reference}</span>
                  </RowItem>
                  <RowItem label="Description">
                    <span className="text-white/70 text-right max-w-[170px] truncate block">
                      {transaction?.description || 'Service Payment'}
                    </span>
                  </RowItem>
                  <RowItem label="Status">
                    <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300">
                      Pending
                    </span>
                  </RowItem>
                </div>

                {/* customer details (if present) */}
                {(customerName || transaction?.customer_email || transaction?.customer_phone || transaction?.customer_company) && (
                  <div
                    className="rounded-xl p-4 space-y-2.5 text-[12px]"
                    style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Customer</p>
                    {customerName && (
                      <IconRow icon={<User size={12} />}>{customerName}</IconRow>
                    )}
                    {transaction?.customer_email && (
                      <IconRow icon={<Mail size={12} />}>{transaction.customer_email}</IconRow>
                    )}
                    {transaction?.customer_phone && (
                      <IconRow icon={<Phone size={12} />}>{transaction.customer_phone}</IconRow>
                    )}
                    {transaction?.customer_company && (
                      <IconRow icon={<Building2 size={12} />}>{transaction.customer_company}</IconRow>
                    )}
                  </div>
                )}

                {/* Proforma Invoice Link */}
                <div className="pt-2">
                  <a
                    href={transaction?.invoice_url || `${(import.meta.env.VITE_PAY_OTP || 'http://localhost/qpay/api').replace(/\/$/, '')}/payment/invoice/${reference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition font-medium underline"
                  >
                    <FileText size={13} /> View Proforma Invoice (PDF)
                  </a>
                </div>

                {/* ssl note */}
                <div className="mt-auto pt-6 flex items-center gap-2 text-[11px] text-white/25">
                  <Lock size={12} />
                  <span>Bank-grade 256-bit encryption. Credentials never stored.</span>
                </div>
              </div>

              {/* ═══ RIGHT PANEL — payment form ═══ */}
              <div className="lg:col-span-3 bg-white flex flex-col p-7 lg:p-9">

                <h2 className="text-[22px] font-bold text-slate-900 mb-1">Complete Payment</h2>
                <p className="text-[13px] text-slate-400 mb-7">Select a gateway to process your transaction securely.</p>

                <form onSubmit={handlePayNow} className="flex flex-col flex-1 gap-6">

                  {/* hidden email input still needed for form validity */}
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    hidden
                  />

                  {/* ── Gateway cards ── */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-3">
                      Payment Gateway
                    </p>
                    {gateways.length === 0 ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center text-xs font-medium text-amber-800">
                        No active payment gateways are currently available for this application. Please contact administrator.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {gateways.map((gw) => {
                          const active = Number(selectedGatewayId) === Number(gw.id)
                          return (
                            <button
                              key={gw.id}
                              type="button"
                              onClick={() => setSelectedGatewayId(gw.id)}
                              style={active ? {
                                borderColor: '#4f46e5',
                                boxShadow: '0 0 0 3px rgba(79,70,229,.12)',
                              } : {}}
                              className={`w-full text-left flex items-center gap-4 rounded-xl border px-4 py-4 transition-all duration-150 ${active
                                ? 'border-indigo-500 bg-indigo-50/60'
                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                }`}
                            >
                              {/* radio dot */}
                              <span
                                className={`flex h-5 w-5 shrink-0 rounded-full border-2 items-center justify-center transition-colors ${active ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                                  }`}
                              >
                                {active && <span className="h-2 w-2 rounded-full bg-white" />}
                              </span>

                              {/* gateway icon placeholder */}
                              <span
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                                style={{ background: active ? '#4f46e5' : '#e2e8f0', color: active ? '#fff' : '#94a3b8' }}
                              >
                                <CreditCard size={16} />
                              </span>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-900">{gw.name || gw.title}</span>
                                  <GatewaySlugBadge slug={gw.slug} />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {gw.description || 'Cards · USSD · Bank Transfer · QR'}
                                </p>
                              </div>

                              <ChevronRight size={16} className={active ? 'text-indigo-500' : 'text-slate-300'} />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Security badges ── */}
                  <div className="flex items-center gap-4 flex-wrap pt-1">
                    {['PCI DSS', 'SSL Secured', 'Bank-Grade'].map((badge) => (
                      <div key={badge} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        {badge}
                      </div>
                    ))}
                  </div>

                  {/* ── CTA ── */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <ArrowLeft size={14} />
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing || !selectedGatewayId}
                      style={{ background: selectedGatewayId && !isProcessing ? '#0f1f3d' : undefined }}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-white transition-all duration-150 ${selectedGatewayId && !isProcessing
                        ? 'hover:opacity-90 active:scale-[.98]'
                        : 'bg-slate-300 cursor-not-allowed'
                        }`}
                    >
                      {isProcessing ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent spin" />
                          Connecting…
                        </>
                      ) : (
                        <>
                          <Zap size={15} />
                          Pay {fmt(transaction?.amount)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="text-center text-[11px] text-slate-400 py-5">
          © 2025 FMDQ Group · Powered by <span className="font-semibold text-slate-500">iAuth Payment Switch</span>
        </footer>
      </div>
    </>
  )
}

/* ── tiny helpers ── */
function RowItem({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/40 shrink-0">{label}</span>
      {children}
    </div>
  )
}

function IconRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-white/70">
      <span className="text-white/30 shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  )
}
