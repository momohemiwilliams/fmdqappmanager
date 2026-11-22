import apiClient, { basicAuthHeader } from './client'

// ── Users ──────────────────────────────────────────────────────────────────

export const fetchAppUsers = async (appId, page = 1, perPage = 10) => {
  const { data } = await apiClient.get(`/apps/${appId}/users`, { params: { page, per_page: perPage } })
  return data
}

export const fetchAppUser = async (appId, userId) => {
  const { data } = await apiClient.get(`/apps/${appId}/users/${userId}`)
  return data
}

export const createAppUser = async (appId, payload) => {
  const { data } = await apiClient.post(`/apps/${appId}/users`, { ...payload, app_id: Number(appId) })
  return data
}

export const updateAppUser = async (appId, userId, payload) => {
  const { data } = await apiClient.put(`/apps/${appId}/users/${userId}`, payload)
  return data
}

export const deleteAppUser = async (appId, userId, authoriserEmail, reason) => {
  const { data } = await apiClient.delete(`/apps/${appId}/users/${userId}`, {
    data: { authoriser_email: authoriserEmail, reason },
  })
  return data
}

export const deactivateAppUser = async (appId, userId) => {
  const { data } = await apiClient.post(`/apps/${appId}/users/${userId}/deactivate`)
  return data
}

export const activateAppUser = async (appId, userId) => {
  const { data } = await apiClient.post(`/apps/${appId}/users/${userId}/activate`)
  return data
}

// ── Pending Actions ────────────────────────────────────────────────────────

export const fetchPendingActions = async (appId) => {
  const { data } = await apiClient.get(`/apps/${appId}/pending-actions`)
  return data
}

export const fetchPendingAction = async (appId, actionId) => {
  const { data } = await apiClient.get(`/apps/${appId}/pending-actions/${actionId}`)
  return data
}

export const approvePendingAction = async (appId, actionId) => {
  const { data } = await apiClient.post(`/apps/${appId}/pending-actions/${actionId}/approve`)
  return data
}

export const denyPendingAction = async (appId, actionId, notes) => {
  const { data } = await apiClient.post(`/apps/${appId}/pending-actions/${actionId}/deny`, { notes })
  return data
}

// ── Roles ──────────────────────────────────────────────────────────────────

export const fetchAppRoles = async (appId) => {
  const { data } = await apiClient.get(`/apps/${appId}/roles/user`)
  return data
}

// ── End-user self-service (admin-triggered on a user's behalf) ─────────────

export const triggerForgotPassword = async (appId, email) => {
  const { data } = await apiClient.post(
    '/apps/forgot-password',
    { app_id: Number(appId), email },
    { headers: basicAuthHeader() },
  )
  return data
}

export const resetUserPassword = async (appId, email, password, password_confirmation) => {
  const { data } = await apiClient.post(
    '/apps/reset-password',
    { app_id: Number(appId), email, password, password_confirmation },
    { headers: basicAuthHeader() },
  )
  return data
}
