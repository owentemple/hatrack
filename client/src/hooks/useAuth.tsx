import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try localStorage first, fall back to cookies (more resilient on mobile Safari)
    let savedToken = localStorage.getItem('token')
    let savedUser = localStorage.getItem('user')

    if (!savedToken || !savedUser) {
      const cookieToken = getCookie('token')
      const cookieUser = getCookie('user')
      if (cookieToken && cookieUser) {
        savedToken = cookieToken
        savedUser = cookieUser
        // Re-populate localStorage from cookie
        localStorage.setItem('token', cookieToken)
        localStorage.setItem('user', cookieUser)
      }
    }

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function setAuth(newToken: string, newUser: User) {
    const userJson = JSON.stringify(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', userJson)
    setCookie('token', newToken, 30)
    setCookie('user', userJson, 30)
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    deleteCookie('token')
    deleteCookie('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
