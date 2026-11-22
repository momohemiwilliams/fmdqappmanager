import apiClient, { basicAuthHeader } from './client'

// ── Roles (Admin › Roles Mgt) ────────────────────────────────────────────
// Canonical roles resource for an app — list, create, and fetch a single role.
// (Bearer-authenticated, same as the rest of the admin session.)

export const fetchAppRoles = async (appId) => {
  const { data } = await apiClient.get(`/apps/${appId}/roles`)
  return data
}

export const createRole = async (appId, name) => {
  const { data } = await apiClient.post(`/apps/${appId}/roles`, { name })
  return data
}

export const fetchRole = async (roleId) => {
  const { data } = await apiClient.get(`/roles/${roleId}`)
  return data
}

// ── Groups ─────────────────────────────────────────────────────────────
// Service-level Basic Auth, matching the Postman collection.

export const fetchGroups = async (appId) => {
  const { data } = await apiClient.get(`/apps/${appId}/groups`, { headers: basicAuthHeader() })
  return data
}

export const createGroup = async (appId, payload) => {
  const { data } = await apiClient.post(`/apps/${appId}/groups`, payload, { headers: basicAuthHeader() })
  return data
}

export const fetchGroup = async (appId, groupId) => {
  const { data } = await apiClient.get(`/apps/${appId}/groups/${groupId}`, { headers: basicAuthHeader() })
  return data
}

export const updateGroup = async (appId, groupId, payload) => {
  const { data } = await apiClient.put(`/apps/${appId}/groups/${groupId}`, payload, { headers: basicAuthHeader() })
  return data
}

export const deleteGroup = async (appId, groupId) => {
  const { data } = await apiClient.delete(`/apps/${appId}/groups/${groupId}`, { headers: basicAuthHeader() })
  return data
}

// ── Subsidiaries ───────────────────────────────────────────────────────

export const fetchSubsidiaries = async (appId) => {
  const { data } = await apiClient.get(`/apps/${appId}/subsidiaries`, { headers: basicAuthHeader() })
  return data
}

export const createSubsidiary = async (appId, payload) => {
  const { data } = await apiClient.post(`/apps/${appId}/subsidiaries`, payload, { headers: basicAuthHeader() })
  return data
}

export const fetchSubsidiary = async (appId, subsidiaryId) => {
  const { data } = await apiClient.get(`/apps/${appId}/subsidiaries/${subsidiaryId}`, { headers: basicAuthHeader() })
  return data
}

export const updateSubsidiary = async (appId, subsidiaryId, payload) => {
  const { data } = await apiClient.put(`/apps/${appId}/subsidiaries/${subsidiaryId}`, payload, {
    headers: basicAuthHeader(),
  })
  return data
}

export const deleteSubsidiary = async (appId, subsidiaryId) => {
  const { data } = await apiClient.delete(`/apps/${appId}/subsidiaries/${subsidiaryId}`, {
    headers: basicAuthHeader(),
  })
  return data
}
