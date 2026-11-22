import apiClient, { basicAuthHeader } from './client'

// GET /api/apps/{appId}/audit-logs
//
// Supported query params (per backend spec):
//   id                                          — exact match
//   email, action, description, ip_address,
//   details                                     — per-field partial (LIKE) match
//   search                                       — one keyword across all of the above fields
//   date_from / date_to                          — inclusive range on created_at
//   sort_by / sort_dir                           — whitelisted column + asc|desc (default created_at desc)
//   per_page                                     — 1–100, default 15
export const fetchAuditLogs = async (appId, filters = {}, page = 1) => {
  const params = { page }
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params[key] = value
  })
  const { data } = await apiClient.get(`/apps/${appId}/audit-logs`, { params, headers: basicAuthHeader() })
  return data
}

// POST /api/apps/audit-logs — used by client applications to record an event.
// Exposed here for completeness; the admin panel treats audit logs as read-only.
export const createAuditLog = async (payload) => {
  const { data } = await apiClient.post('/apps/audit-logs', payload, { headers: basicAuthHeader() })
  return data
}
