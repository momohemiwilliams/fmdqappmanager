import apiClient, { basicAuthHeader } from './client'

export const login = async ({ email, password }) => {
  const { data } = await apiClient.post('/admin/login', { email, password }, { headers: basicAuthHeader() })
  return data
}

export const register = async ({ firstname, lastname, email, password, password_confirmation }) => {
  const { data } = await apiClient.post(
    '/admin/register',
    { firstname, lastname, email, password, password_confirmation },
    { headers: basicAuthHeader() },
  )
  return data
}

export const fetchAdminUsers = async (page = 1, perPage = 10) => {
  const { data } = await apiClient.get('/admin/users', { params: { page, per_page: perPage } })
  return data
}
