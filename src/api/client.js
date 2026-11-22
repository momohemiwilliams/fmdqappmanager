import axios from 'axios'

const TOKEN_STORAGE_KEY = 'iauth_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_STORAGE_KEY),
  set: (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_STORAGE_KEY),
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const basicAuthHeader = () => {
  const username = import.meta.env.VITE_BASIC_AUTH_USERNAME
  const password = import.meta.env.VITE_BASIC_AUTH_PASSWORD
  const encoded = btoa(`${username}:${password}`)
  return { Authorization: `Basic ${encoded}` }
}

export const extractErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data
  if (!data) return error?.message || fallback

  if (data.errors && typeof data.errors === 'object') {
    const firstField = Object.values(data.errors)[0]
    if (Array.isArray(firstField) && firstField.length) return firstField[0]
    if (typeof firstField === 'string') return firstField
  }

  return data.message || fallback
}

export default apiClient
