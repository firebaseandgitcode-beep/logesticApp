import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../lib/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'logestic_staff_token'
const USER_KEY = 'logestic_staff_user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from AsyncStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY)
        const userJson = await AsyncStorage.getItem(USER_KEY)
        if (token && userJson) {
          const user = JSON.parse(userJson)
          setCurrentUser(user)
        }
      } catch (e) {
        // If restore fails, treat as logged out
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (username, password) => {
    try {
      const result = await api.staffLogin({ username, password })
      const { token, user } = result
      await AsyncStorage.setItem(TOKEN_KEY, token)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
      setCurrentUser(user)
      return { success: true }
    } catch (e) {
      return { error: e.message || 'Invalid username or password' }
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY)
      await AsyncStorage.removeItem(USER_KEY)
    } catch (e) {
      // ignore
    }
    setCurrentUser(null)
  }

  const updateAvatar = (avatar) => {
    if (!currentUser) return
    const updated = { ...currentUser, avatar }
    setCurrentUser(updated)
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
