import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE = 'https://us-central1-mylogestic1.cloudfunctions.net/api'

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem('logestic_staff_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  staffLogin: (body) => request('/auth/staff-login', { method: 'POST', body: JSON.stringify(body) }),

  getTrips:   ()       => request('/trips'),
  createTrip: (body)   => request('/trips', { method: 'POST', body: JSON.stringify(body) }),
  updateTrip: (id, b)  => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(b) }),

  getDrivers:  ()  => request('/drivers'),
  getVehicles: ()  => request('/vehicles'),

  upload: (data, folder) => request('/upload', { method: 'POST', body: JSON.stringify({ data, folder }) }),
}
