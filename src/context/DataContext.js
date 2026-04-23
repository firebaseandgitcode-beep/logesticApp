import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../lib/api'
import { tripStatus } from '../data/store'

const DataContext = createContext(null)

const TOKEN_KEY = 'logestic_staff_token'

export function DataProvider({ children }) {
  const [trips, setTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY)
      if (!token) return
      setLoading(true)
      setError(null)
      const [tripsRes, driversRes, vehiclesRes] = await Promise.all([
        api.getTrips(),
        api.getDrivers(),
        api.getVehicles(),
      ])
      setTrips(tripsRes.trips || [])
      setDrivers(driversRes.drivers || [])
      setVehicles(vehiclesRes.vehicles || [])
    } catch (e) {
      setError(e.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount if token exists
  useEffect(() => {
    loadData()
  }, [loadData])

  const updateTrip = async (id, updates) => {
    // Optimistic update
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, ...updates }
      updated.status = tripStatus(updated)
      return updated
    }))
    try {
      await api.updateTrip(id, updates)
    } catch (e) {
      // Reload to revert optimistic update on failure
      loadData()
      throw e
    }
  }

  const addTrip = async (tripData) => {
    const result = await api.createTrip(tripData)
    const newTrip = result.trip
    // Reload trips to get fresh server state
    await loadData()
    return newTrip
  }

  const refresh = () => loadData()

  return (
    <DataContext.Provider value={{ trips, drivers, vehicles, loading, error, updateTrip, addTrip, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
