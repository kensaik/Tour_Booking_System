import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService } from '../services/auth.service'

interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  company_profile?: any
  guest_profile?: any
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  
  login: (token: string, user: User) => void
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (token, user) => {
        localStorage.setItem('access_token', token)
        set({ user, token, isAuthenticated: true, error: null })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        const { token } = get()
        if (!token) return

        set({ isLoading: true, error: null })
        try {
          const data = await AuthService.getMe()
          set({ user: data.user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {

          localStorage.removeItem('access_token')
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error.response?.data?.message || 'Failed to fetch user'
          })
        }
      }
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ token: state.token }), 
    }
  )
)
