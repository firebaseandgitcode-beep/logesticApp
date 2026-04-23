import { createContext, useContext, useState } from 'react'
import { initialTrips, tripStatus } from '../data/store'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [trips, setTrips] = useState(initialTrips)

  const updateTrip = (id, updates) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, ...updates }
      updated.status = tripStatus(updated)
      return updated
    }))
  }

  const addTrip = (tripData) => {
    const newTrip = {
      ...tripData,
      id: Math.max(...trips.map(t => t.id), 0) + 1,
      status: 'planned',
      verifiedCreate: false,
      verifiedTripDetails: false,
      verifiedFuelDetails: false,
      verifiedManage: false,
      fuelVerified: false,
      fuelEntries: [],
      otherExpenses: [],
      managedExpenses: [],
    }
    setTrips(prev => [...prev, newTrip])
    return newTrip
  }

  return (
    <DataContext.Provider value={{ trips, updateTrip, addTrip }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
