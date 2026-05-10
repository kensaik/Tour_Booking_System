import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'

vi.mock('@/services/auth.service', () => ({
  AuthService: {
    register: vi.fn(),
  },
}))

import { AuthService } from '@/services/auth.service'
import RegisterPage from './RegisterPage'

const fillRequiredFields = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    fullName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
  }> = {},
) => {
  await user.type(screen.getByLabelText(/họ và tên/i), overrides.fullName ?? 'Nguyễn A')
  await user.type(screen.getByLabelText(/^email$/i), overrides.email ?? 'newuser@example.com')
  await user.type(screen.getByLabelText(/số điện thoại/i), overrides.phone ?? '0912345678')
  await user.type(screen.getByLabelText(/^mật khẩu$/i), overrides.password ?? 'StrongPass1')
  await user.type(
    screen.getByLabelText(/xác nhận mật khẩu/i),
    overrides.confirmPassword ?? 'StrongPass1',
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required form fields and submit button', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByLabelText(/họ và tên/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/số điện thoại/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^mật khẩu$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/xác nhận mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^đăng ký$/i })).toBeInTheDocument()
  })

  it('shows mismatch error when password and confirmPassword differ', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await fillRequiredFields(user, { confirmPassword: 'Different1' })
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^đăng ký$/i }))
    expect(await screen.findByText(/mật khẩu xác nhận không khớp/i)).toBeInTheDocument()
    expect(AuthService.register).not.toHaveBeenCalled()
  })

  it('blocks submission when terms not accepted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await fillRequiredFields(user)
    // skip acceptTerms checkbox
    await user.click(screen.getByRole('button', { name: /^đăng ký$/i }))
    expect(await screen.findByText(/chấp nhận điều khoản/i)).toBeInTheDocument()
    expect(AuthService.register).not.toHaveBeenCalled()
  })

  it('renders password requirements list with live updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    expect(screen.getByText(/ít nhất 8 ký tự/i)).toBeInTheDocument()
    expect(screen.getByText(/ít nhất 1 chữ hoa/i)).toBeInTheDocument()
    expect(screen.getByText(/ít nhất 1 số/i)).toBeInTheDocument()
    expect(screen.getByText(/mật khẩu khớp/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^mật khẩu$/i), 'Abc12345')
    // requirement labels remain in DOM regardless of met state
    expect(screen.getByText(/ít nhất 8 ký tự/i)).toBeInTheDocument()
  })

  it('submits payload with role=guest when valid', async () => {
    vi.mocked(AuthService.register).mockResolvedValue({ ok: true })
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^đăng ký$/i }))

    expect(AuthService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'newuser@example.com',
        password: 'StrongPass1',
        full_name: 'Nguyễn A',
        phone_number: '0912345678',
        role: 'guest',
      }),
    )
  })

  it('renders backend error message when register fails', async () => {
    vi.mocked(AuthService.register).mockRejectedValue({
      response: { data: { message: 'Email đã tồn tại' } },
    })
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await fillRequiredFields(user)
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^đăng ký$/i }))
    expect(await screen.findByText(/email đã tồn tại/i)).toBeInTheDocument()
  })
})
