import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('ehg_token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data.user)
      } catch {
        localStorage.removeItem('ehg_token')
        localStorage.removeItem('ehg_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    const { token, user: loggedInUser } = response.data

    localStorage.setItem('ehg_token', token)
    localStorage.setItem('ehg_user', JSON.stringify(loggedInUser))

    setUser(loggedInUser)

    return loggedInUser
  }

  const logout = () => {
    localStorage.removeItem('ehg_token')
    localStorage.removeItem('ehg_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}