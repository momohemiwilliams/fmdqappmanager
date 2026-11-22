import axios from 'axios'
import apiClient from './client'

const getOtpBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PAY_OTP || 'http://localhost/otp/api'
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
}

const otpClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Fetch all OTP-configured apps from GET /settings/app_config
 * Returns an array of app_config entries with their status, appID, etc.
 *
 * @returns {Promise<Array>}
 */
export const fetchAllOtpConfigs = async () => {
  const baseUrl = getOtpBaseUrl()
  try {
    const { data } = await otpClient.get(`${baseUrl}/settings/app_config`)
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  } catch (error) {
    console.warn('Unable to fetch OTP configs:', error)
    return []
  }
}

/**
 * Fetch detailed application config from http://localhost/otp/api/apps/{id}
 * 
 * @param {string|number} appId 
 * @returns {Promise<Object>}
 */
export const fetchAppDetails = async (appId) => {
  const baseUrl = getOtpBaseUrl()
  try {
    const { data } = await otpClient.get(`${baseUrl}/apps/${appId}`)
    return data
  } catch (error) {
    console.warn(`Unable to fetch app details for ID ${appId}:`, error)
    return null
  }
}

/**
 * Save / Update OTP configuration for an application
 * Sends PUT request to http://localhost/otp/api/apps/{id} for updates,
 * or POST request to http://localhost/otp/api/apps if creating.
 * 
 * @param {Object} payload 
 * @param {string|number} [appId] 
 * @returns {Promise<Object>}
 */
export const saveOtpConfig = async (payload, appId = null) => {
  const baseUrl = getOtpBaseUrl()
  const targetId = appId || payload.id || payload.appID

  if (targetId) {
    try {
      const { data } = await otpClient.put(`${baseUrl}/apps/${targetId}`, payload)
      return data
    } catch (error) {
      console.warn(`PUT ${baseUrl}/apps/${targetId} failed, trying POST fallback:`, error)
      try {
        const { data } = await otpClient.post(`${baseUrl}/apps/${targetId}`, payload)
        return data
      } catch (err2) {
        const { data } = await otpClient.post(`${baseUrl}/apps`, payload)
        return data
      }
    }
  }

  try {
    const { data } = await otpClient.post(`${baseUrl}/apps`, payload)
    return data
  } catch (error) {
    const { data } = await apiClient.post('/apps', payload)
    return data
  }
}