import { createContext, useContext, useState } from 'react'
import { initialManagement } from '../data/store'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  const login = (username, password) => {
    const user = initialManagement.find(
      m => m.username === username && m.password === password && m.status === 'active'
    )
    if (!user) return { error: 'Invalid username or password' }
    setCurrentUser(user)
    return { success: true }
  }

  const logout = () => setCurrentUser(null)

  const updateAvatar = (avatar) => {
    if (!currentUser) return
    setCurrentUser(prev => ({ ...prev, avatar }))
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
