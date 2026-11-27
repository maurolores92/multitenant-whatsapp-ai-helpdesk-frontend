import axios from 'axios'
import authConfig from 'src/configs/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
})

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token =
      window.localStorage.getItem(authConfig.storageTokenKeyName) || window.localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export default api
