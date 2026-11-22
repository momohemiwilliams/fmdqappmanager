import apiClient from './client'

export const fetchApps = async () => {
  const { data } = await apiClient.get('/apps')
  return data
}

export const createApp = async (appData) => {
  const { data } = await apiClient.post('/apps', appData)
  return data
}

export const updateApp = async (appId, appData) => {
  const { data } = await apiClient.put(`/apps/${appId}`, appData)
  return data
}
