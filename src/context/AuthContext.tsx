// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config & API
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'
import { disconnectGlobalSocket } from 'src/hooks/useSocket'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(authConfig.storageTokenKeyName)
  window.localStorage.removeItem(authConfig.storageUserKeyName)
  window.localStorage.removeItem('userData')
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('user')
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        try {
          const response = await api.get(authConfig.meEndpoint)
          const data = response.data
          const userData: UserDataType = {
            ...data.user,
            fullName: data.user?.name,
            tenant: data.tenant || null,
            permissions: data.permissions || []
          }
          window.localStorage.setItem(authConfig.storageUserKeyName, JSON.stringify(userData))
          window.localStorage.setItem('userData', JSON.stringify(userData))
          setUser(userData)
          setLoading(false)
        } catch {
          disconnectGlobalSocket()
          clearAuthStorage()
          setUser(null)
          setLoading(false)
          if (!router.pathname.includes('login')) {
            router.replace('/login')
          }
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    api
      .post(authConfig.loginEndpoint, { email: params.email, password: params.password })
      .then(async response => {
        const result = response.data
        const userData: UserDataType = {
          ...result.user,
          fullName: result.user?.name,
          tenant: result.tenant || null,
          permissions: result.permissions || []
        }

        window.localStorage.setItem(authConfig.storageTokenKeyName, result.accessToken)
        window.localStorage.setItem(authConfig.storageUserKeyName, JSON.stringify(userData))
        window.localStorage.setItem('userData', JSON.stringify(userData))

        setUser(userData)

        const returnUrl = router.query.returnUrl
        const defaultHome = getHomeRoute(userData.role)
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : defaultHome

        router.replace(redirectURL as string)
      })
      .catch(err => {
        if (errorCallback) {
          const message = err?.response?.data?.message || err?.message || 'Credenciales inválidas'
          errorCallback({ message: Array.isArray(message) ? message.join(', ') : message })
        }
      })
  }

  const handleLogout = () => {
    disconnectGlobalSocket()
    setUser(null)
    clearAuthStorage()
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
