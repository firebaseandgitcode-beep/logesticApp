import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { tripStatus } from '../data/store'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { currentUser } = useAuth()
  const [trips, setTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
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

  // Re-fetch whenever the logged-in user changes
  useEffect(() => {
    if (!currentUser) {
      setTrips([])
      setDrivers([])
      setVehicles([])
      return
    }
    loadData()
  }, [currentUser?.id, loadData])

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
      loadData()
      throw e
    }
  }

  const addTrip = async (tripData) => {
    const result = await api.createTrip(tripData)
    const newTrip = result.trip
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
