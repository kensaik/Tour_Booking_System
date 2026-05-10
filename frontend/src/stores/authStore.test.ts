import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'

vi.mock('../services/auth.service', () => ({
  AuthService: {
    getMe: vi.fn(),
  },
}))

import { AuthService } from '../services/auth.service'

const resetStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
}

const sampleUser = {
  id: 1,
  email: 'a@gmail.com',
  full_name: 'Guest User',
  role: 'guest',
  is_active: true,
}

describe('authStore', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('login sets token, user, isAuthenticated and writes localStorage', () => {
    useAuthStore.getState().login('tok-123', sampleUser)
    const state = useAuthStore.getState()
    expect(state.token).toBe('tok-123')
    expect(state.user).toEqual(sampleUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.error).toBeNull()
    expect(localStorage.getItem('access_token')).toBe('tok-123')
  })

  it('logout clears state and removes token from localStorage', () => {
    useAuthStore.getState().login('tok-abc', sampleUser)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('fetchUser populates user when getMe succeeds', async () => {
    useAuthStore.setState({ token: 'tok-xyz' })
    vi.mocked(AuthService.getMe).mockResolvedValue({ user: sampleUser })

    await useAuthStore.getState().fetchUser()

    const state = useAuthStore.getState()
    expect(state.user).toEqual(sampleUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('fetchUser clears token and flags error when getMe fails', async () => {
    useAuthStore.setState({ token: 'bad-tok' })
    localStorage.setItem('access_token', 'bad-tok')
    vi.mocked(AuthService.getMe).mockRejectedValue({
      response: { data: { message: 'Invalid token' } },
    })

    await useAuthStore.getState().fetchUser()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Invalid token')
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('fetchUser is a no-op when token is missing', async () => {
    await useAuthStore.getState().fetchUser()
    expect(AuthService.getMe).not.toHaveBeenCalled()
  })

  it('persist partialize keeps only token', () => {
    const persistOptions: any = (useAuthStore as any).persist?.getOptions?.()
    expect(persistOptions).toBeDefined()
    const partial = persistOptions.partialize({
      user: sampleUser,
      token: 'tok-only',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
    expect(partial).toEqual({ token: 'tok-only' })
    expect(persistOptions.name).toBe('auth-storage')
  })
})
