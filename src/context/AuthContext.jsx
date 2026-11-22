import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as authService from '../api/authService'
import { tokenStorage } from '../api/client'

const USER_STORAGE_KEY = 'iauth_user'

const AuthContext = createContext(null)

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get())
  const [user, setUser] = useState(readStoredUser)

  const persistSession = useCallback((responseData, fallbackUser) => {
    const nextToken = responseData?.token ?? responseData?.access_token ?? null
    const nextUser = responseData?.admin ?? responseData?.user ?? fallbackUser ?? null

    if (nextToken) {
      tokenStorage.set(nextToken)
      setToken(nextToken)
    }
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
    }
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const response = await authService.login({ email, password })
      persistSession(response.data, { email })
      return response
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload) => {
      const response = await authService.register(payload)
      persistSession(response.data, { email: payload.email, firstname: payload.firstname, lastname: payload.lastname })
      return response
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    localStorage.removeItem(USER_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
