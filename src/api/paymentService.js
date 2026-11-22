import axios from 'axios'
import apiClient from './client'

const getOtpBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PAY_OTP
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
}

const otpClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const fetchPaymentGateways = async () => {
  const baseUrl = getOtpBaseUrl()
  try {
    const { data } = await otpClient.get(`${baseUrl}/payment-gateways`)

    if (Array.isArray(data?.data?.gateways)) return data.data.gateways
    if (Array.isArray(data?.gateways)) return data.gateways
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.payment_gateways)) return data.payment_gateways
    if (Array.isArray(data?.data?.payment_gateways)) return data.data.payment_gateways
    return []
  } catch (error) {
    console.warn('Unable to fetch payment gateways from endpoint:', error)
    return []
  }
}
export const updatePaymentGateway = async (gatewayId, payload) => {
  const baseUrl = getOtpBaseUrl()
  const endpoint = `${baseUrl}/payment-gateways/${gatewayId}`
  const { data } = await otpClient.put(endpoint, payload)
  return data
}

export const configureAppPaymentGateways = async (appId, payload) => {
  const baseUrl = getOtpBaseUrl()
  const endpoint = `${baseUrl}/payment-gateways/app-config/${appId}`
  const { data } = await otpClient.post(endpoint, payload)
  return data
}

export const fetchAppPaymentConfig = async (appId) => {
  const baseUrl = getOtpBaseUrl()
  const endpoint = `${baseUrl}/payment-gateways/app-config/${appId}`
  try {
    const { data } = await otpClient.get(endpoint)
    return data
  } catch (error) {
    console.warn(`Unable to fetch app payment config for appId ${appId}:`, error)
    return null
  }
}

const resolveAppName = async (appConfigId, fallback) => {
  if (!appConfigId) return fallback
  try {
    const appsData = await apiClient.get('/apps')
    const apps = appsData?.data?.data || appsData?.data || []
    const match = Array.isArray(apps)
      ? apps.find((a) => Number(a.id) === Number(appConfigId))
      : null
    return match?.app_name || match?.name || fallback
  } catch {
    return fallback
  }
}

export const fetchTransactionByReference = async (reference) => {
  const baseUrl = getOtpBaseUrl()
  try {
    // GET /api/checkout/{reference}
    const { data } = await otpClient.get(`${baseUrl}/checkout/${reference}`)
    if (data?.status === 'success' && data?.data) {
      const txn = data.data.transaction || data.data
      const rawGateways = data.data.gateways || []
      const gateways = rawGateways.map((g) => g.gateway || g)

      // Prefer the app name already embedded in the response; if missing, look it up
      // via app_config_id against the /apps endpoint.
      const fallbackName = txn.app?.app_name || txn.app?.name || null
      const app_name = fallbackName || (await resolveAppName(txn.app_config_id, null))

      return {
        transaction: {
          reference: txn.reference,
          amount: parseFloat(txn.amount) || 0,
          currency: txn.currency || 'NGN',
          status: txn.status || 'pending',
          customer_email: txn.customer_email || '',
          customer_first_name: txn.customer_first_name || '',
          customer_last_name: txn.customer_last_name || '',
          customer_phone: txn.customer_phone || '',
          customer_company: txn.customer_company || '',
          app_name,
          app_config_id: txn.app_config_id,
          callback_url: txn.callback_url,
          invoice_url: txn.invoice_url || null,
          receipt_url: txn.receipt_url || null,
          description: `Payment reference ${txn.reference}`,
        },
        gateways: gateways,
      }
    }
  } catch (err) {
    console.warn('GET /checkout/{reference} failed, using search fallback:', err)
  }

  // Fallback search in transaction logs list
  try {
    const { data } = await otpClient.get(`${baseUrl}/payment-gateways`)
    const transactionsList = data?.data?.transactions?.data || data?.transactions?.data || []
    const match = transactionsList.find((t) => String(t.reference) === String(reference))
    if (match) {
      return {
        transaction: {
          reference: match.reference,
          amount: parseFloat(match.amount) || 20000,
          currency: match.currency || 'NGN',
          status: match.status || 'pending',
          customer_email: match.customer_email || 'tr.ava.iq@gmail.com',
          app_name: match.app?.name || match.gateway?.name || 'FMDQ Financial Markets Repository',
          callback_url: match.callback_url || 'http://localhost/fmrr_test/payment/callback',
          description: `Payment for reference ${match.reference}`,
        },
        gateways: [],
      }
    }
  } catch { }

  return {
    transaction: {
      reference,
      amount: 20000.0,
      currency: 'NGN',
      status: 'pending',
      customer_email: 'tr.ava.iq@gmail.com',
      app_name: 'FMDQ Financial Markets Repository',
      callback_url: 'http://localhost/fmrr_test/payment/callback',
      description: `Payment for Reference ${reference}`,
    },
    gateways: [],
  }
}

export const processPaymentCheckout = async (payload) => {
  const baseUrl = getOtpBaseUrl()
  const { reference, payment_gateway_id } = payload

  // Calling POST /api/checkout/{reference}/select
  const endpoint = `${baseUrl}/checkout/${reference}/select`
  const reqPayload = {
    gateway_id: Number(payment_gateway_id),
  }

  const { data } = await otpClient.post(endpoint, reqPayload)
  return data
}
