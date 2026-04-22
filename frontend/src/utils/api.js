import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // send HttpOnly cookies
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const authPaths = ['/login', '/register', '/verify-otp', '/set-password', '/forgot-password']
    const isAuthPage = authPaths.some(p => window.location.pathname.startsWith(p))
    if (error.response?.status === 401 && !isAuthPage) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
